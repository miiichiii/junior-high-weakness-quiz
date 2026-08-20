const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const PACK_ID = "challenge-social-geography";
const UNIT_META = {
  "geo-01": { title: "世界の地域構成", pages: [2, 3], factCount: 14 },
  "geo-02": { title: "日本の地域構成", pages: [4, 5], factCount: 15 },
  "geo-03": { title: "世界の人々の生活と環境", pages: [6, 7], factCount: 15 },
  "geo-04": { title: "アジア州", pages: [8, 9], factCount: 15 },
  "geo-05": { title: "ヨーロッパ州・アフリカ州", pages: [10, 11], factCount: 15 },
  "geo-06": { title: "南北アメリカ州・オセアニア州", pages: [12, 13], factCount: 15 },
  "geo-07": { title: "地域調査の手法", pages: [14, 15], factCount: 15 },
  "geo-08": { title: "世界から見た日本の自然・人口", pages: [16, 17], factCount: 15 },
  "geo-09": { title: "世界と日本の資源・産業・結びつき", pages: [18, 19], factCount: 15 },
  "geo-10": { title: "九州地方、中国・四国地方", pages: [20, 21], factCount: 15 },
  "geo-11": { title: "近畿地方・中部地方", pages: [22, 23], factCount: 15 },
  "geo-12": { title: "関東地方・東北地方・北海道地方", pages: [24, 25], factCount: 15 }
};
Object.entries(UNIT_META).forEach(([unitId, meta]) => {
  meta.factIds = new Set(Array.from(
    { length: meta.factCount },
    (_, index) => `${unitId}-f${String(index + 1).padStart(2, "0")}`
  ));
});

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
loadScript(context, "data/challenge-social-geography-config.js");
loadScript(context, "data/challenge-social-geography.js");
loadScript(context, "data/challenge-social-geography-geo-02.js");
loadScript(context, "data/challenge-social-geography-geo-03.js");
loadScript(context, "data/challenge-social-geography-geo-04.js");
loadScript(context, "data/challenge-social-geography-geo-05.js");
loadScript(context, "data/challenge-social-geography-geo-06.js");
loadScript(context, "data/challenge-social-geography-geo-07.js");
loadScript(context, "data/challenge-social-geography-geo-08.js");
loadScript(context, "data/challenge-social-geography-geo-09.js");
loadScript(context, "data/challenge-social-geography-geo-10.js");
loadScript(context, "data/challenge-social-geography-geo-11.js");
loadScript(context, "data/challenge-social-geography-geo-12.js");

const pack = window.QUIZ_PACKS[PACK_ID];
const questions = window.QUIZ_QUESTIONS.filter((question) => question.packId === PACK_ID);
assert(pack, "geography pack config must be registered");
assert(pack.cornerRouteParam === "unit", "pack must use the unit query parameter");
assert(pack.sessionSize === 5, "session size must be five");
assert(pack.maxEnabled === false, "MAX tier must be disabled for the pilot");
assert(pack.mastery?.correctSessions === 2, "mastery must require correct answers in two sessions");
assert(pack.mastery?.cooldownAnswers === 5, "wrong answers must wait five answers before review");
assert(Array.isArray(pack.corners) && pack.corners.length === 12, "twelve geography units are required");
pack.corners.forEach((corner, index) => {
  const expectedId = `geo-${String(index + 1).padStart(2, "0")}`;
  assert(corner.id === expectedId, `corner ${index + 1}: wrong unit id`);
  assert(corner.label && corner.description, `${corner.id}: label and description are required`);
  if (index < 12) {
    assert(corner.enabled === true, `${corner.id} must be enabled`);
    assert(JSON.stringify(corner.tierCounts) === JSON.stringify({ core: 5, challenge: 5, final: 5 }), `${corner.id} tier counts must be 5/5/5`);
  } else {
    assert(corner.enabled === false, `${corner.id}: future unit must be disabled`);
    assert(corner.statusLabel === "準備中", `${corner.id}: future unit needs a preparation label`);
  }
});

