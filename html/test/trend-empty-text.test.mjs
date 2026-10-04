import assert from "node:assert/strict";
import test from "node:test";

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

for (const title of [undefined, "", "   ", "Title <A> & B"]) test(`trend title retains configured text ${JSON.stringify(title)}`, () => {
  const control = new HmiTrendControl();
  control.setAttribute("control-name", "Engineering name"); control.setAttribute("type-name", "Trend control");
  control.setAttribute("display-chart-title", "true");
  if (title !== undefined) control.setAttribute("chart-title", title);
  control.connectedCallback();
  const rendered = /<div class="title">(.*?)<\/div>/su.exec(control.shadowRoot.innerHTML)?.[1];
  const expected = title === undefined ? "Engineering name" : title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  assert.equal(rendered, expected);
});

for (const useNames of [false, true]) test(`trend legend retains explicit empty labels with name mode=${useNames}`, () => {
  const control = new HmiTrendControl();
  control.setAttribute("use-trend-name-as-label", String(useNames));
  control.setAttribute("display-line-legend", "true");
  control.setAttribute("pens", JSON.stringify([
    { number: 1, name: "Blank label pen", label: "" },
    { number: 2, name: "Missing label pen" },
    { number: 3, name: "Space label pen", label: "   " },
    { number: 4, label: "" }, { number: 5 },
    { number: 6, name: "Markup pen", label: "Label <A> & B", unit: "Unit <X>" },
  ]));
  control.connectedCallback();
  const labels = [...control.shadowRoot.innerHTML.matchAll(/<span class="pen-name">(.*?)<\/span>/gsu)].map(match => match[1]);
  assert.deepEqual(labels, useNames
    ? ["Blank label pen", "Missing label pen", "Space label pen", "Pen 4", "Pen 5", "Markup pen (Unit &lt;X&gt;)"]
    : ["", "Missing label pen", "   ", "", "Pen 5", "Label &lt;A&gt; &amp; B (Unit &lt;X&gt;)"]);
});
