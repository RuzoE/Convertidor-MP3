export function openModal({ title, message, onConfirm, confirmText = 'Aceptar', cancelText = 'Cancelar' }) {
  let backdrop = document.querySelector('.modal-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <h3></h3>
        <p></p>
        <div class="modal-actions">
          <button type="button" class="ghost-btn modal-cancel">${cancelText}</button>
          <button type="button" class="primary-btn modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  }

  const titleNode = backdrop.querySelector('h3');
  const messageNode = backdrop.querySelector('p');
  const cancelBtn = backdrop.querySelector('.modal-cancel');
  const confirmBtn = backdrop.querySelector('.modal-confirm');

  titleNode.textContent = title;
  messageNode.textContent = message;

  backdrop.classList.add('is-open');

  const handleClose = () => {
    backdrop.classList.remove('is-open');
    cancelBtn.onclick = null;
    confirmBtn.onclick = null;
  };

  cancelBtn.onclick = () => {
    handleClose();
  };

  confirmBtn.onclick = () => {
    handleClose();
    if (onConfirm) onConfirm();
  };

  return { close: handleClose };
}
