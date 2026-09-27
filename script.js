(() => {
  'use strict';

  const cfg = window.weddingConfig || {};
  const root = document.documentElement;
  const body = document.body;

  const scenes = Array.from(
    document.querySelectorAll('.scene')
  );

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
    opening: {
      duration: 0,
      shift: { x: 0, y: 0 },
      auto: false
    },

    scripture: {
      duration: 5200,
      shift: { x: 0, y: 0 },
      auto: true
    },

    hero: {
      duration: 7600,
      shift: { x: 0, y: 0 },
      auto: true
    },

    ceremony: {
      duration: 7600,
      shift: { x: 0, y: 0 },
      auto: true
    },

    reception: {
      duration: 7600,
      shift: { x: 0, y: 0 },
      auto: true
    },

    countdown: {
      duration: 6000,
      shift: { x: 0, y: 0 },
      auto: true
    },

    closing: {
      duration: 9000,
      shift: { x: 0, y: 0 },
      auto: true
    }
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

  let current = 0;
  let started = false;
  let sceneTimer = null;
  let countdownTimer = null;

  /*
   * =========================================================
   * TIMER
   * =========================================================
   */

  function clearSceneTimer() {
    if (sceneTimer) {
      window.clearTimeout(sceneTimer);
      sceneTimer = null;
    }
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  function updateChrome() {
    const key =
      scenes[current]?.dataset.scene || 'opening';

    if (sceneName) {
      sceneName.textContent =
        labels[key] || key.toUpperCase();
    }

    if (progress) {
      progress.style.width =
        `${(current / Math.max(1, scenes.length - 1)) * 100}%`;
    }

    body.dataset.scene = key;
  }

  /*
   * =========================================================
   * HERO
   * =========================================================
   */

  function revealHeroNames() {
    const hero =
      document.querySelector('.scene-hero');

    if (!hero) return;

    hero.classList.remove(
      'hero-writing-active'
    );

    void hero.offsetWidth;

    const start = () => {
      hero.classList.add(
        'hero-writing-active'
      );
    };

    if (
      document.fonts &&
      document.fonts.ready
    ) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
  }

  /*
   * =========================================================
   * SCENE ENGINE
   * =========================================================
   */

  function showScene(index, options = {}) {
    if (!scenes.length) return;

    const {
      autoAdvance = true
    } = options;

    clearSceneTimer();

    current =
      Math.max(
        0,
        Math.min(
          index,
          scenes.length - 1
        )
      );

    scenes.forEach(
      (scene, indexNumber) => {

        const active =
          indexNumber === current;

        scene.classList.toggle(
          'is-active',
          active
        );

        scene.setAttribute(
          'aria-hidden',
          active ? 'false' : 'true'
        );
      }
    );

    updateChrome();

    const key =
      scenes[current]?.dataset.scene ||
      'opening';

    /*
     * Hero writing animation
     */

    if (key === 'hero') {

      window.setTimeout(
        revealHeroNames,
        30
      );

      window.setTimeout(
        () => {

          const hero =
            document.querySelector(
              '.scene-hero'
            );

          if (
            hero &&
            hero.classList.contains(
              'is-active'
            )
          ) {
            hero.classList.add(
              'hero-writing-complete'
            );
          }

        },
        5300
      );
    }

    /*
     * Scene positioning
     */

    const settings =
      sceneSettings[key] || {};

    const shift =
      settings.shift || {};

    const x =
      Number(shift.x) || 0;

    const y =
      Number(shift.y) || 0;

    scenes.forEach(
      scene => {

        const sceneKey =
          scene.dataset.scene;

        const selector =
          contentSelectors[sceneKey];

        if (!selector) return;

        const content =
          scene.querySelector(
            selector
          );

        if (!content) return;

        const active =
          scene === scenes[current];

        content.style.setProperty(
          '--scene-shift-x',
          active
            ? `${x}px`
            : '0px'
        );

        content.style.setProperty(
          '--scene-shift-y',
          active
            ? `${y}px`
            : '0px'
        );
      }
    );

    /*
     * Automatic progression
     */

    if (
      started &&
      autoAdvance &&
      settings.auto !== false
    ) {

      const delay =
        Number(settings.duration) || 0;

      if (delay > 0) {

        sceneTimer =
          window.setTimeout(
            () => {

              /*
               * If the user has touched a map button,
               * do not continue cinematic navigation.
               */

              if (
                document.body.dataset.mapOpening ===
                'true'
              ) {
                return;
              }

              showScene(
                current + 1
              );

            },
            delay
          );
      }
    }
  }

  /*
   * =========================================================
   * MUSIC
   * =========================================================
   */

  function startMusicFromGesture() {

    if (
      !music ||
      cfg.music?.enabled === false
    ) {
      return;
    }

    music.volume =
      Number(
        cfg.music?.volume
      ) || 0.22;

    const promise =
      music.play();

    if (
      promise &&
      typeof promise.catch === 'function'
    ) {
      promise.catch(
        () => {}
      );
    }
  }

  /*
   * =========================================================
   * ENTER
   * =========================================================
   */

  function enterInvitation(event) {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    startMusicFromGesture();

    if (!started) {

      started = true;

      body.classList.add(
        'started',
        'invitation-entered'
      );
    }

    showScene(1);
  }

  /*
   * =========================================================
   * NEXT
   * =========================================================
   */

  function nextScene(event) {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!started) {
      enterInvitation(event);
      return;
    }

    showScene(
      Math.min(
        current + 1,
        scenes.length - 1
      )
    );
  }

  /*
   * =========================================================
   * PREVIOUS
   * =========================================================
   */

  function previousScene() {

    if (!started) return;

    showScene(
      Math.max(
        current - 1,
        0
      ),
      {
        autoAdvance: false
      }
    );
  }

  /*
   * =========================================================
   * SOUND
   * =========================================================
   */

  function toggleSound(event) {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!music) return;

    if (music.paused) {

      music.volume =
        Number(
          cfg.music?.volume
        ) || 0.22;

      music.play()
        .then(() => {

          if (soundButton) {
            soundButton.innerHTML =
              'SOUND <span>ON</span>';
          }

        })
        .catch(
          () => {}
        );

    } else {

      music.pause();

      if (soundButton) {
        soundButton.innerHTML =
          'SOUND <span>OFF</span>';
      }
    }
  }

  /*
   * =========================================================
   * OPENING BUTTON
   * =========================================================
   */

  if (enter) {

    enter.addEventListener(
      'pointerdown',
      startMusicFromGesture,
      {
        passive: true
      }
    );

    enter.addEventListener(
      'touchstart',
      startMusicFromGesture,
      {
        passive: true
      }
    );

    enter.addEventListener(
      'click',
      enterInvitation
    );
  }

  /*
   * =========================================================
   * CONTROLS
   * =========================================================
   */

  if (nextButton) {
    nextButton.addEventListener(
      'click',
      nextScene
    );
  }

  if (soundButton) {
    soundButton.addEventListener(
      'click',
      toggleSound
    );
  }

  /*
   * =========================================================
   * GOOGLE MAPS BUTTONS
   * =========================================================
   *
   * THIS IS THE IMPORTANT PART.
   *
   * The map buttons are completely isolated from
   * the cinematic navigation.
   * =========================================================
   */

  const mapLinks =
    document.querySelectorAll(
      '.map-link'
    );

  mapLinks.forEach(
    link => {

      /*
       * Stop the cinematic system when
       * the user starts touching the button.
       */

      link.addEventListener(
        'pointerdown',
        event => {

          event.stopPropagation();

          body.dataset.mapOpening =
            'true';

          clearSceneTimer();

        },
        {
          capture: true,
          passive: true
        }
      );

      link.addEventListener(
        'touchstart',
        event => {

          event.stopPropagation();

          body.dataset.mapOpening =
            'true';

          clearSceneTimer();

        },
        {
          capture: true,
          passive: true
        }
      );

      /*
       * Mouse click.
       */

      link.addEventListener(
        'click',
        event => {

          event.stopPropagation();

          body.dataset.mapOpening =
            'true';

          clearSceneTimer();

          const url =
            link.href;

          if (!url) return;

          /*
           * Use the browser's normal link
           * navigation first.
           */

          window.location.href =
            url;

        },
        {
          capture: true
        }
      );

      /*
       * Mobile touch.
       *
       * Some mobile browsers do not reliably
       * generate the same click behaviour when
       * several layers are animated.
       */

      link.addEventListener(
        'touchend',
        event => {

          event.stopPropagation();

          body.dataset.mapOpening =
            'true';

          clearSceneTimer();

          const url =
            link.href;

          if (!url) return;

          /*
           * Small delay allows the browser to
           * finish the touch gesture before
           * changing the page.
           */

          window.setTimeout(
            () => {

              window.location.href =
                url;

            },
            50
          );

        },
        {
          capture: true,
          passive: true
        }
      );
    }
  );

  /*
   * =========================================================
   * KEYBOARD
   * =========================================================
   */

  document.addEventListener(
    'keydown',
    event => {

      if (
        event.target.closest &&
        event.target.closest(
          'button, a'
        )
      ) {
        return;
      }

      if (
        event.key === 'ArrowRight' ||
        event.key === 'PageDown'
      ) {
        nextScene();
      }

      if (
        event.key === 'ArrowLeft' ||
        event.key === 'PageUp'
      ) {
        previousScene();
      }
    }
  );

  /*
   * =========================================================
   * SWIPE NAVIGATION
   * =========================================================
   */

  let touchStartX = 0;
  let touchStartY = 0;
  let touchingMap = false;

  document.addEventListener(
    'touchstart',
    event => {

      const target =
        event.target;

      if (
        target &&
        target.closest &&
        target.closest(
          '.map-link'
        )
      ) {

        touchingMap = true;

        touchStartX = 0;
        touchStartY = 0;

        return;
      }

      touchingMap = false;

      const touch =
        event.changedTouches &&
        event.changedTouches[0];

      if (!touch) return;

      touchStartX =
        touch.clientX;

      touchStartY =
        touch.clientY;

    },
    {
      passive: true
    }
  );

  document.addEventListener(
    'touchend',
    event => {

      /*
       * NEVER process a map button as
       * a swipe.
       */

      if (touchingMap) {

        touchingMap = false;

        touchStartX = 0;
        touchStartY = 0;

        return;
      }

      const target =
        event.target;

      if (
        target &&
        target.closest &&
        target.closest(
          '.map-link'
        )
      ) {
        return;
      }

      if (!started) return;

      if (
        touchStartX === 0 &&
        touchStartY === 0
      ) {
        return;
      }

      const touch =
        event.changedTouches &&
        event.changedTouches[0];

      if (!touch) return;

      const dx =
        touch.clientX -
        touchStartX;

      const dy =
        touch.clientY -
        touchStartY;

      touchStartX = 0;
      touchStartY = 0;

      if (
        Math.abs(dx) > 55 &&
        Math.abs(dx) >
          Math.abs(dy)
      ) {

        if (dx < 0) {
          nextScene();
        } else {
          previousScene();
        }
      }

    },
    {
      passive: true
    }
  );

  /*
   * =========================================================
   * POINTER ATMOSPHERE
   * =========================================================
   */

  const cursor =
    document.querySelector(
      '.cursor-light'
    );

  function pointerAtmosphere(
    x,
    y
  ) {

    const dx =
      x - 0.5;

    const dy =
      y - 0.5;

    root.style.setProperty(
      '--mx',
      `${(dx * 34).toFixed(2)}px`
    );

    root.style.setProperty(
      '--my',
      `${(dy * 24).toFixed(2)}px`
    );

    if (cursor) {

      cursor.style.left =
        `${x * 100}%`;

      cursor.style.top =
        `${y * 100}%`;
    }
  }

  document.addEventListener(
    'pointermove',
    event => {

      pointerAtmosphere(
        event.clientX / innerWidth,
        event.clientY / innerHeight
      );

    },
    {
      passive: true
    }
  );

  /*
   * =========================================================
   * COUNTDOWN
   * =========================================================
   */

  function updateCountdown() {

    const date =
      cfg.wedding?.date ||
      '2026-11-07';

    const time =
      cfg.wedding?.time ||
      '15:30';

    const target =
      Date.parse(
        `${date}T${time}:00`
      );

    const total =
      Math.max(
        0,
        Math.floor(
          (
            target -
            Date.now()
          ) / 1000
        )
      );

    const values = [

      Math.floor(
        total / 86400
      ),

      Math.floor(
        (total % 86400) /
        3600
      ),

      Math.floor(
        (total % 3600) /
        60
      ),

      total % 60

    ];

    [
      'd',
      'h',
      'm',
      's'
    ].forEach(
      (id, index) => {

        const element =
          document.getElementById(
            id
          );

        if (element) {

          element.textContent =
            String(
              values[index]
            ).padStart(
              2,
              '0'
            );
        }
      }
    );
  }

  updateCountdown();

  countdownTimer =
    window.setInterval(
      updateCountdown,
      1000
    );

  /*
   * =========================================================
   * CLEANUP
   * =========================================================
   */

  window.addEventListener(
    'pagehide',
    () => {

      clearSceneTimer();

      if (countdownTimer) {

        window.clearInterval(
          countdownTimer
        );
      }

    },
    {
      once: true
    }
  );

  /*
   * =========================================================
   * PUBLIC START
   * =========================================================
   */

  window.__weddingStart =
    function () {

      if (!started) {

        started = true;

        body.classList.add(
          'started',
          'invitation-entered'
        );
      }

      showScene(1);
    };

  /*
   * =========================================================
   * INITIAL STATE
   * =========================================================
   */

  showScene(
    0,
    {
      autoAdvance: false
    }
  );

})();


