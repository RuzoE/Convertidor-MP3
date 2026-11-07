import { fileStatuses } from '../config.js';

export class QueueManager {
  constructor() {
    this.items = [];
    this.results = [];
  }

  addFiles(files = []) {
    const next = files.filter((entry) => !this.items.some((item) => item.file && item.file.name === entry.file.name && item.file.size === entry.file.size && item.file.lastModified === entry.file.lastModified));
    this.items.push(...next);
    return this.items;
  }

  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }

  clear() {
    this.items = [];
    this.results = [];
  }

  setItemState(id, updates = {}) {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) return;
    Object.assign(item, updates);
  }

  getPendingCount() {
    return this.items.filter((item) => item.status !== fileStatuses.completed && item.status !== fileStatuses.error).length;
  }

  getCompletedCount() {
    return this.items.filter((item) => item.status === fileStatuses.completed).length;
  }

  getErrorCount() {
    return this.items.filter((item) => item.status === fileStatuses.error).length;
  }

  getOverallProgress() {
    if (!this.items.length) return 0;
    const total = this.items.reduce((sum, item) => sum + item.progress, 0);
    return Math.round((total / (this.items.length * 100)) * 100);
  }

  getNextPending() {
    return this.items.find((item) => item.status === fileStatuses.pending);
  }
}
