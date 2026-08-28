import assert from "node:assert/strict";
import test from "node:test";

import {
  expressionProperty,
  HmiArrowIndicator,
  HmiObjectType,
  staticProperty
} from "../dist/index.js";

test("arrow indicator retains travel range and value binding", () => {
  const arrow = new HmiArrowIndicator();
  arrow.value = expressionProperty("{Level}", 50);
  arrow.beginValue = staticProperty(0);
  arrow.endValue = staticProperty(100);
  arrow.orientation = staticProperty(1);

  assert.equal(arrow.hmiObjectType, HmiObjectType.HmiArrowIndicator);
  assert.equal(arrow.value.expression, "{Level}");
  assert.equal(arrow.beginValue.staticValue, 0);
  assert.equal(arrow.endValue.staticValue, 100);
  assert.equal(arrow.orientation.staticValue, 1);
});
