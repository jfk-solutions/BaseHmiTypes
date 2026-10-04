import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFunctionTrendControl, HmiTrendXValueAxis, HmiTrendAxisScaleType,
  hmiColorFromArgb, HmiVerticalAlignment, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";

test("numeric X axis metadata exports as typed JSON with escaped names", async () => {
  const screen = new HmiScreen();
  screen.width = 640;
  screen.height = 480;
  const layer = new HmiLayer();
  screen.layers.push(layer);
  const control = new HmiFunctionTrendControl();
  layer.items.push(control);
  const axis = new HmiTrendXValueAxis();
  Object.assign(axis, {
    name: 'Input "<>&', trendWindowName: "Area", label: "Input label",
    minimumValue: staticProperty(1), maximumValue: staticProperty(100), visible: staticProperty(false), autoRange: staticProperty(true),
    divisionCount: staticProperty(4), decimalPlaces: staticProperty(2), scaleType: staticProperty(HmiTrendAxisScaleType.Logarithmic),
    exponentialFormat: staticProperty(true), color: staticProperty(hmiColorFromArgb(255, 18, 52, 86)), alignment: staticProperty(HmiVerticalAlignment.Top),
  });
  control.xValueAxes.push(axis);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const attribute = html.match(/\sx-value-axes="([^"]+)"/u)?.[1];
  assert.ok(attribute);
  const values = JSON.parse(attribute.replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&"));
  assert.deepEqual(values, [{ name: 'Input "<>&', trendWindowName: "Area", label: "Input label", minimum: 1, maximum: 100,
    visible: false, autoRange: true, divisionCount: 4, decimalPlaces: 2, scaleType: 1, exponentialFormat: true, color: "#123456", alignment: "Top" }]);
});
