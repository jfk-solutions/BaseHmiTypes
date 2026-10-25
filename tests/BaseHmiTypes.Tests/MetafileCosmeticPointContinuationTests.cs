using System.Buffers.Binary;
using System.Text.Json;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticPointContinuationTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"cosmetic-angle-arc-polyline-to","cosmetic-angle-arc-bezier-to","cosmetic-angle-arc-poly-draw","cosmetic-angle-arc-polyline-path","cosmetic-angle-arc-bezier-path","cosmetic-angle-arc-polydraw-path"})
        {
            using var stream=typeof(MetafileCosmeticPointContinuationTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;
            using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())
            {
                if(!f.GetProperty("Recorded").GetBoolean()||!f.GetProperty("Compatible").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()!=0)
                    throw new InvalidDataException("Point continuation requires independent compatible native API/replay equality");
                yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!};
            }
        }
    }

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativePixelAndPhase(string cohort,int index,string source,string hash)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void AlternatePointWidthKeepsNativePixelAndPhase(string cohort,int index,string source,string hash)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);var records=new List<byte[]>();var changed=false;
        for(var at=0;at<bytes.Length;)
        {
            var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));var record=bytes.AsSpan(at,size).ToArray();
            var type=BinaryPrimitives.ReadInt32LittleEndian(record);
            if(type is 5 or 6 or 56 or 88 or 89 or 92)
            {
                var narrow=type>=88;var count=BinaryPrimitives.ReadInt32LittleEndian(record.AsSpan(24));
                var targetType=type switch{5=>88,6=>89,56=>92,88=>5,89=>6,_=>56};
                var pointSize=narrow?8:4;var types=type is 56 or 92?count:0;
                var target=new byte[(28+count*pointSize+types+3)&~3];record.AsSpan(0,28).CopyTo(target);
                BinaryPrimitives.WriteInt32LittleEndian(target,targetType);BinaryPrimitives.WriteInt32LittleEndian(target.AsSpan(4),target.Length);
                for(var i=0;i<count*2;i++)
                {
                    var value=narrow?BinaryPrimitives.ReadInt16LittleEndian(record.AsSpan(28+i*2)):BinaryPrimitives.ReadInt32LittleEndian(record.AsSpan(28+i*4));
                    if(narrow)BinaryPrimitives.WriteInt32LittleEndian(target.AsSpan(28+i*4),value);
                    else BinaryPrimitives.WriteInt16LittleEndian(target.AsSpan(28+i*2),checked((short)value));
                }
                if(types>0)record.AsSpan(28+count*(narrow?4:8),types).CopyTo(target.AsSpan(28+count*pointSize));
                record=target;changed=true;
            }
            records.Add(record);at+=size;
        }
        Assert.IsTrue(changed,"Fixture must exercise a point-array continuation");
        var expanded=records.SelectMany(r=>r).ToArray();BinaryPrimitives.WriteInt32LittleEndian(expanded.AsSpan(48),expanded.Length);
        new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort+" alternate width",index,"data:image/emf;base64,"+Convert.ToBase64String(expanded),hash);
    }
}
