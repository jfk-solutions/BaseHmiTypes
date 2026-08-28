import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiReferenceObjectSettings,
  HmiReferenceParameter,
} from "../dist/index.js";

test("reference object settings retain parameter assignments", () => {
  const settings = new HmiReferenceObjectSettings();
  settings.source = "Library.Motor";
  const parameter = new HmiReferenceParameter();
  parameter.name = "#1";
  parameter.description = "Motor tag";
  parameter.value = "[PLC]Motor1";
  settings.parameters.push(parameter);

  assert.deepEqual(settings.parameters, [parameter]);
});
