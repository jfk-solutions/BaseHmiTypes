using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticFractionalPathTests
{
    public static IEnumerable<object[]> NativeFixtures()
    {
        using var stream=typeof(MetafileCosmeticFractionalPathTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.cosmetic-fractional-paths.json")!;
        using var document=JsonDocument.Parse(stream);
        foreach(var e in document.RootElement.EnumerateArray())yield return new object[]{e.GetProperty("Index").GetInt32(),e.GetProperty("Source").GetString()!,e.GetProperty("Hash").GetString()!};
    }

    private static string MaskHash(string text)
    {
        var svg=XDocument.Parse(text);var mask=new byte[6400];
        foreach(var path in svg.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000"))
            foreach(Match p in Regex.Matches(path.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z"))
            {
                var x=int.Parse(p.Groups[1].Value);var y=int.Parse(p.Groups[2].Value);
                if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=path.Attribute("fill")!.Value=="#123456"?(byte)1:(byte)2;
            }
        return Convert.ToHexString(SHA256.HashData(mask)).ToLowerInvariant();
    }

    // Native GDI confirms each curve, flattened path and fractional Polyline has
    // the same complete bitmap. These fixtures contain the actual native vertices.
    [TestMethod] [DynamicData(nameof(NativeFixtures))]
    public void FractionalPolylineMatchesNativeGdi(int index,string source,string hash)=>Assert.AreEqual(hash,MaskHash(new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!),$"Native fixture {index}");

    private static List<byte[]> Records(string source)
    {
        var bytes=Convert.FromBase64String(source.Split(',')[1]);var records=new List<byte[]>();
        for(var at=88;at<bytes.Length;){var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));if(BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at))==14)break;records.Add(bytes.AsSpan(at,size).ToArray());at+=size;}return records;
    }

    [TestMethod] [DataRow(337)] [DataRow(521)] [DataRow(591)] [DataRow(843)]
    public void StoredPathRetainsFractionalVerticesAcrossSaveRestore(int index)
    {
        var fixture=NativeFixtures().Single(f=>(int)f[0]==index);var records=Records((string)fixture[1]);var poly=records[records.Count-1];records.RemoveAt(records.Count-1);
        records.AddRange(new[]{Record(59),poly,Record(60),Record(33),Record(35,BitConverter.SingleToInt32Bits(1),0,0,BitConverter.SingleToInt32Bits(1),0,0),Record(34,-1),Record(64,0,0,79,79)});
        Assert.AreEqual(fixture[2],MaskHash(new MetafileToSvgRenderer().Render(Emf(records.ToArray()),".emf")!));
    }

    [TestMethod] [DataRow(337)] [DataRow(521)] [DataRow(591)] [DataRow(843)]
    public void ShortPointArrayRetainsNativeFractionalPhase(int index)
    {
        var fixture=NativeFixtures().Single(f=>(int)f[0]==index);var records=Records((string)fixture[1]);var poly=records[records.Count-1];var count=BinaryPrimitives.ReadInt32LittleEndian(poly.AsSpan(24));
        var shortPoly=new byte[28+4*count];poly.AsSpan(0,28).CopyTo(shortPoly);BinaryPrimitives.WriteUInt32LittleEndian(shortPoly,87);BinaryPrimitives.WriteInt32LittleEndian(shortPoly.AsSpan(4),shortPoly.Length);
        for(var i=0;i<count*2;i++)BinaryPrimitives.WriteInt16LittleEndian(shortPoly.AsSpan(28+2*i),checked((short)BinaryPrimitives.ReadInt32LittleEndian(poly.AsSpan(28+4*i))));records[records.Count-1]=shortPoly;
        Assert.AreEqual(fixture[2],MaskHash(new MetafileToSvgRenderer().Render(Emf(records.ToArray()),".emf")!));
    }

    [TestMethod]
    public async Task HtmlPreservesFractionalPhaseAndSource()
    {
        var fixture=NativeFixtures().Single(f=>(int)f[0]==591);var source=(string)fixture[1];var item=new HmiGraphicView{Name="Fractional",Source=source};
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        Assert.AreEqual(fixture[2],MaskHash(Uri.UnescapeDataString(match.Groups[1].Value)));Assert.AreEqual(source,item.Source!.StaticValue);
    }
}
