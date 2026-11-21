#!/usr/bin/env python3
"""
Generates the illustrations used by the customer + rider app's demo mode.

    python3 scripts/generate-demo-customer-images.py

Extends scripts/generate-demo-images.py (it imports that file's Canvas and
helpers, and the vendor demo keeps using its own images): writes JPEG/PNG files
to src/demo/customer/images/<group>/ and rewrites images/index.ts, the registry
the demo data reads. Food photos that already exist for the vendor demo
(src/demo/images/food) are re-used by the registry, not drawn twice.

Everything is a flat illustration drawn with Pillow, so no stock photo licences
or external services are involved. Replace any file with a real photo of the
same name and extension and the demo picks it up unchanged.
"""

from __future__ import annotations

import importlib.util
import math
import os
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "demo" / "customer" / "images"

_spec = importlib.util.spec_from_file_location("vendor_images", ROOT / "scripts" / "generate-demo-images.py")
base = importlib.util.module_from_spec(_spec)  # type: ignore[arg-type]
_spec.loader.exec_module(base)  # type: ignore[union-attr]
base.OUT = ROOT / "src" / "demo" / "images"

Canvas, stage, plate, speckle, drumstick = base.Canvas, base.stage, base.plate, base.speckle, base.drumstick
shade, mix, RENDER = base.shade, base.mix, base.RENDER


def square(top: str, bottom: str, size: int = 800) -> "Canvas":
    """Square canvas (size x size units) with a vertical gradient."""
    c = Canvas(top, bottom, size, size)
    c.k = RENDER / size
    c.size = (RENDER, RENDER)
    c.img = Image.new("RGBA", c.size)
    px = ImageDraw.Draw(c.img)
    for y in range(RENDER):
        px.line([(0, y), (RENDER, y)], fill=mix(top, bottom, y / RENDER))
    c.d = ImageDraw.Draw(c.img)
    return c


# ===========================================================================
# Vendor logos (400x400 PNG, shown in the ShopLogo tile at 24 to 72 px)
# ===========================================================================


def logo_mt(path):
    c = square("#F27D2E", "#EB6C1A")
    c.text(400, 360, "MT", 300, "#FFFFFF", "800ExtraBold", anchor="mm")
    c.arc((230, 440, 570, 620), 20, 160, "#FFFFFF", 30)
    c.save(path, size=(400, 400))


def logo_bites(path):
    c = square("#2A211B", "#14100C")
    c.circle(400, 440, 190, "#EB6C1A")
    c.circle(330, 400, 70, "#FF9B5A")
    c.rrect(385, 190, 415, 290, 14, "#6FA032")
    c.poly([(415, 210), (540, 180), (500, 270), (415, 260)], "#6FA032")
    c.save(path, size=(400, 400))


def logo_suya(path):
    c = square("#8A3A1B", "#5A2410")
    flame = [(400, 120), (540, 330), (560, 480), (480, 640), (400, 690), (320, 640), (240, 480), (270, 360), (340, 420)]
    c.poly(flame, "#F0821E")
    c.poly([(400, 330), (480, 470), (470, 590), (400, 640), (330, 590), (330, 470)], "#FFB74D")
    c.poly([(400, 470), (440, 550), (400, 610), (360, 550)], "#FFF1C9")
    c.save(path, size=(400, 400))


def logo_amala(path):
    c = square("#2E7D4F", "#1B5A36")
    c.ell(170, 330, 630, 600, "#FFFFFF")
    c.ell(220, 300, 580, 520, "#7A4A1E")
    c.ell(260, 310, 540, 460, "#8E5A28")
    for x in (300, 400, 500):
        c.arc((x - 30, 120, x + 30, 260), 90, 270, "#FFFFFF", 18)
    c.save(path, size=(400, 400))


def logo_crumbs(path):
    c = square("#F28AAE", "#D9578A")
    c.rrect(190, 400, 610, 620, 40, "#FFFFFF")
    c.rrect(190, 330, 610, 440, 50, "#FBE3EC")
    for x in (260, 340, 420, 500, 560):
        c.circle(x, 440, 36, "#FBE3EC")
    c.rrect(385, 220, 415, 340, 10, "#FFFFFF")
    c.ell(370, 150, 430, 240, "#FFD166")
    c.save(path, size=(400, 400))


