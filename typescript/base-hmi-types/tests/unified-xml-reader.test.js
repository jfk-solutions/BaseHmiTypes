import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import {
  HmiUnifiedXmlToScreenConverter, HmiScreenToUnifiedXmlConverter, HmiUnifiedXmlCatalog,
  HmiScreen, HmiButton, HmiGraphicView, HmiLayer, HmiFont, HmiThickness, HmiMultilingualText, staticProperty,
} from "../dist/index.js";

// Test-only DOM implementation. Production browser modules use the native globals.
globalThis.DOMParser = class extends DOMParser {
  constructor() { super({ onError(level, message) { if (level !== "warning") throw new Error(message); } }); }
};
globalThis.XMLSerializer = XMLSerializer;
const catalog = await HmiUnifiedXmlCatalog.readV21(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.v21Url)));
const reader = new HmiUnifiedXmlToScreenConverter(catalog);
function archive(items = "", complete = "false") {
  return `<unified-export xmlns="${HmiScreenToUnifiedXmlConverter.namespace}" xmlns:u="${HmiScreenToUnifiedXmlConverter.contractNamespace}" version="2" catalog="${HmiScreenToUnifiedXmlConverter.catalogId}" scope="screen" screen="Main" apiVersion="21.0.0.0" complete="${complete}"><screen name="Main" width="800" height="480">${items}</screen></unified-export>`;
}

test("reader loads a captured V21 screen with unmarked controls", async () => {
  const xml = await readFile(new URL("../../../tests/BaseHmiTypes.Tests/Fixtures/unified-v21-screen.xml", import.meta.url), "utf8");
  const result = await reader.convert(xml);
  assert.equal(result.screen.name, "501 StartScreen"); assert.equal(result.screen.width.staticValue, 800);
  assert.equal(result.screen.height.staticValue, 480); assert.equal(result.sourceComplete, false);
  assert.equal(result.screen.events.length, 2);
  const graphic = result.screen.layers[0].items.find(item => item instanceof HmiGraphicView);
  assert.equal(graphic.source.staticValue, "Unified_Logo");
  const dynamicText = result.screen.layers[0].items.find(item => item.name === "Logout_1");
  assert.equal(dynamicText.text.kind, "Script"); assert.match(dynamicText.text.script, /PlantReferenceNumber/);
  assert.deepEqual(dynamicText.text.triggers[0].tagNames, ["PlantReferenceNumber"]);
  assert.ok(dynamicText.text.staticValue);
});

test("reader recovers supported writer data, exact text, item order and identity", async () => {
  const screen = new HmiScreen(); screen.name = "Main"; screen.number = 501; screen.width = staticProperty(800); screen.height = staticProperty(480);
  const button = new HmiButton(); button.name = "Run"; button.x = staticProperty(-12); button.enabled = staticProperty(false);
  button.backgroundColor = staticProperty({ alpha: 127, red: 1, green: 22, blue: 254 });
  button.text = staticProperty(HmiMultilingualText.fromText("<body>A & B\r\n\tC</body>", 1031));
  button.font = new HmiFont(); button.font.name = staticProperty("Arial"); button.font.size = staticProperty(14);
  button.padding = new HmiThickness(); button.padding.left = staticProperty(3);
  const graphic = new HmiGraphicView(); graphic.name = "Logo"; graphic.source = staticProperty("CompanyLogo");
  const layer = new HmiLayer(); layer.items.push(button, graphic, button); screen.layers.push(layer);
  const xml = new HmiScreenToUnifiedXmlConverter().convert(screen, "Panel").xml;
  const result = await reader.convert(xml), items = result.screen.layers[0].items;
  assert.equal(result.sourceComplete, false); assert.equal(result.screen.number, 501);
  assert.equal(items.length, 3); assert.equal(items[0], items[2]); assert.ok(items[0] instanceof HmiButton);
  assert.equal(items[0].x.staticValue, -12); assert.equal(items[0].enabled.staticValue, false);
  assert.equal(items[0].backgroundColor.staticValue.alpha, 127); assert.equal(items[0].padding.left.staticValue, 3);
  assert.equal(items[0].font.name.staticValue, "Arial"); assert.equal(items[0].font.size.staticValue, 14);
  assert.equal(items[0].text.staticValue.texts.get(1031), "<body>A & B\r\n\tC</body>");
  assert.equal(items[1].source.staticValue, "CompanyLogo");
  assert.equal(new TextDecoder().decode(result.screen.sourceData), xml);
});

