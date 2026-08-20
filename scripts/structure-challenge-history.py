#!/usr/bin/env python3
"""Build a private, source-grounded library from Challenge history scans.

The source PDF, rendered page images and OCR are private reference material.
They must never be copied to the public web application.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import subprocess
import tempfile
import unicodedata
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


UNITS = [
    ("his-13", "文明のおこりと日本の成り立ち", 26, 27),
    ("his-14", "古代国家の成立と東アジア", 28, 29),
    ("his-15", "中世の日本", 30, 31),
    ("his-16", "ヨーロッパ人との出会いと天下統一", 32, 33),
    ("his-17", "近世の日本", 34, 35),
    ("his-18", "近代ヨーロッパと日本の開国", 36, 37),
    ("his-19", "近代の日本", 38, 39),
    ("his-20", "二度の世界大戦と日本", 40, 41),
    ("his-21", "現代の日本と世界", 42, 43),
]


def normalized_name(path: Path) -> str:
    """Normalize full-width/Unicode whitespace so scan names remain portable."""
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", path.stem))


def find_source_pdf(source_dir: Path) -> Path:
    pdfs = sorted(path for path in source_dir.iterdir() if path.is_file() and path.suffix.lower() == ".pdf")
    if len(pdfs) != 1:
        raise ValueError(f"Expected exactly one history PDF, found {len(pdfs)}: {[p.name for p in pdfs]}")
    pdf = pdfs[0]
    if normalized_name(pdf) != "歴史13-21":
        raise ValueError(f"Expected 歴史 13-21.pdf (Unicode spaces accepted), found {pdf.name}")
    return pdf


def command_output(args: list[str]) -> str:
    result = subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.stdout


def pdf_page_count(pdf: Path) -> int:
    match = re.search(r"^Pages:\s+(\d+)$", command_output(["pdfinfo", str(pdf)]), re.MULTILINE)
    if not match:
        raise ValueError(f"Could not read page count: {pdf}")
    return int(match.group(1))


def render_pdf(pdf: Path, destination: Path) -> list[Path]:
    prefix = destination / "render"
    subprocess.run(
        ["pdftoppm", "-jpeg", "-r", "72", "-jpegopt", "quality=94", str(pdf), str(prefix)],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    return sorted(destination.glob("render-*.jpg"))


def clean_ocr(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).replace("\r\n", "\n").replace("\r", "\n")
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+", " ", text)).strip()


def run_ocr(image_path: Path) -> str:
    result = subprocess.run(
        ["tesseract", str(image_path), "stdout", "-l", "jpn+eng", "--psm", "4"],
        check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    return clean_ocr(result.stdout)


def candidate_lines(text: str, limit: int = 60) -> list[str]:
    skip = re.compile(r"^(\d{1,2}|歴史|これが重要|ポイントチェック)$")
    seen: set[str] = set()
    candidates: list[str] = []
    for raw in text.splitlines():
        line = raw.strip(" -|\t")
        compact = re.sub(r"\s+", "", line)
        if len(compact) < 4 or len(compact) > 100 or skip.match(compact) or compact in seen:
            continue
        seen.add(compact)
        candidates.append(line)
        if len(candidates) >= limit:
            break
    return candidates


def figure_candidates(text: str) -> list[str]:
    marker = re.compile(r"(地図|図|表|グラフ|年表|資料|絵画|写真|分布|年号)")
    return [line for line in candidate_lines(text, 140) if marker.search(line)][:14]


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Structure Challenge社会・歴史 scan pages into private AI reference data.")
    parser.add_argument("--source-dir", required=True, type=Path, help="Directory containing only 歴史 13-21.pdf")
    parser.add_argument("--output-dir", required=True, type=Path, help="New private destination directory")
    args = parser.parse_args()
    source_dir = args.source_dir.expanduser().resolve()
    output = args.output_dir.expanduser().resolve()
    if not source_dir.is_dir():
        raise NotADirectoryError(source_dir)
    if output.exists():
        raise FileExistsError(f"Output already exists; refusing to overwrite: {output}")

    pdf = find_source_pdf(source_dir)
    page_count = pdf_page_count(pdf)
    if page_count != len(UNITS):
        raise ValueError(f"Expected 9 PDF pages / spreads, found {page_count}")

    dirs = {
        "spreads": output / "page_images" / "spreads",
        "pages": output / "page_images" / "pages",
        "markdown": output / "pages",
        "units": output / "units",
        "facts": output / "facts",
        "figures": output / "figure_crops",
        "reports": output / "reports",
    }
    for directory in dirs.values():
        directory.mkdir(parents=True, exist_ok=True)

    page_rows: list[dict[str, object]] = []
    spread_rows: list[dict[str, object]] = []
    jsonl_rows: list[dict[str, object]] = []
    section_rows: list[dict[str, object]] = []
    figure_rows: list[dict[str, object]] = []
    with tempfile.TemporaryDirectory(prefix="challenge-history-") as temp_name:
        rendered = render_pdf(pdf, Path(temp_name))
        if len(rendered) != len(UNITS):
            raise ValueError(f"Render count mismatch: expected 9, found {len(rendered)}")
        for unit_number, ((unit_id, title, first_page, last_page), rendered_path) in enumerate(zip(UNITS, rendered), start=13):
            spread_name = f"{unit_id}_p{first_page:03d}-{last_page:03d}.jpg"
            spread_dest = dirs["spreads"] / spread_name
            shutil.copy2(rendered_path, spread_dest)
            with Image.open(rendered_path) as spread:
                width, height = spread.size
                midpoint = width // 2
                crops = [spread.crop((0, 0, midpoint, height)), spread.crop((midpoint, 0, width, height))]

            ocr_parts: list[str] = []
            for printed_page, side, crop in zip((first_page, last_page), ("left", "right"), crops):
                page_name = f"page_{printed_page:03d}_{unit_id}_{side}.jpg"
                page_dest = dirs["pages"] / page_name
                crop.save(page_dest, "JPEG", quality=94, optimize=True)
                ocr_image = crop.resize((crop.width * 2, crop.height * 2), Image.Resampling.LANCZOS)
                ocr_image = ImageOps.grayscale(ocr_image)
                ocr_image = ImageEnhance.Contrast(ocr_image).enhance(1.35)
                ocr_image = ocr_image.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=3))
                ocr_temp = Path(temp_name) / f"ocr_{unit_id}_{side}.png"
                ocr_image.save(ocr_temp, "PNG")
                text = run_ocr(ocr_temp)
                ocr_parts.append(text)
                markdown_rel = f"pages/page_{printed_page:03d}.md"
                image_rel = f"page_images/pages/{page_name}"
                record = {
                    "unit_id": unit_id, "unit_title": title, "source_pdf": pdf.name,
                    "source_pdf_page": unit_number - 12, "printed_page": printed_page, "side": side,
                    "spread_image": f"page_images/spreads/{spread_name}", "page_image": image_rel,
                    "markdown_path": markdown_rel, "ocr_char_count": len(text),
                    "status": "ocr-provisional", "text": text,
                }
                page_rows.append({key: value for key, value in record.items() if key != "text"})
                jsonl_rows.append(record)
                page_md = "\n".join([
                    "---", f"unit_id: {unit_id}", f"printed_page: {printed_page}",
                    f"source_pdf_page: {unit_number - 12}", f"page_image: ../{image_rel}",
                    "ocr_status: provisional", "---", "", f"# {title} p.{printed_page}", "",
                    f"![](../{image_rel})", "", "## OCR本文（未校正）", "", "```text", text, "```", "",
                ])
                (output / markdown_rel).write_text(page_md, encoding="utf-8")

            combined_text = "\n\n".join(ocr_parts)
            unit_md_rel = f"units/{unit_id}.md"
            unit_md = "\n".join([
                "---", f"unit_id: {unit_id}", f"title: {title}", f"printed_pages: {first_page}-{last_page}",
                f"spread_image: ../page_images/spreads/{spread_name}", "ocr_status: provisional", "---", "",
                f"# {unit_number}. {title}", "", f"![](../page_images/spreads/{spread_name})", "", "## 印刷ページ", "",
                f"- [p.{first_page}](../pages/page_{first_page:03d}.md)", f"- [p.{last_page}](../pages/page_{last_page:03d}.md)", "",
                "## OCR本文（未校正）", "", "```text", combined_text, "```", "",
            ])
            (output / unit_md_rel).write_text(unit_md, encoding="utf-8")
            write_json(dirs["facts"] / f"{unit_id}.json", {
                "unit_id": unit_id, "unit_title": title, "printed_pages": [first_page, last_page],
                "status": "ocr-candidates-unverified", "authority": f"page_images/spreads/{spread_name}",
                "candidate_lines": candidate_lines(combined_text), "verified_facts": [],
            })
            for index, caption in enumerate(figure_candidates(combined_text), start=1):
                figure_rows.append({
                    "figure_id": f"{unit_id}-candidate-{index:02d}", "unit_id": unit_id,
                    "caption_ocr": caption, "printed_pages": [first_page, last_page],
                    "spread_image": f"page_images/spreads/{spread_name}",
                    "status": "candidate; verify visually before reuse",
                })
            spread_rows.append({
                "unit_id": unit_id, "unit_title": title, "source_pdf": pdf.name,
                "source_pdf_page": unit_number - 12, "printed_pages": f"{first_page}-{last_page}",
                "spread_image": f"page_images/spreads/{spread_name}", "unit_markdown": unit_md_rel,
                "ocr_char_count": len(combined_text), "status": "ocr-provisional",
            })
            section_rows.append({
                "section_id": unit_id, "title": title, "start_printed_page": first_page,
                "end_printed_page": last_page, "markdown_path": unit_md_rel,
                "source_warning": "OCR is provisional; page image is authoritative",
            })

    page_fields = ["unit_id", "unit_title", "source_pdf", "source_pdf_page", "printed_page", "side", "spread_image", "page_image", "markdown_path", "ocr_char_count", "status"]
    with (output / "page_map.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=page_fields)
        writer.writeheader(); writer.writerows(page_rows)
    with (output / "spread_map.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(spread_rows[0]))
        writer.writeheader(); writer.writerows(spread_rows)
    with (output / "textbook_pages.jsonl").open("w", encoding="utf-8") as stream:
        for row in jsonl_rows:
            stream.write(json.dumps(row, ensure_ascii=False) + "\n")
    write_json(output / "textbook_sections.json", section_rows)
    write_json(output / "textbook_figures.json", figure_rows)

    sections_index = ["# 歴史単元索引", "", "| 単元 | 見出し | 印刷ページ | Markdown |", "|---|---|---:|---|"]
    sections_index.extend(f"| {row['section_id']} | {row['title']} | {row['start_printed_page']}-{row['end_printed_page']} | [{row['section_id']}]({row['markdown_path']}) |" for row in section_rows)
    (output / "sections_index.md").write_text("\n".join(sections_index) + "\n", encoding="utf-8")
    figures_index = ["# 図表候補索引", "", "OCRによる候補です。作問前に必ず見開き画像で確認します。", "", "| ID | 単元 | OCR候補 | 画像 |", "|---|---|---|---|"]
    figures_index.extend(f"| {row['figure_id']} | {row['unit_id']} | {str(row['caption_ocr']).replace('|', '｜')} | [{row['spread_image']}]({row['spread_image']}) |" for row in figure_rows)
    (output / "figures_index.md").write_text("\n".join(figures_index) + "\n", encoding="utf-8")

    write_json(output / "ai_manifest.json", {
        "name": "Challenge社会・歴史 構造化データ", "entrypoint_for_ai": "AI_README.md",
        "source_directory": str(source_dir), "privacy": "private; do not copy PDFs, OCR text, or page images into the public app",
        "counts": {"source_pdfs": 1, "spreads": 9, "printed_pages": 18, "units": 9},
        "indexes": {"page_map": "page_map.csv", "spread_map": "spread_map.csv", "sections": "sections_index.md", "figures": "figures_index.md", "pages_jsonl": "textbook_pages.jsonl", "validation": "reports/validation_report.md"},
    })
    (output / "AI_README.md").write_text("""# AI向け参照ガイド: Challenge社会・歴史

