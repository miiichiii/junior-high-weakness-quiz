#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const portal = read("challenge.html");
const portalScript = read("challenge-portal.js");
const portalStyles = read("challenge-portal.css");
const themeScript = read("challenge-theme.js");
const themeStyles = read("challenge-theme.css");
const index = read("index.html");
const app = read("app.js");
const firebaseSync = read("firebase-sync.js");
const firestoreRules = read("firestore.rules");
const parentSource = read("parent-dashboard.html");
const familySource = read("family-dashboard.html");
const publicOrigin = read("public-origin.js");

["portalToolbar", "portalBack", "portalToolbarTitle", "portalAppGrid", "portalStats", "portalCloudButton", "portalCloudLabel", "portalParentLink", "portalShare", "portalShareForm", "portalPartnerEmail"].forEach((id) => {
  assert(portal.includes(`id="${id}"`), `portal is missing ${id}`);
});

for (const unwanted of ["Challenge Base", "長男の受験クエスト", "ほかの学習へ", "CHOOSE A FIELD", "何を勉強する？", "まず社会か理科を選ぶ"]) {
  assert(!portal.includes(unwanted), `portal still includes unwanted copy: ${unwanted}`);
}
assert(!portal.includes("portal-hero") && !portal.includes("portal-stat-grid") && !portal.includes("portal-lower-grid"), "dashboard cards must not appear in the launcher");
assert(portal.includes("challenge-theme.js?v=20260812-anonymous-cloud-v1"), "portal theme script cache key is stale");
assert(portal.includes("challenge-portal.js?v=20260820-eldest-alias-v1"), "portal script cache key is stale");
assert(portal.includes("challenge-portal.css?v=20260815-shared-record-v2"), "portal style cache key is stale");
assert(portal.includes('href="family-dashboard.html"'), "family management page is not linked from Challenge Base");
assert(portal.includes("firebase-auth-compat.js") && portal.includes("firebase-firestore-compat.js") && portal.includes("firebase-sync.js?v=20260820-google-login-recovery-v1"), "portal Firebase login scripts are missing");
assert(portal.includes("public-origin.js?v=20260820-family-admin-v1") && parentSource.includes("public-origin.js?v=20260820-family-admin-v1") && familySource.includes("public-origin.js?v=20260820-family-admin-v1"), "local-file redirect is missing");
assert(publicOrigin.includes('window.location.protocol !== "file:"') && publicOrigin.includes("miiichiii.github.io/junior-high-weakness-quiz"), "local-file redirect target is missing");
assert(!/<svg\b/i.test(portal), "portal must not embed decorative SVG artwork");

