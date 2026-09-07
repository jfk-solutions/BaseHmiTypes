import assert from "node:assert/strict";
import test from "node:test";

import { HmiAlarmList } from "../dist/index.js";

test("alarm list retains neutral source identity", () => {
  const list = new HmiAlarmList();
  list.sourceIdentifier = "Alarms";
  list.sourceFormatVersion = "1.0";
  list.sourceProductIdentifier = "{123-456-789}";

  assert.equal(list.sourceIdentifier, "Alarms");
  assert.equal(list.sourceFormatVersion, "1.0");
  assert.equal(list.sourceProductIdentifier, "{123-456-789}");
});
