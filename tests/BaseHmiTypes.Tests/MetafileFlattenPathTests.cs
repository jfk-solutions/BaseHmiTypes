using System.Buffers.Binary;
using System.Globalization;
using System.Text.Json;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileFlattenPathTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        using var stream=typeof(MetafileFlattenPathTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.flatten-paths.json")!;
        using var doc=JsonDocument.Parse(stream);
        foreach(var f in doc.RootElement.EnumerateArray())
        {
            if(!f.GetProperty("Recorded").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()!=0)throw new InvalidDataException("FlattenPath requires native API/replay equality");
            var types=Convert.FromBase64String(f.GetProperty("Types").GetString()!);var commands=new List<string>();var i=0;
            foreach(var point in f.GetProperty("Points").EnumerateArray())
            {
                var type=types[i++];Assert.IsTrue((type&~1) is 2 or 6);
                string N(int at)=>(point[at].GetInt32()/16d).ToString("0.####",CultureInfo.InvariantCulture);
                commands.Add($"{((type&~1)==6?'M':'L')} {N(0)} {N(1)}");if((type&1)!=0)commands.Add("Z");
            }
            yield return new object[]{"flatten-path",f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,string.Join(" ",commands)};
        }
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeStrokePixelAndPhase(string cohort,int index,string source,string hash,string expected)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void FillUsesNativeFlattenedPoints(string cohort,int index,string source,string hash,string expected)=>CheckGeometry(source,expected,62);

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void ClipUsesNativeFlattenedPoints(string cohort,int index,string source,string hash,string expected)=>CheckGeometry(source,expected,67);

    private static void CheckGeometry(string source,string expected,int consumer)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);
        for(var at=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(4));at<bytes.Length;at+=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4)))
            if(BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at))==64){BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at),consumer);if(consumer==67)BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at+8),5);}
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!);
        Assert.IsTrue(svg.Descendants().Any(e=>e.Name.LocalName=="path"&&(string?)e.Attribute("d")==expected),"Consumer must use the exact native line stream, not retained cubics");
    }
}