assert(portalScript.includes('id: "challenge-social-geography"'), "geography course is missing");
assert(portalScript.includes('id: "challenge-social-history"'), "history course is missing");
assert(portalScript.includes('id: "challenge-social-civics"'), "civics course is missing");
assert(portalScript.includes('id: "challenge-science-year1"'), "first-year science course is missing");
assert(portalScript.includes('id: "challenge-science-year2"'), "second-year science course is missing");
assert(portalScript.includes('{ id: "social", label: "社会"') && portalScript.includes('{ id: "science", label: "理科"') && portalScript.includes('{ id: "stats", label: "きろく"') && !portalScript.includes('{ id: "auth", label: "Google"'), "root app icons are wrong");
assert(portalScript.includes("renderCategories()") && portalScript.includes("renderCourses(category.id)") && portalScript.includes("renderUnits(course.id)"), "progressive app navigation is missing");
assert(portalScript.includes("renderStats()") && portalScript.includes("portal-metric-grid") && portalScript.includes("portal-progress-list"), "statistics view is missing");
assert(portalScript.includes("signInWithGoogle") && portalScript.includes("createHousehold") && portalScript.includes("syncCloudRecord") && portalScript.includes("claimLearner"), "Google login or shared sync flow is missing");
assert(portalScript.includes("ensureAnonymousAuth") && portalScript.includes("匿名保存") && portalScript.includes("user.isAnonymous"), "anonymous cloud save flow is missing");
assert(portalScript.includes("firstCorrect") && portalScript.includes("currentStreak(daily)") && portalScript.includes("course.attempted / course.total"), "statistics calculations are incomplete");
assert(portalScript.includes('url.searchParams.set("view", "quiz")') && portalScript.includes('kind: "unit"'), "unit apps must open the focused quiz page");
assert(portalScript.includes('label: "まちがい"') && portalScript.includes("renderReviewUnits(categoryId)"), "social/science mistake sections are missing");
assert(portalScript.includes("unitReviewSummary(course, unitId)") && portalScript.includes("record?.needsReview"), "mistake units are not based on saved review records");
assert(portalScript.includes('url.searchParams.set("review", "1")') && portalScript.includes('url.searchParams.set("reviewCategory", course.category)'), "mistake unit route is incomplete");
assert(portalScript.includes("packFirstAttemptRecorded") && portalScript.includes("packMastered"), "progress markers are not based on pack records");
assert(portalStyles.includes(".portal-app-grid.is-root") && portalStyles.includes("grid-template-columns: repeat(3") && portalStyles.includes(".portal-app-grid.is-units"), "app grid styles are missing");
assert(portalStyles.includes(".portal-app-icon") && portalStyles.includes(".portal-app-status"), "equal app icons or progress marks are missing");
assert(portalStyles.includes(".portal-app-review .portal-app-icon") && portalStyles.includes(".portal-app-count"), "mistake app styles or counts are missing");
assert(portalStyles.includes(".portal-metric-grid") && portalStyles.includes(".portal-progress-row"), "statistics styles are missing");
assert(portalStyles.includes(".portal-cloud-button") && portalStyles.includes(".portal-share-dialog") && portalStyles.includes(".portal-account") && portalStyles.includes(".portal-account-totals"), "cloud account styles are missing");
assert(portalStyles.includes(".portal-parent-button"), "parent viewer button style is missing");
assert(firebaseSync.includes("findHousehold") && firebaseSync.includes("createHousehold") && firebaseSync.includes("sharedRecordRef"), "shared household storage is missing");
assert(firestoreRules.includes("householdMember") && firestoreRules.includes("match /households/{householdId}"), "shared household rules are missing");
assert(!portalScript.includes("@gmail.com") && !firestoreRules.includes("@gmail.com"), "private account emails must not be embedded in public source");
assert(portalStyles.includes(".challenge-theme-toggle-label") && portalStyles.includes("display: none"), "portal theme control is not reduced to an icon");

for (const theme of ["aurora", "liquid", "blue", "night", "paper"]) {
  assert(themeScript.includes(`id: "${theme}"`), `theme ${theme} is missing from the switcher`);
  if (theme !== "aurora") assert(themeStyles.includes(`data-challenge-theme="${theme}"`), `theme ${theme} has no styles`);
}
assert(themeScript.includes("weaknessQuiz:challengeTheme"), "theme preference is not persisted");
assert(themeScript.includes("weaknessQuiz:challengeFontScale"), "font-size preference is not persisted");
assert(themeStyles.includes("challenge-theme-switcher") && themeStyles.includes("challenge-mode"), "theme styles are not shared with quiz pages");
assert(portalStyles.includes("@media (max-width: 390px)"), "iPhone portal layout is missing");
assert(portalStyles.includes("prefers-reduced-motion"), "reduced-motion support is missing");

