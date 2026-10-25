using System.Text.Json;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileRecordedArcTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"arc-compatible-stored","arc-compatible-direct","arc-compatible-chain1","arc-compatible-chain2","arc-compatible-prelude","arc-compatible-direct-prelude"})
        {
            using var stream=typeof(MetafileRecordedArcTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;
            using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())
            {
                if(!f.GetProperty("Compatible").GetBoolean()||!f.GetProperty("Recorded").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()<0)
                    throw new InvalidDataException("Recorded arc tests require actual native EMF playback, not direct-API pixels");
                yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!};
            }
        }
    }

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeRecordedArcPixelAndPhase(string cohort,int index,string source,string hash)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);
}
