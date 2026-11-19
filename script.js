'use strict';

/* =========================================================================
   ACE Prep — practice & mock exams for Google Cloud Associate Cloud Engineer
   Vanilla JS, no build step. Progress is stored in localStorage.
   ========================================================================= */

const LEGACY_STORAGE_KEY = 'acePrep.v1';
const THEME_KEY = 'acePrep.theme';
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
// Google does not publish the ACE passing score; 70% is a commonly used target.
const PASS_MARK = 70;
const MOCK_SIZES = { full: { n: 50, minutes: 120, label: 'Full · 50 questions · 2 h' },
                     half: { n: 25, minutes: 60, label: 'Half · 25 questions · 1 h' } };

// Domains and approximate weightings from the official exam guide (live version, Nov 2026).
const DOMAINS = [
  { id: 1, short: 'Setup', name: 'Setting up a cloud solution environment', weight: 0.20 },
  { id: 2, short: 'Plan & implement', name: 'Planning and implementing a cloud solution', weight: 0.30 },
  { id: 3, short: 'Operations', name: 'Ensuring successful operation of a cloud solution', weight: 0.30 },
  { id: 4, short: 'Access & security', name: 'Configuring access and security', weight: 0.20 },
];
const BANK_LABELS = {
  classic: 'Original set',
  'research-2026': '2026 research set',
};

const app = document.getElementById('app');
let QUESTIONS = [];
const QMAP = new Map();
let store = emptyStore();
let timerHandle = null;
let keyHandler = null;

// 'local' = static hosting, progress in this browser only.
// 'server' = ACE Prep server: Google sign-in, progress synced to the account.
let MODE = 'local';
let CONFIG = {};
let ME = null;
const sync = { timer: null, dirty: false, inFlight: false, status: 'saved' };

/* ---------- Utilities ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pct = (c, t) => (t ? Math.round((c / t) * 100) : 0);
const bankOf = (q) => q.bank || 'classic';
const bankLabel = (b) => BANK_LABELS[b] || b;
const domainById = (id) => DOMAINS.find((d) => d.id === id) || null;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s).padStart(2, '0')}s`;
}
function fmtClock(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(s).padStart(2, '0');
}
function fmtDate(ts, withTime = true) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    (withTime ? ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '');
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._h);
  toast._h = setTimeout(() => t.classList.remove('show'), 2600);
}
function level(p) {
  if (p >= PASS_MARK) return { cls: 'good', meter: '', icon: '✓', label: 'On track' };
  if (p >= 50) return { cls: 'warn', meter: 'warn', icon: '!', label: 'Needs work' };
  return { cls: 'bad', meter: 'bad', icon: '✕', label: 'Weak area' };
}

/* ---------- Storage ---------- */
function emptyStore() {
  return { version: 1, attempts: [], qstats: {}, session: null, prefs: { theme: 'auto', banks: null } };
}
function storageKey() {
  return MODE === 'server' && ME ? `${LEGACY_STORAGE_KEY}:u${ME.id}` : LEGACY_STORAGE_KEY;
}
function normalizeStore(s) {
  if (!s || s.version !== 1 || !Array.isArray(s.attempts)) return null;
  const base = emptyStore();
  return { ...base, ...s, qstats: s.qstats || {}, prefs: { ...base.prefs, ...(s.prefs || {}) } };
}
function readLocal(key = storageKey()) {
  try { return normalizeStore(JSON.parse(localStorage.getItem(key))); } catch (e) { return null; }
}
function loadStore() {
  return readLocal() || emptyStore();
}
function saveStore() {
  // Signed-out in server mode: nothing to save (and don't overwrite browser progress waiting to be imported).
  if (MODE === 'server' && !ME) return;
  store.updatedAt = Date.now();
  try {
    localStorage.setItem(storageKey(), JSON.stringify(store));
  } catch (e) {
    if (MODE === 'local') toast('Could not save progress — browser storage is full or disabled.');
  }
  if (MODE === 'server') scheduleSync();
}

/* ---------- Server sync ---------- */
async function api(method, url, body) {
  const opts = { method, credentials: 'same-origin', headers: { 'X-Requested-With': 'fetch' } };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((data && data.detail) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    err.retryAfter = Number(res.headers.get('Retry-After')) || 0;
    throw err;
  }
  return data;
}
function setSyncStatus(status) {
  sync.status = status;
  const el = document.getElementById('sync-status');
  if (!el) return;
  const labels = { saved: '✓ Saved', saving: 'Saving…', offline: '! Not saved — retrying' };
  el.textContent = labels[status] || '';
  el.className = 'sync-status ' + status;
}
function scheduleSync(delay = 1000) {
  sync.dirty = true;
  setSyncStatus('saving');
  clearTimeout(sync.timer);
  sync.timer = setTimeout(pushState, delay);
}
async function pushState() {
  if (!sync.dirty || MODE !== 'server') return;
  if (sync.inFlight) { scheduleSync(1500); return; }
  sync.dirty = false;
  sync.inFlight = true;
  try {
    await api('PUT', 'api/state', JSON.stringify(store));
    if (!sync.dirty) setSyncStatus('saved');
  } catch (err) {
    sync.dirty = true;
    if (err.status === 401) { toast('Your session ended — please sign in again.'); renderLogin(); return; }
    setSyncStatus('offline');
    clearTimeout(sync.timer);
    // Rate limited: wait as long as the server asks. Otherwise retry in 10 s.
    sync.timer = setTimeout(pushState, err.status === 429 ? Math.max(err.retryAfter, 2) * 1000 : 10000);
  } finally {
    sync.inFlight = false;
  }
}
function flushSync() {
  if (MODE !== 'server' || !sync.dirty) return;
  const body = JSON.stringify(store);
  // keepalive lets the request finish after the tab closes, but caps the body at 64 KB.
  fetch('api/state', {
    method: 'PUT', credentials: 'same-origin', keepalive: body.length < 60000, body,
    headers: { 'X-Requested-With': 'fetch', 'Content-Type': 'application/json' },
  }).then((r) => { if (r.ok) { sync.dirty = false; setSyncStatus('saved'); } }).catch(() => {});
}
window.addEventListener('pagehide', flushSync);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSync(); });

async function loadServerState() {
  const remote = await api('GET', 'api/state');
  const cached = readLocal();
  const serverState = normalizeStore(remote.state);
  if (serverState) {
    // Prefer a newer local copy (e.g. edits made while the network was down).
    const serverTs = (remote.updatedAt || 0) * 1000;
    store = cached && (cached.updatedAt || 0) > serverTs + 1000 ? cached : serverState;
    if (store === cached) scheduleSync(0);
  } else {
    // First sign-in: bring along progress saved in this browser before accounts existed.
    const legacy = cached || readLocal(LEGACY_STORAGE_KEY);
    store = legacy || emptyStore();
    if (legacy && legacy.attempts.length) {
      toast(`Imported ${legacy.attempts.length} saved session${legacy.attempts.length === 1 ? '' : 's'} from this browser into your account.`);
    }
    if (legacy) scheduleSync(0);
  }
  try { localStorage.setItem(storageKey(), JSON.stringify(store)); } catch (e) { /* cache only */ }
}

/* ---------- Theme ---------- */
function currentTheme() {
  return store.prefs.theme || localStorage.getItem(THEME_KEY) || 'auto';
}
function applyTheme() {
  const t = currentTheme();
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignore */ }
  document.getElementById('theme-toggle').textContent = 'Theme: ' + t;
}
document.getElementById('theme-toggle').addEventListener('click', () => {
  const order = ['auto', 'light', 'dark'];
  store.prefs.theme = order[(order.indexOf(currentTheme()) + 1) % order.length];
  saveStore();
  applyTheme();
});

