const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const PACK_ID = "challenge-social-history";
const UNIT_META = {
  "his-13": { title: "文明のおこりと日本の成り立ち", pages: [26, 27] },
  "his-14": { title: "古代国家の成立と東アジア", pages: [28, 29] },
  "his-15": { title: "中世の日本", pages: [30, 31] },
  "his-16": { title: "ヨーロッパ人との出会いと天下統一", pages: [32, 33] },
  "his-17": { title: "近世の日本", pages: [34, 35] },
  "his-18": { title: "近代ヨーロッパと日本の開国", pages: [36, 37] },
  "his-19": { title: "近代の日本", pages: [38, 39] },
  "his-20": { title: "二度の世界大戦と日本", pages: [40, 41] },
  "his-21": { title: "現代の日本と世界", pages: [42, 43] }
};
const SCAFFOLD_ONLY = process.argv.includes("--scaffold-check");
const PRE_REVIEW = process.argv.includes("--pre-review");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadScript(context, relativePath) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  vm.runInContext(source, context, { filename: relativePath });
}

function normalized(value) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000「」『』（）()【】［］\[\]、。・,.:：;；!！?？―ー_-]/g, "");
}

const window = { QUIZ_PACKS: {}, QUIZ_QUESTIONS: [] };
const context = vm.createContext({ window, console });
loadScript(context, "data/challenge-social-history-config.js");
const pack = window.QUIZ_PACKS[PACK_ID];

assert(pack, "history pack config must be registered");
assert(pack.cornerRouteParam === "unit", "pack must use the unit query parameter");
assert(pack.sessionSize === 8, "session size must be eight");
assert(JSON.stringify(pack.tierCounts) === JSON.stringify({ core: 8, challenge: 8, final: 8 }), "tier counts must be 8/8/8");
assert(Array.isArray(pack.corners) && pack.corners.length === 9, "nine history units are required");

pack.corners.forEach((corner, index) => {
  const number = index + 13;
  const expectedId = `his-${number}`;
  const meta = UNIT_META[expectedId];
  assert(corner.id === expectedId, `corner ${number}: wrong unit id`);
  assert(corner.label && corner.description, `${expectedId}: label and description are required`);
  assert(corner.description.includes(`p.${meta.pages[0]}-${meta.pages[1]}`), `${expectedId}: wrong printed page reference`);
  if (SCAFFOLD_ONLY) {
    assert(corner.enabled === false, `${expectedId}: scaffold units must remain unavailable`);
    assert(corner.statusLabel === "準備中", `${expectedId}: scaffold needs a preparation label`);
  } else {
    assert(corner.enabled === true, `${expectedId}: reviewed unit must be enabled`);
    assert(JSON.stringify(corner.tierCounts) === JSON.stringify({ core: 8, challenge: 8, final: 8 }), `${expectedId}: tier counts must be 8/8/8`);
  }
});

if (SCAFFOLD_ONLY) {
  console.log(JSON.stringify({ packId: PACK_ID, units: 9, questions: 0, status: "SCAFFOLD PASS" }, null, 2));
  process.exit(0);
}

Object.keys(UNIT_META).forEach((unitId) => loadScript(context, `data/challenge-social-history-${unitId}.js`));
loadScript(context, "data/challenge-social-history-normalize.js");
const questions = window.QUIZ_QUESTIONS.filter((question) => question.packId === PACK_ID);
assert(questions.length === 216, `expected 216 questions, got ${questions.length}`);

const ids = new Set();
const prompts = new Set();
const tiers = { core: 0, challenge: 0, final: 0 };
const perUnit = {};
const referencedFacts = {};
const answerPositions = { core: new Set(), challenge: new Set() };
let figureCount = 0;

