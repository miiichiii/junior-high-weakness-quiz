(function () {
'use strict';

/* =====================================================================
   夏休み 漢字マスター（4年生）
   - 出題データ: data/kanji-summer-2026.js（KanjiVG由来の筆順つき76字）
   - 1日 = 新規 newPerDay 字 + 期限のきた復習（最大 maxReviewsPerSession 字）
   - 克服 = 別の日に2回「みないでチャレンジ」をクリア（既存アプリの
     「別セッション2回正解」ルールの踏襲）
   - 記録: localStorage weaknessQuiz:<child>:kanjiProgress + 既存statsに加算
   ===================================================================== */

const DECK_ID = 'kanji-summer-2026';
const deck = (window.KANJI_DECKS || {})[DECK_ID];
if (!deck) {
  document.body.innerHTML = '<p style="padding:40px;text-align:center">出題データが読み込めませんでした。</p>';
  return;
}

const params = new URLSearchParams(location.search);
const childId = deck.childIds.includes(params.get('child')) ? params.get('child') : deck.childIds[0];
const DEBUG_DATE = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : null;

document.getElementById('back-link').href = `index.html?child=${childId}`;
document.getElementById('result-home').href = `index.html?child=${childId}`;
document.getElementById('sync-chip').href = `index.html?child=${childId}`;

/* 指で連続して画を書くと「ダブルタップ」とみなされ、iOSなどで拡大や
   テキスト選択メニューが出ることがある。CSS(touch-action / user-select /
   touch-callout)だけでは効かない端末もあるため、保険としてJS側でも
   短い間隔の連続タップ（＝スワイプ含む）を止める。 */
let lastTouchEndAt = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTouchEndAt < 350) e.preventDefault();
  lastTouchEndAt = now;
}, { passive: false });
document.addEventListener('dblclick', e => e.preventDefault());

