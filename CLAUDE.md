# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

No build step. Open directly or serve locally:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
open index.html               # macOS direct open
```

## Architecture

Vanilla JS, HTML5 Canvas, no dependencies, no bundler.

**Script load order in `index.html` matters** — each plugin file wraps its own globals in an IIFE and monkey-patches functions defined in `game.js`. Scripts must load in this order:

1. `game.js` — core engine; exports globals (`board`, `current`, `score`, `lines`, `level`, `paused`, `gameOver`, `drawBlock`, `drawGrid`, `draw`, `drawNext`, `init`, `endGame`, `togglePause`, `updateHUD`, `ghostY`, `maxLinesInOneDrop`, `maxLinesEver`, `canvas`, `ctx`, `COLS`, `ROWS`, `BLOCK`, `COLORS`)
2. `skins.js` — replaces `drawBlock` and `drawGrid` globals; persists choice in `localStorage` (`tetris.skin.v1`)
3. `records.js` — wraps `endGame`; persists top-5 in `localStorage` (`tetris.records.v1`)
4. `pause.js` — wraps `init` and `togglePause`; persists starting level in `localStorage` (`tetris.pause.v1`)

**Plugin pattern:** each `.js` file captures the original function (`const _orig = fn`), then reassigns the global (`fn = function() { ... _orig() ... }`). This is intentional — adding a new plugin follows the same pattern.

**Shared overlay:** `game.js` owns `#overlay` with `.overlay-box` inside. The plugins add `.overlay-pause` and `.overlay-records` as sibling `.overlay-screen` divs. Each plugin hides siblings and shows its own screen by toggling `.hidden` on `.overlay-screen` elements and the `.overlay-box`.

**Board model:** 2D array `board[row][col]` where `0` = empty and `1–7` = piece color index. Piece color indices align with `COLORS[]` and are overwritten in-place by each skin via `COLORS[i] = skin.colors[i]`.

**Speed formula:** `dropInterval = Math.max(100, 1000 - (level - 1) * 90)` ms. Level increments every 10 lines.

## CSS files

Each feature area has its own stylesheet loaded in `index.html`:
- `style.css` — base dark/retro theme
- `skins.css` — skin selector sidebar UI
- `records.css` — records list and overlay table
- `pause.css` — pause menu overlay screen
