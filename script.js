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

// Topic-specific toolkit previews: hover to preview, click to pin on touch devices.
const skillCards = [...document.querySelectorAll('.skill-card')];

function toggleSkillMotion(card) {
  const willActivate = !card.classList.contains('motion-active');
  skillCards.forEach((item) => {
    item.classList.remove('motion-active');
    item.setAttribute('aria-pressed', 'false');
  });
  if (willActivate) {
    card.classList.add('motion-active');
    card.setAttribute('aria-pressed', 'true');
  }
}

skillCards.forEach((card) => {
  card.addEventListener('click', () => toggleSkillMotion(card));
  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleSkillMotion(card);
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

// Interactive smart-door demonstration in the featured fingerprint project.
const smartAccessDemo = document.querySelector('#smart-access-demo');
const fingerprintTrigger = document.querySelector('#fingerprint-trigger');
const smartAccessState = document.querySelector('#smart-access-state');
const smartAccessMessage = document.querySelector('#smart-access-message');
const smartAccessEvent = document.querySelector('#smart-access-event');
let smartAccessTimers = [];
let smartAccessRunning = false;

function resetSmartAccessDemo() {
  smartAccessTimers.forEach((timer) => window.clearTimeout(timer));
  smartAccessTimers = [];
  smartAccessRunning = false;
  document.documentElement.classList.remove('camera-flashing');
  smartAccessDemo?.classList.remove('scanning', 'authorized', 'capturing', 'captured', 'relocking');
  if (smartAccessState) smartAccessState.textContent = 'READY';
  if (smartAccessMessage) smartAccessMessage.textContent = 'Touch the fingerprint sensor';
  if (smartAccessEvent) smartAccessEvent.textContent = 'NO EVENT';
  if (fingerprintTrigger) fingerprintTrigger.disabled = false;
}

fingerprintTrigger?.addEventListener('click', () => {
  if (smartAccessRunning) return;
  resetSmartAccessDemo();
  smartAccessRunning = true;
  fingerprintTrigger.disabled = true;
  smartAccessDemo.classList.add('scanning');
  smartAccessState.textContent = 'SCANNING';
  smartAccessMessage.textContent = 'Matching fingerprint…';
  smartAccessEvent.textContent = 'AUTH / 01';

  const scanStep = reducedMotion.matches ? 120 : 680;
  const captureStep = reducedMotion.matches ? 140 : 1180;
  const loggedStep = reducedMotion.matches ? 180 : 1580;
  const relockStep = reducedMotion.matches ? 260 : 3100;
  const resetStep = reducedMotion.matches ? 420 : 3900;

  smartAccessTimers.push(window.setTimeout(() => {
    smartAccessDemo.classList.remove('scanning');
    smartAccessDemo.classList.add('authorized');
    smartAccessState.textContent = 'GRANTED';
    smartAccessMessage.textContent = 'Identity verified · Door unlocked';
    smartAccessEvent.textContent = 'SERVO / OPEN';
  }, scanStep));

  smartAccessTimers.push(window.setTimeout(() => {
    smartAccessDemo.classList.add('capturing');
    document.documentElement.classList.remove('camera-flashing');
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add('camera-flashing');
    smartAccessState.textContent = 'CAPTURE';
    smartAccessMessage.textContent = 'ESP32-CAM capturing access image…';
    smartAccessEvent.textContent = 'FLASH / ON';
  }, captureStep));

  smartAccessTimers.push(window.setTimeout(() => {
    smartAccessDemo.classList.remove('capturing');
    smartAccessDemo.classList.add('captured');
    document.documentElement.classList.remove('camera-flashing');
    smartAccessState.textContent = 'LOGGED';
    smartAccessMessage.textContent = 'Access image captured and event recorded';
    smartAccessEvent.textContent = 'IMAGE / 001';
  }, loggedStep));

  smartAccessTimers.push(window.setTimeout(() => {
    smartAccessDemo.classList.remove('authorized');
    smartAccessDemo.classList.add('relocking');
    smartAccessState.textContent = 'RELOCKING';
    smartAccessMessage.textContent = 'Door closing automatically…';
    smartAccessEvent.textContent = 'SERVO / CLOSE';
  }, relockStep));

  smartAccessTimers.push(window.setTimeout(resetSmartAccessDemo, resetStep));
});

window.addEventListener('pageshow', resetSmartAccessDemo);

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
const evidenceDisclosure = document.querySelector('#evidence-disclosure');
const evidenceGalleryToggle = document.querySelector('#evidence-gallery-toggle');
const evidenceGalleryPanel = document.querySelector('#evidence-gallery-panel');
let visibleArchiveThumbs = [...archiveThumbs];
let activeArchiveIndex = 0;

function setEvidenceGallery(opening) {
  evidenceDisclosure?.classList.toggle('evidence-open', opening);
  evidenceGalleryToggle?.setAttribute('aria-expanded', String(opening));
  evidenceGalleryPanel?.setAttribute('aria-hidden', String(!opening));
  if (evidenceGalleryPanel) evidenceGalleryPanel.inert = !opening;
  const label = evidenceGalleryToggle?.querySelector('.evidence-toggle-copy b');
  if (label) label.textContent = opening ? 'HIDE PROJECT EVIDENCE' : 'VIEW PROJECT EVIDENCE';
  if (!opening) archiveVideo?.pause();
}

evidenceGalleryToggle?.addEventListener('click', () => {
  setEvidenceGallery(!evidenceDisclosure?.classList.contains('evidence-open'));
});

window.addEventListener('pageshow', () => setEvidenceGallery(false));

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

// Interactive Clubhouse booking demonstration
const facilityButtons = [...document.querySelectorAll('#facility-picker button')];
const bookingDemo = document.querySelector('.clubhouse-booking-demo');
const facilityAnimationStage = document.querySelector('#facility-animation-stage');
const facilityFigure = document.querySelector('#facility-figure');
const facilityProp = document.querySelector('#facility-prop');
const facilityAnimationLabel = document.querySelector('#facility-animation-label');
const bookingOpenPanel = document.querySelector('#booking-open-panel');
const demoFacility = document.querySelector('#demo-facility');
const demoRate = document.querySelector('#demo-rate');
const demoCapacity = document.querySelector('#demo-capacity');
const demoBookButton = document.querySelector('#demo-book-button');
const demoBookButtonLabel = demoBookButton?.querySelector('span');
const demoReceipt = document.querySelector('#booking-demo-receipt');
const demoReceiptId = document.querySelector('#demo-receipt-id');
const receiptFacility = document.querySelector('#receipt-facility');
const receiptTotal = document.querySelector('#receipt-total');
const demoBookAgain = document.querySelector('#demo-book-again');
let selectedFacility = null;
let demoBookingNumber = 1;
let demoBookingTimers = [];

function clearDemoBookingTimers() {
  demoBookingTimers.forEach((timer) => window.clearTimeout(timer));
  demoBookingTimers = [];
}

function resetDemoReceipt() {
  clearDemoBookingTimers();
  demoBookButton?.classList.remove('processing', 'confirmed');
  demoReceipt?.classList.remove('confirmed');
  demoReceipt?.setAttribute('aria-hidden', 'true');
  if (demoBookButtonLabel) demoBookButtonLabel.textContent = 'CREATE DEMO BOOKING';
}

function setFacilityStage(mode, figure, prop, label) {
  facilityAnimationStage.className = `facility-animation-stage ${mode}`;
  facilityFigure.textContent = figure;
  facilityProp.textContent = prop;
  facilityAnimationLabel.textContent = label;
}

function resetFacilityBooking() {
  resetDemoReceipt();
  selectedFacility = null;
  bookingDemo?.classList.remove('facility-ready');
  bookingOpenPanel?.setAttribute('aria-hidden', 'true');
  if (demoBookButton) demoBookButton.disabled = true;
  facilityButtons.forEach((item) => {
    item.disabled = false;
    item.classList.remove('active');
    item.setAttribute('aria-pressed', 'false');
  });
  if (demoFacility) demoFacility.textContent = '—';
  if (demoRate) demoRate.textContent = '—';
  if (demoCapacity) demoCapacity.textContent = '—';
  setFacilityStage('is-idle', '●', '+', 'SELECT A FACILITY');
}

function selectDemoFacility(button) {
  resetDemoReceipt();
  selectedFacility = button.dataset;
  facilityButtons.forEach((item) => {
    const selected = item === button;
    item.disabled = true;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  if (demoFacility) demoFacility.textContent = selectedFacility.name;
  if (demoRate) demoRate.textContent = `RM${selectedFacility.rate}`;
  if (demoCapacity) demoCapacity.textContent = selectedFacility.capacity;
  bookingDemo?.classList.remove('facility-ready');
  bookingOpenPanel?.setAttribute('aria-hidden', 'true');
  if (demoBookButton) demoBookButton.disabled = true;

  const activities = {
    POOL: { mode: 'sport-pool is-playing', figure: '🤸', prop: '🌊', label: 'DIVING INTO THE POOL' },
    BDM: { mode: 'sport-badminton is-playing', figure: '🏃', prop: '🏸', label: 'BADMINTON SMASH' },
    GYM: { mode: 'sport-gym is-playing', figure: '🏋️', prop: '▰', label: 'WEIGHT LIFT IN PROGRESS' }
  };
  const activity = activities[selectedFacility.code];
  setFacilityStage(activity.mode, activity.figure, activity.prop, activity.label);

  const previewDelay = reducedMotion.matches ? 100 : 880;
  demoBookingTimers.push(window.setTimeout(() => {
    facilityAnimationStage.classList.remove('is-playing');
    facilityAnimationStage.classList.add('is-ready');
    facilityFigure.textContent = '✓';
    facilityProp.textContent = '';
    facilityAnimationLabel.textContent = `${selectedFacility.name.toUpperCase()} READY · BOOKING OPEN`;
    facilityButtons.forEach((item) => { item.disabled = false; });
    bookingDemo?.classList.add('facility-ready');
    bookingOpenPanel?.setAttribute('aria-hidden', 'false');
    if (demoBookButton) demoBookButton.disabled = false;
  }, previewDelay));
}

facilityButtons.forEach((button) => button.addEventListener('click', () => selectDemoFacility(button)));

demoBookButton?.addEventListener('click', () => {
  if (!selectedFacility || demoBookButton.classList.contains('processing')) return;
  resetDemoReceipt();
  demoBookButton.classList.add('processing');
  demoBookButtonLabel.textContent = 'CHECKING AVAILABILITY';
  const firstDelay = reducedMotion.matches ? 100 : 480;
  const confirmDelay = reducedMotion.matches ? 200 : 950;

  demoBookingTimers.push(window.setTimeout(() => {
    demoBookButtonLabel.textContent = 'RESERVING SAMPLE SLOT';
  }, firstDelay));

  demoBookingTimers.push(window.setTimeout(() => {
    const bookingId = `CMS-${String(demoBookingNumber).padStart(4, '0')}`;
    demoBookingNumber += 1;
    demoBookButton.classList.remove('processing');
    demoBookButton.classList.add('confirmed');
    demoBookButtonLabel.textContent = 'BOOKING CONFIRMED';
    demoReceiptId.textContent = bookingId;
    receiptFacility.textContent = selectedFacility.name;
    receiptTotal.textContent = `RM${selectedFacility.rate}`;
    demoReceipt.classList.add('confirmed');
    demoReceipt.setAttribute('aria-hidden', 'false');
    setFacilityStage('booking-success is-playing', '👍', '✦', 'BOOKING COMPLETE');
  }, confirmDelay));
});

demoBookAgain?.addEventListener('click', () => {
  resetFacilityBooking();
  facilityButtons[0]?.focus();
});
window.addEventListener('pageshow', resetFacilityBooking);

// Expandable Clubhouse project filmstrip
const clubhouseProjectCard = document.querySelector('.clubhouse-project-card');
const clubhouseGalleryToggle = document.querySelector('#clubhouse-gallery-toggle');
const clubhouseGalleryPanel = document.querySelector('#clubhouse-gallery-panel');
const clubhouseFilmstrip = document.querySelector('.clubhouse-filmstrip');
const clubhouseFilmstripViewport = document.querySelector('#clubhouse-filmstrip-viewport');
const clubhouseFilmstripTrack = document.querySelector('#clubhouse-filmstrip-track');
const clubhouseFilmstripSlides = [...document.querySelectorAll('.clubhouse-filmstrip-slide')];
const clubhouseTimelineButtons = [...document.querySelectorAll('#clubhouse-filmstrip-timeline button')];
const clubhouseFilmstripProgress = document.querySelector('#clubhouse-filmstrip-progress');
const clubhouseGalleryCaption = document.querySelector('#clubhouse-gallery-caption');
const clubhouseGalleryCount = document.querySelector('#clubhouse-gallery-count');
const clubhousePreviousButton = document.querySelector('#clubhouse-gallery-prev');
const clubhouseNextButton = document.querySelector('#clubhouse-gallery-next');
let clubhouseGalleryIndex = 0;
let clubhouseTrackPosition = 0;
let clubhouseDragStart = 0;
let clubhouseDragDistance = 0;
let clubhouseDragging = false;

function positionClubhouseFilmstrip(animate = true) {
  const activeSlide = clubhouseFilmstripSlides[clubhouseGalleryIndex];
  if (!activeSlide || !clubhouseFilmstripViewport || !clubhouseFilmstripTrack) return;
  clubhouseFilmstripTrack.style.transition = animate ? '' : 'none';
  clubhouseTrackPosition = (clubhouseFilmstripViewport.clientWidth / 2) - activeSlide.offsetLeft - (activeSlide.offsetWidth / 2);
  clubhouseFilmstripTrack.style.transform = `translate3d(${clubhouseTrackPosition}px, 0, 0)`;
  if (!animate) requestAnimationFrame(() => { clubhouseFilmstripTrack.style.transition = ''; });
}

function showClubhouseGalleryImage(index, focusTimeline = false) {
  if (!clubhouseFilmstripSlides.length) return;
  clubhouseGalleryIndex = Math.max(0, Math.min(index, clubhouseFilmstripSlides.length - 1));
  const activeSlide = clubhouseFilmstripSlides[clubhouseGalleryIndex];

  clubhouseFilmstripSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === clubhouseGalleryIndex);
  });
  clubhouseTimelineButtons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === clubhouseGalleryIndex;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });

  clubhouseGalleryCaption.textContent = activeSlide.dataset.title;
  clubhouseGalleryCount.textContent = `${String(clubhouseGalleryIndex + 1).padStart(2, '0')} — ${String(clubhouseFilmstripSlides.length).padStart(2, '0')}`;
  const progressRange = 100 - (100 / clubhouseFilmstripSlides.length);
  clubhouseFilmstripProgress.style.width = `${(clubhouseGalleryIndex / (clubhouseFilmstripSlides.length - 1)) * progressRange}%`;
  clubhousePreviousButton.disabled = clubhouseGalleryIndex === 0;
  clubhouseNextButton.disabled = clubhouseGalleryIndex === clubhouseFilmstripSlides.length - 1;
  positionClubhouseFilmstrip();

  const activeTimelineButton = clubhouseTimelineButtons[clubhouseGalleryIndex];
  activeTimelineButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  if (focusTimeline) activeTimelineButton?.focus({ preventScroll: true });
}

