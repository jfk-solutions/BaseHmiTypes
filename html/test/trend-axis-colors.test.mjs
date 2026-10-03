import assert from "node:assert/strict";
import test from "node:test";

// Exercise the component's rendered output without requiring a browser layout engine.
globalThis.HTMLElement = class {
  attributes = new Map();
  attachShadow() { return this.shadowRoot = { innerHTML: "" }; }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  setAttribute(name, value) {
    const previous = this.getAttribute(name);
    this.attributes.set(name, value);
    if (this.constructor.observedAttributes.includes(name)) this.attributeChangedCallback(name, previous, value);
  }
};
globalThis.customElements = { define() {} };
globalThis.getComputedStyle = () => ({ backgroundColor: "#ffffff", color: "#111111", borderTopColor: "#111111", borderTopWidth: "0" });
const { HmiTrendControl } = await import("../dist/hmi-trend-control.js");

test("configured axes render without pens and override legacy assigned-axis copies", () => {
  const control = new HmiTrendControl();
  const axes = [{ valueAxisName: "Unused", valueAxisVisible: true, minimum: 5, maximum: 15, decimalPlaces: 1, valueAxisLabel: "Standalone" }];
  control.setAttribute("value-axes", JSON.stringify(axes));
  let html = control.shadowRoot.innerHTML;
  assert.match(html, /data-axis-name="Unused"/u);
  assert.match(html, />15.0<\/span>/u);
  assert.match(html, />5.0<\/span>/u);
  assert.match(html, /Standalone/u);
  control.setAttribute("pens", JSON.stringify([{ number: 9, valueAxisName: "Unused", minimum: 1000, maximum: 2000, decimalPlaces: 3, lineType: 3 }]));
  html = control.shadowRoot.innerHTML;
  assert.equal([...html.matchAll(/data-axis-name=/gu)].length, 1);
  assert.match(html, /<text[^>]*>10.0<\/text>/u);
  axes[0].valueAxisVisible = false;
  control.setAttribute("value-axes", JSON.stringify(axes));
  assert.ok(!control.shadowRoot.innerHTML.includes("data-axis-name="));
  // Invalid collections retain the legacy pen-axis rendering path.
  control.setAttribute("value-axes", "{invalid");
  assert.match(control.shadowRoot.innerHTML, />2000.000<\/span>/u);
});

