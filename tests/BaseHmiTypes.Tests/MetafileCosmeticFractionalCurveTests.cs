using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticFractionalCurveTests
{
    public static IEnumerable<object[]> NativeFixtures()
    {
        foreach(var group in new[]{"fractional","wide","joined"})
        {
            using var stream=typeof(MetafileCosmeticFractionalCurveTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.cosmetic-{group}-curves.json")!;
            using var document=JsonDocument.Parse(stream);
            foreach(var e in document.RootElement.EnumerateArray())yield return new object[]{group,e.GetProperty("Index").GetInt32(),e.GetProperty("Source").GetString()!,e.GetProperty("Hash").GetString()!,Points(e.GetProperty("Controls")),Points(e.GetProperty("Flattened"))};
        }
        static (double X,double Y)[] Points(JsonElement e)=>e.EnumerateArray().Select(p=>(p[0].GetInt32()/16d,p[1].GetInt32()/16d)).ToArray();
    }

    [TestMethod] [DynamicData(nameof(NativeFixtures))]
    public void FixedPointSubdivisionMatchesNativeTable(string group,int index,string source,string hash,(double X,double Y)[] controls,(double X,double Y)[] expected)
    {
        var actual=new List<(double X,double Y)>{controls[0]};
        for(var i=0;i+3<controls.Length;i+=3)
        {
            Assert.IsTrue(NativeBezierFlattener.TryFlatten(controls.Skip(i).Take(4).ToArray(),out var part),$"{group}/{index}");actual.AddRange(part.Skip(1));
        }
        CollectionAssert.AreEqual(expected,actual.ToArray(),$"{group}/{index}");
    }

    private static string MaskHash(string text,bool clipped=false)
    {
        var svg=XDocument.Parse(text);var mask=new byte[6400];
        if(clipped)Assert.IsTrue(svg.Descendants().Any(e=>e.Attribute("clip-path")!=null));
        foreach(var path in svg.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000"))
            foreach(Match p in Regex.Matches(path.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z"))
            {
                var x=int.Parse(p.Groups[1].Value);var y=int.Parse(p.Groups[2].Value);
                if(x>=0&&x<80&&y>=0&&y<80&&(!clipped||x>=15&&x<55&&y>=10&&y<65))mask[y*80+x]=path.Attribute("fill")!.Value=="#123456"?(byte)1:(byte)2;
            }
        return Convert.ToHexString(SHA256.HashData(mask)).ToLowerInvariant();
    }

    public static IEnumerable<object[]> NativeStyles()
    {
        using var stream=typeof(MetafileCosmeticFractionalCurveTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.cosmetic-fractional-curve-styles.json")!;
        using var document=JsonDocument.Parse(stream);
        foreach(var e in document.RootElement.EnumerateArray())yield return new object[]{e.GetProperty("Index").GetInt32(),e.GetProperty("Source").GetString()!,e.GetProperty("Hash").GetString()!};
    }

    [TestMethod] [DynamicData(nameof(NativeStyles))]
    public void FractionalCurveStylesMatchNativeRaster(int index,string source,string hash)=>Assert.AreEqual(hash,MaskHash(new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!),$"Native style {index}");

    public static IEnumerable<object[]> NativeSequences()
    {
        using var stream=typeof(MetafileCosmeticFractionalCurveTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.cosmetic-curve-sequences.json")!;
        using var document=JsonDocument.Parse(stream);
        foreach(var e in document.RootElement.EnumerateArray())yield return new object[]{e.GetProperty("Index").GetInt32(),e.GetProperty("Source").GetString()!,e.GetProperty("Hash").GetString()!};
    }

    [TestMethod] [DynamicData(nameof(NativeSequences))]
    public void FractionalMixedCallsMatchNativePhase(int index,string source,string hash)=>Assert.AreEqual(hash,MaskHash(new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!,index%12==10),$"Native sequence {index}");

    public static IEnumerable<object[]> NativeDegenerateSequences()
    {
        using var stream=typeof(MetafileCosmeticFractionalCurveTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.cosmetic-degenerate-sequences.json")!;
        using var document=JsonDocument.Parse(stream);
        foreach(var e in document.RootElement.EnumerateArray())yield return new object[]{e.GetProperty("Index").GetInt32(),e.GetProperty("Source").GetString()!,e.GetProperty("Hash").GetString()!};
    }

    // Native API masks are also checked against independent Windows EMF playback.
    [TestMethod] [DynamicData(nameof(NativeDegenerateSequences))]
    public void DegenerateMixedCallsMatchNativePhase(int index,string source,string hash)=>Assert.AreEqual(hash,MaskHash(new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!,index%12==10),$"Native degenerate sequence {index}");

    [TestMethod] [DynamicData(nameof(NativeFixtures))]
    public void FractionalCurveMatchesNativeRasterWithinBudget(string group,int index,string source,string hash,(double X,double Y)[] controls,(double X,double Y)[] expected)
    {
        var svg=new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!;
        var budget=expected.Skip(1).Select((p,i)=>Math.Max(Math.Abs(p.X-expected[i].X),Math.Abs(p.Y-expected[i].Y))+2).Sum();
        if(budget>262144){StringAssert.Contains(svg,"C ");Assert.IsFalse(svg.Contains("h1v1h-1Z"));}
        else Assert.AreEqual(hash,MaskHash(svg),$"{group}/{index}");
    }

    private static List<byte[]> Records(string source)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);var records=new List<byte[]>();
        for(var at=88;at<bytes.Length;){var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));if(BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at))==14)break;records.Add(bytes.AsSpan(at,size).ToArray());at+=size;}return records;
    }
    private static byte[] Emf80(List<byte[]> records){var bytes=Emf(records.ToArray());BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(16),79);BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(20),79);return bytes;}
    private static object[] Fixture(int index)=>NativeFixtures().Single(f=>(string)f[0]=="fractional"&&(int)f[1]==index);

    [TestMethod] [DataRow(189)] [DataRow(327)] [DataRow(485)] [DataRow(889)]
    public void ShortCurvesRetainNativeSubdivisionAndPhase(int index)
    {
        var fixture=Fixture(index);var records=Records((string)fixture[2]);var curve=records[records.Count-1];var shortCurve=new byte[44];curve.AsSpan(0,28).CopyTo(shortCurve);
        BinaryPrimitives.WriteUInt32LittleEndian(shortCurve,85);BinaryPrimitives.WriteInt32LittleEndian(shortCurve.AsSpan(4),44);
        for(var i=0;i<8;i++)BinaryPrimitives.WriteInt16LittleEndian(shortCurve.AsSpan(28+2*i),checked((short)BinaryPrimitives.ReadInt32LittleEndian(curve.AsSpan(28+4*i))));records[records.Count-1]=shortCurve;
        Assert.AreEqual(fixture[3],MaskHash(new MetafileToSvgRenderer().Render(Emf80(records),".emf")!));
    }

    [TestMethod] [DataRow(189)] [DataRow(327)] [DataRow(485)] [DataRow(889)]
    public void BezierToRetainsNativeFractionalStart(int index)
    {
        var fixture=Fixture(index);var records=Records((string)fixture[2]);var curve=records[records.Count-1];records.RemoveAt(records.Count-1);
        var logical=Enumerable.Range(0,8).Select(i=>BinaryPrimitives.ReadInt32LittleEndian(curve.AsSpan(28+4*i))).ToArray();
        records.Add(Record(27,logical[0],logical[1]));records.Add(Record(5,new[]{0,0,79,79,3}.Concat(logical.Skip(2)).ToArray()));
        Assert.AreEqual(fixture[3],MaskHash(new MetafileToSvgRenderer().Render(Emf80(records),".emf")!));
    }

    [TestMethod] [DataRow(189)] [DataRow(327)] [DataRow(485)] [DataRow(889)]
    public void StoredCurvesKeepDeviceControlsAfterTransformChanges(int index)
    {
        var fixture=Fixture(index);var records=Records((string)fixture[2]);var curve=records[records.Count-1];records.RemoveAt(records.Count-1);
        records.AddRange(new[]{Record(59),curve,Record(60),Record(33),Record(35,BitConverter.SingleToInt32Bits(1),0,0,BitConverter.SingleToInt32Bits(1),0,0),Record(34,-1),Record(35,BitConverter.SingleToInt32Bits(1),0,0,BitConverter.SingleToInt32Bits(1),0,0),Record(64,0,0,79,79)});
        Assert.AreEqual(fixture[3],MaskHash(new MetafileToSvgRenderer().Render(Emf80(records),".emf")!));
    }

    [TestMethod] [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)] [DataRow(double.MaxValue)] [DataRow(.1)]
    public void InvalidOrNonFixedInputsFailAtomically(double value)
    {
        Assert.IsFalse(NativeBezierFlattener.TryFlatten(new[]{(value,0d),(1d,1d),(2d,2d),(3d,3d)},out var result));Assert.HasCount(0,result);
    }

    [TestMethod] [DataRow(112)] [DataRow(116)] [DataRow(120)] [DataRow(124)]
    public void ModifyIdentityKeepsAdvancedMappedCoordinates(int index)
    {
        var fixture=NativeFixtures().Single(f=>(string)f[0]=="joined"&&(int)f[1]==index);var records=Records((string)fixture[2]);
        var world=records.FindIndex(r=>BinaryPrimitives.ReadUInt32LittleEndian(r)==35);Assert.IsTrue(world>=0);
        records[world]=Record(36,0,0,0,0,0,0,1);
        Assert.AreEqual(fixture[3],MaskHash(new MetafileToSvgRenderer().Render(Emf80(records),".emf")!));
    }

    [TestMethod]
    public async Task HtmlPreservesNativeFractionalCurveAndSource()
    {
        var fixture=Fixture(189);var source=(string)fixture[2];var item=new HmiGraphicView{Name="FractionalCurve",Source=source};
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        Assert.AreEqual(fixture[3],MaskHash(Uri.UnescapeDataString(match.Groups[1].Value)));Assert.AreEqual(source,item.Source!.StaticValue);
    }
}
