// ─────────────────────────────────────────────
//  STEP 1: PASTE YOUR SUPABASE DETAILS HERE
//  Get these from: supabase.com → your project
//  → Project Settings → API
// ─────────────────────────────────────────────
const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';

// ─────────────────────────────────────────────
//  PRODUCE DATA
// ─────────────────────────────────────────────
const WEEKS = [
  {
    label: 'Week 1 — Fruits',
    items: [
      { name: 'Lychee',       emoji: '🍈', bonus: true  },
      { name: 'Kiwi',         emoji: '🥝', bonus: true  },
      { name: 'Kumquat',      emoji: '🍊', bonus: true  },
      { name: 'Mango',        emoji: '🥭', bonus: false },
      { name: 'Pineapple',    emoji: '🍍', bonus: false },
      { name: 'Peach',        emoji: '🍑', bonus: false },
      { name: 'Cherries',     emoji: '🍒', bonus: false },
    ]
  },
  {
    label: 'Week 2 — Vegetables',
    items: [
      { name: 'Snow peas',     emoji: '🫛', bonus: true  },
      { name: 'Bamboo shoots', emoji: '🎍', bonus: true  },
      { name: 'Bean sprouts',  emoji: '🌱', bonus: true  },
      { name: 'Broccoli',      emoji: '🥦', bonus: false },
      { name: 'Eggplant',      emoji: '🍆', bonus: false },
      { name: 'Shallots',      emoji: '🧅', bonus: false },
      { name: 'Corn',          emoji: '🌽', bonus: false },
    ]
  },
  {
    label: 'Week 3 — Berries & More',
    items: [
      { name: 'Lychee',      emoji: '🍈', bonus: true  },
      { name: 'Kumquat',     emoji: '🍊', bonus: true  },
      { name: 'Strawberry',  emoji: '🍓', bonus: false },
      { name: 'Blueberry',   emoji: '🫐', bonus: false },
      { name: 'Avocado',     emoji: '🥑', bonus: false },
      { name: 'Carrot',      emoji: '🥕', bonus: false },
      { name: 'Mango',       emoji: '🥭', bonus: false },
    ]
  },
  {
    label: 'Week 4 — Wild Card',
    items: [
      { name: 'Bean sprouts', emoji: '🌱', bonus: true  },
      { name: 'Snow peas',    emoji: '🫛', bonus: true  },
      { name: 'Kiwi',         emoji: '🥝', bonus: true  },
      { name: 'Peach',        emoji: '🍑', bonus: false },
      { name: 'Corn',         emoji: '🌽', bonus: false },
      { name: 'Eggplant',     emoji: '🍆', bonus: false },
      { name: 'Blueberry',    emoji: '🫐', bonus: false },
    ]
  }
];

// ─────────────────────────────────────────────
//  APP STATE
//  Everything saves to the browser (localStorage)
//  so it's still there when they come back
// ─────────────────────────────────────────────
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let playerName = '';
let playerId = '';       // a random ID saved in the browser for this person
let currentWeek = 0;
let triedItems = [[], [], [], []];

// ─────────────────────────────────────────────
//  STARTUP
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Check if this person already entered their name before
  const savedName = localStorage.getItem('ft_name');
  const savedId   = localStorage.getItem('ft_id');

  if (savedName && savedId) {
    playerName = savedName;
    playerId   = savedId;
    loadSavedItems();
    showApp();
  }
  // Otherwise the name screen is already showing
});

// ─────────────────────────────────────────────
//  NAME SCREEN — "Let's go" button
// ─────────────────────────────────────────────
function startApp() {
  const nameInput = document.getElementById('input-name').value.trim();
  const errEl = document.getElementById('name-error');

  if (!nameInput) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  // Save name + a unique ID for this browser
  playerName = nameInput;
  playerId   = localStorage.getItem('ft_id') || 'player_' + Math.random().toString(36).slice(2, 10);

  localStorage.setItem('ft_name', playerName);
  localStorage.setItem('ft_id',   playerId);

  loadSavedItems();
  showApp();
}

