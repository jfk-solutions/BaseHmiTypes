import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/index.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const modes=[[1,1,1,1],[3400,2100,1728,-1084],[34000,21000,1728,-1084],[1339,827,1728,-1084],[13386,8268,1728,-1084],[19276,11906,1728,-1084],[3400,2100,1728,-1067],[1,1,1,1]];
function render(metrics,...r){const b=emf(...r);if(metrics)for(const [at,v] of [[72,1728],[76,1084],[80,340],[84,210]])b.writeInt32LE(v,at);return new MetafileToSvgRenderer().render(b,'.emf');}
const svg=(...r)=>render(true,...r),mapping=(mode=8,wx=10,wy=20,vx=40,vy=30)=>[record(17,mode),record(9,wx,wy),record(11,vx,vy)];
const endpoint=(s,x,y)=>{const d=Object.fromEntries([...s.match(/<line\b[^>]*>/)[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));assert.equal(d.x2,String(x));assert.equal(d.y2,String(y));};
for(let mode=1;mode<=8;mode++)test(`All modes use native reference extents: ${mode}`,()=>{const m=modes[mode-1];endpoint(svg(record(17,mode),record(54,m[0],m[1])),m[2],m[3]);});
for(let mode=1;mode<=6;mode++)test(`Fixed modes ignore extent setters: ${mode}`,()=>{const m=modes[mode-1];endpoint(svg(...mapping(mode),record(54,m[0],m[1])),m[2],m[3]);});
for(const [x,y] of [[1,1],[-1,1],[1,-1],[-1,-1]]){
 test(`Anisotropic preserves independent signed axes: ${x}/${y}`,()=>endpoint(svg(...mapping(8,10,20,x*40,y*30),record(54,10,20)),x*40,y*30));
 test(`Isotropic adjusts larger axis and preserves signs: ${x}/${y}`,()=>endpoint(svg(...mapping(7,10,20,x*40,y*30),record(54,10,20)),x*15,y*30));
}
test('Isotropic adjusts other axis',()=>endpoint(svg(...mapping(7,20,10,30,40),record(54,20,10)),30,15));
test('Isotropic window change adjusts current viewport',()=>endpoint(svg(...mapping(7),record(9,20,20),record(54,20,20)),15,15));
test('Repeated isotropic mode does not reset extents',()=>endpoint(svg(...mapping(7),record(17,7),record(54,10,20)),15,30));
test('Isotropic can round small axis to zero',()=>endpoint(svg(...mapping(7,1000,1,1,1000),record(54,1000,1)),1,0));
test('Anisotropic entry preserves existing isotropic extents',()=>endpoint(svg(...mapping(7),record(17,8),record(54,10,20)),15,30));
test('Isotropic entry resets prior anisotropic extents',()=>endpoint(svg(...mapping(),record(17,7),record(54,3400,2100)),1728,-1067));
test('Text mode resets scale but preserves origins',()=>endpoint(svg(...mapping(),record(10,3,4),record(12,5,6),record(17,1),record(54,20,40)),22,42));
for(let mode=1;mode<=6;mode++)test(`Anisotropic entry preserves fixed mode extents: ${mode}`,()=>{const m=modes[mode-1];endpoint(svg(record(17,mode),record(17,8),record(9,10,20),record(54,10,20)),m[2],m[3]);});
for(const mode of [0,-1,9,-2147483648,2147483647])test(`Invalid mode retains mode and extents: ${mode}`,()=>endpoint(svg(...mapping(),record(17,mode),record(11,80,60),record(54,10,20)),80,60));
for(const [type,x,y] of [[9,0,30],[9,40,0],[9,0,0],[11,0,30],[11,40,0],[11,0,0]])test(`Zero axis rejects extent update atomically: ${type}/${x}/${y}`,()=>endpoint(svg(...mapping(),record(type,x,y),record(54,10,20)),40,30));
for(const type of [9,10,11,12])for(const count of [0,1])test(`Truncated setter does not read next record: ${type}/${count}`,()=>endpoint(svg(...mapping(),record(type,...Array(count).fill(99)),record(54,10,20)),40,30));
test('Truncated mode does not read next record',()=>endpoint(svg(...mapping(),record(17),record(11,80,60),record(54,10,20)),80,60));
for(const mode of [1,7,8])test(`SaveRestore retains mode and extents: ${mode}`,()=>{const expected=mode===1?[10,20]:mode===7?[15,30]:[40,30];endpoint(svg(...mapping(mode),record(33),record(17,1),record(34,-1),record(11,40,30),record(54,10,20)),...expected);});
test('Missing physical metrics use deterministic 96 DPI',()=>endpoint(render(false,record(17,2),record(54,2540,2540)),960,-960));
test('Default text mode ignores extents',()=>endpoint(svg(record(9,10,20),record(11,40,30),record(54,10,20)),10,20));
