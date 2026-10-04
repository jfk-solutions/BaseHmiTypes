import assert from "node:assert/strict";
import test from "node:test";
import {HmiBar,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty} from "../dist/index.js";
const cases=[[.125,2,false,"0.12"],[.375,2,false,"0.38"],[.625,2,false,"0.62"],[.875,2,false,"0.88"],[-.625,2,false,"-0.62"],
 [1.25,1,false,"1.2"],[1.35,1,false,"1.4"],[1.005,2,false,"1.00"],[2.675,2,false,"2.67"],[1.25,1,true,"1.2e+000"],[12.5,0,true,"1e+001"],[625,1,true,"6.2e+002"]];
for(let direction=0;direction<4;direction++)for(const [value,places,exponential,expected] of cases)for(const tagged of [false,true]){
 test("Exact double nearest-even bar label rounding ("+[direction,value,places,exponential,tagged]+")",async()=>{
  const bar=Object.assign(new HmiBar(),{beginValue:staticProperty(value),endValue:staticProperty(value+1),value:staticProperty(value),showScale:staticProperty(true),divisionCount:staticProperty(1),fillDirection:staticProperty(direction),
   tickLabelExponentialFormat:staticProperty(exponential),tickLabelDecimalPlaces:tagged?tagProperty("Bar.Decimals",places):staticProperty(places)});
  const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),scale=html.match(/<div[^>]*data-hmi-bar-scale[^>]*>(.*?)<\/div>/u)?.[1]??"";
  assert.ok(scale.includes(`<span>${expected}</span>`),scale);assert.equal(bar.beginValue.staticValue,value);
 });
}
