(function () {
  const pack = {
    id: "term-2026-07-13",
    title: "7/13 定期テスト 200問チャレンジ",
    shortTitle: "定期テスト200問",
    examDate: "2026-07-13",
    childIds: ["child-1"],
    sessionSize: 10,
    finalTimeLimitSeconds: 1200,
    tierCounts: {
      core: 80,
      challenge: 80,
      final: 40
    },
    tierLabels: {
      core: "基本攻略",
      challenge: "応用挑戦",
      final: "最終挑戦",
      max: "最高難度ミックス"
    },
    subjectCounts: {
      core: { "国語": 24, "社会": 24, "数学": 14, "理科": 12, "英語": 6 },
      challenge: { "国語": 20, "社会": 20, "数学": 18, "理科": 16, "英語": 6 },
      final: { "国語": 10, "社会": 10, "数学": 8, "理科": 8, "英語": 4 },
      total: { "国語": 54, "社会": 54, "数学": 40, "理科": 36, "英語": 16 }
    },
    unlock: {
      challengeEarly: { answered: 40, accuracy: 90 },
      challengeFull: { answered: 80, accuracy: 85 },
      final: { answered: 60, accuracy: 80 }
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
      eyebrow: "月曜までに、できるところまで上へ",
      lead: "まず基本80問。余裕なら応用80問、最後は新問40問へ。どのレベルにも今すぐ挑戦できます。",
      privacy: "教材の設問や個人情報は保存せず、試験範囲をもとにしたオリジナル類題だけを出題します。"
    }
  };

  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
