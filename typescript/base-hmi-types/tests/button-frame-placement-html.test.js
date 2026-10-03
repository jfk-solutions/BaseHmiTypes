import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonShape,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,hmiColorFromArgb,staticProperty,tagProperty} from "../dist/index.js";

for(const round of [false,true])for(const inside of [undefined,false,true])for(const width of [0,1,2,10])for(const bevel of [false,true])for(const tagged of [false,true]){
  test(`HTML renders independent button frame and bevel (${round}, ${inside}, ${width}, ${bevel}, ${tagged})`,async()=>{
    const button=new HmiButton();Object.assign(button,{
      name:"Framed",width:staticProperty(100),height:staticProperty(100),text:staticProperty(HmiMultilingualText.fromText("Start")),
      shape:staticProperty(round?HmiButtonShape.Ellipse:HmiButtonShape.Rectangle),borderWidth:staticProperty(width),borderColor:staticProperty(hmiColorFromArgb(255,0,0,0)),
      drawStrokeInsideFrame:inside===undefined?undefined:tagged?tagProperty("Button.Inside",inside):staticProperty(inside),
      threeDBorderWidth:staticProperty(bevel?3:0),threeDBorderTopColor:staticProperty(hmiColorFromArgb(255,238,238,238)),threeDBorderBottomColor:staticProperty(hmiColorFromArgb(255,64,64,64))
    });
    const screen=new HmiScreen(),layer=new HmiLayer();layer.items.push(button);screen.layers.push(layer);
    const opening=(await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<button id="Framed"[^>]*>/u)?.[0]??"",centered=inside===false&&width>1;
    assert.equal(opening.includes("outline-style: solid;"),centered);assert.ok(opening.includes(`border-width: ${centered?0:width}px;`));
    if(centered)assert.ok(opening.includes(`outline-offset: -${width/2}px;`));assert.equal(opening.includes("box-shadow: inset 3px"),bevel);
    if(bevel){assert.ok(opening.includes("padding: 5px 9px 5px 9px;"));assert.ok(opening.includes("inset -3px 0 0 #404040"));assert.ok(!opening.includes("border-width: 3px;"));}
  });
}
