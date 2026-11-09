(function () {
'use strict';

/* =====================================================================
   夏休み 算数マスター（4年生）の画面
   - 出題表・採点・復習スケジュール・ひっ算の盤面は math4-core.js（Math4Core）
   - ここは「画面の切りかえ」「1問ずつの操作（ドラッグ）」「演出」「保存・同期」だけ
   画面のつながり（戻るボタンとスマホの「戻る」は同じ動きをする）:
     メニュー ─┬─ ひきざん／九九の いちらん ── もんだい ── けっか
               └─ ひっ算（かけ算・わり算） ── もんだい ── けっか
   ===================================================================== */

const Core = window.Math4Core;
const { DRILLS, LEVELS } = Core;

const CHILD_IDS = ['child-3'];
const params = new URLSearchParams(location.search);
const childId = CHILD_IDS.includes(params.get('child')) ? params.get('child') : CHILD_IDS[0];
const DEBUG_DATE = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : null;
// ホームの子どもカード（漢字マスターとならんで このモジュールへのリンクがある所）
const HOME_URL = `index.html#child-${childId}`;

/* ---------- 日付・保存 ---------- */
function todayKey() { return DEBUG_DATE || Core.dayKey(new Date()); }
function nowIso() { return new Date().toISOString(); }
function recordKey(name) { return `weaknessQuiz:${childId}:${name}`; }
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? value : fallback;
  } catch (e) { return fallback; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

let progress = Core.migrateProgress(readJson(recordKey('math4Progress'), null));
function saveProgress() {
  progress.updatedAt = nowIso();
  writeJson(recordKey('math4Progress'), progress);
  scheduleCloudSave();
}

/* 既存アプリの stats（トップ画面の累計・連続日数）へ橋渡し */
function bumpStats(clean, addSession) {
  const key = recordKey('stats');
  const stats = readJson(key, { daily: {} });
  if (!stats.daily || typeof stats.daily !== 'object') stats.daily = {};
  const day = todayKey();
  const entry = stats.daily[day] || { answered: 0, correct: 0, sessions: 0 };
  if (clean !== null) {
    entry.answered = (entry.answered || 0) + 1;
    if (clean) entry.correct = (entry.correct || 0) + 1;
  }
  if (addSession) entry.sessions = (entry.sessions || 0) + 1;
  stats.daily[day] = entry;
  writeJson(key, stats);
}

/* ---------- クラウド同期（既存 records/default の math4 フィールドに相乗り） ---------- */
const cloud = window.WeaknessQuizCloud;
let cloudReady = false;
let cloudTimer = null;
function scheduleCloudSave() {
  if (!cloudReady) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => {
    try {
      cloud.saveRecord(childId, { math4: progress, stats: readJson(recordKey('stats'), { daily: {} }) }).catch(() => {});
    } catch (e) {}
  }, 1200);
}
async function pullCloud() {
  try {
    const remote = await cloud.getRecord(childId);
    if (!remote || !remote.math4) return;
    const merged = Core.mergeProgress(progress, remote.math4);
    if (JSON.stringify(merged) === JSON.stringify(progress)) return;
    progress = merged;
    writeJson(recordKey('math4Progress'), progress);
    refreshListScreens();
  } catch (e) {}
}
function initCloud() {
  if (!cloud) return;
  try {
    const status = cloud.init();
    if (!status.available) return;
    cloud.onAuthStateChanged((user) => {
      cloudReady = !!user;
      if (user) pullCloud();
    });
  } catch (e) {}
}

/* =====================================================================
   画面の切りかえ（history に積むので、スマホの「戻る」でも同じ所へ戻る）
   state: {screen:'menu'} / {screen:'drill', drill} /
          {screen:'session'|'result', parent, token}
   ===================================================================== */
const $ = (id) => document.getElementById(id);
const els = {
  back: $('back-link'),
  topTitle: $('topbar-title'),
  starChip: $('star-chip'),
  starCount: $('star-count'),
  menu: $('menu-screen'),
  drill: $('drill-screen'),
  session: $('session-screen'),
  result: $('result-screen'),
  sessionTitle: $('session-title'),
  sessionProgress: $('session-progress'),
  sessFill: $('sess-fill'),
  combo: $('combo'),
  workArea: $('work-area'),
  palette: $('digit-palette'),
  buddyFace: $('buddy-face'),
  buddySay: $('buddy-say'),
  nextBtn: $('btn-next'),
  hintBtn: $('btn-hint'),
  scratchToggle: $('btn-scratch'),
  scratchPanel: $('scratch-panel'),
  scratchCanvas: $('scratch-canvas'),
  scratchClear: $('btn-scratch-clear')
};

const MENU = { screen: 'menu' };
let current = MENU;
let session = null;
let lastResult = null;
let tokenCounter = 0;

function urlFor(state) {
  const base = `${location.pathname}${location.search}`;
  if (state.screen === 'drill') return `${base}#${state.drill}`;
  if (state.parent && state.parent.screen === 'drill') return `${base}#${state.parent.drill}`;
  return base;
}
function navigate(state, replace) {
  history[replace ? 'replaceState' : 'pushState'](state, '', urlFor(state));
  render(state);
}
function parentOf(state) {
  return state.parent || MENU;
}
function drillColor(drillId) { return drillId === 'sub' ? 'sub' : 'kuku'; }
function backLabel(state) {
  if (state.screen === 'menu') return '← ホーム';
  const parent = state.screen === 'drill' ? MENU : parentOf(state);
  return parent.screen === 'drill' ? `← ${DRILLS[parent.drill].title}` : '← メニュー';
}

function render(state) {
  // もんだい・けっかは画面の中身を作り直せないので、別の問題の続きなら親の画面を出す
  if (state.screen === 'session' && !(session && session.token === state.token && !session.finished)) {
    navigate(parentOf(state), true);
    return;
  }
  if (state.screen === 'result' && !(lastResult && lastResult.token === state.token)) {
    navigate(parentOf(state), true);
    return;
  }
  current = state;
  ['menu', 'drill', 'session', 'result'].forEach((name) => els[name].classList.toggle('hidden', state.screen !== name));
  els.back.textContent = backLabel(state);
  els.back.href = state.screen === 'menu' ? HOME_URL : '#';
  if (state.screen === 'menu') renderMenu();
  if (state.screen === 'drill') renderDrillHome(state.drill);
  if (state.screen === 'session') renderSessionTitle();
  if (state.screen === 'result') renderResult();
  els.topTitle.textContent = state.screen === 'menu' ? '🔢 算数マスター' : '';
  updateStars(false);
  window.scrollTo(0, 0);
}
function refreshListScreens() {
  if (current.screen === 'menu') renderMenu();
  if (current.screen === 'drill') renderDrillHome(current.drill);
  updateStars(false);
}

els.back.addEventListener('click', (event) => {
  if (current.screen === 'menu') return; // ホームへは ふつうのリンクで移動
  event.preventDefault();
  history.back();
});
window.addEventListener('popstate', (event) => render(event.state && event.state.screen ? event.state : MENU));

let shownStars = null;
function updateStars(animate) {
  const n = Core.starCount(progress);
  els.starCount.textContent = n;
  if (animate && shownStars !== null && n > shownStars) {
    els.starChip.classList.remove('bump');
    void els.starChip.offsetWidth;
    els.starChip.classList.add('bump');
  }
  shownStars = n;
}

/* =====================================================================
   メニュー
   ===================================================================== */
function barMarkup(summary) {
  const pct = (n) => (summary.total ? (n / summary.total) * 100 : 0);
  return `<span class="mode-bar"><i class="bar-master" style="width:${pct(summary.mastered)}%"></i><i class="bar-clear" style="width:${pct(summary.cleared - summary.mastered)}%"></i></span>`;
}
function tileMarkup({ glyph, title, sub, bar, badge, badgeNext }) {
  return `${badge ? `<span class="mode-badge${badgeNext ? ' next' : ''}">${badge}</span>` : ''}
    <span class="mode-glyph">${glyph}</span>
    <h3>${title}</h3>
    ${bar || ''}
    <span class="mode-sub">${sub}</span>`;
}

// つぎにやるとよいこと（ひきざん→九九→ひっ算の順に、まだ終わっていない所）
function suggestion() {
  const day = todayKey();
  for (const drill of [DRILLS.sub, DRILLS.kuku]) {
    if (Core.dueCount(drill, progress, day) > 0) return { mode: drill.id, text: `${drill.title}の ふくしゅうが まってるよ！` };
  }
  for (const drill of [DRILLS.sub, DRILLS.kuku]) {
    const gid = Core.recommendedGroup(drill, progress);
    const s = gid && Core.groupSummary(drill, progress, gid);
    if (s && s.cleared < s.total) return { mode: drill.id, text: `つぎは ${drill.title}の「${Core.groupById(drill, gid).label}」だよ！` };
  }
  return { mode: 'mult1', text: 'ひっ算に チャレンジしてみよう！' };
}

function renderMenu() {
  const day = todayKey();
  const sug = suggestion();
  const totalToday = (() => {
    const d = progress.daily[day] || {};
    return (d.subClears || 0) + (d.kukuClears || 0) + (d.writtenSolved || 0);
  })();
  const greet = totalToday > 0 ? `きょうは もう ${totalToday}もん できたね！` : 'きょうも いっしょに がんばろう！';
  els.menu.innerHTML = `
    <div class="buddy"><span class="buddy-face">😺</span><p class="buddy-say">${greet}<small>${sug.text}</small></p></div>
    <div class="menu-grid" id="menu-drills"></div>
    <p class="menu-section-title">ひっ算（ますに 1つずつ 数字を おくよ）</p>
    <div class="menu-grid small" id="menu-written"></div>
  `;
  const drillWrap = $('menu-drills');
  [DRILLS.sub, DRILLS.kuku].forEach((drill) => {
    const summary = Core.drillSummary(drill, progress);
    const due = Core.dueCount(drill, progress, day);
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'mode-tile';
    tile.dataset.mode = drill.id;
    tile.dataset.color = drillColor(drill.id);
    tile.innerHTML = tileMarkup({
      glyph: drill.id === 'sub' ? '−' : '×',
      title: drill.id === 'sub' ? 'ひきざん' : '九九',
      bar: barMarkup(summary),
      sub: `マスター ${summary.mastered}/${summary.total}`,
      badge: due > 0 ? `ふくしゅう ${due}` : (sug.mode === drill.id ? 'つぎは ここ' : ''),
      badgeNext: !(due > 0)
    });
    tile.addEventListener('click', () => navigate({ screen: 'drill', drill: drill.id }));
    drillWrap.appendChild(tile);
  });

  const writtenWrap = $('menu-written');
  LEVELS.forEach((level) => {
    const rec = progress.levels[level.id];
    const unlocked = Core.isLevelUnlocked(progress, level.id);
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'mode-tile' + (unlocked ? '' : ' locked');
    tile.dataset.mode = level.id;
    tile.dataset.color = level.kind;
    tile.innerHTML = tileMarkup({
      glyph: unlocked ? (level.kind === 'mult' ? '×' : '÷') : '🔒',
      title: level.label.replace(/ /g, ''),
      sub: unlocked ? `${rec.solved}もん とけた${rec.streak >= 2 ? `<br>🔥${rec.streak}れんぞく` : ''}` : '3けた×1けたを 8もん とくと ひらくよ'
    });
    tile.addEventListener('click', () => {
      if (!unlocked) {
        tile.classList.remove('shake');
        void tile.offsetWidth;
        tile.classList.add('shake');
        return;
      }
      startWrittenSession(level.id, MENU, false);
    });
    writtenWrap.appendChild(tile);
  });
}

/* =====================================================================
   ひきざん・九九の いちらん（グループごとの進みぐあいマップ）
   ===================================================================== */
function renderDrillHome(drillId) {
  const drill = DRILLS[drillId];
  const day = todayKey();
  const summary = Core.drillSummary(drill, progress);
  const due = Core.dueCount(drill, progress, day);
  const reco = Core.recommendedGroup(drill, progress);
  const unit = drill.id === 'sub' ? 'ひきざん' : '九九';
  els.drill.dataset.drill = drill.id;
  els.drill.innerHTML = `
    <div class="drill-hero">
      <span class="mode-glyph">${drill.id === 'sub' ? '−' : '×'}</span>
      <div class="drill-hero-body">
        <h2>${unit}</h2>
        ${barMarkup(summary)}
        <p>マスター ${summary.mastered}/${summary.total}・クリア ${summary.cleared}/${summary.total}</p>
      </div>
    </div>
    <button type="button" class="big-btn" id="btn-mix">▶ きょうの ミックス<small>${due > 0 ? `ふくしゅう ${due}こ ＋ あたらしい ${unit}` : `あたらしい ${unit}に すすもう`}</small></button>
    <p class="order-note">したの グループから えらんでも いいよ（かんたんな じゅん）</p>
    <div id="drill-groups"></div>
    <p class="dan-legend"><span class="dan-cell learn"></span>れんしゅう中　<span class="dan-cell clear"></span>クリア　<span class="dan-cell master"></span>マスター</p>
  `;
  $('btn-mix').addEventListener('click', () => startDrillSession(drill.id, null, false));
  const groupsWrap = $('drill-groups');
  groupsWrap.style.display = 'flex';
  groupsWrap.style.flexDirection = 'column';
  groupsWrap.style.gap = '10px';
  const store = progress[drill.store] || {};
  drill.stages.forEach((stage) => {
    if (stage.label) {
      const head = document.createElement('div');
      head.className = 'stage-head';
      head.innerHTML = `<strong>${stage.label}</strong><small>${stage.note}</small>`;
      groupsWrap.appendChild(head);
    }
    drill.groups.filter((g) => g.stageId === stage.id).forEach((group) => {
      const sum = Core.groupSummary(drill, progress, group.id);
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'dan-row' + (group.id === reco ? ' recommended' : '') + (sum.mastered === sum.total ? ' done' : '');
      row.dataset.group = group.id;
      const cells = Core.factsOfGroup(drill, group.id).map((f) => `<span class="dan-cell ${Core.recordState(store[f.id])}"></span>`).join('');
      row.innerHTML = `${group.id === reco ? '<span class="dan-reco">つぎは ここ！</span>' : ''}<span class="dan-name">${group.label}</span><span class="dan-cells">${cells}</span><span class="dan-count">${sum.mastered}/${sum.total}</span>`;
      row.addEventListener('click', () => startDrillSession(drill.id, group.id, false));
      groupsWrap.appendChild(row);
    });
  });
}

/* =====================================================================
   もんだい（共通）
   ===================================================================== */
function newSession(fields) {
  return {
    token: ++tokenCounter, qi: 0, results: [], itemMisses: 0, hintUsed: false,
    combo: 0, bestCombo: 0, starsEarned: 0, masteredNow: [], finished: false,
    steps: [], stepIndex: 0, board: null, activeStepIndex: 0,
    ...fields
  };
}
function sessionState(parent) {
  return { screen: 'session', parent, token: session.token };
}
// replace=true は けっか画面からの「つぎへ」「もういちど」（けっかを もんだいで置きかえる）
function startDrillSession(drillId, groupId, replace) {
  const drill = DRILLS[drillId];
  const queue = groupId ? Core.composeGroupSession(drill, groupId) : Core.composeMix(drill, progress, todayKey());
  const title = groupId ? `${Core.groupById(drill, groupId).label} れんしゅう` : `${drill.title} ミックス`;
  session = newSession({ type: 'drill', drillId, groupId, queue, title, color: drillColor(drillId) });
  navigate(sessionState({ screen: 'drill', drill: drillId }), replace);
  renderItem();
}
function startWrittenSession(levelId, parent, replace) {
  const level = Core.levelById(levelId);
  const queue = [];
  for (let i = 0; i < level.problemsPerSession; i++) queue.push(Core.generateProblem(levelId));
  session = newSession({ type: 'written', levelId, queue, title: level.label, color: level.kind });
  navigate(sessionState(parent), replace);
  renderItem();
}
function modeKey() {
  // その日はじめて終えた練習だけ stats の sessions を+1する（以前のキーをそのまま使う）
  if (session.type === 'written') return session.levelId;
  if (session.drillId === 'sub') return session.groupId ? 'sub-group' : 'sub';
  return session.groupId ? 'dan' : 'kuku';
}

function renderSessionTitle() {
  els.session.dataset.color = session.color;
  els.sessionTitle.textContent = session.title;
}
function renderSessionHead() {
  const total = session.queue.length;
  els.sessionProgress.textContent = `${Math.min(session.qi + 1, total)} / ${total}`;
  els.sessFill.style.width = `${(session.qi / total) * 100}%`;
}
function renderCombo() {
  const show = session.combo >= 2;
  els.combo.classList.toggle('hidden', !show);
  if (show) {
    els.combo.textContent = `🔥 ${session.combo}れんぞく`;
    els.combo.classList.remove('pop');
    void els.combo.offsetWidth;
    els.combo.classList.add('pop');
  }
}

/* ---------- ねこ先生のふきだし ---------- */
const FACES = { idle: '😺', good: '😸', wow: '😻', bad: '😺', think: '🐱' };
function say(text, mood) {
  els.buddySay.innerHTML = text;
  els.buddySay.className = `buddy-say ${mood || ''}`;
  els.buddyFace.textContent = FACES[mood] || FACES.idle;
  if (mood === 'good' || mood === 'wow') {
    els.buddyFace.classList.remove('hop');
    void els.buddyFace.offsetWidth;
    els.buddyFace.classList.add('hop');
  }
}
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const PRAISE = ['せいかい！', 'すごい！', 'ばっちり！', 'その ちょうし！', 'かんぺき！', 'やったね！'];
const RETRY = ['おしい！もういちど かんがえてみよう。', 'だいじょうぶ。ゆっくりで いいよ。', 'もう ちょっと！もういちど。'];
function startLine() {
  const left = session.queue.length - session.qi;
  if (session.qi === 0) {
    if (session.type === 'written') return 'ひかっている ますに 数字を ドラッグしてね。';
    return session.drillId === 'sub' ? '数字の タイルを オレンジの わくに ドラッグしてね。' : 'こたえの タイルを 青い わくに ドラッグしてね。';
  }
  if (left === 1) return 'あと 1もん！';
  if (session.qi === Math.floor(session.queue.length / 2)) return 'はんぶん きたよ！ その ちょうし！';
  return `あと ${left}もん。`;
}

function renderItem() {
  session.itemMisses = 0;
  session.hintUsed = false;
  renderSessionTitle();
  renderSessionHead();
  renderCombo();
  els.nextBtn.classList.add('hidden');
  say(startLine(), 'idle');
  if (session.type === 'written') renderWrittenItem();
  else if (session.drillId === 'sub') renderSubItem();
  else renderKukuItem();
}

function onMiss(el, text) {
  session.itemMisses++;
  session.combo = 0;
  renderCombo();
  if (el) shakeEl(el);
  beep([180]); vibe([60, 50, 60]);
  say(text || pick(RETRY), 'bad');
}
function onStepOk() { beep([740]); vibe(25); }

// 1問おわったときの共通処理（記録・れんぞく・スター・つぎへボタン）
function concludeItem(label, extraMessage) {
  const clean = session.itemMisses === 0;
  const item = session.queue[session.qi];
  let masteredNow = false;
  if (session.type === 'written') {
    Core.applyWrittenResult(progress, session.levelId, { misses: session.itemMisses, day: todayKey() });
  } else {
    const drill = DRILLS[session.drillId];
    const res = Core.applyFactResult(drill, progress, item.fact.id, {
      misses: session.itemMisses, scheduled: item.kind !== 'bonus', day: todayKey(), now: nowIso()
    });
    masteredNow = res.masteredNow;
    if (masteredNow) session.masteredNow.push(label);
  }
  saveProgress();
  bumpStats(clean, false);
  session.results.push({ label, clean });
  if (clean) {
    session.combo += 1;
    session.bestCombo = Math.max(session.bestCombo, session.combo);
    session.starsEarned += 1;
  }
  renderCombo();
  updateStars(true);
  els.sessFill.style.width = `${((session.qi + 1) / session.queue.length) * 100}%`;

  let line;
  let mood = 'good';
  if (masteredNow) { line = `🏅 ${label} マスター！ べつの日に 2かい ノーミスだよ！`; mood = 'wow'; }
  else if (!clean) line = 'できた！ つぎも がんばろう！';
  else if (session.combo >= 3 && session.combo % 3 === 0) { line = `🔥 ${session.combo}もん れんぞく ノーミス！`; mood = 'wow'; }
  else line = `${pick(PRAISE)} ⭐ +1`;
  say(extraMessage ? `${line}<small>${extraMessage}</small>` : line, mood);

  beep(masteredNow ? [523, 659, 784, 1047] : [523, 659, 784]); vibe([30, 40, 60]);
  celebrate(masteredNow ? 4 : clean ? 2 : 1);
  els.hintBtn.classList.add('hidden');
  els.palette.innerHTML = '';
  els.nextBtn.classList.remove('hidden');
  els.nextBtn.textContent = session.qi + 1 < session.queue.length ? 'つぎへ →' : 'けっかを みる 🎉';
}

els.nextBtn.addEventListener('click', () => {
  session.qi += 1;
  if (session.qi < session.queue.length) renderItem();
  else finishSession();
});
els.hintBtn.addEventListener('click', () => {
  session.hintUsed = true;
  if (session.type === 'drill' && session.drillId === 'sub') {
    $('sub-visual').classList.remove('hidden');
    if ($('sub-sakura')) $('sub-sakura').classList.remove('hidden');
  } else if (session.type === 'drill') {
    $('kuku-array').classList.remove('hidden');
  }
  say('ずを みて かんがえてみよう。', 'think');
});

/* =====================================================================
   ひきざん（117問）: 10まで → くり下がりなし → くり下がり（さくらんぼ）
   ===================================================================== */
// 10までのひきざん: ●のかたまりから とる図
function basicStageMarkup(fact) {
  let dots = '';
  for (let i = 0; i < fact.m; i++) dots += `<span class="tf-dot" style="--d:${i * 50}ms"></span>`;
  return `
    <div class="sub-stage basic-stage" id="sub-stage" data-phase="before">
      <div class="tf-group" id="tf-ten"><div class="${fact.m === 10 ? 'ten-frame' : 'dot-row'}">${dots}</div></div>
    </div>`;
}
// 10をこえるひきざん（くり下がりなし）: 10のかたまりはそのまま、ばらから とる図
function noBorrowStageMarkup(fact) {
  const loose = fact.m - 10;
  let frame = '';
  for (let i = 0; i < 10; i++) frame += '<span class="tf-dot"></span>';
  let looseDots = '';
  for (let i = 0; i < loose; i++) looseDots += `<span class="tf-dot loose" style="--d:${i * 50}ms"></span>`;
  return `
    <div class="sub-stage" id="sub-stage" data-phase="tens">
      <span class="cherry-num" id="cherry-ten">10</span>
      <span class="cherry-num" id="cherry-loose">${loose}</span>
      <div class="tf-group" id="tf-ten"><div class="ten-frame">${frame}</div></div>
      <div class="tf-group" id="tf-loose"><div class="loose-dots">${looseDots}</div></div>
    </div>`;
}
// くり下がり: さくらんぼの枝。「10」はテンフレームの真上、「ばら」はばらの●の真上
function borrowStageMarkup(fact) {
  const loose = fact.m - 10;
  let frame = '';
  for (let i = 0; i < 10; i++) frame += `<span class="tf-dot" style="--d:${i * 50}ms"></span>`;
  let looseDots = '';
  for (let i = 0; i < loose; i++) looseDots += '<span class="tf-dot loose"></span>';
  return `
    <div class="sub-stage" id="sub-stage" data-phase="split">
      <span class="cherry-top">${fact.m}</span>
      <svg class="cherry-branch" viewBox="0 0 246 24" aria-hidden="true">
        <path d="M123 1 L59 23"/><path d="M123 1 L187 23"/>
      </svg>
      <span class="cherry-num" id="cherry-ten">10</span>
      <span class="cherry-num" id="cherry-loose">${loose}</span>
      <div class="tf-group" id="tf-ten"><div class="ten-frame">${frame}</div></div>
      <div class="tf-group" id="tf-loose"><div class="loose-dots">${looseDots}</div></div>
    </div>`;
}

// 図を手順に合わせて動かす。
// basic:    before → after
// noborrow: tens（10のかたまりを数える）→ ones（ばらから ひく）→ done
// borrow:   split（まだ とっていない）→ taken（10から とった）→ joined（あわせた）
function setSubPhase(phase) {
  const stage = $('sub-stage');
  if (!stage) return;
  const fact = session.queue[session.qi].fact;
  const sayEl = $('sub-say');
  stage.dataset.phase = phase;

  if (fact.kind === 'basic') {
    stage.querySelectorAll('.tf-dot').forEach((dot, i) => {
      dot.classList.toggle('taken', phase === 'after' && i >= fact.m - fact.b);
      dot.classList.toggle('keep', phase === 'after' && i < fact.m - fact.b);
    });
    sayEl.innerHTML = phase === 'before'
      ? `●が <b>${fact.m}こ</b>。そこから <b>${fact.b}こ</b> とると のこりは？`
      : `のこりは <b>${fact.answer}こ</b>！`;
    return;
  }

  if (fact.kind === 'noborrow') {
    const loose = fact.m - 10;
    stage.querySelectorAll('#tf-loose .tf-dot').forEach((dot, i) => {
      dot.classList.toggle('taken', phase !== 'tens' && i >= loose - fact.b);
      dot.classList.toggle('keep', phase !== 'tens' && i < loose - fact.b);
    });
    if (phase === 'tens') sayEl.innerHTML = '10の かたまりは くずさないよ。<br>かたまりは <b>いくつ</b> のこる？';
    else if (phase === 'ones') sayEl.innerHTML = `ばらの <b>${loose}こ</b> から <b>${fact.b}こ</b> とると？`;
    else sayEl.innerHTML = `10が 1つ と ばら <b>${loose - fact.b}</b> で <b>${fact.answer}</b>！`;
    return;
  }

  const loose = fact.m - 10;
  const left = 10 - fact.b;
  stage.querySelectorAll('#tf-ten .tf-dot').forEach((dot, i) => {
    dot.classList.toggle('taken', phase !== 'split' && i < fact.b);
    dot.classList.toggle('keep', phase !== 'split' && i >= fact.b);
  });
  if (phase === 'split') sayEl.innerHTML = `${fact.b}こ とりたいけど、ばらは <b>${loose}こ</b> しかない。<br>だから <b>10の かたまり</b> から とろう！`;
  else if (phase === 'taken') sayEl.innerHTML = `10から ${fact.b}こ とって のこり <b>${left}</b>。<br>ばらの <b>${loose}</b> と あわせよう！`;
  else sayEl.innerHTML = `<b>${left}</b> と <b>${loose}</b> で <b>${fact.answer}</b>！`;
}

function itemBadge(item, guidedText) {
  if (item.kind === 'group') return item.pass === 'guided' ? guidedText : '⚡ そのまま こたえよう';
  return { new: '🌱 あたらしい', bonus: '💪 おかわり', review: '🔁 ふくしゅう' }[item.kind] || '';
}

function renderSubItem() {
  const item = session.queue[session.qi];
  const fact = item.fact;
  session.stepIndex = 0;
  els.hintBtn.classList.remove('hidden');
  const guided = item.pass === 'guided';
  const badge = itemBadge(item, {
    basic: '🔵 ●を かぞえて やってみよう',
    noborrow: '📦 10の かたまりは そのまま',
    borrow: '🍒 さくらんぼで やってみよう'
  }[fact.kind]);

  // こたえの入れ物と手順は種類ごとに変わる
  let answerSlots;
  let extraBlock = '';
  let stageMarkup;
  let firstPhase;
  if (fact.kind === 'basic') {
    answerSlots = '<span class="kuku-slot" id="sub-slot-main"></span>';
    session.steps = [{ slot: 'sub-slot-main', expected: fact.answer }];
    stageMarkup = basicStageMarkup(fact);
    firstPhase = 'before';
  } else if (fact.kind === 'noborrow') {
    // こたえが2けたなので「10のかたまり」と「ばら」を1マスずつ置く
    answerSlots = '<span class="kuku-slot ans-digit" id="sub-slot-tens"></span><span class="kuku-slot ans-digit" id="sub-slot-ones"></span>';
    session.steps = [
      { slot: 'sub-slot-tens', expected: 1 },
      { slot: 'sub-slot-ones', expected: fact.answer % 10 }
    ];
    stageMarkup = noBorrowStageMarkup(fact);
    firstPhase = 'tens';
  } else {
    const loose = fact.m - 10;
    answerSlots = '<span class="kuku-slot" id="sub-slot-main"></span>';
    session.steps = guided
      ? [{ slot: 'sub-slot-a', expected: 10 - fact.b }, { slot: 'sub-slot-b', expected: fact.answer }]
      : [{ slot: 'sub-slot-main', expected: fact.answer }];
    stageMarkup = borrowStageMarkup(fact);
    firstPhase = 'split';
    extraBlock = `
      <div class="sakura${guided ? '' : ' hidden'}" id="sub-sakura">
        <div class="sakura-block">
          <p class="sakura-note">① 10の かたまりから ひく</p>
          <div class="sakura-line">
            <span>10</span><span class="kuku-op">−</span><span>${fact.b}</span><span class="kuku-op">=</span>
            <span class="kuku-slot sub-slot" id="sub-slot-a"></span>
          </div>
        </div>
        <div class="sakura-block">
          <p class="sakura-note">② のこりと ばらを あわせる</p>
          <div class="sakura-line">
            <span class="sakura-carry" id="sub-carry-a">?</span><span class="kuku-op">＋</span><span>${loose}</span><span class="kuku-op">=</span>
            <span class="kuku-slot sub-slot" id="sub-slot-b"></span>
          </div>
        </div>
      </div>`;
  }

  els.workArea.innerHTML = `
    <div class="kuku-card">
      <p class="kuku-kind">${badge}</p>
      <div class="kuku-equation">
        <span>${fact.m}</span><span class="kuku-op">−</span><span>${fact.b}</span><span class="kuku-op">=</span>
        ${answerSlots}
      </div>
      <button type="button" class="ghost-btn${guided ? ' hidden' : ''}" id="sub-visual-toggle">🔲 ずで かくにん</button>
      <div class="sub-visual${guided ? '' : ' hidden'}" id="sub-visual">
        <p class="sub-say" id="sub-say"></p>
        ${stageMarkup}
      </div>
      ${extraBlock}
    </div>`;
  $('sub-visual-toggle').addEventListener('click', () => $('sub-visual').classList.toggle('hidden'));
  setSubPhase(firstPhase);
  renderDigitPalette(checkSubDrop);
  focusSubStep();
}

function focusSubStep() {
  document.querySelectorAll('.kuku-slot.active').forEach((el) => el.classList.remove('active'));
  const step = session.steps[session.stepIndex];
  if (step && $(step.slot)) $(step.slot).classList.add('active');
}

function checkSubDrop(value, dropEl) {
  const step = session.steps[session.stepIndex];
  if (!step) return;
  const slot = $(step.slot);
  if (!dropEl || dropEl !== slot) return;
  const fact = session.queue[session.qi].fact;

  if (Number(value) !== step.expected) {
    onMiss(slot);
    const hintPhases = { basic: ['before', 'after'], noborrow: ['tens', 'ones'], borrow: ['split', 'taken'] };
    const phases = hintPhases[fact.kind];
    if (session.itemMisses === 2) {
      // まだ答えは出さず、「どう考えるか」の図から見せる
      session.hintUsed = true;
      $('sub-visual').classList.remove('hidden');
      if ($('sub-sakura')) $('sub-sakura').classList.remove('hidden');
      setSubPhase(fact.kind === 'noborrow' && session.stepIndex > 0 ? phases[1] : phases[0]);
      say(fact.kind === 'borrow' ? 'ずを みてね。ばらだけでは とれないよ。' : 'ずを みて、かぞえてみよう。', 'think');
    } else if (session.itemMisses >= 3) {
      session.hintUsed = true;
      $('sub-visual').classList.remove('hidden');
      setSubPhase(phases[1]);
      say(`ヒント：こたえは <b>${step.expected}</b> だよ！`, 'think');
    }
    return;
  }

  slot.textContent = value;
  slot.classList.remove('active');
  slot.classList.add('correct');
  onStepOk();
  session.stepIndex++;
  if (session.stepIndex < session.steps.length) {
    if (fact.kind === 'noborrow') {
      setSubPhase('ones');
    } else {
      // ①の答えを②の式へ運び、図からも引いた分を とりのぞく
      const carry = $('sub-carry-a');
      if (carry) { carry.textContent = value; carry.classList.add('filled'); }
      setSubPhase('taken');
    }
    say('いいね！ つぎの □ だよ。', 'good');
    focusSubStep();
    return;
  }
  const main = $('sub-slot-main');
  if (main && !main.textContent) {
    main.textContent = fact.answer;
    main.classList.add('correct');
  }
  setSubPhase(fact.kind === 'basic' ? 'after' : fact.kind === 'noborrow' ? 'done' : 'joined');
  concludeItem(`${fact.m}−${fact.b}`);
}

/* =====================================================================
   九九（81問）: 選択肢タイルを □ にドラッグ
   ===================================================================== */
function renderKukuItem() {
  const item = session.queue[session.qi];
  const fact = item.fact;
  els.hintBtn.classList.remove('hidden');
  els.palette.innerHTML = '';
  const badge = itemBadge(item, `📖 ${fact.a}のだんを じゅんばんに`).replace('⚡ そのまま こたえよう', '🎲 ばらばらに チャレンジ');
  els.workArea.innerHTML = `
    <div class="kuku-card">
      <p class="kuku-kind">${badge}</p>
      <div class="kuku-equation">
        <span>${fact.a}</span><span class="kuku-op">×</span><span>${fact.b}</span><span class="kuku-op">=</span>
        <span class="kuku-slot" id="kuku-slot" data-expected="${fact.answer}"></span>
      </div>
      <button type="button" class="ghost-btn" id="kuku-array-toggle">🔲 ずで かくにん</button>
      <div class="kuku-array hidden" id="kuku-array"></div>
      <div class="kuku-choices" id="kuku-choices"></div>
    </div>`;
  const arrayEl = $('kuku-array');
  for (let r = 0; r < fact.a; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kuku-array-row';
    for (let c = 0; c < fact.b; c++) {
      const dot = document.createElement('span');
      dot.className = 'kuku-dot';
      rowEl.appendChild(dot);
    }
    arrayEl.appendChild(rowEl);
  }
  $('kuku-array-toggle').addEventListener('click', () => arrayEl.classList.toggle('hidden'));
  // 段れんしゅうの1周目（じゅんばん）は図を見ながら「かたまりの数」として覚える
  if (item.pass === 'guided') arrayEl.classList.remove('hidden');

  const choiceWrap = $('kuku-choices');
  Core.kukuChoices(fact).forEach((value) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'digit-tile kuku-tile';
    tile.textContent = value;
    tile.addEventListener('pointerdown', (event) => startTileDrag(event, tile, value, checkKukuDrop));
    choiceWrap.appendChild(tile);
  });
}

