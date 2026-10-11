import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiClock, HmiFont, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, getStaticValue, staticProperty, tagProperty, hmiColorFromArgb } from '../dist/index.js';
const render = async clock => {
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(clock);
  return (await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<time\b[\s\S]*?<\/time>/u)[0];
};
test('Unbound dial tag uses the model default preview', async () => {
  const clock = Object.assign(new HmiClock(), { analog: staticProperty(true), dialMode: tagProperty('Clock.DialMode') });
  const html = await render(clock);
  assert.ok(html.includes('data-clock-dial-mode="0"'));
  assert.ok(!html.includes('data-clock-tick=')); assert.ok(!html.includes('data-clock-label='));
  assert.equal(clock.dialMode.tagName, 'Clock.DialMode');
});
for (const mode of [undefined, 0, 1, 2, -1, 3, 2147483647]) test(`Dial details independent of hands and number style ${mode}`, async () => {
  for (const tagged of [false, true]) {
    const clock = Object.assign(new HmiClock(), { analog: staticProperty(true), showHours: staticProperty(false), showMinutes: staticProperty(true), showSeconds: staticProperty(true),
      numberStyle: staticProperty(99), dialColor: staticProperty(hmiColorFromArgb(0,17,34,51)), ticksColor: staticProperty(hmiColorFromArgb(255,34,51,68)),
      dialLabelColor: staticProperty(hmiColorFromArgb(255,51,68,85)), dialLabelFont: Object.assign(new HmiFont(), { name: staticProperty('Dial & Face'), size: staticProperty(9), bold: staticProperty(true) }) });
    if (mode !== undefined) clock.dialMode = tagged ? tagProperty('Clock.DialMode',mode) : staticProperty(mode);
    const original = clock.dialMode, html = await render(clock);
    assert.equal(html.includes('data-clock-dial-mode='), mode !== undefined);
    if (mode !== undefined) assert.ok(html.includes(`data-clock-dial-mode="${mode}"`));
    assert.equal((html.match(/data-clock-label="/gu) ?? []).length, mode === 1 ? 12 : 0);
    assert.equal((html.match(/data-clock-tick="/gu) ?? []).length, mode === 0 || mode === 1 ? 0 : 60);
    assert.ok(html.match(/<circle[^>]*data-clock-dial[^>]*>/u)[0].includes('fill="rgba(17,34,51,0)"'));
    assert.ok(html.includes('font-family: Dial &amp; Face;font-size: 9px;font-weight: bold;'));
    if (mode === 1) assert.ok(html.match(/<g[^>]*data-clock-labels[^>]*>/u)[0].includes('fill="#334455"'));
    assert.ok(!html.includes('data-clock-hand="hour"')); assert.ok(html.includes('data-clock-hand="minute"')); assert.ok(html.includes('data-clock-hand="second"'));
    assert.equal(clock.dialMode, original); assert.equal(getStaticValue(clock.numberStyle), 99);
  }
});
for (const background of [0,1,2]) test(`Dial color respects transparent background ${background}`, async () => {
  const clock = Object.assign(new HmiClock(), { analog: staticProperty(true), backgroundStyle: staticProperty(background), dialColor: staticProperty(hmiColorFromArgb(255,17,34,51)) });
  const html = await render(clock);
  assert.equal(html.includes('data-clock-dial="true"'), background !== 2);
  if (background !== 2) assert.ok(html.match(/<circle[^>]*data-clock-dial[^>]*>/u)[0].includes('fill="#112233"'));
});
