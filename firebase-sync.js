(function () {
  const RECORD_ID = "default";
  const state = {
    initialized: false,
    available: false,
    auth: null,
    db: null,
    householdId: "",
    householdInfo: null,
    householdUid: "",
    anonymousAttempted: false,
    parentSession: false
  };

  function normalizedEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  async function readSnapshot(ref, serverOnly = false) {
    return serverOnly ? ref.get({ source: "server" }) : ref.get();
  }

  function resetHouseholdForUser(user) {
    if (!state.householdUid || state.householdUid === user?.uid) return;
    state.householdId = "";
    state.householdInfo = null;
    state.householdUid = "";
  }

  function init() {
    if (state.initialized) {
      return { available: state.available, message: state.available ? "Firebase接続可" : "Firebase未設定" };
    }
    state.initialized = true;

    const config = window.WEAKNESS_QUIZ_FIREBASE_CONFIG;
    if (!config || typeof config !== "object") {
      return { available: false, message: "Firebase未設定" };
    }
    if (!window.firebase || !window.firebase.apps) {
      return { available: false, message: "Firebase読込失敗" };
    }

    try {
      if (!window.firebase.apps.length) window.firebase.initializeApp(config);
      state.auth = window.firebase.auth();
      state.db = window.firebase.firestore();
      state.available = true;
      enableOfflinePersistence();
      return { available: true, message: "Firebase接続可" };
    } catch (error) {
      console.error("Firebase initialization failed", error);
      return { available: false, message: "Firebase初期化失敗" };
    }
  }

  function initParentSession() {
    if (state.initialized && state.parentSession) {
      return { available: state.available, message: state.available ? "保護者セッション接続可" : "Firebase未設定", ready: Promise.resolve() };
    }
    const config = window.WEAKNESS_QUIZ_FIREBASE_CONFIG;
    if (!config || typeof config !== "object" || !window.firebase?.apps) {
      return { available: false, message: "Firebase未設定", ready: Promise.resolve() };
    }
    try {
      const appName = "family-parent-dashboard";
      const app = window.firebase.apps.find((candidate) => candidate.name === appName)
        || window.firebase.initializeApp(config, appName);
      state.auth = app.auth();
      state.db = app.firestore();
      state.available = true;
      state.initialized = true;
      state.parentSession = true;
      const persistence = window.firebase.auth.Auth?.Persistence?.SESSION;
      const ready = persistence && typeof state.auth.setPersistence === "function"
        ? state.auth.setPersistence(persistence)
        : Promise.resolve();
      return { available: true, message: "保護者セッション接続可", ready };
    } catch (error) {
      console.error("Parent Firebase initialization failed", error);
      return { available: false, message: "Firebase初期化失敗", ready: Promise.resolve() };
    }
  }

  function enableOfflinePersistence() {
    if (!state.db || typeof state.db.enablePersistence !== "function") return;
    state.db.enablePersistence({ synchronizeTabs: true }).catch((error) => {
      if (error.code !== "failed-precondition" && error.code !== "unimplemented") {
        console.warn("Firestore offline persistence failed", error);
      }
    });
  }

  function onAuthStateChanged(callback) {
    if (!state.auth) return function noop() {};
    return state.auth.onAuthStateChanged(callback);
  }

  async function signInWithGoogle() {
    assertReady();
    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    if (state.auth.currentUser?.isAnonymous && typeof state.auth.currentUser.linkWithPopup === "function") {
      try {
        return await state.auth.currentUser.linkWithPopup(provider);
      } catch (error) {
        const credential = error?.credential
          || window.firebase.auth.GoogleAuthProvider.credentialFromError?.(error);
        if (error?.code === "auth/credential-already-in-use"
          && credential
          && typeof state.auth.signInWithCredential === "function") {
          return state.auth.signInWithCredential(credential);
        }
        throw error;
      }
    }
    return state.auth.signInWithPopup(provider);
  }

  async function signInParentWithGoogle() {
    assertReady();
    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return state.auth.signInWithPopup(provider);
  }

  async function ensureAnonymousAuth() {
    assertReady();
    if (state.auth.currentUser) return state.auth.currentUser;
    if (state.anonymousAttempted) return null;
    state.anonymousAttempted = true;
    try {
      const credential = await state.auth.signInAnonymously();
      return credential.user || state.auth.currentUser;
    } catch (error) {
      console.warn("Anonymous Firebase sign-in unavailable; local saving remains active.", error);
      return null;
    }
  }

  function signOut() {
    if (!state.auth) return Promise.resolve();
    state.householdId = "";
    state.householdInfo = null;
    state.householdUid = "";
    return state.auth.signOut();
  }

  function learnerRole(user, householdId, sharedRecord) {
    if (!householdId) return "learner";
    if (!sharedRecord?.learnerUid) return "unassigned";
    return sharedRecord.learnerUid === user.uid ? "learner" : "parent";
  }

  async function getAccountRole(childId = "child-1") {
    assertReady();
    if (!state.auth.currentUser) return "none";
    const sources = await getLearnerRecordSources(childId);
    return sources.role;
  }

  async function getLearnerRecordSources(childId, options = {}) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user) return { role: "none", householdId: "", privateRecord: null, sharedRecord: null };
    const serverOnly = Boolean(options.serverOnly);
    const scope = await householdForChild(user, childId, { serverOnly });
    const householdId = scope.householdId;
    const privateSnapshot = await readSnapshot(privateRecordRef(user.uid, childId), serverOnly);
    let sharedRecord = null;
    if (householdId) {
      const sharedSnapshot = await readSnapshot(sharedRecordRef(householdId, childId), serverOnly);
      sharedRecord = sharedSnapshot.exists ? sharedSnapshot.data() : null;
    }
    return {
      role: learnerRole(user, householdId, sharedRecord),
      householdId,
      householdOwner: Boolean(householdId && state.householdInfo?.ownerUid === user.uid),
      paired: Boolean(scope.assignment),
      privateRecord: privateSnapshot.exists ? privateSnapshot.data() : null,
      sharedRecord
    };
  }

  function challengeAnsweredTotal(progress, stats) {
    const progressTotal = Object.entries(progress || {})
      .filter(([id]) => id.startsWith("challenge-"))
      .reduce((sum, [, record]) => sum + (Number(record?.packAttempts) || 0), 0);
    const statsTotal = Object.entries(stats?.packs || {})
      .filter(([packId]) => packId.startsWith("challenge-"))
      .reduce((sum, [, record]) => sum + (Number(record?.answered) || 0), 0);
    return Math.max(progressTotal, statsTotal);
  }

  async function saveLearnerRecord(childId, payload, options = {}) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user) return { saved: false, role: "none" };
    const scope = await householdForChild(user, childId, { serverOnly: Boolean(options.serverOnly) });
    const householdId = scope.householdId;
    const total = challengeAnsweredTotal(payload.progress, payload.stats);
    if (!householdId) {
      await privateRecordRef(user.uid, childId).set({
        ...payload,
        recordScope: "learner",
        learnerUid: user.uid,
        ownerUid: user.uid,
        childId,
        recordId: RECORD_ID,
        updatedAtClient: new Date().toISOString(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { saved: true, verified: false, shared: false, role: "learner", reason: "household-missing", total };
    }
    const ref = sharedRecordRef(householdId, childId);
    const existingSnapshot = await readSnapshot(ref, Boolean(options.serverOnly));
    const existing = existingSnapshot.exists ? existingSnapshot.data() : null;
    const role = learnerRole(user, householdId, existing);
    if (role === "parent") {
      return { saved: false, verified: false, shared: true, role, reason: "learner-owned-by-other", total };
    }
    if (role === "unassigned" && !options.claimLearner) {
      return { saved: false, verified: false, shared: true, role, reason: "learner-unregistered", total };
    }
    const syncedAt = new Date().toISOString();
    await ref.set({
      learnerVersion: Number(payload.version) || 2,
      learnerApp: payload.app || "junior-high-weakness-quiz",
      learnerChild: payload.child || { id: childId },
      learnerProgress: payload.progress || {},
      learnerStats: payload.stats || { daily: {}, packs: {} },
      learnerSummary: payload.summary || {},
      learnerUid: user.uid,
      learnerEmail: normalizedEmail(user.email),
      ...(scope.assignment ? { pairingCode: scope.assignment.pairingCode, recordScope: "paired-learner" } : {}),
      learnerAnsweredTotal: total,
      learnerUpdatedAtClient: syncedAt,
      learnerUpdatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    const verifiedSnapshot = await readSnapshot(ref, true);
    const verifiedRecord = verifiedSnapshot.exists ? verifiedSnapshot.data() : null;
    const verified = verifiedRecord?.learnerUid === user.uid
      && Number(verifiedRecord?.learnerAnsweredTotal) >= total;
    return {
      saved: verified,
      verified,
      shared: true,
      role: "learner",
      reason: verified ? "saved" : "verification-failed",
      total,
      record: verifiedRecord
    };
  }

  function claimLearnerRecord(childId, payload) {
    return saveLearnerRecord(childId, payload, { claimLearner: true, serverOnly: true });
  }

  async function getParentLearnerRecord(childId, options = {}) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user) return { status: "not-signed-in", householdId: "", record: null };
    if (user.isAnonymous || !user.email) return { status: "anonymous", householdId: "", record: null };
    const householdId = await findHousehold({ serverOnly: options.serverOnly !== false });
    if (!householdId) return { status: "household-missing", householdId: "", record: null };
    const snapshot = await readSnapshot(sharedRecordRef(householdId, childId), options.serverOnly !== false);
    if (!snapshot.exists) return { status: "learner-unregistered", householdId, record: null };
    const record = snapshot.data();
    if (!record?.learnerUid) return { status: "learner-unregistered", householdId, record };
    return {
      status: "ready",
      householdId,
      viewerEmail: normalizedEmail(user.email),
      record,
      learnerEmail: normalizedEmail(record.learnerEmail),
      total: Number(record.learnerAnsweredTotal) || 0
    };
  }

  function familyRecordForChild(childId, record) {
    if (!record) return null;
    if (childId !== "child-1" || !record.learnerUid) return record;
    return {
      ...record,
      child: record.learnerChild || record.child || { id: childId },
      progress: record.learnerProgress || {},
      stats: record.learnerStats || { daily: {}, packs: {} },
      summary: record.learnerSummary || {},
      updatedAtClient: record.learnerUpdatedAtClient || record.updatedAtClient || "",
      syncedAtClient: record.learnerUpdatedAtClient || "",
      recordScope: "verified-learner"
    };
  }

  async function getFamilyDashboardRecords(childIds, options = {}) {
    assertReady();
    const user = state.auth.currentUser;
    const ids = Array.from(new Set((childIds || []).filter((id) => (
      id === "child-1" || id === "child-2" || id === "child-3"
    ))));
    if (!user) {
      return { status: "not-signed-in", viewerEmail: "", householdId: "", children: [] };
    }
    if (user.isAnonymous || !user.email) {
      return { status: "anonymous", viewerEmail: "", householdId: "", children: [] };
    }
    const serverOnly = options.serverOnly !== false;
    const householdId = await findHousehold({ serverOnly });
    const viewerEmail = normalizedEmail(user.email);
    if (!householdId) {
      return {
        status: "household-missing",
        viewerEmail,
        householdId: "",
        children: ids.map((childId) => ({ childId, status: "household-missing", record: null }))
      };
    }
    const results = await Promise.allSettled(ids.map(async (childId) => {
      const snapshot = await readSnapshot(sharedRecordRef(householdId, childId), serverOnly);
      if (!snapshot.exists) return { childId, status: "unlinked", record: null };
      const raw = snapshot.data();
      if (!raw?.learnerUid) {
        return { childId, status: childId === "child-1" ? "learner-unregistered" : "legacy-unverified", record: null };
      }
      return {
        childId,
        status: "ready",
        record: familyRecordForChild(childId, raw),
        learnerEmail: normalizedEmail(raw?.learnerEmail),
        syncedAt: childId === "child-1"
          ? raw?.learnerUpdatedAtClient || ""
          : raw?.updatedAtClient || raw?.eikenVocabulary?.updatedAt || raw?.eikenExam?.updatedAt
            || raw?.kanji?.updatedAt || raw?.math4?.updatedAt || ""
      };
    }));
    return {
      status: "ready",
      viewerEmail,
      householdId,
      children: results.map((result, index) => result.status === "fulfilled"
        ? result.value
        : { childId: ids[index], status: "error", record: null, error: String(result.reason?.message || result.reason || "read-failed") })
    };
  }

  async function getRecord(childId, options = {}) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user) return null;
    const serverOnly = Boolean(options.serverOnly);
    const scope = await householdForChild(user, childId, { serverOnly });
    const householdId = scope.householdId;
    if (householdId && scope.assignment) {
      const snapshot = await readSnapshot(sharedRecordRef(householdId, childId), serverOnly);
      return snapshot.exists ? snapshot.data() : null;
    }
    if (householdId) {
      const shared = await readSnapshot(sharedRecordRef(householdId, childId), serverOnly);
      if (shared.exists && shared.data()?.learnerUid === user.uid) return shared.data();
    }
    const privateSnapshot = await readSnapshot(privateRecordRef(user.uid, childId), serverOnly);
    return privateSnapshot.exists ? privateSnapshot.data() : null;
  }

  async function saveRecord(childId, payload) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user) return Promise.resolve();
    const scope = await householdForChild(user, childId);
    const householdId = scope.householdId;
    let ref = privateRecordRef(user.uid, childId);
    if (householdId && scope.assignment) {
      ref = sharedRecordRef(householdId, childId);
    } else if (householdId) {
      const shared = await readSnapshot(sharedRecordRef(householdId, childId));
      if (shared.exists && shared.data()?.learnerUid === user.uid) ref = sharedRecordRef(householdId, childId);
    }
    return ref.set({
      ...payload,
      ownerUid: user.uid,
      ...(scope.assignment ? {
        learnerUid: user.uid,
        learnerEmail: normalizedEmail(user.email),
        pairingCode: scope.assignment.pairingCode,
        recordScope: "paired-learner"
      } : {}),
      childId,
      recordId: RECORD_ID,
      updatedAtClient: new Date().toISOString(),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  function householdStorageKey(uid) {
    return `weaknessQuiz:household:${uid}`;
  }

  function assignmentStorageKey(uid, childId) {
    return `weaknessQuiz:familyAssignment:${uid}:${childId}`;
  }

  function childAssignment(user, childId) {
    if (!user?.uid) return null;
    try {
      const value = JSON.parse(localStorage.getItem(assignmentStorageKey(user.uid, childId)) || "null");
      return value?.householdId && value?.pairingCode ? value : null;
    } catch (_error) {
      return null;
    }
  }

  function saveChildAssignment(user, childId, assignment) {
    localStorage.setItem(assignmentStorageKey(user.uid, childId), JSON.stringify({
      householdId: assignment.householdId,
      pairingCode: assignment.pairingCode,
      claimedAt: new Date().toISOString()
    }));
  }

  async function householdForChild(user, childId, options = {}) {
    let assignment = childAssignment(user, childId);
    if (!assignment && user?.uid) {
      try {
        const snapshot = await readSnapshot(assignmentRef(user.uid, childId), Boolean(options.serverOnly));
        const remote = snapshot.exists ? snapshot.data() : null;
        if (remote?.householdId && remote?.pairingCode) {
          assignment = { householdId: remote.householdId, pairingCode: remote.pairingCode };
          saveChildAssignment(user, childId, assignment);
        }
      } catch (error) {
        console.warn("Family assignment recovery failed", error);
      }
    }
    if (assignment) return { householdId: assignment.householdId, assignment };
    return { householdId: await findHousehold(options), assignment: null };
  }

  async function findHousehold(options = {}) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user || !user.email) return "";
    const serverOnly = Boolean(options.serverOnly);
    resetHouseholdForUser(user);
    if (state.householdId && state.householdUid === user.uid) return state.householdId;
    const cached = localStorage.getItem(householdStorageKey(user.uid));
    if (cached) {
      const cachedDoc = await readSnapshot(state.db.collection("households").doc(cached), serverOnly);
      if (cachedDoc.exists && (cachedDoc.data().memberEmails || []).includes(normalizedEmail(user.email))) {
        state.householdId = cached;
        state.householdInfo = cachedDoc.data();
        state.householdUid = user.uid;
        return cached;
      }
      localStorage.removeItem(householdStorageKey(user.uid));
    }
    const householdQuery = state.db.collection("households")
      .where("memberEmails", "array-contains", user.email.toLowerCase())
      .limit(1);
    const snapshot = await (serverOnly
      ? householdQuery.get({ source: "server" })
      : householdQuery.get());
    if (snapshot.empty) return "";
    state.householdId = snapshot.docs[0].id;
    state.householdInfo = snapshot.docs[0].data();
    state.householdUid = user.uid;
    localStorage.setItem(householdStorageKey(user.uid), state.householdId);
    return state.householdId;
  }

  async function createHousehold(invitedEmail) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user || !user.email) throw new Error("Googleアカウントのメールを確認できません。");
    const ownerEmail = user.email.trim().toLowerCase();
    const partnerEmail = String(invitedEmail || "").trim().toLowerCase();
    if (!partnerEmail || !partnerEmail.includes("@") || partnerEmail === ownerEmail) {
      throw new Error("共有相手のGoogleメールを確認してください。");
    }
    const existing = await findHousehold();
    if (existing) return existing;
    const ref = state.db.collection("households").doc();
    await ref.set({
      ownerUid: user.uid,
      memberEmails: [ownerEmail, partnerEmail],
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });
    state.householdId = ref.id;
    state.householdInfo = {
      ownerUid: user.uid,
      memberEmails: [ownerEmail, partnerEmail]
    };
    state.householdUid = user.uid;
    localStorage.setItem(householdStorageKey(user.uid), state.householdId);
    return state.householdId;
  }

  function newPairingCode() {
    const bytes = new Uint8Array(18);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function pairingRef(householdId, code) {
    return state.db.collection("households").doc(householdId).collection("pairings").doc(code);
  }

  async function createChildPairing(childId) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user || user.isAnonymous || !user.email) throw new Error("保護者のGoogleログインが必要です。");
    if (!["child-1", "child-2", "child-3"].includes(childId)) throw new Error("子どもの指定が正しくありません。");
    const householdId = await findHousehold({ serverOnly: true });
    if (!householdId) throw new Error("先に家族共有を設定してください。");
    const code = newPairingCode();
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    await pairingRef(householdId, code).set({
      childId,
      createdByUid: user.uid,
      createdByEmail: normalizedEmail(user.email),
      claimedUid: "",
      active: true,
      expiresAt,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });
    const page = childId === "child-1" ? "challenge.html" : "index.html";
    const url = new URL(page, window.location.href);
    url.searchParams.set("child", childId);
    url.searchParams.set("pairHousehold", householdId);
    url.searchParams.set("pairCode", code);
    return { childId, householdId, code, url: url.toString(), expiresAt: expiresAt.toISOString() };
  }

  function pairingRequestFromLocation(childId) {
    const params = new URLSearchParams(window.location.search);
    const householdId = params.get("pairHousehold") || "";
    const code = params.get("pairCode") || "";
    const routedChildId = params.get("child") || childId;
    if (!householdId || !/^[a-zA-Z0-9_-]{8,160}$/.test(householdId)) return null;
    if (!/^[a-f0-9]{36}$/.test(code) || routedChildId !== childId) return null;
    return { householdId, code };
  }

  function pairingExpiryMillis(value) {
    if (value && typeof value.toMillis === "function") return value.toMillis();
    if (value && typeof value.toDate === "function") return value.toDate().getTime();
    return new Date(value).getTime();
  }

  async function claimChildPairingFromLocation(childId, payload) {
    assertReady();
    const request = pairingRequestFromLocation(childId);
    if (!request) return { claimed: false, reason: "pairing-missing" };
    const user = state.auth.currentUser;
    if (!user) return { claimed: false, reason: "not-signed-in" };
    const ref = pairingRef(request.householdId, request.code);
    const snapshot = await readSnapshot(ref, true);
    if (!snapshot.exists) throw new Error("接続リンクが見つかりません。");
    const pairing = snapshot.data();
    if (!pairing?.active || pairing.childId !== childId || pairingExpiryMillis(pairing.expiresAt) <= Date.now()) {
      throw new Error("接続リンクの期限が切れているか、子どもの指定が違います。");
    }
    if (pairing.createdByUid === user.uid) throw new Error("このリンクは子どもの学習端末で開いてください。");
    if (pairing.claimedUid && pairing.claimedUid !== user.uid) throw new Error("この接続リンクはすでに使用されています。");
    const sharedRef = sharedRecordRef(request.householdId, childId);
    const existingSharedSnapshot = await readSnapshot(sharedRef, true);
    const existingShared = existingSharedSnapshot.exists ? existingSharedSnapshot.data() : null;
    if (existingShared?.learnerUid && existingShared.learnerUid !== user.uid) {
      throw new Error("この子には別の学習端末が接続されています。");
    }

    const identity = {
      learnerUid: user.uid,
      learnerEmail: normalizedEmail(user.email),
      pairingCode: request.code,
      recordScope: "paired-learner"
    };
    const record = childId === "child-1" ? {
      learnerVersion: Number(payload?.version) || 2,
      learnerApp: payload?.app || "junior-high-weakness-quiz",
      learnerChild: payload?.child || { id: childId },
      learnerProgress: payload?.progress || {},
      learnerStats: payload?.stats || { daily: {}, packs: {} },
      learnerSummary: payload?.summary || {},
      learnerAnsweredTotal: challengeAnsweredTotal(payload?.progress, payload?.stats),
      learnerUpdatedAtClient: new Date().toISOString(),
      learnerUpdatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      ...identity
    } : {
      ...(payload || {}),
      ...identity,
      ownerUid: user.uid,
      childId,
      recordId: RECORD_ID,
      updatedAtClient: new Date().toISOString(),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    };

    const persistAssignment = async () => {
      const assignment = {
        householdId: request.householdId,
        pairingCode: request.code,
        childId,
        claimedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };
      await assignmentRef(user.uid, childId).set(assignment, { merge: true });
      saveChildAssignment(user, childId, assignment);
    };
    const clearPairingUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("pairHousehold");
      url.searchParams.delete("pairCode");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    };

    if (pairing.claimedUid === user.uid && existingShared?.learnerUid === user.uid) {
      await persistAssignment();
      clearPairingUrl();
      return { claimed: true, recovered: true, householdId: request.householdId, childId };
    }

    if (typeof state.db.runTransaction === "function") {
      await state.db.runTransaction(async (transaction) => {
        const current = await transaction.get(ref);
        const currentShared = await transaction.get(sharedRef);
        if (!current.exists) throw new Error("接続リンクが見つかりません。");
        const currentPairing = current.data();
        if (currentPairing.claimedUid && currentPairing.claimedUid !== user.uid) {
          throw new Error("この接続リンクはすでに使用されています。");
        }
        if (currentShared.exists && currentShared.data()?.learnerUid && currentShared.data().learnerUid !== user.uid) {
          throw new Error("この子には別の学習端末が接続されています。");
        }
        transaction.set(ref, {
          ...currentPairing,
          claimedUid: user.uid,
          claimedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });
        if (childId === "child-1") transaction.set(sharedRef, record, { merge: true });
        else transaction.set(sharedRef, record);
        transaction.set(assignmentRef(user.uid, childId), {
          householdId: request.householdId,
          pairingCode: request.code,
          childId,
          claimedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    } else {
      await ref.set({
        ...pairing,
        claimedUid: user.uid,
        claimedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
      if (childId === "child-1") await sharedRef.set(record, { merge: true });
      else await sharedRef.set(record);
      await assignmentRef(user.uid, childId).set({
        householdId: request.householdId,
        pairingCode: request.code,
        childId,
        claimedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    saveChildAssignment(user, childId, { householdId: request.householdId, pairingCode: request.code });
    clearPairingUrl();
    return { claimed: true, householdId: request.householdId, childId };
  }

  async function getPrivateRecord(childId) {
    assertReady();
    const user = state.auth.currentUser;
    if (!user) return null;
    const snapshot = await privateRecordRef(user.uid, childId).get();
    return snapshot.exists ? snapshot.data() : null;
  }

  function privateRecordRef(uid, childId) {
    return state.db
      .collection("users").doc(uid)
      .collection("children").doc(childId)
      .collection("records").doc(RECORD_ID);
  }

  function assignmentRef(uid, childId) {
    return state.db.collection("users").doc(uid).collection("assignments").doc(childId);
  }

  function sharedRecordRef(householdId, childId) {
    return state.db
      .collection("households").doc(householdId)
      .collection("children").doc(childId)
      .collection("records").doc(RECORD_ID);
  }

  function assertReady() {
    if (!state.available || !state.auth || !state.db) {
      throw new Error("Firebase is not initialized.");
    }
  }

  window.WeaknessQuizCloud = {
    init,
    initParentSession,
    onAuthStateChanged,
    signInWithGoogle,
    signInParentWithGoogle,
    ensureAnonymousAuth,
    signOut,
    findHousehold,
    createHousehold,
    createChildPairing,
    claimChildPairingFromLocation,
    getPrivateRecord,
    getRecord,
    saveRecord,
    getAccountRole,
    getLearnerRecordSources,
    saveLearnerRecord,
    claimLearnerRecord,
    getParentLearnerRecord,
    getFamilyDashboardRecords,
    challengeAnsweredTotal
  };
})();
