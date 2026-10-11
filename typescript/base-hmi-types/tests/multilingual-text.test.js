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

test("raw default-language header does not change culture selection", () => {
  const text = new HmiMultilingualText(); text.sourceDefaultLanguageId = 1031;
  text.texts.set(1033, "English"); text.texts.set(1031, "Deutsch");
  text.formattedTexts.set(1033, "<body>English</body>"); text.formattedTexts.set(1031, "<body>Deutsch</body>");
  assert.equal(text.getDefaultText(), "English");
  assert.equal(text.getText(1036), "English"); assert.equal(text.getText(1031), "Deutsch");
  assert.equal(text.getFormattedText(1036), "<body>English</body>");
});