assert(index.includes("challenge-theme.css?v=20260804-quiz-focus-v1"), "quiz page does not load shared theme styles");
assert(index.includes("challenge-theme.js?v=20260804-quiz-focus-v1"), "quiz page does not load the theme switcher");
assert(index.includes("app.js?v=20260820-eldest-alias-v1") && index.includes("styles.css?v=20260820-eldest-alias-v1"), "quiz cache keys are stale");
for (const id of ["quizOnlyHeader", "quizOnlyHome", "quizOnlyUnitNumber", "quizOnlyUnitTitle", "quizOnlyTier", "quizOnlyRetry", "quizOnlyAdvance"]) {
  assert(index.includes(`id="${id}"`), `focused quiz is missing ${id}`);
}
assert(index.includes('params.get("view") === "quiz"') && themeStyles.includes("html.quiz-only-mode .pack-hero"), "focused quiz route does not hide the course selector");
assert(app.includes("unitNumberFromId(question.unitId)") && app.includes("単元${visibleUnitNumber}"), "question card does not show the unit number");
assert(app.includes("packReviewAllTiers") && app.includes("currentPackQuestions().filter") && app.includes("PACK_REVIEW_CATEGORY_ROUTE_PARAM"), "all-tier mistake review route is missing");
assert(app.includes("ensureAnonymousAuth") && app.includes("匿名クラウド保存") && app.includes("state.cloudUser?.isAnonymous"), "quiz anonymous cloud save flow is missing");
assert(!index.includes('id="mistakeType"') && !index.includes('class="mistake-box"'), "manual mistake-type control still exists");
assert(!app.includes("els.mistakeType") && !app.includes("mistakeType.addEventListener"), "manual mistake-type behavior still exists");
assert(app.includes('id: "challenge-portal"') && app.includes('href: "challenge.html"'), "portal is not linked from the learner page");
assert(app.includes("← Challenge Base") && app.includes("challenge.html?child="), "Challenge quiz does not return to the portal");
assert(firebaseSync.includes("signInAnonymously") && firebaseSync.includes("ensureAnonymousAuth"), "Firebase anonymous authentication is missing");
assert(firebaseSync.includes("getLearnerRecordSources") && firebaseSync.includes("saveLearnerRecord") && firebaseSync.includes("claimLearnerRecord") && firebaseSync.includes("getParentLearnerRecord") && firebaseSync.includes("learnerEmail") && firebaseSync.includes("learnerAnsweredTotal"), "per-account learner record migration is missing");
assert(firebaseSync.includes("getFamilyDashboardRecords") && familySource.includes("family-dashboard.js?v=20260820-eldest-alias-v1"), "family-wide management data path is missing");
assert(portalScript.includes("sources.privateRecord?.progress") && portalScript.includes("sources.sharedRecord?.learnerProgress"), "portal does not merge Shoutaro's private Google record into family sharing");
assert(portalScript.includes('cloudState.role === "unassigned" && !cloudState.householdOwner') && portalScript.includes("syncCloudRecord({ claimLearner: true })"), "Shoutaro's existing Google record is not automatically claimed on his learner account");
assert(app.includes('sources.role === "unassigned"') && app.includes("!sources.householdOwner") && app.includes("autoClaimLearner"), "quiz page does not automatically share Shoutaro's Google record");
assert(app.includes("isParentChallengeTrial") && app.includes("learnerPayloadFromSharedRecord") && app.includes("claimLearner") && app.includes("verification-failed"), "parent trial isolation or learner record loading is missing");
assert(parentSource.includes("challenge-parent-view.js?v=20260814-challenge-parent-v1") && parentSource.includes("ChallengeParentView?.summary") && parentSource.includes("getFamilyDashboardRecords"), "parent viewer does not calculate Challenge progress from the verified family record");
assert(parentSource.includes("initParentSession") && parentSource.includes("signInParentWithGoogle") && !parentSource.includes("signInWithGoogle();"), "parent drilldown does not preserve the learner authentication session");
assert(parentSource.includes("data.learnerProgress") && parentSource.includes("保存済みの記録を自動で家族共有へ移します") && parentSource.includes("parent-sync-details"), "parent viewer still mistakes the parent's trial data for Shoutaro's record");

console.log(JSON.stringify({
  portal: "icon launcher",
  courses: 5,
  activeQuestions: 1020,
  themes: 5,
  manualMistakeInput: false,
  status: "PASS"
}, null, 2));
