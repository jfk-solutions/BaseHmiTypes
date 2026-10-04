import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiGauge,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,tagProperty,hmiColorFromArgb} from '../dist/index.js';
for(const width of [false,true])for(const color of [false,true])for(const tagged of [false,true]){
  test('Exports configured gauge needle '+[width,color,tagged],async()=>{
    const gauge=Object.assign(new HmiGauge(),{width:staticProperty(200),height:staticProperty(200),value:staticProperty(25),beginValue:staticProperty(0),endValue:staticProperty(100)});
    if(width)gauge.needleWidth=tagged?tagProperty('Gauge.Width',3):staticProperty(3);
    if(color)gauge.needleColor=tagged?tagProperty('Gauge.Color',hmiColorFromArgb(128,255,0,0)):staticProperty(hmiColorFromArgb(128,255,0,0));
    const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(gauge);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen),element=html.match(/<hmi-gauge[^>]*>/u)[0];
    assert.equal(element.includes('show-needle'),width||color);assert.equal(element.includes('needle-width="3"'),width);
    assert.equal(element.includes('needle-color="rgba(255,0,0,0.502)"'),color);
  });
}
