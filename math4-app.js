(function () {
'use strict';

/* =====================================================================
   夏休み 算数マスター（4年生）
   - 九九81問は kanji-app.js と同じ間隔反復（別の日に2回クリアでマスター）
   - 3桁×1桁／3桁×2桁のかけ算ひっ算、3桁÷1桁のわり算ひっ算は
     問題をその場で生成し、桁ごとにドラッグで数字・くり上がりを置いていく
   - 記録: localStorage weaknessQuiz:<child>:math4Progress + 既存statsに加算
   ===================================================================== */

const CHILD_IDS = ['child-3'];
const params = new URLSearchParams(location.search);
const childId = CHILD_IDS.includes(params.get('child')) ? params.get('child') : CHILD_IDS[0];
const DEBUG_DATE = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : null;

document.getElementById('back-link').href = `index.html?child=${childId}`;

/* ---------- 日付・保存ユーティリティ（kanji-app.jsと同じ考え方） ---------- */
function todayKey(date) {
  if (DEBUG_DATE && !date) return DEBUG_DATE;
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(dayKey, days) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + days));
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

/* ---------- 九九 出題データ ---------- */
// 学校でならう定番の順（やさしい段から）。1の段は最後にかるく確認する
const DAN_ORDER = [2, 5, 3, 4, 6, 7, 8, 9, 1];
const KUKU_FACTS = [];
DAN_ORDER.forEach((a, danIndex) => {
  for (let b = 1; b <= 9; b++) {
    KUKU_FACTS.push({ id: `${a}x${b}`, a, b, product: a * b, order: danIndex * 9 + (b - 1) });
  }
});
const KUKU_SCHEDULE = { newPerDay: 9, maxReviewsPerSession: 14, reviewIntervals: [1, 3, 7, 14], masterySessions: 2 };

/* ---------- ひっ算レベル定義 ---------- */
const LEVELS = [
  { id: 'mult1', kind: 'mult', label: '3けた × 1けた', emoji: '✖️', problemsPerSession: 5 },
  { id: 'mult2', kind: 'mult', label: '3けた × 2けた', emoji: '✖️', problemsPerSession: 4, requires: 'mult1' },
  { id: 'div1', kind: 'div', label: '3けた ÷ 1けた', emoji: '➗', problemsPerSession: 5 }
];
function levelById(id) { return LEVELS.find((l) => l.id === id); }

/* ---------- 進捗レコード ---------- */
function emptyProgress() {
  const levels = {};
  LEVELS.forEach((level) => { levels[level.id] = emptyLevelRecord(); });
  return { version: 1, facts: {}, levels, daily: {}, updatedAt: '' };
}
function emptyLevelRecord() {
  return { solved: 0, clean: 0, streak: 0, bestStreak: 0, sessionsDone: 0, lastSessionDay: '' };
}
function migrateProgress(raw) {
  if (!raw || typeof raw !== 'object' || raw.version !== 1) return emptyProgress();
  if (!raw.facts || typeof raw.facts !== 'object') raw.facts = {};
  if (!raw.daily || typeof raw.daily !== 'object') raw.daily = {};
  if (!raw.levels || typeof raw.levels !== 'object') raw.levels = {};
  LEVELS.forEach((level) => {
    if (!raw.levels[level.id]) raw.levels[level.id] = emptyLevelRecord();
  });
  return raw;
}
let progress = migrateProgress(readJson(recordKey('math4Progress'), null));
function saveProgress() {
  progress.updatedAt = nowIso();
  writeJson(recordKey('math4Progress'), progress);
  scheduleCloudSave();
}
function newFactRecord() {
  return {
    attempts: 0, correct: 0, misses: 0, clearDays: 0, lastClearDay: '', stage: 0,
    reviewDueAt: '', masteredAt: '', firstSeenAt: '', lastSeenAt: ''
  };
}
function masteredFactCount() {
  return KUKU_FACTS.filter((f) => (progress.facts[f.id] || {}).masteredAt).length;
}
function factsForDan(dan) {
  return KUKU_FACTS.filter((f) => f.a === dan);
}
// none=まだ / learn=れんしゅう中 / clear=ノーミスでクリアずみ / master=別の日2回クリア
function factState(id) {
  const r = progress.facts[id];
  if (!r) return 'none';
  if (r.masteredAt) return 'master';
  if ((r.clearDays || 0) >= 1) return 'clear';
  return 'learn';
}
function danSummary(dan) {
  let mastered = 0;
  let cleared = 0;
  let touched = 0;
  factsForDan(dan).forEach((f) => {
    const st = factState(f.id);
    if (st !== 'none') touched += 1;
    if (st === 'master') { mastered += 1; cleared += 1; }
    else if (st === 'clear') cleared += 1;
  });
  return { mastered, cleared, touched };
}
function recommendedDan() {
  const notCleared = DAN_ORDER.find((dan) => danSummary(dan).cleared < 9);
  if (notCleared) return notCleared;
  return DAN_ORDER.find((dan) => danSummary(dan).mastered < 9) || null;
}
function countDueKuku() {
  const day = todayKey();
  return KUKU_FACTS.filter((f) => {
    const r = progress.facts[f.id];
    return r && r.reviewDueAt && r.reviewDueAt <= day && r.lastClearDay !== day;
  }).length;
}
function isLevelUnlocked(levelId) {
  const level = levelById(levelId);
  if (!level.requires) return true;
  const req = progress.levels[level.requires];
  return req && req.solved >= 8 && req.solved > 0 && req.clean / req.solved >= 0.6;
}

/* 既存アプリの stats（累計・連続日数）へ橋渡し */
function bumpStats(clean, addSession) {
  const key = recordKey('stats');
  const stats = readJson(key, { daily: {} });
  if (!stats.daily || typeof stats.daily !== 'object') stats.daily = {};
  const day = todayKey();
  const entry = stats.daily[day] || { answered: 0, correct: 0, sessions: 0 };
  if (clean !== null) {
    entry.answered = (entry.answered || 0) + 1;
    if (clean) entry.correct = (entry.correct || 0) + 1;
  }
  if (addSession) entry.sessions = (entry.sessions || 0) + 1;
  stats.daily[day] = entry;
  writeJson(key, stats);
}

/* ---------- クラウド同期（既存 records/default に相乗り） ---------- */
const cloud = window.WeaknessQuizCloud;
let cloudReady = false;
let cloudTimer = null;

function mergeMath4Progress(local, remote) {
  const a = migrateProgress(local);
  const b = migrateProgress(remote);
  const out = emptyProgress();
  const facts = new Set([...Object.keys(a.facts), ...Object.keys(b.facts)]);
  facts.forEach((id) => {
    const ra = a.facts[id];
    const rb = b.facts[id];
    if (!ra || !rb) { out.facts[id] = { ...(ra || rb) }; return; }
    const newer = (rb.lastSeenAt || '') > (ra.lastSeenAt || '') ? rb : ra;
    out.facts[id] = {
      attempts: Math.max(ra.attempts || 0, rb.attempts || 0),
      correct: Math.max(ra.correct || 0, rb.correct || 0),
      misses: Math.max(ra.misses || 0, rb.misses || 0),
      clearDays: newer.clearDays || 0,
      lastClearDay: newer.lastClearDay || '',
      stage: newer.stage || 0,
      reviewDueAt: newer.reviewDueAt || '',
      masteredAt: newer.masteredAt || '',
      firstSeenAt: [ra.firstSeenAt, rb.firstSeenAt].filter(Boolean).sort()[0] || '',
      lastSeenAt: (rb.lastSeenAt || '') > (ra.lastSeenAt || '') ? rb.lastSeenAt : (ra.lastSeenAt || '')
    };
  });
  LEVELS.forEach((level) => {
    const la = a.levels[level.id] || emptyLevelRecord();
    const lb = b.levels[level.id] || emptyLevelRecord();
    out.levels[level.id] = {
      solved: Math.max(la.solved || 0, lb.solved || 0),
      clean: Math.max(la.clean || 0, lb.clean || 0),
      streak: Math.max(la.streak || 0, lb.streak || 0),
      bestStreak: Math.max(la.bestStreak || 0, lb.bestStreak || 0),
      sessionsDone: Math.max(la.sessionsDone || 0, lb.sessionsDone || 0),
      lastSessionDay: [la.lastSessionDay, lb.lastSessionDay].filter(Boolean).sort().slice(-1)[0] || ''
    };
  });
  const days = new Set([...Object.keys(a.daily), ...Object.keys(b.daily)]);
  days.forEach((day) => {
    const da = a.daily[day] || {};
    const db = b.daily[day] || {};
    out.daily[day] = {
      kukuNew: Math.max(da.kukuNew || 0, db.kukuNew || 0),
      kukuClears: Math.max(da.kukuClears || 0, db.kukuClears || 0),
      writtenSolved: Math.max(da.writtenSolved || 0, db.writtenSolved || 0),
      writtenClean: Math.max(da.writtenClean || 0, db.writtenClean || 0)
    };
  });
  out.updatedAt = (b.updatedAt || '') > (a.updatedAt || '') ? b.updatedAt : (a.updatedAt || '');
  return out;
}

function scheduleCloudSave() {
  if (!cloudReady) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => {
    try {
      cloud.saveRecord(childId, {
        math4: progress,
        stats: readJson(recordKey('stats'), { daily: {} })
      }).catch(() => {});
    } catch (e) {}
  }, 1200);
}
async function pullCloud() {
  try {
    const remote = await cloud.getRecord(childId);
    if (!remote || !remote.math4) return;
    const merged = mergeMath4Progress(progress, remote.math4);
    if (JSON.stringify(merged) === JSON.stringify(progress)) return;
    progress = merged;
    writeJson(recordKey('math4Progress'), progress);
    updateHomeChrome();
  } catch (e) {}
}
function initCloud() {
  if (!cloud) return;
  try {
    const status = cloud.init();
    if (!status.available) return;
    cloud.onAuthStateChanged((user) => {
      cloudReady = !!user;
      if (user) pullCloud();
    });
  } catch (e) {}
}

