import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';

const families=['cosmetic-stored-shapes','cosmetic-micro-lines'];
const fixtures=new Map(families.map(name=>[name,JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8'))]));
function maskHash(bytes){
  const svg=new MetafileToSvgRenderer().render(bytes,'.emf'),mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }return createHash('sha256').update(mask).digest('hex');
}
for(const [family,entries] of fixtures)for(const {Index,Source,Hash} of entries){
  test(`Native pixel and dash phase ${family} ${Index}`,()=>assert.equal(maskHash(Buffer.from(Source.split(',')[1],'base64')),Hash));
}
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
for(const index of [0,1,2,900,901,902])test(`Late pen metadata survives saved DC ${index}`,()=>{
  const {Source,Hash}=fixtures.get('cosmetic-stored-shapes').find(f=>f.Index===index),bytes=Buffer.from(Source.split(',')[1],'base64'),records=[];
  for(let at=88;at<bytes.length;){
    const type=bytes.readUInt32LE(at),size=bytes.readUInt32LE(at+4);if(type===14)break;
    if(type===64)records.push(record(33),record(35,0x40000000,0,0,0x40000000,0,0),record(34,-1));
    records.push(bytes.subarray(at,at+size));at+=size;
  }
  const emf=Buffer.concat([bytes.subarray(0,88),...records,record(14,0,0,20)]);emf.writeUInt32LE(emf.length,48);emf.writeUInt32LE(records.length+2,52);
  assert.equal(maskHash(emf),Hash);
});