// ─────────────────────────────────────────────
//  CHANGE NAME button in top bar
// ─────────────────────────────────────────────
function changeName() {
  localStorage.removeItem('ft_name');
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('name-screen').style.display = 'flex';
  document.getElementById('input-name').value = playerName;
}

// ─────────────────────────────────────────────
//  LOAD items this person already saved
// ─────────────────────────────────────────────
function loadSavedItems() {
  const saved = localStorage.getItem('ft_tried');
  if (saved) {
    try { triedItems = JSON.parse(saved); }
    catch(e) { triedItems = [[], [], [], []]; }
  } else {
    triedItems = [[], [], [], []];
  }
}

// ─────────────────────────────────────────────
//  SHOW THE MAIN APP
// ─────────────────────────────────────────────
function showApp() {
  document.getElementById('name-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  document.getElementById('user-name-display').textContent = playerName;
  document.getElementById('user-initials').textContent = initials(playerName);
  renderWeekNav();
  renderProduceGrid();
  updateStats();
  loadLeaderboard();
}

// ─────────────────────────────────────────────
//  WEEK NAVIGATION
// ─────────────────────────────────────────────
function renderWeekNav() {
  const nav = document.getElementById('week-nav');
  nav.innerHTML = '';
  WEEKS.forEach((w, i) => {
    const btn = document.createElement('button');
    const hasTried = triedItems[i] && triedItems[i].length > 0;
    btn.className = 'week-pill' + (i === currentWeek ? ' active' : '') + (hasTried && i !== currentWeek ? ' done' : '');
    btn.textContent = `Week ${i + 1}${hasTried ? ' ✓' : ''}`;
    btn.onclick = () => { currentWeek = i; renderWeekNav(); renderProduceGrid(); };
    nav.appendChild(btn);
  });
}

// ─────────────────────────────────────────────
//  PRODUCE GRID
// ─────────────────────────────────────────────
function renderProduceGrid() {
  const week = WEEKS[currentWeek];
  document.getElementById('week-heading').textContent = week.label;
  const grid = document.getElementById('produce-grid');
  grid.innerHTML = '';

  week.items.forEach((item, i) => {
    const tried = triedItems[currentWeek] && triedItems[currentWeek].includes(i);
    const card = document.createElement('div');
    card.className = 'produce-card' + (tried ? ' tried' : '') + (item.bonus ? ' bonus-item' : '');
    card.onclick = () => toggleItem(i);
    card.innerHTML = `
      <div class="produce-emoji">${item.emoji}</div>
      <div class="produce-name">${item.name}</div>
      <div class="produce-pts">${item.bonus ? '20 pts · bonus' : '10 pts'}</div>
      ${item.bonus ? `<span class="badge-bonus">★ Chinese</span>` : ''}
      ${tried ? `<span class="badge-tried${item.bonus ? ' shift' : ''}">✓</span>` : ''}
    `;
    grid.appendChild(card);
  });
}

// ─────────────────────────────────────────────
//  TOGGLE AN ITEM
// ─────────────────────────────────────────────
function toggleItem(idx) {
  if (!triedItems[currentWeek]) triedItems[currentWeek] = [];
  const arr = triedItems[currentWeek];
  const pos = arr.indexOf(idx);
  if (pos === -1) arr.push(idx);
  else arr.splice(pos, 1);

  // Save to browser immediately
  localStorage.setItem('ft_tried', JSON.stringify(triedItems));

  renderProduceGrid();
  updateStats();
}

// ─────────────────────────────────────────────
//  STATS
// ─────────────────────────────────────────────
function calcStats() {
  let pts = 0, tried = 0, bonus = 0, weeksDone = 0;
  triedItems.forEach((arr, wi) => {
    if (arr && arr.length > 0) weeksDone++;
    (arr || []).forEach(i => {
      const item = WEEKS[wi].items[i];
      if (!item) return;
      pts += item.bonus ? 20 : 10;
      tried++;
      if (item.bonus) bonus++;
    });
  });
  if (weeksDone === 4) pts += 15;
  return { pts, tried, bonus };
}

function updateStats() {
  const { pts, tried, bonus } = calcStats();
  document.getElementById('stat-pts').textContent = pts;
  document.getElementById('stat-tried').textContent = tried;
  document.getElementById('stat-bonus').textContent = bonus;
}

// ─────────────────────────────────────────────
//  SAVE TO SUPABASE (leaderboard)
// ─────────────────────────────────────────────
async function saveEntry() {
  const arr = triedItems[currentWeek] || [];
  if (arr.length === 0) {
    showToast('Tap at least one item you tried first!');
    return;
  }

  showLoading(true);

  // Delete old entries for this player + week
  await supabase.from('entries')
    .delete()
    .eq('player_id', playerId)
    .eq('week', currentWeek + 1);

  // Insert fresh entries
  const rows = arr.map(i => ({
    player_id:  playerId,
    player_name: playerName,
    week:       currentWeek + 1,
    item_name:  WEEKS[currentWeek].items[i].name,
    is_bonus:   WEEKS[currentWeek].items[i].bonus,
    points:     WEEKS[currentWeek].items[i].bonus ? 20 : 10
  }));

  const { error } = await supabase.from('entries').insert(rows);
  showLoading(false);

  if (error) {
    showToast('Something went wrong. Try again.');
    console.error(error);
  } else {
    showToast('Saved! Great work this week 🎉');
    renderWeekNav();
    await loadLeaderboard();
  }
}

// ─────────────────────────────────────────────
//  LEADERBOARD
// ─────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#B5D4F4','#185FA5'], ['#C0DD97','#3B6D11'], ['#FAC775','#854F0B'],
  ['#F5C4B3','#993C1D'], ['#9FE1CB','#0F6E56'], ['#F4C0D1','#993556'],
  ['#D3D1C7','#444441']
];