def logo_green(path):
    c = square("#4FA66B", "#2F7F4B")
    c.ell(130, 300, 670, 640, "#FFFFFF")
    c.ell(170, 330, 630, 600, "#BFE5C9")
    c.poly([(300, 360), (420, 180), (520, 330), (420, 420)], "#2F7F4B")
    c.poly([(430, 360), (560, 250), (600, 380), (500, 440)], "#6FBF8A")
    c.save(path, size=(400, 400))


def logo_owl(path):
    c = square("#27385C", "#141F3A")
    c.circle(400, 400, 210, "#FFD166")
    c.circle(470, 360, 190, "#1B2A4A")
    c.circle(310, 470, 14, "#FFFFFF")
    c.circle(250, 330, 9, "#FFFFFF")
    c.save(path, size=(400, 400))


LOGOS = {
    "mama-t": logo_mt,
    "campus-bites": logo_bites,
    "suya-spot": logo_suya,
    "amala-express": logo_amala,
    "sweet-crumbs": logo_crumbs,
    "green-bowl": logo_green,
    "night-owl": logo_owl,
}


# ===========================================================================
# Vendor covers (the banner behind the vendor page header)
# ===========================================================================


def cover(path, top, bottom, accent, dish):
    c = Canvas(top, bottom, 1000, 420)
    c.k = RENDER / 1000
    c.size = (RENDER, int(420 * c.k))
    c.img = Image.new("RGBA", c.size)
    px = ImageDraw.Draw(c.img)
    for x in range(c.size[0]):
        px.line([(x, 0), (x, c.size[1])], fill=mix(top, bottom, x / c.size[0]))
    c.d = ImageDraw.Draw(c.img)
    c.circle(860, 90, 250, shade(accent, 0.2))
    c.circle(160, 430, 210, shade(accent, 0.35))
    c.circle(930, 400, 130, accent)
    # A plate of the vendor's signature dish on the right.
    c.ell(560, 190, 960, 380, "#F3EEE8")
    c.ell(590, 190, 930, 340, "#FFFFFF")
    c.ell(630, 215, 890, 320, dish)
    c.ell(680, 200, 840, 270, shade(dish, 0.2))
    c.save(path, size=(900, 378), quality=82)


COVERS = {
    "mama-t": ("#FFB074", "#EB6C1A", "#FFD0A8", "#D5481B"),
    "campus-bites": ("#3A2E26", "#14100C", "#EB6C1A", "#EB6C1A"),
    "suya-spot": ("#B0522A", "#5A2410", "#F0821E", "#8E3A14"),
    "amala-express": ("#58B07C", "#1B5A36", "#9ED8B4", "#7A4A1E"),
    "sweet-crumbs": ("#F7B6CC", "#D9578A", "#FFD9E6", "#F8C7D8"),
    "green-bowl": ("#7FCB9A", "#2F7F4B", "#C9EBD4", "#6FA032"),
    "night-owl": ("#4A5E8A", "#141F3A", "#FFD166", "#E9C58B"),
    "riverside-grill": ("#9AA8B8", "#4A5663", "#D3DCE6", "#B8561B"),
}


# ===========================================================================
# New dishes (the vendor demo already has eight; see FOOD_REUSED in the index)
# ===========================================================================


def zobo(path):
    c = stage("#FBE4EA", "#F1BCC8")
    c.shadow(500, 870, 210, 30)
    c.poly([(300, 230), (700, 230), (650, 850), (350, 850)], "#FFFFFF")
    c.poly([(312, 300), (688, 300), (650, 850), (350, 850)], "#A3123A")
    c.poly([(330, 480), (672, 480), (650, 850), (350, 850)], "#7D0C2B")
    for x, y in ((420, 390), (520, 360), (590, 420), (460, 470)):
        c.circle(x, y, 26, "#E8E8E8")
    c.line([(560, 110), (580, 330)], "#6FA032", 26)
    c.ell(300, 200, 700, 270, "#F6F6F6")
    c.save(path)


def chapman(path):
    c = stage("#FFE9DC", "#F7C5A8")
    c.shadow(500, 870, 210, 30)
    c.poly([(300, 230), (700, 230), (650, 850), (350, 850)], "#FFFFFF")
    c.poly([(312, 290), (688, 290), (650, 850), (350, 850)], "#E2482A")
    c.poly([(330, 560), (672, 560), (650, 850), (350, 850)], "#F08A3A")
    c.ell(560, 250, 700, 330, "#F3C94A")
    c.circle(420, 280, 34, "#C2185B")
    c.line([(580, 120), (560, 340)], "#FFFFFF", 22)
    c.save(path)