clubhouseTimelineButtons.forEach((button) => {
  button.addEventListener('click', () => showClubhouseGalleryImage(Number(button.dataset.index)));
});

clubhouseGalleryToggle?.addEventListener('click', () => {
  const opening = !clubhouseProjectCard.classList.contains('gallery-open');
  clubhouseProjectCard.classList.toggle('gallery-open', opening);
  clubhouseGalleryToggle.setAttribute('aria-expanded', String(opening));
  clubhouseGalleryPanel.setAttribute('aria-hidden', String(!opening));
  const toggleLabel = clubhouseGalleryToggle.querySelector('.clubhouse-toggle-copy b');
  if (toggleLabel) toggleLabel.textContent = opening ? 'HIDE PROJECT IMAGES' : 'VIEW PROJECT IMAGES';

  if (opening) {
    requestAnimationFrame(() => {
      positionClubhouseFilmstrip(false);
      requestAnimationFrame(() => positionClubhouseFilmstrip(false));
    });
  }
});

// Warm the first gallery frames during browser idle time so the drawer opens cleanly.
const preloadClubhouseGallery = () => {
  clubhouseFilmstripSlides.slice(0, 4).forEach((slide) => {
    const source = slide.querySelector('img')?.currentSrc || slide.querySelector('img')?.src;
    if (!source) return;
    const image = new Image();
    image.src = source;
  });
};

