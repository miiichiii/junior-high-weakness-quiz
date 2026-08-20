#!/usr/bin/env python3
"""Run the shared Challenge science structurizer for the second-year scan."""

from __future__ import annotations

import importlib.util
from pathlib import Path


SCRIPT = Path(__file__).with_name("structure-challenge-science-year1.py")
SPEC = importlib.util.spec_from_file_location("challenge_science_structurizer", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Cannot load shared structurizer: {SCRIPT}")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
MODULE.UNITS = [
    ("sci2-09", "電流の性質", 142, 143),
    ("sci2-10", "電力量と熱量、電流と電子", 144, 145),
    ("sci2-11", "電流と磁界", 146, 147),
    ("sci2-12", "物質の分解、原子・分子", 148, 149),
    ("sci2-13", "化学変化と物質の質量", 150, 151),
    ("sci2-14", "植物のからだのつくりとはたらき", 152, 153),
    ("sci2-15", "生物と細胞、消化と吸収", 154, 155),
    ("sci2-16", "血液の循環、からだのはたらき", 156, 157),
    ("sci2-17", "気象観測、空気中の水蒸気", 158, 159),
    ("sci2-18", "天気の変化", 160, 161),
]
MODULE.EXPECTED_STEM = "9-182年"
MODULE.LIBRARY_TITLE = "Challenge理科・2年"

if __name__ == "__main__":
    MODULE.main()
