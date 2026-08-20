(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-01";
  const UNIT = "世界の地域構成";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P2 = "Challenge社会「5科のポイントチェック」p.2";
  const P3 = "Challenge社会「5科のポイントチェック」p.3";

  const ATLANTIC_MAP = {
    kind: "map",
    width: 360,
    height: 210,
    alt: "南北アメリカの東、ヨーロッパとアフリカの西にAと示した略地図",
    caption: "教材の図を転載せず、位置関係だけを表したオリジナル略地図",
    regions: [
      { label: "北アメリカ大陸", tone: 1, points: [[22, 44], [65, 27], [108, 43], [100, 78], [77, 94], [43, 79]] },
      { label: "南アメリカ大陸", tone: 2, points: [[91, 95], [119, 101], [130, 135], [113, 184], [96, 153]] },
      { label: "ユーラシア大陸", tone: 3, points: [[196, 36], [266, 24], [335, 52], [301, 86], [239, 82], [207, 66]] },
      { label: "アフリカ大陸", tone: 4, points: [[202, 85], [243, 88], [253, 128], [226, 177], [203, 135]] },
      { label: "オーストラリア大陸", tone: 5, points: [[293, 142], [329, 143], [337, 167], [302, 174]] }
    ],
    labels: [
      { x: 67, y: 62, text: "北アメリカ" },
      { x: 111, y: 133, text: "南アメリカ" },
      { x: 269, y: 54, text: "ユーラシア" },
      { x: 226, y: 126, text: "アフリカ" },
      { x: 163, y: 103, text: "A", emphasis: true }
    ]
  };

  const LAT_LONG_MAP = {
    kind: "map",
    width: 360,
    height: 210,
    alt: "地球を表す長方形に、中央の横線Aと中央の縦線Bを引いた緯線・経線の模式図",
    caption: "Aは緯度0度の線、Bは経度0度の線を表すオリジナル模式図",
    gridLines: [
      { points: [[30, 55], [330, 55]] },
      { points: [[30, 105], [330, 105]], emphasis: true },
      { points: [[30, 155], [330, 155]] },
      { points: [[80, 25], [80, 185]] },
      { points: [[130, 25], [130, 185]] },
      { points: [[180, 25], [180, 185]], emphasis: true },
      { points: [[230, 25], [230, 185]] },
      { points: [[280, 25], [280, 185]] }
    ],
    labels: [
      { x: 340, y: 110, text: "A", emphasis: true },
      { x: 187, y: 19, text: "B", emphasis: true },
      { x: 53, y: 48, text: "北" },
      { x: 53, y: 174, text: "南" },
      { x: 309, y: 199, text: "東" },
      { x: 49, y: 199, text: "西" }
    ]
  };

  const ASIA_REGION_MAP = {
    kind: "map",
    width: 360,
    height: 210,
    alt: "世界を6つの州に分け、日本の位置を赤い点で示した略地図",
    caption: "大陸の形を簡略化したオリジナルの地域区分図",
    regions: [
      { label: "北アメリカ州", tone: 1, points: [[19, 46], [65, 29], [107, 45], [98, 82], [48, 82]] },
      { label: "南アメリカ州", tone: 2, points: [[91, 95], [120, 101], [126, 139], [108, 183], [95, 150]] },
      { label: "ヨーロッパ州", tone: 6, points: [[191, 50], [218, 39], [229, 61], [204, 76]] },
      { label: "アジア州", tone: 3, highlight: true, points: [[220, 36], [284, 25], [338, 53], [304, 91], [253, 84], [225, 65]] },
      { label: "アフリカ州", tone: 4, points: [[201, 83], [243, 87], [253, 129], [226, 177], [203, 134]] },
      { label: "オセアニア州", tone: 5, points: [[291, 143], [330, 141], [339, 168], [301, 176]] }
    ],
    points: [{ x: 319, y: 72, r: 5 }],
    labels: [
      { x: 276, y: 58, text: "アジア州" },
      { x: 312, y: 64, text: "日本", emphasis: true }
    ]
  };

  function geoQuestion(question) {
    const defaults = {
      core: { priority: "S", difficulty: "L1 基礎復帰", stage: "基本語句" },
      challenge: { priority: "A", difficulty: "L2 県立標準", stage: "地図・判断" },
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
      id: "challenge-geo-01-001", tier: "core", sourceFactIds: ["geo-01-f01"], retrievalDirection: "description-to-term",
      examSkill: "地球の表し方", mistakeTags: ["地球儀", "地図と模型"], paperRef: P2,
      prompt: "大陸の形や面積に加え、地球上の距離と方位もまとめて正しく表せるものはどれですか。",
      choices: ["世界地図", "地球儀", "統計地図", "時差表"], answer: 1,
      explanation: "地球儀は球形なので、形・面積・距離・方位を地球に近い状態で表せます。平面の地図では、すべてを同時に正しくは表せません。"
    }),
    geoQuestion({
      id: "challenge-geo-01-002", tier: "core", sourceFactIds: ["geo-01-f02"], retrievalDirection: "concept-to-ratio",
      examSkill: "海陸比の理解", mistakeTags: ["海洋の割合", "数値混同"], paperRef: P2,
      prompt: "地球の表面のうち、海洋が占める割合に最も近いものはどれですか。",
      choices: ["約3割", "約5割", "約7割", "約9割"], answer: 2,
      explanation: "海洋は地球表面の約7割、陸地は約3割です。「海の方が広い」と割合を一組で覚えます。"
    }),
    geoQuestion({
      id: "challenge-geo-01-003", tier: "core", sourceFactIds: ["geo-01-f03"], retrievalDirection: "set-recognition",
      examSkill: "三大洋の識別", mistakeTags: ["三大洋", "海域名混同"], paperRef: P2,
      prompt: "三大洋の組み合わせとして正しいものはどれですか。",
      choices: ["太平洋・大西洋・インド洋", "太平洋・地中海・日本海", "大西洋・北海・紅海", "インド洋・黒海・カリブ海"], answer: 0,
      explanation: "三大洋は太平洋・大西洋・インド洋です。地中海や日本海は、三大洋には含まれません。"
    }),
    geoQuestion({
      id: "challenge-geo-01-004", tier: "core", sourceFactIds: ["geo-01-f05"], retrievalDirection: "rule-to-coordinate",
      examSkill: "緯度の理解", mistakeTags: ["緯度経度", "南北と東西"], paperRef: P2,
      prompt: "赤道を0度とし、地球を南北それぞれ90度まで分けて表すものはどれですか。",
      choices: ["経度", "標高", "時差", "緯度"], answer: 3,
      explanation: "緯度は赤道を0度とし、北緯と南緯をそれぞれ90度まで表します。緯線は赤道と平行です。"
    }),
    geoQuestion({
      id: "challenge-geo-01-005", tier: "core", sourceFactIds: ["geo-01-f06"], retrievalDirection: "rule-to-coordinate",
      examSkill: "経度の理解", mistakeTags: ["緯度経度", "本初子午線"], paperRef: P2,
      prompt: "本初子午線を0度とし、地球を東西それぞれ180度まで分けて表すものはどれですか。",
      choices: ["緯度", "経度", "気圧", "標高"], answer: 1,
      explanation: "経度は本初子午線を0度とし、東経と西経をそれぞれ180度まで表します。"
    }),
    geoQuestion({
      id: "challenge-geo-01-006", tier: "challenge", sourceFactIds: ["geo-01-f03"], retrievalDirection: "map-to-name",
      examSkill: "世界地図の海洋読取", mistakeTags: ["海洋の位置", "略地図読取"], paperRef: P2, formatTag: "地図読取", figure: ATLANTIC_MAP,
      prompt: "略地図のAに当てはまる海洋はどれですか。",
      choices: ["インド洋", "太平洋", "大西洋", "北極海"], answer: 2,
      explanation: "Aは南北アメリカとヨーロッパ・アフリカの間にあるので大西洋です。太平洋はアメリカの西側に広がります。"
    }),
    geoQuestion({
      id: "challenge-geo-01-007", tier: "challenge", sourceFactIds: ["geo-01-f05", "geo-01-f06"], retrievalDirection: "diagram-to-pair",
      examSkill: "緯線・経線の判断", mistakeTags: ["赤道", "本初子午線", "縦横混同"], paperRef: `${P2}／${P3}`, formatTag: "図解読取", figure: LAT_LONG_MAP,
      prompt: "模式図のAは緯度0度、Bは経度0度の線です。AとBの名前の組み合わせとして正しいものはどれですか。",
      choices: ["A：赤道　B：本初子午線", "A：本初子午線　B：赤道", "A：日付変更線　B：回帰線", "A：北極圏　B：南極圏"], answer: 0,
      explanation: "緯度0度の横方向の線Aが赤道、経度0度の南北方向の線Bが本初子午線です。"
    }),
    geoQuestion({
      id: "challenge-geo-01-008", tier: "challenge", sourceFactIds: ["geo-01-f09"], retrievalDirection: "map-point-to-region",
      examSkill: "世界の地域区分", mistakeTags: ["大陸と州", "日本の所属州"], paperRef: P3, formatTag: "地図読取", figure: ASIA_REGION_MAP,
      prompt: "略地図で日本が含まれる州はどれですか。",
      choices: ["オセアニア州", "アジア州", "ヨーロッパ州", "北アメリカ州"], answer: 1,
      explanation: "日本は世界の6州区分ではアジア州に含まれます。大陸名と地域区分の州名を分けて考えます。"
    }),
    geoQuestion({
      id: "challenge-geo-01-009", tier: "challenge", sourceFactIds: ["geo-01-f07", "geo-01-f08"], retrievalDirection: "purpose-to-map-property",
      examSkill: "地図の目的別利用", mistakeTags: ["地図のゆがみ", "資料選択"], paperRef: P2, formatTag: "比較・理由",
      prompt: "国ごとの面積を地図上で比較するとき、最も重視すべき特徴はどれですか。",
      choices: ["どの地点でも方位が完全に正しい", "緯線と経線が必ず直角に交わる", "中心からの距離だけが正しい", "面積の比が正しく表されている"], answer: 3,
      explanation: "面積を比べる目的なら、面積の比が正しい地図を選びます。地図は目的によってゆがみ方が異なります。"
    }),
    geoQuestion({
      id: "challenge-geo-01-010", tier: "challenge", sourceFactIds: ["geo-01-f13"], retrievalDirection: "appearance-to-cause",
      examSkill: "国境の成り立ち", mistakeTags: ["自然国境", "直線国境"], paperRef: P3, formatTag: "原因・理由",
      prompt: "地図上で国境が長い直線になっている場合、その線を定めるのに利用された可能性が高いものはどれですか。",
      choices: ["川の流路", "山脈の尾根", "緯線や経線", "海岸線"], answer: 2,
      explanation: "緯線や経線を利用すると、地図上で直線状の国境になります。川や山脈を利用する国境は自然の形に沿います。"
    }),
    geoQuestion({
      id: "challenge-geo-01-011", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-01-f05"], retrievalDirection: "direct-definition-to-term",
      examSkill: "基準緯線の再生", mistakeTags: ["赤道", "用語再生"], paperRef: `${P2}／${P3}`, formatTag: "直接入力",
      prompt: "地球を南北に分ける基準となる、緯度0度の緯線を何といいますか。", answerText: ["赤道"], placeholder: "用語を入力",
      explanation: "緯度0度の緯線は赤道です。この線から北側を北緯、南側を南緯で表し、それぞれ90度まで数えます。"
    }),
    geoQuestion({
      id: "challenge-geo-01-012", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-01-f06"], retrievalDirection: "direct-definition-to-term",
      examSkill: "基準経線の再生", mistakeTags: ["本初子午線", "用語再生"], paperRef: `${P2}／${P3}`, formatTag: "直接入力",
      prompt: "イギリスのロンドンを通る、経度0度の経線を何といいますか。", answerText: ["本初子午線", "グリニッジ子午線"], placeholder: "用語を入力",
      explanation: "経度0度の経線は本初子午線です。グリニッジ子午線とも呼ばれ、ここから東側を東経、西側を西経で表します。"
    }),
    geoQuestion({
      id: "challenge-geo-01-013", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-01-f14"], retrievalDirection: "direct-definition-to-term",
      examSkill: "国の立地分類", mistakeTags: ["島国内陸国", "定義混同"], paperRef: P3, formatTag: "直接入力",
      prompt: "国土が海洋に面していない国を何といいますか。", answerText: ["内陸国"], placeholder: "用語を入力",
      explanation: "国土が海洋に面していない国は内陸国です。モンゴルやスイスなどが例です。"
    }),
    geoQuestion({
      id: "challenge-geo-01-014", tier: "final", type: "input", answerTarget: "region", sourceFactIds: ["geo-01-f10"], retrievalDirection: "direct-country-to-region",
      examSkill: "アジアの地域区分", mistakeTags: ["アジア5地域", "日本の地域"], paperRef: P3, formatTag: "直接入力",
      prompt: "アジア州の5地域区分で、日本が含まれる地域を答えてください。", answerText: ["東アジア"], placeholder: "地域名を入力",
      explanation: "日本は東アジアに含まれます。アジア州は東・東南・南・中央・西アジアの5地域に区分されます。"
    }),
    geoQuestion({
      id: "challenge-geo-01-015", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-01-f03"], retrievalDirection: "direct-set-to-term",
      examSkill: "三大洋の再生", mistakeTags: ["三大洋", "用語再生"], paperRef: P2, formatTag: "直接入力",
      prompt: "太平洋・大西洋・インド洋の3つをまとめて何といいますか。", answerText: ["三大洋", "3大洋"], placeholder: "用語を入力",
      explanation: "太平洋・大西洋・インド洋は三大洋と呼ばれます。名前だけでなく、世界地図上の位置も一緒に思い出しましょう。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
