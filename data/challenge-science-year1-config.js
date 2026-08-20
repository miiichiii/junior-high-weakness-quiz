(function () {
  "use strict";

  const units = [
    [1, "光と音", "反射・屈折、凸レンズ、音の波形を実験と作図で整理します。"],
    [2, "力のはたらき", "力の種類と表し方、ばね、2力のつり合いを整理します。"],
    [3, "物質の区別、水溶液の性質", "密度、物質の性質、濃度、溶解度を計算と資料で整理します。"],
    [4, "物質の状態変化、気体の性質", "状態変化、蒸留、気体の発生と集め方を整理します。"],
    [5, "植物のなかま", "花のつくりと種子植物、シダ・コケ植物の分類を整理します。"],
    [6, "動物のなかま", "脊椎動物と無脊椎動物を体の特徴から分類します。"],
    [7, "火山と地震", "火山・火成岩、地震の波と大地の動きを資料から読み取ります。"],
    [8, "大地の変化", "地層、堆積岩、化石から土地の過去を推理します。"]
  ];
  const corners = units.map(([number, title, description], index) => ({
    id: `sci1-${String(number).padStart(2, "0")}`,
    label: `${number}. ${title}`,
    shortLabel: `単元${number}`,
    description: `Challenge理科 p.${126 + index * 2}-${127 + index * 2}。${description}`,
    enabled: true,
    statusLabel: "",
    tierCounts: { core: 8, challenge: 8, final: 8 }
  }));
  const pack = {
    id: "challenge-science-year1",
    contentVersion: 1,
    title: "Challenge理科・1年",
    shortTitle: "Challenge理科・1年",
    subject: "理科",
    focus: "Challenge中学理科・1年の8単元",
    childIds: ["child-1"],
    cornerRouteParam: "unit",
    sessionSize: 8,
    finalTimeLimitSeconds: 720,
    maxEnabled: false,
    tierCounts: { core: 8, challenge: 8, final: 8 },
    tierLabels: {
      core: "基本事項を正確に取り出す",
      challenge: "実験・図表・計算で判断する",
      final: "選択肢なしで答える"
    },
    subjectCounts: {
      core: { "理科": 64 }, challenge: { "理科": 64 }, final: { "理科": 64 }, total: { "理科": 192 }
    },
    corners,
    unlock: {
      challengeEarly: { answered: 6, accuracy: 80 },
      challengeFull: { answered: 8, accuracy: 70 },
      final: { answered: 6, accuracy: 75 }
    },
    mix: { review: 0.5, unseen: 0.4, mastered: 0.1 },
    mastery: { correctSessions: 2, cooldownAnswers: 5 },
    copy: {
      eyebrow: "観察・実験を考えて解く　理科1年コース",
      lead: "基本、実験・図表・計算、直接入力の順で高校入試に使える理解へ進みます。",
      privacy: "教材の設問や図版は転載せず、確認した根拠事項から作ったオリジナル問題です。",
      cornerHeading: "単元を選ぶ",
      cornerHint: "全8単元を利用できます",
      cornerAriaLabel: "Challenge理科・1年の単元",
      startButton: "このレベルを8問やる",
      reviewButton: "間違えた問題だけ",
      tierLead: {
        core: "まず8問で現象と用語を正確につなげよう。",
        challenge: "次はオリジナルの実験・表・グラフから、条件と因果を読み取ろう。",
        final: "本を閉じたまま、重要語句や数値を自力で答えよう。"
      },
      complete: "この単元を完走しました。別の日にも正解すると克服になります。"
    }
  };
  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
