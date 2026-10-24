using System.Numerics;

namespace BaseHmiTypes.Images.Converters;

// Hybrid forward differencing, adapted from the MIT-licensed Microsoft WPF
// geometry reference. See THIRD-PARTY-NOTICES.txt. GDI uses the older 2/3
// tolerance and two-phase precision, not WPF's newer antialiased tolerance.
internal static class NativeBezierFlattener
{
    private const int MaxPoints = 65536;
    private const long InitialTolerance = 65472;
    private const long WorkingTolerance = InitialTolerance * 8;

    internal static bool TryFlatten((double X,double Y)[] controls,out List<(double X,double Y)> points)
    {
        points=new List<(double X,double Y)>();
        if(controls.Length!=4)return false;
        var fixedPoints=new (long X,long Y)[4];
        for(var i=0;i<4;i++)
        {
            var x=controls[i].X*16;var y=controls[i].Y*16;
            if(double.IsNaN(x)||double.IsInfinity(x)||double.IsNaN(y)||double.IsInfinity(y)||
               x!=Math.Truncate(x)||y!=Math.Truncate(y)||Math.Abs(x)>0x3fffffff||Math.Abs(y)>0x3fffffff)return false;
            fixedPoints[i]=((long)x,(long)y);
        }
        var candidate=new List<(double X,double Y)>{controls[0]};
        var small=fixedPoints.Max(p=>p.X)-fixedPoints.Min(p=>p.X)<16384&&
                  fixedPoints.Max(p=>p.Y)-fixedPoints.Min(p=>p.Y)<16384;
        if(!(small?FlattenSmall(fixedPoints,candidate):FlattenLarge(fixedPoints,candidate)))return false;
        points=candidate;return true;
    }

    private struct Axis
    {
        internal long Position,Delta,EndError,StartError;
        internal Axis(long a,long b,long c,long d)
        {
            Position=a*1024;Delta=(d-a)*1024;
            EndError=6*(b-2*c+d)*1024;StartError=6*(a-2*b+c)*1024;
        }
        internal long Error=>Math.Max(Math.Abs(EndError),Math.Abs(StartError));
        internal long ParentErrorQuarter=>Math.Max(Math.Abs(StartError),Math.Abs(2*EndError-StartError));
        internal void InitialHalf(int shift)
        {
            EndError=(EndError+StartError)>>1;
            Delta=(Delta-(EndError>>shift))>>1;
        }
        internal void Normalize(int shift)
        {
            Position*=8;Delta*=8;
            if(shift>=3){EndError>>=shift-3;StartError>>=shift-3;}
            else {EndError<<=3-shift;StartError<<=3-shift;}
        }
        internal void Half()
        {
            EndError=(EndError+StartError)>>3;Delta=(Delta-EndError)>>1;StartError>>=2;
        }
        internal void Double()
        {
            Delta=2*Delta+EndError;EndError=8*EndError-4*StartError;StartError*=4;
        }
        internal void Step()
        {
            Position+=Delta;Delta+=EndError;
            var previous=EndError;EndError=2*EndError-StartError;StartError=previous;
        }
        internal double Value=>((Position+4096)>>13)/16d;
    }

    private static bool FlattenSmall((long X,long Y)[] p,List<(double X,double Y)> result)
    {
        // The initial phase keeps error coefficients unscaled while tracking
        // their exponent. Prematurely dividing them changes native tie pixels.
        var x=new Axis(p[0].X,p[1].X,p[2].X,p[3].X);
        var y=new Axis(p[0].Y,p[1].Y,p[2].Y,p[3].Y);
        var shift=0;var remaining=1;
        while(Math.Max(x.Error,y.Error)>InitialTolerance*(1L<<shift))
        {
            if(shift>=40)return false;
            shift+=2;x.InitialHalf(shift);y.InitialHalf(shift);remaining*=2;
        }
        x.Normalize(shift);y.Normalize(shift);x.Step();y.Step();remaining--;
        while(result.Count<MaxPoints)
        {
            result.Add((x.Value,y.Value));if(remaining==0)return true;
            if(Math.Max(x.Error,y.Error)>WorkingTolerance){x.Half();y.Half();remaining*=2;}
            while(remaining%2==0&&x.ParentErrorQuarter<=WorkingTolerance/4&&y.ParentErrorQuarter<=WorkingTolerance/4)
            {
                x.Double();y.Double();remaining/=2;
            }
            remaining--;x.Step();y.Step();
        }
        return false;
    }

