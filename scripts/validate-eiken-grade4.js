#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const PACK_ID = "eiken-grade4";
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalize = (value) => String(value).normalize("NFKC").toLowerCase().replace(/[\s\u3000「」『』（）()【】［］\[\]、。・,:：;；!！?？'’\"“”―ー_\-/]/g, "");
const window = { QUIZ_PACKS: {}, QUIZ_QUESTIONS: [] };
const context = vm.createContext({ window, console });

["data/eiken-grade4-config.js", "data/eiken-grade4.js"].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
});

const pack = window.QUIZ_PACKS[PACK_ID];
const questions = window.QUIZ_QUESTIONS.filter((question) => question.packId === PACK_ID);
assert(pack && pack.childIds.length === 1 && pack.childIds[0] === "child-2", "pack must be child-2 only");
assert(pack.sessionSize === 10 && questions.length === 100, `expected 100 questions, got ${questions.length}`);
assert(JSON.stringify(pack.tierCounts) === JSON.stringify({ core: 35, challenge: 35, final: 30 }), "pack tier counts mismatch");

const ids = new Set();
const prompts = new Set();
const answerPositions = new Set();
const counts = { core: 0, challenge: 0, final: 0 };
const corners = {};
let audioCount = 0;
let passageCount = 0;
let wordOrderCount = 0;

questions.forEach((question, index) => {
  assert(question.id === `eiken4-${String(index + 1).padStart(3, "0")}`, `${question.id}: ids must be sequential`);
  assert(!ids.has(question.id), `${question.id}: duplicate id`);
  ids.add(question.id);
  const promptKey = normalize(question.prompt);
  assert(promptKey.length >= 8 && !prompts.has(promptKey), `${question.id}: empty or duplicate prompt`);
  prompts.add(promptKey);
  assert(question.childIds.length === 1 && question.childIds[0] === "child-2", `${question.id}: wrong learner`);
  assert(question.subject === "英語" && question.type === "choice", `${question.id}: invalid subject or type`);
  assert(Object.hasOwn(counts, question.tier), `${question.id}: invalid tier`);
  counts[question.tier] += 1;
  corners[question.cornerId] = (corners[question.cornerId] || 0) + 1;
  ["unitId", "unit", "sourceTag", "qualityStatus", "contentStatus", "difficulty", "stage", "formatTag", "retrievalDirection", "examSkill", "explanation", "variantGroup"].forEach((field) => {
    assert(question[field], `${question.id}: missing ${field}`);
  });
  assert(Array.isArray(question.mistakeTags) && question.mistakeTags.length >= 2, `${question.id}: missing mistake tags`);
  assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}: four choices required`);
  assert(new Set(question.choices.map(normalize)).size === 4, `${question.id}: choices must be distinct`);
  assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer`);
  assert(String(question.choices[question.answer]).trim().length > 0, `${question.id}: empty correct answer`);
  assert(question.explanation.length >= 18, `${question.id}: explanation is too short`);
  assert(!/(?:Have you ever|have you lived|want her to|too heavy for me to)/i.test(`${question.prompt} ${question.choices.join(" ")}`), `${question.id}: grammar exceeds the intended Grade 4 scope`);
  answerPositions.add(question.answer);

  if (question.figure) {
    assert(question.figure.kind === "audio", `${question.id}: only safe audio figures are expected`);
    assert(question.cornerId === "e4-listening", `${question.id}: audio outside listening corner`);
    assert(question.figure.alt && question.figure.caption && question.figure.lang === "en-US", `${question.id}: audio accessibility metadata missing`);
    assert(question.figure.audioText.length >= 10 && !/[ぁ-んァ-ヶ一-龠]/.test(question.figure.audioText), `${question.id}: audio text must be a complete English script`);
    assert(!/(?:Girl|Boy|Teacher|Tom|Amy):/.test(question.figure.audioText), `${question.id}: speech engine must not read speaker labels aloud`);
    assert(!question.figure.src && !question.figure.url && !question.figure.html, `${question.id}: unsafe audio source`);
    assert(question.explanation.includes("放送文"), `${question.id}: transcript must appear after answering`);
    assert(question.formatTag === "長文・会話", `${question.id}: listening format tag mismatch`);
    audioCount += 1;
  }

  if (question.passage) {
    assert(question.cornerId === "e4-reading", `${question.id}: passage outside reading corner`);
    assert(question.passage.length >= 100, `${question.id}: passage too short`);
    assert(question.formatTag === "資料読取", `${question.id}: reading format tag mismatch`);
    passageCount += 1;
  }

  if (question.unit === "語句整序") {
    const chunkBlock = question.prompt.match(/（ ([^）]+) ）$/);
    assert(question.cornerId === "e4-dialogue-order", `${question.id}: word-order item is in the wrong corner`);
    assert(question.prompt.includes("2番目と4番目"), `${question.id}: word-order task does not test the official decision points`);
    assert(chunkBlock && chunkBlock[1].split(" / ").length === 5, `${question.id}: word-order task must contain five shuffled chunks`);
    assert(question.choices.every((choice) => choice.includes("―")), `${question.id}: word-order choices must be second/fourth chunk pairs`);
    assert(question.explanation.includes("正しい語順") && question.explanation.includes("2番目"), `${question.id}: word-order explanation is incomplete`);
    wordOrderCount += 1;
  }
});

assert(JSON.stringify(counts) === JSON.stringify({ core: 35, challenge: 35, final: 30 }), `tier distribution mismatch: ${JSON.stringify(counts)}`);
assert(JSON.stringify(corners) === JSON.stringify({
  "e4-foundations": 35,
  "e4-dialogue-order": 20,
  "e4-listening": 30,
  "e4-reading": 15
}), `corner distribution mismatch: ${JSON.stringify(corners)}`);
assert(audioCount === 30 && passageCount === 15, `expected 30 audio and 15 passage questions, got ${audioCount}/${passageCount}`);
assert(wordOrderCount === 10, `expected 10 word-order questions, got ${wordOrderCount}`);
assert(answerPositions.size === 4, "correct answers must use all four positions");
assert(questions.filter((question) => question.cornerId === "e4-reading").every((question) => question.tier === "final"), "reading questions must be final tier");
assert(questions.filter((question) => question.cornerId === "e4-foundations").every((question) => question.tier === "core"), "foundations must be core tier");

const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
assert(index.includes("eiken-grade4-config.js") && index.includes("eiken-grade4.js"), "EIKEN scripts are not loaded");
assert(app.includes('packId: "eiken-grade4"') && app.includes('figure.kind === "audio"') && app.includes("SpeechSynthesisUtterance"), "EIKEN module or audio renderer is not wired");
const review = JSON.parse(fs.readFileSync(path.join(ROOT, "reports/eiken-grade4-content-review.json"), "utf8"));
assert(review.status === "PASS" && review.questionsReviewed === 100 && review.unresolvedIssues.length === 0, "content review is incomplete");

console.log(JSON.stringify({ packId: PACK_ID, questions: questions.length, tiers: counts, corners, audioCount, passageCount, wordOrderCount, status: "PASS" }, null, 2));
