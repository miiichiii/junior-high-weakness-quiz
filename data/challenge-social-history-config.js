(function () {
  "use strict";

  const units = [
    "文明のおこりと日本の成り立ち",
    "古代国家の成立と東アジア",
    "中世の日本",
    "ヨーロッパ人との出会いと天下統一",
    "近世の日本",
    "近代ヨーロッパと日本の開国",
    "近代の日本",
    "二度の世界大戦と日本",
    "現代の日本と世界"
  ];

  const descriptions = [
    "人類の誕生、古代文明と日本列島のあけぼのを整理します。",
    "律令国家、東アジアとの交流、貴族の文化を整理します。",
    "武士の台頭、鎌倉・室町の政治と文化を整理します。",
    "ヨーロッパ人の来航、織田・豊臣の統一を整理します。",
    "江戸幕府のしくみ、産業・文化、改革を整理します。",
    "近代ヨーロッパの動きと、開国から明治維新までを整理します。",
    "明治以降の政治・産業・外交と大正期までを整理します。",
    "世界大戦、戦時体制、戦後改革までの流れを整理します。",
    "戦後の日本と国際社会、現代の課題を整理します。"
  ];

  const corners = units.map((title, index) => {
    const number = index + 13;
    const firstPage = 26 + index * 2;
    return {
      id: `his-${number}`,
      label: `${number}. ${title}`,
      shortLabel: `単元${number}`,
      description: `Challenge社会 p.${firstPage}-${firstPage + 1}。${descriptions[index]}`,
      enabled: true,
      statusLabel: "",
      tierCounts: { core: 8, challenge: 8, final: 8 }
    };
  });

  const pack = {
    id: "challenge-social-history",
    contentVersion: 1,
    title: "Challenge社会・歴史",
    shortTitle: "Challenge社会・歴史",
    subject: "社会",
    focus: "Challenge中3・社会の歴史9単元",
    childIds: ["child-1"],
    cornerRouteParam: "unit",
    sessionSize: 8,
    finalTimeLimitSeconds: 720,
    maxEnabled: false,
    tierCounts: { core: 8, challenge: 8, final: 8 },
    tierLabels: {
      core: "基本語句を取り出す",
      challenge: "年代・資料・因果で判断する",
      final: "選択肢なしで答える"
    },
    subjectCounts: {
      core: { "社会": 72 },
      challenge: { "社会": 72 },
      final: { "社会": 72 },
      total: { "社会": 216 }
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
      eyebrow: "ワークを閉じて思い出す　歴史年間コース",
      lead: "各単元を基本、年代・資料・理由、直接入力の順で定着させます。",
      privacy: "教材の設問や図版は転載せず、根拠事項をもとに作ったオリジナル問題です。",
      cornerHeading: "単元を選ぶ",
      cornerHint: "全9単元を利用できます",
      cornerAriaLabel: "Challenge社会・歴史の単元",
      startButton: "このレベルを8問やる",
      reviewButton: "間違えた問題だけ",
      tierLead: {
        core: "まず8問で用語と基本的な流れを整理しよう。",
        challenge: "次はオリジナル年表・地図・図解と資料問題で、初見の聞き方に対応しよう。",
        final: "本を閉じたまま、選択肢なしで用語や出来事を思い出そう。"
      },
      complete: "この単元を完走しました。別の日にもう一度正解すると克服になります。"
    }
  };

  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