if ('requestIdleCallback' in window) window.requestIdleCallback(preloadClubhouseGallery, { timeout: 900 });
else window.setTimeout(preloadClubhouseGallery, 180);

clubhousePreviousButton?.addEventListener('click', () => showClubhouseGalleryImage(clubhouseGalleryIndex - 1));
clubhouseNextButton?.addEventListener('click', () => showClubhouseGalleryImage(clubhouseGalleryIndex + 1));

clubhouseFilmstrip?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showClubhouseGalleryImage(clubhouseGalleryIndex - 1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    showClubhouseGalleryImage(clubhouseGalleryIndex + 1);
  }
});

clubhouseFilmstripViewport?.addEventListener('pointerdown', (event) => {
  clubhouseDragging = true;
  clubhouseDragStart = event.clientX;
  clubhouseDragDistance = 0;
  clubhouseFilmstripViewport.classList.add('dragging');
  clubhouseFilmstripViewport.setPointerCapture(event.pointerId);
});

clubhouseFilmstripViewport?.addEventListener('pointermove', (event) => {
  if (!clubhouseDragging) return;
  clubhouseDragDistance = event.clientX - clubhouseDragStart;
  clubhouseFilmstripTrack.style.transform = `translate3d(${clubhouseTrackPosition + clubhouseDragDistance}px, 0, 0)`;
});

