import assert from 'node:assert/strict';import test from 'node:test';
import {HmiScreen,HmiLayer,HmiImage,HmiImageType,HmiSymbolLibraryControl,HmiSymbolLibraryFillColorMode as Mode,HmiScreenToHtmlConverter,SymbolLibraryMetafileColorizer,staticProperty as p,hmiColorFromArgb} from '../dist/index.js';
function wmf(color=0x7f7f7f){
 const head=Buffer.from('0100090000030000000002000A0000000000','hex'),brush=Buffer.from('07000000FC020000000000000000','hex');brush.writeUInt32LE(color,8);
 const tail=Buffer.from('08000000FA0200000100000011223300040000002D010000040000002D010100050000000B0200000000050000000C02640064000A000000240303000A000A005A000A0032005A00030000000000','hex');
 const bytes=new Uint8Array(Buffer.concat([head,brush,tail]));new DataView(bytes.buffer).setUint32(6,bytes.length/2,true);return bytes;
}
const target=hmiColorFromArgb(255,200,100,50),modes=[Mode.Original,Mode.Shaded,Mode.Solid,Mode.Hollow];
for(const [source,expected] of [[0,0],[0xffffff,0xffffff],[0x7f7f7f,0x3163c7],[0xc0c0c0,0x99b2e3],[0x010203,0x000103],[0xff0000,0x214285]])test(`Native shading golden color ${source}`,()=>{
 const result=SymbolLibraryMetafileColorizer.tryRecolor(wmf(source),Mode.Shaded,target);assert.ok(result);assert.equal(new DataView(result.buffer).getUint32(26,true),expected);
});
for(const [modeIndex,mode] of modes.entries())test(`Colors brush only, preserves source and extensions: ${mode}`,()=>{
 for(const bytes of [new Uint8Array([...wmf(),0xde,0xad]),Buffer.from([...wmf(),0xde,0xad])]){
 const saved=new Uint8Array(bytes),result=SymbolLibraryMetafileColorizer.tryRecolor(bytes,mode,target);assert.ok(result);
 assert.deepEqual(new Uint8Array(bytes),saved);assert.notEqual(bytes,result);assert.deepEqual(result.slice(32),new Uint8Array(bytes.slice(32)));
 if(modeIndex===0)assert.deepEqual(result,new Uint8Array(bytes));if(modeIndex===2)assert.equal(new DataView(result.buffer).getUint32(26,true),0x3264c8);
 if(modeIndex===3)assert.equal(new DataView(result.buffer).getUint16(24,true),1);
 }
});
test('Truncated malformed and unsupported inputs are rejected',()=>{
 const bytes=wmf();for(let n=0;n<bytes.length;n++)assert.equal(SymbolLibraryMetafileColorizer.tryRecolor(bytes.slice(0,n),Mode.Solid,target),undefined);
 for(const offset of [0,2,4,6,18,bytes.length-2]){const bad=bytes.slice();bad[offset]=255;assert.equal(SymbolLibraryMetafileColorizer.tryRecolor(bad,Mode.Solid,target),undefined);}
 assert.equal(SymbolLibraryMetafileColorizer.tryRecolor(bytes,'Unknown',target),undefined);assert.equal(SymbolLibraryMetafileColorizer.tryRecolor(bytes,Mode.Solid),undefined);
 assert.equal(SymbolLibraryMetafileColorizer.tryRecolor(bytes,Mode.Shaded,hmiColorFromArgb(128,1,2,3)),undefined);
});
async function render(values){const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(Object.assign(new HmiSymbolLibraryControl(),values));return new HmiScreenToHtmlConverter().convertAsync(screen);}
for(const [index,expected] of ['#7f7f7f','#c76331','#c86432','none'].entries())test(`Existing neutral WMF renders mode: ${modes[index]}`,async()=>{
 const image=Object.assign(new HmiImage(),{imageType:HmiImageType.Wmf,data:wmf()}),saved=image.data.slice();
 const html=await render({name:'Color',symbol:image,symbolAppearance:p(modes[index]),foreColor:p(target)});
 assert.ok(html.includes(`fill="${expected}"`));assert.ok(html.includes('stroke="#112233"'));assert.deepEqual(image.data,saved);
});
test('Unsupported recoloring does not silently render original',async()=>assert.ok((await render({symbol:Object.assign(new HmiImage(),{imageType:HmiImageType.Wmf,data:wmf()}),fillColorMode:p(Mode.Solid)})).includes('Symbol library control')));
for(const identity of [0,1,2])test(`WMF identity and fill aliases: ${identity}`,async()=>{
 const html=await render({symbol:Object.assign(new HmiImage(),{imageType:identity===0?HmiImageType.Wmf:HmiImageType.Unknown,name:identity===1?'symbol.WMF':undefined,mimeType:identity===2?'image/x-wmf':undefined,data:wmf()}),fillColorMode:p(Mode.Solid),fillColor:p(target)});
 assert.ok(html.includes('fill="#c86432"'));
});
test('Appearance and fore color take precedence over aliases',async()=>{
 const html=await render({symbol:Object.assign(new HmiImage(),{imageType:HmiImageType.Wmf,data:wmf()}),symbolAppearance:p(Mode.Shaded),fillColorMode:p(Mode.Solid),foreColor:p(target),fillColor:p(hmiColorFromArgb(255,1,2,3))});
 assert.ok(html.includes('fill="#c76331"'));
});
