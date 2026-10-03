import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonType,HmiDisabledImageMode,HmiImageSourceKind,HmiState,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,hmiColorFromArgb,staticProperty,tagProperty} from "../dist/index.js";

const image=uri=>({uri,kind:HmiImageSourceKind.Uri});
function createButton(){
  const button=new HmiButton();Object.assign(button,{name:"Pressed",width:staticProperty(100),height:staticProperty(100),mode:staticProperty(HmiButtonType.GraphicAndText),text:staticProperty(HmiMultilingualText.fromText("Up")),image:staticProperty(image("up.svg")),threeDBorderWidth:staticProperty(3),threeDBorderTopColor:staticProperty(hmiColorFromArgb(255,238,238,238)),threeDBorderBottomColor:staticProperty(hmiColorFromArgb(255,64,64,64))});return button;
}
async function convert(button){const screen=new HmiScreen(),layer=new HmiLayer();layer.items.push(button);screen.layers.push(layer);return(await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<button id="Pressed"[^>]*>.*?<\/button>/u)?.[0]??"";}
for(const pressed of [false,true])for(const toggle of [false,true])for(const same of [false,true])for(const alternate of [false,true])for(const tagged of [false,true]){
  test(`HTML renders pressed snapshot (${pressed}, ${toggle}, ${same}, ${alternate}, ${tagged})`,async()=>{
    const button=createButton();button.pressed=tagged?tagProperty("Button.Pressed",pressed):staticProperty(pressed);button.toggle=tagged?tagProperty("Button.Toggle",toggle):staticProperty(toggle);button.downStateSameAsUp=staticProperty(same);
    if(alternate){button.alternateImage=staticProperty(image("down.svg"));button.alternateText=staticProperty(HmiMultilingualText.fromText("Down"));}
    const content=await convert(button),down=pressed&&!same;
    assert.equal(content.includes("aria-pressed="),toggle);if(toggle)assert.ok(content.includes(`aria-pressed="${pressed}"`));
    assert.ok(content.includes(down&&alternate?"down.svg":"up.svg"));assert.ok(content.includes(`aria-label="${down&&alternate?"Down":"Up"}"`));assert.ok(content.includes("box-shadow: inset 3px 0 0 "+(down?"#404040":"#EEEEEE")));
  });
}
for(const disabled of [false,true])test(`HTML keeps state and disabled image precedence (${disabled})`,async()=>{
  const button=createButton();button.pressed=staticProperty(true);button.toggle=staticProperty(true);button.alternateImage=staticProperty(image("down.svg"));button.alternateText=staticProperty(HmiMultilingualText.fromText("Down"));button.state=staticProperty(5);
  button.states.push(Object.assign(new HmiState(),{value:5,text:HmiMultilingualText.fromText("State"),image:image("state.svg")}));button.enabled=staticProperty(!disabled);button.showDisabledState=staticProperty(true);button.disabledImageMode=staticProperty(HmiDisabledImageMode.Reference);button.disabledImage=staticProperty(image("disabled.svg"));
  const content=await convert(button);assert.ok(content.includes('aria-label="State"'));assert.ok(content.includes(disabled?"disabled.svg":"state.svg"));assert.ok(!content.includes("down.svg"));
});
