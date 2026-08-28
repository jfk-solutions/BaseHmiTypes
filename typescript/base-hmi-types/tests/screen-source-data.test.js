import assert from "node:assert/strict";
import test from "node:test";

import { HmiScreen } from "../dist/index.js";

test("screen retains parser-specific source data", () => {
  const screen = new HmiScreen();
  screen.sourceFormat = "ExampleDisplay";
  screen.sourceData = Uint8Array.of(1, 2, 3);
  screen.sourceProperties.futureSetting = "enabled";

  assert.equal(screen.sourceFormat, "ExampleDisplay");
  assert.deepEqual(screen.sourceData, Uint8Array.of(1, 2, 3));
  assert.equal(screen.sourceProperties.futureSetting, "enabled");
});
