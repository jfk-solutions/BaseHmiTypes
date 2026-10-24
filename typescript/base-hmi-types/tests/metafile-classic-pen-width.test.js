import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {MetafileToSvgRenderer} from '../dist/index.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('../../../tests/BaseHmiTypes.Tests/Fixtures/classic-pen-widths.json',import.meta.url),'utf8'));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
for(const {Index,Source,Rows,Pixels} of fixtures)test(`Native classic pen width selects pixel or geometric contract ${Index}`,()=>{
  const svg=new MetafileToSvgRenderer().render(Buffer.from(Source.split(',')[1],'base64'),'.emf');
  if(Rows.length>1){const line=attrs(svg.match(/<line\b[^>]*>/u)[0]);assert.equal(line['stroke-width'],String(Rows.length));assert.equal(line['stroke-dasharray'],undefined);assert.equal(line['stroke-linecap'],'round');return;}
  const actual=Array(6400).fill(-1);
  for(const m of svg.matchAll(/<path\b[^>]*>/gu)){const a=attrs(m[0]);if(!['#123456','#ff0000'].includes(a.fill))continue;
    for(const p of a.d.matchAll(/M (-?\d+) (-?\d+)h1v1h-1Z/gu)){const x=Number(p[1]),y=Number(p[2]);if(x>=0&&x<80&&y>=0&&y<80)actual[y*80+x]=a.fill==='#123456'?0x563412:255;}
  }assert.deepEqual(actual,Pixels);
});
