import assert from 'node:assert/strict';
import test from 'node:test';
import {MetafileToSvgRenderer,HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function record(type,...values){const b=Buffer.alloc(8+values.length*4);b.writeUInt32LE(type);b.writeUInt32LE(b.length,4);values.forEach((v,i)=>b.writeUInt32LE(v>>>0,8+i*4));return b;}
function emf(...records){const b=Buffer.concat([Buffer.alloc(88),...records,record(14,0,0,20)]);for(const [at,v] of [[0,1],[4,88],[16,39],[20,39],[40,0x464d4520],[44,0x10000],[48,b.length],[52,records.length+2]])b.writeUInt32LE(v,at);b.writeUInt16LE(2,56);return b;}
const setup=(mode=8)=>[record(17,mode),record(9,3,-3),record(11,5,-5)],svg=(...r)=>new MetafileToSvgRenderer().render(emf(...r),'.emf');
const attrs=t=>Object.fromEntries([...t.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]])),lines=s=>[...s.matchAll(/<line\b[^>]*>/g)].map(m=>attrs(m[0]));
const endpoint=(s,x,y)=>{const d=lines(s)[0];assert.equal(d.x2,String(x));assert.equal(d.y2,String(y));};
const nativeCases=[
 [8,false,1,2,1,-3,5,-5],[8,false,-1,2,-1,-3,5,-5],[8,false,2147483647,2,1073741822,-3,5,-5],[8,false,-2147483648,-2,1073741824,-3,5,-5],[8,false,-2147483648,1,-2147483648,-3,5,-5],
 [8,true,1,2,3,-3,2,-5],[8,true,-1,2,3,-3,-2,-5],[8,true,2147483647,2,3,-3,1073741821,-5],[8,true,-2147483648,-2,3,-3,1073741824,-5],[8,true,-2147483648,1,3,-3,-2147483648,-5],
 [7,false,1,2,1,-3,2,-5],[7,false,-1,2,-1,-3,2,-5],[7,false,2147483647,2,1073741822,-3,5,0],[7,false,-2147483648,-2,1073741824,-3,5,0],[7,false,-2147483648,1,-2147483648,-3,5,0],
 [7,true,1,2,3,-3,2,-2],[7,true,-1,2,3,-3,-2,-2],[7,true,2147483647,2,3,-3,5,-5],[7,true,-2147483648,-2,3,-3,5,-5],[7,true,-2147483648,1,3,-3,-2147483648,-2147483648],
];
for(const [mode,viewport,num,den,wx,wy,vx,vy] of nativeCases)test(`Native truncation wrapping and isotropic state: ${mode}/${viewport}/${num}/${den}`,()=>endpoint(svg(...setup(mode),record(viewport?31:32,num,den,1,1),record(54,wx,wy)),vx,vy));
for(const type of [31,32]){
 for(const [kind,r] of [[0,[0,1,1,1]],[1,[1,0,1,1]],[2,[2,1,0,1]],[3,[2,1,1,0]],[4,[1,99,1,1]],[5,[2,1,1,99]],[6,[-2147483648,-1,1,1]],[7,[2,1,-2147483648,-1]]])test(`Invalid factors leave both axes unchanged: ${type}/${kind}`,()=>endpoint(svg(...setup(),record(type,...r),record(54,3,-3)),5,-5));
 for(const count of [0,1,2,3])test(`Truncated scale does not read following record: ${type}/${count}`,()=>endpoint(svg(...setup(),record(type,...[2,1,3,1].slice(0,count)),record(54,3,-3)),5,-5));
 test(`Wrapped zero result rejects both axes: ${type}`,()=>endpoint(svg(record(17,8),record(9,2,-2),record(11,4,-4),record(type,-2147483648,1,2,1),record(54,2,-2)),4,-4));
 test(`SaveRestore retains previous extents: ${type}`,()=>endpoint(svg(...setup(),record(33),record(type,2,1,3,1),record(34,-1),record(54,3,-3)),5,-5));
 test(`Recorded path remains in device space: ${type}`,()=>{const before=[...setup(),record(59),record(3,0,0,39,39,3,5,5,35,5,20,35),record(60)],paint=record(63,0,0,39,39),path=s=>attrs(s.match(/<path\b[^>]*>/)[0]).d;assert.equal(path(svg(...before,record(type,2,1,3,1),paint)),path(svg(...before,paint)));});
 test(`Device clip is not remapped: ${type}`,()=>{const s=svg(...setup(),record(75,48,5,32,1,1,16,0,0,39,39,5,6,35,36),record(type,2,1,3,1),record(54,3,-3));assert.equal(lines(s)[0]['clip-path'],'url(#clip1)');assert.equal(attrs(s.match(/<path\b[^>]*>/)[0]).d,'M 5 6 L 35 6 L 35 36 L 5 36 Z');});
 test(`HTML renders scaled geometry without changing source: ${type}`,async()=>{const uri='data:image/emf;base64,'+emf(...setup(),record(type,2,1,3,1),record(54,type===31?3:6,type===31?-3:-9)).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'ExtentScale',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const html=await new HmiScreenToHtmlConverter().convertAsync(screen),match=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/);assert.ok(match);endpoint(decodeURIComponent(match[1]),type===31?10:5,type===31?-15:-5);assert.equal(item.source.staticValue,uri);});
}
for(let mode=1;mode<=6;mode++)for(const type of [31,32])test(`Fixed modes ignore valid and invalid ratios: ${mode}/${type}`,()=>{const w=mode===2?2540:mode===3?25400:mode===4?1000:mode===5?10000:mode===6?14400:1;for(const r of [[2,3,3,2],[0,0,0,0]])endpoint(svg(record(17,mode),record(type,...r),record(54,w,w)),mode===1?1:960,mode===1?1:-960);});
for(const [mode,type,vx,vy,wx,wy] of [[8,31,3,-7,3,-3],[8,32,5,-5,2,-4],[7,31,3,-3,3,-3],[7,32,3,-5,2,-4]])test(`Scale both axes before isotropic adjustment: ${mode}/${type}`,()=>endpoint(svg(...setup(mode),record(type,2,3,3,2),record(54,wx,wy)),vx,vy));
for(const [type,x,y] of [[31,'10','-10'],[32,'2.5','-2.5']])test(`Logical current point uses updated mapping: ${type}`,()=>{const d=lines(svg(...setup(),record(27,3,-3),record(type,2,1,2,1),record(54,6,-6)))[0];assert.equal(d.x1,x);assert.equal(d.y1,y);});
const pending=()=>[record(17,7),record(9,10,20),record(11,40,30)];
for(const [kind,trigger] of [[0,[record(27,1,1)]],[1,[record(59),record(68)]],[2,[record(59),record(27,1,1),record(68)]],[3,[record(33),record(34,-1)]],[4,[record(17,7)]]])test(`Non-drawing records do not consume requested isotropic extents: ${kind}`,()=>endpoint(svg(...pending(),...trigger,record(31,2,1,3,1),record(54,10,20)),45,90));
test('Scaling window uses unresolved viewport',()=>endpoint(svg(...pending(),record(32,3,1,2,1),record(54,30,40)),23,30));
test('Drawing resolves isotropic extents before later scaling',()=>{const d=lines(svg(...pending(),record(54,2,4),record(31,2,1,3,1),record(54,10,20))).at(-1);assert.equal(d.x2,'30');assert.equal(d.y2,'60');});
test('Normalization is not repeated for subsequent geometry',()=>{for(const d of lines(svg(record(17,7),record(9,3,100),record(11,4,80),record(54,3,100),record(54,3,100)))){assert.equal(d.x2,'2');assert.equal(d.y2,'80');}});
for(const [type,x,y] of [[9,3,100],[11,2,80]])test(`Unchanged setter does not invalidate resolved mapping: ${type}`,()=>assert.equal(lines(svg(record(17,7),record(9,3,100),record(11,4,80),record(54,3,100),record(type,x,y),record(54,3,100))).at(-1).y2,'80'));
for(const type of [31,32])test(`Successful unit scaling invalidates resolved mapping: ${type}`,()=>assert.equal(lines(svg(record(17,7),record(9,3,100),record(11,4,80),record(54,3,100),record(type,1,1,1,1),record(54,3,100))).at(-1).y2,'67'));
