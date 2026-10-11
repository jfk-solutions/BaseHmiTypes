import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiToggleSwitch,HmiState,HmiMultilingualText,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,tagProperty,hmiColorFromArgb,getStaticValue} from '../dist/index.js';
for(const alternate of [false,true])for(const withStates of [false,true])test(`Boolean state overrides numbered selection without creating states: ${alternate}/${withStates}`,async()=>{
  const item=Object.assign(new HmiToggleSwitch(),{name:'GenericSwitch',state:staticProperty(1),isAlternateState:tagProperty('Switch.State',alternate),text:staticProperty(HmiMultilingualText.fromText('Off <A>')),alternateText:staticProperty(HmiMultilingualText.fromText('On & B'))});
  if(withStates)item.states.push(Object.assign(new HmiState(),{value:0,foregroundColor:hmiColorFromArgb(255,17,34,51)}),Object.assign(new HmiState(),{value:1,foregroundColor:hmiColorFromArgb(255,68,85,102)}));
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const renderer=new HmiScreenToHtmlConverter();
  const root=html=>html.match(/<hmi-toggle-switch[^>]*id="GenericSwitch"[^>]*>/)?.[0]??'';
  let output=root(await renderer.convertAsync(screen));assert.equal(/\schecked(?:\s|>)/.test(output),alternate);assert.ok(output.includes(`data-is-alternate-state="${alternate}"`));
  if(withStates)assert.ok(output.includes(alternate?'color: #445566;':'color: #112233;'));
  assert.ok(output.includes('text="Off &lt;A&gt;"'));assert.ok(output.includes('alternate-text="On &amp; B"'));assert.equal(item.states.length,withStates?2:0);assert.equal(getStaticValue(item.state),1);
  delete item.isAlternateState;output=root(await renderer.convertAsync(screen));assert.equal(/\schecked(?:\s|>)/.test(output),withStates);assert.ok(!output.includes('data-is-alternate-state='));
});
