import assert from "node:assert/strict";
import test from "node:test";
import { HmiTrendControl, HmiFunctionTrendControl, HmiTrendStatusBarPanel, HmiMultilingualText, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";

for (const type of [HmiTrendControl, HmiFunctionTrendControl]) test(`${type.name} retains independent status-panel metadata`, async () => {
  const control = new type(); control.showStatusBar = staticProperty(false); control.showStatusBarTooltips = staticProperty(false);
  const panel = new HmiTrendStatusBarPanel(); panel.sourceType = "Configured panel"; panel.text = HmiMultilingualText.fromText(""); panel.width = staticProperty(Infinity);
  const hidden = new HmiTrendStatusBarPanel(); hidden.sourceType = "Hidden panel"; hidden.visible = staticProperty(false); hidden.width = staticProperty(-5); hidden.order = staticProperty(-1); hidden.autoSize = staticProperty(true);
  control.statusBarPanels.push(panel, hidden); const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(control);
  const renderer = new HmiScreenToHtmlConverter();
  const attributes = html => [...html.matchAll(/<hmi-trend-control\b([^>]*)>/gu)].at(-1)[1];
  const rendered = attributes(await renderer.convertAsync(screen));
  assert.ok(rendered.includes('show-status-bar="false"')); assert.ok(rendered.includes('show-status-bar-tooltips="false"'));
  const wire = /status-bar-panels="([^"]*)"/u.exec(rendered)[1].replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
  assert.deepEqual(JSON.parse(wire), [{sourceType: "Configured panel", text: ""}, {sourceType: "Hidden panel", visible: false, order: -1, width: -5, autoSize: true}]);
  control.statusBarPanels.length = 0; delete control.showStatusBarTooltips;
  const empty = attributes(await renderer.convertAsync(screen)); assert.ok(!empty.includes("status-bar-panels=")); assert.ok(!empty.includes("show-status-bar-tooltips="));
});
