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

test("gauge label visibility and interval affect labels only and update dynamically", () => {
  const gauge = createGauge();
  gauge.divisionCount = 5;
  const count = expression => [...gauge.svg.innerHTML.matchAll(expression)].length;
  assert.equal(count(/<text /gu), 6);
  gauge.attributeChangedCallback("tick-label-interval", null, "2");
  assert.equal(count(/<text /gu), 3);
  assert.equal(count(/stroke-width="0.7"/gu), 6);
  assert.equal(count(/stroke-width="0.45"/gu), 15);
  gauge.attributeChangedCallback("hide-tick-labels", null, "");
  assert.equal(count(/<text /gu), 0);
  assert.equal(count(/stroke-width="0.7"/gu), 6);
  gauge.attributeChangedCallback("hide-tick-labels", "", null);
  assert.equal(count(/<text /gu), 3);
  for (const interval of [0, -1, Number.NaN]) {
    gauge.tickLabelInterval = interval;
    assert.equal(count(/<text /gu), 6);
  }
  gauge.showValue = true;
  gauge.hideTickLabels = true;
  assert.equal(count(/<text /gu), 1); // Independent value readout remains visible.
});

test("gauge tick number formatting is reactive and leaves the value readout unchanged", () => {
  const gauge = createGauge();
  gauge.beginValue = 0;
  gauge.endValue = 0.5;
  gauge.value = 0.25;
  gauge.showValue = true;
  const labels = () => [...gauge.svg.innerHTML.matchAll(/<text\b[^>]*>([^<]*)<\/text>/gu)].map(match => match[1]);
  assert.deepEqual(labels(), ["0", "0.25", "0.5", "0.25"]);
  gauge.attributeChangedCallback("tick-label-decimal-places", null, "2");
  assert.deepEqual(labels(), ["0.00", "0.25", "0.50", "0.25"]);
  gauge.attributeChangedCallback("tick-label-exponential-format", null, "");
  assert.deepEqual(labels(), ["0.00e+000", "2.50e-001", "5.00e-001", "0.25"]);
  gauge.beginValue = -0.5;
  assert.deepEqual(labels(), ["-5.00e-001", "0.00e+000", "5.00e-001", "0.25"]);
  gauge.attributeChangedCallback("tick-label-exponential-format", "", null);
  gauge.attributeChangedCallback("tick-label-decimal-places", "2", null);
  assert.deepEqual(labels(), ["-0.5", "0", "0.5", "0.25"]);
  gauge.tickLabelExponentialFormat = true;
  assert.equal(labels()[2], "5.00e-001"); // Unconfigured scientific precision defaults to two.
});

for (const [precision, digits] of [[-1, 0], [0, 0], [16, 16], [20, 20], [25, 20]]) {
  for (const exponential of [false, true]) {
    test(`gauge tick precision is clamped (${precision}, ${exponential})`, () => {
      const gauge = createGauge();
      gauge.beginValue = 0;
      gauge.endValue = 1;
      gauge.tickLabelDecimalPlaces = precision;
      gauge.tickLabelExponentialFormat = exponential;
      const labels = [...gauge.svg.innerHTML.matchAll(/<text\b[^>]*>([^<]*)<\/text>/gu)].map(match => match[1]);
      const expected = exponential
        ? (1).toExponential(digits).replace("e+0", "e+000")
        : (1).toFixed(digits);
      assert.equal(labels[2], expected);
      assert.equal([...gauge.svg.innerHTML.matchAll(/stroke-width="0.7"/gu)].length, 3);
    });
  }
}
