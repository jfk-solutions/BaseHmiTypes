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

for(const visible of [true,false]) test(`trend toolbar consumes independent font/color CSS visible=${visible}`,()=>{
 const control=new HmiTrendControl();control.setAttribute("show-toolbar",String(visible));control.connectedCallback();const css=control.shadowRoot.innerHTML.match(/\.toolbar \{([\s\S]*?)\}/u)?.[1]??"";
 for(const variable of ["foreground","font-family","font-size","font-weight","font-style","text-decoration"])assert.ok(css.includes(`var(--hmi-trend-toolbar-${variable},`),variable);
 assert.ok(css.includes("#20242a"));assert.ok(css.includes("clamp(10px, 1.8vmin, 16px)"));
});
