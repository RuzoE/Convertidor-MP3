export class StorageManager {
  constructor(namespace = 'wma-converter') {
    this.namespace = namespace;
  }

  saveQueue(items) {
    localStorage.setItem(`${this.namespace}:queue`, JSON.stringify(items));
  }

  loadQueue() {
    const raw = localStorage.getItem(`${this.namespace}:queue`);
    return raw ? JSON.parse(raw) : [];
  }

  saveResults(results) {
    localStorage.setItem(`${this.namespace}:results`, JSON.stringify(results));
  }

  loadResults() {
    const raw = localStorage.getItem(`${this.namespace}:results`);
    return raw ? JSON.parse(raw) : [];
  }
}
