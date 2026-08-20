const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const PACK_ID = "challenge-social-civics";
const UNIT_META = {
  "civ-22": { title: "わたしたちの生活と現代社会", pages: [44, 45] },
  "civ-23": { title: "日本国憲法と基本的人権", pages: [46, 47] },
  "civ-24": { title: "現代の民主政治・国会", pages: [48, 49] },
  "civ-25": { title: "内閣・裁判所・三権分立", pages: [50, 51] },
  "civ-26": { title: "地方自治", pages: [52, 53] },
  "civ-27": { title: "わたしたちのくらしと経済", pages: [54, 55] },
  "civ-28": { title: "国民生活と福祉", pages: [56, 57] },
  "civ-29": { title: "国際社会と世界平和", pages: [58, 59] }
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadScript(context, relativePath) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, relativePath), "utf8"), context, { filename: relativePath });
}

function normalized(value) {
  return String(value).normalize("NFKC").toLowerCase().replace(/[\s\u3000「」『』（）()【】［］\[\]、。・,.:：;；!！?？―ー_-]/g, "");
}

const window = { QUIZ_PACKS: {}, QUIZ_QUESTIONS: [] };
const context = vm.createContext({ window, console });
loadScript(context, "data/challenge-social-civics-config.js");
loadScript(context, "data/challenge-social-civics.js");

const pack = window.QUIZ_PACKS[PACK_ID];
const questions = window.QUIZ_QUESTIONS.filter((question) => question.packId === PACK_ID);
assert(pack, "civics pack config must be registered");
assert(pack.sessionSize === 8 && pack.cornerRouteParam === "unit", "civics pack session or routing is wrong");
assert(pack.corners.length === 8 && pack.corners.every((corner) => corner.enabled), "all eight civics units must be enabled");
assert(questions.length === 192, `expected 192 questions, got ${questions.length}`);

const ids = new Set();
const prompts = new Set();
const answerPositions = { core: new Set(), challenge: new Set() };
const referencedFacts = {};
const tiers = { core: 0, challenge: 0, final: 0 };
const perUnit = {};
let figureCount = 0;

questions.forEach((question) => {
  const meta = UNIT_META[question.unitId];
  assert(meta, `${question.id}: unsupported unit`);
  ["id", "unitId", "cornerId", "tier", "prompt", "explanation", "paperRef", "sourceFactIds", "retrievalDirection", "examSkill", "formatTag"].forEach(
    (field) => assert(question[field], `${question.id || "unknown"}: missing ${field}`)
  );
  assert(/^challenge-civ-\d{2}-\d{3}$/.test(question.id), `${question.id}: malformed id`);
  assert(!ids.has(question.id), `${question.id}: duplicate id`);
  ids.add(question.id);
  assert(question.cornerId === question.unitId, `${question.id}: incorrect routing`);
  assert(question.subject === "社会" && question.unit === meta.title, `${question.id}: incorrect subject or title`);
  assert(question.sourceTag === "challenge-social-civics-original", `${question.id}: wrong source tag`);
  assert(question.qualityStatus === "independently-reviewed" && question.contentStatus === "content-final", `${question.id}: review status missing`);
  assert(Object.hasOwn(tiers, question.tier), `${question.id}: unsupported tier`);
  tiers[question.tier] += 1;
  perUnit[question.unitId] ||= { total: 0, core: 0, challenge: 0, final: 0, figures: 0, tables: 0, diagrams: 0, inputs: 0 };
  perUnit[question.unitId].total += 1;
  perUnit[question.unitId][question.tier] += 1;
  assert(question.prompt.length >= 16 && question.explanation.length >= 12, `${question.id}: prompt or explanation is too thin`);
  const promptKey = normalized(question.prompt);
  assert(!prompts.has(promptKey), `${question.id}: duplicate prompt`);
  prompts.add(promptKey);
  assert(Array.isArray(question.mistakeTags) && question.mistakeTags.length >= 2, `${question.id}: mistake tags required`);
  assert(Array.isArray(question.sourceFactIds) && question.sourceFactIds.length > 0, `${question.id}: source facts required`);
  referencedFacts[question.unitId] ||= new Set();
  question.sourceFactIds.forEach((factId) => {
    assert(new RegExp(`^${question.unitId}-f\\d{2}$`).test(factId), `${question.id}: malformed fact id ${factId}`);
    referencedFacts[question.unitId].add(factId);
  });
  const pages = Array.from(String(question.paperRef).matchAll(/p\.(\d+)/g), (match) => Number(match[1]));
  assert(pages.length > 0 && pages.every((page) => meta.pages.includes(page)), `${question.id}: paperRef outside its unit`);

  if (question.type === "input") {
    perUnit[question.unitId].inputs += 1;
    assert(question.tier === "final", `${question.id}: input must be final tier`);
    assert(Array.isArray(question.answerText) && question.answerText.length > 0, `${question.id}: input answers missing`);
    assert(!question.choices && question.answer === undefined, `${question.id}: input contains choice fields`);
    question.answerText.forEach((answer) => {
      assert(normalized(answer).length >= 2, `${question.id}: answer is too short`);
      assert(!promptKey.includes(normalized(answer)), `${question.id}: answer is exposed in the prompt`);
    });
  } else {
    assert(question.type === "choice" && question.tier !== "final", `${question.id}: choice tier/type mismatch`);
    assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}: four choices required`);
    assert(new Set(question.choices.map(normalized)).size === 4, `${question.id}: duplicate choices`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer index`);
    answerPositions[question.tier].add(question.answer);
  }

  if (question.figure) {
    assert(question.tier === "challenge", `${question.id}: figures belong in challenge tier`);
    assert(["table", "diagram"].includes(question.figure.kind), `${question.id}: unsupported civics figure`);
    assert(question.figure.alt && question.figure.caption, `${question.id}: figure accessibility text missing`);
    assert(!question.figure.src && !question.figure.url && !question.figure.image, `${question.id}: source or external image is forbidden`);
    if (question.figure.kind === "table") {
      assert(Array.isArray(question.figure.columns) && question.figure.columns.length >= 2, `${question.id}: table columns missing`);
      assert(Array.isArray(question.figure.rows) && question.figure.rows.length >= 2, `${question.id}: table rows missing`);
      question.figure.rows.forEach((row) => assert(row.length === question.figure.columns.length, `${question.id}: table row width mismatch`));
      perUnit[question.unitId].tables += 1;
    }
    if (question.figure.kind === "diagram") {
      const width = Number(question.figure.width);
      const height = Number(question.figure.height);
      assert(width > 0 && width <= 390 && height > 0 && height <= 240, `${question.id}: unsafe diagram dimensions`);
      const nodes = question.figure.nodes || [];
      const nodeIds = new Set(nodes.map((node) => node.id));
      assert(nodes.length >= 2 && nodes.length <= 8 && nodeIds.size === nodes.length, `${question.id}: invalid diagram nodes`);
      nodes.forEach((node) => assert(Number(node.x) >= 0 && Number(node.y) >= 0 && Number(node.x) + Number(node.width) <= width && Number(node.y) + Number(node.height) <= height, `${question.id}: node outside diagram`));
      (question.figure.edges || []).forEach((edge) => assert(nodeIds.has(edge.from) && nodeIds.has(edge.to), `${question.id}: diagram edge has unknown node`));
      perUnit[question.unitId].diagrams += 1;
    }
    perUnit[question.unitId].figures += 1;
    figureCount += 1;
  }
});

