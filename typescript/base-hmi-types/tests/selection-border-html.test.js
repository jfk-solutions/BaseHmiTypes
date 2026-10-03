import assert from "node:assert/strict";
import test from "node:test";
import {HmiCheckBoxGroup,HmiRadioButtonGroup,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty,hmiColorFromArgb} from "../dist/index.js";

for(const radio of [false,true])for(const inside of [false,true])for(const tagged of [false,true])for(const width of [1,10]){
  test("HTML emits selection border placement ("+[radio,inside,tagged,width].join(", ")+")",async()=>{
    const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();
    item.name="Framed";item.borderWidth=staticProperty(width);item.borderColor=staticProperty(hmiColorFromArgb(255,255,0,0));
    item.drawStrokeInsideFrame=tagged?tagProperty("Box.Inside",inside):staticProperty(inside);
    item.items.push({text:"Choice"});
    const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
    const opening=html.match(/<hmi-(?:checkbox|radio-button)-group id="Framed"[^>]*>/u)?.[0]??"";
    assert.ok(opening.includes('draw-stroke-inside-frame="'+inside+'"'));
    assert.ok(opening.includes("border-width: "+width+"px;"));assert.equal(opening.includes("outline-width:"),false);
  });
}
for(const radio of [false,true]){
  test("HTML omits unspecified selection border placement ("+radio+")",async()=>{
    const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.name="Framed";item.borderWidth=staticProperty(10);
    const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
    const opening=html.match(/<hmi-(?:checkbox|radio-button)-group id="Framed"[^>]*>/u)?.[0]??"";
    assert.equal(opening.includes("draw-stroke-inside-frame"),false);
  });
}
