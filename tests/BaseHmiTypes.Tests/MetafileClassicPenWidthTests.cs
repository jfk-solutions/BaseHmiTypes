using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileClassicPenWidthTests
{
    private static readonly JsonElement[] NativeFixtures=Load();
    private static JsonElement[] Load()
    {
        using var s=typeof(MetafileClassicPenWidthTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.classic-pen-widths.json")!;using var doc=JsonDocument.Parse(s);
        return doc.RootElement.EnumerateArray().Select(e=>e.Clone()).ToArray();
    }
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var e in NativeFixtures)yield return new object[]{e.GetProperty("Index").GetInt32(),e.GetProperty("Source").GetString()!,e.GetProperty("Rows").GetArrayLength()};
    }
    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void NativeClassicWidthSelectsPixelOrGeometricContract(int index,string source,int width)
    {
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!);
        if(width>1)
        {
            var line=svg.Descendants().Single(e=>e.Name.LocalName=="line");Assert.AreEqual(width.ToString(),line.Attribute("stroke-width")?.Value);Assert.IsNull(line.Attribute("stroke-dasharray"));Assert.AreEqual("round",line.Attribute("stroke-linecap")?.Value);return;
        }
        var actual=Enumerable.Repeat(-1,6400).ToArray();
        foreach(var path in svg.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000"))
            foreach(Match m in Regex.Matches(path.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z"))
            {var x=int.Parse(m.Groups[1].Value);var y=int.Parse(m.Groups[2].Value);if(x>=0&&x<80&&y>=0&&y<80)actual[y*80+x]=path.Attribute("fill")!.Value=="#123456"?0x563412:255;}
        var native=NativeFixtures.Single(e=>e.GetProperty("Index").GetInt32()==index).GetProperty("Pixels").EnumerateArray().Select(p=>p.GetInt32()).ToArray();
        CollectionAssert.AreEqual(native,actual,$"Native classic pen {index}");
    }
}