questions.forEach((question) => {
  const meta = UNIT_META[question.unitId];
  assert(meta, `${question.id || "unknown"}: unsupported unit`);
  ["id", "packId", "cornerId", "unitId", "subject", "unit", "tier", "paperRef", "prompt", "explanation", "sourceFactIds", "retrievalDirection", "sourceTag", "qualityStatus", "contentStatus", "examSkill", "formatTag"].forEach(
    (field) => assert(question[field], `${question.id || "unknown"}: missing ${field}`)
  );
  assert(question.id.startsWith(`challenge-${question.unitId}-`) && /-\d{3}$/.test(question.id), `${question.id}: invalid id`);
  assert(!ids.has(question.id), `${question.id}: duplicate id`);
  ids.add(question.id);
  assert(question.cornerId === question.unitId, `${question.id}: wrong unit routing`);
  assert(question.subject === "社会" && question.unit === meta.title, `${question.id}: wrong subject or unit`);
  assert(Object.hasOwn(tiers, question.tier), `${question.id}: unsupported tier`);
  tiers[question.tier] += 1;
  perUnit[question.unitId] ||= {
    total: 0, core: 0, challenge: 0, final: 0, figures: 0, inputs: 0,
    timelineFigures: 0, spatialFigures: 0, sequenceSkills: 0, causeSkills: 0, comparisonSkills: 0
  };
  perUnit[question.unitId].total += 1;
  perUnit[question.unitId][question.tier] += 1;
  referencedFacts[question.unitId] ||= new Set();
  assert(Array.isArray(question.sourceFactIds) && question.sourceFactIds.length > 0, `${question.id}: source facts required`);
  question.sourceFactIds.forEach((factId) => {
    assert(new RegExp(`^${question.unitId}-f\\d{2}$`).test(factId), `${question.id}: malformed source fact ${factId}`);
    referencedFacts[question.unitId].add(factId);
  });
  const pages = Array.from(String(question.paperRef).matchAll(/p\.(\d+)/g), (match) => Number(match[1]));
  assert(pages.length > 0 && pages.every((page) => meta.pages.includes(page)), `${question.id}: paperRef points outside its unit`);
  assert(question.sourceTag === "challenge-social-history-original", `${question.id}: wrong source tag`);
  if (!PRE_REVIEW) assert(question.qualityStatus === "independent-review-passed", `${question.id}: independent review is not recorded`);
  assert(question.contentStatus === "content-final", `${question.id}: content is not final`);
  assert(Array.isArray(question.mistakeTags) && question.mistakeTags.length >= 2, `${question.id}: mistake tags required`);
  assert(question.prompt.length >= 18 && question.explanation.length >= 35, `${question.id}: prompt or explanation is too thin`);
  const promptKey = normalized(question.prompt);
  assert(!prompts.has(promptKey), `${question.id}: duplicate prompt`);
  prompts.add(promptKey);
  const direction = String(question.retrievalDirection);
  const skillSignature = `${direction} ${question.examSkill} ${question.formatTag} ${question.prompt}`;
  if (/(timeline|sequence|chronolog|order|before|after|年代|順序|前後)/i.test(skillSignature)) perUnit[question.unitId].sequenceSkills += 1;
  if (/(cause|effect|reason|impact|background|因果|理由|背景|原因|ため)/i.test(skillSignature)) perUnit[question.unitId].causeSkills += 1;
  if (/(compar|contrast|difference|共通|比較|違い|比べ)/i.test(skillSignature)) perUnit[question.unitId].comparisonSkills += 1;

  if (question.type === "input") {
    perUnit[question.unitId].inputs += 1;
    assert(question.tier === "final", `${question.id}: direct input must be final tier`);
    assert(Array.isArray(question.answerText) && question.answerText.length > 0, `${question.id}: answerText required`);
    assert(!question.choices && question.answer === undefined, `${question.id}: input must not carry choices`);
    question.answerText.forEach((answer) => {
      assert(String(answer).trim() === String(answer) && normalized(answer).length >= 2, `${question.id}: invalid input answer`);
      assert(!promptKey.includes(normalized(answer)), `${question.id}: answer appears in prompt`);
    });
  } else {
    assert(question.type === "choice", `${question.id}: unsupported question type`);
    assert(question.tier !== "final", `${question.id}: final tier must use direct input`);
    assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}: four choices required`);
    assert(new Set(question.choices.map(normalized)).size === 4, `${question.id}: duplicate choice`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer index`);
    answerPositions[question.tier].add(question.answer);
  }

  if (question.figure) {
    assert(["timeline", "map", "diagram"].includes(question.figure.kind), `${question.id}: unsupported figure kind`);
    assert(question.figure.alt && question.figure.caption, `${question.id}: figure needs alt and caption`);
    assert(!question.figure.src && !question.figure.url && !question.figure.image, `${question.id}: external or source image is forbidden`);
    if (question.figure.kind === "timeline") {
      assert(Array.isArray(question.figure.events) && question.figure.events.length >= 3 && question.figure.events.length <= 8, `${question.id}: timeline needs 3-8 events`);
      question.figure.events.forEach((event) => assert(event.year && (event.label || event.text), `${question.id}: incomplete timeline event`));
    }
    if (question.figure.kind === "diagram") {
      const width = Number(question.figure.width);
      const height = Number(question.figure.height);
      assert(width > 0 && width <= 360 && height > 0 && height <= 240, `${question.id}: diagram size is unsafe`);
      const nodes = Array.isArray(question.figure.nodes) ? question.figure.nodes : [];
      const nodeIds = new Set();
      assert(nodes.length >= 2 && nodes.length <= 8, `${question.id}: diagram needs 2-8 nodes`);
      nodes.forEach((node) => {
        assert(node.id && !nodeIds.has(node.id), `${question.id}: duplicate or missing diagram node id`);
        nodeIds.add(node.id);
        const x = Number(node.x); const y = Number(node.y);
        const nodeWidth = Number(node.width); const nodeHeight = Number(node.height);
        assert(x >= 0 && y >= 0 && nodeWidth > 0 && nodeHeight > 0 && x + nodeWidth <= width && y + nodeHeight <= height, `${question.id}: diagram node is outside viewBox`);
        assert(node.label || node.text, `${question.id}: diagram node label required`);
      });
      const edges = Array.isArray(question.figure.edges) ? question.figure.edges : [];
      assert(edges.length >= 1, `${question.id}: diagram edges required`);
      edges.forEach((edge) => assert(nodeIds.has(edge.from) && nodeIds.has(edge.to), `${question.id}: diagram edge refers to unknown node`));
    }
    if (question.figure.kind === "map") {
      const width = Number(question.figure.width);
      const height = Number(question.figure.height);
      assert(width > 0 && width <= 360 && height > 0 && height <= 240, `${question.id}: map size is unsafe`);
      assert(Array.isArray(question.figure.labels), `${question.id}: map labels required`);
      const regions = Array.isArray(question.figure.regions) ? question.figure.regions : [];
      const lines = Array.isArray(question.figure.gridLines) ? question.figure.gridLines : [];
      assert(regions.length + lines.length > 0, `${question.id}: map geometry is empty`);
      question.figure.labels.forEach((label) => assert(Number(label.x) >= 0 && Number(label.x) <= width && Number(label.y) >= 0 && Number(label.y) <= height, `${question.id}: map label outside viewBox`));
    }
    perUnit[question.unitId].figures += 1;
    if (question.figure.kind === "timeline") perUnit[question.unitId].timelineFigures += 1;
    if (["map", "diagram"].includes(question.figure.kind)) perUnit[question.unitId].spatialFigures += 1;
    figureCount += 1;
  }
});

