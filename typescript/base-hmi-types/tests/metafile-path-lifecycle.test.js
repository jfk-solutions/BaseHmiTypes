import assert from 'node:assert/strict';import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);values.forEach((v,i)=>bytes.writeUInt32LE(v>>>0,8+i*4));return bytes;}
const points=type=>record(type,0,0,39,39,3,5,5,35,5,20,35);
function emf(...records){const bytes=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,v)=>bytes.writeUInt32LE(v,at);u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,bytes.length);u(52,records.length+2);bytes.writeUInt16LE(2,56);return bytes;}
const svg=(...records)=>new MetafileToSvgRenderer().render(emf(...records),'.emf');
const elements=(...records)=>[...svg(...records).matchAll(/<(path|line)\b([^>]+)>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
test('EndPath stops capture and retains selected geometry',()=>{const shapes=elements(record(59),record(27,5,10),record(54,35,10),record(60),record(54,35,30),record(64,0,0,39,39));assert.equal(shapes.find(e=>e.tag==='path').d,'M 5 10 L 35 10');assert.equal(shapes.find(e=>e.tag==='line').x1,'35');});
for(const ended of [false,true])test(`Abort discards path and keeps current point: ${ended}`,()=>{const records=[record(59),record(27,5,10),record(54,35,10)];if(ended)records.push(record(60));records.push(record(68),record(61),record(64,0,0,39,39),record(54,35,30));const shapes=elements(...records);assert.equal(shapes.length,1);assert.equal(shapes[0].tag,'line');assert.equal(shapes[0].x1,'35');assert.equal(shapes[0].y1,'10');});
for(const paint of [62,63,64]){
 test(`Paint consumes selected path once: ${paint}`,()=>assert.equal(elements(record(59),points(3),record(60),record(paint,0,0,39,39),record(paint,0,0,39,39)).length,1));
 test(`Painting open path does not consume construction: ${paint}`,()=>assert.equal(elements(record(59),record(27,5,10),record(54,35,10),record(paint,0,0,39,39),record(60),record(64,0,0,39,39))[0].d,'M 5 10 L 35 10'));
}
test('New BeginPath discards selected path',()=>assert.equal(elements(record(59),record(27,5,10),record(54,35,10),record(60),record(59),record(27,5,30),record(54,35,30),record(60),record(64,0,0,39,39))[0].d,'M 5 30 L 35 30'));
test('EndPath without construction leaves selected path intact',()=>assert.equal(elements(record(59),points(3),record(60),record(60),record(64,0,0,39,39)).length,1));
test('Abort prevents stale clip selection',()=>assert.ok(!svg(record(59),points(3),record(60),record(68),record(67,1)).includes('<clipPath')));
test('Abort preserves previously selected clip',()=>{const text=svg(record(59),points(3),record(60),record(67,1),record(59),points(4),record(68),record(59),record(27,5,30),record(54,35,30),record(60),record(64,0,0,39,39));assert.equal((text.match(/<clipPath/g)||[]).length,1);assert.ok(text.includes('clip-path="url(#clip1)"'));});
test('Repeated AbortPath without path does not suppress drawing',()=>assert.equal(elements(record(68),record(68),record(27,5,10),record(54,35,10))[0].tag,'line'));
test('RestoreDC restores selected path snapshot',()=>assert.equal(elements(record(59),record(27,5,10),record(54,35,10),record(60),record(33),record(59),record(27,8,8),record(54,20,20),record(60),record(34,-1),record(64,0,0,39,39))[0].d,'M 5 10 L 35 10'));
test('RestoreDC restores open construction snapshot',()=>assert.equal(elements(record(59),record(27,5,10),record(54,35,10),record(33),record(54,35,30),record(34,-1),record(60),record(64,0,0,39,39))[0].d,'M 5 10 L 35 10'));
for(const abort of [false,true])test(`HTML reflects lifecycle without source mutation: ${abort}`,async()=>{
 const uri='data:image/emf;base64,'+emf(record(59),record(27,5,10),record(54,35,10),record(60),record(abort?68:60),record(54,35,30),record(64,0,0,39,39)).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Lifecycle',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.equal((decodeURIComponent(match[1]).match(/<(path|line)\b/g)||[]).length,abort?1:2);assert.equal(item.source.staticValue,uri);
});
