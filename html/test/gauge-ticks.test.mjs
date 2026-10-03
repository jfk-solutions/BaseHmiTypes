import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

// Stub only the DOM/component framework; execute the compiled gauge and its SVG renderer.
class Svg {
  innerHTML = "";
}
class Component {
  svg = new Svg();
  shadowRoot = { getElementById: id => id === "gauge" ? this.svg : null };
  connectedCallback() {}
}
const source = readFileSync(new URL("../dist/hmi-gauge.js", import.meta.url), "utf8")
  .replace(/^import\s+\{[^}]+\}\s+from\s+"[^"]+base-custom-webcomponent[^"]+";\s*/u, "")
  .replace("export class HmiGauge", "class HmiGauge");
const context = {
  BaseCustomWebComponentConnectedReady: Component,
  SVGSVGElement: Svg,
  css: strings => strings.join(""),
  html: strings => strings.join(""),
  customElement: () => () => {},
};
runInNewContext(source + "\nglobalThis.TestGauge = HmiGauge;", context);
const Gauge = context.TestGauge;

function createGauge() {
  const gauge = new Gauge();
  gauge.divisionCount = 2;
  gauge.subDivisionCount = 4;
  gauge.connectedCallback();
  gauge.ready();
  return gauge;
}

test("gauge major-only attribute removes minor marks and restores them when removed", () => {
  const gauge = createGauge();
  const count = expression => [...gauge.svg.innerHTML.matchAll(expression)].length;
  assert.equal(count(/stroke-width="0.7"/gu), 3);
  assert.equal(count(/stroke-width="0.45"/gu), 6);
  assert.equal(count(/<text /gu), 3);
  assert.ok(Gauge.observedAttributes.includes("major-ticks-only"));
  gauge.attributeChangedCallback("major-ticks-only", null, "");
  assert.equal(gauge.majorTicksOnly, true);
  assert.equal(count(/stroke-width="0.7"/gu), 3);
  assert.equal(count(/stroke-width="0.45"/gu), 0);
  assert.equal(count(/<text /gu), 3);
  gauge.attributeChangedCallback("major-ticks-only", "", null);
  assert.equal(gauge.majorTicksOnly, false);
  assert.equal(count(/stroke-width="0.45"/gu), 6);
});

test("gauge major-only property updates rendered ticks without changing subdivision configuration", () => {
  const gauge = createGauge();
  gauge.majorTicksOnly = true;
  assert.ok(!gauge.svg.innerHTML.includes('stroke-width="0.45"'));
  assert.equal(gauge.subDivisionCount, 4);
  gauge.majorTicksOnly = false;
  assert.equal([...gauge.svg.innerHTML.matchAll(/stroke-width="0.45"/gu)].length, 6);
});
