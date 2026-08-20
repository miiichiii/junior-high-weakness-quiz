(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-10";
  const UNIT = "九州地方、中国・四国地方";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P20 = "Challenge社会「5科のポイントチェック」p.20";
  const P21 = "Challenge社会「5科のポイントチェック」p.21";

  const KYUSHU_REGION_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "九州を北部平野A、中央火山B、南部台地C、南東部平野Dに分けた模式図",
    caption: "九州の地形と農業の地域差を表したオリジナル模式図",
    regions: [
      { label: "九州", tone: 5, points: [[116, 23], [213, 27], [277, 62], [268, 109], [242, 148], [221, 205], [176, 185], [150, 153], [111, 130], [83, 84]] },
      { label: "A", tone: 3, points: [[105, 48], [202, 43], [236, 66], [194, 87], [119, 79]] },
      { label: "B", tone: 1, highlight: true, points: [[154, 84], [215, 82], [234, 119], [188, 142], [141, 119]] },
      { label: "C", tone: 2, points: [[142, 121], [189, 143], [221, 202], [176, 184], [149, 153]] },
      { label: "D", tone: 4, points: [[216, 121], [257, 103], [243, 148], [221, 201], [205, 160]] }
    ],
    labels: [
      { x: 161, y: 62, text: "A 北部の平野", emphasis: true },
      { x: 187, y: 111, text: "B 火山地域", emphasis: true },
      { x: 177, y: 161, text: "C 南部の台地", emphasis: true },
      { x: 247, y: 145, text: "D 南東部", emphasis: true },
      { x: 180, y: 220, text: "位置関係を簡略化" }
    ]
  };

  const SEASONAL_WIND_DIAGRAM = {
    kind: "map", width: 360, height: 230,
    alt: "日本海、中国山地、瀬戸内海、四国山地、太平洋を西から東へ並べ、冬と夏の季節風を示した模式図",
    caption: "中国・四国地方の地形と季節風による降水差を表したオリジナル断面図",
    regions: [
      { label: "中国山地", tone: 3, points: [[78, 167], [128, 77], [174, 167]] },
      { label: "四国山地", tone: 2, highlight: true, points: [[202, 167], [258, 58], [319, 167]] },
      { label: "瀬戸内", tone: 5, points: [[163, 151], [215, 151], [215, 183], [163, 183]] }
    ],
    gridLines: [
      { points: [[23, 61], [79, 82], [115, 111]], emphasis: true },
      { points: [[337, 96], [300, 86], [267, 98]], emphasis: true },
      { points: [[140, 112], [174, 137], [205, 137]], dashed: true }
    ],
    points: [
      { x: 93, y: 99, r: 4 }, { x: 105, y: 109, r: 4 }, { x: 282, y: 91, r: 4 }, { x: 296, y: 101, r: 4 }
    ],
    labels: [
      { x: 28, y: 187, text: "日本海", anchor: "start" },
      { x: 128, y: 187, text: "中国山地" },
      { x: 189, y: 207, text: "瀬戸内" },
      { x: 258, y: 187, text: "四国山地" },
      { x: 333, y: 187, text: "太平洋" },
      { x: 66, y: 45, text: "冬の湿った風", emphasis: true },
      { x: 291, y: 45, text: "夏の湿った風", emphasis: true }
    ]
  };

  const BRIDGE_ROUTES_MAP = {
    kind: "map", width: 360, height: 230,
    alt: "本州と四国の間を西・中央・東の三つのルートA、B、Cで結んだ模式図",
    caption: "本州四国連絡橋の三ルートの位置関係を表したオリジナル模式図",
    regions: [
      { label: "本州", tone: 5, points: [[23, 43], [337, 43], [337, 82], [23, 82]] },
      { label: "四国", tone: 3, points: [[62, 168], [303, 168], [283, 205], [83, 205]] }
    ],
    gridLines: [
      { points: [[91, 79], [111, 171]], emphasis: true },
      { points: [[181, 79], [181, 171]], emphasis: true },
      { points: [[274, 79], [246, 171]], emphasis: true }
    ],
    labels: [
      { x: 180, y: 65, text: "本州", emphasis: true },
      { x: 181, y: 193, text: "四国", emphasis: true },
      { x: 98, y: 128, text: "A 西", emphasis: true },
      { x: 181, y: 128, text: "B 中央", emphasis: true },
      { x: 264, y: 128, text: "C 東", emphasis: true },
      { x: 180, y: 222, text: "三つの連絡ルート" }
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
      id: "challenge-geo-10-001", tier: "core", sourceFactIds: ["geo-10-f01"], retrievalDirection: "landform-to-agriculture",
      examSkill: "九州の地形", mistakeTags: ["火山", "シラス台地"], paperRef: P20,
      prompt: "九州地方の地形について述べた文として、正しいものはどれですか。",
      choices: ["九州には火山がなく、全域が低い平野である", "南部の台地は水もちがよく、水田だけに利用される", "阿蘇山には大きなくぼ地があり、南部には火山灰が積もった台地が広がる", "阿蘇山は氷河によってできた地形である"], answer: 2,
      explanation: "九州には阿蘇山など多くの火山があり、阿蘇山にはカルデラがあります。南部のシラス台地は水もちが悪く、畑作や畜産が盛んです。"
    }),
    geoQuestion({
      id: "challenge-geo-10-002", tier: "core", sourceFactIds: ["geo-10-f02"], retrievalDirection: "region-to-agricultural-product",
      examSkill: "九州の農業", mistakeTags: ["筑紫平野", "宮崎平野"], paperRef: P20,
      prompt: "九州・沖縄の地域と農業の組み合わせとして、正しいものはどれですか。",
      choices: ["筑紫平野―パイナップルだけ／宮崎平野―酪農だけ", "筑紫平野―稲作／宮崎平野―野菜の促成栽培", "沖縄―りんごと小麦だけ", "九州南部―水田だけで畜産は行わない"], answer: 1,
      explanation: "筑紫平野は代表的な稲作地帯で、温暖な宮崎平野では野菜の促成栽培が盛んです。沖縄ではさとうきびや熱帯果樹も生産します。"
    }),
    geoQuestion({
      id: "challenge-geo-10-003", tier: "core", sourceFactIds: ["geo-10-f03", "geo-10-f07"], retrievalDirection: "natural-condition-to-use",
      examSkill: "九州の自然利用", mistakeTags: ["地熱発電", "交通立地"], paperRef: P20,
      prompt: "九州地方で自然条件や交通条件を産業に生かした例として、正しいものはどれですか。",
      choices: ["内陸のIC工場―港から遠いほどよいので道路を避ける", "沖縄県―寒冷な気候を利用した小麦だけの栽培", "宮崎平野―一年中暖房して収穫を遅らせる", "大分県―火山を温泉や地熱発電に利用"], answer: 3,
      explanation: "大分県では火山の熱を温泉や地熱発電に利用します。IC工場は高速道路や空港に近い場所に多く、交通の便利さを生かしています。"
    }),
    geoQuestion({
      id: "challenge-geo-10-004", tier: "core", sourceFactIds: ["geo-10-f04", "geo-10-f05"], retrievalDirection: "industry-change-to-region",
      examSkill: "北九州の工業と公害", mistakeTags: ["エネルギー革命", "環境モデル都市"], paperRef: P20,
      prompt: "北九州工業地域の変化と環境について述べた文として、正しいものはどれですか。",
      choices: ["筑豊炭田の石炭を利用した鉄鋼業から、機械工業中心へ変化した", "エネルギー革命後に石炭産業だけが急成長した", "八代海沿岸では公害が一度も起こらなかった", "北九州市は環境改善に取り組んでいない"], answer: 0,
      explanation: "北九州は石炭を利用した鉄鋼業から自動車・電子部品などの機械工業へ変化しました。公害を経験し、現在は環境改善も進めています。"
    }),
    geoQuestion({
      id: "challenge-geo-10-005", tier: "core", sourceFactIds: ["geo-10-f08", "geo-10-f09"], retrievalDirection: "region-to-landform-and-climate",
      examSkill: "中国・四国の自然", mistakeTags: ["中国山地", "瀬戸内"], paperRef: P21,
      prompt: "中国・四国地方の地形と気候について述べた文として、最も適切なものはどれですか。",
      choices: ["瀬戸内は二つの山地の影響を受けず、年間降水量が日本最大である", "山陰は冬の季節風の影響を受けない", "中国山地は比較的なだらかで、四国山地はけわしい", "南四国は夏もほとんど雨が降らない"], answer: 2,
      explanation: "中国山地は比較的なだらかで、四国山地はけわしい地形です。瀬戸内は山地にはさまれて降水量が少なく、山陰は冬、南四国は夏に雨が多くなります。"
    }),
    geoQuestion({
      id: "challenge-geo-10-006", tier: "challenge", sourceFactIds: ["geo-10-f01", "geo-10-f02"], retrievalDirection: "schematic-zone-to-feature",
      examSkill: "九州の地域差", mistakeTags: ["阿蘇山", "シラス台地"], paperRef: P20, formatTag: "地図読取", figure: KYUSHU_REGION_MAP,
      prompt: "九州の位置関係を表す模式図です。A〜Dの地域の説明として、正しいものはどれですか。",
      choices: ["Aはシラス台地、Bは海底、Cは氷河、Dは砂漠", "Aでは稲作、Bには阿蘇山、Cでは畑作・畜産、Dでは促成栽培が盛ん", "Bには火山がなく、Cは水田だけに利用される", "Dは北海道にあり、寒さを利用した抑制栽培だけを行う"], answer: 1,
      explanation: "北部の筑紫平野は稲作、中央部には阿蘇山、南部のシラス台地は畑作・畜産、南東部の宮崎平野は促成栽培が代表的です。"
    }),
    geoQuestion({
      id: "challenge-geo-10-007", tier: "challenge", sourceFactIds: ["geo-10-f09"], retrievalDirection: "cross-section-to-rainfall",
      examSkill: "季節風と降水", mistakeTags: ["山陰", "南四国"], paperRef: P21, formatTag: "図解読取", figure: SEASONAL_WIND_DIAGRAM,
      prompt: "地形と季節風を表す模式図から考えた地域別の降水について、正しい説明はどれですか。",
      choices: ["瀬戸内は一年中あらゆる方向の湿った風が集まり、最も雨が多い", "中国山地と四国山地は降水に影響しない", "南四国では夏の太平洋側からの風が山地を越えず、雨は全く降らない", "山陰は冬の季節風で降水が多く、南四国は夏の季節風で降水が多い"], answer: 3,
      explanation: "冬は日本海側からの湿った風で山陰に雪や雨が多く、夏は太平洋側からの湿った風で南四国に雨が多くなります。瀬戸内は比較的少雨です。"
    }),
    geoQuestion({
      id: "challenge-geo-10-008", tier: "challenge", sourceFactIds: ["geo-10-f13"], retrievalDirection: "route-position-to-name",
      examSkill: "本州四国連絡橋", mistakeTags: ["瀬戸大橋", "しまなみ海道"], paperRef: P21, formatTag: "地図読取", figure: BRIDGE_ROUTES_MAP,
      prompt: "本州と四国を結ぶ三つのルートを西からA・B・Cとした模式図です。正しい組み合わせはどれですか。",
      choices: ["A神戸・鳴門／B尾道・今治／C児島・坂出", "A関門／B青函／C東京湾", "A尾道・今治／B児島・坂出／C神戸・鳴門", "A児島・坂出／B神戸・鳴門／C尾道・今治"], answer: 2,
      explanation: "西から尾道・今治ルートのしまなみ海道、児島・坂出ルートの瀬戸大橋、神戸・鳴門ルートの明石海峡大橋・大鳴門橋です。"
    }),
    geoQuestion({
      id: "challenge-geo-10-009", tier: "challenge", sourceFactIds: ["geo-10-f10", "geo-10-f11", "geo-10-f12"], retrievalDirection: "condition-to-industry",
      examSkill: "中国・四国の産業", mistakeTags: ["促成栽培", "石油化学"], paperRef: P21, formatTag: "比較・判断",
      prompt: "中国・四国地方の産業と地域の組み合わせとして、正しいものはどれですか。",
      choices: ["鳥取平野―日本なし／高知平野―野菜の促成栽培／広島湾―かきの養殖", "岡山平野―さとうきびだけ／愛媛県―小麦だけ", "瀬戸内工業地域―水運を利用せず山頂だけに立地", "倉敷市水島―林業だけで石油化学工業はない"], answer: 0,
      explanation: "鳥取のなし、岡山のぶどう・もも、高知の促成栽培、愛媛のみかん、広島湾のかき養殖が代表例です。瀬戸内には石油化学工業も発達しました。"
    }),
    geoQuestion({
      id: "challenge-geo-10-010", tier: "challenge", sourceFactIds: ["geo-10-f06", "geo-10-f14", "geo-10-f15"], retrievalDirection: "regional-issue-to-response",
      examSkill: "地域課題の判断", mistakeTags: ["過疎", "地方中枢都市"], paperRef: `${P20}／${P21}`, formatTag: "課題判断",
      prompt: "九州、中国・四国地方の地域課題について述べた文として、正しいものはどれですか。",
      choices: ["広島市は地方中枢都市ではなく、都市機能がない", "中国山地や瀬戸内の離島では過疎が進み、高速道路で人口流出が減った地域もある", "沖縄県では観光業が行われず、基地問題もない", "山間部では人口が増え続け、町おこしは不要である"], answer: 1,
      explanation: "中国山地や離島では過疎が課題ですが、交通整備や町おこしで活性化を図ります。広島市は地方中枢都市で、沖縄では観光と基地が地域課題です。"
    }),
    geoQuestion({
      id: "challenge-geo-10-011", tier: "final", type: "input", answerTarget: "landform", sourceFactIds: ["geo-10-f01"], retrievalDirection: "direct-definition-to-term",
      examSkill: "火山地形名の再生", mistakeTags: ["噴火", "くぼ地"], paperRef: `${P20}／${P21}`, formatTag: "直接入力",
      prompt: "火山の大規模な噴火によってできたくぼ地を何といいますか。", answerText: ["カルデラ"], placeholder: "地形名を入力",
      explanation: "火山の大規模な噴火や陥没によってできる大きなくぼ地はカルデラです。阿蘇山のものが有名です。"
    }),
    geoQuestion({
      id: "challenge-geo-10-012", tier: "final", type: "input", answerTarget: "plateau", sourceFactIds: ["geo-10-f01"], retrievalDirection: "direct-location-to-landform",
      examSkill: "台地名の再生", mistakeTags: ["火山灰", "九州南部"], paperRef: `${P20}／${P21}`, formatTag: "直接入力",
      prompt: "鹿児島県と宮崎県の一部に広がる、火山灰などが積もった台地を何といいますか。", answerText: ["シラス台地"], placeholder: "台地名を入力",
      explanation: "九州南部に広がる火山灰などが積もった台地はシラス台地です。水もちが悪く、畑作や畜産に利用されます。"
    }),
    geoQuestion({
      id: "challenge-geo-10-013", tier: "final", type: "input", answerTarget: "cultivation", sourceFactIds: ["geo-10-f02", "geo-10-f10"], retrievalDirection: "direct-climate-to-method",
      examSkill: "栽培方法の再生", mistakeTags: ["温暖な気候", "収穫を早める"], paperRef: `${P20}／${P21}`, formatTag: "直接入力",
      prompt: "温暖な気候や施設を利用して、野菜などの収穫時期を早める栽培方法を何といいますか。", answerText: ["促成栽培"], placeholder: "栽培方法を入力",
      explanation: "温暖な気候やビニールハウスを利用して出荷を早める方法は促成栽培です。宮崎平野や高知平野で盛んです。"
    }),
    geoQuestion({
      id: "challenge-geo-10-014", tier: "final", type: "input", answerTarget: "industrial-region", sourceFactIds: ["geo-10-f12"], retrievalDirection: "direct-location-to-industry",
      examSkill: "工業地域名の再生", mistakeTags: ["瀬戸内海", "臨海部"], paperRef: P21, formatTag: "直接入力",
      prompt: "瀬戸内海沿岸の埋立地や塩田跡地などに発達した工業地域を答えてください。", answerText: ["瀬戸内工業地域"], placeholder: "工業地域名を入力",
      explanation: "瀬戸内海の水運を利用し、沿岸の埋立地や塩田跡地に発達した工業地域は瀬戸内工業地域です。"
    }),
    geoQuestion({
      id: "challenge-geo-10-015", tier: "final", type: "input", answerTarget: "bridge-system", sourceFactIds: ["geo-10-f13"], retrievalDirection: "direct-routes-to-name",
      examSkill: "交通用語の再生", mistakeTags: ["三ルート", "本州と四国"], paperRef: P21, formatTag: "直接入力",
      prompt: "児島・坂出、神戸・鳴門、尾道・今治の三ルートをまとめて何といいますか。", answerText: ["本州四国連絡橋"], placeholder: "名称を入力",
      explanation: "本州と四国を三つのルートで結ぶ橋の総称は本州四国連絡橋です。瀬戸大橋やしまなみ海道などを含みます。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