assert(tiers.core === 72 && tiers.challenge === 72 && tiers.final === 72, "tier counts must be 72/72/72");
Object.keys(UNIT_META).forEach((unitId) => {
  const counts = perUnit[unitId];
  assert(counts?.total === 24, `${unitId}: expected 24 questions`);
  assert(counts.core === 8 && counts.challenge === 8 && counts.final === 8, `${unitId}: tier counts must be 8/8/8`);
  assert(counts.inputs === 8, `${unitId}: final must contain eight input questions`);
  assert(counts.figures === 3, `${unitId}: expected three original figures`);
  assert(counts.timelineFigures >= 1, `${unitId}: an original timeline question is required`);
  assert(counts.spatialFigures >= 1, `${unitId}: an original map or relationship diagram is required`);
  assert(counts.sequenceSkills >= 1, `${unitId}: sequence reasoning is missing`);
  assert(counts.causeSkills >= 1, `${unitId}: cause-and-effect reasoning is missing`);
  assert(counts.comparisonSkills >= 1, `${unitId}: comparison reasoning is missing`);
});
assert(figureCount === 27, `expected twenty-seven original figures, got ${figureCount}`);
assert(answerPositions.core.size >= 3, "core answer positions are too predictable");
assert(answerPositions.challenge.size >= 3, "challenge answer positions are too predictable");

