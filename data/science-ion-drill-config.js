(function () {
  "use strict";

  const pack = {
    id: "science-ion-drill",
    title: "理科・水溶液とイオン 30問特訓",
    shortTitle: "水溶液とイオン特訓",
    subject: "理科",
    focus: "電解質・電気分解・イオンと電池",
    childIds: ["child-1"],
    sessionSize: 10,
    finalTimeLimitSeconds: 600,
    maxEnabled: false,
    tierCounts: {
      core: 10,
      challenge: 10,
      final: 10
    },
    tierLabels: {
      core: "電解質の土台",
      challenge: "電極・電池の整理",
      final: "式まで自力"
    },
    subjectCounts: {
      core: { "理科": 10 },
      challenge: { "理科": 10 },
      final: { "理科": 10 },
      total: { "理科": 30 }
    },
    unlock: {
      challengeEarly: { answered: 6, accuracy: 90 },
      challengeFull: { answered: 10, accuracy: 80 },
      final: { answered: 8, accuracy: 80 }
    },
    mix: {
      review: 0.5,
      unseen: 0.4,
      mastered: 0.1
    },
    mastery: {
      correctSessions: 2,
      cooldownAnswers: 5
    },
    copy: {
      eyebrow: "電解質から電池まで、粒子の動きでつなぐ",
      lead: "まず電解質と電離を整理し、次に電極での変化と電池を確認します。最後は式や用語を選択肢なしで答えます。",
      privacy: "苦手範囲の出題意図をもとにしたオリジナル類題です。添付教材の設問や図は転載していません。",
      startButton: "イオンを10問やる",
      reviewButton: "間違えた仕組みだけ",
      tierLead: {
        core: "電流が流れる理由を、電解質・電離・イオンの3語でつなごう。できたら電極の変化へ。",
        challenge: "陽極・陰極と、電子を失う・受け取るを結び付けよう。できたら選択肢なしへ。"
      },
      complete: "電解質、電気分解、電池、気体の体積比まで確認できました。間違えた仕組みだけをもう一度解こう。"
    }
  };

  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
