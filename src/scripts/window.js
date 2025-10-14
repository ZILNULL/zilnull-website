document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-win-btn]');
  if (!btn) return;

  const win = btn.closest('.win');
  if (!win) return;

  const action = btn.getAttribute('data-win-btn');

  if (action === 'close') {
    win.remove();
    return;
  }

  if (action === 'maximize') {
    win.classList.toggle('win--maximized');
    return;
  }
});