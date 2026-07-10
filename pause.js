'use strict';

// === PLUGINS ===

// === BEGIN PAUSE === */
(function() {
  const STORAGE_KEY = 'tetris.pause.v1';
  const MIN_LEVEL = 1;
  const MAX_LEVEL = 20;

  function loadStoredLevel() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return MIN_LEVEL;
      const parsed = JSON.parse(raw);
      const n = parsed && Number(parsed.startingLevel);
      if (!Number.isInteger(n)) return MIN_LEVEL;
      if (n < MIN_LEVEL) return MIN_LEVEL;
      if (n > MAX_LEVEL) return MAX_LEVEL;
      return n;
    } catch (e) {
      return MIN_LEVEL;
    }
  }

  function saveStoredLevel(n) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ startingLevel: n }));
    } catch (e) {
      // localStorage may be unavailable; non-fatal.
    }
  }

  // Wrap init() so future games honour the stored starting level.
  const _origInit = init;
  init = function() {
    _origInit();
    const stored = loadStoredLevel();
    if (level !== stored) {
      level = stored;
      dropInterval = Math.max(100, 1000 - (level - 1) * 90);
      updateHUD();
    }
  };

  // Wrap togglePause to drive the new pause overlay screen.
  const _origTogglePause = togglePause;
  togglePause = function() {
    const wasPaused = paused;
    _origTogglePause.call(this);
    const overlayEl = document.getElementById('overlay');
    const overlayBox = overlayEl.querySelector('.overlay-box');
    const pauseScreen = overlayEl.querySelector('.overlay-pause');
    if (!overlayEl || !pauseScreen) return;
    // Hide every other overlay screen so a single overlay hosts multiple screens.
    overlayEl.querySelectorAll('.overlay-screen').forEach(el => {
      if (el !== pauseScreen) el.hidden = true;
    });
    if (paused && !wasPaused) {
      // Just paused: swap overlay-box for the pause screen.
      overlayBox.hidden = true;
      pauseScreen.hidden = false;
      overlayEl.classList.remove('hidden');
    } else if (!paused && wasPaused) {
      // Just unpaused: hide the shared overlay (also covers resume from a game-over screen).
      pauseScreen.hidden = true;
      overlayBox.hidden = false;
      overlayEl.classList.add('hidden');
    }
  };

  // Escape key toggles pause (in addition to the existing P key handler).
  document.addEventListener('keydown', e => {
    if (e.code !== 'Escape') return;
    if (gameOver) return;
    e.preventDefault();
    togglePause();
  });

  // Wire up the buttons in the pause overlay once the DOM is ready.
  function setupPauseMenu() {
    const overlayEl = document.getElementById('overlay');
    const pauseScreen = overlayEl && overlayEl.querySelector('.overlay-pause');
    if (!pauseScreen) return;

    const resumeBtn = document.getElementById('pause-resume-btn');
    const restartBtn = document.getElementById('pause-restart-btn');
    const controlsBtn = document.getElementById('pause-controls-btn');
    const controlsList = document.getElementById('pause-controls-list');
    const levelSelect = document.getElementById('pause-level-select');

    if (levelSelect) {
      for (let i = MIN_LEVEL; i <= MAX_LEVEL; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i);
        levelSelect.appendChild(opt);
      }
      levelSelect.value = String(loadStoredLevel());
      levelSelect.addEventListener('change', e => {
        const n = parseInt(e.target.value, 10);
        if (!Number.isInteger(n)) return;
        saveStoredLevel(n);
        // Start a new game immediately at the selected level.
        init();
        // Re-open the pause menu so the user can verify the change.
        if (!gameOver) togglePause();
      });
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        if (paused) togglePause();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        init();
        if (!gameOver && !paused) togglePause();
      });
    }

    if (controlsBtn && controlsList) {
      controlsBtn.addEventListener('click', () => {
        controlsList.hidden = !controlsList.hidden;
        controlsBtn.textContent = controlsList.hidden ? 'Ver controles' : 'Ocultar controles';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPauseMenu);
  } else {
    setupPauseMenu();
  }
})();
// === END PAUSE === */