/* ---------- 日付・保存ユーティリティ ---------- */
function todayKey(date = new Date()) {
  if (DEBUG_DATE && !arguments.length) return DEBUG_DATE;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function addDays(dayKey, days) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return todayKey(date);
}
function nowIso() { return new Date().toISOString(); }
function recordKey(name) { return `weaknessQuiz:${childId}:${name}`; }
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? value : fallback;
  } catch (e) { return fallback; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

/* ---------- 進捗レコード ---------- */
function emptyProgress() {
  return { version: 1, deckId: DECK_ID, kanji: {}, daily: {}, updatedAt: '' };
}
function migrateProgress(raw) {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  if (raw.version === 1) {
    if (!raw.kanji || typeof raw.kanji !== 'object') raw.kanji = {};
    if (!raw.daily || typeof raw.daily !== 'object') raw.daily = {};
    return raw;
  }
  writeJson(recordKey('kanjiProgress') + ':backup', raw);
  return emptyProgress();
}
let progress = migrateProgress(readJson(recordKey('kanjiProgress'), null));

function saveProgress() {
  progress.updatedAt = nowIso();
  writeJson(recordKey('kanjiProgress'), progress);
  scheduleCloudSave();
}
function newKanjiRecord() {
  return {
    attempts: 0, traceClears: 0, memoryClears: 0, memoryFails: 0,
    stars: 0, clearDays: 0, lastClearDay: '', stage: 0,
    reviewDueAt: '', masteredAt: '', graduatedAt: '', misses: 0,
    firstSeenAt: '', lastSeenAt: '', lastPracticedDay: ''
  };
}

/* その字を最後に練習した日（端末ローカルの日付キー）。lastSeenAt はISO(UTC)なので
   日付の比較には使わない。この項目が無い古い記録は初出日で代用する。 */
function practicedDay(rec) {
  return (rec && (rec.lastPracticedDay || rec.firstSeenAt)) || '';
}
function masteredCount() {
  return deck.kanji.filter(k => (progress.kanji[k.char] || {}).masteredAt).length;
}
function learnedCount() {
  return deck.kanji.filter(k => progress.kanji[k.char]).length;
}

/* 既存アプリの stats（累計・連続日数）へ橋渡し。指定日のぶんだけ触る */
function bumpStats(clean, addSession, day = todayKey()) {
  const key = recordKey('stats');
  const stats = readJson(key, { daily: {} });
  if (!stats.daily || typeof stats.daily !== 'object') stats.daily = {};
  const entry = stats.daily[day] || { answered: 0, correct: 0, sessions: 0 };
  if (clean !== null) {
    entry.answered = (entry.answered || 0) + 1;
    if (clean) entry.correct = (entry.correct || 0) + 1;
  }
  if (addSession) entry.sessions = (entry.sessions || 0) + 1;
  stats.daily[day] = entry;
  writeJson(key, stats);
}

/* ---------- クラウド同期（既存 records/default ドキュメントに相乗り） ---------- */
const cloud = window.WeaknessQuizCloud;
let cloudReady = false;
let cloudTimer = null;
let itemsConcludedThisSession = 0;

/* 同期の状態表示。このページにはログインボタンが無く（ログインはトップ画面）、
   未ログインでも静かにローカル保存へ倒れるため、状態が見えないと
   「同期されていないことに誰も気づけない」。 */
const SYNC_LABELS = {
  checking: 'かくにん中…',
  synced: '☁️ 同期ずみ',
  saving: '☁️ ほぞん中…',
  local: '⚠️ 未ログイン（この端末だけ）',
  error: '⚠️ 同期できません',
  off: 'この端末だけに保存'
};
function setSyncState(state) {
  const chip = document.getElementById('sync-chip');
  if (!chip) return;
  chip.dataset.state = state;
  chip.textContent = SYNC_LABELS[state] || '';
  chip.title = state === 'local'
    ? 'タップしてトップ画面でGoogleログインすると、記録が保護者画面にも届きます'
    : '';
}

function mergeKanjiProgress(local, remote) {
  const a = migrateProgress(local);
  const b = migrateProgress(remote);
  const out = emptyProgress();
  const chars = new Set([...Object.keys(a.kanji), ...Object.keys(b.kanji)]);
  chars.forEach(char => {
    const ra = a.kanji[char];
    const rb = b.kanji[char];
    if (!ra || !rb) { out.kanji[char] = { ...(ra || rb) }; return; }
    const newer = (rb.lastSeenAt || '') > (ra.lastSeenAt || '') ? rb : ra;
    out.kanji[char] = {
      attempts: Math.max(ra.attempts || 0, rb.attempts || 0),
      traceClears: Math.max(ra.traceClears || 0, rb.traceClears || 0),
      memoryClears: Math.max(ra.memoryClears || 0, rb.memoryClears || 0),
      memoryFails: Math.max(ra.memoryFails || 0, rb.memoryFails || 0),
      stars: Math.max(ra.stars || 0, rb.stars || 0),
      misses: Math.max(ra.misses || 0, rb.misses || 0),
      clearDays: newer.clearDays || 0,
      lastClearDay: newer.lastClearDay || '',
      stage: newer.stage || 0,
      reviewDueAt: newer.reviewDueAt || '',
      masteredAt: newer.masteredAt || '',
      graduatedAt: newer.graduatedAt || '',
      lastPracticedDay: [practicedDay(ra), practicedDay(rb)].sort().slice(-1)[0] || '',
      firstSeenAt: [ra.firstSeenAt, rb.firstSeenAt].filter(Boolean).sort()[0] || '',
      lastSeenAt: (rb.lastSeenAt || '') > (ra.lastSeenAt || '') ? rb.lastSeenAt : (ra.lastSeenAt || '')
    };
  });
  const days = new Set([...Object.keys(a.daily), ...Object.keys(b.daily)]);
  days.forEach(day => {
    const da = a.daily[day] || {};
    const db = b.daily[day] || {};
    out.daily[day] = {
      newLearned: Math.max(da.newLearned || 0, db.newLearned || 0),
      reviewsCleared: Math.max(da.reviewsCleared || 0, db.reviewsCleared || 0),
      memoryClears: Math.max(da.memoryClears || 0, db.memoryClears || 0),
      attempts: Math.max(da.attempts || 0, db.attempts || 0)
    };
  });
  out.updatedAt = (b.updatedAt || '') > (a.updatedAt || '') ? b.updatedAt : (a.updatedAt || '');
  return out;
}

function scheduleCloudSave() {
  if (!cloudReady) return;
  clearTimeout(cloudTimer);
  setSyncState('saving');
  cloudTimer = setTimeout(() => {
    try {
      cloud.saveRecord(childId, {
        kanji: progress,
        stats: readJson(recordKey('stats'), { daily: {} })
      })
        .then(() => { if (cloudReady) setSyncState('synced'); })
        .catch(() => { if (cloudReady) setSyncState('error'); });
    } catch (e) {
      setSyncState('error');
    }
  }, 1200);
}

async function pullCloud() {
  try {
    const remote = await cloud.getRecord(childId);
    if (!remote || !remote.kanji) return;
    const merged = mergeKanjiProgress(progress, remote.kanji);
    if (JSON.stringify(merged) === JSON.stringify(progress)) return;
    progress = merged;
    writeJson(recordKey('kanjiProgress'), progress);
    // まだ今日の1問目に手を付けていなければ、他端末の進捗でキューを組み直す
    if (itemsConcludedThisSession === 0 && (phase === 'trace' || phase === 'memory') && strokeIndexUntouched()) {
      if (sessionMode === 'extra-new') startQueue(composeNextNewBatch(), 'extra-new');
      else if (sessionMode === 'bonus') startQueue(composeOkawari(sessionDay || todayKey()), 'bonus');
      else startSession();
    } else {
      updatePaceLine();
    }
  } catch (e) {}
}
function strokeIndexUntouched() {
  return userStrokes.length === 0 && strokeIndex === 0;
}
function initCloud() {
  if (!cloud) { setSyncState('off'); return; }
  try {
    const status = cloud.init();
    if (!status.available) { setSyncState('off'); return; }
    cloud.onAuthStateChanged(user => {
      cloudReady = !!user;
      setSyncState(user ? 'synced' : 'local');
      if (user) pullCloud();
    });
  } catch (e) {
    setSyncState('off');
  }
}

/* ---------- セッション構成 ---------- */
function composeSession(day = todayKey()) {
  const sched = deck.schedule;
  const due = deck.kanji.filter(k => {
    const r = progress.kanji[k.char];
    return r && r.reviewDueAt && r.reviewDueAt <= day && r.lastClearDay !== day && !r.graduatedAt;
  }).sort((x, y) => {
    const rx = progress.kanji[x.char];
    const ry = progress.kanji[y.char];
    if (rx.reviewDueAt !== ry.reviewDueAt) return rx.reviewDueAt < ry.reviewDueAt ? -1 : 1;
    // 同じ期限どうしの優先度は「いちばん長く練習していない字」を優先する。
    // ここを misses（累計ミス数）のような不変に近い値にすると、1日の上限を
    // 超えた分は毎日同じ字が勝ち残り続け、他の字が出題されなくなる
    // （負けた字は出題されない＝lastSeenAtが更新されない＝翌日も負け続ける）。
    // lastSeenAt を使えば、出題されたその日から「最近やった扱い」に回るため
    // 復習が自然にローテーションする。
    const lx = rx.lastSeenAt || '';
    const ly = ry.lastSeenAt || '';
    if (lx !== ly) return lx < ly ? -1 : 1;
    return x.order - y.order;
  });
  // 前日に練習した字（＝前日おぼえた字／前日まちがえた字）はいちばん忘れやすいので
  // 必ず全部出す。ここを保証しないと、期限の古い字（初日に覚えた字ほど古い）が
  // 上限ぶんの枠を先に埋めてしまい、前日の字が毎日押し出されてしまう。
  const yesterday = addDays(day, -1);
  const fresh = due.filter(k => practicedDay(progress.kanji[k.char]) === yesterday);
  const rest = due.filter(k => practicedDay(progress.kanji[k.char]) !== yesterday);
  const reviewCap = Math.max(sched.maxReviewsPerSession, fresh.length);
  const reviews = [...fresh, ...rest].slice(0, reviewCap);
  const introducedToday = deck.kanji.filter(k => (progress.kanji[k.char] || {}).firstSeenAt === day).length;
  const newCount = Math.max(0, sched.newPerDay - introducedToday);
  const newOnes = deck.kanji
    .filter(k => !progress.kanji[k.char])
    .sort((x, y) => x.order - y.order)
    .slice(0, newCount);
  return [
    ...reviews.map(k => ({ entry: k, kind: 'review' })),
    ...newOnes.map(k => ({ entry: k, kind: 'new' }))
  ];
}
function composeNextNewBatch() {
  return deck.kanji
    .filter(k => !progress.kanji[k.char])
    .sort((x, y) => x.order - y.order)
    .slice(0, deck.schedule.newPerDay)
    .map(k => ({ entry: k, kind: 'new' }));
}
function composeOkawari(day = todayKey()) {
  return deck.kanji.filter(k => {
    const r = progress.kanji[k.char];
    return r && r.lastClearDay !== day;
  }).sort((x, y) => {
    const rx = progress.kanji[x.char];
    const ry = progress.kanji[y.char];
    return (rx.reviewDueAt || '9999') < (ry.reviewDueAt || '9999') ? -1 : 1;
  }).slice(0, 4).map(k => ({ entry: k, kind: 'bonus' }));
}

/* =====================================================================
   ここから下は kanji-writing-demo プロトタイプ由来の描画・判定コード
   （幾何・毛筆レンダリング・1画判定・おてほんアニメ・入力）
   ===================================================================== */

const $ = id => document.getElementById(id);
const board = $('board'), ctx = board.getContext('2d');
const feedback = $('feedback');
const els = {
  demoB: $('btn-demo'), hintB: $('btn-hint'), undoB: $('btn-undo'), clearB: $('btn-clear'),
  submitB: $('btn-submit'), relearnB: $('btn-relearn'), memoryB: $('btn-memory'),
  nextB: $('btn-next'), retryB: $('btn-retry'),
  chipT: $('chip-trace'), chipM: $('chip-memory')
};

let SIZE = 320;
function fitCanvas() {
  SIZE = Math.min(window.innerWidth - 28, 420, Math.floor(window.innerHeight * 0.44));
  SIZE = Math.max(SIZE, 240);
  const dpr = window.devicePixelRatio || 1;
  board.style.width = SIZE + 'px';
  board.style.height = SIZE + 'px';
  board.width = SIZE * dpr;
  board.height = SIZE * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const px = v => v / 100 * SIZE;

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function pathLen(p) { let l = 0; for (let i = 1; i < p.length; i++) l += dist(p[i - 1], p[i]); return l; }
function resample(p, n) {
  if (p.length === 1) return Array(n).fill(p[0]);
  const total = pathLen(p) || 1e-6, step = total / (n - 1), out = [p[0]];
  let acc = 0, i = 1, prev = p[0];
  while (out.length < n - 1 && i < p.length) {
    const d = dist(prev, p[i]);
    if (acc + d >= step) {
      const t = (step - acc) / d;
      const q = [prev[0] + (p[i][0] - prev[0]) * t, prev[1] + (p[i][1] - prev[1]) * t];
      out.push(q); prev = q; acc = 0;
    } else { acc += d; prev = p[i]; i++; }
  }
  while (out.length < n) out.push(p[p.length - 1]);
  return out;
}

/* 1画の判定：始点・終点・平均ずれ・長さ比。
   短い画は始点・終点の許容を画の長さに応じて絞り、密集した字で
   となりの画への誤マッチを減らす。 */
const JUDGE = {
  trace: { se: 20, avg: 13, rLo: 0.4, rHi: 2.2 },
  memory: { se: 27, avg: 18, rLo: 0.35, rHi: 2.6 }
};
function judgeStroke(user, tmpl, strict) {
  const T = strict ? JUDGE.trace : JUDGE.memory;
  const lenT = pathLen(tmpl), lenU = pathLen(user);
  const seLimit = Math.min(T.se, Math.max(10, lenT * 0.55));
  const avgLimit = Math.min(T.avg, Math.max(8, lenT * 0.5));
  if (lenT < 20) {
    return dist(user[0], tmpl[0]) < seLimit + 4 &&
      dist(user[user.length - 1], tmpl[tmpl.length - 1]) < seLimit + 6 && lenU < 45;
  }
  if (lenU < 6) return false;
  const r = lenU / lenT;
  if (r < T.rLo || r > T.rHi) return false;
  const u = resample(user, 24), t = resample(tmpl, 24);
  if (dist(u[0], t[0]) > seLimit) return false;
  if (dist(u[23], t[23]) > seLimit) return false;
  let avg = 0; for (let i = 0; i < 24; i++) avg += dist(u[i], t[i]);
  return (avg / 24) < avgLimit;
}

/* 毛筆風レンダリング */
const INK = '#1e1e28';
function brushBase() { return SIZE * 0.062 * Math.min(1, 9 / Math.max(6, currentStrokes().length)); }
function widthFactor(v) { return Math.min(1.15, Math.max(0.3, 1.28 - v * 3.2)); }
function finishBrush(pts, w, v) {
  const n = pts.length;
  if (n < 4) return w;
  const tail = Math.min(n - 1, Math.max(3, Math.round(n * 0.4)));
  let endV = 0;
  for (let i = n - tail; i < n; i++) endV += v[i];
  endV /= tail;
  const sorted = v.slice(1).sort((x, y) => x - y);
  const medV = sorted.length ? sorted[sorted.length >> 1] : 0;
  if (endV > 0.13 || endV > 1.4 * medV) {
    const w0 = w[n - tail];
    for (let i = 0; i < tail; i++) {
      const j = n - tail + i;
      w[j] = Math.min(w[j], w0 * (1 - i / (tail - 1)) + 0.06);
    }
  }
  return w;
}
function drawBrush(pts, w, color) {
  const base = brushBase();
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(px(pts[0][0]), px(pts[0][1]), Math.max(1, w[0] * base / 2), 0, 7);
    ctx.fill();
    return;
  }
  for (let i = 1; i < pts.length; i++) {
    ctx.beginPath();
    ctx.moveTo(px(pts[i - 1][0]), px(pts[i - 1][1]));
    ctx.lineTo(px(pts[i][0]), px(pts[i][1]));
    ctx.lineWidth = Math.max(0.6, (w[i - 1] + w[i]) / 2 * base);
    ctx.stroke();
  }
}

function drawPoly(pts, color, w, prog) {
  if (pts.length < 2) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(px(pts[0][0]), px(pts[0][1]), w / 2, 0, 7); ctx.fill();
    return;
  }
  let p = pts;
  if (prog !== undefined && prog < 1) {
    p = resample(pts, 30).slice(0, Math.max(2, Math.round(30 * prog)));
  }
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(px(p[0][0]), px(p[0][1]));
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
    ctx.quadraticCurveTo(px(p[i][0]), px(p[i][1]), px(mx), px(my));
  }
  const last = p[p.length - 1];
  ctx.lineTo(px(last[0]), px(last[1]));
  ctx.stroke();
}
function drawGrid() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = '#eef2f6'; ctx.lineWidth = 1.5; ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(SIZE / 2, 10); ctx.lineTo(SIZE / 2, SIZE - 10);
  ctx.moveTo(10, SIZE / 2); ctx.lineTo(SIZE - 10, SIZE / 2);
  ctx.stroke(); ctx.setLineDash([]);
}

