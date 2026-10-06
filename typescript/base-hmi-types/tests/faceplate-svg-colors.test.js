import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiCircle, HmiEllipse, HmiLine, HmiProjectBase, HmiScreenToHtmlConverter, HmiFillPattern, HmiLineMarker, hmiColorFromArgb, staticProperty, faceplateInterfaceProperty, blinkProperty } from "../dist/index.js";

const fallback = hmiColorFromArgb(255, 17, 18, 19);
const colors = { Fill: hmiColorFromArgb(255, 1, 2, 3), Line: hmiColorFromArgb(255, 4, 5, 6), Border: hmiColorFromArgb(255, 7, 8, 9), Foreground: hmiColorFromArgb(255, 10, 11, 12), Disabled: hmiColorFromArgb(255, 13, 14, 15), Pattern: hmiColorFromArgb(255, 16, 17, 18) };
function setup(item, mode = "literal") {
  const root = new HmiScreen(), rootLayer = new HmiLayer(), type = new HmiFaceplateType(), layer = new HmiLayer(), instance = new HmiFaceplateContainer();
  root.layers.push(rootLayer); rootLayer.items.push(instance); type.layers.push(layer); layer.items.push(item); instance.faceplateId = "type"; item.name = "Probe"; item.width = staticProperty(100); item.height = staticProperty(40);
  for (const [name, color] of Object.entries(colors)) instance.interfaceValues.push({ name, value: mode === "literal" || mode === "tag" ? color : mode === "null" ? null : mode === "invalid" ? "#010203" : { alpha: 255, red: "1", green: 2, blue: 3 }, ...(mode === "tag" ? { tagId: "runtime-color" } : {}) });
  const project = new HmiProjectBase(); project.getFaceplate = async () => type; return { root, rootLayer, instance, project };
}
async function render(x) { return (await new HmiScreenToHtmlConverter().convertAsync(x.root, x.project)).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""); }
function bound(name) { return faceplateInterfaceProperty(name, fallback); }
for (const Shape of [HmiCircle, HmiEllipse]) for (const source of ["Line", "Border", "Foreground", "Disabled"]) for (const mode of ["literal", "invalid", "null", "tag", "malformed"]) {
  test(`SVG interface fill/stroke ${Shape.name}, ${source}, ${mode}`, async () => {
    const item = new Shape(); item.backgroundColor = bound("Fill");
    if (source === "Line") { item.lineColor = bound("Line"); item.borderColor = bound("Border"); item.foregroundColor = bound("Foreground"); }
    else if (source === "Border") { item.borderColor = bound("Border"); item.foregroundColor = bound("Foreground"); }
    else { item.foregroundColor = bound("Foreground"); if (source === "Disabled") { item.enabled = staticProperty(false); item.useDisabledForegroundColor = staticProperty(true); item.disabledForegroundColor = bound("Disabled"); } }
    const html = await render(setup(item, mode)), expected = mode === "literal" ? { Line: "#040506", Border: "#070809", Foreground: "#0A0B0C", Disabled: "#0D0E0F" }[source] : "#111213";
    assert.ok(html.includes(`fill="${mode === "literal" ? "#010203" : "#111213"}"`)); assert.ok(html.includes(`stroke="${expected}"`)); assert.deepEqual(item.backgroundColor.staticValue, fallback);
  });
}
test("SVG marker geometry uses the resolved stroke color", async () => {
  const item = new HmiLine(); item.lineColor = bound("Line"); item.startMarker = staticProperty(HmiLineMarker.FilledArrow); item.endMarker = staticProperty(HmiLineMarker.FilledCircle);
  const html = await render(setup(item)); assert.ok(html.includes('stroke="#040506"')); assert.equal((html.match(/fill="#040506"/g) ?? []).length, 2);
});
for (const explicit of [false, true]) test(`SVG pattern color resolves explicit or stroke fallback (${explicit})`, async () => {
  const item = new HmiEllipse(); item.backgroundColor = bound("Fill"); item.lineColor = bound("Line"); item.fillPattern = staticProperty(HmiFillPattern.Horizontal);
  if (explicit) item.patternColor = bound("Pattern"); const html = await render(setup(item));
  assert.ok(html.includes('fill="url(#hmi-pattern-Probe)"')); assert.ok(html.includes('fill="#010203"'));
  assert.ok(html.includes(`stroke="${explicit ? "#101112" : "#040506"}" stroke-width="1"`));
});
test("Fill animation stops use the resolved fill color", async () => {
  const item = new HmiEllipse(); item.backgroundColor = bound("Fill"); item.fillAnimation = { expressionFallback: 50 };
  const html = await render(setup(item)); assert.ok(html.includes('fill="url(#hmi-fill-Probe)"')); assert.ok(html.includes('stop-color="#010203"'));
});
test("SVG fill and stroke blink snapshots retain precedence", async () => {
  const item = new HmiEllipse(); item.backgroundColor = blinkProperty(colors.Fill, fallback); item.lineColor = blinkProperty(colors.Line, fallback);
  const html = await render(setup(item)); assert.ok(html.includes('--hmi-background-color-off: #010203;')); assert.ok(html.includes('--hmi-border-color-off: #040506;'));
  assert.ok(html.includes('--hmi-background-color-on: #111213;')); assert.ok(html.includes('--hmi-border-color-on: #111213;'));
});
test("Repeated SVG instances use independent fill bindings", async () => {
  const item = new HmiEllipse(); item.backgroundColor = bound("Fill"); const x = setup(item);
  const second = new HmiFaceplateContainer(); second.faceplateId = "type"; second.interfaceValues.push({ name: "Fill", value: fallback }); x.rootLayer.items.push(second);
  const html = await render(x); assert.ok(html.includes('fill="#010203"')); assert.ok(html.includes('fill="#111213"')); assert.deepEqual(item.backgroundColor.staticValue, fallback);
});