/* =====================================================================
   算数エンジン：くり上がり・くり下がりの手順を列にする
   （かけ算の各行・足し算の答え行はすべて同じ「桁の処理」で作れる）
   ===================================================================== */
function digitsLSF(n, width) {
  const out = [];
  let x = n;
  for (let i = 0; i < width; i++) { out.push(x % 10); x = Math.floor(x / 10); }
  return out;
}
function numberFromLSF(arr) {
  let n = 0;
  for (let i = arr.length - 1; i >= 0; i--) n = n * 10 + (arr[i] || 0);
  return n;
}
function buildColumnSteps(contributionFn, maxCol) {
  const digits = [];
  const carryIntoNext = [];
  const steps = [];
  let carryIn = 0;
  let col = 0;
  while (col <= maxCol || carryIn > 0) {
    const contribution = col <= maxCol ? contributionFn(col) : 0;
    const value = contribution + carryIn;
    const digit = value % 10;
    const carryOut = Math.floor(value / 10);
    digits[col] = digit;
    steps.push({ kind: 'digit', col, value: digit });
    if (carryOut > 0) {
      carryIntoNext[col] = carryOut;
      steps.push({ kind: 'carry', col: col + 1, value: carryOut });
    }
    carryIn = carryOut;
    col++;
  }
  return { digits, carryIntoNext, steps, width: col };
}
function buildMultiplyRow(multiplicandLSF, multiplierDigit) {
  return buildColumnSteps((col) => (multiplicandLSF[col] || 0) * multiplierDigit, multiplicandLSF.length - 1);
}
function buildSumRow(rowsWithShift, maxCol) {
  return buildColumnSteps((col) => {
    let sum = 0;
    rowsWithShift.forEach(({ digits, shift }) => {
      const idx = col - shift;
      if (idx >= 0 && digits[idx] !== undefined) sum += digits[idx];
    });
    return sum;
  }, maxCol);
}
function longDivisionSteps(dividendDigitsMSF, divisor) {
  const steps = [];
  const quotientDigits = [];
  let remainder = 0;
  let started = false;
  for (let i = 0; i < dividendDigitsMSF.length; i++) {
    const remainderBefore = remainder;
    const chunk = remainder * 10 + dividendDigitsMSF[i];
    const q = Math.floor(chunk / divisor);
    if (!started && q === 0 && i < dividendDigitsMSF.length - 1) {
      quotientDigits.push(null);
      remainder = chunk;
      continue;
    }
    started = true;
    const chunkWidth = remainderBefore > 0 ? 2 : 1;
    quotientDigits.push(q);
    const product = q * divisor;
    const rem = chunk - product;
    steps.push({ dividendIndex: i, chunk, q, product, remainder: rem, chunkWidth });
    remainder = rem;
  }
  return { quotientDigits, steps, remainder };
}

