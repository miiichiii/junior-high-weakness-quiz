(function () {
  "use strict";

  const COURSES = [
    {
      id: "challenge-social-geography", label: "地理", emoji: "🌏", total: 180,
      units: [
        ["geo-01", "世界の地域構成", 15], ["geo-02", "日本の地域構成", 15],
        ["geo-03", "世界の生活と環境", 15], ["geo-04", "アジア州", 15],
        ["geo-05", "ヨーロッパ・アフリカ", 15], ["geo-06", "アメリカ・オセアニア", 15],
        ["geo-07", "地域調査", 15], ["geo-08", "日本の自然・人口", 15],
        ["geo-09", "資源・産業・結びつき", 15], ["geo-10", "九州・中国四国", 15],
        ["geo-11", "近畿・中部", 15], ["geo-12", "関東・東北・北海道", 15]
      ]
    },
    {
      id: "challenge-social-history", label: "歴史", emoji: "🏯", total: 216,
      units: [
        ["his-13", "文明のおこり", 24], ["his-14", "古代国家と東アジア", 24],
        ["his-15", "中世の日本", 24], ["his-16", "天下統一", 24],
        ["his-17", "近世の日本", 24], ["his-18", "開国と近代世界", 24],
        ["his-19", "近代の日本", 24], ["his-20", "二度の世界大戦", 24],
        ["his-21", "現代の日本と世界", 24]
      ]
    },
    {
      id: "challenge-social-civics", label: "公民", emoji: "🏛️", total: 192,
      units: [
        ["civ-22", "現代社会", 24], ["civ-23", "憲法と基本的人権", 24],
        ["civ-24", "民主政治と国会", 24], ["civ-25", "内閣・裁判所", 24],
        ["civ-26", "地方自治", 24], ["civ-27", "くらしと経済", 24],
        ["civ-28", "国民生活と福祉", 24], ["civ-29", "国際社会と世界平和", 24]
      ]
    },
    {
      id: "challenge-science-year1", label: "理科1年", emoji: "🧪", total: 192,
      units: [
        ["sci1-01", "光と音", 24], ["sci1-02", "力のはたらき", 24],
        ["sci1-03", "物質と水溶液", 24], ["sci1-04", "状態変化と気体", 24],
        ["sci1-05", "植物のなかま", 24], ["sci1-06", "動物のなかま", 24],
        ["sci1-07", "火山と地震", 24], ["sci1-08", "大地の変化", 24]
      ]
    },
    {
      id: "challenge-science-year2", label: "理科2年", emoji: "⚡", total: 240,
      units: [
        ["sci2-09", "電流の性質", 24], ["sci2-10", "電力量と電子", 24],
        ["sci2-11", "電流と磁界", 24], ["sci2-12", "分解と原子・分子", 24],
        ["sci2-13", "化学変化と質量", 24], ["sci2-14", "植物のはたらき", 24],
        ["sci2-15", "細胞・消化と吸収", 24], ["sci2-16", "血液・循環と反応", 24],
        ["sci2-17", "気象観測と水蒸気", 24], ["sci2-18", "前線と天気の変化", 24]
      ]
    }
  ];

  function attempted(record) {
    return Boolean(record?.packFirstAttemptRecorded || Number(record?.packAttempts) > 0);
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function recordEntries(progress, unitId) {
    return Object.entries(progress || {}).filter(([id]) => id.startsWith(`challenge-${unitId}-`));
  }

  function latestDate(entries) {
    return entries.reduce((latest, [, record]) => {
      const time = Date.parse(record?.lastAnsweredAt || "") || 0;
      return time > latest ? time : latest;
    }, 0);
  }

  function unitSummary(progress, unit) {
    const [id, title, total] = unit;
    const entries = recordEntries(progress, id);
    const attemptedEntries = entries.filter(([, record]) => attempted(record));
    const graded = attemptedEntries.filter(([, record]) => typeof record?.packFirstAttemptCorrect === "boolean");
    return {
      id,
      title,
      total,
      attempted: attemptedEntries.length,
      graded: graded.length,
      firstCorrect: graded.filter(([, record]) => record.packFirstAttemptCorrect).length,
      review: entries.filter(([, record]) => record?.needsReview).length,
      mastered: entries.filter(([, record]) => record?.packMastered).length,
      totalAttempts: attemptedEntries.reduce((sum, [, record]) => sum + (Number(record?.packAttempts) || 0), 0),
      latestAt: latestDate(entries)
    };
  }

  function courseSummary(course, progress, stats) {
    const units = course.units.map((unit) => unitSummary(progress, unit));
    const packStats = stats?.packs?.[course.id] || {};
    const aggregate = units.reduce((sum, unit) => ({
      attempted: sum.attempted + unit.attempted,
      graded: sum.graded + unit.graded,
      firstCorrect: sum.firstCorrect + unit.firstCorrect,
      review: sum.review + unit.review,
      mastered: sum.mastered + unit.mastered,
      totalAttempts: sum.totalAttempts + unit.totalAttempts,
      latestAt: Math.max(sum.latestAt, unit.latestAt)
    }), { attempted: 0, graded: 0, firstCorrect: 0, review: 0, mastered: 0, totalAttempts: 0, latestAt: 0 });
    return {
      ...course,
      ...aggregate,
      units,
      totalAttempts: Math.max(aggregate.totalAttempts, Number(packStats.answered) || 0),
      latestAt: Math.max(aggregate.latestAt, Date.parse(packStats.lastAnsweredAt || "") || 0),
      daily: packStats.daily || {}
    };
  }

  function mergeDaily(courses) {
    const daily = {};
    courses.forEach((course) => {
      Object.entries(course.daily || {}).forEach(([day, value]) => {
        daily[day] = (daily[day] || 0) + (Number(value?.answered) || 0);
      });
    });
    return daily;
  }

  function streak(daily) {
    const cursor = new Date();
    if (!(daily[dateKey(cursor)] > 0)) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (daily[dateKey(cursor)] > 0) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function summary(progress, stats) {
    const courses = COURSES.map((course) => courseSummary(course, progress, stats));
    const daily = mergeDaily(courses);
    const week = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      return daily[dateKey(date)] || 0;
    }).reduce((sum, value) => sum + value, 0);
    const overall = courses.reduce((sum, course) => ({
      attempted: sum.attempted + course.attempted,
      graded: sum.graded + course.graded,
      firstCorrect: sum.firstCorrect + course.firstCorrect,
      review: sum.review + course.review,
      mastered: sum.mastered + course.mastered,
      totalAttempts: sum.totalAttempts + course.totalAttempts,
      latestAt: Math.max(sum.latestAt, course.latestAt)
    }), { attempted: 0, graded: 0, firstCorrect: 0, review: 0, mastered: 0, totalAttempts: 0, latestAt: 0 });
    return {
      ...overall,
      total: COURSES.reduce((sum, course) => sum + course.total, 0),
      today: daily[dateKey(new Date())] || 0,
      week,
      streak: streak(daily),
      courses
    };
  }

  function percent(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
  }

  function accuracy(correct, graded) {
    return graded ? `${percent(correct, graded)}%` : "--";
  }

  function formatDateTime(time) {
    if (!time) return "未着手";
    return new Date(time).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[char]));
  }

  function unitMarkup(unit) {
    const number = String(Number(unit.id.match(/-(\d{2})$/)?.[1] || 0));
    const review = unit.review ? `<b class="is-review">復習 ${unit.review}</b>` : "";
    return `
      <article class="parent-challenge-unit">
        <div class="parent-challenge-unit-heading">
          <strong><span>単元${number}</span>${escapeHtml(unit.title)}</strong>
          ${review}
        </div>
        <div class="parent-pack-meter" aria-label="単元${number} 着手${unit.attempted}/${unit.total}">
          <span style="width:${percent(unit.attempted, unit.total)}%"></span>
        </div>
        <div class="parent-challenge-unit-stats">
          <span>着手 <b>${unit.attempted}/${unit.total}</b></span>
          <span>初回 <b>${accuracy(unit.firstCorrect, unit.graded)}</b></span>
          <span>克服 <b>${unit.mastered}</b></span>
        </div>
        <small>最終：${formatDateTime(unit.latestAt)}</small>
      </article>
    `;
  }

  function markup(progress, stats, childId) {
    if (childId !== "child-1") return "";
    const result = summary(progress, stats);
    const courseMarkup = result.courses.map((course) => `
      <details class="parent-challenge-course"${course.review ? " open" : ""}>
        <summary>
          <span class="parent-challenge-course-name"><b>${course.emoji}</b><strong>${escapeHtml(course.label)}</strong></span>
          <span class="parent-challenge-course-result">${course.attempted}/${course.total}${course.review ? `・復習${course.review}` : ""}</span>
        </summary>
        <div class="parent-challenge-course-metrics">
          <span>初回正答率 <b>${accuracy(course.firstCorrect, course.graded)}</b></span>
          <span>克服 <b>${course.mastered}問</b></span>
          <span>累計 <b>${course.totalAttempts}問</b></span>
          <span>最終 <b>${formatDateTime(course.latestAt)}</b></span>
        </div>
        <div class="parent-challenge-units">${course.units.map(unitMarkup).join("")}</div>
      </details>
    `).join("");
    return `
      <section class="parent-challenge-section">
        <div class="parent-pack-title">
          <div><p class="label">CHALLENGE</p><h3>社会・理科 1020問</h3></div>
          <a class="ghost-button parent-pack-link" href="challenge.html?child=child-1">学習画面</a>
        </div>
        <div class="parent-challenge-courses">${courseMarkup}</div>
      </section>
    `;
  }

  window.ChallengeParentView = { COURSES, summary, markup };
})();
