import type {HmiRecipeBinaryValue} from './HmiRecipe.js';

export class HmiRecipeBinaryField {
  name=''; byteOffset=0; dataType=''; bitIndex?:number;
}
/** Explicit byte offsets and byte order; padding is preserved from the supplied payload. */
export class HmiRecipeBinaryLayout {
  byteLength=0; littleEndian?:boolean; readonly fields:HmiRecipeBinaryField[]=[];
}
const types:Record<string,number>={bool:1,byte:1,usint:1,sint:1,word:2,uint:2,int:2,dword:4,udint:4,dint:4,lword:8,ulint:8,lint:8,real:4,lreal:8};
function fields(layout:HmiRecipeBinaryLayout):{field:HmiRecipeBinaryField;type:string;size:number}[] {
  if(!layout || !Number.isSafeInteger(layout.byteLength) || layout.byteLength<1 || layout.byteLength>1000000 || typeof layout.littleEndian!=='boolean' || !Array.isArray(layout.fields) || !layout.fields.length || layout.fields.length>10000)throw new Error('Invalid explicit recipe binary layout');
  const names=new Set<string>(),bits=new Map<number,number>();
  return layout.fields.map(field=>{
    const type=typeof field.dataType==='string'?field.dataType.toLowerCase():'',size=types[type];
    if(typeof field.name!=='string' || !field.name || names.has(field.name) || !size || !Number.isSafeInteger(field.byteOffset) || field.byteOffset<0 || field.byteOffset+size>layout.byteLength || (type==='bool'? !Number.isInteger(field.bitIndex) || field.bitIndex!<0 || field.bitIndex!>7:field.bitIndex!==undefined))throw new Error('Invalid recipe binary field');
    names.add(field.name);
    for(let offset=field.byteOffset;offset<field.byteOffset+size;offset++){
      const mask=type==='bool'?1<<field.bitIndex!:255;
      if((bits.get(offset)??0)&mask)throw new Error('Overlapping recipe binary fields');bits.set(offset,(bits.get(offset)??0)|mask);
    }
    return {field,type,size};
  });
}
function payload(bytes:Uint8Array,layout:HmiRecipeBinaryLayout):DataView {
  if(!(bytes instanceof Uint8Array) || bytes.length!==layout.byteLength)throw new Error('Recipe binary payload size mismatch');
  return new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
}
// Round the exact binary value to 17 significant decimal digits, with ties away
// from zero. This avoids platform-specific decimal formatting tie behavior.
function realText(value:number):string {
  if(value===0)return Object.is(value,-0)?'-0':'0e0';
  const buffer=new ArrayBuffer(8),view=new DataView(buffer);view.setFloat64(0,value,false);
  const bits=view.getBigUint64(0,false),exponent=Number((bits>>52n)&2047n);
  let coefficient=(bits&((1n<<52n)-1n))|(exponent?1n<<52n:0n);
  const power=exponent?exponent-1023-52:-1074;
  let scale=0;
  if(power<0){scale=-power;coefficient*=5n**BigInt(scale);}else coefficient<<=BigInt(power);
  let digits=String(coefficient),decimalExponent=digits.length-scale-1;
  if(digits.length>17){
    let rounded=BigInt(digits.slice(0,17));if(digits[17]!>='5')rounded++;
    digits=String(rounded);if(digits.length>17){decimalExponent++;digits=digits.slice(0,17);}
  }
  digits=digits.replace(/0+$/,'');
  return (value<0?'-':'')+digits[0]+(digits.length>1?'.'+digits.slice(1):'')+'e'+decimalExponent;
}
export class HmiRecipeBinaryCodec {
  static readPayload(value:HmiRecipeBinaryValue,layout:HmiRecipeBinaryLayout):Uint8Array {
    fields(layout);const text=value?.payloadBase64;
    if(typeof text!=='string' || text.length>1333336 || text.length%4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text))throw new Error('Unavailable or invalid recipe binary payload');
    const decoded=atob(text),bytes=Uint8Array.from(decoded,c=>c.charCodeAt(0));
    if(value.decodedByteLength!==undefined && value.decodedByteLength!==bytes.length)throw new Error('Recipe binary length metadata mismatch');
    // A canonical Base64 tail has no unused set bits.
    if(text.endsWith('==') && 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(text.at(-3)!)%16 || text.endsWith('=') && !text.endsWith('==') && 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(text.at(-2)!)%4)throw new Error('Noncanonical recipe binary payload');
    this.decode(bytes,layout);return bytes;
  }
  static decode(bytes:Uint8Array,layout:HmiRecipeBinaryLayout):Record<string,string> {
    const configured=fields(layout),view=payload(bytes,layout),result:Record<string,string>=Object.create(null);
    for(const {field,type,size} of configured) {
      const offset=field.byteOffset;
      if(type==='bool'){result[field.name]=(bytes[offset]!&(1<<field.bitIndex!))?'true':'false';continue;}
      if(type==='real' || type==='lreal'){
        const value=type==='real'?view.getFloat32(offset,layout.littleEndian):view.getFloat64(offset,layout.littleEndian);
        if(!Number.isFinite(value))throw new Error('Nonfinite recipe binary field');
        result[field.name]=realText(value);continue;
      }
      let number=0n;
      for(let i=0;i<size;i++)number=(number<<8n)|BigInt(bytes[offset+(layout.littleEndian?size-1-i:i)]!);
      if(['sint','int','dint','lint'].includes(type))number=BigInt.asIntN(size*8,number);
      result[field.name]=String(number);
    }
    return result;
  }
  static patch(bytes:Uint8Array,values:Readonly<Record<string,string>>,layout:HmiRecipeBinaryLayout,requireAll=true):Uint8Array {
    const configured=fields(layout);payload(bytes,layout);
    if(!values || Object.keys(values).some(name=>!configured.some(c=>c.field.name===name)) || requireAll && Object.keys(values).length!==configured.length)throw new Error('Recipe binary field schema mismatch');
    const result=bytes.slice(),view=payload(result,layout);
    for(const {field,type,size} of configured) {
      if(!Object.hasOwn(values,field.name))continue;
      const value=values[field.name];if(typeof value!=='string')throw new Error('Recipe binary field must be scalar text');
      if(type==='bool'){
        if(!/^(true|false|0|1)$/i.test(value))throw new Error('Invalid binary Boolean');
        const mask=1<<field.bitIndex!;result[field.byteOffset]=(result[field.byteOffset]!&~mask)|(/^(true|1)$/i.test(value)?mask:0);continue;
      }
      if(type==='real' || type==='lreal') {
        if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value))throw new Error('Invalid binary floating value');
        const number=Number(value);if(!Number.isFinite(number) || type==='real' && !Number.isFinite(Math.fround(number)))throw new Error('Binary floating overflow');
        if(type==='real')view.setFloat32(field.byteOffset,number,layout.littleEndian);else view.setFloat64(field.byteOffset,number,layout.littleEndian);continue;
      }
      if(!/^[+-]?\d+$/.test(value))throw new Error('Invalid binary integer');
      let number=BigInt(value),signed=['sint','int','dint','lint'].includes(type);
      if((signed?BigInt.asIntN(size*8,number):BigInt.asUintN(size*8,number))!==number)throw new Error('Binary integer overflow');
      number=BigInt.asUintN(size*8,number);
      for(let i=0;i<size;i++){result[field.byteOffset+(layout.littleEndian?i:size-1-i)]=Number(number&255n);number>>=8n;}
    }
    this.decode(result,layout);return result;
  }
}