/* ---------- Question pools ---------- */
function allBanks() {
  return [...new Set(QUESTIONS.map(bankOf))];
}
function selectedBanks() {
  const banks = allBanks();
  const chosen = (store.prefs.banks || banks).filter((b) => banks.includes(b));
  return chosen.length ? chosen : banks;
}
function poolFor({ banks = selectedBanks(), domain = 'all' } = {}) {
  return QUESTIONS.filter((q) => banks.includes(bankOf(q)) &&
    (domain === 'all' || (domain === 'none' ? !q.domain : q.domain === Number(domain))));
}
function pickWeighted(pool, n) {
  const byDomain = new Map();
  pool.forEach((q) => {
    const k = q.domain || 0;
    if (!byDomain.has(k)) byDomain.set(k, []);
    byDomain.get(k).push(q);
  });
  for (const [k, list] of byDomain) byDomain.set(k, shuffle(list));
  let chosen = [];
  DOMAINS.forEach((d) => {
    const list = byDomain.get(d.id) || [];
    chosen.push(...list.splice(0, Math.round(n * d.weight)));
  });
  chosen = shuffle(chosen).slice(0, n);
  const rest = shuffle([...byDomain.values()].flat());
  while (chosen.length < n && rest.length) chosen.push(rest.pop());
  return shuffle(chosen);
}
function missedQids() {
  return Object.entries(store.qstats)
    .filter(([qid, st]) => st.last === false && QMAP.has(qid))
    .map(([qid]) => qid);
}

/* ---------- Sessions ---------- */
function startSession({ mode, title, qids, minutes = null }) {
  if (!qids.length) { toast('No questions match that selection.'); return; }
  if (store.session && !confirm('You have an unfinished session. Discard it and start a new one?')) return;
  const now = Date.now();
  store.session = {
    id: uid(), mode, title, qids, answers: {}, flagged: {}, index: 0,
    startedAt: now, deadline: minutes ? now + minutes * 60000 : null, limitSec: minutes ? minutes * 60 : null,
  };
  saveStore();
  nav('#/quiz');
}

function finishSession({ auto = false } = {}) {
  const s = store.session;
  if (!s) return;
  stopTimer();
  const items = s.qids.filter((qid) => QMAP.has(qid)).map((qid) => {
    const q = QMAP.get(qid);
    const chosen = s.answers[qid] ?? null;
    return { qid, chosen, ok: chosen === q.correct, domain: q.domain || 0 };
  });
  // Mock exams score every question (blank = wrong). Practice scores only what was answered.
  const scored = s.mode === 'mock' ? items : items.filter((i) => i.chosen !== null);
  if (!scored.length) {
    store.session = null;
    saveStore();
    toast('Session ended — nothing was answered, so nothing was saved.');
    nav('#/home');
    return;
  }
  const finishedAt = Date.now();
  const correct = scored.filter((i) => i.ok).length;
  const byDomain = {};
  scored.forEach((i) => {
    const d = (byDomain[i.domain] ||= { c: 0, t: 0 });
    d.t++;
    if (i.ok) d.c++;
  });
  let durationSec = Math.round((finishedAt - s.startedAt) / 1000);
  if (s.limitSec) durationSec = Math.min(durationSec, s.limitSec);
  const attempt = {
    id: s.id, mode: s.mode, title: s.title, startedAt: s.startedAt, finishedAt, durationSec,
    total: scored.length, correct, pct: pct(correct, scored.length), byDomain, timedOut: auto,
    items: scored.map(({ qid, chosen, ok }) => ({ qid, chosen, ok })),
    flagged: Object.keys(s.flagged).filter((k) => s.flagged[k]),
  };
  scored.forEach((i) => {
    const st = (store.qstats[i.qid] ||= { seen: 0, correct: 0 });
    st.seen++;
    if (i.ok) st.correct++;
    st.last = i.ok;
    st.lastAt = finishedAt;
  });
  store.attempts.push(attempt);
  store.session = null;
  saveStore();
  if (auto) toast("Time's up — your exam was submitted automatically.");
  nav('#/results/' + attempt.id);
}

/* ---------- Routing ---------- */
function nav(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}
function route() {
  stopTimer();
  hideTooltip();
  if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
  const [, view, arg] = (location.hash || '#/home').split('/');
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === (view || 'home')));
  if (MODE === 'server' && !ME) renderLogin();
  else if (view === 'quiz' && store.session) renderQuiz();
  else if (view === 'results' && arg) renderResults(arg);
  else if (view === 'history') renderHistory();
  else if (view === 'admin' && ME && ME.role === 'admin') (arg ? renderAdminUser(Number(arg)) : renderAdmin());
  else renderHome();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* =========================================================================
   Dashboard
   ========================================================================= */
