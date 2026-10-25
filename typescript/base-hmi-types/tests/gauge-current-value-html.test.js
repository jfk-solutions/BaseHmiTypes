import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiGauge,HmiFont,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,tagProperty,hmiColorFromArgb} from '../dist/index.js';
async function element(gauge) {
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(gauge);
  return (await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<hmi-gauge[^>]*>/u)[0];
}
for(const visible of [false,true])for(const legacy of [false,true])test(`current visibility overrides legacy ${visible}/${legacy}`,async()=>{
  const gauge=Object.assign(new HmiGauge(),{currentValueVisible:staticProperty(visible),showValue:staticProperty(legacy)});
  assert.equal((await element(gauge)).includes(' show-value'),visible);
});
for(const tagged of [false,true])test(`independent current-value presentation ${tagged}`,async()=>{
  const property=value=>tagged?tagProperty('Gauge.Presentation',value):staticProperty(value);
  const gauge=Object.assign(new HmiGauge(),{
    currentValueDecimalPlaces:property(2),currentValueColor:property(hmiColorFromArgb(128,255,0,0)),
    currentValueFont:Object.assign(new HmiFont(),{name:staticProperty('Value & Font'),size:staticProperty(18),weight:staticProperty(600),italic:staticProperty(true),underline:staticProperty(true),strikethrough:staticProperty(true)}),
    labelFont:Object.assign(new HmiFont(),{name:staticProperty('Tick Font'),size:staticProperty(6)})
  });
  const html=(await element(gauge)).replaceAll('&quot;','"').replaceAll('&amp;','&');
  assert.ok(html.includes('current-value-decimal-places="2"'));
  assert.ok(html.includes('current-value-color="rgba(255,0,0,0.502)"'));
  assert.ok(html.includes('current-value-font="{"name":"Value & Font","size":18,"weight":600,"italic":true,"underline":true,"strikethrough":true}'));
  assert.ok(html.includes('label-font="{"name":"Tick Font","size":6}'));
});
test('unconfigured presentation retains legacy defaults',async()=>{
  const html=await element(new HmiGauge());assert.ok(html.includes(' show-value'));assert.ok(!html.includes('current-value-'));
  assert.ok(!(await element(Object.assign(new HmiGauge(),{showValue:staticProperty(false)}))).includes(' show-value'));
});
