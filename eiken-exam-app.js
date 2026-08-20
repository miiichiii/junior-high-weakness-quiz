(function () {
  "use strict";

  const routeParams = new URLSearchParams(location.search);
  const CHILD_ID = routeParams.get("child") || "child-2";
  const OFFLINE_MODE = routeParams.get("offline") === "1";
  const STORAGE_KEY = `weaknessQuiz:${CHILD_ID}:eikenExamProgress`;
  const VOCAB_KEY = `weaknessQuiz:${CHILD_ID}:eikenVocabProgress`;
  const examBank = window.EIKEN_GRADE4_EXAMS;
  if (!examBank?.forms?.length) throw new Error("英検4級本番ドリルを読み込めませんでした。");

  const els = Object.fromEntries([
    "examSyncStatus", "examHome", "formsCompleted", "formList", "examRunner",
    "examSectionLabel", "examQuestionNumber", "examTimer", "examExit", "examPartLabel",
    "examProgressBar", "examPassage", "examFigure", "examPrompt", "examPlayAudio",
    "examAudioStatus", "examChoices", "examNext", "sectionBreak", "startListening",
    "examResult", "examResultTitle", "readingScore", "listeningScore", "totalScore",
    "examReadinessResult", "examReviewList", "examResultHome"
  ].map((id) => [id, document.getElementById(id)]));

  let progress = loadProgress();
  let currentForm = null;
  let currentQuestion = null;
  let sectionTimer = 0;
  let answerTimer = 0;
  let cloudTimer = 0;
  let cloudReady = false;
  let audioRunning = false;

  function emptyProgress() {
    return { version: 1, examId: examBank.id, forms: {}, active: null, updatedAt: new Date().toISOString() };
  }

  function normalizeProgress(value) {
    return {
      ...emptyProgress(),
      ...value,
      forms: value?.forms && typeof value.forms === "object" ? value.forms : {},
      active: value?.active && typeof value.active === "object" ? value.active : null
    };
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed?.examId === examBank.id) return normalizeProgress(parsed);
    } catch (error) {
      console.warn("Exam progress could not be read", error);
    }
    return emptyProgress();
  }

  function saveProgress(sync = true) {
    progress.updatedAt = new Date().toISOString();
    if (progress.active) progress.active.updatedAt = progress.updatedAt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    if (sync) scheduleCloudSave();
  }

  function completedAttempts(formId) {
    return (progress.forms[formId]?.attempts || []).filter((attempt) => attempt.completedAt);
  }

  function bestAttempt(formId) {
    return completedAttempts(formId).sort((a, b) => Number(b.totalScore) - Number(a.totalScore))[0] || null;
  }

  function latestAttempts() {
    return Object.values(progress.forms).flatMap((record) => record.attempts || [])
      .filter((attempt) => attempt.completedAt)
      .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  }

  function showScreen(id) {
    ["examHome", "examRunner", "sectionBreak", "examResult"].forEach((screenId) => {
      els[screenId].classList.toggle("hidden", screenId !== id);
    });
  }

  function renderHome() {
    stopTimers();
    cancelSpeech();
    showScreen("examHome");
    const completedForms = examBank.forms.filter((form) => completedAttempts(form.id).length).length;
    els.formsCompleted.textContent = completedForms;
    const scheduleDays = [23, 25, 27];
    const fragment = document.createDocumentFragment();
    examBank.forms.forEach((form, index) => {
      const best = bestAttempt(form.id);
      const active = progress.active?.formId === form.id;
      const card = document.createElement("article");
      card.className = "exam-form-card";
      const copy = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = form.title;
      const detail = document.createElement("p");
      detail.textContent = best
        ? `最高 ${best.totalScore}/65（R ${best.readingScore}/35・L ${best.listeningScore}/30）`
        : `28日計画：${scheduleDays[index]}日目に受験`;
      copy.append(title, detail);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = active ? "続きから" : (best ? "もう一度" : "始める");
      button.addEventListener("click", () => startForm(form));
      card.append(copy, button);
      fragment.append(card);
    });
    els.formList.replaceChildren(fragment);
  }

  function startForm(form) {
    if (progress.active && progress.active.formId !== form.id) {
      const replace = window.confirm("途中の本番ドリルがあります。その中断記録を置き換えて、この回を始めますか？");
      if (!replace) return;
    }
    currentForm = form;
    if (!progress.active || progress.active.formId !== form.id) {
      progress.active = {
        attemptId: `${form.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        formId: form.id,
        index: 0,
        answers: {},
        audioPlays: {},
        startedAt: new Date().toISOString(),
        sectionStartedAt: new Date().toISOString(),
        section: "reading",
        updatedAt: new Date().toISOString()
      };
      saveProgress();
    }
    const active = progress.active;
    if (active.index >= 35 && active.section === "reading") return showSectionBreak();
    showScreen("examRunner");
    renderQuestion();
    startSectionTimer();
  }

  function renderQuestion() {
    clearTimeout(answerTimer);
    cancelSpeech();
    audioRunning = false;
    const active = progress.active;
    if (!active || !currentForm) return renderHome();
    if (active.index >= currentForm.questions.length) return finishExam();
    currentQuestion = currentForm.questions[active.index];
    const listening = currentQuestion.section === "listening";
    els.examSectionLabel.textContent = listening ? "リスニング" : "リーディング";
    els.examQuestionNumber.textContent = listening
      ? `${active.index - 34}/30`
      : `${active.index + 1}/35`;
    els.examPartLabel.textContent = currentQuestion.part;
    const sectionIndex = listening ? active.index - 35 : active.index;
    const sectionTotal = listening ? 30 : 35;
    els.examProgressBar.style.width = `${Math.round(sectionIndex / sectionTotal * 100)}%`;
    els.examPrompt.textContent = currentQuestion.prompt;
    els.examAudioStatus.textContent = "";
    els.examNext.disabled = active.answers[currentQuestion.id] === undefined;
    els.examNext.textContent = active.index === 64 ? "採点する" : "次へ";

    if (currentQuestion.passage) {
      els.examPassage.textContent = currentQuestion.passage;
      els.examPassage.classList.remove("hidden");
    } else {
      els.examPassage.textContent = "";
      els.examPassage.classList.add("hidden");
    }
    renderScene(currentQuestion.scene);

    if (listening) {
      const plays = Number(active.audioPlays[currentQuestion.id]) || 0;
      els.examChoices.classList.add("hidden");
      els.examPlayAudio.classList.toggle("hidden", plays >= 2);
      els.examPlayAudio.disabled = false;
      els.examPlayAudio.textContent = "🔊 音声を開始（2回）";
      if (plays >= 2) {
        renderChoices();
        els.examAudioStatus.textContent = "音声は2回再生済みです。答えを選んでください。";
        startAnswerCountdown();
      }
    } else {
      els.examPlayAudio.classList.add("hidden");
      renderChoices();
    }
  }

  function renderScene(scene) {
    if (!scene) {
      els.examFigure.classList.add("hidden");
      els.examFigure.replaceChildren();
      return;
    }
    const icon = document.createElement("div");
    icon.className = "scene-icon";
    icon.textContent = scene.emoji || "🎧";
    const label = document.createElement("p");
    label.textContent = scene.label || "音声問題";
    els.examFigure.replaceChildren(icon, label);
    els.examFigure.classList.remove("hidden");
  }

  function renderChoices() {
    const active = progress.active;
    const selected = active.answers[currentQuestion.id];
    const numberOnly = currentQuestion.audio?.kind === "response";
    const buttons = currentQuestion.choices.map((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = numberOnly ? String(index + 1) : `${index + 1}. ${choice}`;
      button.setAttribute("aria-label", numberOnly ? `選択肢${index + 1}` : choice);
      button.classList.toggle("selected", selected === index);
      button.addEventListener("click", () => selectAnswer(index));
      return button;
    });
    els.examChoices.replaceChildren(...buttons);
    els.examChoices.classList.remove("hidden");
  }

  function selectAnswer(index) {
    if (!progress.active || audioRunning) return;
    progress.active.answers[currentQuestion.id] = index;
    saveProgress();
    renderChoices();
    els.examNext.disabled = false;
  }

  function nextQuestion() {
    const active = progress.active;
    if (!active || active.answers[currentQuestion.id] === undefined) return;
    clearTimeout(answerTimer);
    active.index += 1;
    if (active.index === 35 && active.section === "reading") {
      saveProgress();
      return showSectionBreak();
    }
    saveProgress();
    if (active.index >= 65) return finishExam();
    renderQuestion();
  }

  function showSectionBreak() {
    stopTimers();
    cancelSpeech();
    showScreen("sectionBreak");
  }

  function beginListening() {
    const active = progress.active;
    active.index = Math.max(35, active.index);
    active.section = "listening";
    active.sectionStartedAt = new Date().toISOString();
    saveProgress();
    showScreen("examRunner");
    renderQuestion();
    startSectionTimer();
  }

  function startSectionTimer() {
    clearInterval(sectionTimer);
    updateSectionTimer();
    sectionTimer = setInterval(updateSectionTimer, 1000);
  }

  function updateSectionTimer() {
    const active = progress.active;
    if (!active) return;
    const minutes = active.section === "listening" ? 30 : 35;
    const deadline = new Date(active.sectionStartedAt).getTime() + minutes * 60000;
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    els.examTimer.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    if (remaining > 0) return;
    if (active.section === "reading") {
      for (let index = active.index; index < 35; index += 1) {
        const id = currentForm.questions[index].id;
        if (active.answers[id] === undefined) active.answers[id] = -1;
      }
      active.index = 35;
      saveProgress();
      showSectionBreak();
    } else {
      for (let index = active.index; index < 65; index += 1) {
        const id = currentForm.questions[index].id;
        if (active.answers[id] === undefined) active.answers[id] = -1;
      }
      active.index = 65;
      saveProgress();
      finishExam();
    }
  }

  function stopTimers() {
    clearInterval(sectionTimer);
    clearTimeout(answerTimer);
  }

  async function playCurrentAudio() {
    if (audioRunning || !currentQuestion?.audio) return;
    audioRunning = true;
    els.examPlayAudio.disabled = true;
    els.examPlayAudio.textContent = "再生中…";
    els.examAudioStatus.textContent = "1回目を聞いています";
    try {
      for (let play = 1; play <= 2; play += 1) {
        els.examAudioStatus.textContent = `${play}回目を聞いています`;
        await speakAudio(currentQuestion.audio);
        if (play === 1) await pause(850);
      }
      progress.active.audioPlays[currentQuestion.id] = 2;
      saveProgress();
      els.examPlayAudio.classList.add("hidden");
      renderChoices();
      startAnswerCountdown();
    } catch (error) {
      console.warn("Audio playback failed", error);
      els.examAudioStatus.textContent = "音声を再生できません。端末の音声設定を確認してください。";
      renderChoices();
    } finally {
      audioRunning = false;
      els.examPlayAudio.disabled = false;
    }
  }

  async function speakAudio(audio) {
    if (!("speechSynthesis" in window)) throw new Error("Speech synthesis unavailable");
    const segments = audio.segments.slice();
    if (audio.spokenChoices?.length) {
      audio.spokenChoices.forEach((choice, index) => {
        segments.push({ speaker: "N", text: `Number ${index + 1}. ${choice}` });
      });
    }
    for (const segment of segments) {
      await speakSegment(segment.text, segment.speaker);
      await pause(220);
    }
  }

  function speakSegment(text, speaker) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.pitch = speaker === "A" ? 1.12 : (speaker === "B" ? 0.88 : 1);
      const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
      if (voices.length) utterance.voice = voices[speaker === "B" && voices.length > 1 ? 1 : 0];
      utterance.onend = resolve;
      utterance.onerror = (event) => reject(event.error || new Error("Speech failed"));
      speechSynthesis.speak(utterance);
    });
  }

  function pause(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function cancelSpeech() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    audioRunning = false;
  }

  function startAnswerCountdown() {
    clearTimeout(answerTimer);
    let seconds = 10;
    const tick = () => {
      if (!progress.active || progress.active.answers[currentQuestion.id] !== undefined) {
        els.examAudioStatus.textContent = "答えを選びました。「次へ」を押してください。";
        return;
      }
      els.examAudioStatus.textContent = `答える時間：あと${seconds}秒`;
      if (seconds <= 0) {
        progress.active.answers[currentQuestion.id] = -1;
        saveProgress();
        els.examAudioStatus.textContent = "時間になりました。次の問題へ進みます。";
        return setTimeout(() => {
          progress.active.index += 1;
          saveProgress();
          if (progress.active.index >= 65) finishExam(); else renderQuestion();
        }, 500);
      }
      seconds -= 1;
      answerTimer = setTimeout(tick, 1000);
    };
    tick();
  }

  function finishExam() {
    stopTimers();
    cancelSpeech();
    const active = progress.active;
    if (!active || !currentForm) return renderHome();
    const reading = currentForm.questions.slice(0, 35).filter((q) => active.answers[q.id] === q.answer).length;
    const listening = currentForm.questions.slice(35).filter((q) => active.answers[q.id] === q.answer).length;
    const attempt = {
      attemptId: active.attemptId,
      formId: currentForm.id,
      startedAt: active.startedAt,
      completedAt: new Date().toISOString(),
      readingScore: reading,
      listeningScore: listening,
      totalScore: reading + listening,
      answers: { ...active.answers }
    };
    progress.forms[currentForm.id] = progress.forms[currentForm.id] || { attempts: [] };
    const attempts = progress.forms[currentForm.id].attempts || [];
    if (!attempts.some((row) => row.attemptId === attempt.attemptId)) attempts.push(attempt);
    progress.forms[currentForm.id].attempts = attempts;
    progress.active = null;
    saveProgress();
    renderResult(attempt);
    syncCloud();
  }

  function renderResult(attempt) {
    showScreen("examResult");
    els.examResultTitle.textContent = `${currentForm.title} 完了`;
    els.readingScore.textContent = `${attempt.readingScore}/35`;
    els.listeningScore.textContent = `${attempt.listeningScore}/30`;
    els.totalScore.textContent = `${attempt.totalScore}/65`;
    const thisPass = attempt.readingScore >= 28 && attempt.listeningScore >= 24;
    const ready = readiness();
    els.examReadinessResult.textContent = ready.ready
      ? "4級準備OK（アプリ基準）— 公式の合格保証ではありません。"
      : (thisPass ? "今回の模試基準は達成。別の回でも連続達成を目指そう。" : "目標はリーディング28・リスニング24。間違いを復習しよう。");
    const fragment = document.createDocumentFragment();
    currentForm.questions.filter((q) => attempt.answers[q.id] !== q.answer).forEach((question, index) => {
      const article = document.createElement("article");
      article.className = "exam-review-item";
      const heading = document.createElement("b");
      heading.textContent = `${question.section === "reading" ? "R" : "L"}${question.section === "reading" ? currentForm.questions.indexOf(question) + 1 : currentForm.questions.indexOf(question) - 34} ${question.part}`;
      const prompt = document.createElement("p");
      prompt.textContent = question.prompt;
      const answer = document.createElement("p");
      answer.textContent = `正解：${question.choices[question.answer]}`;
      const explanation = document.createElement("p");
      explanation.textContent = question.explanation;
      article.append(heading, prompt, answer, explanation);
      if (question.audio) {
        const transcript = document.createElement("p");
        transcript.textContent = `放送文：${question.audio.segments.map((row) => row.text).join(" ")}`;
        article.append(transcript);
      }
      fragment.append(article);
    });
    if (!fragment.childNodes.length) {
      const perfect = document.createElement("p");
      perfect.textContent = "全問正解です。";
      fragment.append(perfect);
    }
    els.examReviewList.replaceChildren(fragment);
  }

  function readiness() {
    let vocab = {};
    try { vocab = JSON.parse(localStorage.getItem(VOCAB_KEY)) || {}; } catch (_) {}
    const entries = Object.values(vocab.entries || {});
    const learned = entries.filter((entry) => Number(entry.attempts) > 0).length;
    const mastered = entries.filter((entry) => entry.masteredAt).length;
    const today = localDayKey();
    const vocabItems = new Map((window.EIKEN_VOCAB_DECKS?.["eiken-grade4-vocab"]?.items || []).map((item) => [item.id, item]));
    const importantDue = Object.entries(vocab.entries || {}).filter(([id, entry]) => (
      vocabItems.get(id)?.priority === "S" && !entry.masteredAt && entry.reviewDueAt && entry.reviewDueAt <= today
    )).length;
    const lastTwo = latestAttempts().slice(0, 2);
    const mocks = lastTwo.length === 2 && new Set(lastTwo.map((attempt) => attempt.formId)).size === 2
      && lastTwo.every((attempt) => attempt.readingScore >= 28 && attempt.listeningScore >= 24);
    return { ready: learned === 420 && mastered >= 378 && importantDue === 0 && mocks };
  }

  function localDayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function setSync(text, state = "local") {
    els.examSyncStatus.textContent = text;
    els.examSyncStatus.dataset.state = state;
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
        if (remote?.eikenExam) {
          progress = mergeProgress(progress, remote.eikenExam);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
          renderHome();
        }
        await syncCloud();
      } catch (error) {
        console.warn("Exam cloud load failed", error);
        setSync("端末保存", "error");
      }
    });
    cloud.ensureAnonymousAuth().catch(() => setSync("端末保存", "error"));
  }

  function mergeProgress(local, remote) {
    const left = normalizeProgress(local);
    const right = normalizeProgress(remote);
    const merged = normalizeProgress({ ...left, forms: {}, active: null });
    for (const form of examBank.forms) {
      const attempts = [...(left.forms[form.id]?.attempts || []), ...(right.forms[form.id]?.attempts || [])];
      const unique = new Map(attempts.map((attempt) => [attempt.attemptId, attempt]));
      merged.forms[form.id] = { attempts: [...unique.values()].sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt))) };
    }
    const completedIds = new Set(Object.values(merged.forms).flatMap((record) => record.attempts || []).map((attempt) => attempt.attemptId));
    const candidates = [left.active, right.active].filter((active) => active && !completedIds.has(active.attemptId));
    merged.active = candidates.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0] || null;
    merged.updatedAt = [left.updatedAt, right.updatedAt].filter(Boolean).sort().at(-1) || new Date().toISOString();
    return merged;
  }

  async function syncCloud() {
    if (!cloudReady || !window.WeaknessQuizCloud) return;
    setSync("同期中…");
    try {
      await window.WeaknessQuizCloud.saveRecord(CHILD_ID, { eikenExam: progress });
      const verified = await window.WeaknessQuizCloud.getRecord(CHILD_ID, { serverOnly: true });
      if (verified?.eikenExam?.updatedAt !== progress.updatedAt) throw new Error("Cloud verification failed");
      setSync("同期済み", "synced");
    } catch (error) {
      console.warn("Exam cloud save failed", error);
      setSync("端末保存", "error");
    }
  }

  els.examNext.addEventListener("click", nextQuestion);
  els.examPlayAudio.addEventListener("click", playCurrentAudio);
  els.startListening.addEventListener("click", beginListening);
  els.examExit.addEventListener("click", renderHome);
  els.examResultHome.addEventListener("click", renderHome);
  window.addEventListener("beforeunload", () => { cancelSpeech(); stopTimers(); });

  renderHome();
  initCloud();
})();
