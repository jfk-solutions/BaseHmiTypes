namespace BaseHmiTypes.Images.Converters;

// Native GetPath construction. Corners are direction-oriented LT, RT, LB,
// quantized before reconstructing RB. Corner ratios and their products use
// native single precision; endpoint conversion rounds signed halves away.
internal static class NativeRoundRectBuilder
{
    internal static bool TryBuild((double X,double Y)[] corners,double ratioX,double ratioY,out (double X,double Y)[] controls)
    {
        controls=Array.Empty<(double X,double Y)>();
        if(corners.Length!=3||double.IsNaN(ratioX)||double.IsNaN(ratioY)||ratioX<0||ratioX>1||ratioY<0||ratioY>1)return false;
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
        (long X,long Y)[] points;
        if(ratioX==0||ratioY==0)points=new[]{rt,lt,lb,rb};
        else
        {
            long Scale(double value,double ratio)=>(long)Math.Round((double)(float)((float)value*(float)ratio),MidpointRounding.AwayFromZero);
            var u=(X:Scale(Math.Ceiling((rt.X-lt.X)/2d),ratioX),Y:Scale(Math.Ceiling((rt.Y-lt.Y)/2d),ratioX));
            var v=(X:Scale(Math.Floor((rb.X-rt.X)/2d),ratioY),Y:Scale(Math.Floor((rb.Y-rt.Y)/2d),ratioY));
            const double inset=1-0.5522847498307936;
            var iu=((long)Math.Floor(u.X*inset),(long)Math.Floor(u.Y*inset));
            var iv=((long)Math.Ceiling(v.X*inset),(long)Math.Ceiling(v.Y*inset));
            points=new[]{Add(rt,v),Add(rt,iv),Add(rt,Neg(iu)),Add(rt,Neg(u)),Add(lt,u),Add(lt,iu),Add(lt,iv),Add(lt,v),Add(lb,Neg(v)),Add(lb,Neg(iv)),Add(lb,iu),Add(lb,u),Add(rb,Neg(u)),Add(rb,Neg(iu)),Add(rb,Neg(iv)),Add(rb,Neg(v))};
        }
        if(points.Any(q=>Math.Abs(q.X)>0x3fffffff||Math.Abs(q.Y)>0x3fffffff))return false;
        controls=points.Select(q=>(q.X/16d,q.Y/16d)).ToArray();return true;
    }
}
