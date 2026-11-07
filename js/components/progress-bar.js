export function syncProgress(element, value) {
  if (!element) return;
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  element.style.width = `${safeValue}%`;
}

export function updateProgressText(elements, value) {
  if (elements.valueEl) {
    elements.valueEl.textContent = `${Math.round(value)}%`;
  }
  syncProgress(elements.barEl, value);
}
