import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeDataSet, HmiRecipeToHtmlConverter } from "../dist/index.js";

test("Record metadata is independent of values and tolerates invalid model dates",()=>{
 const recipe=new HmiRecipe(),data=new HmiRecipeDataSet();data.name="Record <A>";data.sourceNumber=0;recipe.dataSets.push(data);const renderer=new HmiRecipeToHtmlConverter();
 assert.ok(!renderer.convert(recipe).includes("<h2>Stored record metadata</h2>"));data.lastUser="";
 let html=renderer.convert(recipe);for(const fragment of ["<h2>Stored record metadata</h2>","Record &lt;A&gt;",'data-value-state="missing">Missing','data-value-state="present"></td>'])assert.ok(html.includes(fragment),fragment);
 data.lastModification=new Date("2025-02-03T04:05:06.123Z");data.lastUser="User <B> & C";
 html=renderer.convert(recipe);assert.ok(html.includes('<td data-value-state="present">2025-02-03T04:05:06.123Z</td>'));assert.ok(html.includes("User &lt;B&gt; &amp; C"));assert.equal(Object.keys(data.values).length,0);assert.equal(data.sourceValues.size,0);
 data.lastModification=new Date(NaN);html=renderer.convert(recipe);assert.ok(html.includes('data-value-state="missing">Missing'));assert.ok(!html.includes("Invalid Date"));assert.ok(html.includes("User &lt;B&gt; &amp; C"));
});
