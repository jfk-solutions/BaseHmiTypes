import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiSymbolicIOField, HmiState, HmiMultilingualText, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, tagProperty, hmiColorFromArgb, getStaticValue } from '../dist/index.js';

for (const readOnly of [false,true]) test(`List and selection palettes remain separate from state appearance: ${readOnly}`, async () => {
  const field = Object.assign(new HmiSymbolicIOField(), { name:'Palette',width:staticProperty(120),height:staticProperty(30),value:staticProperty(1),readOnly:staticProperty(readOnly),
    selectionForegroundColor:tagProperty('Palette.Selection',hmiColorFromArgb(0,17,34,51)),selectionBackgroundColor:staticProperty(hmiColorFromArgb(255,68,85,102)),
    listForegroundColor:staticProperty(hmiColorFromArgb(255,119,136,153)),listBackgroundColor:staticProperty(hmiColorFromArgb(255,170,187,204)) });
  field.states.push(Object.assign(new HmiState(),{value:0,text:HmiMultilingualText.fromText('Other & item'),foregroundColor:hmiColorFromArgb(255,255,0,0)}),Object.assign(new HmiState(),{value:1,text:HmiMultilingualText.fromText('Selected <A>'),foregroundColor:hmiColorFromArgb(255,255,0,0)}));
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(field); const renderer = new HmiScreenToHtmlConverter();
  let html = await renderer.convertAsync(screen); const root = html.match(readOnly ? /<input[^>]*id="Palette"[^>]*>/ : /<select[^>]*id="Palette"[^>]*>/)?.[0] ?? '';
  for (const text of ['data-selection-foreground-color="rgba(17,34,51,0)"','data-selection-background-color="#445566"','data-list-foreground-color="#778899"','data-list-background-color="#AABBCC"']) assert.ok(root.includes(text),root);
  if (readOnly) { assert.ok(root.includes('value="Selected &lt;A&gt;"')); assert.ok(!html.includes('<option')); }
  else {
    const options = html.match(/<option[^>]*>.*?<\/option>/g) ?? []; assert.equal(options.length,2);
    assert.ok(options[0].includes('color: #778899;')); assert.ok(options[0].includes('background-color: #AABBCC;'));
    assert.ok(options[1].includes('color: rgba(17,34,51,0);')); assert.ok(options[1].includes('background-color: #445566;')); assert.ok(options[1].includes('selected="selected"')); assert.ok(options[0].includes('Other &amp; item'));
    delete field.selectionForegroundColor; html = await renderer.convertAsync(screen); const selected = html.match(/<option[^>]*>.*?<\/option>/g).at(-1);
    assert.ok(selected.includes('color: #778899;')); assert.ok(selected.includes('background-color: #445566;'));
  }
  assert.deepEqual(field.states[1].foregroundColor,hmiColorFromArgb(255,255,0,0)); assert.equal(getStaticValue(field.value),1);
  delete field.selectionForegroundColor; delete field.selectionBackgroundColor; delete field.listForegroundColor; delete field.listBackgroundColor;
  html = await renderer.convertAsync(screen); assert.ok(!html.includes('data-selection-foreground-color=')); assert.ok(!html.includes('data-list-background-color='));
  if (!readOnly) assert.ok(html.match(/<option[^>]*>.*?<\/option>/g).at(-1).includes('color: #FF0000;'));
});
