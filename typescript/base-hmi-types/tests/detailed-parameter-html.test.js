import assert from "node:assert/strict";
import test from "node:test";
import { HmiDetailedParameterControl, HmiScreen, HmiLayer, HmiScreenToHtmlConverter } from "../dist/index.js";

test("missing detailed parameter settings do not fabricate configuration or records", async () => {
  const screen = new HmiScreen(), layer = new HmiLayer();
  layer.items.push(new HmiDetailedParameterControl()); screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(html.includes("Parameter set selection not decoded"));
  assert.ok(html.includes("Parameter data not loaded"));
  for (const value of ["data-edit-mode=", "data-hide-details=", "data-parameter-set-type-fixed=",
    'class="hmi-parameter-toolbar"', 'class="hmi-parameter-status-bar"', " · Fixed"])
    assert.equal(html.includes(value), false, value);
});
