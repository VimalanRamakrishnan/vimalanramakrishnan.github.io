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

const archiveViewer = document.querySelector('.archive-viewer');
const archiveFrame = document.querySelector('#archive-frame');
const archiveBackdrop = document.querySelector('#archive-backdrop');
const archiveImage = document.querySelector('#archive-image');
const archiveVideo = document.querySelector('#archive-video');
const archiveTitle = document.querySelector('#archive-title');
const archiveCategory = document.querySelector('#archive-category');
const archiveCounter = document.querySelector('#archive-counter');
const archiveThumbs = [...document.querySelectorAll('.archive-thumb')];
const archiveFilters = [...document.querySelectorAll('.archive-filter')];
let visibleArchiveThumbs = [...archiveThumbs];
let activeArchiveIndex = 0;

function showArchiveImage(index, moveFocus = false) {
  if (!visibleArchiveThumbs.length) return;
  activeArchiveIndex = (index + visibleArchiveThumbs.length) % visibleArchiveThumbs.length;
  const thumb = visibleArchiveThumbs[activeArchiveIndex];

  archiveThumbs.forEach((item) => {
    const selected = item === thumb;
    item.classList.toggle('active', selected);
    if (selected) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });

  archiveFrame.classList.add('changing');
  window.setTimeout(() => {
    const isVideo = thumb.dataset.type === 'video';
    archiveVideo.pause();
    if (isVideo) {
      archiveBackdrop.src = thumb.dataset.poster;
      archiveImage.hidden = true;
      archiveVideo.hidden = false;
      archiveVideo.src = thumb.dataset.src;
      archiveVideo.poster = thumb.dataset.poster;
      archiveVideo.setAttribute('aria-label', thumb.dataset.alt);
      archiveVideo.load();
    } else {
      archiveBackdrop.src = thumb.dataset.src;
      archiveVideo.hidden = true;
      archiveVideo.removeAttribute('src');
      archiveVideo.load();
      archiveImage.hidden = false;
      archiveImage.src = thumb.dataset.src;
      archiveImage.alt = thumb.dataset.alt;
    }
    archiveTitle.textContent = thumb.dataset.title;
    archiveCategory.textContent = thumb.dataset.meta;
    archiveCounter.textContent = `MEDIA ${String(activeArchiveIndex + 1).padStart(2, '0')} / ${String(visibleArchiveThumbs.length).padStart(2, '0')}`;
    archiveFrame.classList.remove('changing', 'scanning');
    void archiveFrame.offsetWidth;
    archiveFrame.classList.add('scanning');
    thumb.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    if (moveFocus) thumb.focus({ preventScroll: true });
  }, 120);
}

archiveThumbs.forEach((thumb) => {
  thumb.setAttribute('aria-label', `View ${thumb.dataset.title}`);
  thumb.addEventListener('click', () => showArchiveImage(visibleArchiveThumbs.indexOf(thumb)));
});

archiveFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    archiveFilters.forEach((item) => {
      const selected = item === filter;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    archiveThumbs.forEach((thumb) => {
      const categories = thumb.dataset.category.split(' ');
      thumb.hidden = category !== 'all' && !categories.includes(category);
    });
    visibleArchiveThumbs = archiveThumbs.filter((thumb) => !thumb.hidden);
    showArchiveImage(0);
  });
});

document.querySelector('#archive-prev')?.addEventListener('click', () => showArchiveImage(activeArchiveIndex - 1));
document.querySelector('#archive-next')?.addEventListener('click', () => showArchiveImage(activeArchiveIndex + 1));

archiveViewer?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showArchiveImage(activeArchiveIndex - 1, true);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    showArchiveImage(activeArchiveIndex + 1, true);
  }
});

// Expandable Clubhouse project gallery
const clubhouseProjectCard = document.querySelector('.clubhouse-project-card');
const clubhouseGalleryToggle = document.querySelector('#clubhouse-gallery-toggle');
const clubhouseGalleryPanel = document.querySelector('#clubhouse-gallery-panel');
const clubhouseGalleryViewer = document.querySelector('.clubhouse-gallery-viewer');
const clubhouseGalleryFrame = document.querySelector('.clubhouse-gallery-frame');
const clubhouseGalleryImage = document.querySelector('#clubhouse-gallery-image');
const clubhouseGalleryCaption = document.querySelector('#clubhouse-gallery-caption');
const clubhouseGalleryCount = document.querySelector('#clubhouse-gallery-count');
const clubhouseGalleryThumbs = [...document.querySelectorAll('.clubhouse-gallery-thumb')];
let clubhouseGalleryIndex = 0;

function showClubhouseGalleryImage(index, focusThumbnail = false) {
  if (!clubhouseGalleryThumbs.length || !clubhouseGalleryImage) return;
  clubhouseGalleryIndex = (index + clubhouseGalleryThumbs.length) % clubhouseGalleryThumbs.length;
  const selectedThumb = clubhouseGalleryThumbs[clubhouseGalleryIndex];

  clubhouseGalleryThumbs.forEach((thumb) => {
    const selected = thumb === selectedThumb;
    thumb.classList.toggle('active', selected);
    if (selected) thumb.setAttribute('aria-current', 'true');
    else thumb.removeAttribute('aria-current');
  });

  clubhouseGalleryFrame?.classList.add('changing');
  window.setTimeout(() => {
    clubhouseGalleryImage.src = selectedThumb.dataset.src;
    clubhouseGalleryImage.alt = selectedThumb.dataset.alt;
    clubhouseGalleryCaption.textContent = selectedThumb.dataset.title;
    clubhouseGalleryCount.textContent = `${String(clubhouseGalleryIndex + 1).padStart(2, '0')} / ${String(clubhouseGalleryThumbs.length).padStart(2, '0')}`;
    clubhouseGalleryFrame?.classList.remove('changing');
    selectedThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    if (focusThumbnail) selectedThumb.focus({ preventScroll: true });
  }, 130);
}

clubhouseGalleryThumbs.forEach((thumb) => {
  thumb.setAttribute('aria-label', `View ${thumb.dataset.title}`);
  thumb.addEventListener('click', () => showClubhouseGalleryImage(clubhouseGalleryThumbs.indexOf(thumb)));
});

clubhouseGalleryToggle?.addEventListener('click', () => {
  const opening = !clubhouseProjectCard.classList.contains('gallery-open');
  clubhouseProjectCard.classList.toggle('gallery-open', opening);
  clubhouseGalleryToggle.setAttribute('aria-expanded', String(opening));
  clubhouseGalleryPanel.setAttribute('aria-hidden', String(!opening));
  const toggleLabel = clubhouseGalleryToggle.querySelector('.clubhouse-toggle-copy b');
  if (toggleLabel) toggleLabel.textContent = opening ? 'HIDE PROJECT IMAGES' : 'VIEW PROJECT IMAGES';

  if (opening) {
    window.setTimeout(() => clubhouseGalleryViewer?.focus({ preventScroll: true }), 500);
  }
});

document.querySelector('#clubhouse-gallery-prev')?.addEventListener('click', () => showClubhouseGalleryImage(clubhouseGalleryIndex - 1));
document.querySelector('#clubhouse-gallery-next')?.addEventListener('click', () => showClubhouseGalleryImage(clubhouseGalleryIndex + 1));

clubhouseGalleryViewer?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showClubhouseGalleryImage(clubhouseGalleryIndex - 1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    showClubhouseGalleryImage(clubhouseGalleryIndex + 1);
  }
});
