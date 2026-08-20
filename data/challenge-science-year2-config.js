(function () {
  "use strict";
  const units = [
    [9, "電流の性質", "回路、電流・電圧、オームの法則を図と計算で整理します。"],
    [10, "電力量と熱量、電流と電子", "電力・電力量・発熱と電子の動きを整理します。"],
    [11, "電流と磁界", "磁界、電磁石、モーター、電磁誘導を整理します。"],
    [12, "物質の分解、原子・分子", "分解実験、原子・分子、単体・化合物を整理します。"],
    [13, "化学変化と物質の質量", "酸化・還元、熱、質量保存と反応比を整理します。"],
    [14, "植物のからだのつくりとはたらき", "光合成、呼吸、蒸散、物質の通り道を整理します。"],
    [15, "生物と細胞、消化と吸収", "細胞、消化酵素、養分の吸収を整理します。"],
    [16, "血液の循環、からだのはたらき", "血液、循環、排出、感覚と反応を整理します。"],
    [17, "気象観測、空気中の水蒸気", "気象要素、湿度、露点、気圧と風を整理します。"],
    [18, "天気の変化", "前線、気団、季節の天気と台風を整理します。"]
  ];
  const corners = units.map(([number, title, description], index) => ({
    id: `sci2-${String(number).padStart(2, "0")}`, label: `${number}. ${title}`, shortLabel: `単元${number}`,
    description: `Challenge理科 p.${142 + index * 2}-${143 + index * 2}。${description}`,
    enabled: true, statusLabel: "", tierCounts: { core: 8, challenge: 8, final: 8 }
  }));
  const pack = {
    id: "challenge-science-year2", contentVersion: 1, title: "Challenge理科・2年", shortTitle: "Challenge理科・2年",
    subject: "理科", focus: "Challenge中学理科・2年の10単元", childIds: ["child-1"], cornerRouteParam: "unit",
    sessionSize: 8, finalTimeLimitSeconds: 720, maxEnabled: false,
    tierCounts: { core: 8, challenge: 8, final: 8 },
    tierLabels: { core: "基本事項を正確に取り出す", challenge: "実験・図表・計算で判断する", final: "選択肢なしで答える" },
    subjectCounts: { core: { "理科": 80 }, challenge: { "理科": 80 }, final: { "理科": 80 }, total: { "理科": 240 } },
    corners,
    unlock: { challengeEarly: { answered: 6, accuracy: 80 }, challengeFull: { answered: 8, accuracy: 70 }, final: { answered: 6, accuracy: 75 } },
    mix: { review: 0.5, unseen: 0.4, mastered: 0.1 }, mastery: { correctSessions: 2, cooldownAnswers: 5 },
    copy: {
      eyebrow: "回路・反応・生命・天気を解く　理科2年コース",
      lead: "基本、実験・図表・計算、直接入力の順で高校入試に使える理解へ進みます。",
      privacy: "教材の設問や図版は転載せず、確認した根拠事項から作ったオリジナル問題です。",
      cornerHeading: "単元を選ぶ", cornerHint: "全10単元を利用できます", cornerAriaLabel: "Challenge理科・2年の単元",
      startButton: "このレベルを8問やる", reviewButton: "間違えた問題だけ",
      tierLead: { core: "まず8問で現象と用語を正確につなげよう。", challenge: "オリジナルの実験・表・グラフから条件と因果を読み取ろう。", final: "本を閉じたまま重要語句や数値を自力で答えよう。" },
      complete: "この単元を完走しました。別の日にも正解すると克服になります。"
    }
  };
  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
