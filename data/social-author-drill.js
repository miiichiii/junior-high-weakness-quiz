(function () {
  "use strict";

  const PACK_ID = "social-author-drill";
  const SOURCE_TAG = "social-author-drill-original-jhs";
  const MEIJI_WORK_REF = "社会ワーク pp.52-53・56（明治の文化）";
  const YOSANO_REF = "社会ワーク p.50（日露戦争と与謝野晶子）";
  const TAISHO_WORK_REF = "社会ワーク pp.62-64（大正の文化）";
  const MEIJI_EXTENSION_REF = null;
  const TAISHO_EXTENSION_REF = null;
  const SHOWA_EXTENSION_REF = null;
  const L1 = "L1 基礎復帰";
  const L2 = "L2 県立標準";
  const L3 = "L3 県立本番";

  function authorQuestion(question) {
    const tierDefaults = {
      core: { priority: "S", difficulty: L1, stage: "作品と作家を結ぶ" },
      challenge: { priority: "A", difficulty: L2, stage: "時代・特色まで理解する" },
      final: { priority: "A", difficulty: L3, stage: "作家名を自力で書く" }
    };
    const defaults = tierDefaults[question.tier];
    if (!defaults) throw new Error(`Unknown social-author tier: ${question.tier}`);
    return {
      type: "choice",
      childIds: ["child-1"],
      packId: PACK_ID,
      contentVersion: 2,
      cornerId: question.cornerId || "modern-core",
      sourceTag: SOURCE_TAG,
      qualityStatus: "content-audited-v2",
      contentStatus: "content-final",
      subject: "社会",
      unit: "明治から昭和初期の文化（文学者）",
      formatTag: "作家名特訓",
      ...defaults,
      ...question,
      stage: defaults.stage,
      variantGroup: question.variantGroup || `social-author-${question.authorKey}`
    };
  }

  const core = [
    authorQuestion({
      id: "social-author-v2-001", tier: "core", authorKey: "tsubouchi-shoyo", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "明治文学"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["坪内逍遥", "小説神髄", "近代文学"],
      prompt: "近代文学の理論書『小説神髄』を著した人物は誰ですか。",
      choices: ["二葉亭四迷", "坪内逍遥", "石川啄木", "小林多喜二"], answer: 1,
      explanation: "『小説神髄』を著したのは坪内逍遥です。明治期に近代文学の理論を示しました。"
    }),
    authorQuestion({
      id: "social-author-v2-002", tier: "core", authorKey: "futabatei-shimei", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "言文一致"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["二葉亭四迷", "浮雲", "言文一致体"],
      prompt: "言文一致体で書かれた小説『浮雲』の作者は誰ですか。",
      choices: ["坪内逍遥", "夏目漱石", "二葉亭四迷", "志賀直哉"], answer: 2,
      explanation: "『浮雲』の作者は二葉亭四迷です。話し言葉に近い言文一致体で書かれた近代小説です。"
    }),
    authorQuestion({
      id: "social-author-v2-003", tier: "core", authorKey: "higuchi-ichiyo", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "作品対応"],
      paperRef: MEIJI_WORK_REF, skills: ["樋口一葉", "たけくらべ", "明治文学"],
      prompt: "小説『たけくらべ』の作者は誰ですか。",
      choices: ["樋口一葉", "与謝野晶子", "森鷗外", "石川啄木"], answer: 0,
      explanation: "『たけくらべ』の作者は樋口一葉です。明治期に活躍した女性文学者です。"
    }),
    authorQuestion({
      id: "social-author-v2-004", tier: "core", authorKey: "mori-ogai", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "漢字表記"],
      paperRef: MEIJI_WORK_REF, skills: ["森鷗外", "舞姫", "明治文学"],
      prompt: "小説『舞姫』の作者は誰ですか。",
      choices: ["夏目漱石", "森鷗外", "芥川龍之介", "小林多喜二"], answer: 1,
      explanation: "『舞姫』の作者は森鷗外です。名前の「鷗」は「鴎」と書かれることもあります。"
    }),
    authorQuestion({
      id: "social-author-v2-005", tier: "core", authorKey: "natsume-soseki", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "作品対応"],
      paperRef: MEIJI_WORK_REF, skills: ["夏目漱石", "坊っちゃん", "明治文学"],
      prompt: "小説『坊っちゃん』の作者は誰ですか。",
      choices: ["森鷗外", "志賀直哉", "夏目漱石", "二葉亭四迷"], answer: 2,
      explanation: "『坊っちゃん』の作者は夏目漱石です。明治期を代表する小説家の一人です。"
    }),
    authorQuestion({
      id: "social-author-v2-006", tier: "core", authorKey: "yosano-akiko", retrievalDirection: "context-to-author",
      examSkill: "歴史背景から人物を選ぶ", mistakeTags: ["作者名", "日露戦争"],
      paperRef: YOSANO_REF, skills: ["与謝野晶子", "日露戦争", "旅順"],
      prompt: "日露戦争中、旅順へ出兵した弟を案じる詩を発表した歌人は誰ですか。",
      choices: ["樋口一葉", "与謝野晶子", "石川啄木", "小林多喜二"], answer: 1,
      explanation: "この詩を発表したのは与謝野晶子です。日露戦争で旅順へ出兵した弟への思いを表しました。"
    }),
    authorQuestion({
      id: "social-author-v2-007", tier: "core", authorKey: "ishikawa-takuboku", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "短歌"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["石川啄木", "一握の砂", "短歌集"],
      prompt: "短歌集『一握の砂』の作者は誰ですか。",
      choices: ["与謝野晶子", "芥川龍之介", "石川啄木", "志賀直哉"], answer: 2,
      explanation: "『一握の砂』の作者は石川啄木です。生活や心情を詠んだ短歌で知られます。"
    }),
    authorQuestion({
      id: "social-author-v2-008", tier: "core", authorKey: "shiga-naoya", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "白樺派"],
      paperRef: TAISHO_EXTENSION_REF, skills: ["志賀直哉", "暗夜行路", "白樺派"],
      prompt: "長編小説『暗夜行路』の作者は誰ですか。",
      choices: ["芥川龍之介", "志賀直哉", "小林多喜二", "夏目漱石"], answer: 1,
      explanation: "『暗夜行路』の作者は志賀直哉です。志賀直哉は白樺派の作家として知られます。"
    }),
    authorQuestion({
      id: "social-author-v2-009", tier: "core", authorKey: "akutagawa-ryunosuke", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "大正文学"],
      paperRef: TAISHO_WORK_REF, skills: ["芥川龍之介", "羅生門", "大正文化"],
      prompt: "短編小説『羅生門』の作者は誰ですか。",
      choices: ["森鷗外", "夏目漱石", "芥川龍之介", "志賀直哉"], answer: 2,
      explanation: "『羅生門』の作者は芥川龍之介です。古典を題材にした大正期の短編小説です。"
    }),
    authorQuestion({
      id: "social-author-v2-010", tier: "core", authorKey: "kobayashi-takiji", retrievalDirection: "work-to-author",
      examSkill: "作品から作者を選ぶ", mistakeTags: ["作者名", "昭和初期"],
      paperRef: SHOWA_EXTENSION_REF, skills: ["小林多喜二", "蟹工船", "プロレタリア文学"],
      prompt: "プロレタリア文学の小説『蟹工船』の作者は誰ですか。",
      choices: ["小林多喜二", "二葉亭四迷", "石川啄木", "坪内逍遥"], answer: 0,
      explanation: "『蟹工船』の作者は小林多喜二です。昭和初期のプロレタリア文学を代表する作品です。"
    })
  ];

  const challenge = [
    authorQuestion({
      id: "social-author-v2-011", tier: "challenge", authorKey: "tsubouchi-shoyo", retrievalDirection: "author-to-context",
      examSkill: "人物・著作・時代を関連づける", mistakeTags: ["作者名", "明治文学"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["坪内逍遥", "小説神髄", "近代文学"],
      prompt: "坪内逍遥について正しく述べた文はどれですか。",
      choices: ["明治期に『小説神髄』を著し、近代文学の理論を示した", "明治期に『浮雲』を書き、言文一致体を用いた", "大正期に『羅生門』を書き、短編小説で知られた", "昭和初期に『蟹工船』を書き、労働者の生活を描いた"], answer: 0,
      explanation: "坪内逍遥は明治期に『小説神髄』を著し、近代文学の理論を示しました。他の三つは二葉亭四迷、芥川龍之介、小林多喜二の説明です。"
    }),
    authorQuestion({
      id: "social-author-v2-012", tier: "challenge", authorKey: "futabatei-shimei", retrievalDirection: "author-work-to-feature",
      examSkill: "作品と文章表現を関連づける", mistakeTags: ["言文一致", "文学の特色"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["二葉亭四迷", "浮雲", "言文一致体"],
      prompt: "二葉亭四迷の『浮雲』に用いられ、近代小説の発展につながった文章表現は何ですか。",
      choices: ["漢文訓読体", "和漢混交文", "言文一致体", "擬古文体"], answer: 2,
      explanation: "正しいのは言文一致体です。二葉亭四迷の『浮雲』は、話し言葉に近い文章表現で書かれました。"
    }),
    authorQuestion({
      id: "social-author-v2-013", tier: "challenge", authorKey: "higuchi-ichiyo", retrievalDirection: "author-to-context",
      examSkill: "人物・作品・時代を関連づける", mistakeTags: ["明治文学", "人物説明"],
      paperRef: MEIJI_WORK_REF, skills: ["樋口一葉", "たけくらべ", "明治文学"],
      prompt: "樋口一葉について正しく述べた文はどれですか。",
      choices: ["白樺派に属し、『暗夜行路』を書いた", "プロレタリア文学の『蟹工船』を書いた", "明治期に活躍し、『たけくらべ』を書いた", "大正期に『羅生門』を書いた"], answer: 2,
      explanation: "樋口一葉は明治期に活躍し、『たけくらべ』を書きました。他の三つは、それぞれ志賀直哉、小林多喜二、芥川龍之介の説明です。"
    }),
    authorQuestion({
      id: "social-author-v2-014", tier: "challenge", authorKey: "mori-ogai", retrievalDirection: "work-to-period",
      examSkill: "作品が発表された時代を選ぶ", mistakeTags: ["明治文学", "時代区分"],
      paperRef: MEIJI_WORK_REF, skills: ["森鷗外", "舞姫", "明治"],
      prompt: "森鷗外の『舞姫』が発表された時代はどれですか。",
      choices: ["江戸時代", "明治時代", "大正時代", "昭和時代"], answer: 1,
      explanation: "『舞姫』は明治時代に発表されました。森鷗外は明治期の近代文学を代表する作家です。"
    }),
    authorQuestion({
      id: "social-author-v2-015", tier: "challenge", authorKey: "natsume-soseki", retrievalDirection: "author-to-work-comparison",
      examSkill: "二人の作者と作品を区別する", mistakeTags: ["人物作品", "明治文学"],
      paperRef: MEIJI_WORK_REF, skills: ["夏目漱石", "樋口一葉", "坊っちゃん", "たけくらべ"],
      prompt: "夏目漱石と樋口一葉の作品の組合せとして正しいものはどれですか。",
      choices: ["夏目漱石―『舞姫』／樋口一葉―『羅生門』", "夏目漱石―『坊っちゃん』／樋口一葉―『たけくらべ』", "夏目漱石―『浮雲』／樋口一葉―『一握の砂』", "夏目漱石―『蟹工船』／樋口一葉―『小説神髄』"], answer: 1,
      explanation: "夏目漱石は『坊っちゃん』、樋口一葉は『たけくらべ』です。どちらも明治期の文学者です。"
    }),
    authorQuestion({
      id: "social-author-v2-016", tier: "challenge", authorKey: "yosano-akiko", retrievalDirection: "author-to-context",
      examSkill: "人物と歴史背景を関連づける", mistakeTags: ["日露戦争", "人物説明"],
      paperRef: YOSANO_REF, skills: ["与謝野晶子", "日露戦争", "詩"],
      prompt: "与謝野晶子について正しく述べた文はどれですか。",
      choices: ["日露戦争中、出征した弟を案じる詩を発表した", "白樺派に属し、『暗夜行路』を書いた", "言文一致体の小説『浮雲』を書いた", "プロレタリア文学の小説『蟹工船』を書いた"], answer: 0,
      explanation: "与謝野晶子は、日露戦争に出征した弟を案じる詩を発表しました。他の三つは別の文学者の説明です。"
    }),
    authorQuestion({
      id: "social-author-v2-017", tier: "challenge", authorKey: "ishikawa-takuboku", retrievalDirection: "work-to-genre",
      examSkill: "作品の文学形式を選ぶ", mistakeTags: ["短歌", "文学形式"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["石川啄木", "一握の砂", "短歌集"],
      prompt: "石川啄木の『一握の砂』は、どの文学形式の作品ですか。",
      choices: ["長編小説", "文学評論", "短歌集", "戯曲"], answer: 2,
      explanation: "『一握の砂』は短歌集です。石川啄木は、日常生活や心情を詠んだ短歌で知られます。"
    }),
    authorQuestion({
      id: "social-author-v2-018", tier: "challenge", authorKey: "shiga-naoya", retrievalDirection: "movement-to-author",
      examSkill: "文学の流れから作家を選ぶ", mistakeTags: ["白樺派", "作者名"],
      paperRef: TAISHO_EXTENSION_REF, skills: ["志賀直哉", "白樺派", "大正期の文学"],
      prompt: "白樺派の作家として知られる人物は誰ですか。",
      choices: ["小林多喜二", "二葉亭四迷", "芥川龍之介", "志賀直哉"], answer: 3,
      explanation: "白樺派の作家として知られるのは志賀直哉です。代表作に『暗夜行路』があります。"
    }),
    authorQuestion({
      id: "social-author-v2-019", tier: "challenge", authorKey: "akutagawa-ryunosuke", retrievalDirection: "author-work-period",
      examSkill: "作者・作品・時代を関連づける", mistakeTags: ["大正文学", "三項対応"],
      paperRef: null, skills: ["芥川龍之介", "羅生門", "大正"],
      prompt: "作者・作品・発表された時代の組合せとして正しいものはどれですか。",
      choices: ["森鷗外―『舞姫』―大正時代", "芥川龍之介―『羅生門』―大正時代", "夏目漱石―『坊っちゃん』―昭和初期", "小林多喜二―『蟹工船』―明治時代"], answer: 1,
      explanation: "正しい組合せは、芥川龍之介―『羅生門』―大正時代です。『舞姫』と『坊っちゃん』は明治、『蟹工船』は昭和初期の作品です。"
    }),
    authorQuestion({
      id: "social-author-v2-020", tier: "challenge", authorKey: "kobayashi-takiji", retrievalDirection: "work-to-movement",
      examSkill: "作品と文学の流れを関連づける", mistakeTags: ["プロレタリア文学", "昭和初期"],
      paperRef: SHOWA_EXTENSION_REF, skills: ["小林多喜二", "蟹工船", "プロレタリア文学"],
      prompt: "小林多喜二の『蟹工船』と最も関係が深い文学の流れはどれですか。",
      choices: ["プロレタリア文学", "白樺派", "自然主義文学", "浪漫主義文学"], answer: 0,
      explanation: "『蟹工船』はプロレタリア文学の代表作です。労働者を取り巻く厳しい状況を描きました。"
    })
  ];

  const final = [
    authorQuestion({
      id: "social-author-v2-021", tier: "final", type: "input", answerTarget: "author", authorKey: "tsubouchi-shoyo", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["坪内逍遥", "小説神髄", "直接入力"],
      prompt: "『小説神髄』を著した人物名を漢字で答えなさい。",
      answerText: ["坪内逍遥", "坪内逍遙"], placeholder: "作家名を入力",
      explanation: "答えは坪内逍遥です。「逍遙」の表記も正解で、同じ人物を指します。"
    }),
    authorQuestion({
      id: "social-author-v2-022", tier: "final", type: "input", answerTarget: "author", authorKey: "futabatei-shimei", retrievalDirection: "direct-work-context-to-author",
      examSkill: "作品と特色から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "言文一致"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["二葉亭四迷", "浮雲", "言文一致体"],
      prompt: "言文一致体で書かれた小説『浮雲』の作者名を漢字で答えなさい。",
      answerText: ["二葉亭四迷"], placeholder: "作家名を入力",
      explanation: "答えは二葉亭四迷です。『浮雲』は近代小説の発展を示す作品です。"
    }),
    authorQuestion({
      id: "social-author-v2-023", tier: "final", type: "input", answerTarget: "author", authorKey: "higuchi-ichiyo", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      paperRef: MEIJI_WORK_REF, skills: ["樋口一葉", "たけくらべ", "直接入力"],
      prompt: "『たけくらべ』の作者名を漢字で答えなさい。",
      answerText: ["樋口一葉"], placeholder: "作家名を入力",
      explanation: "答えは樋口一葉です。『たけくらべ』は明治期の小説です。"
    }),
    authorQuestion({
      id: "social-author-v2-024", tier: "final", type: "input", answerTarget: "author", authorKey: "mori-ogai", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字表記"],
      paperRef: MEIJI_WORK_REF, skills: ["森鷗外", "舞姫", "直接入力"],
      prompt: "『舞姫』の作者名を漢字で答えなさい。",
      answerText: ["森鷗外", "森鴎外"], placeholder: "作家名を入力",
      explanation: "答えは森鷗外です。「森鴎外」と書いても正解です。"
    }),
    authorQuestion({
      id: "social-author-v2-025", tier: "final", type: "input", answerTarget: "author", authorKey: "natsume-soseki", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      paperRef: MEIJI_WORK_REF, skills: ["夏目漱石", "坊っちゃん", "直接入力"],
      prompt: "『坊っちゃん』の作者名を漢字で答えなさい。",
      answerText: ["夏目漱石"], placeholder: "作家名を入力",
      explanation: "答えは夏目漱石です。『坊っちゃん』は明治期の小説です。"
    }),
    authorQuestion({
      id: "social-author-v2-026", tier: "final", type: "input", answerTarget: "author", authorKey: "yosano-akiko", retrievalDirection: "direct-context-to-author",
      examSkill: "歴史背景から人物名を記述する", formatTag: "直接入力", mistakeTags: ["人物名", "日露戦争"],
      paperRef: YOSANO_REF, skills: ["与謝野晶子", "日露戦争", "旅順"],
      prompt: "日露戦争中、旅順へ出兵した弟を案じる詩を発表した歌人の名を漢字で答えなさい。",
      answerText: ["与謝野晶子"], placeholder: "人物名を入力",
      explanation: "答えは与謝野晶子です。この詩は日露戦争中に発表されました。"
    }),
    authorQuestion({
      id: "social-author-v2-027", tier: "final", type: "input", answerTarget: "author", authorKey: "ishikawa-takuboku", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "短歌"],
      paperRef: MEIJI_EXTENSION_REF, skills: ["石川啄木", "一握の砂", "短歌集"],
      prompt: "短歌集『一握の砂』の作者名を漢字で答えなさい。",
      answerText: ["石川啄木"], placeholder: "作家名を入力",
      explanation: "答えは石川啄木です。『一握の砂』は明治期に刊行された短歌集です。"
    }),
    authorQuestion({
      id: "social-author-v2-028", tier: "final", type: "input", answerTarget: "author", authorKey: "shiga-naoya", retrievalDirection: "direct-movement-work-to-author",
      examSkill: "文学の流れと作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "白樺派"],
      paperRef: TAISHO_EXTENSION_REF, skills: ["志賀直哉", "暗夜行路", "白樺派"],
      prompt: "白樺派に属し、『暗夜行路』を書いた作家名を漢字で答えなさい。",
      answerText: ["志賀直哉"], placeholder: "作家名を入力",
      explanation: "答えは志賀直哉です。白樺派を代表する作家の一人です。"
    }),
    authorQuestion({
      id: "social-author-v2-029", tier: "final", type: "input", answerTarget: "author", authorKey: "akutagawa-ryunosuke", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "大正文学"],
      paperRef: TAISHO_WORK_REF, skills: ["芥川龍之介", "羅生門", "直接入力"],
      prompt: "『羅生門』の作者名を漢字で答えなさい。",
      answerText: ["芥川龍之介", "芥川竜之介"], placeholder: "作家名を入力",
      explanation: "答えは芥川龍之介です。『羅生門』は大正期の短編小説です。"
    }),
    authorQuestion({
      id: "social-author-v2-030", tier: "final", type: "input", answerTarget: "author", authorKey: "kobayashi-takiji", retrievalDirection: "direct-movement-work-to-author",
      examSkill: "文学の流れと作品から作者名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "プロレタリア文学"],
      paperRef: SHOWA_EXTENSION_REF, skills: ["小林多喜二", "蟹工船", "プロレタリア文学"],
      prompt: "プロレタリア文学の小説『蟹工船』を書いた作家名を漢字で答えなさい。",
      answerText: ["小林多喜二"], placeholder: "作家名を入力",
      explanation: "答えは小林多喜二です。『蟹工船』は昭和初期に発表されました。"
    })
  ];

  const questions = [...core, ...challenge, ...final];

  function assertCount(label, rows, expected) {
    if (rows.length !== expected) throw new Error(`${PACK_ID} ${label}: expected ${expected}, got ${rows.length}`);
  }

  assertCount("core", core, 10);
  assertCount("challenge", challenge, 10);
  assertCount("final", final, 10);
  assertCount("total", questions, 30);

  window.QUIZ_QUESTIONS = (window.QUIZ_QUESTIONS || []).concat(questions);
})();