/* ---------- 問題生成 ---------- */
function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function generateMult1Problem() {
  const multiplicand = randInt(102, 989);
  const multiplierDigit = randInt(2, 9);
  return { kind: 'mult', multiplicand, multiplier: multiplierDigit, twoDigit: false };
}
function generateMult2Problem() {
  const multiplicand = randInt(102, 897);
  const multiplier = randInt(12, 89);
  return { kind: 'mult', multiplicand, multiplier, twoDigit: true };
}
function generateDiv1Problem() {
  const divisor = randInt(2, 9);
  // 割り切れる問題とあまりが出る問題を半々に。割られる数は必ず3桁にする
  if (Math.random() < 0.5) {
    const quotient = randInt(Math.ceil(100 / divisor), Math.floor(999 / divisor));
    return { kind: 'div', dividend: quotient * divisor, divisor };
  }
  return { kind: 'div', dividend: randInt(100, 999), divisor };
}
function generateProblem(levelId) {
  if (levelId === 'mult1') return generateMult1Problem();
  if (levelId === 'mult2') return generateMult2Problem();
  return generateDiv1Problem();
}

/* ---------- 盤面モデル（グリッド + ステップ列）を作る ---------- */
let uidCounter = 0;
function uid() { return `c${uidCounter++}`; }

function pushRowSteps(cells, ordered, rowSteps, row, prefix, colOffset) {
  rowSteps.forEach((s) => {
    const col = s.col + (colOffset || 0);
    if (s.kind === 'carry') {
      const stepId = `${prefix}-carry-${col}`;
      cells.push({ id: uid(), row: row.carry, col, kind: 'carry-input', value: s.value, stepId });
      ordered.push({ id: stepId, expected: s.value });
    } else {
      const stepId = `${prefix}-digit-${col}`;
      cells.push({ id: uid(), row: row.digit, col, kind: 'input', value: s.value, stepId });
      ordered.push({ id: stepId, expected: s.value });
    }
  });
}

function buildMultiplyBoard(problem) {
  const multiplicandLSF = digitsLSF(problem.multiplicand, 3);
  const cells = [];
  const ordered = [];
  const ruleRows = [];

  // col は一の位=0からの「位」で統一する（かけ算の各行と同じ向き）。
  // 見た目の右づめは描画側で cols - col に変換して行う。
  const addGivenRow = (row, digitsMSFText, opPrefix) => {
    const text = String(digitsMSFText);
    for (let i = 0; i < text.length; i++) {
      cells.push({ id: uid(), row, col: text.length - 1 - i, kind: 'given', value: Number(text[i]) });
    }
    if (opPrefix) cells.push({ id: uid(), row, col: -1, kind: 'op', value: opPrefix });
  };
  addGivenRow(0, problem.multiplicand);

  if (!problem.twoDigit) {
    addGivenRow(1, problem.multiplier, '×');
    ruleRows.push(2);
    const product = buildMultiplyRow(multiplicandLSF, problem.multiplier);
    pushRowSteps(cells, ordered, product.steps, { carry: 3, digit: 4 }, 'p');
    return {
      cols: Math.max(product.width, 3),
      rows: 5,
      cells,
      steps: ordered,
      ruleRows,
      resultLabel: numberFromLSF(product.digits)
    };
  }

  // 2桁のかけ算：部分積2行 + 合計行
  const onesDigit = problem.multiplier % 10;
  const tensDigit = Math.floor(problem.multiplier / 10);
  addGivenRow(1, String(problem.multiplier).padStart(2, '0'), '×');
  ruleRows.push(2);
  const p1 = buildMultiplyRow(multiplicandLSF, onesDigit);
  const p2 = buildMultiplyRow(multiplicandLSF, tensDigit);

  pushRowSteps(cells, ordered, p1.steps, { carry: 3, digit: 4 }, 'p1', 0);
  pushRowSteps(cells, ordered, p2.steps, { carry: 5, digit: 6 }, 'p2', 1);
  // 十の位の積は一の位が空欄マス（くり上げなし、書かない習慣を示す）
  cells.push({ id: uid(), row: 6, col: 0, kind: 'blank', value: null });
  ruleRows.push(7);

  const sumMaxCol = Math.max(p1.width - 1, p2.width);
  const sum = buildSumRow([{ digits: p1.digits, shift: 0 }, { digits: p2.digits, shift: 1 }], sumMaxCol);
  pushRowSteps(cells, ordered, sum.steps, { carry: 8, digit: 9 }, 'sum');

  const totalCols = Math.max(3, sum.width, p2.width + 1);
  return { cols: totalCols, rows: 10, cells, steps: ordered, ruleRows, resultLabel: numberFromLSF(sum.digits) };
}

