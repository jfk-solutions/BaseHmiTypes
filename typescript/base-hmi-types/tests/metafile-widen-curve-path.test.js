import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';

const cohorts=['widen-curves-open','widen-curves-closed','widen-curves-winding','widen-curves-preflatten'];
for(const cohort of cohorts)for(const f of JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${cohort}.json`,import.meta.url),'utf8'))){
  assert.ok(f.Recorded&&f.PlaybackDifferences===0&&f.Curves&&f.Cap===0&&f.Join===0,'Curved widening requires independent native capture');
  const bytes=Buffer.from(f.Source.split(',')[1],'base64'),types=Buffer.from(f.Types,'base64');
  const expected=f.Points.map((p,i)=>`${(types[i]&~1)===6?'M':'L'} ${p[0]/16} ${p[1]/16}${types[i]&1?' Z':''}`).join(' ');
  test(`Native curve fill ${cohort} ${f.Index}`,()=>{
    const svg=new MetafileToSvgRenderer().render(bytes,'.emf'),mask=Buffer.alloc(6400);
    for(const match of svg.matchAll(/<path\b[^>]*>/gu)){
      const a=Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
      for(const p of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=+p[1],y=+p[2];if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
    }
    assert.equal(createHash('sha256').update(mask).digest('hex'),f.Hash);
  });
  test(`Native curve outline ${cohort} ${f.Index}`,()=>{
    const source=Buffer.from(bytes);
    for(let at=source.readUInt32LE(4);at<source.length;at+=source.readUInt32LE(at+4))if(source.readUInt32LE(at)===62){source.writeUInt32LE(67,at);source.writeUInt32LE(5,at+8);}
    const svg=new MetafileToSvgRenderer().render(source,'.emf');assert.ok([...svg.matchAll(/\bd="([^"]*)"/gu)].some(m=>m[1]===expected));
  });
}

test('Invalid tangent overrides fail atomically',async()=>{
  const {buildNativeRoundFigures}=await import('../dist/images/converters/native-flat-pen-builder.js');
  const points=[[0,0],[8,8],[16,0]];
  for(const entry of [[-1,[1,0]],[2,[1,0]],[0,[0,0]],[0,[NaN,0]],[0,[.01,0]]])assert.equal(buildNativeRoundFigures(points,3,false,new Map([entry])),undefined);
});
