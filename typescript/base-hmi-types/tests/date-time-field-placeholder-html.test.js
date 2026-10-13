import assert from "node:assert/strict";
import test from "node:test";
import { HmiDateTimeField, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, HmiHorizontalAlignment, HmiVerticalAlignment, staticProperty } from "../dist/index.js";

for (const [date, time, expected] of [[true, false, "--.--.----"], [false, true, "--:--:--"],
  [true, true, "--.--.---- --:--:--"], [false, false, ""]]) {
  test(`Missing date/time values use aligned placeholders (${date}, ${time})`, async () => {
    const field = new HmiDateTimeField();
    Object.assign(field, { name: "DateTime", showDate: staticProperty(date), showTime: staticProperty(time),
      horizontalAlignment: staticProperty(HmiHorizontalAlignment.Right), verticalAlignment: staticProperty(HmiVerticalAlignment.Bottom) });
    const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(field);
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
    assert.ok(html.includes(">" + expected + "</div>"));
    assert.ok(html.includes("justify-content: flex-end;align-items: flex-end;"));
    assert.equal(html.includes('aria-label="Date/time value not loaded"'), date || time);
    assert.ok(html.includes('data-date-time-value-state="missing"'));
  });
}
