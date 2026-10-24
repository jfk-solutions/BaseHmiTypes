type Point=[number,number];
// Native GetPath construction: direction-oriented LT, RT, LB are quantized
// before reconstructing RB. Both ratio and product use single precision.
export function buildNativeRoundRect(corners:Point[],ratioX:number,ratioY:number):Point[]|undefined {
  if(corners.length!==3||Number.isNaN(ratioX)||Number.isNaN(ratioY)||ratioX<0||ratioX>1||ratioY<0||ratioY>1)return undefined;
  const p=corners.map(([x,y]):Point=>[x*16,y*16]);
  if(p.some(point=>point.some(v=>!Number.isInteger(v)||Math.abs(v)>0x3fffffff)))return undefined;
  const add=(a:Point,b:Point):Point=>[a[0]+b[0],a[1]+b[1]],neg=(a:Point):Point=>[-a[0],-a[1]];
  const [lt,rt,lb]=p,rb=add(rt,add(lb,neg(lt)));let points:Point[];
  if(ratioX===0||ratioY===0)points=[rt,lt,lb,rb];
  else {
    const scale=(v:number,r:number)=>{const value=Math.fround(Math.fround(v)*Math.fround(r));return Math.sign(value)*Math.floor(Math.abs(value)+.5);};
    const u:Point=[scale(Math.ceil((rt[0]-lt[0])/2),ratioX),scale(Math.ceil((rt[1]-lt[1])/2),ratioX)];
    const v:Point=[scale(Math.floor((rb[0]-rt[0])/2),ratioY),scale(Math.floor((rb[1]-rt[1])/2),ratioY)];
    const inset=1-.5522847498307936,iu:Point=[Math.floor(u[0]*inset),Math.floor(u[1]*inset)],iv:Point=[Math.ceil(v[0]*inset),Math.ceil(v[1]*inset)];
    points=[add(rt,v),add(rt,iv),add(rt,neg(iu)),add(rt,neg(u)),add(lt,u),add(lt,iu),add(lt,iv),add(lt,v),add(lb,neg(v)),add(lb,neg(iv)),add(lb,iu),add(lb,u),add(rb,neg(u)),add(rb,neg(iu)),add(rb,neg(iv)),add(rb,neg(v))];
  }
  if(points.some(point=>point.some(v=>Math.abs(v)>0x3fffffff)))return undefined;
  return points.map(([x,y]):Point=>[x/16,y/16]);
}
