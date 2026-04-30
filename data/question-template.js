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
