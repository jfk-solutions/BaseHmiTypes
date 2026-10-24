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
public class MetafileCosmeticEllipseTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        using var stream=typeof(MetafileCosmeticEllipseTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.cosmetic-ellipses.json")!;using var doc=JsonDocument.Parse(stream);
        foreach(var f in doc.RootElement.EnumerateArray())yield return new object[]{f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,Points(f.GetProperty("Controls")),Points(f.GetProperty("Corners"))};
        static (double X,double Y)[] Points(JsonElement p)=>p.EnumerateArray().Select(v=>(v[0].GetInt32()/16d,v[1].GetInt32()/16d)).ToArray();
    }
    private static string MaskHash(byte[] bytes)
    {
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!);var mask=new byte[6400];
        foreach(var path in svg.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000"))
            foreach(Match p in Regex.Matches(path.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z"))
            {
                var x=int.Parse(p.Groups[1].Value);var y=int.Parse(p.Groups[2].Value);if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=path.Attribute("fill")!.Value=="#123456"?(byte)1:(byte)2;
            }
        return Convert.ToHexString(SHA256.HashData(mask)).ToLowerInvariant();
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void ControlsMatchNativePath(int index,string source,string hash,(double X,double Y)[] expected,(double X,double Y)[] corners)
    {
        var clockwise=index%50%20>=10;var input=clockwise?new[]{corners[2],corners[3],corners[1]}:new[]{corners[1],corners[0],corners[2]};
        Assert.IsTrue(NativeEllipseBuilder.TryBuild(input,clockwise,out var actual));CollectionAssert.AreEqual(expected,actual,$"Native ellipse {index}");
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void DirectEllipseMatchesNativeDashPhase(int index,string source,string hash,(double X,double Y)[] controls,(double X,double Y)[] corners)=>Assert.AreEqual(hash,MaskHash(Convert.FromBase64String(source.Split(',')[1])),$"Native ellipse {index}");
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void StoredEllipsePreservesFrozenControls(int index,string source,string hash,(double X,double Y)[] controls,(double X,double Y)[] corners)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);var records=new List<byte[]>();
        for(var at=88;at<bytes.Length;)
        {
            var type=BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at));var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));if(type==14)break;
            if(type==42)records.Add(Record(59));records.Add(bytes.AsSpan(at,size).ToArray());
            if(type==42)records.AddRange(new[]{Record(60),Record(33),Record(35,0x3f800000,0,0,0x3f800000,0,0),Record(34,-1),Record(35,0x3f800000,0,0,0x3f800000,0,0),Record(64,0,0,79,79)});at+=size;
        }
        var emf=Emf(records.ToArray());BinaryPrimitives.WriteInt32LittleEndian(emf.AsSpan(16),79);BinaryPrimitives.WriteInt32LittleEndian(emf.AsSpan(20),79);
        Assert.AreEqual(hash,MaskHash(emf),$"Stored native ellipse {index}");
    }
    [TestMethod] [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)] [DataRow(double.MaxValue)] [DataRow(.1)]
    public void InvalidCornersFailAtomically(double value){Assert.IsFalse(NativeEllipseBuilder.TryBuild(new[]{(value,0d),(1d,0d),(0d,1d)},false,out var result));Assert.HasCount(0,result);}
}
