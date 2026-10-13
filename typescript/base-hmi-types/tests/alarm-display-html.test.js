import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiAlarmControl,HmiAlarmLineControl,HmiAlarmColumn,HmiAlarmColumnType,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty} from '../dist/index.js';
test('static alarm markup emits reusable web components and configured cell templates',async()=>{
 const screen=new HmiScreen(),layer=new HmiLayer(),table=new HmiAlarmControl(),line=new HmiAlarmLineControl();screen.layers.push(layer);layer.items.push(table,line);table.showHeader=staticProperty(false);table.columnDefinitions.push(Object.assign(new HmiAlarmColumn(),{type:HmiAlarmColumnType.Message}));
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
 assert.ok(html.includes('<hmi-alarm-control'));assert.ok(html.includes('<hmi-alarm-line-control'));assert.ok(!html.includes('<thead>'));assert.ok(html.includes('<template data-hmi-alarm-row>'));assert.ok(html.includes('data-column-type="Message"'));assert.ok(html.includes('hmi-alarm-action'));
});
