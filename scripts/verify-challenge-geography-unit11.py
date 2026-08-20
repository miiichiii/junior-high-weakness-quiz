#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 11."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-11-f01", "statement": "紀伊山地は日本有数の多雨地域で、志摩半島にはリアス海岸があり、琵琶湖は日本最大の湖で滋賀県面積の約6分の1を占める。近畿北部は日本海側、南部の大阪・兵庫は瀬戸内の気候である。", "printed_pages": [22]},
    {"id": "geo-11-f02", "statement": "兵庫県・奈良県・京都府では近郊農業、和歌山県ではみかん・うめなどの果樹栽培が盛んである。", "printed_pages": [22]},
    {"id": "geo-11-f03", "statement": "阪神工業地帯は大阪府・兵庫県を中心に広がり、戦後は臨海部に製鉄・石油化学の大工場、内陸部に電気機械などの中小工場ができた。", "printed_pages": [22, 23]},
    {"id": "geo-11-f04", "statement": "世界遺産がある奈良・京都では歴史的景観や文化財を保護し、建物の外観規制などを行っている。", "printed_pages": [22]},
    {"id": "geo-11-f05", "statement": "1960年代以降、大阪の千里・泉北などにニュータウンが造成され、埋め立てにより関西国際空港や神戸のポートアイランドが建設された。", "printed_pages": [22]},
    {"id": "geo-11-f06", "statement": "大阪大都市圏は大阪を中心に人や物の移動で強く結ばれた地域で、関西国際空港は泉州沖に開港した24時間離着陸可能な国際空港である。", "printed_pages": [22, 23]},
    {"id": "geo-11-f07", "statement": "北陸は冬の降雪が多く、越後平野などは水田単作地帯で、冬には輪島塗などの伝統工業・地場産業が発達した。", "printed_pages": [23]},
    {"id": "geo-11-f08", "statement": "中央高地は夏と冬の気温差が大きく、高原では野菜の抑制栽培が盛んである。", "printed_pages": [23]},
    {"id": "geo-11-f09", "statement": "諏訪湖周辺では精密機械や電気機械の生産が盛んである。", "printed_pages": [23]},
    {"id": "geo-11-f10", "statement": "東海は太平洋側の温暖な気候で、静岡県のみかん・茶、渥美半島の電照菊などが盛んである。", "printed_pages": [23]},
    {"id": "geo-11-f11", "statement": "中京工業地帯は製造品出荷額が全国で最も多く、名古屋港は日本有数の貿易港である。", "printed_pages": [23]},
    {"id": "geo-11-f12", "statement": "愛知県豊田市では自動車工業、三重県四日市市では石油化学工業が盛んである。", "printed_pages": [23]},
    {"id": "geo-11-f13", "statement": "東海工業地域では浜松市の楽器・オートバイ、富士市の紙・パルプ生産が盛んである。", "printed_pages": [23]},
    {"id": "geo-11-f14", "statement": "中部地方は北陸・中央高地・東海に分かれ、飛驒・木曽・赤石の三山脈には3000m級の山々が連なる日本アルプスがある。", "printed_pages": [23]},
    {"id": "geo-11-f15", "statement": "山梨県はぶどう・ももの主産地で、長野県は他県の出荷が少ない夏にレタスを多く出荷する。", "printed_pages": [23]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-11_p022-023.jpg"
    left = root / "page_images/pages/page_022_geo-11_left.jpg"
    right = root / "page_images/pages/page_023_geo-11_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-11.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [22, 23]:
        raise ValueError("geo-11 printed page mapping must be p.22-23")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-11 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.22-23", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_022_geo-11_left.jpg / page_023_geo-11_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit11_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-11", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
