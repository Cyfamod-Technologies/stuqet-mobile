#!/usr/bin/env python3
"""
Generates the illustrations used by the vendor app's demo mode.

    python3 scripts/generate-demo-images.py

Writes JPEG/PNG files to src/demo/images/<group>/. They are flat illustrations
(not photographs) drawn with Pillow, so the repo needs no stock-photo licences
and the set can be regenerated or restyled from this one file. Replace any file
with a real photo of the same name and the demo picks it up unchanged.

Everything is drawn in a 1000x1000 coordinate space and rendered at 1200 px,
then downsized with LANCZOS for smooth edges.
"""

from __future__ import annotations

import math
import os
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "demo" / "images"
FONT_DIR = ROOT / "node_modules" / "@expo-google-fonts" / "urbanist"
RENDER = 1200
BRAND = "#EB6C1A"


def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONT_DIR / weight / f"Urbanist_{weight}.ttf"
    return ImageFont.truetype(str(path), size)


def hexrgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore


def mix(a: str, b: str, t: float) -> str:
    ra, rb = hexrgb(a), hexrgb(b)
    return "#%02x%02x%02x" % tuple(int(ra[i] + (rb[i] - ra[i]) * t) for i in range(3))


def shade(color: str, amount: float) -> str:
    """Positive lightens toward white, negative darkens toward black."""
    return mix(color, "#ffffff", amount) if amount >= 0 else mix(color, "#000000", -amount)


