const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const parentDashboardSource = fs.readFileSync(path.join(root, "parent-dashboard.html"), "utf8");
const responsiveMathLayoutSource = fs.readFileSync(path.join(root, "responsive-math-layout.js"), "utf8");
const context = { window: {}, console };
vm.createContext(context);

function load(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`missing pack file: ${relativePath}`);
  }
  vm.runInContext(fs.readFileSync(absolutePath, "utf8"), context, { filename: relativePath });
}

[
  "math-work-utils.js",
  "math-keypad-utils.js",
  "data/questions.js",
  "data/entrance-ibaraki-2027-pack.js",
  "data/term-test-2026-07-13-config.js",
  "data/term-test-2026-07-13-humanities.js",
  "data/term-test-2026-07-13-stem.js"
].forEach(load);

const PACK_ID = "term-2026-07-13";
const pack = context.window.QUIZ_PACKS?.[PACK_ID];
const allQuestions = context.window.QUIZ_QUESTIONS || [];
const questions = allQuestions.filter((question) => question.packId === PACK_ID);
const tiers = ["core", "challenge", "final"];
const subjects = ["国語", "社会", "数学", "理科", "英語"];
const expectedStages = { core: "基本攻略", challenge: "応用挑戦", final: "最終挑戦" };
const allowedDifficulties = new Set(["L1 基礎復帰", "L2 県立標準", "L3 県立本番", "L4 安全圏チャレンジ"]);
const allowedFormats = new Set(["短問", "資料読取", "長文・会話", "読解・記述", "複合", "操作型", "直接入力", "ミス発見"]);
const forbiddenText = /(長男|07\.10\.2026|出席番号|達成状況分析表)/i;
const outOfScopeJapaneseText = /(古典|古文|係り結び|いと明るし|ありけり|出でにけり|忘れむ)/;
const errors = [];
const mathWorkUtils = context.window.MathWorkUtils;
const mathKeypadUtils = context.window.MathKeypadUtils;
let mathWorkKeypadConfigForValidation = null;
let mathWorkWrongFeedbackForValidation = null;
const allowedTransformations = new Set([
  "expand", "distribute", "change-signs", "combine-like-terms", "factor-pair-check",
  "factor", "extract-square", "rationalize", "substitute", "prime-factorize", "evaluate"
]);

if (!/function\s+termPackMarkup\b/.test(parentDashboardSource)
    || !/stats\?\.packs\?\.\[TERM_PACK_ID\]/.test(parentDashboardSource)
    || !/自動採点正答率/.test(parentDashboardSource)
    || !/記述確認待ち/.test(parentDashboardSource)) {
  errors.push("parent viewer must display dedicated term-pack progress, grading, and pending written counts");
}

