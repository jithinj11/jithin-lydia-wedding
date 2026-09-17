(() => {
  "use strict";

  const cfg = window.weddingConfig;
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function text(id, value) {
    const el = $(id);
    if (el) el.textContent = value || "";
  }

  function setLink(id, url) {
    const el = $(id);
    if (!el) return;
    if (url) {
      el.href = url;
      el.style.display = "inline-block";
    } else {
      el.removeAttribute("href");
      el.style.display = "none";
    }
  }

  function setupContent() {
    text("openingVerseText", cfg.bibleVerses.opening.text);
    text("openingVerseRef", cfg.bibleVerses.opening.reference);

    text("groomName", cfg.couple.groom);
    text("brideName", cfg.couple.bride);
    text("heroNames", `${cfg.couple.groom} & ${cfg.couple.bride}`);
    text("heroDate", cfg.wedding.displayDate);

    text("storyHeading", cfg.story.heading);
    text("storyText", cfg.story.text);

    text("ceremonyTitle", cfg.ceremony.title);
    text("ceremonyDate", cfg.ceremony.date);
    text("ceremonyTime", cfg.ceremony.time);
    text("ceremonyVenue", cfg.ceremony.venue);
    text("ceremonyLocation", cfg.ceremony.location);
    setLink("ceremonyMap", cfg.ceremony.mapsUrl);

    text("receptionTitle", cfg.reception.title);
    text("receptionDate", cfg.reception.date);
    text("receptionTime", cfg.reception.time);
    text("receptionVenue", cfg.reception.venue);
    text("receptionLocation", cfg.reception.location);
    setLink("receptionMap", cfg.reception.mapsUrl);

    text("celebrationVerseText", cfg.bibleVerses.celebration.text);
    text("celebrationVerseRef", cfg.bibleVerses.celebration.reference);

    text("groomParents", cfg.family.groomParents.length ? cfg.family.groomParents.join(" • ") : "Names to be added");
    text("brideParents", cfg.family.brideParents.length ? cfg.family.brideParents.join(" • ") : "Names to be added");

    text("finalVerseText", cfg.bibleVerses.final.text);
    text("finalVerseRef", cfg.bibleVerses.final.reference);
    text("closingNames", `${cfg.couple.groom} & ${cfg.couple.bride}`);
    text("closingDate", cfg.wedding.displayDate);

    const hero = document.querySelector(".hero");
    const churchBg = document.querySelectorAll(".church-bg");
    if (cfg.images.hero) hero.style.backgroundImage =
      `linear-gradient(rgba(20,20,17,.25), rgba(20,20,17,.6)), url("${cfg.images.hero}")`;

    churchBg.forEach(el => {
      if (cfg.images.church) el.style.backgroundImage =
        `linear-gradient(transparent, rgba(105,112,93,.13)), url("${cfg.images.church}")`;
    });

    if (cfg.images.couple) $("couplePhoto").src = cfg.images.couple;

    const receptionImage = $("receptionImage");
    if (cfg.images.reception) receptionImage.src = cfg.images.reception;

    const photoStory = $("photoStory");
    photoStory.innerHTML = "";
    (cfg.images.story || []).forEach((src, i) => {
      const img = document.createElement("img");
      img.className = "photo reveal";
      img.loading = "lazy";
      img.alt = `Wedding memory ${i + 1}`;
      img.src = src;
      photoStory.appendChild(img);
    });

    document.documentElement.style.setProperty("--bg", cfg.theme.background);
    document.documentElement.style.setProperty("--paper", cfg.theme.paper);
    document.documentElement.style.setProperty("--text", cfg.theme.text);
    document.documentElement.style.setProperty("--muted", cfg.theme.muted);
    document.documentElement.style.setProperty("--gold", cfg.theme.gold);
    document.documentElement.style.setProperty("--olive", cfg.theme.olive);
  }

  let autoPlay = Boolean(cfg.animation.autoScroll) && !reducedMotion;
  let opened = false;
  let autoTimer = null;
  let userPauseTimer = null;
  let currentIndex = 0;

  const sections = Array.from(document.querySelectorAll(".section"));

  function clearAutoTimer() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function scheduleNext() {
    clearAutoTimer();
    if (!autoPlay || !opened || currentIndex >= sections.length - 1) return;

    const section = sections[currentIndex];
    const key = section.dataset.delay || "story";
    const delay = Number(cfg.animation.sectionDelay[key]) || 7000;

    autoTimer = setTimeout(() => {
      if (!autoPlay) return;
      currentIndex += 1;
      sections[currentIndex].scrollIntoView({ behavior: "smooth", block: "start" });
      scheduleNext();
    }, delay);
  }

  function pauseForInteraction() {
    if (!opened) return;
    autoPlay = false;
    clearAutoTimer();
    $("autoControl").textContent = "AUTO • OFF";

    clearTimeout(userPauseTimer);
    userPauseTimer = setTimeout(() => {
      if (!reducedMotion && opened) {
        autoPlay = true;
        $("autoControl").textContent = "AUTO • ON";
        scheduleNext();
      }
    }, 4500);
  }

  $("autoControl").addEventListener("click", () => {
    clearTimeout(userPauseTimer);
    autoPlay = !autoPlay;
    $("autoControl").textContent = autoPlay ? "AUTO • ON" : "AUTO • OFF";
    if (autoPlay) scheduleNext();
    else clearAutoTimer();
  });

  ["wheel", "touchstart", "touchmove", "pointerdown", "keydown"].forEach(type => {
    window.addEventListener(type, (event) => {
      if (type === "keydown" && ["Tab", "Shift", "Control", "Alt", "Meta"].includes(event.key)) return;
      pauseForInteraction();
    }, { passive: true });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        if (entry.target.id === "names") entry.target.classList.add("play");

        const idx = sections.indexOf(entry.target);
        if (idx >= 0 && idx !== currentIndex) {
          currentIndex = idx;
          if (opened && autoPlay) scheduleNext();
        }
      }
    });
  }, { threshold: 0.38 });

  sections.forEach(s => observer.observe(s));

  $("openInvitation").addEventListener("click", () => {
    if (opened) return;
    opened = true;
    $("opening").classList.add("visible");
    $("openingVerse").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });

    const audio = $("weddingMusic");
    if (cfg.music.enabled && cfg.music.source) {
      audio.src = cfg.music.source;
      audio.play().then(() => {
        $("musicControl").textContent = "❚❚";
      }).catch(() => {
        $("musicControl").textContent = "♫";
      });
    }

    currentIndex = 1;
    scheduleNext();
  });

  $("musicControl").addEventListener("click", () => {
    const audio = $("weddingMusic");
    if (!audio.src && cfg.music.source) audio.src = cfg.music.source;
    if (!audio.src) return;

    if (audio.paused) {
      audio.play().then(() => $("musicControl").textContent = "❚❚").catch(() => {});
    } else {
      audio.pause();
      $("musicControl").textContent = "♫";
    }
  });

  function countdown() {
    const target = new Date(`${cfg.wedding.date}T${cfg.wedding.time}:00`);
    const now = new Date();
    let diff = target.getTime() - now.getTime();

    if (!Number.isFinite(diff) || diff <= 0) {
      text("days", "0");
      text("hours", "0");
      text("minutes", "0");
      text("seconds", "0");
      text("countdownMessage", "TODAY, TWO HEARTS BECOME ONE.");
      return;
    }

    const days = Math.floor(diff / 86400000);
    diff %= 86400000;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    text("days", String(days).padStart(2, "0"));
    text("hours", String(hours).padStart(2, "0"));
    text("minutes", String(minutes).padStart(2, "0"));
    text("seconds", String(seconds).padStart(2, "0"));
    text("countdownMessage", "");
  }

  setupContent();
  countdown();
  setInterval(countdown, 1000);
})();