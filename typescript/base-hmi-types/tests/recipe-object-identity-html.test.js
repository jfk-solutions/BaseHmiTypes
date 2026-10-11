import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeParameter, HmiRecipeDataSet, HmiRecipeView, HmiRecipeViewElement, HmiRecipeToHtmlConverter } from "../dist/index.js";
for (const mode of ["exact","missing","empty","whitespace","unresolved","ambiguous"]) test(`View target requires one exact field identity: ${mode}`, () => {
  const recipe = new HmiRecipe(); recipe.name = "Recipe";
  const first = Object.assign(new HmiRecipeParameter(),{name:"Repeated <field>",sourceObjectId:"17-1",sourceIndex:0});
  const selected = Object.assign(new HmiRecipeParameter(),{name:"Repeated <field>",sourceObjectId:"17-9223372036854775807",sourceIndex:-7}); recipe.parameters.push(first,selected);
  recipe.dataSets.push(Object.assign(new HmiRecipeDataSet(),{name:"Record <&>",sourceObjectId:"17-3"}));
  const id = mode === "missing" ? undefined : mode === "empty" ? "" : mode === "whitespace" ? "17-9223372036854775807 " : mode === "unresolved" ? "17-4" : selected.sourceObjectId;
  if (mode === "empty") selected.sourceObjectId = ""; if (mode === "ambiguous") first.sourceObjectId = selected.sourceObjectId;
  const view = Object.assign(new HmiRecipeView(),{name:"View"}); view.elements.push(Object.assign(new HmiRecipeViewElement(),{name:"Element",targetElement:{sourceId:id,name:"Unverified target name"}})); recipe.views.push(view);
  const renderer = new HmiRecipeToHtmlConverter();
  for (const html of [renderer.convert(recipe),renderer.convertFragment(recipe)]) {
    assert.ok(html.includes("<h2>Source object identities</h2>")); assert.ok(html.includes("Record &lt;&amp;&gt;")); assert.ok(html.includes('<th scope="col">Recipe field</th>'));
    assert.ok(html.includes(mode === "exact" ? '<td data-value-state="present">Repeated &lt;field&gt;</td><td data-value-state="present">-7</td></tr>' : '<td data-value-state="missing">Missing</td><td data-value-state="missing">Missing</td></tr>'));
  }
  assert.equal(recipe.parameters.length,2); assert.equal(view.elements[0].targetElement.sourceId,id); assert.equal(selected.sourceIndex,-7);
});
test("Unavailable identities do not create a table", () => {
  const recipe = new HmiRecipe(); recipe.parameters.push(Object.assign(new HmiRecipeParameter(),{name:"Field"})); recipe.dataSets.push(Object.assign(new HmiRecipeDataSet(),{name:"Record"}));
  const renderer = new HmiRecipeToHtmlConverter(); assert.ok(!renderer.convert(recipe).includes("<h2>Source object identities</h2>")); recipe.dataSets[0].sourceObjectId = "<&>"; assert.ok(renderer.convertFragment(recipe).includes("&lt;&amp;&gt;"));
});
