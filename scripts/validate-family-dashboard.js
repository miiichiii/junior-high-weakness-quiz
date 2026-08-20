#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const context = { window: {}, Date, console };
vm.createContext(context);
for (const file of ["challenge-parent-view.js", "family-dashboard-model.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
}

const model = context.window.FamilyDashboardModel;
if (!model || typeof model.buildChildSummary !== "function") {
  throw new Error("FamilyDashboardModel.buildChildSummary is missing");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function localIso(year, month, day, hour = 12) {
  return new Date(year, month - 1, day, hour, 0, 0, 0).toISOString();
}

const now = new Date(2026, 7, 20, 12, 0, 0, 0);
const expectedDays = ["2026-08-14", "2026-08-15", "2026-08-16", "2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20"];

const child1Record = {
  child: { id: "child-1", name: "長男" },
  progress: {
    "challenge-geo-01-001": {
      packFirstAttemptRecorded: true,
      packFirstAttemptCorrect: true,
      packAttempts: 2,
      lastAnsweredAt: localIso(2026, 8, 20, 10)
    },
    "challenge-geo-01-002": {
      packFirstAttemptRecorded: true,
      packFirstAttemptCorrect: false,
      packAttempts: 1,
      needsReview: true,
      lastAnsweredAt: localIso(2026, 8, 18, 16)
    },
    "challenge-sci1-01-001": {
      packFirstAttemptRecorded: true,
      packFirstAttemptCorrect: true,
      packAttempts: 1,
      packMastered: true,
      lastAnsweredAt: localIso(2026, 8, 14, 9)
    }
  },
  stats: {
    packs: {
      "challenge-social-geography": {
        answered: 3,
        correct: 1,
        lastAnsweredAt: localIso(2026, 8, 20, 10),
        daily: {
          "2026-08-18": { answered: 1 },
          "2026-08-20": { answered: 2 }
        }
      },
      "challenge-science-year1": {
        answered: 1,
        correct: 1,
        lastAnsweredAt: localIso(2026, 8, 14, 9),
        daily: { "2026-08-14": { answered: 1 } }
      }
    }
  }
};
const child1Before = JSON.stringify(child1Record);
const child1 = model.buildChildSummary("child-1", child1Record, now);
assert(JSON.stringify(child1Record) === child1Before, "child-1 input was mutated");
assertEqual([child1.today, child1.week, child1.total, child1.accuracy, child1.review], [2, 4, 4, 50, 1], "child-1 headline metrics");
assert(child1.lastLearningAt === localIso(2026, 8, 20, 10), "child-1 latest learning is wrong");
assert(child1.modules.length === 5, "child-1 must have five Challenge modules");
assertEqual(
  child1.modules[0],
  {
    id: "challenge-social-geography",
    label: "地理",
    emoji: "🌏",
    progressLabel: "2/180問に着手",
    total: 3,
    accuracy: 33,
    review: 1,
    lastLearningAt: localIso(2026, 8, 20, 10)
  },
  "child-1 geography module"
);
assertEqual(child1.daily7.map((row) => row.date), expectedDays, "child-1 injected dates");
assertEqual(child1.daily7.map((row) => row.answered), [1, 0, 0, 0, 1, 0, 2], "child-1 daily values");

const child1AllLearning = JSON.parse(JSON.stringify(child1Record));
child1AllLearning.progress["science-ion-001"] = {
  packFirstAttemptRecorded: true,
  packFirstAttemptCorrect: false,
  packAttempts: 3,
  needsReview: true,
  lastAnsweredAt: localIso(2026, 8, 20, 11)
};
child1AllLearning.progress["normal-jpn-001"] = {
  correct: 1,
  wrong: 1,
  needsReview: true,
  lastAnsweredAt: localIso(2026, 8, 19, 11)
};
child1AllLearning.stats.packs["science-ion-drill"] = {
  answered: 3,
  correct: 2,
  lastAnsweredAt: localIso(2026, 8, 20, 11),
  daily: { "2026-08-20": { answered: 3, correct: 2 } }
};
child1AllLearning.stats.daily = { "2026-08-19": { answered: 2, correct: 1 } };
const child1All = model.buildChildSummary("child-1", child1AllLearning, now);
assertEqual([child1All.today, child1All.week, child1All.total, child1All.accuracy, child1All.review], [5, 9, 9, 56, 3], "child-1 all-module headline metrics");
assert(child1All.modules.length === 7, "child-1 must append active non-Challenge and normal modules");
assert(child1All.modules.some((row) => row.id === "science-ion-drill") && child1All.modules.some((row) => row.id === "regular-entrance-practice"), "child-1 extra modules are missing");

const child2Record = {
  child: { id: "child-2", name: "子供2" },
  progress: {
    "eiken4-001": { packAttempts: 2, packCorrect: 1, lastAnsweredAt: localIso(2026, 8, 20, 9) },
    "eiken4-002": { packAttempts: 1, packCorrect: 0, needsReview: true, lastAnsweredAt: localIso(2026, 8, 17, 9) }
  },
  stats: {
    packs: {
      "eiken-grade4": {
        answered: 3,
        correct: 1,
        lastAnsweredAt: localIso(2026, 8, 20, 9),
        daily: {
          "2026-08-17": { answered: 1, correct: 0 },
          "2026-08-20": { answered: 2, correct: 1 }
        }
      }
    }
  },
  eikenVocabulary: {
    updatedAt: localIso(2026, 8, 20, 11),
    entries: {
      v1: { attempts: 2, correct: 1, wrong: 1, reviewDueAt: "2026-08-20", lastSeenAt: localIso(2026, 8, 20, 11) },
      v2: { attempts: 1, correct: 1, wrong: 0, masteredAt: localIso(2026, 8, 19, 10), lastSeenAt: localIso(2026, 8, 19, 10) }
    },
    daily: {
      "2026-08-19": { attempts: 1, correct: 1 },
      "2026-08-20": { attempts: 2, correct: 1 }
    }
  },
  eikenExam: {
    updatedAt: localIso(2026, 8, 18, 14),
    forms: {
      "e4m-1": { attempts: [{ attemptId: "a1", completedAt: localIso(2026, 8, 18, 14), totalScore: 50 }] },
      "e4m-2": { attempts: [{ attemptId: "a2", completedAt: localIso(2026, 8, 10, 14), totalScore: 40 }] }
    }
  }
};
const child2Before = JSON.stringify(child2Record);
const child2 = model.buildChildSummary("child-2", child2Record, now);
assert(JSON.stringify(child2Record) === child2Before, "child-2 input was mutated");
assertEqual([child2.today, child2.week, child2.total, child2.accuracy, child2.review], [4, 71, 136, 68, 2], "child-2 headline metrics");
assert(child2.modules.length === 3, "child-2 must have three EIKEN modules");
assertEqual(child2.modules.map((row) => row.total), [3, 3, 130], "child-2 module totals");
assertEqual(child2.modules.map((row) => row.progressLabel), ["2/100問に着手", "2/420語学習・1語習得", "2/3回完了"], "child-2 module progress");
assert(child2.modules[2].review === null, "exam review must stay null because no persistent review queue exists");
assertEqual(child2.daily7.map((row) => row.answered), [0, 0, 0, 1, 65, 1, 4], "child-2 daily values");

const child3Record = {
  child: { id: "child-3", name: "子供3" },
  stats: {
    daily: {
      "2026-08-16": { answered: 3, correct: 2 },
      "2026-08-20": { answered: 5, correct: 4 }
    }
  },
  kanji: {
    updatedAt: localIso(2026, 8, 20, 15),
    kanji: {
      "日": { attempts: 2, masteredAt: localIso(2026, 8, 19, 10), reviewDueAt: "2026-08-20", lastClearDay: "2026-08-19", lastSeenAt: localIso(2026, 8, 20, 15) },
      "月": { attempts: 1, reviewDueAt: "2026-08-21", lastSeenAt: localIso(2026, 8, 16, 10) }
    },
    daily: {
      "2026-08-16": { attempts: 1, memoryClears: 1 },
      "2026-08-20": { attempts: 2, memoryClears: 1 }
    }
  },
  math4: {
    updatedAt: localIso(2026, 8, 19, 18),
    facts: {
      "2x1": { attempts: 2, correct: 1, reviewDueAt: "2026-08-20", lastClearDay: "2026-08-19", lastSeenAt: localIso(2026, 8, 19, 18) },
      "2x2": { attempts: 1, correct: 1, masteredAt: localIso(2026, 8, 18, 18), lastSeenAt: localIso(2026, 8, 18, 18) }
    },
    levels: {
      mult1: { solved: 2, clean: 1, lastSessionDay: "2026-08-20" }
    },
    daily: {
      "2026-08-16": { kukuNew: 1, kukuClears: 1, writtenSolved: 1, writtenClean: 1 },
      "2026-08-20": { kukuNew: 1, kukuClears: 2, writtenSolved: 1, writtenClean: 1 }
    }
  }
};
const child3Before = JSON.stringify(child3Record);
const child3 = model.buildChildSummary("child-3", child3Record, now);
assert(JSON.stringify(child3Record) === child3Before, "child-3 input was mutated");
assertEqual([child3.today, child3.week, child3.total, child3.accuracy, child3.review], [5, 8, 8, 75, 2], "child-3 headline metrics");
assert(child3.modules.length === 2, "child-3 must have kanji and math modules");
assertEqual(child3.modules.map((row) => row.total), [3, 5], "child-3 module totals");
assertEqual(child3.modules.map((row) => row.progressLabel), ["2/76字学習・1字マスター", "九九1/81・ひっ算2問"], "child-3 module progress");
assertEqual(child3.daily7.map((row) => row.answered), [0, 0, 3, 0, 0, 0, 5], "child-3 daily values");

for (const childId of ["child-1", "child-2", "child-3"]) {
  const empty = model.buildChildSummary(childId, null, now);
  assertEqual([empty.today, empty.week, empty.total, empty.accuracy, empty.review, empty.lastLearningAt], [null, null, null, null, null, null], `${childId} missing metrics`);
  assert(empty.modules.every((row) => row.progressLabel === "--" && row.total === null && row.review === null), `${childId} missing modules must not invent zeroes`);
  assert(empty.daily7.every((row) => row.answered === null), `${childId} missing daily values must be null`);
}

const incompleteChild3 = model.buildChildSummary("child-3", {
  math4: { facts: { "2x1": { attempts: 1, correct: 0 } }, levels: {}, daily: {} }
}, now);
assert(incompleteChild3.today === null && incompleteChild3.week === null, "child-3 daily totals must not be fabricated without stats");

assertEqual(
  Object.keys(child1),
  ["name", "grade", "today", "week", "total", "accuracy", "review", "lastLearningAt", "daily7", "modules"],
  "public child summary shape"
);
assertEqual(
  Object.keys(child1.modules[0]),
  ["id", "label", "emoji", "progressLabel", "total", "accuracy", "review", "lastLearningAt"],
  "public module shape"
);

const html = fs.readFileSync(path.join(ROOT, "family-dashboard.html"), "utf8");
const app = fs.readFileSync(path.join(ROOT, "family-dashboard.js"), "utf8");
const styles = fs.readFileSync(path.join(ROOT, "family-dashboard.css"), "utf8");
const portal = fs.readFileSync(path.join(ROOT, "challenge.html"), "utf8");
const learnerApp = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const cloud = fs.readFileSync(path.join(ROOT, "firebase-sync.js"), "utf8");
const redirect = fs.readFileSync(path.join(ROOT, "public-origin.js"), "utf8");
for (const id of ["viewerAccount", "refreshButton", "signOutButton", "signInButton", "dashboardContent", "familyOverview", "childTabs", "childDetail"]) {
  assert(html.includes(`id="${id}"`), `family dashboard is missing ${id}`);
}
assert(html.includes("family-dashboard-model.js?v=20260820-eldest-alias-v1") && html.includes("family-dashboard.js?v=20260820-eldest-alias-v1"), "family dashboard cache wiring is stale");
assert(app.includes('id: "child-1"') && app.includes('id: "child-2"') && app.includes('id: "child-3"'), "family dashboard must always list all three children");
assert(app.includes("getFamilyDashboardRecords") && !app.includes("getRecord("), "family dashboard must use only the shared family-record API");
assert(app.includes("未連携") && app.includes("読込失敗") && app.includes("0問という意味ではありません"), "zero, unlinked, and read errors are not distinguished");
assert(app.includes("createChildPairing") && app.includes("Googleログインは不要"), "accountless child-device pairing is missing from the manager");
assert(app.includes("module.total") && app.includes("成功率") && !styles.includes(".family-module-stat:nth-of-type"), "module totals, success rate, or mobile detail visibility is missing");
assert(cloud.includes("Promise.allSettled") && cloud.includes("getFamilyDashboardRecords") && cloud.includes("claimChildPairingFromLocation"), "family-wide shared reads or pairing API are missing");
assert(portal.includes('href="family-dashboard.html"') && learnerApp.includes('parentViewLink.href = "family-dashboard.html"'), "parent navigation still scopes the view to one child");
assert(redirect.includes('"family-dashboard.html"'), "local family manager is not redirected to the public HTTPS page");
assert(styles.includes("@media (max-width: 390px)") && styles.includes("min-height: 44px"), "iPhone sizing or tap targets are missing");

console.log(JSON.stringify({
  api: "FamilyDashboardModel.buildChildSummary",
  children: 3,
  injectedToday: "2026-08-20",
  missingData: "null",
  status: "PASS"
}, null, 2));
