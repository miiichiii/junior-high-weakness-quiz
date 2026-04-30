(function () {
  const state = {
    mode: "daily",
    subject: "all",
    quiz: [],
    index: 0,
    answers: new Map(),
    progress: loadProgress()
  };

  const subjects = ["all", "数学", "理科", "社会", "英語", "国語"];
  const labels = {
    all: "全教科",
    daily: "今日の20問",
    focus: "苦手集中",
    review: "復習"
  };

  const els = {
    subjectList: document.getElementById("subjectList"),
    modeButtons: Array.from(document.querySelectorAll(".mode-button")),
    quizLabel: document.getElementById("quizLabel"),
    quizTitle: document.getElementById("quizTitle"),
    newQuiz: document.getElementById("newQuiz"),
    progressText: document.getElementById("progressText"),
    scoreText: document.getElementById("scoreText"),
    progressBar: document.getElementById("progressBar"),
    questionCard: document.getElementById("questionCard"),
    subjectPill: document.getElementById("subjectPill"),
    unitPill: document.getElementById("unitPill"),
    priorityPill: document.getElementById("priorityPill"),
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
        buildSubjectButtons();
        startQuiz();
      });
      els.subjectList.appendChild(button);
    });
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

  function startQuiz() {
    state.quiz = pickQuiz();
    state.index = 0;
    state.answers = new Map();
    els.summary.classList.add("hidden");
    els.questionCard.classList.remove("hidden");
    renderTitle();
    renderQuestion();
    renderProgressStats();
  }

  function renderTitle() {
    els.quizLabel.textContent = `${labels[state.mode]} / ${state.subject === "all" ? "全教科" : state.subject}`;
    if (state.mode === "review") {
      els.quizTitle.textContent = "間違えた問題を解き直す";
    } else if (state.mode === "focus") {
      els.quizTitle.textContent = "数学の土台を中心に集中補修";
    } else {
      els.quizTitle.textContent = "方程式・図形・理科社会の基礎";
    }
  }

  function renderQuestion() {
    if (state.quiz.length === 0) {
      els.questionCard.classList.add("hidden");
      els.summary.classList.remove("hidden");
      els.summaryText.textContent = "この条件で出題できる問題がありません。教科かモードを変更してください。";
      els.weakUnitList.innerHTML = "";
      els.progressText.textContent = "0 / 0";
      els.scoreText.textContent = "0 正解";
      els.progressBar.style.width = "0%";
      return;
    }

    const question = state.quiz[state.index];
    const currentAnswer = state.answers.get(question.id);
    els.subjectPill.textContent = question.subject;
    els.unitPill.textContent = question.unit;
    els.priorityPill.textContent = question.priority;
    els.prompt.textContent = question.prompt;
    els.explanation.classList.toggle("hidden", currentAnswer === undefined);
    els.explanationText.textContent = question.explanation;
    els.mistakeType.value = (state.progress[question.id] || {}).mistakeType || "";
    renderChoices(question, currentAnswer);
    renderProgressBar();
  }

  function renderChoices(question, currentAnswer) {
    els.choices.innerHTML = "";
    question.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.textContent = choice;
      if (currentAnswer !== undefined) {
        if (index === question.answer) button.classList.add("correct");
        if (index === currentAnswer && index !== question.answer) button.classList.add("wrong");
      }
      button.addEventListener("click", () => answerQuestion(question, index));
      els.choices.appendChild(button);
    });
  }

  function answerQuestion(question, choiceIndex) {
    state.answers.set(question.id, choiceIndex);
    const correct = choiceIndex === question.answer;
    const record = state.progress[question.id] || { correct: 0, wrong: 0 };
    if (correct) {
      record.correct = (record.correct || 0) + 1;
      record.needsReview = false;
    } else {
      record.wrong = (record.wrong || 0) + 1;
      record.needsReview = true;
    }
    record.lastAnsweredAt = new Date().toISOString();
    state.progress[question.id] = record;
    saveProgress();
    renderQuestion();
    renderProgressStats();
  }

  function renderProgressBar() {
    const total = state.quiz.length;
    const answered = state.answers.size;
    const correct = state.quiz.reduce((count, question) => {
      return state.answers.get(question.id) === question.answer ? count + 1 : count;
    }, 0);
    els.progressText.textContent = `${Math.min(state.index + 1, total)} / ${total}`;
    els.scoreText.textContent = `${correct} 正解`;
    els.progressBar.style.width = `${total ? (answered / total) * 100 : 0}%`;
    els.prevQuestion.disabled = state.index === 0;
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
  startQuiz();
})();

