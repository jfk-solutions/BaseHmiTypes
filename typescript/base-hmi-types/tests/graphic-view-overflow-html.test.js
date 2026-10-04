import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiGraphicView, HmiLayer, HmiScreen, HmiScreenToHtmlConverter, HmiThickness, hmiColorFromArgb, staticProperty, tagProperty } from '../dist/index.js';

for (const tagged of [false, true]) for (const key of [false, true]) for (const missing of [false, true]) {
  test(`HTML graphic image preserves logical frame and overflows (${tagged}, ${key}, ${missing})`, async () => {
    const extent = (name, value) => tagged ? tagProperty(name, value) : staticProperty(value);
    const graphic = Object.assign(new HmiGraphicView(), {
      name: 'Overflow', x: staticProperty(30), y: staticProperty(40), width: staticProperty(100), height: staticProperty(60),
      rotationAngle: staticProperty(90),
      imageOverflowPadding: Object.assign(new HmiThickness(), { left: extent('Left', 3), top: extent('Top', 5), right: extent('Right', 7), bottom: extent('Bottom', 9) }),
      imageBackgroundColor: staticProperty(hmiColorFromArgb(255, 255, 0, 128)), imageBackgroundTransparent: staticProperty(key),
    });
    if (!missing) graphic.source = staticProperty('pipe.svg');
    const screen = new HmiScreen(), layer = new HmiLayer(); layer.items.push(graphic); screen.layers.push(layer);
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
    assert.ok(html.includes('id="Overflow"'));
    assert.ok(html.includes('width: 100px;')); assert.ok(html.includes('height: 60px;'));
    assert.ok(html.includes('transform: rotate(90deg)'));
    assert.equal(html.includes('data-hmi-graphic-overflow-image="true"'), !missing);
    assert.equal(html.includes('data-hmi-image-color-key="255,0,128"'), !missing && key);
    if (!missing) {
      assert.ok(html.includes('overflow: visible;'));
      assert.ok(html.includes('left: -3px; top: -5px; width: 110px; height: 74px;'));
    }
  });
}

test('HTML graphic image sanitizes nonfinite and negative extents', async () => {
  const graphic = Object.assign(new HmiGraphicView(), { source: staticProperty('image.bmp'), width: staticProperty(10), height: staticProperty(20),
    imageOverflowPadding: Object.assign(new HmiThickness(), { left: staticProperty(-3), top: staticProperty(NaN), right: staticProperty(Infinity), bottom: staticProperty(2) }) });
  const screen = new HmiScreen(), layer = new HmiLayer(); layer.items.push(graphic); screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(html.includes('left: 0px; top: 0px; width: 10px; height: 22px;'));
  const imageTag = html.match(/<img[^>]*data-hmi-graphic-overflow-image[^>]*>/u)?.[0] ?? '';
  assert.equal(imageTag.includes('NaN'), false); assert.equal(imageTag.includes('Infinity'), false);
});
