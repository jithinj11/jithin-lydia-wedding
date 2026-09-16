const cfg = window.WEDDING_CONFIG || {};

const beginBtn = document.getElementById("beginBtn");
beginBtn?.addEventListener("click", () => {
  document.body.classList.add("started");
  document.querySelector(".story")?.scrollIntoView({behavior:"smooth"});
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("ready");
  });
}, {threshold:.12});

document.querySelectorAll(".hero-content,.paper-section,.event-card,.venue-copy,.photo-copy").forEach(el => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

function formatDate(dateString) {
  if (!dateString) return "Wedding Date";
  const d = new Date(dateString + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "Wedding Date";
  return new Intl.DateTimeFormat("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  }).format(d);
}

const formattedDate = formatDate(cfg.weddingDate);
document.getElementById("ceremonyDate").textContent = formattedDate;
document.getElementById("receptionDate").textContent = formattedDate;
document.getElementById("ceremonyTime").textContent = cfg.ceremonyTime || "Ceremony Time";
document.getElementById("receptionTime").textContent = cfg.receptionTime || "Reception Time";

function tick() {
  if (!cfg.weddingDate) return;
  const target = new Date(`${cfg.weddingDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return;
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    ["days","hours","minutes","seconds"].forEach(id => document.getElementById(id).textContent = "0");
    return;
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = String(hours).padStart(2,"0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2,"0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2,"0");
  document.getElementById("dateNote").textContent = `Until ${formattedDate}`;
}
tick();
setInterval(tick,1000);

/* Replace image placeholders with real local photos when the files exist. */
document.querySelectorAll("[data-image]").forEach(el => {
  const src = el.dataset.image;
  const img = new Image();
  img.onload = () => {
    el.style.backgroundImage = `url("${src}")`;
    el.classList.remove("image-placeholder");
  };
  img.src = src;
});
