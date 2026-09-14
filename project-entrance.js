(() => {
  'use strict';
  const button = document.querySelector('#explore-work');
  const projects = document.querySelector('#projects');
  if (!button || !projects) return;
  const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const shield = svg('<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>');
  const monitor = svg('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4m-4-11 3 3 5-5"/>');
  const server = svg('<rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><path d="M6 6.5h.01M6 17.5h.01M10 6.5h7M10 17.5h7"/>');
  const folder = svg('<path d="M3 20h16a2 2 0 0 0 2-1.7L23 9H7l-4 11Zm0 0a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1"/>');
  const overlay = document.createElement('div');
  overlay.className = 'project-entrance';
  overlay.hidden = true;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = `<div class="pe-stage"><div class="pe-symbol pe-security"><div class="pe-emblem">${shield}</div><span>Smart security</span></div><div class="pe-symbol pe-software"><div class="pe-emblem">${monitor}</div><span>Clubhouse</span></div><div class="pe-symbol pe-server"><div class="pe-emblem">${server}</div><span>Windows / DNS</span></div><div class="pe-archive">${folder}</div><div class="pe-wave"></div><div class="pe-label">Bringing the projects together</div></div>`;
  document.body.append(overlay);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, timer;
  function clear() {
    window.clearTimeout(timer);
    overlay.hidden = true;
    overlay.classList.remove('pe-running');
    button.removeAttribute('aria-busy');
    active = false;
  }
  function enter() {
    clear();
    projects.scrollIntoView({behavior:motion.matches ? 'auto' : 'smooth',block:'start'});
    const heading = projects.querySelector('h2');
    if (heading) {
      const previous = heading.getAttribute('tabindex');
      heading.setAttribute('tabindex','-1');
      heading.focus({preventScroll:true});
      heading.addEventListener('blur', () => {
        if (previous === null) heading.removeAttribute('tabindex');
        else heading.setAttribute('tabindex',previous);
      }, {once:true});
    }
  }
  button.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (active) return;
    if (motion.matches) { enter(); return; }
    active = true;
    button.setAttribute('aria-busy','true');
    overlay.hidden = false;
    void overlay.offsetWidth;
    overlay.classList.add('pe-running');
    timer = window.setTimeout(enter,2200);
  });
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { clear(); button.focus({preventScroll:true}); }
    else if (event.key === 'Tab') enter();
  });
  window.addEventListener('pagehide',clear);
})();
