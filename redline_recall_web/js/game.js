'use strict';

// ── Car Data ──────────────────────────────────────────────────────
const CAR_PAIRS = [
  // Sport / Performance
  { make: 'Genesis',      model: 'G70' },
  { make: 'Audi',         model: 'RS3' },
  { make: 'BMW',          model: 'M3' },
  { make: 'Cadillac',     model: 'CT4-V' },
  { make: 'Mercedes-AMG', model: 'C63' },
  { make: 'Acura',        model: 'Type S' },
  { make: 'Nissan',       model: 'GT-R' },
  { make: 'Toyota',       model: 'GR Supra' },
  { make: 'Subaru',       model: 'WRX STI' },
  { make: 'Honda',        model: 'Civic Type R' },
  { make: 'Dodge',        model: 'Challenger Hellcat' },
  { make: 'Chevrolet',    model: 'Corvette' },
  { make: 'Ford',         model: 'Mustang Shelby GT500' },
  { make: 'Alfa Romeo',   model: 'Giulia Quadrifoglio' },
  { make: 'Volkswagen',   model: 'Golf R' },
  // Exotic / Hypercar
  { make: 'Porsche',      model: '911 GT3 RS' },
  { make: 'Lamborghini',  model: 'Huracán STO' },
  { make: 'Bugatti',      model: 'Chiron' },
  { make: 'Ferrari',      model: 'SF90 Stradale' },
  { make: 'McLaren',      model: '720S' },
  { make: 'Aston Martin', model: 'Vantage AMR' },
  { make: 'Bentley',      model: 'Continental GT Speed' },
  { make: 'Rolls-Royce',  model: 'Ghost' },
  { make: 'Pagani',       model: 'Huayra' },
  { make: 'Koenigsegg',   model: 'Jesko' },
  // JDM Legends
  { make: 'Lexus',        model: 'LFA' },
  { make: 'Mazda',        model: 'RX-7' },
  { make: 'Mitsubishi',   model: 'Lancer Evolution X' },
  { make: 'Infiniti',     model: 'Q60 Red Sport' },
  // Electric Performance
  { make: 'Tesla',        model: 'Model S Plaid' },
  { make: 'Rimac',        model: 'Nevera' },
  { make: 'Polestar',     model: '1' },
  // European Sport
  { make: 'Lotus',        model: 'Emira' },
  { make: 'Jaguar',       model: 'F-Type R' },
  { make: 'Maserati',     model: 'MC20' },
  { make: 'Renault',      model: 'Mégane RS Trophy-R' },
  { make: 'Alpine',       model: 'A110 S' },
  { make: 'TVR',          model: 'Griffith' },
  { make: 'De Tomaso',    model: 'P72' },
  { make: 'Lancia',       model: 'Delta Integrale' },
  // Korean Performance
  { make: 'Hyundai',      model: 'Ioniq 5 N' },
  { make: 'Kia',          model: 'EV6 GT' },
  // American Hypercar
  { make: 'Hennessey',    model: 'Venom F5' },
  { make: 'SSC',          model: 'Tuatara' },
  { make: 'Saleen',       model: 'S7' },
  // Boutique / Track
  { make: 'Caterham',     model: 'Seven 620R' },
  { make: 'Ariel',        model: 'Atom 4' },
  { make: 'KTM',          model: 'X-Bow GT-XR' },
  { make: 'Spyker',       model: 'C8 Preliator' },
  { make: 'Wiesmann',     model: 'MF5' },
];

const PAIRS_PER_LEVEL   = 5;
const SECONDS_PER_LEVEL = 30;

// ── State ─────────────────────────────────────────────────────────
let levels        = [];
let currentLevel  = 0;
let levelTimes    = [];
let levelStart    = 0;
let timerInterval = null;

let makesOrder    = [];
let modelsOrder   = [];
let levelPairs    = [];
let matched       = new Set();
let selectedMake  = null;