/* ---------- セッション状態 ---------- */
let queue = [];            // [{entry, kind}]
let qi = 0;                // いまのアイテム
let itemResults = [];      // [{char, kind, stars}]
let sessionMode = 'daily'; // daily | extra-new | bonus
let sessionDay = '';
let dayRolloverTimer = null;

/* アイテム内の状態（プロトタイプの状態機械） */
let phase = 'trace';       // trace | trace-done | memory | memory-review | item-done
let strokeIndex = 0;
let userStrokes = [];
let livePts = null, liveW = null, liveV = null, liveLastT = 0, liveF = 0.55;
let missesThisStroke = 0;
let itemMisses = 0;        // このアイテムでの誤ストローク数
let failedSubmits = 0;     // みないで で×だった回数
let hintUsed = false;
let showHintTemplate = false;
let fadeStroke = null;
let demo = null;
let soundOn = true;
let activePointer = null;
let promptIndexOffset = 0;

function currentItem() { return queue[qi] || null; }
function currentStrokes() {
  const item = currentItem();
  return item ? item.entry.strokes : [[[0, 0], [1, 1]]];
}
function currentPrompt() {
  const item = currentItem();
  const prompts = item.entry.prompts;
  const rec = progress.kanji[item.entry.char];
  const idx = ((rec ? rec.attempts : 0) + promptIndexOffset) % prompts.length;
  return prompts[idx];
}

