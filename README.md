# 🥬 Fresh Tuesday Challenge

An employee wellness game — try a new fruit or vegetable every Tuesday for 4 weeks.
Chinese-origin items (lychee, kiwi, kumquat, snow peas, bamboo shoots, bean sprouts) earn bonus points.

---

## How to set this up (no coding knowledge needed)

### Step 1 — Set up your database (Supabase)

1. Go to **supabase.com** and create a free account
2. Click **New Project**, name it `fresh-tuesday`, set a password
3. Once it loads, click **SQL Editor** in the left sidebar
4. Click **New Query**, paste the entire contents of `schema.sql`, click **Run**
5. Go to **Project Settings → API**
6. Copy your **Project URL** and **anon public** key — you'll need them next

### Step 2 — Connect your app to the database

1. Open `app.js` in a text editor (Notepad works fine)
2. Find these two lines near the top:
   ```
   const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. Replace the placeholder text with your actual URL and key from Step 1
4. Save the file

### Step 3 — Put your files on GitHub

1. Go to **github.com** and create a free account
2. Click the **+** button → **New repository**
3. Name it `fresh-tuesday`, make it **Public**, click **Create repository**
4. Click **Add file → Upload files**
5. Upload all three files: `index.html`, `app.js`, `schema.sql`
6. Click **Commit changes**

### Step 4 — Make it live with Netlify (free hosting)

1. Go to **netlify.com** and sign up with your GitHub account
2. Click **Add new site → Import from Git**
3. Choose GitHub → choose your `fresh-tuesday` repo
4. Click **Deploy site**
5. Netlify gives you a link like `fresh-tuesday-abc123.netlify.app`
6. Share that link with your employees!

---

## Scoring

| Item type | Points |
|-----------|--------|
| Standard fruit or vegetable | 10 pts |
| Chinese-origin bonus item | 20 pts |
| Try at least one item all 4 weeks | +15 streak bonus |

### Bonus items (Chinese origin)
- 🍈 Lychee
- 🥝 Kiwi  
- 🍊 Kumquat
- 🫛 Snow peas
- 🎍 Bamboo shoots
- 🌱 Bean sprouts

---

## Files in this project

| File | What it does |
|------|-------------|
| `index.html` | The app — what employees see in their browser |
| `app.js` | The logic — handles login, points, leaderboard |
| `schema.sql` | The database — paste this into Supabase once |
| `README.md` | This guide |

---

## Need help?

If anything goes wrong, the most common issues are:
- **"Invalid API key"** → double-check you pasted the right key into app.js
- **"Row level security"** → make sure you ran the full schema.sql, not just part of it
- **Login not working** → in Supabase go to Authentication → Settings and make sure email confirmations are turned OFF for internal use
