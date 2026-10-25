using System.Numerics;
using System.Text;

namespace BaseHmiTypes.Images.Converters;

// GDI's top/left inclusive polygon fill samples integer device locations.
internal static class NativeQuadRasterizer
{
    internal static bool TryFill((double X,double Y)[] points,out string pixels)
    {
        pixels=string.Empty;if(points.Length!=4)return false;
        var p=new (long X,long Y)[4];
        for(var i=0;i<4;i++)
        {
            var x=points[i].X*16;var y=points[i].Y*16;
            if(double.IsNaN(x)||double.IsInfinity(x)||double.IsNaN(y)||double.IsInfinity(y)||x!=Math.Truncate(x)||y!=Math.Truncate(y)||Math.Abs(x)>0x4000000||Math.Abs(y)>0x4000000)return false;
            p[i]=((long)x,(long)y);
        }
        var top=(long)Math.Ceiling(p.Min(q=>q.Y)/16d);var bottom=(long)Math.Ceiling(p.Max(q=>q.Y)/16d);
        var left=(long)Math.Ceiling(p.Min(q=>q.X)/16d);var right=(long)Math.Ceiling(p.Max(q=>q.X)/16d);
        if((double)(bottom-top)*(right-left)>262144)return false;
        var builder=new StringBuilder();
        for(var y=top;y<bottom;y++)
        {
            var crossings=new List<long>();
            for(var i=0;i<4;i++)
            {
                var a=p[i];var b=p[(i+1)%4];if(a.Y>b.Y){var swap=a;a=b;b=swap;}
                if(y*16<a.Y||y*16>=b.Y)continue;
                var dy=b.Y-a.Y;var numerator=(BigInteger)a.X*dy+(BigInteger)(y*16-a.Y)*(b.X-a.X);var denominator=(BigInteger)16*dy;
                var x=BigInteger.DivRem(numerator,denominator,out var remainder);if(remainder>0)x++;
                crossings.Add((long)x);
            }
            if(crossings.Count==0)continue;if(crossings.Count!=2)return false;
            var first=Math.Min(crossings[0],crossings[1]);var last=Math.Max(crossings[0],crossings[1]);
            for(var x=first;x<last;x++)builder.Append($"M {x} {y}h1v1h-1Z ");
        }
        pixels=builder.ToString().TrimEnd();return true;
    }
}
