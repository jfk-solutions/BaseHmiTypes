import {buildNativeEllipse} from './native-ellipse-builder.js';
import {atan2} from './native-arc-builder.js';
type Point=[number,number];
const f=Math.fround;
function normalUnit(degrees:number):Point {
  const position=f(Math.abs(degrees)*f(64/180));
  if(!Number.isFinite(position)||position>=0x7fffffff)return [NaN,NaN];
  const index=Math.floor(position),fraction=f(position-index),quadrant=Math.floor(index/32),knot=index&31;
  const interpolate=(q:number)=>{
    let value:number;
    if((q&1)===0){const a=f(Math.sin(knot*Math.PI/64)),b=f(Math.sin((knot+1)*Math.PI/64));value=f(a+f(fraction*f(b-a)));}
    else{const a=f(Math.sin((32-knot)*Math.PI/64)),b=f(Math.sin((31-knot)*Math.PI/64));value=f(a-f(fraction*f(a-b)));}
    return (q&2)!==0?-value:value;
  };
  return [interpolate(quadrant+1),(degrees<0?-1:1)*interpolate(quadrant)];
}
function smallUnit(degrees:number):Point {
  const negative=degrees<0;degrees=Math.abs(degrees);
  const ratio=f(degrees/360);degrees=f(f(ratio-Math.trunc(ratio))*360);
  const lower=degrees>180;if(lower)degrees=f(360-degrees);
  const left=degrees>90;if(left)degrees=f(180-degrees);
  const radians=f(f(degrees*f(3.1415925))/180);
  let power=radians,sine=radians,cosine=1,factorial=2,factor=2;
  for(let order=2;order<=12;order++){
    power=f(power*radians);let term=f(power/factorial);if((order&2)!==0)term=-term;
    if((order&1)!==0)sine=f(sine+term);else cosine=f(cosine+term);
    factor=f(factor+1);factorial=f(factorial*factor);
  }
  if(negative!==lower)sine=-sine;if(left)cosine=-cosine;
  return [cosine,sine];
}
export function buildNativeAngleArc(cx:number,cy:number,radius:number,start:number,sweep:number,device:(x:number,y:number)=>Point):Point[]|undefined {
  start=f(start);sweep=f(sweep);
  if(![cx,cy,start,sweep].every(Number.isFinite)||!Number.isInteger(radius)||radius<0||radius>0xffffffff||Math.abs(sweep)>4096*90)return undefined;
  const clockwise=sweep<0,original=clockwise?-start:start,extent=Math.abs(sweep),effective=f(f(original+extent)-original),small=effective>0&&effective<3;
  const corner=(x:number,y:number)=>device(cx+radius*x,cy+(clockwise?radius:-radius)*y),corners=[corner(-1,1),corner(1,1),corner(-1,-1)],ellipse=buildNativeEllipse(corners);
  if(!ellipse)return undefined;
  const [lt,rt,lb]=corners,centerX=(rt[0]+lb[0])*8,centerY=(rt[1]+lb[1])*8,ux=f((rt[0]-lt[0])*8),uy=f((rt[1]-lt[1])*8),vx=f((lt[0]-lb[0])*8),vy=f((lt[1]-lb[1])*8);
  const round=(value:number)=>{const r=Math.sign(value)*Math.floor(Math.abs(value)+.5)/16;return r===0?0:r;};
  const map=(x:number,y:number,control=false):Point=>{
    const dx=f(f(x*ux)+f(y*vx)),dy=f(f(x*uy)+f(y*vy));
    return [round(control?centerX+dx:f(f(centerX)+dx)),round(control?centerY+dy:f(f(centerY)+dy))];
  };
  const result:Point[]=[];
  const piece=(from:number,to:number,a:Point,b:Point)=>{
    if(!result.length)result.push(map(...a));
    const determinant=Math.abs(f(f(a[0]*b[1])-f(a[1]*b[0])));
    if(determinant<=1/65536){result.push(map(a[0],a[1],true),map(b[0],b[1],true),map(...b));return;}
    const tangent:Point=[f(f(b[1]-a[1])/determinant),f(f(a[0]-b[0])/determinant)];
    const halfCosine=Math.abs(normalUnit(f(90+f(f(to-from)*.5)))[1]),blend=f(f(f(4/3)*halfCosine)/f(1+halfCosine)),endpoint=f(1-blend);
    result.push(map(f(f(endpoint*a[0])+f(blend*tangent[0])),f(f(endpoint*a[1])+f(blend*tangent[1])),true));
    result.push(map(f(f(endpoint*b[0])+f(blend*tangent[0])),f(f(endpoint*b[1])+f(blend*tangent[1])),true),map(...b));
  };
  const axis=(q:number):Point=>q===0?[1,0]:q===1?[0,1]:q===2?[-1,0]:[0,-1];
  const quadrant=(p:Point)=>p[1]<0?(p[0]<0?2:3):p[0]<0?(p[1]===0?2:1):p[0]===0&&p[1]>0?1:0;
  const normalize=(raw:number,unit:Point)=>{if(raw>=-3600&&raw<=3600)return raw;let angle=atan2(unit[1],unit[0]);if(angle<0)angle=f(angle+360);return angle;};
  const segment=(from:number,to:number,a:Point,b:Point,first:number,last:number,span:number)=>{
    if(span===0){piece(from,to,a,b);return;}
    let q=(first+1)&3;piece(from,q*90,a,axis(q));
    for(let count=0;q!==last&&count<4;count++,q=(q+1)&3)for(let i=1;i<=3;i++)result.push(ellipse[q*3+i]);
    piece(last*90,to,axis(last),b);
  };
  const rawEnd=f(original+extent),unitStart=small?smallUnit(original):normalUnit(original),unitEnd=small?smallUnit(rawEnd):normalUnit(rawEnd),from=normalize(original,unitStart),to=normalize(rawEnd,unitEnd),first=quadrant(unitStart),last=quadrant(unitEnd),quarters=Math.trunc(f(extent*f(1/90)));
  let span=quarters&3;if(rawEnd<-3600||rawEnd>3600){span=(last-first)&3;if(span===0&&from>to)span=3;}
  for(let turns=Math.min(Math.trunc(quarters/4),8);turns>0;turns--){segment(from,to,unitStart,unitEnd,first,last,span);segment(to,from,unitEnd,unitStart,last,first,3-span);}
  segment(from,to,unitStart,unitEnd,first,last,span);
  if(result.some(p=>p.some(v=>!Number.isFinite(v)||Math.abs(v*16)>0x3fffffff)))return undefined;
  return result;
}