function finishClubhouseDrag(event) {
  if (!clubhouseDragging) return;
  clubhouseDragging = false;
  clubhouseFilmstripViewport.classList.remove('dragging');
  if (event?.pointerId !== undefined && clubhouseFilmstripViewport.hasPointerCapture(event.pointerId)) {
    clubhouseFilmstripViewport.releasePointerCapture(event.pointerId);
  }
  if (clubhouseDragDistance < -45) showClubhouseGalleryImage(clubhouseGalleryIndex + 1);
  else if (clubhouseDragDistance > 45) showClubhouseGalleryImage(clubhouseGalleryIndex - 1);
  else positionClubhouseFilmstrip();
}

clubhouseFilmstripViewport?.addEventListener('pointerup', finishClubhouseDrag);
clubhouseFilmstripViewport?.addEventListener('pointercancel', finishClubhouseDrag);
window.addEventListener('resize', () => positionClubhouseFilmstrip(false));
showClubhouseGalleryImage(0);

// DNS project resolver gallery
const dnsProjectCard = document.querySelector('.dns-project-card');
const dnsGalleryToggle = document.querySelector('#dns-gallery-toggle');
const dnsGalleryPanel = document.querySelector('#dns-gallery-panel');
const dnsGalleryConsole = document.querySelector('.dns-resolver-console');
const dnsGalleryImageWrap = document.querySelector('.dns-gallery-image-wrap');
const dnsGalleryImage = document.querySelector('#dns-gallery-image');
const dnsGalleryCaption = document.querySelector('#dns-gallery-caption');
const dnsGalleryCount = document.querySelector('#dns-gallery-count');
const dnsQueryProgress = document.querySelector('#dns-query-progress');
const dnsPreviousButton = document.querySelector('#dns-gallery-prev');
const dnsNextButton = document.querySelector('#dns-gallery-next');
const dnsStepButtons = [...document.querySelectorAll('#dns-step-buttons button')];
const dnsGalleryItems = [
  { src: 'assets/dns-gallery/01-dns-role-selection.png', title: 'Select the DNS Server role', alt: 'DNS Server role selected in Server Manager' },
  { src: 'assets/dns-gallery/02-server-manager.png', title: 'Confirm DNS in Server Manager', alt: 'DNS role visible in the Server Manager dashboard' },
  { src: 'assets/dns-gallery/03-new-zone-wizard.png', title: 'Open the New Zone Wizard', alt: 'New Zone Wizard welcome screen' },
  { src: 'assets/dns-gallery/04-primary-zone.png', title: 'Create a primary forward zone', alt: 'Primary zone selected in the New Zone Wizard' },
  { src: 'assets/dns-gallery/05-secure-updates.png', title: 'Apply secure dynamic updates', alt: 'Secure dynamic update option selected' },
  { src: 'assets/dns-gallery/06-reverse-zone.png', title: 'Create an IPv4 reverse zone', alt: 'IPv4 reverse lookup zone selected' },
  { src: 'assets/dns-gallery/07-cname-record.png', title: 'Open the CNAME record menu', alt: 'New Alias CNAME option in DNS Manager' }
];
let dnsGalleryIndex = 0;

