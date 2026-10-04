import assert from 'node:assert/strict';import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
import {HmiGraphicView,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function emf(stock,restore=false,pen=false){
 const records=[],record=(type,...values)=>{const bytes=Buffer.alloc(8+values.length*4);bytes.writeUInt32LE(type,0);bytes.writeUInt32LE(bytes.length,4);values.forEach((value,i)=>bytes.writeUInt32LE(value,8+i*4));records.push(bytes);};
 if(pen)record(38,1,0,3,0,0xff);else record(39,1,0,0xff,0);
 record(37,1);if(restore)record(33);record(37,stock);record(43,0,0,40,20);if(restore){record(34,0xffffffff);record(43,0,20,40,40);}record(14,0,0,20);
 const bytes=Buffer.concat([Buffer.alloc(88),...records]),u=(at,value)=>bytes.writeUInt32LE(value,at);
 u(0,1);u(4,88);u(16,39);u(20,restore?39:19);u(40,0x464d4520);u(44,0x10000);u(48,bytes.length);u(52,1+records.length);bytes.writeUInt16LE(2,56);return bytes;
}
const rectangles=bytes=>[...new MetafileToSvgRenderer().render(bytes,'.emf').matchAll(/<rect\b([^>]+)\/>/g)].map(match=>Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]])));
const brushes=['#ffffff','#c0c0c0','#808080','#404040','#000000','none'];
for(const [stock,fill] of brushes.entries())test(`Stock brush replaces explicit brush: ${stock}`,()=>{
 const bytes=emf(0x80000000+stock),original=Buffer.from(bytes),rects=rectangles(bytes);assert.equal(rects.length,1);assert.equal(rects[0].fill,fill);assert.equal(rects[0].stroke,'#000000');assert.deepEqual(bytes,original);
});
for(const [stock,fill] of brushes.entries())test(`RestoreDC restores pre-stock brush: ${stock}`,()=>{
 const rects=rectangles(emf(0x80000000+stock,true));assert.equal(rects.length,2);assert.equal(rects[0].fill,fill);assert.equal(rects[1].fill,'#ff0000');
});
for(const [stock,stroke] of [[6,'#ffffff'],[7,'#000000'],[8,'none']])test(`Stock pen replaces explicit pen without adding fill: ${stock}`,()=>{
 const rect=rectangles(emf(0x80000000+stock,false,true))[0];assert.equal(rect.stroke,stroke);assert.equal(rect.fill,'none');
});
for(const handle of [1,0x80000009])test(`Ordinary/unknown handles do not select unrelated stock brush: ${handle}`,()=>assert.equal(rectangles(emf(handle))[0].fill,'#ff0000'));
for(const [stock,expected] of [[2,'#808080'],[5,'none']])test(`Stock brush reaches HTML without rewriting source: ${stock}`,async()=>{
 const uri='data:image/emf;base64,'+emf(0x80000000+stock).toString('base64'),item=Object.assign(new HmiGraphicView(),{name:'Stock',source:p(uri)}),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen),value=html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/)?.[1];assert.ok(value);
 const svg=decodeURIComponent(value);assert.ok(svg.match(/<rect\b[^>]*>/)[0].includes(`fill="${expected}"`));assert.equal(item.source.staticValue,uri);
});
