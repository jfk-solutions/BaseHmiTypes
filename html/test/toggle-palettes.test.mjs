import assert from 'node:assert/strict';
import test from 'node:test';
// Execute the component with a DOM stub; this checks generated markup/CSS, not browser pixels.
globalThis.HTMLElement=class { attachShadow(){return this.shadowRoot={innerHTML:''};} };
globalThis.customElements={define(){}};
const {HmiToggleSwitch}=await import('../dist/hmi-toggle-switch.js');
test('Switch track and header consume distinct colors across checked transitions',()=>{
  const item=new HmiToggleSwitch();item.header=true;item.connectedCallback();
  assert.match(item.shadowRoot.innerHTML,/color: var\(--hmi-toggle-header-foreground, inherit\)/);
  assert.match(item.shadowRoot.innerHTML,/background: var\(--hmi-toggle-off-background, linear-gradient/);
  item.checked=true;
  assert.match(item.shadowRoot.innerHTML,/background: var\(--hmi-toggle-on-background, linear-gradient/);
  assert.match(item.shadowRoot.innerHTML,/class="switch checked"/);
  item.checked=false;assert.match(item.shadowRoot.innerHTML,/background: var\(--hmi-toggle-off-background, linear-gradient/);
  assert.match(item.shadowRoot.innerHTML,/background: linear-gradient\(90deg, #5d6472, #747b89\)/);
});
for(const mode of ['TextSwitchButton','GraphicSwitchButton'])test(`Switch track does not change button layout: ${mode}`,()=>{
  const item=new HmiToggleSwitch();item.mode=mode;item.connectedCallback();assert.match(item.shadowRoot.innerHTML,/class="button"/);assert.doesNotMatch(item.shadowRoot.innerHTML,/class="body"/);
});
