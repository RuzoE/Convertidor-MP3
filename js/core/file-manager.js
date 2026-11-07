import { fileStatuses } from '../config.js';
import { createId } from '../utils/helpers.js';
import { isSupportedWmaFile, uniqueFileKey } from '../utils/validators.js';

export class FileManager {
  static normalizeFiles(fileList = []) {
    const files = Array.from(fileList || []);
    const map = new Map();

    files.forEach((file) => {
      if (!file || !isSupportedWmaFile(file)) return;
      const key = uniqueFileKey(file);
      if (!map.has(key)) {
        map.set(key, {
          id: createId('file'),
          name: file.name,
          size: file.size,
          type: file.type || 'audio/wma',
          lastModified: file.lastModified,
          extension: file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'WMA',
          status: fileStatuses.pending,
          progress: 0,
          file,
          outputName: '',
          resultUrl: '',
          resultBlob: null,
          error: '',
        });
      }
    });

    return Array.from(map.values());
  }
}