function checkKukuDrop(value, dropEl) {
  const slot = $('kuku-slot');
  if (!dropEl || dropEl !== slot || slot.classList.contains('correct')) return;
  const fact = session.queue[session.qi].fact;
  if (value === fact.answer) {
    slot.textContent = value;
    slot.classList.add('correct');
    $('kuku-choices').innerHTML = '';
    concludeItem(`${fact.a}×${fact.b}`);
    return;
  }
  onMiss(slot);
  if (session.itemMisses >= 2) {
    $('kuku-array').classList.remove('hidden');
    session.hintUsed = true;
    say(`ずを みて かぞえてみよう！ ${fact.b}こが ${fact.a}れつ あるよ。`, 'think');
  }
}

/* =====================================================================
   ひっ算（かけ算・わり算）: 光っている ますに 1つずつ 数字を置く
   ===================================================================== */
function renderWrittenItem() {
  const problem = session.queue[session.qi];
  session.activeStepIndex = 0;
  els.hintBtn.classList.add('hidden');

  const board = problem.kind === 'mult' ? Core.buildMultiplyBoard(problem) : Core.buildDivisionBoard(problem);
  session.board = board;
  els.workArea.innerHTML = '';
  const outer = document.createElement('div');
  outer.className = 'calc-outer';
  const wrap = document.createElement('div');
  wrap.className = problem.kind === 'mult' ? 'calc-board mult-board' : 'calc-board div-board';
  const colWidth = 42;
  const divisorColWidth = 34;
  // わり算は左端に除数の列を1つ足す（除数 ) 被除数 の形にするため）
  wrap.style.gridTemplateColumns = problem.kind === 'div'
    ? `${divisorColWidth}px repeat(${board.cols}, ${colWidth}px)`
    : `repeat(${board.cols}, ${colWidth}px)`;
  wrap.style.gridTemplateRows = `repeat(${board.rows}, auto)`;

  // かけ算は「一の位=col0」なので右づめにするため cols-col。
  // わり算は「左からの位置」なので除数の列ぶん右へずらす（グリッドは1始まり）
  const toGridColumn = problem.kind === 'mult' ? (col) => board.cols - col : (col) => col + 2;

  if (problem.kind === 'div') {
    // 除数は被除数と同じ行に置き、右の縦線が「)」の役目をする
    const divisor = document.createElement('div');
    divisor.className = 'div-divisor';
    divisor.textContent = problem.divisor;
    divisor.style.gridColumn = '1';
    divisor.style.gridRow = '2';
    wrap.appendChild(divisor);
  }

  const cellClass = { given: 'given', blank: 'blank', 'carry-input': 'carry-slot', bringdown: 'bringdown-slot', input: 'input-slot' };
  board.cells.forEach((cell) => {
    if (cell.kind === 'op') return;
    const cellEl = document.createElement('div');
    cellEl.style.gridColumn = String(toGridColumn(cell.col));
    cellEl.style.gridRow = String(cell.row + 1);
    cellEl.dataset.cellId = cell.id;
    cellEl.className = `calc-cell ${cellClass[cell.kind]}`;
    if (cell.kind === 'given') cellEl.textContent = cell.value;
    if (cell.stepId) cellEl.dataset.stepId = cell.stepId;
    wrap.appendChild(cellEl);
  });

  const opCell = board.cells.find((c) => c.kind === 'op');
  if (opCell) {
    // ×は筆算どおり、数字の左はしに置く（かける数のとなりに浮かせない）
    const opEl = document.createElement('div');
    opEl.className = 'calc-op-label';
    opEl.style.gridRow = String(opCell.row + 1);
    opEl.style.gridColumn = String(Math.min(...board.cells.filter((c) => c.kind === 'given').map((c) => toGridColumn(c.col))));
    opEl.textContent = opCell.value;
    wrap.appendChild(opEl);
  }
  // 横線: かけ算は行番号（全幅）、わり算は {row, fromCol, toCol}（その計算に使う桁ぶんだけ）
  board.ruleRows.forEach((rule) => {
    if (typeof rule === 'number') addRuleLine(wrap, rule, 1, board.cols);
    else addRuleLine(wrap, rule.row, toGridColumn(rule.fromCol), rule.toCol - rule.fromCol + 1);
  });

  outer.appendChild(wrap);
  els.workArea.appendChild(outer);
  focusActiveStep();
}
function addRuleLine(wrap, row, gridColStart, gridColSpan) {
  const rule = document.createElement('div');
  rule.className = 'calc-rule';
  rule.style.gridRow = String(row + 1);
  rule.style.gridColumn = `${gridColStart} / span ${gridColSpan}`;
  wrap.appendChild(rule);
}

