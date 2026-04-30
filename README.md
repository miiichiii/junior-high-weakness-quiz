# Junior High Weakness Quiz

中3の基礎補修用Webクイズです。成績表や個人情報は含めず、弱点単元だけを抽象化した別問題として作っています。

## 使い方

`index.html` をブラウザで開くと動きます。GitHub Pagesでもそのまま配信できます。

問題追加は [docs/ADDING_QUESTIONS.md](docs/ADDING_QUESTIONS.md) を見ながら、`data/questions.js` に同じ形式で追記します。

## 設計方針

- 数学を最優先に、理科・社会を短問で補強する
- 問題ごとに短い解説を付ける
- 不正解はローカル保存し、復習モードで解き直せる
- 教科ごと、カテゴリごとに出題できる
- できなかった問題だけを選んでやり直せる
- 選択肢は表示時にランダム化する
- 方程式は手で式を動かす問題を中心にし、直接入力とミス発見問題も混ぜる
- 今日の解答数、今日の正答率、連続学習日数、累計解答をローカル保存する
- 記録はJSONでエクスポート/インポートできる
- バッジで小さな達成を見えるようにする
- 元PDF、氏名、校舎、点数、順位は保存しない

## ファイル

- `index.html`: 画面
- `styles.css`: 見た目
- `data/questions.js`: 問題データ
- `data/question-template.js`: 追加用テンプレート
- `app.js`: クイズ動作
- `docs/ADDING_QUESTIONS.md`: 問題追加ルール
- `docs/STORAGE.md`: 記録保存とバックアップの考え方
