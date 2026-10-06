import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiButton, HmiState, HmiThickness, HmiProjectBase, HmiScreenToHtmlConverter, HmiMultilingualText, HmiButtonType, HmiHorizontalAlignment, HmiImageSourceKind, staticProperty, faceplateInterfaceProperty } from "../dist/index.js";

const cases = [[2.5, 2.5], [" +2.5 ", 2.5], ["2.5e1", 25], ["1,2.5", 12.5], ["1,,2", 12], ["12,", 12], [".5", .5], ["1.e2", 100], [true, 1], [false, 0], [12n, 12], [-2.5, -2.5], ["-0", -0], ["invalid", 23], ["", 23], ["0x10", 23], [",12", 23], ["1.5,2", 23], ["1e1,2", 23], ["2 5", 23], [null, 23], [{}, 23], ["12\0", 12], ["\u00a012\u00a0", 23], ["NaN", NaN], ["+nan", NaN], ["-NaN", NaN], ["infinity", Infinity], [" -Infinity ", -Infinity], ["1e999", Infinity], ["\u00a0NaN\u00a0", NaN]];
function setup(value) {
  const root = new HmiScreen(), rootLayer = new HmiLayer(), type = new HmiFaceplateType(), layer = new HmiLayer();
  root.layers.push(rootLayer); type.layers.push(layer);
  const instance = new HmiFaceplateContainer(); instance.faceplateId = "type"; instance.interfaceValues.push({ name: "Number", value }); rootLayer.items.push(instance);
  const button = Object.assign(new HmiButton(), { mode: staticProperty(HmiButtonType.GraphicAndText), pressed: staticProperty(true), text: staticProperty(HmiMultilingualText.fromText("Caption")), image: staticProperty({ kind: HmiImageSourceKind.Uri, uri: "picture.svg" }), imageHorizontalAlignment: staticProperty(HmiHorizontalAlignment.Left) });
  layer.items.push(button); const project = new HmiProjectBase(); project.getFaceplate = async () => type;
  return { root, rootLayer, instance, button, project };
}
async function render(x) {
  const html = await new HmiScreenToHtmlConverter().convertAsync(x.root, x.project);
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").match(/<button\b[^>]*>[\s\S]*?<\/button>/g);
}
for (const [value, expected] of cases) {
  test(`Numeric interface state and offset match invariant C# conversion: ${String(value)}`, async () => {
    const x = setup(value), b = x.button;
    b.state = faceplateInterfaceProperty("Number", 23); b.pressedContentOffset = faceplateInterfaceProperty("Number", 23);
    b.states.push(Object.assign(new HmiState(), { value: -1000, text: HmiMultilingualText.fromText("First state") }), Object.assign(new HmiState(), { value: expected, text: HmiMultilingualText.fromText("Selected state") }));
    const [html] = await render(x);
    assert.ok(html.includes(`aria-label="${Number.isNaN(expected) ? "First state" : "Selected state"}"`));
    const offset = Number.isFinite(expected) && expected > 0;
    assert.equal(html.includes("data-hmi-button-pressed-caption"), offset);
    assert.equal(/<img[^>]*transform: translate\(/.test(html), offset);
    if (offset) assert.ok(html.includes(`transform: translate(${expected}px, ${expected}px)`));
  });
  if (Number.isFinite(expected)) test(`Numeric button bevel and padding use interface values: ${String(value)}`, async () => {
    const x = setup(value), b = x.button; b.threeDBorderWidth = faceplateInterfaceProperty("Number", 23);
    b.padding = new HmiThickness(); for (const side of ["top", "right", "bottom", "left"]) b.padding[side] = faceplateInterfaceProperty("Number", 23);
    const [html] = await render(x);
    assert.equal(html.includes("box-shadow: inset"), expected > 0);
    if (expected > 0) {
      assert.ok(html.includes(`box-shadow: inset ${expected}px`));
      assert.ok(html.includes(`padding: ${expected * 2}px ${expected * 2}px ${expected * 2}px ${expected * 2}px;`));
    }
  });
}
test("Numeric values stay scoped across instances and tag-bound values retain fallback", async () => {
  const x = setup(2.5); x.button.pressedContentOffset = faceplateInterfaceProperty("Number", 23);
  for (const values of [[{ name: "Number", value: 12 }], [{ name: "Number", value: 4, tagId: "runtime-number" }], []]) {
    const instance = new HmiFaceplateContainer(); instance.faceplateId = "type"; instance.interfaceValues.push(...values); x.rootLayer.items.push(instance);
  }
  const html = await render(x); assert.equal(html.length, 4);
  for (const [index, value] of [2.5, 12, 23, 23].entries()) assert.ok(html[index].includes(`transform: translate(${value}px, ${value}px)`));
  assert.equal(x.button.pressedContentOffset.staticValue, 23);
});
test("Each padding edge uses its own numeric interface binding", async () => {
  const x = setup(.5); x.button.threeDBorderWidth = faceplateInterfaceProperty("Number", 23); x.button.padding = new HmiThickness();
  for (const [index, side] of ["top", "right", "bottom", "left"].entries()) {
    x.instance.interfaceValues.push({ name: side, value: index + 1.5 });
    x.button.padding[side] = faceplateInterfaceProperty(side, 23);
  }
  const [html] = await render(x); assert.ok(html.includes("padding: 2px 3px 4px 5px;"));
});
