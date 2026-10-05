import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,v)=>b.writeUInt32LE(v,at);u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,b.length);u(52,records.length+2);b.writeUInt16LE(2,56);return b;}
function wmfRecord(type,...values){const b=Buffer.alloc(6+values.length*2);b.writeUInt32LE(b.length/2);b.writeUInt16LE(type,4);values.forEach((v,i)=>b.writeInt16LE(v,6+i*2));return b;}
function wmf(...records){const b=Buffer.concat([Buffer.alloc(18),...records,wmfRecord(0)]);b.writeUInt16LE(1);b.writeUInt16LE(9,2);b.writeUInt16LE(0x300,4);b.writeUInt32LE(b.length/2,6);b.writeUInt16LE(2,10);b.writeUInt32LE(Math.max(3,...records.map(r=>r.length/2)),12);return b;}
const arc=(type,ex=20,ey=-100)=>record(type,5,5,35,35,100,20,ex,ey),closed=type=>type===46||type===47;
const render=(b,format='.emf')=>new MetafileToSvgRenderer().render(b,format);
const elements=(b,format='.emf')=>[...render(b,format).matchAll(/<(path|line)\b([^>]+)>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
const shape=(...records)=>elements(emf(...records)).find(e=>e.tag==='path');
async function html(b,isWmf){const original=Buffer.from(b),uri='data:image/'+(isWmf?'wmf':'emf')+';base64,'+b.toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Arc',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const result=await new HmiScreenToHtmlConverter().convertAsync(screen),match=result.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.equal([...decodeURIComponent(match[1]).matchAll(/<path\b/g)].length,1);assert.equal(item.source.staticValue,uri);assert.deepEqual(b,original);}
for(const type of [45,46,47,55]){
 for(const active of [false,true])test(`Direct/recorded arc uses ray intersections: ${type}/${active}`,()=>{const r=[record(37,0x80000000),record(27,1,2)];if(active)r.push(record(59));r.push(arc(type));if(active)r.push(record(60),record(closed(type)?63:64,0,0,39,39));const e=shape(...r);assert.ok(e.d.startsWith((type===55?'M 1 2 L':'M')+' 35 20 C 35 11.716 28.284 5 20 5'));assert.equal(e.d.endsWith('Z'),closed(type));assert.equal(e.fill,closed(type)?'#ffffff':'none');if(type===47)assert.ok(e.d.endsWith('L 20 20 Z'));});
 test(`Arc native current position: ${type}`,()=>{const e=elements(emf(record(27,1,2),arc(type),record(54,8,9))).find(e=>e.tag==='line');assert.equal(e.x1,type===55?'20':'1');assert.equal(e.y1,type===55?'5':'2');});
 test(`Clockwise arc selects long sweep: ${type}`,()=>{const d=shape(record(27,1,2),record(57,2),arc(type)).d;assert.equal([...d.matchAll(/C /g)].length,3);assert.ok(d.includes('35 28.284 28.284 35 20 35'));});
 test(`Same-ray arc is complete ellipse: ${type}`,()=>assert.equal([...shape(arc(type,100,20)).d.matchAll(/C /g)].length,4));
 test(`Abort discards captured arc: ${type}`,()=>assert.equal(elements(emf(record(59),arc(type),record(68))).length,0));
 test(`Arc transforms curve controls: ${type}`,()=>assert.ok(shape(record(35,0,0x3f800000,0xbf800000,0,0x42200000,0),arc(type)).d.includes('20 35 C 28.284 35 35 28.284 35 20')));
 for(const count of [0,7])test(`Truncated arc fields ignored: ${type}/${count}`,()=>assert.equal(elements(emf(record(type,...Array(count).fill(5)))).length,0));
 test(`Arc reversed bounds same geometry: ${type}`,()=>assert.equal(shape(arc(type)).d,shape(record(type,35,35,5,5,100,20,20,-100)).d));
 test(`Arc HTML preserves source: ${type}`,async()=>await html(emf(arc(type)),false));
}
test('ArcTo after closed figure continues at DC point',()=>assert.ok(shape(record(27,5,5),record(59),record(3,0,0,39,39,3,5,5,35,5,20,35),arc(55),record(60),record(64,0,0,39,39)).d.includes('Z M 5 5 L 35 20 C')));
for(const type of [46,47])test(`Closed arc becomes clip: ${type}`,()=>{const b=emf(record(59),arc(type),record(60),record(67,5),arc(45));assert.equal([...render(b).matchAll(/<clipPath\b/g)].length,1);assert.equal(elements(b).at(-1)['clip-path'],'url(#clip1)');});
for(const type of [0x817,0x830,0x81a]){
 test(`WMF arc native parameter order: ${type}`,()=>{const e=elements(wmf(wmfRecord(type,-100,20,20,100,35,35,5,5)),'.wmf')[0];assert.ok(e.d.startsWith('M 35 20 C 35 11.716 28.284 5 20 5'));assert.equal(e.d.endsWith('Z'),type!==0x817);});
 test(`WMF truncated arc ignored: ${type}`,()=>assert.equal(elements(wmf(wmfRecord(type,5,5,5,5,5,5,5)),'.wmf').length,0));
 test(`WMF arc HTML preserves source: ${type}`,async()=>await html(wmf(wmfRecord(type,-100,20,20,100,35,35,5,5)),true));
}
