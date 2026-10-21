import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiRectangle,HmiCircle,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,HmiFillPattern,hmiColorFromArgb,staticProperty} from '../dist/index.js';
for(const Shape of [HmiRectangle,HmiCircle])test(`${Shape.name} native empty fill keeps its border without covering underlying content`,async()=>{
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);
 const shape=Object.assign(new Shape(),{name:'Outline',width:staticProperty(100),height:staticProperty(100),backFillPattern:staticProperty(65536),backgroundColor:staticProperty(hmiColorFromArgb(255,0,0,40)),borderColor:staticProperty(hmiColorFromArgb(255,10,20,30)),borderWidth:staticProperty(10)});layer.items.push(shape);
 const render=async()=>{const html=await new HmiScreenToHtmlConverter().convertAsync(screen);return html.slice(html.lastIndexOf('id="Outline"'));};
 let output=await render();
 if(Shape===HmiCircle){assert.ok(output.includes('fill="none"'));assert.ok(output.includes('stroke-width="10"'));assert.ok(output.includes('stroke="#0A141E"'));}
 else {assert.ok(output.includes('border-width: 10px'));assert.ok(output.includes('border-color: #0A141E'));}
 assert.ok(!output.includes('background-color: #000028'));
 shape.backFillPattern=staticProperty(0);output=await render();assert.ok(output.includes(Shape===HmiCircle?'fill="#000028"':'background-color: #000028'));
 shape.backFillPattern=staticProperty(65536);shape.fillPattern=staticProperty(HmiFillPattern.Solid);output=await render();assert.ok(output.includes(Shape===HmiCircle?'fill="#000028"':'background-color: #000028'));
 shape.fillPattern=staticProperty(HmiFillPattern.Transparent);output=await render();assert.ok(!output.includes('background-color: #000028'));if(Shape===HmiCircle)assert.ok(output.includes('fill="none"'));
});
