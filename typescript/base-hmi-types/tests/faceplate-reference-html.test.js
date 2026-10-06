import assert from "node:assert/strict";
import test from "node:test";
import {
  HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiGroup,
  HmiLabel, HmiButton, HmiIOField, HmiTextBox, HmiMultilingualText,
  HmiProjectBase, HmiScreenToHtmlConverter, HmiHtmlConvertOptions,
  faceplateInterfaceProperty, staticProperty,
} from "../dist/index.js";

class Project extends HmiProjectBase {
  calls = [];
  byId = new Map();
  byVersion = new Map();
  async getFaceplate(id, signal) { this.calls.push(["id", id, signal]); return this.byId.get(id); }
  async getFaceplateByNameAndVersion(name, version, signal) { this.calls.push(["version", name, version, signal]); return this.byVersion.get(`${name}/${version}`); }
}
function screen(...items) {
  const result = new HmiScreen(), layer = new HmiLayer();
  result.name = "Root"; layer.items.push(...items); result.layers.push(layer); return result;
}
function definition(...items) {
  const result = new HmiFaceplateType(), layer = new HmiLayer();
  layer.items.push(...items); result.layers.push(layer); return result;
}
function instance(id) { const result = new HmiFaceplateContainer(); result.faceplateId = id; return result; }
function label(text) { const result = new HmiLabel(); result.text = staticProperty(HmiMultilingualText.fromText(text)); return result; }

for (const idFound of [true, false]) test(`Faceplate lookup prefers ID and falls back to exact name/version: ${idFound}`, async () => {
  const project = new Project(), item = instance("type-id"); item.faceplateName = "GenericType"; item.faceplateVersion = "2.0";
  const type = definition(label("Resolved caption")); type.name = "Definition";
  if (idFound) project.byId.set("type-id", type); else project.byVersion.set("GenericType/2.0", type);
  const controller = new AbortController(), rows = [], options = new HmiHtmlConvertOptions(); options.itemDiagnostic = row => rows.push(row);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen(item), project, options, controller.signal);
  assert.ok(html.includes("Resolved caption")); assert.equal(rows[0].rendererRoute, "HmiFaceplateContainer");
  assert.equal(project.calls.length, idFound ? 1 : 2); assert.equal(project.calls[0][2], controller.signal);
  if (!idFound) assert.deepEqual(project.calls[1], ["version", "GenericType", "2.0", controller.signal]);
  assert.equal((html.match(/<meta charset=/g) ?? []).length, 1);
});

test("Missing faceplate is escaped and does not render unrelated retained children", async () => {
  const project = new Project(), item = instance("missing"); item.faceplateName = "<Missing&Type>"; item.items.push(label("Retained child"));
  const options = new HmiHtmlConvertOptions(); options.missingScreenPlaceholderCssClass = "custom-missing";
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen(item), project, options);
  assert.ok(html.includes('class="custom-missing"')); assert.ok(html.includes("&lt;Missing&amp;Type&gt;")); assert.ok(!html.includes("Retained child"));
  assert.equal(project.calls.length, 1);
});

test("Repeated instances resolve independent interface captions without mutating the definition", async () => {
  const project = new Project(), controls = [new HmiLabel(), new HmiButton(), new HmiIOField(), new HmiTextBox()];
  for (const control of controls) control.text = faceplateInterfaceProperty("Caption", HmiMultilingualText.fromText("Fallback"));
  const group = new HmiGroup(); group.items.push(...controls); const type = definition(group); project.byId.set("shared", type);
  const first = instance("shared"), second = instance("shared");
  first.interfaceValues.push({ name: "caption", value: "First <caption>" }, { name: "CAPTION", value: "Duplicate ignored" });
  second.interfaceValues.push({ name: "Caption", value: HmiMultilingualText.fromText("Second caption") });
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen(first, second), project);
  assert.equal((html.match(/First &lt;caption&gt;/g) ?? []).length, 5); // button also has aria-label
  assert.equal((html.match(/Second caption/g) ?? []).length, 5);
  assert.ok(!html.includes("Duplicate ignored")); assert.ok(!html.includes("Recursive screen reference"));
  for (const control of controls) assert.equal(control.text.staticValue.getText(), "Fallback");
});

