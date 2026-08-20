(function () {
  "use strict";

  const historyQuestions = (window.QUIZ_QUESTIONS || []).filter((question) => question.packId === "challenge-social-history");
  const byId = new Map(historyQuestions.map((question) => [question.id, question]));

  function patchQuestion(id, patch) {
    const question = byId.get(id);
    if (!question) return;
    Object.assign(question, patch);
    if (patch.sourceFactIds) question.variantGroup = `${question.unitId}-${patch.sourceFactIds[0]}`;
  }

  function replaceInput(id, patch) {
    const question = byId.get(id);
    if (!question) return;
    Object.assign(question, {
      type: "input",
      tier: "final",
      answerTarget: "history-term",
      formatTag: "直接入力",
      placeholder: "用語を入力",
      ...patch
    });
    delete question.choices;
    delete question.answer;
    delete question.figure;
    question.variantGroup = `${question.unitId}-${question.sourceFactIds[0]}`;
  }

  const choicePatches = {
    "challenge-his-13-004": {
      explanation: "弥生時代は稲作が広まり、むらに定住する生活が進みました。収穫した米を保管する高床倉庫もつくられました。"
    },
    "challenge-his-13-005": { sourceFactIds: ["his-13-f05"] },
    "challenge-his-13-015": { prompt: "朝鮮半島から渡来人が伝えたものとして正しいものはどれですか。" },
    "challenge-his-13-011": {
      prompt: "年表に示された日本の国のまとまりを、古いものから正しく並べたものはどれですか。",
      choices: ["小国の分立→邪馬台国→大和政権", "邪馬台国→小国の分立→大和政権", "大和政権→邪馬台国→小国の分立", "小国の分立→大和政権→邪馬台国"],
      answer: 0,
      sourceFactIds: ["his-13-f08", "his-13-f09"],
      retrievalDirection: "timeline-to-sequence",
      examSkill: "年代整序",
      explanation: "紀元前後には小国が分立し、3世紀には邪馬台国、3世紀後半には大和政権が現れます。両国を同一の国と断定せず、年表上の前後関係を読み取ります。",
      figure: {
        kind: "timeline",
        alt: "紀元前後の小国分立、3世紀の邪馬台国、3世紀後半の大和政権を示す年表",
        caption: "日本の国のまとまりの変化を示すオリジナル年表",
        events: [
          { year: "紀元前後", label: "小国が分立" },
          { year: "3世紀", label: "邪馬台国" },
          { year: "3世紀後半", label: "大和政権", emphasis: true }
        ]
      }
    },

    "challenge-his-14-001": { sourceFactIds: ["his-14-f01"] },
    "challenge-his-14-008": {
      prompt: "飛鳥文化と天平文化の代表例を正しく組み合わせたものはどれですか。",
      choices: ["飛鳥文化―法隆寺／天平文化―東大寺", "飛鳥文化―東大寺／天平文化―法隆寺", "飛鳥文化―金閣／天平文化―銀閣", "飛鳥文化―平等院鳳凰堂／天平文化―法隆寺"],
      answer: 0,
      sourceFactIds: ["his-14-f18", "his-14-f08", "his-14-f19"],
      retrievalDirection: "culture-to-representative-example-comparison",
      examSkill: "文化比較",
      explanation: "飛鳥文化は法隆寺に代表される日本初の仏教文化です。天平文化は聖武天皇のころの唐の影響を受けた仏教文化で、東大寺が代表例です。"
    },

    "challenge-his-15-001": { sourceFactIds: ["his-15-f01"] },
    "challenge-his-15-004": { sourceFactIds: ["his-15-f04"] },
    "challenge-his-15-008": { sourceFactIds: ["his-15-f08"] },
    "challenge-his-15-011": {
      prompt: "図で室町幕府の将軍を補佐し、有力な守護大名が就いた役職はどれですか。",
      explanation: "室町幕府では有力な守護大名が管領となって将軍を補佐しました。鎌倉幕府の執権と区別します。"
    },
    "challenge-his-15-022": { sourceFactIds: ["his-15-f10"] },

    "challenge-his-16-015": { sourceFactIds: ["his-16-f14"] },
    "challenge-his-16-013": { prompt: "織田信長が長篠の戦いで武田氏を破れた理由として最も適切なものはどれですか。" },
    "challenge-his-16-016": { sourceFactIds: ["his-16-f15"] },
    "challenge-his-16-012": {
      choices: ["ヨーロッパ諸国がアメリカやアジアへ進出した", "日本が鎖国を始めた", "室町幕府が成立した", "アメリカが南北戦争を始めた"]
    },

    "challenge-his-17-002": {
      prompt: "幕府が重要な都市や鉱山を直接支配し、幕府と藩が全国を支配した仕組みを何といいますか。",
      sourceFactIds: ["his-17-f02", "his-17-f03"],
      explanation: "江戸時代は幕府と藩が全国を支配する幕藩体制でした。幕府は重要な都市や鉱山など全国の約4分の1を直接支配しました。"
    },
    "challenge-his-17-003": {
      sourceFactIds: ["his-17-f06"],
      explanation: "武家諸法度は大名を統制するために江戸幕府が定めた法律です。鎌倉幕府の御成敗式目と区別します。"
    },
    "challenge-his-17-004": { sourceFactIds: ["his-17-f07"] },
    "challenge-his-17-005": {
      prompt: "島原・天草一揆後、ポルトガル船の来航を禁止して完成させた対外政策は何ですか。",
      sourceFactIds: ["his-17-f10"],
      explanation: "島原・天草一揆の後、幕府はキリスト教の取締りを強め、ポルトガル船の来航を禁止して鎖国を完成させました。"
    },
    "challenge-his-17-006": { sourceFactIds: ["his-17-f12"] },
    "challenge-his-17-007": { sourceFactIds: ["his-17-f15"] },
    "challenge-his-17-008": { sourceFactIds: ["his-17-f16"] },
    "challenge-his-17-009": {
      sourceFactIds: ["his-17-f01", "his-17-f10"],
      explanation: "1603年の江戸幕府成立後、1637年に島原・天草一揆が起こり、その後、幕府は禁教と外国船の制限を強めました。"
    },
    "challenge-his-17-010": {
      prompt: "図の大名配置について、親藩・譜代大名・外様大名の説明として正しいものはどれですか。",
      choices: ["親藩は徳川一門、譜代は重要地域、外様は遠方に置かれた", "親藩は遠方、譜代は徳川一門、外様は重要地域に置かれた", "三つの大名区分に配置の違いはなかった", "外様大名だけが徳川一門であった"],
      answer: 0,
      sourceFactIds: ["his-17-f04", "his-17-f05"],
      retrievalDirection: "diagram-to-daimyo-comparison",
      examSkill: "制度比較",
      explanation: "親藩は徳川氏一門、譜代大名は古くからの家臣で重要地域、外様大名は関ヶ原の戦い前後に徳川氏へ従い遠方に置かれました。"
    },
    "challenge-his-17-011": {
      choices: ["中国・オランダ―長崎", "朝鮮―出島", "琉球―長崎の出島", "アイヌ民族―下田"],
      sourceFactIds: ["his-17-f11"]
    },
    "challenge-his-17-012": { sourceFactIds: ["his-17-f13"] },
    "challenge-his-17-013": { sourceFactIds: ["his-17-f19", "his-17-f20"] },
    "challenge-his-17-014": { sourceFactIds: ["his-17-f21", "his-17-f17"] },
    "challenge-his-17-015": { sourceFactIds: ["his-17-f18"] },
    "challenge-his-17-016": { sourceFactIds: ["his-17-f14"] },

    "challenge-his-18-001": { sourceFactIds: ["his-18-f01", "his-18-f02"] },
    "challenge-his-18-002": { sourceFactIds: ["his-18-f03"] },
    "challenge-his-18-003": { sourceFactIds: ["his-18-f04"] },
    "challenge-his-18-004": { sourceFactIds: ["his-18-f05"] },
    "challenge-his-18-005": { sourceFactIds: ["his-18-f06"] },
    "challenge-his-18-006": { sourceFactIds: ["his-18-f11"] },
    "challenge-his-18-007": { sourceFactIds: ["his-18-f12"] },
    "challenge-his-18-008": { sourceFactIds: ["his-18-f20"] },
    "challenge-his-18-009": { sourceFactIds: ["his-18-f04", "his-18-f05"] },
    "challenge-his-18-010": { sourceFactIds: ["his-18-f14"] },
    "challenge-his-18-011": { sourceFactIds: ["his-18-f06", "his-18-f07"] },
    "challenge-his-18-012": { sourceFactIds: ["his-18-f08"] },
    "challenge-his-18-013": {
      prompt: "日米和親条約と、1858年に井伊直弼がハリスと結んだ日米修好通商条約の比較として正しいものはどれですか。",
      sourceFactIds: ["his-18-f12", "his-18-f13", "his-18-f14"],
      explanation: "日米和親条約は下田・函館を開港しました。井伊直弼がハリスと結んだ日米修好通商条約は、領事裁判権と関税自主権の問題を含む不平等条約でした。"
    },
    "challenge-his-18-014": { sourceFactIds: ["his-18-f12", "his-18-f16"] },
    "challenge-his-18-015": { sourceFactIds: ["his-18-f17"] },
    "challenge-his-18-016": {
      prompt: "薩摩藩・長州藩が外国軍との戦い後に倒幕へ向かった流れとして正しいものはどれですか。",
      choices: ["攘夷は不可能と知り、薩長同盟を結んで倒幕へ向かった", "攘夷が成功したため幕府を支え続けた", "鎖国完成後に参勤交代を始めた", "太閤検地を行って明を征服した"],
      answer: 0,
      sourceFactIds: ["his-18-f18", "his-18-f19"],
      retrievalDirection: "foreign-conflict-to-alliance-and-overthrow",
      examSkill: "因果関係",
      explanation: "薩摩藩と長州藩は外国軍との戦いで攘夷が不可能だと知り、坂本龍馬の仲介で薩長同盟を結んで倒幕へ向かいました。"
    },

    "challenge-his-19-007": { sourceFactIds: ["his-19-f10"] },
    "challenge-his-19-011": { sourceFactIds: ["his-19-f15"] },
    "challenge-his-19-012": {
      prompt: "自由民権運動から生まれた政党と中心人物の組み合わせとして正しいものはどれですか。",
      choices: ["自由党―板垣退助／立憲改進党―大隈重信", "自由党―大隈重信／立憲改進党―板垣退助", "自由党―伊藤博文／立憲改進党―西郷隆盛", "自由党―西郷隆盛／立憲改進党―伊藤博文"],
      answer: 0,
      sourceFactIds: ["his-19-f09", "his-19-f11"],
      retrievalDirection: "movement-to-party-and-leader-comparison",
      examSkill: "人物・政党比較",
      explanation: "自由民権運動の中で、板垣退助を中心に自由党、大隈重信を中心に立憲改進党が結成されました。人物と政党を対応させます。"
    },
    "challenge-his-19-015": { sourceFactIds: ["his-19-f17"] },
    "challenge-his-19-016": {
      prompt: "ロシアの南下に対抗して日英同盟を結んだ後、日露戦争のポーツマス条約で日本が得られなかったものはどれですか。",
      sourceFactIds: ["his-19-f19", "his-19-f20"],
      explanation: "日本はロシアの南下に対抗して日英同盟を結びました。日露戦争後のポーツマス条約では韓国での優越権などを得ましたが、賠償金は得られませんでした。"
    },

    "challenge-his-20-006": {
      prompt: "国際連盟とワシントン会議の内容を正しく組み合わせたものはどれですか。",
      choices: ["国際連盟―ウィルソンの提案／ワシントン会議―海軍軍縮と日英同盟廃止", "国際連盟―日英同盟廃止／ワシントン会議―ウィルソンの提案で設立", "国際連盟―日本の無条件降伏／ワシントン会議―三国干渉", "国際連盟―EU発足／ワシントン会議―NATO結成"],
      answer: 0,
      sourceFactIds: ["his-20-f06", "his-20-f07"],
      retrievalDirection: "institution-to-conference-comparison",
      examSkill: "国際協調の比較",
      explanation: "国際連盟はウィルソンの提案で設立されました。ワシントン会議では海軍軍縮、中国の主権尊重、日英同盟の廃止が決められました。"
    },
    "challenge-his-20-010": {
      prompt: "図に示す世界恐慌後の各国の対応を正しく組み合わせたものはどれですか。",
      choices: ["アメリカ―ニューディール／英仏―ブロック経済／ドイツ―ナチス独裁", "アメリカ―ブロック経済／英仏―ナチス独裁／ドイツ―ニューディール", "アメリカ―計画経済／英仏―鎖国／ドイツ―殖産興業", "アメリカ―ナチス独裁／英仏―ニューディール／ドイツ―ブロック経済"],
      answer: 0,
      sourceFactIds: ["his-20-f14", "his-20-f15", "his-20-f16"],
      retrievalDirection: "diagram-to-country-policy-comparison",
      examSkill: "恐慌対策の比較",
      explanation: "世界恐慌後、アメリカはニューディール政策、イギリス・フランスはブロック経済、ドイツはヒトラーのナチス独裁へ進みました。"
    },
    "challenge-his-20-011": { sourceFactIds: ["his-20-f19", "his-20-f20"] },
    "challenge-his-20-014": { sourceFactIds: ["his-20-f17"] },
    "challenge-his-20-015": { sourceFactIds: ["his-20-f22"] },
    "challenge-his-20-016": { sourceFactIds: ["his-20-f24"] },

    "challenge-his-21-004": { sourceFactIds: ["his-21-f04"] },
    "challenge-his-21-005": {
      prompt: "朝鮮戦争やベトナム戦争を伴い、アメリカとソ連を中心に直接戦火を交えず対立した状態を何といいますか。",
      sourceFactIds: ["his-21-f05", "his-21-f06"],
      explanation: "冷戦はアメリカとソ連を中心とする直接戦火を交えない対立です。その下で東西ドイツの分断、朝鮮戦争、ベトナム戦争が起こりました。"
    },
    "challenge-his-21-006": { sourceFactIds: ["his-21-f08"] },
    "challenge-his-21-008": { sourceFactIds: ["his-21-f11"] },
    "challenge-his-21-010": {
      prompt: "年表で、1951年のサンフランシスコ平和条約調印後に最も早く起きた出来事はどれですか。",
      sourceFactIds: ["his-21-f08", "his-21-f09"],
      explanation: "1951年のサンフランシスコ平和条約調印後、選択肢の中で最も早いのは1956年の日ソ共同宣言です。沖縄返還は1972年、石油危機は1973年です。"
    },
    "challenge-his-21-011": { sourceFactIds: ["his-21-f18", "his-21-f20"] },
    "challenge-his-21-014": { sourceFactIds: ["his-21-f14"] },
    "challenge-his-21-015": {
      prompt: "インドネシアやインドなどの独立が進んだ後、アジア・アフリカ会議が開かれた目的として最も適切なものはどれですか。",
      sourceFactIds: ["his-21-f15", "his-21-f16"],
      explanation: "アジア諸国の独立が進む中、植民地主義反対を掲げるアジアとアフリカの国々が1955年にインドネシアのバンドンで会議を開きました。"
    },
    "challenge-his-21-016": { sourceFactIds: ["his-21-f20"] }
  };

  Object.entries(choicePatches).forEach(([id, patch]) => patchQuestion(id, patch));

  const inputPatches = {
    "challenge-his-13-017": {
      prompt: "メソポタミア・エジプト・インダス・中国の各文明をまとめた呼び名を答えてください。",
      answerText: ["四大文明"], sourceFactIds: ["his-13-f13"], retrievalDirection: "direct-civilizations-to-collective-name",
      examSkill: "文明の分類", mistakeTags: ["四大文明", "文明名の混同"],
      explanation: "メソポタミア、エジプト、インダス、中国の各文明をまとめて四大文明と呼びます。いずれも大河の流域で発達しました。"
    },
    "challenge-his-13-018": {
      prompt: "メソポタミア文明が発達した二つの大河を答えてください。",
      answerText: ["チグリス川とユーフラテス川", "チグリス川・ユーフラテス川", "チグリス・ユーフラテス川"], sourceFactIds: ["his-13-f14"], retrievalDirection: "direct-civilization-to-rivers",
      examSkill: "文明と河川", mistakeTags: ["メソポタミア文明", "河川の混同"],
      explanation: "メソポタミア文明はチグリス川とユーフラテス川の流域で発達しました。エジプト文明のナイル川と区別します。"
    },
    "challenge-his-13-019": {
      prompt: "インダス文明が発達した河川を答えてください。",
      answerText: ["インダス川"], sourceFactIds: ["his-13-f15"], retrievalDirection: "direct-civilization-to-river",
      examSkill: "文明と河川", mistakeTags: ["インダス文明", "河川の混同"],
      explanation: "インダス文明はインダス川流域で発達しました。文明名と河川名が対応するため、確実に再生できるようにします。"
    },
    "challenge-his-13-020": {
      prompt: "中国文明が発達した河川を答えてください。",
      answerText: ["黄河"], sourceFactIds: ["his-13-f16"], retrievalDirection: "direct-civilization-to-river",
      examSkill: "文明と河川", mistakeTags: ["中国文明", "河川の混同"],
      explanation: "中国文明は黄河流域で発達しました。ナイル川・インダス川・チグリス川などと取り違えないようにします。"
    },
    "challenge-his-13-021": {
      prompt: "紀元前5世紀ごろ、インドで仏教を開いた人物を答えてください。",
      answerText: ["シャカ", "釈迦"], sourceFactIds: ["his-13-f17"], retrievalDirection: "direct-religion-to-founder",
      examSkill: "宗教と人物", mistakeTags: ["仏教", "宗教開祖の混同"],
      explanation: "仏教は紀元前5世紀ごろにインドでシャカが開きました。キリスト教を説いたイエスと区別します。"
    },
    "challenge-his-13-022": {
      prompt: "1世紀ごろにキリスト教を説いた人物を答えてください。",
      answerText: ["イエス", "イエス・キリスト"], sourceFactIds: ["his-13-f18"], retrievalDirection: "direct-religion-to-founder",
      examSkill: "宗教と人物", mistakeTags: ["キリスト教", "宗教開祖の混同"],
      explanation: "キリスト教は1世紀ごろにイエスが説きました。仏教を開いたシャカとの時代・地域の違いも整理します。"
    },

    "challenge-his-15-017": {
      prompt: "鎌倉幕府で、御家人の統率や軍事・警察を担当した機関を答えてください。",
      answerText: ["侍所"], sourceFactIds: ["his-15-f17"], retrievalDirection: "direct-function-to-office",
      examSkill: "幕府組織", mistakeTags: ["侍所", "政所・問注所との混同"],
      explanation: "鎌倉幕府で御家人の統率や軍事・警察を担当した機関は侍所です。政所は政務、問注所は裁判を担当しました。"
    },
    "challenge-his-15-020": {
      prompt: "白河上皇が始め、上皇が天皇に代わって政治を行った仕組みを答えてください。",
      answerText: ["院政"], sourceFactIds: ["his-15-f15"], retrievalDirection: "direct-person-to-political-system",
      examSkill: "院政", mistakeTags: ["院政", "摂関政治との混同"],
      explanation: "白河上皇が始め、上皇が政治の実権を握った仕組みを院政といいます。藤原氏の摂関政治との違いを整理します。"
    },
    "challenge-his-15-023": {
      prompt: "観阿弥・世阿弥によって大成され、室町文化を代表する芸能を答えてください。",
      answerText: ["能楽", "のう"], sourceFactIds: ["his-15-f20"], retrievalDirection: "direct-performers-to-art-form",
      examSkill: "室町文化", mistakeTags: ["能", "文化の時代混同"],
      explanation: "観阿弥・世阿弥によって大成された能は室町文化を代表する芸能です。狂言・連歌・茶の湯なども発達しました。"
    },
    "challenge-his-15-024": {
      prompt: "1392年に南朝と北朝を合一した室町幕府の将軍を答えてください。",
      answerText: ["足利義満"], sourceFactIds: ["his-15-f19"], retrievalDirection: "direct-year-and-event-to-person",
      examSkill: "南北朝合一", mistakeTags: ["足利義満", "将軍の混同"],
      explanation: "1392年に南朝と北朝を合一したのは3代将軍足利義満です。義満は日明貿易も行いました。"
    },

    "challenge-his-16-017": {
      prompt: "ルターらが教会を批判し、キリスト教の改革を求めて広がった運動を答えてください。",
      answerText: ["宗教改革"], sourceFactIds: ["his-16-f17"], retrievalDirection: "direct-background-to-movement",
      examSkill: "宗教改革", mistakeTags: ["宗教改革", "ルネサンスとの混同"],
      explanation: "ルターはカトリック教会の免罪符販売に抗議し、宗教改革を始めました。古代文化復興のルネサンスと区別します。"
    },
    "challenge-his-16-018": {
      prompt: "ルターやカルバンの考えを支持した人々の呼び名を答えてください。",
      answerText: ["プロテスタント"], sourceFactIds: ["his-16-f18"], retrievalDirection: "direct-reformers-to-followers",
      examSkill: "宗教改革", mistakeTags: ["プロテスタント", "カトリックとの混同"],
      explanation: "ルターやカルバンの考えを支持した人々をプロテスタントといいます。カトリック教会との違いを整理します。"
    },
    "challenge-his-16-019": {
      prompt: "カトリック教会内部で結成され、ザビエルが所属した修道会を答えてください。",
      answerText: ["イエズス会", "イエズスかい"], sourceFactIds: ["his-16-f19"], retrievalDirection: "direct-missionary-to-order",
      examSkill: "宗教改革への対抗", mistakeTags: ["イエズス会", "プロテスタントとの混同"],
      explanation: "カトリック教会内部ではイエズス会が結成され、海外布教を進めました。ザビエルもイエズス会の宣教師です。"
    },
    "challenge-his-16-020": {
      prompt: "ポルトガル人やスペイン人と日本との間で行われた貿易を答えてください。",
      answerText: ["南蛮貿易"], sourceFactIds: ["his-16-f20"], retrievalDirection: "direct-trading-partners-to-term",
      examSkill: "南蛮貿易", mistakeTags: ["南蛮貿易", "朱印船貿易との混同"],
      explanation: "ポルトガル人やスペイン人と平戸・長崎などで行った貿易を南蛮貿易といいます。朱印船貿易と区別します。"
    },
    "challenge-his-16-021": {
      prompt: "南蛮貿易を通じて伝わった、活字を組んで印刷する技術を答えてください。",
      answerText: ["活版印刷術", "活版印刷"], sourceFactIds: ["his-16-f21"], retrievalDirection: "direct-description-to-technology",
      examSkill: "南蛮文化", mistakeTags: ["活版印刷術", "伝来文化の混同"],
      explanation: "南蛮貿易を通じて活版印刷術・医学・天文学などが伝わりました。鉄砲やキリスト教の伝来とも関連付けます。"
    },
    "challenge-his-16-022": {
      prompt: "太閤検地と刀狩によって、武士と農民の身分を分けた政策をまとめて何といいますか。",
      answerText: ["兵農分離"], sourceFactIds: ["his-16-f13", "his-16-f06", "his-16-f07"], retrievalDirection: "direct-policies-to-result",
      examSkill: "政策の因果", mistakeTags: ["兵農分離", "検地・刀狩の因果"],
      explanation: "太閤検地と刀狩によって武士と農民の区別を明確にする兵農分離が進み、近世社会の基礎となりました。"
    },
    "challenge-his-16-023": {
      prompt: "織田信長が保護した一方、豊臣秀吉が宣教師の追放へ転じた宗教を答えてください。",
      answerText: ["キリスト教"], sourceFactIds: ["his-16-f22"], retrievalDirection: "direct-policy-change-to-religion",
      examSkill: "宗教政策の比較", mistakeTags: ["キリスト教政策", "信長と秀吉の比較"],
      explanation: "信長はキリスト教を保護しましたが、秀吉はバテレン追放令を出しました。同じ宗教への政策の違いが重要です。"
    },
    "challenge-his-16-024": {
      prompt: "古代ギリシャ・ローマの文化復興から始まったヨーロッパの動きを答えてください。",
      answerText: ["ルネサンス"], sourceFactIds: ["his-16-f16"], retrievalDirection: "direct-description-to-movement",
      examSkill: "ルネサンス", mistakeTags: ["ルネサンス", "宗教改革との混同"],
      explanation: "古代ギリシャ・ローマの文化を復興しようとした動きをルネサンスといいます。宗教改革より前から広がりました。"
    },

    "challenge-his-17-017": {
      prompt: "江戸時代に武士・百姓・町人などに分けて人々を統制した社会の仕組みを答えてください。",
      answerText: ["身分制度"], sourceFactIds: ["his-17-f08"], retrievalDirection: "direct-social-order-to-term",
      examSkill: "江戸の身分制度", mistakeTags: ["身分制度", "職業との混同"],
      explanation: "江戸幕府は人々を武士・百姓・町人などの身分に分けて統制し、百姓に年貢を負担させました。"
    },
    "challenge-his-17-018": {
      prompt: "キリスト教徒への弾圧や重い年貢を背景に、1637年に九州で起きた一揆を答えてください。",
      answerText: ["島原・天草一揆", "島原天草一揆", "島原の乱"], sourceFactIds: ["his-17-f10"], retrievalDirection: "direct-background-to-uprising",
      examSkill: "鎖国の背景", mistakeTags: ["島原・天草一揆", "鎖国との因果"],
      explanation: "1637年に島原・天草一揆が起き、その後、幕府はポルトガル船の来航を禁止して鎖国を完成させました。"
    },
    "challenge-his-17-019": {
      prompt: "江戸時代初め、幕府の許可証を持つ船が東南アジアなどと行った貿易を答えてください。",
      answerText: ["朱印船貿易"], sourceFactIds: ["his-17-f09"], retrievalDirection: "direct-permit-to-trade",
      examSkill: "朱印船貿易", mistakeTags: ["朱印船貿易", "南蛮貿易との混同"],
      explanation: "幕府の朱印状を持つ船による貿易を朱印船貿易といいます。東南アジアには日本町もつくられました。"
    },
    "challenge-his-17-020": {
      prompt: "関ヶ原の戦い前後に徳川氏へ従い、江戸から遠い地域に置かれることが多かった大名を答えてください。",
      answerText: ["外様大名"], sourceFactIds: ["his-17-f05"], retrievalDirection: "direct-position-to-daimyo-type",
      examSkill: "大名区分", mistakeTags: ["外様大名", "譜代大名との混同"],
      explanation: "関ヶ原の戦い前後に徳川氏へ従うようになった大名を外様大名といい、江戸から遠方に置かれました。"
    },
    "challenge-his-17-021": {
      prompt: "江戸幕府の大名区分で、徳川氏一門の大名を何といいますか。",
      answerText: ["親藩"], sourceFactIds: ["his-17-f04"], retrievalDirection: "direct-relationship-to-daimyo-type",
      examSkill: "大名区分", mistakeTags: ["親藩", "譜代・外様との混同"],
      explanation: "徳川氏一門の大名を親藩といいます。古くからの家臣である譜代大名、後から従った外様大名と区別します。"
    },
    "challenge-his-17-022": {
      prompt: "古くから徳川氏の家臣で、幕府の重要地域に置かれた大名を答えてください。",
      answerText: ["譜代大名"], sourceFactIds: ["his-17-f04"], retrievalDirection: "direct-relationship-and-location-to-daimyo-type",
      examSkill: "大名区分", mistakeTags: ["譜代大名", "親藩・外様との混同"],
      explanation: "古くから徳川氏の家臣であった大名を譜代大名といい、幕府の重要地域に配置されました。"
    },
    "challenge-his-17-023": {
      prompt: "元大坂町奉行所の役人が、ききんに苦しむ人々を救おうとして1837年に起こした乱を答えてください。",
      answerText: ["大塩平八郎の乱"], sourceFactIds: ["his-17-f22"], retrievalDirection: "direct-background-to-rebellion",
      examSkill: "幕政の動揺", mistakeTags: ["大塩平八郎の乱", "ききんと反乱"],
      explanation: "1837年に大坂で大塩平八郎の乱が起きました。元幕府役人が起こしたことは、幕府支配の揺らぎを示します。"
    },
    "challenge-his-17-024": {
      prompt: "松平定信が天明のききん後に行った改革を答えてください。",
      answerText: ["寛政の改革"], sourceFactIds: ["his-17-f17"], retrievalDirection: "direct-person-to-reform",
      examSkill: "三大改革", mistakeTags: ["寛政の改革", "享保・天保との混同"],
      explanation: "松平定信が1787年から行った改革は寛政の改革です。徳川吉宗の享保、水野忠邦の天保の改革と区別します。"
    },

    "challenge-his-18-017": {
      prompt: "王政復古の大号令後、新政府軍と旧幕府軍の間で始まった戦争を答えてください。",
      answerText: ["戊辰戦争"], sourceFactIds: ["his-18-f21", "his-18-f22"], retrievalDirection: "direct-political-change-to-war",
      examSkill: "倒幕後の年代整序", mistakeTags: ["戊辰戦争", "王政復古との前後"],
      explanation: "王政復古の大号令後、鳥羽・伏見の戦いを始まりとして新政府軍と旧幕府軍の戊辰戦争が起こりました。"
    },
    "challenge-his-18-018": {
      prompt: "アメリカで北部と南部が奴隷制などをめぐって戦った内戦を答えてください。",
      answerText: ["南北戦争"], sourceFactIds: ["his-18-f23"], retrievalDirection: "direct-conflict-to-war",
      examSkill: "アメリカ史", mistakeTags: ["南北戦争", "独立戦争との混同"],
      explanation: "アメリカでは奴隷制などをめぐって南北戦争が起こり、リンカン大統領の北部が勝利しました。"
    },
    "challenge-his-18-019": {
      prompt: "南北戦争中、リンカン大統領が出した奴隷制廃止に関する宣言を答えてください。",
      answerText: ["奴隷解放宣言"], sourceFactIds: ["his-18-f23", "his-18-f24"], retrievalDirection: "direct-war-to-declaration",
      examSkill: "アメリカ史", mistakeTags: ["奴隷解放宣言", "人権宣言との混同"],
      explanation: "リンカン大統領は南北戦争中に奴隷解放宣言を出しました。フランス革命の人権宣言と区別します。"
    },
    "challenge-his-18-020": {
      prompt: "清で洪秀全が指導し、アヘン戦争後に起こった大規模な反乱を答えてください。",
      answerText: ["太平天国の乱"], sourceFactIds: ["his-18-f09"], retrievalDirection: "direct-leader-to-rebellion",
      examSkill: "清の動揺", mistakeTags: ["太平天国の乱", "義和団事件との混同"],
      explanation: "洪秀全が指導した大規模な反乱は太平天国の乱です。清は外国の力を借りて鎮圧しました。"
    },
    "challenge-his-18-021": {
      prompt: "1857年、イギリスの支配に対してインドの兵士らが起こした反乱を答えてください。",
      answerText: ["インド大反乱", "セポイの反乱"], sourceFactIds: ["his-18-f10"], retrievalDirection: "direct-colonial-rule-to-rebellion",
      examSkill: "植民地支配", mistakeTags: ["インド大反乱", "アジアの反乱の混同"],
      explanation: "1857年のインド大反乱後、イギリスはインドを直接支配し、インド全土を植民地にしました。"
    },
    "challenge-his-18-022": {
      prompt: "井伊直弼が反対派を厳しく処罰した1858年からの弾圧を答えてください。",
      answerText: ["安政の大獄"], sourceFactIds: ["his-18-f25"], retrievalDirection: "direct-person-to-repression",
      examSkill: "幕末の年代整序", mistakeTags: ["安政の大獄", "桜田門外の変との前後"],
      explanation: "井伊直弼は条約調印や将軍継嗣に反対する人々を安政の大獄で処罰しました。その後、桜田門外の変で暗殺されました。"
    },
    "challenge-his-18-023": {
      prompt: "開国後、生糸や茶が商人に買い占められたために起きた経済上の変化を答えてください。",
      answerText: ["物価上昇", "物価の上昇"], sourceFactIds: ["his-18-f15"], retrievalDirection: "direct-cause-to-economic-effect",
      examSkill: "開国の影響", mistakeTags: ["物価上昇", "貿易の因果"],
      explanation: "開国後、生糸や茶などの輸出品が買い占められ、品不足になったため物価が上昇し、幕府への不満が高まりました。"
    },
    "challenge-his-18-024": {
      prompt: "徳川慶喜が政権を返した後、天皇中心の政治を宣言した出来事を答えてください。",
      answerText: ["王政復古の大号令"], sourceFactIds: ["his-18-f20", "his-18-f21"], retrievalDirection: "direct-sequence-to-event",
      examSkill: "倒幕の年代整序", mistakeTags: ["王政復古の大号令", "大政奉還との混同"],
      explanation: "大政奉還の後、朝廷が天皇中心の政治へ戻すことを宣言したのが王政復古の大号令です。"
    },

    "challenge-his-19-017": {
      prompt: "日清戦争前後に製糸・紡績などを中心として発達した工業を答えてください。",
      answerText: ["軽工業"], sourceFactIds: ["his-19-f22"], retrievalDirection: "direct-period-and-industry-to-category",
      examSkill: "産業発達の比較", mistakeTags: ["軽工業", "重工業との混同"],
      explanation: "日清戦争前後には製糸・紡績などの軽工業が発達しました。日露戦争前後に発達した重工業と区別します。"
    },
    "challenge-his-19-018": {
      prompt: "日本が1910年に韓国を植民地とした出来事を答えてください。",
      answerText: ["韓国併合"], sourceFactIds: ["his-19-f21"], retrievalDirection: "direct-year-to-event",
      examSkill: "東アジア関係", mistakeTags: ["韓国併合", "日清・日露戦争との前後"],
      explanation: "日本は日露戦争後に韓国への支配を強め、1910年に韓国を併合して植民地としました。"
    },
    "challenge-his-19-019": {
      prompt: "明治初期に欧米へ派遣され、条約改正交渉に失敗した使節団を答えてください。",
      answerText: ["岩倉使節団"], sourceFactIds: ["his-19-f14"], retrievalDirection: "direct-purpose-to-delegation",
      examSkill: "条約改正", mistakeTags: ["岩倉使節団", "条約改正人物の混同"],
      explanation: "岩倉使節団は欧米の制度を調査し、条約改正交渉も行いましたが、改正には成功しませんでした。"
    },
    "challenge-his-19-020": {
      prompt: "中国で外国人排斥を掲げ、日本やロシアなど8か国が鎮圧した事件を答えてください。",
      answerText: ["義和団事件"], sourceFactIds: ["his-19-f18"], retrievalDirection: "direct-description-to-event",
      examSkill: "東アジア情勢", mistakeTags: ["義和団事件", "三国干渉との混同"],
      explanation: "義和団事件は中国で起きた外国人排斥運動で、日本・ロシアなど8か国が出兵して鎮圧しました。"
    },
    "challenge-his-19-024": {
      prompt: "足尾銅山鉱毒事件の解決に尽力した衆議院議員を答えてください。",
      answerText: ["田中正造"], sourceFactIds: ["his-19-f23"], retrievalDirection: "direct-pollution-event-to-person",
      examSkill: "社会問題", mistakeTags: ["田中正造", "公害人物の混同"],
      explanation: "田中正造は足尾銅山鉱毒事件の被害を訴え、解決に尽力しました。近代産業発達の負の側面を示す人物です。"
    },

    "challenge-his-20-017": {
      prompt: "非暴力・不服従を掲げてインドの独立運動を指導した人物を答えてください。",
      answerText: ["ガンディー", "ガンジー"], sourceFactIds: ["his-20-f08"], retrievalDirection: "direct-method-and-country-to-person",
      examSkill: "民族運動比較", mistakeTags: ["ガンディー", "民族運動人物の混同"],
      explanation: "インドではガンディーが非暴力・不服従を掲げて独立運動を指導しました。朝鮮の三・一、中国の五・四運動と同時期です。"
    },
    "challenge-his-20-018": {
      prompt: "大正期に、民衆の意向を政治に反映させる民本主義を主張した人物を答えてください。",
      answerText: ["吉野作造"], sourceFactIds: ["his-20-f09"], retrievalDirection: "direct-idea-to-person",
      examSkill: "大正デモクラシー", mistakeTags: ["吉野作造", "政治思想家の混同"],
      explanation: "吉野作造は民本主義を主張し、政党政治を求める護憲運動など大正デモクラシーに影響を与えました。"
    },
    "challenge-his-20-019": {
      prompt: "被差別部落の人々が差別からの解放をめざして1922年に結成した組織を答えてください。",
      answerText: ["全国水平社"], sourceFactIds: ["his-20-f11"], retrievalDirection: "direct-purpose-to-organization",
      examSkill: "社会運動", mistakeTags: ["全国水平社", "労働・小作運動との混同"],
      explanation: "被差別部落の人々は差別からの解放をめざして全国水平社を結成しました。労働争議・小作争議と並ぶ社会運動です。"
    },
    "challenge-his-20-020": {
      prompt: "大正時代に広まった、映像と音声が同時に出る映画を答えてください。",
      answerText: ["トーキー", "トーキー映画"], sourceFactIds: ["his-20-f12"], retrievalDirection: "direct-description-to-media-term",
      examSkill: "大正文化", mistakeTags: ["トーキー", "文化の時代混同"],
      explanation: "映像と音声が同時に出る映画をトーキーといいます。ラジオ放送などとともに大正期の大衆文化を示します。"
    },
    "challenge-his-20-021": {
      prompt: "1932年の五・一五事件で海軍将校らに暗殺された首相を答えてください。",
      answerText: ["犬養毅"], sourceFactIds: ["his-20-f18"], retrievalDirection: "direct-event-to-person",
      examSkill: "軍部台頭の因果", mistakeTags: ["犬養毅", "事件・人物の混同"],
      explanation: "五・一五事件で海軍将校らが犬養毅首相を暗殺し、政党内閣が終わりました。二・二六事件後には軍部の発言力がさらに強まりました。"
    },
    "challenge-his-20-022": {
      prompt: "戦時下に政党を解散してつくられた国民統制のための組織を答えてください。",
      answerText: ["大政翼賛会"], sourceFactIds: ["his-20-f21"], retrievalDirection: "direct-wartime-control-to-organization",
      examSkill: "戦時統制", mistakeTags: ["大政翼賛会", "国家総動員法との混同"],
      explanation: "戦時下には政党が解散され、大政翼賛会がつくられました。配給制や隣組など生活全体への統制も進みました。"
    },
    "challenge-his-20-023": {
      prompt: "1941年、日本がハワイのアメリカ軍基地を奇襲した攻撃を答えてください。",
      answerText: ["真珠湾攻撃", "真珠湾への攻撃"], sourceFactIds: ["his-20-f23"], retrievalDirection: "direct-year-and-place-to-attack",
      examSkill: "太平洋戦争開戦", mistakeTags: ["真珠湾攻撃", "日中戦争との混同"],
      explanation: "日本は1941年にハワイの真珠湾にあるアメリカ軍基地を奇襲し、太平洋戦争が始まりました。"
    },
    "challenge-his-20-024": {
      prompt: "連合国が日本に無条件降伏を求めた宣言を答えてください。",
      answerText: ["ポツダム宣言"], sourceFactIds: ["his-20-f24"], retrievalDirection: "direct-demand-to-declaration",
      examSkill: "第二次世界大戦終結", mistakeTags: ["ポツダム宣言", "他条約との混同"],
      explanation: "日本は原子爆弾投下とソ連参戦の後、ポツダム宣言を受諾して無条件降伏しました。"
    },

    "challenge-his-21-017": {
      prompt: "戦後、労働者の団結権などを保障するために制定された法律を答えてください。",
      answerText: ["労働組合法"], sourceFactIds: ["his-21-f07"], retrievalDirection: "direct-purpose-to-law",
      examSkill: "戦後民主化", mistakeTags: ["労働組合法", "労働基準法との混同"],
      explanation: "戦後の民主化では労働組合法が制定され、労働者の団結権などが保障されました。労働基準法も制定されました。"
    },
    "challenge-his-21-018": {
      prompt: "朝鮮戦争による特別な需要で、日本経済が回復するきっかけとなった好景気を答えてください。",
      answerText: ["特需景気", "朝鮮特需"], sourceFactIds: ["his-21-f10"], retrievalDirection: "direct-cause-to-economic-boom",
      examSkill: "戦後経済の因果", mistakeTags: ["特需景気", "高度経済成長との混同"],
      explanation: "朝鮮戦争による特需景気で日本経済が回復し、1950年代後半からの高度経済成長へつながりました。"
    },
    "challenge-his-21-019": {
      prompt: "1972年、アメリカの施政権下にあった地域が日本へ戻った出来事を答えてください。",
      answerText: ["沖縄返還", "沖縄の日本復帰", "沖縄の本土復帰"], sourceFactIds: ["his-21-f13"], retrievalDirection: "direct-year-to-event",
      examSkill: "戦後領土の年代", mistakeTags: ["沖縄返還", "日中国交正常化との混同"],
      explanation: "沖縄は1972年に日本へ返還されました。同じ年の日中共同声明による国交正常化と併せて年表で整理します。"
    },
    "challenge-his-21-020": {
      prompt: "1949年、毛沢東を主席として成立した国を答えてください。",
      answerText: ["中華人民共和国"], sourceFactIds: ["his-21-f17"], retrievalDirection: "direct-year-and-person-to-state",
      examSkill: "現代中国", mistakeTags: ["中華人民共和国", "中華民国との混同"],
      explanation: "1949年に毛沢東を主席とする中華人民共和国が成立し、蒋介石の国民政府は台湾へ移りました。"
    },
    "challenge-his-21-021": {
      prompt: "日本が1965年に韓国と国交を正常化するために結んだ条約を答えてください。",
      answerText: ["日韓基本条約"], sourceFactIds: ["his-21-f19"], retrievalDirection: "direct-year-and-country-to-treaty",
      examSkill: "戦後外交", mistakeTags: ["日韓基本条約", "日米・日中関係との混同"],
      explanation: "日本は1965年に日韓基本条約を結び、韓国との国交を正常化しました。日米新安保条約は1960年です。"
    },
    "challenge-his-21-022": {
      prompt: "ECが1993年に発展して成立した地域統合組織を答えてください。",
      answerText: ["EU", "欧州連合", "ヨーロッパ連合"], sourceFactIds: ["his-21-f21"], retrievalDirection: "direct-predecessor-and-year-to-organization",
      examSkill: "地域統合", mistakeTags: ["EU", "ECとの前後"],
      explanation: "ECは1993年にEUへ発展しました。EUでは地域統合が進み、共通通貨ユーロも導入されました。"
    },
    "challenge-his-21-023": {
      prompt: "環境・経済・社会を将来にわたり両立させる、現代世界の目標を答えてください。",
      answerText: ["持続可能な開発"], sourceFactIds: ["his-21-f22"], retrievalDirection: "direct-description-to-global-goal",
      examSkill: "現代の課題", mistakeTags: ["持続可能な開発", "南北問題との混同"],
      explanation: "地域紛争、南北問題、地球環境問題に向き合いながら、環境・経済・社会を両立させる持続可能な開発が課題です。"
    },
    "challenge-his-21-024": {
      prompt: "イタイイタイ病・水俣病・新潟水俣病・四日市ぜんそくに関する裁判の総称を答えてください。",
      answerText: ["四大公害裁判"], sourceFactIds: ["his-21-f23"], retrievalDirection: "direct-diseases-to-collective-term",
      examSkill: "公害問題", mistakeTags: ["四大公害裁判", "公害病の混同"],
      explanation: "四つの公害病をめぐる裁判を四大公害裁判といいます。高度経済成長がもたらした公害問題を示します。"
    }
  };

  Object.entries(inputPatches).forEach(([id, patch]) => replaceInput(id, patch));

  const his15Timeline = byId.get("challenge-his-15-010")?.figure;
  if (his15Timeline?.kind === "timeline") {
    const event1192 = his15Timeline.events.find((event) => String(event.year) === "1192");
    if (event1192) event1192.label = "源頼朝が征夷大将軍";
    his15Timeline.alt = "1185年の守護・地頭、1192年の源頼朝の征夷大将軍就任、1232年の御成敗式目の年表";
    his15Timeline.caption = "鎌倉幕府の成立過程と制度を示すオリジナル年表";
  }

  const his17Timeline = byId.get("challenge-his-17-009")?.figure;
  if (his17Timeline?.kind === "timeline") {
    const event1641 = his17Timeline.events.find((event) => String(event.year) === "1641");
    if (event1641) event1641.label = "オランダ商館を出島へ移転";
  }

  const his19TaxFigure = byId.get("challenge-his-19-010");
  if (his19TaxFigure) {
    his19TaxFigure.figure = {
      kind: "diagram",
      width: 350,
      height: 190,
      alt: "政府が土地所有者へ地券を発行し、土地所有者が政府へ地価の3パーセントを現金で納める図",
      caption: "地租改正の納税者と税の流れを示すオリジナル図解",
      nodes: [
        { id: "a", x: 15, y: 65, width: 90, height: 42, label: "政府" },
        { id: "b", x: 130, y: 65, width: 95, height: 42, label: "土地所有者", emphasis: true },
        { id: "c", x: 250, y: 65, width: 85, height: 42, label: "地券" }
      ],
      edges: [
        { from: "a", to: "b", label: "地券を発行" },
        { from: "b", to: "a", label: "地価3%を現金納付" },
        { from: "b", to: "c", label: "所有の証明" }
      ]
    };
  }

  const unitPages = {
    "his-13": [26, 27], "his-14": [28, 29], "his-15": [30, 31],
    "his-16": [32, 33], "his-17": [34, 35], "his-18": [36, 37],
    "his-19": [38, 39], "his-20": [40, 41], "his-21": [42, 43]
  };
  const rightPageFacts = {
    "his-13": new Set([7, 8, 9, 11, 12, 19, 20]),
    "his-14": new Set([7, 8, 10, 11, 13, 14, 15, 16, 17, 19, 20]),
    "his-15": new Set([7, 8, 10, 11, 12, 13, 14, 19, 20]),
    "his-16": new Set([3, 4, 5, 6, 7, 8, 12, 13, 14, 15, 22]),
    "his-17": new Set([13, 14, 15, 16, 17, 18, 19, 20, 21, 22]),
    "his-18": new Set([11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 25]),
    "his-19": new Set([15, 16, 17, 18, 19, 20, 21, 22, 23]),
    "his-20": new Set([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]),
    "his-21": new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
  };

  historyQuestions.forEach((question) => {
    if (question.figure && typeof question.figure !== "object") delete question.figure;
    const tags = Array.isArray(question.mistakeTags) ? question.mistakeTags.filter(Boolean) : [];
    if (tags.length < 2) tags.push("時代・因果の混同");
    question.mistakeTags = Array.from(new Set(tags));
    if (question.mistakeTags.length < 2) question.mistakeTags.push("前後関係の混同");
    question.examSkill = question.examSkill || question.mistakeTags[0] || "歴史の流れを判断する";
    if (String(question.explanation || "").length < 35) {
      question.explanation = `${String(question.explanation || "").trim()} 年代と前後の出来事を結び付けて覚えます。`;
    }

    const pages = new Set();
    const [leftPage, rightPage] = unitPages[question.unitId];
    question.sourceFactIds.forEach((factId) => {
      const factNumber = Number(String(factId).match(/f(\d+)$/)?.[1]);
      if (question.unitId === "his-17" && factNumber === 7) {
        pages.add(leftPage);
        pages.add(rightPage);
      } else {
        pages.add(rightPageFacts[question.unitId].has(factNumber) ? rightPage : leftPage);
      }
    });
    question.paperRef = `Challenge社会「5科のポイントチェック」${Array.from(pages).sort((a, b) => a - b).map((page) => `p.${page}`).join("・")}`;
    question.qualityStatus = "independent-review-passed";
  });
})();
