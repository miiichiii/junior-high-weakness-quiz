#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const PACK_ID = "social-author-drill";
const TERM_PACK_ID = "term-2026-07-13";
const CACHE_KEY = "20260723-kanji-fair-review-v1";
const APP_CACHE_KEY = "20260820-eldest-alias-v1";
const STYLE_CACHE_KEY = "20260820-eldest-alias-v1";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadScript(context, relativePath) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  vm.runInContext(source, context, { filename: relativePath });
}

function normalized(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000「」『』（）()【】［］\[\]、。・,.:：;；!！?？―ー_\-/]/g, "");
}

function extractFunctionSource(source, name, nextName) {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`function ${nextName}`, start);
  assert(start >= 0 && end > start, `app function ${name} could not be extracted`);
  return source.slice(start, end).trim();
}

const expectedGuideNames = new Map(Object.entries({
  "tsubouchi-shoyo": "坪内逍遥",
  "futabatei-shimei": "二葉亭四迷",
  "higuchi-ichiyo": "樋口一葉",
  "mori-ogai": "森鷗外",
  "natsume-soseki": "夏目漱石",
  "yosano-akiko": "与謝野晶子",
  "ishikawa-takuboku": "石川啄木",
  "shiga-naoya": "志賀直哉",
  "akutagawa-ryunosuke": "芥川龍之介",
  "kobayashi-takiji": "小林多喜二",
  "ki-no-tsurayuki": "紀貫之",
  "murasaki-shikibu": "紫式部",
  "sei-shonagon": "清少納言",
  "kamo-no-chomei": "鴨長明",
  "yoshida-kenko": "兼好法師",
  zeami: "世阿弥",
  "ihara-saikaku": "井原西鶴",
  "matsuo-basho": "松尾芭蕉",
  "chikamatsu-monzaemon": "近松門左衛門",
  "motoori-norinaga": "本居宣長",
  "sugita-genpaku": "杉田玄白",
  "jippensha-ikku": "十返舎一九",
  "kyokutei-bakin": "曲亭馬琴",
  "fukuzawa-yukichi": "福沢諭吉",
  "nakae-chomin": "中江兆民",
  "masaoka-shiki": "正岡子規",
  "shimazaki-toson": "島崎藤村",
  "tayama-katai": "田山花袋",
  "mushanokoji-saneatsu": "武者小路実篤",
  "arishima-takeo": "有島武郎",
  "yanagita-kunio": "柳田國男",
  "nishida-kitaro": "西田幾多郎",
  "kawabata-yasunari": "川端康成"
}));

const expectedNewAnswers = new Map([
  ["031", "紀貫之"], ["032", "紀貫之―勅撰和歌集の選者―『土佐日記』"],
  ["033", "紫式部"], ["034", "清少納言"], ["035", "紫式部―『源氏物語』／清少納言―『枕草子』"],
  ["036", "かな文字が発達し、国風文化が栄えた"], ["037", "鴨長明"], ["038", "兼好法師"], ["039", "鎌倉時代"], ["040", "世阿弥"],
  ["041", "足利義満"], ["042", "井原西鶴"],
  ["043", "松尾芭蕉"], ["044", "近松門左衛門"], ["045", "大阪・京都を中心に上方の町人文化が栄えた"],
  ["046", "本居宣長"], ["047", "杉田玄白"], ["048", "十返舎一九"], ["049", "曲亭馬琴"],
  ["050", "街道や宿場が整い、庶民の旅や伊勢参りが広がった"],
  ["051", "福沢諭吉"], ["052", "中江兆民"], ["053", "欧米の制度や知識を学ぶ文明開化が進んだ"],
  ["054", "国会の開設や憲法の制定を求める自由民権運動"], ["055", "正岡子規"],
  ["056", "松尾芭蕉―江戸時代／正岡子規―明治時代"], ["057", "島崎藤村"], ["058", "田山花袋"],
  ["059", "明治後期―自然主義文学"], ["060", "人間や社会の現実をありのままに描こうとする自然主義文学"], ["061", "武者小路実篤"],
  ["062", "白樺派に属し、『或る女』を書いた"], ["063", "有島武郎"],
  ["064", "有島武郎"], ["065", "柳田国男"], ["066", "西田幾多郎"],
  ["067", "各地の伝承や生活を調べ、日本の民俗学の基礎を築いた"],
  ["068", "西洋の思想を取り入れ、日本で独自の哲学研究が進んだ"], ["069", "川端康成"],
  ["070", "川端康成"],
  ["071", "『方丈記』―鴨長明"], ["072", "『枕草子』→『おくのほそ道』→『学問のすゝめ』"],
  ["073", "大阪・京都の商業が発達し、町人が文化の重要な担い手になった"], ["074", "江戸を中心に庶民文化が栄え、出版や貸本を通じて読み物が広がった"],
  ["075", "国学―日本の古典を研究する／蘭学―オランダ語の書物から西洋の知識を学ぶ"], ["076", "長崎でオランダとの貿易が続き、西洋の書物や知識が入った"],
  ["077", "兼好法師―『徒然草』→松尾芭蕉―『おくのほそ道』→夏目漱石―『坊っちゃん』"],
  ["078", "労働運動や社会運動が広がる一方、政府による取締りも強まった"],
  ["079", "紫式部―『源氏物語』→近松門左衛門―『曽根崎心中』→小林多喜二―『蟹工船』"],
  ["080", "世阿弥―室町時代―能／芥川龍之介―大正時代―『羅生門』／川端康成―昭和時代―『雪国』"]
]);

