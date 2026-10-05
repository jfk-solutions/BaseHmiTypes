import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';

function record(type,...values){
 const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);
 values.forEach((value,index)=>bytes.writeUInt32LE(value>>>0,8+index*4));return bytes;
}
function points(type,coordinates=[5,5,35,5,20,35],count=coordinates.length/2,adjustment=0){
 const original=record(type,0,0,39,39,count,...coordinates),bytes=Buffer.alloc(original.length+adjustment);
 original.copy(bytes);bytes.writeUInt32LE(bytes.length,4);return bytes;
}
function emf(...records){
 const bytes=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,value)=>bytes.writeUInt32LE(value,at);
 u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,bytes.length);u(52,records.length+2);bytes.writeUInt16LE(2,56);return bytes;
}
const svg=bytes=>new MetafileToSvgRenderer().render(bytes,'.emf');
const elements=bytes=>[...svg(bytes).matchAll(/<(polygon|polyline|path|line)\b([^>]+)>/g)].map(match=>({tag:match[1],...Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));

for(const [type,tag,fill] of [[3,'polygon','#ffffff'],[4,'polyline','none']])test(`Draws 32-bit point array using selected objects: ${type}`,()=>{
 const bytes=emf(record(37,0x80000000),points(type)),original=Buffer.from(bytes),shape=elements(bytes)[0];
 assert.equal(shape.tag,tag);assert.equal(shape.points,'5,5 35,5 20,35');assert.equal(shape.fill,fill);assert.equal(shape.stroke,'#000000');assert.deepEqual(bytes,original);
});
for(const type of [3,4]){
 test(`Signed coordinates exceed 16-bit range: ${type}`,()=>assert.equal(elements(emf(points(type,[-70000,80000,-2147483648,2147483647])))[0].points,'-70000,80000 -2147483648,2147483647'));
 test(`Applies current mapping: ${type}`,()=>assert.equal(elements(emf(record(17,8),record(9,10,10),record(11,20,30),record(12,4,7),points(type)))[0].points,'14,22 74,22 44,112'));
 test(`Does not change current position: ${type}`,()=>{const line=elements(emf(record(27,1,2),points(type),record(54,8,9))).find(e=>e.tag==='line');assert.equal(line.x1,'1');assert.equal(line.y1,'2');});
 test(`Records independent figures inside paths: ${type}`,()=>{const shapes=elements(emf(record(59),points(type),record(60),record(64,0,0,39,39)));assert.equal(shapes.length,1);assert.equal(shapes[0].tag,'path');assert.equal(shapes[0].d,'M 5 5 L 35 5 L 20 35'+(type===3?' Z':''));});
 for(const count of [0,1,4,0xffffffff])test(`Invalid count never consumes following record: ${type}/${count}`,()=>{const shapes=elements(emf(points(type,undefined,count),record(27,1,2),record(54,8,9)));assert.equal(shapes.length,1);assert.equal(shapes[0].tag,'line');});
 test(`Missing count field ignored: ${type}`,()=>assert.equal(elements(emf(record(type,0,0,39,39))).length,0));
 test(`Partial point never consumes following record: ${type}`,()=>assert.equal(elements(emf(points(type,undefined,3,-4))).length,0));
 test(`Trailing bytes ignored: ${type}`,()=>assert.equal(elements(emf(points(type,undefined,3,8)))[0].points,'5,5 35,5 20,35'));
 test(`HTML renders point arrays without source mutation: ${type}`,async()=>{
  const uri='data:image/emf;base64,'+emf(points(type)).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Points',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);
  assert.ok(decodeURIComponent(match[1]).includes('<'+(type===3?'polygon':'polyline')+' '));assert.equal(item.source.staticValue,uri);
 });
}
for(const [mode,expected] of [[1,'evenodd'],[2,'nonzero']])test(`Polygon uses current fill rule: ${mode}`,()=>assert.equal(elements(emf(record(19,mode),points(3)))[0]['fill-rule'],expected));
