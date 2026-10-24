import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HmiFlexibleRecipeFile,encodeHmiRecipeText,verifyHmiRecipeCountMarker} from '../dist/index.js';

const fixture=separator=>({recipeName:'Mix',recipeNumber:7,separator,decimalSeparator:'.',
 languages:[{languageId:1033,recordNames:['First','Second']},{languageId:1031,recordNames:['Erste','Zweite']}],
 parameters:['Temp','Text'],records:[{id:2,values:{Temp:'12.5',Text:'A"B'}},{id:9,values:{Temp:'-2',Text:'Euro €'}}]});
const vectors=[
 ['windows-1252',';',['h9iuqs','VDj1CB','scs3zt','GbkbaQ','asQjAM','qtlkJ0'],'QSXBVCeuS2ZSDspY3Fkt7A=='],
 ['utf-16le','\t',['RcSTFX','LoZNWh','Mbc92f','ea/4A0','f9kYK9','7NBz7a'],'OnanK6VgnLA2+aaaozXFsw==']
];

test('native recipe framing matches independent encoded vectors and preserves every language',()=>{
 for(const [encoding,sep,tokens,headerDigest] of vectors) {
  const expected=['List separator='+sep+'Decimal symbol=.'+sep+sep+'"Checksum"',
   ['Mix','',''],['LANGID_409','First','Second'],['LANGID_407','Erste','Zweite'],['7','2','9'],['Temp','12.5','-2'],['Text','A"B','Euro €']]
   .map((row,i)=>i===0?row:row.join(sep)+sep+tokens[i-1]).join('\r\n')+'\r\n';
  const text=HmiFlexibleRecipeFile.write(fixture(sep),encoding,true);
  assert.equal(text,expected);
  const parsed=HmiFlexibleRecipeFile.parse('\uFEFF'+text,encoding,true);
  const bytes=HmiFlexibleRecipeFile.writeBytes(fixture(sep),encoding,true);
  const expectedBytes=encoding==='utf-16le'?Buffer.concat([Buffer.from([255,254]),Buffer.from(expected,'utf16le')]):Buffer.from(expected.replace('€','\u0080'),'latin1');
  assert.deepEqual(Buffer.from(bytes),expectedBytes);
  assert.equal(HmiFlexibleRecipeFile.parseBytes(bytes,encoding,true).records[1].values.Text,'Euro €');
  assert.equal(parsed.recipeNumber,7);assert.deepEqual(parsed.languages,fixture(sep).languages);
  assert.deepEqual(parsed.parameters,['Temp','Text']);assert.deepEqual({...parsed.records[1].values},fixture(sep).records[1].values);
  const header=text.split('\r\n')[0];
  assert.equal(createHash('md5').update(encodeHmiRecipeText(header,encoding)).digest('base64'),headerDigest);
  const marker=['"$RT_COUNT$"','6',headerDigest,'',''].join(sep);
  assert.equal(verifyHmiRecipeCountMarker(marker,header,6,encoding,sep),true);
  assert.equal(verifyHmiRecipeCountMarker(marker,header,5,encoding,sep),false);
  assert.equal(verifyHmiRecipeCountMarker(marker,header+'x',6,encoding,sep),false);
  assert.equal(verifyHmiRecipeCountMarker(marker.replace('6'+sep,'06'+sep),header,6,encoding,sep),false);
 }
});

test('native file verification rejects tampering, truncation, reordering and schema drift',()=>{
 const text=HmiFlexibleRecipeFile.write(fixture(';'),'windows-1252'),lines=text.trimEnd().split('\r\n');
 for(const invalid of [text.replace('12.5','12.6'),text.slice(0,-2),[...lines.slice(0,3),lines[4],lines[3],...lines.slice(5)].join('\r\n')+'\r\n',text.replace('7;2;9','7;2;2'),text.replace('Temp;12.5','Temp;12.5;extra'),text.replace('Decimal symbol=.','Decimal symbol=x'),text.replace('VDj1CB','VDj1C')])
  assert.throws(()=>HmiFlexibleRecipeFile.parse(invalid,'windows-1252',true));
 assert.equal(HmiFlexibleRecipeFile.parse(text.replace('12.5','12.6'),'windows-1252',false).records[0].values.Temp,'12.6');
 const plain=HmiFlexibleRecipeFile.write(fixture(';'),'windows-1252',false);
 assert.throws(()=>HmiFlexibleRecipeFile.parse(plain,'windows-1252',true),/missing/);
 assert.equal(HmiFlexibleRecipeFile.parse(plain,'windows-1252',false).records.length,2);
 for(const change of [data=>data.records[0].values.Text='a;b',data=>data.languages[0].recordNames[0]='a\nb',data=>data.records[0].id=0,data=>data.languages[0].recordNames[1]='First',data=>data.records[0].values.Text='終',data=>data.parameters.push('Temp'),data=>data.records[0].values.Text='x'.repeat(1024)]) {
  const data=fixture(';');change(data);assert.throws(()=>HmiFlexibleRecipeFile.write(data,'windows-1252'));
 }
});

test('strict checksum encodings preserve Windows-1252 and UTF-16 units',()=>{
 assert.deepEqual([...encodeHmiRecipeText('€ŒŸé','windows-1252')],[128,140,159,233]);
 assert.deepEqual([...encodeHmiRecipeText('終\ud800','utf-16le')],[0x42,0x7d,0,0xd8]);
 assert.throws(()=>encodeHmiRecipeText('\u0080','windows-1252'));
 assert.throws(()=>encodeHmiRecipeText('終','windows-1252'));
 assert.equal(verifyHmiRecipeCountMarker('"$RT_COUNT$";6;bogus;','header',6,'windows-1252'),false);
 for(const [bytes,encoding] of [[new Uint8Array([255,254]),'windows-1252'],[new Uint8Array([254,255]),'utf-16le'],[new Uint8Array([255,254,1]),'utf-16le'],[new Uint8Array([239,187,191]),'windows-1252']])assert.throws(()=>HmiFlexibleRecipeFile.parseBytes(bytes,encoding));
});
