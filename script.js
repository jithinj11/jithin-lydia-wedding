(()=>{"use strict";
const cfg=window.weddingConfig||{};
const scenes=[...document.querySelectorAll(".scene")];
const labels={opening:"OPENING",scripture:"SCRIPTURE",hero:"JITHIN & LYDIA",ceremony:"HOLY MATRIMONY",reception:"CELEBRATION",countdown:"COUNTDOWN",closing:"FOREVER"};
const durations={opening:6200,scripture:5200,hero:7600,ceremony:7600,reception:7600,countdown:6000,closing:9000};
const prefersReduced=matchMedia("(prefers-reduced-motion:reduce)").matches;
const root=document.documentElement, body=document.body;
const progress=document.querySelector(".progress span"), sceneName=document.getElementById("sceneName");
const cursor=document.querySelector(".cursor-light"), music=document.getElementById("music"), sound=document.getElementById("sound");
let current=0, started=false, paused=false, timer=null, startedAt=0, remaining=0, resumeTimer=null, pointerX=.5, pointerY=.5;

function cssVars(x,y){
  const dx=(x-.5), dy=(y-.5);
  pointerX=x; pointerY=y;
  root.style.setProperty("--mx",(dx*34).toFixed(2)+"px");
  root.style.setProperty("--my",(dy*24).toFixed(2)+"px");
  root.style.setProperty("--rx",(dy*-2.8).toFixed(2)+"deg");
  root.style.setProperty("--ry",(dx*3.8).toFixed(2)+"deg");
  if(cursor){cursor.style.left=(x*100)+"%";cursor.style.top=(y*100)+"%";}
}
function duration(){return (durations[scenes[current]?.dataset.scene]||6500)/(Number(cfg.animation?.speed)||1)}
function animateScene(scene){
  scene.querySelectorAll(".depth-front,.depth-mid").forEach(el=>{
    el.animate([{opacity:0,transform:getComputedStyle(el).transform+" translateY(12px)"},{opacity:1,transform:getComputedStyle(el).transform}],{duration:900,easing:"cubic-bezier(.16,1,.3,1)",fill:"both"});
  });
}
function setScene(n,autoplay=true){
  clearTimeout(timer);
  current=Math.max(0,Math.min(n,scenes.length-1));
  scenes.forEach((s,i)=>s.classList.toggle("is-active",i===current));
  const key=scenes[current].dataset.scene;
  sceneName.textContent=labels[key]||key.toUpperCase();
  root.style.setProperty("--progress",(current/(scenes.length-1)).toFixed(4));
  if(!prefersReduced) animateScene(scenes[current]);
  remaining=duration(); startedAt=performance.now();
  if(started && autoplay && !paused && !prefersReduced) timer=setTimeout(()=>setScene(current+1),remaining);
}
function start(){
  if(started)return;
  started=true; body.classList.add("started");
  setScene(1);
  music.volume=Number(cfg.music?.volume)||.22;
  music.play().then(()=>{sound.innerHTML='SOUND <span>ON</span>';}).catch(()=>{});
}
function pauseResume(){
  if(!started)return;
  clearTimeout(resumeTimer);
  if(!paused){
    paused=true;
    remaining=Math.max(400,remaining-(performance.now()-startedAt));
    clearTimeout(timer);
    resumeTimer=setTimeout(()=>{paused=false;startedAt=performance.now();if(!prefersReduced)timer=setTimeout(()=>setScene(current+1),remaining);},2000);
  }else{
    paused=false;startedAt=performance.now();
    if(!prefersReduced)timer=setTimeout(()=>setScene(current+1),remaining);
  }
}
function next(){
  if(!started){start();return}
  setScene(current+1);
}
function toggleSound(){
  if(music.paused){music.play().then(()=>sound.innerHTML='SOUND <span>ON</span>').catch(()=>{});}
  else{music.pause();sound.innerHTML='SOUND <span>OFF</span>';}
}
function countdown(){
  const target=Date.parse((cfg.wedding?.date||"2026-11-07")+"T"+(cfg.wedding?.time||"15:30")+":00");
  const ids=["d","h","m","s"];
  function tick(){
    let q=Math.max(0,Math.floor((target-Date.now())/1000));
    const vals=[Math.floor(q/86400),Math.floor(q%86400/3600),Math.floor(q%3600/60),q%60];
    ids.forEach((id,i)=>document.getElementById(id).textContent=String(vals[i]).padStart(2,"0"));
  }
  tick(); setInterval(tick,1000);
}
document.getElementById("enter").addEventListener("click",start);
document.getElementById("skip").addEventListener("click",next);
sound.addEventListener("click",toggleSound);
document.addEventListener("pointermove",e=>cssVars(e.clientX/innerWidth,e.clientY/innerHeight),{passive:true});
document.addEventListener("pointerdown",e=>{
  if(e.target.closest("button,a"))return;
  if(started)pauseResume();
});
document.addEventListener("touchmove",e=>{
  const t=e.touches[0]; if(t)cssVars(t.clientX/innerWidth,t.clientY/innerHeight);
},{passive:true});
document.addEventListener("keydown",e=>{
  if(e.target.closest("button,a"))return;
  if(e.key==="ArrowRight"||e.key==="PageDown")next();
  if(e.key==="ArrowLeft"||e.key==="PageUp")setScene(current-1);
  if(e.key===" "){e.preventDefault();pauseResume();}
});
let sx=0,sy=0;
document.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
document.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)){dx<0?next():setScene(current-1);}
},{passive:true});
countdown();
setScene(0,false);
})();

