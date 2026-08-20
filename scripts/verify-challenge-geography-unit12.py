#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 12."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-12-f01", "statement": "関東平野の台地は火山灰が積もった赤土の関東ロームに覆われ、畑作が行われる。", "printed_pages": [24, 25]},
    {"id": "geo-12-f02", "statement": "利根川流域の平地では稲作、東京周辺の県では近郊農業、群馬県では高原野菜の抑制栽培が盛んである。", "printed_pages": [24]},
    {"id": "geo-12-f03", "statement": "京浜工業地帯は東京都・埼玉県・神奈川県に広がり、機械工業や印刷業が盛んである。", "printed_pages": [24]},
    {"id": "geo-12-f04", "statement": "京葉工業地域は千葉県の東京湾沿岸に広がり、鉄鋼業や化学工業が盛んである。", "printed_pages": [24]},
    {"id": "geo-12-f05", "statement": "北関東工業地域は茨城県・群馬県・栃木県に広がり、自動車や電気機械の製造が盛んである。", "printed_pages": [24]},
    {"id": "geo-12-f06", "statement": "東京には皇居、国会議事堂、最高裁判所、中央省庁などが集まり、再開発により都心回帰が進んでいる。", "printed_pages": [24]},
    {"id": "geo-12-f07", "statement": "都心への人口集中を分散するため、さいたま新都心、幕張新都心、多摩ニュータウンなどが建設された。", "printed_pages": [24]},
    {"id": "geo-12-f08", "statement": "東京大都市圏は三大都市圏の一つで、成田国際空港は千葉県成田市にある日本最大の貿易港である。", "printed_pages": [24]},
    {"id": "geo-12-f09", "statement": "東北地方では奥羽山脈以西は日本海側、以東は太平洋側の気候で、夏の冷たい北東風やませは冷害の原因になる。", "printed_pages": [25]},
    {"id": "geo-12-f10", "statement": "秋田・山形・宮城では稲作、岩手では畜産、青森・福島・山形では果実生産が盛んである。", "printed_pages": [25]},
    {"id": "geo-12-f11", "statement": "東北各県では伝統的工芸品の生産が盛んで、東北自動車道周辺にはIC工場などの工業団地がある。", "printed_pages": [25]},
    {"id": "geo-12-f12", "statement": "三陸海岸にはリアス海岸がみられ、仙台市は東北地方の地方中枢都市である。2011年3月11日に東日本大震災が発生した。", "printed_pages": [25]},
    {"id": "geo-12-f13", "statement": "北海道では明治以降の開拓で農業が発達し、石狩平野は稲作、十勝平野は大規模畑作、根釧台地は酪農が盛んである。", "printed_pages": [25]},
    {"id": "geo-12-f14", "statement": "根釧台地は濃霧などで農作物に不向きなため大規模酪農が発達し、寒さや雪に備えて二重窓やロードヒーティングを用いる。", "printed_pages": [25]},
    {"id": "geo-12-f15", "statement": "札幌市は北海道の中心都市で、北海道の都市名の多くはアイヌ語に由来し、流氷や知床などを観光資源として利用する。", "printed_pages": [25]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-12_p024-025.jpg"
    left = root / "page_images/pages/page_024_geo-12_left.jpg"
    right = root / "page_images/pages/page_025_geo-12_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-12.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [24, 25]:
        raise ValueError("geo-12 printed page mapping must be p.24-25")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-12 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.24-25", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_024_geo-12_left.jpg / page_025_geo-12_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit12_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-12", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
