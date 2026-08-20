(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-08";
  const UNIT = "世界から見た日本の自然・人口";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P16 = "Challenge社会「5科のポイントチェック」p.16";
  const P17 = "Challenge社会「5科のポイントチェック」p.17";

  const JAPAN_FOSSA_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "日本列島を東西に分ける帯状地域Aと、その西端を走る線を示した模式図",
    caption: "日本列島を東西に分ける大地溝帯の位置を表したオリジナル模式図",
    regions: [
      { label: "西日本", tone: 5, points: [[38, 171], [71, 146], [105, 148], [132, 119], [152, 91], [162, 52], [180, 49], [180, 99], [160, 137], [125, 166], [75, 187]] },
      { label: "東日本", tone: 2, highlight: true, points: [[180, 49], [199, 38], [214, 59], [241, 61], [276, 77], [313, 111], [297, 132], [256, 116], [223, 107], [199, 119], [180, 99]] },
      { label: "A", tone: 1, highlight: true, points: [[166, 45], [186, 44], [201, 119], [177, 142], [158, 132], [180, 98]] }
    ],
    gridLines: [
      { points: [[163, 45], [169, 78], [161, 112], [177, 142]], emphasis: true },
      { points: [[32, 196], [329, 196]], dashed: true }
    ],
    labels: [
      { x: 176, y: 88, text: "A", emphasis: true },
      { x: 123, y: 29, text: "西端の線", emphasis: true },
      { x: 124, y: 112, text: "西日本" },
      { x: 254, y: 90, text: "東日本" },
      { x: 180, y: 217, text: "位置関係を簡略化した模式図" }
    ]
  };

  const JAPAN_HAZARD_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "日本海側、太平洋側、東北地方、瀬戸内の四地域をAからDで示した自然災害の模式図",
    caption: "日本の地域ごとに起こりやすい自然災害を考えるオリジナル模式図",
    regions: [
      { label: "日本列島", tone: 5, points: [[53, 157], [89, 140], [119, 141], [145, 116], [166, 74], [193, 54], [226, 63], [252, 83], [296, 107], [313, 131], [283, 143], [250, 124], [216, 115], [190, 135], [160, 151], [111, 166], [69, 177]] },
      { label: "A", tone: 1, highlight: true, points: [[108, 138], [145, 112], [163, 76], [183, 63], [177, 101], [153, 137]] },
      { label: "B", tone: 2, points: [[193, 58], [225, 67], [253, 87], [237, 111], [207, 111], [181, 100]] },
      { label: "C", tone: 3, points: [[239, 111], [291, 109], [310, 130], [283, 143], [251, 125]] },
      { label: "D", tone: 4, points: [[108, 139], [154, 137], [161, 153], [112, 166], [79, 166]] }
    ],
    labels: [
      { x: 123, y: 99, text: "A 日本海側", emphasis: true },
      { x: 218, y: 87, text: "B 東北地方", emphasis: true },
      { x: 291, y: 119, text: "C 太平洋側", emphasis: true },
      { x: 121, y: 153, text: "D 瀬戸内", emphasis: true },
      { x: 180, y: 211, text: "地域ごとの自然災害を比較" }
    ]
  };

  const JAPAN_POPULATION_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "日本列島に東京、名古屋、大阪の三つの大都市圏と、それらを結ぶ都市の帯を示した模式図",
    caption: "日本の人口が集中する三大都市圏と都市の帯を表したオリジナル模式図",
    regions: [
      { label: "日本列島", tone: 5, points: [[35, 162], [73, 145], [109, 146], [139, 124], [162, 91], [188, 73], [220, 77], [254, 93], [320, 128], [304, 148], [266, 132], [232, 120], [198, 135], [166, 151], [115, 169], [66, 179]] }
    ],
    gridLines: [
      { points: [[112, 152], [157, 138], [201, 128], [244, 113], [286, 130]], emphasis: true }
    ],
    points: [
      { x: 164, y: 137, r: 7 },
      { x: 210, y: 124, r: 7 },
      { x: 269, y: 121, r: 8 }
    ],
    labels: [
      { x: 164, y: 122, text: "大阪", emphasis: true },
      { x: 210, y: 109, text: "名古屋", emphasis: true },
      { x: 269, y: 106, text: "東京", emphasis: true },
      { x: 205, y: 177, text: "都市・工業が連なる地域" },
      { x: 180, y: 211, text: "人口集中を簡略化した模式図" }
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
      id: "challenge-geo-08-001", tier: "core", sourceFactIds: ["geo-08-f01"], retrievalDirection: "belt-to-natural-activity",
      examSkill: "日本の造山帯", mistakeTags: ["火山", "地震"], paperRef: P16,
      prompt: "日本で火山活動や地震が多い理由として、最も適切なものはどれですか。",
      choices: ["安定した大陸内部だけに位置するから", "環太平洋造山帯に位置するから", "赤道上に位置するから", "標高0mの土地だけでできているから"], answer: 1,
      explanation: "日本は環太平洋造山帯に位置し、プレートの動きの影響を受けるため、火山が多く地震も頻繁に発生します。"
    }),
    geoQuestion({
      id: "challenge-geo-08-002", tier: "core", sourceFactIds: ["geo-08-f02"], retrievalDirection: "landform-to-river-and-plain",
      examSkill: "日本の地形", mistakeTags: ["山地", "河川"], paperRef: P16,
      prompt: "日本の地形と河川について述べた文として、正しいものはどれですか。",
      choices: ["国土の約4分の3が山地で、河川は短く傾斜が急である", "国土の約4分の3が平地で、河川はすべて長く緩やかである", "山地はなく、海岸には平野が存在しない", "河川はすべて大陸を横断している"], answer: 0,
      explanation: "日本は国土の約4分の3が山地で、河川は大陸の河川より短く傾斜が急です。山地の出口には扇状地もできます。"
    }),
    geoQuestion({
      id: "challenge-geo-08-003", tier: "core", sourceFactIds: ["geo-08-f03", "geo-08-f04"], retrievalDirection: "place-to-coast-feature",
      examSkill: "日本の海岸・海底地形", mistakeTags: ["リアス海岸", "大陸棚"], paperRef: P16,
      prompt: "日本の海岸や周辺海域について述べた文として、正しいものはどれですか。",
      choices: ["三陸海岸には砂浜だけが一直線に続く", "九十九里浜には入り江の多い海岸だけが広がる", "九州東方の東シナ海には大陸棚が広がる", "日本周辺には浅い海底がまったくない"], answer: 2,
      explanation: "三陸や志摩には入り江の多いリアス海岸、九十九里浜には砂浜海岸が見られ、東シナ海には大陸棚が広がります。"
    }),
    geoQuestion({
      id: "challenge-geo-08-004", tier: "core", sourceFactIds: ["geo-08-f07", "geo-08-f08"], retrievalDirection: "region-to-climate-and-disaster",
      examSkill: "日本の気候と災害", mistakeTags: ["北海道", "南西諸島"], paperRef: P16,
      prompt: "日本の気候と自然災害について述べた文として、最も適切なものはどれですか。",
      choices: ["日本全体が一年中同じ気温と降水量である", "北海道は亜熱帯、南西諸島は冷帯に属する", "日本の大部分は温帯で、地域により大雪・台風・冷害・干害が起こる", "地震は日本海側だけで発生する"], answer: 2,
      explanation: "日本の大部分は温帯ですが、北海道は冷帯、南西諸島は亜熱帯です。季節や地域によりさまざまな自然災害が起こります。"
    }),
    geoQuestion({
      id: "challenge-geo-08-005", tier: "core", sourceFactIds: ["geo-08-f05", "geo-08-f06"], retrievalDirection: "superlative-to-name",
      examSkill: "日本の主な地形", mistakeTags: ["信濃川", "関東平野"], paperRef: P16,
      prompt: "日本の主な地形について述べた組み合わせとして、正しいものはどれですか。",
      choices: ["最長の河川―信濃川／最大の平野―関東平野", "最長の河川―利根川／最大の平野―濃尾平野", "最大流域の河川―信濃川／最大の平野―石狩平野", "日本アルプス―標高100m以下の丘陵"], answer: 0,
      explanation: "日本で最も長い河川は信濃川、流域面積が最大の河川は利根川、最も広い平野は関東平野です。"
    }),
    geoQuestion({
      id: "challenge-geo-08-006", tier: "challenge", sourceFactIds: ["geo-08-f06"], retrievalDirection: "schematic-zone-to-geologic-term",
      examSkill: "地溝帯の位置判断", mistakeTags: ["フォッサマグナ", "糸魚川―静岡構造線"], paperRef: P16, formatTag: "地図読取", figure: JAPAN_FOSSA_MAP,
      prompt: "模式図のAは日本列島を東西に分ける大地溝帯です。Aと、その西端の線の組み合わせとして正しいものはどれですか。",
      choices: ["フォッサマグナ―糸魚川・静岡構造線", "中央構造線―赤道", "日本アルプス―日付変更線", "大陸棚―本初子午線"], answer: 0,
      explanation: "日本列島を東西に分ける大地溝帯はフォッサマグナで、その西端は糸魚川・静岡構造線です。"
    }),
    geoQuestion({
      id: "challenge-geo-08-007", tier: "challenge", sourceFactIds: ["geo-08-f08"], retrievalDirection: "schematic-region-to-hazard",
      examSkill: "自然災害の地域差", mistakeTags: ["大雪", "台風"], paperRef: P16, formatTag: "地図読取", figure: JAPAN_HAZARD_MAP,
      prompt: "模式図の地域と、特に注意する自然災害の組み合わせとして、最も適切なものはどれですか。",
      choices: ["A日本海側―大雪／C太平洋側―台風", "A日本海側―干害だけ／B東北地方―火山はゼロ", "B東北地方―熱帯夜だけ／D瀬戸内―大雪だけ", "C太平洋側―雪崩だけ／D瀬戸内―高潮だけ"], answer: 0,
      explanation: "日本海側では冬の大雪、太平洋側では台風、東北地方では冷害、降水量の少ない瀬戸内では干害に注意します。"
    }),
    geoQuestion({
      id: "challenge-geo-08-008", tier: "challenge", sourceFactIds: ["geo-08-f13", "geo-08-f14"], retrievalDirection: "schematic-cities-to-population-pattern",
      examSkill: "人口集中地域の読図", mistakeTags: ["三大都市圏", "太平洋ベルト"], paperRef: P17, formatTag: "地図読取", figure: JAPAN_POPULATION_MAP,
      prompt: "模式図が表す日本の人口分布と都市の連なりについて、正しい説明はどれですか。",
      choices: ["人口は離島だけに集中し、都市圏は形成されない", "東京・名古屋・大阪の大都市圏に人口が集中し、太平洋ベルトに都市が連なる", "東京大都市圏の人口は日本全体の1％未満である", "都市はすべて日本海側だけに集中する"], answer: 1,
      explanation: "人口は東京・名古屋・大阪の三大都市圏に集中し、京浜から北九州へ都市や工業地域が連なる太平洋ベルトを形成します。"
    }),
    geoQuestion({
      id: "challenge-geo-08-009", tier: "challenge", sourceFactIds: ["geo-08-f09", "geo-08-f10", "geo-08-f11"], retrievalDirection: "data-pattern-to-population-issue",
      examSkill: "世界の人口問題", mistakeTags: ["人口爆発", "少子高齢化"], paperRef: P17, formatTag: "資料判断",
      prompt: "世界の人口分布と人口問題について述べた文として、正しいものはどれですか。",
      choices: ["2023年の世界人口は約8億人で、アジアの割合は1％程度である", "人口密度は気候の厳しい砂漠や高山で必ず高い", "発展途上国では人口急増、先進工業国では少子高齢化が課題になることがある", "世界の人口はどの地域にも同じ密度で分布する"], answer: 2,
      explanation: "世界人口は2023年に約80億人で約6割がアジアに住みます。途上国の人口急増と先進国の少子高齢化は対照的な課題です。"
    }),
    geoQuestion({
      id: "challenge-geo-08-010", tier: "challenge", sourceFactIds: ["geo-08-f12", "geo-08-f13", "geo-08-f14", "geo-08-f15"], retrievalDirection: "society-change-to-regional-problem",
      examSkill: "日本の人口問題", mistakeTags: ["過密", "過疎"], paperRef: P17, formatTag: "比較・判断",
      prompt: "日本の人口と地域問題について述べた組み合わせとして、正しいものはどれですか。",
      choices: ["大都市―交通混雑などの過密問題／山間部や離島―過疎問題", "大都市―人口がまったくいない／山間部―人口爆発", "日本全体―出生率が急上昇し、年少人口だけが増加", "地方―人口減少がなく、限界集落も存在しない"], answer: 0,
      explanation: "大都市では人口集中による交通混雑などが起こり、山間部や離島では人口減少と高齢化による過疎や限界集落が課題です。"
    }),
    geoQuestion({
      id: "challenge-geo-08-011", tier: "final", type: "input", answerTarget: "belt", sourceFactIds: ["geo-08-f01"], retrievalDirection: "direct-location-to-belt",
      examSkill: "造山帯名の再生", mistakeTags: ["火山", "地震"], paperRef: `${P16}／${P17}`, formatTag: "直接入力",
      prompt: "日本が位置し、火山活動や地震が活発な造山帯の名称を答えてください。", answerText: ["環太平洋造山帯"], placeholder: "造山帯名を入力",
      explanation: "日本が位置する造山帯は環太平洋造山帯です。太平洋を取り巻く地域に火山や地震が多く見られます。"
    }),
    geoQuestion({
      id: "challenge-geo-08-012", tier: "final", type: "input", answerTarget: "landform", sourceFactIds: ["geo-08-f02"], retrievalDirection: "direct-formation-to-landform",
      examSkill: "地形名の再生", mistakeTags: ["山地の出口", "堆積"], paperRef: `${P16}／${P17}`, formatTag: "直接入力",
      prompt: "川が山地から平地へ出る所に土砂がたまり、扇形に広がる地形を何といいますか。", answerText: ["扇状地"], placeholder: "地形名を入力",
      explanation: "川が山地から平地へ出る場所で、運ばれた土砂が扇形に堆積してできる地形は扇状地です。"
    }),
    geoQuestion({
      id: "challenge-geo-08-013", tier: "final", type: "input", answerTarget: "coast", sourceFactIds: ["geo-08-f03"], retrievalDirection: "direct-feature-to-coast",
      examSkill: "海岸地形名の再生", mistakeTags: ["入り江", "三陸海岸"], paperRef: P16, formatTag: "直接入力",
      prompt: "三陸海岸や志摩半島に見られる、入り江が複雑に入り組んだ海岸を何といいますか。", answerText: ["リアス海岸", "リアス式海岸"], placeholder: "海岸地形名を入力",
      explanation: "入り江が複雑に入り組んだ海岸はリアス海岸です。三陸海岸や志摩半島が代表的な地域です。"
    }),
    geoQuestion({
      id: "challenge-geo-08-014", tier: "final", type: "input", answerTarget: "population-state", sourceFactIds: ["geo-08-f14"], retrievalDirection: "direct-definition-to-term",
      examSkill: "人口問題用語の再生", mistakeTags: ["人口集中", "都市問題"], paperRef: P17, formatTag: "直接入力",
      prompt: "都市に人口が集中しすぎて、交通混雑などの問題が起こる状態を何といいますか。", answerText: ["過密"], placeholder: "用語を入力",
      explanation: "都市に人口や機能が集中しすぎた状態が過密です。交通混雑、住宅不足、環境悪化などの問題につながります。"
    }),
    geoQuestion({
      id: "challenge-geo-08-015", tier: "final", type: "input", answerTarget: "population-pyramid", sourceFactIds: ["geo-08-f12"], retrievalDirection: "direct-demography-to-shape",
      examSkill: "人口ピラミッドの再生", mistakeTags: ["少子高齢化", "年少人口"], paperRef: P17, formatTag: "直接入力",
      prompt: "少子高齢化が進んだ現在の日本に見られる、底が狭い人口ピラミッドの形を答えてください。", answerText: ["つぼ型", "壺型"], placeholder: "形を入力",
      explanation: "少子高齢化が進み、年少人口が少なく高齢者の割合が高い日本の人口ピラミッドはつぼ型です。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
