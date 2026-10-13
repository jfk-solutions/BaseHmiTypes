import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiScreen, HmiLayer, HmiScreenWindow, HmiHtmlConvertOptions, HmiScreenToHtmlConverter, staticProperty } from '../dist/index.js';

test('resolvers render each window instance and template without a project', async () => {
  const root = Object.assign(new HmiScreen(), { name:'Root', templateId:staticProperty('template') });
  const layer = new HmiLayer(); root.layers.push(layer);
  for (const name of ['Left','Right']) layer.items.push(Object.assign(new HmiScreenWindow(), { name, screenId:staticProperty('child') }));
  const options = new HmiHtmlConvertOptions();
  options.templateResolver = async screen => screen === root ? Object.assign(new HmiScreen(), { name:'TemplateInstance' }) : undefined;
  options.screenWindowResolver = async window => Object.assign(new HmiScreen(), { id:'child', name:window.name + 'Instance' });
  const html = await new HmiScreenToHtmlConverter().convertAsync(root, undefined, options);
  for (const name of ['LeftInstance','RightInstance','TemplateInstance']) assert.ok(html.includes(`id="${name}"`));
  options.screenWindowResolver = async () => undefined;
  const empty = await new HmiScreenToHtmlConverter().convertAsync(root, undefined, options);
  assert.ok(!empty.includes('LeftInstance')); assert.ok(empty.includes('hmi-missing-screen'));
});
