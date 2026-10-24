import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer} from '../dist/index.js';
import {buildNativeEllipse} from '../dist/images/converters/native-ellipse-builder.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('../../../tests/BaseHmiTypes.Tests/Fixtures/cosmetic-ellipses.json',import.meta.url),'utf8'));
function maskHash(bytes){
  const svg=new MetafileToSvgRenderer().render(bytes,'.emf'),mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;}
  }return createHash('sha256').update(mask).digest('hex');
}
function record(t,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(t);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(rs){const b=Buffer.concat([Buffer.alloc(88),...rs,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,79],[20,79],[40,0x464d4520],[44,0x10000],[48,b.length],[52,rs.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
for(const {Index,Source,Hash,Controls,Corners} of fixtures){
  test(`Native ellipse controls ${Index}`,()=>{const cw=Index%50%20>=10,p=Corners.map(p=>p.map(v=>v/16)),input=cw?[p[2],p[3],p[1]]:[p[1],p[0],p[2]];assert.deepEqual(buildNativeEllipse(input,cw),Controls.map(p=>p.map(v=>v/16)));});
  test(`Native ellipse dash phase ${Index}`,()=>assert.equal(maskHash(Buffer.from(Source.split(',')[1],'base64')),Hash));
  test(`Stored ellipse preserves frozen controls ${Index}`,()=>{
    const bytes=Buffer.from(Source.split(',')[1],'base64'),rs=[];
    for(let at=88;at<bytes.length;){const type=bytes.readUInt32LE(at),size=bytes.readUInt32LE(at+4);if(type===14)break;if(type===42)rs.push(record(59));rs.push(bytes.subarray(at,at+size));
      if(type===42)rs.push(record(60),record(33),record(35,0x3f800000,0,0,0x3f800000,0,0),record(34,-1),record(35,0x3f800000,0,0,0x3f800000,0,0),record(64,0,0,79,79));at+=size;
    }assert.equal(maskHash(emf(rs)),Hash);
  });
}
for(const value of [NaN,Infinity,Number.MAX_VALUE,.1])test(`Invalid ellipse corners fail atomically ${value}`,()=>assert.equal(buildNativeEllipse([[value,0],[1,0],[0,1]],false),undefined));
