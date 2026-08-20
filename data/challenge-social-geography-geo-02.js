(function () {
  "use strict";

  const PACK_ID = "challenge-social-geography";
  const UNIT_ID = "geo-02";
  const UNIT = "日本の地域構成";
  const SOURCE_TAG = "challenge-social-geography-original";
  const P4 = "Challenge社会「5科のポイントチェック」p.4";
  const P5 = "Challenge社会「5科のポイントチェック」p.5";

  const JAPAN_EXTREMES_MAP = {
    kind: "map",
    width: 360,
    height: 210,
    alt: "日本列島の位置を簡略化し、東西南北の端を4つの点で示した経緯度模式図。最も東の点をAと表示",
    caption: "日本の広がりと東西南北の端の位置関係を表したオリジナル模式図",
    gridLines: [
      { points: [[45, 36], [330, 36]] },
      { points: [[45, 90], [330, 90]] },
      { points: [[45, 144], [330, 144]] },
      { points: [[45, 188], [330, 188]] },
      { points: [[60, 22], [60, 190]] },
      { points: [[140, 22], [140, 190]] },
      { points: [[220, 22], [220, 190]] },
      { points: [[310, 22], [310, 190]] }
    ],
    regions: [
      { label: "日本列島", tone: 3, points: [[176, 48], [191, 57], [186, 72], [204, 85], [197, 99], [214, 112], [205, 127], [189, 118], [181, 102], [168, 91], [171, 73]] },
      { label: "南西諸島", tone: 3, points: [[159, 127], [168, 134], [154, 145], [141, 153], [126, 163], [116, 174], [103, 181], [98, 173], [110, 164], [123, 154], [137, 145], [149, 136]] }
    ],
    points: [
      { x: 310, y: 96, r: 5 },
      { x: 60, y: 168, r: 5 },
      { x: 206, y: 188, r: 5 },
      { x: 183, y: 36, r: 5 }
    ],
    labels: [
      { x: 320, y: 89, text: "A", emphasis: true },
      { x: 60, y: 202, text: "東経122°" },
      { x: 305, y: 202, text: "東経154°" },
      { x: 25, y: 42, text: "北緯46°", anchor: "start" },
      { x: 25, y: 188, text: "北緯20°", anchor: "start" }
    ]
  };

  const MARITIME_ZONE_MAP = {
    kind: "map",
    width: 360,
    height: 210,
    alt: "海岸から沖合へ領土、領海、Aの順に広がる海域を示した模式図。領海は12海里、Aの外縁は200海里",
    caption: "領土・領海・経済水域の広がりを表したオリジナル模式図",
    regions: [
      { label: "Aの海域", tone: 5, points: [[118, 35], [330, 35], [330, 170], [118, 170]] },
      { label: "領海", tone: 3, highlight: true, points: [[76, 35], [118, 35], [118, 170], [76, 170]] },
      { label: "領土", tone: 1, points: [[18, 35], [76, 35], [76, 170], [18, 170]] }
    ],
    gridLines: [
      { points: [[76, 28], [76, 178]], emphasis: true },
      { points: [[118, 28], [118, 178]], dashed: true },
      { points: [[330, 28], [330, 178]], dashed: true }
    ],
    labels: [
      { x: 47, y: 102, text: "領土" },
      { x: 97, y: 102, text: "領海" },
      { x: 224, y: 102, text: "A", emphasis: true },
      { x: 97, y: 194, text: "12海里" },
      { x: 224, y: 194, text: "沿岸から200海里" }
    ]
  };

  const JAPAN_REGION_MAP = {
    kind: "map",
    width: 360,
    height: 210,
    alt: "日本の7地方を北東から南西へ並べた模式図。関東と近畿の間にある地方をAと表示",
    caption: "位置関係だけを抽象化した日本7地方のオリジナル模式図",
    regions: [
      { label: "北海道地方", tone: 1, points: [[290, 20], [336, 20], [336, 50], [290, 50]] },
      { label: "東北地方", tone: 2, points: [[268, 55], [320, 55], [320, 82], [268, 82]] },
      { label: "関東地方", tone: 6, points: [[250, 87], [304, 87], [304, 115], [250, 115]] },
      { label: "中部地方", tone: 3, highlight: true, points: [[190, 91], [244, 91], [244, 121], [190, 121]] },
      { label: "近畿地方", tone: 4, points: [[153, 118], [202, 118], [202, 145], [153, 145]] },
      { label: "中国・四国地方", tone: 5, points: [[79, 128], [148, 128], [148, 158], [79, 158]] },
      { label: "九州地方", tone: 2, points: [[25, 151], [73, 151], [73, 184], [25, 184]] }
    ],
    labels: [
      { x: 313, y: 40, text: "北海道" },
      { x: 294, y: 75, text: "東北" },
      { x: 277, y: 106, text: "関東" },
      { x: 217, y: 112, text: "A", emphasis: true },
      { x: 177, y: 138, text: "近畿" },
      { x: 113, y: 149, text: "中国・四国" },
      { x: 49, y: 174, text: "九州" }
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
      id: "challenge-geo-02-001", tier: "core", sourceFactIds: ["geo-02-f01"], retrievalDirection: "description-to-position",
      examSkill: "日本の位置", mistakeTags: ["東アジア", "位置関係"], paperRef: P4,
      prompt: "日本の位置について述べた文として、最も適切なものはどれですか。",
      choices: ["ヨーロッパ西部の内陸国である", "東アジアに属し、中国・韓国の東にある島国である", "南アメリカ州の太平洋岸にある", "オセアニア州の大陸国である"], answer: 1,
      explanation: "日本は東アジアに属する島国で、ユーラシア大陸上の中国・韓国より東側に位置します。"
    }),
    geoQuestion({
      id: "challenge-geo-02-002", tier: "core", sourceFactIds: ["geo-02-f04"], retrievalDirection: "set-recognition",
      examSkill: "日本の主な島", mistakeTags: ["四大島", "島名混同"], paperRef: P4,
      prompt: "日本を構成する4つの大きな島の組み合わせとして正しいものはどれですか。",
      choices: ["北海道・本州・四国・九州", "本州・四国・九州・沖縄島", "北海道・本州・佐渡島・九州", "北海道・本州・淡路島・四国"], answer: 0,
      explanation: "4つの大きな島は北海道・本州・四国・九州です。これらに多数の島を合わせて日本の国土を構成します。"
    }),
    geoQuestion({
      id: "challenge-geo-02-003", tier: "core", sourceFactIds: ["geo-02-f02"], retrievalDirection: "range-recognition",
      examSkill: "日本の経緯度", mistakeTags: ["緯度経度", "東西南北"], paperRef: P4,
      prompt: "日本のおよその経緯度の範囲として正しいものはどれですか。",
      choices: ["西経122〜154度・北緯20〜46度", "東経20〜46度・北緯122〜154度", "東経122〜154度・北緯20〜46度", "東経122〜154度・南緯20〜46度"], answer: 2,
      explanation: "日本はおよそ東経122〜154度、北緯20〜46度の範囲です。経度が東西、緯度が南北の位置を表します。"
    }),
    geoQuestion({
      id: "challenge-geo-02-004", tier: "core", sourceFactIds: ["geo-02-f08"], retrievalDirection: "country-to-meridian",
      examSkill: "日本標準時", mistakeTags: ["標準時子午線", "経度暗記"], paperRef: P4,
      prompt: "日本が標準時子午線としている経線はどれですか。",
      choices: ["東経120度", "東経150度", "西経135度", "東経135度"], answer: 3,
      explanation: "日本の標準時子午線は東経135度です。兵庫県明石市付近を通る経線としても覚えます。"
    }),
    geoQuestion({
      id: "challenge-geo-02-005", tier: "core", sourceFactIds: ["geo-02-f11"], retrievalDirection: "composition-to-total",
      examSkill: "都道府県の構成", mistakeTags: ["都道府県数", "1都1道2府"], paperRef: P5,
      prompt: "日本の都道府県の構成として正しいものはどれですか。",
      choices: ["1都・2道・2府・42県", "1都・1道・2府・43県", "2都・1道・2府・42県", "1都・1道・1府・44県"], answer: 1,
      explanation: "日本は1都・1道・2府・43県、合計47都道府県からなります。2府は大阪府と京都府です。"
    }),
    geoQuestion({
      id: "challenge-geo-02-006", tier: "challenge", sourceFactIds: ["geo-02-f02", "geo-02-f03"], retrievalDirection: "map-point-to-place",
      examSkill: "日本の端の読取", mistakeTags: ["東西南北端", "南鳥島"], paperRef: P4, formatTag: "地図読取", figure: JAPAN_EXTREMES_MAP,
      prompt: "模式図のAは、日本の領域で最も東に位置する地点です。Aに当てはまる島はどれですか。",
      choices: ["沖ノ鳥島", "与那国島", "南鳥島", "択捉島"], answer: 2,
      explanation: "日本の東端は南鳥島です。西端は与那国島、南端は沖ノ鳥島、北端は択捉島です。"
    }),
    geoQuestion({
      id: "challenge-geo-02-007", tier: "challenge", sourceFactIds: ["geo-02-f05", "geo-02-f06", "geo-02-f10"], retrievalDirection: "diagram-to-zone",
      examSkill: "海域の区分", mistakeTags: ["領海と経済水域", "海里"], paperRef: `${P4}／${P5}`, formatTag: "図解読取", figure: MARITIME_ZONE_MAP,
      prompt: "模式図のAは、領海の外側で沿岸から200海里まで広がる水域です。Aは何ですか。",
      choices: ["経済水域", "公海", "領空", "領土"], answer: 0,
      explanation: "領海の外側で沿岸から200海里までの水域が経済水域です。沿岸国は水産・鉱産資源を管理できます。"
    }),
    geoQuestion({
      id: "challenge-geo-02-008", tier: "challenge", sourceFactIds: ["geo-02-f14"], retrievalDirection: "schematic-position-to-region",
      examSkill: "日本の地方区分", mistakeTags: ["7地方", "中部地方"], paperRef: P5, formatTag: "地図読取", figure: JAPAN_REGION_MAP,
      prompt: "模式図で、関東地方と近畿地方の間にあるAの地方はどれですか。",
      choices: ["東北地方", "九州地方", "中国・四国地方", "中部地方"], answer: 3,
      explanation: "関東地方の西、近畿地方の東に位置するのは中部地方です。日本の代表的な地方区分は7地方です。"
    }),
    geoQuestion({
      id: "challenge-geo-02-009", tier: "challenge", sourceFactIds: ["geo-02-f09"], retrievalDirection: "travel-direction-to-date-change",
      examSkill: "日付変更線", mistakeTags: ["日付変更", "東西方向"], paperRef: P4, formatTag: "判断",
      prompt: "日付変更線を東側から西側へ越えるとき、日付はどのように直しますか。",
      choices: ["1日遅らせる", "1日早める", "12時間早める", "変更しない"], answer: 1,
      explanation: "日付変更線を東から西へ越える場合は日付を1日早めます。反対に西から東へ越える場合は1日遅らせます。"
    }),
    geoQuestion({
      id: "challenge-geo-02-010", tier: "challenge", sourceFactIds: ["geo-02-f12", "geo-02-f13"], retrievalDirection: "comparison-to-prefecture",
      examSkill: "都道府県の比較", mistakeTags: ["面積順位", "県境"], paperRef: P5, formatTag: "比較・判断",
      prompt: "都道府県についての組み合わせとして正しいものはどれですか。",
      choices: ["面積最大：東京都／県境が最多：北海道", "面積最小：鳥取県／県境が最多：岐阜県", "面積最大：北海道／県境が最多：長野県", "面積最小：大阪府／県境が最多：埼玉県"], answer: 2,
      explanation: "面積が最大の都道府県は北海道で、最も多くの県と県境を接する県は長野県です。面積最小は香川県です。"
    }),
    geoQuestion({
      id: "challenge-geo-02-011", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-02-f10"], retrievalDirection: "direct-definition-to-term",
      examSkill: "領海の再生", mistakeTags: ["領海", "12海里"], paperRef: `${P4}／${P5}`, formatTag: "直接入力",
      prompt: "沿岸から12海里以内で、国の主権がおよぶ海域を何といいますか。", answerText: ["領海"], placeholder: "用語を入力",
      explanation: "沿岸から12海里以内で国の主権がおよぶ海域は領海です。領土と領海の上空が領空です。"
    }),
    geoQuestion({
      id: "challenge-geo-02-012", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-02-f06"], retrievalDirection: "direct-definition-to-term",
      examSkill: "経済水域の再生", mistakeTags: ["経済水域", "200海里"], paperRef: `${P4}／${P5}`, formatTag: "直接入力",
      prompt: "領海の外側で沿岸から200海里までの、水産・鉱産資源を沿岸国が管理できる水域を何といいますか。", answerText: ["経済水域", "排他的経済水域", "EEZ"], placeholder: "用語を入力",
      explanation: "この水域は経済水域です。領海とは異なり、外国船の航行や航空機の飛行などは自由です。"
    }),
    geoQuestion({
      id: "challenge-geo-02-013", tier: "final", type: "input", answerTarget: "term", sourceFactIds: ["geo-02-f07"], retrievalDirection: "direct-island-set-to-term",
      examSkill: "北方領土の再生", mistakeTags: ["北方領土", "島名"], paperRef: `${P4}／${P5}`, formatTag: "直接入力",
      prompt: "択捉島・国後島・色丹島・歯舞群島をまとめて何といいますか。", answerText: ["北方領土"], placeholder: "用語を入力",
      explanation: "択捉島・国後島・色丹島・歯舞群島の4つは北方領土です。現在はロシア連邦が占拠しています。"
    }),
    geoQuestion({
      id: "challenge-geo-02-014", tier: "final", type: "input", answerTarget: "coordinate", sourceFactIds: ["geo-02-f08"], retrievalDirection: "direct-country-to-meridian",
      examSkill: "標準時子午線の再生", mistakeTags: ["東経135度", "標準時"], paperRef: P4, formatTag: "直接入力",
      prompt: "日本の標準時子午線の経度を、東経・西経を付けて答えてください。", answerText: ["東経135度", "東経135°", "135度東経"], placeholder: "例：東経○度",
      explanation: "日本の標準時子午線は東経135度です。経度15度の差で1時間の時差が生じます。"
    }),
    geoQuestion({
      id: "challenge-geo-02-015", tier: "final", type: "input", answerTarget: "prefecture", sourceFactIds: ["geo-02-f13"], retrievalDirection: "direct-property-to-prefecture",
      examSkill: "県境最多県の再生", mistakeTags: ["長野県", "県境"], paperRef: P5, formatTag: "直接入力",
      prompt: "日本で最も多くの県と県境を接している県を答えてください。", answerText: ["長野県", "長野"], placeholder: "県名を入力",
      explanation: "最も多くの県と県境を接する県は長野県です。長野県は海に面しない内陸県でもあります。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
