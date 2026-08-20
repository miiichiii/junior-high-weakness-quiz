# Storage

このクイズはブラウザ内に記録を保存します。Firebase設定を入れた場合は、Googleログインした親アカウントのFirestoreにも自動同期します。

## 保存されるもの

- `weaknessQuiz:{childId}:progress`: 問題ごとの正解数、不正解数、復習待ち、ミス分類
- `weaknessQuiz:{childId}:stats`: 日別の解答数、正答数、練習回数
- `weaknessQuiz:{childId}:scratchNotes`: 方程式系問題の途中式メモ
- `weaknessQuiz:{childId}:goal`: 志望校、目標点、仮入試日、模試点

保存先は `localStorage` です。iPhoneで開いた場合も、そのiPhoneのそのブラウザ内には保存されます。3人分は `child-1`, `child-2`, `child-3` で分かれます。
URLも `?child=child-1`, `?child=child-2`, `?child=child-3` で分けています。

Firebaseを設定した場合は、同じデータを次のFirestoreパスにも保存します。

```text
users/{uid}/children/{childId}/records/default
```

## 旧バージョンからの引き継ぎ

旧バージョンの保存キーは次の名前でした。

- `weaknessQuizProgress`
- `weaknessQuizStats`
- `weaknessQuizScratchNotes`

更新版では、同じ端末・同じブラウザで開いた場合、これらを `child-1` の記録として読み込みます。
pushしただけでは旧キーを削除しません。更新版で解答、同期、JSON読み込みなどを行うと、新しい子供別キーにも保存されます。

`child-2` と `child-3` は新規の保存枠です。旧JSONを別の子供に割り当てたい場合は、その子供を選択してからJSONを読み込みます。

## 問題バンク

現在の既存問題は、子供1（中3）専用として扱います。
子供2・子供3用の問題を追加するときは、問題データに `childIds` を付けます。

```js
{
  id: "junior2-math-linear-001",
  childIds: ["child-2"],
  subject: "数学",
  unit: "1次関数",
  // ...
}
```

## 注意点

- Firebase未設定または未ログインの場合、MacとiPhoneの間では自動同期されません。
- Firebase未設定または未ログインの場合、SafariとChromeなど、別ブラウザ間でも自動共有されません。
- プライベートブラウズ、ブラウザデータ削除、端末変更では消える可能性があります。

## バックアップ

サイドバーの「記録を書き出す」で、記録をJSONファイルとして保存できます。

別端末へ移す場合は、JSONファイルをiCloud Driveなどで移動し、「記録を読み込む」からインポートします。読み込み時は、そのブラウザ内の既存記録を上書きします。

Firebaseの設定方法は [FIREBASE_SETUP.md](FIREBASE_SETUP.md) を見てください。

## SQLiteについて

一人用でも、GitHub Pagesだけで共有SQLiteへ直接保存することはできません。GitHub Pagesは静的ホスティングなので、サーバー側でSQLiteファイルを書き換える処理を持てないためです。

SQLite系の履歴DBを使う場合は、Cloudflare D1、Turso/libSQL、Supabase、FirebaseなどをAPI経由で使う構成が必要です。今の段階では、`localStorage` とJSONエクスポート/インポートが最も軽くて安全です。
