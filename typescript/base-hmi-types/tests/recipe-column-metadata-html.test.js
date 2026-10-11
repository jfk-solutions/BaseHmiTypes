import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiRecipeControl,HmiRecipeColumn,HmiRecipeViewKind,HmiRecipeColumnType,HmiMultilingualText,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,tagProperty,expressionProperty,getStaticValue} from '../dist/index.js';
for(const expression of ['', 'Width <&>'])test(`Width expressions and invalid fallbacks remain metadata: ${expression}`,async()=>{
  const control=Object.assign(new HmiRecipeControl(),{viewKind:HmiRecipeViewKind.Table});control.columnDefinitions.push(Object.assign(new HmiRecipeColumn(),{width:expressionProperty(expression,NaN)}));
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),row=html.match(/<div hidden data-recipe-column-definition[^>]*>/)?.[0]??'';
  assert.ok(row.includes(expression.length===0?'data-column-width="NaN"':'data-column-width="Width &lt;&amp;&gt;"'),row);assert.ok(Number.isNaN(getStaticValue(control.columnDefinitions[0].width)));
  assert.ok(!html.split('<table')[1].split('</table>')[0].includes('width: NaNpx'));
});
for(const kind of [HmiRecipeViewKind.Table,HmiRecipeViewKind.Selector])for(const headings of [false,true])test(`All configured columns remain ordered and independent of visible layout: ${kind}/${headings}`,async()=>{
  const control=Object.assign(new HmiRecipeControl(),{name:'RecipeColumns',viewKind:kind,showHeader:staticProperty(headings)});
  const label=HmiMultilingualText.fromText('English',1033);label.texts.set(1031,'Feld <&>');
  control.columnDefinitions.push(Object.assign(new HmiRecipeColumn(),{type:HmiRecipeColumnType.Unknown,sourceType:'Raw <&>"',width:tagProperty('Recipe.Width',0),headerText:label}),
    Object.assign(new HmiRecipeColumn(),{type:HmiRecipeColumnType.Unknown,sourceType:'Raw <&>"',visible:staticProperty(false),width:staticProperty(-4),headerText:HmiMultilingualText.fromText('Hidden column')}),
    Object.assign(new HmiRecipeColumn(),{type:HmiRecipeColumnType.Unit,sourceType:'',visible:staticProperty(true),width:staticProperty(NaN),headerText:HmiMultilingualText.fromText('')}),Object.assign(new HmiRecipeColumn(),{type:HmiRecipeColumnType.TagName,sourceType:' '}));
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const renderer=new HmiScreenToHtmlConverter();
  const convert=async()=> (await renderer.convertAsync(screen,undefined,{cultureLcid:1031})).replace(/<script\b[^>]*>.*?<\/script>/gs,'');
  let html=await convert();const rows=html.match(/<div hidden data-recipe-column-definition[^>]*>/g)??[];assert.equal(rows.length,4);rows.forEach((row,i)=>assert.ok(row.includes(`data-column-index="${i}"`)));
  for(const text of ['data-source-type="Raw &lt;&amp;&gt;&quot;"','data-column-width="0"','data-header-text="Feld &lt;&amp;&gt;"'])assert.ok(rows[0].includes(text),rows[0]);assert.ok(!rows[0].includes('data-column-visible='));
  for(const text of ['data-column-visible="false"','data-column-width="-4"','data-header-text="Hidden column"'])assert.ok(rows[1].includes(text),rows[1]);
  for(const text of ['data-source-type=""','data-header-text=""','data-column-visible="true"','data-column-width="NaN"'])assert.ok(rows[2].includes(text),rows[2]);
  assert.ok(rows[3].includes('data-source-type=" "'));assert.ok(!rows[3].includes('data-column-width='));assert.ok(!rows[3].includes('data-header-text='));
  if(kind===HmiRecipeViewKind.Table){const table=html.split('<table')[1].split('</table>')[0];assert.equal((table.match(/<col\b/g)??[]).length,3);assert.equal(table.includes('<thead>'),headings);assert.ok(!table.includes('Hidden column'));assert.ok(table.includes('Recipe data not loaded'));}else assert.ok(!html.includes('<table'));
  assert.equal(control.columnDefinitions.length,4);assert.equal(getStaticValue(control.columnDefinitions[1].width),-4);assert.equal(control.columnDefinitions[0].sourceType,'Raw <&>"');assert.equal(control.columnDefinitions[0].width.tagName,'Recipe.Width');
  control.columnDefinitions.length=0;html=await convert();assert.ok(!html.includes('data-recipe-column-definition'));
});
