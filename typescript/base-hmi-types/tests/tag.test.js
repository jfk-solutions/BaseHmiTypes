import assert from "node:assert/strict";
import test from "node:test";

import { HmiTag } from "../dist/index.js";

test("tag retains exported alarm and value type metadata", () => {
  const tag = new HmiTag();
  tag.name = "Pressure";
  tag.alarmed = true;
  tag.valueType = "F";

  assert.equal(tag.alarmed, true);
  assert.equal(tag.valueType, "F");
});