function buildDivisionBoard(problem) {
  const digitsMSF = String(problem.dividend).split('').map(Number);
  const plan = longDivisionSteps(digitsMSF, problem.divisor);
  const cells = [];
  const steps = [];
  const ruleRows = [];
  const cols = digitsMSF.length;

  // 商の行（row 0）
  plan.steps.forEach((s) => {
    const stepId = `quot-${s.dividendIndex}`;
    cells.push({ id: uid(), row: 0, col: s.dividendIndex, kind: 'input', value: s.q, stepId });
    steps.push({ id: stepId, expected: s.q });
  });
  // 割られる数の行（row 1、割る数は左のラベルとして別描画）
  digitsMSF.forEach((d, i) => {
    cells.push({ id: uid(), row: 1, col: i, kind: 'given', value: d, sourceIndex: i });
  });

  let row = 2;
  plan.steps.forEach((s, idx) => {
    const productRow = row;
    const productDigits = digitsLSF(s.product, s.chunkWidth);
    const startCol = s.dividendIndex - (s.chunkWidth - 1);
    for (let c = 0; c < s.chunkWidth; c++) {
      const col = startCol + c;
      const digit = productDigits[s.chunkWidth - 1 - c];
      const stepId = `prod-${s.dividendIndex}-${col}`;
      cells.push({ id: uid(), row: productRow, col, kind: 'input', value: digit, stepId });
      steps.push({ id: stepId, expected: digit });
    }
    const ruleRow = productRow + 1;
    ruleRows.push(ruleRow);
    const remRow = ruleRow + 1;
    const remStepId = `rem-${s.dividendIndex}`;
    cells.push({ id: uid(), row: remRow, col: s.dividendIndex, kind: 'input', value: s.remainder, stepId: remStepId });
    steps.push({ id: remStepId, expected: s.remainder });
    const hasNext = idx < plan.steps.length - 1;
    if (hasNext) {
      const nextIndex = plan.steps[idx + 1].dividendIndex;
      const bringStepId = `bring-${nextIndex}`;
      cells.push({ id: uid(), row: remRow, col: nextIndex, kind: 'bringdown', value: digitsMSF[nextIndex], stepId: bringStepId, sourceIndex: nextIndex });
      steps.push({ id: bringStepId, expected: digitsMSF[nextIndex], isBringDown: true, sourceIndex: nextIndex });
    }
    row = remRow + 1;
  });

  return { cols, rows: row, cells, steps, ruleRows, quotient: Number(plan.quotientDigits.filter((d) => d !== null).join('')), remainder: plan.remainder };
}

/* =====================================================================
   画面制御
   ===================================================================== */
const $ = (id) => document.getElementById(id);
const els = {
  modeScreen: $('mode-screen'),
  kukuScreen: $('kuku-screen'),
  sessionScreen: $('session-screen'),
  resultScreen: $('result-screen'),
  sessionTitle: $('session-title'),
  sessionProgress: $('session-progress'),
  workArea: $('work-area'),
  palette: $('digit-palette'),
  feedback: $('feedback'),
  nextBtn: $('btn-next'),
  hintBtn: $('btn-hint'),
  backToModes: $('btn-back-modes'),
  scratchToggle: $('btn-scratch'),
  scratchPanel: $('scratch-panel'),
  scratchCanvas: $('scratch-canvas'),
  scratchClear: $('btn-scratch-clear'),
  resultTitle: $('result-title'),
  resultSummary: $('result-summary'),
  resultHome: $('result-home'),
  btnResultAgain: $('btn-result-again'),
  btnResultModes: $('btn-result-modes')
};
els.resultHome.href = `index.html?child=${childId}`;

let currentMode = null; // 'kuku' | 'dan' | 'mult1' | 'mult2' | 'div1'
let currentDan = null;
let session = null; // { queue, qi, results, itemMisses, ... }

function showScreen(name) {
  els.modeScreen.classList.toggle('hidden', name !== 'mode');
  els.kukuScreen.classList.toggle('hidden', name !== 'kuku');
  els.sessionScreen.classList.toggle('hidden', name !== 'session');
  els.resultScreen.classList.toggle('hidden', name !== 'result');
}

function updateHomeChrome() {
  const reco = recommendedDan();
  $('kuku-progress-line').textContent = reco
    ? `マスター ${masteredFactCount()}/81・つぎは ${reco}のだん`
    : 'ぜんぶマスター！ 81/81';
  LEVELS.forEach((level) => {
    const card = document.querySelector(`.mode-card[data-level="${level.id}"]`);
    if (!card) return;
    const rec = progress.levels[level.id];
    const unlocked = isLevelUnlocked(level.id);
    card.classList.toggle('locked', !unlocked);
    const stat = card.querySelector('.mode-card-stat');
    if (stat) {
      stat.textContent = unlocked
        ? `${rec.solved}問 とけた・れんぞく${rec.streak}`
        : 'まず 3けた×1けたを クリアしよう';
    }
  });
}

function buildModeCards() {
  const grid = $('mode-grid');
  grid.innerHTML = '';
  const kukuCard = document.createElement('button');
  kukuCard.type = 'button';
  kukuCard.className = 'mode-card';
  kukuCard.dataset.level = 'kuku';
  kukuCard.innerHTML = `<span class="mode-card-emoji">🔢</span><div class="mode-card-body"><h3>九九マスター</h3><p class="mode-card-stat" id="kuku-progress-line"></p></div>`;
  kukuCard.addEventListener('click', () => renderKukuHome());
  grid.appendChild(kukuCard);

  LEVELS.forEach((level) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mode-card';
    card.dataset.level = level.id;
    const rec = progress.levels[level.id];
    card.innerHTML = `<span class="mode-card-emoji">${level.emoji}</span><div class="mode-card-body"><h3>${level.label}</h3><p class="mode-card-stat">${rec.solved}問 とけた・れんぞく${rec.streak}</p></div>`;
    card.addEventListener('click', () => {
      if (!isLevelUnlocked(level.id)) return;
      startWrittenSession(level.id);
    });
    grid.appendChild(card);
  });
  updateHomeChrome();
}

/* ---------- 九九トップ（段えらび + 81マスの進捗マップ） ---------- */
function renderKukuHome() {
  currentMode = 'kuku-home';
  showScreen('kuku');
  const wrap = $('kuku-home');
  wrap.innerHTML = '';
  const due = countDueKuku();
  const reco = recommendedDan();

  const mix = document.createElement('button');
  mix.type = 'button';
  mix.className = 'mode-card kuku-mix-card';
  mix.innerHTML = `<span class="mode-card-emoji">🃏</span><div class="mode-card-body"><h3>きょうの ミックス</h3><p class="mode-card-stat">${due > 0 ? `ふくしゅう ${due}こ + あたらしい九九` : 'あたらしい九九に すすもう'}</p></div>`;
  mix.addEventListener('click', () => startKukuSession());
  wrap.appendChild(mix);

  const note = document.createElement('p');
  note.className = 'kuku-order-note';
  note.textContent = `マスター ${masteredFactCount()}/81 ・ ならいやすい じゅんばんに ならんでいるよ`;
  wrap.appendChild(note);

  DAN_ORDER.forEach((dan) => {
    const sum = danSummary(dan);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'dan-row' + (dan === reco ? ' recommended' : '');
    const cells = factsForDan(dan).map((f) => `<span class="dan-cell ${factState(f.id)}"></span>`).join('');
    row.innerHTML = `${dan === reco ? '<span class="dan-reco">つぎは ここ！</span>' : ''}<span class="dan-name">${dan}のだん</span><span class="dan-cells">${cells}</span><span class="dan-count">${sum.mastered}/9</span>`;
    row.addEventListener('click', () => startDanSession(dan));
    wrap.appendChild(row);
  });

  const legend = document.createElement('p');
  legend.className = 'dan-legend';
  legend.innerHTML = '<span class="dan-cell learn"></span>れんしゅう中　<span class="dan-cell clear"></span>クリア　<span class="dan-cell master"></span>マスター';
  wrap.appendChild(legend);

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'act ghost';
  back.textContent = 'モードえらびへ もどる';
  back.addEventListener('click', () => { showScreen('mode'); buildModeCards(); });
  wrap.appendChild(back);
}

