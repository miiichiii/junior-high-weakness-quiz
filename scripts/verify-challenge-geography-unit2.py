#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 2."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-02-f01", "statement": "日本は東アジアに属する島国（海洋国）で、ユーラシア大陸にある中国・韓国の東に位置する。", "printed_pages": [4]},
    {"id": "geo-02-f02", "statement": "日本は東経約122度から約154度、北緯約20度から約46度の範囲に位置する。", "printed_pages": [4]},
    {"id": "geo-02-f03", "statement": "日本の東端は南鳥島、西端は与那国島、南端は沖ノ鳥島、北端は択捉島である。", "printed_pages": [4]},
    {"id": "geo-02-f04", "statement": "日本の国土は本州、北海道、九州、四国の4つの大きな島と多数の島からなる。", "printed_pages": [4]},
    {"id": "geo-02-f05", "statement": "国の領域は領土・領海・領空からなり、領海は領土の沿岸から一定範囲の海域、領空は領土と領海の上空である。", "printed_pages": [4]},
    {"id": "geo-02-f06", "statement": "経済水域は領海の外側で沿岸から200海里までの水域で、沿岸国が水産・鉱産資源を管理できる。船の航行や航空機の飛行などは自由である。", "printed_pages": [4, 5]},
    {"id": "geo-02-f07", "statement": "北方領土は択捉島、国後島、色丹島、歯舞群島からなり、現在はロシア連邦が占拠している。", "printed_pages": [4, 5]},
    {"id": "geo-02-f08", "statement": "標準時子午線は本初子午線を基準にほぼ経度15度ごとに設定され、日本は東経135度の経線を標準時子午線としている。", "printed_pages": [4]},
    {"id": "geo-02-f09", "statement": "経度15度ごとに1時間の時差が生じ、日付変更線を東から西へ越える場合は日付を1日早める。", "printed_pages": [4]},
    {"id": "geo-02-f10", "statement": "領海は沿岸から12海里以内の、国の主権がおよぶ海域である。", "printed_pages": [4, 5]},
    {"id": "geo-02-f11", "statement": "日本の都道府県は1都（東京都）、1道（北海道）、2府（大阪府・京都府）、43県からなる。", "printed_pages": [5]},
    {"id": "geo-02-f12", "statement": "都道府県の面積は北海道が最大で香川県が最小、人口は東京都が最多で鳥取県が最少である。", "printed_pages": [5]},
    {"id": "geo-02-f13", "statement": "最も多くの県と県境を接する県は長野県で、海に面しない内陸県は群馬、栃木、埼玉、山梨、長野、岐阜、滋賀、奈良の8県である。", "printed_pages": [5]},
    {"id": "geo-02-f14", "statement": "日本の代表的な地方区分は、北海道、東北、関東、中部、近畿、中国・四国、九州の7地方である。", "printed_pages": [5]},
    {"id": "geo-02-f15", "statement": "中部地方は東海・中央高地・北陸に、中国・四国地方は山陰・瀬戸内・南四国に分ける地域区分もある。", "printed_pages": [5]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-02_p004-005.jpg"
    left = root / "page_images/pages/page_004_geo-02_left.jpg"
    right = root / "page_images/pages/page_005_geo-02_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-02.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [4, 5]:
        raise ValueError("geo-02 printed page mapping must be p.4-5")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-02 原画像照合レポート", "",
        f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.4-5",
        f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_004_geo-02_left.jpg / page_005_geo-02_right.jpg",
        "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit2_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-02", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
