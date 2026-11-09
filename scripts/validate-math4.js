// 夏休み 算数マスター（math4-core.js）の検証。
// 出題表・ひっ算の盤面・復習スケジュール・端末間マージを総当たりで確かめ、
// app.js の mergeMath4Progress が math4-core.js の mergeProgress と同じ結果を返すことも突き合わせる。
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "math4-core.js"), "utf8"), context, { filename: "math4-core.js" });
const C = context.window.Math4Core;

const errors = [];
function check(cond, message) {
  if (!cond) errors.push(message);
}
const clone = (v) => JSON.parse(JSON.stringify(v));
// キーの並び順に左右されない比較用の文字列
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x)
  ? Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x));
function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

check(C, "window.Math4Core が登録されていない");

/* ---------- 出題表 ---------- */
const { sub: SUB, kuku: KUKU } = C.DRILLS;
check(SUB.facts.length === 117, `ひきざんが117問でない: ${SUB.facts.length}`);
check(KUKU.facts.length === 81, `九九が81問でない: ${KUKU.facts.length}`);
check(SUB.groups.length === 16, `ひきざんのグループが16でない: ${SUB.groups.length}`);
check(KUKU.groups.length === 9, `九九のグループが9でない: ${KUKU.groups.length}`);
check(KUKU.groups.map((g) => g.dan).join(",") === "2,5,3,4,6,7,8,9,1", "九九の段の順がちがう");

[SUB, KUKU].forEach((drill) => {
  const ids = new Set();
  drill.facts.forEach((f, i) => {
    check(!ids.has(f.id), `${drill.id}: id 重複 ${f.id}`);
    ids.add(f.id);
    check(f.order === i, `${drill.id}: order が通し番号でない ${f.id}`);
    check(C.groupById(drill, f.groupId), `${drill.id}: 存在しないグループ ${f.groupId}`);
  });
  drill.groups.forEach((g) => check(C.factsOfGroup(drill, g.id).length > 0, `${drill.id}: 空のグループ ${g.id}`));
});

const stageCounts = {};
SUB.facts.forEach((f) => {
  stageCounts[f.kind] = (stageCounts[f.kind] || 0) + 1;
  check(f.answer === f.m - f.b && f.answer >= 1, `ひきざんの答えが不正 ${f.id}`);
  if (f.kind === "basic") check(f.m <= 10 && f.answer <= 9, `①の範囲外 ${f.id}`);
  if (f.kind === "noborrow") check(f.m > 10 && f.b <= f.m - 10, `②はくり下がりなしのはず ${f.id}`);
  if (f.kind === "borrow") check(f.m > 10 && f.b > f.m - 10 && f.answer <= 9, `③はくり下がりありのはず ${f.id}`);
});
check(stageCounts.basic === 45 && stageCounts.noborrow === 36 && stageCounts.borrow === 36,
  `ステージごとの問題数が 45/36/36 でない: ${JSON.stringify(stageCounts)}`);
check(SUB.facts[0].kind === "basic" && SUB.facts[SUB.facts.length - 1].kind === "borrow", "ひきざんは①から③の順に並ぶこと");
["11-8", "12-7", "13-9"].forEach((id) => check(SUB.facts.some((f) => f.id === id), `苦手な ${id} が入っていない`));

for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    const f = KUKU.facts.find((x) => x.id === `${a}x${b}`);
    check(f && f.answer === a * b, `九九 ${a}x${b} が不正`);
    if (f) {
      const choices = C.kukuChoices(f, seededRng(a * 10 + b));
      check(choices.length === 4 && new Set(choices).size === 4 && choices.includes(f.answer),
        `九九 ${a}x${b} の選択肢が不正 ${choices}`);
    }
  }
}

/* ---------- ひっ算の盤面（総当たり） ---------- */
function replayBoard(board) {
  // 入力手順の stepId がすべてマスに対応し、マスの値と期待値が一致すること
  const byStep = new Map();
  board.cells.forEach((c) => { if (c.stepId) byStep.set(c.stepId, c); });
  return board.steps.every((s) => byStep.has(s.id) && byStep.get(s.id).value === s.expected)
    && byStep.size === board.steps.length;
}
function rowNumber(board, row) {
  const digits = board.cells.filter((c) => c.row === row && (c.kind === "input" || c.kind === "given"));
  return C.numberFromLSF(digits.reduce((arr, c) => { arr[c.col] = c.value; return arr; }, []));
}

