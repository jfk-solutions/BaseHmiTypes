import assert from "node:assert/strict";
import test from "node:test";
import { HmiScreen, HmiLayer, HmiButton, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";

test("Empty and populated layers pass pointer input to their items", async () => {
  const screen = new HmiScreen();
  const empty = Object.assign(new HmiLayer(), { name: "Empty" });
  const populated = Object.assign(new HmiLayer(), { name: "Populated" });
  const hidden = Object.assign(new HmiLayer(), { name: "Hidden", visible: staticProperty(false) });
  populated.items.push(Object.assign(new HmiButton(), { name: "Disabled", enabled: staticProperty(false) }));
  screen.layers.push(empty, populated, hidden);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  for (const name of ["Empty", "Populated"])
    assert.ok(html.includes(`id="${name}" data-hmi-layer="true" style="position: absolute; inset: 0; pointer-events: none;"`));
  assert.ok(html.includes("[data-hmi-layer]>*{pointer-events:auto;}"));
  assert.ok(!html.includes('id="Hidden"'));
  assert.ok(html.includes('id="Disabled" aria-disabled="true"'));
});
