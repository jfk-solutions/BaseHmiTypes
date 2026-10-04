import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiSlider,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,tagProperty,hmiColorFromArgb} from '../dist/index.js';
for(const background of [false,true])for(const foreground of [false,true])for(const tagged of [false,true]){
 test('Configured slider thumb colors remain inert '+[background,foreground,tagged],async()=>{
  const slider=Object.assign(new HmiSlider(),{width:staticProperty(200),height:staticProperty(40),beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25)});
  if(background)slider.thumbBackgroundColor=tagged?tagProperty('Thumb.Back',hmiColorFromArgb(255,255,0,0)):staticProperty(hmiColorFromArgb(255,255,0,0));
  if(foreground)slider.thumbForegroundColor=tagged?tagProperty('Thumb.Fore',hmiColorFromArgb(128,0,255,0)):staticProperty(hmiColorFromArgb(128,0,255,0));
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(slider);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),input=html.match(/<input[^>]*data-hmi-slider[^>]*>/u)[0];
  assert.equal(input.includes('data-hmi-slider-custom-thumb="true"'),background||foreground);
  assert.equal(input.includes('--hmi-slider-thumb-background: #FF0000;'),background);
  assert.equal(input.includes('--hmi-slider-thumb-foreground: rgba(0,255,0,0.502);'),foreground);
  assert.ok(input.includes('disabled="disabled"'));assert.ok(input.includes('value="25"'));assert.ok(input.includes('step="any"'));
 });
}