function renderHome() {
  const banks = allBanks();
  const sel = selectedBanks();
  const pool = poolFor();
  const mocks = store.attempts.filter((a) => a.mode === 'mock');
  const answered = store.attempts.reduce((n, a) => n + a.total, 0);
  const correctAll = store.attempts.reduce((n, a) => n + a.correct, 0);
  const best = mocks.length ? Math.max(...mocks.map((a) => a.pct)) : null;
  const last5 = mocks.slice(-5);
  const avg5 = last5.length ? Math.round(last5.reduce((n, a) => n + a.pct, 0) / last5.length) : null;
  const missed = missedQids().filter((qid) => sel.includes(bankOf(QMAP.get(qid))));
  const domainCounts = DOMAINS.map((d) => ({ d, n: pool.filter((q) => q.domain === d.id).length }));
  const untagged = pool.filter((q) => !q.domain).length;
  const s = store.session;

  app.innerHTML = `
    <section class="welcome">
      <div>
        <h1>Associate Cloud Engineer prep</h1>
        <p class="muted">${QUESTIONS.length} questions · progress saved in this browser</p>
      </div>
    </section>

    ${banks.length > 1 ? `
    <div class="filter-row" role="group" aria-label="Question banks">
      <span class="label">Question banks</span>
      <div class="chips">
        ${banks.map((b) => `
          <label class="chip-toggle"><input type="checkbox" name="bank" value="${esc(b)}" ${sel.includes(b) ? 'checked' : ''}>
          <span>${esc(bankLabel(b))} · ${QUESTIONS.filter((q) => bankOf(q) === b).length}</span></label>`).join('')}
      </div>
    </div>` : ''}

    ${s ? `
    <div class="card resume">
      <div>
        <strong>Unfinished: ${esc(s.title)}</strong>
        <div class="muted small">${Object.keys(s.answers).length} of ${s.qids.length} answered${s.deadline ? ` · ${fmtClock((s.deadline - Date.now()) / 1000)} left` : ''}</div>
      </div>
      <div class="btn-row">
        <button class="btn" data-act="resume">Resume</button>
        <button class="btn secondary" data-act="discard">Discard</button>
      </div>
    </div>` : ''}

    <div class="tiles" aria-label="Summary">
      <div class="card tile"><div class="t-label">Mock exams taken</div><div class="t-value">${mocks.length}</div><div class="t-sub">${store.attempts.length - mocks.length} practice sessions</div></div>
      <div class="card tile"><div class="t-label">Best mock score</div><div class="t-value">${best === null ? '—' : best + '%'}</div><div class="t-sub">Target ${PASS_MARK}%</div></div>
      <div class="card tile"><div class="t-label">Average, last 5 mocks</div><div class="t-value">${avg5 === null ? '—' : avg5 + '%'}</div><div class="t-sub">${last5.length ? last5.length + ' counted' : 'No mocks yet'}</div></div>
      <div class="card tile"><div class="t-label">Questions answered</div><div class="t-value">${answered.toLocaleString()}</div><div class="t-sub">${answered ? pct(correctAll, answered) + '% correct overall' : 'Start below'}</div></div>
    </div>

    <section class="section">
      <div class="section-head"><h2>Start studying</h2><span class="muted small">${pool.length} questions in selected banks</span></div>
      <div class="grid grid-3">
        <div class="card mode-card">
          <div class="mode-icon" aria-hidden="true">⏱</div>
          <h3>Mock exam</h3>
          <p>Timed, weighted by exam domain. Answers and explanations are revealed at the end, like the real thing.</p>
          <div class="controls">
            <label class="field">Length
              <select id="mock-size">
                ${Object.entries(MOCK_SIZES).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('')}
              </select>
            </label>
          </div>
          <button class="btn" data-act="mock">Start mock exam</button>
        </div>

        <div class="card mode-card">
          <div class="mode-icon" aria-hidden="true">✎</div>
          <h3>Practice</h3>
          <p>Pick an answer and see straight away whether you were right, with the explanation.</p>
          <div class="controls">
            <label class="field">Domain
              <select id="prac-domain">
                <option value="all" data-n="${pool.length}">All domains (${pool.length})</option>
                ${domainCounts.map(({ d, n }) => `<option value="${d.id}" data-n="${n}" title="${esc(d.name)}" ${n ? '' : 'disabled'}>Domain ${d.id}: ${esc(d.short)} (${n})</option>`).join('')}
                ${untagged ? `<option value="none" data-n="${untagged}">Untagged (${untagged})</option>` : ''}
              </select>
            </label>
            <div class="field">
              <label for="prac-count">Number of questions</label>
              <div class="count-row">
                <input type="number" id="prac-count" min="1" max="${pool.length}" step="1" inputmode="numeric"
                  value="${Math.min(store.prefs.pracCount || 20, pool.length || 1)}">
                <div class="presets" role="group" aria-label="Quick picks">
                  ${[10, 20, 50].map((n) => `<button type="button" class="preset" data-count="${n}">${n}</button>`).join('')}
                  <button type="button" class="preset" data-count="all">All</button>
                </div>
              </div>
              <span class="muted small" id="prac-avail"></span>
            </div>
          </div>
          <button class="btn" data-act="practice">Start practice</button>
        </div>

        <div class="card mode-card">
          <div class="mode-icon" aria-hidden="true">↺</div>
          <h3>Review mistakes</h3>
          <p>${missed.length
            ? `${missed.length} question${missed.length === 1 ? '' : 's'} you got wrong the last time you saw ${missed.length === 1 ? 'it' : 'them'}. Get one right and it drops off this list.`
            : 'Questions you get wrong will collect here so you can drill them.'}</p>
          <button class="btn" data-act="review" ${missed.length ? '' : 'disabled'}>Review ${missed.length || ''} mistakes</button>
        </div>
      </div>
    </section>

    <section class="section grid grid-2">
      <div class="card">
        <div class="section-head">
          <div><h2>Score trend</h2><span class="muted small" id="trend-sub"></span></div>
          <div class="btn-row" role="group" aria-label="Sessions to chart">
            <button class="ghost small" data-trend="mock">Mock exams</button>
            <button class="ghost small" data-trend="all">All sessions</button>
          </div>
        </div>
        <div id="trend"></div>
      </div>
      <div class="card">
        <div class="section-head"><h2>Accuracy by domain</h2><span class="muted small">All sessions</span></div>
        ${domainMeters(aggregateDomains(store.attempts))}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Recent sessions</h2>${store.attempts.length ? '<a href="#/history">View all history →</a>' : ''}</div>
      ${attemptsTable(store.attempts.slice(-5).reverse(), { compact: true })}
    </section>
  `;

  // Wire controls
  app.querySelectorAll('input[name="bank"]').forEach((cb) => cb.addEventListener('change', () => {
    const chosen = [...app.querySelectorAll('input[name="bank"]:checked')].map((i) => i.value);
    if (!chosen.length) { cb.checked = true; toast('Keep at least one bank selected.'); return; }
    store.prefs.banks = chosen;
    saveStore();
    renderHome();
  }));
  app.querySelector('[data-act="mock"]').addEventListener('click', () => {
    const cfg = MOCK_SIZES[app.querySelector('#mock-size').value];
    const qs = pickWeighted(poolFor(), cfg.n);
    if (qs.length < cfg.n) toast(`Only ${qs.length} questions available — mock shortened.`);
    startSession({ mode: 'mock', title: `Mock exam (${qs.length} Q)`, qids: qs.map((q) => q.id), minutes: Math.round(cfg.minutes * qs.length / cfg.n) || 1 });
  });
  const domainSel = app.querySelector('#prac-domain');
  const countInput = app.querySelector('#prac-count');
  const available = () => Number(domainSel.selectedOptions[0]?.dataset.n || 0);
  const syncCount = () => {
    const max = available();
    countInput.max = String(Math.max(1, max));
    const v = Number(countInput.value);
    if (v > max) countInput.value = String(max);
    app.querySelector('#prac-avail').textContent = `1–${max} · ${max} available in this domain`;
    app.querySelectorAll('.preset').forEach((b) => {
      const n = b.dataset.count === 'all' ? max : Number(b.dataset.count);
      b.disabled = b.dataset.count !== 'all' && n > max;
      b.classList.toggle('active', Number(countInput.value) === n);
      b.setAttribute('aria-pressed', Number(countInput.value) === n);
    });
  };
  domainSel.addEventListener('change', syncCount);
  countInput.addEventListener('input', syncCount);
  app.querySelectorAll('.preset').forEach((b) => b.addEventListener('click', () => {
    countInput.value = String(b.dataset.count === 'all' ? available() : b.dataset.count);
    syncCount();
  }));
  syncCount();

  app.querySelector('[data-act="practice"]').addEventListener('click', () => {
    const domain = domainSel.value;
    const max = available();
    const n = Math.floor(Number(countInput.value));
    if (!Number.isFinite(n) || n < 1 || n > max) {
      toast(`Enter a number of questions between 1 and ${max}.`);
      countInput.focus();
      return;
    }
    store.prefs.pracCount = n;
    const qs = shuffle(poolFor({ domain })).slice(0, n);
    const d = domainById(Number(domain));
    startSession({ mode: 'practice', title: `Practice · ${d ? d.short : domain === 'none' ? 'Untagged' : 'All domains'}`, qids: qs.map((q) => q.id) });
  });
  app.querySelector('[data-act="review"]').addEventListener('click', () => {
    startSession({ mode: 'review', title: 'Review mistakes', qids: shuffle(missed) });
  });
  app.querySelector('[data-act="resume"]')?.addEventListener('click', () => nav('#/quiz'));
  app.querySelector('[data-act="discard"]')?.addEventListener('click', () => {
    if (!confirm('Discard this unfinished session? Its answers will not be saved.')) return;
    store.session = null;
    saveStore();
    renderHome();
  });

  const trendMode = store.prefs.trend || 'mock';
  const drawTrend = (m) => {
    store.prefs.trend = m;
    saveStore();
    app.querySelectorAll('[data-trend]').forEach((b) => {
      b.classList.toggle('active', b.dataset.trend === m);
      b.setAttribute('aria-pressed', b.dataset.trend === m);
    });
    const list = m === 'mock' ? mocks : store.attempts;
    app.querySelector('#trend-sub').textContent = m === 'mock' ? 'Mock exam scores' : 'Every saved session';
    renderTrend(app.querySelector('#trend'), list);
  };
  app.querySelectorAll('[data-trend]').forEach((b) => b.addEventListener('click', () => drawTrend(b.dataset.trend)));
  drawTrend(trendMode);
}

function aggregateDomains(attempts) {
  const agg = {};
  attempts.forEach((a) => Object.entries(a.byDomain || {}).forEach(([k, v]) => {
    const d = (agg[k] ||= { c: 0, t: 0 });
    d.c += v.c;
    d.t += v.t;
  }));
  return agg;
}

function domainMeters(agg) {
  const rows = DOMAINS.map((d) => ({ name: `${d.id}. ${d.name}`, sub: `${Math.round(d.weight * 100)}% of exam`, v: agg[d.id] }));
  if (agg[0]) rows.push({ name: 'Untagged questions', sub: '', v: agg[0] });
  return `<div class="meters">${rows.map(({ name, sub, v }) => {
    if (!v || !v.t) {
      return `<div class="meter-row">
        <div class="m-head"><span class="m-name">${esc(name)}</span><span class="m-val"><span class="status na">No data yet</span></span></div>
        <div class="meter none" role="img" aria-label="${esc(name)}: no data yet"></div>
        ${sub ? `<div class="muted small">${esc(sub)}</div>` : ''}</div>`;
    }
    const p = pct(v.c, v.t);
    const lv = level(p);
    return `<div class="meter-row">
      <div class="m-head"><span class="m-name">${esc(name)}</span>
        <span class="m-val">${p}% · ${v.c}/${v.t}</span></div>
      <div class="meter ${lv.meter}" role="img" aria-label="${esc(name)}: ${p}% correct, ${lv.label}"><span style="width:${p}%"></span></div>
      <div class="m-head small" style="margin-top:0.25rem"><span class="muted">${esc(sub)}</span><span class="status ${lv.cls}"><span aria-hidden="true">${lv.icon}</span>${lv.label}</span></div>
    </div>`;
  }).join('')}</div>`;
}

