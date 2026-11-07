export function initNavigation() {
  const pathname = window.location.pathname.split('/').pop() || 'convertidor.html';
  const links = document.querySelectorAll('.main-nav a');

  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href === pathname || (pathname === '' && href === 'inicio.html')) {
      link.classList.add('is-active');
    }
  });
}
