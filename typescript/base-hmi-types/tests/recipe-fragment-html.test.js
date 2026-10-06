import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipeStructuredValue, HmiRecipeStructuredEntry, HmiRecipeValueKind, HmiRecipe, HmiRecipeParameter, HmiRecipeDataSet, HmiRecipeReference, HmiRecipeBinaryValue, HmiRecipeToHtmlConverter, HmiMultilingualText, HmiScreen, HmiLayer, HmiDetailedParameterControl, HmiOverviewParameterControl, HmiScreenToHtmlConverter, HmiHtmlConvertOptions, staticProperty } from "../dist/index.js";
function recipe() {
  const result = Object.assign(new HmiRecipe(), { name: "Definition <A>", comment: "Comment & note" });
  result.displayName = HmiMultilingualText.fromText("Default title"); result.displayName.texts.set(1031, "Localized <title>");
  const field = Object.assign(new HmiRecipeParameter(), { name: "Field <A>", dataType: "Real", defaultValue: "01.500", unit: "<unit>", minimumValue: "-4", maximumValue: "17", maximumLength: 23, required: false });
  field.references.set("Tag", Object.assign(new HmiRecipeReference(), { sourceId: "17-23", name: "Tag <A>" })); result.parameters.push(field);
  const record = Object.assign(new HmiRecipeDataSet(), { name: "Stored <record>" }); record.values["Field <A>"] = "001.00";
  const structured = Object.assign(new HmiRecipeStructuredValue(), { kind: HmiRecipeValueKind.Map });
  structured.entries.push(Object.assign(new HmiRecipeStructuredEntry(), { key: "__proto__", value: Object.assign(new HmiRecipeStructuredValue(), { kind: HmiRecipeValueKind.Scalar, value: "nested, <value>" }) }));
  record.sourceStructuredValues.set("Map", structured);
  record.sourceValues.set("Extra", undefined); record.sourceArrayValues.set("Array", ["01", undefined, ""]);
  record.sourceBinaryValues.set("Blob", Object.assign(new HmiRecipeBinaryValue(), { sourceType: "CoreBlob", payloadBase64: "AA==", decodedByteLength: 1 })); result.dataSets.push(record); return result;
}
for (const culture of [1031, 1033]) test(`Recipe fragment reuses the entire standalone body: ${culture}`, () => {
  const model = recipe(), converter = new HmiRecipeToHtmlConverter(), document = converter.convert(model, culture), fragment = converter.convertFragment(model, culture);
  const body = document.match(/<body>([\s\S]*)<\/body>/)[1];
  assert.equal(fragment.replace(/^<section[^>]*><style>[\s\S]*?<\/style>/, "").replace(/<\/section>$/, ""), body);
  assert.ok(!/<(?:html|head|body|meta|script)\b/i.test(fragment));
  for (const text of ["Maximum length", "&lt;unit&gt;", "Tag &lt;A&gt;", "Stored records", "001.00", "Stored array values", "AA==", "Stored structured values", "nested, &lt;value&gt;"])
    assert.ok(fragment.includes(text), text);
  assert.ok(fragment.includes(".hmi-recipe-definition th,.hmi-recipe-definition td"));
  assert.equal(model.dataSets.length, 1); assert.equal(model.parameters[0].name, "Field <A>");
});
for (const Type of [HmiDetailedParameterControl, HmiOverviewParameterControl]) test(`Linked definition contains complete stored metadata: ${Type.name}`, async () => {
  const control = new Type(), screen = new HmiScreen(), layer = new HmiLayer(); layer.items.push(control); screen.layers.push(layer);
  control.defaultParameterSetType = recipe(); const options = new HmiHtmlConvertOptions(); options.cultureLcid = 1031;
  const renderer = new HmiScreenToHtmlConverter(), html = await renderer.convertAsync(screen, undefined, options);
  assert.ok(html.includes('Configured parameter set type: Localized &lt;title&gt;'));
  assert.ok(html.includes(new HmiRecipeToHtmlConverter().convertFragment(control.defaultParameterSetType, 1031)));
  assert.equal((html.match(/<meta charset=/g) ?? []).length, 1); assert.ok(html.includes("Parameter data not loaded"));
  const invalidOptions = new HmiHtmlConvertOptions(); invalidOptions.cultureLcid = -2147483648;
  assert.ok((await renderer.convertAsync(screen, undefined, invalidOptions)).includes("Configured parameter set type: Default title"));
  if (control instanceof HmiDetailedParameterControl) { control.hideDetails = staticProperty(true); const hidden = await renderer.convertAsync(screen); assert.ok(!hidden.includes('class="hmi-recipe-definition"')); assert.ok(hidden.includes('data-default-parameter-set-type-field-count="1"')); }
});
test("An empty fragment reports unavailable stored records without creating them", () => {
  const model = new HmiRecipe(), html = new HmiRecipeToHtmlConverter().convertFragment(model);
  assert.ok(html.includes("No stored records.")); assert.equal(model.dataSets.length, 0); assert.equal(model.parameters.length, 0);
});
