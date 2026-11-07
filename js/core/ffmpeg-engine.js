import { appConfig } from '../config.js';

export class FFmpegEngine {
  constructor() {
    this.ffmpeg = null;
    this.ready = false;
    this.loading = false;
    this.statusEl = null;
    this.lastProgress = 0;
  }

  setStatusElement(element) {
    this.statusEl = element;
  }

  updateStatus(label) {
    if (this.statusEl) {
      this.statusEl.textContent = label;
    }
  }

  async resolveRuntimeUrl(url, fallbackUrl) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      // No local runtime available; fall back to CDN.
    }

    return fallbackUrl || null;
  }

  async load() {
    if (this.ready && this.ffmpeg) return this.ffmpeg;
    if (this.loading) {
      while (this.loading) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      return this.ffmpeg;
    }

    this.loading = true;
    this.updateStatus('Cargando motor FFmpeg…');

    try {
      const localCoreUrl = `${appConfig.ffmpegRuntimeBasePath}/ffmpeg-core.js`;
      const localWasmUrl = `${appConfig.ffmpegRuntimeBasePath}/ffmpeg-core.wasm`;

      const coreURL = await this.resolveRuntimeUrl(localCoreUrl, appConfig.ffmpegCoreUrl);
      const wasmURL = await this.resolveRuntimeUrl(localWasmUrl, appConfig.ffmpegWasmUrl);

      const ffmpegPackageUrl = new URL('../../node_modules/@ffmpeg/ffmpeg/dist/esm/', import.meta.url);
      const utilPackageUrl = new URL('../../node_modules/@ffmpeg/util/dist/esm/index.js', import.meta.url);
      const { FFmpeg } = await import(new URL('index.js', ffmpegPackageUrl));
      const { toBlobURL } = await import(utilPackageUrl);

      this.ffmpeg = new FFmpeg();
      this.ffmpeg.on('log', ({ message }) => {
        if (message.includes('time=')) {
          this.updateStatus('Convirtiendo con FFmpeg…');
        }
      });

      const loadOptions = {
        coreURL: await toBlobURL(coreURL, 'text/javascript'),
        wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
        classWorkerURL: new URL('worker.js', ffmpegPackageUrl).href,
      };

      await this.ffmpeg.load(loadOptions);

      this.ready = true;
      this.updateStatus('Motor FFmpeg listo');
      return this.ffmpeg;
    } finally {
      this.loading = false;
    }
  }

  async convertFile(file, options = {}, onProgress) {
    if (!this.ffmpeg) {
      await this.load();
    }

    const inputName = file.name;
    const outputName = `${inputName.replace(/\.[^.]+$/, '') || 'converted'}.mp3`;
    const bitrate = options.bitrate || 192;
    const sampleRate = options.sampleRate && options.sampleRate !== 'auto' ? options.sampleRate : null;

    const { fetchFile } = await import(new URL('../../node_modules/@ffmpeg/util/dist/esm/index.js', import.meta.url));
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    const command = ['-i', inputName, '-vn', '-c:a', 'libmp3lame', '-b:a', `${bitrate}k`];
    if (sampleRate) {
      command.push('-ar', String(sampleRate));
    }
    command.push(outputName);

    this.lastProgress = 0;
    this.ffmpeg.on('progress', ({ progress }) => {
      this.lastProgress = progress;
      if (typeof onProgress === 'function') {
        onProgress(Math.max(0, Math.min(100, Math.round(progress * 100))));
      }
    });

    await this.ffmpeg.exec(command);

    const data = await this.ffmpeg.readFile(outputName);
    const blob = new Blob([data.buffer || data], { type: 'audio/mpeg' });

    return {
      blob,
      outputName,
      mimeType: blob.type,
      size: blob.size,
    };
  }
}
