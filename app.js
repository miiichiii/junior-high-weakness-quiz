(function () {
  const state = {
    mode: "daily",
    subject: "all",
    unit: "all",
    quiz: [],
    index: 0,
    answers: new Map(),
    choiceOrders: new Map(),
    equationStates: new Map(),
    scratchNotes: loadScratchNotes(),
    progress: loadProgress(),
    stats: loadStats()
  };

  const PHASE = {
    MOVE_VAR: "move_var",
    CALC_VAR: "calc_var",
    MOVE_CONST: "move_constant",
    CALC_CONST: "calc_constant",
    DIVIDE: "divide",
    CALC_DIVIDE: "calc_divide",
    SQUARE_ROOT: "square_root",
    CALC_SQRT: "calc_sqrt",
    DONE: "done"
  };

  const subjects = ["all", "数学", "理科", "社会", "英語", "国語"];
  const labels = {
    all: "全教科",
    daily: "今日の20問",
    focus: "苦手集中",
    review: "できなかった問題",
    unitAll: "全カテゴリ"
  };

  const els = {
    subjectList: document.getElementById("subjectList"),
    categoryList: document.getElementById("categoryList"),
    modeButtons: Array.from(document.querySelectorAll(".mode-button")),
    quizLabel: document.getElementById("quizLabel"),
    quizTitle: document.getElementById("quizTitle"),
    newQuiz: document.getElementById("newQuiz"),
    progressText: document.getElementById("progressText"),
    scoreText: document.getElementById("scoreText"),
    progressBar: document.getElementById("progressBar"),
    progressMetric: document.getElementById("progressMetric"),
    scoreMetric: document.getElementById("scoreMetric"),
    todayAnsweredMetric: document.getElementById("todayAnsweredMetric"),
    todayAccuracyMetric: document.getElementById("todayAccuracyMetric"),
    streakMetric: document.getElementById("streakMetric"),
    reviewMetric: document.getElementById("reviewMetric"),
    questionCard: document.getElementById("questionCard"),
    subjectPill: document.getElementById("subjectPill"),
    unitPill: document.getElementById("unitPill"),
    priorityPill: document.getElementById("priorityPill"),
    questionStage: document.getElementById("questionStage"),
    prompt: document.getElementById("prompt"),
    choices: document.getElementById("choices"),
    explanation: document.getElementById("explanation"),
    explanationText: document.getElementById("explanationText"),
    mistakeType: document.getElementById("mistakeType"),
    prevQuestion: document.getElementById("prevQuestion"),
    nextQuestion: document.getElementById("nextQuestion"),
    summary: document.getElementById("summary"),
    summaryText: document.getElementById("summaryText"),
    weakUnitList: document.getElementById("weakUnitList"),
    answeredCount: document.getElementById("answeredCount"),
    accuracyRate: document.getElementById("accuracyRate"),
    studyDaysCount: document.getElementById("studyDaysCount"),
    streakCount: document.getElementById("streakCount"),
    reviewCount: document.getElementById("reviewCount"),
    bankCount: document.getElementById("bankCount"),
    priorityCount: document.getElementById("priorityCount"),
    badgeList: document.getElementById("badgeList"),
    unitTrack: document.getElementById("unitTrack"),
    exportProgress: document.getElementById("exportProgress"),
    importProgress: document.getElementById("importProgress"),
    importProgressFile: document.getElementById("importProgressFile"),
    resetProgress: document.getElementById("resetProgress")
  };

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem("weaknessQuizProgress")) || {};
    } catch (_error) {
      return {};
    }
  }

  function saveProgress() {
    localStorage.setItem("weaknessQuizProgress", JSON.stringify(state.progress));
  }

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem("weaknessQuizStats")) || { daily: {} };
    } catch (_error) {
      return { daily: {} };
    }
  }

  function saveStats() {
    localStorage.setItem("weaknessQuizStats", JSON.stringify(state.stats));
  }

  function loadScratchNotes() {
    try {
      return JSON.parse(localStorage.getItem("weaknessQuizScratchNotes")) || {};
    } catch (_error) {
      return {};
    }
  }

  function saveScratchNotes() {
    localStorage.setItem("weaknessQuizScratchNotes", JSON.stringify(state.scratchNotes));
  }

  function buildSubjectButtons() {
    els.subjectList.innerHTML = "";
    subjects.forEach((subject) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "subject-button";
      button.dataset.subject = subject;
      button.textContent = subject === "all" ? "全教科" : subject;
      if (subject === state.subject) button.classList.add("active");
      button.addEventListener("click", () => {
        state.subject = subject;
        ensureUnitIsAvailable();
        buildSubjectButtons();
        buildCategoryButtons();
        startQuiz();
      });
      els.subjectList.appendChild(button);
    });
  }

  function buildCategoryButtons() {
    const units = availableUnits();
    els.categoryList.innerHTML = "";
    const options = ["all", ...units];
    options.forEach((unit) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-button";
      button.dataset.unit = unit;
      button.textContent = unit === "all" ? labels.unitAll : unit;
      if (unit === state.unit) button.classList.add("active");
      button.addEventListener("click", () => {
        state.unit = unit;
        buildCategoryButtons();
        startQuiz();
      });
      els.categoryList.appendChild(button);
    });
  }

  function availableUnits() {
    return Array.from(new Set(window.QUIZ_QUESTIONS
      .filter((question) => state.subject === "all" || question.subject === state.subject)
      .map((question) => question.unit)))
      .sort((a, b) => unitSortRank(a) - unitSortRank(b) || a.localeCompare(b, "ja"));
  }

  function ensureUnitIsAvailable() {
    if (state.unit === "all") return;
    if (!availableUnits().includes(state.unit)) state.unit = "all";
  }

  function weightQuestion(question) {
    const record = state.progress[question.id] || {};
    let weight = question.priority === "S" ? 6 : question.priority === "A" ? 4 : 2;
    if (questionType(question) === "manipulate") weight += 8;
    if (record.wrong) weight += record.wrong * 4;
    if (record.correct) weight -= Math.min(record.correct, 3);
    return Math.max(1, weight);
  }

  function poolQuestions() {
    let questions = window.QUIZ_QUESTIONS.slice();
    if (state.subject !== "all") {
      questions = questions.filter((question) => question.subject === state.subject);
    }
    if (state.unit !== "all") {
      questions = questions.filter((question) => question.unit === state.unit);
    }
    if (state.mode === "review") {
      questions = questions.filter((question) => (state.progress[question.id] || {}).needsReview);
    }
    if (state.mode === "focus") {
      questions = questions.filter((question) => question.priority === "S" || (state.progress[question.id] || {}).needsReview);
    }
    return questions;
  }

  function pickQuiz() {
    const pool = poolQuestions();
    if (pool.length === 0) return [];
    if (state.mode === "focus") {
      return pool
        .slice()
        .sort(sortForStudyOrder)
        .slice(0, 20);
    }
    const weighted = [];
    pool.forEach((question) => {
      const count = weightQuestion(question);
      for (let i = 0; i < count; i += 1) weighted.push(question);
    });
    const picked = [];
    while (picked.length < 20 && weighted.length > 0) {
      const choice = weighted[Math.floor(Math.random() * weighted.length)];
      if (!picked.some((question) => question.id === choice.id)) {
        picked.push(choice);
      }
      for (let i = weighted.length - 1; i >= 0; i -= 1) {
        if (weighted[i].id === choice.id) weighted.splice(i, 1);
      }
    }
    return picked;
  }

  function unitSortRank(unit) {
    const unitOrder = {
      "方程式": 0,
      "連立方程式": 1,
      "方程式の利用": 2,
      "式の計算": 3,
      "等式変形": 4,
      "式の値": 5,
      "1次関数": 6,
      "反比例": 7,
      "図形": 8,
      "多角形": 9,
      "作図": 10,
      "円": 11,
      "合同": 12,
      "等積変形": 13,
      "空間図形": 14,
      "データの活用": 15
    };
    return unitOrder[unit] ?? 99;
  }

  function sortForStudyOrder(a, b) {
    const priorityOrder = { S: 0, A: 1, B: 2, C: 3 };
    const subjectOrder = { "数学": 0, "理科": 1, "社会": 2, "英語": 3, "国語": 4 };
    const typeOrder = { manipulate: 0, input: 1, "find-error": 2, choice: 3 };
    return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
      || (subjectOrder[a.subject] ?? 9) - (subjectOrder[b.subject] ?? 9)
      || unitSortRank(a.unit) - unitSortRank(b.unit)
      || (typeOrder[questionType(a)] ?? 9) - (typeOrder[questionType(b)] ?? 9)
      || a.id.localeCompare(b.id);
  }

  function startQuiz() {
    state.quiz = pickQuiz();
    state.index = 0;
    state.answers = new Map();
    state.choiceOrders = new Map();
    els.summary.classList.add("hidden");
    els.questionCard.classList.remove("hidden");
    renderTitle();
    renderQuestion();
    renderProgressStats();
    renderUnitTrack();
    renderBadges();
  }

  function renderTitle() {
    const filterLabel = `${subjectLabel()} / ${unitLabel()}`;
    els.quizLabel.textContent = `${labels[state.mode]} / ${filterLabel}`;
    if (state.mode === "review") {
      els.quizTitle.textContent = state.unit === "all" ? "できなかった問題だけを解き直す" : `${state.unit}の間違い直し`;
    } else if (state.mode === "focus") {
      els.quizTitle.textContent = state.unit === "all" ? "数学の土台を中心に集中補修" : `${state.unit}を集中補修`;
    } else {
      els.quizTitle.textContent = state.unit === "all" ? "方程式・図形・理科社会の基礎" : `${state.unit}の基礎確認`;
    }
  }

  function subjectLabel() {
    return state.subject === "all" ? "全教科" : state.subject;
  }

  function unitLabel() {
    return state.unit === "all" ? labels.unitAll : state.unit;
  }

  function renderQuestion() {
    if (state.quiz.length === 0) {
      els.questionCard.classList.add("hidden");
      els.summary.classList.remove("hidden");
      els.summaryText.textContent = state.mode === "review"
        ? "この条件でやり直す問題はありません。別の教科・カテゴリを選ぶか、通常モードで問題を解いてください。"
        : "この条件で出題できる問題がありません。教科・カテゴリ・モードを変更してください。";
      els.weakUnitList.innerHTML = "";
      els.prompt.textContent = "";
      els.choices.innerHTML = "";
      els.explanation.classList.add("hidden");
      els.progressText.textContent = "0 / 0";
      els.scoreText.textContent = "0 正解";
      els.progressMetric.textContent = "0/0";
      els.scoreMetric.textContent = "0";
      els.progressBar.style.width = "0%";
      els.prevQuestion.disabled = true;
      els.nextQuestion.disabled = true;
      return;
    }

    const question = state.quiz[state.index];
    const currentAnswer = state.answers.get(question.id);
    els.subjectPill.textContent = question.subject;
    els.unitPill.textContent = question.unit;
    els.priorityPill.textContent = question.priority;
    els.questionStage.textContent = question.stage || inferStage(question);
    els.prompt.textContent = question.prompt;
    els.explanation.classList.toggle("hidden", currentAnswer === undefined);
    els.explanationText.textContent = question.explanation;
    els.mistakeType.value = (state.progress[question.id] || {}).mistakeType || "";
    renderAnswerArea(question, currentAnswer);
    renderProgressBar();
  }

  function renderAnswerArea(question, currentAnswer) {
    if (questionType(question) === "input") {
      renderInputAnswer(question, currentAnswer);
      return;
    }
    if (questionType(question) === "manipulate") {
      renderManipulateAnswer(question, currentAnswer);
      return;
    }
    renderChoiceAnswer(question, currentAnswer);
  }

  function questionType(question) {
    return question.type || "choice";
  }

  function renderChoiceAnswer(question, currentAnswer) {
    els.choices.innerHTML = "";
    appendScratchPadIfNeeded(question);
    const order = getChoiceOrder(question);
    const selectedChoice = typeof currentAnswer === "object" ? currentAnswer.choiceIndex : currentAnswer;
    order.forEach((choiceIndex, displayIndex) => {
      const choice = question.choices[choiceIndex];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.dataset.label = String.fromCharCode(65 + displayIndex);
      button.textContent = choice;
      if (currentAnswer !== undefined) {
        if (choiceIndex === question.answer) button.classList.add("correct");
        if (choiceIndex === selectedChoice && choiceIndex !== question.answer) button.classList.add("wrong");
        button.disabled = true;
      }
      button.addEventListener("click", () => answerChoiceQuestion(question, choiceIndex));
      els.choices.appendChild(button);
    });
  }

  function renderInputAnswer(question, currentAnswer) {
    els.choices.innerHTML = "";
    appendScratchPadIfNeeded(question);
    const answered = currentAnswer !== undefined;
    const value = typeof currentAnswer === "object" ? currentAnswer.value : "";
    const correct = isStoredAnswerCorrect(question, currentAnswer);

    const wrapper = document.createElement("div");
    wrapper.className = "input-answer";

    const row = document.createElement("div");
    row.className = "input-row";

    const input = document.createElement("input");
    input.className = "answer-input";
    input.type = "text";
    input.inputMode = "text";
    input.autocomplete = "off";
    input.placeholder = question.placeholder || "答えを入力";
    input.value = value;
    input.disabled = answered;

    const button = document.createElement("button");
    button.className = "primary-button";
    button.type = "button";
    button.textContent = "判定";
    button.disabled = answered;

    const feedback = document.createElement("p");
    feedback.className = "input-feedback";
    if (answered) {
      feedback.classList.add(correct ? "correct" : "wrong");
      feedback.textContent = correct
        ? "正解です。計算の流れも同じ形で追えているか確認しましょう。"
        : `不正解です。正解例: ${answerTextLabel(question)}`;
    } else {
      feedback.textContent = "選択肢を見ずに、答えを直接入れます。";
    }

    const submit = () => answerInputQuestion(question, input.value);
    button.addEventListener("click", submit);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submit();
    });

    row.append(input, button);
    wrapper.append(row, feedback);
    els.choices.appendChild(wrapper);
    if (!answered) input.focus({ preventScroll: true });
  }

  function appendScratchPadIfNeeded(question) {
    if (!shouldShowScratchPad(question)) return;
    els.choices.appendChild(renderScratchPad(question));
  }

  function shouldShowScratchPad(question) {
    if (question.subject !== "数学") return false;
    if (questionType(question) === "manipulate") return false;
    return ["方程式", "連立方程式", "1次関数"].includes(question.unit);
  }

  function renderScratchPad(question) {
    const wrapper = document.createElement("section");
    wrapper.className = "scratchpad";
    wrapper.setAttribute("aria-label", "式を動かすメモ");
    const scratch = getScratchState(question);

    const toolbar = document.createElement("div");
    toolbar.className = "scratchpad-toolbar";

    const label = document.createElement("span");
    label.className = "scratchpad-label";
    label.textContent = "式メモ";
    toolbar.appendChild(label);

    const undo = document.createElement("button");
    undo.type = "button";
    undo.className = "scratchpad-clear";
    undo.textContent = "1つ戻す";
    undo.addEventListener("click", () => {
      const line = scratch.lines[scratch.activeLine] || [];
      line.pop();
      saveScratchState(question, scratch);
      refreshWorkspace();
    });

    const addLine = document.createElement("button");
    addLine.type = "button";
    addLine.className = "scratchpad-clear";
    addLine.textContent = "行追加";
    addLine.addEventListener("click", () => {
      scratch.lines.push([]);
      scratch.activeLine = scratch.lines.length - 1;
      saveScratchState(question, scratch);
      refreshWorkspace();
    });

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "scratchpad-clear";
    clear.textContent = "全部消す";
    clear.addEventListener("click", () => {
      scratch.lines = [[], [], []];
      scratch.activeLine = 0;
      saveScratchState(question, scratch);
      refreshWorkspace();
    });
    toolbar.append(undo, addLine, clear);

    const source = document.createElement("div");
    source.className = "scratchpad-source";
    const sourceLabel = document.createElement("span");
    sourceLabel.className = "scratchpad-section-label";
    sourceLabel.textContent = "問題の式";
    const sourceTokens = document.createElement("div");
    sourceTokens.className = "scratchpad-token-row";
    extractScratchTokens(question).forEach((token) => {
      sourceTokens.appendChild(renderScratchSourceToken(question, scratch, token, () => refreshWorkspace()));
    });
    source.append(sourceLabel, sourceTokens);

    const workspace = document.createElement("div");
    workspace.className = "scratchpad-workspace";

    function refreshWorkspace() {
      workspace.innerHTML = "";
      scratch.lines.forEach((line, lineIndex) => {
        const lineButton = document.createElement("button");
        lineButton.type = "button";
        lineButton.className = lineIndex === scratch.activeLine ? "scratch-work-line active" : "scratch-work-line";
        lineButton.dataset.lineIndex = String(lineIndex);
        lineButton.addEventListener("click", () => {
          scratch.activeLine = lineIndex;
          saveScratchState(question, scratch);
          refreshWorkspace();
        });

        const lineLabel = document.createElement("span");
        lineLabel.className = "scratch-line-label";
        lineLabel.textContent = `${lineIndex + 1}`;
        lineButton.appendChild(lineLabel);

        const lineTokens = document.createElement("span");
        lineTokens.className = "scratch-line-tokens";
        if (line.length === 0) {
          const empty = document.createElement("span");
          empty.className = "scratch-line-empty";
          empty.textContent = "ここに式を置く";
          lineTokens.appendChild(empty);
        } else {
          line.forEach((token, tokenIndex) => {
            lineTokens.appendChild(renderScratchPlacedToken(question, scratch, token, lineIndex, tokenIndex, () => refreshWorkspace()));
          });
        }
        lineButton.appendChild(lineTokens);
        workspace.appendChild(lineButton);
      });
    }

    refreshWorkspace();
    wrapper.append(toolbar, source, workspace);
    return wrapper;
  }

  function getScratchState(question) {
    const stored = state.scratchNotes[question.id];
    if (stored && typeof stored === "object" && Array.isArray(stored.lines)) {
      return {
        lines: stored.lines.map((line) => Array.isArray(line) ? line.slice() : tokenizeScratchText(String(line || ""))),
        activeLine: Number.isInteger(stored.activeLine) ? stored.activeLine : 0
      };
    }
    if (typeof stored === "string" && stored.trim()) {
      return {
        lines: stored.split("\n").map(tokenizeScratchText).concat([[], []]).slice(0, 4),
        activeLine: 0
      };
    }
    return { lines: [[], [], []], activeLine: 0 };
  }

  function saveScratchState(question, scratch) {
    const activeLine = Math.min(Math.max(scratch.activeLine || 0, 0), Math.max(scratch.lines.length - 1, 0));
    scratch.activeLine = activeLine;
    state.scratchNotes[question.id] = {
      lines: scratch.lines.map((line) => line.slice()),
      activeLine
    };
    saveScratchNotes();
  }

  function extractScratchTokens(question) {
    const tokens = tokenizeScratchText(question.prompt);
    const baseTokens = tokens.length ? tokens : ["x", "y", "=", "+", "-", "×", "÷", "→"];
    return baseTokens.slice(0, 36);
  }

  function tokenizeScratchText(text) {
    const normalized = String(text || "")
      .normalize("NFKC")
      .replace(/−/g, "-")
      .replace(/[＊*]/g, "×")
      .replace(/[／/]/g, "÷");
    return normalized.match(/±|√|→|[+-]?\d+(?:\.\d+)?[xy](?:²)?|[xy](?:²)?|[+-]?\d+(?:\.\d+)?|[=+\-×÷()]/g) || [];
  }

  function renderScratchSourceToken(question, scratch, token, refreshWorkspace) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scratch-token source";
    button.textContent = token;
    button.addEventListener("click", () => {
      addScratchToken(question, scratch, token);
      refreshWorkspace();
    });
    button.addEventListener("pointerdown", (event) => startScratchTokenDrag(event, question, scratch, token, refreshWorkspace));
    return button;
  }

  function renderScratchPlacedToken(question, scratch, token, lineIndex, tokenIndex, refreshWorkspace) {
    const chip = document.createElement("span");
    chip.className = "scratch-token placed";
    chip.textContent = token;
    chip.title = "タップで消す";
    chip.addEventListener("click", (event) => {
      event.stopPropagation();
      scratch.lines[lineIndex].splice(tokenIndex, 1);
      scratch.activeLine = lineIndex;
      saveScratchState(question, scratch);
      refreshWorkspace();
    });
    return chip;
  }

  function addScratchToken(question, scratch, token, lineIndex = scratch.activeLine) {
    if (!scratch.lines[lineIndex]) scratch.lines[lineIndex] = [];
    scratch.lines[lineIndex].push(token);
    scratch.activeLine = lineIndex;
    saveScratchState(question, scratch);
  }

  function startScratchTokenDrag(event, question, scratch, token, refreshWorkspace) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    const ghost = document.createElement("div");
    ghost.className = "scratch-drag-ghost";
    ghost.textContent = token;
    ghost.style.left = `${event.clientX}px`;
    ghost.style.top = `${event.clientY}px`;
    document.body.appendChild(ghost);

    const move = (moveEvent) => {
      ghost.style.left = `${moveEvent.clientX}px`;
      ghost.style.top = `${moveEvent.clientY}px`;
    };
    const end = (endEvent) => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      ghost.remove();
      const target = document.elementFromPoint(endEvent.clientX, endEvent.clientY)?.closest(".scratch-work-line");
      if (!target) return;
      addScratchToken(question, scratch, token, Number(target.dataset.lineIndex || 0));
      refreshWorkspace();
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end, { once: true });
  }

  function renderManipulateAnswer(question, currentAnswer) {
    els.choices.innerHTML = "";
    const answered = currentAnswer !== undefined;
    const equation = getEquationState(question, currentAnswer);
    const phase = determineEquationPhase(equation.left, equation.right);
    const correct = phase === PHASE.DONE || isStoredAnswerCorrect(question, currentAnswer);

    const wrapper = document.createElement("div");
    wrapper.className = "equation-lab";

    const guide = document.createElement("div");
    guide.className = phase === PHASE.DONE ? "equation-guide done" : "equation-guide";
    guide.textContent = equationGuidance(phase);

    const notebook = document.createElement("div");
    notebook.className = "equation-notebook";

    const history = document.createElement("div");
    history.className = "equation-history";
    equation.history.forEach((line) => {
      const item = document.createElement("div");
      item.textContent = line;
      history.appendChild(item);
    });

    const current = document.createElement("div");
    current.className = phase === PHASE.DONE ? "equation-current done" : "equation-current";

    const left = document.createElement("div");
    left.className = "equation-side left";
    left.dataset.side = "left";
    left.appendChild(renderEquationSide(question, equation, "left", phase, answered));

    const equals = document.createElement("div");
    equals.className = "equation-equals";
    equals.textContent = "=";

    const right = document.createElement("div");
    right.className = "equation-side right";
    right.dataset.side = "right";
    right.appendChild(renderEquationSide(question, equation, "right", phase, answered));

    current.append(left, equals, right);
    notebook.append(history, current);

    const actions = document.createElement("div");
    actions.className = "equation-actions";
    const reset = document.createElement("button");
    reset.className = "ghost-button";
    reset.type = "button";
    reset.textContent = "最初に戻す";
    reset.disabled = answered;
    reset.addEventListener("click", () => resetEquation(question));
    actions.appendChild(reset);

    const feedback = document.createElement("p");
    feedback.className = "input-feedback";
    if (answered || phase === PHASE.DONE) {
      feedback.classList.add(correct ? "correct" : "wrong");
      feedback.textContent = correct
        ? "正解です。式を手で動かして最後まで解けています。"
        : "まだ式の動かし方が崩れています。";
    } else {
      feedback.textContent = "動かせる項だけ色が付きます。計算フェーズでは答えを入力します。";
    }

    wrapper.append(guide, notebook, actions, feedback);
    els.choices.appendChild(wrapper);
  }

  function getEquationState(question, currentAnswer) {
    if (currentAnswer?.equation) return currentAnswer.equation;
    if (!state.equationStates.has(question.id)) {
      state.equationStates.set(question.id, createEquationState(question));
    }
    return state.equationStates.get(question.id);
  }

  function createEquationState(question) {
    return {
      left: cloneTerms(question.left || []),
      right: cloneTerms(question.right || []),
      history: [],
      drag: null
    };
  }

  function cloneTerms(terms) {
    return terms.map((term) => ({ ...term }));
  }

  function resetEquation(question) {
    state.equationStates.set(question.id, createEquationState(question));
    renderAnswerArea(question, undefined);
  }

  function determineEquationPhase(left, right) {
    if (right.some((term) => term.divisor !== undefined)) return PHASE.CALC_DIVIDE;
    if (right.some((term) => term.isSqrt)) return PHASE.CALC_SQRT;
    if (right.some(isVariableTerm)) return PHASE.MOVE_VAR;
    if (left.filter(isVariableTerm).length > 1) return PHASE.CALC_VAR;
    if (left.some((term) => term.type === "const")) return PHASE.MOVE_CONST;
    if (right.filter((term) => term.type === "const").length > 1) return PHASE.CALC_CONST;

    const variable = left.find(isVariableTerm);
    if (variable && variable.coef !== 1) return PHASE.DIVIDE;
    if (variable && variable.type === "x2" && variable.coef === 1) return PHASE.SQUARE_ROOT;
    return PHASE.DONE;
  }

  function isVariableTerm(term) {
    return term.type === "x" || term.type === "x2";
  }

  function equationGuidance(phase) {
    switch (phase) {
      case PHASE.MOVE_VAR:
        return "右辺のxを左辺にドラッグして集めよう";
      case PHASE.CALC_VAR:
        return "左辺のxを計算してまとめよう";
      case PHASE.MOVE_CONST:
        return "左辺の数字を右辺にドラッグして移項しよう";
      case PHASE.CALC_CONST:
        return "右辺の数字を計算してまとめよう";
      case PHASE.DIVIDE:
        return "xの前の数字を右辺にドラッグして割り算しよう";
      case PHASE.CALC_DIVIDE:
        return "割り算の答えを入力しよう";
      case PHASE.SQUARE_ROOT:
        return "x²の2を右辺にドラッグして平方根をとろう";
      case PHASE.CALC_SQRT:
        return "平方根の答えを入力しよう";
      case PHASE.DONE:
        return "正解。方程式が解けました";
      default:
        return "";
    }
  }

  function renderEquationSide(question, equation, side, phase, answered) {
    const terms = side === "left" ? equation.left : equation.right;
    const container = document.createElement("div");
    container.className = "equation-terms";

    if (phase === PHASE.CALC_VAR && side === "left") {
      container.append(renderEquationInput(question, expectedEquationValue(equation, phase), phase), renderVariableSuffix(equation.left));
      equation.left
        .filter((term) => term.type === "const")
        .forEach((term, index) => container.appendChild(renderEquationTerm(question, equation, term, index + 1, side, phase, answered)));
      return container;
    }
    if ((phase === PHASE.CALC_CONST || phase === PHASE.CALC_DIVIDE) && side === "right") {
      container.appendChild(renderEquationInput(question, expectedEquationValue(equation, phase), phase));
      return container;
    }
    if (phase === PHASE.CALC_SQRT && side === "right") {
      const prefix = document.createElement("span");
      prefix.className = "equation-plus-minus";
      prefix.textContent = "±";
      container.append(prefix, renderEquationInput(question, expectedEquationValue(equation, phase), phase));
      return container;
    }

    terms.forEach((term, index) => {
      container.appendChild(renderEquationTerm(question, equation, term, index, side, phase, answered));
    });
    if (terms.length === 0) {
      const zero = document.createElement("span");
      zero.className = "equation-term static";
      zero.textContent = "0";
      container.appendChild(zero);
    }
    return container;
  }

  function renderEquationTerm(question, equation, term, index, side, phase, answered) {
    if (term.divisor !== undefined) {
      const fraction = document.createElement("div");
      fraction.className = "equation-fraction";
      const top = document.createElement("div");
      appendFormattedTerm(top, term.coef, term.type, true);
      const bottom = document.createElement("div");
      bottom.textContent = term.divisor;
      fraction.append(top, bottom);
      return fraction;
    }

    if (term.isSqrt) {
      const sqrt = document.createElement("span");
      sqrt.className = "equation-term sqrt";
      sqrt.textContent = `±√${Math.abs(term.coef)}`;
      return sqrt;
    }

    if (phase === PHASE.SQUARE_ROOT && side === "left" && term.type === "x2") {
      const wrap = document.createElement("div");
      wrap.className = "equation-x2-wrap";
      const base = document.createElement("span");
      appendFormattedTerm(base, term.coef, "x", true);
      const exponent = document.createElement("button");
      exponent.type = "button";
      exponent.className = "equation-exponent draggable";
      exponent.textContent = "2";
      exponent.disabled = answered;
      exponent.addEventListener("pointerdown", (event) => startEquationDrag(event, question, { ...term, isExponent: true }, side));
      wrap.append(base, exponent);
      return wrap;
    }

    const canDrag = !answered && canDragEquationTerm(term, side, phase);
    const button = document.createElement("button");
    button.type = "button";
    button.className = canDrag ? "equation-term draggable" : "equation-term static";
    const displayPrefix = term.prefix
      || (side === "right"
        && term.type === "const"
        && (question.left || []).some((sourceTerm) => sourceTerm.type === "x2")
        && determineEquationPhase(equation.left, equation.right) === PHASE.DONE
        ? "±"
        : "");
    appendFormattedTerm(button, term.coef, term.type, index === 0, displayPrefix);
    button.disabled = !canDrag;
    if (canDrag) {
      button.addEventListener("pointerdown", (event) => startEquationDrag(event, question, term, side));
    }
    return button;
  }

  function canDragEquationTerm(term, side, phase) {
    if (phase === PHASE.MOVE_VAR) return side === "right" && isVariableTerm(term);
    if (phase === PHASE.MOVE_CONST) return side === "left" && term.type === "const";
    if (phase === PHASE.DIVIDE) return side === "left" && isVariableTerm(term);
    return false;
  }

  function renderVariableSuffix(terms) {
    const variable = terms.find(isVariableTerm);
    const suffix = document.createElement("span");
    suffix.className = "equation-var-suffix";
    appendVariable(suffix, variable?.type === "x2" ? "x2" : "x");
    return suffix;
  }

  function renderEquationInput(question, expected, phase) {
    const form = document.createElement("form");
    form.className = "equation-calc";
    const input = document.createElement("input");
    input.className = "equation-calc-input";
    input.type = "text";
    input.inputMode = "numeric";
    input.placeholder = "?";
    const button = document.createElement("button");
    button.type = "submit";
    button.className = "primary-button";
    button.textContent = "確定";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = Number(input.value.trim());
      if (Number.isNaN(value)) return;
      if (value === expected) {
        handleEquationCalculation(question, phase, value);
        return;
      }
      form.classList.remove("shake");
      window.requestAnimationFrame(() => form.classList.add("shake"));
    });
    form.append(input, button);
    setTimeout(() => input.focus({ preventScroll: true }), 0);
    return form;
  }

  function expectedEquationValue(equation, phase) {
    if (phase === PHASE.CALC_VAR) return equation.left.filter(isVariableTerm).reduce((sum, term) => sum + term.coef, 0);
    if (phase === PHASE.CALC_CONST) return equation.right.filter((term) => term.type === "const").reduce((sum, term) => sum + term.coef, 0);
    if (phase === PHASE.CALC_DIVIDE) return equation.right[0].coef / equation.right[0].divisor;
    if (phase === PHASE.CALC_SQRT) return Math.sqrt(equation.right[0].coef);
    return 0;
  }

  function handleEquationCalculation(question, phase, value) {
    const equation = getEquationState(question);
    saveEquationHistory(equation);
    if (phase === PHASE.CALC_VAR) {
      const variable = equation.left.find(isVariableTerm);
      equation.left = [
        { id: uniqueEquationId("l"), coef: value, type: variable.type },
        ...equation.left.filter((term) => term.type === "const")
      ];
    } else if (phase === PHASE.CALC_CONST || phase === PHASE.CALC_DIVIDE) {
      equation.right = [{ id: uniqueEquationId("r"), coef: value, type: "const" }];
    } else if (phase === PHASE.CALC_SQRT) {
      equation.right = [{ id: uniqueEquationId("r"), coef: value, type: "const", prefix: "±" }];
    }
    finishEquationIfDone(question, equation);
    renderQuestion();
  }

  function startEquationDrag(event, question, term, side) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    const equation = getEquationState(question);
    equation.drag = { term, side };
    const ghost = document.createElement("div");
    ghost.className = "equation-drag-ghost";
    ghost.textContent = term.isExponent ? "²" : formatTerm(term.coef, term.type, true, true);
    ghost.style.left = `${event.clientX}px`;
    ghost.style.top = `${event.clientY}px`;
    document.body.appendChild(ghost);

    const move = (moveEvent) => {
      ghost.style.left = `${moveEvent.clientX}px`;
      ghost.style.top = `${moveEvent.clientY}px`;
    };
    const end = (endEvent) => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      ghost.remove();
      const targetSide = document.elementFromPoint(endEvent.clientX, endEvent.clientY)?.closest(".equation-side")?.dataset.side
        || (endEvent.clientX > window.innerWidth / 2 ? "right" : "left");
      handleEquationDrop(question, targetSide);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end, { once: true });
  }

  function handleEquationDrop(question, targetSide) {
    const equation = getEquationState(question);
    const phase = determineEquationPhase(equation.left, equation.right);
    const drag = equation.drag;
    equation.drag = null;
    if (!drag || !targetSide) {
      renderQuestion();
      return;
    }

    if (phase === PHASE.MOVE_VAR && drag.side === "right" && targetSide === "left" && isVariableTerm(drag.term)) {
      saveEquationHistory(equation);
      equation.right = equation.right.filter((term) => term.id !== drag.term.id);
      equation.left.push({ id: uniqueEquationId("l"), coef: drag.term.coef * -1, type: drag.term.type });
    } else if (phase === PHASE.MOVE_CONST && drag.side === "left" && targetSide === "right" && drag.term.type === "const") {
      saveEquationHistory(equation);
      equation.left = equation.left.filter((term) => term.id !== drag.term.id);
      equation.right.push({ id: uniqueEquationId("r"), coef: drag.term.coef * -1, type: "const" });
    } else if (phase === PHASE.DIVIDE && drag.side === "left" && targetSide === "right" && isVariableTerm(drag.term)) {
      saveEquationHistory(equation);
      equation.left = [{ id: uniqueEquationId("l"), coef: 1, type: drag.term.type }];
      equation.right = [{ ...equation.right[0], divisor: drag.term.coef }];
    } else if (phase === PHASE.SQUARE_ROOT && drag.side === "left" && targetSide === "right" && drag.term.isExponent) {
      saveEquationHistory(equation);
      equation.left = [{ id: uniqueEquationId("l"), coef: 1, type: "x" }];
      equation.right = [{ ...equation.right[0], isSqrt: true }];
    }

    finishEquationIfDone(question, equation);
    renderQuestion();
  }

  function finishEquationIfDone(question, equation) {
    if (state.answers.has(question.id)) return;
    if (determineEquationPhase(equation.left, equation.right) !== PHASE.DONE) return;
    if ((question.left || []).some((term) => term.type === "x2") && equation.right.length === 1 && equation.right[0].type === "const") {
      equation.right[0].prefix = "±";
    }
    state.answers.set(question.id, { type: "manipulate", equation: cloneEquationState(equation), correct: true });
    recordQuestionResult(question, true);
  }

  function cloneEquationState(equation) {
    return {
      left: cloneTerms(equation.left),
      right: cloneTerms(equation.right),
      history: equation.history.slice(),
      drag: null
    };
  }

  function saveEquationHistory(equation) {
    equation.history.push(equationToString(equation.left, equation.right));
  }

  function equationToString(left, right) {
    const leftText = left.map((term, index) => formatTerm(term.coef, term.type, index === 0)).join(" ") || "0";
    const rightText = right.map((term, index) => {
      if (term.divisor !== undefined) return `${formatTerm(term.coef, term.type, index === 0)} / ${term.divisor}`;
      if (term.isSqrt) return `±√${Math.abs(term.coef)}`;
      return formatTerm(term.coef, term.type, index === 0, false, term.prefix);
    }).join(" ") || "0";
    return `${leftText} = ${rightText}`;
  }

  function formatTerm(coef, type, isFirst, isDragGhost = false, prefix = "") {
    const sign = coef >= 0 ? "+" : "-";
    const absCoef = Math.abs(coef);
    let value = "";
    if (type === "const") value = String(absCoef);
    if (type === "x") value = absCoef === 1 ? "x" : `${absCoef}x`;
    if (type === "x2") value = absCoef === 1 ? "x²" : `${absCoef}x²`;
    if (prefix) value = `${prefix}${value}`;
    if (isDragGhost) return `${sign} ${value}`;
    if (isFirst && coef >= 0) return value;
    if (isFirst && coef < 0) return `-${value}`;
    return `${sign} ${value}`;
  }

  function appendFormattedTerm(parent, coef, type, isFirst, prefix = "") {
    const sign = coef >= 0 ? "+" : "-";
    const absCoef = Math.abs(coef);
    if (prefix) {
      const prefixSpan = document.createElement("span");
      prefixSpan.className = "math-prefix";
      prefixSpan.textContent = prefix;
      parent.appendChild(prefixSpan);
    }
    if (!(isFirst && coef >= 0) && !prefix) {
      const signSpan = document.createElement("span");
      signSpan.className = "math-sign";
      signSpan.textContent = isFirst && coef < 0 ? "-" : `${sign} `;
      parent.appendChild(signSpan);
    }
    if (type === "const") {
      const number = document.createElement("span");
      number.className = "math-number";
      number.textContent = String(absCoef);
      parent.appendChild(number);
      return;
    }
    if (absCoef !== 1) {
      const coefficient = document.createElement("span");
      coefficient.className = "math-coefficient";
      coefficient.textContent = String(absCoef);
      parent.appendChild(coefficient);
    }
    appendVariable(parent, type);
  }

  function appendVariable(parent, type) {
    const variable = document.createElement("span");
    variable.className = "math-var";
    variable.textContent = type === "y" ? "y" : "x";
    parent.appendChild(variable);
    if (type === "x2") {
      const exponent = document.createElement("sup");
      exponent.className = "math-power";
      exponent.textContent = "2";
      parent.appendChild(exponent);
    }
  }

  function uniqueEquationId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function getChoiceOrder(question) {
    if (!state.choiceOrders.has(question.id)) {
      state.choiceOrders.set(question.id, shuffle(question.choices.map((_choice, index) => index)));
    }
    return state.choiceOrders.get(question.id);
  }

  function shuffle(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function inferStage(question) {
    if (question.priority === "S") return "基礎";
    if (question.priority === "A") return "確認";
    if (question.priority === "B") return "補修";
    return "維持";
  }

  function answerChoiceQuestion(question, choiceIndex) {
    if (state.answers.has(question.id)) return;
    const correct = choiceIndex === question.answer;
    state.answers.set(question.id, { type: questionType(question), choiceIndex, correct });
    recordQuestionResult(question, correct);
  }

  function answerInputQuestion(question, rawValue) {
    if (state.answers.has(question.id)) return;
    const value = rawValue.trim();
    if (!value) return;
    const correct = isTextAnswerCorrect(question, value);
    state.answers.set(question.id, { type: "input", value, correct });
    recordQuestionResult(question, correct);
  }

  function recordQuestionResult(question, correct) {
    const record = state.progress[question.id] || { correct: 0, wrong: 0 };
    if (correct) {
      record.correct = (record.correct || 0) + 1;
      record.needsReview = record.needsReview && state.mode !== "review";
    } else {
      record.wrong = (record.wrong || 0) + 1;
      record.needsReview = true;
    }
    record.lastAnsweredAt = new Date().toISOString();
    state.progress[question.id] = record;
    recordDailyAnswer(correct);
    saveProgress();
    saveStats();
    renderQuestion();
    renderProgressStats();
    renderUnitTrack();
    renderBadges();
  }

  function normalizeAnswer(value) {
    return String(value)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[ \t\r\n]/g, "")
      .replace(/＝/g, "=");
  }

  function isTextAnswerCorrect(question, value) {
    const candidates = Array.isArray(question.answerText) ? question.answerText : [question.answerText];
    const normalized = normalizeAnswer(value);
    return candidates.some((candidate) => normalizeAnswer(candidate) === normalized);
  }

  function answerTextLabel(question) {
    if (Array.isArray(question.answerText)) return question.answerText[0];
    return question.answerText;
  }

  function isStoredAnswerCorrect(question, storedAnswer) {
    if (storedAnswer === undefined) return false;
    if (typeof storedAnswer === "object" && storedAnswer !== null) {
      if (typeof storedAnswer.correct === "boolean") return storedAnswer.correct;
      if (questionType(question) === "input") return isTextAnswerCorrect(question, storedAnswer.value || "");
      if (questionType(question) === "manipulate") return storedAnswer.correct === true;
      return storedAnswer.choiceIndex === question.answer;
    }
    return storedAnswer === question.answer;
  }

  function recordDailyAnswer(correct) {
    const key = todayKey();
    if (!state.stats.daily) state.stats.daily = {};
    if (!state.stats.daily[key]) {
      state.stats.daily[key] = { answered: 0, correct: 0 };
    }
    state.stats.daily[key].answered += 1;
    if (correct) state.stats.daily[key].correct += 1;
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateFromKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function previousDayKey(key) {
    const date = dateFromKey(key);
    date.setDate(date.getDate() - 1);
    return todayKey(date);
  }

  function currentStreak() {
    const daily = state.stats.daily || {};
    let key = todayKey();
    if (!daily[key]?.answered) {
      const yesterday = previousDayKey(key);
      if (!daily[yesterday]?.answered) return 0;
      key = yesterday;
    }
    let streak = 0;
    while (daily[key]?.answered) {
      streak += 1;
      key = previousDayKey(key);
    }
    return streak;
  }

  function dailyTotals() {
    const daily = state.stats.daily || {};
    return Object.values(daily).reduce((totals, day) => {
      totals.answered += day.answered || 0;
      totals.correct += day.correct || 0;
      return totals;
    }, { answered: 0, correct: 0 });
  }

  function renderProgressBar() {
    const total = state.quiz.length;
    const answered = state.answers.size;
    const correct = state.quiz.reduce((count, question) => {
      return isStoredAnswerCorrect(question, state.answers.get(question.id)) ? count + 1 : count;
    }, 0);
    els.progressText.textContent = `${Math.min(state.index + 1, total)} / ${total}`;
    els.scoreText.textContent = `${correct} 正解`;
    els.progressMetric.textContent = `${answered}/${total}`;
    els.scoreMetric.textContent = String(correct);
    els.progressBar.style.width = `${total ? (answered / total) * 100 : 0}%`;
    els.prevQuestion.disabled = state.index === 0;
    els.nextQuestion.disabled = false;
    els.nextQuestion.textContent = state.index === total - 1 ? "結果を見る" : "次へ";
  }

  function renderProgressStats() {
    const records = Object.values(state.progress);
    const totals = dailyTotals();
    const fallbackAnswered = records.reduce((sum, record) => sum + (record.correct || 0) + (record.wrong || 0), 0);
    const fallbackCorrect = records.reduce((sum, record) => sum + (record.correct || 0), 0);
    const answered = totals.answered || fallbackAnswered;
    const correct = totals.answered ? totals.correct : fallbackCorrect;
    const review = records.filter((record) => record.needsReview).length;
    const today = state.stats.daily?.[todayKey()] || { answered: 0, correct: 0 };
    const todayAccuracy = today.answered ? Math.round((today.correct / today.answered) * 100) : 0;
    const studyDays = Object.values(state.stats.daily || {}).filter((day) => day.answered > 0).length;
    const streak = currentStreak();
    els.answeredCount.textContent = String(answered);
    els.accuracyRate.textContent = answered ? `${Math.round((correct / answered) * 100)}%` : "0%";
    els.studyDaysCount.textContent = String(studyDays);
    els.streakCount.textContent = `${streak}日`;
    els.reviewCount.textContent = String(review);
    els.todayAnsweredMetric.textContent = String(today.answered || 0);
    els.todayAccuracyMetric.textContent = `${todayAccuracy}%`;
    els.streakMetric.textContent = `${streak}日`;
    els.reviewMetric.textContent = String(review);
    els.bankCount.textContent = String(window.QUIZ_QUESTIONS.length);
    els.priorityCount.textContent = String(window.QUIZ_QUESTIONS.filter((question) => question.priority === "S" || question.priority === "A").length);
  }

  function renderBadges() {
    const totals = dailyTotals();
    const today = state.stats.daily?.[todayKey()] || { answered: 0, correct: 0 };
    const streak = currentStreak();
    const badges = [
      { label: "今日5問", earned: today.answered >= 5 },
      { label: "今日20問", earned: today.answered >= 20 },
      { label: "正答率80%", earned: today.answered >= 5 && today.correct / today.answered >= 0.8 },
      { label: "3日連続", earned: streak >= 3 },
      { label: "7日連続", earned: streak >= 7 },
      { label: "累計100問", earned: totals.answered >= 100 }
    ];
    els.badgeList.innerHTML = "";
    badges.forEach((badge) => {
      const item = document.createElement("div");
      item.className = badge.earned ? "badge earned" : "badge";
      item.textContent = badge.label;
      els.badgeList.appendChild(item);
    });
  }

  function renderUnitTrack() {
    const rows = Object.values(window.QUIZ_QUESTIONS.reduce((acc, question) => {
      const key = `${question.subject} / ${question.unit}`;
      if (!acc[key]) {
        acc[key] = { key, subject: question.subject, unit: question.unit, total: 0, review: 0, wrong: 0 };
      }
      const record = state.progress[question.id] || {};
      acc[key].total += 1;
      if (record.needsReview) acc[key].review += 1;
      acc[key].wrong += record.wrong || 0;
      return acc;
    }, {}))
      .sort((a, b) => b.review - a.review || b.wrong - a.wrong || b.total - a.total)
      .slice(0, 8);

    els.unitTrack.innerHTML = "";
    rows.forEach((row) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "unit-row";
      item.addEventListener("click", () => {
        state.subject = row.subject;
        state.unit = row.unit;
        ensureUnitIsAvailable();
        buildSubjectButtons();
        buildCategoryButtons();
        startQuiz();
      });

      const header = document.createElement("div");
      header.className = "unit-row-header";
      const name = document.createElement("span");
      name.textContent = row.key;
      const count = document.createElement("span");
      count.textContent = row.review ? `${row.review} 復習` : `${row.total} 問`;
      header.append(name, count);

      const meter = document.createElement("div");
      meter.className = "unit-meter";
      const bar = document.createElement("span");
      const ratio = row.total ? Math.max(row.review / row.total, row.wrong ? 0.18 : 0.06) : 0.06;
      bar.style.width = `${Math.min(100, Math.round(ratio * 100))}%`;
      meter.appendChild(bar);

      item.append(header, meter);
      els.unitTrack.appendChild(item);
    });
  }

  function showSummary() {
    const total = state.quiz.length;
    const correct = state.quiz.reduce((count, question) => {
      return isStoredAnswerCorrect(question, state.answers.get(question.id)) ? count + 1 : count;
    }, 0);
    const today = state.stats.daily?.[todayKey()] || { answered: 0, correct: 0 };
    const todayAccuracy = today.answered ? Math.round((today.correct / today.answered) * 100) : 0;
    const streak = currentStreak();
    els.questionCard.classList.add("hidden");
    els.summary.classList.remove("hidden");
    els.summaryText.textContent = `${total}問中 ${correct}問正解です。今日は${today.answered}問、正答率${todayAccuracy}%、連続${streak}日目です。間違えた単元は「できなかった問題」に回ります。`;
    renderWeakUnits();
  }

  function renderWeakUnits() {
    const misses = {};
    state.quiz.forEach((question) => {
      if (!isStoredAnswerCorrect(question, state.answers.get(question.id))) {
        const key = `${question.subject} / ${question.unit}`;
        misses[key] = (misses[key] || 0) + 1;
      }
    });
    els.weakUnitList.innerHTML = "";
    Object.entries(misses)
      .sort((a, b) => b[1] - a[1])
      .forEach(([unit, count]) => {
        const item = document.createElement("div");
        item.textContent = `${unit}: ${count}問`;
        els.weakUnitList.appendChild(item);
      });
    if (Object.keys(misses).length === 0) {
      const item = document.createElement("div");
      item.textContent = "今回の間違いはありません。次は苦手集中モードで負荷を上げましょう。";
      els.weakUnitList.appendChild(item);
    }
  }

  function exportRecords() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: state.progress,
      stats: state.stats,
      scratchNotes: state.scratchNotes
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weakness-quiz-records-${todayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importRecordsFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const payload = JSON.parse(String(reader.result || "{}"));
        if (!isValidRecordPayload(payload)) {
          alert("読み込める記録ファイルではありません。");
          return;
        }
        if (!confirm("このブラウザの解答記録を、読み込んだ記録で上書きしますか。")) return;
        state.progress = payload.progress || {};
        state.stats = payload.stats || { daily: {} };
        state.scratchNotes = payload.scratchNotes || {};
        saveProgress();
        saveStats();
        saveScratchNotes();
        startQuiz();
      } catch (_error) {
        alert("記録ファイルを読み込めませんでした。");
      } finally {
        els.importProgressFile.value = "";
      }
    });
    reader.readAsText(file);
  }

  function isValidRecordPayload(payload) {
    return payload
      && typeof payload === "object"
      && payload.progress
      && typeof payload.progress === "object"
      && payload.stats
      && typeof payload.stats === "object";
  }

  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      els.modeButtons.forEach((item) => item.classList.toggle("active", item === button));
      startQuiz();
    });
  });

  els.newQuiz.addEventListener("click", startQuiz);
  els.prevQuestion.addEventListener("click", () => {
    if (state.index > 0) {
      state.index -= 1;
      renderQuestion();
    }
  });
  els.nextQuestion.addEventListener("click", () => {
    if (state.index < state.quiz.length - 1) {
      state.index += 1;
      renderQuestion();
      return;
    }
    showSummary();
  });
  els.mistakeType.addEventListener("change", () => {
    const question = state.quiz[state.index];
    const record = state.progress[question.id] || {};
    record.mistakeType = els.mistakeType.value;
    state.progress[question.id] = record;
    saveProgress();
  });
  els.exportProgress.addEventListener("click", exportRecords);
  els.importProgress.addEventListener("click", () => els.importProgressFile.click());
  els.importProgressFile.addEventListener("change", () => importRecordsFromFile(els.importProgressFile.files[0]));
  els.resetProgress.addEventListener("click", () => {
    if (!confirm("このブラウザに保存した解答記録と連続日数をリセットしますか。")) return;
    state.progress = {};
    state.stats = { daily: {} };
    state.scratchNotes = {};
    saveProgress();
    saveStats();
    saveScratchNotes();
    startQuiz();
  });

  buildSubjectButtons();
  buildCategoryButtons();
  startQuiz();
})();