def amala(path):
    c = stage("#F1EAD9", "#DCCFAD")
    plate(c)
    c.ell(230, 430, 560, 690, "#4A2E15")
    c.ell(250, 440, 540, 640, "#5E3B1B")
    c.ell(520, 400, 790, 680, "#3F7A2E")
    c.ell(545, 420, 765, 640, "#4E9438")
    speckle(c, 655, 530, 100, 80, ["#C23B22", "#E8C34A", "#2F5A22"], 60, (7, 13), 4)
    c.circle(380, 540, 34, "#C98B28")
    c.save(path)


def burger(path):
    c = stage("#FBEBD2", "#F0CFA0")
    c.shadow(500, 860, 320, 34)
    c.pie((220, 300, 780, 700), 180, 360, "#D68A3A")
    c.rect(220, 500, 780, 520, "#D68A3A")
    c.ell(250, 470, 750, 560, "#6FA032")
    c.rrect(230, 520, 770, 610, 40, "#6B3A1C")
    c.poly([(240, 600), (760, 600), (700, 650), (300, 650)], "#F3C94A")
    c.rrect(220, 640, 780, 740, 50, "#D68A3A")
    for x, y in ((380, 360), (500, 330), (610, 380), (440, 410)):
        c.ell(x - 14, y - 8, x + 14, y + 8, "#F9E2B8")
    c.save(path)


def grilled_chicken(path):
    c = stage("#F6E6D2", "#E8C7A0")
    plate(c)
    drumstick(c, 400, 540, 1.25)
    drumstick(c, 600, 620, 1.1, flip=-1)
    c.ell(250, 650, 420, 720, "#F2CC4A")
    c.ell(560, 450, 720, 520, "#3F8F3A")
    c.save(path)


def cake(path):
    c = stage("#FDE9EF", "#F5C6D5")
    plate(c, 500, 640, 360, 150)
    c.poly([(260, 600), (740, 600), (700, 380), (300, 380)], "#F8E1C8")
    c.poly([(262, 600), (738, 600), (730, 540), (270, 540)], "#7A3E1D")
    c.poly([(290, 470), (710, 470), (700, 410), (300, 410)], "#7A3E1D")
    c.ell(290, 340, 710, 440, "#FFFFFF")
    c.circle(500, 330, 36, "#D9344F")
    c.save(path)


def salad_bowl(path):
    c = stage("#EAF5E4", "#CDE6BF")
    c.shadow(500, 860, 340, 34)
    c.pie((200, 360, 800, 860), 0, 180, "#FFFFFF")
    c.ell(200, 520, 800, 620, "#F3F3F3")
    speckle(c, 500, 520, 270, 90, ["#4C9B3A", "#8FD06A", "#E4572E", "#F3C94A", "#FFFFFF"], 150, (14, 26), 6)
    c.ell(420, 440, 580, 520, "#E4572E")
    c.save(path)


def doughnuts(path):
    c = stage("#FFF0D6", "#F7D69E")
    c.shadow(500, 860, 380, 34)
    for cx, cy, col in ((380, 540, "#E86A92"), (620, 560, "#7A4A2A"), (500, 380, "#F3C94A")):
        c.circle(cx, cy, 170, "#D69A3C")
        c.circle(cx, cy - 10, 160, col)
        c.circle(cx, cy - 10, 62, "#F7D69E")
        for i in range(8):
            a = i * math.tau / 8
            c.ell(cx + math.cos(a) * 110 - 10, cy + math.sin(a) * 100 - 20, cx + math.cos(a) * 110 + 10, cy + math.sin(a) * 100 - 4, "#FFFFFF")
    c.save(path)


DISHES = {
    "zobo": zobo,
    "chapman": chapman,
    "amala-ewedu": amala,
    "burger": burger,
    "grilled-chicken": grilled_chicken,
    "cake-slice": cake,
    "salad-bowl": salad_bowl,
    "doughnuts": doughnuts,
}


# ===========================================================================
# Live tracking map. ROUTE below must match src/demo/customer/data/track.ts.
# ===========================================================================

# Normalised (0 to 1) points of the ride from the kitchen to the hostel.
ROUTE = [(0.14, 0.78), (0.14, 0.52), (0.38, 0.52), (0.38, 0.30), (0.66, 0.30), (0.66, 0.58), (0.86, 0.58), (0.86, 0.22)]


