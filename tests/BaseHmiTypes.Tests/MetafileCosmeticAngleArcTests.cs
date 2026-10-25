using System.Text.Json;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Buffers.Binary;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticAngleArcTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"cosmetic-angle-arcs","cosmetic-angle-arc-direct","cosmetic-angle-arc-chain1","cosmetic-angle-arc-chain2","cosmetic-angle-arc-prelude","cosmetic-angle-arc-direct-prelude"})
        {
            using var stream=typeof(MetafileCosmeticAngleArcTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())
            {
                if(!f.GetProperty("Recorded").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()!=0)throw new InvalidDataException("AngleArc requires independent native API/replay equality");
                yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,f.GetProperty("Cx").GetInt32(),f.GetProperty("Cy").GetInt32(),f.GetProperty("Radius").GetUInt32(),f.GetProperty("Start").GetSingle(),f.GetProperty("Sweep").GetSingle(),f.GetProperty("Controls").EnumerateArray().Skip(1).Select(p=>(p[0].GetInt32()/16d,p[1].GetInt32()/16d)).ToArray()};
            }
        }
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeControls(string cohort,int index,string source,string hash,int cx,int cy,uint radius,float start,float sweep,(double X,double Y)[] expected)
    {
        Assert.IsTrue(NativeAngleArcBuilder.TryBuild(cx,cy,radius,start,sweep,(x,y)=>(Math.Round(x*16,MidpointRounding.AwayFromZero)/16,Math.Round(y*16,MidpointRounding.AwayFromZero)/16),out var actual));
        CollectionAssert.AreEqual(expected,actual,$"Native {cohort} {index}");
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativePixelAndPhase(string cohort,int index,string source,string hash,int cx,int cy,uint radius,float start,float sweep,(double X,double Y)[] expected)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);
    [TestMethod] [DataRow(1)] [DataRow(5)] [DataRow(12)] [DataRow(17)] [DataRow(26)] [DataRow(47)] [DataRow(99)] [DataRow(165)]
    public void FrozenMetadataSurvivesSavedDc(int index)
    {
        var f=Fixtures().First(f=>(string)f[0]=="cosmetic-angle-arcs"&&(int)f[1]==index);var bytes=Convert.FromBase64String(((string)f[2]).Split(',')[1]);var records=new List<byte[]>();
        for(var at=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(4));at<bytes.Length;)
        {
            var type=BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at));var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));if(type==14)break;
            if(type==64)records.AddRange(new[]{Record(33),Record(35,0x40000000,0,0,0x40000000,0,0),Record(34,-1)});records.Add(bytes.AsSpan(at,size).ToArray());at+=size;
        }
        new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase("saved AngleArc",index,"data:image/emf;base64,"+Convert.ToBase64String(Emf(records.ToArray())),(string)f[3]);
    }
    [TestMethod] [DataRow(float.NaN)] [DataRow(float.PositiveInfinity)] [DataRow(float.NegativeInfinity)] [DataRow(float.MaxValue)] [DataRow(float.MinValue)]
    public void InvalidAnglesFailAtomically(float value)
    {
        Assert.IsFalse(NativeAngleArcBuilder.TryBuild(36,34,26,value,90,(x,y)=>(x,y),out var a));Assert.HasCount(0,a);
        Assert.IsFalse(NativeAngleArcBuilder.TryBuild(36,34,26,0,value,(x,y)=>(x,y),out var b));Assert.HasCount(0,b);
    }
    [TestMethod]
    public void InvalidGeometryFailsAtomically()
    {
        Assert.IsFalse(NativeAngleArcBuilder.TryBuild(double.NaN,34,26,0,90,(x,y)=>(x,y),out var a));Assert.HasCount(0,a);
        Assert.IsFalse(NativeAngleArcBuilder.TryBuild(36,34,uint.MaxValue,0,90,(x,y)=>(x,y),out var b));Assert.HasCount(0,b);
        Assert.IsFalse(NativeAngleArcBuilder.TryBuild(36,34,26,0,90,(x,y)=>(double.NaN,y),out var c));Assert.HasCount(0,c);
    }
}
