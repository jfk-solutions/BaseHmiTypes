import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiButton, HmiState, HmiProjectBase, HmiScreenToHtmlConverter, HmiMultilingualText, HmiButtonType, HmiDisabledImageMode, HmiImageSourceKind, hmiColorFromArgb, staticProperty, faceplateInterfaceProperty } from "../dist/index.js";

const image = uri => ({ kind: HmiImageSourceKind.Uri, uri });
const color = hmiColorFromArgb(255, 1, 2, 3), fallbackColor = hmiColorFromArgb(255, 17, 18, 19);
function setup(source, values) {
  const root = new HmiScreen(), rootLayer = new HmiLayer(), type = new HmiFaceplateType(), layer = new HmiLayer(); root.layers.push(rootLayer); type.layers.push(layer);
  const instance = new HmiFaceplateContainer(); instance.faceplateId = "type"; instance.interfaceValues.push(...values); rootLayer.items.push(instance);
  const button = Object.assign(new HmiButton(), { mode: staticProperty(HmiButtonType.GraphicAndText), text: staticProperty(HmiMultilingualText.fromText("Caption")), image: staticProperty(image("normal.svg")) });
  if (source === "alternate") button.pressed = staticProperty(true);
  if (source === "disabled") { button.enabled = staticProperty(false); button.showDisabledState = staticProperty(true); button.disabledImageMode = staticProperty(HmiDisabledImageMode.Reference); }
  layer.items.push(button); const project = new HmiProjectBase(); project.getFaceplate = async () => type;
  return { root, rootLayer, instance, button, project };
}
async function render(x) {
  const html = await new HmiScreenToHtmlConverter().convertAsync(x.root, x.project);
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").match(/<button\b[^>]*>[\s\S]*?<\/button>/g);
}
for (const source of ["normal", "alternate", "disabled"]) {
  const property = source === "normal" ? "image" : source === "alternate" ? "alternateImage" : "disabledImage";
  for (const [name, value, expected, tagged] of [["literal", image("instance.svg"), "instance.svg"], ["empty image", { kind: HmiImageSourceKind.Uri }, undefined], ["invalid string", "instance.svg", "fallback.svg"], ["invalid object", { kind: HmiImageSourceKind.Uri, uri: 42 }, "fallback.svg"], ["null", null, "fallback.svg"], ["tag", image("instance.svg"), "fallback.svg", true]]) {
    test(`${source} button image interface ${name}`, async () => {
      const x = setup(source, [{ name: "Image", value, ...(tagged ? { tagName: "RuntimeImage" } : {}) }]);
      x.button[property] = faceplateInterfaceProperty("Image", image("fallback.svg")); const [html] = await render(x);
      if (expected === undefined) assert.ok(!html.includes("<img")); else assert.ok(html.includes(`src="${expected}"`));
    });
  }
  for (const [name, value, expected, tagged] of [["literal", color, "1,2,3"], ["invalid", "#010203", "17,18,19"], ["invalid object", { alpha: 255, red: "1", green: 2, blue: 3 }, "17,18,19"], ["null", null, "17,18,19"], ["tag", color, "17,18,19", true]]) {
    test(`${source} button color interfaces ${name}`, async () => {
      const x = setup(source, [{ name: "Color", value, ...(tagged ? { tagId: "runtime-color" } : {}) }, { name: "KeyEnabled", value: " True " }]);
      const prefix = source === "normal" ? "image" : source === "alternate" ? "alternateImage" : "disabledImage";
      if (source !== "normal") x.button[prefix] = staticProperty(image("selected.svg"));
      x.button[`${prefix}BackgroundTransparent`] = faceplateInterfaceProperty("KeyEnabled", false);
      x.button[`${prefix}BackgroundColor`] = faceplateInterfaceProperty("Color", fallbackColor);
      x.button.captionColor = faceplateInterfaceProperty("Color", fallbackColor);
      x.button.threeDBorderWidth = staticProperty(2); x.button.threeDBorderTopColor = faceplateInterfaceProperty("Color", fallbackColor);
      const [html] = await render(x), css = expected === "1,2,3" ? "#010203" : "#111213";
      assert.ok(html.includes(`data-hmi-image-color-key="${expected}"`)); assert.ok(html.includes(`color: ${css};`)); assert.ok(html.includes(`box-shadow: inset 2px 0 0 ${css}`));
    });
  }
}
for (const transparent of [false, true]) test(`State image retains source and color precedence (${transparent})`, async () => {
  const x = setup("alternate", [{ name: "Image", value: image("instance.svg") }, { name: "Color", value: color }, { name: "KeyEnabled", value: true }]);
  x.button.image = faceplateInterfaceProperty("Image", image("fallback.svg")); x.button.alternateImage = faceplateInterfaceProperty("Image", image("fallback.svg"));
  x.button.imageBackgroundTransparent = faceplateInterfaceProperty("KeyEnabled", false); x.button.imageBackgroundColor = faceplateInterfaceProperty("Color", fallbackColor);
  x.button.captionColor = faceplateInterfaceProperty("Color", fallbackColor);
  x.button.states.push(Object.assign(new HmiState(), { value: 0, image: image("state.svg"), imageBackgroundTransparent: transparent, imageBackgroundColor: fallbackColor, captionColor: fallbackColor }));
  const [html] = await render(x); assert.ok(html.includes('src="state.svg"')); assert.equal(html.includes('data-hmi-image-color-key="17,18,19"'), transparent); assert.ok(!html.includes("color: #010203;"));
});
test("Image references resolve through the project provider and stay scoped", async () => {
  const x = setup("normal", [{ name: "Image", value: { kind: HmiImageSourceKind.Uri, imageId: "image-id" } }]);
  x.button.image = faceplateInterfaceProperty("Image", image("fallback.svg")); const calls = [];
  x.project.getImage = async id => { calls.push(id); return { data: new Uint8Array([1, 2, 3]), mimeType: "image/png" }; };
  const second = new HmiFaceplateContainer(); second.faceplateId = "type"; second.interfaceValues.push({ name: "Image", value: image("second.svg") }); x.rootLayer.items.push(second);
  const html = await render(x); assert.ok(html[0].includes('src="data:image/png;base64,AQID"')); assert.ok(html[1].includes('src="second.svg"')); assert.deepEqual(calls, ["image-id"]); assert.equal(x.button.image.staticValue.uri, "fallback.svg");
});
for (const pressed of [false, true]) test(`Independent bevel colors keep pressed reversal (${pressed})`, async () => {
  const x = setup("normal", [{ name: "Top", value: color }, { name: "Bottom", value: fallbackColor }]);
  x.button.pressed = staticProperty(pressed); x.button.threeDBorderWidth = staticProperty(2);
  x.button.threeDBorderTopColor = faceplateInterfaceProperty("Top", fallbackColor); x.button.threeDBorderBottomColor = faceplateInterfaceProperty("Bottom", color);
  const [html] = await render(x); assert.ok(html.includes(`box-shadow: inset 2px 0 0 ${pressed ? "#111213" : "#010203"}`));
  assert.ok(html.includes(`inset -2px 0 0 ${pressed ? "#010203" : "#111213"}`));
});
