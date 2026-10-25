// Adapted and modified from emf-converter/gdi-raster-widen.ts, commit
// effcf337218fefc08e4ac8f74e59cd2af1a9235c (Apache-2.0).
// Copyright 2025-present pptx-viewer contributors.
// Changes: C# port, existing native ellipse/flattener integration, exact integer
// rounding and bounded flat/square-cap straight outlines. See THIRD-PARTY-NOTICES.
using System.Numerics;

namespace BaseHmiTypes.Images.Converters;

internal static class NativeFlatPenBuilder
{
    private static readonly int[][] Hobby = {
        new[]{0,-8,-8,0,0,8,8,0},
        new[]{8,-16,-8,-16,-16,0,-8,16,8,16,16,0},
        new[]{8,-24,-8,-24,-24,-8,-24,8,-8,24,8,24,24,8,24,-8},
        new[]{8,-32,-8,-32,-24,-24,-32,-8,-32,8,-24,24,-8,32,8,32,24,24,32,8,32,-8,24,-24},
        new[]{8,-40,-8,-40,-24,-32,-32,-24,-40,-8,-40,8,-32,24,-24,32,-8,40,8,40,24,32,32,24,40,8,40,-8,32,-24,24,-32},
        new[]{8,-48,-8,-48,-24,-40,-40,-24,-48,-8,-48,8,-40,24,-24,40,-8,48,8,48,24,40,40,24,48,8,48,-8,40,-24,24,-40}
    };

    internal static bool TryBuild((double X,double Y) start,(double X,double Y) end,double width,out (double X,double Y)[] outline,bool square=false)
    {
        outline=Array.Empty<(double X,double Y)>();
        bool Valid(double v)=>!double.IsNaN(v)&&!double.IsInfinity(v)&&v*16==Math.Truncate(v*16)&&Math.Abs(v*16)<=0x2000000;
        if(!Valid(start.X)||!Valid(start.Y)||!Valid(end.X)||!Valid(end.Y)||!Valid(width)||width<=0||width>4096)return false;
        var dx=(long)((end.X-start.X)*16);var dy=(long)((end.Y-start.Y)*16);if(dx==0&&dy==0)return false;
        var originalDx=dx;var originalDy=dy;
        var pen=new List<(long X,long Y)>();var fixedWidth=(long)(width*16);
        if(fixedWidth<104)
        {
            var table=Hobby[Math.Min(5,Math.Max(0,(int)Math.Floor(width+.5)-1))];
            for(var i=0;i<table.Length;i+=2)pen.Add((table[i],table[i+1]));
        }
        else
        {
            var radius=Math.Ceiling(fixedWidth/2d)/16;
            if(!NativeEllipseBuilder.TryBuild(new[]{(-radius,-radius),(radius,-radius),(-radius,radius)},out var controls))return false;
            pen.Add(((long)(controls[0].X*16),(long)(controls[0].Y*16)));
            for(var i=1;i<=4;i+=3)
            {
                if(!NativeBezierFlattener.TryFlatten(new[]{controls[i-1],controls[i],controls[i+1],controls[i+2]},out var flattened))return false;
                foreach(var p in flattened.Skip(1))pen.Add(((long)(p.X*16),(long)(p.Y*16)));
            }
            pen.RemoveAt(pen.Count-1);var half=pen.ToArray();foreach(var p in half)pen.Add((-p.X,-p.Y));
        }
        var flip=dx<0||dx==0&&dy<0;if(flip){dx=-dx;dy=-dy;}
        long H((long X,long Y) p)=>-dy*p.X+dx*p.Y;
        var best=0;for(var i=1;i<pen.Count;i++)if(H(pen[i])>H(pen[best]))best=i;
        var n=pen.Count;var bh=H(pen[best]);if(flip&&best==0&&H(pen[n-1])==bh)best=n-1;
        var previous=pen[(best+n-1)%n];var next=pen[(best+1)%n];var d=pen[best];
        var hp=H(previous);var hn=H(next);var b=hp>=hn?previous:next;
        var hb=Math.Max(hp,hn);var hs=Math.Min(hp,hn);var den=2*(bh-hb+bh-hs);var num=hb-hs;
        var firstEdge=best==0&&hp>=hn;
        long Round(long dc,long bc,int channel)
        {
            var sign=channel==0?(dx==0?0:Math.Sign(dy)):Math.Sign(dx);
            var odd=Math.Abs(bc-dc)%2!=0;var bias2=sign+(odd?(firstEdge?1:-1):0);
            if(den==0)return (long)(8*(channel==1&&dy<0?Math.Ceiling((dc+bias2/2d+4)/8)-1:Math.Floor((dc+bias2/2d+4)/8)));
            var top=(BigInteger)dc*den+(BigInteger)(bc-dc)*num;
            var dividend=2*top+(BigInteger)den*(bias2+8)-(channel==1&&dy<0?1:0);var divisor=(BigInteger)16*den;
            var quotient=BigInteger.DivRem(dividend,divisor,out var remainder);if(remainder<0)quotient--;return (long)quotient*8;
        }
        var vx=Round(d.X,b.X,0)/16d;var vy=Round(d.Y,b.Y,1)/16d;if(flip){vx=-vx;vy=-vy;}
        double ex=0,ey=0;
        if(square)
        {
            // With an identity widening map GDI normalizes the whole-pixel
            // (floor, including negative components) vector, but extends along
            // the original FIX vector. Exact half-FIX ties go away from zero.
            var wholeX=Math.Floor(originalDx/16d)*16;var wholeY=Math.Floor(originalDy/16d)*16;
            var length=Math.Sqrt(wholeX*wholeX+wholeY*wholeY);
            if(length>0)
            {
                var ratio=fixedWidth/2d/length;
                double Extension(long delta){var value=delta*ratio;return Math.Sign(value)*Math.Floor(Math.Abs(value)+.5)/16;}
                ex=Extension(originalDx);ey=Extension(originalDy);
            }
        }
        outline=new[]{(start.X-vx-ex,start.Y-vy-ey),(start.X+vx-ex,start.Y+vy-ey),(end.X+vx+ex,end.Y+vy+ey),(end.X-vx+ex,end.Y-vy+ey)};return true;
    }
}
