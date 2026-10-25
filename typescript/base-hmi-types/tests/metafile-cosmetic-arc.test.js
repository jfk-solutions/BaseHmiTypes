import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';
import {buildNativeArc} from '../dist/images/converters/native-arc-builder.js';

const names=['cosmetic-arcs','cosmetic-arc-direct','cosmetic-arc-chain1','cosmetic-arc-chain2','cosmetic-arc-prelude','cosmetic-arc-direct-chain','cosmetic-arc-direct-prelude'];
const fixtures=new Map(names.map(name=>[name,JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8'))]));
function maskHash(bytes){
  const svg=new MetafileToSvgRenderer().render(bytes,'.emf'),mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }return createHash('sha256').update(mask).digest('hex');
}
const fixed=(x,y)=>[x,y].map(v=>{const r=Math.sign(v)*Math.floor(Math.abs(v)*16+.5)/16;return r===0?0:r;});
for(const [name,entries] of fixtures)for(const {Index,Source,Hash,Bounds,Rays,Clockwise,Controls,Types} of entries){
  test(`Native arc pixel mask and dash phase ${name} ${Index}`,()=>assert.equal(maskHash(Buffer.from(Source.split(',')[1],'base64')),Hash));
  test(`Native arc control table ${name} ${Index}`,()=>{
    const types=Buffer.from(Types,'base64'),first=types.findIndex(t=>(t&6)===4);assert.ok(first>=1);let end=first;while(end<types.length&&(types[end]&6)===4)end++;
    assert.deepEqual(buildNativeArc(...Bounds,...Rays,Clockwise,fixed),Controls.slice(first-1,end).map(p=>p.map(v=>v/16)));
  });
}
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
for(const index of [0,6,36,42,72,78,108,114])test(`Frozen arc metadata survives saved DC ${index}`,()=>{
  const {Source,Hash}=fixtures.get('cosmetic-arcs').find(f=>f.Index===index),bytes=Buffer.from(Source.split(',')[1],'base64'),records=[];
  for(let at=88;at<bytes.length;){
    const type=bytes.readUInt32LE(at),size=bytes.readUInt32LE(at+4);if(type===14)break;
    if(type===64)records.push(record(33),record(35,0x40000000,0,0,0x40000000,0,0),record(34,-1));
    records.push(bytes.subarray(at,at+size));at+=size;
  }
  const emf=Buffer.concat([bytes.subarray(0,88),...records,record(14,0,0,20)]);emf.writeUInt32LE(emf.length,48);emf.writeUInt32LE(records.length+2,52);
  assert.equal(maskHash(emf),Hash);
});
for(const value of [NaN,Infinity,-Infinity,Number.MAX_VALUE,-Number.MAX_VALUE])test(`Invalid arc bounds and rays fail atomically ${value}`,()=>{
  assert.equal(buildNativeArc(value,8,68,60,68,34,36,8,false,(x,y)=>[x,y]),undefined);
  assert.equal(buildNativeArc(4,8,68,60,value,34,36,8,false,(x,y)=>[x,y]),undefined);
});
test('Invalid arc device geometry fails atomically',()=>assert.equal(buildNativeArc(4,8,68,60,68,34,36,8,false,()=>[NaN,NaN]),undefined));
