(function () {
  "use strict";

  const units = [
    [22, "わたしたちの生活と現代社会", "グローバル化、情報化、少子高齢化、文化と社会集団を整理します。"],
    [23, "日本国憲法と基本的人権", "憲法の三原則、基本的人権、平和主義と新しい人権を整理します。"],
    [24, "現代の民主政治・国会", "選挙、政党、世論、国会と衆議院の優越を整理します。"],
    [25, "内閣・裁判所・三権分立", "議院内閣制、司法制度、国民の司法参加、三権分立を整理します。"],
    [26, "地方自治", "地方公共団体、首長と議会、直接請求、地方財政を整理します。"],
    [27, "わたしたちのくらしと経済", "消費・生産、市場価格、企業、労働、金融を整理します。"],
    [28, "国民生活と福祉", "財政・租税、景気、社会保障、環境と日本経済を整理します。"],
    [29, "国際社会と世界平和", "主権国家、国際連合、地域紛争、国際協力と地球的課題を整理します。"]
  ];

  const corners = units.map(([number, title, description], index) => {
    const firstPage = 44 + index * 2;
    return {
      id: `civ-${number}`,
      label: `${number}. ${title}`,
      shortLabel: `単元${number}`,
      description: `Challenge社会 p.${firstPage}-${firstPage + 1}。${description}`,
      enabled: true,
      statusLabel: "",
      tierCounts: { core: 8, challenge: 8, final: 8 }
    };
  });

  const pack = {
    id: "challenge-social-civics",
    contentVersion: 1,
    title: "Challenge社会・公民",
    shortTitle: "Challenge社会・公民",
    subject: "社会",
    focus: "Challenge中3・社会の公民8単元",
    childIds: ["child-1"],
    cornerRouteParam: "unit",
    sessionSize: 8,
    finalTimeLimitSeconds: 720,
    maxEnabled: false,
    tierCounts: { core: 8, challenge: 8, final: 8 },
    tierLabels: {
      core: "基本用語と制度を取り出す",
      challenge: "資料・制度比較・因果で判断する",
      final: "選択肢なしで答える"
    },
    subjectCounts: {
      core: { "社会": 64 },
      challenge: { "社会": 64 },
      final: { "社会": 64 },
      total: { "社会": 192 }
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
      eyebrow: "ワークを閉じて思い出す　公民年間コース",
      lead: "各単元を基本、資料・制度比較・理由、直接入力の順で定着させます。",
      privacy: "教材の設問や図版は転載せず、根拠事項をもとに作ったオリジナル問題です。",
      cornerHeading: "単元を選ぶ",
      cornerHint: "全8単元を利用できます",
      cornerAriaLabel: "Challenge社会・公民の単元",
      startButton: "このレベルを8問やる",
      reviewButton: "間違えた問題だけ",
      tierLead: {
        core: "まず8問で用語と制度の骨格を整理しよう。",
        challenge: "次はオリジナル図表と事例問題で、理由や制度の違いまで判断しよう。",
        final: "本を閉じたまま、選択肢なしで重要語句を思い出そう。"
      },
      complete: "この単元を完走しました。別の日にもう一度正解すると克服になります。"
    }
  };

  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
