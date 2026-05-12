// ============================================
//  PASTE YOUR SUPABASE DETAILS HERE
//  supabase.com → your project → Project Settings → API
// ============================================
var SUPABASE_URL = 'https://bcizqtzwvgdadlsvdhzw.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaXpxdHp3dmdkYWRsc3ZkaHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODk1OTIsImV4cCI6MjA5NDE2NTU5Mn0.WxgZQJY8lpEOYZJ0pXHy8riiD5_a9qSe4smke27HfwI';

// ============================================
//  PRODUCE DATA
// ============================================
var WEEKS = [
  {
    label: 'Week 1 — Fruits',
    items: [
      { name: 'Lychee',       emoji: '🍈', bonus: true  },
      { name: 'Kiwi',         emoji: '🥝', bonus: true  },
      { name: 'Kumquat',      emoji: '🍊', bonus: true  },
      { name: 'Mango',        emoji: '🥭', bonus: false },
      { name: 'Pineapple',    emoji: '🍍', bonus: false },
      { name: 'Peach',        emoji: '🍑', bonus: false },
      { name: 'Cherries',     emoji: '🍒', bonus: false }
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
      { name: 'Corn',          emoji: '🌽', bonus: false }
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
      { name: 'Mango',       emoji: '🥭', bonus: false }
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
      { name: 'Blueberry',    emoji: '🫐', bonus: false }
    ]
  }
];

// ============================================
//  APP STATE
// ============================================
var db = null;
var playerName = '';
var playerId = '';
var currentWeek = 0;
var triedItems = [[], [], [], []];

var AVATAR_COLORS = [
  ['#B5D4F4','#185FA5'],
  ['#C0DD97','#3B6D11'],
  ['#FAC775','#854F0B'],
  ['#F5C4B3','#993C1D'],
  ['#9FE1CB','#0F6E56'],
  ['#F4C0D1','#993556'],
  ['#D3D1C7','#444441']
];

// ============================================
//  START — runs when the page finishes loading
// ============================================
window.addEventListener('load', function() {
  // Set up Supabase
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Wire up all buttons
  document.getElementById('start-btn').addEventListener('click', startApp);
  document.getElementById('change-btn').addEventListener('click', changeName);
  document.getElementById('save-btn').addEventListener('click', saveEntry);
  document.getElementById('refresh-btn').addEventListener('click', loadLeaderboard);
  document.getElementById('tab-btn-challenge').addEventListener('click', function() { switchTab('challenge'); });
  document.getElementById('tab-btn-leaderboard').addEventListener('click', function() { switchTab('leaderboard'); });
  document.getElementById('tab-btn-rules').addEventListener('click', function() { switchTab('rules'); });

  // Also allow pressing Enter in the name box
  document.getElementById('input-name').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') startApp();
  });

  // Check if this person already entered their name before
  var savedName = localStorage.getItem('ft_name');
  var savedId   = localStorage.getItem('ft_id');
  if (savedName && savedId) {
    playerName = savedName;
    playerId   = savedId;
    loadSavedItems();
    showApp();
  }
});

// ============================================
//  NAME SCREEN
// ============================================
function startApp() {
  var nameInput = document.getElementById('input-name').value.trim();
  var errEl = document.getElementById('name-error');
  if (!nameInput) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  playerName = nameInput;
  playerId = localStorage.getItem('ft_id') || ('player_' + Math.random().toString(36).slice(2, 10));
  localStorage.setItem('ft_name', playerName);
  localStorage.setItem('ft_id', playerId);
  loadSavedItems();
  showApp();
}

function changeName() {
  localStorage.removeItem('ft_name');
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('name-screen').style.display = 'flex';
  document.getElementById('input-name').value = playerName;
}

// ============================================
//  LOAD SAVED ITEMS FROM BROWSER
// ============================================
function loadSavedItems() {
  var saved = localStorage.getItem('ft_tried');
  if (saved) {
    try { triedItems = JSON.parse(saved); }
    catch(e) { triedItems = [[], [], [], []]; }
  } else {
    triedItems = [[], [], [], []];
  }
}

