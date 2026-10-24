import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HmiRecipeCsv,hmiRecipeChecksum,verifyHmiRecipeChecksum,hmiRecipeLineChecksum} from '../dist/index.js';
test('engineering CSV round-trips quoted Unicode, exact IDs and metadata',()=>{
 for(const separator of [';',',','\t']) {
  const record={id:9007199254740991,values:{Text:'a;"b"\r\nc\t終',Number:'-12.50'},lastUser:'Jörg',lastAccess:'2026-10-23T12:34:56Z'};
  const text=HmiRecipeCsv.write([record],['Text','Number'],separator),decoded=HmiRecipeCsv.parse('\uFEFF'+text,['Text','Number'],separator)[0];
  assert.equal(decoded.id,record.id);assert.deepEqual({...decoded.values},record.values);assert.equal(decoded.lastUser,record.lastUser);assert.equal(decoded.lastAccess,record.lastAccess);
 }
});
test('CSV rejects malformed quoting, duplicate IDs and schema drift',()=>{
 const header='ID;Value;LastUser;LastAccess[UTC]\r\n';
 for(const invalid of ['',header+'1;2;;\r\n1;3;;\r\n',header+'0;2;;\r\n',header+'1;"unfinished',header+'1;"v"x;;',header+'1;2;extra;cells;bad',header+'9007199254740992;2;;'])assert.throws(()=>HmiRecipeCsv.parse(invalid,['Value']));
 assert.throws(()=>HmiRecipeCsv.parse(header,['Value','Value']));
});
test('byte checksum matches RFC 1321 and independent multi-block vectors',()=>{
 for(const [text,expected]of [['','d41d8cd98f00b204e9800998ecf8427e'],['a','0cc175b9c0f1b6a831c399e269772661'],['abc','900150983cd24fb0d6963f7d28e17f72'],['message digest','f96b697d7cb7938d525a2f31aaf161d0'],['abcdefghijklmnopqrstuvwxyz','c3fcd3d76192e4007dfb496cca67e13b']])assert.equal(hmiRecipeChecksum(new TextEncoder().encode(text)),expected);
 for(const length of [55,56,63,64,65,1000]){const bytes=Uint8Array.from({length},(_,i)=>i%256);assert.equal(hmiRecipeChecksum(bytes),createHash('md5').update(bytes).digest('hex'));}
 assert.equal(verifyHmiRecipeChecksum(new TextEncoder().encode('abc'),'900150983CD24FB0D6963F7D28E17F72'),true);
 assert.equal(verifyHmiRecipeChecksum(new TextEncoder().encode('abcd'),'900150983cd24fb0d6963f7d28e17f72'),false);
});

test('line tokens chain encoded Base64 checksums, CRLF and row separators',()=>{
 for(const [encoding,first,second] of [['ascii','HQWWxh','+duZcr'],['utf16le','2qPDTC','GdbwO5']]) {
  const prefix=Buffer.from('"1";"12.5";',encoding);
  assert.equal(hmiRecipeLineChecksum(prefix,new Uint8Array()),first);
  const previous=Buffer.from(first+'\r\n',encoding),next=Buffer.from('"2";"20";',encoding);
  assert.equal(hmiRecipeLineChecksum(next,previous),second);
  assert.notEqual(hmiRecipeLineChecksum(Buffer.from('"2";"21";',encoding),previous),second);
  const independent=createHash('md5').update(previous).update(next).digest('base64');
  for(let length=1;length<=24;length++)assert.equal(hmiRecipeLineChecksum(next,previous,length),independent.slice(0,length));
 }
 assert.equal(hmiRecipeLineChecksum(new Uint8Array(),new Uint8Array(),24),'1B2M2Y8AsgTpgAmY7PhCfg==');
 for(const length of [0,25,1.5,NaN])assert.throws(()=>hmiRecipeLineChecksum(new Uint8Array(),new Uint8Array(),length));
});
