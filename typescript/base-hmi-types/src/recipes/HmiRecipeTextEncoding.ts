import {recipeCodePageData} from './HmiRecipeCodePagesData.generated.js';

export type HmiRecipeFileEncoding = 'utf-16le' | 'windows-874' | 'windows-932' | 'windows-936' | 'windows-949' | 'windows-950' |
  'windows-1250' | 'windows-1251' | 'windows-1252' | 'windows-1253' | 'windows-1254' | 'windows-1255' | 'windows-1256' | 'windows-1257' | 'windows-1258';
const limit=16*1024*1024;
interface Mapping {decode:Map<number,number>;encode:Map<number,number>;}
const mappings=new Map<number,Mapping>();
export function isHmiRecipeFileEncoding(value:unknown):value is HmiRecipeFileEncoding {
  return value==='utf-16le' || typeof value==='string' && /^windows-\d+$/.test(value) && value==='windows-'+Number(value.slice(8)) && Object.hasOwn(recipeCodePageData,Number(value.slice(8)));
}
function mapping(encoding:HmiRecipeFileEncoding):Mapping {
  if(!isHmiRecipeFileEncoding(encoding) || encoding==='utf-16le')throw new Error('Unsupported recipe code page');
  const page=Number(encoding.slice(8));let result=mappings.get(page);if(result)return result;
  result={decode:new Map(),encode:new Map()};
  const data=atob(recipeCodePageData[page]!);
  for(let i=0;i<data.length;i+=5) {
    const key=data.charCodeAt(i)|(data.charCodeAt(i+1)<<8),code=data.charCodeAt(i+2)|(data.charCodeAt(i+3)<<8);
    result.decode.set(key,code);if(data.charCodeAt(i+4))result.encode.set(code,key);
  }
  mappings.set(page,result);return result;
}
/** Strict, reversible code-page conversion. Best-fit substitutions and byte aliases reject. */
export function encodeHmiRecipeText(text:string,encoding:HmiRecipeFileEncoding):Uint8Array {
  if(typeof text!=='string' || text.length>limit || !isHmiRecipeFileEncoding(encoding))throw new Error('Invalid recipe text or encoding');
  const bytes=new Uint8Array(text.length*2);let cursor=0;
  const table=encoding==='utf-16le'?undefined:mapping(encoding);
  for(let i=0;i<text.length;i++) {
    const code=text.charCodeAt(i);
    if(!table){bytes[cursor++]=code&255;bytes[cursor++]=code>>>8;}
    else {
      const key=table.encode.get(code);
      if(key===undefined)throw new Error(`Recipe character cannot be encoded as ${encoding}`);
      if(key>=256)bytes[cursor++]=key>>>8;
      bytes[cursor++]=key&255;
    }
  }
  return bytes.slice(0,cursor);
}
export function decodeHmiRecipeText(bytes:Uint8Array,encoding:HmiRecipeFileEncoding):string {
  if(!(bytes instanceof Uint8Array) || bytes.length>2*limit || !isHmiRecipeFileEncoding(encoding) || encoding==='utf-16le' && bytes.length%2)throw new Error('Invalid recipe bytes or encoding');
  const table=encoding==='utf-16le'?undefined:mapping(encoding),parts:string[]=[];let characters:number[]=[];
  for(let i=0;i<bytes.length;i++) {
    let key=bytes[i]!,code:number|undefined;
    if(!table)code=key|(bytes[++i]!<<8);
    else {
      code=table.decode.get(key);
      if(code===undefined && i+1<bytes.length){key=(key<<8)|bytes[++i]!;code=table.decode.get(key);}
      if(code===undefined || table.encode.get(code)!==key)throw new Error('Invalid or noncanonical recipe byte sequence');
    }
    characters.push(code!);
    if(characters.length===8192){parts.push(String.fromCharCode(...characters));characters=[];}
  }
  parts.push(String.fromCharCode(...characters));const text=parts.join('');
  if(text.length>limit)throw new Error('Recipe file exceeds the text limit');
  return text;
}
