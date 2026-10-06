import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe, HmiRecipeDataSet, HmiRecipeBinaryValue, HmiRecipeBinaryArray, HmiRecipeToHtmlConverter } from "../dist/index.js";

test("Binary values keep scalar, array, empty, null and unavailable states", () => {
  const recipe = new HmiRecipe(); recipe.name = "Recipe"; const record = new HmiRecipeDataSet(); record.name = "Record <A>"; record.sourceNumber = 0; recipe.dataSets.push(record);
  record.sourceBinaryValues.set("Key<&>", Object.assign(new HmiRecipeBinaryValue(), { sourceType: "CoreBlob", sourceBlobType: 1, sourceDeclaredLength: "6", decodedByteLength: 6, payloadBase64: "AP+APCYA" }));
  record.sourceBinaryValues.set("key<&>", Object.assign(new HmiRecipeBinaryValue(), { sourceType: "<unknown>", sourceBlobType: 37, sourceDeclaredLength: "9223372036854775807" }));
  const array = new HmiRecipeBinaryArray(); array.sourceElementType = "CoreBlob"; array.values.push(undefined, Object.assign(new HmiRecipeBinaryValue(), { sourceType: "CoreBlob", sourceBlobType: 0, sourceDeclaredLength: "0", decodedByteLength: 0, payloadBase64: "" })); record.sourceBinaryArrayValues.set("Array", array);
  const empty = new HmiRecipeBinaryArray(); empty.sourceElementType = "CoreXmlBlob"; record.sourceBinaryArrayValues.set("Empty", empty);
  const html = new HmiRecipeToHtmlConverter().convert(recipe);
  for (const value of ["Stored binary values", "Record &lt;A&gt;", "Key&lt;&amp;&gt;", "key&lt;&amp;&gt;", "&lt;unknown&gt;", "9223372036854775807", "AP+APCYA", "Empty payload", "Payload unavailable", "Empty array", 'data-binary-value-state="null"', '<td>Array</td><td>2</td><td>0</td>', '<td>Array</td><td>2</td><td>1</td>', '<td>Empty</td><td>0</td><td></td><td>CoreXmlBlob</td>']) assert.ok(html.includes(value), value);
  assert.ok(!html.includes("<unknown>")); assert.equal(record.sourceBinaryValues.size, 2);
});
