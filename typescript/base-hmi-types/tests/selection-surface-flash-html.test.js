import assert from "node:assert/strict";
import test from "node:test";
import {HmiCheckBoxGroup,HmiRadioButtonGroup,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,blinkProperty,hmiColorFromArgb,HmiBlinkRate,HmiBlinkCondition} from "../dist/index.js";
const rates=[HmiBlinkRate.Default,HmiBlinkRate.Slow,HmiBlinkRate.Medium,HmiBlinkRate.Fast];
const duration=rate=>rate===HmiBlinkRate.Slow?"2":rate===HmiBlinkRate.Fast?"0.5":"1";
for(const radio of [false,true])for(const flags of [0,1,2,3])for(const rate of rates)for(const conditional of [false,true]){
 test("HTML emits independent surface flash durations ("+[radio,flags,rate,conditional].join(", ")+")",async()=>{
  const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.name="Surface";item.borderWidth=staticProperty(8);
  const next=rates[(rates.indexOf(rate)+1)%4],off=hmiColorFromArgb(255,11,12,13),on=hmiColorFromArgb(255,14,15,16);
  const condition=conditional?HmiBlinkCondition.WhenTrue:HmiBlinkCondition.Always;
  item.foregroundColor=(flags&1)?blinkProperty(off,on,rate,condition,"Surface.Foreground"):staticProperty(off);
  item.backgroundColor=(flags&2)?blinkProperty(off,on,next,condition,"Surface.Background"):staticProperty(off);
  item.borderColor=blinkProperty(off,on,HmiBlinkRate.Medium);
  const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening=html.match(/<hmi-(?:checkbox|radio-button)-group id="Surface"[^>]*>/u)?.[0]??"";
  for(const channel of ["foreground","background"]){
   const enabled=!!(flags&(channel==="foreground"?1:2));assert.equal(opening.includes(channel+"-flash-duration="),enabled);
   if(enabled)assert.ok(opening.includes(channel+'-flash-duration="'+duration(channel==="foreground"?rate:next)+'"'));
  }
  assert.ok(opening.includes('frame-border-flash-duration="1"'));
 });
}
