import assert from "node:assert/strict";
import test from "node:test";
import { HmiText, HmiLabel, HmiButton, HmiTextBox, HmiScreen, HmiLayer, HmiFont, HmiMultilingualText, HmiHorizontalAlignment, HmiVerticalAlignment, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";
import { withoutRuntimeScripts } from "./html-test-markup.js";

for (const Type of [HmiText, HmiLabel, HmiButton, HmiTextBox]) test(`Wrapping and trimming retain full text: ${Type.name}`, async () => {
  for (const [wrap, trim] of [[0, 1], [1, 0], [1, 1], [0, 0], [-2147483648, 37], [undefined, 1], [undefined, undefined]]) {
    const item = new Type(); item.name = "Sample"; item.width = staticProperty(80); item.height = staticProperty(40);
    item.text = staticProperty(HmiMultilingualText.fromText("First <line>  spaced\nSecond & line"));
    item.textWrapping = wrap === undefined ? undefined : staticProperty(wrap); item.textTrimming = trim === undefined ? undefined : staticProperty(trim);
    item.horizontalAlignment = staticProperty(HmiHorizontalAlignment.Right); item.verticalAlignment = staticProperty(HmiVerticalAlignment.Center);
    const screen = new HmiScreen(), layer = new HmiLayer(); layer.items.push(item); screen.layers.push(layer);
    const html = withoutRuntimeScripts(await new HmiScreenToHtmlConverter().convertAsync(screen));
    assert.ok(html.includes("First &lt;line&gt;  spaced\nSecond &amp; line"));
    if (wrap !== undefined) assert.ok(html.includes(`data-text-wrapping="${wrap}"`));
    if (trim !== undefined) assert.ok(html.includes(`data-text-trimming="${trim}"`));
    assert.equal(html.includes("white-space: pre;"), wrap === 0);
    assert.equal(html.includes("white-space: pre-wrap;"), wrap === 1);
    assert.equal(html.includes("text-overflow: ellipsis;"), Type !== HmiTextBox && wrap === 0 && trim === 1);
    if (Type === HmiTextBox) {
      assert.equal(html.includes('wrap="off"'), wrap === 0); assert.equal(html.includes('wrap="soft"'), wrap === 1);
      assert.ok(!html.includes("data-hmi-text-content"));
    } else {
      assert.equal(html.includes("data-hmi-text-content"), wrap === 0 || wrap === 1 || trim === 0);
      assert.ok(html.includes("text-align: right;"));
      if (wrap === 0 || wrap === 1) assert.ok(html.includes("min-inline-size: 0;max-inline-size: 100%;overflow: hidden;"));
    }
  }
});
for (const angle of [90, 270]) test(`Rotated text retains logical bounds: ${angle}`, async () => {
  const item = new HmiText(); item.name = "Rotated"; item.width = staticProperty(80); item.height = staticProperty(40); item.text = staticProperty(HmiMultilingualText.fromText("Full caption"));
  item.textWrapping = staticProperty(0); item.textTrimming = staticProperty(1); item.font = new HmiFont(); item.font.orientationAngle = staticProperty(angle); item.adaptBorderToContent = staticProperty(true); item.sizeToFit = staticProperty(true);
  const screen = new HmiScreen(), layer = new HmiLayer(); layer.items.push(item); screen.layers.push(layer);
  const html = withoutRuntimeScripts(await new HmiScreenToHtmlConverter().convertAsync(screen));
  assert.ok(html.includes(angle === 90 ? "writing-mode: sideways-lr;" : "writing-mode: sideways-rl;"));
  assert.ok(html.includes("max-inline-size: 100%;")); assert.ok(html.includes("width: max-content;height: max-content;")); assert.ok(html.includes("Full caption"));
});
