import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';

function maskHash(bytes){
  const svg=new MetafileToSvgRenderer().render(bytes,'.emf'),mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
    if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){
      const x=Number(point[1]),y=Number(point[2]);
      if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;
    }
  }
  return createHash('sha256').update(mask).digest('hex');
}

function alternatePointWidth(bytes){
  const types=new Map([[5,88],[6,89],[56,92],[88,5],[89,6],[92,56]]),records=[];let changed=false;
  for(let at=0;at<bytes.length;){
    const size=bytes.readUInt32LE(at+4);let record=Buffer.from(bytes.subarray(at,at+size));const type=record.readUInt32LE();
    if(types.has(type)){
      const narrow=type>=88,count=record.readUInt32LE(24),pointSize=narrow?8:4,typeCount=[56,92].includes(type)?count:0;
      const target=Buffer.alloc((28+count*pointSize+typeCount+3)&~3);record.copy(target,0,0,28);
      target.writeUInt32LE(types.get(type));target.writeUInt32LE(target.length,4);
      for(let i=0;i<count*2;i++){
        const value=narrow?record.readInt16LE(28+i*2):record.readInt32LE(28+i*4);
        if(narrow)target.writeInt32LE(value,28+i*4);else target.writeInt16LE(value,28+i*2);
      }
      if(typeCount)record.copy(target,28+count*pointSize,28+count*(narrow?4:8),28+count*(narrow?4:8)+typeCount);
      record=target;changed=true;
    }
    records.push(record);at+=size;
  }
  assert.ok(changed,'Fixture must exercise a point-array continuation');
  const result=Buffer.concat(records);result.writeUInt32LE(result.length,48);return result;
}

for(const name of ['cosmetic-angle-arc-polyline-to','cosmetic-angle-arc-bezier-to','cosmetic-angle-arc-poly-draw','cosmetic-angle-arc-polyline-path','cosmetic-angle-arc-bezier-path','cosmetic-angle-arc-polydraw-path']){
  const fixtures=JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8'));
  for(const {Index,Recorded,Compatible,PlaybackDifferences,Source,Hash} of fixtures){
    assert.ok(Recorded&&Compatible&&PlaybackDifferences===0,'Point continuation requires independent compatible native API/replay equality');
    const bytes=Buffer.from(Source.split(',')[1],'base64');
    test(`Native point continuation pixels and phase ${name} ${Index}`,()=>assert.equal(maskHash(bytes),Hash));
    test(`Alternate point width keeps native pixels and phase ${name} ${Index}`,()=>assert.equal(maskHash(alternatePointWidth(bytes)),Hash));
  }
}
