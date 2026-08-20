(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-12";
  const UNIT = "関東地方・東北地方・北海道地方";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P24 = "Challenge社会「5科のポイントチェック」p.24";
  const P25 = "Challenge社会「5科のポイントチェック」p.25";

  const KANTO_INDUSTRY_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "関東地方の東京湾西側A、東側B、北部内陸Cに工業地域を示した模式図",
    caption: "関東地方の三つの工業地域の位置と特色を表したオリジナル模式図",
    regions: [
      { label: "関東地方", tone: 5, points: [[75, 27], [268, 30], [327, 94], [300, 182], [228, 207], [136, 193], [62, 139], [48, 71]] },
      { label: "東京湾", tone: 4, points: [[176, 134], [218, 120], [249, 144], [224, 180], [188, 170]] },
      { label: "A", tone: 1, highlight: true, points: [[137, 126], [183, 111], [201, 145], [180, 175], [139, 161]] },
      { label: "B", tone: 2, points: [[221, 108], [282, 100], [286, 153], [247, 177], [228, 143]] },
      { label: "C", tone: 3, points: [[91, 49], [264, 48], [286, 95], [218, 107], [139, 122], [72, 101]] }
    ],
    labels: [
      { x: 158, y: 146, text: "A 京浜", emphasis: true },
      { x: 270, y: 134, text: "B 京葉", emphasis: true },
      { x: 178, y: 76, text: "C 北関東", emphasis: true },
      { x: 215, y: 190, text: "東京湾" },
      { x: 180, y: 222, text: "工業分布を簡略化" }
    ]
  };

  const YAMASE_DIAGRAM = {
    kind: "map", width: 360, height: 230,
    alt: "東北地方の太平洋側へ夏に冷たい北東風Aが吹き、中央に奥羽山脈がある模式図",
    caption: "東北地方の冷たい北東風と農業への影響を表したオリジナル模式図",
    regions: [
      { label: "東北地方", tone: 5, points: [[124, 24], [236, 24], [256, 198], [104, 198]] },
      { label: "日本海側", tone: 3, points: [[124, 25], [178, 25], [173, 198], [104, 198]] },
      { label: "太平洋側", tone: 2, highlight: true, points: [[181, 25], [236, 25], [256, 198], [177, 198]] }
    ],
    gridLines: [
      { points: [[180, 34], [177, 82], [184, 126], [176, 187]], emphasis: true },
      { points: [[332, 84], [279, 92], [232, 103]], emphasis: true },
      { points: [[329, 120], [276, 123], [230, 132]], emphasis: true }
    ],
    points: [{ x: 244, y: 102, r: 4 }, { x: 252, y: 125, r: 4 }],
    labels: [
      { x: 60, y: 116, text: "日本海側" },
      { x: 180, y: 115, text: "奥羽山脈", emphasis: true },
      { x: 280, y: 65, text: "A 冷たい北東風", emphasis: true },
      { x: 292, y: 171, text: "太平洋側" },
      { x: 180, y: 220, text: "夏の気流を模式化" }
    ]
  };

  const HOKKAIDO_AGRICULTURE_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "北海道の西部A、南東部B、東端Cに三つの農業地域を示した模式図",
    caption: "石狩平野・十勝平野・根釧台地の農業の違いを表したオリジナル模式図",
    regions: [
      { label: "北海道", tone: 5, points: [[42, 95], [74, 58], [121, 62], [153, 31], [206, 45], [231, 76], [328, 101], [295, 137], [251, 139], [223, 184], [171, 172], [131, 191], [96, 153], [56, 144]] },
      { label: "A", tone: 3, points: [[84, 84], [132, 67], [162, 91], [145, 135], [103, 142], [74, 119]] },
      { label: "B", tone: 2, highlight: true, points: [[164, 103], [225, 89], [261, 121], [226, 166], [172, 163], [145, 135]] },
      { label: "C", tone: 1, points: [[242, 83], [328, 101], [295, 137], [253, 139], [228, 117]] }
    ],
    labels: [
      { x: 113, y: 111, text: "A 石狩", emphasis: true },
      { x: 203, y: 134, text: "B 十勝", emphasis: true },
      { x: 282, y: 111, text: "C 根釧", emphasis: true },
      { x: 180, y: 220, text: "農業地域を簡略化" }
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
      id: "challenge-geo-12-001", tier: "core", sourceFactIds: ["geo-12-f01", "geo-12-f02"], retrievalDirection: "landform-to-agriculture",
      examSkill: "関東の自然と農業", mistakeTags: ["関東ローム", "近郊農業"], paperRef: P24,
      prompt: "関東地方の自然と農業について述べた文として、正しいものはどれですか。",
      choices: ["関東平野は氷河だけでつくられ、畑作は行われない", "火山灰の赤土に覆われた台地で畑作、都市周辺で近郊農業が行われる", "利根川流域では稲作が行われない", "群馬県の高原では熱帯作物だけを育てる"], answer: 1,
      explanation: "関東平野の台地は火山灰が積もった関東ロームに覆われ畑作が行われます。利根川流域は稲作、都市周辺は近郊農業が盛んです。"
    }),
    geoQuestion({
      id: "challenge-geo-12-002", tier: "core", sourceFactIds: ["geo-12-f03", "geo-12-f04", "geo-12-f05"], retrievalDirection: "industrial-region-to-feature",
      examSkill: "関東の工業", mistakeTags: ["京浜", "京葉・北関東"], paperRef: P24,
      prompt: "関東地方の工業地域と特色の組み合わせとして、正しいものはどれですか。",
      choices: ["京浜―農業だけ／京葉―林業だけ", "北関東―水産加工だけ", "京浜―機械・印刷／京葉―鉄鋼・化学／北関東―自動車・電気機械", "京葉―北海道の酪農地域"], answer: 2,
      explanation: "東京・埼玉・神奈川の京浜は機械・印刷、千葉湾岸の京葉は鉄鋼・化学、北関東は自動車・電気機械が特色です。"
    }),
    geoQuestion({
      id: "challenge-geo-12-003", tier: "core", sourceFactIds: ["geo-12-f06", "geo-12-f07", "geo-12-f08"], retrievalDirection: "population-problem-to-response",
      examSkill: "東京の人口集中", mistakeTags: ["都心回帰", "新都心"], paperRef: P24,
      prompt: "東京への人口・機能集中と、その対策について述べた文として正しいものはどれですか。",
      choices: ["国の機関や企業が集中し、さいたま・幕張新都心や多摩ニュータウンが整備された", "国会議事堂や最高裁判所は東京にない", "再開発による都心回帰は起きていない", "人口分散のための都市開発は一度も行われていない"], answer: 0,
      explanation: "東京には政治・経済機能が集中し、再開発で都心回帰も進みます。一方、人口・機能を分散する新都心やニュータウンが整備されました。"
    }),
    geoQuestion({
      id: "challenge-geo-12-004", tier: "core", sourceFactIds: ["geo-12-f09", "geo-12-f10"], retrievalDirection: "climate-to-agriculture",
      examSkill: "東北の気候と農業", mistakeTags: ["奥羽山脈", "やませ"], paperRef: P25,
      prompt: "東北地方の自然と農業について述べた文として、正しいものはどれですか。",
      choices: ["東北地方では稲作も果樹栽培も行われない", "奥羽山脈の東西で気候差はない", "夏の冷たい北東風は豊作だけをもたらす", "秋田・山形・宮城で稲作が盛んで、夏の冷たい北東風は冷害の原因になる"], answer: 3,
      explanation: "日本海側の秋田・山形や太平洋側の宮城で稲作が盛んです。太平洋側では夏の冷たい北東風により冷害が起こることがあります。"
    }),
    geoQuestion({
      id: "challenge-geo-12-005", tier: "core", sourceFactIds: ["geo-12-f13", "geo-12-f14"], retrievalDirection: "region-to-farming-type",
      examSkill: "北海道の農業", mistakeTags: ["石狩平野", "根釧台地"], paperRef: P25,
      prompt: "北海道の農業地域と特色の組み合わせとして、正しいものはどれですか。",
      choices: ["石狩平野―熱帯果樹／十勝平野―近郊農業だけ", "石狩平野―稲作／十勝平野―大規模畑作／根釧台地―酪農", "根釧台地―水田単作だけ", "十勝平野―工業だけで農業はない"], answer: 1,
      explanation: "石狩平野は泥炭地を改良した稲作、十勝平野は広大な畑作、冷涼で霧の多い根釧台地は大規模な酪農が特色です。"
    }),
    geoQuestion({
      id: "challenge-geo-12-006", tier: "challenge", sourceFactIds: ["geo-12-f03", "geo-12-f04", "geo-12-f05"], retrievalDirection: "map-zone-to-industrial-region",
      examSkill: "関東の工業分布", mistakeTags: ["東京湾", "内陸部"], paperRef: P24, formatTag: "地図読取", figure: KANTO_INDUSTRY_MAP,
      prompt: "関東地方の工業分布を示す模式図A〜Cについて、正しい組み合わせはどれですか。",
      choices: ["A北関東・B京浜・C京葉", "A京葉・B北関東・C京浜", "A京浜・B京葉・C北関東", "A中京・B阪神・C瀬戸内"], answer: 2,
      explanation: "東京湾西側のAは京浜、千葉県側のBは京葉、茨城・栃木・群馬など内陸部のCは北関東工業地域です。"
    }),
    geoQuestion({
      id: "challenge-geo-12-007", tier: "challenge", sourceFactIds: ["geo-12-f09", "geo-12-f10"], retrievalDirection: "wind-diagram-to-impact",
      examSkill: "やませと冷害", mistakeTags: ["北東風", "太平洋側"], paperRef: P25, formatTag: "図解読取", figure: YAMASE_DIAGRAM,
      prompt: "東北地方の模式図で、夏に太平洋側へ吹くAの風と影響の組み合わせとして正しいものはどれですか。",
      choices: ["南西風―干害", "やませ―低温による冷害", "季節風ではなく海流―豊作", "フェーン―大雪"], answer: 1,
      explanation: "夏に太平洋側へ吹く冷たい北東風はやませです。気温が上がらず、稲などの生育が悪くなる冷害の原因になります。"
    }),
    geoQuestion({
      id: "challenge-geo-12-008", tier: "challenge", sourceFactIds: ["geo-12-f13", "geo-12-f14"], retrievalDirection: "map-zone-to-agriculture",
      examSkill: "北海道の農業地域", mistakeTags: ["大規模畑作", "酪農"], paperRef: P25, formatTag: "地図読取", figure: HOKKAIDO_AGRICULTURE_MAP,
      prompt: "北海道の農業地域を示す模式図A〜Cについて、正しい説明はどれですか。",
      choices: ["A根釧台地で稲作、B石狩平野で酪農", "A十勝平野、B根釧台地、C石狩平野", "すべて同じ作物だけを栽培する", "A石狩平野で稲作、B十勝平野で畑作、C根釧台地で酪農"], answer: 3,
      explanation: "西部の石狩平野では稲作、南東部の十勝平野では大規模畑作、東端の根釧台地では酪農が発達しています。"
    }),
    geoQuestion({
      id: "challenge-geo-12-009", tier: "challenge", sourceFactIds: ["geo-12-f10", "geo-12-f11", "geo-12-f12"], retrievalDirection: "region-to-industry-and-product",
      examSkill: "東北の産業", mistakeTags: ["果樹", "工業団地"], paperRef: P25, formatTag: "比較・判断",
      prompt: "東北地方の農業・工業・都市について述べた文として、正しいものはどれですか。",
      choices: ["青森・福島・山形では果実生産、各県では伝統工芸、東北自動車道沿いではIC工場がみられる", "岩手県は稲作だけで畜産を行わない", "仙台市は北海道の中心都市である", "東北地方には工業団地が一つもない"], answer: 0,
      explanation: "東北では稲作・畜産・果樹に地域差があり、伝統工芸品も盛んです。高速道路沿いにはIC工場が立地し、仙台は地方中枢都市です。"
    }),
    geoQuestion({
      id: "challenge-geo-12-010", tier: "challenge", sourceFactIds: ["geo-12-f14", "geo-12-f15"], retrievalDirection: "environment-to-lifestyle-and-tourism",
      examSkill: "北海道の自然利用", mistakeTags: ["寒冷対策", "観光資源"], paperRef: P25, formatTag: "課題判断",
      prompt: "北海道の寒冷な自然と、それを生かした生活・観光について正しいものはどれですか。",
      choices: ["寒さへの対策をせず、窓は一重だけである", "流氷や知床は産業や観光に利用されない", "二重窓やロードヒーティングを使い、流氷・知床を観光資源にする", "北海道の地名に先住民の言葉の影響はない"], answer: 2,
      explanation: "寒さや雪に備えて二重窓・ロードヒーティングを用います。消費地から遠い自然環境も、流氷や知床などの観光資源として生かします。"
    }),
    geoQuestion({
      id: "challenge-geo-12-011", tier: "final", type: "input", answerTarget: "soil", sourceFactIds: ["geo-12-f01"], retrievalDirection: "direct-definition-to-term",
      examSkill: "土壌名の再生", mistakeTags: ["火山灰", "関東平野"], paperRef: `${P24}／${P25}`, formatTag: "直接入力",
      prompt: "関東平野の台地に広がる、火山灰が積もってできた赤土を何といいますか。", answerText: ["関東ローム", "関東ローム層"], placeholder: "土壌名を入力",
      explanation: "関東平野の台地を覆う、火山灰が積もってできた赤土は関東ロームです。畑作地域として利用されています。"
    }),
    geoQuestion({
      id: "challenge-geo-12-012", tier: "final", type: "input", answerTarget: "wind", sourceFactIds: ["geo-12-f09"], retrievalDirection: "direct-feature-to-wind",
      examSkill: "風の名称の再生", mistakeTags: ["夏", "冷たい北東風"], paperRef: `${P24}／${P25}`, formatTag: "直接入力",
      prompt: "東北地方の夏に吹き、冷害の原因となる冷たい北東風を何といいますか。", answerText: ["やませ"], placeholder: "風の名称を入力",
      explanation: "東北地方の太平洋側へ夏に吹く冷たい北東風はやませです。低温により稲などに冷害をもたらします。"
    }),
    geoQuestion({
      id: "challenge-geo-12-013", tier: "final", type: "input", answerTarget: "coast", sourceFactIds: ["geo-12-f12"], retrievalDirection: "direct-location-to-landform",
      examSkill: "海岸地形名の再生", mistakeTags: ["三陸海岸", "複雑な海岸線"], paperRef: P25, formatTag: "直接入力",
      prompt: "三陸海岸にみられる、山地が沈んでできた複雑な海岸線の海岸を何といいますか。", answerText: ["リアス海岸", "リアス式海岸"], placeholder: "海岸地形名を入力",
      explanation: "山地が沈み、谷に海水が入り込んで複雑な海岸線になった海岸はリアス海岸です。三陸海岸が代表例です。"
    }),
    geoQuestion({
      id: "challenge-geo-12-014", tier: "final", type: "input", answerTarget: "plateau", sourceFactIds: ["geo-12-f13", "geo-12-f14"], retrievalDirection: "direct-feature-to-region",
      examSkill: "北海道地形名の再生", mistakeTags: ["酪農", "霧"], paperRef: P25, formatTag: "直接入力",
      prompt: "北海道東部にあり、濃霧などで作物栽培に向かず大規模な酪農が発達した台地を答えてください。", answerText: ["根釧台地"], placeholder: "台地名を入力",
      explanation: "北海道東部の根釧台地は冷涼で霧が多く、作物栽培に向きにくいため、大規模な酪農地帯になりました。"
    }),
    geoQuestion({
      id: "challenge-geo-12-015", tier: "final", type: "input", answerTarget: "city", sourceFactIds: ["geo-12-f15"], retrievalDirection: "direct-role-to-city",
      examSkill: "中心都市名の再生", mistakeTags: ["北海道", "中心都市"], paperRef: P25, formatTag: "直接入力",
      prompt: "北海道の政治・経済・文化の中心となっている都市を答えてください。", answerText: ["札幌市", "札幌"], placeholder: "都市名を入力",
      explanation: "北海道の中心都市は札幌市です。北海道の都市や地名にはアイヌ語に由来する名称も多くあります。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
