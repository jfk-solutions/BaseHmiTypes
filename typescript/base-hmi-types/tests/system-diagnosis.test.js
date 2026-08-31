import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiAlarmRowDoubleClickAction,
  HmiAlarmTimePrecision,
  HmiHorizontalAlignment,
  HmiSystemDiagnosisControl,
  HmiSystemDiagnosisColumn,
  HmiSystemDiagnosisColumnType,
  HmiSystemDiagnosisViewKind,
  staticProperty,
} from "../dist/index.js";

test("diagnostics list retains documented presentation", () => {
  const control = new HmiSystemDiagnosisControl();
  control.viewKind = HmiSystemDiagnosisViewKind.DiagnosticsList;
  control.keyNavigation = staticProperty(true);
  control.wrapAround = staticProperty(true);
  control.selectionBackgroundColor = staticProperty({ alpha: 255, red: 0x10, green: 0x20, blue: 0x30 });
  control.selectionForegroundColor = staticProperty({ alpha: 255, red: 0xf0, green: 0xe0, blue: 0xd0 });

  assert.equal(control.keyNavigation.staticValue, true);
  assert.equal(control.wrapAround.staticValue, true);
  assert.equal(control.selectionBackgroundColor.staticValue.red, 0x10);
  assert.equal(control.selectionForegroundColor.staticValue.red, 0xf0);
});

test("automatic event summary retains documented general presentation", () => {
  const control = new HmiSystemDiagnosisControl();
  control.viewKind = HmiSystemDiagnosisViewKind.AutomaticEventSummary;
  control.showColumnHeadings = staticProperty(true);
  control.showHorizontalGridLines = staticProperty(true);
  control.showVerticalGridLines = staticProperty(false);
  control.gridLineColor = staticProperty({ alpha: 255, red: 0x20, green: 0x30, blue: 0x40 });
  control.showHorizontalScrollbar = staticProperty(true);
  control.showVerticalScrollbar = staticProperty(true);
  control.detailsPaneVisible = staticProperty(true);
  control.detailsPaneAllowResize = staticProperty(true);
  control.detailsPaneHeightPercent = staticProperty(35);
  control.showToolbar = staticProperty(true);
  control.toolbarIconSize = staticProperty("Large");
  control.showStatusBar = staticProperty(true);
  control.statusBarIconSize = staticProperty("Small");
  control.showTooltips = staticProperty(true);
  control.allowColumnResize = staticProperty(true);
  control.allowSortByColumn = staticProperty(false);
  control.displayContextMenu = staticProperty(true);
  control.rowDoubleClickAction = staticProperty(HmiAlarmRowDoubleClickAction.Suppress);
  control.displayErrorsInDialog = staticProperty(true);
  control.showWaitingMessage = staticProperty(true);
  control.timestampPrecision = staticProperty(HmiAlarmTimePrecision.Microseconds);
  const column = new HmiSystemDiagnosisColumn();
  column.type = HmiSystemDiagnosisColumnType.EventTime;
  column.sourceType = "Event Time";
  column.visible = staticProperty(true);
  column.width = staticProperty(140);
  column.alignment = staticProperty(HmiHorizontalAlignment.Center);
  column.format = "DateTime";
  column.order = staticProperty(0);
  control.columnDefinitions.push(column);

  assert.equal(control.showColumnHeadings.staticValue, true);
  assert.equal(control.showVerticalGridLines.staticValue, false);
  assert.equal(control.gridLineColor.staticValue.red, 0x20);
  assert.equal(control.detailsPaneHeightPercent.staticValue, 35);
  assert.equal(control.toolbarIconSize.staticValue, "Large");
  assert.equal(control.statusBarIconSize.staticValue, "Small");
  assert.equal(control.showTooltips.staticValue, true);
  assert.equal(control.allowColumnResize.staticValue, true);
  assert.equal(control.allowSortByColumn.staticValue, false);
  assert.equal(control.displayContextMenu.staticValue, true);
  assert.equal(control.rowDoubleClickAction.staticValue, HmiAlarmRowDoubleClickAction.Suppress);
  assert.equal(control.displayErrorsInDialog.staticValue, true);
  assert.equal(control.showWaitingMessage.staticValue, true);
  assert.equal(control.timestampPrecision.staticValue, HmiAlarmTimePrecision.Microseconds);
  assert.equal(control.columnDefinitions[0].type, HmiSystemDiagnosisColumnType.EventTime);
  assert.equal(control.columnDefinitions[0].sourceType, "Event Time");
  assert.equal(control.columnDefinitions[0].width.staticValue, 140);
  assert.equal(control.columnDefinitions[0].alignment.staticValue, HmiHorizontalAlignment.Center);
  assert.equal(control.columnDefinitions[0].format, "DateTime");
});
