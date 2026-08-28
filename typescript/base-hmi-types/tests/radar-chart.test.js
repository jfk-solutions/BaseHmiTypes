import assert from "node:assert/strict";
import test from "node:test";

import { HmiObjectType, HmiRadarChartControl } from "../dist/index.js";

test("radar chart has its concrete object type", () => {
  assert.equal(
    new HmiRadarChartControl().hmiObjectType,
    HmiObjectType.HmiRadarChartControl,
  );
});
