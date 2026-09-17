# Jithin & Lydia Wedding Invitation

A GitHub Pages-ready Christian wedding invitation website built with HTML, CSS, and vanilla JavaScript.

## Files

- `index.html` contains the nine invitation sections.
- `style.css` contains the responsive cinematic layout and animations.
- `script.js` powers configuration hydration, auto-scroll, controls, countdown, and music.
- `config.js` is the central place to edit names, dates, verses, venues, map links, images, music, and animation timing.

## Customizing

Edit `config.js`:

- Add Google Maps URLs in `ceremony.mapsUrl` and `reception.mapsUrl`.
- Replace image URLs in `images` with local files such as `assets/images/hero.jpg`.
- Add a music file in `assets/music/` and set `music.source`.
- Replace family placeholders by adding parent names to `family.groomParents` and `family.brideParents`.

The site has no build step. Open `index.html` locally or publish the folder with GitHub Pages.
