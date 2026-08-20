(function () {
  "use strict";

  const routeParams = new URLSearchParams(location.search);
  const CHILD_ID = routeParams.get("child") || "child-2";
  const OFFLINE_MODE = routeParams.get("offline") === "1";
  const STORAGE_KEY = `weaknessQuiz:${CHILD_ID}:eikenVocabProgress`;
  const EXAM_KEY = `weaknessQuiz:${CHILD_ID}:eikenExamProgress`;
  const deck = window.EIKEN_VOCAB_DECKS?.["eiken-grade4-vocab"];
  if (!deck) throw new Error("英検4級単語データを読み込めませんでした。");

  const byId = new Map(deck.items.map((item) => [item.id, item]));
  const els = Object.fromEntries([
    "syncStatus", "homeLink", "dashboardScreen", "dayTitle", "dayLead", "masteryRing",
    "masteredCount", "learnedCount", "todayNewCount", "dueCount", "streakCount",
    "startStudy", "reviewOnly", "openList", "readinessLabel", "readinessDetail",
    "cardScreen", "queueProgress", "queueBar", "leaveStudy", "cardKind", "cardCategory",
    "playWord", "cardPromptLabel", "cardHeadword", "cardPos", "cardReveal", "cardMeaning",
    "cardExample", "cardExampleJa", "cardRelated", "revealCard", "answerChoices",
    "answerFeedback", "resultScreen", "resultCorrect", "resultWrong", "resultNew",
    "resultHome", "listScreen", "closeList", "wordSearch", "wordList"
  ].map((id) => [id, document.getElementById(id)]));

  let progress = loadProgress();
  let queue = [];
  let queueIndex = 0;
  let currentQuestion = null;
  let session = null;
  let cloudReady = false;
  let cloudTimer = 0;
  let advanceTimer = 0;

  function emptyProgress() {
    return {
      version: 1,
      deckId: deck.id,
      startDate: todayKey(),
      entries: {},
      daily: {},
      updatedAt: new Date().toISOString()
    };
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed?.deckId === deck.id) return normalizeProgress(parsed);
    } catch (error) {
      console.warn("Vocabulary progress could not be read", error);
    }
    return emptyProgress();
  }

  function normalizeProgress(value) {
    return {
      ...emptyProgress(),
      ...value,
      entries: value?.entries && typeof value.entries === "object" ? value.entries : {},
      daily: value?.daily && typeof value.daily === "object" ? value.daily : {}
    };
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dayNumber() {
    const start = new Date(`${progress.startDate}T00:00:00`);
    const now = new Date(`${todayKey()}T00:00:00`);
    return Math.max(1, Math.min(28, Math.floor((now - start) / 86400000) + 1));
  }

  function addDays(dateKey, amount) {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() + amount);
    return todayKey(date);
  }

  function entryFor(id) {
    return progress.entries[id] || null;
  }

  function learnedItems() {
    return deck.items.filter((item) => Number(entryFor(item.id)?.attempts) > 0);
  }

  function masteredItems() {
    return deck.items.filter((item) => Boolean(entryFor(item.id)?.masteredAt));
  }

  function isDue(item, date = todayKey()) {
    const entry = entryFor(item.id);
    return Boolean(entry && !entry.masteredAt && entry.reviewDueAt && entry.reviewDueAt <= date);
  }

  function dueItems() {
    return deck.items.filter((item) => isDue(item)).sort((a, b) => {
      const left = entryFor(a.id)?.reviewDueAt || "";
      const right = entryFor(b.id)?.reviewDueAt || "";
      return left.localeCompare(right) || a.order - b.order;
    });
  }

  function availableNewItems() {
    const allowedDay = Math.min(dayNumber(), 21);
    return deck.items.filter((item) => item.day <= allowedDay && !entryFor(item.id));
  }

  function todayRecord() {
    const key = todayKey();
    if (!progress.daily[key]) {
      progress.daily[key] = { attempts: 0, correct: 0, wrong: 0, newLearned: 0, reviews: 0 };
    }
    return progress.daily[key];
  }

  function streak() {
    let count = 0;
    const date = new Date(`${todayKey()}T12:00:00`);
    if (!progress.daily[todayKey(date)]?.attempts) date.setDate(date.getDate() - 1);
    while (progress.daily[todayKey(date)]?.attempts) {
      count += 1;
      date.setDate(date.getDate() - 1);
    }
    return count;
  }

  function readiness() {
    const mastered = masteredItems().length;
    const importantDue = deck.items.filter((item) => item.priority === "S" && isDue(item)).length;
    let examProgress = {};
    try { examProgress = JSON.parse(localStorage.getItem(EXAM_KEY)) || {}; } catch (_) {}
    const attempts = Object.values(examProgress.forms || {})
      .flatMap((form) => Array.isArray(form.attempts) ? form.attempts : [])
      .filter((attempt) => attempt?.completedAt)
      .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
    const lastTwo = attempts.slice(0, 2);
    const mockReady = lastTwo.length === 2
      && new Set(lastTwo.map((attempt) => attempt.formId)).size === 2
      && lastTwo.every((attempt) => Number(attempt.readingScore) >= 28 && Number(attempt.listeningScore) >= 24);
    const ready = learnedItems().length === 420 && mastered >= 378 && importantDue === 0 && mockReady;
    return { ready, mastered, importantDue, mockReady };
  }

  function renderDashboard() {
    clearTimeout(advanceTimer);
    advanceTimer = 0;
    showScreen("dashboardScreen");
    const currentDay = dayNumber();
    const learned = learnedItems().length;
    const mastered = masteredItems().length;
    const due = dueItems().length;
    const daily = todayRecord();
    els.dayTitle.textContent = `${currentDay}日目`;
    els.dayLead.textContent = currentDay <= 21
      ? "新しい20語句と、1・3・7日前の語句を復習します。"
      : "新規はありません。弱点復習と本番ドリルで仕上げます。";
    els.masteredCount.textContent = mastered;
    els.masteryRing.style.setProperty("--progress", `${Math.round(mastered / 420 * 100)}%`);
    els.learnedCount.textContent = learned;
    els.todayNewCount.textContent = `${daily.newLearned || 0}/20`;
    els.dueCount.textContent = due;
    els.streakCount.textContent = `${streak()}日`;
    const newAvailable = availableNewItems().length;
    els.startStudy.disabled = due === 0 && newAvailable === 0;
    els.startStudy.textContent = due || newAvailable
      ? `今日の単語を始める（${due + Math.min(20, newAvailable)}語句）`
      : "今日の学習は完了";
    els.reviewOnly.disabled = due === 0;
    const ready = readiness();
    els.readinessLabel.textContent = ready.ready ? "4級準備OK（アプリ基準）" : "まだ準備中";
    els.readinessDetail.textContent = ready.ready
      ? "420語句に着手し、習得・重要語復習・模試2回連続の全基準を達成しました。公式の合格保証ではありません。"
      : `習得 ${ready.mastered}/378以上・重要語の復習待ち ${ready.importantDue}語・模試2回連続 ${ready.mockReady ? "達成" : "未達"}。公式の合格保証ではありません。`;
  }

  function showScreen(id) {
    ["dashboardScreen", "cardScreen", "resultScreen", "listScreen"].forEach((screenId) => {
      els[screenId].classList.toggle("hidden", screenId !== id);
    });
  }

  function startSession(reviewOnly) {
    const review = dueItems();
    const additions = reviewOnly ? [] : availableNewItems().slice(0, 20);
    queue = interleave(review, additions).map((item) => ({ id: item.id, retry: false }));
    if (!queue.length) return renderDashboard();
    queueIndex = 0;
    session = { correct: 0, wrong: 0, newLearned: 0, answered: 0 };
    showScreen("cardScreen");
    renderCard();
  }

  function interleave(review, additions) {
    const result = [];
    const max = Math.max(review.length, additions.length);
    for (let index = 0; index < max; index += 1) {
      if (review[index]) result.push(review[index]);
      if (additions[index]) result.push(additions[index]);
    }
    return result;
  }

  function nextDirection(item, entry) {
    if (!entry || !entry.attempts) return "english-to-japanese";
    const directions = item.directions || ["english-to-japanese"];
    const preferred = ["japanese-to-english", "audio-to-meaning", "phrase-cloze", "english-to-japanese"];
    const permitted = preferred.filter((value) => directions.includes(value));
    return permitted[(Number(entry.reviewStage) || 0) % Math.max(1, permitted.length)] || directions[0];
  }

  function renderCard() {
    if (queueIndex >= queue.length) return finishSession();
    const queued = queue[queueIndex];
    const item = byId.get(queued.id);
    const entry = entryFor(item.id);
    const isNew = !entry;
    const direction = nextDirection(item, entry);
    currentQuestion = buildQuestion(item, direction);
    els.queueProgress.textContent = `${queueIndex + 1}/${queue.length}`;
    els.queueBar.style.width = `${Math.round(queueIndex / queue.length * 100)}%`;
    els.cardKind.textContent = queued.retry ? "もう一度" : (isNew ? "新しい語句" : "復習");
    els.cardCategory.textContent = item.category;
    els.cardPos.textContent = item.pos;
    els.answerFeedback.textContent = "";
    els.answerFeedback.className = "answer-feedback";
    els.cardReveal.classList.add("hidden");
    els.answerChoices.classList.add("hidden");
    els.answerChoices.replaceChildren();
    els.revealCard.classList.toggle("hidden", !isNew);

    if (isNew) {
      els.cardPromptLabel.textContent = "英語と発音を確認して、意味を考えよう";
      els.cardHeadword.textContent = item.headword;
      fillReveal(item);
    } else {
      els.cardPromptLabel.textContent = currentQuestion.label;
      els.cardHeadword.textContent = currentQuestion.prompt;
      if (direction === "audio-to-meaning") {
        els.cardHeadword.textContent = "🔊 音声を聞こう";
        speak(item.audioText);
      }
      renderChoices();
    }
  }

  function fillReveal(item) {
    els.cardMeaning.textContent = item.meaning;
    els.cardExample.textContent = item.example;
    els.cardExampleJa.textContent = item.exampleJa;
    els.cardRelated.textContent = `関連：${item.related}`;
  }

  function buildQuestion(item, direction) {
    let prompt = item.headword;
    let answer = item.meaning;
    let label = "英語に合う意味を選ぼう";
    let candidates = deck.items.filter((other) => other.id !== item.id && other.kind === item.kind && other.pos === item.pos).map((other) => other.meaning);
    if (direction === "japanese-to-english") {
      prompt = item.meaning;
      answer = item.headword;
      label = "日本語に合う英語を選ぼう";
      candidates = deck.items.filter((other) => other.id !== item.id && other.kind === item.kind && other.pos === item.pos).map((other) => other.headword);
    } else if (direction === "audio-to-meaning") {
      prompt = "音声";
      label = "聞こえた語句の意味を選ぼう";
    } else if (direction === "phrase-cloze") {
      const words = item.headword.split(" ");
      const missingIndex = words.length - 1;
      answer = words[missingIndex];
      words[missingIndex] = "(   )";
      prompt = words.join(" ");
      label = "空所に入る語を選ぼう";
      candidates = deck.items.filter((other) => other.id !== item.id && other.kind === "phrase")
        .map((other) => other.headword.split(" ").at(-1));
    }
    const distractors = deterministicChoices(candidates, answer, item.order, 3);
    return { item, direction, prompt, answer, label, choices: deterministicShuffle([answer, ...distractors], item.order) };
  }

  function deterministicChoices(candidates, answer, seed, count) {
    const unique = [...new Set(candidates.filter((value) => value && value !== answer))];
    const rotated = unique.slice(seed % Math.max(1, unique.length)).concat(unique.slice(0, seed % Math.max(1, unique.length)));
    const fallback = ["いつも", "いっしょに", "あとで", "近くに", "大切な", "もう一度"];
    return [...new Set([...rotated, ...fallback].filter((value) => value !== answer))].slice(0, count);
  }

  function deterministicShuffle(values, seed) {
    return values.map((value, index) => ({ value, key: (seed * 17 + index * 31) % 101 }))
      .sort((a, b) => a.key - b.key).map((row) => row.value);
  }

  function revealNewCard() {
    els.cardReveal.classList.remove("hidden");
    els.revealCard.classList.add("hidden");
    renderChoices();
  }

  function renderChoices() {
    els.answerChoices.replaceChildren(...currentQuestion.choices.map((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice;
      button.addEventListener("click", () => answerQuestion(button, choice));
      return button;
    }));
    els.answerChoices.classList.remove("hidden");
  }

  function answerQuestion(button, choice) {
    if (els.answerChoices.dataset.locked === "true") return;
    els.answerChoices.dataset.locked = "true";
    const correct = choice === currentQuestion.answer;
    [...els.answerChoices.children].forEach((candidate) => {
      candidate.disabled = true;
      if (candidate.textContent === currentQuestion.answer) candidate.classList.add("correct");
    });
    if (!correct) button.classList.add("wrong");
    els.answerFeedback.textContent = correct ? "正解！" : `正解は「${currentQuestion.answer}」`;
    els.answerFeedback.classList.add(correct ? "good" : "bad");
    fillReveal(currentQuestion.item);
    els.cardReveal.classList.remove("hidden");
    recordAnswer(currentQuestion.item, currentQuestion.direction, correct);
    advanceTimer = setTimeout(() => {
      advanceTimer = 0;
      els.answerChoices.dataset.locked = "false";
      queueIndex += 1;
      renderCard();
    }, correct ? 650 : 1250);
  }

  function recordAnswer(item, direction, correct) {
    const date = todayKey();
    const previous = entryFor(item.id);
    const isNew = !previous;
    const entry = previous || {
      attempts: 0, correct: 0, wrong: 0, reviewStage: 0, directions: [], correctDays: [], firstSeenAt: new Date().toISOString()
    };
    entry.attempts += 1;
    entry.correct += correct ? 1 : 0;
    entry.wrong += correct ? 0 : 1;
    entry.lastResult = correct ? "correct" : "wrong";
    entry.lastSeenAt = new Date().toISOString();
    entry.directions = [...new Set([...(entry.directions || []), direction])];
    if (correct) {
      entry.correctDays = [...new Set([...(entry.correctDays || []), date])];
      entry.reviewStage = Math.min(4, (Number(entry.reviewStage) || 0) + 1);
      // 初回学習日から1・3・7日後に当たるよう、各成功後は1・2・4日後へ送る。
      const interval = [1, 1, 2, 4, 0][entry.reviewStage];
      entry.reviewDueAt = interval ? addDays(date, interval) : "";
      if (entry.reviewStage >= 4 && entry.correctDays.length >= 3 && entry.directions.length >= 2) {
        entry.masteredAt = entry.masteredAt || new Date().toISOString();
      }
    } else {
      entry.reviewStage = 0;
      entry.reviewDueAt = addDays(date, 1);
      entry.masteredAt = "";
      const retryPosition = Math.min(queue.length, queueIndex + 4);
      queue.splice(retryPosition, 0, { id: item.id, retry: true });
    }
    progress.entries[item.id] = entry;
    const daily = todayRecord();
    daily.attempts += 1;
    daily.correct += correct ? 1 : 0;
    daily.wrong += correct ? 0 : 1;
    daily.newLearned += isNew ? 1 : 0;
    daily.reviews += isNew ? 0 : 1;
    session.answered += 1;
    session.correct += correct ? 1 : 0;
    session.wrong += correct ? 0 : 1;
    session.newLearned += isNew ? 1 : 0;
    saveProgress();
  }

  function saveProgress() {
    progress.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    scheduleCloudSave();
  }

  function finishSession() {
    els.resultCorrect.textContent = session.correct;
    els.resultWrong.textContent = session.wrong;
    els.resultNew.textContent = session.newLearned;
    showScreen("resultScreen");
    syncCloud();
  }

  function renderWordList(query = "") {
    const needle = query.trim().toLowerCase();
    const fragment = document.createDocumentFragment();
    deck.items.filter((item) => !needle || `${item.headword} ${item.meaning}`.toLowerCase().includes(needle)).forEach((item) => {
      const row = document.createElement("article");
      const entry = entryFor(item.id);
      row.innerHTML = `<b></b><span></span><i></i>`;
      row.children[0].textContent = item.headword;
      row.children[1].textContent = item.meaning;
      row.children[2].textContent = entry?.masteredAt ? "✅" : (entry ? "🌱" : `Day ${item.day}`);
      fragment.append(row);
    });
    els.wordList.replaceChildren(fragment);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    speechSynthesis.speak(utterance);
  }

  function setSync(text, state = "local") {
    els.syncStatus.textContent = text;
    els.syncStatus.dataset.state = state;
  }

  function scheduleCloudSave() {
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(syncCloud, 700);
  }

  async function initCloud() {
    if (OFFLINE_MODE) return setSync("端末保存");
    const cloud = window.WeaknessQuizCloud;
    if (!cloud) return;
    const status = cloud.init();
    if (!status.available) return setSync("端末保存");
    cloud.onAuthStateChanged(async (user) => {
      if (!user) return;
      cloudReady = true;
      setSync("同期中…");
      try {
        const remote = await cloud.getRecord(CHILD_ID);
        if (remote?.eikenVocabulary) {
          progress = mergeProgress(progress, remote.eikenVocabulary);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
          renderDashboard();
        }
        await syncCloud();
      } catch (error) {
        console.warn("Vocabulary cloud load failed", error);
        setSync("端末保存", "error");
      }
    });
    cloud.ensureAnonymousAuth().catch(() => setSync("端末保存", "error"));
  }

  function mergeProgress(local, remote) {
    const left = normalizeProgress(local);
    const right = normalizeProgress(remote);
    const merged = normalizeProgress({
      ...left,
      startDate: [left.startDate, right.startDate].filter(Boolean).sort()[0] || todayKey(),
      updatedAt: [left.updatedAt, right.updatedAt].filter(Boolean).sort().at(-1),
      entries: {}, daily: {}
    });
    for (const id of new Set([...Object.keys(left.entries), ...Object.keys(right.entries)])) {
      const a = left.entries[id];
      const b = right.entries[id];
      if (!a) merged.entries[id] = b;
      else if (!b) merged.entries[id] = a;
      else {
        const newest = String(a.lastSeenAt || "") >= String(b.lastSeenAt || "") ? a : b;
        merged.entries[id] = {
          ...newest,
          attempts: Math.max(Number(a.attempts) || 0, Number(b.attempts) || 0),
          correct: Math.max(Number(a.correct) || 0, Number(b.correct) || 0),
          wrong: Math.max(Number(a.wrong) || 0, Number(b.wrong) || 0),
          reviewStage: Number(newest.reviewStage) || 0,
          directions: [...new Set([...(a.directions || []), ...(b.directions || [])])],
          correctDays: [...new Set([...(a.correctDays || []), ...(b.correctDays || [])])].sort(),
          reviewDueAt: newest.reviewDueAt || "",
          masteredAt: newest.masteredAt || ""
        };
      }
    }
    for (const date of new Set([...Object.keys(left.daily), ...Object.keys(right.daily)])) {
      const a = left.daily[date] || {};
      const b = right.daily[date] || {};
      merged.daily[date] = Object.fromEntries(["attempts", "correct", "wrong", "newLearned", "reviews"]
        .map((key) => [key, Math.max(Number(a[key]) || 0, Number(b[key]) || 0)]));
    }
    return merged;
  }

  async function syncCloud() {
    if (!cloudReady || !window.WeaknessQuizCloud) return;
    setSync("同期中…");
    try {
      await window.WeaknessQuizCloud.saveRecord(CHILD_ID, { eikenVocabulary: progress });
      const verified = await window.WeaknessQuizCloud.getRecord(CHILD_ID, { serverOnly: true });
      if (verified?.eikenVocabulary?.updatedAt !== progress.updatedAt) throw new Error("Cloud verification failed");
      setSync("同期済み", "synced");
    } catch (error) {
      console.warn("Vocabulary cloud save failed", error);
      setSync("端末保存", "error");
    }
  }

  els.homeLink.href = `./?child=${encodeURIComponent(CHILD_ID)}`;
  els.startStudy.addEventListener("click", () => startSession(false));
  els.reviewOnly.addEventListener("click", () => startSession(true));
  els.openList.addEventListener("click", () => { renderWordList(); showScreen("listScreen"); });
  els.closeList.addEventListener("click", renderDashboard);
  els.wordSearch.addEventListener("input", () => renderWordList(els.wordSearch.value));
  els.leaveStudy.addEventListener("click", renderDashboard);
  els.resultHome.addEventListener("click", renderDashboard);
  els.revealCard.addEventListener("click", revealNewCard);
  els.playWord.addEventListener("click", () => currentQuestion && speak(currentQuestion.item.audioText));

  renderDashboard();
  initCloud();
})();