assert(questions.length === 180, `expected 180 questions, got ${questions.length}`);
const required = [
  "id", "packId", "cornerId", "unitId", "subject", "unit", "tier", "priority", "difficulty",
  "stage", "formatTag", "examSkill", "sourceTag", "qualityStatus", "contentStatus", "paperRef",
  "prompt", "explanation", "retrievalDirection", "variantGroup"
];
const ids = new Set();
const prompts = new Set();
const tiers = { core: 0, challenge: 0, final: 0 };
const choiceAnswerPositions = { core: new Set(), challenge: new Set() };
const perUnit = {};
let mapCount = 0;

questions.forEach((question) => {
  const unitMeta = UNIT_META[question.unitId];
  assert(unitMeta, `${question.id || "unknown"}: unsupported unit ${question.unitId}`);
  required.forEach((field) => assert(question[field], `${question.id || "unknown"}: missing ${field}`));
  assert(question.id.startsWith(`challenge-${question.unitId}-`) && /-\d{3}$/.test(question.id), `${question.id}: invalid id`);
  assert(!ids.has(question.id), `${question.id}: duplicate id`);
  ids.add(question.id);
  assert(question.cornerId === question.unitId, `${question.id}: wrong unit routing`);
  assert(question.subject === "社会" && question.unit === unitMeta.title, `${question.id}: wrong subject or unit`);
  assert(Object.hasOwn(tiers, question.tier), `${question.id}: unsupported tier`);
  tiers[question.tier] += 1;
  perUnit[question.unitId] ||= { total: 0, core: 0, challenge: 0, final: 0, maps: 0, inputs: 0 };
  perUnit[question.unitId].total += 1;
  perUnit[question.unitId][question.tier] += 1;
  assert(Array.isArray(question.sourceFactIds) && question.sourceFactIds.length >= 1, `${question.id}: sourceFactIds required`);
  question.sourceFactIds.forEach((factId) => assert(unitMeta.factIds.has(factId), `${question.id}: unknown fact ${factId}`));
  const referencedPages = Array.from(String(question.paperRef).matchAll(/p\.(\d+)/g), (match) => Number(match[1]));
  assert(referencedPages.length >= 1 && referencedPages.every((page) => unitMeta.pages.includes(page)), `${question.id}: paperRef points outside its unit`);
  assert(question.sourceTag === "challenge-social-geography-original", `${question.id}: wrong source tag`);
  assert(question.qualityStatus === "content-audited" && question.contentStatus === "content-final", `${question.id}: content is not audited/final`);
  assert(Array.isArray(question.mistakeTags) && question.mistakeTags.length >= 2, `${question.id}: mistake tags required`);
  assert(question.prompt.length >= 18 && question.explanation.length >= 35, `${question.id}: prompt or explanation is too thin`);
  const promptKey = normalized(question.prompt);
  assert(!prompts.has(promptKey), `${question.id}: duplicate prompt`);
  prompts.add(promptKey);

  if (question.type === "input") {
    perUnit[question.unitId].inputs += 1;
    assert(question.tier === "final", `${question.id}: direct input must be final tier`);
    assert(Array.isArray(question.answerText) && question.answerText.length >= 1, `${question.id}: answerText required`);
    assert(!question.choices && question.answer === undefined, `${question.id}: input must not carry choices`);
    question.answerText.forEach((answer) => {
      assert(answer.trim() === answer && answer.length >= 2, `${question.id}: invalid answer variant`);
      assert(!promptKey.includes(normalized(answer)), `${question.id}: answer appears in prompt`);
    });
  } else {
    assert(question.type === "choice", `${question.id}: unsupported question type`);
    assert(question.tier !== "final", `${question.id}: final tier must use direct input`);
    assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}: four choices required`);
    assert(new Set(question.choices.map(normalized)).size === 4, `${question.id}: duplicate choice`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer index`);
    choiceAnswerPositions[question.tier].add(question.answer);
  }

  if (question.figure) {
    assert(question.figure.kind === "map", `${question.id}: pilot figures must use the map renderer`);
    assert(question.figure.alt && question.figure.caption, `${question.id}: map needs alt and caption`);
    assert(!question.figure.src && !question.figure.url && !question.figure.image, `${question.id}: external or source image is forbidden`);
    assert(Array.isArray(question.figure.labels), `${question.id}: map labels are required`);
    assert(question.figure.width > 0 && question.figure.width <= 360, `${question.id}: map width must fit the mobile renderer`);
    assert(question.figure.height > 0 && question.figure.height <= 240, `${question.id}: map height is outside the supported range`);
    const regions = Array.isArray(question.figure.regions) ? question.figure.regions : [];
    const lines = Array.isArray(question.figure.gridLines) ? question.figure.gridLines : [];
    assert(regions.length + lines.length > 0, `${question.id}: map geometry is empty`);
    question.figure.labels.forEach((label) => {
      assert(label.x >= 0 && label.x <= question.figure.width, `${question.id}: map label x is outside the viewBox`);
      assert(label.y >= 0 && label.y <= question.figure.height, `${question.id}: map label y is outside the viewBox`);
    });
    [...regions, ...lines].forEach((shape) => {
      (shape.points || []).forEach(([x, y]) => {
        assert(x >= 0 && x <= question.figure.width, `${question.id}: map point x is outside the viewBox`);
        assert(y >= 0 && y <= question.figure.height, `${question.id}: map point y is outside the viewBox`);
      });
    });
    mapCount += 1;
    perUnit[question.unitId].maps += 1;
  }
});

