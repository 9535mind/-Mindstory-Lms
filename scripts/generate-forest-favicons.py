"""
Generate forest-themed favicons (JTT brand green #2D4A3E, mint accent) for public/.
Run: python scripts/generate-forest-favicons.py
"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

BG = "#2D4A3E"
ACCENT = "#A8C9B8"
PAPER = "#FDFBF7"


def draw_forest_icon(size: int) -> Image.Image:
    """Simple rounded square + three tree triangles (readable at 16px)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    m = max(1, int(size * 0.06))
    r = max(2, int(size * 0.18))
    draw.rounded_rectangle(
        [m, m, size - m, size - m],
        radius=r,
        fill=BG,
    )
    # three stylized trees
    for frac_x, frac_w, frac_h in [
        (0.28, 0.22, 0.35),
        (0.5, 0.26, 0.42),
        (0.72, 0.22, 0.35),
    ]:
        cx = int(size * frac_x)
        bw = max(2, int(size * frac_w))
        bh = max(2, int(size * frac_h))
        base_y = size - m - int(size * 0.12)
        top = (cx, base_y - bh)
        left = (cx - bw // 2, base_y)
        right = (cx + bw // 2, base_y)
        draw.polygon([top, left, right], fill=ACCENT)
        if size >= 32:
            trunk_h = max(1, int(size * 0.06))
            draw.rectangle(
                [cx - max(1, bw // 8), base_y, cx + max(1, bw // 8), base_y + trunk_h],
                fill=PAPER,
            )
    return img


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
    }
    for name, s in sizes.items():
        im = draw_forest_icon(s)
        path = PUBLIC / name
        im.save(path, "PNG", optimize=True)
        print("wrote", path)

    im16 = draw_forest_icon(16)
    im32 = draw_forest_icon(32)
    ico_path = PUBLIC / "favicon.ico"
    im32.save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=[im16],
    )
    print("wrote", ico_path)


if __name__ == "__main__":
    main()