/* ---------- 描画ループ ---------- */
function render(now) {
  drawGrid();
  const strokes = currentStrokes();
  const tW = SIZE * 0.075 * Math.min(1, 10 / Math.max(6, strokes.length));
  if (phase === 'trace' || phase === 'trace-done') {
    strokes.forEach((s, i) => {
      if (phase === 'trace' && i === strokeIndex) return;
      drawPoly(s, '#e3e9f0', tW);
    });
    if (phase === 'trace' && strokeIndex < strokes.length) {
      const s = strokes[strokeIndex];
      drawPoly(s, '#bcd5ff', tW);
      const r24 = resample(s, 24);
      const a = r24[2], b = r24[5];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      ctx.fillStyle = '#5f96f5';
      ctx.save();
      ctx.translate(px(b[0]), px(b[1])); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
      const pulse = 1 + 0.18 * Math.sin(now / 280);
      const r = SIZE * 0.042 * pulse;
      ctx.fillStyle = '#ff9f43';
      ctx.beginPath(); ctx.arc(px(s[0][0]), px(s[0][1]), r, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${Math.round(SIZE * 0.045)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(strokeIndex + 1), px(s[0][0]), px(s[0][1]) + 1);
    }
  }
  if (phase === 'memory' && showHintTemplate) {
    strokes.forEach(s => drawPoly(s, '#eff3f8', tW));
  }
  if (phase === 'memory-review') {
    strokes.forEach(s => drawPoly(s, '#e3e9f0', tW));
  }
  userStrokes.forEach(st => {
    let c = INK;
    if (phase === 'memory-review') c = st.ok ? '#2eb872' : '#e8505b';
    drawBrush(st.pts, st.w, c);
  });
  if (livePts && livePts.length) drawBrush(livePts, liveW, INK);
  if (fadeStroke) {
    const t = (now - fadeStroke.t0) / 700;
    if (t >= 1) fadeStroke = null;
    else { ctx.globalAlpha = 1 - t; drawBrush(fadeStroke.pts, fadeStroke.w, '#e8505b'); ctx.globalAlpha = 1; }
  }
  if (demo) {
    const DUR = 650, GAP = 280;
    const el = now - demo.t0;
    const idx = demo.list[demo.cur];
    for (let j = 0; j < demo.cur; j++) drawPoly(strokes[demo.list[j]], '#ff9f43', tW);
    const t = Math.min(el / DUR, 1);
    drawPoly(strokes[idx], '#ff9f43', tW, t);
    if (el > DUR + GAP) {
      demo.cur++;
      if (demo.cur >= demo.list.length) { demo = null; setMsg(demoDoneMsg()); }
      else demo.t0 = now;
    }
  }
  requestAnimationFrame(render);
}

/* ---------- 効果音・バイブ ---------- */
let audioCtx = null;
function beep(freqs) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.09 + 0.15);
      o.connect(g).connect(audioCtx.destination);
      o.start(audioCtx.currentTime + i * 0.09); o.stop(audioCtx.currentTime + i * 0.09 + 0.16);
    });
  } catch (e) {}
}
const vibe = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