for (let m = 100; m <= 999; m++) {
  for (let d = 2; d <= 9; d++) {
    const board = C.buildMultiplyBoard({ kind: "mult", multiplicand: m, multiplier: d, twoDigit: false });
    if (board.resultLabel !== m * d || !replayBoard(board) || rowNumber(board, 4) !== m * d) {
      check(false, `かけ算 ${m}×${d} の盤面が不正`);
    }
  }
}
for (let m = 102; m <= 897; m += 7) {
  for (let d = 12; d <= 89; d++) {
    const board = C.buildMultiplyBoard({ kind: "mult", multiplicand: m, multiplier: d, twoDigit: true });
    if (board.resultLabel !== m * d || !replayBoard(board) || rowNumber(board, 9) !== m * d
      || rowNumber(board, 4) !== m * (d % 10)) {
      check(false, `かけ算 ${m}×${d} の盤面が不正`);
    }
    check(board.ruleRows.join(",") === "2,7", `かけ算 ${m}×${d} の横線の位置がちがう`);
  }
}

for (let n = 100; n <= 999; n++) {
  for (let d = 2; d <= 9; d++) {
    const board = C.buildDivisionBoard({ kind: "div", dividend: n, divisor: d });
    const ok = board.quotient === Math.floor(n / d) && board.remainder === n % d && replayBoard(board);
    if (!ok) { check(false, `わり算 ${n}÷${d} の盤面が不正`); continue; }
    // 手順は「商→かけた数→ひいた数→おろす」のくり返し。商を先にまとめて入れさせない
    const kinds = board.steps.map((s) => s.id.split("-")[0]);
    let state = "quot";
    let valid = kinds[0] === "quot";
    for (let i = 1; i < kinds.length && valid; i++) {
      const k = kinds[i];
      if (state === "quot") valid = k === "prod";
      else if (state === "prod") valid = k === "prod" || k === "rem";
      else if (state === "rem") valid = k === "bring";
      else if (state === "bring") valid = k === "quot";
      state = k;
    }
    if (!valid || state !== "rem") check(false, `わり算 ${n}÷${d} の手順の順番がちがう: ${kinds.join(",")}`);
    const top = board.ruleRows[0];
    if (!(top.row === 1 && top.fromCol === 0 && top.toCol === board.cols - 1)) check(false, `わり算 ${n}÷${d} の上の横線が被除数の幅でない`);
  }
}

/* ---------- 記録と復習スケジュール ---------- */
const NOW = (day, h = 10) => `${day}T${String(h).padStart(2, "0")}:00:00.000Z`;
{
  const p = C.emptyProgress();
  const fact = SUB.facts[0].id;
  C.applyFactResult(SUB, p, fact, { misses: 0, scheduled: true, day: "2026-11-01", now: NOW("2026-11-01") });
  C.applyFactResult(SUB, p, fact, { misses: 0, scheduled: true, day: "2026-11-01", now: NOW("2026-11-01", 11) });
  const rec = p.subFacts[fact];
  check(rec.clearDays === 1 && rec.stage === 1 && rec.reviewDueAt === "2026-11-02", `同じ日の2回クリアは1日ぶん: ${JSON.stringify(rec)}`);
  check(!rec.masteredAt, "1日目でマスターになってはいけない");
  check(p.daily["2026-11-01"].subNew === 1 && p.daily["2026-11-01"].subClears === 2, "日別の集計がちがう");
  const r2 = C.applyFactResult(SUB, p, fact, { misses: 0, scheduled: true, day: "2026-11-02", now: NOW("2026-11-02") });
  check(r2.masteredNow && rec.masteredAt && rec.reviewDueAt === "2026-11-05", `別の日に2回でマスター: ${JSON.stringify(rec)}`);
  C.applyFactResult(SUB, p, fact, { misses: 1, scheduled: true, day: "2026-11-05", now: NOW("2026-11-05") });
  check(!rec.masteredAt && rec.clearDays === 0 && rec.reviewDueAt === "2026-11-06", "まちがえたらマスター取り消し・翌日復習");
  const before = JSON.stringify(rec);
  C.applyFactResult(SUB, p, fact, { misses: 0, scheduled: false, day: "2026-11-05", now: NOW("2026-11-05", 12) });
  check(rec.reviewDueAt === "2026-11-06" && rec.clearDays === 0 && before !== JSON.stringify(rec), "おかわりは予定を動かさない");
  check(C.starCount(p) === rec.correct, "スターはノーミス回数");
}

