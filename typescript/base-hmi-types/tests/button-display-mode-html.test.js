import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonType,HmiState,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,HmiImageSourceKind,HmiDisabledImageMode,HmiBlinkRate,staticProperty,tagProperty,blinkProperty,hmiColorFromArgb} from "../dist/index.js";
async function convert(button){const layer=new HmiLayer();layer.items.push(button);const screen=new HmiScreen();screen.layers.push(layer);return new HmiScreenToHtmlConverter().convertAsync(screen);}
for(const mode of [HmiButtonType.GraphicOrText,HmiButtonType.GraphicAndText,HmiButtonType.Text,HmiButtonType.Graphic])for(const image of [false,true])for(const tagged of [false,true])for(const state of [false,true]){
  test(`HTML selects button content (${mode}, ${image}, ${tagged}, ${state})`,async()=>{
    const button=new HmiButton();button.name="Mode";button.text=staticProperty(HmiMultilingualText.fromText("Base"));button.mode=tagged?tagProperty("Button.Mode",mode):staticProperty(mode);
    if(image)button.image=staticProperty({uri:"base.svg",kind:HmiImageSourceKind.Uri});
    if(state){const s=new HmiState();s.value=0;s.text=HmiMultilingualText.fromText("State");if(image)s.image={uri:"state.svg",kind:HmiImageSourceKind.Uri};button.states.push(s);}
    const html=await convert(button),opening=html.match(/<button id="Mode"[^>]*>/u)?.[0]??"",content=html.match(/<button id="Mode"[^>]*>(.*?)<\/button>/u)?.[1]??"",hasImage=image&&mode!==HmiButtonType.Text;
    assert.equal(content.includes("<img"),hasImage);assert.equal(content.includes(state?"State":"Base"),mode!==HmiButtonType.Graphic);
    if(hasImage){assert.ok(content.includes(state?"state.svg":"base.svg"));assert.ok(content.includes("data-hmi-button-content"));assert.ok(content.includes("min-height: 0;"));}
    assert.equal(opening.includes("data-hmi-button-image-fallback"),hasImage&&mode===HmiButtonType.GraphicOrText);assert.equal(content.includes("data-hmi-button-caption hidden"),hasImage&&mode===HmiButtonType.GraphicOrText);
    assert.ok(opening.includes('aria-label="'+(state?"State":"Base")+'"'));
  });
}
for(const state of [false,true])for(const replacement of [false,true]){
  test(`HTML preserves disabled combined button (${state}, ${replacement})`,async()=>{
    const b=new HmiButton();Object.assign(b,{name:"Mode",enabled:staticProperty(false),showDisabledState:staticProperty(true),mode:staticProperty(HmiButtonType.GraphicAndText),text:staticProperty(HmiMultilingualText.fromText("Base")),image:staticProperty({uri:"base.svg",kind:HmiImageSourceKind.Uri}),disabledImageMode:staticProperty(replacement?HmiDisabledImageMode.Reference:HmiDisabledImageMode.Grayscale),disabledImage:staticProperty({uri:"disabled.svg",kind:HmiImageSourceKind.Uri}),captionColor:blinkProperty(hmiColorFromArgb(255,255,0,0),hmiColorFromArgb(255,0,0,255),HmiBlinkRate.Medium)});
    if(state){const s=new HmiState();s.value=0;s.text=HmiMultilingualText.fromText("State");s.image={uri:"state.svg",kind:HmiImageSourceKind.Uri};b.states.push(s);}
    const content=(await convert(b)).match(/<button id="Mode"[^>]*>(.*?)<\/button>/u)?.[1]??"";
    assert.ok(content.includes(replacement?"disabled.svg":state?"state.svg":"base.svg"));assert.equal(content.includes("filter: grayscale(1)"),!replacement);assert.ok(content.includes("animation: hmi-caption-color-flash 1s"));assert.ok(content.includes(state?"State":"Base"));
  });
}
