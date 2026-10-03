import assert from "node:assert/strict";
import test from "node:test";
import {HmiCheckBoxGroup,HmiRadioButtonGroup,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";
for (const radio of [false,true]) for (const mask of [0,1,5,2147483648,4294967295]) for (const tagged of [false,true]) {
  test("HTML emits check/radio selection masks ("+[radio,mask,tagged].join(", ")+")", async()=>{
    const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.name="Masked";item.selectedIndex=staticProperty(2);
    item.items.push({text:"One"});item.selectedFields=tagged?tagProperty("Boxes.Process",mask):staticProperty(mask);
    const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
    const opening=html.match(/<hmi-(?:checkbox|radio-button)-group id="Masked"[^>]*>/u)?.[0]??"";assert.ok(opening);
    assert.ok(opening.includes('selected-fields="'+mask+'"'));assert.ok(opening.includes('selected-index="2"'));
    assert.ok(html.includes('text="One"'));
  });
}
