import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("includes the core dashboard capabilities", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const capability of ["BOOKMARK", "NOTE", "TODO", "LOCAL STORAGE", "backupSchema", "interact("]) assert.match(source, new RegExp(capability.replace("(", "\\(")));
});
