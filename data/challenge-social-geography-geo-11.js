(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-11";
  const UNIT = "近畿地方・中部地方";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P22 = "Challenge社会「5科のポイントチェック」p.22";
  const P23 = "Challenge社会「5科のポイントチェック」p.23";

  const KINKI_NATURE_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "近畿地方を北部A、南部B、紀伊山地C、志摩半島Dに分け、琵琶湖を示した模式図",
    caption: "近畿地方の地形と気候の地域差を表したオリジナル模式図",
    regions: [
      { label: "近畿地方", tone: 5, points: [[93, 24], [250, 31], [294, 81], [277, 130], [246, 183], [183, 206], [120, 175], [70, 121], [75, 61]] },
      { label: "A", tone: 2, points: [[93, 25], [250, 32], [285, 75], [223, 93], [142, 85], [76, 61]] },
      { label: "B", tone: 3, points: [[74, 91], [140, 84], [221, 94], [279, 129], [245, 183], [183, 205], [120, 175], [70, 121]] },
      { label: "C", tone: 1, highlight: true, points: [[129, 124], [201, 103], [253, 144], [221, 187], [162, 181]] },
      { label: "D", tone: 4, points: [[245, 107], [293, 82], [278, 129], [252, 143]] },
      { label: "琵琶湖", tone: 1, points: [[205, 53], [224, 61], [217, 91], [198, 84]] }
    ],
    labels: [
      { x: 154, y: 61, text: "A 北部", emphasis: true },
      { x: 116, y: 111, text: "B 南部", emphasis: true },
      { x: 192, y: 155, text: "C 紀伊山地", emphasis: true },
      { x: 274, y: 103, text: "D 志摩半島", emphasis: true },
      { x: 212, y: 73, text: "琵琶湖" },
      { x: 180, y: 222, text: "位置関係を簡略化" }
    ]
  };

  const CHUBU_ZONES_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "中部地方を日本海側A、内陸部B、太平洋側Cの三地域に分けた模式図",
    caption: "北陸・中央高地・東海の自然と産業の違いを表したオリジナル模式図",
    regions: [
      { label: "中部地方", tone: 5, points: [[92, 27], [218, 24], [286, 61], [290, 130], [247, 199], [151, 202], [76, 155], [65, 79]] },
      { label: "A", tone: 2, points: [[91, 28], [218, 25], [273, 58], [230, 83], [151, 79], [66, 78]] },
      { label: "B", tone: 3, highlight: true, points: [[126, 75], [230, 82], [260, 135], [214, 169], [123, 155], [87, 111]] },
      { label: "C", tone: 1, points: [[77, 132], [124, 154], [214, 169], [260, 134], [287, 130], [247, 198], [151, 201], [76, 155]] }
    ],
    gridLines: [
      { points: [[153, 84], [174, 123], [160, 158]], emphasis: true },
      { points: [[197, 81], [213, 119], [207, 163]], emphasis: true }
    ],
    labels: [
      { x: 165, y: 54, text: "A 北陸", emphasis: true },
      { x: 178, y: 121, text: "B 中央高地", emphasis: true },
      { x: 184, y: 185, text: "C 東海", emphasis: true },
      { x: 180, y: 222, text: "三地域の位置関係" }
    ]
  };

  const LETTUCE_SHIPMENT_DIAGRAM = {
    kind: "map", width: 360, height: 230,
    alt: "平地産地Aと高原産地Bのレタス出荷量を春・夏・秋で比較した模式図。Bは夏に多い",
    caption: "高原野菜の出荷時期の違いを表したオリジナル比較図",
    regions: [
      { label: "A春", tone: 2, points: [[52, 102], [87, 102], [87, 174], [52, 174]] },
      { label: "B春", tone: 4, points: [[91, 150], [126, 150], [126, 174], [91, 174]] },
      { label: "A夏", tone: 2, points: [[150, 146], [185, 146], [185, 174], [150, 174]] },
      { label: "B夏", tone: 1, highlight: true, points: [[189, 45], [224, 45], [224, 174], [189, 174]] },
      { label: "A秋", tone: 2, points: [[248, 91], [283, 91], [283, 174], [248, 174]] },
      { label: "B秋", tone: 4, points: [[287, 143], [322, 143], [322, 174], [287, 174]] }
    ],
    gridLines: [{ points: [[35, 174], [329, 174]], emphasis: true }],
    labels: [
      { x: 89, y: 199, text: "春", emphasis: true },
      { x: 187, y: 199, text: "夏", emphasis: true },
      { x: 285, y: 199, text: "秋", emphasis: true },
      { x: 170, y: 32, text: "A 平地産地　B 高原産地", emphasis: true },
      { x: 180, y: 222, text: "出荷量を模式化" }
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
      id: "challenge-geo-11-001", tier: "core", sourceFactIds: ["geo-11-f01"], retrievalDirection: "region-to-natural-feature",
      examSkill: "近畿の自然", mistakeTags: ["紀伊山地", "琵琶湖"], paperRef: P22,
      prompt: "近畿地方の自然について述べた文として、正しいものはどれですか。",
      choices: ["紀伊山地は年間を通してほとんど雨が降らない", "琵琶湖は日本で最も小さい湖である", "紀伊山地は多雨地域で、志摩半島にはリアス海岸がみられる", "近畿北部も南部もすべて同じ気候である"], answer: 2,
      explanation: "紀伊山地は日本有数の多雨地域で、志摩半島には入り江の多いリアス海岸があります。琵琶湖は日本最大の湖です。"
    }),
    geoQuestion({
      id: "challenge-geo-11-002", tier: "core", sourceFactIds: ["geo-11-f02"], retrievalDirection: "place-to-agriculture",
      examSkill: "近畿の農業", mistakeTags: ["近郊農業", "果樹栽培"], paperRef: P22,
      prompt: "近畿地方の農業の組み合わせとして、正しいものはどれですか。",
      choices: ["和歌山県―酪農だけ", "兵庫・奈良・京都―近郊農業／和歌山―みかん・うめ", "京都府―さとうきびだけ", "奈良県―稲作も野菜生産も行わない"], answer: 1,
      explanation: "大都市に近い兵庫・奈良・京都では近郊農業が行われ、温暖な和歌山県ではみかんやうめなどの果樹栽培が盛んです。"
    }),
    geoQuestion({
      id: "challenge-geo-11-003", tier: "core", sourceFactIds: ["geo-11-f03"], retrievalDirection: "industry-area-to-feature",
      examSkill: "阪神工業地帯", mistakeTags: ["臨海部", "中小工場"], paperRef: P22,
      prompt: "阪神工業地帯について述べた文として、正しいものはどれですか。",
      choices: ["北海道だけに広がる工業地帯である", "工場はすべて山頂に移転した", "農業だけで発展し、工業は行われない", "大阪・兵庫を中心に、臨海部の大工場と内陸部の中小工場がみられる"], answer: 3,
      explanation: "阪神工業地帯は大阪府・兵庫県を中心に広がり、臨海部には製鉄・石油化学の大工場、東大阪などには中小工場が集まります。"
    }),
    geoQuestion({
      id: "challenge-geo-11-004", tier: "core", sourceFactIds: ["geo-11-f04", "geo-11-f05"], retrievalDirection: "urban-issue-to-response",
      examSkill: "古都保護と地域開発", mistakeTags: ["景観保護", "ニュータウン"], paperRef: P22,
      prompt: "近畿地方の歴史的景観と地域開発について述べた文として、正しいものはどれですか。",
      choices: ["京都・奈良では景観を守り、大阪周辺ではニュータウンや人工島が開発された", "京都・奈良の文化財はすべて撤去された", "大阪では人口分散のための開発を行っていない", "関西国際空港は山頂に建設された"], answer: 0,
      explanation: "京都・奈良では文化財や景観を保護し、大阪周辺では過密を緩和するニュータウン、湾岸では空港や人工島が整備されました。"
    }),
    geoQuestion({
      id: "challenge-geo-11-005", tier: "core", sourceFactIds: ["geo-11-f07", "geo-11-f08", "geo-11-f10"], retrievalDirection: "chubu-zone-to-feature",
      examSkill: "中部三地域の比較", mistakeTags: ["北陸", "中央高地・東海"], paperRef: P23,
      prompt: "中部地方の三地域について述べた組み合わせとして、正しいものはどれですか。",
      choices: ["北陸―冬の降雪が少ない／中央高地―年中高温", "東海―寒冷な気候で流氷が接岸する", "北陸―稲作／中央高地―高原野菜／東海―茶やみかん", "中央高地―海岸の埋立地だけに工場がある"], answer: 2,
      explanation: "北陸は多雪と稲作、中央高地は大きな気温差を利用した高原野菜、温暖な東海は茶・みかんや施設園芸が特色です。"
    }),
    geoQuestion({
      id: "challenge-geo-11-006", tier: "challenge", sourceFactIds: ["geo-11-f01", "geo-11-f02"], retrievalDirection: "schematic-zone-to-feature",
      examSkill: "近畿の地域差", mistakeTags: ["日本海側", "多雨地域"], paperRef: P22, formatTag: "地図読取", figure: KINKI_NATURE_MAP,
      prompt: "近畿地方の模式図A〜Dについて、地域の特色を正しく組み合わせたものはどれですか。",
      choices: ["Aは瀬戸内の気候だけ、Cは少雨の砂漠である", "A北部は日本海側の気候、C紀伊山地は多雨、D志摩半島はリアス海岸", "B南部には都市も農業も存在しない", "琵琶湖は海水からなる入り江である"], answer: 1,
      explanation: "北部は日本海側の気候、南部の大阪・兵庫は瀬戸内の気候です。紀伊山地は多雨で、志摩半島にはリアス海岸があります。"
    }),
    geoQuestion({
      id: "challenge-geo-11-007", tier: "challenge", sourceFactIds: ["geo-11-f07", "geo-11-f08", "geo-11-f10", "geo-11-f14"], retrievalDirection: "map-zone-to-chubu-region",
      examSkill: "中部地域区分の判断", mistakeTags: ["日本海側", "太平洋側"], paperRef: P23, formatTag: "地図読取", figure: CHUBU_ZONES_MAP,
      prompt: "中部地方をA〜Cに分けた模式図です。地域名と特色の組み合わせとして正しいものはどれですか。",
      choices: ["A東海―多雪、B北陸―茶栽培、C中央高地―稲作だけ", "A中央高地、B東海、C北陸", "A北陸―流氷観光、B中央高地―熱帯農業、C東海―酪農", "A北陸―多雪と稲作、B中央高地―高原野菜、C東海―温暖な農業"], answer: 3,
      explanation: "日本海側のAは北陸、内陸のBは中央高地、太平洋側のCは東海です。気候の違いが農業や産業の特色に結びつきます。"
    }),
    geoQuestion({
      id: "challenge-geo-11-008", tier: "challenge", sourceFactIds: ["geo-11-f08", "geo-11-f15"], retrievalDirection: "seasonal-chart-to-cultivation",
      examSkill: "出荷時期の資料判断", mistakeTags: ["高原野菜", "抑制栽培"], paperRef: P23, formatTag: "資料読取", figure: LETTUCE_SHIPMENT_DIAGRAM,
      prompt: "模式図では高原産地Bの出荷量が夏に多くなっています。この特色を生む栽培方法はどれですか。",
      choices: ["二期作", "促成栽培", "冷涼な気候で収穫を遅らせる抑制栽培", "焼畑農業"], answer: 2,
      explanation: "中央高地では冷涼な気候を利用し、平地の出荷が少ない夏に高原野菜を出す抑制栽培が行われます。"
    }),
    geoQuestion({
      id: "challenge-geo-11-009", tier: "challenge", sourceFactIds: ["geo-11-f09", "geo-11-f11", "geo-11-f12", "geo-11-f13"], retrievalDirection: "city-to-industry",
      examSkill: "中部の工業都市", mistakeTags: ["豊田市", "四日市市"], paperRef: P23, formatTag: "比較・判断",
      prompt: "中部地方の都市と工業の組み合わせとして、正しいものはどれですか。",
      choices: ["豊田―自動車／四日市―石油化学／浜松―楽器・オートバイ／富士―紙・パルプ", "豊田―漁業だけ／四日市―林業だけ", "浜松―鉄鉱石採掘／富士―さとうきび", "諏訪―造船だけ／名古屋―工業なし"], answer: 0,
      explanation: "中京の豊田は自動車、四日市は石油化学、東海工業地域の浜松は楽器・オートバイ、富士は紙・パルプが代表的です。"
    }),
    geoQuestion({
      id: "challenge-geo-11-010", tier: "challenge", sourceFactIds: ["geo-11-f04", "geo-11-f05", "geo-11-f06"], retrievalDirection: "development-purpose-to-example",
      examSkill: "近畿の都市開発", mistakeTags: ["過密解消", "埋め立て"], paperRef: P22, formatTag: "課題判断",
      prompt: "大阪大都市圏の過密や交通需要への対応として行われた地域開発はどれですか。",
      choices: ["歴史的建築物をすべて取り壊す", "千里・泉北ニュータウンの造成と、関西国際空港・ポートアイランドの建設", "大阪湾を埋め戻して農地だけにする", "都心への機能集中をさらに強めるだけ"], answer: 1,
      explanation: "中心部の過密を緩和するニュータウンが造成され、湾岸の埋め立て地には関西国際空港やポートアイランドが建設されました。"
    }),
    geoQuestion({
      id: "challenge-geo-11-011", tier: "final", type: "input", answerTarget: "industrial-zone", sourceFactIds: ["geo-11-f03"], retrievalDirection: "direct-location-to-industry",
      examSkill: "工業地帯名の再生", mistakeTags: ["大阪府", "兵庫県"], paperRef: `${P22}／${P23}`, formatTag: "直接入力",
      prompt: "大阪府と兵庫県を中心に広がり、東大阪市などに中小工場が多い工業地帯を答えてください。", answerText: ["阪神工業地帯"], placeholder: "工業地帯名を入力",
      explanation: "大阪府・兵庫県を中心に広がり、臨海部の大工場と東大阪などの中小工場をもつのは阪神工業地帯です。"
    }),
    geoQuestion({
      id: "challenge-geo-11-012", tier: "final", type: "input", answerTarget: "airport", sourceFactIds: ["geo-11-f05", "geo-11-f06"], retrievalDirection: "direct-feature-to-airport",
      examSkill: "空港名の再生", mistakeTags: ["泉州沖", "24時間"], paperRef: `${P22}／${P23}`, formatTag: "直接入力",
      prompt: "泉州沖の人工島に建設され、24時間離着陸できる国際空港の名称を答えてください。", answerText: ["関西国際空港", "関空"], placeholder: "空港名を入力",
      explanation: "大阪府の泉州沖を埋め立てて建設され、24時間離着陸できる国際空港は関西国際空港です。"
    }),
    geoQuestion({
      id: "challenge-geo-11-013", tier: "final", type: "input", answerTarget: "cultivation", sourceFactIds: ["geo-11-f08", "geo-11-f15"], retrievalDirection: "direct-climate-to-method",
      examSkill: "栽培方法の再生", mistakeTags: ["高原野菜", "出荷を遅らせる"], paperRef: P23, formatTag: "直接入力",
      prompt: "冷涼な高原の気候を利用し、野菜の収穫や出荷を平地より遅らせる栽培方法を何といいますか。", answerText: ["抑制栽培"], placeholder: "栽培方法を入力",
      explanation: "冷涼な気候を利用して出荷時期を遅らせ、ほかの産地が少ない時期に出荷する方法は抑制栽培です。"
    }),
    geoQuestion({
      id: "challenge-geo-11-014", tier: "final", type: "input", answerTarget: "industrial-zone", sourceFactIds: ["geo-11-f11", "geo-11-f12"], retrievalDirection: "direct-superlative-to-industry",
      examSkill: "工業地帯名の再生", mistakeTags: ["愛知県", "製造品出荷額"], paperRef: P23, formatTag: "直接入力",
      prompt: "愛知県を中心に広がり、製造品出荷額が全国で最も多い工業地帯を答えてください。", answerText: ["中京工業地帯"], placeholder: "工業地帯名を入力",
      explanation: "愛知県を中心に広がり、豊田市の自動車工業など機械工業が盛んな日本最大の工業地帯は中京工業地帯です。"
    }),
    geoQuestion({
      id: "challenge-geo-11-015", tier: "final", type: "input", answerTarget: "mountains", sourceFactIds: ["geo-11-f14"], retrievalDirection: "direct-feature-to-name",
      examSkill: "山地名の再生", mistakeTags: ["3000m級", "中部地方"], paperRef: P23, formatTag: "直接入力",
      prompt: "中部地方に連なる飛驒・木曽・赤石の三つの山脈をまとめて何といいますか。", answerText: ["日本アルプス"], placeholder: "名称を入力",
      explanation: "飛驒山脈・木曽山脈・赤石山脈には3000m級の山々が連なり、まとめて日本アルプスと呼ばれます。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
