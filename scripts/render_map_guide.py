#!/usr/bin/env python3
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]


def parse_color(value, fallback):
    if isinstance(value, list) and len(value) >= 3:
        return tuple(int(channel) for channel in value[:3])
    if isinstance(value, str) and value.startswith("#") and len(value) == 7:
        return tuple(int(value[index:index + 2], 16) for index in (1, 3, 5))
    return fallback


def load_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


def draw_label(draw, xy, text, font, fill=(10, 20, 28), bg=(255, 248, 205), anchor="mm"):
    x, y = xy
    bbox = draw.textbbox((x, y), text, font=font, anchor=anchor)
    pad_x = 8
    pad_y = 5
    rect = (bbox[0] - pad_x, bbox[1] - pad_y, bbox[2] + pad_x, bbox[3] + pad_y)
    draw.rounded_rectangle(rect, radius=8, fill=bg, outline=(20, 38, 46), width=2)
    draw.text((x, y), text, font=font, fill=fill, anchor=anchor)


def draw_arrow(draw, a, b, fill, width=9):
    ax, ay = a
    bx, by = b
    angle = math.atan2(by - ay, bx - ax)
    length = 24
    spread = 0.72
    p1 = (bx, by)
    p2 = (bx - math.cos(angle - spread) * length, by - math.sin(angle - spread) * length)
    p3 = (bx - math.cos(angle + spread) * length, by - math.sin(angle + spread) * length)
    draw.line([a, b], fill=fill, width=width)
    draw.polygon([p1, p2, p3], fill=fill)


def point_on_polyline(points, distance):
    remaining = distance
    for start, end in zip(points, points[1:]):
        ax, ay = start
        bx, by = end
        length = math.hypot(bx - ax, by - ay)
        if remaining <= length:
            t = remaining / length if length else 0
            return (ax + (bx - ax) * t, ay + (by - ay) * t)
        remaining -= length
    return tuple(points[-1])


def path_length(points):
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(points, points[1:]))


def render(manifest_path, output_path):
    manifest = json.loads(Path(manifest_path).read_text())
    theme = manifest.get("theme", {})
    width = manifest["world"]["width"]
    height = manifest["world"]["height"]
    points = [tuple(point) for point in manifest["route"]]
    pads = manifest["buildPads"]
    pad_radius = manifest["padRadius"]
    total_length = path_length(points)

    bg_color = parse_color(theme.get("guideBackground"), (47, 132, 67))
    grid_color = parse_color(theme.get("guideGrid"), (59, 150, 78))
    image = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(image)
    title_font = load_font(36, bold=True)
    label_font = load_font(22, bold=True)
    tiny_font = load_font(17, bold=True)

    # Subtle yard grid for scale.
    for x in range(0, width, 120):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 120):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)

    # Route: wide final road envelope, playable center, and arrows.
    draw.line(points, fill=(87, 52, 27), width=150, joint="curve")
    draw.line(points, fill=(186, 130, 76), width=124, joint="curve")
    draw.line(points, fill=(221, 170, 105), width=86, joint="curve")
    draw.line(points, fill=(255, 238, 174), width=7, joint="curve")
    for distance in range(165, int(total_length) - 80, 205):
        a = point_on_polyline(points, distance)
        b = point_on_polyline(points, distance + 34)
        draw_arrow(draw, a, b, fill=(118, 77, 42), width=7)

    # Entrance and exit bounds.
    for key, fill, text in [
        ("entrance", (74, 163, 255), "ENTRANCE"),
        ("exit", (126, 247, 91), "EXIT"),
    ]:
        rect = manifest[key]
        box = (rect["x"], rect["y"], rect["x"] + rect["width"], rect["y"] + rect["height"])
        draw.rounded_rectangle(box, radius=18, outline=fill, width=8, fill=(*fill[:3],) if False else None)
        label_x = max(82, min(width - 82, box[0] + rect["width"] / 2))
        label_y = max(28, box[1] - 20)
        draw_label(draw, (label_x, label_y), text, label_font, bg=(226, 247, 255))

    # Build sockets and exact touch radii.
    for index, pad in enumerate(pads, start=1):
        x = pad["x"]
        y = pad["y"]
        nearest = pad.get("nearestPath")
        if nearest:
            draw.line([(x, y), (nearest["x"], nearest["y"])], fill=(255, 246, 142), width=4)
        draw.ellipse(
            (x - pad_radius, y - pad_radius * 0.52, x + pad_radius, y + pad_radius * 0.52),
            fill=(20, 54, 52),
            outline=(255, 237, 104),
            width=6,
        )
        draw.ellipse((x - 54, y - 30, x + 54, y + 30), fill=(18, 32, 36), outline=(226, 212, 151), width=4)
        draw.line([(x - 25, y), (x + 25, y)], fill=(140, 245, 116), width=6)
        draw.line([(x, y - 25), (x, y + 25)], fill=(140, 245, 116), width=6)
        draw_label(draw, (x, y + pad_radius * 0.72), f"{index}. {pad['id']}", tiny_font)

    title = theme.get("guideTitle") or f"{manifest['id']} route/socket guide"
    footer = theme.get("guideFooter") or "Use as GPT Image 2 composition reference: preserve road, sockets, entrance, and exit exactly."
    draw_label(draw, (width / 2, 44), title, title_font, bg=(226, 247, 255))
    draw_label(draw, (width / 2, height - 42), footer, label_font, bg=(255, 248, 205))

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)
    return output_path


def main():
    if len(sys.argv) == 1:
        manifests = sorted((ROOT / "assets/maps").glob("*.manifest.json"))
        for manifest in manifests:
            data = json.loads(manifest.read_text())
            output = ROOT / data.get("guideImage", f"assets/maps/{data['id']}-guide.png")
            print(render(manifest, output))
        return

    manifest = Path(sys.argv[1])
    data = json.loads(manifest.read_text())
    output = ROOT / data.get("guideImage", f"assets/maps/{data['id']}-guide.png")
    if len(sys.argv) > 2:
        output = Path(sys.argv[2])
    print(render(manifest, output))


if __name__ == "__main__":
    main()
