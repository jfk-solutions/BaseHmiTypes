import assert from "node:assert/strict";
import test from "node:test";
import { HmiAlarmControl, HmiAlarmColumnSet, HmiAlarmColumn, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";
test("View selection routes scroll modes and retains selection metadata", async () => {
  const control = Object.assign(new HmiAlarmControl(), { defaultColumnSet: "Primary", showHorizontalScrollbar: staticProperty(true), showVerticalScrollbar: staticProperty(false) });
  const primary = Object.assign(new HmiAlarmColumnSet(), { name: "Primary", horizontalScrollBarVisibility: staticProperty(0), verticalScrollBarVisibility: staticProperty(1), gridSelectionMode: staticProperty(0), selectFullRow: staticProperty(false) });
  const stats = Object.assign(new HmiAlarmColumnSet(), { name: "Statistics", horizontalScrollBarVisibility: staticProperty(2), verticalScrollBarVisibility: staticProperty(2), gridSelectionMode: staticProperty(2), selectFullRow: staticProperty(true) }); control.columnSets.push(primary, stats); primary.columns.push(Object.assign(new HmiAlarmColumn(), { sourceType: "Column" }));
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(control); const renderer = new HmiScreenToHtmlConverter();
  const table = html => html.split('<table class="hmi-alarm-table')[1].split("</table>")[0];
  let html = await renderer.convertAsync(screen); assert.ok(html.includes('overflow-x: auto;overflow-y: scroll;')); assert.ok(table(html).includes('data-view-select-full-row="false"')); assert.ok(table(html).includes('data-view-grid-selection-mode="0"')); assert.ok(html.includes('<template class="hmi-alarm-view-settings">')); assert.ok(html.includes('data-column-set-name="Statistics"'));
  control.activeColumnSet = "Statistics"; html = await renderer.convertAsync(screen); assert.ok(html.includes('overflow-x: hidden;overflow-y: hidden;')); assert.ok(table(html).includes('data-view-select-full-row="true"')); assert.ok(table(html).includes('data-view-grid-selection-mode="2"'));
  control.activeColumnSet = "Primary"; primary.horizontalScrollBarVisibility = staticProperty(3); primary.verticalScrollBarVisibility = staticProperty(-1); primary.gridSelectionMode = staticProperty(37); control.showHeader = staticProperty(false);
  html = await renderer.convertAsync(screen); assert.ok(html.includes('overflow-x: auto;overflow-y: hidden;')); assert.ok(table(html).includes('data-view-grid-selection-mode="37"')); assert.ok(!table(html).includes('<thead>'));
  primary.horizontalScrollBarVisibility = undefined; primary.verticalScrollBarVisibility = undefined; primary.gridSelectionMode = undefined; primary.selectFullRow = undefined;
  html = await renderer.convertAsync(screen); assert.ok(!table(html).includes('data-view-select-full-row')); assert.ok(!table(html).includes('data-view-grid-selection-mode')); assert.ok(!html.split('<template class="hmi-alarm-view-settings">')[1].split('</template>')[0].includes('data-column-set-name="Primary"')); assert.ok(html.includes('overflow-x: auto;overflow-y: hidden;'));
  control.activeColumnSet = "Unknown"; html = await renderer.convertAsync(screen); assert.ok(html.includes('overflow-x: auto;overflow-y: hidden;')); assert.ok(!table(html).includes('data-view-'));
  control.activeColumnSet = "Statistics"; stats.horizontalScrollBarVisibility = undefined; stats.verticalScrollBarVisibility = undefined; stats.selectFullRow = undefined;
  html = await renderer.convertAsync(screen); assert.ok(html.includes('data-column-set-name="Statistics"')); assert.ok(table(html).includes('data-view-grid-selection-mode="2"')); assert.ok(table(html).includes('Alarm data not loaded'));
});
