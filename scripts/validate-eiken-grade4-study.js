#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const loadBrowserData = (file) => {
  const sandbox = { window: {} };
  vm.runInNewContext(read(file), sandbox, { filename: file });
  return sandbox.window;
};

const vocabWindow = loadBrowserData("data/eiken-grade4-vocab.js");
const deck = vocabWindow.EIKEN_VOCAB_DECKS?.["eiken-grade4-vocab"];
assert(deck, "vocabulary deck is missing");
assert(deck.items.length === 420, `expected 420 vocabulary items, got ${deck.items.length}`);
assert(deck.items.filter((item) => item.kind === "word").length === 300, "word count must be 300");
assert(deck.items.filter((item) => item.kind === "phrase").length === 120, "phrase count must be 120");
assert(new Set(deck.items.map((item) => item.id)).size === 420, "vocabulary IDs are duplicated");
assert(new Set(deck.items.map((item) => item.headword.toLowerCase())).size === 420, "headwords are duplicated");
for (let day = 1; day <= 21; day += 1) {
  assert(deck.items.filter((item) => item.day === day).length === 20, `day ${day} must contain 20 new items`);
}
for (const item of deck.items) {
  for (const field of ["id", "headword", "meaning", "pos", "category", "example", "exampleJa", "related", "priority", "audioText"]) {
    assert(typeof item[field] === "string" && item[field].trim(), `${item.id}: ${field} is empty`);
  }
  assert(["S", "A", "B"].includes(item.priority), `${item.id}: bad priority`);
  assert(item.directions.includes("english-to-japanese"), `${item.id}: English-to-Japanese direction missing`);
  assert(item.directions.includes("japanese-to-english"), `${item.id}: Japanese-to-English direction missing`);
  assert(item.directions.includes("audio-to-meaning"), `${item.id}: audio direction missing`);
  assert(item.pronunciation?.text === item.audioText && item.pronunciation?.lang === "en-US", `${item.id}: pronunciation metadata is missing`);
  assert(!/\b(has|have|had)\s+(already\s+|just\s+|ever\s+|never\s+)?[a-z]+ed\b/i.test(item.example), `${item.id}: example may exceed Grade 4 grammar`);
}

// Perfect-study simulation: 20 new items daily, then reviews 1/3/7 days after first study.
const simulated = new Map();
for (let day = 1; day <= 28; day += 1) {
  deck.items.filter((item) => item.day === day).forEach((item) => {
    simulated.set(item.id, { firstDay: day, correctDays: [day], stage: 1, due: day + 1, directions: new Set(["english-to-japanese"]) });
  });
  for (const item of deck.items) {
    const record = simulated.get(item.id);
    if (!record || record.due !== day) continue;
    record.correctDays.push(day);
    record.stage += 1;
    record.directions.add(record.stage === 2 ? "audio-to-meaning" : (record.stage === 3 ? "phrase-cloze" : "japanese-to-english"));
    record.due = record.stage === 2 ? day + 2 : (record.stage === 3 ? day + 4 : 0);
  }
}
assert(simulated.size === 420, `schedule introduced only ${simulated.size}/420 items`);
assert([...simulated.values()].every((record) => record.stage >= 4), "not every item can reach mastery by day 28");
assert([...simulated.values()].every((record) => new Set(record.correctDays).size >= 3 && record.directions.size >= 2), "mastery day/direction rule is not reachable");

const examWindow = loadBrowserData("data/eiken-grade4-exam.js");
const exams = examWindow.EIKEN_GRADE4_EXAMS;
assert(exams?.forms?.length === 3, "three mock forms are required");
const allQuestions = exams.forms.flatMap((form) => form.questions);
assert(allQuestions.length === 195, `expected 195 questions, got ${allQuestions.length}`);
assert(new Set(allQuestions.map((question) => question.id)).size === 195, "mock question IDs are duplicated");
const contentSignatures = allQuestions.map((question) => `${question.prompt}|${question.passage}|${question.audio?.segments?.map((row) => row.text).join(" ") || ""}`);
assert(new Set(contentSignatures).size === 195, "mock question content is duplicated");

