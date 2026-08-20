#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 1."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-01-f01", "statement": "地球儀は、大陸の形や面積、地球上の距離と方位をまとめて正しく表せる模型である。", "printed_pages": [2]},
    {"id": "geo-01-f02", "statement": "海洋は地球表面の約7割、陸地は約3割を占める。", "printed_pages": [2]},
    {"id": "geo-01-f03", "statement": "三大洋は太平洋、大西洋、インド洋である。", "printed_pages": [2]},
    {"id": "geo-01-f04", "statement": "六大陸はユーラシア、アフリカ、北アメリカ、南アメリカ、オーストラリア、南極である。", "printed_pages": [2]},
    {"id": "geo-01-f05", "statement": "緯度は赤道を0度とし、南北それぞれ90度まで表す。緯線は同じ緯度を結ぶ。", "printed_pages": [2]},
    {"id": "geo-01-f06", "statement": "経度はロンドンを通る本初子午線を0度とし、東西それぞれ180度まで表す。経線は同じ経度を結ぶ。", "printed_pages": [2, 3]},
    {"id": "geo-01-f07", "statement": "緯線と経線が直角に交わる地図では、高緯度ほど面積のゆがみが大きくなる。", "printed_pages": [2]},
    {"id": "geo-01-f08", "statement": "中心からの距離と方位が正しい地図は、中心から離れるほど形がゆがむ。", "printed_pages": [2]},
    {"id": "geo-01-f09", "statement": "世界はアジア州、ヨーロッパ州、アフリカ州、北アメリカ州、南アメリカ州、オセアニア州の6州に区分される。", "printed_pages": [3]},
    {"id": "geo-01-f10", "statement": "アジア州は東アジア、東南アジア、南アジア、中央アジア、西アジアの5地域に区分される。", "printed_pages": [3]},
    {"id": "geo-01-f11", "statement": "国名には、インダス川に由来するインドや、スペイン語の「赤道」に由来するエクアドルのような例がある。", "printed_pages": [3]},
    {"id": "geo-01-f12", "statement": "面積が最も大きい国はロシア連邦で、面積が特に小さい国にバチカン市国がある。", "printed_pages": [3]},
    {"id": "geo-01-f13", "statement": "国境には河川や山脈などの自然地形を利用するものと、緯線や経線を利用する直線状のものがある。", "printed_pages": [3]},
    {"id": "geo-01-f14", "statement": "島国は国土が海洋に囲まれた国、内陸国は国土が海洋に面していない国である。", "printed_pages": [3]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-01_p002-003.jpg"
    left = root / "page_images/pages/page_002_geo-01_left.jpg"
    right = root / "page_images/pages/page_003_geo-01_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-01.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [2, 3]:
        raise ValueError("geo-01 printed page mapping must be p.2-3")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-01 原画像照合レポート", "",
        f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.2-3",
        f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_002_geo-01_left.jpg / page_003_geo-01_right.jpg",
        "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit1_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-01", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
