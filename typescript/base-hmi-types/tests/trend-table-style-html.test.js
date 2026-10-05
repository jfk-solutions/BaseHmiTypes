import assert from "node:assert/strict";
import test from "node:test";
import {HmiTrendControl,HmiFunctionTrendControl,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,hmiColorFromArgb} from "../dist/index.js";
for (const type of [HmiTrendControl,HmiFunctionTrendControl]) test(`Optional table appearance stays independent of chart grid: ${type.name}`,async()=>{
 const control = new type(),screen = new HmiScreen(),layer = new HmiLayer(); layer.items.push(control); screen.layers.push(layer);
 const converter = new HmiScreenToHtmlConverter();
 const tag = async() => (await converter.convertAsync(screen)).match(/<hmi-trend-control[^>]*>/gu).at(-1);
 assert.ok(!(await tag()).includes("data-table-"));
 control.showTableGridLines = staticProperty(false);
 control.tableGridLineColor = staticProperty(hmiColorFromArgb(255,68,85,102));
 control.alternatingRowBackgroundColor = staticProperty(hmiColorFromArgb(0,17,34,51));
 control.headerBorderWidth = staticProperty(0); control.xAxisGridVisible = staticProperty(true);
 const html = await tag();
 for(const value of ['data-table-grid-lines-visible="false"','data-table-header-border-width="0"','data-table-grid-line-color="#445566"','data-table-alternating-row-background-color="rgba(17,34,51,0)"','x-axis-grid-visible="true"']) assert.ok(html.includes(value),value);
 control.showTableGridLines = staticProperty(true); assert.ok((await tag()).includes('data-table-grid-lines-visible="true"'));
});
