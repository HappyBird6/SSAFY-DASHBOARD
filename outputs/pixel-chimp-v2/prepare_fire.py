from pathlib import Path

from PIL import Image


ROOT = Path(__file__).parent
SOURCE = ROOT / "source" / "fire-right-grid-chroma.png"
ATLAS = ROOT / "atlas"
PREVIEW = ROOT / "preview"
PUBLIC = ROOT.parents[1] / "public" / "assets"
FRAME_COUNT = 16
FRAME_SIZE = (256, 192)
ANCHOR_X = 180
COLS = 4
ROWS = 4


def is_guide(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    return a > 60 and r > 120 and b > 70 and g < 130


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    green = a > 0 and g > 80 and g > r * 1.22 and g > b * 1.22
    magenta = a > 0 and r > 110 and b > 80 and g < 155 and abs(r - b) < 115
    return green or magenta


source = Image.open(SOURCE).convert("RGBA")
cell_width = source.width // COLS
cell_height = source.height // ROWS

right_frames: list[Image.Image] = []
for index in range(FRAME_COUNT):
    row, col = divmod(index, COLS)
    cell = source.crop(
        (col * cell_width, row * cell_height,
         (col + 1) * cell_width, (row + 1) * cell_height)
    )
    guide_scores = [
        sum(is_guide(cell.getpixel((x, y))) for y in range(cell.height))
        for x in range(cell.width)
    ]
    guide_x = max(range(cell.width), key=guide_scores.__getitem__)
    if guide_scores[guide_x] < 45:
        raise RuntimeError(f"Frame {index} has no stable edge guide")
    left = max(0, guide_x - 210)
    right = min(cell.width, guide_x + 90)
    top = 18
    bottom = min(cell.height, 238)
    crop = cell.crop((left, top, right, bottom))
    pixels = crop.load()
    for y in range(crop.height):
        for x in range(crop.width):
            if is_background(pixels[x, y]):
                pixels[x, y] = (0, 0, 0, 0)

    scale = min(0.84, (FRAME_SIZE[1] - 4) / crop.height)
    resized = crop.resize(
        (round(crop.width * scale), round(crop.height * scale)),
        Image.Resampling.NEAREST,
    )
    frame = Image.new("RGBA", FRAME_SIZE)
    anchor_in_crop = round((guide_x - left) * scale)
    frame.alpha_composite(resized, (ANCHOR_X - anchor_in_crop, 2))
    right_frames.append(frame)

left_frames = [frame.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for frame in right_frames]


def save(name: str, frames: list[Image.Image]) -> None:
    atlas = Image.new("RGBA", (FRAME_SIZE[0] * FRAME_COUNT, FRAME_SIZE[1]))
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * FRAME_SIZE[0], 0))
    ATLAS.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    atlas_path = ATLAS / f"{name}.webp"
    atlas.save(atlas_path, "WEBP", lossless=True, method=6)
    atlas.save(PUBLIC / f"pixel-chimp-{name}.webp", "WEBP", lossless=True, method=6)
    frames[0].save(
        PREVIEW / f"{name}.gif",
        save_all=True,
        append_images=frames[1:],
        duration=131,
        loop=0,
        disposal=2,
    )


save("fire-right", right_frames)
save("fire-left", left_frames)
print("Built direction-specific chimp firing atlases")
