import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiGroup, HmiButton, HmiUnkown, HmiText, HmiScreenItemBase, HmiContainerBase, HmiScreenToHtmlConverter, HmiHtmlConvertOptions, staticProperty } from "../dist/index.js";
class DerivedText extends HmiText {}
class Unsupported extends HmiScreenItemBase {}

test("Diagnostics observe actual dispatch without changing markup", async () => {
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); const group = new HmiGroup(); group.name = "Group"; layer.items.push(group);
  const button = new HmiButton(); button.id = "1"; button.name = "Button"; button.sourceFormat = "TIA WinCC Advanced"; Object.assign(button.sourceProperties, { Subtype: "Button", TiaTypeName: "Synthetic.Item", "Configured.Test": "value" });
  const unknown = new HmiUnkown(); unknown.name = "Unknown"; unknown.sourceFormat = "WinCC Classic PDL"; unknown.sourceProperties["WinCC.Object.ClassId"] = "00000000-0000-0000-0000-000000000001"; unknown.sourceProperties["WinCC.Object.ClassName"] = "SyntheticControl";
  const hidden = new HmiText(); hidden.name = "Hidden"; hidden.visible = staticProperty(false); group.items.push(button, unknown, new DerivedText(), new Unsupported(), hidden);
  const renderer = new HmiScreenToHtmlConverter(), before = await renderer.convertAsync(screen), rows = [], options = new HmiHtmlConvertOptions(); options.itemDiagnostic = row => rows.push(row);
  assert.equal(await renderer.convertAsync(screen, undefined, options), before);
  assert.deepEqual(rows.map(row => row.rendererRoute), ["HmiGroup", "HmiButton", "UnknownPlaceholder", "HmiText", "UnsupportedPlaceholder", "Hidden"]);
  assert.equal(rows[0].childCount, 5); assert.equal(rows[3].modelType, "DerivedText"); assert.equal(rows[1].itemId, "1"); assert.equal(rows[1].nativeSubtype, "Button"); assert.equal(rows[1].nativeTypeName, "Synthetic.Item");
  assert.equal(rows[2].nativeClassName, "SyntheticControl"); assert.equal(rows[2].nativeClassId, "00000000-0000-0000-0000-000000000001"); assert.equal(rows[2].isPlaceholder, true); assert.equal(rows[4].isPlaceholder, true); assert.equal(rows[1].isPlaceholder, false);
  assert.deepEqual(rows[1].sourcePropertyNames, ["Configured.Test", "Subtype", "TiaTypeName"]); button.sourceProperties.Added = "later"; button.name = "Changed"; assert.equal(rows[1].itemName, "Button"); assert.equal(rows[1].sourcePropertyNames.length, 3);
});
test("Hidden container reports its retained child count", async () => {
  const screen = new HmiScreen(), layer = new HmiLayer(), group = new HmiGroup(); group.visible = staticProperty(false); group.items.push(new HmiButton()); layer.items.push(group); screen.layers.push(layer);
  const rows = [], options = new HmiHtmlConvertOptions(); options.itemDiagnostic = row => rows.push(row); await new HmiScreenToHtmlConverter().convertAsync(screen, undefined, options);
  assert.equal(rows.length, 1); assert.equal(rows[0].rendererRoute, "Hidden"); assert.equal(rows[0].childCount, 1);
});

test("Container diagnostics identify the actual generic container route", async () => {
  const screen = new HmiScreen(), layer = new HmiLayer(), container = new HmiContainerBase();
  container.items.push(new HmiButton()); layer.items.push(container); screen.layers.push(layer);
  const rows = [], options = new HmiHtmlConvertOptions(); options.itemDiagnostic = row => rows.push(row);
  await new HmiScreenToHtmlConverter().convertAsync(screen, undefined, options);
  assert.equal(rows[0].modelType, "HmiContainerBase");
  assert.equal(rows[0].rendererRoute, "HmiContainerBase");
  assert.equal(rows[0].childCount, 1); assert.equal(rows[1].rendererRoute, "HmiButton");
});
