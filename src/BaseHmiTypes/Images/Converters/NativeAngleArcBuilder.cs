namespace BaseHmiTypes.Images.Converters;

internal static class NativeAngleArcBuilder
{
    private static (float X,float Y) NormalUnit(float degrees)
    {
        var position=Math.Abs(degrees)*(64f/180);
        if(float.IsNaN(position)||float.IsInfinity(position)||position>=int.MaxValue)return (float.NaN,float.NaN);
        var index=(int)Math.Floor(position);var fraction=position-index;var quadrant=index/32;var knot=index&31;
        float Interpolate(int q)
        {
            float value;
            if((q&1)==0)
            {
                var a=(float)Math.Sin(knot*Math.PI/64);var b=(float)Math.Sin((knot+1)*Math.PI/64);value=a+fraction*(b-a);
            }
            else
            {
                var a=(float)Math.Sin((32-knot)*Math.PI/64);var b=(float)Math.Sin((31-knot)*Math.PI/64);value=a-fraction*(a-b);
            }
            return (q&2)!=0?-value:value;
        }
        return (Interpolate(quadrant+1),(degrees<0?-1:1)*Interpolate(quadrant));
    }
    private static (float X,float Y) SmallUnit(float degrees)
    {
        // Small sweeps use a single-precision power/factorial series, not
        // the ordinary arc lookup table. Its operation order is observable
        // in fixed controls even at the cardinal points.
        var negative=degrees<0;degrees=Math.Abs(degrees);
        degrees=(degrees/360-(float)Math.Truncate(degrees/360))*360;
        var lower=degrees>180;if(lower)degrees=360-degrees;
        var left=degrees>90;if(left)degrees=180-degrees;
        var radians=degrees*3.1415925f/180;
        var power=radians;var sine=radians;var cosine=1f;var factorial=2f;var factor=2f;
        for(var order=2;order<=12;order++)
        {
            power*=radians;var term=power/factorial;if((order&2)!=0)term=-term;
            if((order&1)!=0)sine+=term;else cosine+=term;
            factor++;factorial*=factor;
        }
        if(negative!=lower)sine=-sine;if(left)cosine=-cosine;
        return (cosine,sine);
    }
    internal static bool TryBuild(double cx,double cy,uint radius,float start,float sweep,Func<double,double,(double X,double Y)> device,out (double X,double Y)[] controls)
    {
        controls=Array.Empty<(double X,double Y)>();
        if(double.IsNaN(cx)||double.IsInfinity(cx)||double.IsNaN(cy)||double.IsInfinity(cy)||float.IsNaN(start)||float.IsInfinity(start)||float.IsNaN(sweep)||float.IsInfinity(sweep)||Math.Abs(sweep)>4096*90)return false;
        var clockwise=sweep<0;
        var original=clockwise?-start:start;var extent=Math.Abs(sweep);
        var effective=(original+extent)-original;var small=effective>0&&effective<3;
        (double X,double Y) Corner(double x,double y)=>device(cx+radius*x,cy+(clockwise?radius:-(double)radius)*y);
        var corners=new[]{Corner(-1,1),Corner(1,1),Corner(-1,-1)};
        if(!NativeEllipseBuilder.TryBuild(corners,out var ellipse))return false;
        var lt=corners[0];var rt=corners[1];var lb=corners[2];
        var centerX=(rt.X+lb.X)*8;var centerY=(rt.Y+lb.Y)*8;
        var ux=(float)((rt.X-lt.X)*8);var uy=(float)((rt.Y-lt.Y)*8);var vx=(float)((lt.X-lb.X)*8);var vy=(float)((lt.Y-lb.Y)*8);
        (double X,double Y) Map(float x,float y,bool control=false)
        {
            var dx=x*ux+y*vx;var dy=x*uy+y*vy;
            var px=control?centerX+dx:(float)centerX+dx;var py=control?centerY+dy:(float)centerY+dy;
            return (Math.Round(px,MidpointRounding.AwayFromZero)/16,Math.Round(py,MidpointRounding.AwayFromZero)/16);
        }
        var result=new List<(double X,double Y)>();
        void Piece(float from,float to,(float X,float Y) a,(float X,float Y) b)
        {
            if(result.Count==0)result.Add(Map(a.X,a.Y));
            var determinant=Math.Abs(a.X*b.Y-a.Y*b.X);
            if(determinant<=1f/65536){result.Add(Map(a.X,a.Y,true));result.Add(Map(b.X,b.Y,true));result.Add(Map(b.X,b.Y));return;}
            var tangent=((b.Y-a.Y)/determinant,(a.X-b.X)/determinant);
            var halfCosine=Math.Abs(NormalUnit(90+(to-from)*.5f).Y);var blend=(4f/3)*halfCosine/(1+halfCosine);var endpoint=1-blend;
            result.Add(Map(endpoint*a.X+blend*tangent.Item1,endpoint*a.Y+blend*tangent.Item2,true));
            result.Add(Map(endpoint*b.X+blend*tangent.Item1,endpoint*b.Y+blend*tangent.Item2,true));result.Add(Map(b.X,b.Y));
        }
        (float X,float Y) Axis(int q)=>q switch{0=>(1,0),1=>(0,1),2=>(-1,0),_=>(0,-1)};
        int Quadrant((float X,float Y) p)=>p.Y<0?(p.X<0?2:3):p.X<0?(p.Y==0?2:1):p.X==0&&p.Y>0?1:0;
        float Normalize(float raw,(float X,float Y) unit)
        {
            if(raw>=-3600&&raw<=3600)return raw;
            var angle=NativeArcBuilder.Atan2(unit.Y,unit.X);if(angle<0)angle+=360;return angle;
        }
        void Segment(float from,float to,(float X,float Y) a,(float X,float Y) b,int first,int last,int span)
        {
            if(span==0){Piece(from,to,a,b);return;}
            var q=(first+1)&3;Piece(from,q*90,a,Axis(q));
            for(var count=0;q!=last&&count<4;count++,q=(q+1)&3)for(var i=1;i<=3;i++)result.Add(ellipse[q*3+i]);
            Piece(last*90,to,Axis(last),b);
        }
        var rawEnd=original+extent;var unitStart=small?SmallUnit(original):NormalUnit(original);var unitEnd=small?SmallUnit(rawEnd):NormalUnit(rawEnd);
        var from=Normalize(original,unitStart);var to=Normalize(rawEnd,unitEnd);var first=Quadrant(unitStart);var last=Quadrant(unitEnd);
        var quarters=(int)(extent*(1f/90));var span=quarters&3;
        if(rawEnd<-3600||rawEnd>3600){span=(last-first)&3;if(span==0&&from>to)span=3;}
        for(var turns=Math.Min(quarters/4,8);turns>0;turns--){Segment(from,to,unitStart,unitEnd,first,last,span);Segment(to,from,unitEnd,unitStart,last,first,3-span);}
        Segment(from,to,unitStart,unitEnd,first,last,span);
        if(result.Any(p=>double.IsNaN(p.X)||double.IsInfinity(p.X)||double.IsNaN(p.Y)||double.IsInfinity(p.Y)||Math.Abs(p.X*16)>0x3fffffff||Math.Abs(p.Y*16)>0x3fffffff))return false;
        controls=result.ToArray();return true;
    }
}