// 0〜9のタイル（5×2）。ひきざん・ひっ算で共用
function renderDigitPalette(onDrop) {
  els.palette.innerHTML = '';
  for (let v = 0; v <= 9; v++) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'digit-tile';
    tile.textContent = v;
    tile.addEventListener('pointerdown', (event) => startTileDrag(event, tile, v, onDrop));
    els.palette.appendChild(tile);
  }
}

function activeStepCellEl() {
  const step = session.board.steps[session.activeStepIndex];
  return step ? els.workArea.querySelector(`[data-step-id="${step.id}"]`) : null;
}
function focusActiveStep() {
  els.workArea.querySelectorAll('.calc-cell.active').forEach((el) => el.classList.remove('active'));
  els.workArea.querySelectorAll('.calc-cell.drag-source').forEach((el) => {
    el.classList.remove('drag-source');
    el.onpointerdown = null;
  });
  const step = session.board.steps[session.activeStepIndex];
  if (!step) return;
  const cellEl = activeStepCellEl();
  if (cellEl) cellEl.classList.add('active');
  if (step.isBringDown) {
    // 「つぎの位を おろす」は、割られる数の数字そのものを ドラッグして おろす
    const sourceCell = session.board.cells.find((c) => c.kind === 'given' && c.sourceIndex === step.sourceIndex);
    const el = sourceCell && els.workArea.querySelector(`[data-cell-id="${sourceCell.id}"]`);
    if (el) {
      el.classList.add('drag-source');
      el.onpointerdown = (event) => startTileDrag(event, el, step.expected, checkWrittenDrop, String(step.expected));
    }
    els.palette.innerHTML = '<p class="palette-hint">⬇️ 上の 数字を したの ますへ おろそう！</p>';
    return;
  }
  renderDigitPalette(checkWrittenDrop);
}

