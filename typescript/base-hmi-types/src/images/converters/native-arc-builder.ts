import {buildNativeEllipse} from './native-ellipse-builder.js';
type Point=[number,number];
const f=Math.fround;
function interpolate(position:number,fn:(index:number)=>number):number {
  const index=Math.floor(position),fraction=f(position-index),a=f(fn(index)),b=f(fn(index+1));
  return f(a+f(fraction*f(b-a)));
}
const sin=(degrees:number)=>interpolate(f(degrees*f(64/180)),i=>Math.sin(i*Math.PI/64));
const cos=(degrees:number)=>interpolate(f(degrees*f(64/180)),i=>Math.cos(i*Math.PI/64));
export function atan2(y:number,x:number):number {
  const ax=Math.abs(x),ay=Math.abs(y);
  let angle=ax===0&&ay===0?0:interpolate(f(f(Math.min(ax,ay)/Math.max(ax,ay))*32),i=>Math.atan(i/32));
  if(ay>ax&&y>=0)angle=f(f(Math.PI/2)-angle);
  angle=f(angle*f(180/Math.PI));
  if(ay>ax&&y<0)angle=f(90-angle);
  if(x<0)angle=f(180-angle);if(y<0)angle=-angle;
  return angle;
}
// Native arcs blend endpoints towards their tangent intersection. Complete
// interior quadrants use fixed ellipse controls, not analytic SVG cubics.
export function buildNativeArc(left:number,top:number,right:number,bottom:number,sx:number,sy:number,ex:number,ey:number,clockwise:boolean,device:(x:number,y:number)=>Point):Point[]|undefined {
  if(![left,top,right,bottom,sx,sy,ex,ey].every(Number.isFinite))return undefined;
  const rx=(right-left)/2,ry=(bottom-top)/2,cx=(left+right)/2,cy=(top+bottom)/2;
  if(rx<=0||ry<=0)return undefined;
  const corner=(x:number,y:number)=>device(cx+rx*x,cy+(clockwise?ry:-ry)*y);
  const corners=[corner(-1,1),corner(1,1),corner(-1,-1)],ellipse=buildNativeEllipse(corners);
  if(!ellipse)return undefined;
  const [lt,rt,lb]=corners,centerX=(rt[0]+lb[0])*8,centerY=(rt[1]+lb[1])*8;
  const ux=f((rt[0]-lt[0])*8),uy=f((rt[1]-lt[1])*8),vx=f((lt[0]-lb[0])*8),vy=f((lt[1]-lb[1])*8);
  const round=(value:number)=>{const result=Math.sign(value)*Math.floor(Math.abs(value)+.5)/16;return result===0?0:result;};
  const map=(x:number,y:number,control=false):Point=>{
    const dx=f(f(x*ux)+f(y*vx)),dy=f(f(x*uy)+f(y*vy));
    // Endpoints translate in binary32; controls retain the fixed translation.
    return [round(control?centerX+dx:f(f(centerX)+dx)),round(control?centerY+dy:f(f(centerY)+dy))];
  };
  const position=(x:number,y:number):{angle:number;quadrant:number}|undefined=>{
    const px=f(x-cx),py=f(f(clockwise?y-cy:cy-y)*f(f(rx)/f(ry)));
    if(!Number.isFinite(px)||!Number.isFinite(py))return undefined;
    let angle=atan2(py,px);if(angle<0)angle=f(angle+360);
    let quadrant=Math.floor(angle/90);
    if(px===0&&py>0)quadrant=0;if(px<0&&py===0)quadrant=1;
    return {angle,quadrant};
  };
  const a=position(sx,sy),b=position(ex,ey);if(!a||!b)return undefined;
  const final={...b};if(b.angle<=a.angle){b.angle=f(b.angle+360);b.quadrant+=4;}
  const result:Point[]=[];
  const piece=(from:number,to:number)=>{
    const a:Point=[cos(from),sin(from)],b:Point=[cos(to),sin(to)];
    if(!result.length)result.push(map(...a));
    const determinant=f(f(a[0]*b[1])-f(a[1]*b[0]));
    if(from===to||determinant===0){result.push(map(...a),map(...b),map(...b));return;}
    const tangent:Point=[f(f(b[1]-a[1])/determinant),f(f(a[0]-b[0])/determinant)];
    const halfCosine=sin(f(90+f(f(to-from)*.5))),blend=f(f(f(4/3)*halfCosine)/f(1+halfCosine)),endpoint=f(1-blend);
    result.push(map(f(f(endpoint*a[0])+f(blend*tangent[0])),f(f(endpoint*a[1])+f(blend*tangent[1])),true));
    result.push(map(f(f(endpoint*b[0])+f(blend*tangent[0])),f(f(endpoint*b[1])+f(blend*tangent[1])),true));
    result.push(map(...b));
  };
  if(a.quadrant===b.quadrant)piece(a.angle,b.angle);
  else{
    piece(a.angle,(a.quadrant+1)*90);
    for(let q=a.quadrant+1;q<b.quadrant;q++)for(let i=1;i<=3;i++)result.push(ellipse[q%4*3+i]);
    piece(final.quadrant*90,final.angle);
  }
  if(result.some(p=>p.some(v=>!Number.isFinite(v)||Math.abs(v*16)>0x3fffffff)))return undefined;
  return result;
}
