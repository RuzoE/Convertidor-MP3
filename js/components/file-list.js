export function renderFileItems(items = [], options = {}) {
  const { onRemove = () => {} } = options;

  if (!items.length) {
    return '<div class="empty-state">Todavía no hay archivos en la cola.</div>';
  }

  return items
    .map((item) => `
      <div class="file-item" data-id="${item.id}">
        <div class="file-item-main">
          <div class="file-topline">
            <span class="file-name">${item.name}</span>
            <span class="file-ext">${item.extension}</span>
          </div>
          <div class="file-meta">
            <span>${item.size || 0} bytes</span>
            <span>${item.status || 'pending'}</span>
          </div>
          <div class="progress-rail">
            <div class="progress-fill" style="width: ${(item.progress || 0)}%"></div>
          </div>
        </div>
        <div class="file-item-actions">
          <button class="ghost-btn remove-file-btn" type="button" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
    `)
    .join('');
}
