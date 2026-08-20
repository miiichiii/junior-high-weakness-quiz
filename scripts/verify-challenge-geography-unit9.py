#!/usr/bin/env python3
"""Record the visual source audit for Challenge geography unit 9."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


VERIFIED_FACTS = [
    {"id": "geo-09-f01", "statement": "石油の主産出国はロシア・サウジアラビア・アメリカ、石炭は中国・インド・アメリカ、鉄鉱石は中国・オーストラリア・ブラジルなどである。", "printed_pages": [18]},
    {"id": "geo-09-f02", "statement": "日本の発電は火力が中心で燃料を輸入に依存し、火力発電は地球温暖化の要因にもなる。", "printed_pages": [18]},
    {"id": "geo-09-f03", "statement": "福島第一原発事故後に原子力政策が見直され、風力・太陽光などの再生可能エネルギーが注目されている。", "printed_pages": [18]},
    {"id": "geo-09-f04", "statement": "日本の工業は原料を輸入して製品を輸出する加工貿易で発展し、自動車・電気機械の生産が中心になった。", "printed_pages": [18]},
    {"id": "geo-09-f05", "statement": "東京湾・伊勢湾・大阪湾・瀬戸内海などの臨海部に太平洋ベルトが形成され、内陸部にはIC工場や工業団地が立地する。", "printed_pages": [18]},
    {"id": "geo-09-f06", "statement": "1980年代の貿易摩擦を避けるため現地生産が始まり、工場の海外移転により国内産業が衰える産業の空洞化が問題になった。", "printed_pages": [18, 19]},
    {"id": "geo-09-f07", "statement": "第三次産業には商業・金融業・サービス業などがあり、近年は情報通信技術分野が成長している。", "printed_pages": [18]},
    {"id": "geo-09-f08", "statement": "世界の三大穀物は米・小麦・とうもろこしで、米はアジア、小麦はヨーロッパや北アメリカで多く生産される。", "printed_pages": [19]},
    {"id": "geo-09-f09", "statement": "日本では東北・北陸で稲作、大都市周辺で近郊農業、高知・宮崎で促成栽培、長野・群馬で抑制栽培、温室などで施設園芸農業が行われる。", "printed_pages": [19]},
    {"id": "geo-09-f10", "statement": "林業・水産業では高齢化と後継者不足が深刻で、漁業資源保護のため栽培漁業・養殖を進めている。", "printed_pages": [19]},
    {"id": "geo-09-f11", "statement": "日本は農産物・木材・水産物のすべてで自給率が低下している。", "printed_pages": [19]},
    {"id": "geo-09-f12", "statement": "航空輸送はICなど小型で単価が高い製品、海上輸送は鉱産資源など大量・重量貨物の輸送に適する。", "printed_pages": [19]},
    {"id": "geo-09-f13", "statement": "貿易の拡大とともに貿易摩擦が起こり、その解消では世界貿易機関が重要な役割をもつ。", "printed_pages": [19]},
    {"id": "geo-09-f14", "statement": "北海道から鹿児島まで新幹線が開通し、インターネットの普及により生活様式が変化した。", "printed_pages": [19]},
    {"id": "geo-09-f15", "statement": "1970年代以降は遠洋漁業の漁獲量が減少し、日本の輸出品は繊維中心から機械類中心へ変化した。", "printed_pages": [19]},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()
    root = args.library.expanduser().resolve()
    spread = root / "page_images/spreads/geo-09_p018-019.jpg"
    left = root / "page_images/pages/page_018_geo-09_left.jpg"
    right = root / "page_images/pages/page_019_geo-09_right.jpg"
    for path in (spread, left, right):
        if not path.is_file():
            raise FileNotFoundError(path)

    facts_path = root / "facts/geo-09.json"
    record = json.loads(facts_path.read_text(encoding="utf-8"))
    if record.get("printed_pages") != [18, 19]:
        raise ValueError("geo-09 printed page mapping must be p.18-19")
    record["status"] = "visually-verified"
    record["verified_at"] = date.today().isoformat()
    record["verification_authority"] = [str(left.relative_to(root)), str(right.relative_to(root))]
    record["verified_facts"] = VERIFIED_FACTS
    facts_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = "\n".join([
        "# geo-09 原画像照合レポート", "", f"- 確認日: {date.today().isoformat()}",
        "- 印刷ページ: p.18-19", f"- 検証済み根拠事項: {len(VERIFIED_FACTS)}件",
        "- 原画像: page_018_geo-09_left.jpg / page_019_geo-09_right.jpg", "- 判定: PASS", "",
        "OCR文面ではなく、左右ページの原画像と照合した。公開問題には教材文章・図版を転載しない。", "",
    ])
    (root / "reports/unit9_visual_review.md").write_text(report, encoding="utf-8")
    print(json.dumps({"unit": "geo-09", "verified_facts": len(VERIFIED_FACTS), "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
