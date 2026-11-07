import { initNavigation } from './components/navigation.js';
import { initDropzone } from './components/dropzone.js';
import { initConverterPage } from './pages/convertidor.js';

const page = document.body.dataset.page;

initNavigation();

if (page === 'convertidor') {
  const dropzone = document.getElementById('dropzone');
  if (dropzone) {
    initDropzone(dropzone, {
      onFilesAdded: async (files) => {
        const input = document.getElementById('file-input');
        if (input) {
          const dataTransfer = new DataTransfer();
          Array.from(files).forEach((file) => dataTransfer.items.add(file));
          input.files = dataTransfer.files;
        }
      },
    });
  }
  initConverterPage();
}
