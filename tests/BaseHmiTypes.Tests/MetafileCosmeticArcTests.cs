using System.Text.Json;
using System.Buffers.Binary;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticArcTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"cosmetic-arcs","cosmetic-arc-direct","cosmetic-arc-chain1","cosmetic-arc-chain2","cosmetic-arc-prelude","cosmetic-arc-direct-chain","cosmetic-arc-direct-prelude"})
        {
            using var stream=typeof(MetafileCosmeticArcTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())
            {
                var points=f.GetProperty("Controls").EnumerateArray().Select(p=>(p[0].GetInt32()/16d,p[1].GetInt32()/16d)).ToArray();var types=f.GetProperty("Types").GetBytesFromBase64();
                var first=Array.FindIndex(types,t=>(t&6)==4);if(first<1)throw new InvalidDataException("Native arc fixture has no cubic");var end=first;while(end<types.Length&&(types[end]&6)==4)end++;
                yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,f.GetProperty("Kind").GetInt32(),f.GetProperty("Clockwise").GetBoolean(),f.GetProperty("Bounds").EnumerateArray().Select(v=>v.GetInt32()).ToArray(),f.GetProperty("Rays").EnumerateArray().Select(v=>v.GetInt32()).ToArray(),points.Skip(first-1).Take(end-first+1).ToArray()};
            }
        }
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeRaster(string cohort,int index,string source,string hash,int kind,bool clockwise,int[] bounds,int[] rays,(double X,double Y)[] expected)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeControls(string cohort,int index,string source,string hash,int kind,bool clockwise,int[] bounds,int[] rays,(double X,double Y)[] expected)
    {
        Assert.IsTrue(NativeArcBuilder.TryBuild(bounds[0],bounds[1],bounds[2],bounds[3],rays[0],rays[1],rays[2],rays[3],clockwise,(x,y)=>(Math.Round(x*16,MidpointRounding.AwayFromZero)/16,Math.Round(y*16,MidpointRounding.AwayFromZero)/16),out var actual));
        CollectionAssert.AreEqual(expected,actual,$"Native {cohort} controls {index}");
    }
    [TestMethod] [DataRow(0)] [DataRow(6)] [DataRow(36)] [DataRow(42)] [DataRow(72)] [DataRow(78)] [DataRow(108)] [DataRow(114)]
    public void FrozenArcMetadataSurvivesSavedDc(int index)
    {
        var fixture=Fixtures().First(f=>(string)f[0]=="cosmetic-arcs"&&(int)f[1]==index);var bytes=Convert.FromBase64String(((string)fixture[2]).Split(',')[1]);var records=new List<byte[]>();
        for(var at=88;at<bytes.Length;)
        {
            var type=BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at));var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));if(type==14)break;
            if(type==64)records.AddRange(new[]{Record(33),Record(35,0x40000000,0,0,0x40000000,0,0),Record(34,-1)});records.Add(bytes.AsSpan(at,size).ToArray());at+=size;
        }
        new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase("saved arc",index,"data:image/emf;base64,"+Convert.ToBase64String(Emf(records.ToArray())),(string)fixture[3]);
    }
    [TestMethod] [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)] [DataRow(double.NegativeInfinity)] [DataRow(double.MaxValue)] [DataRow(double.MinValue)]
    public void InvalidBoundsAndRaysFailAtomically(double value)
    {
        Assert.IsFalse(NativeArcBuilder.TryBuild(value,8,68,60,68,34,36,8,false,(x,y)=>(x,y),out var bounds));Assert.HasCount(0,bounds);
        Assert.IsFalse(NativeArcBuilder.TryBuild(4,8,68,60,value,34,36,8,false,(x,y)=>(x,y),out var rays));Assert.HasCount(0,rays);
    }
    [TestMethod]
    public void InvalidDeviceGeometryFailsAtomically()
    {
        Assert.IsFalse(NativeArcBuilder.TryBuild(4,8,68,60,68,34,36,8,false,(x,y)=>(double.NaN,y),out var points));Assert.HasCount(0,points);
    }
}
