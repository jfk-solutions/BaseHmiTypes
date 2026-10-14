import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiScreen, HmiLayer, HmiScreenWindow, HmiFaceplateContainer, HmiFaceplateType, HmiHtmlConvertOptions, HmiScreenToHtmlConverter, staticProperty } from '../dist/index.js';

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

test('faceplate resolver renders detached instances and suppresses static fallback',async()=>{
  const root=Object.assign(new HmiScreen(),{name:'Root'}),layer=new HmiLayer();root.layers.push(layer);
  for(const name of ['Left','Right'])layer.items.push(Object.assign(new HmiFaceplateContainer(),{name,faceplateId:'type'}));
  const options=new HmiHtmlConvertOptions();options.faceplateResolver=async container=>Object.assign(new HmiFaceplateType(),{name:container.name+'Instance'});
  const html=await new HmiScreenToHtmlConverter().convertAsync(root,undefined,options);assert.ok(html.includes('LeftInstance')&&html.includes('RightInstance'));
  options.faceplateResolver=async()=>undefined;
  const project={info:{},getFaceplate:async()=>{throw new Error('Unexpected static fallback');}};
  assert.ok((await new HmiScreenToHtmlConverter().convertAsync(root,project,options)).includes('hmi-missing-screen'));
});

test('unconfigured screen windows stay blank while unresolved configured targets remain visible',async()=>{
 const root=new HmiScreen(),layer=new HmiLayer();root.layers.push(layer);const window=Object.assign(new HmiScreenWindow(),{name:'Empty'});layer.items.push(window);
 const converter=new HmiScreenToHtmlConverter();assert.ok(!(await converter.convertAsync(root)).includes('Missing screen'));
 window.screenName=staticProperty('UnavailableChild');assert.ok((await converter.convertAsync(root)).includes('UnavailableChild'));
});
