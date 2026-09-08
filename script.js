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

const secureLinks = document.querySelectorAll('.secure-link');
const secureOverlay = document.querySelector('#secure-overlay');
const secureStatus = document.querySelector('#secure-status');
const handshakeSteps = [...document.querySelectorAll('#secure-overlay .handshake-steps li')];
let connectionInProgress = false;
let connectionTimers = [];

function resetSecureConnection() {
  connectionTimers.forEach((timer) => window.clearTimeout(timer));
  connectionTimers = [];
  connectionInProgress = false;

  secureOverlay?.classList.remove('active', 'connected');
  secureOverlay?.setAttribute('aria-hidden', 'true');
  if (secureStatus) secureStatus.textContent = 'Starting secure handshake…';

  handshakeSteps.forEach((step) => {
    step.classList.remove('running', 'done');
    const state = step.querySelector('b');
    if (state) state.textContent = 'WAIT';
  });
}

// Browsers can restore this page exactly as it was when Back is pressed.
// Always return the connection animation to its closed state.
window.addEventListener('pageshow', resetSecureConnection);

secureLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (connectionInProgress) return;

    connectionInProgress = true;
    const destination = link.href;
    const stepTime = reducedMotion.matches ? 120 : 520;
    const finishTime = reducedMotion.matches ? 150 : 650;

    secureOverlay.classList.remove('connected');
    secureOverlay.classList.add('active');
    secureOverlay.setAttribute('aria-hidden', 'false');
    secureStatus.textContent = 'Starting secure handshake…';
    handshakeSteps.forEach((step) => {
      step.classList.remove('running', 'done');
      step.querySelector('b').textContent = 'WAIT';
    });

    handshakeSteps.forEach((step, index) => {
      connectionTimers.push(window.setTimeout(() => {
        handshakeSteps[index - 1]?.classList.remove('running');
        if (index > 0) {
          handshakeSteps[index - 1]?.classList.add('done');
          handshakeSteps[index - 1].querySelector('b').textContent = 'OK';
        }
        step.classList.add('running');
        step.querySelector('b').textContent = 'RUN';
        secureStatus.textContent = step.querySelector('span').textContent + '…';
      }, index * stepTime));
    });

    connectionTimers.push(window.setTimeout(() => {
      const finalStep = handshakeSteps.at(-1);
      finalStep.classList.remove('running');
      finalStep.classList.add('done');
      finalStep.querySelector('b').textContent = 'OK';
      secureOverlay.classList.add('connected');
      secureStatus.textContent = 'Secure connection established';

      connectionTimers.push(window.setTimeout(() => {
        resetSecureConnection();
        window.location.assign(destination);
      }, finishTime));
    }, handshakeSteps.length * stepTime));
  });
});

const clubhouseLink = document.querySelector('.clubhouse-link');
const clubhouseOverlay = document.querySelector('#clubhouse-overlay');
const clubhouseStatus = document.querySelector('#clubhouse-status');
const clubhouseSteps = [...document.querySelectorAll('#clubhouse-overlay .clubhouse-steps li')];
let clubhouseInProgress = false;
let clubhouseTimers = [];

function resetClubhouseAccess() {
  clubhouseTimers.forEach((timer) => window.clearTimeout(timer));
  clubhouseTimers = [];
  clubhouseInProgress = false;

  clubhouseOverlay?.classList.remove('active', 'ready');
  clubhouseOverlay?.setAttribute('aria-hidden', 'true');
  if (clubhouseStatus) clubhouseStatus.textContent = 'Requesting project access…';

  clubhouseSteps.forEach((step) => {
    step.classList.remove('running', 'done');
    const state = step.querySelector('b');
    if (state) state.textContent = 'WAIT';
  });
}

window.addEventListener('pageshow', resetClubhouseAccess);

clubhouseLink?.addEventListener('click', (event) => {
  event.preventDefault();
  if (clubhouseInProgress) return;

  clubhouseInProgress = true;
  const destination = clubhouseLink.href;
  const stepTime = reducedMotion.matches ? 120 : 560;
  const finishTime = reducedMotion.matches ? 150 : 720;

  resetClubhouseAccess();
  clubhouseInProgress = true;
  clubhouseOverlay.classList.add('active');
  clubhouseOverlay.setAttribute('aria-hidden', 'false');
  clubhouseStatus.textContent = 'Requesting project access…';

  clubhouseSteps.forEach((step, index) => {
    clubhouseTimers.push(window.setTimeout(() => {
      const previousStep = clubhouseSteps[index - 1];
      if (previousStep) {
        previousStep.classList.remove('running');
        previousStep.classList.add('done');
        previousStep.querySelector('b').textContent = 'OK';
      }

      step.classList.add('running');
      step.querySelector('b').textContent = 'RUN';
      clubhouseStatus.textContent = `${step.querySelector('span').textContent}…`;
    }, index * stepTime));
  });

  clubhouseTimers.push(window.setTimeout(() => {
    const finalStep = clubhouseSteps.at(-1);
    finalStep.classList.remove('running');
    finalStep.classList.add('done');
    finalStep.querySelector('b').textContent = 'OK';
    clubhouseOverlay.classList.add('ready');
    clubhouseStatus.textContent = 'Project access granted · Opening repository';

    clubhouseTimers.push(window.setTimeout(() => {
      resetClubhouseAccess();
      window.location.assign(destination);
    }, finishTime));
  }, clubhouseSteps.length * stepTime));
});
