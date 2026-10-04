import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiGraphicView,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty,tagProperty} from '../dist/index.js';
for(const enabled of [false,true])for(const color of [false,true])for(const tagged of [false,true])test(`HTML graphic view RGB key (${enabled}, ${color}, ${tagged})`,async()=>{
 const g=Object.assign(new HmiGraphicView(),{name:'Key',source:staticProperty('picture.bmp'),width:staticProperty(100),height:staticProperty(100),imageBackgroundTransparent:tagged?tagProperty('Picture.Transparent',enabled):staticProperty(enabled)});
 if(color)g.imageBackgroundColor=tagged?tagProperty('Picture.Key',hmiColorFromArgb(7,255,0,128)):staticProperty(hmiColorFromArgb(7,255,0,128));
 const s=new HmiScreen(),l=new HmiLayer();l.items.push(g);s.layers.push(l);const html=await new HmiScreenToHtmlConverter().convertAsync(s);
 assert.equal(html.includes('data-hmi-image-color-key="255,0,128"'),enabled&&color);assert.ok(html.includes('src="picture.bmp"'));
});
