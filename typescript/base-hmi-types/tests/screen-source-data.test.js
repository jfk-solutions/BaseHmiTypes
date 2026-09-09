import assert from "node:assert/strict";
import test from "node:test";

import { HmiScreen, HmiState } from "../dist/index.js";

test("screen retains parser-specific source data", () => {
  const screen = new HmiScreen();
  screen.sourceFormat = "ExampleDisplay";
  screen.sourceData = Uint8Array.of(1, 2, 3);
  screen.sourceProperties.futureSetting = "enabled";

  assert.equal(screen.sourceFormat, "ExampleDisplay");
  assert.deepEqual(screen.sourceData, Uint8Array.of(1, 2, 3));
  assert.equal(screen.sourceProperties.futureSetting, "enabled");
});

test("state retains parser-specific source data", () => {
  const state = new HmiState();
  state.sourceFormat = "ExampleStateRecord";
  state.sourceData = Uint8Array.of(4, 5, 6);
  state.sourceProperties["field.0x00.uint32le"] = "0x00000001";

  assert.equal(state.sourceFormat, "ExampleStateRecord");
  assert.deepEqual(state.sourceData, Uint8Array.of(4, 5, 6));
  assert.equal(state.sourceProperties["field.0x00.uint32le"], "0x00000001");
});
