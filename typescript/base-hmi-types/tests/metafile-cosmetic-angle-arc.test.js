import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';
import {buildNativeAngleArc} from '../dist/images/converters/native-angle-arc-builder.js';
const names=['cosmetic-angle-arcs','cosmetic-angle-arc-direct','cosmetic-angle-arc-chain1','cosmetic-angle-arc-chain2','cosmetic-angle-arc-prelude','cosmetic-angle-arc-direct-prelude'];
const fixtures=new Map(names.map(name=>[name,JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8'))]));
function maskHash(bytes){
  const svg=new MetafileToSvgRenderer().render(bytes,'.emf'),mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }return createHash('sha256').update(mask).digest('hex');
}
const fixed=(x,y)=>[x,y].map(v=>{const r=Math.sign(v)*Math.floor(Math.abs(v)*16+.5)/16;return r===0?0:r;});
for(const [name,entries] of fixtures)for(const {Index,Recorded,PlaybackDifferences,Source,Hash,Cx,Cy,Radius,Start,Sweep,Controls} of entries){
  assert.ok(Recorded&&PlaybackDifferences===0,'AngleArc requires independent native API/replay equality');
  test(`Native AngleArc controls ${name} ${Index}`,()=>assert.deepEqual(buildNativeAngleArc(Cx,Cy,Radius,Start,Sweep,fixed),Controls.slice(1).map(p=>p.map(v=>v/16))));
  test(`Native AngleArc pixels and phase ${name} ${Index}`,()=>assert.equal(maskHash(Buffer.from(Source.split(',')[1],'base64')),Hash));
}
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
for(const index of [1,5,12,17,26,47,99,165])test(`Frozen AngleArc metadata survives saved DC ${index}`,()=>{
  const {Source,Hash}=fixtures.get('cosmetic-angle-arcs').find(f=>f.Index===index),bytes=Buffer.from(Source.split(',')[1],'base64'),records=[];
  for(let at=bytes.readUInt32LE(4);at<bytes.length;){const type=bytes.readUInt32LE(at),size=bytes.readUInt32LE(at+4);if(type===14)break;if(type===64)records.push(record(33),record(35,0x40000000,0,0,0x40000000,0,0),record(34,-1));records.push(bytes.subarray(at,at+size));at+=size;}
  const header=Buffer.alloc(88),emf=Buffer.concat([header,...records,record(14,0,0,20)]);
  for(const [at,v] of [[0,1],[4,88],[16,79],[20,79],[40,0x464d4520],[44,0x10000],[48,emf.length],[52,records.length+2]])emf.writeUInt32LE(v,at);emf.writeUInt16LE(2,56);
  assert.equal(maskHash(emf),Hash);
});
for(const value of [NaN,Infinity,-Infinity,Math.fround(3.4028234663852886e38),-Math.fround(3.4028234663852886e38)])test(`Invalid AngleArc angles fail atomically ${value}`,()=>{
  assert.equal(buildNativeAngleArc(36,34,26,value,90,(x,y)=>[x,y]),undefined);assert.equal(buildNativeAngleArc(36,34,26,0,value,(x,y)=>[x,y]),undefined);
});
test('Invalid AngleArc geometry fails atomically',()=>{
  assert.equal(buildNativeAngleArc(NaN,34,26,0,90,(x,y)=>[x,y]),undefined);assert.equal(buildNativeAngleArc(36,34,0xffffffff,0,90,(x,y)=>[x,y]),undefined);assert.equal(buildNativeAngleArc(36,34,26,0,90,()=>[NaN,NaN]),undefined);
});
