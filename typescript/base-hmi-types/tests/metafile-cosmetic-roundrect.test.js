import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';
import {buildNativeRoundRect} from '../dist/images/converters/native-roundrect-builder.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('../../../tests/BaseHmiTypes.Tests/Fixtures/cosmetic-roundrects.json',import.meta.url),'utf8'));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
function maskHash(svg){
  const mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=attrs(m[0]);if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const p of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(p[1]),y=Number(p[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }return createHash('sha256').update(mask).digest('hex');
}
const render=bytes=>new MetafileToSvgRenderer().render(bytes,'.emf');
function records(source){const b=Buffer.from(source.split(',')[1],'base64'),rs=[];for(let at=88;at<b.length;){const size=b.readUInt32LE(at+4);if(b.readUInt32LE(at)===14)break;rs.push(b.subarray(at,at+size));at+=size;}return rs;}
function record(t,...v){const b=Buffer.alloc(8+v.length*4);b.writeUInt32LE(t);b.writeUInt32LE(b.length,4);v.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+4*i));return b;}
function emf(rs){const b=Buffer.concat([Buffer.alloc(88),...rs,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,79],[20,79],[40,0x464d4520],[44,0x10000],[48,b.length],[52,rs.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
for(const {Index,Source,Hash,PathHash,Controls,Corners} of fixtures){
  test(`Native roundrect controls ${Index}`,()=>{
    const shape=records(Source).find(r=>r.readUInt32LE()===44),i=at=>shape.readInt32LE(at),rx=Math.min(Math.abs(i(24))/(i(16)-i(8)),1),ry=Math.min(Math.abs(i(28))/(i(20)-i(12)),1),p=Corners.map(p=>p.map(v=>v/16));
    assert.deepEqual(buildNativeRoundRect([p[1],p[0],p[2]],rx,ry),Controls.map(p=>p.map(v=>v/16)));
  });
  test(`Native direct roundrect phase or widened pen contract ${Index}`,()=>{
    const rs=records(Source),world=rs.find(r=>r.readUInt32LE()===35),f=at=>world.readFloatLE(at),classic=rs.some(r=>r.readUInt32LE()===38),width=classic?Math.max(1,Math.floor(Math.max(Math.sqrt(f(8)**2+f(12)**2),Math.sqrt(f(16)**2+f(20)**2))+.5)):1;
    const svg=render(Buffer.from(Source.split(',')[1],'base64'));
    if(width===1)assert.equal(maskHash(svg),Hash);
    else {assert.notEqual(Hash,PathHash);assert.ok(!svg.includes('h1v1h-1Z'));assert.ok(svg.includes(`stroke-width="${width}"`));assert.ok(!svg.includes('stroke-dasharray'));}
  });
  test(`Stored roundrect retains controls after transform changes ${Index}`,()=>{
    const rs=records(Source),shape=rs.findIndex(r=>r.readUInt32LE()===44);rs.splice(shape,0,record(59));rs.push(record(60),record(33),record(35,0x3f800000,0,0,0x3f800000,0,0),record(34,-1),record(35,0x3f800000,0,0,0x3f800000,0,0),record(64,0,0,79,79));assert.equal(maskHash(render(emf(rs))),PathHash);
  });
}
for(const value of [NaN,Infinity,Number.MAX_VALUE,.1])test(`Invalid roundrect corners fail atomically ${value}`,()=>assert.equal(buildNativeRoundRect([[value,0],[1,0],[0,1]],.5,.5),undefined));
