import assert from 'node:assert/strict';import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);values.forEach((v,i)=>bytes.writeUInt32LE(v>>>0,8+i*4));return bytes;}
function emf(...records){const bytes=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,v)=>bytes.writeUInt32LE(v,at);u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,bytes.length);u(52,records.length+2);bytes.writeUInt16LE(2,56);return bytes;}
function polyDraw(type,types=[6,2,4,4,5],coordinates=[5,30,5,10,5,0,35,0,35,30]){
 const short=type===92,pointBytes=coordinates.length*(short?2:4),bytes=Buffer.alloc((28+pointBytes+types.length+3)&~3);
 bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);bytes.writeUInt32LE(coordinates.length/2,24);
 coordinates.forEach((v,i)=>short?bytes.writeInt16LE(v,28+i*2):bytes.writeInt32LE(v,28+i*4));Buffer.from(types).copy(bytes,28+pointBytes);return bytes;
}
const mixed='M 5 30 L 5 10 C 5 0 35 0 35 30 Z';
const elements=bytes=>[...new MetafileToSvgRenderer().render(bytes,'.emf').matchAll(/<(path|line)\b([^>]+)>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
for(const type of [56,92]){
 test(`Mixed commands and native close bit: ${type}`,()=>{const bytes=emf(polyDraw(type)),original=Buffer.from(bytes),shape=elements(bytes)[0];assert.equal(shape.d,mixed);assert.equal(shape.fill,'none');assert.deepEqual(bytes,original);});
 test(`Records mixed commands inside path: ${type}`,()=>assert.equal(elements(emf(record(59),polyDraw(type),record(60),record(64,0,0,39,39)))[0].d,mixed));
 test(`Close keeps native supplied endpoint as current position: ${type}`,()=>{const line=elements(emf(polyDraw(type),record(54,39,35))).find(e=>e.tag==='line');assert.equal(line.x1,'35');assert.equal(line.y1,'30');});
 test(`Draw-to without move uses existing position: ${type}`,()=>assert.equal(elements(emf(record(27,5,30),polyDraw(type,[2],[20,10])))[0].d,'M 5 30 L 20 10'));
 test(`Direct implicit close uses call-start position: ${type}`,()=>assert.equal(elements(emf(record(27,5,30),record(54,35,30),polyDraw(type,[3],[20,10]))).find(e=>e.tag==='path').d,'M 35 30 L 20 10 Z'));
 test(`Saved current position restored: ${type}`,()=>assert.equal(elements(emf(record(27,5,30),record(33),record(27,8,8),record(34,-1),record(54,35,30),polyDraw(type,[3],[20,10]))).find(e=>e.tag==='path').d,'M 35 30 L 20 10 Z'));
 test(`Active implicit close uses existing path start: ${type}`,()=>assert.equal(elements(emf(record(59),record(27,5,30),record(54,35,30),polyDraw(type,[3],[20,10]),record(60),record(64,0,0,39,39)))[0].d,'M 5 30 L 35 30 L 20 10 Z'));
 test(`Mapping transforms mixed points: ${type}`,()=>assert.equal(elements(emf(record(9,10,10),record(11,20,30),record(12,4,7),polyDraw(type)))[0].d,'M 14 97 L 14 37 C 14 7 74 7 74 97 Z'));
 test(`Invalid commands cannot paint prefix or change position: ${type}`,()=>{
  for(const types of [[7,2,4,4,5],[6,0x82,4,4,5],[6,2,5,4,5],[6,2,4,2,5],[6,2,4,4,6]]){const shapes=elements(emf(record(27,1,2),polyDraw(type,types),record(54,8,9)));assert.equal(shapes.length,1);assert.equal(shapes[0].x1,'1');assert.equal(shapes[0].y1,'2');}
 });
 test(`Counts and missing type bytes do not consume following record: ${type}`,()=>{
  for(const count of [0,100,0xffffffff]){const bytes=polyDraw(type);bytes.writeUInt32LE(count,24);assert.equal(elements(emf(bytes)).length,0);}
  const bytes=polyDraw(type).subarray(0,polyDraw(type).length-4);bytes.writeUInt32LE(bytes.length,4);assert.equal(elements(emf(bytes)).length,0);assert.equal(elements(emf(record(type,0,0,39,39))).length,0);
 });
 test(`Trailing padding does not become commands: ${type}`,()=>{const bytes=Buffer.concat([polyDraw(type),Buffer.alloc(8)]);bytes.writeUInt32LE(bytes.length,4);assert.equal(elements(emf(bytes))[0].d,mixed);});
 test(`HTML retains mixed shape and source: ${type}`,async()=>{
  const uri='data:image/emf;base64,'+emf(polyDraw(type)).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'PolyDraw',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.ok(decodeURIComponent(match[1]).includes(`d="${mixed}"`));assert.equal(item.source.staticValue,uri);
 });
}
test('Signed PolyDraw points retain 32-bit values',()=>assert.equal(elements(emf(polyDraw(56,[6,2],[-70000,80000,-2147483648,2147483647])))[0].d,'M -70000 80000 L -2147483648 2147483647'));
