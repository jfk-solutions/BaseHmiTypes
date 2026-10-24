using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticRoundRectTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        using var stream=typeof(MetafileCosmeticRoundRectTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.cosmetic-roundrects.json")!;using var doc=JsonDocument.Parse(stream);
        foreach(var f in doc.RootElement.EnumerateArray())yield return new object[]{f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,f.GetProperty("PathHash").GetString()!,Points(f.GetProperty("Controls")),Points(f.GetProperty("Corners"))};
        static (double X,double Y)[] Points(JsonElement p)=>p.EnumerateArray().Select(v=>(v[0].GetInt32()/16d,v[1].GetInt32()/16d)).ToArray();
    }
    private static List<byte[]> Records(string source)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);var result=new List<byte[]>();for(var at=88;at<bytes.Length;){var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));if(BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at))==14)break;result.Add(bytes.AsSpan(at,size).ToArray());at+=size;}return result;
    }
    private static byte[] Emf80(List<byte[]> rs){var bytes=Emf(rs.ToArray());BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(16),79);BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(20),79);return bytes;}
    private static string MaskHash(string text)
    {
        var svg=XDocument.Parse(text);var mask=new byte[6400];
        foreach(var path in svg.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000"))
            foreach(Match p in Regex.Matches(path.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z"))
            {var x=int.Parse(p.Groups[1].Value);var y=int.Parse(p.Groups[2].Value);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=path.Attribute("fill")!.Value=="#123456"?(byte)1:(byte)2;}
        return Convert.ToHexString(SHA256.HashData(mask)).ToLowerInvariant();
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void ControlsMatchNativePath(int index,string source,string hash,string pathHash,(double X,double Y)[] expected,(double X,double Y)[] corners)
    {
        var shape=Records(source).Single(r=>BinaryPrimitives.ReadUInt32LittleEndian(r)==44);int I(int at)=>BinaryPrimitives.ReadInt32LittleEndian(shape.AsSpan(at));
        var ratioX=Math.Min(Math.Abs((double)I(24))/(I(16)-I(8)),1);var ratioY=Math.Min(Math.Abs((double)I(28))/(I(20)-I(12)),1);
        Assert.IsTrue(NativeRoundRectBuilder.TryBuild(new[]{corners[1],corners[0],corners[2]},ratioX,ratioY,out var actual));CollectionAssert.AreEqual(expected,actual,$"Native roundrect {index}");
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void DirectCosmeticPhaseAndWidePenFallback(int index,string source,string hash,string pathHash,(double X,double Y)[] controls,(double X,double Y)[] corners)
    {
        var rs=Records(source);var world=rs.Single(r=>BinaryPrimitives.ReadUInt32LittleEndian(r)==35);double F(int at)=>BitConverter.Int32BitsToSingle(BinaryPrimitives.ReadInt32LittleEndian(world.AsSpan(at)));
        var width=rs.Any(r=>BinaryPrimitives.ReadUInt32LittleEndian(r)==38)?Math.Max(1,Math.Round(Math.Max(Math.Sqrt(F(8)*F(8)+F(12)*F(12)),Math.Sqrt(F(16)*F(16)+F(20)*F(20))),MidpointRounding.AwayFromZero)):1;
        var svg=new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!;
        if(width==1)Assert.AreEqual(hash,MaskHash(svg),$"Native direct roundrect {index}");
        else {Assert.AreNotEqual(hash,pathHash,"Native widened classic pen must differ from identity path stroke");Assert.IsFalse(svg.Contains("h1v1h-1Z"));StringAssert.Contains(svg,$"stroke-width=\"{width}\"");Assert.IsFalse(svg.Contains("stroke-dasharray"));}
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void StoredRoundRectKeepsControlsAfterTransformChange(int index,string source,string hash,string pathHash,(double X,double Y)[] controls,(double X,double Y)[] corners)
    {
        var rs=Records(source);var shape=rs.FindIndex(r=>BinaryPrimitives.ReadUInt32LittleEndian(r)==44);rs.Insert(shape,Record(59));rs.AddRange(new[]{Record(60),Record(33),Record(35,0x3f800000,0,0,0x3f800000,0,0),Record(34,-1),Record(35,0x3f800000,0,0,0x3f800000,0,0),Record(64,0,0,79,79)});
        Assert.AreEqual(pathHash,MaskHash(new MetafileToSvgRenderer().Render(Emf80(rs),".emf")!),$"Stored native roundrect {index}");
    }
    [TestMethod] [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)] [DataRow(double.MaxValue)] [DataRow(.1)]
    public void InvalidCornersFailAtomically(double value){Assert.IsFalse(NativeRoundRectBuilder.TryBuild(new[]{(value,0d),(1d,0d),(0d,1d)},.5,.5,out var result));Assert.HasCount(0,result);}
}
