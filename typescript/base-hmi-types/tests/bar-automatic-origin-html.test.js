import assert from "node:assert/strict";
import test from "node:test";
import {HmiBar,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";
async function convert(bar){const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);return new HmiScreenToHtmlConverter().convertAsync(screen);}
function createBar(){const bar=new HmiBar();bar.beginValue=staticProperty(-60);bar.endValue=staticProperty(100);bar.originValue=staticProperty(20);bar.useAutoScaling=staticProperty(true);return bar;}
for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])
for(const position of [25,50,75])for(const value of [0,20,60])for(const tagged of [false,true])for(const showScale of [false,true]){
 test("Automatic bar coordinates fill/threshold/ticks ("+[direction,position,value,tagged,showScale].join(",")+")",async()=>{
  const bar=createBar();bar.beginValue=staticProperty(-20);bar.value=staticProperty(value);bar.fillDirection=staticProperty(direction);
  bar.showScale=staticProperty(showScale);bar.divisionCount=staticProperty(3);bar.subDivisionCount=staticProperty(2);
  bar.originPositionPercent=tagged?tagProperty("Bar.Position",position):staticProperty(position);bar.thresholds.push({value:staticProperty(value)});
  const html=await convert(bar),fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";
  const valuePosition=value<20?position/2:value===20?position:position+(100-position)/2;
  const start=Math.min(position,valuePosition),length=Math.abs(position-valuePosition),edge=["bottom","top","right","left"][direction],vertical=direction<2;
  assert.ok(fill.includes(`${edge}: ${start}%;`));assert.ok(fill.includes(`${vertical?"height":"width"}: ${length}%;`));
  const threshold=html.match(/<span[^>]*data-hmi-bar-threshold[^>]*>/u)?.[0]??"";assert.ok(threshold.includes(`${edge}: ${valuePosition}%;`));
  if(showScale){const reverse=direction===0||direction===2,displayed=reverse?100-position:position;
   assert.ok(html.includes(`${vertical?"top":"left"}: ${displayed}%;`));assert.ok(html.includes(`${vertical?"y1":"x1"}="${displayed}%"`));assert.ok(html.includes("data-hmi-minor-tick"));}
  assert.equal(bar.beginValue.staticValue,-20);assert.equal(bar.endValue.staticValue,100);assert.equal(bar.originPositionPercent.staticValue,position);
 });
}
for(const [position,minimum,maximum,start,length] of [[0,"20","100","0","50"],[100,"-60","20","50","50"]]){
 test("Automatic bar endpoint domain ("+position+")",async()=>{
  const bar=createBar();bar.originPositionPercent=staticProperty(position);bar.value=staticProperty(position===0?60:-20);bar.showScale=staticProperty(true);
  const html=await convert(bar);assert.ok(html.includes(`min="${minimum}" max="${maximum}"`));
  const fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";assert.ok(fill.includes(`left: ${start}%; width: ${length}%;`));
 });
}
for(const [position,enabled] of [[-1,true],[101,true],[NaN,true],[Infinity,true],[25,false]]){
 test("Automatic bar invalid/disabled fallback ("+[position,enabled].join(",")+")",async()=>{
  const bar=createBar();bar.originPositionPercent=staticProperty(position);bar.useAutoScaling=staticProperty(enabled);bar.value=staticProperty(-20);
  const fill=(await convert(bar)).match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";assert.ok(fill.includes("left: 25%; width: 25%;"));
 });
}
