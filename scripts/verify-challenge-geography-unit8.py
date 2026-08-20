#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 8."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-08-f01", "statement": "日本は環太平洋造山帯に位置し、火山が多く地震が頻繁に発生する。アルプス・ヒマラヤ造山帯も世界の代表的な造山帯である。", "printed_pages": [16]},
    {"id": "geo-08-f02", "statement": "日本は国土の約4分の3が山地で、河川は短く傾斜が急であり、山地の出口に扇状地、河口付近に三角州ができる。", "printed_pages": [16]},
    {"id": "geo-08-f03", "statement": "三陸海岸や志摩半島にはリアス海岸、九十九里浜には砂浜海岸が見られる。", "printed_pages": [16]},
    {"id": "geo-08-f04", "statement": "九州の西に広がる東シナ海には、水深200m程度までの緩やかな海底である大陸棚が広がる。", "printed_pages": [16]},
    {"id": "geo-08-f05", "statement": "日本最長の河川は信濃川、流域面積最大の河川は利根川、最大の平野は関東平野で、日本アルプスには3000m級の山々がある。", "printed_pages": [16]},
    {"id": "geo-08-f06", "statement": "フォッサマグナは日本列島を東西に分ける大地溝帯で、西端は糸魚川・静岡構造線である。", "printed_pages": [16]},
    {"id": "geo-08-f07", "statement": "日本の大部分は温帯で、北海道は冷帯、南西諸島は亜熱帯に属する。", "printed_pages": [16]},
    {"id": "geo-08-f08", "statement": "日本では全国で地震、太平洋側で台風、日本海側で大雪、東北地方で冷害、瀬戸内で干害などの自然災害が起こる。", "printed_pages": [16]},
    {"id": "geo-08-f09", "statement": "世界人口は2023年に約80億人で、その約6割がアジア州に住む。", "printed_pages": [17]},
    {"id": "geo-08-f10", "statement": "人口密度はアジアの稲作地域や北アメリカ・ヨーロッパの都市で高く、気候の厳しい砂漠・高山・寒冷地で低い。", "printed_pages": [17]},
    {"id": "geo-08-f11", "statement": "アジア・アフリカなどの発展途上国では人口爆発、先進工業国では少子高齢化や人口減少が課題になる。", "printed_pages": [17]},
    {"id": "geo-08-f12", "statement": "日本の人口は2023年に約1億2400万人で、少子高齢化と人口減少が進み、人口ピラミッドはつぼ型である。", "printed_pages": [17]},
    {"id": "geo-08-f13", "statement": "日本の人口は東京・大阪・名古屋の三大都市圏に集中し、東京大都市圏には日本人口の約4分の1が住む。", "printed_pages": [17]},
    {"id": "geo-08-f14", "statement": "京浜から北九州へ都市や工業地域が連なる太平洋ベルトでは過密問題が起こり、郊外にニュータウンも建設された。", "printed_pages": [17]},
    {"id": "geo-08-f15", "statement": "山間部、農村、離島では人口減少と高齢化による過疎が進み、住民の半数以上が65歳以上の限界集落も見られる。", "printed_pages": [17]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-08_p016-017.jpg"
    left = root / "page_images/pages/page_016_geo-08_left.jpg"
    right = root / "page_images/pages/page_017_geo-08_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-08.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [16, 17]:
        raise ValueError("geo-08 printed page mapping must be p.16-17")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-08 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.16-17", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_016_geo-08_left.jpg / page_017_geo-08_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit8_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-08", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
