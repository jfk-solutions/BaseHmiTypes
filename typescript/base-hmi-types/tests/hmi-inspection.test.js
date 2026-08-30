import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiGroup,
  HmiLayer,
  HmiPropertyKind,
  HmiRectangle,
  HmiReferenceObjectSettings,
  HmiScreen,
  HmiScreenToHtmlConverter,
  HmiScreenWindow,
  HmiTagTriggerMode,
  HmiTriggerKind,
  expressionProperty,
  inspectHmiProperties,
  staticProperty,
  tagProperty,
} from "../dist/index.js";

test("HTML conversion renders materialized reference objects", async () => {
  const materialized = new HmiGroup();
  materialized.name = "PumpFaceplate";
  materialized.x = staticProperty(5);
  materialized.y = staticProperty(6);
  materialized.width = staticProperty(100);
  materialized.height = staticProperty(50);
  const pumpBody = createRectangle("PumpBody");
  pumpBody.x = staticProperty(7);
  pumpBody.y = staticProperty(8);
  materialized.items.push(pumpBody);

  const reference = new HmiGroup();
  reference.name = "Pump101";
  reference.x = staticProperty(10);
  reference.y = staticProperty(20);
  reference.width = staticProperty(100);
  reference.height = staticProperty(50);
  reference.isReferenceObject = true;
  reference.referenceObject = new HmiReferenceObjectSettings();
  reference.referenceObject.source = "Pumps.PumpFaceplate";
  reference.referenceObject.materializedObject = materialized;

  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(reference);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /class="hmi-reference-object"/);
  assert.match(html, /data-hmi-reference-source="Pumps\.PumpFaceplate"/);
  assert.match(html, /id="Pump101"/);
  assert.match(html, /id="PumpFaceplate"/);
  assert.match(html, /id="PumpBody"/);
});

test("inspectable HMI conversion keeps model and rendered hierarchy aligned", async () => {
  const template = createScreen("template", "Template");
  template.layers[0].items.push(createRectangle("Duplicate"));

  const nested = createScreen("nested", "Nested");
  nested.layers[0].items.push(createRectangle("Duplicate"));
  const recursiveWindow = new HmiScreenWindow();
  recursiveWindow.name = "Recursive";
  recursiveWindow.screenId = staticProperty("root");
  nested.layers[0].items.push(recursiveWindow);

  const root = createScreen("root", "Root");
  root.templateId = staticProperty("template");
  root.layers[0].items.push(createRectangle("Duplicate"));
  const hidden = createRectangle("Hidden");
  hidden.visible = staticProperty(false);
  root.layers[0].items.push(hidden);

  const group = new HmiGroup();
  group.name = "Group";
  group.items.push(createRectangle("Duplicate"));
  root.layers[0].items.push(group);

  const nestedWindow = new HmiScreenWindow();
  nestedWindow.name = "Nested window";
  nestedWindow.screenId = staticProperty("nested");
  root.layers[0].items.push(nestedWindow);

  const missingWindow = new HmiScreenWindow();
  missingWindow.name = "Missing window";
  missingWindow.screenId = staticProperty("missing");
  root.layers[0].items.push(missingWindow);

  const screens = new Map([
    ["root", root],
    ["Root", root],
    ["template", template],
    ["Template", template],
    ["nested", nested],
    ["Nested", nested],
  ]);
  const project = {
    info: {},
    getScreen: async id => screens.get(id),
  };

  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(root, project);
  const nodes = flatten(result.inspection.root);
  assert.equal(new Set(nodes.map(node => node.key)).size, nodes.length);
  assert.ok(nodes.some(node => node.origin === "template" && node.typeName === "HmiRectangle"));
  assert.ok(nodes.some(node => node.origin === "subscreen" && node.typeName === "HmiRectangle"));
  assert.equal(nodes.find(node => node.name === "Hidden")?.rendered, false);
  assert.equal(nodes.find(node => node.referenceStatus === "missing")?.selectable, false);
  assert.equal(nodes.find(node => node.referenceStatus === "recursive")?.selectable, false);

  for (const node of nodes.filter(node => node.rendered))
    assert.match(result.html, new RegExp(`data-hmi-node-key="${escapeRegExp(node.key)}"`));
  assert.doesNotMatch(result.html, /data-hmi-node-key="screen\/layer:0\/item:1"/);
});

test("property inspection separates fallback values and dynamic bindings", () => {
  const tag = tagProperty("Motor.Speed", 42);
  tag.triggers.push({
    kind: HmiTriggerKind.Tag,
    name: "Speed changed",
    tagNames: ["Motor.Speed"],
    mode: HmiTagTriggerMode.ValueChange,
  });
  const expression = expressionProperty("A + B", 7);
  expression.converters.push({
    kind: "Expression",
    name: "Scale",
    expression: "value * 10",
    language: "JavaScript",
    parameters: { factor: 10 },
  });
  const cyclic = { label: "cycle" };
  cyclic.self = cyclic;
  const model = {
    x: staticProperty(12),
    value: tag,
    calculated: expression,
    nested: cyclic,
    items: [{ ignored: true }],
  };

  const properties = inspectHmiProperties(model);
  assert.equal(properties.find(property => property.name === "x")?.value, "12");
  assert.equal(properties.find(property => property.name === "value")?.binding?.kind, HmiPropertyKind.Tag);
  assert.match(properties.find(property => property.name === "value")?.binding?.summary ?? "", /Motor\.Speed/);
  assert.equal(properties.find(property => property.name === "calculated")?.binding?.kind, HmiPropertyKind.Expression);
  assert.ok(hasPropertyValue(properties.find(property => property.name === "nested")?.children ?? [], "[Circular]"));
  assert.equal(properties.some(property => property.name === "items"), false);
});

test("tag binding retains selected metadata property", () => {
  const property = tagProperty("Tank.Level", undefined, "EngineeringUnits");

  assert.equal(property.kind, HmiPropertyKind.Tag);
  assert.equal(property.tagName, "Tank.Level");
  assert.equal(property.propertyName, "EngineeringUnits");
});

function createScreen(id, name) {
  const screen = new HmiScreen();
  screen.id = id;
  screen.name = name;
  screen.width = staticProperty(800);
  screen.height = staticProperty(480);
  const layer = new HmiLayer();
  layer.name = "Default";
  screen.layers.push(layer);
  return screen;
}

function createRectangle(name) {
  const item = new HmiRectangle();
  item.name = name;
  item.width = staticProperty(100);
  item.height = staticProperty(50);
  return item;
}

function flatten(root) {
  return [root, ...root.children.flatMap(flatten)];
}

function hasPropertyValue(properties, value) {
  return properties.some(property => property.value === value || hasPropertyValue(property.children, value));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
