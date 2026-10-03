import assert from "node:assert/strict";
import test from "node:test";
import { HmiGauge, HmiLayer, HmiScreen, HmiScreenToHtmlConverter, staticProperty, tagProperty } from "../dist/index.js";

async function convert(gauge) {
  const layer = new HmiLayer();
  layer.items.push(gauge);
  const screen = new HmiScreen();
  screen.layers.push(layer);
  return new HmiScreenToHtmlConverter().convertAsync(screen);
}

for (const length of [-1, 0, 6, 12, 1000]) {
  for (const tagged of [false, true]) {
    test(`HTML exports gauge tick length (${length}, ${tagged})`, async () => {
      const gauge = new HmiGauge();
      gauge.majorTickLength = tagged ? tagProperty("Gauge.TickLength", length) : staticProperty(length);
      assert.ok((await convert(gauge)).includes(`major-tick-length="${length}"`));
    });
  }
}
test("HTML omits unconfigured gauge tick length", async () => {
  assert.equal((await convert(new HmiGauge())).includes("major-tick-length="), false);
});
