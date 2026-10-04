import assert from 'node:assert/strict';import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);values.forEach((v,i)=>bytes.writeUInt32LE(v>>>0,8+i*4));return bytes;}
function emf(...records){const bytes=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,v)=>bytes.writeUInt32LE(v,at);u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,bytes.length);u(52,records.length+2);bytes.writeUInt16LE(2,56);return bytes;}
function compound(type,coordinates=[2,2,38,2,38,38,2,38,12,12,28,12,28,28,12,28]){
 const short=type===90||type===91,bytes=Buffer.alloc(40+coordinates.length*(short?2:4)),u=(at,v)=>bytes.writeUInt32LE(v,at);
 u(0,type);u(4,bytes.length);u(16,39);u(20,39);u(24,2);u(28,8);u(32,4);u(36,4);
 coordinates.forEach((value,index)=>short?bytes.writeInt16LE(value,40+index*2):bytes.writeInt32LE(value,40+index*4));return bytes;
}
const svg=bytes=>new MetafileToSvgRenderer().render(bytes,'.emf');
const elements=bytes=>[...svg(bytes).matchAll(/<(path|line|polygon|polyline)\b([^>]+)>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
const closed=type=>type===8||type===91;
const path=type=>'M 2 2 L 38 2 L 38 38 L 2 38'+(closed(type)?' Z':'')+' M 12 12 L 28 12 L 28 28 L 12 28'+(closed(type)?' Z':'');
for(const type of [7,8,90,91]){
 test(`Compound figures share path and do not change position: ${type}`,()=>{
  const bytes=emf(record(37,0x80000000),record(27,1,2),compound(type),record(54,8,9)),original=Buffer.from(bytes),shapes=elements(bytes),shape=shapes.find(e=>e.tag==='path'),line=shapes.find(e=>e.tag==='line');
  assert.equal(shape.d,path(type));assert.equal(shape.fill,closed(type)?'#ffffff':'none');assert.equal(line.x1,'1');assert.equal(line.y1,'2');assert.deepEqual(bytes,original);
 });
 test(`Records compound figures inside active path: ${type}`,()=>assert.equal(elements(emf(record(59),compound(type),record(60),record(64,0,0,39,39)))[0].d,path(type)));
 test(`Mapping transforms every compound figure: ${type}`,()=>assert.equal(elements(emf(record(9,10,10),record(11,20,30),record(12,4,7),compound(type)))[0].d,'M 8 13 L 80 13 L 80 121 L 8 121'+(closed(type)?' Z':'')+' M 28 43 L 60 43 L 60 91 L 28 91'+(closed(type)?' Z':'')));
 test(`Malformed compound records do not consume following records: ${type}`,()=>{
  for(const [offset,value] of [[24,0xffffffff],[28,0xffffffff],[28,7],[32,0],[36,1],[36,0xffffffff]]){
   const bytes=compound(type);bytes.writeUInt32LE(value,offset);const shapes=elements(emf(bytes,record(27,1,2),record(54,8,9)));assert.equal(shapes.length,1);assert.equal(shapes[0].tag,'line');
  }
  const bytes=compound(type).subarray(0,compound(type).length-4);bytes.writeUInt32LE(bytes.length,4);assert.equal(elements(emf(bytes)).length,0);assert.equal(elements(emf(record(type,0,0,39,39,2))).length,0);
 });
 test(`Compound trailing bytes ignored: ${type}`,()=>{const bytes=Buffer.concat([compound(type),Buffer.alloc(8)]);bytes.writeUInt32LE(bytes.length,4);assert.equal(elements(emf(bytes))[0].d,path(type));});
 test(`HTML retains compound shape and source: ${type}`,async()=>{
  const uri='data:image/emf;base64,'+emf(compound(type)).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Compound',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.ok(decodeURIComponent(match[1]).includes(`d="${path(type)}"`));assert.equal(item.source.staticValue,uri);
 });
}
for(const type of [8,91])for(const [mode,rule] of [[1,'evenodd'],[2,'nonzero']])test(`Compound polygon fill rule preserves holes: ${type}/${mode}`,()=>assert.equal(elements(emf(record(19,mode),compound(type)))[0]['fill-rule'],rule));
for(const type of [7,8])test(`Large signed compound points remain 32-bit: ${type}`,()=>assert.ok(elements(emf(compound(type,[-70000,80000,-2147483648,2147483647,38,38,2,38,12,12,28,12,28,28,12,28])))[0].d.startsWith('M -70000 80000 L -2147483648 2147483647')));
