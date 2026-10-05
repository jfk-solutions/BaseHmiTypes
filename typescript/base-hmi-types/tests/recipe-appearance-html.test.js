import assert from "node:assert/strict";
import test from "node:test";
import {HmiRecipeControl,HmiRecipeViewKind,HmiRecipeColumn,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,hmiColorFromArgb,getStaticValue} from "../dist/index.js";
for(const configured of [false,true]) for(const kind of [HmiRecipeViewKind.Selector,HmiRecipeViewKind.Table]) test(`Recipe button and text appearance ${configured} ${kind}`,async()=>{
 const control=new HmiRecipeControl();control.viewKind=kind;control.defaultRecipeName=staticProperty("Recipe <A> & B");control.showHeader=staticProperty(false);control.columnDefinitions.push(new HmiRecipeColumn());
 if(configured){
  control.buttonBackgroundColor=staticProperty(hmiColorFromArgb(0,1,2,3));
  control.buttonBorderBackgroundColor=staticProperty(hmiColorFromArgb(255,2,2,3));
  control.buttonBorderColor=staticProperty(hmiColorFromArgb(255,3,2,3));
  control.buttonFirstGradientColor=staticProperty(hmiColorFromArgb(255,4,2,3));
  control.buttonMiddleGradientColor=staticProperty(hmiColorFromArgb(255,5,2,3));
  control.buttonSecondGradientColor=staticProperty(hmiColorFromArgb(255,6,2,3));
  control.buttonBorderWidth=staticProperty(2.5);
  control.buttonCornerRadius=staticProperty(0);
  control.buttonEdgeStyle=staticProperty(-2147483648);
  control.buttonBackFillStyle=staticProperty(-2147483648);
  control.buttonFirstGradientOffset=staticProperty(-10);
  control.buttonSecondGradientOffset=staticProperty(120);
  control.useButtonFirstGradient=staticProperty(true);
  control.useButtonSecondGradient=staticProperty(true);
  control.textualObjectsBorderBackgroundColor=staticProperty(hmiColorFromArgb(255,15,2,3));
  control.textualObjectsBorderColor=staticProperty(hmiColorFromArgb(255,16,2,3));
  control.textualObjectsBorderWidth=staticProperty(0);
  control.textualObjectsCornerRadius=staticProperty(3);
  control.textualObjectsEdgeStyle=staticProperty(-2147483648);
 }
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const converter=new HmiScreenToHtmlConverter(),html=await converter.convertAsync(screen);
 for(const key of ["data-button-background-color=", "data-button-border-background-color=", "data-button-border-color=", "data-button-first-gradient-color=", "data-button-middle-gradient-color=", "data-button-second-gradient-color=", "data-button-border-width=", "data-button-corner-radius=", "data-button-edge-style=", "data-button-back-fill-style=", "data-button-first-gradient-offset=", "data-button-second-gradient-offset=", "data-use-button-first-gradient=", "data-use-button-second-gradient=", "data-textual-objects-border-background-color=", "data-textual-objects-border-color=", "data-textual-objects-border-width=", "data-textual-objects-corner-radius=", "data-textual-objects-edge-style="]) assert.equal(html.includes(key),configured,key);
 const preview=html.match(/data-button-preview-style="([^"]*)"/u)?.[1]??"";assert.equal(preview.length>0,configured);assert.equal(preview.includes("linear-gradient("),configured);assert.equal(html.includes("data-recipe-selector-text="),configured&&kind===HmiRecipeViewKind.Selector);
 if(configured){assert.ok(preview.includes("border-width: 2.5px;"));assert.ok(preview.includes("border-radius: 0px;"));assert.ok(html.includes('data-button-edge-style="-2147483648"'));assert.equal(getStaticValue(control.buttonFirstGradientOffset),-10);assert.equal(getStaticValue(control.buttonSecondGradientOffset),120);assert.equal(getStaticValue(control.buttonBackgroundColor)?.alpha,0);
 if(kind===HmiRecipeViewKind.Selector){const text=html.match(/<span data-recipe-selector-text="true"(.*?)<\/span>/u)?.[0]??"";assert.ok(text.includes("border-width: 0px;"));assert.ok(text.includes("border-radius: 3px;"));assert.ok(text.includes("Recipe &lt;A&gt; &amp; B"));assert.ok(!text.includes("linear-gradient("));}
 control.useButtonFirstGradient=staticProperty(false);control.useButtonSecondGradient=staticProperty(false);control.textualObjectsBorderWidth=staticProperty(-1);control.textualObjectsCornerRadius=staticProperty(-1);const disabled=await converter.convertAsync(screen);assert.ok(!disabled.match(/data-button-preview-style="([^"]*)"/u)?.[1].includes("linear-gradient("));const negative=disabled.match(/<span data-recipe-selector-text="true"(.*?)<\/span>/u)?.[0]??"";assert.ok(!negative.includes("border-width:"));assert.ok(!negative.includes("border-radius:"));assert.ok(disabled.includes('data-textual-objects-border-width="-1"'));}
});

test("Raw recipe button and text codes do not invent styles",async()=>{
 const control=new HmiRecipeControl();control.buttonBackFillStyle=staticProperty(0);control.buttonEdgeStyle=staticProperty(-7);control.textualObjectsEdgeStyle=staticProperty(2147483647);
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
 for(const value of ['data-button-back-fill-style="0"','data-button-edge-style="-7"','data-textual-objects-edge-style="2147483647"']) assert.ok(html.includes(value));assert.ok(!html.includes("data-button-preview-style="));assert.ok(!html.includes("data-recipe-selector-text="));
});
