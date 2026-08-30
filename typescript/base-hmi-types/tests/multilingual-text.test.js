import assert from "node:assert/strict";
import test from "node:test";
import {
  HmiMultilingualText,
  HmiTextPart,
  HmiTextPartKind,
} from "../dist/index.js";

test("returns culture-specific and fallback text parts", () => {
  const text = HmiMultilingualText.fromText("Speed");
  const fallback = new HmiTextPart();
  fallback.text = "Speed ";
  text.parts.set(-1, [fallback]);
  const german = new HmiTextPart();
  german.kind = HmiTextPartKind.NumericVariable;
  german.sourceText = "/*N:3 MotorSpeed NOFILL DP:0*/";
  german.expression = "MotorSpeed";
  german.fieldLength = 3;
  german.previewText = "###";
  text.parts.set(1031, [german]);

  assert.equal(text.getParts(1031)[0]?.expression, "MotorSpeed");
  assert.equal(text.getParts(1033)[0]?.text, "Speed ");
});
