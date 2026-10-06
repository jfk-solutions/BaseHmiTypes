import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeDataSet, HmiRecipeStructuredValue, HmiRecipeStructuredEntry, HmiRecipeValueKind as Kind, HmiRecipeToHtmlConverter } from "../dist/index.js";

const node = (kind = Kind.Null, values = {}) => Object.assign(new HmiRecipeStructuredValue(), { kind }, values);
const entry = (key, value) => Object.assign(new HmiRecipeStructuredEntry(), { key, value });
function recipe(value) { const result = new HmiRecipe(), record = new HmiRecipeDataSet(); result.name = "Recipe"; record.name = "Record <A>"; record.sourceNumber = 0; record.sourceStructuredValues.set("Key<&>", value); result.dataSets.push(record); return result; }

test("Structured values render boundaries, states and escaped metadata in documents and fragments", () => {
  const root = node(Kind.Map, { sourceType: "CoreMap" }), array = node(Kind.Array); array.items.push(node(), node(Kind.Scalar, { value: "item" }));
  root.entries.push(entry("", node()), entry("Empty", node(Kind.Scalar, { value: "" })), entry("Text<&>", node(Kind.Scalar, { value: "<script>alert(1)</script>, [value]" })),
    entry("EmptyMap", node(Kind.Map)), entry("EmptyArray", node(Kind.Array)), entry("Array", array),
    entry("Binary", node(Kind.Binary, { binary: { sourceType: "CoreBlob", sourceBlobType: 1, sourceDeclaredLength: "3", decodedByteLength: 3, payloadBase64: "AP8D" } })),
    entry("MissingBinary", node(Kind.Binary, { binary: { sourceBlobType: 37 } })), entry("EmptyBinary", node(Kind.Binary, { binary: { payloadBase64: "" } })),
    entry("Reference", node(Kind.Reference, { reference: { sourceId: "17-23", name: "Target <A>" } })), entry("Unknown", node(Kind.Unsupported, { sourceType: "<vendor>" })));
  const converter = new HmiRecipeToHtmlConverter(), document = converter.convert(recipe(root)), fragment = converter.convertFragment(recipe(root));
  for (const html of [document, fragment]) {
    for (const text of ["Stored structured values", "Record &lt;A&gt;", "Key&lt;&amp;&gt;", "<dt></dt>", "Text&lt;&amp;&gt;", "&lt;script&gt;alert(1)&lt;/script&gt;, [value]", "Empty map", "Empty array", '<ol start="0">', "AP8D", "Payload unavailable", "Empty payload", "Source reference", "17-23", "Target &lt;A&gt;", "Unsupported value: &lt;vendor&gt;", 'data-structured-kind="Null"', 'data-value-state="missing"']) assert.ok(html.includes(text), text);
    assert.ok(!html.includes("<script>")); assert.ok(!html.includes("<vendor>"));
  }
  assert.ok(!fragment.includes("<html")); assert.ok(!fragment.includes("<body"));
});

test("Renderer guards model cycles and depth and preserves repeated aliases", () => {
  const root = node(Kind.Map), shared = node(Kind.Map); shared.entries.push(entry("Value", node(Kind.Scalar, { value: "shared<&>" })));
  root.entries.push(entry("Self", root), entry("First", shared), entry("Second", shared));
  const deep = node(Kind.Array); let cursor = deep;
  for (let index = 0; index < 130; index++) { const next = node(Kind.Array); cursor.items.push(next); cursor = next; }
  cursor.items.push(node(Kind.Scalar, { value: "HiddenAtLimit" })); root.entries.push(entry("Deep", deep));
  const html = new HmiRecipeToHtmlConverter().convert(recipe(root));
  assert.ok(html.includes("Recursive value")); assert.ok(html.includes("Depth limit"));
  assert.equal(html.split("shared&lt;&amp;&gt;").length - 1, 2); assert.ok(!html.includes("HiddenAtLimit"));
});

test("Recipes without structured values keep the section absent", () => {
  assert.ok(!new HmiRecipeToHtmlConverter().convert(new HmiRecipe()).includes("Stored structured values"));
});