function showDnsGalleryItem(index, moveFocus = false) {
  if (!dnsGalleryItems.length || !dnsGalleryImage) return;
  dnsGalleryIndex = Math.max(0, Math.min(index, dnsGalleryItems.length - 1));
  const item = dnsGalleryItems[dnsGalleryIndex];

  dnsGalleryImageWrap?.classList.add('changing');
  window.setTimeout(() => {
    dnsGalleryImage.src = item.src;
    dnsGalleryImage.alt = item.alt;
    dnsGalleryCaption.textContent = item.title;
    dnsGalleryCount.textContent = `STEP ${String(dnsGalleryIndex + 1).padStart(2, '0')} / ${String(dnsGalleryItems.length).padStart(2, '0')}`;
    dnsQueryProgress.style.width = `${((dnsGalleryIndex + 1) / dnsGalleryItems.length) * 100}%`;
    dnsGalleryImageWrap?.classList.remove('changing');
    dnsGalleryImageWrap?.classList.remove('scanning');
    void dnsGalleryImageWrap?.offsetWidth;
    dnsGalleryImageWrap?.classList.add('scanning');
  }, reducedMotion.matches ? 0 : 150);

  dnsStepButtons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === dnsGalleryIndex;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  dnsPreviousButton.disabled = dnsGalleryIndex === 0;
  dnsNextButton.disabled = dnsGalleryIndex === dnsGalleryItems.length - 1;
  if (moveFocus) dnsStepButtons[dnsGalleryIndex]?.focus({ preventScroll: true });
}

