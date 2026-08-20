(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-07";
  const UNIT = "地域調査の手法";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P14 = "Challenge社会「5科のポイントチェック」p.14";
  const P15 = "Challenge社会「5科のポイントチェック」p.15";

  const SCALE_COMPARISON_MAP = {
    kind: "map", width: 360, height: 220,
    alt: "同じ幅の地図AとBを並べ、Aには道路や建物を細かく、Bには広い範囲を簡略化して示した模式図",
    caption: "縮尺による表示範囲と情報量の違いを表したオリジナル模式図",
    regions: [
      { label: "A", tone: 2, highlight: true, points: [[18, 28], [171, 28], [171, 184], [18, 184]] },
      { label: "B", tone: 5, points: [[189, 28], [342, 28], [342, 184], [189, 184]] },
      { tone: 1, points: [[37, 48], [75, 48], [75, 78], [37, 78]] },
      { tone: 1, points: [[91, 55], [127, 55], [127, 86], [91, 86]] },
      { tone: 1, points: [[55, 111], [95, 111], [95, 145], [55, 145]] },
      { tone: 1, points: [[112, 115], [151, 115], [151, 154], [112, 154]] },
      { tone: 3, points: [[211, 52], [265, 52], [265, 101], [211, 101]] },
      { tone: 3, points: [[278, 112], [327, 112], [327, 159], [278, 159]] }
    ],
    gridLines: [
      { points: [[27, 97], [161, 97]], emphasis: true },
      { points: [[82, 37], [82, 174]], dashed: true },
      { points: [[198, 91], [333, 91]], emphasis: true }
    ],
    labels: [
      { x: 94, y: 18, text: "A：2万5千分の1", emphasis: true },
      { x: 266, y: 18, text: "B：5万分の1", emphasis: true },
      { x: 94, y: 207, text: "細かな建物まで表示" },
      { x: 266, y: 207, text: "より広い範囲" }
    ]
  };

  const CONTOUR_SLOPE_MAP = {
    kind: "map", width: 360, height: 220,
    alt: "左側Aでは等高線の間隔が狭く、右側Bでは間隔が広い斜面の模式図",
    caption: "等高線の間隔と斜面の傾きの関係を表したオリジナル模式図",
    regions: [
      { label: "斜面A", tone: 2, highlight: true, points: [[24, 25], [170, 25], [170, 188], [24, 188]] },
      { label: "斜面B", tone: 5, points: [[190, 25], [336, 25], [336, 188], [190, 188]] }
    ],
    gridLines: [
      { points: [[36, 52], [158, 52]] }, { points: [[36, 64], [158, 64]] },
      { points: [[36, 76], [158, 76]] }, { points: [[36, 88], [158, 88]] },
      { points: [[36, 100], [158, 100]] }, { points: [[36, 112], [158, 112]] },
      { points: [[36, 124], [158, 124]] }, { points: [[36, 136], [158, 136]] },
      { points: [[36, 148], [158, 148]] },
      { points: [[202, 52], [324, 52]] }, { points: [[202, 84], [324, 84]] },
      { points: [[202, 116], [324, 116]] }, { points: [[202, 148], [324, 148]] }
    ],
    labels: [
      { x: 97, y: 174, text: "A", emphasis: true },
      { x: 263, y: 174, text: "B", emphasis: true },
      { x: 97, y: 45, text: "等高線" },
      { x: 263, y: 45, text: "等高線" }
    ]
  };

  const LAND_USE_CHANGE_MAP = {
    kind: "map", width: 360, height: 220,
    alt: "同じ地域の昔と現在を並べ、昔の農地が現在は住宅地とトンネルに変化した模式図",
    caption: "新旧地形図から土地利用の変化を読み取るオリジナル模式図",
    regions: [
      { label: "昔", tone: 5, points: [[18, 31], [171, 31], [171, 190], [18, 190]] },
      { label: "現在", tone: 2, highlight: true, points: [[189, 31], [342, 31], [342, 190], [189, 190]] },
      { label: "農地", tone: 3, points: [[35, 75], [150, 75], [150, 154], [35, 154]] },
      { label: "住宅地", tone: 1, points: [[207, 70], [276, 70], [276, 147], [207, 147]] },
      { label: "住宅地", tone: 1, points: [[285, 92], [327, 92], [327, 149], [285, 149]] }
    ],
    gridLines: [
      { points: [[26, 57], [162, 166]], dashed: true },
      { points: [[197, 166], [329, 57]], emphasis: true },
      { points: [[246, 45], [246, 65]], dashed: true }
    ],
    labels: [
      { x: 94, y: 21, text: "1935年ごろ", emphasis: true },
      { x: 266, y: 21, text: "現在", emphasis: true },
      { x: 94, y: 116, text: "農地" },
      { x: 267, y: 113, text: "住宅地" },
      { x: 246, y: 55, text: "トンネル" }
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
      id: "challenge-geo-07-001", tier: "core", sourceFactIds: ["geo-07-f01"], retrievalDirection: "scale-to-distance",
      examSkill: "縮尺の基本", mistakeTags: ["2万5千分の1", "単位換算"], paperRef: P14,
      prompt: "2万5千分の1地形図で、地図上の1cmが表す実際の距離はどれですか。",
      choices: ["25m", "250m", "500m", "2.5km"], answer: 1,
      explanation: "2万5千分の1地形図では1cmが実際の250mを表します。5万分の1地形図では1cmが500mです。"
    }),
    geoQuestion({
      id: "challenge-geo-07-002", tier: "core", sourceFactIds: ["geo-07-f02"], retrievalDirection: "map-length-to-real-distance",
      examSkill: "実距離の計算", mistakeTags: ["縮尺計算", "cmとm"], paperRef: P14,
      prompt: "2万5千分の1地形図で2地点が3cm離れています。実際の距離はどれですか。",
      choices: ["750m", "75m", "1.5km", "7.5km"], answer: 0,
      explanation: "地図上の1cmは250mなので、3cmでは250×3＝750mです。縮尺の分母を掛けた後に単位を直しても求められます。"
    }),
    geoQuestion({
      id: "challenge-geo-07-003", tier: "core", sourceFactIds: ["geo-07-f03"], retrievalDirection: "convention-to-direction",
      examSkill: "地形図の方位", mistakeTags: ["上が北", "方位"], paperRef: P14,
      prompt: "特別な方位表示がない一般的な地形図では、地図の上はどの方位を表しますか。",
      choices: ["東", "南", "西", "北"], answer: 3,
      explanation: "通常の地形図では上が北を表します。方位記号などが示されている場合は、その表示を優先して判断します。"
    }),
    geoQuestion({
      id: "challenge-geo-07-004", tier: "core", sourceFactIds: ["geo-07-f05", "geo-07-f06"], retrievalDirection: "contour-spacing-to-slope",
      examSkill: "等高線と傾斜", mistakeTags: ["間隔", "急斜面"], paperRef: P14,
      prompt: "等高線の間隔が狭くなっている場所の斜面は、一般にどのようになっていますか。",
      choices: ["高さがすべて同じ", "必ず海面より低い", "傾斜が急である", "傾斜がゆるやかである"], answer: 2,
      explanation: "短い水平距離で高度が大きく変化するため、等高線の間隔が狭い場所ほど斜面は急になります。"
    }),
    geoQuestion({
      id: "challenge-geo-07-005", tier: "core", sourceFactIds: ["geo-07-f04", "geo-07-f07"], retrievalDirection: "purpose-to-map-symbol",
      examSkill: "地図記号の用途", mistakeTags: ["水準点", "三角点"], paperRef: P14,
      prompt: "地点の高さを測量するときの基準になる場所を示す地図記号はどれですか。",
      choices: ["三角点", "水準点", "工場", "警察署"], answer: 1,
      explanation: "高さを測量するときの基準地点が水準点です。三角点は三角測量で位置を測るときの基準になります。"
    }),
    geoQuestion({
      id: "challenge-geo-07-006", tier: "challenge", sourceFactIds: ["geo-07-f01", "geo-07-f08"], retrievalDirection: "diagram-to-scale-comparison",
      examSkill: "縮尺の比較", mistakeTags: ["表示範囲", "情報量"], paperRef: P14, formatTag: "地図読取", figure: SCALE_COMPARISON_MAP,
      prompt: "同じ大きさの紙に表した模式図AとBについて、正しい説明はどれですか。",
      choices: ["AはBより広い範囲を表し、情報が少ない", "AとBは縮尺も情報量も必ず同じ", "AはBより狭い範囲を詳しく表している", "BはAより縮尺の分母が小さい"], answer: 2,
      explanation: "2万5千分の1のAは5万分の1のBより縮尺が大きく、表示範囲は狭い一方で建物などを詳しく表せます。"
    }),
    geoQuestion({
      id: "challenge-geo-07-007", tier: "challenge", sourceFactIds: ["geo-07-f05", "geo-07-f06"], retrievalDirection: "contour-diagram-to-slope",
      examSkill: "等高線の読図", mistakeTags: ["急傾斜", "等高線間隔"], paperRef: P14, formatTag: "図解読取", figure: CONTOUR_SLOPE_MAP,
      prompt: "模式図の斜面AとBを比べた説明として、最も適切なものはどれですか。",
      choices: ["Aは等高線が密なのでBより傾斜が急である", "Aは等高線が密なのでBより傾斜がゆるやかである", "Bは等高線が広いので標高差が存在しない", "間隔から傾斜を判断することはできない"], answer: 0,
      explanation: "Aは等高線の間隔が狭く、短い距離で標高が変化するため急斜面です。Bは間隔が広く、より緩やかです。"
    }),
    geoQuestion({
      id: "challenge-geo-07-008", tier: "challenge", sourceFactIds: ["geo-07-f09"], retrievalDirection: "old-new-map-to-change",
      examSkill: "新旧地形図の比較", mistakeTags: ["土地利用変化", "住宅地"], paperRef: P15, formatTag: "地図読取", figure: LAND_USE_CHANGE_MAP,
      prompt: "同じ地域の新旧地形図を表す模式図から読み取れる変化として、正しいものはどれですか。",
      choices: ["住宅地がなくなり、すべて農地になった", "道路も建物も完全になくなった", "海岸線だけが変化し、土地利用は同じ", "農地が減り、住宅地やトンネルがつくられた"], answer: 3,
      explanation: "新旧地形図を同じ場所で比較すると、農地の減少、住宅地の造成、道路やトンネルの新設などを読み取れます。"
    }),
    geoQuestion({
      id: "challenge-geo-07-009", tier: "challenge", sourceFactIds: ["geo-07-f10", "geo-07-f11", "geo-07-f12", "geo-07-f13", "geo-07-f14"], retrievalDirection: "purpose-to-survey-method",
      examSkill: "調査方法の選択", mistakeTags: ["野外観察", "聞き取り"], paperRef: P15, formatTag: "方法判断",
      prompt: "地域調査の方法と行動の組み合わせとして、正しいものはどれですか。",
      choices: ["野外観察―資料室だけで統計表を読む", "聞き取り調査―質問用紙を用意して詳しい人から話を聞く", "資料の調査―現地で通行人だけを数える", "まとめ―仮説を立てずに結果を捨てる"], answer: 1,
      explanation: "聞き取り調査では質問を準備し、対象に詳しい人から直接話を聞いてメモします。目的に合う方法を組み合わせます。"
    }),
    geoQuestion({
      id: "challenge-geo-07-010", tier: "challenge", sourceFactIds: ["geo-07-f15"], retrievalDirection: "data-purpose-to-graph",
      examSkill: "グラフの選択", mistakeTags: ["円グラフ", "折れ線グラフ"], paperRef: P15, formatTag: "資料判断",
      prompt: "調査結果の表し方について述べた組み合わせとして、正しいものはどれですか。",
      choices: ["全体に占める割合―折れ線グラフだけ", "時系列の変化―円グラフだけ", "全体に占める割合―円グラフ／時間変化―折れ線グラフ", "量の大小の比較―地形図だけ"], answer: 2,
      explanation: "構成割合には円グラフや帯グラフ、量の比較には棒グラフ、時間による変化には折れ線グラフが適しています。"
    }),
    geoQuestion({
      id: "challenge-geo-07-011", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-07-f01"], retrievalDirection: "direct-definition-to-term",
      examSkill: "地図用語の再生", mistakeTags: ["実距離", "割合"], paperRef: `${P14}／${P15}`, formatTag: "直接入力",
      prompt: "実際の距離を地図上に縮めた割合を何といいますか。", answerText: ["縮尺"], placeholder: "用語を入力",
      explanation: "実際の距離を地図上に縮めた割合は縮尺です。分母が小さいほど縮尺は大きく、細かな情報を表せます。"
    }),
    geoQuestion({
      id: "challenge-geo-07-012", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-07-f05", "geo-07-f06"], retrievalDirection: "direct-definition-to-term",
      examSkill: "地形用語の再生", mistakeTags: ["同じ高さ", "主曲線"], paperRef: `${P14}／${P15}`, formatTag: "直接入力",
      prompt: "地形図上で、同じ高さの地点を結んだ線を何といいますか。", answerText: ["等高線"], placeholder: "用語を入力",
      explanation: "同じ標高の地点を結んだ線は等高線です。主曲線と計曲線があり、間隔から斜面の傾きを判断できます。"
    }),
    geoQuestion({
      id: "challenge-geo-07-013", tier: "final", type: "input", answerTarget: "map", sourceFactIds: ["geo-07-f10"], retrievalDirection: "direct-purpose-to-map",
      examSkill: "調査用地図の再生", mistakeTags: ["野外観察", "経路"], paperRef: P15, formatTag: "直接入力",
      prompt: "野外観察を行う順序や調査経路などを記した地図を何といいますか。", answerText: ["ルートマップ"], placeholder: "地図名を入力",
      explanation: "野外観察の順序や調査経路を記した地図はルートマップです。現地で施設や景観を記録するときに使います。"
    }),
    geoQuestion({
      id: "challenge-geo-07-014", tier: "final", type: "input", answerTarget: "survey", sourceFactIds: ["geo-07-f12"], retrievalDirection: "direct-action-to-survey",
      examSkill: "調査方法の再生", mistakeTags: ["質問用紙", "直接会う"], paperRef: P15, formatTag: "直接入力",
      prompt: "調査対象に詳しい人に直接会い、用意した質問をして話を聞く方法を何といいますか。", answerText: ["聞き取り調査", "聞取調査"], placeholder: "調査方法を入力",
      explanation: "詳しい人へ直接質問する方法は聞き取り調査です。事前に質問用紙を用意し、回答をメモします。"
    }),
    geoQuestion({
      id: "challenge-geo-07-015", tier: "final", type: "input", answerTarget: "point", sourceFactIds: ["geo-07-f04"], retrievalDirection: "direct-purpose-to-point",
      examSkill: "測量基準点の再生", mistakeTags: ["高さ", "三角点との違い"], paperRef: P14, formatTag: "直接入力",
      prompt: "各地点の高さを測量するときの基準になる地点を何といいますか。", answerText: ["水準点"], placeholder: "地点名を入力",
      explanation: "高さを測量するときの基準地点は水準点です。位置を測るための三角点と区別して覚えます。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
