(function () {
  const state = {
    mode: "daily",
    subject: "all",
    unit: "all",
    quiz: [],
    index: 0,
    answers: new Map(),
    choiceOrders: new Map(),
    progress: loadProgress()
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
    reviewCount: document.getElementById("reviewCount"),
    bankCount: document.getElementById("bankCount"),
    priorityCount: document.getElementById("priorityCount"),
    unitTrack: document.getElementById("unitTrack"),
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
    return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
      || (subjectOrder[a.subject] ?? 9) - (subjectOrder[b.subject] ?? 9)
      || unitSortRank(a.unit) - unitSortRank(b.unit)
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
    renderChoices(question, currentAnswer);
    renderProgressBar();
  }

  function renderChoices(question, currentAnswer) {
    els.choices.innerHTML = "";
    const order = getChoiceOrder(question);
    order.forEach((choiceIndex, displayIndex) => {
      const choice = question.choices[choiceIndex];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.dataset.label = String.fromCharCode(65 + displayIndex);
      button.textContent = choice;
      if (currentAnswer !== undefined) {
        if (choiceIndex === question.answer) button.classList.add("correct");
        if (choiceIndex === currentAnswer && choiceIndex !== question.answer) button.classList.add("wrong");
        button.disabled = true;
      }
      button.addEventListener("click", () => answerQuestion(question, choiceIndex));
      els.choices.appendChild(button);
    });
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

  function answerQuestion(question, choiceIndex) {
    if (state.answers.has(question.id)) return;
    state.answers.set(question.id, choiceIndex);
    const correct = choiceIndex === question.answer;
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
    saveProgress();
    renderQuestion();
    renderProgressStats();
    renderUnitTrack();
  }

  function renderProgressBar() {
    const total = state.quiz.length;
    const answered = state.answers.size;
    const correct = state.quiz.reduce((count, question) => {
      return state.answers.get(question.id) === question.answer ? count + 1 : count;
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
    const answered = records.reduce((sum, record) => sum + (record.correct || 0) + (record.wrong || 0), 0);
    const correct = records.reduce((sum, record) => sum + (record.correct || 0), 0);
    const review = records.filter((record) => record.needsReview).length;
    els.answeredCount.textContent = String(answered);
    els.accuracyRate.textContent = answered ? `${Math.round((correct / answered) * 100)}%` : "0%";
    els.reviewCount.textContent = String(review);
    els.reviewMetric.textContent = String(review);
    els.bankCount.textContent = String(window.QUIZ_QUESTIONS.length);
    els.priorityCount.textContent = String(window.QUIZ_QUESTIONS.filter((question) => question.priority === "S" || question.priority === "A").length);
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
      return state.answers.get(question.id) === question.answer ? count + 1 : count;
    }, 0);
    els.questionCard.classList.add("hidden");
    els.summary.classList.remove("hidden");
    els.summaryText.textContent = `${total}問中 ${correct}問正解です。間違えた単元は復習モードに回ります。`;
    renderWeakUnits();
  }

  function renderWeakUnits() {
    const misses = {};
    state.quiz.forEach((question) => {
      if (state.answers.get(question.id) !== question.answer) {
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
  els.resetProgress.addEventListener("click", () => {
    if (!confirm("このブラウザに保存した解答記録をリセットしますか。")) return;
    state.progress = {};
    saveProgress();
    startQuiz();
  });

  buildSubjectButtons();
  buildCategoryButtons();
  startQuiz();
})();
