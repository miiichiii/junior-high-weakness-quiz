const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = { window: {}, console };
vm.createContext(context);

function load(file) {
  const code = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(code, context, { filename: file });
}

load("data/kanji-summer-2026.js");

const errors = [];
function check(cond, message) {
  if (!cond) errors.push(message);
}

const deck = (context.window.KANJI_DECKS || {})["kanji-summer-2026"];
check(deck, "デッキ kanji-summer-2026 が登録されていない");

if (deck) {
  check(deck.childIds && deck.childIds.includes("child-3"), "childIds に child-3 がない");
  check(deck.schedule && deck.schedule.newPerDay > 0, "schedule.newPerDay が不正");
  check(Array.isArray(deck.schedule.reviewIntervals) && deck.schedule.reviewIntervals.length > 0, "reviewIntervals が不正");

  const kanji = deck.kanji || [];
  check(kanji.length === 76, `漢字が76字でない: ${kanji.length}`);

  const chars = new Set();
  const orders = new Set();
  const sheetItems = new Set();
  let promptCount = 0;
  let dualCount = 0;
  const hiragana = /^[ぁ-ゖー]+$/;

  kanji.forEach(entry => {
    check(typeof entry.char === "string" && entry.char.length === 1, `char不正: ${JSON.stringify(entry.char)}`);
    check(!chars.has(entry.char), `char重複: ${entry.char}`);
    chars.add(entry.char);
    check(Number.isInteger(entry.order) && !orders.has(entry.order), `order不正/重複: ${entry.char}`);
    orders.add(entry.order);

    check(Array.isArray(entry.strokes) && entry.strokes.length >= 1 && entry.strokes.length <= 24,
      `${entry.char}: 画数が異常 (${entry.strokes && entry.strokes.length})`);
    (entry.strokes || []).forEach((stroke, si) => {
      check(Array.isArray(stroke) && stroke.length >= 2, `${entry.char} 画${si + 1}: 点が少なすぎる`);
      (stroke || []).forEach(pt => {
        check(Array.isArray(pt) && pt.length === 2 &&
          pt.every(v => Number.isFinite(v) && v >= 0 && v <= 100),
          `${entry.char} 画${si + 1}: 座標が0-100外 ${JSON.stringify(pt)}`);
      });
    });

    const prompts = entry.prompts || [];
    check(prompts.length >= 1 && prompts.length <= 2, `${entry.char}: prompts数が異常 (${prompts.length})`);
    if (prompts.length === 2) dualCount += 1;
    prompts.forEach(p => {
      promptCount += 1;
      check([1, 2].includes(p.sheet), `${entry.char}: sheet不正 ${p.sheet}`);
      check(Number.isInteger(p.item) && p.item >= 1 && p.item <= 50, `${entry.char}: item不正 ${p.item}`);
      const si = `${p.sheet}:${p.item}`;
      check(!sheetItems.has(si), `sheet/item重複: ${si}`);
      sheetItems.add(si);
      check(Array.isArray(p.word) && p.word.filter(w => w === "◻").length === 1,
        `${entry.char} ${si}: word の ◻ が1個でない`);
      check(typeof p.yomi === "string" && hiragana.test(p.yomi), `${entry.char} ${si}: yomi がひらがなでない: ${p.yomi}`);
      check(typeof p.okurigana === "string" && (p.okurigana === "" || hiragana.test(p.okurigana)),
        `${entry.char} ${si}: okurigana不正: ${p.okurigana}`);
      check(typeof p.sentence === "string" && p.sentence.length > 0, `${entry.char} ${si}: sentence が空`);
      check(!p.okurigana || p.yomi.endsWith(p.okurigana),
        `${entry.char} ${si}: yomi が okurigana で終わらない (${p.yomi} / ${p.okurigana})`);
    });
  });

  check(promptCount === 100, `出題が100問でない: ${promptCount}`);
  check(dualCount === 24, `例文2つの漢字が24字でない: ${dualCount}`);
  for (let i = 0; i < kanji.length; i += 1) {
    check(orders.has(i), `order が密でない: ${i} が欠落`);
  }
}

if (errors.length) {
  console.error(`NG: ${errors.length}件`);
  errors.slice(0, 30).forEach(e => console.error(" -", e));
  process.exit(1);
}
console.log("OK: 76字 / 100問 / 筆順・座標・出題メタすべて妥当");
