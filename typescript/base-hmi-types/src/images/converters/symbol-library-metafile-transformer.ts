import {HmiSymbolLibraryFlip as Flip,HmiSymbolLibraryRotation as Rotation,HmiSymbolLibraryFillColorMode} from '../../screens/base/HmiSymbolLibraryEnums.js';
import {SymbolLibraryMetafileColorizer} from './symbol-library-metafile-colorizer.js';
/** Symbol Factory record-level WMF transforms; never rotates its host rectangle. */
export class SymbolLibraryMetafileTransformer {
  static tryTransform(bytes: Uint8Array,flip: Flip,rotation: Rotation): Uint8Array|undefined {
    if(!Object.values(Flip).includes(flip)||!Object.values(Rotation).includes(rotation))return undefined;
    const result=SymbolLibraryMetafileColorizer.tryRecolor(bytes,HmiSymbolLibraryFillColorMode.Original);if(!result)return undefined;
    const src=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),dst=new DataView(result.buffer);
    let horizontal=flip===Flip.Horizontal||flip===Flip.Both,vertical=flip===Flip.Vertical||flip===Flip.Both;
    if(rotation===Rotation.Angle90||rotation===Rotation.Angle180){horizontal=!horizontal;vertical=!vertical;}
    const turn=rotation===Rotation.Angle90||rotation===Rotation.Angle270;
    let ox=0,oy=0,ex=32767,ey=32767;
    const end=src.getUint32(6,true)*2;
    const point=(xAt: number,yAt: number,xy: boolean): void=>{
      let x=dst.getInt16(xAt,true),y=dst.getInt16(yAt,true);
      if(horizontal)x=ox*2+ex-x;if(vertical)y=oy*2+ey-y;
      if(turn){const old=xy?x:y;if(xy){x=ox+ey-(y-oy);y=oy+(old-ox);}else{y=ox+ey-(x-oy);x=oy+(old-ox);}}
      dst.setInt16(xAt,x,true);dst.setInt16(yAt,y,true);
    };
    for(let at=18;at<end;){
      const size=src.getUint32(at,true)*2,code=src.getUint16(at+4,true),p=at+6;
      switch(code){
        case 0x20b: if(size<10)return undefined;ox=src.getInt16(p+2,true);oy=src.getInt16(p,true);break;
        case 0x20c: if(size<10)return undefined;ex=src.getInt16(p+2,true);ey=src.getInt16(p,true);if(turn){dst.setInt16(p+2,ey,true);dst.setInt16(p,ex,true);}break;
        case 0x213:case 0x214:if(size<10)return undefined;point(p+2,p,false);break;
        case 0x324:case 0x325:{
          if(size<8)return undefined;const count=src.getInt16(p,true);if(count<0||count>Math.floor((size-8)/4))return undefined;
          for(let i=0;i<count;i++)point(p+2+i*4,p+4+i*4,true);break;
        }
        case 0x538:{
          if(size<8)return undefined;const polygons=src.getInt16(p,true);if(polygons<0||polygons>Math.floor((size-8)/2))return undefined;
          let pointsAt=p+2+polygons*2;
          for(let i=0;i<polygons;i++){
            const points=src.getInt16(p+2+i*2,true);if(points<0||points>Math.floor((at+size-pointsAt)/4))return undefined;
            for(let j=0;j<points;j++)point(pointsAt+j*4,pointsAt+j*4+2,true);pointsAt+=points*4;
          }break;
        }
        case 0x418:case 0x41b:{
          if(size<14)return undefined;
          if(horizontal){const right=dst.getInt16(p+2,true);dst.setInt16(p+2,ox*2+ex-dst.getInt16(p+6,true),true);dst.setInt16(p+6,ox*2+ex-right,true);}
          if(vertical){const bottom=dst.getInt16(p,true);dst.setInt16(p,oy+ey-(dst.getInt16(p+4,true)-ox),true);dst.setInt16(p+4,oy+ey-(bottom-ox),true);}
          if(turn){const bottom=dst.getInt16(p,true);dst.setInt16(p,ox*2+ex-dst.getInt16(p+2,true),true);dst.setInt16(p+2,ox*2+ex-bottom,true);}break;
        }
        case 0x41f:if(size<18)return undefined;point(p+10,p+8,false);break;
      }
      at+=size;
    }
    return result;
  }
}
