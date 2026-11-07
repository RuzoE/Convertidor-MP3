export function initDropzone(dropzone, options = {}) {
  if (!dropzone) return;

  const { onFilesAdded } = options;

  const handleDrag = (event) => {
    event.preventDefault();
    dropzone.classList.add('is-active');
  };

  const handleLeave = (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-active');
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-active');
    const files = event.dataTransfer?.files || [];
    if (files.length && typeof onFilesAdded === 'function') {
      await onFilesAdded(files);
    }
  };

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, handleDrag);
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, handleLeave);
  });

  dropzone.addEventListener('drop', handleDrop);

  return {
    destroy() {
      ['dragenter', 'dragover'].forEach((eventName) => dropzone.removeEventListener(eventName, handleDrag));
      ['dragleave', 'drop'].forEach((eventName) => dropzone.removeEventListener(eventName, handleLeave));
      dropzone.removeEventListener('drop', handleDrop);
    },
  };
}
