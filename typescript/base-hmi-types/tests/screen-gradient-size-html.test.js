import test from 'node:test';
import assert from 'node:assert/strict';
import { HmiScreen, HmiScreenToHtmlConverter, HmiFillPattern, HmiFillPatternAlignment, hmiColorFromArgb, staticProperty } from '../dist/index.js';

for (const alignment of Object.values(HmiFillPatternAlignment)) {
  test(`Screen gradients override hatch tile sizing with ${alignment} alignment`, async () => {
    const screen = Object.assign(new HmiScreen(), {
      width: staticProperty(800), height: staticProperty(480),
      backgroundColor: staticProperty(hmiColorFromArgb(255, 150, 174, 194)),
      alternateBackgroundColor: staticProperty(hmiColorFromArgb(255, 255, 255, 255)),
      fillPattern: staticProperty(HmiFillPattern.GradientVertical),
      fillPatternAlignment: staticProperty(alignment),
    });
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
    const style = html.match(/<div[^>]*data-hmi-screen="true"[^>]*>/u)[0];
    assert.match(style, /linear-gradient\(to bottom, #96AEC2 0%, #FFFFFF 100%\)/u);
    const sizes = [...style.matchAll(/background-size: ([^;]+);/gu)];
    assert.equal(sizes.at(-1)[1], '100% 100%');
    assert.match(style, /background-repeat: no-repeat;/u);
  });
}
