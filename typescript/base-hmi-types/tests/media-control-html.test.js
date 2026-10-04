import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiMediaControl, HmiFont, getStaticValue, HmiScreenToHtmlConverter, staticProperty, expressionProperty } from "../dist/index.js";

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

test("media bars select localized fonts and honor visibility", async () => {
  const toolbarFont=new HmiFont();toolbarFont.name=staticProperty("NeutralToolbar");toolbarFont.size=staticProperty(9);
  const localizedToolbar=new HmiFont();localizedToolbar.name=staticProperty("SelectedToolbar");localizedToolbar.size=staticProperty(14);localizedToolbar.bold=staticProperty(true);toolbarFont.localizedFonts.set(1031,localizedToolbar);
  const statusFont=new HmiFont();statusFont.name=staticProperty("NeutralStatus");statusFont.size=staticProperty(10);
  const localizedStatus=new HmiFont();localizedStatus.name=staticProperty("SelectedStatus");localizedStatus.size=staticProperty(12);localizedStatus.italic=staticProperty(true);statusFont.localizedFonts.set(1031,localizedStatus);
  const control=new HmiMediaControl(),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);
  control.showToolbar=staticProperty(true);control.showStatusBar=staticProperty(true);control.toolbarFont=toolbarFont;control.statusBarFont=statusFont;
  const converter=new HmiScreenToHtmlConverter();let html=await converter.convertAsync(screen,undefined,{cultureLcid:1031});
  assert.ok(html.includes("font-family: SelectedToolbar;font-size: 14px;"));assert.ok(html.includes("font-family: SelectedStatus;font-size: 12px;"));assert.ok(!html.includes("NeutralToolbar"));assert.ok(!html.includes("NeutralStatus"));
  control.showToolbar=staticProperty(false);control.showStatusBar=staticProperty(false);html=await converter.convertAsync(screen,undefined,{cultureLcid:1031});
  assert.ok(!html.includes('role="toolbar"'));assert.ok(!html.includes('role="status"'));assert.ok(!html.includes("SelectedToolbar"));assert.equal(getStaticValue(toolbarFont.name),"NeutralToolbar");
});
