import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiButton, HmiImageSourceKind, HmiLayer, HmiScreen, HmiScreenToHtmlConverter, staticProperty } from '../dist/index.js';

test('localized image sources follow render culture and retain their neutral fallback', async () => {
  const source = { kind: HmiImageSourceKind.Uri, uri: 'default.svg', localizedUris: new Map([[1031, 'german.svg'], [2057, 'english.svg']]) };
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer);
  layer.items.push(Object.assign(new HmiButton(), { name: 'Language', image: staticProperty(source) }));
  for (const [cultureLcid, expected] of [[1031, 'german.svg'], [2057, 'english.svg'], [1036, 'default.svg']]) {
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen, undefined, { cultureLcid });
    assert.ok(html.includes(`src="${expected}"`));
  }
  assert.equal(source.uri, 'default.svg'); assert.equal(source.localizedUris.size, 2);
});

test('named project images preserve localized payloads through ID resolution',async()=>{
 const {HmiImage,HmiImageType}=await import('../dist/index.js');
 const image=Object.assign(new HmiImage(),{id:'logical',name:'Active',imageType:HmiImageType.Png,data:new Uint8Array([1])});
 image.localizedImages.set(1031,Object.assign(new HmiImage(),{imageType:HmiImageType.Png,data:new Uint8Array([2])}));
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);
 layer.items.push(Object.assign(new HmiButton(),{name:'Graphic',image:staticProperty({kind:HmiImageSourceKind.Uri,imageId:'logical'})}));
 const project={info:{},getImage:async id=>id==='logical'?image:undefined};
 for(const [cultureLcid,payload]of [[1031,'Ag=='],[2057,'AQ==']]) {
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen,project,{cultureLcid});assert.ok(html.includes('data:image/png;base64,'+payload));
 }
 assert.equal(image.data[0],1);
});
