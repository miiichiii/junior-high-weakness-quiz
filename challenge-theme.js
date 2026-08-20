(function () {
  "use strict";

  const THEME_KEY = "weaknessQuiz:challengeTheme";
  const SCALE_KEY = "weaknessQuiz:challengeFontScale";
  const DEFAULT_THEME = "aurora";
  const DEFAULT_SCALE = "1";
  const THEMES = [
    { id: "aurora", label: "オーロラ", swatch: "linear-gradient(135deg,#78e6d0,#8da8ff 52%,#ffb6d5)" },
    { id: "liquid", label: "ガラス", swatch: "linear-gradient(135deg,#c9f4ff,#f6d7ff 50%,#fff4bd)" },
    { id: "blue", label: "ブルー", swatch: "linear-gradient(135deg,#d9efff,#75a9ff)" },
    { id: "night", label: "夜空", swatch: "linear-gradient(135deg,#101a38,#523d91 62%,#ee88ba)" },
    { id: "paper", label: "ノート", swatch: "linear-gradient(135deg,#fffdf3,#eadfbe)" }
  ];
  const SCALES = [
    { id: "1", label: "A", title: "標準サイズ" },
    { id: "1.12", label: "A+", title: "大きめ" },
    { id: "1.24", label: "A++", title: "さらに大きく" }
  ];

  function readStorage(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_error) {
      // 保存できない環境でも、その場の切替は続ける。
    }
  }

  function currentTheme() {
    const stored = readStorage(THEME_KEY, DEFAULT_THEME);
    return THEMES.some((theme) => theme.id === stored) ? stored : DEFAULT_THEME;
  }

  function currentScale() {
    const stored = readStorage(SCALE_KEY, DEFAULT_SCALE);
    return SCALES.some((scale) => scale.id === stored) ? stored : DEFAULT_SCALE;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-challenge-theme", theme);
  }

  function applyScale(scale) {
    document.documentElement.style.setProperty("--challenge-font-scale", scale);
  }

  applyTheme(currentTheme());
  applyScale(currentScale());

  function makeText(tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    return element;
  }

  function setPressed(row, selector, dataKey, activeId) {
    row.querySelectorAll(selector).forEach((button) => {
      const active = button.dataset[dataKey] === activeId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function buildSwitcher() {
    if (document.querySelector(".challenge-theme-switcher")) return;

    const wrap = document.createElement("div");
    wrap.className = "challenge-theme-switcher";
    wrap.setAttribute("aria-label", "テーマと文字サイズ");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "challenge-theme-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "表示テーマを開く");
    const icon = makeText("span", "challenge-theme-toggle-icon", "🎨");
    icon.setAttribute("aria-hidden", "true");
    toggle.append(icon, makeText("span", "challenge-theme-toggle-label", "テーマ"));

    const panel = document.createElement("div");
    panel.className = "challenge-theme-panel";
    panel.hidden = true;

    panel.appendChild(makeText("strong", "challenge-theme-title", "好きな世界を選ぶ"));
    panel.appendChild(makeText("p", "challenge-theme-note", "色を変えても学習記録はそのままです。"));

    const themeRow = document.createElement("div");
    themeRow.className = "challenge-theme-grid";
    const activeTheme = currentTheme();
    THEMES.forEach((theme) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `challenge-theme-choice${theme.id === activeTheme ? " is-active" : ""}`;
      button.dataset.theme = theme.id;
      button.setAttribute("aria-pressed", String(theme.id === activeTheme));
      button.setAttribute("aria-label", `${theme.label}テーマ`);
      const swatch = document.createElement("span");
      swatch.className = "challenge-theme-swatch";
      swatch.style.background = theme.swatch;
      button.append(swatch, makeText("span", "challenge-theme-choice-label", theme.label));
      button.addEventListener("click", () => {
        applyTheme(theme.id);
        writeStorage(THEME_KEY, theme.id);
        setPressed(themeRow, ".challenge-theme-choice", "theme", theme.id);
      });
      themeRow.appendChild(button);
    });
    panel.appendChild(themeRow);

    panel.appendChild(makeText("span", "challenge-theme-subtitle", "文字サイズ"));
    const scaleRow = document.createElement("div");
    scaleRow.className = "challenge-scale-row";
    const activeScale = currentScale();
    SCALES.forEach((scale) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `challenge-scale-choice${scale.id === activeScale ? " is-active" : ""}`;
      button.dataset.scale = scale.id;
      button.title = scale.title;
      button.textContent = scale.label;
      button.setAttribute("aria-pressed", String(scale.id === activeScale));
      button.addEventListener("click", () => {
        applyScale(scale.id);
        writeStorage(SCALE_KEY, scale.id);
        setPressed(scaleRow, ".challenge-scale-choice", "scale", scale.id);
      });
      scaleRow.appendChild(button);
    });
    panel.appendChild(scaleRow);

    function setOpen(open) {
      panel.hidden = !open;
      wrap.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "表示テーマを閉じる" : "表示テーマを開く");
    }

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    wrap.append(toggle, panel);
    document.body.appendChild(wrap);
  }

  window.challengeTheme = {
    getTheme: currentTheme,
    getScale: currentScale,
    applyTheme,
    applyScale
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildSwitcher);
  } else {
    buildSwitcher();
  }
})();
