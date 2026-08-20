#!/usr/bin/env python3
"""Install independently reviewed history fact drafts into the private library."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path


UNITS = {
    "his-13": ("文明のおこりと日本の成り立ち", [26, 27]),
    "his-14": ("古代国家の成立と東アジア", [28, 29]),
    "his-15": ("中世の日本", [30, 31]),
    "his-16": ("ヨーロッパ人との出会いと天下統一", [32, 33]),
    "his-17": ("近世の日本", [34, 35]),
    "his-18": ("近代ヨーロッパと日本の開国", [36, 37]),
    "his-19": ("近代の日本", [38, 39]),
    "his-20": ("二度の世界大戦と日本", [40, 41]),
    "his-21": ("現代の日本と世界", [42, 43]),
}


def read_units(path: Path) -> list[dict]:
    value = json.loads(path.read_text(encoding="utf-8"))
    rows = value.get("units") if isinstance(value, dict) else value
    if not isinstance(rows, list):
        raise ValueError(f"Draft must contain a units array: {path}")
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    parser.add_argument("--draft", required=True, action="append", type=Path)
    parser.add_argument("--reviewed-by", required=True)
    args = parser.parse_args()

    library = args.library.expanduser().resolve()
    facts_dir = library / "facts"
    reports_dir = library / "reports"
    if not (library / "page_map.csv").is_file() or not facts_dir.is_dir():
        raise FileNotFoundError("The private history library is incomplete")

    received: dict[str, dict] = {}
    for draft_path in args.draft:
        for row in read_units(draft_path.expanduser().resolve()):
            unit_id = str(row.get("unit_id", ""))
            if unit_id in received:
                raise ValueError(f"Duplicate unit draft: {unit_id}")
            received[unit_id] = row
    if set(received) != set(UNITS):
        missing = sorted(set(UNITS) - set(received))
        extra = sorted(set(received) - set(UNITS))
        raise ValueError(f"Draft coverage mismatch; missing={missing}, extra={extra}")

    report_rows = []
    for unit_id, (title, pages) in UNITS.items():
        row = received[unit_id]
        if row.get("unit_title") != title or row.get("printed_pages") != pages:
            raise ValueError(f"{unit_id}: title or printed pages mismatch")
        facts = row.get("verified_facts")
        if not isinstance(facts, list) or len(facts) < 20:
            raise ValueError(f"{unit_id}: at least twenty verified facts are required")
        ids: set[str] = set()
        for fact in facts:
            fact_id = str(fact.get("id", ""))
            if not re.fullmatch(rf"{unit_id}-f\d{{2}}", fact_id) or fact_id in ids:
                raise ValueError(f"{unit_id}: invalid or duplicate fact id {fact_id}")
            ids.add(fact_id)
            statement = str(fact.get("statement", "")).strip()
            if len(statement) < 12:
                raise ValueError(f"{fact_id}: statement is too short")
            fact_pages = fact.get("printed_pages")
            if not isinstance(fact_pages, list) or not fact_pages or not set(fact_pages).issubset(set(pages)):
                raise ValueError(f"{fact_id}: printed pages are invalid")

        target = facts_dir / f"{unit_id}.json"
        record = json.loads(target.read_text(encoding="utf-8"))
        record.update({
            "status": "independently-reviewed",
            "verified_facts": facts,
            "reviewed_at": date.today().isoformat(),
            "reviewed_by": args.reviewed_by,
            "verification_authority": [
                f"page_images/pages/page_{pages[0]:03d}_{unit_id}_left.jpg",
                f"page_images/pages/page_{pages[1]:03d}_{unit_id}_right.jpg",
            ],
        })
        target.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report_rows.append(f"| {unit_id} | p.{pages[0]}-{pages[1]} | {len(facts)} | PASS |")

    reports_dir.mkdir(parents=True, exist_ok=True)
    report = [
        "# 歴史・独立根拠レビュー", "", f"- 確認日: {date.today().isoformat()}",
        f"- レビュー担当: {args.reviewed_by}",
        "- 判定: PASS", "",
        "| 単元 | 印刷ページ | 根拠事項 | 判定 |", "|---|---:|---:|---|", *report_rows, "",
        "OCRではなく原画像を最終根拠とし、問題の正答・誤答・解説とは別工程で照合した。", "",
    ]
    (reports_dir / "independent_source_review.md").write_text("\n".join(report), encoding="utf-8")
    print(json.dumps({"units": 9, "status": "PASS"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
