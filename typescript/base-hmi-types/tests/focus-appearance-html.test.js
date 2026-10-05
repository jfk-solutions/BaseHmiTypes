import assert from "node:assert/strict";
import test from "node:test";
import {HmiRecipeControl,HmiTrendControl,HmiButton,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,hmiColorFromArgb} from "../dist/index.js";

for(const type of [HmiRecipeControl,HmiTrendControl,HmiButton]) test(`${type.name} renders configured focus without changing tab order`,async()=>{
 const item=new type();item.name="FocusPreview";item.tabIndex=staticProperty(7);
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const renderer=new HmiScreenToHtmlConverter();
 const attributes=async()=>/<[^>]*id="FocusPreview"[^>]*>/u.exec(await renderer.convertAsync(screen))[0];
 item.focusColor=staticProperty(hmiColorFromArgb(0,17,34,51));item.focusWidth=staticProperty(0);
 const configured=await attributes();for(const text of ['tabindex="7"','data-hmi-focus-appearance="true"','--hmi-focus-color: rgba(17,34,51,0);','--hmi-focus-width: 0px;'])assert.ok(configured.includes(text),text);
 assert.ok(!configured.includes("outline:"));delete item.focusColor;
 for(const width of [-1,NaN,Infinity]){item.focusWidth=staticProperty(width);const invalid=await attributes();assert.ok(!invalid.includes("data-hmi-focus-appearance="));assert.ok(!invalid.includes("--hmi-focus-width:"));}
 item.focusWidth=staticProperty(2.5);assert.ok((await attributes()).includes("--hmi-focus-width: 2.5px;"));
 delete item.focusWidth;delete item.tabIndex;const missing=await attributes();assert.ok(!missing.includes("data-focus-"));assert.ok(!missing.includes("tabindex="));
 const html=await renderer.convertAsync(screen);assert.ok(html.includes("[data-hmi-focus-appearance]:focus-visible"));assert.ok(html.includes("var(--hmi-focus-width,1px)"));
 assert.ok(html.includes("--hmi-focus-color:currentColor"));assert.ok(html.includes("--hmi-focus-width:1px"));
});
