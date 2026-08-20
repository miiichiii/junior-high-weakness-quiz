const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = { window: {}, console };
vm.createContext(context);

function load(file) {
  const code = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(code, context, { filename: file });
}

load("data/questions.js");

const baseQuestions = (context.window.QUIZ_QUESTIONS || []).slice();

load("data/entrance-ibaraki-2027-pack.js");

const questions = context.window.QUIZ_QUESTIONS || [];
const requiredMeta = ["childIds", "difficulty", "examSkill", "formatTag", "mistakeTags", "sourceTag", "qualityStatus", "contentStatus"];
const subjects = ["数学", "理科", "社会", "英語", "国語"];
const difficultyOrder = ["L1 基礎復帰", "L2 県立標準", "L3 県立本番", "L4 安全圏チャレンジ"];
const allowedFormats = new Set(["短問", "資料読取", "長文・会話", "読解・記述", "複合", "操作型", "直接入力", "ミス発見"]);
const allowedQualityStatuses = new Set(["metadata-audited", "content-audited", "provisional"]);
const practicalFormats = new Set(["資料読取", "長文・会話", "読解・記述", "複合"]);

function belongsTo(question, childId) {
  if (Array.isArray(question.childIds)) return question.childIds.includes(childId);
  if (question.childId) return question.childId === childId;
  return childId === "child-1";
}

function countBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

const errors = [];
const ids = new Set();
questions.forEach((question) => {
  if (ids.has(question.id)) errors.push(`duplicate id: ${question.id}`);
  ids.add(question.id);
  requiredMeta.forEach((field) => {
    if (question[field] === undefined || question[field] === "" || (Array.isArray(question[field]) && !question[field].length)) {
      errors.push(`${question.id}: missing ${field}`);
    }
  });
  if (!difficultyOrder.includes(question.difficulty)) errors.push(`${question.id}: invalid difficulty ${question.difficulty}`);
  if (!allowedFormats.has(question.formatTag)) errors.push(`${question.id}: invalid formatTag ${question.formatTag}`);
  if (!allowedQualityStatuses.has(question.qualityStatus)) errors.push(`${question.id}: invalid qualityStatus ${question.qualityStatus}`);
  const type = question.type || "choice";
  if ((type === "choice" || type === "find-error") && (!Array.isArray(question.choices) || question.answer < 0 || question.answer >= question.choices.length)) {
    errors.push(`${question.id}: invalid choices/answer`);
  }
  if (type === "input" && !question.answerText) errors.push(`${question.id}: missing answerText`);
  if (type === "manipulate" && (!Array.isArray(question.left) || !Array.isArray(question.right))) {
    errors.push(`${question.id}: missing equation sides`);
  }
});

const child1 = questions.filter((question) => belongsTo(question, "child-1"));
const child2 = questions.filter((question) => belongsTo(question, "child-2"));
const child3 = questions.filter((question) => belongsTo(question, "child-3"));
const baseChild2 = baseQuestions.filter((question) => belongsTo(question, "child-2"));
const baseChild3 = baseQuestions.filter((question) => belongsTo(question, "child-3"));
const bySubject = countBy(child1, (question) => question.subject);
const byDifficulty = countBy(child1, (question) => question.difficulty);
const byFormat = countBy(child1, (question) => question.formatTag);
const practicalRows = child1.filter((question) => practicalFormats.has(question.formatTag));
const practicalBySubject = countBy(practicalRows, (question) => question.subject);

function newerRecord(a, b) {
  const aTime = Date.parse(a.lastAnsweredAt || "") || 0;
  const bTime = Date.parse(b.lastAnsweredAt || "") || 0;
  return aTime >= bTime ? a : b;
}

function mergeProgressStateFixture(localRecord, remoteRecord) {
  const latest = newerRecord(localRecord, remoteRecord);
  const reviewNeeded = Boolean(latest.needsReview);
  return {
    consecutiveCorrect: latest.consecutiveCorrect || 0,
    mastered: reviewNeeded ? false : Boolean(latest.mastered),
    needsReview: reviewNeeded,
    reviewDueAt: reviewNeeded ? (latest.reviewDueAt || "") : "",
    masteredAt: reviewNeeded ? "" : (latest.masteredAt || "")
  };
}

if (child1.length !== 300) errors.push(`child-1 count expected 300, got ${child1.length}`);
if (child2.length !== baseChild2.length) errors.push(`child-2 count changed from ${baseChild2.length} to ${child2.length}`);
if (child3.length !== baseChild3.length) errors.push(`child-3 count changed from ${baseChild3.length} to ${child3.length}`);
subjects.forEach((subject) => {
  if (!bySubject[subject]) errors.push(`subject has no questions: ${subject}`);
});
difficultyOrder.forEach((difficulty) => {
  if (!byDifficulty[difficulty]) errors.push(`difficulty has no questions: ${difficulty}`);
});
if (practicalRows.length < 90) errors.push(`practical format count expected >= 90, got ${practicalRows.length}`);
[
  ["数学", 25],
  ["理科", 18],
  ["社会", 15],
  ["英語", 8],
  ["国語", 8]
].forEach(([subject, minimum]) => {
  if ((practicalBySubject[subject] || 0) < minimum) {
    errors.push(`${subject} practical format count expected >= ${minimum}, got ${practicalBySubject[subject] || 0}`);
  }
});
const staleReview = { needsReview: true, mastered: false, consecutiveCorrect: 0, lastAnsweredAt: "2026-05-01T00:00:00.000Z" };
const latestMastered = { needsReview: false, mastered: true, consecutiveCorrect: 3, masteredAt: "2026-05-02T00:00:00.000Z", lastAnsweredAt: "2026-05-02T00:00:00.000Z" };
const latestWrong = { needsReview: true, mastered: false, consecutiveCorrect: 0, reviewDueAt: "2026-05-03", lastAnsweredAt: "2026-05-03T00:00:00.000Z" };
const mergedMasteredFixture = mergeProgressStateFixture(latestMastered, staleReview);
const mergedWrongFixture = mergeProgressStateFixture(latestMastered, latestWrong);
if (mergedMasteredFixture.needsReview || !mergedMasteredFixture.mastered) {
  errors.push("progress merge fixture failed: latest mastered state should not be reverted by stale review state");
}
if (!mergedWrongFixture.needsReview || mergedWrongFixture.mastered) {
  errors.push("progress merge fixture failed: latest review state must clear mastered");
}
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (!indexSource.includes('data-mode="weekly"')) {
  errors.push("weekly practice mode is not wired in index.html");
}

console.log("child counts:", { "child-1": child1.length, "child-2": child2.length, "child-3": child3.length });
console.log("subject counts:", bySubject);
console.log("difficulty counts:", byDifficulty);
console.log("format counts:", byFormat);
console.log("practical format counts:", { total: practicalRows.length, bySubject: practicalBySubject });

if (errors.length) {
  console.error("Question bank validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Question bank validation passed.");
