namespace BaseHmiTypes.Images.Converters;

// Native arcs blend the endpoints towards their tangent intersection. Complete
// interior quadrants use the fixed-point ellipse controls, not analytic cubics.
internal static class NativeArcBuilder
{
    private static float Interpolate(float position,Func<int,double> function)
    {
        var index=(int)Math.Floor(position);var fraction=position-index;
        var a=(float)function(index);var b=(float)function(index+1);
        return a+fraction*(b-a);
    }
    private static float Sin(float degrees)=>Interpolate(degrees*(64f/180),i=>Math.Sin(i*Math.PI/64));
    private static float Cos(float degrees)=>Interpolate(degrees*(64f/180),i=>Math.Cos(i*Math.PI/64));
    private static float Atan2(float y,float x)
    {
        var ax=Math.Abs(x);var ay=Math.Abs(y);
        var angle=ax==0&&ay==0?0:Interpolate(Math.Min(ax,ay)/Math.Max(ax,ay)*32,i=>Math.Atan(i/32d));
        if(ay>ax&&y>=0)angle=(float)(Math.PI/2)-angle;
        angle*=(float)(180/Math.PI);
        if(ay>ax&&y<0)angle=90-angle;
        if(x<0)angle=180-angle;if(y<0)angle=-angle;
        return angle;
    }
    internal static bool TryBuild(double left,double top,double right,double bottom,double sx,double sy,double ex,double ey,bool clockwise,
        Func<double,double,(double X,double Y)> device,out (double X,double Y)[] controls)
    {
        controls=Array.Empty<(double X,double Y)>();
        if(new[]{left,top,right,bottom,sx,sy,ex,ey}.Any(v=>double.IsNaN(v)||double.IsInfinity(v)))return false;
        var rx=(right-left)/2;var ry=(bottom-top)/2;var cx=(left+right)/2;var cy=(top+bottom)/2;
        if(rx<=0||ry<=0)return false;
        (double X,double Y) Corner(double x,double y)=>device(cx+rx*x,cy+(clockwise?ry:-ry)*y);
        var corners=new[]{Corner(-1,1),Corner(1,1),Corner(-1,-1)};
        if(!NativeEllipseBuilder.TryBuild(corners,out var ellipse))return false;
        var lt=corners[0];var rt=corners[1];var lb=corners[2];
        var centerX=(rt.X+lb.X)*8;var centerY=(rt.Y+lb.Y)*8;
        var ux=(float)((rt.X-lt.X)*8);var uy=(float)((rt.Y-lt.Y)*8);
        var vx=(float)((lt.X-lb.X)*8);var vy=(float)((lt.Y-lb.Y)*8);
        (double X,double Y) Map(float x,float y,bool control=false)
        {
            // Endpoints round the translated point to binary32. Controls keep
            // the fixed translation separate from their binary32 linear part.
            var dx=x*ux+y*vx;var dy=x*uy+y*vy;
            var px=control?centerX+dx:(float)centerX+dx;
            var py=control?centerY+dy:(float)centerY+dy;
            return (Math.Round(px,MidpointRounding.AwayFromZero)/16,Math.Round(py,MidpointRounding.AwayFromZero)/16);
        }
        bool Position(double x,double y,out (float Angle,int Quadrant) position)
        {
            position=default;
            var px=(float)(x-cx);var py=(float)(clockwise?y-cy:cy-y)*((float)rx/(float)ry);
            if(float.IsNaN(px)||float.IsInfinity(px)||float.IsNaN(py)||float.IsInfinity(py))return false;
            var angle=Atan2(py,px);if(angle<0)angle+=360;
            var quadrant=(int)Math.Floor(angle/90);
            if(px==0&&py>0)quadrant=0;if(px<0&&py==0)quadrant=1;
            position=(angle,quadrant);return true;
        }
        if(!Position(sx,sy,out var a)||!Position(ex,ey,out var b))return false;
        var final=b;
        if(b.Angle<=a.Angle){b.Angle+=360;b.Quadrant+=4;}
        var result=new List<(double X,double Y)>();
        void Piece(float from,float to)
        {
            var a=(X:Cos(from),Y:Sin(from));var b=(X:Cos(to),Y:Sin(to));
            if(result.Count==0)result.Add(Map(a.X,a.Y));
            var determinant=a.X*b.Y-a.Y*b.X;
            if(from==to||determinant==0)
            {
                result.Add(Map(a.X,a.Y));result.Add(Map(b.X,b.Y));result.Add(Map(b.X,b.Y));return;
            }
            var tangent=((b.Y-a.Y)/determinant,(a.X-b.X)/determinant);
            // The scalar cosine used for the blend is a phase-shifted sine;
            // endpoint sine/cosine share their original table index instead.
            var halfCosine=Sin(90+(to-from)*.5f);var blend=(4f/3)*halfCosine/(1+halfCosine);var endpoint=1-blend;
            result.Add(Map(endpoint*a.X+blend*tangent.Item1,endpoint*a.Y+blend*tangent.Item2,true));
            result.Add(Map(endpoint*b.X+blend*tangent.Item1,endpoint*b.Y+blend*tangent.Item2,true));
            result.Add(Map(b.X,b.Y));
        }
        if(a.Quadrant==b.Quadrant)Piece(a.Angle,b.Angle);
        else
        {
            Piece(a.Angle,(a.Quadrant+1)*90);
            for(var q=a.Quadrant+1;q<b.Quadrant;q++)for(var i=1;i<=3;i++)result.Add(ellipse[q%4*3+i]);
            Piece(final.Quadrant*90,final.Angle);
        }
        if(result.Any(p=>double.IsNaN(p.X)||double.IsInfinity(p.X)||double.IsNaN(p.Y)||double.IsInfinity(p.Y)||Math.Abs(p.X*16)>0x3fffffff||Math.Abs(p.Y*16)>0x3fffffff))return false;
        controls=result.ToArray();return true;
    }
}
