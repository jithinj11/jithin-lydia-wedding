(() => {
  'use strict';

  const cfg = window.weddingConfig || {};
  const root = document.documentElement;
  const body = document.body;
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const enter = document.getElementById('enter');
  const nextButton = document.getElementById('skip');
  const soundButton = document.getElementById('sound');
  const music = document.getElementById('music');
  const sceneName = document.getElementById('sceneName');
  const progress = document.querySelector('.progress span');

  const labels = {
    opening: 'OPENING',
    scripture: 'SCRIPTURE',
    hero: 'JITHIN & LYDIA',
    ceremony: 'HOLY MATRIMONY',
    reception: 'CELEBRATION',
    countdown: 'COUNTDOWN',
    closing: 'FOREVER'
  };

  const sceneSettings = cfg.sceneSettings || {
    opening: {duration: 0, shift: {x: 0, y: 0}, auto: false},
    scripture: {duration: 5200, shift: {x: 0, y: 0}, auto: true},
    hero: {duration: 7600, shift: {x: 0, y: 0}, auto: true},
    ceremony: {duration: 7600, shift: {x: 0, y: 0}, auto: true},
    reception: {duration: 7600, shift: {x: 0, y: 0}, auto: true},
    countdown: {duration: 6000, shift: {x: 0, y: 0}, auto: true},
    closing: {duration: 9000, shift: {x: 0, y: 0}, auto: true}
  };

  const contentSelectors = {
    opening: '.opening-frame',
    scripture: '.scripture-copy',
    hero: '.hero-content',
    ceremony: '.event-content',
    reception: '.event-content',
    countdown: '.count-content',
    closing: '.closing-content'
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let started = false;
  let timer = null;
  let countdownTimer = null;

  function clearSceneTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function updateChrome() {
    const key = scenes[current]?.dataset.scene || 'opening';
    if (sceneName) sceneName.textContent = labels[key] || key.toUpperCase();
    if (progress) {
      progress.style.width = `${(current / Math.max(1, scenes.length - 1)) * 100}%`;
    }
    body.dataset.scene = key;
  }

  function revealHeroNames() {
    const hero = document.querySelector('.scene-hero');
    if (!hero) return;
    // The text is always visible by default. This class only adds the writing effect.
    hero.classList.remove('hero-writing-active');
    void hero.offsetWidth;
    hero.classList.add('hero-writing-active');
  }

  function showScene(index, options = {}) {
    if (!scenes.length) return;
    const { autoAdvance = true } = options;
    clearSceneTimer();

    current = Math.max(0, Math.min(index, scenes.length - 1));

    scenes.forEach((scene, i) => {
      const active = i === current;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    updateChrome();

    const key = scenes[current]?.dataset.scene || 'opening';
    if (key === 'hero') {
      window.setTimeout(revealHeroNames, 30);
    }
    const settings = sceneSettings[key] || {};
    const shift = settings.shift || {};
    const x = Number(shift.x) || 0;
    const y = Number(shift.y) || 0;

    scenes.forEach(scene => {
      const sceneKey = scene.dataset.scene;
      const selector = contentSelectors[sceneKey];
      if (!selector) return;
      const content = scene.querySelector(selector);
      if (!content) return;
      const active = scene === scenes[current];
      content.style.setProperty('--scene-shift-x', active ? `${x}px` : '0px');
      content.style.setProperty('--scene-shift-y', active ? `${y}px` : '0px');
    });

    if (started && autoAdvance && !reducedMotion && settings.auto !== false) {
      const delay = Number(settings.duration) || 0;
      if (delay > 0) timer = window.setTimeout(() => showScene(current + 1), delay);
    }
  }

  function enterInvitation(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // This is the only code path for the opening button.
    if (!started) {
      started = true;
      body.classList.add('started', 'invitation-entered');
    }

    showScene(1);

    if (music) {
      music.volume = Number(cfg.music?.volume) || 0.22;
      music.play().then(() => {
        if (soundButton) soundButton.innerHTML = 'SOUND <span>ON</span>';
      }).catch(() => {
        if (soundButton) soundButton.innerHTML = 'SOUND <span>OFF</span>';
      });
    }
  }

  function nextScene(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!started) return enterInvitation(event);
    showScene(Math.min(current + 1, scenes.length - 1));
  }

  function previousScene() {
    if (!started) return;
    showScene(Math.max(current - 1, 0), { autoAdvance: false });
  }

  function toggleSound(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!music) return;
    if (music.paused) {
      music.volume = Number(cfg.music?.volume) || 0.22;
      music.play().then(() => {
        if (soundButton) soundButton.innerHTML = 'SOUND <span>ON</span>';
      }).catch(() => {});
    } else {
      music.pause();
      if (soundButton) soundButton.innerHTML = 'SOUND <span>OFF</span>';
    }
  }

  // Critical interaction: exactly one listener, directly on the button.
  if (nextButton) nextButton.addEventListener('click', nextScene);
  if (soundButton) soundButton.addEventListener('click', toggleSound);

  document.addEventListener('keydown', event => {
    if (event.target.closest('button, a')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') nextScene();
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') previousScene();
  });

  let touchStartX = 0;
  let touchStartY = 0;
  document.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  document.addEventListener('touchend', event => {
    if (!started) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextScene();
      else previousScene();
    }
  }, { passive: true });

  // Lightweight pointer atmosphere; it never receives pointer events.
  const cursor = document.querySelector('.cursor-light');
  function pointerAtmosphere(x, y) {
    const dx = x - 0.5;
    const dy = y - 0.5;
    root.style.setProperty('--mx', `${(dx * 34).toFixed(2)}px`);
    root.style.setProperty('--my', `${(dy * 24).toFixed(2)}px`);
    if (cursor) {
      cursor.style.left = `${x * 100}%`;
      cursor.style.top = `${y * 100}%`;
    }
  }
  document.addEventListener('pointermove', e => pointerAtmosphere(e.clientX / innerWidth, e.clientY / innerHeight), { passive: true });

  function updateCountdown() {
    const date = cfg.wedding?.date || '2026-11-07';
    const time = cfg.wedding?.time || '15:30';
    const target = Date.parse(`${date}T${time}:00`);
    const total = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const values = [
      Math.floor(total / 86400),
      Math.floor((total % 86400) / 3600),
      Math.floor((total % 3600) / 60),
      total % 60
    ];
    ['d', 'h', 'm', 's'].forEach((id, i) => {
      const node = document.getElementById(id);
      if (node) node.textContent = String(values[i]).padStart(2, '0');
    });
  }

  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);
  window.addEventListener('pagehide', () => {
    clearSceneTimer();
    if (countdownTimer) window.clearInterval(countdownTimer);
  }, { once: true });

  // Public start bridge used by the opening button.
  // The inline button fallback activates Scripture first; this function then
  // takes over the normal cinematic state machine without reversing the scene.
  window.__weddingStart = function () {
    if (!started) {
      started = true;
      body.classList.add('started', 'invitation-entered');
    }
    showScene(1);
    if (music) {
      music.volume = Number(cfg.music?.volume) || 0.22;
      music.play().then(() => {
        if (soundButton) soundButton.innerHTML = 'SOUND <span>ON</span>';
      }).catch(() => {
        if (soundButton) soundButton.innerHTML = 'SOUND <span>OFF</span>';
      });
    }
  };

  // Deterministic initial state: opening only.
  showScene(0, { autoAdvance: false });
})();

