#!/usr/bin/env python3
"""Structure the private Challenge first-year science scan for source-grounded authoring."""

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
    ("sci1-01", "光と音", 126, 127),
    ("sci1-02", "力のはたらき", 128, 129),
    ("sci1-03", "物質の区別、水溶液の性質", 130, 131),
    ("sci1-04", "物質の状態変化、気体の性質", 132, 133),
    ("sci1-05", "植物のなかま", 134, 135),
    ("sci1-06", "動物のなかま", 136, 137),
    ("sci1-07", "火山と地震", 138, 139),
    ("sci1-08", "大地の変化", 140, 141),
]
EXPECTED_STEM = "1-8"
LIBRARY_TITLE = "Challenge理科・1年"


def run(args: list[str], *, text: bool = True) -> str:
    result = subprocess.run(args, check=True, text=text, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.stdout if text else ""


def page_count(pdf: Path) -> int:
    match = re.search(r"^Pages:\s+(\d+)$", run(["pdfinfo", str(pdf)]), re.MULTILINE)
    if not match:
        raise ValueError(f"PDF page count unavailable: {pdf}")
    return int(match.group(1))


def clean(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).replace("\r\n", "\n").replace("\r", "\n")
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+", " ", text)).strip()


def ocr(image: Image.Image, temp_path: Path) -> str:
    prepared = image.resize((image.width * 3 // 2, image.height * 3 // 2), Image.Resampling.LANCZOS)
    prepared = ImageOps.grayscale(prepared)
    prepared = ImageEnhance.Contrast(prepared).enhance(1.35)
    prepared = prepared.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=3))
    prepared.save(temp_path, "PNG")
    return clean(run(["tesseract", str(temp_path), "stdout", "-l", "jpn+eng", "--psm", "4"]))


def candidate_lines(text: str, limit: int = 90) -> list[str]:
    skip = re.compile(r"^(\d{1,3}|理科|これが重要|ポイントチェック)$")
    seen: set[str] = set()
    result: list[str] = []
    for raw in text.splitlines():
        line = raw.strip(" -|\t")
        key = re.sub(r"\s+", "", line)
        if len(key) < 4 or len(key) > 120 or skip.match(key) or key in seen:
            continue
        seen.add(key)
        result.append(line)
        if len(result) >= limit:
            break
    return result


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    source_dir = args.source_dir.expanduser().resolve()
    output = args.output_dir.expanduser().resolve()
    pdfs = sorted(source_dir.glob("*.pdf"))
    if len(pdfs) != 1 or re.sub(r"\s+", "", unicodedata.normalize("NFKC", pdfs[0].stem)) != EXPECTED_STEM:
        raise ValueError(f"Expected exactly {EXPECTED_STEM}.pdf: {[path.name for path in pdfs]}")
    if output.exists():
        raise FileExistsError(f"Refusing to overwrite existing library: {output}")
    pdf = pdfs[0]
    expected_spreads = len(UNITS)
    expected_pages = expected_spreads * 2
    if page_count(pdf) != expected_spreads:
        raise ValueError(f"Expected {expected_spreads} scanned spreads")

    dirs = {name: output / relative for name, relative in {
        "spreads": "page_images/spreads", "pages": "page_images/pages", "markdown": "pages",
        "units": "units", "facts": "facts", "figures": "figure_crops", "reports": "reports",
    }.items()}
    for directory in dirs.values():
        directory.mkdir(parents=True, exist_ok=True)

    page_rows: list[dict[str, object]] = []
    spread_rows: list[dict[str, object]] = []
    jsonl_rows: list[dict[str, object]] = []
    sections: list[dict[str, object]] = []
    figures: list[dict[str, object]] = []
    with tempfile.TemporaryDirectory(prefix="challenge-science1-") as temp_name:
        temp = Path(temp_name)
        run(["pdftoppm", "-jpeg", "-r", "72", "-jpegopt", "quality=94", str(pdf), str(temp / "render")])
        rendered = sorted(temp.glob("render-*.jpg"))
        if len(rendered) != expected_spreads:
            raise ValueError(f"Expected {expected_spreads} rendered spreads, got {len(rendered)}")
        for pdf_page, (spec, source_image) in enumerate(zip(UNITS, rendered), start=1):
            unit_id, title, first_page, last_page = spec
            spread_name = f"{unit_id}_p{first_page:03d}-{last_page:03d}.jpg"
            shutil.copy2(source_image, dirs["spreads"] / spread_name)
            with Image.open(source_image) as spread:
                midpoint = spread.width // 2
                page_images = [spread.crop((0, 0, midpoint, spread.height)), spread.crop((midpoint, 0, spread.width, spread.height))]
            texts: list[str] = []
            for printed_page, side, page_image in zip((first_page, last_page), ("left", "right"), page_images):
                page_name = f"page_{printed_page:03d}_{unit_id}_{side}.jpg"
                page_image.save(dirs["pages"] / page_name, "JPEG", quality=94, optimize=True)
                text = ocr(page_image, temp / f"ocr_{printed_page}.png")
                texts.append(text)
                record = {
                    "unit_id": unit_id, "unit_title": title, "source_pdf": pdf.name,
                    "source_pdf_page": pdf_page, "printed_page": printed_page, "side": side,
                    "spread_image": f"page_images/spreads/{spread_name}",
                    "page_image": f"page_images/pages/{page_name}",
                    "markdown_path": f"pages/page_{printed_page:03d}.md", "ocr_char_count": len(text),
                    "status": "ocr-provisional", "text": text,
                }
                page_rows.append({key: value for key, value in record.items() if key != "text"})
                jsonl_rows.append(record)
                (output / record["markdown_path"]).write_text("\n".join([
                    "---", f"unit_id: {unit_id}", f"printed_page: {printed_page}",
                    f"source_pdf_page: {pdf_page}", f"page_image: ../{record['page_image']}",
                    "ocr_status: provisional", "---", "", f"# {title} p.{printed_page}", "",
                    f"![](../{record['page_image']})", "", "## OCR本文（未校正）", "", "```text", text, "```", "",
                ]), encoding="utf-8")
            combined = "\n\n".join(texts)
            unit_path = f"units/{unit_id}.md"
            (output / unit_path).write_text("\n".join([
                "---", f"unit_id: {unit_id}", f"title: {title}", f"printed_pages: {first_page}-{last_page}",
                f"spread_image: ../page_images/spreads/{spread_name}", "ocr_status: provisional", "---", "",
                f"# {int(unit_id[-2:])}. {title}", "", f"![](../page_images/spreads/{spread_name})", "",
                "## 印刷ページ", "", f"- [p.{first_page}](../pages/page_{first_page:03d}.md)",
                f"- [p.{last_page}](../pages/page_{last_page:03d}.md)", "", "## OCR本文（未校正）", "",
                "```text", combined, "```", "",
            ]), encoding="utf-8")
            write_json(dirs["facts"] / f"{unit_id}.json", {
                "unit_id": unit_id, "unit_title": title, "printed_pages": [first_page, last_page],
                "status": "ocr-candidates-unverified", "authority": f"page_images/spreads/{spread_name}",
                "candidate_lines": candidate_lines(combined), "verified_facts": [],
            })
            for index, line in enumerate([line for line in candidate_lines(combined, 160) if re.search(r"図|表|グラフ|実験|観察|変化|関係|分類", line)][:16], start=1):
                figures.append({"figure_id": f"{unit_id}-candidate-{index:02d}", "unit_id": unit_id,
                    "caption_ocr": line, "printed_pages": [first_page, last_page],
                    "spread_image": f"page_images/spreads/{spread_name}", "status": "candidate; verify visually"})
            spread_rows.append({"unit_id": unit_id, "unit_title": title, "source_pdf": pdf.name,
                "source_pdf_page": pdf_page, "printed_pages": f"{first_page}-{last_page}",
                "spread_image": f"page_images/spreads/{spread_name}", "unit_markdown": unit_path,
                "ocr_char_count": len(combined), "status": "ocr-provisional"})
            sections.append({"section_id": unit_id, "title": title, "start_printed_page": first_page,
                "end_printed_page": last_page, "markdown_path": unit_path,
                "source_warning": "OCR is provisional; page image is authoritative"})

    page_fields = [key for key in page_rows[0]]
    for name, rows in (("page_map.csv", page_rows), ("spread_map.csv", spread_rows)):
        with (output / name).open("w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=list(rows[0])); writer.writeheader(); writer.writerows(rows)
    with (output / "textbook_pages.jsonl").open("w", encoding="utf-8") as stream:
        for row in jsonl_rows:
            stream.write(json.dumps(row, ensure_ascii=False) + "\n")
    write_json(output / "textbook_sections.json", sections)
    write_json(output / "textbook_figures.json", figures)
    index_lines = [f"# {LIBRARY_TITLE} 単元索引", "", "| 単元 | 見出し | 印刷ページ | Markdown |", "|---|---|---:|---|"]
    index_lines += [f"| {row['section_id']} | {row['title']} | {row['start_printed_page']}-{row['end_printed_page']} | [{row['section_id']}]({row['markdown_path']}) |" for row in sections]
    (output / "sections_index.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    figure_lines = ["# 図表候補索引", "", "OCR候補。作問前に見開き画像で確認する。", "", "| ID | 単元 | OCR候補 | 画像 |", "|---|---|---|---|"]
    figure_lines += [f"| {row['figure_id']} | {row['unit_id']} | {row['caption_ocr'].replace('|', '｜')} | [{row['spread_image']}]({row['spread_image']}) |" for row in figures]
    (output / "figures_index.md").write_text("\n".join(figure_lines) + "\n", encoding="utf-8")
    write_json(output / "ai_manifest.json", {"name": f"{LIBRARY_TITLE} 構造化データ", "entrypoint_for_ai": "AI_README.md",
        "source_directory": str(source_dir), "privacy": "private; do not publish PDFs, OCR or page images",
        "counts": {"source_pdfs": 1, "spreads": expected_spreads, "printed_pages": expected_pages, "units": expected_spreads},
        "indexes": {"page_map": "page_map.csv", "sections": "sections_index.md", "figures": "figures_index.md", "validation": "reports/validation_report.md"}})
    (output / "AI_README.md").write_text(f"""# AI向け参照ガイド: {LIBRARY_TITLE}

1. `sections_index.md` で単元を特定する。
2. OCRは検索補助だけに使い、正誤・数値・実験条件は `page_images/spreads/` の原画像で確認する。
3. 公開問題は根拠事項から新しく作り、教材の設問・文章・図版を転載しない。
""", encoding="utf-8")
    empty = [row["printed_page"] for row in page_rows if int(row["ocr_char_count"]) == 0]
    counts_ok = len(spread_rows) == expected_spreads and len(page_rows) == expected_pages and all(len(list(dirs[key].glob(pattern))) == expected for key, pattern, expected in (("spreads", "*.jpg", expected_spreads), ("pages", "*.jpg", expected_pages), ("markdown", "*.md", expected_pages), ("units", "*.md", expected_spreads), ("facts", "*.json", expected_spreads)))
    verdict = "WARNING" if counts_ok and not empty else "FAIL"
    (dirs["reports"] / "validation_report.md").write_text("\n".join([
        "# 構造化検証レポート", "", "## 総合判定", "", verdict, "", "## 件数", "",
        f"- 見開き: {len(spread_rows)} / {expected_spreads}", f"- 印刷ページ: {len(page_rows)} / {expected_pages}", f"- 単元: {len(sections)} / {expected_spreads}",
        f"- 空OCR: {empty or 'なし'}", "- OCRは検索用。原画像を正本として作問時に照合する。", "",
        "## ページ対応", "", f"- {UNITS[0][0]} p.{UNITS[0][2]}-{UNITS[0][3]} から {UNITS[-1][0]} p.{UNITS[-1][2]}-{UNITS[-1][3]} まで連続。", "",
    ]), encoding="utf-8")
    print(json.dumps({"output": str(output), "verdict": verdict, "spreads": expected_spreads, "printed_pages": expected_pages, "ocr_empty": empty}, ensure_ascii=False))


if __name__ == "__main__":
    main()
