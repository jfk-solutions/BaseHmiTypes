import assert from "node:assert/strict";
import test from "node:test";
import {
  HmiScreen, HmiLayer, HmiFaceplateType, HmiFaceplateContainer, HmiGroup,
  HmiLabel, HmiProjectBase, HmiMultilingualText, HmiScreenToHtmlConverter,
  inspectHmiScreenAsync, staticProperty, faceplateInterfaceProperty,
} from "../dist/index.js";

function screen(...items) {
  const result = new HmiScreen(), layer = new HmiLayer(); result.name = "Root";
  layer.items.push(...items); result.layers.push(layer); return result;
}
function definition(...items) {
  const result = new HmiFaceplateType(), layer = new HmiLayer();
  layer.items.push(...items); result.layers.push(layer); return result;
}
function instance(id) { const result = new HmiFaceplateContainer(); result.faceplateId = id; return result; }
function caption(text) { const result = new HmiLabel(); result.name = text; result.text = staticProperty(HmiMultilingualText.fromText(text)); return result; }
function flatten(node) { return [node, ...node.children.flatMap(flatten)]; }
function markup(html) { return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""); }
function verifyKeys(result) {
  const html = markup(result.html), nodes = flatten(result.inspection.root);
  for (const node of nodes.filter(node => node.rendered))
    assert.ok(html.includes(`data-hmi-node-key="${node.key}"`), `Rendered node missing from HTML: ${node.key}`);
  for (const match of html.matchAll(/data-hmi-node-key="([^"]+)"/g)) {
    assert.ok(result.inspection.modelsByKey.has(match[1]), `HTML node missing from inspection: ${match[1]}`);
    assert.ok(nodes.find(node => node.key === match[1])?.rendered);
  }
}

for (const idFound of [true, false]) test(`Definition traversal shares lookup with rendering: ID found ${idFound}`, async () => {
  const item = instance("type-id"), child = caption("Definition caption"), type = definition(child), calls = [];
  item.faceplateName = "GenericType"; item.faceplateVersion = "2.0";
  const project = new HmiProjectBase();
  project.getFaceplate = async (id, signal) => { calls.push(["id", id, signal]); return idFound ? type : undefined; };
  project.getFaceplateByNameAndVersion = async (name, version, signal) => { calls.push(["version", name, version, signal]); return type; };
  const controller = new AbortController();
  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(screen(item), project, undefined, controller.signal);
  const key = "screen/layer:0/item:0/faceplate/layer:0/item:0";
  assert.equal(result.inspection.modelsByKey.get(key), child);
  assert.equal(flatten(result.inspection.root).find(node => node.key === key).origin, "faceplate");
  assert.equal(calls.length, idFound ? 1 : 2); assert.equal(calls[0][2], controller.signal);
  if (!idFound) assert.deepEqual(calls[1], ["version", "GenericType", "2.0", controller.signal]);
  verifyKeys(result);
});

test("Changing provider results cannot detach the selected model from rendered content", async () => {
  const project = new HmiProjectBase(), item = instance("type"); let count = 0, returned;
  project.getFaceplate = async () => { returned = caption(`Snapshot ${++count}`); return definition(returned); };
  const renderer = new HmiScreenToHtmlConverter(), root = screen(item);
  const first = await renderer.convertInspectableAsync(root, project);
  assert.equal(count, 1); assert.equal(first.inspection.modelsByKey.get("screen/layer:0/item:0/faceplate/layer:0/item:0"), returned);
  assert.ok(markup(first.html).includes("Snapshot 1")); verifyKeys(first);
  const second = await renderer.convertInspectableAsync(root, project);
  assert.equal(count, 2); assert.ok(markup(second.html).includes("Snapshot 2")); verifyKeys(second);
});

