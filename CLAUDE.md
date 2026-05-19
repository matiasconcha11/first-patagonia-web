# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the site locally

```bash
# Start a local server (requires Ruby, available on macOS)
ruby -run -e httpd . -p 8080
# Then open http://localhost:8080
```

The `.claude/launch.json` is configured to use `ruby -run -e httpd` on port 8080. The preview tool can start it via `preview_start "First Patagonia"`. Note: macOS sandbox blocks Ruby from serving `~/Desktop` paths — open HTML files directly in the browser via `open filename.html` as a workaround.

## Architecture

Pure static site — no build step, no framework, no CMS. Three files drive everything:

- **`css/style.css`** — Single global stylesheet with a CSS custom properties design system. All pages share it.
- **`js/main.js`** — Single JS file loaded by every page. Contains all interactive logic.
- **`index.html`** + 7 sibling HTML pages — Each page is self-contained; nav and footer are copy-pasted (no templating). Some pages (`lodge.html`, `actividades.html`) have additional `<style>` blocks inline for page-specific layout.

### Design system (css/style.css)

Key tokens:
```css
--orange: #E8521A   /* brand accent — naranja eléctrico */
--teal:   #00B8A9   /* second accent — turquesa lago */
--black:  #0A0A0A
--white:  #F5F2EC
--font-serif: 'Cormorant Garamond'   /* headings */
--font-sans:  'Jost'                  /* body */
```

h1 uses `clamp(3.5rem, 9vw, 8rem)` at `font-weight: 400`. All section wrappers use `.section` + `.section__inner`. Dark backgrounds use `.section--dark`, light gray `.section--gray`. Teal (`--teal`) is used for `em` tags inside dark sections and category labels. Orange (`--orange`) is used for CTAs, labels, and hover accents.

Buttons use a **sweep animation** via `::before` pseudo-element (`transform: scaleX(0→1)`). All buttons have `border-radius: 0` (sharp edges). `.btn--orange` has an orange glow shadow on hover.

### JS modules in main.js

`main.js` is one file with clearly labeled `/* --- Section --- */` comments:

1. **WhatsApp injector** — IIFE that appends `.whatsapp-btn` (fixed bottom-left) to every page. Message: `¡Hola! Quiero vivir la Patagonia Norte con First Patagonia 🏔️ ¿Cuándo podemos comenzar la aventura?`
2. **House music engine** (`initMusic`) — Web Audio API, 124 BPM deep house synth. Four-on-the-floor kick, acid bass (sawtooth + resonant LP Q=12), piano stabs, arpeggiator. Chord loop: Am7–Fmaj7–Dm7–E7. Lookahead scheduler (50 ms tick). Triggered by `#audioToggle` button.
3. **Hero video controller** — Clips playback between `START=53` and `END=75` seconds of `assets/hero.mp4`. Uses `timeupdate` event to loop within that window.
4. **Lodge video controller** (`initLodgeVideos`) — Controls `#lodgeCardVideo` (index.html engine card) and `#lodgeHeroVideo` (lodge.html page hero). Both loop between `START=6` and `END=12` seconds of `assets/lodge.mp4`.
5. **Heli video controller** (`initHeliVideo`) — Controls `#heliCardVideo` (index.html Programas engine card). Loops from `START=17` to end with a smooth upward pan via `requestAnimationFrame` + lerp (`factor=0.04`). Fades to black between loops using an injected overlay div. `POS_FROM=55%`, `POS_TO=5%`.
6. **Lago sunset video** (`initLagoVideo`) — Controls `#lagoSunsetVideo` (actividades.html Lago terrain hero). Loop: seconds 42–46.
7. **Nav scroll** — Adds `.scrolled` class to `#nav` after 80px scroll.
8. **Fade-up animations** — IntersectionObserver on `.fade-up` elements.
9. **Program filter** — Filters `.program-card` elements by `data-tag` attribute on index.html.
10. **Accordion** — `.accordion` expand/collapse on planifica.html.
11. **Terrain tabs** — Sticky nav tabs in `actividades.html` for Lago/Río/Montaña/Bosque terrain sections.
12. **Smooth scroll** — `[data-scroll]` anchor links.

### Pages

| File | Content |
|------|---------|
| `index.html` | Home: manifesto quote + 3 engine cards (Lodge/Paso/Programas) + terrenos + programs |
| `lodge.html` | Rooms editorial grid, Cabañas, Restaurante Amancay, wellness |
| `actividades.html` | Sticky terrain tabs (Lago/Río/Montaña/Bosque), inline `<style>` for terrain layout |
| `programas.html` | 8 programs + 2 expedition cards |
| `paso-vuriloche.html` | Real 8-day Paso Vuriloche itinerary + logistics |
| `espiritupionero.html` | Brand manifesto, family history, Museo Pioneros |
| `planifica.html` | Season guide, packing list, FAQ accordion, contact form |
| `sobre.html` | Numbers bar, mission, brand ecosystem, team, certifications |

