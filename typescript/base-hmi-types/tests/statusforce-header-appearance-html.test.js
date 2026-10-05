import assert from "node:assert/strict";
import test from "node:test";
import { HmiStatusForceControl, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, hmiColorFromArgb } from "../dist/index.js";
import { getStaticValue } from "../dist/index.js";

test("StatusForce header gradients and raw font sizes",async()=>{
 const item=new HmiStatusForceControl();item.name="Table <A> & B";item.headerFontReferenceDeviceSize=staticProperty(123);item.contentFontReferenceDeviceSize=staticProperty(124);
 item.headerBackgroundColor=staticProperty(hmiColorFromArgb(0,17,34,51));item.headerBorderBackgroundColor=staticProperty(hmiColorFromArgb(255,21,22,23));
 item.headerCornerRadius=staticProperty(0);item.headerBackFillStyle=staticProperty(-7);item.headerEdgeStyle=staticProperty(-2147483648);
 item.headerFirstGradientColor=staticProperty(hmiColorFromArgb(255,31,32,33));item.headerMiddleGradientColor=staticProperty(hmiColorFromArgb(255,41,42,43));item.headerSecondGradientColor=staticProperty(hmiColorFromArgb(255,51,52,53));
 item.headerFirstGradientOffset=staticProperty(-10);item.headerSecondGradientOffset=staticProperty(120);item.useHeaderFirstGradient=staticProperty(true);item.useHeaderSecondGradient=staticProperty(true);
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const renderer=new HmiScreenToHtmlConverter();
 const header=html=>/<th style="(.*?)<\/th>/u.exec(html)?.[0]??"";
 layer.items.splice(0,1,new HmiStatusForceControl());assert.ok(!(await renderer.convertAsync(screen)).includes('data-header-corner-radius='));layer.items.splice(0,1,item);
 const html=await renderer.convertAsync(screen);assert.ok(html.includes("Table &lt;A&gt; &amp; B"));
 assert.ok(html.includes('data-header-font-reference-device-size="123"'));assert.ok(html.includes('data-content-font-reference-device-size="124"'));assert.ok(!html.includes('font-size: 123px'));assert.ok(!html.includes('font-size: 124px'));
 for(const key of ["header-border-background-color","header-corner-radius","header-back-fill-style","header-edge-style","header-first-gradient-color","header-middle-gradient-color","header-second-gradient-color","header-first-gradient-offset","header-second-gradient-offset","use-header-first-gradient","use-header-second-gradient"]) assert.ok(html.includes(`data-${key}=`),key);
 assert.ok(html.includes('data-header-edge-style="-2147483648"'));assert.equal(header(html).includes("linear-gradient("),true);assert.equal(header(html).includes("border-radius: 0px;"),true);
 assert.equal(getStaticValue(item.headerFirstGradientOffset),-10);assert.equal(getStaticValue(item.headerSecondGradientOffset),120);
 item.useHeaderFirstGradient=staticProperty(false);item.useHeaderSecondGradient=staticProperty(false);
 const disabled=header(await renderer.convertAsync(screen));assert.ok(!disabled.includes("linear-gradient("));assert.ok(disabled.includes("background-color: rgba(17,34,51,0);"));
 for(const radius of [-1,NaN,Infinity]){item.headerCornerRadius=staticProperty(radius);assert.ok(!header(await renderer.convertAsync(screen)).includes("border-radius:"));}
 delete item.headerBackgroundColor;delete item.headerFirstGradientColor;delete item.headerMiddleGradientColor;delete item.headerSecondGradientColor;
 const codes=await renderer.convertAsync(screen);assert.ok(codes.includes('data-header-back-fill-style="-7"'));assert.ok(codes.includes("data-header-border-background-color="));assert.ok(!header(codes).includes("background-color:"));
});
