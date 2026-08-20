(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-03";
  const UNIT = "世界の人々の生活と環境";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P6 = "Challenge社会「5科のポイントチェック」p.6";
  const P7 = "Challenge社会「5科のポイントチェック」p.7";

  const MEDITERRANEAN_RAIN_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "1月から12月までの降水量を12本の棒で示した模式図。冬の棒が高く、夏の棒が低い",
    caption: "冬に雨が多く夏に乾燥する地域の、季節別降水量を表したオリジナル模式図",
    gridLines: [
      { points: [[42, 35], [42, 180]], emphasis: true },
      { points: [[42, 180], [338, 180]], emphasis: true },
      { points: [[42, 75], [338, 75]], dashed: true },
      { points: [[42, 125], [338, 125]], dashed: true }
    ],
    regions: [
      { tone: 4, points: [[52, 76], [70, 76], [70, 180], [52, 180]] },
      { tone: 4, points: [[76, 88], [94, 88], [94, 180], [76, 180]] },
      { tone: 4, points: [[100, 105], [118, 105], [118, 180], [100, 180]] },
      { tone: 4, points: [[124, 129], [142, 129], [142, 180], [124, 180]] },
      { tone: 4, points: [[148, 151], [166, 151], [166, 180], [148, 180]] },
      { tone: 4, points: [[172, 166], [190, 166], [190, 180], [172, 180]] },
      { tone: 4, points: [[196, 169], [214, 169], [214, 180], [196, 180]] },
      { tone: 4, points: [[220, 163], [238, 163], [238, 180], [220, 180]] },
      { tone: 4, points: [[244, 145], [262, 145], [262, 180], [244, 180]] },
      { tone: 4, points: [[268, 119], [286, 119], [286, 180], [268, 180]] },
      { tone: 4, points: [[292, 92], [310, 92], [310, 180], [292, 180]] },
      { tone: 4, highlight: true, points: [[316, 70], [334, 70], [334, 180], [316, 180]] }
    ],
    labels: [
      { x: 35, y: 28, text: "降水量", anchor: "start" },
      { x: 61, y: 202, text: "1月" },
      { x: 205, y: 202, text: "7月" },
      { x: 325, y: 202, text: "12月" },
      { x: 190, y: 25, text: "A地域", emphasis: true }
    ]
  };

  const HIGHLAND_TEMPERATURE_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "標高0メートルの低地で20度、標高1000メートルの山地でA度と示した高地の模式図",
    caption: "標高が100メートル上がるごとに気温が約0.6度下がる関係を表したオリジナル模式図",
    regions: [
      { label: "山地", tone: 2, points: [[38, 178], [105, 145], [164, 116], [218, 75], [286, 32], [330, 178]] },
      { label: "低地", tone: 5, points: [[18, 178], [342, 178], [342, 202], [18, 202]] }
    ],
    gridLines: [
      { points: [[55, 173], [55, 44]], dashed: true },
      { points: [[55, 173], [288, 44]], emphasis: true }
    ],
    points: [
      { x: 55, y: 173, r: 5 },
      { x: 288, y: 44, r: 5 }
    ],
    labels: [
      { x: 85, y: 169, text: "標高0m・20℃", anchor: "start" },
      { x: 288, y: 25, text: "標高1000m", emphasis: true },
      { x: 306, y: 58, text: "A℃", emphasis: true }
    ]
  };

  const OASIS_LIFE_MAP = {
    kind: "map",
    width: 360,
    height: 220,
    alt: "乾燥した土地の中央に水場と緑地Aがあり、その周囲に畑と集落がある模式図",
    caption: "乾燥地域で水の得られる場所に農地と集落が集まる様子を表したオリジナル模式図",
    regions: [
      { label: "乾燥地", tone: 5, points: [[18, 28], [342, 28], [342, 195], [18, 195]] },
      { label: "畑", tone: 3, points: [[117, 75], [244, 75], [270, 147], [91, 147]] },
      { label: "緑地", tone: 2, highlight: true, points: [[140, 91], [219, 91], [235, 132], [125, 132]] },
      { label: "集落", tone: 1, points: [[72, 62], [105, 62], [105, 89], [72, 89]] }
    ],
    gridLines: [
      { points: [[128, 106], [232, 106]], dashed: true },
      { points: [[180, 66], [180, 153]], dashed: true }
    ],
    points: [{ x: 180, y: 112, r: 11 }],
    labels: [
      { x: 180, y: 116, text: "水" },
      { x: 180, y: 57, text: "A", emphasis: true },
      { x: 88, y: 81, text: "集落" },
      { x: 287, y: 176, text: "雨が少ない土地" }
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
      id: "challenge-geo-03-001", tier: "core", sourceFactIds: ["geo-03-f01"], retrievalDirection: "list-to-category",
      examSkill: "気候帯の区分", mistakeTags: ["五つの気候帯", "名称混同"], paperRef: P6,
      prompt: "世界の気候帯の組み合わせとして、すべて正しいものはどれですか。",
      choices: ["熱帯・砂漠帯・温帯・亜熱帯・寒帯", "熱帯・乾燥帯・温帯・冷帯・寒帯", "熱帯・乾燥帯・海洋帯・冷帯・高山帯", "雨帯・乾燥帯・温帯・冷帯・氷雪帯"], answer: 1,
      explanation: "世界の主な気候帯は熱帯・乾燥帯・温帯・冷帯（亜寒帯）・寒帯の五つです。高山気候は別に扱います。"
    }),
    geoQuestion({
      id: "challenge-geo-03-002", tier: "core", sourceFactIds: ["geo-03-f02"], retrievalDirection: "feature-to-climate",
      examSkill: "熱帯の気候", mistakeTags: ["熱帯雨林", "サバナ"], paperRef: P6,
      prompt: "熱帯雨林気候とサバナ気候の説明として、最も適切なものはどれですか。",
      choices: ["どちらも年中高温で、サバナ気候には雨季と乾季がある", "どちらも冬の寒さが厳しく、夏だけ雨が多い", "熱帯雨林気候は年中乾燥し、サバナ気候は年中多雨である", "熱帯雨林気候では短い夏にこけ類だけが育つ"], answer: 0,
      explanation: "熱帯は一年を通して高温です。熱帯雨林気候は降水量が多く、サバナ気候は雨季と乾季が分かれます。"
    }),
    geoQuestion({
      id: "challenge-geo-03-003", tier: "core", sourceFactIds: ["geo-03-f03"], retrievalDirection: "comparison-to-climate",
      examSkill: "乾燥帯の気候", mistakeTags: ["砂漠", "ステップ"], paperRef: P6,
      prompt: "砂漠気候とステップ気候を比べた説明として正しいものはどれですか。",
      choices: ["砂漠気候の方が雨が多く森林が広がる", "ステップ気候では一年中雪と氷に覆われる", "どちらも一年中雨が多く稲作に適する", "ステップ気候は砂漠気候より雨があり、短い草が生える"], answer: 3,
      explanation: "砂漠気候は雨がきわめて少なく、ステップ気候はそれより少し雨が多いため、短い草原が見られます。"
    }),
    geoQuestion({
      id: "challenge-geo-03-004", tier: "core", sourceFactIds: ["geo-03-f04"], retrievalDirection: "season-pattern-to-climate",
      examSkill: "温帯の気候", mistakeTags: ["地中海性気候", "季節降水"], paperRef: P6,
      prompt: "夏に乾燥し、冬に雨が多くなる温帯の気候はどれですか。",
      choices: ["西岸海洋性気候", "温暖湿潤気候", "地中海性気候", "ツンドラ気候"], answer: 2,
      explanation: "地中海性気候は夏に乾燥し、冬に降水量が多くなります。西岸海洋性気候は一年を通して雨が降ります。"
    }),
    geoQuestion({
      id: "challenge-geo-03-005", tier: "core", sourceFactIds: ["geo-03-f05"], retrievalDirection: "vegetation-to-climate",
      examSkill: "冷帯・寒帯", mistakeTags: ["ツンドラ", "氷雪"], paperRef: P6,
      prompt: "短い夏に草やこけが生え、樹木がほとんど育たない気候はどれですか。",
      choices: ["冷帯気候", "ツンドラ気候", "氷雪気候", "高山気候"], answer: 1,
      explanation: "ツンドラ気候では短い夏に草やこけが生えます。氷雪気候では一年中雪や氷に覆われ、植物はほぼ育ちません。"
    }),
    geoQuestion({
      id: "challenge-geo-03-006", tier: "challenge", sourceFactIds: ["geo-03-f04"], retrievalDirection: "graph-to-climate",
      examSkill: "降水グラフの判断", mistakeTags: ["地中海性気候", "雨季"], paperRef: P6, formatTag: "資料読取", figure: MEDITERRANEAN_RAIN_MAP,
      prompt: "A地域の降水量は夏に少なく冬に多い形です。この地域の気候として最も適切なものはどれですか。",
      choices: ["サバナ気候", "西岸海洋性気候", "地中海性気候", "氷雪気候"], answer: 2,
      explanation: "夏に乾燥し冬に雨が多いのは地中海性気候です。乾燥に強いぶどうやオリーブの栽培が盛んです。"
    }),
    geoQuestion({
      id: "challenge-geo-03-007", tier: "challenge", sourceFactIds: ["geo-03-f06"], retrievalDirection: "diagram-and-rate-to-temperature",
      examSkill: "高地の気温計算", mistakeTags: ["標高差", "気温低下"], paperRef: P6, formatTag: "図解計算", figure: HIGHLAND_TEMPERATURE_MAP,
      prompt: "低地が20℃のとき、同じ地域の標高1000m地点Aの気温はおよそ何℃ですか。",
      choices: ["14℃", "16℃", "20.6℃", "26℃"], answer: 0,
      explanation: "標高100mにつき約0.6℃下がるので、1000mでは約6℃低下します。20−6でAは約14℃です。"
    }),
    geoQuestion({
      id: "challenge-geo-03-008", tier: "challenge", sourceFactIds: ["geo-03-f09"], retrievalDirection: "schematic-to-livelihood",
      examSkill: "乾燥地域の生活", mistakeTags: ["オアシス", "農業"], paperRef: P6, formatTag: "図解読取", figure: OASIS_LIFE_MAP,
      prompt: "模式図のAのように、乾燥地域で水が得られる場所を利用する生活として最も適切なものはどれですか。",
      choices: ["永久凍土上の高床住宅", "熱帯林を利用した焼畑だけを行う", "氷上であざらしを狩る", "水場の周囲で集落をつくり農業を行う"], answer: 3,
      explanation: "乾燥地域では水が得られるオアシスの周囲に集落や畑がつくられます。かんがい農業や遊牧も見られます。"
    }),
    geoQuestion({
      id: "challenge-geo-03-009", tier: "challenge", sourceFactIds: ["geo-03-f08", "geo-03-f10", "geo-03-f12", "geo-03-f13", "geo-03-f14"], retrievalDirection: "environment-to-life-comparison",
      examSkill: "環境と生活の対応", mistakeTags: ["作物", "住居"], paperRef: `${P6}／${P7}`, formatTag: "比較・判断",
      prompt: "自然環境と人々の生活の組み合わせとして、正しいものはどれですか。",
      choices: ["地中海沿岸―夏の多雨を生かした稲作だけを行う", "地中海沿岸―乾燥に強いぶどうやオリーブを育てる", "モンゴルの草原―移動しにくい石造高層住宅を建てる", "アンデス高地―らくだだけを利用し、じゃがいもを避ける"], answer: 1,
      explanation: "地中海沿岸では夏の乾燥に強いぶどうやオリーブを栽培します。人々は気候や得られる材料に生活を適応させます。"
    }),
    geoQuestion({
      id: "challenge-geo-03-010", tier: "challenge", sourceFactIds: ["geo-03-f15"], retrievalDirection: "practice-to-religion",
      examSkill: "宗教と生活", mistakeTags: ["宗教行動", "聖典"], paperRef: P7, formatTag: "比較・判断",
      prompt: "世界の宗教と信仰生活の組み合わせとして、正しいものはどれですか。",
      choices: ["キリスト教―コーランを聖典とし、メッカへ向かって祈る", "仏教―牛を神聖な動物とし、ガンジス川で身を清める", "イスラム教―コーランを聖典とし、豚肉や飲酒を禁じる", "ヒンドゥー教―日曜日に教会へ集まり、聖書を読む"], answer: 2,
      explanation: "イスラム教ではコーランを聖典とし、メッカの方向への礼拝や断食などが生活に深く関係します。"
    }),
    geoQuestion({
      id: "challenge-geo-03-011", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-03-f11"], retrievalDirection: "direct-definition-to-term",
      examSkill: "農業用語の再生", mistakeTags: ["焼畑農業", "灰"], paperRef: P7, formatTag: "直接入力",
      prompt: "森林や草を焼き、その灰を肥料にして作物を育てる農業を何といいますか。", answerText: ["焼畑農業", "焼き畑農業", "焼畑"], placeholder: "農業名を入力",
      explanation: "森林や草を焼いた灰を肥料にして作物を育てる方法は焼畑農業です。同じ土地を使い続けない点も特徴です。"
    }),
    geoQuestion({
      id: "challenge-geo-03-012", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-03-f12"], retrievalDirection: "direct-definition-to-term",
      examSkill: "牧畜用語の再生", mistakeTags: ["遊牧", "移動"], paperRef: P7, formatTag: "直接入力",
      prompt: "家畜を育てながら、草や水を求めて人々が移動する牧畜を何といいますか。", answerText: ["遊牧"], placeholder: "用語を入力",
      explanation: "草や水を求めて家畜とともに移動する牧畜は遊牧です。移動や解体がしやすい住居も利用されます。"
    }),
    geoQuestion({
      id: "challenge-geo-03-013", tier: "final", type: "input", answerTarget: "number", sourceFactIds: ["geo-03-f06"], retrievalDirection: "direct-altitude-to-temperature-rate",
      examSkill: "気温低下率の再生", mistakeTags: ["0.6度", "標高100m"], paperRef: P6, formatTag: "直接入力",
      prompt: "高山気候では、標高が100m上がると気温はおよそ何℃下がりますか。", answerText: ["0.6℃", "約0.6℃", "0.6度", "約0.6度"], placeholder: "数字と単位を入力",
      explanation: "標高が100m上がるごとに、気温はおよそ0.6℃下がります。標高差から気温を求める計算にも使えます。"
    }),
    geoQuestion({
      id: "challenge-geo-03-014", tier: "final", type: "input", answerTarget: "religion", sourceFactIds: ["geo-03-f15"], retrievalDirection: "direct-practice-to-religion",
      examSkill: "宗教名の再生", mistakeTags: ["コーラン", "メッカ"], paperRef: P7, formatTag: "直接入力",
      prompt: "コーランを聖典とし、一日に5回、メッカの方向へ礼拝する宗教を答えてください。", answerText: ["イスラム教", "イスラム"], placeholder: "宗教名を入力",
      explanation: "コーランを聖典とし、メッカの方向へ礼拝するのはイスラム教です。食事や断食にも教えが反映されます。"
    }),
    geoQuestion({
      id: "challenge-geo-03-015", tier: "final", type: "input", answerTarget: "religion", sourceFactIds: ["geo-03-f15"], retrievalDirection: "direct-region-practice-to-religion",
      examSkill: "宗教名の再生", mistakeTags: ["インド", "牛"], paperRef: P7, formatTag: "直接入力",
      prompt: "インドで多くの人が信仰し、牛を神聖な動物と考える宗教を答えてください。", answerText: ["ヒンドゥー教", "ヒンズー教", "ヒンドゥー"], placeholder: "宗教名を入力",
      explanation: "インドの国民のおよそ8割が信仰し、牛を神聖な動物と考えるのはヒンドゥー教です。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
