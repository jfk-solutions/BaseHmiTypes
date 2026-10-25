// Adapted and modified from emf-converter/gdi-raster-widen.ts, commit
// effcf337218fefc08e4ac8f74e59cd2af1a9235c (Apache-2.0).
// Copyright 2025-present pptx-viewer contributors.
// Changes: port matching C# native ellipse/flattener integration, exact integer
// rounding and bounded straight outlines for all cap styles. See THIRD-PARTY-NOTICES.
import {buildNativeEllipse} from './native-ellipse-builder.js';
import {flattenNativeBezier} from './native-bezier-flattener.js';
type Point=[number,number];
const hobby=[
  [0,-8,-8,0,0,8,8,0],
  [8,-16,-8,-16,-16,0,-8,16,8,16,16,0],
  [8,-24,-8,-24,-24,-8,-24,8,-8,24,8,24,24,8,24,-8],
  [8,-32,-8,-32,-24,-24,-32,-8,-32,8,-24,24,-8,32,8,32,24,24,32,8,32,-8,24,-24],
  [8,-40,-8,-40,-24,-32,-32,-24,-40,-8,-40,8,-32,24,-24,32,-8,40,8,40,24,32,32,24,40,8,40,-8,32,-24,24,-32],
  [8,-48,-8,-48,-24,-40,-40,-24,-48,-8,-48,8,-40,24,-24,40,-8,48,8,48,24,40,40,24,48,8,48,-8,40,-24,24,-40],
];
export function buildNativeFlatPen(start:Point,end:Point,width:number,square=false,roundCap=false,roundJoin=false):Point[]|undefined {
  const valid=(v:number)=>Number.isFinite(v)&&Number.isInteger(v*16)&&Math.abs(v*16)<=0x2000000;
  if(square&&roundCap||!start.every(valid)||!end.every(valid)||!valid(width)||width<=0||width>4096)return undefined;
  let dx=(end[0]-start[0])*16,dy=(end[1]-start[1])*16;if(dx===0&&dy===0)return undefined;
  const originalDx=dx,originalDy=dy;
  const pen:Point[]=[],fixedWidth=width*16;
  if(fixedWidth<104){const table=hobby[Math.min(5,Math.max(0,Math.floor(width+.5)-1))];for(let i=0;i<table.length;i+=2)pen.push([table[i],table[i+1]]);}
  else {
    const radius=Math.ceil(fixedWidth/2)/16,controls=buildNativeEllipse([[-radius,-radius],[radius,-radius],[-radius,radius]]);if(!controls)return undefined;
    pen.push([controls[0][0]*16,controls[0][1]*16]);
    for(let i=1;i<=4;i+=3){const flattened=flattenNativeBezier([controls[i-1],controls[i],controls[i+1],controls[i+2]]);if(!flattened)return undefined;for(const p of flattened.slice(1))pen.push([p[0]*16,p[1]*16]);}
    pen.pop();const half=pen.slice();for(const p of half)pen.push([-p[0],-p[1]]);
  }
  const flip=dx<0||dx===0&&dy<0;if(flip){dx=-dx;dy=-dy;}
  const h=(p:Point)=>-dy*p[0]+dx*p[1];let best=0;for(let i=1;i<pen.length;i++)if(h(pen[i])>h(pen[best]))best=i;
  const n=pen.length,bh=h(pen[best]);if(flip&&best===0&&h(pen[n-1])===bh)best=n-1;
  const previous=pen[(best+n-1)%n],next=pen[(best+1)%n],d=pen[best],hp=h(previous),hn=h(next),b=hp>=hn?previous:next;
  const hb=Math.max(hp,hn),hs=Math.min(hp,hn),den=2*(bh-hb+bh-hs),num=hb-hs,firstEdge=best===0&&hp>=hn;
  const round=(dc:number,bc:number,channel:number):number=>{
    const sign=channel===0?(dx===0?0:Math.sign(dy)):Math.sign(dx),odd=Math.abs(bc-dc)%2!==0,bias2=sign+(odd?(firstEdge?1:-1):0);
    if(den===0)return 8*(channel===1&&dy<0?Math.ceil((dc+bias2/2+4)/8)-1:Math.floor((dc+bias2/2+4)/8));
    const top=BigInt(dc)*BigInt(den)+BigInt(bc-dc)*BigInt(num),dividend=2n*top+BigInt(den)*BigInt(bias2+8)-(channel===1&&dy<0?1n:0n),divisor=16n*BigInt(den);
    let quotient=dividend/divisor;if(dividend%divisor<0n)quotient--;return Number(quotient)*8;
  };
  let vx=round(d[0],b[0],0)/16,vy=round(d[1],b[1],1)/16;if(flip){vx=-vx;vy=-vy;}
  if(roundCap){
    let rx=den===0?BigInt(d[0]):BigInt(d[0])*BigInt(den)+BigInt(b[0]-d[0])*BigInt(num),ry=den===0?BigInt(d[1]):BigInt(d[1])*BigInt(den)+BigInt(b[1]-d[1])*BigInt(num);
    if(flip){rx=-rx;ry=-ry;}
    let left=0,right=0;
    if(roundJoin){
      const axis=pen.some(q=>q[1]===0),boundary=(n===4?1:2)*Math.abs(originalDx),steep=Math.abs(originalDy)>boundary||Math.abs(originalDy)===boundary&&axis;
      const sign=(steep?originalDy<0:originalDx<0||originalDx===0&&originalDy<0)?-1:1;
      const height=(q:Point)=>originalDy*q[0]-originalDx*q[1],along=(q:Point)=>sign*(originalDx*q[0]+originalDy*q[1]);
      for(let i=1;i<n;i++)if(height(pen[i])>height(pen[left])||height(pen[i])===height(pen[left])&&along(pen[i])>along(pen[left]))left=i;
      right=(left+n/2)%n;const half=(value:number)=>Math.sign(value)*8*Math.floor((Math.abs(value)+4)/8)/16;vx=half(pen[right][0]);vy=half(pen[right][1]);
    }
    const result:Point[]=[];
    const cap=(anchor:Point,first:boolean)=>{
      const ax=first?-rx:rx,ay=first?-ry:ry;
      result.push(first?[anchor[0]-vx,anchor[1]-vy]:[anchor[0]+vx,anchor[1]+vy]);
      const selected=pen.map(q=>{const cross=ax*BigInt(q[1])-ay*BigInt(q[0]);return cross<0n||cross===0n&&ax*BigInt(q[0])+ay*BigInt(q[1])>0n;});
      let begin=0;for(let i=0;i<n;i++)if(selected[i]&&!selected[(i+n-1)%n]){begin=i;break;}
      let finish=-1;if(roundJoin){begin=((first?left:right)+1)%n;finish=first?right:left;}
      const integral=Number.isInteger(anchor[0])&&Number.isInteger(anchor[1]);
      for(let i=0;i<n&&(roundJoin?(begin+i)%n!==finish:selected[(begin+i)%n]);i++){
        const q=pen[(begin+i)%n];result.push([anchor[0]+(q[0]-(integral?Math.sign(q[0]):0))/16,anchor[1]+(q[1]-(integral?Math.sign(q[1]):0))/16]);
      }
      result.push(first?[anchor[0]+vx,anchor[1]+vy]:[anchor[0]-vx,anchor[1]-vy]);
    };
    cap(start,true);cap(end,false);return result;
  }
  let ex=0,ey=0;
  if(square){
    const wholeX=Math.floor(originalDx/16)*16,wholeY=Math.floor(originalDy/16)*16,length=Math.sqrt(wholeX*wholeX+wholeY*wholeY);
    if(length>0){
      const ratio=fixedWidth/2/length,extension=(delta:number)=>{const value=delta*ratio;return Math.sign(value)*Math.floor(Math.abs(value)+.5)/16;};
      ex=extension(originalDx);ey=extension(originalDy);
    }
  }
  return [[start[0]-vx-ex,start[1]-vy-ey],[start[0]+vx-ex,start[1]+vy-ey],[end[0]+vx+ex,end[1]+vy+ey],[end[0]-vx+ex,end[1]-vy+ey]];
}
