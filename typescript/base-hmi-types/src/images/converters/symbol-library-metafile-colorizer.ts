import type {HmiColor} from '../../screens/base/HmiColor.js';
import {HmiSymbolLibraryFillColorMode as Mode} from '../../screens/base/HmiSymbolLibraryEnums.js';
/** Symbol Factory brush-only WMF coloring. Original image bytes are never modified. */
export class SymbolLibraryMetafileColorizer {
  static tryRecolor(bytes: Uint8Array,mode: Mode,color?: HmiColor): Uint8Array|undefined {
    if(!Object.values(Mode).includes(mode)||bytes.length<24)return undefined;
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    if(![1,2].includes(view.getUint16(0,true))||view.getUint16(2,true)!==9||![0x100,0x300].includes(view.getUint16(4,true)))return undefined;
    if((mode===Mode.Solid||mode===Mode.Shaded)&&(!color||color.alpha!==255))return undefined;
    const words=view.getUint32(6,true);if(words<12||words>Math.floor(bytes.length/2))return undefined;
    const end=words*2,result=new Uint8Array(bytes),output=new DataView(result.buffer);
    for(let at=18;at+6<=end;){
      const recordWords=view.getUint32(at,true);if(recordWords<3||recordWords>Math.floor((end-at)/2))return undefined;
      const code=view.getUint16(at+4,true);
      if(code===0x2fc&&mode!==Mode.Original){
        if(recordWords<7)return undefined;
        if(mode===Mode.Hollow)output.setUint16(at+6,1,true);
        else output.setUint32(at+8,mode===Mode.Solid?pack(color!.red,color!.green,color!.blue):shade(view.getUint32(at+8,true),color!),true);
      }
      at+=recordWords*2;if(code===0)return recordWords===3&&at===end?result:undefined;
    }
    return undefined;
  }
}
const pack=(r: number,g: number,b: number): number=>(r|(g<<8)|(b<<16))>>>0;
function shade(source: number,target: HmiColor): number {
  if(source===0||source===0xffffff)return source;
  const brightness=((source&255)*0.333+((source>>>8)&255)*0.333+((source>>>16)&255)*0.333)/255;
  const channel=(value: number): number=>Math.trunc(brightness>=0.5?value+(255-value)*(brightness-0.5)*2:brightness*2*value)&255;
  return pack(channel(target.red),channel(target.green),channel(target.blue));
}
