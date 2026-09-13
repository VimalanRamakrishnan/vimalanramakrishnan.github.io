/* Lightweight ambient canvas: viewport sized, capped at 30fps and 1.5x DPR. */
(() => {
  'use strict';
  if (document.querySelector('.portfolio-atmosphere')) return;
  const layer = document.createElement('div');
  layer.className = 'portfolio-atmosphere';
  layer.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const glow = document.createElement('div');
  glow.className = 'portfolio-atmosphere-glow';
  layer.append(canvas, glow);
  document.body.prepend(layer);
  document.body.classList.add('has-animated-background');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'portfolio-motion-toggle';
  (document.querySelector('footer') || document.body).append(button);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let saved = null;
  try { saved = sessionStorage.getItem('portfolio-background-paused'); } catch (_) {}
  let paused = reduced.matches || saved === 'true';
  let raf = 0, last = 0, time = 0, width = 1, height = 1;
  let pointer = { x: -1000, y: -1000 };
  const points = Array.from({ length: 38 }, (_, i) => ({ x: ((i*137.51)%997)/997, y: ((i*79.71+91)%991)/991, s: .6+(i%4)*.3, phase:i*1.3 }));
  function bloom(x,y,r,color) {
    const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
    gradient.addColorStop(0,color); gradient.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gradient; ctx.fillRect(0,0,width,height);
  }
  function draw(){ctx.clearRect(0,0,width,height);bloom(width*(.1+.1*Math.sin(time*.17)),height*.25,width*.65,'rgba(30,110,175,.29)');bloom(width*(.94+.06*Math.cos(time*.13)),height*(.4+.1*Math.sin(time*.12)),width*.5,'rgba(94,65,169,.28)');bloom(width*.5,height*(.91+.04*Math.cos(time*.2)),width*.55,'rgba(26,125,126,.19)');
ctx.lineWidth=.5;ctx.strokeStyle='rgba(100,156,193,.045)';for(let x=0;x<width;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}for(let y=0;y<height;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
for(let side=0;side<2;side++){for(let band=0;band<9;band++){ctx.beginPath();for(let j=0;j<=70;j++){const y=j/70*height;const sway=Math.sin(j/70*6+time*.18+band*.06)*width*.1;const x=(side?width*.97:width*.025)+sway+band*4*(side?-1:1);j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=side?'rgba(142,124,240,.07)':'rgba(93,205,226,.075)';ctx.lineWidth=.7;ctx.stroke();}}
ctx.lineWidth=.65;
for(let k=0;k<13;k++){ctx.beginPath();for(let j=0;j<=65;j++){const x=j/65*width;const base=height*(.76+k*.013);const y=base+Math.sin(j/65*4.5+time*.25+k*.075)*height*.13+Math.cos(j/65*3-time*.15)*height*.07;j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle='rgba(86,153,207,'+(.035+k*.003)+')';ctx.stroke();}
points.forEach(p=>{const x=(p.x*width+Math.sin(time*.16+p.phase)*19+width)%width;const y=(p.y*height-time*(2+p.s)+height*100)%height;ctx.beginPath();ctx.arc(x,y,p.s,0,Math.PI*2);ctx.fillStyle='rgba(133,200,232,'+(.18+.16*(1+Math.sin(time*.6+p.phase))/2)+')';ctx.fill();const d=Math.hypot(pointer.x-x,pointer.y-y);if(d<120){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(pointer.x,pointer.y);ctx.strokeStyle='rgba(101,202,235,'+((1-d/120)*.15)+')';ctx.stroke();}});}

  function resize() {
    width = Math.max(1, document.documentElement.clientWidth);
    height = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); draw();
  }
  function frame(now) {
    raf = 0;
    if (paused || document.hidden || !layer.isConnected) return;
    if (now-last >= 1000/30) {
      time += Math.min((now-last)/1000,.06); last=now; draw();
    }
    raf=requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(raf); raf=0;
    button.textContent=paused?'Resume background motion':'Pause background motion';
    button.setAttribute('aria-pressed',String(paused));
    glow.style.opacity=paused?'0':'1';
    if (!paused && !document.hidden) { last=performance.now(); raf=requestAnimationFrame(frame); }
    else draw();
  }
  button.addEventListener('click', () => {
    paused=!paused;
    saved=String(paused);
    try { sessionStorage.setItem('portfolio-background-paused',saved); } catch (_) {}
    sync();
  });
  window.addEventListener('pointermove', event => {
    if (paused || event.pointerType !== 'mouse') return;
    pointer={x:event.clientX,y:event.clientY};
    layer.style.setProperty('--ambient-x',pointer.x+'px');
    layer.style.setProperty('--ambient-y',pointer.y+'px');
  }, {passive:true});
  document.addEventListener('pointerleave',()=>{pointer={x:-1000,y:-1000};});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;});
  window.addEventListener('pageshow',sync);
  reduced.addEventListener('change',()=>{paused=reduced.matches || saved==='true';sync();});
  resize(); sync();
})();
