import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const bits=f=>{const b=Buffer.alloc(4);b.writeFloatLE(f);return b.readUInt32LE();};
const A=[2,0,0,3,10,20],B=[0,1,-1,0,40,0],world=m=>record(35,...m.map(bits)),modify=(mode,m=B)=>record(36,...m.map(bits),mode),points=()=>record(3,0,0,39,39,3,5,5,35,5,20,35),svg=(...r)=>new MetafileToSvgRenderer().render(emf(...r),'.emf'),attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const draw=s=>attrs(s.replace(/<defs>[^]*?<\/defs>/,'').match(/<(?:line|path)\b[^>]*>/)[0]),original=d=>assert.deepEqual([d.x1,d.y1,d.x2,d.y2],['14','29','18','35']);
for(const [mode,expected] of [[1,['2','3','4','5']],[2,['84','26','80','32']],[3,['11','14','5','18']],[4,['37','2','35','4']]])test(`All modes match native composition: ${mode}`,()=>{const d=draw(svg(record(27,2,3),world(A),modify(mode),record(54,4,5)));assert.deepEqual([d.x1,d.y1,d.x2,d.y2],expected);});
for(const mode of [0,5,0xffffffff])test(`Unknown mode retains transform: ${mode}`,()=>original(draw(svg(world(A),modify(mode),record(27,2,3),record(54,4,5)))));
test('Identity ignores nonfinite Xform',()=>{const d=draw(svg(world(A),modify(1,[NaN,Infinity,0,0,0,0]),record(27,2,3),record(54,4,5)));assert.equal(d.x1,'2');assert.equal(d.y2,'5');});
for(const count of [0,1,2,3,4,5])test(`Truncated SET does not read following record: ${count}`,()=>original(draw(svg(world(A),record(35,...B.slice(0,count).map(bits)),record(27,2,3),record(54,4,5)))));
for(const count of [0,1,2,3,4,5,6])test(`Truncated MODIFY does not read following record: ${count}`,()=>original(draw(svg(world(A),record(36,...B.slice(0,count).map(bits)),record(27,2,3),record(54,4,5)))));
for(const collinear of [false,true])test(`Singular SET retains transform: ${collinear}`,()=>original(draw(svg(world(A),world(collinear?[1,2,2,4,10,20]:[1,0,0,0,0,0]),record(27,2,3),record(54,4,5)))));
for(const mode of [2,3,4])for(const collinear of [false,true])test(`Singular MODIFY retains transform: ${mode}/${collinear}`,()=>original(draw(svg(world(A),modify(mode,collinear?[1,2,2,4,10,20]:[1,0,0,0,0,0]),record(27,2,3),record(54,4,5)))));
test('Identity ignores singular Xform',()=>{const d=draw(svg(world(A),modify(1,[1,0,0,0,0,0]),record(27,2,3),record(54,4,5)));assert.equal(d.x1,'2');assert.equal(d.y2,'5');});
test('SaveRestore retains previous composition',()=>original(draw(svg(world(A),record(33),modify(2),record(34,-1),record(27,2,3),record(54,4,5)))));
for(const open of [false,true])test(`Modification does not consume/remap recorded path: ${open}`,()=>{const r=[record(59),points()];if(!open)r.push(record(60));r.push(world(A),modify(2));if(open)r.push(record(60));r.push(record(63,0,0,39,39));assert.equal(draw(svg(...r)).d,'M 5 5 L 35 5 L 20 35 Z');});
test('Modification does not remap selected device clip',()=>{const region=record(75,48,5,32,1,1,16,0,0,39,39,5,6,35,36),s=svg(region,world(A),modify(2),record(54,4,5));assert.equal(draw(s)['clip-path'],'url(#clip1)');assert.equal(attrs(s.match(/<path\b[^>]*>/)[0]).d,'M 5 6 L 35 6 L 35 36 L 5 36 Z');});
