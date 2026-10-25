type Point=[number,number];
// GDI's top/left inclusive polygon fill samples integer device locations.
export function fillNativeQuad(points:Point[]):string|undefined {
  if(points.length!==4)return undefined;
  const p=points.map(([x,y]):Point=>[x*16,y*16]);if(p.some(q=>q.some(v=>!Number.isFinite(v)||!Number.isInteger(v)||Math.abs(v)>0x4000000)))return undefined;
  const top=Math.ceil(Math.min(...p.map(q=>q[1]))/16),bottom=Math.ceil(Math.max(...p.map(q=>q[1]))/16),left=Math.ceil(Math.min(...p.map(q=>q[0]))/16),right=Math.ceil(Math.max(...p.map(q=>q[0]))/16);
  if((bottom-top)*(right-left)>262144)return undefined;
  const pixels:string[]=[];
  for(let y=top;y<bottom;y++){
    const crossings:number[]=[];
    for(let i=0;i<4;i++){
      let a=p[i],b=p[(i+1)%4];if(a[1]>b[1])[a,b]=[b,a];if(y*16<a[1]||y*16>=b[1])continue;
      const dy=b[1]-a[1],numerator=BigInt(a[0])*BigInt(dy)+BigInt(y*16-a[1])*BigInt(b[0]-a[0]),denominator=16n*BigInt(dy);
      let x=numerator/denominator;if(numerator%denominator>0n)x++;crossings.push(Number(x));
    }
    if(!crossings.length)continue;if(crossings.length!==2)return undefined;
    const first=Math.min(...crossings),last=Math.max(...crossings);for(let x=first;x<last;x++)pixels.push(`M ${x} ${y}h1v1h-1Z`);
  }
  return pixels.join(' ');
}
