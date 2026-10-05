import assert from "node:assert/strict";
import test from "node:test";
import {HmiNcPartProgramControl,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,HmiFont,staticProperty,hmiColorFromArgb,getStaticValue} from "../dist/index.js";
for(const configured of [false,true]) test(`NC program appearance metadata configured=${configured}`,async()=>{
 const control=new HmiNcPartProgramControl();control.name="Program <A> & B";control.resizable=staticProperty(configured);
 if(configured){
  control.listBackgroundColor=staticProperty(hmiColorFromArgb(0,1,2,3));
  control.listForegroundColor=staticProperty(hmiColorFromArgb(255,2,2,3));
  control.selectionBackgroundColor=staticProperty(hmiColorFromArgb(255,3,2,3));
  control.selectionForegroundColor=staticProperty(hmiColorFromArgb(255,4,2,3));
  control.alternatingRowBackgroundColor=staticProperty(hmiColorFromArgb(255,5,2,3));
  control.gridLineColor=staticProperty(hmiColorFromArgb(255,6,2,3));
  control.showGridLines=staticProperty(true);
  control.buttonBackgroundColor=staticProperty(hmiColorFromArgb(255,8,2,3));
  control.buttonBorderBackgroundColor=staticProperty(hmiColorFromArgb(255,9,2,3));
  control.buttonBorderColor=staticProperty(hmiColorFromArgb(255,10,2,3));
  control.buttonFirstGradientColor=staticProperty(hmiColorFromArgb(255,11,2,3));
  control.buttonMiddleGradientColor=staticProperty(hmiColorFromArgb(255,12,2,3));
  control.buttonSecondGradientColor=staticProperty(hmiColorFromArgb(255,13,2,3));
  control.buttonBorderWidth=staticProperty(2.5);
  control.buttonCornerRadius=staticProperty(0);
  control.buttonEdgeStyle=staticProperty(-7);
  control.buttonBackFillStyle=staticProperty(-7);
  control.buttonFirstGradientOffset=staticProperty(-10);
  control.buttonSecondGradientOffset=staticProperty(120);
  control.useButtonFirstGradient=staticProperty(true);
  control.useButtonSecondGradient=staticProperty(true);
  control.textualObjectsBorderBackgroundColor=staticProperty(hmiColorFromArgb(255,22,2,3));
  control.textualObjectsBorderColor=staticProperty(hmiColorFromArgb(255,23,2,3));
  control.textualObjectsBorderWidth=staticProperty(2.5);
  control.textualObjectsCornerRadius=staticProperty(-3);
  control.textualObjectsEdgeStyle=staticProperty(-7);
  control.contentFont=new HmiFont();control.contentFont.name=staticProperty("Preview Serif");control.contentFont.size=staticProperty(13);
 }
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
 assert.ok(html.includes("Program &lt;A&gt; &amp; B"));assert.ok(html.includes("NC program data not decoded"));assert.ok(html.includes('data-preview="appearance"'));
 for(const key of ["data-list-background-color=", "data-list-foreground-color=", "data-selection-background-color=", "data-selection-foreground-color=", "data-alternating-row-background-color=", "data-grid-line-color=", "data-show-grid-lines=", "data-button-background-color=", "data-button-border-background-color=", "data-button-border-color=", "data-button-first-gradient-color=", "data-button-middle-gradient-color=", "data-button-second-gradient-color=", "data-button-border-width=", "data-button-corner-radius=", "data-button-edge-style=", "data-button-back-fill-style=", "data-button-first-gradient-offset=", "data-button-second-gradient-offset=", "data-use-button-first-gradient=", "data-use-button-second-gradient=", "data-textual-objects-border-background-color=", "data-textual-objects-border-color=", "data-textual-objects-border-width=", "data-textual-objects-corner-radius=", "data-textual-objects-edge-style="]) assert.equal(html.includes(key),configured,key);
 assert.equal(html.includes("overflow: hidden;resize: both;"),configured);
 for(const kind of ["list","selection","alternate","button","text"]) assert.equal([...html.matchAll(new RegExp(`data-appearance="${kind}"`,"gu"))].length,1);
 const button=html.match(/<div data-appearance="button"(.*?)<\/div>/u)?.[0]??"",text=html.match(/<div data-appearance="text"(.*?)<\/div>/u)?.[0]??"";
 assert.equal(button.includes("linear-gradient("),configured);assert.ok(!text.includes("border-radius:"));
 if(configured){assert.ok(button.includes("border-radius: 0px;"));assert.ok(button.includes("border-width: 2.5px;"));assert.ok(html.includes("font-family: Preview Serif;"));assert.ok(html.includes('data-button-edge-style="-7"'));assert.equal(getStaticValue(control.buttonFirstGradientOffset),-10);assert.equal(getStaticValue(control.buttonSecondGradientOffset),120);assert.equal(getStaticValue(control.listBackgroundColor)?.alpha,0);
 control.useButtonFirstGradient=staticProperty(false);control.useButtonSecondGradient=staticProperty(false);const disabled=await new HmiScreenToHtmlConverter().convertAsync(screen);assert.ok(!disabled.match(/<div data-appearance="button"(.*?)<\/div>/u)?.[0].includes("linear-gradient("));}
});
