(function () {
  "use strict";

  const SOURCE = "eiken-grade4-original-mocks-2026-08";
  const forms = [];

  function rotate(values, shift) {
    const amount = shift % values.length;
    return values.slice(amount).concat(values.slice(0, amount));
  }

  function choiceQuestion(formId, number, spec) {
    const raw = [spec.correct, ...spec.wrong];
    const choices = rotate(raw, (number + Number(formId.at(-1))) % raw.length);
    const audio = spec.audio ? {
      ...spec.audio,
      spokenChoices: spec.audio.spokenChoices ? choices.slice() : undefined
    } : null;
    return {
      id: `${formId}-${String(number).padStart(2, "0")}`,
      source: SOURCE,
      section: spec.section || "reading",
      part: spec.part,
      prompt: spec.prompt,
      choices,
      answer: choices.indexOf(spec.correct),
      explanation: spec.explanation || `文脈と文法に合う答えは「${spec.correct}」です。`,
      passage: spec.passage || "",
      audio,
      scene: spec.scene || null
    };
  }

  function short(part, prompt, correct, wrong, explanation) {
    return { part, prompt, correct, wrong, explanation };
  }

  function dialogue(prompt, correct, wrong, explanation) {
    return short("会話文空所", prompt, correct, wrong, explanation);
  }

  function order(japanese, words, positions, wrong) {
    const correct = `${words[positions[0] - 1]} ― ${words[positions[1] - 1]}`;
    return short(
      "語句整序",
      `日本文の意味になるように5語句を並べ替えたとき、2番目と4番目に来る語句の組み合わせを選びなさい。\n「${japanese}」\n（ ${rotate(words, 2).join(" / ")} ）`,
      correct,
      wrong,
      `正しい語順は ${words.join(" / ")} です。したがって2番目は「${words[1]}」、4番目は「${words[3]}」です。`
    );
  }

  function passageQuestions(part, passage, rows) {
    return rows.map(([prompt, correct, wrong, explanation]) => short(part, prompt, correct, wrong, explanation, passage));
  }

  function readingPassage(part, passage, prompt, correct, wrong, explanation) {
    return { part, passage, prompt, correct, wrong, explanation };
  }

  function response(sceneEmoji, sceneLabel, line, correct, wrong, explanation) {
    const leads = {
      "登校前": "It's almost time for school.", "おやつ": "That cake looks delicious.",
      "道案内": "I want to visit the art museum.", "天気": "Look outside.",
      "図書室": "These books are heavy.", "電話": "Hello. This is the Green family.",
      "放課後": "We are free after class today.", "時刻": "The meeting was long today.",
      "忘れ物": "Someone left this jacket here.", "体調": "I didn't sleep well last night.",
      "観光": "Can I help you?", "手伝い": "The kitchen looks nice.",
      "音楽": "I practice the violin after school.", "買い物": "Welcome to our fruit shop.",
      "訪問": "Hello. Thank you for inviting me.", "写真": "We are all together now.",
      "教室": "The test will start soon.", "食事": "We need to decide our meal.",
      "部屋": "It is warm in this room.", "知らせ": "I have great news.",
      "持ち物": "We are leaving for the trip.", "スポーツ": "We are free this afternoon.",
      "試験": "You finished the math test.", "本": "I finished this story yesterday.",
      "駅": "I work at this station.", "水族館": "There were many fish there.",
      "遅刻": "The bus is coming.", "贈り物": "Happy birthday."
    };
    return {
      section: "listening", part: "第1部・応答", scene: { emoji: sceneEmoji, label: sceneLabel },
      prompt: "最後の発話に対する最も自然な応答を、1・2・3から選びなさい。",
      correct, wrong, explanation,
      audio: {
        kind: "response", playsAllowed: 2,
        segments: [{ speaker: "A", text: leads[sceneLabel] || "Excuse me." }, { speaker: "B", text: line }],
        spokenChoices: [correct, ...wrong]
      }
    };
  }

  function listeningDialogue(scene, segments, question, correct, wrong, explanation) {
    return {
      section: "listening", part: "第2部・会話内容", scene,
      prompt: question, correct, wrong, explanation,
      audio: { kind: "dialogue", playsAllowed: 2, segments: [...segments, { speaker: "N", text: question }] }
    };
  }

  function listeningTalk(scene, text, question, correct, wrong, explanation) {
    return {
      section: "listening", part: "第3部・説明・物語", scene,
      prompt: question, correct, wrong, explanation,
      audio: { kind: "talk", playsAllowed: 2, segments: [{ speaker: "N", text }, { speaker: "N", text: question }] }
    };
  }

  const formAReading = [
    short("短文空所", "My mother went to the station to buy a train (     ).", "ticket", ["bridge", "plate", "letter"], "駅で列車に乗るために買うものは train ticket（切符）です。"),
    short("短文空所", "Nina found an umbrella in the classroom and (     ) it to her teacher.", "gave", ["drew", "sang", "built"], "見つけた傘を先生に渡したので、give の過去形 gave が合います。"),
    short("短文空所", "My brother is good (     ) taking pictures.", "at", ["on", "from", "with"], "be good at ～ing で「～するのが得意」です。"),
    short("短文空所", "We (     ) basketball after school yesterday.", "played", ["play", "plays", "are playing"], "yesterday があるため過去形 played を使います。"),
    short("短文空所", "This river is (     ) than the river near my house.", "wider", ["wide", "widest", "more wide"], "than がある2者比較なので wide の比較級 wider です。"),
    short("短文空所", "(     ) do you visit your grandparents? — About twice a month.", "How often", ["How long", "How many", "What time"], "twice a month は頻度なので How often で尋ねます。"),
    short("短文空所", "Lisa is going to (     ) dinner for her family tonight.", "cook", ["cooked", "cooks", "cooking"], "be going to の後ろは動詞の原形です。"),
    short("短文空所", "There (     ) two large windows in our classroom.", "are", ["is", "am", "was"], "two large windows は複数なので There are です。"),
    short("短文空所", "You must not (     ) pictures in this museum.", "take", ["takes", "took", "taking"], "must not の後ろは動詞の原形 take です。"),
    short("短文空所", "Do you have (     ) questions about today's homework?", "any", ["much", "a", "one"], "疑問文で複数のものがあるか尋ねるときは any を使います。"),
    short("短文空所", "I'm looking (     ) my blue cap. Did you see it?", "for", ["after", "at", "up"], "look for は「～を探す」です。"),
    short("短文空所", "Miki enjoys (     ) English songs with her friends.", "singing", ["sing", "sang", "to sang"], "enjoy の後ろは動名詞 singing です。"),
    short("短文空所", "When I called Ben, he (     ) his room.", "was cleaning", ["cleans", "will clean", "is clean"], "電話した時に掃除中だったので過去進行形 was cleaning です。"),
    short("短文空所", "We stayed inside (     ) it was snowing hard.", "because", ["but", "or", "after"], "家の中にいた理由を続けるので because が合います。"),
    short("短文空所", "I practice the violin (     ) a week, on Monday and Thursday.", "twice", ["second", "two time", "double"], "週に2回は twice a week と表します。"),
    dialogue("A: I have two tickets for the soccer game. Can you come with me?\nB: (     )", "I'd love to. What time does it start?", ["I played soccer yesterday.", "The tickets are on the desk.", "I walk to school every day."], "誘いを受け、開始時刻を尋ねる自然な応答です。"),
    dialogue("A: Excuse me. How can I get to the post office?\nB: (     )", "Turn right at the bank. It's next to the park.", ["I sent a letter yesterday.", "The bank closes at five.", "I like walking in the park."], "行き方を尋ねられているため、道順を答えます。"),
    dialogue("A: You look worried. What's wrong?\nB: (     )", "I can't find my library book.", ["The library is very large.", "I read every night.", "This book was interesting."], "心配している理由として、図書館の本が見つからないことを答えています。"),
    dialogue("A: Would you like another sandwich?\nB: (     )", "No, thank you. I'm full.", ["I made it this morning.", "It's on the plate.", "Lunch starts at twelve."], "食べ物をさらに勧められたときの自然な断り方です。"),
    dialogue("A: May I speak to Mr. Green, please?\nB: (     )", "I'm sorry, but he isn't here now.", ["Yes, he speaks slowly.", "His phone is new.", "I met him last Sunday."], "電話で相手を呼び出してほしい依頼への自然な返答です。"),
    order("あなたは今朝何時に起きましたか。", ["What", "time", "did", "you", "get up"], [2, 4], ["What ― did", "did ― get up", "you ― time"]),
    order("私の姉は私にこのかばんをくれました。", ["My sister", "gave", "this bag", "to", "me"], [2, 4], ["My sister ― this bag", "this bag ― me", "to ― gave"]),
    order("駅まで歩くのに10分かかります。", ["It", "takes", "ten minutes", "to walk", "to the station"], [2, 4], ["It ― ten minutes", "ten minutes ― to the station", "to walk ― takes"]),
    order("彼らは来週その博物館を訪れる予定です。", ["They", "are going", "to visit", "the museum", "next week"], [2, 4], ["They ― to visit", "to visit ― next week", "the museum ― are going"]),
    order("あなたはどちらの本が好きですか。", ["Which", "book", "do", "you", "like"], [2, 4], ["Which ― do", "do ― like", "you ― book"])
  ];

  const aNotice = `RIVER PARK CLEAN-UP DAY\nJoin us on Saturday, September 6, from 9:00 to 11:00 a.m. Meet at the north gate at 8:50. We will pick up trash near the river. Please wear old shoes and bring work gloves. The event will move to Sunday if it rains.`;
  formAReading.push(
    readingPassage("長文・掲示", aNotice, "Where should people meet?", "At the north gate.", ["Near the station.", "At the south gate.", "Inside the school."], "集合場所は north gate です。"),
    readingPassage("長文・掲示", aNotice, "What should people bring?", "Work gloves.", ["A lunch box.", "A river map.", "A soccer ball."], "持ち物として work gloves が指定されています。")
  );
  const aEmail = `Hi Sara,\nThank you for inviting me to your birthday picnic next Sunday. My father can drive me to Lake Park, but I cannot arrive before eleven because I have a swimming lesson in the morning. I will bring some apple juice and paper cups. You asked about music, so I can also bring my small speaker. My little brother wanted to come, but he has a soccer game that day. My father will take him there after he leaves me at the park. Please tell me which gate we should use.\nSee you,\nKeiko`;
  formAReading.push(
    readingPassage("長文・Eメール", aEmail, "Why can't Keiko arrive before eleven?", "She has a swimming lesson.", ["Her father works at the park.", "She must buy a speaker.", "The picnic starts in the evening."], "午前中に swimming lesson があるためです。"),
    readingPassage("長文・Eメール", aEmail, "What will Keiko bring for drinks?", "Apple juice and paper cups.", ["Tea and two bottles.", "Orange juice and glasses.", "Water and a lunch box."], "Keiko は apple juice と paper cups を持っていきます。"),
    readingPassage("長文・Eメール", aEmail, "What does Keiko want Sara to tell her?", "Which gate to use.", ["What music to play.", "How old the speaker is.", "Where to take a swimming lesson."], "最後に、どの門を使うか教えてほしいと頼んでいます。")
  );
  const aStory = `Last month, Tom's class started a small garden behind their school. First, their science teacher showed them how to prepare the ground. Tom and Mia planted tomato seeds, and other students planted beans and flowers. The class took turns giving the plants water before lessons. They wrote their names on a calendar, so everyone knew which morning to help. Tom sometimes came early because he enjoyed seeing the small plants change. One Monday, Tom saw that some tomato leaves were broken. He thought an animal came into the garden, but Mia found a soccer ball near the plants. The class put a low fence around the garden and asked students to play farther away. Three weeks later, the first tomatoes became red. The class used them in sandwiches for the school festival. Tom was happy because many visitors said the tomatoes were sweet.`;
  formAReading.push(
    readingPassage("長文・説明文", aStory, "Where did Tom's class make the garden?", "Behind their school.", ["Next to Tom's house.", "Inside the science room.", "Near the city station."], "庭を作った場所は behind their school です。"),
    readingPassage("長文・説明文", aStory, "What did Tom and Mia plant?", "Tomato seeds.", ["Bean seeds.", "Apple trees.", "Yellow flowers."], "Tom と Mia は tomato seeds を植えました。"),
    readingPassage("長文・説明文", aStory, "What probably broke the tomato leaves?", "A soccer ball.", ["A large animal.", "Heavy rain.", "The science teacher."], "近くにサッカーボールがあり、遊ぶ場所を離すよう頼んだことから判断します。"),
    readingPassage("長文・説明文", aStory, "How did the class protect the garden?", "They put a low fence around it.", ["They moved it into a room.", "They watched it all night.", "They stopped giving it water."], "class put a low fence around the garden とあります。"),
    readingPassage("長文・説明文", aStory, "What did the class do with the tomatoes?", "They used them in sandwiches.", ["They sold them at a store.", "They gave them to animals.", "They took them home before they were red."], "学校祭の sandwiches に使いました。")
  );

  const formAListening = [
    response("🎒", "登校前", "Did you put your homework in your bag?", "Yes. It's in my bag now.", ["It's a new bag.", "At eight o'clock."], "宿題をかばんに入れたかという質問に答えています。"),
    response("🍰", "おやつ", "Would you like some chocolate cake?", "Yes, please. It looks good.", ["I made a sandwich.", "It's my birthday tomorrow."], "食べ物を勧められたときの自然な応答です。"),
    response("🚌", "道案内", "Which bus goes to the art museum?", "The number twelve bus.", ["About twenty minutes.", "In front of the museum."], "どのバスかを尋ねているため番号を答えます。"),
    response("🌧️", "天気", "It's raining very hard now.", "Let's wait here for a few minutes.", ["I bought it last week.", "The rain was blue."], "強い雨への対応として待つ提案が自然です。"),
    response("📚", "図書室", "Could you help me carry these books?", "Sure. I'll take these two.", ["I read one yesterday.", "The library is upstairs."], "手伝いの依頼を引き受けています。"),
    response("📞", "電話", "May I speak to Anna, please?", "This is Anna speaking.", ["She speaks English.", "The phone is on the table."], "電話で本人が名乗る自然な表現です。"),
    response("🎾", "放課後", "Why don't we play tennis after school?", "Sounds good. I'll bring my racket.", ["I watched it on TV.", "School ends at three."], "提案に賛成する自然な応答です。"),
    response("⌚", "時刻", "What time did the meeting finish?", "At half past four.", ["For two hours.", "In the music room."], "終了時刻を尋ねているので時刻で答えます。"),
    response("🧥", "忘れ物", "Whose jacket is this?", "It may be Ken's.", ["It's cold today.", "It's under the chair."], "Whose は持ち主を尋ねます。"),
    response("🩹", "体調", "You don't look well. Are you all right?", "I have a bad headache.", ["This hat is mine.", "I walked to school."], "具合を尋ねられ、症状を答えています。"),
    listeningDialogue({ emoji: "🎬", label: "映画館" }, [{ speaker: "A", text: "The movie starts at seven, right?" }, { speaker: "B", text: "Yes. Let's meet in front of the theater at six thirty." }], "What time will they meet?", "At 6:30.", ["At 6:00.", "At 7:00.", "At 7:30."], "待ち合わせは six thirty です。"),
    listeningDialogue({ emoji: "🍳", label: "朝食" }, [{ speaker: "A", text: "Mom, can I have some eggs?" }, { speaker: "B", text: "Sorry, we don't have any. How about toast?" }, { speaker: "A", text: "Okay. I'll have toast and milk." }], "What will the boy have?", "Toast and milk.", ["Eggs and milk.", "Toast and juice.", "Eggs and juice."], "最後に toast and milk と決めています。"),
    listeningDialogue({ emoji: "🚲", label: "自転車" }, [{ speaker: "A", text: "How do you usually go to school, Emi?" }, { speaker: "B", text: "By bicycle, but my father drove me today because it rained." }], "How did Emi go to school today?", "By car.", ["By bicycle.", "By bus.", "On foot."], "今日は雨だったので父の車で行きました。"),
    listeningDialogue({ emoji: "🎁", label: "買い物" }, [{ speaker: "A", text: "I need a birthday present for my sister." }, { speaker: "B", text: "Does she like books?" }, { speaker: "A", text: "Yes, but I'm going to buy her a music CD." }], "What will the boy buy?", "A music CD.", ["A book.", "A bag.", "A cake."], "本ではなく music CD を買うと言っています。"),
    listeningDialogue({ emoji: "🏊", label: "プール" }, [{ speaker: "A", text: "Is the pool open on Monday?" }, { speaker: "B", text: "No, it's closed on Mondays. It opens at ten on Tuesday." }], "When can the girl go to the pool?", "On Tuesday.", ["On Monday.", "On Sunday.", "On Friday."], "月曜は休みで、火曜に開きます。"),
    listeningDialogue({ emoji: "🐕", label: "犬の世話" }, [{ speaker: "A", text: "Can you walk Max this evening?" }, { speaker: "B", text: "I have soccer practice, but I can do it after dinner." }], "When will the boy walk Max?", "After dinner.", ["Before school.", "Before soccer practice.", "Tomorrow morning."], "夕食後ならできると答えています。"),
    listeningDialogue({ emoji: "📖", label: "宿題" }, [{ speaker: "A", text: "Did you finish the science report?" }, { speaker: "B", text: "Not yet. I finished the pictures, but I need to write two more pages." }], "What does the girl still need to do?", "Write two pages.", ["Draw the pictures.", "Read a science book.", "Print four pages."], "絵は終わり、あと2ページ書く必要があります。"),
    listeningDialogue({ emoji: "🌸", label: "公園" }, [{ speaker: "A", text: "Let's go to Flower Park on Saturday." }, { speaker: "B", text: "It will rain then. Sunday will be sunny." }, { speaker: "A", text: "Okay, let's go on Sunday." }], "When will they go to the park?", "On Sunday.", ["On Friday.", "On Saturday.", "On Monday."], "天気を考えて Sunday に変更しました。"),
    listeningDialogue({ emoji: "🍝", label: "レストラン" }, [{ speaker: "A", text: "I'd like the chicken sandwich." }, { speaker: "B", text: "I'm sorry. We don't have any chicken today." }, { speaker: "A", text: "Then I'll have the tomato pasta." }], "What will the man order?", "Tomato pasta.", ["A chicken sandwich.", "Vegetable soup.", "Fish and rice."], "チキンがないため tomato pasta を注文します。"),
    listeningDialogue({ emoji: "🏫", label: "学校" }, [{ speaker: "A", text: "Where is Mrs. Hill?" }, { speaker: "B", text: "She was in the library, but she went to the teachers' room five minutes ago." }], "Where is Mrs. Hill now?", "In the teachers' room.", ["In the library.", "In the gym.", "In the classroom."], "5分前に teachers' room へ移動しました。"),
    listeningTalk({ emoji: "📢", label: "校内放送" }, "Attention, students. The school concert will begin at two thirty in the gym. Students in the music club should meet there at one forty-five. Please bring your blue club shirt.", "When will the concert begin?", "At 2:30.", ["At 1:45.", "At 2:00.", "At 3:30."], "コンサートの開始は two thirty です。"),
    listeningTalk({ emoji: "🍞", label: "パン屋" }, "Sunny Bakery opens at eight every morning. On Fridays, customers can buy two sandwiches and get one free drink. The bakery closes one hour early at five this Friday.", "What can customers get free on Friday?", "One drink.", ["One sandwich.", "Two cakes.", "A loaf of bread."], "金曜日はサンドイッチ2個で drink が1つ無料です。"),
    listeningTalk({ emoji: "🐦", label: "自然観察" }, "Aya went to Blue Lake with her uncle last Sunday. They wanted to see wild birds, so they arrived before seven. Aya took many pictures, but her uncle forgot his camera.", "Why did Aya go to Blue Lake?", "To see wild birds.", ["To go swimming.", "To meet her teacher.", "To buy a camera."], "目的は wild birds を見ることです。"),
    listeningTalk({ emoji: "⚽", label: "スポーツ" }, "Our soccer game was planned for Saturday morning, but heavy rain made the field too wet. The game will be at the same time on Sunday. Players should call their coach if they cannot come.", "Why was the soccer game moved?", "The field was too wet.", ["The coach was sick.", "The players were late.", "Sunday was a holiday."], "大雨で field が濡れすぎたためです。"),
    listeningTalk({ emoji: "🎂", label: "誕生日" }, "Leo is making dinner for his mother's birthday. He bought vegetables after school and will make soup. His older sister is bringing a cake from her job at a hotel.", "Who will bring the cake?", "Leo's older sister.", ["Leo's mother.", "Leo's teacher.", "A hotel guest."], "ケーキを持ってくるのは older sister です。"),
    listeningTalk({ emoji: "🚌", label: "旅行案内" }, "The bus for Hill Farm leaves Central Station at nine twenty. The trip takes fifty minutes. Visitors can feed sheep after lunch, but the horse riding area is closed today.", "What can visitors do after lunch?", "Feed sheep.", ["Ride horses.", "Drive a bus.", "Visit the station."], "昼食後は sheep に餌をやれます。"),
    listeningTalk({ emoji: "📚", label: "図書館" }, "The city library has a new study room on the second floor. It has twenty desks and is open until seven. Students must not eat there, but they may bring water.", "What may students bring into the study room?", "Water.", ["Dinner.", "A pet.", "A radio."], "食べ物は禁止ですが water は持ち込めます。"),
    listeningTalk({ emoji: "🌍", label: "留学生" }, "Maria came from Spain to Japan in April. She lives with the Sato family and walks to school with their daughter. Her favorite Japanese class is art because she loves drawing.", "Why does Maria like art class?", "She loves drawing.", ["She likes walking.", "She wants to visit Spain.", "She lives with an art teacher."], "art が好きな理由は drawing が好きだからです。"),
    listeningTalk({ emoji: "🎹", label: "発表会" }, "Ken's piano lesson is usually on Wednesday, but this week it is on Thursday. His school concert is next Saturday, and he will play two songs with his friend Mina.", "When is Ken's piano lesson this week?", "On Thursday.", ["On Wednesday.", "On Friday.", "On Saturday."], "今週だけ Thursday です。"),
    listeningTalk({ emoji: "🌳", label: "週末" }, "On Saturday, the Park family planned to have a picnic. In the morning, their son became sick, so they stayed home. On Sunday he felt better, and the family visited a small museum.", "What did the family do on Sunday?", "They visited a museum.", ["They had a picnic.", "They went to a hospital.", "They stayed in bed all day."], "日曜日には small museum を訪れました。")
  ];

  function buildForm(id, title, reading, listening) {
    if (reading.length !== 35 || listening.length !== 30) {
      throw new Error(`${id}: expected 35 reading and 30 listening, got ${reading.length}/${listening.length}`);
    }
    const questions = [...reading, ...listening].map((spec, index) => choiceQuestion(id, index + 1, spec));
    return { id, title, duration: { readingMinutes: 35, listeningMinutes: 30 }, questions };
  }

  forms.push(buildForm("e4m-1", "第1回 本番ドリル", formAReading, formAListening));

  const formBReading = [
    short("短文空所", "I forgot my dictionary, so I (     ) one from the school library.", "borrowed", ["invited", "painted", "closed"], "辞書を忘れたため図書館から借りたので borrowed が合います。"),
    short("短文空所", "The sky is dark and gray. It will probably be (     ) this afternoon.", "rainy", ["sunny", "dry", "clear"], "暗い灰色の空から rainy が最も合います。"),
    short("短文空所", "My aunt's son is my (     ).", "cousin", ["uncle", "brother", "grandfather"], "おばの息子は cousin（いとこ）です。"),
    short("短文空所", "Please arrive (     ) the school gate by eight fifteen.", "at", ["in", "on", "from"], "具体的な地点に到着する場合は arrive at を使います。"),
    short("短文空所", "I have to (     ) my room before my friends come.", "clean", ["cleaned", "cleaning", "cleans"], "have to の後ろは動詞の原形です。"),
    short("短文空所", "A train is usually (     ) than a bicycle.", "faster", ["fast", "fastest", "more fast"], "than があるので fast の比較級 faster です。"),
    short("短文空所", "We went to the zoo (     ) the new baby panda.", "to see", ["saw", "seeing", "to saw"], "動物園へ行った目的は to see で表します。"),
    short("短文空所", "This red notebook is not Tom's. It is (     ).", "mine", ["my", "me", "I"], "名詞を置かず「私のもの」と表す所有代名詞 mine を使います。"),
    short("短文空所", "When I was six, I (     ) swim very well.", "couldn't", ["mustn't", "don't", "won't"], "過去の能力を表す can の過去形 could を否定にします。"),
    short("短文空所", "Wash your hands (     ) you eat lunch.", "before", ["because", "during", "than"], "昼食を食べる前なので before が合います。"),
    short("短文空所", "(     ) does it take from here to the airport? — About forty minutes.", "How long", ["How often", "How old", "How many"], "所要時間を尋ねるので How long です。"),
    short("短文空所", "There aren't (     ) students in the music room today.", "many", ["much", "a little", "any one"], "数えられる複数名詞 students には many を使います。"),
    short("短文空所", "The flower shop is (     ) the bank. You can see it on the other side of the street.", "across from", ["far from", "inside", "between to"], "道の反対側にあるので across from が合います。"),
    short("短文空所", "At eight last night, my family (     ) a travel program on TV.", "was watching", ["watches", "will watch", "is watched"], "昨夜8時に見ている途中だったので過去進行形です。"),
    short("短文空所", "Mr. White is the (     ) teacher at our school.", "oldest", ["older", "old", "most old"], "学校の先生全体の中で最も年上なので最上級 oldest です。"),
    dialogue("A: How was your school trip?\nB: (     )", "It was great. We saw an old castle.", ["Next Friday morning.", "For three buses.", "At the school gate."], "旅行がどうだったかを感想と出来事で答えています。"),
    dialogue("A: I'm sorry I stepped on your foot.\nB: (     )", "That's OK. It doesn't hurt.", ["My shoes are black.", "I walk every morning.", "The floor is clean."], "謝罪を受け入れる自然な応答です。"),
    dialogue("A: Which do you like better, spring or autumn?\nB: (     )", "Autumn. I like the cool weather.", ["April is the fourth month.", "I went there last spring.", "The flowers are on the table."], "二つの季節から好みを選び、理由を答えています。"),
    dialogue("A: Could you tell me where the science room is?\nB: (     )", "It's next to the computer room on the third floor.", ["Science is my favorite subject.", "Our teacher has a computer.", "The lesson was difficult."], "場所を尋ねられているので階と位置を答えます。"),
    dialogue("A: I can't go to the concert with you tomorrow.\nB: (     )", "That's too bad. Maybe next time.", ["The music was very loud.", "I bought the ticket there.", "Tomorrow is the concert."], "行けないと聞いたときの残念な気持ちを表す応答です。"),
    order("あなたはその箱の中に何を入れましたか。", ["What", "did", "you", "put", "in the box"], [2, 4], ["What ― you", "you ― in the box", "put ― did"]),
    order("私の父は日曜日に車を洗います。", ["My father", "washes", "his car", "on", "Sundays"], [2, 4], ["My father ― his car", "his car ― Sundays", "on ― washes"]),
    order("この映画はあの映画よりおもしろいです。", ["This movie", "is", "more interesting", "than", "that one"], [2, 4], ["This movie ― more interesting", "more interesting ― that one", "than ― is"]),
    order("私たちは放課後に図書館で勉強したいです。", ["We", "want", "to study", "at the library", "after school"], [2, 4], ["We ― to study", "to study ― after school", "at the library ― want"]),
    order("あなたのお兄さんは何歳ですか。", ["How", "old", "is", "your", "brother"], [2, 4], ["How ― is", "is ― brother", "your ― old"])
  ];
  const bNotice = `CITY POOL LESSONS\nChildren ages ten to fourteen can join our Saturday swimming lessons in October. Beginners meet from 9:00 to 10:00, and other swimmers meet from 10:30 to 11:30. Bring a towel and swimming cap. Sign up at the pool office by September 25.`;
  formBReading.push(
    readingPassage("長文・掲示", bNotice, "When do beginning swimmers meet?", "From 9:00 to 10:00.", ["From 10:00 to 11:00.", "From 10:30 to 11:30.", "From 11:30 to 12:30."], "初心者の時間は 9:00 to 10:00 です。"),
    readingPassage("長文・掲示", bNotice, "What must children do by September 25?", "Sign up at the pool office.", ["Buy a new towel.", "Practice at home.", "Meet their teacher."], "9月25日までに pool office で申込みます。")
  );
  const bEmail = `Hi Daniel,\nOur class will visit the science museum on Friday. We are taking the 8:40 bus from school, so please arrive by 8:20. The museum has a special space show at eleven. After lunch, we can choose the robot room or the nature room. I know you like animals, but I hope you will come to the robot room with me. Our teacher says we can visit the gift shop for fifteen minutes before we leave. I want to buy a small space postcard there. Bring your lunch and a pencil. We will get back to school around four.\nYour friend,\nHiro`;
  formBReading.push(
    readingPassage("長文・Eメール", bEmail, "What time should Daniel arrive at school?", "By 8:20.", ["By 8:40.", "By 11:00.", "By 4:00."], "バスは8:40で、8:20までに来るよう書かれています。"),
    readingPassage("長文・Eメール", bEmail, "What happens at eleven?", "A special space show.", ["A robot lesson.", "Lunch in the nature room.", "The bus returns to school."], "11時には special space show があります。"),
    readingPassage("長文・Eメール", bEmail, "Which room does Hiro want Daniel to visit with him?", "The robot room.", ["The nature room.", "The lunch room.", "The space room."], "Hiro は robot room に一緒に来てほしいと書いています。")
  );
  const bStory = `Saki wanted to learn how to make bread, so she joined a class at the community center. On the first day, the teacher asked everyone to work with a partner. Saki's partner was Mrs. Lee, an older woman who lived near her school. They mixed flour, water, and other things in a large bowl. Saki added too much water, and the dough became very soft. She wanted to start again, but Mrs. Lee showed her how to add a little flour and fix it. While their bread was in the oven, Mrs. Lee told Saki about food from her country. Their bread was not the most beautiful in the class, but it tasted good. After the lesson, Saki and Mrs. Lee decided to join the next class together. Saki learned that a mistake did not always mean she had to stop.`;
  formBReading.push(
    readingPassage("長文・説明文", bStory, "Why did Saki join the class?", "To learn how to make bread.", ["To meet her school teacher.", "To teach Mrs. Lee Japanese.", "To work at the community center."], "参加目的は bread の作り方を学ぶことです。"),
    readingPassage("長文・説明文", bStory, "Who was Saki's partner?", "Mrs. Lee.", ["Her mother.", "A student from her school.", "The center's cook."], "先生が組ませた相手は Mrs. Lee です。"),
    readingPassage("長文・説明文", bStory, "What mistake did Saki make?", "She added too much water.", ["She forgot the flour.", "She broke the oven.", "She used a very small bowl."], "Saki added too much water とあります。"),
    readingPassage("長文・説明文", bStory, "What did Mrs. Lee do while the bread was in the oven?", "She talked about food from her country.", ["She went back to her house.", "She made a new bowl.", "She called Saki's teacher."], "焼いている間に自国の食べ物について話しました。"),
    readingPassage("長文・説明文", bStory, "What did Saki learn?", "A mistake does not always mean she must stop.", ["Beautiful bread always tastes best.", "Older people do not make mistakes.", "Bread classes are easier at school."], "最後の文が話の学びを示しています。")
  );

  const formBListening = [
    response("🗺️", "観光", "Excuse me. Is the castle far from here?", "No. It's about a ten-minute walk.", ["It was built long ago.", "I took many pictures."], "距離を尋ねられ、歩く時間で答えています。"),
    response("🧹", "手伝い", "Thank you for cleaning the kitchen.", "You're welcome.", ["The kitchen is downstairs.", "I cook dinner at six."], "感謝に対する自然な返答です。"),
    response("🎻", "音楽", "How often do you practice the violin?", "Every evening.", ["For three years.", "In my room."], "How often は頻度を尋ねます。"),
    response("🍎", "買い物", "How much are these apples?", "They're three hundred yen.", ["There are six.", "They're very sweet."], "値段を尋ねているので金額で答えます。"),
    response("🏠", "訪問", "Please come in and take off your shoes here.", "Thank you.", ["I bought new shoes.", "The door is brown."], "家に招き入れられたときの自然な応答です。"),
    response("📷", "写真", "Can you take a picture of us?", "Sure. Stand by that tree.", ["This camera is mine.", "I saw the tree yesterday."], "写真撮影を頼まれて引き受けています。"),
    response("✏️", "教室", "I forgot my pencil case.", "You can use one of my pencils.", ["The case is yellow.", "I finished the test."], "困っている相手に鉛筆を貸す自然な応答です。"),
    response("🍽️", "食事", "What would you like for dinner?", "I'd like curry and rice.", ["At seven o'clock.", "I ate with my family."], "夕食に何がほしいかを料理名で答えています。"),
    response("🚪", "部屋", "Do you mind if I open the window?", "No, go ahead.", ["It opened at nine.", "The window is large."], "許可を求められ、認める自然な応答です。"),
    response("🎉", "知らせ", "I won first prize in the speech contest!", "That's wonderful!", ["The speech was at school.", "I have one prize."], "よい知らせに祝福・喜びを示します。"),
    listeningDialogue({ emoji: "🚆", label: "駅" }, [{ speaker: "A", text: "The train to West Town leaves from platform four." }, { speaker: "B", text: "Is that the nine ten train?" }, { speaker: "A", text: "No, ours leaves at nine thirty." }], "What time does their train leave?", "At 9:30.", ["At 9:00.", "At 9:10.", "At 10:30."], "二人の列車は nine thirty です。"),
    listeningDialogue({ emoji: "👕", label: "服の店" }, [{ speaker: "A", text: "Do you have this shirt in green?" }, { speaker: "B", text: "We have green in small, but only blue in medium." }, { speaker: "A", text: "Medium fits me, so I'll take the blue one." }], "Which shirt will the man buy?", "A medium blue shirt.", ["A small green shirt.", "A medium green shirt.", "A large blue shirt."], "medium が合うため blue を選びます。"),
    listeningDialogue({ emoji: "🏥", label: "病院" }, [{ speaker: "A", text: "I have a sore throat and a fever." }, { speaker: "B", text: "Please stay home tomorrow and drink a lot of water." }], "What should the girl do tomorrow?", "Stay home.", ["Go swimming.", "Visit school.", "Play outside."], "医師は tomorrow stay home と指示しています。"),
    listeningDialogue({ emoji: "🐈", label: "ペット" }, [{ speaker: "A", text: "Where is Coco? She isn't in the living room." }, { speaker: "B", text: "I saw her under your bed a minute ago." }], "Where is Coco probably now?", "Under the bed.", ["In the living room.", "In the garden.", "On the sofa."], "1分前に under the bed で見たと言っています。"),
    listeningDialogue({ emoji: "🥪", label: "昼食" }, [{ speaker: "A", text: "I made two sandwiches, one with cheese and one with egg." }, { speaker: "B", text: "I don't eat eggs. Can I have the cheese one?" }], "Which sandwich does the girl want?", "The cheese sandwich.", ["The egg sandwich.", "Both sandwiches.", "Neither sandwich."], "卵を食べないため cheese を選びます。"),
    listeningDialogue({ emoji: "🏀", label: "部活動" }, [{ speaker: "A", text: "Basketball practice usually ends at five." }, { speaker: "B", text: "But today the gym closes early, so we'll finish at four thirty." }], "When will practice end today?", "At 4:30.", ["At 4:00.", "At 5:00.", "At 5:30."], "今日は体育館が早く閉まるため4:30です。"),
    listeningDialogue({ emoji: "📦", label: "配達" }, [{ speaker: "A", text: "A package came for you this morning." }, { speaker: "B", text: "Great. Is it on my desk?" }, { speaker: "A", text: "No, Mom put it by the front door." }], "Where is the package?", "By the front door.", ["On the desk.", "In the kitchen.", "At the post office."], "母が front door のそばに置きました。"),
    listeningDialogue({ emoji: "🎨", label: "美術" }, [{ speaker: "A", text: "Your picture of the mountains is beautiful." }, { speaker: "B", text: "Thanks. I painted it during our trip last summer." }], "When did the girl paint the picture?", "Last summer.", ["This spring.", "Yesterday.", "Next winter."], "last summer の旅行中に描きました。"),
    listeningDialogue({ emoji: "📅", label: "予定" }, [{ speaker: "A", text: "Can we study together on Tuesday?" }, { speaker: "B", text: "I have piano on Tuesday and soccer on Wednesday. How about Thursday?" }, { speaker: "A", text: "Thursday is fine." }], "When will they study together?", "On Thursday.", ["On Tuesday.", "On Wednesday.", "On Friday."], "二人は Thursday に決めました。"),
    listeningDialogue({ emoji: "🎟️", label: "動物園" }, [{ speaker: "A", text: "Two student tickets, please." }, { speaker: "B", text: "They are six hundred yen each." }, { speaker: "A", text: "Here is twelve hundred yen." }], "How much is one student ticket?", "600 yen.", ["300 yen.", "1,000 yen.", "1,200 yen."], "each six hundred yen と言っています。"),
    listeningTalk({ emoji: "🌦️", label: "天気予報" }, "Tomorrow morning will be cloudy, but rain will start after lunch. The rain will stop in the evening. Sunday will be sunny and warmer than Saturday.", "When will the rain start?", "After lunch.", ["Early in the morning.", "In the evening.", "On Sunday night."], "雨は after lunch に始まります。"),
    listeningTalk({ emoji: "🏛️", label: "博物館" }, "The history museum is free for children this week. It opens at nine thirty and closes at five. The cafe is closed, so visitors should bring a drink.", "Why should visitors bring a drink?", "The cafe is closed.", ["Drinks are free.", "The museum is hot.", "Children cannot enter the cafe."], "cafe が休みだからです。"),
    listeningTalk({ emoji: "🐶", label: "迷子の犬" }, "A small white dog was found near Green Station this morning. It has a red collar but no name tag. The dog is now at the police box beside the station.", "Where is the dog now?", "At the police box.", ["On a train.", "At Green Park.", "In a pet store."], "現在は station 横の police box にいます。"),
    listeningTalk({ emoji: "🍲", label: "料理教室" }, "Today's cooking class starts at four in room twelve. We will make vegetable soup. The center will give you vegetables, but please bring a knife and a large bowl.", "What should students bring?", "A knife and a bowl.", ["Vegetables and soup.", "A plate and a cup.", "Bread and butter."], "持ち物は knife と large bowl です。"),
    listeningTalk({ emoji: "🧑‍🌾", label: "仕事紹介" }, "Mr. Brown works on a farm outside the city. He gets up at five and feeds the cows first. In the afternoon, he takes vegetables to a market in town.", "What does Mr. Brown do first?", "He feeds the cows.", ["He goes to the market.", "He picks flowers.", "He drives to the city."], "起床後まず cows に餌をやります。"),
    listeningTalk({ emoji: "🏃", label: "マラソン" }, "Mina joined a five-kilometer race on Sunday. She practiced for two months. Her father ran with her, and they finished in forty-two minutes.", "Who ran with Mina?", "Her father.", ["Her teacher.", "Her brother.", "Her friend."], "father ran with her とあります。"),
    listeningTalk({ emoji: "✈️", label: "空港" }, "Flight two fourteen to Osaka will leave thirty minutes late because of strong wind. Passengers should stay near gate seven and listen for another announcement.", "Why will the flight leave late?", "Because of strong wind.", ["The gate is closed.", "The plane is too small.", "The passengers arrived late."], "原因は strong wind です。"),
    listeningTalk({ emoji: "🧪", label: "科学部" }, "The science club meets every Friday after school. This month, members are building small cars. Next month, they will visit a factory that makes robots.", "What are the club members making this month?", "Small cars.", ["Large robots.", "Science books.", "A factory."], "this month は small cars を作っています。"),
    listeningTalk({ emoji: "📮", label: "手紙" }, "Yuki wrote a letter to her friend in Australia. She put three pictures of her school festival in it. She will take the letter to the post office after lunch.", "What did Yuki put in the letter?", "Three pictures.", ["A festival ticket.", "An English book.", "Some money."], "school festival の写真3枚を入れました。"),
    listeningTalk({ emoji: "🎭", label: "劇" }, "Our class play begins at six on Friday evening. The actors must come at four thirty, and other students should arrive by five to help with chairs.", "By what time should students who help with chairs arrive?", "By 5:00.", ["By 4:00.", "By 4:30.", "By 6:00."], "いすを手伝う生徒は by five です。")
  ];
  forms.push(buildForm("e4m-2", "第2回 本番ドリル", formBReading, formBListening));

  const formCReading = [
    short("短文空所", "Please read the question (     ) before you answer it.", "carefully", ["cheaply", "hungrily", "cloudy"], "答える前に問題を注意深く読むので carefully が合います。"),
    short("短文空所", "The bus was very (     ), so we had to stand.", "crowded", ["empty", "quietly", "delicious"], "立たなければならないほど人が多いので crowded です。"),
    short("短文空所", "I'm busy now. Can I call you (     )?", "later", ["ago", "early", "last"], "今は忙しいので「あとで」を表す later が合います。"),
    short("短文空所", "This cup is dirty. Could I have (     ) one?", "another", ["other", "more", "each"], "同じ種類の別の1つは another で表します。"),
    short("短文空所", "Our school is (     ) the library and the fire station.", "between", ["through", "during", "without"], "2か所の間なので between A and B です。"),
    short("短文空所", "Mai wants (     ) a nurse in the future.", "to become", ["becoming", "became", "to became"], "want to の後ろは動詞の原形です。"),
    short("短文空所", "My new desk is (     ) than my old one.", "larger", ["large", "largest", "more large"], "than があるため large の比較級 larger です。"),
    short("短文空所", "When we arrived at Grandma's house, she (     ) lunch.", "was making", ["makes", "will make", "is make"], "到着した時に作っている途中だったので過去進行形です。"),
    short("短文空所", "My sister gave this book (     ) me for my birthday.", "to", ["at", "by", "from"], "give A to B で「AをBに与える」です。"),
    short("短文空所", "There is (     ) milk in the bottle, so we can make two cups of cocoa.", "some", ["many", "a few", "any one"], "肯定文で量を表す不可算名詞 milk には some が合います。"),
    short("短文空所", "Sam can run the (     ) in his class.", "fastest", ["faster", "fast", "most fast"], "クラス全員の中で最も速いので最上級 fastest です。"),
    short("短文空所", "Please (     ) the light when you leave the room.", "turn off", ["look after", "get on", "put up"], "部屋を出るとき照明を消すので turn off です。"),
    short("短文空所", "My father usually goes to work (     ) train.", "by", ["on", "with", "at"], "交通手段は by train と表します。"),
    short("短文空所", "I was tired, (     ) I finished my homework before bed.", "but", ["because", "or", "so that"], "疲れていたが宿題を終えたという逆接なので but です。"),
    short("短文空所", "(     ) bag is yours, the black one or the brown one?", "Which", ["Who", "When", "How much"], "二つからどちらかを尋ねるので Which です。"),
    dialogue("A: Your English speech was very good.\nB: (     )", "Thank you. I practiced every day.", ["The speech starts at ten.", "English is in this book.", "I heard it on Monday."], "ほめられたときに感謝を述べる自然な応答です。"),
    dialogue("A: What are you going to do during winter vacation?\nB: (     )", "I'm going to stay with my grandparents.", ["It was very cold yesterday.", "Winter comes after autumn.", "My grandparents are sixty."], "冬休みの予定を be going to で答えています。"),
    dialogue("A: Could I borrow your ruler?\nB: (     )", "Sure. Here you are.", ["It is thirty centimeters long.", "I bought paper too.", "The math test was easy."], "物を借りたいという依頼を受け入れています。"),
    dialogue("A: Why were you late for school?\nB: (     )", "Because my bus came twenty minutes late.", ["At the school entrance.", "For about six hours.", "I like going by bus."], "遅刻の理由を because で答えています。"),
    dialogue("A: Let's have lunch outside today.\nB: (     )", "Good idea. The weather is beautiful.", ["I had a sandwich yesterday.", "The cafe has ten tables.", "Lunch is in my bag."], "提案に賛成する自然な応答です。"),
    order("あなたはいつこの写真を撮りましたか。", ["When", "did", "you", "take", "this picture"], [2, 4], ["When ― you", "you ― this picture", "take ― did"]),
    order("私の母は私より早く起きます。", ["My mother", "gets up", "earlier", "than", "I do"], [2, 4], ["My mother ― earlier", "earlier ― I do", "than ― gets up"]),
    order("彼は弟のために夕食を作りました。", ["He", "made", "dinner", "for", "his brother"], [2, 4], ["He ― dinner", "dinner ― his brother", "for ― made"]),
    order("あなたは窓を開けてもいいですか。", ["May", "I", "open", "the", "window"], [2, 4], ["May ― open", "open ― window", "the ― I"]),
    order("駅の近くに大きな公園があります。", ["There", "is", "a large park", "near", "the station"], [2, 4], ["There ― a large park", "a large park ― the station", "near ― is"])
  ];
  const cNotice = `WEEKEND BIKE SAFETY CLASS\nLearn how to check your bicycle before a ride. The free class is on August 23 from 1:00 to 2:30 at East Community Center. Students must bring a bicycle and helmet. Parents may watch. Call the center by August 18 because only fifteen students can join.`;
  formCReading.push(
    readingPassage("長文・掲示", cNotice, "What must students bring?", "A bicycle and helmet.", ["A map and a phone.", "Money for the class.", "A parent and a teacher."], "必要な持ち物は bicycle と helmet です。"),
    readingPassage("長文・掲示", cNotice, "Why should students call by August 18?", "Only fifteen students can join.", ["The class may move outside.", "The center closes that day.", "Parents need a bicycle too."], "参加できるのが15人だけなので早めの連絡が必要です。")
  );
  const cEmail = `Hi Owen,\nI'm glad you can stay at my house next weekend. My mother will meet you at North Station at 10:15 on Saturday. I have baseball practice until noon, so I will see you at home after that. In the afternoon, we can ride bicycles to the new sports park. It has a basketball court and a climbing wall, but we can choose what to do when we get there. On Sunday morning, my family is going to make Japanese noodles together. Please bring comfortable shoes and a light jacket because the evening may be cool. What kind of food do you not eat?\nYour friend,\nRiku`;
  formCReading.push(
    readingPassage("長文・Eメール", cEmail, "Who will meet Owen at the station?", "Riku's mother.", ["Riku's baseball coach.", "Riku's brother.", "Owen's mother."], "駅で迎えるのは Riku's mother です。"),
    readingPassage("長文・Eメール", cEmail, "Why can't Riku meet Owen at the station?", "He has baseball practice.", ["He must make noodles.", "He is visiting the sports park.", "He is buying a jacket."], "Riku は正午まで baseball practice があります。"),
    readingPassage("長文・Eメール", cEmail, "What does Riku ask Owen about?", "Food he does not eat.", ["His bicycle size.", "His favorite baseball team.", "The time of his train home."], "最後に食べない食べ物の種類を尋ねています。")
  );
  const cStory = `One Saturday morning, Mei and her father rode their bicycles to a farmers' market. Mei wanted to buy strawberries for a cake. At the market, she noticed a boy looking under the tables. He said that he lost a small blue wallet. Mei and her father helped him look for it, but they could not find it. Then Mei remembered seeing something blue near the bicycle parking area. They went back and found the wallet beside a red bicycle. The boy checked it and was happy because his bus card and money were still inside. His mother gave Mei some oranges from their fruit shop to thank her. Mei did not buy strawberries because the market was closing, but she made an orange cake instead. Her family liked it so much that she decided to make it again for her grandmother's birthday.`;
  formCReading.push(
    readingPassage("長文・説明文", cStory, "Why did Mei go to the farmers' market?", "To buy strawberries.", ["To find a bicycle.", "To meet her grandmother.", "To sell an orange cake."], "最初の目的は cake 用の strawberries を買うことです。"),
    readingPassage("長文・説明文", cStory, "What was the boy looking for?", "A small blue wallet.", ["A red bicycle.", "A bus ticket.", "A bag of oranges."], "boy は small blue wallet をなくして探していました。"),
    readingPassage("長文・説明文", cStory, "Where did they find the wallet?", "Beside a red bicycle.", ["Under a market table.", "Inside the fruit shop.", "Near Mei's house."], "wallet は red bicycle のそばにありました。"),
    readingPassage("長文・説明文", cStory, "Why did the boy's mother give Mei oranges?", "To thank her for helping.", ["To sell them before closing.", "To use them on the bus.", "To invite her to the fruit shop."], "財布探しを手伝ったお礼です。"),
    readingPassage("長文・説明文", cStory, "What did Mei finally make?", "An orange cake.", ["A strawberry cake.", "Orange juice.", "A birthday card."], "苺を買えず、代わりに orange cake を作りました。")
  );

  const formCListening = [
    response("🎒", "持ち物", "Don't forget your lunch for the trip.", "I put it in my bag already.", ["Lunch starts at noon.", "The trip was fun."], "忘れないよう言われ、すでにかばんに入れたと答えています。"),
    response("🌡️", "体調", "How are you feeling today?", "Much better, thank you.", ["At the hospital.", "For three days."], "体調がどうかに状態で答えています。"),
    response("🏸", "スポーツ", "Would you like to play badminton with us?", "Sure. I have my racket.", ["It was on television.", "The gym is very big."], "誘いを受ける自然な応答です。"),
    response("📝", "試験", "Was the math test difficult?", "No, it was easier than I expected.", ["It starts after lunch.", "I have two pencils."], "難しかったかという質問に感想を答えています。"),
    response("📕", "本", "What did you think of this story?", "I liked the ending very much.", ["It is on the shelf.", "I read for an hour."], "物語の感想を尋ねられています。"),
    response("🚉", "駅", "Excuse me, where can I buy a ticket?", "At that machine by the entrance.", ["The train was crowded.", "A ticket is in my pocket."], "切符を買う場所を案内しています。"),
    response("🪟", "教室", "It's getting hot in here.", "Shall I open the window?", ["Summer is my favorite season.", "The window was cleaned."], "暑いという発話に対して窓を開ける提案が自然です。"),
    response("🐠", "水族館", "Which fish did you like best?", "The small yellow ones.", ["There were many visitors.", "I went there by train."], "どの魚が一番好きかに種類で答えています。"),
    response("⏰", "遅刻", "Hurry up, or we'll miss the bus.", "Okay. I'm coming now.", ["The bus is green.", "I missed school yesterday."], "急ぐよう促され、今行くと返しています。"),
    response("🎁", "贈り物", "This is a little present for you.", "Thank you. That's very kind of you.", ["It is in a small box.", "I went shopping too."], "贈り物を受け取った感謝を表しています。"),
    listeningDialogue({ emoji: "☕", label: "カフェ" }, [{ speaker: "A", text: "Can I have a hot chocolate?" }, { speaker: "B", text: "Sorry, the machine isn't working. We have tea and apple juice." }, { speaker: "A", text: "Then I'll have tea." }], "What will the customer drink?", "Tea.", ["Hot chocolate.", "Apple juice.", "Water."], "機械が使えず tea を選びました。"),
    listeningDialogue({ emoji: "📚", label: "図書館" }, [{ speaker: "A", text: "I need a book about stars for my report." }, { speaker: "B", text: "Science books are upstairs, next to the study room." }], "Where should the student go?", "Upstairs.", ["Outside.", "To the front desk.", "To the first classroom."], "science books は upstairs にあります。"),
    listeningDialogue({ emoji: "🚶", label: "道" }, [{ speaker: "A", text: "Is the hotel near the station?" }, { speaker: "B", text: "Yes. Walk past the bank and turn left. It's across from the park." }], "What is across from the park?", "The hotel.", ["The station.", "The bank.", "A school."], "道案内の it は hotel を指します。"),
    listeningDialogue({ emoji: "🎂", label: "パーティー" }, [{ speaker: "A", text: "How many people are coming to your party?" }, { speaker: "B", text: "I invited eight friends, but two cannot come." }], "How many friends will come?", "Six.", ["Two.", "Eight.", "Ten."], "8人招待し2人来られないので6人です。"),
    listeningDialogue({ emoji: "🧤", label: "落とし物" }, [{ speaker: "A", text: "I found this glove by the front gate." }, { speaker: "B", text: "It isn't mine. Mine are black, and that one is brown." }], "What color are the girl's gloves?", "Black.", ["Brown.", "Blue.", "White."], "girl の手袋は black です。"),
    listeningDialogue({ emoji: "🚌", label: "遠足" }, [{ speaker: "A", text: "The bus ride to the farm takes an hour." }, { speaker: "B", text: "We leave school at eight, so we'll arrive around nine." }], "When will they arrive at the farm?", "Around 9:00.", ["Around 7:00.", "Around 8:00.", "Around 10:00."], "8時出発で1時間かかるため9時頃です。"),
    listeningDialogue({ emoji: "🧁", label: "お菓子作り" }, [{ speaker: "A", text: "We need three eggs for the cake." }, { speaker: "B", text: "There is only one in the refrigerator. I'll go buy two more." }], "How many eggs will the boy buy?", "Two.", ["One.", "Three.", "Four."], "必要3個、手元1個なので2個買います。"),
    listeningDialogue({ emoji: "🎸", label: "音楽" }, [{ speaker: "A", text: "Do you still play the piano?" }, { speaker: "B", text: "Not now. I started guitar lessons last month." }], "What instrument is the girl learning now?", "The guitar.", ["The piano.", "The violin.", "The drums."], "現在は guitar lessons を受けています。"),
    listeningDialogue({ emoji: "🌧️", label: "予定変更" }, [{ speaker: "A", text: "The picnic is canceled because of the rain." }, { speaker: "B", text: "Then let's visit the indoor sports center." }], "Why was the picnic canceled?", "Because of the rain.", ["The park was crowded.", "The food was late.", "The sports center was closed."], "中止理由は rain です。"),
    listeningDialogue({ emoji: "🧑‍🏫", label: "授業" }, [{ speaker: "A", text: "Where should I put my report?" }, { speaker: "B", text: "Please leave it on my desk before lunch." }], "Where should the student put the report?", "On the teacher's desk.", ["In the library.", "Under a chair.", "In the student's bag."], "先生の desk の上に置きます。"),
    listeningTalk({ emoji: "📻", label: "ラジオ" }, "Good morning. Today will be sunny until late afternoon. Strong wind will begin around five, so people near the river should go home early.", "When will the strong wind begin?", "Around 5:00.", ["Early in the morning.", "Around noon.", "After midnight."], "strong wind は around five に始まります。"),
    listeningTalk({ emoji: "🏕️", label: "キャンプ" }, "The school camping trip is next Monday and Tuesday. Students should bring a flashlight and warm socks. The school will prepare tents and all meals.", "What will the school prepare?", "Tents and meals.", ["Flashlights and socks.", "Bicycles and maps.", "Books and pencils."], "学校が用意するのは tents と meals です。"),
    listeningTalk({ emoji: "🐘", label: "動物園" }, "The zoo's baby elephant is one year old today. Visitors can watch it eat fruit at eleven. The elephant house closes from noon to one for cleaning.", "What happens at eleven?", "The baby elephant eats fruit.", ["The zoo closes.", "The elephant house is cleaned.", "Visitors feed all the animals."], "11時に baby elephant が fruit を食べます。"),
    listeningTalk({ emoji: "🏡", label: "引っ越し" }, "The Kim family moved to a new house last week. It is farther from the father's office, but it has a garden for the children and their dog.", "Why do the children like the new house?", "It has a garden.", ["It is near their father's office.", "It has no pets.", "It is next to their school."], "子どもと犬のための garden があります。"),
    listeningTalk({ emoji: "📖", label: "読書会" }, "The children's book club meets on the first Saturday of every month. This month, members will talk about a story from India and make a bookmark.", "What will members make?", "A bookmark.", ["An Indian meal.", "A storybook.", "A club poster."], "今月は bookmark を作ります。"),
    listeningTalk({ emoji: "🥕", label: "畑" }, "Mr. Ito grows carrots and potatoes on his farm. This summer was very hot, so the carrots were small, but the potatoes grew well.", "Which vegetables grew well?", "The potatoes.", ["The carrots.", "The tomatoes.", "The onions."], "よく育ったのは potatoes です。"),
    listeningTalk({ emoji: "🚢", label: "港" }, "The sightseeing boat leaves at ten and two every day. Today's ten o'clock boat is full, but there are seats on the two o'clock boat.", "Which boat has seats today?", "The 2:00 boat.", ["The 9:00 boat.", "The 10:00 boat.", "The 12:00 boat."], "空席があるのは two o'clock boat です。"),
    listeningTalk({ emoji: "🏐", label: "試合" }, "Our volleyball team lost the first game but won the next two. The final game begins at three this afternoon in the large gym.", "How many games did the team win?", "Two.", ["One.", "Three.", "Four."], "最初は負け、次の2試合に勝ちました。"),
    listeningTalk({ emoji: "🧳", label: "旅行" }, "Emma will visit her cousin in Nagoya during spring vacation. She planned to fly, but she found a cheaper train ticket and will travel by train.", "How will Emma travel to Nagoya?", "By train.", ["By plane.", "By bus.", "By car."], "安い train ticket を見つけ、列車で行きます。"),
    listeningTalk({ emoji: "🧼", label: "ボランティア" }, "Twenty students cleaned the beach on Sunday. They collected twelve bags of trash in two hours. Next month, they will clean the park near their school.", "Where will the students clean next month?", "A park near their school.", ["The same beach.", "A train station.", "A school classroom."], "next month は school 近くの park です。")
  ];
  forms.push(buildForm("e4m-3", "第3回 本番ドリル", formCReading, formCListening));

  if (forms.length !== 3 || forms.some((form) => form.questions.length !== 65)) {
    throw new Error("EIKEN Grade 4 mock exams must contain three 65-question forms.");
  }
  window.EIKEN_GRADE4_EXAMS = { id: "eiken-grade4-exam", contentVersion: 1, source: SOURCE, forms };
})();
