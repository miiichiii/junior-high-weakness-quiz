(function () {
  "use strict";

  const PACK_ID = "science-ion-drill";
  const SOURCE_TAG = "science-ion-weakness-original-2026-07";
  const L1 = "L1 基礎復帰";
  const L2 = "L2 県立標準";
  const L3 = "L3 県立本番";

  function ionQuestion(question) {
    const tierDefaults = {
      core: {
        type: "choice",
        priority: "S",
        difficulty: L1,
        stage: "電解質の土台",
        formatTag: "短問"
      },
      challenge: {
        type: "choice",
        priority: "S",
        difficulty: L2,
        stage: "電極・電池の整理",
        formatTag: "短問"
      },
      final: {
        type: "input",
        priority: "A",
        difficulty: L3,
        stage: "式まで自力",
        formatTag: "直接入力"
      }
    };
    const defaults = tierDefaults[question.tier];
    if (!defaults) throw new Error(`Unknown science-ion tier: ${question.tier}`);
    return {
      childIds: ["child-1"],
      packId: PACK_ID,
      sourceTag: SOURCE_TAG,
      qualityStatus: "content-audited",
      contentStatus: "content-final",
      subject: "理科",
      unit: "水溶液とイオン",
      ...defaults,
      ...question,
      stage: defaults.stage
    };
  }

  const core = [
    ionQuestion({
      id: "science-ion-001", tier: "core", variantGroup: "ion-electrolyte-definition",
      examSkill: "電解質の定義", mistakeTags: ["用語", "電解質と非電解質"], skills: ["電解質", "電流"],
      prompt: "水に溶けたとき、その水溶液に電流が流れる物質を何といいますか。",
      choices: ["電解質", "非電解質", "溶媒", "指示薬"], answer: 0,
      explanation: "水に溶けると陽イオンと陰イオンに分かれ、水溶液に電流が流れる物質を電解質といいます。"
    }),
    ionQuestion({
      id: "science-ion-002", tier: "core", variantGroup: "ion-conductivity-sort",
      examSkill: "電流が流れる水溶液の判別", mistakeTags: ["物質の分類", "電解質と非電解質"], skills: ["食塩水", "電気伝導性"],
      prompt: "次の液体にステンレス電極を入れて同じ電圧を加えます。豆電球が点灯するものはどれですか。",
      choices: ["食塩水", "砂糖水", "エタノール水溶液", "精製水"], answer: 0,
      explanation: "食塩は水中でナトリウムイオンと塩化物イオンに分かれるため、食塩水には電流が流れます。"
    }),
    ionQuestion({
      id: "science-ion-003", tier: "core", variantGroup: "ion-nonelectrolyte-definition",
      examSkill: "非電解質の判別", mistakeTags: ["用語", "電解質と非電解質"], skills: ["非電解質", "砂糖"],
      prompt: "水に溶けても、その水溶液にほとんど電流が流れない物質はどれですか。",
      choices: ["砂糖", "塩化ナトリウム", "塩化水素", "水酸化ナトリウム"], answer: 0,
      explanation: "砂糖は水に溶けてもイオンに分かれない非電解質なので、砂糖水にはほとんど電流が流れません。"
    }),
    ionQuestion({
      id: "science-ion-004", tier: "core", variantGroup: "ion-current-mechanism",
      examSkill: "イオンと電流の関係説明", mistakeTags: ["粒子モデル", "理由説明"], skills: ["イオンの移動", "電流"],
      prompt: "電解質の水溶液に電流が流れる主な理由として正しいものはどれですか。",
      choices: ["水溶液中の陽イオンと陰イオンが移動するから", "水分子がすべて電子に変わるから", "溶質が必ず金属になるから", "水溶液の温度が必ず上がるから"], answer: 0,
      explanation: "電圧を加えると、陽イオンと陰イオンが互いに反対向きに移動して電気を運びます。"
    }),
    ionQuestion({
      id: "science-ion-005", tier: "core", variantGroup: "ion-nacl-equation",
      examSkill: "塩化ナトリウムの電離式", mistakeTags: ["イオン式", "電荷"], skills: ["Na⁺", "Cl⁻", "電離"],
      prompt: "塩化ナトリウムが水中で電離するようすを正しく表す式はどれですか。",
      choices: ["NaCl → Na⁺ + Cl⁻", "NaCl → Na⁻ + Cl⁺", "NaCl → Na²⁺ + 2Cl⁻", "NaCl → Na + Cl"], answer: 0,
      explanation: "塩化ナトリウムは、ナトリウムイオン Na⁺ と塩化物イオン Cl⁻ に1:1で電離します。"
    }),
    ionQuestion({
      id: "science-ion-006", tier: "core", variantGroup: "ion-hcl-equation",
      examSkill: "塩化水素の電離式", mistakeTags: ["イオン式", "電荷"], skills: ["H⁺", "Cl⁻", "電離"],
      prompt: "塩化水素が水中で電離するようすを、中学理科で用いる式として正しく表したものはどれですか。",
      choices: ["HCl → H⁺ + Cl⁻", "HCl → H⁻ + Cl⁺", "HCl → H₂ + Cl₂", "HCl → H + Cl"], answer: 0,
      explanation: "塩化水素は水中で、水素イオン H⁺ と塩化物イオン Cl⁻ に電離します。"
    }),
    ionQuestion({
      id: "science-ion-007", tier: "core", variantGroup: "ion-cucl2-equation",
      examSkill: "塩化銅の電離式", mistakeTags: ["係数", "電荷"], skills: ["Cu²⁺", "Cl⁻", "電離"],
      prompt: "塩化銅 CuCl₂ が水中で電離するようすを正しく表す式はどれですか。",
      choices: ["CuCl₂ → Cu²⁺ + 2Cl⁻", "CuCl₂ → Cu⁺ + Cl₂⁻", "CuCl₂ → 2Cu²⁺ + Cl⁻", "CuCl₂ → Cu + Cl₂"], answer: 0,
      explanation: "銅イオンは Cu²⁺ なので、電荷の合計を0にするには塩化物イオン Cl⁻ が2個必要です。"
    }),
    ionQuestion({
      id: "science-ion-008", tier: "core", variantGroup: "ion-cation-direction",
      examSkill: "陽イオンの移動方向", mistakeTags: ["陽極と陰極", "移動方向"], skills: ["陽イオン", "陰極"],
      prompt: "電気分解で、陽イオンが引かれて移動する電極はどれですか。",
      choices: ["電源の－極につないだ陰極", "電源の＋極につないだ陽極", "どちらの電極にも移動しない", "電源から離れた容器の中央"], answer: 0,
      explanation: "正の電気を帯びた陽イオンは、電源の－極につないだ陰極へ引かれます。"
    }),
    ionQuestion({
      id: "science-ion-009", tier: "core", variantGroup: "ion-anion-direction",
      examSkill: "陰イオンの移動方向", mistakeTags: ["陽極と陰極", "移動方向"], skills: ["陰イオン", "陽極"],
      prompt: "電気分解で、陰イオンが引かれて移動する電極はどれですか。",
      choices: ["電源の＋極につないだ陽極", "電源の－極につないだ陰極", "両方の電極へ同じ数ずつ", "電源装置の外側"], answer: 0,
      explanation: "負の電気を帯びた陰イオンは、電源の＋極につないだ陽極へ引かれます。"
    }),
    ionQuestion({
      id: "science-ion-010", tier: "core", variantGroup: "ion-electrode-change",
      examSkill: "電流と電極変化の関連付け", mistakeTags: ["実験結果", "理由説明"], skills: ["電極反応", "電解質"],
      prompt: "同じ電圧を加えたとき、電極付近で物質の変化が観察されやすいのはどちらですか。",
      choices: ["電流が流れる電解質の水溶液", "電流が流れない非電解質の水溶液", "どちらも必ず同じ", "水溶液を使わない空の容器"], answer: 0,
      explanation: "電流が流れる水溶液では、電極でイオンが電子を受け取ったり失ったりして、物質が生じます。"
    })
  ];

  const challenge = [
    ionQuestion({
      id: "science-ion-011", tier: "challenge", variantGroup: "ion-cucl2-cathode",
      examSkill: "陰極生成物の特定", mistakeTags: ["生成物", "陰極"], skills: ["塩化銅水溶液", "銅"],
      prompt: "炭素電極で塩化銅水溶液を電気分解しました。陰極に付着する赤色の物質は何ですか。",
      choices: ["銅", "塩素", "水素", "炭素"], answer: 0,
      explanation: "陰極では銅イオン Cu²⁺ が電子を受け取り、赤色の銅になります。"
    }),
    ionQuestion({
      id: "science-ion-012", tier: "challenge", variantGroup: "ion-cucl2-anode",
      examSkill: "陽極生成物の特定", mistakeTags: ["生成物", "陽極"], skills: ["塩化銅水溶液", "塩素"],
      prompt: "炭素電極で塩化銅水溶液を電気分解しました。陽極から発生する気体は何ですか。",
      choices: ["塩素", "酸素", "水素", "二酸化炭素"], answer: 0,
      explanation: "陽極では塩化物イオン Cl⁻ が電子を失い、塩素 Cl₂ が発生します。"
    }),
    ionQuestion({
      id: "science-ion-013", tier: "challenge", variantGroup: "ion-copper-reduction",
      examSkill: "陰極の反応式", mistakeTags: ["電子数", "還元"], skills: ["Cu²⁺", "電子を受け取る"],
      prompt: "塩化銅水溶液の電気分解で、陰極の変化を正しく表す式はどれですか。",
      choices: ["Cu²⁺ + 2e⁻ → Cu", "Cu → Cu²⁺ + 2e⁻", "2Cl⁻ → Cl₂ + 2e⁻", "2H⁺ + 2e⁻ → H₂"], answer: 0,
      explanation: "Cu²⁺ は陰極で電子を2個受け取って銅原子 Cu になります。電子を受け取る変化です。"
    }),
    ionQuestion({
      id: "science-ion-014", tier: "challenge", variantGroup: "ion-chloride-oxidation",
      examSkill: "陽極の反応式", mistakeTags: ["電子数", "酸化"], skills: ["Cl⁻", "電子を失う"],
      prompt: "塩化銅水溶液の電気分解で、陽極の変化を正しく表す式はどれですか。",
      choices: ["2Cl⁻ → Cl₂ + 2e⁻", "Cl₂ + 2e⁻ → 2Cl⁻", "Cu²⁺ + 2e⁻ → Cu", "2H⁺ + 2e⁻ → H₂"], answer: 0,
      explanation: "塩化物イオン2個が、それぞれ電子を1個ずつ失って塩素分子 Cl₂ になります。"
    }),
    ionQuestion({
      id: "science-ion-015", tier: "challenge", variantGroup: "ion-chlorine-test",
      examSkill: "塩素の性質による確認", mistakeTags: ["気体の性質", "実験考察"], skills: ["塩素", "漂白作用"],
      prompt: "塩化銅水溶液の陽極付近の液を、赤インクで着色した水に加えました。塩素が生じていたと判断できる変化はどれですか。",
      choices: ["赤色が薄くなる", "赤色が濃くなる", "青色に変わる", "必ず金属が沈む"], answer: 0,
      explanation: "塩素には色素を脱色する漂白作用があるため、赤インクの色が薄くなります。"
    }),
    ionQuestion({
      id: "science-ion-016", tier: "challenge", variantGroup: "ion-zinc-oxidation",
      examSkill: "亜鉛極の変化説明", mistakeTags: ["電子の受け渡し", "電池"], skills: ["Zn", "Zn²⁺", "電子"],
      prompt: "うすい塩酸に亜鉛板と銅板を入れて電池をつくると、亜鉛板が溶けました。亜鉛板で起こる変化はどれですか。",
      choices: ["Zn → Zn²⁺ + 2e⁻", "Zn²⁺ + 2e⁻ → Zn", "2H⁺ + 2e⁻ → H₂", "Cu → Cu²⁺ + 2e⁻"], answer: 0,
      explanation: "亜鉛原子 Zn は電子を2個失って亜鉛イオン Zn²⁺ になり、水溶液中へ溶け出します。"
    }),
    ionQuestion({
      id: "science-ion-017", tier: "challenge", variantGroup: "ion-hydrogen-reduction",
      examSkill: "銅極での水素発生説明", mistakeTags: ["電子数", "電池"], skills: ["H⁺", "H₂", "電子"],
      prompt: "うすい塩酸を用いた亜鉛板と銅板の電池で、銅板から水素が発生します。銅板付近で起こる変化はどれですか。",
      choices: ["2H⁺ + 2e⁻ → H₂", "H₂ → 2H⁺ + 2e⁻", "Zn → Zn²⁺ + 2e⁻", "2Cl⁻ → Cl₂ + 2e⁻"], answer: 0,
      explanation: "水素イオン H⁺ が銅板で電子を受け取り、水素原子を経て水素分子 H₂ になります。"
    }),
    ionQuestion({
      id: "science-ion-018", tier: "challenge", variantGroup: "ion-electron-direction",
      examSkill: "電子の移動方向", mistakeTags: ["向き", "電子と電流"], skills: ["電子", "亜鉛板から銅板"],
      prompt: "うすい塩酸を用いた亜鉛板と銅板の電池で、導線中の電子はどちらへ移動しますか。",
      choices: ["亜鉛板から銅板へ", "銅板から亜鉛板へ", "塩酸から電池の外へ", "電子は移動しない"], answer: 0,
      explanation: "亜鉛板で生じた電子が、外部の導線を通って銅板へ移動し、銅板側の反応に使われます。"
    }),
    ionQuestion({
      id: "science-ion-019", tier: "challenge", variantGroup: "ion-current-direction",
      examSkill: "電流の向き", mistakeTags: ["向き", "電子と電流"], skills: ["電流", "電子と反対"],
      prompt: "うすい塩酸を用いた亜鉛板と銅板の電池で、導線中の電流の向きはどれですか。",
      choices: ["銅板から亜鉛板へ", "亜鉛板から銅板へ", "両方向へ同時に", "水溶液の中だけを流れる"], answer: 0,
      explanation: "電流の向きは電子の移動方向と反対です。電子は亜鉛板から銅板へ動くので、電流は銅板から亜鉛板へ流れます。"
    }),
    ionQuestion({
      id: "science-ion-020", tier: "challenge", variantGroup: "ion-cell-polarity",
      examSkill: "電池の極の判定", mistakeTags: ["＋極と－極", "電子の受け渡し"], skills: ["銅板は＋極", "亜鉛板は－極"],
      prompt: "うすい塩酸を用いた亜鉛板と銅板の電池で、2枚の金属板の極の組み合わせとして正しいものはどれですか。",
      choices: ["亜鉛板が－極、銅板が＋極", "亜鉛板が＋極、銅板が－極", "両方とも＋極", "両方とも－極"], answer: 0,
      explanation: "電子を送り出す亜鉛板が－極、電子を受け取る側の銅板が＋極になります。"
    })
  ];

  const final = [
    ionQuestion({
      id: "science-ion-021", tier: "final", variantGroup: "ion-electrolyte-definition",
      examSkill: "電解質の用語再生", mistakeTags: ["用語", "自力再生"], skills: ["電解質", "直接入力"],
      prompt: "水に溶けたとき、その水溶液に電流が流れる物質を何といいますか。用語を入力しなさい。",
      answerText: ["電解質"], placeholder: "用語を入力",
      explanation: "答えは電解質です。水中で陽イオンと陰イオンに分かれるため、水溶液に電流が流れます。"
    }),
    ionQuestion({
      id: "science-ion-022", tier: "final", variantGroup: "ion-nonelectrolyte-definition",
      examSkill: "非電解質の用語再生", mistakeTags: ["用語", "自力再生"], skills: ["非電解質", "直接入力"],
      prompt: "水に溶けても、その水溶液にほとんど電流が流れない物質を何といいますか。用語を入力しなさい。",
      answerText: ["非電解質"], placeholder: "用語を入力",
      explanation: "答えは非電解質です。砂糖やエタノールは、水に溶けてもイオンに分かれません。"
    }),
    ionQuestion({
      id: "science-ion-023", tier: "final", variantGroup: "ion-cucl2-equation",
      examSkill: "塩化銅の電離式を自力で書く", mistakeTags: ["係数", "電荷"], skills: ["CuCl₂", "電離式", "直接入力"],
      prompt: "塩化銅 CuCl₂ の電離式を入力しなさい。イオンの右上の符号は、Cu2+、Cl-のように入力してかまいません。",
      answerText: ["CuCl2→Cu2++2Cl-", "CuCl2->Cu2++2Cl-", "CuCl2=Cu2++2Cl-", "CuCl₂→Cu²⁺+2Cl⁻"],
      placeholder: "例: CuCl2→…",
      explanation: "電離式は CuCl₂ → Cu²⁺ + 2Cl⁻ です。銅イオン1個に対し、塩化物イオンは2個です。"
    }),
    ionQuestion({
      id: "science-ion-024", tier: "final", variantGroup: "ion-cucl2-cathode",
      examSkill: "陰極生成物の自力再生", mistakeTags: ["生成物", "陰極"], skills: ["塩化銅水溶液", "銅", "直接入力"],
      prompt: "塩化銅水溶液を炭素電極で電気分解したとき、陰極に付着する物質名を入力しなさい。",
      answerText: ["銅", "どう", "Cu"], placeholder: "物質名を入力",
      explanation: "陰極に付着する物質は銅 Cu です。Cu²⁺ が電子を2個受け取って銅原子になります。"
    }),
    ionQuestion({
      id: "science-ion-025", tier: "final", variantGroup: "ion-cucl2-anode",
      examSkill: "陽極生成物の自力再生", mistakeTags: ["生成物", "陽極"], skills: ["塩化銅水溶液", "塩素", "直接入力"],
      prompt: "塩化銅水溶液を炭素電極で電気分解したとき、陽極から発生する気体名を入力しなさい。",
      answerText: ["塩素", "えんそ", "Cl2", "Cl₂"], placeholder: "気体名を入力",
      explanation: "陽極から発生する気体は塩素 Cl₂ です。Cl⁻ が電子を失って生じます。"
    }),
    ionQuestion({
      id: "science-ion-026", tier: "final", variantGroup: "ion-electron-particle",
      examSkill: "亜鉛原子が失う粒子の特定", mistakeTags: ["電子", "粒子モデル"], skills: ["亜鉛", "電子", "直接入力"],
      prompt: "電池の亜鉛板で、亜鉛原子が亜鉛イオンになるときに2個失う粒子は何ですか。",
      answerText: ["電子", "でんし", "e-", "e⁻"], placeholder: "粒子名を入力",
      explanation: "失う粒子は電子です。変化は Zn → Zn²⁺ + 2e⁻ と表せます。"
    }),
    ionQuestion({
      id: "science-ion-027", tier: "final", variantGroup: "ion-hydrogen-electron-count",
      examSkill: "水素発生時の電子数", mistakeTags: ["電子数", "係数"], skills: ["H⁺", "H₂", "電子数"],
      prompt: "2個の水素イオンが水素分子 H₂ になるとき、受け取る電子は合計何個ですか。数字で入力しなさい。",
      answerText: ["2", "2個", "二個", "2こ"], placeholder: "数字を入力",
      explanation: "合計2個です。2H⁺ + 2e⁻ → H₂ と表します。"
    }),
    ionQuestion({
      id: "science-ion-028", tier: "final", variantGroup: "ion-hcl-electrolysis-equation",
      examSkill: "塩酸の電気分解の化学反応式", mistakeTags: ["化学反応式", "係数"], skills: ["HCl", "H₂", "Cl₂", "直接入力"],
      prompt: "塩酸を電気分解したときの化学反応式を入力しなさい。矢印は「→」または「->」で入力できます。",
      answerText: ["2HCl→H2+Cl2", "2HCl->H2+Cl2", "2HCl=H2+Cl2", "2HCl→H₂+Cl₂"],
      placeholder: "2HCl→…",
      explanation: "化学反応式は 2HCl → H₂ + Cl₂ です。陰極で水素、陽極で塩素が発生します。"
    }),
    ionQuestion({
      id: "science-ion-029", tier: "final", variantGroup: "ion-hcl-gas-ratio",
      examSkill: "発生気体の体積比", mistakeTags: ["係数比", "気体の体積"], skills: ["水素", "塩素", "体積比"],
      prompt: "塩酸の電気分解で発生する水素と塩素の体積比を、「水素:塩素」の順に入力しなさい。",
      answerText: ["1:1", "1対1", "1たい1", "1：1"], placeholder: "水素:塩素",
      explanation: "反応式 2HCl → H₂ + Cl₂ から、発生する水素と塩素の物質量の比は1:1で、同温・同圧なら体積比も1:1です。"
    }),
    ionQuestion({
      id: "science-ion-030", tier: "final", variantGroup: "ion-chlorine-solubility",
      examSkill: "捕集量が少ない理由説明", mistakeTags: ["発生量と捕集量", "理由説明"], skills: ["塩素", "水への溶解"],
      prompt: "塩酸の電気分解で、発生量は水素と等しいのに集めた塩素の体積が小さくなる主な理由を、「塩素が」に続けて入力しなさい。",
      answerText: ["水に溶けるから", "水に溶けやすいから", "水にとけるから", "水にとけやすいから"],
      placeholder: "塩素が…",
      explanation: "塩素は水に溶けるため、発生した一部が水に溶け、気体として集められる体積が水素より小さくなります。"
    })
  ];

  window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
  window.QUIZ_QUESTIONS.push(...core, ...challenge, ...final);
})();
