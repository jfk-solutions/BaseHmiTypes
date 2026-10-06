import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiRecipeControl, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";

async function render(control) {
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(control);
  return await new HmiScreenToHtmlConverter().convertAsync(screen);
}
for (const [property, key] of [["headerFontReferenceDeviceSize", "header"], ["contentFontReferenceDeviceSize", "content"], ["statusBarFontReferenceDeviceSize", "status-bar"], ["comboBoxFontReferenceDeviceSize", "combo-box"]]) {
  for (const value of [0, 1.25, -2.5]) test(`Raw font sizes keep their own metadata without creating fonts: ${key}/${value}`, async () => {
    const control = new HmiRecipeControl(); control[property] = staticProperty(value);
    const html = await render(control);
    for (const candidate of ["header", "content", "status-bar", "combo-box"]) assert.equal(html.includes(`data-${candidate}-font-reference-device-size=`), candidate === key);
    assert.ok(html.includes(`data-${key}-font-reference-device-size="${value}"`));
    for (const font of ["headerFont", "contentFont", "statusBarFont", "comboBoxFont"]) assert.equal(control[font], undefined);
  });
}
test("Absent raw sizes have no metadata", async () => {
  assert.ok(!(await render(new HmiRecipeControl())).includes("font-reference-device-size="));
});