    private sealed class WideAxis
    {
        internal BigInteger Position,Delta,EndError,StartError;
        internal WideAxis(long a,long b,long c,long d)
        {
            Position=(BigInteger)a<<28;Delta=(BigInteger)(d-a)<<28;
            EndError=(BigInteger)(6*(b-2*c+d))<<28;StartError=(BigInteger)(6*(a-2*b+c))<<28;
        }
        internal BigInteger Error=>BigInteger.Max(BigInteger.Abs(EndError),BigInteger.Abs(StartError));
        internal BigInteger ParentError=>BigInteger.Max(BigInteger.Abs(4*StartError),BigInteger.Abs(8*EndError-4*StartError));
        internal void Half(){EndError=(EndError+StartError)>>3;Delta=(Delta-EndError)>>1;StartError>>=2;}
        internal void Double(){Delta=2*Delta+EndError;EndError=8*EndError-4*StartError;StartError*=4;}
        internal void Step(){Position+=Delta;Delta+=EndError;var previous=EndError;EndError=2*EndError-StartError;StartError=previous;}
        private static long Round(BigInteger value)=>(long)((value+((BigInteger)1<<27))>>28);
        internal long Value=>Round(Position);
        internal long[] Controls()=>new[]{Value,Round(Position+(6*Delta-EndError-2*StartError)/18),Round(Position+(12*Delta-2*EndError-StartError)/18),Round(Position+Delta)};
    }

    private static bool FlattenLarge((long X,long Y)[] p,List<(double X,double Y)> result)
    {
        // Rebase wide curves in bounded chunks, preserving the native integer
        // division/rounding when converting the high basis back to controls.
        var highTolerance=(BigInteger)196608<<28;var lowTolerance=(BigInteger)64<<28;
        var highX=new WideAxis(p[0].X,p[1].X,p[2].X,p[3].X);
        var highY=new WideAxis(p[0].Y,p[1].Y,p[2].Y,p[3].Y);
        var highRemaining=1;
        while(BigInteger.Max(highX.Error,highY.Error)>highTolerance)
        {
            if(highRemaining>=1<<20)return false;
            highX.Half();highY.Half();highRemaining*=2;
        }
        while(result.Count<MaxPoints)
        {
            var cx=highX.Controls();var cy=highY.Controls();
            var x=new WideAxis(cx[0],cx[1],cx[2],cx[3]);var y=new WideAxis(cy[0],cy[1],cy[2],cy[3]);var remaining=1;
            while(BigInteger.Max(x.Error,y.Error)>lowTolerance)
            {
                if(remaining>=1<<20)return false;
                x.Half();y.Half();remaining*=2;
            }
            if(--highRemaining!=0)
            {
                highX.Step();highY.Step();
                if(BigInteger.Max(highX.Error,highY.Error)>highTolerance){highX.Half();highY.Half();highRemaining*=2;}
                while(highRemaining%2==0&&highX.ParentError<=highTolerance&&highY.ParentError<=highTolerance)
                {
                    highX.Double();highY.Double();highRemaining/=2;
                }
            }
            while(result.Count<MaxPoints)
            {
                x.Step();y.Step();result.Add((x.Value/16d,y.Value/16d));
                if(--remaining==0)break;
                if(BigInteger.Max(x.Error,y.Error)>lowTolerance){x.Half();y.Half();remaining*=2;}
                while(remaining%2==0&&x.ParentError<=lowTolerance&&y.ParentError<=lowTolerance){x.Double();y.Double();remaining/=2;}
            }
            if(highRemaining==0&&remaining==0)return true;
        }
        return false;
    }
}
