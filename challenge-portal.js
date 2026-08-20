(function () {
  "use strict";

  const childId = new URLSearchParams(window.location.search).get("child") || "child-1";
  const requestedReviewCategory = new URLSearchParams(window.location.search).get("review") || "";
  let progress = readRecord("progress", {});
  let stats = readRecord("stats", { daily: {}, packs: {} });
  const courses = [
    {
      id: "challenge-social-geography",
      shortId: "geo",
      category: "social",
      label: "地理",
      emoji: "🌏",
      total: 180,
      units: [
        ["geo-01", "世界の地域構成"],
        ["geo-02", "日本の地域構成"],
        ["geo-03", "世界の生活と環境"],
        ["geo-04", "アジア州"],
        ["geo-05", "ヨーロッパ・アフリカ"],
        ["geo-06", "アメリカ・オセアニア"],
        ["geo-07", "地域調査"],
        ["geo-08", "日本の自然・人口"],
        ["geo-09", "資源・産業・結びつき"],
        ["geo-10", "九州・中国四国"],
        ["geo-11", "近畿・中部"],
        ["geo-12", "関東・東北・北海道"]
      ]
    },
    {
      id: "challenge-social-history",
      shortId: "his",
      category: "social",
      label: "歴史",
      emoji: "🏯",
      total: 216,
      units: [
        ["his-13", "文明のおこり"],
        ["his-14", "古代国家と東アジア"],
        ["his-15", "中世の日本"],
        ["his-16", "天下統一"],
        ["his-17", "近世の日本"],
        ["his-18", "開国と近代世界"],
        ["his-19", "近代の日本"],
        ["his-20", "二度の世界大戦"],
        ["his-21", "現代の日本と世界"]
      ]
    },
    {
      id: "challenge-social-civics",
      shortId: "civ",
      category: "social",
      label: "公民",
      emoji: "🏛️",
      total: 192,
      units: [
        ["civ-22", "現代社会"],
        ["civ-23", "憲法と基本的人権"],
        ["civ-24", "民主政治と国会"],
        ["civ-25", "内閣・裁判所"],
        ["civ-26", "地方自治"],
        ["civ-27", "くらしと経済"],
        ["civ-28", "国民生活と福祉"],
        ["civ-29", "国際社会と世界平和"]
      ]
    },
    {
      id: "challenge-science-year1",
      shortId: "sci1",
      category: "science",
      label: "1年",
      emoji: "🧪",
      total: 192,
      units: [
        ["sci1-01", "光と音"],
        ["sci1-02", "力のはたらき"],
        ["sci1-03", "物質と水溶液"],
        ["sci1-04", "状態変化と気体"],
        ["sci1-05", "植物のなかま"],
        ["sci1-06", "動物のなかま"],
        ["sci1-07", "火山と地震"],
        ["sci1-08", "大地の変化"]
      ]
    },
    {
      id: "challenge-science-year2",
      shortId: "sci2",
      category: "science",
      label: "2年",
      emoji: "⚡",
      total: 240,
      units: [
        ["sci2-09", "電流の性質"],
        ["sci2-10", "電力量と電子"],
        ["sci2-11", "電流と磁界"],
        ["sci2-12", "分解と原子・分子"],
        ["sci2-13", "化学変化と質量"],
        ["sci2-14", "植物のはたらき"],
        ["sci2-15", "細胞・消化と吸収"],
        ["sci2-16", "血液・循環と反応"],
        ["sci2-17", "気象観測と水蒸気"],
        ["sci2-18", "前線と天気の変化"]
      ]
    }
  ];
  const categories = [
    { id: "social", label: "社会", emoji: "🌏" },
    { id: "science", label: "理科", emoji: "🧪" },
    { id: "stats", label: "きろく", emoji: "📊" }
  ];

  const grid = document.getElementById("portalAppGrid");
  const toolbar = document.getElementById("portalToolbar");
  const toolbarTitle = document.getElementById("portalToolbarTitle");
  const back = document.getElementById("portalBack");
  const statsView = document.getElementById("portalStats");
  const share = document.getElementById("portalShare");
  const shareForm = document.getElementById("portalShareForm");
  const partnerEmail = document.getElementById("portalPartnerEmail");
  const shareError = document.getElementById("portalShareError");
  const shareCancel = document.getElementById("portalShareCancel");
  const cloudButton = document.getElementById("portalCloudButton");
  const cloudLabel = document.getElementById("portalCloudLabel");
  const cloud = window.WeaknessQuizCloud;
  const cloudState = {
    available: false,
    user: null,
    householdId: "",
    householdOwner: false,
    role: "none",
    status: "Google",
    deviceTotal: 0,
    sharedTotal: 0,
    learnerEmail: "",
    learnerUpdatedAt: ""
  };
  let categoryId = "";
  let courseId = "";

  function safeJson(value, fallback) {
    try {
      return JSON.parse(value) || fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function readRecord(name, fallback) {
    try {
      const current = localStorage.getItem(`weaknessQuiz:${childId}:${name}`);
      if (current) return safeJson(current, fallback);
      if (childId === "child-1") {
        const legacy = name === "progress" ? "weaknessQuizProgress" : name === "stats" ? "weaknessQuizStats" : "";
        if (legacy) return safeJson(localStorage.getItem(legacy), fallback);
      }
    } catch (_error) {
      // 記録が読めなくてもクイズ選択は続ける。
    }
    return fallback;
  }

  function wasAttempted(record) {
    return Boolean(record?.packFirstAttemptRecorded || Number(record?.packAttempts) > 0);
  }

  function unitStatus(unitId) {
    const entries = Object.entries(progress).filter(([id]) => id.startsWith(`challenge-${unitId}-`));
    if (entries.length && entries.every(([, record]) => record?.packMastered)) return "mastered";
    if (entries.some(([, record]) => wasAttempted(record))) return "started";
    return "";
  }

  function courseStatus(course) {
    const statuses = course.units.map(([unitId]) => unitStatus(unitId));
    if (statuses.length && statuses.every((status) => status === "mastered")) return "mastered";
    if (statuses.some(Boolean)) return "started";
    return "";
  }

  function courseSummary(course) {
    const entries = Object.entries(progress).filter(([id]) => id.startsWith(`challenge-${course.shortId}-`));
    const attempted = entries.filter(([, record]) => wasAttempted(record));
    const graded = attempted.filter(([, record]) => typeof record?.packFirstAttemptCorrect === "boolean");
    const meta = stats.packs?.[course.id] || {};
    return {
      ...course,
      attempted: attempted.length,
      mastered: entries.filter(([, record]) => record?.packMastered).length,
      graded: graded.length,
      firstCorrect: graded.filter(([, record]) => record.packFirstAttemptCorrect).length,
      totalAttempts: Number(meta.answered) || attempted.reduce((sum, [, record]) => sum + (Number(record?.packAttempts) || 0), 0),
      daily: meta.daily || {}
    };
  }

  function unitReviewSummary(course, unitId) {
    const answerSequence = Number(stats.packs?.[course.id]?.answerSequence) || 0;
    const records = Object.entries(progress)
      .filter(([id, record]) => id.startsWith(`challenge-${unitId}-`) && record?.needsReview)
      .map(([, record]) => record);
    const ready = records.filter((record) => answerSequence >= (Number(record.packCooldown) || 0)).length;
    return { total: records.length, ready, cooling: records.length - ready };
  }

  function categoryReviewCount(selectedCategoryId) {
    return courses
      .filter((course) => course.category === selectedCategoryId)
      .reduce((total, course) => total + course.units.reduce((sum, [unitId]) => (
        sum + unitReviewSummary(course, unitId).total
      ), 0), 0);
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function combinedDaily(summaries) {
    const daily = {};
    summaries.forEach((course) => {
      Object.entries(course.daily).forEach(([key, value]) => {
        daily[key] ||= { answered: 0 };
        daily[key].answered += Number(value?.answered) || 0;
      });
    });
    return daily;
  }

  function currentStreak(daily) {
    const cursor = new Date();
    if (!(daily[dateKey(cursor)]?.answered > 0)) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (daily[dateKey(cursor)]?.answered > 0) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function courseUrl(course, unitId, options = {}) {
    const url = new URL("./", window.location.href);
    url.search = "";
    url.searchParams.set("child", childId);
    url.searchParams.set("pack", course.id);
    url.searchParams.set("unit", unitId);
    url.searchParams.set("view", "quiz");
    if (options.review) {
      url.searchParams.set("review", "1");
      url.searchParams.set("reviewCategory", course.category);
    }
    return `${url.pathname}${url.search}`;
  }

  function makeApp({ label, emoji, number, badge = "", status = "", kind, href, onClick, disabled = false }) {
    const item = document.createElement(href ? "a" : "button");
    item.className = `portal-app portal-app-${kind}${status ? ` is-${status}` : ""}`;
    if (href) item.href = href;
    else item.type = "button";
    if (disabled && !href) item.disabled = true;
    if (onClick) item.addEventListener("click", onClick);
    item.setAttribute("aria-label", label);

    const icon = document.createElement("span");
    icon.className = "portal-app-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = number || emoji;
    if (status) {
      const mark = document.createElement("span");
      mark.className = "portal-app-status";
      mark.textContent = status === "mastered" ? "✓" : "•";
      icon.appendChild(mark);
    }
    if (badge) {
      const count = document.createElement("span");
      count.className = "portal-app-count";
      count.textContent = badge;
      icon.appendChild(count);
    }

    const name = document.createElement("span");
    name.className = "portal-app-label";
    name.textContent = label;
    item.append(icon, name);
    return item;
  }

  function setToolbar(title) {
    const visible = Boolean(title);
    toolbar.classList.toggle("hidden", !visible);
    toolbarTitle.textContent = title;
  }

  function showAppGrid() {
    grid.classList.remove("hidden");
    statsView.classList.add("hidden");
  }

  function updateCloudButton() {
    const signedIn = Boolean(cloudState.user);
    cloudButton.classList.toggle("is-signed-in", signedIn);
    cloudButton.setAttribute("aria-label", signedIn ? `Google同期：${cloudState.status}` : "Googleにログイン");
    cloudButton.firstElementChild.textContent = signedIn ? "☁️" : "G";
    cloudLabel.textContent = signedIn ? cloudState.status : "ログイン";
  }

  function mergeProgress(local, remote) {
    const merged = {};
    const numericKeys = ["correct", "wrong", "skipped", "packAttempts", "packCorrect", "packWrong", "packUnknown", "packCooldown", "packLastAnswerSequence"];
    Array.from(new Set([...Object.keys(remote || {}), ...Object.keys(local || {})])).forEach((id) => {
      const a = local?.[id] || {};
      const b = remote?.[id] || {};
      const aTime = Date.parse(a.lastAnsweredAt || "") || 0;
      const bTime = Date.parse(b.lastAnsweredAt || "") || 0;
      const latest = bTime > aTime ? b : a;
      const older = latest === a ? b : a;
      const record = { ...older, ...latest };
      numericKeys.forEach((key) => {
        if (key in a || key in b) record[key] = Math.max(Number(a[key]) || 0, Number(b[key]) || 0);
      });
      if (a.packFirstAttemptRecorded || b.packFirstAttemptRecorded) {
        const candidates = [a, b].filter((item) => item.packFirstAttemptRecorded);
        candidates.sort((left, right) => (Date.parse(left.packFirstAttemptAt || "") || Infinity) - (Date.parse(right.packFirstAttemptAt || "") || Infinity));
        const first = candidates[0];
        record.packFirstAttemptRecorded = true;
        record.packFirstAttemptCorrect = first.packFirstAttemptCorrect;
        record.packFirstAttemptAt = first.packFirstAttemptAt || "";
      }
      merged[id] = record;
    });
    return merged;
  }

  function mergeDaily(local, remote) {
    const merged = {};
    Array.from(new Set([...Object.keys(remote || {}), ...Object.keys(local || {})])).forEach((day) => {
      const a = local?.[day] || {};
      const b = remote?.[day] || {};
      const item = { ...b, ...a };
      Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).forEach((key) => {
        if (typeof a[key] === "number" || typeof b[key] === "number") item[key] = Math.max(Number(a[key]) || 0, Number(b[key]) || 0);
      });
      merged[day] = item;
    });
    return merged;
  }

  function mergeStats(local, remote) {
    const merged = { ...(remote || {}), ...(local || {}) };
    merged.daily = mergeDaily(local?.daily, remote?.daily);
    merged.packs = {};
    const localPacks = local?.packs || {};
    const remotePacks = remote?.packs || {};
    Array.from(new Set([...Object.keys(remotePacks), ...Object.keys(localPacks)])).forEach((packId) => {
      const a = localPacks[packId] || {};
      const b = remotePacks[packId] || {};
      merged.packs[packId] = {
        ...b,
        ...a,
        answered: Math.max(Number(a.answered) || 0, Number(b.answered) || 0),
        correct: Math.max(Number(a.correct) || 0, Number(b.correct) || 0),
        answerSequence: Math.max(Number(a.answerSequence) || 0, Number(b.answerSequence) || 0),
        daily: mergeDaily(a.daily, b.daily)
      };
    });
    return merged;
  }

  function saveLocalRecords() {
    localStorage.setItem(`weaknessQuiz:${childId}:progress`, JSON.stringify(progress));
    localStorage.setItem(`weaknessQuiz:${childId}:stats`, JSON.stringify(stats));
  }

  function challengeAnsweredTotal(progressValue = progress, statsValue = stats) {
    if (typeof cloud?.challengeAnsweredTotal === "function") {
      return cloud.challengeAnsweredTotal(progressValue, statsValue);
    }
    return Object.entries(progressValue || {})
      .filter(([id]) => id.startsWith("challenge-"))
      .reduce((sum, [, record]) => sum + (Number(record?.packAttempts) || 0), 0);
  }

  function updateSharedLearnerState(record) {
    cloudState.deviceTotal = challengeAnsweredTotal();
    cloudState.sharedTotal = Number(record?.learnerAnsweredTotal) || challengeAnsweredTotal(
      record?.learnerProgress || {},
      record?.learnerStats || { daily: {}, packs: {} }
    );
    cloudState.learnerEmail = record?.learnerEmail || "";
    cloudState.learnerUpdatedAt = record?.learnerUpdatedAtClient || "";
  }

  function syncFailureLabel(result) {
    if (result?.reason === "household-missing") return "家族共有未設定";
    if (result?.reason === "learner-unregistered") return "長男を登録";
    if (result?.reason === "learner-owned-by-other") return "保護者お試し";
    if (result?.reason === "verification-failed") return "同期を確認できません";
    return "同期できません";
  }

  async function syncCloudRecord(options = {}) {
    if (!cloudState.user || (!cloudState.householdId && !cloudState.user.isAnonymous)) return;
    cloudState.status = "同期中";
    updateCloudButton();
    if (categoryId === "auth") renderAccount();
    const sources = await cloud.getLearnerRecordSources(childId, { serverOnly: true });
    cloudState.role = sources.role;
    cloudState.householdOwner = Boolean(sources.householdOwner);
    if (sources.role === "parent") {
      progress = sources.sharedRecord?.learnerProgress || {};
      stats = sources.sharedRecord?.learnerStats || { daily: {}, packs: {} };
      updateSharedLearnerState(sources.sharedRecord);
      cloudState.status = sources.sharedRecord?.learnerUid ? "長男の記録" : "本人同期待ち";
    } else if (sources.role === "unassigned" && !options.claimLearner) {
      updateSharedLearnerState(sources.sharedRecord);
      cloudState.status = sources.householdOwner ? "長男の同期待ち" : "長男を登録";
    } else {
      progress = mergeProgress(progress, sources.privateRecord?.progress || {});
      stats = mergeStats(stats, sources.privateRecord?.stats || { daily: {}, packs: {} });
      progress = mergeProgress(progress, sources.sharedRecord?.learnerProgress || {});
      stats = mergeStats(stats, sources.sharedRecord?.learnerStats || { daily: {}, packs: {} });
      saveLocalRecords();
      cloudState.deviceTotal = challengeAnsweredTotal();
      const payload = {
        version: 2,
        app: "junior-high-weakness-quiz",
        child: { id: childId, name: "長男" },
        progress,
        stats,
        updatedAtClient: new Date().toISOString()
      };
      const result = options.claimLearner
        ? await cloud.claimLearnerRecord(childId, payload)
        : await cloud.saveLearnerRecord(childId, payload, { serverOnly: true });
      cloudState.role = result.role || cloudState.role;
      updateSharedLearnerState(result.record || sources.sharedRecord);
      cloudState.status = result.saved && result.verified
        ? "同期済み"
        : result.saved && !result.shared && cloudState.user?.isAnonymous
          ? "匿名保存"
          : syncFailureLabel(result);
    }
    updateCloudButton();
    if (categoryId === "stats") renderStats();
    if (categoryId === "auth") renderAccount();
    if (courseId === "review") renderReviewUnits(categoryId);
    else if (["social", "science"].includes(categoryId) && !courseId) renderCourses(categoryId);
    if (!categoryId) renderCategories();
  }

  function showShareSetup() {
    shareError.classList.add("hidden");
    shareError.textContent = "";
    share.classList.remove("hidden");
    window.setTimeout(() => partnerEmail.focus(), 0);
  }

  async function connectCloudUser(user) {
    cloudState.user = user;
    cloudState.role = user.isAnonymous ? "learner" : "none";
    cloudState.status = user.isAnonymous ? "匿名保存" : "確認中";
    updateCloudButton();
    try {
      if (typeof cloud.claimChildPairingFromLocation === "function") {
        const pairing = await cloud.claimChildPairingFromLocation(childId, {
          version: 2,
          app: "junior-high-weakness-quiz",
          child: { id: childId, name: "長男" },
          progress,
          stats,
          updatedAtClient: new Date().toISOString()
        });
        if (pairing?.claimed) {
          cloudState.householdId = pairing.householdId;
          cloudState.status = "家族に接続済み";
          updateCloudButton();
        }
      }
      if (user.isAnonymous) {
        cloudState.deviceTotal = challengeAnsweredTotal();
        await syncCloudRecord();
        return;
      }
      cloudState.householdId = await cloud.findHousehold();
      if (!cloudState.householdId) {
        cloudState.deviceTotal = challengeAnsweredTotal();
        cloudState.status = "共有設定";
        updateCloudButton();
        renderCategories();
        showShareSetup();
        return;
      }
      await syncCloudRecord();
      if (cloudState.role === "unassigned" && !cloudState.householdOwner) {
        await syncCloudRecord({ claimLearner: true });
      }
    } catch (error) {
      console.error("Challenge cloud connection failed", error);
      cloudState.status = "接続エラー";
      updateCloudButton();
      renderCategories();
    }
  }

  function renderAccount() {
    categoryId = "auth";
    courseId = "";
    grid.classList.add("hidden");
    statsView.classList.remove("hidden");
    statsView.replaceChildren();
    setToolbar("Google");

    const card = document.createElement("section");
    card.className = "portal-account";
    const icon = document.createElement("span");
    icon.className = "portal-account-icon";
    icon.textContent = cloudState.user ? "☁️" : "G";
    const email = document.createElement("strong");
    email.textContent = cloudState.user?.isAnonymous ? "アカウントなし" : cloudState.user?.email || "未ログイン";
    const status = document.createElement("small");
    status.textContent = cloudState.status;
    card.append(icon, email, status);

    if (cloudState.user) {
      const totals = document.createElement("div");
      totals.className = "portal-account-totals";
      totals.innerHTML = `<span>端末 <b>${cloudState.deviceTotal}問</b></span><span>クラウド <b>${cloudState.sharedTotal}問</b></span>`;
      card.appendChild(totals);

      if (cloudState.role === "unassigned" && !cloudState.user.isAnonymous && !cloudState.householdOwner) {
        const claimNote = document.createElement("small");
        claimNote.textContent = "長男の端末で一度だけ、このGoogleアカウントを学習記録として登録します。";
        const claim = document.createElement("button");
        claim.type = "button";
        claim.textContent = "このアカウントを長男として同期";
        claim.addEventListener("click", () => syncCloudRecord({ claimLearner: true }).catch((error) => console.error(error)));
        card.append(claimNote, claim);
      } else if (cloudState.role !== "parent") {
        const sync = document.createElement("button");
        sync.type = "button";
        sync.textContent = "今すぐ同期";
        sync.disabled = !cloudState.householdId && !cloudState.user.isAnonymous;
        sync.addEventListener("click", () => syncCloudRecord().catch((error) => console.error(error)));
        card.appendChild(sync);
      }
      if (!cloudState.user.isAnonymous) {
        const signOut = document.createElement("button");
        signOut.type = "button";
        signOut.className = "is-secondary";
        signOut.textContent = "ログアウト";
        signOut.addEventListener("click", () => cloud.signOut());
        card.appendChild(signOut);
      }
      if (cloudState.user.isAnonymous) {
        const note = document.createElement("small");
        note.textContent = "この端末のクイズ記録を匿名でクラウド保存中。Googleログインで家族共有できます。";
        card.appendChild(note);
        const google = document.createElement("button");
        google.textContent = "Googleで家族共有";
        google.addEventListener("click", handleAuthTap);
        card.appendChild(google);
      }
    }
    statsView.appendChild(card);
  }

  async function handleAuthTap() {
    if (!cloudState.available) {
      cloudState.status = "利用できません";
      updateCloudButton();
      renderAccount();
      return;
    }
    if (cloudState.user && !cloudState.user.isAnonymous) {
      renderAccount();
      return;
    }
    cloudState.status = "ログイン中";
    updateCloudButton();
    try {
      await cloud.signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed", error);
      cloudState.status = "ログイン失敗";
      updateCloudButton();
      renderCategories();
    }
  }

  function initCloud() {
    if (!cloud) return;
    const result = cloud.init();
    cloudState.available = Boolean(result?.available);
    if (!cloudState.available) return;
    cloud.onAuthStateChanged((user) => {
      if (!user) {
        cloudState.user = null;
        cloudState.householdId = "";
        cloudState.householdOwner = false;
        cloudState.role = "none";
        cloudState.status = "Google";
        updateCloudButton();
        share.classList.add("hidden");
        renderCategories();
        return;
      }
      connectCloudUser(user);
    });
    cloud.ensureAnonymousAuth?.().catch((error) => {
      console.warn("Anonymous cloud save unavailable; local saving remains active.", error);
    });
  }

  function renderCategories() {
    categoryId = "";
    courseId = "";
    grid.className = "portal-app-grid is-root";
    grid.replaceChildren();
    showAppGrid();
    setToolbar("");
    categories.forEach((category) => {
      grid.appendChild(makeApp({
        label: category.label,
        emoji: category.emoji,
        kind: category.id,
        onClick: () => category.id === "stats" ? renderStats() : renderCourses(category.id)
      }));
    });
  }

  function renderCourses(selectedCategoryId) {
    categoryId = selectedCategoryId;
    courseId = "";
    const category = categories.find((item) => item.id === categoryId);
    grid.className = "portal-app-grid is-courses";
    grid.replaceChildren();
    showAppGrid();
    setToolbar(category.label);
    courses.filter((course) => course.category === categoryId).forEach((course) => {
      grid.appendChild(makeApp({
        label: course.label,
        emoji: course.emoji,
        status: courseStatus(course),
        kind: course.shortId,
        onClick: () => renderUnits(course.id)
      }));
    });
    const reviewCount = categoryReviewCount(categoryId);
    grid.appendChild(makeApp({
      label: "まちがい",
      emoji: "↩️",
      badge: reviewCount ? String(reviewCount) : "",
      kind: "review",
      onClick: () => renderReviewUnits(categoryId)
    }));
  }

  function renderUnits(selectedCourseId) {
    courseId = selectedCourseId;
    const course = courses.find((item) => item.id === courseId);
    grid.className = "portal-app-grid is-units";
    grid.replaceChildren();
    showAppGrid();
    setToolbar(course.label);
    course.units.forEach(([unitId, title]) => {
      const number = String(Number(unitId.match(/-(\d{2})$/)?.[1] || 0));
      grid.appendChild(makeApp({
        label: title,
        number,
        status: unitStatus(unitId),
        kind: "unit",
        href: courseUrl(course, unitId)
      }));
    });
  }

  function renderReviewUnits(selectedCategoryId) {
    categoryId = selectedCategoryId;
    courseId = "review";
    const category = categories.find((item) => item.id === categoryId);
    const reviewUnits = courses
      .filter((course) => course.category === categoryId)
      .flatMap((course) => course.units.map(([unitId, title]) => ({
        course,
        unitId,
        title,
        ...unitReviewSummary(course, unitId)
      })))
      .filter((unit) => unit.total > 0);

    grid.className = "portal-app-grid is-units is-review-units";
    grid.replaceChildren();
    showAppGrid();
    setToolbar(`${category.label}・まちがい`);

    if (!reviewUnits.length) {
      grid.appendChild(makeApp({
        label: "いまは0問",
        emoji: "✓",
        kind: "review-empty",
        disabled: true
      }));
      return;
    }

    reviewUnits.forEach((unit) => {
      const number = String(Number(unit.unitId.match(/-(\d{2})$/)?.[1] || 0));
      const ready = unit.ready > 0;
      grid.appendChild(makeApp({
        label: ready ? unit.title : `${unit.title}（あとで）`,
        number,
        badge: String(unit.total),
        kind: ready ? "review-unit" : "review-waiting",
        href: ready ? courseUrl(unit.course, unit.unitId, { review: true }) : "",
        disabled: !ready
      }));
    });
  }

  function renderStats() {
    categoryId = "stats";
    courseId = "";
    grid.classList.add("hidden");
    statsView.classList.remove("hidden");
    statsView.replaceChildren();
    setToolbar("きろく");

    const summaries = courses.map(courseSummary);
    const daily = combinedDaily(summaries);
    const attempted = summaries.reduce((sum, course) => sum + course.attempted, 0);
    const mastered = summaries.reduce((sum, course) => sum + course.mastered, 0);
    const graded = summaries.reduce((sum, course) => sum + course.graded, 0);
    const firstCorrect = summaries.reduce((sum, course) => sum + course.firstCorrect, 0);
    const totalAttempts = summaries.reduce((sum, course) => sum + course.totalAttempts, 0);
    const total = summaries.reduce((sum, course) => sum + course.total, 0);
    const today = Number(daily[dateKey(new Date())]?.answered) || 0;

    const metricGrid = document.createElement("div");
    metricGrid.className = "portal-metric-grid";
    [
      ["📚", "挑戦", `${attempted}/${total}`],
      ["✅", "克服", `${mastered}問`],
      ["🎯", "正答率", graded ? `${Math.round((firstCorrect / graded) * 100)}%` : "--"],
      ["🔁", "累計", `${totalAttempts}問`],
      ["⚡", "今日", `${today}問`],
      ["🔥", "連続", `${currentStreak(daily)}日`]
    ].forEach(([icon, label, value]) => {
      const card = document.createElement("article");
      card.className = "portal-metric";
      const symbol = document.createElement("span");
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = icon;
      const name = document.createElement("small");
      name.textContent = label;
      const result = document.createElement("strong");
      result.textContent = value;
      card.append(symbol, name, result);
      metricGrid.appendChild(card);
    });

    const courseList = document.createElement("div");
    courseList.className = "portal-progress-list";
    summaries.forEach((course) => {
      const percent = Math.round((course.attempted / course.total) * 100);
      const statsLabel = course.category === "science" ? `理科${course.label}` : course.label;
      const row = document.createElement("article");
      row.className = "portal-progress-row";
      row.setAttribute("aria-label", `${statsLabel} ${course.attempted}/${course.total}問`);
      const icon = document.createElement("span");
      icon.className = `portal-progress-icon is-${course.shortId}`;
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = course.emoji;
      const body = document.createElement("div");
      body.className = "portal-progress-body";
      const line = document.createElement("div");
      const label = document.createElement("strong");
      label.textContent = statsLabel;
      const value = document.createElement("span");
      value.textContent = `${course.attempted}/${course.total}`;
      line.append(label, value);
      const track = document.createElement("div");
      track.className = "portal-progress-track";
      const fill = document.createElement("span");
      fill.style.width = `${percent}%`;
      track.appendChild(fill);
      body.append(line, track);
      row.append(icon, body);
      courseList.appendChild(row);
    });

    statsView.append(metricGrid, courseList);
  }

  back.addEventListener("click", () => {
    if (courseId) renderCourses(categoryId);
    else renderCategories();
  });

  shareCancel.addEventListener("click", () => share.classList.add("hidden"));
  cloudButton.addEventListener("click", handleAuthTap);
  shareForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    shareError.classList.add("hidden");
    try {
      cloudState.status = "設定中";
      updateCloudButton();
      cloudState.householdId = await cloud.createHousehold(partnerEmail.value);
      share.classList.add("hidden");
      await syncCloudRecord();
    } catch (error) {
      shareError.textContent = error?.message || "共有設定に失敗しました。";
      shareError.classList.remove("hidden");
      cloudState.status = "設定エラー";
      updateCloudButton();
    }
  });

  if (["social", "science"].includes(requestedReviewCategory)) renderReviewUnits(requestedReviewCategory);
  else renderCategories();
  initCloud();
})();
