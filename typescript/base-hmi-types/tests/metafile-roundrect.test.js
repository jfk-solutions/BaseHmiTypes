import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]),u=(at,v)=>b.writeUInt32LE(v,at);u(0,1);u(4,88);u(16,39);u(20,39);u(40,0x464d4520);u(44,0x10000);u(48,b.length);u(52,records.length+2);b.writeUInt16LE(2,56);return b;}
function wmfRecord(type,...values){const b=Buffer.alloc(6+values.length*2);b.writeUInt32LE(b.length/2);b.writeUInt16LE(type,4);values.forEach((v,i)=>b.writeInt16LE(v,6+i*2));return b;}
function wmf(...records){const b=Buffer.concat([Buffer.alloc(18),...records,wmfRecord(0)]);b.writeUInt16LE(1);b.writeUInt16LE(9,2);b.writeUInt16LE(0x300,4);b.writeUInt32LE(b.length/2,6);b.writeUInt16LE(2,10);b.writeUInt32LE(Math.max(3,...records.map(r=>r.length/2)),12);return b;}
const round=(w=10,h=20)=>record(44,5,5,35,35,w,h),prefix='M 35 15 C 35 9.477 32.761 5 30 5 L 10 5';
const render=(b,format='.emf')=>new MetafileToSvgRenderer().render(b,format);
const elements=(b,format='.emf')=>[...render(b,format).matchAll(/<(path|line)\b([^>]+)>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
const shape=(...records)=>elements(emf(...records)).find(e=>e.tag==='path');
for(const active of [false,true])test(`RoundRect selected objects direct or path: ${active}`,()=>{const r=[record(37,0x80000000)];if(active)r.push(record(59));r.push(round());if(active)r.push(record(60),record(63,0,0,39,39));const e=shape(...r);assert.ok(e.d.startsWith(prefix));assert.equal([...e.d.matchAll(/C /g)].length,4);assert.equal(e.fill,'#ffffff');assert.equal(e.stroke,'#000000');});
test('RoundRect abort discards recorded path',()=>assert.equal(elements(emf(record(59),round(),record(68))).length,0));
for(const active of [false,true])test(`RoundRect preserves DC current point: ${active}`,()=>{const r=[record(27,1,2)];if(active)r.push(record(59));r.push(round());if(active)r.push(record(60));r.push(record(54,8,9));const e=elements(emf(...r)).find(e=>e.tag==='line');assert.equal(e.x1,'1');assert.equal(e.y1,'2');});
test('RoundRect following draw-to starts new figure',()=>assert.ok(shape(record(27,35,15),record(59),round(),record(54,5,35),record(60),record(64,0,0,39,39)).d.endsWith('Z M 35 15 L 5 35')));
for(const [w,h] of [[0,10],[10,0]])test(`RoundRect zero dimension produces rectangle: ${w}/${h}`,()=>assert.equal(shape(round(w,h)).d,'M 35 5 L 5 5 L 5 35 L 35 35 Z'));
test('RoundRect oversized corners clamped',()=>assert.ok(shape(round(100,100)).d.startsWith('M 35 20 C 35 11.716 28.284 5 20 5 L 20 5')));
test('RoundRect negative corners use absolute size',()=>assert.equal(shape(round()).d,shape(round(-10,-20)).d));
test('RoundRect extreme signed sizes do not overflow',()=>assert.equal(shape(round(100,100)).d,shape(round(-2147483648,2147483647)).d));
test('RoundRect reversed bounds normalized',()=>assert.equal(shape(round()).d,shape(record(44,35,35,5,5,10,20)).d));
test('RoundRect clockwise winding',()=>assert.ok(shape(record(57,2),round()).d.startsWith('M 35 25 C 35 30.523 32.761 35 30 35 L 10 35')));
test('RoundRect SaveDC restores direction',()=>assert.equal(shape(round()).d,shape(record(33),record(57,2),record(34,-1),round()).d));
for(const active of [false,true])test(`RoundRect affine corner transformation: ${active}`,()=>{const r=[record(35,0,0x3f800000,0xbf800000,0,0x42200000,0)];if(active)r.push(record(59));r.push(round());if(active)r.push(record(60),record(64,0,0,39,39));assert.ok(shape(...r).d.startsWith('M 25 35 C 30.523 35 35 32.761 35 30 L 35 10'));});
test('RoundRect viewport mapping',()=>assert.ok(shape(record(17,8),record(9,10,10),record(11,20,30),record(12,4,7),round()).d.startsWith('M 74 52 C 74 35.431 69.523 22 64 22 L 24 22')));
for(const count of [0,1,2,3,4,5])test(`RoundRect truncated EMF ignored: ${count}`,()=>assert.equal(elements(emf(record(44,...Array(count).fill(5)))).length,0));
test('RoundRect clip applied to direct rounded shape',()=>{const b=emf(record(59),round(),record(60),record(67,5),record(44,0,0,39,39,10,10));assert.equal([...render(b).matchAll(/<clipPath\b/g)].length,1);assert.equal(elements(b).at(-1)['clip-path'],'url(#clip1)');});
for(const [mode,expected] of [[1,'evenodd'],[2,'nonzero']])test(`RoundRect selected fill rule: ${mode}`,()=>assert.equal(shape(record(19,mode),round())['fill-rule'],expected));
test('WMF RoundRect native parameter order',()=>assert.ok(elements(wmf(wmfRecord(0x061c,20,10,35,35,5,5)),'.wmf')[0].d.startsWith(prefix)));
for(const count of [0,1,2,3,4,5])test(`RoundRect truncated WMF ignored: ${count}`,()=>assert.equal(elements(wmf(wmfRecord(0x061c,...Array(count).fill(5))),'.wmf').length,0));
for(const isWmf of [false,true])test(`RoundRect HTML without source mutation: ${isWmf}`,async()=>{const b=isWmf?wmf(wmfRecord(0x061c,20,10,35,35,5,5)):emf(round()),original=Buffer.from(b),uri='data:image/'+(isWmf?'wmf':'emf')+';base64,'+b.toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Rounded',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);assert.ok(decodeURIComponent(match[1]).includes(prefix));assert.equal(item.source.staticValue,uri);assert.deepEqual(b,original);});
