import {hmiRecipeLineChecksum} from './HmiRecipeChecksum.js';

import {encodeHmiRecipeText,decodeHmiRecipeText,isHmiRecipeFileEncoding,type HmiRecipeFileEncoding} from './HmiRecipeTextEncoding.js';
export {encodeHmiRecipeText,decodeHmiRecipeText,isHmiRecipeFileEncoding,type HmiRecipeFileEncoding} from './HmiRecipeTextEncoding.js';
export interface HmiFlexibleRecipeLanguageRow { languageId:number; recordNames:string[]; }
export interface HmiFlexibleRecipeFileRecord { id:number; values:Record<string,string>; }
export interface HmiFlexibleRecipeFileData {
  recipeName:string;
  recipeNumber:number;
  separator:string;
  decimalSeparator:string;
  languages:HmiFlexibleRecipeLanguageRow[];
  parameters:string[];
  records:HmiFlexibleRecipeFileRecord[];
}

const limit=16*1024*1024;
function separator(value:string):void {if(![';',',','\t'].includes(value))throw new Error('Invalid recipe separator');}
function number(value:string):number {
  if(!/^[1-9]\d{0,4}$/.test(value) || Number(value)>65535)throw new Error('Invalid native recipe/record number');
  return Number(value);
}
function cell(value:string,sep:string):string {
  if(typeof value!=='string' || value.length>1023 || value.includes(sep) || /[\0\r\n\uFEFF]/.test(value))throw new Error('Unrepresentable native recipe cell');
  return value;
}

/** Transposed scalar recipe files. Cells are literal separator-delimited text, not quoted CSV. */
export class HmiFlexibleRecipeFile {
  /** UTF-16LE files carry FF FE; unmarked input requires an explicit encoding. */
  static parseBytes(bytes:Uint8Array,encoding:HmiRecipeFileEncoding,verifyChecksums=true):HmiFlexibleRecipeFileData {
    if(!(bytes instanceof Uint8Array) || bytes.length>2*limit+2 || !isHmiRecipeFileEncoding(encoding))throw new Error('Invalid recipe bytes or encoding');
    const bom=bytes[0]===255 && bytes[1]===254;
    if(bytes[0]===254 && bytes[1]===255 || bytes[0]===239 && bytes[1]===187 && bytes[2]===191 || bom && encoding!=='utf-16le')throw new Error('Recipe BOM and encoding mismatch');
    const start=bom?2:0;
    if(encoding==='utf-16le' && (bytes.length-start)%2!==0)throw new Error('Invalid recipe byte length');
    return this.parse(decodeHmiRecipeText(bytes.subarray(start),encoding),encoding,verifyChecksums);
  }

  static writeBytes(data:HmiFlexibleRecipeFileData,encoding:HmiRecipeFileEncoding,checksums=true):Uint8Array {
    const bytes=encodeHmiRecipeText(this.write(data,encoding,checksums),encoding);
    if(encoding!=='utf-16le')return bytes;
    const output=new Uint8Array(bytes.length+2);output[0]=255;output[1]=254;output.set(bytes,2);return output;
  }

  static parse(text:string,encoding:HmiRecipeFileEncoding,verifyChecksums=true):HmiFlexibleRecipeFileData {
    if(typeof text!=='string' || text.length>limit)throw new Error('Recipe file exceeds the text limit');
    if(text.startsWith('\uFEFF'))text=text.slice(1);
    encodeHmiRecipeText(text,encoding);
    if(text.includes('\0') || /\r(?!\n)/.test(text) || !text.endsWith('\n'))throw new Error('Invalid or truncated recipe lines');
    const lines=text.slice(0,-1).split('\n').map(line=>line.endsWith('\r')?line.slice(0,-1):line);
    if(lines.length<5 || lines.length>10260)throw new Error('Invalid recipe row count');
    const header=lines[0]!;
    if(!header.startsWith('List separator=') || header.length<16)throw new Error('Invalid recipe header');
    const sep=header[15]!;separator(sep);
    const headerCells=header.split(sep),checked=headerCells.at(-1)==='"Checksum"';
    if(checked)headerCells.pop();
    if(verifyChecksums && !checked)throw new Error('Recipe checksums are missing');
    if(headerCells[0]!=='List separator=' || !/^Decimal symbol=[.,]$/.test(headerCells[1]??'') || headerCells.slice(2).some(c=>c!==''))throw new Error('Invalid recipe header columns');
    const decimal=headerCells[1]!.slice(-1);
    if(sep===decimal)throw new Error('Recipe separators must differ');
    const width=headerCells.length;
    if(width<2 || width>65536 || width*lines.length>1000000)throw new Error('Invalid recipe column count or cell budget');
    let previous='';
    const rows=lines.slice(1).map(line=>{
      let body=line;
      if(checked) {
        const at=line.lastIndexOf(sep),token=line.slice(at+1);
        if(at<0 || !/^[A-Za-z0-9+/=]{1,24}$/.test(token))throw new Error('Invalid recipe checksum field');
        if(previous && token.length!==previous.length)throw new Error('Inconsistent recipe checksum width');
        body=line.slice(0,at);
        if(verifyChecksums && hmiRecipeLineChecksum(encodeHmiRecipeText(line.slice(0,at+1),encoding),encodeHmiRecipeText(previous?previous+'\r\n':'',encoding),token.length)!==token)throw new Error('Recipe checksum mismatch');
        previous=token;
      }
      const cells=body.split(sep);
      if(cells.length!==width)throw new Error('Recipe record column count mismatch');
      cells.forEach(value=>cell(value,sep));
      return cells;
    });
    const title=rows.shift()!;
    if(!title[0] || title.slice(1).some(c=>c!==''))throw new Error('Invalid recipe name row');
    const languages:HmiFlexibleRecipeLanguageRow[]=[];
    while(rows[0]?.[0]?.startsWith('LANGID_')) {
      const row=rows.shift()!,match=/^LANGID_([0-9a-f]{1,4})$/i.exec(row[0]!);
      if(!match || languages.length>=256)throw new Error('Invalid recipe language');
      const languageId=Number.parseInt(match[1]!,16),recordNames=row.slice(1);
      if(languages.some(l=>l.languageId===languageId) || recordNames.some(n=>!n) || new Set(recordNames).size!==recordNames.length)throw new Error('Duplicate or empty recipe record names');
      languages.push({languageId,recordNames});
    }
    if(!languages.length || !rows.length)throw new Error('Missing recipe language or identity row');
    const identity=rows.shift()!,recipeNumber=number(identity[0]!),ids=identity.slice(1).map(number);
    if(new Set(ids).size!==ids.length)throw new Error('Duplicate recipe record numbers');
    const parameters:string[]=[],records=ids.map(id=>({id,values:Object.create(null) as Record<string,string>}));
    for(const row of rows) {
      const name=row[0]!;
      if(!name || name.startsWith('LANGID_') || name==='"$RT_COUNT$"' || parameters.includes(name))throw new Error('Duplicate or reserved recipe parameter');
      parameters.push(name);records.forEach((record,i)=>record.values[name]=row[i+1]!);
    }
    if(!parameters.length || parameters.length>10000)throw new Error('Invalid recipe parameter count');
    return {recipeName:title[0]!,recipeNumber,separator:sep,decimalSeparator:decimal,languages,parameters,records};
  }

