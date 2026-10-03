import assert from "node:assert/strict";
import test from "node:test";
import {HmiCheckBoxGroup,HmiRadioButtonGroup,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiFillPattern,HmiGradientDirection,HmiBlinkRate,staticProperty,tagProperty,blinkProperty,hmiColorFromArgb} from "../dist/index.js";

const create=radio=>{const item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.name="Filled";return item;};
async function opening(item){const layer=new HmiLayer();layer.items.push(item);const screen=new HmiScreen();screen.layers.push(layer);return (await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<hmi-(?:checkbox|radio-button)-group id="Filled"[^>]*>/u)?.[0]??"";}
for(const radio of [false,true])for(const pattern of [HmiFillPattern.Transparent,HmiFillPattern.Solid,HmiFillPattern.Horizontal,HmiFillPattern.Checkers,HmiFillPattern.DiagonalCross])for(const tagged of [false,true]){
  test("HTML emits selection surface color and pattern ("+[radio,pattern,tagged].join(", ")+")",async()=>{
    const item=create(radio),color=hmiColorFromArgb(255,230,240,250);
    item.backgroundColor=tagged?tagProperty("Box.Background",color):staticProperty(color);
    item.fillPattern=tagged?tagProperty("Box.Pattern",pattern):staticProperty(pattern);item.patternColor=staticProperty(hmiColorFromArgb(255,128,64,0));
    const html=await opening(item);assert.ok(html.includes('surface-background-color="'+(pattern===HmiFillPattern.Transparent?"transparent":"#E6F0FA")+'"'));
    if(pattern!==HmiFillPattern.Transparent&&pattern!==HmiFillPattern.Solid){assert.ok(html.includes("background-image:"));assert.ok(html.includes("#804000"));assert.ok(html.includes("background-size: 8px 8px;"));}
  });
}
for(const radio of [false,true])for(const vertical of [false,true]){
  test("HTML keeps configured selection surface gradient ("+[radio,vertical].join(", ")+")",async()=>{
    const item=create(radio);item.backgroundColor=staticProperty(hmiColorFromArgb(255,0,0,255));item.useFirstGradient=staticProperty(true);item.firstGradientColor=staticProperty(hmiColorFromArgb(255,255,0,0));
    item.gradientDirection=staticProperty(vertical?HmiGradientDirection.VerticalFromTop:HmiGradientDirection.HorizontalFromLeft);
    const html=await opening(item);assert.ok(html.includes('surface-background-color="#0000FF"'));assert.ok(html.includes("background-image: linear-gradient("+(vertical?"to bottom":"to right")));
  });
}
for(const radio of [false,true])for(const tagged of [false,true]){
  test("HTML keeps alpha-zero selection surface ("+[radio,tagged].join(", ")+")",async()=>{
    const item=create(radio),color=hmiColorFromArgb(0,230,240,250);item.backgroundColor=tagged?tagProperty("Box.Background",color):staticProperty(color);
    assert.ok((await opening(item)).includes('surface-background-color="rgba(230,240,250,0)"'));
  });
}
for(const radio of [false,true]){
  test("HTML keeps selection surface blink fallback ("+radio+")",async()=>{
    const item=create(radio);item.backgroundColor=blinkProperty(hmiColorFromArgb(255,255,0,0),hmiColorFromArgb(255,0,0,255),HmiBlinkRate.Medium);
    const html=await opening(item);assert.ok(html.includes('surface-background-color="#FF0000"'));assert.ok(html.includes('background-flash-duration="1"'));
  });
  test("HTML omits unspecified selection surface color ("+radio+")",async()=>{assert.equal((await opening(create(radio))).includes("surface-background-color"),false);});
}
