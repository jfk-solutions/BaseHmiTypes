namespace BaseHmiTypes.Images.Converters;

// Native GDI control construction, derived from captured GetPath tables. Keep
// this separate from SVG's ideal ellipse: fixed-point half-vector rounding and
// the reconstructed fourth corner affect subsequent dash phase. Input corners
// must be direction-oriented LT, RT, LB before their device quantization.
internal static class NativeEllipseBuilder
{
    internal static bool TryBuild((double X,double Y)[] corners,out (double X,double Y)[] controls)
    {
        controls=Array.Empty<(double X,double Y)>();
        if(corners.Length!=3)return false;
        var p=new (long X,long Y)[3];
        for(var i=0;i<3;i++)
        {
            var x=corners[i].X*16;var y=corners[i].Y*16;
            if(double.IsNaN(x)||double.IsInfinity(x)||double.IsNaN(y)||double.IsInfinity(y)||x!=Math.Truncate(x)||y!=Math.Truncate(y)||Math.Abs(x)>0x3fffffff||Math.Abs(y)>0x3fffffff)return false;
            p[i]=((long)x,(long)y);
        }
        (long X,long Y) Add((long X,long Y) a,(long X,long Y) b)=>(a.X+b.X,a.Y+b.Y);
        (long X,long Y) Neg((long X,long Y) a)=>(-a.X,-a.Y);
        var lt=p[0];var rt=p[1];var lb=p[2];var rb=Add(rt,Add(lb,Neg(lt)));
        const double inset=1-0.5522847498307936;
        var u=((long)Math.Floor(Math.Ceiling((rt.X-lt.X)/2d)*inset),(long)Math.Floor(Math.Ceiling((rt.Y-lt.Y)/2d)*inset));
        var v=((long)Math.Ceiling(Math.Floor((rb.X-rt.X)/2d)*inset),(long)Math.Ceiling(Math.Floor((rb.Y-rt.Y)/2d)*inset));
        (long X,long Y) Mid((long X,long Y) a,(long X,long Y) b,bool up)=>((long)(up?Math.Ceiling((a.X+b.X)/2d):Math.Floor((a.X+b.X)/2d)),(long)(up?Math.Ceiling((a.Y+b.Y)/2d):Math.Floor((a.Y+b.Y)/2d)));
        var right=Mid(rt,rb,true);var top=Mid(lt,rt,false);var left=Mid(lt,lb,false);var bottom=Mid(lb,rb,true);
        var points=new[]{right,Add(rt,v),Add(rt,Neg(u)),top,Add(lt,u),Add(lt,v),left,Add(lb,Neg(v)),Add(lb,u),bottom,Add(rb,Neg(u)),Add(rb,Neg(v)),right};
        if(points.Any(q=>Math.Abs(q.X)>0x3fffffff||Math.Abs(q.Y)>0x3fffffff))return false;
        controls=points.Select(q=>(q.X/16d,q.Y/16d)).ToArray();return true;
    }
}
