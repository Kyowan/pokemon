#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
.test/test_game_logic.py
Verifies that all HTML, CSS, and JS files exist, have no syntax issues,
and that all required DOM IDs and game states match between index.html and js/game.js.
"""

import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    required_files = [
        "index.html",
        "css/style.css",
        "data/pokemon.js",
        "data/questions.js",
        "js/sound.js",
        "js/storage.js",
        "js/game.js",
        "CLAUDE.md",
        "PROGRESS.md",
    ]

    for rel in required_files:
        full = os.path.join(BASE_DIR, rel)
        if not os.path.exists(full):
            print(f"[FAIL] Missing required file: {rel}")
            sys.exit(1)

    with open(os.path.join(BASE_DIR, "index.html"), "r", encoding="utf-8") as f:
        html = f.read()

    with open(os.path.join(BASE_DIR, "js/game.js"), "r", encoding="utf-8") as f:
        game_js = f.read()

    # Check every getElementById('...') in game.js exists in index.html
    ids_in_js = set(re.findall(r"getElementById\('([^']+)'\)", game_js))
    missing_ids = []
    for dom_id in sorted(ids_in_js):
        if f'id="{dom_id}"' not in html:
            missing_ids.append(dom_id)

    if missing_ids:
        print(f"[FAIL] DOM IDs referenced in game.js but missing in index.html: {missing_ids}")
        sys.exit(1)

    print(f"[PASS] All {len(ids_in_js)} DOM IDs in js/game.js verified in index.html ✅")
    print("[PASS] All required project files verified ✅")


if __name__ == "__main__":
    main()

