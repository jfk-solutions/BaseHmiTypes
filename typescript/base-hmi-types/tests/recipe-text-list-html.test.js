import assert from "node:assert/strict";
import test from "node:test";
import { HmiMultilingualText, HmiRecipe, HmiRecipeParameter, HmiRecipeReference, HmiRecipeDataSet, HmiTextList, HmiTextListEntry, HmiRecipeToHtmlConverter } from "../dist/index.js";

test("Recipe HTML distinguishes unresolved and empty text lists", () => {
  const recipe = new HmiRecipe(), field = Object.assign(new HmiRecipeParameter(), { name: "Field" }), renderer = new HmiRecipeToHtmlConverter();
  field.references.set("TextList", Object.assign(new HmiRecipeReference(), { sourceId: "17-6" })); recipe.parameters.push(field);
  assert.ok(!renderer.convert(recipe).includes("<h2>Field text lists</h2>"));
  field.textList = Object.assign(new HmiTextList(), { name: "Empty" }); const html = renderer.convert(recipe);
  assert.ok(html.includes("<h2>Field text lists</h2>")); assert.ok(html.includes('<td data-value-state="present">0</td></tr>'));
  assert.ok(!html.includes("<h2>Field text-list entries</h2>"));
});

test("Recipe text-list entry order, localization and raw values remain independent", () => {
  const recipe = new HmiRecipe(), text = HmiMultilingualText.fromText("Neutral <A>"), renderer = new HmiRecipeToHtmlConverter();
  text.texts.set(1031, "Translated & B"); text.texts.set(1033, ""); text.formattedTexts.set(1031, "<b>Formatted</b>");
  const field = Object.assign(new HmiRecipeParameter(), { name: "Field <A>", sourceIndex: 0, sourceElementId: 0,
    textList: Object.assign(new HmiTextList(), { name: "List <A>", rangeType: "37", comment: HmiMultilingualText.fromText("Comment & B", 1031) }) });
  field.textList.entries.push(Object.assign(new HmiTextListEntry(), { name: "Choice <A>", from: -2147483648, to: 0, default: true, text }),
    Object.assign(new HmiTextListEntry(), { name: "Choice <A>", from: 0, to: 2147483647 })); recipe.parameters.push(field);
  const record = Object.assign(new HmiRecipeDataSet(), { name: "Record" }); record.values["Field <A>"] = "17"; recipe.dataSets.push(record);
  let html = renderer.convert(recipe, 1031);
  for (const fragment of ["List &lt;A&gt;", "Comment &amp; B", "Translated &amp; B", '<td data-value-state="present">37</td>', '<td data-value-state="present">17</td>']) assert.ok(html.includes(fragment), fragment);
  assert.ok(html.includes('<td data-value-state="missing">Missing</td><td data-value-state="present">1</td><td data-value-state="present">Choice &lt;A&gt;</td><td data-value-state="present">-2147483648</td><td data-value-state="present">0</td><td data-value-state="present">Yes</td>'));
  assert.ok(html.includes('<td data-value-state="present">2</td><td data-value-state="present">Choice &lt;A&gt;</td><td data-value-state="present">0</td><td data-value-state="present">2147483647</td><td data-value-state="present">No</td><td data-value-state="missing">Missing</td>'));
  assert.ok(!html.includes("<b>Formatted</b>")); html = renderer.convert(recipe, 1033);
  assert.ok(!html.includes("Neutral &lt;A&gt;")); assert.ok(!html.includes("Translated &amp; B")); assert.ok(html.includes('<td data-value-state="present">Yes</td><td data-value-state="present"></td>'));
  assert.ok(renderer.convert(recipe, 1036).includes("Neutral &lt;A&gt;")); assert.equal(record.values["Field <A>"], "17"); assert.equal(field.textList.entries.length, 2);
});
