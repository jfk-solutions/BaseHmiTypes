import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiButton,HmiButtonType,HmiHorizontalAlignment,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,staticProperty,tagProperty} from '../dist/index.js';
for(const text of [HmiHorizontalAlignment.Left,HmiHorizontalAlignment.Center,HmiHorizontalAlignment.Right])for(const image of [HmiHorizontalAlignment.Left,HmiHorizontalAlignment.Center,HmiHorizontalAlignment.Right,HmiHorizontalAlignment.Stretch])for(const mode of [HmiButtonType.GraphicOrText,HmiButtonType.GraphicAndText,HmiButtonType.Text,HmiButtonType.Graphic])for(const tagged of [false,true]){
 test(`HTML reserves image extent only for matching edge alignments (${text}, ${image}, ${mode}, ${tagged})`,async()=>{
  const b=Object.assign(new HmiButton(),{name:'Layout',width:staticProperty(160),height:staticProperty(100),overlayContent:staticProperty(true),avoidImageCaptionOverlap:tagged?tagProperty('Button.AvoidOverlap',true):staticProperty(true),horizontalAlignment:staticProperty(text),imageHorizontalAlignment:staticProperty(image),mode:staticProperty(mode),text:staticProperty(HmiMultilingualText.fromText('Start')),image:staticProperty({uri:'picture.svg',kind:HmiImageSourceKind.Uri})});
  const s=new HmiScreen(),l=new HmiLayer();l.items.push(b);s.layers.push(l);
  const html=(await new HmiScreenToHtmlConverter().convertAsync(s)).match(/<button id="Layout"[^>]*>.*?<\/button>/u)?.[0]??'';
  const reserve=text===image&&text!==HmiHorizontalAlignment.Center&&(mode===HmiButtonType.GraphicOrText||mode===HmiButtonType.GraphicAndText);
  assert.equal(html.includes('data-hmi-button-caption-avoid-image'),reserve);if(reserve)assert.ok(html.includes(`data-hmi-button-caption-avoid-image="${text===HmiHorizontalAlignment.Left?'start':'end'}"`));
 });
}
