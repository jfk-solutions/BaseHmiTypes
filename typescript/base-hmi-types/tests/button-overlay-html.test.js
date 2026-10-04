import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonType,HmiHorizontalAlignment,HmiVerticalAlignment,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,staticProperty,tagProperty} from "../dist/index.js";
for(const x of [HmiHorizontalAlignment.Left,HmiHorizontalAlignment.Center,HmiHorizontalAlignment.Right])for(const y of [HmiVerticalAlignment.Top,HmiVerticalAlignment.Center,HmiVerticalAlignment.Bottom])for(const mode of [HmiButtonType.GraphicOrText,HmiButtonType.GraphicAndText,HmiButtonType.Text,HmiButtonType.Graphic])for(const tagged of [false,true]){
 test(`HTML independent button overlay (${x}, ${y}, ${mode}, ${tagged})`,async()=>{
  const button=Object.assign(new HmiButton(),{name:"Overlay",width:staticProperty(160),height:staticProperty(100),overlayContent:tagged?tagProperty("Button.Overlay",true):staticProperty(true),mode:staticProperty(mode),horizontalAlignment:staticProperty(x),verticalAlignment:staticProperty(y),text:staticProperty(HmiMultilingualText.fromText("Start")),image:staticProperty({uri:"picture.svg",kind:HmiImageSourceKind.Uri})});
  const screen=new HmiScreen(),layer=new HmiLayer();layer.items.push(button);screen.layers.push(layer);
  const content=(await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<button id="Overlay"[^>]*>.*?<\/button>/u)?.[0]??"";
  assert.equal(content.includes("data-hmi-button-overlay"),mode!==HmiButtonType.Text);assert.equal(content.includes("Start</"),mode!==HmiButtonType.Graphic);
  if(mode===HmiButtonType.GraphicOrText||mode===HmiButtonType.GraphicAndText){assert.ok(content.includes("grid-area: 1 / 1;"));assert.ok(content.includes(`justify-content: ${x===HmiHorizontalAlignment.Left?"flex-start":x===HmiHorizontalAlignment.Right?"flex-end":"center"};align-items: ${y===HmiVerticalAlignment.Top?"flex-start":y===HmiVerticalAlignment.Bottom?"flex-end":"center"};`));assert.equal(content.includes("data-hmi-button-caption hidden"),mode===HmiButtonType.GraphicOrText);}
 });
}
