(function () {
  "use strict";

  if (window.location.protocol !== "file:") return;

  const supportedPages = new Set(["challenge.html", "parent-dashboard.html", "family-dashboard.html"]);
  const currentPage = window.location.pathname.split("/").pop() || "challenge.html";
  if (!supportedPages.has(currentPage)) return;

  const destination = new URL(`https://miiichiii.github.io/junior-high-weakness-quiz/${currentPage}`);
  destination.search = window.location.search;
  destination.hash = window.location.hash;
  window.location.replace(destination.toString());
})();
