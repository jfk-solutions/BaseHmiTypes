import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiRecipeSparseArray,HmiRecipeBinaryCodec,HmiRecipeCsv} from '../dist/index.js';

test('sparse positions preserve an explicit baseline and reject unknown members',()=>{
 const patch={length:4,values:{1:'9',3:'8'}},baseline=['1','2','3','4'];
 assert.deepEqual(HmiRecipeSparseArray.resolve(patch,baseline),['1','9','3','8']);
 assert.deepEqual(baseline,['1','2','3','4']);
 for(const invalid of [{values:{1:'9'}},{length:4,values:{4:'9'}},{length:4,values:{1:undefined}},{length:4,values:{'01':'9'}}])assert.throws(()=>HmiRecipeSparseArray.resolve(invalid,baseline));
 assert.throws(()=>HmiRecipeSparseArray.resolve(patch,['1',,'3','4']));
 assert.throws(()=>HmiRecipeCsv.write([{id:1,values:{},sparseArrayValues:{A:patch},lastUser:'',lastAccess:''}],[]));
});
test('binary floating text uses identical rounding for ties, zero and subnormals',()=>{
 const layout={byteLength:8,littleEndian:false,fields:[{name:'V',dataType:'LReal',byteOffset:0}]};
 for(const [input,expected] of [['1234567890123456.25','1.2345678901234563e15'],['-1234567890123456.25','-1.2345678901234563e15'],['-0','-0'],['0','0e0'],['5e-324','4.9406564584124654e-324'],['1.7976931348623157e308','1.7976931348623157e308']]) {
  const bytes=HmiRecipeBinaryCodec.patch(new Uint8Array(8),{V:input},layout);
  assert.equal(HmiRecipeBinaryCodec.decode(bytes,layout).V,expected);
 }
});
for(const littleEndian of [false,true])test(`explicit binary fields preserve padding, bits and exact integers (${littleEndian})`,()=>{
 const layout={byteLength:20,littleEndian,fields:[{name:'Flag',dataType:'Bool',byteOffset:0,bitIndex:2},{name:'Count',dataType:'Int',byteOffset:2},{name:'Serial',dataType:'ULInt',byteOffset:4},{name:'Ratio',dataType:'Real',byteOffset:12}]};
 const original=Uint8Array.from({length:20},()=>0xaa),values={Flag:'true',Count:'-32768',Serial:'18446744073709551615',Ratio:'1.5'};
 const bytes=HmiRecipeBinaryCodec.patch(original,values,layout);
 assert.equal(bytes[0],0xae);assert.equal(bytes[1],0xaa);assert.deepEqual([...bytes.slice(16)],[170,170,170,170]);assert.equal(original[0],0xaa);
 assert.deepEqual({...HmiRecipeBinaryCodec.decode(bytes,layout)},{...values,Ratio:'1.5e0'});
 const base64=Buffer.from(bytes).toString('base64');
 assert.deepEqual(HmiRecipeBinaryCodec.readPayload({payloadBase64:base64,decodedByteLength:20},layout),bytes);
 assert.throws(()=>HmiRecipeBinaryCodec.readPayload({payloadBase64:base64,decodedByteLength:19},layout));
 assert.throws(()=>HmiRecipeBinaryCodec.patch(bytes,{...values,Count:'32768'},layout));
 assert.throws(()=>HmiRecipeBinaryCodec.patch(bytes,{...values,Serial:'18446744073709551616'},layout));
 assert.throws(()=>HmiRecipeBinaryCodec.patch(bytes,{Flag:'false'},layout));
 const partial=HmiRecipeBinaryCodec.patch(bytes,{Flag:'false'},layout,false);assert.equal(partial[0],0xaa);assert.deepEqual([...partial.slice(1)],[...bytes.slice(1)]);
 assert.throws(()=>HmiRecipeBinaryCodec.decode(bytes,{...layout,littleEndian:undefined}));
 assert.throws(()=>HmiRecipeBinaryCodec.decode(bytes,{...layout,fields:[...layout.fields,{name:'Collision',dataType:'Byte',byteOffset:0}]}));
 assert.throws(()=>HmiRecipeBinaryCodec.patch(bytes,{...values,Ratio:'1e100'},layout));
 assert.throws(()=>HmiRecipeBinaryCodec.readPayload({payloadBase64:base64+'\n'},layout));
});