このライブラリは非公開の教材参照用です。

1. `sections_index.md` で単元を特定する。
2. `facts/<unit_id>.json` のOCR候補を検索に使う。
3. 問題化する内容は必ず `page_images/spreads/` の原画像で確認する。

- OCRは未校正であり、引用や正誤判定の根拠にしない。
- PDF、OCR全文、ページ画像、図表の切り出しは公開Webアプリへ入れない。
- `figure_crops/` は、必要な図表の範囲を目視確認した場合だけ使う。
""", encoding="utf-8")

    ocr_empty = [row["printed_page"] for row in page_rows if int(row["ocr_char_count"]) == 0]
    ocr_short = [row["printed_page"] for row in page_rows if int(row["ocr_char_count"]) < 80]
    counts_ok = (len(spread_rows) == 9 and len(page_rows) == 18 and len(list(dirs["spreads"].glob("*.jpg"))) == 9 and len(list(dirs["pages"].glob("*.jpg"))) == 18 and len(list(dirs["markdown"].glob("*.md"))) == 18 and len(list(dirs["units"].glob("*.md"))) == 9 and len(list(dirs["facts"].glob("*.json"))) == 9)
    verdict = "WARNING" if counts_ok and not ocr_empty else "FAIL"
    validation = "\n".join([
        "# 構造化検証レポート", "", "## 総合判定", "", verdict, "", "## 件数", "",
        "- 元PDF: 1 / 1", f"- 見開き: {len(spread_rows)} / 9", f"- 印刷ページ: {len(page_rows)} / 18", f"- 単元Markdown: {len(section_rows)} / 9", f"- ページ画像: {len(list(dirs['pages'].glob('*.jpg')))} / 18", f"- 件数判定: {'PASS' if counts_ok else 'FAIL'}", "",
        "## OCR", "", f"- 空ページ: {ocr_empty or 'なし'}", f"- 80文字未満: {ocr_short or 'なし'}", "- 判定: WARNING。OCRは検索用で、作問時は原画像を照合する。", "",
        "## ページ対応", "", "- his-13 p.26-27 から his-21 p.42-43 まで連続している。", "- PDF内ページと印刷ページは page_map.csv で別々に保持している。", "",
    ])
    (dirs["reports"] / "validation_report.md").write_text(validation, encoding="utf-8")
    print(json.dumps({"output": str(output), "verdict": verdict, "spreads": 9, "printed_pages": 18, "ocr_empty": ocr_empty}, ensure_ascii=False))


if __name__ == "__main__":
    main()
