import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiSlider, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, tagProperty, hmiColorFromArgb } from '../dist/index.js';

for (const visible of [undefined, false, true]) for (const palette of [false, true]) {
  test(`Configured slider visibility keeps track and value ${visible} ${palette}`, async () => {
    for (const tagged of [false, true]) {
      const slider = Object.assign(new HmiSlider(), { width: staticProperty(200), height: staticProperty(40), beginValue: staticProperty(0), endValue: staticProperty(100), value: staticProperty(25) });
      if (visible !== undefined) slider.showThumb = tagged ? tagProperty('Slider.ThumbVisible', visible) : staticProperty(visible);
      if (palette) slider.thumbBackgroundColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
      const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(slider);
      const original = slider.showThumb;
      const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
      const input = html.match(/<input[^>]*data-hmi-slider[^>]*>/u)[0];
      assert.equal(input.includes('data-show-thumb='), visible !== undefined);
      if (visible !== undefined) assert.ok(input.includes(`data-show-thumb="${visible}"`));
      assert.equal(input.includes('data-hmi-slider-custom-thumb="true"'), palette || visible === false);
      for (const attribute of ['type="range"', 'value="25"', 'min="0"', 'max="100"', 'disabled="disabled"', 'step="any"']) assert.ok(input.includes(attribute));
      assert.equal(slider.showThumb, original);
      assert.ok(html.includes('input[data-hmi-slider][data-show-thumb="false"]::-webkit-slider-thumb{visibility:hidden;}'));
      assert.ok(html.includes('input[data-hmi-slider][data-show-thumb="false"]::-moz-range-thumb{visibility:hidden;}'));
    }
  });
}
