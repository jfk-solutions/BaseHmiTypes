import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiButton,HmiState,HmiButtonType,HmiDisabledImageMode,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,hmiColorFromArgb,staticProperty,tagProperty} from '../dist/index.js';
for(const enabled of [false,true])for(const pressed of [false,true])for(const state of [0,1,2])for(const replacement of [false,true])for(const keyEnabled of [false,true])for(const mode of [HmiButtonType.GraphicOrText,HmiButtonType.GraphicAndText,HmiButtonType.Text,HmiButtonType.Graphic])for(const tagged of [false,true]){
 test(`HTML button image color keys (${enabled}, ${pressed}, ${state}, ${replacement}, ${keyEnabled}, ${mode}, ${tagged})`,async()=>{
  const flag=()=>tagged?tagProperty('Picture.KeyEnabled',keyEnabled):staticProperty(keyEnabled),color=n=>tagged?tagProperty('Picture.Key',hmiColorFromArgb(255,n,n+1,n+2)):staticProperty(hmiColorFromArgb(255,n,n+1,n+2)),image=uri=>({uri,kind:HmiImageSourceKind.Uri});
  const b=Object.assign(new HmiButton(),{name:'Key',width:staticProperty(160),height:staticProperty(100),enabled:staticProperty(enabled),pressed:staticProperty(pressed),mode:staticProperty(mode),text:staticProperty(HmiMultilingualText.fromText('Start')),image:staticProperty(image('up.svg')),alternateImage:staticProperty(image('down.svg')),imageBackgroundTransparent:flag(),imageBackgroundColor:color(1),alternateImageBackgroundTransparent:flag(),alternateImageBackgroundColor:color(4),disabledImageBackgroundTransparent:flag(),disabledImageBackgroundColor:color(7),showDisabledState:staticProperty(true),disabledImageMode:staticProperty(HmiDisabledImageMode.Reference)});
  if(replacement)b.disabledImage=staticProperty(image('disabled.svg'));
  if(state!==0)b.states.push(Object.assign(new HmiState(),{value:0,image:image('state.svg'),imageBackgroundTransparent:state===1,imageBackgroundColor:hmiColorFromArgb(255,10,11,12)}));
  const s=new HmiScreen(),l=new HmiLayer();l.items.push(b);s.layers.push(l);const html=(await new HmiScreenToHtmlConverter().convertAsync(s)).match(/<button id="Key"[^>]*>.*?<\/button>/u)?.[0]??'';
  const disabled=!enabled&&replacement,source=disabled?'disabled.svg':state!==0?'state.svg':pressed?'down.svg':'up.svg',hasKey=mode!==HmiButtonType.Text&&(disabled?keyEnabled:state!==0?state===1:keyEnabled),n=disabled?7:state!==0?10:pressed?4:1;
  assert.equal(html.includes('data-hmi-image-color-key='),hasKey);if(hasKey)assert.ok(html.includes(`data-hmi-image-color-key="${n},${n+1},${n+2}"`));if(mode!==HmiButtonType.Text)assert.ok(html.includes(`src="${source}"`));
 });
}
