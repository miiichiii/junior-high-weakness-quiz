/* =====================================================================
   夏休み 算数マスター（小4）の「画面に依存しない」部分
   - 出題表（ひきざん117問・九九81問）と、ひっ算の盤面づくり
   - 記録の形、採点と復習スケジュール、端末どうしのマージ
   DOM・localStorage には触らない。ブラウザでは window.Math4Core として
   math4-app.js が使い、scripts/validate-math4.js が vm の中で検証する。
   app.js の mergeMath4Progress は mergeProgress と同じ結果を返すこと
   （validate-math4.js で突き合わせている）。
   ===================================================================== */
(function (root) {
'use strict';

/* ---------- 日付（端末の暦日。YYYY-MM-DD） ---------- */
function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function addDays(key, days) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

function randInt(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
function shuffle(arr, rng = Math.random) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* =====================================================================
   問題集（drill）: 段階 → グループ → 問題 の3層。
   九九もひきざんも同じ形にして、出題・採点・復習を1つのエンジンで扱う。
   ===================================================================== */
function makeDrill(def) {
  const groups = [];
  const facts = [];
  def.stages.forEach((stage) => {
    stage.groups.forEach((group) => {
      const g = { ...group, stageId: stage.id, kind: stage.kind };
      groups.push(g);
      def.factsForGroup(g).forEach((f) => {
        facts.push({ ...f, kind: stage.kind, groupId: g.id, order: facts.length });
      });
    });
  });
  return {
    id: def.id,
    store: def.store,
    title: def.title,
    schedule: def.schedule,
    dailyKeys: def.dailyKeys,
    stages: def.stages,
    groups,
    facts
  };
}

/* ---------- ひきざん（117問） ---------- */
// ①10まで45問 → ②10をこえるくり下がりなし36問 → ③くり下がり36問。
// ③だけを先にやっても身につかないので、学校の順どおり①から積み上げる。
// kind: basic=10まで（こたえ1けた） / noborrow=ばらから引く（こたえ2けた） / borrow=10のかたまりをくずす
const SUB = makeDrill({
  id: 'sub',
  store: 'subFacts',
  title: 'ひきざん',
  schedule: { newPerDay: 8, maxReviewsPerSession: 12, reviewIntervals: [1, 3, 7, 14], masterySessions: 2 },
  dailyKeys: { newKey: 'subNew', clearKey: 'subClears' },
  stages: [
    {
      id: 'basic', kind: 'basic', label: '① 10までの ひきざん', note: 'ぜんぶの もとになる ひきざん',
      groups: [
        { id: 'basic5', label: '2〜5から', minuends: [2, 3, 4, 5] },
        { id: 'basic6', label: '6から', minuends: [6] },
        { id: 'basic7', label: '7から', minuends: [7] },
        { id: 'basic8', label: '8から', minuends: [8] },
        { id: 'basic9', label: '9から', minuends: [9] },
        { id: 'basic10', label: '10から', minuends: [10] }
      ]
    },
    {
      id: 'noborrow', kind: 'noborrow', label: '② 10より 大きい かず', note: '10の かたまりは そのまま。ばらから ひく',
      groups: [
        { id: 'nb14', label: '11〜14から', minuends: [11, 12, 13, 14] },
        { id: 'nb16', label: '15・16から', minuends: [15, 16] },
        { id: 'nb17', label: '17から', minuends: [17] },
        { id: 'nb18', label: '18から', minuends: [18] }
      ]
    },
    {
      id: 'borrow', kind: 'borrow', label: '③ くり下がりの ひきざん', note: '10の かたまりを くずして ひく',
      groups: [
        { id: 'sub9', label: 'ひく9', subtrahends: [9] },
        { id: 'sub8', label: 'ひく8', subtrahends: [8] },
        { id: 'sub7', label: 'ひく7', subtrahends: [7] },
        { id: 'sub6', label: 'ひく6', subtrahends: [6] },
        { id: 'sub5', label: 'ひく5', subtrahends: [5] },
        { id: 'sub432', label: 'ひく4・3・2', subtrahends: [4, 3, 2] }
      ]
    }
  ],
  factsForGroup(g) {
    const out = [];
    const add = (m, b) => out.push({ id: `${m}-${b}`, m, b, answer: m - b });
    if (g.kind === 'borrow') {
      // 一の位より引く数が大きい = くり下がりが必要
      g.subtrahends.forEach((b) => { for (let m = 11; m <= b + 9; m++) add(m, b); });
    } else {
      // basic: 1〜m-1 を引く / noborrow: ばら（m-10）の分だけ引ける
      g.minuends.forEach((m) => {
        const maxB = g.kind === 'basic' ? m - 1 : m - 10;
        for (let b = 1; b <= maxB; b++) add(m, b);
      });
    }
    return out;
  }
});

/* ---------- 九九（81問） ---------- */
// 学校でならう定番の順（やさしい段から）。1の段は最後にかるく確認する
const DAN_ORDER = [2, 5, 3, 4, 6, 7, 8, 9, 1];
const KUKU = makeDrill({
  id: 'kuku',
  store: 'facts',
  title: '九九',
  schedule: { newPerDay: 9, maxReviewsPerSession: 14, reviewIntervals: [1, 3, 7, 14], masterySessions: 2 },
  dailyKeys: { newKey: 'kukuNew', clearKey: 'kukuClears' },
  stages: [
    { id: 'kuku', kind: 'kuku', label: '', note: '', groups: DAN_ORDER.map((dan) => ({ id: `dan${dan}`, label: `${dan}のだん`, dan })) }
  ],
  factsForGroup(g) {
    const out = [];
    for (let b = 1; b <= 9; b++) out.push({ id: `${g.dan}x${b}`, a: g.dan, b, answer: g.dan * b });
    return out;
  }
});

const DRILLS = { sub: SUB, kuku: KUKU };

/* ---------- 九九の選択肢（まちがえやすい近い数をまぜる） ---------- */
function kukuChoices(fact, rng = Math.random) {
  const correct = fact.answer;
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
  while (picked.length < 3 && pool.length) picked.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  while (picked.length < 3) {
    const v = randInt(rng, 1, 81);
    if (v !== correct && !picked.includes(v)) picked.push(v);
  }
  return shuffle([correct, ...picked], rng);
}

/* =====================================================================
   ひっ算
   ===================================================================== */
const LEVELS = [
  { id: 'mult1', kind: 'mult', label: '3けた × 1けた', problemsPerSession: 5 },
  { id: 'mult2', kind: 'mult', label: '3けた × 2けた', problemsPerSession: 4, requires: 'mult1' },
  { id: 'div1', kind: 'div', label: '3けた ÷ 1けた', problemsPerSession: 5 }
];
function levelById(id) { return LEVELS.find((l) => l.id === id) || null; }

function generateProblem(levelId, rng = Math.random) {
  if (levelId === 'mult1') {
    return { kind: 'mult', multiplicand: randInt(rng, 102, 989), multiplier: randInt(rng, 2, 9), twoDigit: false };
  }
  if (levelId === 'mult2') {
    return { kind: 'mult', multiplicand: randInt(rng, 102, 897), multiplier: randInt(rng, 12, 89), twoDigit: true };
  }
  // わり算: 割り切れる問題とあまりが出る問題を半々に。割られる数は必ず3桁
  const divisor = randInt(rng, 2, 9);
  if (rng() < 0.5) {
    const quotient = randInt(rng, Math.ceil(100 / divisor), Math.floor(999 / divisor));
    return { kind: 'div', dividend: quotient * divisor, divisor };
  }
  return { kind: 'div', dividend: randInt(rng, 100, 999), divisor };
}

/* ---------- くり上がり・くり下がりの手順を列にする ---------- */
// かけ算の各行・たし算の答え行は、どれも同じ「桁ごとの処理」で作れる
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
  const steps = [];
  let carryIn = 0;
  let col = 0;
  while (col <= maxCol || carryIn > 0) {
    const value = (col <= maxCol ? contributionFn(col) : 0) + carryIn;
    const carryOut = Math.floor(value / 10);
    digits[col] = value % 10;
    steps.push({ kind: 'digit', col, value: value % 10 });
    if (carryOut > 0) steps.push({ kind: 'carry', col: col + 1, value: carryOut });
    carryIn = carryOut;
    col++;
  }
  return { digits, steps, width: col };
}
function buildMultiplyRow(multiplicandLSF, multiplierDigit) {
  return buildColumnSteps((col) => (multiplicandLSF[col] || 0) * multiplierDigit, multiplicandLSF.length - 1);
}
function buildSumRow(rowsWithShift, maxCol) {
  return buildColumnSteps((col) => rowsWithShift.reduce((sum, { digits, shift }) => {
    const idx = col - shift;
    return idx >= 0 && digits[idx] !== undefined ? sum + digits[idx] : sum;
  }, 0), maxCol);
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
    quotientDigits.push(q);
    const product = q * divisor;
    steps.push({ dividendIndex: i, chunk, q, product, remainder: chunk - product, chunkWidth: remainderBefore > 0 ? 2 : 1 });
    remainder = chunk - product;
  }
  return { quotientDigits, steps, remainder };
}

/* ---------- 盤面モデル（マス + 入れる順番） ---------- */
let uidCounter = 0;
function uid() { return `c${uidCounter++}`; }

function pushRowSteps(cells, ordered, rowSteps, row, prefix, colOffset) {
  rowSteps.forEach((s) => {
    const col = s.col + (colOffset || 0);
    const isCarry = s.kind === 'carry';
    const stepId = `${prefix}-${isCarry ? 'carry' : 'digit'}-${col}`;
    cells.push({ id: uid(), row: isCarry ? row.carry : row.digit, col, kind: isCarry ? 'carry-input' : 'input', value: s.value, stepId });
    ordered.push({ id: stepId, expected: s.value });
  });
}

// かけ算: col は一の位=0からの「位」。描画側で cols-col に変換して右づめにする
function buildMultiplyBoard(problem) {
  const multiplicandLSF = digitsLSF(problem.multiplicand, 3);
  const cells = [];
  const ordered = [];
  const ruleRows = [];
  const addGivenRow = (row, text, opPrefix) => {
    const s = String(text);
    for (let i = 0; i < s.length; i++) cells.push({ id: uid(), row, col: s.length - 1 - i, kind: 'given', value: Number(s[i]) });
    if (opPrefix) cells.push({ id: uid(), row, col: -1, kind: 'op', value: opPrefix });
  };
  addGivenRow(0, problem.multiplicand);

  if (!problem.twoDigit) {
    addGivenRow(1, problem.multiplier, '×');
    ruleRows.push(2);
    const product = buildMultiplyRow(multiplicandLSF, problem.multiplier);
    pushRowSteps(cells, ordered, product.steps, { carry: 3, digit: 4 }, 'p');
    return { cols: Math.max(product.width, 3), rows: 5, cells, steps: ordered, ruleRows, resultLabel: numberFromLSF(product.digits) };
  }

  // 2けたのかけ算: 部分積2行 + 合計行
  addGivenRow(1, String(problem.multiplier).padStart(2, '0'), '×');
  ruleRows.push(2);
  const p1 = buildMultiplyRow(multiplicandLSF, problem.multiplier % 10);
  const p2 = buildMultiplyRow(multiplicandLSF, Math.floor(problem.multiplier / 10));
  pushRowSteps(cells, ordered, p1.steps, { carry: 3, digit: 4 }, 'p1', 0);
  pushRowSteps(cells, ordered, p2.steps, { carry: 5, digit: 6 }, 'p2', 1);
  // 十の位の積は一の位が空欄（書かない習慣を示す）
  cells.push({ id: uid(), row: 6, col: 0, kind: 'blank', value: null });
  ruleRows.push(7);
  const sum = buildSumRow([{ digits: p1.digits, shift: 0 }, { digits: p2.digits, shift: 1 }], Math.max(p1.width - 1, p2.width));
  pushRowSteps(cells, ordered, sum.steps, { carry: 8, digit: 9 }, 'sum');
  return { cols: Math.max(3, sum.width, p2.width + 1), rows: 10, cells, steps: ordered, ruleRows, resultLabel: numberFromLSF(sum.digits) };
}

// わり算: col は被除数の左からの位置。描画側で除数の列ぶん右にずらす。
// 手順は実際の筆算と同じ「商を1つ立てる→かける→ひく→つぎの位をおろす」のくり返し
// （商をぜんぶ先に入れさせない。それでは答えが分かっていないと先に進めない）
function buildDivisionBoard(problem) {
  const digitsMSF = String(problem.dividend).split('').map(Number);
  const plan = longDivisionSteps(digitsMSF, problem.divisor);
  const cells = [];
  const steps = [];
  const cols = digitsMSF.length;
  digitsMSF.forEach((d, i) => cells.push({ id: uid(), row: 1, col: i, kind: 'given', value: d, sourceIndex: i }));
  // 被除数の上の横線は被除数の幅いっぱい。引き算の線はその計算に使った桁の幅だけ
  const ruleRows = [{ row: 1, fromCol: 0, toCol: cols - 1 }];

  let row = 2;
  plan.steps.forEach((s, idx) => {
    const quotStepId = `quot-${s.dividendIndex}`;
    cells.push({ id: uid(), row: 0, col: s.dividendIndex, kind: 'input', value: s.q, stepId: quotStepId });
    steps.push({ id: quotStepId, expected: s.q });

    const productDigits = digitsLSF(s.product, s.chunkWidth);
    const startCol = s.dividendIndex - (s.chunkWidth - 1);
    for (let c = 0; c < s.chunkWidth; c++) {
      const col = startCol + c;
      const digit = productDigits[s.chunkWidth - 1 - c];
      const stepId = `prod-${s.dividendIndex}-${col}`;
      cells.push({ id: uid(), row, col, kind: 'input', value: digit, stepId });
      steps.push({ id: stepId, expected: digit });
    }
    ruleRows.push({ row: row + 1, fromCol: startCol, toCol: s.dividendIndex });
    const remRow = row + 2;
    const remStepId = `rem-${s.dividendIndex}`;
    cells.push({ id: uid(), row: remRow, col: s.dividendIndex, kind: 'input', value: s.remainder, stepId: remStepId });
    steps.push({ id: remStepId, expected: s.remainder });
    if (idx < plan.steps.length - 1) {
      const nextIndex = plan.steps[idx + 1].dividendIndex;
      const bringStepId = `bring-${nextIndex}`;
      cells.push({ id: uid(), row: remRow, col: nextIndex, kind: 'bringdown', value: digitsMSF[nextIndex], stepId: bringStepId, sourceIndex: nextIndex });
      steps.push({ id: bringStepId, expected: digitsMSF[nextIndex], isBringDown: true, sourceIndex: nextIndex });
    }
    row = remRow + 1;
  });

  return {
    cols, rows: row, cells, steps, ruleRows,
    quotient: Number(plan.quotientDigits.filter((d) => d !== null).join('')),
    remainder: plan.remainder
  };
}

/* =====================================================================
   記録（localStorage weaknessQuiz:<child>:math4Progress と Firestore の math4）
   version:1。subFacts と fact の lastPracticedDay は後から足したフィールド。
   追加するだけのフィールドは version を上げずに migrateProgress で既定値を入れる
   （上げると古い記録が初期化されてしまう）。
   ===================================================================== */
function emptyLevelRecord() {
  return { solved: 0, clean: 0, streak: 0, bestStreak: 0, sessionsDone: 0, lastSessionDay: '' };
}
function emptyProgress() {
  const levels = {};
  LEVELS.forEach((level) => { levels[level.id] = emptyLevelRecord(); });
  return { version: 1, facts: {}, subFacts: {}, levels, daily: {}, updatedAt: '' };
}
function migrateProgress(raw) {
  if (!raw || typeof raw !== 'object' || raw.version !== 1) return emptyProgress();
  if (!raw.facts || typeof raw.facts !== 'object') raw.facts = {};
  if (!raw.subFacts || typeof raw.subFacts !== 'object') raw.subFacts = {};
  if (!raw.daily || typeof raw.daily !== 'object') raw.daily = {};
  if (!raw.levels || typeof raw.levels !== 'object') raw.levels = {};
  LEVELS.forEach((level) => { if (!raw.levels[level.id]) raw.levels[level.id] = emptyLevelRecord(); });
  return raw;
}
function emptyDaily() {
  return { kukuNew: 0, kukuClears: 0, subNew: 0, subClears: 0, writtenSolved: 0, writtenClean: 0 };
}
function newFactRecord() {
  return {
    attempts: 0, correct: 0, misses: 0, clearDays: 0, lastClearDay: '', stage: 0,
    reviewDueAt: '', masteredAt: '', firstSeenAt: '', lastSeenAt: '', lastPracticedDay: ''
  };
}

/* ---------- 端末どうしのマージ（回数は大きい方、予定は新しく見た方） ---------- */
function mergeFactMaps(mapA, mapB) {
  const out = {};
  new Set([...Object.keys(mapA), ...Object.keys(mapB)]).forEach((id) => {
    const ra = mapA[id];
    const rb = mapB[id];
    if (!ra || !rb) { out[id] = { ...(ra || rb) }; return; }
    const newer = (rb.lastSeenAt || '') > (ra.lastSeenAt || '') ? rb : ra;
    out[id] = {
      attempts: Math.max(ra.attempts || 0, rb.attempts || 0),
      correct: Math.max(ra.correct || 0, rb.correct || 0),
      misses: Math.max(ra.misses || 0, rb.misses || 0),
      clearDays: newer.clearDays || 0,
      lastClearDay: newer.lastClearDay || '',
      stage: newer.stage || 0,
      reviewDueAt: newer.reviewDueAt || '',
      masteredAt: newer.masteredAt || '',
      firstSeenAt: [ra.firstSeenAt, rb.firstSeenAt].filter(Boolean).sort()[0] || '',
      lastSeenAt: (rb.lastSeenAt || '') > (ra.lastSeenAt || '') ? rb.lastSeenAt : (ra.lastSeenAt || ''),
      lastPracticedDay: [ra.lastPracticedDay, rb.lastPracticedDay].filter(Boolean).sort().slice(-1)[0] || ''
    };
  });
  return out;
}
function mergeProgress(local, remote) {
  const a = migrateProgress(local);
  const b = migrateProgress(remote);
  const out = emptyProgress();
  out.facts = mergeFactMaps(a.facts, b.facts);
  out.subFacts = mergeFactMaps(a.subFacts, b.subFacts);
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
  new Set([...Object.keys(a.daily), ...Object.keys(b.daily)]).forEach((day) => {
    const da = a.daily[day] || {};
    const db = b.daily[day] || {};
    out.daily[day] = {};
    Object.keys(emptyDaily()).forEach((key) => { out.daily[day][key] = Math.max(da[key] || 0, db[key] || 0); });
  });
  out.updatedAt = (b.updatedAt || '') > (a.updatedAt || '') ? b.updatedAt : (a.updatedAt || '');
  return out;
}

/* =====================================================================
   問題集のエンジン（九九・ひきざん共通）
   ===================================================================== */
// none=まだ / learn=れんしゅう中 / clear=ノーミスでクリアずみ / master=別の日に2回クリア
function recordState(rec) {
  if (!rec) return 'none';
  if (rec.masteredAt) return 'master';
  if ((rec.clearDays || 0) >= 1) return 'clear';
  return 'learn';
}
function storeOf(drill, progress) { return progress[drill.store] || {}; }
function groupById(drill, groupId) { return drill.groups.find((g) => g.id === groupId) || null; }
function factsOfGroup(drill, groupId) { return drill.facts.filter((f) => f.groupId === groupId); }

function summarizeFacts(store, facts) {
  let mastered = 0;
  let cleared = 0;
  let touched = 0;
  facts.forEach((f) => {
    const st = recordState(store[f.id]);
    if (st !== 'none') touched += 1;
    if (st === 'master') { mastered += 1; cleared += 1; } else if (st === 'clear') cleared += 1;
  });
  return { mastered, cleared, touched, total: facts.length };
}
function groupSummary(drill, progress, groupId) {
  return summarizeFacts(storeOf(drill, progress), factsOfGroup(drill, groupId));
}
function drillSummary(drill, progress) {
  return summarizeFacts(storeOf(drill, progress), drill.facts);
}
// つぎにやるグループ: まだクリアしていない最初のグループ → 全部クリアならマスター待ちの最初
function recommendedGroup(drill, progress) {
  const pick = (test) => drill.groups.find((g) => test(groupSummary(drill, progress, g.id)));
  const g = pick((s) => s.cleared < s.total) || pick((s) => s.mastered < s.total);
  return g ? g.id : null;
}

function isDue(rec, day) {
  return Boolean(rec && rec.reviewDueAt && rec.reviewDueAt <= day && rec.lastClearDay !== day);
}
// 最後に練習した日。lastPracticedDay がない古い記録はクリア日・初日で代用する
function practicedDay(rec) {
  return (rec && (rec.lastPracticedDay || rec.lastClearDay || rec.firstSeenAt)) || '';
}
function dueCount(drill, progress, day) {
  const store = storeOf(drill, progress);
  return drill.facts.filter((f) => isDue(store[f.id], day)).length;
}

// きょうのミックス: 期限の来た復習 + 新しい問題（1日1グループまで）
function composeMix(drill, progress, day) {
  const store = storeOf(drill, progress);
  const sched = drill.schedule;
  const due = drill.facts.filter((f) => isDue(store[f.id], day)).sort((x, y) => {
    const rx = store[x.id];
    const ry = store[y.id];
    if (rx.reviewDueAt !== ry.reviewDueAt) return rx.reviewDueAt < ry.reviewDueAt ? -1 : 1;
    // 同じ期限どうしは「いちばん長く練習していない問題」を先に（kanji-app.js と同じ）。
    // まちがい回数のような変わりにくい値で並べると、上限からあふれた問題が
    // 毎日あふれ続けて出題されなくなる。
    const lx = rx.lastSeenAt || '';
    const ly = ry.lastSeenAt || '';
    if (lx !== ly) return lx < ly ? -1 : 1;
    return x.order - y.order;
  });
  // 前日に練習した問題がいちばん忘れやすいので必ず全部出す。これを保証しないと
  // 期限の古い問題が上限の枠を先に埋め、前日の問題が毎日押し出される（kanji-app.js と同じ）
  const yesterday = addDays(day, -1);
  const fresh = due.filter((f) => practicedDay(store[f.id]) === yesterday);
  const rest = due.filter((f) => practicedDay(store[f.id]) !== yesterday);
  const reviews = [...fresh, ...rest].slice(0, Math.max(sched.maxReviewsPerSession, fresh.length));

  const introducedToday = drill.facts.filter((f) => (store[f.id] || {}).firstSeenAt === day).length;
  const newCount = Math.max(0, sched.newPerDay - introducedToday);
  const newPool = drill.facts.filter((f) => !store[f.id]);
  const focusGroup = newPool.length ? newPool[0].groupId : null;
  const newOnes = newPool.filter((f) => f.groupId === focusGroup).slice(0, newCount);

  const queue = [
    ...reviews.map((fact) => ({ fact, kind: 'review', pass: 'quick' })),
    ...newOnes.map((fact) => ({ fact, kind: 'new', pass: 'guided' }))
  ];
  if (queue.length > 0) return queue;
  // 今日のぶんが尽きたら、まだマスターしていない問題をおかわり（記録の予定は動かさない）
  return drill.facts.filter((f) => !(store[f.id] || {}).masteredAt).slice(0, 8)
    .map((fact) => ({ fact, kind: 'bonus', pass: 'quick' }));
}

// グループれんしゅう: ①図つきで順番に → ②図なしでばらばらに
function composeGroupSession(drill, groupId, rng = Math.random) {
  const facts = factsOfGroup(drill, groupId);
  return [
    ...facts.map((fact) => ({ fact, kind: 'group', pass: 'guided' })),
    ...shuffle(facts, rng).map((fact) => ({ fact, kind: 'group', pass: 'quick' }))
  ];
}

// 1問の結果を記録する。マスター = 別の日に2回ノーミス。まちがえるとやり直し。
// 同じ日に2回クリアしても、復習の予定は1日1回ぶんしか進めない。
function applyFactResult(drill, progress, factId, opts) {
  const { misses, scheduled, day, now } = opts;
  const store = progress[drill.store];
  const isFirstEver = !store[factId];
  if (isFirstEver) store[factId] = newFactRecord();
  const rec = store[factId];
  const clean = misses === 0;
  if (!rec.firstSeenAt) rec.firstSeenAt = day;
  rec.attempts = (rec.attempts || 0) + 1;
  rec.misses = (rec.misses || 0) + misses;
  rec.lastSeenAt = now;
  rec.lastPracticedDay = day;
  if (clean) rec.correct = (rec.correct || 0) + 1;

  let masteredNow = false;
  if (scheduled) {
    const sched = drill.schedule;
    if (!clean) {
      rec.clearDays = 0;
      rec.stage = 0;
      rec.masteredAt = '';
      rec.reviewDueAt = addDays(day, 1);
    } else if (rec.lastClearDay !== day) {
      rec.clearDays = (rec.clearDays || 0) + 1;
      rec.lastClearDay = day;
      rec.reviewDueAt = addDays(day, sched.reviewIntervals[Math.min(rec.stage || 0, sched.reviewIntervals.length - 1)]);
      rec.stage = (rec.stage || 0) + 1;
      if (!rec.masteredAt && rec.clearDays >= sched.masterySessions) {
        rec.masteredAt = now;
        masteredNow = true;
      }
    }
    const daily = progress.daily[day] || emptyDaily();
    if (isFirstEver) daily[drill.dailyKeys.newKey] = (daily[drill.dailyKeys.newKey] || 0) + 1;
    if (clean) daily[drill.dailyKeys.clearKey] = (daily[drill.dailyKeys.clearKey] || 0) + 1;
    progress.daily[day] = daily;
  }
  return { clean, isFirstEver, masteredNow };
}

/* ---------- ひっ算の記録 ---------- */
function isLevelUnlocked(progress, levelId) {
  const level = levelById(levelId);
  if (!level || !level.requires) return true;
  const req = progress.levels[level.requires];
  return Boolean(req && req.solved >= 8 && req.clean / req.solved >= 0.6);
}
function applyWrittenResult(progress, levelId, { misses, day }) {
  const clean = misses === 0;
  const rec = progress.levels[levelId];
  rec.solved += 1;
  if (clean) rec.clean += 1;
  rec.streak = clean ? rec.streak + 1 : 0;
  rec.bestStreak = Math.max(rec.bestStreak, rec.streak);
  rec.lastSessionDay = day;
  const daily = progress.daily[day] || emptyDaily();
  daily.writtenSolved = (daily.writtenSolved || 0) + 1;
  if (clean) daily.writtenClean = (daily.writtenClean || 0) + 1;
  progress.daily[day] = daily;
  return { clean };
}

/* ---------- 集めたスター = ノーミスで解けた回数（記録から数えるので保存形式は変えない） ---------- */
function starCount(progress) {
  const sum = (map) => Object.values(map || {}).reduce((acc, rec) => acc + (Number(rec && rec.correct) || 0), 0);
  const written = Object.values(progress.levels || {}).reduce((acc, rec) => acc + (Number(rec && rec.clean) || 0), 0);
  return sum(progress.facts) + sum(progress.subFacts) + written;
}

root.Math4Core = {
  dayKey, addDays, shuffle,
  DRILLS, LEVELS, levelById,
  kukuChoices, generateProblem,
  digitsLSF, numberFromLSF, buildColumnSteps, buildMultiplyRow, buildSumRow,
  longDivisionSteps, buildMultiplyBoard, buildDivisionBoard,
  emptyProgress, migrateProgress, mergeFactMaps, mergeProgress, newFactRecord,
  recordState, groupById, factsOfGroup, groupSummary, drillSummary, recommendedGroup,
  isDue, practicedDay, dueCount, composeMix, composeGroupSession, applyFactResult,
  isLevelUnlocked, applyWrittenResult, starCount
};
})(typeof window !== 'undefined' ? window : globalThis);
