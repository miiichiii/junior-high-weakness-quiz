# Firebase Setup

このアプリは、ローカル保存を残したまま Firebase Firestore に自動同期できます。Googleアカウントがない場合も、Firebase匿名ユーザーとして自動保存します。

## 保存先

共有設定前は、Googleログインしたアカウントの `uid` の下に子供3人分を保存します。

```text
users/{uid}/children/child-1/records/default
users/{uid}/children/child-2/records/default
users/{uid}/children/child-3/records/default
```

Challenge Baseで共有相手を登録した後は、2つのGoogleアカウントが同じ世帯レコードを読み書きします。

```text
households/{householdId}/children/child-1/records/default
households/{householdId}/children/child-2/records/default
households/{householdId}/children/child-3/records/default
```

世帯には登録された2つのGoogleメールだけがアクセスできます。メールアドレスは公開コードやルールへ直書きしません。

各レコードには、問題ごとの記録、日別統計、途中式メモ、受験目標、模試点、集計済みサマリーが入ります。

## Firebase 側の準備

現在の接続先は家族管理用の Firebase プロジェクト `weakness-quiz-hamamicchi` です。
Firebase Auth の承認済みドメインには、ローカル確認用の `localhost` と GitHub Pages 用の `miiichiii.github.io` を設定しています。

1. Firebase Consoleでプロジェクトを作成します。
2. AuthenticationでGoogleログインを有効にします。
3. Authenticationで匿名ログインを有効にします（Sign-in providers → Anonymous）。
4. Firestore Databaseを作成します。
5. AuthenticationのAuthorized domainsに、GitHub Pagesのドメインを追加します。
6. Firebase ConsoleのWebアプリ設定から `firebaseConfig` をコピーします。
7. `firebase-config.js` の設定をコピーした設定に置き換えます。

```js
window.WEAKNESS_QUIZ_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## Firestore Security Rules

Firestore Rulesでは、従来の本人用レコードに加え、世帯に登録された2人だけが共有レコードを読み書きできます。実際のルールは `firestore.rules` を参照してください。

このリポジトリでは `firestore.rules` と `firebase.json` に設定を置いています。
反映するときは次を実行します。

```bash
firebase deploy --only firestore:rules --project weakness-quiz-hamamicchi
```

## ローカル確認

Firebase Authを使う場合は、`file://` ではなくローカルサーバーで確認します。

```bash
python3 -m http.server 5173
```

ブラウザで `http://localhost:5173` を開きます。

## 同期の動き

- 解答、ミス分類、途中式メモ、JSON読み込み、リセット後に自動保存します。
- オンライン時はFirestoreへ同期します。
- Googleログインなしでも匿名ユーザーとしてFirestoreへ保存します。匿名認証が使えない場合もローカル保存は続きます。
- 別端末で同じGoogleアカウントにログインすると、子供ごとの記録を読み込みます。
- Challenge Baseで共有相手を1回登録すると、登録された2つのGoogleアカウントは別端末でも同じ記録を読み込みます。
- 保護者確認だけをしたい場合は、同じGoogleアカウントで `parent-dashboard.html` を開くと、子供3人分の同期済み記録を一覧できます。
