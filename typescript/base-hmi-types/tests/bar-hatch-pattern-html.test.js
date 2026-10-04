import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiBar,HmiBarFillStyle,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty,tagProperty} from '../dist/index.js';
for(const hatch of [...Array.from({length:53},(_,i)=>i),-1,53,65535])for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])for(const tagged of [false,true]){
 test('Preserves device hatch and color priorities '+[hatch,direction,tagged],async()=>{
  const priority=(hatch+65536)%3;
  const bar=Object.assign(new HmiBar(),{width:staticProperty(100),height:staticProperty(80),beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25),originValue:hatch%2===0?staticProperty(50):undefined,
   fillDirection:staticProperty(direction),fillStyle:staticProperty(HmiBarFillStyle.HatchPattern),hatchStyle:tagged?tagProperty('Hatch.Style',hatch):staticProperty(hatch),
   patternColor:staticProperty(hmiColorFromArgb(128,0,255,0)),fillColor:staticProperty(hmiColorFromArgb(255,128,128,128)),enabled:staticProperty(priority!==2),
   useDisabledForegroundColor:staticProperty(true),disabledForegroundColor:staticProperty(hmiColorFromArgb(255,255,0,0)),useThresholdFillColors:staticProperty(priority===1)});
  bar.thresholds.push({value:staticProperty(50),color:staticProperty(hmiColorFromArgb(255,255,255,0))});
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(bar);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??'';
  assert.ok(fill.includes(`data-hmi-bar-hatch-style="${hatch}"`));assert.ok(!fill.includes('data-hmi-bar-bitmap='));
  assert.ok(fill.includes(hatch<0||hatch>52?'color: transparent !important;':`color: ${priority===2?'#FF0000':priority===1?'#FFFF00':'#808080'} !important;`));assert.ok(html.includes('value="25"'));
 });
}
