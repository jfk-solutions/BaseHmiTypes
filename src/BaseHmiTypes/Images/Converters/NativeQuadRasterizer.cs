using System.Numerics;
using System.Text;

namespace BaseHmiTypes.Images.Converters;

// GDI's top/left inclusive polygon fill samples integer device locations.
internal static class NativeQuadRasterizer
{
    internal static bool TryFill((double X,double Y)[] points,out string pixels,bool winding=false)
    {
        pixels=string.Empty;if(points.Length<3||points.Length>65536)return false;
        var p=new (long X,long Y)[points.Length];
        for(var i=0;i<p.Length;i++)
        {
            var x=points[i].X*16;var y=points[i].Y*16;
            if(double.IsNaN(x)||double.IsInfinity(x)||double.IsNaN(y)||double.IsInfinity(y)||x!=Math.Truncate(x)||y!=Math.Truncate(y)||Math.Abs(x)>0x4000000||Math.Abs(y)>0x4000000)return false;
            p[i]=((long)x,(long)y);
        }
        var top=(long)Math.Ceiling(p.Min(q=>q.Y)/16d);var bottom=(long)Math.Ceiling(p.Max(q=>q.Y)/16d);
        var left=(long)Math.Ceiling(p.Min(q=>q.X)/16d);var right=(long)Math.Ceiling(p.Max(q=>q.X)/16d);
        if((double)(bottom-top)*(right-left)>262144||(double)(bottom-top)*p.Length>1048576)return false;
        var builder=new StringBuilder();
        for(var y=top;y<bottom;y++)
        {
            var crossings=new List<(long X,int Direction)>();
            for(var i=0;i<p.Length;i++)
            {
                var a=p[i];var b=p[(i+1)%p.Length];var direction=a.Y<b.Y?1:-1;if(a.Y>b.Y){var swap=a;a=b;b=swap;}
                if(y*16<a.Y||y*16>=b.Y)continue;
                var dy=b.Y-a.Y;var numerator=(BigInteger)a.X*dy+(BigInteger)(y*16-a.Y)*(b.X-a.X);var denominator=(BigInteger)16*dy;
                var x=BigInteger.DivRem(numerator,denominator,out var remainder);if(remainder>0)x++;
                crossings.Add(((long)x,direction));
            }
            if(crossings.Count==0)continue;if(crossings.Count%2!=0)return false;
            crossings.Sort((a,b)=>a.X.CompareTo(b.X));var inside=0;long first=0;
            for(var i=0;i<crossings.Count;)
            {
                var x=crossings[i].X;var before=winding?inside!=0:inside%2!=0;
                do{inside+=winding?crossings[i].Direction:1;i++;}while(i<crossings.Count&&crossings[i].X==x);
                var after=winding?inside!=0:inside%2!=0;
                if(!before&&after)first=x;
                else if(before&&!after)for(var column=first;column<x;column++)builder.Append($"M {column} {y}h1v1h-1Z ");
            }
        }
        pixels=builder.ToString().TrimEnd();return true;
    }
}
