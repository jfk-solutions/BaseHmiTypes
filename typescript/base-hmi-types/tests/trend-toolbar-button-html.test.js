import assert from "node:assert/strict";
import test from "node:test";
import { HmiTrendControl,HmiFunctionTrendControl,HmiTrendToolbarButton,HmiMultilingualText,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty } from "../dist/index.js";
for(const type of [HmiTrendControl,HmiFunctionTrendControl])test(`${type.name} keeps hidden toolbar entries and absent properties`,async()=>{
 const control=new type();control.showToolbar=staticProperty(false);
 const button=new HmiTrendToolbarButton();button.sourceType="Command <A> & B";button.enabled=staticProperty(false);button.order=staticProperty(0);button.tooltip=HmiMultilingualText.fromText("");
 const hidden=new HmiTrendToolbarButton();hidden.sourceType="Unknown command";hidden.visible=staticProperty(false);hidden.order=staticProperty(-2147483648);
 control.toolbarButtons.push(button,hidden,new HmiTrendToolbarButton());
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const renderer=new HmiScreenToHtmlConverter();
 const attributes=html=>[...html.matchAll(/<hmi-trend-control\b([^>]*)>/gu)].at(-1)[1];const rendered=attributes(await renderer.convertAsync(screen));assert.ok(rendered.includes('show-toolbar="false"'));
 const wire=/toolbar-buttons="([^"]*)"/u.exec(rendered)[1].replaceAll("&quot;",'"').replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&amp;","&");
 assert.deepEqual(JSON.parse(wire),[{sourceType:"Command <A> & B",enabled:false,order:0,tooltip:""},{sourceType:"Unknown command",visible:false,order:-2147483648},{}]);
 control.toolbarButtons.length=0;assert.ok(!attributes(await renderer.convertAsync(screen)).includes("toolbar-buttons="));
});
