#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 6."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-06-f01", "statement": "カナダの大部分は冷帯でタイガが広がる。アメリカ合衆国では西のロッキー山脈と東のアパラチア山脈の間にグレートプレーンズやプレーリーが広がる。", "printed_pages": [12]},
    {"id": "geo-06-f02", "statement": "北アメリカには先住民、ヨーロッパ系移民、奴隷として連行されたアフリカ系の人々などが暮らし、現在はヒスパニックも増えて多民族・多文化社会になっている。", "printed_pages": [12]},
    {"id": "geo-06-f03", "statement": "アメリカ合衆国では大型機械を使う企業的農業と適地適作により、小麦や牛肉などを安く大量生産し、世界へ輸出する。", "printed_pages": [12]},
    {"id": "geo-06-f04", "statement": "アメリカ合衆国では北緯37度以南のサンベルトで工業が発展した。", "printed_pages": [12, 13]},
    {"id": "geo-06-f05", "statement": "サンフランシスコ近郊のシリコンバレーには情報通信関連企業や研究所が集まり、ヒューストンでは航空宇宙産業が発達している。", "printed_pages": [12]},
    {"id": "geo-06-f06", "statement": "アメリカ合衆国の映画、ジャズやロックなどの音楽、ファストフードは世界中に広がっている。", "printed_pages": [12]},
    {"id": "geo-06-f07", "statement": "ヒスパニックはスペイン語を話すラテンアメリカ出身の移民で、アメリカ合衆国で人口割合が増えている。", "printed_pages": [13]},
    {"id": "geo-06-f08", "statement": "アマゾン川は流域面積が世界一で、流域に熱帯雨林が広がる。", "printed_pages": [13]},
    {"id": "geo-06-f09", "statement": "アンデス山脈周辺では標高差を利用した農業や鉱産資源の採掘が行われる。", "printed_pages": [13]},
    {"id": "geo-06-f10", "statement": "アマゾン川流域では熱帯雨林を伐採し、牧場、さとうきび畑、鉱山などを開発して自然環境の破壊が深刻化している。ブラジルでは工業化とコーヒー栽培も進む。", "printed_pages": [13]},
    {"id": "geo-06-f11", "statement": "アルゼンチンではパンパで牛の放牧や小麦栽培が盛んである。", "printed_pages": [13]},
    {"id": "geo-06-f12", "statement": "オセアニアの多くは島国で、さんご礁が見られる。オーストラリアは大陸全体を国土とする。", "printed_pages": [13]},
    {"id": "geo-06-f13", "statement": "オーストラリアの沿岸部は温帯、内陸部は乾燥しており、羊の放牧が盛んである。鉄鉱石や石炭は露天掘りで採掘される。", "printed_pages": [13]},
    {"id": "geo-06-f14", "statement": "オーストラリアは白豪主義から多文化社会を進める政策へ転換し、移民を受け入れ、先住民のアボリジニを保護している。", "printed_pages": [13]},
    {"id": "geo-06-f15", "statement": "オーストラリアへの移民は、ヨーロッパ州出身者の割合が低下し、アジア州出身者の割合が増加している。", "printed_pages": [13]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-06_p012-013.jpg"
    left = root / "page_images/pages/page_012_geo-06_left.jpg"
    right = root / "page_images/pages/page_013_geo-06_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-06.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [12, 13]:
        raise ValueError("geo-06 printed page mapping must be p.12-13")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-06 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.12-13", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_012_geo-06_left.jpg / page_013_geo-06_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit6_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-06", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
