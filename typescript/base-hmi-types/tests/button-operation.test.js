import assert from "node:assert/strict";
import test from "node:test";

import { HmiButtonOperation } from "../dist/index.js";

test("button operations expose navigation history actions", () => {
  assert.equal(typeof HmiButtonOperation.NavigateToPreviousScreen, "number");
  assert.equal(typeof HmiButtonOperation.NavigateToNextScreen, "number");
  assert.equal(typeof HmiButtonOperation.ShowNavigationHistory, "number");
});
