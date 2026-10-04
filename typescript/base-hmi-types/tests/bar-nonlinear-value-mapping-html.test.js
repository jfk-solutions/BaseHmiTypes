import assert from "node:assert/strict";
import test from "node:test";
import {HmiBar,HmiBarValueMapping,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";
const mappings=[1,2,5,6],coordinates=[[0,.7059613126314263,.8519443031609923,.9383792523906672,1],
 [0,.06162074760933278,.14805569683900766,.29403868736857375,1],[0,.0625,.25,.5625,1],[0,.015625,.125,.421875,1]];
async function convert(bar){const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);return new HmiScreenToHtmlConverter().convertAsync(screen);}
function createBar(){const bar=new HmiBar();bar.beginValue=staticProperty(-50);bar.endValue=staticProperty(150);return bar;}
function nearCss(html,property,expected){const match=html.match(new RegExp(`${property}: ([0-9.]+)%`));assert.ok(match,html);assert.ok(Math.abs(Number(match[1])-expected)<=.00051,`${match[1]} != ${expected}`);}
for(let mapping=0;mapping<4;mapping++)for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])
for(let index=0;index<5;index++)for(const tagged of [false,true])for(const showScale of [false,true]){
 test("Nonlinear physical coordinates ("+[mapping,direction,index,tagged,showScale].join(",")+")",async()=>{
  const bar=createBar();bar.originValue=staticProperty(0);bar.value=staticProperty(-50+index*50);bar.fillDirection=staticProperty(direction);
  bar.showScale=staticProperty(showScale);bar.divisionCount=staticProperty(4);bar.subDivisionCount=staticProperty(2);
  bar.valueMapping=tagged?tagProperty("Bar.Mapping",mappings[mapping]):staticProperty(mappings[mapping]);bar.thresholds.push({value:staticProperty(-50+index*50)});
  const html=await convert(bar),origin=coordinates[mapping][1]*100,value=coordinates[mapping][index]*100,edge=["bottom","top","right","left"][direction],vertical=direction<2;
  const fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";nearCss(fill,edge,Math.min(origin,value));nearCss(fill,vertical?"height":"width",Math.abs(origin-value));
  nearCss(html.match(/<span[^>]*data-hmi-bar-threshold[^>]*>/u)?.[0]??"",edge,value);
  if(showScale){const reverse=direction===0||direction===2,mark=String(Number((reverse?100-origin:origin).toFixed(3)));
   assert.ok(html.includes(`${vertical?"top":"left"}: ${mark}%;`));assert.ok(html.includes(`${vertical?"y1":"x1"}="${mark}%"`));assert.ok(html.includes("data-hmi-minor-tick"));}
  assert.equal(bar.beginValue.staticValue,-50);assert.equal(bar.endValue.staticValue,150);
 });
}
for(const mapping of mappings){
 test("Nonlinear bar without origin has a visible transformed fill ("+mapping+")",async()=>{
  const bar=createBar();bar.value=staticProperty(50);bar.valueMapping=staticProperty(mapping);const html=await convert(bar);
  assert.ok(html.includes("data-hmi-bar-origin-fill"));assert.equal(bar.originValue,undefined);assert.ok(html.includes('data-origin-value="-50"'));
 });
 for(const above of [false,true])test("Nonlinear process clipping ("+[mapping,above].join(",")+")",async()=>{
  const bar=createBar();bar.value=staticProperty(above?1e9:-1e9);bar.valueMapping=staticProperty(mapping);
  const fill=(await convert(bar)).match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";nearCss(fill,"width",above?100:0);
 });
}
assert.equal(HmiBarValueMapping.Cubic,6);
