(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-06";
  const UNIT = "南北アメリカ州・オセアニア州";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P12 = "Challenge社会「5科のポイントチェック」p.12";
  const P13 = "Challenge社会「5科のポイントチェック」p.13";

  const NORTH_AMERICA_RELIEF_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "北アメリカを西部山地・中央平原・東部山地に分けた模式図。中央のAを強調",
    caption: "ロッキー山脈・中央平原・アパラチア山脈の東西配置を表したオリジナル模式図",
    regions: [
      { label: "西部山地", tone: 1, points: [[25, 31], [95, 31], [116, 192], [35, 192]] },
      { label: "中央平原", tone: 3, highlight: true, points: [[100, 31], [265, 31], [245, 192], [116, 192]] },
      { label: "東部山地", tone: 5, points: [[270, 31], [335, 31], [326, 192], [245, 192]] }
    ],
    gridLines: [
      { points: [[78, 43], [87, 83], [72, 124], [94, 177]], emphasis: true },
      { points: [[296, 47], [286, 90], [304, 130], [285, 178]], emphasis: true }
    ],
    labels: [
      { x: 69, y: 111, text: "ロッキー山脈" },
      { x: 181, y: 105, text: "A", emphasis: true },
      { x: 295, y: 111, text: "アパラチア山脈" },
      { x: 32, y: 209, text: "西", anchor: "start" },
      { x: 328, y: 209, text: "東" }
    ]
  };

  const SOUTH_AMERICA_REGIONS_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "南アメリカを西部の山脈、北部内陸の流域、南東部の平原に分けた模式図。北部内陸をAと表示",
    caption: "アンデス山脈・アマゾン川流域・パンパの位置関係を表したオリジナル模式図",
    regions: [
      { label: "大陸", tone: 5, points: [[115, 19], [274, 39], [294, 93], [254, 132], [224, 202], [179, 166], [151, 109], [92, 68]] },
      { label: "アンデス", tone: 1, points: [[92, 68], [115, 19], [138, 43], [151, 109], [179, 166], [197, 194], [181, 201], [153, 172], [124, 117]] },
      { label: "アマゾン", tone: 2, highlight: true, points: [[139, 48], [257, 53], [275, 92], [233, 119], [155, 107]] },
      { label: "パンパ", tone: 3, points: [[221, 131], [254, 132], [235, 177], [202, 170]] }
    ],
    gridLines: [{ points: [[147, 83], [205, 79], [260, 90]], dashed: true }],
    labels: [
      { x: 116, y: 107, text: "アンデス" },
      { x: 211, y: 86, text: "A", emphasis: true },
      { x: 229, y: 157, text: "パンパ" },
      { x: 310, y: 94, text: "大西洋" }
    ]
  };

  const AUSTRALIA_INDUSTRY_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "オーストラリアの乾燥した内陸部Aと、温暖な沿岸部、鉱山を表した模式図",
    caption: "オーストラリアの乾燥分布と牧畜・鉱業の関係を表したオリジナル模式図",
    regions: [
      { label: "沿岸部", tone: 2, points: [[37, 59], [95, 27], [261, 34], [327, 77], [304, 169], [228, 194], [87, 177], [28, 117]] },
      { label: "内陸部", tone: 5, highlight: true, points: [[93, 68], [143, 49], [241, 58], [281, 91], [262, 148], [211, 171], [116, 155], [72, 112]] }
    ],
    gridLines: [
      { points: [[63, 169], [104, 146], [151, 157]], dashed: true },
      { points: [[240, 62], [270, 87], [257, 116]], dashed: true }
    ],
    points: [
      { x: 112, y: 91, r: 6 },
      { x: 235, y: 123, r: 6 },
      { x: 286, y: 151, r: 6 }
    ],
    labels: [
      { x: 178, y: 111, text: "A", emphasis: true },
      { x: 112, y: 82, text: "鉱山" },
      { x: 235, y: 114, text: "鉱山" },
      { x: 178, y: 210, text: "南側の沿岸部" }
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
      type: "choice", childIds: ["child-1"], packId: PACK_ID, cornerId: UNIT_ID, unitId: UNIT_ID,
      subject: "社会", unit: UNIT, sourceTag: SOURCE_TAG, qualityStatus: "content-audited",
      contentStatus: "content-final", formatTag: "短問", ...defaults, ...question,
      variantGroup: question.variantGroup || `${UNIT_ID}-${question.sourceFactIds[0]}`
    };
  }

  const questions = [
    geoQuestion({
      id: "challenge-geo-06-001", tier: "core", sourceFactIds: ["geo-06-f01"], retrievalDirection: "west-east-to-landform",
      examSkill: "北アメリカの地形", mistakeTags: ["ロッキー山脈", "中央平原"], paperRef: P12,
      prompt: "アメリカ合衆国の地形を西から東へ並べたものとして、最も適切なものはどれですか。",
      choices: ["アパラチア山脈―中央平原―ロッキー山脈", "ロッキー山脈―中央平原―アパラチア山脈", "アンデス山脈―パンパ―アパラチア山脈", "ヒマラヤ山脈―中央平原―アルプス山脈"], answer: 1,
      explanation: "アメリカ合衆国では西にロッキー山脈、東にアパラチア山脈があり、その間にグレートプレーンズやプレーリーが広がります。"
    }),
    geoQuestion({
      id: "challenge-geo-06-002", tier: "core", sourceFactIds: ["geo-06-f02", "geo-06-f07"], retrievalDirection: "history-to-society",
      examSkill: "北アメリカの人々", mistakeTags: ["移民", "多文化社会"], paperRef: `${P12}／${P13}`,
      prompt: "北アメリカの人口と歴史について述べた文として、正しいものはどれですか。",
      choices: ["ヨーロッパ系移民だけが住み、先住民は存在しなかった", "アフリカから渡った人々はすべて自発的な移民だった", "多様な出自の人々が暮らし、ヒスパニックの割合も増えている", "現在も移民を受け入れず、単一民族社会を保っている"], answer: 2,
      explanation: "先住民、ヨーロッパ系、奴隷として連行されたアフリカ系、増加するヒスパニックなどが暮らす多民族・多文化社会です。"
    }),
    geoQuestion({
      id: "challenge-geo-06-003", tier: "core", sourceFactIds: ["geo-06-f03"], retrievalDirection: "method-to-agriculture",
      examSkill: "アメリカ合衆国の農業", mistakeTags: ["企業的農業", "適地適作"], paperRef: P12,
      prompt: "アメリカ合衆国の農業の特色として、最も適切なものはどれですか。",
      choices: ["大型機械を使い、地域に適した作物を大規模に生産する", "すべての農家が手作業で自給用作物だけを育てる", "乾燥地域でも水を使わず米だけを育てる", "国内消費を禁止し、家畜を飼育しない"], answer: 0,
      explanation: "大型機械を使う企業的農業と適地適作により、小麦や牛肉などを安く大量生産し、世界へ輸出します。"
    }),
    geoQuestion({
      id: "challenge-geo-06-004", tier: "core", sourceFactIds: ["geo-06-f04", "geo-06-f05"], retrievalDirection: "region-to-industry",
      examSkill: "アメリカ合衆国の工業", mistakeTags: ["サンベルト", "シリコンバレー"], paperRef: P12,
      prompt: "アメリカ合衆国の新しい工業地域について述べた文として、正しいものはどれですか。",
      choices: ["北緯37度以北だけをサンベルトと呼ぶ", "シリコンバレーは石炭産地だけで発達した", "ヒューストンでは農業以外の産業を禁止している", "北緯37度以南で工業が発達し、情報技術や航空宇宙産業も集まる"], answer: 3,
      explanation: "北緯37度以南のサンベルトでは工業が発展し、シリコンバレーの情報技術やヒューストンの航空宇宙産業が代表例です。"
    }),
    geoQuestion({
      id: "challenge-geo-06-005", tier: "core", sourceFactIds: ["geo-06-f08", "geo-06-f10"], retrievalDirection: "river-to-environment",
      examSkill: "アマゾン川流域", mistakeTags: ["流域面積", "熱帯雨林"], paperRef: P13,
      prompt: "アマゾン川とその流域についての説明として、最も適切なものはどれですか。",
      choices: ["流域面積が世界一で、広大な熱帯雨林が広がる", "ヨーロッパを流れ、地中海へ注ぐ", "流域全体が寒帯で、森林は存在しない", "鉱産資源の開発が禁止され、環境問題はない"], answer: 0,
      explanation: "アマゾン川は流域面積が世界一で、流域には熱帯雨林が広がります。開発による森林破壊が大きな課題です。"
    }),
    geoQuestion({
      id: "challenge-geo-06-006", tier: "challenge", sourceFactIds: ["geo-06-f01"], retrievalDirection: "schematic-position-to-landform",
      examSkill: "北アメリカ地形の判断", mistakeTags: ["グレートプレーンズ", "プレーリー"], paperRef: P12, formatTag: "地図読取", figure: NORTH_AMERICA_RELIEF_MAP,
      prompt: "模式図のAはロッキー山脈とアパラチア山脈の間に広がる地域です。Aの説明として正しいものはどれですか。",
      choices: ["サハラ砂漠とナイル川がある", "グレートプレーンズやプレーリーが広がる", "アルプス山脈とフィヨルドがある", "熱帯の島国だけで構成される"], answer: 1,
      explanation: "二つの山地の間にはグレートプレーンズやプレーリーと呼ばれる広大な平原・草原が広がります。"
    }),
    geoQuestion({
      id: "challenge-geo-06-007", tier: "challenge", sourceFactIds: ["geo-06-f08", "geo-06-f09", "geo-06-f11"], retrievalDirection: "map-zone-to-region-feature",
      examSkill: "南アメリカの地域差", mistakeTags: ["アマゾン川", "パンパ"], paperRef: P13, formatTag: "地図読取", figure: SOUTH_AMERICA_REGIONS_MAP,
      prompt: "模式図のAは南アメリカ北部の広い流域です。この地域の自然として最も適切なものはどれですか。",
      choices: ["氷河に削られた入り江が連続する", "温帯草原で小麦だけを育てる", "熱帯雨林が広がり、大河川が流れる", "一年中雪と氷に覆われる"], answer: 2,
      explanation: "Aはアマゾン川流域です。流域面積が世界一の大河川と広大な熱帯雨林があり、開発による環境破壊が問題です。"
    }),
    geoQuestion({
      id: "challenge-geo-06-008", tier: "challenge", sourceFactIds: ["geo-06-f12", "geo-06-f13"], retrievalDirection: "map-zone-to-industry",
      examSkill: "オーストラリアの自然と産業", mistakeTags: ["内陸乾燥", "露天掘り"], paperRef: P13, formatTag: "地図読取", figure: AUSTRALIA_INDUSTRY_MAP,
      prompt: "模式図のAは乾燥した内陸部です。オーストラリアの産業として正しい組み合わせはどれですか。",
      choices: ["内陸の稲作と沿岸の遊牧", "全土の熱帯果樹栽培だけ", "内陸の羊の放牧と鉄鉱石・石炭の露天掘り", "氷雪地帯での林業だけ"], answer: 2,
      explanation: "内陸部は乾燥しており羊の放牧が盛んです。鉄鉱石や石炭の鉱山では地表から掘る露天掘りが行われます。"
    }),
    geoQuestion({
      id: "challenge-geo-06-009", tier: "challenge", sourceFactIds: ["geo-06-f09", "geo-06-f10", "geo-06-f11"], retrievalDirection: "development-to-environmental-impact",
      examSkill: "南アメリカの開発", mistakeTags: ["森林破壊", "産業"], paperRef: P13, formatTag: "因果判断",
      prompt: "南アメリカの産業発展と自然環境について述べた文として、正しいものはどれですか。",
      choices: ["アマゾン川流域では開発がなく、森林面積は変化していない", "アンデス山脈では標高差を利用した農業や鉱山開発が行われる", "ブラジルでは工業化もコーヒー栽培も行われない", "アルゼンチンのパンパでは熱帯雨林だけが広がる"], answer: 1,
      explanation: "アンデス山脈では標高差を利用した農業や鉱山開発が行われます。一方、アマゾンでは開発による森林破壊が深刻です。"
    }),
    geoQuestion({
      id: "challenge-geo-06-010", tier: "challenge", sourceFactIds: ["geo-06-f05", "geo-06-f06", "geo-06-f14", "geo-06-f15"], retrievalDirection: "society-change-to-example",
      examSkill: "文化と多文化社会", mistakeTags: ["世界文化", "移民政策"], paperRef: `${P12}／${P13}`, formatTag: "比較・判断",
      prompt: "北アメリカとオーストラリアの社会について述べた組み合わせとして、正しいものはどれですか。",
      choices: ["アメリカ合衆国―映画や音楽、食文化が世界へ広がった", "オーストラリア―現在も白豪主義だけを維持している", "アメリカ合衆国―多国籍企業や研究所は存在しない", "オーストラリア―移民を受け入れず先住民を保護しない"], answer: 0,
      explanation: "アメリカの映画・音楽・食文化は世界へ広がりました。オーストラリアは白豪主義から多文化社会を進める政策へ転換しました。"
    }),
    geoQuestion({
      id: "challenge-geo-06-011", tier: "final", type: "input", answerTarget: "people", sourceFactIds: ["geo-06-f07"], retrievalDirection: "direct-definition-to-people",
      examSkill: "人口用語の再生", mistakeTags: ["ラテンアメリカ", "スペイン語"], paperRef: `${P12}／${P13}`, formatTag: "直接入力",
      prompt: "スペイン語を話すラテンアメリカ出身の、アメリカ合衆国への移民を何といいますか。", answerText: ["ヒスパニック"], placeholder: "用語を入力",
      explanation: "スペイン語を話すラテンアメリカ出身の移民はヒスパニックと呼ばれ、アメリカ合衆国で人口割合が増えています。"
    }),
    geoQuestion({
      id: "challenge-geo-06-012", tier: "final", type: "input", answerTarget: "region", sourceFactIds: ["geo-06-f04"], retrievalDirection: "direct-latitude-to-region",
      examSkill: "工業地域名の再生", mistakeTags: ["北緯37度", "南部"], paperRef: `${P12}／${P13}`, formatTag: "直接入力",
      prompt: "アメリカ合衆国の北緯37度以南に広がる、工業が発達した地域を何といいますか。", answerText: ["サンベルト"], placeholder: "地域名を入力",
      explanation: "北緯37度以南に広がる工業発達地域はサンベルトです。情報技術や航空宇宙などの産業も発達しています。"
    }),
    geoQuestion({
      id: "challenge-geo-06-013", tier: "final", type: "input", answerTarget: "river", sourceFactIds: ["geo-06-f08"], retrievalDirection: "direct-superlative-to-river",
      examSkill: "河川名の再生", mistakeTags: ["流域面積世界一", "熱帯雨林"], paperRef: P13, formatTag: "直接入力",
      prompt: "流域面積が世界一で、流域に広大な熱帯雨林が広がる河川を答えてください。", answerText: ["アマゾン川", "アマゾン"], placeholder: "河川名を入力",
      explanation: "流域面積が世界一で、広大な熱帯雨林の中を流れる河川はアマゾン川です。流域の森林破壊が大きな課題です。"
    }),
    geoQuestion({
      id: "challenge-geo-06-014", tier: "final", type: "input", answerTarget: "plain", sourceFactIds: ["geo-06-f11"], retrievalDirection: "direct-region-feature-to-plain",
      examSkill: "平原名の再生", mistakeTags: ["アルゼンチン", "牛・小麦"], paperRef: P13, formatTag: "直接入力",
      prompt: "アルゼンチンで牛の放牧や小麦栽培が盛んな温帯草原を何といいますか。", answerText: ["パンパ"], placeholder: "地形名を入力",
      explanation: "アルゼンチンのラプラタ川流域に広がり、牛の放牧や小麦栽培が盛んな温帯草原はパンパです。"
    }),
    geoQuestion({
      id: "challenge-geo-06-015", tier: "final", type: "input", answerTarget: "people", sourceFactIds: ["geo-06-f14"], retrievalDirection: "direct-country-to-indigenous-people",
      examSkill: "先住民名の再生", mistakeTags: ["オーストラリア", "先住民保護"], paperRef: P13, formatTag: "直接入力",
      prompt: "オーストラリアで保護政策の対象となっている先住民を何といいますか。", answerText: ["アボリジニ", "アボリジナルピープル"], placeholder: "名称を入力",
      explanation: "オーストラリアの先住民はアボリジニです。白豪主義から多文化社会を進める政策への転換後、保護も進められました。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
