#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "firebase-sync.js"), "utf8");
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
  where(field, operator, value) {
    this.filter = { field, operator, value };
    return this;
  }
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
  enablePersistence() { return Promise.resolve(); }
};
const auth = {
  currentUser: { uid: "learner-uid", email: "learner@example.test", isAnonymous: false },
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
    firebase: {
      apps: [{}],
      initializeApp() {},
      auth: firebaseAuth,
      firestore
    }
  },
  localStorage: {
    getItem(key) { return local.get(key) || null; },
    setItem(key, value) { local.set(key, String(value)); },
    removeItem(key) { local.delete(key); }
  },
  console
};
vm.createContext(context);

records.set("households/family-1", {
  ownerUid: "parent-uid",
  memberEmails: ["parent@example.test", "learner@example.test"]
});
records.set("households/family-1/children/child-1/records/default", {
  progress: { "challenge-geo-01-parent-trial": { packAttempts: 1 } },
  stats: { daily: {}, packs: {} }
});
records.set("users/learner-uid/children/child-1/records/default", {
  progress: { "challenge-sci1-01-child": { packAttempts: 10 } },
  stats: { daily: {}, packs: { "challenge-science-year1": { answered: 10 } } }
});
records.set("households/family-1/children/child-2/records/default", {
  child: { id: "child-2", name: "学習者2" },
  learnerUid: "child2-uid",
  learnerEmail: "child2@example.test",
  summary: { answered: 7 },
  updatedAtClient: "2026-08-20T08:00:00.000Z"
});
records.set("users/parent-uid/children/child-2/records/default", {
  child: { id: "child-2", name: "保護者のお試し" },
  summary: { answered: 99 }
});

vm.runInContext(source, context, { filename: "firebase-sync.js" });

(async () => {
  const cloud = context.window.WeaknessQuizCloud;
  cloud.init();
  const sources = await cloud.getLearnerRecordSources("child-1", { serverOnly: true });
  if (sources.role !== "unassigned") throw new Error(`expected unassigned learner role, got ${sources.role}`);
  if (!sources.privateRecord?.progress?.["challenge-sci1-01-child"]) throw new Error("learner private Google record was not loaded");
  if (!sources.sharedRecord?.progress?.["challenge-geo-01-parent-trial"]) throw new Error("legacy shared record fixture is missing");

  const migration = await cloud.claimLearnerRecord("child-1", {
    version: 2,
    app: "junior-high-weakness-quiz",
    child: { id: "child-1", name: "長男" },
    progress: sources.privateRecord.progress,
    stats: sources.privateRecord.stats,
    summary: { answered: 10 }
  });
  if (!migration.saved || !migration.verified || migration.total !== 10) {
    throw new Error("learner record was not server-verified during migration");
  }
  const shared = records.get("households/family-1/children/child-1/records/default");
  if (!shared.learnerProgress?.["challenge-sci1-01-child"]) throw new Error("learner record was not migrated into family sharing");
  if (shared.learnerUid !== "learner-uid" || shared.learnerEmail !== "learner@example.test") {
    throw new Error("learner identity was not saved with the shared record");
  }
  if (!shared.progress?.["challenge-geo-01-parent-trial"]) throw new Error("legacy parent trial should remain isolated, not be rewritten");

  auth.currentUser = { uid: "parent-uid", email: "parent@example.test", isAnonymous: false };
  const parentSources = await cloud.getLearnerRecordSources("child-1", { serverOnly: true });
  if (parentSources.role !== "parent") throw new Error(`expected parent role, got ${parentSources.role}`);
  const before = JSON.stringify(shared.learnerProgress);
  const result = await cloud.saveLearnerRecord("child-1", {
    progress: { "challenge-geo-01-new-parent-trial": { packAttempts: 1 } },
    stats: { daily: {}, packs: {} }
  });
  if (result.saved !== false || JSON.stringify(shared.learnerProgress) !== before) {
    throw new Error("parent trial was allowed into Shoutaro's learner record");
  }

  const parentRecord = await cloud.getParentLearnerRecord("child-1", { serverOnly: true });
  if (parentRecord.status !== "ready" || parentRecord.total !== 10 || parentRecord.learnerEmail !== "learner@example.test") {
    throw new Error("parent learner record does not report verified learner progress");
  }

  const family = await cloud.getFamilyDashboardRecords(["child-1", "child-2", "child-3"], { serverOnly: true });
  const child2 = family.children.find((entry) => entry.childId === "child-2");
  const child3 = family.children.find((entry) => entry.childId === "child-3");
  if (family.status !== "ready" || family.children.length !== 3) {
    throw new Error("family dashboard did not return every requested child");
  }
  if (child2?.status !== "ready" || child2.record?.summary?.answered !== 7 || child2.record?.child?.name !== "学習者2") {
    throw new Error("family dashboard used the parent's private fallback instead of the shared child record");
  }
  if (child3?.status !== "unlinked" || child3.record !== null) {
    throw new Error("family dashboard must distinguish an unlinked child from a real zero record");
  }

  console.log(JSON.stringify({ privateScienceAttempts: 10, serverVerified: true, parentWriteBlocked: true, familyChildren: 3, privateFallbackBlocked: true, status: "PASS" }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
