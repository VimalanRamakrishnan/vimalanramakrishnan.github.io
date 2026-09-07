const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const exploreButton = document.querySelector('#explore-work');
const accessOverlay = document.querySelector('#access-overlay');
const scannerStatus = document.querySelector('#scanner-status');
const projectsSection = document.querySelector('#projects');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scanInProgress = false;

exploreButton?.addEventListener('click', (event) => {
  event.preventDefault();
  if (scanInProgress) return;

  scanInProgress = true;
  accessOverlay.classList.remove('granted');
  accessOverlay.classList.add('active');
  accessOverlay.setAttribute('aria-hidden', 'false');
  scannerStatus.textContent = 'Scanning fingerprint…';

  const scanTime = reducedMotion.matches ? 180 : 1450;
  const grantedTime = reducedMotion.matches ? 180 : 650;

  window.setTimeout(() => {
    accessOverlay.classList.add('granted');
    scannerStatus.textContent = 'Access granted';

    window.setTimeout(() => {
      accessOverlay.classList.remove('active', 'granted');
      accessOverlay.setAttribute('aria-hidden', 'true');
      projectsSection?.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
      scanInProgress = false;
    }, grantedTime);
  }, scanTime);
});
