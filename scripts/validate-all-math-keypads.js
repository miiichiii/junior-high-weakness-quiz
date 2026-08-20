const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = { window: {}, console };
vm.createContext(context);

function load(relativePath) {
  vm.runInContext(
    fs.readFileSync(path.join(root, relativePath), "utf8"),
    context,
    { filename: relativePath }
  );
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

const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const utility = context.window.MathKeypadUtils;
const mathWorkUtils = context.window.MathWorkUtils;
const questions = context.window.QUIZ_QUESTIONS.filter((question) => question.subject === "数学");
const requiredCore = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "−", "x", "x²", "x³"];
const errors = [];
const counts = {
  total: questions.length,
  directAnswer: 0,
  dragWork: 0,
  scratchChoice: 0,
  scratchManipulate: 0
};

function normalize(value) {
  return utility.normalizeSource(value).replace(/\s+/g, "");
}

function canCompose(target, config) {
  const keys = [...config.core, ...config.extra]
    .filter(Boolean)
    .map(normalize)
    .sort((left, right) => right.length - left.length);
  const normalizedTarget = normalize(target);
  const reachable = Array(normalizedTarget.length + 1).fill(false);
  reachable[0] = true;
  for (let index = 0; index < normalizedTarget.length; index += 1) {
    if (!reachable[index]) continue;
    keys.forEach((key) => {
      if (normalizedTarget.startsWith(key, index)) reachable[index + key.length] = true;
    });
  }
  return reachable[normalizedTarget.length];
}

function validateConfig(questionId, target, config) {
  requiredCore.forEach((key) => {
    if (!config.core.includes(key)) errors.push(`${questionId}: core keypad missing ${key}`);
  });
  if (!config.extra.includes("±")) errors.push(`${questionId}: keypad missing ±`);
  if (target && !canCompose(target, config)) {
    errors.push(`${questionId}: keypad cannot compose ${target}`);
  }
}

questions.forEach((question) => {
  const type = question.type || "choice";
  if (utility.isDirectAnswerQuestion(question)) {
    counts.directAnswer += 1;
    const config = utility.configForSource(utility.answerSource(question));
    const target = type === "input"
      ? (Array.isArray(question.answerText) ? question.answerText[0] : question.answerText)
      : question.choices?.[question.answer];
    validateConfig(question.id, target, config);
    if (type !== "input" && /どれですか|選びなさい/.test(utility.directEntryPrompt(question))) {
      errors.push(`${question.id}: direct-entry prompt still asks the learner to choose`);
    }
    return;
  }

  if (question.answerMode === "drag-work") {
    counts.dragWork += 1;
    (question.workSteps || []).forEach((step, stepIndex) => {
      const config = utility.configForSource((step.answers || []).join(" "));
      (step.answers || []).forEach((answer) => {
        validateConfig(`${question.id}:step-${stepIndex + 1}`, answer, config);
      });
    });
    return;
  }

  const scratchConfig = utility.configForSource(utility.scratchSource(question));
  validateConfig(question.id, "", scratchConfig);
  if (["choice", "find-error"].includes(type)) {
    counts.scratchChoice += 1;
    return;
  }
  if (type === "manipulate") {
    counts.scratchManipulate += 1;
    return;
  }
  errors.push(`${question.id}: math question has no keypad rendering route`);
});

if (questions.length !== 220) errors.push(`expected 220 math questions, found ${questions.length}`);
if (counts.directAnswer !== 105) errors.push(`expected 105 direct-answer keypads, found ${counts.directAnswer}`);
if (counts.dragWork !== 33) errors.push(`expected 33 drag-work keypads, found ${counts.dragWork}`);
if (counts.scratchChoice !== 56) errors.push(`expected 56 scratch-choice keypads, found ${counts.scratchChoice}`);
if (counts.scratchManipulate !== 26) errors.push(`expected 26 manipulate scratch keypads, found ${counts.scratchManipulate}`);
if (!mathWorkUtils.workStepEquivalent("−19+2a", "2a−19", "", null)) {
  errors.push("math keypad grading must recognize reordered equivalent terms");
}
if (mathWorkUtils.workStepEquivalent("2a−18", "2a−19", "", null)) {
  errors.push("math keypad grading must reject a genuinely different expression");
}

[
  /mathKeypadUtils\?\.isDirectAnswerQuestion\(question\)/,
  /appendCompactMathScratchKeypad\(question, currentAnswer !== undefined\)/,
  /const scratchKeypad = renderCompactMathKeypad\(question/,
  /extra:\s*\["±"\]/,
  /mathWorkUtils\?\.workStepEquivalent\(value, candidate, "", null\)/,
  /grid-template-columns:\s*repeat\(4,\s*40px\)/,
  /white-space:\s*nowrap/,
  /@media\s*\(max-width:\s*480px\)[\s\S]*?\.math-answer-keypad-controls\s*\{[\s\S]*?grid-template-columns:\s*max-content/
].forEach((pattern) => {
  if (!pattern.test(appSource) && !pattern.test(stylesSource)) {
    errors.push(`renderer or compact-layout contract missing: ${pattern}`);
  }
});

const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styleCacheKey = indexSource.match(/styles\.css\?v=([^"']+)/)?.[1] || "";
const appCacheKey = indexSource.match(/app\.js\?v=([^"']+)/)?.[1] || "";
if (!styleCacheKey || styleCacheKey !== appCacheKey) {
  errors.push("styles.css and app.js cache versions must match the current site release");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("All-math keypad validation passed.");
console.log(counts);