def tracking_map(path):
    w, h = 1000, 640
    c = Canvas("#F3EFE8", "#EEE8DE", w, h)
    c.k = RENDER / 1000
    c.size = (RENDER, int(h * c.k))
    c.img = Image.new("RGBA", c.size, "#F3EFE8")
    c.d = ImageDraw.Draw(c.img)
    # River and parks.
    c.poly([(0, 560), (300, 520), (620, 600), (1000, 540), (1000, 640), (0, 640)], "#CFE3F1")
    c.rrect(40, 60, 250, 210, 30, "#D7EBCB")
    c.rrect(720, 380, 960, 500, 30, "#D7EBCB")
    # Street grid.
    for x in (140, 380, 660, 860):
        c.rect(x - 22, 0, x + 22, 640, "#FFFFFF")
    for y in (190, 330, 520):
        c.rect(0, y - 22, 1000, y + 22, "#FFFFFF")
    for bx, by in ((220, 100), (480, 90), (560, 100), (760, 90), (240, 400), (500, 410), (760, 250), (940, 250)):
        c.rrect(bx, by, bx + 90, by + 60, 12, "#E6DED2")
    pts = [(x * w, y * h) for x, y in ROUTE]
    c.line(pts, "#FFFFFF", 30)
    c.line(pts, "#EB6C1A", 16)
    # Kitchen pin (start) and home pin (end).
    sx, sy = pts[0]
    ex, ey = pts[-1]
    c.circle(sx, sy, 34, "#1B130C")
    c.circle(sx, sy, 14, "#FFFFFF")
    c.circle(ex, ey, 40, "#EB6C1A")
    c.circle(ex, ey, 16, "#FFFFFF")
    c.save(path, size=(900, 576), quality=84)


# ===========================================================================
# Rider: vehicle photo and documents
# ===========================================================================


def motorbike(path):
    c = stage("#E7EEF6", "#C9D7E8", "#DDE4EC")
    c.shadow(500, 800, 360, 30)
    for cx in (270, 740):
        c.circle(cx, 690, 130, "#2A2623")
        c.circle(cx, 690, 78, "#C9CED6")
        c.circle(cx, 690, 22, "#2A2623")
    c.poly([(270, 690), (400, 470), (620, 470), (740, 690), (690, 690), (590, 530), (440, 530), (330, 690)], "#EB6C1A")
    c.rrect(380, 420, 600, 500, 30, "#1B130C")
    c.poly([(560, 470), (720, 300), (770, 330), (640, 490)], "#2A2623")
    c.line([(700, 320), (800, 290)], "#2A2623", 22)
    c.rrect(300, 380, 420, 430, 20, "#EB6C1A")
    c.save(path)


def national_id(path):
    c = Canvas("#EFEFEF", "#E4E4E4", 1000, 640)
    c.k = RENDER / 1000
    c.size = (RENDER, int(640 * c.k))
    c.img = Image.new("RGBA", c.size, "#F1EFEA")
    c.d = ImageDraw.Draw(c.img)
    c.rrect(40, 40, 960, 600, 40, "#FFFFFF", "#D8D2CA", 4)
    c.rect(40, 80, 960, 170, "#1F6B3A")
    c.text(500, 125, "NATIONAL IDENTITY CARD", 40, "#FFFFFF", "700Bold", anchor="mm")
    c.rrect(90, 220, 330, 520, 20, "#E7DFD3")
    c.circle(210, 330, 62, "#8A5A3C")
    c.ell(120, 400, 300, 560, "#27B27C")
    for i, (label, value) in enumerate([("Surname", "ADEYEMI"), ("First name", "TUNDE"), ("Sex", "M"), ("NIN", "000 000 000 00")]):
        y = 230 + i * 80
        c.text(380, y, label.upper(), 24, "#9A938B", "600SemiBold")
        c.text(380, y + 28, value, 38, "#2A2623", "700Bold")
    c.save(path, size=(800, 512), quality=86)


def drivers_licence(path):
    c = Canvas("#EFEFEF", "#E4E4E4", 1000, 640)
    c.k = RENDER / 1000
    c.size = (RENDER, int(640 * c.k))
    c.img = Image.new("RGBA", c.size, "#F1EFEA")
    c.d = ImageDraw.Draw(c.img)
    c.rrect(40, 40, 960, 600, 40, "#FFFFFF", "#D8D2CA", 4)
    c.rect(40, 80, 960, 170, "#B8791E")
    c.text(500, 125, "DRIVER'S LICENCE", 40, "#FFFFFF", "700Bold", anchor="mm")
    c.rrect(90, 220, 330, 520, 20, "#E7DFD3")
    c.circle(210, 330, 62, "#8A5A3C")
    c.ell(120, 400, 300, 560, "#2A2623")
    for i, (label, value) in enumerate([("Name", "TUNDE ADEYEMI"), ("Class", "A (Motorcycle)"), ("Licence no", "ABC 123 456"), ("Expires", "03/2029")]):
        y = 230 + i * 80
        c.text(380, y, label.upper(), 24, "#9A938B", "600SemiBold")
        c.text(380, y + 28, value, 38, "#2A2623", "700Bold")
    c.save(path, size=(800, 512), quality=86)


