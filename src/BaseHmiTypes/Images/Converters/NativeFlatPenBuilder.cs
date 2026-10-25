// Adapted and modified from emf-converter/gdi-raster-widen.ts, commit
// effcf337218fefc08e4ac8f74e59cd2af1a9235c (Apache-2.0).
// Copyright 2025-present pptx-viewer contributors.
// Changes: C# port, existing native ellipse/flattener integration, exact integer
// rounding, straight outlines for all caps, round-joined open/closed figures,
// and native endpoint-tangent directions for curved widening.
// See THIRD-PARTY-NOTICES.
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

    internal static bool TryBuild((double X,double Y) start,(double X,double Y) end,double width,out (double X,double Y)[] outline,bool square=false,bool round=false,bool roundJoin=false)
    {
        outline=Array.Empty<(double X,double Y)>();
        bool Valid(double v)=>!double.IsNaN(v)&&!double.IsInfinity(v)&&v*16==Math.Truncate(v*16)&&Math.Abs(v*16)<=0x2000000;
        if(square&&round||!Valid(start.X)||!Valid(start.Y)||!Valid(end.X)||!Valid(end.Y)||!Valid(width)||width<=0||width>4096)return false;
        var dx=(long)((end.X-start.X)*16);var dy=(long)((end.Y-start.Y)*16);if(dx==0&&dy==0)return false;
        var originalDx=dx;var originalDy=dy;
        if(!TryGetPen(width,out var pen))return false;var fixedWidth=(long)(width*16);
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
        if(round)
        {
            // Select cap vertices against the unrounded tangent point. Exact
            // rational rays avoid atan2 and cross-product cancellation at ties.
            BigInteger rx=den==0?d.X:(BigInteger)d.X*den+(BigInteger)(b.X-d.X)*num;
            BigInteger ry=den==0?d.Y:(BigInteger)d.Y*den+(BigInteger)(b.Y-d.Y)*num;
            if(flip){rx=-rx;ry=-ry;}
            var left=0;var right=0;
            if(roundJoin)
            {
                var axis=pen.Any(q=>q.Y==0);var boundary=(n==4?1:2)*Math.Abs(originalDx);
                var steep=Math.Abs(originalDy)>boundary||Math.Abs(originalDy)==boundary&&axis;
                var sign=(steep?originalDy<0:originalDx<0||originalDx==0&&originalDy<0)?-1:1;
                long Height((long X,long Y) q)=>originalDy*q.X-originalDx*q.Y;
                long Along((long X,long Y) q)=>sign*(originalDx*q.X+originalDy*q.Y);
                for(var i=1;i<n;i++)if(Height(pen[i])>Height(pen[left])||Height(pen[i])==Height(pen[left])&&Along(pen[i])>Along(pen[left]))left=i;
                right=(left+n/2)%n;
                double Half(long value)=>Math.Sign(value)*8*Math.Floor((Math.Abs(value)+4)/8d)/16;
                vx=Half(pen[right].X);vy=Half(pen[right].Y);
            }
            var result=new List<(double X,double Y)>();
            void Cap((double X,double Y) anchor,bool first)
            {
                var ax=first?-rx:rx;var ay=first?-ry:ry;
                result.Add(first?(anchor.X-vx,anchor.Y-vy):(anchor.X+vx,anchor.Y+vy));
                var selected=pen.Select(q=>{var cross=ax*q.Y-ay*q.X;return cross<0||cross==0&&ax*q.X+ay*q.Y>0;}).ToArray();
                var begin=0;for(var i=0;i<n;i++)if(selected[i]&&!selected[(i+n-1)%n]){begin=i;break;}
                var finish=-1;
                if(roundJoin){begin=((first?left:right)+1)%n;finish=first?right:left;}
                var integral=anchor.X==Math.Truncate(anchor.X)&&anchor.Y==Math.Truncate(anchor.Y);
                for(var i=0;i<n&&(roundJoin?(begin+i)%n!=finish:selected[(begin+i)%n]);i++)
                {
                    var q=pen[(begin+i)%n];result.Add((anchor.X+(q.X-(integral?Math.Sign(q.X):0))/16d,anchor.Y+(q.Y-(integral?Math.Sign(q.Y):0))/16d));
                }
                result.Add(first?(anchor.X+vx,anchor.Y+vy):(anchor.X-vx,anchor.Y-vy));
            }
            Cap(start,true);Cap(end,false);outline=result.ToArray();return true;
        }
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

    private static bool TryGetPen(double width,out List<(long X,long Y)> pen)
    {
        pen=new List<(long X,long Y)>();var fixedWidth=(long)(width*16);
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
        return true;
    }

    internal static bool TryBuildRoundPolyline((double X,double Y)[] input,double width,out (double X,double Y)[] outline)
    {
        outline=Array.Empty<(double X,double Y)>();
        if(!TryBuildRoundFigures(input,width,false,out var figures))return false;
        outline=figures[0];return true;
    }

    internal static bool TryBuildRoundFigures((double X,double Y)[] input,double width,bool closed,out (double X,double Y)[][] outlines,IReadOnlyDictionary<int,(double X,double Y)>? tangents=null)
    {
        outlines=Array.Empty<(double X,double Y)[]>();
        bool Valid(double v)=>!double.IsNaN(v)&&!double.IsInfinity(v)&&v*16==Math.Truncate(v*16)&&Math.Abs(v*16)<=0x2000000;
        if(input.Length<2||input.Length>65536||!Valid(width)||width<=0||width>4096||input.Any(p=>!Valid(p.X)||!Valid(p.Y))||!TryGetPen(width,out var pen))return false;
        if(tangents is not null&&tangents.Any(t=>t.Key<0||t.Key>=input.Length-1||!Valid(t.Value.X)||!Valid(t.Value.Y)||t.Value==(0d,0d)))return false;
        var points=new List<(double X,double Y)>();var directions=new List<(double X,double Y)>();
        for(var i=0;i<input.Length;i++)if(points.Count==0||points[points.Count-1]!=input[i])
        {
            if(points.Count>0)directions.Add(tangents is not null&&tangents.TryGetValue(i-1,out var tangent)?tangent:(input[i].X-input[i-1].X,input[i].Y-input[i-1].Y));
            points.Add(input[i]);
        }
        if(closed&&points.Count>1&&points[points.Count-1]==points[0])points.RemoveAt(points.Count-1);
        else if(closed&&points.Count>1)directions.Add((points[0].X-points[points.Count-1].X,points[0].Y-points[points.Count-1].Y));
        if(points.Count<2)return false;
        var n=pen.Count;if(2L*points.Count*(n+3)>65536)return false;
        var segs=new (long X,long Y,int L,int R)[closed?points.Count:points.Count-1];
        for(var j=0;j<segs.Length;j++)
        {
            var dx=(long)(directions[j].X*16);var dy=(long)(directions[j].Y*16);
            var axis=pen.Any(q=>q.Y==0);var boundary=(n==4?1:2)*Math.Abs(dx);
            var steep=Math.Abs(dy)>boundary||Math.Abs(dy)==boundary&&axis;
            var sign=(steep?dy<0:dx<0||dx==0&&dy<0)?-1:1;
            long Height((long X,long Y) q)=>dy*q.X-dx*q.Y;
            long Along((long X,long Y) q)=>sign*(dx*q.X+dy*q.Y);
            var left=0;for(var k=1;k<n;k++)if(Height(pen[k])>Height(pen[left])||Height(pen[k])==Height(pen[left])&&Along(pen[k])>Along(pen[left]))left=k;
            segs[j]=(dx,dy,left,(left+n/2)%n);
        }
        var result=new List<(double X,double Y)>();var maxX=pen.Max(q=>Math.Abs(q.X));
        double Half(long v)=>Math.Sign(v)*8*Math.Floor((Math.Abs(v)+4)/8d)/16;
        void Side(int p,int k)=>result.Add((points[p].X+Half(pen[k].X),points[p].Y+Half(pen[k].Y)));
        void Vertex(int p,int k)
        {
            var a=points[p];var q=pen[k];var whole=a.X==Math.Truncate(a.X)&&a.Y==Math.Truncate(a.Y);
            result.Add((a.X+(q.X-(whole?Math.Sign(q.X):0))/16d,a.Y+(q.Y-(whole?Math.Sign(q.Y):0))/16d));
        }
        void Walk(int p,int a,int b,bool includeEnd)
        {
            for(var k=(a+1)%n;k!=b;k=(k+1)%n)Vertex(p,k);
            if(includeEnd)Vertex(p,b);
        }
        long Turn(int a,int b)
        {
            var s=segs[a];var t=segs[b];var cross=s.X*t.Y-s.Y*t.X;if(cross!=0)return cross;
            if(s.X*t.X+s.Y*t.Y>=0)return 0;
            // Native's exact-reversal tie is not an ordinary signed turn:
            // non-axis reversals put the inner triangle on the right side.
            return s.Y==0?Math.Sign(s.X):s.X==0?-Math.Sign(s.Y):1;
        }
        void Join(int p,int a,int b,bool left,bool outer)
        {
            var first=left?segs[a].L:segs[a].R;var last=left?segs[b].L:segs[b].R;Side(p,first);if(first==last)return;
            if(outer)
            {
                var q=pen[last];var include=left&&Math.Abs(segs[b].Y)>=Math.Abs(segs[b].X)&&Math.Abs(q.X)==maxX&&q.X*q.Y<=0;
                Walk(p,first,last,include);
            }
            else result.Add(points[p]);
            Side(p,last);
        }
        if(closed)
        {
            var count=points.Count;
            for(var j=1;j<=count;j++)
            {
                var i=j%count;var previous=(i+count-1)%count;var tr=Turn(previous,i);
                if(tr==0)Side(i,segs[previous].R);else Join(i,previous,i,false,tr<0);
            }
            var right=result.ToArray();result.Clear();
            for(var j=0;j<count;j++)
            {
                var i=(count-j)%count;var previous=(i+count-1)%count;var tr=Turn(previous,i);
                if(tr==0)Side(i,segs[i].L);else Join(i,i,previous,true,tr>0);
            }
            if(right.Length+result.Count>65536)return false;
            outlines=new[]{right,result.ToArray()};return true;
        }
        Side(0,segs[0].L);Walk(0,segs[0].L,segs[0].R,false);Side(0,segs[0].R);
        for(var i=0;i+1<segs.Length;i++){var tr=Turn(i,i+1);if(tr==0)Side(i+1,segs[i].R);else Join(i+1,i,i+1,false,tr<0);}
        var end=points.Count-1;var final=segs[segs.Length-1];Side(end,final.R);Walk(end,final.R,final.L,false);Side(end,final.L);
        for(var i=segs.Length-1;i>0;i--){var tr=Turn(i-1,i);if(tr==0)Side(i,segs[i].L);else Join(i,i,i-1,true,tr>0);}
        if(result.Count>65536)return false;outlines=new[]{result.ToArray()};return true;
    }
}