function attemptsTable(list, { compact = false, links = true } = {}) {
  if (!list.length) return `<div class="card chart-empty">No sessions yet. Your scores will appear here after you finish one.</div>`;
  return `<div class="card table-wrap" style="padding:0">
    <table>
      <thead><tr>
        <th>Date</th><th>Session</th><th class="num">Score</th><th class="num">Correct</th>
        ${compact ? '' : '<th class="num">Time</th>'}<th>Result</th><th><span class="sr-only"></span></th>
      </tr></thead>
      <tbody>${list.map((a) => {
        const lv = a.pct >= PASS_MARK;
        return `<tr>
          <td>${esc(fmtDate(a.finishedAt))}</td>
          <td><span class="pill ${a.mode === 'mock' ? 'mock' : ''}">${a.mode === 'mock' ? 'Mock' : a.mode === 'review' ? 'Review' : 'Practice'}</span> ${esc(a.title)}</td>
          <td class="num"><strong>${a.pct}%</strong></td>
          <td class="num">${a.correct}/${a.total}</td>
          ${compact ? '' : `<td class="num">${esc(fmtDuration(a.durationSec))}</td>`}
          <td><span class="status ${lv ? 'good' : 'bad'}"><span aria-hidden="true">${lv ? '✓' : '✕'}</span>${lv ? 'At target' : 'Below target'}</span></td>
          <td>${links ? `<a href="#/results/${esc(a.id)}">Review</a>` : ''}</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
}

