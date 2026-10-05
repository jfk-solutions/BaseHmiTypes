import assert from "node:assert/strict";
import test from "node:test";
import {HmiRecipe,HmiRecipeView,HmiRecipeViewElement,HmiRecipeToHtmlConverter,HmiMultilingualText} from "../dist/index.js";
for(const count of [0,1,2]) test(`Recipe view engineering tables count=${count}`,()=>{
 const recipe=new HmiRecipe();recipe.name="Recipe";
 if(count>0){const label=HmiMultilingualText.fromText("Default <A>");label.texts.set(1031,"Ansicht <A> & B");const view=Object.assign(new HmiRecipeView(),{name:"View <A>",sourceId:"17-1",sourceNumber:0,displayName:label,statement:"",displayNameReference:{sourceId:"17-2",name:"Label <A>"}});recipe.views.push(view);
 if(count>1){view.elements.push(Object.assign(new HmiRecipeViewElement(),{name:"Element <B>",sourceId:"17-3",sourceNumber:-1,displayName:label,targetElement:{sourceId:"17-9223372036854775807"}}));recipe.views.push(Object.assign(new HmiRecipeView(),{name:"Unknown view",statement:"X < 3 & Y > 1"}));}}
 const converter=new HmiRecipeToHtmlConverter(),html=converter.convert(recipe,1031);assert.equal(html.includes('<h2>Recipe views</h2>'),count>0);assert.equal(html.includes('<h2>Recipe view elements</h2>'),count>1);assert.equal(recipe.dataSets.length,0);assert.equal(recipe.parameters.length,0);
 if(count>0){for(const text of ["View &lt;A&gt;","Ansicht &lt;A&gt; &amp; B","Label &lt;A&gt;",'data-value-state="present">0</td>','data-value-state="present"></td>']) assert.ok(html.includes(text),text);assert.ok(converter.convert(recipe,1033).includes("Default &lt;A&gt;"));}
 if(count>1){for(const text of ["X &lt; 3 &amp; Y &gt; 1","Element &lt;B&gt;","17-9223372036854775807",'data-value-state="present">-1</td>','data-value-state="missing">Missing</td>']) assert.ok(html.includes(text),text);}
});
