import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiTrendControl, HmiTrendPen, HmiMultilingualText, HmiScreenToHtmlConverter, HmiHtmlConvertOptions } from "../dist/index.js";

const decode = text => text.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
for (const mode of ["legacy", "localized", "empty", "localized-only", "absent", "empty-neutral"]) {
  for (const lcid of [undefined, 1031, 1036]) test(`Pen and legacy axes resolve selected culture without changing models: ${mode}/${lcid}`, async () => {
    let text;
    if (mode !== "legacy" && mode !== "absent") {
      text = new HmiMultilingualText();
      if (mode !== "localized-only") text.texts.set(-1, mode === "empty-neutral" ? "" : "Neutral <label>");
      text.texts.set(1031, mode === "empty" ? "" : "Deutsch <label>");
    }
    const legacy = mode === "absent" ? undefined : "Legacy <label>";
    const control = Object.assign(new HmiTrendControl(), { xAxisLabel: legacy, yAxisLabel: legacy, xAxisLabelText: text, yAxisLabelText: text });
    const pen = Object.assign(new HmiTrendPen(), { number: 1, valueAxisLabel: legacy, valueAxisLabelText: text }); control.pens.push(pen);
    const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(control);
    const options = new HmiHtmlConvertOptions(); options.cultureLcid = lcid;
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen, undefined, options);
    const attributes = [...html.matchAll(/<hmi-trend-control\b([^>]*)>/g)].at(-1)[1];
    const expected = mode === "absent" ? undefined : mode === "legacy" ? legacy : lcid === 1031 ? mode === "empty" ? "" : "Deutsch <label>" : mode === "localized-only" ? "Deutsch <label>" : mode === "empty-neutral" ? "" : "Neutral <label>";
    for (const key of ["x-axis-label", "y-axis-label"]) {
      const match = new RegExp(`${key}="([^"]*)"`).exec(attributes); assert.equal(match !== null, expected !== undefined && expected !== "");
      if (expected !== undefined && expected !== "") assert.equal(decode(match[1]), expected);
    }
    const entries = JSON.parse(decode(/pens="([^"]*)"/.exec(attributes)[1]));
    assert.equal(Object.hasOwn(entries[0], "valueAxisLabel"), expected !== undefined); if (expected !== undefined) assert.equal(entries[0].valueAxisLabel, expected);
    assert.equal(control.xAxisLabel, legacy); assert.equal(pen.valueAxisLabel, legacy); assert.equal(control.yAxisLabelText, text);
    if (text) assert.equal(text.texts.get(1031), mode === "empty" ? "" : "Deutsch <label>");
  });
}
