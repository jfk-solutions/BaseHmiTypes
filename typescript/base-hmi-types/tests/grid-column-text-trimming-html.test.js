import assert from "node:assert/strict";
import test from "node:test";
import { HmiAlarmControl, HmiAlarmColumn, HmiDetailedParameterControl, HmiOverviewParameterControl, HmiParameterColumn, HmiSystemDiagnosisControl, HmiSystemDiagnosisColumn, HmiScreen, HmiLayer, HmiMultilingualText, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";
import { withoutRuntimeScripts } from "./html-test-markup.js";
for (const Type of [HmiAlarmControl, HmiDetailedParameterControl, HmiOverviewParameterControl, HmiSystemDiagnosisControl]) test(`Header trimming remains independent of body and hidden headings: ${Type.name}`, async () => {
  for (const mode of [undefined, 0, 1, -2147483648]) {
    const control = new Type(); control.name = "Control"; control.width = staticProperty(160); control.height = staticProperty(80);
    if (control instanceof HmiAlarmControl) control.shortenColumnTitles = staticProperty(true);
    if (control instanceof HmiDetailedParameterControl) control.hideDetails = staticProperty(false);
    const Column = control instanceof HmiAlarmControl ? HmiAlarmColumn : control instanceof HmiSystemDiagnosisControl ? HmiSystemDiagnosisColumn : HmiParameterColumn;
    for (const [name, caption, header, content, visible] of [["Visible", "Caption <A>", mode, 37, true], ["Hidden", "Hidden caption", 1, 0, false]]) {
      const column = new Column(); column.name = name; column.sourceType = name; column.headerText = HmiMultilingualText.fromText(caption);
      column.headerTextTrimming = header === undefined ? undefined : staticProperty(header); column.contentTextTrimming = staticProperty(content); column.visible = staticProperty(visible); column.width = staticProperty(40); control.columnDefinitions.push(column);
    }
    const screen = new HmiScreen(), layer = new HmiLayer(); layer.items.push(control); screen.layers.push(layer);
    const renderer = new HmiScreenToHtmlConverter(), htmlFor = async () => withoutRuntimeScripts(await renderer.convertAsync(screen));
    let html = await htmlFor(), table = html.match(/<table class="hmi-(?:alarm|parameter|diagnosis)-table[^>]*>.*?<\/table>/su)?.[0] ?? "", header = table.match(/<thead>.*?<\/thead>/su)?.[0] ?? "";
    assert.ok(header.includes("Caption &lt;A&gt;")); assert.ok(!header.includes("Hidden caption"));
    assert.equal(header.includes('<span style="display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'), mode === 1);
    if (mode === 0) assert.ok(header.includes("overflow: visible;text-overflow: clip;white-space: normal;"));
    if (mode !== undefined) assert.ok(header.includes(`data-header-text-trimming="${mode}"`));
    assert.ok(header.includes('data-content-text-trimming="37"'));
    assert.ok(html.includes('data-column-index="1" data-column-source-name="Hidden" data-header-text-trimming="1" data-content-text-trimming="0"'));
    assert.ok(!table.match(/<tbody>.*?<\/tbody>/su)?.[0].includes("<span"));
    if (control instanceof HmiAlarmControl) control.showHeader = staticProperty(false);
    else if (control instanceof HmiSystemDiagnosisControl) control.showColumnHeadings = staticProperty(false);
    else control.columnHeaderType = staticProperty(0);
    html = await htmlFor(); table = html.match(/<table class="hmi-(?:alarm|parameter|diagnosis)-table[^>]*>.*?<\/table>/su)?.[0] ?? "";
    assert.ok(!table.includes("<thead>")); assert.ok(html.includes('data-content-text-trimming="37"'));
    if (control instanceof HmiDetailedParameterControl) { control.hideDetails = staticProperty(true); assert.ok((await htmlFor()).includes('data-content-text-trimming="37"')); }
  }
});
