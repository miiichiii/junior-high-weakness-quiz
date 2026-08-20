(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-05";
  const UNIT = "ヨーロッパ州・アフリカ州";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P10 = "Challenge社会「5科のポイントチェック」p.10";
  const P11 = "Challenge社会「5科のポイントチェック」p.11";

  const EUROPE_CLIMATE_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "大西洋からヨーロッパ西部へ向かう暖流と偏西風を線で示した模式図",
    caption: "北大西洋海流と偏西風がヨーロッパ西部へ熱を運ぶ関係を表したオリジナル模式図",
    regions: [
      { label: "大西洋", tone: 4, points: [[18, 28], [158, 28], [158, 194], [18, 194]] },
      { label: "ヨーロッパ", tone: 2, highlight: true, points: [[203, 32], [328, 48], [340, 105], [305, 174], [228, 182], [186, 127]] }
    ],
    gridLines: [
      { points: [[49, 172], [77, 137], [105, 111], [147, 92], [205, 84]], emphasis: true },
      { points: [[42, 68], [201, 68]], dashed: true },
      { points: [[42, 105], [201, 105]], dashed: true }
    ],
    points: [{ x: 205, y: 84, r: 5 }],
    labels: [
      { x: 91, y: 154, text: "暖流A", emphasis: true },
      { x: 122, y: 57, text: "偏西風 →" },
      { x: 265, y: 106, text: "西ヨーロッパ" },
      { x: 52, y: 198, text: "低緯度側", anchor: "start" }
    ]
  };

  const EUROPE_FARMING_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "ヨーロッパを北部・西部内陸・地中海沿岸の三地域に分け、南部のAを強調した模式図",
    caption: "ヨーロッパの気候と農業地域の南北差を表したオリジナル模式図",
    regions: [
      { label: "北部", tone: 1, points: [[112, 25], [256, 25], [283, 76], [95, 76]] },
      { label: "西部・内陸", tone: 3, points: [[95, 80], [283, 80], [307, 139], [73, 139]] },
      { label: "地中海沿岸", tone: 5, highlight: true, points: [[73, 143], [307, 143], [278, 194], [99, 194]] }
    ],
    gridLines: [
      { points: [[73, 140], [307, 140]], dashed: true },
      { points: [[94, 77], [284, 77]], dashed: true }
    ],
    labels: [
      { x: 190, y: 57, text: "酪農" },
      { x: 190, y: 112, text: "混合農業" },
      { x: 190, y: 174, text: "A", emphasis: true },
      { x: 42, y: 183, text: "地中海", anchor: "start" }
    ]
  };

  const AFRICA_REGIONS_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "アフリカを北部・ギニア湾岸・南部に分け、ギニア湾岸Aを強調した模式図",
    caption: "アフリカの自然・資源・農産物の地域差を表したオリジナル模式図",
    regions: [
      { label: "北部", tone: 5, points: [[107, 26], [253, 26], [296, 76], [72, 76]] },
      { label: "中央部", tone: 3, points: [[72, 80], [296, 80], [267, 145], [103, 145]] },
      { label: "南部", tone: 1, points: [[103, 149], [267, 149], [223, 203], [151, 203]] },
      { label: "ギニア湾岸", tone: 2, highlight: true, points: [[72, 105], [150, 105], [150, 139], [85, 139]] }
    ],
    gridLines: [
      { points: [[73, 78], [296, 78]], dashed: true },
      { points: [[103, 147], [267, 147]], dashed: true }
    ],
    labels: [
      { x: 183, y: 56, text: "サハラ砂漠" },
      { x: 112, y: 126, text: "A", emphasis: true },
      { x: 185, y: 176, text: "鉱産資源" },
      { x: 39, y: 132, text: "ギニア湾", anchor: "start" }
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
      id: "challenge-geo-05-001", tier: "core", sourceFactIds: ["geo-05-f01", "geo-05-f02"], retrievalDirection: "cause-to-climate-and-farming",
      examSkill: "西ヨーロッパの気候", mistakeTags: ["北大西洋海流", "偏西風"], paperRef: P10,
      prompt: "西ヨーロッパが高緯度でも比較的温暖である理由として、最も適切なものはどれですか。",
      choices: ["暖流の北大西洋海流と偏西風の影響を受ける", "寒流と季節風が一年中南から吹く", "サハラ砂漠から熱風だけが吹き込む", "標高が低いことだけで気候が決まる"], answer: 0,
      explanation: "大西洋を北上する暖流の北大西洋海流と偏西風が熱を運ぶため、西ヨーロッパは高緯度でも比較的温暖です。"
    }),
    geoQuestion({
      id: "challenge-geo-05-002", tier: "core", sourceFactIds: ["geo-05-f03"], retrievalDirection: "climate-to-farming",
      examSkill: "地中海式農業", mistakeTags: ["夏の乾燥", "作物"], paperRef: P10,
      prompt: "地中海沿岸で夏の乾燥に適応して栽培される代表的な作物の組み合わせはどれですか。",
      choices: ["米と茶", "さとうきびとバナナ", "オリーブとぶどう", "じゃがいもとライ麦"], answer: 2,
      explanation: "地中海沿岸では夏に乾燥する気候を生かし、乾燥に強いオリーブやぶどうを栽培する地中海式農業が盛んです。"
    }),
    geoQuestion({
      id: "challenge-geo-05-003", tier: "core", sourceFactIds: ["geo-05-f04", "geo-05-f08"], retrievalDirection: "region-to-livelihood-and-landform",
      examSkill: "北部・山地の特色", mistakeTags: ["酪農", "フィヨルド"], paperRef: `${P10}／${P11}`,
      prompt: "北ヨーロッパやアルプス周辺の特色として、正しい組み合わせはどれですか。",
      choices: ["高温を生かした稲作と三角州", "低い平均気温を生かした酪農とノルウェーのフィヨルド", "乾燥を生かした綿花栽培とサバナ", "熱帯雨林での焼畑とマングローブ"], answer: 1,
      explanation: "平均気温が低い北ヨーロッパやアルプス周辺では酪農が盛んです。ノルウェー沿岸には氷河が削ったフィヨルドがあります。"
    }),
    geoQuestion({
      id: "challenge-geo-05-004", tier: "core", sourceFactIds: ["geo-05-f05", "geo-05-f06", "geo-05-f07"], retrievalDirection: "organization-to-features",
      examSkill: "EUの特色", mistakeTags: ["加盟国数", "ユーロ"], paperRef: `${P10}／${P11}`,
      prompt: "ヨーロッパ連合について述べた文として、正しいものはどれですか。",
      choices: ["すべての国が同じ言語を公用語としている", "2020年に加盟国が初めて10か国になった", "アフリカの産油国だけで構成されている", "2024年に27か国が加盟し、多くの国がユーロを使う"], answer: 3,
      explanation: "EUは経済的な結びつきを強める組織で、2024年時点の加盟国は27か国です。多くの加盟国が共通通貨ユーロを使います。"
    }),
    geoQuestion({
      id: "challenge-geo-05-005", tier: "core", sourceFactIds: ["geo-05-f09"], retrievalDirection: "feature-set-to-region",
      examSkill: "アフリカの自然", mistakeTags: ["サハラ砂漠", "ナイル川"], paperRef: P11,
      prompt: "北アフリカの自然と資源についての説明として、最も適切なものはどれですか。",
      choices: ["サハラ砂漠が広がり、ナイル川が流れ、原油産地も多い", "一年中氷雪に覆われ、石炭だけを産出する", "熱帯雨林だけが広がり、河川は存在しない", "全域が温帯で、地中海式農業だけが行われる"], answer: 0,
      explanation: "北アフリカには広大なサハラ砂漠が広がり、東部をナイル川が流れます。原油の産出地も多くあります。"
    }),
    geoQuestion({
      id: "challenge-geo-05-006", tier: "challenge", sourceFactIds: ["geo-05-f01", "geo-05-f02"], retrievalDirection: "diagram-to-climate-cause",
      examSkill: "海流と風の判断", mistakeTags: ["暖流", "西岸海洋性気候"], paperRef: P10, formatTag: "図解読取", figure: EUROPE_CLIMATE_MAP,
      prompt: "模式図の暖流Aと偏西風の影響を受ける西ヨーロッパでは、どのような特色が見られますか。",
      choices: ["高緯度でも比較的温暖で、混合農業が行われる", "一年中乾燥し、遊牧だけが行われる", "一年中氷雪に覆われ、農業はできない", "夏だけ寒流が流れ、熱帯作物を育てる"], answer: 0,
      explanation: "北大西洋海流と偏西風の影響で比較的温暖なため、小麦栽培と家畜飼育を組み合わせた混合農業が行われます。"
    }),
    geoQuestion({
      id: "challenge-geo-05-007", tier: "challenge", sourceFactIds: ["geo-05-f03", "geo-05-f04"], retrievalDirection: "schematic-zone-to-farming",
      examSkill: "農業地域の判断", mistakeTags: ["地中海沿岸", "農業区分"], paperRef: P10, formatTag: "地図読取", figure: EUROPE_FARMING_MAP,
      prompt: "模式図のAは地中海沿岸です。この地域の農業として最も適切なものはどれですか。",
      choices: ["冷涼な気候を生かした酪農のみ", "夏の乾燥に強い果樹と冬の小麦を育てる", "タイガを切り開いた企業的農業", "カカオ豆だけを育てるプランテーション"], answer: 1,
      explanation: "地中海沿岸では夏の乾燥に強いオリーブやぶどうなどの果樹を育て、冬には小麦を栽培します。"
    }),
    geoQuestion({
      id: "challenge-geo-05-008", tier: "challenge", sourceFactIds: ["geo-05-f10", "geo-05-f11"], retrievalDirection: "map-zone-to-crop",
      examSkill: "アフリカの農産物", mistakeTags: ["ギニア湾岸", "カカオ豆"], paperRef: P11, formatTag: "地図読取", figure: AFRICA_REGIONS_MAP,
      prompt: "模式図のAに位置するガーナやコートジボワールで、輸出用に大規模栽培される作物は何ですか。",
      choices: ["小麦", "オリーブ", "カカオ豆", "じゃがいも"], answer: 2,
      explanation: "ギニア湾岸のガーナやコートジボワールでは、プランテーションで輸出用のカカオ豆栽培が盛んです。"
    }),
    geoQuestion({
      id: "challenge-geo-05-009", tier: "challenge", sourceFactIds: ["geo-05-f10", "geo-05-f11", "geo-05-f12", "geo-05-f15"], retrievalDirection: "export-structure-to-risk",
      examSkill: "モノカルチャー経済", mistakeTags: ["輸出依存", "価格変動"], paperRef: P11, formatTag: "資料判断",
      prompt: "特定の農産物や鉱産資源に輸出を依存する国で起こりやすい問題はどれですか。",
      choices: ["世界市場の価格変動で国の収入が不安定になる", "輸出品が多様化して価格変動の影響がなくなる", "すべての食料を国内で十分に生産できる", "植民地支配の影響が完全になくなる"], answer: 0,
      explanation: "少数の輸出品に依存すると、その商品の価格下落が国全体の収入を直撃します。産業の多様化が課題になります。"
    }),
    geoQuestion({
      id: "challenge-geo-05-010", tier: "challenge", sourceFactIds: ["geo-05-f12", "geo-05-f13", "geo-05-f14", "geo-05-f15"], retrievalDirection: "history-to-present-issue",
      examSkill: "歴史と現在の課題", mistakeTags: ["植民地支配", "公用語"], paperRef: P11, formatTag: "因果判断",
      prompt: "アフリカの歴史と現在の社会を結びつけた説明として、正しいものはどれですか。",
      choices: ["植民地支配を受けなかったため、ヨーロッパの言語は使われない", "独立後に国境がすべて民族分布どおり引き直された", "植民地支配の影響で英語やフランス語を公用語とする国が多い", "奴隷として連行された人々はヨーロッパだけへ移動した"], answer: 2,
      explanation: "ヨーロッパ諸国の植民地支配を受けた影響から、現在も英語やフランス語を公用語とする国が多くあります。"
    }),
    geoQuestion({
      id: "challenge-geo-05-011", tier: "final", type: "input", answerTarget: "landform", sourceFactIds: ["geo-05-f08"], retrievalDirection: "direct-definition-to-landform",
      examSkill: "地形用語の再生", mistakeTags: ["氷河", "入り江"], paperRef: `${P10}／${P11}`, formatTag: "直接入力",
      prompt: "氷河によって削られてできた、複雑に入り組んだ入り江を何といいますか。", answerText: ["フィヨルド"], placeholder: "地形名を入力",
      explanation: "氷河が谷を削り、その後海水が入り込んでできた複雑な入り江はフィヨルドです。ノルウェー沿岸で見られます。"
    }),
    geoQuestion({
      id: "challenge-geo-05-012", tier: "final", type: "input", answerTarget: "organization", sourceFactIds: ["geo-05-f05", "geo-05-f06"], retrievalDirection: "direct-description-to-organization",
      examSkill: "国際組織名の再生", mistakeTags: ["ヨーロッパ連合", "27か国"], paperRef: `${P10}／${P11}`, formatTag: "直接入力",
      prompt: "2024年時点で27か国が加盟し、経済的な結びつきを強めるヨーロッパの組織の略称を答えてください。", answerText: ["EU", "イーユー"], placeholder: "略称を入力",
      explanation: "ヨーロッパ連合の略称はEUです。イギリスは2020年2月に離脱し、2024年時点の加盟国は27か国です。"
    }),
    geoQuestion({
      id: "challenge-geo-05-013", tier: "final", type: "input", answerTarget: "agriculture", sourceFactIds: ["geo-05-f10"], retrievalDirection: "direct-definition-to-agriculture",
      examSkill: "農業用語の再生", mistakeTags: ["商品作物", "大農園"], paperRef: P11, formatTag: "直接入力",
      prompt: "植民地時代に開かれ、輸出用の商品作物を大規模に栽培する農園を何といいますか。", answerText: ["プランテーション", "プランテーション農園"], placeholder: "用語を入力",
      explanation: "植民地時代に開かれ、輸出向けの商品作物を大量生産する大農園はプランテーションです。"
    }),
    geoQuestion({
      id: "challenge-geo-05-014", tier: "final", type: "input", answerTarget: "policy", sourceFactIds: ["geo-05-f12"], retrievalDirection: "direct-history-to-policy",
      examSkill: "歴史用語の再生", mistakeTags: ["南アフリカ共和国", "人種隔離"], paperRef: P11, formatTag: "直接入力",
      prompt: "南アフリカ共和国でかつて行われていた人種隔離政策を何といいますか。", answerText: ["アパルトヘイト"], placeholder: "政策名を入力",
      explanation: "南アフリカ共和国で行われた人種隔離政策はアパルトヘイトです。現在は廃止されています。"
    }),
    geoQuestion({
      id: "challenge-geo-05-015", tier: "final", type: "input", answerTarget: "river", sourceFactIds: ["geo-05-f09"], retrievalDirection: "direct-superlative-to-river",
      examSkill: "河川名の再生", mistakeTags: ["世界最長", "北東アフリカ"], paperRef: P11, formatTag: "直接入力",
      prompt: "アフリカ北東部を流れ、世界最長とされる河川を答えてください。", answerText: ["ナイル川", "ナイル"], placeholder: "河川名を入力",
      explanation: "アフリカ北東部を北へ流れ、地中海へ注ぐ世界最長の河川はナイル川です。流域では古くから農業も行われてきました。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
