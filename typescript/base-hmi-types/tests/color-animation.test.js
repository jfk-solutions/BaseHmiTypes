import assert from "node:assert/strict";
import test from "node:test";

import { HmiColorAnimation } from "../dist/index.js";

test("color animation preserves a fractional blink cycle duration in seconds", () => {
  const animation = new HmiColorAnimation();
  animation.blinkRate = 1.5;

  assert.equal(animation.blinkRate, 1.5);
});
