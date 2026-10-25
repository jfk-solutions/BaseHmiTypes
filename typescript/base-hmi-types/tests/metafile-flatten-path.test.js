import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';
const fixtures=['flatten-paths','flatten-large-paths'].flatMap(name=>JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8')).map(f=>({...f,Cohort:name})));
function maskHash(svg){
  const mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }
  return createHash('sha256').update(mask).digest('hex');
}
for(const {Cohort,Index,Recorded,PlaybackDifferences,Source,Hash,Points,Types} of fixtures){
  assert.ok(Recorded&&PlaybackDifferences===0,'FlattenPath requires native API/replay equality');
  const bytes=Buffer.from(Source.split(',')[1],'base64'),types=Buffer.from(Types,'base64');
  const expected=Points.map((p,i)=>{const type=types[i];assert.ok([2,3,6].includes(type));return `${(type&~1)===6?'M':'L'} ${p[0]/16} ${p[1]/16}${type&1?' Z':''}`;}).join(' ');
  test(`Native FlattenPath stroke pixels and phase ${Cohort} ${Index}`,()=>assert.equal(maskHash(new MetafileToSvgRenderer().render(bytes,'.emf')),Hash));
  for(const consumer of [62,67])test(`FlattenPath consumer ${consumer} uses native points ${Cohort} ${Index}`,()=>{
    const source=Buffer.from(bytes);
    for(let at=source.readUInt32LE(4);at<source.length;at+=source.readUInt32LE(at+4))if(source.readUInt32LE(at)===64){source.writeUInt32LE(consumer,at);if(consumer===67)source.writeUInt32LE(5,at+8);}
    const svg=new MetafileToSvgRenderer().render(source,'.emf');
    assert.ok([...svg.matchAll(/\bd="([^"]*)"/gu)].some(m=>m[1]===expected),'Consumer must use the exact native line stream, not retained cubics');
  });
}
