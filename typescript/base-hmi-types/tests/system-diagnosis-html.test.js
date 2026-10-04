import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiSystemDiagnosisControl, HmiSystemDiagnosisColumnType, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";
test("diagnostic columns retain ordering and widths without headings", async () => {
  const screen=new HmiScreen(),layer=new HmiLayer(),control=new HmiSystemDiagnosisControl();screen.layers.push(layer);layer.items.push(control);
  control.showColumnHeadings=staticProperty(false);control.rowHeight=staticProperty(0);control.showToolbar=staticProperty(false);control.showStatusBar=staticProperty(false);
  control.columnDefinitions.push({type:HmiSystemDiagnosisColumnType.Unknown,sourceType:"Later",width:staticProperty(100),order:staticProperty(2)},
    {type:HmiSystemDiagnosisColumnType.Unknown,sourceType:"First",width:staticProperty(0),order:staticProperty(0)},
    {type:HmiSystemDiagnosisColumnType.Unknown,sourceType:"Hidden",width:staticProperty(999),visible:staticProperty(false)},
    {type:HmiSystemDiagnosisColumnType.Unknown,sourceType:"InvalidWidth",width:staticProperty(NaN),order:staticProperty(3)});
  let html=await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(html.includes('<colgroup><col style="width: 0px;"><col style="width: 100px;"><col></colgroup>'));
  assert.ok(!html.includes('<thead>'));assert.ok(!html.includes('width: 999px;'));assert.ok(html.includes('colspan="3"'));
  assert.ok(!html.includes('role="toolbar"'));assert.ok(!html.includes('role="status"'));
  control.showColumnHeadings=staticProperty(true);html=await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(html.indexOf('data-column-source-type="First"')<html.indexOf('data-column-source-type="Later"'));
  control.columnDefinitions.length=0;html=await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(!html.includes('hmi-diagnosis-table'));assert.ok(html.includes('Diagnostic data not loaded'));
});
