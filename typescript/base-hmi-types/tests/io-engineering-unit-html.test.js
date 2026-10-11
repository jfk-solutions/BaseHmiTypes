import assert from "node:assert/strict";
import test from "node:test";
import {HmiScreen,HmiLayer,HmiIOField,HmiMultilingualText,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";
function setup() {
  const field = new HmiIOField(); Object.assign(field, { name:"ValueField", x:staticProperty(10),y:staticProperty(20),width:staticProperty(200),height:staticProperty(30),text:staticProperty(HmiMultilingualText.fromText("12.5")),readOnly:staticProperty(true),maskInput:staticProperty(true),fieldLength:staticProperty(6),enabled:staticProperty(false),tabIndex:staticProperty(7),hotKey:staticProperty("F2"),focusWidth:staticProperty(2) });
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(field);return {screen,field};
}
for(const cultureLcid of [undefined,1031,1036]) test(`unit caption uses culture and keeps input identity: ${cultureLcid}`,async()=>{
  const {screen,field}=setup(),unit=HmiMultilingualText.fromText("kg <&>");unit.texts.set(1031,"Einheit <&>");unit.formattedTexts.set(1031,"<script>formatted unit</script>");field.engineeringUnitText=tagProperty("UnitTag",unit);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen,undefined,cultureLcid===undefined?undefined:{cultureLcid}),input=html.match(/<input\b[^>]*>/)[0];
  assert.equal([...html.matchAll(/id="ValueField"/g)].length,1);assert.equal([...html.matchAll(/tabindex="7"/g)].length,1);
  for(const attribute of ['id="ValueField"','value="12.5"','type="password"','readonly="readonly"','disabled="disabled"','maxlength="6"','data-engineering-unit-tag="UnitTag"','data-hmi-focus-appearance="true"'])assert.ok(input.includes(attribute),attribute);
  const caption=html.match(/<span data-hmi-engineering-unit[^>]*>(.*?)<\/span>/)[1];assert.equal(caption,cultureLcid===1031?"Einheit &lt;&amp;&gt;":"kg &lt;&amp;&gt;");
  assert.ok(html.includes("left: 10px;top: 20px;width: 200px;height: 30px;"));assert.ok(!html.includes("formatted unit"));assert.equal(field.text.staticValue.getDefaultText(),"12.5");
});
test("empty and unavailable unit keep input layout",async()=>{
  const {screen,field}=setup(),renderer=new HmiScreenToHtmlConverter(),baseline=(await renderer.convertAsync(screen)).match(/<input\b[^>]*>/)[0];
  field.engineeringUnitText=staticProperty(HmiMultilingualText.fromText(""));let html=await renderer.convertAsync(screen),input=html.match(/<input\b[^>]*>/)[0];
  assert.equal(input.replace(' data-engineering-unit=""',""),baseline);assert.ok(!html.includes("data-hmi-io-field-unit-container"));
  field.engineeringUnitText=tagProperty("UnitTag");html=await renderer.convertAsync(screen);assert.ok(!html.includes("data-hmi-io-field-unit-container"));assert.ok(html.includes('data-engineering-unit-tag="UnitTag"'));
});
test("explicit empty translation keeps unit absent for that culture",async()=>{
  const {screen,field}=setup(),unit=HmiMultilingualText.fromText("kg");unit.texts.set(1031,"");field.engineeringUnitText=staticProperty(unit);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen,undefined,{cultureLcid:1031});assert.ok(!html.includes("data-hmi-io-field-unit-container"));assert.ok(html.includes('data-engineering-unit=""'));
});
