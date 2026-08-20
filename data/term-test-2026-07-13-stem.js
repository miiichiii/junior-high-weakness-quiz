(function () {
  "use strict";

  const PACK_ID = "term-2026-07-13";
  const CHILD_IDS = ["child-1"];
  const SOURCE_TAG = "term-2026-07-13-original";
  const DIFFICULTY = {
    core: "L2 県立標準",
    challenge: "L3 県立本番",
    final: "L4 安全圏チャレンジ",
    max: "L4 安全圏チャレンジ"
  };
  const TIER_META = {
    core: { stage: "基本攻略", priority: "S" },
    challenge: { stage: "応用挑戦", priority: "A" },
    final: { stage: "最終挑戦", priority: "B" },
    max: { stage: "最高難度ミックス", priority: "B" }
  };

  function makeQuestion(spec) {
    const meta = TIER_META[spec.tier];
    if (!meta) throw new Error(`Unknown term-test tier: ${spec.tier}`);
    const question = {
      id: spec.id,
      type: spec.type || "choice",
      childIds: CHILD_IDS.slice(),
      subject: spec.subject,
      unit: spec.unit,
      priority: spec.priority || meta.priority,
      stage: spec.stage || meta.stage,
      difficulty: spec.difficulty || DIFFICULTY[spec.tier],
      examSkill: spec.examSkill,
      formatTag: spec.formatTag || "短問",
      mistakeTags: spec.mistakeTags.slice(),
      sourceTag: spec.sourceTag || SOURCE_TAG,
      qualityStatus: "content-audited",
      contentStatus: "content-final",
      packId: PACK_ID,
      tier: spec.tier,
      paperRef: spec.paperRef,
      skills: spec.skills.slice(),
      prompt: spec.prompt,
      explanation: spec.explanation
    };
    if (spec.choices) question.choices = spec.choices.slice();
    if (spec.answer !== undefined) question.answer = spec.answer;
    if (spec.answerText) question.answerText = Array.isArray(spec.answerText) ? spec.answerText.slice() : spec.answerText;
    if (spec.placeholder) question.placeholder = spec.placeholder;
    if (spec.answerMode) question.answerMode = spec.answerMode;
    if (spec.workResult) question.workResult = spec.workResult;
    if (spec.workSteps) {
      question.workSteps = spec.workSteps.map((step) => ({
        label: step.label,
        answers: step.answers.slice(),
        hint: step.hint,
        choices: Array.isArray(step.choices)
          ? step.choices.map((choice) => typeof choice === "string" ? choice : { ...choice })
          : undefined,
        requiredTransformation: Array.isArray(step.requiredTransformation)
          ? step.requiredTransformation.slice()
          : step.requiredTransformation
      }));
    }
    if (spec.figure) question.figure = {
      ...spec.figure,
      columns: spec.figure.columns ? spec.figure.columns.slice() : undefined,
      rows: spec.figure.rows ? spec.figure.rows.map((row) => row.slice()) : undefined
    };
    if (spec.variantGroup) question.variantGroup = spec.variantGroup;
    return question;
  }

  function input(spec) {
    return makeQuestion({
      ...spec,
      type: "input",
      formatTag: spec.formatTag || "直接入力",
      placeholder: safeInputPlaceholder(spec)
    });
  }

  function choice(spec) {
    return makeQuestion({ ...spec, type: "choice" });
  }

  function findError(spec) {
    return makeQuestion({ ...spec, type: "find-error", formatTag: "ミス発見" });
  }

  function safeInputPlaceholder(spec) {
    if (spec.subject === "数学") return "途中式をタイルで作る";
    const placeholder = String(spec.placeholder || "答えを入力");
    const normalizedPlaceholder = placeholder
      .replace(/^例[:：]?/u, "")
      .replace(/\s+/g, "")
      .toLowerCase();
    const answers = Array.isArray(spec.answerText) ? spec.answerText : [spec.answerText];
    const leaksAnswer = answers.some((answer) => {
      const normalizedAnswer = String(answer || "")
        .replace(/\s+/g, "")
        .toLowerCase();
      return normalizedAnswer && normalizedPlaceholder === normalizedAnswer;
    });
    return leaksAnswer ? "答えを入力" : placeholder;
  }

  const STATIC_MATH_WORK_STEPS = {
    "term-20260713-math-core-001": [
      { label: "1. かっこを外す", answers: ["2x+3+4x−5", "2x+4x+3−5"] },
      { label: "2. 同類項をまとめる", answers: ["6x−2"] }
    ],
    "term-20260713-math-core-002": [
      { label: "1. 後ろの符号を変える", answers: ["5a−2b−2a−3b"] },
      { label: "2. 同類項をまとめる", answers: ["3a−5b"] }
    ],
    "term-20260713-math-core-003": [
      { label: "1. それぞれに3xをかける", answers: ["3x×2x+3x×(−5)", "3x×2x−3x×5"] },
      { label: "2. 積を計算する", answers: ["6x²−15x"] }
    ],
    "term-20260713-math-core-004": [
      { label: "1. 数・文字ごとに割る", answers: ["−12÷3×a²÷a×b÷b"] },
      { label: "2. 約分してまとめる", answers: ["−4a"] }
    ],
    "term-20260713-math-core-005": [
      {
        label: "1. 4つの積を作る",
        answers: ["x²+4x+7x+28", "x²+7x+4x+28"],
        hint: "左のxと4を、右のxと7へそれぞれ1回ずつ掛けます。定数項は4×7です。",
        choices: [
          { text: "x²+7x+4x+28" },
          { text: "x²+7x+4x+11", feedback: "定数項は4+7ではなく、4×7で求めます。" },
          { text: "x²+7x+28", feedback: "4×xの項が抜けています。4も右の2項へ掛けます。" },
          { text: "x²+4x+28", feedback: "x×7の項が抜けています。xも右の2項へ掛けます。" }
        ]
      },
      {
        label: "2. 同類項をまとめる",
        answers: ["x²+11x+28"],
        hint: "x²と定数項はそのままにし、4xと7xの係数だけを足します。",
        choices: [
          { text: "x²+11x+28" },
          { text: "x²+7x+4x+28", feedback: "4xと7xは同類項です。係数4+7を計算します。" },
          { text: "x²+28x+11", feedback: "xの係数と定数項を入れ替えないように、項の種類を確認します。" },
          { text: "x²+11x+11", feedback: "定数項28は4×7で求めた値なので、そのまま残します。" }
        ]
      }
    ],
    "term-20260713-math-core-006": [
      {
        label: "1. 4つの積を作る",
        answers: ["2x²+10x−3x−15"],
        hint: "2xと−3を、xと5へそれぞれ掛けます。特に (−3)×5 の符号を確認します。",
        choices: [
          { text: "2x²+10x−3x−15" },
          { text: "2x²+5x−3x−15", feedback: "2x×5は5xではなく10xです。係数2も掛けます。" },
          { text: "2x²+10x+3x−15", feedback: "(−3)×xは−3xです。負の符号を残します。" },
          { text: "2x²+10x−3x+15", feedback: "(−3)×5は−15です。負×正の積は負になります。" }
        ]
      },
      {
        label: "2. 同類項をまとめる",
        answers: ["2x²+7x−15"],
        hint: "10x−3xだけをまとめます。2x²と−15は種類が違うのでそのままです。",
        choices: [
          { text: "2x²+7x−15" },
          { text: "2x²+13x−15", feedback: "10x−3xは足し算ではなく引き算なので7xです。" },
          { text: "2x²+7x+15", feedback: "定数項−15の符号は、同類項をまとめても変わりません。" },
          { text: "2x²−7x−15", feedback: "10x−3xは正の7xです。大きい係数10の符号を確認します。" }
        ]
      }
    ],
    "term-20260713-math-core-007": [
      { label: "1. 和と積を確認する", answers: ["4+5=9,4×5=20", "5+4=9,5×4=20"] },
      { label: "2. 因数分解する", answers: ["(x+4)(x+5)", "(x+5)(x+4)"] }
    ],
    "term-20260713-math-core-008": [
      { label: "1. 完全平方を確認する", answers: ["25=5²,−10x=−2×5×x"] },
      { label: "2. 因数分解する", answers: ["(x−5)²", "(5−x)²"] }
    ],
    "term-20260713-math-core-009": [
      { label: "1. 平方の差にする", answers: ["9x²−16=(3x)²−4²"] },
      { label: "2. 因数分解する", answers: ["(3x−4)(3x+4)", "(3x+4)(3x−4)"] }
    ],
    "term-20260713-math-core-010": [
      {
        label: "1. 45を平方数と残りに分ける",
        answers: ["√45=√9×√5", "√45=√(9×5)", "√45=√(3²×5)"]
      },
      { label: "2. 根号を簡単にする", answers: ["3√5", "√9×√5=3√5"] }
    ],
    "term-20260713-math-core-011": [
      {
        label: "1. それぞれ簡単にする",
        answers: [
          "√12+√27=2√3+3√3",
          "√12+√27=√(4×3)+√(9×3)",
          "√12+√27=√4×√3+√9×√3"
        ]
      },
      { label: "2. 根号の項をまとめる", answers: ["5√3"] }
    ],
    "term-20260713-math-core-012": [
      {
        label: "1. 根号を1つにするか、それぞれ簡単にする",
        answers: ["√8×√18=√144", "√8×√18=√(8×18)", "√8×√18=2√2×3√2"]
      },
      {
        label: "2. 平方根を求める",
        answers: ["√144=12", "√(8×18)=12", "2√2×3√2=12", "6×2=12"]
      }
    ],
    "term-20260713-math-core-013": [
      {
        label: "1. 分子・分母に√3をかける",
        answers: ["6÷√3=6√3÷3", "6÷√3=(6×√3)÷(√3×√3)"]
      },
      { label: "2. 約分する", answers: ["2√3"] }
    ],
    "term-20260713-math-challenge-002": [
      { label: "1. 共通因数2xを見つける", answers: ["2x²+8x=2x×x+2x×4"] },
      { label: "2. 因数分解する", answers: ["2x(x+4)", "(x+4)(2x)"] }
    ],
    "term-20260713-math-challenge-003": [
      { label: "1. 和と積を確認する", answers: ["−5+3=−2,−5×3=−15", "3−5=−2,3×(−5)=−15"] },
      { label: "2. 因数分解する", answers: ["(x−5)(x+3)", "(x+3)(x−5)"] }
    ],
    "term-20260713-math-challenge-004": [
      { label: "1. 公式で置き換える", answers: ["x²+y²=(x+y)²−2xy"] },
      { label: "2. 値を代入する", answers: ["7²−2×10=29", "49−20=29"] }
    ],
    "term-20260713-math-challenge-005": [
      { label: "1. 平方の差を使う", answers: ["(√5+√2)(√5−√2)=(√5)²−(√2)²"] },
      { label: "2. 計算する", answers: ["5−2=3"] }
    ],
    "term-20260713-math-challenge-006": [
      { label: "1. 2つの項を別々に計算する", answers: ["(2√3)²=12,√12×√3=6"] },
      { label: "2. 差を求める", answers: ["12−6=6"] }
    ],
    "term-20260713-math-challenge-007": [
      { label: "1. √48を簡単にする", answers: ["√48=4√3"] },
      { label: "2. まとめて割る", answers: ["(4√3−√3)÷√3=3"] }
    ],
    "term-20260713-math-challenge-008": [
      { label: "1. 面積の式を展開する", answers: ["(x+2)(x+5)=x²+5x+2x+10", "(x+2)(x+5)=x²+2x+5x+10"] },
      { label: "2. 同類項をまとめる", answers: ["x²+7x+10"] }
    ],
    "term-20260713-math-challenge-009": [
      { label: "1. 各項を3xyで割る", answers: ["6x²y÷3xy=2x,−9xy²÷3xy=−3y"] },
      { label: "2. 答えをまとめる", answers: ["2x−3y"] }
    ],
    "term-20260713-math-challenge-011": [
      { label: "1. 式を因数分解する", answers: ["a²−2a=a(a−2)"] },
      { label: "2. aを代入する", answers: ["(√3+1)(√3−1)=3−1"] },
      { label: "3. 値を求める", answers: ["3−1=2"] }
    ],
    "term-20260713-math-challenge-013": [
      { label: "1. 平方の差にする", answers: ["99²−1²=(99−1)(99+1)"] },
      { label: "2. 計算する", answers: ["98×100=9800"] }
    ],
    "term-20260713-math-challenge-015": [
      { label: "1. 完全平方の公式を使う", answers: ["(x+2y)²=x²+2×x×2y+(2y)²"] },
      { label: "2. 積を計算する", answers: ["x²+4xy+4y²"] }
    ],
    "term-20260713-math-challenge-017": [
      { label: "1. 根号を簡単にする", answers: ["√27+√12=3√3+2√3"] },
      { label: "2. まとめて割る", answers: ["5√3÷√3=5"] }
    ],
    "term-20260713-math-challenge-018": [
      { label: "1. 展開公式を書く", answers: ["(x+p)(x+q)=x²+(p+q)x+pq"] },
      { label: "2. 表の値を代入する", answers: ["x²−x−12"] }
    ],
    "term-20260713-math-final-001": [
      { label: "1. 前半を展開する", answers: ["(3x−2)(2x+5)=6x²+11x−10"] },
      { label: "2. 後ろの式を引く", answers: ["6x²+11x−10−6x²−7x+10"] },
      { label: "3. 同類項をまとめる", answers: ["4x"] }
    ],
    "term-20260713-math-final-002": [
      { label: "1. 共通因数3をくくる", answers: ["3x²−12=3(x²−4)"] },
      {
        label: "2. 平方の差を使い、最後まで因数分解する",
        answers: [
          "3(x²−4)=3(x−2)(x+2)",
          "3(x²−4)=3(x+2)(x−2)",
          "3(x−2)(x+2)",
          "3(x+2)(x−2)"
        ]
      }
    ],
    "term-20260713-math-final-003": [
      { label: "1. 100を中心に表す", answers: ["103×97=(100+3)(100−3)"] },
      { label: "2. 平方の差を計算する", answers: ["100²−3²=9991"] }
    ],
    "term-20260713-math-final-004": [
      { label: "1. 最初の項を簡単にする", answers: ["√75÷√3=5"] },
      { label: "2. 分母を有理化する", answers: ["4÷√2=2√2"] },
      { label: "3. 2つの結果を足す", answers: ["5+2√2", "2√2+5"] }
    ],
    "term-20260713-math-final-006": [
      {
        label: "1. 72nを平方になる因数と残りに分ける",
        answers: ["72n=2³×3²×n", "72n=36×2n"]
      },
      { label: "2. 指数を偶数にする", answers: ["n=2,√(72×2)=12"] }
    ],
    "term-20260713-math-final-007": [
      { label: "1. 平方の差を因数分解する", answers: ["a²−b²=(a+b)(a−b)"] },
      { label: "2. 条件を代入する", answers: ["45=9(a−b)"] },
      { label: "3. a−bを求める", answers: ["a−b=5"] }
    ],
    "term-20260713-math-final-008": [
      { label: "1. 完全平方を展開する", answers: ["(√6−√2)²=6−4√3+2"] },
      { label: "2. 根号の項を消す", answers: ["8−4√3+4√3=8"] }
    ]
  };

  // A finite, machine-readable taxonomy used by the work-row validator.  The
  // labels remain learner-facing; these values describe the mathematical move
  // that must be demonstrated on that row.
  const MATH_WORK_TRANSFORMATION_TYPES = new Set([
    "expand",
    "distribute",
    "change-signs",
    "combine-like-terms",
    "factor-pair-check",
    "factor",
    "extract-square",
    "rationalize",
    "substitute",
    "prime-factorize",
    "evaluate"
  ]);

  const STATIC_MATH_WORK_TRANSFORMATIONS = {
    "term-20260713-math-core-001": ["expand", "combine-like-terms"],
    "term-20260713-math-core-002": ["change-signs", "combine-like-terms"],
    "term-20260713-math-core-003": ["distribute", "evaluate"],
    "term-20260713-math-core-004": ["evaluate", "evaluate"],
    "term-20260713-math-core-005": ["expand", "combine-like-terms"],
    "term-20260713-math-core-006": ["expand", "combine-like-terms"],
    "term-20260713-math-core-007": ["factor-pair-check", "factor"],
    "term-20260713-math-core-008": ["factor-pair-check", "factor"],
    "term-20260713-math-core-009": ["factor-pair-check", "factor"],
    "term-20260713-math-core-010": ["extract-square", "evaluate"],
    "term-20260713-math-core-011": ["extract-square", "combine-like-terms"],
    "term-20260713-math-core-012": ["evaluate", "evaluate"],
    "term-20260713-math-core-013": ["rationalize", "evaluate"],
    "term-20260713-math-challenge-002": ["factor", "factor"],
    "term-20260713-math-challenge-003": ["factor-pair-check", "factor"],
    "term-20260713-math-challenge-004": ["substitute", ["substitute", "evaluate"]],
    "term-20260713-math-challenge-005": ["factor", "evaluate"],
    "term-20260713-math-challenge-006": ["evaluate", "evaluate"],
    "term-20260713-math-challenge-007": ["extract-square", "evaluate"],
    "term-20260713-math-challenge-008": ["expand", "combine-like-terms"],
    "term-20260713-math-challenge-009": ["evaluate", "combine-like-terms"],
    "term-20260713-math-challenge-011": ["factor", "substitute", "evaluate"],
    "term-20260713-math-challenge-013": ["factor", "evaluate"],
    "term-20260713-math-challenge-015": ["expand", "combine-like-terms"],
    "term-20260713-math-challenge-017": ["extract-square", "evaluate"],
    "term-20260713-math-challenge-018": ["expand", "substitute"],
    "term-20260713-math-final-001": ["expand", "change-signs", "combine-like-terms"],
    "term-20260713-math-final-002": ["factor", "factor"],
    "term-20260713-math-final-003": ["factor", "evaluate"],
    "term-20260713-math-final-004": ["evaluate", "rationalize", "combine-like-terms"],
    "term-20260713-math-final-006": ["prime-factorize", ["prime-factorize", "evaluate"]],
    "term-20260713-math-final-007": ["factor", "substitute", "evaluate"],
    "term-20260713-math-final-008": ["expand", "combine-like-terms"]
  };

  function guidedStep(hint, ...wrongChoices) {
    return {
      hint,
      wrongChoices: wrongChoices.map(([text, feedback]) => ({ text, feedback }))
    };
  }

  const STATIC_MATH_WORK_GUIDANCE = {
    "term-20260713-math-core-001": [
      guidedStep(
        "かっこの前が＋なので、中の各項の符号を変えずに並べます。",
        ["2x+3−4x+5", "後ろのかっこは引いていません。4xも−5も元の符号のままです。"],
        ["2x+3+4x+5", "後ろの定数項は−5です。かっこを外しても符号は変わりません。"],
        ["2x−3+4x−5", "最初の定数項は＋3です。かっこの前が＋なら符号はそのままです。"]
      ),
      guidedStep(
        "xの項どうし、数の項どうしを集め、係数と符号を計算します。",
        ["6x+8", "数の項は3+5ではなく3−5なので、負の値になります。"],
        ["2x−2", "xの項は2x+4xです。係数2と4を足します。"],
        ["6x−8", "3−5は−8ではありません。数直線で3から5戻ると考えます。"]
      )
    ],
    "term-20260713-math-challenge-002": [
      guidedStep(
        "両方の項に共通する2xを見つけ、各項を2xとの積に書き直します。",
        ["2x²+8x=2×x²+2×4x", "2だけでなくxも両方の項に共通しています。最大の共通因数2xを使います。"],
        ["2x²+8x=2x×x+2x×8", "8xを2xで割ると4です。かっこの中の定数を確認します。"],
        ["2x²+8x=2x×2x+2x×4", "2x×2xは4x²です。最初の項は2x×xに直します。"]
      ),
      guidedStep(
        "共通因数2xをかっこの外に出し、残ったxと4を中に並べます。",
        ["2(x+4)", "共通因数のxがかっこの外から抜けています。"],
        ["2x(x+8)", "8x÷2x=4なので、かっこの定数項は4です。"],
        ["x(2x+8)", "式は等しいですが、かっこの中にまだ共通因数2が残っています。最後まで因数分解します。"]
      )
    ],
    "term-20260713-math-challenge-003": [
      guidedStep(
        "積が−15なので符号の異なる2数を探し、和が−2になるかも確認します。",
        ["−5+3=−2,−5×3=15", "負×正の積は負なので−15です。"],
        ["5−3=2,5×(−3)=−15", "積は合いますが和が−2ではなく2です。"],
        ["−1+15=14,(−1)×15=−15", "積だけでなく和も−2になる組を選びます。"]
      ),
      guidedStep(
        "確認した−5と3を、x−5とx＋3の2つのかっこに入れます。",
        ["(x+5)(x−3)", "この組の和は2なので、xの係数が＋2になります。"],
        ["(x−5)(x−3)", "両方を負にすると定数項が＋15になります。"],
        ["(x−1)(x+15)", "積は−15でも和が14です。両方の条件を満たす組を使います。"]
      )
    ],
    "term-20260713-math-challenge-004": [
      guidedStep(
        "(x+y)²を展開した式から2xyを移項し、x²+y²だけを残します。",
        ["x²+y²=(x+y)²+2xy", "(x+y)²=x²+2xy+y²なので、2xyは引いて移項します。"],
        ["x²+y²=(x+y)²−xy", "中央の項はxyではなく2xyです。"],
        ["x²+y²=(x+y−xy)²", "和の平方の公式を使い、平方の外側で2xyを引きます。"]
      ),
      guidedStep(
        "x+yを7、xyを10に置き換え、7の2乗を先に計算します。",
        ["7²+2×10=69", "公式では2xyを引くので、代入後も−です。"],
        ["7²−10=39", "2xyの係数2を忘れず、2×10を引きます。"],
        ["7×2−10=4", "(x+y)²は7×2ではなく7²です。"]
      )
    ],
    "term-20260713-math-challenge-005": [
      guidedStep(
        "同じ2項の和と差の積なので、(a+b)(a−b)=a²−b²を使います。",
        ["(√5+√2)(√5−√2)=(√5−√2)²", "和と差の積は、差のかっこの2乗ではありません。"],
        ["(√5+√2)(√5−√2)=(√5)²+(√2)²", "平方の差の公式なので、2つの2乗の間は−です。"],
        ["(√5+√2)(√5−√2)=√5−√2", "各項を2乗する段階が抜けています。"]
      ),
      guidedStep(
        "(√5)²と(√2)²をそれぞれ整数に直し、その差を求めます。",
        ["5+2=7", "平方の差なので、最後も5−2と引きます。"],
        ["√5−√2", "根号の項はそれぞれ2乗されるため、整数5と2になります。"],
        ["25−4=21", "(√5)²=5、(√2)²=2です。根号の中をさらに2乗しません。"]
      )
    ],
    "term-20260713-math-challenge-006": [
      guidedStep(
        "第1項は係数と根号の両方を2乗し、第2項は根号の中を掛けます。",
        ["(2√3)²=6,√12×√3=6", "(2√3)²では係数2も2乗するので、最初の値は6ではありません。"],
        ["(2√3)²=12,√12×√3=36", "√12×√3=√36です。根号を外すと6になります。"],
        ["(2√3)²=4√3,√12×√3=6", "√3も2乗されるため、根号は残らず3になります。"]
      ),
      guidedStep(
        "元の式は第1項から第2項を引く形です。求めた12と6の順を保ちます。",
        ["12+6=18", "元の演算は足し算ではなく引き算です。"],
        ["12−6=8", "12−6の計算をもう一度確認します。"],
        ["6−12=−6", "元の式では12から6を引きます。順序を逆にしません。"]
      )
    ],
    "term-20260713-math-challenge-007": [
      guidedStep(
        "48=16×3として、√16だけを根号の外へ出します。",
        ["√48=4√2", "48=16×3なので、根号の中に残るのは3です。"],
        ["√48=8√3", "√16は16でも8でもなく4です。"],
        ["√48=√16+√3", "√(16×3)は√16×√3です。足し算には分けられません。"]
      ),
      guidedStep(
        "分子の4√3−√3を3√3にまとめてから、√3で割ります。",
        ["(4√3−√3)÷√3=3√3", "3√3を√3で割ると根号は約分され、3だけが残ります。"],
        ["(4√3−√3)÷√3=4", "分子では4√3から√3を引くので、係数は3です。"],
        ["(4√3−√3)÷√3=1", "分子全体は√3ではなく3√3です。"]
      )
    ],
    "term-20260713-math-challenge-008": [
      guidedStep(
        "縦と横の2項を4通りに掛け、x²、5x、2x、10を作ります。",
        ["(x+2)(x+5)=x²+2x+10", "x×5の5xが抜けています。4つの積をすべて作ります。"],
        ["(x+2)(x+5)=x²+7x+7", "定数項は2+5ではなく2×5です。"],
        ["(x+2)(x+5)=x²+10x+10", "中間の項はx×5と2×xです。2×5をxの係数にしません。"]
      ),
      guidedStep(
        "5xと2xだけを同類項としてまとめ、定数項10はそのまま残します。",
        ["x²+3x+10", "5x+2xなので、係数は5−2ではなく5+2です。"],
        ["x²+10x+7", "xの係数と定数項を入れ替えないよう、項の種類を確認します。"],
        ["x²+7x+7", "定数項は2×5で求めた10のままです。"]
      )
    ],
    "term-20260713-math-challenge-009": [
      guidedStep(
        "2つの項を別々に3xyで割り、係数とx・yの指数をそれぞれ約分します。",
        ["6x²y÷3xy=2x,−9xy²÷3xy=−3", "第2項ではy²÷y=yなので、yが1つ残ります。"],
        ["6x²y÷3xy=2x²,−9xy²÷3xy=−3y", "第1項ではx²÷x=xなので、指数を1つ減らします。"],
        ["6x²y÷3xy=2x,−9xy²÷3xy=3y", "負の項を正の単項式で割るので、−3yです。"]
      ),
      guidedStep(
        "各項を割った結果2xと−3yを、元の符号の順に並べます。",
        ["2x+3y", "第2項は負なので、2x−3yと並べます。"],
        ["6x−3y", "第1項の係数6も3で割るので2xです。"],
        ["2x−3", "第2項ではy²÷y=yとなり、yが残ります。"]
      )
    ],
    "term-20260713-math-challenge-011": [
      guidedStep(
        "2項に共通するaをくくり、a−2の積の形にします。",
        ["a²−2a=a(a+2)", "元の第2項は−2aなので、かっこの中も−2です。"],
        ["a²−2a=a²(1−2)", "−2aにはa²が共通していません。共通因数はaです。"],
        ["a²−2a=2a(a−1)", "a²の係数1は2で割り切れないため、2aは共通因数ではありません。"]
      ),
      guidedStep(
        "a=√3+1をaとa−2の両方へ代入し、a−2=√3−1と整理します。",
        ["(√3+1)(√3−1)=3+1", "和と差の積は平方の差なので、最後は3−1です。"],
        ["(√3+1)²", "2つ目の因数はaではなくa−2です。"],
        ["(√3+1)(√3−2)", "a−2=(√3+1)−2=√3−1です。"]
      ),
      guidedStep(
        "平方の差で得た3−1を引き算して、数値を1つにします。",
        ["3+1=4", "前の段階は3−1です。演算記号を変えません。"],
        ["3−1=3", "1を引いた分だけ値が小さくなります。"],
        ["3−1=1", "3から1を引く計算を確認します。"]
      )
    ],
    "term-20260713-math-challenge-013": [
      guidedStep(
        "99²−1²をa²−b²と見て、(a−b)(a+b)へ変形します。",
        ["99²−1²=(99−1)²", "平方の差は、差の2乗ではありません。"],
        ["99²−1²=(99−1)(99−1)", "2つ目の因数は差ではなく和にします。"],
        ["99²−1²=(99−1)(99+2)", "bは1なので、和の因数は99+1です。"]
      ),
      guidedStep(
        "2つのかっこを98と100に直し、100倍として計算します。",
        ["98+100=198", "因数どうしは足さずに掛けます。"],
        ["98×100=980", "100倍では0を2つ付けます。"],
        ["98×100=98000", "100倍で付ける0は2つです。"]
      )
    ],
    "term-20260713-math-challenge-015": [
      guidedStep(
        "(a+b)²=a²+2ab+b²で、a=x、b=2yとして3項を作ります。",
        ["(x+2y)²=x²+2×x×2y+2y²", "最後の項はb²=(2y)²です。2y²ではありません。"],
        ["(x+2y)²=x²+x×2y+(2y)²", "中央の項はabではなく2abです。"],
        ["(x+2y)²=x²−2×x×2y+(2y)²", "元のかっこが＋なので、中央の項も＋です。"]
      ),
      guidedStep(
        "中央は2×x×2y、最後は(2y)²として係数を計算します。",
        ["x²+2xy+4y²", "中央の係数は2×2=4です。"],
        ["x²+4xy+2y²", "(2y)²では係数2も2乗して4y²になります。"],
        ["x²+4xy−4y²", "元の式は和の平方なので、最後の項は正です。"]
      )
    ],
    "term-20260713-math-challenge-017": [
      guidedStep(
        "27=9×3、12=4×3として、平方数の平方根を外へ出します。",
        ["√27+√12=9√3+4√3", "√9=3、√4=2です。平方数をそのまま外へ出しません。"],
        ["√27+√12=3√3+2√2", "12=4×3なので、2つ目にも√3が残ります。"],
        ["√27+√12=√39", "根号を含む和では、中の数27と12を直接足せません。"]
      ),
      guidedStep(
        "分子を5√3にまとめてから√3で割り、共通する根号を約分します。",
        ["5√3÷√3=5√3", "√3÷√3=1なので、根号は残りません。"],
        ["5√3÷√3=√5", "係数5は根号の外にあり、そのまま残ります。"],
        ["5√3÷√3=5÷3", "√3を3として割るのではなく、同じ根号どうしを約分します。"]
      )
    ],
    "term-20260713-math-challenge-018": [
      guidedStep(
        "x×x、x×q、p×x、p×qの4つの積を作り、2つのxの項をまとめます。",
        ["(x+p)(x+q)=x²+(p×q)x+p+q", "xの係数はpとqの積ではなく、2つのxの項の和です。"],
        ["(x+p)(x+q)=x²+(p+q)+pq", "中央のp+qにはxが掛かります。"],
        ["(x+p)(x+q)=x²+(p+q)x+p+q", "定数項はpとqの和ではなく積です。"]
      ),
      guidedStep(
        "表のp+qをxの係数へ、pqを定数項へ、符号も含めて代入します。",
        ["x²+x−12", "表のp+qは負なので、xの項の符号も負です。"],
        ["x²−x+12", "表のpqは負なので、定数項も−12です。"],
        ["x²−12x−1", "p+qはxの係数、pqは定数項に入れます。2つを逆にしません。"]
      )
    ],
    "term-20260713-math-core-002": [
      guidedStep(
        "かっこの前の−を、中の2aと＋3bの両方に分配して符号を反対にします。",
        ["5a−2b−2a+3b", "＋3bにも前の−を分配するので、−3bになります。"],
        ["5a−2b+2a−3b", "＋2aにも前の−を分配するので、−2aになります。"],
        ["5a−2b+2a+3b", "後ろのかっこ全体を引くため、中の2項を両方とも符号反転します。"]
      ),
      guidedStep(
        "aの項とbの項を別々に集め、5−2と−2−3を計算します。",
        ["3a+b", "bの係数は−2+3ではなく−2−3です。"],
        ["7a−5b", "aの係数は5+2ではなく5−2です。"],
        ["3a−b", "−2b−3bでは、係数の絶対値2と3を足して−5bになります。"]
      )
    ],
    "term-20260713-math-core-003": [
      guidedStep(
        "かっこの外の3xを、2xと−5の両方に1回ずつ掛けます。",
        ["3x×2x−5", "−5にも3xを掛ける必要があります。"],
        ["3x+2x−3x×5", "3xと2xは足さず、分配法則で掛けます。"],
        ["3x×2x+3x×5", "3x×(−5)は負の積なので、後ろは−になります。"]
      ),
      guidedStep(
        "係数どうしと文字どうしを掛けます。x×xはx²、3×5は15です。",
        ["6x−15x", "最初の積ではx×x=x²です。指数2を忘れないようにします。"],
        ["6x²+15x", "3x×(−5)は負の積なので−15xです。"],
        ["6x²−5x", "後ろの係数は3×5=15です。3を掛け忘れています。"]
      )
    ],
    "term-20260713-math-core-004": [
      guidedStep(
        "−12÷3、a²÷a、b÷bに分け、数と文字をそれぞれ割ります。",
        ["−12÷3×a²÷a×b", "分子と分母のbも割る必要があります。b÷bまで書きます。"],
        ["−12÷3×a÷a×b÷b", "分子にはa²があります。a²÷aとして指数を1つ減らします。"],
        ["12÷3×a²÷a×b÷b", "負の数を正の数で割るので、全体の符号は負のままです。"]
      ),
      guidedStep(
        "−12÷3を計算し、a²÷a=a、b÷b=1として残る因数をまとめます。",
        ["4a", "負÷正は負です。最初の−の符号を残します。"],
        ["−4a²", "a²÷aでは指数を1つ引くのでaになります。"],
        ["−4ab", "b÷b=1なので、bは答えに残りません。"]
      )
    ],
    "term-20260713-math-core-007": [
      guidedStep(
        "和が9、積が20になる2数を探し、両方の条件を必ず確認します。",
        ["4+5=9,4×5=9", "和は9ですが、積は4×5=20です。"],
        ["4+5=20,4×5=9", "和と積の結果が逆です。和が9、積が20です。"],
        ["2+10=12,2×10=20", "積は20でも和が9になりません。2条件を両方満たす必要があります。"]
      ),
      guidedStep(
        "和と積を満たす2数を、それぞれxに足す形で2つのかっこに入れます。",
        ["(x−4)(x−5)", "両方を負にするとxの係数が−9になります。"],
        ["(x+2)(x+10)", "積は20でも和が12です。確認した2数を使います。"],
        ["(x+4)(x−5)", "符号が異なると定数項が−20になります。"]
      )
    ],
    "term-20260713-math-core-008": [
      guidedStep(
        "25が5²で、中央の−10xが−2×5×xになっているか確認します。",
        ["25=5²,−10x=−5×x", "完全平方の中央の項は2abです。係数2が必要です。"],
        ["25=(−5)²,−10x=2×5×x", "中央の項は負なので、2つの項の符号は異なる形で考えます。"],
        ["25=25²,−10x=−2×5×x", "25は5の2乗です。25²では625になります。"]
      ),
      guidedStep(
        "a²−2ab+b²=(a−b)²を使い、xと5を同じかっこに入れます。",
        ["(x+5)²", "＋5にすると中央の項が＋10xになります。"],
        ["(x−25)²", "かっこに入れる数は25ではなく、その平方根です。"],
        ["(x−5)(x+5)", "差と和の積はx²−25になり、中央の−10xが出ません。"]
      )
    ],
    "term-20260713-math-core-009": [
      guidedStep(
        "9x²=(3x)²、16=4²と見て、2つの平方の差に直します。",
        ["9x²−16=(9x)²−4²", "(9x)²は81x²です。9x²の平方根は3xです。"],
        ["9x²−16=(3x)²−16²", "16は4²です。16²ではありません。"],
        ["9x²−16=(3x)²+4²", "元の式は差なので、2乗の間も−のままです。"]
      ),
      guidedStep(
        "a²−b²=(a−b)(a+b)を使い、3xと4の差・和を作ります。",
        ["(3x−4)²", "平方の差は同じかっこの2乗ではなく、差と和の積です。"],
        ["(3x−4)(3x−4)", "2つ目のかっこは和にしないと中央の項が消えません。"],
        ["(3x−16)(3x+16)", "使う数は16の平方根である4です。"]
      )
    ],
    "term-20260713-math-core-010": [
      guidedStep(
        "45の因数のうち、根号の外へ出せる平方数を含む組を探します。",
        ["√45=√9+√5", "根号は和に分けられません。45=9×5なので掛け算で分けます。"],
        ["√45=√3×√5", "3×5は15で、45の因数が1つ抜けています。"],
        ["√45=√9×√6", "9×6は54です。元の45になる因数の組を確認します。"]
      ),
      guidedStep(
        "√9を整数に直し、残った√5との掛け算として表します。",
        ["9√5", "√9は9ではなく3です。"],
        ["3+√5", "√9×√5は、3と√5の足し算ではなく掛け算です。"],
        ["√15", "3√5で3を根号の中へ戻すなら、3²×5とする必要があります。"]
      )
    ],
    "term-20260713-math-core-011": [
      guidedStep(
        "12=4×3、27=9×3として、平方数4と9を根号の外へ出します。",
        ["√12+√27=4√3+9√3", "√4=2、√9=3です。平方数をそのまま外へ出してはいけません。"],
        ["√12+√27=2√3+3√2", "27=9×3なので、2つ目にも√3が残ります。"],
        ["√12+√27=√4+√3+√9+√3", "√(ab)は√a×√bです。足し算には分けられません。"]
      ),
      guidedStep(
        "根号の中が同じ√3なので、前の係数2と3だけを足します。",
        ["5√6", "同じ根号の項を足すとき、根号の中は足しません。"],
        ["6√3", "係数は2×3ではなく2+3です。"],
        ["2√3+3√3", "正しい途中ですが、同類項の係数を足して1項にまとめます。"]
      )
    ],
    "term-20260713-math-core-012": [
      guidedStep(
        "√a×√b=√(ab)を使うか、各根号を簡単にしてから掛けます。",
        ["√8×√18=√26", "根号の積では、中の数8と18を足さずに掛けます。"],
        ["√8×√18=2√2×3√3", "√18は3√2です。18=9×2を使います。"],
        ["√8×√18=4√2×9√2", "平方数4と9は、その平方根2と3を外へ出します。"]
      ),
      guidedStep(
        "144の正の平方根を求めます。√は0以上の値を表すことに注意します。",
        ["√144=−12", "√144は正の平方根を表すので12です。"],
        ["√144=72", "平方根は中の数を2で割る計算ではありません。2乗して144になる数を探します。"],
        ["6×2=8", "各根号を簡単にした場合、最後は6×2を掛けます。"]
      )
    ],
    "term-20260713-math-core-013": [
      guidedStep(
        "分母の√3と同じ√3を分子・分母に掛け、分母を3にします。",
        ["6÷√3=6÷3", "分母の√3だけを3に変えることはできません。分子にも√3を掛けます。"],
        ["6÷√3=6√3÷√3", "分子だけに√3を掛けると、元の式と値が変わります。"],
        ["6÷√3=6√3÷6", "分母は√3×√3=3です。6にはなりません。"]
      ),
      guidedStep(
        "6√3÷3では、係数6だけを3で割り、√3はそのまま残します。",
        ["6√3÷3=2", "3で割るのは係数6です。√3は消えません。"],
        ["6√3÷3=6√3", "係数6を3で割る必要があります。"],
        ["6√3÷3=3√2", "根号の中を3で割るのではなく、外の係数6を割ります。"]
      )
    ],
    "term-20260713-math-final-001": [
      guidedStep(
        "前半の2つのかっこを4通りに掛け、x²の項、xの項、定数項を整理します。",
        ["(3x−2)(2x+5)=6x²+15x−4x+10", "定数項は(−2)×5なので−10です。"],
        ["(3x−2)(2x+5)=6x²+15x−2x−10", "(−2)×2xは−4xです。係数2も掛けます。"],
        ["(3x−2)(2x+5)=6x²+7x−10", "xの係数は15−4=11です。"]
      ),
      guidedStep(
        "後ろのかっこ全体を引くので、6x²、7x、−10の符号をすべて反対にします。",
        ["6x²+11x−10−6x²+7x−10", "＋7xは引くと−7x、−10は引くと＋10になります。"],
        ["6x²+11x−10−6x²−7x−10", "後ろの−10を引くので、最後は＋10です。"],
        ["6x²+11x−10+6x²+7x−10", "かっこ全体を引くため、後ろの各項を符号反転します。"]
      ),
      guidedStep(
        "x²の項と定数項は互いに打ち消し、11x−7xだけを計算します。",
        ["18x", "xの項は11x+7xではなく11x−7xです。"],
        ["4x−20", "定数項は−10+10=0で打ち消し合います。"],
        ["−4x", "11x−7xは正の4xです。"]
      )
    ],
    "term-20260713-math-final-002": [
      guidedStep(
        "両方の項を3で割り、共通因数3をかっこの外へ出します。",
        ["3x²−12=3(x²−12)", "12も3で割るので、かっこの中は−4です。"],
        ["3x²−12=x(3x−12)", "定数項−12にはxがないため、xは共通因数ではありません。"],
        ["3x²−12=3x(x−4)", "−12にはxがないため、3xを共通因数にはできません。"]
      ),
      guidedStep(
        "かっこの中をx²−2²と見て、平方の差を差と和の積にします。外の3も残します。",
        ["3(x−2)²", "平方の差は同じかっこの2乗ではなく、差と和の積です。"],
        ["3(x−4)(x+4)", "4は2²なので、因数に入れる数は2です。"],
        ["(3x−2)(x+2)", "外の3は式全体の因数です。一方のxだけに掛けません。"]
      )
    ],
    "term-20260713-math-final-003": [
      guidedStep(
        "103と97が100からそれぞれ＋3、−3であることを使い、和と差の積にします。",
        ["103×97=(100+3)(100+3)", "97は100−3です。2つ目の符号は−になります。"],
        ["103×97=(100−3)(100−3)", "103は100+3です。1つ目の符号は＋になります。"],
        ["103×97=(100+3)(100−7)", "97と100の差は7ではなく3です。"]
      ),
      guidedStep(
        "(100+3)(100−3)=100²−3²を使い、2つの平方の差を計算します。",
        ["100²+3²=10009", "和と差の積は平方の和ではなく平方の差です。"],
        ["100²−3=9997", "後ろの3も2乗して9を引きます。"],
        ["100−3²=91", "最初の100も2乗されます。"]
      )
    ],
    "term-20260713-math-final-004": [
      guidedStep(
        "同じ根号どうしの割り算として、√75÷√3=√(75÷3)を使います。",
        ["√75÷√3=√72", "根号の割り算では中の数を引かず、75÷3を計算します。"],
        ["√75÷√3=25", "75÷3=25のあと、√25を求める必要があります。"],
        ["√75÷√3=√75÷3", "分母の√3をそのまま3に変えることはできません。"]
      ),
      guidedStep(
        "分子・分母に√2を掛けて分母を2にし、外の係数4を約分します。",
        ["4÷√2=4√2", "有理化後の分母は2です。4√2を2で割ります。"],
        ["4÷√2=2", "有理化しても分子の√2は残ります。"],
        ["4÷√2=√2", "4÷2=2なので、根号の前の係数は2です。"]
      ),
      guidedStep(
        "5は整数項、2√2は根号の項です。同類項ではないので、そのまま和で表します。",
        ["7√2", "5を5√2として扱うことはできません。異なる種類の項です。"],
        ["5+2+√2", "2√2は2と√2の足し算ではなく掛け算です。"],
        ["10√2", "整数5と根号の項2√2は掛けません。"]
      )
    ],
    "term-20260713-math-final-006": [
      guidedStep(
        "72=2³×3²と素因数分解し、nを掛けたとき各指数が偶数になる条件を見ます。",
        ["72n=2²×3²×n", "72には2が3個あります。2³×3²です。"],
        ["72n=2³×3×n", "72には3が2個あります。3²を忘れないようにします。"],
        ["72n=8×9+n", "nは72に掛ける数なので、8×9×nと積で表します。"]
      ),
      guidedStep(
        "指数が奇数の2を1つ補う最小のnを選び、72nが完全平方数になるか確かめます。",
        ["n=1,√(72×1)=6√2", "n=1では根号が残り、整数になりません。"],
        ["n=3,√(72×3)=6√6", "n=3でも根号が残るため整数になりません。"],
        ["n=8,√(72×8)=24", "整数にはなりますが、求めるのは最小の自然数です。もっと小さいnがあります。"]
      )
    ],
    "term-20260713-math-final-007": [
      guidedStep(
        "平方の差の公式で、和の因数と差の因数を1つずつ作り、与えられたa+bを使える形にします。",
        ["a²−b²=(a−b)²", "平方の差は差の2乗ではありません。"],
        ["a²−b²=(a+b)²", "和の2乗では中央の項2abが生じます。"],
        ["a²−b²=(a−b)(a−b)", "2つ目の因数は差ではなく和です。"]
      ),
      guidedStep(
        "a²−b²を45、a+bを9に置き換え、未知のa−bだけを残します。",
        ["45=9(a+b)", "9はすでにa+bの値です。残す因数はa−bです。"],
        ["45=(a−b)", "因数a+b=9を掛ける必要があります。"],
        ["9=45(a−b)", "左辺のa²−b²が45、因数a+bが9です。代入位置を逆にしません。"]
      ),
      guidedStep(
        "45=9(a−b)の両辺を9で割り、a−bを1つだけにします。",
        ["a−b=36", "45−9ではありません。9(a−b)からa−bを求めるには45を9で割ります。"],
        ["a−b=9", "45÷5ではありません。a−bに掛かっている係数9で割ります。"],
        ["a−b=4", "9−5ではありません。与えられた式45=9(a−b)から45÷9を計算します。"]
      )
    ],
    "term-20260713-math-final-008": [
      guidedStep(
        "(a−b)²=a²−2ab+b²で、a=√6、b=√2として3項を作ります。",
        ["(√6−√2)²=6+4√3+2", "差の2乗では中央の項は負です。"],
        ["(√6−√2)²=6−2√3+2", "中央は−2×√6×√2なので、係数2がもう1つ必要です。"],
        ["(√6−√2)²=6−4√3−2", "最後は(−√2)²なので＋2です。"]
      ),
      guidedStep(
        "−4√3と＋4√3は符号が反対の同類項なので0になり、整数項だけが残ります。",
        ["8−8√3", "−4√3と＋4√3は足し合わず、打ち消し合います。"],
        ["8+4√3", "展開で生じた−4√3も残してから、＋4√3とまとめます。"],
        ["12", "4√3の係数4だけを整数項へ足すことはできません。根号の項どうしでまとめます。"]
      )
    ]
  };

  function applyMathWorkAnswers(questions) {
    return questions.map((question) => {
      if (question.subject !== "数学" || question.type !== "input") return question;
      const workSteps = question.workSteps || STATIC_MATH_WORK_STEPS[question.id];
      const transformations = STATIC_MATH_WORK_TRANSFORMATIONS[question.id] || [];
      const guidance = STATIC_MATH_WORK_GUIDANCE[question.id] || [];
      if (!Array.isArray(workSteps) || workSteps.length < 2) {
        throw new Error(question.id + ": missing intermediate math work steps");
      }
      if (transformations.length && transformations.length !== workSteps.length) {
        throw new Error(question.id + ": work-step transformation count mismatch");
      }
      return {
        ...question,
        answerMode: "drag-work",
        formatTag: "操作型",
        placeholder: "途中式をタイルで作る",
        workResult: Array.isArray(question.answerText) ? question.answerText[0] : question.answerText,
        workSteps: workSteps.map((step, stepIndex) => ({
          label: step.label,
          answers: step.answers.slice(),
          hint: step.hint || guidance[stepIndex]?.hint,
          choices: Array.isArray(step.choices)
            ? step.choices.map((choice) => typeof choice === "string" ? choice : { ...choice })
            : guidance[stepIndex]
              ? [
                { text: step.answers[0] },
                ...guidance[stepIndex].wrongChoices.map((choice) => ({ ...choice }))
              ]
              : undefined,
          requiredTransformation: Array.isArray(step.requiredTransformation || transformations[stepIndex])
            ? (step.requiredTransformation || transformations[stepIndex]).slice()
            : step.requiredTransformation || transformations[stepIndex]
        }))
      };
    });
  }

  const MATH_REF_EXPAND = "数学ワーク p.8〜17（多項式・式の展開）";
  const MATH_REF_FACTOR = "数学ワーク p.18〜33（因数分解・式の利用）";
  const MATH_REF_APPLY = "数学ワーク p.26〜33（式の計算の利用・章末問題）";
  const MATH_REF_ROOT = "数学ワーク p.34〜55（平方根）";

  const mathQuestions = applyMathWorkAnswers([
    input({
      id: "term-20260713-math-core-001", subject: "数学", unit: "多項式", tier: "core",
      examSkill: "同類項をまとめる", mistakeTags: ["符号ミス", "同類項"], paperRef: MATH_REF_EXPAND,
      skills: ["多項式の加法", "同類項"], variantGroup: "math-polynomial-simplify",
      prompt: "(2x + 3) + (4x - 5) を計算しなさい。",
      answerText: ["6x-2", "6x−2"], placeholder: "答えを入力",
      explanation: "xの項は2x+4x=6x、数の項は3-5=-2なので、6x-2です。"
    }),
    input({
      id: "term-20260713-math-core-002", subject: "数学", unit: "多項式", tier: "core",
      examSkill: "かっこを外して整理する", mistakeTags: ["符号ミス", "かっこ外し"], paperRef: MATH_REF_EXPAND,
      skills: ["多項式の減法", "同類項"], variantGroup: "math-polynomial-simplify",
      prompt: "(5a - 2b) - (2a + 3b) を計算しなさい。",
      answerText: ["3a-5b", "3a−5b"], placeholder: "答えを入力",
      explanation: "後ろのかっこの各項の符号を変え、5a-2b-2a-3b=3a-5bです。"
    }),
    input({
      id: "term-20260713-math-core-003", subject: "数学", unit: "多項式", tier: "core",
      examSkill: "単項式を分配する", mistakeTags: ["分配法則", "次数ミス"], paperRef: MATH_REF_EXPAND,
      skills: ["単項式と多項式の乗法", "分配法則"], variantGroup: "math-polynomial-expand",
      prompt: "3x(2x - 5) を展開しなさい。",
      answerText: ["6x²-15x", "6x^2-15x", "6x²−15x"], placeholder: "答えを入力",
      explanation: "3xを両方の項にかけると、3x×2x=6x²、3x×(-5)=-15xです。"
    }),
    input({
      id: "term-20260713-math-core-004", subject: "数学", unit: "多項式", tier: "core",
      examSkill: "単項式の除法を処理する", mistakeTags: ["符号ミス", "指数法則"], paperRef: MATH_REF_EXPAND,
      skills: ["単項式の除法", "文字の約分"], variantGroup: "math-monomial-divide",
      prompt: "(-12a²b) ÷ (3ab) を計算しなさい。",
      answerText: ["-4a", "−4a"], placeholder: "答えを入力",
      explanation: "係数は-12÷3=-4、a²÷a=a、b÷b=1なので、-4aです。"
    }),
    input({
      id: "term-20260713-math-core-005", subject: "数学", unit: "式の展開", tier: "core",
      examSkill: "2つの1次式を展開する", mistakeTags: ["展開ミス", "定数項"], paperRef: MATH_REF_EXPAND,
      skills: ["乗法公式", "展開"], variantGroup: "math-binomial-product",
      prompt: "(x + 4)(x + 7) を展開しなさい。",
      answerText: ["x²+11x+28", "x^2+11x+28"], placeholder: "答えを入力",
      explanation: "x²+(4+7)x+4×7=x²+11x+28です。"
    }),
    input({
      id: "term-20260713-math-core-006", subject: "数学", unit: "式の展開", tier: "core",
      examSkill: "係数のある2つの1次式を展開する", mistakeTags: ["展開ミス", "符号ミス"], paperRef: MATH_REF_EXPAND,
      skills: ["分配法則", "展開"], variantGroup: "math-binomial-product",
      prompt: "(2x - 3)(x + 5) を展開しなさい。",
      answerText: ["2x²+7x-15", "2x^2+7x-15", "2x²+7x−15"], placeholder: "答えを入力",
      explanation: "2x²+10x-3x-15を整理して、2x²+7x-15です。"
    }),
    input({
      id: "term-20260713-math-core-007", subject: "数学", unit: "因数分解", tier: "core",
      examSkill: "和と積から因数を見つける", mistakeTags: ["因数の組", "符号ミス"], paperRef: MATH_REF_FACTOR,
      skills: ["因数分解", "和と積"], variantGroup: "math-factor-pair",
      prompt: "x² + 9x + 20 を因数分解しなさい。",
      answerText: ["(x+4)(x+5)", "(x+5)(x+4)"], placeholder: "答えを入力",
      explanation: "和が9、積が20になる2数は4と5なので、(x+4)(x+5)です。"
    }),
    input({
      id: "term-20260713-math-core-008", subject: "数学", unit: "因数分解", tier: "core",
      examSkill: "完全平方の公式を使う", mistakeTags: ["乗法公式", "符号ミス"], paperRef: MATH_REF_FACTOR,
      skills: ["因数分解", "完全平方"], variantGroup: "math-factor-square",
      prompt: "x² - 10x + 25 を因数分解しなさい。",
      answerText: ["(x-5)²", "(x-5)^2", "(x−5)²", "(5-x)²", "(5-x)^2", "(5−x)²"], placeholder: "答えを入力",
      explanation: "25=5²で、中央の項が-2×5×x=-10xなので、(x-5)²です。"
    }),
    input({
      id: "term-20260713-math-core-009", subject: "数学", unit: "因数分解", tier: "core",
      examSkill: "平方の差を因数分解する", mistakeTags: ["公式忘れ", "平方の差"], paperRef: MATH_REF_FACTOR,
      skills: ["因数分解", "平方の差"], variantGroup: "math-factor-difference",
      prompt: "9x² - 16 を因数分解しなさい。",
      answerText: ["(3x-4)(3x+4)", "(3x+4)(3x-4)"], placeholder: "答えを入力",
      explanation: "9x²-16=(3x)²-4²なので、(3x-4)(3x+4)です。"
    }),
    input({
      id: "term-20260713-math-core-010", subject: "数学", unit: "平方根", tier: "core",
      examSkill: "根号の中を簡単にする", mistakeTags: ["平方数の見落とし", "根号処理"], paperRef: MATH_REF_ROOT,
      skills: ["平方根", "根号の簡単化"], variantGroup: "math-root-simplify",
      prompt: "√45 を a√b の形で簡単にしなさい。",
      answerText: ["3√5"], placeholder: "答えを入力",
      explanation: "45=9×5なので、√45=√9×√5=3√5です。"
    }),
    input({
      id: "term-20260713-math-core-011", subject: "数学", unit: "平方根", tier: "core",
      examSkill: "根号を簡単にして加える", mistakeTags: ["根号処理", "同類項"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の加法", "根号の簡単化"], variantGroup: "math-root-add",
      prompt: "√12 + √27 を簡単にしなさい。",
      answerText: ["5√3"], placeholder: "答えを入力",
      explanation: "√12=2√3、√27=3√3なので、合計は5√3です。"
    }),
    input({
      id: "term-20260713-math-core-012", subject: "数学", unit: "平方根", tier: "core",
      examSkill: "平方根の積を計算する", mistakeTags: ["根号処理", "計算ミス"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の乗法", "根号の簡単化"], variantGroup: "math-root-product",
      prompt: "√8 × √18 を計算しなさい。",
      answerText: ["12"], placeholder: "答えを入力",
      explanation: "√8×√18=√144=12です。2√2×3√2としても12になります。"
    }),
    input({
      id: "term-20260713-math-core-013", subject: "数学", unit: "平方根", tier: "core",
      examSkill: "分母を有理化する", mistakeTags: ["有理化", "約分忘れ"], paperRef: MATH_REF_ROOT,
      skills: ["分母の有理化", "平方根の除法"], variantGroup: "math-root-rationalize",
      prompt: "6/√3 の分母を有理化しなさい。",
      answerText: ["2√3"], placeholder: "答えを入力",
      explanation: "分子・分母に√3をかけると6√3/3となり、2√3です。"
    }),
    findError({
      id: "term-20260713-math-core-014", subject: "数学", unit: "平方根", tier: "core",
      examSkill: "平方根の誤った分配を見抜く", mistakeTags: ["根号の性質", "思い込み"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の意味", "誤答分析"],
      prompt: "生徒が √(9+16)=√9+√16=7 と計算した。最初の誤りを選びなさい。",
      choices: ["√(a+b)を√a+√bに分けた", "√9を3とした", "√16を4とした", "3+4を7とした"], answer: 0,
      explanation: "平方根は和には分配できません。√(9+16)=√25=5です。"
    }),

    findError({
      id: "term-20260713-math-challenge-001", subject: "数学", unit: "式の展開", tier: "challenge",
      examSkill: "完全平方の展開ミスを特定する", mistakeTags: ["中項忘れ", "乗法公式"], paperRef: MATH_REF_EXPAND,
      skills: ["完全平方の展開", "誤答分析"],
      prompt: "生徒が (x-3)²=x²+9 とした。どこが誤りですか。",
      choices: ["中央の項 -6x が抜けている", "x²はxにすべき", "定数項は+3にすべき", "誤りはない"], answer: 0,
      explanation: "(a-b)²=a²-2ab+b²なので、(x-3)²=x²-6x+9です。"
    }),
    input({
      id: "term-20260713-math-challenge-002", subject: "数学", unit: "因数分解", tier: "challenge",
      examSkill: "共通因数をくくる", mistakeTags: ["共通因数", "くくり残し"], paperRef: MATH_REF_FACTOR,
      skills: ["共通因数", "因数分解"], variantGroup: "math-factor-common",
      prompt: "2x² + 8x を因数分解しなさい。",
      answerText: ["2x(x+4)", "(x+4)(2x)"], placeholder: "答えを入力",
      explanation: "2xが両方の項の共通因数なので、2x(x+4)です。"
    }),
    input({
      id: "term-20260713-math-challenge-003", subject: "数学", unit: "因数分解", tier: "challenge",
      examSkill: "符号の異なる2数で因数分解する", mistakeTags: ["因数の組", "符号ミス"], paperRef: MATH_REF_FACTOR,
      skills: ["因数分解", "和と積"], variantGroup: "math-factor-pair",
      prompt: "x² - 2x - 15 を因数分解しなさい。",
      answerText: ["(x-5)(x+3)", "(x+3)(x-5)"], placeholder: "答えを入力",
      explanation: "和が-2、積が-15になる2数は-5と3なので、(x-5)(x+3)です。"
    }),
    input({
      id: "term-20260713-math-challenge-004", subject: "数学", unit: "式の展開", tier: "challenge",
      examSkill: "展開公式から式の値を求める", mistakeTags: ["公式の変形", "代入ミス"], paperRef: MATH_REF_APPLY,
      skills: ["恒等式", "式の値"], variantGroup: "math-identity-value",
      prompt: "x+y=7、xy=10 のとき、x²+y² の値を求めなさい。",
      answerText: ["29"], placeholder: "答えを入力",
      explanation: "x²+y²=(x+y)²-2xy=7²-2×10=29です。"
    }),
    input({
      id: "term-20260713-math-challenge-005", subject: "数学", unit: "平方根", tier: "challenge",
      examSkill: "共役な式の積を計算する", mistakeTags: ["平方の差", "根号処理"], paperRef: MATH_REF_ROOT,
      skills: ["平方の差", "平方根の乗法"], variantGroup: "math-root-conjugate",
      prompt: "(√5 + √2)(√5 - √2) を計算しなさい。",
      answerText: ["3"], placeholder: "答えを入力",
      explanation: "(a+b)(a-b)=a²-b²を使い、5-2=3です。"
    }),
    input({
      id: "term-20260713-math-challenge-006", subject: "数学", unit: "平方根", tier: "challenge",
      examSkill: "平方根を含む複数の項を計算する", mistakeTags: ["根号処理", "計算順序"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の四則計算", "式の整理"], variantGroup: "math-root-mixed",
      prompt: "(2√3)² - √12×√3 を計算しなさい。",
      answerText: ["6"], placeholder: "答えを入力",
      explanation: "(2√3)²=12、√12×√3=√36=6なので、12-6=6です。"
    }),
    input({
      id: "term-20260713-math-challenge-007", subject: "数学", unit: "平方根", tier: "challenge",
      examSkill: "根号を簡単にして除法を行う", mistakeTags: ["根号処理", "約分忘れ"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の除法", "根号の簡単化"], variantGroup: "math-root-mixed",
      prompt: "(√48 - √3) ÷ √3 を計算しなさい。",
      answerText: ["3"], placeholder: "答えを入力",
      explanation: "√48=4√3なので、(4√3-√3)÷√3=3√3÷√3=3です。"
    }),
    input({
      id: "term-20260713-math-challenge-008", subject: "数学", unit: "式の展開", tier: "challenge",
      examSkill: "図形の辺から面積の式を作る", mistakeTags: ["立式", "展開ミス"], paperRef: MATH_REF_EXPAND,
      skills: ["式の展開", "面積の立式"], variantGroup: "math-area-expand", formatTag: "複合",
      prompt: "縦が(x+2)cm、横が(x+5)cmの長方形の面積を、展開した式で答えなさい。",
      answerText: ["x²+7x+10", "x^2+7x+10"], placeholder: "答えを入力",
      explanation: "面積は(x+2)(x+5)。展開するとx²+7x+10です。"
    }),
    input({
      id: "term-20260713-math-challenge-009", subject: "数学", unit: "多項式", tier: "challenge",
      examSkill: "多項式を単項式で割る", mistakeTags: ["各項の割り忘れ", "符号ミス"], paperRef: MATH_REF_EXPAND,
      skills: ["多項式の除法", "文字の約分"], variantGroup: "math-polynomial-divide",
      prompt: "(6x²y - 9xy²) ÷ 3xy を計算しなさい。",
      answerText: ["2x-3y", "2x−3y"], placeholder: "答えを入力",
      explanation: "各項を3xyで割ると、6x²y÷3xy=2x、-9xy²÷3xy=-3yです。"
    }),
    findError({
      id: "term-20260713-math-challenge-010", subject: "数学", unit: "平方根", tier: "challenge",
      examSkill: "分数の平方根の誤りを見抜く", mistakeTags: ["分母の平方根", "計算ミス"], paperRef: MATH_REF_ROOT,
      skills: ["分数の平方根", "誤答分析"],
      prompt: "生徒が √(4/9)=2/9 とした。誤りの説明として正しいものを選びなさい。",
      choices: ["分母9の平方根を取っていない", "分子4の平方根は4である", "4/9は平方根を持たない", "誤りはない"], answer: 0,
      explanation: "√(4/9)=√4/√9=2/3です。分母も平方根にします。"
    }),
    input({
      id: "term-20260713-math-challenge-011", subject: "数学", unit: "平方根", tier: "challenge",
      examSkill: "文字に根号を含む式の値を求める", mistakeTags: ["代入ミス", "展開ミス"], paperRef: MATH_REF_ROOT,
      skills: ["式の値", "平方根を含む展開"], variantGroup: "math-root-substitution",
      prompt: "a=√3+1 のとき、a²-2a の値を求めなさい。",
      answerText: ["2"], placeholder: "答えを入力",
      explanation: "a²-2a=a(a-2)=(√3+1)(√3-1)=3-1=2です。"
    }),
    choice({
      id: "term-20260713-math-challenge-012", subject: "数学", unit: "平方根", tier: "challenge",
      examSkill: "平方根の大小を整数で挟む", formatTag: "短問", mistakeTags: ["平方数", "大小比較"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の大小", "平方数"],
      prompt: "√70 を連続する2つの整数で挟んだものはどれですか。",
      choices: ["8<√70<9", "7<√70<8", "9<√70<10", "10<√70<11"], answer: 0,
      explanation: "8²=64、9²=81で、64<70<81だから8<√70<9です。"
    }),
    input({
      id: "term-20260713-math-challenge-013", subject: "数学", unit: "式の展開", tier: "challenge",
      examSkill: "平方の差を利用して暗算する", mistakeTags: ["公式の選択", "計算ミス"], paperRef: MATH_REF_APPLY,
      skills: ["平方の差", "工夫した計算"], variantGroup: "math-identity-number",
      prompt: "平方の差を利用して 99²-1 を計算しなさい。",
      answerText: ["9800"], placeholder: "答えを入力",
      explanation: "99²-1²=(99-1)(99+1)=98×100=9800です。"
    }),
    choice({
      id: "term-20260713-math-challenge-014", subject: "数学", unit: "因数分解", tier: "challenge",
      examSkill: "式を因数分解して性質を説明する", formatTag: "複合", mistakeTags: ["文字式説明", "因数分解"], paperRef: MATH_REF_FACTOR,
      skills: ["文字式による説明", "完全平方"],
      prompt: "nとn+2が連続する2つの奇数であるとき、n(n+2)+1について必ずいえることはどれですか。",
      choices: ["(n+1)²となり、平方数である", "2n+3となり、必ず素数である", "n²+2となり、必ず奇数である", "n(n+1)となり、必ず偶数である"], answer: 0,
      explanation: "n(n+2)+1=n²+2n+1=(n+1)²なので、必ず平方数です。"
    }),
    input({
      id: "term-20260713-math-challenge-015", subject: "数学", unit: "式の展開", tier: "challenge",
      examSkill: "2文字の完全平方を展開する", mistakeTags: ["中項の係数", "乗法公式"], paperRef: MATH_REF_EXPAND,
      skills: ["完全平方の展開", "2文字の式"], variantGroup: "math-binomial-square",
      prompt: "(x+2y)² を展開しなさい。",
      answerText: ["x²+4xy+4y²", "x^2+4xy+4y^2"], placeholder: "答えを入力",
      explanation: "x²+2×x×2y+(2y)²=x²+4xy+4y²です。"
    }),
    findError({
      id: "term-20260713-math-challenge-016", subject: "数学", unit: "因数分解", tier: "challenge",
      examSkill: "完全平方の因数分解を検算する", mistakeTags: ["係数ミス", "展開による検算"], paperRef: MATH_REF_FACTOR,
      skills: ["完全平方", "誤答分析"],
      prompt: "生徒が 4x²+12x+9=(2x+9)² とした。最も適切な指摘を選びなさい。",
      choices: ["右辺を展開すると定数項が81になり一致しない", "4x²は平方にできない", "12xは因数分解では消える", "誤りはない"], answer: 0,
      explanation: "正しくは(2x+3)²です。(2x+9)²では定数項が81になります。"
    }),
    input({
      id: "term-20260713-math-challenge-017", subject: "数学", unit: "平方根", tier: "challenge",
      examSkill: "複数の根号を簡単にして割る", mistakeTags: ["根号処理", "約分忘れ"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の四則計算", "根号の簡単化"], variantGroup: "math-root-mixed",
      prompt: "(√27+√12)/√3 を計算しなさい。",
      answerText: ["5"], placeholder: "答えを入力",
      explanation: "√27=3√3、√12=2√3なので、5√3÷√3=5です。"
    }),
    input({
      id: "term-20260713-math-challenge-018", subject: "数学", unit: "式の展開", tier: "challenge",
      examSkill: "和と積の資料から展開式を作る", formatTag: "資料読取", mistakeTags: ["資料読取", "符号ミス"], paperRef: MATH_REF_EXPAND,
      skills: ["展開", "和と積"], variantGroup: "math-table-expand",
      figure: { kind: "table", caption: "pとqの条件", alt: "pとqの和がマイナス1、積がマイナス12であることを示す表", columns: ["p+q", "pq"], rows: [["-1", "-12"]] },
      prompt: "表の条件を満たすp、qについて、(x+p)(x+q)を展開しなさい。",
      answerText: ["x²-x-12", "x^2-x-12", "x²−x−12"], placeholder: "答えを入力",
      explanation: "(x+p)(x+q)=x²+(p+q)x+pq。表を代入してx²-x-12です。"
    }),

    input({
      id: "term-20260713-math-final-001", subject: "数学", unit: "多項式", tier: "final",
      examSkill: "展開後の式を差し引いて整理する", formatTag: "複合", mistakeTags: ["展開ミス", "かっこ外し"], paperRef: MATH_REF_EXPAND,
      skills: ["式の展開", "多項式の減法"], variantGroup: "math-polynomial-mixed",
      prompt: "(3x-2)(2x+5) - (6x²+7x-10) を計算しなさい。",
      answerText: ["4x"], placeholder: "答えを入力",
      explanation: "前半は6x²+11x-10。後ろの式を引くと、6x²+11x-10-6x²-7x+10=4xです。"
    }),
    input({
      id: "term-20260713-math-final-002", subject: "数学", unit: "因数分解", tier: "final",
      examSkill: "共通因数と平方の差を続けて使う", formatTag: "複合", mistakeTags: ["くくり残し", "公式忘れ"], paperRef: MATH_REF_FACTOR,
      skills: ["共通因数", "平方の差"], variantGroup: "math-factor-multistep",
      prompt: "3x²-12 を最後まで因数分解しなさい。",
      answerText: ["3(x-2)(x+2)", "3(x+2)(x-2)"], placeholder: "答えを入力",
      explanation: "まず3をくくって3(x²-4)。さらに平方の差を使い、3(x-2)(x+2)です。"
    }),
    input({
      id: "term-20260713-math-final-003", subject: "数学", unit: "式の展開", tier: "final",
      examSkill: "和と差の積を利用して暗算する", formatTag: "複合", mistakeTags: ["公式の選択", "暗算ミス"], paperRef: MATH_REF_APPLY,
      skills: ["平方の差", "工夫した計算"], variantGroup: "math-identity-number",
      prompt: "乗法公式を利用して 103×97 を計算しなさい。",
      answerText: ["9991"], placeholder: "答えを入力",
      explanation: "103×97=(100+3)(100-3)=10000-9=9991です。"
    }),
    input({
      id: "term-20260713-math-final-004", subject: "数学", unit: "平方根", tier: "final",
      examSkill: "根号の除法と有理化を組み合わせる", formatTag: "複合", mistakeTags: ["有理化", "根号処理"], paperRef: MATH_REF_ROOT,
      skills: ["平方根の除法", "分母の有理化"], variantGroup: "math-root-mixed",
      prompt: "√75/√3 + 4/√2 を簡単にしなさい。",
      answerText: ["5+2√2", "2√2+5"], placeholder: "答えを入力",
      explanation: "√75/√3=√25=5、4/√2=2√2なので、5+2√2です。"
    }),
    findError({
      id: "term-20260713-math-final-005", subject: "数学", unit: "平方根", tier: "final",
      examSkill: "根号を含む完全平方の誤りを特定する", mistakeTags: ["中項忘れ", "展開ミス"], paperRef: MATH_REF_ROOT,
      skills: ["平方根を含む展開", "誤答分析"],
      prompt: "生徒が (√5+2)²=5+4=9 と計算した。抜けている項を選びなさい。",
      choices: ["4√5", "2√5", "√20/2", "5√2"], answer: 0,
      explanation: "(a+b)²=a²+2ab+b²で、中央の項は2×√5×2=4√5。正解は9+4√5です。"
    }),
    input({
      id: "term-20260713-math-final-006", subject: "数学", unit: "平方根", tier: "final",
      examSkill: "根号が整数になる最小条件を探す", formatTag: "複合", mistakeTags: ["素因数分解", "平方数"], paperRef: MATH_REF_ROOT,
      skills: ["平方根と整数", "素因数分解"], variantGroup: "math-root-integer",
      prompt: "√(72n) が整数になる最小の自然数nを求めなさい。",
      answerText: ["2", "n=2"], placeholder: "答えを入力",
      explanation: "72=2³×3²。指数をすべて偶数にするには2を1個補えばよく、n=2で√144=12です。"
    }),
    input({
      id: "term-20260713-math-final-007", subject: "数学", unit: "因数分解", tier: "final",
      examSkill: "平方の差から条件を逆算する", formatTag: "複合", mistakeTags: ["条件整理", "因数分解"], paperRef: MATH_REF_FACTOR,
      skills: ["平方の差", "式の値"], variantGroup: "math-factor-reasoning",
      prompt: "正の数a、bについて、a²-b²=45、a+b=9である。a-bの値を求めなさい。",
      answerText: ["5"], placeholder: "答えを入力",
      explanation: "a²-b²=(a+b)(a-b)なので、9(a-b)=45。よってa-b=5です。"
    }),
    input({
      id: "term-20260713-math-final-008", subject: "数学", unit: "平方根", tier: "final",
      examSkill: "展開で根号項を打ち消す", formatTag: "複合", mistakeTags: ["展開ミス", "根号処理"], paperRef: MATH_REF_ROOT,
      skills: ["平方根を含む展開", "式の整理"], variantGroup: "math-root-mixed",
      prompt: "(√6-√2)² + 4√3 を計算しなさい。",
      answerText: ["8"], placeholder: "答えを入力",
      explanation: "(√6-√2)²=6-4√3+2=8-4√3。4√3を加えると8です。"
    })
  ]);

  const SCI_REF_HEREDITY = "理科ワーク p.1〜21（遺伝の規則性）";
  const SCI_REF_ION = "理科ワーク p.50〜60（イオンと電離）";
  const SCI_REF_ELECTROLYSIS = "理科ワーク p.50〜60（電気分解）";

  const scienceQuestions = [
    choice({
      id: "term-20260713-sci-core-001", subject: "理科", unit: "遺伝", tier: "core",
      examSkill: "遺伝子と染色体の関係を説明する", mistakeTags: ["用語混同", "知識不足"], paperRef: SCI_REF_HEREDITY,
      skills: ["遺伝子", "染色体"],
      prompt: "形質を決める遺伝子について、最も適切な説明はどれですか。",
      choices: ["遺伝子は染色体にあり、親から子へ伝わる", "遺伝子は食物だけからつくられる", "遺伝子は体細胞には存在しない", "遺伝子は成長後にすべて消える"], answer: 0,
      explanation: "遺伝子は染色体にあり、生殖細胞を通して親から子へ受け継がれます。"
    }),
    choice({
      id: "term-20260713-sci-core-002", subject: "理科", unit: "遺伝", tier: "core",
      examSkill: "純系どうしの交配結果を判断する", mistakeTags: ["顕性・潜性", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["純系", "顕性形質"],
      prompt: "丸い種子の純系AAと、しわの種子の純系aaをかけ合わせた。Aが表す丸い形質が顕性の場合、子の遺伝子型と形質はどうなりますか。",
      choices: ["すべてAaで丸", "すべてAAで丸", "AAとaaが1:1", "すべてaaでしわ"], answer: 0,
      explanation: "AAはAだけ、aaはaだけを生殖細胞へ渡すため、子はすべてAaとなり顕性形質の丸が現れます。"
    }),
    choice({
      id: "term-20260713-sci-core-003", subject: "理科", unit: "遺伝", tier: "core",
      examSkill: "生殖細胞に入る遺伝子を判断する", mistakeTags: ["分離の法則", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["生殖細胞", "分離の法則"],
      prompt: "遺伝子型Aaの個体がつくる生殖細胞に含まれる遺伝子の組合せはどれですか。",
      choices: ["Aをもつものとaをもつもの", "すべてAa", "AAとaa", "Aとaをどちらももたないもの"], answer: 0,
      explanation: "対になった遺伝子Aとaは生殖細胞ができるときに分かれ、各生殖細胞にはどちらか一方が入ります。"
    }),
    choice({
      id: "term-20260713-sci-core-004", subject: "理科", unit: "遺伝", tier: "core",
      examSkill: "遺伝子型の分離比を求める", mistakeTags: ["組合せ漏れ", "比の混同"], paperRef: SCI_REF_HEREDITY,
      skills: ["遺伝子型", "分離比"],
      prompt: "Aaどうしをかけ合わせたとき、子の遺伝子型AA:Aa:aaの比はどれですか。",
      choices: ["1:2:1", "3:1:0", "1:1:1", "2:1:2"], answer: 0,
      explanation: "Aとaの組合せはAA、Aa、Aa、aaの4通りなので、1:2:1です。"
    }),
    choice({
      id: "term-20260713-sci-core-005", subject: "理科", unit: "遺伝", tier: "core",
      examSkill: "顕性形質と潜性形質の分離比を求める", mistakeTags: ["形質比", "遺伝子型との混同"], paperRef: SCI_REF_HEREDITY,
      skills: ["表現型", "分離比"],
      prompt: "Aが表す形質が顕性のとき、Aaどうしの子に現れる顕性形質:潜性形質の比は、理論上どれですか。",
      choices: ["3:1", "1:2:1", "1:1", "すべて顕性形質"], answer: 0,
      explanation: "AAとAaは顕性形質、aaだけが潜性形質なので、3:1です。"
    }),
    choice({
      id: "term-20260713-sci-core-006", subject: "理科", unit: "遺伝", tier: "core",
      examSkill: "潜性形質から遺伝子型を決める", mistakeTags: ["顕性・潜性", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["潜性形質", "遺伝子型"],
      prompt: "Aが顕性形質を、aが潜性形質を現す遺伝子である。潜性形質が現れた個体の遺伝子型はどれですか。",
      choices: ["aa", "AA", "Aa", "AAまたはAa"], answer: 0,
      explanation: "Aが1つでもあれば顕性形質が現れるため、潜性形質の個体はaaです。"
    }),
    choice({
      id: "term-20260713-sci-core-007", subject: "理科", unit: "イオン", tier: "core",
      examSkill: "イオンのでき方を説明する", mistakeTags: ["電子と陽子", "電荷"], paperRef: SCI_REF_ION,
      skills: ["イオン", "電子の授受"],
      prompt: "原子がイオンになるときに起こることとして正しいものはどれですか。",
      choices: ["電子を失うか受け取る", "原子核そのものがなくなる", "陽子と中性子が必ず同数になる", "質量が必ず2倍になる"], answer: 0,
      explanation: "原子が電子を失うと陽イオン、電子を受け取ると陰イオンになります。"
    }),
    choice({
      id: "term-20260713-sci-core-008", subject: "理科", unit: "イオン", tier: "core",
      examSkill: "陽イオンのでき方を判断する", mistakeTags: ["電荷の向き", "電子の授受"], paperRef: SCI_REF_ION,
      skills: ["ナトリウムイオン", "陽イオン"],
      prompt: "ナトリウム原子Naが電子を1個失ったときにできるイオンはどれですか。",
      choices: ["Na⁺", "Na⁻", "Na²⁺", "Cl⁻"], answer: 0,
      explanation: "負の電気をもつ電子を1個失うので、電気的に+1となりNa⁺です。"
    }),
    choice({
      id: "term-20260713-sci-core-009", subject: "理科", unit: "イオン", tier: "core",
      examSkill: "陰イオンのでき方を判断する", mistakeTags: ["電荷の向き", "電子の授受"], paperRef: SCI_REF_ION,
      skills: ["塩化物イオン", "陰イオン"],
      prompt: "塩素原子Clが電子を1個受け取ったときにできるイオンはどれですか。",
      choices: ["Cl⁻", "Cl⁺", "Cl²⁻", "Na⁺"], answer: 0,
      explanation: "負の電気をもつ電子を1個受け取るため、Cl⁻になります。"
    }),
    choice({
      id: "term-20260713-sci-core-010", subject: "理科", unit: "電解質", tier: "core",
      examSkill: "電解質を見分ける", mistakeTags: ["電解質・非電解質", "物質分類"], paperRef: SCI_REF_ION,
      skills: ["電解質", "電気伝導性"],
      prompt: "水に溶かしたとき、できた水溶液に電流が流れる物質はどれですか。",
      choices: ["塩化ナトリウム", "砂糖", "エタノール", "デンプン"], answer: 0,
      explanation: "塩化ナトリウムは水中でNa⁺とCl⁻に電離する電解質です。ほかはここでは非電解質です。"
    }),
    choice({
      id: "term-20260713-sci-core-011", subject: "理科", unit: "電離", tier: "core",
      examSkill: "塩酸の電離式を選ぶ", mistakeTags: ["イオン式", "係数ミス"], paperRef: SCI_REF_ION,
      skills: ["電離式", "塩酸"],
      prompt: "塩化水素HClが水中で電離する式として正しいものはどれですか。",
      choices: ["HCl → H⁺ + Cl⁻", "HCl → H⁻ + Cl⁺", "HCl → H²⁺ + Cl²⁻", "HCl → H + Cl"], answer: 0,
      explanation: "塩化水素は水中で水素イオンH⁺と塩化物イオンCl⁻に分かれます。"
    }),
    choice({
      id: "term-20260713-sci-core-012", subject: "理科", unit: "電気分解", tier: "core",
      examSkill: "塩化銅水溶液の電極生成物を判断する", formatTag: "資料読取", mistakeTags: ["電極の向き", "生成物"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["塩化銅水溶液", "電気分解"],
      figure: { kind: "table", caption: "電極で観察された変化", alt: "陰極に赤色物質、陽極に刺激臭のある気体が見られたことを示す表", columns: ["電極", "観察"], rows: [["陰極", "赤色の物質が付着"], ["陽極", "刺激臭のある気体"]] },
      prompt: "塩化銅水溶液を炭素電極で電気分解した。陰極と陽極に生じた物質の組合せはどれですか。",
      choices: ["陰極:銅、陽極:塩素", "陰極:塩素、陽極:銅", "陰極:酸素、陽極:水素", "陰極:ナトリウム、陽極:銅"], answer: 0,
      explanation: "Cu²⁺は陰極で電子を受け取り銅に、Cl⁻は陽極で塩素になります。"
    }),

    choice({
      id: "term-20260713-sci-challenge-001", subject: "理科", unit: "遺伝", tier: "challenge",
      examSkill: "検定交配の結果から遺伝子型を推定する", formatTag: "資料読取", mistakeTags: ["資料読取", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["検定交配", "遺伝子型の推定"],
      figure: { kind: "table", caption: "丸い種子の個体とaaをかけ合わせた結果", alt: "子の丸い種子が51個、しわの種子が49個だった交配結果の表", columns: ["子の形質", "個体数"], rows: [["丸", "51"], ["しわ", "49"]] },
      prompt: "Aを丸い顕性形質を現す遺伝子とする。表の結果から、調べた丸い個体の遺伝子型は何と考えられますか。",
      choices: ["Aa", "AA", "aa", "表からはAをもたないと分かる"], answer: 0,
      explanation: "aaとの子が丸としわにほぼ1:1で分かれたので、親はAとaの両方をもつAaです。"
    }),
    input({
      id: "term-20260713-sci-challenge-002", subject: "理科", unit: "遺伝", tier: "challenge",
      examSkill: "理論比から期待個体数を求める", formatTag: "資料読取", mistakeTags: ["比の計算", "形質比"], paperRef: SCI_REF_HEREDITY,
      skills: ["分離比", "期待値"], variantGroup: "sci-heredity-count",
      figure: { kind: "table", caption: "交配条件", alt: "Aaどうしを交配して子が160個体生まれたことを示す表", columns: ["親1", "親2", "子の総数"], rows: [["Aa", "Aa", "160"]] },
      prompt: "Aが表す形質が顕性のとき、表の交配で潜性形質の子は理論上何個体と期待されますか。",
      answerText: ["40", "40個体", "40個"], placeholder: "答えを入力",
      explanation: "Aa×Aaで潜性形質aaは全体の1/4なので、160×1/4=40個体です。"
    }),
    choice({
      id: "term-20260713-sci-challenge-003", subject: "理科", unit: "遺伝", tier: "challenge",
      examSkill: "子の分離から親の遺伝子型を推定する", formatTag: "資料読取", mistakeTags: ["資料読取", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["自家受粉", "遺伝子型の推定"],
      figure: { kind: "table", caption: "紫色の花を自家受粉した結果", alt: "子の紫色の花が92個体、白色の花が31個体だった結果の表", columns: ["子の花色", "個体数"], rows: [["紫", "92"], ["白", "31"]] },
      prompt: "紫をA、白をaとし、紫が顕性形質である。表から親の紫色の花の遺伝子型は何と考えられますか。",
      choices: ["Aa", "AA", "aa", "Aをもたない"], answer: 0,
      explanation: "子に潜性形質の白が現れ、紫:白がおよそ3:1なので、親はAaです。"
    }),
    choice({
      id: "term-20260713-sci-challenge-004", subject: "理科", unit: "遺伝", tier: "challenge",
      examSkill: "分離の法則が起こる場面を説明する", mistakeTags: ["分離の法則", "細胞の種類"], paperRef: SCI_REF_HEREDITY,
      skills: ["分離の法則", "生殖細胞"],
      prompt: "Aaの個体からAをもつ生殖細胞とaをもつ生殖細胞ができる理由として最も適切なものはどれですか。",
      choices: ["対になった遺伝子が生殖細胞形成時に分かれるから", "受精後にAがaへ変化するから", "体細胞が必ず半分に切れるから", "顕性形質を現す遺伝子だけが複製されるから"], answer: 0,
      explanation: "対になった遺伝子が生殖細胞のできるときに分かれることを分離の法則といいます。"
    }),
    choice({
      id: "term-20260713-sci-challenge-005", subject: "理科", unit: "遺伝", tier: "challenge",
      examSkill: "実測値と理論比のずれを評価する", formatTag: "資料読取", mistakeTags: ["比の読み取り", "実験誤差"], paperRef: SCI_REF_HEREDITY,
      skills: ["理論比", "確率的なばらつき"],
      figure: { kind: "table", caption: "Aaどうしの子の観察結果", alt: "顕性形質が76個体、潜性形質が24個体だった観察結果の表", columns: ["形質", "個体数"], rows: [["顕性", "76"], ["潜性", "24"]] },
      prompt: "理論比3:1に対して実測値が76:24だった。この結果の解釈として最も適切なものはどれですか。",
      choices: ["個体数が有限なので理論比から少しずれることがある", "分離の法則が必ず誤りである", "潜性形質は遺伝しない", "実測値は必ず75:25でなければ無効である"], answer: 0,
      explanation: "遺伝子の組合せは確率で決まるため、有限の個体数では理論比と完全には一致しないことがあります。"
    }),
    choice({
      id: "term-20260713-sci-challenge-006", subject: "理科", unit: "遺伝", tier: "challenge",
      examSkill: "2つの交配結果を比較して親を特定する", formatTag: "資料読取", mistakeTags: ["表の比較", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["交配表", "遺伝子型の推定"],
      figure: { kind: "table", caption: "aaとの交配結果", alt: "個体PとQをaaと交配したときの顕性形質と潜性形質の個体数を示す表", columns: ["調べた親", "顕性形質の子", "潜性形質の子"], rows: [["個体P", "80", "0"], ["個体Q", "39", "41"]] },
      prompt: "Aが表す形質が顕性である。個体PとQの遺伝子型の組合せとして最も適切なものはどれですか。",
      choices: ["PはAA、QはAa", "PはAa、QはAA", "PもQもaa", "PもQもAA"], answer: 0,
      explanation: "aaとの子がすべて顕性形質ならPはAA、顕性:潜性が1:1ならQはAaと判断できます。"
    }),
    choice({
      id: "term-20260713-sci-challenge-007", subject: "理科", unit: "電解質", tier: "challenge",
      examSkill: "電気伝導性の実験から電解質を判定する", formatTag: "資料読取", mistakeTags: ["資料読取", "電解質・非電解質"], paperRef: SCI_REF_ION,
      skills: ["電気伝導性", "対照実験"],
      figure: { kind: "table", caption: "同じ濃さの水溶液で豆電球をつないだ結果", alt: "塩化ナトリウム水溶液と塩酸では点灯し、砂糖水では点灯しなかった表", columns: ["水溶液", "豆電球"], rows: [["塩化ナトリウム", "点灯"], ["砂糖", "点灯せず"], ["塩酸", "点灯"]] },
      prompt: "表から直接いえることはどれですか。",
      choices: ["塩化ナトリウムと塩化水素は水中でイオンになる", "砂糖水には水がない", "点灯しない物質は必ず金属である", "塩酸には電荷をもつ粒子がない"], answer: 0,
      explanation: "電流が流れた水溶液には移動できるイオンがあり、溶質は電解質だと判断できます。"
    }),
    choice({
      id: "term-20260713-sci-challenge-008", subject: "理科", unit: "イオン", tier: "challenge",
      examSkill: "イオンの移動方向を電荷から判断する", mistakeTags: ["電極の向き", "陽イオン・陰イオン"], paperRef: SCI_REF_ION,
      skills: ["イオンの移動", "銅イオン"],
      prompt: "青色のCu²⁺を含む水溶液に直流電圧をかけると、Cu²⁺は主にどちらへ移動しますか。",
      choices: ["陰極", "陽極", "どちらの電極からも離れる", "電荷に関係なく上へ移動する"], answer: 0,
      explanation: "正の電荷をもつCu²⁺は、負極である陰極へ引かれます。"
    }),
    choice({
      id: "term-20260713-sci-challenge-009", subject: "理科", unit: "電離", tier: "challenge",
      examSkill: "硫酸の電離式を選ぶ", mistakeTags: ["係数ミス", "多原子イオン"], paperRef: SCI_REF_ION,
      skills: ["電離式", "硫酸"],
      prompt: "硫酸H₂SO₄の電離式として正しいものはどれですか。",
      choices: ["H₂SO₄ → 2H⁺ + SO₄²⁻", "H₂SO₄ → H₂⁺ + SO₄⁻", "H₂SO₄ → 2H⁻ + SO₄²⁺", "H₂SO₄ → H⁺ + S⁺ + 4O⁻"], answer: 0,
      explanation: "水素イオンが2個と硫酸イオンSO₄²⁻が1個でき、左右の電荷の合計も0です。"
    }),
    choice({
      id: "term-20260713-sci-challenge-010", subject: "理科", unit: "電離", tier: "challenge",
      examSkill: "水酸化ナトリウムの電離式を選ぶ", mistakeTags: ["イオン式", "電荷の向き"], paperRef: SCI_REF_ION,
      skills: ["電離式", "水酸化物イオン"],
      prompt: "水酸化ナトリウムNaOHの電離式として正しいものはどれですか。",
      choices: ["NaOH → Na⁺ + OH⁻", "NaOH → Na⁻ + OH⁺", "NaOH → Na²⁺ + O²⁻ + H⁺", "NaOH → Na + O + H"], answer: 0,
      explanation: "水酸化ナトリウムはNa⁺とOH⁻に電離します。正負の電荷の合計は0です。"
    }),
    input({
      id: "term-20260713-sci-challenge-011", subject: "理科", unit: "電離", tier: "challenge",
      examSkill: "電離式からイオン数の比を読む", mistakeTags: ["係数ミス", "比の読み取り"], paperRef: SCI_REF_ION,
      skills: ["塩化カルシウム", "イオン数の比"], variantGroup: "sci-ion-ratio",
      prompt: "CaCl₂ → Ca²⁺ + 2Cl⁻ である。生じるCa²⁺とCl⁻の個数の比を最も簡単な整数比で答えなさい。",
      answerText: ["1:2", "1：2"], placeholder: "答えを入力",
      explanation: "式の係数から、Ca²⁺1個に対してCl⁻2個が生じるので1:2です。"
    }),
    choice({
      id: "term-20260713-sci-challenge-012", subject: "理科", unit: "電離", tier: "challenge",
      examSkill: "電荷がつり合う電離式を判断する", mistakeTags: ["係数ミス", "電荷の合計"], paperRef: SCI_REF_ION,
      skills: ["塩化アルミニウム", "電荷保存"],
      prompt: "塩化アルミニウムAlCl₃の電離式として正しいものはどれですか。",
      choices: ["AlCl₃ → Al³⁺ + 3Cl⁻", "AlCl₃ → 3Al⁺ + Cl³⁻", "AlCl₃ → Al⁺ + Cl₃⁻", "AlCl₃ → Al³⁻ + 3Cl⁺"], answer: 0,
      explanation: "Al³⁺の+3とCl⁻3個の-3がつり合うので、Al³⁺+3Cl⁻です。"
    }),
    input({
      id: "term-20260713-sci-challenge-013", subject: "理科", unit: "電気分解", tier: "challenge",
      examSkill: "水の電気分解の体積比を使う", formatTag: "資料読取", mistakeTags: ["気体の比", "電極の取り違え"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["水の電気分解", "気体の体積比"], variantGroup: "sci-electrolysis-gas",
      figure: { kind: "table", caption: "一方の電極で集めた気体", alt: "酸素が12ミリリットル集まったことを示す表", columns: ["気体", "体積"], rows: [["酸素", "12mL"]] },
      prompt: "水に少量の水酸化ナトリウムを加えて電気分解したとき、同じ時間に発生する水素は理論上何mLですか。",
      answerText: ["24", "24mL", "24ml"], placeholder: "答えを入力",
      explanation: "水素:酸素の体積比は2:1なので、酸素12mLに対して水素は24mLです。"
    }),
    choice({
      id: "term-20260713-sci-challenge-014", subject: "理科", unit: "電気分解", tier: "challenge",
      examSkill: "電気分解中の変化を複数の観察から推論する", formatTag: "資料読取", mistakeTags: ["資料読取", "因果関係"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["塩化銅水溶液", "実験考察"],
      figure: { kind: "table", caption: "塩化銅水溶液の電気分解", alt: "電気分解の時間と陰極の質量増加、水溶液の青色の変化を示す表", columns: ["時間", "陰極の質量", "水溶液の青色"], rows: [["開始時", "5.00g", "濃い"], ["5分後", "5.18g", "やや薄い"], ["10分後", "5.34g", "薄い"]] },
      prompt: "表の変化を最もよく説明するものはどれですか。",
      choices: ["Cu²⁺が陰極で銅になり、水溶液中から減った", "陰極の炭素が水に溶けて青くなった", "Cl⁻が陰極で銅に変わった", "Cu²⁺が陽極で新しく生じた"], answer: 0,
      explanation: "青色のCu²⁺が陰極で電子を受け取って銅として付着するため、陰極は重くなり青色は薄くなります。"
    }),
    input({
      id: "term-20260713-sci-challenge-015", subject: "理科", unit: "イオン", tier: "challenge",
      examSkill: "電気的中性から陰イオン数を求める", mistakeTags: ["電荷の合計", "個数計算"], paperRef: SCI_REF_ION,
      skills: ["電気的中性", "イオン数"], variantGroup: "sci-ion-balance",
      prompt: "Ca²⁺が3個ある水溶液が電気的に中性で、陰イオンはCl⁻だけである。Cl⁻は何個ありますか。",
      answerText: ["6", "6個"], placeholder: "答えを入力",
      explanation: "Ca²⁺3個の正電荷は合計+6。打ち消すには-1のCl⁻が6個必要です。"
    }),
    choice({
      id: "term-20260713-sci-challenge-016", subject: "理科", unit: "電気分解", tier: "challenge",
      examSkill: "電極生成物から水溶液を同定する", formatTag: "資料読取", mistakeTags: ["資料読取", "物質同定"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["電極生成物", "水溶液の同定"],
      figure: { kind: "table", caption: "炭素電極で電気分解した結果", alt: "試料XとYについて陰極と陽極で生じた物質を示す表", columns: ["試料", "陰極", "陽極"], rows: [["X", "赤色の固体", "漂白作用のある気体"], ["Y", "気体", "気体"]] },
      prompt: "試料Xとして最も考えやすい水溶液はどれですか。",
      choices: ["塩化銅水溶液", "砂糖水", "エタノール水溶液", "蒸留水"], answer: 0,
      explanation: "陰極の赤色固体は銅、陽極の漂白作用をもつ気体は塩素なので、Xは塩化銅水溶液です。"
    }),

    choice({
      id: "term-20260713-sci-final-001", subject: "理科", unit: "遺伝", tier: "final",
      examSkill: "実測分離比から両親の遺伝子型を決める", formatTag: "複合", mistakeTags: ["資料読取", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["分離比", "遺伝子型の推定"],
      figure: { kind: "table", caption: "丸い種子どうしをかけ合わせた結果", alt: "子の丸い種子が120個、しわの種子が38個だった交配結果の表", columns: ["子の形質", "個体数"], rows: [["丸", "120"], ["しわ", "38"]] },
      prompt: "丸をA、しわをaとし、丸が顕性形質である。両親の遺伝子型として最も適切なものはどれですか。",
      choices: ["AaとAa", "AAとAA", "AAとAa", "aaとaa"], answer: 0,
      explanation: "子にしわaaが現れ、丸:しわがおよそ3:1なので、両親はともにAaです。"
    }),
    input({
      id: "term-20260713-sci-final-002", subject: "理科", unit: "遺伝", tier: "final",
      examSkill: "遺伝子型の比から期待個体数を求める", formatTag: "複合", mistakeTags: ["遺伝子型比", "比の計算"], paperRef: SCI_REF_HEREDITY,
      skills: ["遺伝子型", "期待値"], variantGroup: "sci-heredity-count",
      prompt: "Aaどうしから生まれる子が400個体いるとする。遺伝子型Aaの子は理論上何個体と期待されますか。",
      answerText: ["200", "200個体", "200個"], placeholder: "答えを入力",
      explanation: "AA:Aa:aa=1:2:1なので、Aaは全体の1/2。400×1/2=200個体です。"
    }),
    choice({
      id: "term-20260713-sci-final-003", subject: "理科", unit: "遺伝", tier: "final",
      examSkill: "遺伝と環境の影響を区別する", formatTag: "複合", mistakeTags: ["因果関係", "用語混同"], paperRef: SCI_REF_HEREDITY,
      skills: ["遺伝", "環境要因"],
      prompt: "遺伝子型が同じ挿し木を、明るさだけ異なる場所で育てたところ草丈に差が出た。この結果から最も適切にいえることはどれですか。",
      choices: ["同じ遺伝子型でも環境により形質に差が出ることがある", "草丈は遺伝子と無関係である", "明るさが遺伝子型を必ずAAに変える", "挿し木どうしは遺伝子型が必ず異なる"], answer: 0,
      explanation: "遺伝子型をそろえて環境だけを変えた比較なので、草丈の差には環境が影響したと考えられます。"
    }),
    input({
      id: "term-20260713-sci-final-004", subject: "理科", unit: "イオン", tier: "final",
      examSkill: "多価イオンの電荷から個数を求める", formatTag: "複合", mistakeTags: ["電荷の合計", "係数ミス"], paperRef: SCI_REF_ION,
      skills: ["電気的中性", "多価イオン"], variantGroup: "sci-ion-balance",
      prompt: "Al³⁺が4個あり、陰イオンはCl⁻だけの水溶液が電気的に中性である。Cl⁻は何個ありますか。",
      answerText: ["12", "12個"], placeholder: "答えを入力",
      explanation: "Al³⁺4個の正電荷は合計+12。-1のCl⁻が12個あれば電荷がつり合います。"
    }),
    choice({
      id: "term-20260713-sci-final-005", subject: "理科", unit: "電気分解", tier: "final",
      examSkill: "複数の観察から電極反応を説明する", formatTag: "複合", mistakeTags: ["電極の向き", "観察の根拠"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["塩化銅水溶液", "電極反応"],
      figure: { kind: "table", caption: "塩化銅水溶液を電気分解した観察", alt: "陰極の赤色物質と陽極の漂白作用を示す観察結果の表", columns: ["場所", "観察"], rows: [["陰極", "赤色物質が付き、質量が増加"], ["陽極", "気体が発生し、湿らせた色紙が脱色"]] },
      prompt: "観察を説明する組合せとして正しいものはどれですか。",
      choices: ["陰極で銅が析出し、陽極で塩素が発生した", "陰極で塩素が発生し、陽極で銅が析出した", "両極で銅だけが析出した", "陰極で砂糖、陽極で酸素が生じた"], answer: 0,
      explanation: "赤色の析出物と質量増加は銅、色紙の脱色は塩素の性質に対応します。"
    }),
    choice({
      id: "term-20260713-sci-final-006", subject: "理科", unit: "電気分解", tier: "final",
      examSkill: "気体の性質と電極から電解質を推定する", formatTag: "複合", mistakeTags: ["気体の同定", "資料読取"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["塩酸の電気分解", "気体の性質"],
      figure: { kind: "table", caption: "水溶液Zの電気分解", alt: "陰極で可燃性の気体、陽極で刺激臭と漂白作用のある気体が生じた表", columns: ["電極", "気体の性質"], rows: [["陰極", "火を近づけると音を立てて燃える"], ["陽極", "刺激臭があり色紙を脱色する"]] },
      prompt: "水溶液Zとして最も考えやすいものはどれですか。",
      choices: ["塩酸", "砂糖水", "エタノール水溶液", "食用油"], answer: 0,
      explanation: "陰極の気体は水素、陽極の気体は塩素です。H⁺とCl⁻を含む塩酸が当てはまります。"
    }),
    input({
      id: "term-20260713-sci-final-007", subject: "理科", unit: "イオン", tier: "final",
      examSkill: "イオン1個あたりの電子数から合計を求める", formatTag: "複合", mistakeTags: ["電子数", "掛け算"], paperRef: SCI_REF_ION,
      skills: ["銅イオン", "電子の授受"], variantGroup: "sci-electron-count",
      prompt: "Cu²⁺1個が銅原子になるには電子を2個受け取る。Cu²⁺5個がすべて銅原子になるには、電子が合計何個必要ですか。",
      answerText: ["10", "10個"], placeholder: "答えを入力",
      explanation: "Cu²⁺1個につき電子2個なので、2×5=10個です。"
    }),
    choice({
      id: "term-20260713-sci-final-008", subject: "理科", unit: "電気分解", tier: "final",
      examSkill: "複数の実験結果から試料を対応づける", formatTag: "複合", mistakeTags: ["資料読取", "物質同定"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["電解質", "電極生成物", "総合考察"],
      figure: { kind: "table", caption: "3つの水溶液の実験結果", alt: "試料P、Q、Rの電流と両電極で生じた物質を示す表", columns: ["試料", "電流", "陰極", "陽極"], rows: [["P", "流れない", "変化なし", "変化なし"], ["Q", "流れる", "水素", "塩素"], ["R", "流れる", "銅", "塩素"]] },
      prompt: "P、Q、Rの組合せとして最も適切なものはどれですか。",
      choices: ["P:砂糖水、Q:塩酸、R:塩化銅水溶液", "P:塩酸、Q:砂糖水、R:蒸留水", "P:塩化銅水溶液、Q:砂糖水、R:塩酸", "P:食塩水、Q:蒸留水、R:砂糖水"], answer: 0,
      explanation: "非電解質の砂糖水は電流が流れません。塩酸は水素と塩素、塩化銅水溶液は銅と塩素を生じます。"
    })
  ];

  const ENG_REF_PRESENT_PERFECT = "英語ワーク p.1〜41（現在完了）";

  const englishQuestions = [
    choice({
      id: "term-20260713-eng-core-001", subject: "英語", unit: "現在完了・継続", tier: "core",
      examSkill: "継続期間を表すforを選ぶ", mistakeTags: ["forとsince", "現在完了"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の継続", "for"],
      prompt: "I have lived in this town (    ) five years. 空欄に入る語はどれですか。",
      choices: ["for", "since", "yet", "ever"], answer: 0,
      explanation: "five yearsは期間なのでforを使います。I have lived ... for five years.で「5年間住んでいる」です。"
    }),
    choice({
      id: "term-20260713-eng-core-002", subject: "英語", unit: "現在完了・経験", tier: "core",
      examSkill: "回数表現から経験用法を判断する", mistakeTags: ["用法判別", "過去分詞"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の経験", "回数表現"],
      prompt: "She has visited Nara three times. この文が表す意味として最も近いものはどれですか。",
      choices: ["彼女は奈良を3回訪れたことがある", "彼女は今ちょうど奈良に着いた", "彼女は3年間奈良に住んでいる", "彼女は明日奈良を訪れる"], answer: 0,
      explanation: "three timesは経験の回数を示します。has visitedは「訪れたことがある」です。"
    }),
    choice({
      id: "term-20260713-eng-core-003", subject: "英語", unit: "現在完了・完了", tier: "core",
      examSkill: "justを用いた完了文を作る", mistakeTags: ["過去分詞", "語順"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の完了", "just"],
      prompt: "「健はちょうど宿題を終えたところです」に最も近い英文はどれですか。",
      choices: ["Ken has just finished his homework.", "Ken just has finish his homework.", "Ken has just finish his homework.", "Ken is just finished his homework."], answer: 0,
      explanation: "現在完了はhas+過去分詞。justはhasとfinishedの間に置きます。"
    }),
    choice({
      id: "term-20260713-eng-core-004", subject: "英語", unit: "現在完了・完了", tier: "core",
      examSkill: "yetを用いた否定文を作る", mistakeTags: ["yetの位置", "過去分詞"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の否定", "yet"],
      prompt: "「私はまだ昼食を食べ終えていません」に最も近い英文はどれですか。",
      choices: ["I have not finished lunch yet.", "I did not finished lunch yet.", "I have yet finish lunch.", "I am not finish lunch yet."], answer: 0,
      explanation: "have not+過去分詞で否定し、yetはふつう文末に置きます。"
    }),
    choice({
      id: "term-20260713-eng-core-005", subject: "英語", unit: "現在完了・継続", tier: "core",
      examSkill: "継続の起点を表すsinceを選ぶ", mistakeTags: ["forとsince", "時の表現"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の継続", "since"],
      prompt: "We have known each other (    ) 2022. 空欄に入る語はどれですか。",
      choices: ["since", "for", "already", "once"], answer: 0,
      explanation: "2022は継続の始まった時点なのでsinceを使います。"
    }),
    choice({
      id: "term-20260713-eng-core-006", subject: "英語", unit: "現在完了・経験", tier: "core",
      examSkill: "everを用いた経験の疑問文を作る", mistakeTags: ["疑問文語順", "過去分詞"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の疑問文", "ever"],
      prompt: "「あなたは今までに富士山に登ったことがありますか」に最も近い英文はどれですか。",
      choices: ["Have you ever climbed Mt. Fuji?", "Did you ever climbed Mt. Fuji?", "Are you ever climb Mt. Fuji?", "Have you ever climb Mt. Fuji?"], answer: 0,
      explanation: "経験の疑問文はHave+主語+ever+過去分詞です。climbの過去分詞はclimbedです。"
    }),

    input({
      id: "term-20260713-eng-challenge-001", subject: "英語", unit: "現在完了・語順", tier: "challenge",
      examSkill: "現在完了の副詞を正しい位置に並べる", mistakeTags: ["語順", "過去分詞"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["語順整序", "never"], variantGroup: "eng-present-perfect-order",
      prompt: "語句を並べかえて英文を完成させなさい：I / such a beautiful sky / have / seen / never .",
      answerText: ["I have never seen such a beautiful sky.", "I have never seen such a beautiful sky"], placeholder: "英文を入力",
      explanation: "haveと過去分詞seenの間にneverを置き、I have never seen such a beautiful sky.となります。"
    }),
    choice({
      id: "term-20260713-eng-challenge-002", subject: "英語", unit: "現在完了・経験", tier: "challenge",
      examSkill: "have been toとhave gone toを使い分ける", mistakeTags: ["beenとgone", "意味判別"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["have been to", "have gone to"],
      prompt: "「私は沖縄へ行ったことがあります」に最も近い英文はどれですか。",
      choices: ["I have been to Okinawa.", "I have gone to Okinawa.", "I have been in Okinawa tomorrow.", "I did been to Okinawa."], answer: 0,
      explanation: "行った経験はhave been toで表します。have gone toは「行ってしまって今ここにいない」の意味です。"
    }),
    input({
      id: "term-20260713-eng-challenge-003", subject: "英語", unit: "現在完了・継続", tier: "challenge",
      examSkill: "日本語から継続の現在完了文を書く", mistakeTags: ["語順", "forとsince"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の継続", "英作文"], variantGroup: "eng-present-perfect-writing",
      prompt: "「彼女は月曜日からずっと忙しい」を英語で書きなさい。",
      answerText: ["She has been busy since Monday.", "She has been busy since Monday", "She's been busy since Monday.", "She's been busy since Monday"], placeholder: "英文を入力",
      explanation: "継続はhas been、始まった時点のMondayにはsinceを使います。"
    }),
    choice({
      id: "term-20260713-eng-challenge-004", subject: "英語", unit: "現在完了・用法", tier: "challenge",
      examSkill: "キーワードと現在完了の用法を対応させる", mistakeTags: ["用法判別", "キーワード"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の3用法", "キーワード"],
      prompt: "現在完了の用法と表現の組合せとして正しいものはどれですか。",
      choices: ["継続―for five years", "経験―just", "完了―since 2020", "継続―three times"], answer: 0,
      explanation: "for+期間は継続です。justは完了、回数表現は経験でよく使います。"
    }),
    findError({
      id: "term-20260713-eng-challenge-005", subject: "英語", unit: "現在完了・過去分詞", tier: "challenge",
      examSkill: "不規則動詞の過去分詞の誤りを直す", mistakeTags: ["過去分詞", "不規則動詞"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["goの過去分詞", "誤文訂正"],
      prompt: "He has went to the library. の誤りを直すには、どの変更が必要ですか。",
      choices: ["wentをgoneにする", "hasをdidにしてwentを残す", "toをforにする", "HeをHimにする"], answer: 0,
      explanation: "現在完了はhas+過去分詞です。go-went-goneなので、He has gone to the library.です。"
    }),
    input({
      id: "term-20260713-eng-challenge-006", subject: "英語", unit: "現在完了・経験", tier: "challenge",
      examSkill: "回数を含む経験の英文を書く", mistakeTags: ["英作文", "過去分詞"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の経験", "回数表現"], variantGroup: "eng-present-perfect-writing",
      prompt: "「私は京都を2回訪れたことがあります」を英語で書きなさい。",
      answerText: ["I have visited Kyoto twice.", "I have visited Kyoto twice", "I've visited Kyoto twice.", "I've visited Kyoto twice", "I have visited Kyoto two times.", "I have visited Kyoto two times", "I have been to Kyoto twice.", "I have been to Kyoto twice", "I've been to Kyoto twice.", "I've been to Kyoto twice"], placeholder: "英文を入力",
      explanation: "経験はhave+過去分詞visitedで表し、回数の「2回」はtwiceを文末に置きます。"
    }),

    choice({
      id: "term-20260713-eng-final-001", subject: "英語", unit: "現在完了・会話", tier: "final",
      examSkill: "have gone toから現在の状況を推測する", formatTag: "長文・会話", mistakeTags: ["beenとgone", "会話推論"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["have gone to", "文脈推論"],
      prompt: "A: Where is Riku? B: He has gone to the gym. 会話から分かることはどれですか。",
      choices: ["Rikuは体育館へ行って、今ここにはいない", "Rikuは体育館へ行った経験があるだけだ", "Rikuは明日体育館へ行く", "Rikuは一度も体育館へ行っていない"], answer: 0,
      explanation: "has gone toは、行ってしまい今は話し手のいる場所にいないことを表します。"
    }),
    findError({
      id: "term-20260713-eng-final-002", subject: "英語", unit: "現在完了・時の表現", tier: "final",
      examSkill: "現在完了と明確な過去時制を使い分ける", mistakeTags: ["時制", "yesterday"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了と過去形", "誤文訂正"],
      prompt: "I have seen Ms. Ito yesterday. の誤りを直す方法として正しいものはどれですか。",
      choices: ["have seenをsawにする", "yesterdayをtomorrowにするだけ", "seenをseeingにする", "haveをhasにする"], answer: 0,
      explanation: "yesterdayのように明確な過去時点を示すときは過去形を使い、I saw Ms. Ito yesterday.とします。"
    }),
    input({
      id: "term-20260713-eng-final-003", subject: "英語", unit: "現在完了・経験", tier: "final",
      examSkill: "経験を尋ねる疑問文を書く", formatTag: "直接入力", mistakeTags: ["疑問文語順", "過去分詞"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の疑問文", "英作文"], variantGroup: "eng-present-perfect-writing",
      prompt: "「あなたは今までに納豆を食べたことがありますか」を英語で書きなさい。",
      answerText: ["Have you ever eaten natto?", "Have you ever eaten natto", "Have you ever had natto?", "Have you ever had natto", "Have you eaten natto before?", "Have you eaten natto before"], placeholder: "英文を入力",
      explanation: "Have+主語+ever+過去分詞の語順です。eatの過去分詞はeatenです。"
    }),
    choice({
      id: "term-20260713-eng-final-004", subject: "英語", unit: "現在完了・総合", tier: "final",
      examSkill: "一つの文章で現在完了の3用法を判別する", formatTag: "長文・会話", mistakeTags: ["用法判別", "読解"], paperRef: ENG_REF_PRESENT_PERFECT,
      skills: ["現在完了の3用法", "短文読解"],
      prompt: "Mai has played the piano for six years. She has performed on stage twice, and she has just finished today's practice. 3つの現在完了の用法を文の順に並べたものはどれですか。",
      choices: ["継続→経験→完了", "経験→継続→完了", "完了→経験→継続", "継続→完了→経験"], answer: 0,
      explanation: "for six yearsは継続、twiceは経験、just finishedは完了を表します。"
    })
  ];

  const STATIC_QUESTIONS = [...mathQuestions, ...scienceQuestions, ...englishQuestions];
  const EXPECTED_COUNTS = {
    "数学:core": 14,
    "数学:challenge": 18,
    "数学:final": 8,
    "理科:core": 12,
    "理科:challenge": 16,
    "理科:final": 8,
    "英語:core": 6,
    "英語:challenge": 6,
    "英語:final": 4
  };
  const ALLOWED_DIFFICULTIES = new Set([
    "L1 基礎復帰",
    "L2 県立標準",
    "L3 県立本番",
    "L4 安全圏チャレンジ"
  ]);
  const ALLOWED_FORMATS = new Set(["短問", "資料読取", "長文・会話", "読解・記述", "複合", "操作型", "直接入力", "ミス発見"]);
  const MATH_WORK_ALLOWED_CHARACTERS = new Set(Array.from("0123456789xyabnpq+−×÷=√()²³,"));

  function normalizeValidationAnswer(value) {
    return String(value || "")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[−‐‑‒–—―]/g, "-")
      .replace(/\s+/g, "")
      .replace(/[、，]/g, ",");
  }

  function validateMathWorkQuestion(question, errors) {
    const isMathInput = question.subject === "数学" && question.type === "input";
    if (!isMathInput) {
      if (question.answerMode || question.workResult || question.workSteps) {
        errors.push(question.id + ": non-math input contains math work fields");
      }
      return;
    }
    if (question.answerMode !== "drag-work") errors.push(question.id + ": math input must use drag-work");
    if (question.formatTag !== "操作型") errors.push(question.id + ": drag-work formatTag must be 操作型");
    if (!Array.isArray(question.workSteps) || question.workSteps.length < 2) {
      errors.push(question.id + ": drag-work needs at least two intermediate steps");
      return;
    }
    const accepted = (Array.isArray(question.answerText) ? question.answerText : [question.answerText])
      .map(normalizeValidationAnswer);
    if (!accepted.includes(normalizeValidationAnswer(question.workResult))) {
      errors.push(question.id + ": workResult must match answerText");
    }
    question.workSteps.forEach((step, stepIndex) => {
      if (!step.label || !Array.isArray(step.answers) || !step.answers.length) {
        errors.push(question.id + ": invalid work step " + (stepIndex + 1));
        return;
      }
      const transformations = Array.isArray(step.requiredTransformation)
        ? step.requiredTransformation
        : [step.requiredTransformation];
      if (!transformations.length || transformations.some((name) => !MATH_WORK_TRANSFORMATION_TYPES.has(name))) {
        errors.push(question.id + ": invalid requiredTransformation on work step " + (stepIndex + 1));
      }
      step.answers.forEach((answer) => {
        Array.from(String(answer).replace(/\s+/g, "")).forEach((character) => {
          if (!MATH_WORK_ALLOWED_CHARACTERS.has(character)) {
            errors.push(question.id + ": unavailable palette character " + character);
          }
        });
      });
    });
    const finalSegments = question.workSteps.at(-1).answers.flatMap((answer) => String(answer).split(/[=,]/));
    if (!finalSegments.some((segment) => accepted.includes(normalizeValidationAnswer(segment)))) {
      errors.push(question.id + ": final work step does not expose an accepted result");
    }
    const placeholder = normalizeValidationAnswer(String(question.placeholder || "").replace(/^例[:：]?/u, ""));
    if (accepted.includes(placeholder)) errors.push(question.id + ": placeholder leaks the answer");
    if ("dragTokens" in question || "dragTarget" in question || "dragSlotCount" in question) {
      errors.push(question.id + ": answer-derived drag fields are forbidden");
    }
  }

  function validateStaticBank() {
    const errors = [];
    const counts = {};
    const ids = new Set();
    const prefixBySubject = { "数学": "term-20260713-math", "理科": "term-20260713-sci", "英語": "term-20260713-eng" };
    const requiredFields = [
      "id", "type", "childIds", "subject", "unit", "priority", "stage", "difficulty", "examSkill",
      "formatTag", "mistakeTags", "sourceTag", "qualityStatus", "contentStatus", "packId", "tier",
      "paperRef", "skills", "prompt", "explanation"
    ];

    STATIC_QUESTIONS.forEach((question) => {
      const countKey = `${question.subject}:${question.tier}`;
      counts[countKey] = (counts[countKey] || 0) + 1;
      if (ids.has(question.id)) errors.push(`duplicate id ${question.id}`);
      ids.add(question.id);
      requiredFields.forEach((field) => {
        const value = question[field];
        if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) {
          errors.push(`${question.id}: missing ${field}`);
        }
      });
      if (!question.id.startsWith(prefixBySubject[question.subject] || "invalid")) errors.push(`${question.id}: invalid subject prefix`);
      if (question.packId !== PACK_ID) errors.push(`${question.id}: invalid packId`);
      if (question.qualityStatus !== "content-audited") errors.push(`${question.id}: invalid qualityStatus`);
      if (question.contentStatus !== "content-final") errors.push(`${question.id}: invalid contentStatus`);
      if (!ALLOWED_DIFFICULTIES.has(question.difficulty)) errors.push(`${question.id}: invalid difficulty`);
      if (!ALLOWED_FORMATS.has(question.formatTag)) errors.push(`${question.id}: invalid formatTag`);
      if ((question.type === "choice" || question.type === "find-error")
          && (!Array.isArray(question.choices) || !Number.isInteger(question.answer)
            || question.answer < 0 || question.answer >= question.choices.length)) {
        errors.push(`${question.id}: invalid choices/answer`);
      }
      if (question.type === "input"
          && (!question.answerText || (Array.isArray(question.answerText) && !question.answerText.length))) {
        errors.push(`${question.id}: invalid answerText`);
      }
      validateMathWorkQuestion(question, errors);
    });

    if (STATIC_QUESTIONS.length !== 92) errors.push(`static count expected 92, got ${STATIC_QUESTIONS.length}`);
    Object.entries(EXPECTED_COUNTS).forEach(([key, expected]) => {
      if ((counts[key] || 0) !== expected) errors.push(`${key} expected ${expected}, got ${counts[key] || 0}`);
    });
    if (errors.length) throw new Error(`Term-test STEM bank validation failed:\n${errors.join("\n")}`);
  }

  function hashSeed(seed) {
    const text = String(seed === undefined ? "term-2026-07-13" : seed);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let state = hashSeed(seed) || 1;
    return function random() {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function randomInt(random, minimum, maximum) {
    return minimum + Math.floor(random() * (maximum - minimum + 1));
  }

  function mathNumber(value) {
    return value < 0 ? `−${Math.abs(value)}` : String(value);
  }

  function signedSuffix(value) {
    return value < 0 ? `−${Math.abs(value)}` : `+${value}`;
  }

  function linearSuffix(value) {
    if (value === 1) return "+x";
    if (value === -1) return "−x";
    return value < 0 ? `−${Math.abs(value)}x` : `+${value}x`;
  }

  function factorFor(value) {
    return value < 0 ? `(x−${Math.abs(value)})` : `(x+${value})`;
  }

  function sumWork(left, right) {
    return `${mathNumber(left)}${right < 0 ? `−${Math.abs(right)}` : `+${right}`}`;
  }

  function productOperand(value) {
    return value < 0 ? `(−${Math.abs(value)})` : String(value);
  }

  function generatedWorkStep(label, answers, requiredTransformation, hint, wrongChoices) {
    return {
      label,
      answers,
      requiredTransformation,
      hint,
      choices: [
        { text: answers[0] },
        ...wrongChoices.map(([text, feedback]) => ({ text, feedback }))
      ]
    };
  }

  function generatedMathExpansion(index, token, random) {
    const a = randomInt(random, 2, 5);
    const b = randomInt(random, 2, 9);
    const c = randomInt(random, 2, 9);
    let d = randomInt(random, 2, 9);
    if (d === c) d = d === 9 ? 2 : d + 1;
    const linear = a * (c + d) + 2 * b;
    const constant = b * (c - d);
    const answer = `${linear}x${constant > 0 ? "+" : ""}${constant}`;
    const firstExpansion = `(${a}x+${b})(x+${c})=${a}x²+${a * c + b}x+${b * c}`;
    const secondExpansion = `(${a}x−${b})(x−${d})=${a}x²−${a * d + b}x+${b * d}`;
    const changedSigns = a + "x²+" + (a * c + b) + "x+" + (b * c)
      + "−" + a + "x²+" + (a * d + b) + "x−" + (b * d);
    const combined = (a * c + b) + "x+" + (a * d + b) + "x+" + (b * c)
      + "−" + (b * d) + "=" + answer.replace(/-/g, "−");
    return input({
      id: `term-20260713-math-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "数学", unit: "式の展開", tier: "max", examSkill: "2つの積を展開して同類項を相殺する",
      formatTag: "複合", mistakeTags: ["展開ミス", "中項の係数"], paperRef: MATH_REF_EXPAND,
      skills: ["式の展開", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v1", variantGroup: "math-max-expansion",
      prompt: `(${a}x+${b})(x+${c})-(${a}x-${b})(x-${d})を計算しなさい。`,
      answerText: [answer], placeholder: "計算した式を入力",
      workSteps: [
        generatedWorkStep(
          "1. 前半を展開する",
          [firstExpansion],
          "expand",
          `左の${a}xと${b}を、右のxと${c}へそれぞれ掛け、xの項をまとめます。`,
          [
            [`(${a}x+${b})(x+${c})=${a}x²+${a * c}x+${b * c}`, `${b}×xの項を足す必要があります。`],
            [`(${a}x+${b})(x+${c})=${a}x²+${a * c + b}x−${b * c}`, `正の${b}と${c}の積は正です。`],
            [`(${a}x+${b})(x+${c})=${a}x+${a * c + b}x+${b * c}`, `${a}x×xではx²になります。`]
          ]
        ),
        generatedWorkStep(
          "2. 後半を展開する",
          [secondExpansion],
          "expand",
          `符号を含めて4つの積を作り、2つのxの項をまとめます。`,
          [
            [`(${a}x−${b})(x−${d})=${a}x²−${a * d}x+${b * d}`, `−${b}×xの項もxの係数に加わります。`],
            [`(${a}x−${b})(x−${d})=${a}x²+${a * d + b}x+${b * d}`, `2つのxの項はどちらも負です。`],
            [`(${a}x−${b})(x−${d})=${a}x²−${a * d + b}x−${b * d}`, `負の数どうしの積は正です。`]
          ]
        ),
        generatedWorkStep(
          "3. 後半の符号を変える",
          [changedSigns],
          "change-signs",
          "後半の式全体を引くので、後半にある3項の符号をすべて反対にします。",
          [
            [`${a}x²+${a * c + b}x+${b * c}−${a}x²−${a * d + b}x−${b * d}`, `後半のxの項は元が負なので、引くと正になります。`],
            [`${a}x²+${a * c + b}x+${b * c}−${a}x²+${a * d + b}x+${b * d}`, `後半の定数項は元が正なので、引くと負になります。`],
            [`${a}x²+${a * c + b}x+${b * c}+${a}x²+${a * d + b}x−${b * d}`, `後半の先頭も引くため、x²の項は負になります。`]
          ]
        ),
        generatedWorkStep(
          "4. 同類項をまとめる",
          [combined],
          "combine-like-terms",
          "x²の項を相殺し、xの係数と定数項をそれぞれまとめます。",
          [
            [`${linear}x+${b * c + b * d}`, `後半の定数項は足さずに引きます。`],
            [`${linear - 2 * b}x${constant >= 0 ? "+" : "−"}${Math.abs(constant)}`, `2つのxの項には、どちらにも${b}xが含まれます。`],
            [`${linear + 1}x${constant >= 0 ? "+" : "−"}${Math.abs(constant)}`, `xの係数をもう一度足し算で確認します。`]
          ]
        )
      ],
      explanation: `前半は${a}x²+${a * c + b}x+${b * c}、後半は${a}x²-${a * d + b}x+${b * d}です。差をとるとx²が消え、${answer}です。`
    });
  }

  function generatedMathRoot(index, token, random) {
    const radicands = [2, 3, 5, 6, 7];
    const n = radicands[randomInt(random, 0, radicands.length - 1)];
    const p = randomInt(random, 5, 9);
    const q = randomInt(random, 2, p - 2);
    let r = randomInt(random, 2, 7);
    while (r === p || r === q) r = r === 7 ? 2 : r + 1;
    const coefficient = p - q + r;
    const first = p * p * n;
    const second = q * q * n;
    const third = r * r * n;
    const rootTerm = (value) => `${value}√${n}`;
    const answer = rootTerm(coefficient);
    return input({
      id: `term-20260713-math-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "数学", unit: "平方根", tier: "max", examSkill: "複数の根号を簡単にして計算する",
      formatTag: "複合", mistakeTags: ["根号処理", "平方数の見落とし"], paperRef: MATH_REF_ROOT,
      skills: ["根号の簡単化", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v1", variantGroup: "math-max-root",
      prompt: `√${first}-√${second}+√${third}を簡単にしなさい。`,
      answerText: [answer], placeholder: "答えを入力",
      workSteps: [
        generatedWorkStep(
          "1. 最初の根号を簡単にする",
          [`√${first}=${rootTerm(p)}`],
          "extract-square",
          `根号の中を平方数と${n}の積に分け、平方数の平方根だけを外へ出します。`,
          [
            [`√${first}=${first}√${n}`, `平方数はそのままではなく、平方根を外へ出します。`],
            [`√${first}=${rootTerm(p - 1)}`, `外へ出す係数を2乗して元の数になるか確認します。`],
            [`√${first}=${p}√${n + 1}`, `根号の中に残る因数は${n}です。`]
          ]
        ),
        generatedWorkStep(
          "2. 2番目の根号を簡単にする",
          [`√${second}=${rootTerm(q)}`],
          "extract-square",
          `2番目も平方数と${n}の積に分け、同じ根号の形にします。`,
          [
            [`√${second}=${second}√${n}`, `平方数の平方根を係数にします。`],
            [`√${second}=${rootTerm(q + 1)}`, `係数を2乗して根号の中へ戻したとき、${second}になるか確認します。`],
            [`√${second}=${q}√${n + 1}`, `共通して残る根号は√${n}です。`]
          ]
        ),
        generatedWorkStep(
          "3. 3番目の根号を簡単にする",
          [`√${third}=${rootTerm(r)}`],
          "extract-square",
          `3番目も根号の中から平方数を見つけ、係数と√${n}に分けます。`,
          [
            [`√${third}=${third}√${n}`, `平方数は平方根にして外へ出します。`],
            [`√${third}=${rootTerm(r + 1)}`, `外へ出す係数を2乗して検算します。`],
            [`√${third}=${r}√${n + 1}`, `根号の中に残る因数を変えてはいけません。`]
          ]
        ),
        generatedWorkStep(
          "4. 根号の項をまとめる",
          [rootTerm(p) + "−" + rootTerm(q) + "+" + rootTerm(r) + "=" + answer],
          "combine-like-terms",
          `3項とも√${n}なので、根号は変えずに前の係数だけを符号つきで計算します。`,
          [
            [`${rootTerm(p)}−${rootTerm(q)}+${rootTerm(r)}=${rootTerm(p + q + r)}`, `2番目の項の前は−なので、係数${q}を引きます。`],
            [`${rootTerm(p)}−${rootTerm(q)}+${rootTerm(r)}=${rootTerm(p - q)}`, `3番目の係数${r}も足します。`],
            [`${rootTerm(p)}−${rootTerm(q)}+${rootTerm(r)}=${coefficient}√${n + 1}`, `同類項をまとめても根号の中は${n}のままです。`]
          ]
        )
      ],
      explanation: `√${first}=${rootTerm(p)}、√${second}=${rootTerm(q)}、√${third}=${rootTerm(r)}なので、${answer}です。`
    });
  }

  function generatedMathFactorization(index, token, random) {
    let left = randomInt(random, 2, 8);
    let right = randomInt(random, 2, 8);
    if (right === left) right = right === 8 ? 2 : right + 1;
    const signMode = randomInt(random, 0, 2);
    if (signMode === 1) right *= -1;
    if (signMode === 2) {
      left *= -1;
      right *= -1;
    }
    if (left + right === 0) right += right < 0 ? -1 : 1;
    const sum = left + right;
    const product = left * right;
    const polynomial = `x²${linearSuffix(sum)}${signedSuffix(product)}`;
    const answer = `${factorFor(left)}${factorFor(right)}`;
    const reverse = `${factorFor(right)}${factorFor(left)}`;
    const pair = `${sumWork(left, right)}=${mathNumber(sum)},${productOperand(left)}×${productOperand(right)}=${mathNumber(product)}`;
    const reversePair = `${sumWork(right, left)}=${mathNumber(sum)},${productOperand(right)}×${productOperand(left)}=${mathNumber(product)}`;
    return input({
      id: `term-20260713-math-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "数学", unit: "因数分解", tier: "max", examSkill: "和と積の条件を両方満たす因数を決める",
      formatTag: "複合", mistakeTags: ["符号ミス", "和と積"], paperRef: MATH_REF_FACTOR,
      skills: ["因数分解", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "math-max-factorization",
      prompt: `${polynomial}を因数分解しなさい。`,
      answerText: [answer, reverse], placeholder: "途中式をタイルで作る",
      workSteps: [
        generatedWorkStep(
          "1. 和と積の両方を確認する",
          [pair, reversePair],
          "factor-pair-check",
          `xの係数${mathNumber(sum)}になる和と、定数項${mathNumber(product)}になる積を同じ2数で確かめます。`,
          [
            [`${sumWork(left, right)}=${mathNumber(sum + 1)},${productOperand(left)}×${productOperand(right)}=${mathNumber(product)}`, `和の計算が1ずれています。符号を含めて足します。`],
            [`${sumWork(left, right)}=${mathNumber(sum)},${productOperand(left)}×${productOperand(right)}=${mathNumber(product + 1)}`, `積の計算が1ずれています。符号も確認します。`],
            [`${sumWork(left, right)}=${mathNumber(sum + 1)},${productOperand(left)}×${productOperand(right)}=${mathNumber(product + 1)}`, `和と積の両方が条件に一致する組だけを選びます。`]
          ]
        ),
        generatedWorkStep(
          "2. 因数分解する",
          [answer, reverse],
          "factor",
          "確認した2数を、それぞれxに足す形で2つのかっこへ入れます。",
          [
            [`${factorFor(left + 1)}${factorFor(right)}`, `1つ目の数が1ずれています。和と積を確認した2数を使います。`],
            [`${factorFor(left)}${factorFor(right + 1)}`, `2つ目の数が1ずれています。定数項の積も変わってしまいます。`],
            [`${factorFor(-left)}${factorFor(-right)}`, `2数の符号を両方反対にすると、xの係数の符号が変わります。`]
          ]
        )
      ],
      explanation: `和が${mathNumber(sum)}、積が${mathNumber(product)}になる2数は${mathNumber(left)}と${mathNumber(right)}なので、${answer}です。`
    });
  }

  function generatedMathRationalization(index, token, random) {
    const bases = [2, 3, 5, 6, 7];
    const base = bases[randomInt(random, 0, bases.length - 1)];
    const coefficient = randomInt(random, 2, 7);
    const numerator = base * coefficient;
    const answer = `${coefficient}√${base}`;
    return input({
      id: `term-20260713-math-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "数学", unit: "平方根", tier: "max", examSkill: "有理化した後に係数を約分する",
      formatTag: "複合", mistakeTags: ["有理化", "約分忘れ"], paperRef: MATH_REF_ROOT,
      skills: ["分母の有理化", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "math-max-rationalization",
      prompt: `${numerator}÷√${base}の分母を有理化して簡単にしなさい。`,
      answerText: [answer], placeholder: "途中式をタイルで作る",
      workSteps: [
        generatedWorkStep(
          "1. 分子・分母に同じ根号をかける",
          [`${numerator}÷√${base}=${numerator}√${base}÷${base}`],
          "rationalize",
          `分子と分母の両方に√${base}を掛け、分母を√${base}×√${base}にします。`,
          [
            [`${numerator}÷√${base}=${numerator}÷${base}`, `分母だけを√${base}から${base}へ変えると、式の値が変わります。`],
            [`${numerator}÷√${base}=${numerator}√${base}÷√${base}`, `分母にも√${base}を掛けるので、分母は${base}になります。`],
            [`${numerator}÷√${base}=${numerator}√${base}÷${base * 2}`, `√${base}×√${base}は${base}です。2倍にはなりません。`]
          ]
        ),
        generatedWorkStep(
          "2. 係数を約分する",
          [`${numerator}√${base}÷${base}=${answer}`],
          "evaluate",
          `根号は残したまま、外の係数${numerator}を${base}で割ります。`,
          [
            [`${numerator}√${base}÷${base}=${numerator}√${base}`, `係数${numerator}を${base}で割る必要があります。`],
            [`${numerator}√${base}÷${base}=${coefficient}`, `約分しても√${base}は消えません。`],
            [`${numerator}√${base}÷${base}=${coefficient + 1}√${base}`, `係数の割り算${numerator}÷${base}をもう一度確認します。`]
          ]
        )
      ],
      explanation: `有理化すると${numerator}√${base}÷${base}となり、${answer}です。`
    });
  }

  function generatedMathExpressionValue(index, token, random) {
    const xValue = randomInt(random, 2, 9);
    let yValue = randomInt(random, 2, 9);
    if (yValue === xValue) yValue = yValue === 9 ? 2 : yValue + 1;
    const sum = xValue + yValue;
    const product = xValue * yValue;
    const square = sum * sum;
    const twiceProduct = 2 * product;
    const value = xValue * xValue + yValue * yValue;
    return input({
      id: `term-20260713-math-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "数学", unit: "式の計算の利用", tier: "max", examSkill: "和と積から二乗和を求める",
      formatTag: "複合", mistakeTags: ["公式の変形", "代入ミス"], paperRef: MATH_REF_APPLY,
      skills: ["式の値", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "math-max-expression-value",
      prompt: `x+y=${sum}、xy=${product}のとき、x²+y²の値を求めなさい。`,
      answerText: [String(value)], placeholder: "途中式をタイルで作る",
      workSteps: [
        generatedWorkStep(
          "1. 和の平方の公式に置き換える",
          ["x²+y²=(x+y)²−2xy"],
          "substitute",
          "(x+y)²を展開したときに加わる2xyを引き、x²+y²だけを残します。",
          [
            ["x²+y²=(x+y)²+2xy", `2xyは足さず、余分な項として引きます。`],
            ["x²+y²=(x+y)²−xy", `中央の項はxyではなく2xyです。`],
            ["x²+y²=x²+2xy+y²", `右辺は和の平方です。そこから2xyを除く必要があります。`]
          ]
        ),
        generatedWorkStep(
          "2. 条件の値を代入する",
          [`${sum}²−2×${product}=${square}−${twiceProduct}`],
          "substitute",
          `x+yには${sum}、xyには${product}を入れ、平方と2倍を別々に計算します。`,
          [
            [`${sum}²+2×${product}=${square}+${twiceProduct}`, `公式では2xyを引きます。符号は−です。`],
            [`${sum}²−${product}=${square}−${product}`, `xyの前の係数2を忘れずに掛けます。`],
            [`${sum}²−2×${product}=${square + 1}−${twiceProduct}`, `${sum}²の計算が1ずれています。`]
          ]
        ),
        generatedWorkStep(
          "3. 数値を計算する",
          [`${square}−${twiceProduct}=${value}`],
          "evaluate",
          "最後は2つの整数の引き算です。先に計算した値を符号どおりに引きます。",
          [
            [`${square}−${twiceProduct}=${value + 1}`, `引き算の結果が1ずれています。`],
            [`${square}−${twiceProduct}=${value - 1}`, `もう一度1の位から引き算を確認します。`],
            [`${square}+${twiceProduct}=${square + twiceProduct}`, `最後も足し算ではなく引き算です。`]
          ]
        )
      ],
      explanation: `x²+y²=(x+y)²−2xy=${sum}²−2×${product}=${value}です。`
    });
  }

  function generatedMathConditionReverse(index, token, random) {
    const left = randomInt(random, 2, 8);
    const right = randomInt(random, 2, 8);
    const sum = left + right;
    const product = left * right;
    return input({
      id: `term-20260713-math-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "数学", unit: "式の展開", tier: "max", examSkill: "因数の条件から係数を逆算する",
      formatTag: "複合", mistakeTags: ["係数比較", "条件整理"], paperRef: MATH_REF_APPLY,
      skills: ["係数の逆算", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "math-max-condition-reverse",
      prompt: `x²+px+${product}=${factorFor(left)}${factorFor(right)}が恒等式になるとき、pの値を求めなさい。`,
      answerText: [String(sum), `p=${sum}`], placeholder: "途中式をタイルで作る",
      workSteps: [
        generatedWorkStep(
          "1. 右辺を展開する",
          [`${factorFor(left)}${factorFor(right)}=x²+${sum}x+${product}`],
          "expand",
          `2つの数の和をxの係数、積を定数項にして展開します。`,
          [
            [`${factorFor(left)}${factorFor(right)}=x²+${sum + 1}x+${product}`, `xの係数は${left}+${right}です。和が1ずれています。`],
            [`${factorFor(left)}${factorFor(right)}=x²+${sum}x+${product + 1}`, `定数項は${left}×${right}です。積が1ずれています。`],
            [`${factorFor(left)}${factorFor(right)}=x²−${sum}x+${product}`, `2つの数は正なので、xの係数も正です。`]
          ]
        ),
        generatedWorkStep(
          "2. xの係数を比べる",
          [`p=${sum}`],
          ["substitute", "evaluate"],
          "恒等式では左右のxの係数が等しいため、左辺のpと展開後のxの係数を比べます。",
          [
            [`p=${sum + 1}`, `展開後のxの係数をそのままpにします。1を足しません。`],
            [`p=${left}`, `xの係数は一方の数だけでなく、2数の和です。`],
            ["p=1", `pはxの係数です。2数の和を計算して決めます。`]
          ]
        )
      ],
      explanation: `右辺は x²+(${left}+${right})x+${product}=x²+${sum}x+${product}なので、p=${sum}です。`
    });
  }

  function generatedScienceHeredity(index, token, random) {
    const quarter = randomInt(random, 12, 60);
    const total = quarter * 4;
    const heterozygous = quarter * 2;
    return input({
      id: `term-20260713-sci-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "理科", unit: "遺伝", tier: "max", examSkill: "形質比と遺伝子型比を区別して期待個体数を求める",
      formatTag: "複合", mistakeTags: ["比の計算", "形質比"], paperRef: SCI_REF_HEREDITY,
      skills: ["分離比", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v1", variantGroup: "sci-max-heredity-count",
      prompt: `Aが表す形質が顕性である。Aaどうしから子が${total}個体生まれるとき、顕性形質を示す子のうち遺伝子型がAaの子は理論上何個体ですか。`,
      answerText: [String(heterozygous), `${heterozygous}個体`, `${heterozygous}個`], placeholder: "個体数を入力",
      explanation: `遺伝子型はAA:Aa:aa=1:2:1です。Aaは全体の2/4なので、${total}×1/2=${heterozygous}個体です。`
    });
  }

  function generatedScienceHeredityReverse(index, token, random) {
    const half = randomInt(random, 24, 60);
    const heterozygous = randomInt(random, 0, 1) === 1;
    const rows = heterozygous ? [["顕性形質", String(half)], ["潜性形質", String(half)]] : [["顕性形質", String(half * 2)], ["潜性形質", "0"]];
    const correct = heterozygous ? "Aa" : "AA";
    return choice({
      id: `term-20260713-sci-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "理科", unit: "遺伝", tier: "max", examSkill: "検定交配の結果から親の遺伝子型を逆算する",
      formatTag: "資料読取", mistakeTags: ["形質比", "遺伝子型"], paperRef: SCI_REF_HEREDITY,
      skills: ["検定交配", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "sci-max-heredity-reverse",
      figure: { kind: "table", caption: "顕性形質の個体とaaとの交配結果", alt: "子の顕性形質と潜性形質の個体数を示す表", columns: ["子の形質", "個体数"], rows },
      prompt: "Aが顕性形質を表す。表から、調べた親の遺伝子型として最も適切なものを選びなさい。",
      choices: [correct, heterozygous ? "AA" : "Aa", "aa", "この交配では判定できない"], answer: 0,
      explanation: heterozygous ? "aaとの子が顕性:潜性=1:1なので、親はAaです。" : "aaとの子がすべて顕性形質なので、親はAAです。"
    });
  }

  function generatedScienceIonBalance(index, token, random) {
    const calcium = randomInt(random, 4, 24);
    const chloride = calcium * 2;
    return input({
      id: `term-20260713-sci-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "理科", unit: "イオン", tier: "max", examSkill: "電気的中性から陰イオン数を求める",
      formatTag: "資料読取", mistakeTags: ["電荷の比", "イオン数"], paperRef: SCI_REF_ION,
      skills: ["電気的中性", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "sci-max-ion-balance",
      figure: { kind: "table", caption: "塩化カルシウム水溶液中の粒子", alt: `カルシウムイオンが${calcium}個あることを示す表`, columns: ["イオン", "個数"], rows: [["Ca²⁺", String(calcium)], ["Cl⁻", "?"]] },
      prompt: "水溶液全体が電気的に中性であるとき、Cl⁻は何個ありますか。",
      answerText: [String(chloride), `${chloride}個`], placeholder: "個数を入力",
      explanation: `Ca²⁺1個の+2を打ち消すにはCl⁻が2個必要なので、${calcium}×2=${chloride}個です。`
    });
  }

  function generatedScienceIonization(index, token, random) {
    const cases = [
      { substance: "塩化水素HCl", correct: "HCl → H⁺ + Cl⁻", wrong: ["HCl → H⁻ + Cl⁺", "HCl → H + Cl", "HCl → H²⁺ + Cl²⁻"] },
      { substance: "塩化ナトリウムNaCl", correct: "NaCl → Na⁺ + Cl⁻", wrong: ["NaCl → Na⁻ + Cl⁺", "NaCl → Na + Cl", "NaCl → Na²⁺ + Cl²⁻"] },
      { substance: "塩化カルシウムCaCl₂", correct: "CaCl₂ → Ca²⁺ + 2Cl⁻", wrong: ["CaCl₂ → Ca⁺ + Cl₂⁻", "CaCl₂ → Ca²⁺ + Cl⁻", "CaCl₂ → 2Ca⁺ + Cl₂⁻"] }
    ];
    const selected = cases[randomInt(random, 0, cases.length - 1)];
    return choice({
      id: `term-20260713-sci-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "理科", unit: "電離", tier: "max", examSkill: "電荷と粒子数を同時に合わせて電離式を選ぶ",
      formatTag: "複合", mistakeTags: ["イオン式", "係数"], paperRef: SCI_REF_ION,
      skills: ["電離式", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "sci-max-ionization-equation",
      prompt: `${selected.substance}の電離式として、電荷と原子数の両方が合うものを選びなさい。`,
      choices: [selected.correct, ...selected.wrong], answer: 0,
      explanation: `${selected.correct}では、左辺と右辺で原子数と電荷の合計が一致します。`
    });
  }

  function generatedScienceCopperElectrons(index, token, random) {
    const copperIons = randomInt(random, 5, 30);
    const electrons = copperIons * 2;
    return input({
      id: `term-20260713-sci-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "理科", unit: "電気分解", tier: "max", examSkill: "陰極反応式から電子数を求める",
      formatTag: "複合", mistakeTags: ["電子数", "電荷"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["銅イオン", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v2", variantGroup: "sci-max-copper-electrons",
      prompt: `陰極で Cu²⁺+2e⁻→Cu が起こる。Cu²⁺が${copperIons}個すべて銅原子になるとき、受け取られる電子は合計何個ですか。`,
      answerText: [String(electrons), `${electrons}個`], placeholder: "電子数を入力",
      explanation: `Cu²⁺1個に電子2個が必要なので、${copperIons}×2=${electrons}個です。`
    });
  }

  function generatedScienceElectrolysis(index, token, random) {
    const oxygen = randomInt(random, 6, 30);
    const doubledOxygen = oxygen * 2;
    const doubledHydrogen = oxygen * 4;
    const totalGas = doubledOxygen + doubledHydrogen;
    return input({
      id: `term-20260713-sci-max-${token}-${String(index + 1).padStart(3, "0")}`,
      subject: "理科", unit: "電気分解", tier: "max", examSkill: "時間比例と気体の体積比を組み合わせて発生量を求める",
      formatTag: "資料読取", mistakeTags: ["気体の比", "電極の取り違え"], paperRef: SCI_REF_ELECTROLYSIS,
      skills: ["水の電気分解", "最高難度反復"], sourceTag: "term-2026-07-13-generated-v1", variantGroup: "sci-max-electrolysis-gas",
      figure: { kind: "table", caption: "5分間の電気分解で集めた気体", alt: `5分間で酸素が${oxygen}ミリリットル集まったことを示す表`, columns: ["時間", "気体", "体積"], rows: [["5分", "酸素", `${oxygen}mL`]] },
      prompt: "水に少量の水酸化ナトリウムを加え、一定の電流で10分間電気分解する。発生する気体の体積は時間に比例するものとする。水素と酸素が2:1の体積比で生じるとき、10分間に集まる両方の気体の合計は何mLですか。",
      answerText: [String(totalGas), `${totalGas}mL`, `${totalGas}ml`], placeholder: "合計体積を入力",
      explanation: `10分では酸素が${doubledOxygen}mL、水素がその2倍の${doubledHydrogen}mLです。合計は${totalGas}mLです。`
    });
  }

  const MAX_VARIANT_TEMPLATES = [
    generatedMathExpansion,
    generatedScienceHeredity,
    generatedMathRoot,
    generatedScienceHeredityReverse,
    generatedMathFactorization,
    generatedScienceIonBalance,
    generatedMathRationalization,
    generatedScienceIonization,
    generatedMathExpressionValue,
    generatedScienceCopperElectrons,
    generatedMathConditionReverse,
    generatedScienceElectrolysis
  ];

  function generateVariants(count, seed) {
    const requested = Number(count);
    const safeCount = Number.isFinite(requested) ? Math.max(0, Math.floor(requested)) : 0;
    const seedValue = seed === undefined ? "term-2026-07-13" : seed;
    const random = seededRandom(seedValue);
    const token = hashSeed(seedValue).toString(16).padStart(8, "0");
    const variants = [];
    for (let index = 0; index < safeCount; index += 1) {
      const template = MAX_VARIANT_TEMPLATES[index % MAX_VARIANT_TEMPLATES.length];
      variants.push(template(index, token, random));
    }
    return applyMathWorkAnswers(variants);
  }

  function validateGeneratedBank() {
    const errors = [];
    for (let seed = 1; seed <= 24; seed += 1) {
      const variants = generateVariants(24, `stem-self-check-${seed}`);
      const firstTen = variants.slice(0, 10);
      const firstCycle = variants.slice(0, MAX_VARIANT_TEMPLATES.length);
      if (new Set(firstTen.map((question) => question.variantGroup)).size !== 10) {
        errors.push(`seed ${seed}: first ten MAX questions repeat a template`);
      }
      if (firstTen.filter((question) => question.subject === "数学").length !== 5
          || firstTen.filter((question) => question.subject === "理科").length !== 5) {
        errors.push(`seed ${seed}: first ten MAX questions are not balanced 5:5`);
      }
      if (new Set(firstCycle.map((question) => question.variantGroup)).size !== MAX_VARIANT_TEMPLATES.length) {
        errors.push(`seed ${seed}: twelve-template MAX cycle is not unique`);
      }
      variants.forEach((question) => validateMathWorkQuestion(question, errors));
      variants.filter((question) => question.subject === "数学").forEach((question) => {
        if (question.type !== "input" || question.workSteps.length < 2) {
          errors.push(`${question.id}: generated math must use two or more drag-work rows`);
        }
      });
    }
    if (errors.length) throw new Error(`Generated STEM bank validation failed:\n${errors.join("\n")}`);
  }

  validateStaticBank();
  validateGeneratedBank();
  window.TERM_TEST_QUESTIONS = STATIC_QUESTIONS.slice();
  window.TERM_TEST_GENERATE_VARIANTS = generateVariants;

  const bank = window.QUIZ_QUESTIONS || [];
  const existingIds = new Set(bank.map((question) => question.id));
  STATIC_QUESTIONS.forEach((question) => {
    if (!existingIds.has(question.id)) {
      bank.push(question);
      existingIds.add(question.id);
    }
  });
  window.QUIZ_QUESTIONS = bank;
}());
