import assert from "node:assert/strict";
import test from "node:test";
import {HmiCheckBoxGroup,HmiRadioButtonGroup,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";
const styles=[[-1,"none"],[0,"solid"],[1,"dashed"],[2,"dotted"],[3,"dashed"],[4,"dashed"],[5,"solid"],[6,"double"],[7,"groove"],[99,"solid"]];
for(const radio of [false,true])for(const inside of [false,true])for(const tagged of [false,true])for(const [style,css] of styles){
  test("HTML emits frame border style ("+[radio,inside,tagged,style].join(", ")+")",async()=>{
    const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.name="Styled";item.borderWidth=staticProperty(10);
    item.borderStyle=tagged?tagProperty("Box.Style",style):staticProperty(style);item.drawStrokeInsideFrame=staticProperty(inside);
    const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
    const opening=html.match(/<hmi-(?:checkbox|radio-button)-group id="Styled"[^>]*>/u)?.[0]??"";
    assert.ok(opening.includes('frame-border-style="'+css+'"'));assert.equal(opening.includes("border-style:"),false);
    assert.ok(opening.includes("border-width: 10px;"));
  });
}
