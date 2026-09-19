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