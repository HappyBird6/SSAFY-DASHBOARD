import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("includes the core dashboard capabilities", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  for (const capability of [
    '"bookmark"',
    '"note"',
    '"todo"',
    "WIDGET＋",
    "LOCAL STORAGE",
    "backupSchema",
    "interact(",
  ])
    assert.match(source, new RegExp(capability.replace("(", "\\(")));
});

test("keeps the dashboard cat in exactly one sprite state", async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  for (const sprite of ["sit", "crouch", "loaf", "jump", "groom", "wheel"])
    assert.match(source, new RegExp(`pixel-cat-${sprite}\\.webp`));

  assert.match(source, /setPose\("jump"\)/);
  assert.doesNotMatch(source, /setPose\("sleep"\)/);
  assert.doesNotMatch(source, /setPose\(distance/);
  assert.match(styles, /animation: cat-frames 1s steps\(15\) infinite/);
});
