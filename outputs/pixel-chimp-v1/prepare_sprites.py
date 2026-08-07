from pathlib import Path

from PIL import Image


ROOT = Path(__file__).parent
INPUT = ROOT / "transparent"
OUTPUT = ROOT / "atlas"
PREVIEW = ROOT / "preview"
COLS = 4
ROWS = 4
CELL = 192


def build_atlas(source_path: Path) -> None:
    source = Image.open(source_path).convert("RGBA")
    frame_width = (
        256
        if source_path.stem == "fire-v2" or source_path.stem.endswith("-wide")
        else CELL
    )
    left_padding = frame_width - CELL
    atlas = Image.new("RGBA", (frame_width * COLS * ROWS, CELL))
    frames: list[Image.Image] = []
    source_cell_w = source.width / COLS
    source_cell_h = source.height / ROWS

    for row in range(ROWS):
        for col in range(COLS):
            index = row * COLS + col
            box = (
                round(col * source_cell_w),
                round(row * source_cell_h),
                round((col + 1) * source_cell_w),
                round((row + 1) * source_cell_h),
            )
            frame = source.crop(box).resize(
                (CELL, CELL), Image.Resampling.NEAREST
            )
            preview_frame = Image.new("RGBA", (frame_width, CELL))
            preview_frame.alpha_composite(frame, (left_padding, 0))
            frames.append(preview_frame)
            atlas.alpha_composite(
                preview_frame,
                (index * frame_width, 0),
            )

    OUTPUT.mkdir(exist_ok=True)
    atlas.save(OUTPUT / f"{source_path.stem}.png", optimize=True)
    atlas.save(
        OUTPUT / f"{source_path.stem}.webp",
        "WEBP",
        lossless=True,
        method=6,
    )
    PREVIEW.mkdir(exist_ok=True)
    frames[0].save(
        PREVIEW / f"{source_path.stem}.gif",
        save_all=True,
        append_images=frames[1:],
        duration=62,
        loop=0,
        disposal=2,
    )


for path in sorted(INPUT.glob("*.png")):
    build_atlas(path)
    print(f"{path.stem}: 16 frames, {CELL}x{CELL}")
