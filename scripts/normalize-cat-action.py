import sys
from pathlib import Path

from PIL import Image


source_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])

SOURCE_COLS = 4
SOURCE_ROWS = 4
FRAME_COUNT = SOURCE_COLS * SOURCE_ROWS
CELL_W = 256
CELL_H = 192
BOTTOM = 185
PADDING = 12

source = Image.open(source_path).convert("RGBA")
source_cell_w = source.width / SOURCE_COLS
source_cell_h = source.height / SOURCE_ROWS
frames = []

for row in range(SOURCE_ROWS):
    for col in range(SOURCE_COLS):
        left = round(col * source_cell_w)
        top = round(row * source_cell_h)
        right = round((col + 1) * source_cell_w)
        bottom = round((row + 1) * source_cell_h)
        cell = source.crop((left, top, right, bottom))
        alpha_box = cell.getchannel("A").point(lambda value: 255 if value > 24 else 0).getbbox()
        if alpha_box is None:
            raise RuntimeError(f"Frame {row * SOURCE_COLS + col + 1} is empty")
        frames.append(cell.crop(alpha_box))

largest_width = max(frame.width for frame in frames)
largest_height = max(frame.height for frame in frames)
global_scale = min(
    (CELL_W - PADDING * 2) / largest_width,
    (CELL_H - PADDING) / largest_height,
)

atlas = Image.new("RGBA", (CELL_W * FRAME_COUNT, CELL_H))
for index, frame in enumerate(frames):
    width = max(1, round(frame.width * global_scale))
    height = max(1, round(frame.height * global_scale))
    normalized = frame.resize((width, height), Image.Resampling.LANCZOS)
    x = index * CELL_W + (CELL_W - width) // 2
    y = BOTTOM - height
    atlas.alpha_composite(normalized, (x, y))

output_path.parent.mkdir(parents=True, exist_ok=True)
atlas.save(output_path, "WEBP", quality=90, method=6)
print(f"Wrote {output_path} ({FRAME_COUNT} frames, scale {global_scale:.4f})")
