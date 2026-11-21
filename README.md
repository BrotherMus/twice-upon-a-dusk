# twice-upon-a-dusk

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/BrotherMus/twice-upon-a-dusk/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/BrotherMus/twice-upon-a-dusk/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Twice Upon a Dusk** is an original spot the difference game for the desktop browser: two near-identical evening pictures side by side, five hand-coded scenes (a harbour, a lantern market, a mountain teahouse, a clockmaker's attic and a koi garden), 35 differences that are reshuffled on every visit, a ticking clock, hints, streaks, a magnifying loupe and stars. Every picture is painted by code and every sound is synthesised; no images, fonts or network requests.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Click a difference in either picture (or move the cursor with the arrow keys / WASD and press Enter). H gives a hint, hold Z (or the right mouse button) for the loupe, P pauses, M mutes.

`MAKEFUN_OUTPUT_DIR=out node main.ts` hands the game in: it copies `game/` and `screenshots/` to `out/` and writes the dossier.

## How it is built

| File | Job |
| --- | --- |
| `game/src/scenes.js` | the five scenes: backdrop painters and their props |
| `game/src/props.js` | the prop painter: every object a difference can hide in |
| `game/src/differences.js` | picks and applies each visit's differences and their hit circles |
| `game/src/game.js` | rules: clock, finds, misses, streaks, hints, stars |
| `game/src/panels.js` | the two framed pictures, markers, hint ring, twin cursor, loupe |
| `game/src/hud.js` | counter, timer bar, hint lamp, legend, low-time pulse |
| `game/src/screens.js` | title, intro, pause, scene clear, time's up, journey end |
| `game/src/audio.js` | synthesised chimes, ticks and the music box |

---

<sub>Entered on [make.fun](https://make.fun/?ref=8jskxc5q&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
