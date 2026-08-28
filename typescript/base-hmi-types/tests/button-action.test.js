import assert from "node:assert/strict";
import test from "node:test";

import { HmiButtonAction } from "../dist/index.js";

test("button actions expose configured button value without renumbering existing actions", () => {
  assert.equal(HmiButtonAction.SetToOne, 3);
  assert.equal(HmiButtonAction.ButtonValue, 4);
});
