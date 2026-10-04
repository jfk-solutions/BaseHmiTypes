import assert from 'node:assert/strict';import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
const line=type=>type===6||type===89,to=type=>line(type)||type===5||type===88;
function record(type,...values){const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);values.forEach((v,i)=>bytes.writeUInt32LE(v>>>0,8+i*4));return bytes;}
function emf(...records){const bytes=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,v)=>bytes.writeUInt32LE(v,at);u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,bytes.length);u(52,records.length+2);bytes.writeUInt16LE(2,56);return bytes;}
function curve(type,coordinates=line(type)?[15,10,35,30]:to(type)?[5,0,35,0,35,30]:[5,30,5,0,35,0,35,30]){
 const short=type>=85,bytes=Buffer.alloc(28+coordinates.length*(short?2:4));bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);bytes.writeUInt32LE(coordinates.length/2,24);
 coordinates.forEach((v,i)=>short?bytes.writeInt16LE(v,28+i*2):bytes.writeInt32LE(v,28+i*4));return bytes;
}
const path=type=>line(type)?'M 5 30 L 15 10 L 35 30':'M 5 30 C 5 0 35 0 35 30';
const elements=bytes=>[...new MetafileToSvgRenderer().render(bytes,'.emf').matchAll(/<(path|line)\b([^>]+)>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
for(const type of [2,5,6,85,88,89]){
 test(`Direct curve/current pen without fill: ${type}`,()=>{const bytes=emf(record(27,5,30),curve(type)),original=Buffer.from(bytes),shape=elements(bytes)[0];assert.equal(shape.tag,'path');assert.equal(shape.d,path(type));assert.equal(shape.fill,'none');assert.equal(shape.stroke,'#000000');assert.deepEqual(bytes,original);});
 test(`Records curve in path including current-position start: ${type}`,()=>assert.equal(elements(emf(record(27,5,30),record(59),curve(type),record(60),record(64,0,0,39,39)))[0].d,path(type)));
 test(`Current position advances only for draw-to: ${type}`,()=>{const value=elements(emf(record(27,5,30),curve(type),record(54,39,35))).find(e=>e.tag==='line');assert.equal(value.x1,to(type)?'35':'5');assert.equal(value.y1,'30');});
 test(`Curve uses current mapping: ${type}`,()=>assert.equal(elements(emf(record(9,10,10),record(11,20,30),record(12,4,7),record(27,5,30),curve(type)))[0].d,line(type)?'M 14 97 L 34 37 L 74 97':'M 14 97 C 14 7 74 7 74 97'));
 test(`Malformed curve cannot draw or change position: ${type}`,()=>{
  for(const count of [0,0xffffffff,100]){const bytes=curve(type);bytes.writeUInt32LE(count,24);const shapes=elements(emf(record(27,5,30),bytes,record(54,39,35)));assert.equal(shapes.length,1);assert.equal(shapes[0].x1,'5');}
  const bytes=curve(type).subarray(0,curve(type).length-4);bytes.writeUInt32LE(bytes.length,4);assert.equal(elements(emf(bytes)).length,0);assert.equal(elements(emf(record(type,0,0,39,39))).length,0);
 });
 test(`HTML renders curve without source mutation: ${type}`,async()=>{
  const uri='data:image/emf;base64,'+emf(record(27,5,30),curve(type)).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Curve',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.ok(decodeURIComponent(match[1]).includes(`d="${path(type)}"`));assert.equal(item.source.staticValue,uri);
 });
}
for(const type of [2,5,85,88])test(`Incomplete cubic groups rejected: ${type}`,()=>assert.equal(elements(emf(curve(type,[5,30,5,0]))).length,0));
for(const [ordinary,drawTo] of [[2,5],[85,88]])test(`Independent curve leaves following draw-to start intact: ${ordinary}/${drawTo}`,()=>assert.equal(elements(emf(record(27,5,30),record(59),curve(ordinary),curve(drawTo),record(60),record(64,0,0,39,39)))[0].d,path(ordinary)+' '+path(drawTo)));
for(const type of [5,6,88,89])test(`Consecutive draw-to records stay connected: ${type}`,()=>assert.equal(elements(emf(record(27,5,30),record(59),curve(type),curve(type),record(60),record(64,0,0,39,39)))[0].d,path(type)+' '+(line(type)?'L 15 10 L 35 30':'C 5 0 35 0 35 30')));