/* ---------- きょうのミックス ---------- */
{
  const p = C.emptyProgress();
  const q = C.composeMix(KUKU, p, "2026-11-01");
  check(q.length === 9 && q.every((it) => it.kind === "new" && it.fact.groupId === "dan2"), "初日は2の段9問");
  q.forEach((it) => C.applyFactResult(KUKU, p, it.fact.id, { misses: 0, scheduled: true, day: "2026-11-01", now: NOW("2026-11-01") }));
  check(C.composeMix(KUKU, p, "2026-11-01").every((it) => it.kind === "bonus"), "同じ日の2回目はおかわり");
  const next = C.composeMix(KUKU, p, "2026-11-02");
  check(next.filter((it) => it.kind === "review").length === 9 && next.filter((it) => it.kind === "new").every((it) => it.fact.groupId === "dan5"),
    "翌日は2の段の復習＋5の段");
  check(C.recommendedGroup(KUKU, p) === "dan5", "つぎは5の段");

  // 期限切れの古い復習が多くても、前日に練習した問題は必ず出る
  const p2 = C.emptyProgress();
  SUB.facts.slice(0, 30).forEach((f, i) => {
    p2.subFacts[f.id] = Object.assign(C.newFactRecord(), {
      attempts: 1, clearDays: 1, stage: 1, lastClearDay: "2026-10-01", reviewDueAt: "2026-10-02",
      firstSeenAt: "2026-10-01", lastSeenAt: NOW("2026-10-01"), lastPracticedDay: "2026-10-01"
    });
    if (i >= 25) Object.assign(p2.subFacts[f.id], { reviewDueAt: "2026-11-09", lastPracticedDay: "2026-11-08", lastSeenAt: NOW("2026-11-08"), lastClearDay: "2026-11-01" });
  });
  const mix = C.composeMix(SUB, p2, "2026-11-09");
  const reviewIds = mix.filter((it) => it.kind === "review").map((it) => it.fact.id);
  check(reviewIds.length === 12, `復習は上限12問: ${reviewIds.length}`);
  SUB.facts.slice(25, 30).forEach((f) => check(reviewIds.includes(f.id), `前日に練習した ${f.id} が押し出された`));

  // 同じ期限なら長く見ていない問題が先（毎日同じ問題が勝ち残らない）
  const p3 = C.emptyProgress();
  SUB.facts.slice(0, 20).forEach((f, i) => {
    p3.subFacts[f.id] = Object.assign(C.newFactRecord(), {
      attempts: 1, clearDays: 1, stage: 1, lastClearDay: "2026-10-01", reviewDueAt: "2026-10-05",
      firstSeenAt: "2026-10-01", lastSeenAt: NOW("2026-10-01", i < 10 ? 20 : 8), lastPracticedDay: "2026-10-01"
    });
  });
  const firstPicked = C.composeMix(SUB, p3, "2026-11-09").filter((it) => it.kind === "review").slice(0, 10).map((it) => it.fact.id);
  check(SUB.facts.slice(10, 20).every((f) => firstPicked.includes(f.id)), "同じ期限は古く見た問題が先");

  const gs = C.composeGroupSession(SUB, "basic5", seededRng(3));
  check(gs.length === 20 && gs.slice(0, 10).every((it) => it.pass === "guided") && gs.slice(10).every((it) => it.pass === "quick"),
    "グループれんしゅうは図つき→図なしの2周");
}

/* ---------- ひっ算レベル ---------- */
{
  const p = C.emptyProgress();
  check(!C.isLevelUnlocked(p, "mult2") && C.isLevelUnlocked(p, "div1"), "3けた×2けたは最初ロック");
  for (let i = 0; i < 8; i++) C.applyWrittenResult(p, "mult1", { misses: i < 3 ? 1 : 0, day: "2026-11-01" });
  check(C.isLevelUnlocked(p, "mult2"), "8問・ノーミス率60%以上で解放");
}