test("named value axes are distinct, shared, independently visible and styled", () => {
  const control = new HmiTrendControl();
  const pens = [
    { number: 1, color: "#112233", visible: false, valueAxisName: "Pressure", valueAxisVisible: true, valueAxisAlignment: "Right", valueAxisInTrendColor: true, valueAxisLabel: "Pressure & load", minimum: 1, maximum: 100, axisScaleType: 1, decimalPlaces: 2 },
    { number: 2, valueAxisName: "Temperature", valueAxisVisible: true, valueAxisAlignment: "Left", valueAxisColor: "#445566", valueAxisLabel: "<Temperature>", minimum: -10, maximum: 20, decimalPlaces: 1 },
    { number: 3, valueAxisName: "Pressure", minimum: 1, maximum: 100 },
    { number: 4, valueAxisName: "Hidden", valueAxisVisible: false },
    { number: 5, valueAxisName: "Flow", valueAxisAlignment: "Left", minimum: 0, maximum: 1, decimalPlaces: 3 },
  ];
  control.setAttribute("y-axis-scale-visible", "false");
  control.setAttribute("pens", JSON.stringify(pens));
  let html = control.shadowRoot.innerHTML;
  assert.equal([...html.matchAll(/data-axis-name=/gu)].length, 3);
  assert.equal([...html.matchAll(/data-axis-name="Pressure"/gu)].length, 1);
  assert.match(html, /class="value-axis right" data-axis-name="Pressure" style="right:-4.4em;color:#112233"/u);
  assert.match(html, /class="value-axis left" data-axis-name="Temperature" style="left:-4.4em;color:#445566"/u);
  assert.match(html, /data-axis-name="Flow" style="left:-8.8em/u);
  assert.match(html, /\.plot\s*\{[^}]*left: calc\(2.5% \+ 8.8em\); right: calc\(2.5% \+ 4.4em\);/u);
  assert.match(html, />100.00<\/span>/u);
  assert.match(html, />-10.0<\/span>/u);
  assert.match(html, />1.000<\/span>/u);
  assert.match(html, /Pressure &amp; load/u);
  assert.match(html, /&lt;Temperature&gt;/u);
  assert.ok(!html.includes("data-axis-name=\"Hidden\""));
  pens[1].valueAxisVisible = false;
  control.setAttribute("pens", JSON.stringify(pens));
  html = control.shadowRoot.innerHTML;
  assert.ok(!html.includes("data-axis-name=\"Temperature\""));
  assert.match(html, /data-axis-name="Flow" style="left:-4.4em/u);
});

test("each pen uses its own axis range, scaling and precision", () => {
  const control = new HmiTrendControl();
  control.setAttribute("minimum-value", "0");
  control.setAttribute("maximum-value", "100");
  control.setAttribute("y-axis-decimal-places", "0");
  const pens = [
    { number: 1, lineType: 3, minimum: 0, maximum: 100, decimalPlaces: 0, exponentialFormat: false },
    { number: 2, lineType: 3, minimum: 1000, maximum: 2000, decimalPlaces: 3, exponentialFormat: false },
    { number: 3, lineType: 3, minimum: 1, maximum: 100, axisScaleType: 1, decimalPlaces: 2, exponentialFormat: true },
    { number: 4, lineType: 3, minimum: -100, maximum: -1, axisScaleType: 2, decimalPlaces: 1, exponentialFormat: false },
  ];
  control.setAttribute("pens", JSON.stringify(pens));
  const values = [...control.shadowRoot.innerHTML.matchAll(/<text\b[^>]*>([^<]+)<\/text>/gu)].map(match => match[1]);
  assert.equal(values[0], "50");
  const y = index => Math.min(97, Math.max(3, 50 - Math.sin(index * 3 * 0.55) * (24 - index * 2) + index * 3));
  assert.equal(values[5], (2000 - y(1) / 100 * 1000).toFixed(3));
  assert.equal(values[10], Math.exp(Math.log(100) * (1 - y(2) / 100)).toExponential(2));
  assert.equal(values[15], (-Math.exp(y(3) / 100 * Math.log(100))).toFixed(1));
  // A high-limit alarm on a later pen must use its range, not the first pen's 0..100 axis.
  pens[1] = { ...pens[1], showAlarms: true, upperLimit: 500, upperLimitColoring: true, upperLimitColor: "#ff0000" };
  control.setAttribute("pens", JSON.stringify(pens));
  assert.match(control.shadowRoot.innerHTML, /High limit alarm/);
  assert.match(control.shadowRoot.innerHTML, /<text[^>]*fill="#ff0000"/u);
  pens[0] = { ...pens[0], minimum: 1, axisScaleType: 1, exponentialFormat: true, autoDecimalPlaces: true };
  delete pens[1].exponentialFormat;
  control.setAttribute("pens", JSON.stringify(pens));
  const independentValues = [...control.shadowRoot.innerHTML.matchAll(/<text\b[^>]*>([^<]+)<\/text>/gu)].map(match => match[1]);
  assert.equal(independentValues[5], (2000 - y(1) / 100 * 1000).toFixed(3));
  pens[1] = { ...pens[1], minimum: 0, maximum: 0.01, autoDecimalPlaces: true, decimalPlaces: 0 };
  control.setAttribute("pens", JSON.stringify(pens));
  const automaticValues = [...control.shadowRoot.innerHTML.matchAll(/<text\b[^>]*>([^<]+)<\/text>/gu)].map(match => match[1]);
  assert.equal(automaticValues[5], (0.01 * (1 - y(1) / 100)).toFixed(3));
});

test("plot background is independent, reactive and rejects CSS injection", () => {
  const control = new HmiTrendControl();
  control.connectedCallback();
  const plotBackground = () => control.shadowRoot.innerHTML.match(/\.plot\s*\{[^}]*background: ([^;]+);/u)?.[1];
  assert.equal(plotBackground(), "#ffffff");
  control.setAttribute("window-background-color", "#123456");
  assert.equal(plotBackground(), "#123456");
  assert.match(control.shadowRoot.innerHTML, /\.frame\s*\{[^}]*background: #ffffff;/u);
  control.setAttribute("window-background-color", "rgba(12, 34, 56, 0.5)");
  assert.equal(plotBackground(), "rgba(12, 34, 56, 0.5)");
  control.setAttribute("window-background-color", "transparent");
  assert.equal(plotBackground(), "transparent");
  control.setAttribute("window-background-color", "#000; background:url(https://example.com)");
  assert.equal(plotBackground(), "#ffffff");
  assert.ok(!control.shadowRoot.innerHTML.includes("https://example.com"));
});

test("time-axis date formats preserve token order, padding and localized month names", () => {
  const originalNow = Date.now;
  Date.now = () => new Date(2007, 11, 24, 15, 4, 6).getTime();
  try {
    const control = new HmiTrendControl();
    control.setAttribute("lang", "en-US");
    control.setAttribute("x-axis-time-span", "1");
    for (const [format, expected] of [
      ["dd.MM.yy", "24.12.07"], ["dd.MM.yyyy", "24.12.2007"],
      ["dd/MM/yy", "24/12/07"], ["dd/MM/yyyy", "24/12/2007"],
      ["dd.MMM.yy", "24.Dec.07"], ["dd.MMM.yyyy", "24.Dec.2007"],
      ["MM.dd.yy", "12.24.07"], ["MM.dd.yyyy", "12.24.2007"],
      ["MMM.dd.yy", "Dec.24.07"], ["MMM.dd.yyyy", "Dec.24.2007"],
      ["yyyy/MM/dd", "2007/12/24"], ["Automatic", "12/24/2007"],
    ]) {
      control.setAttribute("x-axis-date-format", format);
      assert.ok(control.shadowRoot.innerHTML.includes(`>${expected}<br>`), format);
    }
    control.setAttribute("x-axis-date-format", "<dd/MM/yyyy>");
    assert.ok(control.shadowRoot.innerHTML.includes("&lt;24/12/2007&gt;"));
    control.setAttribute("x-axis-date-visible", "false");
    assert.ok(!control.shadowRoot.innerHTML.includes("24/12/2007"));
  } finally { Date.now = originalNow; }
});

test("time labels retain three-digit milliseconds in both clock formats", () => {
  const originalNow = Date.now;
  Date.now = () => new Date(2020, 0, 1, 15, 4, 6, 12).getTime();
  try {
    const control = new HmiTrendControl();
    control.setAttribute("x-axis-time-span", "7");
    control.setAttribute("x-axis-time-span-unit", "Milliseconds");
    control.setAttribute("time-format", "TwentyFourHour");
    control.setAttribute("display-milliseconds", "true");
    assert.match(control.shadowRoot.innerHTML, /15:04:06\.005/);
    assert.match(control.shadowRoot.innerHTML, /15:04:06\.012/);
    control.setAttribute("time-format", "TwelveHour");
    assert.match(control.shadowRoot.innerHTML, /3:04:06\.005PM/);
    control.setAttribute("display-milliseconds", "false");
    assert.match(control.shadowRoot.innerHTML, /3:04:06PM/);
    assert.doesNotMatch(control.shadowRoot.innerHTML, /3:04:06\.\d{3}PM/);
  } finally {
    Date.now = originalNow;
  }
});

test("trend-colored axes follow configured order even when the first pen is hidden", () => {
  const control = new HmiTrendControl();
  control.setAttribute("pens", JSON.stringify([
    { number: 1, color: "#123456", visible: false },
    { number: 2, color: "#abcdef", visible: true },
  ]));
  control.setAttribute("x-axis-in-trend-color", "true");
  control.setAttribute("y-axis-in-trend-color", "true");
  assert.match(control.shadowRoot.innerHTML, /--hmi-trend-x-axis-color: #123456;/);
  assert.match(control.shadowRoot.innerHTML, /--hmi-trend-y-axis-color: #123456;/);
  control.setAttribute("x-axis-in-trend-color", "false");
  assert.doesNotMatch(control.shadowRoot.innerHTML, /--hmi-trend-x-axis-color: #123456;/);
  assert.match(control.shadowRoot.innerHTML, /--hmi-trend-y-axis-color: #123456;/);
  control.setAttribute("pens", "[]");
  assert.doesNotMatch(control.shadowRoot.innerHTML, /--hmi-trend-[xy]-axis-color: /);
});