/*
 * =========================================================
 * AMBIENT PETALS / DUST
 * =========================================================
 */

(() => {

  const canvas =
    document.getElementById(
      'ambient-petals'
    );

  if (
    !canvas ||
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  ) {
    return;
  }

  const ctx =
    canvas.getContext(
      '2d',
      {
        alpha: true
      }
    );

  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;

  let particles = [];

  let animationFrame = 0;

  let last =
    performance.now();

  const isMobile =
    () => innerWidth < 700;

  const particleCount =
    () =>
      Math.max(
        7,
        Math.min(
          isMobile()
            ? 14
            : 24,
          Math.round(
            Math.max(
              320000,
              innerWidth *
                innerHeight
            ) / 115000
          )
        )
      );

  function makeParticle(
    initial
  ) {

    const petal =
      Math.random() > 0.26;

    return {

      x:
        Math.random() *
        width,

      y:
        initial
          ? Math.random() *
            height
          : -20 -
            Math.random() *
              90,

      size:
        petal
          ? 2.1 +
            Math.random() *
              3.4
          : 0.8 +
            Math.random() *
              1.7,

      speed:
        0.13 +
        Math.random() *
          0.31,

      drift:
        0.16 +
        Math.random() *
          0.34,

      phase:
        Math.random() *
        Math.PI *
        2,

      rotation:
        Math.random() *
        Math.PI *
        2,

      spin:
        (
          Math.random() -
          0.5
        ) * 0.006,

      opacity:
        0.18 +
        Math.random() *
          0.3,

      petal
    };
  }

  function resize() {

    width =
      innerWidth;

    height =
      innerHeight;

    dpr =
      Math.min(
        devicePixelRatio || 1,
        1.5
      );

    canvas.width =
      Math.round(
        width * dpr
      );

    canvas.height =
      Math.round(
        height * dpr
      );

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    const target =
      particleCount();

    while (
      particles.length <
      target
    ) {

      particles.push(
        makeParticle(true)
      );
    }

    if (
      particles.length >
      target
    ) {

      particles.length =
        target;
    }
  }

  function draw(p) {

    ctx.save();

    ctx.translate(
      p.x,
      p.y
    );

    ctx.rotate(
      p.rotation
    );

    ctx.globalAlpha =
      p.opacity;

    ctx.fillStyle =
      p.petal
        ? 'rgba(246,226,193,.9)'
        : 'rgba(255,248,237,.88)';

    ctx.beginPath();

    if (p.petal) {

      ctx.ellipse(
        0,
        0,
        p.size * 1.45,
        p.size * 0.72,
        0,
        0,
        Math.PI * 2
      );

    } else {

      ctx.arc(
        0,
        0,
        p.size,
        0,
        Math.PI * 2
      );
    }

    ctx.fill();

    ctx.restore();
  }

  function animate(now) {

    const delta =
      Math.min(
        32,
        now - last
      );

    last = now;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    const wind =
      isMobile()
        ? 0.34
        : 0.52;

    particles.forEach(
      particle => {

        particle.y +=
          particle.speed *
          delta;

        particle.x +=
          Math.sin(
            now * 0.00035 +
            particle.phase
          ) *
            wind +
          particle.drift *
            0.055;

        particle.rotation +=
          particle.spin *
          delta;

        if (
          particle.y >
            height + 30 ||
          particle.x <
            -60 ||
          particle.x >
            width + 60
        ) {

          Object.assign(
            particle,
            makeParticle(false)
          );
        }

        draw(particle);
      }
    );

    animationFrame =
      requestAnimationFrame(
        animate
      );
  }

  resize();

  window.addEventListener(
    'resize',
    resize,
    {
      passive: true
    }
  );

  animationFrame =
    requestAnimationFrame(
      animate
    );

  window.addEventListener(
    'pagehide',
    () => {

      cancelAnimationFrame(
        animationFrame
      );

    },
    {
      once: true
    }
  );

})();