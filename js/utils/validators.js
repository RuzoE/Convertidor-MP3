import { appConfig } from '../config.js';

export function isSupportedWmaFile(file) {
  if (!file || !file.name) return false;

  const name = file.name.toLowerCase();
  const hasSupportedExt = appConfig.supportedExtensions.some((ext) => name.endsWith(ext));
  const mimeType = (file.type || '').toLowerCase();
  const mimeMatches = mimeType.includes('wma') || mimeType.includes('audio');

  return hasSupportedExt || mimeMatches;
}

export function uniqueFileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
