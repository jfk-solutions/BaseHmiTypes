import assert from "node:assert/strict";
import test from "node:test";
import {
  HmiScreen, HmiLayer, HmiButton, HmiTextBox, HmiGraphicView, HmiRectangle,
  HmiMultilingualText, HmiFont, HmiThickness, HmiScreenKind,
  HmiScreenToUnifiedXmlConverter, staticProperty, tagProperty, hmiColorFromArgb,
} from "../dist/index.js";

const converter = new HmiScreenToUnifiedXmlConverter();
function withItems(...items) {
  const screen = new HmiScreen(); screen.name = "Main";
  screen.width = staticProperty(800); screen.height = staticProperty(480);
  const layer = new HmiLayer(); layer.items.push(...items); screen.layers.push(layer); return screen;
}

test("Unified export uses the fixed catalog and declares incomplete coverage", () => {
  const screen = withItems(); screen.number = 501; screen.backgroundColor = staticProperty(hmiColorFromArgb(127, 1, 22, 254));
  const result = converter.convert(screen, "Panel");
  assert.equal(result.complete, false);
  assert.match(result.xml, /xmlns="urn:s7mcp:wincc-unified:2"/);
  assert.match(result.xml, /catalog="89ce7b2e33155ea0da70a8cfd76f09798b9a9f9d68c08155a7afb646a76bdd1a"/);
  assert.match(result.xml, /apiVersion="21.0.0.0"/);
  assert.match(result.xml, /scope="screen" screen="Main"/);
  assert.match(result.xml, /complete="false"/);
  assert.match(result.xml, /width="800"/);
  assert.match(result.xml, /back-color="#0116FE7F"/);
  assert.match(result.xml, /screen-number="501"/);
  assert.doesNotMatch(result.xml, /<u:types|diagnostics|enabled=/);
  assert.ok(result.diagnostics.some(d => d.path === "screen"));
});

test("preserves item identity, order, unsigned values and Unified booleans", () => {
  const button = new HmiButton(); button.name = "Run"; button.width = staticProperty(4294967295);
  button.enabled = staticProperty(false); button.backgroundColor = staticProperty(hmiColorFromArgb(255, 1, 22, 254));
  const result = converter.convert(withItems(button, new HmiTextBox(), button), "Panel");
  assert.match(result.xml, /<button u:id="o2" u:type="t9"/);
  assert.match(result.xml, /width="4294967295"/);
  assert.match(result.xml, /enabled="False"/);
  assert.match(result.xml, /back-color="#0116FE"/);
  assert.match(result.xml, /<button.*<text-box.*<u:ref ref="o2"\/>/);
});

test("retains formatted multilingual text, empty text and attribute whitespace", () => {
  const button = new HmiButton(); button.name = "Run\r\n\tNow";
  const text = HmiMultilingualText.fromText("plain", 1031);
  text.formattedTexts.set(1031, "<body>A & B\r\n\tC</body>"); text.texts.set(2057, "");
  button.text = staticProperty(text); button.toolTipText = staticProperty(new HmiMultilingualText());
  button.font = new HmiFont(); button.font.name = staticProperty("Arial"); button.font.size = staticProperty(14);
  button.padding = new HmiThickness(); button.padding.left = staticProperty(3);
  const result = converter.convert(withItems(button), "Panel");
  assert.match(result.xml, /name="Run&#xD;&#xA;&#x9;Now"/);
  assert.match(result.xml, /font-family="Arial"/); assert.match(result.xml, /padding-left="3"/);
  assert.match(result.xml, /lang="de-DE" text="&lt;body&gt;A &amp; B&#xD;&#xA;&#x9;C&lt;\/body&gt;"/);
  assert.match(result.xml, /lang="en-GB" text=""/);
  assert.match(result.xml, /<tool-tip-text\/>/);
});

test("rejects lossy scalar conversion and static fallbacks on dynamic properties", () => {
  const button = new HmiButton(); button.width = staticProperty(1.5); button.x = staticProperty(2147483648);
  button.borderWidth = staticProperty(256); button.opacity = staticProperty(0.1);
  button.visible = tagProperty("Show", true); button.sourceProperties.Unknown = "source-only";
  const result = converter.convert(withItems(button, new HmiRectangle()), "Panel");
  const itemXml = result.xml.slice(result.xml.indexOf("<button"));
  assert.doesNotMatch(itemXml, /width=|left=|border-width=|opacity=|visible=|Show|source-only/);
  for (const field of ["width", "x", "borderWidth", "opacity", "visible", "sourceProperties"])
    assert.ok(result.diagnostics.some(d => d.path.endsWith(`.${field}`)), field);
  assert.ok(result.diagnostics.some(d => d.message.includes("HmiRectangle")));
});

test("requires explicit default text language and diagnoses unknown LCIDs", () => {
  const box = new HmiTextBox(); box.text = staticProperty(HmiMultilingualText.fromText("Hallo"));
  const screen = withItems(box);
  assert.ok(converter.convert(screen, "Panel").diagnostics.some(d => d.path.endsWith(".text[-1]")));
  assert.match(converter.convert(screen, "Panel", 1031).xml, /lang="de-DE" text="Hallo"/);
  box.text = staticProperty(HmiMultilingualText.fromText("Unknown", 999999));
  assert.ok(converter.convert(screen, "Panel").diagnostics.some(d => d.path.endsWith(".text[999999]")));
});

test("XML-illegal inline strings are diagnosed, supplementary Unicode survives", () => {
  const box = new HmiTextBox(); box.name = "\u0001"; box.text = staticProperty(HmiMultilingualText.fromText("\ud800", 1031));
  const result = converter.convert(withItems(box), "Panel");
  assert.ok(result.diagnostics.some(d => d.path.endsWith(".name")));
  assert.ok(result.diagnostics.some(d => d.path.endsWith(".text[1031]")));
  assert.doesNotMatch(result.xml, /\u0001|\ud800/);
  box.name = "🙂"; assert.match(converter.convert(withItems(box), "Panel").xml, /name="🙂"/);
});

test("unsupported screen kinds fail and independent exports have no shared state", () => {
  assert.throws(() => converter.convert(new HmiScreen(), "Panel"));
  const screen = withItems(); assert.throws(() => converter.convert(screen, ""));
  screen.kind = HmiScreenKind.Popup; assert.throws(() => converter.convert(screen, "Panel"));
  const graphic = new HmiGraphicView(); graphic.source = staticProperty("Logo"); graphic.opacity = staticProperty(0.5);
  const ordinary = withItems(graphic);
  assert.equal(converter.convert(ordinary, "Panel").xml, converter.convert(ordinary, "Panel").xml);
  assert.match(converter.convert(ordinary, "Panel").xml, /graphic="Logo"/);
});
