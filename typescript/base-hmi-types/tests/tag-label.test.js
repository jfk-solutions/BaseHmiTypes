import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiLabel,
  HmiMultilingualText,
  staticProperty,
  tagProperty
} from "../dist/index.js";

test("tag label retains metadata binding and field length", () => {
  const label = new HmiLabel();
  label.text = tagProperty(
    "Tank.Level",
    HmiMultilingualText.fromText("bar"),
    "EngineeringUnits",
  );
  label.fieldLength = staticProperty(12);

  assert.equal(label.text.tagName, "Tank.Level");
  assert.equal(label.text.propertyName, "EngineeringUnits");
  assert.equal(label.fieldLength.staticValue, 12);
});
