import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeParameter, HmiRecipeReference, HmiRecipeToHtmlConverter } from "../dist/index.js";
test("field reference HTML keeps source identity and escaped names separate from record values",()=>{
  const recipe=new HmiRecipe(),field=new HmiRecipeParameter();recipe.name="Recipe";field.name="Field <A>";field.sourceIndex=0;field.sourceElementId=23;field.triggerRedraw=false;
  field.references.set("Tag",Object.assign(new HmiRecipeReference(),{sourceId:"17-9223372036854775807"}));
  field.references.set("TextList",Object.assign(new HmiRecipeReference(),{sourceId:"17-24",name:"List <A> & B"}));recipe.parameters.push(field);
  let html=new HmiRecipeToHtmlConverter().convert(recipe);
  assert.ok(html.includes("Trigger redraw</th>"));assert.ok(html.includes("<td>No</td>"));assert.ok(html.includes("<h2>Field references</h2>"));
  assert.ok(html.includes('<td>0</td><th scope="row">Field &lt;A&gt;</th><td>23</td><td>Tag</td><td>17-9223372036854775807</td><td></td>'));
  assert.ok(html.includes("List &lt;A&gt; &amp; B"));assert.ok(html.includes("No stored records."));
  field.references.clear();delete field.triggerRedraw;html=new HmiRecipeToHtmlConverter().convert(recipe);
  assert.ok(!html.includes("<h2>Field references</h2>"));assert.ok(!html.includes("<td>No</td>"));
});
