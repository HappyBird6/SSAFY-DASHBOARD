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
    "WIDGET竊?,
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

  assert.match(source, /showPose\("jump"\)/);
  assert.doesNotMatch(source, /setPose\("sleep"\)/);
  assert.doesNotMatch(source, /setPose\(distance/);
  assert.match(
    styles,
    /animation: cat-frames var\(--cat-cycle-duration, 2s\) steps\(15\) infinite/,
  );
  assert.match(source, /catAnimationSpeed: 0\.5/);
  assert.match(source, /type="range"/);
});

test("moves the cat with sampled ballistic motion", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /initialVelocityY \* elapsed/);
  assert.match(source, /0\.5 \* gravity \* elapsed \* elapsed/);
  assert.match(source, /Math\.round\(flightSeconds \* 60\)/);
  assert.doesNotMatch(source, /cubic-bezier\(\.36,\.05,\.2,1\)/);
});

test("keeps cat landings stable and away from widget corners", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /0\.1 \+ Math\.random\(\) \* 0\.8/);
  assert.match(source, /rect\.width \* landingRatio - 48/);
  assert.match(source, /target\.platformId === platformRef\.current && distance < 1/);
  assert.match(source, /platformRef\.current !== "workspace-bar"\) await travel/);
  assert.match(source, /fill: "forwards"/);
  assert.match(source, /animation\.commitStyles\(\)/);
});

test("supports direct cat interaction and idle changes on one platform", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /dashboard:cat-click/);
  assert.match(source, /role="button"/);
  assert.match(source, /settle\(target, "sit"\)/);
  assert.match(source, /scheduleRestPose\(1800 \+ Math\.random\(\) \* 2200\)/);
  assert.match(source, /candidate !== poseRef\.current/);
  assert.match(source, /}, 700\);/);
});

test("adds a draggable chimp companion with cat interaction", async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(source, /chimpPlacements/);
  assert.match(source, /pixel-chimp-hang\.webp/);
  assert.match(source, /pixel-chimp-fire-\$\{placement\.side\}\.webp/);
  assert.match(source, /window\.addEventListener\("pointermove"/);
  assert.match(source, /window\.addEventListener\("pointerup"/);
  assert.match(source, /dashboard:cat-platform/);
  assert.match(source, /document\.documentElement\.dataset\.catPlatform/);
  assert.match(source, /currentCatPlatform !== placement\.widgetId/);
  assert.match(source, /excludeIds: \[placement\.widgetId\]/);
  assert.match(source, /firing \? 68 : 33\.5/);
  assert.match(source, /firing \? 60 : 94\.5/);
  assert.doesNotMatch(source, /cooldownRef/);
  assert.match(styles, /\.dashboard-chimp/);
  assert.match(styles, /background-size: 2048px 96px/);
  assert.doesNotMatch(styles, /\.chimp-shot/);
  assert.match(styles, /animation: chimp-fire-frames 2\.1s/);
  assert.match(styles, /animation: chimp-hang-frames 2\.4s/);
  assert.match(styles, /\.dashboard-chimp\.chimp-fire > span/);
});