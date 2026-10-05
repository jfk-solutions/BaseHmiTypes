import assert from "node:assert/strict";
import test from "node:test";
import { HmiRecipe,HmiRecipeParameter,HmiTextList,HmiTextListEntry,HmiTextListEntryReference,HmiRecipeToHtmlConverter } from "../dist/index.js";
for(const [mode,label] of [[0,"SingleValue"],[1,"Range"],[2,"To"],[3,"From"],[37,"37"],[-2147483648,"-2147483648"]]) test(`Recipe HTML preserves source reference and entry mode ${label} independently`,()=>{
  const recipe=new HmiRecipe(),list=Object.assign(new HmiTextList(),{defaultEntryReference:Object.assign(new HmiTextListEntryReference(),{sourceId:"17<&>",name:"Choice <A>"})});
  list.entries.push(Object.assign(new HmiTextListEntry(),{sourceId:"17-1<&>",entryType:mode,name:"Choice <A>",from:-3,to:7,default:true}),Object.assign(new HmiTextListEntry(),{sourceId:"17-2",name:"Choice <A>",from:4,to:9,default:false}));
  recipe.parameters.push(Object.assign(new HmiRecipeParameter(),{name:"Field",textList:list}));const renderer=new HmiRecipeToHtmlConverter();let html=renderer.convert(recipe);
  for(const text of ["Default entry source ID","Default entry name","Entry source ID","Entry mode","17&lt;&amp;&gt;","17-1&lt;&amp;&gt;","Choice &lt;A&gt;",`<td data-value-state="present">${label}</td>`,'<td data-value-state="present">-3</td><td data-value-state="present">7</td><td data-value-state="present">Yes</td>']) assert.ok(html.includes(text),text);
  assert.ok(html.includes('<td data-value-state="present">17-2</td><td data-value-state="missing">Missing</td>'));
  list.defaultEntryReference.name=undefined;html=renderer.convert(recipe);assert.ok(html.includes('<td data-value-state="present">17&lt;&amp;&gt;</td><td data-value-state="missing">Missing</td>'));
  assert.equal(list.entries[0].default,true);assert.equal(list.entries[1].default,false);assert.equal(list.entries[0].from,-3);assert.equal(list.entries[0].to,7);assert.equal(recipe.dataSets.length,0);
});
