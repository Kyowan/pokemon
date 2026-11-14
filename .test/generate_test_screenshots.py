#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates verification snapshot images (SVG & PNG) of the 5 core game states
inside .test/ for visual inspection and archival.
"""

import os
import subprocess

TEST_DIR = os.path.dirname(os.path.abspath(__file__))

SVGS = {
    "01_title_screen.svg": """<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#74b9ff"/>
      <stop offset="100%" stop-color="#ffeaa7"/>
    </linearGradient>
  </defs>
  <rect width="960" height="600" fill="url(#sky)"/>
  <rect x="0" y="0" width="960" height="56" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
  <text x="30" y="35" font-family="Apple SD Gothic Neo, sans-serif" font-size="18" font-weight="bold" fill="#2f3542">🏠 처음으로</text>
  <text x="480" y="35" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="18" font-weight="bold" fill="#2f3542">🌟 포켓몬 퀴즈 대모험</text>
  <text x="920" y="35" text-anchor="end" font-family="Apple SD Gothic Neo, sans-serif" font-size="18" font-weight="bold" fill="#2f3542">💮 출석 1일  |  📖 도감 2 / 181  |  🔊 소리 켜짐</text>
  <rect x="110" y="86" width="740" height="474" rx="24" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
  <text x="480" y="155" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="22" font-weight="bold" fill="#eb2f06">신나는 퀴즈 풀고 포켓몬 친구들을 모아요!</text>
  <text x="480" y="220" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="52" font-weight="900" fill="#ff4757" stroke="#2f3542" stroke-width="2">포켓몬 퀴즈 대모험!</text>
  <rect x="160" y="265" width="640" height="78" rx="16" fill="#fff9db" stroke="#2f3542" stroke-width="3"/>
  <text x="190" y="302" font-family="Apple SD Gothic Neo, sans-serif" font-size="20" font-weight="bold" fill="#d63031">💮 오늘의 출석 도장 완료!</text>
  <text x="190" y="328" font-family="Apple SD Gothic Neo, sans-serif" font-size="16" fill="#57606f">지금까지 총 1개의 출석 도장을 모았어요! [⚡] [·] [·] [·] [·] [·] [·]</text>
  <rect x="160" y="368" width="640" height="66" rx="18" fill="#ff4757" stroke="#2f3542" stroke-width="4"/>
  <text x="480" y="410" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="28" font-weight="bold" fill="#ffffff">🚀 모험 출발하기!</text>
  <rect x="160" y="452" width="310" height="58" rx="18" fill="#4bcffa" stroke="#2f3542" stroke-width="3.5"/>
  <text x="315" y="489" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="22" font-weight="bold" fill="#1e272e">📖 포켓몬 도감 (2 / 181)</text>
  <rect x="490" y="452" width="310" height="58" rx="18" fill="#ffd32a" stroke="#2f3542" stroke-width="3.5"/>
  <text x="645" y="489" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="22" font-weight="bold" fill="#1e272e">💮 모은 도장 보기 (1개)</text>
</svg>""",
    "02_field_exploration.svg": """<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
  <rect width="960" height="600" fill="#78e08f"/>
  <path d="M 60 350 C 320 180, 620 500, 900 280" stroke="#e6c280" stroke-width="54" fill="none" stroke-linecap="round"/>
  <rect x="24" y="20" width="640" height="44" rx="22" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>
  <text x="44" y="48" font-family="Apple SD Gothic Neo, sans-serif" font-size="18" font-weight="bold" fill="#1e272e">👆 화면을 터치·클릭하거나 방향키(WASD)로 걸어가 몬스터볼을 잡으세요!</text>
  <!-- Player -->
  <circle cx="460" cy="300" r="24" fill="#1e90ff" stroke="#2f3542" stroke-width="4"/>
  <text x="460" y="262" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" stroke="#2f3542" stroke-width="1">나(주인공)</text>
  <!-- Normal Ball -->
  <circle cx="260" cy="220" r="22" fill="#ff4757" stroke="#2f3542" stroke-width="4"/>
  <!-- Gold Ball -->
  <circle cx="690" cy="340" r="34" fill="#ffeaa7" opacity="0.6"/>
  <circle cx="690" cy="340" r="25" fill="#ffd32a" stroke="#2f3542" stroke-width="4"/>
  <text x="690" y="302" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="16" font-weight="bold" fill="#2f3542">✨황금볼✨</text>
