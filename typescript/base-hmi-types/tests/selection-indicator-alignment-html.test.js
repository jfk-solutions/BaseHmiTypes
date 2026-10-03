import assert from "node:assert/strict";
import test from "node:test";
import {HmiCheckBoxGroup,HmiRadioButtonGroup,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";

async function opening(item) {
  item.name="Aligned";
  const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
  return html.match(/<hmi-(?:checkbox|radio-button)-group id="Aligned"[^>]*>/u)?.[0]??"";
}
for(const radio of [false,true])for(const right of [false,true])for(const tagged of [false,true]){
  test("HTML emits selection indicator alignment ("+[radio,right,tagged].join(", ")+")",async()=>{
    const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();
    item.indicatorOnRight=tagged?tagProperty("Box.Alignment",right):staticProperty(right);
    assert.ok((await opening(item)).includes('indicator-on-right="'+right+'"'));
  });
}
for(const radio of [false,true]){
  test("HTML omits unspecified selection indicator alignment ("+radio+")",async()=>{
    assert.equal((await opening(radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup())).includes("indicator-on-right"),false);
  });
}
