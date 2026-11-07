import { fileStatuses } from '../config.js';
import { buildOutputFileName } from '../utils/helpers.js';

export class Converter {
  constructor(ffmpegEngine) {
    this.ffmpegEngine = ffmpegEngine;
    this.isCancelled = false;
    this.isPaused = false;
    this.currentTaskId = null;
  }

  pause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  cancel() {
    this.isCancelled = true;
    this.isPaused = false;
  }

  reset() {
    this.isCancelled = false;
    this.isPaused = false;
    this.currentTaskId = null;
  }

  async processQueue(queueManager, settings, onItemUpdate, onError, onComplete) {
    this.reset();
    const pendingItems = queueManager.items.filter((item) => item.status !== fileStatuses.completed && item.status !== fileStatuses.error);

    for (const item of pendingItems) {
      if (this.isCancelled) {
        break;
      }

      this.currentTaskId = item.id;
      queueManager.setItemState(item.id, { status: fileStatuses.converting, progress: 0, error: '' });
      onItemUpdate(item.id, { status: fileStatuses.converting, progress: 0, error: '' });

      while (this.isPaused && !this.isCancelled) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (this.isCancelled) {
        break;
      }

      try {
        const outputName = buildOutputFileName(item.name, settings.outputName, settings.preserveOriginal);
        const result = await this.ffmpegEngine.convertFile(item.file, {
          bitrate: Number(settings.quality || 192),
          sampleRate: settings.sampleRate || 'auto',
        }, (progress) => {
          queueManager.setItemState(item.id, { progress });
          onItemUpdate(item.id, { progress, status: fileStatuses.converting });
        });

        queueManager.setItemState(item.id, {
          status: fileStatuses.completed,
          progress: 100,
          resultUrl: URL.createObjectURL(result.blob),
          resultBlob: result.blob,
          outputName,
          error: '',
        });

        onItemUpdate(item.id, {
          status: fileStatuses.completed,
          progress: 100,
          resultUrl: queueManager.items.find((entry) => entry.id === item.id)?.resultUrl || '',
          outputName,
        });

        onComplete?.(item, result);
      } catch (error) {
        queueManager.setItemState(item.id, {
          status: fileStatuses.error,
          progress: 0,
          error: error?.message || 'Error desconocido en la conversión.',
        });
        onError?.(item, error);
      }
    }
  }
}
