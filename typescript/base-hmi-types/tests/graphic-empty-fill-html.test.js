import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiGraphicView, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, hmiColorFromArgb, staticProperty } from '../dist/index.js';
test('graphic empty fill preserves image transparency without painting the configured background',async()=>{
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);
  const graphic=Object.assign(new HmiGraphicView(),{name:'Logo',backFillPattern:staticProperty(65536),backgroundColor:staticProperty(hmiColorFromArgb(255,255,255,255))});layer.items.push(graphic);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(!html.match(/id="Logo"[^>]*background-color/));
  graphic.backFillPattern=staticProperty(1048577);
  assert.ok((await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/id="Logo"[^>]*background-color/));
});
