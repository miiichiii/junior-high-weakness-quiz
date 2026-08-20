(function () {
  "use strict";

  const wordGroups = [
    ["家族", "名詞", [
      ["family", "家族", "My family eats dinner together.", "私の家族は一緒に夕食を食べます。", "family member"],
      ["parent", "親・保護者", "A parent came to our school today.", "今日、保護者が学校に来ました。", "my parents"],
      ["mother", "母", "My mother gets up at six.", "私の母は6時に起きます。", "mother and father"],
      ["father", "父", "My father made lunch for us.", "父が私たちに昼食を作りました。", "my father’s car"],
      ["brother", "兄・弟", "My brother plays tennis well.", "私の兄（弟）はテニスが上手です。", "older brother"],
      ["sister", "姉・妹", "My sister is reading in her room.", "私の姉（妹）は部屋で本を読んでいます。", "younger sister"],
      ["uncle", "おじ", "My uncle lives near the station.", "私のおじは駅の近くに住んでいます。", "my uncle’s house"],
      ["aunt", "おば", "My aunt sent me a birthday card.", "おばが私に誕生日カードを送りました。", "my aunt and uncle"],
      ["cousin", "いとこ", "I visited my cousin last weekend.", "先週末、いとこを訪ねました。", "my cousin Ken"],
      ["child", "子ども", "The child is waiting for her mother.", "その子どもは母親を待っています。", "two children"]
    ]],
    ["人・職業", "名詞", [
      ["friend", "友達", "I went to the museum with a friend.", "友達と博物館へ行きました。", "best friend"],
      ["classmate", "同級生", "My classmate helped me with math.", "同級生が数学を手伝ってくれました。", "a new classmate"],
      ["student", "生徒・学生", "Every student has a new textbook.", "どの生徒も新しい教科書を持っています。", "junior high school student"],
      ["teacher", "先生", "Our teacher told us about Canada.", "先生が私たちにカナダについて話しました。", "English teacher"],
      ["doctor", "医師", "The doctor asked me to rest.", "医師は私に休むよう言いました。", "see a doctor"],
      ["nurse", "看護師", "The nurse brought me some water.", "看護師が水を持ってきてくれました。", "work as a nurse"],
      ["clerk", "店員", "The clerk showed me a blue shirt.", "店員が青いシャツを見せてくれました。", "store clerk"],
      ["farmer", "農家・農夫", "The farmer grows vegetables.", "その農家は野菜を育てています。", "work on a farm"],
      ["driver", "運転手", "The bus driver was very kind.", "バスの運転手はとても親切でした。", "taxi driver"],
      ["player", "選手・演奏者", "The soccer player practiced every day.", "そのサッカー選手は毎日練習しました。", "piano player"]
    ]],
    ["学校・施設", "名詞", [
      ["school", "学校", "Our school has a large library.", "私たちの学校には大きな図書館があります。", "at school"],
      ["classroom", "教室", "The students cleaned the classroom.", "生徒たちは教室を掃除しました。", "in the classroom"],
      ["library", "図書館", "I borrowed two books from the library.", "図書館で本を2冊借りました。", "city library"],
      ["gym", "体育館", "The basketball game is in the gym.", "バスケットボールの試合は体育館であります。", "school gym"],
      ["office", "事務所・職員室", "Please take this paper to the office.", "この紙を職員室へ持っていってください。", "school office"],
      ["hospital", "病院", "She went to the hospital yesterday.", "彼女は昨日病院へ行きました。", "in the hospital"],
      ["station", "駅", "Let’s meet in front of the station.", "駅の前で会いましょう。", "train station"],
      ["airport", "空港", "We arrived at the airport at nine.", "私たちは9時に空港へ着きました。", "at the airport"],
      ["museum", "博物館・美術館", "The museum closes at five.", "博物館は5時に閉まります。", "history museum"],
      ["restaurant", "レストラン", "This restaurant serves Italian food.", "このレストランではイタリア料理を出します。", "Chinese restaurant"]
    ]],
    ["町・自然", "名詞", [
      ["store", "店", "The store opens at ten.", "その店は10時に開きます。", "book store"],
      ["bakery", "パン屋", "I bought bread at the bakery.", "パン屋でパンを買いました。", "near the bakery"],
      ["bank", "銀行", "Turn left at the bank.", "銀行のところで左に曲がってください。", "next to the bank"],
      ["post office", "郵便局", "I sent the package at the post office.", "郵便局で荷物を送りました。", "go to the post office"],
      ["hotel", "ホテル", "Our hotel was near the beach.", "私たちのホテルは浜辺の近くでした。", "stay at a hotel"],
      ["park", "公園", "Many children are playing in the park.", "多くの子どもが公園で遊んでいます。", "city park"],
      ["beach", "浜辺・海岸", "We picked up trash on the beach.", "私たちは浜辺でごみを拾いました。", "go to the beach"],
      ["mountain", "山", "That mountain is covered with snow.", "あの山は雪で覆われています。", "climb a mountain"],
      ["river", "川", "A long bridge crosses the river.", "長い橋がその川にかかっています。", "near the river"],
      ["lake", "湖", "We walked around the lake.", "私たちは湖の周りを歩きました。", "Lake City"]
    ]],
    ["食事", "名詞", [
      ["breakfast", "朝食", "I had eggs for breakfast.", "朝食に卵を食べました。", "have breakfast"],
      ["lunch", "昼食", "We ate lunch under a tree.", "私たちは木の下で昼食を食べました。", "school lunch"],
      ["dinner", "夕食", "Dad is cooking dinner now.", "父は今夕食を作っています。", "after dinner"],
      ["meal", "食事", "This was the best meal of our trip.", "これは旅行中で一番おいしい食事でした。", "a hot meal"],
      ["food", "食べ物・料理", "Japanese food is popular here.", "ここでは日本食が人気です。", "favorite food"],
      ["drink", "飲み物", "You can buy a cold drink here.", "ここで冷たい飲み物を買えます。", "food and drinks"],
      ["bread", "パン", "We need some bread for the sandwiches.", "サンドイッチ用のパンが必要です。", "a piece of bread"],
      ["rice", "米・ご飯", "Would you like more rice?", "ご飯をもう少しいかがですか。", "curry and rice"],
      ["vegetable", "野菜", "My grandmother grows vegetables.", "祖母は野菜を育てています。", "vegetable soup"],
      ["fruit", "果物", "This shop sells fresh fruit.", "この店では新鮮な果物を売っています。", "fruit salad"]
    ]],
    ["食べ物・飲み物", "名詞", [
      ["apple", "りんご", "There are three apples on the table.", "テーブルの上にりんごが3個あります。", "apple pie"],
      ["orange", "オレンジ", "She cut the orange in half.", "彼女はオレンジを半分に切りました。", "orange juice"],
      ["egg", "卵", "We need two eggs to make the cake.", "ケーキを作るには卵が2個必要です。", "boiled egg"],
      ["cake", "ケーキ", "Would you like some more cake?", "ケーキをもう少しいかがですか。", "birthday cake"],
      ["sandwich", "サンドイッチ", "I made sandwiches for our picnic.", "ピクニック用にサンドイッチを作りました。", "a cheese sandwich"],
      ["soup", "スープ", "The soup is very hot now.", "そのスープは今とても熱いです。", "vegetable soup"],
      ["water", "水", "Please bring a bottle of water.", "水を1本持ってきてください。", "drink water"],
      ["milk", "牛乳", "My brother drinks milk every morning.", "弟は毎朝牛乳を飲みます。", "a glass of milk"],
      ["juice", "ジュース", "May I have some apple juice?", "りんごジュースをいただけますか。", "orange juice"],
      ["coffee", "コーヒー", "My mother doesn’t drink coffee at night.", "母は夜にコーヒーを飲みません。", "a cup of coffee"]
    ]],
    ["学用品・情報", "名詞", [
      ["book", "本", "This book is about sea animals.", "この本は海の動物についてです。", "read a book"],
      ["notebook", "ノート", "I wrote the date in my notebook.", "ノートに日付を書きました。", "science notebook"],
      ["textbook", "教科書", "I left my textbook at school.", "教科書を学校に置いてきました。", "English textbook"],
      ["dictionary", "辞書", "Use a dictionary to check the word.", "その単語を辞書で調べてください。", "English dictionary"],
      ["letter", "手紙", "I got a letter from my cousin.", "いとこから手紙をもらいました。", "write a letter"],
      ["email", "Eメール", "Please send me an email tonight.", "今夜私にEメールを送ってください。", "by email"],
      ["picture", "絵・写真", "She showed me a picture of her dog.", "彼女は犬の写真を見せてくれました。", "take a picture"],
      ["map", "地図", "This map shows all the bus stops.", "この地図には全てのバス停が載っています。", "look at a map"],
      ["ticket", "切符・チケット", "I bought two concert tickets.", "コンサートのチケットを2枚買いました。", "train ticket"],
      ["report", "レポート・報告", "My history report is due on Friday.", "歴史のレポートは金曜日が締切です。", "write a report"]
    ]],
    ["家・部屋", "名詞", [
      ["desk", "机", "Your book is under the desk.", "あなたの本は机の下にあります。", "on my desk"],
      ["chair", "いす", "Please put the chair by the window.", "いすを窓のそばに置いてください。", "sit on a chair"],
      ["table", "テーブル", "Dinner is ready on the table.", "テーブルに夕食の用意ができています。", "at the table"],
      ["door", "ドア", "Someone is standing by the door.", "誰かがドアのそばに立っています。", "open the door"],
      ["window", "窓", "Could you close the window?", "窓を閉めてくれますか。", "by the window"],
      ["room", "部屋", "We need to clean this room.", "この部屋を掃除する必要があります。", "living room"],
      ["kitchen", "台所", "Mom is in the kitchen now.", "母は今台所にいます。", "school kitchen"],
      ["garden", "庭", "There are many flowers in the garden.", "庭には花がたくさんあります。", "in the garden"],
      ["house", "家・建物", "Their house has a red roof.", "彼らの家には赤い屋根があります。", "near my house"],
      ["home", "家・家庭", "I stayed home because it was raining.", "雨だったので家にいました。", "at home"]
    ]],
    ["時", "名詞", [
      ["day", "日", "It was a busy day for everyone.", "みんなにとって忙しい一日でした。", "every day"],
      ["week", "週", "We have music class twice a week.", "音楽の授業は週2回あります。", "next week"],
      ["month", "月", "The festival is next month.", "祭りは来月です。", "last month"],
      ["year", "年", "My family visits Kyoto every year.", "私の家族は毎年京都を訪れます。", "last year"],
      ["morning", "朝・午前", "I walk my dog every morning.", "毎朝犬を散歩させます。", "in the morning"],
      ["afternoon", "午後", "The meeting starts this afternoon.", "会議は今日の午後に始まります。", "tomorrow afternoon"],
      ["evening", "夕方・晩", "We watched a movie in the evening.", "私たちは夕方に映画を見ました。", "in the evening"],
      ["night", "夜", "The stars were beautiful last night.", "昨夜は星がきれいでした。", "at night"],
      ["weekend", "週末", "What are you doing this weekend?", "今週末は何をしますか。", "last weekend"],
      ["vacation", "休暇", "We traveled to Hokkaido during vacation.", "休暇中に北海道へ旅行しました。", "summer vacation"]
    ]],
    ["天気・季節", "名詞", [
      ["weather", "天気", "The weather will be warm tomorrow.", "明日は暖かい天気になるでしょう。", "weather report"],
      ["rain", "雨", "The rain stopped at noon.", "雨は正午にやみました。", "heavy rain"],
      ["snow", "雪", "The children played in the snow.", "子どもたちは雪の中で遊びました。", "a lot of snow"],
      ["wind", "風", "The wind was strong near the sea.", "海の近くは風が強かったです。", "strong wind"],
      ["cloud", "雲", "A dark cloud covered the sun.", "黒い雲が太陽を覆いました。", "in the clouds"],
      ["season", "季節", "Spring is my favorite season.", "春は私の好きな季節です。", "four seasons"],
      ["spring", "春", "Many flowers bloom in spring.", "春には多くの花が咲きます。", "next spring"],
      ["summer", "夏", "We often go swimming in summer.", "私たちは夏によく泳ぎに行きます。", "last summer"],
      ["autumn", "秋", "The leaves turn red in autumn.", "秋には葉が赤くなります。", "this autumn"],
      ["winter", "冬", "It gets dark early in winter.", "冬は早く暗くなります。", "in winter"]
    ]],
    ["活動", "名詞", [
      ["game", "試合・ゲーム", "Our baseball game starts at nine.", "野球の試合は9時に始まります。", "computer game"],
      ["practice", "練習", "Soccer practice ends at five.", "サッカーの練習は5時に終わります。", "after practice"],
      ["party", "パーティー", "We had a party for Lisa.", "リサのためにパーティーを開きました。", "birthday party"],
      ["concert", "コンサート", "The concert was very exciting.", "そのコンサートはとてもわくわくしました。", "go to a concert"],
      ["movie", "映画", "The movie starts at seven thirty.", "映画は7時30分に始まります。", "watch a movie"],
      ["music", "音楽", "I enjoy listening to music.", "私は音楽を聴くのが好きです。", "music room"],
      ["sport", "スポーツ", "Which sport do you like best?", "どのスポーツが一番好きですか。", "play sports"],
      ["soccer", "サッカー", "They played soccer after the rain stopped.", "雨がやんだ後、彼らはサッカーをしました。", "soccer team"],
      ["tennis", "テニス", "My sister is good at tennis.", "姉はテニスが得意です。", "tennis racket"],
      ["swimming", "水泳", "Swimming is good exercise.", "水泳はよい運動です。", "go swimming"]
    ]],
    ["考え・教科", "名詞", [
      ["time", "時刻・時間", "What time does the bus leave?", "バスは何時に出ますか。", "on time"],
      ["idea", "考え・アイデア", "I have an idea for our class project.", "クラスの課題について考えがあります。", "a good idea"],
      ["problem", "問題・困りごと", "We talked about the problem together.", "私たちはその問題について一緒に話しました。", "solve a problem"],
      ["question", "質問・問題", "Please answer the last question.", "最後の質問に答えてください。", "ask a question"],
      ["answer", "答え", "Do you know the answer?", "答えを知っていますか。", "the right answer"],
      ["subject", "教科・話題", "Science is my favorite subject.", "理科は私の好きな教科です。", "school subject"],
      ["history", "歴史", "We learned about Japanese history.", "私たちは日本の歴史について学びました。", "history museum"],
      ["science", "理科・科学", "We did an experiment in science class.", "理科の授業で実験をしました。", "science room"],
      ["country", "国", "Which country is Maria from?", "マリアはどの国の出身ですか。", "foreign country"],
      ["city", "都市・市", "The city has a new art museum.", "その市には新しい美術館があります。", "city hall"]
    ]],
    ["基本動作1", "動詞", [
      ["be", "～である・いる", "I want to be a teacher.", "私は先生になりたいです。", "be happy"],
      ["have", "持っている・食べる", "We have two cats at home.", "家で猫を2匹飼っています。", "have lunch"],
      ["do", "する", "What did you do yesterday?", "昨日何をしましたか。", "do homework"],
      ["go", "行く", "I go to school by bus.", "私はバスで学校へ行きます。", "go home"],
      ["come", "来る", "Please come to my house at two.", "2時に私の家へ来てください。", "come back"],
      ["get", "得る・着く・～になる", "We got to the station early.", "私たちは早く駅に着きました。", "get up"],
      ["make", "作る", "Ken made sandwiches this morning.", "ケンは今朝サンドイッチを作りました。", "make dinner"],
      ["take", "取る・連れていく", "It takes twenty minutes by bus.", "バスで20分かかります。", "take a picture"],
      ["give", "与える", "My aunt gave me this bag.", "おばがこのかばんをくれました。", "give A B"],
      ["use", "使う", "May I use your pen?", "あなたのペンを使ってもいいですか。", "use a computer"]
    ]],
    ["見る・話す", "動詞", [
      ["see", "見る・会う", "I saw Tom at the library.", "図書館でトムを見かけました。", "see a doctor"],
      ["look", "見る", "Look at the picture on page ten.", "10ページの絵を見てください。", "look at"],
      ["watch", "じっと見る", "We watched the game on TV.", "テレビで試合を見ました。", "watch a movie"],
      ["hear", "聞こえる・耳にする", "Did you hear the news about Ken?", "ケンの知らせを聞きましたか。", "hear about"],
      ["listen", "聞く", "Please listen to this song.", "この歌を聴いてください。", "listen to"],
      ["say", "言う", "Please say your name slowly.", "名前をゆっくり言ってください。", "say hello"],
      ["tell", "伝える・話す", "Tell me about your trip.", "旅行について話してください。", "tell A about B"],
      ["speak", "話す", "Can you speak English?", "英語を話せますか。", "speak slowly"],
      ["talk", "話す", "I talked with my teacher after class.", "授業後に先生と話しました。", "talk about"],
      ["call", "電話する・呼ぶ", "I’ll call you this evening.", "今晩あなたに電話します。", "call back"]
    ]],
    ["学ぶ・考える", "動詞", [
      ["know", "知っている", "Do you know her phone number?", "彼女の電話番号を知っていますか。", "know about"],
      ["think", "考える・思う", "What do you think of this plan?", "この計画をどう思いますか。", "think about"],
      ["understand", "理解する", "I don’t understand this question.", "この問題が分かりません。", "understand English"],
      ["remember", "覚えている", "Remember to bring your ticket.", "切符を持ってくるのを忘れないでください。", "remember the name"],
      ["forget", "忘れる", "I forgot my umbrella at school.", "学校に傘を忘れました。", "forget to do"],
      ["learn", "学ぶ・覚える", "We learned three new words today.", "今日、新しい単語を3つ学びました。", "learn about"],
      ["study", "勉強する", "I studied math for an hour.", "数学を1時間勉強しました。", "study English"],
      ["teach", "教える", "Mr. Hill teaches us science.", "ヒル先生は私たちに理科を教えます。", "teach A B"],
      ["read", "読む", "She is reading an email from Emma.", "彼女はエマからのメールを読んでいます。", "read a book"],
      ["write", "書く", "Please write your name here.", "ここに名前を書いてください。", "write a letter"]
    ]],
    ["食事・買物", "動詞", [
      ["eat", "食べる", "We ate curry for lunch.", "昼食にカレーを食べました。", "eat out"],
      ["order", "注文する", "We ordered vegetable soup for lunch.", "昼食に野菜スープを注文しました。", "order food"],
      ["cook", "料理する", "My brother can cook pasta.", "兄はパスタを作れます。", "cook dinner"],
      ["buy", "買う", "I bought this cap at the station.", "駅でこの帽子を買いました。", "buy A B"],
      ["sell", "売る", "The shop sells fresh bread.", "その店は焼きたてのパンを売っています。", "sell tickets"],
      ["pay", "支払う", "You can pay at the front desk.", "受付で支払えます。", "pay for"],
      ["bring", "持ってくる", "Please bring a notebook tomorrow.", "明日ノートを持ってきてください。", "bring A to B"],
      ["send", "送る", "I sent a picture to my grandmother.", "祖母に写真を送りました。", "send an email"],
      ["show", "見せる", "Could you show me the way?", "道を教えてくれますか。", "show A B"],
      ["share", "分け合う・共有する", "Share these cookies with your sister.", "このクッキーを妹と分けてください。", "share A with B"]
    ]],
    ["運動・移動", "動詞", [
      ["play", "遊ぶ・競技する", "We played tennis after school.", "放課後テニスをしました。", "play the piano"],
      ["join", "参加する・入る", "I want to join the cooking club.", "料理クラブに入りたいです。", "join a club"],
      ["run", "走る", "The boy can run very fast.", "その少年はとても速く走れます。", "run in the park"],
      ["walk", "歩く", "It takes ten minutes to walk there.", "そこまで歩いて10分かかります。", "walk to school"],
      ["swim", "泳ぐ", "Can you swim across the pool?", "プールを泳いで渡れますか。", "swim well"],
      ["ride", "乗る", "She rides her bike to school.", "彼女は自転車で学校へ行きます。", "ride a bike"],
      ["drive", "運転する", "My father drove us to the airport.", "父が私たちを空港まで車で送りました。", "drive a car"],
      ["travel", "旅行する", "We traveled around Japan by train.", "電車で日本各地を旅行しました。", "travel abroad"],
      ["visit", "訪れる", "I’m going to visit my aunt on Sunday.", "日曜日におばを訪ねる予定です。", "visit a museum"],
      ["stay", "滞在する・とどまる", "We stayed at a small hotel.", "小さなホテルに泊まりました。", "stay home"]
    ]],
    ["生活・交流", "動詞", [
      ["live", "住む・生きる", "Where does your cousin live?", "いとこはどこに住んでいますか。", "live in"],
      ["work", "働く", "My mother works at a hospital.", "母は病院で働いています。", "work hard"],
      ["help", "手伝う", "Could you help me carry this box?", "この箱を運ぶのを手伝ってくれますか。", "help A with B"],
      ["ask", "尋ねる・頼む", "I asked the teacher a question.", "先生に質問しました。", "ask for"],
      ["return", "戻る・返す", "Please return the book by Friday.", "金曜日までに本を返してください。", "return home"],
      ["meet", "会う", "Let’s meet at the station at eight.", "8時に駅で会いましょう。", "meet a friend"],
      ["wait", "待つ", "We waited for the bus outside.", "外でバスを待ちました。", "wait for"],
      ["start", "始まる・始める", "The first class starts at nine.", "最初の授業は9時に始まります。", "start -ing"],
      ["finish", "終える", "Finish your homework before dinner.", "夕食前に宿題を終えてください。", "finish -ing"],
      ["open", "開く・開ける", "The library opens at nine on Saturday.", "図書館は土曜日の9時に開きます。", "open the window"]
    ]],
    ["変化・選択", "動詞", [
      ["close", "閉まる・閉める", "The store closes early on Friday.", "その店は金曜日に早く閉まります。", "close the door"],
      ["leave", "出発する・置き忘れる", "Our train leaves at nine fifteen.", "列車は9時15分に出発します。", "leave home"],
      ["arrive", "到着する", "We arrived in Osaka at noon.", "正午に大阪へ着きました。", "arrive at"],
      ["find", "見つける", "I can’t find my science notebook.", "理科のノートが見つかりません。", "find out"],
      ["lose", "なくす・負ける", "Be careful not to lose your ticket.", "切符をなくさないよう注意してください。", "lose a game"],
      ["choose", "選ぶ", "You can choose one book from the shelf.", "棚から本を1冊選べます。", "choose A from B"],
      ["want", "欲しい・～したい", "I want to see the old castle.", "その古い城を見たいです。", "want to"],
      ["need", "必要とする", "We need to leave before seven.", "7時前に出発する必要があります。", "need to"],
      ["like", "好む", "Which subject do you like better?", "どちらの教科がより好きですか。", "like -ing"],
      ["enjoy", "楽しむ", "She enjoys taking pictures.", "彼女は写真を撮るのを楽しみます。", "enjoy -ing"]
    ]],
    ["計画・身支度", "動詞", [
      ["try", "試す・努力する", "Try this vegetable soup.", "この野菜スープを試してみてください。", "try to"],
      ["plan", "計画する", "We plan to visit Kyoto next month.", "来月京都を訪れる予定です。", "plan to"],
      ["hope", "望む", "I hope the weather is sunny tomorrow.", "明日晴れるといいと思います。", "hope to"],
      ["move", "動く・引っ越す", "My friend will move to England.", "友達はイングランドへ引っ越します。", "move to"],
      ["clean", "掃除する", "We cleaned the classroom after school.", "放課後教室を掃除しました。", "clean my room"],
      ["wash", "洗う", "Please wash these cups.", "これらのカップを洗ってください。", "wash your hands"],
      ["cut", "切る", "Cut the apple into four pieces.", "りんごを4つに切ってください。", "cut A into B"],
      ["carry", "運ぶ", "This bag is very heavy, so I cannot carry it.", "このかばんはとても重いので、私は運べません。", "carry a box"],
      ["wear", "身につけている", "The girl is wearing a red hat.", "女の子は赤い帽子をかぶっています。", "wear glasses"],
      ["put", "置く・入れる", "Put your books in the box.", "本を箱の中に入れてください。", "put on"]
    ]],
    ["基本形容詞", "形容詞", [
      ["good", "よい・上手な", "This book is good for beginners.", "この本は初心者に向いています。", "be good at"],
      ["bad", "悪い", "The weather was bad yesterday.", "昨日は天気が悪かったです。", "bad weather"],
      ["big", "大きい", "They live in a big city.", "彼らは大きな都市に住んでいます。", "a big problem"],
      ["small", "小さい", "We stayed at a small hotel.", "私たちは小さなホテルに泊まりました。", "a small town"],
      ["long", "長い", "It was a long train ride.", "長い列車の旅でした。", "How long"],
      ["short", "短い・背が低い", "We took a short break.", "短い休憩を取りました。", "short hair"],
      ["high", "高い", "The bird flew high in the sky.", "鳥は空高く飛びました。", "high mountain"],
      ["low", "低い", "The table is too low for me.", "そのテーブルは私には低すぎます。", "low price"],
      ["old", "古い・年を取った", "The museum is in an old building.", "博物館は古い建物の中にあります。", "years old"],
      ["new", "新しい", "There is a new student in our class.", "クラスに新しい生徒がいます。", "brand-new"]
    ]],
    ["状態1", "形容詞", [
      ["young", "若い", "That young player is very fast.", "あの若い選手はとても速いです。", "young people"],
      ["beautiful", "美しい", "We saw a beautiful lake.", "私たちは美しい湖を見ました。", "beautiful picture"],
      ["interesting", "興味深い", "The science lesson was interesting.", "理科の授業は興味深かったです。", "an interesting story"],
      ["difficult", "難しい", "This question is difficult for me.", "この問題は私には難しいです。", "a difficult subject"],
      ["easy", "簡単な", "This map is easy to read.", "この地図は読みやすいです。", "an easy question"],
      ["busy", "忙しい", "My father is busy this week.", "父は今週忙しいです。", "be busy with"],
      ["free", "暇な・無料の", "I’m free after two tomorrow.", "明日は2時以降暇です。", "free ticket"],
      ["tired", "疲れた", "I was tired after practice.", "練習後は疲れていました。", "look tired"],
      ["hungry", "空腹な", "We were hungry after the game.", "試合後、私たちはお腹が空いていました。", "feel hungry"],
      ["thirsty", "のどが渇いた", "I’m thirsty. May I have some water?", "のどが渇きました。水をいただけますか。", "feel thirsty"]
    ]],
    ["状態2", "形容詞", [
      ["happy", "うれしい・幸せな", "She was happy with her present.", "彼女はプレゼントを喜びました。", "be happy to"],
      ["sad", "悲しい", "I was sad to hear the news.", "その知らせを聞いて悲しかったです。", "look sad"],
      ["sick", "病気の", "My mother was sick last weekend.", "母は先週末病気でした。", "feel sick"],
      ["well", "元気な・上手に", "You don’t look well today.", "今日は元気そうに見えません。", "get well"],
      ["kind", "親切な", "The nurse was kind to me.", "その看護師は私に親切でした。", "be kind to"],
      ["famous", "有名な", "The town is famous for its flowers.", "その町は花で有名です。", "be famous for"],
      ["popular", "人気のある", "Soccer is popular at our school.", "私たちの学校ではサッカーが人気です。", "be popular with"],
      ["favorite", "一番好きな", "What is your favorite season?", "一番好きな季節は何ですか。", "favorite subject"],
      ["important", "重要な", "Breakfast is important for students.", "朝食は生徒にとって重要です。", "an important question"],
      ["different", "異なる", "My answer is different from yours.", "私の答えはあなたの答えと違います。", "be different from"]
    ]],
    ["位置・時間", "形容詞・副詞", [
      ["same", "同じ", "We are in the same class.", "私たちは同じクラスです。", "the same as"],
      ["right", "右の・正しい", "The post office is on your right.", "郵便局は右側にあります。", "right answer"],
      ["left", "左の", "Turn left at the next corner.", "次の角を左に曲がってください。", "on the left"],
      ["early", "早く・早い", "We arrived at school early.", "私たちは早く学校に着きました。", "get up early"],
      ["late", "遅く・遅い", "I’m sorry I’m late.", "遅れてすみません。", "be late for"],
      ["fast", "速く・速い", "This train is very fast.", "この列車はとても速いです。", "run fast"],
      ["slow", "遅い・ゆっくりの", "The bus was slow in the rain.", "雨の中でバスは遅かったです。", "a slow train"],
      ["warm", "暖かい", "It will be warm this afternoon.", "今日の午後は暖かくなるでしょう。", "warm weather"],
      ["cold", "寒い・冷たい", "It was cold outside this morning.", "今朝は外が寒かったです。", "cold water"],
      ["hot", "暑い・熱い", "The soup is still hot.", "スープはまだ熱いです。", "a hot day"]
    ]],
    ["天気・頻度", "形容詞・副詞", [
      ["sunny", "晴れた", "It will be sunny on Sunday.", "日曜日は晴れるでしょう。", "a sunny day"],
      ["cloudy", "曇った", "It is cloudy but warm today.", "今日は曇っていますが暖かいです。", "cloudy weather"],
      ["rainy", "雨の", "I take the bus on rainy days.", "雨の日はバスに乗ります。", "rainy season"],
      ["snowy", "雪の", "We stayed home on the snowy morning.", "雪の朝は家にいました。", "snowy mountain"],
      ["usually", "たいてい", "I usually walk to school.", "私はたいてい歩いて学校へ行きます。", "usually do"],
      ["often", "よく", "We often play games after dinner.", "夕食後によくゲームをします。", "often go"],
      ["sometimes", "ときどき", "She sometimes cooks lunch for us.", "彼女はときどき昼食を作ってくれます。", "sometimes do"],
      ["always", "いつも", "My teacher always speaks slowly.", "先生はいつもゆっくり話します。", "always be"],
      ["never", "決して～ない", "I never drink coffee at night.", "私は夜にコーヒーを決して飲みません。", "never do"],
      ["together", "一緒に", "Let’s study together after school.", "放課後一緒に勉強しましょう。", "work together"]
    ]],
    ["程度・数量", "副詞・形容詞", [
      ["again", "もう一度", "Please say that again.", "もう一度言ってください。", "try again"],
      ["soon", "すぐに・まもなく", "I hope to see you soon.", "すぐに会えるといいですね。", "come back soon"],
      ["already", "すでに", "The movie is already over.", "映画はすでに終わっています。", "already finished"],
      ["yet", "まだ・もう", "My report is not ready yet.", "私のレポートはまだできていません。", "not yet"],
      ["very", "とても", "This book is very interesting.", "この本はとても面白いです。", "very much"],
      ["really", "本当に", "The concert was really good.", "コンサートは本当に良かったです。", "really like"],
      ["much", "多くの・とても", "How much water do we need?", "水はどのくらい必要ですか。", "too much"],
      ["many", "多くの", "Many students joined the club.", "多くの生徒がクラブに入りました。", "how many"],
      ["few", "少数の", "A few people were in the museum.", "博物館には数人いました。", "a few"],
      ["little", "少しの・小さい", "There is a little milk in the cup.", "カップに牛乳が少しあります。", "a little"]
    ]],
    ["時・場所副詞", "副詞", [
      ["today", "今日", "We have a science test today.", "今日は理科のテストがあります。", "this morning"],
      ["tomorrow", "明日", "I’m going to visit her tomorrow.", "明日彼女を訪ねる予定です。", "tomorrow morning"],
      ["yesterday", "昨日", "It rained all day yesterday.", "昨日は一日中雨でした。", "yesterday afternoon"],
      ["now", "今", "The library is open now.", "図書館は今開いています。", "right now"],
      ["then", "そのとき・それから", "We ate lunch and then played soccer.", "昼食を食べ、それからサッカーをしました。", "until then"],
      ["here", "ここに・ここで", "Please wait here for five minutes.", "ここで5分待ってください。", "near here"],
      ["there", "そこに・そこで", "How long does it take to get there?", "そこへ行くのにどのくらいかかりますか。", "over there"],
      ["inside", "内側に・中で", "It started to rain, so we went inside.", "雨が降り始めたので中へ入りました。", "inside the box"],
      ["outside", "外側に・外で", "The return box is outside the library.", "返却箱は図書館の外にあります。", "wait outside"],
      ["near", "近くに", "My house is near the station.", "私の家は駅の近くです。", "near here"]
    ]],
    ["前置詞1", "前置詞・接続詞", [
      ["before", "～の前に", "Wash your hands before dinner.", "夕食の前に手を洗ってください。", "before school"],
      ["after", "～の後に", "We practiced after school.", "放課後に練習しました。", "after lunch"],
      ["during", "～の間に", "I read three books during vacation.", "休暇中に本を3冊読みました。", "during the trip"],
      ["until", "～まで", "The meeting will continue until noon.", "会議は正午まで続きます。", "until tomorrow"],
      ["from", "～から", "This letter is from my cousin.", "この手紙はいとこからです。", "from A to B"],
      ["to", "～へ・～に", "We walked to the museum.", "博物館まで歩きました。", "go to"],
      ["at", "～で・～に", "Meet me at the station at eight.", "8時に駅で会ってください。", "at night"],
      ["in", "～の中に・～に", "There are five books in the bag.", "かばんの中に本が5冊あります。", "in summer"],
      ["on", "～の上に・～に", "The keys are on the table.", "鍵はテーブルの上です。", "on Sunday"],
      ["with", "～と一緒に・～を使って", "I went there with my sister.", "姉（妹）と一緒にそこへ行きました。", "with a pen"]
    ]],
    ["前置詞2", "前置詞", [
      ["without", "～なしで", "Don’t leave home without your ticket.", "切符を持たずに家を出ないでください。", "without water"],
      ["for", "～のために・～の間", "This present is for my mother.", "この贈り物は母のためです。", "for two hours"],
      ["of", "～の", "Please give me a glass of water.", "水を1杯ください。", "one of"],
      ["about", "～について・約", "We talked about our summer plans.", "夏の計画について話しました。", "about ten minutes"],
      ["into", "～の中へ", "The children went into the classroom.", "子どもたちは教室の中へ入りました。", "cut into"],
      ["by", "～で・～までに・～のそば", "I go to school by bus.", "私はバスで学校へ行きます。", "by Friday"],
      ["over", "～の上を・向こうに", "The bird flew over the lake.", "鳥は湖の上を飛びました。", "over there"],
      ["under", "～の下に", "The cat is sleeping under the chair.", "猫はいすの下で寝ています。", "under the tree"],
      ["between", "～の間に", "The bank is between the store and the hotel.", "銀行は店とホテルの間です。", "between A and B"],
      ["around", "～の周りに・約", "We walked around the park.", "私たちは公園の周りを歩きました。", "around noon"]
    ]],
    ["接続・疑問", "接続詞・疑問詞", [
      ["because", "なぜなら・～なので", "I stayed home because I was sick.", "病気だったので家にいました。", "because of"],
      ["but", "しかし", "It was cold, but we enjoyed the picnic.", "寒かったですがピクニックを楽しみました。", "A but B"],
      ["and", "そして・～と", "I bought bread and milk.", "パンと牛乳を買いました。", "A and B"],
      ["or", "または", "Would you like tea or juice?", "紅茶とジュースのどちらがよいですか。", "A or B"],
      ["so", "それで・とても", "It rained, so the game was canceled.", "雨だったので試合は中止になりました。", "so much"],
      ["if", "もし～なら", "If it rains, we will stay home.", "雨なら家にいます。", "if possible"],
      ["when", "いつ・～するとき", "When will the movie start?", "映画はいつ始まりますか。", "when I was"],
      ["which", "どちら・どの", "Which bus goes to the museum?", "どのバスが博物館へ行きますか。", "which one"],
      ["whose", "だれの", "Whose umbrella is this?", "これはだれの傘ですか。", "whose book"],
      ["how", "どのように・どれほど", "How do you go to school?", "どうやって学校へ行きますか。", "how often"]
    ]]
  ];

  const phraseGroups = [
    ["生活表現", [
      ["get up", "起きる", "I get up at six on weekdays.", "平日は6時に起きます。", "get up early"],
      ["go to bed", "寝る", "I went to bed late last night.", "昨夜は遅く寝ました。", "before going to bed"],
      ["come home", "帰宅する", "My brother comes home at five.", "兄（弟）は5時に帰宅します。", "come home early"],
      ["go shopping", "買い物に行く", "We went shopping on Sunday.", "日曜日に買い物へ行きました。", "go shopping with"],
      ["go swimming", "泳ぎに行く", "Let’s go swimming this afternoon.", "今日の午後、泳ぎに行きましょう。", "go swimming at"],
      ["have breakfast", "朝食をとる", "I have breakfast at seven.", "7時に朝食をとります。", "have eggs for breakfast"],
      ["have lunch", "昼食をとる", "We had lunch in the park.", "公園で昼食をとりました。", "have lunch together"],
      ["have dinner", "夕食をとる", "We usually have dinner at seven.", "たいてい7時に夕食をとります。", "after dinner"],
      ["take a bus", "バスに乗る", "Take a bus from the station.", "駅からバスに乗ってください。", "take the number ten bus"],
      ["take a train", "列車に乗る", "We took a train to Lake City.", "レイクシティまで列車に乗りました。", "take the first train"]
    ]],
    ["動作表現", [
      ["take a picture", "写真を撮る", "May I take a picture here?", "ここで写真を撮ってもいいですか。", "take a picture of"],
      ["take care of", "世話をする", "Can you take care of my dog?", "私の犬の世話をしてくれますか。", "take good care of"],
      ["look at", "～を見る", "Look at the map on the wall.", "壁の地図を見てください。", "look at carefully"],
      ["look for", "～を探す", "I’m looking for my ticket.", "切符を探しています。", "look for a job"],
      ["look after", "～の世話をする", "She looks after her little brother.", "彼女は弟の世話をします。", "look after a child"],
      ["listen to", "～を聴く", "I listen to music after dinner.", "夕食後に音楽を聴きます。", "listen to the teacher"],
      ["wait for", "～を待つ", "We waited for the bus for ten minutes.", "バスを10分待ちました。", "wait for me"],
      ["ask for", "～を求める", "Ask the clerk for help.", "店員に助けを求めてください。", "ask for water"],
      ["talk about", "～について話す", "We talked about our favorite movies.", "好きな映画について話しました。", "talk about school"],
      ["think about", "～について考える", "Please think about my idea.", "私の考えについて考えてください。", "think about the future"]
    ]],
    ["be表現1", [
      ["be good at", "～が得意である", "Mika is good at playing tennis.", "ミカはテニスをするのが得意です。", "be good at -ing"],
      ["be interested in", "～に興味がある", "I’m interested in Japanese history.", "日本史に興味があります。", "be interested in music"],
      ["be afraid of", "～を怖がる", "My sister is afraid of big dogs.", "妹は大きな犬を怖がります。", "be afraid of the dark"],
      ["be late for", "～に遅れる", "Don’t be late for class.", "授業に遅れないでください。", "be late for school"],
      ["be from", "～の出身である", "Maria is from Canada.", "マリアはカナダ出身です。", "Where are you from?"],
      ["be ready for", "～の準備ができている", "Are you ready for the test?", "テストの準備はできていますか。", "get ready for"],
      ["be kind to", "～に親切である", "Please be kind to new students.", "新しい生徒に親切にしてください。", "kind to animals"],
      ["be different from", "～と異なる", "This picture is different from that one.", "この絵はあの絵と違います。", "different from mine"],
      ["be famous for", "～で有名である", "The city is famous for its old castle.", "その市は古い城で有名です。", "famous for food"],
      ["be full of", "～でいっぱいである", "The box is full of books.", "箱は本でいっぱいです。", "full of people"]
    ]],
    ["数量表現", [
      ["a lot of", "たくさんの", "There are a lot of people in the park.", "公園にはたくさんの人がいます。", "a lot of time"],
      ["lots of", "たくさんの", "We saw lots of flowers there.", "そこでたくさんの花を見ました。", "lots of fun"],
      ["a little", "少しの", "I have a little time before class.", "授業前に少し時間があります。", "a little water"],
      ["a few", "少数の・いくつかの", "I asked a few questions.", "いくつか質問しました。", "a few days"],
      ["some of", "～のいくつか", "Some of the students came by bus.", "生徒の何人かはバスで来ました。", "some of them"],
      ["one of", "～の一つ・一人", "This is one of my favorite books.", "これは私の好きな本の一つです。", "one of the students"],
      ["all of", "～のすべて", "All of the windows were open.", "窓はすべて開いていました。", "all of us"],
      ["most of", "～の大部分", "Most of the shops close at six.", "店の多くは6時に閉まります。", "most of the day"],
      ["how many", "いくつ・何人", "How many books did you read?", "本を何冊読みましたか。", "how many times"],
      ["how much", "どのくらい・いくら", "How much is this bag?", "このかばんはいくらですか。", "how much water"]
    ]],
    ["疑問・移動", [
      ["how often", "どのくらいの頻度で", "How often do you practice the piano?", "どのくらいの頻度でピアノを練習しますか。", "once a week"],
      ["how long", "どのくらい長く", "How long does it take to walk there?", "そこまで歩いてどのくらいかかりますか。", "for two hours"],
      ["what time", "何時", "What time will you come home?", "何時に帰宅しますか。", "at seven thirty"],
      ["what kind of", "どんな種類の", "What kind of music do you like?", "どんな音楽が好きですか。", "this kind of"],
      ["which one", "どちら・どれ", "Which one is your umbrella?", "どれがあなたの傘ですか。", "the blue one"],
      ["on foot", "徒歩で", "I usually go to school on foot.", "たいてい徒歩で学校へ行きます。", "walk to school"],
      ["by bus", "バスで", "It takes twenty minutes by bus.", "バスで20分かかります。", "go by bus"],
      ["by train", "列車で", "We traveled to Osaka by train.", "列車で大阪へ旅行しました。", "go by train"],
      ["on the way", "途中で", "I met Ken on the way to school.", "学校へ行く途中でケンに会いました。", "on the way home"],
      ["at home", "家で", "I read a book at home yesterday.", "昨日家で本を読みました。", "stay at home"]
    ]],
    ["時の表現", [
      ["at school", "学校で", "We use tablets at school.", "学校でタブレットを使います。", "after school"],
      ["in the morning", "朝に", "I walk my dog in the morning.", "朝に犬を散歩させます。", "tomorrow morning"],
      ["in the afternoon", "午後に", "The club meets in the afternoon.", "クラブは午後に集まります。", "this afternoon"],
      ["in the evening", "夕方・晩に", "We watched TV in the evening.", "夕方にテレビを見ました。", "tomorrow evening"],
      ["at night", "夜に", "The museum looks beautiful at night.", "その博物館は夜に美しく見えます。", "late at night"],
      ["every day", "毎日", "I study English every day.", "毎日英語を勉強します。", "every morning"],
      ["once a week", "週に1回", "We have art class once a week.", "美術の授業は週1回です。", "once a month"],
      ["twice a week", "週に2回", "She practices tennis twice a week.", "彼女は週2回テニスを練習します。", "twice a day"],
      ["last weekend", "先週末", "I visited my grandparents last weekend.", "先週末、祖父母を訪ねました。", "last Saturday"],
      ["next month", "来月", "The new library will open next month.", "新しい図書館は来月開きます。", "next year"]
    ]],
    ["会話1", [
      ["Excuse me.", "すみません。", "Excuse me. Where is the bus stop?", "すみません。バス停はどこですか。", "ask politely"],
      ["Thank you.", "ありがとうございます。", "Thank you for helping me.", "手伝ってくれてありがとうございます。", "Thanks a lot."],
      ["You’re welcome.", "どういたしまして。", "You’re welcome. I’m glad I could help.", "どういたしまして。手伝えてよかったです。", "No problem."],
      ["I’m sorry.", "ごめんなさい。", "I’m sorry I broke your cup.", "あなたのカップを割ってごめんなさい。", "Sorry I’m late."],
      ["That’s all right.", "大丈夫です。", "That’s all right. It was an old cup.", "大丈夫です。古いカップでした。", "That’s OK."],
      ["Of course.", "もちろん。", "Of course. You can use my pen.", "もちろん。私のペンを使えます。", "Sure."],
      ["Here you are.", "はい、どうぞ。", "Here you are. This is your ticket.", "はい、どうぞ。あなたの切符です。", "Here it is."],
      ["I see.", "なるほど。", "I see. So the shop is closed today.", "なるほど。それで今日は店が閉まっているのですね。", "I understand."],
      ["Sounds good.", "よさそうです。", "Let’s meet at two. — Sounds good.", "2時に会いましょう。—よさそうです。", "That sounds nice."],
      ["I’d love to.", "ぜひそうしたいです。", "Would you like to come? — I’d love to.", "来ませんか。—ぜひ。", "accept an invitation"]
    ]],
    ["会話2", [
      ["No, thank you.", "いいえ、結構です。", "More cake? — No, thank you.", "ケーキをもっと？—いいえ、結構です。", "decline politely"],
      ["Yes, please.", "はい、お願いします。", "Would you like some juice? — Yes, please.", "ジュースはいかがですか。—はい、お願いします。", "accept politely"],
      ["Not yet.", "まだです。", "Did you finish? — Not yet.", "終わりましたか。—まだです。", "not finished"],
      ["That’s right.", "そのとおりです。", "The test is Friday, right? — That’s right.", "テストは金曜日ですね。—そのとおりです。", "confirm"],
      ["That’s too bad.", "それは残念です。", "I can’t go to the party. — That’s too bad.", "パーティーに行けません。—それは残念です。", "show sympathy"],
      ["Good luck.", "頑張って。", "Good luck on your test tomorrow.", "明日のテスト、頑張ってください。", "wish success"],
      ["Have a nice day.", "よい一日を。", "Thank you. Have a nice day.", "ありがとうございます。よい一日を。", "say goodbye"],
      ["How are you?", "元気ですか。", "Hi, Emi. How are you?", "こんにちは、エミ。元気ですか。", "I’m fine."],
      ["How was your weekend?", "週末はどうでしたか。", "How was your weekend? — It was great.", "週末はどうでしたか。—とてもよかったです。", "ask about the past"],
      ["What happened?", "何が起きましたか。", "You look worried. What happened?", "心配そうですね。何が起きましたか。", "ask about a problem"]
    ]],
    ["会話3", [
      ["What’s wrong?", "どうしましたか。", "What’s wrong? — I can’t find my bag.", "どうしましたか。—かばんが見つかりません。", "ask about trouble"],
      ["Are you all right?", "大丈夫ですか。", "You look tired. Are you all right?", "疲れて見えます。大丈夫ですか。", "check someone"],
      ["May I help you?", "お手伝いしましょうか。", "May I help you? — Yes, I need a map.", "お手伝いしましょうか。—はい、地図が必要です。", "at a store"],
      ["Can I borrow this?", "これを借りてもいいですか。", "Can I borrow this book?", "この本を借りてもいいですか。", "borrow yours"],
      ["Could you help me?", "手伝ってくれますか。", "Could you help me with this box?", "この箱を手伝ってくれますか。", "ask for help"],
      ["Would you like some?", "少しいかがですか。", "I made cookies. Would you like some?", "クッキーを作りました。少しいかがですか。", "offer food"],
      ["Shall we go?", "行きましょうか。", "The bus is here. Shall we go?", "バスが来ました。行きましょうか。", "make a suggestion"],
      ["Let’s meet at …", "～で会いましょう。", "Let’s meet at the library at three.", "3時に図書館で会いましょう。", "make a plan"],
      ["How about …?", "～はどうですか。", "How about Sunday afternoon?", "日曜日の午後はどうですか。", "suggest an option"],
      ["Why don’t we …?", "～しませんか。", "Why don’t we take a bus?", "バスに乗りませんか。", "make a suggestion"]
    ]],
    ["会話4", [
      ["What do you think of …?", "～をどう思いますか。", "What do you think of this movie?", "この映画をどう思いますか。", "ask an opinion"],
      ["How can I get to …?", "～へどう行けばいいですか。", "How can I get to the museum?", "博物館へどう行けばいいですか。", "ask directions"],
      ["How much is it?", "いくらですか。", "I like this bag. How much is it?", "このかばんが気に入りました。いくらですか。", "ask a price"],
      ["Whose is this?", "これはだれのですか。", "Whose is this umbrella?", "この傘はだれのですか。", "ask the owner"],
      ["What does … mean?", "～はどういう意味ですか。", "What does this word mean?", "この単語はどういう意味ですか。", "ask a meaning"],
      ["Please say that again.", "もう一度言ってください。", "I didn’t hear you. Please say that again.", "聞こえませんでした。もう一度言ってください。", "ask for repetition"],
      ["Could you speak slowly?", "ゆっくり話してくれますか。", "Could you speak slowly, please?", "ゆっくり話してくれますか。", "ask for slower speech"],
      ["I’m looking forward to it.", "楽しみにしています。", "The trip is next week. I’m looking forward to it.", "旅行は来週です。楽しみにしています。", "look forward to"],
      ["See you later.", "またあとで。", "I have class now. See you later.", "今から授業です。またあとで。", "say goodbye"],
      ["Take care.", "気をつけて。", "It’s snowing outside. Take care.", "外は雪です。気をつけて。", "careful goodbye"]
    ]],
    ["文法パターン1", [
      ["want to + verb", "～したい", "I want to visit the new museum.", "新しい博物館を訪れたいです。", "want to do"],
      ["need to + verb", "～する必要がある", "We need to leave before eight.", "8時前に出発する必要があります。", "need to do"],
      ["have to + verb", "～しなければならない", "I have to finish my homework.", "宿題を終えなければなりません。", "have to do"],
      ["be going to + verb", "～する予定だ", "She is going to cook dinner.", "彼女は夕食を作る予定です。", "future plan"],
      ["would like to + verb", "～したい", "I would like to see that picture.", "その絵を見たいです。", "polite want"],
      ["can + verb", "～できる", "My brother can swim well.", "弟は上手に泳げます。", "ability"],
      ["must + verb", "～しなければならない", "You must bring your ticket.", "切符を持ってこなければなりません。", "strong rule"],
      ["must not + verb", "～してはいけない", "You must not run in the library.", "図書館で走ってはいけません。", "prohibition"],
      ["there is", "～が一つある・いる", "There is a bank near the station.", "駅の近くに銀行があります。", "singular"],
      ["there are", "～が複数ある・いる", "There are three books on the desk.", "机の上に本が3冊あります。", "plural"]
    ]],
    ["文法パターン2", [
      ["comparative + than", "～より…だ", "This train is faster than that one.", "この列車はあの列車より速いです。", "comparison"],
      ["the superlative in", "～の中で一番…", "This is the tallest building in the city.", "これは市で一番高い建物です。", "superlative"],
      ["enjoy + -ing", "～することを楽しむ", "I enjoy reading history books.", "歴史の本を読むことを楽しみます。", "gerund"],
      ["be good at + -ing", "～するのが得意だ", "She is good at drawing pictures.", "彼女は絵を描くのが得意です。", "gerund after at"],
      ["How about + -ing?", "～するのはどうですか。", "How about going by train?", "列車で行くのはどうですか。", "suggestion"],
      ["before + noun", "～の前に", "Please come home before dinner.", "夕食前に帰宅してください。", "time order"],
      ["after + noun", "～の後に", "We played tennis after school.", "放課後テニスをしました。", "time order"],
      ["give A B", "AにBを与える", "My father gave me a camera.", "父が私にカメラをくれました。", "give B to A"],
      ["buy A B", "AにBを買う", "Mom bought me a new bag.", "母が私に新しいかばんを買ってくれました。", "buy B for A"],
      ["tell A about B", "AにBについて話す", "Tell me about your weekend.", "週末について私に話してください。", "tell a story"]
    ]]
  ];

  const words = wordGroups.flatMap(([category, pos, rows]) => rows.map((row) => ({ category, pos, kind: "word", row })));
  const phrases = phraseGroups.flatMap(([category, rows]) => rows.map((row) => ({ category, pos: "熟語・表現", kind: "phrase", row })));
  if (words.length !== 300 || phrases.length !== 120) throw new Error(`EIKEN vocabulary source count mismatch: ${words.length}/${phrases.length}`);

  const ordered = [];
  let wordIndex = 0;
  let phraseIndex = 0;
  for (let day = 1; day <= 21; day += 1) {
    const wordCount = day <= 6 ? 15 : 14;
    const phraseCount = 20 - wordCount;
    ordered.push(...words.slice(wordIndex, wordIndex + wordCount), ...phrases.slice(phraseIndex, phraseIndex + phraseCount));
    wordIndex += wordCount;
    phraseIndex += phraseCount;
  }
  if (ordered.length !== 420 || wordIndex !== 300 || phraseIndex !== 120) throw new Error("EIKEN vocabulary schedule mismatch");

  const items = ordered.map((source, index) => {
    const [headword, meaning, example, exampleJa, related] = source.row;
    return {
      id: `e4v-${String(index + 1).padStart(3, "0")}`,
      order: index,
      day: Math.floor(index / 20) + 1,
      headword,
      meaning,
      pos: source.pos,
      category: source.category,
      kind: source.kind,
      example,
      exampleJa,
      related,
      priority: index < 120 ? "S" : index < 300 ? "A" : "B",
      directions: [
        "english-to-japanese",
        "japanese-to-english",
        "audio-to-meaning",
        ...(source.kind === "phrase" && headword.includes(" ") && !headword.includes("+") && !/[?.!]$/.test(headword)
          ? ["phrase-cloze"]
          : [])
      ],
      audioText: headword.replace(/\s*\+\s*(?:verb|-ing|noun)/g, ""),
      pronunciation: {
        text: headword.replace(/\s*\+\s*(?:verb|-ing|noun)/g, ""),
        lang: "en-US",
        mode: "speech-synthesis"
      },
      sourceEvidence: ["eiken-2026-1", "eiken-2025-3", "eiken-2025-2", "grade4-topic-coverage"]
    };
  });

  window.EIKEN_VOCAB_DECKS = window.EIKEN_VOCAB_DECKS || {};
  window.EIKEN_VOCAB_DECKS["eiken-grade4-vocab"] = {
    id: "eiken-grade4-vocab",
    contentVersion: 1,
    title: "英検4級 単語帳420",
    childIds: ["child-2"],
    selectionBasis: {
      officialSessions: ["2026年度第1回", "2025年度第3回", "2025年度第2回"],
      referencePage: "https://www.eiken.or.jp/eiken/exam/grade_4/",
      policy: "公式問題とリスニング原稿の語彙・場面分布を参照し、例文はすべて独自作成"
    },
    schedule: { newDays: 21, finishDays: 7, newPerDay: 20, reviewIntervals: [1, 3, 7], readyMastered: 378 },
    composition: { words: 300, phrases: 120, total: 420 },
    items
  };
})();
