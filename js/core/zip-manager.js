export class ZipManager {
  async ensureLoaded() {
    if (window.JSZip) {
      return;
    }

    await new Promise((resolve, reject) => {
      const jszipUrl = new URL('../../node_modules/jszip/dist/jszip.min.js', import.meta.url).href;
      const existingScript = document.querySelector(`script[src="${jszipUrl}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', resolve, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('JSZip no está disponible.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = jszipUrl;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('JSZip no está disponible.'));
      document.head.appendChild(script);
    });
  }

  async createZip(entries = []) {
    await this.ensureLoaded();

    if (!window.JSZip) {
      throw new Error('JSZip no está disponible.');
    }

    const zip = new window.JSZip();
    entries.forEach((entry) => {
      if (entry && entry.file && entry.name) {
        zip.file(entry.name, entry.file);
      }
    });

    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  }
}
