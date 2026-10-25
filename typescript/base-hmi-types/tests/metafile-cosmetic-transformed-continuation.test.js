import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';

function maskHash(source){
  const svg=new MetafileToSvgRenderer().render(Buffer.from(source.split(',')[1],'base64'),'.emf'),mask=Buffer.alloc(6400);
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

for(const name of ['cosmetic-angle-arc-transformed-line','cosmetic-angle-arc-transformed-arc','cosmetic-angle-arc-transformed-angle']){
  const fixtures=JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8'));
  for(const {Index,Recorded,PlaybackDifferences,Source,Hash} of fixtures){
    assert.ok(Recorded&&PlaybackDifferences===0,'Continuation requires independent native API/replay equality');
    test(`Native transformed continuation pixels and phase ${name} ${Index}`,()=>assert.equal(maskHash(Source),Hash));
  }
}
