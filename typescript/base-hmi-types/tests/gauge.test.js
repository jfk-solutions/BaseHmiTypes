import assert from "node:assert/strict";
import test from "node:test";

import {
  expressionProperty,
  hmiColorFromArgb,
  HmiGauge,
  HmiLineStyle,
  staticProperty,
} from "../dist/index.js";

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

test("linear gauge retains sparkline presentation", () => {
  const gauge = new HmiGauge();
  gauge.sparklineEnabled = staticProperty(true);
  gauge.gaugeBarSize = staticProperty(18);
  gauge.sparklineLineWidth = staticProperty(3);
  gauge.sparklineDurationSeconds = staticProperty(120);
  gauge.sparklineGridLineStyle = staticProperty(HmiLineStyle.Dash);
  gauge.sparklineGridLineCount = staticProperty(6);
  gauge.sparklineGridLineColor = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  gauge.sparklineThresholdLinesVisible = staticProperty(true);

  assert.equal(gauge.sparklineEnabled.staticValue, true);
  assert.equal(gauge.gaugeBarSize.staticValue, 18);
  assert.equal(gauge.sparklineLineWidth.staticValue, 3);
  assert.equal(gauge.sparklineDurationSeconds.staticValue, 120);
  assert.equal(gauge.sparklineGridLineStyle.staticValue, HmiLineStyle.Dash);
  assert.equal(gauge.sparklineGridLineCount.staticValue, 6);
  assert.equal(gauge.sparklineGridLineColor.staticValue.red, 0x12);
  assert.equal(gauge.sparklineThresholdLinesVisible.staticValue, true);
});
