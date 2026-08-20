#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 5."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-05-f01", "statement": "西ヨーロッパは、暖流の北大西洋海流と偏西風の影響で、高緯度でも比較的温暖である。", "printed_pages": [10]},
    {"id": "geo-05-f02", "statement": "イギリス、フランス北部、ドイツなどでは、小麦栽培と家畜飼育を組み合わせる混合農業が盛んである。", "printed_pages": [10]},
    {"id": "geo-05-f03", "statement": "地中海沿岸では、夏の乾燥に強いオリーブやぶどうを栽培する地中海式農業が盛んである。", "printed_pages": [10]},
    {"id": "geo-05-f04", "statement": "アルプス山脈周辺や北ヨーロッパでは低い平均気温を生かした酪農が盛んで、ノルウェーではフィヨルドが見られる。", "printed_pages": [10]},
    {"id": "geo-05-f05", "statement": "EUは加盟国間の経済的結びつきを強める組織で、2024年時点で27か国が加盟し、多くの国が共通通貨ユーロを使う。", "printed_pages": [10, 11]},
    {"id": "geo-05-f06", "statement": "イギリスは2020年2月にEUを離脱した。", "printed_pages": [10, 11]},
    {"id": "geo-05-f07", "statement": "ヨーロッパではキリスト教が広く信仰されている。", "printed_pages": [10]},
    {"id": "geo-05-f08", "statement": "フィヨルドは氷河によって削られてできた、複雑に入り組んだ入り江である。", "printed_pages": [11]},
    {"id": "geo-05-f09", "statement": "北アフリカにはサハラ砂漠が広がり、東部を世界最長のナイル川が流れる。原油産地も多い。", "printed_pages": [11]},
    {"id": "geo-05-f10", "statement": "ギニア湾沿岸のガーナやコートジボワールでは、プランテーションでカカオ豆を栽培する。", "printed_pages": [11]},
    {"id": "geo-05-f11", "statement": "ナイジェリアはアフリカ有数の産油国である。", "printed_pages": [11]},
    {"id": "geo-05-f12", "statement": "南アフリカには金、ダイヤモンド、レアメタルの産地が多い。南アフリカ共和国ではかつてアパルトヘイトが行われた。", "printed_pages": [11]},
    {"id": "geo-05-f13", "statement": "アフリカはヨーロッパ諸国の植民地支配を受け、多くの人々が奴隷として南北アメリカへ連行された。20世紀半ばに多くの国が独立した。", "printed_pages": [11]},
    {"id": "geo-05-f14", "statement": "植民地支配の影響で、現在も英語やフランス語などを公用語とするアフリカの国が多い。", "printed_pages": [11]},
    {"id": "geo-05-f15", "statement": "アフリカには特定の農産物や鉱産資源への輸出依存が見られ、人口増加に伴う食料不足、環境破壊、民族紛争なども課題である。", "printed_pages": [11]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-05_p010-011.jpg"
    left = root / "page_images/pages/page_010_geo-05_left.jpg"
    right = root / "page_images/pages/page_011_geo-05_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-05.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [10, 11]:
        raise ValueError("geo-05 printed page mapping must be p.10-11")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-05 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.10-11", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_010_geo-05_left.jpg / page_011_geo-05_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit5_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-05", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
