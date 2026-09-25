'use strict';

// === PLUGINS ===

// === BEGIN SKINS === */
(function() {
  const STORAGE_KEY = 'tetris.skin.v1';

  // Capture the original drawBlock/drawGrid so we can refer to them and reset on the retro skin.
  // (We deliberately do not modify game.js; we just observe and replace at load time.)
  const _origDrawBlock = drawBlock;
  const _origDrawGrid = drawGrid;

  // ---------- Skin: Retro ----------
  // Square blocks, flat colors, 4px highlight at the top. This is the original look.
  const RETRO_COLORS = [
    null,
    '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784',
    '#e57373', '#90caf9', '#ffb74d',
  ];

  function retroDrawBlock(context, x, y, colorIndex, size, alpha) {
    if (!colorIndex) return;
    const color = RETRO_COLORS[colorIndex];
    context.globalAlpha = alpha ?? 1;
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    context.fillStyle = 'rgba(255,255,255,0.12)';
    context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
    context.globalAlpha = 1;
  }

  function retroDrawGrid() {
    ctx.strokeStyle = '#22222e';
    ctx.lineWidth = 0.5;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK, 0);
      ctx.lineTo(c * BLOCK, ROWS * BLOCK);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK);
      ctx.lineTo(COLS * BLOCK, r * BLOCK);
      ctx.stroke();
    }
  }

  // ---------- Skin: Neon ----------
  // Saturated blocks with a coloured glow on a black board; grid lines very faint.
  const NEON_COLORS = [
    null,
    '#00ffff', '#ffff33', '#ff44ff', '#33ff99',
    '#ff3366', '#6688ff', '#ffaa33',
  ];
  const NEON_BG = '#000000';
  const NEON_GRID = '#16162a';

  function neonDrawBlock(context, x, y, colorIndex, size, alpha) {
    if (!colorIndex) return;
    const color = NEON_COLORS[colorIndex];
    context.globalAlpha = alpha ?? 1;
    context.shadowBlur = 14;
    context.shadowColor = color;
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    context.shadowBlur = 0;
    context.globalAlpha = 1;
  }

  function neonDrawGrid() {
    ctx.fillStyle = NEON_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = NEON_GRID;
    ctx.lineWidth = 0.5;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK, 0);
      ctx.lineTo(c * BLOCK, ROWS * BLOCK);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK);
      ctx.lineTo(COLS * BLOCK, r * BLOCK);
      ctx.stroke();
    }
  }

  // ---------- Skin: Pastel ----------
  // Soft pastel blocks with rounded corners (drawn manually for browser compatibility).
  const PASTEL_COLORS = [
    null,
    '#a8e6cf', '#ffd3b6', '#dcd6f7', '#b5ead7',
    '#f3b5b5', '#c7ceea', '#ffdac1',
  ];

  function pastelFillRoundRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + w - radius, y);
    context.quadraticCurveTo(x + w, y, x + w, y + radius);
    context.lineTo(x + w, y + h - radius);
    context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    context.lineTo(x + radius, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill();
  }

  function pastelDrawBlock(context, x, y, colorIndex, size, alpha) {
    if (!colorIndex) return;
    const color = PASTEL_COLORS[colorIndex];
    context.globalAlpha = alpha ?? 1;
    const px = x * size + 1;
    const py = y * size + 1;
    const s = size - 2;
    context.fillStyle = color;
    pastelFillRoundRect(context, px, py, s, s, 5);
    // subtle highlight on top edge
    context.fillStyle = 'rgba(255,255,255,0.18)';
    pastelFillRoundRect(context, px, py, s, 4, 2);
    context.globalAlpha = 1;
  }

  function pastelDrawGrid() {
    ctx.strokeStyle = '#e6dff0';
    ctx.lineWidth = 0.5;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK, 0);
      ctx.lineTo(c * BLOCK, ROWS * BLOCK);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK);
      ctx.lineTo(COLS * BLOCK, r * BLOCK);
      ctx.stroke();
    }
  }

  // ---------- Skin: Pixel Art ----------
  // Chunky 3x3 checker overlay on each block to simulate dithered texture; bold retro palette.
  const PIXEL_COLORS = [
    null,
    '#3aafa9', '#f7c548', '#a06cd5', '#5cb85c',
    '#d9534f', '#5b6cd5', '#e89545',
  ];

  // Lighten or darken a hex colour by a fixed amount (rough & cheap — no library).
  function pixelShiftColor(hex, delta) {
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + delta));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + delta));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + delta));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function pixelDrawBlock(context, x, y, colorIndex, size, alpha) {
    if (!colorIndex) return;
    const color = PIXEL_COLORS[colorIndex];
    context.globalAlpha = alpha ?? 1;
    const px = x * size;
    const py = y * size;
    // base block (no margin to keep the "chunky" feel)
    context.fillStyle = color;
    context.fillRect(px, py, size, size);
    // inset border to suggest pixel-art framing
    context.fillStyle = pixelShiftColor(color, -50);
    context.fillRect(px, py, size, 2);
    context.fillRect(px, py + size - 2, size, 2);
    context.fillRect(px, py, 2, size);
    context.fillRect(px + size - 2, py, 2, size);
    // 3x3 checker overlay for texture
    const cell = Math.max(2, Math.floor(size / 5));
    const lighter = pixelShiftColor(color, 35);
    for (let yy = 0; yy < 3; yy++) {
      for (let xx = 0; xx < 3; xx++) {
        if ((xx + yy) % 2 === 0) {
          context.fillStyle = lighter;
          context.fillRect(px + 3 + xx * cell, py + 3 + yy * cell, cell - 1, cell - 1);
        }
      }
    }
    context.globalAlpha = 1;
  }

  function pixelDrawGrid() {
    ctx.strokeStyle = '#0a0a14';
    ctx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK, 0);
      ctx.lineTo(c * BLOCK, ROWS * BLOCK);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK);
      ctx.lineTo(COLS * BLOCK, r * BLOCK);
      ctx.stroke();
    }
  }

  // ---------- Registry ----------
  const SKINS = {
    retro: { name: 'Retro', colors: RETRO_COLORS, drawBlock: retroDrawBlock, drawGrid: retroDrawGrid },
    neon: { name: 'Neon', colors: NEON_COLORS, drawBlock: neonDrawBlock, drawGrid: neonDrawGrid },
    pastel: { name: 'Pastel', colors: PASTEL_COLORS, drawBlock: pastelDrawBlock, drawGrid: pastelDrawGrid },
    pixel: { name: 'Pixel Art', colors: PIXEL_COLORS, drawBlock: pixelDrawBlock, drawGrid: pixelDrawGrid },
  };

  // ---------- Apply / persist ----------
  function applySkin(name) {
    const skin = SKINS[name];
    if (!skin) return;
    // COLORS is a `const` array; reassigning its indices updates every reader (including the
    // ghost piece and the next-piece preview, which both go through drawBlock/drawNext).
    for (let i = 0; i < skin.colors.length; i++) {
      COLORS[i] = skin.colors[i];
    }
    drawBlock = skin.drawBlock;
    drawGrid = skin.drawGrid;
    try { localStorage.setItem(STORAGE_KEY, name); } catch (e) { /* non-fatal */ }
    // Re-render: draw() paints the board, drawNext() paints the preview.
    draw();
    drawNext();
  }

  // ---------- Sidebar UI ----------
  function buildSelector() {
    const container = document.getElementById('skin-buttons');
    if (!container) return;
    container.innerHTML = '';
    Object.entries(SKINS).forEach(([key, skin]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'skin-btn';
      btn.dataset.skin = key;

      const nameEl = document.createElement('span');
      nameEl.className = 'skin-btn-name';
      nameEl.textContent = skin.name;
      btn.appendChild(nameEl);

      const swatches = document.createElement('div');
      swatches.className = 'skin-btn-swatches';
      for (let i = 1; i < skin.colors.length; i++) {
        const sw = document.createElement('span');
        sw.className = 'skin-swatch';
        sw.style.background = skin.colors[i];
        swatches.appendChild(sw);
      }
      btn.appendChild(swatches);

      btn.addEventListener('click', () => {
        applySkin(key);
        markActive(key);
      });
      container.appendChild(btn);
    });
  }

  function markActive(activeName) {
    const container = document.getElementById('skin-buttons');
    if (!container) return;
    container.querySelectorAll('.skin-btn').forEach(b => {
      if (b.dataset.skin === activeName) b.classList.add('is-active');
      else b.classList.remove('is-active');
    });
  }

  // ---------- Init ----------
  function initSkins() {
    buildSelector();
    let stored = 'retro';
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v && SKINS[v]) stored = v;
    } catch (e) { /* localStorage unavailable */ }
    applySkin(stored);
    markActive(stored);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkins);
  } else {
    initSkins();
  }
})();
// === END SKINS === */