import assert from "node:assert/strict";
import test from "node:test";

import { HmiRecipeParameter } from "../dist/index.js";

test("recipe parameter retains engineering metadata", () => {
  const parameter = new HmiRecipeParameter();
  parameter.name = "Pressure";
  parameter.unit = "bar";
  parameter.minimumValue = "0.0";
  parameter.maximumValue = "16.0";

  assert.equal(parameter.unit, "bar");
  assert.equal(parameter.minimumValue, "0.0");
  assert.equal(parameter.maximumValue, "16.0");
});
