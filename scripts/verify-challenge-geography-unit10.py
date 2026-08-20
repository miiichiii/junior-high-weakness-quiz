#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 10."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-10-f01", "statement": "九州には阿蘇山・桜島・雲仙岳などの火山があり、阿蘇山にはカルデラ、九州南部には火山灰などが積もったシラス台地が広がる。", "printed_pages": [20, 21]},
    {"id": "geo-10-f02", "statement": "筑紫平野では稲作、宮崎平野では促成栽培、沖縄ではさとうきび・パイナップル・マンゴー・花などの生産が盛んである。", "printed_pages": [20]},
    {"id": "geo-10-f03", "statement": "大分県では火山を温泉や地熱発電に利用し、八丁原など九州地方に地熱発電所が多い。梅雨から台風期に雨が多い。", "printed_pages": [20]},
    {"id": "geo-10-f04", "statement": "北九州工業地域は筑豊炭田の石炭を利用した鉄鋼業中心から、自動車・電子部品などの機械工業中心へ変化し、エネルギー革命後に地位が低下した。", "printed_pages": [20]},
    {"id": "geo-10-f05", "statement": "八代海沿岸では水俣病、北九州市では大気汚染・水質汚濁が深刻化したが、水俣市と北九州市は現在、環境モデル都市に選ばれている。", "printed_pages": [20]},
    {"id": "geo-10-f06", "statement": "沖縄県では観光業が盛んで、沖縄島の面積の約20％をアメリカ軍の軍事基地が占める。", "printed_pages": [20]},
    {"id": "geo-10-f07", "statement": "九州のIC工場は高速道路沿いや空港近くに多く立地する。", "printed_pages": [20]},
    {"id": "geo-10-f08", "statement": "中国山地はなだらかで四国山地はけわしく、瀬戸内海は古くから水上交通に利用されてきた。", "printed_pages": [21]},
    {"id": "geo-10-f09", "statement": "山陰は北西の季節風で冬の降水量が多く、瀬戸内は二つの山地にはさまれて年間降水量が少なく、南四国は南東の季節風で夏の降水量が多い。", "printed_pages": [21]},
    {"id": "geo-10-f10", "statement": "鳥取平野では日本なし、岡山平野ではぶどう・もも、高知平野では野菜の促成栽培、愛媛県では段々畑のみかん栽培が盛んである。", "printed_pages": [21]},
    {"id": "geo-10-f11", "statement": "広島湾ではかきやまだいの養殖が盛んである。", "printed_pages": [21]},
    {"id": "geo-10-f12", "statement": "瀬戸内工業地域は瀬戸内海の水運を利用し、塩田跡地や埋立地に形成され、倉敷市水島や周南市に石油化学コンビナートがある。", "printed_pages": [21]},
    {"id": "geo-10-f13", "statement": "本州四国連絡橋は児島・坂出、神戸・鳴門、尾道・今治の三ルートの総称で、瀬戸大橋・明石海峡大橋・大鳴門橋・しまなみ海道などを含む。", "printed_pages": [21]},
    {"id": "geo-10-f14", "statement": "中国山地の山間部や瀬戸内の離島では過疎が進むが、高速道路の開通で人口流出が減った地域もある。", "printed_pages": [21]},
    {"id": "geo-10-f15", "statement": "広島市は中国・四国地方の地方中枢都市である。", "printed_pages": [21]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-10_p020-021.jpg"
    left = root / "page_images/pages/page_020_geo-10_left.jpg"
    right = root / "page_images/pages/page_021_geo-10_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-10.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [20, 21]:
        raise ValueError("geo-10 printed page mapping must be p.20-21")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-10 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.20-21", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_020_geo-10_left.jpg / page_021_geo-10_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit10_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-10", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
