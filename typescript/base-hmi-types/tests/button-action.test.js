import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiButton,
  HmiButtonAction,
  HmiMultilingualText,
  staticProperty,
} from "../dist/index.js";

test("button actions expose configured button value without renumbering existing actions", () => {
  assert.equal(HmiButtonAction.SetToOne, 3);
  assert.equal(HmiButtonAction.ButtonValue, 4);
  assert.equal(HmiButtonAction.SetToZero, 5);
  assert.equal(HmiButtonAction.ToggleTagValue, 6);
});

test("button actions retain a diagnostic remark", () => {
  const button = new HmiButton();
  button.actionRemark = staticProperty(
    HmiMultilingualText.fromText("Changed mode from /C to /N"),
  );

  assert.equal(button.actionRemark.staticValue.getText(), "Changed mode from /C to /N");
});
