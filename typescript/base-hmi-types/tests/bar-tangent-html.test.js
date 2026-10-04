import assert from "node:assert/strict";
import test from "node:test";
import {HmiBar,HmiBarValueMapping,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";
const coordinates=[[0,.25,.3105256773619622,.41349811010997795,1],[0,.4323634543204362,.5,.5676365456795637,1],[0,.586501889890022,.6894743226380378,.75,1]];
async function convert(bar){const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);return new HmiScreenToHtmlConverter().convertAsync(screen);}
function bar(properties){return Object.assign(new HmiBar(),Object.fromEntries(Object.entries(properties).map(([k,v])=>[k,staticProperty(v)])));}
function nearCss(html,property,expected){const match=html.match(new RegExp(`${property}: ([0-9.]+)%`));assert.ok(match,html);assert.ok(Math.abs(Number(match[1])-expected)<=.00051,`${match[1]} != ${expected}`);}
const fill=html=>html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";
for(let pivot=0;pivot<3;pivot++)for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])
for(let index=0;index<5;index++)for(const tagged of [false,true])for(const showScale of [false,true]){
 test("Tangent physical coordinates ("+[pivot,direction,index,tagged,showScale].join(",")+")",async()=>{
  const b=bar({beginValue:-50,endValue:150,originValue:0,value:-50+index*50,valueMapping:HmiBarValueMapping.Tangent,fillDirection:direction,showScale,divisionCount:4,subDivisionCount:2});
  b.tangentPivotPercent=tagged?tagProperty("Bar.Pivot",25+pivot*25):staticProperty(25+pivot*25);b.thresholds.push({value:staticProperty(-50+index*50)});
  const html=await convert(b),origin=coordinates[pivot][1]*100,value=coordinates[pivot][index]*100,edge=["bottom","top","right","left"][direction],vertical=direction<2;
  nearCss(fill(html),edge,Math.min(origin,value));nearCss(fill(html),vertical?"height":"width",Math.abs(origin-value));
  nearCss(html.match(/<span[^>]*data-hmi-bar-threshold[^>]*>/u)?.[0]??"",edge,value);
  if(showScale){const reverse=direction===0||direction===2,mark=String(Number((reverse?100-origin:origin).toFixed(3)));assert.ok(html.includes(`${vertical?"y1":"x1"}="${mark}%"`));assert.ok(html.includes("data-hmi-minor-tick"));}
  assert.equal(b.originValue.staticValue,0);assert.equal(b.tangentPivotPercent.staticValue,25+pivot*25);
 });
}
for(const noOrigin of [false,true])test("Omitted pivot uses normalized origin or midpoint ("+noOrigin+")",async()=>{
 const b=bar({beginValue:-50,endValue:150,value:50,valueMapping:HmiBarValueMapping.Tangent});if(!noOrigin)b.originValue=staticProperty(0);
 nearCss(fill(await convert(b)),"width",noOrigin?50:6.05256773619622);assert.equal(b.tangentPivotPercent,undefined);
});
for(const pivot of [0,100])for(const maximum of [false,true])test("Endpoint pivot uses finite continuous limit ("+[pivot,maximum]+")",async()=>{
 const f=fill(await convert(bar({beginValue:0,endValue:100,value:maximum?100:0,valueMapping:HmiBarValueMapping.Tangent,tangentPivotPercent:pivot})));
 assert.ok(!f.includes("NaN"));nearCss(f,"width",maximum?100:0);
});
for(const pivot of [NaN,Infinity,-Infinity])test("Invalid pivot keeps linear preview ("+pivot+")",async()=>{
 nearCss(fill(await convert(bar({beginValue:0,endValue:100,originValue:0,value:50,valueMapping:HmiBarValueMapping.Tangent,tangentPivotPercent:pivot}))),"width",50);
});
