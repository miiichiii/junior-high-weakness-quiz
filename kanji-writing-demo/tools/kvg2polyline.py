#!/usr/bin/env python3
"""KanjiVG の筆順SVGを、プロトタイプ用の折れ線データ（0〜100グリッド）へ変換する。

使い方:
  1. KanjiVG の SVG を用意する（npm の @madcat/kanjivg パッケージ
     package/dist/main/ 内、または https://kanjivg.tagaini.net/）。
     ファイル名は Unicode コードポイント5桁の16進（例: 失 = 05931.svg）。
  2. python3 kvg2polyline.py <svgディレクトリ> 失 不 夫 ...
     で index.html の KANJI 配列に貼れる strokes:[...] を出力する。

字形・筆順データの出典: KanjiVG © Ulrich Apel (CC BY-SA 3.0)
"""
import json
import math
import re
import sys


def parse_path(d):
    """SVGパス（M/m, C/c, S/s, L/l 対応）を3次ベジェ区間のリストにする。"""
    tokens = re.findall(r'([MmCcSsLl])([^MmCcSsLl]*)', d)
    cur = (0.0, 0.0)
    segs = []
    prev_c2 = None
    for cmd, argstr in tokens:
        nums = [float(v) for v in re.findall(r'-?\d*\.?\d+(?:e-?\d+)?', argstr)]
        rel = cmd.islower()
        c = cmd.upper()
        i = 0
        while i < len(nums):
            if c == 'M':
                x, y = nums[i], nums[i + 1]
                if rel:
                    x += cur[0]; y += cur[1]
                cur = (x, y)
                prev_c2 = None
                i += 2
                c = 'L'  # 後続の暗黙座標は lineto 扱い
            elif c == 'L':
                x, y = nums[i], nums[i + 1]
                if rel:
                    x += cur[0]; y += cur[1]
                p0, p3 = cur, (x, y)
                p1 = (p0[0] + (p3[0] - p0[0]) / 3, p0[1] + (p3[1] - p0[1]) / 3)
                p2 = (p0[0] + 2 * (p3[0] - p0[0]) / 3, p0[1] + 2 * (p3[1] - p0[1]) / 3)
                segs.append((p0, p1, p2, p3))
                cur = p3
                prev_c2 = None
                i += 2
            elif c == 'C':
                x1, y1, x2, y2, x, y = nums[i:i + 6]
                if rel:
                    x1 += cur[0]; y1 += cur[1]; x2 += cur[0]; y2 += cur[1]
                    x += cur[0]; y += cur[1]
                segs.append((cur, (x1, y1), (x2, y2), (x, y)))
                prev_c2 = (x2, y2)
                cur = (x, y)
                i += 6
            elif c == 'S':
                x2, y2, x, y = nums[i:i + 4]
                if rel:
                    x2 += cur[0]; y2 += cur[1]; x += cur[0]; y += cur[1]
                if prev_c2:
                    x1, y1 = 2 * cur[0] - prev_c2[0], 2 * cur[1] - prev_c2[1]
                else:
                    x1, y1 = cur
                segs.append((cur, (x1, y1), (x2, y2), (x, y)))
                prev_c2 = (x2, y2)
                cur = (x, y)
                i += 4
            else:
                break
    return segs


def bez(p, t):
    mt = 1 - t
    return (mt ** 3 * p[0][0] + 3 * mt * mt * t * p[1][0] + 3 * mt * t * t * p[2][0] + t ** 3 * p[3][0],
            mt ** 3 * p[0][1] + 3 * mt * mt * t * p[1][1] + 3 * mt * t * t * p[2][1] + t ** 3 * p[3][1])


def stroke_to_polyline(d, target_spacing=4.5):
    """1画ぶんのパスを、弧長でほぼ等間隔（109座標系で約4.5）の折れ線へ。"""
    segs = parse_path(d)
    pts = []
    for s in segs:
        for k in range(24):
            pts.append(bez(s, k / 24))
    pts.append(segs[-1][3])

    def dist(a, b):
        return math.hypot(a[0] - b[0], a[1] - b[1])

    total = sum(dist(pts[i - 1], pts[i]) for i in range(1, len(pts)))
    n = max(2, min(16, round(total / target_spacing) + 1))
    step = total / (n - 1)
    out = [pts[0]]
    acc, prev, i = 0.0, pts[0], 1
    while len(out) < n - 1 and i < len(pts):
        d2 = dist(prev, pts[i])
        if acc + d2 >= step and d2 > 0:
            t = (step - acc) / d2
            q = (prev[0] + (pts[i][0] - prev[0]) * t, prev[1] + (pts[i][1] - prev[1]) * t)
            out.append(q)
            prev, acc = q, 0.0
        else:
            acc += d2
            prev = pts[i]
            i += 1
    out.append(pts[-1])
    # KanjiVG は 109x109 → 0〜100 に正規化
    return [[round(x * 100 / 109, 1), round(y * 100 / 109, 1)] for x, y in out]


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    base = sys.argv[1]
    for char in sys.argv[2:]:
        code = f'{ord(char):05x}'
        svg = open(f'{base}/{code}.svg').read()
        ds = re.findall(r'<path[^>]*\bd="(M[^"]+)"', svg)
        strokes = [stroke_to_polyline(d) for d in ds]
        lines = ',\n     '.join(json.dumps(s, separators=(',', ',')) for s in strokes)
        print(f'  /* {char} ({code}, {len(strokes)}画) */')
        print(f'   strokes:[\n     {lines},\n   ],\n')


if __name__ == '__main__':
    main()
