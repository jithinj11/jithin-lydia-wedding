(()=>{
'use strict';
const c=window.weddingConfig||{},body=document.body,root=document.documentElement,
audio=document.getElementById('weddingMusic'),open=document.getElementById('openInvitation'),
hint=document.getElementById('hint'),glow=document.getElementById('pointerGlow'),
ripple=document.getElementById('interactionRipple'),
reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

let scenes=[...document.querySelectorAll('.scene')],i=0,playing=false,paused=false,
timer=0,resume=0,started=0,remaining=0,last=0;

const delay=Math.max(500,Number(c.interaction?.resumeAfterInactivity)||2000);
const speed=Math.max(.5,Math.min(1.5,Number(c.animation?.speed)||1));

Object.entries(c.theme||{}).forEach(([k,v])=>root.style.setProperty('--'+k,v));
scenes.forEach(s=>{
  const bg=s.querySelector('.bg'),key=s.dataset.scene;
  if(bg&&c.images?.[key]) bg.style.backgroundImage='url("'+c.images[key]+'")';
});
document.querySelectorAll('.location').forEach(a=>{
  const u=c[a.dataset.map]?.mapsUrl;
  if(u)a.href=u; else a.remove();
});
if(audio&&c.music?.enabled&&c.music?.source){
  audio.src=c.music.source;
  audio.volume=Math.min(1,Math.max(0,Number(c.music.volume)||.22));
}

Object.values(c.images||{}).filter(Boolean).forEach(src=>{
  const im=new Image();im.decoding='async';im.src=src;
});

const dur=s=>Math.max(1800,(Number(c.animation?.scenes?.[s.dataset.scene])||7000)/speed);

function show(n){
  clearTimeout(timer);
  if(n>=scenes.length){
    playing=false;paused=false;body.classList.remove('playing','paused');
    hint.textContent='';
    if(audio){audio.pause();audio.currentTime=0}
    return;
  }
  scenes.forEach((s,j)=>s.classList.toggle('active',j===n));
  i=n;remaining=dur(scenes[i]);started=performance.now();
  if(playing&&!paused&&!reduced)timer=setTimeout(()=>show(i+1),remaining);
}

async function start(){
  if(playing)return;
  playing=true;body.classList.add('playing');
  hint.textContent='CLICK OR TAP TO PAUSE · RESUMES AFTER 2 SECONDS';
  if(audio&&c.music?.enabled&&c.music?.source)try{await audio.play()}catch(_){}
  show(1);
}

function pause(){
  if(!playing)return;
  clearTimeout(timer);clearTimeout(resume);
  if(!paused){
    remaining=Math.max(120,remaining-(performance.now()-started));
    paused=true;body.classList.add('paused');
    if(audio)audio.pause();
    hint.textContent='PAUSED · RESUMING IN 2 SECONDS';
  }
  resume=setTimeout(()=>{
    if(!playing)return;
    paused=false;body.classList.remove('paused');
    hint.textContent='CLICK OR TAP TO PAUSE · RESUMES AFTER 2 SECONDS';
    started=performance.now();
    if(audio&&c.music?.enabled&&c.music?.source)audio.play().catch(()=>{});
    if(!reduced)timer=setTimeout(()=>show(i+1),remaining);
  },delay);
}

function pulse(x,y){
  if(reduced)return;
  ripple.style.left=x+'px';ripple.style.top=y+'px';
  ripple.classList.remove('pulse');void ripple.offsetWidth;ripple.classList.add('pulse');
}

addEventListener('pointermove',e=>{
  if(!playing||reduced)return;
  const now=performance.now();if(now-last<16)return;last=now;
  const x=e.clientX,y=e.clientY;
  const nx=Math.max(-.5,Math.min(.5,x/innerWidth-.5));
  const ny=Math.max(-.5,Math.min(.5,y/innerHeight-.5));
  root.style.setProperty('--px',(nx*34).toFixed(2)+'px');
  root.style.setProperty('--py',(ny*24).toFixed(2)+'px');
  root.style.setProperty('--bgx',(nx*-18).toFixed(2)+'px');
  root.style.setProperty('--bgy',(ny*-14).toFixed(2)+'px');
  glow.style.left=x+'px';glow.style.top=y+'px';
},{passive:true});

addEventListener('pointerdown',e=>{
  if(!playing||open?.contains(e.target)||e.target?.closest?.('.location'))return;
  pulse(e.clientX||innerWidth/2,e.clientY||innerHeight/2);pause();
},{passive:true});

addEventListener('wheel',e=>e.preventDefault(),{passive:false});
addEventListener('touchmove',e=>e.preventDefault(),{passive:false});

addEventListener('keydown',e=>{
  if(playing&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)){
    e.preventDefault();pause();
  }
});

open?.addEventListener('click',start);

const target=Date.parse((c.wedding?.date||'2026-11-07')+'T'+
(c.wedding?.time||'15:30')+':00'),
d=document.getElementById('d'),h=document.getElementById('h'),
m=document.getElementById('m'),s=document.getElementById('s');

if(d&&h&&m&&s&&!Number.isNaN(target)){
  const tick=()=>{
    const q=Math.max(0,Math.floor((target-Date.now())/1000));
    d.textContent=String(Math.floor(q/86400)).padStart(2,'0');
    h.textContent=String(Math.floor(q%86400/3600)).padStart(2,'0');
    m.textContent=String(Math.floor(q%3600/60)).padStart(2,'0');
    s.textContent=String(q%60).padStart(2,'0');
  };
  tick();setInterval(tick,1000);
}
})();
