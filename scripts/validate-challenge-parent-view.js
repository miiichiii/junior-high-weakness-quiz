#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "challenge-parent-view.js"), "utf8");
const context = { window: {}, Date, console };
vm.createContext(context);
vm.runInContext(source, context, { filename: "challenge-parent-view.js" });

const view = context.window.ChallengeParentView;
if (!view) throw new Error("Challenge parent view API is missing");

const now = new Date();
const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const iso = now.toISOString();
const progress = {
  "challenge-geo-01-001": {
    packFirstAttemptRecorded: true,
    packFirstAttemptCorrect: true,
    packAttempts: 1,
    packMastered: true,
    lastAnsweredAt: iso
  },
  "challenge-geo-01-002": {
    packFirstAttemptRecorded: true,
    packFirstAttemptCorrect: false,
    packAttempts: 1,
    needsReview: true,
    lastAnsweredAt: iso
  },
  "challenge-sci1-01-001": {
    packFirstAttemptRecorded: true,
    packFirstAttemptCorrect: false,
    packAttempts: 2,
    lastAnsweredAt: iso
  }
};
const stats = {
  packs: {
    "challenge-social-geography": { answered: 3, lastAnsweredAt: iso, daily: { [day]: { answered: 3 } } },
    "challenge-science-year1": { answered: 2, lastAnsweredAt: iso, daily: { [day]: { answered: 2 } } }
  }
};

const summary = view.summary(progress, stats);
if (summary.total !== 1020) throw new Error(`wrong total: ${summary.total}`);
if (summary.attempted !== 3) throw new Error(`wrong attempted count: ${summary.attempted}`);
if (summary.graded !== 3 || summary.firstCorrect !== 1) throw new Error("wrong first-attempt accuracy inputs");
if (summary.review !== 1 || summary.mastered !== 1) throw new Error("wrong review/mastery counts");
if (summary.totalAttempts !== 5 || summary.today !== 5) throw new Error("wrong attempt or daily totals");
if (summary.courses.length !== 5 || summary.courses[0].units.length !== 12) throw new Error("course/unit structure is incomplete");

const markup = view.markup(progress, stats, "child-1");
for (const expected of ["社会・理科 1020問", "地理", "歴史", "公民", "理科1年", "理科2年", "単元1", "復習 1"]) {
  if (!markup.includes(expected)) throw new Error(`parent markup is missing: ${expected}`);
}
if (view.markup(progress, stats, "child-2") !== "") throw new Error("Challenge viewer must be limited to child-1");

console.log(JSON.stringify({ total: summary.total, courses: summary.courses.length, status: "PASS" }, null, 2));
