import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';
const fixtures=['widen-flat-paths','widen-square-paths','widen-square-edges','widen-round-miter','widen-round-miter-edges','widen-round-bevel','widen-round-bevel-edges','widen-round-round','widen-round-round-edges','widen-round-round-ties'].flatMap(name=>JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/${name}.json`,import.meta.url),'utf8')).map(f=>({...f,Cohort:name})));
function maskHash(svg){
  const mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }
  return createHash('sha256').update(mask).digest('hex');
}
for(const {Cohort,Index,Recorded,PlaybackDifferences,Cap,Join=2,Source,Hash,Width,Input,Points} of fixtures){
  assert.ok(Recorded&&PlaybackDifferences===0&&[0,1,2].includes(Cap)&&[0,1,2].includes(Join),'Widening requires independent native API/replay equality');
  const bytes=Buffer.from(Source.split(',')[1],'base64'),input=Input.map(p=>p.map(v=>v/16)),expected=Points.map(p=>p.map(v=>v/16));
  test(`Native widen outline ${Cohort} ${Index}`,async()=>{
    const {buildNativeFlatPen}=await import('../dist/images/converters/native-flat-pen-builder.js');assert.deepEqual(buildNativeFlatPen(input[0],input[1],Width,Cap===1,Cap===0,Join===0),expected);
  });
  test(`Native widen fill pixels ${Cohort} ${Index}`,()=>assert.equal(maskHash(new MetafileToSvgRenderer().render(bytes,'.emf')),Hash));
  test(`Native widen clip geometry ${Cohort} ${Index}`,()=>{
    const source=Buffer.from(bytes);
    for(let at=source.readUInt32LE(4);at<source.length;at+=source.readUInt32LE(at+4))if(source.readUInt32LE(at)===62){source.writeUInt32LE(67,at);source.writeUInt32LE(5,at+8);}
    const svg=new MetafileToSvgRenderer().render(source,'.emf'),d=expected.map((p,i)=>`${i?'L':'M'} ${p[0]} ${p[1]}`).join(' ')+' Z';
    assert.ok([...svg.matchAll(/\bd="([^"]*)"/gu)].some(m=>m[1]===d));
  });
}
for(const width of [NaN,Infinity,0,-1,4097])test(`Invalid native widening width is atomic ${width}`,async()=>{
  const {buildNativeFlatPen}=await import('../dist/images/converters/native-flat-pen-builder.js');for(const cap of [0,1,2])assert.equal(buildNativeFlatPen([0,0],[10,10],width,cap===1,cap===0),undefined);
});
test('Invalid widening coordinates and raster budget are atomic',async()=>{
  const {buildNativeFlatPen}=await import('../dist/images/converters/native-flat-pen-builder.js');
  const {fillNativeQuad}=await import('../dist/images/converters/native-quad-rasterizer.js');
  for(const cap of [0,1,2]){assert.equal(buildNativeFlatPen([.01,0],[10,10],1,cap===1,cap===0),undefined);assert.equal(buildNativeFlatPen([0,0],[0,0],1,cap===1,cap===0),undefined);}
  assert.equal(fillNativeQuad([[0,0],[0,1000],[1000,1000],[1000,0]]),undefined);
});
test('Polygon fill honors alternate and winding rules',async()=>{
  const {fillNativeQuad}=await import('../dist/images/converters/native-quad-rasterizer.js'),box=[[0,0],[0,3],[3,3],[3,0]],twice=[...box,...box];
  assert.equal(fillNativeQuad(twice),'');assert.equal(fillNativeQuad(twice,true),Array.from({length:3},(_,y)=>Array.from({length:3},(_,x)=>`M ${x} ${y}h1v1h-1Z`)).flat().join(' '));
  assert.equal(fillNativeQuad(Array.from({length:500},()=>box).flat().map(([x,y])=>[x,y*1000])),undefined);
});