/* ---------- UI 更新 ---------- */
function setMsg(text, cls) {
  feedback.textContent = text;
  feedback.className = cls || '';
}
function demoDoneMsg() {
  return phase === 'trace' ? `${strokeIndex + 1}かくめを なぞろう！` : 'おぼえたかな？かいてみよう！';
}
function showButtons(ids) {
  ['demoB', 'hintB', 'undoB', 'clearB', 'submitB', 'relearnB', 'memoryB', 'nextB', 'retryB'].forEach(n => {
    els[n].classList.toggle('hidden', !ids.includes(n));
  });
}
function updateChips() {
  els.chipT.classList.toggle('on', phase === 'trace' || phase === 'trace-done');
  els.chipM.classList.toggle('on', phase === 'memory' || phase === 'memory-review');
}
function updateCounter() {
  const strokes = currentStrokes();
  const c = $('stroke-counter');
  if (phase === 'trace') c.textContent = `${Math.min(strokeIndex + 1, strokes.length)}かくめ / ぜんぶで ${strokes.length}かく`;
  else if (phase === 'memory' || phase === 'memory-review') c.textContent = `かいたのは ${userStrokes.length}かく（この かんじは ${strokes.length}かく）`;
  else c.textContent = '';
}
function updateProgressDots() {
  const p = $('progress'); p.innerHTML = '';
  queue.forEach((item, i) => {
    const d = document.createElement('div');
    const done = i < qi;
    d.className = 'dot' + (item.kind !== 'new' ? ' review' : '') + (i === qi ? ' now' : '') + (done ? ' done' : '');
    d.textContent = done ? '✓' : (i + 1);
    p.appendChild(d);
  });
}
function updatePaceLine() {
  const day = todayKey();
  const total = deck.kanji.length;
  const end = deck.schedule.end;
  let daysLeft = 0;
  let cursor = day;
  while (cursor <= end && daysLeft < 99) { daysLeft += 1; cursor = addDays(cursor, 1); }
  const remain = total - learnedCount();
  $('pace-line').textContent =
    `マスター ${masteredCount()}/${total} ・ まだの字 ${remain} ・ 夏休みのこり ${daysLeft}日`;
}
function updatePrompt() {
  const item = currentItem();
  const prompt = currentPrompt();
  const badge = $('item-badge');
  badge.textContent = item.kind === 'new' ? '🌱 あたらしい かんじ' : (item.kind === 'bonus' ? '💪 おかわり' : '🔁 ふくしゅう');
  badge.className = item.kind === 'new' ? '' : 'review';
  $('prompt-label').textContent = prompt.okurigana
    ? '□の かんじだけ ゆびで かこう！（おくりがなは かかない）'
    : '□に はいる かんじを ゆびで かこう！';
  const inner = prompt.word.map(ch => {
    if (ch === '◻') return '<span class="blank">？</span>';
    if (prompt.okurigana && ch === prompt.okurigana) return `<span class="okuri">${ch}</span>`;
    return ch;
  }).join('');
  $('prompt-word').innerHTML = `<ruby>${inner}<rt>${prompt.yomi}</rt></ruby>`;
  $('prompt-sentence').textContent = prompt.sentence;
}

