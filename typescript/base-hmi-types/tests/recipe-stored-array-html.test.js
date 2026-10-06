import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeDataSet, HmiRecipeToHtmlConverter } from "../dist/index.js";

test("Stored arrays retain order, empty arrays and null members independently of scalar values", () => {
  const recipe = new HmiRecipe(), record = new HmiRecipeDataSet(), renderer = new HmiRecipeToHtmlConverter();
  record.name = "Record <A>"; record.sourceNumber = 0; recipe.dataSets.push(record);
  assert.ok(!renderer.convert(recipe).includes("<h2>Stored array values</h2>"));
  record.sourceArrayValues.set("Key <A>", ["12.3400", undefined, "", "<member> & end"]);
  record.sourceArrayValues.set("key <a>", []);
  const html = renderer.convert(recipe);
  for (const fragment of ['<h2>Stored array values</h2>', 'Values (storage order)', 'Record &lt;A&gt;', 'Key &lt;A&gt;', 'key &lt;a&gt;', '<ol start="0">', '<li data-value-state="present">12.3400</li><li data-value-state="null">Null</li><li data-value-state="present"></li><li data-value-state="present">&lt;member&gt; &amp; end</li>', '<td>0</td><td>Empty array</td>'])
    assert.ok(html.includes(fragment), fragment);
  assert.equal(Object.keys(record.values).length, 0); assert.equal(record.sourceValues.size, 0); assert.equal(record.sourceArrayValues.size, 2);
});
