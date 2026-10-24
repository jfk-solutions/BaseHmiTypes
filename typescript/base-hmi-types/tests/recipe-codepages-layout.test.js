import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HmiFlexibleRecipeFile,encodeHmiRecipeText,decodeHmiRecipeText,HmiRecipeFileLayout,HmiRecipeValueKind,HmiRecipeCsv} from '../dist/index.js';

const vectors=[
 ['windows-1250','Łódź',[0xa3,0xf3,0x64,0x9f]],['windows-1251','Привет',[0xcf,0xf0,0xe8,0xe2,0xe5,0xf2]],
 ['windows-1253','Ελλάδα',[0xc5,0xeb,0xeb,0xdc,0xe4,0xe1]],['windows-1254','İğış',[0xdd,0xf0,0xfd,0xfe]],
 ['windows-1255','שלום',[0xf9,0xec,0xe5,0xed]],['windows-1256','مرحبا',[0xe3,0xd1,0xcd,0xc8,0xc7]],
 ['windows-1257','Āžu',[0xc2,0xfe,0x75]],['windows-1258','đa\u0301',[0xf0,0x61,0xec]],
 ['windows-874','ไทย',[0xe4,0xb7,0xc2]],['windows-932','日本',[0x93,0xfa,0x96,0x7b]],
 ['windows-936','中文',[0xd6,0xd0,0xce,0xc4]],['windows-949','한국',[0xc7,0xd1,0xb1,0xb9]],['windows-950','中文',[0xa4,0xa4,0xa4,0xe5]],
];
test('all supported ANSI code pages preserve exact bytes and checksum chains',()=>{
 for(const [encoding,text,expected] of vectors) {
  assert.deepEqual([...encodeHmiRecipeText(text,encoding)],expected,encoding);
  assert.equal(decodeHmiRecipeText(Uint8Array.from(expected),encoding),text,encoding);
  const document={recipeName:'Mix',recipeNumber:1,separator:';',decimalSeparator:'.',languages:[{languageId:1033,recordNames:['Record']}],parameters:['Text'],records:[{id:1,values:{Text:text}}]};
  const bytes=HmiFlexibleRecipeFile.writeBytes(document,encoding),decoded=HmiFlexibleRecipeFile.parseBytes(bytes,encoding);
  assert.equal(decoded.records[0].values.Text,text);
  const lines=HmiFlexibleRecipeFile.write(document,encoding).trimEnd().split('\r\n');let previous='';
  for(const row of lines.slice(1)){
   const at=row.lastIndexOf(';'),token=row.slice(at+1);
   assert.equal(token,createHash('md5').update(encodeHmiRecipeText(previous?previous+'\r\n':'',encoding)).update(encodeHmiRecipeText(row.slice(0,at+1),encoding)).digest('base64').slice(0,6));previous=token;
  }
 }
 assert.throws(()=>decodeHmiRecipeText(Uint8Array.from([0x81]),'windows-932'));
 assert.throws(()=>encodeHmiRecipeText('😀','windows-936'));
 assert.throws(()=>encodeHmiRecipeText('a','windows-01250'));
});

const member=name=>({member:name}),index=value=>({index:value});
const fields=[{name:'Configuration.Speed',path:[member('Configuration'),member('Speed')]},
 {name:'Temperatures[4]',path:[member('Temperatures'),index(0)]},{name:'Temperatures[5]',path:[member('Temperatures'),index(1)]},
 {name:'Parts[1].Name',path:[member('Parts'),index(0),member('Name')]}];
const leaves={'Configuration.Speed':'-9007199254740993','Temperatures[4]':'1.25','Temperatures[5]':'2.5','Parts[1].Name':'日本'};
test('explicit structure/array leaves round-trip through native files without guessing lower bounds',()=>{
 const structured=HmiRecipeFileLayout.expand(leaves,fields);
 assert.equal(structured.kind,HmiRecipeValueKind.Map);
 assert.equal(structured.entries.find(entry=>entry.key==='Temperatures').value.items.length,2);
 assert.deepEqual({...HmiRecipeFileLayout.flatten(structured,fields)},leaves);
 const document={recipeName:'Parts',recipeNumber:3,separator:'\t',decimalSeparator:'.',languages:[{languageId:1041,recordNames:['Record']}],parameters:fields.map(field=>field.name),records:[{id:5,values:HmiRecipeFileLayout.flatten(structured,fields)}]};
 const decoded=HmiFlexibleRecipeFile.parseBytes(HmiFlexibleRecipeFile.writeBytes(document,'utf-16le'),'utf-16le');
 assert.deepEqual({...HmiRecipeFileLayout.flatten(HmiRecipeFileLayout.expand(decoded.records[0].values,fields),fields)},leaves);
});
test('layout validation rejects sparse, overlapping, missing and extra members',()=>{
 for(const bad of [[{name:'A',path:[member('A')]},{name:'B',path:[member('A'),index(0)]}],
  [{name:'A',path:[member('A'),index(1)]}], [{name:'A',path:[{member:'A',index:0}]}],
  [{name:'A',path:[member('A')]},{name:'A',path:[member('B')]}]])assert.throws(()=>HmiRecipeFileLayout.expand({A:'1',B:'2'},bad));
 assert.throws(()=>HmiRecipeFileLayout.expand({...leaves,Extra:'x'},fields));
 const tree=HmiRecipeFileLayout.expand(leaves,fields);tree.entries.push({key:'Extra',value:tree.entries[0].value});
 assert.throws(()=>HmiRecipeFileLayout.flatten(tree,fields));
 const duplicate=HmiRecipeFileLayout.expand(leaves,fields);duplicate.entries.push(duplicate.entries[0]);
 assert.throws(()=>HmiRecipeFileLayout.flatten(duplicate,fields));
 assert.throws(()=>HmiRecipeCsv.write([{id:1,values:{},arrayValues:{A:['1','2']},lastUser:'',lastAccess:''}],['A']),/array columns/);
});