async function loadLeaderboard() {
  const lbEl = document.getElementById('lb-list');
  lbEl.innerHTML = '<div class="lb-empty">Loading...</div>';

  const { data: entries, error } = await supabase
    .from('entries')
    .select('player_id, player_name, points, is_bonus, week');

  if (error || !entries || entries.length === 0) {
    lbEl.innerHTML = '<div class="lb-empty">No entries yet — be the first! 🌿</div>';
    return;
  }

  // Aggregate per player
  const totals = {};
  entries.forEach(e => {
    if (!totals[e.player_id]) {
      totals[e.player_id] = { name: e.player_name, pts: 0, tried: 0, bonus: 0, weeks: new Set() };
    }
    totals[e.player_id].pts += e.points;
    totals[e.player_id].tried++;
    if (e.is_bonus) totals[e.player_id].bonus++;
    totals[e.player_id].weeks.add(e.week);
  });

  // Add streak bonus
  Object.values(totals).forEach(t => { if (t.weeks.size === 4) t.pts += 15; });

  const sorted = Object.entries(totals)
    .map(([pid, t]) => ({ pid, ...t }))
    .sort((a, b) => b.pts - a.pts);

  lbEl.innerHTML = '';
  sorted.forEach((row, i) => {
    const isMe = row.pid === playerId;
    const [bg, tc] = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
    const div = document.createElement('div');
    div.className = 'lb-row' + (isMe ? ' is-me' : '');
    div.innerHTML = `
      <span class="lb-rank">${medal}</span>
      <div class="lb-avatar-md" style="background:${bg};color:${tc}">${initials(row.name)}</div>
      <div style="flex:1">
        <div class="lb-name">${row.name}${isMe ? ' <span style="font-size:0.75rem;color:var(--green-mid)">(you)</span>' : ''}</div>
        <div class="lb-sub">${row.tried} tried · ${row.bonus} bonus · ${row.weeks.size}/4 weeks</div>
      </div>
      <div class="lb-pts">${row.pts}</div>
    `;
    lbEl.appendChild(div);
  });
}

// ─────────────────────────────────────────────
//  TAB SWITCHING
// ─────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'leaderboard') loadLeaderboard();
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function showLoading(on) {
  document.getElementById('loading').style.display = on ? 'flex' : 'none';
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