const requiredParts = {
  "短文空所": 15,
  "会話文空所": 5,
  "語句整序": 5,
  "長文・掲示": 2,
  "長文・Eメール": 3,
  "長文・説明文": 5,
  "第1部・応答": 10,
  "第2部・会話内容": 10,
  "第3部・説明・物語": 10
};
for (const form of exams.forms) {
  assert(form.questions.length === 65, `${form.id}: question count must be 65`);
  assert(form.questions.filter((question) => question.section === "reading").length === 35, `${form.id}: reading count must be 35`);
  assert(form.questions.filter((question) => question.section === "listening").length === 30, `${form.id}: listening count must be 30`);
  for (const [part, total] of Object.entries(requiredParts)) {
    assert(form.questions.filter((question) => question.part === part).length === total, `${form.id}: ${part} must contain ${total}`);
  }
  const passageLengths = {};
  for (const question of form.questions.filter((row) => row.passage)) {
    if (!passageLengths[question.part]) passageLengths[question.part] = question.passage.trim().split(/\s+/).length;
  }
  assert(passageLengths["長文・掲示"] >= 40 && passageLengths["長文・掲示"] <= 60, `${form.id}: notice length is out of range`);
  assert(passageLengths["長文・Eメール"] >= 90 && passageLengths["長文・Eメール"] <= 120, `${form.id}: email length is out of range`);
  assert(passageLengths["長文・説明文"] >= 140 && passageLengths["長文・説明文"] <= 180, `${form.id}: story length is out of range`);
  const answerCounts = [0, 1, 2, 3].map((answer) => form.questions.filter((question) => question.answer === answer).length);
  assert(Math.max(...answerCounts) - Math.min(...answerCounts) <= 5, `${form.id}: answer positions are unbalanced`);
}

for (const question of allQuestions) {
  assert(question.choices.length === (question.part === "第1部・応答" ? 3 : 4), `${question.id}: choice count is wrong`);
  assert(new Set(question.choices).size === question.choices.length, `${question.id}: choices are duplicated`);
  assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.choices.length, `${question.id}: answer index is invalid`);
  assert(typeof question.explanation === "string" && question.explanation.length >= 8, `${question.id}: explanation is missing`);
  if (question.section === "listening") {
    assert(question.audio?.playsAllowed === 2, `${question.id}: listening must allow exactly two plays`);
    assert(Array.isArray(question.audio.segments) && question.audio.segments.length, `${question.id}: transcript is missing`);
    if (question.part === "第1部・応答") {
      assert(question.audio.spokenChoices.join("|") === question.choices.join("|"), `${question.id}: spoken and displayed response choices differ`);
    }
  }
}

const vocabHtml = read("eiken-vocab.html");
const examHtml = read("eiken-exam.html");
const vocabApp = read("eiken-vocab-app.js");
const examApp = read("eiken-exam-app.js");
const parentHtml = read("parent-dashboard.html");
const app = read("app.js");
const css = read("eiken-study.css");
for (const id of ["masteredCount", "startStudy", "reviewOnly", "wordList", "readinessLabel"]) assert(vocabHtml.includes(`id="${id}"`), `vocabulary UI missing ${id}`);
for (const id of ["formList", "examRunner", "examPlayAudio", "sectionBreak", "examReviewList"]) assert(examHtml.includes(`id="${id}"`), `exam UI missing ${id}`);
assert(vocabApp.includes("[1, 1, 2, 4, 0]") && vocabApp.includes("correctDays") && vocabApp.includes("directions"), "1/3/7-day mastery logic is incomplete");
assert(vocabApp.includes("eikenVocabulary") && examApp.includes("eikenExam") && vocabApp.includes("serverOnly: true") && examApp.includes("serverOnly: true"), "verified Firebase saving is incomplete");
assert(app.includes("mergeEikenVocabProgress"), "main cloud merge must preserve vocabulary progress from both devices");
assert(app.includes("mergeEikenExamProgress"), "main cloud merge must deduplicate mock attempts across devices");
assert(examApp.includes("plays >= 2") && examApp.includes("for (let play = 1; play <= 2") && examApp.includes("startAnswerCountdown"), "two-play audio or response timer is incomplete");
assert(app.includes('label: "英検4級 基礎100問"') && app.includes('label: "英検4級 単語帳420"') && app.includes('label: "英検4級 本番ドリル"'), "child2 does not have the three requested modules");
assert(parentHtml.includes("eikenGrade4Markup") && parentHtml.includes("378語句以上習得") && parentHtml.includes("R 28/35以上・L 24/30以上"), "parent EIKEN progress or readiness rule is missing");
assert(css.includes("@media (max-width: 560px)") && css.includes("min-height: 52px"), "iPhone layout or tap targets are missing");
assert(!/<svg\b/i.test(vocabHtml + examHtml), "study pages should not contain decorative SVG");

console.log(JSON.stringify({
  vocabulary: { total: 420, words: 300, phrases: 120, masteryByDay: 28 },
  mocks: { forms: 3, questions: 195, readingPerForm: 35, listeningPerForm: 30 },
  cloud: "local + anonymous/Google Firebase",
  status: "PASS"
}, null, 2));
