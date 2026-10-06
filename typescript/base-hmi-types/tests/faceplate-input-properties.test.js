import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiButton, HmiIOField, HmiTextBox, HmiProjectBase, HmiScreenToHtmlConverter, hmiColorFromArgb, staticProperty, faceplateInterfaceProperty } from "../dist/index.js";
function setup(value) {
  const root = new HmiScreen(), rootLayer = new HmiLayer(), instance = new HmiFaceplateContainer(), type = new HmiFaceplateType(), layer = new HmiLayer();
  root.layers.push(rootLayer); rootLayer.items.push(instance); instance.faceplateId = "type"; type.layers.push(layer);
  instance.interfaceValues.push({ name: "Value", value });
  const project = new HmiProjectBase(); project.getFaceplate = async () => type;
  return { root, project, layer, instance };
}
function openingTag(html, tag) { return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").match(new RegExp(`<${tag}\\b[^>]*>`))[0]; }
for (const [value, expected] of [[true, true], [false, false], [0, false], [1, true], [-2, true], [NaN, true], [Infinity, true], [" TrUe ", true], [" FALSE ", false], ["invalid", undefined], [null, undefined]]) {
  test(`Boolean interface inputs match C# conversion: ${String(value)}`, async () => {
    const { root, project, layer, instance } = setup(value), button = new HmiButton(), field = new HmiIOField(), box = new HmiTextBox();
    for (const item of [button, field, box]) item.enabled = faceplateInterfaceProperty("Value", true);
    for (const item of [field, box]) item.readOnly = faceplateInterfaceProperty("Value", false);
    field.maskInput = faceplateInterfaceProperty("Value", false); box.resizable = faceplateInterfaceProperty("Value", false);
    instance.interfaceValues.push({ name: "Appearance", value: true });
    field.useDisabledForegroundColor = faceplateInterfaceProperty("Appearance", false);
    field.foregroundColor = staticProperty(hmiColorFromArgb(255, 17, 18, 19));
    field.disabledForegroundColor = staticProperty(hmiColorFromArgb(255, 1, 2, 3));
    layer.items.push(button, field, box); const html = await new HmiScreenToHtmlConverter().convertAsync(root, project);
    for (const tag of ["button", "input", "textarea"]) {
      const opening = openingTag(html, tag);
      assert.equal(opening.includes('disabled="disabled"'), expected === false);
      assert.equal(opening.includes('aria-disabled="true"'), expected === false);
      assert.equal(opening.includes("pointer-events: none"), expected === false);
    }
    for (const tag of ["input", "textarea"]) assert.equal(openingTag(html, tag).includes('readonly="readonly"'), expected === true);
    assert.equal(openingTag(html, "input").includes('type="password"'), expected === true);
    assert.equal(openingTag(html, "input").includes("color: #010203;"), expected === false);
    assert.equal(openingTag(html, "textarea").includes("resize: both"), expected === true);
  });
}
for (const [value, expected] of [[12, 12], [2.5, 2], [3.5, 4], [-2.5, -2], [-3.5, -4], [" +12 ", 12], ["12.0", 23], ["0x10", 23], ["", 23], [true, 1], [false, 0], [2147483648, 23], [NaN, 23], [Infinity, 23], [null, 23], [12n, 12]]) {
  test(`Field length converts to Int32 with C# rounding/fallback: ${String(value)}`, async () => {
    const { root, project, layer } = setup(value), field = new HmiIOField(), box = new HmiTextBox();
    field.fieldLength = faceplateInterfaceProperty("Value", 23); box.fieldLength = faceplateInterfaceProperty("Value", 23); layer.items.push(field, box);
    const html = await new HmiScreenToHtmlConverter().convertAsync(root, project);
    assert.ok(openingTag(html, "input").includes(`maxlength="${expected}"`));
    if (expected > 0) assert.ok(openingTag(html, "textarea").includes(`maxlength="${expected}"`));
    else assert.ok(!openingTag(html, "textarea").includes("maxlength="));
  });
}
