import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const bits=f=>{const b=Buffer.alloc(4);b.writeFloatLE(f);return b.readUInt32LE();};
function world(variant){const m=variant===1?[.70710677,.70710677,-.70710677,.70710677,20,-2]:variant===2?[1,.5,1,1,0,0]:variant===3?[-1,.5,.5,1,28,0]:[0,1,-1,0,40,0];return record(35,...m.map(bits));}
const points=()=>record(3,0,0,39,39,3,5,5,35,5,20,35),svg=(...r)=>new MetafileToSvgRenderer().render(emf(...r),'.emf'),attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const body=s=>s.replace(/<defs>[^]*?<\/defs>/,'').replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,''),drawing=s=>{const tag=body(s).match(/^<[^>]*>/)[0];return {tag:tag.match(/^<(\w+)/)[1],...attrs(tag)};};
for(const type of [43,42])for(const variant of [0,1,2,3])test(`Direct affine shape matches full path: ${type}/${variant}`,()=>{const shape=record(type,5,5,25,35),d=drawing(svg(world(variant),shape)),p=drawing(svg(world(variant),record(59),shape,record(60),record(63,0,0,39,39)));assert.equal(d.tag,'path');assert.equal(d.d,p.d);assert.equal(d.d.match(/C/g)?.length??0,type===42?4:0);});
for(const type of [43,42])test(`Direct shape retains selected path: ${type}`,()=>{const s=svg(record(59),points(),record(60),world(0),record(type,5,5,25,35),record(63,0,0,39,39)),draws=[...body(s).matchAll(/<path\b[^>]*>/g)];assert.equal(draws.length,2);assert.equal(attrs(draws[1][0]).d,'M 5 5 L 35 5 L 20 35 Z');});
for(const type of [43,42])test(`Direct shape does not change logical DC position: ${type}`,()=>{const d=attrs(body(svg(record(27,2,3),world(0),record(type,5,5,25,35),record(54,4,5))).match(/<line\b[^>]*>/)[0]);assert.equal(d.x1,'37');assert.equal(d.y1,'2');});
for(const type of [43,42])for(const mode of [0,1,2])test(`Direct shape keeps clip/mask/meta: ${type}/${mode}`,()=>{const r=[record(mode===1?29:30,5,5,35,35)];if(mode===2)r.push(record(28));r.push(world(0),record(type,5,5,25,35));const s=svg(...r),d=drawing(s);assert.equal(d[mode===0?'clip-path':'mask'],mode===0?'url(#clip1)':mode===1?'url(#mask1)':'url(#mask2)');assert.equal(mode===2?body(s).match(/<path\b/)[0]:'<'+d.tag,'<path');});
for(const type of [43,42])test(`Reversed bounds normalize before affine mapping: ${type}`,()=>assert.equal(drawing(svg(world(2),record(type,5,5,25,35))).d,drawing(svg(world(2),record(type,25,35,5,5))).d));
for(const [type,tag] of [[43,'rect'],[42,'ellipse']])test(`Axis aligned primitive remains: ${type}`,()=>assert.equal(drawing(svg(record(type,5,5,25,35))).tag,tag));
for(const type of [43,42])test(`Truncated direct shape does not read next record: ${type}`,()=>assert.equal(drawing(svg(world(0),record(type,5,5,25),record(54,4,5))).tag,'line'));
test('Rotated rectangle includes all corners',()=>assert.equal(drawing(svg(world(0),record(43,5,5,25,35))).d,'M 35 25 L 35 5 L 5 5 L 5 25 Z'));
test('Sheared rectangle is not diagonal bounding box',()=>assert.equal(drawing(svg(world(2),record(43,5,5,25,35))).d,'M 30 17.5 L 10 7.5 L 40 37.5 L 60 47.5 Z'));