function checkWrittenDrop(value, dropEl) {
  const step = session.board.steps[session.activeStepIndex];
  if (!step) return;
  const cellEl = activeStepCellEl();
  if (!dropEl || dropEl !== cellEl) return;
  if (Number(value) !== step.expected) {
    onMiss(cellEl, session.itemMisses >= 2 ? `ヒント：ここは <b>${step.expected}</b> だよ！` : 'ちがう 数字みたい。らくがきで けいさんしてみよう。');
    return;
  }
  cellEl.textContent = value;
  cellEl.classList.add('filled', 'correct-flash');
  setTimeout(() => cellEl.classList.remove('correct-flash'), 320);
  onStepOk();
  session.activeStepIndex++;
  if (session.activeStepIndex < session.board.steps.length) {
    focusActiveStep();
    return;
  }
  const problem = session.queue[session.qi];
  const board = session.board;
  const label = problem.kind === 'mult' ? `${problem.multiplicand}×${problem.multiplier}` : `${problem.dividend}÷${problem.divisor}`;
  const answer = problem.kind === 'mult'
    ? `こたえは ${board.resultLabel}`
    : `こたえは ${board.quotient}${board.remainder ? ` あまり ${board.remainder}` : ''}`;
  concludeItem(label, answer);
}

/* ---------- ドラッグ・タイル ---------- */
function startTileDrag(event, sourceEl, value, onDrop, ghostText) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  const ghost = document.createElement('div');
  ghost.className = 'digit-drag-ghost';
  ghost.textContent = ghostText !== undefined ? ghostText : String(value);
  ghost.style.left = `${event.clientX}px`;
  ghost.style.top = `${event.clientY}px`;
  document.body.appendChild(ghost);
  let lastDropTarget = null;
  const targetAt = (x, y) => {
    const under = document.elementFromPoint(x, y);
    return under && under.closest('.kuku-slot, .calc-cell.active');
  };
  const move = (moveEvent) => {
    ghost.style.left = `${moveEvent.clientX}px`;
    ghost.style.top = `${moveEvent.clientY}px`;
    const target = targetAt(moveEvent.clientX, moveEvent.clientY);
    if (lastDropTarget && lastDropTarget !== target) lastDropTarget.classList.remove('drop-hover');
    if (target) target.classList.add('drop-hover');
    lastDropTarget = target;
  };
  const end = (endEvent) => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointercancel', end);
    ghost.remove();
    if (lastDropTarget) lastDropTarget.classList.remove('drop-hover');
    if (endEvent.type === 'pointercancel') return;
    onDrop(value, targetAt(endEvent.clientX, endEvent.clientY));
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', end, { once: true });
  document.addEventListener('pointercancel', end, { once: true });
}
function shakeEl(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

/* ---------- 効果音・演出 ---------- */
let audioCtx = null;
let soundOn = true;
function beep(freqs) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.09 + 0.15);
      o.connect(g).connect(audioCtx.destination);
      o.start(audioCtx.currentTime + i * 0.09); o.stop(audioCtx.currentTime + i * 0.09 + 0.16);
    });
  } catch (e) {}
}
const vibe = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
function celebrate(count) {
  const c = $('celebrate');
  const emo = ['⭐', '🎉', '✨', '💮', '🌟'];
  for (let i = 0; i < count * 5; i++) {
    const s = document.createElement('span');
    s.textContent = emo[Math.floor(Math.random() * emo.length)];
    s.style.left = (15 + Math.random() * 70) + '%';
    s.style.top = (35 + Math.random() * 35) + '%';
    s.style.animationDelay = (Math.random() * 0.25) + 's';
    c.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
}
$('sound-btn').addEventListener('click', (e) => {
  soundOn = !soundOn;
  e.currentTarget.textContent = soundOn ? '🔊' : '🔇';
});

/* =====================================================================
   けっか
   ===================================================================== */
function finishSession() {
  const day = todayKey();
  const flagKey = recordKey(`math4SessionDay:${modeKey()}`);
  if (session.results.length > 0 && localStorage.getItem(flagKey) !== day) {
    try { localStorage.setItem(flagKey, day); } catch (e) {}
    bumpStats(null, true);
    saveProgress();
  }
  session.finished = true;
  lastResult = { token: session.token, session };
  navigate({ screen: 'result', parent: parentOf(current), token: session.token }, true);
}

// けっか画面の「つぎへ すすむ」: 練習の続きを1つだけ提案する
function nextAction(s) {
  if (s.type === 'written') {
    const nextLevel = LEVELS.find((l) => l.requires === s.levelId);
    if (nextLevel && Core.isLevelUnlocked(progress, nextLevel.id) && progress.levels[nextLevel.id].solved === 0) {
      return { label: `▶ ${nextLevel.label}に すすむ`, sub: 'あたらしい レベルが ひらいたよ！', run: () => startWrittenSession(nextLevel.id, MENU, true) };
    }
    return { label: `▶ もう ${s.queue.length}もん`, sub: 'あたらしい もんだいが でるよ', run: () => startWrittenSession(s.levelId, MENU, true) };
  }
  const drill = DRILLS[s.drillId];
  const reco = Core.recommendedGroup(drill, progress);
  if (reco && reco !== s.groupId) {
    return { label: `▶ つぎは「${Core.groupById(drill, reco).label}」`, sub: 'つぎの グループに すすもう', run: () => startDrillSession(drill.id, reco, true) };
  }
  if (s.groupId) {
    return { label: '▶ もういちど れんしゅう', sub: 'ノーミスで クリアを めざそう', run: () => startDrillSession(drill.id, s.groupId, true) };
  }
  return { label: `▶ ${drill.title}の グループを えらぶ`, sub: 'すきな グループを えらぼう', run: () => history.back() };
}

function renderResult() {
  const s = lastResult.session;
  const total = s.results.length;
  const clean = s.results.filter((r) => r.clean).length;
  const ratio = total ? clean / total : 0;
  let face = '😻';
  let title = 'パーフェクト！';
  let sub = 'ぜんぶ ノーミス！ すごすぎる！';
  if (total === 0) { face = '😺'; title = 'きょうの ぶんは おわってるよ'; sub = 'グループを えらんで れんしゅうしても いいよ。'; }
  else if (ratio < 1 && ratio >= 0.7) { face = '😸'; title = 'よくできました！'; sub = 'あと すこしで パーフェクト！'; }
  else if (ratio < 0.7) { face = '😺'; title = 'さいごまで できたね！'; sub = 'まちがえた もんだいは あした また でるよ。'; }
  $('result-face').textContent = face;
  $('result-title').textContent = title;
  $('result-sub').textContent = sub;
  const starsShown = total === 0 ? 0 : ratio === 1 ? 3 : ratio >= 0.7 ? 2 : 1;
  $('result-stars').textContent = '⭐'.repeat(starsShown) + '☆'.repeat(3 - starsShown);
  $('result-stars').classList.toggle('hidden', total === 0);
  const summaryParts = [
    `<div class="stat"><b>${total}</b><span>といた</span></div>`,
    `<div class="stat"><b>+${s.starsEarned}</b><span>⭐ スター</span></div>`
  ];
  if (s.bestCombo >= 2) summaryParts.push(`<div class="stat"><b>${s.bestCombo}</b><span>🔥 れんぞく</span></div>`);
  if (s.type === 'drill') {
    const sum = Core.drillSummary(DRILLS[s.drillId], progress);
    summaryParts.push(`<div class="stat"><b>${sum.mastered}/${sum.total}</b><span>マスター</span></div>`);
  }
  $('result-summary').innerHTML = summaryParts.join('');
  const mastered = $('result-mastered');
  mastered.classList.toggle('hidden', s.masteredNow.length === 0);
  mastered.innerHTML = s.masteredNow.length ? `🏅 あたらしく マスター！<br>${s.masteredNow.join('　')}` : '';
  $('result-list').innerHTML = s.results.map((r) => `<span class="chip${r.clean ? '' : ' miss'}">${r.clean ? '⭐' : '🔁'} ${r.label}</span>`).join('');

  const action = nextAction(s);
  const nextBtn = $('btn-result-next');
  nextBtn.style.setProperty('--c', `var(--${s.color})`);
  nextBtn.innerHTML = `${action.label}<small>${action.sub}</small>`;
  nextBtn.onclick = action.run;
  const again = $('btn-result-again');
  // ミックスは同じ問題を作り直せない（きょうの ぶんは もう終わっている）ので出さない
  again.classList.toggle('hidden', s.type === 'drill' && !s.groupId);
  again.onclick = () => {
    if (s.type === 'written') startWrittenSession(s.levelId, MENU, true);
    else startDrillSession(s.drillId, s.groupId, true);
  };
  if (total > 0) {
    celebrate(ratio === 1 ? 5 : 3);
    beep([523, 659, 784, 1047, 1319]);
  }
}

/* ---------- らくがきメモ（手で描くスクラッチパッド、採点なし） ---------- */
(function setupScratchPad() {
  const canvas = els.scratchCanvas;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let last = null;
  let width = 0;
  let height = 0;
  function fit() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width; height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2b3a67';
    ctx.lineWidth = 3;
  }
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    last = pos(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(p[0], p[1]);
    ctx.stroke();
    last = p;
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  els.scratchToggle.addEventListener('click', () => {
    els.scratchPanel.classList.toggle('hidden');
    if (!els.scratchPanel.classList.contains('hidden')) fit();
  });
  els.scratchClear.addEventListener('click', () => ctx.clearRect(0, 0, width, height));
  window.addEventListener('resize', () => { if (!els.scratchPanel.classList.contains('hidden')) fit(); });
})();

/* ---------- 起動 ---------- */
// 履歴は「メニュー」を土台にする。#sub / #kuku で開いたときは その一覧を上に積むので、
// 戻るとメニュー → もう一度でホーム、と順番に戻れる
const startHash = location.hash.replace('#', '');
initCloud();
history.replaceState(MENU, '', urlFor(MENU));
render(MENU);
if (DRILLS[startHash]) navigate({ screen: 'drill', drill: startHash });

if (DEBUG_DATE) {
  // ?date=YYYY-MM-DD のときだけ。ブラウザテスト（Playwright）から中を確かめる
  window.__MATH4_TEST__ = {
    Core,
    todayKey,
    getProgress: () => progress,
    getSession: () => session,
    getState: () => current,
    getActiveStep: () => session && session.board && session.board.steps[session.activeStepIndex],
    getSubStep: () => session && session.steps && session.steps[session.stepIndex],
    renderItem,
    startDrillSession,
    startWrittenSession
  };
}
})();
