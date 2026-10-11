import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiToggleSwitch, HmiState, HmiMultilingualText, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, tagProperty, hmiColorFromArgb, getStaticValue } from '../dist/index.js';
for(const value of [0,1]) test(`Switch palettes stay independent from states and thumbs: ${value}`,async()=>{
  const item=Object.assign(new HmiToggleSwitch(),{name:'Palette',width:staticProperty(120),height:staticProperty(30),state:staticProperty(value),
    headerForegroundColor:staticProperty(hmiColorFromArgb(255,119,136,153)),offBackgroundColor:tagProperty('Palette.Off',hmiColorFromArgb(0,17,34,51)),onBackgroundColor:staticProperty(hmiColorFromArgb(255,68,85,102))});
  item.states.push(Object.assign(new HmiState(),{value:0,text:HmiMultilingualText.fromText('Off <A>')}),Object.assign(new HmiState(),{value:1,text:HmiMultilingualText.fromText('On & B')}));
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const renderer=new HmiScreenToHtmlConverter();
  const root=html=>html.match(/<hmi-toggle-switch[^>]*id="Palette"[^>]*>/)?.[0]??'';
  let output=root(await renderer.convertAsync(screen));
  for(const expected of ['--hmi-toggle-off-background:rgba(17,34,51,0);','--hmi-toggle-on-background:#445566;','--hmi-toggle-header-foreground:#778899;',
    'data-off-background-color="rgba(17,34,51,0)"','data-on-background-color="#445566"','data-header-foreground-color="#778899"']) assert.ok(output.includes(expected),output);
  assert.equal(/\schecked(?:\s|>)/.test(output),value===1);assert.equal(item.offThumbColor,undefined);assert.equal(item.onThumbColor,undefined);assert.equal(getStaticValue(item.state),value);assert.equal(item.states.length,2);
  delete item.offBackgroundColor;output=root(await renderer.convertAsync(screen));assert.ok(!output.includes('--hmi-toggle-off-background:'));assert.ok(output.includes('--hmi-toggle-on-background:#445566;'));
  delete item.onBackgroundColor;delete item.headerForegroundColor;output=root(await renderer.convertAsync(screen));assert.ok(!output.includes('--hmi-toggle-'));assert.ok(!output.includes('data-header-foreground-color='));assert.equal(/\schecked(?:\s|>)/.test(output),value===1);
});
