import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeParameter, HmiRecipePlcDeclaration, HmiRecipePlcArray, HmiRecipeArrayDimension, HmiRecipeResolvedArrayDimension, HmiRecipeToHtmlConverter } from "../dist/index.js";

test("PLC array HTML preserves missing/empty dimensions and independent bound lists", () => {
  const recipe = new HmiRecipe(), field = new HmiRecipeParameter(), renderer = new HmiRecipeToHtmlConverter();
  field.name="Field <A>";recipe.parameters.push(field);
  assert.ok(!renderer.convert(recipe).includes("<h2>Source PLC array declarations</h2>"));
  field.sourcePlcArray = Object.assign(new HmiRecipePlcArray(),{originalTypeName:"Array[*] of <Type>",elementTypeName:"",isStarArray:true});
  let html = renderer.convert(recipe); assert.ok(html.includes("Array[*] of &lt;Type&gt;"));
  assert.ok(html.includes('<td data-value-state="present"></td><td data-value-state="present">Yes</td><td data-value-state="missing">Missing</td><td data-value-state="missing">Missing</td>'));
  assert.ok(!html.includes("<h2>Source PLC array bounds</h2>"));
  field.sourcePlcArray.dimensions=[];field.sourcePlcArray.resolvedDimensions=[];html=renderer.convert(recipe);
  assert.ok(html.includes('<td data-value-state="present">Yes</td><td data-value-state="present">0</td><td data-value-state="present">0</td>'));
  const declaration=Object.assign(new HmiRecipePlcDeclaration(),{name:"Parent <B>",array:Object.assign(new HmiRecipePlcArray(),{
    dimensions:[Object.assign(new HmiRecipeArrayDimension(),{start:"Symbol <A> & B",end:""}),Object.assign(new HmiRecipeArrayDimension(),{end:"Upper"})],
    resolvedDimensions:[Object.assign(new HmiRecipeResolvedArrayDimension(),{start:-2147483648,end:2147483647})]})});
  recipe.sourcePlcDeclarations.push(declaration);html=renderer.convert(recipe);
  assert.ok(html.includes("<h2>Source PLC array bounds</h2>"));assert.ok(html.includes("Symbol &lt;A&gt; &amp; B"));assert.ok(html.includes("Parent &lt;B&gt;"));
  assert.ok(html.includes('<td data-value-state="present">Declared</td><td data-value-state="present">2</td><td data-value-state="missing">Missing</td><td data-value-state="present">Upper</td>'));
  assert.ok(html.includes('<td data-value-state="present">Resolved</td><td data-value-state="present">1</td><td data-value-state="present">-2147483648</td><td data-value-state="present">2147483647</td>'));
  assert.equal(recipe.dataSets.length,0);assert.equal(field.defaultValue,undefined);
});