/* ---------- Trend chart (inline SVG, single series) ---------- */
function renderTrend(el, attempts) {
  hideTooltip();
  if (attempts.length < 2) {
    el.innerHTML = `<div class="chart-empty">${attempts.length === 1
      ? `One session so far: <strong>${attempts[0].pct}%</strong>. Finish another to see a trend.`
      : 'Finish a session to start your score trend.'}</div>`;
    return;
  }
  const W = 560, H = 230, m = { t: 16, r: 44, b: 30, l: 40 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const n = attempts.length;
  const x = (i) => m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => m.t + ih - (v / 100) * ih;
  const pts = attempts.map((a, i) => [x(i), y(a.pct)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${pts[n - 1][0].toFixed(1)} ${y(0)} L${pts[0][0].toFixed(1)} ${y(0)} Z`;
  const ticks = [0, 25, 50, 75, 100];
  const last = attempts[n - 1];

  el.innerHTML = `
    <div class="chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" role="img" tabindex="0"
           aria-label="Score trend across ${n} sessions. Latest ${last.pct}%. Use left and right arrow keys to inspect points.">
        ${ticks.map((t) => `
          <line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}" stroke="var(--${t === 0 ? 'axis' : 'grid'})" stroke-width="1"/>
          <text x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="var(--axis-muted)" style="font-variant-numeric:tabular-nums">${t}%</text>`).join('')}
        <line x1="${m.l}" x2="${W - m.r}" y1="${y(PASS_MARK)}" y2="${y(PASS_MARK)}" stroke="var(--ink-2)" stroke-width="1" opacity="0.7"/>
        <text x="${W - m.r + 6}" y="${y(PASS_MARK) + 4}" font-size="11" fill="var(--ink-2)">Target</text>
        <path d="${area}" fill="var(--accent-wash)"/>
        <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        <text x="${m.l}" y="${H - 8}" font-size="11" fill="var(--axis-muted)">${esc(fmtDate(attempts[0].finishedAt, false))}</text>
        <text x="${W - m.r}" y="${H - 8}" font-size="11" fill="var(--axis-muted)" text-anchor="end">${esc(fmtDate(last.finishedAt, false))}</text>
        <line class="crosshair" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="var(--axis-muted)" stroke-width="1" visibility="hidden"/>
        <circle cx="${pts[n - 1][0]}" cy="${pts[n - 1][1]}" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>
        <text x="${pts[n - 1][0] + 9}" y="${pts[n - 1][1] - 8}" font-size="12" font-weight="700" fill="var(--ink)">${last.pct}%</text>
        <circle class="hover-dot" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2" visibility="hidden"/>
        <rect class="hit" x="${m.l - 10}" y="${m.t}" width="${iw + 20}" height="${ih}" fill="transparent"/>
      </svg>
    </div>`;

  const svg = el.querySelector('svg');
  const cross = svg.querySelector('.crosshair');
  const dot = svg.querySelector('.hover-dot');
  let active = -1;

  const show = (i, clientPos) => {
    active = i;
    const [px, py] = pts[i];
    cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('visibility', 'visible');
    const a = attempts[i];
    const tt = document.getElementById('chart-tooltip');
    tt.replaceChildren();
    const v = document.createElement('div'); v.className = 'tt-value';
    const key = document.createElement('span'); key.className = 'tt-key';
    v.append(key, document.createTextNode(`${a.pct}%  (${a.correct}/${a.total})`));
    const l1 = document.createElement('div'); l1.className = 'tt-label'; l1.textContent = a.title;
    const l2 = document.createElement('div'); l2.className = 'tt-label'; l2.textContent = fmtDate(a.finishedAt);
    tt.append(v, l1, l2);
    tt.hidden = false;
    const r = svg.getBoundingClientRect();
    const sx = r.left + (px / W) * r.width, sy = r.top + (py / H) * r.height;
    const pos = clientPos || { x: sx, y: sy };
    const ttw = tt.offsetWidth, tth = tt.offsetHeight;
    let left = pos.x + 14, top = sy - tth - 12;
    if (left + ttw > window.innerWidth - 8) left = pos.x - ttw - 14;
    if (top < 8) top = sy + 14;
    tt.style.left = left + 'px';
    tt.style.top = top + 'px';
  };
  const hide = () => {
    active = -1;
    cross.setAttribute('visibility', 'hidden');
    dot.setAttribute('visibility', 'hidden');
    hideTooltip();
  };
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    pts.forEach((p, i) => { if (Math.abs(p[0] - vx) < Math.abs(pts[best][0] - vx)) best = i; });
    show(best, { x: e.clientX, y: e.clientY });
  });
  svg.addEventListener('pointerleave', hide);
  svg.addEventListener('blur', hide);
  svg.addEventListener('focus', () => show(n - 1));
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const i = active < 0 ? n - 1 : Math.max(0, Math.min(n - 1, active + (e.key === 'ArrowLeft' ? -1 : 1)));
      show(i);
    } else if (e.key === 'Enter' && active >= 0) {
      nav('#/results/' + attempts[active].id);
    }
  });
  svg.addEventListener('click', () => { if (active >= 0) nav('#/results/' + attempts[active].id); });
  svg.style.cursor = 'pointer';
}
function hideTooltip() {
  const tt = document.getElementById('chart-tooltip');
  if (tt) tt.hidden = true;
}

/* =========================================================================
   Quiz
   ========================================================================= */
function renderQuiz() {
  const s = store.session;
  s.qids = s.qids.filter((qid) => QMAP.has(qid));
  if (!s.qids.length) { store.session = null; saveStore(); nav('#/home'); return; }
  s.index = Math.min(s.index, s.qids.length - 1);
  const isMock = s.mode === 'mock';
  const qid = s.qids[s.index];
  const q = QMAP.get(qid);
  const chosen = s.answers[qid];
  const revealed = !isMock && chosen !== undefined;
  const answeredCount = Object.keys(s.answers).filter((k) => s.qids.includes(k)).length;
  const isLast = s.index === s.qids.length - 1;
  const d = domainById(q.domain);

  const optionHtml = q.options.map((opt, i) => {
    let cls = '', flag = '';
    if (revealed) {
      if (i === q.correct) { cls = 'is-correct'; flag = i === chosen ? '✓ Your answer' : '✓ Correct answer'; }
      else if (i === chosen) { cls = 'is-wrong'; flag = '✕ Your answer'; }
      else cls = 'dim';
    } else if (i === chosen) cls = 'selected';
    return `<li><button type="button" class="option ${cls}" data-i="${i}" ${revealed ? 'disabled' : ''}
        aria-pressed="${i === chosen}">
      <span class="letter">${LETTERS[i]}</span><span class="o-text">${esc(opt)}</span>
      ${flag ? `<span class="o-flag">${flag}</span>` : ''}</button></li>`;
  }).join('');

  const ok = chosen === q.correct;
  app.innerHTML = `
    <div class="quiz-bar">
      <div>
        <div class="q-title">${esc(s.title)}</div>
        <div class="q-meta">Question ${s.index + 1} of ${s.qids.length} · ${answeredCount} answered</div>
      </div>
      <div class="btn-row">
        ${s.deadline ? `<span class="timer" id="timer" aria-label="Time remaining">--:--</span>` : ''}
        <button class="btn secondary" data-act="exit" title="Your progress is kept; resume from the dashboard">Save &amp; exit</button>
        <button class="btn ${isMock ? '' : 'secondary'}" data-act="finish">${isMock ? 'Submit exam' : 'Finish session'}</button>
      </div>
    </div>
    <div class="progress" aria-hidden="true"><span style="width:${pct(isMock ? answeredCount : s.index + (revealed ? 1 : 0), s.qids.length)}%"></span></div>

    <article class="card q-card">
      <div class="q-tags">
        ${d ? `<span class="pill">${esc(d.short)}</span>` : ''}
        <span class="pill">${esc(bankLabel(bankOf(q)))}</span>
        ${q.topic ? `<span class="pill">${esc(q.topic)}</span>` : ''}
        ${isMock && s.flagged[qid] ? '<span class="pill" style="color:var(--warning-text)">⚑ Flagged</span>' : ''}
      </div>
      <p class="q-text">${esc(q.question)}</p>
      <ul class="options" aria-label="Answer options">${optionHtml}</ul>

      ${revealed ? `
        <div class="feedback ${ok ? '' : 'wrong'}" role="status">
          <div class="verdict ${ok ? 'good' : 'bad'}">${ok ? '✓ Correct' : `✕ Not quite — the answer is ${LETTERS[q.correct]}`}</div>
          <p class="explain">${esc(q.explanation)}</p>
        </div>` : ''}

      <div class="quiz-actions">
        <div class="btn-row">
          ${s.index > 0 ? '<button class="btn secondary" data-act="prev">← Previous</button>' : ''}
          ${isMock ? `<button class="btn secondary" data-act="flag" aria-pressed="${!!s.flagged[qid]}">${s.flagged[qid] ? '⚑ Unflag' : '⚐ Flag for review'}</button>` : ''}
        </div>
        <div class="btn-row">
          ${isLast
            ? `<button class="btn" data-act="finish" ${!isMock && !revealed && answeredCount === 0 ? 'disabled' : ''}>${isMock ? 'Submit exam' : 'See results'}</button>`
            : `<button class="btn" data-act="next" ${!isMock && !revealed ? 'disabled' : ''}>${!isMock && !revealed ? 'Pick an answer' : 'Next →'}</button>`}
          ${!isMock && !revealed && !isLast ? '<button class="ghost" data-act="skip">Skip</button>' : ''}
        </div>
      </div>
      <div class="kbd-hint">Keys: <kbd>A</kbd>–<kbd>${LETTERS[q.options.length - 1]}</kbd> or <kbd>1</kbd>–<kbd>${q.options.length}</kbd> to answer · <kbd>←</kbd> <kbd>→</kbd> to move${isMock ? ' · <kbd>F</kbd> to flag' : ''}</div>
    </article>

    ${isMock ? `
    <section class="card navigator" aria-label="Question navigator">
      <div class="section-head"><h3 style="margin:0">Questions</h3>
        <span class="muted small">${answeredCount}/${s.qids.length} answered · ${Object.values(s.flagged).filter(Boolean).length} flagged</span></div>
      <div class="nav-grid">
        ${s.qids.map((id, i) => `<button class="nav-cell ${s.answers[id] !== undefined ? 'answered' : ''} ${s.flagged[id] ? 'flagged' : ''} ${i === s.index ? 'current' : ''}"
            data-go="${i}" aria-label="Question ${i + 1}${s.answers[id] !== undefined ? ', answered' : ''}${s.flagged[id] ? ', flagged' : ''}">${i + 1}</button>`).join('')}
      </div>
      <div class="nav-legend"><span>■ Answered</span><span>□ Not answered</span><span>⚑ Flagged</span></div>
    </section>` : ''}
  `;

  const go = (i) => {
    s.index = Math.max(0, Math.min(s.qids.length - 1, i));
    saveStore();
    renderQuiz();
    window.scrollTo({ top: 0 });
  };
  const choose = (i) => {
    if (revealed || i >= q.options.length) return;
    s.answers[qid] = i;
    saveStore();
    renderQuiz();
  };
  const finish = () => {
    if (isMock) {
      const blank = s.qids.length - answeredCount;
      const msg = blank ? `You have ${blank} unanswered question${blank === 1 ? '' : 's'} — they will count as wrong. Submit anyway?` : 'Submit your exam?';
      if (!confirm(msg)) return;
    }
    finishSession();
  };

  app.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => choose(Number(b.dataset.i))));
  app.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.go))));
  app.querySelector('[data-act="prev"]')?.addEventListener('click', () => go(s.index - 1));
  app.querySelector('[data-act="next"]')?.addEventListener('click', () => go(s.index + 1));
  app.querySelector('[data-act="skip"]')?.addEventListener('click', () => go(s.index + 1));
  app.querySelectorAll('[data-act="finish"]').forEach((b) => b.addEventListener('click', finish));
  app.querySelector('[data-act="exit"]').addEventListener('click', () => { saveStore(); nav('#/home'); });
  app.querySelector('[data-act="flag"]')?.addEventListener('click', () => {
    s.flagged[qid] = !s.flagged[qid];
    saveStore();
    renderQuiz();
  });

  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    const li = LETTERS.map((l) => l.toLowerCase()).indexOf(k);
    if (li >= 0 && li < q.options.length) { e.preventDefault(); choose(li); }
    else if (/^[1-6]$/.test(k) && Number(k) <= q.options.length) { e.preventDefault(); choose(Number(k) - 1); }
    else if (k === 'arrowright' || (k === 'enter' && e.target.tagName !== 'BUTTON')) {
      if (isMock || revealed) {
        e.preventDefault();
        if (isLast) { if (k === 'enter') finish(); }
        else go(s.index + 1);
      }
    } else if (k === 'arrowleft' && s.index > 0) { e.preventDefault(); go(s.index - 1); }
    else if (k === 'f' && isMock) { e.preventDefault(); s.flagged[qid] = !s.flagged[qid]; saveStore(); renderQuiz(); }
  };
  document.addEventListener('keydown', keyHandler);

  if (s.deadline) startTimer();
}

function startTimer() {
  stopTimer();
  const tick = () => {
    const s = store.session;
    const el = document.getElementById('timer');
    if (!s || !s.deadline || !el) { stopTimer(); return; }
    const left = (s.deadline - Date.now()) / 1000;
    el.textContent = '⏱ ' + fmtClock(left);
    el.classList.toggle('low', left <= 300);
    if (left <= 0) finishSession({ auto: true });
  };
  tick();
  timerHandle = setInterval(tick, 1000);
}
function stopTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
}

/* =========================================================================
   Results
   ========================================================================= */
function renderResults(id) {
  const a = store.attempts.find((x) => x.id === id);
  if (!a) {
    app.innerHTML = `<div class="card chart-empty">That session could not be found. <a href="#/home">Back to dashboard</a></div>`;
    return;
  }
  const passed = a.pct >= PASS_MARK;
  const wrong = a.items.filter((i) => !i.ok && QMAP.has(i.qid)).map((i) => i.qid);
  const flagged = new Set(a.flagged || []);
  let filter = 'all';

  const draw = () => {
    const items = a.items.filter((i) => QMAP.has(i.qid) &&
      (filter === 'all' || (filter === 'wrong' && !i.ok) || (filter === 'flagged' && flagged.has(i.qid))));
    app.querySelector('#review-list').innerHTML = items.length ? items.map((it) => {
      const q = QMAP.get(it.qid);
      const n = a.items.indexOf(it) + 1;
      const d = domainById(q.domain);
      return `<article class="card review-item">
        <div class="ri-head">
          <strong>Question ${n}</strong>
          <span class="status ${it.ok ? 'good' : 'bad'}"><span aria-hidden="true">${it.ok ? '✓' : '✕'}</span>${it.ok ? 'Correct' : it.chosen === null ? 'Not answered' : 'Incorrect'}</span>
        </div>
        <div class="muted small">${d ? esc(d.short) : 'Untagged'}${flagged.has(it.qid) ? ' · ⚑ flagged' : ''}</div>
        <p class="ri-q">${esc(q.question)}</p>
        <ul>${q.options.map((o, i) => {
          const isC = i === q.correct, isMine = i === it.chosen;
          return `<li class="${isC ? 'c' : isMine ? 'w' : ''}"><strong>${LETTERS[i]}</strong><span>${esc(o)}</span>
            ${isC ? `<span class="tag">✓ Correct${isMine ? ' · your answer' : ''}</span>` : isMine ? '<span class="tag">✕ Your answer</span>' : ''}</li>`;
        }).join('')}</ul>
        <details ${it.ok ? '' : 'open'}><summary>Explanation</summary><p>${esc(q.explanation)}</p></details>
      </article>`;
    }).join('') : '<div class="card chart-empty">Nothing to show for this filter.</div>';
    app.querySelectorAll('[data-filter]').forEach((b) => {
      b.classList.toggle('active', b.dataset.filter === filter);
      b.setAttribute('aria-pressed', b.dataset.filter === filter);
    });
  };

  app.innerHTML = `
    <p><a href="#/home">← Dashboard</a></p>
    <section class="card">
      <div class="result-hero">
        <div>
          <div class="hero-figure">${a.pct}%</div>
          <div class="hero-sub">${a.correct} of ${a.total} correct</div>
        </div>
        <div>
          <h1 style="margin-bottom:0.4rem">${esc(a.title)}</h1>
          <span class="badge ${passed ? 'pass' : 'fail'}"><span aria-hidden="true">${passed ? '✓' : '✕'}</span>${passed ? `At or above the ${PASS_MARK}% target` : `Below the ${PASS_MARK}% target`}</span>
          <div class="facts">
            <span>Finished <strong>${esc(fmtDate(a.finishedAt))}</strong></span>
            <span>Time <strong>${esc(fmtDuration(a.durationSec))}</strong>${a.timedOut ? ' (time ran out)' : ''}</span>
            <span>Type <strong>${a.mode === 'mock' ? 'Mock exam' : a.mode === 'review' ? 'Mistake review' : 'Practice'}</strong></span>
          </div>
        </div>
      </div>
      <div class="btn-row" style="margin-top:1.25rem">
        ${wrong.length ? `<button class="btn" data-act="retry-wrong">Practise the ${wrong.length} you missed</button>` : ''}
        <button class="btn secondary" data-act="retry-all">Retake these questions</button>
        <a class="btn secondary" href="#/home">New session</a>
      </div>
    </section>

    <section class="section card">
      <div class="section-head"><h2>By domain</h2><span class="muted small">This session</span></div>
      ${domainMeters(a.byDomain || {})}
    </section>

    <section class="section">
      <div class="section-head">
        <h2>Review answers</h2>
        <div class="btn-row" role="group" aria-label="Filter questions">
          <button class="ghost" data-filter="all">All (${a.items.length})</button>
          <button class="ghost" data-filter="wrong">Incorrect (${wrong.length})</button>
          ${flagged.size ? `<button class="ghost" data-filter="flagged">Flagged (${flagged.size})</button>` : ''}
        </div>
      </div>
      <div id="review-list"></div>
    </section>
  `;

  app.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.filter; draw(); }));
  app.querySelector('[data-act="retry-wrong"]')?.addEventListener('click', () =>
    startSession({ mode: 'review', title: 'Retry missed questions', qids: shuffle(wrong) }));
  app.querySelector('[data-act="retry-all"]').addEventListener('click', () => {
    const qids = shuffle(a.items.map((i) => i.qid).filter((q) => QMAP.has(q)));
    if (a.mode === 'mock') startSession({ mode: 'mock', title: `Mock exam retake (${qids.length} Q)`, qids, minutes: Math.max(1, Math.round(a.items.length * 120 / 50)) });
    else startSession({ mode: 'practice', title: 'Retake: ' + a.title.replace(/^Retake: /, ''), qids });
  });
  draw();
}

/* =========================================================================
   History
   ========================================================================= */
function renderHistory() {
  const list = store.attempts.slice().reverse();
  app.innerHTML = `
    <div class="section-head" style="margin-top:0">
      <div><h1>History</h1><p class="muted" style="margin:0">${store.attempts.length} saved session${store.attempts.length === 1 ? '' : 's'}. Scores are stored in this browser only — export a backup to move them.</p></div>
      <div class="btn-row">
        <button class="btn secondary" data-act="export">Export backup</button>
        <label class="btn secondary" style="cursor:pointer">Import backup<input type="file" accept="application/json,.json" id="import-file" hidden></label>
        <button class="btn danger" data-act="reset">Reset all progress</button>
      </div>
    </div>
    ${attemptsTable(list)}
    <section class="section card">
      <div class="section-head"><h2>Accuracy by domain</h2><span class="muted small">All sessions</span></div>
      ${domainMeters(aggregateDomains(store.attempts))}
    </section>
  `;

  app.querySelector('[data-act="export"]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ ...store, session: null, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ace-prep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  app.querySelector('#import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.version !== 1 || !Array.isArray(data.attempts) || typeof data.qstats !== 'object') throw new Error('Not an ACE Prep backup file.');
      if (!confirm(`Replace your current progress with this backup (${data.attempts.length} sessions)?`)) return;
      const base = emptyStore();
      store = { ...base, attempts: data.attempts, qstats: data.qstats || {}, prefs: { ...base.prefs, ...(data.prefs || {}) }, session: null };
      saveStore();
      applyTheme();
      toast('Backup imported.');
      renderHistory();
    } catch (err) {
      toast('Import failed: ' + err.message);
    }
  });
  app.querySelector('[data-act="reset"]').addEventListener('click', () => {
    if (!confirm('Delete ALL saved scores, history and mistake tracking? This cannot be undone. (Tip: export a backup first.)')) return;
    const prefs = store.prefs;
    store = { ...emptyStore(), prefs };
    saveStore();
    toast('Progress reset.');
    renderHistory();
  });
}

/* =========================================================================
   Sign-in (server mode)
   ========================================================================= */
let gsiPromise = null;
function loadGsi() {
  if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
  return (gsiPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => { gsiPromise = null; reject(new Error('load failed')); };
    document.head.appendChild(s);
  }));
}
function setLoginMsg(msg, kind = '') {
  const el = document.getElementById('login-msg');
  if (el) { el.textContent = msg; el.className = 'login-msg ' + kind; }
}
function renderLogin(msg = '', kind = '') {
  ME = null;
  stopTimer();
  renderUserMenu();
  const mode = CONFIG.registrationMode;
  app.innerHTML = `
    <section class="login-wrap">
      <div class="card login-card">
        <img class="brand-mark big" src="favicon.svg" alt="" width="56" height="56">
        <h1>ACE Prep</h1>
        <p class="muted">Practice questions and timed mock exams for the Google Cloud Associate Cloud Engineer certification. Sign in with your Google account to save your scores.</p>
        <div id="gsi-button" class="gsi-button"></div>
        <p id="login-msg" class="login-msg ${esc(kind)}" role="status">${esc(msg)}</p>
        ${mode === 'approval' ? '<p class="muted small">New accounts are approved by an admin before they can start.</p>'
          : mode === 'invite' ? '<p class="muted small">This app is invite-only — ask an admin to add your Google account.</p>' : ''}
      </div>
    </section>`;
  if (!CONFIG.googleClientId) {
    setLoginMsg("Google sign-in isn't configured on this server yet (GOOGLE_CLIENT_ID is missing).", 'bad');
    return;
  }
  loadGsi().then(() => {
    window.google.accounts.id.initialize({
      client_id: CONFIG.googleClientId, callback: onGoogleCredential,
      auto_select: false, cancel_on_tap_outside: true, use_fedcm_for_prompt: true,
    });
    const dark = document.documentElement.dataset.theme === 'dark' ||
      (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    window.google.accounts.id.renderButton(document.getElementById('gsi-button'),
      { theme: dark ? 'filled_black' : 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 280 });
  }).catch(() => setLoginMsg("Couldn't load Google Sign-In. Check your connection or ad blocker, then reload.", 'bad'));
}
async function onGoogleCredential(resp) {
  setLoginMsg('Signing in…');
  try {
    await api('POST', 'api/auth/google', { credential: resp.credential });
    location.hash = '#/home';
    location.reload();
  } catch (err) {
    const status = err.data && err.data.status;
    if (status === 'pending') {
      setLoginMsg(`Thanks — your account (${err.data.email}) is waiting for an admin to approve it. Sign in again once you've been approved.`, 'warn');
    } else {
      setLoginMsg(err.message, 'bad');
    }
  }
}
async function signOut() {
  if (sync.dirty) { clearTimeout(sync.timer); await pushState(); }
  try { await api('POST', 'api/auth/logout'); } catch (e) { /* already signed out */ }
  if (window.google && window.google.accounts && window.google.accounts.id) window.google.accounts.id.disableAutoSelect();
  location.hash = '#/home';
  location.reload();
}
function renderUserMenu() {
  const el = document.getElementById('user-menu');
  document.body.classList.toggle('signed-out', MODE === 'server' && !ME);
  if (!el) return;
  if (MODE !== 'server' || !ME) { el.innerHTML = ''; return; }
  el.innerHTML = `
    ${ME.role === 'admin' ? '<a href="#/admin" data-nav="admin">Admin</a>' : ''}
    <span id="sync-status" class="sync-status" aria-live="polite"></span>
    <span class="who" title="${esc(ME.email)}">
      ${ME.picture ? `<img class="avatar" src="${esc(ME.picture)}" alt="" referrerpolicy="no-referrer" width="26" height="26">` : ''}
      <span class="who-name">${esc(ME.name || ME.email)}</span>
    </span>
    <button type="button" class="ghost" id="sign-out">Sign out</button>`;
  setSyncStatus(sync.status);
  el.querySelector('#sign-out').addEventListener('click', signOut);
}

/* =========================================================================
   Admin: user management (server mode)
   ========================================================================= */
const STATUS_LABEL = { active: 'Active', pending: 'Pending', blocked: 'Blocked' };
const MODE_LABEL = {
  open: 'Open — any Google account can join',
  approval: 'Approval — new accounts wait for an admin',
  invite: 'Invite-only — only emails added here can join',
};
function avatarHtml(u, size = 32) {
  return u.picture
    ? `<img class="avatar" src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer" width="${size}" height="${size}">`
    : `<span class="avatar avatar-fallback" style="width:${size}px;height:${size}px" aria-hidden="true">${esc((u.name || u.email || '?')[0].toUpperCase())}</span>`;
}
function relTime(ts) {
  if (!ts) return '—';
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const d = (Date.now() - ms) / 1000;
  if (d < 90) return 'just now';
  if (d < 3600) return Math.round(d / 60) + ' min ago';
  if (d < 86400) return Math.round(d / 3600) + ' h ago';
  if (d < 86400 * 30) return Math.round(d / 86400) + ' days ago';
  return fmtDate(ms, false);
}
function userActions(u) {
  if (u.id === ME.id) return '<span class="muted small">You</span>';
  if (u.isBootstrapAdmin) return '<span class="muted small" title="Set by ADMIN_EMAILS on the server">Server admin</span>';
  const opts = [['view', 'View progress']];
  if (u.status !== 'active') opts.push(['approve', u.status === 'blocked' ? 'Unblock' : 'Approve']);
  if (u.status !== 'blocked') opts.push(['block', 'Block']);
  opts.push(u.role === 'admin' ? ['makeUser', 'Remove admin'] : ['makeAdmin', 'Make admin']);
  if (u.activeSessions) opts.push(['signout', `Sign out (${u.activeSessions} session${u.activeSessions === 1 ? '' : 's'})`]);
  opts.push(['delete', 'Delete user…']);
  return `<select class="user-action" data-id="${u.id}" aria-label="Actions for ${esc(u.email)}">
    <option value="">Actions…</option>${opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>`;
}
async function adminAction(u, action) {
  const who = u.name ? `${u.name} (${u.email})` : u.email;
  const path = `api/admin/users/${u.id}`;
  const steps = {
    view: () => { nav('#/admin/' + u.id); return null; },
    approve: () => api('PATCH', path, { status: 'active' }).then(() => `${who} can now sign in.`),
    block: () => confirm(`Block ${who}? They'll be signed out and can't sign in until unblocked.`)
      && api('PATCH', path, { status: 'blocked' }).then(() => `${who} is blocked.`),
    makeAdmin: () => confirm(`Make ${who} an admin? Admins can manage every user.`)
      && api('PATCH', path, { role: 'admin' }).then(() => `${who} is now an admin.`),
    makeUser: () => api('PATCH', path, { role: 'user' }).then(() => `${who} is no longer an admin.`),
    signout: () => api('DELETE', path + '/sessions').then((r) => `Signed ${who} out of ${r.revoked} session(s).`),
    delete: () => confirm(`Delete ${who} and all of their saved progress? This can't be undone.`)
      && api('DELETE', path).then(() => `${who} was deleted.`),
  };
  try {
    const msg = await steps[action]();
    if (msg) { toast(msg); renderAdmin(); }
  } catch (err) {
    toast(err.message);
  }
}

async function renderAdmin() {
  app.innerHTML = '<p class="loading">Loading users…</p>';
  let data, auditLog;
  try {
    [data, auditLog] = await Promise.all([api('GET', 'api/admin/users'), api('GET', 'api/admin/audit?limit=60')]);
  } catch (err) {
    app.innerHTML = `<div class="card chart-empty">Couldn't load users: ${esc(err.message)}</div>`;
    return;
  }
  if (location.hash !== '#/admin') return;
  const users = data.users;
  const count = (fn) => users.filter(fn).length;
  const pending = users.filter((u) => u.status === 'pending');

  const row = (u) => {
    const st = u.stats || {};
    return `<tr data-search="${esc((u.name || '') + ' ' + u.email)}">
      <td><div class="user-cell">${avatarHtml(u)}<div><div class="u-name">${esc(u.name || '—')}</div><div class="muted small">${esc(u.email)}</div></div></div></td>
      <td><span class="pill ${u.role === 'admin' ? 'mock' : ''}">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
      <td><span class="status ${u.status === 'active' ? 'good' : u.status === 'pending' ? 'warn' : 'bad'}">
        <span aria-hidden="true">${u.status === 'active' ? '✓' : u.status === 'pending' ? '…' : '✕'}</span>${STATUS_LABEL[u.status]}</span>
        ${u.neverSignedIn ? '<div class="muted small">Not signed in yet</div>' : ''}</td>
      <td class="num">${st.mocks || 0}</td>
      <td class="num">${st.bestMock == null ? '—' : st.bestMock + '%'}</td>
      <td class="num">${st.avgLast5 == null ? '—' : st.avgLast5 + '%'}</td>
      <td class="num">${st.answered ? st.answered.toLocaleString() : 0}</td>
      <td>${esc(relTime(u.lastSeenAt || u.lastLoginAt))}</td>
      <td>${userActions(u)}</td>
    </tr>`;
  };

  app.innerHTML = `
    <div class="section-head" style="margin-top:0">
      <div><h1>Users</h1>
        <p class="muted" style="margin:0">Sign-up mode: <strong>${esc(MODE_LABEL[data.registrationMode] || data.registrationMode)}</strong>${
          data.allowedDomains.length ? ` · Allowed domains: <strong>${esc(data.allowedDomains.join(', '))}</strong>` : ''}</p>
        <p class="muted small" style="margin:0.2rem 0 0">Change these with REGISTRATION_MODE and ALLOWED_EMAIL_DOMAINS on the server.</p></div>
    </div>

    <div class="tiles">
      <div class="card tile"><div class="t-label">Active users</div><div class="t-value">${count((u) => u.status === 'active')}</div></div>
      <div class="card tile"><div class="t-label">Waiting for approval</div><div class="t-value">${pending.length}</div></div>
      <div class="card tile"><div class="t-label">Blocked</div><div class="t-value">${count((u) => u.status === 'blocked')}</div></div>
      <div class="card tile"><div class="t-label">Admins</div><div class="t-value">${count((u) => u.role === 'admin')}</div></div>
    </div>

    ${pending.length ? `
    <section class="section card pending-card">
      <div class="section-head"><h2>Waiting for approval</h2><span class="muted small">${pending.length} request${pending.length === 1 ? '' : 's'}</span></div>
      <div class="pending-list">${pending.map((u) => `
        <div class="pending-row">
          <div class="user-cell">${avatarHtml(u)}<div><div class="u-name">${esc(u.name || u.email)}</div>
            <div class="muted small">${esc(u.email)} · asked ${esc(relTime(u.createdAt))}</div></div></div>
          <div class="btn-row">
            <button class="btn" data-quick="approve" data-id="${u.id}">Approve</button>
            <button class="btn secondary" data-quick="block" data-id="${u.id}">Block</button>
          </div>
        </div>`).join('')}</div>
    </section>` : ''}

    <section class="section card">
      <h2>Add a user</h2>
      <form id="add-user" class="add-user">
        <label class="field grow">Google account email
          <input type="email" name="email" required placeholder="name@gmail.com" autocomplete="off"></label>
        <label class="field">Role
          <select name="role"><option value="user">User</option><option value="admin">Admin</option></select></label>
        <button class="btn" type="submit">Add user</button>
      </form>
      <p class="muted small" style="margin:0.5rem 0 0">They can sign in with that Google account straight away. Adding someone who is pending or blocked approves them.</p>
    </section>

    <section class="section">
      <div class="section-head"><h2>All users</h2>
        <input type="search" id="user-filter" class="search" placeholder="Filter by name or email" aria-label="Filter users"></div>
      <div class="card table-wrap" style="padding:0">
        <table class="users-table">
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th class="num">Mocks</th><th class="num">Best</th>
            <th class="num">Avg last 5</th><th class="num">Answered</th><th>Last seen</th><th></th></tr></thead>
          <tbody>${users.map(row).join('')}</tbody>
        </table>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Recent activity</h2><span class="muted small">Sign-ups and admin changes</span></div>
      ${auditLog.entries.length ? `<div class="card table-wrap" style="padding:0"><table>
        <thead><tr><th>When</th><th>By</th><th>Action</th><th>User</th><th>Details</th></tr></thead>
        <tbody>${auditLog.entries.map((e) => `<tr>
          <td>${esc(relTime(e.at))}</td><td>${esc(e.actor_email || '—')}</td><td><code>${esc(e.action)}</code></td>
          <td>${esc(e.target_email || '—')}</td><td class="muted">${esc(e.detail || '')}</td></tr>`).join('')}</tbody>
      </table></div>` : '<div class="card chart-empty">No activity yet.</div>'}
    </section>
  `;

  const byId = new Map(users.map((u) => [String(u.id), u]));
  app.querySelectorAll('.user-action').forEach((sel) => sel.addEventListener('change', () => {
    const action = sel.value;
    sel.value = '';
    if (action) adminAction(byId.get(sel.dataset.id), action);
  }));
  app.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => adminAction(byId.get(b.dataset.id), b.dataset.quick)));
  app.querySelector('#user-filter').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    app.querySelectorAll('.users-table tbody tr').forEach((tr) => {
      tr.hidden = q && !tr.dataset.search.toLowerCase().includes(q);
    });
  });
  app.querySelector('#add-user').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      await api('POST', 'api/admin/users', { email: String(f.get('email')).trim(), role: f.get('role') });
      toast(`${f.get('email')} can now sign in.`);
      renderAdmin();
    } catch (err) {
      toast(err.message);
    }
  });
}

