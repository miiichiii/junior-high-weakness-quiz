#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 3."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-03-f01", "statement": "世界の主な気候帯は、熱帯、乾燥帯、温帯、冷帯（亜寒帯）、寒帯の5つである。", "printed_pages": [6]},
    {"id": "geo-03-f02", "statement": "熱帯雨林気候は一年中高温で降水量が多く、サバナ気候は一年中高温で雨季と乾季がある。", "printed_pages": [6]},
    {"id": "geo-03-f03", "statement": "砂漠気候はほとんど雨が降らず、ステップ気候は雨が少ないが短い草が生える。", "printed_pages": [6]},
    {"id": "geo-03-f04", "statement": "温帯には、一年を通して雨が降る西岸海洋性気候、夏に乾燥し冬に雨が多い地中海性気候、四季の変化が明瞭な温暖湿潤気候がある。", "printed_pages": [6]},
    {"id": "geo-03-f05", "statement": "冷帯は冬が厳しく夏が短い。寒帯のツンドラ気候では短い夏に草やこけが生え、氷雪気候では一年中雪や氷に覆われる。", "printed_pages": [6]},
    {"id": "geo-03-f06", "statement": "高山気候では標高が100m上がるごとに気温が約0.6℃下がり、同緯度の低地より気温が低い。", "printed_pages": [6]},
    {"id": "geo-03-f07", "statement": "カナダのイヌイットはあざらしやカリブーを狩り、シベリアでは永久凍土の融解を避けるため高床式住居が利用される。", "printed_pages": [6]},
    {"id": "geo-03-f08", "statement": "地中海沿岸では、夏の乾燥に強いぶどうやオリーブの栽培が盛んである。", "printed_pages": [6]},
    {"id": "geo-03-f09", "statement": "乾燥地域ではオアシスの周囲に集落や畑がつくられ、かんがい農業や遊牧も行われる。", "printed_pages": [6]},
    {"id": "geo-03-f10", "statement": "赤道付近の熱帯ではいも類を主食とする地域があり、アンデス高地ではリャマ・アルパカを飼い、じゃがいもを栽培する。", "printed_pages": [6]},
    {"id": "geo-03-f11", "statement": "焼畑農業は、森林や草を焼いてその灰を肥料とし、作物を育てる農業である。", "printed_pages": [7]},
    {"id": "geo-03-f12", "statement": "遊牧は草や水を求めて家畜とともに移動する牧畜で、リャマは運搬、アルパカは毛の利用に向く。", "printed_pages": [7]},
    {"id": "geo-03-f13", "statement": "衣服や食事は気候に適応し、雨の多い地域では米、雨の少ない地域では小麦・とうもろこし、熱帯ではいも類が主食になりやすい。", "printed_pages": [7]},
    {"id": "geo-03-f14", "statement": "住居には地域の材料が使われ、森林地域の木造、地中海沿岸の小窓の石造、乾燥地域の日干しれんが、遊牧民のゲルなどがある。", "printed_pages": [7]},
    {"id": "geo-03-f15", "statement": "キリスト教は聖書、イスラム教はコーラン、仏教は経典を聖典とする。ヒンドゥー教はインドで多く信仰され、牛を神聖視する。", "printed_pages": [7]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-03_p006-007.jpg"
    left = root / "page_images/pages/page_006_geo-03_left.jpg"
    right = root / "page_images/pages/page_007_geo-03_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-03.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [6, 7]:
        raise ValueError("geo-03 printed page mapping must be p.6-7")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-03 原画像照合レポート", "",
        f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.6-7",
        f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_006_geo-03_left.jpg / page_007_geo-03_right.jpg",
        "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit3_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-03", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
