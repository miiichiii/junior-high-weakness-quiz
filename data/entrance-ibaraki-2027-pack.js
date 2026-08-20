(function () {
  const CHILD_1 = ["child-1"];
  const SOURCE_TAG = "ibaraki-r9-shimotsuma1-phase1-2026-05-24";
  const L1 = "L1 基礎復帰";
  const L2 = "L2 県立標準";
  const L3 = "L3 県立本番";
  const L4 = "L4 安全圏チャレンジ";

  function priorityForDifficulty(difficulty) {
    if (difficulty === L1 || difficulty === L2) return "S";
    if (difficulty === L3) return "A";
    return "B";
  }

  function tagged(question) {
    const difficulty = question.difficulty || L2;
    return {
      ...question,
      childIds: CHILD_1.slice(),
      priority: question.priority || priorityForDifficulty(difficulty),
      difficulty,
      stage: question.stage || difficulty,
      formatTag: question.formatTag || "短問",
      mistakeTags: question.mistakeTags || ["知識不足"],
      sourceTag: question.sourceTag || SOURCE_TAG,
      qualityStatus: question.qualityStatus || "metadata-audited",
      contentStatus: question.contentStatus || "content-draft"
    };
  }

  function questionType(question) {
    return question.type || "choice";
  }

  function inferLegacyDifficulty(question) {
    if (question.priority === "S") return question.subject === "数学" ? L1 : L2;
    if (question.priority === "A") return L2;
    if (question.priority === "B") return L3;
    return L1;
  }

  function inferLegacyExamSkill(question) {
    const unit = question.unit || "";
    if (question.subject === "数学") {
      if (/方程式|連立|式/.test(unit)) return "計算処理・立式";
      if (/関数|比例|反比例/.test(unit)) return "関数の式と読み取り";
      if (/図形|合同|円|多角形|空間|作図/.test(unit)) return "図形の条件整理";
      if (/データ/.test(unit)) return "資料・データ活用";
      return "数学基礎";
    }
    if (question.subject === "理科") return "知識確認・実験考察";
    if (question.subject === "社会") return "用語確認・資料読取";
    if (question.subject === "英語") return "文法・語順";
    if (question.subject === "国語") return "語句・読解";
    return "基礎確認";
  }

  function inferLegacyFormat(question) {
    const type = questionType(question);
    if (type === "manipulate") return "操作型";
    if (type === "input") return "直接入力";
    if (type === "find-error") return "ミス発見";
    return "短問";
  }

  function inferLegacyMistakes(question) {
    const unit = question.unit || "";
    if (question.subject === "数学") {
      if (/方程式|連立/.test(unit)) return ["計算ミス", "移項ミス", "立式"];
      if (/関数/.test(unit)) return ["条件整理", "読み違い"];
      if (/図形|合同|円|空間/.test(unit)) return ["図を描けない", "条件整理"];
      return ["計算ミス", "条件整理"];
    }
    if (question.subject === "理科") return ["知識不足", "資料読取"];
    if (question.subject === "社会") return ["知識不足", "資料読取"];
    if (question.subject === "英語") return ["語順", "読み違い"];
    if (question.subject === "国語") return ["根拠不足", "読み違い"];
    return ["知識不足"];
  }

  function auditLegacyQuestion(question) {
    const assignedChildren = Array.isArray(question.childIds)
      ? question.childIds
      : (question.childId ? [question.childId] : CHILD_1);
    const difficulty = question.difficulty || inferLegacyDifficulty(question);
    return {
      ...question,
      childIds: assignedChildren,
      difficulty,
      examSkill: question.examSkill || inferLegacyExamSkill(question),
      formatTag: question.formatTag || inferLegacyFormat(question),
      mistakeTags: question.mistakeTags || inferLegacyMistakes(question),
      sourceTag: question.sourceTag || "2026-04-mock-derived-original",
      qualityStatus: question.qualityStatus || "metadata-audited",
      contentStatus: question.contentStatus || "content-draft",
      auditNote: question.auditNote || "2026-05-24 子供1用メタデータ監査済み。内容監査は継続。"
    };
  }

  function linearText(a, b) {
    const first = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
    if (b === 0) return first;
    return `${first} ${b > 0 ? "+" : "-"} ${Math.abs(b)}`;
  }

  function signed(value) {
    return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
  }

  function choicesWithAnswer(answer, distractors) {
    const values = [answer, ...distractors].map(String);
    return Array.from(new Set(values)).slice(0, 4);
  }

  function answerIndex(choices, answer) {
    return choices.indexOf(String(answer));
  }

  function buildLinearEquationQuestions() {
    const cases = [
      [3, 4, 6], [2, -5, 9], [5, -3, 4], [4, 7, 8], [6, -2, 5], [7, 9, 3],
      [3, -8, 10], [8, 5, 2], [9, -6, 4], [4, -11, 7], [5, 12, -2], [6, -15, 6],
      [7, -4, -3], [2, 13, -5], [9, 18, -1], [3, 10, -4], [8, -9, 5], [5, -20, 9]
    ];
    return cases.map(([a, b, x], index) => {
      const right = a * x + b;
      return tagged({
        id: `r9-math-eq-input-${String(index + 1).padStart(3, "0")}`,
        type: "input",
        subject: "数学",
        unit: "方程式",
        difficulty: L1,
        examSkill: "計算処理",
        formatTag: "短問",
        mistakeTags: ["計算ミス", "移項ミス"],
        prompt: `方程式 ${linearText(a, b)} = ${right} を解きなさい。`,
        answerText: [`x=${x}`, String(x)],
        placeholder: "xの値を入力",
        explanation: `${b === 0 ? "" : `両辺から${b}を移して `}${a}x = ${a * x}。両辺を${a}で割ると x = ${x} です。`
      });
    });
  }

  function buildManipulateQuestions() {
    const cases = [
      [5, -3, 2, 6], [7, 4, 3, 5], [6, -8, 2, 4], [8, 5, 3, -2], [9, -7, 4, 3],
      [4, 11, -2, 6], [10, -9, 5, 2], [3, -14, -1, 7], [6, 13, -2, -3], [8, -5, 1, 4]
    ];
    return cases.map(([a, b, d, x], index) => {
      const e = (a - d) * x + b;
      return tagged({
        id: `r9-math-eq-manipulate-${String(index + 1).padStart(3, "0")}`,
        type: "manipulate",
        subject: "数学",
        unit: "方程式",
        difficulty: L1,
        examSkill: "移項・係数処理",
        formatTag: "操作型",
        mistakeTags: ["移項ミス", "符号ミス", "計算ミス"],
        prompt: `式を動かして、方程式 ${linearText(a, b)} = ${linearText(d, e)} を解きなさい。`,
        left: [{ id: "l1", coef: a, type: "x" }, { id: "l2", coef: b, type: "const" }],
        right: [{ id: "r1", coef: d, type: "x" }, { id: "r2", coef: e, type: "const" }],
        explanation: `${d}xを左辺へ、${b}を右辺へ移して ${(a - d)}x = ${(a - d) * x}。よって x = ${x} です。`
      });
    });
  }

  function buildSystemQuestions() {
    const cases = [
      [5, 2], [6, 1], [4, -1], [7, 3], [2, 5], [-2, 6], [8, -3],
      [9, 4], [-1, 7], [3, -4], [10, -2], [6, -5], [-3, 2], [1, 8]
    ];
    return cases.map(([x, y], index) => tagged({
      id: `r9-math-system-input-${String(index + 1).padStart(3, "0")}`,
      type: "input",
      subject: "数学",
      unit: "連立方程式",
      difficulty: L2,
      examSkill: "連立方程式の処理",
      formatTag: "直接入力",
      mistakeTags: ["消去ミス", "計算ミス", "条件整理"],
      prompt: `連立方程式 x + y = ${x + y}, x - y = ${x - y} を解きなさい。`,
      answerText: [`x=${x},y=${y}`, `y=${y},x=${x}`, `${x},${y}`],
      placeholder: "xとyの値を入力",
      explanation: `2つの式を足すと 2x = ${2 * x} なので x = ${x}。x + y = ${x + y} に入れて y = ${y} です。`
    }));
  }

  const algebraQuestions = [
    ["r9-math-alg-001", "式の計算", L1, "3a + 2(4a - 5) を計算するとどうなりますか。", ["11a - 10", "7a - 10", "11a + 10", "5a - 10"], 0, "2(4a - 5)=8a-10。3a+8a-10=11a-10です。", ["分配法則", "同類項"]],
    ["r9-math-alg-002", "式の計算", L1, "5x - 2(3x - 4) を計算するとどうなりますか。", ["-x + 8", "11x - 8", "-x - 8", "2x + 4"], 0, "5x - 6x + 8 = -x + 8です。", ["符号ミス", "分配法則"]],
    ["r9-math-alg-003", "式の値", L1, "a = -2 のとき、3a² - 4a の値はいくつですか。", ["4", "20", "8", "-20"], 1, "a²=4なので3a²=12、-4a=8。合計20です。", ["代入ミス", "符号ミス"]],
    ["r9-math-alg-004", "平方根", L2, "√75 を簡単にするとどうなりますか。", ["5√3", "25√3", "3√5", "15√5"], 0, "75=25×3なので、√75=5√3です。", ["平方根ミス"]],
    ["r9-math-alg-005", "平方根", L2, "√12 + √27 を簡単にするとどうなりますか。", ["5√3", "√39", "13√3", "3√5"], 0, "√12=2√3、√27=3√3。合計5√3です。", ["平方根ミス", "同類項"]],
    ["r9-math-alg-006", "因数分解", L2, "x² + 7x + 12 を因数分解するとどうなりますか。", ["(x+3)(x+4)", "(x+2)(x+6)", "(x-3)(x-4)", "(x+1)(x+12)"], 0, "和が7、積が12になる2数は3と4です。", ["公式忘れ"]],
    ["r9-math-alg-007", "因数分解", L2, "4x² - 9 を因数分解するとどうなりますか。", ["(2x-3)(2x+3)", "(4x-3)(x+3)", "(2x-9)(2x+1)", "(x-3)(4x+3)"], 0, "a²-b²=(a-b)(a+b)を使い、(2x)²-3²です。", ["公式忘れ"]],
    ["r9-math-alg-008", "2次方程式", L2, "x² - 5x + 6 = 0 の解はどれですか。", ["x=2,3", "x=-2,-3", "x=1,6", "x=-1,-6"], 0, "(x-2)(x-3)=0なので x=2,3 です。", ["因数分解", "符号ミス"]],
    ["r9-math-alg-009", "2次方程式", L2, "x² = 49 の解はどれですか。", ["x=7", "x=-7", "x=±7", "x=49"], 2, "平方根をとると正負の両方があり、x=±7です。", ["平方根ミス"]],
    ["r9-math-alg-010", "式の計算", L1, "(2x + 3y) - (5x - y) を計算するとどうなりますか。", ["-3x + 4y", "7x + 2y", "-3x + 2y", "3x + 4y"], 0, "かっこを外すと2x+3y-5x+y。まとめて-3x+4yです。", ["符号ミス", "同類項"]],
    ["r9-math-alg-011", "式の計算", L1, "6ab ÷ 3a を計算するとどうなりますか。", ["2b", "2a", "3b", "18a²b"], 0, "6abを3aで割ると、係数は2、aは消えて2bです。", ["文字式処理"]],
    ["r9-math-alg-012", "平方根", L2, "√2 × √18 を計算するとどうなりますか。", ["6", "√36", "20", "3√2"], 0, "√2×√18=√36=6です。", ["平方根ミス"]],
    ["r9-math-alg-013", "因数分解", L2, "x² - 8x + 16 を因数分解するとどうなりますか。", ["(x-4)²", "(x+4)²", "(x-2)(x-8)", "(x-16)(x+1)"], 0, "x²-8x+16 は 4² と -8x から (x-4)² です。", ["公式忘れ"]],
    ["r9-math-alg-014", "2次方程式", L3, "x² + 2x - 15 = 0 の解はどれですか。", ["x=3,-5", "x=-3,5", "x=1,-15", "x=-1,15"], 0, "(x+5)(x-3)=0なので x=-5,3 です。", ["因数分解", "符号ミス"]],
    ["r9-math-alg-015", "規則性", L3, "1番目に3個、2番目に5個、3番目に7個の点を並べる。n番目の点の数はどれですか。", ["2n+1", "3n", "n+2", "2n-1"], 0, "3,5,7,... は2ずつ増えるので、n番目は2n+1です。", ["規則性", "文字式説明"]]
  ].map(([id, unit, difficulty, prompt, choices, answer, explanation, mistakeTags]) => tagged({
    id, subject: "数学", unit, difficulty, examSkill: unit, formatTag: difficulty === L3 ? "複合" : "短問", mistakeTags, prompt, choices, answer, explanation
  }));

  const functionQuestions = [
    ["r9-math-func-001", L1, "一次関数 y = 3x - 2 で、x = 4 のとき y はいくつですか。", ["10", "12", "14", "8"], 0, "y=3×4-2=10です。", "代入"],
    ["r9-math-func-002", L2, "点 (2,5), (4,11) を通る直線の傾きはいくつですか。", ["3", "2", "6", "1/3"], 0, "yの増加量は6、xの増加量は2なので傾きは3です。", "変化の割合"],
    ["r9-math-func-003", L2, "一次関数 y = ax + 1 が点 (3,10) を通るとき、a はいくつですか。", ["3", "4", "2", "9"], 0, "10=3a+1 なので 3a=9、a=3です。", "式の決定"],
    ["r9-math-func-004", L2, "y は x に比例し、x=6 のとき y=18。x=4 のとき y はいくつですか。", ["12", "14", "10", "24"], 0, "比例定数は18÷6=3。y=3xなので x=4 で12です。", "比例"],
    ["r9-math-func-005", L2, "y は x に反比例し、x=3 のとき y=8。x=6 のとき y はいくつですか。", ["4", "6", "12", "16"], 0, "xy=24なので、x=6なら y=4です。", "反比例"],
    ["r9-math-func-006", L3, "一次関数 y = -2x + 7 で、y が1から-5まで変わるとき、xの増加量はいくつですか。", ["3", "-3", "6", "2"], 0, "yの変化量は-6。変化の割合が-2なので、xの増加量は3です。", "変域"],
    ["r9-math-func-007", L2, "直線 y = 2x + b が点 (1,5) を通るとき、b はいくつですか。", ["3", "2", "5", "7"], 0, "5=2×1+b なので b=3です。", "切片"],
    ["r9-math-func-008", L3, "点A(0,2), B(4,10) を通る直線と、y軸との交点の座標はどれですか。", ["(0,2)", "(2,0)", "(0,10)", "(4,0)"], 0, "x=0のときの点がy軸との交点なので(0,2)です。", "グラフ読取"],
    ["r9-math-func-009", L2, "y = 1/2 x + 3 で、x が2増えると y はいくつ増えますか。", ["1", "2", "3", "4"], 0, "傾きが1/2なので、xが2増えると y は1増えます。", "変化の割合"],
    ["r9-math-func-010", L3, "直線 y = x + 2 と y = -x + 8 の交点のx座標はいくつですか。", ["3", "4", "5", "6"], 0, "x+2=-x+8 より2x=6、x=3です。", "関数と方程式"],
    ["r9-math-func-011", L3, "兄は家から毎分80m、弟は同じ道を毎分60mで歩く。兄が5分後に出発したとき、弟に追いつくのは兄の出発から何分後ですか。", ["15分後", "20分後", "10分後", "25分後"], 0, "弟の先行距離は60×5=300m。差は毎分20mなので300÷20=15分です。", "一次関数の利用"],
    ["r9-math-func-012", L4, "水そうに毎分3Lで水を入れる。最初に12L入っているとき、x分後の水量yを表す式と、30Lになる時刻の組み合わせはどれですか。", ["y=3x+12, 6分後", "y=12x+3, 6分後", "y=3x+12, 10分後", "y=3x-12, 14分後"], 0, "y=3x+12。30=3x+12 から x=6です。", "立式"],
    ["r9-math-func-013", L3, "二次関数 y = x² で、x が -3 から 2 まで変わるとき、yの値の範囲として正しいものはどれですか。", ["0以上9以下", "4以上9以下", "-3以上2以下", "0以上4以下"], 0, "x=0を含むので最小は0、端点では9と4なので最大は9です。", "二次関数の変域"],
    ["r9-math-func-014", L4, "二次関数 y = ax² が点 (2,12) を通る。x=-3 のとき y はいくつですか。", ["27", "-27", "18", "36"], 0, "12=4aなのでa=3。x=-3なら y=3×9=27です。", "二次関数の式"]
  ].map(([id, difficulty, prompt, choices, answer, explanation, skill]) => tagged({
    id, subject: "数学", unit: skill.includes("二次") ? "2次関数" : "1次関数", difficulty, examSkill: skill, formatTag: difficulty === L4 ? "複合" : "短問", mistakeTags: ["条件整理", "立式"], prompt, choices, answer, explanation
  }));

  const geometryQuestions = [
    ["r9-math-geo-001", "図形", L1, "三角形の内角が 45°, 65° のとき、残りの角は何度ですか。", ["70°", "80°", "90°", "100°"], 0, "三角形の内角の和は180°。180-45-65=70°です。", "角度"],
    ["r9-math-geo-002", "多角形", L2, "正八角形の1つの内角は何度ですか。", ["135°", "120°", "140°", "150°"], 0, "外角は360÷8=45°。内角は180-45=135°です。", "多角形"],
    ["r9-math-geo-003", "合同", L2, "三角形の合同条件に含まれないものはどれですか。", ["3組の角がそれぞれ等しい", "3組の辺がそれぞれ等しい", "2組の辺とその間の角が等しい", "1組の辺とその両端の角が等しい"], 0, "3組の角だけでは相似は言えても合同とは限りません。", "証明"],
    ["r9-math-geo-004", "相似", L3, "相似比が2:3の図形で、小さい図形の面積が20cm²なら、大きい図形の面積は何cm²ですか。", ["45", "30", "60", "90"], 0, "面積比は相似比の2乗で4:9。20×9/4=45です。", "相似"],
    ["r9-math-geo-005", "円", L2, "円の接線と、接点を通る半径の関係として正しいものはどれですか。", ["垂直である", "平行である", "必ず同じ長さ", "角度は45°"], 0, "円の接線は接点を通る半径に垂直です。", "円"],
    ["r9-math-geo-006", "三平方", L2, "直角三角形で直角をはさむ2辺が6cm, 8cmのとき、斜辺は何cmですか。", ["10", "12", "14", "8"], 0, "6²+8²=36+64=100。斜辺は10cmです。", "三平方"],
    ["r9-math-geo-007", "空間図形", L3, "底面積が24cm²、高さが5cmの三角柱の体積は何cm³ですか。", ["120", "60", "29", "240"], 0, "柱の体積は底面積×高さ。24×5=120cm³です。", "空間図形"],
    ["r9-math-geo-008", "作図", L2, "線分ABの垂直二等分線上にある点Pについて、必ず成り立つことはどれですか。", ["PA=PB", "PA=AB", "PB=AB", "∠PAB=90°"], 0, "垂直二等分線上の点は、両端A,Bからの距離が等しいです。", "作図"],
    ["r9-math-geo-009", "図形", L3, "平行な2直線に1本の直線が交わるとき、同位角が68°なら錯角は何度ですか。", ["68°", "112°", "34°", "90°"], 0, "平行線では同位角も錯角も等しいので68°です。", "角度"],
    ["r9-math-geo-010", "合同", L3, "証明で「AB=DC, AC=DB, BCは共通」から言える三角形の合同条件はどれですか。", ["3組の辺がそれぞれ等しい", "2組の辺とその間の角", "1組の辺とその両端の角", "直角三角形の斜辺と1辺"], 0, "3つの辺の対応がすべて等しいので、3組の辺がそれぞれ等しい条件です。", "証明"],
    ["r9-math-geo-011", "相似", L3, "相似な三角形で対応する辺が 6cm と 9cm。小さい三角形の周の長さが20cmなら、大きい三角形の周は何cmですか。", ["30", "27", "40", "45"], 0, "長さの比は6:9=2:3。周の長さも2:3なので20×3/2=30です。", "相似"],
    ["r9-math-geo-012", "円", L4, "同じ弧に対する円周角が35°のとき、その弧に対する中心角は何度ですか。", ["70°", "35°", "105°", "140°"], 0, "中心角は同じ弧に対する円周角の2倍です。", "円"],
    ["r9-math-geo-013", "図形", L4, "底辺が12cm、高さが7cmの三角形と面積が等しい長方形で、横が14cmなら縦は何cmですか。", ["3", "6", "12", "7"], 0, "三角形の面積は12×7÷2=42。長方形の縦は42÷14=3cmです。", "等積変形"],
    ["r9-math-geo-014", "三平方", L3, "正方形の対角線が 10√2 cm のとき、1辺の長さは何cmですか。", ["10", "20", "5√2", "10√2"], 0, "正方形の対角線は1辺×√2。10√2÷√2=10です。", "三平方"],
    ["r9-math-geo-015", "図形", L4, "証明問題で、図に印がない角の等しさを使いたい。最初に確認すべき根拠として最も適切なのはどれですか。", ["平行線・円周角・共通角などの定理から言えるか", "見た目で等しそうか", "選択肢に同じ角があるか", "長さが近いか"], 0, "証明では見た目ではなく、平行線、円周角、共通角などの根拠が必要です。", "証明"]
  ].map(([id, unit, difficulty, prompt, choices, answer, explanation, skill]) => tagged({
    id, subject: "数学", unit, difficulty, examSkill: skill, formatTag: difficulty === L4 ? "複合" : "短問", mistakeTags: ["図を描けない", "条件整理"], prompt, choices, answer, explanation
  }));

  const dataQuestions = [
    ["r9-math-data-001", L1, "5, 7, 7, 8, 13 の中央値はいくつですか。", ["7", "8", "5", "13"], 0, "小さい順に並んだ5個の中央は3番目の7です。", "中央値"],
    ["r9-math-data-002", L2, "2, 4, 5, 9 の平均値はいくつですか。", ["5", "4", "6", "20"], 0, "(2+4+5+9)÷4=5です。", "平均"],
    ["r9-math-data-003", L2, "箱ひげ図で箱の左端が第1四分位数、右端が第3四分位数を表すとき、箱の幅が表すものはどれですか。", ["四分位範囲", "平均値", "最大値", "最頻値"], 0, "第3四分位数-第1四分位数が四分位範囲です。", "箱ひげ図"],
    ["r9-math-data-004", L2, "赤3個、白2個の玉から1個取り出す。赤が出る確率はどれですか。", ["3/5", "2/5", "1/3", "3/2"], 0, "全部で5個、そのうち赤は3個なので3/5です。", "確率"],
    ["r9-math-data-005", L3, "サイコロを1回投げて、3の倍数の目が出る確率はどれですか。", ["1/3", "1/2", "1/6", "2/3"], 0, "3の倍数は3,6の2通り。2/6=1/3です。", "確率"],
    ["r9-math-data-006", L3, "資料Aの平均は70点、資料Bの平均は同じ70点。散らばりを比べるのに最も適切なものはどれですか。", ["範囲や四分位範囲", "合計点だけ", "人数を無視した最大値", "最初の1人の点"], 0, "平均が同じなら、範囲や四分位範囲で散らばりを比べます。", "資料活用"],
    ["r9-math-data-007", L4, "5人の得点が 62, 68, 70, 75, 85。70点を80点に直すと変わらない値はどれですか。", ["中央値", "平均値", "範囲", "合計"], 0, "中央の値は70から75に? 並べ直すと62,68,75,80,85なので中央値は75に変わります。変わらないのは範囲23です。", "データ判断", 2]
  ].map(([id, difficulty, prompt, choices, answer, explanation, skill, answerOverride]) => tagged({
    id, subject: "数学", unit: "データの活用", difficulty, examSkill: skill, formatTag: difficulty === L3 || difficulty === L4 ? "資料読取" : "短問", mistakeTags: ["読み違い", "資料読取"], prompt, choices, answer: answerOverride ?? answer, explanation
  }));

  const scienceQuestions = [
    ["r9-sci-force-001", "力", L1, "ばねに10gのおもりをつるすと2cm伸びた。同じばねに30gのおもりをつるすと伸びは何cmですか。", ["6cm", "3cm", "12cm", "20cm"], 0, "ばねの伸びは力の大きさに比例します。3倍の重さなので伸びも3倍で6cmです。", "計算"],
    ["r9-sci-force-002", "力", L2, "机の上の本にはたらく重力とつり合っている力はどれですか。", ["机が本を押し返す力", "本が机を押す力", "本が地球を引く力", "摩擦力"], 0, "本には下向きの重力と、机から受ける上向きの垂直抗力がはたらきます。", "力のつり合い"],
    ["r9-sci-force-003", "力", L3, "台車の速さを記録タイマーで調べたら、打点の間隔がしだいに広がった。この台車の運動として正しいものはどれですか。", ["速くなっている", "遅くなっている", "止まっている", "一定の速さ"], 0, "同じ時間ごとの距離が大きくなるので、速さは大きくなっています。", "実験考察"],
    ["r9-sci-current-001", "電流と電圧", L1, "抵抗が5Ωの電熱線に2Aの電流が流れるとき、電圧は何Vですか。", ["10V", "2.5V", "7V", "3V"], 0, "オームの法則 V=RI より、5×2=10Vです。", "計算"],
    ["r9-sci-current-002", "電流と電圧", L2, "同じ抵抗を2個直列につなぐと、全体の抵抗はどうなりますか。", ["大きくなる", "小さくなる", "0になる", "変わらない"], 0, "直列では抵抗の和になるので大きくなります。", "回路"],
    ["r9-sci-current-003", "電流と磁界", L3, "コイルに電流を流すと磁界ができる。磁界を強くする方法として適切でないものはどれですか。", ["コイルの巻数を減らす", "電流を大きくする", "鉄しんを入れる", "コイルの巻数を増やす"], 0, "巻数を減らすと磁界は弱くなります。", "実験考察"],
    ["r9-sci-chem-001", "化学変化", L1, "鉄と硫黄を加熱してできる黒い物質はどれですか。", ["硫化鉄", "酸化銅", "塩化ナトリウム", "炭酸水素ナトリウム"], 0, "鉄と硫黄が化合して硫化鉄ができます。", "知識"],
    ["r9-sci-chem-002", "化学変化", L2, "銅を加熱すると質量が増えた。理由として正しいものはどれですか。", ["酸素と結びついたから", "銅が蒸発したから", "水が抜けたから", "銅が軽くなったから"], 0, "銅が空気中の酸素と結びつき、酸化銅になるため質量が増えます。", "理由説明"],
    ["r9-sci-chem-003", "水溶液", L2, "食塩水100gに食塩が12g含まれる。この食塩水の質量パーセント濃度は何%ですか。", ["12%", "10.7%", "88%", "8%"], 0, "溶質12g÷水溶液100g×100=12%です。", "化学計算"],
    ["r9-sci-chem-004", "水溶液", L3, "水50gに食塩10gを溶かした。質量パーセント濃度として最も近いものはどれですか。", ["16.7%", "20%", "10%", "25%"], 0, "水溶液は60g。10÷60×100=16.7%です。", "化学計算"],
    ["r9-sci-chem-005", "イオン", L3, "塩化銅水溶液を電気分解したとき、陰極に付着する物質はどれですか。", ["銅", "塩素", "水素", "酸素"], 0, "陽イオンの銅イオンが陰極で電子を受け取り、銅になります。", "イオン"],
    ["r9-sci-bio-001", "人体", L1, "刺激を受け取る目や耳などを何といいますか。", ["感覚器官", "運動器官", "消化器官", "排出器官"], 0, "外界からの刺激を受け取る器官を感覚器官といいます。", "知識"],
    ["r9-sci-bio-002", "人体", L2, "消化された養分を主に吸収する器官はどれですか。", ["小腸", "胃", "食道", "大腸"], 0, "小腸の柔毛から養分が吸収されます。", "知識"],
    ["r9-sci-bio-003", "植物", L2, "蒸散が主に行われる場所はどれですか。", ["葉の気孔", "根の先端", "茎の中心", "花弁"], 0, "蒸散は葉の気孔から水蒸気が出る現象です。", "知識"],
    ["r9-sci-bio-004", "遺伝", L3, "減数分裂で生殖細胞の染色体数はどうなりますか。", ["半分になる", "2倍になる", "変わらない", "0になる"], 0, "受精で元の数に戻るため、生殖細胞では染色体数が半分になります。", "知識"],
    ["r9-sci-earth-001", "地震", L1, "地震のゆれが最初に発生した地下の点を何といいますか。", ["震源", "震央", "初期微動", "主要動"], 0, "地下で地震が発生した点を震源といいます。", "知識"],
    ["r9-sci-earth-002", "火山", L2, "マグマが急に冷えてできた岩石の特徴として正しいものはどれですか。", ["結晶が小さい", "結晶が大きい", "必ず白い", "層になる"], 0, "急に冷えると結晶が十分成長せず小さくなります。", "知識"],
    ["r9-sci-earth-003", "地層", L3, "離れた地層を比べるとき、火山灰の層が手がかりになる理由はどれですか。", ["広い範囲に同時期に積もりやすいから", "必ず厚さが同じだから", "必ず海でできるから", "化石を含まないから"], 0, "火山灰は短期間に広い範囲へ積もりやすく、同じ時期の目印になります。", "資料読取"],
    ["r9-sci-weather-001", "天気", L2, "湿度を求めるときに使う量として正しいものはどれですか。", ["空気中の水蒸気量と飽和水蒸気量", "気圧と風向", "気温と震度", "雲量と透明度"], 0, "湿度は空気中の水蒸気量が飽和水蒸気量の何%かで表します。", "知識"],
    ["r9-sci-weather-002", "天気", L3, "寒冷前線が通過するときに起こりやすい天気の変化はどれですか。", ["短時間の強い雨の後、気温が下がる", "長時間弱い雨の後、気温が上がる", "晴れが続き気温が上がる", "必ず雪になる"], 0, "寒冷前線では積乱雲が発達しやすく、通過後は寒気が入ります。", "天気図"],
    ["r9-sci-astro-001", "天体", L2, "地球が太陽のまわりを回る運動を何といいますか。", ["公転", "自転", "日周運動", "月食"], 0, "地球が太陽のまわりを回ることを公転といいます。", "知識"],
    ["r9-sci-astro-002", "天体", L3, "夏の南の空にさそり座が見えやすい理由として適切なものはどれですか。", ["地球の公転で夜に向く方向が季節で変わるから", "星が地球の周りを1年で回るから", "夏だけ星が明るくなるから", "太陽がさそり座を照らすから"], 0, "季節で見える星座が変わる主な理由は地球の公転です。", "理由説明"],
    ["r9-sci-exp-001", "実験操作", L3, "実験で条件を1つだけ変え、ほかを同じにする理由はどれですか。", ["原因と結果を比べやすくするため", "結果を速く出すため", "器具を少なくするため", "計算をなくすため"], 0, "条件を1つだけ変えると、その条件が結果に与える影響を調べられます。", "実験考察"],
    ["r9-sci-exp-002", "実験操作", L3, "表: 加える質量10gで伸び2cm、20gで4cm、30gで6cm。この実験から言えることはどれですか。", ["伸びは質量に比例する", "伸びは質量に反比例する", "伸びは一定", "30gで初めて伸びる"], 0, "質量が2倍、3倍になると伸びも2倍、3倍なので比例です。", "資料読取"],
    ["r9-sci-exp-003", "実験操作", L4, "水溶液を加熱して結晶を取り出す実験で、完全に乾かす前に火を止める理由として最も適切なのはどれですか。", ["飛び散りや分解を防ぐため", "濃度を0%にするため", "水を増やすため", "必ず気体を集めるため"], 0, "加熱しすぎると飛び散ったり物質が変化したりするため、余熱で乾かします。", "実験操作"],
    ["r9-sci-calc-001", "化学変化", L4, "マグネシウム3.0gを燃焼させると酸素2.0gと結びついた。できた酸化マグネシウムは何gですか。", ["5.0g", "3.0g", "2.0g", "1.0g"], 0, "質量保存の法則より、3.0g+2.0g=5.0gです。", "化学計算"],
    ["r9-sci-graph-001", "電流と電圧", L4, "表: 電圧2Vで電流0.4A、4Vで0.8A。この抵抗の大きさは何Ωですか。", ["5Ω", "2Ω", "0.2Ω", "10Ω"], 0, "R=V/I。2÷0.4=5Ωです。", "グラフ読取"],
    ["r9-sci-graph-002", "天気", L3, "乾湿計で乾球と湿球の差が大きいほど、一般に空気の状態はどうなりますか。", ["乾いている", "湿っている", "気圧が高い", "風がない"], 0, "湿球の水が蒸発しやすいほど差が大きく、空気は乾いています。", "資料読取"],
    ["r9-sci-review-001", "総合", L4, "理科の記述問題で、結果だけを書いて減点されやすい答えはどれですか。", ["理由や根拠を書いていない答え", "単位をつけた答え", "条件をそろえた答え", "表の数値を使った答え"], 0, "記述では結果だけでなく、条件・数値・理由を結びつける必要があります。", "記述説明"]
  ].map(([id, unit, difficulty, prompt, choices, answer, explanation, skill]) => tagged({
    id, subject: "理科", unit, difficulty, examSkill: skill, formatTag: /表|グラフ|実験|記述|計算/.test(prompt + skill) ? "資料読取" : "短問", mistakeTags: ["知識不足", "資料読取", "条件整理"], prompt, choices, answer, explanation
  }));

  const socialQuestions = [
    ["r9-soc-geo-001", "日本地理", L1, "日本の標準時子午線は東経何度ですか。", ["135度", "140度", "120度", "150度"], 0, "日本の標準時子午線は東経135度です。", "地図"],
    ["r9-soc-geo-002", "日本地理", L2, "冬に日本海側で雪が多い主な理由はどれですか。", ["季節風が日本海で水蒸気を含むから", "太平洋側から乾いた風が吹くから", "赤道に近いから", "偏西風がないから"], 0, "冬の北西季節風が日本海で水蒸気を含み、山地を越えるとき雪を降らせます。", "気候"],
    ["r9-soc-geo-003", "日本地理", L2, "雨温図で冬の降水量が多く、夏より冬に降水が目立つ地域として最も考えやすいのはどれですか。", ["日本海側", "瀬戸内", "南西諸島", "中央高地"], 0, "冬の日本海側は雪や雨が多くなります。", "雨温図"],
    ["r9-soc-geo-004", "世界地理", L2, "プランテーション農業の説明として正しいものはどれですか。", ["熱帯地域で輸出用作物を大規模に栽培する農業", "家族だけで自給用の米を作る農業", "都市で野菜を少量作る農業", "寒帯でトナカイを飼う農業"], 0, "プランテーションは熱帯地域で輸出用作物を大規模栽培する農業です。", "産業"],
    ["r9-soc-geo-005", "世界地理", L3, "表: A国は原油輸出が多く乾燥帯、B国は米生産が多く季節風。A国として最も考えやすい地域はどれですか。", ["西アジア", "東南アジア", "西ヨーロッパ", "オセアニア"], 0, "乾燥帯で原油輸出が多い地域は西アジアが代表です。", "資料読取"],
    ["r9-soc-geo-006", "世界地理", L3, "南半球の国で、羊毛や鉄鉱石の輸出が多い国として最も適切なのはどれですか。", ["オーストラリア", "カナダ", "ドイツ", "エジプト"], 0, "オーストラリアは羊毛や鉄鉱石などの輸出が多い国です。", "資料読取"],
    ["r9-soc-his-001", "古代", L1, "聖徳太子が定めたとされる役人の心構えはどれですか。", ["十七条の憲法", "御成敗式目", "武家諸法度", "五箇条の御誓文"], 0, "十七条の憲法は役人の心構えを示したものです。", "歴史用語"],
    ["r9-soc-his-002", "古代", L2, "奈良時代の文化で、東大寺正倉院に残る国際色豊かな文化を何といいますか。", ["天平文化", "国風文化", "元禄文化", "化政文化"], 0, "奈良時代の国際色豊かな文化は天平文化です。", "文化"],
    ["r9-soc-his-003", "中世", L2, "鎌倉幕府が御家人の裁判の基準として定めた法令はどれですか。", ["御成敗式目", "大宝律令", "武家諸法度", "版籍奉還"], 0, "御成敗式目は鎌倉幕府の武士の法律です。", "歴史用語"],
    ["r9-soc-his-004", "中世", L3, "次の出来事を古い順に並べたものはどれですか。承久の乱、元寇、建武の新政", ["承久の乱→元寇→建武の新政", "元寇→承久の乱→建武の新政", "建武の新政→承久の乱→元寇", "承久の乱→建武の新政→元寇"], 0, "承久の乱は1221年、元寇は1274年・1281年、建武の新政は1334年からです。", "歴史整序"],
    ["r9-soc-his-005", "近世", L2, "豊臣秀吉が農民から武器を取り上げた政策はどれですか。", ["刀狩", "太閤検地", "参勤交代", "地租改正"], 0, "刀狩により農民の一揆を防ぎ、兵農分離を進めました。", "政策"],
    ["r9-soc-his-006", "近世", L3, "江戸幕府が大名を統制するため、大名に江戸と領地を往復させた制度はどれですか。", ["参勤交代", "楽市楽座", "班田収授法", "廃藩置県"], 0, "参勤交代は大名統制策で、費用負担により大名の力を抑えました。", "政策"],
    ["r9-soc-his-007", "近代", L2, "明治政府が藩をなくして府県を置いた改革はどれですか。", ["廃藩置県", "版籍奉還", "地租改正", "徴兵令"], 0, "廃藩置県により中央政府が全国を直接治める仕組みを強めました。", "政策"],
    ["r9-soc-his-008", "近代", L3, "日清戦争後、日本が下関条約で得たものとして正しいものはどれですか。", ["台湾", "南樺太", "満州国", "朝鮮半島全体"], 0, "下関条約で日本は台湾などを得ました。", "条約"],
    ["r9-soc-his-009", "現代", L3, "第二次世界大戦後、日本国憲法が施行された年はどれですか。", ["1947年", "1945年", "1951年", "1964年"], 0, "日本国憲法は1947年5月3日に施行されました。", "年代"],
    ["r9-soc-civ-001", "公民", L1, "日本国憲法の三原則に含まれるものはどれですか。", ["国民主権", "富国強兵", "殖産興業", "鎖国"], 0, "三原則は国民主権、基本的人権の尊重、平和主義です。", "憲法"],
    ["r9-soc-civ-002", "公民", L2, "国会の主な仕事として正しいものはどれですか。", ["法律をつくる", "裁判を行う", "条例だけをつくる", "外国とだけ交渉する"], 0, "国会は国の唯一の立法機関です。", "政治"],
    ["r9-soc-civ-003", "公民", L2, "内閣の仕事として正しいものはどれですか。", ["行政を担当する", "違憲審査だけを行う", "法律を最終的に裁く", "地方議会を解散する"], 0, "内閣は行政権を担当します。", "政治"],
    ["r9-soc-civ-004", "公民", L3, "需要が増え、供給が変わらないとき、一般に価格はどうなりますか。", ["上がりやすい", "下がりやすい", "必ず0円になる", "変わらない"], 0, "需要が増えると、同じ供給量に対して買いたい人が増えるため価格は上がりやすくなります。", "経済"],
    ["r9-soc-civ-005", "公民", L3, "地方自治で、住民が首長や議員をやめさせる請求を何といいますか。", ["解職請求", "条例制定請求", "監査請求", "国民審査"], 0, "解職請求はリコールとも呼ばれます。", "地方自治"],
    ["r9-soc-civ-006", "公民", L4, "衆議院が参議院より優越する理由として最も適切なのはどれですか。", ["任期が短く解散もあり、民意を反映しやすいから", "人数が必ず多いから", "裁判官を選ぶから", "地方公共団体だから"], 0, "衆議院は任期が短く解散があるため、より新しい民意を反映しやすいとされます。", "制度比較"],
    ["r9-soc-map-001", "資料読取", L3, "地形図で等高線の間隔が狭い場所は、地形としてどう考えられますか。", ["傾斜が急", "傾斜がゆるい", "必ず海", "必ず平野"], 0, "等高線の間隔が狭いほど、短い距離で高さが変わるので傾斜が急です。", "地図"],
    ["r9-soc-map-002", "資料読取", L3, "人口ピラミッドで高齢者の割合が大きい形から読み取れる課題として適切なのはどれですか。", ["社会保障費の増加", "乳幼児だけの増加", "工業原料の増加", "降水量の増加"], 0, "高齢者の割合が大きいと医療・年金・介護など社会保障の負担が大きくなります。", "統計"],
    ["r9-soc-map-003", "資料読取", L4, "雨温図で年中高温、夏に降水量が多く冬に乾燥する地域の気候として最も近いものはどれですか。", ["サバナ気候", "西岸海洋性気候", "冷帯", "ツンドラ気候"], 0, "年中高温で雨季と乾季がある特徴はサバナ気候です。", "雨温図"],
    ["r9-soc-mix-001", "総合", L4, "産業革命が進んだ後、欧米諸国がアジアやアフリカへ進出した理由として最も適切なのはどれですか。", ["原料や市場を求めたから", "稲作だけを広めるため", "鎖国を守るため", "人口を必ず減らすため"], 0, "工業製品の市場と原料を求めて海外進出が強まりました。", "因果説明"],
    ["r9-soc-mix-002", "総合", L4, "資料問題で、グラフの数値と本文の説明が食い違うとき、最初にすべきことはどれですか。", ["単位・年度・割合か実数かを確認する", "本文だけを信じる", "グラフだけを信じる", "選択肢を見ずに飛ばす"], 0, "資料読取では、単位、年度、割合か実数かの違いで判断が変わります。", "資料読取"],
    ["r9-soc-review-001", "総合", L3, "歴史の並べ替え問題で最も有効な確認方法はどれですか。", ["時代名と代表人物・制度を結びつける", "文字数で選ぶ", "知らない語句を最後にする", "近そうなものを勘で選ぶ"], 0, "時代、人物、制度をセットにすると前後関係を判断しやすくなります。", "歴史整序"],
    ["r9-soc-review-002", "総合", L4, "公民の理由記述で減点されやすい答えはどれですか。", ["制度名だけで理由がない答え", "根拠と結論がある答え", "資料の数値を使った答え", "条件に合う語句を入れた答え"], 0, "理由記述では、制度名だけでなく、なぜそうなるかを因果で書く必要があります。", "記述説明"],
    ["r9-soc-review-003", "資料読取", L3, "表で割合が増えていても実数が減っている可能性がある。最初に確認することはどれですか。", ["母数と単位", "文字の大きさ", "表の色", "選択肢の順番"], 0, "割合だけでは全体量が分かりません。母数と単位を確認してから判断します。", "統計"]
  ].map(([id, unit, difficulty, prompt, choices, answer, explanation, skill]) => tagged({
    id, subject: "社会", unit, difficulty, examSkill: skill, formatTag: /表|資料|雨温図|人口|地形図|理由|並べ/.test(prompt + skill) ? "資料読取" : "短問", mistakeTags: ["知識不足", "資料読取", "年代整序"], prompt, choices, answer, explanation
  }));

  const englishQuestions = [
    ["r9-eng-grammar-001", "文法", L1, "空所に入る語として正しいものはどれですか。She ( ) tennis yesterday.", ["played", "plays", "playing", "play"], 0, "yesterday があるので過去形 played を使います。", "時制"],
    ["r9-eng-grammar-002", "文法", L1, "空所に入る語として正しいものはどれですか。I have ( ) in Ibaraki for three years.", ["lived", "live", "living", "lives"], 0, "have + 過去分詞で現在完了を作ります。", "現在完了"],
    ["r9-eng-order-001", "語順", L2, "「私は何をすべきかわからない」に最も近い英文はどれですか。", ["I don't know what to do.", "I don't know what do.", "I know don't what to do.", "What to do I don't know."], 0, "疑問詞+to不定詞で what to do と表せます。", "語順"],
    ["r9-eng-order-002", "語順", L2, "「これはケンによって作られた机です」に最も近い英文はどれですか。", ["This is a desk made by Ken.", "This is a desk making Ken.", "This desk by Ken made.", "This is Ken made desk."], 0, "過去分詞 made by Ken が desk を後ろから説明します。", "分詞"],
    ["r9-eng-read-001", "長文", L2, "英文: Mika went to the library because she wanted to find a book about stars. Why did Mika go to the library?", ["To find a book about stars.", "To play tennis.", "To meet her uncle.", "To buy lunch."], 0, "because の後に理由が書かれています。", "理由把握"],
    ["r9-eng-read-002", "長文", L3, "英文: Tom missed the bus, so he called his mother. She said, \"Walk to the station. It takes only ten minutes.\" What did his mother tell him to do?", ["Walk to the station.", "Wait for the bus.", "Go back home.", "Call his teacher."], 0, "母は Walk to the station と言っています。", "会話文"],
    ["r9-eng-read-003", "長文", L3, "英文: Aya started using a notebook to write three new English words every day. After one month, she could read stories faster. What helped Aya?", ["Writing new words every day.", "Stopping reading stories.", "Watching TV every day.", "Changing schools."], 0, "毎日3語を書く習慣が読む速さにつながったと読み取れます。", "内容一致"],
    ["r9-eng-listen-001", "リスニング代替", L2, "聞き取り想定: You will hear, \"The train leaves at seven thirty.\" 正しい時刻はどれですか。", ["7:30", "7:13", "6:30", "8:30"], 0, "seven thirty は7時30分です。", "時刻"],
    ["r9-eng-listen-002", "リスニング代替", L2, "聞き取り想定: \"Please bring your science notebook tomorrow.\" 持ってくるものはどれですか。", ["理科のノート", "数学の教科書", "昼食", "運動靴"], 0, "science notebook は理科のノートです。", "要点把握"],
    ["r9-eng-write-001", "英作文", L3, "「私はサッカーをするために早く起きました」に最も近い英文はどれですか。", ["I got up early to play soccer.", "I got up early playing soccer.", "I get up early played soccer.", "I early got up soccer."], 0, "目的は to play soccer で表します。", "英作文"],
    ["r9-eng-write-002", "英作文", L3, "「もし明日雨なら、私は家にいます」に最も近い英文はどれですか。", ["If it rains tomorrow, I will stay home.", "If it will rain tomorrow, I stay home.", "Rain tomorrow if I stay home.", "If it rain tomorrow, I stayed home."], 0, "if節では未来の内容でも現在形 rains を使います。", "条件文"],
    ["r9-eng-vocab-001", "語句", L1, "次の語の意味として正しいものはどれですか。environment", ["環境", "招待", "歴史", "実験"], 0, "environment は環境という意味です。", "語彙"],
    ["r9-eng-vocab-002", "語句", L1, "次の語の意味として正しいものはどれですか。experience", ["経験", "説明", "季節", "約束"], 0, "experience は経験という意味です。", "語彙"],
    ["r9-eng-dialog-001", "会話文", L3, "A: May I use your pen? B: ( ) 空所に最も自然なものはどれですか。", ["Sure. Here you are.", "No, I am a pen.", "It is raining.", "I went there yesterday."], 0, "依頼への返答なので Sure. Here you are. が自然です。", "会話表現"],
    ["r9-eng-dialog-002", "会話文", L3, "A: How long have you lived here? B: ( ) 空所に最も自然なものはどれですか。", ["For five years.", "At five o'clock.", "Five meters.", "By bus."], 0, "How long は期間をたずねる表現です。", "会話表現"],
    ["r9-eng-read-004", "資料付き読解", L4, "英文: The table says the museum opens at 9:00 and closes at 17:00. Ken arrives at 16:30. How much time can he stay?", ["30 minutes", "1 hour", "90 minutes", "8 hours"], 0, "17:00-16:30=30分です。英文と時刻を合わせて読みます。", "資料読解"],
    ["r9-eng-read-005", "長文", L4, "英文: Yui wanted to reduce plastic waste, so she started carrying her own bottle. Which is true?", ["She carries her own bottle to reduce plastic waste.", "She buys plastic bottles every day.", "She stopped drinking water.", "She lost her bottle at school."], 0, "so の前後から、プラスチックごみを減らすために自分のボトルを持つと分かります。", "内容一致"]
  ].map(([id, unit, difficulty, prompt, choices, answer, explanation, skill]) => tagged({
    id, subject: "英語", unit, difficulty, examSkill: skill, formatTag: /長文|会話|聞き取り|資料|英作文/.test(unit + skill) ? "長文・会話" : "短問", mistakeTags: ["語順", "読み違い", "語彙不足"], prompt, choices, answer, explanation
  }));

  const japaneseQuestions = [
    ["r9-jpn-vocab-001", "語句", L1, "「推敲」の意味として最も適切なものはどれですか。", ["文章をよりよく直すこと", "声に出して読むこと", "漢字を覚えること", "文章を短く写すこと"], 0, "推敲は文章を練り直してよくすることです。", "語句"],
    ["r9-jpn-grammar-001", "文法", L1, "「美しい花が咲いた」の「美しい」の品詞はどれですか。", ["形容詞", "動詞", "名詞", "接続詞"], 0, "美しいは性質を表し、言い切りが「い」なので形容詞です。", "文法"],
    ["r9-jpn-grammar-002", "文法", L2, "「雨が降ったので、試合は中止になった。」の接続関係として正しいものはどれですか。", ["理由・原因", "逆接", "並列", "例示"], 0, "「ので」は理由・原因を表します。", "文法"],
    ["r9-jpn-read-001", "説明文", L2, "説明文で筆者の主張を探すとき、最初に注目すべき表現はどれですか。", ["つまり・このように・大切なのは", "ある日・突然", "しかしだけを全部消す", "登場人物の名前"], 0, "要約や結論を示す表現の近くに主張が出やすいです。", "根拠判定"],
    ["r9-jpn-read-002", "説明文", L3, "文章: 森は水をたくわえ、川の水量をゆるやかにする。だから森を守ることは、下流の生活を守ることでもある。筆者の考えとして最も近いものはどれですか。", ["森の保全は人の生活にも関係する", "森は川と無関係である", "下流には人が住めない", "水量はいつも同じである"], 0, "最後の文が主張で、森を守ることが下流の生活を守ることにつながると述べています。", "説明文"],
    ["r9-jpn-read-003", "小説", L2, "小説で人物の気持ちを読むとき、根拠になりにくいものはどれですか。", ["読者の好みだけ", "会話", "行動", "表情の描写"], 0, "気持ちは本文中の会話・行動・描写から考えます。読者の好みだけでは根拠になりません。", "根拠判定"],
    ["r9-jpn-read-004", "小説", L3, "文章: 太郎は何度も答案を見直し、小さく息をついた。次の授業まで、まだ五分ある。太郎の様子として最も近いものはどれですか。", ["不安を残しながら確認している", "完全に遊んでいる", "怒って走り出した", "授業を忘れている"], 0, "何度も見直す、小さく息をつく、という描写から不安や緊張が読み取れます。", "心情把握"],
    ["r9-jpn-classic-001", "古典", L1, "歴史的仮名遣い「おほし」の現代仮名遣いとして正しいものはどれですか。", ["おおし", "おほし", "おうし", "おし"], 0, "語中の「ほ」は現代仮名遣いで「お」と読むことがあります。", "古典語句"],
    ["r9-jpn-classic-002", "古典", L2, "古文で「いと」が表す意味として最も近いものはどれですか。", ["とても", "少し", "まったくない", "昨日"], 0, "いとは「とても」という意味で使われます。", "古典語句"],
    ["r9-jpn-kanji-001", "漢字", L1, "「利益」の読みとして正しいものはどれですか。", ["りえき", "りがい", "りけき", "りやく"], 0, "利益は「りえき」と読みます。", "漢字"],
    ["r9-jpn-kanji-002", "漢字", L1, "「原因」の対義語として最も近いものはどれですか。", ["結果", "理由", "根拠", "条件"], 0, "原因に対して、そこから生じたものが結果です。", "語句"],
    ["r9-jpn-write-001", "条件作文", L3, "条件作文で、指定語句を使い忘れた場合の扱いとして最も近いものはどれですか。", ["条件不足で減点されやすい", "内容がよければ必ず満点", "字数が多ければよい", "漢字が多ければよい"], 0, "条件作文は内容だけでなく、指定語句・字数・立場などの条件を満たす必要があります。", "条件作文"],
    ["r9-jpn-write-002", "条件作文", L4, "意見文の構成として最も安定するものはどれですか。", ["意見→理由→具体例→まとめ", "具体例だけを並べる", "反対意見だけを書く", "結論を最後まで書かない"], 0, "短い作文では、意見、理由、具体例、まとめの順が読みやすく安定します。", "条件作文"],
    ["r9-jpn-read-005", "説明文", L4, "文章中の「これ」が指す内容を問われたとき、最初に見るべき場所はどれですか。", ["直前の文や段落", "文章の題名だけ", "最後の一文字", "選択肢の一番長いもの"], 0, "指示語の内容は多くの場合、直前の文や段落にあります。", "指示語"],
    ["r9-jpn-read-006", "説明文", L3, "選択肢問題で、本文にない強い言い切りを含む選択肢への対応として適切なのはどれですか。", ["本文の根拠があるか慎重に確認する", "強い表現なら必ず正解", "長い選択肢なら必ず正解", "知らない語を含めば正解"], 0, "「必ず」「すべて」など強い表現は本文根拠と合うか確認します。", "選択肢精査"],
    ["r9-jpn-review-001", "総合", L4, "国語の読解で時間不足になりやすいとき、最も効果的な解き方はどれですか。", ["設問を先に見て、根拠線を引きながら読む", "本文を何度も全部写す", "選択肢だけで決める", "漢字だけ先に10分使う"], 0, "設問の要求を意識して根拠を探すと、読み直し時間を減らせます。", "時間配分"]
  ].map(([id, unit, difficulty, prompt, choices, answer, explanation, skill]) => tagged({
    id, subject: "国語", unit, difficulty, examSkill: skill, formatTag: /説明文|小説|作文|総合/.test(unit) ? "読解・記述" : "短問", mistakeTags: ["読み違い", "根拠不足", "時間不足"], prompt, choices, answer, explanation
  }));

  const practicalExamQuestions = [
    tagged({ id: "r9-math-exam-001", subject: "数学", unit: "方程式の利用", difficulty: L3, examSkill: "立式・条件整理", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["立式", "条件整理"], prompt: "ある店で、鉛筆をx本、ノートをy冊買う。鉛筆は1本80円、ノートは1冊150円で、合計は12点、代金は1380円だった。ノートの冊数を求めるための式として最も適切なものはどれですか。", choices: ["x+y=12, 80x+150y=1380", "x+y=1380, 80x+150y=12", "80x+150y=12, x-y=1380", "x+y=12, 150x+80y=1380"], answer: 0, explanation: "個数の合計がx+y=12、代金の合計が80x+150y=1380です。単位をそろえて式にします。" }),
    tagged({ id: "r9-math-exam-002", subject: "数学", unit: "1次関数", difficulty: L3, examSkill: "グラフ読取", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "条件整理"], prompt: "表: x=0でy=4、x=2でy=10、x=5でy=19。この関係が一次関数なら、式として正しいものはどれですか。", choices: ["y=3x+4", "y=4x+3", "y=2x+4", "y=3x+10"], answer: 0, explanation: "xが2増えるとyは6増えるので傾きは3。x=0でy=4だから y=3x+4 です。" }),
    tagged({ id: "r9-math-exam-003", subject: "数学", unit: "2次関数", difficulty: L4, examSkill: "変域判断", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["条件整理", "読み違い"], prompt: "二次関数 y=2x² で、xの変域が -2≦x≦3 のとき、yの変域として正しいものはどれですか。", choices: ["0≦y≦18", "8≦y≦18", "-4≦y≦6", "0≦y≦12"], answer: 0, explanation: "x=0を含むので最小値は0。端点では8と18なので最大値は18です。" }),
    tagged({ id: "r9-math-exam-004", subject: "数学", unit: "図形", difficulty: L3, examSkill: "角度・根拠", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["図を描けない", "根拠不足"], prompt: "AB∥CDで、直線EFが交わる。∠AEF=62°、∠EFCと隣り合う角が118°だった。∠EFCが62°といえる理由として最も適切なのはどれですか。", choices: ["平行線の錯角が等しいから", "三角形の内角の和が180°だから", "円周角が等しいから", "対頂角は必ず118°だから"], answer: 0, explanation: "平行線に1本の直線が交わると、錯角や同位角が等しくなります。" }),
    tagged({ id: "r9-math-exam-005", subject: "数学", unit: "相似", difficulty: L4, examSkill: "相似と面積", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["条件整理", "公式忘れ"], prompt: "相似な2つの三角形A,Bがある。対応する辺の比A:Bは3:5、三角形Aの面積は27cm²。三角形Bの面積は何cm²ですか。", choices: ["75cm²", "45cm²", "125cm²", "81cm²"], answer: 0, explanation: "面積比は相似比の2乗で9:25。27×25/9=75です。" }),
    tagged({ id: "r9-math-exam-006", subject: "数学", unit: "データの活用", difficulty: L3, examSkill: "箱ひげ図", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "読み違い"], prompt: "資料Aの第1四分位数は12、第3四分位数は28。資料Bの第1四分位数は16、第3四分位数は24。散らばりについて正しい説明はどれですか。", choices: ["Aの四分位範囲の方が大きい", "Bの四分位範囲の方が大きい", "AとBの四分位範囲は同じ", "平均が分からないので比較できない"], answer: 0, explanation: "Aの四分位範囲は16、Bは8なので、Aの方が散らばりが大きいです。" }),
    tagged({ id: "r9-math-exam-007", subject: "数学", unit: "確率", difficulty: L3, examSkill: "場合分け", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["条件整理", "数え漏れ"], prompt: "赤2個、白3個の玉から同時に2個取り出す。2個とも白である確率はどれですか。", choices: ["3/10", "2/5", "1/2", "1/5"], answer: 0, explanation: "全体は5個から2個で10通り。白3個から2個は3通りなので3/10です。" }),
    tagged({ id: "r9-math-exam-008", subject: "数学", unit: "規則性", difficulty: L4, examSkill: "文字式説明", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["規則性", "文字式説明"], prompt: "1段目に4個、2段目に7個、3段目に10個の点を並べる。n段目の点の数を表す式として正しいものはどれですか。", choices: ["3n+1", "4n+3", "n+3", "3n-1"], answer: 0, explanation: "4,7,10,...は3ずつ増える数列です。n=1で4になる式は3n+1です。" }),
    tagged({ id: "r9-math-exam-009", subject: "数学", unit: "三平方", difficulty: L4, examSkill: "図形量", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["図を描けない", "条件整理"], prompt: "長方形の縦が6cm、横が8cm。この長方形の対角線を直径とする円の半径は何cmですか。", choices: ["5cm", "10cm", "7cm", "4cm"], answer: 0, explanation: "対角線は三平方の定理で10cm。これが直径なので半径は5cmです。" }),
    tagged({ id: "r9-math-exam-010", subject: "数学", unit: "関数と図形", difficulty: L4, examSkill: "融合問題", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["条件整理", "立式"], prompt: "直線 y=2x+1 上の点Pのx座標が3のとき、点Pと原点O、点A(3,0)でできる三角形OAPの面積は何ですか。", choices: ["21/2", "7", "14", "6"], answer: 0, explanation: "Pのy座標は7。底辺OAは3、高さは7なので面積は3×7÷2=21/2です。" }),
    tagged({ id: "r9-math-exam-011", subject: "数学", unit: "証明", difficulty: L3, examSkill: "証明の根拠", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["根拠不足", "条件整理"], prompt: "三角形ABCと三角形DEFで、AB=DE、AC=DF、∠A=∠D が分かっている。合同を示すときに使う条件はどれですか。", choices: ["2組の辺とその間の角がそれぞれ等しい", "3組の角がそれぞれ等しい", "直角三角形の斜辺と1つの鋭角", "1組の辺だけが等しい"], answer: 0, explanation: "等しい角が、等しい2組の辺の間にあるので、2組の辺とその間の角です。" }),
    tagged({ id: "r9-math-exam-012", subject: "数学", unit: "速さ", difficulty: L3, examSkill: "追いつき", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["立式", "時間不足"], prompt: "弟は毎分60mで駅へ向かった。兄は弟が出発して4分後に毎分90mで同じ道を追いかけた。兄が弟に追いつくのは、兄が出発してから何分後ですか。", choices: ["8分後", "6分後", "10分後", "12分後"], answer: 0, explanation: "弟の先行距離は60×4=240m。差は毎分30mなので240÷30=8分です。" }),
    tagged({ id: "r9-math-exam-013", subject: "数学", unit: "式の利用", difficulty: L3, examSkill: "文字式説明", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["文字式説明", "条件整理"], prompt: "連続する3つの整数を n-1, n, n+1 と表す。この3つの和について正しい説明はどれですか。", choices: ["3nとなり、必ず3の倍数", "n+3となり、必ず3の倍数", "3n+1となり、必ず奇数", "n²となり、必ず平方数"], answer: 0, explanation: "(n-1)+n+(n+1)=3nなので、3の倍数です。" }),
    tagged({ id: "r9-math-exam-014", subject: "数学", unit: "資料活用", difficulty: L3, examSkill: "割合比較", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "割合"], prompt: "A中は受験者80人中64人が合格、B中は受験者120人中90人が合格。合格率について正しいものはどれですか。", choices: ["A中の方が高い", "B中の方が高い", "同じ", "人数だけでは比べられない"], answer: 0, explanation: "Aは64/80=80%、Bは90/120=75%なのでAの方が高いです。" }),
    tagged({ id: "r9-math-exam-015", subject: "数学", unit: "捨て問判断", difficulty: L4, examSkill: "時間配分", formatTag: "複合", contentStatus: "content-audited", mistakeTags: ["時間不足", "粘れない"], prompt: "本番で大問後半に入り、条件が3つあり図も複雑な問題に5分使っても方針が立たない。次の行動として最も得点につながりやすいものはどれですか。", choices: ["印をつけて一度飛ばし、取れる小問へ戻る", "最後までその問題だけに使う", "答案を空欄のまま全問終える", "計算欄を消して最初から写す"], answer: 0, explanation: "安全圏では、取れる問題を取り切る時間配分も重要です。方針が立たない問題は戻る前提で一度飛ばします。" }),
    tagged({ id: "r9-sci-exam-001", subject: "理科", unit: "実験操作", difficulty: L3, examSkill: "対照実験", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["条件整理", "資料読取"], prompt: "植物の光合成を調べるため、Aは光を当て、Bはアルミはくで葉を包み、他の条件は同じにした。Bを用意する目的はどれですか。", choices: ["光の有無だけを比べるため", "温度を上げるため", "葉を大きくするため", "水を減らすため"], answer: 0, explanation: "調べたい条件だけを変える対照実験です。Bは光がない条件として比べます。" }),
    tagged({ id: "r9-sci-exam-002", subject: "理科", unit: "電流と電圧", difficulty: L3, examSkill: "表の読み取り", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "計算ミス"], prompt: "表: 電圧1.5Vで電流0.3A、3.0Vで0.6A、4.5Vで0.9A。この電熱線の抵抗は何Ωですか。", choices: ["5Ω", "0.2Ω", "2Ω", "15Ω"], answer: 0, explanation: "R=V/I。1.5÷0.3=5Ωで、他の行でも同じです。" }),
    tagged({ id: "r9-sci-exam-003", subject: "理科", unit: "化学変化", difficulty: L4, examSkill: "質量比", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["化学計算", "資料読取"], prompt: "表: 銅1.6gを加熱すると酸化銅2.0g、銅3.2gでは酸化銅4.0g。銅2.4gを完全に酸化すると酸化銅は何gですか。", choices: ["3.0g", "2.8g", "3.2g", "4.0g"], answer: 0, explanation: "銅:酸化銅=1.6:2.0=4:5。2.4×5/4=3.0gです。" }),
    tagged({ id: "r9-sci-exam-004", subject: "理科", unit: "水溶液", difficulty: L3, examSkill: "濃度計算", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["化学計算", "条件整理"], prompt: "12%の食塩水100gに水を50g加えた。新しい食塩水の質量パーセント濃度は何%ですか。", choices: ["8%", "6%", "12%", "18%"], answer: 0, explanation: "食塩は12gのまま、水溶液は150g。12÷150×100=8%です。" }),
    tagged({ id: "r9-sci-exam-005", subject: "理科", unit: "地震", difficulty: L3, examSkill: "到達時刻", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "計算ミス"], prompt: "ある地点でP波が10時00分20秒、S波が10時00分32秒に届いた。初期微動継続時間は何秒ですか。", choices: ["12秒", "20秒", "32秒", "52秒"], answer: 0, explanation: "S波の到着時刻からP波の到着時刻を引き、32-20=12秒です。" }),
    tagged({ id: "r9-sci-exam-006", subject: "理科", unit: "天気", difficulty: L4, examSkill: "天気図", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "理由説明"], prompt: "天気図で西に高気圧、東に低気圧があり、等圧線が縦に混んでいる。冬の日本付近で起こりやすい天気として正しいものはどれですか。", choices: ["日本海側で雪が降りやすい", "全国で梅雨になる", "南西諸島だけ乾燥する", "台風が必ず上陸する"], answer: 0, explanation: "西高東低の冬型では北西季節風が吹き、日本海側で雪が降りやすくなります。" }),
    tagged({ id: "r9-sci-exam-007", subject: "理科", unit: "人体", difficulty: L3, examSkill: "実験考察", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "理由説明"], prompt: "だ液を入れたデンプン液Aと、だ液を入れないデンプン液Bを同じ温度で置いた。Aだけヨウ素液の反応が薄くなった理由はどれですか。", choices: ["だ液がデンプンを分解したから", "Bだけ温度が高いから", "ヨウ素液がデンプンを作ったから", "水が酸素に変わったから"], answer: 0, explanation: "だ液中の消化酵素がデンプンを分解するため、ヨウ素液の反応が弱くなります。" }),
    tagged({ id: "r9-sci-exam-008", subject: "理科", unit: "天体", difficulty: L4, examSkill: "理由説明", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["理由説明", "読み違い"], prompt: "同じ時刻に見える星座が季節によって変わる理由として最も適切なものはどれですか。", choices: ["地球が太陽のまわりを公転し、夜に向く方向が変わるから", "星座が地球の周りを1日で1周するから", "夏だけ星が地球に近づくから", "月が星座を動かすから"], answer: 0, explanation: "季節によって夜に向く宇宙の方向が変わる主因は地球の公転です。" }),
    tagged({ id: "r9-sci-exam-009", subject: "理科", unit: "遺伝", difficulty: L3, examSkill: "規則性", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["条件整理", "知識不足"], prompt: "丸い種子をつくる純系と、しわの種子をつくる純系をかけ合わせると、子はすべて丸になった。丸の形質について正しいものはどれですか。", choices: ["優性形質である", "劣性形質である", "環境だけで決まる", "遺伝しない"], answer: 0, explanation: "子に現れる形質は優性形質と判断できます。" }),
    tagged({ id: "r9-sci-exam-010", subject: "理科", unit: "総合", difficulty: L4, examSkill: "記述説明", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["記述不足", "条件整理"], prompt: "実験結果の説明で「Aの方が大きかった」とだけ書くと減点されやすい。よりよい答えに必要なものはどれですか。", choices: ["比べた条件、数値、理由", "感想だけ", "器具の色", "選択肢の番号"], answer: 0, explanation: "県立型の記述では、条件・数値・理由をつないで説明することが重要です。" }),
    tagged({ id: "r9-soc-exam-001", subject: "社会", unit: "資料読取", difficulty: L3, examSkill: "統計比較", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "割合"], prompt: "表: A県は人口100万人で高齢者25万人、B県は人口60万人で高齢者18万人。高齢者の割合が高い県はどちらですか。", choices: ["B県", "A県", "同じ", "人口だけでは必ずA県"], answer: 0, explanation: "Aは25%、Bは30%なので、割合はB県の方が高いです。" }),
    tagged({ id: "r9-soc-exam-002", subject: "社会", unit: "雨温図", difficulty: L3, examSkill: "気候判定", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "気候"], prompt: "雨温図の特徴: 年中高温、6-9月の降水量が多く、12-3月は少ない。この気候として最も近いものはどれですか。", choices: ["サバナ気候", "西岸海洋性気候", "冷帯", "ツンドラ気候"], answer: 0, explanation: "年中高温で雨季と乾季があるため、サバナ気候が最も近いです。" }),
    tagged({ id: "r9-soc-exam-003", subject: "社会", unit: "歴史整序", difficulty: L3, examSkill: "年代整序", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["年代整序", "知識不足"], prompt: "次の出来事を古い順に並べたものはどれですか。大化の改新、平安京遷都、鎌倉幕府成立、建武の新政", choices: ["大化の改新→平安京遷都→鎌倉幕府成立→建武の新政", "平安京遷都→大化の改新→鎌倉幕府成立→建武の新政", "鎌倉幕府成立→大化の改新→平安京遷都→建武の新政", "大化の改新→鎌倉幕府成立→平安京遷都→建武の新政"], answer: 0, explanation: "645年、794年、1192年ごろ、1334年ごろの順です。" }),
    tagged({ id: "r9-soc-exam-004", subject: "社会", unit: "公民", difficulty: L4, examSkill: "制度比較", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["制度比較", "理由説明"], prompt: "衆議院の優越が認められる場面として適切でないものはどれですか。", choices: ["最高裁判所長官の指名", "予算の議決", "条約の承認", "内閣総理大臣の指名"], answer: 0, explanation: "最高裁長官は内閣が指名し天皇が任命します。予算・条約・首相指名などで衆議院の優越があります。" }),
    tagged({ id: "r9-soc-exam-005", subject: "社会", unit: "地形図", difficulty: L3, examSkill: "地図読取", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "地図"], prompt: "地形図で、等高線が川の上流側へV字形に曲がっている場所がある。この地形として最も考えやすいものはどれですか。", choices: ["谷", "台地の頂上", "海岸線", "砂丘"], answer: 0, explanation: "等高線が上流側へ入り込む形は谷を示します。" }),
    tagged({ id: "r9-soc-exam-006", subject: "社会", unit: "経済", difficulty: L3, examSkill: "資料と因果", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "理由説明"], prompt: "円安が進んだとき、輸入品の価格に起こりやすい変化として正しいものはどれですか。", choices: ["上がりやすい", "下がりやすい", "必ず0円になる", "税金と無関係になる"], answer: 0, explanation: "円の価値が下がると、同じ外国商品を買うのに多くの円が必要になり、輸入品は高くなりやすいです。" }),
    tagged({ id: "r9-soc-exam-007", subject: "社会", unit: "国際", difficulty: L4, examSkill: "資料読取", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "知識不足"], prompt: "SDGsの説明として最も適切なものはどれですか。", choices: ["貧困、教育、環境などの課題を2030年までに改善する国際目標", "日本だけの税制改革", "江戸時代の身分制度", "企業だけが守る交通規則"], answer: 0, explanation: "SDGsは持続可能な開発目標で、国際社会全体の課題を扱います。" }),
    tagged({ id: "r9-soc-exam-008", subject: "社会", unit: "総合", difficulty: L4, examSkill: "融合問題", formatTag: "資料読取", contentStatus: "content-audited", mistakeTags: ["資料読取", "因果説明"], prompt: "明治以降に工業化が進むと、都市へ人口が集まりやすくなった。地理と歴史を結びつけた理由として最も適切なのはどれですか。", choices: ["工場で働く仕事が都市に増えたから", "農業が法律で禁止されたから", "山地がすべて平野になったから", "交通が必ず不便になったから"], answer: 0, explanation: "工業化により都市部に雇用が増え、人口移動が起こりやすくなりました。" }),
    tagged({ id: "r9-eng-exam-001", subject: "英語", unit: "長文", difficulty: L3, examSkill: "内容一致", formatTag: "長文・会話", contentStatus: "content-audited", mistakeTags: ["読み違い", "語彙不足"], prompt: "英文: Haru joined the science club because he liked experiments. At first, he was afraid of speaking in front of others. After he explained his experiment many times, he became more confident. What changed about Haru?", choices: ["He became more confident about explaining.", "He stopped liking experiments.", "He left the science club.", "He became afraid of science."], answer: 0, explanation: "最後の文に、何度も説明した後で自信がついたとあります。" }),
    tagged({ id: "r9-eng-exam-002", subject: "英語", unit: "会話文", difficulty: L3, examSkill: "会話の流れ", formatTag: "長文・会話", contentStatus: "content-audited", mistakeTags: ["読み違い", "語順"], prompt: "A: We need one more idea for the school festival. B: How about making a quiz about Ibaraki? A: Good. Students can learn about local history. What are they talking about?", choices: ["An idea for the school festival.", "A plan to cancel school.", "A train schedule.", "A weather report."], answer: 0, explanation: "school festival のための idea について話しています。" }),
    tagged({ id: "r9-eng-exam-003", subject: "英語", unit: "資料付き読解", difficulty: L4, examSkill: "資料読解", formatTag: "長文・会話", contentStatus: "content-audited", mistakeTags: ["資料読取", "時間不足"], prompt: "英文: The library is open from 10:00 to 18:00 on weekdays and from 9:00 to 17:00 on Sundays. Ken wants to study there for two hours on Sunday. Which arrival time works?", choices: ["14:30", "16:30", "17:30", "18:00"], answer: 0, explanation: "日曜は17:00までなので、2時間勉強するには15:00以前に着く必要があります。14:30なら可能です。" }),
    tagged({ id: "r9-eng-exam-004", subject: "英語", unit: "英作文", difficulty: L3, examSkill: "条件英作文", formatTag: "長文・会話", contentStatus: "content-audited", mistakeTags: ["語順", "記述不足"], prompt: "「私は英語を勉強するために毎朝10分早く起きます」に最も近い英文はどれですか。", choices: ["I get up ten minutes earlier every morning to study English.", "I to study English get up earlier ten minutes.", "I got up early English every morning.", "I am study English for ten minutes get up."], answer: 0, explanation: "目的は to study English で表し、every morning は習慣なので現在形にします。" }),
    tagged({ id: "r9-eng-exam-005", subject: "英語", unit: "リスニング代替", difficulty: L3, examSkill: "聞き取り要点", formatTag: "長文・会話", contentStatus: "content-audited", mistakeTags: ["聞き取り", "読み違い"], prompt: "聞き取り想定: \"The soccer game will start at three, but players should come to the field by two thirty.\" 選手が着くべき時刻はどれですか。", choices: ["2:30", "3:00", "3:30", "2:00"], answer: 0, explanation: "試合開始は3時ですが、選手は2時30分までに来る必要があります。" }),
    tagged({ id: "r9-jpn-exam-001", subject: "国語", unit: "説明文", difficulty: L3, examSkill: "主張把握", formatTag: "読解・記述", contentStatus: "content-audited", mistakeTags: ["根拠不足", "読み違い"], prompt: "文章: 勉強の記録は、努力を見える形にする。点数だけを見ると落ち込む日もあるが、何を直したかを残せば次の行動が決まる。筆者の主張として最も近いものはどれですか。", choices: ["記録は次の改善につながる", "点数だけ見れば十分である", "努力は記録してはいけない", "勉強は毎日同じでよい"], answer: 0, explanation: "最後に「次の行動が決まる」とあり、記録が改善につながることを述べています。" }),
    tagged({ id: "r9-jpn-exam-002", subject: "国語", unit: "小説", difficulty: L3, examSkill: "心情把握", formatTag: "読解・記述", contentStatus: "content-audited", mistakeTags: ["根拠不足", "読み違い"], prompt: "文章: 発表の前、真央は原稿の端を何度も折り直した。名前を呼ばれると、深く息を吸ってから立ち上がった。真央の心情として最も近いものはどれですか。", choices: ["緊張しながらも発表しようとしている", "怒って発表をやめた", "退屈で眠っている", "発表のことを忘れている"], answer: 0, explanation: "何度も折り直す、深く息を吸うという描写から緊張と決意が読み取れます。" }),
    tagged({ id: "r9-jpn-exam-003", subject: "国語", unit: "古典", difficulty: L3, examSkill: "古文読解", formatTag: "読解・記述", contentStatus: "content-audited", mistakeTags: ["古典語句", "読み違い"], prompt: "古文で「いとをかし」とあるとき、文脈上の意味として最も近いものはどれですか。", choices: ["たいへん趣がある", "とても悲しい", "まったく知らない", "少し急ぐ"], answer: 0, explanation: "「をかし」は趣深い、興味深いという意味で用いられます。" }),
    tagged({ id: "r9-jpn-exam-004", subject: "国語", unit: "条件作文", difficulty: L4, examSkill: "条件作文", formatTag: "読解・記述", contentStatus: "content-audited", mistakeTags: ["記述不足", "条件整理"], prompt: "条件作文で「理由を2つ入れる」「80字以上100字以内」と指定された。最も危険な答案はどれですか。", choices: ["理由が1つで120字ある答案", "理由が2つで90字の答案", "理由が2つで指定語句を使う答案", "結論と理由がつながる答案"], answer: 0, explanation: "理由の数と字数の両方で条件を外しているため、大きく減点されやすいです。" }),
    tagged({ id: "r9-jpn-exam-005", subject: "国語", unit: "説明文", difficulty: L4, examSkill: "選択肢精査", formatTag: "読解・記述", contentStatus: "content-audited", mistakeTags: ["読み違い", "時間不足"], prompt: "説明文の選択肢で「必ず」「すべて」「一切」などの強い表現がある。本文と照合するときの方針として最も適切なのはどれですか。", choices: ["本文に同じ強さの根拠があるか確認する", "強い表現なので正解にする", "長い選択肢なので正解にする", "知らない語句があるので飛ばさない"], answer: 0, explanation: "強い表現は本文の根拠と一致しない場合に誤りになりやすいので、根拠の強さを確認します。" })
  ];

  const REMOVED_PHASE_1_IDS = new Set([
    "r9-math-eq-input-001", "r9-math-eq-input-002", "r9-math-eq-input-003", "r9-math-eq-input-004", "r9-math-eq-input-005",
    "r9-math-eq-input-006", "r9-math-eq-input-007", "r9-math-eq-input-008", "r9-math-eq-input-009", "r9-math-eq-input-010",
    "r9-math-eq-input-011", "r9-math-eq-input-012", "r9-math-eq-input-013", "r9-math-eq-input-014", "r9-math-eq-input-015",
    "r9-sci-bio-001", "r9-sci-bio-002", "r9-sci-bio-003", "r9-sci-earth-001", "r9-sci-astro-001",
    "r9-sci-chem-001", "r9-sci-force-002", "r9-sci-current-002", "r9-sci-earth-002", "r9-sci-weather-001",
    "r9-soc-geo-001", "r9-soc-his-001", "r9-soc-his-002", "r9-soc-his-003", "r9-soc-his-005",
    "r9-soc-civ-001", "r9-soc-civ-002", "r9-soc-civ-003",
    "r9-eng-grammar-001", "r9-eng-grammar-002", "r9-eng-vocab-001", "r9-eng-vocab-002", "r9-eng-order-001",
    "r9-jpn-vocab-001", "r9-jpn-grammar-001", "r9-jpn-kanji-001", "r9-jpn-kanji-002", "r9-jpn-classic-002"
  ]);

  const PHASE_1_QUESTIONS = [
    ...buildLinearEquationQuestions(),
    ...buildManipulateQuestions(),
    ...buildSystemQuestions(),
    ...algebraQuestions,
    ...functionQuestions,
    ...geometryQuestions,
    ...dataQuestions,
    ...scienceQuestions,
    ...socialQuestions,
    ...englishQuestions,
    ...japaneseQuestions,
    ...practicalExamQuestions
  ].filter((question) => !REMOVED_PHASE_1_IDS.has(question.id));

  window.QUIZ_QUESTIONS = (window.QUIZ_QUESTIONS || []).map(auditLegacyQuestion);
  window.QUIZ_QUESTIONS.push(...PHASE_1_QUESTIONS);
}());
