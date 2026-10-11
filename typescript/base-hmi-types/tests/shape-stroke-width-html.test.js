import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiLine, HmiPolyline, HmiCircle, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, tagProperty, getStaticValue } from '../dist/index.js';

for (const kind of ['Line','Polyline','Circle']) test(`Stroke width uses finite nonnegative effective values without changing source: ${kind}`, async () => {
  const shape = kind === 'Polyline' ? new HmiPolyline() : kind === 'Circle' ? new HmiCircle() : new HmiLine();
  shape.name = 'Stroke'; shape.width = staticProperty(64); shape.height = staticProperty(32);
  if (shape instanceof HmiPolyline) shape.points.push({x:0,y:0},{x:64,y:32});
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(shape);
  const renderer = new HmiScreenToHtmlConverter();
  const width = async expected => {
    const html = await renderer.convertAsync(screen);
    const svg = html.match(/<svg\b[^>]*id="Stroke"[^>]*>.*?<\/svg>/s)?.[0] ?? '';
    const pattern = kind === 'Polyline' ? /<polyline\b[^>]*>/ : kind === 'Circle' ? /<circle\b[^>]*stroke-width[^>]*>/ : /<line\b[^>]*>/;
    const element = svg.match(pattern)?.[0] ?? '';
    assert.ok(element.includes(`stroke-width="${expected}"`), element);
  };
  await width(1); shape.borderWidth = staticProperty(4); await width(4);
  for (const valid of [0,2.5,7]) { shape.lineWidth = staticProperty(valid); await width(valid); assert.equal(getStaticValue(shape.lineWidth),valid); }
  for (const invalid of [-1,NaN,Infinity,-Infinity]) {
    const source = tagProperty('Stroke.Width',invalid); shape.lineWidth = source; await width(4);
    assert.equal(shape.lineWidth,source); assert.equal(getStaticValue(shape.lineWidth),invalid);
    for (const border of [-2,NaN,Infinity,-Infinity]) { shape.borderWidth = staticProperty(border); await width(1); assert.equal(getStaticValue(shape.borderWidth),border); }
    shape.borderWidth = staticProperty(0); await width(0); shape.borderWidth = staticProperty(4);
  }
  delete shape.lineWidth; delete shape.borderWidth; await width(1);
});
