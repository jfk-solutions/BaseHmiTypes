import assert from "node:assert/strict";
import test from "node:test";
import {HmiAlarmControl,HmiAlarmMessageBlock,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty} from "../dist/index.js";
test("Definitions remain ordered optional and separate from runtime rows",async()=>{
 const control=new HmiAlarmControl(),screen=new HmiScreen(),layer=new HmiLayer();layer.items.push(control);screen.layers.push(layer);const renderer=new HmiScreenToHtmlConverter();assert.ok(!(await renderer.convertAsync(screen)).includes("hmi-alarm-message-blocks"));
 control.messageBlocks.push(Object.assign(new HmiAlarmMessageBlock(),{name:"Repeated <A>",decimalPlaces:staticProperty(0),leadingZeros:staticProperty(0),showDate:staticProperty(false),dateFormat:"<format>"}),new HmiAlarmMessageBlock(),Object.assign(new HmiAlarmMessageBlock(),{name:"Repeated <A>",leadingZeros:staticProperty(-7),timeFormat:"<time>"}),Object.assign(new HmiAlarmMessageBlock(),{name:""}));
 const html=await renderer.convertAsync(screen);for(const fragment of ['data-message-block-count="4"','data-message-block-name=""','data-decimal-places="0"','data-show-date="false"','data-leading-zeros="-7"','&lt;format&gt;','&lt;time&gt;'])assert.ok(html.includes(fragment),fragment);assert.equal(control.columnDefinitions.length,0);
});
