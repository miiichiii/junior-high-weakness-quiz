(function () {
  "use strict";

  const CHILDREN = [
    { id: "child-1", name: "長男", grade: "中3", emoji: "🚀" },
    { id: "child-2", name: "子供2", grade: "中2", emoji: "🇬🇧" },
    { id: "child-3", name: "子供3", grade: "小4", emoji: "✍️" }
  ];
  const state = {
    auth: null,
    user: null,
    selectedChildId: "child-1",
    rows: [],
    summaries: new Map(),
    householdId: "",
    loading: false
  };
  const els = {
    account: document.getElementById("viewerAccount"),
    status: document.getElementById("dashboardStatus"),
    signIn: document.getElementById("signInButton"),
    signOut: document.getElementById("signOutButton"),
    refresh: document.getElementById("refreshButton"),
    content: document.getElementById("dashboardContent"),
    overview: document.getElementById("familyOverview"),
    tabs: document.getElementById("childTabs"),
    detail: document.getElementById("childDetail"),
    loadedAt: document.getElementById("loadedAt")
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[char]));
  }

  function number(value) {
    return new Intl.NumberFormat("ja-JP").format(Math.max(0, Number(value) || 0));
  }

  function formatDateTime(value) {
    if (!value) return "未着手";
    const time = typeof value === "number" ? value : Date.parse(value);
    if (!Number.isFinite(time) || time <= 0) return "未着手";
    return new Date(time).toLocaleString("ja-JP", {
      month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  function setStatus(text, mode) {
    els.status.textContent = text;
    els.status.dataset.state = mode || "idle";
  }

  function clearDashboard() {
    state.rows = [];
    state.householdId = "";
    state.summaries.clear();
    els.overview.innerHTML = "";
    els.tabs.innerHTML = "";
    els.detail.innerHTML = "";
    els.loadedAt.textContent = "";
    els.content.classList.add("hidden");
  }

  function statusInfo(status) {
    if (status === "ready") return { label: "共有済み", tone: "ready" };
    if (status === "error") return { label: "読込失敗", tone: "error" };
    if (status === "household-missing") return { label: "家族共有なし", tone: "unlinked" };
    if (status === "learner-unregistered") return { label: "本人未登録", tone: "unlinked" };
    if (status === "legacy-unverified") return { label: "本人未確認", tone: "unlinked" };
    return { label: "未連携", tone: "unlinked" };
  }

  function normalizedName(child, row, summary) {
    if (child.id === "child-1") return child.name;
    return summary?.name || row?.record?.child?.name || row?.record?.learnerChild?.name || child.name;
  }

  function renderOverview() {
    const ready = state.rows.filter((row) => row.status === "ready");
    const summaries = ready.map((row) => state.summaries.get(row.childId)).filter(Boolean);
    const activeToday = summaries.filter((summary) => Number(summary.today) > 0).length;
    const today = summaries.reduce((sum, summary) => sum + (Number(summary.today) || 0), 0);
    const week = summaries.reduce((sum, summary) => sum + (Number(summary.week) || 0), 0);
    const review = summaries.reduce((sum, summary) => sum + (Number(summary.review) || 0), 0);
    els.overview.innerHTML = `
      <div class="family-overview-item"><span>今日やった子</span><strong>${activeToday}/${CHILDREN.length}人</strong></div>
      <div class="family-overview-item"><span>今日の記録</span><strong>${number(today)}回</strong></div>
      <div class="family-overview-item"><span>直近7日</span><strong>${number(week)}回</strong></div>
      <div class="family-overview-item"><span>復習待ち</span><strong>${number(review)}</strong></div>
    `;
  }

  function renderTabs() {
    els.tabs.innerHTML = CHILDREN.map((child) => {
      const row = state.rows.find((item) => item.childId === child.id) || { childId: child.id, status: "unlinked" };
      const summary = state.summaries.get(child.id);
      const info = statusInfo(row.status);
      const name = normalizedName(child, row, summary);
      const figures = row.status === "ready" && summary
        ? `<div class="family-child-tab-numbers">
            <span>今日<strong>${number(summary.today)}回</strong></span>
            <span>7日<strong>${number(summary.week)}回</strong></span>
          </div>`
        : `<div class="family-child-tab-numbers"><span>今日<strong>--</strong></span><span>7日<strong>--</strong></span></div>`;
      return `
        <button class="family-child-tab" type="button" role="tab"
          data-child-id="${escapeHtml(child.id)}" aria-selected="${state.selectedChildId === child.id}">
          <span class="family-child-tab-top">
            <span class="family-avatar" aria-hidden="true">${child.emoji}</span>
            <span><h3>${escapeHtml(name)}</h3><small>${escapeHtml(summary?.grade || child.grade)}</small></span>
          </span>
          ${figures}
          <span class="family-state" data-state="${info.tone}">${info.label}</span>
        </button>`;
    }).join("");
    els.tabs.querySelectorAll("[data-child-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedChildId = button.dataset.childId;
        renderTabs();
        renderDetail();
      });
    });
  }

  function emptyMessage(row, child) {
    if (row?.status === "error") {
      return {
        icon: "⚠️",
        title: "この子の記録を読み込めませんでした",
        text: "ほかの子の記録はそのまま確認できます。右上の更新ボタンでもう一度読み込んでください。"
      };
    }
    if (row?.status === "household-missing") {
      return {
        icon: "🔗",
        title: "家族共有がまだ設定されていません",
        text: "Challenge Baseで家族共有を設定すると、保護者のGoogleアカウントから同じ記録を確認できます。"
      };
    }
    if (row?.status === "learner-unregistered" && child.id === "child-1") {
      return {
        icon: "📲",
        title: "長男の記録はまだ本人登録されていません",
        text: "長男の学習端末で、長男のGoogleアカウントのまま公開版Challenge Baseを一度開いてください。保存済みの問題数を消さず、自動で家族共有へ移します。"
      };
    }
    if (row?.status === "legacy-unverified") {
      return {
        icon: "🪪",
        title: `${child.name}本人の記録か確認できません`,
        text: "以前の共有記録はありますが、保護者のお試しと区別できないため数字を表示していません。下のボタンで学習端末を一度つなぐと、本人の記録だけに切り替わります。"
      };
    }
    return {
      icon: "☁️",
      title: `${child.name}の共有記録はまだ届いていません`,
      text: "この表示は0問という意味ではありません。学習端末で、現在の家族共有に登録されているGoogleアカウントから同期を完了してください。"
    };
  }

  function renderEmptyDetail(row, child) {
    const message = emptyMessage(row, child);
    const canPair = Boolean(state.householdId && (["unlinked", "learner-unregistered", "legacy-unverified"].includes(row?.status)));
    els.detail.innerHTML = `
      <div class="family-detail-head">
        <div class="family-detail-name">
          <span class="family-avatar" aria-hidden="true">${child.emoji}</span>
          <div><h2>${escapeHtml(child.name)}</h2><p>${escapeHtml(child.grade)}</p></div>
        </div>
        <a class="family-detail-link" href="parent-dashboard.html?child=${encodeURIComponent(child.id)}">詳しい画面</a>
      </div>
      <div class="family-empty">
        <div><span class="family-empty-icon" aria-hidden="true">${message.icon}</span>
          <h3>${escapeHtml(message.title)}</h3><p>${escapeHtml(message.text)}</p>
          ${canPair ? `<button class="family-pair-button" id="createPairingButton" type="button">この子の端末をつなぐ</button>` : ""}
          <div class="family-pair-result hidden" id="pairingResult"></div>
        </div>
      </div>`;
    document.getElementById("createPairingButton")?.addEventListener("click", () => createPairing(child));
  }

  function accuracyLabel(value) {
    return value == null || !Number.isFinite(Number(value)) ? "--" : `${Math.round(Number(value))}%`;
  }

  function dailyBars(summary) {
    const values = Array.isArray(summary.daily7) ? summary.daily7 : [];
    const normalized = Array.from({ length: 7 }, (_, index) => {
      const entry = values[index];
      if (entry && typeof entry === "object") {
        const label = entry.label || (entry.date ? new Date(`${entry.date}T12:00:00`).toLocaleDateString("ja-JP", { weekday: "short" }).replace("曜日", "") : "");
        return { label, value: Number(entry.value ?? entry.count ?? entry.answered) || 0 };
      }
      return { label: "", value: Number(entry) || 0 };
    });
    const max = Math.max(1, ...normalized.map((entry) => entry.value));
    const weekdays = ["木", "金", "土", "日", "月", "火", "水"];
    return normalized.map((entry, index) => `
      <div class="family-bar-day">
        <b>${number(entry.value)}</b>
        <span class="family-bar-track"><span class="family-bar-fill" style="height:${entry.value ? Math.max(5, Math.round((entry.value / max) * 100)) : 0}%"></span></span>
        <span>${escapeHtml(entry.label || weekdays[index])}</span>
      </div>`).join("");
  }

  function moduleRows(modules) {
    if (!Array.isArray(modules) || !modules.length) return `<p class="family-footnote">この子の教科別集計はまだありません。</p>`;
    return modules.map((module) => `
      <article class="family-module">
        <div class="family-module-name"><b aria-hidden="true">${escapeHtml(module.emoji || "📘")}</b><strong>${escapeHtml(module.label || "学習")}</strong></div>
        <div class="family-module-stat"><span>累計</span><strong>${module.total == null ? "--" : `${number(module.total)}回`}</strong></div>
        <div class="family-module-stat"><span>進み具合</span><strong>${escapeHtml(module.progressLabel || "--")}</strong></div>
        <div class="family-module-stat"><span>成功率</span><strong>${accuracyLabel(module.accuracy)}</strong></div>
        <div class="family-module-stat"><span>復習</span><strong>${module.review == null ? "--" : number(module.review)}</strong></div>
      </article>`).join("");
  }

  function renderReadyDetail(row, child, summary) {
    const name = normalizedName(child, row, summary);
    els.detail.innerHTML = `
      <div class="family-detail-head">
        <div class="family-detail-name">
          <span class="family-avatar" aria-hidden="true">${child.emoji}</span>
          <div><h2>${escapeHtml(name)}</h2><p>${escapeHtml(summary.grade || child.grade)}・クラウド共有済み</p></div>
        </div>
        <a class="family-detail-link" href="parent-dashboard.html?child=${encodeURIComponent(child.id)}">単元まで詳しく見る</a>
      </div>
      <div class="family-metrics">
        <div class="family-metric"><span>今日</span><strong>${number(summary.today)}回</strong></div>
        <div class="family-metric"><span>直近7日</span><strong>${number(summary.week)}回</strong></div>
        <div class="family-metric"><span>累計</span><strong>${number(summary.total)}回</strong></div>
        <div class="family-metric"><span>最終学習</span><strong>${escapeHtml(formatDateTime(summary.lastLearningAt))}</strong></div>
        <div class="family-metric"><span>成功率</span><strong>${accuracyLabel(summary.accuracy)}</strong></div>
        <div class="family-metric"><span>復習待ち</span><strong>${number(summary.review)}</strong></div>
      </div>
      <section class="family-chart-block" aria-labelledby="weekChartHeading">
        <div class="family-chart-heading"><h3 id="weekChartHeading">7日間の記録</h3><span>最終学習 ${escapeHtml(formatDateTime(summary.lastLearningAt))}</span></div>
        <div class="family-bars" role="img" aria-label="直近7日間の学習回数">${dailyBars(summary)}</div>
      </section>
      <section class="family-modules" aria-labelledby="modulesHeading">
        <div class="family-modules-heading"><h3 id="modulesHeading">教科・教材</h3><span>0と未連携を区別しています</span></div>
        <div class="family-module-list">${moduleRows(summary.modules)}</div>
      </section>
      <div class="family-sync-meta">
        <span>最終学習 <strong>${escapeHtml(formatDateTime(summary.lastLearningAt))}</strong></span>
        <span>最終クラウド同期 <strong>${escapeHtml(formatDateTime(row.syncedAt || row.record?.syncedAtClient || row.record?.updatedAtClient))}</strong></span>
        ${row.learnerEmail
          ? `<span>保存元 <strong>${escapeHtml(row.learnerEmail)}</strong></span>`
          : row.record?.learnerUid ? `<span>保存元 <strong>アカウントなし端末</strong></span>` : ""}
      </div>`;
  }

  function renderDetail() {
    const child = CHILDREN.find((item) => item.id === state.selectedChildId) || CHILDREN[0];
    const row = state.rows.find((item) => item.childId === child.id) || { childId: child.id, status: "unlinked" };
    const summary = state.summaries.get(child.id);
    if (row.status !== "ready" || !summary) renderEmptyDetail(row, child);
    else renderReadyDetail(row, child, summary);
  }

  function renderDashboard(result) {
    state.householdId = result.householdId || "";
    state.rows = CHILDREN.map((child) => result.children.find((row) => row.childId === child.id)
      || { childId: child.id, status: result.status === "household-missing" ? "household-missing" : "unlinked", record: null });
    state.summaries.clear();
    state.rows.forEach((row) => {
      if (row.status !== "ready" || !row.record) return;
      const summary = window.FamilyDashboardModel?.buildChildSummary(row.childId, row.record, new Date());
      if (summary) state.summaries.set(row.childId, summary);
    });
    const readyCount = state.rows.filter((row) => row.status === "ready").length;
    if (!state.rows.some((row) => row.childId === state.selectedChildId && row.status === "ready")) {
      state.selectedChildId = state.rows.find((row) => row.status === "ready")?.childId || "child-1";
    }
    renderOverview();
    renderTabs();
    renderDetail();
    els.content.classList.remove("hidden");
    els.loadedAt.textContent = `更新 ${new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
    const missingCount = CHILDREN.length - readyCount;
    setStatus(
      missingCount ? `${readyCount}/${CHILDREN.length}人の共有記録を確認・${missingCount}人は未連携です` : `${CHILDREN.length}人の共有記録を確認しました`,
      missingCount ? "idle" : "ready"
    );
  }

  async function copyText(value, button) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      button.textContent = "コピーしました";
    } catch (_error) {
      button.textContent = "コピーできませんでした";
    }
  }

  async function createPairing(child) {
    const button = document.getElementById("createPairingButton");
    const resultBox = document.getElementById("pairingResult");
    if (!button || !resultBox) return;
    button.disabled = true;
    button.textContent = "接続リンクを作成中…";
    try {
      const pairing = await window.WeaknessQuizCloud.createChildPairing(child.id);
      resultBox.classList.remove("hidden");
      resultBox.innerHTML = `
        <strong>このリンクを${escapeHtml(child.name)}の学習端末で一度だけ開いてください</strong>
        <p>Googleログインは不要です。開いた端末の今ある記録を消さずに家族へ接続します。リンクは7日間有効です。</p>
        <input type="text" value="${escapeHtml(pairing.url)}" readonly aria-label="子ども端末の接続リンク">
        <div class="family-pair-actions">
          <button type="button" id="copyPairingButton">リンクをコピー</button>
          ${typeof navigator.share === "function" ? `<button type="button" id="sharePairingButton">共有する</button>` : ""}
        </div>`;
      document.getElementById("copyPairingButton")?.addEventListener("click", (event) => copyText(pairing.url, event.currentTarget));
      document.getElementById("sharePairingButton")?.addEventListener("click", async () => {
        try {
          await navigator.share({ title: `${child.name}の学習記録を家族へ接続`, text: "このリンクを学習する端末で一度だけ開いてください。", url: pairing.url });
        } catch (error) {
          if (error?.name !== "AbortError") console.warn("Pairing link share failed", error);
        }
      });
      button.classList.add("hidden");
    } catch (error) {
      console.error("Pairing creation failed", error);
      button.disabled = false;
      button.textContent = "もう一度作る";
      resultBox.classList.remove("hidden");
      resultBox.textContent = error?.message || "接続リンクを作れませんでした。";
    }
  }

  async function loadDashboard() {
    if (!state.user || state.user.isAnonymous || state.loading) return;
    state.loading = true;
    els.refresh.disabled = true;
    setStatus("クラウドから最新の記録を読み込んでいます…", "idle");
    try {
      const result = await window.WeaknessQuizCloud.getFamilyDashboardRecords(
        CHILDREN.map((child) => child.id),
        { serverOnly: true }
      );
      renderDashboard(result);
    } catch (error) {
      console.error("Family dashboard load failed", error);
      clearDashboard();
      setStatus("クラウド記録を読み込めませんでした。通信を確認して更新してください。", "error");
    } finally {
      state.loading = false;
      els.refresh.disabled = false;
    }
  }

  async function signIn() {
    els.signIn.disabled = true;
    setStatus("Googleログインを開いています…", "idle");
    try {
      await window.WeaknessQuizCloud.signInParentWithGoogle();
    } catch (error) {
      console.error("Family dashboard sign-in failed", error);
      setStatus("ログインできませんでした。もう一度お試しください。", "error");
    } finally {
      els.signIn.disabled = false;
    }
  }

  function onAuth(user) {
    state.user = user || null;
    if (!state.user) {
      clearDashboard();
      els.account.textContent = "未ログイン";
      els.signIn.classList.remove("hidden");
      els.signOut.classList.add("hidden");
      els.refresh.classList.add("hidden");
      setStatus("Googleでログインすると、子ども別のクラウド記録を確認できます。", "idle");
      return;
    }
    if (state.user.isAnonymous || !state.user.email) {
      clearDashboard();
      els.account.textContent = "匿名ユーザー";
      els.signIn.textContent = "Googleで保護者ログイン";
      els.signIn.classList.remove("hidden");
      els.signOut.classList.add("hidden");
      els.refresh.classList.add("hidden");
      setStatus("保護者用のGoogleアカウントでログインしてください。匿名記録を0問とは表示しません。", "error");
      return;
    }
    els.account.textContent = state.user.email;
    els.signIn.classList.add("hidden");
    els.signOut.classList.remove("hidden");
    els.refresh.classList.remove("hidden");
    loadDashboard();
  }

  async function initialize() {
    const cloud = window.WeaknessQuizCloud;
    const result = cloud?.initParentSession();
    if (!cloud || !result?.available) {
      els.signIn.disabled = true;
      setStatus("Firebase設定を読み込めませんでした。公開HTTPS版から開いてください。", "error");
      return;
    }
    try {
      await result.ready;
    } catch (error) {
      console.error("Parent session persistence failed", error);
    }
    state.auth = cloud;
    cloud.onAuthStateChanged(onAuth);
    els.signIn.addEventListener("click", signIn);
    els.refresh.addEventListener("click", loadDashboard);
    els.signOut.addEventListener("click", async () => {
      clearDashboard();
      await cloud.signOut();
    });
  }

  initialize();
})();
