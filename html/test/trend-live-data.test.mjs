import test from 'node:test';import assert from 'node:assert/strict';
globalThis.HTMLElement=class{attributes=new Map();attachShadow(){return this.shadowRoot={innerHTML:''};}getAttribute(n){return this.attributes.get(n)??null;}hasAttribute(n){return this.attributes.has(n);}setAttribute(n,v){const old=this.getAttribute(n);this.attributes.set(n,String(v));if(this.constructor.observedAttributes.includes(n))this.attributeChangedCallback(n,old,String(v));}};
globalThis.customElements={define(){}};globalThis.getComputedStyle=()=>({backgroundColor:'#ffffff',color:'#111111',borderTopColor:'#111111',borderTopWidth:'0'});
const {HmiTrendControl}=await import('../dist/hmi-trend-control.js');
test('runtime trends draw supplied measurements and never fall back to generated samples',()=>{
 const control=new HmiTrendControl();control.setAttribute('pens',JSON.stringify([{number:1,name:'Measured',minimum:0,maximum:10}]));control.setAttribute('runtime-data',JSON.stringify({from:1000,to:2000,series:[{number:1,points:[{time:1000,value:0},{time:2000,value:10}]}]}));control.connectedCallback();
 assert.ok(control.shadowRoot.innerHTML.includes('points="0,100 100,0"'));assert.ok(control.shadowRoot.innerHTML.includes('data-trend-action="19"'));
 control.setAttribute('toolbar-buttons',JSON.stringify([{controlId:19,enabled:false},{sourceType:'Unrecognized command'}]));assert.ok(control.shadowRoot.innerHTML.includes('data-trend-action="19" disabled'));assert.ok(!control.shadowRoot.innerHTML.includes('data-trend-action="6"'));
 control.setAttribute('runtime-data',JSON.stringify({from:1000,to:2000,series:[]}));assert.ok(control.shadowRoot.innerHTML.includes('No trend data'));assert.ok(!control.shadowRoot.innerHTML.includes('data-pen-number="1"'));
 control.setAttribute('runtime-data','invalid');assert.ok(control.shadowRoot.innerHTML.includes('No trend data'));assert.ok(!control.shadowRoot.innerHTML.includes('data-pen-number="1"'));
});
test('runtime trend quality gaps do not draw a connecting curve',()=>{
 const control=new HmiTrendControl();control.setAttribute('pens',JSON.stringify([{number:1,minimum:0,maximum:10}]));control.setAttribute('runtime-data',JSON.stringify({from:1000,to:2000,series:[{number:1,points:[{time:1000,value:0},{time:1500,value:null,quality:'bad'},{time:2000,value:10}]}]}));control.connectedCallback();
 assert.ok(!control.shadowRoot.innerHTML.includes('points="0,100 100,0"'));assert.ok(control.shadowRoot.innerHTML.includes('<circle cx="0"'));assert.ok(control.shadowRoot.innerHTML.includes('<circle cx="100"'));
});
