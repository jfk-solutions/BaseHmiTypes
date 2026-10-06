import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiButton, HmiIOField, HmiTextBox, HmiText, HmiBar, HmiProjectBase, HmiScreenToHtmlConverter, HmiMultilingualText, hmiColorFromArgb, staticProperty, faceplateInterfaceProperty, blinkProperty } from "../dist/index.js";

const fallback = hmiColorFromArgb(255, 17, 18, 19);
const colors = { foregroundColor: hmiColorFromArgb(255, 1, 2, 3), backgroundColor: hmiColorFromArgb(255, 4, 5, 6), borderColor: hmiColorFromArgb(255, 7, 8, 9), disabledForegroundColor: hmiColorFromArgb(255, 10, 11, 12), disabledForegroundShadowColor: hmiColorFromArgb(255, 13, 14, 15), lineColor: hmiColorFromArgb(255, 16, 17, 18), trackColor: hmiColorFromArgb(255, 19, 20, 21) };
function setup(item, mode = "literal") {
  const root = new HmiScreen(), rootLayer = new HmiLayer(), type = new HmiFaceplateType(), layer = new HmiLayer(), instance = new HmiFaceplateContainer();
  root.layers.push(rootLayer); rootLayer.items.push(instance); type.layers.push(layer); layer.items.push(item); instance.faceplateId = "type"; item.name = "Probe";
  for (const [name, color] of Object.entries(colors)) instance.interfaceValues.push({ name, value: mode === "literal" || mode === "tag" ? color : mode === "null" ? null : mode === "invalid" ? "#010203" : { alpha: 255, red: "1", green: 2, blue: 3 }, ...(mode === "tag" ? { tagName: "RuntimeColor" } : {}) });
  const project = new HmiProjectBase(); project.getFaceplate = async () => type;
  return { root, rootLayer, instance, project };
}
async function openings(x) {
  const html = await new HmiScreenToHtmlConverter().convertAsync(x.root, x.project);
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").match(/<[^>]*\bid="Probe"[^>]*>/g);
}
for (const Control of [HmiButton, HmiIOField, HmiTextBox]) for (const enabled of [true, false]) for (const mode of ["literal", "invalid", "null", "tag", "malformed"]) {
  test(`Common faceplate colors ${Control.name}, enabled=${enabled}, ${mode}`, async () => {
    const item = new Control(); item.text = staticProperty(HmiMultilingualText.fromText("Caption")); item.enabled = staticProperty(enabled); item.useDisabledForegroundColor = staticProperty(true);
    for (const property of ["foregroundColor", "backgroundColor", "borderColor", "disabledForegroundColor", "disabledForegroundShadowColor"]) item[property] = faceplateInterfaceProperty(property, fallback);
    const x = setup(item, mode), [html] = await openings(x), literal = mode === "literal";
    assert.ok(html.includes(`color: ${literal ? enabled ? "#010203" : "#0A0B0C" : "#111213"};`));
    assert.ok(html.includes(`background-color: ${literal ? "#040506" : "#111213"};`));
    assert.ok(html.includes(`border-color: ${literal ? "#070809" : "#111213"};`));
    assert.equal(html.includes("text-shadow:"), !enabled);
    if (!enabled) assert.ok(html.includes(`text-shadow: 1px 1px ${literal ? "#0D0E0F" : "#111213"};`));
    assert.deepEqual(item.foregroundColor.staticValue, fallback);
  });
}
for (const framed of [false, true]) test(`Text line colors resolve into border and centered outline (${framed})`, async () => {
  const item = new HmiText(); item.text = staticProperty(HmiMultilingualText.fromText("Caption")); item.lineColor = faceplateInterfaceProperty("lineColor", fallback); item.lineWidth = staticProperty(4);
  if (framed) item.drawStrokeInsideFrame = staticProperty(false);
  const [html] = await openings(setup(item)); assert.ok(html.includes("border-color: #101112;"));
  assert.equal(html.includes("outline-color: #101112;"), framed);
});
for (const explicit of [false, true]) test(`Bar background and explicit track colors resolve independently (${explicit})`, async () => {
  const item = new HmiBar(); item.showScale = staticProperty(true); item.backgroundColor = faceplateInterfaceProperty("backgroundColor", fallback);
  if (explicit) item.trackColor = faceplateInterfaceProperty("trackColor", fallback);
  const [html] = await openings(setup(item)); assert.ok(html.includes("--hmi-bar-track-background: #040506;"));
  assert.equal(html.includes("--hmi-bar-track-background: #131415 !important;"), explicit);
});
test("Common color blink branches retain their off/on snapshots", async () => {
  const item = new HmiButton(); for (const property of ["foregroundColor", "backgroundColor", "borderColor"]) item[property] = blinkProperty(colors[property], fallback);
  const [html] = await openings(setup(item));
  for (const [name, css] of [["foreground", "#010203"], ["background", "#040506"], ["border", "#070809"]]) {
    assert.ok(html.includes(`--hmi-${name}-color-off: ${css};`)); assert.ok(html.includes(`--hmi-${name}-color-on: #111213;`)); assert.ok(html.includes(`hmi-${name}-color-flash`));
  }
});
test("Repeated instances keep common colors scoped", async () => {
  const item = new HmiIOField(); item.backgroundColor = faceplateInterfaceProperty("backgroundColor", fallback); const x = setup(item);
  for (const values of [[{ name: "backgroundColor", value: fallback }], []]) { const other = new HmiFaceplateContainer(); other.faceplateId = "type"; other.interfaceValues.push(...values); x.rootLayer.items.push(other); }
  const html = await openings(x); assert.equal(html.length, 3); assert.ok(html[0].includes("background-color: #040506;"));
  for (const other of html.slice(1)) assert.ok(other.includes("background-color: #111213;")); assert.deepEqual(item.backgroundColor.staticValue, fallback);
});