const window = { QUIZ_PACKS: {}, QUIZ_QUESTIONS: [] };
const context = vm.createContext({ window, console, URL, URLSearchParams });
loadScript(context, "data/term-test-2026-07-13-config.js");
loadScript(context, "data/term-test-2026-07-13-humanities.js");
loadScript(context, "data/term-test-2026-07-13-stem.js");
loadScript(context, "data/social-author-drill-config.js");
loadScript(context, "data/social-author-drill.js");
loadScript(context, "data/social-author-drill-expanded.js");

const pack = window.QUIZ_PACKS[PACK_ID];
const termQuestions = window.QUIZ_QUESTIONS.filter((question) => question.packId === TERM_PACK_ID);
const questions = window.QUIZ_QUESTIONS.filter((question) => question.packId === PACK_ID);
const baseQuestions = questions.filter((question) => Number(question.id.slice(-3)) <= 30);
const expandedQuestions = questions.filter((question) => Number(question.id.slice(-3)) >= 31);

assert(pack, `${PACK_ID}: config was not registered`);
assert(pack.contentVersion === 2, `${PACK_ID}: contentVersion must remain 2 so existing progress survives`);
assert(pack.parentPackId === TERM_PACK_ID, `${PACK_ID}: wrong parent pack`);
assert(pack.sessionSize === 10 && pack.maxEnabled === false, `${PACK_ID}: expected fixed 10-question sessions without MAX`);
assert(pack.tierCounts.core === 30 && pack.tierCounts.challenge === 30 && pack.tierCounts.final === 20, `${PACK_ID}: global tiers must be 30/30/20`);
assert(pack.subjectCounts.total["社会"] === 80, `${PACK_ID}: config total must be 80`);
assert(pack.mastery.distinctDirections === 2 && pack.mastery.distinctSessions === 2, `${PACK_ID}: mastery must require two directions and sessions`);
assert(pack.mastery.requireAuthorInput === true, `${PACK_ID}: existing core authors must retain input mastery`);

const expectedCornerMatrix = {
  "modern-core": { core: 10, challenge: 10, final: 10 },
  classical: { core: 10, challenge: 10, final: 0 },
  "modern-extra": { core: 10, challenge: 10, final: 0 },
  "all-era-mix": { core: 0, challenge: 0, final: 10 }
};
assert(Array.isArray(pack.corners) && pack.corners.length === 4, `${PACK_ID}: expected four selectable corners`);
pack.corners.forEach((corner) => {
  const expected = expectedCornerMatrix[corner.id];
  assert(expected, `${PACK_ID}: unexpected corner ${corner.id}`);
  ["core", "challenge", "final"].forEach((tier) => {
    assert(Number(corner.tierCounts?.[tier] || 0) === expected[tier], `${corner.id}: wrong ${tier} count`);
  });
  assert(corner.label && corner.description, `${corner.id}: incomplete learner-facing copy`);
});