for (const values of [
  [{ name: "Caption", value: "Runtime tag", tagName: "Tag" }],
  [{ name: "Caption", value: "Runtime tag", tagId: "tag-id" }],
  [{ name: "Caption", value: null }, { name: "Caption", value: "Later duplicate" }],
  [{ name: "Caption", value: 42 }],
  [{ name: "Caption", value: "" }],
]) test(`Interface text keeps fallback for tag/null/invalid values and accepts empty text: ${JSON.stringify(values)}`, async () => {
  const project = new Project(), item = instance("type"), control = new HmiLabel();
  control.text = faceplateInterfaceProperty("Caption", HmiMultilingualText.fromText("Fallback"));
  item.interfaceValues.push(...values); project.byId.set("type", definition(control));
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen(item), project);
  assert.equal(html.includes("Fallback"), values[0].value !== ""); assert.ok(!html.includes("Runtime tag")); assert.ok(!html.includes("Later duplicate"));
});

test("Nested faceplates replace the parent interface scope", async () => {
  const project = new Project(), outer = instance("outer"), inner = instance("inner"), child = new HmiLabel();
  child.text = faceplateInterfaceProperty("Caption", HmiMultilingualText.fromText("Inner fallback"));
  outer.interfaceValues.push({ name: "Caption", value: "Outer caption" });
  project.byId.set("outer", definition(inner)); project.byId.set("inner", definition(child));
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen(outer), project);
  assert.ok(html.includes("Inner fallback")); assert.ok(!html.includes("Outer caption"));
});

for (const id of [undefined, "recursive-id"]) test(`Recursive faceplate terminates for object identity/ID: ${id}`, async () => {
  const project = new Project(), type = definition(instance("self")); type.id = id; project.byId.set("self", type);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen(instance("self")), project);
  assert.ok(html.includes("Recursive screen reference")); assert.ok(html.includes(`data-hmi-recursive-screen="${id ?? "anonymous"}"`));
  assert.equal(project.calls.length, 2);
});

test("Provider errors propagate and cancelled renders stop", async () => {
  const project = new Project(); project.getFaceplate = async () => { throw new Error("Synthetic provider failure"); };
  await assert.rejects(new HmiScreenToHtmlConverter().convertAsync(screen(instance("type")), project), /Synthetic provider failure/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(new HmiScreenToHtmlConverter().convertAsync(screen(instance("type")), undefined, undefined, controller.signal), { name: "AbortError" });
});

for (const [sourceName, bindingName, matches] of [["caption", "CAPTION", true], ["straße", "STRASSE", false], ["ı", "I", false], ["ä", "Ä", true]])
  test(`Interface names use ordinal case matching: ${sourceName}/${bindingName}`, async () => {
    const project = new Project(), item = instance("type"), control = new HmiLabel();
    control.text = faceplateInterfaceProperty(bindingName, HmiMultilingualText.fromText("Fallback"));
    item.interfaceValues.push({ name: sourceName, value: "Matched caption" }); project.byId.set("type", definition(control));
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen(item), project);
    assert.equal(html.includes("Matched caption"), matches); assert.equal(html.includes("Fallback"), !matches);
  });

test("Different objects with the same case-insensitive definition ID terminate recursion", async () => {
  const project = new Project(), first = definition(instance("second")), second = definition(instance("first"));
  first.id = "TYPE-ID"; second.id = "type-id"; project.byId.set("first", first); project.byId.set("second", second);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen(instance("first")), project);
  assert.ok(html.includes('data-hmi-recursive-screen="type-id"')); assert.equal(project.calls.length, 2);
});