  static write(data:HmiFlexibleRecipeFileData,encoding:HmiRecipeFileEncoding,checksums=true):string {
    separator(data.separator);
    if(!['.',','].includes(data.decimalSeparator) || data.separator===data.decimalSeparator || !data.records.length || data.records.length>65535 || !data.languages.length || data.languages.length>256 || !data.parameters.length || data.parameters.length>10000 || (data.records.length+1)*(data.parameters.length+data.languages.length+3)>1000000)throw new Error('Invalid native recipe dimensions or separators');
    if(new Set(data.parameters).size!==data.parameters.length || data.records.some(record=>!record.values || Object.keys(record.values).length!==data.parameters.length || Object.keys(record.values).some(key=>!data.parameters.includes(key))))throw new Error('Native recipe parameter schema mismatch');
    const sep=data.separator;let budget=0;
    const join=(cells:string[])=>{
      cells.forEach(c=>cell(c,sep));budget+=cells.reduce((n,c)=>n+c.length,0)+cells.length+32;
      if(budget>limit)throw new Error('Recipe file exceeds the text limit');
      return cells.join(sep);
    };
    const rows=[join([data.recipeName,...data.records.map(()=>'')])];
    for(const language of data.languages) {
      if(!Number.isInteger(language.languageId) || language.languageId<0 || language.languageId>65535 || language.recordNames.length!==data.records.length)throw new Error('Invalid recipe language row');
      rows.push(join(['LANGID_'+language.languageId.toString(16),...language.recordNames]));
    }
    rows.push(join([String(data.recipeNumber),...data.records.map(record=>String(record.id))]));
    for(const parameter of data.parameters)rows.push(join([parameter,...data.records.map(record=>record.values[parameter]!)]));
    let header='List separator='+sep+'Decimal symbol='+data.decimalSeparator+sep.repeat(data.records.length-1);
    if(checksums)header+=sep+'"Checksum"';
    let previous='',length=header.length+2;
    const output=[header];
    for(const row of rows) {
      const body=row+(checksums?sep:'');
      const token=checksums?hmiRecipeLineChecksum(encodeHmiRecipeText(body,encoding),encodeHmiRecipeText(previous?previous+'\r\n':'',encoding)):'';
      length+=body.length+token.length+2;
      if(length>limit)throw new Error('Recipe file exceeds the text limit');
      output.push(body+token);previous=token;
    }
    const result=output.join('\r\n')+'\r\n';
    encodeHmiRecipeText(result,encoding);
    this.parse(result,encoding,checksums);
    return result;
  }
}

/** Verifies a decoded count-marker row against its header and an explicit expected count.
 * Recipe exports do not require this marker. The row's chained checksum is verified separately.
 */
export function verifyHmiRecipeCountMarker(row:string,header:string,expectedCount:number,encoding:HmiRecipeFileEncoding,sep=';'):boolean {
  separator(sep);
  if(typeof row!=='string' || typeof header!=='string' || row.length>limit || header.length>limit || !Number.isSafeInteger(expectedCount) || expectedCount<0 || /[\r\n\0]/.test(row) || /[\r\n\0]/.test(header))return false;
  const cells=row.split(sep);
  if(cells.length<4 || cells[0]!=='"$RT_COUNT$"' || !/^(0|[1-9]\d*)$/.test(cells[1]!) || Number(cells[1])!==expectedCount || cells.slice(3).some(c=>c!==''))return false;
  const token=cells[2]!;
  return /^[A-Za-z0-9+/=]{1,24}$/.test(token) && hmiRecipeLineChecksum(encodeHmiRecipeText(header,encoding),new Uint8Array(),token.length)===token;
}
