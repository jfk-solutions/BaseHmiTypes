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

test("configured trend toolbar retains identities and flags without executing commands",()=>{
 const control=new HmiTrendControl();control.setAttribute("show-toolbar","true");
 const buttons=[{sourceType:'Command "<A>',tooltip:'Inspect "<A> & B',enabled:true,order:2},{sourceType:'Command "<A>',tooltip:'',enabled:false,order:1},{sourceType:'Hidden command',visible:false,order:0},{order:3}];
 control.setAttribute("toolbar-buttons",JSON.stringify(buttons));control.connectedCallback();
 const body=()=>/<div class="toolbar">(.*?)<\/div>/su.exec(control.shadowRoot.innerHTML)?.[1];
 let rendered=body();assert.equal((rendered.match(/<button /gu)??[]).length,3);assert.equal((rendered.match(/ disabled /gu)??[]).length,3);
 assert.ok(rendered.includes('data-button-source-type="Command &quot;&lt;A&gt;"'));assert.ok(rendered.includes('title="Inspect &quot;&lt;A&gt; &amp; B"'));assert.ok(rendered.includes('title=""'));assert.ok(rendered.includes('data-preview="configuration"'));assert.ok(rendered.includes('Configured toolbar button'));
 assert.ok(rendered.indexOf('data-configured-enabled="false"')<rendered.indexOf('data-configured-enabled="true"'));assert.ok(!rendered.includes('Hidden command'));assert.ok(!rendered.includes('onclick='));assert.deepEqual(JSON.parse(control.getAttribute("toolbar-buttons")),buttons);
 control.setAttribute("show-toolbar","false");assert.equal(body(),undefined);control.setAttribute("show-toolbar","true");assert.ok(body().includes('Command'));
 control.setAttribute("toolbar-buttons",JSON.stringify([{sourceType:"Hidden",visible:false}]));assert.ok(!body().includes('<button '));
});
for(const value of ["invalid","{}","[]","[null,3,\"text\"]"])test(`invalid or empty toolbar ${value} renders no configured buttons`,()=>{
 const control=new HmiTrendControl();control.setAttribute("toolbar-buttons",value);control.connectedCallback();assert.ok(!control.shadowRoot.innerHTML.includes('configured-toolbar-button"'));assert.equal(control.getAttribute("toolbar-buttons"),value);
});
