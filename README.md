# Vakfiye · The Waqf Game

> *"Found your waqf, leave it to the centuries."*

**Vakfiye** is a strategy game about Ottoman-era waqfs (charitable foundations). You found a waqf and try to keep it standing for **600 years** through disasters, crises and hard choices. The game runs from one codebase on the web (PWA) and on Android (Capacitor).

This repository holds the game itself. It was built for the **KÖK&KOD Hackathon** by team **Tekinoğlu Fırın**: Rabia Altundal, Eda Nur Polat and Feyza Biber.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine acceptance tests + balance test
npm run build      # outputs dist/ (web + PWA)
```

### Android APK

```bash
npm run build
npx cap add android      # first time only
npx cap sync android
npx cap open android     # then in Android Studio: Build > Build APK
```

---

## Language

The game is playable in **Turkish and English**. You pick **Türkçe / English** on the main menu (the first screen) and in Settings. The choice is saved on the device.

- **UI strings** are written inline in both languages: `L('Türkçe', 'English')` (see `src/dil.ts`).
- **Data objects** (levels, buildings, guilds, disaster questions) are translated with `iki(trObject, { field: 'English' })`.
- **Quiz questions in English** live in `src/veri/sorularEn.ts`.
- **Rules in English** are in `docs/RULES.md`. The Turkish rules are in `docs/KURALLAR.md`.
- **Monument names** that come from the inventory keep their original Turkish names.

When you add new text, write both languages at the same time. `src/veri/sorularEn.test.ts` fails if any question has no English translation.

---

## Project structure

```
docs/                 Rules (v2), page-by-page content, screenshots. See docs/README.md
araclar/              Python balance simulation (denge_sim.py)
src/motor/            Game engine. Pure TypeScript, never touches the screen.
  sabitler.ts         All numbers. Balance tuning happens here and only here.
  rng.ts              Seeded randomness (mulberry32).
  motor.ts            yeniOyun, turOyna, kararVer, sonucKarti, botlaOyna
  motor.test.ts       Acceptance tests from section 9 of the rules
  denge.test.ts       1000-seed balance test: do the four lessons point the right way?
src/sahne/            Village scene. Display only, no calculations.
  koySvg.ts           2D isometric village (fallback scene)
  KoySahnesi.tsx      Maps engine state to the scene, captures taps on buildings
src/arayuz/           Screens: Setup, Village HUD, Decision dialog, Result
src/App.tsx           Screen flow and the "advance until next decision" timer
```

### Layering rule

**engine → UI → scene.** The scene and UI never compute numbers. They only show the state the engine returns. When the 3D scene arrives, only `src/sahne/` changes.

---

## Rules and balance

- **Demo seed: `10`.** With the default settings the waqf reaches year 600 (21 events, 13 decisions, the treasury never runs empty). With the same seed and the hamam set to 70, the waqf collapses in year 160.
- **If you change any coefficient, run `npm test`.** If the balance test breaks, the game is teaching the wrong lesson.

---

## Design docs

- Player-facing rules, short version: [docs/KURALLAR.md](docs/KURALLAR.md) (TR) · [docs/RULES.md](docs/RULES.md) (EN). The in-game "How to play" page shows these.
- Rules, concepts, tutorial and the content of all 13 pages: [docs/sayfa-sayfa-icerik.md](docs/sayfa-sayfa-icerik.md)
- Screen flow: [docs/img/ekran-akisi.png](docs/img/ekran-akisi.png)

---

## Status

- [x] Engine and tests
- [x] Setup, Village, Decision and Result screens
- [x] 2D isometric village scene (fallback)
- [x] Main menu, tutorial, pause, how to play, settings, easy mode, stars and levels
- [x] Turkish / English language support
- [ ] 3D scene (React Three Fiber) and GLB assets

---

## Team

**Tekinoğlu Fırın**, KÖK&KOD Hackathon
Rabia Altundal · Eda Nur Polat · Feyza Biber
