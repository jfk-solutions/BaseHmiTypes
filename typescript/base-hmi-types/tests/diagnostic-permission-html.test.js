import assert from "node:assert/strict";
import test from "node:test";
import { HmiSystemDiagnosisControl, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";
test("Diagnostic permissions remain optional without configured columns", async () => {
  const control = new HmiSystemDiagnosisControl(), screen = new HmiScreen(), layer = new HmiLayer(), renderer = new HmiScreenToHtmlConverter();
  layer.items.push(control); screen.layers.push(layer);
  const keys = ["filter-by-column", "column-resize", "column-reorder"];
  let html = await renderer.convertAsync(screen);
  for (const key of keys) assert.ok(!html.includes(`data-allow-${key}=`));
  for (const enabled of [false, true]) {
    control.allowFilterByColumn = staticProperty(enabled); control.allowColumnResize = staticProperty(enabled); control.allowColumnReorder = staticProperty(enabled);
    html = await renderer.convertAsync(screen);
    for (const key of keys) assert.ok(html.includes(`data-allow-${key}="${enabled}"`));
    assert.ok(html.includes("Diagnostic data not loaded")); assert.ok(!html.includes("hmi-diagnosis-table"));
  }
  control.allowFilterByColumn = undefined; control.allowColumnResize = undefined; control.allowColumnReorder = undefined;
  html = await renderer.convertAsync(screen);
  for (const key of keys) assert.ok(!html.includes(`data-allow-${key}=`));
});
