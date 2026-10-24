import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer,HmiScreenToHtmlConverter,HmiScreen,HmiLayer,HmiGraphicView,staticProperty as p} from '../dist/index.js';

const fixtures=JSON.parse(fs.readFileSync(new URL('../../../tests/BaseHmiTypes.Tests/Fixtures/cosmetic-fractional-paths.json',import.meta.url),'utf8'));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
function maskHash(svg){
  const mask=Buffer.alloc(6400);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=attrs(m[0]);if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){
      const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=a.fill==='#123456'?1:2;
    }
  }
  return createHash('sha256').update(mask).digest('hex');
}
const render=data=>new MetafileToSvgRenderer().render(data,'.emf');
for(const {Index,Source,Hash} of fixtures)test(`Fractional Polyline matches native GDI ${Index}`,()=>assert.equal(maskHash(render(Buffer.from(Source.split(',')[1],'base64'))),Hash));
function record(t,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(t);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
function records(source){const bytes=Buffer.from(source.split(',')[1],'base64'),result=[];for(let at=88;at<bytes.length;){const size=bytes.readUInt32LE(at+4);if(bytes.readUInt32LE(at)===14)break;result.push(Buffer.from(bytes.subarray(at,at+size)));at+=size;}return result;}
for(const index of [337,521,591,843]){
  test(`Stored path retains fractional vertices across save/restore ${index}`,()=>{
    const {Source,Hash}=fixtures.find(f=>f.Index===index),r=records(Source),poly=r.pop();r.push(record(59),poly,record(60),record(33),record(35,0x3f800000,0,0,0x3f800000,0,0),record(34,-1),record(64,0,0,79,79));
    assert.equal(maskHash(render(emf(...r))),Hash);
  });
  test(`Short point array retains native fractional phase ${index}`,()=>{
    const {Source,Hash}=fixtures.find(f=>f.Index===index),r=records(Source),poly=r.pop(),count=poly.readUInt32LE(24),short=Buffer.alloc(28+4*count);poly.copy(short,0,0,28);short.writeUInt32LE(87);short.writeUInt32LE(short.length,4);
    for(let i=0;i<count*2;i++)short.writeInt16LE(poly.readInt32LE(28+i*4),28+i*2);r.push(short);assert.equal(maskHash(render(emf(...r))),Hash);
  });
}
test('HTML preserves fractional phase and source',async()=>{
  const {Source,Hash}=fixtures.find(f=>f.Index===591),item=Object.assign(new HmiGraphicView(),{name:'Fractional',source:p(Source)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/u);assert.ok(match);
  assert.equal(maskHash(decodeURIComponent(match[1])),Hash);assert.equal(item.source.staticValue,Source);
});
