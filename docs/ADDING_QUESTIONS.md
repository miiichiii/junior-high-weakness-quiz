# Adding Questions

問題は `data/questions.js` の `window.QUIZ_QUESTIONS = [...]` に追加します。

## 4択問題

```js
{
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
}
```

`type` を省略した場合も `choice` として扱われます。

## 直接入力問題

計算のケアレスミス対策では、選択肢を見ずに最後の答えを入力させます。

```js
{
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
}
```

`answerText` は表記ゆれを配列で持てます。全角/半角、空白、大文字小文字は判定時にある程度吸収します。

## ミス発見問題

途中式を見て、どこで崩れたかを選ばせます。形式は4択ですが、`type: "find-error"` を付けます。

```js
{
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
}
```

## フィールド

| field | 内容 |
|---|---|
| `id` | 重複しない問題ID。例: `math-eq-016` |
| `type` | `choice`, `input`, `find-error`。省略時は `choice` |
| `subject` | `数学`, `理科`, `社会`, `英語`, `国語` |
| `unit` | 単元名。例: `方程式`, `1次関数`, `水溶液` |
| `priority` | `S`, `A`, `B`, `C`。苦手対策は `S` か `A` |
| `stage` | `基礎`, `確認`, `補修`, `応用`, `維持` |
| `prompt` | 問題文 |
| `choices` | 選択肢。`choice`, `find-error` で使う。表示時にはランダム化される |
| `answer` | 正解の選択肢番号。`choices` の0番目なら `0` |
| `answerText` | `input` 用の正解表記。文字列または配列 |
| `placeholder` | `input` 用の入力例 |
| `explanation` | 解説 |

## 追加時のチェック

- 成績表や塾教材の問題をそのまま写さない。
- 個人情報、点数、順位、校舎名を入れない。
- 正解位置はランダム化されるので、`choices` の並び自体は自然でよい。
- 数学は「なぜその式になるか」を解説に入れる。
- 計算ミス対策は `input` と `find-error` を優先する。
- 文章題は、まず `choice` で立式を選ばせ、慣れたら `input` で答えを入れさせる。
- 追加後に次を実行する。

```bash
node --check app.js
node --check data/questions.js
```