// Lightweight global cinematic petal/dust field.
(() => {
  const canvas = document.getElementById('ambient-petals');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0, height = 0, dpr = 1, particles = [], raf = 0, last = performance.now();
  const isMobile = () => innerWidth < 700;
  const particleCount = () => Math.max(7, Math.min(isMobile() ? 14 : 24, Math.round(Math.max(320000, innerWidth * innerHeight) / 115000)));

  function makeParticle(initial) {
    const petal = Math.random() > 0.26;
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : -20 - Math.random() * 90,
      size: petal ? 2.1 + Math.random() * 3.4 : .8 + Math.random() * 1.7,
      speed: .13 + Math.random() * .31,
      drift: .16 + Math.random() * .34,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .006,
      opacity: .18 + Math.random() * .3,
      petal
    };
  }

  function resize() {
    width = innerWidth;
    height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = particleCount();
    while (particles.length < target) particles.push(makeParticle(true));
    if (particles.length > target) particles.length = target;
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.petal ? 'rgba(246,226,193,.9)' : 'rgba(255,248,237,.88)';
    ctx.beginPath();
    if (p.petal) ctx.ellipse(0, 0, p.size * 1.45, p.size * .72, 0, 0, Math.PI * 2);
    else ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick(now) {
    const dt = Math.min(32, now - last);
    last = now;
    ctx.clearRect(0, 0, width, height);
    const wind = isMobile() ? .34 : .52;
    particles.forEach(p => {
      p.y += p.speed * dt;
      p.x += Math.sin(now * .00035 + p.phase) * wind + p.drift * .055;
      p.rotation += p.spin * dt;
      if (p.y > height + 30 || p.x < -60 || p.x > width + 60) Object.assign(p, makeParticle(false));
      draw(p);
    });
    raf = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  raf = requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();
