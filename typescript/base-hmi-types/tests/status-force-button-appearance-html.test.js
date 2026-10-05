import assert from "node:assert/strict";
import test from "node:test";
import { HmiStatusForceControl, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, hmiColorFromArgb, getStaticValue } from "../dist/index.js";

test("Status-force button appearance is optional and retains source values",async()=>{
 const control=new HmiStatusForceControl();control.name="Status <A> & B";control.headerBackgroundColor=staticProperty(hmiColorFromArgb(255,1,2,3));
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const renderer=new HmiScreenToHtmlConverter();
 const sample=html=>/<div data-appearance-sample="button"[^>]*>.*?<\/div>/u.exec(html)?.[0]??"";
 assert.equal(sample(await renderer.convertAsync(screen)),"");
 control.buttonBackgroundColor=staticProperty(hmiColorFromArgb(0,17,34,51));
 for(const [key,values] of [["buttonBorderBackgroundColor",[21,22,23]],["buttonBorderColor",[31,32,33]],["buttonFirstGradientColor",[41,42,43]],["buttonMiddleGradientColor",[51,52,53]],["buttonSecondGradientColor",[61,62,63]]])control[key]=staticProperty(hmiColorFromArgb(255,...values));
 control.buttonBorderWidth=staticProperty(0);control.buttonCornerRadius=staticProperty(0);control.buttonEdgeStyle=staticProperty(-2147483648);control.buttonBackFillStyle=staticProperty(-7);
 control.buttonFirstGradientOffset=staticProperty(-10);control.buttonSecondGradientOffset=staticProperty(120);control.useButtonFirstGradient=staticProperty(true);control.useButtonSecondGradient=staticProperty(true);
 const html=await renderer.convertAsync(screen);let s=sample(html);
 for(const value of ["Status &lt;A&gt; &amp; B","Status/force data not loaded","background-color: #010203;"])assert.ok(html.includes(value),value);
 for(const key of ["button-background-color","button-border-background-color","button-border-color","button-border-width","button-corner-radius","button-edge-style","button-back-fill-style","button-first-gradient-color","button-middle-gradient-color","button-second-gradient-color","button-first-gradient-offset","button-second-gradient-offset","use-button-first-gradient","use-button-second-gradient"])assert.ok(s.includes(`data-${key}=`),key);
 for(const value of ['data-preview="appearance"','data-button-edge-style="-2147483648"',"border-color: #1F2021;","border-width: 0px;","border-radius: 0px;","linear-gradient(","Status/force button appearance preview"])assert.ok(s.includes(value),value);
 assert.ok(!s.includes("<button"));assert.ok(!s.includes("onclick="));assert.equal(getStaticValue(control.buttonFirstGradientOffset),-10);assert.equal(getStaticValue(control.buttonSecondGradientOffset),120);
 control.useButtonFirstGradient=staticProperty(false);control.useButtonSecondGradient=staticProperty(false);s=sample(await renderer.convertAsync(screen));assert.ok(!s.includes("linear-gradient("));assert.ok(s.includes("background-color: rgba(17,34,51,0);"));
 for(const width of [-1,NaN,Infinity]){control.buttonBorderWidth=staticProperty(width);control.buttonCornerRadius=staticProperty(-1);s=sample(await renderer.convertAsync(screen));assert.ok(!s.includes("border-width:"));assert.ok(!s.includes("border-radius:"));}
 delete control.buttonBackgroundColor;delete control.buttonFirstGradientColor;delete control.buttonMiddleGradientColor;delete control.buttonSecondGradientColor;
 s=sample(await renderer.convertAsync(screen));assert.ok(s.includes('data-button-back-fill-style="-7"'));assert.ok(s.includes('data-button-border-background-color='));assert.ok(!s.includes("background-color:"));
 const flagsOnly=new HmiStatusForceControl();flagsOnly.useButtonFirstGradient=staticProperty(false);layer.items.splice(0,1,flagsOnly);assert.ok(sample(await renderer.convertAsync(screen)).includes('data-use-button-first-gradient="false"'));
});
