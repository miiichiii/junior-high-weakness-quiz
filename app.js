(function () {
  const DEFAULT_CHILD_PROFILES = [
    { id: "child-1", name: "長男" },
    { id: "child-2", name: "子供2" },
    { id: "child-3", name: "子供3" }
  ];
  const CHILD_PAGE_CONFIG = {
    "child-1": {
      grade: "中3",
      stageLabel: "中3 高校受験",
      title: "下妻一高 余裕合格コース",
      subtitle: "数学を軸に、4月模試で見えた取りこぼしを5教科で戻す。",
      bankLabel: "中3受験問題",
      modules: [
        {
          id: "challenge-portal",
          kind: "portal",
          emoji: "🚀",
          label: "Challenge Base",
          href: "challenge.html",
          totalQuestions: 1020
        },
        {
          id: "challenge-social-geography",
          kind: "pack",
          packId: "challenge-social-geography",
          unitId: "geo-01",
          emoji: "🌏",
          label: "Challenge社会・地理",
          href: "./",
          totalQuestions: 180
        },
        {
          id: "challenge-social-history",
          kind: "pack",
          packId: "challenge-social-history",
          unitId: "his-13",
          emoji: "🏯",
          label: "Challenge社会・歴史",
          href: "./",
          totalQuestions: 216
        },
        {
          id: "challenge-social-civics",
          kind: "pack",
          packId: "challenge-social-civics",
          unitId: "civ-22",
          emoji: "🏛️",
          label: "Challenge社会・公民",
          href: "./",
          totalQuestions: 192
        },
        {
          id: "challenge-science-year1",
          kind: "pack",
          packId: "challenge-science-year1",
          unitId: "sci1-01",
          emoji: "🧪",
          label: "Challenge理科・1年",
          href: "./",
          totalQuestions: 192
        },
        {
          id: "challenge-science-year2",
          kind: "pack",
          packId: "challenge-science-year2",
          unitId: "sci2-09",
          emoji: "⚡",
          label: "Challenge理科・2年",
          href: "./",
          totalQuestions: 240
        },
        {
          id: "science-ion-drill",
          kind: "pack",
          packId: "science-ion-drill",
          emoji: "⚗️",
          label: "理科 水溶液とイオン 特訓",
          href: "./",
          totalQuestions: 30
        },
        {
          id: "social-author-drill",
          kind: "pack",
          packId: "social-author-drill",
          emoji: "📚",
          label: "社会 作家・文学文化 80問",
          href: "./",
          totalQuestions: 80
        }
      ],
      questionScope: "current",
      goal: {
        schoolName: "茨城県立下妻第一高等学校",
        shortName: "下妻一高",
        stance: "余裕合格",
        examDate: "2027-02-26",
        targetScore: 400,
        safetyScore: 380,
        targetAccuracy: 82,
        weeklyTarget: 120
      }
    },
    "child-2": {
      grade: "中2",
      stageLabel: "中2 基礎固め",
      title: "中2 定期テスト・受験準備コース",
      subtitle: "中2範囲の英数を崩さず、中3受験勉強へつなげる。",
      bankLabel: "中2問題・英検4級",
      modules: [
        {
          id: "eiken-grade4",
          kind: "pack",
          packId: "eiken-grade4",
          unitId: "e4-foundations",
          emoji: "🇬🇧",
          label: "英検4級 基礎100問",
          href: "./",
          totalQuestions: 100
        },
        {
          id: "eiken-grade4-vocab",
          kind: "eiken-vocab",
          emoji: "🗂️",
          label: "英検4級 単語帳420",
          href: "eiken-vocab.html",
          totalItems: 420
        },
        {
          id: "eiken-grade4-exam",
          kind: "eiken-exam",
          emoji: "🎧",
          label: "英検4級 本番ドリル",
          href: "eiken-exam.html",
          totalForms: 3
        }
      ],
      questionScope: "child-2",
      goal: {
        schoolName: "高校受験準備",
        shortName: "中2準備",
        stance: "基礎完成",
        examDate: "2028-02-25",
        targetScore: 360,
        safetyScore: 320,
        targetAccuracy: 78,
        weeklyTarget: 80
      }
    },
    "child-3": {
      grade: "小4",
      stageLabel: "小4 基礎定着",
      title: "小4 算数・国語の土台コース",
      subtitle: "計算、文章読解、語句を短く反復して中学範囲の土台を作る。",
      bankLabel: "夏休みは漢字マスター76字から（クイズ問題は準備中）",
      modules: [
        { id: "kanji-summer-2026", kind: "kanji", emoji: "✍️", label: "夏休み 漢字マスター", href: "kanji.html", totalKanji: 76 },
        { id: "math4-mult-div", kind: "math4", emoji: "🔢", label: "夏休み 算数マスター", href: "math4.html" }
      ],
      questionScope: "child-3",
      goal: {
        schoolName: "小4基礎力",
        shortName: "小4基礎",
        stance: "毎週定着",
        examDate: "2026-03-31",
        targetScore: 100,
        safetyScore: 80,
        targetAccuracy: 85,
        weeklyTarget: 50
      }
    }
  };
  const CHILD_PROFILES_KEY = "weaknessQuizChildProfiles";
  const ACTIVE_CHILD_KEY = "weaknessQuizActiveChildId";
  const CHILD_ROUTE_PARAM = "child";
  const PACK_ROUTE_PARAM = "pack";
  const PACK_CORNER_ROUTE_PARAM = "corner";
  const PACK_UNIT_ROUTE_PARAM = "unit";
  const PACK_REVIEW_ROUTE_PARAM = "review";
  const PACK_REVIEW_CATEGORY_ROUTE_PARAM = "reviewCategory";
  const PACK_TIERS = ["core", "challenge", "final", "max"];
  const PACK_TIER_FALLBACK_LABELS = {
    core: "基本攻略",
    challenge: "応用挑戦",
    final: "最終挑戦",
    max: "MAXミックス"
  };
  const PACK_TIER_SHORT_LABELS = { core: "基本", challenge: "応用", final: "最終", max: "MAX" };
  const LEGACY_STORAGE_KEYS = {
    progress: "weaknessQuizProgress",
    stats: "weaknessQuizStats",
    scratchNotes: "weaknessQuizScratchNotes"
  };
  const RECORD_KEYS = {
    progress: "progress",
    stats: "stats",
    scratchNotes: "scratchNotes",
    goal: "goal",
    kanjiProgress: "kanjiProgress",
    math4Progress: "math4Progress",
    eikenVocabProgress: "eikenVocabProgress",
    eikenExamProgress: "eikenExamProgress"
  };
  const CLOUD_SAVE_DELAY = 1200;
  const PACK_UNLOCK_METRIC_VERSION = 2;
  const EXAM_SUBJECTS = ["国語", "数学", "英語", "理科", "社会"];
  const MATH_WORK_PALETTE_GROUPS = [
    { label: "数字", tokens: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] },
    { label: "文字", tokens: ["x", "y", "a", "b", "n", "p", "q"] },
    { label: "記号", tokens: ["+", "−", "×", "÷", "=", "√", "(", ")", "²", "³", ","] }
  ];
  const MATH_WORK_QUICK_SYMBOLS = ["+", "−", "×", "÷", "=", "(", ")", "√", "²", "³", ","];
  const mathWorkUtils = window.MathWorkUtils || null;
  const mathKeypadUtils = window.MathKeypadUtils || null;

  const initialChildren = loadChildProfiles();
  const routeChildId = childIdFromUrl();
  const routePackId = packIdFromUrl();
  const routePackConfig = packConfigForId(routePackId);
  const routePackCornerId = packCornerIdFromUrl(routePackConfig);
  const routePackReviewAllTiers = packReviewAllTiersFromUrl();
  const initialPackCornerId = resolvePackCornerId(routePackCornerId, routePackConfig);
  const preferredChildId = routeChildId || localStorage.getItem(ACTIVE_CHILD_KEY);
  const initialChildId = routePackConfig
    ? resolvePackChildId(preferredChildId, routePackConfig, initialChildren)
    : resolveActiveChildId(preferredChildId, initialChildren);

  const state = {
    childProfiles: initialChildren,
    activeChildId: initialChildId,
    hasSelectedChild: Boolean(routeChildId || routePackConfig),
    mode: "daily",
    subject: "all",
    unit: "all",
    quiz: [],
    index: 0,
    answers: new Map(),
    sessionRecorded: false,
    choiceOrders: new Map(),
    equationStates: new Map(),
    inputDragStates: new Map(),
    mathAnswerDrafts: new Map(),
    rubricDraftStates: new Map(),
    trialScratchNotes: {},
    scratchNotes: loadScratchNotes(initialChildId),
    progress: loadProgress(initialChildId),
    stats: loadStats(initialChildId),
    goal: loadGoal(initialChildId),
    cloudUser: null,
    cloudRole: "checking",
    cloudAvailable: false,
    cloudSyncing: false,
    cloudHydrating: false,
    cloudSaveTimer: null,
    lastCloudSavedAt: null,
    packId: routePackConfig ? routePackId : "",
    packConfig: routePackConfig,
    packCorner: initialPackCornerId,
    packTier: initialPackTier(routePackConfig, initialPackCornerId),
    packReviewOnly: routePackReviewAllTiers,
    packReviewAllTiers: routePackReviewAllTiers,
    packSessionId: "",
    packTimerRemainingMs: 0,
    packTimerLastTickAt: 0,
    packTimerIntervalId: null,
    packTimerActive: false,
    packTimedOut: false
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
    weekly: "週1実戦",
    trial: "お試し",
    unitAll: "全カテゴリ"
  };

  const els = {
    homeScreen: document.getElementById("homeScreen"),
    appShell: document.getElementById("appShell"),
    childHomeCards: document.getElementById("childHomeCards"),
    appStageLabel: document.getElementById("appStageLabel"),
    appSubtitle: document.getElementById("appSubtitle"),
    childProfileList: document.getElementById("childProfileList"),
    activeChildName: document.getElementById("activeChildName"),
    activeChildGrade: document.getElementById("activeChildGrade"),
    backToHome: document.getElementById("backToHome"),
    cloudStatus: document.getElementById("cloudStatus"),
    cloudSignIn: document.getElementById("cloudSignIn"),
    cloudSignOut: document.getElementById("cloudSignOut"),
    syncNow: document.getElementById("syncNow"),
    goalSchoolName: document.getElementById("goalSchoolName"),
    goalTargetScore: document.getElementById("goalTargetScore"),
    goalExamDate: document.getElementById("goalExamDate"),
    goalLatestMock: document.getElementById("goalLatestMock"),
    editGoal: document.getElementById("editGoal"),
    addMockScore: document.getElementById("addMockScore"),
    examSchoolTitle: document.getElementById("examSchoolTitle"),
    examGoalLabel: document.getElementById("examGoalLabel"),
    examDaysLeft: document.getElementById("examDaysLeft"),
    examTargetScore: document.getElementById("examTargetScore"),
    examLatestScore: document.getElementById("examLatestScore"),
    examScoreGap: document.getElementById("examScoreGap"),
    examReadiness: document.getElementById("examReadiness"),
    examPlanList: document.getElementById("examPlanList"),
    subjectReadinessList: document.getElementById("subjectReadinessList"),
    packHero: document.getElementById("packHero"),
    packHome: document.getElementById("packHome"),
    quizOnlyHeader: document.getElementById("quizOnlyHeader"),
    quizOnlyHome: document.getElementById("quizOnlyHome"),
    quizOnlyPackTitle: document.getElementById("quizOnlyPackTitle"),
    quizOnlyUnitNumber: document.getElementById("quizOnlyUnitNumber"),
    quizOnlyUnitTitle: document.getElementById("quizOnlyUnitTitle"),
    quizOnlyTier: document.getElementById("quizOnlyTier"),
    quizOnlyRetry: document.getElementById("quizOnlyRetry"),
    quizOnlyAdvance: document.getElementById("quizOnlyAdvance"),
    packEyebrow: document.getElementById("packEyebrow"),
    packTitle: document.getElementById("packTitle"),
    packStudyGuide: document.getElementById("packStudyGuide"),
    packStudyGuideTitle: document.getElementById("packStudyGuideTitle"),
    packStudyGuideItems: document.getElementById("packStudyGuideItems"),
    packTierSelector: document.querySelector(".pack-tier-selector"),
    packCornerPanel: document.getElementById("packCornerPanel"),
    packCornerSelector: document.getElementById("packCornerSelector"),
    packCornerDescription: document.getElementById("packCornerDescription"),
    packCornerHeading: document.getElementById("packCornerHeading"),
    packCornerHint: document.getElementById("packCornerHint"),
    packCurrentTier: document.getElementById("packCurrentTier"),
    packCoreProgress: document.getElementById("packCoreProgress"),
    packCoreAccuracy: document.getElementById("packCoreAccuracy"),
    packChallengeProgress: document.getElementById("packChallengeProgress"),
    packChallengeAccuracy: document.getElementById("packChallengeAccuracy"),
    packFinalProgress: document.getElementById("packFinalProgress"),
    packFinalAccuracy: document.getElementById("packFinalAccuracy"),
    packTierProgressCards: Array.from(document.querySelectorAll("[data-pack-tier-progress]")),
    packRecommendation: document.getElementById("packRecommendation"),
    packTimer: document.getElementById("packTimer"),
    packTimerValue: document.getElementById("packTimerValue"),
    packTierButtons: Array.from(document.querySelectorAll(".pack-tier-button")),
    packStart: document.getElementById("packStart"),
    packReview: document.getElementById("packReview"),
    packLevelUp: document.getElementById("packLevelUp"),
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
    totalAnsweredMetric: document.getElementById("totalAnsweredMetric"),
    sessionMetric: document.getElementById("sessionMetric"),
    studyDaysMetric: document.getElementById("studyDaysMetric"),
    longestStreakMetric: document.getElementById("longestStreakMetric"),
    weeklyAnsweredMetric: document.getElementById("weeklyAnsweredMetric"),
    reviewMetric: document.getElementById("reviewMetric"),
    questionCard: document.getElementById("questionCard"),
    subjectPill: document.getElementById("subjectPill"),
    unitPill: document.getElementById("unitPill"),
    priorityPill: document.getElementById("priorityPill"),
    questionStage: document.getElementById("questionStage"),
    readingPassage: document.getElementById("readingPassage"),
    readingPassageText: document.getElementById("readingPassageText"),
    prompt: document.getElementById("prompt"),
    questionFigure: document.getElementById("questionFigure"),
    choices: document.getElementById("choices"),
    explanation: document.getElementById("explanation"),
    explanationText: document.getElementById("explanationText"),
    paperRef: document.getElementById("paperRef"),
    unknownAnswer: document.getElementById("unknownAnswer"),
    prevQuestion: document.getElementById("prevQuestion"),
    nextQuestion: document.getElementById("nextQuestion"),
    summary: document.getElementById("summary"),
    summaryText: document.getElementById("summaryText"),
    weakUnitList: document.getElementById("weakUnitList"),
    answeredCount: document.getElementById("answeredCount"),
    sessionCount: document.getElementById("sessionCount"),
    accuracyRate: document.getElementById("accuracyRate"),
    studyDaysCount: document.getElementById("studyDaysCount"),
    streakCount: document.getElementById("streakCount"),
    reviewCount: document.getElementById("reviewCount"),
    bankCount: document.getElementById("bankCount"),
    priorityCount: document.getElementById("priorityCount"),
    badgeList: document.getElementById("badgeList"),
    weeklyTrack: document.getElementById("weeklyTrack"),
    unitTrack: document.getElementById("unitTrack"),
    exportProgress: document.getElementById("exportProgress"),
    importProgress: document.getElementById("importProgress"),
    importProgressFile: document.getElementById("importProgressFile"),
    resetProgress: document.getElementById("resetProgress")
  };

  function loadChildProfiles() {
    const stored = readJsonStorage(CHILD_PROFILES_KEY, null);
    if (!Array.isArray(stored)) return DEFAULT_CHILD_PROFILES.map((child) => ({ ...child }));
    const normalized = DEFAULT_CHILD_PROFILES.map((fallback, index) => {
      const storedChild = stored[index] || {};
      const storedName = typeof storedChild.name === "string" ? storedChild.name.trim() : "";
      return {
        id: fallback.id,
        name: fallback.id === "child-1"
          ? fallback.name
          : storedName
          ? storedName.slice(0, 16)
          : fallback.name
      };
    });
    return normalized;
  }

  function saveChildProfiles() {
    localStorage.setItem(CHILD_PROFILES_KEY, JSON.stringify(state.childProfiles));
  }

  function resolveActiveChildId(candidate, children) {
    return children.some((child) => child.id === candidate) ? candidate : children[0].id;
  }

  function resolvePackChildId(candidate, packConfig, children) {
    const knownIds = new Set(children.map((child) => child.id));
    const allowedIds = (Array.isArray(packConfig?.childIds) ? packConfig.childIds : [])
      .filter((childId) => knownIds.has(childId));
    const fallbackId = allowedIds[0] || children[0].id;
    return allowedIds.includes(candidate) ? candidate : fallbackId;
  }

  function childIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const childId = params.get(CHILD_ROUTE_PARAM);
    return DEFAULT_CHILD_PROFILES.some((child) => child.id === childId) ? childId : "";
  }

  function packIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return String(params.get(PACK_ROUTE_PARAM) || "").trim();
  }

  function packReviewAllTiersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get(PACK_REVIEW_ROUTE_PARAM) === "1";
  }

  function packCornerRouteParam(packConfig = state?.packConfig) {
    return packConfig?.cornerRouteParam === PACK_UNIT_ROUTE_PARAM
      ? PACK_UNIT_ROUTE_PARAM
      : PACK_CORNER_ROUTE_PARAM;
  }

  function packCornerIdFromUrl(packConfig) {
    const params = new URLSearchParams(window.location.search);
    const preferredParam = packCornerRouteParam(packConfig);
    const fallbackParam = preferredParam === PACK_UNIT_ROUTE_PARAM ? PACK_CORNER_ROUTE_PARAM : PACK_UNIT_ROUTE_PARAM;
    return String(params.get(preferredParam) || params.get(fallbackParam) || "").trim();
  }

  function resolvePackCornerId(candidate, packConfig) {
    const corners = Array.isArray(packConfig?.corners) ? packConfig.corners : [];
    if (!corners.length) return "";
    const enabledCorners = corners.filter((corner) => corner?.enabled !== false);
    return enabledCorners.some((corner) => corner?.id === candidate)
      ? candidate
      : String(enabledCorners[0]?.id || "");
  }

  function initialPackTier(packConfig, cornerId) {
    const corners = Array.isArray(packConfig?.corners) ? packConfig.corners : [];
    const corner = corners.find((item) => item?.id === cornerId);
    const counts = corner?.tierCounts || packConfig?.tierCounts || {};
    return PACK_TIERS.find((tier) => Number(counts[tier]) > 0 && (tier !== "max" || packConfig?.maxEnabled !== false))
      || "core";
  }

  function packConfigForId(packId) {
    if (!packId || !window.QUIZ_PACKS) return null;
    if (Array.isArray(window.QUIZ_PACKS)) {
      return window.QUIZ_PACKS.find((pack) => pack?.id === packId) || null;
    }
    return window.QUIZ_PACKS[packId] || null;
  }

  function currentChildProfile() {
    return state.childProfiles.find((child) => child.id === state.activeChildId) || state.childProfiles[0];
  }

  function currentChildConfig() {
    return CHILD_PAGE_CONFIG[state.activeChildId] || CHILD_PAGE_CONFIG["child-1"];
  }

  function childRecordKey(childId, recordKey) {
    return `weaknessQuiz:${childId}:${recordKey}`;
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) || fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function loadRecord(recordKey, childId, fallback) {
    const key = childRecordKey(childId, recordKey);
    const stored = readJsonStorage(key, null);
    if (stored) return stored;
    if (childId === "child-1" && LEGACY_STORAGE_KEYS[recordKey]) {
      return readJsonStorage(LEGACY_STORAGE_KEYS[recordKey], fallback);
    }
    return fallback;
  }

  function defaultExamGoal(childId) {
    const resolvedChildId = childId || initialChildId || "child-1";
    const goal = (CHILD_PAGE_CONFIG[resolvedChildId] || CHILD_PAGE_CONFIG["child-1"]).goal;
    return {
      ...goal,
      mockScores: [],
      updatedAt: new Date().toISOString()
    };
  }

  function loadProgress(childId = state.activeChildId) {
    const progress = loadRecord(RECORD_KEYS.progress, childId, {});
    if (migratePendingRubricProgress(progress)) {
      localStorage.setItem(childRecordKey(childId, RECORD_KEYS.progress), JSON.stringify(progress));
    }
    return progress;
  }

  function migratePendingRubricProgress(progress) {
    if (!progress || typeof progress !== "object") return false;
    const rubricIds = new Set((window.QUIZ_QUESTIONS || [])
      .filter((question) => question.answerMode === "rubric-input")
      .map((question) => question.id));
    let changed = false;
    rubricIds.forEach((questionId) => {
      const record = progress[questionId];
      if (!record || !record.lastWrittenResponse || record.lastWrittenSelfAssessedCorrect !== true) return;
      if (record.lastWrittenPendingReview && record.packFirstAttemptPendingReview) return;
      record.lastWrittenPendingReview = true;
      record.packPendingWritten = true;
      record.packMastered = false;
      record.mastered = false;
      if (record.packFirstAttemptRecorded && record.packFirstAttemptCorrect === true) {
        record.packFirstAttemptCorrect = null;
        record.packFirstAttemptPendingReview = true;
      }
      changed = true;
    });
    return changed;
  }

  function saveProgress() {
    localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.progress), JSON.stringify(state.progress));
    scheduleCloudSave();
  }

  function loadStats(childId = state.activeChildId) {
    const stats = loadRecord(RECORD_KEYS.stats, childId, { daily: {} });
    if (!stats.daily || typeof stats.daily !== "object") stats.daily = {};
    return stats;
  }

  function saveStats() {
    localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.stats), JSON.stringify(state.stats));
    scheduleCloudSave();
  }

  function loadScratchNotes(childId = state.activeChildId) {
    return loadRecord(RECORD_KEYS.scratchNotes, childId, {});
  }

  function saveScratchNotes() {
    localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.scratchNotes), JSON.stringify(state.scratchNotes));
    scheduleCloudSave();
  }

  function loadGoal(childId = state.activeChildId) {
    const goal = loadRecord(RECORD_KEYS.goal, childId, defaultExamGoal(childId));
    return normalizeGoal(goal, childId);
  }

  function saveGoal() {
    state.goal.updatedAt = new Date().toISOString();
    localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.goal), JSON.stringify(state.goal));
    scheduleCloudSave();
  }

  function normalizeGoal(goal, childId) {
    const fallback = defaultExamGoal(childId || state.activeChildId || initialChildId || "child-1");
    const normalized = {
      ...fallback,
      ...(goal && typeof goal === "object" ? goal : {})
    };
    normalized.schoolName = String(normalized.schoolName || fallback.schoolName).trim() || fallback.schoolName;
    normalized.shortName = String(normalized.shortName || fallback.shortName).trim() || fallback.shortName;
    normalized.stance = String(normalized.stance || fallback.stance).trim() || fallback.stance;
    normalized.examDate = /^\d{4}-\d{2}-\d{2}$/.test(String(normalized.examDate || "")) ? normalized.examDate : fallback.examDate;
    normalized.targetScore = clampNumber(normalized.targetScore, 0, 500, fallback.targetScore);
    normalized.safetyScore = clampNumber(normalized.safetyScore, 0, 500, fallback.safetyScore);
    normalized.targetAccuracy = clampNumber(normalized.targetAccuracy, 0, 100, fallback.targetAccuracy);
    normalized.weeklyTarget = clampNumber(normalized.weeklyTarget, 0, 500, fallback.weeklyTarget);
    normalized.mockScores = Array.isArray(normalized.mockScores)
      ? normalized.mockScores
        .map(normalizeMockScore)
        .filter(Boolean)
        .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
        .slice(-30)
      : [];
    return normalized;
  }

  function normalizeMockScore(entry) {
    if (!entry || typeof entry !== "object") return null;
    const score = Number(entry.score);
    const date = String(entry.date || "").trim();
    if (!Number.isFinite(score) || score < 0 || score > 500 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    return {
      date,
      score: Math.round(score),
      note: String(entry.note || "").trim().slice(0, 30),
      createdAt: String(entry.createdAt || new Date().toISOString())
    };
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function questionsForChild(childId) {
    const questions = allQuestions();
    return questions.filter((question) => {
      if (isPackMode()) {
        if (question.packId !== state.packId) return false;
      } else if (question.packId) {
        return false;
      }
      return questionBelongsToChild(question, childId);
    });
  }

  function allQuestions() {
    return Array.isArray(window.QUIZ_QUESTIONS) ? window.QUIZ_QUESTIONS : [];
  }

  function normalQuestionsForChild(childId) {
    return allQuestions().filter((question) => !question.packId && questionBelongsToChild(question, childId));
  }

  function activeQuestions() {
    return questionsForChild(state.activeChildId);
  }

  function isTrialMode() {
    return state.mode === "trial" || isParentChallengeTrial();
  }

  function isChallengeCoursePack() {
    return /^challenge-(?:social|science)-/.test(String(state.packId || routePackId || ""));
  }

  function isParentChallengeTrial() {
    return isChallengeCoursePack() && state.cloudRole === "parent";
  }

  function isPackMode() {
    return Boolean(state.packId && state.packConfig);
  }

  function packCorners() {
    return Array.isArray(state.packConfig?.corners) ? state.packConfig.corners : [];
  }

  function currentPackCorner() {
    const corners = packCorners();
    if (!corners.length) return null;
    const enabledCorners = corners.filter((corner) => corner?.enabled !== false);
    return enabledCorners.find((corner) => corner?.id === state.packCorner) || enabledCorners[0] || null;
  }

  function currentPackQuestions() {
    const questions = activeQuestions();
    const corner = currentPackCorner();
    if (!corner) return questions;
    return questions.filter((question) => question.cornerId === corner.id);
  }

  function currentPackGuideItems() {
    const items = Array.isArray(state.packConfig?.studyGuide?.items)
      ? state.packConfig.studyGuide.items
      : [];
    const corner = currentPackCorner();
    if (!corner) return items;
    const authorKeys = new Set(Array.isArray(corner.authorKeys) ? corner.authorKeys : []);
    return items.filter((item) => authorKeys.has(item.authorKey));
  }

  function availablePackTiers() {
    const corner = currentPackCorner();
    if (corner) {
      return PACK_TIERS.filter((tier) => (
        Number(corner.tierCounts?.[tier]) > 0
        && (tier !== "max" || state.packConfig?.maxEnabled !== false)
      ));
    }
    return state.packConfig?.maxEnabled === false
      ? PACK_TIERS.filter((tier) => tier !== "max")
      : PACK_TIERS.slice();
  }

  function questionBelongsToChild(question, childId) {
    const assignedChildren = Array.isArray(question.childIds)
      ? question.childIds
      : (question.childId ? [question.childId] : null);
    if (!assignedChildren) return childId === "child-1";
    return assignedChildren.includes(childId);
  }

  function renderHomeScreen() {
    els.childHomeCards.innerHTML = "";
    state.childProfiles.forEach((child) => {
      const config = CHILD_PAGE_CONFIG[child.id] || CHILD_PAGE_CONFIG["child-1"];
      const stats = summaryForChild(child.id);
      const questionCount = questionsForChild(child.id).length;
      const link = document.createElement("a");
      link.className = "child-select-card";
      link.href = childPageUrl(child.id);
      link.dataset.childId = child.id;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openChildPage(child.id);
      });

      const label = document.createElement("span");
      label.className = "child-select-label";
      label.textContent = config.grade;
      const title = document.createElement("h2");
      title.textContent = child.name;
      const subtitle = document.createElement("p");
      subtitle.textContent = config.title;
      const meta = document.createElement("dl");
      meta.className = "child-select-stats";
      meta.append(
        statPair("問題", questionCount ? `${questionCount}問` : "準備中"),
        statPair("累計", `${stats.answered}問`),
        statPair("連続", `${stats.streak}日`)
      );
      link.append(label, title, subtitle, meta);
      (config.modules || []).forEach((module) => {
        link.appendChild(childModuleChip(child.id, module));
      });
      els.childHomeCards.appendChild(link);
    });
  }

  // カード（<a>）の中に置くためリンクは使わず、クリックを止めて遷移する
  function childModuleChip(childId, module) {
    const chip = document.createElement("span");
    chip.className = "child-module-chip";
    chip.setAttribute("role", "link");
    chip.innerHTML = `<b>${module.emoji} ${module.label}</b><small>${moduleProgressLabel(childId, module)}</small>`;
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = moduleHref(childId, module);
    });
    return chip;
  }

  function moduleHref(childId, module) {
    const url = new URL(module.href || "./", window.location.href);
    url.search = "";
    url.searchParams.set(CHILD_ROUTE_PARAM, childId);
    if (module.kind === "pack" && module.packId) {
      url.searchParams.set(PACK_ROUTE_PARAM, module.packId);
      if (module.unitId) url.searchParams.set(PACK_UNIT_ROUTE_PARAM, module.unitId);
    }
    url.hash = "";
    return `${url.pathname}${url.search}`;
  }

  function moduleProgressLabel(childId, module) {
    if (module.kind === "portal") {
      const questions = allQuestions().filter((question) => (
        questionBelongsToChild(question, childId)
        && ["challenge-social-geography", "challenge-social-history", "challenge-social-civics", "challenge-science-year1", "challenge-science-year2"].includes(question.packId)
      ));
      const progress = loadProgress(childId);
      const attempted = questions.filter((question) => {
        const record = progress[question.id] || {};
        return record.packFirstAttemptRecorded || Number(record.packAttempts) > 0;
      }).length;
      const mastered = questions.filter((question) => progress[question.id]?.packMastered).length;
      return `着手 ${attempted}/${questions.length || module.totalQuestions}・克服 ${mastered}`;
    }
    if (module.kind === "pack" && module.packId) {
      const questions = allQuestions().filter((question) => (
        question.packId === module.packId && questionBelongsToChild(question, childId)
      ));
      const total = questions.length || Number(module.totalQuestions) || 0;
      const progress = loadProgress(childId);
      const attempted = questions.filter((question) => {
        const record = progress[question.id] || {};
        return record.packFirstAttemptRecorded || Number(record.packAttempts) > 0;
      }).length;
      const config = packConfigForId(module.packId);
      const authorKeys = (config?.studyGuide?.items || []).map((item) => item.authorKey).filter(Boolean);
      if (authorKeys.length) {
        const packStats = loadStats(childId)?.packs?.[module.packId] || {};
        const expectedVersion = Math.max(1, Number(config?.contentVersion) || 1);
        const authorMastery = Number(packStats.contentVersion || 1) >= expectedVersion
          ? packStats.authorMastery || {}
          : {};
        const masteredAuthors = authorKeys.filter((key) => authorMastery[key]?.mastered).length;
        return `人物 ${masteredAuthors}/${authorKeys.length}・着手 ${attempted}/${total}`;
      }
      const mastered = questions.filter((question) => progress[question.id]?.packMastered).length;
      return `着手 ${attempted}/${total}・克服 ${mastered}`;
    }
    if (module.kind === "math4") {
      const record = loadRecord(RECORD_KEYS.math4Progress, childId, null);
      const mastered = masteredMath4FactCount(record);
      const written = Object.values((record && record.levels) || {})
        .reduce((sum, level) => sum + (level && level.solved ? level.solved : 0), 0);
      return `九九 ${mastered}/81・ひっ算 ${written}問`;
    }
    if (module.kind === "eiken-vocab") {
      const record = loadRecord(RECORD_KEYS.eikenVocabProgress, childId, null);
      const entries = record?.entries && typeof record.entries === "object" ? record.entries : {};
      const learned = Object.keys(entries).length;
      const mastered = Object.values(entries).filter((entry) => entry?.masteredAt).length;
      return `学習 ${learned}/${Number(module.totalItems) || 420}・習得 ${mastered}`;
    }
    if (module.kind === "eiken-exam") {
      const record = loadRecord(RECORD_KEYS.eikenExamProgress, childId, null);
      const attempts = Object.values(record?.forms || {}).flatMap((form) => Array.isArray(form?.attempts) ? form.attempts : []);
      const completedAttempts = attempts
        .filter((entry) => entry?.completedAt)
        .sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt)));
      const completed = new Set(completedAttempts.map((entry) => entry.formId)).size;
      const latest = completedAttempts.at(-1);
      return latest
        ? `完了 ${completed}/${Number(module.totalForms) || 3}・直近 ${latest.totalScore}/65`
        : `模試 ${completed}/${Number(module.totalForms) || 3}`;
    }
    return `マスター ${masteredKanjiCount(childId)}/${module.totalKanji}字`;
  }

  function masteredKanjiCount(childId) {
    const record = loadRecord(RECORD_KEYS.kanjiProgress, childId, null);
    if (!record || !record.kanji || typeof record.kanji !== "object") return 0;
    return Object.values(record.kanji).filter((entry) => entry && entry.masteredAt).length;
  }

  function masteredMath4FactCount(record) {
    if (!record || !record.facts || typeof record.facts !== "object") return 0;
    return Object.values(record.facts).filter((entry) => entry && entry.masteredAt).length;
  }

  function statPair(label, value) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    wrapper.append(dt, dd);
    return wrapper;
  }

  function childPageUrl(childId) {
    const url = new URL(window.location.href);
    url.searchParams.set(CHILD_ROUTE_PARAM, childId);
    url.hash = "";
    return `${url.pathname}${url.search}`;
  }

  function openChildPage(childId, updateHistory = true) {
    flushCloudSave();
    state.hasSelectedChild = true;
    activateChild(childId);
    if (updateHistory) {
      window.history.pushState({ childId: state.activeChildId }, "", childPageUrl(state.activeChildId));
    } else {
      normalizePackChildRoute();
    }
    els.homeScreen.classList.add("hidden");
    els.appShell.classList.remove("hidden");
    renderChildContext();
    buildSubjectButtons();
    buildCategoryButtons();
    startQuiz({ skipCloudPull: true });
    pullCloudRecordForActiveChild();
  }

  function showHomeScreen(updateHistory = true) {
    stopPackTimer(true);
    flushCloudSave();
    state.hasSelectedChild = false;
    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.delete(CHILD_ROUTE_PARAM);
      url.hash = "";
      window.history.pushState({}, "", `${url.pathname}${url.search}`);
    }
    els.appShell.classList.add("hidden");
    els.homeScreen.classList.remove("hidden");
    renderHomeScreen();
  }

  function activateChild(childId) {
    state.activeChildId = isPackMode()
      ? resolvePackChildId(childId, state.packConfig, state.childProfiles)
      : resolveActiveChildId(childId, state.childProfiles);
    localStorage.setItem(ACTIVE_CHILD_KEY, state.activeChildId);
    state.progress = loadProgress();
    state.stats = loadStats();
    state.scratchNotes = loadScratchNotes();
    state.goal = loadGoal();
    state.answers = new Map();
    state.choiceOrders = new Map();
    state.equationStates = new Map();
    state.inputDragStates = new Map();
    state.mathAnswerDrafts = new Map();
    state.rubricDraftStates = new Map();
    state.sessionRecorded = false;
  }

  function normalizePackChildRoute() {
    if (!isPackMode()) return;
    const url = new URL(window.location.href);
    let changed = false;
    if (url.searchParams.get(CHILD_ROUTE_PARAM) !== state.activeChildId) {
      url.searchParams.set(CHILD_ROUTE_PARAM, state.activeChildId);
      changed = true;
    }
    const corner = currentPackCorner();
    const cornerParam = packCornerRouteParam(state.packConfig);
    if (corner && url.searchParams.get(cornerParam) !== corner.id) {
      url.searchParams.set(cornerParam, corner.id);
      url.searchParams.delete(cornerParam === PACK_UNIT_ROUTE_PARAM ? PACK_CORNER_ROUTE_PARAM : PACK_UNIT_ROUTE_PARAM);
      changed = true;
    }
    if (!changed) return;
    url.hash = "";
    window.history.replaceState({ childId: state.activeChildId, packCorner: corner?.id || "" }, "", `${url.pathname}${url.search}`);
  }

  function renderChildContext() {
    const profile = currentChildProfile();
    const config = currentChildConfig();
    els.activeChildName.textContent = profile.name;
    els.activeChildGrade.textContent = `${config.grade} / ${config.title}`;
    els.appStageLabel.textContent = config.stageLabel;
    els.appSubtitle.textContent = config.subtitle;
    els.childProfileList.innerHTML = "";
    const summary = document.createElement("div");
    summary.className = "child-page-summary";
    summary.textContent = config.bankLabel;
    els.childProfileList.appendChild(summary);
    const parentViewLink = document.getElementById("parentViewLink");
    if (parentViewLink) parentViewLink.href = "family-dashboard.html";
    (config.modules || []).forEach((module) => {
      const moduleLink = document.createElement("a");
      moduleLink.className = "ghost-button child-module-link";
      moduleLink.href = moduleHref(state.activeChildId, module);
      moduleLink.textContent = `${module.emoji} ${module.label}（${moduleProgressLabel(state.activeChildId, module)}）`;
      els.childProfileList.appendChild(moduleLink);
    });
  }

  function summaryForChild(childId) {
    const stats = loadStats(childId);
    const daily = stats.daily || {};
    const totals = Object.values(daily).reduce((acc, day) => {
      acc.answered += day.answered || 0;
      acc.correct += day.correct || 0;
      acc.sessions += day.sessions || 0;
      return acc;
    }, { answered: 0, correct: 0, sessions: 0 });
    return {
      ...totals,
      streak: streakForDaily(daily, new Date())
    };
  }

  function buildChildProfileButtons() {
    renderChildContext();
  }

  function switchChildProfile(childId) {
    if (childId === state.activeChildId) return;
    openChildPage(childId);
  }

  function renameChildProfile(childId) {
    const child = state.childProfiles.find((item) => item.id === childId);
    if (!child) return;
    if (childId === "child-1") {
      child.name = DEFAULT_CHILD_PROFILES[0].name;
      saveChildProfiles();
      buildChildProfileButtons();
      return;
    }
    const nextName = prompt("名前を入力してください。", child.name);
    if (nextName === null) return;
    const trimmed = nextName.trim();
    if (!trimmed) return;
    child.name = trimmed.slice(0, 16);
    saveChildProfiles();
    buildChildProfileButtons();
    scheduleCloudSave();
  }

  function editExamGoal() {
    const schoolName = prompt("志望校", state.goal.schoolName);
    if (schoolName === null) return;
    const shortName = prompt("画面に出す短い名前", state.goal.shortName);
    if (shortName === null) return;
    const examDate = prompt("入試日（YYYY-MM-DD。未確定なら仮日程でOK）", state.goal.examDate);
    if (examDate === null) return;
    const targetScore = prompt("余裕合格の目標点（5教科500点満点）", String(state.goal.targetScore));
    if (targetScore === null) return;
    const safetyScore = prompt("安全圏の下限目安（5教科500点満点）", String(state.goal.safetyScore));
    if (safetyScore === null) return;
    const weeklyTarget = prompt("直近7日間の演習目標数", String(state.goal.weeklyTarget));
    if (weeklyTarget === null) return;

    const next = normalizeGoal({
      ...state.goal,
      schoolName,
      shortName,
      examDate,
      targetScore,
      safetyScore,
      weeklyTarget
    });
    state.goal = next;
    saveGoal();
    renderExamDashboard();
  }

  function addMockScoreRecord() {
    const scoreInput = prompt("模試・実力テストの5教科合計点（0〜500）");
    if (scoreInput === null) return;
    const score = Number(scoreInput);
    if (!Number.isFinite(score) || score < 0 || score > 500) {
      alert("0〜500の数字で入力してください。");
      return;
    }
    const dateInput = prompt("テスト日（YYYY-MM-DD）", todayKey());
    if (dateInput === null) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      alert("日付はYYYY-MM-DDで入力してください。");
      return;
    }
    const note = prompt("メモ（例: 実力テスト、統一模試）", "模試") || "";
    state.goal.mockScores.push({
      score: Math.round(score),
      date: dateInput,
      note: note.trim().slice(0, 30),
      createdAt: new Date().toISOString()
    });
    state.goal = normalizeGoal(state.goal);
    saveGoal();
    renderExamDashboard();
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
    return Array.from(new Set(activeQuestions()
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
    let questions = activeQuestions().slice();
    if (isPackMode()) return questions;
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

  function packTierLabel(tier) {
    return state.packConfig?.tierLabels?.[tier] || PACK_TIER_FALLBACK_LABELS[tier] || tier;
  }

  function packTierCount(tier) {
    const fallback = { core: 80, challenge: 80, final: 40, max: 0 };
    const corner = currentPackCorner();
    if (corner) {
      const cornerCount = Number(corner.tierCounts?.[tier]);
      return Number.isFinite(cornerCount) ? cornerCount : 0;
    }
    const configured = Number(state.packConfig?.tierCounts?.[tier]);
    return Number.isFinite(configured) ? configured : fallback[tier] || 0;
  }

  function packGradableTierCount(tier) {
    return currentPackQuestions().filter((question) => (
      packQuestionTier(question) === tier && question.answerMode !== "rubric-input"
    )).length;
  }

  function packSessionSize() {
    const configured = Number(state.packConfig?.sessionSize);
    return Number.isFinite(configured) && configured > 0 ? Math.round(configured) : 10;
  }

  function packMeta() {
    if (!state.stats.packs || typeof state.stats.packs !== "object") state.stats.packs = {};
    const configuredContentVersion = Math.max(1, Number(state.packConfig?.contentVersion) || 1);
    const currentMeta = state.stats.packs[state.packId];
    if (!currentMeta || typeof currentMeta !== "object"
      || Number(currentMeta.contentVersion || 1) < configuredContentVersion) {
      state.stats.packs[state.packId] = {
        contentVersion: configuredContentVersion,
        answerSequence: 0,
        sessionCounter: 0,
        answered: 0,
        correct: 0,
        sessions: 0,
        daily: {},
        challengeRecommended: false,
        finalRecommended: false
      };
    } else if (!Number.isFinite(Number(currentMeta.contentVersion))) {
      currentMeta.contentVersion = 1;
    }
    return state.stats.packs[state.packId];
  }

  function packQuestionTier(question) {
    const aliases = { basic: "core", apply: "challenge", advanced: "final" };
    return aliases[question.tier] || question.tier || "core";
  }

  function packProgressForTier(tier) {
    const questions = currentPackQuestions().filter((question) => packQuestionTier(question) === tier);
    let answered = 0;
    let graded = 0;
    let pending = 0;
    let firstCorrect = 0;
    let mastered = 0;
    let review = 0;
    questions.forEach((question) => {
      const record = state.progress[question.id] || {};
      const isWrittenResponse = question.answerMode === "rubric-input";
      const wasAttempted = Boolean(record.packFirstAttemptRecorded || (record.packAttempts || 0) > 0);
      if (wasAttempted) {
        answered += 1;
        const pendingReview = Boolean(
          record.packFirstAttemptPendingReview
          || record.packPendingWritten
          || record.lastWrittenPendingReview
        );
        if (isWrittenResponse) {
          if (pendingReview) pending += 1;
        } else if (pendingReview) {
          pending += 1;
        } else {
          graded += 1;
          if (record.packFirstAttemptRecorded
            ? record.packFirstAttemptCorrect === true
            : (record.wrong || 0) === 0 && (record.correct || 0) > 0) {
            firstCorrect += 1;
          }
        }
      }
      if (record.packMastered) mastered += 1;
      if (record.needsReview) review += 1;
    });
    return {
      tier,
      total: packTierCount(tier) || questions.length,
      answered,
      graded,
      pending,
      firstCorrect,
      accuracy: graded ? Math.round((firstCorrect / graded) * 100) : 0,
      mastered,
      review
    };
  }

  function packFirstAttemptAccuracy(tier, count) {
    const attempts = currentPackQuestions()
      .filter((question) => (
        packQuestionTier(question) === tier && question.answerMode !== "rubric-input"
      ))
      .map((question) => state.progress[question.id] || {})
      .filter((record) => record.packFirstAttemptRecorded || record.packAttempts > 0)
      .filter((record) => !record.packFirstAttemptPendingReview)
      .sort(comparePackFirstAttempts)
      .slice(0, count);
    if (attempts.length < count) return null;
    const correct = attempts.filter((record) => record.packFirstAttemptRecorded
      ? record.packFirstAttemptCorrect === true
      : (record.wrong || 0) === 0 && (record.correct || 0) > 0).length;
    return Math.round((correct / attempts.length) * 100);
  }

  function refreshPackMilestones() {
    if (!isPackMode()) return false;
    // Corner packs calculate recommendations from the selected corner's records.
    // Do not persist a single flag that could leak from one corner into another.
    if (currentPackCorner()) return false;
    const meta = packMeta();
    const core = packProgressForTier("core");
    const challenge = packProgressForTier("challenge");
    const unlock = state.packConfig?.unlock || {};
    const early = unlock.challengeEarly || { answered: 40, accuracy: 90 };
    const full = unlock.challengeFull || { answered: 80, accuracy: 85 };
    const final = unlock.final || { answered: 60, accuracy: 80 };
    const coreGradableTotal = packGradableTierCount("core");
    const challengeGradableTotal = packGradableTierCount("challenge");
    const finalGradableTotal = packGradableTierCount("final");
    const coreFullThreshold = Math.min(Number(full.answered || 80), coreGradableTotal);
    let changed = false;
    if (Number(meta.unlockMetricVersion) !== PACK_UNLOCK_METRIC_VERSION) {
      meta.unlockMetricVersion = PACK_UNLOCK_METRIC_VERSION;
      delete meta.coreEarlyAccuracy;
      meta.challengeRecommended = false;
      meta.finalRecommended = false;
      meta.maxRecommended = false;
      delete meta.challengeRecommendedAt;
      delete meta.finalRecommendedAt;
      delete meta.maxRecommendedAt;
      changed = true;
    }

    if (!Number.isFinite(Number(meta.coreEarlyAccuracy)) && core.graded >= Number(early.answered || 40)) {
      meta.coreEarlyAccuracy = packFirstAttemptAccuracy("core", Number(early.answered || 40)) ?? core.accuracy;
      changed = true;
    }
    const challengeReady = Number(meta.coreEarlyAccuracy) >= Number(early.accuracy || 90)
      || (core.graded >= coreFullThreshold && core.accuracy >= Number(full.accuracy || 85));
    if (challengeReady && !meta.challengeRecommended) {
      meta.challengeRecommended = true;
      meta.challengeRecommendedAt = new Date().toISOString();
      changed = true;
    }
    const finalReady = (challenge.graded >= Number(final.answered || 60)
      && challenge.accuracy >= Number(final.accuracy || 80))
      || challenge.graded >= challengeGradableTotal;
    if (finalReady && !meta.finalRecommended) {
      meta.finalRecommended = true;
      meta.finalRecommendedAt = new Date().toISOString();
      changed = true;
    }
    const staticAnswered = core.graded + challenge.graded + packProgressForTier("final").graded;
    const staticTotal = coreGradableTotal + challengeGradableTotal + finalGradableTotal;
    if (staticTotal > 0 && staticAnswered >= staticTotal && !meta.maxRecommended) {
      meta.maxRecommended = true;
      meta.maxRecommendedAt = new Date().toISOString();
      changed = true;
    }
    return changed;
  }

  function currentPackRecommendations() {
    const meta = packMeta();
    if (!currentPackCorner()) {
      return {
        challengeRecommended: Boolean(meta.challengeRecommended),
        finalRecommended: Boolean(meta.finalRecommended),
        maxRecommended: Boolean(meta.maxRecommended)
      };
    }
    const core = packProgressForTier("core");
    const challenge = packProgressForTier("challenge");
    const final = packProgressForTier("final");
    const unlock = state.packConfig?.unlock || {};
    const early = unlock.challengeEarly || { answered: 40, accuracy: 90 };
    const full = unlock.challengeFull || { answered: 80, accuracy: 85 };
    const finalRule = unlock.final || { answered: 60, accuracy: 80 };
    const coreEarlyAccuracy = core.graded >= Number(early.answered || 40)
      ? packFirstAttemptAccuracy("core", Number(early.answered || 40)) ?? core.accuracy
      : null;
    const coreFullThreshold = Math.min(Number(full.answered || 80), packGradableTierCount("core"));
    const challengeRecommended = Number(coreEarlyAccuracy) >= Number(early.accuracy || 90)
      || (core.graded >= coreFullThreshold && core.accuracy >= Number(full.accuracy || 85));
    const challengeTotal = packGradableTierCount("challenge");
    const finalRecommended = challengeTotal > 0 && (
      (challenge.graded >= Math.min(Number(finalRule.answered || 60), challengeTotal)
        && challenge.accuracy >= Number(finalRule.accuracy || 80))
      || challenge.graded >= challengeTotal
    );
    const trackedTiers = availablePackTiers().filter((tier) => tier !== "max");
    const maxRecommended = trackedTiers.length > 0 && trackedTiers.every((tier) => {
      const progress = tier === "core" ? core : tier === "challenge" ? challenge : final;
      return progress.graded >= packGradableTierCount(tier);
    });
    return { challengeRecommended, finalRecommended, maxRecommended };
  }

  function generatedMaxQuestions() {
    if (state.packConfig?.maxEnabled === false) return [];
    if (typeof window.TERM_TEST_GENERATE_VARIANTS !== "function") return [];
    const counter = Math.max(1, Number(packMeta().sessionCounter) || 1);
    const generated = [];
    for (let offset = 0; offset < 4; offset += 1) {
      const seed = Math.max(1, counter - offset);
      let variants = [];
      try {
        variants = window.TERM_TEST_GENERATE_VARIANTS(24, seed) || [];
      } catch (error) {
        console.error("Term-test variant generation failed", error);
      }
      if (!Array.isArray(variants)) continue;
      variants.forEach((question, index) => {
        if (!question || typeof question !== "object") return;
        generated.push({
          ...question,
          id: question.id || `${state.packId}-max-${seed}-${index + 1}`,
          packId: state.packId,
          tier: "max",
          stage: question.stage || packTierLabel("max")
        });
      });
    }
    return generated;
  }

  function pickFreshMaxQuiz(size) {
    if (state.packConfig?.maxEnabled === false) return [];
    if (typeof window.TERM_TEST_GENERATE_VARIANTS !== "function") return [];
    const counter = Math.max(1, Number(packMeta().sessionCounter) || 1);
    let variants = [];
    try {
      variants = window.TERM_TEST_GENERATE_VARIANTS(Math.max(size, 12), counter) || [];
    } catch (error) {
      console.error("Fresh MAX variant generation failed", error);
      return [];
    }
    if (!Array.isArray(variants)) return [];
    const selected = variants
      .filter((question) => question && typeof question === "object")
      .slice(0, size)
      .map((question, index) => ({
        ...question,
        id: question.id || `${state.packId}-max-${counter}-${index + 1}`,
        packId: state.packId,
        tier: "max",
        stage: question.stage || packTierLabel("max")
      }));
    if (selected.length !== size) return [];

    // MAXの通常セットは、復習候補を混ぜて偏らせず、毎回新問だけで構成する。
    // 間違いは専用の「間違いだけ」から、5問の冷却後に解き直せる。
    if (size === 10) {
      const subjects = countQuestionsBy(selected, (question) => question.subject);
      const groups = new Set(selected.map((question) => question.variantGroup).filter(Boolean));
      if (subjects["数学"] !== 5 || subjects["理科"] !== 5 || groups.size !== 10) return [];
    }
    return shuffle(selected);
  }

  function countQuestionsBy(questions, keyFn) {
    return questions.reduce((counts, question) => {
      const key = keyFn(question);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }

  function packPoolForTier(tier) {
    const staticQuestions = currentPackQuestions();
    if (tier !== "max") {
      return staticQuestions.filter((question) => packQuestionTier(question) === tier);
    }
    const finalQuestions = staticQuestions.filter((question) => packQuestionTier(question) === "final");
    const recalledQuestions = Object.values(state.progress)
      .filter((record) => record?.packQuestionSnapshot && record.needsReview)
      .map((record) => record.packQuestionSnapshot);
    const unique = new Map();
    [...generatedMaxQuestions(), ...recalledQuestions, ...finalQuestions]
      .filter((question) => question.packId === state.packId && questionBelongsToChild(question, state.activeChildId))
      .filter((question) => !currentPackCorner() || question.cornerId === state.packCorner)
      .forEach((question) => unique.set(question.id, question));
    return Array.from(unique.values());
  }

  function packReviewIsReady(record) {
    if (!record.needsReview) return false;
    const cooldownUntil = Number(record.packCooldown || 0);
    return (Number(packMeta().answerSequence) || 0) >= cooldownUntil;
  }

  function packQuestionCanBePicked(question) {
    const record = state.progress[question.id] || {};
    return !record.needsReview || packReviewIsReady(record);
  }

  function pickPackQuiz() {
    const size = packSessionSize();
    if (state.packReviewAllTiers) {
      const review = currentPackQuestions().filter((question) => {
        return packReviewIsReady(state.progress[question.id] || {});
      });
      return shuffle(review).slice(0, size);
    }
    if (state.packTier === "max" && !state.packReviewOnly) {
      const freshMaxSet = pickFreshMaxQuiz(size);
      if (freshMaxSet.length === size) return freshMaxSet;
    }
    const pool = packPoolForTier(state.packTier).filter(packQuestionCanBePicked);
    if (pool.length === 0) return [];
    const picked = [];
    const pickedIds = new Set();
    const addFrom = (candidates, count) => {
      shuffle(candidates).some((question) => {
        if (picked.length >= size || count <= 0) return true;
        if (pickedIds.has(question.id)) return false;
        picked.push(question);
        pickedIds.add(question.id);
        count -= 1;
        return picked.length >= size || count <= 0;
      });
    };
    const review = pool.filter((question) => packReviewIsReady(state.progress[question.id] || {}));
    if (state.packReviewOnly) {
      addFrom(review, size);
      return shuffle(picked);
    }

    const unseen = pool.filter((question) => {
      const record = state.progress[question.id] || {};
      return !record.packFirstAttemptRecorded && !(record.packAttempts > 0);
    });
    const mastered = pool.filter((question) => (state.progress[question.id] || {}).packMastered);
    const learning = pool.filter((question) => {
      const record = state.progress[question.id] || {};
      return !record.needsReview
        && (record.packFirstAttemptRecorded || record.packAttempts > 0)
        && !record.packMastered;
    });
    const mix = state.packConfig?.mix || { review: 0.5, unseen: 0.4, mastered: 0.1 };
    const reviewTarget = Math.round(size * Number(mix.review ?? 0.5));
    const unseenTarget = Math.round(size * Number(mix.unseen ?? 0.4));
    const masteredTarget = Math.max(0, size - reviewTarget - unseenTarget);
    addFrom(review, reviewTarget);
    addFrom(unseen, unseenTarget);
    addFrom(mastered, masteredTarget);
    addFrom([...unseen, ...review, ...learning, ...mastered, ...pool], size - picked.length);
    return shuffle(picked);
  }

  function pickQuiz() {
    if (isPackMode()) return pickPackQuiz();
    const pool = poolQuestions();
    if (pool.length === 0) return [];
    if (state.mode === "focus") {
      return pool
        .slice()
        .sort(sortForFocusOrder)
        .slice(0, 20);
    }
    if (state.mode === "weekly") {
      return pickWeeklySet(pool);
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
    return picked.sort(sortForStudyOrder);
  }

  function pickWeeklySet(pool) {
    const plan = [
      ["数学", 5],
      ["理科", 3],
      ["社会", 3],
      ["英語", 1],
      ["国語", 1]
    ];
    const picked = [];
    plan.forEach(([subject, count]) => {
      const candidates = pool
        .filter((question) => question.subject === subject)
        .sort(() => Math.random() - 0.5)
        .sort(sortForWeeklyOrder);
      candidates.forEach((question) => {
        if (picked.filter((item) => item.subject === subject).length >= count) return;
        if (!picked.some((item) => item.id === question.id)) picked.push(question);
      });
    });
    if (picked.length < 13) {
      pool
        .slice()
        .sort(() => Math.random() - 0.5)
        .sort(sortForWeeklyOrder)
        .forEach((question) => {
          if (picked.length >= 13) return;
          if (!picked.some((item) => item.id === question.id)) picked.push(question);
        });
    }
    return picked.sort(sortForStudyOrder);
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

  function sortForFocusOrder(a, b) {
    const aReview = (state.progress[a.id] || {}).needsReview ? 0 : 1;
    const bReview = (state.progress[b.id] || {}).needsReview ? 0 : 1;
    return aReview - bReview || sortForStudyOrder(a, b);
  }

  function sortForWeeklyOrder(a, b) {
    const practicalFormats = { "資料読取": 0, "長文・会話": 0, "読解・記述": 0, "複合": 0 };
    const difficultyOrder = { "L4 安全圏チャレンジ": 0, "L3 県立本番": 1, "L2 県立標準": 2, "L1 基礎復帰": 3 };
    const aRecord = state.progress[a.id] || {};
    const bRecord = state.progress[b.id] || {};
    const aReview = aRecord.needsReview ? 0 : 1;
    const bReview = bRecord.needsReview ? 0 : 1;
    const aMastered = aRecord.mastered ? 1 : 0;
    const bMastered = bRecord.mastered ? 1 : 0;
    const aAnswered = (aRecord.correct || 0) + (aRecord.wrong || 0) + (aRecord.skipped || 0);
    const bAnswered = (bRecord.correct || 0) + (bRecord.wrong || 0) + (bRecord.skipped || 0);
    const aLast = Date.parse(aRecord.lastAnsweredAt || "") || 0;
    const bLast = Date.parse(bRecord.lastAnsweredAt || "") || 0;
    return aReview - bReview
      || aMastered - bMastered
      || (practicalFormats[a.formatTag] ?? 1) - (practicalFormats[b.formatTag] ?? 1)
      || (difficultyOrder[a.difficulty] ?? 9) - (difficultyOrder[b.difficulty] ?? 9)
      || aAnswered - bAnswered
      || aLast - bLast
      || 0;
  }

  function beginPackSession() {
    const meta = packMeta();
    meta.sessionCounter = (Number(meta.sessionCounter) || 0) + 1;
    state.packSessionId = `${state.packId}:${Date.now()}:${meta.sessionCounter}:${Math.random().toString(36).slice(2, 7)}`;
    refreshPackMilestones();
    saveStats();
  }

  function packFinalTimeLimitSeconds() {
    const configured = Number(state.packConfig?.finalTimeLimitSeconds);
    return Number.isFinite(configured) && configured > 0 ? Math.round(configured) : 20 * 60;
  }

  function clearPackTimerInterval() {
    if (state.packTimerIntervalId !== null) {
      window.clearInterval(state.packTimerIntervalId);
      state.packTimerIntervalId = null;
    }
  }

  function stopPackTimer(resetRemaining = false) {
    clearPackTimerInterval();
    state.packTimerActive = false;
    state.packTimerLastTickAt = 0;
    if (resetRemaining) state.packTimerRemainingMs = 0;
    renderPackTimer();
  }

  function startPackTimerIfNeeded() {
    stopPackTimer(true);
    if (!isPackMode() || state.packTier !== "final" || state.quiz.length === 0) return;
    state.packTimerRemainingMs = packFinalTimeLimitSeconds() * 1000;
    state.packTimerActive = true;
    state.packTimerLastTickAt = document.hidden ? 0 : Date.now();
    renderPackTimer();
    if (!document.hidden) schedulePackTimerTick();
  }

  function schedulePackTimerTick() {
    clearPackTimerInterval();
    if (!state.packTimerActive || document.hidden) return;
    state.packTimerIntervalId = window.setInterval(tickPackTimer, 250);
  }

  function tickPackTimer() {
    if (!state.packTimerActive) return;
    if (document.hidden) {
      pausePackTimer();
      return;
    }
    const now = Date.now();
    if (state.packTimerLastTickAt) {
      state.packTimerRemainingMs = Math.max(0, state.packTimerRemainingMs - (now - state.packTimerLastTickAt));
    }
    state.packTimerLastTickAt = now;
    renderPackTimer();
    if (state.packTimerRemainingMs <= 0) expirePackTimer();
  }

  function pausePackTimer() {
    if (!state.packTimerActive) return;
    const now = Date.now();
    if (state.packTimerLastTickAt) {
      state.packTimerRemainingMs = Math.max(0, state.packTimerRemainingMs - (now - state.packTimerLastTickAt));
    }
    state.packTimerLastTickAt = 0;
    clearPackTimerInterval();
    renderPackTimer();
    if (state.packTimerRemainingMs <= 0) expirePackTimer();
  }

  function resumePackTimer() {
    if (!state.packTimerActive || state.packTimerRemainingMs <= 0 || document.hidden) return;
    state.packTimerLastTickAt = Date.now();
    schedulePackTimerTick();
  }

  function renderPackTimer() {
    const visible = isPackMode() && state.packTier === "final" && state.quiz.length > 0;
    els.packTimer.classList.toggle("hidden", !visible);
    if (!visible) return;
    const totalSeconds = Math.max(0, Math.ceil(state.packTimerRemainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const value = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    els.packTimerValue.textContent = value;
    els.packTimer.classList.toggle("expired", state.packTimedOut);
    els.packTimer.setAttribute("aria-label", state.packTimedOut ? "時間切れ" : `残り時間 ${minutes}分${seconds}秒`);
  }

  function expirePackTimer() {
    if (!state.packTimerActive) return;
    state.packTimedOut = true;
    stopPackTimer(false);
    state.quiz.forEach((question) => {
      if (state.answers.has(question.id)) return;
      if (question.answerMode === "rubric-input") clearRubricDraft(question);
      state.answers.set(question.id, { type: "unknown", correct: false, unknown: true, timedOut: true });
      recordPackQuestionResult(question, false, { unknown: true, silent: true });
    });
    saveProgress();
    saveStats();
    renderProgressBar();
    renderProgressStats();
    renderWeeklyTrack();
    renderUnitTrack();
    renderBadges();
    renderExamDashboard();
    showSummary();
  }

  function shortPackDate(dateValue) {
    const match = String(dateValue || "").match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (!match) return "7月13日";
    return `${Number(match[1])}月${Number(match[2])}日`;
  }

  function updatePackCornerRoute() {
    if (!currentPackCorner()) return;
    const url = new URL(window.location.href);
    const cornerParam = packCornerRouteParam(state.packConfig);
    url.searchParams.set(cornerParam, state.packCorner);
    url.searchParams.delete(cornerParam === PACK_UNIT_ROUTE_PARAM ? PACK_CORNER_ROUTE_PARAM : PACK_UNIT_ROUTE_PARAM);
    url.hash = "";
    window.history.replaceState({ childId: state.activeChildId, packCorner: state.packCorner }, "", `${url.pathname}${url.search}`);
  }

  function selectPackCorner(cornerId) {
    const nextCorner = packCorners().find((corner) => corner?.id === cornerId);
    if (!nextCorner || nextCorner.enabled === false || nextCorner.id === state.packCorner) return;
    state.packCorner = nextCorner.id;
    const enabledTiers = availablePackTiers();
    if (!enabledTiers.includes(state.packTier)) state.packTier = enabledTiers[0] || "core";
    state.packReviewOnly = false;
    updatePackCornerRoute();
    startQuiz();
    scrollQuestionIntoView();
  }

  function renderPackCorners() {
    const corners = packCorners();
    if (!els.packCornerPanel || !els.packCornerSelector) return;
    const visible = corners.length > 0;
    els.packCornerPanel.classList.toggle("hidden", !visible);
    els.packCornerSelector.innerHTML = "";
    if (!visible) return;
    if (els.packCornerHeading) {
      els.packCornerHeading.textContent = state.packConfig.copy?.cornerHeading || "コーナーを選ぶ";
    }
    if (els.packCornerHint) {
      els.packCornerHint.textContent = state.packConfig.copy?.cornerHint || "どこからでも挑戦OK";
    }
    els.packCornerPanel.setAttribute("aria-label", state.packConfig.copy?.cornerAriaLabel || "学習コーナー");
    els.packCornerSelector.setAttribute("aria-label", state.packConfig.copy?.cornerAriaLabel || "学習コーナー");
    corners.forEach((corner) => {
      const questions = activeQuestions().filter((question) => question.cornerId === corner.id);
      const attempted = questions.filter((question) => {
        const record = state.progress[question.id] || {};
        return record.packFirstAttemptRecorded || Number(record.packAttempts) > 0;
      }).length;
      const button = document.createElement("button");
      button.type = "button";
      const disabled = corner.enabled === false;
      button.className = `pack-corner-button${corner.id === state.packCorner ? " active" : ""}${disabled ? " disabled" : ""}`;
      button.dataset.packCorner = corner.id;
      button.setAttribute("aria-pressed", String(corner.id === state.packCorner));
      button.disabled = disabled;
      const label = document.createElement("strong");
      label.textContent = corner.label || corner.shortLabel || corner.id;
      const count = document.createElement("small");
      count.textContent = disabled ? (corner.statusLabel || "準備中") : `${attempted} / ${questions.length}`;
      button.append(label, count);
      button.addEventListener("click", () => selectPackCorner(corner.id));
      els.packCornerSelector.appendChild(button);
    });
    const current = currentPackCorner();
    if (els.packCornerDescription) els.packCornerDescription.textContent = current?.description || "";
  }

  function renderPackStudyGuide() {
    const guide = state.packConfig?.studyGuide;
    const items = currentPackGuideItems();
    const visible = items.length > 0 && state.packTier !== "final";
    els.packStudyGuide.classList.toggle("hidden", !visible);
    if (!items.length) {
      els.packStudyGuideItems.innerHTML = "";
      return;
    }
    if (!visible) els.packStudyGuide.open = false;
    const mastery = packMeta().authorMastery || {};
    const masteredCount = items.filter((item) => item.authorKey && mastery[item.authorKey]?.mastered).length;
    const corner = currentPackCorner();
    const guideTitle = corner
      ? `${corner.label || corner.shortLabel}の人物${items.length}人`
      : (guide.title || "先に整理する");
    els.packStudyGuideTitle.textContent = `${guideTitle}（人物克服 ${masteredCount}/${items.length}）`;
    els.packStudyGuideItems.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("article");
      const mastered = Boolean(item.authorKey && mastery[item.authorKey]?.mastered);
      card.className = `pack-study-guide-item${mastered ? " mastered" : ""}`;
      const period = document.createElement("span");
      period.textContent = item.period || item.context || "文化史";
      const name = document.createElement("strong");
      name.textContent = item.name || item.label || item.authorKey || "";
      const cue = document.createElement("small");
      cue.textContent = item.cue || item.work || "";
      card.append(period, name, cue);
      if (mastered) {
        const badge = document.createElement("b");
        badge.textContent = "克服";
        card.appendChild(badge);
      }
      els.packStudyGuideItems.appendChild(card);
    });
  }

  function isQuizOnlyMode() {
    return isPackMode() && document.documentElement.classList.contains("quiz-only-mode");
  }

  function unitNumberFromId(unitId) {
    const match = String(unitId || "").match(/-(\d{2})$/);
    return match ? String(Number(match[1])) : "";
  }

  function renderQuizOnlyHeader(enabledTiers = availablePackTiers()) {
    if (!els.quizOnlyHeader) return;
    const visible = isQuizOnlyMode();
    els.quizOnlyHeader.classList.toggle("hidden", !visible);
    if (!visible) return;
    const corner = currentPackCorner();
    const number = unitNumberFromId(corner?.id);
    const title = String(corner?.label || corner?.shortLabel || state.packConfig?.title || "")
      .replace(/^\d+\.\s*/, "")
      .replace(/^単元\d+\s*/, "");
    els.quizOnlyPackTitle.textContent = state.packConfig?.shortTitle || state.packConfig?.title || "Challenge";
    els.quizOnlyUnitNumber.textContent = number ? `単元${number}` : "単元";
    els.quizOnlyUnitTitle.textContent = title;
    els.quizOnlyHome.textContent = state.packReviewAllTiers ? "← まちがい" : "← Base";
    if (state.packReviewAllTiers) {
      els.quizOnlyTier.textContent = "まちがい";
      els.quizOnlyAdvance.disabled = false;
      els.quizOnlyAdvance.textContent = "一覧へ戻る";
      return;
    }
    els.quizOnlyTier.textContent = PACK_TIER_SHORT_LABELS[state.packTier] || packTierLabel(state.packTier);

    const trackedTiers = enabledTiers.filter((tier) => tier !== "max");
    const tierIndex = trackedTiers.indexOf(state.packTier);
    const nextTier = tierIndex >= 0 ? trackedTiers[tierIndex + 1] : "";
    const corners = packCorners().filter((item) => item?.enabled !== false);
    const cornerIndex = corners.findIndex((item) => item.id === corner?.id);
    const nextCorner = cornerIndex >= 0 ? corners[cornerIndex + 1] : null;
    if (nextTier) {
      els.quizOnlyAdvance.disabled = false;
      els.quizOnlyAdvance.textContent = `次は${PACK_TIER_SHORT_LABELS[nextTier] || packTierLabel(nextTier)}`;
    } else if (nextCorner) {
      const nextNumber = unitNumberFromId(nextCorner.id);
      els.quizOnlyAdvance.disabled = false;
      els.quizOnlyAdvance.textContent = `次は単元${nextNumber}`;
    } else {
      els.quizOnlyAdvance.disabled = true;
      els.quizOnlyAdvance.textContent = "このコースは完了";
    }
  }

  function renderPackHero() {
    if (!isPackMode()) {
      els.packHero.classList.add("hidden");
      els.quizOnlyHeader?.classList.add("hidden");
      return;
    }
    const milestonesChanged = refreshPackMilestones();
    if (milestonesChanged) saveStats();
    const meta = packMeta();
    const recommendations = currentPackRecommendations();
    const guideItems = currentPackGuideItems();
    const masteredGuideItems = guideItems.filter((item) => (
      item.authorKey && meta.authorMastery?.[item.authorKey]?.mastered
    )).length;
    const hasUnmasteredGuideItems = guideItems.length > 0 && masteredGuideItems < guideItems.length;
    const core = packProgressForTier("core");
    const challenge = packProgressForTier("challenge");
    const final = packProgressForTier("final");
    const progressByTier = { core, challenge, final };
    const enabledTiers = availablePackTiers();
    const incompleteTrackedTier = enabledTiers.filter((tier) => tier !== "max").find((tier) => (
      progressByTier[tier].answered < progressByTier[tier].total
    ));
    const progressElements = {
      core: [els.packCoreProgress, els.packCoreAccuracy],
      challenge: [els.packChallengeProgress, els.packChallengeAccuracy],
      final: [els.packFinalProgress, els.packFinalAccuracy]
    };
    els.packHero.classList.toggle("hidden", isQuizOnlyMode());
    els.packHome.textContent = /^challenge-(?:social|science)-/.test(String(state.packId))
      ? "← Challenge Base"
      : "← コース一覧";
    els.packHero.setAttribute("aria-label", state.packConfig.title || "学習パック");
    els.packEyebrow.textContent = state.packConfig.copy?.eyebrow
      || `${shortPackDate(state.packConfig.examDate)} 定期テスト`;
    els.packTitle.textContent = state.packConfig.title || "定期テスト 200問チャレンジ";
    const corner = currentPackCorner();
    els.packCurrentTier.textContent = corner
      ? `${corner.shortLabel || corner.label} / ${packTierLabel(state.packTier)}`
      : packTierLabel(state.packTier);
    renderPackCorners();
    renderPackStudyGuide();
    els.packStart.textContent = state.packConfig.copy?.startButton || `${packSessionSize()}問始める`;
    els.packReview.textContent = state.packConfig.copy?.reviewButton || "間違いだけ";
    renderPackTimer();
    Object.entries(progressElements).forEach(([tier, [progressEl, accuracyEl]]) => {
      const progress = progressByTier[tier];
      progressEl.textContent = `${progress.answered} / ${progress.total}`;
      accuracyEl.textContent = progress.graded
        ? `正答率 ${progress.accuracy}%${progress.pending ? `・記述${progress.pending}件確認待ち` : ""}`
        : progress.pending
          ? `記述${progress.pending}件確認待ち`
          : "正答率 --";
    });
    els.packTierProgressCards.forEach((card) => {
      card.classList.toggle("hidden", !enabledTiers.includes(card.dataset.packTierProgress));
    });
    const visibleTrackedTierCount = enabledTiers.filter((tier) => tier !== "max").length;
    const progressContainer = els.packTierProgressCards[0]?.parentElement;
    if (progressContainer) {
      progressContainer.classList.toggle("one-tier", visibleTrackedTierCount === 1);
      progressContainer.classList.toggle("two-tiers", visibleTrackedTierCount === 2);
    }

    els.packTierButtons.forEach((button) => {
      const tier = button.dataset.packTier;
      button.classList.toggle("hidden", !enabledTiers.includes(tier));
      button.classList.toggle("active", tier === state.packTier);
      button.classList.remove("recommended", "completed");
      button.textContent = PACK_TIER_SHORT_LABELS[tier] || packTierLabel(tier);
      let status = "先取りOK";
      if (tier === "core") {
        status = core.answered >= core.total ? "完了" : `${core.answered}/${core.total}`;
        button.classList.toggle("completed", core.answered >= core.total);
      } else if (tier === "challenge") {
        status = challenge.answered >= challenge.total
          ? "完了"
          : recommendations.challengeRecommended ? "おすすめ" : "先取りOK";
        button.classList.toggle("recommended", recommendations.challengeRecommended);
        button.classList.toggle("completed", challenge.answered >= challenge.total);
      } else if (tier === "final") {
        status = final.answered >= final.total
          ? "完了"
          : recommendations.finalRecommended ? "解放" : "先取りOK";
        button.classList.toggle("recommended", recommendations.finalRecommended);
        button.classList.toggle("completed", final.answered >= final.total);
      } else {
        status = recommendations.maxRecommended ? "解放" : "先取りOK";
        button.classList.toggle("recommended", recommendations.maxRecommended);
      }
      button.dataset.status = status;
      button.setAttribute("aria-pressed", String(tier === state.packTier));
      button.setAttribute("aria-label", `${packTierLabel(tier)}: ${status}`);
    });
    els.packTierSelector.classList.toggle("three-tiers", enabledTiers.length === 3);
    els.packTierSelector.classList.toggle("two-tiers", enabledTiers.length === 2);
    els.packTierSelector.classList.toggle("one-tier", enabledTiers.length === 1);

    const currentTierPool = packPoolForTier(state.packTier);
    const readyReview = currentTierPool.filter((question) => {
      return packReviewIsReady(state.progress[question.id] || {});
    }).length;
    const coolingReview = currentTierPool.filter((question) => {
      const record = state.progress[question.id] || {};
      return record.needsReview && !packReviewIsReady(record);
    }).length;
    els.packReview.setAttribute("aria-label", `間違いだけ ${readyReview}問`);
    if (state.packReviewOnly) {
      els.packRecommendation.textContent = readyReview
        ? `間違いのうち、今解き直せる${readyReview}問から出題中。`
        : coolingReview
        ? `間違い${coolingReview}問は、別の問題を5問解いた後に再出題します。`
        : "このレベルには、今のところ間違いはありません。";
    } else if (state.packTier === "core" && recommendations.challengeRecommended) {
      els.packRecommendation.textContent = "基本は十分です。応用挑戦へ進むのがおすすめです。";
    } else if (state.packTier === "challenge" && recommendations.finalRecommended) {
      els.packRecommendation.textContent = "応用力が安定しました。最終挑戦へ進めます。";
    } else if (state.packTier === "final" && enabledTiers.includes("max") && recommendations.maxRecommended) {
      els.packRecommendation.textContent = "自動採点対象を完了。記述は保護者確認と並行し、MAXミックスで新しい問題に挑戦できます。";
    } else if (state.packTier === "max") {
      els.packRecommendation.textContent = "最高難度と数値違いを混ぜた、何度でも挑戦できる10問です。";
    } else {
      const nextTier = enabledTiers[enabledTiers.indexOf(state.packTier) + 1];
      const currentProgress = progressByTier[state.packTier];
      if (nextTier) {
        els.packRecommendation.textContent = state.packConfig.copy?.tierLead?.[state.packTier]
          || `${packTierLabel(state.packTier)}を${packSessionSize()}問ずつ進めよう。${packTierLabel(nextTier)}はいつでも先取りできます。`;
      } else if (currentProgress && currentProgress.answered < currentProgress.total) {
        els.packRecommendation.textContent = state.packConfig.copy?.tierLead?.[state.packTier]
          || `${packTierLabel(state.packTier)}を最後まで解いて、選択肢なしでも思い出せるか確かめよう。`;
      } else {
        if (hasUnmasteredGuideItems) {
          els.packRecommendation.textContent = `最終${currentProgress.total}問を完走。人物克服 ${masteredGuideItems}/${guideItems.length}。各レベルの「${state.packConfig.copy?.reviewButton || "間違いだけ"}」で混同をなくそう。`;
        } else if (guideItems.length && incompleteTrackedTier) {
          const incomplete = progressByTier[incompleteTrackedTier];
          els.packRecommendation.textContent = `人物克服 ${masteredGuideItems}/${guideItems.length}。${PACK_TIER_SHORT_LABELS[incompleteTrackedTier]}は ${incomplete.answered}/${incomplete.total} なので、段階ボタンから残りも確認しよう。`;
        } else {
          els.packRecommendation.textContent = state.packConfig.copy?.complete
            || `全レベル完了です。「間違いだけ」で混同をなくそう。`;
        }
      }
    }
    const nextTier = enabledTiers[enabledTiers.indexOf(state.packTier) + 1];
    const currentProgress = progressByTier[state.packTier];
    els.packLevelUp.disabled = !nextTier;
    els.packLevelUp.textContent = state.packTier === "max"
      ? "最高レベル"
      : nextTier
      ? "上のレベルへ"
      : currentProgress && currentProgress.answered < currentProgress.total
        ? "ここが最終レベル"
        : hasUnmasteredGuideItems
          ? `人物克服 ${masteredGuideItems}/${guideItems.length}`
          : guideItems.length && incompleteTrackedTier
            ? `${PACK_TIER_SHORT_LABELS[incompleteTrackedTier]} ${progressByTier[incompleteTrackedTier].answered}/${progressByTier[incompleteTrackedTier].total} 未完`
            : "全レベル完了";
    renderQuizOnlyHeader(enabledTiers);
  }

  function startQuiz(options = {}) {
    stopPackTimer(true);
    state.packTimedOut = false;
    if (isPackMode() && !isTrialMode()) beginPackSession();
    else if (isPackMode()) state.packSessionId = `trial:${Date.now()}`;
    state.quiz = pickQuiz();
    state.index = 0;
    state.answers = new Map();
    state.sessionRecorded = false;
    state.choiceOrders = new Map();
    state.equationStates = new Map();
    state.inputDragStates = new Map();
    state.mathAnswerDrafts = new Map();
    state.rubricDraftStates = new Map();
    if (isTrialMode()) {
      state.trialScratchNotes = {};
    } else {
      state.quiz.forEach((question) => {
        if (state.progress[question.id]?.currentAttemptHadMistake) {
          delete state.progress[question.id].currentAttemptHadMistake;
        }
      });
      saveProgress();
    }
    els.summary.classList.add("hidden");
    els.questionCard.classList.remove("hidden");
    renderTitle();
    renderQuestion();
    renderProgressStats();
    renderWeeklyTrack();
    renderUnitTrack();
    renderBadges();
    renderExamDashboard();
    renderPackHero();
    startPackTimerIfNeeded();
  }

  function renderTitle() {
    if (isPackMode()) {
      const cornerLabel = currentPackCorner()?.shortLabel || currentPackCorner()?.label || "";
      const tierLabel = packTierLabel(state.packTier);
      if (isParentChallengeTrial()) {
        els.quizLabel.textContent = `${cornerLabel ? `${cornerLabel} / ` : ""}保護者お試し`;
        els.quizTitle.textContent = "この解答は長男の記録に入りません";
        return;
      }
      if (state.packReviewAllTiers) {
        els.quizLabel.textContent = `${cornerLabel ? `${cornerLabel} / ` : ""}まちがい直し`;
        els.quizTitle.textContent = "基本・応用・最終の間違いを解き直す";
        return;
      }
      els.quizLabel.textContent = state.packReviewOnly
        ? `${cornerLabel ? `${cornerLabel} / ` : ""}${tierLabel} / 間違いだけ`
        : `${cornerLabel ? `${cornerLabel} / ` : ""}${tierLabel} / ${packSessionSize()}問セット`;
      els.quizTitle.textContent = state.packReviewOnly
        ? "間違いと「わからない」を解き直す"
        : `${cornerLabel ? `${cornerLabel}の` : ""}${tierLabel}に挑戦`;
      return;
    }
    const filterLabel = `${subjectLabel()} / ${unitLabel()}`;
    const config = currentChildConfig();
    els.quizLabel.textContent = `${labels[state.mode]} / ${filterLabel}`;
    if (state.mode === "review") {
      els.quizTitle.textContent = state.unit === "all" ? "できなかった問題だけを解き直す" : `${state.unit}の間違い直し`;
    } else if (state.mode === "focus") {
      els.quizTitle.textContent = state.unit === "all" ? "数学の土台を中心に集中補修" : `${state.unit}を集中補修`;
    } else if (state.mode === "weekly") {
      els.quizTitle.textContent = "県立型の資料読取・長文・複合問題を短い実戦セットで解く";
    } else if (state.mode === "trial") {
      els.quizTitle.textContent = "保護者用のお試しです。解答、ミス、復習待ち、連続日数には記録しません。";
    } else {
      els.quizTitle.textContent = state.unit === "all" ? config.title : `${state.unit}の基礎確認`;
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
      els.summaryText.textContent = isPackMode()
        ? state.packReviewOnly
          ? state.packReviewAllTiers
            ? "今すぐ解き直せる問題はありません。別の問題を5問以上進めると、待機中の間違いが出題されます。"
            : "今すぐ解き直せる問題はありません。別の問題を進めるか、別のレベルの間違いを確認してください。"
          : `${packTierLabel(state.packTier)}の問題を読み込めませんでした。ページを再読み込みしてください。`
        : activeQuestions().length === 0
          ? `${currentChildProfile().name}（${currentChildConfig().grade}）用の問題はまだ準備中です。トップに戻るか、問題を追加してください。`
          : state.mode === "review"
          ? "この条件でやり直す問題はありません。別の教科・カテゴリを選ぶか、通常モードで問題を解いてください。"
          : "この条件で出題できる問題がありません。教科・カテゴリ・モードを変更してください。";
      els.weakUnitList.innerHTML = "";
      els.readingPassage.classList.add("hidden");
      els.readingPassageText.textContent = "";
      els.prompt.textContent = "";
      els.prompt.classList.remove("single-line-math");
      els.questionFigure.innerHTML = "";
      els.questionFigure.classList.add("hidden");
      els.choices.innerHTML = "";
      els.explanation.classList.add("hidden");
      els.paperRef.classList.add("hidden");
      els.progressText.textContent = "0 / 0";
      els.scoreText.textContent = "0 正解";
      els.progressMetric.textContent = "0/0";
      els.scoreMetric.textContent = "0";
      els.progressBar.style.width = "0%";
      els.prevQuestion.disabled = true;
      els.nextQuestion.disabled = true;
      els.unknownAnswer.disabled = true;
      return;
    }

    const question = state.quiz[state.index];
    const currentAnswer = state.answers.get(question.id);
    els.subjectPill.textContent = question.subject;
    const visibleUnitNumber = /^challenge-(?:social|science)-/.test(String(question.packId || ""))
      ? unitNumberFromId(question.unitId)
      : "";
    els.unitPill.textContent = visibleUnitNumber ? `単元${visibleUnitNumber}｜${question.unit}` : question.unit;
    els.priorityPill.textContent = question.priority || packTierLabel(packQuestionTier(question));
    els.questionStage.textContent = question.stage || inferStage(question);
    els.readingPassageText.textContent = question.passage || "";
    els.readingPassage.classList.toggle("hidden", !question.passage);
    els.prompt.textContent = mathKeypadUtils?.directEntryPrompt(question) || question.prompt;
    els.prompt.classList.remove("single-line-math");
    els.prompt.style.removeProperty("font-size");
    renderQuestionFigure(question.figure);
    els.explanation.classList.toggle("hidden", currentAnswer === undefined);
    els.explanationText.textContent = question.explanation || "答えと考え方を確認しよう。";
    renderPaperReference(question.paperRef, currentAnswer !== undefined);
    els.unknownAnswer.disabled = currentAnswer !== undefined;
    renderAnswerArea(question, currentAnswer);
    fitResponsiveMathLayout(question);
    renderProgressBar();
  }

  function fitResponsiveMathLayout(question) {
    window.ResponsiveMathLayout?.fitQuestionPrompt(
      els.prompt,
      question.answerMode === "drag-work"
        || (question.subject === "数学"
          && !question.passage
          && !question.figure
          && els.prompt.textContent.length <= 30)
    );
    window.ResponsiveMathLayout?.fitGuidedChoices(els.choices);
  }

  let responsiveMathLayoutFrame = null;

  function scheduleResponsiveMathLayoutFit() {
    if (responsiveMathLayoutFrame !== null) {
      window.cancelAnimationFrame(responsiveMathLayoutFrame);
    }
    responsiveMathLayoutFrame = window.requestAnimationFrame(() => {
      responsiveMathLayoutFrame = null;
      const question = state.quiz[state.index];
      if (question) fitResponsiveMathLayout(question);
    });
  }

  function renderPaperReference(reference, answered) {
    const text = paperReferenceText(reference);
    els.paperRef.textContent = text ? `紙でも確認: ${text}` : "";
    els.paperRef.classList.toggle("hidden", !answered || !text);
  }

  function paperReferenceText(reference) {
    if (Array.isArray(reference)) return reference.map(paperReferenceText).filter(Boolean).join(" / ");
    if (reference && typeof reference === "object") {
      const label = reference.label || reference.title || reference.source || reference.book || "";
      const page = reference.page || reference.pages || reference.location || "";
      return [label, page].filter(Boolean).join(" ");
    }
    return String(reference || "").trim();
  }

  function renderQuestionFigure(figure) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    els.questionFigure.innerHTML = "";
    if (!figure || typeof figure !== "object") {
      els.questionFigure.classList.add("hidden");
      return;
    }
    let content = null;
    if (figure.kind === "table") content = renderFigureTable(figure);
    if (figure.kind === "contour") content = renderContourFigure(figure);
    if (figure.kind === "map") content = renderMapFigure(figure);
    if (figure.kind === "timeline") content = renderTimelineFigure(figure);
    if (figure.kind === "diagram") content = renderDiagramFigure(figure);
    if (figure.kind === "lineGraph") content = renderLineGraphFigure(figure);
    if (figure.kind === "audio") content = renderAudioFigure(figure);
    if (!content) {
      els.questionFigure.classList.add("hidden");
      return;
    }
    els.questionFigure.appendChild(content);
    els.questionFigure.classList.remove("hidden");
  }

  function renderAudioFigure(figure) {
    const wrapper = document.createElement("figure");
    wrapper.className = "data-figure audio-figure";
    wrapper.setAttribute("aria-label", String(figure.alt || "英語音声の再生"));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "audio-play-button";
    button.textContent = "🔊 英語を聞く";
    const status = document.createElement("span");
    status.className = "audio-play-status";
    status.setAttribute("aria-live", "polite");
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      button.disabled = true;
      status.textContent = "この端末では音声を再生できません。";
    } else {
      button.addEventListener("click", () => {
        window.speechSynthesis.cancel();
        const utterance = new window.SpeechSynthesisUtterance(String(figure.audioText || ""));
        utterance.lang = String(figure.lang || "en-US");
        utterance.rate = Math.max(0.6, Math.min(1.1, Number(figure.rate) || 0.86));
        const voices = window.speechSynthesis.getVoices();
        const requestedLanguage = utterance.lang.toLowerCase();
        const voice = voices.find((item) => String(item.lang || "").toLowerCase() === requestedLanguage)
          || voices.find((item) => String(item.lang || "").toLowerCase().startsWith("en"));
        if (voice) utterance.voice = voice;
        utterance.onstart = () => {
          button.textContent = "🔊 再生中…";
          status.textContent = "英語音声を再生しています。";
        };
        utterance.onend = () => {
          button.textContent = "🔁 もう一度聞く";
          status.textContent = "再生が終わりました。";
        };
        utterance.onerror = () => {
          button.textContent = "🔊 英語を聞く";
          status.textContent = "再生できませんでした。もう一度押してください。";
        };
        window.speechSynthesis.speak(utterance);
      });
    }
    wrapper.append(button, status);
    appendFigureCaption(wrapper, figure.caption || figure.alt);
    return wrapper;
  }

  function renderFigureTable(figure) {
    const wrapper = document.createElement("figure");
    wrapper.className = "data-figure";
    const accessibleLabel = String(figure.alt || figure.caption || "問題の資料表");
    wrapper.setAttribute("aria-label", accessibleLabel);
    const tableWrap = document.createElement("div");
    tableWrap.className = "figure-table-wrap";
    tableWrap.tabIndex = 0;
    tableWrap.setAttribute("role", "region");
    tableWrap.setAttribute("aria-label", accessibleLabel);
    const table = document.createElement("table");
    table.setAttribute("aria-label", accessibleLabel);
    const columns = Array.isArray(figure.columns) ? figure.columns : [];
    if (columns.length) {
      const thead = document.createElement("thead");
      const row = document.createElement("tr");
      columns.forEach((column) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = typeof column === "object" ? String(column.label || column.key || "") : String(column);
        row.appendChild(th);
      });
      thead.appendChild(row);
      table.appendChild(thead);
    }
    const tbody = document.createElement("tbody");
    (Array.isArray(figure.rows) ? figure.rows : []).forEach((sourceRow) => {
      const row = document.createElement("tr");
      const cells = Array.isArray(sourceRow)
        ? sourceRow
        : columns.map((column) => sourceRow?.[typeof column === "object" ? column.key : column]);
      cells.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = String(cell ?? "");
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    wrapper.appendChild(tableWrap);
    appendFigureCaption(wrapper, figure.caption || figure.alt);
    return wrapper;
  }

  function renderLineGraphFigure(figure) {
    const wrapper = document.createElement("figure");
    wrapper.className = "data-figure science-graph-figure";
    const namespace = "http://www.w3.org/2000/svg";
    const width = Number(figure.width) || 360;
    const height = Number(figure.height) || 230;
    const plot = { left: 54, right: width - 18, top: 18, bottom: height - 46 };
    const xMin = Number(figure.xMin) || 0;
    const xMax = Number(figure.xMax) || 1;
    const yMin = Number(figure.yMin) || 0;
    const yMax = Number(figure.yMax) || 1;
    const x = (value) => plot.left + ((Number(value) - xMin) / (xMax - xMin)) * (plot.right - plot.left);
    const y = (value) => plot.bottom - ((Number(value) - yMin) / (yMax - yMin)) * (plot.bottom - plot.top);
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", String(figure.alt || figure.caption || "理科のグラフ"));
    svg.classList.add("science-line-graph");
    const background = document.createElementNS(namespace, "rect");
    background.setAttribute("x", "1"); background.setAttribute("y", "1");
    background.setAttribute("width", String(width - 2)); background.setAttribute("height", String(height - 2));
    background.setAttribute("rx", "12"); background.setAttribute("class", "science-graph-background");
    svg.appendChild(background);
    const appendLine = (x1, y1, x2, y2, className) => {
      const line = document.createElementNS(namespace, "line");
      line.setAttribute("x1", String(x1)); line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2)); line.setAttribute("y2", String(y2));
      line.setAttribute("class", className); svg.appendChild(line);
    };
    const appendText = (px, py, value, className, anchor = "middle") => {
      const text = document.createElementNS(namespace, "text");
      text.setAttribute("x", String(px)); text.setAttribute("y", String(py)); text.setAttribute("text-anchor", anchor);
      text.setAttribute("class", className); text.textContent = String(value); svg.appendChild(text);
    };
    (Array.isArray(figure.xTicks) ? figure.xTicks : []).forEach((tick) => {
      const value = typeof tick === "object" ? tick.value : tick;
      appendLine(x(value), plot.top, x(value), plot.bottom, "science-graph-grid");
      appendText(x(value), plot.bottom + 18, typeof tick === "object" ? tick.label : value, "science-graph-tick");
    });
    (Array.isArray(figure.yTicks) ? figure.yTicks : []).forEach((tick) => {
      const value = typeof tick === "object" ? tick.value : tick;
      appendLine(plot.left, y(value), plot.right, y(value), "science-graph-grid");
      appendText(plot.left - 8, y(value) + 4, typeof tick === "object" ? tick.label : value, "science-graph-tick", "end");
    });
    appendLine(plot.left, plot.top, plot.left, plot.bottom, "science-graph-axis");
    appendLine(plot.left, plot.bottom, plot.right, plot.bottom, "science-graph-axis");
    appendText((plot.left + plot.right) / 2, height - 10, figure.xLabel || "", "science-graph-axis-label");
    appendText(8, 14, figure.yLabel || "", "science-graph-axis-label", "start");
    (Array.isArray(figure.series) ? figure.series : []).forEach((series, seriesIndex) => {
      const points = Array.isArray(series.points) ? series.points : [];
      const pathData = points.map((point, index) => `${index ? "L" : "M"} ${x(point[0])} ${y(point[1])}`).join(" ");
      if (!pathData) return;
      const path = document.createElementNS(namespace, "path");
      path.setAttribute("d", pathData); path.setAttribute("class", `science-graph-series science-graph-series-${(seriesIndex % 4) + 1}`);
      svg.appendChild(path);
      points.forEach((point) => {
        const circle = document.createElementNS(namespace, "circle");
        circle.setAttribute("cx", String(x(point[0]))); circle.setAttribute("cy", String(y(point[1])));
        circle.setAttribute("r", "3.6"); circle.setAttribute("class", `science-graph-point science-graph-point-${(seriesIndex % 4) + 1}`);
        svg.appendChild(circle);
      });
      if (series.label && points.length) {
        const labelPoint = Array.isArray(series.labelPoint) ? series.labelPoint : points.at(-1);
        const labelDx = Number(series.labelDx) || -4;
        const labelDy = Number(series.labelDy) || -8;
        appendText(
          x(labelPoint[0]) + labelDx,
          y(labelPoint[1]) + labelDy,
          series.label,
          "science-graph-series-label",
          series.labelAnchor || "end"
        );
      }
    });
    wrapper.appendChild(svg);
    appendFigureCaption(wrapper, figure.caption || figure.alt);
    return wrapper;
  }

  function renderContourFigure(figure) {
    const wrapper = document.createElement("figure");
    wrapper.className = "data-figure contour-figure";
    const namespace = "http://www.w3.org/2000/svg";
    const width = Number(figure.width) || 360;
    const height = Number(figure.height) || 210;
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", String(figure.alt || figure.title || figure.caption || "等高線図"));
    svg.classList.add("contour-map");

    const background = document.createElementNS(namespace, "rect");
    background.setAttribute("x", "1");
    background.setAttribute("y", "1");
    background.setAttribute("width", String(width - 2));
    background.setAttribute("height", String(height - 2));
    background.setAttribute("rx", "10");
    background.setAttribute("class", "contour-background");
    svg.appendChild(background);

    const lineSources = [
      ...(Array.isArray(figure.paths) ? figure.paths : []),
      ...(Array.isArray(figure.lines) ? figure.lines : []),
      ...(Array.isArray(figure.rings) ? figure.rings : [])
    ];
    lineSources.forEach((line, index) => {
      const path = document.createElementNS(namespace, "path");
      const lineObject = typeof line === "object" && line !== null ? line : { d: line };
      const points = Array.isArray(lineObject.points) ? lineObject.points : [];
      let pathData = String(lineObject.d || "");
      if (!pathData && points.length) {
        pathData = points.map((point, pointIndex) => {
          const pair = Array.isArray(point) ? point : [point.x, point.y];
          return `${pointIndex ? "L" : "M"} ${Number(pair[0]) || 0} ${Number(pair[1]) || 0}`;
        }).join(" ");
        if (lineObject.closed !== false) pathData += " Z";
      }
      if (!pathData && Number.isFinite(Number(lineObject.cx))) {
        const cx = Number(lineObject.cx);
        const cy = Number(lineObject.cy);
        const rx = Number(lineObject.rx || lineObject.r || 20);
        const ry = Number(lineObject.ry || lineObject.r || rx);
        pathData = `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
      }
      if (!pathData) return;
      path.setAttribute("d", pathData);
      path.setAttribute("class", `contour-line contour-line-${(index % 5) + 1}`);
      svg.appendChild(path);
      if (lineObject.label || lineObject.level) {
        appendContourLabel(svg, namespace, {
          x: lineObject.labelX ?? lineObject.x ?? width / 2,
          y: lineObject.labelY ?? lineObject.y ?? (20 + index * 18),
          text: lineObject.label || lineObject.level
        });
      }
    });

    (Array.isArray(figure.points) ? figure.points : []).forEach((point) => {
      const circle = document.createElementNS(namespace, "circle");
      circle.setAttribute("cx", String(Number(point.x) || 0));
      circle.setAttribute("cy", String(Number(point.y) || 0));
      circle.setAttribute("r", String(Number(point.r) || 5));
      circle.setAttribute("class", "contour-point");
      svg.appendChild(circle);
      if (point.label) appendContourLabel(svg, namespace, { x: Number(point.x) + 8, y: Number(point.y) - 8, text: point.label });
    });
    (Array.isArray(figure.labels) ? figure.labels : []).forEach((label) => appendContourLabel(svg, namespace, label));
    wrapper.appendChild(svg);
    appendFigureCaption(wrapper, figure.caption || figure.title);
    return wrapper;
  }

  function mapPointPath(points, closePath = true) {
    if (!Array.isArray(points) || points.length < 2) return "";
    const path = points.map((point, index) => {
      const pair = Array.isArray(point) ? point : [point?.x, point?.y];
      return `${index ? "L" : "M"} ${Number(pair[0]) || 0} ${Number(pair[1]) || 0}`;
    }).join(" ");
    return closePath ? `${path} Z` : path;
  }

  function renderMapFigure(figure) {
    const wrapper = document.createElement("figure");
    wrapper.className = "data-figure map-figure";
    const namespace = "http://www.w3.org/2000/svg";
    const width = Number(figure.width) || 360;
    const height = Number(figure.height) || 210;
    const accessibleLabel = String(figure.alt || figure.caption || "問題の地図");
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", accessibleLabel);
    svg.classList.add("learning-map");

    const background = document.createElementNS(namespace, "rect");
    background.setAttribute("x", "1");
    background.setAttribute("y", "1");
    background.setAttribute("width", String(width - 2));
    background.setAttribute("height", String(height - 2));
    background.setAttribute("rx", "12");
    background.setAttribute("class", "map-ocean");
    svg.appendChild(background);

    (Array.isArray(figure.gridLines) ? figure.gridLines : []).forEach((line) => {
      const pathData = mapPointPath(line.points, false);
      if (!pathData) return;
      const path = document.createElementNS(namespace, "path");
      path.setAttribute("d", pathData);
      path.setAttribute("class", `map-grid-line${line.emphasis ? " emphasis" : ""}${line.dashed ? " dashed" : ""}`);
      svg.appendChild(path);
    });

    (Array.isArray(figure.regions) ? figure.regions : []).forEach((region, index) => {
      const pathData = mapPointPath(region.points, region.closed !== false);
      if (!pathData) return;
      const path = document.createElementNS(namespace, "path");
      path.setAttribute("d", pathData);
      const tone = Math.max(1, Math.min(6, Number(region.tone) || ((index % 6) + 1)));
      path.setAttribute("class", `map-region map-region-${tone}${region.highlight ? " highlight" : ""}`);
      if (region.label) {
        const title = document.createElementNS(namespace, "title");
        title.textContent = String(region.label);
        path.appendChild(title);
      }
      svg.appendChild(path);
    });

    (Array.isArray(figure.points) ? figure.points : []).forEach((point) => {
      const circle = document.createElementNS(namespace, "circle");
      circle.setAttribute("cx", String(Number(point.x) || 0));
      circle.setAttribute("cy", String(Number(point.y) || 0));
      circle.setAttribute("r", String(Number(point.r) || 5));
      circle.setAttribute("class", "map-point");
      svg.appendChild(circle);
    });

    (Array.isArray(figure.labels) ? figure.labels : []).forEach((label) => {
      const textNode = document.createElementNS(namespace, "text");
      textNode.setAttribute("x", String(Number(label.x) || 0));
      textNode.setAttribute("y", String(Number(label.y) || 0));
      textNode.setAttribute("text-anchor", label.anchor === "start" || label.anchor === "end" ? label.anchor : "middle");
      textNode.setAttribute("class", `map-label${label.emphasis ? " emphasis" : ""}`);
      textNode.textContent = String(label.text || label.label || "");
      svg.appendChild(textNode);
    });

    wrapper.appendChild(svg);
    appendFigureCaption(wrapper, figure.caption || figure.alt);
    return wrapper;
  }

  function renderTimelineFigure(figure) {
    const wrapper = document.createElement("figure");
    wrapper.className = "data-figure history-timeline-figure";
    const accessibleLabel = String(figure.alt || figure.caption || "歴史年表");
    wrapper.setAttribute("aria-label", accessibleLabel);
    const list = document.createElement("ol");
    list.className = "history-timeline";
    (Array.isArray(figure.events) ? figure.events : []).forEach((event) => {
      const item = document.createElement("li");
      if (event?.emphasis) item.classList.add("emphasis");
      const year = document.createElement("strong");
      year.textContent = String(event?.year || "");
      const label = document.createElement("span");
      label.textContent = String(event?.label || event?.text || "");
      item.append(year, label);
      list.appendChild(item);
    });
    wrapper.appendChild(list);
    appendFigureCaption(wrapper, figure.caption || figure.alt);
    return wrapper;
  }

  function diagramNodeCenter(node) {
    return {
      x: Number(node?.x) + Number(node?.width) / 2,
      y: Number(node?.y) + Number(node?.height) / 2
    };
  }

  function diagramLabelLines(value, maxLength = 11) {
    const source = String(value || "").trim();
    if (!source) return [];
    if (source.includes("\n")) return source.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 3);
    if (source.length <= maxLength) return [source];
    const lines = [];
    for (let index = 0; index < source.length && lines.length < 3; index += maxLength) {
      lines.push(source.slice(index, index + maxLength));
    }
    return lines;
  }

  function renderDiagramFigure(figure) {
    const wrapper = document.createElement("figure");
    wrapper.className = "data-figure history-diagram-figure";
    const namespace = "http://www.w3.org/2000/svg";
    const width = Number(figure.width) || 360;
    const height = Number(figure.height) || 220;
    const accessibleLabel = String(figure.alt || figure.caption || "歴史の関係図");
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", accessibleLabel);
    svg.classList.add("history-diagram");

    const background = document.createElementNS(namespace, "rect");
    background.setAttribute("x", "1");
    background.setAttribute("y", "1");
    background.setAttribute("width", String(width - 2));
    background.setAttribute("height", String(height - 2));
    background.setAttribute("rx", "12");
    background.setAttribute("class", "history-diagram-background");
    svg.appendChild(background);

    const nodes = Array.isArray(figure.nodes) ? figure.nodes : [];
    const nodeById = new Map(nodes.map((node) => [String(node.id || ""), node]));
    (Array.isArray(figure.edges) ? figure.edges : []).forEach((edge) => {
      const from = nodeById.get(String(edge?.from || ""));
      const to = nodeById.get(String(edge?.to || ""));
      if (!from || !to) return;
      const start = diagramNodeCenter(from);
      const end = diagramNodeCenter(to);
      const line = document.createElementNS(namespace, "line");
      line.setAttribute("x1", String(start.x));
      line.setAttribute("y1", String(start.y));
      line.setAttribute("x2", String(end.x));
      line.setAttribute("y2", String(end.y));
      line.setAttribute("class", `history-diagram-edge${edge.dashed ? " dashed" : ""}`);
      svg.appendChild(line);
      if (edge.label) {
        const text = document.createElementNS(namespace, "text");
        text.setAttribute("x", String((start.x + end.x) / 2));
        text.setAttribute("y", String((start.y + end.y) / 2 - 5));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("class", "history-diagram-edge-label");
        text.textContent = String(edge.label);
        svg.appendChild(text);
      }
    });

    nodes.forEach((node, index) => {
      const x = Number(node.x) || 0;
      const y = Number(node.y) || 0;
      const nodeWidth = Number(node.width) || 90;
      const nodeHeight = Number(node.height) || 48;
      const rect = document.createElementNS(namespace, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(nodeWidth));
      rect.setAttribute("height", String(nodeHeight));
      rect.setAttribute("rx", "9");
      const tone = Math.max(1, Math.min(6, Number(node.tone) || ((index % 6) + 1)));
      rect.setAttribute("class", `history-diagram-node history-diagram-node-${tone}${node.emphasis ? " emphasis" : ""}`);
      svg.appendChild(rect);

      const lines = diagramLabelLines(node.label || node.text);
      const text = document.createElementNS(namespace, "text");
      text.setAttribute("x", String(x + nodeWidth / 2));
      text.setAttribute("y", String(y + nodeHeight / 2 - ((lines.length - 1) * 8)));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "history-diagram-node-label");
      lines.forEach((labelLine, lineIndex) => {
        const tspan = document.createElementNS(namespace, "tspan");
        tspan.setAttribute("x", String(x + nodeWidth / 2));
        tspan.setAttribute("dy", lineIndex ? "16" : "0");
        tspan.textContent = labelLine;
        text.appendChild(tspan);
      });
      svg.appendChild(text);
    });

    wrapper.appendChild(svg);
    appendFigureCaption(wrapper, figure.caption || figure.alt);
    return wrapper;
  }

  function appendContourLabel(svg, namespace, label) {
    const textNode = document.createElementNS(namespace, "text");
    textNode.setAttribute("x", String(Number(label.x) || 0));
    textNode.setAttribute("y", String(Number(label.y) || 0));
    textNode.setAttribute("class", "contour-label");
    textNode.textContent = String(label.text || label.label || "");
    svg.appendChild(textNode);
  }

  function appendFigureCaption(wrapper, captionText) {
    if (!captionText) return;
    const caption = document.createElement("figcaption");
    caption.textContent = String(captionText);
    wrapper.appendChild(caption);
  }

  function renderAnswerArea(question, currentAnswer) {
    if (mathKeypadUtils?.isDirectAnswerQuestion(question)) {
      renderMathKeypadAnswer(question, currentAnswer);
      return;
    }
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
    appendCompactMathScratchKeypad(question, currentAnswer !== undefined);
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

  function correctInputFeedback(question) {
    if (question.subject === "数学") {
      return "正解です。計算の流れも同じ形で追えているか確認しましょう。";
    }
    if (question.packId === "social-author-drill") {
      return "正解です。解説で人物・作品・時代の結び付きを確認しましょう。";
    }
    return "正解です。解説でも根拠と対応を確認しましょう。";
  }

  function renderInputAnswer(question, currentAnswer) {
    els.choices.innerHTML = "";
    if (question.answerMode === "drag-work") {
      renderDragWorkAnswer(question, currentAnswer);
      return;
    }
    if (question.answerMode === "rubric-input") {
      renderRubricInputAnswer(question, currentAnswer);
      return;
    }
    if (isSystemInputQuestion(question)) {
      renderSystemInputAnswer(question, currentAnswer);
      return;
    }
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
        ? correctInputFeedback(question)
        : `不正解です。正解例: ${answerTextLabel(question)}`;
    } else {
      feedback.textContent = question.packId === "social-author-drill" && question.answerTarget === "author"
        ? "作家名は漢字で入力してください。"
        : "選択肢を見ずに、答えを直接入れます。";
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

  function renderMathKeypadAnswer(question, currentAnswer) {
    els.choices.innerHTML = "";
    els.choices.appendChild(renderCompactMathKeypad(question, {
      mode: "answer",
      currentAnswer,
      disabled: currentAnswer !== undefined
    }));
  }

  function appendCompactMathScratchKeypad(question, disabled) {
    if (question.subject !== "数学") return;
    els.choices.appendChild(renderCompactMathKeypad(question, {
      mode: "scratch",
      disabled
    }));
  }

  function renderCompactMathKeypad(question, options = {}) {
    const mode = options.mode === "scratch" ? "scratch" : "answer";
    const disabled = Boolean(options.disabled);
    const draft = getMathAnswerDraft(question, mode);
    const storedValue = mode === "answer"
      ? mathKeypadStoredValue(question, options.currentAnswer)
      : "";
    const value = options.currentAnswer !== undefined ? storedValue : draft.tokens.join("");
    const source = mode === "answer"
      ? mathKeypadUtils?.answerSource(question)
      : mathKeypadUtils?.scratchSource(question);
    const config = mathKeypadUtils?.configForSource(source) || {
      core: ["7", "8", "9", "+", "4", "5", "6", "−", "1", "2", "3", "x", "0", "x²", "x³"],
      extra: ["±"]
    };

    const keypad = document.createElement("section");
    keypad.className = `math-answer-keypad ${mode}`;
    keypad.setAttribute("aria-label", mode === "answer" ? "数式テンキー解答" : "計算メモ");

    const header = document.createElement("div");
    header.className = "math-work-keypad-header";
    const heading = document.createElement("p");
    heading.className = "math-work-keypad-heading";
    heading.textContent = mode === "answer" ? "答え" : "計算メモ";
    const editActions = document.createElement("div");
    editActions.className = "math-work-keypad-edit-actions";
    const undo = document.createElement("button");
    undo.type = "button";
    undo.className = "math-work-keypad-edit math-answer-keypad-undo";
    undo.textContent = "↶";
    undo.title = "1つ前の操作に戻す";
    undo.setAttribute("aria-label", undo.title);
    undo.disabled = disabled || !draft.history.length;
    undo.addEventListener("click", () => undoMathAnswerDraft(question, mode));
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "math-work-keypad-edit math-answer-keypad-clear";
    clear.textContent = "AC";
    clear.title = "全消去";
    clear.setAttribute("aria-label", clear.title);
    clear.disabled = disabled || !draft.tokens.length;
    clear.addEventListener("click", () => clearMathAnswerDraft(question, mode));
    editActions.append(undo, clear);
    header.append(heading, editActions);

    const display = document.createElement("output");
    display.className = value ? "math-answer-keypad-display" : "math-answer-keypad-display empty";
    display.textContent = value || "未入力";
    display.setAttribute("aria-live", "polite");
    display.setAttribute("aria-label", value ? `入力中の式 ${value}` : "入力中の式はありません");

    const controls = document.createElement("div");
    controls.className = "math-answer-keypad-controls";
    const core = document.createElement("div");
    core.className = "math-work-keypad-core";
    config.core.forEach((text, keyIndex) => {
      core.appendChild(createCompactMathKeypadKey(
        question,
        mode,
        text,
        `core-${keyIndex}`,
        disabled
      ));
    });
    const backspace = document.createElement("button");
    backspace.type = "button";
    backspace.className = "math-work-keypad-key math-work-keypad-backspace math-answer-keypad-backspace";
    backspace.textContent = "⌫";
    backspace.title = "1つ削除";
    backspace.setAttribute("aria-label", backspace.title);
    backspace.disabled = disabled || !draft.tokens.length;
    backspace.addEventListener("click", () => backspaceMathAnswerDraft(question, mode));
    core.appendChild(backspace);

    const extra = document.createElement("div");
    extra.className = "math-work-keypad-extra";
    extra.setAttribute("aria-label", "追加記号");
    config.extra.forEach((text, keyIndex) => {
      extra.appendChild(createCompactMathKeypadKey(
        question,
        mode,
        text,
        `extra-${keyIndex}`,
        disabled
      ));
    });
    controls.append(core, extra);
    keypad.append(header, display, controls);

    if (mode === "answer") {
      const submit = document.createElement("button");
      submit.type = "button";
      submit.className = "primary-button math-answer-keypad-submit";
      submit.textContent = "判定";
      submit.disabled = disabled || !draft.tokens.length;
      submit.addEventListener("click", () => answerMathKeypadQuestion(question));
      keypad.appendChild(submit);

      if (options.currentAnswer !== undefined) {
        const correct = isStoredAnswerCorrect(question, options.currentAnswer);
        const feedback = document.createElement("p");
        feedback.className = `input-feedback ${correct ? "correct" : "wrong"}`;
        feedback.textContent = correct
          ? "正解です。"
          : `不正解です。正解例: ${mathKeypadAnswerLabel(question)}`;
        keypad.appendChild(feedback);
      }
    }
    return keypad;
  }

  function createCompactMathKeypadKey(question, mode, text, keyId, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "math-work-keypad-key";
    button.textContent = text;
    button.dataset.mathKeypadKey = `${mode}-${keyId}`;
    button.setAttribute("aria-label", text + "を入力");
    button.disabled = disabled;
    button.addEventListener("click", () => addMathAnswerToken(question, mode, text, keyId));
    return button;
  }

  function mathAnswerDraftKey(question, mode) {
    return `${question.id}:${mode}`;
  }

  function getMathAnswerDraft(question, mode) {
    const key = mathAnswerDraftKey(question, mode);
    if (!state.mathAnswerDrafts.has(key)) {
      state.mathAnswerDrafts.set(key, { tokens: [], history: [] });
    }
    return state.mathAnswerDrafts.get(key);
  }

  function rememberMathAnswerDraft(draft) {
    draft.history.push(draft.tokens.slice());
    if (draft.history.length > 80) draft.history.shift();
  }

  function addMathAnswerToken(question, mode, text, keyId) {
    const draft = getMathAnswerDraft(question, mode);
    rememberMathAnswerDraft(draft);
    draft.tokens.push(text);
    renderMathAnswerDraftAndFocus(
      question,
      `.math-work-keypad-key[data-math-keypad-key="${mode}-${keyId}"]`
    );
  }

  function undoMathAnswerDraft(question, mode) {
    const draft = getMathAnswerDraft(question, mode);
    const previous = draft.history.pop();
    if (!previous) return;
    draft.tokens = previous;
    renderMathAnswerDraftAndFocus(question, ".math-answer-keypad-undo");
  }

  function clearMathAnswerDraft(question, mode) {
    const draft = getMathAnswerDraft(question, mode);
    if (!draft.tokens.length) return;
    rememberMathAnswerDraft(draft);
    draft.tokens = [];
    renderMathAnswerDraftAndFocus(question, ".math-answer-keypad-clear");
  }

  function backspaceMathAnswerDraft(question, mode) {
    const draft = getMathAnswerDraft(question, mode);
    if (!draft.tokens.length) return;
    rememberMathAnswerDraft(draft);
    draft.tokens.pop();
    renderMathAnswerDraftAndFocus(question, ".math-answer-keypad-backspace");
  }

  function renderMathAnswerDraftAndFocus(question, selector) {
    renderAnswerArea(question, state.answers.get(question.id));
    fitResponsiveMathLayout(question);
    window.requestAnimationFrame(() => {
      els.choices.querySelector(selector)?.focus({ preventScroll: true });
    });
  }

  function mathKeypadStoredValue(question, currentAnswer) {
    if (currentAnswer === undefined || currentAnswer === null) return "";
    if (typeof currentAnswer === "object") {
      if (typeof currentAnswer.value === "string") return currentAnswer.value;
      if (Number.isInteger(currentAnswer.choiceIndex)) {
        return String(question.choices?.[currentAnswer.choiceIndex] || "");
      }
      return "";
    }
    if (Number.isInteger(currentAnswer)) return String(question.choices?.[currentAnswer] || "");
    return String(currentAnswer || "");
  }

  function mathKeypadAnswerLabel(question) {
    if ((question.type || "choice") === "input") return answerTextLabel(question);
    return String(question.choices?.[question.answer] || "");
  }

  function renderRubricInputAnswer(question, currentAnswer) {
    const answered = currentAnswer !== undefined;
    const draft = getRubricDraftState(question);
    const reviewing = !answered && Boolean(draft?.reviewing);
    const value = answered
      ? String(currentAnswer?.value || "")
      : String(draft?.value || "");
    const rubric = question.responseRubric || {};
    const minimum = Number(rubric.minLength) || 1;
    const maximum = Number(rubric.maxLength) || 200;
    const lengthEvaluation = evaluateRubricLength(question, value);

    const wrapper = document.createElement("section");
    wrapper.className = "input-answer rubric-input-answer";
    wrapper.setAttribute("aria-label", "根拠を使った記述回答");

    const guide = document.createElement("p");
    guide.className = "rubric-input-guide";
    guide.textContent = `本文の言葉を根拠にし、${minimum}〜${maximum}字で一つの文章にまとめます。`;

    const textarea = document.createElement("textarea");
    textarea.className = "answer-input rubric-textarea";
    textarea.rows = 5;
    textarea.maxLength = maximum;
    textarea.placeholder = question.placeholder || "本文の根拠と、自分の説明をつないで書く";
    textarea.value = value;
    textarea.disabled = answered || reviewing;

    const footer = document.createElement("div");
    footer.className = "rubric-input-footer";
    const counter = document.createElement("span");
    counter.className = "rubric-character-count";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-button";
    button.textContent = "観点を開いて自己採点";
    button.disabled = answered || reviewing;

    const refreshCounter = () => {
      const count = countRubricCharacters(textarea.value);
      counter.textContent = `${count} / ${minimum}〜${maximum}字`;
      counter.classList.toggle("ready", count >= minimum && count <= maximum);
      if (!answered && !reviewing) button.disabled = count < minimum || count > maximum;
    };
    refreshCounter();

    const submit = () => beginRubricSelfReview(question, textarea.value);
    button.addEventListener("click", submit);
    textarea.addEventListener("input", () => {
      refreshCounter();
      saveRubricDraftValue(question, textarea.value);
    });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        submit();
      }
    });
    footer.appendChild(counter);
    if (!answered && !reviewing) footer.appendChild(button);

    const feedback = document.createElement("p");
    feedback.className = "input-feedback rubric-input-feedback";
    if (answered) {
      if (currentAnswer.pendingReview) {
        feedback.classList.add("pending");
        feedback.textContent = "提出済み・保護者確認待ちです。本人のチェックだけでは正答率やレベル解放に加えません。";
      } else {
        feedback.classList.add("wrong");
        feedback.textContent = "今回は不足があるとして記録しました。模範例と観点を見直しましょう。";
      }
    } else if (reviewing) {
      feedback.textContent = "登録語の一致では自動採点しません。本人が全観点を確認しても「要確認」として保存し、正答率には入れません。";
    } else {
      feedback.textContent = "選択肢はありません。下書きはこの端末に自動保存されます。先に自分で書き、模範例は提出後に確認します。Ctrl/⌘+Enterでも観点を開けます。";
    }

    wrapper.append(guide, textarea, footer, feedback);
    if (reviewing) wrapper.appendChild(renderRubricSelfReview(question, draft));
    if (answered) wrapper.appendChild(renderRubricResult(question, currentAnswer));
    els.choices.appendChild(wrapper);
    if (!answered && !reviewing) textarea.focus({ preventScroll: true });
  }

  function beginRubricSelfReview(question, rawValue) {
    const value = String(rawValue || "").trim();
    const evaluation = evaluateRubricLength(question, value);
    if (!value || !evaluation.lengthOkay) return;
    state.rubricDraftStates.set(question.id, {
      value,
      reviewing: true,
      checkedLabels: []
    });
    saveRubricDraftValue(question, value);
    renderAnswerArea(question, undefined);
  }

  function rubricDraftStorageKey(question) {
    return childRecordKey(
      state.activeChildId,
      `rubricDraft:${state.packId || "normal"}:${question.id}`
    );
  }

  function getRubricDraftState(question) {
    if (state.rubricDraftStates.has(question.id)) return state.rubricDraftStates.get(question.id);
    let value = "";
    try {
      const stored = JSON.parse(localStorage.getItem(rubricDraftStorageKey(question)) || "null");
      if (stored && typeof stored.value === "string") {
        value = stored.value.slice(0, Number(question.responseRubric?.maxLength) || 200);
      }
    } catch (_error) {
      value = "";
    }
    const draft = { value, reviewing: false, checkedLabels: [] };
    state.rubricDraftStates.set(question.id, draft);
    return draft;
  }

  function saveRubricDraftValue(question, rawValue) {
    const value = String(rawValue || "").slice(0, Number(question.responseRubric?.maxLength) || 200);
    const draft = state.rubricDraftStates.get(question.id) || { reviewing: false, checkedLabels: [] };
    draft.value = value;
    state.rubricDraftStates.set(question.id, draft);
    localStorage.setItem(rubricDraftStorageKey(question), JSON.stringify({ value, savedAt: new Date().toISOString() }));
  }

  function clearRubricDraft(question) {
    state.rubricDraftStates.delete(question.id);
    localStorage.removeItem(rubricDraftStorageKey(question));
  }

  function renderRubricSelfReview(question, draft) {
    const rubric = question.responseRubric || {};
    const groups = Array.isArray(rubric.conceptGroups) ? rubric.conceptGroups : [];
    const checkedLabels = new Set(Array.isArray(draft.checkedLabels) ? draft.checkedLabels : []);

    const section = document.createElement("section");
    section.className = "rubric-result rubric-self-review";
    const title = document.createElement("h3");
    title.textContent = "自分の文章を観点別に照合";
    const instruction = document.createElement("p");
    instruction.className = "rubric-review-instruction";
    instruction.textContent = "下の意味が自分の答えに書けているか確認します。言い換えでも構いません。模範例は提出後に表示します。";
    const list = document.createElement("div");
    list.className = "rubric-check-list";

    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "primary-button rubric-submit-button";
    submit.textContent = `全${groups.length}観点を確認して提出（採点待ち）`;

    const syncSubmit = () => {
      submit.disabled = groups.length === 0 || checkedLabels.size !== groups.length;
      draft.checkedLabels = Array.from(checkedLabels);
      state.rubricDraftStates.set(question.id, draft);
    };

    groups.forEach((group, index) => {
      const label = document.createElement("label");
      label.className = "rubric-check-item";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = checkedLabels.has(group.label);
      checkbox.setAttribute("aria-label", `${group.label}が書けている`);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) checkedLabels.add(group.label);
        else checkedLabels.delete(group.label);
        label.classList.toggle("checked", checkbox.checked);
        syncSubmit();
      });
      const text = document.createElement("span");
      const heading = document.createElement("strong");
      heading.textContent = `${index + 1}. ${group.label}`;
      const description = document.createElement("span");
      description.textContent = group.description || group.label;
      text.append(heading, description);
      label.classList.toggle("checked", checkbox.checked);
      label.append(checkbox, text);
      list.appendChild(label);
    });

    const actions = document.createElement("div");
    actions.className = "rubric-review-actions";
    const incomplete = document.createElement("button");
    incomplete.type = "button";
    incomplete.className = "ghost-button";
    incomplete.textContent = "今回は不足として記録";
    incomplete.addEventListener("click", () => {
      answerRubricInputQuestion(question, draft.value, false, Array.from(checkedLabels));
    });
    submit.addEventListener("click", () => {
      answerRubricInputQuestion(question, draft.value, true, Array.from(checkedLabels));
    });
    syncSubmit();
    actions.append(incomplete, submit);
    section.append(title, instruction, list, actions);
    return section;
  }

  function renderRubricResult(question, currentAnswer) {
    const section = document.createElement("section");
    section.className = "rubric-result";
    const title = document.createElement("h3");
    title.textContent = "記述の要点チェック";
    const list = document.createElement("ul");
    const checkedLabels = new Set(Array.isArray(currentAnswer?.rubricChecks) ? currentAnswer.rubricChecks : []);
    (question.responseRubric?.conceptGroups || []).forEach((group) => {
      const matched = checkedLabels.has(group.label);
      const item = document.createElement("li");
      item.className = matched ? "matched" : "missing";
      item.textContent = `${matched ? "✓" : "△"} ${group.label}: ${group.description || group.label}`;
      list.appendChild(item);
    });
    const model = document.createElement("p");
    model.className = "rubric-model-answer";
    model.textContent = `模範例: ${question.responseRubric?.modelAnswer || answerTextLabel(question)}`;
    section.append(title, list, model);
    return section;
  }

  function countRubricCharacters(value) {
    return Array.from(String(value || "").replace(/[\s　]/g, "")).length;
  }

  function evaluateRubricLength(question, value) {
    const rubric = question.responseRubric || {};
    const characterCount = countRubricCharacters(value);
    const minimum = Number(rubric.minLength) || 1;
    const maximum = Number(rubric.maxLength) || Infinity;
    const lengthOkay = characterCount >= minimum && characterCount <= maximum;
    return {
      lengthOkay,
      characterCount
    };
  }

  function renderDragWorkAnswer(question, currentAnswer) {
    const answered = currentAnswer !== undefined;
    const draft = getDragWorkDraft(question, currentAnswer);
    const rowTexts = draft.rows.map(mathWorkRowText);
    const rowCorrectness = question.workSteps.map((_step, index) => {
      return isMathWorkRowCorrect(question, index, rowTexts[index]);
    });
    const correct = answered && rowCorrectness.every(Boolean) && isStoredAnswerCorrect(question, currentAnswer);

    const wrapper = document.createElement("section");
    wrapper.className = "math-work-builder";
    wrapper.setAttribute("aria-label", "途中式を段階ごとに作る");

    const intro = document.createElement("p");
    intro.className = "math-work-intro";
    intro.textContent = "テンキーで各段階の式を作ります。詰まったときだけ4択ヒントを使えます。";
    wrapper.appendChild(intro);

    const rows = document.createElement("div");
    rows.className = "math-work-rows";
    question.workSteps.forEach((step, rowIndex) => {
      const row = document.createElement("section");
      row.className = "math-work-row";
      if (!answered && draft.activeRow === rowIndex) row.classList.add("active");
      if (answered) row.classList.add(rowCorrectness[rowIndex] ? "correct" : "wrong");
      const rowFeedback = draft.rowFeedback?.[rowIndex];
      if (!answered && rowFeedback) {
        row.classList.add(rowFeedback.correct ? "ready" : "needs-retry");
      }

      const select = document.createElement("button");
      select.type = "button";
      select.className = "math-work-row-select";
      select.dataset.rowIndex = String(rowIndex);
      select.textContent = step.label;
      select.disabled = answered;
      select.setAttribute("aria-pressed", String(!answered && draft.activeRow === rowIndex));
      select.addEventListener("click", () => setActiveMathWorkRow(question, rowIndex));

      const line = document.createElement("div");
      line.className = "math-work-line";
      line.dataset.rowIndex = String(rowIndex);
      line.setAttribute("role", "group");
      line.setAttribute("aria-label", step.label + " の式");
      line.addEventListener("click", (event) => {
        if (!answered && event.target === line) setActiveMathWorkRow(question, rowIndex);
      });
      draft.rows[rowIndex].forEach((token, tokenIndex) => {
        line.appendChild(createMathWorkPlacedToken(question, token, rowIndex, tokenIndex, answered));
      });
      if (!draft.rows[rowIndex].length) {
        const empty = document.createElement("span");
        empty.className = "math-work-empty";
        empty.textContent = answered ? "未入力" : "テンキーで途中式を入力";
        line.appendChild(empty);
      }

      row.append(select, line);
      if (!answered && rowFeedback) {
        const attemptFeedback = document.createElement("p");
        attemptFeedback.className = "math-work-step-feedback " + (rowFeedback.correct ? "correct" : "wrong");
        attemptFeedback.textContent = rowFeedback.message;
        attemptFeedback.setAttribute("aria-live", "polite");
        row.appendChild(attemptFeedback);
      }
      if (!answered && draft.activeRow === rowIndex) {
        row.appendChild(renderMathWorkKeypad(question, draft, step, rowIndex));
      }
      if (answered && !rowCorrectness[rowIndex]) {
        const expected = document.createElement("p");
        expected.className = "math-work-expected";
        expected.textContent = "正しい形: " + step.answers[0];
        row.appendChild(expected);
      }
      rows.appendChild(row);
    });
    wrapper.appendChild(rows);

    if (!answered) {
      const actions = document.createElement("div");
      actions.className = "math-work-actions math-work-submit-row";
      const submit = document.createElement("button");
      submit.type = "button";
      submit.className = "primary-button";
      submit.textContent = "途中式を判定";
      submit.disabled = !isMathWorkComplete(draft);
      submit.addEventListener("click", () => answerDragWorkQuestion(question));
      actions.appendChild(submit);
      wrapper.appendChild(actions);
    }

    const feedback = document.createElement("p");
    feedback.className = "input-feedback math-work-feedback";
    if (answered) {
      feedback.classList.add(correct ? "correct" : "wrong");
      feedback.textContent = correct
        ? (currentAnswer?.assisted
          ? "正解です。ヒントを使ったので、この問題は復習に残します。"
          : "正解です。途中式から答えまで順番に作れています。")
        : "途中式に誤りがあります。赤い行と解説を見直しましょう。";
    } else {
      feedback.textContent = "自力で作った式を各行で確認してから、最後に全体を判定します。";
    }
    wrapper.appendChild(feedback);
    els.choices.appendChild(wrapper);
  }

  function renderMathWorkKeypad(question, draft, step, rowIndex) {
    const keypad = document.createElement("section");
    keypad.className = "math-work-keypad";
    keypad.setAttribute("aria-label", step.label + " の数式テンキー");

    const header = document.createElement("div");
    header.className = "math-work-keypad-header";
    const heading = document.createElement("p");
    heading.className = "math-work-keypad-heading";
    heading.textContent = "式を入力";
    const editActions = document.createElement("div");
    editActions.className = "math-work-keypad-edit-actions";
    const undo = document.createElement("button");
    undo.type = "button";
    undo.className = "math-work-keypad-edit";
    undo.textContent = "↶";
    undo.title = "1つ前の操作に戻す";
    undo.setAttribute("aria-label", undo.title);
    undo.disabled = !draft.history.length;
    undo.addEventListener("click", () => undoMathWorkChange(question));
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "math-work-keypad-edit";
    clear.textContent = "AC";
    clear.title = "この行を全消去";
    clear.setAttribute("aria-label", clear.title);
    clear.disabled = !draft.rows[rowIndex]?.length;
    clear.addEventListener("click", () => clearMathWorkRowImmediately(question, rowIndex));
    editActions.append(undo, clear);
    header.append(heading, editActions);

    const config = mathWorkKeypadConfig(question, rowIndex);
    const core = document.createElement("div");
    core.className = "math-work-keypad-core";
    config.core.forEach((text, keyIndex) => {
      if (text) {
        core.appendChild(createMathWorkKeypadKey(question, draft, text, rowIndex, "core-" + keyIndex));
      } else {
        const placeholder = document.createElement("span");
        placeholder.className = "math-work-keypad-placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        core.appendChild(placeholder);
      }
    });
    const backspace = document.createElement("button");
    backspace.type = "button";
    backspace.className = "math-work-keypad-key math-work-keypad-backspace";
    backspace.textContent = "⌫";
    backspace.title = "1つ削除";
    backspace.setAttribute("aria-label", backspace.title);
    backspace.disabled = !draft.rows[rowIndex]?.length;
    backspace.addEventListener("click", () => backspaceMathWorkToken(question, rowIndex));
    core.appendChild(backspace);

    keypad.append(header, core);

    if (config.extra.length) {
      const extra = document.createElement("div");
      extra.className = "math-work-keypad-extra";
      extra.setAttribute("aria-label", "この問題で使う追加記号");
      config.extra.forEach((text, keyIndex) => {
        extra.appendChild(createMathWorkKeypadKey(question, draft, text, rowIndex, "extra-" + keyIndex));
      });
      keypad.appendChild(extra);
    }

    const check = document.createElement("button");
    check.type = "button";
    check.className = "primary-button math-work-row-check";
    check.textContent = "この式を確認";
    check.disabled = !draft.rows[rowIndex]?.length;
    check.addEventListener("click", () => checkMathWorkRow(question, rowIndex));
    keypad.appendChild(check);

    const hintDetails = document.createElement("details");
    hintDetails.className = "math-work-choice-hint";
    hintDetails.open = Boolean(draft.hintOpenRows?.[rowIndex]);
    hintDetails.addEventListener("toggle", () => {
      draft.hintOpenRows[rowIndex] = hintDetails.open;
      if (hintDetails.open) draft.usedChoiceHint = true;
    });
    const hintSummary = document.createElement("summary");
    hintSummary.textContent = "4択ヒントを見る";
    hintDetails.append(hintSummary, renderMathWorkStepChoices(question, draft, step, rowIndex));
    keypad.appendChild(hintDetails);
    return keypad;
  }

  function mathWorkKeypadConfig(question, rowIndex) {
    const step = question.workSteps[rowIndex] || {};
    const source = (Array.isArray(step.answers) ? step.answers : []).join(" ");
    return mathKeypadUtils?.configForSource(source) || {
      core: ["7", "8", "9", "+", "4", "5", "6", "−", "1", "2", "3", "x", "0", "x²", "x³"],
      extra: ["±"]
    };
  }

  function createMathWorkKeypadKey(question, draft, text, rowIndex, keyId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "math-work-keypad-key";
    button.textContent = text;
    button.dataset.keypadKey = keyId;
    button.setAttribute("aria-label", text + "を入力");
    button.addEventListener("click", () => {
      addMathWorkToken(
        question,
        text,
        rowIndex,
        undefined,
        '.math-work-keypad-key[data-keypad-key="' + keyId + '"]'
      );
    });
    return button;
  }

  function backspaceMathWorkToken(question, rowIndex) {
    const draft = getDragWorkDraft(question);
    const row = draft.rows[rowIndex];
    if (!row?.length) return;
    const selected = findMathWorkToken(draft, draft.selectedTokenId);
    const tokenIndex = selected?.rowIndex === rowIndex ? selected.tokenIndex : row.length - 1;
    rememberMathWorkDraft(draft);
    row.splice(tokenIndex, 1);
    draft.activeRow = rowIndex;
    resetMathWorkRowFeedback(draft, rowIndex);
    draft.selectedTokenId = null;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, ".math-work-keypad-backspace");
  }

  function clearMathWorkRowImmediately(question, rowIndex) {
    const draft = getDragWorkDraft(question);
    if (!draft.rows[rowIndex]?.length) return;
    rememberMathWorkDraft(draft);
    draft.rows[rowIndex] = [];
    draft.activeRow = rowIndex;
    resetMathWorkRowFeedback(draft, rowIndex);
    draft.selectedTokenId = null;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, '.math-work-keypad-edit[aria-label="この行を全消去"]');
  }

  function checkMathWorkRow(question, rowIndex) {
    const draft = getDragWorkDraft(question);
    const value = mathWorkRowText(draft.rows[rowIndex]);
    if (!value) return;
    const correct = isMathWorkRowCorrect(question, rowIndex, value);
    const isLastRow = rowIndex >= question.workSteps.length - 1;
    if (!correct) draft.hadMistake = true;
    const mistakeFeedback = correct ? "" : mathWorkWrongFeedback(question.workSteps[rowIndex], value);
    draft.rowFeedback[rowIndex] = {
      correct,
      message: correct
        ? (isLastRow
          ? "ここまで正しいです。下の「途中式を判定」で全体を確認します。"
          : "ここまで正しいです。次の段階へ進みます。")
        : "まだ違います。" + (mistakeFeedback
          || mathWorkUtils?.workStepHint(question.workSteps[rowIndex])
          || "符号と係数を順に確認しましょう。")
    };
    draft.activeRow = correct && !isLastRow ? rowIndex + 1 : rowIndex;
    const selector = correct && !isLastRow
      ? '.math-work-keypad-key[data-keypad-key="core-0"]'
      : ".math-work-row-check";
    renderMathWorkAndFocus(question, selector);
  }

  function mathWorkWrongFeedback(step, value) {
    if (!step || !Array.isArray(step.choices)) return "";
    const normalizedValue = normalizeMathWorkFeedbackText(value);
    const canonicalValue = mathWorkFeedbackCanonicalKey(value);
    const match = step.choices.find((choice) => {
      if (!choice || typeof choice !== "object" || !choice.feedback) return false;
      const choiceText = String(choice.text || "");
      if (normalizeMathWorkFeedbackText(choiceText) === normalizedValue) return true;
      return canonicalValue && mathWorkFeedbackCanonicalKey(choiceText) === canonicalValue;
    });
    return match?.feedback || "";
  }

  function mathWorkFeedbackCanonicalKey(value) {
    const canonical = mathWorkUtils?.canonicalWork(value);
    return Array.isArray(canonical) && canonical.length ? JSON.stringify(canonical) : "";
  }

  function normalizeMathWorkFeedbackText(value) {
    return String(value || "")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .normalize("NFKC")
      .replace(/[−‐‑‒–—―-]/g, "-")
      .replace(/[＊*]/g, "×")
      .replace(/[／/]/g, "÷")
      .replace(/[、，]/g, ",")
      .replace(/[\s　]/g, "")
      .toLowerCase();
  }

  function renderMathWorkStepChoices(question, draft, step, rowIndex) {
    const section = document.createElement("section");
    section.className = "math-work-step-choices";
    section.setAttribute("aria-label", step.label + " の途中式候補");

    const heading = document.createElement("p");
    heading.className = "math-work-step-choice-heading";
    heading.textContent = "この段階の式を選ぶ";
    const hint = document.createElement("p");
    hint.className = "math-work-step-hint";
    hint.textContent = "考え方: " + (mathWorkUtils?.workStepHint(step) || "直前の式から変わる部分を確認します。");
    const choices = document.createElement("div");
    choices.className = "math-work-step-choice-list";
    const currentText = mathWorkRowText(draft.rows[rowIndex]);
    const rowFeedback = draft.rowFeedback?.[rowIndex];
    const workChoices = mathWorkUtils?.buildWorkStepChoices(
      step,
      question.prompt,
      question.id + ":guided:" + rowIndex
    ) || [];

    workChoices.forEach((choice, choiceIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "math-work-step-choice";
      button.dataset.choiceIndex = String(choiceIndex);
      button.dataset.choiceLabel = ["ア", "イ", "ウ", "エ"][choiceIndex] || String(choiceIndex + 1);
      button.setAttribute("aria-label", button.dataset.choiceLabel + " " + choice.text);
      const choiceText = document.createElement("span");
      choiceText.className = "math-work-step-choice-text";
      choiceText.textContent = choice.text;
      button.appendChild(choiceText);
      const selected = normalizeQuestionAnswer(question, currentText)
        === normalizeQuestionAnswer(question, choice.text);
      button.setAttribute("aria-pressed", String(selected));
      if (selected) {
        button.classList.add("selected");
        if (rowFeedback) button.classList.add(rowFeedback.correct ? "correct" : "wrong");
      }
      button.addEventListener("click", () => chooseMathWorkStepChoice(question, rowIndex, choice));
      choices.appendChild(button);
    });

    section.append(heading, hint, choices);
    return section;
  }

  function chooseMathWorkStepChoice(question, rowIndex, choice) {
    const draft = getDragWorkDraft(question);
    rememberMathWorkDraft(draft);
    draft.usedChoiceHint = true;
    draft.hintOpenRows[rowIndex] = true;
    const token = createMathWorkTokenInstance(question, draft, choice.text);
    token.fromChoice = true;
    draft.rows[rowIndex] = [token];
    draft.selectedTokenId = null;
    draft.clearArmedRow = null;
    const correct = isMathWorkRowCorrect(question, rowIndex, choice.text);
    if (!correct) draft.hadMistake = true;
    const isLastRow = rowIndex >= question.workSteps.length - 1;
    draft.rowFeedback[rowIndex] = {
      correct,
      message: correct
        ? (isLastRow
          ? "ここまで正しいです。下の「途中式を判定」で全体を確認します。"
          : "ここまで正しいです。次の段階へ進みます。")
        : (choice.feedback || "符号・係数・演算の順に見直して、別の式を選びましょう。")
    };
    draft.activeRow = correct && !isLastRow ? rowIndex + 1 : rowIndex;
    const selector = correct && !isLastRow
      ? '.math-work-row-select[data-row-index="' + (rowIndex + 1) + '"]'
      : ".math-work-step-choice.selected";
    renderMathWorkAndFocus(question, selector);
  }

  function renderMathWorkSelectionControls(question, draft) {
    const location = findMathWorkToken(draft, draft.selectedTokenId);
    const controls = document.createElement("section");
    controls.className = "math-work-selection";
    controls.setAttribute("aria-label", "選択したタイルの操作");

    const status = document.createElement("p");
    status.className = "math-work-selection-status";
    status.textContent = location
      ? `「${location.token.text}」を選択中`
      : "置いたタイルをタップすると、ここで安全に移動・削除できます。";

    const actions = document.createElement("div");
    actions.className = "math-work-selection-actions";
    [
      { direction: "left", label: "左へ", text: "←", disabled: !location || location.tokenIndex === 0 },
      { direction: "right", label: "右へ", text: "→", disabled: !location || location.tokenIndex >= draft.rows[location.rowIndex].length - 1 },
      { direction: "up", label: "上の行へ", text: "↑", disabled: !location || location.rowIndex === 0 },
      { direction: "down", label: "下の行へ", text: "↓", disabled: !location || location.rowIndex >= draft.rows.length - 1 }
    ].forEach((control) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost-button math-work-move-button";
      button.textContent = control.text;
      button.setAttribute("aria-label", control.label);
      button.title = control.label;
      button.disabled = control.disabled;
      button.addEventListener("click", () => moveSelectedMathWorkToken(question, control.direction));
      actions.appendChild(button);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost-button danger math-work-delete-button";
    remove.textContent = "削除";
    remove.disabled = !location;
    remove.addEventListener("click", () => deleteSelectedMathWorkToken(question));
    actions.appendChild(remove);

    controls.append(status, actions);
    return controls;
  }

  function renderMathWorkChunkComposer(question, draft) {
    const section = document.createElement("section");
    section.className = "math-work-composer";
    section.setAttribute("aria-label", "自分で計算したまとまりタイルを作る");

    const label = document.createElement("label");
    label.className = "math-work-composer-label";
    label.textContent = "自分で計算した項・式を1タイルにする";
    const help = document.createElement("p");
    help.className = "math-work-composer-help";
    help.textContent = "正答候補は表示しません。自分で求めたまとまりを入力し、追加後はほかのタイルと同じように移動できます。";
    const row = document.createElement("div");
    row.className = "math-work-composer-row";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "math-work-composer-input";
    input.id = `${question.id}-math-chunk-${draft.activeRow}`;
    label.htmlFor = input.id;
    input.inputMode = "text";
    input.maxLength = 28;
    input.autocomplete = "off";
    input.autocapitalize = "off";
    input.spellcheck = false;
    input.placeholder = "計算した項や式のまとまり";
    const add = document.createElement("button");
    add.type = "button";
    add.className = "ghost-button math-work-composer-add";
    add.textContent = "タイル追加";
    const error = document.createElement("p");
    error.className = "math-work-composer-error";
    error.setAttribute("aria-live", "polite");

    const submitChunk = () => {
      const chunk = normalizeMathWorkCustomChunk(input.value);
      if (!chunk) {
        error.textContent = "数字・文字・根号のまとまりを28文字以内で入力してください。等号とカンマは別タイルを使います。";
        return;
      }
      addMathWorkToken(question, chunk, draft.activeRow);
    };
    add.addEventListener("click", submitChunk);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitChunk();
      }
    });
    row.append(input, add);

    const shortcuts = document.createElement("div");
    shortcuts.className = "math-work-composer-shortcuts";
    ["²", "³", "√", "−", "(", ")"].forEach((symbol) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "math-work-composer-shortcut";
      button.textContent = symbol;
      button.setAttribute("aria-label", `${symbol}をまとまり入力へ追加`);
      button.addEventListener("click", () => {
        const start = Number.isInteger(input.selectionStart) ? input.selectionStart : input.value.length;
        const end = Number.isInteger(input.selectionEnd) ? input.selectionEnd : start;
        input.value = input.value.slice(0, start) + symbol + input.value.slice(end);
        input.focus({ preventScroll: true });
        const next = start + symbol.length;
        input.setSelectionRange(next, next);
      });
      shortcuts.appendChild(button);
    });

    section.append(label, help, row, shortcuts, error);
    return section;
  }

  function normalizeMathWorkCustomChunk(rawValue) {
    const value = String(rawValue || "")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .normalize("NFKC")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/[−‐‑‒–—―-]/g, "−")
      .replace(/[＊*]/g, "×")
      .replace(/[／/]/g, "÷")
      .replace(/[\s　]/g, "");
    if (!value || Array.from(value).length > 28 || /[=,、，]/.test(value)) return "";
    if (!/^[0-9xyabnpq+−×÷√()²³]+$/.test(value)) return "";
    if (!/[0-9xyabnpq√]/.test(value)) return "";
    const tokens = mathWorkUtils?.tokenize(value);
    return Array.isArray(tokens) && tokens.length ? value : "";
  }

  function createMathWorkPaletteToken(question, draft, text, paletteKey) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = text.length > 1 ? "math-palette-token grouped" : "math-palette-token";
    button.textContent = text;
    button.dataset.paletteKey = paletteKey;
    button.setAttribute("aria-label", text + "を選択中の行へ追加");
    button.addEventListener("click", () => {
      if (button.dataset.dragged === "true") {
        button.dataset.dragged = "";
        return;
      }
      addMathWorkToken(
        question,
        text,
        draft.activeRow,
        undefined,
        '.math-palette-token[data-palette-key="' + paletteKey + '"]'
      );
    });
    button.addEventListener("pointerdown", (event) => {
      startMathWorkPointerDrag(event, question, { type: "palette", text });
    });
    return button;
  }

  function mathWorkReusableChunks(draft, activeRow) {
    const chunks = new Set();
    draft.rows.slice(0, activeRow).forEach((row) => {
      const rowText = mathWorkRowText(row);
      if (!rowText) return;
      chunks.add(rowText);
      rowText.split(",").forEach((segment) => {
        if (segment.length > 1) chunks.add(segment);
        segment.split("=").forEach((side) => {
          if (side.length > 1) chunks.add(side);
        });
      });
    });
    return Array.from(chunks).slice(0, 12);
  }

  function getDragWorkDraft(question, currentAnswer) {
    if (!state.inputDragStates.has(question.id)) {
      const draft = {
        rows: question.workSteps.map(() => []),
        activeRow: 0,
        nextTokenId: 1,
        hintOpenRows: question.workSteps.map(() => false),
        usedChoiceHint: false,
        hadMistake: false,
        selectedTokenId: null,
        history: [],
        clearArmedRow: null,
        rowFeedback: question.workSteps.map(() => null)
      };
      if (Array.isArray(currentAnswer?.workRows)) {
        currentAnswer.workRows.slice(0, draft.rows.length).forEach((text, rowIndex) => {
          const restoredTokens = mathWorkUtils?.chunkExpression(text)
            || Array.from(String(text || "").replace(/[−‐‑‒–—―-]/g, "−").replace(/\s+/g, ""));
          restoredTokens
            .forEach((tokenText) => {
              draft.rows[rowIndex].push(createMathWorkTokenInstance(question, draft, tokenText));
            });
        });
      }
      state.inputDragStates.set(question.id, draft);
    }
    return state.inputDragStates.get(question.id);
  }

  function createMathWorkTokenInstance(question, draft, text) {
    const token = {
      id: question.id + "-work-" + draft.nextTokenId,
      text
    };
    draft.nextTokenId += 1;
    return token;
  }

  function rememberMathWorkDraft(draft) {
    draft.history.push({
      rows: draft.rows.map((row) => row.map((token) => ({ ...token }))),
      activeRow: draft.activeRow,
      selectedTokenId: draft.selectedTokenId,
      rowFeedback: draft.rowFeedback.map((feedback) => feedback ? { ...feedback } : null)
    });
    if (draft.history.length > 80) draft.history.shift();
  }

  function findMathWorkToken(draft, tokenId) {
    if (!tokenId) return null;
    for (let rowIndex = 0; rowIndex < draft.rows.length; rowIndex += 1) {
      const tokenIndex = draft.rows[rowIndex].findIndex((token) => token.id === tokenId);
      if (tokenIndex >= 0) {
        return { rowIndex, tokenIndex, token: draft.rows[rowIndex][tokenIndex] };
      }
    }
    return null;
  }

  function resetMathWorkRowFeedback(draft, ...rowIndexes) {
    rowIndexes.forEach((rowIndex) => {
      if (Number.isInteger(rowIndex) && draft.rowFeedback[rowIndex]) {
        draft.rowFeedback[rowIndex] = null;
      }
    });
  }

  function selectMathWorkToken(question, rowIndex, tokenId) {
    const draft = getDragWorkDraft(question);
    draft.activeRow = rowIndex;
    draft.selectedTokenId = tokenId;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, '[data-token-id="' + tokenId + '"]');
  }

  function moveSelectedMathWorkToken(question, direction) {
    const draft = getDragWorkDraft(question);
    const location = findMathWorkToken(draft, draft.selectedTokenId);
    if (!location) return;
    const { rowIndex, tokenIndex, token } = location;
    if (direction === "left" || direction === "right") {
      const offset = direction === "left" ? -1 : 1;
      const targetIndex = tokenIndex + offset;
      if (targetIndex < 0 || targetIndex >= draft.rows[rowIndex].length) return;
      rememberMathWorkDraft(draft);
      [draft.rows[rowIndex][tokenIndex], draft.rows[rowIndex][targetIndex]] = [
        draft.rows[rowIndex][targetIndex],
        draft.rows[rowIndex][tokenIndex]
      ];
      draft.activeRow = rowIndex;
      resetMathWorkRowFeedback(draft, rowIndex);
    } else {
      const targetRowIndex = rowIndex + (direction === "up" ? -1 : 1);
      if (targetRowIndex < 0 || targetRowIndex >= draft.rows.length) return;
      rememberMathWorkDraft(draft);
      draft.rows[rowIndex].splice(tokenIndex, 1);
      draft.rows[targetRowIndex].push(token);
      draft.activeRow = targetRowIndex;
      resetMathWorkRowFeedback(draft, rowIndex, targetRowIndex);
    }
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, '[data-token-id="' + token.id + '"]');
  }

  function deleteSelectedMathWorkToken(question) {
    const draft = getDragWorkDraft(question);
    const location = findMathWorkToken(draft, draft.selectedTokenId);
    if (!location) return;
    removeMathWorkToken(question, location.rowIndex, location.tokenIndex);
  }

  function createMathWorkPlacedToken(question, token, rowIndex, tokenIndex, answered) {
    const draft = getDragWorkDraft(question);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "math-work-token";
    if (token.fromChoice) {
      button.classList.add("grouped", "from-choice");
    }
    button.dataset.tokenId = token.id;
    if (token.fromChoice) {
      const tokenText = document.createElement("span");
      tokenText.className = "math-work-token-text";
      tokenText.textContent = token.text;
      button.appendChild(tokenText);
    } else {
      button.textContent = token.text;
    }
    button.disabled = answered;
    const selected = !answered && draft.selectedTokenId === token.id;
    if (selected) button.classList.add("selected");
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", token.text + (selected ? "。選択中" : "。タップで選択、横方向のドラッグで移動"));
    button.addEventListener("click", () => {
      if (button.dataset.dragged === "true") {
        button.dataset.dragged = "";
        return;
      }
      selectMathWorkToken(question, rowIndex, token.id);
    });
    button.addEventListener("keydown", (event) => {
      handleMathWorkTokenKeydown(event, question, rowIndex, tokenIndex, token.id);
    });
    button.addEventListener("pointerdown", (event) => {
      startMathWorkPointerDrag(event, question, {
        type: "placed",
        rowIndex,
        tokenId: token.id
      });
    });
    return button;
  }

  function setActiveMathWorkRow(question, rowIndex) {
    const draft = getDragWorkDraft(question);
    draft.activeRow = rowIndex;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, '.math-work-row-select[data-row-index="' + rowIndex + '"]');
  }

  function addMathWorkToken(question, text, rowIndex, insertIndex, focusSelector) {
    const draft = getDragWorkDraft(question);
    rememberMathWorkDraft(draft);
    const targetRow = draft.rows[rowIndex];
    if (targetRow.length === 1 && targetRow[0].fromChoice) targetRow.length = 0;
    const index = Number.isInteger(insertIndex)
      ? Math.max(0, Math.min(insertIndex, targetRow.length))
      : targetRow.length;
    const token = createMathWorkTokenInstance(question, draft, text);
    targetRow.splice(index, 0, token);
    draft.activeRow = rowIndex;
    resetMathWorkRowFeedback(draft, rowIndex);
    draft.selectedTokenId = token.id;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, focusSelector || '[data-token-id="' + token.id + '"]');
  }

  function removeMathWorkToken(question, rowIndex, tokenIndex) {
    const draft = getDragWorkDraft(question);
    rememberMathWorkDraft(draft);
    draft.rows[rowIndex].splice(tokenIndex, 1);
    draft.activeRow = rowIndex;
    resetMathWorkRowFeedback(draft, rowIndex);
    draft.selectedTokenId = null;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, '.math-work-row-select[data-row-index="' + rowIndex + '"]');
  }

  function undoMathWorkChange(question) {
    const draft = getDragWorkDraft(question);
    const previous = draft.history.pop();
    if (!previous) return;
    draft.rows = previous.rows.map((row) => row.map((token) => ({ ...token })));
    draft.activeRow = previous.activeRow;
    draft.selectedTokenId = previous.selectedTokenId;
    draft.rowFeedback = (previous.rowFeedback || draft.rows.map(() => null))
      .map((feedback) => feedback ? { ...feedback } : null);
    draft.clearArmedRow = null;
    const selector = draft.selectedTokenId
      ? '[data-token-id="' + draft.selectedTokenId + '"]'
      : '.math-work-row-select[data-row-index="' + draft.activeRow + '"]';
    renderMathWorkAndFocus(question, selector);
  }

  function clearMathWorkRow(question) {
    const draft = getDragWorkDraft(question);
    if (draft.clearArmedRow !== draft.activeRow) {
      draft.clearArmedRow = draft.activeRow;
      renderMathWorkAndFocus(question, '.math-work-actions .ghost-button:nth-child(2)');
      return;
    }
    rememberMathWorkDraft(draft);
    draft.rows[draft.activeRow] = [];
    resetMathWorkRowFeedback(draft, draft.activeRow);
    draft.selectedTokenId = null;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, '.math-work-row-select[data-row-index="' + draft.activeRow + '"]');
  }

  function renderMathWorkAndFocus(question, selector) {
    renderAnswerArea(question, undefined);
    window.ResponsiveMathLayout?.fitGuidedChoices(els.choices);
    if (!selector) return;
    window.requestAnimationFrame(() => {
      const target = els.choices.querySelector(selector);
      if (target && typeof target.focus === "function") target.focus({ preventScroll: true });
    });
  }

  function handleMathWorkTokenKeydown(event, question, rowIndex, tokenIndex, tokenId) {
    const draft = getDragWorkDraft(question);
    const row = draft.rows[rowIndex];
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeMathWorkToken(question, rowIndex, tokenIndex);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const offset = event.key === "ArrowLeft" ? -1 : 1;
      const nextIndex = Math.max(0, Math.min(row.length - 1, tokenIndex + offset));
      if (nextIndex !== tokenIndex) {
        rememberMathWorkDraft(draft);
        [row[tokenIndex], row[nextIndex]] = [row[nextIndex], row[tokenIndex]];
        resetMathWorkRowFeedback(draft, rowIndex);
      }
      draft.selectedTokenId = tokenId;
      draft.clearArmedRow = null;
      renderMathWorkAndFocus(question, '[data-token-id="' + tokenId + '"]');
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const targetRowIndex = rowIndex + (event.key === "ArrowUp" ? -1 : 1);
      if (targetRowIndex < 0 || targetRowIndex >= draft.rows.length) return;
      rememberMathWorkDraft(draft);
      const [token] = row.splice(tokenIndex, 1);
      draft.rows[targetRowIndex].push(token);
      draft.activeRow = targetRowIndex;
      resetMathWorkRowFeedback(draft, rowIndex, targetRowIndex);
      draft.selectedTokenId = tokenId;
      draft.clearArmedRow = null;
      renderMathWorkAndFocus(question, '[data-token-id="' + tokenId + '"]');
    }
  }

  function startMathWorkPointerDrag(event, question, sourceInfo) {
    if (event.button !== undefined && event.button !== 0) return;
    const sourceElement = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const isTouch = event.pointerType === "touch";
    let dragging = false;
    let ghost = null;

    const startDragging = () => {
      if (dragging) return;
      dragging = true;
      sourceElement.dataset.dragged = "true";
      ghost = sourceElement.cloneNode(true);
      ghost.classList.add("math-work-drag-ghost");
      ghost.style.left = startX + "px";
      ghost.style.top = startY + "px";
      document.body.appendChild(ghost);
    };
    const move = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const distance = Math.hypot(deltaX, deltaY);
      const deliberateDrag = isTouch
        ? Math.abs(deltaX) >= 10 && Math.abs(deltaX) > Math.abs(deltaY)
        : distance >= 8;
      if (!dragging && deliberateDrag) startDragging();
      if (!dragging) return;
      moveEvent.preventDefault();
      ghost.style.left = moveEvent.clientX + "px";
      ghost.style.top = moveEvent.clientY + "px";
    };
    const cleanup = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", cancel);
      if (ghost) ghost.remove();
      if (dragging) {
        window.setTimeout(() => {
          if (sourceElement.isConnected) sourceElement.dataset.dragged = "";
        }, 0);
      }
    };
    const end = (endEvent) => {
      if (!dragging) {
        cleanup();
        return;
      }
      endEvent.preventDefault();
      const hit = document.elementFromPoint(endEvent.clientX, endEvent.clientY);
      const line = hit?.closest(".math-work-line");
      const placed = hit?.closest(".math-work-token");
      cleanup();
      if (!line) return;
      const targetRowIndex = Number(line.dataset.rowIndex);
      let insertIndex = getDragWorkDraft(question).rows[targetRowIndex].length;
      if (placed?.dataset.tokenId) {
        const row = getDragWorkDraft(question).rows[targetRowIndex];
        const hitIndex = row.findIndex((token) => token.id === placed.dataset.tokenId);
        if (hitIndex >= 0) {
          const rectangle = placed.getBoundingClientRect();
          insertIndex = hitIndex + (endEvent.clientX > rectangle.left + rectangle.width / 2 ? 1 : 0);
        }
      }
      dropMathWorkToken(question, sourceInfo, targetRowIndex, insertIndex);
    };
    const cancel = () => cleanup();
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", end, { once: true });
    document.addEventListener("pointercancel", cancel, { once: true });
  }

  function dropMathWorkToken(question, sourceInfo, targetRowIndex, insertIndex) {
    const draft = getDragWorkDraft(question);
    rememberMathWorkDraft(draft);
    let token = null;
    if (sourceInfo.type === "palette") {
      token = createMathWorkTokenInstance(question, draft, sourceInfo.text);
    } else {
      const sourceRow = draft.rows[sourceInfo.rowIndex];
      const sourceIndex = sourceRow.findIndex((item) => item.id === sourceInfo.tokenId);
      if (sourceIndex < 0) {
        draft.history.pop();
        return;
      }
      [token] = sourceRow.splice(sourceIndex, 1);
      if (sourceInfo.rowIndex === targetRowIndex && sourceIndex < insertIndex) insertIndex -= 1;
    }
    const targetRow = draft.rows[targetRowIndex];
    const safeIndex = Math.max(0, Math.min(insertIndex, targetRow.length));
    targetRow.splice(safeIndex, 0, token);
    draft.activeRow = targetRowIndex;
    resetMathWorkRowFeedback(draft, sourceInfo.rowIndex, targetRowIndex);
    draft.selectedTokenId = token.id;
    draft.clearArmedRow = null;
    renderMathWorkAndFocus(question, '[data-token-id="' + token.id + '"]');
  }

  function mathWorkRowText(row) {
    return row.map((token) => token.text).join("");
  }

  function isMathWorkRowCorrect(question, rowIndex, value) {
    const step = question.workSteps[rowIndex];
    if (!step || !Array.isArray(step.answers)) return false;
    if (isSkippedMathWorkStep(question, rowIndex, value)) return false;
    if (!mathWorkUtils) {
      const normalized = normalizeQuestionAnswer(question, value);
      return step.answers.some((answer) => normalizeQuestionAnswer(question, answer) === normalized);
    }
    return step.answers.some((answer) => mathWorkUtils.workStepEquivalent(
      value,
      answer,
      step.label,
      step.requiredTransformation
    ));
  }

  function isSkippedMathWorkStep(question, rowIndex, value) {
    if (rowIndex >= question.workSteps.length - 1) return false;
    const normalized = normalizeQuestionAnswer(question, value);
    const finalAnswers = [question.workResult]
      .concat(Array.isArray(question.answerText) ? question.answerText : [question.answerText])
      .filter((answer) => answer !== undefined && answer !== null && answer !== "")
      .map((answer) => normalizeQuestionAnswer(question, answer));
    if (mathWorkUtils?.jumpsToFinalAnswer(value, finalAnswers)) return true;
    if (finalAnswers.includes(normalized)) return true;
    const equationSides = normalized.includes(",") ? [] : normalized.split("=").filter(Boolean);
    if (equationSides.length > 1 && equationSides.some((side) => finalAnswers.includes(side))) return true;
    return question.workSteps.slice(rowIndex + 1).some((laterStep) => {
      return laterStep.answers.some((answer) => {
        if (!mathWorkUtils) return normalizeQuestionAnswer(question, answer) === normalized;
        return mathWorkUtils.workStepEquivalent(
          value,
          answer,
          laterStep.label,
          laterStep.requiredTransformation
        );
      });
    });
  }

  function isMathWorkComplete(draft) {
    return draft.rows.length > 0 && draft.rows.every((row) => row.length > 0);
  }

  function answerDragWorkQuestion(question) {
    if (state.answers.has(question.id)) return;
    const draft = getDragWorkDraft(question);
    if (!isMathWorkComplete(draft)) return;
    const workRows = draft.rows.map(mathWorkRowText);
    const correct = workRows.every((value, rowIndex) => isMathWorkRowCorrect(question, rowIndex, value))
      && isTextAnswerCorrect(question, question.workResult);
    const assisted = Boolean(draft.usedChoiceHint || draft.hadMistake);
    state.answers.set(question.id, {
      type: "input",
      value: question.workResult,
      correct,
      assisted,
      workRows
    });
    recordQuestionResult(question, correct, { keepReview: correct && assisted });
  }

  function isSystemInputQuestion(question) {
    return question.unit === "連立方程式" && questionType(question) === "input";
  }

  function renderSystemInputAnswer(question, currentAnswer) {
    const answered = currentAnswer !== undefined;
    const value = typeof currentAnswer === "object" ? currentAnswer.value || "" : "";
    const correct = isStoredAnswerCorrect(question, currentAnswer);
    const parsed = parseSystemAnswer(value);

    const wrapper = document.createElement("div");
    wrapper.className = "input-answer system-answer";

    const row = document.createElement("div");
    row.className = "system-input-row";

    const xInput = createSystemInput("x", parsed.x, answered);
    const yInput = createSystemInput("y", parsed.y, answered);

    const button = document.createElement("button");
    button.className = "primary-button";
    button.type = "button";
    button.textContent = "判定";
    button.disabled = answered;

    const feedback = document.createElement("p");
    feedback.className = "input-feedback";
    if (answered) {
      feedback.classList.add(correct ? "correct" : "wrong");
      feedback.textContent = correct ? "正解です。" : `不正解です。正解例: ${answerTextLabel(question)}`;
    } else {
      feedback.textContent = "xとyを別々に入れます。";
    }

    const submit = () => answerInputQuestion(question, `x=${xInput.value},y=${yInput.value}`);
    button.addEventListener("click", submit);
    [xInput, yInput].forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submit();
      });
    });

    row.append(wrapSystemField("x", xInput), wrapSystemField("y", yInput), button);
    wrapper.append(row, feedback);
    els.choices.appendChild(wrapper);
    if (!answered) xInput.focus({ preventScroll: true });
  }

  function createSystemInput(variable, value, disabled) {
    const input = document.createElement("input");
    input.className = "answer-input system-input";
    input.type = "text";
    input.inputMode = "text";
    input.autocomplete = "off";
    input.placeholder = variable;
    input.value = value || "";
    input.disabled = disabled;
    return input;
  }

  function wrapSystemField(labelText, input) {
    const label = document.createElement("label");
    label.className = "system-field";
    const labelSpan = document.createElement("span");
    labelSpan.textContent = `${labelText}=`;
    label.append(labelSpan, input);
    return label;
  }

  function parseSystemAnswer(value) {
    const normalized = normalizeAnswer(value);
    const xMatch = normalized.match(/x=(-?\d+(?:\.\d+)?)/);
    const yMatch = normalized.match(/y=(-?\d+(?:\.\d+)?)/);
    if (xMatch || yMatch) return { x: xMatch?.[1] || "", y: yMatch?.[1] || "" };
    const pair = normalized.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
    return pair ? { x: pair[1], y: pair[2] } : { x: "", y: "" };
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
    const sourceGroups = document.createElement("div");
    sourceGroups.className = "scratchpad-source-groups";
    extractScratchTokenGroups(question).forEach((group, groupIndex, groups) => {
      const groupRow = document.createElement("div");
      groupRow.className = "scratchpad-token-group";
      const groupLabel = document.createElement("span");
      groupLabel.className = "scratchpad-equation-label";
      groupLabel.textContent = scratchGroupLabel(groupIndex, groups.length);
      const sourceTokens = document.createElement("div");
      sourceTokens.className = "scratchpad-token-row";
      group.tokens.forEach((token) => {
        sourceTokens.appendChild(renderScratchSourceToken(question, scratch, token, () => refreshWorkspace()));
      });
      groupRow.append(groupLabel, sourceTokens);
      sourceGroups.appendChild(groupRow);
    });
    source.append(sourceLabel, sourceGroups);

    const maker = document.createElement("form");
    maker.className = "scratchpad-maker";
    const makerLabel = document.createElement("span");
    makerLabel.className = "scratchpad-section-label";
    makerLabel.textContent = "計算結果";
    const makerInput = document.createElement("input");
    makerInput.className = "scratchpad-result-input";
    makerInput.type = "text";
    makerInput.inputMode = "text";
    makerInput.autocomplete = "off";
    makerInput.placeholder = "途中式を入力";
    const makerButton = document.createElement("button");
    makerButton.type = "submit";
    makerButton.className = "scratchpad-clear primary";
    makerButton.textContent = "置く";
    const quickResults = document.createElement("div");
    quickResults.className = "scratchpad-token-row";
    buildScratchResultSuggestions(question).forEach((token) => {
      quickResults.appendChild(renderScratchSourceToken(question, scratch, token, () => refreshWorkspace(), "result"));
    });
    maker.addEventListener("submit", (event) => {
      event.preventDefault();
      const tokens = normalizeScratchResultTokens(makerInput.value);
      if (tokens.length === 0) return;
      addScratchTokens(question, scratch, tokens);
      makerInput.value = "";
      refreshWorkspace();
    });
    maker.append(makerLabel, makerInput, makerButton, quickResults);

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
    wrapper.append(toolbar, source, maker, workspace);
    return wrapper;
  }

  function getScratchState(question) {
    const stored = (isTrialMode() ? state.trialScratchNotes : state.scratchNotes)[question.id];
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
    if (isTrialMode()) {
      state.trialScratchNotes[question.id] = {
        lines: scratch.lines.map((line) => line.slice()),
        activeLine
      };
      return;
    }
    state.scratchNotes[question.id] = {
      lines: scratch.lines.map((line) => line.slice()),
      activeLine
    };
    saveScratchNotes();
  }

  function extractScratchTokenGroups(question) {
    const tokens = tokenizeScratchText(question.prompt);
    const baseTokens = tokens.length ? tokens : ["x", "y", "=", "+", "-", "×", "÷", "→"];
    const groups = groupEquationTokens(baseTokens);
    return groups.length ? groups.slice(0, 5) : [{ tokens: baseTokens.slice(0, 36) }];
  }

  function groupEquationTokens(tokens) {
    const groups = [];
    let current = [];
    let hasEquals = false;
    let rightTokenCount = 0;

    tokens.forEach((token, index) => {
      if (token === "→") {
        if (current.includes("=")) groups.push({ tokens: current });
        current = [];
        hasEquals = false;
        rightTokenCount = 0;
        return;
      }

      if (
        current.length > 0
        && hasEquals
        && rightTokenCount > 0
        && isEquationStartToken(token)
        && !hasEqualsAhead(tokens, index)
        && !isScratchOperator(current[current.length - 1])
      ) {
        return;
      }

      if (
        current.length > 0
        && hasEquals
        && rightTokenCount > 0
        && isEquationStartToken(token)
        && !isScratchOperator(current[current.length - 1])
        && hasEqualsAhead(tokens, index)
      ) {
        groups.push({ tokens: current });
        current = [];
        hasEquals = false;
        rightTokenCount = 0;
      }

      current.push(token);
      if (token === "=") {
        hasEquals = true;
        rightTokenCount = 0;
      } else if (hasEquals) {
        rightTokenCount += 1;
      }
    });

    if (current.length > 0) groups.push({ tokens: current });
    return groups.filter((group) => group.tokens.includes("="));
  }

  function isEquationStartToken(token) {
    return /^[+-]?(?:\d+(?:\.\d+)?)?[xy](?:²)?$/.test(token) || /^[+-]?\d+(?:\.\d+)?$/.test(token);
  }

  function hasEqualsAhead(tokens, startIndex) {
    const lookahead = tokens.slice(startIndex, startIndex + 7);
    return lookahead.includes("=");
  }

  function isScratchOperator(token) {
    return ["+", "-", "×", "÷", "(", "=", "→"].includes(token);
  }

  function scratchGroupLabel(index, groupCount) {
    if (groupCount <= 1) return "式";
    if (groupCount >= 3 && index === groupCount - 1) return "変形後";
    return `式${index + 1}`;
  }

  function buildScratchResultSuggestions(question) {
    const tokens = tokenizeScratchText(question.prompt);
    const linearEquation = parseScratchLinearEquation(tokens);
    if (linearEquation) return buildLinearEquationScratchSuggestions(linearEquation);

    const variables = Array.from(new Set(tokens.map(scratchVariableFromToken).filter(Boolean)));
    const fallbackVariables = variables.length ? variables : ["x"];
    const suggestions = new Set(["0"]);
    fallbackVariables.forEach((variable) => {
      ["", "2", "3", "4"].forEach((coefficient) => suggestions.add(`${coefficient}${variable}`));
    });
    tokens.forEach((token) => {
      if (/^[+-]?\d+(?:\.\d+)?$/.test(token)) suggestions.add(token);
      const variableMatch = token.match(/^([+-]?\d+(?:\.\d+)?)([xy])$/);
      if (variableMatch) {
        const coef = Number(variableMatch[1]);
        const variable = variableMatch[2];
        [coef - 1, coef + 1, coef * 2].forEach((value) => {
          if (Number.isFinite(value) && value !== 0) suggestions.add(`${formatScratchCoefficient(value)}${variable}`);
        });
      }
    });
    return Array.from(suggestions).slice(0, 18);
  }

  function parseScratchLinearEquation(tokens) {
    const equalIndex = tokens.indexOf("=");
    if (equalIndex <= 0 || equalIndex >= tokens.length - 1) return null;
    const left = parseScratchLinearSide(tokens.slice(0, equalIndex));
    const right = parseScratchLinearSide(tokens.slice(equalIndex + 1));
    if (!left || !right) return null;
    const variables = ["x", "y"].filter((variable) => left[variable] || right[variable]);
    if (variables.length !== 1) return null;
    const variable = variables[0];
    const leftCoef = left[variable] || 0;
    const rightCoef = right[variable] || 0;
    const combinedCoef = leftCoef - rightCoef;
    const combinedConst = (right.const || 0) - (left.const || 0);
    if (!combinedCoef || !Number.isFinite(combinedConst / combinedCoef)) return null;
    return {
      variable,
      leftCoef,
      leftConst: left.const || 0,
      rightCoef,
      rightConst: right.const || 0,
      combinedCoef,
      combinedConst,
      solution: combinedConst / combinedCoef
    };
  }

  function parseScratchLinearSide(tokens) {
    const totals = { x: 0, y: 0, const: 0 };
    let sign = 1;
    let sawTerm = false;

    for (const token of tokens) {
      if (token === "+") {
        sign = 1;
        continue;
      }
      if (token === "-") {
        sign = -1;
        continue;
      }
      if (["×", "÷", "(", ")", "→", "√", "±"].includes(token)) return null;

      let termSign = sign;
      let valueText = token;
      const signedMatch = token.match(/^([+-])(.+)$/);
      if (signedMatch) {
        termSign = signedMatch[1] === "-" ? -1 : 1;
        valueText = signedMatch[2];
      }

      const variableMatch = valueText.match(/^(\d+(?:\.\d+)?)?([xy])$/);
      if (variableMatch) {
        totals[variableMatch[2]] += termSign * Number(variableMatch[1] || 1);
        sign = 1;
        sawTerm = true;
        continue;
      }

      if (/^\d+(?:\.\d+)?$/.test(valueText)) {
        totals.const += termSign * Number(valueText);
        sign = 1;
        sawTerm = true;
        continue;
      }

      return null;
    }

    return sawTerm ? totals : null;
  }

  function buildLinearEquationScratchSuggestions(equation) {
    const suggestions = [];
    const add = (token) => {
      if (token && !suggestions.includes(token)) suggestions.push(token);
    };
    const variable = equation.variable;
    const solutionText = formatScratchNumber(equation.solution);
    const combinedCoefText = formatScratchNumber(equation.combinedCoef);
    const combinedConstText = formatScratchNumber(equation.combinedConst);

    add(formatScratchTermToken(equation.leftCoef, variable));
    if (equation.rightCoef) add(formatScratchTermToken(-equation.rightCoef, variable));
    if (equation.leftConst) add(formatScratchSignedNumber(-equation.leftConst));
    if (equation.rightConst) add(formatScratchNumber(equation.rightConst));
    add(formatScratchTermToken(equation.combinedCoef, variable));
    if (equation.leftConst && equation.rightConst) {
      add(`${formatScratchNumber(equation.rightConst)}${formatScratchSignedNumber(-equation.leftConst)}`);
    }
    add(combinedConstText);
    add(`÷${combinedCoefText}`);
    add(`${variable}=${solutionText}`);
    add(solutionText);
    add(formatScratchNumber(Math.abs(equation.leftConst)));
    add(formatScratchNumber(Math.abs(equation.leftCoef)));
    add(variable);

    const wrongConst = equation.rightConst + equation.leftConst;
    if (Number.isFinite(wrongConst) && wrongConst !== equation.combinedConst) add(formatScratchNumber(wrongConst));
    if (equation.leftCoef && equation.rightConst) add(`${formatScratchNumber(equation.rightConst)}÷${formatScratchNumber(equation.leftCoef)}`);
    if (Number.isFinite(equation.solution - 1)) add(`${variable}=${formatScratchNumber(equation.solution - 1)}`);
    add(`${variable}=${combinedConstText}`);

    return suggestions.slice(0, 18);
  }

  function scratchVariableFromToken(token) {
    const match = token.match(/[xy]/);
    return match ? match[0] : "";
  }

  function formatScratchCoefficient(value) {
    if (value === 1) return "";
    if (value === -1) return "-";
    return String(value);
  }

  function formatScratchTermToken(coef, variable) {
    if (!coef) return "";
    return `${formatScratchCoefficient(coef)}${variable}`;
  }

  function formatScratchNumber(value) {
    if (!Number.isFinite(value)) return "";
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 1000) / 1000).replace(/\.?0+$/, "");
  }

  function formatScratchSignedNumber(value) {
    if (!Number.isFinite(value)) return "";
    return value >= 0 ? `+${formatScratchNumber(value)}` : formatScratchNumber(value);
  }

  function normalizeScratchResultTokens(value) {
    const normalized = String(value || "")
      .normalize("NFKC")
      .trim()
      .replace(/\s+/g, "")
      .replace(/−/g, "-")
      .replace(/->/g, "→")
      .replace(/[＊*]/g, "×")
      .replace(/[／/]/g, "÷")
      .replace(/\^2/g, "²");
    if (!normalized || !/^[0-9xy=+\-×÷().²√±→]+$/.test(normalized)) return [];
    const tokens = tokenizeScratchText(normalized);
    return tokens.join("") === normalized ? tokens : [];
  }

  function tokenizeScratchText(text) {
    const normalized = String(text || "")
      .normalize("NFKC")
      .replace(/−/g, "-")
      .replace(/->/g, "→")
      .replace(/[＊*]/g, "×")
      .replace(/[／/]/g, "÷");
    return normalized.match(/±|√|→|[+-]?\d+(?:\.\d+)?[xy](?:²)?|[xy](?:²)?|[+-]?\d+(?:\.\d+)?|[=+\-×÷()]/g) || [];
  }

  function renderScratchSourceToken(question, scratch, token, refreshWorkspace, variant = "source") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = variant === "result" ? "scratch-token source result" : "scratch-token source";
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

  function addScratchTokens(question, scratch, tokens, lineIndex = scratch.activeLine) {
    if (!scratch.lines[lineIndex]) scratch.lines[lineIndex] = [];
    scratch.lines[lineIndex].push(...tokens);
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
    const correct = answered ? isStoredAnswerCorrect(question, currentAnswer) : phase === PHASE.DONE;

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

    const scratchKeypad = renderCompactMathKeypad(question, {
      mode: "scratch",
      disabled: answered
    });
    wrapper.append(guide, notebook, scratchKeypad, actions, feedback);
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
      drag: null,
      hasMistake: false
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
        return "右辺のxを左辺へ。左辺の数字を先に右辺へ動かしてもOK";
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
      container.appendChild(renderEquationInput(question, expectedEquationValue(equation, phase), phase));
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
    if (phase === PHASE.MOVE_VAR) return (side === "right" && isVariableTerm(term)) || (side === "left" && term.type === "const");
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
    input.inputMode = "text";
    input.placeholder = phase === PHASE.CALC_SQRT ? `±${expected}` : "?";
    const button = document.createElement("button");
    button.type = "submit";
    button.className = "equation-calc-submit";
    button.textContent = "✓";
    button.setAttribute("aria-label", "確定");
    const hint = document.createElement("span");
    hint.className = "equation-calc-hint";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (phase === PHASE.CALC_SQRT) {
        if (isPlusMinusAnswer(input.value, expected)) {
          handleEquationCalculation(question, phase, expected);
          return;
        }
        recordEquationMistake(question, phase, input.value);
        hint.textContent = equationMistakeHint(getEquationState(question), phase);
        form.classList.remove("shake");
        window.requestAnimationFrame(() => form.classList.add("shake"));
        return;
      }
      const value = Number(input.value.trim());
      if (Number.isNaN(value)) return;
      if (value === expected) {
        handleEquationCalculation(question, phase, value);
        return;
      }
      recordEquationMistake(question, phase, input.value);
      hint.textContent = equationMistakeHint(getEquationState(question), phase);
      form.classList.remove("shake");
      window.requestAnimationFrame(() => form.classList.add("shake"));
    });
    form.append(input, button, hint);
    setTimeout(() => input.focus({ preventScroll: true }), 0);
    return form;
  }

  function equationMistakeHint(equation, phase) {
    if (phase === PHASE.CALC_VAR) {
      const terms = equation.left.filter(isVariableTerm).map((term) => formatSignedNumber(term.coef));
      return `${terms.join(" ")} を計算`;
    }
    if (phase === PHASE.CALC_CONST) {
      const terms = equation.right.filter((term) => term.type === "const").map((term) => formatSignedNumber(term.coef));
      return `${terms.join(" ")} を計算`;
    }
    if (phase === PHASE.CALC_DIVIDE) {
      const term = equation.right[0];
      return `${term.coef} ÷ ${term.divisor} を計算`;
    }
    if (phase === PHASE.CALC_SQRT) {
      return `±${Math.sqrt(equation.right[0].coef)} の形で入力`;
    }
    return "もう一度計算";
  }

  function formatSignedNumber(value) {
    return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
  }

  function isPlusMinusAnswer(rawValue, expected) {
    const normalized = normalizeAnswer(rawValue).replace(/^x=/, "");
    const positiveFirst = `${expected},-${expected}`;
    const negativeFirst = `-${expected},${expected}`;
    return normalized === `±${expected}`
      || normalized === `+-${expected}`
      || normalized === positiveFirst
      || normalized === negativeFirst;
  }

  function recordEquationMistake(question, phase, rawValue) {
    if (isTrialMode()) {
      const equation = state.equationStates.get(question.id);
      if (equation) equation.hasMistake = true;
      return;
    }
    const record = state.progress[question.id] || { correct: 0, wrong: 0 };
    const equation = state.equationStates.get(question.id);
    if (equation) equation.hasMistake = true;
    record.wrong = (record.wrong || 0) + 1;
    record.needsReview = true;
    record.consecutiveCorrect = 0;
    record.mastered = false;
    record.masteredAt = "";
    record.reviewDueAt = futureDayKey(1);
    record.currentAttemptHadMistake = true;
    record.lastAnsweredAt = new Date().toISOString();
    record.mistakeType = record.mistakeType || inferEquationMistakeType(phase);
    record.lastWrongInput = String(rawValue || "").trim();
    state.progress[question.id] = record;
    saveProgress();
    renderProgressStats();
    renderWeeklyTrack();
    renderUnitTrack();
    renderExamDashboard();
  }

  function inferEquationMistakeType(phase) {
    if (phase === PHASE.CALC_VAR || phase === PHASE.CALC_CONST) return "計算ミス";
    if (phase === PHASE.CALC_DIVIDE) return "割り算ミス";
    if (phase === PHASE.CALC_SQRT) return "平方根ミス";
    return "計算ミス";
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
      const targetSide = document.elementFromPoint(endEvent.clientX, endEvent.clientY)?.closest(".equation-side")?.dataset.side;
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
    } else if (phase === PHASE.MOVE_VAR && drag.side === "left" && targetSide === "right" && drag.term.type === "const") {
      saveEquationHistory(equation);
      equation.left = equation.left.filter((term) => term.id !== drag.term.id);
      equation.right.push({ id: uniqueEquationId("r"), coef: drag.term.coef * -1, type: "const" });
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
    const hadMistake = equation.hasMistake || (state.progress[question.id] || {}).currentAttemptHadMistake;
    state.answers.set(question.id, { type: "manipulate", equation: cloneEquationState(equation), correct: true });
    recordQuestionResult(question, true, { keepReview: hadMistake });
  }

  function cloneEquationState(equation) {
    return {
      left: cloneTerms(equation.left),
      right: cloneTerms(equation.right),
      history: equation.history.slice(),
      drag: null,
      hasMistake: equation.hasMistake || false
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

  function answerMathKeypadQuestion(question) {
    if (state.answers.has(question.id)) return;
    const draft = getMathAnswerDraft(question, "answer");
    const value = draft.tokens.join("").trim();
    if (!value) return;
    const correct = isMathKeypadAnswerCorrect(question, value);
    state.answers.set(question.id, {
      type: questionType(question),
      value,
      correct,
      keypad: true
    });
    recordQuestionResult(question, correct);
  }

  function isMathKeypadAnswerCorrect(question, value) {
    const candidates = questionType(question) === "input"
      ? (Array.isArray(question.answerText) ? question.answerText : [question.answerText])
      : [question.choices?.[question.answer]];
    return candidates.filter(Boolean).some((candidate) => (
      normalizeQuestionAnswer(question, value) === normalizeQuestionAnswer(question, candidate)
        || Boolean(mathWorkUtils?.workStepEquivalent(value, candidate, "", null))
    ));
  }

  function answerRubricInputQuestion(question, rawValue, selfAssessedCorrect, checkedLabels = []) {
    if (state.answers.has(question.id)) return;
    const value = String(rawValue || "").trim();
    if (!value) return;
    const evaluation = evaluateRubricLength(question, value);
    if (!evaluation.lengthOkay) return;
    const pendingReview = selfAssessedCorrect === true;
    state.answers.set(question.id, {
      type: "input",
      value,
      correct: pendingReview ? null : false,
      pendingReview,
      rubricAssessment: pendingReview ? "pending-parent-review" : "self-review-missing",
      rubricChecks: Array.isArray(checkedLabels) ? checkedLabels.slice() : [],
      characterCount: evaluation.characterCount
    });
    const progressRecord = state.progress[question.id] || { correct: 0, wrong: 0 };
    progressRecord.lastWrittenResponse = value.slice(0, 240);
    progressRecord.lastWrittenRubricChecks = Array.isArray(checkedLabels) ? checkedLabels.slice(0, 8) : [];
    progressRecord.lastWrittenSelfAssessedCorrect = pendingReview;
    progressRecord.lastWrittenPendingReview = pendingReview;
    progressRecord.packPendingWritten = pendingReview;
    progressRecord.lastWrittenPrompt = String(question.prompt || "").slice(0, 240);
    progressRecord.lastWrittenAt = new Date().toISOString();
    state.progress[question.id] = progressRecord;
    clearRubricDraft(question);
    if (pendingReview && isPackMode()) {
      recordRubricPendingResult(question);
    } else {
      recordQuestionResult(question, false);
    }
  }

  function recordRubricPendingResult(question) {
    const meta = packMeta();
    meta.answerSequence = (Number(meta.answerSequence) || 0) + 1;
    const record = state.progress[question.id] || { correct: 0, wrong: 0 };
    record.packAttempts = (Number(record.packAttempts) || 0) + 1;
    record.packTier = packQuestionTier(question);
    record.packLastAnswerSequence = meta.answerSequence;
    record.packLastSessionId = state.packSessionId;
    record.packPendingWritten = true;
    record.packMastered = false;
    record.mastered = false;
    if (!record.packFirstAttemptRecorded) {
      const firstAttemptAt = new Date().toISOString();
      record.packFirstAttemptRecorded = true;
      record.packFirstAttemptCorrect = null;
      record.packFirstAttemptPendingReview = true;
      record.packFirstAttemptAt = firstAttemptAt;
      record.packFirstAttemptId = createPackFirstAttemptId(question, firstAttemptAt);
      record.packFirstAttemptSequence = meta.answerSequence;
    }
    record.lastAnswerWasUnknown = false;
    record.lastAnsweredAt = new Date().toISOString();
    meta.lastAnsweredAt = record.lastAnsweredAt;
    record.lastDifficulty = question.difficulty || "";
    record.lastFormatTag = question.formatTag || "";
    state.progress[question.id] = record;
    refreshPackMilestones();
    if (state.packTier === "final" && state.answers.size >= state.quiz.length) stopPackTimer(false);
    saveProgress();
    saveStats();
    renderQuestion();
    renderProgressStats();
    renderWeeklyTrack();
    renderUnitTrack();
    renderBadges();
    renderExamDashboard();
    renderPackHero();
  }

  function answerUnknownQuestion() {
    if (!isPackMode() || state.quiz.length === 0) return;
    const question = state.quiz[state.index];
    if (!question || state.answers.has(question.id)) return;
    if (question.answerMode === "rubric-input") clearRubricDraft(question);
    state.answers.set(question.id, { type: "unknown", correct: false, unknown: true });
    recordQuestionResult(question, false, { unknown: true });
  }

  function recordQuestionResult(question, correct, options = {}) {
    if (isTrialMode()) {
      renderQuestion();
      renderProgressBar();
      return;
    }
    if (isPackMode()) {
      recordPackQuestionResult(question, correct, options);
      return;
    }
    const record = state.progress[question.id] || { correct: 0, wrong: 0 };
    const wasInReview = Boolean(record.needsReview || record.wrong || record.skipped);
    if (correct) {
      record.correct = (record.correct || 0) + 1;
      record.consecutiveCorrect = options.keepReview ? 0 : (record.consecutiveCorrect || 0) + 1;
      if (options.keepReview) {
        record.needsReview = true;
        record.mastered = false;
        record.masteredAt = "";
        record.reviewDueAt = futureDayKey(1);
      } else if (wasInReview && record.consecutiveCorrect < 3) {
        record.needsReview = true;
        record.mastered = false;
        record.masteredAt = "";
        record.reviewDueAt = futureDayKey(record.consecutiveCorrect);
      } else {
        record.needsReview = false;
        record.reviewDueAt = "";
        if (record.consecutiveCorrect >= 3) {
          record.mastered = true;
          record.masteredAt = new Date().toISOString();
        }
      }
    } else {
      record.wrong = (record.wrong || 0) + 1;
      record.needsReview = true;
      record.consecutiveCorrect = 0;
      record.mastered = false;
      record.masteredAt = "";
      record.reviewDueAt = futureDayKey(1);
    }
    delete record.currentAttemptHadMistake;
    record.lastAnswerAssisted = Boolean(correct && options.keepReview);
    record.lastAnsweredAt = new Date().toISOString();
    record.lastDifficulty = question.difficulty || "";
    record.lastFormatTag = question.formatTag || "";
    state.progress[question.id] = record;
    recordDailyAnswer(correct);
    saveProgress();
    saveStats();
    renderQuestion();
    renderProgressStats();
    renderWeeklyTrack();
    renderUnitTrack();
    renderBadges();
    renderExamDashboard();
  }

  function nextPackDimensionMasteryEntry(previous, evidence) {
    const entry = {
      directions: Array.isArray(previous?.directions) ? previous.directions.slice() : [],
      sessionIds: Array.isArray(previous?.sessionIds) ? previous.sessionIds.slice() : [],
      authorInputCorrect: previous?.authorInputCorrect === true,
      mastered: previous?.mastered === true,
      resetAt: previous?.resetAt || "",
      lastAnsweredAt: evidence.answeredAt,
      requiredDirections: evidence.requiredDirections,
      requiredSessions: evidence.requiredSessions,
      requireAuthorInput: evidence.requireAuthorInput
    };
    if (!evidence.correct || evidence.keepReview) {
      entry.directions = [];
      entry.sessionIds = [];
      entry.authorInputCorrect = false;
      entry.mastered = false;
      entry.resetAt = evidence.answeredAt;
      return entry;
    }
    if (!entry.directions.includes(evidence.direction)) entry.directions.push(evidence.direction);
    if (evidence.sessionId && !entry.sessionIds.includes(evidence.sessionId)) {
      entry.sessionIds.push(evidence.sessionId);
    }
    if (evidence.isAuthorInput) entry.authorInputCorrect = true;
    entry.mastered = entry.directions.length >= entry.requiredDirections
      && entry.sessionIds.length >= entry.requiredSessions
      && (!entry.requireAuthorInput || entry.authorInputCorrect);
    return entry;
  }

  function updatePackDimensionMastery(question, correct, options = {}) {
    const mastery = state.packConfig?.mastery || {};
    if (!mastery.distinctDirections || !question.authorKey || !question.retrievalDirection) return;
    const guideItems = Array.isArray(state.packConfig?.studyGuide?.items)
      ? state.packConfig.studyGuide.items
      : [];
    const guideByKey = new Map(guideItems
      .filter((item) => item?.authorKey)
      .map((item) => [item.authorKey, item]));
    const guideKeys = new Set(guideByKey.keys());
    const keys = (Array.isArray(question.authorKey) ? question.authorKey : [question.authorKey])
      .filter((key) => key && (!guideKeys.size || guideKeys.has(key)));
    if (!keys.length) return;
    const meta = packMeta();
    if (!meta.authorMastery || typeof meta.authorMastery !== "object") meta.authorMastery = {};
    const requiredDirections = Math.max(2, Number(mastery.distinctDirections) || 2);
    const requiredSessions = Math.max(2, Number(mastery.distinctSessions) || 2);
    const defaultRequireAuthorInput = mastery.requireAuthorInput === true || mastery.requireInput === true;
    const direction = String(question.retrievalDirection)
      .replace(/^direct-/, "")
      .replace(/^correction$/, "error-correction");
    const answeredAt = new Date().toISOString();
    keys.forEach((key) => {
      const previous = meta.authorMastery[key] || {};
      const guideItem = guideByKey.get(key);
      const requireAuthorInput = guideItem?.requireAuthorInput === false
        ? false
        : defaultRequireAuthorInput;
      meta.authorMastery[key] = nextPackDimensionMasteryEntry(previous, {
        answeredAt,
        correct,
        keepReview: options.keepReview === true,
        direction,
        sessionId: state.packSessionId,
        isAuthorInput: questionType(question) === "input" && question.answerTarget === "author",
        requiredDirections,
        requiredSessions,
        requireAuthorInput
      });
    });
  }

  function recordPackQuestionResult(question, correct, options = {}) {
    const meta = packMeta();
    meta.answerSequence = (Number(meta.answerSequence) || 0) + 1;
    const record = state.progress[question.id] || { correct: 0, wrong: 0 };
    const wasInReview = Boolean(record.needsReview);
    record.packAttempts = (Number(record.packAttempts) || 0) + 1;
    record.packTier = packQuestionTier(question);
    record.packLastAnswerSequence = meta.answerSequence;
    record.packLastSessionId = state.packSessionId;
    if (packQuestionTier(question) === "max") {
      record.packQuestionSnapshot = packQuestionSnapshot(question);
    }
    if (!record.packFirstAttemptRecorded) {
      const firstAttemptAt = new Date().toISOString();
      record.packFirstAttemptRecorded = true;
      record.packFirstAttemptCorrect = Boolean(correct && !options.keepReview);
      record.packFirstAttemptAt = firstAttemptAt;
      record.packFirstAttemptId = createPackFirstAttemptId(question, firstAttemptAt);
      record.packFirstAttemptSequence = meta.answerSequence;
    }

    if (correct) {
      record.correct = (record.correct || 0) + 1;
      record.packCorrect = (record.packCorrect || 0) + 1;
      if (options.keepReview) {
        record.packConsecutiveCorrect = 0;
        record.packLastCorrectSessionId = "";
        record.consecutiveCorrect = 0;
        record.packMastered = false;
        record.mastered = false;
        record.masteredAt = "";
        record.needsReview = true;
        record.reviewDueAt = todayKey();
      } else {
        if (record.packLastCorrectSessionId !== state.packSessionId) {
          record.packConsecutiveCorrect = (Number(record.packConsecutiveCorrect) || 0) + 1;
        }
        record.packLastCorrectSessionId = state.packSessionId;
        record.consecutiveCorrect = record.packConsecutiveCorrect;
        const masteryTarget = Number(state.packConfig?.mastery?.correctSessions) || 2;
        if (record.packConsecutiveCorrect >= masteryTarget) {
          record.packMastered = true;
          record.mastered = true;
          record.masteredAt = new Date().toISOString();
          record.needsReview = false;
          record.reviewDueAt = "";
        } else {
          record.packMastered = false;
          record.mastered = false;
          record.masteredAt = "";
          record.needsReview = wasInReview;
          record.reviewDueAt = wasInReview ? todayKey() : "";
        }
      }
    } else {
      record.wrong = (record.wrong || 0) + 1;
      record.packWrong = (record.packWrong || 0) + (options.unknown ? 0 : 1);
      record.packUnknown = (record.packUnknown || 0) + (options.unknown ? 1 : 0);
      record.packConsecutiveCorrect = 0;
      record.packLastCorrectSessionId = "";
      record.packMastered = false;
      record.consecutiveCorrect = 0;
      record.mastered = false;
      record.masteredAt = "";
      record.needsReview = true;
      record.reviewDueAt = todayKey();
      record.packCooldown = meta.answerSequence + (Number(state.packConfig?.mastery?.cooldownAnswers) || 5);
    }
    record.lastAnswerWasUnknown = Boolean(options.unknown);
    record.lastAnswerAssisted = Boolean(correct && options.keepReview);
    delete record.currentAttemptHadMistake;
    record.lastAnsweredAt = new Date().toISOString();
    meta.lastAnsweredAt = record.lastAnsweredAt;
    record.lastDifficulty = question.difficulty || "";
    record.lastFormatTag = question.formatTag || "";
    state.progress[question.id] = record;
    updatePackDimensionMastery(question, correct, options);
    recordPackAnswer(correct);
    refreshPackMilestones();
    if (state.packTier === "final" && state.answers.size >= state.quiz.length) stopPackTimer(false);
    if (options.silent) return;
    saveProgress();
    saveStats();
    renderQuestion();
    renderProgressStats();
    renderWeeklyTrack();
    renderUnitTrack();
    renderBadges();
    renderExamDashboard();
    renderPackHero();
  }

  function packQuestionSnapshot(question) {
    const snapshot = {
      id: question.id,
      type: question.type,
      childId: question.childId,
      childIds: Array.isArray(question.childIds) ? question.childIds.slice() : undefined,
      subject: question.subject,
      unit: question.unit,
      priority: question.priority,
      stage: question.stage,
      difficulty: question.difficulty,
      formatTag: question.formatTag,
      packId: question.packId,
      unitId: question.unitId,
      tier: question.tier,
      paperRef: question.paperRef,
      sourceFactIds: Array.isArray(question.sourceFactIds) ? question.sourceFactIds.slice() : undefined,
      retrievalDirection: question.retrievalDirection,
      skills: Array.isArray(question.skills) ? question.skills.slice() : undefined,
      variantGroup: question.variantGroup,
      passageId: question.passageId,
      passage: question.passage,
      prompt: question.prompt,
      choices: Array.isArray(question.choices) ? question.choices.slice() : undefined,
      answer: question.answer,
      answerText: Array.isArray(question.answerText) ? question.answerText.slice() : question.answerText,
      placeholder: question.placeholder,
      answerMode: question.answerMode,
      responseRubric: question.responseRubric
        ? {
            minLength: question.responseRubric.minLength,
            maxLength: question.responseRubric.maxLength,
            modelAnswer: question.responseRubric.modelAnswer,
            conceptGroups: Array.isArray(question.responseRubric.conceptGroups)
              ? question.responseRubric.conceptGroups.map((group) => ({
                  label: group.label,
                  description: group.description,
                  anyOf: Array.isArray(group.anyOf) ? group.anyOf.slice() : []
                }))
              : []
          }
        : undefined,
      workResult: question.workResult,
      workSteps: Array.isArray(question.workSteps)
        ? question.workSteps.map((step) => ({
            label: step.label,
            answers: step.answers.slice(),
            requiredTransformation: Array.isArray(step.requiredTransformation)
              ? step.requiredTransformation.slice()
              : step.requiredTransformation
          }))
        : undefined,
      explanation: question.explanation
    };
    if (question.figure) {
      try {
        snapshot.figure = JSON.parse(JSON.stringify(question.figure));
      } catch (_error) {
        snapshot.figure = undefined;
      }
    }
    return snapshot;
  }

  function createPackFirstAttemptId(question, attemptedAt) {
    const randomId = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);
    return `${attemptedAt}:${question.id}:${randomId}`;
  }

  function comparePackFirstAttempts(a, b) {
    const aTime = Date.parse(a.packFirstAttemptAt || "") || Number.MAX_SAFE_INTEGER;
    const bTime = Date.parse(b.packFirstAttemptAt || "") || Number.MAX_SAFE_INTEGER;
    if (aTime !== bTime) return aTime - bTime;
    return String(a.packFirstAttemptId || "").localeCompare(String(b.packFirstAttemptId || ""));
  }

  function normalizeAnswer(value) {
    return String(value)
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[−‐‑‒–—―]/g, "-")
      .replace(/[’‘‛`´]/g, "'")
      .replace(/[ \t\r\n]/g, "")
      .replace(/[、，]/g, ",")
      .replace(/＝/g, "=");
  }

  function isTextAnswerCorrect(question, value) {
    const candidates = Array.isArray(question.answerText) ? question.answerText : [question.answerText];
    const normalized = normalizeQuestionAnswer(question, value);
    return candidates.some((candidate) => normalizeQuestionAnswer(question, candidate) === normalized);
  }

  function normalizeQuestionAnswer(question, value) {
    const normalized = normalizeAnswer(value);
    if (question.subject !== "数学") return normalized;
    return normalized.replace(/([a-z]|\))2/g, "$1^2");
  }

  function answerTextLabel(question) {
    if (Array.isArray(question.answerText)) return question.answerText[0];
    return question.answerText;
  }

  function isStoredAnswerCorrect(question, storedAnswer) {
    if (storedAnswer === undefined) return false;
    if (typeof storedAnswer === "object" && storedAnswer !== null) {
      if (storedAnswer.pendingReview) return false;
      if (typeof storedAnswer.correct === "boolean") return storedAnswer.correct;
      if (questionType(question) === "input") return isTextAnswerCorrect(question, storedAnswer.value || "");
      if (questionType(question) === "manipulate") return storedAnswer.correct === true;
      return storedAnswer.choiceIndex === question.answer;
    }
    return storedAnswer === question.answer;
  }

  function recordDailyAnswer(correct) {
    const today = ensureDailyRecord(todayKey());
    if (!state.sessionRecorded) {
      today.sessions = (today.sessions || 0) + 1;
      state.sessionRecorded = true;
    }
    today.answered += 1;
    if (correct) today.correct += 1;
  }

  function recordPackAnswer(correct) {
    const meta = packMeta();
    if (!meta.daily || typeof meta.daily !== "object") meta.daily = {};
    const dayKey = todayKey();
    if (!meta.daily[dayKey]) meta.daily[dayKey] = { answered: 0, correct: 0, sessions: 0 };
    const day = meta.daily[dayKey];
    if (!state.sessionRecorded) {
      meta.sessions = (Number(meta.sessions) || 0) + 1;
      day.sessions = (Number(day.sessions) || 0) + 1;
      state.sessionRecorded = true;
    }
    meta.answered = (Number(meta.answered) || 0) + 1;
    day.answered = (Number(day.answered) || 0) + 1;
    if (correct) {
      meta.correct = (Number(meta.correct) || 0) + 1;
      day.correct = (Number(day.correct) || 0) + 1;
    }
  }

  function ensureDailyRecord(key) {
    if (!state.stats.daily) state.stats.daily = {};
    if (!state.stats.daily[key]) {
      state.stats.daily[key] = { answered: 0, correct: 0, sessions: 0 };
    }
    const record = state.stats.daily[key];
    record.answered = record.answered || 0;
    record.correct = record.correct || 0;
    record.sessions = record.sessions || 0;
    return record;
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

  function futureDayKey(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return todayKey(date);
  }

  function previousDayKey(key) {
    const date = dateFromKey(key);
    date.setDate(date.getDate() - 1);
    return todayKey(date);
  }

  function currentStreak() {
    return streakForDaily(state.stats.daily || {}, new Date());
  }

  function streakForDaily(daily, date) {
    let key = todayKey();
    if (date) key = todayKey(date);
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

  function longestStreak() {
    const activeKeys = Object.keys(state.stats.daily || {})
      .filter((key) => (state.stats.daily[key]?.answered || 0) > 0)
      .sort();
    let longest = 0;
    let current = 0;
    let previous = "";
    activeKeys.forEach((key) => {
      current = previous && previousDayKey(key) === previous ? current + 1 : 1;
      longest = Math.max(longest, current);
      previous = key;
    });
    return longest;
  }

  function recentDayKeys(count) {
    const keys = [];
    const date = new Date();
    for (let index = count - 1; index >= 0; index -= 1) {
      const item = new Date(date);
      item.setDate(date.getDate() - index);
      keys.push(todayKey(item));
    }
    return keys;
  }

  function recentTotals(dayCount) {
    return recentDayKeys(dayCount).reduce((totals, key) => {
      const day = state.stats.daily?.[key] || {};
      totals.answered += day.answered || 0;
      totals.correct += day.correct || 0;
      totals.sessions += day.sessions || 0;
      return totals;
    }, { answered: 0, correct: 0, sessions: 0 });
  }

  function dailyTotals() {
    const daily = state.stats.daily || {};
    return Object.values(daily).reduce((totals, day) => {
      totals.answered += day.answered || 0;
      totals.correct += day.correct || 0;
      totals.sessions += day.sessions || 0;
      return totals;
    }, { answered: 0, correct: 0, sessions: 0 });
  }

  function learningSummary() {
    const normalQuestionIds = new Set(normalQuestionsForChild(state.activeChildId).map((question) => question.id));
    const records = Object.entries(state.progress)
      .filter(([questionId]) => normalQuestionIds.has(questionId))
      .map(([, record]) => record);
    const totals = dailyTotals();
    const fallbackAnswered = records.reduce((sum, record) => sum + (record.correct || 0) + (record.wrong || 0), 0);
    const fallbackCorrect = records.reduce((sum, record) => sum + (record.correct || 0), 0);
    const answered = totals.answered || fallbackAnswered;
    const correct = totals.answered ? totals.correct : fallbackCorrect;
    const today = state.stats.daily?.[todayKey()] || { answered: 0, correct: 0, sessions: 0 };
    const week = recentTotals(7);
    const studyDays = Object.values(state.stats.daily || {}).filter((day) => day.answered > 0).length;
    const review = records.filter((record) => record.needsReview).length;
    return {
      answered,
      correct,
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      sessions: totals.sessions || studyDays,
      today,
      todayAccuracy: today.answered ? Math.round((today.correct / today.answered) * 100) : 0,
      week,
      studyDays,
      streak: currentStreak(),
      longestStreak: longestStreak(),
      review
    };
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
    const currentQuestion = state.quiz[state.index];
    els.nextQuestion.disabled = isPackMode() && currentQuestion && !state.answers.has(currentQuestion.id);
    els.nextQuestion.textContent = state.index === total - 1 ? "結果を見る" : "次へ";
  }

  function renderProgressStats() {
    const summary = learningSummary();
    els.answeredCount.textContent = String(summary.answered);
    els.sessionCount.textContent = String(summary.sessions);
    els.accuracyRate.textContent = `${summary.accuracy}%`;
    els.studyDaysCount.textContent = String(summary.studyDays);
    els.streakCount.textContent = `${summary.streak}日`;
    els.reviewCount.textContent = String(summary.review);
    els.todayAnsweredMetric.textContent = String(summary.today.answered || 0);
    els.todayAccuracyMetric.textContent = `${summary.todayAccuracy}%`;
    els.streakMetric.textContent = `${summary.streak}日`;
    els.totalAnsweredMetric.textContent = String(summary.answered);
    els.sessionMetric.textContent = String(summary.sessions);
    els.studyDaysMetric.textContent = `${summary.studyDays}日`;
    els.longestStreakMetric.textContent = `${summary.longestStreak}日`;
    els.weeklyAnsweredMetric.textContent = String(summary.week.answered);
    els.reviewMetric.textContent = String(summary.review);
    const bank = activeQuestions();
    els.bankCount.textContent = String(bank.length);
    els.priorityCount.textContent = String(bank.filter((question) => question.priority === "S" || question.priority === "A").length);
  }

  function renderBadges() {
    const summary = learningSummary();
    const badges = [
      { label: "今日5問", earned: summary.today.answered >= 5 },
      { label: "今日20問", earned: summary.today.answered >= 20 },
      { label: "正答率80%", earned: summary.today.answered >= 5 && summary.today.correct / summary.today.answered >= 0.8 },
      { label: "3日連続", earned: summary.streak >= 3 },
      { label: "7日連続", earned: summary.streak >= 7 },
      { label: "累計100問", earned: summary.answered >= 100 }
    ];
    els.badgeList.innerHTML = "";
    badges.forEach((badge) => {
      const item = document.createElement("div");
      item.className = badge.earned ? "badge earned" : "badge";
      item.textContent = badge.label;
      els.badgeList.appendChild(item);
    });
  }

  function renderWeeklyTrack() {
    els.weeklyTrack.innerHTML = "";
    const keys = recentDayKeys(7);
    const maxAnswered = Math.max(1, ...keys.map((key) => state.stats.daily?.[key]?.answered || 0));
    keys.forEach((key) => {
      const day = state.stats.daily?.[key] || { answered: 0, correct: 0 };
      const item = document.createElement("div");
      item.className = day.answered ? "week-day active" : "week-day";
      const label = document.createElement("span");
      label.className = "week-day-label";
      label.textContent = shortDayLabel(key);
      const bar = document.createElement("span");
      bar.className = "week-day-bar";
      bar.style.height = `${Math.max(8, Math.round((day.answered / maxAnswered) * 48))}px`;
      const count = document.createElement("span");
      count.className = "week-day-count";
      count.textContent = String(day.answered || 0);
      item.append(label, bar, count);
      els.weeklyTrack.appendChild(item);
    });
  }

  function shortDayLabel(key) {
    const date = dateFromKey(key);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function renderExamDashboard() {
    const summary = learningSummary();
    const latestMock = latestMockScore();
    const daysLeft = daysUntil(state.goal.examDate);
    const readiness = examReadiness(summary, latestMock);

    els.goalSchoolName.textContent = state.goal.shortName;
    els.goalTargetScore.textContent = `${state.goal.targetScore}/500`;
    els.goalExamDate.textContent = formatDateLabel(state.goal.examDate);
    els.goalLatestMock.textContent = latestMock ? `${latestMock.score}/500` : "未入力";
    els.examSchoolTitle.textContent = `${state.goal.shortName} ${state.goal.stance}`;
    els.examGoalLabel.textContent = `${state.goal.schoolName} / 目標 ${state.goal.targetScore}点`;
    els.examDaysLeft.textContent = daysLeft >= 0 ? `${daysLeft}日` : "要更新";
    els.examTargetScore.textContent = `${state.goal.targetScore}`;
    els.examLatestScore.textContent = latestMock ? `${latestMock.score}` : "--";
    els.examScoreGap.textContent = latestMock ? scoreGapLabel(latestMock.score) : "模試点を入力";
    els.examReadiness.textContent = `${readiness}%`;
    renderExamPlan(summary);
    renderSubjectReadiness();
  }

  function latestMockScore() {
    return state.goal.mockScores.length ? state.goal.mockScores[state.goal.mockScores.length - 1] : null;
  }

  function daysUntil(key) {
    const target = dateFromKey(key);
    const today = dateFromKey(todayKey());
    return Math.ceil((target.getTime() - today.getTime()) / 86400000);
  }

  function formatDateLabel(key) {
    const date = dateFromKey(key);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }

  function scoreGapLabel(score) {
    if (score >= state.goal.targetScore) return `目標+${score - state.goal.targetScore}`;
    if (score >= state.goal.safetyScore) return `余裕まで${state.goal.targetScore - score}`;
    return `安全圏まで${state.goal.safetyScore - score}`;
  }

  function examReadiness(summary, latestMock) {
    const accuracy = Math.min(1, summary.accuracy / Math.max(1, state.goal.targetAccuracy));
    const habit = Math.min(1, summary.streak / 7);
    const weekly = Math.min(1, summary.week.answered / Math.max(1, state.goal.weeklyTarget));
    const review = summary.review === 0 ? 1 : Math.max(0, 1 - summary.review / 25);
    const mock = latestMock ? Math.min(1, latestMock.score / Math.max(1, state.goal.targetScore)) : accuracy;
    return Math.round((mock * 0.34 + accuracy * 0.22 + weekly * 0.18 + habit * 0.12 + review * 0.14) * 100);
  }

  function renderExamPlan(summary) {
    els.examPlanList.innerHTML = "";
    const tasks = [];
    const weakRows = unitPerformanceRows()
      .filter((row) => row.review > 0 || row.wrong > 0 || (row.attempts >= 3 && row.accuracy < state.goal.targetAccuracy))
      .slice(0, 3);
    if (summary.week.answered < state.goal.weeklyTarget) {
      tasks.push(`今週あと${state.goal.weeklyTarget - summary.week.answered}問で演習目標`);
    }
    weakRows.forEach((row) => {
      const detail = row.review ? `復習${row.review}問` : `正答率${row.accuracy}%`;
      tasks.push(`${row.subject}/${row.unit}: ${detail}を先に潰す`);
    });
    if (tasks.length === 0) {
      tasks.push("今日の20問を維持して、模試点を入力する");
      tasks.push("数学・英語を毎日1セット入れる");
    }
    tasks.slice(0, 4).forEach((task) => {
      const item = document.createElement("div");
      item.textContent = task;
      els.examPlanList.appendChild(item);
    });
  }

  function renderSubjectReadiness() {
    const rows = subjectPerformanceRows();
    els.subjectReadinessList.innerHTML = "";
    rows.forEach((row) => {
      const item = document.createElement("div");
      item.className = "subject-readiness-row";
      const header = document.createElement("div");
      header.className = "subject-readiness-header";
      const name = document.createElement("span");
      name.textContent = row.subject;
      const score = document.createElement("span");
      score.textContent = row.attempts ? `${row.accuracy}%` : "未演習";
      header.append(name, score);
      const meter = document.createElement("div");
      meter.className = "subject-readiness-meter";
      const bar = document.createElement("span");
      bar.style.width = `${row.attempts ? Math.min(100, row.accuracy) : 4}%`;
      meter.appendChild(bar);
      item.append(header, meter);
      els.subjectReadinessList.appendChild(item);
    });
  }

  function subjectPerformanceRows() {
    const bank = normalQuestionsForChild(state.activeChildId);
    return EXAM_SUBJECTS.map((subject) => {
      const rows = bank.filter((question) => question.subject === subject);
      const totals = rows.reduce((acc, question) => {
        const record = state.progress[question.id] || {};
        acc.correct += record.correct || 0;
        acc.wrong += record.wrong || 0;
        acc.review += record.needsReview ? 1 : 0;
        return acc;
      }, { correct: 0, wrong: 0, review: 0 });
      const attempts = totals.correct + totals.wrong;
      return {
        subject,
        attempts,
        correct: totals.correct,
        wrong: totals.wrong,
        review: totals.review,
        accuracy: attempts ? Math.round((totals.correct / attempts) * 100) : 0
      };
    });
  }

  function renderUnitTrack() {
    const rows = unitPerformanceRows()
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

  function unitPerformanceRows() {
    return Object.values(normalQuestionsForChild(state.activeChildId).reduce((acc, question) => {
      const key = `${question.subject} / ${question.unit}`;
      if (!acc[key]) {
        acc[key] = { key, subject: question.subject, unit: question.unit, total: 0, review: 0, wrong: 0, correct: 0, attempts: 0, accuracy: 0 };
      }
      const record = state.progress[question.id] || {};
      acc[key].total += 1;
      if (record.needsReview) acc[key].review += 1;
      acc[key].wrong += record.wrong || 0;
      acc[key].correct += record.correct || 0;
      acc[key].attempts += (record.correct || 0) + (record.wrong || 0);
      return acc;
    }, {})).map((row) => ({
      ...row,
      accuracy: row.attempts ? Math.round((row.correct / row.attempts) * 100) : 0
    }));
  }

  function showSummary() {
    if (isPackMode()) stopPackTimer(false);
    if (!isTrialMode() && !isPackMode()) markSkippedQuestionsForReview();
    const total = state.quiz.length;
    const answered = state.answers.size;
    const correct = state.quiz.reduce((count, question) => {
      return isStoredAnswerCorrect(question, state.answers.get(question.id)) ? count + 1 : count;
    }, 0);
    const pendingWritten = state.quiz.reduce((count, question) => {
      return state.answers.get(question.id)?.pendingReview ? count + 1 : count;
    }, 0);
    const writtenAnswered = state.quiz.reduce((count, question) => {
      return question.answerMode === "rubric-input" && state.answers.has(question.id) ? count + 1 : count;
    }, 0);
    const gradedAnswered = Math.max(0, answered - writtenAnswered);
    const writtenSummary = writtenAnswered
      ? `、記述${writtenAnswered}問は自動採点外${pendingWritten ? `（${pendingWritten}問は保護者確認待ち）` : ""}`
      : "";
    const summary = learningSummary();
    els.questionCard.classList.add("hidden");
    els.summary.classList.remove("hidden");
    els.summaryText.textContent = isTrialMode()
      ? `${total}問中 ${correct}問正解です。お試しモードのため、この結果は子供の記録、復習待ち、連続日数、Firebaseには保存していません。`
      : isPackMode()
      ? state.packTimedOut
        ? `時間切れです。未回答は「わからない」として記録しました。自動採点${gradedAnswered}問中 ${correct}問正解${writtenSummary}。`
        : `自動採点${gradedAnswered}問中 ${correct}問正解${writtenSummary}。間違いと「わからない」は、5問以上あけてもう一度出題します。別のセットで2回正解すると克服です。`
      : `${total}問中 ${correct}問正解です。今日は${summary.today.answered}問、累計${summary.answered}問、連続${summary.streak}日、最長${summary.longestStreak}日です。間違えた単元は「できなかった問題」に回ります。`;
    renderWeakUnits();
    renderPackHero();
  }

  function markSkippedQuestionsForReview() {
    let changed = false;
    state.quiz.forEach((question) => {
      if (state.answers.has(question.id)) return;
      const record = state.progress[question.id] || { correct: 0, wrong: 0 };
      record.needsReview = true;
      record.consecutiveCorrect = 0;
      record.mastered = false;
      record.masteredAt = "";
      record.reviewDueAt = futureDayKey(1);
      record.skipped = (record.skipped || 0) + 1;
      record.lastAnsweredAt = new Date().toISOString();
      state.progress[question.id] = record;
      changed = true;
    });
    if (changed) saveProgress();
  }

  function renderWeakUnits() {
    const misses = {};
    state.quiz.forEach((question) => {
      if (isPackMode() && !state.answers.has(question.id)) return;
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
      item.textContent = isPackMode()
        ? "今回の間違いはありません。上のレベルへ進むか、次の10問に挑戦しよう。"
        : "今回の間違いはありません。次は苦手集中モードで負荷を上げましょう。";
      els.weakUnitList.appendChild(item);
    }
  }

  function exportRecords() {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      child: currentChildProfile(),
      progress: state.progress,
      stats: state.stats,
      scratchNotes: state.scratchNotes,
      goal: state.goal,
      summary: learningSummary()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weakness-quiz-records-${currentChildProfile().id}-${todayKey()}.json`;
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
        if (!confirm(`${currentChildProfile().name}の解答記録を、読み込んだ記録で上書きしますか。`)) return;
        state.progress = payload.progress || {};
        migratePendingRubricProgress(state.progress);
        state.stats = payload.stats || { daily: {} };
        state.scratchNotes = payload.scratchNotes || {};
        state.goal = normalizeGoal(payload.goal || state.goal);
        saveProgress();
        saveStats();
        saveScratchNotes();
        saveGoal();
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

  function initializeCloudSync() {
    const cloud = window.WeaknessQuizCloud;
    if (!cloud) {
      setCloudStatus("ローカル保存", "local");
      renderCloudControls();
      return;
    }
    const result = cloud.init();
    state.cloudAvailable = Boolean(result?.available);
    if (!state.cloudAvailable) {
      setCloudStatus(result?.message || "Firebase未設定", "local");
      renderCloudControls();
      return;
    }
    setCloudStatus("未ログイン", "local");
    cloud.onAuthStateChanged(async (user) => {
      state.cloudUser = user || null;
      if (state.cloudUser) {
        let pairedNow = false;
        if (typeof cloud.claimChildPairingFromLocation === "function") {
          try {
            const pairing = await cloud.claimChildPairingFromLocation(state.activeChildId, currentRecordPayload());
            pairedNow = Boolean(pairing?.claimed);
          } catch (error) {
            console.error("Child device pairing failed", error);
            setCloudStatus(error?.message || "家族への接続に失敗", "error");
            renderCloudControls();
            return;
          }
        }
        state.cloudRole = isChallengeCoursePack() && typeof cloud.getAccountRole === "function"
          ? await cloud.getAccountRole(state.activeChildId)
          : "learner";
        setCloudStatus(
          pairedNow
            ? "家族に接続済み"
            : state.cloudRole === "parent"
            ? "保護者お試し"
            : state.cloudRole === "unassigned"
              ? "長男を登録"
            : state.cloudUser.isAnonymous ? "匿名クラウド保存" : "クラウド接続",
          "online"
        );
        renderCloudControls();
        if (state.hasSelectedChild) pullCloudRecordForActiveChild();
      } else {
        state.cloudRole = "none";
        renderCloudControls();
        setCloudStatus("ローカル保存", "local");
      }
    });
    cloud.ensureAnonymousAuth?.().catch((error) => {
      console.warn("Anonymous cloud save unavailable; local saving remains active.", error);
    });
  }

  function renderCloudControls() {
    const signedIn = Boolean(state.cloudUser);
    const anonymous = Boolean(state.cloudUser?.isAnonymous);
    els.cloudSignIn.disabled = !state.cloudAvailable || (signedIn && !anonymous);
    els.cloudSignIn.textContent = anonymous ? "Googleで共有" : "Googleで同期";
    els.cloudSignOut.disabled = !state.cloudAvailable || !signedIn || anonymous;
    els.syncNow.disabled = !state.cloudAvailable || !signedIn;
    els.syncNow.textContent = isChallengeCoursePack() && state.cloudRole === "unassigned"
      ? "長男として登録"
      : "今すぐ同期";
    els.cloudSignIn.classList.toggle("hidden", signedIn && !anonymous);
    els.cloudSignOut.classList.toggle("hidden", !signedIn || anonymous);
    els.syncNow.classList.toggle("hidden", !signedIn);
  }

  function setCloudStatus(text, status = "local") {
    els.cloudStatus.textContent = text;
    els.cloudStatus.dataset.status = status;
  }

  function canUseCloud() {
    if (!canReadCloud()) return false;
    if (isChallengeCoursePack()) {
      return state.cloudRole === "learner"
        && typeof window.WeaknessQuizCloud.saveLearnerRecord === "function";
    }
    return typeof window.WeaknessQuizCloud.saveRecord === "function";
  }

  function canReadCloud() {
    return state.cloudAvailable
      && state.cloudUser
      && window.WeaknessQuizCloud
      && typeof window.WeaknessQuizCloud.getRecord === "function";
  }

  function scheduleCloudSave() {
    if (state.cloudHydrating || !canUseCloud()) return;
    window.clearTimeout(state.cloudSaveTimer);
    setCloudStatus("同期待ち", "pending");
    state.cloudSaveTimer = window.setTimeout(() => {
      state.cloudSaveTimer = null;
      saveCloudRecord();
    }, CLOUD_SAVE_DELAY);
  }

  function flushCloudSave() {
    if (!state.cloudSaveTimer) return;
    window.clearTimeout(state.cloudSaveTimer);
    state.cloudSaveTimer = null;
    saveCloudRecord();
  }

  function cloudSyncFailureLabel(result) {
    if (result?.reason === "household-missing") return "家族共有未設定";
    if (result?.reason === "learner-unregistered") return "長男を登録";
    if (result?.reason === "learner-owned-by-other") return "保護者お試し";
    if (result?.reason === "verification-failed") return "同期を確認できません";
    return "同期できません";
  }

  async function saveCloudRecord(options = {}) {
    const challengeRecord = isChallengeCoursePack();
    if (!canReadCloud() || state.cloudSyncing) return;
    if (!challengeRecord && !canUseCloud()) return;
    if (challengeRecord && state.cloudRole === "parent") {
      setCloudStatus("保護者お試し", "online");
      return;
    }
    if (challengeRecord && state.cloudRole === "unassigned" && !options.claimLearner) {
      setCloudStatus("長男を登録", "pending");
      return;
    }
    state.cloudSyncing = true;
    setCloudStatus("保存中", "pending");
    try {
      if (challengeRecord && typeof window.WeaknessQuizCloud.saveLearnerRecord === "function") {
        const result = options.claimLearner
          ? await window.WeaknessQuizCloud.claimLearnerRecord(state.activeChildId, currentRecordPayload())
          : await window.WeaknessQuizCloud.saveLearnerRecord(state.activeChildId, currentRecordPayload(), { serverOnly: true });
        state.cloudRole = result.role || state.cloudRole;
        renderCloudControls();
        if (!result.saved || !result.verified) {
          if (result.saved && !result.shared && state.cloudUser?.isAnonymous) {
            setCloudStatus("匿名クラウド保存", "online");
          } else {
            setCloudStatus(cloudSyncFailureLabel(result), "error");
          }
          return;
        }
        state.lastCloudSavedAt = new Date();
        setCloudStatus(`同期済み ${result.total}問`, "online");
      } else {
        await window.WeaknessQuizCloud.saveRecord(state.activeChildId, currentRecordPayload());
        state.lastCloudSavedAt = new Date();
        setCloudStatus(`同期済み ${formatTime(state.lastCloudSavedAt)}`, "online");
      }
    } catch (error) {
      setCloudStatus("同期エラー", "error");
      console.error("Cloud save failed", error);
    } finally {
      state.cloudSyncing = false;
    }
  }

  async function pullCloudRecordForActiveChild(options = {}) {
    if (!canReadCloud()) return;
    const childId = state.activeChildId;
    state.cloudHydrating = true;
    setCloudStatus("読み込み中", "pending");
    try {
      if (childId !== state.activeChildId) return;
      let autoClaimLearner = false;
      if (isChallengeCoursePack() && typeof window.WeaknessQuizCloud.getLearnerRecordSources === "function") {
        const sources = await window.WeaknessQuizCloud.getLearnerRecordSources(childId, { serverOnly: true });
        state.cloudRole = sources.role;
        renderCloudControls();
        autoClaimLearner = sources.role === "unassigned"
          && !sources.householdOwner
          && !state.cloudUser?.isAnonymous;
        const sharedLearner = learnerPayloadFromSharedRecord(sources.sharedRecord);
        if (sources.role === "parent") {
          applyViewedLearnerRecord(sharedLearner);
          setCloudStatus(sources.sharedRecord?.learnerUid ? "長男の記録" : "本人同期待ち", "online");
          return;
        }
        if (sources.role === "unassigned" && !options.claimLearner && !autoClaimLearner) {
          setCloudStatus("長男を登録", "pending");
          return;
        }
        let merged = currentRecordPayload();
        if (sources.privateRecord && isValidRecordPayload(sources.privateRecord)) {
          merged = mergeRecordPayloads(merged, sources.privateRecord);
        }
        if (sharedLearner && isValidRecordPayload(sharedLearner)) {
          merged = mergeRecordPayloads(merged, sharedLearner);
        }
        applyMergedRecord(merged);
      } else {
        const remote = await window.WeaknessQuizCloud.getRecord(childId);
        if (remote && isValidRecordPayload(remote)) applyMergedRecord(remote);
      }
      await saveCloudRecord({ claimLearner: options.claimLearner || autoClaimLearner });
    } catch (error) {
      setCloudStatus("同期エラー", "error");
      console.error("Cloud load failed", error);
    } finally {
      state.cloudHydrating = false;
    }
  }

  function learnerPayloadFromSharedRecord(record) {
    if (!record?.learnerUid) return null;
    return {
      progress: record.learnerProgress || {},
      stats: record.learnerStats || { daily: {}, packs: {} },
      scratchNotes: {},
      goal: state.goal,
      summary: record.learnerSummary || {}
    };
  }

  function applyViewedLearnerRecord(remote) {
    state.progress = remote?.progress || {};
    state.stats = remote?.stats || { daily: {}, packs: {} };
    state.answers = new Map();
    state.choiceOrders = new Map();
    startQuiz({ skipCloudPull: true });
  }

  function currentRecordPayload() {
    const kanjiRecord = loadRecord(RECORD_KEYS.kanjiProgress, state.activeChildId, null);
    const math4Record = loadRecord(RECORD_KEYS.math4Progress, state.activeChildId, null);
    const eikenVocabulary = loadRecord(RECORD_KEYS.eikenVocabProgress, state.activeChildId, null);
    const eikenExam = loadRecord(RECORD_KEYS.eikenExamProgress, state.activeChildId, null);
    return {
      version: 2,
      app: "junior-high-weakness-quiz",
      child: currentChildProfile(),
      progress: state.progress,
      stats: state.stats,
      scratchNotes: state.scratchNotes,
      goal: state.goal,
      ...(kanjiRecord ? { kanji: kanjiRecord } : {}),
      ...(math4Record ? { math4: math4Record } : {}),
      ...(eikenVocabulary ? { eikenVocabulary } : {}),
      ...(eikenExam ? { eikenExam } : {}),
      summary: learningSummary(),
      updatedAtClient: new Date().toISOString()
    };
  }

  function applyMergedRecord(remote) {
    if (state.activeChildId !== "child-1" && remote.child?.name && typeof remote.child.name === "string") {
      const child = currentChildProfile();
      child.name = remote.child.name.trim().slice(0, 16) || child.name;
      saveChildProfiles();
      buildChildProfileButtons();
    }
    const merged = mergeRecordPayloads(currentRecordPayload(), remote);
    state.progress = merged.progress;
    migratePendingRubricProgress(state.progress);
    state.stats = merged.stats;
    state.scratchNotes = merged.scratchNotes;
    state.goal = merged.goal;
    saveProgress();
    saveStats();
    saveScratchNotes();
    saveGoal();
    if (merged.kanji) {
      localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.kanjiProgress), JSON.stringify(merged.kanji));
    }
    if (merged.math4) {
      localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.math4Progress), JSON.stringify(merged.math4));
    }
    if (merged.eikenVocabulary) {
      localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.eikenVocabProgress), JSON.stringify(merged.eikenVocabulary));
    }
    if (merged.eikenExam) {
      localStorage.setItem(childRecordKey(state.activeChildId, RECORD_KEYS.eikenExamProgress), JSON.stringify(merged.eikenExam));
    }
    startQuiz({ skipCloudPull: true });
  }

  function mergeRecordPayloads(local, remote) {
    const kanji = mergeKanjiProgress(local.kanji, remote.kanji);
    const math4 = mergeMath4Progress(local.math4, remote.math4);
    const eikenVocabulary = mergeEikenVocabProgress(local.eikenVocabulary, remote.eikenVocabulary);
    const eikenExam = mergeEikenExamProgress(local.eikenExam, remote.eikenExam);
    return {
      progress: mergeProgress(local.progress || {}, remote.progress || {}),
      stats: mergeStats(local.stats || { daily: {} }, remote.stats || { daily: {} }),
      scratchNotes: { ...(remote.scratchNotes || {}), ...(local.scratchNotes || {}) },
      goal: mergeGoal(local.goal, remote.goal),
      ...(math4 ? { math4 } : {}),
      ...(kanji ? { kanji } : {}),
      ...(eikenVocabulary ? { eikenVocabulary } : {}),
      ...(eikenExam ? { eikenExam } : {})
    };
  }

  function mergeEikenVocabProgress(localRaw, remoteRaw) {
    if (!localRaw && !remoteRaw) return null;
    const normalize = (raw) => ({
      version: 1,
      deckId: raw?.deckId || "eiken-grade4-vocab",
      startDate: raw?.startDate || "",
      entries: raw?.entries && typeof raw.entries === "object" ? raw.entries : {},
      daily: raw?.daily && typeof raw.daily === "object" ? raw.daily : {},
      updatedAt: raw?.updatedAt || ""
    });
    const left = normalize(localRaw);
    const right = normalize(remoteRaw);
    const merged = normalize({
      deckId: left.deckId || right.deckId,
      startDate: [left.startDate, right.startDate].filter(Boolean).sort()[0] || "",
      updatedAt: [left.updatedAt, right.updatedAt].filter(Boolean).sort().at(-1) || ""
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
          directions: [...new Set([...(a.directions || []), ...(b.directions || [])])],
          correctDays: [...new Set([...(a.correctDays || []), ...(b.correctDays || [])])].sort()
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

  function mergeEikenExamProgress(localRaw, remoteRaw) {
    if (!localRaw && !remoteRaw) return null;
    const normalize = (raw) => ({
      version: 1,
      examId: raw?.examId || "eiken-grade4-exam",
      forms: raw?.forms && typeof raw.forms === "object" ? raw.forms : {},
      active: raw?.active && typeof raw.active === "object" ? raw.active : null,
      updatedAt: raw?.updatedAt || ""
    });
    const left = normalize(localRaw);
    const right = normalize(remoteRaw);
    const merged = normalize({ examId: left.examId || right.examId, forms: {}, active: null });
    for (const formId of new Set([...Object.keys(left.forms), ...Object.keys(right.forms)])) {
      const attempts = [
        ...(Array.isArray(left.forms[formId]?.attempts) ? left.forms[formId].attempts : []),
        ...(Array.isArray(right.forms[formId]?.attempts) ? right.forms[formId].attempts : [])
      ];
      const unique = new Map(attempts.filter((attempt) => attempt?.attemptId).map((attempt) => [attempt.attemptId, attempt]));
      merged.forms[formId] = {
        attempts: [...unique.values()].sort((a, b) => String(a.completedAt || "").localeCompare(String(b.completedAt || "")))
      };
    }
    const completedIds = new Set(Object.values(merged.forms)
      .flatMap((form) => form.attempts || [])
      .map((attempt) => attempt.attemptId));
    merged.active = [left.active, right.active]
      .filter((active) => active?.attemptId && !completedIds.has(active.attemptId))
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0] || null;
    merged.updatedAt = [left.updatedAt, right.updatedAt].filter(Boolean).sort().at(-1) || "";
    return merged;
  }

  // 漢字書き取りモジュール（kanji-app.js）の進捗マージ。
  // ロジックは kanji-app.js の mergeKanjiProgress と同一に保つこと。
  function mergeKanjiProgress(localRaw, remoteRaw) {
    if (!localRaw && !remoteRaw) return null;
    const normalize = (raw) => {
      if (!raw || typeof raw !== "object" || raw.version !== 1) {
        return { version: 1, deckId: (raw && raw.deckId) || "", kanji: {}, daily: {}, updatedAt: "" };
      }
      return {
        ...raw,
        kanji: raw.kanji && typeof raw.kanji === "object" ? raw.kanji : {},
        daily: raw.daily && typeof raw.daily === "object" ? raw.daily : {}
      };
    };
    const a = normalize(localRaw);
    const b = normalize(remoteRaw);
    const out = { version: 1, deckId: a.deckId || b.deckId, kanji: {}, daily: {}, updatedAt: "" };
    Array.from(new Set([...Object.keys(a.kanji), ...Object.keys(b.kanji)])).forEach((char) => {
      const ra = a.kanji[char];
      const rb = b.kanji[char];
      if (!ra || !rb) { out.kanji[char] = { ...(ra || rb) }; return; }
      const newer = (rb.lastSeenAt || "") > (ra.lastSeenAt || "") ? rb : ra;
      out.kanji[char] = {
        attempts: Math.max(ra.attempts || 0, rb.attempts || 0),
        traceClears: Math.max(ra.traceClears || 0, rb.traceClears || 0),
        memoryClears: Math.max(ra.memoryClears || 0, rb.memoryClears || 0),
        memoryFails: Math.max(ra.memoryFails || 0, rb.memoryFails || 0),
        stars: Math.max(ra.stars || 0, rb.stars || 0),
        misses: Math.max(ra.misses || 0, rb.misses || 0),
        clearDays: newer.clearDays || 0,
        lastClearDay: newer.lastClearDay || "",
        stage: newer.stage || 0,
        reviewDueAt: newer.reviewDueAt || "",
        masteredAt: newer.masteredAt || "",
        graduatedAt: newer.graduatedAt || "",
        lastPracticedDay: [
          ra.lastPracticedDay || ra.firstSeenAt || "",
          rb.lastPracticedDay || rb.firstSeenAt || ""
        ].sort().slice(-1)[0] || "",
        firstSeenAt: [ra.firstSeenAt, rb.firstSeenAt].filter(Boolean).sort()[0] || "",
        lastSeenAt: (rb.lastSeenAt || "") > (ra.lastSeenAt || "") ? rb.lastSeenAt : (ra.lastSeenAt || "")
      };
    });
    Array.from(new Set([...Object.keys(a.daily), ...Object.keys(b.daily)])).forEach((day) => {
      const da = a.daily[day] || {};
      const db = b.daily[day] || {};
      out.daily[day] = {
        newLearned: Math.max(da.newLearned || 0, db.newLearned || 0),
        reviewsCleared: Math.max(da.reviewsCleared || 0, db.reviewsCleared || 0),
        memoryClears: Math.max(da.memoryClears || 0, db.memoryClears || 0),
        attempts: Math.max(da.attempts || 0, db.attempts || 0)
      };
    });
    out.updatedAt = (b.updatedAt || "") > (a.updatedAt || "") ? b.updatedAt : (a.updatedAt || "");
    return out;
  }

  // かけ算・わり算モジュール（math4-app.js）の進捗マージ。
  // ロジックは math4-app.js の mergeMath4Progress と同一に保つこと。
  const MATH4_LEVEL_IDS = ["mult1", "mult2", "div1"];
  function mergeMath4Progress(localRaw, remoteRaw) {
    if (!localRaw && !remoteRaw) return null;
    const emptyLevel = () => ({ solved: 0, clean: 0, streak: 0, bestStreak: 0, sessionsDone: 0, lastSessionDay: "" });
    const normalize = (raw) => {
      if (!raw || typeof raw !== "object" || raw.version !== 1) {
        const levels = {};
        MATH4_LEVEL_IDS.forEach((id) => { levels[id] = emptyLevel(); });
        return { version: 1, facts: {}, levels, daily: {}, updatedAt: "" };
      }
      const levels = raw.levels && typeof raw.levels === "object" ? raw.levels : {};
      MATH4_LEVEL_IDS.forEach((id) => { if (!levels[id]) levels[id] = emptyLevel(); });
      return {
        ...raw,
        facts: raw.facts && typeof raw.facts === "object" ? raw.facts : {},
        levels,
        daily: raw.daily && typeof raw.daily === "object" ? raw.daily : {}
      };
    };
    const a = normalize(localRaw);
    const b = normalize(remoteRaw);
    const out = { version: 1, facts: {}, levels: {}, daily: {}, updatedAt: "" };
    Array.from(new Set([...Object.keys(a.facts), ...Object.keys(b.facts)])).forEach((id) => {
      const ra = a.facts[id];
      const rb = b.facts[id];
      if (!ra || !rb) { out.facts[id] = { ...(ra || rb) }; return; }
      const newer = (rb.lastSeenAt || "") > (ra.lastSeenAt || "") ? rb : ra;
      out.facts[id] = {
        attempts: Math.max(ra.attempts || 0, rb.attempts || 0),
        correct: Math.max(ra.correct || 0, rb.correct || 0),
        misses: Math.max(ra.misses || 0, rb.misses || 0),
        clearDays: newer.clearDays || 0,
        lastClearDay: newer.lastClearDay || "",
        stage: newer.stage || 0,
        reviewDueAt: newer.reviewDueAt || "",
        masteredAt: newer.masteredAt || "",
        firstSeenAt: [ra.firstSeenAt, rb.firstSeenAt].filter(Boolean).sort()[0] || "",
        lastSeenAt: (rb.lastSeenAt || "") > (ra.lastSeenAt || "") ? rb.lastSeenAt : (ra.lastSeenAt || "")
      };
    });
    MATH4_LEVEL_IDS.forEach((id) => {
      const la = a.levels[id] || emptyLevel();
      const lb = b.levels[id] || emptyLevel();
      out.levels[id] = {
        solved: Math.max(la.solved || 0, lb.solved || 0),
        clean: Math.max(la.clean || 0, lb.clean || 0),
        streak: Math.max(la.streak || 0, lb.streak || 0),
        bestStreak: Math.max(la.bestStreak || 0, lb.bestStreak || 0),
        sessionsDone: Math.max(la.sessionsDone || 0, lb.sessionsDone || 0),
        lastSessionDay: [la.lastSessionDay, lb.lastSessionDay].filter(Boolean).sort().slice(-1)[0] || ""
      };
    });
    Array.from(new Set([...Object.keys(a.daily), ...Object.keys(b.daily)])).forEach((day) => {
      const da = a.daily[day] || {};
      const db = b.daily[day] || {};
      out.daily[day] = {
        kukuNew: Math.max(da.kukuNew || 0, db.kukuNew || 0),
        kukuClears: Math.max(da.kukuClears || 0, db.kukuClears || 0),
        writtenSolved: Math.max(da.writtenSolved || 0, db.writtenSolved || 0),
        writtenClean: Math.max(da.writtenClean || 0, db.writtenClean || 0)
      };
    });
    out.updatedAt = (b.updatedAt || "") > (a.updatedAt || "") ? b.updatedAt : (a.updatedAt || "");
    return out;
  }

  function mergeGoal(localGoal, remoteGoal) {
    const local = normalizeGoal(localGoal);
    const remote = normalizeGoal(remoteGoal);
    const localTime = Date.parse(local.updatedAt || "") || 0;
    const remoteTime = Date.parse(remote.updatedAt || "") || 0;
    const base = remoteTime > localTime ? remote : local;
    const mockScores = [...remote.mockScores, ...local.mockScores].reduce((acc, score) => {
      const key = `${score.date}:${score.score}:${score.note}`;
      if (!acc.seen.has(key)) {
        acc.seen.add(key);
        acc.items.push(score);
      }
      return acc;
    }, { seen: new Set(), items: [] }).items;
    return normalizeGoal({ ...base, mockScores });
  }

  function mergeProgress(local, remote) {
    const merged = {};
    Array.from(new Set([...Object.keys(remote), ...Object.keys(local)])).forEach((id) => {
      const localRecord = local[id] || {};
      const remoteRecord = remote[id] || {};
      const latest = newerRecord(localRecord, remoteRecord);
      const reviewNeeded = Boolean(latest.needsReview);
      merged[id] = {
        ...remoteRecord,
        ...localRecord,
        correct: Math.max(localRecord.correct || 0, remoteRecord.correct || 0),
        wrong: Math.max(localRecord.wrong || 0, remoteRecord.wrong || 0),
        skipped: Math.max(localRecord.skipped || 0, remoteRecord.skipped || 0),
        consecutiveCorrect: latest.consecutiveCorrect || 0,
        mastered: reviewNeeded ? false : Boolean(latest.mastered),
        needsReview: reviewNeeded,
        reviewDueAt: reviewNeeded ? (latest.reviewDueAt || "") : "",
        masteredAt: reviewNeeded ? "" : (latest.masteredAt || ""),
        lastAnsweredAt: latest.lastAnsweredAt || localRecord.lastAnsweredAt || remoteRecord.lastAnsweredAt
      };
      const hasPackProgress = localRecord.packFirstAttemptRecorded
        || remoteRecord.packFirstAttemptRecorded
        || localRecord.packAttempts
        || remoteRecord.packAttempts;
      if (hasPackProgress) {
        const firstAttemptSource = firstPackAttemptRecord(localRecord, remoteRecord);
        Object.assign(merged[id], {
          packAttempts: Math.max(localRecord.packAttempts || 0, remoteRecord.packAttempts || 0),
          packCorrect: Math.max(localRecord.packCorrect || 0, remoteRecord.packCorrect || 0),
          packWrong: Math.max(localRecord.packWrong || 0, remoteRecord.packWrong || 0),
          packUnknown: Math.max(localRecord.packUnknown || 0, remoteRecord.packUnknown || 0),
          packFirstAttemptRecorded: Boolean(firstAttemptSource.packFirstAttemptRecorded),
          packFirstAttemptCorrect: firstAttemptSource.packFirstAttemptPendingReview
            ? null
            : Boolean(firstAttemptSource.packFirstAttemptCorrect),
          packFirstAttemptPendingReview: Boolean(firstAttemptSource.packFirstAttemptPendingReview),
          packFirstAttemptAt: firstAttemptSource.packFirstAttemptAt || "",
          packFirstAttemptId: firstAttemptSource.packFirstAttemptId || "",
          packFirstAttemptSequence: Number(firstAttemptSource.packFirstAttemptSequence) || 0,
          packConsecutiveCorrect: Number(latest.packConsecutiveCorrect) || 0,
          packMastered: reviewNeeded ? false : Boolean(latest.packMastered),
          // answerSequence is local to each device. Max is conservative: it avoids
          // shortening a cooldown after sync without pretending the sequences add up.
          packCooldown: Math.max(localRecord.packCooldown || 0, remoteRecord.packCooldown || 0),
          packTier: latest.packTier || localRecord.packTier || remoteRecord.packTier || "",
          packLastAnswerSequence: Math.max(localRecord.packLastAnswerSequence || 0, remoteRecord.packLastAnswerSequence || 0),
          packLastSessionId: latest.packLastSessionId || "",
          packLastCorrectSessionId: latest.packLastCorrectSessionId || "",
          packQuestionSnapshot: latest.packQuestionSnapshot || localRecord.packQuestionSnapshot || remoteRecord.packQuestionSnapshot,
          packPendingWritten: Boolean(latest.packPendingWritten),
          lastAnswerWasUnknown: Boolean(latest.lastAnswerWasUnknown)
        });
      }
      if (latest.mistakeType) merged[id].mistakeType = latest.mistakeType;
      if (latest.lastWrongInput) merged[id].lastWrongInput = latest.lastWrongInput;
      if (latest.lastWrittenResponse) {
        merged[id].lastWrittenResponse = latest.lastWrittenResponse;
        merged[id].lastWrittenRubricChecks = Array.isArray(latest.lastWrittenRubricChecks)
          ? latest.lastWrittenRubricChecks.slice()
          : [];
        merged[id].lastWrittenSelfAssessedCorrect = Boolean(latest.lastWrittenSelfAssessedCorrect);
        merged[id].lastWrittenPendingReview = Boolean(latest.lastWrittenPendingReview);
        merged[id].lastWrittenPrompt = latest.lastWrittenPrompt || "";
        merged[id].lastWrittenAt = latest.lastWrittenAt || latest.lastAnsweredAt || "";
      }
      if (latest.lastDifficulty) merged[id].lastDifficulty = latest.lastDifficulty;
      if (latest.lastFormatTag) merged[id].lastFormatTag = latest.lastFormatTag;
    });
    return merged;
  }

  function firstPackAttemptRecord(localRecord, remoteRecord) {
    if (localRecord.packFirstAttemptRecorded && !remoteRecord.packFirstAttemptRecorded) return localRecord;
    if (remoteRecord.packFirstAttemptRecorded && !localRecord.packFirstAttemptRecorded) return remoteRecord;
    if (!localRecord.packFirstAttemptRecorded && !remoteRecord.packFirstAttemptRecorded) return {};
    const stableOrder = comparePackFirstAttempts(localRecord, remoteRecord);
    if (stableOrder !== 0) return stableOrder < 0 ? localRecord : remoteRecord;
    if (localRecord.packFirstAttemptCorrect !== remoteRecord.packFirstAttemptCorrect) {
      return localRecord.packFirstAttemptCorrect === false ? localRecord : remoteRecord;
    }
    return localRecord;
  }

  function newerRecord(a, b) {
    const aTime = Date.parse(a.lastAnsweredAt || "") || 0;
    const bTime = Date.parse(b.lastAnsweredAt || "") || 0;
    return aTime >= bTime ? a : b;
  }

  function mergeStats(local, remote) {
    const mergePackAuthorMastery = (localMastery, remoteMastery) => {
      const localEntries = localMastery && typeof localMastery === "object" ? localMastery : {};
      const remoteEntries = remoteMastery && typeof remoteMastery === "object" ? remoteMastery : {};
      const merged = {};
      Array.from(new Set([...Object.keys(remoteEntries), ...Object.keys(localEntries)])).forEach((key) => {
        const localEntry = localEntries[key];
        const remoteEntry = remoteEntries[key];
        if (!localEntry) {
          merged[key] = remoteEntry;
          return;
        }
        if (!remoteEntry) {
          merged[key] = localEntry;
          return;
        }
        const latestResetMs = Math.max(
          Date.parse(localEntry.resetAt || "") || 0,
          Date.parse(remoteEntry.resetAt || "") || 0
        );
        // A device that has not seen the latest reset may carry pre-reset evidence
        // inside its arrays. Keep merges conservative until both sides share it.
        const eligible = [localEntry, remoteEntry].filter((entry) => {
          const entryResetMs = Date.parse(entry.resetAt || "") || 0;
          return latestResetMs === 0 || entryResetMs >= latestResetMs;
        });
        const directions = Array.from(new Set(eligible.flatMap((entry) => entry.directions || [])));
        const sessionIds = Array.from(new Set(eligible.flatMap((entry) => entry.sessionIds || [])));
        const requiredDirections = Math.max(...eligible.map((entry) => Number(entry.requiredDirections) || 2), 2);
        const requiredSessions = Math.max(...eligible.map((entry) => Number(entry.requiredSessions) || 2), 2);
        const requireAuthorInput = eligible.some((entry) => entry.requireAuthorInput === true);
        const authorInputCorrect = eligible.some((entry) => entry.authorInputCorrect === true);
        const lastAnsweredAt = eligible
          .map((entry) => entry.lastAnsweredAt || "")
          .sort((left, right) => (Date.parse(right) || 0) - (Date.parse(left) || 0))[0] || "";
        merged[key] = {
          directions,
          sessionIds,
          authorInputCorrect,
          mastered: directions.length >= requiredDirections
            && sessionIds.length >= requiredSessions
            && (!requireAuthorInput || authorInputCorrect),
          resetAt: latestResetMs ? new Date(latestResetMs).toISOString() : "",
          lastAnsweredAt,
          requiredDirections,
          requiredSessions,
          requireAuthorInput
        };
      });
      return merged;
    };
    const daily = {};
    const localDaily = local.daily || {};
    const remoteDaily = remote.daily || {};
    Array.from(new Set([...Object.keys(remoteDaily), ...Object.keys(localDaily)])).forEach((key) => {
      const localDay = localDaily[key] || {};
      const remoteDay = remoteDaily[key] || {};
      daily[key] = {
        answered: Math.max(localDay.answered || 0, remoteDay.answered || 0),
        correct: Math.max(localDay.correct || 0, remoteDay.correct || 0),
        sessions: Math.max(localDay.sessions || 0, remoteDay.sessions || 0)
      };
    });
    const packs = {};
    const localPacks = local.packs || {};
    const remotePacks = remote.packs || {};
    Array.from(new Set([...Object.keys(remotePacks), ...Object.keys(localPacks)])).forEach((packId) => {
      let localPack = localPacks[packId] || {};
      let remotePack = remotePacks[packId] || {};
      const localContentVersion = Math.max(1, Number(localPack.contentVersion) || 1);
      const remoteContentVersion = Math.max(1, Number(remotePack.contentVersion) || 1);
      const contentVersion = Math.max(localContentVersion, remoteContentVersion);
      if (localContentVersion < contentVersion) localPack = {};
      if (remoteContentVersion < contentVersion) remotePack = {};
      const localPackExists = Object.keys(localPack).length > 0;
      const remotePackExists = Object.keys(remotePack).length > 0;
      const metricsCompatible = (!localPackExists || Number(localPack.unlockMetricVersion) === PACK_UNLOCK_METRIC_VERSION)
        && (!remotePackExists || Number(remotePack.unlockMetricVersion) === PACK_UNLOCK_METRIC_VERSION);
      const newest = (Number(localPack.answerSequence) || 0) >= (Number(remotePack.answerSequence) || 0)
        ? localPack
        : remotePack;
      const packDaily = {};
      const localPackDaily = localPack.daily || {};
      const remotePackDaily = remotePack.daily || {};
      Array.from(new Set([...Object.keys(remotePackDaily), ...Object.keys(localPackDaily)])).forEach((key) => {
        const localDay = localPackDaily[key] || {};
        const remoteDay = remotePackDaily[key] || {};
        packDaily[key] = {
          answered: Math.max(localDay.answered || 0, remoteDay.answered || 0),
          correct: Math.max(localDay.correct || 0, remoteDay.correct || 0),
          sessions: Math.max(localDay.sessions || 0, remoteDay.sessions || 0)
        };
      });
      packs[packId] = {
        ...remotePack,
        ...localPack,
        // Per-device sequences are not additive; max keeps cooldown behavior conservative.
        answerSequence: Math.max(localPack.answerSequence || 0, remotePack.answerSequence || 0),
        sessionCounter: Math.max(localPack.sessionCounter || 0, remotePack.sessionCounter || 0),
        answered: Math.max(localPack.answered || 0, remotePack.answered || 0),
        correct: Math.max(localPack.correct || 0, remotePack.correct || 0),
        sessions: Math.max(localPack.sessions || 0, remotePack.sessions || 0),
        daily: packDaily,
        authorMastery: mergePackAuthorMastery(localPack.authorMastery, remotePack.authorMastery),
        contentVersion,
        unlockMetricVersion: metricsCompatible ? PACK_UNLOCK_METRIC_VERSION : 0,
        coreEarlyAccuracy: metricsCompatible
          ? newest.coreEarlyAccuracy ?? localPack.coreEarlyAccuracy ?? remotePack.coreEarlyAccuracy
          : undefined,
        challengeRecommended: metricsCompatible
          && Boolean(localPack.challengeRecommended || remotePack.challengeRecommended),
        finalRecommended: metricsCompatible
          && Boolean(localPack.finalRecommended || remotePack.finalRecommended),
        maxRecommended: metricsCompatible
          && Boolean(localPack.maxRecommended || remotePack.maxRecommended),
        challengeRecommendedAt: metricsCompatible
          ? localPack.challengeRecommendedAt || remotePack.challengeRecommendedAt || ""
          : "",
        finalRecommendedAt: metricsCompatible
          ? localPack.finalRecommendedAt || remotePack.finalRecommendedAt || ""
          : "",
        maxRecommendedAt: metricsCompatible
          ? localPack.maxRecommendedAt || remotePack.maxRecommendedAt || ""
          : ""
      };
    });
    return { ...remote, ...local, daily, packs };
  }

  function formatTime(date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function scrollQuestionIntoView(target = els.questionCard, focusPrompt = target === els.questionCard) {
    if (!target || typeof target.scrollIntoView !== "function") return;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (focusPrompt && els.prompt.textContent) els.prompt.focus({ preventScroll: true });
    });
  }

  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      els.modeButtons.forEach((item) => item.classList.toggle("active", item === button));
      startQuiz();
    });
  });

  els.newQuiz.addEventListener("click", () => {
    if (isPackMode()) state.packReviewOnly = false;
    startQuiz();
  });
  els.prevQuestion.addEventListener("click", () => {
    if (state.index > 0) {
      state.index -= 1;
      renderQuestion();
      scrollQuestionIntoView();
    }
  });
  els.cloudSignIn.addEventListener("click", async () => {
    if (!state.cloudAvailable || !window.WeaknessQuizCloud) return;
    setCloudStatus("ログイン中", "pending");
    try {
      await window.WeaknessQuizCloud.signInWithGoogle();
    } catch (error) {
      setCloudStatus("ログイン失敗", "error");
      console.error("Cloud sign-in failed", error);
    }
  });
  els.cloudSignOut.addEventListener("click", async () => {
    if (!window.WeaknessQuizCloud) return;
    flushCloudSave();
    await window.WeaknessQuizCloud.signOut();
  });
  els.editGoal.addEventListener("click", editExamGoal);
  els.addMockScore.addEventListener("click", addMockScoreRecord);
  els.syncNow.addEventListener("click", async () => {
    flushCloudSave();
    await pullCloudRecordForActiveChild({
      claimLearner: isChallengeCoursePack() && state.cloudRole === "unassigned"
    });
  });
  els.nextQuestion.addEventListener("click", () => {
    if (state.index < state.quiz.length - 1) {
      state.index += 1;
      renderQuestion();
      scrollQuestionIntoView();
      return;
    }
    showSummary();
    scrollQuestionIntoView(els.summary);
  });
  els.unknownAnswer.addEventListener("click", answerUnknownQuestion);
  els.packTierButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tier = button.dataset.packTier;
      if (!isPackMode() || !availablePackTiers().includes(tier)) return;
      state.packTier = tier;
      state.packReviewOnly = false;
      startQuiz();
      scrollQuestionIntoView();
    });
  });
  els.packStart.addEventListener("click", () => {
    if (!isPackMode()) return;
    state.packReviewOnly = false;
    startQuiz();
    scrollQuestionIntoView();
  });
  els.packReview.addEventListener("click", () => {
    if (!isPackMode()) return;
    state.packReviewOnly = true;
    startQuiz();
    scrollQuestionIntoView();
  });
  els.packLevelUp.addEventListener("click", () => {
    if (!isPackMode()) return;
    const tiers = availablePackTiers();
    const nextTier = tiers[tiers.indexOf(state.packTier) + 1];
    if (!nextTier) return;
    state.packTier = nextTier;
    state.packReviewOnly = false;
    startQuiz();
    scrollQuestionIntoView();
  });
  function returnToPackHome() {
    if (/^challenge-(?:social|science)-/.test(String(state.packId))) {
      const reviewCategory = new URLSearchParams(window.location.search).get(PACK_REVIEW_CATEGORY_ROUTE_PARAM);
      const reviewRoute = state.packReviewAllTiers && ["social", "science"].includes(reviewCategory)
        ? `&review=${encodeURIComponent(reviewCategory)}`
        : "";
      window.location.href = `challenge.html?child=${encodeURIComponent(state.activeChildId)}${reviewRoute}`;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete(CHILD_ROUTE_PARAM);
    url.searchParams.delete(PACK_ROUTE_PARAM);
    url.searchParams.delete(PACK_CORNER_ROUTE_PARAM);
    url.searchParams.delete(PACK_UNIT_ROUTE_PARAM);
    url.searchParams.delete("view");
    url.hash = "";
    window.location.href = `${url.pathname}${url.search}`;
  }

  function advanceQuizOnlyStep() {
    if (!isQuizOnlyMode()) return;
    if (state.packReviewAllTiers) {
      returnToPackHome();
      return;
    }
    const tiers = availablePackTiers().filter((tier) => tier !== "max");
    const tierIndex = tiers.indexOf(state.packTier);
    const nextTier = tierIndex >= 0 ? tiers[tierIndex + 1] : "";
    if (nextTier) {
      state.packTier = nextTier;
    } else {
      const corners = packCorners().filter((corner) => corner?.enabled !== false);
      const cornerIndex = corners.findIndex((corner) => corner.id === state.packCorner);
      const nextCorner = cornerIndex >= 0 ? corners[cornerIndex + 1] : null;
      if (!nextCorner) return;
      state.packCorner = nextCorner.id;
      state.packTier = availablePackTiers()[0] || "core";
      updatePackCornerRoute();
    }
    state.packReviewOnly = false;
    startQuiz();
    scrollQuestionIntoView();
  }

  els.packHome.addEventListener("click", returnToPackHome);
  els.quizOnlyHome?.addEventListener("click", returnToPackHome);
  els.quizOnlyRetry?.addEventListener("click", () => {
    if (!isQuizOnlyMode()) return;
    state.packReviewOnly = state.packReviewAllTiers;
    startQuiz();
    scrollQuestionIntoView();
  });
  els.quizOnlyAdvance?.addEventListener("click", advanceQuizOnlyStep);
  els.exportProgress.addEventListener("click", exportRecords);
  els.importProgress.addEventListener("click", () => els.importProgressFile.click());
  els.importProgressFile.addEventListener("change", () => importRecordsFromFile(els.importProgressFile.files[0]));
  els.resetProgress.addEventListener("click", () => {
    if (!confirm(`${currentChildProfile().name}の解答記録と連続日数をリセットしますか。`)) return;
    state.progress = {};
    state.stats = { daily: {} };
    state.scratchNotes = {};
    saveProgress();
    saveStats();
    saveScratchNotes();
    renderExamDashboard();
    startQuiz();
  });
  els.backToHome.addEventListener("click", () => showHomeScreen());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pausePackTimer();
    } else {
      resumePackTimer();
    }
  });
  window.addEventListener("pagehide", pausePackTimer);
  window.addEventListener("pageshow", resumePackTimer);
  window.addEventListener("resize", scheduleResponsiveMathLayoutFit);
  window.visualViewport?.addEventListener("resize", scheduleResponsiveMathLayoutFit);
  window.addEventListener("popstate", () => {
    const childId = childIdFromUrl();
    if (childId) {
      openChildPage(childId, false);
    } else {
      showHomeScreen(false);
    }
  });

  document.body.classList.toggle("pack-mode", isPackMode());
  if (isPackMode()) document.title = state.packConfig.shortTitle || state.packConfig.title || document.title;
  initializeCloudSync();
  renderHomeScreen();
  if (state.hasSelectedChild) {
    openChildPage(state.activeChildId, false);
  } else {
    showHomeScreen(false);
  }
})();