### index.html structure (key sections in order)

1. Nav
2. Hero (full-screen video, `assets/hero.mp4`)
3. **Manifesto** — Franz Schirmer quote centered on dark bg, teal highlights on `<em>`, 4 stats bar
4. **Engines** — asymmetric grid: Lodge card (full left col, `#lodgeCardVideo`) + right col: Paso Vuriloche + Programas (`#heliCardVideo` with rAF pan)
5. Pioneer banner (1914—2025 timeline)
6. Terrenos (4-quadrant: Lago/Río/Montaña/Bosque)
7. Programs preview with filter buttons
8. Booking banner → footer

### lodge.html rooms system

No tab system — all rooms shown at once in editorial grid:
- **Habitaciones del Lodge** (gray bg, `rooms-grid--3`): Standard Matrimonial, Standard Twin ×6, Triple
- **Habitaciones Superiores** (gray bg, `rooms-grid--3`): Superior King ×7 (badge "Más solicitada"), Superior Twin ×3, Suite
- **Cabañas Frente al Lago** (dark bg, `cabanas-grid`): Tineo (4p), Canelo (7p), Arrayán (7p), Ulmo (8p)
- Navigation bar `.rooms-nav` with anchor links to `#habitaciones` and `#cabanas`

### Reservations — GoFeels URL patterns

```
Rooms:      https://reservation.gofeels.com/es/room-detail/{ID}?CLP
Programs:   https://reservation.gofeels.com/es/package-detail/{ID}?CLP&token=c1b1d4d2-d466-4219-bd31-54ea0eeb95b7
Activities: https://reservation.gofeels.com/es/extra-detail/{ID}?CLP&token=c1b1d4d2-d466-4219-bd31-54ea0eeb95b7
General:    https://reservation.gofeels.com/es/reservation/?CLP&token=c1b1d4d2-d466-4219-bd31-54ea0eeb95b7&rooms
```
The constant `GOFEELS` in `main.js` holds the general URL. Activity extra-detail IDs may not yet be active in GoFeels — verify in admin panel before linking.

### Assets

All media lives in `assets/` as symlinks to source files in `Imagnes /` subfolders.

**Videos:**
- `assets/hero.mp4` → `FULL VIDEOS  FIR$T PATAGONIA VERTICAL.mp4` (root). Loop: 53–75s.
- `assets/lodge.mp4` → `Imagnes /Hotel/DJI_20260219235908_0001_D.MP4`. Loop: 6–12s. `object-position: center 28%`.
- `assets/heli.mp4` → `Imagnes /Experiencias/heli salida (2).MP4`. Loop: 17s→end with rAF upward pan.
- `assets/lago-sunset.mp4` → `Imagnes /Experiencias/sun set grupo warren (4).MP4`. Loop: 42–46s.

**Room images (lodge.html):**
- `hab-matrimonial-std.jpg` → Standard Matrimonial
- `hab-twin-std.jpg` → Standard Twin
- `hab-suite.jpg` → Triple
- `hab-matrimonial-sup.jpg` → Superior King
- `hab-twin-sup.jpg` → Superior Twin
- `hab-suite-superior.jpg` → Suite Superior
- `restaurante.jpg` → Restaurante Amancay

**Activity images (actividades.html):**
- `act-kayak-lago.jpg` → Kayak en el Lago
- `act-rafting.jpg` → Rafting Clase III/IV
- `act-trekking.jpg` → Trek Paso Desolación + Trek Rincón Los Alerces
- `act-escalada.jpg` → Escalada en Roca
- `act-heli.jpg` → Vuelo en Helicóptero

**Cabin images:** pending — `Imagnes /Cabañas /` is empty. Placeholders remain in lodge.html.

### Key facts (do not invent or alter)

- **Franz Schirmer** = 4ª generación, CEO, built the two refugios on Paso Vuriloche, opened the route to tourism in 1998
- **Matías Schirmer** = 5ª generación, hijo de Franz, current Director General
- Lodge address: Ruta 225 Km 58, Petrohué, inside Parque Nacional Vicente Pérez Rosales
- Contact: reservas@petrohue.com · +56 9 8464 4870
- Paso Vuriloche: 50.1 km, 2.052 m desnivel+, 8 días/7 noches
- WhatsApp: +56 9 8464 4870 (`https://wa.me/56984644870`)
- Volcán Osorno is NOT described as "active" — avoid that word (concerns European visitors)
