import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer,HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const pixel=(x=4,y=5,color=0x563412)=>record(15,x,y,color),bits=f=>{const b=Buffer.alloc(4);b.writeFloatLE(f);return b.readUInt32LE();},world=(...m)=>record(35,...m.map(bits)),svg=(...r)=>new MetafileToSvgRenderer().render(emf(...r),'.emf');
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]])),rect=s=>attrs(s.match(/<rect\b[^>]*width="1"[^>]*>/)[0]);
for(const [x,y,c,fill] of [[4,5,0x563412,'#123456'],[-3,-4,0,'#000000'],[0,0,0xffffff,'#ffffff'],[2147483647,-2147483648,255,'#ff0000']])test(`Opaque one device pixel: ${x}/${y}/${c}`,()=>{const r=rect(svg(pixel(x,y,c)));assert.equal(r.x,String(x));assert.equal(r.y,String(y));assert.equal(r.height,'1');assert.equal(r.fill,fill);assert.equal(r.stroke,undefined);});
for(const [shift,expected] of [[19.5,20],[20.5,21],[21.5,22],[-.5,0],[-1.5,-1],[.5,1]])test(`Native half rounding toward positive infinity: ${shift}`,()=>assert.equal(rect(svg(world(1,0,0,1,shift,20),pixel(0,0))).x,String(expected)));
test('World scale does not enlarge device pixel',()=>{const r=rect(svg(world(2,0,0,3,10,20),pixel(2,3)));assert.equal(r.x,'14');assert.equal(r.y,'29');assert.equal(r.height,'1');});
test('Rotation maps position',()=>{const r=rect(svg(world(0,1,-1,0,20,10),pixel(4,5)));assert.equal(r.x,'15');assert.equal(r.y,'14');});
test('Resolves pending isotropic scaling',()=>{const r=rect(svg(record(17,7),record(9,10,20),record(11,40,30),record(31,2,1,3,1),pixel(2,4)));assert.equal(r.x,'9');assert.equal(r.y,'18');});
test('Applies window viewport and origins',()=>{const r=rect(svg(record(17,8),record(9,10,20),record(11,20,30),record(12,4,5),pixel(2,4)));assert.equal(r.x,'8');assert.equal(r.y,'11');});
for(const count of [0,1,2]){
 test(`Truncated records do not read following record: ${count}`,()=>assert.ok(!svg(record(15,...[4,5,0x563412].slice(0,count)),record(37,0x80000008)).includes('<rect')));
 test(`Truncated pixel does not consume pending mapping: ${count}`,()=>{const s=svg(record(17,7),record(9,10,20),record(11,40,30),record(15,...[4,5,0x563412].slice(0,count)),record(31,2,1,3,1),record(54,10,20)),l=attrs(s.match(/<line\b[^>]*>/)[0]);assert.equal(l.x2,'45');assert.equal(l.y2,'90');});
}
for(const shift of [NaN,Infinity,3.4028234663852886e38])test(`Invalid device positions are not emitted: ${shift}`,()=>assert.ok(!svg(world(1,0,0,1,shift,0),pixel()).includes('<rect')));
test('Pixel does not use selected pen or brush',()=>assert.equal(rect(svg(record(37,0x80000008),record(37,0x80000005),pixel())).fill,'#123456'));
test('Pixel preserves logical current position',()=>{const s=svg(record(27,2,3),pixel(),record(54,8,9)),l=attrs(s.match(/<line\b[^>]*>/)[0]);assert.equal(l.x1,'2');assert.equal(l.y1,'3');});
test('Pixel is immediate inside path and does not consume it',()=>{const s=svg(record(59),record(27,2,3),record(54,8,9),pixel(),record(60),record(64,0,0,39,39));assert.equal((s.match(/<(?:rect|path)\b/g)||[]).length,2);assert.equal(attrs(s.match(/<path\b[^>]*>/)[0]).d,'M 2 3 L 8 9');});
const region=()=>record(75,48,5,32,1,1,16,0,0,39,39,5,6,35,36);
test('Selected clip applies',()=>assert.equal(rect(svg(region(),pixel()))['clip-path'],'url(#clip1)'));
test('Metaregion applies',()=>assert.match(svg(region(),record(28),pixel()),/<g mask="url\(#[^)]+\)"><rect[^>]+width="1"/));
test('HTML embeds pixel without mutating source',async()=>{const uri='data:image/emf;base64,'+emf(pixel()).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Pixel',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const html=await new HmiScreenToHtmlConverter().convertAsync(screen),m=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(m);assert.equal(rect(decodeURIComponent(m[1])).fill,'#123456');assert.equal(item.source.staticValue,uri);});
