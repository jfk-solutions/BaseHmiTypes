import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/index.js';
function record(type,...v){const b=Buffer.alloc(8+v.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);v.forEach((x,i)=>b.writeUInt32LE(x>>>0,8+4*i));return b;}
function emf(...r){const b=Buffer.concat([Buffer.alloc(88),...r,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,r.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const fill=(rects=[[4,5,20,25]],brush=1)=>record(71,0,0,39,39,32+rects.length*16,brush,32,1,rects.length,rects.length*16,0,0,39,39,...rects.flat()),svg=(...r)=>new MetafileToSvgRenderer().render(emf(record(39,1,0,0x563412,0),...r),'.emf');
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]])),body=s=>s.replace(/<defs>[^]*?<\/defs>/u,''),path=s=>attrs(body(s).match(/<path\b[^>]*>/u)[0]);
const world=(...m)=>record(35,...m.map(f=>{const b=Buffer.alloc(4);b.writeFloatLE(f);return b.readUInt32LE();})),region=()=>record(75,48,5,32,1,1,16,0,0,39,39,5,6,35,36);
test('Solid region uses explicit brush without stroke',()=>{const p=path(svg(fill()));assert.equal(p.d,'M 4 5 L 20 5 L 20 25 L 4 25 Z');assert.equal(p.fill,'#123456');assert.equal(p.stroke,'none');assert.equal(p['fill-rule'],'nonzero');});
for(const [stock,color] of [[0,'#ffffff'],[1,'#c0c0c0'],[2,'#808080'],[3,'#404040'],[4,'#000000']])test(`Supports stock brushes: ${stock}`,()=>assert.equal(path(svg(fill(undefined,0x80000000+stock))).fill,color));
for(const brush of [0,99,0x80000005,0x80000007])test(`Invalid or null brush does not paint: ${brush}`,()=>assert.ok(!body(svg(fill(undefined,brush))).includes('<path')));
test('Explicit brush does not change selected brush',()=>{const s=svg(record(39,2,0,255,0),record(37,2),fill(),record(43,1,1,3,3));assert.equal(path(s).fill,'#123456');assert.equal(attrs(s.match(/<rect\b[^>]*>/u)[0]).fill,'#ff0000');});
test('Pen object cannot be used as brush',()=>assert.ok(!svg(record(38,1,0,3,0,0x563412),fill()).includes('<path')));
test('Compound region is a union regardless of polygon fill mode',()=>{const p=path(svg(record(19,1),fill([[2,3,12,13],[8,9,20,21]])));assert.equal(p['fill-rule'],'nonzero');assert.equal(p.d,'M 2 3 L 12 3 L 12 13 L 2 13 Z M 8 9 L 20 9 L 20 21 L 8 21 Z');});
for(const [kind,rects] of [[0,[]],[1,[[4,5,4,25]]]])test(`Empty and degenerate regions do not paint: ${kind}`,()=>assert.ok(!svg(fill(rects)).includes('<path')));
test('Transforms every corner',()=>assert.equal(path(svg(world(0,1,-1,0,30,0),fill())).d,'M 25 4 L 25 20 L 5 20 L 5 4 Z'));
test('Applies world then window viewport mapping',()=>assert.equal(path(svg(record(17,8),record(9,10,10),record(11,20,30),record(12,4,7),world(2,0,0,3,10,20),fill())).d,'M 40 112 L 104 112 L 104 292 L 40 292 Z'));
test('Resolves pending isotropic scaling',()=>assert.equal(path(svg(record(17,7),record(9,10,20),record(11,40,30),record(31,2,1,3,1),fill())).d,'M 18 22.5 L 90 22.5 L 90 112.5 L 18 112.5 Z'));
test('Fill does not change logical current point',()=>{const l=attrs(svg(record(27,2,3),fill(),record(54,8,9)).match(/<line\b[^>]*>/u)[0]);assert.equal(l.x1,'2');assert.equal(l.y1,'3');});
for(const open of [false,true])test(`Direct region fill does not consume path: ${open}`,()=>{const r=[record(59),record(27,2,3),record(54,8,9)];if(!open)r.push(record(60));r.push(fill());if(open)r.push(record(60));r.push(record(64,0,0,39,39));const paths=[...body(svg(...r)).matchAll(/<path\b[^>]*>/gu)];assert.equal(paths.length,2);assert.equal(attrs(paths[1][0]).d,'M 2 3 L 8 9');});
test('Device clip applies without reprojection',()=>{const s=svg(region(),world(2,0,0,3,10,20),fill());assert.equal(path(s)['clip-path'],'url(#clip1)');assert.equal(attrs(s.match(/<clipPath\b[^>]*><path\b([^>]*)>/u)[1]).d,'M 5 6 L 35 6 L 35 36 L 5 36 Z');});
test('Metaregion applies',()=>assert.match(svg(region(),record(28),fill()),/<g mask="url\(#[^)]+\)"><path/));
test('Nonfinite world geometry is not emitted',()=>assert.ok(!svg(world(1,0,0,1,NaN,0),fill()).includes('<path')));
test('Truncations do not read following record',()=>{const f=fill();for(let size=8;size<f.length;size+=4){const truncated=Buffer.from(f.subarray(0,size));truncated.writeUInt32LE(size,4);assert.ok(!svg(truncated,record(37,0x80000008)).includes('<path'),`size=${size}`);}});
for(const [offset,value] of [[24,0],[24,2147483647],[32,28],[36,2],[40,2147483647],[44,12],[64,21],[68,26]])test(`Malformed regions ignored atomically: ${offset}/${value}`,()=>{const f=fill();f.writeUInt32LE(value,offset);const s=svg(record(17,7),record(9,10,20),record(11,40,30),f,record(31,2,1,3,1),record(54,10,20)),l=attrs(s.match(/<line\b[^>]*>/u)[0]);assert.ok(!s.includes('<path'));assert.equal(l.x2,'45');assert.equal(l.y2,'90');});
