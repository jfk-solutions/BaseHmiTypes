type Point=[number,number];
// GDI's top/left inclusive polygon fill samples integer device locations.
export function fillNativeQuad(points:Point[],winding=false):string|undefined {
  if(points.length<3||points.length>65536)return undefined;
  const p=points.map(([x,y]):Point=>[x*16,y*16]);if(p.some(q=>q.some(v=>!Number.isFinite(v)||!Number.isInteger(v)||Math.abs(v)>0x4000000)))return undefined;
  const top=Math.ceil(Math.min(...p.map(q=>q[1]))/16),bottom=Math.ceil(Math.max(...p.map(q=>q[1]))/16),left=Math.ceil(Math.min(...p.map(q=>q[0]))/16),right=Math.ceil(Math.max(...p.map(q=>q[0]))/16);
  if((bottom-top)*(right-left)>262144||(bottom-top)*p.length>1048576)return undefined;
  const pixels:string[]=[];
  for(let y=top;y<bottom;y++){
    const crossings:Point[]=[];
    for(let i=0;i<p.length;i++){
      let a=p[i],b=p[(i+1)%p.length];const direction=a[1]<b[1]?1:-1;if(a[1]>b[1])[a,b]=[b,a];if(y*16<a[1]||y*16>=b[1])continue;
      const dy=b[1]-a[1],numerator=BigInt(a[0])*BigInt(dy)+BigInt(y*16-a[1])*BigInt(b[0]-a[0]),denominator=16n*BigInt(dy);
      let x=numerator/denominator;if(numerator%denominator>0n)x++;crossings.push([Number(x),direction]);
    }
    if(!crossings.length)continue;if(crossings.length%2!==0)return undefined;
    crossings.sort((a,b)=>a[0]-b[0]);let inside=0,first=0;
    for(let i=0;i<crossings.length;){
      const x=crossings[i][0],before=winding?inside!==0:inside%2!==0;
      do{inside+=winding?crossings[i][1]:1;i++;}while(i<crossings.length&&crossings[i][0]===x);
      const after=winding?inside!==0:inside%2!==0;
      if(!before&&after)first=x;else if(before&&!after)for(let column=first;column<x;column++)pixels.push(`M ${column} ${y}h1v1h-1Z`);
    }
  }
  return pixels.join(' ');
}
