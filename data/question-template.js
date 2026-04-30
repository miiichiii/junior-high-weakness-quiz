// Copy one object into data/questions.js and edit the fields.
// For choice/find-error, keep answer as the zero-based index before shuffle.
const CHOICE_QUESTION_TEMPLATE = {
  type: "choice",
  id: "math-eq-016",
  subject: "数学",
  unit: "方程式",
  priority: "S",
  stage: "基礎",
  prompt: "方程式 3x - 4 = 11 を解くと、x はいくつですか。",
  choices: ["3", "4", "5", "7"],
  answer: 2,
  explanation: "両辺に4を足して 3x = 15。両辺を3で割って x = 5 です。"
};

const INPUT_QUESTION_TEMPLATE = {
  id: "math-eq-input-011",
  type: "input",
  subject: "数学",
  unit: "方程式",
  priority: "S",
  stage: "直接入力",
  prompt: "方程式 5x - 3 = 2x + 12 を解きなさい。",
  answerText: ["x=5", "5"],
  placeholder: "例: x=5",
  explanation: "両辺から2xを引くと 3x - 3 = 12。両辺に3を足して 3x = 15。よって x = 5 です。"
};

const MANIPULATE_QUESTION_TEMPLATE = {
  id: "math-eq-manipulate-001",
  type: "manipulate",
  subject: "数学",
  unit: "方程式",
  priority: "S",
  stage: "手で動かす",
  prompt: "タイルを動かして、方程式 4x + 7 = 31 を解きなさい。",
  pieces: [
    { id: "m001-4x-a", text: "4x" },
    { id: "m001-plus7", text: "+7" },
    { id: "m001-minus7-a", text: "-7" },
    { id: "m001-eq-a", text: "=" },
    { id: "m001-31", text: "31" },
    { id: "m001-minus7-b", text: "-7" },
    { id: "m001-4x-b", text: "4x" },
    { id: "m001-eq-b", text: "=" },
    { id: "m001-24", text: "24" },
    { id: "m001-x", text: "x" },
    { id: "m001-eq-c", text: "=" },
    { id: "m001-6", text: "6" }
  ],
  rows: [
    {
      label: "1. 両辺から7を引く",
      target: ["m001-4x-a", "m001-plus7", "m001-minus7-a", "m001-eq-a", "m001-31", "m001-minus7-b"]
    },
    {
      label: "2. まとめる",
      target: ["m001-4x-b", "m001-eq-b", "m001-24"]
    },
    {
      label: "3. 答え",
      target: ["m001-x", "m001-eq-c", "m001-6"]
    }
  ],
  explanation: "両辺から7を引いて 4x = 24。両辺を4で割ると x = 6 です。"
};

const FIND_ERROR_QUESTION_TEMPLATE = {
  id: "math-eq-error-011",
  type: "find-error",
  subject: "数学",
  unit: "方程式",
  priority: "S",
  stage: "ミス発見",
  prompt: "次の解き方の間違いを選びなさい。5x - 3 = 2x + 12 -> 5x - 2x = 12 - 3 -> 3x = 9 -> x = 3",
  choices: ["-3を右辺へ移すと +3 になる", "5x - 2x の計算が違う", "3x = 9 の割り算が違う", "間違いはない"],
  answer: 0,
  explanation: "-3を右辺へ移すと +3 になるので、右辺は 12 + 3 = 15。3x = 15 から x = 5 です。"
};
