import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonType,HmiHorizontalAlignment,HmiVerticalAlignment,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,staticProperty,tagProperty} from "../dist/index.js";
const xs=[HmiHorizontalAlignment.Left,HmiHorizontalAlignment.Center,HmiHorizontalAlignment.Right,HmiHorizontalAlignment.Stretch],ys=[HmiVerticalAlignment.Top,HmiVerticalAlignment.Center,HmiVerticalAlignment.Bottom,HmiVerticalAlignment.Stretch];
for(const [xi,x] of xs.entries())for(const [yi,y] of ys.entries())for(const tagged of [false,true]){
  test(`HTML exports independent image axes (${x}, ${y}, ${tagged})`,async()=>{
    const b=new HmiButton();Object.assign(b,{name:"Aligned",image:staticProperty({uri:"picture.svg",kind:HmiImageSourceKind.Uri}),text:staticProperty(HmiMultilingualText.fromText("Start")),mode:staticProperty(HmiButtonType.GraphicAndText),imageHorizontalAlignment:tagged?tagProperty("Button.X",x):staticProperty(x),imageVerticalAlignment:tagged?tagProperty("Button.Y",y):staticProperty(y)});
    const screen=new HmiScreen(),layer=new HmiLayer();layer.items.push(b);screen.layers.push(layer);
    const content=(await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<button id="Aligned"[^>]*>(.*?)<\/button>/u)?.[1]??"",names=["start","center","end","stretch"];
    assert.ok(content.includes('data-image-horizontal="'+names[xi]+'"'));assert.ok(content.includes('data-image-vertical="'+names[yi]+'"'));assert.ok(content.includes("justify-items: "+names[xi]+";align-items: "+names[yi]+";"));assert.ok(content.includes("picture.svg"));assert.ok(content.includes("Start"));
  });
}
