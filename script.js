(()=>{
  'use strict';
  const c=window.weddingConfig||{};
  const body=document.body, root=document.documentElement;
  const open=document.getElementById('openInvitation'), hint=document.getElementById('hint');
  const glow=document.getElementById('pointerGlow'), ripple=document.getElementById('interactionRipple');
  const audio=document.getElementById('weddingMusic');
  let scenes=[...document.querySelectorAll('.scene')];
  let i=0,playing=false,paused=false,timer=0,resume=0,started=0,remaining=0,lastPointer=0,countTimer=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resumeDelay=Math.max(500,Number(c.interaction?.resumeAfterInactivity)||2000);
  const speed=Math.max(.35,Math.min(2.5,Number(c.animation?.speed)||1));

  function setup(){
    const theme=c.theme||{};
    for(const [k,v] of Object.entries(theme)) root.style.setProperty('--'+k,v);
    root.style.setProperty('--px','0px');root.style.setProperty('--py','0px');
    root.style.setProperty('--bgx','0px');root.style.setProperty('--bgy','0px');root.style.setProperty('--speed',speed);
    scenes.forEach(scene=>{
      const bg=scene.querySelector('.bg'), key=scene.dataset.scene;
      if(bg&&c.images?.[key]) bg.style.backgroundImage=`url("${c.images[key]}")`;
    });
    if(!c.familyBlessings?.enabled){
      document.querySelector('[data-scene="family"]')?.remove();
      scenes=[...document.querySelectorAll('.scene')];
    }
    document.querySelectorAll('.scene').forEach((scene,n)=>scene.style.setProperty('--scene-index',n));
    document.querySelectorAll('.location-link').forEach(link=>{
      const key=link.dataset.map;
      const url=c[key]?.mapsUrl;
      if(url) link.href=url; else link.remove();
    });
    if(audio&&c.music?.enabled&&c.music?.source){
      audio.src=c.music.source;
      audio.volume=Math.max(0,Math.min(1,Number(c.music.volume)||.22));
    }
  }

  function preload(){
    const urls=Object.values(c.images||{}).filter(Boolean);
    urls.forEach(src=>{const im=new Image();im.decoding='async';im.src=src});
  }

  function durationFor(scene){
    const base=Number(c.animation?.scenes?.[scene.dataset.scene])||7000;
    return Math.max(1800,base/speed);
  }

  function resetSceneAnimations(scene){
    scene.querySelectorAll('[data-replay]').forEach(el=>{el.classList.remove('replay');void el.offsetWidth;el.classList.add('replay')});
  }

  function show(n){
    if(n>=scenes.length){
      playing=false;paused=false;body.classList.remove('playing','paused');hint.textContent='';
      if(audio){audio.pause();audio.currentTime=0}
      return;
    }
    scenes.forEach((s,j)=>s.classList.toggle('active',j===n));
    i=n; remaining=durationFor(scenes[i]); started=performance.now(); clearTimeout(timer); resetSceneAnimations(scenes[i]);
    if(playing&&!paused&&!reduced) timer=setTimeout(()=>show(i+1),remaining);
  }

  async function start(){
    if(playing)return;
    playing=true;paused=false;body.classList.add('playing');
    hint.textContent='TOUCH / CLICK TO PAUSE · MOVE TO EXPLORE';
    if(audio&&c.music?.enabled&&c.music?.source){try{await audio.play()}catch(_){}}
    show(1);
  }

  function pauseAndResume(){
    if(!playing)return;
    clearTimeout(resume);
    if(!paused){
      remaining=Math.max(120,remaining-(performance.now()-started));
      clearTimeout(timer);paused=true;body.classList.add('paused');
      if(audio)audio.pause();
      hint.textContent='PAUSED · RESUMING IN 2 SECONDS';
    }
    resume=setTimeout(()=>{
      if(!playing)return;
      paused=false;body.classList.remove('paused');hint.textContent='TOUCH / CLICK TO PAUSE · MOVE TO EXPLORE';
      started=performance.now();
      if(audio&&c.music?.enabled&&c.music?.source){audio.play().catch(()=>{})}
      if(!reduced)timer=setTimeout(()=>show(i+1),remaining);
    },resumeDelay);
  }

  function pulse(x,y){
    if(reduced||!ripple)return;
    ripple.style.left=`${x}px`;ripple.style.top=`${y}px`;
    ripple.classList.remove('pulse');void ripple.offsetWidth;ripple.classList.add('pulse');
  }

  function pointerMove(e){
    if(!playing||reduced)return;
    const now=performance.now();if(now-lastPointer<16)return;lastPointer=now;
    const x=e.clientX??innerWidth/2,y=e.clientY??innerHeight/2;
    const nx=Math.max(-.5,Math.min(.5,x/innerWidth-.5)),ny=Math.max(-.5,Math.min(.5,y/innerHeight-.5));
    root.style.setProperty('--px',`${(nx*34).toFixed(2)}px`);root.style.setProperty('--py',`${(ny*24).toFixed(2)}px`);
    root.style.setProperty('--bgx',`${(nx*-18).toFixed(2)}px`);root.style.setProperty('--bgy',`${(ny*-14).toFixed(2)}px`);
    if(glow){glow.style.left=`${x}px`;glow.style.top=`${y}px`}
  }

  function pointerDown(e){
    if(open&&open.contains(e.target))return;
    if(e.target?.closest?.('.location-link'))return;
    if(!playing)return;
    pulse(e.clientX??innerWidth/2,e.clientY??innerHeight/2);pauseAndResume();
  }

  function blockScroll(e){if(playing)e.preventDefault()}

  function countdown(){
    const date=c.wedding?.date||'2026-11-07',time=c.wedding?.time||'15:30';
    const target=Date.parse(`${date}T${time}:00`);
    const d=document.getElementById('d'),h=document.getElementById('h'),m=document.getElementById('m'),s=document.getElementById('s');
    if(!d||!h||!m||!s||Number.isNaN(target))return;
    const tick=()=>{const q=Math.max(0,Math.floor((target-Date.now())/1000));d.textContent=String(Math.floor(q/86400)).padStart(2,'0');h.textContent=String(Math.floor(q%86400/3600)).padStart(2,'0');m.textContent=String(Math.floor(q%3600/60)).padStart(2,'0');s.textContent=String(q%60).padStart(2,'0')};
    tick();countTimer=setInterval(tick,1000);
  }

  open?.addEventListener('click',start);
  addEventListener('pointermove',pointerMove,{passive:true});
  addEventListener('pointerdown',pointerDown,{passive:true});
  addEventListener('wheel',blockScroll,{passive:false});
  addEventListener('touchmove',blockScroll,{passive:false});
  addEventListener('keydown',e=>{
    if(!playing||e.target?.closest?.('input,textarea,select,button,a'))return;
    if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)){e.preventDefault();pauseAndResume()}
  });
  addEventListener('beforeunload',()=>{clearInterval(countTimer);clearTimeout(timer);clearTimeout(resume);if(audio)audio.pause()});
  setup();preload();countdown();
})();