/* =========================================================
   V3 — GLOBAL CINEMATIC PETAL FIELD
   Lightweight canvas, adaptive particle count, mobile-first.
   ========================================================= */
(() => {
  const canvas = document.getElementById('ambient-petals');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0, height = 0, dpr = 1;
  let particles = [];
  let raf = 0;
  let last = performance.now();

  const mobile = () => window.innerWidth < 700;
  const countFor = () => {
    const area = Math.max(320000, window.innerWidth * window.innerHeight);
    const base = Math.round(area / 115000);
    return Math.max(7, Math.min(mobile() ? 14 : 24, base));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = countFor();
    while (particles.length < target) particles.push(makeParticle(true));
    if (particles.length > target) particles.length = target;
  };

  const makeParticle = (initial = false) => {
    const isPetal = Math.random() > 0.26;
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : -20 - Math.random() * 90,
      size: isPetal ? 2.1 + Math.random() * 3.4 : .8 + Math.random() * 1.7,
      speed: .13 + Math.random() * .31,
      drift: .16 + Math.random() * .34,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .006,
      opacity: isPetal ? .20 + Math.random() * .28 : .20 + Math.random() * .24,
      isPetal,
      warm: Math.random() > .58
    };
  };

  const drawPetal = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 1.45, p.size * .72, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.warm ? 'rgba(246,226,193,.9)' : 'rgba(255,248,237,.88)';
    ctx.fill();
    ctx.restore();
  };

  const drawDust = (p) => {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,249,238,.88)';
    ctx.fill();
    ctx.restore();
  };

  const tick = (now) => {
    const dt = Math.min(32, now - last);
    last = now;

    ctx.clearRect(0, 0, width, height);

    const windStrength = mobile() ? .34 : .52;

    for (const p of particles) {
      p.y += p.speed * dt;
      p.x += Math.sin(now * .00035 + p.phase) * windStrength + p.drift * .055;
      p.rotation += p.spin * dt;

      if (p.y > height + 30 || p.x < -60 || p.x > width + 60) {
        Object.assign(p, makeParticle(false));
        if (Math.random() > .35) p.x = Math.random() * width;
      }

      p.isPetal ? drawPetal(p) : drawDust(p);
    }

    raf = requestAnimationFrame(tick);
  };

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }, { passive: true });

  resize();
  raf = requestAnimationFrame(tick);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();

/* V7 — robust invitation entry */
(() => {
  const enterButton = document.getElementById('enter');
  if (!enterButton) return;
  enterButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = typeof window.nextScene === 'function' ? window.nextScene : null;
    if (next) next();
    else {
      const opening = document.querySelector('[data-scene="opening"]');
      const scripture = document.querySelector('[data-scene="scripture"]');
      if (opening && scripture) {
        opening.classList.remove('is-active');
        scripture.classList.add('is-active');
      }
    }
  }, { capture: true });
})();


/* =========================================================
   STRICT V8 INVITATION NAVIGATION
   The Enter button always moves opening -> scripture.
   ========================================================= */
(() => {
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const enter = document.getElementById('enter');
  if (!enter || !scenes.length) return;

  let active = scenes.findIndex(s => s.classList.contains('is-active'));
  if (active < 0) active = 0;

  const show = (index) => {
    active = (index + scenes.length) % scenes.length;
    scenes.forEach((scene, i) => {
      scene.classList.toggle('is-active', i === active);
      scene.setAttribute('aria-hidden', i === active ? 'false' : 'true');
    });
    document.body.dataset.scene = scenes[active]?.dataset.scene || '';
    window.scrollTo(0, 0);
  };

  enter.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    show(active === 0 ? 1 : active + 1);
  }, true);

  // Safety: if another script removes the active state, restore it.
  show(active);
})();
