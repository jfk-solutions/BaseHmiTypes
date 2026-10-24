// Hybrid forward differencing adapted from Microsoft's MIT-licensed WPF geometry
// reference. See THIRD-PARTY-NOTICES.txt. Retains GDI's older tolerance/precision.
type Point = [number, number];
const maxPoints=65536, initialTolerance=65472, workingTolerance=initialTolerance*8;

// Number arithmetic stays exact within this bounded profile. Do not use JS
// bitwise shifts here: they truncate valid large translated positions to int32.
class Axis {
  position:number; delta:number; endError:number; startError:number;
  constructor(a:number,b:number,c:number,d:number){this.position=a*1024;this.delta=(d-a)*1024;this.endError=6*(b-2*c+d)*1024;this.startError=6*(a-2*b+c)*1024;}
  get error(){return Math.max(Math.abs(this.endError),Math.abs(this.startError));}
  get parentErrorQuarter(){return Math.max(Math.abs(this.startError),Math.abs(2*this.endError-this.startError));}
  initialHalf(shift:number){this.endError=Math.floor((this.endError+this.startError)/2);this.delta=Math.floor((this.delta-Math.floor(this.endError/2**shift))/2);}
  normalize(shift:number){this.position*=8;this.delta*=8;this.endError=Math.floor(this.endError*2**(3-shift));this.startError=Math.floor(this.startError*2**(3-shift));}
  half(){this.endError=Math.floor((this.endError+this.startError)/8);this.delta=Math.floor((this.delta-this.endError)/2);this.startError=Math.floor(this.startError/4);}
  double(){this.delta=2*this.delta+this.endError;this.endError=8*this.endError-4*this.startError;this.startError*=4;}
  step(){this.position+=this.delta;this.delta+=this.endError;const previous=this.endError;this.endError=2*this.endError-this.startError;this.startError=previous;}
  get value(){return Math.floor((this.position+4096)/8192)/16;}
}
const abs=(x:bigint)=>x<0n?-x:x;
const max=(a:bigint,b:bigint)=>a>b?a:b;
class WideAxis {
  position:bigint; delta:bigint; endError:bigint; startError:bigint;
  constructor(a:number,b:number,c:number,d:number){this.position=BigInt(a)<<28n;this.delta=BigInt(d-a)<<28n;this.endError=BigInt(6*(b-2*c+d))<<28n;this.startError=BigInt(6*(a-2*b+c))<<28n;}
  get error(){return max(abs(this.endError),abs(this.startError));}
  get parentError(){return max(abs(4n*this.startError),abs(8n*this.endError-4n*this.startError));}
  half(){this.endError=(this.endError+this.startError)>>3n;this.delta=(this.delta-this.endError)>>1n;this.startError>>=2n;}
  double(){this.delta=2n*this.delta+this.endError;this.endError=8n*this.endError-4n*this.startError;this.startError*=4n;}
  step(){this.position+=this.delta;this.delta+=this.endError;const previous=this.endError;this.endError=2n*this.endError-this.startError;this.startError=previous;}
  static round(value:bigint){return Number((value+(1n<<27n))>>28n);}
  get value(){return WideAxis.round(this.position);}
  // BigInt division truncates toward zero; signed shifts round downward.
  controls(){return [this.value,WideAxis.round(this.position+(6n*this.delta-this.endError-2n*this.startError)/18n),WideAxis.round(this.position+(12n*this.delta-2n*this.endError-this.startError)/18n),WideAxis.round(this.position+this.delta)];}
}
function small(p:Point[],result:Point[]):boolean {
  const x=new Axis(p[0][0],p[1][0],p[2][0],p[3][0]),y=new Axis(p[0][1],p[1][1],p[2][1],p[3][1]);let shift=0,remaining=1;
  // Keep initial errors unscaled until subdivision depth is established.
  while(Math.max(x.error,y.error)>initialTolerance*2**shift){if(shift>=40)return false;shift+=2;x.initialHalf(shift);y.initialHalf(shift);remaining*=2;}
  x.normalize(shift);y.normalize(shift);x.step();y.step();remaining--;
  while(result.length<maxPoints){
    result.push([x.value,y.value]);if(remaining===0)return true;
    if(Math.max(x.error,y.error)>workingTolerance){x.half();y.half();remaining*=2;}
    while(remaining%2===0&&x.parentErrorQuarter<=workingTolerance/4&&y.parentErrorQuarter<=workingTolerance/4){x.double();y.double();remaining/=2;}
    remaining--;x.step();y.step();
  }return false;
}
function large(p:Point[],result:Point[]):boolean {
  const highTolerance=196608n<<28n,lowTolerance=64n<<28n;
  const hx=new WideAxis(p[0][0],p[1][0],p[2][0],p[3][0]),hy=new WideAxis(p[0][1],p[1][1],p[2][1],p[3][1]);let highRemaining=1;
  while(max(hx.error,hy.error)>highTolerance){if(highRemaining>=2**20)return false;hx.half();hy.half();highRemaining*=2;}
  while(result.length<maxPoints){
    const cx=hx.controls(),cy=hy.controls(),x=new WideAxis(cx[0],cx[1],cx[2],cx[3]),y=new WideAxis(cy[0],cy[1],cy[2],cy[3]);let remaining=1;
    while(max(x.error,y.error)>lowTolerance){if(remaining>=2**20)return false;x.half();y.half();remaining*=2;}
    if(--highRemaining!==0){hx.step();hy.step();if(max(hx.error,hy.error)>highTolerance){hx.half();hy.half();highRemaining*=2;}while(highRemaining%2===0&&hx.parentError<=highTolerance&&hy.parentError<=highTolerance){hx.double();hy.double();highRemaining/=2;}}
    while(result.length<maxPoints){x.step();y.step();result.push([x.value/16,y.value/16]);if(--remaining===0)break;if(max(x.error,y.error)>lowTolerance){x.half();y.half();remaining*=2;}while(remaining%2===0&&x.parentError<=lowTolerance&&y.parentError<=lowTolerance){x.double();y.double();remaining/=2;}}
    if(highRemaining===0&&remaining===0)return true;
  }return false;
}
export function flattenNativeBezier(controls:Point[]):Point[]|undefined {
  if(controls.length!==4)return undefined;
  const p=controls.map(([x,y]):Point=>[x*16,y*16]);
  if(p.some(point=>point.some(v=>!Number.isInteger(v)||Math.abs(v)>0x3fffffff)))return undefined;
  const result:Point[]=[controls[0]];
  const isSmall=[0,1].every(axis=>Math.max(...p.map(v=>v[axis]))-Math.min(...p.map(v=>v[axis]))<16384);
  return (isSmall?small(p,result):large(p,result))?result:undefined;
}
