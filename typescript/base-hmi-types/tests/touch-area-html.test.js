import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiTouchArea, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty } from '../dist/index.js';

test('Touch areas remain transparent named input regions without placeholder text', async () => {
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer);
  layer.items.push(Object.assign(new HmiTouchArea(), {name:'Touch', x:staticProperty(10), y:staticProperty(20), width:staticProperty(120), height:staticProperty(60)}));
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const area = html.match(/<div[^>]*id="Touch"[^>]*><\/div>/u)?.[0];
  assert.ok(area); assert.ok(area.includes('left: 10px')); assert.ok(area.includes('width: 120px'));
  assert.ok(!html.includes('>HmiTouchArea<'));
});
