(function () {
  "use strict";

  const pack = {
    id: "social-author-drill",
    parentPackId: "term-2026-07-13",
    contentVersion: 2,
    title: "社会・作家と文学文化 80問特訓",
    shortTitle: "作家と文学文化80問",
    subject: "社会",
    focus: "古代から昭和の作家・歌人・文化人と作品",
    childIds: ["child-1"],
    sessionSize: 10,
    finalTimeLimitSeconds: 600,
    maxEnabled: false,
    tierCounts: {
      core: 30,
      challenge: 30,
      final: 20
    },
    tierLabels: {
      core: "人物と作品を結ぶ",
      challenge: "時代・社会背景まで考える",
      final: "全時代を横断して判断する"
    },
    subjectCounts: {
      core: { "社会": 30 },
      challenge: { "社会": 30 },
      final: { "社会": 20 },
      total: { "社会": 80 }
    },
    corners: [
      {
        id: "modern-core",
        label: "近現代コア",
        shortLabel: "近現代",
        description: "配布ワークの6人と入試頻出4人を、選択・関連理解・漢字記述で定着",
        tierCounts: { core: 10, challenge: 10, final: 10 },
        authorKeys: [
          "tsubouchi-shoyo", "futabatei-shimei", "higuchi-ichiyo", "mori-ogai",
          "natsume-soseki", "yosano-akiko", "ishikawa-takuboku", "shiga-naoya",
          "akutagawa-ryunosuke", "kobayashi-takiji"
        ]
      },
      {
        id: "classical",
        label: "古代〜江戸",
        shortLabel: "古代〜江戸",
        description: "国風文化、中世の随筆と能、元禄・化政文化を時代と結び付ける",
        tierCounts: { core: 10, challenge: 10 },
        authorKeys: [
          "ki-no-tsurayuki", "murasaki-shikibu", "sei-shonagon", "kamo-no-chomei",
          "yoshida-kenko", "zeami", "ihara-saikaku", "matsuo-basho",
          "chikamatsu-monzaemon", "motoori-norinaga", "sugita-genpaku",
          "jippensha-ikku", "kyokutei-bakin"
        ]
      },
      {
        id: "modern-extra",
        label: "近現代・追加",
        shortLabel: "近現代追加",
        description: "文明開化、自由民権、自然主義、白樺派、学問と昭和文化まで広げる",
        tierCounts: { core: 10, challenge: 10 },
        authorKeys: [
          "fukuzawa-yukichi", "nakae-chomin", "masaoka-shiki", "shimazaki-toson",
          "tayama-katai", "mushanokoji-saneatsu", "arishima-takeo", "yanagita-kunio",
          "nishida-kitaro", "kawabata-yasunari"
        ]
      },
      {
        id: "all-era-mix",
        label: "全時代ミックス",
        shortLabel: "全時代",
        description: "作品・人物・文化・時代を横断する、時間制限付きの総合10問",
        tierCounts: { final: 10 },
        authorKeys: []
      }
    ],
    unlock: {
      challengeEarly: { answered: 6, accuracy: 90 },
      challengeFull: { answered: 10, accuracy: 80 },
      final: { answered: 8, accuracy: 80 }
    },
    mix: {
      review: 0.5,
      unseen: 0.4,
      mastered: 0.1
    },
    mastery: {
      correctSessions: 2,
      cooldownAnswers: 5,
      distinctDirections: 2,
      distinctSessions: 2,
      requireInput: true,
      requireAuthorInput: true
    },
    copy: {
      eyebrow: "中3歴史の作家と文学文化を全時代で整理する",
      lead: "4コーナー80問で、33人の作家・歌人・文化人を作品、時代、社会背景と結び付けます。",
      privacy: "中3社会と高校入試の文化史をもとにしたオリジナル問題です。教材の設問や本文は転載していません。",
      startButton: "このコーナーを10問やる",
      reviewButton: "間違えた問題だけ",
      tierLead: {
        core: "まず、代表作から作家名を答えられるようにしよう。",
        challenge: "次は、作家と作品に加えて、時代や文学上の特色も確かめよう。",
        final: "作品・人物・時代・社会背景を横断して判断しよう。"
      },
      complete: "選んだコーナーを完走しました。間違えた人物と時代の組合せをもう一度確認しよう。"
    },
    studyGuide: {
      title: "作家・歌人・文化人33人",
      items: [
        {
          authorKey: "tsubouchi-shoyo",
          name: "坪内逍遥",
          acceptedAuthorSpellings: ["坪内逍遥", "坪内逍遙"],
          period: "明治",
          work: "『小説神髄』",
          cue: "近代文学の理論を示した"
        },
        {
          authorKey: "futabatei-shimei",
          name: "二葉亭四迷",
          period: "明治",
          work: "『浮雲』",
          cue: "言文一致体の小説"
        },
        {
          authorKey: "higuchi-ichiyo",
          name: "樋口一葉",
          period: "明治",
          work: "『たけくらべ』",
          cue: "明治期の女性文学者"
        },
        {
          authorKey: "mori-ogai",
          name: "森鷗外",
          acceptedAuthorSpellings: ["森鷗外", "森鴎外"],
          period: "明治",
          work: "『舞姫』",
          cue: "鷗・鴎のどちらの表記も可"
        },
        {
          authorKey: "natsume-soseki",
          name: "夏目漱石",
          period: "明治",
          work: "『坊っちゃん』",
          cue: "明治を代表する小説家"
        },
        {
          authorKey: "yosano-akiko",
          name: "与謝野晶子",
          period: "明治・日露戦争期",
          work: "『君死にたまふことなかれ』",
          cue: "旅順へ出兵した弟を案じる詩"
        },
        {
          authorKey: "ishikawa-takuboku",
          name: "石川啄木",
          period: "明治",
          work: "『一握の砂』",
          cue: "生活や心情を詠んだ短歌集"
        },
        {
          authorKey: "shiga-naoya",
          name: "志賀直哉",
          period: "白樺派（大正期を中心に活躍）",
          work: "『暗夜行路』",
          cue: "『暗夜行路』の連載は大正から昭和にまたがる"
        },
        {
          authorKey: "akutagawa-ryunosuke",
          name: "芥川龍之介",
          acceptedAuthorSpellings: ["芥川龍之介", "芥川竜之介"],
          period: "大正",
          work: "『羅生門』",
          cue: "古典を題材にした短編小説"
        },
        {
          authorKey: "kobayashi-takiji",
          name: "小林多喜二",
          period: "昭和初期",
          work: "『蟹工船』",
          cue: "プロレタリア文学"
        },
        {
          authorKey: "ki-no-tsurayuki",
          name: "紀貫之",
          acceptedAuthorSpellings: ["紀貫之"],
          period: "平安（国風文化）",
          work: "『土佐日記』",
          cue: "『古今和歌集』の選者の一人",
          requireAuthorInput: false
        },
        {
          authorKey: "murasaki-shikibu",
          name: "紫式部",
          acceptedAuthorSpellings: ["紫式部"],
          period: "平安（国風文化）",
          work: "『源氏物語』",
          cue: "平安時代の長編物語",
          requireAuthorInput: false
        },
        {
          authorKey: "sei-shonagon",
          name: "清少納言",
          acceptedAuthorSpellings: ["清少納言"],
          period: "平安（国風文化）",
          work: "『枕草子』",
          cue: "宮廷生活や四季の感覚を記した随筆",
          requireAuthorInput: false
        },
        {
          authorKey: "kamo-no-chomei",
          name: "鴨長明",
          acceptedAuthorSpellings: ["鴨長明"],
          period: "鎌倉初期",
          work: "『方丈記』",
          cue: "災害と乱世の中で無常観を記した随筆",
          requireAuthorInput: false
        },
        {
          authorKey: "yoshida-kenko",
          name: "兼好法師",
          acceptedAuthorSpellings: ["兼好法師", "吉田兼好"],
          period: "鎌倉末〜南北朝",
          work: "『徒然草』",
          cue: "日常の観察や人生観を記した随筆",
          requireAuthorInput: false
        },
        {
          authorKey: "zeami",
          name: "世阿弥",
          acceptedAuthorSpellings: ["世阿弥", "世阿彌"],
          period: "室町（北山文化）",
          work: "『風姿花伝』",
          cue: "観阿弥とともに能を大成",
          requireAuthorInput: false
        },
        {
          authorKey: "ihara-saikaku",
          name: "井原西鶴",
          acceptedAuthorSpellings: ["井原西鶴"],
          period: "元禄文化（江戸前期）",
          work: "『日本永代蔵』",
          cue: "町人の生活を描いた浮世草子",
          requireAuthorInput: false
        },
        {
          authorKey: "matsuo-basho",
          name: "松尾芭蕉",
          acceptedAuthorSpellings: ["松尾芭蕉"],
          period: "元禄文化（江戸前期）",
          work: "『おくのほそ道』",
          cue: "俳諧を芸術の境地へ高めた俳人",
          requireAuthorInput: false
        },
        {
          authorKey: "chikamatsu-monzaemon",
          name: "近松門左衛門",
          acceptedAuthorSpellings: ["近松門左衛門"],
          period: "元禄文化（江戸前期）",
          work: "『曽根崎心中』",
          cue: "人形浄瑠璃や歌舞伎の脚本を執筆",
          requireAuthorInput: false
        },
        {
          authorKey: "motoori-norinaga",
          name: "本居宣長",
          acceptedAuthorSpellings: ["本居宣長"],
          period: "江戸中〜後期（国学）",
          work: "『古事記伝』",
          cue: "『古事記』を研究した国学者",
          requireAuthorInput: false
        },
        {
          authorKey: "sugita-genpaku",
          name: "杉田玄白",
          acceptedAuthorSpellings: ["杉田玄白"],
          period: "江戸後期（蘭学）",
          work: "『解体新書』",
          cue: "前野良沢らと西洋の解剖書を翻訳",
          requireAuthorInput: false
        },
        {
          authorKey: "jippensha-ikku",
          name: "十返舎一九",
          acceptedAuthorSpellings: ["十返舎一九"],
          period: "化政文化（江戸後期）",
          work: "『東海道中膝栗毛』",
          cue: "弥次さんと喜多さんの旅を描いた滑稽本",
          requireAuthorInput: false
        },
        {
          authorKey: "kyokutei-bakin",
          name: "曲亭馬琴",
          acceptedAuthorSpellings: ["曲亭馬琴", "滝沢馬琴", "瀧澤馬琴"],
          period: "化政文化（江戸後期）",
          work: "『南総里見八犬伝』",
          cue: "勧善懲悪を主題とする長編読本",
          requireAuthorInput: false
        },
        {
          authorKey: "fukuzawa-yukichi",
          name: "福沢諭吉",
          acceptedAuthorSpellings: ["福沢諭吉", "福澤諭吉"],
          period: "明治初期（啓蒙思想）",
          work: "『学問のすゝめ』",
          cue: "文明開化期に独立自尊の考えを広めた",
          requireAuthorInput: false
        },
        {
          authorKey: "nakae-chomin",
          name: "中江兆民",
          acceptedAuthorSpellings: ["中江兆民"],
          period: "明治（自由民権運動）",
          work: "『民約訳解』",
          cue: "ルソーの思想を日本に紹介",
          requireAuthorInput: false
        },
        {
          authorKey: "masaoka-shiki",
          name: "正岡子規",
          acceptedAuthorSpellings: ["正岡子規"],
          period: "明治",
          work: "俳句・短歌の革新",
          cue: "写生を重視し、近代的な俳句と短歌を提唱",
          requireAuthorInput: false
        },
        {
          authorKey: "shimazaki-toson",
          name: "島崎藤村",
          acceptedAuthorSpellings: ["島崎藤村"],
          period: "明治",
          work: "『破戒』",
          cue: "自然主義文学の代表作の一つ",
          requireAuthorInput: false
        },
        {
          authorKey: "tayama-katai",
          name: "田山花袋",
          acceptedAuthorSpellings: ["田山花袋"],
          period: "明治",
          work: "『蒲団』",
          cue: "自然主義文学を代表する小説",
          requireAuthorInput: false
        },
        {
          authorKey: "mushanokoji-saneatsu",
          name: "武者小路実篤",
          acceptedAuthorSpellings: ["武者小路実篤", "武者小路實篤"],
          period: "大正（白樺派）",
          work: "『友情』",
          cue: "人道主義を重んじた白樺派の作家",
          requireAuthorInput: false
        },
        {
          authorKey: "arishima-takeo",
          name: "有島武郎",
          acceptedAuthorSpellings: ["有島武郎"],
          period: "大正（白樺派）",
          work: "『或る女』",
          cue: "白樺派に参加した小説家",
          requireAuthorInput: false
        },
        {
          authorKey: "yanagita-kunio",
          name: "柳田國男",
          acceptedAuthorSpellings: ["柳田國男", "柳田国男"],
          period: "明治〜昭和（民俗学）",
          work: "『遠野物語』",
          cue: "地域の伝承を調査し、日本民俗学を確立",
          requireAuthorInput: false
        },
        {
          authorKey: "nishida-kitaro",
          name: "西田幾多郎",
          acceptedAuthorSpellings: ["西田幾多郎"],
          period: "明治〜昭和（哲学）",
          work: "『善の研究』",
          cue: "西洋哲学と東洋思想を結び付けた哲学者",
          requireAuthorInput: false
        },
        {
          authorKey: "kawabata-yasunari",
          name: "川端康成",
          acceptedAuthorSpellings: ["川端康成"],
          period: "昭和",
          work: "『雪国』",
          cue: "1968年に日本人として初めてノーベル文学賞を受賞",
          requireAuthorInput: false
        }
      ]
    }
  };

  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
