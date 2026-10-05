import assert from "node:assert/strict";
import test from "node:test";
import {HmiTrendControl,HmiTrendTimeAxis,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty} from "../dist/index.js";
test("Missing zero calendar and unknown base codes stay independent of derived units",async()=>{
 const control=new HmiTrendControl(),screen=new HmiScreen(),layer=new HmiLayer();layer.items.push(control);screen.layers.push(layer);const codes=[0,6,7,37,-2147483648,2147483647];control.timeAxes.push(new HmiTrendTimeAxis(),...codes.map(code=>Object.assign(new HmiTrendTimeAxis(),{timeRangeBaseCode:staticProperty(code),timeRangeFactor:staticProperty(2.5)})));
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen),attrs=[...html.matchAll(/<hmi-trend-control\b([^>]*)>/gu)].at(-1)[1];const axes=JSON.parse(attrs.match(/time-axes="([^"]*)"/u)[1].replace(/&quot;/gu,'"'));assert.equal(axes.length,7);assert.ok(!Object.hasOwn(axes[0],"timeRangeBaseCode"));for(const [index,code] of codes.entries()){const axis=axes[index+1];assert.equal(axis.timeRangeBaseCode,code);assert.equal(axis.timeRangeFactor,2.5);for(const key of ["timeRangeBaseMilliseconds","timeSpan","timeSpanUnit"])assert.ok(!Object.hasOwn(axis,key),key);}
});