/* ---------- アイテムのフェーズ遷移 ---------- */
function startItem() {
  const item = currentItem();
  if (!item) { finishSession(); return; }
  strokeIndex = 0; userStrokes = []; livePts = null;
  missesThisStroke = 0; itemMisses = 0; failedSubmits = 0;
  hintUsed = false; showHintTemplate = false; demo = null; fadeStroke = null;
  updateProgressDots(); updatePrompt(); updatePaceLine();
  if (item.kind === 'new') startTrace();
  else startMemory();
}
function startTrace() {
  phase = 'trace'; strokeIndex = 0; userStrokes = []; livePts = null;
  missesThisStroke = 0; showHintTemplate = false;
  updateChips(); updateCounter();
  showButtons(['demoB']);
  setMsg('オレンジの まる から なぞってね！');
}
function traceCleared() {
  phase = 'trace-done';
  const rec = progress.kanji[currentItem().entry.char];
  if (rec) { rec.traceClears += 1; saveProgress(); }
  updateChips(); updateCounter();
  celebrate();
  beep([523, 659, 784]); vibe([30, 40, 60]);
  setMsg('なぞれた！つぎは みないで かいてみよう！', 'good');
  showButtons(['memoryB']);
}
function startMemory() {
  phase = 'memory'; userStrokes = []; livePts = null; demo = null;
  showHintTemplate = false;
  updateChips(); updateCounter();
  showButtons(['hintB', 'undoB', 'clearB', 'submitB']);
  setMsg(currentItem().kind === 'new' ? 'おてほんなしで かいてみよう！' : 'おぼえてるかな？みないで かこう！');
}

/* アイテム完了：記録して次へ */
function concludeItem() {
  const item = currentItem();
  const char = item.entry.char;
  const day = sessionDay || todayKey();
  const clean = failedSubmits === 0 && !hintUsed;
  const stars = clean ? 3 : (failedSubmits === 0 ? 2 : 1);

  if (!progress.kanji[char]) progress.kanji[char] = newKanjiRecord();
  const rec = progress.kanji[char];
  if (!rec.firstSeenAt) rec.firstSeenAt = day;
  rec.attempts += 1;
  rec.memoryClears += 1;
  rec.misses += itemMisses;
  rec.stars = Math.max(rec.stars, stars);
  rec.lastSeenAt = nowIso();
  rec.lastPracticedDay = day;

  if (item.kind !== 'bonus') {
    const sched = deck.schedule;
    if (failedSubmits > 0) {
      rec.memoryFails += 1;
      rec.clearDays = 0;
      rec.stage = 0;
      rec.masteredAt = '';
      rec.reviewDueAt = addDays(day, 1);
    } else if (hintUsed) {
      rec.reviewDueAt = addDays(day, 1);
    } else {
      if (rec.lastClearDay !== day) rec.clearDays += 1;
      rec.lastClearDay = day;
      const wasAlreadyMastered = !!rec.masteredAt;
      const stageIdx = Math.min(rec.stage, sched.reviewIntervals.length - 1);
      rec.stage += 1;
      if (!rec.masteredAt && rec.clearDays >= sched.masterySessions) rec.masteredAt = nowIso();
      if (wasAlreadyMastered && stageIdx === sched.reviewIntervals.length - 1) {
        // マスター後、いちばん長い間隔（7日後）の復習も乗り越えた→卒業。
        // これがないと、マスター済みの字が7日おきに永久ループで復習に
        // 出続け、日がたつほど復習枠の取り合いが悪化してしまう。
        rec.graduatedAt = nowIso();
        rec.reviewDueAt = '';
      } else {
        rec.reviewDueAt = addDays(day, sched.reviewIntervals[stageIdx]);
      }
    }
    const dailyEntry = progress.daily[day] || { newLearned: 0, reviewsCleared: 0, memoryClears: 0, attempts: 0 };
    dailyEntry.attempts += 1;
    dailyEntry.memoryClears += clean ? 1 : 0;
    if (item.kind === 'new') dailyEntry.newLearned += 1;
    if (item.kind === 'review' && clean) dailyEntry.reviewsCleared += 1;
    progress.daily[day] = dailyEntry;
    bumpStats(clean, false, day);
  } else {
    bumpStats(clean, false, day);
  }
  saveProgress();
  itemsConcludedThisSession += 1;
  itemResults.push({ char, kind: item.kind, stars });

  phase = 'item-done';
  updateChips(); updateCounter(); updatePaceLine();
  celebrate(); if (clean) celebrate();
  beep(clean ? [523, 659, 784, 1046] : [523, 659, 784]);
  vibe(clean ? [30, 40, 30, 40, 80] : [30, 40, 60]);
  const praise = clean
    ? (rec.masteredAt && rec.clearDays === deck.schedule.masterySessions ? `「${char}」を マスターした！すごい！` : 'みないで かけた！てんさい！')
    : 'さいごまで かけたね！あしたも やってみよう！';
  setMsg(praise, 'good');
  showButtons(['nextB']);
  els.nextB.textContent = qi + 1 < queue.length ? 'つぎへ →' : 'きょうの けっかを 見る 🎉';
}

function finishSession() {
  if (sessionMode !== 'bonus' && itemResults.length > 0) {
    const day = sessionDay || todayKey();
    const legacyFlagKey = recordKey('kanjiSessionDay');
    const dayFlagKey = `${legacyFlagKey}:${day}`;
    const dayFlagRecorded = localStorage.getItem(dayFlagKey) === '1';
    const legacyFlagRecorded = localStorage.getItem(legacyFlagKey) === day;
    if (!dayFlagRecorded && legacyFlagRecorded) {
      try { localStorage.setItem(dayFlagKey, '1'); } catch (e) {}
    }
    const sessionRecorded = dayFlagRecorded || legacyFlagRecorded;
    if (!sessionRecorded) {
      try {
        localStorage.setItem(dayFlagKey, '1');
        localStorage.setItem(legacyFlagKey, day);
      } catch (e) {}
      bumpStats(null, true, day);
      saveProgress();
    }
  }
  showResult();
}

