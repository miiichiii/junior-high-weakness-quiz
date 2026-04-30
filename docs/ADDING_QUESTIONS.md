# Adding Questions

問題は `data/questions.js` の `window.QUIZ_QUESTIONS = [...]` に追加します。

## 追加形式

```js
{
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

## フィールド

| field | 内容 |
|---|---|
| `id` | 重複しない問題ID。例: `math-eq-016` |
| `subject` | `数学`, `理科`, `社会`, `英語`, `国語` |
| `unit` | 単元名。例: `方程式`, `1次関数`, `水溶液` |
| `priority` | `S`, `A`, `B`, `C`。苦手対策は `S` か `A` |
| `stage` | `基礎`, `確認`, `補修`, `応用`, `維持` |
| `prompt` | 問題文 |
| `choices` | 選択肢。表示時にはランダム化される |
| `answer` | 正解の選択肢番号。`choices` の0番目なら `0` |
| `explanation` | 解説 |

## 追加時のチェック

- 成績表や塾教材の問題をそのまま写さない。
- 個人情報、点数、順位、校舎名を入れない。
- 正解位置はランダム化されるので、`choices` の並び自体は自然でよい。
- 数学は「なぜその式になるか」を解説に入れる。
- 追加後に次を実行する。

```bash
node --check app.js
node --check data/questions.js
```
