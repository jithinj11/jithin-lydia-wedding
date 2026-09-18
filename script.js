(function () {
  const config = window.weddingConfig;
  const root = document.documentElement;
  let panels = Array.from(document.querySelectorAll(".panel"));
  const openButton = document.getElementById("openInvitation");
  const musicToggle = document.getElementById("musicToggle");
  const music = document.getElementById("weddingMusic");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let opened = false;
  let activeIndex = 0;
  let storyTimer = null;
  let resumeTimer = null;
  let sceneStartedAt = 0;
  let sceneRemaining = 0;
  let storyPaused = false;
  let started = false;

  applyTheme();
  hydrateContent();
  setupOptionalScenes();
  setupImages();
  setupObserver();
  setupCountdown();
  setupControls();

  function applyTheme() {
    Object.entries(config.theme).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
    root.style.setProperty("--speed", String(config.animation.handwritingSpeed || 1));
  }

  function hydrateContent() {
    setText("openingVerse", splitVerse(config.bibleVerses.opening.text));
    setText("openingRef", config.bibleVerses.opening.reference);
    setText("celebrationVerse", splitVerse(config.bibleVerses.celebration.text));
    setText("celebrationRef", config.bibleVerses.celebration.reference);
    setText("displayDate", config.wedding.displayDate.toUpperCase());
    setText("ceremonyDay", config.ceremony.day);
    setText("ceremonyDate", config.ceremony.date);
    setText("ceremonyTime", config.ceremony.time);
    setText("ceremonyVenue", config.ceremony.venue);
    setText("ceremonyLocation", config.ceremony.location);
    setText("receptionDate", config.reception.date);
    setText("receptionTime", config.reception.time);
    setText("receptionVenue", config.reception.venue);
    setText("receptionLocation", config.reception.location);
    setText("signature", `${config.couple.groom} & ${config.couple.bride}`);
    setParents("groomParents", config.family.groomParents);
    setParents("brideParents", config.family.brideParents);
    setLocation("ceremonyMaps", config.ceremony.mapsUrl);
    setLocation("receptionMaps", config.reception.mapsUrl);

    if (config.music.source) {
      music.src = config.music.source;
      music.load();
    }
    if (!config.music.enabled) musicToggle.hidden = true;
  }

  function setText(key, text) {
    document.querySelectorAll(`[data-config="${key}"]`).forEach((node) => {
      node.innerHTML = text;
    });
  }

  function setParents(key, names) {
    const fallback = "[Father's Name]<br>[Mother's Name]";
    setText(key, names && names.length ? names.map(escapeHtml).join("<br>") : fallback);
  }

  function setLocation(key, url) {
    document.querySelectorAll(`[data-config="${key}"]`).forEach((link) => {
      if (url) {
        link.href = url;
      } else {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
      }
    });
  }

  function splitVerse(text) {
    return escapeHtml(text).replace(/,\s+/g, ",<br>").replace(/\.\s+/g, ".<br>");
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function setupImages() {
    document.querySelectorAll("[data-image]").forEach((node) => {
      const image = config.images[node.dataset.image];
      if (image) node.style.backgroundImage = `url("${image}")`;
    });
  }

  function setupOptionalScenes() {
    const familyScene = document.getElementById("family");
    if (familyScene && !config.familyBlessings?.enabled) {
      familyScene.hidden = true;
      panels = panels.filter((panel) => panel !== familyScene);
    }
  }

  function setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const panel = entry.target;
        panel.classList.add("active");
        activeIndex = panels.indexOf(panel);
        if (panel.id === "hero") settleDrawnNames();
      });
    }, { threshold: 0.58 });

    panels.forEach((panel) => observer.observe(panel));
  }

  function setupControls() {
    openButton.addEventListener("click", async () => {
      opened = true;
      started = true;
      document.body.classList.add("film-mode");
      panels[0].classList.add("active");
      await startMusic();
      playScene(1);
    });

    musicToggle.addEventListener("click", async () => {
      if (!config.music.source) return;
      if (music.paused) {
        await startMusic();
      } else {
        music.pause();
        musicToggle.setAttribute("aria-pressed", "false");
      }
    });

    music.addEventListener("error", () => musicToggle.setAttribute("aria-pressed", "false"));
    window.addEventListener("wheel", blockViewerScroll, { passive: false });
    window.addEventListener("touchmove", blockViewerScroll, { passive: false });
    window.addEventListener("keydown", blockViewerKeys);
    ["pointerdown", "touchstart"].forEach((eventName) => {
      window.addEventListener(eventName, () => {
        if (started) pauseForInteraction();
      }, { passive: true });
    });
  }

  async function startMusic() {
    if (!config.music.enabled || !config.music.source) return;
    try {
      await music.play();
      musicToggle.setAttribute("aria-pressed", "true");
    } catch (error) {
      musicToggle.setAttribute("aria-pressed", "false");
    }
  }

  function scrollToPanel(index) {
    if (!panels[index]) return;
    activeIndex = index;
    panels[index].classList.add("active");
    panels[index].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function playScene(index) {
    if (!panels[index]) return;
    clearTimeout(storyTimer);
    storyPaused = false;
    document.body.classList.remove("story-paused");
    activeIndex = index;
    scrollToPanel(index);
    const key = panels[index].dataset.key;
    const duration = config.animation.sceneDuration[key];
    if (!duration) return;
    sceneRemaining = duration;
    sceneStartedAt = performance.now();
    scheduleAdvance();
  }

  function scheduleAdvance() {
    clearTimeout(storyTimer);
    if (storyPaused || !sceneRemaining) return;
    storyTimer = window.setTimeout(() => playScene(activeIndex + 1), sceneRemaining);
  }

  function pauseForInteraction() {
    clearTimeout(resumeTimer);
    if (!storyPaused) {
      const elapsed = performance.now() - sceneStartedAt;
      sceneRemaining = Math.max(0, sceneRemaining - elapsed);
      clearTimeout(storyTimer);
      storyPaused = true;
      document.body.classList.add("story-paused");
    }
    resumeTimer = window.setTimeout(() => {
      storyPaused = false;
      document.body.classList.remove("story-paused");
      sceneStartedAt = performance.now();
      if (sceneRemaining <= 0) {
        playScene(activeIndex + 1);
        return;
      }
      scheduleAdvance();
    }, config.animation.interactionResumeDelay || 2000);
  }

  function blockViewerScroll(event) {
    if (started) event.preventDefault();
  }

  function blockViewerKeys(event) {
    if (!started) return;
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      event.preventDefault();
    }
  }

  function settleDrawnNames() {
    window.setTimeout(() => {
      document.querySelectorAll(".draw-name").forEach((node) => node.classList.add("done"));
    }, 7600 * (config.animation.handwritingSpeed || 1));
  }

  function setupCountdown() {
    const target = new Date(`${config.wedding.date}T${config.wedding.time}:00`);
    const units = {
      days: document.querySelector('[data-unit="days"]'),
      hours: document.querySelector('[data-unit="hours"]'),
      minutes: document.querySelector('[data-unit="minutes"]'),
      seconds: document.querySelector('[data-unit="seconds"]')
    };
    const grid = document.getElementById("countGrid");
    const message = document.getElementById("completeMessage");
    message.textContent = config.countdownCompleteMessage;

    function tick() {
      const remaining = target.getTime() - Date.now();
      if (remaining <= 0) {
        grid.hidden = true;
        message.hidden = false;
        return;
      }
      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      units.days.textContent = String(days).padStart(2, "0");
      units.hours.textContent = String(hours).padStart(2, "0");
      units.minutes.textContent = String(minutes).padStart(2, "0");
      units.seconds.textContent = String(seconds).padStart(2, "0");
    }

    tick();
    window.setInterval(tick, 1000);
  }
}());