async function renderAdminUser(id) {
  app.innerHTML = '<p class="loading">Loading…</p>';
  let data;
  try {
    data = await api('GET', `api/admin/users/${id}/state`);
  } catch (err) {
    app.innerHTML = `<div class="card chart-empty">${esc(err.message)} <a href="#/admin">Back to users</a></div>`;
    return;
  }
  if (location.hash !== '#/admin/' + id) return;
  const u = data.user;
  const attempts = (data.state && Array.isArray(data.state.attempts)) ? data.state.attempts : [];
  const mocks = attempts.filter((a) => a.mode === 'mock');
  const answered = attempts.reduce((n, a) => n + (a.total || 0), 0);
  const correct = attempts.reduce((n, a) => n + (a.correct || 0), 0);
  const best = mocks.length ? Math.max(...mocks.map((a) => a.pct)) : null;
  const last5 = mocks.slice(-5);
  app.innerHTML = `
    <p><a href="#/admin">← Users</a></p>
    <section class="card">
      <div class="user-cell big">${avatarHtml(u, 48)}
        <div><h1 style="margin:0">${esc(u.name || u.email)}</h1>
          <div class="muted">${esc(u.email)} · ${u.role === 'admin' ? 'Admin' : 'User'} · ${STATUS_LABEL[u.status]}</div>
          <div class="muted small">Progress last saved ${esc(relTime(data.updatedAt))}</div></div></div>
    </section>
    <div class="tiles">
      <div class="card tile"><div class="t-label">Mock exams</div><div class="t-value">${mocks.length}</div><div class="t-sub">${attempts.length - mocks.length} practice sessions</div></div>
      <div class="card tile"><div class="t-label">Best mock</div><div class="t-value">${best === null ? '—' : best + '%'}</div><div class="t-sub">Target ${PASS_MARK}%</div></div>
      <div class="card tile"><div class="t-label">Average, last 5 mocks</div><div class="t-value">${last5.length ? Math.round(last5.reduce((n, a) => n + a.pct, 0) / last5.length) + '%' : '—'}</div></div>
      <div class="card tile"><div class="t-label">Questions answered</div><div class="t-value">${answered.toLocaleString()}</div><div class="t-sub">${answered ? pct(correct, answered) + '% correct' : '—'}</div></div>
    </div>
    <section class="section card">
      <div class="section-head"><h2>Accuracy by domain</h2><span class="muted small">All sessions</span></div>
      ${domainMeters(aggregateDomains(attempts))}
    </section>
    <section class="section">
      <div class="section-head"><h2>Sessions</h2></div>
      ${attemptsTable(attempts.slice().reverse(), { links: false })}
    </section>`;
}

