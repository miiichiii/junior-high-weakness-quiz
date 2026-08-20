(function () {
  "use strict";

  const unitTitles = [
    "世界の地域構成",
    "日本の地域構成",
    "世界の人々の生活と環境",
    "アジア州",
    "ヨーロッパ州・アフリカ州",
    "南北アメリカ州・オセアニア州",
    "地域調査の手法",
    "世界から見た日本の自然・人口",
    "世界と日本の資源・産業・結びつき",
    "九州地方、中国・四国地方",
    "近畿地方・中部地方",
    "関東地方・東北地方・北海道地方"
  ];

  const corners = unitTitles.map((title, index) => {
    const number = index + 1;
    const firstPage = number * 2;
    const enabled = number <= 12;
    const enabledDescriptions = {
      1: "地球のすがた、緯度・経度、世界の地域区分を練習します。",
      2: "日本の位置・領域・時差、都道府県と地方区分を練習します。",
      3: "世界の気候と、それに適応した生活・宗教を練習します。",
      4: "アジアの自然・人口・産業と地域ごとの特色を練習します。",
      5: "ヨーロッパとアフリカの自然・農業・歴史を練習します。",
      6: "南北アメリカとオセアニアの自然・産業・社会を練習します。",
      7: "地形図の縮尺・等高線と、地域調査の進め方を練習します。",
      8: "日本の自然環境・自然災害と、世界・日本の人口を練習します。",
      9: "資源・電力・工業・農林水産業と、交通・貿易を練習します。",
      10: "九州、中国・四国の自然・産業・交通と地域課題を練習します。",
      11: "近畿と中部の自然・都市・農業・工業を練習します。",
      12: "関東・東北・北海道の自然・人口・農業・工業を練習します。"
    };
    return {
      id: `geo-${String(number).padStart(2, "0")}`,
      label: `${number}. ${title}`,
      shortLabel: `単元${number}`,
      description: enabled
        ? `Challenge社会 p.${firstPage}-${firstPage + 1}。${enabledDescriptions[number]}`
        : `Challenge社会 p.${firstPage}-${firstPage + 1}。テキストと画像の抽出済み。問題は順次追加します。`,
      enabled,
      statusLabel: enabled ? "" : "準備中",
      tierCounts: enabled ? { core: 5, challenge: 5, final: 5 } : {}
    };
  });

  const pack = {
    id: "challenge-social-geography",
    contentVersion: 12,
    title: "Challenge社会・地理",
    shortTitle: "Challenge社会・地理",
    subject: "社会",
    focus: "Challenge中3・社会の地理12単元",
    childIds: ["child-1"],
    cornerRouteParam: "unit",
    sessionSize: 5,
    finalTimeLimitSeconds: 480,
    maxEnabled: false,
    tierCounts: { core: 5, challenge: 5, final: 5 },
    tierLabels: {
      core: "基本語句を取り出す",
      challenge: "地図と理由で判断する",
      final: "選択肢なしで答える"
    },
    subjectCounts: {
      core: { "社会": 60 },
      challenge: { "社会": 60 },
      final: { "社会": 60 },
      total: { "社会": 180 }
    },
    corners,
    unlock: {
      challengeEarly: { answered: 4, accuracy: 80 },
      challengeFull: { answered: 5, accuracy: 70 },
      final: { answered: 4, accuracy: 75 }
    },
    mix: { review: 0.5, unseen: 0.4, mastered: 0.1 },
    mastery: { correctSessions: 2, cooldownAnswers: 5 },
    copy: {
      eyebrow: "ワークを閉じて思い出す　地理年間コース",
      lead: "各単元を基本、地図・理由、直接入力の順で定着させます。",
      privacy: "教材の設問や図版は転載せず、根拠事項をもとに作ったオリジナル問題です。",
      cornerHeading: "単元を選ぶ",
      cornerHint: "全12単元を利用できます",
      cornerAriaLabel: "Challenge社会・地理の単元",
      startButton: "このレベルを5問やる",
      reviewButton: "間違えた問題だけ",
      tierLead: {
        core: "まず5問で用語と基本的な関係を整理しよう。",
        challenge: "次はオリジナル地図と比較問題で、初見の聞き方に対応しよう。",
        final: "本を閉じたまま、選択肢なしで用語を思い出そう。"
      },
      complete: "この単元を完走しました。別の日にもう一度正解すると克服になります。"
    }
  };

  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
