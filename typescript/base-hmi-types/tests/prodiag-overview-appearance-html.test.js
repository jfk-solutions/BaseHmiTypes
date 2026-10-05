import { withoutRuntimeScripts } from "./html-test-markup.js";
import assert from "node:assert/strict";
import test from "node:test";
import {HmiProcessDiagnosisOverviewControl,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,HmiFont,staticProperty,hmiColorFromArgb,getStaticValue} from "../dist/index.js";
for(const configured of [false,true]) test(`ProDiag overview appearance metadata configured=${configured}`,async()=>{
 const control=new HmiProcessDiagnosisOverviewControl();control.name="Overview <A> & B";control.resizable=staticProperty(configured);
 if(configured){
  control.headerBackgroundColor=staticProperty(hmiColorFromArgb(0,1,2,3));
  control.headerForegroundColor=staticProperty(hmiColorFromArgb(255,2,2,3));
  control.contentBackgroundColor=staticProperty(hmiColorFromArgb(255,3,2,3));
  control.contentForegroundColor=staticProperty(hmiColorFromArgb(255,4,2,3));
  control.outputGridLineColor=staticProperty(hmiColorFromArgb(255,5,2,3));
  control.outputLabelForegroundColor=staticProperty(hmiColorFromArgb(255,6,2,3));
  control.errorIconBackgroundColor=staticProperty(hmiColorFromArgb(255,7,2,3));
  control.infoIconBackgroundColor=staticProperty(hmiColorFromArgb(255,8,2,3));
  control.toolbarBackgroundColor=staticProperty(hmiColorFromArgb(255,9,2,3));
  control.useToolbarBackgroundColor=staticProperty(true);
  control.showMessageViewButton=staticProperty(false);
  control.buttonBackgroundColor=staticProperty(hmiColorFromArgb(255,12,2,3));
  control.buttonBorderBackgroundColor=staticProperty(hmiColorFromArgb(255,13,2,3));
  control.buttonBorderColor=staticProperty(hmiColorFromArgb(255,14,2,3));
  control.buttonFirstGradientColor=staticProperty(hmiColorFromArgb(255,15,2,3));
  control.buttonMiddleGradientColor=staticProperty(hmiColorFromArgb(255,16,2,3));
  control.buttonSecondGradientColor=staticProperty(hmiColorFromArgb(255,17,2,3));
  control.buttonBorderWidth=staticProperty(2.5);
  control.buttonCornerRadius=staticProperty(0);
  control.buttonEdgeStyle=staticProperty(-7);
  control.buttonBackFillStyle=staticProperty(-7);
  control.buttonFirstGradientOffset=staticProperty(-10);
  control.buttonSecondGradientOffset=staticProperty(120);
  control.useButtonFirstGradient=staticProperty(true);
  control.useButtonSecondGradient=staticProperty(true);
  control.headerFont=new HmiFont();control.headerFont.name=staticProperty("Preview Header");control.headerFont.size=staticProperty(11);
  control.contentFont=new HmiFont();control.contentFont.name=staticProperty("Preview Content");control.contentFont.size=staticProperty(13);
 }
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
 assert.ok(html.includes("Overview &lt;A&gt; &amp; B"));assert.ok(html.includes("Process diagnosis data not loaded"));assert.ok(html.includes('data-preview="appearance"'));
 for(const key of ["data-header-background-color=","data-header-foreground-color=","data-content-background-color=","data-content-foreground-color=","data-output-grid-line-color=","data-output-label-foreground-color=","data-error-icon-background-color=","data-info-icon-background-color=","data-toolbar-background-color=","data-use-toolbar-background-color=","data-show-message-view-button=","data-button-background-color=","data-button-border-background-color=","data-button-border-color=","data-button-first-gradient-color=","data-button-middle-gradient-color=","data-button-second-gradient-color=","data-button-border-width=","data-button-corner-radius=","data-button-edge-style=","data-button-back-fill-style=","data-button-first-gradient-offset=","data-button-second-gradient-offset=","data-use-button-first-gradient=","data-use-button-second-gradient="]) assert.equal(html.includes(key),configured,key);
 for(const kind of ["header","output","output-label","error-icon","info-icon","toolbar","button"]) assert.equal([...html.matchAll(new RegExp(`data-appearance-sample="${kind}"`,"gu"))].length,1);
 const sample=(source,kind)=>new RegExp(`<div data-appearance-sample="${kind}"(.*?)</div>`,"u").exec(source)?.[0]??"";
 const button=sample(html,"button");assert.equal(button.includes("linear-gradient("),configured);assert.ok(!withoutRuntimeScripts(html).includes("<button"));
 if(configured){
  for(const [kind,css] of [["header","background-color: rgba(1,2,3,0);"],["header","color: #020203;"],["header","font-family: Preview Header;"],["output","background-color: #030203;"],["output","color: #040203;"],["output","border-bottom-color: #050203;"],["output","font-family: Preview Content;"],["output-label","color: #060203;"],["error-icon","background-color: #070203;"],["info-icon","background-color: #080203;"],["toolbar","background-color: #090203;"]]) assert.ok(sample(html,kind).includes(css),`${kind}: ${css}`);
  assert.ok(button.includes("border-radius: 0px;"));assert.ok(button.includes("border-width: 2.5px;"));
  assert.ok(html.includes('data-show-message-view-button="false"'));assert.ok(html.includes('data-button-edge-style="-7"'));
  assert.equal(getStaticValue(control.buttonFirstGradientOffset),-10);assert.equal(getStaticValue(control.buttonSecondGradientOffset),120);
  control.useButtonFirstGradient=staticProperty(false);control.useButtonSecondGradient=staticProperty(false);control.useToolbarBackgroundColor=staticProperty(false);control.showMessageViewButton=staticProperty(true);
  const disabled=await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(!sample(disabled,"button").includes("linear-gradient("));assert.ok(!sample(disabled,"toolbar").includes("background-color:"));
  assert.ok(disabled.includes('data-toolbar-background-color="#090203"'));assert.ok(disabled.includes('data-show-message-view-button="true"'));
  delete control.useToolbarBackgroundColor;
  assert.ok(sample(await new HmiScreenToHtmlConverter().convertAsync(screen),"toolbar").includes("background-color: #090203;"));
  control.buttonCornerRadius=staticProperty(-3);
  for(const width of [-1,NaN,Infinity]){control.buttonBorderWidth=staticProperty(width);const invalid=sample(await new HmiScreenToHtmlConverter().convertAsync(screen),"button");assert.ok(!invalid.includes("border-width:"));assert.ok(!invalid.includes("border-radius:"));}
  delete control.buttonBackgroundColor; delete control.buttonBorderColor;
  delete control.buttonFirstGradientColor; delete control.buttonMiddleGradientColor; delete control.buttonSecondGradientColor;
  delete control.buttonBorderWidth; delete control.buttonCornerRadius;
  const codesOnly = await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(codesOnly.includes("data-button-border-background-color=")); assert.ok(codesOnly.includes('data-button-back-fill-style="-7"'));
  const codeSample = sample(codesOnly, "button");
  assert.ok(!codeSample.includes("background-color:")); assert.ok(!codeSample.includes("linear-gradient(")); assert.ok(!codeSample.includes("border-style:"));
 }
});
