#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 7."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-07-f01", "statement": "2万5千分の1地形図では地図上の1cmが実際の250m、5万分の1地形図では1cmが500mを表す。", "printed_pages": [14]},
    {"id": "geo-07-f02", "statement": "実際の距離は、地図上の長さに縮尺の分母を掛け、必要に応じて単位を換算して求める。", "printed_pages": [14]},
    {"id": "geo-07-f03", "statement": "特別な方位表示がない一般的な地形図では、地図の上が北を表す。", "printed_pages": [14]},
    {"id": "geo-07-f04", "statement": "水準点は高さを測量するときの基準、三角点は位置を三角測量するときの基準となる。", "printed_pages": [14]},
    {"id": "geo-07-f05", "statement": "等高線は同じ高さの地点を結ぶ。2万5千分の1地形図の主曲線は10mごと、計曲線は50mごとである。", "printed_pages": [14]},
    {"id": "geo-07-f06", "statement": "等高線の間隔が狭い場所は傾斜が急で、間隔が広い場所は傾斜が緩やかである。", "printed_pages": [14]},
    {"id": "geo-07-f07", "statement": "地図記号は土地利用、建物、境界などを表し、水田、工場、三角点、水準点などの記号がある。", "printed_pages": [14]},
    {"id": "geo-07-f08", "statement": "同じ大きさの紙では2万5千分の1地形図は5万分の1地形図より狭い範囲を詳しく表す。", "printed_pages": [14]},
    {"id": "geo-07-f09", "statement": "同じ地域の新旧地形図を比較すると、農地の減少、住宅地の造成、道路やトンネルの新設などを読み取れる。", "printed_pages": [15]},
    {"id": "geo-07-f10", "statement": "野外観察では、観察の順序や調査経路を書き込んだルートマップを用いる。", "printed_pages": [15]},
    {"id": "geo-07-f11", "statement": "野外観察では現地を歩き、景観や施設をスケッチ、メモ、写真などで記録する。", "printed_pages": [15]},
    {"id": "geo-07-f12", "statement": "聞き取り調査では詳しい人に直接会い、準備した質問用紙をもとに質問して回答を記録する。", "printed_pages": [15]},
    {"id": "geo-07-f13", "statement": "資料調査では図書館、市役所、インターネットなどで統計、写真、古地図を集め、グラフや主題図に加工する。", "printed_pages": [15]},
    {"id": "geo-07-f14", "statement": "地域調査はテーマと仮説を決め、資料を集め、結果と仮説を比べ、整理・発表・意見交換する。", "printed_pages": [15]},
    {"id": "geo-07-f15", "statement": "構成割合には円・帯グラフ、量の比較には棒グラフ、時間変化には折れ線グラフが適する。", "printed_pages": [15]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-07_p014-015.jpg"
    left = root / "page_images/pages/page_014_geo-07_left.jpg"
    right = root / "page_images/pages/page_015_geo-07_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-07.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [14, 15]:
        raise ValueError("geo-07 printed page mapping must be p.14-15")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-07 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.14-15", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_014_geo-07_left.jpg / page_015_geo-07_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit7_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-07", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