for (const visible of [true, false]) test(`Retained instance children are discoverable but unrendered: ${visible}`, async () => {
  const project = new HmiProjectBase(), item = instance("type"), retained = caption("Retained child"), child = caption("Definition child");
  item.visible = staticProperty(visible); item.items.push(retained); project.getFaceplate = async () => definition(child);
  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(screen(item), project), nodes = flatten(result.inspection.root);
  const localKey = "screen/layer:0/item:0/item:0", definitionKey = "screen/layer:0/item:0/faceplate/layer:0/item:0";
  assert.equal(result.inspection.modelsByKey.get(localKey), retained); assert.equal(nodes.find(node => node.key === localKey).rendered, false);
  assert.equal(nodes.find(node => node.key === definitionKey).rendered, visible);
  assert.equal(markup(result.html).includes("Definition child"), visible); assert.ok(!markup(result.html).includes("Retained child")); verifyKeys(result);
});

test("Missing definition has an explicit non-selectable reference and cached missing result", async () => {
  const project = new HmiProjectBase(), item = instance("missing"); let calls = 0;
  project.getFaceplate = async () => { calls++; return undefined; };
  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(screen(item), project);
  const node = flatten(result.inspection.root).find(node => node.referenceStatus === "missing");
  assert.equal(node.origin, "faceplate"); assert.equal(node.typeName, "Missing faceplate reference"); assert.equal(node.selectable, false); assert.equal(node.rendered, false); assert.equal(calls, 1); verifyKeys(result);
});

for (const id of [undefined, "recursive-id"]) test(`Recursive inspection terminates and agrees with HTML: ${id}`, async () => {
  const project = new HmiProjectBase(), type = definition(instance("self")); type.id = id;
  project.getFaceplate = async () => type;
  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(screen(instance("self")), project);
  const references = flatten(result.inspection.root).filter(node => node.referenceStatus === "recursive");
  assert.equal(references.length, 1); assert.equal(references[0].origin, "faceplate"); assert.equal(references[0].selectable, false);
  assert.ok(markup(result.html).includes("Recursive screen reference")); verifyKeys(result);
});

test("Different definition IDs with the same name remain nested and selectable", async () => {
  const project = new HmiProjectBase(), first = definition(instance("second")), child = caption("Nested caption"), second = definition(child);
  first.id = "first-id"; second.id = "second-id"; first.name = second.name = "GenericType";
  project.getFaceplate = async id => id === "first" ? first : second;
  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(screen(instance("first")), project);
  assert.ok(!flatten(result.inspection.root).some(node => node.referenceStatus === "recursive"));
  assert.ok(markup(result.html).includes("Nested caption")); verifyKeys(result);
});

test("Repeated instances have distinct keys and scoped captions while sharing the definition model", async () => {
  const project = new HmiProjectBase(), first = instance("type"), second = instance("type"), child = caption("Fallback"), group = new HmiGroup();
  child.text = faceplateInterfaceProperty("Caption", HmiMultilingualText.fromText("Fallback")); group.items.push(child); const type = definition(group);
  first.interfaceValues.push({ name: "Caption", value: "First caption" }); second.interfaceValues.push({ name: "Caption", value: "Second caption" });
  project.getFaceplate = async () => type;
  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(screen(first, second), project);
  const nodes = flatten(result.inspection.root).filter(node => node.typeName === "HmiLabel");
  assert.equal(nodes.length, 2); assert.notEqual(nodes[0].key, nodes[1].key);
  assert.equal(result.inspection.modelsByKey.get(nodes[0].key), child); assert.equal(result.inspection.modelsByKey.get(nodes[1].key), child);
  assert.ok(markup(result.html).includes("First caption")); assert.ok(markup(result.html).includes("Second caption")); verifyKeys(result);
});

test("Standalone inspection resolves definitions and forwards cancellation/provider errors", async () => {
  const project = new HmiProjectBase(), item = instance("type"), child = caption("Caption");
  project.getFaceplate = async () => definition(child);
  const result = await inspectHmiScreenAsync(screen(item), project); assert.equal(result.modelsByKey.get("screen/layer:0/item:0/faceplate/layer:0/item:0"), child);
  project.getFaceplate = async () => { throw new Error("Synthetic lookup failure"); };
  await assert.rejects(new HmiScreenToHtmlConverter().convertInspectableAsync(screen(item), project), /Synthetic lookup failure/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(inspectHmiScreenAsync(screen(item), project, controller.signal), { name: "AbortError" });
});
