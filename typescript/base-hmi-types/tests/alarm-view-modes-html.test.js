import assert from "node:assert/strict";
import test from "node:test";
import { HmiAlarmControl, HmiAlarmColumnSet, HmiAlarmColumn, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";
test("Known modes override legacy flags and unknown selections keep fallback", async () => {
  const control=Object.assign(new HmiAlarmControl(),{defaultColumnSet:'Primary',useAlternatingRowColors:staticProperty(true)}),set=Object.assign(new HmiAlarmColumnSet(),{name:'Primary',coloringMode:staticProperty(0),columnHeaderType:staticProperty(0),rowHeaderType:staticProperty(1)});control.columnSets.push(set);set.columns.push(Object.assign(new HmiAlarmColumn(),{sourceType:'Caption'}));
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const renderer=new HmiScreenToHtmlConverter(),table=html=>html.split('<table class="hmi-alarm-table')[1].split('</table>')[0];
  let selected=table(await renderer.convertAsync(screen));assert.ok(selected.startsWith('"'));assert.ok(!selected.includes('<thead>'));assert.ok(selected.includes('data-view-row-header-type="1"'));
  set.coloringMode=staticProperty(1);set.columnHeaderType=staticProperty(1);selected=table(await renderer.convertAsync(screen));assert.ok(selected.startsWith(' hmi-alarm-table--alternating-columns"'));assert.ok(selected.includes('>1</th>'));assert.ok(selected.includes('colspan="1"'));assert.ok(selected.includes('Alarm data not loaded'));
  set.coloringMode=staticProperty(37);set.columnHeaderType=staticProperty(37);selected=table(await renderer.convertAsync(screen));assert.ok(selected.startsWith(' hmi-alarm-table--alternating"'));assert.ok(selected.includes('>Caption</th>'));
  control.activeColumnSet='Unknown';selected=table(await renderer.convertAsync(screen));assert.ok(!selected.includes('data-view-coloring-mode'));assert.ok(selected.startsWith(' hmi-alarm-table--alternating"'));
  control.activeColumnSet='Primary';set.columns.length=0;set.coloringMode=staticProperty(2);set.columnHeaderType=staticProperty(0);selected=table(await renderer.convertAsync(screen));assert.ok(!selected.includes('<thead>'));assert.ok(selected.includes('Alarm data not loaded'));
  set.coloringMode=undefined;set.columnHeaderType=undefined;control.useAlternatingRowColors=staticProperty(false);selected=table(await renderer.convertAsync(screen));assert.ok(selected.startsWith('"'));assert.ok(!selected.includes('data-view-coloring-mode'));
});
