import assert from "node:assert/strict";
import test from "node:test";
import { HmiFont, staticProperty, getStaticValue } from "../dist/index.js";
test("partial localized fonts preserve empty/zero/false, missing values and neutral state", () => {
  const font = new HmiFont(), override = new HmiFont();
  font.name = staticProperty("Neutral"); font.size = staticProperty(12); font.bold = staticProperty(true); font.italic = staticProperty(true); font.characterHeight = staticProperty(4);
  override.name = staticProperty(""); override.size = staticProperty(0); override.bold = staticProperty(false); override.italic = staticProperty(false);
  font.localizedFonts.set(1031, override);
  const localized = font.getForCulture(1031);
  assert.equal(getStaticValue(localized.name), ""); assert.equal(getStaticValue(localized.size), 0);
  assert.equal(getStaticValue(localized.bold), false); assert.equal(getStaticValue(localized.italic), false);
  assert.equal(getStaticValue(localized.characterHeight), 4); assert.equal(localized.weight, undefined);
  assert.equal(font.getForCulture(), font); assert.equal(font.getForCulture(1036), font);
  assert.equal(getStaticValue(font.name), "Neutral"); assert.equal(getStaticValue(font.bold), true);
});
