import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type);bytes.writeUInt32LE(bytes.length,4);values.forEach((v,i)=>bytes.writeUInt32LE(v>>>0,8+i*4));return bytes;}
function points(type,coordinates=[5,5,35,5,20,35],count=coordinates.length/2,adjustment=0){
 const short=type===86||type===87,size=short?2:4,original=Buffer.alloc(28+coordinates.length*size);
 record(type,0,0,39,39,count).copy(original);coordinates.forEach((v,i)=>short?original.writeInt16LE(v,28+i*size):original.writeInt32LE(v,28+i*size));
 const bytes=Buffer.alloc(original.length+adjustment);original.copy(bytes);bytes.writeUInt32LE(bytes.length,4);return bytes;
}
function emf(...records){const bytes=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,v)=>bytes.writeUInt32LE(v,at);u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,bytes.length);u(52,records.length+2);bytes.writeUInt16LE(2,56);return bytes;}
const svg=bytes=>new MetafileToSvgRenderer().render(bytes,'.emf');
const elements=bytes=>[...svg(bytes).matchAll(/<(polygon|polyline|path|line)\b([^>]+)>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
for(const [type,tag,fill] of [[86,'polygon','#ffffff'],[87,'polyline','none']]){
 test(`Short point array selected objects: ${type}`,()=>{const shape=elements(emf(record(37,0x80000000),points(type)))[0];assert.equal(shape.tag,tag);assert.equal(shape.points,'5,5 35,5 20,35');assert.equal(shape.fill,fill);assert.equal(shape.stroke,'#000000');});
 test(`Short signed coordinates and mapping: ${type}`,()=>assert.equal(elements(emf(record(17,8),record(9,10,10),record(11,20,30),record(12,4,7),points(type,[-32768,32767,10,-10])))[0].points,'-65532,98308 24,-23'));
 const expected='M 5 5 L 35 5 L 20 35'+(type===86?' Z':'');
 test(`Short independent path figure: ${type}`,()=>{const shapes=elements(emf(record(59),points(type),record(60),record(64,0,0,39,39)));assert.equal(shapes.length,1);assert.equal(shapes[0].tag,'path');assert.equal(shapes[0].d,expected);});
 test(`Short AbortPath discards figure: ${type}`,()=>assert.equal(elements(emf(record(59),points(type),record(68))).length,0));
 test(`Short figure preserves current position: ${type}`,()=>{const line=elements(emf(record(27,1,2),points(type),record(54,8,9))).find(e=>e.tag==='line');assert.equal(line.x1,'1');assert.equal(line.y1,'2');});
 test(`Short recorded draw-to starts at DC position: ${type}`,()=>assert.ok(elements(emf(record(27,1,2),record(59),points(type),record(54,8,9),record(60),record(64,0,0,39,39)))[0].d.endsWith('M 1 2 L 8 9')));
 test(`Short selected figure becomes clip: ${type}`,()=>{const bytes=emf(record(59),points(type),record(60),record(67,5),points(3));assert.equal([...svg(bytes).matchAll(/<clipPath\b/g)].length,1);assert.equal(elements(bytes).find(e=>e.tag==='path').d,expected);});
 for(const count of [0,1,4,0xffffffff])test(`Short invalid count never consumes next record: ${type}/${count}`,()=>{const shapes=elements(emf(points(type,undefined,count),record(27,1,2),record(54,8,9)));assert.equal(shapes.length,1);assert.equal(shapes[0].tag,'line');});
 test(`Short missing count ignored: ${type}`,()=>assert.equal(elements(emf(record(type,0,0,39,39))).length,0));
 test(`Short partial point ignored: ${type}`,()=>assert.equal(elements(emf(points(type,undefined,3,-4))).length,0));
 test(`Short trailing bytes ignored: ${type}`,()=>assert.equal(elements(emf(points(type,undefined,3,8)))[0].points,'5,5 35,5 20,35'));
 test(`Short HTML rendering preserves source: ${type}`,async()=>{const bytes=emf(points(type)),original=Buffer.from(bytes),uri='data:image/emf;base64,'+bytes.toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'ShortPoints',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.ok(decodeURIComponent(match[1]).includes('<'+tag+' '));assert.equal(item.source.staticValue,uri);assert.deepEqual(bytes,original);
 });
}
for(const [mode,expected] of [[1,'evenodd'],[2,'nonzero']])test(`Short polygon fill rule: ${mode}`,()=>assert.equal(elements(emf(record(19,mode),points(86)))[0]['fill-rule'],expected));
