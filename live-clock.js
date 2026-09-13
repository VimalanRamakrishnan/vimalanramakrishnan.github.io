(() => {
  'use strict';
  const clock = document.getElementById('smart-access-clock');
  if (!clock) return;
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit',
    second: '2-digit', hourCycle: 'h23'
  });
  let timer;
  function update() {
    clearTimeout(timer);
    const now = new Date();
    clock.textContent = formatter.format(now) + ' MYT';
    clock.dateTime = now.toISOString();
    clock.setAttribute('aria-label', 'Current Malaysia time: ' + formatter.format(now));
    if (!document.hidden) timer = setTimeout(update, 1000 - (Date.now() % 1000));
  }
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pageshow', update);
  window.addEventListener('pagehide', () => clearTimeout(timer));
  update();
})();
