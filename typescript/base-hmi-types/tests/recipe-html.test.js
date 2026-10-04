import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeParameter, HmiRecipeDataSet, HmiRecipeToHtmlConverter } from "../dist/index.js";

test("Recipe HTML renders metadata and retains unmatched record columns", () => {
  const recipe = Object.assign(new HmiRecipe(), { name: "Recipe <A>", comment: "Engineering & data" });
  recipe.parameters.push(Object.assign(new HmiRecipeParameter(), { sourceIndex: 7, name: "Pressure", tag: "PLC.Pressure",
    dataType: "Real", unit: "bar", minimumValue: "0.0", maximumValue: "16.0", comment: "Setpoint" }),
    Object.assign(new HmiRecipeParameter(), { name: "Temperature" }));
  const record = Object.assign(new HmiRecipeDataSet(), { name: "Record 01" });
  record.values.pressure = "01.500";
  record.values.X0002Y0003 = "24";
  recipe.dataSets.push(record);
  const html = new HmiRecipeToHtmlConverter().convert(recipe);
  for (const value of ["Recipe &lt;A&gt;", "Engineering &amp; data", "<td>7</td>", "PLC.Pressure", "Real", "bar", "0.0",
    "16.0", "Setpoint", "Record 01", "01.500", "X0002Y0003"]) assert.ok(html.includes(value), value);
  assert.ok(html.includes('<th scope="col">Pressure</th><th scope="col">Temperature</th><th scope="col">X0002Y0003</th>'));
  assert.ok(html.includes('<td data-value-state="present">01.500</td><td data-value-state="missing">Missing</td><td data-value-state="present">24</td>'));
});

test("Recipe HTML distinguishes empty, null, missing and escapes record content", () => {
  const recipe = new HmiRecipe();
  for (const name of ["Empty", "Null", "Missing", "Markup"]) recipe.parameters.push(Object.assign(new HmiRecipeParameter(), { name }));
  const record = Object.assign(new HmiRecipeDataSet(), { name: "<script>record</script>" });
  record.values.Empty = "";
  record.values.Null = undefined;
  record.values.Markup = "<script>alert('x')</script> & ü";
  recipe.dataSets.push(record);
  const html = new HmiRecipeToHtmlConverter().convert(recipe);
  assert.ok(html.includes('<td data-value-state="present"></td><td data-value-state="null">Null</td><td data-value-state="missing">Missing</td>'));
  assert.ok(html.includes("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; &#252;"));
  assert.ok(!html.includes("<script>"));
});

test("Empty recipe definition does not invent records", () => {
  const html = new HmiRecipeToHtmlConverter().convert(new HmiRecipe());
  assert.ok(html.includes("<h1>Recipe</h1>"));
  assert.ok(html.includes("No stored records."));
  assert.ok(!html.includes('data-value-state="'));
});

test("Distinct Unicode field names and supplementary text survive", () => {
  const recipe = new HmiRecipe();
  const record = new HmiRecipeDataSet();
  for (const name of ["ß", "SS", "ı", "I", "ſ", "S"]) {
    recipe.parameters.push(Object.assign(new HmiRecipeParameter(), { name }));
    record.values[name] = "😀";
  }
  recipe.dataSets.push(record);
  const html = new HmiRecipeToHtmlConverter().convert(recipe);
  assert.equal(html.split('<td data-value-state="present">&#128512;</td>').length - 1, 6);
});
