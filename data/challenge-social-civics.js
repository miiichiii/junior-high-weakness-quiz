(function () {
  "use strict";

  const unitSpecs = [];

  function registerUnit(spec) {
    const tiers = [
      ["core", spec.core],
      ["challenge", spec.challenge],
      ["final", spec.final]
    ];
    const questions = [];
    let index = 1;
    tiers.forEach(([tier, items]) => {
      items.forEach((item) => {
        const isInput = tier === "final";
        const difficulty = tier === "core" ? "L1 基礎復帰" : "L2 県立標準";
        const rightPageFacts = new Set(spec.rightPageFacts || []);
        const citedPages = item.page
          ? [item.page]
          : [...new Set(item.facts.map((factId) => rightPageFacts.has(factId) ? spec.firstPage + 1 : spec.firstPage))].sort();
        const question = {
          id: `challenge-${spec.id}-${String(index).padStart(3, "0")}`,
          tier,
          type: isInput ? "input" : "choice",
          childIds: ["child-1"],
          packId: "challenge-social-civics",
          cornerId: spec.id,
          unitId: spec.id,
          subject: "社会",
          unit: spec.title,
          sourceTag: "challenge-social-civics-original",
          qualityStatus: "independently-reviewed",
          contentStatus: "content-final",
          priority: tier === "core" ? "S" : "A",
          difficulty,
          stage: isInput ? "直接入力" : (tier === "core" ? "基本語句" : "資料・判断"),
          formatTag: isInput ? "直接入力" : (item.figure ? "図解読取" : (tier === "core" ? "短問" : "因果・比較")),
          examSkill: item.skill,
          mistakeTags: [item.tag, item.confusion || "制度・用語の混同"],
          paperRef: `Challenge社会「5科のポイントチェック」${citedPages.map((page) => `p.${page}`).join("・")}`,
          sourceFactIds: item.facts,
          retrievalDirection: item.direction,
          explanation: item.explanation,
          variantGroup: `${spec.id}-${item.facts[0]}`,
          prompt: item.prompt
        };
        if (isInput) {
          question.answerTarget = "civics-term";
          question.answerText = item.answers;
          question.placeholder = "用語を入力";
        } else {
          const shift = (index - 1) % 4;
          question.choices = item.choices.slice(shift).concat(item.choices.slice(0, shift));
          question.answer = (item.answer - shift + 4) % 4;
          if (item.figure) question.figure = item.figure;
        }
        questions.push(question);
        index += 1;
      });
    });
    window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
    window.QUIZ_QUESTIONS.push(...questions);
  }

  const civ22Phenomena = {
    kind: "table",
    alt: "現代社会の変化と具体例を対応させたオリジナル表",
    caption: "現代社会の三つの変化を整理したオリジナル表",
    columns: ["変化", "具体例"],
    rows: [["A", "人・商品・資本・情報が国境を越える"], ["B", "大量の情報を受信・発信する"], ["C", "年少人口が減り、高齢人口の割合が高まる"]]
  };
  const civ22Rule = {
    kind: "diagram", width: 360, height: 190,
    alt: "意見の違いから合意をつくり、ルールを決めて見直す流れのオリジナル図",
    caption: "集団でルールをつくる過程を示したオリジナル図",
    nodes: [{id:"a",x:10,y:65,width:88,height:48,label:"意見の違い"},{id:"b",x:136,y:65,width:88,height:48,label:"話し合い"},{id:"c",x:262,y:65,width:88,height:48,label:"合意・ルール",emphasis:true}],
    edges: [{from:"a",to:"b",label:"調整"},{from:"b",to:"c",label:"効率と公正"}]
  };
  const civ22Population = {
    kind: "table",
    alt: "二つの地域の年少人口と高齢人口の割合を比較する架空資料",
    caption: "人口構成を比較するための架空データ",
    columns: ["地域", "年少人口", "高齢人口"],
    rows: [["X", "24%", "12%"], ["Y", "11%", "31%"]]
  };
  unitSpecs.push({
    id: "civ-22", title: "わたしたちの生活と現代社会", firstPage: 44,
    rightPageFacts: ["civ-22-f04","civ-22-f05","civ-22-f06","civ-22-f07","civ-22-f08","civ-22-f09"],
    core: [
      {prompt:"人・もの・お金・情報が国境を越えて移動し、世界の結びつきが強まることを何といいますか。",choices:["グローバル化","少子高齢化","地方分権","規制緩和"],answer:0,facts:["civ-22-f01"],direction:"definition-to-term",skill:"現代社会の特色",tag:"グローバル化",explanation:"国境を越える人・商品・資本・情報の移動が活発になり、世界の一体化が進むことをグローバル化といいます。"},
      {prompt:"各国が得意な商品を生産し、貿易で補い合うことを何といいますか。",choices:["国際分業","地方自治","三権分立","直接請求"],answer:0,facts:["civ-22-f02"],direction:"description-to-term",skill:"国際分業",tag:"国際分業",explanation:"国ごとの条件を生かして生産を分担し、貿易で補い合う仕組みが国際分業です。"},
      {prompt:"大量の情報から必要で信頼できるものを選び、適切に使う力はどれですか。",choices:["情報リテラシー","国際分業","社会保障","住民自治"],answer:0,facts:["civ-22-f03"],direction:"ability-to-term",skill:"情報活用",tag:"情報リテラシー",explanation:"情報の発信元や根拠を確かめ、選択して使う力を情報リテラシーといいます。"},
      {prompt:"子どもの数が減る一方、高齢者の割合が高まる人口変化はどれですか。",choices:["少子高齢化","都市化","情報化","国際化"],answer:0,facts:["civ-22-f04"],direction:"description-to-term",skill:"人口問題",tag:"少子高齢化",explanation:"出生数の減少と平均寿命の伸びなどにより、少子化と高齢化が同時に進む状態を少子高齢化といいます。"},
      {prompt:"言語、宗教、生活様式、芸術など、人々が社会の中で受け継ぐものをまとめて何といいますか。",choices:["文化","主権","財政","世論"],answer:0,facts:["civ-22-f05"],direction:"examples-to-term",skill:"文化の理解",tag:"文化",explanation:"社会の中で共有・継承される言語、宗教、習慣、芸術などを文化といいます。"},
      {prompt:"家族、学校、地域など、人が所属し互いに関係をもつまとまりを何といいますか。",choices:["社会集団","主権国家","地方議会","株式会社"],answer:0,facts:["civ-22-f06"],direction:"definition-to-term",skill:"個人と社会",tag:"社会集団",explanation:"共通の目的や関係をもつ人々のまとまりを社会集団といいます。家族や学校もその例です。"},
      {prompt:"個人が社会のルールや行動の仕方を身につけていくことを何といいますか。",choices:["社会化","国際化","情報化","機械化"],answer:0,facts:["civ-22-f07"],direction:"definition-to-term",skill:"個人と社会",tag:"社会化",explanation:"家庭や学校などを通じ、社会の一員として必要な行動や価値観を身につけることを社会化といいます。"},
      {prompt:"意見の違う人々が話し合い、納得できる結論をつくることはどれですか。",choices:["合意形成","司法審査","企業統合","金融政策"],answer:0,facts:["civ-22-f08"],direction:"process-to-term",skill:"合意形成",tag:"合意形成",explanation:"対立する意見を調整し、合意できる結論をつくることを合意形成といいます。"}
    ],
    challenge: [
      {prompt:"表のA・B・Cの組み合わせとして正しいものはどれですか。",choices:["Aグローバル化・B情報化・C少子高齢化","A情報化・B少子高齢化・Cグローバル化","A少子高齢化・Bグローバル化・C情報化","A地方分権・B国際分業・C都市化"],answer:0,facts:["civ-22-f01","civ-22-f03","civ-22-f04"],direction:"table-to-phenomena",skill:"資料分類",tag:"現代社会の特色",explanation:"国境を越える動きはグローバル化、大量の情報は情報化、子どもの減少と高齢者割合の上昇は少子高齢化です。",figure:civ22Phenomena},
      {prompt:"地域Yについて資料から直接読み取れることはどれですか。",choices:["Xより高齢人口の割合が高い","Xより年少人口の割合が高い","人口総数がXより必ず多い","出生数が今後必ず増える"],answer:0,facts:["civ-22-f04"],direction:"table-to-inference",skill:"人口資料読取",tag:"少子高齢化",explanation:"割合の表から、YはXより高齢人口割合が高く年少人口割合が低いと読めます。人口総数や将来の出生数までは断定できません。",figure:civ22Population},
      {prompt:"図の話し合いで、効率だけでなく公正も考える理由として最も適切なものはどれですか。",choices:["少数の立場や負担の偏りも検討するため","結論を一人で早く決めるため","多数意見を必ず退けるため","ルールを一度も見直さないため"],answer:0,facts:["civ-22-f08","civ-22-f09"],direction:"diagram-to-reason",skill:"効率と公正",tag:"効率と公正",explanation:"効率は時間や費用の無駄を減らす視点、公正は権利・負担・機会の偏りがないかを見る視点です。両方を考えて合意をつくります。",figure:civ22Rule},
      {prompt:"海外の工場で部品を生産し、日本で組み立てて各国へ販売する企業の動きに最も関係するものはどれですか。",choices:["グローバル化と国際分業","少子化と地方自治","三審制と裁判員制度","財政と社会保障"],answer:0,facts:["civ-22-f01","civ-22-f02"],direction:"case-to-concepts",skill:"事例判断",tag:"国際分業",explanation:"国境を越えて生産工程を分担するため、グローバル化と国際分業の具体例です。"},
      {prompt:"SNSで災害情報を見たときの行動として、情報リテラシーを最もよく示すものはどれですか。",choices:["自治体など複数の発信元を確かめてから共有する","見出しだけで直ちに全員へ転送する","発信者不明でも拡散数だけで信じる","自分と違う意見をすべて削除する"],answer:0,facts:["civ-22-f03"],direction:"case-to-information-literacy",skill:"情報判断",tag:"情報リテラシー",explanation:"情報の出所・日時・根拠を複数確認し、個人情報にも配慮して扱うことが重要です。"},
      {prompt:"少子高齢化が社会に与える影響として最も適切なものはどれですか。",choices:["働く世代の減少や社会保障を支える負担が課題になる","高齢者がいなくなる","年少人口の割合が必ず上がる","国際分業が禁止される"],answer:0,facts:["civ-22-f04"],direction:"phenomenon-to-impact",skill:"因果関係",tag:"少子高齢化",explanation:"働く世代の減少と高齢者割合の上昇により、労働力や社会保障の支え方が課題になります。"},
      {prompt:"外国の文化を取り入れつつ地域の伝統行事も受け継ぐ姿勢として適切なものはどれですか。",choices:["文化の多様性を尊重し、相互に理解する","自分と異なる文化を一律に排除する","伝統文化を変化させてはならない","一つの文化だけを全員に強制する"],answer:0,facts:["civ-22-f05"],direction:"case-to-cultural-diversity",skill:"多文化共生",tag:"文化の多様性",explanation:"グローバル化した社会では、異なる文化を尊重しながら自分たちの文化も継承する視点が大切です。"},
      {prompt:"学校のルールを見直す手順として最も適切なものはどれですか。",choices:["目的を確認し、関係者の意見と負担を比べ、合意後も検証する","最初の案を話し合わず永久に固定する","声の大きい一人だけで決める","効率も公正も考えない"],answer:0,facts:["civ-22-f08","civ-22-f09"],direction:"case-to-consensus-process",skill:"合意形成",tag:"合意形成",explanation:"ルールは目的、効率、公正を検討して合意し、結果を見て必要なら見直します。"}
    ],
    final: [
      {prompt:"人・もの・資本・情報が国境を越えて移動し、世界の結びつきが強まることを答えてください。",answers:["グローバル化"],facts:["civ-22-f01"],direction:"direct-definition-to-term",skill:"現代社会の特色",tag:"グローバル化",explanation:"世界の一体化が進む動きをグローバル化といいます。"},
      {prompt:"各国が得意な生産を分担し、貿易で補い合う仕組みを答えてください。",answers:["国際分業"],facts:["civ-22-f02"],direction:"direct-definition-to-term",skill:"国際分業",tag:"国際分業",explanation:"生産を国ごとに分担することを国際分業といいます。"},
      {prompt:"情報の出所や根拠を確かめ、必要な情報を選んで使う力を答えてください。",answers:["情報リテラシー","メディアリテラシー"],facts:["civ-22-f03"],direction:"direct-ability-to-term",skill:"情報活用",tag:"情報リテラシー",explanation:"情報を批判的に読み取り活用する力が情報リテラシーです。"},
      {prompt:"出生数が減り、高齢者の割合が高まる人口変化を答えてください。",answers:["少子高齢化"],facts:["civ-22-f04"],direction:"direct-description-to-term",skill:"人口問題",tag:"少子高齢化",explanation:"少子化と高齢化が同時に進む状態を少子高齢化といいます。"},
      {prompt:"言語、宗教、習慣、芸術など、社会で共有・継承されるものを答えてください。",answers:["文化"],facts:["civ-22-f05"],direction:"direct-examples-to-term",skill:"文化の理解",tag:"文化",explanation:"人々が受け継いでいく生活様式や価値を文化といいます。"},
      {prompt:"家庭や学校を通じ、社会の一員として必要な行動や価値観を身につけることを答えてください。",answers:["社会化"],facts:["civ-22-f07"],direction:"direct-definition-to-term",skill:"個人と社会",tag:"社会化",explanation:"個人が社会の一員となる過程を社会化といいます。"},
      {prompt:"家族や学校など、共通の関係や目的をもつ人々のまとまりを答えてください。",answers:["社会集団"],facts:["civ-22-f06"],direction:"direct-definition-to-term",skill:"個人と社会",tag:"社会集団",explanation:"人々のまとまりを社会集団といいます。"},
      {prompt:"異なる意見を話し合いで調整し、納得できる結論をつくることを答えてください。",answers:["合意形成"],facts:["civ-22-f08"],direction:"direct-process-to-term",skill:"合意形成",tag:"合意形成",explanation:"対立する意見を調整して合意をつくる過程が合意形成です。"}
    ]
  });

  const civ23Principles = {
    kind:"diagram",width:360,height:195,
    alt:"日本国憲法の三原則を並べたオリジナル図",
    caption:"日本国憲法の三原則を示すオリジナル図",
    nodes:[{id:"a",x:12,y:68,width:96,height:52,label:"国民主権"},{id:"b",x:132,y:68,width:96,height:52,label:"基本的人権\nの尊重",emphasis:true},{id:"c",x:252,y:68,width:96,height:52,label:"平和主義"}],edges:[]
  };
  const civ23Amendment = {
    kind:"diagram",width:360,height:195,
    alt:"憲法改正の発議、国民投票、公布の順を示すオリジナル図",
    caption:"憲法改正手続の流れを示すオリジナル図",
    nodes:[{id:"a",x:8,y:66,width:98,height:52,label:"国会が発議"},{id:"b",x:131,y:66,width:98,height:52,label:"国民投票"},{id:"c",x:254,y:66,width:98,height:52,label:"天皇が公布",emphasis:true}],edges:[{from:"a",to:"b",label:"各議院2/3以上"},{from:"b",to:"c",label:"過半数"}]
  };
  const civ23Rights = {
    kind:"table",
    alt:"人権の分類と具体例を対応させたオリジナル表",
    caption:"基本的人権の分類を整理したオリジナル表",
    columns:["分類","具体例"],rows:[["A","思想・良心、信教、表現の自由"],["B","教育を受ける権利、勤労の権利"],["C","法の下の平等"]]
  };
  unitSpecs.push({
    id:"civ-23",title:"日本国憲法と基本的人権",firstPage:46,
    rightPageFacts:["civ-23-f04","civ-23-f07","civ-23-f08","civ-23-f09","civ-23-f10","civ-23-f12","civ-23-f13","civ-23-f17"],
    core:[
      {prompt:"日本国憲法の三原則に含まれないものはどれですか。",choices:["国民主権","基本的人権の尊重","平和主義","天皇主権"],answer:3,facts:["civ-23-f01"],direction:"principles-to-exception",skill:"憲法三原則",tag:"日本国憲法",explanation:"日本国憲法の三原則は国民主権、基本的人権の尊重、平和主義です。"},
      {prompt:"国の政治のあり方を最終的に決める権力を国民がもつ原則はどれですか。",choices:["国民主権","法の支配","地方自治","議院内閣制"],answer:0,facts:["civ-23-f02"],direction:"definition-to-principle",skill:"国民主権",tag:"国民主権",explanation:"主権が国民にあるという原則を国民主権といいます。"},
      {prompt:"日本国憲法が国の法の中で最も強い効力をもつことを表す言葉はどれですか。",choices:["最高法規","条例","政令","国際慣習"],answer:0,facts:["civ-23-f03"],direction:"status-to-term",skill:"憲法の地位",tag:"最高法規",explanation:"憲法は国の最高法規であり、憲法に反する法律や命令は効力をもちません。"},
      {prompt:"人が生まれながらにもつ、侵すことのできない権利はどれですか。",choices:["基本的人権","参政権だけ","請求権だけ","所有権だけ"],answer:0,facts:["civ-23-f04"],direction:"definition-to-term",skill:"基本的人権",tag:"基本的人権",explanation:"基本的人権は人が生まれながらにもつ永久不可侵の権利として保障されます。"},
      {prompt:"日本国憲法のもとで、天皇の地位として正しいものはどれですか。",choices:["日本国と日本国民統合の象徴","政治の最終決定者","国会の議長","裁判所の長"],answer:0,facts:["civ-23-f05"],direction:"institution-to-role",skill:"象徴天皇制",tag:"天皇の地位",explanation:"天皇は日本国と日本国民統合の象徴で、国政に関する権能をもちません。"},
      {prompt:"戦争を放棄し、戦力を保持せず、交戦権を認めない考えに関係する原則はどれですか。",choices:["平和主義","国際分業","地方分権","市場経済"],answer:0,facts:["civ-23-f06"],direction:"article-to-principle",skill:"平和主義",tag:"平和主義",explanation:"憲法第9条は戦争放棄、戦力不保持、交戦権否認を定め、平和主義の柱となっています。"},
      {prompt:"健康で文化的な最低限度の生活を営む権利はどれですか。",choices:["生存権","選挙権","財産権","請願権"],answer:0,facts:["civ-23-f07"],direction:"description-to-right",skill:"社会権",tag:"生存権",explanation:"生存権は社会権の一つで、憲法第25条に定められています。"},
      {prompt:"人種、信条、性別、社会的身分などによる差別を禁じる原則はどれですか。",choices:["法の下の平等","表現の自由","勤労の義務","国事行為"],answer:0,facts:["civ-23-f08"],direction:"description-to-right",skill:"平等権",tag:"法の下の平等",explanation:"憲法第14条はすべて国民が法の下に平等であることを定めています。"}
    ],
    challenge:[
      {prompt:"図の三原則のうち、選挙を通して政治に意思を反映させることと最も直接関係するものはどれですか。",choices:["国民主権","基本的人権の尊重","平和主義","地方分権"],answer:0,facts:["civ-23-f01","civ-23-f02"],direction:"diagram-to-principle",skill:"憲法原則の適用",tag:"国民主権",explanation:"選挙や国民投票によって国民が政治のあり方を決めることは国民主権の具体化です。",figure:civ23Principles},
      {prompt:"人権分類表のA・B・Cの組み合わせとして正しいものはどれですか。",choices:["A自由権・B社会権・C平等権","A社会権・B自由権・C参政権","A平等権・B請求権・C自由権","A参政権・B平等権・C社会権"],answer:0,facts:["civ-23-f08","civ-23-f09","civ-23-f10"],direction:"table-to-rights-classification",skill:"人権分類",tag:"基本的人権",explanation:"国家から不当に干渉されないのが自由権、社会的に人間らしく生きるのが社会権、差別されないのが平等権です。",figure:civ23Rights},
      {prompt:"図の憲法改正手続について正しい説明はどれですか。",choices:["各議院の総議員の3分の2以上で発議し、国民投票の過半数の賛成を得る","内閣だけで改正を決める","最高裁判所の全員一致だけで改正する","都道府県知事の過半数で発議する"],answer:0,facts:["civ-23-f11"],direction:"diagram-to-procedure",skill:"憲法改正",tag:"憲法改正",explanation:"憲法改正は国会の厳格な発議要件と国民投票を必要とします。最終的な承認を国民が行う点も国民主権の表れです。",figure:civ23Amendment},
      {prompt:"表現の自由が保障されていても、他人の名誉やプライバシーを侵害してよいことにはならない理由はどれですか。",choices:["権利には他者の権利を尊重する責任が伴うため","自由権は憲法にないため","国民には権利がないため","行政がすべての発言を事前に決めるため"],answer:0,facts:["civ-23-f09","civ-23-f12"],direction:"right-to-responsibility",skill:"権利と責任",tag:"公共の福祉",explanation:"自分の権利を使うときも他者の人権との調整が必要です。権利と責任を一体で考えます。"},
      {prompt:"環境権、知る権利、プライバシーの権利が主張されるようになった共通の背景はどれですか。",choices:["社会や技術の変化で新しい人権課題が生じたため","憲法から基本的人権が削除されたため","選挙が廃止されたため","国際連合が解散したため"],answer:0,facts:["civ-23-f13"],direction:"social-change-to-new-rights",skill:"新しい人権",tag:"新しい人権",explanation:"環境問題や情報化など社会の変化により、憲法の基本原理をもとに新しい人権が主張されてきました。"},
      {prompt:"天皇が内閣の助言と承認に基づいて行うものはどれですか。",choices:["法律や条約の公布などの国事行為","法律案の最終決定","裁判の判決","政党の結成"],answer:0,facts:["civ-23-f05","civ-23-f14"],direction:"role-to-action",skill:"象徴天皇制",tag:"国事行為",explanation:"天皇は内閣の助言と承認によって国事行為を行い、国政に関する権能はもちません。"},
      {prompt:"日本国憲法と大日本帝国憲法の比較として正しいものはどれですか。",choices:["日本国憲法は国民主権、大日本帝国憲法は天皇主権","どちらも国民主権","どちらも天皇に政治的権能がない","日本国憲法は基本的人権を保障しない"],answer:0,facts:["civ-23-f02","civ-23-f15"],direction:"constitution-comparison",skill:"憲法比較",tag:"国民主権",explanation:"大日本帝国憲法では主権は天皇にありました。日本国憲法では国民が主権者です。"},
      {prompt:"日本国憲法に定められた国民の三大義務の組み合わせとして正しいものはどれですか。",choices:["子どもに普通教育を受けさせる義務・勤労の義務・納税の義務","投票の義務・兵役の義務・納税の義務","勤労の義務・国会出席の義務・裁判の義務","教育の義務・移住の義務・政党加入の義務"],answer:0,facts:["civ-23-f17"],direction:"duties-to-set",skill:"国民の三大義務",tag:"三大義務",explanation:"憲法は、保護する子どもに普通教育を受けさせる義務、勤労の義務、納税の義務を定めています。"}
    ],
    final:[
      {prompt:"日本国憲法の三原則のうち、政治の最終決定権が国民にある原則を答えてください。",answers:["国民主権"],facts:["civ-23-f02"],direction:"direct-definition-to-principle",skill:"憲法三原則",tag:"国民主権",explanation:"主権が国民にあることを国民主権といいます。"},
      {prompt:"日本国憲法が国の法の中で最も強い効力をもつことを表す言葉を答えてください。",answers:["最高法規"],facts:["civ-23-f03"],direction:"direct-status-to-term",skill:"憲法の地位",tag:"最高法規",explanation:"憲法は国の最高法規です。"},
      {prompt:"人が生まれながらにもつ、侵すことのできない権利を答えてください。",answers:["基本的人権"],facts:["civ-23-f04"],direction:"direct-definition-to-term",skill:"基本的人権",tag:"基本的人権",explanation:"憲法は基本的人権を永久不可侵の権利として保障します。"},
      {prompt:"健康で文化的な最低限度の生活を営む権利を答えてください。",answers:["生存権"],facts:["civ-23-f07"],direction:"direct-description-to-right",skill:"社会権",tag:"生存権",explanation:"憲法第25条に定められた社会権が生存権です。"},
      {prompt:"すべての国民が人種、信条、性別などで差別されない原則を答えてください。",answers:["法の下の平等","平等権"],facts:["civ-23-f08"],direction:"direct-description-to-right",skill:"平等権",tag:"法の下の平等",explanation:"憲法第14条は法の下の平等を定めています。"},
      {prompt:"環境権、知る権利、プライバシーの権利などをまとめて何と呼ぶか答えてください。",answers:["新しい人権"],facts:["civ-23-f13"],direction:"direct-examples-to-category",skill:"新しい人権",tag:"新しい人権",explanation:"社会の変化に応じて主張される権利を新しい人権と呼びます。"},
      {prompt:"天皇が内閣の助言と承認に基づいて行う、法律の公布などの行為を答えてください。",answers:["国事行為"],facts:["civ-23-f14"],direction:"direct-examples-to-term",skill:"象徴天皇制",tag:"国事行為",explanation:"天皇は国政に関する権能をもたず、定められた国事行為を行います。"},
      {prompt:"核兵器を『もたず、つくらず、もちこませず』という方針を答えてください。",answers:["非核三原則"],facts:["civ-23-f16"],direction:"direct-content-to-policy",skill:"平和主義",tag:"非核三原則",explanation:"この三つを非核三原則といいます。"}
    ]
  });

  const civ24Election = {
    kind:"table",alt:"小選挙区制と比例代表制の特徴を比較したオリジナル表",caption:"選挙制度を比較するオリジナル表",
    columns:["制度","選び方","特徴"],rows:[["A","1選挙区から1人","大政党に有利になりやすい"],["B","得票率に応じて議席配分","少数意見を反映しやすい"]]
  };
  const civ24Houses = {
    kind:"table",alt:"衆議院と参議院の任期と解散を比較したオリジナル表",caption:"二院の違いを整理したオリジナル表",
    columns:["議院","任期","解散"],rows:[["衆議院","4年","ある"],["参議院","6年・3年ごとに半数改選","ない"]]
  };
  const civ24Law = {
    kind:"diagram",width:360,height:195,alt:"法律案の提出、委員会、本会議、成立までを示すオリジナル図",caption:"法律が成立する基本的な流れのオリジナル図",
    nodes:[{id:"a",x:6,y:66,width:76,height:52,label:"法律案"},{id:"b",x:97,y:66,width:76,height:52,label:"委員会"},{id:"c",x:188,y:66,width:76,height:52,label:"本会議"},{id:"d",x:279,y:66,width:76,height:52,label:"両院で議決",emphasis:true}],edges:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"d"}]
  };
  unitSpecs.push({
    id:"civ-24",title:"現代の民主政治・国会",firstPage:48,
    rightPageFacts:["civ-24-f07","civ-24-f08","civ-24-f09","civ-24-f10","civ-24-f11","civ-24-f12"],
    core:[
      {prompt:"国民が選挙で代表者を選び、その代表者が政治を行う仕組みはどれですか。",choices:["間接民主制","直接民主制","三審制","地方分権"],answer:0,facts:["civ-24-f01"],direction:"description-to-system",skill:"民主政治",tag:"間接民主制",explanation:"国民が選んだ代表者を通じて意思を政治に反映する仕組みを間接民主制、または議会制民主主義といいます。"},
      {prompt:"政治について同じ考えや政策をもつ人々がつくり、政権獲得を目指す組織はどれですか。",choices:["政党","裁判所","労働組合","国際連合"],answer:0,facts:["civ-24-f02"],direction:"definition-to-term",skill:"政党政治",tag:"政党",explanation:"政党は政策を掲げ、選挙を通じて政権を担うことを目指す政治組織です。"},
      {prompt:"選挙の際に政党が示す、政権を得た場合に実行する具体的な約束はどれですか。",choices:["政権公約（マニフェスト）","条例","判決","予算教書"],answer:0,facts:["civ-24-f03"],direction:"description-to-term",skill:"選挙と政党",tag:"政権公約",explanation:"政党が選挙で具体的な政策目標を示すものを政権公約、マニフェストといいます。"},
      {prompt:"社会の問題について多くの国民がもつ意見を何といいますか。",choices:["世論","条例","政令","判例"],answer:0,facts:["civ-24-f04"],direction:"definition-to-term",skill:"世論",tag:"世論",explanation:"政治や社会問題に対する国民の意見を世論といいます。"},
      {prompt:"一つの選挙区から一人を選ぶ制度はどれですか。",choices:["小選挙区制","比例代表制","大選挙区制","住民投票"],answer:0,facts:["civ-24-f05"],direction:"description-to-system",skill:"選挙制度",tag:"小選挙区制",explanation:"一つの選挙区から一人を選ぶのが小選挙区制です。"},
      {prompt:"政党の得票数・得票率に応じて議席を配分する制度はどれですか。",choices:["比例代表制","小選挙区制","直接請求制","三権分立"],answer:0,facts:["civ-24-f06"],direction:"description-to-system",skill:"選挙制度",tag:"比例代表制",explanation:"得票に比例して政党へ議席を配分するのが比例代表制です。"},
      {prompt:"国会の地位として憲法に定められているものはどれですか。",choices:["国権の最高機関で唯一の立法機関","行政の最高機関","最終審の裁判所","地方公共団体の議会"],answer:0,facts:["civ-24-f07"],direction:"institution-to-status",skill:"国会の地位",tag:"国会",explanation:"国会は国権の最高機関であり、国の唯一の立法機関です。"},
      {prompt:"衆議院と参議院の二つで国会を構成する制度を何といいますか。",choices:["二院制","議院内閣制","三審制","直接民主制"],answer:0,facts:["civ-24-f08"],direction:"description-to-term",skill:"国会の構成",tag:"二院制",explanation:"衆議院と参議院からなる仕組みを二院制といいます。"}
    ],
    challenge:[
      {prompt:"表のA・Bにあたる制度の組み合わせはどれですか。",choices:["A小選挙区制・B比例代表制","A比例代表制・B小選挙区制","A直接選挙・B間接選挙","A普通選挙・B秘密選挙"],answer:0,facts:["civ-24-f05","civ-24-f06"],direction:"table-to-election-systems",skill:"選挙制度比較",tag:"選挙制度",explanation:"一選挙区一人が小選挙区制、得票に応じた議席配分が比例代表制です。",figure:civ24Election},
      {prompt:"表から、衆議院に優越が認められる理由として最も適切なものはどれですか。",choices:["任期が短く解散もあり、国民の意思をより反映しやすいから","議員が任命制だから","参議院が法律を審議しないから","衆議院が裁判を行うから"],answer:0,facts:["civ-24-f09","civ-24-f10"],direction:"table-to-reason",skill:"衆議院の優越",tag:"衆議院の優越",explanation:"衆議院は任期が短く解散もあるため、参議院より国民の意思を反映しやすいと考えられ、一定の場合に優越が認められます。",figure:civ24Houses},
      {prompt:"図の流れで委員会を置く主な理由はどれですか。",choices:["分野ごとに専門的・詳しく審査するため","法律案を国民に知らせないため","裁判官が判決を出すため","内閣を国会から独立させるため"],answer:0,facts:["civ-24-f11"],direction:"diagram-to-purpose",skill:"国会審議",tag:"委員会",explanation:"法律案や予算は、まず分野別の委員会で専門的に審査され、その後本会議で議決されます。",figure:civ24Law},
      {prompt:"予算、条約の承認、内閣総理大臣の指名で両院の意見が一致しない場合、原則としてどうなりますか。",choices:["一定の要件で衆議院の議決が国会の議決になる","必ず参議院の議決が優先する","最高裁判所が予算を決定する","都道府県議会が決める"],answer:0,facts:["civ-24-f09"],direction:"conflict-to-house-precedence",skill:"衆議院の優越",tag:"衆議院の優越",explanation:"予算、条約、首相指名では、両院協議会でも一致しないなど一定の場合に衆議院の議決が国会の議決となります。"},
      {prompt:"法律案を参議院が否決した場合、衆議院で再可決して法律にするために必要なものはどれですか。",choices:["出席議員の3分の2以上の賛成","総議員の過半数だけ","国民投票の全員賛成","最高裁判所長官の承認"],answer:0,facts:["civ-24-f12"],direction:"case-to-revote-requirement",skill:"法律案と衆議院の優越",tag:"再可決",explanation:"法律案は衆議院で出席議員の3分の2以上で再可決すれば成立します。"},
      {prompt:"選挙で有権者が候補者名を他人に知られず記入できる原則はどれですか。",choices:["秘密選挙","公開選挙","間接選挙","制限選挙"],answer:0,facts:["civ-24-f13"],direction:"case-to-election-principle",skill:"選挙の原則",tag:"秘密選挙",explanation:"投票内容を他人に知られない秘密選挙は、自由な意思による投票を守ります。"},
      {prompt:"複数の政党が協力して内閣を組織することを何といいますか。",choices:["連立政権","大選挙区制","国民審査","直接請求"],answer:0,facts:["civ-24-f14"],direction:"description-to-government-form",skill:"政党政治",tag:"連立政権",explanation:"一党だけで議会の多数を確保できない場合などに、複数政党が協力して組織する政権を連立政権といいます。"},
      {prompt:"世論調査の結果を読むときに必要な姿勢として最も適切なものはどれですか。",choices:["調査対象・人数・質問方法を確認する","数字があれば必ず全国民の意見とみなす","自分に都合のよい結果だけ採用する","異なる調査を比較しない"],answer:0,facts:["civ-24-f04"],direction:"data-to-critical-reading",skill:"世論調査の読解",tag:"世論",explanation:"世論調査は標本や質問方法で結果が変わり得るため、調査条件を確認して読み取ります。"}
    ],
    final:[
      {prompt:"国民が選挙で選んだ代表者を通して政治を行う仕組みを答えてください。",answers:["間接民主制","議会制民主主義","代議制"],facts:["civ-24-f01"],direction:"direct-description-to-system",skill:"民主政治",tag:"間接民主制",explanation:"代表者を通じて政治を行うのが間接民主制です。"},
      {prompt:"同じ政治的考えや政策をもつ人々がつくり、政権を目指す組織を答えてください。",answers:["政党"],facts:["civ-24-f02"],direction:"direct-definition-to-term",skill:"政党政治",tag:"政党",explanation:"政策を掲げて政権を目指す組織が政党です。"},
      {prompt:"国政選挙で選挙権を得る年齢を答えてください。",answers:["18歳","18"],facts:["civ-24-f15"],direction:"direct-franchise-to-age",skill:"選挙権年齢",tag:"18歳選挙権",explanation:"日本の国政選挙では満18歳以上の日本国民に選挙権があります。"},
      {prompt:"政治や社会問題について多くの国民がもつ意見を答えてください。",answers:["世論"],facts:["civ-24-f04"],direction:"direct-definition-to-term",skill:"世論",tag:"世論",explanation:"国民の意見を世論といいます。"},
      {prompt:"一つの選挙区から一人を選ぶ選挙制度を答えてください。",answers:["小選挙区制"],facts:["civ-24-f05"],direction:"direct-description-to-system",skill:"選挙制度",tag:"小選挙区制",explanation:"一選挙区一人が小選挙区制です。"},
      {prompt:"政党の得票に応じて議席を配分する選挙制度を答えてください。",answers:["比例代表制"],facts:["civ-24-f06"],direction:"direct-description-to-system",skill:"選挙制度",tag:"比例代表制",explanation:"得票に比例して議席を配分するのが比例代表制です。"},
      {prompt:"衆議院と参議院の二つの議院で国会を構成する制度を答えてください。",answers:["二院制"],facts:["civ-24-f08"],direction:"direct-description-to-term",skill:"国会の構成",tag:"二院制",explanation:"二つの議院を置く仕組みが二院制です。"},
      {prompt:"衆議院の議決が参議院より優先される場合があることを何といいますか。",answers:["衆議院の優越"],facts:["civ-24-f09"],direction:"direct-description-to-term",skill:"衆議院の優越",tag:"衆議院の優越",explanation:"両院の意見が異なる一定の場合に衆議院の議決を優先する仕組みです。"}
    ]
  });

  const civ25Separation = {
    kind:"diagram",width:360,height:230,alt:"国会、内閣、裁判所が相互に抑制する三権分立のオリジナル図",caption:"三権の抑制と均衡を示すオリジナル図",
    nodes:[{id:"d",x:132,y:12,width:96,height:48,label:"国会\n立法"},{id:"c",x:22,y:158,width:96,height:48,label:"内閣\n行政"},{id:"j",x:242,y:158,width:96,height:48,label:"裁判所\n司法",emphasis:true}],
    edges:[{from:"d",to:"c",label:"首相指名"},{from:"c",to:"j",label:"長官指名"},{from:"j",to:"d",label:"違憲審査"}]
  };
  const civ25Trials = {
    kind:"diagram",width:360,height:195,alt:"第一審、控訴、第二審、上告、第三審の順を示すオリジナル図",caption:"三審制の流れを示すオリジナル図",
    nodes:[{id:"a",x:7,y:66,width:78,height:52,label:"第一審"},{id:"b",x:100,y:66,width:78,height:52,label:"第二審"},{id:"c",x:193,y:66,width:78,height:52,label:"第三審",emphasis:true},{id:"d",x:286,y:66,width:66,height:52,label:"確定"}],edges:[{from:"a",to:"b",label:"控訴"},{from:"b",to:"c",label:"上告"},{from:"c",to:"d"}]
  };
  const civ25NoConfidence = {
    kind:"diagram",width:360,height:195,alt:"衆議院の内閣不信任決議後の二つの対応を示すオリジナル図",caption:"内閣不信任決議後の対応を示すオリジナル図",
    nodes:[{id:"a",x:112,y:14,width:136,height:48,label:"内閣不信任決議"},{id:"b",x:22,y:128,width:120,height:48,label:"衆議院を解散"},{id:"c",x:218,y:128,width:120,height:48,label:"内閣が総辞職",emphasis:true}],edges:[{from:"a",to:"b",label:"10日以内"},{from:"a",to:"c",label:"どちらか"}]
  };
  unitSpecs.push({
    id:"civ-25",title:"内閣・裁判所・三権分立",firstPage:50,
    rightPageFacts:["civ-25-f04","civ-25-f05","civ-25-f06","civ-25-f07","civ-25-f08","civ-25-f09","civ-25-f11","civ-25-f12","civ-25-f13","civ-25-f14"],
    core:[
      {prompt:"法律や予算に基づいて実際の政治を行う権力はどれですか。",choices:["行政権","立法権","司法権","請求権"],answer:0,facts:["civ-25-f01"],direction:"function-to-power",skill:"三権の役割",tag:"行政権",explanation:"国会が定めた法律や予算を執行する行政権は内閣に属します。"},
      {prompt:"内閣が国会の信任に基づいて成立し、国会に連帯して責任を負う仕組みはどれですか。",choices:["議院内閣制","大統領制","二院制","三審制"],answer:0,facts:["civ-25-f02"],direction:"description-to-system",skill:"内閣",tag:"議院内閣制",explanation:"内閣が国会の信任の上に成り立つ仕組みを議院内閣制といいます。"},
      {prompt:"内閣総理大臣を指名する機関はどれですか。",choices:["国会","最高裁判所","都道府県知事","国際連合"],answer:0,facts:["civ-25-f03"],direction:"office-to-designating-body",skill:"内閣の成立",tag:"内閣総理大臣",explanation:"内閣総理大臣は国会議員の中から国会が指名し、天皇が任命します。"},
      {prompt:"司法権を担当する機関はどれですか。",choices:["裁判所","内閣","国会","地方議会"],answer:0,facts:["civ-25-f04"],direction:"power-to-institution",skill:"三権の役割",tag:"司法権",explanation:"裁判所は法律に基づいて争いを解決し、司法権を担います。"},
      {prompt:"同じ事件について原則3回まで裁判を受けられる制度はどれですか。",choices:["三審制","三権分立","二院制","議院内閣制"],answer:0,facts:["civ-25-f05"],direction:"description-to-system",skill:"裁判制度",tag:"三審制",explanation:"誤った裁判を防ぎ、人権を守るため、原則3回まで審理を求められる三審制が採られています。"},
      {prompt:"法律や行政の行為が憲法に違反していないかを裁判所が審査する権限はどれですか。",choices:["違憲審査権","国政調査権","予算議決権","条例制定権"],answer:0,facts:["civ-25-f06"],direction:"description-to-power",skill:"裁判所の権限",tag:"違憲審査権",explanation:"裁判所は法律・命令・処分などが憲法に適合するかを審査する違憲審査権をもちます。"},
      {prompt:"国民が重大な刑事裁判に参加し、裁判官と有罪・無罪や刑を決める制度はどれですか。",choices:["裁判員制度","検察審査会だけ","国民審査","弾劾裁判"],answer:0,facts:["civ-25-f07"],direction:"description-to-system",skill:"司法参加",tag:"裁判員制度",explanation:"裁判員制度では国民から選ばれた裁判員が裁判官とともに重大な刑事事件を審理します。"},
      {prompt:"立法・行政・司法を別の機関に分け、互いに抑制させる仕組みはどれですか。",choices:["三権分立","地方分権","国際分業","市場経済"],answer:0,facts:["civ-25-f08"],direction:"description-to-system",skill:"三権分立",tag:"三権分立",explanation:"権力の集中と濫用を防ぐため、国会・内閣・裁判所に権力を分ける仕組みが三権分立です。"}
    ],
    challenge:[
      {prompt:"図で裁判所から国会へ向かう『違憲審査』が権力の濫用を防ぐ理由はどれですか。",choices:["国会がつくった法律も憲法に照らして審査できるから","裁判所が自由に法律を制定するから","内閣が裁判を廃止できるから","国会が判決を変更できるから"],answer:0,facts:["civ-25-f06","civ-25-f08"],direction:"diagram-to-check-and-balance",skill:"抑制と均衡",tag:"違憲審査権",explanation:"裁判所が法律を憲法に照らして審査できることで、立法権にも歯止めがかかります。",figure:civ25Separation},
      {prompt:"図の第二審の判決に不服があり、第三審を求める手続はどれですか。",choices:["上告","控訴","起訴","告訴"],answer:0,facts:["civ-25-f05","civ-25-f09"],direction:"diagram-to-appeal-term",skill:"三審制",tag:"上告",explanation:"第一審から第二審へは控訴、第二審から第三審へは上告といいます。",figure:civ25Trials},
      {prompt:"図の内閣不信任決議後、内閣が衆議院を解散しない場合に必要な対応はどれですか。",choices:["10日以内に総辞職する","参議院を解散する","最高裁判所を廃止する","地方議会に移る"],answer:0,facts:["civ-25-f02","civ-25-f10"],direction:"diagram-to-cabinet-response",skill:"議院内閣制",tag:"内閣不信任",explanation:"衆議院で不信任決議が可決された場合、内閣は10日以内に衆議院を解散しなければ総辞職します。",figure:civ25NoConfidence},
      {prompt:"刑事裁判と民事裁判の比較として正しいものはどれですか。",choices:["刑事裁判は犯罪と刑罰、民事裁判は私人間の争いを扱う","どちらも国会が判決する","民事裁判だけが三審制である","刑事裁判には被告人がいない"],answer:0,facts:["civ-25-f11"],direction:"court-types-comparison",skill:"裁判の種類",tag:"刑事裁判",explanation:"刑事裁判は犯罪を行ったかと刑罰を判断し、民事裁判は個人・企業などの権利関係の争いを解決します。"},
      {prompt:"裁判官が憲法と法律だけに従い、他の機関から指図されない原則はどれですか。",choices:["司法権の独立","議院内閣制","地方自治","政党政治"],answer:0,facts:["civ-25-f12"],direction:"description-to-principle",skill:"司法権の独立",tag:"司法権の独立",explanation:"公正な裁判のため、裁判官は良心に従い独立して職権を行い、憲法と法律だけに拘束されます。"},
      {prompt:"最高裁判所が『憲法の番人』と呼ばれる理由はどれですか。",choices:["違憲審査の最終判断を行うから","予算を作成するから","国会議員を選挙するから","条例を制定するから"],answer:0,facts:["civ-25-f06","civ-25-f13"],direction:"nickname-to-reason",skill:"最高裁判所",tag:"憲法の番人",explanation:"最高裁判所は違憲審査について最終的な判断をする終審裁判所であるため、憲法の番人と呼ばれます。"},
      {prompt:"最高裁判所裁判官の適否を国民が投票で審査する制度はどれですか。",choices:["国民審査","裁判員制度","住民投票","直接請求"],answer:0,facts:["civ-25-f14"],direction:"description-to-system",skill:"司法への国民参加",tag:"国民審査",explanation:"最高裁判所裁判官は任命後最初の衆議院議員総選挙と、その後10年を経過した最初の総選挙の際に国民審査を受けます。"},
      {prompt:"行政の仕事が広がり、行政機関の規模や権限が大きくなる傾向を何といいますか。",choices:["行政国家","夜警国家","直接民主制","司法国家"],answer:0,facts:["civ-25-f15"],direction:"description-to-term",skill:"行政改革",tag:"行政国家",explanation:"社会保障や経済政策など行政の役割が拡大し、行政機関の規模と権限が大きくなる状態を行政国家といいます。"}
    ],
    final:[
      {prompt:"国会が定めた法律や予算を実行する権力を答えてください。",answers:["行政権"],facts:["civ-25-f01"],direction:"direct-function-to-power",skill:"三権の役割",tag:"行政権",explanation:"法律や予算を執行するのが行政権です。"},
      {prompt:"内閣が国会の信任に基づいて成立し、国会に連帯して責任を負う仕組みを答えてください。",answers:["議院内閣制"],facts:["civ-25-f02"],direction:"direct-description-to-system",skill:"内閣",tag:"議院内閣制",explanation:"この仕組みを議院内閣制といいます。"},
      {prompt:"同じ事件について原則3回まで裁判を受けられる制度を答えてください。",answers:["三審制"],facts:["civ-25-f05"],direction:"direct-description-to-system",skill:"裁判制度",tag:"三審制",explanation:"誤判を防ぐための制度が三審制です。"},
      {prompt:"第一審の判決を不服として第二審を求める手続を答えてください。",answers:["控訴"],facts:["civ-25-f09"],direction:"direct-stage-to-appeal",skill:"三審制",tag:"控訴",explanation:"第一審から第二審への不服申立てが控訴です。"},
      {prompt:"法律や行政処分が憲法に違反しないかを裁判所が審査する権限を答えてください。",answers:["違憲審査権"],facts:["civ-25-f06"],direction:"direct-description-to-power",skill:"裁判所の権限",tag:"違憲審査権",explanation:"憲法に適合するかを審査する権限が違憲審査権です。"},
      {prompt:"国民が重大な刑事裁判に参加し、裁判官と判断する制度を答えてください。",answers:["裁判員制度"],facts:["civ-25-f07"],direction:"direct-description-to-system",skill:"司法参加",tag:"裁判員制度",explanation:"国民の感覚を刑事裁判に反映する制度が裁判員制度です。"},
      {prompt:"立法・行政・司法を別の機関に分け、互いに抑制させる仕組みを答えてください。",answers:["三権分立"],facts:["civ-25-f08"],direction:"direct-description-to-system",skill:"三権分立",tag:"三権分立",explanation:"権力の集中を防ぐ仕組みが三権分立です。"},
      {prompt:"最高裁判所裁判官が適任かを国民が投票で審査する制度を答えてください。",answers:["国民審査"],facts:["civ-25-f14"],direction:"direct-description-to-system",skill:"司法への国民参加",tag:"国民審査",explanation:"最高裁判所裁判官に対する国民の審査を国民審査といいます。"}
    ]
  });

  const civ26Organization = {
    kind:"diagram",width:360,height:220,alt:"住民が首長と地方議会をそれぞれ直接選挙し、両者が抑制する仕組みのオリジナル図",caption:"地方自治の二元代表制を示すオリジナル図",
    nodes:[{id:"r",x:132,y:12,width:96,height:48,label:"住民",emphasis:true},{id:"h",x:28,y:148,width:110,height:48,label:"首長\n執行機関"},{id:"a",x:222,y:148,width:110,height:48,label:"地方議会\n議決機関"}],edges:[{from:"r",to:"h",label:"直接選挙"},{from:"r",to:"a",label:"直接選挙"},{from:"h",to:"a",label:"拒否・解散"},{from:"a",to:"h",label:"不信任"}]
  };
  const civ26Requests = {
    kind:"table",alt:"地方自治の直接請求に必要な署名の基準を整理したオリジナル表",caption:"直接請求の種類を比較するオリジナル表",
    columns:["請求","必要な署名の原則","提出先"],rows:[["条例の制定・改廃","有権者の50分の1以上","首長"],["監査","有権者の50分の1以上","監査委員"],["議会の解散・解職","有権者の3分の1以上","選挙管理委員会"]]
  };
  const civ26Finance = {
    kind:"table",alt:"地方公共団体の財源を性質ごとに整理したオリジナル表",caption:"地方財政の財源を比較するオリジナル表",
    columns:["財源","説明"],rows:[["地方税","地域で集める自主財源"],["地方交付税交付金","地域間の財源格差を調整"],["国庫支出金","国が使い道を定めて交付"],["地方債","地方公共団体の借金"]]
  };
  unitSpecs.push({
    id:"civ-26",title:"地方自治",firstPage:52,
    rightPageFacts:["civ-26-f07","civ-26-f08","civ-26-f11","civ-26-f15"],
    core:[
      {prompt:"都道府県や市町村など、地域の政治を担う団体はどれですか。",choices:["地方公共団体","国会","内閣","国際機関"],answer:0,facts:["civ-26-f01"],direction:"examples-to-term",skill:"地方自治の主体",tag:"地方公共団体",explanation:"都道府県と市町村などを地方公共団体、地方自治体といいます。"},
      {prompt:"地域のことを住民自身の意思と責任で運営する原則はどれですか。",choices:["地方自治","三権分立","国際分業","司法権の独立"],answer:0,facts:["civ-26-f02"],direction:"definition-to-principle",skill:"地方自治",tag:"地方自治",explanation:"地域の政治を住民の意思に基づいて行うことが地方自治です。"},
      {prompt:"地方議会が地域のルールとして制定するものはどれですか。",choices:["条例","法律","条約","政令"],answer:0,facts:["civ-26-f03"],direction:"institution-to-rule",skill:"地方議会",tag:"条例",explanation:"地方公共団体がその地域に適用するルールとして制定するのが条例です。"},
      {prompt:"都道府県知事や市町村長をまとめて何といいますか。",choices:["首長","国務大臣","裁判官","国会議員"],answer:0,facts:["civ-26-f04"],direction:"examples-to-term",skill:"地方自治のしくみ",tag:"首長",explanation:"都道府県知事や市町村長は地方公共団体の長で、首長と呼ばれます。"},
      {prompt:"首長と地方議会議員の選ばれ方として正しいものはどれですか。",choices:["どちらも住民が直接選挙する","首長を議会が任命する","議員を首長が任命する","どちらも内閣が任命する"],answer:0,facts:["civ-26-f05"],direction:"offices-to-election-method",skill:"二元代表制",tag:"直接選挙",explanation:"住民が首長と議員をそれぞれ直接選挙するため、二元代表制と呼ばれます。"},
      {prompt:"住民が条例制定や議会解散、首長の解職などを求める権利はどれですか。",choices:["直接請求権","違憲審査権","国政調査権","団結権"],answer:0,facts:["civ-26-f06"],direction:"examples-to-right",skill:"住民参加",tag:"直接請求権",explanation:"住民は一定数の署名を集めて条例や監査、解散、解職などを直接請求できます。"},
      {prompt:"地域間の財政力の差を小さくするため国から地方へ配分される財源はどれですか。",choices:["地方交付税交付金","地方税","地方債","所得税"],answer:0,facts:["civ-26-f07"],direction:"purpose-to-revenue",skill:"地方財政",tag:"地方交付税交付金",explanation:"地方交付税交付金は地方公共団体間の財源格差を調整するために交付されます。"},
      {prompt:"国から地方へ仕事や財源を移し、地方の自主性を高めることはどれですか。",choices:["地方分権","中央集権","国際分業","規制強化"],answer:0,facts:["civ-26-f08"],direction:"description-to-term",skill:"地方分権",tag:"地方分権",explanation:"国の権限や財源を地方へ移すことを地方分権といいます。"}
    ],
    challenge:[
      {prompt:"図から読み取れる地方自治の特徴として正しいものはどれですか。",choices:["住民が首長と議会を別々に選び、両者が抑制し合う","首長だけが住民に選ばれる","議会が裁判所を兼ねる","内閣がすべての議員を任命する"],answer:0,facts:["civ-26-f05","civ-26-f09"],direction:"diagram-to-local-government-structure",skill:"二元代表制",tag:"二元代表制",explanation:"住民が首長と議員をそれぞれ選び、首長と議会が相互に抑制する仕組みです。",figure:civ26Organization},
      {prompt:"表によると、条例の制定を直接請求するのに必要な署名の原則はどれですか。",choices:["有権者の50分の1以上","有権者の3分の2以上","住民全員","国会議員の過半数"],answer:0,facts:["civ-26-f06","civ-26-f10"],direction:"table-to-signature-threshold",skill:"直接請求",tag:"条例制定請求",explanation:"条例の制定・改廃と監査の請求は、原則として有権者の50分の1以上の署名が必要です。",figure:civ26Requests},
      {prompt:"表のうち、使い道を国が定めて地方へ交付する財源はどれですか。",choices:["国庫支出金","地方税","地方交付税交付金","地方債"],answer:0,facts:["civ-26-f07","civ-26-f11"],direction:"table-to-revenue-source",skill:"地方財政",tag:"国庫支出金",explanation:"国庫支出金は特定の事業のために国から交付され、使い道が定められています。",figure:civ26Finance},
      {prompt:"地方自治が『民主主義の学校』と呼ばれる理由として最も適切なものはどれですか。",choices:["住民が身近な政治に直接参加し、民主政治を学べるから","地方では選挙を行わないから","国会が地方のすべてを決めるから","住民に責任がないから"],answer:0,facts:["civ-26-f02","civ-26-f12"],direction:"nickname-to-reason",skill:"住民自治",tag:"民主主義の学校",explanation:"身近な問題について選挙・請求・住民投票などで参加する経験が民主政治の基礎になるためです。"},
      {prompt:"地方議会が首長への不信任決議を可決した場合の関係として正しいものはどれですか。",choices:["首長は辞職するか議会を解散する","首長が国会を解散する","議会が最高裁判所を廃止する","住民の選挙権が停止する"],answer:0,facts:["civ-26-f09"],direction:"conflict-to-local-chief-response",skill:"首長と議会",tag:"不信任決議",explanation:"議会が首長不信任を決議した場合、首長は辞職するか議会を解散することで応答します。"},
      {prompt:"ごみ収集、公立小中学校、消防、上下水道に共通するものはどれですか。",choices:["住民に身近な地方公共団体の仕事","国会だけの仕事","裁判所の仕事","国際連合の仕事"],answer:0,facts:["civ-26-f01","civ-26-f13"],direction:"services-to-government-level",skill:"地方公共団体の仕事",tag:"地方行政",explanation:"生活に密着した公共サービスの多くは地方公共団体が担います。"},
      {prompt:"住民の意見を地域の重要課題について投票で確かめる制度はどれですか。",choices:["住民投票","国民審査","裁判員制度","比例代表制"],answer:0,facts:["civ-26-f14"],direction:"description-to-system",skill:"住民参加",tag:"住民投票",explanation:"条例に基づく住民投票などにより、地域の重要課題について住民の意思を示すことがあります。"},
      {prompt:"地方公共団体が財源不足を補うために発行する借金はどれですか。",choices:["地方債","国庫支出金","地方交付税交付金","地方税"],answer:0,facts:["civ-26-f15"],direction:"description-to-revenue-source",skill:"地方財政",tag:"地方債",explanation:"地方公共団体が将来の返済を前提に資金を借りるため発行するものが地方債です。"}
    ],
    final:[
      {prompt:"都道府県や市町村など、地域の政治を担う団体を答えてください。",answers:["地方公共団体","地方自治体"],facts:["civ-26-f01"],direction:"direct-examples-to-term",skill:"地方自治の主体",tag:"地方公共団体",explanation:"都道府県や市町村を地方公共団体といいます。"},
      {prompt:"地域の政治を住民自身の意思と責任で行う原則を答えてください。",answers:["地方自治"],facts:["civ-26-f02"],direction:"direct-definition-to-principle",skill:"地方自治",tag:"地方自治",explanation:"身近な地域を住民の意思で運営するのが地方自治です。"},
      {prompt:"地方議会が制定する、その地域に適用されるルールを答えてください。",answers:["条例"],facts:["civ-26-f03"],direction:"direct-institution-to-rule",skill:"地方議会",tag:"条例",explanation:"地方公共団体のルールが条例です。"},
      {prompt:"都道府県知事や市町村長をまとめた呼び名を答えてください。",answers:["首長"],facts:["civ-26-f04"],direction:"direct-examples-to-term",skill:"地方自治のしくみ",tag:"首長",explanation:"地方公共団体の長を首長といいます。"},
      {prompt:"住民が条例制定、議会解散、首長の解職などを求める権利を答えてください。",answers:["直接請求権"],facts:["civ-26-f06"],direction:"direct-examples-to-right",skill:"住民参加",tag:"直接請求権",explanation:"一定の署名で住民が請求できる権利が直接請求権です。"},
      {prompt:"地方公共団体間の財源格差を調整するために国から配分される財源を答えてください。",answers:["地方交付税交付金","地方交付税"],facts:["civ-26-f07"],direction:"direct-purpose-to-revenue",skill:"地方財政",tag:"地方交付税交付金",explanation:"財政力の差を調整するのが地方交付税交付金です。"},
      {prompt:"国が使い道を指定して地方公共団体へ交付する財源を答えてください。",answers:["国庫支出金"],facts:["civ-26-f11"],direction:"direct-description-to-revenue",skill:"地方財政",tag:"国庫支出金",explanation:"特定事業のため国から交付されるのが国庫支出金です。"},
      {prompt:"国から地方へ仕事や財源を移し、地方の自主性を高めることを答えてください。",answers:["地方分権"],facts:["civ-26-f08"],direction:"direct-description-to-term",skill:"地方分権",tag:"地方分権",explanation:"権限や財源を地方へ移すことを地方分権といいます。"}
    ]
  });

  const civ27Household = {
    kind:"table",alt:"二つの家計の消費支出と食料費を比較する架空資料",caption:"エンゲル係数を考えるための架空データ",
    columns:["家計","消費支出","食料費"],rows:[["X","20万円","8万円"],["Y","30万円","9万円"]]
  };
  const civ27Market = {
    kind:"table",alt:"価格ごとの需要量と供給量を示す架空の市場資料",caption:"需要と供給による価格調整を考える架空データ",
    columns:["価格","需要量","供給量"],rows:[["100円","120個","60個"],["150円","90個","90個"],["200円","55個","125個"]]
  };
  const civ27Finance = {
    kind:"diagram",width:360,height:195,alt:"家計から金融機関、企業へ資金が流れる間接金融のオリジナル図",caption:"間接金融の流れを示すオリジナル図",
    nodes:[{id:"h",x:8,y:66,width:96,height:52,label:"家計\n預金"},{id:"b",x:132,y:66,width:96,height:52,label:"金融機関",emphasis:true},{id:"c",x:256,y:66,width:96,height:52,label:"企業\n借入"}],edges:[{from:"h",to:"b",label:"預ける"},{from:"b",to:"c",label:"貸し出す"}]
  };
  unitSpecs.push({
    id:"civ-27",title:"わたしたちのくらしと経済",firstPage:54,
    rightPageFacts:["civ-27-f06","civ-27-f07","civ-27-f08","civ-27-f09","civ-27-f10","civ-27-f11","civ-27-f12","civ-27-f13"],
    core:[
      {prompt:"家計の消費支出に占める食料費の割合を何といいますか。",choices:["エンゲル係数","完全失業率","物価指数","利子率"],answer:0,facts:["civ-27-f01"],direction:"definition-to-term",skill:"家計",tag:"エンゲル係数",explanation:"消費支出に占める食料費の割合をエンゲル係数といいます。"},
      {prompt:"一定期間内なら理由を問わず契約を解除できる消費者保護の制度はどれですか。",choices:["クーリング・オフ","リコール請求","国民審査","団体交渉"],answer:0,facts:["civ-27-f02"],direction:"description-to-system",skill:"消費者保護",tag:"クーリング・オフ",explanation:"訪問販売など一定の取引で、期間内なら書面などにより契約を解除できる制度がクーリング・オフです。"},
      {prompt:"製品の欠陥で被害が生じたとき、製造業者の損害賠償責任を定める法律はどれですか。",choices:["製造物責任法（PL法）","独占禁止法","労働基準法","地方自治法"],answer:0,facts:["civ-27-f03"],direction:"purpose-to-law",skill:"消費者保護",tag:"PL法",explanation:"製造物責任法は製品の欠陥による生命・身体・財産への損害について製造業者などの責任を定めます。"},
      {prompt:"資本を使って生産活動を行い、利潤を得ることを目的とする経済主体はどれですか。",choices:["企業","家計","裁判所","地方議会"],answer:0,facts:["civ-27-f04"],direction:"description-to-agent",skill:"企業",tag:"企業",explanation:"企業は資本を元に財やサービスを生産・販売し、利潤を得る経済主体です。"},
      {prompt:"株式を発行して広く資金を集める会社はどれですか。",choices:["株式会社","公企業だけ","協同組合だけ","中央銀行"],answer:0,facts:["civ-27-f05"],direction:"financing-to-company-type",skill:"企業",tag:"株式会社",explanation:"株式会社は株式を発行して資金を集め、出資者である株主は配当などを受けることがあります。"},
      {prompt:"商品の需要量と供給量の関係によって決まる価格はどれですか。",choices:["市場価格","公共料金だけ","最低賃金","租税"],answer:0,facts:["civ-27-f06"],direction:"mechanism-to-term",skill:"市場経済",tag:"市場価格",explanation:"市場では需要と供給の変化を通じて価格が調整されます。"},
      {prompt:"労働者が労働組合をつくる権利はどれですか。",choices:["団結権","生存権","請願権","国民審査"],answer:0,facts:["civ-27-f07"],direction:"description-to-right",skill:"労働三権",tag:"団結権",explanation:"団結権、団体交渉権、団体行動権をまとめて労働三権といいます。"},
      {prompt:"預金を集め、資金を必要とする企業などへ貸し出す機関はどれですか。",choices:["金融機関","地方議会","裁判所","国会"],answer:0,facts:["civ-27-f08"],direction:"function-to-institution",skill:"金融",tag:"金融機関",explanation:"銀行などの金融機関は預金を受け入れ、企業や家計へ資金を貸し出します。"}
    ],
    challenge:[
      {prompt:"表の家計XとYのエンゲル係数を比べた説明として正しいものはどれですか。",choices:["Xは40%、Yは30%で、Xの方が高い","Xは20%、Yは30%で、Yの方が高い","どちらも50%","資料から計算できない"],answer:0,facts:["civ-27-f01"],direction:"table-to-ratio-comparison",skill:"資料計算",tag:"エンゲル係数",explanation:"Xは8÷20=40%、Yは9÷30=30%です。食料費の金額だけでなく消費支出に占める割合を計算します。",figure:civ27Household},
      {prompt:"表で需要量と供給量が一致する価格はどれですか。",choices:["150円","100円","200円","どの価格でも一致"],answer:0,facts:["civ-27-f06","civ-27-f09"],direction:"table-to-equilibrium-price",skill:"需要と供給",tag:"均衡価格",explanation:"150円のとき需要量と供給量がともに90個で一致しています。この価格付近で市場価格が調整されます。",figure:civ27Market},
      {prompt:"図のように金融機関を通じて家計の資金が企業へ渡る方法はどれですか。",choices:["間接金融","直接金融","財政投融資だけ","物々交換"],answer:0,facts:["civ-27-f08","civ-27-f10"],direction:"diagram-to-finance-type",skill:"金融のしくみ",tag:"間接金融",explanation:"銀行などの金融機関が預金を集めて貸し出す方法が間接金融です。株式や社債で直接集めるのが直接金融です。",figure:civ27Finance},
      {prompt:"商品の価格が上がったとき、ほかの条件が同じなら一般に需要量はどうなりますか。",choices:["減少する","増加する","必ず変わらない","供給量と同じになる"],answer:0,facts:["civ-27-f06"],direction:"price-change-to-demand",skill:"需要と供給",tag:"需要",explanation:"一般に価格が上がると買いたい量は減り、価格が下がると増える傾向があります。"},
      {prompt:"少数の企業が市場を支配して競争が弱まることを防ぐ法律と機関の組み合わせはどれですか。",choices:["独占禁止法―公正取引委員会","労働基準法―最高裁判所","地方自治法―国会","憲法―日本銀行"],answer:0,facts:["civ-27-f11"],direction:"problem-to-law-and-agency",skill:"公正な競争",tag:"独占禁止法",explanation:"独占禁止法に基づき、公正取引委員会が私的独占や不当な取引制限などを監視します。"},
      {prompt:"労働条件について労働組合が使用者と話し合う権利はどれですか。",choices:["団体交渉権","団結権","団体行動権だけ","参政権"],answer:0,facts:["civ-27-f07","civ-27-f12"],direction:"case-to-labor-right",skill:"労働三権",tag:"団体交渉権",explanation:"労働組合が使用者と労働条件について交渉する権利が団体交渉権です。"},
      {prompt:"消費者が商品を選ぶ行動が企業の生産に影響する理由として適切なものはどれですか。",choices:["企業が需要の変化を見て生産量や商品を調整するから","消費者は市場に関係しないから","価格は常に政府だけが決めるから","企業は利益を考えないから"],answer:0,facts:["civ-27-f04","civ-27-f06"],direction:"consumer-choice-to-production",skill:"経済循環",tag:"消費者主権",explanation:"消費者の選択は需要として表れ、企業の生産や価格設定に影響します。"},
      {prompt:"日本銀行の役割として適切なものはどれですか。",choices:["紙幣を発行し、政府の銀行・銀行の銀行として働く","株式会社の株主総会を開く","地方条例を制定する","裁判員を選ぶ"],answer:0,facts:["civ-27-f13"],direction:"institution-to-functions",skill:"中央銀行",tag:"日本銀行",explanation:"日本銀行は日本の中央銀行で、発券銀行、政府の銀行、銀行の銀行という役割を担います。"}
    ],
    final:[
      {prompt:"消費支出に占める食料費の割合を答えてください。",answers:["エンゲル係数"],facts:["civ-27-f01"],direction:"direct-definition-to-term",skill:"家計",tag:"エンゲル係数",explanation:"食料費÷消費支出で求める割合がエンゲル係数です。"},
      {prompt:"一定の取引で、期間内なら契約を解除できる消費者保護制度を答えてください。",answers:["クーリング・オフ","クーリングオフ"],facts:["civ-27-f02"],direction:"direct-description-to-system",skill:"消費者保護",tag:"クーリング・オフ",explanation:"訪問販売などで利用できる制度がクーリング・オフです。"},
      {prompt:"製品の欠陥による損害について製造業者などの責任を定める法律を答えてください。",answers:["製造物責任法","PL法","製造物責任法（PL法）"],facts:["civ-27-f03"],direction:"direct-purpose-to-law",skill:"消費者保護",tag:"PL法",explanation:"製品欠陥による損害賠償責任を定めるのが製造物責任法です。"},
      {prompt:"株式を発行して資金を集める会社を答えてください。",answers:["株式会社"],facts:["civ-27-f05"],direction:"direct-financing-to-company",skill:"企業",tag:"株式会社",explanation:"出資を株式の形で集める会社が株式会社です。"},
      {prompt:"需要と供給の関係によって市場で決まる価格を答えてください。",answers:["市場価格"],facts:["civ-27-f06"],direction:"direct-mechanism-to-term",skill:"市場経済",tag:"市場価格",explanation:"市場で需要と供給により調整される価格が市場価格です。"},
      {prompt:"労働者が労働組合をつくる権利を答えてください。",answers:["団結権"],facts:["civ-27-f07"],direction:"direct-description-to-right",skill:"労働三権",tag:"団結権",explanation:"労働組合をつくる権利が団結権です。"},
      {prompt:"銀行などを通じて家計の預金を企業へ貸し出す資金調達の方法を答えてください。",answers:["間接金融"],facts:["civ-27-f10"],direction:"direct-description-to-finance-type",skill:"金融のしくみ",tag:"間接金融",explanation:"金融機関を仲介する方法が間接金融です。"},
      {prompt:"日本の中央銀行を答えてください。",answers:["日本銀行","日銀"],facts:["civ-27-f13"],direction:"direct-role-to-institution",skill:"中央銀行",tag:"日本銀行",explanation:"日本の中央銀行は日本銀行です。"}
    ]
  });

  const civ28Taxes = {
    kind:"table",alt:"税を納める人と負担する人の関係で税を分類したオリジナル表",caption:"直接税と間接税を比較するオリジナル表",
    columns:["税","納める人と負担する人","例"],rows:[["A","同じ","所得税・法人税"],["B","異なる","消費税・酒税"]]
  };
  const civ28Cycle = {
    kind:"table",alt:"不景気と好景気に対する政府の財政政策を整理したオリジナル表",caption:"景気を調整する財政政策のオリジナル表",
    columns:["景気","減税・増税","公共投資"],rows:[["不景気","減税","増やす"],["好景気が過熱","増税","抑える"]]
  };
  const civ28Security = {
    kind:"diagram",width:380,height:235,alt:"社会保障の四分野を示すオリジナル図",caption:"社会保障制度の四分野を整理したオリジナル図",
    nodes:[{id:"s",x:132,y:8,width:116,height:48,label:"社会保障",emphasis:true},{id:"a",x:5,y:150,width:86,height:52,label:"社会保険"},{id:"b",x:99,y:150,width:86,height:52,label:"公的扶助"},{id:"c",x:193,y:150,width:86,height:52,label:"社会福祉"},{id:"d",x:287,y:150,width:86,height:52,label:"公衆衛生"}],edges:[{from:"s",to:"a"},{from:"s",to:"b"},{from:"s",to:"c"},{from:"s",to:"d"}]
  };
  unitSpecs.push({
    id:"civ-28",title:"国民生活と福祉",firstPage:56,
    rightPageFacts:["civ-28-f07","civ-28-f08","civ-28-f10","civ-28-f12","civ-28-f13","civ-28-f14","civ-28-f15"],
    core:[
      {prompt:"政府が税などで収入を得て、公共サービスなどに支出する活動はどれですか。",choices:["財政","金融","貿易","司法"],answer:0,facts:["civ-28-f01"],direction:"definition-to-term",skill:"財政",tag:"財政",explanation:"政府が歳入を得て歳出を行う経済活動を財政といいます。"},
      {prompt:"税を納める人と実際に負担する人が同じ税はどれですか。",choices:["直接税","間接税","地方債","公債"],answer:0,facts:["civ-28-f02"],direction:"description-to-tax-type",skill:"租税",tag:"直接税",explanation:"所得税のように納税者と負担者が同じ税を直接税といいます。"},
      {prompt:"消費者が負担し、事業者が納める消費税の分類はどれですか。",choices:["間接税","直接税","地方債","社会保険料"],answer:0,facts:["civ-28-f03"],direction:"case-to-tax-type",skill:"租税",tag:"間接税",explanation:"消費税は負担する消費者と納める事業者が異なるため間接税です。"},
      {prompt:"所得が多くなるほど段階的に高い税率を適用する仕組みはどれですか。",choices:["累進課税","比例代表","地方分権","価格統制"],answer:0,facts:["civ-28-f04"],direction:"description-to-tax-system",skill:"税の公平",tag:"累進課税",explanation:"負担能力に応じた税負担を求める仕組みが累進課税です。"},
      {prompt:"税収不足を補うため政府が発行する借金はどれですか。",choices:["公債","株式","預金","地方交付税"],answer:0,facts:["civ-28-f05"],direction:"description-to-term",skill:"財政",tag:"公債",explanation:"国債や地方債など、政府が資金を借りるために発行するものを公債といいます。"},
      {prompt:"物価が継続的に上昇する状態はどれですか。",choices:["インフレーション","デフレーション","スタグフレーションだけ","景気後退だけ"],answer:0,facts:["civ-28-f06"],direction:"description-to-term",skill:"物価",tag:"インフレーション",explanation:"物価が持続的に上昇することをインフレーションといいます。"},
      {prompt:"病気、老齢、失業、生活困窮などに備え、国民生活を支える制度全体はどれですか。",choices:["社会保障","国際分業","三権分立","地方債"],answer:0,facts:["civ-28-f07"],direction:"description-to-system",skill:"社会保障",tag:"社会保障",explanation:"社会保険、公的扶助、社会福祉、公衆衛生などからなる制度が社会保障です。"},
      {prompt:"生活に困窮する人に最低限度の生活を保障し、自立を助ける制度はどれですか。",choices:["生活保護","雇用保険だけ","国民年金だけ","裁判員制度"],answer:0,facts:["civ-28-f08"],direction:"description-to-system",skill:"公的扶助",tag:"生活保護",explanation:"生活保護は公的扶助の中心で、健康で文化的な最低限度の生活を保障し自立を助長します。"}
    ],
    challenge:[
      {prompt:"表のA・Bの組み合わせとして正しいものはどれですか。",choices:["A直接税・B間接税","A間接税・B直接税","A国税・B地方税","A公債・B租税"],answer:0,facts:["civ-28-f02","civ-28-f03"],direction:"table-to-tax-classification",skill:"税の分類",tag:"直接税・間接税",explanation:"納める人と負担する人が同じ税が直接税、異なる税が間接税です。",figure:civ28Taxes},
      {prompt:"表で不景気のときに減税や公共投資の増加を行う目的はどれですか。",choices:["家計や企業の支出を増やし景気を支えるため","需要をさらに減らすため","税収を必ずゼロにするため","裁判所の権限を強めるため"],answer:0,facts:["civ-28-f09"],direction:"table-to-fiscal-policy-purpose",skill:"景気調整",tag:"財政政策",explanation:"不景気時には減税や公共投資で需要を増やし、景気を支える財政政策がとられます。",figure:civ28Cycle},
      {prompt:"図で、年金・医療・介護・雇用など保険料を基礎に給付する分野はどれですか。",choices:["社会保険","公的扶助","社会福祉","公衆衛生"],answer:0,facts:["civ-28-f07","civ-28-f10"],direction:"diagram-to-security-field",skill:"社会保障の分類",tag:"社会保険",explanation:"年金保険、医療保険、介護保険、雇用保険などは社会保険に分類されます。",figure:civ28Security},
      {prompt:"累進課税が税負担の公平に結びつく理由として最も適切なものはどれですか。",choices:["所得が多い人ほど高い税率を適用し負担能力を考慮するから","全員が同じ金額だけを払うから","所得に関係なく税率を下げ続けるから","税を任意にするから"],answer:0,facts:["civ-28-f04"],direction:"tax-system-to-fairness",skill:"税の公平",tag:"累進課税",explanation:"所得などの負担能力に応じて負担を求める考え方を垂直的公平といいます。累進課税はその考えを反映します。"},
      {prompt:"道路、公園、学校などを政府が整備する主な理由はどれですか。",choices:["市場だけでは十分に供給されにくい公共施設・サービスだから","すべての企業活動を禁止するため","国民の選挙権を制限するため","裁判をなくすため"],answer:0,facts:["civ-28-f11"],direction:"public-goods-to-government-role",skill:"政府の役割",tag:"社会資本",explanation:"道路や公園などは多くの人が利用し、市場だけでは十分に整備されにくいため政府が社会資本として提供します。"},
      {prompt:"少子高齢化が進む社会保障の課題として最も適切なものはどれですか。",choices:["給付を受ける人が増える一方、支える現役世代が減る","社会保障が不要になる","高齢者の医療需要が必ず減る","税や保険料がすべてなくなる"],answer:0,facts:["civ-28-f07","civ-28-f12"],direction:"demography-to-security-challenge",skill:"社会保障の課題",tag:"少子高齢化",explanation:"高齢者が増え働く世代が減るため、給付と負担のバランスをどう持続させるかが課題です。"},
      {prompt:"四大公害病と主な原因の組み合わせとして正しいものはどれですか。",choices:["水俣病・新潟水俣病―有機水銀／イタイイタイ病―カドミウム／四日市ぜんそく―大気汚染","水俣病―カドミウム／イタイイタイ病―有機水銀／四日市ぜんそく―騒音","すべて二酸化炭素だけが原因","すべて自然災害で企業活動とは無関係"],answer:0,facts:["civ-28-f13"],direction:"pollution-disease-to-cause-comparison",skill:"四大公害病",tag:"四大公害病",explanation:"水俣病と新潟水俣病は有機水銀、イタイイタイ病はカドミウム、四日市ぜんそくは工場排煙による大気汚染が主な原因です。"},
      {prompt:"将来世代の必要も損なわず、環境・経済・社会を両立させる社会はどれですか。",choices:["持続可能な社会","大量生産だけの社会","中央集権社会","鎖国社会"],answer:0,facts:["civ-28-f14"],direction:"description-to-society",skill:"持続可能性",tag:"持続可能な社会",explanation:"現在の豊かさと将来世代の生活を両立させる考えが持続可能な社会です。"}
    ],
    final:[
      {prompt:"政府が税などで収入を得て、公共サービスなどに支出する活動を答えてください。",answers:["財政"],facts:["civ-28-f01"],direction:"direct-definition-to-term",skill:"財政",tag:"財政",explanation:"政府の収入と支出に関する活動が財政です。"},
      {prompt:"税を納める人と実際に負担する人が同じ税を答えてください。",answers:["直接税"],facts:["civ-28-f02"],direction:"direct-description-to-tax-type",skill:"租税",tag:"直接税",explanation:"所得税などが直接税です。"},
      {prompt:"税を納める人と実際に負担する人が異なる税を答えてください。",answers:["間接税"],facts:["civ-28-f03"],direction:"direct-description-to-tax-type",skill:"租税",tag:"間接税",explanation:"消費税などが間接税です。"},
      {prompt:"所得が多くなるほど段階的に税率を高くする仕組みを答えてください。",answers:["累進課税","累進課税制度"],facts:["civ-28-f04"],direction:"direct-description-to-tax-system",skill:"税の公平",tag:"累進課税",explanation:"負担能力を考慮する仕組みが累進課税です。"},
      {prompt:"物価が継続的に下落する状態を答えてください。",answers:["デフレーション","デフレ"],facts:["civ-28-f15"],direction:"direct-description-to-term",skill:"物価",tag:"デフレーション",explanation:"物価の持続的な下落をデフレーションといいます。"},
      {prompt:"病気や老齢、失業、困窮などに備えて国民生活を支える制度全体を答えてください。",answers:["社会保障","社会保障制度"],facts:["civ-28-f07"],direction:"direct-description-to-system",skill:"社会保障",tag:"社会保障",explanation:"生活上のリスクを社会全体で支える制度が社会保障です。"},
      {prompt:"生活に困窮する人の最低限度の生活を保障し、自立を助ける制度を答えてください。",answers:["生活保護","生活保護制度"],facts:["civ-28-f08"],direction:"direct-description-to-system",skill:"公的扶助",tag:"生活保護",explanation:"公的扶助の中心が生活保護です。"},
      {prompt:"将来世代の必要も損なわず、環境・経済・社会を両立させる社会を答えてください。",answers:["持続可能な社会"],facts:["civ-28-f14"],direction:"direct-description-to-society",skill:"持続可能性",tag:"持続可能な社会",explanation:"未来にも続けられる仕組みをもつ社会が持続可能な社会です。"}
    ]
  });

  const civ29UN = {
    kind:"table",alt:"国際連合の総会と安全保障理事会を比較するオリジナル表",caption:"国際連合の主要機関を比較するオリジナル表",
    columns:["機関","構成","主な特色"],rows:[["総会","全加盟国","一国一票"],["安全保障理事会","15か国","平和と安全に主要な責任"]]
  };
  const civ29Council = {
    kind:"diagram",width:380,height:220,alt:"安全保障理事会が常任理事国5か国と非常任理事国10か国で構成されることを示すオリジナル図",caption:"安全保障理事会の構成を示すオリジナル図",
    nodes:[{id:"s",x:126,y:10,width:128,height:48,label:"安全保障理事会\n15か国",emphasis:true},{id:"p",x:28,y:145,width:130,height:52,label:"常任理事国\n5か国・拒否権"},{id:"n",x:222,y:145,width:130,height:52,label:"非常任理事国\n10か国・任期2年"}],edges:[{from:"s",to:"p"},{from:"s",to:"n"}]
  };
  const civ29Issues = {
    kind:"table",alt:"地球規模の課題と国際協力の例を対応させたオリジナル表",caption:"地球的課題と対応を整理したオリジナル表",
    columns:["課題","協力の例"],rows:[["難民・地域紛争","UNHCR・PKO"],["貧困・開発","ODA・NGO"],["感染症","WHOを中心とする協力"],["教育・文化","UNESCOを中心とする協力"]]
  };
  unitSpecs.push({
    id:"civ-29",title:"国際社会と世界平和",firstPage:58,
    rightPageFacts:["civ-29-f07","civ-29-f08","civ-29-f11","civ-29-f12","civ-29-f13"],
    core:[
      {prompt:"国内を統治し、他国から支配されない最高の権力をもつ国はどれですか。",choices:["主権国家","地方公共団体","多国籍企業","国際NGO"],answer:0,facts:["civ-29-f01"],direction:"definition-to-state-type",skill:"国際社会",tag:"主権国家",explanation:"領域・国民・主権をもち、他国と対等な国を主権国家といいます。"},
      {prompt:"条約や国際慣習法など、国際社会のルールをまとめて何といいますか。",choices:["国際法","条例","政令","判例だけ"],answer:0,facts:["civ-29-f02"],direction:"examples-to-term",skill:"国際法",tag:"国際法",explanation:"国家間の関係を規律する条約や国際慣習法などを国際法といいます。"},
      {prompt:"第二次世界大戦後の1945年に設立された国際機関はどれですか。",choices:["国際連合","国際連盟","欧州連合","東南アジア諸国連合"],answer:0,facts:["civ-29-f03"],direction:"year-to-organization",skill:"国際連合",tag:"国際連合",explanation:"国際連合は1945年に設立され、平和と安全、人権、生活向上などを目的とします。"},
      {prompt:"国際連合で全加盟国が参加し、一国一票で審議する機関はどれですか。",choices:["総会","安全保障理事会","国際司法裁判所","事務局だけ"],answer:0,facts:["civ-29-f04"],direction:"description-to-organ",skill:"国際連合の機関",tag:"総会",explanation:"総会は全加盟国で構成され、各国が一票をもちます。"},
      {prompt:"国際平和と安全の維持に主要な責任を負う国際連合の機関はどれですか。",choices:["安全保障理事会","総会だけ","ユネスコ","国際労働機関"],answer:0,facts:["civ-29-f05"],direction:"responsibility-to-organ",skill:"国際連合の機関",tag:"安全保障理事会",explanation:"安全保障理事会は国際平和と安全の維持に主要な責任を負います。"},
      {prompt:"国際連合が紛争地域で停戦監視などを行う活動はどれですか。",choices:["平和維持活動（PKO）","政府開発援助（ODA）","国民審査","集団交渉"],answer:0,facts:["civ-29-f06"],direction:"description-to-activity",skill:"国際平和",tag:"PKO",explanation:"国連の平和維持活動、PKOは停戦監視や選挙支援などを行います。"},
      {prompt:"政府が開発途上国へ行う資金・技術などの援助はどれですか。",choices:["政府開発援助（ODA）","非政府組織（NGO）","国際分業","地方交付税"],answer:0,facts:["civ-29-f07"],direction:"description-to-assistance",skill:"国際協力",tag:"ODA",explanation:"政府による開発途上国への援助を政府開発援助、ODAといいます。"},
      {prompt:"政府から独立し、国際協力や人道支援などを行う民間団体はどれですか。",choices:["非政府組織（NGO）","国際連合総会","安全保障理事会","内閣"],answer:0,facts:["civ-29-f08"],direction:"description-to-organization",skill:"国際協力",tag:"NGO",explanation:"非政府組織、NGOは政府とは別の民間の立場から国際協力などを行います。"}
    ],
    challenge:[
      {prompt:"表から、安全保障理事会と総会の違いとして正しいものはどれですか。",choices:["総会は全加盟国、安全保障理事会は15か国で構成される","どちらも5か国だけで構成される","総会の常任理事国だけが拒否権をもつ","安全保障理事会は文化だけを扱う"],answer:0,facts:["civ-29-f04","civ-29-f05"],direction:"table-to-un-organs-comparison",skill:"国連機関比較",tag:"国際連合",explanation:"総会は全加盟国が一国一票で参加します。安全保障理事会は15か国で、平和と安全に主要な責任を負います。",figure:civ29UN},
      {prompt:"図で、実質事項の決議を成立しにくくする場合がある常任理事国の権限はどれですか。",choices:["拒否権","違憲審査権","国政調査権","直接請求権"],answer:0,facts:["civ-29-f05","civ-29-f09"],direction:"diagram-to-power",skill:"安全保障理事会",tag:"拒否権",explanation:"常任理事国は実質事項について拒否権をもち、一国でも反対すると決議が成立しない場合があります。",figure:civ29Council},
      {prompt:"表で、政府ではない民間団体が現地の人々と協力して開発・人道支援を行う場合に最も関係するものはどれですか。",choices:["NGO","ODAだけ","国民審査","国庫支出金"],answer:0,facts:["civ-29-f08"],direction:"table-to-cooperation-actor",skill:"国際協力",tag:"NGO",explanation:"民間の立場から国際協力を行う団体がNGOです。政府による援助はODAです。",figure:civ29Issues},
      {prompt:"沿岸国が水産資源や海底資源の調査・開発などについて権利をもつ、原則200海里までの海域はどれですか。",choices:["排他的経済水域（EEZ）","領海だけ","公海","接続水域だけ"],answer:0,facts:["civ-29-f14"],direction:"description-to-maritime-zone",skill:"領域と海洋",tag:"排他的経済水域",explanation:"排他的経済水域では沿岸国が水産資源や海底資源の探査・開発・管理などに主権的権利をもちます。領海とは異なり、他国船舶の航行は認められます。"},
      {prompt:"国家が自国領域内の問題に他国から干渉されない原則はどれですか。",choices:["内政不干渉の原則","多数決の原則","三審制","地方分権"],answer:0,facts:["civ-29-f10"],direction:"description-to-principle",skill:"国際社会の原則",tag:"内政不干渉",explanation:"主権には他国が国内問題へ不当に干渉しない内政不干渉の原則が含まれます。"},
      {prompt:"貿易や情報のつながりが強い現代に、一国だけで地球温暖化や感染症を解決しにくい理由はどれですか。",choices:["問題が国境を越えて影響し、国際協力が必要だから","国際法がすべての協力を禁じるから","国家に主権がないから","地域紛争が存在しないから"],answer:0,facts:["civ-29-f11"],direction:"global-problem-to-cooperation",skill:"地球的課題",tag:"国際協力",explanation:"環境、感染症、難民、貧困などは国境を越えるため、国家・国際機関・市民社会の協力が必要です。"},
      {prompt:"先進国と開発途上国の経済格差や貧困の問題を何といいますか。",choices:["南北問題","東西問題だけ","人口問題だけ","地方財政問題"],answer:0,facts:["civ-29-f12"],direction:"description-to-issue",skill:"国際経済",tag:"南北問題",explanation:"主に北半球の先進国と南側に多い開発途上国の格差を南北問題といいます。"},
      {prompt:"EUやASEANに共通する動きとして最も適切なものはどれですか。",choices:["地域の国々が協力・統合を進める","世界政府を一つにする","国際連合を廃止する","すべての国境を直ちになくす"],answer:0,facts:["civ-29-f13"],direction:"organizations-to-regional-integration",skill:"地域統合",tag:"地域主義",explanation:"EUやASEANは、近接する国々が経済や政治などで協力する地域的なまとまりです。"}
    ],
    final:[
      {prompt:"領域・国民・主権をもち、他国から支配されない国を答えてください。",answers:["主権国家"],facts:["civ-29-f01"],direction:"direct-definition-to-state-type",skill:"国際社会",tag:"主権国家",explanation:"国際社会の基本単位が主権国家です。"},
      {prompt:"条約や国際慣習法など、国家間を規律するルールを答えてください。",answers:["国際法"],facts:["civ-29-f02"],direction:"direct-examples-to-term",skill:"国際法",tag:"国際法",explanation:"国際社会のルールを国際法といいます。"},
      {prompt:"1945年に設立され、世界平和や生活向上を目指す国際機関を答えてください。",answers:["国際連合","国連"],facts:["civ-29-f03"],direction:"direct-year-to-organization",skill:"国際連合",tag:"国際連合",explanation:"第二次世界大戦後に設立されたのが国際連合です。"},
      {prompt:"国際連合で全加盟国が一国一票で参加する機関を答えてください。",answers:["総会","国連総会"],facts:["civ-29-f04"],direction:"direct-description-to-organ",skill:"国際連合の機関",tag:"総会",explanation:"全加盟国で構成される機関が総会です。"},
      {prompt:"国際連合で国際平和と安全の維持に主要な責任を負う機関を答えてください。",answers:["安全保障理事会","国連安全保障理事会","安保理"],facts:["civ-29-f05"],direction:"direct-responsibility-to-organ",skill:"国際連合の機関",tag:"安全保障理事会",explanation:"平和と安全を主に担当するのが安全保障理事会です。"},
      {prompt:"国連が紛争地域で停戦監視などを行う活動を答えてください。",answers:["平和維持活動","PKO","国連平和維持活動"],facts:["civ-29-f06"],direction:"direct-description-to-activity",skill:"国際平和",tag:"PKO",explanation:"国連の平和維持活動をPKOと略します。"},
      {prompt:"政府が開発途上国へ行う資金・技術援助を答えてください。",answers:["政府開発援助","ODA"],facts:["civ-29-f07"],direction:"direct-description-to-assistance",skill:"国際協力",tag:"ODA",explanation:"政府による援助がODAです。"},
      {prompt:"政府から独立し、国際協力などを行う民間団体を答えてください。",answers:["非政府組織","NGO"],facts:["civ-29-f08"],direction:"direct-description-to-organization",skill:"国際協力",tag:"NGO",explanation:"民間の国際協力団体をNGOといいます。"}
    ]
  });

  unitSpecs.forEach(registerUnit);
})();
