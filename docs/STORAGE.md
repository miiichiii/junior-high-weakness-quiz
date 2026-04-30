# Storage

このクイズはログインやサーバーを使わず、ブラウザ内に記録を保存します。

## 保存されるもの

- `weaknessQuizProgress`: 問題ごとの正解数、不正解数、復習待ち、ミス分類
- `weaknessQuizStats`: 日別の解答数、正答数

保存先は `localStorage` です。iPhoneで開いた場合も、そのiPhoneのそのブラウザ内には保存されます。

## 注意点

- MacとiPhoneの間では自動同期されません。
- SafariとChromeなど、別ブラウザ間でも自動共有されません。
- プライベートブラウズ、ブラウザデータ削除、端末変更では消える可能性があります。

## バックアップ

サイドバーの「記録を書き出す」で、記録をJSONファイルとして保存できます。

別端末へ移す場合は、JSONファイルをiCloud Driveなどで移動し、「記録を読み込む」からインポートします。読み込み時は、そのブラウザ内の既存記録を上書きします。

## SQLiteについて

一人用でも、GitHub Pagesだけで共有SQLiteへ直接保存することはできません。GitHub Pagesは静的ホスティングなので、サーバー側でSQLiteファイルを書き換える処理を持てないためです。

SQLite系の履歴DBを使う場合は、Cloudflare D1、Turso/libSQL、Supabase、FirebaseなどをAPI経由で使う構成が必要です。今の段階では、`localStorage` とJSONエクスポート/インポートが最も軽くて安全です。
