# 夏休み 漢字マスター（小4・指がきモジュール）

child-3（小4）向けの漢字書き取りモジュール。スマホの画面に指で漢字を書き、1画ずつ筆順・字形を判定する。夏休みのプリント2枚（50問×2＝100問、ユニーク76字）を1コースにしたもの。

- 学習画面: `kanji.html?child=child-3`
- 実装: `kanji-app.js`（単一IIFE、`app.js` とは独立）
- 出題データ: `data/kanji-summer-2026.js`（自動生成、直接編集しない）
- プロトタイプ: `kanji-writing-demo/index.html`（判定・毛筆描画の原型。参照用に残置）

## 学習の流れ

- 1日 = 新規4字 + 期限のきた復習最大8字（合計最大12字、`schedule` で調整可）
- 日付が変わったときは、開いたままのタブ・画面復帰・深夜のいずれでも当日の出題キューへ自動更新する
- その日の結果画面から「次の4文字に挑戦」を押すと、未学習の字を4字ずつ何度でも先へ進められる（残りが4字未満なら残数だけ出題）
- 新規: ①なぞって練習（手本の上を1画ずつ、始点の●と矢印つき）→ ②みないでチャレンジ
- 復習: みないでチャレンジのみ。まちがえたら「なぞって おもいだす」で再学習
- 間隔反復: ヒントなしでクリアするたび 1日→3日→7日後に再出題
- **克服（マスター）= 別の日に2回、手本なしで正しく書けた字**（既存アプリの「別セッション2回正解」ルールと同じ考え方）。まちがえると克服は取り消され翌日再出題
- 全部終わると「おかわり れんしゅう」（自由練習、克服判定には数えない）
- ⭐評価: ノーミス=3 / ヒント使用=2 / まちがえてから正解=1
- **卒業**: マスター後、最長間隔（7日後）の復習も乗り越えたら卒業し、以後は復習に出さない（`graduatedAt`）。これがないとマスター済みの字が7日おきに無限ループで復習に出続け、1日の復習枠（`maxReviewsPerSession`）を圧迫し続ける
- **前日に練習した字は必ず全部復習に出す**（`lastPracticedDay` が前日の字）。いちばん忘れやすいうえ、これを保証しないと期限の古い字＝初日に覚えた字ほど先に枠を埋めてしまい、前日おぼえた字が毎日押し出される。前日ぶんだけで `maxReviewsPerSession` を超えるとき（「次の◯文字に挑戦」で多めに覚えた翌日など）は、その日の復習枠をその数まで広げる
- **残りの枠**は期限の古い順で埋める。期限が同じ字が枠を超える場合は「いちばん長く出題されていない字（`lastSeenAt`が古い字）」を優先する。過去の誤り回数（`misses`）のような固定値で優先度を決めると、負けた字は二度と出題されず（出題されない＝lastSeenAtも更新されない）、同じ顔ぶれが毎日勝ち続けてしまうため

## 記録

- `localStorage["weaknessQuiz:child-3:kanjiProgress"]`（version:1、字ごとの clearDays / stage / reviewDueAt / masteredAt など）。スキーマ変更時は version を上げ、`migrateProgress` に移行処理を書く（未知versionは `:backup` に退避して初期化）
- 既存の `weaknessQuiz:child-3:stats` の daily にも加算するため、トップ画面の累計・連続日数が自動で反映される
- Google同期は既存の Firestore `records/default` に `kanji` フィールドとして相乗り（`merge:true`）。`app.js` 側の `mergeKanjiProgress` と `kanji-app.js` 側は**同一ロジックを保つこと**
- 同期は**ログイン済みなら全自動**（1字終えるごとにデバウンス1.2秒でアップロード、ページを開いた時点でサーバーから取得してマージ）。ログイン自体はこのページではできず、トップ画面の「Googleで同期」で1回行う
- 未ログインでも学習は普通に続けられ、記録は端末内に残るだけになる。それが見えないと誰も気づけないので、ペース表示の下に状態チップ（`#sync-chip`）を出す。`同期ずみ` / `ほぞん中…` / `未ログイン（この端末だけ）` / `同期できません` / `この端末だけに保存`（Firebase未設定・読込失敗）の5状態。未ログインのときだけタップでき、トップ画面へ誘導する
- 保護者画面（parent-dashboard.html）に学習ずみ/マスター/復習待ち/プリント別カバー率を表示

## データの再生成・字の追加

出題の元データは `data/src/kanji-summer-2026-prompts.json`（プリンから転記した100問）。筆順は KanjiVG から生成する:

```bash
# KanjiVG SVG を取得（コミットしない）
npm pack @madcat/kanjivg --pack-destination /tmp/kvg
tar xzf /tmp/kvg/kanjivg-*.tgz -C /tmp/kvg

# デッキ生成 → data/kanji-summer-2026.js
python3 kanji-writing-demo/tools/build-kanji-deck.py /tmp/kvg/package/dist/main

# 検証
node scripts/validate-kanji-deck.js
```

問題を足すときは prompts JSON に追記して再生成する。**再生成したら `kanji.html` 内の `?v=` トークンを `kanji-app.js` と同時に上げること。**

## タッチ操作の注意点

指で連続して画を書くと、端末によっては「ダブルタップ」と誤認識され、ズームやテキスト選択(コピー)メニューが出ることがある。対策として、`touch-action:manipulation`(html/body)・`user-select:none`・`-webkit-touch-callout:none` に加え、350ms以内の連続タップの2回目を `touchend` で明示的に `preventDefault` している（iOSでCSSだけでは抑止しきれない場合の保険）。キャンバス自体は既存どおり `touch-action:none` で全ジェスチャーを自前のポインタ処理に渡す。

## 判定の調整

しきい値は `kanji-app.js` の `JUDGE` 定数（なぞり/みないで別）。短い画は画の長さに応じて始点・終点の許容を自動で絞る。既知の限界: 験・観など密集した字では、形がほぼ同じ隣り合う短い画どうしの入れちがいは検出できないことがある（意図的な妥協。小4の指の精度優先）。

## テスト用フック

`kanji.html?child=child-3&date=2026-07-19` のように `?date=` を付けると日付を注入でき、`window.__KANJI_TEST__` から内部状態を確認できる（date未指定時は無効）。

## ライセンス

字形・筆順データは [KanjiVG](https://kanjivg.tagaini.net/) © Ulrich Apel、CC BY-SA 3.0。帰属表示を `kanji.html` フッタと生成データのヘッダに含めている。