function showResult() {
  const day = sessionDay || todayKey();
  const dailyEntry = progress.daily[day] || { newLearned: 0, reviewsCleared: 0 };
  const stats = readJson(recordKey('stats'), { daily: {} });
  let streak = 0;
  let cursor = day;
  while ((stats.daily || {})[cursor] && stats.daily[cursor].answered > 0 && streak < 999) {
    streak += 1; cursor = addDays(cursor, -1);
  }
  $('result-summary').innerHTML = `
    <div class="stat"><b>${dailyEntry.newLearned || 0}</b><span>あたらしい字</span></div>
    <div class="stat"><b>${dailyEntry.reviewsCleared || 0}</b><span>ふくしゅう</span></div>
    <div class="stat"><b>${masteredCount()}</b><span>マスター/${deck.kanji.length}</span></div>
    <div class="stat"><b>${streak}</b><span>れんぞく日</span></div>`;
  const list = $('result-list'); list.innerHTML = '';
  itemResults.forEach(r => {
    const row = document.createElement('div'); row.className = 'row';
    const st = '⭐'.repeat(r.stars) + '☆'.repeat(3 - r.stars);
    const kind = r.kind === 'new' ? 'あたらしい' : (r.kind === 'bonus' ? 'おかわり' : 'ふくしゅう');
    row.innerHTML = `<span>${r.char}</span><span class="st">${st}</span><span class="kind">${kind}</span>`;
    list.appendChild(row);
  });
  const nextNew = composeNextNewBatch();
  const nextNewButton = $('btn-next-new');
  nextNewButton.classList.toggle('hidden', nextNew.length === 0);
  nextNewButton.textContent = nextNew.length < deck.schedule.newPerDay
    ? `🌱 残り${nextNew.length}文字に挑戦`
    : `🌱 次の${deck.schedule.newPerDay}文字に挑戦`;
  const okawari = composeOkawari(day);
  $('btn-okawari').classList.toggle('hidden', okawari.length === 0);
  $('result-title').textContent = queue.length === 0 ? '✨ きょうのぶんは もう おわってるよ！' : '🎉 きょうのぶんは おわり！';
  $('result-screen').classList.add('show');
  const nextAction = nextNew.length > 0 ? nextNewButton : (okawari.length > 0 ? $('btn-okawari') : $('result-home'));
  requestAnimationFrame(() => nextAction.focus({ preventScroll: true }));
}

function startQueue(nextQueue, mode = 'daily') {
  if (activePointer !== null) {
    try { board.releasePointerCapture(activePointer); } catch (e) {}
  }
  activePointer = null;
  livePts = null; liveW = null; liveV = null;
  demo = null;
  queue = nextQueue;
  qi = 0;
  itemResults = [];
  sessionMode = mode;
  itemsConcludedThisSession = 0;
  $('result-screen').classList.remove('show');
  if (queue.length === 0) { showResult(); return; }
  startItem();
}

function startSession(day = todayKey()) {
  sessionDay = day;
  startQueue(composeSession(day), 'daily');
}

function refreshSessionForDay(day) {
  if (!sessionDay || sessionDay === day) return false;
  startSession(day);
  return true;
}

function refreshSessionForCurrentDay() {
  return refreshSessionForDay(todayKey());
}

function scheduleDayRollover() {
  if (DEBUG_DATE) return;
  clearTimeout(dayRolloverTimer);
  const now = new Date();
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const delay = Math.max(1000, nextDay.getTime() - now.getTime() + 1000);
  dayRolloverTimer = setTimeout(() => {
    refreshSessionForCurrentDay();
    scheduleDayRollover();
  }, delay);
}

function handleAppResume() {
  refreshSessionForCurrentDay();
  scheduleDayRollover();
}

function celebrate() {
  const c = $('celebrate');
  const emo = ['⭐', '🎉', '✨', '💮', '🌟'];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span');
    s.textContent = emo[Math.floor(Math.random() * emo.length)];
    s.style.left = (15 + Math.random() * 70) + '%';
    s.style.top = (35 + Math.random() * 35) + '%';
    s.style.animationDelay = (Math.random() * 0.25) + 's';
    c.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
}

/* ---------- 入力 ---------- */
function evtPos(e) {
  const r = board.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100];
}
board.addEventListener('pointerdown', e => {
  if (demo) return;
  if (!(phase === 'trace' || phase === 'memory')) return;
  if (activePointer !== null) return;
  activePointer = e.pointerId;
  board.setPointerCapture(e.pointerId);
  livePts = [evtPos(e)];
  liveW = [0.55]; liveV = [0]; liveF = 0.55; liveLastT = performance.now();
  e.preventDefault();
});
board.addEventListener('pointermove', e => {
  if (e.pointerId !== activePointer || !livePts) return;
  const p = evtPos(e);
  const last = livePts[livePts.length - 1];
  if (dist(p, last) > 0.8) {
    const now = performance.now();
    const dt = Math.max(now - liveLastT, 1); liveLastT = now;
    const v = dist(p, last) / dt;
    liveF = liveF * 0.6 + widthFactor(v) * 0.4;
    livePts.push(p); liveW.push(liveF); liveV.push(v);
  }
});
function endStroke(e) {
  if (e.pointerId !== activePointer) return;
  activePointer = null;
  const pts = livePts, w = liveW, v = liveV; livePts = null; liveW = null; liveV = null;
  if (!pts || pts.length === 0) return;
  finishBrush(pts, w, v);
  const strokes = currentStrokes();

  if (phase === 'trace') {
    const tmpl = strokes[strokeIndex];
    if (pts.length < 2 && pathLen(tmpl) >= 20) return;
    if (judgeStroke(pts, tmpl, true)) {
      userStrokes.push({ pts, w, ok: true });
      strokeIndex++; missesThisStroke = 0;
      beep([740]); vibe(25);
      if (strokeIndex >= strokes.length) traceCleared();
      else { setMsg(`いいね！つぎは ${strokeIndex + 1}かくめ！`, 'good'); updateCounter(); }
    } else {
      missesThisStroke++; itemMisses++;
      fadeStroke = { pts, w, t0: performance.now() };
      board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
      beep([180]); vibe([60, 50, 60]);
      if (missesThisStroke >= 3) {
        setMsg('おてほんを みてみよう！', 'bad');
        demo = { list: [strokeIndex], cur: 0, t0: performance.now() };
        missesThisStroke = 0;
      } else {
        setMsg('おしい！オレンジの まる から やじるしの ほうこうへ！', 'bad');
      }
    }
  } else if (phase === 'memory') {
    if (pts.length < 2) return;
    userStrokes.push({ pts, w, ok: null });
    updateCounter();
    vibe(15);
  }
}
board.addEventListener('pointerup', endStroke);
board.addEventListener('pointercancel', endStroke);

