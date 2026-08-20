#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT })
  .toString("utf8")
  .split("\0")
  .filter(Boolean);
const violations = [];

for (const relative of tracked) {
  const absolute = path.join(ROOT, relative);
  const buffer = fs.readFileSync(absolute);
  if (buffer.includes(0)) continue;
  const content = buffer.toString("utf8");
  if (/[a-z0-9._%+-]+@gmail\.com/i.test(content)) violations.push(relative);
}

if (violations.length) throw new Error(`public source contains a hard-coded Gmail address: ${[...new Set(violations)].join(", ")}`);

const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const family = fs.readFileSync(path.join(ROOT, "family-dashboard.js"), "utf8");
if (!app.includes('{ id: "child-1", name: "長男" }') || !app.includes('fallback.id === "child-1"')) {
  throw new Error("the eldest-child alias is not locked in the learner app");
}
if (!family.includes('child.id === "child-1"') || !family.includes('name: "長男"')) {
  throw new Error("the eldest-child alias is not locked in the family dashboard");
}

console.log(JSON.stringify({ alias: "長男", hardCodedGmailAddresses: 0, status: "PASS" }, null, 2));
