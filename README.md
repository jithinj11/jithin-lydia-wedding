# Jithin & Lydia — Premium Cinematic Wedding Invitation

GitHub Pages-ready, full-screen, non-scrolling Christian wedding invitation.

## Included
- Cinematic scene engine with automatic progression
- Pointer/touch depth response and interaction ripple
- Tap/click pause with automatic resume after 2 seconds
- Wheel/touch-scroll blocking while the film is playing
- Scripture, hero, Holy Matrimony, reception, optional family blessings, countdown and closing
- Scene-specific Google Maps links
- Image preloading for smoother transitions
- Open Graph/Twitter sharing metadata and favicon
- Optional music hook that starts only after OPEN INVITATION and pauses with the film
- Mobile and reduced-motion handling

## Personal photos
`assets/images/couple-photo-placeholder.png` is a replaceable slot. Replace it with a real couple photo if desired and update `config.js` (`images.heroPhoto`). The current bundled hero is a cinematic placeholder, not a real photograph of the couple.

## Music
Set `music.enabled:true` and put the desired file at `assets/music/wedding.mp3` (or change `music.source`). The browser will only attempt playback after the visitor taps OPEN INVITATION.

## Deploy
Upload the contents of this folder to a GitHub Pages repository. No build step is required.