dnsGalleryToggle?.addEventListener('click', () => {
  const opening = !dnsProjectCard.classList.contains('dns-open');
  dnsProjectCard.classList.toggle('dns-open', opening);
  dnsGalleryToggle.setAttribute('aria-expanded', String(opening));
  dnsGalleryPanel.setAttribute('aria-hidden', String(!opening));
  const label = dnsGalleryToggle.querySelector('b');
  if (label) label.textContent = opening ? 'HIDE PROJECT IMAGES' : 'VIEW PROJECT IMAGES';
  if (opening) window.setTimeout(() => dnsGalleryConsole?.focus({ preventScroll: true }), 620);
});

dnsStepButtons.forEach((button) => button.addEventListener('click', () => showDnsGalleryItem(Number(button.dataset.index), true)));
dnsPreviousButton?.addEventListener('click', () => showDnsGalleryItem(dnsGalleryIndex - 1));
dnsNextButton?.addEventListener('click', () => showDnsGalleryItem(dnsGalleryIndex + 1));
dnsGalleryConsole?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showDnsGalleryItem(dnsGalleryIndex - 1, true); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showDnsGalleryItem(dnsGalleryIndex + 1, true); }
});
showDnsGalleryItem(0);

// DNS repository resolution animation
const dnsLink = document.querySelector('.dns-link');
const dnsOverlay = document.querySelector('#dns-overlay');
const dnsStatus = document.querySelector('#dns-status');
const dnsSteps = [...document.querySelectorAll('#dns-overlay .dns-steps li')];
let dnsAccessInProgress = false;
let dnsTimers = [];

function resetDnsAccess() {
  dnsTimers.forEach((timer) => window.clearTimeout(timer));
  dnsTimers = [];
  dnsAccessInProgress = false;
  dnsOverlay?.classList.remove('active', 'resolved');
  dnsOverlay?.setAttribute('aria-hidden', 'true');
  if (dnsStatus) dnsStatus.textContent = 'Connecting clients to DNS…';
  dnsSteps.forEach((step) => {
    step.classList.remove('running', 'done');
    const state = step.querySelector('b');
    if (state) state.textContent = 'WAIT';
  });
}

window.addEventListener('pageshow', resetDnsAccess);

dnsLink?.addEventListener('click', (event) => {
  event.preventDefault();
  if (dnsAccessInProgress) return;
  const destination = dnsLink.href;
  const stepTime = reducedMotion.matches ? 120 : 560;
  const finishTime = reducedMotion.matches ? 150 : 720;

  resetDnsAccess();
  dnsAccessInProgress = true;
  dnsOverlay.classList.add('active');
  dnsOverlay.setAttribute('aria-hidden', 'false');
  dnsStatus.textContent = 'Connecting clients to DNS…';

  dnsSteps.forEach((step, index) => {
    dnsTimers.push(window.setTimeout(() => {
      const previousStep = dnsSteps[index - 1];
      if (previousStep) {
        previousStep.classList.remove('running');
        previousStep.classList.add('done');
        previousStep.querySelector('b').textContent = 'OK';
      }
      step.classList.add('running');
      step.querySelector('b').textContent = 'RUN';
      dnsStatus.textContent = `${step.querySelector('span').textContent}…`;
    }, index * stepTime));
  });

  dnsTimers.push(window.setTimeout(() => {
    const finalStep = dnsSteps.at(-1);
    finalStep.classList.remove('running');
    finalStep.classList.add('done');
    finalStep.querySelector('b').textContent = 'OK';
    dnsOverlay.classList.add('resolved');
    dnsStatus.textContent = 'Domain resolved · Opening repository';
    dnsTimers.push(window.setTimeout(() => {
      resetDnsAccess();
      window.location.assign(destination);
    }, finishTime));
  }, dnsSteps.length * stepTime));
});
