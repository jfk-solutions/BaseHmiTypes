import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiBar,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty,tagProperty} from '../dist/index.js';
for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])for(const origin of [false,true])for(const scale of [false,true])for(let kind=0;kind<3;kind++)for(let priority=0;priority<3;priority++){
 test('Keeps independent fill and color priorities '+[direction,origin,scale,kind,priority],async()=>{
  const green=hmiColorFromArgb(255,0,255,0),red=hmiColorFromArgb(255,255,0,0),blue=hmiColorFromArgb(255,0,0,255);
  const bar=Object.assign(new HmiBar(),{beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25),fillDirection:staticProperty(direction),showScale:staticProperty(scale),originValue:origin?staticProperty(50):undefined,
   foregroundColor:staticProperty(blue),trackColor:staticProperty(hmiColorFromArgb(255,128,128,128)),fillColor:kind===0?undefined:kind===1?staticProperty(green):tagProperty('Fill.Color',green),enabled:staticProperty(priority!==2),useDisabledForegroundColor:staticProperty(true),disabledForegroundColor:staticProperty(red),useThresholdFillColors:staticProperty(priority!==0)});
  bar.thresholds.push({value:staticProperty(50),color:staticProperty(hmiColorFromArgb(255,255,255,0))});const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),fill=origin?html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]:[...html.matchAll(/<meter[^>]*>/gu)].at(-1)?.[0],expected=priority===2?'#FF0000':priority===1?'#FFFF00':'#00FF00';
  assert.equal(fill.includes(`color: ${expected} !important;`),kind!==0);assert.ok(html.includes('--hmi-bar-track-background: #808080 !important;'));assert.deepEqual(bar.foregroundColor.staticValue,blue);
 });
}
