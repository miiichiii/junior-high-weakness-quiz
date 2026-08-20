(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-09";
  const UNIT = "世界と日本の資源・産業・結びつき";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P18 = "Challenge社会「5科のポイントチェック」p.18";
  const P19 = "Challenge社会「5科のポイントチェック」p.19";

  const POWER_MIX_DIAGRAM = {
    kind: "map", width: 360, height: 230,
    alt: "日本・フランス・カナダの発電量に占める主な電源A、B、Cの割合を比べた模式図",
    caption: "国による発電方法の違いを単純化して表したオリジナル比較図",
    regions: [
      { label: "日本A", tone: 1, highlight: true, points: [[88, 39], [289, 39], [289, 70], [88, 70]] },
      { label: "日本その他", tone: 5, points: [[289, 39], [329, 39], [329, 70], [289, 70]] },
      { label: "フランスB", tone: 2, points: [[88, 94], [276, 94], [276, 125], [88, 125]] },
      { label: "フランスその他", tone: 5, points: [[276, 94], [329, 94], [329, 125], [276, 125]] },
      { label: "カナダC", tone: 3, points: [[88, 149], [252, 149], [252, 180], [88, 180]] },
      { label: "カナダその他", tone: 5, points: [[252, 149], [329, 149], [329, 180], [252, 180]] }
    ],
    labels: [
      { x: 23, y: 59, text: "日本", anchor: "start", emphasis: true },
      { x: 23, y: 114, text: "フランス", anchor: "start", emphasis: true },
      { x: 23, y: 169, text: "カナダ", anchor: "start", emphasis: true },
      { x: 184, y: 59, text: "A 約74%", emphasis: true },
      { x: 182, y: 114, text: "B 約68%", emphasis: true },
      { x: 170, y: 169, text: "C 約60%", emphasis: true },
      { x: 180, y: 214, text: "2021年の割合を概数化" }
    ]
  };

  const INDUSTRY_LOCATION_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "日本列島の太平洋側に工業地域が帯状に連なり、内陸の高速道路沿いにIC工場がある模式図",
    caption: "日本の臨海工業地域と内陸工業の位置関係を表したオリジナル模式図",
    regions: [
      { label: "日本列島", tone: 5, points: [[24, 159], [67, 142], [108, 146], [143, 124], [169, 94], [198, 78], [227, 84], [259, 100], [330, 132], [312, 153], [270, 137], [235, 128], [201, 142], [163, 158], [112, 174], [58, 180]] }
    ],
    gridLines: [
      { points: [[91, 157], [134, 147], [176, 139], [221, 126], [267, 121], [307, 141]], emphasis: true },
      { points: [[106, 122], [154, 110], [202, 102], [250, 108]], dashed: true }
    ],
    points: [
      { x: 128, y: 116, r: 6 }, { x: 181, y: 105, r: 6 }, { x: 232, y: 108, r: 6 }
    ],
    labels: [
      { x: 198, y: 178, text: "A：臨海部の工業の帯", emphasis: true },
      { x: 177, y: 72, text: "B：内陸のIC工場", emphasis: true },
      { x: 180, y: 213, text: "工業の分布を簡略化" }
    ]
  };

  const TRANSPORT_CARGO_DIAGRAM = {
    kind: "map", width: 360, height: 230,
    alt: "航空機Aと大型船Bを並べ、それぞれが運ぶ貨物の特徴を比較した模式図",
    caption: "航空輸送と海上輸送に適する貨物を比較するオリジナル模式図",
    regions: [
      { label: "A", tone: 2, highlight: true, points: [[26, 47], [166, 47], [166, 178], [26, 178]] },
      { label: "B", tone: 5, points: [[194, 47], [334, 47], [334, 178], [194, 178]] },
      { label: "小型貨物", tone: 1, points: [[47, 92], [145, 92], [145, 127], [47, 127]] },
      { label: "大量貨物", tone: 3, points: [[211, 86], [317, 86], [317, 139], [211, 139]] }
    ],
    gridLines: [
      { points: [[45, 77], [78, 63], [147, 77]], emphasis: true },
      { points: [[207, 151], [322, 151]], emphasis: true }
    ],
    labels: [
      { x: 96, y: 35, text: "A 航空輸送", emphasis: true },
      { x: 264, y: 35, text: "B 海上輸送", emphasis: true },
      { x: 96, y: 111, text: "小型・高価格" },
      { x: 264, y: 111, text: "大量・重量物" },
      { x: 180, y: 211, text: "貨物の性質に応じて選ぶ" }
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
      id: "challenge-geo-09-001", tier: "core", sourceFactIds: ["geo-09-f01"], retrievalDirection: "resource-to-producers",
      examSkill: "鉱産資源の産出国", mistakeTags: ["石油", "鉄鉱石"], paperRef: P18,
      prompt: "鉱産資源と主な産出国の組み合わせとして、正しいものはどれですか。",
      choices: ["石油―ロシア・サウジアラビア・アメリカ", "石炭―フランス・日本・イタリア", "鉄鉱石―スイス・ノルウェー・日本", "石油―オーストリア・韓国・シンガポール"], answer: 0,
      explanation: "石油はロシア・サウジアラビア・アメリカ、石炭は中国・インド・アメリカ、鉄鉱石は中国・オーストラリア・ブラジルなどが主産出国です。"
    }),
    geoQuestion({
      id: "challenge-geo-09-002", tier: "core", sourceFactIds: ["geo-09-f02", "geo-09-f03"], retrievalDirection: "energy-feature-to-impact",
      examSkill: "日本のエネルギー", mistakeTags: ["火力発電", "燃料輸入"], paperRef: P18,
      prompt: "日本の発電とエネルギーについて述べた文として、最も適切なものはどれですか。",
      choices: ["火力発電の燃料はすべて国内で得られる", "火力発電が中心で、燃料輸入と温暖化への対応が課題である", "太陽光や風力は化石燃料に分類される", "福島第一原発事故後も原子力政策は一度も見直されていない"], answer: 1,
      explanation: "日本は火力発電の割合が高く、燃料を輸入に頼ります。二酸化炭素排出や安定供給の面から再生可能エネルギーも注目されています。"
    }),
    geoQuestion({
      id: "challenge-geo-09-003", tier: "core", sourceFactIds: ["geo-09-f04", "geo-09-f05"], retrievalDirection: "industry-system-to-location",
      examSkill: "日本の工業", mistakeTags: ["加工貿易", "太平洋ベルト"], paperRef: P18,
      prompt: "日本の工業の特色について述べた文として、正しいものはどれですか。",
      choices: ["原料を輸入して製品を輸出する形で発展し、臨海部に工業地域が連なる", "原料も製品も一切輸送せず、山頂だけで生産する", "自動車や電気機械を生産せず、農産物だけを輸出する", "IC工場は港の埋立地だけに立地する"], answer: 0,
      explanation: "日本の工業は加工貿易で発展し、東京湾から北九州へ臨海工業地域が連なる太平洋ベルトを形成しました。内陸にはIC工場もあります。"
    }),
    geoQuestion({
      id: "challenge-geo-09-004", tier: "core", sourceFactIds: ["geo-09-f06"], retrievalDirection: "factory-move-to-problem",
      examSkill: "産業問題の因果", mistakeTags: ["現地生産", "国内産業"], paperRef: P18,
      prompt: "日本企業が工場を海外へ移した結果、国内の産業が衰える現象を説明したものはどれですか。",
      choices: ["近郊農業", "過密", "産業の空洞化", "促成栽培"], answer: 2,
      explanation: "貿易摩擦を避ける現地生産や低コストを求めた海外移転が進むと、国内の工場や雇用が減る産業の空洞化が起こります。"
    }),
    geoQuestion({
      id: "challenge-geo-09-005", tier: "core", sourceFactIds: ["geo-09-f08", "geo-09-f09"], retrievalDirection: "crop-to-producing-region",
      examSkill: "世界と日本の農業", mistakeTags: ["三大穀物", "栽培方法"], paperRef: P19,
      prompt: "世界と日本の農業について述べた文として、正しいものはどれですか。",
      choices: ["三大穀物は米・小麦・とうもろこしで、米はアジアで多く生産される", "三大穀物は茶・コーヒー・カカオである", "日本の稲作は沖縄だけで行われる", "高知県では寒さを利用した抑制栽培だけが行われる"], answer: 0,
      explanation: "三大穀物は米・小麦・とうもろこしです。日本では東北・北陸の稲作、高知・宮崎の促成栽培、長野・群馬の抑制栽培が代表的です。"
    }),
    geoQuestion({
      id: "challenge-geo-09-006", tier: "challenge", sourceFactIds: ["geo-09-f02", "geo-09-f03"], retrievalDirection: "chart-to-power-source",
      examSkill: "電源構成の比較", mistakeTags: ["火力", "原子力・水力"], paperRef: P18, formatTag: "資料読取", figure: POWER_MIX_DIAGRAM,
      prompt: "発電量に占める主な電源の割合を表す模式図です。A・B・Cの組み合わせとして正しいものはどれですか。",
      choices: ["A水力・B火力・C原子力", "A原子力・B水力・C火力", "A火力・B原子力・C水力", "A風力・B太陽光・C地熱"], answer: 2,
      explanation: "2021年は日本で火力、フランスで原子力、カナダで水力の割合が最も高く、国の資源や政策によって電源構成が異なります。"
    }),
    geoQuestion({
      id: "challenge-geo-09-007", tier: "challenge", sourceFactIds: ["geo-09-f05", "geo-09-f07"], retrievalDirection: "map-location-to-industry",
      examSkill: "工業立地の判断", mistakeTags: ["臨海部", "内陸部"], paperRef: P18, formatTag: "地図読取", figure: INDUSTRY_LOCATION_MAP,
      prompt: "日本の工業分布を示す模式図について、AとBの説明として正しいものはどれですか。",
      choices: ["Aは稲作地帯だけで、Bには港湾工場だけがある", "Aは太平洋ベルトで、Bには高速道路沿いのIC工場などがみられる", "Aは日本海側だけに連なり、Bには産業がない", "AもBも第三次産業だけを示す"], answer: 1,
      explanation: "臨海部の太平洋ベルトには大規模な工業地域が連なり、内陸部では高速道路や空港に近い工業団地にIC工場などが立地します。"
    }),
    geoQuestion({
      id: "challenge-geo-09-008", tier: "challenge", sourceFactIds: ["geo-09-f12"], retrievalDirection: "cargo-feature-to-transport",
      examSkill: "輸送手段の選択", mistakeTags: ["航空輸送", "海上輸送"], paperRef: P19, formatTag: "図解読取", figure: TRANSPORT_CARGO_DIAGRAM,
      prompt: "模式図A・Bの輸送手段と、それに適する貨物の組み合わせとして正しいものはどれですか。",
      choices: ["A航空―鉄鉱石だけ／B海上―生鮮品だけ", "A航空―低価格の砂だけ／B海上―緊急書類だけ", "AもBも運べる貨物は完全に同じ", "A航空―ICなど小型で高価な製品／B海上―鉱産資源など大量の貨物"], answer: 3,
      explanation: "速い航空輸送はICなど小型で単価の高い製品、大量輸送ができる海上輸送は石油や鉄鉱石などの鉱産資源に適します。"
    }),
    geoQuestion({
      id: "challenge-geo-09-009", tier: "challenge", sourceFactIds: ["geo-09-f09", "geo-09-f10", "geo-09-f11"], retrievalDirection: "purpose-to-agriculture-or-fishery",
      examSkill: "農林水産業の方法判断", mistakeTags: ["近郊農業", "栽培漁業"], paperRef: P19, formatTag: "方法判断",
      prompt: "農林水産業の方法と目的の組み合わせとして、正しいものはどれですか。",
      choices: ["抑制栽培―暖かい地域で収穫を早める", "栽培漁業―天然魚を保護せずすべて取り尽くす", "近郊農業―大都市近くで新鮮な農産物を出荷する", "養殖―農地で小麦だけを育てる"], answer: 2,
      explanation: "近郊農業は大都市周辺で行われます。栽培漁業は人工ふ化した稚魚を放流して成長後に漁獲し、漁業資源の保護を図ります。"
    }),
    geoQuestion({
      id: "challenge-geo-09-010", tier: "challenge", sourceFactIds: ["geo-09-f13", "geo-09-f14", "geo-09-f15"], retrievalDirection: "change-to-economic-system",
      examSkill: "貿易・交通の変化", mistakeTags: ["WTO", "情報通信"], paperRef: P19, formatTag: "比較・判断",
      prompt: "日本と世界の交通・通信・貿易について述べた文として、最も適切なものはどれですか。",
      choices: ["貿易摩擦の解消ではWTOが役割をもち、インターネットは生活様式を変えた", "新幹線は日本国内に一つもない", "日本の輸出品は現在も繊維製品だけである", "各国間の貿易が増えても国際的な調整は不要である"], answer: 0,
      explanation: "貿易拡大に伴う摩擦の解消にはWTOが関わります。新幹線網やインターネットの発達は人・物・情報の結びつきを強めました。"
    }),
    geoQuestion({
      id: "challenge-geo-09-011", tier: "final", type: "input", answerTarget: "energy", sourceFactIds: ["geo-09-f03"], retrievalDirection: "direct-examples-to-category",
      examSkill: "エネルギー用語の再生", mistakeTags: ["風力", "太陽光"], paperRef: `${P18}／${P19}`, formatTag: "直接入力",
      prompt: "風力や太陽光のように、繰り返し利用できる自然の力を用いるエネルギーを何といいますか。", answerText: ["再生可能エネルギー"], placeholder: "用語を入力",
      explanation: "風力、太陽光、水力、地熱など、自然の働きから繰り返し得られるものを再生可能エネルギーといいます。"
    }),
    geoQuestion({
      id: "challenge-geo-09-012", tier: "final", type: "input", answerTarget: "trade", sourceFactIds: ["geo-09-f04"], retrievalDirection: "direct-system-to-term",
      examSkill: "貿易用語の再生", mistakeTags: ["原料輸入", "製品輸出"], paperRef: `${P18}／${P19}`, formatTag: "直接入力",
      prompt: "原料を輸入し、それを加工してつくった製品を輸出する貿易の形を何といいますか。", answerText: ["加工貿易"], placeholder: "用語を入力",
      explanation: "原料を海外から輸入し、国内で加工した製品を輸出する形は加工貿易です。日本の工業はこの形で発展しました。"
    }),
    geoQuestion({
      id: "challenge-geo-09-013", tier: "final", type: "input", answerTarget: "industry-problem", sourceFactIds: ["geo-09-f06"], retrievalDirection: "direct-cause-to-term",
      examSkill: "産業問題用語の再生", mistakeTags: ["工場移転", "国内衰退"], paperRef: P18, formatTag: "直接入力",
      prompt: "工場が海外へ移転したことで、国内の産業が衰える現象を何といいますか。", answerText: ["産業の空洞化"], placeholder: "用語を入力",
      explanation: "海外への工場移転によって国内の生産や雇用が減り、産業が衰える現象は産業の空洞化です。"
    }),
    geoQuestion({
      id: "challenge-geo-09-014", tier: "final", type: "input", answerTarget: "fishery", sourceFactIds: ["geo-09-f10"], retrievalDirection: "direct-method-to-term",
      examSkill: "漁業用語の再生", mistakeTags: ["人工ふ化", "稚魚放流"], paperRef: P19, formatTag: "直接入力",
      prompt: "人工ふ化させた稚魚を放流し、成長してからとる漁業を何といいますか。", answerText: ["栽培漁業"], placeholder: "漁業名を入力",
      explanation: "人工ふ化した稚魚を自然の海や川へ放流し、成長してから漁獲する方法は栽培漁業です。"
    }),
    geoQuestion({
      id: "challenge-geo-09-015", tier: "final", type: "input", answerTarget: "organization", sourceFactIds: ["geo-09-f13"], retrievalDirection: "direct-role-to-organization",
      examSkill: "国際機関名の再生", mistakeTags: ["貿易摩擦", "国際調整"], paperRef: P19, formatTag: "直接入力",
      prompt: "各国間の貿易ルールを整え、貿易摩擦の解消に重要な役割をもつ国際機関を答えてください。", answerText: ["世界貿易機関", "WTO"], placeholder: "機関名を入力",
      explanation: "各国間の貿易ルールを整え、自由な貿易と紛争解決を進める国際機関が世界貿易機関です。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