try {
  const coreObjective = questions.find((question) => question.tier === "core" && question.answerMode !== "rubric-input");
  const coreWritten = questions.find((question) => question.tier === "core" && question.answerMode === "rubric-input");
  const challengeObjective = questions.find((question) => question.tier === "challenge" && question.answerMode !== "rubric-input");
  const progress = {
    [coreObjective.id]: { packFirstAttemptRecorded: true, packFirstAttemptCorrect: true, packAttempts: 1 },
    [coreWritten.id]: {
      packFirstAttemptRecorded: true,
      packFirstAttemptPendingReview: true,
      packPendingWritten: true,
      packAttempts: 1,
      lastWrittenPendingReview: true
    },
    [challengeObjective.id]: {
      packFirstAttemptRecorded: true,
      packFirstAttemptCorrect: false,
      packAttempts: 1,
      needsReview: true
    }
  };
  let parentScript = Array.from(parentDashboardSource.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    .map((match) => match[1])
    .find((source) => source.includes("function termPackMarkup"));
  parentScript = parentScript.replace(
    "initializeFirebase().then((ready) => {",
    "globalThis.__packMarkup = termPackMarkup(globalThis.__progress, globalThis.__stats, 'child-1'); initializeFirebase().then((ready) => {"
  );
  const element = () => ({
    textContent: "",
    dataset: {},
    disabled: false,
    innerHTML: "",
    classList: { toggle() {} },
    addEventListener() {},
    appendChild() {}
  });
  const parentContext = {
    window: { QUIZ_QUESTIONS: questions },
    document: { getElementById: element },
    console,
    __progress: progress,
    __stats: { packs: { [PACK_ID]: { lastAnsweredAt: "2026-07-10T12:00:00Z" } } }
  };
  vm.createContext(parentContext);
  vm.runInContext(parentScript, parentContext);
  const markup = String(parentContext.__packMarkup || "");
  ["3/200", "自動採点正答率", "50%", "記述確認待ち", "基本攻略", "応用挑戦", "最終挑戦", "閲覧用"]
    .forEach((expected) => {
      if (!markup.includes(expected)) errors.push(`parent viewer runtime markup missing ${expected}`);
    });
} catch (error) {
  errors.push(`parent viewer runtime validation failed: ${error.message}`);
}

if (/function\s+evaluateRubricResponse\b/.test(appSource)) {
  errors.push("rubric-input must not use automatic keyword-containment grading");
}
if (!/rubricAssessment:\s*pendingReview\s*\?\s*["']pending-parent-review["']/.test(appSource)
    || !/renderRubricSelfReview/.test(appSource)
    || !/function\s+recordRubricPendingResult\b/.test(appSource)
    || !/packFirstAttemptPendingReview\s*=\s*true/.test(appSource)) {
  errors.push("rubric-input must remain ungraded pending parent review");
}
if (/rewrite\.textContent\s*=\s*["']書き直す["']/.test(appSource)
    || !/function\s+saveRubricDraftValue\b/.test(appSource)
    || !/function\s+clearRubricDraft\b/.test(appSource)) {
  errors.push("rubric-input must autosave drafts and reveal model answers only after submission");
}
if (!/function\s+pickFreshMaxQuiz\b/.test(appSource)
    || !/groups\.size\s*!==\s*10/.test(appSource)
    || !/subjects\["数学"\]\s*!==\s*5/.test(appSource)
    || !/subjects\["理科"\]\s*!==\s*5/.test(appSource)) {
  errors.push("app MAX picker must enforce ten unique templates with 5 math / 5 science");
}
const showSummarySource = appSource.slice(
  appSource.indexOf("function showSummary"),
  appSource.indexOf("function markSkippedQuestionsForReview")
);
if (!/const\s+pendingWritten\s*=/.test(showSummarySource)
    || !/const\s+writtenAnswered\s*=/.test(showSummarySource)
    || !/const\s+gradedAnswered\s*=\s*Math\.max\(0,\s*answered\s*-\s*writtenAnswered\)/.test(showSummarySource)) {
  errors.push("pack summary must calculate pending and auto-graded counts in showSummary scope");
}
const packProgressSource = appSource.slice(
  appSource.indexOf("function packProgressForTier"),
  appSource.indexOf("function packFirstAttemptAccuracy")
);
const packFirstAccuracySource = appSource.slice(
  appSource.indexOf("function packFirstAttemptAccuracy"),
  appSource.indexOf("function refreshPackMilestones")
);
if (!/isWrittenResponse\s*=\s*question\.answerMode\s*===\s*["']rubric-input["']/.test(packProgressSource)
    || !/record\.lastWrittenPendingReview/.test(packProgressSource)
    || !/question\.answerMode\s*!==\s*["']rubric-input["']/.test(packFirstAccuracySource)) {
  errors.push("all rubric-input attempts, including unknown/incomplete, must be excluded from grading and unlock accuracy");
}
const storedAnswerCorrectSource = appSource.slice(
  appSource.indexOf("function isStoredAnswerCorrect"),
  appSource.indexOf("function recordDailyAnswer")
);
if (!/if\s*\(storedAnswer\.pendingReview\)\s*return false/.test(storedAnswerCorrectSource)) {
  errors.push("pending written responses must never fall through to exact model-answer matching");
}
try {
  const mergeStatsSource = appSource.slice(
    appSource.indexOf("function mergeStats"),
    appSource.indexOf("function formatTime")
  );
  const mergeStats = vm.runInNewContext(`(${mergeStatsSource})`, { PACK_UNLOCK_METRIC_VERSION: 2 });
  const mergedOldCloud = mergeStats(
    { daily: {}, packs: { [PACK_ID]: { unlockMetricVersion: 2, challengeRecommended: false, finalRecommended: false, maxRecommended: false } } },
    { daily: {}, packs: { [PACK_ID]: { challengeRecommended: true, finalRecommended: true, maxRecommended: true } } }
  ).packs[PACK_ID];
  if (mergedOldCloud.unlockMetricVersion !== 0
      || mergedOldCloud.challengeRecommended
      || mergedOldCloud.finalRecommended
      || mergedOldCloud.maxRecommended) {
    errors.push("old cloud unlock metrics must be invalidated instead of reviving recommendations during merge");
  }
} catch (error) {
  errors.push(`mergeStats unlock-version regression failed: ${error.message}`);
}
if (!/core\.graded\s*>=\s*Number\(early\.answered/.test(appSource)
    || !/challenge\.graded\s*>=\s*Number\(final\.answered/.test(appSource)
    || !/core\.graded\s*\+\s*challenge\.graded/.test(appSource)
    || !/function\s+packGradableTierCount\b/.test(appSource)
    || !/coreFullThreshold\s*=\s*Math\.min/.test(appSource)
    || !/challenge\.graded\s*>=\s*challengeGradableTotal/.test(appSource)) {
  errors.push("pending written answers must not contribute to automatic tier unlock thresholds");
}
if (!/function\s+renderMathWorkChunkComposer\b/.test(appSource)
    || !/normalizeMathWorkCustomChunk/.test(appSource)) {
  errors.push("math work builder must provide an answer-neutral custom chunk composer");
}
if (!/function\s+renderMathWorkKeypad\b/.test(appSource)
    || !/function\s+checkMathWorkRow\b/.test(appSource)
    || !/row\.appendChild\(renderMathWorkKeypad\(question,\s*draft,\s*step,\s*rowIndex\)\)/.test(appSource)
    || !/hintSummary\.textContent\s*=\s*["']4択ヒントを見る["']/.test(appSource)) {
  errors.push("math work must use self-entry keypad by default and keep four choices behind an optional hint");
}
if (!/grid-template-columns:\s*repeat\(4,\s*40px\)/.test(stylesSource)
    || !/\.math-work-keypad-key\s*\{[\s\S]*?min-height:\s*38px/.test(stylesSource)) {
  errors.push("math work keypad must remain compact on narrow phones");
}
if (!/packFirstAttemptCorrect\s*=\s*Boolean\(correct\s*&&\s*!options\.keepReview\)/.test(appSource)
    || !/record\.lastAnswerAssisted\s*=\s*Boolean\(correct\s*&&\s*options\.keepReview\)/.test(appSource)) {
  errors.push("assisted math-work answers must remain review items and must not count as first-attempt mastery");
}
try {
  mathWorkKeypadConfigForValidation = (question, stepIndex) => {
    const step = question.workSteps?.[stepIndex] || {};
    return mathKeypadUtils.configForSource((step.answers || []).join(" "));
  };
  const wrongFeedbackSource = appSource.slice(
    appSource.indexOf("function mathWorkWrongFeedback"),
    appSource.indexOf("function renderMathWorkStepChoices")
  );
  mathWorkWrongFeedbackForValidation = vm.runInNewContext(
    `(() => { const mathWorkUtils = __mathWorkUtils; ${wrongFeedbackSource}; return mathWorkWrongFeedback; })()`,
    { __mathWorkUtils: mathWorkUtils }
  );
  const expansion = questions.find((question) => question.id === "term-20260713-math-core-006");
  const expansionKeys = mathWorkKeypadConfigForValidation(expansion, 0);
  const expectedCoreKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "−", "x", "x²", "x³"];
  expectedCoreKeys.forEach((key) => {
    if (!expansionKeys.core.includes(key)) errors.push(`expansion keypad missing ${key}`);
  });
  if (JSON.stringify(expansionKeys.extra) !== JSON.stringify(["±"])) {
    errors.push(`expansion keypad must keep only the always-available ± extra key: ${expansionKeys.extra.join(",")}`);
  }
  const reorderedMistake = "2x²−3x+5x−15";
  const expectedMistakeFeedback = expansion.workSteps[0].choices
    .find((choice) => choice.text === "2x²+5x−3x−15")?.feedback;
  if (mathWorkWrongFeedbackForValidation(expansion.workSteps[0], reorderedMistake) !== expectedMistakeFeedback) {
    errors.push("self-entry must reuse audited feedback when the same mistaken terms are reordered");
  }
  const radical = questions.find((question) => question.workSteps?.some((step) => step.answers.some((answer) => String(answer).includes("√"))));
  const radicalStepIndex = radical.workSteps.findIndex((step) => step.answers.some((answer) => String(answer).includes("√")));
  const radicalKeys = mathWorkKeypadConfigForValidation(radical, radicalStepIndex);
  if (!radicalKeys.extra.includes("√")) errors.push("radical keypad must add the square-root key only where needed");
} catch (error) {
  errors.push(`math work keypad config validation failed: ${error.message}`);
}
if (!/ResponsiveMathLayout\?\.fitQuestionPrompt/.test(appSource)
    || !/ResponsiveMathLayout\?\.fitGuidedChoices/.test(appSource)
    || !/window\.addEventListener\(["']resize["'],\s*scheduleResponsiveMathLayoutFit\)/.test(appSource)
    || !/scrollWidth\s*<=\s*element\.clientWidth/.test(responsiveMathLayoutSource)
    || !/math-work-step-choice-text/.test(responsiveMathLayoutSource)
    || !/fitMathWorkLine/.test(responsiveMathLayoutSource)) {
  errors.push("guided math text must use rendered-width fitting instead of character-count thresholds");
}
const skippedWorkSource = appSource.slice(
  appSource.indexOf("function isSkippedMathWorkStep"),
  appSource.indexOf("function isMathWorkComplete")
);
if (!/const\s+equationSides\s*=/.test(skippedWorkSource)
    || !/equationSides\.some\(\(side\)\s*=>\s*finalAnswers\.includes\(side\)\)/.test(skippedWorkSource)) {
  errors.push("non-final math rows must reject equations that jump directly to the final answer");
}
if (!/if\s*\(question\.packId\s*!==\s*state\.packId\)\s*return false/.test(appSource)
    || !/else if\s*\(question\.packId\)\s*\{\s*return false/.test(appSource)) {
  errors.push("normal and term-pack question pools must remain mutually exclusive");
}
const expectedRubricInputIds = new Set([
  "term-20260713-jpn-024",
  "term-20260713-jpn-031",
  "term-20260713-jpn-033",
  "term-20260713-jpn-034",
  "term-20260713-jpn-044",
  "term-20260713-jpn-046",
  "term-20260713-jpn-047",
  "term-20260713-jpn-054"
]);

if (!mathWorkUtils) {
  errors.push("missing MathWorkUtils");
} else {
  const equivalenceCases = [
    ["4x+2x+3−5", "2x+3+4x−5", null, true],
    ["9(a−b)=45", "45=9(a−b)", "substitute", true],
    ["(x+5)(x+4)", "(x+4)(x+5)", "factor", true],
    ["√8×√18=√(8×18)", "√8×√18=√144", "evaluate", true],
    ["√12+√27=√(4×3)+√(9×3)", "√12+√27=2√3+3√3", "extract-square", true],
    ["√12+√27=√4×√3+√9×√3", "√12+√27=2√3+3√3", "extract-square", true],
    ["√45=√(3²×5)", "√45=√9×√5", "extract-square", true],
    ["6÷√3=(6×√3)÷(√3×√3)", "6÷√3=6√3÷3", "rationalize", true],
    ["3(x−2)(x+2)", "3(x²−4)=3(x−2)(x+2)", "factor", true],
    ["√9×√5=3√5", "3√5", "evaluate", true],
    ["(2x+3)+(4x−5)", "2x+3+4x−5", "expand", false],
    ["(√5+√2)(√5−√2)", "(√5+√2)(√5−√2)=(√5)²−(√2)²", "factor", false],
    ["2+7=9,2×10=20", "4+5=9,4×5=20", "factor-pair-check", false],
    ["6x−2+0+0", "2x+3+4x−5", "change-signs", false],
    ["3x²−12=3(x−2)(x+2)", "3x²−12=3(x²−4)", "factor", false],
    ["3√5+0=3√5", "√45=√9×√5", "extract-square", false],
    ["6x−2+(x−2)(x−3)(x−5)(x−7)(x−11)", "6x−2", null, false],
    ["√(x²)", "x", null, false],
    ["1+11=√144", "√8×√18=√144", "evaluate", false],
    ["1+11=12", "12", "evaluate", false],
    ["3√5=3√5×x÷x", "3√5", "evaluate", false],
    ["3√5=3√5+(x−x)", "3√5", "evaluate", false],
    ["√8×√18=100−88", "√8×√18=√144", "evaluate", false],
    ["√8×√18=√8×√18", "√8×√18=√144", "evaluate", false],
    ["√8×√18=√18×√8", "√8×√18=√144", "evaluate", false],
    ["√8×√18=√8×√18×2÷2", "√8×√18=√144", "evaluate", false],
    ["√8×√18=√8×√18×(−1)×(−1)", "√8×√18=√144", "evaluate", false],
    ["√8×√18=√144×2÷2", "√8×√18=√144", "evaluate", false],
    ["7²−2×10=7²−2×10", "7²−2×10=29", "evaluate", false],
    ["5−2=5−2", "5−2=3", "evaluate", false],
    ["98×100=98×100", "98×100=9800", "evaluate", false],
    ["100²−3²=100²−3²", "100²−3²=9991", "evaluate", false],
    ["√45=√(15×3)", "√45=√9×√5", "extract-square", false],
    ["6÷√3=6÷√3×2÷2", "6÷√3=6√3÷3", "rationalize", false],
    ["6÷√3=6√3÷3×2÷2", "6÷√3=6√3÷3", "rationalize", false],
    ["6÷√3=(6×√3)÷(√3×√3)+9−9", "6÷√3=6√3÷3", "rationalize", false],
    ["√45=√(15×3)+9−9", "√45=√9×√5", "extract-square", false],
    ["√45=√(15×3)×√4÷2", "√45=√9×√5", "extract-square", false],
    ["√45=√(15×3×4×(1÷4))", "√45=√9×√5", "extract-square", false],
    ["√45=2²−2²+√45", "√45=√9×√5", "extract-square", false],
    ["72n=6×12×n", "72n=2³×3²×n", "prime-factorize", false],
    ["72n=6×12×n+4−4", "72n=2³×3²×n", "prime-factorize", false],
    ["72n=36×2n+4−4", "72n=2³×3²×n", "prime-factorize", false],
    ["72n=2³×3²×n+4−4", "72n=2³×3²×n", "prime-factorize", false]
  ];
  equivalenceCases.forEach(([candidate, expected, transformation, shouldPass]) => {
    const actual = mathWorkUtils.workStepEquivalent(candidate, expected, "critic regression", transformation);
    if (actual !== shouldPass) {
      errors.push(`math equivalence ${candidate} / ${expected} expected ${shouldPass}, got ${actual}`);
    }
  });
  if (!mathWorkUtils.jumpsToFinalAnswer("√45=3√5", ["3√5"])
      || !mathWorkUtils.jumpsToFinalAnswer("√45=√5×3", ["3√5"])
      || !mathWorkUtils.jumpsToFinalAnswer("6÷√3=2√3", ["2√3"])
      || !mathWorkUtils.jumpsToFinalAnswer("6÷√3=√3×2", ["2√3"])
      || mathWorkUtils.jumpsToFinalAnswer("√45=√9×√5", ["3√5"])
      || mathWorkUtils.jumpsToFinalAnswer("(2√3)²=12,√12×√3=6", ["6"])) {
    errors.push("non-final work rows must block direct final answers without rejecting genuine intermediate equations");
  }
  questions.filter((question) => question.subject === "数学" && Array.isArray(question.workSteps)).forEach((question) => {
    const finalAnswers = [question.workResult]
      .concat(Array.isArray(question.answerText) ? question.answerText : [question.answerText])
      .filter((answer) => answer !== undefined && answer !== null && answer !== "");
    question.workSteps.slice(0, -1).forEach((step, stepIndex) => {
      (step.answers || []).forEach((answer) => {
        if (mathWorkUtils.jumpsToFinalAnswer(answer, finalAnswers)) {
          errors.push(`${question.id}: stored work step ${stepIndex + 1} is incorrectly treated as a direct-final jump`);
        }
      });
    });
  });
  const poisonStep = {};
  Object.defineProperty(poisonStep, "answers", {
    get() { throw new Error("quick-token generator read accepted answers"); }
  });
  const quickTokens = mathWorkUtils.buildQuickTokens(
    poisonStep,
    "(3x−2)(2x+5)を展開する",
    "validator"
  );
  if (!quickTokens.includes("(3x−2)(2x+5)") || !quickTokens.includes("(3x−2)")) {
    errors.push("math quick-token palette must reuse useful source-expression chunks");
  }
  if (quickTokens.some((token) => ["6x²", "11x", "10"].includes(token))) {
    errors.push("math quick-token palette exposes computed answer terms");
  }
}

function countBy(rows, keyFn) {
  return rows.reduce((result, row) => {
    const key = keyFn(row);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function required(question, field) {
  const value = question[field];
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
    errors.push(`${question.id || "(missing id)"}: missing ${field}`);
  }
}

const mathWorkAllowedCharacters = new Set(Array.from("0123456789xyabnpq+−×÷=√()²³,"));

function normalizeAnswer(value) {
  return String(value || "")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[−‐‑‒–—―]/g, "-")
    .replace(/[＊*]/g, "×")
    .replace(/[／/]/g, "÷")
    .replace(/\s+/g, "")
    .replace(/[、，]/g, ",");
}

function validatePlaceholder(question) {
  if ((question.type || "choice") !== "input") return;
  const placeholder = normalizeAnswer(String(question.placeholder || "").replace(/^例[:：]?/u, ""));
  const accepted = (Array.isArray(question.answerText) ? question.answerText : [question.answerText]).map(normalizeAnswer);
  if (placeholder && accepted.includes(placeholder)) {
    errors.push(question.id + ": placeholder leaks the answer");
  }
}

function normalizeRubricText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s　]+/g, "");
}

function validateRubricInput(question) {
  const isRubricInput = question.answerMode === "rubric-input";
  if (!isRubricInput) {
    if (question.responseRubric !== undefined) {
      errors.push(question.id + ": responseRubric is only allowed for rubric-input questions");
    }
    return;
  }

  if (question.subject !== "国語" || question.type !== "input") {
    errors.push(question.id + ": rubric-input must be a Japanese input question");
  }
  if (question.choices !== undefined || question.answer !== undefined) {
    errors.push(question.id + ": rubric-input must not publish choices or an answer index");
  }
  const rubric = question.responseRubric;
  if (!rubric || typeof rubric !== "object" || Array.isArray(rubric)) {
    errors.push(question.id + ": rubric-input missing responseRubric");
    return;
  }
  const minimum = Number(rubric.minLength);
  const maximum = Number(rubric.maxLength);
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 1 || maximum <= minimum) {
    errors.push(question.id + ": responseRubric needs valid integer minLength/maxLength");
  }
  if (!Array.isArray(rubric.conceptGroups) || rubric.conceptGroups.length < 3) {
    errors.push(question.id + ": responseRubric needs at least three concept groups");
  }
  const modelAnswer = String(rubric.modelAnswer || "").trim();
  if (!modelAnswer) {
    errors.push(question.id + ": responseRubric missing modelAnswer");
  } else if (Number.isInteger(minimum) && Number.isInteger(maximum)) {
    const modelLength = Array.from(modelAnswer).length;
    if (modelLength < minimum || modelLength > maximum) {
      errors.push(`${question.id}: modelAnswer length ${modelLength} is outside ${minimum}-${maximum}`);
    }
  }
  const normalizedModel = normalizeRubricText(modelAnswer);
  (rubric.conceptGroups || []).forEach((group, groupIndex) => {
    if (!group || typeof group !== "object" || !String(group.label || "").trim()) {
      errors.push(question.id + ": concept group " + (groupIndex + 1) + " missing label");
      return;
    }
    if (!String(group.description || "").trim()) {
      errors.push(question.id + ": concept group " + (groupIndex + 1) + " missing self-review description");
    }
    if (!Array.isArray(group.anyOf) || !group.anyOf.length
        || group.anyOf.some((keyword) => !String(keyword || "").trim())) {
      errors.push(question.id + ": concept group " + (groupIndex + 1) + " needs nonempty anyOf keywords");
      return;
    }
    if (!group.anyOf.some((keyword) => normalizedModel.includes(normalizeRubricText(keyword)))) {
      errors.push(question.id + ": modelAnswer does not satisfy concept group " + group.label);
    }
  });
  const accepted = Array.isArray(question.answerText) ? question.answerText : [question.answerText];
  if (!accepted.some((answer) => normalizeRubricText(answer) === normalizedModel)) {
    errors.push(question.id + ": answerText must include responseRubric.modelAnswer");
  }
}

function validateMathWork(question) {
  const isMathInput = question.subject === "数学" && (question.type || "choice") === "input";
  if (!isMathInput) {
    const allowedRubricMode = question.subject === "国語"
      && question.type === "input"
      && question.answerMode === "rubric-input";
    if ((!allowedRubricMode && question.answerMode) || question.workResult || question.workSteps) {
      errors.push(question.id + ": non-math question contains math work fields");
    }
    return;
  }
  if (question.answerMode !== "drag-work") errors.push(question.id + ": math input must use drag-work");
  if (question.formatTag !== "操作型") errors.push(question.id + ": drag-work formatTag must be 操作型");
  if (!Array.isArray(question.workSteps) || question.workSteps.length < 2) {
    errors.push(question.id + ": drag-work needs at least two steps");
    return;
  }
  const accepted = (Array.isArray(question.answerText) ? question.answerText : [question.answerText]).map(normalizeAnswer);
  if (!accepted.includes(normalizeAnswer(question.workResult))) {
    errors.push(question.id + ": workResult does not match answerText");
  }
  question.workSteps.forEach((step, stepIndex) => {
    if (!step.label || !Array.isArray(step.answers) || !step.answers.length) {
      errors.push(question.id + ": invalid work step " + (stepIndex + 1));
      return;
    }
    const transformations = Array.isArray(step.requiredTransformation)
      ? step.requiredTransformation
      : [step.requiredTransformation];
    if (!transformations.length || transformations.some((name) => !allowedTransformations.has(name))) {
      errors.push(question.id + ": invalid requiredTransformation on work step " + (stepIndex + 1));
    }
    step.answers.forEach((answer) => {
      if (!canComposeWithMathWorkKeypad(question, stepIndex, answer)) {
        errors.push(question.id + ": keypad cannot compose work step " + (stepIndex + 1) + ": " + answer);
      }
      Array.from(String(answer).replace(/\s+/g, "")).forEach((character) => {
        if (!mathWorkAllowedCharacters.has(character)) {
          errors.push(question.id + ": unavailable palette character " + character);
        }
      });
      if (mathWorkUtils && !mathWorkUtils.workStepEquivalent(
        answer,
        answer,
        step.label,
        step.requiredTransformation
      )) {
        errors.push(question.id + ": work step " + (stepIndex + 1) + " does not perform its requiredTransformation");
      }
    });
    if (mathWorkUtils) {
      if (!Array.isArray(step.choices) || step.choices.length !== 4) {
        errors.push(question.id + ": work step " + (stepIndex + 1) + " needs four explicit audited choices");
      }
      (step.choices || []).forEach((choice) => {
        const choiceText = typeof choice === "string" ? choice : choice?.text;
        if (!choiceText || !mathWorkUtils.canonicalWork(choiceText)) {
          errors.push(question.id + ": work step " + (stepIndex + 1) + " has an invalid guided expression: " + choiceText);
        }
        if (choice && typeof choice === "object" && choice.feedback
            && mathWorkWrongFeedbackForValidation?.(step, choiceText) !== choice.feedback) {
          errors.push(question.id + ": self-entry does not reuse audited feedback for " + choiceText);
        }
      });
      const hint = normalizeAnswer(step.hint);
      const genericHints = new Set([
        normalizeAnswer("段階名を確認し、直前の式から変わる部分を1つずつ考えます。"),
        normalizeAnswer("演算の順序と符号を確認して、数値または最簡形まで計算します。")
      ]);
      if (!hint || genericHints.has(hint)) {
        errors.push(question.id + ": work step " + (stepIndex + 1) + " needs a problem-specific hint");
      }
      step.answers.forEach((answer) => {
        const normalizedAnswer = normalizeAnswer(answer);
        if (normalizedAnswer.length >= 5 && hint.includes(normalizedAnswer)) {
          errors.push(question.id + ": work step " + (stepIndex + 1) + " hint leaks accepted work: " + answer);
        }
      });

      const seed = question.id + ":" + stepIndex;
      let quickTokens = [];
      try {
        quickTokens = mathWorkUtils.buildQuickTokens(step, question.prompt, seed);
        const poisonStep = {};
        Object.defineProperty(poisonStep, "answers", {
          get() { throw new Error("quick-token generator read accepted answers"); }
        });
        const poisonTokens = mathWorkUtils.buildQuickTokens(poisonStep, question.prompt, seed);
        if (JSON.stringify(quickTokens) !== JSON.stringify(poisonTokens)) {
          errors.push(question.id + ": quick-token palette changes when accepted answers are unavailable");
        }
      } catch (error) {
        errors.push(question.id + ": quick-token palette accessed answer-derived data (" + error.message + ")");
      }
      const normalizedPrompt = normalizeAnswer(question.prompt);
      const promptVariables = new Set(normalizedPrompt.match(/[xyabnpq]/g) || []);
      quickTokens.forEach((token) => {
        const normalizedToken = normalizeAnswer(token);
        const genericPower = /^([xyabnpq])\^2$/.exec(normalizedToken);
        const comesFromPrompt = normalizedToken.length > 1 && normalizedPrompt.includes(normalizedToken);
        if (!comesFromPrompt && !(genericPower && promptVariables.has(genericPower[1]))) {
          errors.push(question.id + ": quick-token palette exposes answer-derived token " + token);
        }
      });

      const guidedChoices = mathWorkUtils.buildWorkStepChoices(
        step,
        question.prompt,
        question.id + ":guided:" + stepIndex
      );
      if (guidedChoices.length !== 4) {
        errors.push(question.id + ": work step " + (stepIndex + 1) + " needs exactly four guided choices");
      }
      const acceptedChoices = guidedChoices.filter((choice) => step.answers.some((answer) => (
        mathWorkUtils.workStepEquivalent(
          choice.text,
          answer,
          step.label,
          step.requiredTransformation
        )
      )));
      if (acceptedChoices.length !== 1) {
        errors.push(question.id + ": work step " + (stepIndex + 1) + " must have exactly one correct guided choice");
      }
      guidedChoices.filter((choice) => !acceptedChoices.includes(choice)).forEach((choice) => {
        if (!choice.feedback) {
          errors.push(question.id + ": guided wrong choice needs learning feedback: " + choice.text);
        }
      });
      if (!mathWorkUtils.workStepHint(step)) {
        errors.push(question.id + ": work step " + (stepIndex + 1) + " needs a guided hint");
      }
    }
  });
  const finalSegments = question.workSteps.at(-1).answers.flatMap((answer) => String(answer).split(/[=,]/));
  if (!finalSegments.some((segment) => accepted.includes(normalizeAnswer(segment)))) {
    errors.push(question.id + ": final work step does not expose an accepted result");
  }
  if ("dragTokens" in question || "dragTarget" in question || "dragSlotCount" in question) {
    errors.push(question.id + ": answer-derived drag fields are forbidden");
  }
  if (mathWorkUtils) {
    question.workSteps.slice(0, -1).forEach((step, stepIndex) => {
      const result = String(question.workResult || "");
      const acceptsPrematureResult = step.answers.some((answer) => {
        return normalizeAnswer(answer) === normalizeAnswer(result)
          || mathWorkUtils.workStepEquivalent(result, answer, step.label, step.requiredTransformation);
      });
      if (acceptsPrematureResult) {
        errors.push(question.id + ": non-final work step " + (stepIndex + 1) + " accepts the final result alone");
      }
    });
  }
}

function canComposeWithMathWorkKeypad(question, stepIndex, answer) {
  if (typeof mathWorkKeypadConfigForValidation !== "function") return false;
  const config = mathWorkKeypadConfigForValidation(question, stepIndex);
  const keys = [...config.core, ...config.extra]
    .filter(Boolean)
    .map(normalizeKeypadExpression)
    .sort((left, right) => right.length - left.length);
  const target = normalizeKeypadExpression(answer);
  const reachable = Array(target.length + 1).fill(false);
  reachable[0] = true;
  for (let index = 0; index < target.length; index += 1) {
    if (!reachable[index]) continue;
    keys.forEach((key) => {
      if (target.startsWith(key, index)) reachable[index + key.length] = true;
    });
  }
  return reachable[target.length];
}

function normalizeKeypadExpression(value) {
  return String(value || "")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/[−‐‑‒–—―-]/g, "−")
    .replace(/[＊*]/g, "×")
    .replace(/[／/]/g, "÷")
    .replace(/[\s　]/g, "");
}

if (!pack) errors.push(`missing window.QUIZ_PACKS[${PACK_ID}]`);

const ids = new Set();
allQuestions.forEach((question) => {
  if (!question.id) {
    errors.push("question missing id");
    return;
  }
  if (ids.has(question.id)) errors.push(`duplicate id: ${question.id}`);
  ids.add(question.id);
});

questions.forEach((question) => {
  [
    "id", "childIds", "subject", "unit", "priority", "stage", "difficulty",
    "examSkill", "formatTag", "mistakeTags", "sourceTag", "qualityStatus",
    "contentStatus", "packId", "tier", "paperRef", "skills", "prompt", "explanation"
  ].forEach((field) => required(question, field));

  if (!tiers.includes(question.tier)) errors.push(`${question.id}: invalid tier ${question.tier}`);
  if (expectedStages[question.tier] && question.stage !== expectedStages[question.tier]) {
    errors.push(`${question.id}: stage expected ${expectedStages[question.tier]}, got ${question.stage}`);
  }
  if (!subjects.includes(question.subject)) errors.push(`${question.id}: invalid subject ${question.subject}`);
  if (!allowedDifficulties.has(question.difficulty)) errors.push(`${question.id}: invalid difficulty ${question.difficulty}`);
  if (!allowedFormats.has(question.formatTag)) errors.push(`${question.id}: invalid formatTag ${question.formatTag}`);
  if (!Array.isArray(question.childIds) || !question.childIds.includes("child-1")) errors.push(`${question.id}: child-1 not assigned`);
  if (question.qualityStatus !== "content-audited") errors.push(`${question.id}: qualityStatus must be content-audited`);
  if (question.contentStatus !== "content-final") errors.push(`${question.id}: contentStatus must be content-final`);

  const type = question.type || "choice";
  if (type === "choice" || type === "find-error") {
    if (!Array.isArray(question.choices) || question.choices.length < 3) errors.push(`${question.id}: missing choices`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= (question.choices?.length || 0)) {
      errors.push(`${question.id}: invalid answer index`);
    }
  } else if (type === "input") {
    if (!question.answerText || (Array.isArray(question.answerText) && !question.answerText.length)) {
      errors.push(`${question.id}: input missing answerText`);
    }
  } else {
    errors.push(`${question.id}: unsupported pack type ${type}`);
  }
  validatePlaceholder(question);
  validateRubricInput(question);
  validateMathWork(question);

  if (question.figure) {
    if (!["table", "contour"].includes(question.figure.kind)) errors.push(`${question.id}: unsupported figure kind`);
    if (!question.figure.alt) errors.push(`${question.id}: figure missing alt`);
    if (question.figure.kind === "table") {
      if (!Array.isArray(question.figure.columns) || !Array.isArray(question.figure.rows)) errors.push(`${question.id}: invalid table figure`);
    }
  }

  const publicText = [
    question.passage,
    question.prompt,
    question.explanation,
    question.paperRef,
    question.sourceTag,
    question.placeholder,
    JSON.stringify(question.figure || {}),
    JSON.stringify(question.workSteps || {}),
    JSON.stringify(question.responseRubric || {})
  ].join(" ");
  if (forbiddenText.test(publicText)) errors.push(`${question.id}: contains private/source-file text`);
  if (question.subject === "国語" && outOfScopeJapaneseText.test([
    question.unit,
    question.prompt,
    question.explanation,
    question.paperRef,
    ...(question.skills || [])
  ].join(" "))) {
    errors.push(`${question.id}: contains an out-of-scope classical-Japanese item`);
  }
});

const japaneseQuestions = questions.filter((question) => question.subject === "国語");
const rubricInputQuestions = questions.filter((question) => question.answerMode === "rubric-input");
const actualRubricInputIds = new Set(rubricInputQuestions.map((question) => question.id));
if (rubricInputQuestions.length !== expectedRubricInputIds.size) {
  errors.push(`rubric-input questions expected ${expectedRubricInputIds.size}, got ${rubricInputQuestions.length}`);
}
expectedRubricInputIds.forEach((id) => {
  if (!actualRubricInputIds.has(id)) errors.push(`missing required rubric-input question ${id}`);
});
actualRubricInputIds.forEach((id) => {
  if (!expectedRubricInputIds.has(id)) errors.push(`unexpected rubric-input question ${id}`);
});
const finalRubricInputs = rubricInputQuestions.filter((question) => question.tier === "final");
if (finalRubricInputs.length !== 3) {
  errors.push(`final rubric-input questions expected 3, got ${finalRubricInputs.length}`);
}
const gradableByTier = Object.fromEntries(tiers.map((tier) => [
  tier,
  questions.filter((question) => question.tier === tier && question.answerMode !== "rubric-input").length
]));
const simulatedCoreCompletionThreshold = Math.min(
  Number(pack?.unlock?.challengeFull?.answered || 80),
  gradableByTier.core
);
const allAutoGradedCompleted = gradableByTier.core + gradableByTier.challenge + gradableByTier.final;
const expectedAutoGradedTotal = questions.length - rubricInputQuestions.length;
const completionUnlocksRemainReachable = gradableByTier.core >= simulatedCoreCompletionThreshold
  && gradableByTier.challenge >= Math.min(Number(pack?.unlock?.final?.answered || 60), gradableByTier.challenge)
  && allAutoGradedCompleted === expectedAutoGradedTotal;
if (!completionUnlocksRemainReachable) {
  errors.push("automatic unlock must remain reachable after pending rubric-input questions are excluded");
}
const japanesePassageQuestions = japaneseQuestions.filter((question) => question.passageId || question.passage);
if (japanesePassageQuestions.length !== 24) {
  errors.push(`Japanese passage-linked questions expected 24, got ${japanesePassageQuestions.length}`);
}
const passageGroups = japanesePassageQuestions.reduce((groups, question) => {
  if (!question.passageId || !question.passage) {
    errors.push(`${question.id}: passage and passageId must be provided together`);
    return groups;
  }
  if (!groups.has(question.passageId)) groups.set(question.passageId, []);
  groups.get(question.passageId).push(question);
  return groups;
}, new Map());
if (passageGroups.size !== 9) errors.push(`Japanese shared passage groups expected 9, got ${passageGroups.size}`);
passageGroups.forEach((rows, passageId) => {
  if (rows.length < 2 || rows.length > 4) {
    errors.push(`${passageId}: shared passage must support 2-4 questions, got ${rows.length}`);
  }
  if (new Set(rows.map((question) => question.passage)).size !== 1) {
    errors.push(`${passageId}: passage text is inconsistent within the group`);
  }
  if (String(rows[0]?.passage || "").trim().length < 15) {
    errors.push(`${passageId}: passage is too short to support reading questions`);
  }
  if (new Set(rows.map((question) => question.examSkill)).size < 2) {
    errors.push(`${passageId}: questions do not examine multiple reading operations`);
  }
});
japanesePassageQuestions.forEach((question) => {
  if (!Array.isArray(question.choices) || question.choices.length !== 4) return;
  const lengths = question.choices.map((choice) => Array.from(String(choice)).length);
  const correctLength = lengths[question.answer];
  const longest = Math.max(...lengths);
  if (correctLength === longest && lengths.filter((length) => length === longest).length === 1) {
    errors.push(`${question.id}: correct choice is the unique longest option`);
  }
  if (longest - Math.min(...lengths) > 14) {
    errors.push(`${question.id}: reading-choice length spread exceeds 14 characters`);
  }
});
japaneseQuestions
  .filter((question) => ["読解・記述", "複合"].includes(question.formatTag))
  .forEach((question) => {
    if (!question.passageId || !question.passage) {
      errors.push(`${question.id}: reading-format question must show a self-contained passage`);
    }
  });

if (questions.length !== 200) errors.push(`pack total expected 200, got ${questions.length}`);

const typeCounts = countBy(questions, (question) => question.type || "choice");
const expectedTypeCounts = { input: 56, choice: 131, "find-error": 13 };
Object.entries(expectedTypeCounts).forEach(([type, expected]) => {
  if ((typeCounts[type] || 0) !== expected) errors.push(`type/${type} expected ${expected}, got ${typeCounts[type] || 0}`);
});
const mathInputs = questions.filter((question) => question.subject === "数学" && question.type === "input");
if (mathInputs.length !== 33) errors.push(`math input expected 33, got ${mathInputs.length}`);
const mathInputsByTier = countBy(mathInputs, (question) => question.tier);
Object.entries({ core: 13, challenge: 13, final: 7 }).forEach(([tier, expected]) => {
  if ((mathInputsByTier[tier] || 0) !== expected) {
    errors.push(`math input/${tier} expected ${expected}, got ${mathInputsByTier[tier] || 0}`);
  }
});

if (pack) {
  if (Number(pack.sessionSize) !== 10) errors.push("pack sessionSize must be 10");
  if (!Number.isFinite(Number(pack.finalTimeLimitSeconds)) || Number(pack.finalTimeLimitSeconds) <= 0) {
    errors.push("pack finalTimeLimitSeconds must be positive");
  }
  const unlockExpectations = [
    ["challengeEarly", "answered", 40], ["challengeEarly", "accuracy", 90],
    ["challengeFull", "answered", 80], ["challengeFull", "accuracy", 85],
    ["final", "answered", 60], ["final", "accuracy", 80]
  ];
  unlockExpectations.forEach(([tier, field, expected]) => {
    if (Number(pack.unlock?.[tier]?.[field]) !== expected) {
      errors.push(`pack unlock/${tier}/${field} expected ${expected}`);
    }
  });
  Object.entries({ review: 0.5, unseen: 0.4, mastered: 0.1 }).forEach(([field, expected]) => {
    if (Number(pack.mix?.[field]) !== expected) errors.push(`pack mix/${field} expected ${expected}`);
  });
  if (Number(pack.mastery?.correctSessions) !== 2) errors.push("pack mastery must require two separate correct sessions");
  if (Number(pack.mastery?.cooldownAnswers) !== 5) errors.push("pack review cooldown must be five answers");
  const byTier = countBy(questions, (question) => question.tier);
  tiers.forEach((tier) => {
    if (byTier[tier] !== pack.tierCounts[tier]) {
      errors.push(`${tier} expected ${pack.tierCounts[tier]}, got ${byTier[tier] || 0}`);
    }
    const tierRows = questions.filter((question) => question.tier === tier);
    const bySubject = countBy(tierRows, (question) => question.subject);
    subjects.forEach((subject) => {
      const expected = pack.subjectCounts[tier][subject];
      if (bySubject[subject] !== expected) errors.push(`${tier}/${subject} expected ${expected}, got ${bySubject[subject] || 0}`);
    });
  });

  const totals = countBy(questions, (question) => question.subject);
  subjects.forEach((subject) => {
    const expected = pack.subjectCounts.total[subject];
    if (totals[subject] !== expected) errors.push(`total/${subject} expected ${expected}, got ${totals[subject] || 0}`);
  });
}

const variantFactory = context.window.TERM_TEST_GENERATE_VARIANTS;
if (typeof variantFactory !== "function") {
  errors.push("missing TERM_TEST_GENERATE_VARIANTS");
} else {
  const expectedMaxGroups = new Set([
    "math-max-expansion",
    "math-max-root",
    "math-max-factorization",
    "math-max-rationalization",
    "math-max-expression-value",
    "math-max-condition-reverse",
    "sci-max-heredity-count",
    "sci-max-heredity-reverse",
    "sci-max-ion-balance",
    "sci-max-ionization-equation",
    "sci-max-copper-electrons",
    "sci-max-electrolysis-gas"
  ]);

  function plain(value) {
    return String(value || "")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .normalize("NFKC")
      .replace(/[−‐‑‒–—―]/g, "-")
      .replace(/[、，]/g, ",")
      .replace(/\s+/g, "");
  }

  function acceptedAnswers(question) {
    return (Array.isArray(question.answerText) ? question.answerText : [question.answerText])
      .filter((answer) => answer !== undefined && answer !== null)
      .map(plain);
  }

  function accepts(question, expected) {
    return acceptedAnswers(question).includes(plain(expected));
  }

  function numericAnswers(question) {
    return acceptedAnswers(question).flatMap((answer) => {
      const match = answer.toLowerCase().match(/^(-?\d+)(?:個体|個|ml)?$/);
      return match ? [Number(match[1])] : [];
    });
  }

  function acceptsNumber(question, expected) {
    return numericAnswers(question).includes(expected);
  }

  function hasWorkAnswer(question, stepIndex, expected) {
    return (question.workSteps?.[stepIndex]?.answers || [])
      .some((candidate) => plain(candidate) === plain(expected));
  }

  function decomposeSquareRoot(value) {
    let outside = 1;
    let inside = value;
    for (let factor = 2; factor * factor <= inside; factor += 1) {
      while (inside % (factor * factor) === 0) {
        outside *= factor;
        inside /= factor * factor;
      }
    }
    return { outside, inside };
  }

  function sameNumberPair(first, second, expectedFirst, expectedSecond) {
    return [first, second].sort((left, right) => left - right).join(",")
      === [expectedFirst, expectedSecond].sort((left, right) => left - right).join(",");
  }

  function validFactorPairWork(candidate, left, right, sum, product) {
    const [sumStatement, productStatement, ...extra] = plain(candidate).split(",");
    if (!sumStatement || !productStatement || extra.length) return false;
    const sumMatch = sumStatement.match(/^(-?\d+)([+-]\d+)=(-?\d+)$/);
    const productMatch = productStatement.match(/^\(?(-?\d+)\)?×\(?(-?\d+)\)?=(-?\d+)$/);
    if (!sumMatch || !productMatch) return false;
    const sumOperands = [Number(sumMatch[1]), Number(sumMatch[2])];
    const productOperands = [Number(productMatch[1]), Number(productMatch[2])];
    return sameNumberPair(sumOperands[0], sumOperands[1], left, right)
      && sameNumberPair(productOperands[0], productOperands[1], left, right)
      && Number(sumMatch[3]) === sum
      && Number(productMatch[3]) === product
      && sumOperands[0] + sumOperands[1] === sum
      && productOperands[0] * productOperands[1] === product;
  }

  function normalizeChem(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[−‐‑‒–—―]/g, "-")
      .replace(/→/g, "->")
      .replace(/\s+/g, "");
  }

  function parseChemicalSpecies(value) {
    let text = String(value || "")
      .trim()
      .normalize("NFKC")
      .replace(/[−‐‑‒–—―]/g, "-");
    let coefficient = 1;
    const coefficientMatch = text.match(/^(\d+)(?=[A-Z])/);
    if (coefficientMatch) {
      coefficient = Number(coefficientMatch[1]);
      text = text.slice(coefficientMatch[1].length);
    }
    let charge = 0;
    const chargeMatch = text.match(/(\d*)([+-])$/);
    if (chargeMatch) {
      const magnitude = Number(chargeMatch[1] || 1);
      charge = chargeMatch[2] === "+" ? magnitude : -magnitude;
      text = text.slice(0, -chargeMatch[0].length);
    }
    const atoms = {};
    let reconstructed = "";
    for (const match of text.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
      const count = Number(match[2] || 1);
      atoms[match[1]] = (atoms[match[1]] || 0) + count * coefficient;
      reconstructed += match[0];
    }
    if (!text || reconstructed !== text) return null;
    return { atoms, charge: charge * coefficient };
  }

  function aggregateChemicalSide(species) {
    const result = { atoms: {}, charge: 0 };
    for (const value of species) {
      const parsed = parseChemicalSpecies(value);
      if (!parsed) return null;
      Object.entries(parsed.atoms).forEach(([atom, count]) => {
        result.atoms[atom] = (result.atoms[atom] || 0) + count;
      });
      result.charge += parsed.charge;
    }
    return result;
  }

  function chemicalEquationBalanced(equation) {
    const sides = String(equation || "").split(/\s*(?:→|->)\s*/);
    if (sides.length !== 2) return false;
    const left = aggregateChemicalSide(sides[0].split(/\s+\+\s+/));
    const right = aggregateChemicalSide(sides[1].split(/\s+\+\s+/));
    if (!left || !right || left.charge !== right.charge) return false;
    const atoms = new Set([...Object.keys(left.atoms), ...Object.keys(right.atoms)]);
    return Array.from(atoms).every((atom) => (left.atoms[atom] || 0) === (right.atoms[atom] || 0));
  }

  function verifyVariant(question) {
    if (!expectedMaxGroups.has(question.variantGroup)) {
      return `${question.id}: unknown MAX variantGroup ${question.variantGroup}`;
    }

    if (question.variantGroup === "math-max-expansion") {
      const match = plain(question.prompt).match(/^\((\d+)x\+(\d+)\)\(x\+(\d+)\)-\((\d+)x-(\d+)\)\(x-(\d+)\)/);
      if (!match) return `${question.id}: cannot parse expansion variant`;
      const [a, b, c, repeatedA, repeatedB, d] = match.slice(1).map(Number);
      const linear = a * (c + d) + 2 * b;
      const constant = b * (c - d);
      const expected = `${linear}x${constant > 0 ? "+" : ""}${constant}`;
      if (a !== repeatedA || b !== repeatedB || c === d || constant === 0 || !accepts(question, expected)) {
        return `${question.id}: expansion arithmetic or non-degeneracy check failed`;
      }
      const first = `(${a}x+${b})(x+${c})=${a}x²+${a * c + b}x+${b * c}`;
      const second = `(${a}x−${b})(x−${d})=${a}x²−${a * d + b}x+${b * d}`;
      const changedSigns = `${a}x²+${a * c + b}x+${b * c}−${a}x²+${a * d + b}x−${b * d}`;
      const combined = `${a * c + b}x+${a * d + b}x+${b * c}−${b * d}=${expected.replace(/-/g, "−")}`;
      if (!hasWorkAnswer(question, 0, first) || !hasWorkAnswer(question, 1, second)
          || !hasWorkAnswer(question, 2, changedSigns) || !hasWorkAnswer(question, 3, combined)) {
        return `${question.id}: expansion work rows are arithmetically inconsistent`;
      }
      return "";
    }

    if (question.variantGroup === "math-max-root") {
      const match = plain(question.prompt).match(/^\u221a(\d+)-\u221a(\d+)\+\u221a(\d+)/);
      if (!match) return `${question.id}: cannot parse root variant`;
      const radicands = match.slice(1).map(Number);
      const decomposed = radicands.map(decomposeSquareRoot);
      const bases = new Set(decomposed.map((row) => row.inside));
      const coefficients = decomposed.map((row) => row.outside);
      const resultCoefficient = coefficients[0] - coefficients[1] + coefficients[2];
      if (new Set(radicands).size !== 3 || bases.size !== 1
          || coefficients.some((value) => value < 2) || new Set(coefficients).size !== 3
          || resultCoefficient <= 1) {
        return `${question.id}: root variant contains repeated/no-op/cancelling terms`;
      }
      const base = decomposed[0].inside;
      const expected = `${resultCoefficient}√${base}`;
      if (!accepts(question, expected)) return `${question.id}: root answer is not ${expected}`;
      for (let index = 0; index < 3; index += 1) {
        if (!hasWorkAnswer(question, index, `√${radicands[index]}=${coefficients[index]}√${base}`)) {
          return `${question.id}: root simplification row ${index + 1} is inconsistent`;
        }
      }
      if (!hasWorkAnswer(
        question,
        3,
        `${coefficients[0]}√${base}−${coefficients[1]}√${base}+${coefficients[2]}√${base}=${expected}`
      )) {
        return `${question.id}: root combination row is inconsistent`;
      }
      return "";
    }

    if (question.variantGroup === "math-max-factorization") {
      const polynomial = plain(question.prompt).match(/^x\^2([+-](?:\d+)?x)([+-]\d+)/);
      if (!polynomial) return `${question.id}: cannot parse factorization polynomial`;
      const coefficientText = polynomial[1].slice(0, -1);
      const linear = coefficientText === "+" ? 1 : coefficientText === "-" ? -1 : Number(coefficientText);
      const constant = Number(polynomial[2]);
      const parsedAnswers = acceptedAnswers(question).flatMap((answer) => {
        const match = answer.match(/^\(x([+-]\d+)\)\(x([+-]\d+)\)$/);
        return match ? [[Number(match[1]), Number(match[2])]] : [];
      });
      const factors = parsedAnswers.find(([left, right]) => left + right === linear && left * right === constant);
      if (!factors || factors[0] === 0 || factors[1] === 0 || factors[0] === factors[1]) {
        return `${question.id}: factorization answer does not reconstruct the polynomial`;
      }
      if (!(question.workSteps?.[0]?.answers || []).some((candidate) => validFactorPairWork(
        candidate,
        factors[0],
        factors[1],
        linear,
        constant
      ))) {
        return `${question.id}: factor-pair row does not prove both sum and product`;
      }
      if (!(question.workSteps?.[1]?.answers || []).some((answer) => acceptedAnswers(question).includes(plain(answer)))) {
        return `${question.id}: final factorization row does not contain an accepted factorization`;
      }
      return "";
    }

    if (question.variantGroup === "math-max-rationalization") {
      const match = plain(question.prompt).match(/^(\d+)÷√(\d+)/);
      if (!match) return `${question.id}: cannot parse rationalization variant`;
      const numerator = Number(match[1]);
      const base = Number(match[2]);
      const coefficient = numerator / base;
      if (!Number.isInteger(coefficient) || coefficient < 2 || base <= 1 || Number.isInteger(Math.sqrt(base))) {
        return `${question.id}: rationalization variant is degenerate`;
      }
      const expected = `${coefficient}√${base}`;
      if (!accepts(question, expected)
          || !hasWorkAnswer(question, 0, `${numerator}÷√${base}=${numerator}√${base}÷${base}`)
          || !hasWorkAnswer(question, 1, `${numerator}√${base}÷${base}=${expected}`)) {
        return `${question.id}: rationalization answer/work rows are inconsistent`;
      }
      return "";
    }

    if (question.variantGroup === "math-max-expression-value") {
      const match = plain(question.prompt).match(/x\+y=(\d+),xy=(\d+)/);
      if (!match) return `${question.id}: cannot parse expression-value conditions`;
      const sum = Number(match[1]);
      const product = Number(match[2]);
      const discriminant = sum * sum - 4 * product;
      const root = Math.sqrt(discriminant);
      const expected = sum * sum - 2 * product;
      if (discriminant <= 0 || !Number.isInteger(root)
          || !Number.isInteger((sum + root) / 2) || !Number.isInteger((sum - root) / 2)
          || !acceptsNumber(question, expected)) {
        return `${question.id}: expression-value conditions/answer are inconsistent`;
      }
      if (!hasWorkAnswer(question, 0, "x²+y²=(x+y)²−2xy")
          || !hasWorkAnswer(question, 1, `${sum}²−2×${product}=${sum * sum}−${2 * product}`)
          || !hasWorkAnswer(question, 2, `${sum * sum}−${2 * product}=${expected}`)) {
        return `${question.id}: expression-value work rows are inconsistent`;
      }
      return "";
    }

    if (question.variantGroup === "math-max-condition-reverse") {
      const match = plain(question.prompt).match(/^x\^2\+px([+-]\d+)=\(x([+-]\d+)\)\(x([+-]\d+)\)/);
      if (!match) return `${question.id}: cannot parse coefficient-reverse identity`;
      const constant = Number(match[1]);
      const left = Number(match[2]);
      const right = Number(match[3]);
      const sum = left + right;
      if (left * right !== constant || (!acceptsNumber(question, sum) && !accepts(question, `p=${sum}`))) {
        return `${question.id}: coefficient-reverse answer is inconsistent`;
      }
      const factors = `(x${left < 0 ? left : `+${left}`})(x${right < 0 ? right : `+${right}`})`;
      if (!hasWorkAnswer(question, 0, `${factors}=x²+${sum}x+${constant}`)
          || !hasWorkAnswer(question, 1, `p=${sum}`)) {
        return `${question.id}: coefficient-reverse work rows are inconsistent`;
      }
      return "";
    }

    if (question.variantGroup === "sci-max-heredity-count") {
      const total = Number(String(question.prompt).match(/子が(\d+)個体/)?.[1]);
      if (!total || total % 4 !== 0 || !acceptsNumber(question, total / 2)) {
        return `${question.id}: Aa×Aa genotype-count answer must be one half of the total`;
      }
      return "";
    }

    if (question.variantGroup === "sci-max-heredity-reverse") {
      const rows = question.figure?.rows || [];
      const dominant = Number(rows.find((row) => row[0] === "顕性形質")?.[1]);
      const recessive = Number(rows.find((row) => row[0] === "潜性形質")?.[1]);
      let expected = "";
      if (dominant > 0 && recessive === 0) expected = "AA";
      if (dominant > 0 && dominant === recessive) expected = "Aa";
      const selected = String(question.choices?.[question.answer] || "");
      if (!expected || selected !== expected) {
        return `${question.id}: test-cross table does not support selected genotype ${selected}`;
      }
      return "";
    }

    if (question.variantGroup === "sci-max-ion-balance") {
      const rows = question.figure?.rows || [];
      const calcium = Number(rows.find((row) => String(row[0]).includes("Ca"))?.[1]);
      const chloride = calcium * 2;
      if (!calcium || !acceptsNumber(question, chloride)) {
        return `${question.id}: Ca²⁺/Cl⁻ charge balance answer must be ${chloride}`;
      }
      return "";
    }

    if (question.variantGroup === "sci-max-ionization-equation") {
      const prompt = normalizeChem(question.prompt);
      let expected = "";
      if (prompt.includes("CaCl2")) expected = "CaCl₂ → Ca²⁺ + 2Cl⁻";
      else if (prompt.includes("NaCl")) expected = "NaCl → Na⁺ + Cl⁻";
      else if (prompt.includes("HCl")) expected = "HCl → H⁺ + Cl⁻";
      const selected = String(question.choices?.[question.answer] || "");
      const matchingChoices = (question.choices || []).filter((choice) => normalizeChem(choice) === normalizeChem(expected));
      if (!expected || normalizeChem(selected) !== normalizeChem(expected)
          || matchingChoices.length !== 1 || !chemicalEquationBalanced(selected)) {
        return `${question.id}: selected ionization equation fails atom/charge/ion validation`;
      }
      return "";
    }

    if (question.variantGroup === "sci-max-copper-electrons") {
      const copperIons = Number(normalizeChem(question.prompt).match(/Cu2\+が(\d+)個/)?.[1]);
      if (!copperIons || !acceptsNumber(question, copperIons * 2)) {
        return `${question.id}: Cu²⁺ electron count must be twice the ion count`;
      }
      return "";
    }

    if (question.variantGroup === "sci-max-electrolysis-gas") {
      const row = question.figure?.rows?.find((candidate) => candidate[1] === "酸素");
      const oxygenAtFiveMinutes = Number(String(row?.[2] || "").replace(/mL/i, ""));
      const expected = oxygenAtFiveMinutes * 2 * 3;
      if (!oxygenAtFiveMinutes || !acceptsNumber(question, expected)) {
        return `${question.id}: ten-minute electrolysis total must be six times five-minute oxygen`;
      }
      return "";
    }

    return `${question.id}: MAX template has no independent validator`;
  }

  const variantsA = variantFactory(20, 7132026);
  const variantsB = variantFactory(20, 7132026);
  if (!Array.isArray(variantsA) || variantsA.length !== 20) errors.push("variant generator must return requested count");
  if (JSON.stringify(variantsA) !== JSON.stringify(variantsB)) errors.push("variant generator must be deterministic for a seed");
  variantsA.forEach((question) => {
    if (question.packId !== PACK_ID || question.tier !== "max") errors.push(`${question.id}: invalid generated pack metadata`);
    if (!question.id || !question.prompt || !question.explanation) errors.push("generated variant missing content");
    const type = question.type || "choice";
    if (type === "input" && !question.answerText) errors.push(`${question.id}: generated input missing answerText`);
    if (type === "choice" && (!Array.isArray(question.choices) || !Number.isInteger(question.answer))) errors.push(`${question.id}: generated choice invalid`);
    validatePlaceholder(question);
    validateMathWork(question);
  });
  const generatedMath = variantsA.filter((question) => question.subject === "数学");
  if (generatedMath.length !== 10 || generatedMath.some((question) => question.answerMode !== "drag-work")) {
    errors.push("generated 20-question sample must contain 10 drag-work math questions");
  }
  const MAX_FUZZ_SEEDS = 300;
  const generatedIds = new Set();
  for (let seed = 1; seed <= MAX_FUZZ_SEEDS; seed += 1) {
    const generated = variantFactory(12, `gifted-critic-${seed}`);
    const firstTen = generated.slice(0, 10);
    const firstTwelve = generated.slice(0, 12);
    if (new Set(firstTen.map((question) => question.variantGroup)).size !== 10) {
      errors.push(`MAX seed ${seed}: first 10 questions repeat a template`);
    }
    if (firstTen.filter((question) => question.subject === "数学").length !== 5
        || firstTen.filter((question) => question.subject === "理科").length !== 5) {
      errors.push(`MAX seed ${seed}: first 10 questions must be balanced 5 math / 5 science`);
    }
    const actualGroups = new Set(firstTwelve.map((question) => question.variantGroup));
    if (actualGroups.size !== 12
        || Array.from(expectedMaxGroups).some((group) => !actualGroups.has(group))) {
      errors.push(`MAX seed ${seed}: 12-question cycle must contain every template exactly once`);
    }
    if (firstTwelve.filter((question) => question.subject === "数学").length !== 6
        || firstTwelve.filter((question) => question.subject === "理科").length !== 6) {
      errors.push(`MAX seed ${seed}: 12-question cycle must be balanced 6 math / 6 science`);
    }
    generated.forEach((question) => {
      if (generatedIds.has(question.id)) errors.push(`${question.id}: generated id reused across seeds`);
      generatedIds.add(question.id);
      const issue = verifyVariant(question);
      if (issue) errors.push(issue);
      validatePlaceholder(question);
      validateMathWork(question);
    });
  }
}

console.log("term pack counts:", {
  total: questions.length,
  byTier: countBy(questions, (question) => question.tier),
  bySubject: countBy(questions, (question) => question.subject)
});

if (errors.length) {
  console.error("Term-test pack validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Term-test pack validation passed.");
