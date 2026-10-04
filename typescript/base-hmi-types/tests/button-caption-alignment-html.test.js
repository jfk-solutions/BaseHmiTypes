import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonType,HmiButtonShape,HmiHorizontalAlignment,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,hmiColorFromArgb,staticProperty,tagProperty,blinkProperty} from "../dist/index.js";
for(const alignment of [HmiHorizontalAlignment.Left,HmiHorizontalAlignment.Center,HmiHorizontalAlignment.Right])for(const round of [false,true])for(const tagged of [false,true])for(const blink of [false,true]){
  test(`HTML image caption uses available width (${alignment}, ${round}, ${tagged}, ${blink})`,async()=>{
    const button=new HmiButton();Object.assign(button,{name:"Aligned",width:staticProperty(160),height:staticProperty(160),shape:staticProperty(round?HmiButtonShape.Ellipse:HmiButtonShape.Rectangle),mode:staticProperty(HmiButtonType.GraphicAndText),text:staticProperty(HmiMultilingualText.fromText("Start")),image:staticProperty({uri:"picture.svg",kind:HmiImageSourceKind.Uri}),horizontalAlignment:tagged?tagProperty("Button.Alignment",alignment):staticProperty(alignment)});
    if(blink)button.captionColor=blinkProperty(hmiColorFromArgb(255,0,0,0),hmiColorFromArgb(255,255,0,0));
    const screen=new HmiScreen(),layer=new HmiLayer();layer.items.push(button);screen.layers.push(layer);
    const content=(await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<button id="Aligned"[^>]*>.*?<\/button>/u)?.[0]??"";
    assert.ok(content.includes(`text-align: ${alignment.toLowerCase()};`));assert.ok(content.includes('data-hmi-button-caption style="flex: 0 0 auto;width: 100%;max-width: 100%;'));assert.ok(content.includes("Start</span>"));assert.equal(content.includes("animation: hmi-caption-color-flash"),blink);
  });
}
