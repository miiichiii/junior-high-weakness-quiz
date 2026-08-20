#!/usr/bin/env python3
"""Build a private, source-grounded library from Challenge geography scans.

The generated OCR is an index/draft. Page images remain the authority.
Source PDFs and generated page images must stay outside the public web app.
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
    ("geo-01", "世界の地域構成", 2, 3),
    ("geo-02", "日本の地域構成", 4, 5),
    ("geo-03", "世界の人々の生活と環境", 6, 7),
    ("geo-04", "アジア州", 8, 9),
    ("geo-05", "ヨーロッパ州・アフリカ州", 10, 11),
    ("geo-06", "南北アメリカ州・オセアニア州", 12, 13),
    ("geo-07", "地域調査の手法", 14, 15),
    ("geo-08", "世界から見た日本の自然・人口", 16, 17),
    ("geo-09", "世界と日本の資源・産業・結びつき", 18, 19),
    ("geo-10", "九州地方、中国・四国地方", 20, 21),
    ("geo-11", "近畿地方・中部地方", 22, 23),
    ("geo-12", "関東地方・東北地方・北海道地方", 24, 25),
]


def numeric_prefix(path: Path) -> int:
    match = re.match(r"(\d+)", unicodedata.normalize("NFKC", path.name))
    if not match:
        raise ValueError(f"PDF filename needs a numeric prefix: {path.name}")
    return int(match.group(1))


def find_source_pdfs(source_dir: Path) -> list[Path]:
    pdfs = sorted(source_dir.glob("*.pdf"), key=numeric_prefix)
    expected = [1, 2, 4, 7]
    found = [numeric_prefix(path) for path in pdfs]
    if found != expected:
        raise ValueError(f"Expected PDF prefixes {expected}, found {found}")
    return pdfs


def command_output(args: list[str]) -> str:
    result = subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.stdout


def pdf_page_count(pdf: Path) -> int:
    text = command_output(["pdfinfo", str(pdf)])
    match = re.search(r"^Pages:\s+(\d+)$", text, re.MULTILINE)
    if not match:
        raise ValueError(f"Could not read page count: {pdf}")
    return int(match.group(1))


def render_pdf(pdf: Path, destination: Path) -> list[Path]:
    prefix = destination / "render"
    subprocess.run(
        ["pdftoppm", "-jpeg", "-r", "72", "-jpegopt", "quality=94", str(pdf), str(prefix)],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return sorted(destination.glob("render-*.jpg"))


def clean_ocr(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def run_ocr(image_path: Path) -> str:
    result = subprocess.run(
        ["tesseract", str(image_path), "stdout", "-l", "jpn+eng", "--psm", "4"],
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return clean_ocr(result.stdout)


def candidate_lines(text: str, limit: int = 50) -> list[str]:
    skip = re.compile(r"^(\d{1,2}|地理|これが重要|ポイントチェック)$")
    seen: set[str] = set()
    rows: list[str] = []
    for raw in text.splitlines():
        line = raw.strip(" -|\t")
        normalized = re.sub(r"\s+", "", line)
        if len(normalized) < 4 or len(normalized) > 90 or skip.match(normalized):
            continue
        if normalized in seen:
            continue
        seen.add(normalized)
        rows.append(line)
        if len(rows) >= limit:
            break
    return rows


def figure_candidates(text: str) -> list[str]:
    marker = re.compile(r"(地図|図|表|グラフ|分布|割合|構成|標高|資料)")
    return [line for line in candidate_lines(text, 120) if marker.search(line)][:12]


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()

    source_dir = args.source_dir.expanduser().resolve()
    output = args.output_dir.expanduser().resolve()
    if output.exists():
        raise FileExistsError(f"Output already exists; refusing to overwrite: {output}")

    pdfs = find_source_pdfs(source_dir)
    counts = [pdf_page_count(pdf) for pdf in pdfs]
    if counts != [1, 2, 3, 6]:
        raise ValueError(f"Expected PDF page counts [1, 2, 3, 6], found {counts}")

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

    source_pages: list[tuple[Path, int, Path]] = []
    with tempfile.TemporaryDirectory(prefix="challenge-geo-") as temp_name:
        temp_root = Path(temp_name)
        for pdf_index, pdf in enumerate(pdfs, start=1):
            render_dir = temp_root / f"pdf-{pdf_index}"
            render_dir.mkdir()
            rendered = render_pdf(pdf, render_dir)
            if len(rendered) != counts[pdf_index - 1]:
                raise ValueError(f"Render count mismatch for {pdf.name}")
            for page_index, rendered_path in enumerate(rendered, start=1):
                source_pages.append((pdf, page_index, rendered_path))

        if len(source_pages) != len(UNITS):
            raise ValueError(f"Expected 12 spreads, found {len(source_pages)}")

        page_rows: list[dict[str, object]] = []
        spread_rows: list[dict[str, object]] = []
        jsonl_rows: list[dict[str, object]] = []
        section_rows: list[dict[str, object]] = []
        figure_rows: list[dict[str, object]] = []

        for unit_index, ((unit_id, title, first_page, last_page), source) in enumerate(zip(UNITS, source_pages), start=1):
            pdf, source_pdf_page, rendered_path = source
            spread_name = f"{unit_id}_p{first_page:03d}-{last_page:03d}.jpg"
            spread_dest = dirs["spreads"] / spread_name
            shutil.copy2(rendered_path, spread_dest)

            with Image.open(rendered_path) as spread:
                width, height = spread.size
                midpoint = width // 2
                crops = [spread.crop((0, 0, midpoint, height)), spread.crop((midpoint, 0, width, height))]

            unit_page_records: list[dict[str, object]] = []
            unit_ocr_parts: list[str] = []
            for side_index, (printed_page, side, crop) in enumerate(zip((first_page, last_page), ("left", "right"), crops), start=1):
                page_name = f"page_{printed_page:03d}_{unit_id}_{side}.jpg"
                page_dest = dirs["pages"] / page_name
                crop.save(page_dest, "JPEG", quality=94, optimize=True)

                ocr_image = crop.resize((crop.width * 2, crop.height * 2), Image.Resampling.LANCZOS)
                ocr_image = ImageOps.grayscale(ocr_image)
                ocr_image = ImageEnhance.Contrast(ocr_image).enhance(1.35)
                ocr_image = ocr_image.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=3))
                ocr_temp = temp_root / f"ocr_{unit_id}_{side}.png"
                ocr_image.save(ocr_temp, "PNG")
                text = run_ocr(ocr_temp)
                unit_ocr_parts.append(text)

                markdown_rel = f"pages/page_{printed_page:03d}.md"
                image_rel = f"page_images/pages/{page_name}"
                record = {
                    "unit_id": unit_id,
                    "unit_title": title,
                    "source_pdf": pdf.name,
                    "source_pdf_page": source_pdf_page,
                    "printed_page": printed_page,
                    "side": side,
                    "spread_image": f"page_images/spreads/{spread_name}",
                    "page_image": image_rel,
                    "markdown_path": markdown_rel,
                    "ocr_char_count": len(text),
                    "status": "ocr-provisional",
                    "text": text,
                }
                unit_page_records.append(record)
                jsonl_rows.append(record)
                page_rows.append({key: value for key, value in record.items() if key != "text"})

                page_md = "\n".join([
                    "---",
                    f"unit_id: {unit_id}",
                    f"printed_page: {printed_page}",
                    f"source_pdf_page: {source_pdf_page}",
                    f"page_image: ../{image_rel}",
                    "ocr_status: provisional",
                    "---",
                    "",
                    f"# {title} p.{printed_page}",
                    "",
                    f"![](../{image_rel})",
                    "",
                    "## OCR本文（未校正）",
                    "",
                    "```text",
                    text,
                    "```",
                    "",
                ])
                (output / markdown_rel).write_text(page_md, encoding="utf-8")

            combined_text = "\n\n".join(unit_ocr_parts)
            unit_md_rel = f"units/{unit_id}.md"
            unit_md = "\n".join([
                "---",
                f"unit_id: {unit_id}",
                f"title: {title}",
                f"printed_pages: {first_page}-{last_page}",
                f"spread_image: ../page_images/spreads/{spread_name}",
                "ocr_status: provisional",
                "---",
                "",
                f"# {unit_index}. {title}",
                "",
                f"![](../page_images/spreads/{spread_name})",
                "",
                "## 印刷ページ",
                "",
                f"- [p.{first_page}](../pages/page_{first_page:03d}.md)",
                f"- [p.{last_page}](../pages/page_{last_page:03d}.md)",
                "",
                "## OCR本文（未校正）",
                "",
                "```text",
                combined_text,
                "```",
                "",
            ])
            (output / unit_md_rel).write_text(unit_md, encoding="utf-8")

            facts_record = {
                "unit_id": unit_id,
                "unit_title": title,
                "printed_pages": [first_page, last_page],
                "status": "ocr-candidates-unverified",
                "authority": f"page_images/spreads/{spread_name}",
                "candidate_lines": candidate_lines(combined_text),
                "verified_facts": [],
            }
            write_json(dirs["facts"] / f"{unit_id}.json", facts_record)

            candidates = figure_candidates(combined_text)
            for candidate_index, caption in enumerate(candidates, start=1):
                figure_rows.append({
                    "figure_id": f"{unit_id}-candidate-{candidate_index:02d}",
                    "unit_id": unit_id,
                    "caption_ocr": caption,
                    "printed_pages": [first_page, last_page],
                    "spread_image": f"page_images/spreads/{spread_name}",
                    "status": "candidate; verify visually before reuse",
                })

            spread_rows.append({
                "unit_id": unit_id,
                "unit_title": title,
                "source_pdf": pdf.name,
                "source_pdf_page": source_pdf_page,
                "printed_pages": f"{first_page}-{last_page}",
                "spread_image": f"page_images/spreads/{spread_name}",
                "unit_markdown": unit_md_rel,
                "ocr_char_count": len(combined_text),
                "status": "ocr-provisional",
            })
            section_rows.append({
                "section_id": unit_id,
                "title": title,
                "start_printed_page": first_page,
                "end_printed_page": last_page,
                "markdown_path": unit_md_rel,
                "source_warning": "OCR is provisional; page image is authoritative",
            })

    page_fields = [
        "unit_id", "unit_title", "source_pdf", "source_pdf_page", "printed_page", "side",
        "spread_image", "page_image", "markdown_path", "ocr_char_count", "status",
    ]
    with (output / "page_map.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=page_fields)
        writer.writeheader()
        writer.writerows(page_rows)

    with (output / "spread_map.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(spread_rows[0].keys()))
        writer.writeheader()
        writer.writerows(spread_rows)

    with (output / "textbook_pages.jsonl").open("w", encoding="utf-8") as stream:
        for row in jsonl_rows:
            stream.write(json.dumps(row, ensure_ascii=False) + "\n")

    write_json(output / "textbook_sections.json", section_rows)
    write_json(output / "textbook_figures.json", figure_rows)

    section_index = [
        "# 地理単元索引", "", "| 単元 | 見出し | 印刷ページ | Markdown |", "|---|---|---:|---|",
    ]
    for row in section_rows:
        section_index.append(
            f"| {row['section_id']} | {row['title']} | {row['start_printed_page']}-{row['end_printed_page']} | [{row['section_id']}]({row['markdown_path']}) |"
        )
    (output / "sections_index.md").write_text("\n".join(section_index) + "\n", encoding="utf-8")

    figure_index = [
        "# 図表候補索引", "", "OCRによる候補です。作問前に必ず見開き画像で確認します。", "",
        "| ID | 単元 | OCR候補 | 画像 |", "|---|---|---|---|",
    ]
    for row in figure_rows:
        figure_index.append(
            f"| {row['figure_id']} | {row['unit_id']} | {str(row['caption_ocr']).replace('|', '｜')} | [{row['spread_image']}]({row['spread_image']}) |"
        )
    (output / "figures_index.md").write_text("\n".join(figure_index) + "\n", encoding="utf-8")

    manifest = {
        "name": "Challenge社会・地理 構造化データ",
        "entrypoint_for_ai": "AI_README.md",
        "source_directory": str(source_dir),
        "privacy": "private; do not copy PDFs, OCR text, or page images into the public app",
        "counts": {"source_pdfs": 4, "spreads": 12, "printed_pages": 24, "units": 12},
        "indexes": {
            "page_map": "page_map.csv",
            "spread_map": "spread_map.csv",
            "sections": "sections_index.md",
            "figures": "figures_index.md",
            "pages_jsonl": "textbook_pages.jsonl",
            "validation": "reports/validation_report.md",
        },
    }
    write_json(output / "ai_manifest.json", manifest)

    readme = """# AI向け参照ガイド: Challenge社会・地理

