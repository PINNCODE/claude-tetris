'use strict';

// === PLUGINS ===

// === BEGIN RECORDS === */
(function() {
  const STORAGE_KEY = 'tetris.records.v1';
  const MAX_ENTRIES = 5;
  const NAME_MAX = 3;

  // ---------- localStorage helpers ----------
  function loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(r =>
        r && typeof r.name === 'string' &&
        Number.isFinite(r.score) && Number.isFinite(r.lines) && Number.isFinite(r.combo)
      );
    } catch (e) {
      return [];
    }
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_ENTRIES)));
    } catch (e) {
      // quota / unavailable; non-fatal
    }
  }

  function isTopScore(score, records) {
    if (records.length < MAX_ENTRIES) return true;
    return score > records[records.length - 1].score;
  }

  function insertRecord(records, entry) {
    const next = records.concat([entry]).sort((a, b) => b.score - a.score);
    return next.slice(0, MAX_ENTRIES);
  }

  // ---------- Name sanitization ----------
  function sanitizeName(input) {
    if (typeof input !== 'string') return 'AAA';
    const upper = input.toUpperCase().replace(/[^A-Z]/g, '');
    if (!upper) return 'AAA';
    return upper.slice(0, NAME_MAX).padEnd(NAME_MAX, 'A');
  }

  // ---------- Render: sidebar list ----------
  function renderSidebar(records, currentEntry) {
    const list = document.getElementById('records-list');
    if (!list) return;
    list.innerHTML = '';
    records.forEach((r, idx) => {
      const li = document.createElement('li');
      const isCurrent = currentEntry && currentEntry.name === r.name &&
                        currentEntry.score === r.score &&
                        currentEntry.lines === r.lines &&
                        currentEntry.combo === r.combo &&
                        currentEntry.date === r.date;
      if (isCurrent) li.classList.add('is-current');

      const rank = document.createElement('span');
      rank.className = 'records-list-rank';
      rank.textContent = String(idx + 1) + '.';
      li.appendChild(rank);

      const name = document.createElement('span');
      name.className = 'records-list-name';
      name.textContent = r.name;
      li.appendChild(name);

      const score = document.createElement('span');
      score.className = 'records-list-score';
      score.textContent = r.score.toLocaleString();
      li.appendChild(score);

      list.appendChild(li);
    });
  }

  // ---------- Render: overlay table ----------
  function renderOverlayTable(records, currentEntry) {
    const tbody = document.querySelector('#overlay-records-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    records.forEach((r, idx) => {
      const tr = document.createElement('tr');
      const isCurrent = currentEntry && currentEntry.name === r.name &&
                        currentEntry.score === r.score &&
                        currentEntry.lines === r.lines &&
                        currentEntry.combo === r.combo &&
                        currentEntry.date === r.date;
      if (isCurrent) tr.classList.add('is-current');

      const tdRank = document.createElement('td');
      tdRank.className = 'records-table-rank';
      tdRank.textContent = idx + 1;
      tr.appendChild(tdRank);

      const tdName = document.createElement('td');
      tdName.className = 'records-table-name';
      tdName.textContent = r.name;
      tr.appendChild(tdName);

      const tdScore = document.createElement('td');
      tdScore.className = 'records-table-score';
      tdScore.textContent = r.score.toLocaleString();
      tr.appendChild(tdScore);

      const tdLines = document.createElement('td');
      tdLines.textContent = r.lines;
      tr.appendChild(tdLines);

      const tdCombo = document.createElement('td');
      tdCombo.textContent = r.combo;
      tr.appendChild(tdCombo);

      tbody.appendChild(tr);
    });
  }

  // ---------- Wrap endGame to surface records overlay ----------
  let pendingEntry = null;  // current game's stats, awaiting name submission

  const _origEndGame = endGame;
  endGame = function() {
    // Capture stats BEFORE the original endGame (which sets gameOver=true and shows the default overlay).
    const finalScore = score;
    const finalLines = lines;
    const finalCombo = maxLinesInOneDrop;
    const finalMaxLinesEver = maxLinesEver;

    _origEndGame.call(this);

    const records = loadRecords();
    const qualifies = isTopScore(finalScore, records);

    pendingEntry = {
      name: '',
      score: finalScore,
      lines: finalLines,
      combo: finalCombo,
      maxLinesEver: finalMaxLinesEver,
      date: new Date().toISOString(),
      qualifies: qualifies,
    };

    showRecordsOverlay(pendingEntry, records);
  };

  function showRecordsOverlay(entry, records) {
    const overlayEl = document.getElementById('overlay');
    const overlayBox = overlayEl.querySelector('.overlay-box');
    const recordsScreen = overlayEl.querySelector('.overlay-records');
    if (!overlayEl || !recordsScreen) return;

    // Hide siblings; show ours.
    overlayEl.querySelectorAll('.overlay-screen').forEach(el => {
      if (el !== recordsScreen) el.hidden = true;
    });
    overlayBox.hidden = true;
    recordsScreen.hidden = false;
    overlayEl.classList.remove('hidden');

    const statsEl = document.getElementById('overlay-records-stats');
    if (statsEl) {
      statsEl.textContent =
        'Puntos: ' + entry.score.toLocaleString() +
        '  |  Líneas: ' + entry.lines +
        '  |  Combo: ' + entry.combo +
        '  |  Máx. líneas: ' + entry.maxLinesEver;
    }

    const nameRow = document.getElementById('records-name-row');
    const nameInput = document.getElementById('records-name-input');
    if (entry.qualifies) {
      nameRow.hidden = false;
      nameInput.value = '';
      setTimeout(() => nameInput.focus(), 50);
    } else {
      nameRow.hidden = true;
    }

    renderOverlayTable(records, null);
  }

  // ---------- Wire up the sidebar reset button ----------
  function setupReset() {
    const btn = document.getElementById('records-reset-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!confirm('¿Borrar todos los récords?')) return;
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      renderSidebar(loadRecords(), null);
    });
  }

  // ---------- Wire up the overlay name input + save button ----------
  function setupOverlayControls() {
    const input = document.getElementById('records-name-input');
    const saveBtn = document.getElementById('records-save-btn');
    const playAgainBtn = document.getElementById('records-play-again-btn');

    function commit() {
      if (!pendingEntry || !pendingEntry.qualifies) return;
      const name = sanitizeName(input ? input.value : '');
      const entry = Object.assign({}, pendingEntry, { name: name });
      const records = loadRecords();
      const updated = insertRecord(records, entry);
      saveRecords(updated);
      renderSidebar(updated, entry);
      renderOverlayTable(updated, entry);

      // Hide name input row, refresh overlay stats, restart.
      const nameRow = document.getElementById('records-name-row');
      if (nameRow) nameRow.hidden = true;
      pendingEntry = null;
    }

    if (saveBtn) saveBtn.addEventListener('click', commit);
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.code === 'Enter') {
          e.preventDefault();
          commit();
        }
      });
    }
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        init();
      });
    }
  }

  // ---------- Init: render sidebar once on load ----------
  function initRecords() {
    setupReset();
    setupOverlayControls();
    renderSidebar(loadRecords(), null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecords);
  } else {
    initRecords();
  }
})();
// === END RECORDS === */