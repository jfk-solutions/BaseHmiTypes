import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
function bits(value){const b=Buffer.alloc(4);b.writeFloatLE(value);return b.readUInt32LE();}
const arc=(start=0,sweep=90,radius=15)=>record(41,20,20,radius,bits(start),bits(sweep));
function polygon(){const b=Buffer.alloc(52);b.writeUInt32LE(3);b.writeUInt32LE(52,4);b.writeUInt32LE(3,24);[5,5,35,5,20,35].forEach((v,i)=>b.writeInt32LE(v,28+i*4));return b;}
const render=(...records)=>new MetafileToSvgRenderer().render(emf(...records),'.emf');
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const elements=svg=>[...svg.replace(/<defs>[^]*?<\/defs>/,'').matchAll(/<(path|line)\b[^>]*>/g)].map(m=>({tag:m[1],...attrs(m[0])}));
const shape=(...records)=>elements(render(...records)).find(e=>e.tag==='path');
for(const active of [false,true])test(`AngleArc direct or recorded connects and strokes: ${active}`,()=>{const r=[record(37,0x80000000),record(27,1,2)];if(active)r.push(record(59));r.push(arc());if(active)r.push(record(60),record(64,0,0,39,39));const s=shape(...r);assert.equal(s.d,'M 1 2 L 35 20 C 35 11.716 28.284 5 20 5');assert.equal(s.fill,'none');});
for(const [sweep,x,y,curves] of [[90,20,5,1],[-90,20,35,1],[360,35,20,4],[720,35,20,8],[-450,20,35,5],[0,35,20,0]])test(`AngleArc sweep and current position: ${sweep}`,()=>{const e=elements(render(record(27,1,2),arc(0,sweep),record(54,8,9)));assert.equal((e[0].d.match(/C /g)??[]).length,curves);assert.equal(Number(e[1].x1),x);assert.equal(Number(e[1].y1),y);});
for(const sweep of [90,-90,720])test(`AngleArc ignores arc direction: ${sweep}`,()=>assert.equal(shape(arc(0,sweep)).d,shape(record(57,2),arc(0,sweep)).d));
for(const start of [90,450,-270])test(`AngleArc start measured counterclockwise: ${start}`,()=>assert.ok(shape(arc(start)).d.startsWith('M 0 0 L 20 5 C')));
test('AngleArc zero radius connects and moves DC point',()=>{assert.equal(shape(record(27,1,2),arc(0,90,0)).d,'M 1 2 L 20 20');const line=elements(render(arc(0,90,0),record(54,8,9))).find(e=>e.tag==='line');assert.equal(line.x1,'20');assert.equal(line.y1,'20');});
test('AngleArc radius is unsigned',()=>assert.ok(shape(arc(0,0,-1)).d.includes('L 4294967315 20')));
for(const active of [false,true])test(`AngleArc transforms cubic controls: ${active}`,()=>{const r=[record(35,0,bits(1),bits(-1),0,bits(40),0)];if(active)r.push(record(59));r.push(arc());if(active)r.push(record(60),record(64,0,0,39,39));assert.ok(shape(...r).d.includes('L 20 35 C 28.284 35 35 28.284 35 20'));});
test('AngleArc viewport mapping affects all controls',()=>assert.ok(shape(record(9,10,10),record(11,20,30),record(12,4,7),arc()).d.includes('L 74 67 C 74 42.147 60.569 22 44 22')));
test('AngleArc abort drops geometry but keeps endpoint',()=>{const e=elements(render(record(59),arc(),record(68),record(54,8,9)));assert.equal(e.length,1);assert.equal(Number(e[0].x1),20);assert.equal(Number(e[0].y1),5);});
test('AngleArc starts new figure after closed polygon',()=>assert.ok(shape(record(27,1,2),record(59),polygon(),arc(),record(60),record(64,0,0,39,39)).d.includes('Z M 1 2 L 35 20 C')));
test('Recorded line continues from AngleArc endpoint',()=>assert.ok(shape(record(59),arc(),record(54,8,9),record(60),record(64,0,0,39,39)).d.endsWith('20 5 L 8 9')));
test('AngleArc SaveRestore restores DC point',()=>assert.equal(elements(render(record(27,1,2),record(33),arc(),record(34,-1),record(54,8,9))).find(e=>e.tag==='line').x1,'1'));
for(const mask of [false,true])test(`AngleArc direct output respects clip or mask: ${mask}`,()=>{const r=[record(59),polygon(),record(60),record(67,5)];if(mask)r.push(record(59),polygon(),record(60),record(67,1));r.push(arc());assert.equal(shape(...r)[mask?'mask':'clip-path'],mask?'url(#mask2)':'url(#clip1)');});
test('AngleArc recorded path can become a clip',()=>assert.equal([...render(record(59),arc(0,360),record(60),record(67,5),record(43,0,0,39,39)).matchAll(/<clipPath\b/g)].length,1));
for(const count of [0,1,2,3,4])test(`AngleArc truncated fields ignored: ${count}`,()=>assert.equal(elements(render(record(41,...Array(count).fill(20)))).length,0));
for(const [start,sweep] of [[0x7fc00000,0],[0x7f800000,0],[0,0x7fc00000],[0,0x7f800000],[0,0x7f7fffff]])test(`AngleArc invalid or unbounded floats retain state: ${start}/${sweep}`,()=>{const e=elements(render(record(27,1,2),record(59),record(41,20,20,15,start,sweep),record(60),record(64,0,0,39,39),record(54,8,9)));assert.equal(e.length,1);assert.equal(e[0].x1,'1');assert.equal(e[0].y1,'2');});
for(const active of [false,true])test(`HTML AngleArc preserves source: ${active}`,async()=>{const r=[];if(active)r.push(record(59));r.push(arc());if(active)r.push(record(60),record(64,0,0,39,39));const b=emf(...r),original=Buffer.from(b),uri='data:image/emf;base64,'+b.toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Angle',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.ok(decodeURIComponent(match[1]).includes('L 35 20 C 35 11.716 28.284 5 20 5'));assert.equal(item.source.staticValue,uri);assert.deepEqual(b,original);});
