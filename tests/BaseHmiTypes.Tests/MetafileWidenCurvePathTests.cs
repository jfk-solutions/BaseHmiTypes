using System.Buffers.Binary;
using System.Globalization;
using System.Text.Json;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileWidenCurvePathTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        using var stream=typeof(MetafileWidenCurvePathTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.widen-curves-open.json")!;
        using var doc=JsonDocument.Parse(stream);
        foreach(var f in doc.RootElement.EnumerateArray())
        {
            if(!f.GetProperty("Recorded").GetBoolean()||f.GetProperty("PlaybackDifferences").GetInt32()!=0||!f.GetProperty("Curves").GetBoolean())throw new InvalidDataException("Curved widening requires independent native capture");
            var points=f.GetProperty("Points").EnumerateArray().Select(p=>(X:p[0].GetInt32()/16d,Y:p[1].GetInt32()/16d)).ToArray();
            var types=f.GetProperty("Types").GetBytesFromBase64();
            string N(double v)=>v.ToString("0.####",CultureInfo.InvariantCulture);
            var d=string.Join(" ",points.Select((p,i)=>$"{((types[i]&~1)==6?'M':'L')} {N(p.X)} {N(p.Y)}{((types[i]&1)!=0?" Z":"")}"));
            yield return new object[]{"curves-open",f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!,d};
        }
    }

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeCurveFill(string cohort,int index,string source,string hash,string expected)
        =>new MetafileCosmeticStoredShapeTests().MatchesNativePixelAndDashPhase(cohort,index,source,hash);

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeCurveOutline(string cohort,int index,string source,string hash,string expected)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);
        for(var at=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(4));at<bytes.Length;at+=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4)))
            if(BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at))==62){BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at),67);BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at+8),5);}
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!);
        Assert.IsTrue(svg.Descendants().Any(e=>e.Name.LocalName=="path"&&(string?)e.Attribute("d")==expected),$"{cohort}/{index} native outline mismatch");
    }
}
