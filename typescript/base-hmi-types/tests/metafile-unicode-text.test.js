import assert from 'node:assert/strict';import test from 'node:test';
import {MetafileToSvgRenderer} from '../dist/images/converters/metafile-to-svg-renderer.js';
function emf(text,options=0,gap=0){
 const fixedSize=(options&0x100)!==0?60:76,recordSize=(fixedSize+gap+text.length*2+3)&~3,bytes=Buffer.alloc(88+recordSize+20),u=(at,value)=>bytes.writeUInt32LE(value,at);
 u(0,1);u(4,88);u(16,99);u(20,49);u(40,0x464D4520);u(44,0x10000);u(48,bytes.length);u(52,3);
 u(88,84);u(92,recordSize);u(96,999);u(100,888);u(124,12);u(128,5);u(132,text.length);u(136,fixedSize+gap);u(140,options);
 Buffer.from(text,'utf16le').copy(bytes,88+fixedSize+gap);u(88+recordSize,14);u(92+recordSize,20);return bytes;
}
const render=bytes=>new MetafileToSvgRenderer().render(bytes,'.emf');
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const [text,gap] of [['0',0],['A&B <test> "quoted"',0],['Ä中😀',0],['padded',8]])test(`EMF text uses reference/count/record-relative offset: ${text}/${gap}`,()=>{
 const bytes=emf(text,0,gap),original=Buffer.from(bytes),svg=render(bytes);
 assert.ok(svg.includes('<text x="12" y="5"'));assert.ok(svg.includes(`>${escape(text)}</text>`));assert.deepEqual(bytes,original);
});
test('EMF text supports short no-rectangle layout',()=>assert.ok(render(emf('A',0x100)).includes('>A</text>')));
for(const [text,expected] of [['A\0B','A�B'],['A\u0001B','A�B'],['A\uFFFE B','A� B'],['A\0\0','A']])test(`XML-forbidden EMF characters cannot invalidate image: ${JSON.stringify(text)}`,()=>assert.ok(render(emf(text)).includes(`>${expected}</text>`)));
for(const invalid of ['count','offset','fixed-fields','unaligned','cross-record','glyphs','empty'])test(`EMF malformed text/glyphs not read as Unicode: ${invalid}`,()=>{
 const bytes=emf('X'),u=(at,value)=>bytes.writeUInt32LE(value,at);
 switch(invalid){case 'count':u(132,0xffffffff);break;case 'offset':u(136,0xffffffff);break;case 'fixed-fields':u(136,20);break;case 'unaligned':u(136,77);break;case 'cross-record':u(132,10);break;case 'glyphs':u(140,0x10);break;case 'empty':u(132,0);break;}
 assert.ok(!render(bytes).includes('<text'));
});
