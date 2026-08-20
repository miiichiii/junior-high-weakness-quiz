#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 4."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-04-f01", "statement": "アジア中央部には8000m級の山々が連なるヒマラヤ山脈とチベット高原がある。", "printed_pages": [8]},
    {"id": "geo-04-f02", "statement": "アジアには黄河、長江、メコン川、ガンジス川、インダス川などの大河川が流れ、中央アジアと西アジアには砂漠が広がる。", "printed_pages": [8]},
    {"id": "geo-04-f03", "statement": "東・東南・南アジアは季節風の影響を受け、赤道付近は熱帯で雨季の降水量が多い。中央・西アジアの多くは乾燥帯である。", "printed_pages": [8]},
    {"id": "geo-04-f04", "statement": "アジア州の人口は世界人口の約6割で、中国は約14億2600万人、インドは約14億2900万人である（2023年）。", "printed_pages": [8]},
    {"id": "geo-04-f05", "statement": "中国では人口増加を抑える一人っ子政策が行われてきたが、2015年に廃止された。", "printed_pages": [8]},
    {"id": "geo-04-f06", "statement": "中国は1979年以降の開放政策により、沿岸部に経済特区を設けた。", "printed_pages": [9]},
    {"id": "geo-04-f07", "statement": "中国は安く豊富な労働力を背景に工場が集まり『世界の工場』と呼ばれ、2010年には国内総生産が世界第2位になった。", "printed_pages": [9]},
    {"id": "geo-04-f08", "statement": "韓国と台湾はアジアNIES（新興工業経済地域）に含まれる。", "printed_pages": [9]},
    {"id": "geo-04-f09", "statement": "東南アジアでは工業団地の建設と外国企業の受け入れで工業化が進み、輸出の中心が天然ゴムなどから工業製品へ移った。", "printed_pages": [9]},
    {"id": "geo-04-f10", "statement": "ASEAN（東南アジア諸国連合）は東南アジアの10か国が加盟し、加盟国相互の経済協力などを目的とする。", "printed_pages": [9]},
    {"id": "geo-04-f11", "statement": "東南アジアでは赤道付近の島々でイスラム教、フィリピンでキリスト教が信仰されている。", "printed_pages": [9]},
    {"id": "geo-04-f12", "statement": "インドでは1990年代の経済自由化後に欧米企業が進出し、バンガロールなどで情報通信技術（ICT）産業が盛んになった。", "printed_pages": [9]},
    {"id": "geo-04-f13", "statement": "南アジアでは夏にインド洋から湿った季節風が吹いて雨季となり、冬は大陸からの季節風で乾季となる。", "printed_pages": [9]},
    {"id": "geo-04-f14", "statement": "インドでは国民の約8割がヒンドゥー教を信仰している。", "printed_pages": [9]},
    {"id": "geo-04-f15", "statement": "ペルシャ湾沿岸には産油国が集中し多くがOPECに加盟する。中央アジアにはクロムなどのレアメタル産地が多く、西・中央アジアではイスラム教が広く信仰される。", "printed_pages": [9]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-04_p008-009.jpg"
    left = root / "page_images/pages/page_008_geo-04_left.jpg"
    right = root / "page_images/pages/page_009_geo-04_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-04.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [8, 9]:
        raise ValueError("geo-04 printed page mapping must be p.8-9")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-04 原画像照合レポート", "",
        f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.8-9",
        f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_008_geo-04_left.jpg / page_009_geo-04_right.jpg",
        "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit4_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-04", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
