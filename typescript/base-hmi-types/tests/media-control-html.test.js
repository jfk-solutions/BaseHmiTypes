import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiMediaControl, HmiScreenToHtmlConverter, staticProperty, expressionProperty } from "../dist/index.js";

test("media configuration is escaped and remains an unloaded preview", async () => {
  const control = new HmiMediaControl(), screen = new HmiScreen(), layer = new HmiLayer();
  screen.layers.push(layer); layer.items.push(control);
  control.source = staticProperty('https://example.test/video?a=1&b=<clip>"');
  control.autoPlay = staticProperty(false);
  const converter = new HmiScreenToHtmlConverter();
  let html = await converter.convertAsync(screen);
  assert.ok(html.includes("Media not loaded"));
  assert.ok(html.includes("Source: https://example.test/video?a=1&amp;b=&lt;clip&gt;&quot;"));
  assert.ok(html.includes('data-auto-play="false"')); assert.ok(html.includes("Autoplay: false"));
  assert.ok(!html.includes("<video")); assert.ok(!html.includes("<audio")); assert.ok(!html.includes("<iframe"));
  control.autoPlay = staticProperty(true); html = await converter.convertAsync(screen);
  assert.ok(html.includes('data-auto-play="true"'));
  control.source = expressionProperty("{Media <source>}"); control.autoPlay = expressionProperty("{Auto <play>}");
  html = await converter.convertAsync(screen);
  assert.ok(html.includes("Source: {Media &lt;source&gt;}"));
  assert.ok(html.includes('data-media-source="{Media &lt;source&gt;}"'));
  assert.ok(html.includes("Autoplay: {Auto &lt;play&gt;}"));
  control.source = undefined; control.autoPlay = undefined; html = await converter.convertAsync(screen);
  assert.ok(!html.includes("data-auto-play=")); assert.ok(!html.includes("Autoplay:")); assert.ok(!html.includes("Source:"));
});
