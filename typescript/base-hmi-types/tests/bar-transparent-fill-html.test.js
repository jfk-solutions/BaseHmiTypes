import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiBar,HmiBarFillStyle,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty} from '../dist/index.js';
for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])for(const origin of [false,true])for(const scale of [false,true])for(const transparent of [false,true])for(let priority=0;priority<3;priority++){
 test('Transparency does not erase meter or other regions '+[direction,origin,scale,transparent,priority],async()=>{
  const bar=Object.assign(new HmiBar(),{beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25),fillDirection:staticProperty(direction),showScale:staticProperty(scale),originValue:origin?staticProperty(50):undefined,fillStyle:staticProperty(transparent?HmiBarFillStyle.Transparent:HmiBarFillStyle.Solid),
   foregroundColor:staticProperty(hmiColorFromArgb(255,0,255,0)),trackColor:staticProperty(hmiColorFromArgb(255,128,128,128)),enabled:staticProperty(priority!==2),useDisabledForegroundColor:staticProperty(true),disabledForegroundColor:staticProperty(hmiColorFromArgb(255,255,0,0)),useThresholdFillColors:staticProperty(priority!==0)});
  bar.thresholds.push({value:staticProperty(50),color:staticProperty(hmiColorFromArgb(255,255,255,0))});const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),fill=origin?html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]:[...html.matchAll(/<meter[^>]*>/gu)].at(-1)?.[0];
  assert.equal(fill.includes('color: transparent !important;'),transparent);assert.ok(html.includes('value="25"'));assert.ok(html.includes('--hmi-bar-track-background: #808080 !important;'));assert.equal(html.includes('data-hmi-bar-scale'),scale);assert.ok(html.includes('data-hmi-bar-threshold'));
 });
}
