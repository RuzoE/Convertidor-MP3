export function sanitizeFileName(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim()
    .slice(0, 80) || 'audio';
}

export function buildOutputFileName(originalName, outputLabel, preserveOriginal) {
  const base = sanitizeFileName(originalName);

  if (preserveOriginal) {
    return `${base}.mp3`;
  }

  const label = (outputLabel || 'converted-audio').trim() || 'converted-audio';
  return `${sanitizeFileName(label)}.mp3`;
}

export function createId(prefix = 'item') {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(16)}`;
}