/* ---------- 九九セッション ---------- */
// 段れんしゅう: ①じゅんばんに9問（図つき）→ ②ばらばらに9問
function startDanSession(dan) {
  currentMode = 'dan';
  currentDan = dan;
  const facts = factsForDan(dan);
  session = {
    queue: [
      ...facts.map((f) => ({ fact: f, kind: 'dan', pass: 'order' })),
      ...shuffle(facts).map((f) => ({ fact: f, kind: 'dan', pass: 'random' }))
    ],
    qi: 0,
    results: [],
    itemMisses: 0,
    hintUsed: false
  };
  showScreen('session');
  els.sessionTitle.textContent = `${dan}のだん マスター`;
  els.backToModes.textContent = '九九トップへ';
  els.backToModes.classList.remove('hidden');
  renderKukuItem();
}

function composeKukuSession() {
  const day = todayKey();
  const sched = KUKU_SCHEDULE;
  const due = KUKU_FACTS.filter((f) => {
    const r = progress.facts[f.id];
    return r && r.reviewDueAt && r.reviewDueAt <= day && r.lastClearDay !== day;
  }).sort((x, y) => {
    const rx = progress.facts[x.id];
    const ry = progress.facts[y.id];
    if (rx.reviewDueAt !== ry.reviewDueAt) return rx.reviewDueAt < ry.reviewDueAt ? -1 : 1;
    if ((ry.misses || 0) !== (rx.misses || 0)) return (ry.misses || 0) - (rx.misses || 0);
    return x.order - y.order;
  });
  const reviews = due.slice(0, sched.maxReviewsPerSession);
  const introducedToday = KUKU_FACTS.filter((f) => (progress.facts[f.id] || {}).firstSeenAt === day).length;
  const newCount = Math.max(0, sched.newPerDay - introducedToday);
  const newOnes = KUKU_FACTS.filter((f) => !progress.facts[f.id]).sort((x, y) => x.order - y.order).slice(0, newCount);
  const queue = [...reviews.map((f) => ({ fact: f, kind: 'review' })), ...newOnes.map((f) => ({ fact: f, kind: 'new' }))];
  if (queue.length === 0 && due.length === 0) {
    // 今日ぶんが尽きたら、まだマスターしていない九九をおかわり
    const bonus = KUKU_FACTS.filter((f) => !(progress.facts[f.id] || {}).masteredAt)
      .sort((x, y) => x.order - y.order).slice(0, 8);
    return bonus.map((f) => ({ fact: f, kind: 'bonus' }));
  }
  return queue;
}

function factDistractors(fact) {
  const correct = fact.product;
  const candidates = new Set();
  const add = (v) => { if (v > 0 && v !== correct && v <= 90) candidates.add(v); };
  add(fact.a * (fact.b - 1));
  add(fact.a * (fact.b + 1));
  add((fact.a - 1) * fact.b);
  add((fact.a + 1) * fact.b);
  add(correct + fact.a);
  add(correct - fact.a);
  add(correct + fact.b);
  add(correct - fact.b);
  add(correct + 1);
  add(correct - 1);
  const pool = Array.from(candidates);
  const picked = [];
  while (picked.length < 3 && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  while (picked.length < 3) {
    const v = randInt(1, 81);
    if (v !== correct && !picked.includes(v)) picked.push(v);
  }
  return picked;
}

function startKukuSession() {
  currentMode = 'kuku';
  session = { queue: composeKukuSession(), qi: 0, results: [], itemMisses: 0, hintUsed: false };
  showScreen('session');
  els.sessionTitle.textContent = 'きょうの ミックス';
  els.backToModes.textContent = '九九トップへ';
  els.backToModes.classList.remove('hidden');
  if (session.queue.length === 0) { finishSession(); return; }
  renderKukuItem();
}

function renderKukuItem() {
  const item = session.queue[session.qi];
  const fact = item.fact;
  session.itemMisses = 0;
  session.hintUsed = false;
  els.sessionProgress.textContent = `${session.qi + 1} / ${session.queue.length}`;
  els.feedback.textContent = '';
  els.feedback.className = 'feedback';
  els.nextBtn.classList.add('hidden');
  els.hintBtn.classList.remove('hidden');

  const badge = item.kind === 'dan'
    ? (item.pass === 'order' ? `📖 ${fact.a}のだんを じゅんばんに` : '🎲 ばらばらに チャレンジ')
    : item.kind === 'new' ? '🌱 あたらしい' : item.kind === 'bonus' ? '💪 おかわり' : '🔁 ふくしゅう';
  const choices = shuffle([fact.product, ...factDistractors(fact)]);
  els.workArea.innerHTML = `
    <div class="kuku-card">
      <p class="kuku-kind">${badge}</p>
      <div class="kuku-equation">
        <span>${fact.a}</span><span class="kuku-op">×</span><span>${fact.b}</span><span class="kuku-op">=</span>
        <span class="kuku-slot" id="kuku-slot" data-expected="${fact.product}"></span>
      </div>
      <button type="button" class="ghost-btn" id="kuku-array-toggle">🔲 ずで かくにん</button>
      <div class="kuku-array hidden" id="kuku-array"></div>
      <div class="kuku-choices" id="kuku-choices"></div>
    </div>
  `;
  const arrayEl = $('kuku-array');
  for (let r = 0; r < fact.a; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kuku-array-row';
    for (let c = 0; c < fact.b; c++) {
      const dot = document.createElement('span');
      dot.className = 'kuku-dot';
      rowEl.appendChild(dot);
    }
    arrayEl.appendChild(rowEl);
  }
  $('kuku-array-toggle').addEventListener('click', () => arrayEl.classList.toggle('hidden'));
  // だん練習の1周目（じゅんばん）は図を見ながら「かたまりの数」として覚える
  if (item.kind === 'dan' && item.pass === 'order') arrayEl.classList.remove('hidden');

  const choiceWrap = $('kuku-choices');
  choices.forEach((value) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'digit-tile kuku-tile';
    tile.textContent = value;
    tile.addEventListener('pointerdown', (event) => startTileDrag(event, tile, value, checkKukuDrop));
    choiceWrap.appendChild(tile);
  });
}

