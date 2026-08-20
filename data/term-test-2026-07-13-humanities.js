(function () {
  "use strict";

  const PACK_ID = "term-2026-07-13";
  const SOURCE_TAG = "term-2026-07-13-original-scope";
  const L1 = "L1 基礎復帰";
  const L2 = "L2 県立標準";
  const L3 = "L3 県立本番";
  const L4 = "L4 安全圏チャレンジ";

  function termQuestion(question) {
    const tierDefaults = {
      core: { priority: "S", difficulty: L2, stage: "基本攻略" },
      challenge: { priority: "A", difficulty: L3, stage: "応用挑戦" },
      final: { priority: "B", difficulty: L4, stage: "最終挑戦" }
    };
    const defaults = tierDefaults[question.tier];
    if (!defaults) throw new Error(`Unknown term-test tier: ${question.tier}`);
    return {
      type: "choice",
      childIds: ["child-1"],
      packId: PACK_ID,
      sourceTag: SOURCE_TAG,
      qualityStatus: "content-audited",
      contentStatus: "content-final",
      ...defaults,
      ...question,
      stage: defaults.stage
    };
  }

  const japaneseCore = [
    termQuestion({
      id: "term-20260713-jpn-001", type: "input", subject: "国語", unit: "漢字・語句", tier: "core",
      difficulty: L1, stage: L1, examSkill: "漢字の読み", formatTag: "直接入力", mistakeTags: ["漢字の読み", "語彙不足"],
      paperRef: "国語ワーク pp.6-9", skills: ["漢字", "読み"],
      prompt: "「議論の要点を端的に述べる」の「端的」の読みを、ひらがなで答えなさい。",
      answerText: ["たんてき"], placeholder: "ひらがなで入力",
      explanation: "「端的」は「たんてき」と読み、要点をはっきりと簡潔に表す様子をいいます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-002", type: "input", subject: "国語", unit: "漢字・語句", tier: "core",
      difficulty: L1, stage: L1, examSkill: "漢字の読み", formatTag: "直接入力", mistakeTags: ["漢字の読み", "送り仮名"],
      paperRef: "国語ワーク pp.6-9", skills: ["漢字", "読み"],
      prompt: "「対話する力を培う」の「培う」の読みを、ひらがなで答えなさい。",
      answerText: ["つちかう"], placeholder: "ひらがなで入力",
      explanation: "「培う」は「つちかう」と読み、時間をかけて能力や性質を育てることです。"
    }),
    termQuestion({
      id: "term-20260713-jpn-003", type: "input", subject: "国語", unit: "漢字・語句", tier: "core",
      difficulty: L1, stage: L1, examSkill: "漢字の書き", formatTag: "直接入力", mistakeTags: ["漢字の書き", "送り仮名"],
      paperRef: "国語ワーク pp.6-11", skills: ["漢字", "文脈判断"],
      prompt: "「おだやかな口調」の「おだやか」を、漢字と送り仮名で書きなさい。",
      answerText: ["穏やか"], placeholder: "漢字で入力",
      explanation: "静かで落ち着いている様子は「穏やか」と書きます。「穏」だけでなく、送り仮名の「やか」まで書きます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-004", subject: "国語", unit: "漢字・語句", tier: "core",
      difficulty: L1, stage: L1, examSkill: "同音異義語", formatTag: "短問", mistakeTags: ["同音異字", "文脈判断"],
      paperRef: "国語ワーク pp.8-13", skills: ["漢字", "同音異義語"],
      prompt: "「完成までの日数に、けんとうをつける」の「けんとう」として正しいものはどれですか。",
      choices: ["見当", "検討", "健闘", "拳闘"], answer: 0,
      explanation: "おおよその予想を立てる慣用表現は「見当をつける」です。「検討」はよく調べて考えることです。"
    }),
    termQuestion({
      id: "term-20260713-jpn-005", subject: "国語", unit: "漢字・語句", tier: "core",
      difficulty: L1, stage: L1, examSkill: "同訓異字", formatTag: "短問", mistakeTags: ["同訓異字", "文脈判断"],
      paperRef: "国語ワーク pp.8-13", skills: ["漢字", "語の使い分け"],
      prompt: "「文化祭で司会の役目をつとめる」の「つとめる」として正しいものはどれですか。",
      choices: ["務める", "勤める", "努める", "勉める"], answer: 0,
      explanation: "役割を受け持つ場合は「務める」です。勤務先で働くなら「勤める」、努力するなら「努める」です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-006", subject: "国語", unit: "語句・慣用句", tier: "core",
      difficulty: L1, stage: L1, examSkill: "慣用句の意味", formatTag: "短問", mistakeTags: ["慣用句", "意味の取り違え"],
      paperRef: "国語ワーク pp.12-15", skills: ["慣用句", "語彙"],
      prompt: "「無事だと分かり、胸をなで下ろした」の意味として最も近いものはどれですか。",
      choices: ["安心した", "自慢した", "後悔した", "緊張した"], answer: 0,
      explanation: "「胸をなで下ろす」は、心配がなくなってほっとすることです。"
    }),
    termQuestion({
      id: "term-20260713-jpn-007", subject: "国語", unit: "語句・慣用句", tier: "core",
      difficulty: L1, stage: L1, examSkill: "文脈語彙", formatTag: "短問", mistakeTags: ["語彙不足", "文脈判断"],
      paperRef: "国語教科書 pp.1-20／国語ワーク pp.12-15", skills: ["語彙", "文脈"],
      prompt: "「この地域の冬は概して晴天が多い」の「概して」の意味として適切なものはどれですか。",
      choices: ["全体として見ると", "一度も例外なく", "急に", "わざと"], answer: 0,
      explanation: "「概して」は、細かな例外を除き、全体の傾向として見ると、という意味です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-008", subject: "国語", unit: "文章のつながり", tier: "core",
      examSkill: "接続語の働き", formatTag: "短問", mistakeTags: ["接続語", "論理関係"],
      paperRef: "国語教科書 pp.1-24／国語ワーク pp.14-17", skills: ["接続語", "論理"],
      prompt: "「予報では雨だった。しかし、試合中は一度も降らなかった。」の「しかし」が示す関係はどれですか。",
      choices: ["逆接", "原因・結果", "追加", "言い換え"], answer: 0,
      explanation: "予報と実際の天気が反対方向なので、前後を逆接でつないでいます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-009", subject: "国語", unit: "指示語", tier: "core",
      examSkill: "指示内容の特定", formatTag: "読解・記述", mistakeTags: ["指示語", "根拠不足"],
      paperRef: "国語教科書 pp.1-24／国語ワーク pp.14-17", skills: ["指示語", "読解"],
      prompt: "「班で意見を出し合うと、自分にはなかった見方に気づける。その経験は、一人で考える時間の価値まで小さくするものではない。」の「その経験」が指すものはどれですか。",
      choices: ["班で意見を出し合い、新しい見方に気づくこと", "一人で長時間考え続けること", "意見を一つに決めること", "自分の意見を言わないこと"], answer: 0,
      explanation: "指示語の直前にあるまとまりを確認すると、意見交換によって新しい見方に気づく経験を指しています。"
    }),
    termQuestion({
      id: "term-20260713-jpn-010", subject: "国語", unit: "文の成分", tier: "core",
      difficulty: L1, stage: L1, examSkill: "主語・述語", formatTag: "短問", mistakeTags: ["主語述語", "文節"],
      paperRef: "国語ワーク pp.18-21", skills: ["文法", "主語・述語"],
      prompt: "「雨上がりの庭で、小鳥が元気に鳴いた。」の主語と述語の組み合わせはどれですか。",
      choices: ["小鳥が―鳴いた", "庭で―鳴いた", "雨上がりの―元気に", "小鳥が―元気に"], answer: 0,
      explanation: "「何が」に当たる主語は「小鳥が」、「どうした」に当たる述語は「鳴いた」です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-011", subject: "国語", unit: "文の成分", tier: "core",
      difficulty: L1, stage: L1, examSkill: "修飾・被修飾", formatTag: "短問", mistakeTags: ["修飾関係", "文節"],
      paperRef: "国語ワーク pp.18-21", skills: ["文法", "修飾語"],
      prompt: "「静かな図書室で本を読む。」で、「静かな」が直接修飾している語はどれですか。",
      choices: ["図書室", "本", "読む", "で"], answer: 0,
      explanation: "どのような図書室かを説明しているので、「静かな」は「図書室」を修飾します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-012", subject: "国語", unit: "品詞", tier: "core",
      difficulty: L1, stage: L1, examSkill: "品詞判別", formatTag: "短問", mistakeTags: ["品詞", "活用の有無"],
      paperRef: "国語ワーク pp.18-23", skills: ["文法", "品詞"],
      prompt: "「亀がゆっくり歩く。」の「ゆっくり」の品詞はどれですか。",
      choices: ["副詞", "形容詞", "名詞", "接続詞"], answer: 0,
      explanation: "「ゆっくり」は動詞「歩く」の様子を修飾し、活用しないので副詞です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-013", subject: "国語", unit: "活用", tier: "core",
      examSkill: "動詞の活用形", formatTag: "短問", mistakeTags: ["活用形", "動詞"],
      paperRef: "国語ワーク pp.20-23", skills: ["文法", "活用"],
      prompt: "「この本を読めば、考えが深まる。」の「読め」の活用形はどれですか。",
      choices: ["仮定形", "未然形", "連用形", "命令形"], answer: 0,
      explanation: "後ろに接続助詞「ば」が付き、条件を表す「読め」は仮定形です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-014", subject: "国語", unit: "品詞", tier: "core",
      examSkill: "形容動詞の判別", formatTag: "短問", mistakeTags: ["品詞", "活用"],
      paperRef: "国語ワーク pp.20-23", skills: ["文法", "形容動詞"],
      prompt: "「会場はとても静かだ。」の「静かだ」の品詞はどれですか。",
      choices: ["形容動詞", "形容詞", "動詞", "副詞"], answer: 0,
      explanation: "終止形が「静かだ」で、性質や状態を表し活用するため形容動詞です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-015", subject: "国語", unit: "助動詞", tier: "core",
      examSkill: "助動詞の判別", formatTag: "短問", mistakeTags: ["助動詞", "品詞"],
      paperRef: "国語ワーク pp.20-25", skills: ["文法", "助動詞"],
      prompt: "「今日は走らない。」の「ない」の品詞はどれですか。",
      choices: ["助動詞", "形容詞", "助詞", "副詞"], answer: 0,
      explanation: "動詞「走る」の未然形「走ら」に付き、打消しを表すので助動詞です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-016", subject: "国語", unit: "敬語", tier: "core",
      difficulty: L1, stage: L1, examSkill: "尊敬語", formatTag: "短問", mistakeTags: ["敬語の種類", "人物関係"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "尊敬語"],
      prompt: "「先生が作品を見る」を、先生への尊敬を表す言い方にしたものはどれですか。",
      choices: ["先生が作品をご覧になる", "先生が作品を拝見する", "先生が作品を見せていただく", "先生が作品を伺う"], answer: 0,
      explanation: "相手側である先生の動作を高める尊敬語は「ご覧になる」です。「拝見する」は自分側の謙譲語です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-017", subject: "国語", unit: "敬語", tier: "core",
      difficulty: L1, stage: L1, examSkill: "謙譲語", formatTag: "短問", mistakeTags: ["敬語の種類", "人物関係"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "謙譲語"],
      prompt: "生徒である自分が先生に意見を言うとき、最も適切な言い方はどれですか。",
      choices: ["先生に意見を申し上げる", "先生に意見をおっしゃる", "先生に意見をご覧になる", "先生に意見を召し上がる"], answer: 0,
      explanation: "自分の「言う」を低めて相手を立てる謙譲語は「申し上げる」です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-018", subject: "国語", unit: "敬語", tier: "core",
      difficulty: L1, stage: L1, examSkill: "丁寧語", formatTag: "短問", mistakeTags: ["敬語の種類", "丁寧語"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "丁寧語"],
      prompt: "動作の主体を高めたり低めたりせず、「明日行く」を丁寧にした言い方はどれですか。",
      choices: ["明日行きます", "明日いらっしゃいます", "明日参ります", "明日伺います"], answer: 0,
      explanation: "「です・ます」を用いて聞き手に丁寧に述べるのが丁寧語です。「参る」「伺う」は謙譲語です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-019", type: "find-error", subject: "国語", unit: "敬語", tier: "core",
      examSkill: "二重敬語の発見", formatTag: "ミス発見", mistakeTags: ["二重敬語", "尊敬語"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "誤用訂正"],
      prompt: "「校長先生が開会の言葉をおっしゃられた」の敬語上の問題として最も適切なものを選びなさい。",
      choices: ["「おっしゃる」と「れる」が重なった二重敬語である", "校長先生には敬語を使わない", "「開会」が謙譲語になっている", "問題はない"], answer: 0,
      explanation: "「おっしゃる」だけですでに尊敬語です。さらに尊敬の「れる」を重ねず、「おっしゃった」とします。"
    }),
    termQuestion({
      id: "term-20260713-jpn-020", type: "find-error", subject: "国語", unit: "敬語", tier: "core",
      examSkill: "敬語の主体判断", formatTag: "ミス発見", mistakeTags: ["謙譲語", "人物関係"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "主体"],
      prompt: "生徒が来客に「校長はすぐにいらっしゃいます」と言いました。敬語上の問題と直し方として適切なものはどれですか。",
      choices: ["身内側の校長を高めているので、「校長はすぐに参ります」とする", "来客を低めているので、「校長はすぐに拝見します」とする", "「すぐに」が失礼なので削るだけでよい", "問題はない"], answer: 0,
      explanation: "外部の来客に対しては、校長も自分側の人物として扱います。「来る」の謙譲語「参る」を使い、「校長はすぐに参ります」とします。"
    }),
    termQuestion({
      id: "term-20260713-jpn-021", subject: "国語", unit: "俳句", tier: "core",
      examSkill: "季語と季節", formatTag: "短問", mistakeTags: ["季語", "季節"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "季語"],
      prompt: "創作俳句「春の川　ほどける光　橋の下」の季語と季節の組み合わせはどれですか。",
      choices: ["「光」―夏", "「春の川」―冬", "「春の川」―春", "「橋の下」―秋"], answer: 2,
      explanation: "「春の川」が季語で、季節は春です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-022", subject: "国語", unit: "俳句", tier: "core",
      examSkill: "比喩的表現の効果", formatTag: "読解・記述", mistakeTags: ["表現効果", "根拠不足"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "比喩"],
      prompt: "創作俳句の「ほどける光」から読み取れる情景として最も適切なものはどれですか。",
      choices: ["水面の揺れによって反射する光が細かく動く様子", "橋の下で人が結んだひもをほどいている様子", "日が沈んで川面から光が少しずつ消えていく様子", "冬の川に張った氷が光を受けて割れていく様子"], answer: 0,
      explanation: "水面の揺れで反射が分かれ、変化する様子を比喩的に表しています。"
    }),
    termQuestion({
      id: "term-20260713-jpn-023", subject: "国語", unit: "俳句", tier: "core",
      examSkill: "語順と視点", formatTag: "読解・記述", mistakeTags: ["語順", "視点"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "表現効果"],
      prompt: "創作俳句の結びを「橋の下」とした効果として最も適切なものはどれですか。",
      choices: ["季語の働きによって、季節を春から冬へ移す", "川全体から光が見える具体的な場所へ視点を絞る", "橋の材料や形に注目させ、構造を詳しく説明する", "川面に光が届かない暗さだけを最後に強調する"], answer: 1,
      explanation: "広がる情景を、最後に具体的な場所へ収めて視点を定めています。"
    }),
    termQuestion({
      id: "term-20260713-jpn-024", subject: "国語", unit: "説明文読解", tier: "core",
      examSkill: "理由の把握", formatTag: "読解・記述", mistakeTags: ["根拠不足", "因果関係"],
      paperRef: "国語教科書 pp.16-19（世界への入り口）", skills: ["説明文", "理由"],
      prompt: "学校図書館が本に読み方の手がかりを添えた後、貸出冊数が伸びたのはなぜですか。",
      choices: ["入口に置く本を人気作だけに絞ったから", "図書館の本の冊数と利用時間が増えたから", "カードの短い説明だけで本を選ぶようになったから", "読む時間や興味に合う本かを、借りる前に判断できたから"], answer: 3,
      explanation: "読み方の手がかりが、自分に合う本を選ぶ判断材料になったためです。"
    })
  ];

  const japaneseChallenge = [
    termQuestion({
      id: "term-20260713-jpn-025", type: "input", subject: "国語", unit: "漢字・語句", tier: "challenge",
      examSkill: "文脈に合う熟語", formatTag: "直接入力", mistakeTags: ["漢字の書き", "語彙不足"],
      paperRef: "国語ワーク pp.10-15", skills: ["熟語", "語彙"],
      prompt: "文章を何度も練り直し、表現を整えることを表す二字熟語を、漢字で答えなさい。",
      answerText: ["推敲"], placeholder: "漢字2字",
      explanation: "文章の語句や表現を練り直すことを「推敲」といいます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-026", subject: "国語", unit: "漢字・語句", tier: "challenge",
      examSkill: "同音異義語", formatTag: "短問", mistakeTags: ["同音異字", "文脈判断"],
      paperRef: "国語ワーク pp.10-15", skills: ["漢字", "同音異義語"],
      prompt: "「困難でも最後まで続ける①イシを固めた。担当者は、本人に参加する②イシがあるか確認した。」①・②の漢字の組み合わせとして適切なものはどれですか。",
      choices: ["①意思・②意志", "①遺志・②意思", "①意志・②意思", "①意志・②遺志"], answer: 2,
      explanation: "「意志を固める」は何かを実行しようとする積極的な心、「参加の意思を確認する」は考えや意向の有無を表します。共起する表現から使い分けます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-027", subject: "国語", unit: "語句・慣用句", tier: "challenge",
      examSkill: "抽象語の意味", formatTag: "短問", mistakeTags: ["語彙不足", "意味の取り違え"],
      paperRef: "国語教科書 pp.1-24／国語ワーク pp.12-15", skills: ["語彙", "抽象語"],
      prompt: "「観察ノートの小さなずれが、原因を調べる端緒となった。」と同じ意味で「端緒」を使っている文はどれですか。",
      choices: ["実験の端緒として、結果を三点に要約して発表を終えた", "一枚の古い写真が、地域の歴史を調べる端緒となった", "意見の対立を端緒に置き、話し合いをいったん中断した", "毎朝同じ時刻に読むことを端緒として長年守っている"], answer: 1,
      explanation: "「端緒」は調査や変化が始まるきっかけ・手がかりです。最終結果、障害、習慣という意味ではありません。"
    }),
    termQuestion({
      id: "term-20260713-jpn-028", subject: "国語", unit: "語句・慣用句", tier: "challenge",
      examSkill: "慣用句の文脈適用", formatTag: "短問", mistakeTags: ["慣用句", "文脈判断"],
      paperRef: "国語ワーク pp.12-15", skills: ["慣用句", "語彙"],
      prompt: "応募書類を完成させた彩は、数字に誤りがないか心配になり、送信ボタンの前で二の足を踏んだ。この表現が表す彩の状態として最も適切なものはどれですか。",
      choices: ["応募を一度取り消した後、同じ応募書類を再び送ろうとしている", "数字を確認する必要を感じず、すぐ次の作業へ進もうとしている", "応募の目的を変え、書類を別の人に渡そうと決めている", "応募する考えはあるが、不安のため実行に移すのをためらっている"], answer: 3,
      explanation: "「二の足を踏む」は、しようという考えがありながら、不安などのため次の行動に移れない状態です。前後の行動から意味を具体化します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-029", subject: "国語", unit: "文章のつながり", tier: "challenge",
      examSkill: "接続語の補充", formatTag: "読解・記述", mistakeTags: ["接続語", "論理関係"],
      paperRef: "国語教科書 pp.1-24／国語ワーク pp.14-19", skills: ["接続語", "論理"],
      prompt: "「記録は後から振り返るために役立つ。＿＿、記録すること自体が考えを整理する機会にもなる。」の空欄に最も適切な語はどれですか。",
      choices: ["さらに", "ところが", "つまり", "なぜなら"], answer: 0,
      explanation: "後の文は記録の別の利点を付け加えているため、添加を表す「さらに」が適切です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-030", subject: "国語", unit: "指示語", tier: "challenge",
      examSkill: "指示範囲の要約", formatTag: "読解・記述", mistakeTags: ["指示語", "要約不足"],
      paperRef: "国語教科書 pp.1-24／国語ワーク pp.14-19", skills: ["指示語", "要約"],
      prompt: "「失敗を隠せば、同じ誤りを別の人が繰り返すかもしれない。失敗を共有し、原因まで確かめる。この姿勢が、集団の学びを前に進める。」の「この姿勢」が指す内容はどれですか。",
      choices: ["失敗を共有して原因まで確かめる姿勢", "失敗した人をすぐ交代させる姿勢", "成功例だけを記録する姿勢", "誤りを他人に知られないようにする姿勢"], answer: 0,
      explanation: "直前の一文全体をまとめると、「失敗を共有して原因まで確かめる姿勢」です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-031", subject: "国語", unit: "説明文読解", tier: "challenge",
      examSkill: "要旨の把握", formatTag: "読解・記述", mistakeTags: ["要旨", "具体例との混同"],
      paperRef: "国語教科書 pp.25-48／国語ワーク pp.16-21", skills: ["説明文", "要旨"],
      prompt: "「道具は作業を速くする。しかし、速さだけで道具を評価すると、使う人が工夫する余地を見落とす。よい道具とは、効率とともに考える余地も残すものだ。」この文章の要旨はどれですか。",
      choices: ["道具は効率だけでなく、使い手の工夫の余地も含めて評価すべきだ", "道具は作業を遅くするほどよい", "工夫するには道具を使わない方がよい", "速い道具はすべて使いにくい"], answer: 0,
      explanation: "逆接後の問題提起と最終文を結ぶと、効率と工夫の余地の両方が大切だという要旨になります。"
    }),
    termQuestion({
      id: "term-20260713-jpn-032", subject: "国語", unit: "説明文読解", tier: "challenge",
      examSkill: "根拠となる具体例", formatTag: "読解・記述", mistakeTags: ["根拠不足", "具体例"],
      paperRef: "国語教科書 pp.25-48／国語ワーク pp.16-21", skills: ["説明文", "根拠"],
      prompt: "主張「短い休憩を挟むと、長時間の学習でも集中を保ちやすい」を最も直接支える資料はどれですか。",
      choices: ["同じ生徒が休憩あり・なしで学習し、休憩ありの後半の正答率が高かった記録", "休憩時間に人気の飲み物の順位", "学習机の色についてのアンケート", "一日の睡眠時間だけをまとめた表"], answer: 0,
      explanation: "主張の条件である「短い休憩」と結果である「集中の維持」を直接比較する資料が根拠になります。"
    }),
    termQuestion({
      id: "term-20260713-jpn-033", subject: "国語", unit: "小説読解", tier: "challenge",
      examSkill: "心情の理由", formatTag: "読解・記述", mistakeTags: ["心情", "根拠不足"],
      paperRef: "国語教科書 pp.1-48／国語ワーク pp.16-21", skills: ["小説", "心情"],
      prompt: "「美咲は返されたノートの隅に、小さく書かれた友人の助言を見つけた。消しかけた自分の案をもう一度囲み、顔を上げた。」美咲が顔を上げた理由として最も適切なものはどれですか。",
      choices: ["自分の案を生かせると気づき、前向きになったから", "友人の字が読めず、困ったから", "ノートを返す相手を探したから", "自分の案を完全に捨てると決めたから"], answer: 0,
      explanation: "「消しかけた案をもう一度囲む」という行動が、自分の案を見直す前向きな心情を示しています。"
    }),
    termQuestion({
      id: "term-20260713-jpn-034", subject: "国語", unit: "論説文読解", tier: "challenge",
      examSkill: "反対意見の役割", formatTag: "読解・記述", mistakeTags: ["論理構成", "反論"],
      paperRef: "国語教科書 pp.25-48／国語ワーク pp.16-21", skills: ["論説文", "構成"],
      prompt: "筆者が自説の途中で「時間をかけて話し合うより、すぐ決めた方がよい場合もある」と述べ、その後に条件を示して反論している。この一文の役割はどれですか。",
      choices: ["想定される反対意見を示し、自説の条件を明確にする", "自説を全面的に取り消す", "話題を無関係な内容へ変える", "具体例だけで結論を省く"], answer: 0,
      explanation: "いったん反対意見を認めた上で条件を整理すると、主張の適用範囲が明確になります。"
    }),
    termQuestion({
      id: "term-20260713-jpn-035", subject: "国語", unit: "文節", tier: "challenge",
      examSkill: "文節分け", formatTag: "短問", mistakeTags: ["文節", "補助語"],
      paperRef: "国語ワーク pp.18-23", skills: ["文法", "文節"],
      prompt: "「私は借りた資料を読み返してみた。」の文節数と、「みた」の扱いを正しく説明したものはどれですか。",
      choices: ["4文節―「読み返してみた」全体を一文節にする", "5文節―「みた」は補助動詞で、「読み返して」と別の文節になる", "6文節―「読み」と「返して」を別々の文節にする", "5文節―「みた」は形容詞の一種なので、「読み返して」を修飾する"], answer: 1,
      explanation: "「私は／借りた／資料を／読み返して／みた」の5文節です。「みた」は「試しに〜する」の意味を添える補助動詞で、一文節を作ります。"
    }),
    termQuestion({
      id: "term-20260713-jpn-036", subject: "国語", unit: "助動詞", tier: "challenge",
      examSkill: "助動詞の意味判別", formatTag: "短問", mistakeTags: ["助動詞", "尊敬と受身"],
      paperRef: "国語ワーク pp.20-25", skills: ["文法", "助動詞"],
      prompt: "①来賓を迎える席で、係が丁重に「校長先生が会場に入られました」と報告した。②「私は弟に写真を見られた。」①・②の「られ」の意味の組み合わせとして正しいものはどれですか。",
      choices: ["①受身・②尊敬", "①可能・②自発", "①尊敬・②受身", "①自発・②可能"], answer: 2,
      explanation: "①は「来賓を迎える席」で丁重に校長の動作を述べているので尊敬、②は弟の動作を受けたことを表す受身です。場面と動作主から判断します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-037", subject: "国語", unit: "敬語", tier: "challenge",
      examSkill: "場面に応じた尊敬表現", formatTag: "短問", mistakeTags: ["尊敬語", "依頼表現"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "場面判断"],
      prompt: "先生に、提出した資料を見てもらいたいときの言い方として最も適切なものはどれですか。",
      choices: ["こちらの資料をご覧ください", "こちらの資料を拝見してください", "こちらの資料を見せていただいてください", "こちらの資料をお伺いください"], answer: 0,
      explanation: "相手である先生の「見る」を高める尊敬語「ご覧になる」を使い、「ご覧ください」と依頼します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-038", type: "find-error", subject: "国語", unit: "敬語", tier: "challenge",
      examSkill: "謙譲語の誤用訂正", formatTag: "ミス発見", mistakeTags: ["謙譲語", "人物関係"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "誤用訂正"],
      prompt: "生徒が先生に「昨日、先生の発表をご覧しました」と伝えました。直すべき箇所と直し方はどれですか。",
      choices: ["自分の「見る」なので「拝見しました」に直す", "先生の発表なので「おっしゃいました」に直す", "過去のことなので「参りました」に直す", "正しいので直す必要はない"], answer: 0,
      explanation: "見る主体は生徒自身です。自分の動作を低める謙譲語「拝見しました」が適切です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-039", subject: "国語", unit: "敬語", tier: "challenge",
      examSkill: "人物関係と敬語", formatTag: "資料読取", mistakeTags: ["人物関係", "敬語の種類"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "表の読み取り"],
      figure: {
        kind: "table", title: "会話の人物関係", columns: ["話し手", "聞き手", "話題の人物"],
        rows: [["生徒", "来校した保護者", "自校の校長"], ["生徒", "自校の校長", "来校した講師"]],
        alt: "生徒が誰に向かって誰について話すかを示す表", caption: "相手と、話題の人物が自分側か相手側かを確認する。"
      },
      prompt: "表の1行目の場面で、生徒が保護者に校長の到着を伝える表現として最も適切なものはどれですか。",
      choices: ["校長はまもなく参ります", "校長先生はまもなくいらっしゃいます", "校長はまもなくお見えになられます", "校長はまもなく拝見します"], answer: 0,
      explanation: "外部の保護者に対して自校の校長は身内側なので、「来る」の謙譲語「参る」を使います。"
    }),
    termQuestion({
      id: "term-20260713-jpn-040", subject: "国語", unit: "俳句", tier: "challenge",
      examSkill: "二句の情景比較", formatTag: "読解・記述", mistakeTags: ["情景", "時間関係"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "比較読解"],
      prompt: "二句の時間の移り変わりを説明したものとして最も適切なのはどれですか。",
      choices: ["Aは雨が降り出す前、Bは雪が完全にやんだ後", "Aは雨が降っている時、Bは雨がやんだ後", "AもBも雨が降り出す前の晴れた時", "Aは秋の夕方、Bは冬の朝"], answer: 1,
      explanation: "Aは雨中、Bは雨上がりの情景です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-041", subject: "国語", unit: "俳句", tier: "challenge",
      examSkill: "切れ字の効果", formatTag: "読解・記述", mistakeTags: ["切れ字", "表現効果"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "切れ字"],
      prompt: "俳句Aの切れ字「や」の働きとして最も適切なものはどれですか。",
      choices: ["夕立への驚きや強い印象を示し、そこで一度意味を切る", "校庭の広さと白線の長さを客観的な数値で順に説明する", "夕立がすでに遠い過去の出来事になったと示す", "白線が見えないことを強く否定し、雨を肯定する"], answer: 0,
      explanation: "切れ字「や」が夕立を強く提示し、後の情景へつなぎます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-042", subject: "国語", unit: "俳句", tier: "challenge",
      examSkill: "表現の対比", formatTag: "読解・記述", mistakeTags: ["表現比較", "根拠不足"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "対比"],
      prompt: "雨の前後を詠んだ二句の表現の違いとして最も適切なものはどれですか。",
      choices: ["Aは登場人物どうしの会話を中心にし、Bは出来事を順に説明する", "Aは校庭で聞こえる音を描き、Bは教室に残る匂いを描く", "Aは雨の動きを強く描き、Bは風も人も止まった静けさだけを描く", "Aは雨で白線がにじむ様子、Bは雨後に風が白線を越す動きを描く"], answer: 3,
      explanation: "Aは雨が白線を変える様子、Bは雨後の風の動きを描きます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-043", type: "find-error", subject: "国語", unit: "品詞", tier: "challenge",
      examSkill: "品詞表の検証", formatTag: "資料読取", mistakeTags: ["品詞", "活用の有無"],
      paperRef: "国語ワーク pp.18-25", skills: ["文法", "表の読み取り"],
      figure: {
        kind: "table", title: "語の分類メモ", columns: ["語", "メモされた品詞", "用例"],
        rows: [["美しい", "形容詞", "美しい景色"], ["静かに", "形容動詞", "静かに歩く"], ["すぐに", "名詞", "すぐに出発する"], ["大きな", "形容詞", "大きな窓"]],
        alt: "四つの語について品詞と用例を整理した表", caption: "活用の有無と、用例での働きを合わせて確認する。"
      },
      prompt: "表で誤っている二行と、それぞれの正しい品詞の組み合わせを選びなさい。",
      choices: ["「静かに」―副詞／「大きな」―形容動詞", "「美しい」―連体詞／「すぐに」―形容詞", "「すぐに」―副詞／「大きな」―連体詞", "「美しい」―形容動詞／「静かに」―連体詞"], answer: 2,
      explanation: "「すぐに」は動詞を修飾する副詞、「大きな」は活用せず名詞だけを修飾する連体詞です。「静かに」は形容動詞「静かだ」の連用形です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-044", subject: "国語", unit: "資料と文章", tier: "challenge",
      examSkill: "数値に基づく表現", formatTag: "資料読取", mistakeTags: ["資料読取", "言い過ぎ"],
      paperRef: "国語教科書 pp.25-48／国語ワーク pp.16-21", skills: ["資料読取", "表現の妥当性"],
      figure: {
        kind: "table", title: "読書後の振り返り方法と回答人数", columns: ["方法", "内容を説明できた", "説明が難しかった"],
        rows: [["要点を3行で書いた", "18人", "6人"], ["感想だけを書いた", "11人", "13人"]],
        alt: "二つの振り返り方法ごとに、内容を説明できた人数と難しかった人数を示す表", caption: "同じ24人ずつの結果。"
      },
      prompt: "この表だけから確実に言えることはどれですか。",
      choices: ["この調査では、要点を3行で書いた組の方が内容を説明できた人数が多い", "振り返り方法だけが理解度を決めたと判断できる", "二つの組で説明できた人数の差は12人である", "別の学校でも同じ人数差になると予測できる"], answer: 0,
      explanation: "表が示す範囲で、二つの組の人数を比較する表現だけが妥当です。"
    })
  ];

  const japaneseFinal = [
    termQuestion({
      id: "term-20260713-jpn-045", subject: "国語", unit: "論説文読解", tier: "final",
      examSkill: "主張と条件の統合", formatTag: "複合", mistakeTags: ["要旨", "条件の見落とし"],
      paperRef: "国語教科書 pp.25-48／国語ワーク pp.16-21", skills: ["論説文", "要旨", "条件整理"],
      prompt: "「便利な仕組みは、選ぶ手間を減らす。一方で、仕組みが示した候補だけを見ていると、選択肢の存在そのものに気づけない。大切なのは便利さを捨てることではなく、ときどき候補の外側を確かめることだ。」筆者の主張として最も適切なものはどれですか。",
      choices: ["便利な仕組みを使いつつ、示されない選択肢にも意識を向けるべきだ", "仕組みが候補を示した後は、その中だけで比較するのがよい", "候補の数を増やすことを判断の中心に置くべきだ", "選択にかかる時間を基準に仕組みを評価すべきだ"], answer: 0,
      explanation: "最終文の「便利さを捨てることではなく」と「候補の外側を確かめる」を両方含む選択肢が要旨です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-046", subject: "国語", unit: "論説文読解", tier: "final",
      examSkill: "条件を残した要約", formatTag: "複合", mistakeTags: ["要旨", "条件の見落とし"],
      paperRef: "国語教科書 pp.16-19・34-45（読解総合）", skills: ["論説文", "要約", "条件整理"],
      prompt: "文章の中心内容を要約したものとして最も適切なものはどれですか。",
      choices: ["利点と条件の両方を残した要約", "具体例だけを残した要約", "筆者の主張を反対にした要約", "結論を省いた要約"], answer: 0,
      explanation: "要約では、文章の中心となる主張と、それを限定する重要な条件を残します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-047", subject: "国語", unit: "説明文読解", tier: "final",
      examSkill: "推論の妥当性", formatTag: "複合", mistakeTags: ["論理の飛躍", "根拠不足"],
      paperRef: "国語教科書 pp.25-48／国語ワーク pp.16-21", skills: ["説明文", "推論"],
      prompt: "「新しい言葉を覚えると、以前は同じに見えた二つの状態を区別できる。区別できれば、変化にも早く気づく。」この説明から導ける考えはどれですか。",
      choices: ["語彙が増えることは、物事の違いを捉える助けになる", "語彙が増えると変化の原因まで判断できるようになる", "状態の違いは名称を付けた後に初めて生じる", "新しい言葉は古い言葉より細かい区別に向いている"], answer: 0,
      explanation: "本文が述べる「言葉による区別」と「変化への気づき」を、言い過ぎずにまとめたものです。"
    }),
    termQuestion({
      id: "term-20260713-jpn-048", subject: "国語", unit: "文章比較", tier: "final",
      examSkill: "二文章の共通点", formatTag: "複合", mistakeTags: ["文章比較", "要旨"],
      paperRef: "国語教科書 pp.1-48／国語ワーク pp.16-21", skills: ["比較読解", "要旨"],
      prompt: "文章A「地図は情報を選んで示すから、目的に合う地図を選ぶ必要がある。」文章B「グラフは数値の一部を目立たせるため、軸や範囲も確かめたい。」両文章に共通する考えはどれですか。",
      choices: ["資料は示し方によって見え方が変わるため、目的や条件を確かめる必要がある", "地図とグラフでは省かれる情報の種類が同じである", "数値を含む資料は利用目的を確認しなくてもよい", "資料は形式をそろえてから内容を比べるべきだ"], answer: 0,
      explanation: "Aは情報の選択、Bは数値の見せ方に触れ、どちらも資料の条件確認を求めています。"
    }),
    termQuestion({
      id: "term-20260713-jpn-049", type: "find-error", subject: "国語", unit: "文法・表現", tier: "final",
      examSkill: "並列表現の訂正", formatTag: "ミス発見", mistakeTags: ["並列表現", "助詞"],
      paperRef: "国語ワーク pp.18-25", skills: ["文法", "文章推敲"],
      prompt: "「調査の目的は、利用の実態を知ることと、改善案を考えたい。」を、並列する部分と述語の関係がそろうように直したものはどれですか。",
      choices: ["調査の目的は、利用の実態を知りたいことと、具体的な改善案である。", "調査の目的は、利用の実態を知るので、改善案を考えたい。", "調査の目的は、利用の実態を知ることと、改善案を考えることである。", "調査の目的は、利用の実態と、改善案を考えることにした。"], answer: 2,
      explanation: "「知ること」と「考えること」を名詞化した同じ形で並べ、主語「目的は」に対応する述語「ことである」で結びます。"
    }),
    termQuestion({
      id: "term-20260713-jpn-050", type: "find-error", subject: "国語", unit: "敬語", tier: "final",
      examSkill: "複数場面の敬語訂正", formatTag: "ミス発見", mistakeTags: ["敬語の種類", "人物関係"],
      paperRef: "国語ワーク pp.24-29", skills: ["敬語", "誤用訂正"],
      prompt: "次の二つを、人物関係に合う敬語に直した組み合わせはどれですか。①生徒が先生に「明日、母が先生の研究室へいらっしゃいます。」②生徒が同級生に「校長先生が資料を拝見しました。」",
      choices: ["①母が伺います　②校長先生がご覧になりました", "①母が参られます　②校長先生が拝見なさいました", "①母がお見えになります　②校長先生が伺いました", "①母が拝見します　②校長先生が申し上げました"], answer: 0,
      explanation: "①では先生に対し、自分側の母の「行く・訪ねる」を謙譲語「伺う」にします。②では同級生に校長の動作を述べるため、「見る」を尊敬語「ご覧になる」にします。誰の動作かを二つの場面で判断します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-051", subject: "国語", unit: "俳句", tier: "final",
      examSkill: "二句の焦点比較", formatTag: "読解・記述", mistakeTags: ["焦点", "表現比較"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "比較読解"],
      prompt: "共通する上五に続く情景の違いとして、最も適切なものはどれですか。",
      choices: ["Aは視覚を中心に無人の静けさを描き、Bは靴音という聴覚を通して人の動きを描く", "Aは灯が消えて人が集まる様子を、Bは靴音が止む様子を描く", "Aは人物の動きを、Bは無人改札の静けさを描く", "AもBも人物を直接描く"], answer: 0,
      explanation: "Aは静かな視覚像、Bは移動と音を示します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-052", subject: "国語", unit: "俳句", tier: "final",
      examSkill: "主題に合う推敲", formatTag: "複合", mistakeTags: ["主題", "表現効果"],
      paperRef: "国語教科書 pp.20-28（俳句）", skills: ["俳句", "推敲"],
      prompt: "俳句Bで結びを「靴の音」とした効果として、最も適切なものはどれですか。",
      choices: ["人物の姿より、秋の駅に響く足音と移動を意識させる", "出来事を夢の中に限定する", "靴の持ち主を作者だと明示する", "灯が消えた時刻を示す"], answer: 0,
      explanation: "人物を説明せず、改札を抜ける動きと音を前景化します。"
    }),
    termQuestion({
      id: "term-20260713-jpn-053", subject: "国語", unit: "資料と文章", tier: "final",
      examSkill: "割合と人数の区別", formatTag: "資料読取", mistakeTags: ["資料読取", "割合"],
      paperRef: "国語教科書 pp.25-48／国語ワーク pp.16-21", skills: ["資料読取", "論理"],
      figure: {
        kind: "table", title: "図書館利用の調査", columns: ["学年", "回答者", "週1回以上利用", "割合"],
        rows: [["1年", "80人", "48人", "60%"], ["2年", "50人", "35人", "70%"], ["3年", "100人", "55人", "55%"]],
        alt: "三学年の回答者数、週1回以上図書館を利用する人数と割合を示す表", caption: "人数と割合を分けて比べる。"
      },
      prompt: "表に基づく説明として正しいものはどれですか。",
      choices: ["利用者の割合は2年が最も高いが、利用者数は3年が最も多い", "利用者数も割合も2年が最も高い", "回答者数の順位と利用割合の順位は一致する", "1年と3年の利用者数の差は5人である"], answer: 0,
      explanation: "割合は2年の70%が最高です。一方、人数は3年の55人が最多です。"
    }),
    termQuestion({
      id: "term-20260713-jpn-054", subject: "国語", unit: "論説文総合", tier: "final",
      examSkill: "譲歩を含む要旨", formatTag: "複合", mistakeTags: ["要旨", "逆接"],
      paperRef: "国語教科書 pp.1-48／国語ワーク pp.14-21", skills: ["論説文", "構成", "要約"],
      prompt: "「規則は迷いを減らす点で役立つ。たしかに、細かな規則が安心につながる場面もある。だが、状況が変わったとき、目的に照らして規則を見直す力も必要だ。」最も適切な要約はどれですか。",
      choices: ["規則の利点を認めつつ、状況に応じて目的から見直すことも必要だ", "安心につながる規則は状況が変わっても同じ形で保つ方がよい", "規則を見直すときは目的より細かな表現を優先するべきだ", "迷いを減らす効果があれば規則の目的を確認しなくてもよい"], answer: 0,
      explanation: "利点を認める譲歩と、「だが」以後の中心主張の両方を含める必要があります。"
    })
  ];

  const socialCore = [
    termQuestion({
      id: "term-20260713-soc-001", subject: "社会", unit: "日清戦争", tier: "core",
      difficulty: L1, stage: L1, examSkill: "開戦背景", formatTag: "短問", mistakeTags: ["用語", "因果関係"],
      paperRef: "社会教科書 pp.186-191／社会ワーク pp.48-51", skills: ["日清戦争", "朝鮮"],
      prompt: "日清戦争前、日本と清が主に勢力を争っていた地域はどこですか。",
      choices: ["朝鮮", "インド", "オーストラリア", "ブラジル"], answer: 0,
      explanation: "日本と清は朝鮮への影響力をめぐって対立し、1894年に日清戦争が始まりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-002", subject: "社会", unit: "日清戦争", tier: "core",
      difficulty: L1, stage: L1, examSkill: "講和条約", formatTag: "短問", mistakeTags: ["条約", "用語"],
      paperRef: "社会教科書 pp.186-191／社会ワーク pp.48-51", skills: ["下関条約", "日清戦争"],
      prompt: "日清戦争の講和条約はどれですか。",
      choices: ["下関条約", "ポーツマス条約", "ベルサイユ条約", "サンフランシスコ平和条約"], answer: 0,
      explanation: "1895年に日本と清が結んだ講和条約が下関条約です。"
    }),
    termQuestion({
      id: "term-20260713-soc-003", subject: "社会", unit: "三国干渉", tier: "core",
      examSkill: "関係国の確認", formatTag: "短問", mistakeTags: ["国名", "用語"],
      paperRef: "社会教科書 pp.190-193／社会ワーク pp.50-53", skills: ["三国干渉", "国際関係"],
      prompt: "下関条約後、日本に遼東半島を清へ返すよう求めた三国の組み合わせはどれですか。",
      choices: ["ロシア・ドイツ・フランス", "イギリス・アメリカ・イタリア", "清・朝鮮・ロシア", "ドイツ・オーストリア・イタリア"], answer: 0,
      explanation: "ロシア・ドイツ・フランスによる要求を三国干渉といいます。"
    }),
    termQuestion({
      id: "term-20260713-soc-004", subject: "社会", unit: "義和団事件", tier: "core",
      examSkill: "事件と列強", formatTag: "短問", mistakeTags: ["用語", "年代"],
      paperRef: "社会教科書 pp.192-195／社会ワーク pp.50-53", skills: ["義和団事件", "列強"],
      prompt: "1900年、清で外国勢力を排斥する動きが広がり、日本を含む列強が出兵した事件はどれですか。",
      choices: ["義和団事件", "米騒動", "五・一五事件", "二・二六事件"], answer: 0,
      explanation: "清で起きた外国勢力排斥運動と列強の出兵を義和団事件といいます。"
    }),
    termQuestion({
      id: "term-20260713-soc-005", subject: "社会", unit: "日英同盟", tier: "core",
      examSkill: "同盟の目的", formatTag: "短問", mistakeTags: ["国際関係", "因果関係"],
      paperRef: "社会教科書 pp.192-197／社会ワーク pp.52-55", skills: ["日英同盟", "ロシア"],
      prompt: "1902年に日本がイギリスと日英同盟を結んだ背景として最も適切なものはどれですか。",
      choices: ["東アジアで勢力を広げるロシアに対抗するため", "清と共同で朝鮮を統治するため", "アメリカから独立するため", "国際連盟をつくるため"], answer: 0,
      explanation: "日本とイギリスは、ともに東アジアでのロシアの南下を警戒していました。"
    }),
    termQuestion({
      id: "term-20260713-soc-006", subject: "社会", unit: "日露戦争", tier: "core",
      difficulty: L1, stage: L1, examSkill: "対戦国", formatTag: "短問", mistakeTags: ["用語", "年代"],
      paperRef: "社会教科書 pp.194-199／社会ワーク pp.52-55", skills: ["日露戦争", "近代史"],
      prompt: "1904年に始まった日露戦争で、日本が戦った国はどこですか。",
      choices: ["ロシア", "清", "ドイツ", "アメリカ"], answer: 0,
      explanation: "朝鮮・満州をめぐる対立から、日本とロシアの戦争が始まりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-007", subject: "社会", unit: "日露戦争", tier: "core",
      examSkill: "講和条約", formatTag: "短問", mistakeTags: ["条約", "用語"],
      paperRef: "社会教科書 pp.196-201／社会ワーク pp.54-57", skills: ["ポーツマス条約", "日露戦争"],
      prompt: "日露戦争の講和条約はどれですか。",
      choices: ["ポーツマス条約", "下関条約", "日米修好通商条約", "ワシントン条約"], answer: 0,
      explanation: "1905年、アメリカ大統領の仲介でポーツマス条約が結ばれました。"
    }),
    termQuestion({
      id: "term-20260713-soc-008", subject: "社会", unit: "日比谷焼打ち事件", tier: "core",
      examSkill: "事件の原因", formatTag: "短問", mistakeTags: ["因果関係", "講和条件"],
      paperRef: "社会教科書 pp.198-201／社会ワーク pp.54-57", skills: ["日比谷焼打ち事件", "賠償金"],
      prompt: "ポーツマス条約後、東京で日比谷焼打ち事件が起きた主な理由はどれですか。",
      choices: ["賠償金を得られないなど、国民が講和条件に不満を持ったから", "日本が朝鮮を独立させたから", "普通選挙が実現したから", "米の価格が急落したから"], answer: 0,
      explanation: "戦争の犠牲が大きい一方で賠償金を得られず、講和条件への不満が爆発しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-009", subject: "社会", unit: "韓国併合", tier: "core",
      examSkill: "年代と用語", formatTag: "短問", mistakeTags: ["年代", "用語"],
      paperRef: "社会教科書 pp.200-205／社会ワーク pp.56-59", skills: ["韓国併合", "植民地支配"],
      prompt: "日本が韓国を併合した年はいつですか。",
      choices: ["1910年", "1894年", "1905年", "1918年"], answer: 0,
      explanation: "日本は1910年に韓国を併合し、朝鮮総督府を置いて植民地支配を進めました。"
    }),
    termQuestion({
      id: "term-20260713-soc-010", subject: "社会", unit: "条約改正", tier: "core",
      examSkill: "関税自主権", formatTag: "短問", mistakeTags: ["条約改正", "用語"],
      paperRef: "社会教科書 pp.202-205／社会ワーク pp.56-59", skills: ["関税自主権", "小村寿太郎"],
      prompt: "1911年、日本が回復し、不平等条約の改正を完成させた権利はどれですか。",
      choices: ["関税自主権", "領事裁判権", "普通選挙権", "団結権"], answer: 0,
      explanation: "領事裁判権の撤廃に続き、1911年に関税自主権を回復して条約改正が完成しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-011", subject: "社会", unit: "第一次世界大戦", tier: "core",
      examSkill: "参戦陣営", formatTag: "短問", mistakeTags: ["陣営", "国際関係"],
      paperRef: "社会教科書 pp.206-213／社会ワーク pp.58-63", skills: ["第一次世界大戦", "連合国"],
      prompt: "第一次世界大戦で、日本はどちらの陣営として参戦しましたか。",
      choices: ["連合国側", "同盟国側", "どちらにも参加しなかった", "途中からロシアだけと戦った"], answer: 0,
      explanation: "日本は日英同盟を理由に、イギリスなどの連合国側で参戦しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-012", subject: "社会", unit: "二十一か条の要求", tier: "core",
      examSkill: "要求の相手国", formatTag: "短問", mistakeTags: ["国名", "用語"],
      paperRef: "社会教科書 pp.208-213／社会ワーク pp.60-63", skills: ["二十一か条の要求", "中国"],
      prompt: "1915年、日本が二十一か条の要求を出した相手国はどこですか。",
      choices: ["中国", "ロシア", "イギリス", "ドイツ"], answer: 0,
      explanation: "日本は第一次世界大戦中、中国の袁世凱政府に二十一か条の要求を出しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-013", subject: "社会", unit: "ロシア革命", tier: "core",
      examSkill: "革命の結果", formatTag: "短問", mistakeTags: ["年代", "用語"],
      paperRef: "社会教科書 pp.212-217／社会ワーク pp.62-65", skills: ["ロシア革命", "社会主義"],
      prompt: "1917年のロシア革命後に成立した政権の特徴として適切なものはどれですか。",
      choices: ["社会主義を掲げた", "絶対王政を強化した", "植民地帝国を復活させた", "国際連盟を解散した"], answer: 0,
      explanation: "ロシア革命により、世界で初めて社会主義を掲げる政権が成立しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-014", subject: "社会", unit: "米騒動", tier: "core",
      examSkill: "事件の背景", formatTag: "短問", mistakeTags: ["因果関係", "社会運動"],
      paperRef: "社会教科書 pp.214-219／社会ワーク pp.62-65", skills: ["米騒動", "シベリア出兵"],
      prompt: "1918年の米騒動が広がった背景として最も適切なものはどれですか。",
      choices: ["シベリア出兵を見越した買い占めなどで米価が急上昇した", "米が大量に余って価格が下がった", "普通選挙法が廃止された", "関税自主権が失われた"], answer: 0,
      explanation: "シベリア出兵を見越した投機や買い占めで米価が上がり、富山県の女性たちの行動をきっかけに広がりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-015", subject: "社会", unit: "政党内閣", tier: "core",
      examSkill: "人物と政治", formatTag: "短問", mistakeTags: ["人物", "政党政治"],
      paperRef: "社会教科書 pp.216-221／社会ワーク pp.64-67", skills: ["原敬", "政党内閣"],
      prompt: "1918年、本格的な政党内閣を組織した首相は誰ですか。",
      choices: ["原敬", "伊藤博文", "東条英機", "吉田茂"], answer: 0,
      explanation: "立憲政友会総裁の原敬が、政党を基礎とする本格的な内閣を組織しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-016", subject: "社会", unit: "普通選挙法", tier: "core",
      examSkill: "選挙資格", formatTag: "短問", mistakeTags: ["選挙制度", "条件"],
      paperRef: "社会教科書 pp.220-225／社会ワーク pp.66-69", skills: ["普通選挙法", "大正デモクラシー"],
      prompt: "1925年の普通選挙法で衆議院議員選挙の選挙権を得たのは、原則としてどの人々ですか。",
      choices: ["25歳以上のすべての男子", "20歳以上のすべての男女", "25歳以上で多額納税する男子だけ", "女性だけ"], answer: 0,
      explanation: "納税額による制限はなくなりましたが、この時点では女性に選挙権はありませんでした。"
    }),
    termQuestion({
      id: "term-20260713-soc-017", subject: "社会", unit: "治安維持法", tier: "core",
      examSkill: "法律の目的", formatTag: "短問", mistakeTags: ["法律", "同年事項"],
      paperRef: "社会教科書 pp.222-225／社会ワーク pp.66-69", skills: ["治安維持法", "社会運動"],
      prompt: "普通選挙法と同じ1925年に制定され、社会主義運動などを取り締まるために使われた法律はどれですか。",
      choices: ["治安維持法", "国家総動員法", "大日本帝国憲法", "独占禁止法"], answer: 0,
      explanation: "普通選挙の実現と同じ年に治安維持法が制定され、思想や社会運動への取り締まりが強まりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-018", subject: "社会", unit: "世界恐慌", tier: "core",
      examSkill: "年代と発端", formatTag: "短問", mistakeTags: ["年代", "経済"],
      paperRef: "社会教科書 pp.226-231／社会ワーク pp.68-71", skills: ["世界恐慌", "ニューヨーク"],
      prompt: "1929年、アメリカの株価暴落をきっかけに世界へ広がった不況を何といいますか。",
      choices: ["世界恐慌", "石油危機", "大戦景気", "特需景気"], answer: 0,
      explanation: "ニューヨーク株式市場の大暴落をきっかけに、世界恐慌が広がりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-019", subject: "社会", unit: "満州事変", tier: "core",
      examSkill: "年代と地域", formatTag: "短問", mistakeTags: ["年代", "用語"],
      paperRef: "社会教科書 pp.230-235／社会ワーク pp.70-73", skills: ["満州事変", "中国東北部"],
      prompt: "1931年、日本の関東軍が中国東北部で軍事行動を拡大した出来事はどれですか。",
      choices: ["満州事変", "盧溝橋事件", "西安事件", "義和団事件"], answer: 0,
      explanation: "柳条湖での鉄道爆破をきっかけとして関東軍が行動を広げたのが満州事変です。"
    }),
    termQuestion({
      id: "term-20260713-soc-020", subject: "社会", unit: "日中戦争", tier: "core",
      examSkill: "戦争の開始", formatTag: "短問", mistakeTags: ["年代", "用語"],
      paperRef: "社会教科書 pp.234-239／社会ワーク pp.72-75", skills: ["日中戦争", "盧溝橋事件"],
      prompt: "1937年の盧溝橋事件をきっかけに本格化した戦争はどれですか。",
      choices: ["日中戦争", "日清戦争", "日露戦争", "朝鮮戦争"], answer: 0,
      explanation: "盧溝橋事件後、日本と中国の戦闘が拡大し、日中戦争となりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-021", subject: "社会", unit: "太平洋戦争", tier: "core",
      examSkill: "開戦時の行動", formatTag: "短問", mistakeTags: ["年代", "戦争"],
      paperRef: "社会教科書 pp.238-243／社会ワーク pp.74-77", skills: ["太平洋戦争", "真珠湾"],
      prompt: "1941年12月、日本軍の真珠湾攻撃などをきっかけに始まった戦争はどれですか。",
      choices: ["太平洋戦争", "第一次世界大戦", "日露戦争", "朝鮮戦争"], answer: 0,
      explanation: "日本はハワイの真珠湾と東南アジア方面を攻撃し、アメリカ・イギリスなどとの太平洋戦争に入りました。"
    }),
    termQuestion({
      id: "term-20260713-soc-022", subject: "社会", unit: "終戦", tier: "core",
      examSkill: "終戦文書", formatTag: "短問", mistakeTags: ["用語", "年代"],
      paperRef: "社会教科書 pp.242-247／社会ワーク pp.76-79", skills: ["ポツダム宣言", "終戦"],
      prompt: "1945年、日本が受諾して戦争終結へ進んだ宣言はどれですか。",
      choices: ["ポツダム宣言", "カイロ宣言", "世界人権宣言", "独立宣言"], answer: 0,
      explanation: "日本はポツダム宣言を受諾し、連合国に降伏しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-023", subject: "社会", unit: "日本国憲法", tier: "core",
      examSkill: "基本原理", formatTag: "短問", mistakeTags: ["憲法", "基本原理"],
      paperRef: "社会教科書 pp.246-251／社会ワーク pp.78-81", skills: ["日本国憲法", "三原則"],
      prompt: "日本国憲法の基本原理の組み合わせとして正しいものはどれですか。",
      choices: ["国民主権・基本的人権の尊重・平和主義", "天皇主権・富国強兵・殖産興業", "自由放任・鎖国・身分制", "軍国主義・植民地主義・絶対王政"], answer: 0,
      explanation: "日本国憲法は国民主権、基本的人権の尊重、平和主義を基本原理とします。"
    }),
    termQuestion({
      id: "term-20260713-soc-024", subject: "社会", unit: "冷戦", tier: "core",
      examSkill: "用語の定義", formatTag: "短問", mistakeTags: ["国際関係", "用語"],
      paperRef: "社会教科書 pp.250-257／社会ワーク pp.80-83", skills: ["冷戦", "アメリカとソ連"],
      prompt: "第二次世界大戦後、アメリカを中心とする陣営とソ連を中心とする陣営が対立した状態を何といいますか。",
      choices: ["冷戦", "産業革命", "大正デモクラシー", "三国干渉"], answer: 0,
      explanation: "両大国が全面戦争を避けながら、政治・軍事・経済で対立した状態を冷戦といいます。"
    })
  ];

  const socialChallenge = [
    termQuestion({
      id: "term-20260713-soc-025", subject: "社会", unit: "近代史年表", tier: "challenge",
      examSkill: "年代整序", formatTag: "資料読取", mistakeTags: ["年代整序", "出来事の混同"],
      paperRef: "社会教科書 pp.186-225／社会ワーク pp.48-69", skills: ["年代整序", "近代史"],
      prompt: "次の出来事を古い順に並べたものはどれですか。①日露戦争 ②第一次世界大戦 ③米騒動 ④普通選挙法",
      choices: ["①→②→③→④", "②→①→④→③", "①→③→②→④", "③→①→②→④"], answer: 0,
      explanation: "日露戦争は1904年、第一次世界大戦は1914年、米騒動は1918年、普通選挙法は1925年です。"
    }),
    termQuestion({
      id: "term-20260713-soc-026", subject: "社会", unit: "講和条約", tier: "challenge",
      examSkill: "条約資料の照合", formatTag: "資料読取", mistakeTags: ["条約", "資料読取"],
      paperRef: "社会教科書 pp.188-201／社会ワーク pp.48-57", skills: ["下関条約", "ポーツマス条約", "比較"],
      figure: {
        kind: "table", title: "二つの講和条約の整理", columns: ["条約", "相手国", "主な内容の一部"],
        rows: [["下関条約", "清", "台湾などを得る・賠償金を得る"], ["ポーツマス条約", "ロシア", "南樺太・南満州の権益を得る・賠償金なし"]],
        alt: "下関条約とポーツマス条約の相手国と主な内容を比べた表", caption: "領土・権益と賠償金を区別する。"
      },
      prompt: "表から分かることとして正しいものはどれですか。",
      choices: ["日本は日露戦争後、領土や権益の一部を得たが賠償金は得なかった", "日本は日清戦争後、賠償金を得なかった", "二つの条約は同じ相手国と結んだ", "ポーツマス条約で台湾を得た"], answer: 0,
      explanation: "ポーツマス条約では南樺太や南満州の権益などを得ましたが、賠償金は得られませんでした。"
    }),
    termQuestion({
      id: "term-20260713-soc-027", subject: "社会", unit: "大戦景気", tier: "challenge",
      examSkill: "経済変化の因果", formatTag: "複合", mistakeTags: ["因果関係", "経済"],
      paperRef: "社会教科書 pp.206-215／社会ワーク pp.58-63", skills: ["第一次世界大戦", "大戦景気"],
      prompt: "第一次世界大戦中、日本の輸出と工業生産が伸び、大戦景気となった理由として最も適切なものはどれですか。",
      choices: ["ヨーロッパ諸国の生産・輸出が弱まり、日本製品への需要が増えたから", "日本国内の工場がすべて閉鎖されたから", "世界恐慌で輸入品が増えたから", "連合国が日本との貿易を禁止したから"], answer: 0,
      explanation: "ヨーロッパが戦場となって供給が減る一方、アジアなどで日本製品への需要が増えました。"
    }),
    termQuestion({
      id: "term-20260713-soc-028", subject: "社会", unit: "大正デモクラシー", tier: "challenge",
      examSkill: "民本主義", formatTag: "短問", mistakeTags: ["人物", "用語"],
      paperRef: "社会教科書 pp.216-223／社会ワーク pp.64-67", skills: ["吉野作造", "民本主義"],
      prompt: "吉野作造が唱え、政治は民衆の利益と意向を重んじるべきだとした考えはどれですか。",
      choices: ["民本主義", "国粋主義", "重商主義", "絶対主義"], answer: 0,
      explanation: "吉野作造の民本主義は、大正デモクラシーの思想的な支えになりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-029", subject: "社会", unit: "選挙制度", tier: "challenge",
      examSkill: "制度変化の資料読取", formatTag: "資料読取", mistakeTags: ["資料読取", "選挙資格"],
      paperRef: "社会教科書 pp.220-225／社会ワーク pp.66-69", skills: ["普通選挙法", "表の読み取り"],
      figure: {
        kind: "table", title: "衆議院議員選挙の資格の変化", columns: ["時期", "男子の年齢条件", "納税条件", "有権者のおよその規模"],
        rows: [["普通選挙法以前", "25歳以上", "あり", "約300万人"], ["1928年の選挙", "25歳以上", "なし", "約1200万人"]],
        alt: "普通選挙法の前後で年齢、納税条件、有権者規模を比べた表", caption: "女性参政権は、この段階ではまだ実現していない。"
      },
      prompt: "有権者が大きく増えた直接の理由として最も適切なものはどれですか。",
      choices: ["納税額による制限がなくなったから", "選挙年齢が10歳になったから", "女性にも選挙権が認められたから", "議員を天皇が全員任命するようになったから"], answer: 0,
      explanation: "1925年の普通選挙法により納税資格が撤廃され、25歳以上の男子へ選挙権が広がりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-030", subject: "社会", unit: "国際連盟", tier: "challenge",
      examSkill: "国際協調", formatTag: "短問", mistakeTags: ["国際機関", "戦間期"],
      paperRef: "社会教科書 pp.214-221／社会ワーク pp.62-67", skills: ["国際連盟", "ベルサイユ体制"],
      prompt: "第一次世界大戦後、日本が国際連盟で得た地位として正しいものはどれですか。",
      choices: ["常任理事国", "事務局を置かない国", "加盟を禁止された国", "連盟を脱退したアメリカの植民地"], answer: 0,
      explanation: "日本はイギリス、フランス、イタリアとともに国際連盟の常任理事国となりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-031", subject: "社会", unit: "関東大震災", tier: "challenge",
      examSkill: "災害と社会", formatTag: "複合", mistakeTags: ["年代", "社会状況"],
      paperRef: "社会教科書 pp.222-227／社会ワーク pp.66-71", skills: ["関東大震災", "情報"],
      prompt: "1923年の関東大震災後、根拠のない流言によって朝鮮人や中国人などが殺傷された事実から、災害時の行動として最も重要だと考えられるものはどれですか。",
      choices: ["情報源と根拠を確かめ、差別的な流言を広めない", "早い情報なら出所を問わず広める", "特定の集団を一律に疑う", "公的情報をすべて無視する"], answer: 0,
      explanation: "災害時の不確かな情報は深刻な被害につながります。史実を踏まえ、根拠の確認と差別の防止が必要です。"
    }),
    termQuestion({
      id: "term-20260713-soc-032", subject: "社会", unit: "世界恐慌", tier: "challenge",
      examSkill: "ブロック経済の影響", formatTag: "複合", mistakeTags: ["因果関係", "経済"],
      paperRef: "社会教科書 pp.226-233／社会ワーク pp.68-73", skills: ["世界恐慌", "ブロック経済"],
      prompt: "世界恐慌後、植民地を持つ国々が自国と植民地の間の貿易を優先するブロック経済を進めた。この動きが日本に与えた影響として適切なものはどれですか。",
      choices: ["海外市場を確保しにくくなり、軍部が資源と市場を求める動きを強めた", "日本の輸出先が無条件に増えた", "植民地を持たない国だけが自由貿易で有利になった", "日本の政党政治が直ちに安定した"], answer: 0,
      explanation: "市場が囲い込まれる中、日本では不況が深まり、軍部の対外進出論が力を増しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-033", subject: "社会", unit: "満州事変", tier: "challenge",
      examSkill: "満州国と国際調査", formatTag: "複合", mistakeTags: ["因果関係", "国際連盟"],
      paperRef: "社会教科書 pp.230-235／社会ワーク pp.70-73", skills: ["満州国", "リットン調査団"],
      prompt: "満州事変後の日本の行動と国際連盟の対応の組み合わせとして正しいものはどれですか。",
      choices: ["日本が満州国を建国させ、国際連盟はリットン調査団を派遣した", "日本が清を復活させ、国際連盟は即座に解散した", "日本が朝鮮を独立させ、国際連盟は日本を常任理事国にした", "日本が台湾を返還し、国際連盟は調査を拒否した"], answer: 0,
      explanation: "日本は1932年に満州国を建国させました。国際連盟はリットン調査団の報告をもとに審議しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-034", subject: "社会", unit: "国際連盟脱退", tier: "challenge",
      examSkill: "外交の推移", formatTag: "短問", mistakeTags: ["年代", "因果関係"],
      paperRef: "社会教科書 pp.232-237／社会ワーク pp.70-75", skills: ["国際連盟脱退", "満州事変"],
      prompt: "日本が1933年に国際連盟脱退を通告した直接の背景はどれですか。",
      choices: ["満州国を認めない国際連盟の勧告が採択された", "ポーツマス条約で賠償金を得られなかった", "普通選挙法が成立した", "サンフランシスコ平和条約が結ばれた"], answer: 0,
      explanation: "国際連盟総会が満州国を認めない勧告を採択すると、日本代表は退場し脱退を通告しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-035", subject: "社会", unit: "二・二六事件", tier: "challenge",
      examSkill: "事件の主体", formatTag: "短問", mistakeTags: ["事件名", "軍部"],
      paperRef: "社会教科書 pp.234-237／社会ワーク pp.72-75", skills: ["二・二六事件", "軍部"],
      prompt: "1936年、陸軍の青年将校らが政府要人を襲撃した事件はどれですか。",
      choices: ["二・二六事件", "五・四運動", "米騒動", "日比谷焼打ち事件"], answer: 0,
      explanation: "二・二六事件後、軍部の政治への発言力はいっそう強まりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-036", subject: "社会", unit: "国家総動員法", tier: "challenge",
      examSkill: "法律と統制", formatTag: "複合", mistakeTags: ["法律", "戦時体制"],
      paperRef: "社会教科書 pp.236-241／社会ワーク pp.74-77", skills: ["国家総動員法", "統制経済"],
      prompt: "1938年の国家総動員法によって政府が行えるようになったこととして最も適切なものはどれですか。",
      choices: ["議会の個別承認を経ず、物資や労働力を広く戦争へ動員する", "女性を含む普通選挙を直ちに実施する", "すべての軍隊を廃止する", "植民地をすべて独立させる"], answer: 0,
      explanation: "国家総動員法は、政府が人員・物資・産業などを戦争目的に統制する根拠となりました。"
    }),
    termQuestion({
      id: "term-20260713-soc-037", subject: "社会", unit: "戦時下の生活", tier: "challenge",
      examSkill: "配給制度の目的", formatTag: "複合", mistakeTags: ["戦時生活", "因果関係"],
      paperRef: "社会教科書 pp.238-243／社会ワーク pp.74-77", skills: ["配給制", "物資統制"],
      prompt: "戦時下に米や衣料などで配給制がとられた主な理由はどれですか。",
      choices: ["不足する物資を政府が統制し、一定量ずつ行き渡らせるため", "物資が余りすぎて価格を上げるため", "輸入品を自由に選べるようにするため", "選挙権を広げるため"], answer: 0,
      explanation: "戦争で生活物資が不足したため、政府が流通と消費を統制しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-038", subject: "社会", unit: "終戦", tier: "challenge",
      examSkill: "1945年の年代整序", formatTag: "資料読取", mistakeTags: ["年代整序", "終戦過程"],
      paperRef: "社会教科書 pp.242-247／社会ワーク pp.76-79", skills: ["原子爆弾", "ソ連参戦", "終戦"],
      prompt: "1945年8月の出来事を、日本で起きた順に並べたものはどれですか。①長崎への原子爆弾投下 ②広島への原子爆弾投下 ③ソ連の対日参戦",
      choices: ["②→③→①", "①→②→③", "③→①→②", "②→①→③"], answer: 0,
      explanation: "広島への投下は8月6日、ソ連の対日参戦は日本時間9日未明、長崎への投下は9日です。"
    }),
    termQuestion({
      id: "term-20260713-soc-039", subject: "社会", unit: "占領改革", tier: "challenge",
      examSkill: "民主化政策", formatTag: "複合", mistakeTags: ["占領政策", "改革"],
      paperRef: "社会教科書 pp.246-251／社会ワーク pp.78-81", skills: ["GHQ", "民主化"],
      prompt: "連合国軍総司令部（GHQ）の占領下で進められた改革として適切な組み合わせはどれですか。",
      choices: ["女性参政権・財閥解体・農地改革", "徴兵令・地租改正・廃藩置県", "韓国併合・満州国建国・配給制", "鎖国・参勤交代・刀狩"], answer: 0,
      explanation: "占領期には政治・経済・社会の民主化を目指し、女性参政権、財閥解体、農地改革などが進められました。"
    }),
    termQuestion({
      id: "term-20260713-soc-040", subject: "社会", unit: "農地改革", tier: "challenge",
      examSkill: "改革の効果", formatTag: "複合", mistakeTags: ["農地改革", "因果関係"],
      paperRef: "社会教科書 pp.246-251／社会ワーク pp.78-81", skills: ["農地改革", "自作農"],
      prompt: "戦後の農地改革で、小作地を政府が買い上げて耕作者へ安く売り渡した結果として最も適切なものはどれですか。",
      choices: ["自分の土地を耕す自作農が増えた", "大地主への土地集中がさらに進んだ", "農民が土地を所有できなくなった", "農業が法律で禁止された"], answer: 0,
      explanation: "地主制が弱まり、土地を所有して耕作する自作農が増えました。"
    }),
    termQuestion({
      id: "term-20260713-soc-041", subject: "社会", unit: "日本国憲法", tier: "challenge",
      examSkill: "公布と施行", formatTag: "短問", mistakeTags: ["年代", "憲法"],
      paperRef: "社会教科書 pp.248-253／社会ワーク pp.78-81", skills: ["日本国憲法", "年代"],
      prompt: "日本国憲法の公布と施行の組み合わせとして正しいものはどれですか。",
      choices: ["1946年公布・1947年施行", "1945年公布・1945年施行", "1947年公布・1951年施行", "1951年公布・1952年施行"], answer: 0,
      explanation: "日本国憲法は1946年11月3日に公布され、1947年5月3日に施行されました。"
    }),
    termQuestion({
      id: "term-20260713-soc-042", subject: "社会", unit: "講和と独立", tier: "challenge",
      examSkill: "主権回復", formatTag: "複合", mistakeTags: ["条約", "年代"],
      paperRef: "社会教科書 pp.252-257／社会ワーク pp.80-83", skills: ["サンフランシスコ平和条約", "主権回復"],
      prompt: "1951年に調印されたサンフランシスコ平和条約が発効したことで、日本に生じた最も大きな変化はどれですか。",
      choices: ["占領が終わり、主権を回復した", "第一次世界大戦に参戦した", "普通選挙法が成立した", "国際連盟を脱退した"], answer: 0,
      explanation: "条約は1952年に発効し、連合国による占領が終わって日本は主権を回復しました。"
    }),
    termQuestion({
      id: "term-20260713-soc-043", subject: "社会", unit: "朝鮮戦争", tier: "challenge",
      examSkill: "特需と経済", formatTag: "複合", mistakeTags: ["冷戦", "経済"],
      paperRef: "社会教科書 pp.252-257／社会ワーク pp.80-83", skills: ["朝鮮戦争", "特需"],
      prompt: "1950年に始まった朝鮮戦争が日本経済に与えた影響として適切なものはどれですか。",
      choices: ["軍需物資などの特需が生まれ、経済復興が進んだ", "日本の工業生産が法律で停止された", "米の輸入が永久に禁止された", "世界恐慌が初めて始まった"], answer: 0,
      explanation: "在日米軍などからの大量注文で特需が生まれ、日本の生産と景気の回復を後押ししました。"
    }),
    termQuestion({
      id: "term-20260713-soc-044", subject: "社会", unit: "地形図", tier: "challenge",
      examSkill: "等高線間隔と傾斜", formatTag: "資料読取", mistakeTags: ["地形図", "傾斜判断"],
      paperRef: "試験範囲表：地理（地形図の読み取り）", skills: ["等高線", "傾斜"],
      figure: {
        kind: "contour", title: "20m間隔の等高線で表した丘", width: 320, height: 180,
        paths: [
          { d: "M 20 90 C 35 25, 285 25, 300 90 C 285 155, 35 155, 20 90 Z", label: "100m" },
          { d: "M 60 90 C 75 42, 265 42, 280 90 C 265 138, 75 138, 60 90 Z", label: "120m" },
          { d: "M 105 90 C 120 58, 255 58, 270 90 C 255 122, 120 122, 105 90 Z", label: "140m" },
          { d: "M 135 90 C 150 73, 250 73, 264 90 C 250 107, 150 107, 135 90 Z", label: "160m" }
        ],
        points: [{ x: 35, y: 90, label: "西" }, { x: 293, y: 90, label: "東" }],
        labels: [{ x: 150, y: 18, text: "北" }],
        alt: "東側ほど等高線の間隔が狭い丘の等高線図", caption: "等高線の標高差はすべて20m。"
      },
      prompt: "この丘で傾斜が最も急なのはどちら側ですか。",
      choices: ["東側", "西側", "どちらも同じ", "等高線からは判断できない"], answer: 0,
      explanation: "同じ標高差なら、等高線の間隔が狭い場所ほど水平距離が短く、傾斜が急です。図では東側が最も狭くなっています。"
    })
  ];

  const socialFinal = [
    termQuestion({
      id: "term-20260713-soc-045", subject: "社会", unit: "近現代史総合", tier: "final",
      examSkill: "長期年代整序", formatTag: "複合", mistakeTags: ["年代整序", "戦争の混同"],
      paperRef: "社会教科書 pp.186-239／社会ワーク pp.48-75", skills: ["年代整序", "近現代史"],
      prompt: "次の出来事を古い順に並べたものはどれですか。①満州事変 ②日清戦争 ③第一次世界大戦 ④日露戦争",
      choices: ["②→④→③→①", "④→②→①→③", "②→③→④→①", "③→②→④→①"], answer: 0,
      explanation: "日清戦争1894年、日露戦争1904年、第一次世界大戦1914年、満州事変1931年の順です。"
    }),
    termQuestion({
      id: "term-20260713-soc-046", subject: "社会", unit: "条約比較", tier: "final",
      examSkill: "三条約の横断比較", formatTag: "資料読取", mistakeTags: ["条約", "時代の混同"],
      paperRef: "社会教科書 pp.188-201・252-257／社会ワーク pp.48-57・80-83", skills: ["条約", "比較"],
      figure: {
        kind: "table", title: "日本が結んだ三つの講和・平和条約", columns: ["条約", "年", "戦争・状況", "主な結果"],
        rows: [["下関条約", "1895", "日清戦争", "台湾・賠償金など"], ["ポーツマス条約", "1905", "日露戦争", "南樺太・南満州の権益など"], ["サンフランシスコ平和条約", "1951", "第二次世界大戦後", "発効により主権回復"]],
        alt: "三つの条約の年、対応する戦争、主な結果を整理した表", caption: "条約の相手と時代を区別する。"
      },
      prompt: "表を踏まえた説明として正しいものはどれですか。",
      choices: ["三つの条約は、それぞれ異なる戦争・時代の国際関係を反映している", "三つとも清との戦争を終わらせた", "三つとも日本が賠償金を受け取った", "三つとも第二次世界大戦後に結ばれた"], answer: 0,
      explanation: "1895年、1905年、1951年と時代が異なり、対応する戦争や条約の目的・結果も異なります。"
    }),
    termQuestion({
      id: "term-20260713-soc-047", subject: "社会", unit: "参政権", tier: "final",
      examSkill: "制度と統計の関連", formatTag: "資料読取", mistakeTags: ["資料読取", "選挙制度"],
      paperRef: "社会教科書 pp.220-225・246-251／社会ワーク pp.66-69・78-81", skills: ["普通選挙", "女性参政権", "比較"],
      figure: {
        kind: "table", title: "衆議院議員選挙の有権者", columns: ["選挙", "主な資格", "有権者数の概数"],
        rows: [["1928年", "25歳以上の男子", "約1240万人"], ["1946年", "20歳以上の男女", "約3690万人"]],
        alt: "1928年と1946年の選挙資格と有権者数を比較した表", caption: "当時の制度。現在の選挙年齢とは異なる。"
      },
      prompt: "1946年に有権者が大幅に増えた最大の制度上の理由はどれですか。",
      choices: ["女性にも選挙権が認められ、年齢条件も引き下げられた", "納税額の制限が新しく設けられた", "選挙権が軍人だけに限られた", "25歳未満の男女がすべて除かれた"], answer: 0,
      explanation: "戦後、女性参政権が実現し、男女とも20歳以上へ選挙権が広がったことが大きな要因です。"
    }),
    termQuestion({
      id: "term-20260713-soc-048", subject: "社会", unit: "戦時体制", tier: "final",
      examSkill: "生活資料からの推論", formatTag: "複合", mistakeTags: ["資料読取", "戦時生活"],
      paperRef: "社会教科書 pp.236-243／社会ワーク pp.74-77", skills: ["戦時体制", "国民生活"],
      prompt: "ある町の記録に「家庭の金属製品を回収し、衣料は切符と交換し、学生も工場で作業した」とある。この記録が最もよく示すものはどれですか。",
      choices: ["物資と労働力が戦争目的に広く動員された", "自由貿易によって品物が豊富になった", "女性参政権によって選挙運動が盛んになった", "農地改革で自作農が増えた"], answer: 0,
      explanation: "金属回収、衣料切符、学徒動員は、戦時下で生活と労働が統制・動員されたことを示します。"
    }),
    termQuestion({
      id: "term-20260713-soc-049", subject: "社会", unit: "憲法比較", tier: "final",
      examSkill: "主権と権利の比較", formatTag: "資料読取", mistakeTags: ["憲法", "比較"],
      paperRef: "社会教科書 pp.246-253／社会ワーク pp.78-81", skills: ["大日本帝国憲法", "日本国憲法"],
      figure: {
        kind: "table", title: "二つの憲法の比較", columns: ["項目", "大日本帝国憲法", "日本国憲法"],
        rows: [["主権", "天皇", "国民"], ["国民の権利", "法律の範囲内で認める", "基本的人権として保障"], ["天皇", "統治権を持つ", "日本国・国民統合の象徴"]],
        alt: "大日本帝国憲法と日本国憲法の主権、権利、天皇の位置づけを比べた表", caption: "制度上の違いを三つの観点で整理する。"
      },
      prompt: "表から読み取れる日本国憲法の特徴として正しいものはどれですか。",
      choices: ["主権者を国民とし、天皇を象徴と位置づけている", "天皇が統治権のすべてを持つ", "国民の権利を法律で自由に取り消せる", "主権について規定していない"], answer: 0,
      explanation: "日本国憲法は国民主権を定め、天皇を日本国と日本国民統合の象徴としています。"
    }),
    termQuestion({
      id: "term-20260713-soc-050", subject: "社会", unit: "冷戦史", tier: "final",
      examSkill: "国際関係の年代整序", formatTag: "複合", mistakeTags: ["年代整序", "冷戦"],
      paperRef: "社会教科書 pp.250-257／社会ワーク pp.80-83", skills: ["NATO", "朝鮮戦争", "ワルシャワ条約機構"],
      prompt: "次の出来事を古い順に並べたものはどれですか。①朝鮮戦争開始 ②北大西洋条約機構（NATO）成立 ③ワルシャワ条約機構成立 ④サンフランシスコ平和条約調印",
      choices: ["②→①→④→③", "①→②→③→④", "②→④→①→③", "④→②→①→③"], answer: 0,
      explanation: "NATOは1949年、朝鮮戦争は1950年、平和条約調印は1951年、ワルシャワ条約機構は1955年です。"
    }),
    termQuestion({
      id: "term-20260713-soc-051", subject: "社会", unit: "地形図", tier: "final",
      examSkill: "谷と河川方向", formatTag: "資料読取", mistakeTags: ["地形図", "谷の向き"],
      paperRef: "試験範囲表：地理（地形図の読み取り）", skills: ["等高線", "河川", "谷"],
      figure: {
        kind: "contour", title: "谷を横切る20m間隔の等高線", width: 320, height: 180,
        paths: [
          { d: "M 20 145 L 160 105 L 300 145", label: "100m" },
          { d: "M 35 115 L 160 75 L 285 115", label: "120m" },
          { d: "M 50 85 L 160 45 L 270 85", label: "140m" }
        ],
        points: [{ x: 160, y: 18, label: "北" }, { x: 160, y: 165, label: "南" }],
        labels: [{ x: 170, y: 95, text: "川" }],
        alt: "等高線が北向きのV字になり、中央を川が南北に流れる谷の模式図", caption: "等高線のV字の先は北を向く。"
      },
      prompt: "等高線が谷で示すV字の先端は上流側を向きます。この図の川は主にどちらへ流れますか。",
      choices: ["北から南へ", "南から北へ", "東から西へ", "流れる向きは標高と無関係"], answer: 0,
      explanation: "V字の先端が北を向くので北が上流です。水は高い方から低い方へ流れ、南へ向かいます。"
    }),
    termQuestion({
      id: "term-20260713-soc-052", subject: "社会", unit: "地形図", tier: "final",
      examSkill: "経路と傾斜", formatTag: "資料読取", mistakeTags: ["地形図", "経路比較"],
      paperRef: "試験範囲表：地理（地形図の読み取り）", skills: ["等高線", "ルート選択"],
      figure: {
        kind: "contour", title: "丘を上る二つの経路", width: 320, height: 180,
        paths: [
          { d: "M 18 90 C 30 20, 290 20, 302 90 C 290 160, 30 160, 18 90 Z", label: "100m" },
          { d: "M 55 90 C 70 40, 270 40, 282 90 C 270 140, 70 140, 55 90 Z", label: "120m" },
          { d: "M 98 90 C 112 57, 255 57, 268 90 C 255 123, 112 123, 98 90 Z", label: "140m" },
          { d: "M 130 90 C 145 73, 246 73, 258 90 C 246 107, 145 107, 130 90 Z", label: "160m" }
        ],
        points: [{ x: 22, y: 90, label: "P出発" }, { x: 299, y: 90, label: "Q出発" }, { x: 195, y: 90, label: "山頂付近" }],
        labels: [{ x: 70, y: 168, text: "P経路は西側" }, { x: 238, y: 168, text: "Q経路は東側" }],
        alt: "西側のP経路は等高線間隔が広く、東側のQ経路は間隔が狭い丘の模式図", caption: "どちらも100m付近から160m付近へ上る。"
      },
      prompt: "同じ標高差を上るとき、傾斜がより緩やかな経路はどちらですか。",
      choices: ["P経路", "Q経路", "どちらも同じ", "標高差があるため比較できない"], answer: 0,
      explanation: "P経路側は等高線の間隔が広く、同じ標高差をより長い水平距離で上るため緩やかです。"
    }),
    termQuestion({
      id: "term-20260713-soc-053", subject: "社会", unit: "戦後史年表", tier: "final",
      examSkill: "戦後年代整序", formatTag: "複合", mistakeTags: ["年代整序", "公布と施行"],
      paperRef: "社会教科書 pp.246-257／社会ワーク pp.78-83", skills: ["日本国憲法", "朝鮮戦争", "講和"],
      prompt: "次の出来事を古い順に並べたものはどれですか。①サンフランシスコ平和条約調印 ②日本国憲法公布 ③朝鮮戦争開始 ④日本の主権回復",
      choices: ["②→③→①→④", "③→②→④→①", "②→①→③→④", "①→②→③→④"], answer: 0,
      explanation: "憲法公布1946年、朝鮮戦争1950年、条約調印1951年、条約発効による主権回復1952年です。"
    }),
    termQuestion({
      id: "term-20260713-soc-054", subject: "社会", unit: "近代外交総合", tier: "final",
      examSkill: "因果連鎖の説明", formatTag: "複合", mistakeTags: ["因果関係", "時代の混同"],
      paperRef: "社会教科書 pp.188-199／社会ワーク pp.48-55", skills: ["三国干渉", "日英同盟", "日露戦争"],
      prompt: "日清戦争後から日露戦争へ至る日本の外交を説明したものとして最も適切なものはどれですか。",
      choices: ["三国干渉でロシアへの警戒が強まり、日英同盟を結んだ後、朝鮮・満州をめぐって日露戦争に入った", "下関条約でロシアと同盟し、そのまま第一次世界大戦でロシアと戦った", "普通選挙法への反対から日英同盟を結び、米騒動を起こした", "世界恐慌を解決するために三国干渉を行い、清と日露戦争を戦った"], answer: 0,
      explanation: "三国干渉後にロシアの進出が続き、日本はイギリスと同盟してロシアに対抗し、日露戦争へ進みました。"
    })
  ];

  const JP_PASSAGE_LIBRARY = "学校図書館では、貸出冊数を増やそうと、入口に人気の本を並べた。ところが、一か月たっても貸出冊数はほとんど変わらなかった。委員が利用者に尋ねると、「評判がよいことは分かっても、自分に合うか判断できない」という声が多かった。そこで委員は、「10分で読める」「結末を予想しながら読むと面白い」など、読み方の手がかりを書いたカードを添えた。すると、立ち止まってカードを比べる人が増え、貸出冊数も伸びた。この変化を生んだのは、本の数を増やしたことではない。本と読み手を結ぶ判断材料が見えるようになったことである。";
  const JP_PASSAGE_HAIKU_CORE = "【創作俳句】\n春の川　ほどける光　橋の下";
  const JP_PASSAGE_RECORD = "ものづくりの班では、部品が外れるたびに、交換した部品名だけをノートに残していた。だが、次の担当者は、なぜその部品を選んだのか分からず、似た故障を何度も繰り返した。そこで班は、①起きると予想したこと、②実際に起きたこと、③両者の違い、の三点も書くことにした。この記録によって、次の担当者は前の人の考え方をたどれるようになった。さらに、書いた本人も、当然だと思っていた前提に気づけた。ただし、記録さえ読めば同じ方法がいつでも使えるわけではない。材料や気温などの条件を比べ、今回にも当てはまるか判断する必要がある。つまり、よい記録は完成した答えではなく、次に考える人の出発点なのである。";
  const JP_PASSAGE_PROPOSAL = "図書委員会では、「普段読まない分野の本を手に取る人を増やす」ための行事を考えた。A案は、本の題名を隠し、「宇宙の謎」「身近な仕事」のようなテーマだけを書いた袋を昼休みに選んでもらうものだ。B案は、放課後に委員がおすすめの本を紹介し、参加者同士で感想を話すものである。委員長は、準備は45分以内、担当は4人まで、予算は3000円以内という条件を示した。どちらの案にも長所があるため、目的と条件の両方から判断する必要がある。";
  const JP_PROPOSAL_FIGURE = {
    kind: "table", title: "二つの提案の条件", columns: ["案", "準備時間", "担当人数", "予算", "実施時間"],
    rows: [["A案", "40分", "3人", "2500円", "昼休み"], ["B案", "90分", "6人", "1000円", "放課後"]],
    alt: "A案とB案の準備時間、担当人数、予算、実施時間を比較する表",
    caption: "目的だけでなく、委員長が示した条件も確認する。"
  };
  const JP_PASSAGE_FICTION = "文化祭の展示で、美咲は「来場者の意見に合わせて会場図を少しずつ変える」案を出した。健太は、「昼休みの短い時間に、毎回作り直すのは無理だ」と言った。美咲は返す言葉が見つからず、ノートの案を消しかけた。\n放課後、欠席していた凛からノートが戻った。隅には、「全部ではなく、一番多かった意見の場所だけ変えたら？」とあった。美咲は消しかけた線をもう一度囲み、顔を上げた。\n翌日、美咲は健太に言った。「急いで決める必要がある日は、今の図のままでいい。でも、時間がある日は一か所だけ直してみよう。」健太は会場図を見て、うなずいた。";
  const JP_PASSAGE_HAIKU_CHALLENGE = "【創作俳句A】\n夕立や　白線にじむ　校庭に\n\n【創作俳句B】\n雨あがり　白線を越す　青い風";
  const JP_PASSAGE_FINAL = "地図アプリは、目的地までの道を短時間で示してくれる。急いでいるときや、災害で通れる道が限られるとき、その選別は大きな助けになる。道を調べる手間が減れば、周囲の安全を確かめることに注意を向けられる場合もある。毎回、考えられる道を端から調べるのは現実的ではない。\nしかし、アプリが示す「最短」は、一人一人にとっての「最善」と同じではない。夜道なら明るさを優先したい人もいれば、荷物が重い日には坂の少なさを重視する人もいる。アプリの順位は、距離や所要時間など、あらかじめ設定された基準から生まれる。その基準を知らずに先頭の候補だけを選び続けると、自分が何を大切にしているかを考える機会まで減ってしまう。\nこれは道選びだけの問題ではない。図書館の検索画面が貸出回数の多い本を上位に示すとき、人気を知りたい人には役立つが、まだ知られていない分野を探したい人には別の並べ方が必要になる。便利な仕組みの答えは、目的が変われば評価も変わるのである。\nだから、便利な仕組みを捨てる必要はない。まず仕組みが何を基準に候補を並べたかを知り、自分の目的と合わないときだけ候補の外側も確かめればよい。選択肢をむやみに増やすことではなく、任せてよい判断と自分で確かめる判断を区別することが、仕組みを使いこなすことにつながる。";
  const JP_PASSAGE_COMPARE = "文章A：案内図は、町にあるものをすべて描くものではない。徒歩向けなら歩道や階段を目立たせ、防災用なら避難所や危険箇所を示す。省かれた情報があるからこそ、目的に必要な情報を早く探せる。ただし、用途が違えば、同じ省略が欠点にもなる。\n\n文章B：図書委員会は「2年生は図書館利用が最も盛んだ」と報告した。確かに週1回以上利用する割合は2年生が最も高い。しかし、人数で比べると3年生が最も多い。割合と人数のどちらを見るかで、同じ調査から受ける印象は変わる。";
  const JP_COMPARE_FIGURE = {
    kind: "table", title: "学年別の図書館利用", columns: ["学年", "回答者", "週1回以上利用", "割合"],
    rows: [["1年", "80人", "48人", "60%"], ["2年", "50人", "35人", "70%"], ["3年", "100人", "55人", "55%"]],
    alt: "各学年の回答者数、週1回以上利用する人数と割合を示す表",
    caption: "人数と割合を区別して読む。"
  };
  const JP_PASSAGE_HAIKU_FINAL = "【創作俳句A】\n秋暮れや　無人改札　灯のともる\n\n【創作俳句B】\n秋暮れや　改札ぬける　靴の音";
  const JP_KEIGO_FIGURE = {
    kind: "table", title: "校内での二つの報告場面", columns: ["行", "話し手", "聞き手", "話題の人物"],
    rows: [["1", "放送委員の生徒", "来校した作家", "自校の教頭"], ["2", "放送委員の生徒", "自校の教頭", "来校した作家"]],
    alt: "放送委員の生徒が、来校した作家または自校の教頭に、もう一方の人物について報告する二つの場面",
    caption: "聞き手から見て、話題の人物が自分側か相手側かを確かめる。"
  };

  const JAPANESE_READING_UPDATES = {
    "term-20260713-jpn-008": {
      passageId: "jp-library-clues", passage: JP_PASSAGE_LIBRARY,
      paperRef: "国語教科書 pp.16-19（世界への入り口）",
      prompt: "第2文の「ところが」が示す前後の関係として最も適切なものはどれですか。",
      choices: ["前の出来事の後に別の出来事が続いていく時間的な関係", "前の出来事を原因として後の結果が生じる関係", "期待された結果と実際に起きた結果が食い違う関係", "前の抽象的な説明を後の具体例で示していく関係"], answer: 2,
      explanation: "人気の本を並べれば貸出冊数が増えるという期待に対し、実際にはほとんど変わりませんでした。期待と結果の向きが反対なので逆接です。"
    },
    "term-20260713-jpn-009": {
      passageId: "jp-library-clues", passage: JP_PASSAGE_LIBRARY,
      paperRef: "国語教科書 pp.16-19（世界への入り口）",
      prompt: "「この変化」が指す内容として最も適切なものはどれですか。",
      choices: ["入口に並べた人気の本が一か月後に撤去されたこと", "カードを比べて本を選ぶ人が増え、貸出冊数も伸びたこと", "図書館に置く本の種類と冊数を大幅に増やしたこと", "利用者が評判だけを基準に同じ本を選ぶようになったこと"], answer: 1,
      explanation: "指示語の直前にある「カードを比べる人が増えた」と「貸出冊数も伸びた」の二つをまとめて受けています。"
    },
    "term-20260713-jpn-024": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      passageId: "jp-library-clues", passage: JP_PASSAGE_LIBRARY,
      paperRef: "国語教科書 pp.16-19（世界への入り口）",
      prompt: "貸出冊数が伸びた理由を、利用者が抱えていた問題と、カードが果たした働きの両方に触れて、40〜80字で説明しなさい。",
      answerText: ["利用者は本が自分に合うか判断できなかったが、カードが読む時間や楽しみ方という判断材料を示し、借りる本を選びやすくしたから。"],
      responseRubric: {
        minLength: 40, maxLength: 80,
        conceptGroups: [
          { label: "利用者の問題", description: "人気だけでは、本が自分に合うか判断できなかったこと", anyOf: ["自分に合うか", "判断できな", "選べな"] },
          { label: "カードの働き", description: "読む時間や楽しみ方など、本を選ぶ手がかりをカードが示したこと", anyOf: ["判断材料", "読み方の手がかり", "読む時間", "楽しみ方"] },
          { label: "行動の変化", description: "手がかりによって借りる本を選びやすくなったこと", anyOf: ["選びやす", "借りやす", "貸出冊数"] }
        ],
        modelAnswer: "利用者は本が自分に合うか判断できなかったが、カードが読む時間や楽しみ方という判断材料を示し、借りる本を選びやすくしたから。"
      },
      explanation: "因果を説明するには、カードを置いた事実だけでなく、置く前の問題とカードが補った判断材料を結びます。"
    },
    "term-20260713-jpn-021": {
      unit: "俳句", passageId: "jp-haiku-spring", passage: JP_PASSAGE_HAIKU_CORE,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "季語と季節", skills: ["俳句", "季語"], mistakeTags: ["季語", "季節"],
      prompt: "この句の季語と季節の組み合わせはどれですか。",
      choices: ["「光」―夏", "「春の川」―冬", "「春の川」―春", "「橋の下」―秋"], answer: 2,
      explanation: "「春の川」が季語で、季節は春です。単に川ではなく、春の水の明るさや動きを含む表現です。"
    },
    "term-20260713-jpn-022": {
      unit: "俳句", passageId: "jp-haiku-spring", passage: JP_PASSAGE_HAIKU_CORE,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "比喩的表現の効果", formatTag: "読解・記述", skills: ["俳句", "比喩"], mistakeTags: ["表現効果", "根拠不足"],
      prompt: "「ほどける光」から読み取れる情景として最も適切なものはどれですか。",
      choices: ["水面の揺れによって反射する光が細かく動く様子", "橋の下で人が結んだひもをほどいている様子", "日が沈んで川面から光が少しずつ消えていく様子", "冬の川に張った氷が光を受けて割れていく様子"], answer: 0,
      explanation: "「ほどける」は光そのものの形ではなく、水面の揺れで反射が分かれ、変化する様子を比喩的に表しています。"
    },
    "term-20260713-jpn-023": {
      unit: "俳句", passageId: "jp-haiku-spring", passage: JP_PASSAGE_HAIKU_CORE,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "語順と視点", skills: ["俳句", "表現効果"], mistakeTags: ["語順", "視点"],
      prompt: "結びを「橋の下」とした効果として最も適切なものはどれですか。",
      choices: ["季語の働きによって、季節を春から冬へ移す", "川全体から光が見える具体的な場所へ視点を絞る", "橋の材料や形に注目させ、構造を詳しく説明する", "川面に光が届かない暗さだけを最後に強調する"], answer: 1,
      explanation: "上五・中七の広がる情景を、最後に「橋の下」という具体的な場所へ収め、読み手の視点を定めています。"
    },
    "term-20260713-jpn-029": {
      passageId: "jp-record-thinking", passage: JP_PASSAGE_RECORD,
      paperRef: "国語教科書 pp.42-45（提案や主張の聞き方）",
      prompt: "第5文の接続語「さらに」が示す関係として最も適切なものはどれですか。",
      choices: ["前の内容に別の効果を付け加える関係", "前の内容と反対の結果を後に示す関係", "前の内容が生じた原因を後から説明する関係", "前の内容を短く言い換えて結論にする関係"], answer: 0,
      explanation: "前は次の担当者への効果、後は書いた本人への別の効果です。「さらに」は、新しい利点を付け加える働きをしています。"
    },
    "term-20260713-jpn-030": {
      passageId: "jp-record-thinking", passage: JP_PASSAGE_RECORD,
      paperRef: "国語教科書 pp.42-45（提案や主張の聞き方）",
      prompt: "「この記録」が指すものとして最も正確なものはどれですか。",
      choices: ["交換した部品名だけを毎回書き加えていく以前の記録", "故障が起きた回数と交換時刻だけを一覧にした記録", "予想・実際の結果・両者の違いまで書いた記録", "使った材料とその日の気温だけを比べるための記録"], answer: 2,
      explanation: "「そこで班は」の後に列挙された三点をまとめて指しています。一語だけでなく、指示範囲全体を要約します。"
    },
    "term-20260713-jpn-031": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      passageId: "jp-record-thinking", passage: JP_PASSAGE_RECORD,
      paperRef: "国語教科書 pp.42-45（提案や主張の聞き方）",
      prompt: "本文の要旨を、記録の利点と、読み手に必要な判断の両方を含めて、55〜110字で書きなさい。",
      answerText: ["よい記録は、予想と結果の違いを伝えて前の人の考え方をたどらせる一方、読み手が条件を比べ、今回にも使えるか判断するための出発点である。"],
      responseRubric: {
        minLength: 55, maxLength: 110,
        conceptGroups: [
          { label: "記録の利点", description: "予想と結果の違いを残すと、他人が考え方をたどれ、本人も前提に気づけること", anyOf: ["予想と結果", "考え方をたど", "前提に気づ"] },
          { label: "読み手の判断", description: "材料や気温などの条件を比べ、今回にも方法が使えるか判断すること", anyOf: ["条件を比べ", "当てはまるか", "使えるか判断"] },
          { label: "記録の位置づけ", description: "記録はそのまま使う完成品ではなく、次に考える人の出発点であること", anyOf: ["出発点", "完成した答えではない"] }
        ],
        modelAnswer: "よい記録は、予想と結果の違いを伝えて前の人の考え方をたどらせる一方、読み手が条件を比べ、今回にも使えるか判断するための出発点である。"
      },
      explanation: "本文後半の条件まで残すことで、「詳しく記録すればそのまま使える」という誤った要約を避けられます。"
    },
    "term-20260713-jpn-032": {
      unit: "提案や主張", passageId: "jp-library-proposals", passage: JP_PASSAGE_PROPOSAL, figure: JP_PROPOSAL_FIGURE,
      paperRef: "国語教科書 pp.42-45（提案や主張の聞き方）", examSkill: "目的と条件による提案評価", skills: ["提案評価", "条件整理", "資料読取"], mistakeTags: ["目的", "条件の見落とし"],
      prompt: "行事の目的と実施条件の両面から、現状の二案を評価したものとして最も適切なのはどれですか。",
      choices: [
        "B案は感想を話せる点が目的に合い、予算内でもあるので、ほかの条件を直さず実施できる",
        "A案は実施条件を満たすが、本の題名を隠すため、普段読まない分野と出会う機会は作れない",
        "A案は三つの実施条件を満たし、題名ではなくテーマから選ばせる点も目的に合う",
        "B案は担当人数を二人減らせば、準備時間を変えなくても三つの実施条件を満たす"
      ], answer: 2,
      explanation: "A案は準備40分・3人・2500円で全条件内です。テーマだけで選ぶ仕組みも、普段は題名で選ばない分野に触れるきっかけになります。"
    },
    "term-20260713-jpn-044": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      unit: "提案や主張", passageId: "jp-library-proposals", passage: JP_PASSAGE_PROPOSAL, figure: JP_PROPOSAL_FIGURE,
      paperRef: "国語教科書 pp.42-45（提案や主張の聞き方）", examSkill: "提案評価の検証", skills: ["提案評価", "条件整理", "資料読取"], mistakeTags: ["条件の見落とし", "一条件だけの判断"],
      prompt: "「B案は予算内だから、委員長の条件をすべて満たす」という評価が妥当か、表の三つの数値を根拠に45〜100字で説明しなさい。",
      answerText: ["妥当ではない。予算1000円は3000円以内だが、準備90分は上限45分を、担当6人は上限4人を超えているから。"],
      responseRubric: {
        minLength: 45, maxLength: 100,
        conceptGroups: [
          { label: "評価", description: "「すべて満たす」という評価は妥当ではないと結論したこと", anyOf: ["妥当ではない", "条件を満たさない", "現状では採用できない"] },
          { label: "予算の根拠", description: "B案の1000円は上限3000円以内であること", anyOf: ["1000円", "予算内"] },
          { label: "準備時間の根拠", description: "B案の90分は上限45分を超えること", anyOf: ["90分", "45分"] },
          { label: "担当人数の根拠", description: "B案の6人は上限4人を超えること", anyOf: ["6人", "4人"] }
        ],
        modelAnswer: "妥当ではない。予算1000円は3000円以内だが、準備90分は上限45分を、担当6人は上限4人を超えているから。"
      },
      explanation: "評価語だけで終えず、予算・準備時間・担当人数を上限と照合して、どこまで妥当かを説明します。"
    },
    "term-20260713-jpn-033": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      passageId: "jp-fiction-revision", passage: JP_PASSAGE_FICTION,
      paperRef: "国語教科書 pp.34-41（形）",
      prompt: "美咲が「顔を上げた」理由を、凛の助言と美咲の直後の行動を根拠に、45〜100字で説明しなさい。",
      answerText: ["凛の「一番多かった意見の場所だけ変える」という助言から、時間の問題を抑えて案を実現できると気づき、消しかけた線をもう一度囲んだから。"],
      responseRubric: {
        minLength: 45, maxLength: 100,
        conceptGroups: [
          { label: "凛の助言", description: "全部ではなく、一番多かった意見の場所だけ変えるという助言", anyOf: ["一番多かった意見", "一か所", "場所だけ変える"] },
          { label: "美咲の行動", description: "美咲が消しかけた線をもう一度囲んだこと", anyOf: ["もう一度囲", "消しかけた線", "案を囲"] },
          { label: "心情の理由", description: "時間不足を避けながら案を実現できると気づき、前向きになったこと", anyOf: ["実現できる", "時間の問題", "前向き"] }
        ],
        modelAnswer: "凛の「一番多かった意見の場所だけ変える」という助言から、時間の問題を抑えて案を実現できると気づき、消しかけた線をもう一度囲んだから。"
      },
      explanation: "心情語を当てるだけでなく、助言→行動→考え直した内容を因果でつなぎます。"
    },
    "term-20260713-jpn-034": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      unit: "小説読解", passageId: "jp-fiction-revision", passage: JP_PASSAGE_FICTION,
      paperRef: "国語教科書 pp.34-41（形）", examSkill: "譲歩と条件の役割", skills: ["小説", "会話の役割", "人物関係"], mistakeTags: ["会話の役割", "心情"],
      prompt: "美咲の「急いで決める必要がある日は、今の図のままでいい」という発言が、その後の提案を説得的にする働きを、健太の心配との関係に触れて45〜100字で説明しなさい。",
      answerText: ["時間が足りないという健太の心配を認めた上で、時間がある日だけ一か所直すという条件を示し、案を実行可能な形にしている。"],
      responseRubric: {
        minLength: 45, maxLength: 100,
        conceptGroups: [
          { label: "反対意見への対応", description: "時間が足りないという健太の心配を先に認めていること", anyOf: ["健太の心配", "時間が足りない", "心配を認め"] },
          { label: "条件の限定", description: "時間がある日に一か所だけ直すと条件を限ったこと", anyOf: ["時間がある日", "一か所", "条件"] },
          { label: "発言の働き", description: "反対を無視せず、提案を現実に実行できる形にして説得力を高めたこと", anyOf: ["実行可能", "現実的", "説得的"] }
        ],
        modelAnswer: "時間が足りないという健太の心配を認めた上で、時間がある日だけ一か所直すという条件を示し、案を実行可能な形にしている。"
      },
      explanation: "譲歩は自説の取り消しではありません。反対意見を受け止め、提案が成り立つ条件を限定する働きがあります。"
    },
    "term-20260713-jpn-037": {
      examSkill: "来客への依頼表現", skills: ["敬語", "人物関係", "依頼表現"], mistakeTags: ["尊敬語", "動作主体"],
      prompt: "受付を担当する生徒が、来校した作家にその場で待ってもらうとき、最も適切な言い方はどれですか。",
      choices: ["こちらで待っております", "こちらでお待ちします", "こちらでお待ちください", "こちらへ伺ってください"], answer: 2,
      explanation: "待つのは来客である作家なので、相手の動作を高める「お待ちください」を使います。「待っております」「お待ちします」は話し手側の動作です。"
    },
    "term-20260713-jpn-038": {
      examSkill: "外部の相手と身内側の人物", skills: ["敬語", "人物関係", "誤用訂正"], mistakeTags: ["身内敬語", "謙譲語"],
      prompt: "放送委員の生徒が来校した作家に「教頭先生がまもなくいらっしゃいます」と伝えました。最も適切な直し方はどれですか。",
      choices: ["教頭の動作を低めているので、「教頭先生がお見えになります」とするべきだ", "作家を高める必要があるので、「教頭先生を拝見します」とする", "校内の役職名には敬語を付ける決まりなので、そのままでよい", "外部の人に自校の教頭を高めているので、「教頭がまもなく参ります」とする"], answer: 3,
      explanation: "外部の来客に対して自校の教頭は身内側です。役職名に「先生」を付けず、「来る」の謙譲語「参る」で述べます。"
    },
    "term-20260713-jpn-039": {
      figure: JP_KEIGO_FIGURE,
      examSkill: "表の人物関係に応じた尊敬語", skills: ["敬語", "人物関係", "表の読み取り"], mistakeTags: ["表の行", "動作主体"],
      prompt: "表の2行目で、生徒が教頭に、来校した作家が控室で待っていると報告します。最も適切な表現はどれですか。",
      choices: ["作家の佐藤様は控室でずっと待っております", "作家の佐藤様は控室でお待ちになっています", "作家の佐藤様を控室でお待ちします", "作家の佐藤様は控室へ参っています"], answer: 1,
      explanation: "話題の人物は来客の作家なので、その「待つ」を尊敬表現「お待ちになっています」で高めます。表の聞き手と話題の人物を取り違えないことが要点です。"
    },
    "term-20260713-jpn-040": {
      unit: "俳句", passageId: "jp-haiku-rain", passage: JP_PASSAGE_HAIKU_CHALLENGE,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "二句の情景比較", skills: ["俳句", "比較読解"], mistakeTags: ["情景", "時間関係"],
      prompt: "二句の時間の移り変わりを説明したものとして最も適切なのはどれですか。",
      choices: [
        "Aは夕立が過ぎて白線が乾く場面、Bは雨が降り出して風が止まる場面だ",
        "AもBも雨が上がった直後を詠み、視点だけを校庭の内外で変えている",
        "Aは夕立の中で白線がにじむ場面、Bは雨が上がって風が白線を越す場面",
        "Aは夕立を予想して待つ場面、Bは雨上がりを翌朝に振り返る場面"
      ], answer: 2,
      explanation: "Aの「白線にじむ」は雨中の変化、Bの「雨あがり」は雨が過ぎた直後を明示します。動詞と季語を組み合わせて時間を判断します。"
    },
    "term-20260713-jpn-041": {
      unit: "俳句", passageId: "jp-haiku-rain", passage: JP_PASSAGE_HAIKU_CHALLENGE,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "切れ字の効果", skills: ["俳句", "切れ字"], mistakeTags: ["切れ字", "表現効果"],
      prompt: "俳句Aの切れ字「や」の働きとして最も適切なものはどれですか。",
      choices: [
        "「夕立」が「白線」を修飾するようにつなぎ、上五と中七を一続きに読む",
        "雨が降った原因を問いかける疑問を表し、後半に答えを求める",
        "夕立への評価を保留し、後半の「青い風」と同じ時刻だと示す",
        "「夕立」を強く提示して一度間を作り、後の校庭の情景へ視線を移す"
      ], answer: 3,
      explanation: "切れ字「や」は「夕立」を強く印象づけ、そこで意味と調子を切ります。その間の後に、白線がにじむ具体的な景へ移ります。"
    },
    "term-20260713-jpn-042": {
      unit: "俳句", passageId: "jp-haiku-rain", passage: JP_PASSAGE_HAIKU_CHALLENGE,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "表現の対比", formatTag: "読解・記述", skills: ["俳句", "対比"], mistakeTags: ["表現比較", "根拠不足"],
      prompt: "「白線」という同じ語を用いた二句の表現の違いとして、最も適切なものはどれですか。",
      choices: [
        "Aは白線がもとの鮮明さに戻る変化を、Bは白線そのものが風で移動する様子を描く",
        "Aは「にじむ」で境界が曖昧になる変化を、Bは「越す」で境界を横切る動きを描く",
        "Aは白線を夕立の原因として扱い、Bは白線を雨上がりの結果として扱う",
        "Aは白線を遠景として省略し、Bは白線の色や長さを細かく説明する"
      ], answer: 1,
      explanation: "同じ白線でも、Aでは雨により輪郭が変わる対象、Bでは風の動きを感じさせる境界として働きます。「にじむ」「越す」が根拠です。"
    },
    "term-20260713-jpn-050": {
      figure: JP_KEIGO_FIGURE,
      examSkill: "二場面の人物関係と敬語", skills: ["敬語", "人物関係", "表の読み取り"], mistakeTags: ["身内敬語", "尊敬語と謙譲語"],
      prompt: "表の1行目と2行目で、それぞれ聞き手から話題の人物の居場所を尋ねられました。生徒の返答の組み合わせとして最も適切なものはどれですか。",
      choices: [
        "1行目「教頭先生は会議室にいらっしゃいます」／2行目「佐藤さんは控室におります」",
        "1行目「教頭は会議室に伺います」／2行目「佐藤様は控室を拝見します」",
        "1行目「教頭がお見えです」／2行目「佐藤様が参っております」",
        "1行目「教頭は会議室におります」／2行目「佐藤様は控室にいらっしゃいます」"
      ], answer: 3,
      explanation: "1行目は外部の作家に自校の教頭を述べるので「おります」、2行目は教頭に来客の作家を述べるので「いらっしゃいます」です。同じ話し手でも、聞き手と話題の人物の関係で表現が変わります。"
    },
    "term-20260713-jpn-045": {
      passageId: "jp-final-judgment", passage: JP_PASSAGE_FINAL,
      paperRef: "国語教科書 pp.16-19・34-45（読解総合）",
      prompt: "第3段落で図書館の検索画面を例に挙げた働きとして、最も適切なものはどれですか。",
      choices: [
        "人気順の検索は最短経路の検索より正確なので、図書館では基準を確かめなくてよいと示す",
        "検索画面に出る本を増やせば、利用者が選ぶ目的も自然に一つに定まると補足する",
        "道選びと本選びでは基準の働きが異なるため、第2段落までの考えを図書館にはそのまま適用できないと示す",
        "地図アプリだけに当てはまる問題ではなく、仕組みの評価が利用目的で変わることを別の場面から示す"
      ], answer: 3,
      explanation: "地図と本という異なる例に同じ構造を見せることで、「仕組みの答えは目的によって評価が変わる」という考えを一般化しています。"
    },
    "term-20260713-jpn-046": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      passageId: "jp-final-judgment", passage: JP_PASSAGE_FINAL,
      paperRef: "国語教科書 pp.16-19・34-45（読解総合）",
      prompt: "本文全体を、便利な仕組みの利点・問題点・筆者の結論の三点を残して、70〜130字で要約しなさい。",
      answerText: ["便利な仕組みは候補を選ぶ手間を減らして役立つが、その順位の基準が自分の目的と合うとは限らない。基準を知り、必要なときは候補の外も確かめて、任せる判断と自分で行う判断を区別することが大切だ。"],
      responseRubric: {
        minLength: 70, maxLength: 130,
        conceptGroups: [
          { label: "仕組みの利点", description: "候補を絞り、道や本を調べる手間を減らせること", anyOf: ["手間を減ら", "短時間", "助け", "選別"] },
          { label: "問題点", description: "仕組みの順位は設定された基準で決まり、一人一人の目的と合うとは限らないこと", anyOf: ["基準が自分の目的と合", "最短と最善", "目的が変わ", "考える機会"] },
          { label: "筆者の結論", description: "順位の基準を知り、必要なときは候補の外も確かめ、任せる判断と自分で行う判断を区別すること", anyOf: ["基準を知", "候補の外", "判断を区別", "自分で確かめ"] }
        ],
        modelAnswer: "便利な仕組みは候補を選ぶ手間を減らして役立つが、その順位の基準が自分の目的と合うとは限らない。基準を知り、必要なときは候補の外も確かめて、任せる判断と自分で行う判断を区別することが大切だ。"
      },
      explanation: "具体例を並べるのではなく、利点を認める部分、基準と目的のずれ、最後の判断方法を抽象化してつなぎます。"
    },
    "term-20260713-jpn-047": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      passageId: "jp-final-judgment", passage: JP_PASSAGE_FINAL,
      paperRef: "国語教科書 pp.16-19・34-45（読解総合）",
      prompt: "坂の少ない道を選びたい人に、アプリが急な最短経路を示しました。本文の考えに従うならどう判断するか、アプリの利点も否定せず55〜110字で説明しなさい。",
      answerText: ["まずアプリで候補を絞る利点は生かすが、最短という基準は坂の少なさという自分の目的とずれるので、ほかの候補や候補外の道も確かめて選ぶ。"],
      responseRubric: {
        minLength: 55, maxLength: 110,
        conceptGroups: [
          { label: "利点の活用", description: "アプリを捨てず、まず候補を絞って手間を減らす利点は使うこと", anyOf: ["候補を絞", "アプリを使", "利点は生か", "手間を減ら"] },
          { label: "目的とのずれ", description: "アプリの「最短」という基準は、自分の「坂が少ない」という目的とずれること", anyOf: ["坂の少な", "自分の目的", "最短という基準", "基準がずれ"] },
          { label: "判断の行動", description: "別の候補や候補の外の道も比較・確認して選ぶこと", anyOf: ["ほかの候補", "候補外", "確かめて選", "比較して選"] }
        ],
        modelAnswer: "まずアプリで候補を絞る利点は生かすが、最短という基準は坂の少なさという自分の目的とずれるので、ほかの候補や候補外の道も確かめて選ぶ。"
      },
      explanation: "本文の主張を新しい場面に当てはめ、仕組みを捨てるのでも従うだけでもない判断を書きます。"
    },
    "term-20260713-jpn-054": {
      type: "input", answerMode: "rubric-input", formatTag: "読解・記述",
      passageId: "jp-final-judgment", passage: JP_PASSAGE_FINAL,
      paperRef: "国語教科書 pp.16-19・34-45（読解総合）",
      prompt: "第1段落で地図アプリの利点を認めていることが、後の主張にどんな働きをしているか、45〜90字で説明しなさい。",
      answerText: ["先に手間を減らす利点を認めることで、仕組みの全面否定ではないと示し、基準と自分の目的を確かめて使うべきだという後の主張を明確にしている。"],
      responseRubric: {
        minLength: 45, maxLength: 90,
        conceptGroups: [
          { label: "認めた利点", description: "地図アプリが候補を短時間で絞り、調べる手間を減らす利点を先に認めたこと", anyOf: ["手間を減ら", "短時間", "助け", "利点"] },
          { label: "全面否定との区別", description: "後の議論は便利な仕組みを捨てるための全面否定ではないと示すこと", anyOf: ["全面否定ではない", "捨てるのではない", "利用をやめるのではない"] },
          { label: "後の主張", description: "仕組みの基準と自分の目的を照合し、任せる判断と自分で確かめる判断を区別すべきだとつなげたこと", anyOf: ["基準と自分の目的", "確かめて使", "判断を区別"] }
        ],
        modelAnswer: "先に手間を減らす利点を認めることで、仕組みの全面否定ではないと示し、基準と自分の目的を確かめて使うべきだという後の主張を明確にしている。"
      },
      explanation: "譲歩の内容と、その後に限定される主張を結びます。「説得力が増す」だけで終えず、何を誤解させないかまで書きます。"
    },
    "term-20260713-jpn-048": {
      passageId: "jp-source-comparison", passage: JP_PASSAGE_COMPARE, figure: JP_COMPARE_FIGURE,
      paperRef: "国語教科書 pp.42-45（提案や主張の聞き方）",
      prompt: "文章Aと文章Bに共通する考えはどれですか。",
      choices: [
        "資料に省略がある場合は用途との関係を考えず、情報量の多い別資料に置き換える方がよい",
        "資料の見え方は、選ばれた情報や比較基準で変わるため、利用目的と条件を確かめる必要がある",
        "文章Aは利用目的を、文章Bは回答者数だけを問題にしており、共通する読み方は示していない",
        "割合を示す資料は案内図より客観的なので、比較基準を示さなくても同じ結論に読める"
      ], answer: 1,
      explanation: "Aは目的に応じた情報の選択、Bは人数と割合という比較基準を扱います。異なる資料でも、何を選んで示したかが見え方を左右します。"
    },
    "term-20260713-jpn-053": {
      passageId: "jp-source-comparison", passage: JP_PASSAGE_COMPARE, figure: JP_COMPARE_FIGURE,
      paperRef: "国語教科書 pp.42-45（提案や主張の聞き方）",
      prompt: "文章Bの報告「2年生は図書館利用が最も盛んだ」を表と照合して評価したものとして、最も適切なのはどれですか。",
      choices: [
        "2年の35人は三学年で最多なので、割合を確認しなくても報告は十分に支えられる",
        "3年は55人と最多なので、2年の70％という割合を学年比較に用いるのは適切でない",
        "回答者数が異なるため、人数と割合のどちらを基準にしても三学年を比較することはできないといえる",
        "「盛ん」を利用割合の高さとするなら支えられるが、利用者数では3年が上なので基準を明示すべきだ"
      ], answer: 3,
      explanation: "表では割合は2年の70％、人数は3年の55人が最大です。文章Bの主張が成り立つ範囲を、表の二つの指標から限定します。"
    },
    "term-20260713-jpn-051": {
      unit: "俳句", passageId: "jp-haiku-station", passage: JP_PASSAGE_HAIKU_FINAL,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "二句の焦点比較", skills: ["俳句", "比較読解"], mistakeTags: ["焦点", "表現比較"],
      prompt: "共通する上五に続く情景の違いとして、最も適切なものはどれですか。",
      choices: [
        "Aは灯が消えて人が改札に集まる様子を、Bは靴の音が止んで無人になる様子を描く",
        "Aは視覚を中心に無人の静けさを描き、Bは靴音という聴覚を通して人の動きを描く",
        "Aは改札を抜ける人物の動きを、Bは無人改札に灯がともる静かな変化を描く",
        "AもBも人物を直接描き、違いは灯と靴の色だけに置かれている"
      ], answer: 1,
      explanation: "Aの「無人」「灯のともる」は静かな視覚像、Bの「ぬける」「靴の音」は移動と音を示します。対比を語句から説明します。"
    },
    "term-20260713-jpn-052": {
      unit: "俳句", passageId: "jp-haiku-station", passage: JP_PASSAGE_HAIKU_FINAL,
      paperRef: "国語教科書 pp.20-28（俳句）", examSkill: "主題に合う推敲", skills: ["俳句", "推敲"], mistakeTags: ["主題", "表現効果"],
      prompt: "俳句Bで、人物を「人」と書かず結びを「靴の音」とした効果として、最も適切なものはどれですか。",
      choices: [
        "姿を省き足音だけ示すことで、移動より靴の持ち主の人物像を中心に想像させる",
        "結びを音にすることで、足音が消えた後の無人の静けさだけを強く印象づける",
        "改札を通る人物の姿よりも、秋の駅に響く足音とその移動を読み手に意識させる",
        "通る一人を特定しないことで、駅を行き交う大勢の人のにぎわいへ想像を広げる"
      ], answer: 2,
      explanation: "「改札ぬける」と「靴の音」を結ぶと、人物の経歴や人数ではなく、駅に響く音と改札を通過する動きが前景化します。他の選択肢も音の効果に触れますが、句にない人物像・消音後・大勢の人まで補っています。"
    }
  };

  [...japaneseCore, ...japaneseChallenge, ...japaneseFinal].forEach((question) => {
    const update = JAPANESE_READING_UPDATES[question.id];
    if (update) Object.assign(question, update);
    if (question.answerMode === "rubric-input") {
      delete question.choices;
      delete question.answer;
      delete question.placeholder;
    }
  });

  const questions = [
    ...japaneseCore,
    ...japaneseChallenge,
    ...japaneseFinal,
    ...socialCore,
    ...socialChallenge,
    ...socialFinal
  ];

  function assertCount(label, rows, expected) {
    if (rows.length !== expected) {
      throw new Error(`${PACK_ID} ${label}: expected ${expected}, got ${rows.length}`);
    }
  }

  assertCount("国語 core", japaneseCore, 24);
  assertCount("国語 challenge", japaneseChallenge, 20);
  assertCount("国語 final", japaneseFinal, 10);
  assertCount("社会 core", socialCore, 24);
  assertCount("社会 challenge", socialChallenge, 20);
  assertCount("社会 final", socialFinal, 10);
  assertCount("humanities total", questions, 108);

  const ids = new Set();
  const allowedTiers = new Set(["core", "challenge", "final"]);
  const allowedSubjects = new Set(["国語", "社会"]);
  const allowedDifficulties = new Set([L1, L2, L3, L4]);
  const allowedFormats = new Set(["短問", "資料読取", "読解・記述", "複合", "直接入力", "ミス発見"]);
  questions.forEach((question) => {
    const required = ["id", "subject", "unit", "priority", "stage", "difficulty", "examSkill", "formatTag", "sourceTag", "qualityStatus", "contentStatus", "packId", "tier", "paperRef", "prompt", "explanation"];
    required.forEach((field) => {
      if (!question[field]) throw new Error(`${question.id || "unknown"}: missing ${field}`);
    });
    if (ids.has(question.id)) throw new Error(`${PACK_ID}: duplicate id ${question.id}`);
    ids.add(question.id);
    if (!allowedTiers.has(question.tier)) throw new Error(`${question.id}: invalid tier`);
    if (!allowedSubjects.has(question.subject)) throw new Error(`${question.id}: invalid subject`);
    if (!allowedDifficulties.has(question.difficulty)) throw new Error(`${question.id}: invalid difficulty`);
    if (!allowedFormats.has(question.formatTag)) throw new Error(`${question.id}: invalid formatTag`);
    if (!Array.isArray(question.childIds) || !question.childIds.includes("child-1")) throw new Error(`${question.id}: invalid childIds`);
    if (!Array.isArray(question.skills) || !question.skills.length) throw new Error(`${question.id}: missing skills`);
    if (!Array.isArray(question.mistakeTags) || !question.mistakeTags.length) throw new Error(`${question.id}: missing mistakeTags`);
    if (question.type === "input") {
      if (!Array.isArray(question.answerText) || !question.answerText.length) throw new Error(`${question.id}: missing answerText`);
    } else if (!Array.isArray(question.choices) || !Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.choices.length) {
      throw new Error(`${question.id}: invalid choices/answer`);
    }
  });

  window.QUIZ_QUESTIONS = (window.QUIZ_QUESTIONS || []).concat(questions);
})();