assert(JSON.stringify(tiers) === JSON.stringify({ core: 64, challenge: 64, final: 64 }), "tiers must be 64/64/64");
Object.keys(UNIT_META).forEach((unitId) => {
  const count = perUnit[unitId];
  assert(count.total === 24 && count.core === 8 && count.challenge === 8 && count.final === 8, `${unitId}: question tier counts are wrong`);
  assert(count.inputs === 8, `${unitId}: eight direct-input questions required`);
  assert(count.figures === 3 && count.tables + count.diagrams === 3, `${unitId}: three original figures required`);
  assert(referencedFacts[unitId].size >= 9, `${unitId}: source coverage is too narrow`);
});
assert(figureCount === 24, `expected 24 original figures, got ${figureCount}`);
assert(answerPositions.core.size === 4 && answerPositions.challenge.size === 4, "answer positions must use all four slots");

const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
assert(indexSource.includes("challenge-social-civics-config.js") && indexSource.includes("challenge-social-civics.js"), "civics scripts are not loaded");
assert(appSource.includes('id: "challenge-social-civics"'), "civics module is not wired");

const reviewPath = path.join(ROOT, "reports", "civics-independent-review.json");
assert(fs.existsSync(reviewPath), "independent civics review report is missing");
const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
assert(review.status === "PASS" && review.questionsReviewed === questions.length, "independent review did not pass all questions");
assert(Array.isArray(review.unresolvedIssues) && review.unresolvedIssues.length === 0, "independent review has unresolved issues");
const reviewedIds = new Set(review.reviewedQuestionIds || []);
(review.reviewedRanges || []).forEach(({ unitId, start, end }) => {
  for (let index = Number(start); index <= Number(end); index += 1) {
    reviewedIds.add(`challenge-${unitId}-${String(index).padStart(3, "0")}`);
  }
});
questions.forEach((question) => assert(reviewedIds.has(question.id), `${question.id}: absent from review report`));

const libraryIndex = process.argv.indexOf("--library");
if (libraryIndex >= 0) {
  const library = path.resolve(process.argv[libraryIndex + 1] || "");
  assert(fs.existsSync(path.join(library, "page_map.csv")), "private civics library is incomplete");
  Object.keys(UNIT_META).forEach((unitId) => {
    const facts = JSON.parse(fs.readFileSync(path.join(library, "facts", `${unitId}.json`), "utf8"));
    assert(facts.status === "independently-reviewed", `${unitId}: facts are not independently reviewed`);
    const verified = Array.isArray(facts.verified_facts) ? facts.verified_facts : [];
    const verifiedIds = new Set(verified.map((fact) => fact.id));
    referencedFacts[unitId].forEach((factId) => assert(verifiedIds.has(factId), `${unitId}: missing fact ${factId}`));
    verifiedIds.forEach((factId) => assert(referencedFacts[unitId].has(factId), `${unitId}: uncovered fact ${factId}`));
  });
}

console.log(JSON.stringify({ packId: PACK_ID, units: 8, questions: questions.length, tiers, perUnit, originalFigures: figureCount, status: "PASS" }, null, 2));
