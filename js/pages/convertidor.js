import { fileStatuses } from '../config.js';
import { FileManager } from '../core/file-manager.js';
import { QueueManager } from '../core/queue-manager.js';
import { ZipManager } from '../core/zip-manager.js';
import { FFmpegEngine } from '../core/ffmpeg-engine.js';
import { Converter } from '../core/converter.js';
import { showToast } from '../components/notifications.js';
import { formatSize } from '../utils/format-size.js';
import { buildOutputFileName } from '../utils/helpers.js';

export function initConverterPage() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const selectFilesBtn = document.getElementById('select-files-btn');
  const selectFolderBtn = document.getElementById('select-folder-btn');
  const clearQueueBtn = document.getElementById('clear-queue-btn');
  const convertAllBtn = document.getElementById('convert-all-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const qualitySelect = document.getElementById('quality-select');
  const sampleRateSelect = document.getElementById('sample-rate-select');
  const outputNameInput = document.getElementById('output-name');
  const preserveNameCheckbox = document.getElementById('preserve-name');
  const fileList = document.getElementById('file-list');
  const resultList = document.getElementById('result-list');
  const statusEl = document.getElementById('ffmpeg-status');
  const clearResultsBtn = document.getElementById('clear-results-btn');
  const downloadAllBtn = document.getElementById('download-all-btn');
  const overallProgressBar = document.getElementById('overall-progress-bar');
  const overallProgressValue = document.getElementById('overall-progress-value');
  const completedCount = document.getElementById('completed-count');
  const pendingCount = document.getElementById('pending-count');
  const errorCount = document.getElementById('error-count');

  const queueManager = new QueueManager();
  const ffmpegEngine = new FFmpegEngine();
  ffmpegEngine.setStatusElement(statusEl);
  const converter = new Converter(ffmpegEngine);
  const zipManager = new ZipManager();

  const getCurrentSettings = () => ({
    quality: Number(qualitySelect.value),
    sampleRate: sampleRateSelect.value,
    outputName: outputNameInput.value,
    preserveOriginal: preserveNameCheckbox.checked,
  });

  const renderQueue = () => {
    if (!queueManager.items.length) {
      fileList.innerHTML = '<div class="empty-state">Todavía no hay archivos en la cola.</div>';
    } else {
      fileList.innerHTML = queueManager.items
        .map((item) => {
          const statusClass = `status-${item.status || fileStatuses.pending}`;
          const statusLabel = {
            [fileStatuses.pending]: 'Pendiente',
            [fileStatuses.converting]: 'Convirtiendo',
            [fileStatuses.completed]: 'Completado',
            [fileStatuses.error]: 'Error',
          }[item.status || fileStatuses.pending];

          return `
            <div class="file-item" data-id="${item.id}">
              <div class="file-item-main">
                <div class="file-topline">
                  <span class="file-name">${item.name}</span>
                  <span class="file-ext">${item.extension}</span>
                </div>
                <div class="file-meta">
                  <span>${formatSize(item.size)}</span>
                  <span>${item.status === fileStatuses.error ? item.error || 'Sin detalle' : statusLabel}</span>
                </div>
                <div class="progress-rail">
                  <div class="progress-fill" style="width: ${item.progress || 0}%"></div>
                </div>
              </div>
              <div class="file-item-actions">
                <span class="file-status ${statusClass}">${statusLabel}</span>
                <button class="ghost-btn remove-file-btn" type="button" data-id="${item.id}">Eliminar</button>
              </div>
            </div>
          `;
        })
        .join('');
    }

    const pending = queueManager.items.filter((item) => item.status !== fileStatuses.completed && item.status !== fileStatuses.error).length;
    const complete = queueManager.items.filter((item) => item.status === fileStatuses.completed).length;
    const errors = queueManager.items.filter((item) => item.status === fileStatuses.error).length;
    const percentage = queueManager.items.length ? Math.round((queueManager.items.reduce((sum, item) => sum + (item.progress || 0), 0) / (queueManager.items.length * 100)) * 100) : 0;

    pendingCount.textContent = String(pending);
    completedCount.textContent = String(complete);
    errorCount.textContent = String(errors);
    overallProgressValue.textContent = `${percentage}%`;
    overallProgressBar.style.width = `${percentage}%`;

    const removeButtons = fileList.querySelectorAll('.remove-file-btn');
    removeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        queueManager.removeItem(button.dataset.id);
        renderQueue();
        renderResults();
      });
    });
  };

  const renderResults = () => {
    const results = queueManager.items.filter((item) => item.resultUrl);

    if (!results.length) {
      resultList.innerHTML = '<div class="empty-state">No hay resultados aún.</div>';
      return;
    }

    resultList.innerHTML = results
      .map((item) => {
        const downloadFileName = item.outputName || buildOutputFileName(item.name, outputNameInput.value, preserveNameCheckbox.checked);
        return `
          <div class="result-item">
            <div class="result-inline">
              <span class="result-chip">MP3</span>
              <div>
                <div class="file-name">${downloadFileName}</div>
                <div class="file-meta">${formatSize(item.size || 0)}</div>
              </div>
            </div>
            <div class="file-item-actions">
              <a class="secondary-btn" href="${item.resultUrl}" download="${downloadFileName}" target="_blank" rel="noopener">Descargar</a>
            </div>
          </div>
        `;
      })
      .join('');
  };

  const addFiles = async (fileListInput) => {
    const files = FileManager.normalizeFiles(fileListInput);
    if (!files.length) {
      showToast('No se encontraron archivos WMA válidos.', 'error');
      return;
    }

    queueManager.addFiles(files);
    renderQueue();
    renderResults();
    showToast(`${files.length} archivo(s) agregados.`, 'success');
  };

  const processQueue = async () => {
    if (!queueManager.items.length) {
      showToast('Agrega archivos antes de convertir.', 'info');
      return;
    }

    try {
      await ffmpegEngine.load();
      const settings = getCurrentSettings();

      await converter.processQueue(
        queueManager,
        settings,
        (itemId, updates) => {
          const item = queueManager.items.find((entry) => entry.id === itemId);
          if (!item) return;
          Object.assign(item, updates);
          renderQueue();
          renderResults();
        },
        (item, error) => {
          showToast(`Error en ${item.name}: ${error?.message || 'No se pudo convertir.'}`, 'error');
        },
        (item, result) => {
          showToast(`${item.name} convertida correctamente.`, 'success');
          renderResults();
        }
      );
    } catch (error) {
      showToast(error.message || 'No se pudo iniciar la conversión.', 'error');
    }
  };

  selectFilesBtn.addEventListener('click', () => {
    fileInput.multiple = true;
    fileInput.removeAttribute('webkitdirectory');
    fileInput.click();
  });

  selectFolderBtn.addEventListener('click', () => {
    fileInput.multiple = true;
    fileInput.setAttribute('webkitdirectory', 'true');
    fileInput.setAttribute('directory', 'true');
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    await addFiles(files);
    event.target.value = '';
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-active');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-active');
    });
  });

  dropzone.addEventListener('drop', async (event) => {
    const droppedFiles = event.dataTransfer?.files || [];
    if (droppedFiles.length) {
      await addFiles(droppedFiles);
    }
  });

  clearQueueBtn.addEventListener('click', () => {
    queueManager.clear();
    renderQueue();
    renderResults();
  });

  clearResultsBtn.addEventListener('click', () => {
    queueManager.items.forEach((item) => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      item.resultUrl = '';
      item.resultBlob = null;
    });
    renderResults();
  });

  convertAllBtn.addEventListener('click', processQueue);

  pauseBtn.addEventListener('click', () => {
    const paused = converter.pause();
    pauseBtn.textContent = paused ? 'Reanudar' : 'Pausar';
    showToast(paused ? 'Procesamiento pausado.' : 'Procesamiento reanudado.', 'info');
  });

  cancelBtn.addEventListener('click', () => {
    converter.cancel();
    showToast('Conversión cancelada.', 'info');
  });

  downloadAllBtn.addEventListener('click', async () => {
    const results = queueManager.items.filter((item) => item.resultBlob);
    if (!results.length) {
      showToast('No hay archivos convertidos para empaquetar.', 'info');
      return;
    }

    try {
      const blob = await zipManager.createZip(
        results.map((item) => ({
          file: item.resultBlob,
          name: item.outputName || buildOutputFileName(item.name, outputNameInput.value, preserveNameCheckbox.checked),
        }))
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'wma-converted.zip';
      anchor.click();
      URL.revokeObjectURL(url);
      showToast('Archivo ZIP generado correctamente.', 'success');
    } catch (error) {
      showToast(error.message || 'No se pudo crear el ZIP.', 'error');
    }
  });

  renderQueue();
  renderResults();
  ffmpegEngine.load().catch((error) => {
    statusEl.textContent = 'FFmpeg no disponible';
    showToast(error.message || 'No se pudo inicializar FFmpeg.', 'error');
  });
}