assert(Array.isArray(pack.studyGuide?.items) && pack.studyGuide.items.length === 33, `${PACK_ID}: study guide must have 33 people`);
const guideByKey = new Map();
pack.studyGuide.items.forEach((item, index) => {
  assert(expectedGuideNames.get(item.authorKey) === item.name, `${item.authorKey}: wrong or unknown guide name`);
  assert(!guideByKey.has(item.authorKey), `${item.authorKey}: duplicate guide item`);
  assert(item.period && item.work && item.cue, `${item.authorKey}: guide facts are incomplete`);
  if (index >= 10) assert(item.requireAuthorInput === false, `${item.authorKey}: new person must not require an unavailable direct input`);
  guideByKey.set(item.authorKey, item);
});
assert(guideByKey.size === expectedGuideNames.size, `${PACK_ID}: guide coverage mismatch`);
assert(guideByKey.get("mori-ogai").acceptedAuthorSpellings.includes("森鴎外"), "Mori spelling variant is missing");
assert(guideByKey.get("kyokutei-bakin").acceptedAuthorSpellings.includes("滝沢馬琴"), "Bakin alias is missing");
assert(guideByKey.get("yanagita-kunio").acceptedAuthorSpellings.includes("柳田国男"), "Yanagita modern spelling is missing");

assert(termQuestions.length === 200, `${TERM_PACK_ID}: expected 200 unchanged questions, got ${termQuestions.length}`);
assert(questions.length === 80, `${PACK_ID}: expected 80 questions, got ${questions.length}`);
assert(baseQuestions.length === 30 && expandedQuestions.length === 50, `${PACK_ID}: expected preserved 30 + added 50`);
assert(window.QUIZ_QUESTIONS.length === 280, "combined validation bank must contain 200 term + 80 author questions");

const baselineFields = ["id", "tier", "type", "answerTarget", "authorKey", "retrievalDirection", "examSkill", "formatTag", "mistakeTags", "paperRef", "skills", "prompt", "choices", "answer", "answerText", "placeholder", "explanation"];
const baselineRows = baseQuestions.map((question) => Object.fromEntries(baselineFields.map((key) => [key, question[key] === undefined ? null : question[key]])));
const baselineHash = crypto.createHash("sha256").update(JSON.stringify(baselineRows)).digest("hex");
assert(baselineHash === "71cdcb0fc75655ac0f8fc32a2a8d1d959f7449f1e4cb05952b7b664cc0839e3b", `${PACK_ID}: existing 001-030 content changed`);

const bannedMeta = /(?:この範囲|教材上|説明箇所|学習カード|作品カード|作品札|掲載区分|誤結合|選択肢なし|前方|後方|自力再生|逆向き|操作はどれ|作問|データベース|UI)/i;
const bannedCopiedPoem = /(?:あゝをとうとよ|すめらみこと|旅順の城はほろぶとも)/;
const bannedOutOfScope = /(?:徳永直|宮沢賢治|高村光太郎|太宰治|大江健三郎|個人的な体験)/;
const requiredFields = [
  "id", "subject", "unit", "priority", "stage", "difficulty", "examSkill", "formatTag",
  "sourceTag", "qualityStatus", "contentStatus", "packId", "tier", "cornerId", "prompt",
  "explanation", "authorKey", "retrievalDirection", "variantGroup"
];
const ids = new Set(termQuestions.map((question) => question.id));
const tierCounts = { core: 0, challenge: 0, final: 0 };
const cornerTierCounts = {};
const inputIds = [];
const prompts = new Set();
const answerPositionsByAddedCorner = {};
const directionsByAuthor = new Map([...guideByKey.keys()].map((key) => [key, new Set()]));
const questionCountByAuthor = new Map([...guideByKey.keys()].map((key) => [key, 0]));

