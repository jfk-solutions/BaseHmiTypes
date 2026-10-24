type Point=[number,number];

// Derived from native GDI GetPath tables, not SVG's ideal ellipse. Preserve
// the three quantized corners, reconstructed fourth corner, and half-vector
// rounding: one fixed-point unit changes later cosmetic dash phase.
export function buildNativeEllipse(corners:Point[],clockwise:boolean):Point[]|undefined {
  if(corners.length!==3)return undefined;
  const p=corners.map(([x,y]):Point=>[x*16,y*16]);
  if(p.some(point=>point.some(v=>!Number.isInteger(v)||Math.abs(v)>0x3fffffff)))return undefined;
  const add=(a:Point,b:Point):Point=>[a[0]+b[0],a[1]+b[1]],neg=(a:Point):Point=>[-a[0],-a[1]];
  let [lt,rt,lb]=p,rb=add(rt,add(lb,neg(lt)));
  if(clockwise){[lt,lb]=[lb,lt];[rt,rb]=[rb,rt];}
  const inset=1-.5522847498307936;
  const u:Point=[Math.floor(Math.ceil((rt[0]-lt[0])/2)*inset),Math.floor(Math.ceil((rt[1]-lt[1])/2)*inset)];
  const v:Point=[Math.ceil(Math.floor((rb[0]-rt[0])/2)*inset),Math.ceil(Math.floor((rb[1]-rt[1])/2)*inset)];
  const mid=(a:Point,b:Point,up:boolean):Point=>{const round=up?Math.ceil:Math.floor;return [round((a[0]+b[0])/2),round((a[1]+b[1])/2)];};
  const right=mid(rt,rb,true),top=mid(lt,rt,false),left=mid(lt,lb,false),bottom=mid(lb,rb,true);
  const points=[right,add(rt,v),add(rt,neg(u)),top,add(lt,u),add(lt,v),left,add(lb,neg(v)),add(lb,u),bottom,add(rb,neg(u)),add(rb,neg(v)),right];
  if(points.some(point=>point.some(v=>Math.abs(v)>0x3fffffff)))return undefined;
  return points.map(([x,y]):Point=>[x/16,y/16]);
}
