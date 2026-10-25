import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';

const names=['arc-compatible-stored','arc-compatible-direct','arc-compatible-chain1','arc-compatible-chain2','arc-compatible-prelude','arc-compatible-direct-prelude'];
function maskHash(bytes){
  const svg=new MetafileToSvgRenderer().render(bytes,'.emf'),mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }return createHash('sha256').update(mask).digest('hex');
}
for(const name of names){
  const fixtures=JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8'));
  for(const {Index,Compatible,Recorded,PlaybackDifferences,Source,Hash} of fixtures){
    assert.ok(Compatible&&Recorded&&PlaybackDifferences>=0,'Recorded arc tests require actual native EMF playback, not direct-API pixels');
    test(`Native recorded arc pixel and phase ${name} ${Index}`,()=>assert.equal(maskHash(Buffer.from(Source.split(',')[1],'base64')),Hash));
  }
}
