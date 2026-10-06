import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiLabel, HmiButton, HmiState, HmiMultilingualText, HmiProjectBase, HmiScreenToHtmlConverter, HmiHtmlConvertOptions, HmiButtonType, HmiImageSourceKind, hmiColorFromArgb, faceplateInterfaceProperty as bind, staticProperty as fixed } from "../dist/index.js";

class Project extends HmiProjectBase {
  types = new Map();
  async getFaceplate(id) { return this.types.get(id); }
}
function screen(...items) { const result = new HmiScreen(), layer = new HmiLayer(); result.layers.push(layer); layer.items.push(...items); return result; }
function definition(...items) { const result = new HmiFaceplateType(), layer = new HmiLayer(); result.layers.push(layer); layer.items.push(...items); return result; }
function instance(id) { return Object.assign(new HmiFaceplateContainer(), { faceplateId: id }); }
function caption() { return Object.assign(new HmiLabel(), { text: bind("Caption", HmiMultilingualText.fromText("Control fallback")) }); }
const member = (name, defaultValue, isTag = false) => ({ name, defaultValue, isTag });
const image = uri => ({ uri, kind: HmiImageSourceKind.Uri });
async function render(value, project, lcid) {
  const options = new HmiHtmlConvertOptions(); options.cultureLcid = lcid;
  return (await new HmiScreenToHtmlConverter().convertAsync(value, project, options)).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}
for (const [mode, expected] of [["absent", "Definition &lt;caption&gt;"], ["literal", "Instance caption"], ["null", "Control fallback"], ["invalid", "Control fallback"], ["tag-id", "Control fallback"], ["tag-name", "Control fallback"], ["empty", undefined]]) {
  test(`Defaults apply only when an instance entry is absent: ${mode}`, async () => {
    const label = caption(), type = definition(label); type.interfaceProperties.push(member("CAPTION", "Definition <caption>"));
    const item = instance("type");
    if (mode !== "absent") item.interfaceValues.push({ name: "caption", value: mode === "empty" ? "" : mode === "null" ? undefined : mode === "invalid" ? 42 : "Instance caption", tagId: mode === "tag-id" ? "tag" : undefined, tagName: mode === "tag-name" ? "tag" : undefined });
    const project = new Project(); project.types.set("type", type); const html = await render(screen(item), project);
    for (const value of ["Definition &lt;caption&gt;", "Instance caption", "Control fallback"]) assert.equal(html.includes(value), value === expected);
    assert.equal(label.text.staticValue.getText(), "Control fallback"); assert.equal(item.interfaceValues.length, mode === "absent" ? 0 : 1);
  });
}
for (const mode of ["missing", "null", "invalid", "tag-member", "tag-collection"]) test(`Unusable or tag defaults keep the control fallback: ${mode}`, async () => {
  const type = definition(caption()), value = member("Caption", mode === "null" ? undefined : mode === "invalid" ? {} : "Excluded default", mode === "tag-member");
  if (mode === "tag-collection") type.tagInterfaceProperties.push(value); else if (mode !== "missing") type.interfaceProperties.push(value);
  const html = await render(type); assert.ok(html.includes("Control fallback")); assert.ok(!html.includes("Excluded default"));
});
for (const [lcid, expected] of [[1033, "English &lt;default&gt;"], [1031, "Deutsch &lt;default&gt;"]]) test(`Standalone definitions use localized defaults: ${lcid}`, async () => {
  const text = HmiMultilingualText.fromText("English <default>", 1033); text.texts.set(1031, "Deutsch <default>");
  const type = definition(caption()); type.interfaceProperties.push(member("Caption", text));
  assert.ok((await render(type, undefined, lcid)).includes(expected)); assert.equal(text.texts.size, 2);
  const options = new HmiHtmlConvertOptions(); options.cultureLcid = lcid;
  const inspected = await new HmiScreenToHtmlConverter().convertInspectableAsync(type, undefined, options);
  assert.ok(inspected.html.includes(expected));
});
test("Defaults reach number, Boolean, color and image consumers", async () => {
  const button = Object.assign(new HmiButton(), { mode: fixed(HmiButtonType.GraphicAndText), text: fixed(HmiMultilingualText.fromText("Initial")), state: bind("State", 23), pressed: bind("Pressed", false), pressedContentOffset: bind("Offset", 23), captionColor: bind("Color", hmiColorFromArgb(255, 17, 18, 19)), image: bind("Image", image("fallback.svg")) });
  button.states.push(Object.assign(new HmiState(), { value: 2.5, text: HmiMultilingualText.fromText("Default state") }));
  const type = definition(button); for (const [name, value] of [["State", 2.5], ["Pressed", true], ["Offset", 3], ["Color", hmiColorFromArgb(255, 1, 2, 3)], ["Image", image("default.svg")]]) type.interfaceProperties.push(member(name, value));
  const html = await render(type); for (const value of ['aria-label="Default state"', "transform: translate(3px, 3px)", "color: #010203;", 'src="default.svg"']) assert.ok(html.includes(value), value);
  assert.equal(button.image.staticValue.uri, "fallback.svg");
});
test("Repeated and nested instances keep their own default scopes", async () => {
  const inner = definition(caption()); inner.interfaceProperties.push(member("Caption", "Inner default"));
  const nested = instance("inner"), outer = definition(caption(), nested); outer.interfaceProperties.push(member("Caption", "Outer default"));
  const first = instance("outer"), second = instance("outer"); second.interfaceValues.push({ name: "Caption", value: "Override" });
  const project = new Project(); project.types.set("outer", outer); project.types.set("inner", inner);
  const html = await render(screen(first, second), project);
  assert.equal((html.match(/Outer default/g) ?? []).length, 1); assert.equal((html.match(/Override/g) ?? []).length, 1); assert.equal((html.match(/Inner default/g) ?? []).length, 2);
  assert.equal(outer.interfaceProperties[0].defaultValue, "Outer default"); assert.equal(nested.interfaceValues.length, 0);
});
test("Duplicate defaults and explicit values retain the first eligible entry", async () => {
  const type = definition(caption()); type.interfaceProperties.push(member(" ", "Blank ignored"), member("Caption", "Tag ignored", true), member("caption", "First default"), member("CAPTION", "Second ignored"));
  assert.ok((await render(type)).includes("First default"));
  const item = instance("type"); item.interfaceValues.push({ name: "Caption", tagId: "tag" }, { name: "CAPTION", value: "First literal" }, { name: "caption", value: "Second literal" });
  const project = new Project(); project.types.set("type", type); const html = await render(screen(item), project);
  assert.ok(html.includes("First literal")); assert.ok(!html.includes("First default")); assert.ok(!html.includes("Second literal"));
});
