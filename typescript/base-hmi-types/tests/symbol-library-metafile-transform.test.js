import assert from 'node:assert/strict';import test from 'node:test';
import {SymbolLibraryMetafileTransformer,HmiSymbolLibraryFlip as Flip,HmiSymbolLibraryRotation as Rotation,HmiImage,HmiImageType,HmiScreen,HmiLayer,HmiSymbolLibraryControl,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
const flips=[Flip.None,Flip.Horizontal,Flip.Vertical,Flip.Both],rotations=[Rotation.Angle0,Rotation.Angle90,Rotation.Angle180,Rotation.Angle270];
function wmf(...records){
 const chunks=[Buffer.from('0100090000030000000000000A0000000000','hex')];
 for(const [code,values] of records){const record=Buffer.alloc(6+values.length*2);record.writeUInt32LE(3+values.length,0);record.writeUInt16LE(code,4);values.forEach((v,i)=>record.writeInt16LE(v,6+i*2));chunks.push(record);}
 chunks.push(Buffer.from('030000000000','hex'));const bytes=new Uint8Array(Buffer.concat(chunks));new DataView(bytes.buffer).setUint32(6,bytes.length/2,true);return bytes;
}
const rows=[[0,0,20,10],[1,0,80,10],[2,0,20,40],[3,0,80,40],[0,1,10,80],[1,1,10,20],[2,1,40,80],[3,1,40,20],[0,2,80,40],[1,2,20,40],[2,2,80,10],[3,2,20,10],[0,3,40,20],[1,3,40,80],[2,3,10,20],[3,3,10,80]];
for(const [flip,rotation,x,y] of rows)test(`Native golden point and stable HTML host: ${flip}/${rotation}`,async()=>{
 const bytes=wmf([0x20b,[0,0]],[0x20c,[50,100]],[0x324,[1,20,10]]),saved=bytes.slice(),result=SymbolLibraryMetafileTransformer.tryTransform(bytes,flips[flip],rotations[rotation]);assert.ok(result);
 const v=new DataView(result.buffer);assert.equal(v.getInt16(46,true),x);assert.equal(v.getInt16(48,true),y);assert.equal(v.getInt16(34,true),rotation%2===1?100:50);assert.deepEqual(bytes,saved);
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(Object.assign(new HmiSymbolLibraryControl(),{name:'Transform',width:p(120),height:p(80),symbol:Object.assign(new HmiImage(),{imageType:HmiImageType.Wmf,data:bytes}),flip:p(flips[flip]),rotation:p(rotations[rotation])}));
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen);assert.ok(html.includes(`points="${x},${y}"`));assert.ok(html.includes('width: 120px;height: 80px;'));
 const host=html.match(/<div id="Transform"[^>]*>/)?.[0]??'';assert.ok(!host.includes('transform:'));
});
for(const [r,x,y] of [[0,30,-30],[1,0,60],[2,90,-60],[3,-30,0]])test(`Nonzero origins negative extents: ${r}`,()=>{
 const result=SymbolLibraryMetafileTransformer.tryTransform(wmf([0x20b,[-20,10]],[0x20c,[-50,100]],[0x325,[1,30,-30]]),Flip.None,rotations[r]);assert.ok(result);
 const v=new DataView(result.buffer);assert.equal(v.getInt16(46,true),x);assert.equal(v.getInt16(48,true),y);
});
test('PolyPolygon transforms all polygons, preserving extensions',()=>{
 const full=new Uint8Array([...wmf([0x20b,[0,0]],[0x20c,[50,100]],[0x538,[2,1,2,20,10,40,15,60,25]]),0xde,0xad]);
 const result=SymbolLibraryMetafileTransformer.tryTransform(full,Flip.Horizontal,Rotation.Angle0);assert.ok(result);
 for(const [offset,expected] of [[50,80],[54,60],[58,40]])assert.equal(new DataView(result.buffer).getInt16(offset,true),expected);
 assert.deepEqual(result.slice(-2),full.slice(-2));assert.notEqual(result,full);
});
test('Move line rectangle retain native record-specific formulas',()=>{
 const result=SymbolLibraryMetafileTransformer.tryTransform(wmf([0x20b,[0,0]],[0x20c,[50,100]],[0x214,[10,20]],[0x213,[15,40]],[0x41b,[30,80,10,20]]),Flip.None,Rotation.Angle270);assert.ok(result);
 const v=new DataView(result.buffer);for(const [offset,value] of [[44,30],[46,10],[54,10],[56,15],[64,20],[66,70]])assert.equal(v.getInt16(offset,true),value);
});
test('Signed coordinates wrap like native short assignments',()=>{
 const result=SymbolLibraryMetafileTransformer.tryTransform(wmf([0x20b,[0,30000]],[0x20c,[50,30000]],[0x324,[1,-30000,10]]),Flip.Horizontal,Rotation.Angle0);assert.ok(result);
 assert.equal(new DataView(result.buffer).getInt16(46,true),(120000<<16)>>16);
});
test('Truncations unknown enums and short geometry rejected',()=>{
 const bytes=wmf([0x20b,[0,0]],[0x20c,[50,100]],[0x324,[1,20,10]]);
 for(let n=0;n<bytes.length;n++)assert.equal(SymbolLibraryMetafileTransformer.tryTransform(bytes.slice(0,n),Flip.Horizontal,Rotation.Angle90),undefined);
 assert.equal(SymbolLibraryMetafileTransformer.tryTransform(bytes,'Unknown',Rotation.Angle0),undefined);assert.equal(SymbolLibraryMetafileTransformer.tryTransform(bytes,Flip.None,'Unknown'),undefined);
 for(const record of [[0x20b,[]],[0x20c,[]],[0x213,[]],[0x214,[]],[0x324,[2,20,10]],[0x325,[-1]],[0x538,[2,1]],[0x418,[]],[0x41b,[]],[0x41f,[]]])assert.equal(SymbolLibraryMetafileTransformer.tryTransform(wmf(record),Flip.Horizontal,Rotation.Angle90),undefined);
});