function checkKukuDrop(value, dropEl) {
  const slot = $('kuku-slot');
  if (!dropEl || dropEl.id !== 'kuku-slot') return false;
  const expected = Number(slot.dataset.expected);
  if (value === expected) {
    slot.textContent = value;
    slot.classList.add('correct');
    beep([523, 659, 784]); vibe([30, 40, 60]);
    concludeKukuItem(true);
    return true;
  }
  session.itemMisses++;
  slot.classList.remove('correct');
  shakeEl(slot);
  beep([180]); vibe([60, 50, 60]);
  els.feedback.textContent = 'おしい！もういちど かんがえてみよう。';
  els.feedback.className = 'feedback bad';
  if (session.itemMisses >= 2) {
    $('kuku-array').classList.remove('hidden');
    session.hintUsed = true;
    els.feedback.textContent = 'ずをみて、かずを かぞえてみよう！';
  }
  return false;
}

function concludeKukuItem(clean) {
  const item = session.queue[session.qi];
  const fact = item.fact;
  const day = todayKey();
  const isFirstEver = !progress.facts[fact.id];
  if (isFirstEver) progress.facts[fact.id] = newFactRecord();
  const rec = progress.facts[fact.id];
  if (!rec.firstSeenAt) rec.firstSeenAt = day;
  rec.attempts += 1;
  rec.misses += session.itemMisses;
  rec.lastSeenAt = nowIso();
  const wasClean = session.itemMisses === 0;
  if (wasClean) rec.correct += 1;

  if (item.kind !== 'bonus') {
    if (!wasClean) {
      rec.clearDays = 0;
      rec.stage = 0;
      rec.masteredAt = '';
      rec.reviewDueAt = addDays(day, 1);
    } else if (rec.lastClearDay !== day) {
      rec.clearDays += 1;
      rec.lastClearDay = day;
      const interval = KUKU_SCHEDULE.reviewIntervals[Math.min(rec.stage, KUKU_SCHEDULE.reviewIntervals.length - 1)];
      rec.stage += 1;
      rec.reviewDueAt = addDays(day, interval);
      if (!rec.masteredAt && rec.clearDays >= KUKU_SCHEDULE.masterySessions) rec.masteredAt = nowIso();
    }
    // すでに今日クリアずみの2回目（だん練習の2周目など）は復習予定を動かさない
    const dailyEntry = progress.daily[day] || { kukuNew: 0, kukuClears: 0, writtenSolved: 0, writtenClean: 0 };
    if (isFirstEver) dailyEntry.kukuNew += 1;
    if (wasClean) dailyEntry.kukuClears += 1;
    progress.daily[day] = dailyEntry;
  }
  saveProgress();
  bumpStats(wasClean, false);
  session.results.push({ label: `${fact.a}×${fact.b}`, clean: wasClean, kind: item.kind });

  const stars = wasClean ? 3 : (session.hintUsed ? 1 : 2);
  els.feedback.textContent = wasClean ? 'せいかい！すごい！' : 'できた！つぎも がんばろう！';
  els.feedback.className = 'feedback good';
  celebrate(wasClean ? 2 : 1);
  els.hintBtn.classList.add('hidden');
  els.nextBtn.classList.remove('hidden');
  els.nextBtn.dataset.stars = stars;
  els.nextBtn.textContent = session.qi + 1 < session.queue.length ? 'つぎへ →' : 'けっかを みる 🎉';
}

/* ---------- ひっ算セッション ---------- */
function startWrittenSession(levelId) {
  currentMode = levelId;
  const level = levelById(levelId);
  session = { queue: [], qi: 0, results: [], itemMisses: 0, board: null, activeStepIndex: 0, filledSteps: new Set() };
  for (let i = 0; i < level.problemsPerSession; i++) session.queue.push(generateProblem(levelId));
  showScreen('session');
  els.sessionTitle.textContent = level.label;
  els.backToModes.textContent = 'モードえらび';
  els.backToModes.classList.remove('hidden');
  renderWrittenItem();
}