class Canvas:
    """Drawing surface in 1000x1000 units."""

    def __init__(self, bg_top: str, bg_bottom: str, width: int = 1000, height: int = 1000):
        self.w, self.h = width, height
        self.k = RENDER / 1000
        self.size = (int(width * self.k), int(height * self.k))
        self.img = Image.new("RGBA", self.size)
        px = ImageDraw.Draw(self.img)
        for y in range(self.size[1]):
            px.line([(0, y), (self.size[0], y)], fill=mix(bg_top, bg_bottom, y / self.size[1]))
        self.d = ImageDraw.Draw(self.img)

    # -- coordinates -----------------------------------------------------
    def p(self, *pts: float) -> list[float]:
        return [v * self.k for v in pts]

    def pts(self, points):
        return [(x * self.k, y * self.k) for x, y in points]

    # -- primitives ------------------------------------------------------
    def rect(self, x0, y0, x1, y1, fill, outline=None, width=0):
        self.d.rectangle(self.p(x0, y0, x1, y1), fill=fill, outline=outline, width=int(width * self.k))

    def rrect(self, x0, y0, x1, y1, r, fill, outline=None, width=0):
        self.d.rounded_rectangle(
            self.p(x0, y0, x1, y1), radius=r * self.k, fill=fill, outline=outline, width=int(width * self.k)
        )

    def ell(self, x0, y0, x1, y1, fill, outline=None, width=0):
        self.d.ellipse(self.p(x0, y0, x1, y1), fill=fill, outline=outline, width=int(width * self.k))

    def circle(self, cx, cy, r, fill, outline=None, width=0):
        self.ell(cx - r, cy - r, cx + r, cy + r, fill, outline, width)

    def poly(self, points, fill, outline=None):
        self.d.polygon(self.pts(points), fill=fill, outline=outline)

    def line(self, points, fill, width=4, joint="curve"):
        self.d.line(self.pts(points), fill=fill, width=int(width * self.k), joint=joint)

    def arc(self, box, start, end, fill, width=4):
        self.d.arc(self.p(*box), start, end, fill=fill, width=int(width * self.k))

    def pie(self, box, start, end, fill):
        self.d.pieslice(self.p(*box), start, end, fill=fill)

    def text(self, x, y, value, size, fill, weight="700Bold", anchor="la"):
        self.d.text((x * self.k, y * self.k), value, font=font(weight, int(size * self.k)), fill=fill, anchor=anchor)

    # -- compound --------------------------------------------------------
    def shadow(self, cx, cy, rx, ry, opacity=70, blur=22):
        layer = Image.new("RGBA", self.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse(self.p(cx - rx, cy - ry, cx + rx, cy + ry), fill=(30, 20, 10, opacity))
        layer = layer.filter(ImageFilter.GaussianBlur(blur * self.k))
        self.img.alpha_composite(layer)
        self.d = ImageDraw.Draw(self.img)

    def glow(self, cx, cy, r, color, opacity=110, blur=60):
        layer = Image.new("RGBA", self.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        rgb = hexrgb(color)
        ld.ellipse(self.p(cx - r, cy - r, cx + r, cy + r), fill=(*rgb, opacity))
        layer = layer.filter(ImageFilter.GaussianBlur(blur * self.k))
        self.img.alpha_composite(layer)
        self.d = ImageDraw.Draw(self.img)

    def vgrad_rrect(self, x0, y0, x1, y1, r, top, bottom):
        """Rounded rect filled with a vertical gradient."""
        w, h = int((x1 - x0) * self.k), int((y1 - y0) * self.k)
        grad = Image.new("RGBA", (max(w, 1), max(h, 1)))
        gd = ImageDraw.Draw(grad)
        for y in range(h):
            gd.line([(0, y), (w, y)], fill=mix(top, bottom, y / max(h - 1, 1)))
        mask = Image.new("L", grad.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=r * self.k, fill=255)
        self.img.paste(grad, (int(x0 * self.k), int(y0 * self.k)), mask)
        self.d = ImageDraw.Draw(self.img)

    def vgrad_ell(self, x0, y0, x1, y1, top, bottom):
        w, h = int((x1 - x0) * self.k), int((y1 - y0) * self.k)
        grad = Image.new("RGBA", (max(w, 1), max(h, 1)))
        gd = ImageDraw.Draw(grad)
        for y in range(h):
            gd.line([(0, y), (w, y)], fill=mix(top, bottom, y / max(h - 1, 1)))
        mask = Image.new("L", grad.size, 0)
        ImageDraw.Draw(mask).ellipse([0, 0, w - 1, h - 1], fill=255)
        self.img.paste(grad, (int(x0 * self.k), int(y0 * self.k)), mask)
        self.d = ImageDraw.Draw(self.img)

    def save(self, path: Path, size: tuple[int, int] | None = None, quality=84):
        path.parent.mkdir(parents=True, exist_ok=True)
        out = self.img.convert("RGB")
        target = size or (int(self.w * 0.64), int(self.h * 0.64))
        out = out.resize(target, Image.LANCZOS)
        if path.suffix.lower() == ".png":
            out.save(path, optimize=True)
        elif path.suffix.lower() == ".pdf":
            out.save(path, "PDF", resolution=100)
        else:
            out.save(path, quality=quality, optimize=True, progressive=True)
        print("wrote", path.relative_to(ROOT))


def stage(top: str, bottom: str, floor: str | None = None) -> Canvas:
    c = Canvas(top, bottom)
    if floor:
        c.rect(0, 760, 1000, 1000, floor)
    return c


# ===========================================================================
# Products
# ===========================================================================


def earbuds(path):
    c = stage("#FDF1E7", "#F6DFCB")
    c.shadow(500, 800, 300, 36)
    c.vgrad_rrect(250, 520, 750, 790, 110, "#FFFFFF", "#E7E2DC")
    c.rrect(250, 520, 750, 640, 110, "#F4F1EC")
    c.line([(255, 640), (745, 640)], "#D8D2CA", 6)
    c.circle(500, 640, 14, "#EB6C1A")
    for sx in (-1, 1):
        cx = 500 + sx * 170
        c.circle(cx, 330, 105, "#1F1D1B")
        c.circle(cx - sx * 20, 300, 34, "#44413D")
        c.rrect(cx + (sx * 70) - 24, 380, cx + (sx * 70) + 24, 520, 24, "#1F1D1B")
        c.circle(cx + sx * 40, 260, 12, "#EB6C1A")
    c.save(path)


def phone_case(path):
    c = stage("#E8F1FB", "#CFE0F3")
    c.shadow(500, 880, 260, 30)
    c.vgrad_rrect(300, 120, 700, 860, 90, "#FFB074", "#EB6C1A")
    c.rrect(318, 138, 682, 842, 74, None, "#FFFFFF", 6)
    c.rrect(335, 160, 520, 340, 46, "#2A2623")
    c.circle(398, 220, 38, "#111111")
    c.circle(398, 220, 22, "#2E4A6B")
    c.circle(462, 285, 38, "#111111")
    c.circle(462, 285, 22, "#2E4A6B")
    c.circle(488, 190, 10, "#FFF3C4")
    c.rrect(400, 770, 600, 788, 9, "#FFFFFF")
    c.text(500, 520, "stuqet", 70, "#FFFFFF", anchor="mm")
    c.glow(380, 300, 120, "#FFFFFF", 50, 70)
    c.save(path)


def sneakers(path):
    c = stage("#EAF6F0", "#CDE7DB")
    c.shadow(500, 770, 380, 34)
    c.poly([(120, 640), (880, 640), (900, 700), (880, 740), (150, 740), (110, 700)], "#FFFFFF")
    c.rect(120, 700, 890, 740, "#EDEDED")
    c.poly([(140, 640), (190, 330), (360, 300), (470, 400), (700, 470), (850, 560), (880, 640)], "#EB6C1A")
    c.poly([(190, 330), (360, 300), (470, 400), (380, 470), (200, 460)], "#F58A41")
    c.poly([(640, 520), (850, 560), (880, 640), (600, 640)], "#FFFFFF")
    c.line([(170, 640), (880, 640)], "#C9C5C0", 6)
    for i in range(4):
        x = 360 + i * 70
        c.line([(x, 390 + i * 30), (x + 60, 360 + i * 30 + 40)], "#FFFFFF", 14)
    c.circle(250, 470, 10, "#FFFFFF")
    c.save(path)


def backpack(path):
    c = stage("#F3EEFA", "#E0D7F0")
    c.shadow(500, 850, 270, 30)
    c.arc((380, 120, 620, 330), 180, 360, "#3D3552", 36)
    c.vgrad_rrect(250, 220, 750, 840, 140, "#5B4A8A", "#3D3566")
    c.rrect(310, 520, 690, 780, 70, "#4B3E78", "#7B6AAE", 6)
    c.rrect(380, 560, 620, 600, 20, "#EB6C1A")
    c.line([(500, 250), (500, 480)], "#2C2644", 8)
    c.circle(500, 490, 18, "#EB6C1A")
    c.rrect(220, 360, 270, 640, 24, "#2F2850")
    c.rrect(730, 360, 780, 640, 24, "#2F2850")
    c.glow(420, 340, 140, "#FFFFFF", 36, 80)
    c.save(path)


def power_bank(path):
    c = stage("#FFF6DD", "#F8E6B3")
    c.shadow(500, 830, 280, 30)
    c.line([(740, 760), (860, 700), (880, 560), (800, 470)], "#2A2623", 20)
    c.rrect(780, 430, 850, 500, 14, "#2A2623")
    c.vgrad_rrect(240, 170, 700, 820, 70, "#3A3631", "#1E1C1A")
    c.rrect(290, 230, 650, 330, 30, "#2A2623")
    for i in range(4):
        c.circle(360 + i * 80, 280, 18, "#35D07F" if i < 3 else "#4B4742")
    c.rrect(380, 780, 560, 800, 10, "#0F0E0D")
    c.text(470, 560, "20000", 110, "#EB6C1A", anchor="mm")
    c.text(470, 650, "mAh", 54, "#9A938B", "600SemiBold", anchor="mm")
    c.save(path)


def notebooks(path):
    c = stage("#FDECEC", "#F5D3D3")
    c.shadow(500, 850, 320, 34)
    spec = [("#2F6FEB", 640, 700), ("#EB6C1A", 460, 560), ("#27B27C", 270, 420)]
    for color, y0, y1 in spec:
        c.rrect(200, y0, 800, y1 + 80, 30, color)
        c.rrect(200, y0 + 10, 790, y1 + 70, 22, shade(color, 0.12))
        c.rect(236, y0 + 20, 760, y0 + 38, "#FFFFFF")
    c.rrect(250, 240, 750, 420, 22, "#27B27C")
    for i in range(9):
        c.circle(280 + i * 52, 250, 14, "#F5F1EA")
    c.text(500, 340, "NOTES", 70, "#FFFFFF", anchor="mm")
    c.save(path)


def desk_lamp(path):
    c = stage("#FFF4E5", "#FBE0B8")
    c.glow(330, 330, 280, "#FFD36B", 130, 90)
    c.shadow(500, 860, 220, 26)
    c.ell(290, 800, 710, 880, "#3A3631")
    c.rrect(468, 480, 532, 810, 20, "#4A4540")
    c.line([(500, 480), (400, 330), (330, 300)], "#4A4540", 34)
    c.circle(400, 330, 26, "#EB6C1A")
    c.poly([(220, 290), (440, 230), (500, 350), (260, 410)], "#EB6C1A")
    c.poly([(240, 330), (420, 285), (470, 352), (270, 400)], "#FFD36B")
    c.save(path)


def speaker(path):
    c = stage("#E7EEF7", "#CBD8EA")
    c.shadow(500, 840, 280, 30)
    c.vgrad_rrect(230, 280, 770, 830, 120, "#3B4A63", "#212B3C")
    for row in range(8):
        for col in range(8):
            x, y = 305 + col * 55, 340 + row * 55
            if (x - 500) ** 2 + (y - 570) ** 2 < 215**2:
                c.circle(x, y, 9, "#5C6C88")
    c.circle(500, 570, 82, "#1A2231")
    c.circle(500, 570, 40, "#EB6C1A")
    c.rrect(430, 235, 570, 280, 22, "#EB6C1A")
    c.circle(500, 765, 16, "#35D07F")
    c.save(path)


def hoodie(path):
    c = stage("#EFF3E9", "#D9E3C9")
    c.shadow(500, 880, 330, 30)
    body = "#EB6C1A"
    c.poly([(330, 230), (230, 300), (110, 700), (210, 740), (290, 520), (320, 800), (680, 800), (710, 520), (790, 740), (890, 700), (770, 300), (670, 230)], body)
    c.poly([(330, 230), (500, 330), (670, 230), (610, 140), (500, 120), (390, 140)], shade(body, -0.15))
    c.ell(420, 190, 580, 300, "#2A2623")
    c.line([(455, 300), (440, 440)], "#FFFFFF", 12)
    c.line([(545, 300), (560, 440)], "#FFFFFF", 12)
    c.poly([(330, 560), (670, 560), (710, 700), (290, 700)], shade(body, -0.12))
    c.line([(330, 560), (290, 700)], shade(body, -0.3), 6)
    c.line([(670, 560), (710, 700)], shade(body, -0.3), 6)
    c.line([(210, 740), (290, 520)], shade(body, -0.25), 5)
    c.line([(790, 740), (710, 520)], shade(body, -0.25), 5)
    c.save(path)


def water_bottle(path):
    c = stage("#E6F5FA", "#C4E4F0")
    c.shadow(500, 880, 190, 26)
    c.rrect(430, 110, 570, 190, 24, "#2A2623")
    c.rrect(455, 160, 545, 250, 16, "#4A4540")
    c.vgrad_rrect(360, 230, 640, 880, 110, "#59B6D9", "#2E86AB")
    c.rrect(360, 430, 640, 700, 0, "#FFFFFF")
    c.rect(360, 430, 640, 700, "#FFFFFF")
    c.rect(360, 430, 640, 436, "#EB6C1A")
    c.rect(360, 694, 640, 700, "#EB6C1A")
    c.text(500, 560, "stuqet", 66, "#EB6C1A", anchor="mm")
    c.text(500, 630, "750 ml", 40, "#8C857D", "600SemiBold", anchor="mm")
    c.glow(420, 400, 90, "#FFFFFF", 70, 50)
    c.save(path)


PRODUCTS = {
    "wireless-earbuds": earbuds,
    "phone-case": phone_case,
    "sneakers": sneakers,
    "backpack": backpack,
    "power-bank": power_bank,
    "notebooks": notebooks,
    "desk-lamp": desk_lamp,
    "speaker": speaker,
    "hoodie": hoodie,
    "water-bottle": water_bottle,
}


# ===========================================================================
# Food
# ===========================================================================


def plate(c: Canvas, cx=500, cy=620, rx=380, ry=190, color="#FFFFFF"):
    c.shadow(cx, cy + ry + 20, rx, 40)
    c.ell(cx - rx, cy - ry, cx + rx, cy + ry + 30, "#D9D3CB")
    c.ell(cx - rx, cy - ry, cx + rx, cy + ry, color)
    c.ell(cx - rx + 50, cy - ry + 30, cx + rx - 50, cy + ry - 30, shade(color, -0.04))


def speckle(c: Canvas, cx, cy, rx, ry, colors, n, size=(6, 12), seed=1):
    rnd = random.Random(seed)
    for _ in range(n):
        a = rnd.random() * math.tau
        r = math.sqrt(rnd.random())
        x, y = cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r
        s = rnd.uniform(*size)
        c.ell(x - s, y - s * 0.6, x + s, y + s * 0.6, rnd.choice(colors))


def drumstick(c: Canvas, x, y, scale=1.0, flip=1):
    s = scale
    c.ell(x - 110 * s, y - 70 * s, x + 90 * s, y + 70 * s, "#B8561B")
    c.ell(x - 95 * s, y - 62 * s, x + 70 * s, y + 40 * s, "#D4742A")
    c.line([(x + 80 * s * flip, y + 10 * s), (x + 190 * s * flip, y + 40 * s)], "#F3E5D0", 22 * s)
    c.circle(x + 200 * s * flip, y + 30 * s, 20 * s, "#F3E5D0")
    c.circle(x + 205 * s * flip, y + 56 * s, 20 * s, "#F3E5D0")


def jollof(path):
    c = stage("#FBE9D6", "#F2CFA6")
    plate(c)
    c.ell(250, 440, 700, 700, "#D5481B")
    c.ell(290, 410, 660, 640, "#E2582A")
    speckle(c, 475, 530, 190, 100, ["#F28A4F", "#B8340F", "#F7C28A"], 120, (6, 12), 3)
    drumstick(c, 640, 600, 0.95)
    c.ell(215, 585, 335, 645, "#F2CC4A")
    c.ell(235, 565, 315, 605, "#3F8F3A")
    c.save(path)


def pounded_yam(path):
    c = stage("#F4F0E4", "#E6DDC2")
    plate(c, color="#FFFFFF")
    c.ell(520, 430, 800, 700, "#FFFDF6")
    c.ell(540, 440, 720, 560, "#FFFFFF")
    c.ell(190, 450, 560, 700, "#5E8A2B")
    c.ell(215, 470, 535, 670, "#6FA032")
    speckle(c, 375, 570, 150, 80, ["#E3C34C", "#3F6A1A", "#C99B2E"], 80, (7, 14), 5)
    c.ell(300, 520, 360, 560, "#B5482A")
    c.ell(400, 590, 470, 625, "#B5482A")
    c.save(path)


def fried_rice(path):
    c = stage("#FFF3D4", "#F6DE9E")
    plate(c)
    c.ell(220, 420, 700, 710, "#E9C45B")
    c.ell(260, 400, 670, 650, "#F2D675")
    speckle(c, 465, 530, 200, 100, ["#4C9B3A", "#E4572E", "#FFF6D8", "#C98B28"], 140, (6, 10), 8)
    for i in range(4):
        x = 650 + i * 40
        c.ell(x - 45, 470 + i * 38, x + 55, 520 + i * 38, "#F6B93B")
        c.ell(x - 38, 478 + i * 38, x + 45, 505 + i * 38, "#C4811D")
    c.save(path)


def suya(path):
    c = stage("#F7E4D6", "#E8C4A8")
    c.shadow(500, 840, 400, 36)
    c.rrect(100, 380, 900, 820, 40, "#8A5A34")
    c.rrect(100, 380, 900, 820, 40, None, "#6E4627", 8)
    for i in range(5):
        y = 440 + i * 70
        c.line([(150, y), (860, y)], "#9C6B42", 6)
    for row, y in enumerate((470, 590, 710)):
        c.line([(140, y), (880, y)], "#D9C7A8", 10)
        for i in range(5):
            x = 250 + i * 110
            c.rrect(x - 50, y - 40, x + 50, y + 40, 26, "#8E3A14")
            c.rrect(x - 40, y - 32, x + 40, y + 24, 22, "#B5541F")
            c.ell(x - 20, y - 22, x + 8, y - 6, "#D98A4A")
    for x, y in ((330, 560), (560, 680), (760, 540)):
        c.circle(x, y, 38, None, "#B27ACB", 12)
        c.circle(x, y, 20, None, "#C99ADB", 8)
    c.save(path)


def shawarma(path):
    c = stage("#FDEBD8", "#F3CFA5")
    c.shadow(500, 860, 260, 34)
    c.poly([(380, 760), (620, 760), (700, 330), (300, 330)], "#D6D6D6")
    c.poly([(400, 760), (600, 760), (665, 340), (335, 340)], "#EFEFEF")
    c.ell(250, 190, 750, 440, "#E9C58B")
    c.ell(285, 215, 715, 410, "#F1D3A0")
    c.ell(340, 250, 660, 380, "#8A3F1A")
    speckle(c, 500, 315, 140, 50, ["#6EAE3E", "#E5472B", "#FFF2D6"], 40, (9, 16), 4)
    c.poly([(330, 440), (500, 430), (670, 440), (660, 520), (340, 520)], "#E9C58B")
    c.line([(360, 560), (640, 560)], "#C9C9C9", 5)
    c.line([(375, 640), (625, 640)], "#C9C9C9", 5)
    c.save(path)


def puff_puff(path):
    c = stage("#FFF1DC", "#F8D9A3")
    c.shadow(500, 840, 360, 36)
    c.vgrad_rrect(180, 520, 820, 830, 120, "#3D5A80", "#2A3F5C")
    c.rrect(180, 520, 820, 580, 30, "#4B6D9B")
    rnd = random.Random(11)
    spots = [(280, 470), (400, 430), (520, 450), (640, 440), (730, 480), (340, 540), (460, 520), (600, 530), (350, 380), (480, 350), (610, 360), (500, 280)]
    for x, y in spots:
        r = rnd.randint(62, 78)
        c.glow(x, y + 20, r * 0.9, "#7A4A12", 40, 20)
        c.circle(x, y, r, "#D69A3C")
        c.circle(x - 10, y - 12, r - 14, "#E7B35C")
        c.ell(x - 28, y - 34, x - 4, y - 18, "#F6D590")
    c.save(path)


def smoothie(path):
    c = stage("#FDE8EF", "#F7C7D8")
    c.shadow(500, 870, 200, 28)
    c.line([(540, 120), (560, 340)], "#EB6C1A", 28)
    c.poly([(290, 250), (710, 250), (650, 850), (350, 850)], "#FFFFFF")
    c.poly([(305, 330), (695, 330), (650, 850), (350, 850)], "#F27BA0")
    c.poly([(320, 520), (680, 520), (650, 850), (350, 850)], "#E0457B")
    c.poly([(305, 330), (695, 330), (688, 380), (312, 380)], "#F8A9C3")
    c.ell(280, 215, 720, 290, "#F6F6F6")
    c.ell(300, 225, 700, 280, "#FFD6E3")
    for x, y in ((400, 220), (470, 205), (560, 215), (620, 210)):
        c.circle(x, y, 26, "#C2185B")
    c.glow(400, 560, 60, "#FFFFFF", 70, 30)
    c.save(path)


def meat_pie(path):
    c = stage("#F8ECD6", "#EBD2A0")
    plate(c, 500, 600, 360, 170, "#FFFFFF")
    c.pie((200, 340, 800, 780), 180, 360, "#C98A32")
    c.rect(200, 560, 800, 600, "#C98A32")
    c.pie((235, 370, 765, 760), 180, 360, "#E3A74D")
    c.rect(235, 560, 765, 590, "#E3A74D")
    for i in range(18):
        x = 210 + i * 33
        c.circle(x, 585, 20, "#B97722")
    c.line([(320, 470), (680, 470)], "#B97722", 8)
    c.line([(340, 520), (660, 520)], "#B97722", 8)
    c.ell(330, 410, 450, 440, "#F3C877")
    c.save(path)


FOOD = {
    "jollof-rice": jollof,
    "pounded-yam-egusi": pounded_yam,
    "fried-rice-plantain": fried_rice,
    "suya": suya,
    "shawarma": shawarma,
    "puff-puff": puff_puff,
    "smoothie": smoothie,
    "meat-pie": meat_pie,
}


# ===========================================================================
# Services
# ===========================================================================


def laptop_repair(path):
    c = stage("#E8EEF9", "#CBD8F0")
    c.shadow(500, 800, 380, 30)
    c.poly([(150, 720), (850, 720), (790, 760), (210, 760)], "#B9BEC8")
    c.rrect(230, 260, 770, 700, 28, "#2C323C")
    c.rrect(255, 285, 745, 675, 16, "#1B2F55")
    c.rrect(300, 340, 480, 400, 12, "#EB6C1A")
    c.rrect(300, 430, 700, 450, 8, "#4C6EA8")
    c.rrect(300, 480, 640, 500, 8, "#4C6EA8")
    c.rrect(300, 530, 560, 550, 8, "#4C6EA8")
    c.circle(640, 380, 38, None, "#FFFFFF", 10)
    c.line([(625, 380), (638, 393), (662, 365)], "#FFFFFF", 10)
    c.rrect(690, 560, 940, 600, 18, "#EB6C1A")
    c.poly([(890, 560), (950, 540), (950, 620), (890, 600)], "#4A4540")
    c.save(path)


def tutoring(path):
    c = stage("#E7F5EE", "#C6E6D5")
    c.shadow(500, 840, 360, 30)
    c.rrect(120, 140, 880, 560, 30, "#2F5E4A")
    c.rrect(145, 165, 855, 535, 18, "#3E7A5F")
    c.text(500, 300, "2x + 3 = 11", 100, "#FFFFFF", "700Bold", anchor="mm")
    c.text(500, 420, "x = 4", 100, "#FFD36B", "700Bold", anchor="mm")
    c.rect(120, 560, 880, 580, "#8A6A3E")
    c.rrect(260, 660, 700, 800, 18, "#EB6C1A")
    c.rrect(280, 640, 680, 780, 14, "#FFFFFF")
    c.line([(480, 640), (480, 780)], "#D8D2CA", 6)
    c.poly([(700, 760), (880, 640), (900, 670), (720, 790)], "#F6C543")
    c.poly([(880, 640), (910, 620), (925, 650), (900, 670)], "#E8788A")
    c.save(path)


def photography(path):
    c = stage("#F3EAF8", "#DFCEEE")
    c.shadow(500, 830, 340, 30)
    c.rrect(160, 330, 840, 780, 70, "#2A2D36")
    c.rrect(160, 330, 840, 450, 60, "#3A3E4A")
    c.rrect(330, 250, 520, 350, 26, "#3A3E4A")
    c.circle(500, 590, 190, "#16181E")
    c.circle(500, 590, 150, "#2C3D5C")
    c.circle(500, 590, 100, "#1C2A44")
    c.circle(455, 545, 34, "#7FA0D6")
    c.circle(780, 400, 22, "#EB6C1A")
    c.rrect(210, 380, 330, 410, 12, "#9AA0AE")
    c.save(path)


def printing(path):
    c = stage("#EAF2F7", "#CFE0EA")
    c.shadow(500, 830, 380, 30)
    c.rrect(280, 150, 720, 400, 18, "#FFFFFF", "#D8D2CA", 4)
    for i in range(5):
        c.rect(330, 200 + i * 38, 670 - (i % 2) * 90, 212 + i * 38, "#B8C4D0")
    c.rrect(130, 380, 870, 740, 54, "#4A5568")
    c.rrect(130, 380, 870, 560, 54, "#5C6A82")
    c.rrect(220, 600, 780, 800, 16, "#FFFFFF", "#D8D2CA", 4)
    c.rrect(260, 560, 740, 610, 14, "#1E2430")
    c.circle(790, 470, 24, "#35D07F")
    c.circle(730, 470, 24, "#EB6C1A")
    c.save(path)


def tailoring(path):
    c = stage("#FBEAF1", "#F4C9DB")
    c.shadow(500, 870, 300, 30)
    c.poly([(400, 220), (600, 220), (650, 420), (610, 560), (700, 800), (300, 800), (390, 560), (350, 420)], "#EB6C1A")
    c.poly([(400, 220), (600, 220), (560, 300), (440, 300)], "#F7B27C")
    c.rrect(485, 120, 515, 240, 12, "#4A4540")
    c.rect(300, 800, 700, 830, "#4A4540")
    c.line([(300, 640), (700, 640)], "#FFFFFF", 6)
    c.circle(780, 330, 90, "#2F6FEB")
    c.circle(780, 330, 60, "#7FA6F5")
    c.circle(780, 330, 24, "#FFFFFF")
    c.line([(780, 420), (760, 560), (860, 620)], "#2F6FEB", 8)
    c.save(path)


def laundry(path):
    c = stage("#E6F4FB", "#C4E2F2")
    c.shadow(500, 880, 280, 30)
    c.vgrad_rrect(240, 130, 760, 870, 50, "#FFFFFF", "#E1E6EC")
    c.rect(240, 280, 760, 296, "#D4DAE2")
    c.circle(330, 205, 24, "#EB6C1A")
    c.rrect(400, 185, 700, 225, 18, "#D4DAE2")
    c.circle(500, 590, 205, "#B6BFCC")
    c.circle(500, 590, 175, "#2B6CA3")
    c.circle(500, 590, 140, "#4A97D2")
    c.arc((380, 480, 620, 700), 200, 330, "#BFE0F5", 14)
    c.circle(440, 640, 18, "#FFFFFF")
    c.circle(560, 680, 24, "#FFFFFF")
    c.circle(520, 560, 12, "#FFFFFF")
    c.save(path)


SERVICES = {
    "laptop-repair": laptop_repair,
    "tutoring": tutoring,
    "photography": photography,
    "printing": printing,
    "tailoring": tailoring,
    "laundry": laundry,
}


# ===========================================================================
# People, shop and documents
# ===========================================================================


def avatar(path, skin, hair, shirt, bg, style):
    c = Canvas(shade(bg, 0.25), bg, 800, 800)
    c.k = RENDER / 800
    c.size = (RENDER, RENDER)
    c.img = Image.new("RGBA", c.size)
    px = ImageDraw.Draw(c.img)
    for y in range(RENDER):
        px.line([(0, y), (RENDER, y)], fill=mix(shade(bg, 0.25), bg, y / RENDER))
    c.d = ImageDraw.Draw(c.img)
    # Shoulders and neck.
    c.ell(130, 560, 670, 1000, shirt)
    c.rrect(335, 430, 465, 620, 50, shade(skin, -0.08))
    # Back hair.
    if style in ("long", "braids"):
        c.rrect(220, 170, 580, 600, 150, hair)
    if style == "afro":
        c.circle(400, 290, 215, hair)
    # Head.
    c.ell(255, 190, 545, 500, skin)
    c.ell(240, 320, 262, 390, skin)
    c.ell(538, 320, 560, 390, skin)
    # Hair front.
    if style == "short":
        c.pie((248, 160, 552, 420), 180, 360, hair)
    elif style == "afro":
        c.pie((262, 195, 538, 420), 190, 350, hair)
    elif style == "long":
        c.pie((250, 170, 550, 420), 175, 365, hair)
    elif style == "braids":
        c.pie((250, 170, 550, 420), 175, 365, hair)
        for x in (250, 285, 515, 550):
            c.line([(x, 300), (x - (10 if x < 400 else -10), 560)], hair, 22)
    elif style == "bald":
        c.pie((262, 215, 538, 330), 200, 340, shade(skin, -0.05))
        c.rrect(300, 420, 500, 520, 60, hair)
        c.rrect(330, 440, 470, 470, 12, skin)
    elif style == "wrap":
        c.pie((240, 150, 560, 420), 172, 368, "#EB6C1A")
        c.rrect(240, 280, 560, 320, 10, "#EB6C1A")
        c.line([(250, 300), (550, 300)], "#F7B27C", 10)
    # Face.
    eye = "#2A2623"
    c.circle(340, 355, 13, eye)
    c.circle(460, 355, 13, eye)
    c.arc((350, 385, 450, 455), 20, 160, "#8A3B2A", 10)
    c.circle(318, 410, 22, mix(skin, "#E8788A", 0.25))
    c.circle(482, 410, 22, mix(skin, "#E8788A", 0.25))
    c.save(path, size=(480, 480), quality=86)


def shop_logo(path):
    c = Canvas("#FF9650", "#EB6C1A", 800, 800)
    c.k = RENDER / 800
    c.size = (RENDER, RENDER)
    c.img = Image.new("RGBA", c.size)
    px = ImageDraw.Draw(c.img)
    for y in range(RENDER):
        px.line([(0, y), (RENDER, y)], fill=mix("#FF9650", "#EB6C1A", y / RENDER))
    c.d = ImageDraw.Draw(c.img)
    # Shopping bag mark with the "CM" monogram.
    c.arc((290, 160, 510, 400), 180, 360, "#FFFFFF", 28)
    c.rrect(190, 270, 610, 650, 56, "#FFFFFF")
    c.text(400, 470, "CM", 190, "#EB6C1A", "800ExtraBold", anchor="mm")
    c.save(path, size=(400, 400), quality=88)


def monogram_logo(path, top, bottom, letters, glyph):
    """Square shop logo: gradient tile, a white badge shape and a monogram."""
    c = Canvas(top, bottom, 800, 800)
    c.k = RENDER / 800
    c.size = (RENDER, RENDER)
    c.img = Image.new("RGBA", c.size)
    px = ImageDraw.Draw(c.img)
    for y in range(RENDER):
        px.line([(0, y), (RENDER, y)], fill=mix(top, bottom, y / RENDER))
    c.d = ImageDraw.Draw(c.img)
    if glyph == "pot":
        # Cooking pot with steam.
        c.rrect(170, 330, 630, 620, 60, "#FFFFFF")
        c.rrect(120, 350, 190, 400, 24, "#FFFFFF")
        c.rrect(610, 350, 680, 400, 24, "#FFFFFF")
        c.rrect(210, 270, 590, 340, 30, "#FFFFFF")
        for x in (300, 400, 500):
            c.arc((x - 30, 120, x + 30, 240), 90, 270, "#FFFFFF", 18)
    else:
        # Wrench.
        c.poly([(250, 600), (330, 680), (620, 390), (540, 310)], "#FFFFFF")
        c.circle(600, 230, 130, "#FFFFFF")
        c.circle(640, 190, 62, top)
        c.circle(210, 640, 52, "#FFFFFF")
    if glyph == "pot":
        c.text(400, 530, letters, 150, top, "800ExtraBold", anchor="mm")
    else:
        c.text(220, 220, letters, 170, "#FFFFFF", "800ExtraBold", anchor="mm")
    c.save(path, size=(400, 400), quality=88)


def banner(path, top, bottom, title, subtitle, accent):
    c = Canvas(top, bottom, 1000, 420)
    c.k = RENDER / 1000
    c.size = (RENDER, int(420 * c.k))
    c.img = Image.new("RGBA", c.size)
    px = ImageDraw.Draw(c.img)
    for x in range(c.size[0]):
        px.line([(x, 0), (x, c.size[1])], fill=mix(top, bottom, x / c.size[0]))
    c.d = ImageDraw.Draw(c.img)
    c.circle(880, 80, 220, shade(accent, 0.25))
    c.circle(930, 380, 160, accent)
    c.circle(760, 360, 70, shade(accent, 0.45))
    c.text(70, 110, title, 82, "#FFFFFF", "800ExtraBold")
    c.text(70, 215, subtitle, 40, "#FFFFFF", "600SemiBold")
    c.save(path, size=(960, 403), quality=84)


def id_card(path):
    c = Canvas("#EFEFEF", "#E4E4E4", 1000, 640)
    c.k = RENDER / 1000
    c.size = (RENDER, int(640 * c.k))
    c.img = Image.new("RGBA", c.size, "#F1EFEA")
    c.d = ImageDraw.Draw(c.img)
    c.rrect(40, 40, 960, 600, 40, "#FFFFFF", "#D8D2CA", 4)
    c.rect(40, 80, 960, 170, "#EB6C1A")
    c.text(500, 125, "UNIVERSITY OF LAGOS · STUDENT ID", 38, "#FFFFFF", "700Bold", anchor="mm")
    c.rrect(90, 220, 330, 520, 20, "#E7DFD3")
    c.circle(210, 330, 62, "#B77B50")
    c.ell(120, 400, 300, 560, "#3D5A80")
    for i, (label, value) in enumerate(
        [("Name", "ADA OKONKWO"), ("Matric No", "190805123"), ("Faculty", "Engineering"), ("Valid to", "07/2027")]
    ):
        y = 230 + i * 80
        c.text(380, y, label.upper(), 24, "#9A938B", "600SemiBold")
        c.text(380, y + 28, value, 38, "#2A2623", "700Bold")
    c.save(path, size=(800, 512), quality=86)


def cac_certificate(path):
    c = Canvas("#FBFAF6", "#F4F1E8", 800, 1100)
    c.k = RENDER / 1000
    c.size = (int(800 * c.k), int(1100 * c.k))
    c.img = Image.new("RGBA", c.size, "#FBFAF6")
    c.d = ImageDraw.Draw(c.img)
    c.rect(30, 30, 770, 1070, None, "#1F6B3A", 6)
    c.rect(50, 50, 750, 1050, None, "#1F6B3A", 2)
    c.text(400, 140, "CORPORATE AFFAIRS COMMISSION", 34, "#1F6B3A", "800ExtraBold", anchor="mm")
    c.text(400, 200, "Certificate of Incorporation", 44, "#2A2623", "700Bold", anchor="mm")
    c.line([(150, 240), (650, 240)], "#1F6B3A", 3)
    c.text(400, 320, "This is to certify that", 28, "#6B655E", "500Medium", anchor="mm")
    c.text(400, 400, "CAMPUS MART LTD", 52, "#2A2623", "800ExtraBold", anchor="mm")
    c.text(400, 480, "is this day incorporated under the", 28, "#6B655E", "500Medium", anchor="mm")
    c.text(400, 520, "Companies and Allied Matters Act as a", 28, "#6B655E", "500Medium", anchor="mm")
    c.text(400, 560, "private company limited by shares.", 28, "#6B655E", "500Medium", anchor="mm")
    c.text(400, 680, "RC 1840216", 46, "#1F6B3A", "800ExtraBold", anchor="mm")
    c.circle(250, 880, 90, None, "#1F6B3A", 5)
    c.circle(250, 880, 70, None, "#1F6B3A", 2)
    c.text(250, 880, "CAC", 42, "#1F6B3A", "800ExtraBold", anchor="mm")
    c.line([(470, 900), (680, 900)], "#2A2623", 3)
    c.text(575, 930, "Registrar-General", 24, "#6B655E", "500Medium", anchor="mm")
    c.save(path, size=(640, 880), quality=86)


def support_screenshot(path):
    c = Canvas("#F6F4F0", "#EDE9E3", 560, 1000)
    c.k = RENDER / 1000
    c.size = (int(560 * c.k), RENDER)
    c.img = Image.new("RGBA", c.size, "#FFFFFF")
    c.d = ImageDraw.Draw(c.img)
    c.rect(0, 0, 560, 110, "#EB6C1A")
    c.text(40, 60, "Payout details", 36, "#FFFFFF", "700Bold", anchor="lm")
    c.rrect(40, 170, 520, 250, 22, "#F6F4F0", "#D8D2CA", 3)
    c.text(64, 210, "Access Bank", 30, "#2A2623", "600SemiBold", anchor="lm")
    c.rrect(40, 290, 520, 370, 22, "#F6F4F0", "#D8D2CA", 3)
    c.text(64, 330, "0123456789", 30, "#2A2623", "600SemiBold", anchor="lm")
    c.rrect(40, 410, 520, 490, 22, "#FDECEC", "#E5484D", 3)
    c.text(64, 450, "Account not found", 30, "#B42318", "600SemiBold", anchor="lm")
    c.rrect(40, 880, 520, 960, 40, "#EB6C1A")
    c.text(280, 920, "Save details", 32, "#FFFFFF", "700Bold", anchor="mm")
    c.save(path, size=(448, 800), quality=86)


def placeholder(path):
    c = Canvas("#F1EFEA", "#E4E0D9")
    c.rrect(300, 320, 700, 680, 50, None, "#B9B3AA", 22)
    c.circle(420, 440, 42, "#B9B3AA")
    c.poly([(310, 660), (480, 500), (580, 600), (640, 540), (690, 660)], "#B9B3AA")
    c.save(path)


def main():
    placeholder(OUT / "shop" / "placeholder.jpg")
    for name, draw in PRODUCTS.items():
        draw(OUT / "products" / f"{name}.jpg")
    for name, draw in FOOD.items():
        draw(OUT / "food" / f"{name}.jpg")
    for name, draw in SERVICES.items():
        draw(OUT / "services" / f"{name}.jpg")

    people = {
        "ada": ("#B77B50", "#2A1A12", "#3D5A80", "#F3D9C5", "long"),
        "tunde": ("#8A5A3C", "#16100C", "#27B27C", "#D4E8DC", "short"),
        "grace": ("#C68E63", "#1C1410", "#EB6C1A", "#F9DEC9", "afro"),
        "chidi": ("#6F4528", "#0E0A08", "#2F6FEB", "#D6E1F7", "bald"),
        "fatima": ("#A86B45", "#2A1A12", "#7B4AA8", "#E8DDF3", "wrap"),
        "seller": ("#8A5A3C", "#16100C", "#2A2623", "#E7E2DC", "short"),
    }
    for name, (skin, hair, shirt, bg, style) in people.items():
        avatar(OUT / "people" / f"{name}.jpg", skin, hair, shirt, bg, style)

    shop_logo(OUT / "shop" / "logo.png")
    monogram_logo(OUT / "shop" / "logo-kitchen.png", "#C4521B", "#8F3410", "MN", "pot")
    monogram_logo(OUT / "shop" / "logo-fixit.png", "#2F6FEB", "#1F4FB5", "FI", "wrench")
    banner(OUT / "shop" / "banner-1.jpg", "#FF8A3D", "#EB6C1A", "Campus Mart", "Everything for hostel life", "#FFB074")
    banner(OUT / "shop" / "banner-2.jpg", "#3D5A80", "#25395A", "Back to school", "Notebooks, bags and more", "#6C8EBF")
    banner(OUT / "shop" / "banner-3.jpg", "#27B27C", "#1B8A5E", "Free delivery", "On campus orders above 5,000 naira", "#6FD6AC")

    id_card(OUT / "documents" / "student-id.jpg")
    cac_certificate(OUT / "documents" / "cac-certificate.jpg")
    cac_certificate(OUT / "documents" / "cac-certificate.pdf")
    support_screenshot(OUT / "documents" / "support-screenshot.jpg")


def write_index():
    """Rewrites src/demo/images/index.ts so every generated file is registered."""
    files = sorted(p for p in OUT.glob("*/*") if p.suffix in (".jpg", ".png", ".pdf"))
    lines = [
        'import { Image } from "react-native";',
        "",
        "// Generated by scripts/generate-demo-images.py. Metro needs literal require()",
        "// paths, so every file is listed here.",
        "const SOURCES = {",
    ]
    for f in files:
        rel = f.relative_to(OUT).as_posix()
        key = rel if f.suffix == ".pdf" else rel.rsplit(".", 1)[0]
        lines.append(f'  "{key}": require("./{rel}"),')
    lines += [
        "} as const;",
        "",
        "export type DemoImageKey = keyof typeof SOURCES;",
        "",
        "/** URI the <Image> component and the API mock can use for a bundled file. */",
        "export function demoImage(key: DemoImageKey): string {",
        "  return Image.resolveAssetSource(SOURCES[key])?.uri ?? \"\";",
        "}",
        "",
        "export const DEMO_IMAGE_KEYS = Object.keys(SOURCES) as DemoImageKey[];",
        "",
    ]
    (OUT / "index.ts").write_text("\n".join(lines))
    print("wrote", (OUT / "index.ts").relative_to(ROOT))


if __name__ == "__main__":
    os.chdir(ROOT)
    main()
    write_index()
