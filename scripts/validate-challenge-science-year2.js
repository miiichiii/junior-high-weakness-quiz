#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const PACK_ID = "challenge-science-year2";
const titles = [
  "電流の性質", "電力量と熱量、電流と電子", "電流と磁界", "物質の分解、原子・分子", "化学変化と物質の質量",
  "植物のからだのつくりとはたらき", "生物と細胞、消化と吸収", "血液の循環、からだのはたらき", "気象観測、空気中の水蒸気", "天気の変化"
];
const UNIT_META = Object.fromEntries(titles.map((title, index) => [`sci2-${String(index + 9).padStart(2, "0")}`, { title, pages: [142 + index * 2, 143 + index * 2] }]));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalized = (value) => String(value).normalize("NFKC").toLowerCase().replace(/[\s\u3000「」『』（）()【】［］\[\]、。・,:：;；!！?？―ー_\-/]/g, "");
const VISUAL_REFERENCE = /(?:図の|図で|表の|表から|グラフの|グラフから|グラフ上|グラフで|物質[XYＸＹ]|未知の動物[A-ZＡ-Ｚ]|このばね)/;
const DANGLING_INPUT_REFERENCE = /^(?:この|その|上の|下の|図の|表の|グラフの)/;
const window = { QUIZ_PACKS: {}, QUIZ_QUESTIONS: [] };
const context = vm.createContext({ window, console });
["data/challenge-science-year2-config.js", "data/challenge-science-year2.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file }));
const pack = window.QUIZ_PACKS[PACK_ID];
const questions = window.QUIZ_QUESTIONS.filter((question) => question.packId === PACK_ID);
assert(pack?.corners?.length === 10 && pack.corners.every((corner) => corner.enabled), "ten enabled units required");
assert(pack.corners.every((corner) => UNIT_META[corner.id]), "pack corner ids must match question unit ids");
assert(pack.sessionSize === 8 && questions.length === 240, `expected 240 questions, got ${questions.length}`);

const ids = new Set(); const prompts = new Set(); const positions = { core: new Set(), challenge: new Set() };
const tiers = { core: 0, challenge: 0, final: 0 }; const perUnit = {}; const referencedFacts = {};
let figures = 0; let lineGraphs = 0;
questions.forEach((question) => {
  const meta = UNIT_META[question.unitId];
  assert(meta, `${question.id}: unsupported unit`);
  ["id","unitId","cornerId","tier","prompt","explanation","paperRef","sourceFactIds","retrievalDirection","examSkill","formatTag"].forEach((field) => assert(question[field], `${question.id || "unknown"}: missing ${field}`));
  assert(/^challenge-sci2-\d{2}-\d{3}$/.test(question.id), `${question.id}: malformed id`);
  assert(!ids.has(question.id), `${question.id}: duplicate id`); ids.add(question.id);
  const promptKey = normalized(question.prompt); assert(!prompts.has(promptKey), `${question.id}: duplicate prompt`); prompts.add(promptKey);
  assert(question.cornerId === question.unitId && question.subject === "理科" && question.unit === meta.title, `${question.id}: routing or title mismatch`);
  assert(question.sourceTag === "challenge-science-year2-original" && question.qualityStatus === "independently-reviewed" && question.contentStatus === "content-final", `${question.id}: review metadata missing`);
  assert(question.prompt.length >= 16 && question.explanation.length >= 12, `${question.id}: prompt or explanation too thin`);
  assert(Array.isArray(question.mistakeTags) && question.mistakeTags.length >= 2, `${question.id}: mistake tags missing`);
  assert(Object.hasOwn(tiers, question.tier), `${question.id}: invalid tier`); tiers[question.tier] += 1;
  perUnit[question.unitId] ||= { total:0, core:0, challenge:0, final:0, inputs:0, figures:0, lineGraphs:0, tables:0, diagrams:0 };
  perUnit[question.unitId].total += 1; perUnit[question.unitId][question.tier] += 1;
  referencedFacts[question.unitId] ||= new Set();
  question.sourceFactIds.forEach((factId) => { assert(new RegExp(`^${question.unitId}-f\\d{2}$`).test(factId), `${question.id}: malformed fact ${factId}`); referencedFacts[question.unitId].add(factId); });
  const pages = Array.from(String(question.paperRef).matchAll(/p\.(\d+)/g), (match) => Number(match[1]));
  assert(pages.length && pages.every((page) => meta.pages.includes(page)), `${question.id}: page outside unit`);
  if (question.type === "input") {
    perUnit[question.unitId].inputs += 1;
    assert(question.tier === "final" && Array.isArray(question.answerText) && question.answerText.length, `${question.id}: invalid input`);
    assert(!DANGLING_INPUT_REFERENCE.test(question.prompt), `${question.id}: input prompt depends on missing prior context`);
    question.answerText.forEach((answer) => { assert(normalized(answer).length >= 1, `${question.id}: empty answer`); assert(!promptKey.includes(normalized(answer)), `${question.id}: answer exposed in prompt`); });
  } else {
    assert(question.type === "choice" && question.tier !== "final", `${question.id}: invalid choice tier`);
    assert(Array.isArray(question.choices) && question.choices.length === 4 && new Set(question.choices.map(normalized)).size === 4, `${question.id}: choices invalid`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: answer index invalid`);
    positions[question.tier].add(question.answer);
  }
  if (question.tier === "challenge" && VISUAL_REFERENCE.test(question.prompt)) assert(question.figure, `${question.id}: prompt refers to a missing figure or table`);
  if (!question.figure) return;
  figures += 1; perUnit[question.unitId].figures += 1;
  const figure = question.figure;
  assert(question.tier === "challenge" && ["table","diagram","lineGraph"].includes(figure.kind), `${question.id}: unsafe figure kind`);
  assert(figure.alt && figure.caption && !figure.src && !figure.url && !figure.image && !figure.html, `${question.id}: figure accessibility or safety failure`);
  if (figure.kind === "table") {
    perUnit[question.unitId].tables += 1;
    assert(Array.isArray(figure.columns) && figure.columns.length >= 2 && Array.isArray(figure.rows) && figure.rows.length >= 2, `${question.id}: invalid table`);
    figure.rows.forEach((row) => assert(row.length === figure.columns.length, `${question.id}: table width mismatch`));
  }
  if (figure.kind === "diagram") {
    perUnit[question.unitId].diagrams += 1;
    const width = Number(figure.width), height = Number(figure.height), nodes = figure.nodes || [], nodeIds = new Set(nodes.map((node) => node.id));
    assert(width > 0 && width <= 390 && height > 0 && height <= 240 && nodes.length >= 2 && nodeIds.size === nodes.length, `${question.id}: invalid diagram`);
    nodes.forEach((node) => assert(Number(node.x) >= 0 && Number(node.y) >= 0 && Number(node.x)+Number(node.width) <= width && Number(node.y)+Number(node.height) <= height, `${question.id}: diagram node out of bounds`));
    (figure.edges || []).forEach((edge) => assert(nodeIds.has(edge.from) && nodeIds.has(edge.to), `${question.id}: diagram edge invalid`));
  }
  if (figure.kind === "lineGraph") {
    lineGraphs += 1; perUnit[question.unitId].lineGraphs += 1;
    const width = Number(figure.width), height = Number(figure.height);
    assert(width > 0 && width <= 390 && height > 0 && height <= 240 && Number(figure.xMax) > Number(figure.xMin) && Number(figure.yMax) > Number(figure.yMin), `${question.id}: invalid graph range`);
    assert(figure.xLabel && figure.yLabel && Array.isArray(figure.series) && figure.series.length >= 1, `${question.id}: graph labels or series missing`);
    figure.series.forEach((series) => { assert(Array.isArray(series.points) && series.points.length >= 2, `${question.id}: graph points missing`); series.points.forEach(([x,y]) => assert(Number.isFinite(Number(x)) && Number.isFinite(Number(y)) && x >= figure.xMin && x <= figure.xMax && y >= figure.yMin && y <= figure.yMax, `${question.id}: graph point out of range`)); });
  }
});
assert(JSON.stringify(tiers) === JSON.stringify({ core:80, challenge:80, final:80 }), "tiers must be 80/80/80");
Object.keys(UNIT_META).forEach((unitId) => { const count = perUnit[unitId]; assert(count.total === 24 && count.core === 8 && count.challenge === 8 && count.final === 8 && count.inputs === 8, `${unitId}: count mismatch`); assert(count.figures >= 3, `${unitId}: at least three figures required`); assert(referencedFacts[unitId].size === 16, `${unitId}: expected 16 source facts`); });
assert(figures >= 35 && lineGraphs >= 7, `expected at least 35 figures and 7 graphs, got ${figures}/${lineGraphs}`);
assert(positions.core.size === 4 && positions.challenge.size === 4, "answer positions must use all four slots");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8"); const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
assert(index.includes("challenge-science-year2-config.js") && index.includes("challenge-science-year2.js"), "science scripts not loaded");
assert(app.includes('id: "challenge-science-year2"') && app.includes('figure.kind === "lineGraph"'), "science course or graph renderer not wired");
const review = JSON.parse(fs.readFileSync(path.join(ROOT, "reports/science-year2-independent-review.json"), "utf8"));
assert(review.status === "PASS" && review.questionsReviewed === 240 && review.unresolvedIssues.length === 0, "review report did not pass");
const reviewed = new Set(); review.reviewedRanges.forEach(({unitId,start,end}) => { for (let n=start;n<=end;n+=1) reviewed.add(`challenge-${unitId}-${String(n).padStart(3,"0")}`); });
questions.forEach((question) => assert(reviewed.has(question.id), `${question.id}: absent from review`));
const libraryIndex = process.argv.indexOf("--library");
if (libraryIndex >= 0) {
  const library = path.resolve(process.argv[libraryIndex + 1] || ""); assert(fs.existsSync(path.join(library, "page_map.csv")), "private library incomplete");
  Object.keys(UNIT_META).forEach((unitId) => { const facts = JSON.parse(fs.readFileSync(path.join(library, "facts", `${unitId}.json`), "utf8")); assert(facts.status === "independently-reviewed", `${unitId}: facts not reviewed`); const verified = new Set(facts.verified_facts.map((fact) => fact.id)); referencedFacts[unitId].forEach((id) => assert(verified.has(id), `${unitId}: missing ${id}`)); assert(verified.size === referencedFacts[unitId].size, `${unitId}: uncovered facts`); });
}
console.log(JSON.stringify({ packId: PACK_ID, units: 10, questions: questions.length, tiers, originalFigures: figures, lineGraphs, perUnit, status: "PASS" }, null, 2));
