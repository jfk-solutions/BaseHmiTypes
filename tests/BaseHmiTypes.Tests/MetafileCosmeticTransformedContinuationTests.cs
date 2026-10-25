using System.Text.Json;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticTransformedContinuationTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"cosmetic-angle-arc-transformed-line","cosmetic-angle-arc-transformed-arc","cosmetic-angle-arc-transformed-angle"})
        {
            using var stream=typeof(MetafileCosmeticTransformedContinuationTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;
            using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())
            {
                if(!f.GetProperty("Recorded").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()!=0)
                    throw new InvalidDataException("Continuation requires independent native API/replay equality");
                yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!};
            }
        }
    }

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativePixelAndPhase(string cohort,int index,string source,string hash)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);
}
