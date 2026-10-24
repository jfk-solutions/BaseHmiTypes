import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MetafileToSvgRenderer,HmiScreenToHtmlConverter,HmiScreen,HmiLayer,HmiGraphicView,staticProperty as p} from '../dist/index.js';

// Native-only Windows oracle; shared verbatim with the C# regression suite.
const fixtures=JSON.parse(fs.readFileSync(new URL('../../../tests/BaseHmiTypes.Tests/Fixtures/cosmetic-curves.json',import.meta.url),'utf8'));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
function maskHash(svg,index){
  const mask=Buffer.alloc(6400);
  if(index%12===8)assert.ok(svg.includes('clip-path'));
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){
    const a=attrs(m[0]);if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const point of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){
      const x=Number(point[1]),y=Number(point[2]);
      if(x<0||x>=80||y<0||y>=80||index%12===8&&(x<15||x>=55||y<10||y>=45))continue;
      mask[y*80+x]=a.fill==='#123456'?1:2;
    }
  }
  return createHash('sha256').update(mask).digest('hex');
}
for(const {Index,Source,Hash} of fixtures)test(`Cosmetic curve matches native GDI mask ${Index}`,()=>assert.equal(maskHash(new MetafileToSvgRenderer().render(Buffer.from(Source.split(',')[1],'base64'),'.emf'),Index),Hash));
test('HTML preserves native curve and original source',async()=>{
  const {Source,Hash}=fixtures[0],item=Object.assign(new HmiGraphicView(),{name:'Curve',source:p(Source)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/u);assert.ok(match);
  assert.equal(maskHash(decodeURIComponent(match[1]),0),Hash);assert.equal(item.source.staticValue,Source);
});
function record(t,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(t);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
test('Fractional transforms retain atomic vector fallback',()=>{
  const float=v=>{const b=Buffer.alloc(4);b.writeFloatLE(v);return b.readUInt32LE();};
  const data=emf(record(38,1,1,1,0,0x563412),record(37,1),record(35,float(1),0,0,float(1),float(.25),0),record(2,0,0,39,39,4,4,30,10,4,30,4,36,30));
  const svg=new MetafileToSvgRenderer().render(data,'.emf');assert.ok(svg.includes('C '));assert.ok(!svg.includes('h1v1h-1Z'));
});
test('Oversized curves retain atomic vector fallback',()=>{
  const data=emf(record(38,1,1,1,0,0x563412),record(37,1),record(2,0,0,39,39,4,4,30,2147483647,4,30,-2147483648,36,30));
  const svg=new MetafileToSvgRenderer().render(data,'.emf');assert.ok(svg.includes('C '));assert.ok(!svg.includes('h1v1h-1Z'));
});