test("reader expands fixed defaults and language templates", async () => {
  const result = await reader.convert(archive('<button name="Run" left="1" font-family="Arial"/><text-box name="Caption" top="0" font-family="Arial"/>', "true"));
  assert.equal(result.sourceComplete, true);
  const [button, box] = result.screen.layers[0].items;
  assert.equal(button.width.staticValue, 65); assert.equal(button.height.staticValue, 66);
  assert.equal(button.enabled.staticValue, true); assert.equal(button.visible.staticValue, true);
  assert.equal(button.font.size.staticValue, 22); assert.equal(button.font.bold.staticValue, false);
  assert.equal(button.toolTipText.staticValue.texts.size, 2);
  assert.equal(box.width.staticValue, 500); assert.equal(box.enabled.staticValue, false);
  assert.deepEqual(box.backgroundColor.staticValue, { alpha: 255, red: 255, green: 0, blue: 255 });
});

test("forward references and wrapped items share the same model instance", async () => {
  const result = await reader.convert(archive('<screen-items><u:ref ref="b"/><button u:id="b" name="Run" left="0"/></screen-items>'));
  assert.equal(result.screen.layers[0].items.length, 2);
  assert.equal(result.screen.layers[0].items[0], result.screen.layers[0].items[1]);
});

test("explicit empty localized text suppresses the catalog language template", async () => {
  const result = await reader.convert(archive('<button name="Run" left="0"><tool-tip-text/></button>'));
  assert.equal(result.screen.layers[0].items[0].toolTipText.staticValue.texts.size, 0);
});

test("event scripts load as inert JavaScript with exact whitespace", async () => {
  const result = await reader.convert(archive('<event-handlers><screen-event-handler event-type="Loaded"><script u:type="t5"><script-code xml:space="preserve">a();&#xD;\n\tb();</script-code></script></screen-event-handler></event-handlers>'));
  assert.equal(result.screen.events[0].eventName, "Loaded");
  assert.equal(result.screen.events[0].action.sourceCode, "a();\r\n\tb();");
  assert.equal(result.screen.events[0].action.language, "JavaScript");
});

test("reader handles explicit parts and lossless UTF-16 script payloads", async () => {
  const result = await reader.convert(archive('<button name="Run" left="0"><font name="Arial" size="14"/><padding left="5"/><event-handlers><button-event-handler event-type="Down"><script u:type="t16"><script-code><u:Value kind="scalar" type="System.String" encoding="utf16le-base64">AQAA2A==</u:Value></script-code></script></button-event-handler></event-handlers></button>'));
  const button = result.screen.layers[0].items[0];
  assert.equal(button.font.name.staticValue, "Arial"); assert.equal(button.padding.left.staticValue, 5);
  assert.equal(button.events[0].action.sourceCode, "\u0001\ud800");
});

test("contract namespace prefix is arbitrary and duplicate dynamizations fail", async () => {
  const xml = archive('<button u:id="b" name="Run" left="0"/><u:ref ref="b"/>').replace("xmlns:u=", "xmlns:c=").replace("u:id=", "c:id=").replace("<u:ref", "<c:ref");
  const items = (await reader.convert(xml)).screen.layers[0].items;
  assert.equal(items[0], items[1]);
  const script = '<script-dynamization property-name="Visible"><script-code>return true;</script-code></script-dynamization>';
  await assert.rejects(reader.convert(archive(`<button><dynamizations>${script}${script}</dynamizations></button>`)));
});

test("unsupported fields, controls and members are diagnosed and retained", async () => {
  const xml = archive('<rectangle name="Unknown"/><button name="Run" left="0" custom="keep"><dynamizations/></button>');
  const result = await reader.convert(xml);
  assert.ok(result.diagnostics.some(d => d.path.endsWith("rectangle")));
  assert.ok(result.diagnostics.some(d => d.path.endsWith("@custom")));
  assert.equal(new TextDecoder().decode(result.screen.sourceData), xml);
});

test("reader rejects unsupported profiles, malformed XML and DTDs", async () => {
  await assert.rejects(reader.convert(archive().replace('scope="screen"', 'scope="device"')));
  await assert.rejects(reader.convert(archive().replace(HmiScreenToUnifiedXmlConverter.catalogId, "0".repeat(64))));
  await assert.rejects(reader.convert("<bad>"));
  await assert.rejects(reader.convert("<!DOCTYPE x>" + archive()));
});

test("reader rejects invalid identities, selectors, values and duplicate languages", async () => {
  for (const items of ['<u:ref ref="missing"/>', '<button u:id="b"/><button u:id="b"/>', '<button u:type="t14"/>',
    '<button width="1.5"/>', '<button width="4294967296"/>', '<button enabled="true"/>', '<button back-color="red"/>',
    '<button><text><multilingual-text-item lang="de-DE" text="A"/><multilingual-text-item lang="de-DE" text="B"/></text></button>'])
    await assert.rejects(reader.convert(archive(items)), items);
});

test("unknown language remains in original XML and produces a diagnostic", async () => {
  const result = await reader.convert(archive('<button><text><multilingual-text-item lang="unknown" text="Keep"/></text></button>'));
  assert.ok(result.diagnostics.some(d => d.message.includes("Unsupported language")));
});
