#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "firebase-sync.js"), "utf8");
const rules = fs.readFileSync(path.join(ROOT, "firestore.rules"), "utf8");
const records = new Map();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

class DocumentRef {
  constructor(parts) { this.parts = parts; }
  collection(name) { return new CollectionRef([...this.parts, name]); }
  async get() {
    const data = records.get(this.parts.join("/"));
    return { exists: Boolean(data), data: () => clone(data) };
  }
  async set(data, options) {
    const key = this.parts.join("/");
    const previous = options?.merge ? records.get(key) || {} : {};
    records.set(key, { ...clone(previous), ...clone(data) });
  }
}

class CollectionRef {
  constructor(parts) { this.parts = parts; this.filter = null; }
  doc(id) { return new DocumentRef([...this.parts, id || "generated"]); }
  where(field, operator, value) { this.filter = { field, operator, value }; return this; }
  limit() { return this; }
  async get() {
    const prefix = `${this.parts.join("/")}/`;
    const docs = [];
    records.forEach((data, key) => {
      if (!key.startsWith(prefix) || key.slice(prefix.length).includes("/")) return;
      const values = data[this.filter?.field] || [];
      if (this.filter?.operator === "array-contains" && !values.includes(this.filter.value)) return;
      docs.push({ id: key.slice(prefix.length), data: () => clone(data) });
    });
    return { empty: docs.length === 0, docs };
  }
}

const db = {
  collection(name) { return new CollectionRef([name]); },
  enablePersistence() { return Promise.resolve(); },
  async runTransaction(callback) {
    return callback({
      get(ref) { return ref.get(); },
      set(ref, data, options) { return ref.set(data, options); }
    });
  }
};
const auth = {
  currentUser: { uid: "parent-uid", email: "parent@example.test", isAnonymous: false },
  onAuthStateChanged() { return () => {}; },
  signOut() { return Promise.resolve(); }
};
function firestore() { return db; }
firestore.FieldValue = { serverTimestamp: () => "SERVER_TIME" };
function firebaseAuth() { return auth; }
firebaseAuth.GoogleAuthProvider = function GoogleAuthProvider() {};

const local = new Map();
const context = {
  window: {
    WEAKNESS_QUIZ_FIREBASE_CONFIG: { apiKey: "test" },
    firebase: { apps: [{}], initializeApp() {}, auth: firebaseAuth, firestore },
    crypto: { getRandomValues(bytes) { bytes.forEach((_, index) => { bytes[index] = index + 1; }); return bytes; } },
    location: { href: "https://example.test/family-dashboard.html", search: "", pathname: "/family-dashboard.html", hash: "" },
    history: { replaceState() {} }
  },
  localStorage: {
    getItem(key) { return local.get(key) || null; },
    setItem(key, value) { local.set(key, String(value)); },
    removeItem(key) { local.delete(key); }
  },
  URL,
  URLSearchParams,
  Uint8Array,
  Date,
  console
};
vm.createContext(context);
records.set("households/family-1", {
  ownerUid: "parent-uid",
  memberEmails: ["parent@example.test", "learner@example.test"]
});
vm.runInContext(source, context, { filename: "firebase-sync.js" });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const cloud = context.window.WeaknessQuizCloud;
  cloud.init();
  const pairing = await cloud.createChildPairing("child-3");
  assert(pairing.code.length === 36 && pairing.url.includes("pairHousehold=family-1"), "secure child pairing link was not created");
  const pairKey = `households/family-1/pairings/${pairing.code}`;
  assert(records.get(pairKey)?.createdByUid === "parent-uid", "pairing document is missing its parent creator");

  auth.currentUser = { uid: "anonymous-child-uid", email: null, isAnonymous: true };
  const pairUrl = new URL(pairing.url);
  context.window.location.href = pairUrl.toString();
  context.window.location.pathname = pairUrl.pathname;
  context.window.location.search = pairUrl.search;
  const claim = await cloud.claimChildPairingFromLocation("child-3", {
    version: 2,
    child: { id: "child-3", name: "学習者3" },
    math4: { updatedAt: "2026-08-20T10:00:00.000Z", daily: { "2026-08-20": { kukuClears: 2 } } }
  });
  assert(claim.claimed, "anonymous child did not claim the family pairing");
  const sharedKey = "households/family-1/children/child-3/records/default";
  assert(records.get(sharedKey)?.learnerUid === "anonymous-child-uid", "paired record is not assigned to the anonymous learner");
  assert(records.get(pairKey)?.claimedUid === "anonymous-child-uid", "pairing was not marked as claimed");
  assert(records.get("users/anonymous-child-uid/assignments/child-3")?.householdId === "family-1", "pairing assignment was not persisted for recovery");

  await cloud.saveRecord("child-3", { kanji: { updatedAt: "2026-08-20T11:00:00.000Z" } });
  assert(records.get(sharedKey)?.kanji?.updatedAt === "2026-08-20T11:00:00.000Z", "later anonymous saves did not stay in the household record");
  assert(!records.has("users/anonymous-child-uid/children/child-3/records/default"), "paired saves fell back to the anonymous private record");
  const remote = await cloud.getRecord("child-3", { serverOnly: true });
  assert(remote?.learnerUid === "anonymous-child-uid", "paired anonymous learner could not read its shared record");
  local.clear();
  await cloud.saveRecord("child-3", { math4: { updatedAt: "2026-08-20T12:00:00.000Z" } });
  assert(records.get(sharedKey)?.math4?.updatedAt === "2026-08-20T12:00:00.000Z", "server assignment did not recover after local storage loss");

  auth.currentUser = { uid: "parent-uid", email: "parent@example.test", isAnonymous: false };
  const family = await cloud.getFamilyDashboardRecords(["child-3"], { serverOnly: true });
  assert(family.children[0]?.status === "ready" && family.children[0]?.record?.kanji, "parent dashboard could not read the paired anonymous record");

  const takeoverPairing = await cloud.createChildPairing("child-3");
  auth.currentUser = { uid: "attacker-uid", email: null, isAnonymous: true };
  const takeoverUrl = new URL(takeoverPairing.url);
  context.window.location.href = takeoverUrl.toString();
  context.window.location.pathname = takeoverUrl.pathname;
  context.window.location.search = takeoverUrl.search;
  let takeoverBlocked = false;
  try {
    await cloud.claimChildPairingFromLocation("child-3", { child: { id: "child-3" }, math4: {} });
  } catch (error) {
    takeoverBlocked = /別の学習端末/.test(error.message);
  }
  assert(takeoverBlocked && records.get(sharedKey)?.learnerUid === "anonymous-child-uid", "a second pairing took over an existing learner record");

  for (const required of ["match /pairings/{pairingCode}", "validPairing", "assignedLearner", "getAfter(path).data.claimedUid", "data.keys().hasAny(['learnerUid'])", "allow get", "request.resource.data.diff(resource.data).affectedKeys().hasOnly"]) {
    assert(rules.includes(required), `Firestore pairing rule is missing: ${required}`);
  }
  console.log(JSON.stringify({ anonymousPaired: true, assignmentRecovered: true, laterSharedSave: true, parentReadable: true, takeoverBlocked: true, linkBytes: 18, status: "PASS" }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
