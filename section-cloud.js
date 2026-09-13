(() => {
  'use strict';
  if (document.querySelector('.section-cloud')) return;
  const sections = ['top', 'about', 'skills', 'projects', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;
  const cloud = document.createElement('div');
  cloud.className = 'section-cloud';
  // Decorative section number; existing headings provide accessible navigation.
  cloud.setAttribute('aria-hidden', 'true');
  const number = document.createElement('span');
  number.className = 'section-cloud-number';
  cloud.append(number);
  document.body.append(cloud);
  let hideTimer, frame = 0, previousY = window.scrollY;
  function update() {
    frame = 0;
    let current = 0;
    const threshold = window.innerHeight * .38;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= threshold) current = index;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = sections.length - 1;
    const next = String(current + 1).padStart(2, '0');
    if (number.textContent !== next) {
      number.textContent = next;
      number.classList.remove('is-changing');
      void number.offsetWidth;
      number.classList.add('is-changing');
    }
  }
  function hide() { cloud.classList.remove('is-visible'); }
  window.addEventListener('scroll', () => {
    if (window.scrollY === previousY) return;
    previousY = window.scrollY;
    cloud.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 1600);
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('pagehide', () => { clearTimeout(hideTimer); cancelAnimationFrame(frame); frame = 0; hide(); });
  window.addEventListener('pageshow', () => { previousY = window.scrollY; update(); hide(); });
  update();
})();