const appSource = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
assert(appSource.includes('figure.kind === "timeline"'), "timeline renderer is not wired");
assert(appSource.includes('figure.kind === "diagram"'), "diagram renderer is not wired");
assert(appSource.includes('id: "challenge-social-history"'), "history module card is not wired");
assert(indexSource.includes("challenge-social-history-config.js"), "history config script is not loaded");
Object.keys(UNIT_META).forEach((unitId) => assert(indexSource.includes(`challenge-social-history-${unitId}.js`), `${unitId}: question script is not loaded`));

if (!PRE_REVIEW) {
  const independentReviewPath = path.join(ROOT, "reports", "history-independent-review.json");
  assert(fs.existsSync(independentReviewPath), "independent history question review report is missing");
  const independentReview = JSON.parse(fs.readFileSync(independentReviewPath, "utf8"));
  assert(independentReview.status === "PASS", "independent history question review did not pass");
  assert(Number(independentReview.questionsReviewed) === questions.length, "independent review question count mismatch");
  assert(Array.isArray(independentReview.unresolvedIssues) && independentReview.unresolvedIssues.length === 0, "independent review still has unresolved issues");
  const independentlyReviewedIds = new Set(independentReview.reviewedQuestionIds || []);
  questions.forEach((question) => assert(independentlyReviewedIds.has(question.id), `${question.id}: missing from independent review report`));
}

const libraryIndex = process.argv.indexOf("--library");
if (libraryIndex >= 0) {
  const library = path.resolve(process.argv[libraryIndex + 1] || "");
  assert(fs.existsSync(path.join(library, "page_map.csv")), "private history library is incomplete");
  Object.keys(UNIT_META).forEach((unitId) => {
    const factsPath = path.join(library, "facts", `${unitId}.json`);
    assert(fs.existsSync(factsPath), `private history library is missing ${unitId} facts`);
    const facts = JSON.parse(fs.readFileSync(factsPath, "utf8"));
    assert(facts.status === "independently-reviewed", `${unitId}: facts are not independently reviewed`);
    const verifiedFacts = Array.isArray(facts.verified_facts) ? facts.verified_facts : [];
    assert(verifiedFacts.length >= 20, `${unitId}: fewer than twenty verified facts`);
    const verifiedIds = new Set(verifiedFacts.map((fact) => fact.id));
    referencedFacts[unitId].forEach((factId) => assert(verifiedIds.has(factId), `${unitId}: question uses unknown fact ${factId}`));
    verifiedIds.forEach((factId) => assert(referencedFacts[unitId].has(factId), `${unitId}: verified fact ${factId} is not covered by a question`));
  });
}

console.log(JSON.stringify({ packId: PACK_ID, units: 9, questions: questions.length, tiers, perUnit, originalFigures: figureCount, status: "PASS" }, null, 2));
