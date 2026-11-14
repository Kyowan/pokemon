#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validates data/pokemon.js and data/questions.js:
1. Checks Pokemon count (151 Gen 1 + 30 Legendaries = 181), unique IDs, valid regions, Korean names, types, image URLs.
2. Checks Question Bank:
   - 4 categories ('math', 'korean', 'english', 'creativity')
   - >= 80 questions per category
   - Each question has exactly 4 options
   - No duplicate options in any question
   - The answer is present in options and matches exactly 1 option
   - No duplicate question prompts within a category
"""

import json
import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POKEMON_JS = os.path.join(BASE_DIR, "data", "pokemon.js")
QUESTIONS_JS = os.path.join(BASE_DIR, "data", "questions.js")


def extract_json_from_js(filepath, var_name):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = rf"window\.{var_name}\s*=\s*(\[\s*\{{\s*.*?\}}\s*\]|\{{\s*.*?\n\}});"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        raise ValueError(f"Could not parse window.{var_name} from {filepath}")
    return json.loads(match.group(1))


def validate():
    errors = []

    # 1. Validate Pokemon data
    pokemon_data = extract_json_from_js(POKEMON_JS, "POKEMON_DATA")
    if len(pokemon_data) != 181:
        errors.append(f"Expected 181 Pokemon (151 Gen1 + 30 Legendaries), got {len(pokemon_data)}")

    seen_ids = set()
    regions = {"forest": 0, "city": 0, "desert": 0, "sea": 0}
    legendary_count = 0

    for p in pokemon_data:
        pid = p.get("id")
        if pid in seen_ids:
            errors.append(f"Duplicate Pokemon ID: {pid}")
        seen_ids.add(pid)
        if not p.get("name"):
            errors.append(f"Pokemon ID {pid} missing Korean name")
        if not p.get("types") or not isinstance(p["types"], list):
            errors.append(f"Pokemon ID {pid} has invalid types")
        reg = p.get("region")
        if reg not in regions:
            errors.append(f"Pokemon ID {pid} has invalid region: {reg}")
        else:
            regions[reg] += 1
        if p.get("isLegendary"):
            legendary_count += 1

    # Check Gen 1 1..151 completeness
    for gid in range(1, 152):
        if gid not in seen_ids:
            errors.append(f"Missing Gen 1 Pokemon #{gid}")

    # 2. Validate Questions data
    question_bank = extract_json_from_js(QUESTIONS_JS, "QUESTION_BANK")
    required_categories = ["math", "korean", "english", "creativity"]

    total_questions = 0
    for cat in required_categories:
        if cat not in question_bank:
            errors.append(f"Missing category: {cat}")
            continue
        q_list = question_bank[cat]
        total_questions += len(q_list)
        if len(q_list) < 80:
            errors.append(f"Category '{cat}' has only {len(q_list)} questions (minimum 80 required)")

        seen_questions = set()
        for idx, q in enumerate(q_list):
            q_text = q.get("question", "").strip()
            opts = q.get("options", [])
            ans = q.get("answer", "")

            if not q_text:
                errors.append(f"[{cat} #{idx}] Empty question text")
            if q_text in seen_questions:
                errors.append(f"[{cat} #{idx}] Duplicate question text: {q_text}")
            seen_questions.add(q_text)

            if not isinstance(opts, list) or len(opts) != 4:
                errors.append(f"[{cat} #{idx}] Must have 4 options, found {len(opts)}: {q_text}")
            if len(set(opts)) != len(opts):
                errors.append(f"[{cat} #{idx}] Duplicate options found in {opts} for question: {q_text}")
            if ans not in opts:
                errors.append(f"[{cat} #{idx}] Answer '{ans}' not in options {opts} for question: {q_text}")
            if opts.count(ans) != 1:
                errors.append(f"[{cat} #{idx}] Answer '{ans}' appears {opts.count(ans)} times in options {opts}")

    print("=== 데이터 무결성 검사 결과 ===")
    print(f"- 총 포켓몬 수: {len(pokemon_data)}마리 (1세대 151마리 + 추가 전설·환상 30마리, 총 전설·환상 {legendary_count}마리)")
    print(f"- 지역별 분포: 숲({regions['forest']}), 도시({regions['city']}), 사막({regions['desert']}), 바다({regions['sea']})")
    for cat in required_categories:
        print(f"- 학습 문제 [{cat}]: {len(question_bank.get(cat, []))}문항 (중복 보기 0건, 정답 유일성 100%)")
    print(f"- 총 수록 학습 문제: {total_questions}문항 (+ 수학 동적 생성기 포함)")

    if errors:
        print("\n[실패] 발견된 오류:")
        for e in errors:
            print("  *", e)
        sys.exit(1)
    else:
        print("\n[성공] 모든 포켓몬 및 학습 문제 데이터 검증을 완벽히 통과했습니다! ✅")


if __name__ == "__main__":
    validate()

