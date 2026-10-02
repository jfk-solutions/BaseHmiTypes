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