/* ---------- マージ ---------- */
function randomRecord(rng) {
  const day = () => `2026-1${Math.floor(rng() * 2)}-${String(1 + Math.floor(rng() * 28)).padStart(2, "0")}`;
  const maybe = (v) => (rng() < 0.3 ? "" : v);
  return {
    attempts: Math.floor(rng() * 9), correct: Math.floor(rng() * 9), misses: Math.floor(rng() * 5),
    clearDays: Math.floor(rng() * 3), lastClearDay: maybe(day()), stage: Math.floor(rng() * 4),
    reviewDueAt: maybe(day()), masteredAt: maybe(NOW(day())), firstSeenAt: maybe(day()),
    lastSeenAt: maybe(NOW(day(), Math.floor(rng() * 24))), lastPracticedDay: maybe(day())
  };
}
function randomProgress(rng) {
  const p = C.emptyProgress();
  KUKU.facts.forEach((f) => { if (rng() < 0.4) p.facts[f.id] = randomRecord(rng); });
  SUB.facts.forEach((f) => { if (rng() < 0.4) p.subFacts[f.id] = randomRecord(rng); });
  C.LEVELS.forEach((l) => {
    p.levels[l.id] = { solved: Math.floor(rng() * 20), clean: Math.floor(rng() * 20), streak: Math.floor(rng() * 5), bestStreak: Math.floor(rng() * 9), sessionsDone: Math.floor(rng() * 5), lastSessionDay: rng() < 0.5 ? "2026-11-0" + (1 + Math.floor(rng() * 9)) : "" };
  });
  ["2026-11-01", "2026-11-02", "2026-11-03"].forEach((d) => {
    if (rng() < 0.6) p.daily[d] = { kukuNew: Math.floor(rng() * 9), kukuClears: Math.floor(rng() * 20), subNew: Math.floor(rng() * 8), subClears: Math.floor(rng() * 20), writtenSolved: Math.floor(rng() * 5), writtenClean: Math.floor(rng() * 5) };
  });
  p.updatedAt = NOW("2026-11-0" + (1 + Math.floor(rng() * 9)));
  return p;
}

const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const start = appSrc.indexOf("const MATH4_LEVEL_IDS =");
const end = appSrc.indexOf("function mergeGoal", start);
check(start > 0 && end > start, "app.js に mergeMath4Progress が見つからない");
const appCtx = {};
vm.createContext(appCtx);
vm.runInContext(appSrc.slice(start, end) + "\nglobalThis.mergeMath4Progress = mergeMath4Progress;", appCtx);

const rng = seededRng(42);
for (let i = 0; i < 60; i++) {
  const a = randomProgress(rng);
  const b = randomProgress(rng);
  const merged = C.mergeProgress(clone(a), clone(b));
  const swapped = C.mergeProgress(clone(b), clone(a));
  const again = C.mergeProgress(clone(merged), clone(b));
  check(canon(merged.levels) === canon(swapped.levels) && canon(merged.daily) === canon(swapped.daily),
    `マージ#${i}: 回数・日別集計が順番で変わる`);
  check(canon(again) === canon(merged), `マージ#${i}: 2回マージで結果が変わる`);
  Object.keys(a.subFacts).forEach((id) => check(merged.subFacts[id], `マージ#${i}: ${id} が消えた`));
  const appMerged = appCtx.mergeMath4Progress(clone(a), clone(b));
  check(canon(appMerged) === canon(merged), `マージ#${i}: app.js と math4-core.js の結果がちがう`);
}
check(JSON.stringify(C.migrateProgress({ version: 1, facts: { "2x3": { correct: 1 } } }).levels.mult1) === JSON.stringify({ solved: 0, clean: 0, streak: 0, bestStreak: 0, sessionsDone: 0, lastSessionDay: "" }),
  "古い記録にレベルの既定値が入らない");

if (errors.length) {
  console.error(`validate-math4: ${errors.length} 件の問題`);
  errors.slice(0, 40).forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("validate-math4: OK (ひきざん117問・九九81問・ひっ算の盤面・復習スケジュール・マージ)");
