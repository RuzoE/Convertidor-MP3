export function showToast(message, type = 'info') {
  const stack = document.querySelector('.toast-stack') || createToastStack();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function createToastStack() {
  const stack = document.createElement('div');
  stack.className = 'toast-stack';
  document.body.appendChild(stack);
  return stack;
}
