import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiSystemDiagnosisControl,
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