def id_selfie(path):
    c = square("#E9E1D6", "#D8CDBE", 800)
    c.ell(130, 520, 670, 1000, "#27B27C")
    c.rrect(335, 400, 465, 600, 50, "#7A4E32")
    c.ell(255, 170, 545, 480, "#8A5A3C")
    c.pie((248, 150, 552, 410), 180, 360, "#16100C")
    c.circle(340, 335, 13, "#2A2623")
    c.circle(460, 335, 13, "#2A2623")
    c.arc((350, 365, 450, 435), 20, 160, "#5A2A1A", 10)
    c.rrect(250, 600, 550, 780, 24, "#FFFFFF", "#D8D2CA", 4)
    c.rect(250, 600, 550, 640, "#1F6B3A")
    c.circle(310, 700, 34, "#8A5A3C")
    c.rect(360, 670, 520, 684, "#B9B3AA")
    c.rect(360, 710, 480, 724, "#B9B3AA")
    c.save(path, size=(480, 480), quality=86)


def main():
    for name, draw in LOGOS.items():
        draw(OUT / "logos" / f"{name}.png")
    for name, (top, bottom, accent, dish) in COVERS.items():
        cover(OUT / "covers" / f"{name}.jpg", top, bottom, accent, dish)
    for name, draw in DISHES.items():
        draw(OUT / "dishes" / f"{name}.jpg")
    tracking_map(OUT / "map" / "track.jpg")
    motorbike(OUT / "rider" / "motorbike.jpg")
    national_id(OUT / "rider" / "national-id.jpg")
    drivers_licence(OUT / "rider" / "drivers-licence.jpg")
    id_selfie(OUT / "rider" / "id-selfie.jpg")


# Images the customer demo borrows from the vendor demo (src/demo/images).
REUSED = {
    "dishes/jollof-rice": "food/jollof-rice.jpg",
    "dishes/pounded-yam-egusi": "food/pounded-yam-egusi.jpg",
    "dishes/fried-rice-plantain": "food/fried-rice-plantain.jpg",
    "dishes/suya": "food/suya.jpg",
    "dishes/shawarma": "food/shawarma.jpg",
    "dishes/puff-puff": "food/puff-puff.jpg",
    "dishes/smoothie": "food/smoothie.jpg",
    "dishes/meat-pie": "food/meat-pie.jpg",
    "people/ada": "people/ada.jpg",
    "people/tunde": "people/tunde.jpg",
    "people/grace": "people/grace.jpg",
    "people/chidi": "people/chidi.jpg",
    "people/fatima": "people/fatima.jpg",
}


def write_index():
    """Rewrites images/index.ts so every generated file is registered."""
    files = sorted(p for p in OUT.glob("*/*") if p.suffix in (".jpg", ".png"))
    lines = [
        'import { Image } from "react-native";',
        "",
        "// Generated by scripts/generate-demo-customer-images.py. Metro needs literal",
        "// require() paths, so every file is listed here. Dishes and people marked",
        "// `../../images` are shared with the vendor demo.",
        "const SOURCES = {",
    ]
    for f in files:
        rel = f.relative_to(OUT).as_posix()
        lines.append(f'  "{rel.rsplit(".", 1)[0]}": require("./{rel}"),')
    for key, rel in sorted(REUSED.items()):
        lines.append(f'  "{key}": require("../../images/{rel}"),')
    lines += [
        "} as const;",
        "",
        "export type CustomerImageKey = keyof typeof SOURCES;",
        "",
        "/** URI the <Image> component and the API mock can use for a bundled file. */",
        "export function customerImage(key: CustomerImageKey): string {",
        '  return Image.resolveAssetSource(SOURCES[key])?.uri ?? "";',
        "}",
        "",
        "export const CUSTOMER_IMAGE_KEYS = Object.keys(SOURCES) as CustomerImageKey[];",
        "",
    ]
    (OUT / "index.ts").write_text("\n".join(lines))
    print("wrote", (OUT / "index.ts").relative_to(ROOT))


if __name__ == "__main__":
    os.chdir(ROOT)
    main()
    write_index()
