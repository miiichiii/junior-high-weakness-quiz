(function () {
  "use strict";

  const PACK_ID = "social-author-drill";
  const SOURCE_TAG = "social-author-drill-original-jhs";
  const L1 = "L1 基礎復帰";
  const L2 = "L2 県立標準";
  const L3 = "L3 県立本番";

  function ndlSearch(label, keyword) {
    return {
      label: `国立国会図書館サーチ「${label}」`,
      url: `https://ndlsearch.ndl.go.jp/search?cs=bib&keyword=${encodeURIComponent(keyword)}`
    };
  }

  const OFFICIAL_SOURCES = {
    "ki-no-tsurayuki": ndlSearch("紀貫之・土佐日記", "紀貫之 土佐日記 古今和歌集"),
    "murasaki-shikibu": ndlSearch("紫式部・源氏物語", "紫式部 源氏物語"),
    "sei-shonagon": ndlSearch("清少納言・枕草子", "清少納言 枕草子"),
    "kamo-no-chomei": ndlSearch("鴨長明・方丈記", "鴨長明 方丈記"),
    "yoshida-kenko": ndlSearch("兼好法師・徒然草", "兼好法師 徒然草"),
    zeami: {
      label: "文化デジタルライブラリー「世阿弥の業績」",
      url: "https://www2.ntj.jac.go.jp/dglib/contents/learn/edc9/zeami/gyouseki/index.html"
    },
    "ihara-saikaku": ndlSearch("井原西鶴・日本永代蔵", "井原西鶴 日本永代蔵 浮世草子"),
    "matsuo-basho": ndlSearch("松尾芭蕉・おくのほそ道", "松尾芭蕉 おくのほそ道"),
    "chikamatsu-monzaemon": ndlSearch("近松門左衛門・曽根崎心中", "近松門左衛門 曽根崎心中 人形浄瑠璃"),
    "motoori-norinaga": ndlSearch("本居宣長・古事記伝", "本居宣長 古事記伝 国学"),
    "sugita-genpaku": {
      label: "国立国会図書館「解体新書」",
      url: "https://www.ndl.go.jp/nichiran/data/R/042/042-002r.html"
    },
    "jippensha-ikku": {
      label: "国立国会図書館サーチ「十返舎一九」",
      url: "https://ndlsearch.ndl.go.jp/en/books/R100000039-I1223300"
    },
    "kyokutei-bakin": {
      label: "国立国会図書館サーチ「曲亭馬琴」",
      url: "https://ndlsearch.ndl.go.jp/books/R100000002-I000004355291"
    },
    "fukuzawa-yukichi": {
      label: "国立国会図書館「福沢諭吉」",
      url: "https://www.ndl.go.jp/portrait/datas/185/index.html"
    },
    "nakae-chomin": {
      label: "国立国会図書館「中江兆民」",
      url: "https://www.ndl.go.jp/portrait/datas/302"
    },
    "masaoka-shiki": {
      label: "国立国会図書館「正岡子規」",
      url: "https://www.ndl.go.jp/portrait/datas/329/index.html"
    },
    "shimazaki-toson": {
      label: "国立国会図書館「島崎藤村」",
      url: "https://www.ndl.go.jp/portrait/datas/276"
    },
    "tayama-katai": {
      label: "国立国会図書館「田山花袋」",
      url: "https://www.ndl.go.jp/portrait/datas/6059"
    },
    "mushanokoji-saneatsu": {
      label: "国立国会図書館「武者小路実篤」",
      url: "https://www.ndl.go.jp/portrait/datas/340/"
    },
    "arishima-takeo": {
      label: "国立国会図書館「有島武郎」",
      url: "https://www.ndl.go.jp/portrait/datas/228"
    },
    "yanagita-kunio": {
      label: "国立国会図書館「柳田国男」",
      url: "https://www.ndl.go.jp/portrait/datas/6076/index.html"
    },
    "nishida-kitaro": {
      label: "国立国会図書館「西田幾多郎」",
      url: "https://www.ndl.go.jp/portrait/datas/6069"
    },
    "kawabata-yasunari": {
      label: "国立国会図書館「川端康成」",
      url: "https://www.ndl.go.jp/portrait/datas/6086/index.html"
    },
    "natsume-soseki": ndlSearch("夏目漱石・坊っちゃん", "夏目漱石 坊っちゃん"),
    "yosano-akiko": ndlSearch("与謝野晶子", "与謝野晶子 日露戦争"),
    "kobayashi-takiji": ndlSearch("小林多喜二・蟹工船", "小林多喜二 蟹工船"),
    "akutagawa-ryunosuke": ndlSearch("芥川龍之介・羅生門", "芥川龍之介 羅生門")
  };

  const tierDefaults = {
    core: { priority: "S", difficulty: L1, stage: "代表作と人物を結ぶ" },
    challenge: { priority: "A", difficulty: L2, stage: "時代・文化・特色まで関連づける" },
    final: { priority: "A", difficulty: L3, stage: "全時代を横断して判断する" }
  };

  function authorQuestion(question) {
    const { sourceKeys, ...fields } = question;
    const defaults = tierDefaults[fields.tier];
    if (!defaults) throw new Error(`Unknown social-author tier: ${fields.tier}`);
    const sources = (sourceKeys || [fields.authorKey]).map((key) => {
      const source = OFFICIAL_SOURCES[key];
      if (!source) throw new Error(`Unknown official source: ${key}`);
      return source;
    });
    return {
      type: "choice",
      childIds: ["child-1"],
      packId: PACK_ID,
      contentVersion: 2,
      sourceTag: SOURCE_TAG,
      qualityStatus: "content-audited-v2",
      contentStatus: "content-final",
      subject: "社会",
      unit: "古代から昭和の文化（作家・歌人・文化人）",
      formatTag: "文化史の関連づけ",
      paperRef: null,
      ...defaults,
      ...fields,
      variantGroup: fields.variantGroup || `social-author-${fields.authorKey}`,
      sourceLabel: sources[0].label,
      sourceUrl: sources[0].url,
      sourceUrls: sources.map((source) => source.url)
    };
  }

  const classical = [
    authorQuestion({
      id: "social-author-v2-031", cornerId: "classical", tier: "core", authorKey: "ki-no-tsurayuki", retrievalDirection: "work-to-author",
      examSkill: "作品から人物を選ぶ", formatTag: "作品→人物", mistakeTags: ["作者名", "国風文化"],
      skills: ["紀貫之", "土佐日記", "平安時代"],
      prompt: "平安時代の日記文学『土佐日記』を書いた人物は誰ですか。",
      choices: ["紀貫之", "鴨長明", "清少納言", "兼好法師"], answer: 0,
      explanation: "『土佐日記』を書いたのは紀貫之です。平安時代、仮名を用いた日記文学として成立しました。"
    }),
    authorQuestion({
      id: "social-author-v2-032", cornerId: "classical", tier: "core", authorKey: "ki-no-tsurayuki", retrievalDirection: "person-role-work-matching",
      examSkill: "人物・文化上の役割・作品を結び付ける", formatTag: "人物・役割・作品", mistakeTags: ["人物の役割", "国風文化"],
      skills: ["紀貫之", "古今和歌集", "土佐日記"],
      prompt: "平安時代の人物・文化上の役割・作品の組合せとして正しいものはどれですか。",
      choices: ["紫式部―勅撰和歌集の選者―『源氏物語』", "紀貫之―勅撰和歌集の選者―『土佐日記』", "清少納言―能を大成―『枕草子』", "鴨長明―国学を発展―『方丈記』"], answer: 1,
      explanation: "紀貫之は勅撰和歌集『古今和歌集』の選者の一人で、『土佐日記』を書きました。編者の一人と作者という二つの役割を区別しましょう。"
    }),
    authorQuestion({
      id: "social-author-v2-033", cornerId: "classical", tier: "core", authorKey: "murasaki-shikibu", retrievalDirection: "work-to-author",
      examSkill: "作品から人物を選ぶ", formatTag: "作品→人物", mistakeTags: ["作者名", "国風文化"],
      skills: ["紫式部", "源氏物語", "平安時代"],
      prompt: "平安時代の宮廷社会を描いた『源氏物語』の作者は誰ですか。",
      choices: ["清少納言", "紀貫之", "紫式部", "鴨長明"], answer: 2,
      explanation: "『源氏物語』の作者は紫式部です。かな文字の発達を背景に、平安時代の国風文化の中で生まれました。"
    }),
    authorQuestion({
      id: "social-author-v2-034", cornerId: "classical", tier: "core", authorKey: "sei-shonagon", retrievalDirection: "work-to-author",
      examSkill: "作品から人物を選ぶ", formatTag: "作品→人物", mistakeTags: ["作者名", "随筆"],
      skills: ["清少納言", "枕草子", "平安時代"],
      prompt: "宮中での生活や自然への感想などを記した『枕草子』の作者は誰ですか。",
      choices: ["紫式部", "兼好法師", "紀貫之", "清少納言"], answer: 3,
      explanation: "『枕草子』の作者は清少納言です。平安時代の国風文化を代表する随筆として知られます。"
    }),
    authorQuestion({
      id: "social-author-v2-035", cornerId: "classical", tier: "core", authorKey: "murasaki-shikibu", retrievalDirection: "author-work-comparison",
      examSkill: "二人の人物と作品を区別する", formatTag: "組合せ", mistakeTags: ["人物作品", "国風文化"],
      skills: ["紫式部", "清少納言", "平安文学"],
      prompt: "平安時代の女性文学者と作品の組合せとして正しいものはどれですか。",
      choices: ["紫式部―『枕草子』／清少納言―『源氏物語』", "紫式部―『源氏物語』／清少納言―『枕草子』", "紫式部―『方丈記』／清少納言―『徒然草』", "紫式部―『土佐日記』／清少納言―『古事記伝』"], answer: 1,
      explanation: "紫式部は『源氏物語』、清少納言は『枕草子』です。二人はともに平安時代の国風文化を代表します。"
    }),
    authorQuestion({
      id: "social-author-v2-036", cornerId: "classical", tier: "core", authorKey: "sei-shonagon", retrievalDirection: "work-to-cultural-background",
      examSkill: "作品を国風文化の背景と結び付ける", formatTag: "作品→文化背景", mistakeTags: ["国風文化", "時代背景"],
      skills: ["清少納言", "枕草子", "かな文字"],
      prompt: "清少納言の『枕草子』が生まれた文化的背景として、最も適切なものはどれですか。",
      choices: ["かな文字が発達し、国風文化が栄えた", "武士が政権を開き、鎌倉文化が栄えた", "禅宗が広まり、北山文化が栄えた", "町人の力が強まり、元禄文化が栄えた"], answer: 0,
      explanation: "平安時代にかな文字が発達し、日本の風土や生活に合った国風文化が栄えました。『枕草子』や『源氏物語』はその中で生まれました。"
    }),
    authorQuestion({
      id: "social-author-v2-037", cornerId: "classical", tier: "core", authorKey: "kamo-no-chomei", retrievalDirection: "work-to-author",
      examSkill: "作品から人物を選ぶ", formatTag: "作品→人物", mistakeTags: ["作者名", "鎌倉文化"],
      skills: ["鴨長明", "方丈記", "随筆"],
      prompt: "鎌倉時代に成立した随筆『方丈記』の作者は誰ですか。",
      choices: ["兼好法師", "紀貫之", "鴨長明", "世阿弥"], answer: 2,
      explanation: "『方丈記』の作者は鴨長明です。災害や社会の変化を背景に、世の無常を記しました。"
    }),
    authorQuestion({
      id: "social-author-v2-038", cornerId: "classical", tier: "core", authorKey: "yoshida-kenko", retrievalDirection: "work-to-author",
      examSkill: "作品から人物を選ぶ", formatTag: "作品→人物", mistakeTags: ["作者名", "中世文化"],
      skills: ["兼好法師", "徒然草", "随筆"],
      prompt: "鎌倉時代末ごろに成立した随筆『徒然草』の作者は誰ですか。",
      choices: ["鴨長明", "清少納言", "松尾芭蕉", "兼好法師"], answer: 3,
      explanation: "『徒然草』の作者は兼好法師です。中世の社会や人間についての考えが記された随筆です。"
    }),
    authorQuestion({
      id: "social-author-v2-039", cornerId: "classical", tier: "core", type: "input", answerTarget: "period", authorKey: "yoshida-kenko", retrievalDirection: "author-work-to-period",
      examSkill: "人物と作品から成立時代を記述する", formatTag: "時代を直接入力", mistakeTags: ["時代区分", "中世文化"],
      skills: ["兼好法師", "徒然草", "鎌倉時代"],
      prompt: "兼好法師の『徒然草』が成立したのは、およそ何時代ですか。漢字で答えなさい。",
      answerText: ["鎌倉時代", "鎌倉時代後期", "鎌倉時代末期", "鎌倉時代末ごろ"], placeholder: "時代を入力",
      explanation: "答えは鎌倉時代です。『徒然草』は鎌倉時代末ごろに成立したとされ、中世の社会や人間についての考えが記されています。"
    }),
    authorQuestion({
      id: "social-author-v2-040", cornerId: "classical", tier: "core", authorKey: "zeami", retrievalDirection: "culture-to-author",
      examSkill: "文化の特色から人物を選ぶ", formatTag: "文化→人物", mistakeTags: ["人物名", "室町文化"],
      skills: ["世阿弥", "能", "風姿花伝"],
      prompt: "室町時代に父の観阿弥とともに能を大成し、『風姿花伝』を著した人物は誰ですか。",
      choices: ["近松門左衛門", "世阿弥", "井原西鶴", "本居宣長"], answer: 1,
      explanation: "能を大成し、『風姿花伝』に芸の心得をまとめたのは世阿弥です。室町文化を学ぶ上で重要な人物です。"
    }),
    authorQuestion({
      id: "social-author-v2-041", cornerId: "classical", tier: "challenge", authorKey: "zeami", retrievalDirection: "culture-to-patron",
      examSkill: "芸能の発展を政治の背景と結び付ける", formatTag: "文化→政治背景", mistakeTags: ["室町文化", "将軍の保護"],
      skills: ["世阿弥", "能", "足利義満"],
      prompt: "観阿弥・世阿弥の能は、室町幕府のだれの保護を受けて発展しましたか。",
      choices: ["足利義満", "足利尊氏", "織田信長", "徳川家康"], answer: 0,
      explanation: "観阿弥・世阿弥の能は、室町幕府3代将軍の足利義満の保護を受けて発展しました。文化と政治権力の関係を結び付けましょう。"
    }),
    authorQuestion({
      id: "social-author-v2-042", cornerId: "classical", tier: "challenge", authorKey: "ihara-saikaku", retrievalDirection: "work-culture-to-author",
      examSkill: "作品と文化から人物を選ぶ", formatTag: "作品・文化→人物", mistakeTags: ["作者名", "元禄文化"],
      skills: ["井原西鶴", "日本永代蔵", "浮世草子"],
      prompt: "元禄文化のころ、町人の生活を題材にした浮世草子『日本永代蔵』を書いた人物は誰ですか。",
      choices: ["十返舎一九", "井原西鶴", "近松門左衛門", "曲亭馬琴"], answer: 1,
      explanation: "『日本永代蔵』を書いたのは井原西鶴です。浮世草子は、元禄期の町人文化を代表する読み物です。"
    }),
    authorQuestion({
      id: "social-author-v2-043", cornerId: "classical", tier: "challenge", type: "input", answerTarget: "author", authorKey: "matsuo-basho", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から人物名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      skills: ["松尾芭蕉", "おくのほそ道", "元禄文化"],
      prompt: "紀行文『おくのほそ道』を書いた俳人の名を漢字で答えなさい。",
      answerText: ["松尾芭蕉"], placeholder: "人物名を入力",
      explanation: "答えは松尾芭蕉です。各地を旅して俳諧を深め、元禄文化を代表する俳人となりました。"
    }),
    authorQuestion({
      id: "social-author-v2-044", cornerId: "classical", tier: "challenge", authorKey: "chikamatsu-monzaemon", retrievalDirection: "genre-work-to-author",
      examSkill: "芸能と作品から人物を選ぶ", formatTag: "芸能・作品→人物", mistakeTags: ["作者名", "元禄文化"],
      skills: ["近松門左衛門", "人形浄瑠璃", "曽根崎心中"],
      prompt: "人形浄瑠璃の脚本『曽根崎心中』を書いた人物は誰ですか。",
      choices: ["井原西鶴", "世阿弥", "近松門左衛門", "十返舎一九"], answer: 2,
      explanation: "『曽根崎心中』を書いたのは近松門左衛門です。元禄文化のころ、人形浄瑠璃や歌舞伎の脚本で活躍しました。"
    }),
    authorQuestion({
      id: "social-author-v2-045", cornerId: "classical", tier: "challenge", authorKey: "ihara-saikaku", retrievalDirection: "literature-to-urban-background",
      examSkill: "文学の発達を都市と担い手に結び付ける", formatTag: "文学→社会背景", mistakeTags: ["元禄文化", "町人文化"],
      skills: ["井原西鶴", "浮世草子", "上方の町人"],
      prompt: "井原西鶴の浮世草子が読まれた元禄文化の背景として、最も適切なものはどれですか。",
      choices: ["鎌倉を中心に武士の文化が栄えた", "京都で公家の国風文化が栄えた", "江戸を中心に学問や庶民文化が栄えた", "大阪・京都を中心に上方の町人文化が栄えた"], answer: 3,
      explanation: "元禄文化は、経済力をつけた大阪・京都など上方の町人を中心に栄えました。西鶴の浮世草子は、その町人社会を背景としています。"
    }),
    authorQuestion({
      id: "social-author-v2-046", cornerId: "classical", tier: "challenge", authorKey: "motoori-norinaga", retrievalDirection: "work-field-to-author",
      examSkill: "著作と学問分野から人物を選ぶ", formatTag: "著作・学問→人物", mistakeTags: ["人物名", "国学"],
      skills: ["本居宣長", "古事記伝", "国学"],
      prompt: "『古事記伝』を著し、国学を発展させた人物は誰ですか。",
      choices: ["本居宣長", "杉田玄白", "中江兆民", "柳田国男"], answer: 0,
      explanation: "『古事記伝』を著して国学を発展させたのは本居宣長です。日本の古典を研究した国学と、人物名を結び付けましょう。"
    }),
    authorQuestion({
      id: "social-author-v2-047", cornerId: "classical", tier: "challenge", authorKey: "sugita-genpaku", retrievalDirection: "historical-context-to-author",
      examSkill: "学問の動きから人物を選ぶ", formatTag: "背景→人物", mistakeTags: ["蘭学", "人物名"],
      skills: ["杉田玄白", "解体新書", "蘭学"],
      prompt: "江戸時代、仲間とオランダ語の解剖書を翻訳し、『解体新書』を刊行した人物は誰ですか。",
      choices: ["本居宣長", "杉田玄白", "福沢諭吉", "柳田国男"], answer: 1,
      explanation: "『解体新書』の翻訳・刊行に携わったのは杉田玄白です。この仕事は蘭学の発達を示しています。"
    }),
    authorQuestion({
      id: "social-author-v2-048", cornerId: "classical", tier: "challenge", authorKey: "jippensha-ikku", retrievalDirection: "work-to-author",
      examSkill: "作品から人物を選ぶ", formatTag: "作品→人物", mistakeTags: ["作者名", "化政文化"],
      skills: ["十返舎一九", "東海道中膝栗毛", "化政文化"],
      prompt: "弥次さんと喜多さんの旅をおもしろく描いた『東海道中膝栗毛』の作者は誰ですか。",
      choices: ["曲亭馬琴", "井原西鶴", "十返舎一九", "近松門左衛門"], answer: 2,
      explanation: "『東海道中膝栗毛』の作者は十返舎一九です。庶民の旅を題材にした、化政文化を代表する読み物です。"
    }),
    authorQuestion({
      id: "social-author-v2-049", cornerId: "classical", tier: "challenge", type: "input", answerTarget: "author", authorKey: "kyokutei-bakin", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から人物名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      skills: ["曲亭馬琴", "南総里見八犬伝", "化政文化"],
      prompt: "『南総里見八犬伝』を書いた人物名を漢字で答えなさい。",
      answerText: ["曲亭馬琴", "滝沢馬琴", "瀧澤馬琴"], placeholder: "人物名を入力",
      explanation: "答えは曲亭馬琴です。「滝沢馬琴」「瀧澤馬琴」も同じ人物を指すため正解です。"
    }),
    authorQuestion({
      id: "social-author-v2-050", cornerId: "classical", tier: "challenge", authorKey: "jippensha-ikku", retrievalDirection: "travel-literature-to-social-background",
      examSkill: "読み物の流行を庶民生活の変化と結び付ける", formatTag: "作品→社会背景", mistakeTags: ["化政文化", "庶民の旅"],
      skills: ["十返舎一九", "東海道中膝栗毛", "街道の整備"],
      prompt: "『東海道中膝栗毛』のような旅の読み物が化政文化で人気を得た背景として、最も適切なものはどれですか。",
      choices: ["関所と通行手形がすべて廃止され、だれでも自由に旅ができた", "参勤交代がなくなり、街道が大名の移動に使われなくなった", "旅は武士だけに許され、庶民が旅に出ることは禁止された", "街道や宿場が整い、庶民の旅や伊勢参りが広がった"], answer: 3,
      explanation: "江戸時代後期には街道や宿場が整い、庶民の旅や伊勢参りが広がりました。そうした社会を背景に、旅を題材にした滑稽本が人気を得ました。"
    })
  ];

  const modernExtra = [
    authorQuestion({
      id: "social-author-v2-051", cornerId: "modern-extra", tier: "core", authorKey: "fukuzawa-yukichi", retrievalDirection: "work-to-author",
      examSkill: "著作から人物を選ぶ", formatTag: "著作→人物", mistakeTags: ["人物名", "文明開化"],
      skills: ["福沢諭吉", "学問のすゝめ", "明治時代"],
      prompt: "明治初期に『学問のすゝめ』を著した人物は誰ですか。",
      choices: ["福沢諭吉", "中江兆民", "西田幾多郎", "柳田国男"], answer: 0,
      explanation: "『学問のすゝめ』を著したのは福沢諭吉です。学問の重要性を説き、明治の啓蒙思想に大きな影響を与えました。"
    }),
    authorQuestion({
      id: "social-author-v2-052", cornerId: "modern-extra", tier: "core", authorKey: "nakae-chomin", retrievalDirection: "work-to-author",
      examSkill: "著作から人物を選ぶ", formatTag: "著作→人物", mistakeTags: ["人物名", "自由民権運動"],
      skills: ["中江兆民", "民約訳解", "自由民権運動"],
      prompt: "フランスの民権思想を『民約訳解』として紹介した人物は誰ですか。",
      choices: ["福沢諭吉", "中江兆民", "正岡子規", "西田幾多郎"], answer: 1,
      explanation: "『民約訳解』としてフランスの民権思想を紹介したのは中江兆民です。自由や権利を重んじる考えを広めました。"
    }),
    authorQuestion({
      id: "social-author-v2-053", cornerId: "modern-extra", tier: "core", authorKey: "fukuzawa-yukichi", retrievalDirection: "author-to-modernization-context",
      examSkill: "啓蒙思想を文明開化と結び付ける", formatTag: "人物→近代化背景", mistakeTags: ["啓蒙思想", "文明開化"],
      skills: ["福沢諭吉", "文明開化", "啓蒙思想"],
      prompt: "福沢諭吉が活躍した明治初期の社会の動きとして、最も関係が深いものはどれですか。",
      choices: ["上方の町人を中心に元禄文化が栄えた", "武士が政権を開き、新しい仏教が広まった", "欧米の制度や知識を学ぶ文明開化が進んだ", "遣唐使が活躍し、大陸風の文化が栄えた"], answer: 2,
      explanation: "明治初期には、欧米の制度や知識を取り入れる文明開化が進みました。福沢諭吉はこの時代に学問と自立の大切さを説いた啓蒙思想家です。"
    }),
    authorQuestion({
      id: "social-author-v2-054", cornerId: "modern-extra", tier: "core", authorKey: "nakae-chomin", retrievalDirection: "work-to-political-context",
      examSkill: "著作と政治の動きを関連づける", formatTag: "著作→政治背景", mistakeTags: ["自由民権運動", "思想史"],
      skills: ["中江兆民", "民約訳解", "民権思想"],
      prompt: "中江兆民の『民約訳解』が広めた思想と、特に関係が深い明治時代の動きはどれですか。",
      choices: ["藩を廃止して中央集権国家をつくる廃藩置県", "官営工場を建設して産業を育てる殖産興業", "欧米諸国と対等な条約を結ぶための条約改正", "国会の開設や憲法の制定を求める自由民権運動"], answer: 3,
      explanation: "『民約訳解』が紹介した自由・権利の思想は、国会開設や憲法制定を求める自由民権運動と深く関係します。"
    }),
    authorQuestion({
      id: "social-author-v2-055", cornerId: "modern-extra", tier: "core", authorKey: "masaoka-shiki", retrievalDirection: "cultural-reform-to-author",
      examSkill: "文化上の活動から人物を選ぶ", formatTag: "活動→人物", mistakeTags: ["人物名", "明治文化"],
      skills: ["正岡子規", "俳句", "短歌"],
      prompt: "明治時代に俳句と短歌の革新を進めた人物は誰ですか。",
      choices: ["正岡子規", "島崎藤村", "田山花袋", "武者小路実篤"], answer: 0,
      explanation: "俳句と短歌の革新を進めたのは正岡子規です。明治期の文学の新しい表現に大きな影響を与えました。"
    }),
    authorQuestion({
      id: "social-author-v2-056", cornerId: "modern-extra", tier: "core", authorKey: "masaoka-shiki", retrievalDirection: "cross-period-poet-comparison",
      examSkill: "俳人の活動時期を比較する", formatTag: "時代比較", mistakeTags: ["活動時期", "俳諧と俳句"],
      skills: ["正岡子規", "松尾芭蕉", "明治文化"],
      prompt: "松尾芭蕉と正岡子規の主な活動時期の組合せとして、正しいものはどれですか。",
      choices: ["松尾芭蕉―平安時代／正岡子規―鎌倉時代", "松尾芭蕉―江戸時代／正岡子規―明治時代", "松尾芭蕉―明治時代／正岡子規―江戸時代", "松尾芭蕉―大正時代／正岡子規―昭和時代"], answer: 1,
      explanation: "松尾芭蕉は江戸時代の元禄文化を代表する俳人、正岡子規は明治時代に俳句と短歌の革新を進めた人物です。"
    }),
    authorQuestion({
      id: "social-author-v2-057", cornerId: "modern-extra", tier: "core", type: "input", answerTarget: "author", authorKey: "shimazaki-toson", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から人物名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      skills: ["島崎藤村", "破戒", "自然主義文学"],
      prompt: "小説『破戒』を書いた人物名を漢字で答えなさい。",
      answerText: ["島崎藤村"], placeholder: "人物名を入力",
      explanation: "答えは島崎藤村です。『破戒』は明治期の自然主義文学の代表的な作品の一つです。"
    }),
    authorQuestion({
      id: "social-author-v2-058", cornerId: "modern-extra", tier: "core", authorKey: "tayama-katai", retrievalDirection: "work-to-author",
      examSkill: "作品から人物を選ぶ", formatTag: "作品→人物", mistakeTags: ["作者名", "自然主義文学"],
      skills: ["田山花袋", "蒲団", "自然主義文学"],
      prompt: "明治時代の小説『蒲団』の作者は誰ですか。",
      choices: ["島崎藤村", "有島武郎", "田山花袋", "川端康成"], answer: 2,
      explanation: "『蒲団』の作者は田山花袋です。明治後期に広がった自然主義文学と結び付けて覚えましょう。"
    }),
    authorQuestion({
      id: "social-author-v2-059", cornerId: "modern-extra", tier: "core", authorKey: "shimazaki-toson", retrievalDirection: "author-work-to-period-movement",
      examSkill: "人物・作品・時代・文学の流れを結び付ける", formatTag: "人物・作品→時代・文学", mistakeTags: ["自然主義文学", "明治後期"],
      skills: ["島崎藤村", "破戒", "自然主義文学"],
      prompt: "島崎藤村の『破戒』について、時代と文学の流れの組合せとして最も適切なものはどれですか。",
      choices: ["江戸後期―国学", "大正時代―白樺派", "昭和初期―プロレタリア文学", "明治後期―自然主義文学"], answer: 3,
      explanation: "島崎藤村の『破戒』は明治後期の作品で、自然主義文学の代表作の一つです。時代と文学の流れを一組で確認しましょう。"
    }),
    authorQuestion({
      id: "social-author-v2-060", cornerId: "modern-extra", tier: "core", authorKey: "tayama-katai", retrievalDirection: "author-work-to-movement",
      examSkill: "複数作品に共通する文学の特色を判断する", formatTag: "作品比較→文学の特色", mistakeTags: ["自然主義文学", "文学の特色"],
      skills: ["田山花袋", "蒲団", "自然主義文学"],
      prompt: "田山花袋の『蒲団』と島崎藤村の『破戒』に共通する、明治後期の文学の特色として最も適切なものはどれですか。",
      choices: ["人間や社会の現実をありのままに描こうとする自然主義文学", "個人の尊重や人道主義を重んじた白樺派の文学", "労働者の生活や社会問題を描いたプロレタリア文学", "日本の古典を研究して古来の精神を明らかにする国学"], answer: 0,
      explanation: "『蒲団』と『破戒』は、どちらも明治後期の自然主義文学と結び付きます。人間や社会の現実をありのままに描こうとした点を押さえましょう。"
    }),
    authorQuestion({
      id: "social-author-v2-061", cornerId: "modern-extra", tier: "challenge", type: "input", answerTarget: "author", authorKey: "mushanokoji-saneatsu", retrievalDirection: "direct-work-movement-to-author",
      examSkill: "作品と文学の流れから人物名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      skills: ["武者小路実篤", "友情", "白樺派"],
      prompt: "白樺派に属し、小説『友情』を書いた人物名を漢字で答えなさい。",
      answerText: ["武者小路実篤"], placeholder: "人物名を入力",
      explanation: "答えは武者小路実篤です。個人の尊重を重んじた白樺派を代表する作家の一人です。"
    }),
    authorQuestion({
      id: "social-author-v2-062", cornerId: "modern-extra", tier: "challenge", authorKey: "arishima-takeo", retrievalDirection: "author-to-movement-work",
      examSkill: "人物・作品・文学の流れを関連づける", formatTag: "人物→作品・文学", mistakeTags: ["人物説明", "白樺派"],
      skills: ["有島武郎", "或る女", "白樺派"],
      prompt: "有島武郎について正しく述べた文はどれですか。",
      choices: ["白樺派に属し、『或る女』を書いた", "自然主義文学に属し、『蒲団』を書いた", "民俗学の基礎を築き、『遠野物語』を書いた", "近代哲学を研究し、『善の研究』を書いた"], answer: 0,
      explanation: "有島武郎は白樺派に属し、『或る女』を書きました。他は田山花袋、柳田国男、西田幾多郎の説明です。"
    }),
    authorQuestion({
      id: "social-author-v2-063", cornerId: "modern-extra", tier: "challenge", authorKey: "mushanokoji-saneatsu", retrievalDirection: "movement-to-peer-author",
      examSkill: "文学の流れから同時代の人物を選ぶ", formatTag: "文学→同派の人物", mistakeTags: ["白樺派", "人物比較"],
      skills: ["武者小路実篤", "有島武郎", "白樺派"],
      prompt: "武者小路実篤と同じ白樺派で活躍した人物は誰ですか。",
      choices: ["島崎藤村", "有島武郎", "小林多喜二", "正岡子規"], answer: 1,
      explanation: "有島武郎は武者小路実篤や志賀直哉と同じ白樺派で活躍しました。島崎藤村は自然主義、小林多喜二はプロレタリア文学と関係します。"
    }),
    authorQuestion({
      id: "social-author-v2-064", cornerId: "modern-extra", tier: "challenge", authorKey: "arishima-takeo", retrievalDirection: "work-movement-to-author",
      examSkill: "作品と文学の流れから人物を選ぶ", formatTag: "作品・文学→人物", mistakeTags: ["人物名", "白樺派"],
      skills: ["有島武郎", "或る女", "白樺派"],
      prompt: "小説『或る女』を書き、白樺派に参加した人物は誰ですか。",
      choices: ["島崎藤村", "武者小路実篤", "有島武郎", "小林多喜二"], answer: 2,
      explanation: "『或る女』を書いた有島武郎は、武者小路実篤や志賀直哉らとともに白樺派で活躍しました。作品・人物・文学の流れを一組で覚えましょう。"
    }),
    authorQuestion({
      id: "social-author-v2-065", cornerId: "modern-extra", tier: "challenge", authorKey: "yanagita-kunio", retrievalDirection: "work-to-author",
      examSkill: "著作から人物を選ぶ", formatTag: "著作→人物", mistakeTags: ["人物名", "民俗学"],
      skills: ["柳田国男", "遠野物語", "民俗学"],
      prompt: "岩手県遠野地方に伝わる話を集めた『遠野物語』を著した人物は誰ですか。",
      choices: ["西田幾多郎", "福沢諭吉", "中江兆民", "柳田国男"], answer: 3,
      explanation: "『遠野物語』を著したのは柳田国男です。各地の伝承や生活を研究し、日本の民俗学の基礎を築きました。"
    }),
    authorQuestion({
      id: "social-author-v2-066", cornerId: "modern-extra", tier: "challenge", authorKey: "nishida-kitaro", retrievalDirection: "work-to-author",
      examSkill: "著作から人物を選ぶ", formatTag: "著作→人物", mistakeTags: ["人物名", "哲学"],
      skills: ["西田幾多郎", "善の研究", "哲学"],
      prompt: "日本の近代哲学を代表する著作『善の研究』を書いた人物は誰ですか。",
      choices: ["西田幾多郎", "柳田国男", "中江兆民", "福沢諭吉"], answer: 0,
      explanation: "『善の研究』を書いたのは西田幾多郎です。明治末に刊行され、日本の近代哲学を代表する著作となりました。"
    }),
    authorQuestion({
      id: "social-author-v2-067", cornerId: "modern-extra", tier: "challenge", authorKey: "yanagita-kunio", retrievalDirection: "author-to-field-method",
      examSkill: "人物の研究分野を判断する", formatTag: "人物→学問", mistakeTags: ["民俗学", "人物説明"],
      skills: ["柳田国男", "遠野物語", "民間伝承"],
      prompt: "柳田国男の研究について最も適切なものはどれですか。",
      choices: ["西洋哲学をもとに『善の研究』を書いた", "各地の伝承や生活を調べ、日本の民俗学の基礎を築いた", "国学を発展させて『古事記伝』を書いた", "蘭学を学んで『解体新書』の刊行に携わった"], answer: 1,
      explanation: "柳田国男は各地の伝承や生活を研究し、日本の民俗学の基礎を築きました。代表的な著作に『遠野物語』があります。"
    }),
    authorQuestion({
      id: "social-author-v2-068", cornerId: "modern-extra", tier: "challenge", authorKey: "nishida-kitaro", retrievalDirection: "work-to-modern-intellectual-context",
      examSkill: "著作を近代化による学問の発展と結び付ける", formatTag: "著作→近代の学問", mistakeTags: ["近代哲学", "文化の近代化"],
      skills: ["西田幾多郎", "善の研究", "西洋思想"],
      prompt: "西田幾多郎の『善の研究』が示す、明治以降の日本文化の特色として最も適切なものはどれですか。",
      choices: ["武士の生活を基に、新しい仏教が広がった", "町人の生活を基に、浮世草子が流行した", "西洋の思想を取り入れ、日本で独自の哲学研究が進んだ", "かな文字を用いて、宮廷文学が発達した"], answer: 2,
      explanation: "明治以降、西洋の学問や思想が本格的に紹介され、日本でも独自の研究が進みました。西田幾多郎の『善の研究』は、近代日本の哲学を代表する著作です。"
    }),
    authorQuestion({
      id: "social-author-v2-069", cornerId: "modern-extra", tier: "challenge", type: "input", answerTarget: "author", authorKey: "kawabata-yasunari", retrievalDirection: "direct-work-to-author",
      examSkill: "作品から人物名を記述する", formatTag: "直接入力", mistakeTags: ["作者名", "漢字記述"],
      skills: ["川端康成", "雪国", "昭和文化"],
      prompt: "小説『雪国』を書いた人物名を漢字で答えなさい。",
      answerText: ["川端康成"], placeholder: "人物名を入力",
      explanation: "答えは川端康成です。昭和期を代表する小説家の一人で、のちにノーベル文学賞を受賞しました。"
    }),
    authorQuestion({
      id: "social-author-v2-070", cornerId: "modern-extra", tier: "challenge", authorKey: "kawabata-yasunari", retrievalDirection: "honor-to-author",
      examSkill: "文化上の出来事から人物を選ぶ", formatTag: "受賞→人物", mistakeTags: ["人物名", "昭和文化"],
      skills: ["川端康成", "雪国", "ノーベル文学賞"],
      prompt: "1968年に日本人で初めてノーベル文学賞を受賞した人物は誰ですか。",
      choices: ["島崎藤村", "武者小路実篤", "有島武郎", "川端康成"], answer: 3,
      explanation: "1968年に日本人で初めてノーベル文学賞を受賞したのは川端康成です。代表作の一つに『雪国』があります。"
    })
  ];

  const allEraMix = [
    authorQuestion({
      id: "social-author-v2-071", cornerId: "all-era-mix", tier: "final", authorKey: "kamo-no-chomei", retrievalDirection: "theme-work-author-matching", sourceKeys: ["kamo-no-chomei", "yoshida-kenko", "sei-shonagon"],
      examSkill: "作品の背景と人物を関連づける", formatTag: "背景・作品・人物", mistakeTags: ["随筆", "時代区分"],
      skills: ["鴨長明", "方丈記", "無常観"],
      prompt: "社会の混乱や災害を背景に世の無常を記した、中世の随筆と人物の組合せはどれですか。",
      choices: ["『方丈記』―鴨長明", "『徒然草』―清少納言", "『枕草子』―兼好法師", "『土佐日記』―世阿弥"], answer: 0,
      explanation: "社会の混乱や災害を背景に世の無常を記したのは、鴨長明の『方丈記』です。鎌倉時代に成立しました。"
    }),
    authorQuestion({
      id: "social-author-v2-072", cornerId: "all-era-mix", tier: "final", authorKey: "matsuo-basho", retrievalDirection: "chronological-order", sourceKeys: ["sei-shonagon", "matsuo-basho", "fukuzawa-yukichi"],
      examSkill: "作品を成立した時代順に並べる", formatTag: "年代整序", mistakeTags: ["時代区分", "作品年代"],
      skills: ["枕草子", "おくのほそ道", "学問のすゝめ"],
      prompt: "次の三作品を、成立・刊行した時代が古いものから順に並べたものはどれですか。",
      choices: ["『おくのほそ道』→『枕草子』→『学問のすゝめ』", "『枕草子』→『おくのほそ道』→『学問のすゝめ』", "『枕草子』→『学問のすゝめ』→『おくのほそ道』", "『学問のすゝめ』→『おくのほそ道』→『枕草子』"], answer: 1,
      explanation: "『枕草子』は平安、『おくのほそ道』は江戸の元禄期、『学問のすゝめ』は明治初期です。"
    }),
    authorQuestion({
      id: "social-author-v2-073", cornerId: "all-era-mix", tier: "final", authorKey: "chikamatsu-monzaemon", retrievalDirection: "performing-arts-to-social-background", sourceKeys: ["chikamatsu-monzaemon", "ihara-saikaku"],
      examSkill: "芸能の発達を都市と担い手に結び付ける", formatTag: "芸能→社会背景", mistakeTags: ["元禄文化", "町人文化"],
      skills: ["近松門左衛門", "人形浄瑠璃", "上方の町人"],
      prompt: "近松門左衛門が人形浄瑠璃の脚本で活躍した元禄期の社会背景として、最も適切なものはどれですか。",
      choices: ["平安京の貴族を中心に、かな文字を用いた文化が栄えた", "鎌倉の武士を中心に、新しい仏教と武家文化が広がった", "大阪・京都の商業が発達し、町人が文化の重要な担い手になった", "明治政府が欧米の制度を取り入れ、文明開化を進めた"], answer: 2,
      explanation: "元禄文化は、大阪・京都など上方の経済力をもつ町人を中心に栄えました。近松門左衛門の人形浄瑠璃も、この都市の町人文化の中で支持されました。"
    }),
    authorQuestion({
      id: "social-author-v2-074", cornerId: "all-era-mix", tier: "final", authorKey: "kyokutei-bakin", retrievalDirection: "popular-literature-to-urban-background", sourceKeys: ["kyokutei-bakin", "jippensha-ikku"],
      examSkill: "読み物の普及を都市の発達と結び付ける", formatTag: "読み物→社会背景", mistakeTags: ["化政文化", "江戸の庶民文化"],
      skills: ["曲亭馬琴", "南総里見八犬伝", "化政文化"],
      prompt: "曲亭馬琴の『南総里見八犬伝』などの読み物が広まった化政文化の特色として、最も適切なものはどれですか。",
      choices: ["大阪・京都の豪商を中心に、元禄期の上方文化が栄えた", "平安京の貴族を中心に、国風文化が栄えた", "欧米の制度や生活様式を取り入れる文明開化が進んだ", "江戸を中心に庶民文化が栄え、出版や貸本を通じて読み物が広がった"], answer: 3,
      explanation: "化政文化は江戸を中心に栄えた庶民文化です。出版や貸本の広がりを背景に、曲亭馬琴の読本などが多くの人に読まれました。"
    }),
    authorQuestion({
      id: "social-author-v2-075", cornerId: "all-era-mix", tier: "final", authorKey: "motoori-norinaga", retrievalDirection: "kokugaku-rangaku-method-comparison", sourceKeys: ["motoori-norinaga", "sugita-genpaku"],
      examSkill: "国学と蘭学の研究対象を比較する", formatTag: "学問の比較", mistakeTags: ["国学", "蘭学"],
      skills: ["本居宣長", "杉田玄白", "江戸の学問"],
      prompt: "江戸時代に発達した国学と蘭学について、研究の向きの組合せとして正しいものはどれですか。",
      choices: ["国学―日本の古典を研究する／蘭学―オランダ語の書物から西洋の知識を学ぶ", "国学―オランダ語の医学書を翻訳する／蘭学―『古事記』を研究する", "国学―ヨーロッパの政治制度を研究する／蘭学―武士の道徳を研究する", "国学―各地の民間伝承を集める／蘭学―仏教の経典を研究する"], answer: 0,
      explanation: "国学は日本の古典を研究し、日本古来の考え方を明らかにしようとした学問です。蘭学はオランダ語の書物を通して西洋の医学や科学などを学びました。"
    }),
    authorQuestion({
      id: "social-author-v2-076", cornerId: "all-era-mix", tier: "final", authorKey: "sugita-genpaku", retrievalDirection: "rangaku-to-trade-background", sourceKeys: ["sugita-genpaku"],
      examSkill: "学問の発達を鎖国下の対外関係と結び付ける", formatTag: "学問→対外関係", mistakeTags: ["蘭学", "長崎貿易"],
      skills: ["杉田玄白", "蘭学", "長崎のオランダ貿易"],
      prompt: "鎖国中の日本で、杉田玄白らが学んだ蘭学が発達する土台になった対外関係はどれですか。",
      choices: ["対馬でロシアとの貿易が続き、ロシア語の医学書が入った", "長崎でオランダとの貿易が続き、西洋の書物や知識が入った", "薩摩でスペインとの貿易が続き、スペイン語が公用語になった", "松前でフランスとの貿易が続き、フランスの学校が建てられた"], answer: 1,
      explanation: "鎖国中も長崎ではオランダとの貿易が続き、洋書や西洋の知識が入ってきました。杉田玄白らの蘭学は、この窓口を通じた情報を土台に発達しました。"
    }),
    authorQuestion({
      id: "social-author-v2-077", cornerId: "all-era-mix", tier: "final", authorKey: "yoshida-kenko", retrievalDirection: "cross-era-chronology", sourceKeys: ["yoshida-kenko", "matsuo-basho", "natsume-soseki"],
      examSkill: "人物と作品を時代順に並べる", formatTag: "人物作品の年代整序", mistakeTags: ["時代区分", "人物作品"],
      skills: ["兼好法師", "松尾芭蕉", "夏目漱石"],
      prompt: "夏目漱石・兼好法師・松尾芭蕉とそれぞれの作品を、時代が古いものから順に並べたものはどれですか。",
      choices: ["松尾芭蕉―『おくのほそ道』→兼好法師―『徒然草』→夏目漱石―『坊っちゃん』", "夏目漱石―『坊っちゃん』→松尾芭蕉―『おくのほそ道』→兼好法師―『徒然草』", "兼好法師―『徒然草』→松尾芭蕉―『おくのほそ道』→夏目漱石―『坊っちゃん』", "兼好法師―『徒然草』→夏目漱石―『坊っちゃん』→松尾芭蕉―『おくのほそ道』"], answer: 2,
      explanation: "『徒然草』は中世、『おくのほそ道』は江戸、『坊っちゃん』は明治です。この順に時代が新しくなります。"
    }),
    authorQuestion({
      id: "social-author-v2-078", cornerId: "all-era-mix", tier: "final", authorKey: "kobayashi-takiji", retrievalDirection: "work-to-labor-social-background", sourceKeys: ["kobayashi-takiji"],
      examSkill: "作品を昭和初期の社会運動と結び付ける", formatTag: "作品→社会背景", mistakeTags: ["プロレタリア文学", "昭和初期"],
      skills: ["小林多喜二", "蟹工船", "労働運動"],
      prompt: "小林多喜二の『蟹工船』が発表された昭和初期の社会状況として、最も関係が深いものはどれですか。",
      choices: ["遣唐使を通じて唐の制度や仏教文化を取り入れた", "武士が政権を開き、新しい仏教が各地に広まった", "国会開設や憲法制定を求める自由民権運動が始まった", "労働運動や社会運動が広がる一方、政府による取締りも強まった"], answer: 3,
      explanation: "昭和初期には労働運動や社会運動が広がり、それを描くプロレタリア文学も発達しました。一方で政府の取締りも強まり、小林多喜二も弾圧を受けました。"
    }),
    authorQuestion({
      id: "social-author-v2-079", cornerId: "all-era-mix", tier: "final", authorKey: "kobayashi-takiji", retrievalDirection: "cross-era-author-work-order", sourceKeys: ["murasaki-shikibu", "chikamatsu-monzaemon", "kobayashi-takiji"],
      examSkill: "人物・作品を時代順に並べる", formatTag: "年代整序", mistakeTags: ["時代区分", "人物作品"],
      skills: ["紫式部", "近松門左衛門", "小林多喜二"],
      prompt: "小林多喜二・紫式部・近松門左衛門とそれぞれの作品を、時代が古いものから順に並べたものはどれですか。",
      choices: ["紫式部―『源氏物語』→近松門左衛門―『曽根崎心中』→小林多喜二―『蟹工船』", "近松門左衛門―『曽根崎心中』→紫式部―『源氏物語』→小林多喜二―『蟹工船』", "紫式部―『源氏物語』→小林多喜二―『蟹工船』→近松門左衛門―『曽根崎心中』", "小林多喜二―『蟹工船』→近松門左衛門―『曽根崎心中』→紫式部―『源氏物語』"], answer: 0,
      explanation: "『源氏物語』は平安、『曽根崎心中』は江戸の元禄期、『蟹工船』は昭和初期の作品です。"
    }),
    authorQuestion({
      id: "social-author-v2-080", cornerId: "all-era-mix", tier: "final", authorKey: "akutagawa-ryunosuke", retrievalDirection: "cross-era-three-way-matching", sourceKeys: ["zeami", "akutagawa-ryunosuke", "kawabata-yasunari"],
      examSkill: "人物・時代・作品や分野を関連づける", formatTag: "全時代三項対応", mistakeTags: ["人物作品", "時代区分"],
      skills: ["世阿弥", "芥川龍之介", "川端康成"],
      prompt: "人物・主な活動時期・作品や分野の組合せとして、三つとも正しいものはどれですか。",
      choices: ["世阿弥―江戸時代―能／芥川龍之介―明治時代―『羅生門』／川端康成―大正時代―『雪国』", "世阿弥―室町時代―能／芥川龍之介―大正時代―『羅生門』／川端康成―昭和時代―『雪国』", "世阿弥―平安時代―随筆／芥川龍之介―昭和初期―『蟹工船』／川端康成―明治時代―『舞姫』", "世阿弥―鎌倉時代―国学／芥川龍之介―江戸時代―『南総里見八犬伝』／川端康成―大正時代―『暗夜行路』"], answer: 1,
      explanation: "世阿弥―室町時代―能、芥川龍之介―大正時代―『羅生門』、川端康成―昭和時代―『雪国』が正しい組合せです。"
    })
  ];

  const questions = [...classical, ...modernExtra, ...allEraMix];

  function assertCount(label, rows, expected) {
    if (rows.length !== expected) throw new Error(`${PACK_ID} ${label}: expected ${expected}, got ${rows.length}`);
  }

  assertCount("classical", classical, 20);
  assertCount("modernExtra", modernExtra, 20);
  assertCount("allEraMix", allEraMix, 10);
  assertCount("expanded total", questions, 50);

  window.QUIZ_QUESTIONS = (window.QUIZ_QUESTIONS || []).concat(questions);
})();
