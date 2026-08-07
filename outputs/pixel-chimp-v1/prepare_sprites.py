from pathlib import Path

from PIL import Image, ImageDraw


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

    if source_path.stem == "fire-v2":
        # Keep the actual muzzle flash inside the sprite animation for three
        # consecutive frames so it stays readable at normal playback speed.
        firing_frame = frames[8].copy()
        draw = ImageDraw.Draw(firing_frame)
        draw.polygon(
            [(96, 82), (83, 84), (75, 76), (72, 85), (56, 82),
             (64, 92), (54, 101), (72, 99), (75, 109), (84, 100), (96, 102)],
            fill=(255, 145, 0, 255),
        )
        draw.polygon(
            [(97, 86), (84, 87), (79, 82), (77, 89), (65, 88),
             (72, 94), (64, 99), (78, 97), (81, 103), (86, 97), (97, 98)],
            fill=(255, 230, 72, 255),
        )
        draw.polygon(
            [(98, 89), (84, 89), (78, 93), (84, 97), (98, 96)],
            fill=(255, 255, 238, 255),
        )
        frames[7] = firing_frame.copy()
        frames[8] = firing_frame.copy()
        frames[9] = firing_frame.copy()

    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * frame_width, 0))

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