// ── Utilities ─────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function derange(base) {
  let result;
  do {
    result = shuffle(base);
  } while (result.some((v, i) => v === base[i]));
  return result;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

// ── Screens ───────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Game Init ─────────────────────────────────────────────────────
function initGame() {
  const pool = shuffle(CAR_PAIRS);
  levels = [];
  for (let i = 0; i < pool.length; i += PAIRS_PER_LEVEL) {
    levels.push(pool.slice(i, i + PAIRS_PER_LEVEL));
  }
  currentLevel = 0;
  levelTimes   = [];
}

// ── Level ─────────────────────────────────────────────────────────
function startLevel() {
  clearInterval(timerInterval);

  levelPairs   = levels[currentLevel];
  matched      = new Set();
  selectedMake = null;

  const n     = levelPairs.length;
  makesOrder  = shuffle([...Array(n).keys()]);
  modelsOrder = derange(makesOrder);

  document.getElementById('level-current').textContent = currentLevel + 1;
  document.getElementById('level-total').textContent   = levels.length;
  document.getElementById('remaining').textContent     = n;
  document.getElementById('feedback').textContent      = '';
  document.getElementById('feedback').className        = 'feedback';

  renderBoard();
  showScreen('screen-game');

  // timer
  levelStart = Date.now();
  const fill = document.getElementById('timer-fill');
  fill.style.transition = 'none';
  fill.style.width = '0%';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fill.style.transition = `width ${SECONDS_PER_LEVEL}s linear`;
      fill.style.width = '100%';
    });
  });

  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - levelStart) / 1000;
    if (elapsed >= SECONDS_PER_LEVEL) {
      clearInterval(timerInterval);
      onTimeout();
    }
  }, 250);
}

// ── Render ────────────────────────────────────────────────────────
function renderBoard() {
  const makesList   = document.getElementById('makes-list');
  const modelsList  = document.getElementById('models-list');
  makesList.innerHTML  = '';
  modelsList.innerHTML = '';

  makesOrder.forEach((pairIdx, displayIdx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = levelPairs[pairIdx].make;
    card.dataset.pairIdx    = pairIdx;
    card.dataset.displayIdx = displayIdx;
    if (matched.has(pairIdx)) card.classList.add('matched');
    card.addEventListener('click', () => onMakeTap(pairIdx, card));
    makesList.appendChild(card);
  });

  modelsOrder.forEach((pairIdx, displayIdx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = levelPairs[pairIdx].model;
    card.dataset.pairIdx    = pairIdx;
    card.dataset.displayIdx = displayIdx;
    if (matched.has(pairIdx)) card.classList.add('matched');
    card.addEventListener('click', () => onModelTap(pairIdx, card));
    modelsList.appendChild(card);
  });
}

// ── Tap Logic ─────────────────────────────────────────────────────
function onMakeTap(pairIdx, card) {
  if (matched.has(pairIdx)) return;

  // deselect previous make
  document.querySelectorAll('#makes-list .card.selected')
    .forEach(c => c.classList.remove('selected'));

  selectedMake = pairIdx;
  card.classList.add('selected');
  setFeedback('', '');
}

function onModelTap(pairIdx, card) {
  if (matched.has(pairIdx)) return;
  if (selectedMake === null) {
    setFeedback('Pick a make first', '');
    return;
  }

  if (selectedMake === pairIdx) {
    // ✓ Match
    matched.add(pairIdx);

    const makeCard = document.querySelector(`#makes-list .card[data-pair-idx="${pairIdx}"]`);
    makeCard.classList.remove('selected');
    makeCard.classList.add('matched');
    card.classList.add('matched');

    const pair = levelPairs[pairIdx];
    setFeedback(`${pair.make}  ·  ${pair.model}`, 'match');

    document.getElementById('remaining').textContent = levelPairs.length - matched.size;
    selectedMake = null;

    if (matched.size === levelPairs.length) {
      clearInterval(timerInterval);
      setTimeout(onLevelComplete, 600);
    }
  } else {
    // ✗ No match
    const makeCard = document.querySelector(`#makes-list .card[data-pair-idx="${selectedMake}"]`);
    card.classList.add('wrong');
    if (makeCard) makeCard.classList.add('wrong');
    setFeedback('No match — try again', 'miss');

    setTimeout(() => {
      card.classList.remove('wrong');
      if (makeCard) {
        makeCard.classList.remove('wrong', 'selected');
      }
      selectedMake = null;
    }, 400);
  }
}

