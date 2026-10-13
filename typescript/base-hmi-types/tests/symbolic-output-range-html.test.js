import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiSymbolicIOField, HmiIOField, HmiState, HmiMultilingualText, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty } from '../dist/index.js';

test('Output captions preserve lines and select ranges before the default', async () => {
  const field = Object.assign(new HmiSymbolicIOField(), { name:'Mode', value:staticProperty(12), readOnly:staticProperty(true), showDropDownButton:staticProperty(false) });
  field.states.push(Object.assign(new HmiState(), { value:1, isDefault:true, text:HmiMultilingualText.fromText('Fallback') }),
    Object.assign(new HmiState(), { value:10, maximumValue:15, text:HmiMultilingualText.fromText('Pre-selection\r\nMaintenance') }));
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(field);
  const renderer = new HmiScreenToHtmlConverter(), html = await renderer.convertAsync(screen);
  assert.ok(html.includes('role="status"')); assert.ok(html.includes('white-space: pre-wrap'));
  assert.ok(html.includes('Pre-selection\r\nMaintenance')); assert.ok(!html.includes('<select'));
  field.value = staticProperty(99); assert.ok((await renderer.convertAsync(screen)).includes('>Fallback</div>'));
  const coordinate = Object.assign(new HmiIOField(), { name:'Coordinate',text:staticProperty(HmiMultilingualText.fromText('0')),outputFormat:staticProperty('{I3}') });
  layer.items.push(coordinate); assert.ok((await renderer.convertAsync(screen)).includes('value="000"'));
  coordinate.text=staticProperty(HmiMultilingualText.fromText('-7')); assert.ok((await renderer.convertAsync(screen)).includes('value="-007"'));
});
