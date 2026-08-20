(function (global) {
  "use strict";

  const PROFILES = {
    "child-1": { name: "長男", grade: "中3" },
    "child-2": { name: "子供2", grade: "中2" },
    "child-3": { name: "子供3", grade: "小4" }
  };

  const CHILD1_MODULES = [
    ["challenge-social-geography", "地理", "🌏"],
    ["challenge-social-history", "歴史", "🏯"],
    ["challenge-social-civics", "公民", "🏛️"],
    ["challenge-science-year1", "理科1年", "🧪"],
    ["challenge-science-year2", "理科2年", "⚡"]
  ];

  const CHILD1_EXTRA_PACKS = {
    "science-ion-drill": { label: "理科 水溶液とイオン", emoji: "⚗️", available: 30, prefix: "science-ion-" },
    "social-author-drill": { label: "社会 作家・文化人", emoji: "📚", available: 80, prefix: "social-author-" },
    "term-2026-07-13": { label: "5教科 定期テスト", emoji: "📝", available: 200, prefix: "term-20260713-" }
  };

  const EIKEN_MODULES = [
    ["eiken-grade4", "英検4級 基礎100問", "🇬🇧"],
    ["eiken-grade4-vocab", "英検4級 単語帳420", "🗂️"],
    ["eiken-grade4-exam", "英検4級 本番ドリル", "🎧"]
  ];

  const CHILD3_MODULES = [
    ["kanji-summer-2026", "夏休み 漢字マスター", "✍️"],
    ["math4-mult-div", "夏休み 算数マスター", "🔢"]
  ];

  function object(value) {
    return value && typeof value === "object" ? value : {};
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function hasNumber(value) {
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  }

  function percent(correct, answered) {
    return answered > 0 ? Math.round((correct / answered) * 100) : null;
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function parseNow(value) {
    const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value || Date.now());
    if (!Number.isFinite(parsed.getTime())) throw new Error("now must be a valid Date or date value");
    return parsed;
  }

  function sevenDayKeys(now) {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now.getTime());
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return dateKey(date);
    });
  }

  function latestIso(values) {
    let latest = 0;
    values.flat(Infinity).forEach((value) => {
      if (value === null || value === undefined || value === "") return;
      const time = typeof value === "number" ? value : Date.parse(value);
      if (Number.isFinite(time) && time > latest) latest = time;
    });
    return latest ? new Date(latest).toISOString() : null;
  }

  function nullDaily(now) {
    return sevenDayKeys(now).map((date) => ({ date, answered: null }));
  }

  function dailySeries(now, daily, field = "answered") {
    const rows = object(daily);
    return sevenDayKeys(now).map((date) => ({ date, answered: number(rows[date]?.[field]) }));
  }

  function combineDaily(now, sources) {
    return sevenDayKeys(now).map((date) => ({
      date,
      answered: sources.reduce((sum, source) => sum + number(source?.[date]?.answered), 0)
    }));
  }

  function sumDaily(daily7) {
    return daily7.reduce((sum, row) => sum + number(row.answered), 0);
  }

  function modulePlaceholder([id, label, emoji]) {
    return { id, label, emoji, progressLabel: "--", total: null, accuracy: null, review: null, lastLearningAt: null };
  }

  function emptySummary(childId, now) {
    const profile = PROFILES[childId];
    const modules = childId === "child-1" ? CHILD1_MODULES
      : childId === "child-2" ? EIKEN_MODULES
        : CHILD3_MODULES;
    return {
      name: profile.name,
      grade: profile.grade,
      today: null,
      week: null,
      total: null,
      accuracy: null,
      review: null,
      lastLearningAt: null,
      daily7: nullDaily(now),
      modules: modules.map(modulePlaceholder)
    };
  }

  function recordName(record, fallback) {
    if (fallback === "長男") return fallback;
    const value = record?.learnerChild?.name || record?.child?.name;
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function child1Summary(record, now) {
    const empty = emptySummary("child-1", now);
    if (!record) return empty;
    const progress = object(record.learnerProgress || record.progress);
    const stats = object(record.learnerStats || record.stats);
    const challengeView = global.ChallengeParentView;
    if (!challengeView || typeof challengeView.summary !== "function") {
      return { ...empty, name: recordName(record, empty.name) };
    }

    const challenge = challengeView.summary(progress, stats);
    const dailySources = challenge.courses.map((course) => {
      const result = {};
      Object.entries(object(course.daily)).forEach(([date, value]) => {
        result[date] = { answered: number(value?.answered) };
      });
      return result;
    });
    const challengeCourseAccuracy = challenge.courses.map((course) => {
      const answered = number(course.totalAttempts);
      const meta = object(stats.packs?.[course.id]);
      const correctKnown = answered === 0 || hasNumber(meta.correct);
      return { answered, correct: number(meta.correct), correctKnown };
    });
    const modules = challenge.courses.map((course, index) => ({
      id: course.id,
      label: course.label,
      emoji: course.emoji,
      progressLabel: `${number(course.attempted)}/${number(course.total)}問に着手`,
      total: number(course.totalAttempts),
      accuracy: challengeCourseAccuracy[index].correctKnown
        ? percent(challengeCourseAccuracy[index].correct, challengeCourseAccuracy[index].answered)
        : null,
      review: number(course.review),
      lastLearningAt: latestIso([course.latestAt])
    }));
    const extraParts = Object.entries(object(stats.packs))
      .filter(([packId, meta]) => !packId.startsWith("challenge-") && number(meta?.answered) > 0)
      .map(([packId, meta]) => {
        const config = CHILD1_EXTRA_PACKS[packId] || { label: packId, emoji: "📘", available: null, prefix: "" };
        const entries = config.prefix
          ? Object.entries(progress).filter(([id]) => id.startsWith(config.prefix))
          : [];
        const attempted = entries.filter(([, row]) => row?.packFirstAttemptRecorded || number(row?.packAttempts) > 0).length;
        const review = entries.filter(([, row]) => row?.needsReview).length;
        const answered = Math.max(number(meta?.answered), entries.reduce((sum, [, row]) => sum + number(row?.packAttempts), 0));
        const correctKnown = hasNumber(meta?.correct);
        const correct = number(meta?.correct);
        const daily = {};
        Object.entries(object(meta?.daily)).forEach(([date, row]) => {
          daily[date] = { answered: number(row?.answered), correct: number(row?.correct) };
        });
        return {
          answered,
          correct,
          correctKnown,
          review,
          daily,
          module: {
            id: packId,
            label: config.label,
            emoji: config.emoji,
            progressLabel: config.available ? `${attempted}/${config.available}問に着手` : `${attempted}問に着手`,
            total: answered,
            accuracy: correctKnown ? percent(correct, answered) : null,
            review,
            lastLearningAt: latestIso([meta?.lastAnsweredAt, entries.map(([, row]) => row?.lastAnsweredAt)])
          }
        };
      });
    const normalDaily = object(stats.daily);
    const normalRows = Object.values(normalDaily);
    const normalAnswered = normalRows.reduce((sum, row) => sum + number(row?.answered), 0);
    const normalCorrectKnown = normalRows.every((row) => number(row?.answered) === 0 || hasNumber(row?.correct));
    const normalCorrect = normalRows.reduce((sum, row) => sum + number(row?.correct), 0);
    const normalProgress = Object.entries(progress).filter(([, row]) => (
      !row?.packFirstAttemptRecorded && !number(row?.packAttempts)
        && (number(row?.correct) > 0 || number(row?.wrong) > 0)
    ));
    const normalReview = normalProgress.filter(([, row]) => row?.needsReview).length;
    const normalLatestDay = Object.entries(normalDaily)
      .filter(([, row]) => number(row?.answered) > 0)
      .map(([date]) => `${date}T12:00:00`)
      .sort()
      .at(-1) || null;
    if (normalAnswered > 0) {
      const daily = {};
      Object.entries(normalDaily).forEach(([date, row]) => {
        daily[date] = { answered: number(row?.answered), correct: number(row?.correct) };
      });
      extraParts.push({
        answered: normalAnswered,
        correct: normalCorrect,
        correctKnown: normalCorrectKnown,
        review: normalReview,
        daily,
        module: {
          id: "regular-entrance-practice",
          label: "受験対策 通常問題",
          emoji: "🎯",
          progressLabel: `${normalProgress.length}問に着手`,
          total: normalAnswered,
          accuracy: normalCorrectKnown ? percent(normalCorrect, normalAnswered) : null,
          review: normalReview,
          lastLearningAt: latestIso([normalLatestDay, normalProgress.map(([, row]) => row?.lastAnsweredAt || row?.lastAttemptAt)])
        }
      });
    }
    extraParts.forEach((part) => dailySources.push(part.daily));
    const daily7 = combineDaily(now, dailySources);
    const extraAnswered = extraParts.reduce((sum, part) => sum + part.answered, 0);
    const extraCorrect = extraParts.reduce((sum, part) => sum + part.correct, 0);
    const extraReview = extraParts.reduce((sum, part) => sum + part.review, 0);
    const challengeAnswered = challengeCourseAccuracy.reduce((sum, part) => sum + part.answered, 0);
    const challengeCorrect = challengeCourseAccuracy.reduce((sum, part) => sum + part.correct, 0);
    const accuracyKnown = challengeCourseAccuracy.every((part) => part.correctKnown)
      && extraParts.every((part) => part.correctKnown);
    const total = challengeAnswered + extraAnswered;
    const correct = challengeCorrect + extraCorrect;
    return {
      name: recordName(record, empty.name),
      grade: empty.grade,
      today: number(daily7[daily7.length - 1]?.answered),
      week: sumDaily(daily7),
      total,
      accuracy: accuracyKnown ? percent(correct, total) : null,
      review: number(challenge.review) + extraReview,
      lastLearningAt: latestIso([challenge.latestAt, extraParts.map((part) => part.module.lastLearningAt)]),
      daily7,
      modules: [...modules, ...extraParts.map((part) => part.module)]
    };
  }

  function packProgress(progress, stats) {
    const entries = Object.entries(object(progress)).filter(([id]) => id.startsWith("eiken4-"));
    const packStats = object(stats?.packs?.["eiken-grade4"]);
    const attempted = entries.filter(([, row]) => row?.packFirstAttemptRecorded || number(row?.packAttempts) > 0).length;
    const progressAnswered = entries.reduce((sum, [, row]) => sum + number(row?.packAttempts), 0);
    const progressCorrect = entries.reduce((sum, [, row]) => sum + number(row?.packCorrect), 0);
    const statsAnswered = hasNumber(packStats.answered) ? number(packStats.answered) : null;
    const statsCorrect = hasNumber(packStats.correct) ? number(packStats.correct) : null;
    const answered = Math.max(progressAnswered, statsAnswered === null ? 0 : statsAnswered);
    const correct = statsCorrect === null ? progressCorrect : statsCorrect;
    const review = entries.filter(([, row]) => row?.needsReview).length;
    const daily = {};
    Object.entries(object(packStats.daily)).forEach(([date, row]) => {
      daily[date] = { answered: number(row?.answered), correct: number(row?.correct) };
    });
    return {
      answered,
      correct,
      review,
      daily,
      module: {
        id: EIKEN_MODULES[0][0],
        label: EIKEN_MODULES[0][1],
        emoji: EIKEN_MODULES[0][2],
        progressLabel: `${attempted}/100問に着手`,
        total: answered,
        accuracy: percent(correct, answered),
        review,
        lastLearningAt: latestIso([packStats.lastAnsweredAt, entries.map(([, row]) => row?.lastAnsweredAt)])
      }
    };
  }

  function vocabProgress(field, today) {
    const vocab = object(field);
    const entries = Object.entries(object(vocab.entries));
    const answered = entries.reduce((sum, [, row]) => sum + number(row?.attempts), 0);
    const correct = entries.reduce((sum, [, row]) => sum + number(row?.correct), 0);
    const learned = entries.filter(([, row]) => number(row?.attempts) > 0).length;
    const mastered = entries.filter(([, row]) => Boolean(row?.masteredAt)).length;
    const review = entries.filter(([, row]) => (
      !row?.masteredAt && row?.reviewDueAt && String(row.reviewDueAt) <= today
    )).length;
    const daily = {};
    Object.entries(object(vocab.daily)).forEach(([date, row]) => {
      daily[date] = { answered: number(row?.attempts), correct: number(row?.correct) };
    });
    return {
      answered,
      correct,
      review,
      daily,
      module: {
        id: EIKEN_MODULES[1][0],
        label: EIKEN_MODULES[1][1],
        emoji: EIKEN_MODULES[1][2],
        progressLabel: `${learned}/420語学習・${mastered}語習得`,
        total: answered,
        accuracy: percent(correct, answered),
        review,
        lastLearningAt: latestIso([vocab.updatedAt, entries.map(([, row]) => row?.lastSeenAt)])
      }
    };
  }

  function examProgress(field) {
    const exam = object(field);
    const attempts = [];
    Object.entries(object(exam.forms)).forEach(([formId, form]) => {
      const rows = Array.isArray(form?.attempts) ? form.attempts : [];
      rows.forEach((row) => {
        if (row?.completedAt) attempts.push({ ...row, formId: row.formId || formId });
      });
    });
    const answered = attempts.length * 65;
    const correct = attempts.reduce((sum, row) => sum + number(row.totalScore), 0);
    const completedForms = new Set(attempts.map((row) => row.formId)).size;
    const daily = {};
    attempts.forEach((row) => {
      const date = dateKey(new Date(row.completedAt));
      if (!daily[date]) daily[date] = { answered: 0, correct: 0 };
      daily[date].answered += 65;
      daily[date].correct += number(row.totalScore);
    });
    return {
      answered,
      correct,
      review: null,
      daily,
      module: {
        id: EIKEN_MODULES[2][0],
        label: EIKEN_MODULES[2][1],
        emoji: EIKEN_MODULES[2][2],
        progressLabel: `${completedForms}/3回完了`,
        total: answered,
        accuracy: percent(correct, answered),
        review: null,
        lastLearningAt: latestIso([
          attempts.map((row) => row.completedAt),
          exam.active?.updatedAt,
          exam.active?.startedAt,
          attempts.length || exam.active ? exam.updatedAt : null
        ])
      }
    };
  }

  function child2Summary(record, now) {
    const empty = emptySummary("child-2", now);
    if (!record) return empty;
    const base = packProgress(object(record.progress), object(record.stats));
    const vocab = vocabProgress(record.eikenVocabulary, dateKey(now));
    const exam = examProgress(record.eikenExam);
    const parts = [base, vocab, exam];
    const daily7 = combineDaily(now, parts.map((part) => part.daily));
    const total = parts.reduce((sum, part) => sum + part.answered, 0);
    const correct = parts.reduce((sum, part) => sum + part.correct, 0);
    return {
      name: recordName(record, empty.name),
      grade: empty.grade,
      today: number(daily7[daily7.length - 1]?.answered),
      week: sumDaily(daily7),
      total,
      accuracy: percent(correct, total),
      review: base.review + vocab.review,
      lastLearningAt: latestIso(parts.map((part) => part.module.lastLearningAt)),
      daily7,
      modules: parts.map((part) => part.module)
    };
  }

  function kanjiProgress(field, today) {
    const kanji = object(field);
    const entries = Object.entries(object(kanji.kanji));
    const learned = entries.length;
    const mastered = entries.filter(([, row]) => Boolean(row?.masteredAt)).length;
    const review = entries.filter(([, row]) => (
      row?.reviewDueAt && String(row.reviewDueAt) <= today && row?.lastClearDay !== today
    )).length;
    let answered = 0;
    let correct = 0;
    const daily = {};
    Object.entries(object(kanji.daily)).forEach(([date, row]) => {
      const attempts = number(row?.attempts);
      const clears = number(row?.memoryClears);
      answered += attempts;
      correct += clears;
      daily[date] = { answered: attempts, correct: clears };
    });
    return {
      answered,
      correct,
      accuracyComplete: answered === entries.reduce((sum, [, row]) => sum + number(row?.attempts), 0),
      review,
      daily,
      module: {
        id: CHILD3_MODULES[0][0],
        label: CHILD3_MODULES[0][1],
        emoji: CHILD3_MODULES[0][2],
        progressLabel: `${learned}/76字学習・${mastered}字マスター`,
        total: answered,
        accuracy: percent(correct, answered),
        review,
        lastLearningAt: latestIso([kanji.updatedAt, entries.map(([, row]) => row?.lastSeenAt)])
      }
    };
  }

  function mathProgress(field, today) {
    const math = object(field);
    const facts = Object.entries(object(math.facts));
    const levels = Object.values(object(math.levels));
    const factAnswered = facts.reduce((sum, [, row]) => sum + number(row?.attempts), 0);
    const factCorrect = facts.reduce((sum, [, row]) => sum + number(row?.correct), 0);
    const writtenAnswered = levels.reduce((sum, row) => sum + number(row?.solved), 0);
    const writtenCorrect = levels.reduce((sum, row) => sum + number(row?.clean), 0);
    const answered = factAnswered + writtenAnswered;
    const correct = factCorrect + writtenCorrect;
    const mastered = facts.filter(([, row]) => Boolean(row?.masteredAt)).length;
    const review = facts.filter(([, row]) => (
      row?.reviewDueAt && String(row.reviewDueAt) <= today && row?.lastClearDay !== today
    )).length;
    return {
      answered,
      correct,
      review,
      module: {
        id: CHILD3_MODULES[1][0],
        label: CHILD3_MODULES[1][1],
        emoji: CHILD3_MODULES[1][2],
        progressLabel: `九九${mastered}/81・ひっ算${writtenAnswered}問`,
        total: answered,
        accuracy: percent(correct, answered),
        review,
        lastLearningAt: latestIso([
          math.updatedAt,
          facts.map(([, row]) => row?.lastSeenAt),
          levels.map((row) => row?.lastSessionDay ? `${row.lastSessionDay}T12:00:00` : null)
        ])
      }
    };
  }

  function child3Daily(record, kanji, math, now) {
    const statsDaily = object(record.stats?.daily);
    if (Object.keys(statsDaily).length) return dailySeries(now, statsDaily);
    if (math.answered > 0) return nullDaily(now);
    return dailySeries(now, kanji.daily);
  }

  function child3Summary(record, now) {
    const empty = emptySummary("child-3", now);
    if (!record) return empty;
    const todayKeyValue = dateKey(now);
    const kanji = kanjiProgress(record.kanji, todayKeyValue);
    const math = mathProgress(record.math4, todayKeyValue);
    const daily7 = child3Daily(record, kanji, math, now);
    const dailyKnown = daily7.every((row) => row.answered !== null);
    const statsRows = Object.values(object(record.stats?.daily));
    const hasStats = statsRows.length > 0;
    const statsAnswered = statsRows.reduce((sum, row) => sum + number(row?.answered), 0);
    const statsCorrect = statsRows.reduce((sum, row) => sum + number(row?.correct), 0);
    const moduleTotal = kanji.answered + math.answered;
    const total = hasStats ? statsAnswered : moduleTotal;
    const accuracyKnown = hasStats || kanji.accuracyComplete || kanji.answered === 0;
    const correct = hasStats ? statsCorrect : kanji.correct + math.correct;
    return {
      name: recordName(record, empty.name),
      grade: empty.grade,
      today: dailyKnown ? number(daily7[daily7.length - 1]?.answered) : null,
      week: dailyKnown ? sumDaily(daily7) : null,
      total,
      accuracy: accuracyKnown ? percent(correct, total) : null,
      review: kanji.review + math.review,
      lastLearningAt: latestIso([kanji.module.lastLearningAt, math.module.lastLearningAt]),
      daily7,
      modules: [kanji.module, math.module]
    };
  }

  function buildChildSummary(childId, record, now = new Date()) {
    if (!PROFILES[childId]) throw new Error(`Unsupported childId: ${childId}`);
    const resolvedNow = parseNow(now);
    if (childId === "child-1") return child1Summary(record, resolvedNow);
    if (childId === "child-2") return child2Summary(record, resolvedNow);
    return child3Summary(record, resolvedNow);
  }

  global.FamilyDashboardModel = { buildChildSummary };
})(typeof window !== "undefined" ? window : globalThis);
