using System.Buffers.Binary;
using System.Globalization;
using System.Text.Json;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileWidenFlatPathTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"widen-flat-paths","widen-square-paths","widen-square-edges","widen-round-miter","widen-round-miter-edges","widen-round-bevel","widen-round-bevel-edges","widen-round-round","widen-round-round-edges","widen-round-round-ties"})
        {
            using var stream=typeof(MetafileWidenFlatPathTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;
            using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())
            {
                var cap=f.GetProperty("Cap").GetInt32();
                var join=f.TryGetProperty("Join",out var j)?j.GetInt32():2;
                if(!f.GetProperty("Recorded").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()!=0||cap is <0 or >2||join is <0 or >2)throw new InvalidDataException("Widening requires independent native API/replay equality");
                (double X,double Y)[] Points(string property)=>f.GetProperty(property).EnumerateArray().Select(p=>(p[0].GetInt32()/16d,p[1].GetInt32()/16d)).ToArray();
                yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,f.GetProperty("Width").GetDouble(),Points("Input"),Points("Points"),cap,join};
            }
        }
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeOutline(string cohort,int index,string source,string hash,double width,(double X,double Y)[] input,(double X,double Y)[] expected,int cap,int join)
    {
        Assert.IsTrue(NativeFlatPenBuilder.TryBuild(input[0],input[1],width,out var actual,cap==1,cap==0,join==0));CollectionAssert.AreEqual(expected,actual,$"Native outline {cohort} {index}");
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeFillPixels(string cohort,int index,string source,string hash,double width,(double X,double Y)[] input,(double X,double Y)[] expected,int cap,int join)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeClipGeometry(string cohort,int index,string source,string hash,double width,(double X,double Y)[] input,(double X,double Y)[] expected,int cap,int join)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);
        for(var at=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(4));at<bytes.Length;at+=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4)))
            if(BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at))==62){BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at),67);BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at+8),5);}
        string N(double value)=>value.ToString("0.####",CultureInfo.InvariantCulture);
        var d=string.Join(" ",expected.Select((p,i)=>$"{(i==0?'M':'L')} {N(p.X)} {N(p.Y)}"))+" Z";
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!);Assert.IsTrue(svg.Descendants().Any(e=>e.Name.LocalName=="path"&&(string?)e.Attribute("d")==d));
    }
    [TestMethod] [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)] [DataRow(0d)] [DataRow(-1d)] [DataRow(4097d)]
    public void InvalidWidthIsAtomic(double width)
    {
        foreach(var cap in new[]{0,1,2}){Assert.IsFalse(NativeFlatPenBuilder.TryBuild((0,0),(10,10),width,out var actual,cap==1,cap==0));Assert.HasCount(0,actual);}
    }
    [TestMethod]
    public void InvalidCoordinatesAndRasterBudgetAreAtomic()
    {
        foreach(var cap in new[]{0,1,2})
        {
            Assert.IsFalse(NativeFlatPenBuilder.TryBuild((.01,0),(10,10),1,out var a,cap==1,cap==0));Assert.HasCount(0,a);
            Assert.IsFalse(NativeFlatPenBuilder.TryBuild((0,0),(0,0),1,out var b,cap==1,cap==0));Assert.HasCount(0,b);
        }
        Assert.IsFalse(NativeQuadRasterizer.TryFill(new[]{(0d,0d),(0d,1000d),(1000d,1000d),(1000d,0d)},out var pixels));Assert.AreEqual(string.Empty,pixels);
    }
    [TestMethod]
    public void PolygonFillHonorsAlternateAndWindingRules()
    {
        var box=new[]{(0d,0d),(0d,3d),(3d,3d),(3d,0d)};var twice=box.Concat(box).ToArray();
        Assert.IsTrue(NativeQuadRasterizer.TryFill(twice,out var alternate));Assert.AreEqual(string.Empty,alternate);
        Assert.IsTrue(NativeQuadRasterizer.TryFill(twice,out var winding,true));
        Assert.AreEqual(string.Join(" ",Enumerable.Range(0,3).SelectMany(y=>Enumerable.Range(0,3).Select(x=>$"M {x} {y}h1v1h-1Z"))),winding);
        Assert.IsFalse(NativeQuadRasterizer.TryFill(Enumerable.Repeat(box,500).SelectMany(p=>p).Select(p=>(p.Item1,p.Item2*1000)).ToArray(),out var budget));Assert.AreEqual(string.Empty,budget);
    }
}
