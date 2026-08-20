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
  placeholder: "答えを入力",
  explanation: "両辺から2xを引くと 3x - 3 = 12。両辺に3を足して 3x = 15。よって x = 5 です。"
}
```

`answerText` は表記ゆれを配列で持てます。全角/半角、空白、大文字小文字は判定時にある程度吸収します。

## 手で動かす問題

式を左辺/右辺の項データとして持たせます。アプリ側がフェーズを自動判定し、移項、まとめ計算、係数で割る、平方根を順に出します。

```js
{
  id: "math-eq-manipulate-001",
  type: "manipulate",
  subject: "数学",
  unit: "方程式",
  priority: "S",
  stage: "手で動かす",
  prompt: "式を動かして、方程式 4x + 7 = 31 を解きなさい。",
  left: [{ id: "l1", coef: 4, type: "x" }, { id: "l2", coef: 7, type: "const" }],
  right: [{ id: "r1", coef: 31, type: "const" }],
  explanation: "両辺から7を引いて 4x = 24。両辺を4で割ると x = 6 です。"
}
```

`type` は `const`, `x`, `x2` が使えます。`coef` は符号つき係数です。各項の `id` は同一問題内で重複させません。

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
| `type` | `choice`, `input`, `manipulate`, `find-error`。省略時は `choice` |
| `subject` | `数学`, `理科`, `社会`, `英語`, `国語` |
| `unit` | 単元名。例: `方程式`, `1次関数`, `水溶液` |
| `priority` | `S`, `A`, `B`, `C`。苦手対策は `S` か `A` |
| `stage` | `基礎`, `確認`, `補修`, `応用`, `維持` |
| `childIds` | 対象の子供。例: `["child-2"]`。省略した既存問題は子供1専用 |
| `difficulty` | 入試対策の難度。`L1 基礎復帰`, `L2 県立標準`, `L3 県立本番`, `L4 安全圏チャレンジ` |
| `examSkill` | 入試で狙う技能。例: `計算処理`, `資料読取`, `条件作文` |
| `formatTag` | 形式。例: `短問`, `資料読取`, `長文・会話`, `複合`, `操作型` |
| `mistakeTags` | 想定ミス。例: `["計算ミス", "条件整理"]` |
| `sourceTag` | 作問元の方針タグ。模試や入試問題を転載せず、出題意図だけを抽象化する |
| `qualityStatus` | `metadata-audited`, `content-audited`, `provisional`。タグ監査と内容監査を分ける |
| `contentStatus` | `content-draft` など内容面の状態。入試実戦性の再レビュー対象を明示する |
| `prompt` | 問題文 |
| `choices` | 選択肢。`choice`, `find-error` で使う。表示時にはランダム化される |
| `answer` | 正解の選択肢番号。`choices` の0番目なら `0` |
| `answerText` | `input` 用の正解表記。文字列または配列 |
| `placeholder` | `input` 用の入力例 |
| `left` | `manipulate` 用の左辺の項配列 |
| `right` | `manipulate` 用の右辺の項配列 |
| `explanation` | 解説 |

## 追加時のチェック

- 成績表や塾教材の問題をそのまま写さない。
- 個人情報、点数、順位、校舎名を入れない。
- 子供2・子供3用に追加する問題には `childIds: ["child-2"]` や `childIds: ["child-3"]` を付ける。
- `childIds` を省略した問題は、子供1（中3）専用として出題される。
- 正解位置はランダム化されるので、`choices` の並び自体は自然でよい。
- 数学は「なぜその式になるか」を解説に入れる。
- 計算ミス対策は `manipulate`, `input`, `find-error` を優先する。
- 文章題は、まず `choice` で立式を選ばせ、慣れたら `input` で答えを入れさせる。
- 追加後に次を実行する。

```bash
node --check app.js
node --check data/questions.js
node --check data/entrance-ibaraki-2027-pack.js
node scripts/validate-question-bank.js
```

## 子供1 下妻一高対策の当面ルール

- 子供1の第1段階は300問。既存116問に入試対策パックを足して、数学170問、理科45問、社会40問、英語25問、国語20問を目安にする。
- 300問時点では、短問70%、資料読取・長文・複合30%を目安にする。
- 検証スクリプトでは、資料読取・長文/会話・読解/記述・複合を90問以上にする。
- 最終1200問では、数学400問、理科230問、社会220問、英語180問、国語170問へ広げる。
- 難度は300問時点で `L1` 35%、`L2` 40%、`L3` 20%、`L4` 5% を目安にする。
- 復習は1回正解で終わらせず、再ミスがある問題は3回連続正解で卒業扱いにする。
- 英語リスニングは初期は代替問題でよいが、秋までに音声または読み上げスクリプト付き問題へ移す。