questions.forEach((question) => {
  requiredFields.forEach((field) => assert(question[field], `${question.id || "unknown"}: missing ${field}`));
  assert(/^social-author-v2-\d{3}$/.test(question.id), `${question.id}: invalid id`);
  assert(!ids.has(question.id), `${question.id}: duplicate id`);
  ids.add(question.id);
  assert(question.contentVersion === 2 && question.packId === PACK_ID, `${question.id}: wrong pack version or id`);
  assert(question.subject === "社会" && question.sourceTag === "social-author-drill-original-jhs", `${question.id}: wrong subject/source`);
  assert(question.qualityStatus === "content-audited-v2" && question.contentStatus === "content-final", `${question.id}: audit status missing`);
  assert(guideByKey.has(question.authorKey), `${question.id}: unknown authorKey ${question.authorKey}`);
  assert(expectedCornerMatrix[question.cornerId], `${question.id}: unknown corner ${question.cornerId}`);
  assert(Object.hasOwn(tierCounts, question.tier), `${question.id}: invalid tier ${question.tier}`);
  tierCounts[question.tier] += 1;
  cornerTierCounts[question.cornerId] ||= { core: 0, challenge: 0, final: 0 };
  cornerTierCounts[question.cornerId][question.tier] += 1;
  questionCountByAuthor.set(question.authorKey, questionCountByAuthor.get(question.authorKey) + 1);
  directionsByAuthor.get(question.authorKey).add(String(question.retrievalDirection).replace(/^direct-/, ""));
  assert(question.variantGroup === `social-author-${question.authorKey}`, `${question.id}: wrong variantGroup`);
  assert(Array.isArray(question.childIds) && question.childIds.length === 1 && question.childIds[0] === "child-1", `${question.id}: wrong child assignment`);
  assert(Array.isArray(question.skills) && question.skills.length >= 3, `${question.id}: skills are too thin`);
  assert(Array.isArray(question.mistakeTags) && question.mistakeTags.length >= 2, `${question.id}: mistakeTags are too thin`);
  assert(question.prompt.length >= 14 && question.explanation.length >= 24, `${question.id}: learner text is too thin`);
  assert(!bannedMeta.test(`${question.prompt} ${question.explanation}`), `${question.id}: authoring/meta language leaked`);
  assert(!bannedCopiedPoem.test(`${question.prompt} ${question.explanation}`), `${question.id}: copied poem text leaked`);
  assert(!bannedOutOfScope.test(`${question.prompt} ${(question.choices || []).join(" ")} ${question.explanation}`), `${question.id}: out-of-scope postwar/high-school content leaked`);
  const promptKey = normalized(question.prompt);
  assert(!prompts.has(promptKey), `${question.id}: duplicate prompt`);
  prompts.add(promptKey);

  if (Number(question.id.slice(-3)) <= 30) {
    assert(question.cornerId === "modern-core", `${question.id}: preserved question must stay in modern-core`);
  } else {
    assert(question.paperRef === null, `${question.id}: new original question must not claim a worksheet page`);
    assert(question.sourceLabel && /^https:\/\//.test(question.sourceUrl), `${question.id}: authoritative source is missing`);
    assert(Array.isArray(question.sourceUrls) && question.sourceUrls.length >= 1, `${question.id}: source list is missing`);
    question.sourceUrls.forEach((sourceUrl) => {
      const hostname = new URL(sourceUrl).hostname;
      assert(hostname.endsWith("ndl.go.jp") || hostname.endsWith("ntj.jac.go.jp"), `${question.id}: non-authoritative source ${hostname}`);
    });
  }

  if (question.type === "input") {
    inputIds.push(question.id);
    if (question.id === "social-author-v2-039") {
      assert(question.answerTarget === "period", `${question.id}: planned input must ask for the period`);
    } else {
      assert(question.answerTarget === "author", `${question.id}: input must ask for a person name`);
    }
    assert(Array.isArray(question.answerText) && question.answerText.length >= 1, `${question.id}: input answers missing`);
    assert(!question.choices && question.answer === undefined, `${question.id}: input must not expose choices`);
    question.answerText.forEach((answer) => assert(!promptKey.includes(normalized(answer)), `${question.id}: answer appears in prompt`));
  } else {
    assert(question.type === "choice", `${question.id}: unsupported type ${question.type}`);
    assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}: expected four choices`);
    assert(new Set(question.choices.map(normalized)).size === 4, `${question.id}: duplicate choices`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer index`);
    assert(!promptKey.includes(normalized(question.choices[question.answer])), `${question.id}: correct answer appears in prompt`);
    if (Number(question.id.slice(-3)) >= 31) {
      answerPositionsByAddedCorner[question.cornerId] ||= [0, 0, 0, 0];
      answerPositionsByAddedCorner[question.cornerId][question.answer] += 1;
    }
  }
});

