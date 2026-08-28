import assert from "node:assert/strict";
import test from "node:test";

import { expressionProperty, HmiGauge } from "../dist/index.js";

test("linear gauge retains process and limit bindings", () => {
  const gauge = new HmiGauge();
  gauge.engineeringUnit = expressionProperty("{Unit}");
  gauge.targetValue = expressionProperty("{Target}");
  gauge.targetHighDeviation = expressionProperty("{HighDeviation}");
  gauge.targetLowDeviation = expressionProperty("{LowDeviation}");
  gauge.setpointValue = expressionProperty("{Setpoint}");
  gauge.thresholdHighHigh = expressionProperty("{HighHigh}");
  gauge.thresholdHigh = expressionProperty("{High}");
  gauge.thresholdLow = expressionProperty("{Low}");
  gauge.thresholdLowLow = expressionProperty("{LowLow}");
  gauge.controlLimitHighHigh = expressionProperty("{ControlHighHigh}");
  gauge.controlLimitHigh = expressionProperty("{ControlHigh}");
  gauge.controlLimitLow = expressionProperty("{ControlLow}");
  gauge.controlLimitLowLow = expressionProperty("{ControlLowLow}");

  assert.equal(gauge.engineeringUnit.expression, "{Unit}");
  assert.equal(gauge.targetValue.expression, "{Target}");
  assert.equal(gauge.controlLimitLowLow.expression, "{ControlLowLow}");
});
