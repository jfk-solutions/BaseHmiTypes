import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiButton,HmiButtonType,HmiDisabledImageMode,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,staticProperty,tagProperty} from '../dist/index.js';
for(const enabled of [false,true])for(const pressed of [false,true])for(const fallback of [0,1,2])for(const replacement of [false,true])for(const mode of [HmiButtonType.GraphicOrText,HmiButtonType.GraphicAndText,HmiButtonType.Text,HmiButtonType.Graphic])for(const tagged of [false,true]){
 test(`HTML disabled picture fallback policy (${enabled}, ${pressed}, ${fallback}, ${replacement}, ${mode}, ${tagged})`,async()=>{
  const image=uri=>staticProperty({uri,kind:HmiImageSourceKind.Uri});
  const b=Object.assign(new HmiButton(),{name:'Disabled',width:staticProperty(160),height:staticProperty(100),enabled:staticProperty(enabled),pressed:staticProperty(pressed),mode:staticProperty(mode),text:staticProperty(HmiMultilingualText.fromText('Start')),image:image('up.svg'),alternateImage:image('down.svg'),showDisabledState:staticProperty(true),disabledImageMode:staticProperty(HmiDisabledImageMode.Reference)});
  if(replacement)b.disabledImage=image('disabled.svg');
  if(fallback!==0)b.disabledImageFallbackToNormal=tagged?tagProperty('Button.Fallback',fallback===1):staticProperty(fallback===1);
  const s=new HmiScreen(),l=new HmiLayer();l.items.push(b);s.layers.push(l);
  const html=(await new HmiScreenToHtmlConverter().convertAsync(s)).match(/<button id="Disabled"[^>]*>.*?<\/button>/u)?.[0]??'';
  const expected=mode===HmiButtonType.Text?undefined:!enabled&&replacement?'disabled.svg':!enabled&&fallback===2?undefined:pressed?'down.svg':'up.svg';
  const rendered=html.match(/<img[^>]*src="([^"]+)"/u);
  assert.equal(Boolean(rendered),expected!==undefined);if(expected!==undefined)assert.equal(rendered[1],expected);
  assert.equal(html.includes('data-hmi-button-image-fallback'),mode===HmiButtonType.GraphicOrText&&expected!==undefined);
 });
}