/* =========================================================================
   Boot
   ========================================================================= */
async function boot() {
  applyTheme();
  try {
    const res = await fetch('api/config', { cache: 'no-store' });
    const cfg = res.ok ? await res.json().catch(() => null) : null;
    if (cfg && cfg.mode === 'server') { MODE = 'server'; CONFIG = cfg; }
  } catch (e) { /* static hosting: no API */ }

  if (MODE === 'server') {
    try {
      ME = (await api('GET', 'api/me')).user;
    } catch (err) {
      if (err.status === 401) { renderLogin(); return; }
      app.innerHTML = `<div class="card chart-empty">Couldn't reach the server (${esc(err.message)}). Reload to try again.</div>`;
      return;
    }
    try {
      await loadServerState();
    } catch (err) {
      app.innerHTML = `<div class="card chart-empty">Couldn't load your saved progress (${esc(err.message)}). Reload to try again.</div>`;
      return;
    }
  } else {
    store = loadStore();
  }
  applyTheme();
  renderUserMenu();

  try {
    const res = await fetch('data.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    QUESTIONS = (Array.isArray(data) ? data : data.questions || [])
      .filter((q) => q && q.id != null && Array.isArray(q.options) && Number.isInteger(q.correct))
      .map((q) => ({ ...q, id: String(q.id) }));
    QUESTIONS.forEach((q) => QMAP.set(q.id, q));
  } catch (err) {
    app.innerHTML = `<div class="card chart-empty">
      <strong>Couldn't load questions (${esc(err.message)}).</strong><br>
      If you opened index.html directly from disk, run a local server instead:
      <code>python3 -m http.server 8000</code> then visit <code>http://localhost:8000</code>.</div>`;
    return;
  }
  route();
}
boot();