function renderWrittenItem() {
  const problem = session.queue[session.qi];
  session.itemMisses = 0;
  session.activeStepIndex = 0;
  els.sessionProgress.textContent = `${session.qi + 1} / ${session.queue.length}`;
  els.feedback.textContent = '';
  els.feedback.className = 'feedback';
  els.nextBtn.classList.add('hidden');
  els.hintBtn.classList.add('hidden');

  const board = problem.kind === 'mult' ? buildMultiplyBoard(problem) : buildDivisionBoard(problem);
  session.board = board;
  els.workArea.innerHTML = '';
  const outer = document.createElement('div');
  outer.className = problem.kind === 'div' ? 'calc-outer div-outer' : 'calc-outer';
  const wrap = document.createElement('div');
  wrap.className = problem.kind === 'mult' ? 'calc-board mult-board' : 'calc-board div-board';
  const colWidth = 42;
  wrap.style.gridTemplateColumns = `repeat(${board.cols}, ${colWidth}px)`;
  wrap.style.gridTemplateRows = `repeat(${board.rows}, auto)`;

  // かけ算：計算行は「一の位=col0」で作られているので、右づめ表示のため
  // col を cols-col に変換する。わり算は「左からの位置」でcolを作っているので変換不要。
  const toGridColumn = problem.kind === 'mult'
    ? (col) => board.cols - col
    : (col) => col + 1;

  if (problem.kind === 'div') {
    const bracket = document.createElement('div');
    bracket.className = 'div-bracket';
    bracket.textContent = problem.divisor;
    outer.appendChild(bracket);
  }

  board.cells.forEach((cell) => {
    if (cell.kind === 'op') return;
    const cellEl = document.createElement('div');
    cellEl.style.gridColumn = String(toGridColumn(cell.col));
    cellEl.style.gridRow = String(cell.row + 1);
    cellEl.dataset.cellId = cell.id;
    if (cell.kind === 'given') {
      cellEl.className = 'calc-cell given';
      cellEl.textContent = cell.value;
    } else if (cell.kind === 'blank') {
      cellEl.className = 'calc-cell blank';
    } else if (cell.kind === 'carry-input') {
      cellEl.className = 'calc-cell carry-slot';
      cellEl.dataset.stepId = cell.stepId;
    } else if (cell.kind === 'bringdown') {
      cellEl.className = 'calc-cell bringdown-slot';
      cellEl.dataset.stepId = cell.stepId;
    } else {
      cellEl.className = 'calc-cell input-slot';
      cellEl.dataset.stepId = cell.stepId;
    }
    wrap.appendChild(cellEl);
  });

  const opCell = board.cells.find((c) => c.kind === 'op');
  if (opCell) {
    const opEl = document.createElement('div');
    opEl.className = 'calc-op-label';
    opEl.style.gridRow = String(opCell.row + 1);
    const rowGivenCols = board.cells
      .filter((c) => c.row === opCell.row && c.kind === 'given')
      .map((c) => toGridColumn(c.col));
    opEl.style.gridColumn = String(Math.min(...rowGivenCols));
    opEl.textContent = opCell.value;
    wrap.appendChild(opEl);
  }
  // 横線（board生成時に決めたruleRowsをそのまま描く）
  board.ruleRows.forEach((r) => addRuleLine(wrap, r, board.cols));

  outer.appendChild(wrap);
  els.workArea.appendChild(outer);
  renderPalette();
  focusActiveStep();
}
function addRuleLine(wrap, row, cols) {
  const rule = document.createElement('div');
  rule.className = 'calc-rule';
  rule.style.gridRow = String(row + 1);
  rule.style.gridColumn = `1 / span ${cols}`;
  wrap.appendChild(rule);
}

function renderPalette() {
  els.palette.innerHTML = '';
  const step = session.board.steps[session.activeStepIndex];
  if (!step) return;
  if (step.isBringDown) {
    els.palette.innerHTML = '<p class="palette-hint">上の数字を したの ますへ ドラッグ！</p>';
    return;
  }
  for (let v = 0; v <= 9; v++) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'digit-tile';
    tile.textContent = v;
    tile.addEventListener('pointerdown', (event) => startTileDrag(event, tile, v, checkWrittenDrop));
    els.palette.appendChild(tile);
  }
}

function activeStepCellEl() {
  const step = session.board.steps[session.activeStepIndex];
  if (!step) return null;
  return els.workArea.querySelector(`[data-step-id="${step.id}"]`);
}
function focusActiveStep() {
  els.workArea.querySelectorAll('.calc-cell.active').forEach((el) => el.classList.remove('active'));
  els.workArea.querySelectorAll('.calc-cell.drag-source').forEach((el) => {
    el.classList.remove('drag-source');
    el.onpointerdown = null;
  });
  const step = session.board.steps[session.activeStepIndex];
  if (!step) return;
  const cellEl = activeStepCellEl();
  if (cellEl) cellEl.classList.add('active');
  if (step.isBringDown) {
    const board = session.board;
    const sourceCell = board.cells.find((c) => c.kind === 'given' && c.sourceIndex === step.sourceIndex);
    if (sourceCell) {
      const el = els.workArea.querySelector(`[data-cell-id="${sourceCell.id}"]`);
      if (el) {
        el.classList.add('drag-source');
        el.onpointerdown = (event) => startTileDrag(event, el, step.expected, checkWrittenDrop, String(step.expected));
      }
    }
  }
  renderPalette();
}

function checkWrittenDrop(value, dropEl) {
  const step = session.board.steps[session.activeStepIndex];
  if (!step) return false;
  const cellEl = activeStepCellEl();
  if (!dropEl || dropEl !== cellEl) return false;
  if (Number(value) !== step.expected) {
    session.itemMisses++;
    shakeEl(cellEl);
    beep([180]); vibe([60, 50, 60]);
    els.feedback.textContent = 'ちがう ますに はいっちゃった。もういちど！';
    els.feedback.className = 'feedback bad';
    if (session.itemMisses >= 3) {
      els.hintBtn.classList.remove('hidden');
      els.feedback.textContent = `ヒント：こたえは ${step.expected} だよ！`;
    }
    return false;
  }
  cellEl.textContent = value;
  cellEl.classList.add('filled', 'correct-flash');
  setTimeout(() => cellEl.classList.remove('correct-flash'), 320);
  beep([740]); vibe(25);
  els.feedback.textContent = '';
  session.activeStepIndex++;
  if (session.activeStepIndex >= session.board.steps.length) {
    concludeWrittenItem();
  } else {
    focusActiveStep();
  }
  return true;
}

function concludeWrittenItem() {
  const level = levelById(currentMode);
  const day = todayKey();
  const wasClean = session.itemMisses === 0;
  const rec = progress.levels[currentMode];
  rec.solved += 1;
  if (wasClean) rec.clean += 1;
  rec.streak = wasClean ? rec.streak + 1 : 0;
  rec.bestStreak = Math.max(rec.bestStreak, rec.streak);
  rec.lastSessionDay = day;
  const dailyEntry = progress.daily[day] || { kukuNew: 0, kukuClears: 0, writtenSolved: 0, writtenClean: 0 };
  dailyEntry.writtenSolved += 1;
  if (wasClean) dailyEntry.writtenClean += 1;
  progress.daily[day] = dailyEntry;
  saveProgress();
  bumpStats(wasClean, false);

  const problem = session.queue[session.qi];
  const label = problem.kind === 'mult'
    ? `${problem.multiplicand}×${problem.multiplier}`
    : `${problem.dividend}÷${problem.divisor}`;
  session.results.push({ label, clean: wasClean, kind: level.kind });

  els.feedback.textContent = wasClean ? 'ぴったり できた！' : 'さいごまで できたね！';
  els.feedback.className = 'feedback good';
  celebrate(wasClean ? 2 : 1);
  els.hintBtn.classList.add('hidden');
  els.palette.innerHTML = '';
  els.nextBtn.classList.remove('hidden');
  els.nextBtn.textContent = session.qi + 1 < session.queue.length ? 'つぎへ →' : 'けっかを みる 🎉';
}

