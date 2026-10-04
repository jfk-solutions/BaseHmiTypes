import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiBar,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty,tagProperty} from '../dist/index.js';
for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])for(const origin of [false,true])for(const scale of [false,true])for(let kind=0;kind<3;kind++){
 test('Separates track from widget background '+[direction,origin,scale,kind],async()=>{
  const blue=hmiColorFromArgb(255,0,0,255),gray=hmiColorFromArgb(255,128,128,128);
  const bar=Object.assign(new HmiBar(),{beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25),fillDirection:staticProperty(direction),showScale:staticProperty(scale),
   originValue:origin?staticProperty(50):undefined,backgroundColor:staticProperty(blue),foregroundColor:staticProperty(hmiColorFromArgb(255,0,255,0)),trackColor:kind===0?undefined:kind===1?staticProperty(gray):tagProperty('Track.Color',gray)});
  const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(html.includes('background-color: #0000FF;'));if(!origin)assert.ok(html.includes('data-hmi-bar-track="true"'));else assert.ok(html.includes('background: var(--hmi-bar-track-background, #eeeeee);'));
  assert.ok(html.includes('--hmi-bar-track-background: #0000FF;'));assert.equal(html.includes('--hmi-bar-track-background: #808080 !important;'),kind!==0);if(kind!==0)assert.deepEqual(bar.trackColor.staticValue,gray);
 });
}