assert(tierCounts.core === 30 && tierCounts.challenge === 30 && tierCounts.final === 20, `${PACK_ID}: actual tiers must be 30/30/20`);
Object.entries(expectedCornerMatrix).forEach(([cornerId, expected]) => {
  ["core", "challenge", "final"].forEach((tier) => {
    assert(Number(cornerTierCounts[cornerId]?.[tier] || 0) === expected[tier], `${cornerId}: actual ${tier} count mismatch`);
  });
  assert(Object.values(expected).filter(Boolean).every((count) => count === 10), `${cornerId}: every enabled cell must be one 10-question set`);
});

const expectedInputIds = [
  ...Array.from({ length: 10 }, (_, index) => `social-author-v2-${String(index + 21).padStart(3, "0")}`),
  "social-author-v2-039", "social-author-v2-043", "social-author-v2-049",
  "social-author-v2-057", "social-author-v2-061", "social-author-v2-069"
].sort();
assert(JSON.stringify(inputIds.sort()) === JSON.stringify(expectedInputIds), `${PACK_ID}: expected exactly 16 planned input questions`);

expectedNewAnswers.forEach((expectedAnswer, suffix) => {
  const question = questions.find((row) => row.id === `social-author-v2-${suffix}`);
  assert(question, `missing added question ${suffix}`);
  const actualAnswer = question.type === "input" ? question.answerText[0] : question.choices[question.answer];
  assert(actualAnswer === expectedAnswer, `${question.id}: audited answer mismatch; got ${actualAnswer}`);
});
assert(expectedNewAnswers.size === 50, `${PACK_ID}: expected-answer audit must cover all 50 added questions`);

Object.entries(answerPositionsByAddedCorner).forEach(([cornerId, counts]) => {
  const used = counts.filter((count) => count > 0);
  assert(used.length === 4 && Math.max(...counts) - Math.min(...counts) <= 1, `${cornerId}: added answer positions are predictable (${counts.join("/")})`);
});
pack.corners.filter((corner) => corner.id !== "modern-core").forEach((corner) => {
  const formats = new Set(expandedQuestions.filter((question) => question.cornerId === corner.id).map((question) => question.formatTag));
  assert(formats.size >= 4, `${corner.id}: needs at least four question formats`);
});

guideByKey.forEach((item, key) => {
  assert(questionCountByAuthor.get(key) >= 2, `${key}: needs at least two primary questions`);
  assert(directionsByAuthor.get(key).size >= 2, `${key}: needs two genuinely distinct retrieval directions`);
  const acceptedNames = [item.name, ...(item.acceptedAuthorSpellings || [])].map(normalized);
  const recallsOwnName = questions
    .filter((question) => question.authorKey === key)
    .some((question) => {
      const correctAnswers = question.type === "input"
        ? question.answerText || []
        : [question.choices?.[question.answer]];
      return correctAnswers.some((answer) => acceptedNames.includes(normalized(answer)));
    });
  assert(recallsOwnName, `${key}: needs at least one primary question that recalls the person's own name`);
});
const pureOneToOne = questions.filter((question) => ["work-to-author", "direct-work-to-author"].includes(question.retrievalDirection));
assert(pureOneToOne.length <= 32, `${PACK_ID}: too many pure work-to-author questions (${pureOneToOne.length})`);
assert(questions.length - pureOneToOne.length >= 40, `${PACK_ID}: too few comparison/context/order questions`);

const learnerText = JSON.stringify({ copy: pack.copy, guide: pack.studyGuide, questions });
assert(!/social-author-0\d{2}/.test(learnerText), `${PACK_ID}: old v1 ids leaked`);
assert(!/(?:原稿の都合|作問|データベース)/.test(learnerText), `${PACK_ID}: internal language leaked`);
assert(!/出征する弟/.test(learnerText), `${PACK_ID}: inaccurate Yosano tense leaked`);
assert(!/(?:『古今和歌集』は紀貫之一人|『解体新書』は杉田玄白一人)/.test(learnerText), `${PACK_ID}: editor/translator was turned into a sole author`);

