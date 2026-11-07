export const appConfig = {
  supportedExtensions: ['.wma'],
  qualityMap: {
    128: '128k',
    192: '192k',
    256: '256k',
    320: '320k',
  },
  sampleRateMap: {
    auto: null,
    44100: '44100',
    48000: '48000',
  },
  ffmpegRuntimeBasePath: '/vendor/ffmpeg',
  ffmpegCoreUrl: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js',
  ffmpegWasmUrl: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm',
  maxFilesPerBatch: 200,
};

export const fileStatuses = {
  pending: 'pending',
  converting: 'converting',
  completed: 'completed',
  error: 'error',
};
