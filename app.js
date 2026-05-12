// ─────────────────────────────────────────────
//  STEP 1: PASTE YOUR SUPABASE DETAILS HERE
//  Get these from: supabase.com → your project
//  → Project Settings → API
// ─────────────────────────────────────────────
const SUPABASE_URL = 'https://bcizqtzwvgdadlsvdhzw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_d7RPySz8FFXI_KaMye-6BA_-JGealZm';

// ─────────────────────────────────────────────
//  PRODUCE DATA
//  bonus: true = Chinese-origin item (20 pts)
//  bonus: false = standard item (10 pts)
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
// ─────────────────────────────────────────────
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentWeek = 0;          // 0-indexed (Week 1 = index 0)
let triedItems = [[], [], [], []]; // which item indices the user has tried per week
let isSignUp = false;

// ─────────────────────────────────────────────
//  STARTUP — check if already logged in
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await initApp(session.user);
  }
});

// ─────────────────────────────────────────────
//  AUTH: toggle between sign-in and sign-up
// ─────────────────────────────────────────────
function toggleAuthMode() {
  isSignUp = !isSignUp;
  document.getElementById('name-group').style.display = isSignUp ? 'block' : 'none';
  document.getElementById('auth-btn').textContent = isSignUp ? 'Create account' : 'Sign in';
  document.getElementById('auth-toggle-text').textContent = isSignUp ? 'Already have an account?' : 'No account?';
  document.getElementById('auth-toggle-link').textContent = isSignUp ? 'Sign in' : 'Create one';
  document.getElementById('auth-error').style.display = 'none';
}

// ─────────────────────────────────────────────
//  AUTH: handle sign-in or sign-up
// ─────────────────────────────────────────────
async function handleAuth() {
  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  const name = document.getElementById('input-name').value.trim();
  const errEl = document.getElementById('auth-error');
  errEl.style.display = 'none';

  if (!email || !password) {
    showAuthError('Please enter your email and password.');
    return;
  }

  showLoading(true);

  if (isSignUp) {
    if (!name) { showAuthError('Please enter your name.'); showLoading(false); return; }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { showAuthError(error.message); showLoading(false); return; }

    // Save name to profiles table
    await supabase.from('profiles').upsert({
      id: data.user.id,
      name: name,
      email: email
    });

    await initApp(data.user, name);
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { showAuthError('Wrong email or password. Try again.'); showLoading(false); return; }
    await initApp(data.user);
  }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
}

// ─────────────────────────────────────────────
//  SIGN OUT
// ─────────────────────────────────────────────
async function handleSignOut() {
  await supabase.auth.signOut();
  currentUser = null;
  triedItems = [[], [], [], []];
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

// ─────────────────────────────────────────────
//  INIT APP after login
// ─────────────────────────────────────────────
async function initApp(user, nameOverride) {
  currentUser = user;
  showLoading(true);

  // Get profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  const displayName = nameOverride || (profile && profile.name) || user.email.split('@')[0];

  // Show user's name in top bar
  document.getElementById('user-name-display').textContent = displayName;
  document.getElementById('user-initials').textContent = initials(displayName);

  // Load this user's existing entries
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id);

  if (entries) {
    triedItems = [[], [], [], []];
    entries.forEach(e => {
      const weekIdx = e.week - 1;
      const itemIdx = WEEKS[weekIdx]?.items.findIndex(i => i.name === e.item_name);
      if (itemIdx !== -1 && itemIdx !== undefined) {
        if (!triedItems[weekIdx].includes(itemIdx)) {
          triedItems[weekIdx].push(itemIdx);
        }
      }
    });
  }

  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  showLoading(false);

  renderWeekNav();
  renderProduceGrid();
  updateStats();
  await loadLeaderboard();
}

