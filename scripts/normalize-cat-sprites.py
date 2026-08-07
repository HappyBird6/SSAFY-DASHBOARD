import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


source_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
COLS, ROWS = 8, 4
CELL_W, CELL_H = 256, 192
BOTTOM = 185

source = Image.open(source_path).convert("RGBA")
mask = np.asarray(source.getchannel("A")) > 24
labels, count = ndimage.label(mask)
objects = ndimage.find_objects(labels)
components = []

for label_id, slices in enumerate(objects, start=1):
    if slices is None:
        continue
    area = int(np.count_nonzero(labels[slices] == label_id))
    if area < 1200:
        continue
    y_slice, x_slice = slices
    components.append(
        {
            "box": (x_slice.start, y_slice.start, x_slice.stop, y_slice.stop),
            "cx": (x_slice.start + x_slice.stop) / 2,
            "cy": (y_slice.start + y_slice.stop) / 2,
        }
    )

if len(components) < 28:
    raise RuntimeError(f"Expected at least 28 cat frames, found {len(components)}")

components.sort(key=lambda item: item["cy"])
gaps = sorted(
    range(len(components) - 1),
    key=lambda index: components[index + 1]["cy"] - components[index]["cy"],
    reverse=True,
)[:3]
breaks = sorted(index + 1 for index in gaps)
rows = []
start = 0
for end in [*breaks, len(components)]:
    rows.append(components[start:end])
    start = end

if len(rows) != ROWS or any(len(row) not in (7, 8) for row in rows):
    raise RuntimeError(f"Unexpected row sizes: {[len(row) for row in rows]}")
atlas = Image.new("RGBA", (CELL_W * COLS, CELL_H * ROWS))
largest_width = max(item["box"][2] - item["box"][0] for item in components)
largest_height = max(item["box"][3] - item["box"][1] for item in components)
global_scale = min((CELL_W - 14) / largest_width, (CELL_H - 14) / largest_height)

for row_index, row in enumerate(rows):
    row.sort(key=lambda item: item["cx"])
    for col_index, item in enumerate(row):
        subject = source.crop(item["box"])
        width = round(subject.width * global_scale)
        height = round(subject.height * global_scale)
        subject = subject.resize((width, height), Image.Resampling.LANCZOS)
        left = (CELL_W - width) // 2
        top = BOTTOM - height
        atlas.alpha_composite(
            subject,
            (col_index * CELL_W + left, row_index * CELL_H + top),
        )
    if len(row) == 7:
        previous = atlas.crop(
            (
                6 * CELL_W,
                row_index * CELL_H,
                7 * CELL_W,
                (row_index + 1) * CELL_H,
            )
        )
        atlas.alpha_composite(previous, (7 * CELL_W, row_index * CELL_H))

atlas.save(output_path, "WEBP", quality=90, method=6)
