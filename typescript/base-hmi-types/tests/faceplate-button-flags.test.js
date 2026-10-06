import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiButton, HmiProjectBase, HmiScreenToHtmlConverter, HmiMultilingualText, HmiButtonType, HmiHorizontalAlignment, HmiDisabledImageMode, HmiImageSourceKind, hmiColorFromArgb, staticProperty, faceplateInterfaceProperty } from "../dist/index.js";

function setup() {
  const root = new HmiScreen(), rootLayer = new HmiLayer(), type = new HmiFaceplateType(), layer = new HmiLayer();
  root.layers.push(rootLayer); type.layers.push(layer);
  const instance = new HmiFaceplateContainer(); instance.faceplateId = "type"; rootLayer.items.push(instance);
  const button = Object.assign(new HmiButton(), {
    mode: staticProperty(HmiButtonType.GraphicAndText), text: staticProperty(HmiMultilingualText.fromText("Up")),
    alternateText: staticProperty(HmiMultilingualText.fromText("Down")),
    image: staticProperty({ kind: HmiImageSourceKind.Uri, uri: "up.svg" }),
    pressedContentOffset: staticProperty(2), threeDBorderWidth: staticProperty(3),
    threeDBorderTopColor: staticProperty(hmiColorFromArgb(255, 238, 238, 238)),
    threeDBorderBottomColor: staticProperty(hmiColorFromArgb(255, 64, 64, 64)),
    horizontalAlignment: staticProperty(HmiHorizontalAlignment.Left), imageHorizontalAlignment: staticProperty(HmiHorizontalAlignment.Left),
  });
  layer.items.push(button); const project = new HmiProjectBase(); project.getFaceplate = async () => type;
  return { root, rootLayer, instance, button, project };
}
async function render(x) {
  const html = await new HmiScreenToHtmlConverter().convertAsync(x.root, x.project);
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").match(/<button\b[^>]*>[\s\S]*?<\/button>/g);
}
for (const [value, expected] of [[true, true], [false, false], [" TrUe ", true], [0, false], ["invalid", false]]) {
  for (const property of ["pressed", "toggle", "downStateSameAsUp", "overlayContent", "avoidImageCaptionOverlap", "showDisabledState", "disabledImageFallbackToNormal"]) {
    test(`Faceplate button ${property} uses instance value ${String(value)}`, async () => {
      const x = setup(), b = x.button;
      x.instance.interfaceValues.push({ name: "Flag", value }); b[property] = faceplateInterfaceProperty("Flag", false);
      if (property === "downStateSameAsUp") b.pressed = staticProperty(true);
      if (property === "toggle") b.pressed = staticProperty(true);
      if (property === "avoidImageCaptionOverlap") b.overlayContent = staticProperty(true);
      if (property === "showDisabledState" || property === "disabledImageFallbackToNormal") {
        b.enabled = staticProperty(false); b.disabledImageMode = staticProperty(HmiDisabledImageMode.Reference);
        if (property === "showDisabledState") b.disabledImage = staticProperty({ kind: HmiImageSourceKind.Uri, uri: "disabled.svg" });
        else b.showDisabledState = staticProperty(true);
      }
      const [html] = await render(x);
      if (property === "pressed" || property === "downStateSameAsUp") {
        const down = property === "pressed" ? expected : !expected;
        assert.ok(html.includes(`aria-label="${down ? "Down" : "Up"}"`));
        assert.equal(html.includes("data-hmi-button-pressed-caption"), down);
        assert.equal(/<img[^>]*transform: translate\(2px, 2px\)/.test(html), down);
        assert.ok(html.includes(`box-shadow: inset 3px 0 0 ${down ? "#404040" : "#EEEEEE"}`));
      } else if (property === "toggle") assert.equal(html.includes('aria-pressed="true"'), expected);
      else if (property === "overlayContent") assert.equal(html.includes("data-hmi-button-overlay"), expected);
      else if (property === "avoidImageCaptionOverlap") assert.equal(html.includes('data-hmi-button-caption-avoid-image="start"'), expected);
      else if (property === "showDisabledState") assert.equal(html.includes("disabled.svg"), expected);
      else assert.equal(html.includes("up.svg"), expected);
    });
  }
}
test("Repeated button instances keep pressed values scoped and tag-bound values use fallback", async () => {
  const x = setup(); x.button.pressed = faceplateInterfaceProperty("Flag", false);
  x.instance.interfaceValues.push({ name: "Flag", value: true });
  for (const values of [[{ name: "Flag", value: false }], [{ name: "Flag", value: true, tagName: "RuntimeFlag" }], []]) {
    const instance = new HmiFaceplateContainer(); instance.faceplateId = "type"; instance.interfaceValues.push(...values); x.rootLayer.items.push(instance);
  }
  const html = await render(x); assert.equal(html.length, 4);
  assert.ok(html[0].includes('aria-label="Down"'));
  for (const other of html.slice(1)) assert.ok(other.includes('aria-label="Up"'));
  assert.equal(x.button.pressed.staticValue, false);
});
