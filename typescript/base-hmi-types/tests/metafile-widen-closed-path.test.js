import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';

const fixtures=['widen-closed-alternate','widen-closed-winding'].flatMap(Cohort=>JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${Cohort}.json`,import.meta.url),'utf8')).map(f=>({...f,Cohort})));
function maskHash(svg){
  const mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const p of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=+p[1],y=+p[2];if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }
  return createHash('sha256').update(mask).digest('hex');
}
for(const {Cohort,Index,Recorded,PlaybackDifferences,Closed,Cap,Join,Source,Hash,Width,Input,Points,Types} of fixtures){
  assert.ok(Recorded&&PlaybackDifferences===0&&Closed&&Cap===0&&Join===0,'Closed widening requires independent native capture');
  const bytes=Buffer.from(Source.split(',')[1],'base64'),input=Input.map(p=>p.map(v=>v/16)),types=Buffer.from(Types,'base64'),expected=[];let current=[];
  for(let i=0;i<Points.length;i++){
    if(types[i]===6)assert.equal(current.length,0);else assert.equal(types[i]&~1,2);
    current.push(Points[i].map(v=>v/16));if(types[i]&1){expected.push(current);current=[];}
  }
  assert.equal(current.length,0);assert.ok(expected.length);
  test(`Native closed outline ${Cohort} ${Index}`,async()=>{
    const {buildNativeRoundFigures}=await import('../dist/images/converters/native-flat-pen-builder.js');assert.deepEqual(buildNativeRoundFigures(input,Width,true),expected);
  });
  test(`Native closed fill ${Cohort} ${Index}`,()=>assert.equal(maskHash(new MetafileToSvgRenderer().render(bytes,'.emf')),Hash));
  test(`Native closed clip ${Cohort} ${Index}`,()=>{
    const source=Buffer.from(bytes);for(let at=source.readUInt32LE(4);at<source.length;at+=source.readUInt32LE(at+4))if(source.readUInt32LE(at)===62){source.writeUInt32LE(67,at);source.writeUInt32LE(5,at+8);}
    const svg=new MetafileToSvgRenderer().render(source,'.emf'),d=expected.map(c=>c.map((p,i)=>`${i?'L':'M'} ${p[0]} ${p[1]}`).join(' ')+' Z').join(' ');
    assert.ok([...svg.matchAll(/\bd="([^"]*)"/gu)].some(m=>m[1]===d));
  });
}

test('Compound fill rules and closed guards',async()=>{
  const {fillNativeContours}=await import('../dist/images/converters/native-quad-rasterizer.js'),{buildNativeRoundFigures}=await import('../dist/images/converters/native-flat-pen-builder.js');
  const outer=[[0,0],[0,8],[8,8],[8,0]],inner=[[2,2],[2,6],[6,6],[6,2]],count=s=>s.split('h1v1h-1Z').length-1;
  const alternate=fillNativeContours([outer,inner]);assert.equal(count(alternate),48);assert.equal(count(fillNativeContours([outer,inner],true)),64);
  assert.equal(fillNativeContours([outer,[...inner].reverse()],true),alternate);assert.equal(fillNativeContours([outer,outer]),'');
  assert.equal(fillNativeContours([outer,[]]),undefined);assert.equal(fillNativeContours([outer,[[NaN,0]]]),undefined);
  assert.equal(fillNativeContours(Array.from({length:500},()=>outer.map(([x,y])=>[x,y*1000]))),undefined);
  assert.equal(buildNativeRoundFigures([[0,0],[0,0]],3,true),undefined);assert.equal(buildNativeRoundFigures([[0,0],[1,1]],NaN,true),undefined);
});
