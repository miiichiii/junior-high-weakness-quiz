(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-04";
  const UNIT = "アジア州";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P8 = "Challenge社会「5科のポイントチェック」p.8";
  const P9 = "Challenge社会「5科のポイントチェック」p.9";

  const ASIA_RELIEF_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "アジアを東西に長い形で示し、中央南寄りの高い山地Aと、その北側の高原を表した模式図",
    caption: "アジア中央部の高い山地と高原の位置関係を表したオリジナル模式図",
    regions: [
      { label: "アジア", tone: 5, points: [[18, 54], [92, 35], [171, 43], [232, 28], [327, 52], [337, 112], [288, 146], [224, 135], [177, 169], [123, 142], [56, 151], [24, 109]] },
      { label: "高原", tone: 2, points: [[139, 73], [222, 68], [246, 104], [176, 113], [128, 99]] },
      { label: "山脈", tone: 1, highlight: true, points: [[113, 125], [151, 111], [185, 124], [224, 108], [258, 124], [223, 137], [180, 133], [143, 142]] }
    ],
    gridLines: [
      { points: [[110, 133], [151, 117], [185, 130], [225, 114], [260, 130]], emphasis: true }
    ],
    labels: [
      { x: 183, y: 92, text: "チベット高原" },
      { x: 182, y: 157, text: "A", emphasis: true },
      { x: 300, y: 92, text: "東アジア" },
      { x: 67, y: 94, text: "西アジア" }
    ]
  };

  const SUMMER_MONSOON_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "左側のインド洋から右側の南アジアの陸地へ、湿った風が吹く夏の模式図",
    caption: "夏に海から陸へ吹く季節風と雨季の関係を表したオリジナル模式図",
    regions: [
      { label: "インド洋", tone: 4, points: [[18, 42], [166, 42], [166, 194], [18, 194]] },
      { label: "南アジア", tone: 2, highlight: true, points: [[218, 32], [340, 32], [340, 194], [209, 194], [190, 144], [206, 101]] }
    ],
    gridLines: [
      { points: [[67, 86], [236, 86]], emphasis: true },
      { points: [[67, 116], [236, 116]], emphasis: true },
      { points: [[67, 146], [236, 146]], emphasis: true }
    ],
    points: [
      { x: 236, y: 86, r: 5 },
      { x: 236, y: 116, r: 5 },
      { x: 236, y: 146, r: 5 }
    ],
    labels: [
      { x: 87, y: 62, text: "海", emphasis: true },
      { x: 278, y: 62, text: "陸", emphasis: true },
      { x: 151, y: 103, text: "湿った風 →", emphasis: true },
      { x: 279, y: 122, text: "Aの季節" }
    ]
  };

  const CHINA_COASTAL_ZONE_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "中国を内陸部と沿岸部に分け、海に面する南東側の都市Aを強調した模式図",
    caption: "中国の経済特区が沿岸部に設けられたことを表すオリジナル模式図",
    regions: [
      { label: "内陸部", tone: 5, points: [[28, 35], [258, 35], [276, 62], [253, 95], [267, 130], [228, 179], [28, 179]] },
      { label: "沿岸部", tone: 3, highlight: true, points: [[258, 35], [329, 52], [312, 88], [332, 117], [295, 151], [228, 179], [267, 130], [253, 95], [276, 62]] }
    ],
    gridLines: [
      { points: [[258, 35], [276, 62], [253, 95], [267, 130], [228, 179]], dashed: true }
    ],
    points: [
      { x: 291, y: 128, r: 7 },
      { x: 301, y: 82, r: 5 },
      { x: 276, y: 151, r: 5 }
    ],
    labels: [
      { x: 125, y: 108, text: "内陸部" },
      { x: 304, y: 29, text: "海" },
      { x: 291, y: 116, text: "A", emphasis: true },
      { x: 302, y: 197, text: "南東の沿岸" }
    ]
  };

  function geoQuestion(question) {
    const defaults = {
      core: { priority: "S", difficulty: "L1 基礎復帰", stage: "基本語句" },
      challenge: { priority: "A", difficulty: "L2 県立標準", stage: "資料・判断" },
      final: { priority: "A", difficulty: "L2 県立標準", stage: "直接入力" }
    }[question.tier];
    if (!defaults) throw new Error(`Unknown geography tier: ${question.tier}`);
    return {
      type: "choice",
      childIds: ["child-1"],
      packId: PACK_ID,
      cornerId: UNIT_ID,
      unitId: UNIT_ID,
      subject: "社会",
      unit: UNIT,
      sourceTag: SOURCE_TAG,
      qualityStatus: "content-audited",
      contentStatus: "content-final",
      formatTag: "短問",
      ...defaults,
      ...question,
      variantGroup: question.variantGroup || `${UNIT_ID}-${question.sourceFactIds[0]}`
    };
  }

  const questions = [
    geoQuestion({
      id: "challenge-geo-04-001", tier: "core", sourceFactIds: ["geo-04-f01"], retrievalDirection: "terrain-to-name",
      examSkill: "アジアの地形", mistakeTags: ["ヒマラヤ山脈", "チベット高原"], paperRef: P8,
      prompt: "アジア州の中央部にある地形の組み合わせとして、正しいものはどれですか。",
      choices: ["ヒマラヤ山脈とチベット高原", "アンデス山脈とブラジル高原", "アルプス山脈とドイツ平原", "ロッキー山脈と中央平原"], answer: 0,
      explanation: "アジア中央部には8000m級の山々が連なるヒマラヤ山脈と、その北側に広がるチベット高原があります。"
    }),
    geoQuestion({
      id: "challenge-geo-04-002", tier: "core", sourceFactIds: ["geo-04-f02"], retrievalDirection: "feature-set-to-region",
      examSkill: "河川と乾燥地形", mistakeTags: ["大河川", "砂漠"], paperRef: P8,
      prompt: "アジア州の河川と乾燥地域について述べた文として、最も適切なものはどれですか。",
      choices: ["大河川はなく、中央部は一年中多雨である", "長江やガンジス川などが流れ、中央・西アジアには砂漠が広がる", "ナイル川だけが流れ、東アジアに砂漠が集中する", "河川はすべて北極海へ流れ、乾燥地域はない"], answer: 1,
      explanation: "アジアには長江、メコン川、ガンジス川、インダス川などの大河川があり、中央・西アジアには砂漠も広がります。"
    }),
    geoQuestion({
      id: "challenge-geo-04-003", tier: "core", sourceFactIds: ["geo-04-f03"], retrievalDirection: "climate-factor-to-region",
      examSkill: "季節風と気候", mistakeTags: ["モンスーン", "雨季"], paperRef: P8,
      prompt: "東アジア・東南アジア・南アジアの気候に大きな影響を与える風はどれですか。",
      choices: ["偏西風だけ", "貿易風だけ", "極東風だけ", "季節風（モンスーン）"], answer: 3,
      explanation: "東・東南・南アジアは季節風の影響を強く受けます。赤道付近では高温で、雨季に降水量が多くなります。"
    }),
    geoQuestion({
      id: "challenge-geo-04-004", tier: "core", sourceFactIds: ["geo-04-f04"], retrievalDirection: "statistic-to-description",
      examSkill: "アジアの人口", mistakeTags: ["世界人口比", "中国とインド"], paperRef: P8,
      prompt: "アジア州の人口についての説明として、正しいものはどれですか。",
      choices: ["世界人口の約1割で、中国もインドも1億人未満である", "世界人口の約3割で、人口最大国は日本である", "世界人口の約6割を占め、中国とインドはいずれも約14億人である", "世界人口の約9割を占め、人口は乾燥地域だけに集中する"], answer: 2,
      explanation: "アジア州には世界人口のおよそ6割が暮らし、中国とインドはいずれも約14億人の人口をもつ大国です。"
    }),
    geoQuestion({
      id: "challenge-geo-04-005", tier: "core", sourceFactIds: ["geo-04-f05"], retrievalDirection: "policy-to-year",
      examSkill: "中国の人口政策", mistakeTags: ["一人っ子政策", "2015年"], paperRef: P8,
      prompt: "中国で人口増加を抑えるために続けられた政策について、正しい説明はどれですか。",
      choices: ["1979年に廃止され、その後は人口政策を行っていない", "2015年に廃止された一人っ子政策である", "東南アジア10か国が共同で決めた政策である", "沿岸部だけに工場を建てる政策である"], answer: 1,
      explanation: "中国では人口増加を抑える一人っ子政策が行われてきましたが、少子高齢化などを背景に2015年に廃止されました。"
    }),
    geoQuestion({
      id: "challenge-geo-04-006", tier: "challenge", sourceFactIds: ["geo-04-f01"], retrievalDirection: "schematic-position-to-terrain",
      examSkill: "地形模式図の判断", mistakeTags: ["ヒマラヤ山脈", "位置関係"], paperRef: P8, formatTag: "地図読取", figure: ASIA_RELIEF_MAP,
      prompt: "模式図のAはチベット高原の南側に連なる、8000m級の山々を含む山脈です。Aはどれですか。",
      choices: ["ウラル山脈", "ヒマラヤ山脈", "アルプス山脈", "ロッキー山脈"], answer: 1,
      explanation: "チベット高原の南側に連なり、8000m級の高峰を含むのはヒマラヤ山脈です。アジアの大河川の源流域にもなります。"
    }),
    geoQuestion({
      id: "challenge-geo-04-007", tier: "challenge", sourceFactIds: ["geo-04-f13"], retrievalDirection: "wind-direction-to-season",
      examSkill: "南アジアの季節風", mistakeTags: ["夏の季節風", "雨季"], paperRef: P9, formatTag: "図解読取", figure: SUMMER_MONSOON_MAP,
      prompt: "模式図のように湿った風がインド洋から南アジアの陸地へ吹くAの季節は、どのようになりますか。",
      choices: ["夏で雨季になる", "夏で乾季になる", "冬で雨季になる", "冬で一年中凍結する"], answer: 0,
      explanation: "夏はインド洋から湿った季節風が吹くため、南アジアは雨季になります。冬は大陸側から風が吹き、乾季になります。"
    }),
    geoQuestion({
      id: "challenge-geo-04-008", tier: "challenge", sourceFactIds: ["geo-04-f06", "geo-04-f07"], retrievalDirection: "map-location-to-policy",
      examSkill: "中国の経済特区", mistakeTags: ["沿岸部", "開放政策"], paperRef: P9, formatTag: "地図読取", figure: CHINA_COASTAL_ZONE_MAP,
      prompt: "模式図のAのような中国南東部の沿岸都市に、1979年以降の開放政策で設けられた地域は何ですか。",
      choices: ["永久凍土地帯", "遊牧保護区", "経済特区", "石油輸出国機構"], answer: 2,
      explanation: "中国は開放政策のもと、外国資本や技術を受け入れる経済特区を沿岸部に設け、工業化を進めました。"
    }),
    geoQuestion({
      id: "challenge-geo-04-009", tier: "challenge", sourceFactIds: ["geo-04-f09"], retrievalDirection: "before-after-to-industrialization",
      examSkill: "東南アジアの工業化", mistakeTags: ["輸出品変化", "外国企業"], paperRef: P9, formatTag: "資料判断",
      prompt: "東南アジア諸国の輸出品の変化と、その背景の組み合わせとして正しいものはどれですか。",
      choices: ["工業製品から天然ゴムへ―外国企業をすべて退出させた", "鉱産資源から農産物へ―工業団地を廃止した", "農産物だけから石油だけへ―ASEANを解散した", "天然ゴムなどから工業製品へ―工業団地を整備し外国企業を受け入れた"], answer: 3,
      explanation: "東南アジアでは工業団地の整備と外国企業の進出によって工業化が進み、輸出の中心が工業製品へ移りました。"
    }),
    geoQuestion({
      id: "challenge-geo-04-010", tier: "challenge", sourceFactIds: ["geo-04-f08", "geo-04-f10", "geo-04-f11"], retrievalDirection: "region-to-organization-and-religion",
      examSkill: "アジア諸地域の特色", mistakeTags: ["ASEAN", "宗教分布"], paperRef: P9, formatTag: "比較・判断",
      prompt: "アジアの国・地域について述べた組み合わせとして、正しいものはどれですか。",
      choices: ["韓国・台湾―OPECの中心地域", "東南アジア10か国―ASEANで経済協力", "フィリピン―イスラム教だけが信仰される", "赤道付近の島々―キリスト教だけが信仰される"], answer: 1,
      explanation: "東南アジアの10か国はASEANに加盟し、相互の経済協力などを進めます。宗教は地域ごとに異なります。"
    }),
    geoQuestion({
      id: "challenge-geo-04-011", tier: "final", type: "input", answerTarget: "organization", sourceFactIds: ["geo-04-f10"], retrievalDirection: "direct-definition-to-organization",
      examSkill: "国際組織名の再生", mistakeTags: ["東南アジア", "10か国"], paperRef: P9, formatTag: "直接入力",
      prompt: "東南アジアの10か国が加盟し、相互の経済協力などを目的とする組織の略称を答えてください。", answerText: ["ASEAN", "アセアン"], placeholder: "略称を入力",
      explanation: "東南アジア10か国が加盟する東南アジア諸国連合の略称はASEANです。加盟国どうしで経済協力を進めます。"
    }),
    geoQuestion({
      id: "challenge-geo-04-012", tier: "final", type: "input", answerTarget: "industry", sourceFactIds: ["geo-04-f12"], retrievalDirection: "direct-city-growth-to-industry",
      examSkill: "インドの産業の再生", mistakeTags: ["バンガロール", "情報通信"], paperRef: P9, formatTag: "直接入力",
      prompt: "インドのバンガロールなどで、ソフトウェア開発を中心に成長した産業を答えてください。", answerText: ["情報通信技術産業", "情報通信技術（ICT）産業", "ICT産業", "IT産業"], placeholder: "産業名を入力",
      explanation: "インドではバンガロールなどを中心に、ソフトウェア開発を含む情報通信技術（ICT）産業が発達しました。"
    }),
    geoQuestion({
      id: "challenge-geo-04-013", tier: "final", type: "input", answerTarget: "organization", sourceFactIds: ["geo-04-f15"], retrievalDirection: "direct-resource-to-organization",
      examSkill: "資源組織名の再生", mistakeTags: ["石油", "西アジア"], paperRef: P9, formatTag: "直接入力",
      prompt: "西アジアの産油国が多く加盟する石油輸出国機構の略称を答えてください。", answerText: ["OPEC", "オペック"], placeholder: "略称を入力",
      explanation: "石油輸出国機構の略称はOPECです。ペルシャ湾岸に産油国が集中する西アジアの国々も多く加盟しています。"
    }),
    geoQuestion({
      id: "challenge-geo-04-014", tier: "final", type: "input", answerTarget: "religion", sourceFactIds: ["geo-04-f14"], retrievalDirection: "direct-population-share-to-religion",
      examSkill: "南アジアの宗教の再生", mistakeTags: ["インド", "約8割"], paperRef: P9, formatTag: "直接入力",
      prompt: "インドで国民のおよそ8割が信仰している宗教を答えてください。", answerText: ["ヒンドゥー教", "ヒンズー教", "ヒンドゥー"], placeholder: "宗教名を入力",
      explanation: "インドでは国民のおよそ8割がヒンドゥー教を信仰しています。宗教は生活や社会に深く関係しています。"
    }),
    geoQuestion({
      id: "challenge-geo-04-015", tier: "final", type: "input", answerTarget: "resource", sourceFactIds: ["geo-04-f15"], retrievalDirection: "direct-example-to-resource-category",
      examSkill: "鉱産資源名の再生", mistakeTags: ["中央アジア", "クロム"], paperRef: P9, formatTag: "直接入力",
      prompt: "中央アジアに産地が多く、クロムなどが含まれる希少な金属資源の総称を答えてください。", answerText: ["レアメタル", "希少金属"], placeholder: "資源名を入力",
      explanation: "クロムなどの希少な金属資源はレアメタルと呼ばれ、中央アジアにはその産地が多くあります。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