</svg>""",
    "03_battle_silhouette_and_quiz.svg": """<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
  <rect width="960" height="600" fill="#dff9fb"/>
  <rect x="30" y="24" width="900" height="552" rx="24" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
  <text x="65" y="72" font-family="Apple SD Gothic Neo, sans-serif" font-size="26" font-weight="bold">❤️❤️🖤 (남은 하트 2개)</text>
  <text x="480" y="72" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="22" font-weight="bold" fill="#d63031">🌟 황금 몬스터볼 (전설·환상 · 문제 4개)</text>
  <text x="890" y="72" text-anchor="end" font-family="Apple SD Gothic Neo, sans-serif" font-size="20" font-weight="bold" fill="#1e272e">학습 문제 (1 / 4)</text>
  <!-- Left Stage -->
  <rect x="60" y="105" width="330" height="440" rx="18" fill="#fff9db" stroke="#2f3542" stroke-width="3.5"/>
  <circle cx="225" cy="270" r="85" fill="#ffd32a" stroke="#2f3542" stroke-width="4"/>
  <text x="225" y="280" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="28" font-weight="bold" fill="#1e272e">No.251 세레비</text>
  <rect x="85" y="430" width="280" height="80" rx="14" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>
  <text x="225" y="468" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="24" font-weight="bold" fill="#1e272e">세레비 🌟 전설·환상</text>
  <text x="225" y="496" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="18" font-weight="bold" fill="#20bf6b">[에스퍼 타입] [풀 타입]</text>
  <!-- Right Quiz -->
  <rect x="420" y="105" width="480" height="150" rx="18" fill="#fff9db" stroke="#2f3542" stroke-width="3.5"/>
  <text x="660" y="175" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="25" font-weight="bold" fill="#1e272e">피카츄가 나무열매를 6개 가지고 있어요.</text>
  <text x="660" y="212" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="25" font-weight="bold" fill="#1e272e">파이리가 4개를 더 주면 모두 몇 개일까요?</text>
  <!-- 4 Options (1 disabled wrong, 3 active) -->
  <rect x="420" y="290" width="230" height="90" rx="16" fill="#ced6e0" stroke="#747d8c" stroke-width="3.5"/>
  <text x="535" y="345" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="26" font-weight="bold" fill="#747d8c" text-decoration="line-through">1. 8 (오답 비활성)</text>
  <rect x="670" y="290" width="230" height="90" rx="16" fill="#7bed9f" stroke="#2f3542" stroke-width="3.5"/>
  <text x="785" y="345" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="28" font-weight="bold" fill="#1e272e">2. 10 (정답!)</text>
  <rect x="420" y="405" width="230" height="90" rx="16" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>
  <text x="535" y="460" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="28" font-weight="bold" fill="#1e272e">3. 9</text>
  <rect x="670" y="405" width="230" height="90" rx="16" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>
  <text x="785" y="460" text-anchor="middle" font-family="Apple SD Gothic Neo, sans-serif" font-size="28" font-weight="bold" fill="#1e272e">4. 11</text>
</svg>"""
}


def main():
    for name, content in SVGS.items():
        svg_path = os.path.join(TEST_DIR, name)
        with open(svg_path, "w", encoding="utf-8") as f:
            f.write(content)
        subprocess.run(
            ["qlmanage", "-t", "-s", "960", "-o", TEST_DIR, svg_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    print("Saved test screenshots to", TEST_DIR)


if __name__ == "__main__":
    main()

