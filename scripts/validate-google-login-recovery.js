#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "firebase-sync.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeContext({ linkError = null } = {}) {
  const calls = { link: 0, credential: 0, popup: 0 };
  const existingUser = {
    uid: "existing-google-user",
    email: "learner@example.test",
    isAnonymous: false
  };
  const anonymousUser = {
    uid: "anonymous-user",
    email: null,
    isAnonymous: true,
    async linkWithPopup() {
      calls.link += 1;
      if (linkError) throw linkError;
      auth.currentUser = existingUser;
      return { user: existingUser };
    }
  };
  const auth = {
    currentUser: anonymousUser,
    onAuthStateChanged() { return () => {}; },
    async signInWithCredential(credential) {
      calls.credential += 1;
      calls.usedCredential = credential;
      this.currentUser = existingUser;
      return { user: existingUser };
    },
    async signInWithPopup() {
      calls.popup += 1;
      this.currentUser = existingUser;
      return { user: existingUser };
    }
  };
  const db = {
    enablePersistence() { return Promise.resolve(); },
    collection() { throw new Error("Firestore should not be used by this validation"); }
  };
  function firestore() { return db; }
  function firebaseAuth() { return auth; }
  function GoogleAuthProvider() {}
  GoogleAuthProvider.prototype.setCustomParameters = function setCustomParameters() {};
  GoogleAuthProvider.credentialFromError = (error) => error?.credential || null;
  firebaseAuth.GoogleAuthProvider = GoogleAuthProvider;

  const context = {
    window: {
      WEAKNESS_QUIZ_FIREBASE_CONFIG: { apiKey: "test" },
      firebase: {
        apps: [{}],
        initializeApp() {},
        auth: firebaseAuth,
        firestore
      }
    },
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    },
    console
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "firebase-sync.js" });
  context.window.WeaknessQuizCloud.init();
  return { cloud: context.window.WeaknessQuizCloud, auth, calls };
}

(async () => {
  const credential = { providerId: "google.com", token: "existing-account" };
  const recoverable = makeContext({
    linkError: Object.assign(new Error("credential already in use"), {
      code: "auth/credential-already-in-use",
      credential
    })
  });
  const recovered = await recoverable.cloud.signInWithGoogle();
  assert(recoverable.calls.link === 1, "anonymous Google linking was not attempted");
  assert(recoverable.calls.credential === 1, "existing Google account fallback was not used");
  assert(recoverable.calls.popup === 0, "a second popup was opened during account recovery");
  assert(recoverable.calls.usedCredential === credential, "the Firebase credential was not preserved");
  assert(recovered.user?.uid === "existing-google-user", "existing Google user was not signed in");

  const directLink = makeContext();
  const linked = await directLink.cloud.signInWithGoogle();
  assert(directLink.calls.link === 1, "normal anonymous account linking was not attempted");
  assert(directLink.calls.credential === 0, "normal linking unexpectedly used recovery");
  assert(linked.user?.uid === "existing-google-user", "normal Google linking did not complete");

  assert(source.includes('error?.code === "auth/credential-already-in-use"'), "recovery error code guard is missing");
  assert(source.includes("GoogleAuthProvider.credentialFromError"), "Firebase credential extraction fallback is missing");

  console.log(JSON.stringify({ existingAccountRecovered: true, normalLinkPreserved: true, status: "PASS" }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
