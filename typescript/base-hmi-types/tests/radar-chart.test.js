import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiMultilingualText,
  HmiObjectType,
  HmiRadarChartCategory,
  HmiRadarChartControl,
  HmiRadarChartDataPoint,
  HmiRadarChartSeries,
  staticProperty,
} from "../dist/index.js";

test("radar chart has its concrete object type", () => {
  assert.equal(
    new HmiRadarChartControl().hmiObjectType,
    HmiObjectType.HmiRadarChartControl,
  );
});

test("radar chart preserves ordered categories, series, and values", () => {
  const chart = new HmiRadarChartControl();
  const category = new HmiRadarChartCategory();
  category.index = 1;
  category.name = HmiMultilingualText.fromText("Temperature");
  category.minimum = staticProperty(0);
  category.maximum = staticProperty(100);
  chart.categories.push(category);

  const series = new HmiRadarChartSeries();
  series.index = 1;
  series.name = HmiMultilingualText.fromText("Current");
  series.lineAndMarker = "Line and circle";
  const tagPoint = new HmiRadarChartDataPoint();
  tagPoint.categoryIndex = 1;
  tagPoint.tag = "{[PLC]Temperature}";
  series.dataPoints.push(tagPoint);
  const constantPoint = new HmiRadarChartDataPoint();
  constantPoint.categoryIndex = 2;
  constantPoint.constantValue = staticProperty(42.5);
  constantPoint.sourceValue = "42.5";
  series.dataPoints.push(constantPoint);
  chart.series.push(series);

  assert.equal(chart.categories[0].name.getText(), "Temperature");
  assert.equal(chart.categories[0].maximum.staticValue, 100);
  assert.equal(chart.series[0].lineAndMarker, "Line and circle");
  assert.equal(chart.series[0].dataPoints[0].tag, "{[PLC]Temperature}");
  assert.equal(chart.series[0].dataPoints[1].constantValue.staticValue, 42.5);
});