// ─────────────────────────────────────────────
//  WEEK NAVIGATION
// ─────────────────────────────────────────────
function renderWeekNav() {
  const nav = document.getElementById('week-nav');
  nav.innerHTML = '';
  WEEKS.forEach((w, i) => {
    const btn = document.createElement('button');
    const hasTried = triedItems[i].length > 0;
    btn.className = 'week-pill' + (i === currentWeek ? ' active' : '') + (hasTried && i !== currentWeek ? ' done' : '');
    btn.textContent = `Week ${i + 1}${hasTried ? ' ✓' : ''}`;
    btn.onclick = () => {
      currentWeek = i;
      renderWeekNav();
      renderProduceGrid();
    };
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
    const tried = triedItems[currentWeek].includes(i);
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
//  TOGGLE AN ITEM (tap to try / untry)
// ─────────────────────────────────────────────
function toggleItem(idx) {
  const arr = triedItems[currentWeek];
  const pos = arr.indexOf(idx);
  if (pos === -1) arr.push(idx);
  else arr.splice(pos, 1);
  renderProduceGrid();
  updateStats();
}

// ─────────────────────────────────────────────
//  STATS
// ─────────────────────────────────────────────
function calcStats() {
  let pts = 0, tried = 0, bonus = 0, weeksDone = 0;
  triedItems.forEach((arr, wi) => {
    if (arr.length > 0) weeksDone++;
    arr.forEach(i => {
      const item = WEEKS[wi].items[i];
      pts += item.bonus ? 20 : 10;
      tried++;
      if (item.bonus) bonus++;
    });
  });
  if (weeksDone === 4) pts += 15; // streak bonus
  return { pts, tried, bonus };
}

function updateStats() {
  const { pts, tried, bonus } = calcStats();
  document.getElementById('stat-pts').textContent = pts;
  document.getElementById('stat-tried').textContent = tried;
  document.getElementById('stat-bonus').textContent = bonus;
}

// ─────────────────────────────────────────────
//  SAVE ENTRY TO SUPABASE
// ─────────────────────────────────────────────
async function saveEntry() {
  if (!currentUser) return;

  const arr = triedItems[currentWeek];
  if (arr.length === 0) {
    showToast('Tap at least one item you tried first!');
    return;
  }

  showLoading(true);

  // Delete existing entries for this user + week (so we can re-save cleanly)
  await supabase.from('entries')
    .delete()
    .eq('user_id', currentUser.id)
    .eq('week', currentWeek + 1);

  // Insert fresh entries
  const rows = arr.map(i => ({
    user_id: currentUser.id,
    week: currentWeek + 1,
    item_name: WEEKS[currentWeek].items[i].name,
    is_bonus: WEEKS[currentWeek].items[i].bonus,
    points: WEEKS[currentWeek].items[i].bonus ? 20 : 10
  }));

  const { error } = await supabase.from('entries').insert(rows);
  showLoading(false);

  if (error) {
    showToast('Something went wrong. Please try again.');
    console.error(error);
  } else {
    showToast('Saved! Great work this week 🎉');
    renderWeekNav(); // update checkmarks on week pills
    await loadLeaderboard();
  }
}

// ─────────────────────────────────────────────
//  LEADERBOARD
// ─────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#B5D4F4','#185FA5'], ['#C0DD97','#3B6D11'], ['#FAC775','#854F0B'],
  ['#F5C4B3','#993C1D'], ['#9FE1CB','#0F6E56'], ['#F4C0D1','#993556'],
  ['#CCC','#444']
];

async function loadLeaderboard() {
  const lbEl = document.getElementById('lb-list');
  lbEl.innerHTML = '<div class="lb-empty">Loading...</div>';

  // Get all entries
  const { data: entries, error } = await supabase
    .from('entries')
    .select('user_id, points, is_bonus, week');

  if (error) {
    lbEl.innerHTML = '<div class="lb-empty">Could not load leaderboard.</div>';
    return;
  }

  if (!entries || entries.length === 0) {
    lbEl.innerHTML = '<div class="lb-empty">No entries yet — be the first! 🌿</div>';
    return;
  }

  // Get all profiles
  const userIds = [...new Set(entries.map(e => e.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  const profileMap = {};
  (profiles || []).forEach(p => profileMap[p.id] = p.name);

  // Aggregate per user
  const totals = {};
  entries.forEach(e => {
    if (!totals[e.user_id]) totals[e.user_id] = { pts: 0, tried: 0, bonus: 0, weeks: new Set() };
    totals[e.user_id].pts += e.points;
    totals[e.user_id].tried++;
    if (e.is_bonus) totals[e.user_id].bonus++;
    totals[e.user_id].weeks.add(e.week);
  });

  // Add streak bonus
  Object.values(totals).forEach(t => {
    if (t.weeks.size === 4) t.pts += 15;
  });

  // Sort by points
  const sorted = Object.entries(totals)
    .map(([uid, t]) => ({ uid, ...t, name: profileMap[uid] || 'Team member' }))
    .sort((a, b) => b.pts - a.pts);

  lbEl.innerHTML = '';
  sorted.forEach((row, i) => {
    const isMe = currentUser && row.uid === currentUser.id;
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
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  event.target.classList.add('active');

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