/* ---------- ボタン ---------- */
els.demoB.addEventListener('click', () => {
  if (demo) return;
  demo = { list: currentStrokes().map((_, i) => i), cur: 0, t0: performance.now() };
  setMsg('おてほんを よくみてね！');
});
els.hintB.addEventListener('click', () => {
  hintUsed = true;
  showHintTemplate = true;
  setTimeout(() => { if (phase === 'memory') showHintTemplate = false; }, 1200);
});
els.undoB.addEventListener('click', () => { userStrokes.pop(); updateCounter(); });
els.clearB.addEventListener('click', () => { userStrokes = []; updateCounter(); });
els.submitB.addEventListener('click', () => {
  if (refreshSessionForCurrentDay()) return;
  const strokes = currentStrokes();
  if (userStrokes.length === 0) return;
  if (userStrokes.length !== strokes.length) {
    failedSubmits++;
    setMsg(`かくすうが ちがうよ！この かんじは ${strokes.length}かくだよ。`, 'bad');
    beep([180]); vibe([60, 50, 60]);
    if (failedSubmits >= 2) {
      hintUsed = true;
      showHintTemplate = true;
      setMsg(`うすい おてほんを だしたよ。${strokes.length}かくで かいてみよう！`, 'bad');
    }
    return;
  }
  let allOk = true;
  userStrokes.forEach((st, i) => {
    st.ok = judgeStroke(st.pts, strokes[i], false);
    if (!st.ok) allOk = false;
  });
  if (allOk) { concludeItem(); return; }
  failedSubmits++;
  phase = 'memory-review';
  updateChips();
  setMsg('あかい ところが ちがうよ。おてほんと くらべてみよう！', 'bad');
  beep([220]); vibe([60, 50, 60]);
  showButtons(['retryB', 'relearnB']);
});
els.retryB.addEventListener('click', () => {
  phase = 'memory'; userStrokes = [];
  if (failedSubmits >= 2) { hintUsed = true; showHintTemplate = true; }
  updateChips(); updateCounter();
  showButtons(['hintB', 'undoB', 'clearB', 'submitB']);
  setMsg(showHintTemplate ? 'うすい おてほんを なぞってもいいよ！' : 'もういちど チャレンジ！');
});
els.relearnB.addEventListener('click', () => {
  if (refreshSessionForCurrentDay()) return;
  startTrace();
});
els.memoryB.addEventListener('click', () => {
  if (refreshSessionForCurrentDay()) return;
  startMemory();
});
els.nextB.addEventListener('click', () => {
  if (refreshSessionForCurrentDay()) return;
  qi += 1;
  if (qi < queue.length) startItem();
  else finishSession();
});
$('btn-next-new').addEventListener('click', () => {
  if (refreshSessionForCurrentDay()) return;
  const nextNew = composeNextNewBatch();
  if (nextNew.length === 0) {
    $('btn-next-new').classList.add('hidden');
    return;
  }
  startQueue(nextNew, 'extra-new');
});
$('btn-okawari').addEventListener('click', () => {
  if (refreshSessionForCurrentDay()) return;
  const extra = composeOkawari(sessionDay || todayKey());
  if (extra.length === 0) return;
  startQueue(extra, 'bonus');
});
$('sound-btn').addEventListener('click', e => {
  soundOn = !soundOn;
  e.currentTarget.textContent = soundOn ? '🔊' : '🔇';
});

/* ---------- 起動 ---------- */
window.addEventListener('resize', fitCanvas);
window.addEventListener('pageshow', handleAppResume);
window.addEventListener('focus', handleAppResume);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') handleAppResume();
});
fitCanvas();
initCloud();
startSession();
scheduleDayRollover();
requestAnimationFrame(render);

/* ?date= デバッグ時のみ、自動テストから内部状態を確認できるようにする */
if (DEBUG_DATE) {
  window.__KANJI_TEST__ = {
    judgeStroke,
    todayKey,
    composeSession,
    composeNextNewBatch,
    refreshSessionForDay,
    getProgress: () => progress,
    getQueue: () => queue.map(item => ({ char: item.entry.char, kind: item.kind })),
    getSessionDay: () => sessionDay,
    getSessionMode: () => sessionMode,
    getPhase: () => phase,
    currentChar: () => (currentItem() ? currentItem().entry.char : null),
    currentStrokes,
    // 以下はスケジューリングを高速に検証するためのテスト専用フック
    // （?date= 指定時のみ有効。実ストロークを描かず結果だけ確定する）
    forceConclude(clean = true) {
      failedSubmits = clean ? 0 : 1;
      hintUsed = false;
      itemMisses = clean ? 0 : 1;
      concludeItem();
    },
    forceNext() {
      qi += 1;
      if (qi < queue.length) startItem(); else finishSession();
    }
  };
}
})();
