import assert from 'node:assert/strict';
import test from 'node:test';
globalThis.HTMLElement=class {attributes=new Map();attachShadow(){return this.shadowRoot={innerHTML:''};}getAttribute(key){return this.attributes.get(key)??null;}setAttribute(key,value){this.attributes.set(key,value);this.attributeChangedCallback();}};
globalThis.customElements={define(){}};
const {HmiTrendCompanion}=await import('../dist/hmi-trend-companion.js');
test('companion shows only configured mode columns, escapes data and remains instance-local',()=>{
 const a=new HmiTrendCompanion(),b=new HmiTrendCompanion();
 const columns=[{mode:0,infoBlock:1,header:'Name <A>',width:100},{mode:0,infoBlock:7,name:'Value'},{mode:0,infoBlock:8,name:'Hidden',visible:false},{mode:2,infoBlock:10,name:'Minimum'}];
 for(const item of [a,b]){item.setAttribute('columns',JSON.stringify(columns));item.connectedCallback();assert.ok(item.shadowRoot.innerHTML.includes('No trend evaluation data'));}
 a.setAttribute('values',JSON.stringify([{values:{1:'<script>',7:42,8:'secret'}}]));let html=a.shadowRoot.innerHTML;
 assert.ok(html.includes('Name &lt;A&gt;'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('<td>42</td>'));assert.ok(!html.includes('secret'));assert.ok(!html.includes('Minimum'));assert.ok(b.shadowRoot.innerHTML.includes('No trend evaluation data'));
 a.setAttribute('mode','2');a.setAttribute('values',JSON.stringify([{values:{10:12.5}}]));html=a.shadowRoot.innerHTML;assert.ok(html.includes('Minimum'));assert.ok(html.includes('<td>12.5</td>'));assert.ok(!html.includes('Name &lt;A&gt;'));
 a.setAttribute('columns','[null,3,"bad"]');a.setAttribute('values','invalid');assert.ok(a.shadowRoot.innerHTML.includes('No trend evaluation data'));
});