const appSource = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
assert(appSource.includes("PACK_CORNER_ROUTE_PARAM") && appSource.includes("function currentPackQuestions"), `${PACK_ID}: corner route/filter is missing`);
assert(appSource.includes("question.cornerId === corner.id"), `${PACK_ID}: question pool is not corner-scoped`);
assert(appSource.includes("guideItem?.requireAuthorInput === false"), `${PACK_ID}: per-person mastery rule is missing`);
assert(appSource.includes('.replace(/^direct-/, "")'), `${PACK_ID}: direct and choice versions of one direction must not count twice`);
assert(appSource.includes("configuredContentVersion"), `${PACK_ID}: stale pre-v2 stats isolation is missing`);

const nextMasteryEntry = vm.runInNewContext(`(${extractFunctionSource(appSource, "nextPackDimensionMasteryEntry", "updatePackDimensionMastery")})`);
const noInputFirst = nextMasteryEntry({}, {
  correct: true, keepReview: false, requiredDirections: 2, requiredSessions: 2, requireAuthorInput: false,
  answeredAt: "2026-07-17T10:00:00Z", direction: "work-to-author", sessionId: "s1", isAuthorInput: false
});
const noInputSecond = nextMasteryEntry(noInputFirst, {
  correct: true, keepReview: false, requiredDirections: 2, requiredSessions: 2, requireAuthorInput: false,
  answeredAt: "2026-07-17T10:05:00Z", direction: "author-to-work", sessionId: "s2", isAuthorInput: false
});
assert(noInputSecond.mastered, `${PACK_ID}: new people should master after two directions in two sessions`);
const inputRequiredSecond = nextMasteryEntry(noInputFirst, {
  correct: true, keepReview: false, requiredDirections: 2, requiredSessions: 2, requireAuthorInput: true,
  answeredAt: "2026-07-17T10:05:00Z", direction: "author-to-work", sessionId: "s2", isAuthorInput: false
});
assert(!inputRequiredSecond.mastered, `${PACK_ID}: existing people must still need direct author input`);
const reset = nextMasteryEntry(noInputSecond, {
  correct: false, keepReview: false, requiredDirections: 2, requiredSessions: 2, requireAuthorInput: false,
  answeredAt: "2026-07-17T10:10:00Z", direction: "author-to-work", sessionId: "s3", isAuthorInput: false
});
assert(!reset.mastered && reset.directions.length === 0, `${PACK_ID}: a wrong answer must reset person mastery`);

const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const parentSource = fs.readFileSync(path.join(ROOT, "parent-dashboard.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
assert(indexSource.includes(`social-author-drill-expanded.js?v=${CACHE_KEY}`), `${PACK_ID}: expanded data is not loaded with the new cache key`);
assert(indexSource.includes(`app.js?v=${APP_CACHE_KEY}`) && indexSource.includes(`styles.css?v=${STYLE_CACHE_KEY}`), `${PACK_ID}: learner cache keys are stale`);
assert(indexSource.includes('id="packCornerSelector"') && !/<details[^>]+id="packStudyGuide"[^>]+open/.test(indexSource), `${PACK_ID}: corner selector missing or answer guide starts open`);
assert(parentSource.includes("packConfig.corners") && parentSource.includes("authorKeys.length"), `${PACK_ID}: parent viewer is not dynamic by corner/person`);
assert(parentSource.includes(`social-author-drill-expanded.js?v=${CACHE_KEY}`), `${PACK_ID}: parent viewer does not load all 80 questions`);
assert(!parentSource.includes("${overall.attempted}/30"), `${PACK_ID}: parent viewer still hardcodes 30`);
assert(stylesSource.includes(".pack-tier-progress > .hidden"), `${PACK_ID}: disabled corner tiers must not leave 0/0 progress cards on mobile`);

console.log("✓ social-author-drill: 4 corners / 33 people / 80 questions (30+20+20+10)");
console.log("✓ preserved questions 001-030 are byte-signature compatible and contentVersion remains v2");
console.log("✓ all 50 added answers, sources, formats, answer positions, and mastery directions validated");
console.log("✓ learner UI, parent viewer, cache keys, and regular 200-question term-pack separation validated");