function setFeedback(msg, type) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className   = `feedback ${type}`;
}

// ── Level Complete ────────────────────────────────────────────────
function onLevelComplete() {
  const elapsed = (Date.now() - levelStart) / 1000;
  levelTimes.push({ level: currentLevel + 1, time: elapsed });

  document.getElementById('level-time').textContent = formatTime(elapsed);

  if (currentLevel === levels.length - 1) {
    showWin();
  } else {
    showScreen('screen-level-complete');
  }
}

// ── Timeout ───────────────────────────────────────────────────────
function onTimeout() {
  renderSummary('summary-list');
  showScreen('screen-timeout');
}

// ── Win ───────────────────────────────────────────────────────────
function showWin() {
  renderSummary('win-summary-list');
  showScreen('screen-win');
}

// ── Summary ───────────────────────────────────────────────────────
function renderSummary(containerId) {
  const list = document.getElementById(containerId);
  list.innerHTML = '';
  if (!levelTimes.length) {
    list.innerHTML = '<div style="color:var(--text-dim);font-size:14px;text-align:center">No levels completed</div>';
    return;
  }
  levelTimes.forEach(({ level, time }) => {
    const row = document.createElement('div');
    row.className = 'summary-row';
    row.innerHTML = `
      <span class="s-level">LEVEL ${level}</span>
      <span class="s-time">${formatTime(time)}</span>
    `;
    list.appendChild(row);
  });
}

// ── Music ─────────────────────────────────────────────────────────
let ytPlayer   = null;
let musicMuted = false;
const PLAYLIST_ID = 'PLi9QZjTWcp-Z_8JFSaJm5yLlss_nZNoGT';

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    height: '1',
    width:  '1',
    playerVars: {
      listType:  'playlist',
      list:      PLAYLIST_ID,
      autoplay:  0,
      controls:  0,
      loop:      1,
      fs:        0,
      disablekb: 1,
      modestbranding: 1,
    },
  });
};

function startMusic() {
  if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') return;
  ytPlayer.setVolume(50);
  ytPlayer.playVideo();
}

document.getElementById('btn-music').addEventListener('click', () => {
  if (!ytPlayer || typeof ytPlayer.isMuted !== 'function') return;
  const btn = document.getElementById('btn-music');
  if (musicMuted) {
    ytPlayer.unMute();
    musicMuted = false;
    btn.textContent = '♫';
    btn.classList.remove('muted');
  } else {
    ytPlayer.mute();
    musicMuted = true;
    btn.textContent = '♪';
    btn.classList.add('muted');
  }
});

// ── Button Wiring ─────────────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', () => {
  startMusic();
  initGame();
  startLevel();
});

document.getElementById('btn-next-level').addEventListener('click', () => {
  currentLevel++;
  startLevel();
});

document.getElementById('btn-quit-complete').addEventListener('click', () => {
  renderSummary('summary-list');
  showScreen('screen-summary');
});

document.getElementById('btn-try-again').addEventListener('click', () => {
  startLevel();
});

document.getElementById('btn-quit-timeout').addEventListener('click', () => {
  showScreen('screen-summary');
});

document.getElementById('btn-play-again').addEventListener('click', () => {
  initGame();
  startLevel();
});

document.getElementById('btn-win-play-again').addEventListener('click', () => {
  initGame();
  startLevel();
});
