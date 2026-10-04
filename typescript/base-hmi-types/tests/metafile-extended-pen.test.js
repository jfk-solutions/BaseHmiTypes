import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty as p} from '../dist/index.js';

function record(type, ...values) {
  const bytes = Buffer.alloc(8 + values.length * 4);
  bytes.writeUInt32LE(type, 0); bytes.writeUInt32LE(bytes.length, 4);
  values.forEach((value, index) => bytes.writeUInt32LE(value >>> 0, 8 + index * 4));
  return bytes;
}

function emf(style, penSize = 52, extra = []) {
  const pen = Buffer.alloc(penSize), u = (at, value) => pen.writeUInt32LE(value, at);
  u(0, 95); u(4, penSize); u(8, 1); u(28, style); u(32, 6); u(36, 0); u(40, 0x00563412);
  const bytes = Buffer.concat([Buffer.alloc(88), pen, record(37, 1), ...extra, record(27, 5, 10), record(54, 35, 10), record(14, 0, 0, 20)]);
  const h = (at, value) => bytes.writeUInt32LE(value, at);
  h(0, 1); h(4, 88); h(16, 39); h(20, 19); h(40, 0x464d4520); h(44, 0x10000);
  h(48, bytes.length); h(52, 6 + extra.length); bytes.writeUInt16LE(2, 56); return bytes;
}

const lines = bytes => [...new MetafileToSvgRenderer().render(bytes, '.emf').matchAll(/<line\b[^>]+>/g)]
  .map(tag => Object.fromEntries([...tag[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1], a[2]])));

for (const [style, cap, join] of [
  [0x10000, 'round', 'round'], [0x10100, 'square', 'round'], [0x10200, 'butt', 'round'],
  [0x11000, 'round', 'bevel'], [0x11100, 'square', 'bevel'], [0x11200, 'butt', 'bevel'],
  [0x12000, 'round', 'miter'], [0x12100, 'square', 'miter'], [0x12200, 'butt', 'miter'],
]) test(`Geometric cap/join preserved: ${style}`, () => {
  const bytes = emf(style), original = Buffer.from(bytes), line = lines(bytes)[0];
  assert.equal(line['stroke-linecap'], cap); assert.equal(line['stroke-linejoin'], join);
  assert.equal(line['stroke-miterlimit'], join === 'miter' ? '10' : undefined);
  assert.equal(line.stroke, '#123456'); assert.deepEqual(bytes, original);
});

for (const style of [0, 0x1100, 0x2200]) test(`Cosmetic pen has no geometric attributes: ${style}`, () => {
  const line = lines(emf(style))[0]; assert.equal(line['stroke-linecap'], undefined); assert.equal(line['stroke-linejoin'], undefined);
});

test('Null geometric pen remains invisible', () => {
  const line = lines(emf(0x12105))[0]; assert.equal(line.stroke, 'none');
  assert.equal(line['stroke-linecap'], undefined); assert.equal(line['stroke-linejoin'], undefined);
});
test('Truncated extended pen is ignored', () => {
  const line = lines(emf(0x12100, 48))[0]; assert.equal(line.stroke, '#000000'); assert.equal(line['stroke-width'], '1');
});

for (const [bits, expected] of [[0x40000000, '2'], [0x41200000, '10'], [0x3f800000, '1'], [0x3f000000, '10'], [0x7f800000, '10'], [0x7fc00000, '10']])
  test(`Miter limit accepts valid values and ignores invalid ones: ${bits}`, () => {
    assert.equal(lines(emf(0x12000, 52, [record(58, bits)]))[0]['stroke-miterlimit'], expected);
  });

test('Saved miter limit is restored', () => {
  const values = lines(emf(0x12000, 52, [record(58, 0x41100000), record(33), record(58, 0x40000000), record(27, 5, 10), record(54, 35, 10), record(34, 0xffffffff)]));
  assert.equal(values[0]['stroke-miterlimit'], '2'); assert.equal(values[1]['stroke-miterlimit'], '9');
});

for (const [style, cap, join] of [[0x10000, 'round', 'round'], [0x11100, 'square', 'bevel'], [0x12200, 'butt', 'miter']])
  test(`HTML retains caps/joins without source mutation: ${style}`, async () => {
    const uri = 'data:image/emf;base64,' + emf(style).toString('base64');
    const item = Object.assign(new HmiGraphicView(), {name: 'ExtendedPen', source: p(uri)});
    const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(item);
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
    const value = html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/)?.[1]; assert.ok(value);
    const svg = decodeURIComponent(value); assert.ok(svg.includes(`stroke-linecap="${cap}"`));
    assert.ok(svg.includes(`stroke-linejoin="${join}"`)); assert.equal(item.source.staticValue, uri);
  });