// ============================================
//  SHOW MAIN APP
// ============================================
function showApp() {
  document.getElementById('name-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  document.getElementById('user-name-display').textContent = playerName;
  document.getElementById('user-initials').textContent = getInitials(playerName);
  renderWeekNav();
  renderProduceGrid();
  updateStats();
  loadLeaderboard();
}

// ============================================
//  WEEK NAVIGATION
// ============================================
function renderWeekNav() {
  var nav = document.getElementById('week-nav');
  nav.innerHTML = '';
  for (var i = 0; i < WEEKS.length; i++) {
    (function(index) {
      var hasTried = triedItems[index] && triedItems[index].length > 0;
      var btn = document.createElement('button');
      btn.className = 'week-pill' +
        (index === currentWeek ? ' active' : '') +
        (hasTried && index !== currentWeek ? ' done' : '');
      btn.textContent = 'Week ' + (index + 1) + (hasTried ? ' ✓' : '');
      btn.addEventListener('click', function() {
        currentWeek = index;
        renderWeekNav();
        renderProduceGrid();
      });
      nav.appendChild(btn);
    })(i);
  }
}

// ============================================
//  PRODUCE GRID
// ============================================
function renderProduceGrid() {
  var week = WEEKS[currentWeek];
  document.getElementById('week-heading').textContent = week.label;
  var grid = document.getElementById('produce-grid');
  grid.innerHTML = '';

  for (var i = 0; i < week.items.length; i++) {
    (function(index) {
      var item = week.items[index];
      var tried = triedItems[currentWeek] && triedItems[currentWeek].indexOf(index) !== -1;
      var card = document.createElement('div');
      card.className = 'produce-card' + (tried ? ' tried' : '') + (item.bonus ? ' bonus-item' : '');
      card.innerHTML =
        '<div class="produce-emoji">' + item.emoji + '</div>' +
        '<div class="produce-name">' + item.name + '</div>' +
        '<div class="produce-pts">' + (item.bonus ? '20 pts · bonus' : '10 pts') + '</div>' +
        (item.bonus ? '<span class="badge-bonus">★ Chinese</span>' : '') +
        (tried ? '<span class="badge-tried' + (item.bonus ? ' shift' : '') + '">✓</span>' : '');
      card.addEventListener('click', function() { toggleItem(index); });
      grid.appendChild(card);
    })(i);
  }
}

// ============================================
//  TOGGLE ITEM
// ============================================
function toggleItem(idx) {
  if (!triedItems[currentWeek]) triedItems[currentWeek] = [];
  var arr = triedItems[currentWeek];
  var pos = arr.indexOf(idx);
  if (pos === -1) arr.push(idx);
  else arr.splice(pos, 1);
  localStorage.setItem('ft_tried', JSON.stringify(triedItems));
  renderProduceGrid();
  updateStats();
}

// ============================================
//  STATS
// ============================================
function calcStats() {
  var pts = 0, tried = 0, bonus = 0, weeksDone = 0;
  for (var wi = 0; wi < triedItems.length; wi++) {
    var arr = triedItems[wi] || [];
    if (arr.length > 0) weeksDone++;
    for (var j = 0; j < arr.length; j++) {
      var item = WEEKS[wi].items[arr[j]];
      if (!item) continue;
      pts += item.bonus ? 20 : 10;
      tried++;
      if (item.bonus) bonus++;
    }
  }
  if (weeksDone === 4) pts += 15;
  return { pts: pts, tried: tried, bonus: bonus };
}

function updateStats() {
  var s = calcStats();
  document.getElementById('stat-pts').textContent = s.pts;
  document.getElementById('stat-tried').textContent = s.tried;
  document.getElementById('stat-bonus').textContent = s.bonus;
}

// ============================================
//  SAVE TO SUPABASE
// ============================================
function saveEntry() {
  var arr = triedItems[currentWeek] || [];
  if (arr.length === 0) {
    showToast('Tap at least one item you tried first!');
    return;
  }
  showLoading(true);

  db.from('entries')
    .delete()
    .eq('player_id', playerId)
    .eq('week', currentWeek + 1)
    .then(function() {
      var rows = [];
      for (var i = 0; i < arr.length; i++) {
        var item = WEEKS[currentWeek].items[arr[i]];
        rows.push({
          player_id:   playerId,
          player_name: playerName,
          week:        currentWeek + 1,
          item_name:   item.name,
          is_bonus:    item.bonus,
          points:      item.bonus ? 20 : 10
        });
      }
      return db.from('entries').insert(rows);
    })
    .then(function(result) {
      showLoading(false);
      if (result.error) {
        showToast('Something went wrong. Try again.');
        console.error(result.error);
      } else {
        showToast('Saved! Great work this week 🎉');
        renderWeekNav();
        loadLeaderboard();
      }
    });
}

// ============================================
//  LEADERBOARD
// ============================================
function loadLeaderboard() {
  var lbEl = document.getElementById('lb-list');
  lbEl.innerHTML = '<div class="lb-empty">Loading...</div>';

  db.from('entries')
    .select('player_id, player_name, points, is_bonus, week')
    .then(function(result) {
      if (result.error || !result.data || result.data.length === 0) {
        lbEl.innerHTML = '<div class="lb-empty">No entries yet — be the first! 🌿</div>';
        return;
      }

      var totals = {};
      result.data.forEach(function(e) {
        if (!totals[e.player_id]) {
          totals[e.player_id] = { name: e.player_name, pts: 0, tried: 0, bonus: 0, weeks: [] };
        }
        totals[e.player_id].pts += e.points;
        totals[e.player_id].tried++;
        if (e.is_bonus) totals[e.player_id].bonus++;
        if (totals[e.player_id].weeks.indexOf(e.week) === -1) {
          totals[e.player_id].weeks.push(e.week);
        }
      });

      Object.keys(totals).forEach(function(pid) {
        if (totals[pid].weeks.length === 4) totals[pid].pts += 15;
      });

      var sorted = Object.keys(totals).map(function(pid) {
        return { pid: pid, name: totals[pid].name, pts: totals[pid].pts, tried: totals[pid].tried, bonus: totals[pid].bonus, weeks: totals[pid].weeks.length };
      }).sort(function(a, b) { return b.pts - a.pts; });

      lbEl.innerHTML = '';
      sorted.forEach(function(row, i) {
        var isMe = row.pid === playerId;
        var colors = AVATAR_COLORS[i % AVATAR_COLORS.length];
        var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        var div = document.createElement('div');
        div.className = 'lb-row' + (isMe ? ' is-me' : '');
        div.innerHTML =
          '<span class="lb-rank">' + medal + '</span>' +
          '<div class="lb-avatar-md" style="background:' + colors[0] + ';color:' + colors[1] + '">' + getInitials(row.name) + '</div>' +
          '<div style="flex:1">' +
            '<div class="lb-name">' + row.name + (isMe ? ' <span style="font-size:0.75rem;color:var(--green-mid)">(you)</span>' : '') + '</div>' +
            '<div class="lb-sub">' + row.tried + ' tried · ' + row.bonus + ' bonus · ' + row.weeks + '/4 weeks</div>' +
          '</div>' +
          '<div class="lb-pts">' + row.pts + '</div>';
        lbEl.appendChild(div);
      });
    });
}

// ============================================
//  TAB SWITCHING
// ============================================
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('tab-btn-' + name).classList.add('active');
  if (name === 'leaderboard') loadLeaderboard();
}

// ============================================
//  HELPERS
// ============================================
function getInitials(name) {
  return (name || '?').split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
}

function showLoading(on) {
  document.getElementById('loading').style.display = on ? 'flex' : 'none';
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3000);
}
