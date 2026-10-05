import assert from "node:assert/strict";
import test from "node:test";

globalThis.HTMLElement = class {
  attributes = new Map();
  attachShadow() { return this.shadowRoot = { innerHTML: "" }; }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  setAttribute(name, value) {
    const previous = this.getAttribute(name); this.attributes.set(name, value);
    if (this.constructor.observedAttributes.includes(name)) this.attributeChangedCallback(name, previous, value);
  }
};
globalThis.customElements = { define() {} };
globalThis.getComputedStyle = () => ({ backgroundColor: "#ffffff", color: "#111111", borderTopColor: "#111111", borderTopWidth: "0" });
const { HmiTrendControl } = await import("../dist/hmi-trend-control.js");

for (const tooltipState of [undefined, true, false]) test(`trend status panels render configuration with tooltips=${tooltipState}`, () => {
  const control = new HmiTrendControl(); control.setAttribute("show-status-bar", "true"); control.setAttribute("status-bar-text", "Default status");
  if (tooltipState !== undefined) control.setAttribute("show-status-bar-tooltips", String(tooltipState));
  const panels = [
    { sourceType: 'Panel "<A>', text: "Ready <A> & B", tooltip: 'Inspect "<A> & B', width: 72, order: 2 },
    { sourceType: "Empty panel", text: "", tooltip: "", width: 0, autoSize: false, order: 1 },
    { sourceType: "Hidden panel", text: "Hidden text", visible: false, order: 0 },
    { sourceType: "Automatic panel", autoSize: true, width: 999, order: 3 },
    { sourceType: "Invalid width panel", width: -10, order: 4 },
  ];
  control.setAttribute("status-bar-panels", JSON.stringify(panels)); control.connectedCallback();
  const body = () => /<div class="status">(.*?)<\/div>/su.exec(control.shadowRoot.innerHTML)?.[1];
  const rendered = body(); assert.ok(rendered.includes("Ready &lt;A&gt; &amp; B"));
  assert.ok(rendered.includes('data-panel-source-type="Panel &quot;&lt;A&gt;"'));
  assert.ok(rendered.indexOf('data-panel-source-type="Empty panel"') < rendered.indexOf('data-panel-source-type="Panel'));
  assert.ok(rendered.includes("width: 72px;")); assert.ok(rendered.includes("width: 0px;")); assert.ok(rendered.includes("flex: 1 1 auto;"));
  for (const absent of ["Hidden text", "Hidden panel", "Default status", "999px", "-10px"]) assert.ok(!rendered.includes(absent), absent);
  assert.equal(rendered.includes('title="Inspect &quot;&lt;A&gt; &amp; B"'), tooltipState !== false);
  assert.equal(rendered.includes('title=""'), tooltipState !== false);
  control.setAttribute("show-status-bar-tooltips", "false"); assert.ok(!body().includes(" title="));
  control.setAttribute("show-status-bar", "false"); assert.equal(body(), undefined);
  assert.deepEqual(JSON.parse(control.getAttribute("status-bar-panels")), panels);
  control.setAttribute("show-status-bar", "true"); assert.ok(body().includes("Ready &lt;A&gt; &amp; B"));
  control.setAttribute("status-bar-panels", JSON.stringify([{ visible: false, text: "Hidden text" }])); assert.equal(body(), "");
});

for (const value of ["invalid", "{}", "[]", "[null,3,\"text\"]"]) test(`invalid or empty panel configuration falls back for ${value}`, () => {
  const control = new HmiTrendControl(); control.setAttribute("show-status-bar", "true"); control.setAttribute("status-bar-text", "Default <A>");
  control.setAttribute("status-bar-panels", value); control.connectedCallback();
  assert.equal(/<div class="status">(.*?)<\/div>/su.exec(control.shadowRoot.innerHTML)?.[1], "Default &lt;A&gt;");
});
