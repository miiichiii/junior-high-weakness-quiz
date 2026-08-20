#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const PACK_ID = "science-ion-drill";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadScript(context, relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  vm.runInContext(source, context, { filename: relativePath });
}

function normalized(value) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000「」『』（）()【】［］\[\]、。・,.:：;；!！?？―ー_]/g, "");
}

const window = { QUIZ_PACKS: {}, QUIZ_QUESTIONS: [] };
const context = vm.createContext({ window, console });

loadScript(context, "data/questions.js");
loadScript(context, "data/entrance-ibaraki-2027-pack.js");
loadScript(context, "data/term-test-2026-07-13-config.js");
loadScript(context, "data/term-test-2026-07-13-humanities.js");
loadScript(context, "data/term-test-2026-07-13-stem.js");
loadScript(context, "data/social-author-drill-config.js");
loadScript(context, "data/social-author-drill.js");
loadScript(context, "data/science-ion-drill-config.js");
loadScript(context, "data/science-ion-drill.js");

const pack = window.QUIZ_PACKS[PACK_ID];
const questions = window.QUIZ_QUESTIONS.filter((question) => question.packId === PACK_ID);
const regularChild1 = window.QUIZ_QUESTIONS.filter((question) => (
  !question.packId && (!Array.isArray(question.childIds) || question.childIds.includes("child-1"))
));

assert(pack, `${PACK_ID}: config was not registered`);
assert(pack.sessionSize === 10, `${PACK_ID}: session size must be 10`);
assert(pack.maxEnabled === false, `${PACK_ID}: MAX tier must be disabled`);
assert(pack.tierCounts.core === 10, `${PACK_ID}: core count must be 10`);
assert(pack.tierCounts.challenge === 10, `${PACK_ID}: challenge count must be 10`);
assert(pack.tierCounts.final === 10, `${PACK_ID}: final count must be 10`);
assert(pack.subjectCounts.total["理科"] === 30, `${PACK_ID}: science total must be 30`);
assert(questions.length === 30, `${PACK_ID}: expected 30 questions, got ${questions.length}`);
assert(regularChild1.length === 300, `regular child-1 bank must stay at 300, got ${regularChild1.length}`);

const required = [
  "id", "subject", "unit", "priority", "stage", "difficulty", "examSkill", "formatTag",
  "sourceTag", "qualityStatus", "contentStatus", "packId", "tier", "prompt", "explanation",
  "variantGroup"
];
const tierCounts = { core: 0, challenge: 0, final: 0 };
const ids = new Set();
const prompts = new Set();

questions.forEach((question) => {
  required.forEach((field) => assert(question[field], `${question.id || "unknown"}: missing ${field}`));
  assert(/^science-ion-\d{3}$/.test(question.id), `${question.id}: invalid id format`);
  assert(!ids.has(question.id), `${question.id}: duplicate id`);
  ids.add(question.id);
  assert(question.subject === "理科", `${question.id}: subject must be 理科`);
  assert(question.unit === "水溶液とイオン", `${question.id}: wrong unit`);
  assert(Array.isArray(question.childIds) && question.childIds.length === 1 && question.childIds[0] === "child-1", `${question.id}: wrong child scope`);
  assert(Object.hasOwn(tierCounts, question.tier), `${question.id}: invalid tier`);
  tierCounts[question.tier] += 1;
  assert(Array.isArray(question.skills) && question.skills.length >= 2, `${question.id}: missing skills`);
  assert(Array.isArray(question.mistakeTags) && question.mistakeTags.length >= 2, `${question.id}: missing mistake tags`);
  assert(question.sourceTag === "science-ion-weakness-original-2026-07", `${question.id}: wrong source tag`);
  assert(question.qualityStatus === "content-audited", `${question.id}: wrong quality status`);
  assert(question.contentStatus === "content-final", `${question.id}: content is not final`);
  assert(question.prompt.length >= 18, `${question.id}: prompt is too short`);
  assert(question.explanation.length >= 28, `${question.id}: explanation is too short`);
  assert(!prompts.has(normalized(question.prompt)), `${question.id}: duplicate prompt`);
  prompts.add(normalized(question.prompt));

  if (question.type === "input") {
    assert(Array.isArray(question.answerText) && question.answerText.length >= 1, `${question.id}: input answer is missing`);
    assert(!question.choices && question.answer === undefined, `${question.id}: input question has choice fields`);
  } else {
    assert(question.type === "choice", `${question.id}: unsupported type ${question.type}`);
    assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}: choices must contain four items`);
    assert(new Set(question.choices.map(normalized)).size === 4, `${question.id}: duplicate choices`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer index`);
  }
});

assert(tierCounts.core === 10 && tierCounts.challenge === 10 && tierCounts.final === 10, `wrong tier counts: ${JSON.stringify(tierCounts)}`);

function question(id) {
  const found = questions.find((item) => item.id === id);
  assert(found, `${id}: missing critical question`);
  return found;
}

assert(question("science-ion-007").choices[question("science-ion-007").answer].includes("Cu²⁺ + 2Cl⁻"), "CuCl2 ionization answer is wrong");
assert(question("science-ion-013").choices[question("science-ion-013").answer] === "Cu²⁺ + 2e⁻ → Cu", "cathode half-equation is wrong");
assert(question("science-ion-014").choices[question("science-ion-014").answer] === "2Cl⁻ → Cl₂ + 2e⁻", "anode half-equation is wrong");
assert(question("science-ion-016").choices[question("science-ion-016").answer] === "Zn → Zn²⁺ + 2e⁻", "zinc half-equation is wrong");
assert(question("science-ion-017").choices[question("science-ion-017").answer] === "2H⁺ + 2e⁻ → H₂", "hydrogen half-equation is wrong");
assert(question("science-ion-018").choices[question("science-ion-018").answer] === "亜鉛板から銅板へ", "electron direction is wrong");
assert(question("science-ion-019").choices[question("science-ion-019").answer] === "銅板から亜鉛板へ", "current direction is wrong");
assert(question("science-ion-028").answerText.includes("2HCl→H2+Cl2"), "HCl reaction equation is missing");
assert(question("science-ion-029").answerText.includes("1:1"), "gas volume ratio is wrong");
assert(question("science-ion-030").answerText.some((answer) => answer.includes("水に溶け")), "chlorine solubility reason is missing");

const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
assert(indexSource.includes("data/science-ion-drill-config.js"), "science pack config is not loaded by index.html");
assert(indexSource.includes("data/science-ion-drill.js"), "science pack questions are not loaded by index.html");
assert(appSource.includes('packId: "science-ion-drill"'), "science pack is not linked from the child-1 modules");

console.log("science ion drill validation passed:", { questions: questions.length, tierCounts, regularChild1: regularChild1.length });
