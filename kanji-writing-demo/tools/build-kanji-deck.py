#!/usr/bin/env python3
"""夏休み漢字デッキ（data/kanji-summer-2026.js）を生成する。

入力:
  1. data/src/kanji-summer-2026-prompts.json — プリントから転記した100問
  2. KanjiVG の SVG ディレクトリ — npm パッケージ @madcat/kanjivg に同梱。
     取得方法（コミットしない、作業用ディレクトリで）:
       npm pack @madcat/kanjivg --pack-destination /tmp/kvg
       tar xzf /tmp/kvg/kanjivg-*.tgz -C /tmp/kvg
     SVG は /tmp/kvg/package/dist/main/<コードポイント5桁hex>.svg

使い方:
  python3 build-kanji-deck.py <svgディレクトリ> [出力先=data/kanji-summer-2026.js]

字形・筆順データの出典: KanjiVG © Ulrich Apel (CC BY-SA 3.0)
https://kanjivg.tagaini.net/
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kvg2polyline import stroke_to_polyline  # noqa: E402

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PROMPTS_PATH = os.path.join(REPO, 'data', 'src', 'kanji-summer-2026-prompts.json')
DEFAULT_OUT = os.path.join(REPO, 'data', 'kanji-summer-2026.js')

SCHEDULE = {
    'start': '2026-07-19',
    'end': '2026-08-31',
    'newPerDay': 4,
    'maxReviewsPerSession': 8,
    'reviewIntervals': [1, 3, 7],
    'masterySessions': 2,
}


def load_strokes(svg_dir, char):
    code = f'{ord(char):05x}'
    path = os.path.join(svg_dir, f'{code}.svg')
    svg = open(path, encoding='utf-8').read()
    ds = re.findall(r'<path[^>]*\bd="(M[^"]+)"', svg)
    if not ds:
        raise ValueError(f'{char}: no stroke paths in {path}')
    strokes = []
    for d in ds:
        poly = stroke_to_polyline(d)
        # 判定閾値(13〜27グリッド単位)に対し丸め誤差0.5は無視できるので整数化
        strokes.append([[round(x), round(y)] for x, y in poly])
    return strokes


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    svg_dir = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUT

    src = json.load(open(PROMPTS_PATH, encoding='utf-8'))
    prompts = src['prompts']

    # 学習順 = プリント初出順（sheet, item）
    order_of = {}
    for p in sorted(prompts, key=lambda p: (p['sheet'], p['item'])):
        order_of.setdefault(p['kanji'], len(order_of))

    entries = []
    for char, order in sorted(order_of.items(), key=lambda kv: kv[1]):
        strokes = load_strokes(svg_dir, char)
        if not (1 <= len(strokes) <= 24):
            raise ValueError(f'{char}: suspicious stroke count {len(strokes)}')
        kanji_prompts = [
            {k: p[k] for k in ('sheet', 'item', 'word', 'yomi', 'okurigana', 'sentence')}
            for p in sorted((p for p in prompts if p['kanji'] == char),
                            key=lambda p: (p['sheet'], p['item']))
        ]
        entries.append({'char': char, 'order': order, 'strokes': strokes,
                        'prompts': kanji_prompts})

    def js(obj):
        return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))

    lines = []
    lines.append('/* 夏休み 漢字マスター（4年生） 出題データ — 自動生成。直接編集しない。')
    lines.append(' * 再生成: kanji-writing-demo/tools/build-kanji-deck.py（手順はdocstring参照）')
    lines.append(' * 字形・筆順: KanjiVG © Ulrich Apel, CC BY-SA 3.0 (https://kanjivg.tagaini.net/) */')
    lines.append('window.KANJI_DECKS = window.KANJI_DECKS || {};')
    lines.append('window.KANJI_DECKS["kanji-summer-2026"] = {')
    lines.append('  id: "kanji-summer-2026",')
    lines.append(f'  title: {js(src["title"])},')
    lines.append('  childIds: ["child-3"],')
    lines.append(f'  sheets: {js(src["sheets"])},')
    lines.append(f'  schedule: {js(SCHEDULE)},')
    lines.append('  kanji: [')
    for e in entries:
        lines.append(f'    {{char:{js(e["char"])},order:{e["order"]},')
        lines.append(f'     strokes:{js(e["strokes"])},')
        lines.append(f'     prompts:{js(e["prompts"])}}},')
    lines.append('  ]')
    lines.append('};')

    out = '\n'.join(lines) + '\n'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(out)
    total_strokes = sum(len(e['strokes']) for e in entries)
    print(f'{out_path}: {len(entries)} kanji, {len(prompts)} prompts, '
          f'{total_strokes} strokes, {len(out)/1024:.0f} KB')


if __name__ == '__main__':
    main()
