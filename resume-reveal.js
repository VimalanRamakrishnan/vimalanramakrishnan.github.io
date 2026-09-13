(() => {
  'use strict';
  const links = [...document.querySelectorAll('a[href="resume.html"]')];
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'resume-dialog';
  dialog.setAttribute('aria-labelledby', 'resume-dialog-title');
  dialog.innerHTML = `<header class="resume-dialog-header"><h2 id="resume-dialog-title">DOCUMENT PREVIEW</h2><button type="button" class="resume-dialog-close" autofocus aria-label="Close résumé preview">Close ×</button></header><div class="resume-dialog-scroll"><p class="resume-dialog-status" role="status">Loading résumé…</p><div class="resume-dialog-paper" hidden><img src="assets/resume/resume-preview.png" alt="Vimalan Ramakrishnan’s résumé, including education, technical skills, internship experience and projects. Open the PDF below for selectable text."></div></div><footer class="resume-dialog-footer"><a href="assets/resume/Vimalan_Ramakrishnan_Resume.pdf" target="_blank" rel="noopener">Open PDF ↗</a><a href="assets/resume/Vimalan_Ramakrishnan_Resume.pdf" download="Vimalan_Ramakrishnan_Resume.pdf">Download résumé ↓</a></footer>`;
  // Keep the dialog out of the page until the visitor approaches Resume.
  const img = dialog.querySelector('img');
  const paper = dialog.querySelector('.resume-dialog-paper');
  const status = dialog.querySelector('.resume-dialog-status');
  let trigger, generation = 0, attached = false;
  function attach() { if (!attached) { document.body.append(dialog); attached = true; } }
  function ready() {
    if (img.complete) return img.naturalWidth ? Promise.resolve() : Promise.reject();
    return new Promise((resolve, reject) => { img.addEventListener('load', resolve, {once:true}); img.addEventListener('error', reject, {once:true}); });
  }
  async function open(event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (dialog.open) return;
    trigger = event.currentTarget;
    const run = ++generation;
    attach();
    dialog.classList.remove('revealed');
    paper.hidden = true;
    status.hidden = false;
    status.textContent = 'Loading résumé…';
    dialog.showModal();
    document.body.classList.add('resume-preview-open');
    dialog.querySelector('.resume-dialog-scroll').scrollTop = 0;
    try {
      await ready();
      if (img.decode) await img.decode().catch(() => {});
      if (run !== generation || !dialog.open) return;
      status.hidden = true;
      paper.hidden = false;
      void paper.offsetWidth;
      requestAnimationFrame(() => { if (run === generation && dialog.open) dialog.classList.add('revealed'); });
    } catch {
      if (run === generation && dialog.open) status.textContent = 'Preview unavailable. Please open or download the PDF below.';
    }
  }
  links.forEach(link => {
    link.addEventListener('click', open);
    link.addEventListener('pointerenter', attach, {once:true});
    link.addEventListener('focus', attach, {once:true});
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    ++generation;
    dialog.classList.remove('revealed');
    document.body.classList.remove('resume-preview-open');
    trigger?.focus({preventScroll:true});
  });
})();
