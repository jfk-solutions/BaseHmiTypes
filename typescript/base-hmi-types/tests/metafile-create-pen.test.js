import assert from 'node:assert/strict';import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function emf(width=3,ignored=123,style=0,color=0x00563412,penSize=28){
 const pen=Buffer.alloc(penSize),u=(at,value)=>pen.writeUInt32LE(value>>>0,at);
 u(0,38);u(4,penSize);u(8,1);u(12,style);u(16,width);u(20,ignored);if(penSize>=28)u(24,color);
 const record=(type,...values)=>{const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);values.forEach((value,i)=>bytes.writeUInt32LE(value,8+i*4));return bytes;};
 const bytes=Buffer.concat([Buffer.alloc(88),pen,record(37,1),record(27,5,10),record(54,35,10),record(14,0,0,20)]),h=(at,value)=>bytes.writeUInt32LE(value,at);
 h(0,1);h(4,88);h(16,39);h(20,19);h(40,0x464d4520);h(44,0x10000);h(48,bytes.length);h(52,6);bytes.writeUInt16LE(2,56);return bytes;
}
const line=bytes=>{const tag=new MetafileToSvgRenderer().render(bytes,'.emf').match(/<line\b[^>]+>/)[0];return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]));};
for(const [width,ignored,expected] of [[1,123,'1'],[3,0,'3'],[0,-50,'1'],[-4,123,'4'],[-2147483648,123,'2147483648'],[7,-2147483648,'7']])test(`CREATEPEN width uses X and ignores Y without overflow: ${width}/${ignored}`,()=>{
 const bytes=emf(width,ignored),original=Buffer.from(bytes),value=line(bytes);assert.equal(value['stroke-width'],expected);assert.equal(value.stroke,'#123456');assert.deepEqual(bytes,original);
});
for(const [color,expected] of [[0,'#000000'],[0xff563412,'#123456']])test(`CREATEPEN COLORREF is read inside record: ${color}`,()=>assert.equal(line(emf(3,123,0,color)).stroke,expected));
for(const style of [5,0x105,0x10005])test(`CREATEPEN null style recognized with other bits: ${style}`,()=>assert.equal(line(emf(3,123,style)).stroke,'none'));
test('Short CREATEPEN never reads following record as its color',()=>{const value=line(emf(3,123,0,0x563412,24));assert.equal(value.stroke,'#000000');assert.equal(value['stroke-width'],'1');});
test('Optional CREATEPEN trailing bytes do not alter fields',()=>{const value=line(emf(3,123,0,0x563412,32));assert.equal(value.stroke,'#123456');assert.equal(value['stroke-width'],'3');});
for(const style of [0,0x105])test(`HTML uses correct pen without mutating source: ${style}`,async()=>{
 const uri='data:image/emf;base64,'+emf(3,123,style).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Pen',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen),value=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/)?.[1];assert.ok(value);
 assert.ok(decodeURIComponent(value).match(/<line\b[^>]+>/)[0].includes(`stroke="${style===0?'#123456':'none'}"`));assert.equal(item.source.staticValue,uri);
});