このライブラリは非公開の教材参照用です。

## 使用順序

1. `sections_index.md` で単元を特定する。
2. `facts/<unit_id>.json` のOCR候補を検索に使う。
3. 問題化する内容は必ず `page_images/spreads/` の原画像で確認する。

## 注意

- OCRは未校正であり、引用や正誤判定の根拠にしない。
- PDF、OCR全文、ページ画像、図表の切り出しは公開Webアプリへ入れない。
- `figure_crops/` は、必要な図表の範囲を目視確認した場合だけ使う。
"""
    (output / "AI_README.md").write_text(readme, encoding="utf-8")

    ocr_empty = [row["printed_page"] for row in page_rows if int(row["ocr_char_count"]) == 0]
    ocr_short = [row["printed_page"] for row in page_rows if int(row["ocr_char_count"]) < 80]
    counts_ok = (
        len(pdfs) == 4
        and len(spread_rows) == 12
        and len(page_rows) == 24
        and len(list(dirs["spreads"].glob("*.jpg"))) == 12
        and len(list(dirs["pages"].glob("*.jpg"))) == 24
        and len(list(dirs["markdown"].glob("*.md"))) == 24
        and len(list(dirs["units"].glob("*.md"))) == 12
        and len(list(dirs["facts"].glob("*.json"))) == 12
    )
    verdict = "WARNING" if counts_ok and not ocr_empty else "FAIL"
    validation = "\n".join([
        "# 構造化検証レポート", "", "## 総合判定", "", verdict, "",
        "## 件数", "", f"- 元PDF: {len(pdfs)} / 4", f"- 見開き: {len(spread_rows)} / 12",
        f"- 印刷ページ: {len(page_rows)} / 24", f"- 単元Markdown: {len(section_rows)} / 12",
        f"- ページ画像: {len(list(dirs['pages'].glob('*.jpg')))} / 24", f"- 件数判定: {'PASS' if counts_ok else 'FAIL'}", "",
        "## OCR", "", f"- 空ページ: {ocr_empty or 'なし'}", f"- 80文字未満: {ocr_short or 'なし'}",
        "- 判定: WARNING。OCRは検索用で、作問時は原画像を照合する。", "",
        "## ページ対応", "", "- geo-01 p.2-3 から geo-12 p.24-25 まで連続している。",
        "- PDF内ページと印刷ページは page_map.csv で別々に保持している。", "",
    ])
    (dirs["reports"] / "validation_report.md").write_text(validation, encoding="utf-8")

    print(json.dumps({"output": str(output), "verdict": verdict, "spreads": 12, "printed_pages": 24, "ocr_empty": ocr_empty}, ensure_ascii=False))


if __name__ == "__main__":
    main()
