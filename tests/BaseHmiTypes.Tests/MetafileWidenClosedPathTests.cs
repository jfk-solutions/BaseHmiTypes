using System.Buffers.Binary;
using System.Globalization;
using System.Text.Json;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileWidenClosedPathTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"widen-closed-alternate","widen-closed-winding"})
        {
            using var stream=typeof(MetafileWidenClosedPathTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;
            using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())
            {
                if(!f.GetProperty("Recorded").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()!=0||!f.GetProperty("Closed").GetBoolean()||f.GetProperty("Cap").GetInt32()!=0||f.GetProperty("Join").GetInt32()!=0)throw new InvalidDataException("Closed widening requires independent native capture");
                (double X,double Y)[] Points(string key)=>f.GetProperty(key).EnumerateArray().Select(p=>(p[0].GetInt32()/16d,p[1].GetInt32()/16d)).ToArray();
                var points=Points("Points");var types=f.GetProperty("Types").GetBytesFromBase64();var contours=new List<(double X,double Y)[]>();var current=new List<(double X,double Y)>();
                for(var i=0;i<points.Length;i++)
                {
                    if(types[i]==6){if(current.Count!=0)throw new InvalidDataException("Unclosed native contour");}
                    else if((types[i]&~1)!=2)throw new InvalidDataException("Nonlinear native outline");
                    current.Add(points[i]);if((types[i]&1)!=0){contours.Add(current.ToArray());current.Clear();}
                }
                if(current.Count!=0||contours.Count==0)throw new InvalidDataException("Missing native closure");
                yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,f.GetProperty("Width").GetDouble(),Points("Input"),contours.ToArray()};
            }
        }
    }

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeClosedOutline(string cohort,int index,string source,string hash,double width,(double X,double Y)[] input,(double X,double Y)[][] expected)
    {
        Assert.IsTrue(NativeFlatPenBuilder.TryBuildRoundFigures(input,width,true,out var actual));Assert.AreEqual(expected.Length,actual.Length);
        for(var i=0;i<expected.Length;i++)CollectionAssert.AreEqual(expected[i],actual[i],$"{cohort}/{index} contour {i}");
    }

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeClosedFillPixels(string cohort,int index,string source,string hash,double width,(double X,double Y)[] input,(double X,double Y)[][] expected)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeClosedClipGeometry(string cohort,int index,string source,string hash,double width,(double X,double Y)[] input,(double X,double Y)[][] expected)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);
        for(var at=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(4));at<bytes.Length;at+=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4)))
            if(BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at))==62){BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at),67);BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at+8),5);}
        string N(double v)=>v.ToString("0.####",CultureInfo.InvariantCulture);
        var d=string.Join(" ",expected.Select(c=>string.Join(" ",c.Select((p,i)=>$"{(i==0?'M':'L')} {N(p.X)} {N(p.Y)}"))+" Z"));
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!);Assert.IsTrue(svg.Descendants().Any(e=>e.Name.LocalName=="path"&&(string?)e.Attribute("d")==d));
    }

    [TestMethod]
    public void CompoundFillRulesAndClosedGuards()
    {
        var outer=new[]{(0d,0d),(0d,8d),(8d,8d),(8d,0d)};var inner=new[]{(2d,2d),(2d,6d),(6d,6d),(6d,2d)};
        int Count(string pixels)=>pixels.Split(new[]{"h1v1h-1Z"},StringSplitOptions.None).Length-1;
        Assert.IsTrue(NativeQuadRasterizer.TryFillContours(new[]{outer,inner},out var alternate));Assert.AreEqual(48,Count(alternate));
        Assert.IsTrue(NativeQuadRasterizer.TryFillContours(new[]{outer,inner},out var winding,true));Assert.AreEqual(64,Count(winding));
        Assert.IsTrue(NativeQuadRasterizer.TryFillContours(new[]{outer,inner.Reverse().ToArray()},out var hole,true));Assert.AreEqual(alternate,hole);
        Assert.IsTrue(NativeQuadRasterizer.TryFillContours(new[]{outer,outer},out var twice));Assert.AreEqual(string.Empty,twice);
        Assert.IsFalse(NativeQuadRasterizer.TryFillContours(new[]{outer,Array.Empty<(double,double)>()},out var invalid));Assert.AreEqual(string.Empty,invalid);
        Assert.IsFalse(NativeQuadRasterizer.TryFillContours(new[]{outer,new[]{(double.NaN,0d)}},out invalid));Assert.AreEqual(string.Empty,invalid);
        Assert.IsFalse(NativeQuadRasterizer.TryFillContours(Enumerable.Repeat(outer.Select(p=>(p.Item1,p.Item2*1000)).ToArray(),500).ToArray(),out var budget));Assert.AreEqual(string.Empty,budget);
        Assert.IsFalse(NativeFlatPenBuilder.TryBuildRoundFigures(new[]{(0d,0d),(0d,0d)},3,true,out var empty));Assert.HasCount(0,empty);
        Assert.IsFalse(NativeFlatPenBuilder.TryBuildRoundFigures(new[]{(0d,0d),(1d,1d)},double.NaN,true,out empty));Assert.HasCount(0,empty);
    }
}
