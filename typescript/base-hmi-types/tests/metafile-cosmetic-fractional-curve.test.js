import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {flattenNativeBezier} from '../dist/images/converters/native-bezier-flattener.js';
import {MetafileToSvgRenderer,HmiScreenToHtmlConverter,HmiScreen,HmiLayer,HmiGraphicView,staticProperty as p} from '../dist/index.js';
const load=name=>JSON.parse(fs.readFileSync(new URL(`../../../tests/BaseHmiTypes.Tests/Fixtures/cosmetic-${name}.json`,import.meta.url),'utf8'));
const fixtures=['fractional','wide','joined'].flatMap(group=>load(`${group}-curves`).map(f=>({...f,group})));
const render=source=>new MetafileToSvgRenderer().render(Buffer.from(source.split(',')[1],'base64'),'.emf');
function maskHash(svg,clipped=false){
  const mask=Buffer.alloc(6400);if(clipped)assert.ok(svg.includes('clip-path'));
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){
      const x=Number(point[1]),y=Number(point[2]);if(x>=0&&x<80&&y>=0&&y<80&&(!clipped||x>=15&&x<55&&y>=10&&y<65))mask[y*80+x]=a.fill==='#123456'?1:2;
    }
  }return createHash('sha256').update(mask).digest('hex');
}
for(const {group,Index,Source,Hash,Controls,Flattened} of fixtures){
  test(`Native fixed subdivision ${group}/${Index}`,()=>{
    const controls=Controls.map(p=>p.map(v=>v/16)),actual=[controls[0]];
    for(let i=0;i+3<controls.length;i+=3){const part=flattenNativeBezier(controls.slice(i,i+4));assert.ok(part);actual.push(...part.slice(1));}
    assert.deepEqual(actual,Flattened.map(p=>p.map(v=>v/16)));
  });
  test(`Native fractional curve raster ${group}/${Index}`,()=>{
    const svg=render(Source),expected=Flattened.map(p=>p.map(v=>v/16));let budget=0;
    for(let i=1;i<expected.length;i++)budget+=Math.max(...expected[i].map((v,a)=>Math.abs(v-expected[i-1][a])))+2;
    if(budget>262144){assert.ok(svg.includes('C '));assert.ok(!svg.includes('h1v1h-1Z'));}else assert.equal(maskHash(svg),Hash);
  });
}
for(const {Index,Source,Hash} of load('fractional-curve-styles'))test(`Native fractional curve style ${Index}`,()=>assert.equal(maskHash(render(Source)),Hash));
for(const {Index,Source,Hash} of load('curve-sequences'))test(`Native fractional mixed call phase ${Index}`,()=>assert.equal(maskHash(render(Source),Index%12===10),Hash));
function record(t,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(t);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function records(source){const bytes=Buffer.from(source.split(',')[1],'base64'),result=[];for(let at=88;at<bytes.length;){const size=bytes.readUInt32LE(at+4);if(bytes.readUInt32LE(at)===14)break;result.push(bytes.subarray(at,at+size));at+=size;}return result;}
function emf(rs){const b=Buffer.concat([Buffer.alloc(88),...rs,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,79],[20,79],[40,0x464d4520],[44,0x10000],[48,b.length],[52,rs.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const renderRecords=rs=>new MetafileToSvgRenderer().render(emf(rs),'.emf');
const fixture=index=>fixtures.find(f=>f.group==='fractional'&&f.Index===index);
for(const index of [189,327,485,889]){
  test(`Short fractional curve ${index}`,()=>{const f=fixture(index),rs=records(f.Source),curve=rs.at(-1),short=Buffer.alloc(44);curve.copy(short,0,0,28);short.writeUInt32LE(85);short.writeUInt32LE(44,4);for(let i=0;i<8;i++)short.writeInt16LE(curve.readInt32LE(28+4*i),28+2*i);rs[rs.length-1]=short;assert.equal(maskHash(renderRecords(rs)),f.Hash);});
  test(`Fractional BezierTo start ${index}`,()=>{const f=fixture(index),rs=records(f.Source),curve=rs.pop(),logical=Array.from({length:8},(_,i)=>curve.readInt32LE(28+4*i));rs.push(record(27,...logical.slice(0,2)),record(5,0,0,79,79,3,...logical.slice(2)));assert.equal(maskHash(renderRecords(rs)),f.Hash);});
  test(`Stored fractional controls survive transforms ${index}`,()=>{const f=fixture(index),rs=records(f.Source),curve=rs.pop();rs.push(record(59),curve,record(60),record(33),record(35,0x3f800000,0,0,0x3f800000,0,0),record(34,-1),record(35,0x3f800000,0,0,0x3f800000,0,0),record(64,0,0,79,79));assert.equal(maskHash(renderRecords(rs)),f.Hash);});
}
for(const value of [NaN,Infinity,Number.MAX_VALUE,.1])test(`Invalid native subdivision fails atomically ${value}`,()=>assert.equal(flattenNativeBezier([[value,0],[1,1],[2,2],[3,3]]),undefined));
for(const index of [112,116,120,124])test(`Modify identity retains advanced mapped coordinates ${index}`,()=>{const f=fixtures.find(f=>f.group==='joined'&&f.Index===index),rs=records(f.Source),world=rs.findIndex(r=>r.readUInt32LE()===35);assert.ok(world>=0);rs[world]=record(36,0,0,0,0,0,0,1);assert.equal(maskHash(renderRecords(rs)),f.Hash);});
test('HTML preserves fractional curve and original source',async()=>{
  const {Source,Hash}=fixture(189),item=Object.assign(new HmiGraphicView(),{name:'FractionalCurve',source:p(Source)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/u);assert.ok(match);assert.equal(maskHash(decodeURIComponent(match[1])),Hash);assert.equal(item.source.staticValue,Source);
});
