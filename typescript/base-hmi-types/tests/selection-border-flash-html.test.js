import assert from "node:assert/strict";
import test from "node:test";
import {HmiCheckBoxGroup,HmiRadioButtonGroup,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,blinkProperty,hmiColorFromArgb,HmiBlinkRate,HmiBlinkCondition} from "../dist/index.js";
for(const radio of [false,true])for(const inside of [false,true])for(const rate of [HmiBlinkRate.Default,HmiBlinkRate.Slow,HmiBlinkRate.Medium,HmiBlinkRate.Fast])for(const conditional of [false,true]){
  test("HTML emits panel border flash timing ("+[radio,inside,rate,conditional].join(", ")+")",async()=>{
    const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.name="Flash";item.borderWidth=staticProperty(8);item.borderStyle=staticProperty(1);
    item.drawStrokeInsideFrame=staticProperty(inside);
    item.borderColor=blinkProperty(hmiColorFromArgb(255,11,12,13),hmiColorFromArgb(255,14,15,16),rate,
      conditional?HmiBlinkCondition.WhenTrue:HmiBlinkCondition.Always,conditional?"Box.Flash":undefined);
    const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
    const opening=html.match(/<hmi-(?:checkbox|radio-button)-group id="Flash"[^>]*>/u)?.[0]??"";
    const duration=rate===HmiBlinkRate.Slow?"2":rate===HmiBlinkRate.Fast?"0.5":"1";
    assert.ok(opening.includes('frame-border-flash-duration="'+duration+'"'));
    assert.ok(opening.includes("--hmi-border-color-off: #0B0C0D;"));assert.ok(opening.includes("--hmi-border-color-on: #0E0F10;"));
    assert.ok(opening.includes('frame-border-style="dashed"'));
  });
}
for(const radio of [false,true])for(const inside of [false,true]){
  test("Background flash does not enable panel border flash ("+[radio,inside].join(", ")+")",async()=>{
    const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.name="Flash";item.borderWidth=staticProperty(8);
    item.borderColor=staticProperty(hmiColorFromArgb(255,11,12,13));item.drawStrokeInsideFrame=staticProperty(inside);
    item.backgroundColor=blinkProperty(hmiColorFromArgb(255,21,22,23),hmiColorFromArgb(255,24,25,26));
    const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
    const opening=html.match(/<hmi-(?:checkbox|radio-button)-group id="Flash"[^>]*>/u)?.[0]??"";
    assert.equal(opening.includes("frame-border-flash-duration"),false);assert.ok(opening.includes("hmi-background-color-flash"));
  });
}
