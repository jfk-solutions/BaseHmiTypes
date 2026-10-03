import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonShape,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,staticProperty,tagProperty,hmiColorFromArgb} from "../dist/index.js";
async function convert(button){const layer=new HmiLayer();layer.items.push(button);const screen=new HmiScreen();screen.layers.push(layer);return new HmiScreenToHtmlConverter().convertAsync(screen);}
for(const shape of [HmiButtonShape.Rectangle,HmiButtonShape.Ellipse])for(const tagged of [false,true])for(const beveled of [false,true])for(const enabled of [false,true]){
  test(`HTML preserves button shape (${shape}, ${tagged}, ${beveled}, ${enabled})`,async()=>{
    const button=new HmiButton();Object.assign(button,{name:"Shape",x:staticProperty(10),y:staticProperty(20),width:staticProperty(100),height:staticProperty(100),text:staticProperty(HmiMultilingualText.fromText("Start")),enabled:staticProperty(enabled),shape:tagged?tagProperty("Button.Shape",shape):staticProperty(shape)});
    if(beveled){button.threeDBorderWidth=staticProperty(3);button.threeDBorderTopColor=staticProperty(hmiColorFromArgb(255,238,238,238));button.threeDBorderBottomColor=staticProperty(hmiColorFromArgb(255,64,64,64));}
    const html=await convert(button),opening=html.match(/<button id="Shape"[^>]*>/u)?.[0]??"";
    assert.ok(opening.includes(shape===HmiButtonShape.Ellipse?"border-radius: 50%;overflow: hidden;":"border-radius: 0px;"));
    assert.ok(opening.includes("left: 10px;top: 20px;width: 100px;height: 100px;"));assert.equal(opening.includes("disabled="),!enabled);
    if(beveled){assert.ok(opening.includes("border-width: 3px;"));assert.ok(opening.includes("border-color: #EEEEEE #404040 #404040 #EEEEEE;"));}
    assert.ok(html.includes(">Start</button>"));
  });
}
test("Unspecified button shape keeps default appearance",async()=>{assert.equal((await convert(new HmiButton())).match(/<button[^>]*>/u)?.[0].includes("border-radius:"),false);});
test("Unknown button shape keeps default appearance",async()=>{const b=new HmiButton();b.shape=staticProperty(999);assert.equal((await convert(b)).match(/<button[^>]*>/u)?.[0].includes("border-radius:"),false);});