assert(tiers.core === 60 && tiers.challenge === 60 && tiers.final === 60, "tier counts must be 60/60/60");
Object.keys(UNIT_META).forEach((unitId) => {
  const counts = perUnit[unitId];
  assert(counts?.total === 15, `${unitId}: expected 15 questions`);
  assert(counts.core === 5 && counts.challenge === 5 && counts.final === 5, `${unitId}: tier counts must be 5/5/5`);
  assert(counts.inputs === 5, `${unitId}: final must contain five input questions`);
  assert(counts.maps === 3, `${unitId}: expected three original map questions`);
});
assert(mapCount === 36, `expected thirty-six original map questions, got ${mapCount}`);
assert(choiceAnswerPositions.core.size >= 3, "core answer positions are too predictable");
assert(choiceAnswerPositions.challenge.size >= 3, "challenge answer positions are too predictable");

const appSource = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
assert(appSource.includes('figure.kind === "map"'), "app map renderer is not wired");
assert(appSource.includes("PACK_UNIT_ROUTE_PARAM"), "unit route parameter is not implemented");
assert(appSource.includes("record.packLastCorrectSessionId !== state.packSessionId"), "mastery must count separate sessions only");
assert(appSource.includes("sourceFactIds: Array.isArray(question.sourceFactIds)"), "review snapshots must retain source fact ids");
assert(appSource.includes("retrievalDirection: question.retrievalDirection"), "review snapshots must retain retrieval direction");
assert(indexSource.includes("challenge-social-geography-config.js"), "geography config script is not loaded");
assert(indexSource.includes("challenge-social-geography.js"), "geography questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-02.js"), "geo-02 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-03.js"), "geo-03 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-04.js"), "geo-04 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-05.js"), "geo-05 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-06.js"), "geo-06 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-07.js"), "geo-07 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-08.js"), "geo-08 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-09.js"), "geo-09 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-10.js"), "geo-10 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-11.js"), "geo-11 questions script is not loaded");
assert(indexSource.includes("challenge-social-geography-geo-12.js"), "geo-12 questions script is not loaded");

const libraryIndex = process.argv.indexOf("--library");
if (libraryIndex >= 0) {
  const library = path.resolve(process.argv[libraryIndex + 1] || "");
  const pageMapPath = path.join(library, "page_map.csv");
  assert(fs.existsSync(pageMapPath), "private library is incomplete");
  Object.entries(UNIT_META).forEach(([unitId, meta]) => {
    const factsPath = path.join(library, "facts", `${unitId}.json`);
    assert(fs.existsSync(factsPath), `private library is missing ${unitId} facts`);
    const facts = JSON.parse(fs.readFileSync(factsPath, "utf8"));
    assert(facts.status === "visually-verified", `${unitId} facts must be visually verified`);
    const verifiedIds = new Set((facts.verified_facts || []).map((fact) => fact.id));
    meta.factIds.forEach((factId) => assert(verifiedIds.has(factId), `private library is missing ${factId}`));
  });
}

console.log(JSON.stringify({
  packId: PACK_ID,
  units: pack.corners.length,
  enabledUnits: pack.corners.filter((corner) => corner.enabled !== false).length,
  questions: questions.length,
  tiers,
  perUnit,
  originalMaps: mapCount,
  status: "PASS"
}, null, 2));
