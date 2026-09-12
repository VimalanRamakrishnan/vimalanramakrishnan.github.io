(() => {
  const link = document.getElementById('email-gmail');
  const dialog = document.getElementById('email-flight');
  if (!link || !dialog || typeof dialog.showModal !== 'function') return;
  const cancel = dialog.querySelector('button');
  let timer = null;
  let active = false;
  const reset = (restoreFocus = false) => {
    window.clearTimeout(timer);
    timer = null;
    active = false;
    link.removeAttribute('aria-busy');
    if (dialog.open) dialog.close();
    if (restoreFocus) link.focus({preventScroll:true});
  };
  link.addEventListener('click', event => {
    // Preserve ordinary new-tab and modified-click behaviour.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (active) return;
    active = true;
    link.setAttribute('aria-busy','true');
    dialog.showModal();
    cancel.focus({preventScroll:true});
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 1500;
    timer = window.setTimeout(() => {
      const destination = link.href;
      reset();
      // Same-tab navigation avoids popup blockers; this only opens a compose form.
      window.location.assign(destination);
    }, delay);
  });
  cancel.addEventListener('click', () => reset(true));
  dialog.addEventListener('cancel', event => {event.preventDefault();reset(true);});
  window.addEventListener('pagehide', () => reset());
  window.addEventListener('pageshow', () => reset());
})();
