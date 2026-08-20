(function () {
  "use strict";

  const PACK_ID = "eiken-grade4";
  const SOURCE_TAG = "eiken-grade4-original-2026-08";
  const questions = [];

  function add(spec) {
    const number = questions.length + 1;
    const choices = [spec.correct, ...spec.distractors];
    const shift = (number - 1) % 4;
    const rotated = choices.slice(shift).concat(choices.slice(0, shift));
    const tierMeta = {
      core: { priority: "S", difficulty: "L1 基礎復帰", stage: "語彙・文法", formatTag: "短問" },
      challenge: { priority: "A", difficulty: "L2 県立標準", stage: "会話・語順・聞き取り", formatTag: "長文・会話" },
      final: { priority: "A", difficulty: "L2 県立標準", stage: "長文・聞き取り", formatTag: "読解・記述" }
    }[spec.tier];
    const question = {
      id: `eiken4-${String(number).padStart(3, "0")}`,
      type: "choice",
      childIds: ["child-2"],
      packId: PACK_ID,
      contentVersion: 1,
      cornerId: spec.cornerId,
      unitId: spec.cornerId,
      tier: spec.tier,
      subject: "英語",
      unit: spec.unit,
      sourceTag: SOURCE_TAG,
      qualityStatus: "content-audited",
      contentStatus: "content-final",
      retrievalDirection: spec.retrievalDirection || "context-to-expression",
      examSkill: spec.skill,
      mistakeTags: spec.tags || [spec.skill, "文脈の見落とし"],
      variantGroup: spec.variantGroup || `eiken4-${spec.cornerId}-${number}`,
      prompt: spec.prompt,
      choices: rotated,
      answer: (4 - shift) % 4,
      explanation: spec.explanation,
      ...tierMeta
    };
    if (spec.passage) question.passage = spec.passage;
    if (spec.audioText) {
      question.formatTag = "長文・会話";
      question.figure = {
        kind: "audio",
        lang: "en-US",
        rate: 0.86,
        audioText: spec.audioText,
        alt: "英検4級形式のオリジナル英語音声を再生するボタン",
        caption: "再生ボタンを押して英語を聞き、答えを選びます。"
      };
    }
    if (spec.passage) question.formatTag = "資料読取";
    questions.push(question);
  }

  const foundation = (prompt, correct, distractors, explanation, skill, tags) => add({
    tier: "core", cornerId: "e4-foundations", unit: "語彙・文法", prompt, correct, distractors, explanation, skill, tags
  });

  foundation("I went to the library to (     ) some books.", "borrow", ["cook", "wash", "close"], "borrow books は「本を借りる」です。図書館へ行った目的に合います。", "基本動詞", ["語彙", "動詞"]);
  foundation("Please be quiet. The baby is (     ).", "sleeping", ["swimming", "writing", "shopping"], "静かにしてほしい理由は、赤ちゃんが眠っているからです。be動詞＋ing形で現在進行形を作ります。", "現在進行形", ["文法", "現在進行形"]);
  foundation("We were hungry, so we went to a (     ).", "restaurant", ["hospital", "library", "station"], "空腹なので食事をする restaurant が文脈に合います。", "場所の語彙", ["語彙", "場所"]);
  foundation("I bought a train (     ) at the station.", "ticket", ["letter", "window", "picture"], "駅で買うものは train ticket「列車の切符」です。", "交通の語彙", ["語彙", "交通"]);
  foundation("My uncle's daughter is my (     ).", "cousin", ["aunt", "mother", "sister"], "おじの娘は自分の cousin「いとこ」です。", "家族の語彙", ["語彙", "家族"]);
  foundation("In Japan, which season comes directly after summer?", "autumn", ["winter", "spring", "January"], "季節は spring, summer, autumn, winter の順なので、summer の直後は autumn です。", "季節の語彙", ["語彙", "季節"]);
  foundation("A doctor usually works at a (     ).", "hospital", ["museum", "bakery", "farm"], "doctor が働く代表的な場所は hospital です。", "職業と場所", ["語彙", "職業"]);
  foundation("Please (     ) your homework before you watch TV.", "finish", ["send", "break", "carry"], "テレビを見る前に宿題を終えるので finish が適切です。", "基本動詞", ["語彙", "動詞"]);
  foundation("I'm thirsty. May I have a glass of (     )?", "water", ["bread", "rice", "cheese"], "thirsty は「のどが渇いた」なので、飲み物の water が合います。", "飲食の語彙", ["語彙", "飲食"]);
  foundation("Ken (     ) goes to school by bus, but today he walked.", "usually", ["tomorrow", "last night", "next year"], "普段はバスだが今日は歩いた、という対比なので usually が適切です。", "頻度の副詞", ["語彙", "副詞"]);
  foundation("Turn (     ) at the bank, and the post office is on your right.", "left", ["busy", "young", "slow"], "道案内では turn left「左へ曲がる」と表します。", "道案内", ["語彙", "道案内"]);
  foundation("Mika is good (     ) playing tennis.", "at", ["to", "for", "from"], "be good at ～ing で「～するのが得意」です。", "熟語", ["熟語", "前置詞"]);
  foundation("I'm looking (     ) my key. Have you seen it?", "for", ["after", "at", "up"], "look for は「探す」という意味です。", "熟語", ["熟語", "句動詞"]);
  foundation("Can you take care (     ) my dog this weekend?", "of", ["to", "at", "from"], "take care of は「～の世話をする」です。", "熟語", ["熟語", "前置詞"]);
  foundation("Aya is interested (     ) music from other countries.", "in", ["on", "at", "of"], "be interested in で「～に興味がある」です。", "熟語", ["熟語", "前置詞"]);
  foundation("I practice the piano (     ) a week, on Tuesday and Friday.", "twice", ["second", "two time", "double"], "週に2回は twice a week と表します。", "回数表現", ["語彙", "頻度"]);
  foundation("Our train arrived (     ) Osaka at noon.", "in", ["on", "by", "with"], "都市や国への到着は arrive in、比較的小さな地点なら arrive at を使います。", "前置詞", ["文法", "前置詞"]);
  foundation("My grandfather enjoys (     ) books about history.", "reading", ["read", "to readed", "reads"], "enjoy の後ろには動詞のing形を置きます。", "動名詞", ["文法", "動名詞"]);
  foundation("This present is (     ) my brother's birthday.", "for", ["during", "until", "without"], "present for ～ で「～へのプレゼント」です。", "前置詞", ["語彙", "前置詞"]);
  foundation("The sky is gray, and it may rain. It is (     ) today.", "cloudy", ["sunny", "snowy", "windless"], "空が灰色で雨が降りそうなので cloudy「曇りの」が合います。", "天気の語彙", ["語彙", "天気"]);

  foundation("We (     ) soccer in the park yesterday.", "played", ["play", "plays", "playing"], "yesterday があるため、動詞は過去形 played にします。", "一般動詞の過去形", ["文法", "過去形"]);
  foundation("I am going to (     ) my aunt next Sunday.", "visit", ["visited", "visiting", "visits"], "be going to の後ろには動詞の原形を置きます。", "未来表現", ["文法", "be going to"]);
  foundation("My brother is (     ) than I am.", "taller", ["tall", "tallest", "more tall"], "than がある2者比較なので tall の比較級 taller を使います。", "比較級", ["文法", "比較"]);
  foundation("Mt. Fuji is the (     ) mountain in Japan.", "highest", ["higher", "high", "most high"], "the と範囲 in Japan があるため、最上級 highest を使います。", "最上級", ["文法", "比較"]);
  foundation("Yuki can (     ) very fast.", "run", ["runs", "ran", "running"], "助動詞 can の後ろには動詞の原形を置きます。", "助動詞can", ["文法", "助動詞"]);
  foundation("You must not (     ) in the library.", "shout", ["shouts", "shouted", "shouting"], "must not の後ろは動詞の原形で、「～してはいけない」を表します。", "助動詞must", ["文法", "助動詞"]);
  foundation("I have to (     ) up at six tomorrow.", "get", ["got", "gets", "getting"], "have to の後ろには動詞の原形を置きます。get up は「起きる」です。", "have to", ["文法", "助動詞相当表現"]);
  foundation("There (     ) three apples on the table.", "are", ["is", "am", "be"], "主語に当たる three apples が複数なので There are を使います。", "There is/are", ["文法", "複数形"]);
  foundation("Do you have (     ) brothers or sisters?", "any", ["much", "a", "one"], "疑問文で複数のものがあるか尋ねるときは any を使います。", "someとany", ["文法", "数量表現"]);
  foundation("I want (     ) a teacher in the future.", "to be", ["being", "be", "to being"], "want to＋動詞の原形で「～したい」です。", "不定詞", ["文法", "不定詞"]);
  foundation("Tom is good at (     ) pictures.", "drawing", ["draw", "drew", "to drew"], "前置詞 at の後ろなので動詞のing形 drawing を置きます。", "動名詞", ["文法", "動名詞"]);
  foundation("When I got home, my mother (     ) dinner.", "was cooking", ["cooks", "will cook", "is cook"], "帰宅した時点で料理中だったので、過去進行形 was cooking が合います。", "過去進行形", ["文法", "過去進行形"]);
  foundation("I stayed home (     ) it was raining hard.", "because", ["but", "or", "before"], "家にいた理由を続けるので because「なぜなら」が適切です。", "接続詞", ["文法", "接続詞"]);
  foundation("This notebook is not yours. It is (     ).", "mine", ["my", "me", "I"], "「私のもの」と名詞なしで表す所有代名詞 mine を使います。", "代名詞", ["文法", "所有代名詞"]);
  foundation("(     ) does it take to walk from your house to school? — About fifteen minutes.", "How long", ["How many", "How often", "What time"], "必要な時間を尋ね、約15分と答えているので How long が適切です。", "疑問詞", ["文法", "疑問表現"]);

  const challenge = (spec) => add({ tier: "challenge", ...spec });
  const dialogue = (prompt, correct, distractors, explanation, skill = "会話の流れ") => challenge({
    cornerId: "e4-dialogue-order", unit: "会話文", prompt, correct, distractors, explanation, skill, tags: ["会話", "応答表現"]
  });

  dialogue("A: Excuse me. How can I get to the city museum?\nB: (     )", "Go straight for two blocks. It's on your left.", ["I went there last Sunday.", "The museum was very interesting.", "I like pictures very much."], "行き方を尋ねられているため、道順を説明する応答が適切です。", "道案内の会話");
  dialogue("A: Would you like some more cake?\nB: (     )", "No, thank you. I'm full.", ["Yes, I made it yesterday.", "The cake is on the table.", "I don't know her name."], "食べ物をさらに勧められたときの自然な断り方です。", "勧誘への応答");
  dialogue("A: What did you do during summer vacation?\nB: (     )", "I visited my grandparents in Hokkaido.", ["I will be thirteen next month.", "It starts at nine o'clock.", "My favorite season is spring."], "過去の夏休みにしたことを、過去形で答えています。", "過去の出来事");
  dialogue("A: May I speak to Ms. Brown, please?\nB: (     )", "I'm sorry, but she's not here now.", ["Yes, she can speak English.", "No, I don't have a phone.", "She spoke very slowly."], "電話で相手を呼び出してほしい依頼に対する自然な応答です。", "電話の会話");
  dialogue("A: You look tired. Are you all right?\nB: (     )", "I went to bed very late last night.", ["This bed is very comfortable.", "I like this blue shirt.", "The train was on time."], "疲れて見える理由として、昨夜遅く寝たことを答えています。", "体調の会話");
  dialogue("A: How often do you clean your room?\nB: (     )", "About once a week.", ["For two hours.", "At my house.", "With my sister's bag."], "How often は頻度を尋ねるので once a week が合います。", "頻度の会話");
  dialogue("A: I have two tickets for the concert. Can you come with me?\nB: (     )", "I'd love to. What time does it start?", ["I can play the piano well.", "The ticket was very expensive.", "I went there by bus yesterday."], "誘いを受け、開始時刻を確認する自然な会話です。", "誘いへの応答");
  dialogue("A: Whose umbrella is this?\nB: (     )", "It may be Lisa's.", ["It's raining outside.", "I bought it at the station.", "Please close the window."], "Whose は持ち主を尋ねるので Lisa's と答えます。", "所有者の会話");
  dialogue("A: I'm sorry I broke your cup.\nB: (     )", "That's OK. It was an old one.", ["I drink milk every morning.", "The cup is under the chair.", "Please buy some orange juice."], "I'm sorry という謝罪を受け入れる自然な応答です。", "謝罪への応答");
  dialogue("A: Which subject do you like better, math or science?\nB: (     )", "Science. I enjoy doing experiments.", ["I have math on Monday.", "My teacher is in the classroom.", "The library has many books."], "二つの教科のうちどちらが好きかという質問に、理由を添えて答えています。", "比較の会話");

  const order = (japanese, fixedSentence, scrambled, correct, distractors, explanation) => challenge({
    cornerId: "e4-dialogue-order", unit: "語句整序", prompt: `日本文の意味に合うように（　）内の5つの語句を並べ替えたとき、2番目と4番目に来る語句の組み合わせを選びなさい。\n「${japanese}」\n${fixedSentence}\n（ ${scrambled.join(" / ")} ）`, correct, distractors, explanation, skill: "英文の語順", tags: ["語順", "文法"], retrievalDirection: "japanese-to-word-order"
  });

  order("あなたは何時に学校へ着きましたか。", "_____ _____ _____ _____ _____ to school?", ["you", "get", "time", "did", "what"], "time ― you", ["what ― did", "did ― get", "you ― time"], "正しい語順は What / time / did / you / get なので、2番目は time、4番目は you です。");
  order("私の父は私に新しい自転車を買ってくれました。", "My father _____ _____ _____ _____ _____.", ["me", "new", "bought", "a", "bike"], "me ― new", ["bought ― a", "a ― bike", "new ― me"], "正しい語順は bought / me / a / new / bike なので、2番目は me、4番目は new です。");
  order("駅まで歩くのに20分かかります。", "_____ _____ _____ _____ _____.", ["twenty minutes", "to walk", "it", "to the station", "takes"], "takes ― to walk", ["it ― twenty minutes", "twenty minutes ― to the station", "to walk ― takes"], "正しい語順は It / takes / twenty minutes / to walk / to the station なので、2番目は takes、4番目は to walk です。");
  order("彼女はその窓を開けたいと思っています。", "_____ _____ _____ _____ _____.", ["the window", "wants", "open", "to", "she"], "wants ― open", ["she ― to", "to ― the window", "open ― wants"], "正しい語順は She / wants / to / open / the window なので、2番目は wants、4番目は open です。");
  order("あなたは去年、京都を訪れましたか。", "_____ _____ _____ _____ _____?", ["Kyoto", "you", "last year", "visit", "did"], "you ― Kyoto", ["did ― visit", "visit ― last year", "Kyoto ― you"], "正しい語順は Did / you / visit / Kyoto / last year なので、2番目は you、4番目は Kyoto です。");
  order("その箱はとても重いので、私は運べません。", "_____ _____ _____ _____ _____.", ["so", "I cannot carry it", "is", "very heavy", "the box"], "is ― so", ["the box ― very heavy", "very heavy ― I cannot carry it", "so ― is"], "正しい語順は The box / is / very heavy / so / I cannot carry it なので、2番目は is、4番目は so です。");
  order("雨が降っていたので、私たちは家にいました。", "_____ _____ _____ _____ _____.", ["because", "we", "raining", "stayed home", "it was"], "stayed home ― it was", ["we ― because", "because ― raining", "it was ― stayed home"], "正しい語順は We / stayed home / because / it was / raining なので、2番目は stayed home、4番目は it was です。");
  order("私の姉は私より上手に泳げます。", "My sister _____ _____ _____ _____ _____.", ["I can", "better", "swim", "can", "than"], "swim ― than", ["can ― better", "better ― I can", "than ― swim"], "正しい語順は can / swim / better / than / I can なので、2番目は swim、4番目は than です。");
  order("次の日曜日に何をする予定ですか。", "_____ _____ _____ _____ _____ next Sunday?", ["going", "what", "to do", "you", "are"], "are ― going", ["what ― you", "you ― to do", "going ― are"], "正しい語順は What / are / you / going / to do なので、2番目は are、4番目は going です。");
  order("英語を話すことは私には楽しいです。", "_____ _____ _____ _____ _____.", ["for me", "English", "fun", "speaking", "is"], "English ― fun", ["speaking ― is", "is ― for me", "fun ― English"], "正しい語順は Speaking / English / is / fun / for me なので、2番目は English、4番目は fun です。");

  const listeningResponse = (scene, audioText, correct, distractors, explanation) => challenge({
    cornerId: "e4-listening", unit: "リスニング・応答", prompt: `音声を聞き、最後の発話に対する最も自然な応答を選びなさい。（${scene}）`, audioText, correct, distractors, explanation: `放送文: “${audioText}” ${explanation}`, skill: "会話の応答を聞き取る", tags: ["リスニング", "応答"]
  });

  listeningResponse("週末", "How was your weekend?", "It was great.", ["On Saturday morning.", "At the station.", "For three hours."], "週末がどうだったかを尋ねているので感想を答えます。");
  listeningResponse("手伝い", "Could you help me carry this box?", "Sure. No problem.", ["It's a small box.", "I carried it yesterday.", "The box is brown."], "手伝いを頼まれているので、引き受ける応答が適切です。");
  listeningResponse("学校", "Excuse me. Where is the science room?", "It's on the second floor.", ["We have science on Friday.", "I like our science teacher.", "There are thirty students."], "場所を尋ねているので、階を答えます。");
  listeningResponse("飲み物", "Would you like some orange juice?", "Yes, please.", ["I bought two oranges.", "It's in the kitchen.", "I drank it yesterday."], "飲み物を勧められたときの自然な応答です。");
  listeningResponse("映画", "What time does the movie start?", "At seven thirty.", ["About two hours.", "Three tickets.", "At the movie theater."], "開始時刻を尋ねられているので時刻を答えます。");
  listeningResponse("なくし物", "I can't find my notebook.", "Is this one yours?", ["I write in it every day.", "The notebook was cheap.", "I have three classes."], "なくし物を探している相手に、目の前のノートが本人のものか確認しています。");
  listeningResponse("放課後", "Let's play tennis after school.", "Sounds good.", ["I watched tennis on TV.", "My school is near the park.", "The racket was new."], "誘いに賛成する自然な表現です。");
  listeningResponse("持ち主", "Whose bicycle is that?", "It's Ken's.", ["It's very fast.", "It's near the gate.", "It's ten years old."], "Whose は持ち主を尋ねるので、人名＋'s で答えます。");
  listeningResponse("宿題", "Did you finish your homework?", "Not yet.", ["At my desk.", "For math class.", "Two pages."], "宿題が終わったかという質問に「まだです」と答えています。");
  listeningResponse("遅刻", "I'm sorry I'm late.", "That's all right.", ["The clock is on the wall.", "I came here by bus.", "It's a sunny day."], "謝罪を受け入れる応答です。");
  listeningResponse("習い事", "How often do you practice the piano?", "Three times a week.", ["For five years.", "At my teacher's house.", "A beautiful song."], "How often は頻度を尋ねます。");
  listeningResponse("バス", "Which bus goes to the museum?", "The number ten bus.", ["Ten minutes ago.", "At the bus stop.", "Two hundred yen."], "どのバスかを尋ねられているので番号を答えます。");
  listeningResponse("文房具", "May I use your pen?", "Of course. Here you are.", ["I use it every day.", "It is a blue pen.", "I bought a notebook too."], "許可を求められたので、貸す応答が適切です。");
  listeningResponse("明日の予定", "What are you going to do tomorrow?", "I'm going to visit my grandmother.", ["I went there last week.", "Tomorrow is Tuesday.", "My grandmother is sixty-five."], "明日の予定を be going to で答えています。");
  listeningResponse("荷物", "Your bag looks very heavy.", "Yes. It has many books in it.", ["I like the red bag.", "The bookstore closes at six.", "I read every night."], "かばんが重そうだという発話に、その理由を答えています。");

  const finalQuestion = (spec) => add({ tier: "final", ...spec });
  const reading = (passage, prompt, correct, distractors, explanation, group) => finalQuestion({
    cornerId: "e4-reading", unit: "長文読解", passage, prompt, correct, distractors, explanation, skill: "英文から必要な情報を探す", tags: ["長文", "内容一致"], variantGroup: `eiken4-reading-${group}`, retrievalDirection: "passage-to-detail"
  });

  const libraryPassage = "SCHOOL LIBRARY NOTICE\nThe library will close at 4:00 p.m. this Friday because of a teachers' meeting. Students can return books to the box outside the library after 4:00. The library will open at 9:00 a.m. on Saturday.";
  reading(libraryPassage, "Why will the library close early on Friday?", "Because there is a teachers' meeting.", ["Because students have a sports game.", "Because the librarian is sick.", "Because new books will arrive."], "金曜日に早く閉まる理由は teachers' meeting です。", "library");
  reading(libraryPassage, "Where can students return books after 4:00 on Friday?", "To the box outside the library.", ["To their classroom.", "To the school office.", "To the box in the gym."], "4時以降は図書館の外にある返却箱へ入れます。", "library");
  reading(libraryPassage, "What time will the library open on Saturday?", "At 9:00 a.m.", ["At 4:00 p.m.", "At 8:00 a.m.", "At 10:00 a.m."], "案内の最後に、土曜日は午前9時に開館するとあります。", "library");

  const emailPassage = "Hi Yuna,\nI'm coming to your town with my family next Sunday. We will arrive at Central Station at 10:30. Can you meet us there? In the afternoon, I want to visit the flower park. My little brother wants to see the old castle, too.\nSee you,\nEmma";
  reading(emailPassage, "When will Emma come to Yuna's town?", "Next Sunday.", ["This Saturday.", "Next Monday.", "Tomorrow morning."], "Eメールの冒頭で next Sunday と伝えています。", "email");
  reading(emailPassage, "Where does Emma want Yuna to meet her family?", "At Central Station.", ["At the flower park.", "At the old castle.", "At Yuna's school."], "家族は Central Station に10時30分に到着します。", "email");
  reading(emailPassage, "Who wants to see the old castle?", "Emma's little brother.", ["Emma's mother.", "Yuna's father.", "Yuna's teacher."], "old castle を見たがっているのは Emma の弟です。", "email");

  const picnicPassage = "Last Saturday, Ken and his friends went to Green Park for a picnic. Ken made sandwiches in the morning. At noon, it started to rain, so they ate lunch under a large tree. The rain stopped at two, and they played soccer before going home.";
  reading(picnicPassage, "What did Ken make in the morning?", "Sandwiches.", ["A soccer ball.", "A large cake.", "A raincoat."], "Ken made sandwiches in the morning とあります。", "picnic");
  reading(picnicPassage, "Why did they eat under a large tree?", "Because it started to rain.", ["Because the park was closed.", "Because they saw a dog.", "Because it was very cold."], "正午に雨が降り始めたため、大きな木の下で食べました。", "picnic");
  reading(picnicPassage, "What did they do after the rain stopped?", "They played soccer.", ["They made lunch.", "They went swimming.", "They studied English."], "雨がやんだ後、帰宅前にサッカーをしました。", "picnic");

  const clubPassage = "COOKING CLUB\nDo you like cooking? Join us in the school kitchen every Wednesday from 3:30 to 5:00. This month, we will make vegetable soup and apple pie. Bring an apron and a notebook. Please talk to Ms. Hill by September 12.";
  reading(clubPassage, "Where does the cooking club meet?", "In the school kitchen.", ["In the music room.", "In the city library.", "In Ms. Hill's house."], "活動場所は school kitchen です。", "club");
  reading(clubPassage, "What should students bring?", "An apron and a notebook.", ["Vegetables and apples.", "A plate and a cup.", "A dictionary and a pen."], "持ち物は apron と notebook です。", "club");
  reading(clubPassage, "By when should students talk to Ms. Hill?", "By September 12.", ["By every Wednesday.", "By 3:30 today.", "By the end of October."], "申込みの期限は September 12 です。", "club");

  const turtlePassage = "Sea turtles live in warm oceans. Female turtles come onto beaches at night to lay eggs in the sand. After about two months, the baby turtles come out of the eggs and move toward the sea. Bright lights near the beach can make it difficult for them to find the ocean.";
  reading(turtlePassage, "When do female sea turtles usually come onto beaches?", "At night.", ["Early in the afternoon.", "Only in winter.", "After heavy rain."], "本文に come onto beaches at night とあります。", "turtle");
  reading(turtlePassage, "Where do female sea turtles lay their eggs?", "In the sand.", ["Under the ocean.", "On rocks.", "In trees."], "本文では、卵は浜辺の砂の中に産むと説明されています。", "turtle");
  reading(turtlePassage, "What can make it hard for baby turtles to find the ocean?", "Bright lights near the beach.", ["Warm ocean water.", "Soft sand on the beach.", "Other baby turtles."], "浜辺の近くの明るい光が、海の方向を見つけにくくします。", "turtle");

  const listeningContent = (scene, audioText, prompt, correct, distractors, explanation, group) => finalQuestion({
    cornerId: "e4-listening", unit: "リスニング・内容一致", prompt: `音声を聞いて答えなさい。（${scene}）\n${prompt}`, audioText, correct, distractors, explanation: `放送文: “${audioText}” ${explanation}`, skill: "会話・説明の要点を聞き取る", tags: ["リスニング", "内容一致"], variantGroup: `eiken4-listening-${group}`, retrievalDirection: "audio-to-detail"
  });

  const trainAudio = "What time is our train to Lake City? It leaves at nine fifteen. Let's meet at the station at eight fifty. Okay. I'll bring some sandwiches for lunch. Question:";
  listeningContent("列車での外出", `${trainAudio} What time does the train leave?`, "What time does the train leave?", "At 9:15.", ["At 8:15.", "At 8:50.", "At 9:50."], "列車の出発時刻は nine fifteen です。", "train");
  listeningContent("列車での外出", `${trainAudio} Where will the speakers meet?`, "Where will the speakers meet?", "At the station.", ["At Lake City.", "At school.", "At a restaurant."], "二人は駅で会う予定です。", "train");
  listeningContent("列車での外出", `${trainAudio} What will one speaker bring for lunch?`, "What will one speaker bring for lunch?", "Some sandwiches.", ["Some train tickets.", "A map.", "A camera."], "話し手の一人が昼食用のサンドイッチを持ってきます。", "train");

  const bakeryAudio = "This is a message from Sunny Bakery. Today, all sandwiches are half price after five p.m. The bakery closes at seven. Tomorrow morning, we will have a new kind of chocolate bread. Question:";
  listeningContent("店内案内", `${bakeryAudio} What will be half price after five today?`, "What will be half price after five today?", "All sandwiches.", ["Chocolate bread.", "All cakes.", "Cold drinks."], "5時以降に半額になるのは sandwiches です。", "bakery");
  listeningContent("店内案内", `${bakeryAudio} What time does the bakery close?`, "What time does the bakery close?", "At seven.", ["At five.", "At six.", "At eight."], "閉店時刻は seven です。", "bakery");
  listeningContent("店内案内", `${bakeryAudio} What will the bakery have tomorrow morning?`, "What will the bakery have tomorrow morning?", "A new kind of chocolate bread.", ["Free sandwiches.", "A new apple cake.", "Hot soup."], "翌朝は新しい種類の chocolate bread が出ます。", "bakery");

  const sportsAudio = "Our school sports day is this Saturday. Students must come to school by eight o'clock. The first race starts at nine. Please bring a hat and a bottle of water. If it rains, sports day will be on Sunday. Question:";
  listeningContent("運動会", `${sportsAudio} By what time must students come to school?`, "By what time must students come to school?", "By eight o'clock.", ["By seven o'clock.", "By nine o'clock.", "By ten o'clock."], "生徒は8時までに登校します。", "sports");
  listeningContent("運動会", `${sportsAudio} What should students bring?`, "What should students bring?", "A hat and a bottle of water.", ["Lunch and a camera.", "A towel and an umbrella.", "A notebook and a pen."], "持ち物は帽子と水です。", "sports");
  listeningContent("運動会", `${sportsAudio} When will sports day be if it rains on Saturday?`, "When will sports day be if it rains on Saturday?", "On Sunday.", ["On Friday.", "Next Monday.", "Next Saturday."], "土曜日が雨なら日曜日に行います。", "sports");

  const phoneAudio = "Hello, may I speak to Amy? This is Amy. Would you like to go to the new swimming pool tomorrow? Sorry, I have a piano lesson in the morning, but I'm free after two. Great. Let's meet at the pool at two thirty. Question:";
  listeningContent("電話", `${phoneAudio} What does Tom invite Amy to do?`, "What does Tom invite Amy to do?", "Go to the new swimming pool.", ["Practice the piano.", "Watch a movie.", "Visit a music store."], "Tom は新しいプールへ行こうと誘っています。", "phone");
  listeningContent("電話", `${phoneAudio} What will Amy do tomorrow morning?`, "What will Amy do tomorrow morning?", "Have a piano lesson.", ["Go swimming.", "Study with Tom.", "Clean the pool."], "Amy は午前中にピアノのレッスンがあります。", "phone");
  listeningContent("電話", `${phoneAudio} What time will they meet?`, "What time will they meet?", "At 2:30.", ["At 1:30.", "At 2:00.", "At 3:00."], "待ち合わせは two thirty です。", "phone");

  const mariaAudio = "Maria is a student from Canada. She came to Japan three months ago. She walks to school with her neighbor, Yui. Maria likes Japanese food, and her favorite is curry rice. On weekends, she often plays badminton at the community center. Question:";
  listeningContent("人物紹介", `${mariaAudio} Where is Maria from?`, "Where is Maria from?", "Canada.", ["Japan.", "Australia.", "India."], "Maria is a student from Canada とあります。", "maria");
  listeningContent("人物紹介", `${mariaAudio} How does Maria go to school?`, "How does Maria go to school?", "She walks with Yui.", ["She rides a bicycle alone.", "She takes a bus with her mother.", "She goes by train."], "近所のYuiと歩いて登校します。", "maria");
  listeningContent("人物紹介", `${mariaAudio} What does Maria often do on weekends?`, "What does Maria often do on weekends?", "She plays badminton.", ["She cooks curry rice.", "She studies at school.", "She visits Canada."], "週末には community center で badminton をします。", "maria");

  if (questions.length !== 100) throw new Error(`EIKEN Grade 4 question count must be 100, got ${questions.length}`);
  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...questions);
})();
