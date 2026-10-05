import assert from "node:assert/strict";
import test from "node:test";
import { HmiAlarmControl, HmiAlarmColumnSet, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, hmiColorFromArgb } from "../dist/index.js";
test("Appearance routes per view without selecting the placeholder", async () => {
  const color = (...args) => staticProperty(hmiColorFromArgb(...args));
  const control = Object.assign(new HmiAlarmControl(), { defaultColumnSet: "Primary", alternatingRowBackgroundColor: color(255,1,2,3), alternatingRowForegroundColor: color(255,4,5,6) });
  const primary = Object.assign(new HmiAlarmColumnSet(), { name: "Primary", alternateBackgroundColor: color(0,17,34,51), selectionBackgroundColor: color(255,119,136,153), selectionForegroundColor: color(255,170,187,204), selectionBorderColor: color(255,221,238,255), selectionBorderWidth: staticProperty(0), headerSelectionBackgroundColor: color(0,17,34,51), headerSelectionForegroundColor: color(255,68,85,102) });
  const stats = Object.assign(new HmiAlarmColumnSet(), { name: "Statistics", selectionBorderWidth: staticProperty(255) });control.columnSets.push(primary,stats);
  const screen = new HmiScreen(), layer = new HmiLayer();screen.layers.push(layer);layer.items.push(control);const renderer = new HmiScreenToHtmlConverter();
  const table = html => html.split('<table class="hmi-alarm-table')[1].split('</table>')[0];
  let html = await renderer.convertAsync(screen), selected = table(html);assert.ok(selected.includes('--hmi-alarm-alternating-row-background: rgba(17,34,51,0);'));assert.ok(selected.includes('--hmi-alarm-alternating-row-foreground: #040506;'));assert.ok(selected.includes('data-view-selection-border-width="0"'));assert.ok(selected.includes('data-view-header-selection-foreground-color="#445566"'));assert.ok(!selected.split('<tbody>')[1].includes('#778899'));assert.ok(!selected.includes('hmi-alarm-table--alternating'));
  control.useAlternatingRowColors = staticProperty(true);selected = table(await renderer.convertAsync(screen));assert.ok(selected.includes('hmi-alarm-table--alternating'));
  control.activeColumnSet = 'Statistics';html = await renderer.convertAsync(screen);selected = table(html);assert.ok(selected.includes('data-view-selection-border-width="255"'));assert.ok(selected.includes('--hmi-alarm-alternating-row-background: #010203;'));assert.ok(!selected.includes('data-view-selection-background-color'));assert.ok(html.includes('data-view-selection-background-color="#778899"'));
  control.activeColumnSet = 'Unknown';selected = table(await renderer.convertAsync(screen));assert.ok(!selected.includes('data-view-selection'));assert.ok(selected.includes('--hmi-alarm-alternating-row-background: #010203;'));
  control.activeColumnSet = 'Primary';primary.alternateBackgroundColor = undefined;control.alternatingRowBackgroundColor = undefined;selected = table(await renderer.convertAsync(screen));assert.ok(!selected.includes('--hmi-alarm-alternating-row-background:'));assert.ok(selected.includes('data-view-header-selection-background-color="rgba(17,34,51,0)"'));assert.ok(selected.includes('Alarm data not loaded'));
});