/* ---------- 共通：ドラッグ・タイル ---------- */
function startTileDrag(event, sourceEl, value, onDrop, ghostText) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  const ghost = document.createElement('div');
  ghost.className = 'digit-drag-ghost';
  ghost.textContent = ghostText !== undefined ? ghostText : String(value);
  ghost.style.left = `${event.clientX}px`;
  ghost.style.top = `${event.clientY}px`;
  document.body.appendChild(ghost);
  let lastDropTarget = null;

  const move = (moveEvent) => {
    ghost.style.left = `${moveEvent.clientX}px`;
    ghost.style.top = `${moveEvent.clientY}px`;
    const under = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
    const target = under && (under.closest('.kuku-slot, .calc-cell.active'));
    if (lastDropTarget && lastDropTarget !== target) lastDropTarget.classList.remove('drop-hover');
    if (target) target.classList.add('drop-hover');
    lastDropTarget = target;
  };
  const end = (endEvent) => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', end);
    ghost.remove();
    if (lastDropTarget) lastDropTarget.classList.remove('drop-hover');
    const under = document.elementFromPoint(endEvent.clientX, endEvent.clientY);
    const dropEl = under && (under.closest('.kuku-slot, .calc-cell.active'));
    onDrop(value, dropEl);
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', end, { once: true });
}

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function shakeEl(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

/* ---------- 効果音・演出（kanji-app.jsと同じ考え方） ---------- */
let audioCtx = null;
let soundOn = true;
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
const vibe = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
function celebrate(count) {
  const c = $('celebrate');
  const emo = ['⭐', '🎉', '✨', '💮', '🌟'];
  for (let i = 0; i < count * 5; i++) {
    const s = document.createElement('span');
    s.textContent = emo[Math.floor(Math.random() * emo.length)];
    s.style.left = (15 + Math.random() * 70) + '%';
    s.style.top = (35 + Math.random() * 35) + '%';
    s.style.animationDelay = (Math.random() * 0.25) + 's';
    c.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
}

/* ---------- セッション終了 ---------- */
function finishSession() {
  const day = todayKey();
  const flagKey = recordKey(`math4SessionDay:${currentMode}`);
  if (session.results.length > 0 && localStorage.getItem(flagKey) !== day) {
    localStorage.setItem(flagKey, day);
    bumpStats(null, true);
    saveProgress();
  }
  showScreen('result');
  const cleanCount = session.results.filter((r) => r.clean).length;
  els.resultTitle.textContent = session.results.length === 0 ? '✨ きょうのぶんは もう おわってるよ！' : '🎉 よくがんばりました！';
  els.btnResultModes.textContent = isKukuMode() ? '九九の トップへ' : 'モードえらび';
  els.resultSummary.innerHTML = `
    <div class="stat"><b>${session.results.length}</b><span>といた</span></div>
    <div class="stat"><b>${cleanCount}</b><span>ノーミス</span></div>
    <div class="stat"><b>${masteredFactCount()}</b><span>九九マスター/81</span></div>
  `;
  const list = $('result-list');
  list.innerHTML = '';
  session.results.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span>${r.label}</span><span class="st">${r.clean ? '⭐⭐⭐' : '⭐'}</span>`;
    list.appendChild(row);
  });
  updateHomeChrome();
}

function isKukuMode() {
  return currentMode === 'kuku' || currentMode === 'dan';
}
els.nextBtn.addEventListener('click', () => {
  session.qi += 1;
  if (session.qi < session.queue.length) {
    if (isKukuMode()) renderKukuItem(); else renderWrittenItem();
  } else {
    finishSession();
  }
});
els.hintBtn.addEventListener('click', () => {
  if (isKukuMode()) {
    $('kuku-array').classList.remove('hidden');
    session.hintUsed = true;
  }
});
els.backToModes.addEventListener('click', () => {
  if (isKukuMode()) { renderKukuHome(); return; }
  showScreen('mode');
  buildModeCards();
});
$('btn-result-modes').addEventListener('click', () => {
  if (isKukuMode()) { renderKukuHome(); return; }
  showScreen('mode');
  buildModeCards();
});
$('btn-result-again').addEventListener('click', () => {
  if (currentMode === 'dan') startDanSession(currentDan);
  else if (currentMode === 'kuku') startKukuSession();
  else startWrittenSession(currentMode);
});
$('sound-btn').addEventListener('click', (e) => {
  soundOn = !soundOn;
  e.currentTarget.textContent = soundOn ? '🔊' : '🔇';
});

/* ---------- らくがきメモ（手で描くスクラッチパッド、採点なし） ---------- */
(function setupScratchPad() {
  const canvas = els.scratchCanvas;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let last = null;
  let SIZE_W = 0, SIZE_H = 0;

  function fit() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    SIZE_W = rect.width; SIZE_H = rect.height;
    canvas.width = SIZE_W * dpr;
    canvas.height = SIZE_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2b3a67';
    ctx.lineWidth = 3;
  }
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    last = pos(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(p[0], p[1]);
    ctx.stroke();
    last = p;
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  els.scratchToggle.addEventListener('click', () => {
    els.scratchPanel.classList.toggle('hidden');
    if (!els.scratchPanel.classList.contains('hidden')) fit();
  });
  els.scratchClear.addEventListener('click', () => ctx.clearRect(0, 0, SIZE_W, SIZE_H));
  window.addEventListener('resize', () => { if (!els.scratchPanel.classList.contains('hidden')) fit(); });
})();

/* ---------- 起動 ---------- */
initCloud();
buildModeCards();
showScreen('mode');

if (DEBUG_DATE) {
  window.__MATH4_TEST__ = {
    todayKey,
    composeKukuSession,
    buildMultiplyBoard,
    buildDivisionBoard,
    getProgress: () => progress,
    isLevelUnlocked,
    getSession: () => session,
    getActiveStep: () => session && session.board && session.board.steps[session.activeStepIndex],
    DAN_ORDER,
    danSummary,
    recommendedDan,
    factState,
    startDanSession
  };
}
})();
