import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer,HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';

function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const setup=()=>[record(12,1,2),record(33),record(12,3,4),record(33),record(12,5,6),record(33),record(12,7,8),record(27,2,3)];
const render=(...r)=>new MetafileToSvgRenderer().render(emf(...r),'.emf'),svg=(...tail)=>render(...setup(),...tail);
const line=s=>Object.fromEntries([...s.match(/<line\b[^>]*>/)[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const position=(s,x,y)=>{const d=line(s);assert.equal(d.x2,x);assert.equal(d.y2,y);};

for(const [level,x,y] of [[-1,'9','11'],[-2,'7','9'],[-3,'5','7']])test(`Relative depth restores requested snapshot: ${level}`,()=>position(svg(record(34,level),record(54,4,5)),x,y));
for(const level of [0,1,2,2147483647,-4,-2147483648]){
 test(`Invalid restore keeps current state: ${level}`,()=>position(svg(record(34,level),record(54,4,5)),'11','13'));
 test(`Invalid restore does not consume stack: ${level}`,()=>position(svg(record(34,level),record(34,-3),record(54,4,5)),'5','7'));
}
test('Truncated restore does not read following record or consume stack',()=>position(svg(record(34),record(34,-3),record(54,4,5)),'5','7'));
test('Restore discards selected and newer snapshots',()=>position(svg(record(34,-2),record(12,20,30),record(34,-2),record(54,4,5)),'24','35'));
test('Earlier snapshot remains after deep restore',()=>position(svg(record(34,-2),record(34,-1),record(54,4,5)),'5','7'));
test('Restored snapshot cannot be used again',()=>position(svg(record(34,-3),record(12,20,30),record(34,-1),record(54,4,5)),'24','35'));
test('New save after restore uses remaining stack',()=>position(svg(record(34,-2),record(12,20,30),record(33),record(12,40,50),record(34,-2),record(54,4,5)),'5','7'));
test('Deep restore restores logical current position',()=>{const d=line(svg(record(34,-3),record(54,4,5)));assert.equal(d.x1,'1');assert.equal(d.y1,'2');});
test('Deep restore restores world transform and mapping',()=>{const bits=f=>{const b=Buffer.alloc(4);b.writeFloatLE(f);return b.readUInt32LE();};position(svg(record(17,8),record(9,2,4),record(11,4,8),record(35,...[2,0,0,3,10,20].map(bits)),record(34,-3),record(54,4,5)),'5','7');});
test('Deep restore restores clip and selected objects',()=>{const d=line(render(record(37,0x80000006),record(30,1,2,30,31),record(33),record(37,0x80000007),record(30,5,6,20,21),record(33),record(26,3,4),record(34,-2),record(54,4,5)));assert.equal(d.stroke,'#ffffff');assert.equal(d['clip-path'],'url(#clip1)');assert.equal(d.mask,undefined);});
for(const level of [-2,-3])test(`HTML uses depth without changing source: ${level}`,async()=>{
 const uri='data:image/emf;base64,'+emf(...setup(),record(34,level),record(54,4,5)).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'RestoreDepth',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);position(decodeURIComponent(match[1]),level===-2?'7':'5',level===-2?'9':'7');assert.equal(item.source.staticValue,uri);
});
