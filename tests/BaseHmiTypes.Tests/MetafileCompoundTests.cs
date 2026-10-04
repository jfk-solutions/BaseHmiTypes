using System.Buffers.Binary;
using System.Xml.Linq;
using System.Text.RegularExpressions;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
using static BaseHmiTypes.Tests.MetafileCompoundFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileCompoundTests
{
    private static XElement Svg(byte[] bytes)=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!).Root!;
    private static bool Closed(uint type)=>type==8||type==91;
    private static string Path(uint type)=>"M 2 2 L 38 2 L 38 38 L 2 38"+(Closed(type)?" Z":"")+" M 12 12 L 28 12 L 28 28 L 12 28"+(Closed(type)?" Z":"");
    [TestMethod] [DataRow(7u)] [DataRow(8u)] [DataRow(90u)] [DataRow(91u)]
    public void CompoundFiguresShareOnePathAndLeavePositionUnchanged(uint type)
    {
        var bytes=Emf(Record(37,unchecked((int)0x80000000)),Record(27,1,2),Compound(type),Record(54,8,9));var original=bytes.ToArray();var svg=Svg(bytes);
        var path=svg.Elements().Single(e=>e.Name.LocalName=="path");Assert.AreEqual(Path(type),path.Attribute("d")?.Value);
        Assert.AreEqual(Closed(type)?"#ffffff":"none",path.Attribute("fill")?.Value);
        var line=svg.Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("1",line.Attribute("x1")?.Value);Assert.AreEqual("2",line.Attribute("y1")?.Value);CollectionAssert.AreEqual(original,bytes);
    }
    [TestMethod] [DataRow(7u)] [DataRow(8u)] [DataRow(90u)] [DataRow(91u)]
    public void RecordsCompoundFiguresInActivePath(uint type)
        =>Assert.AreEqual(Path(type),Svg(Emf(Record(59),Compound(type),Record(60),Record(64,0,0,39,39))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(8u,1,"evenodd")] [DataRow(8u,2,"nonzero")] [DataRow(91u,1,"evenodd")] [DataRow(91u,2,"nonzero")]
    public void CompoundPolygonsRetainFillRuleForHoles(uint type,int mode,string rule)
        =>Assert.AreEqual(rule,Svg(Emf(Record(19,mode),Compound(type))).Elements().Single().Attribute("fill-rule")?.Value);
    [TestMethod] [DataRow(7u)] [DataRow(8u)] [DataRow(90u)] [DataRow(91u)]
    public void MappingTransformsAllFigures(uint type)
        =>Assert.AreEqual("M 8 13 L 80 13 L 80 121 L 8 121"+(Closed(type)?" Z":"")+" M 28 43 L 60 43 L 60 91 L 28 91"+(Closed(type)?" Z":""),Svg(Emf(Record(9,10,10),Record(11,20,30),Record(12,4,7),Compound(type))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(7u)] [DataRow(8u)]
    public void LargeSignedCoordinatesRemain32Bit(uint type)
    {
        var coordinates=new[]{-70000,80000,int.MinValue,int.MaxValue,38,38,2,38,12,12,28,12,28,28,12,28};
        StringAssert.StartsWith(Svg(Emf(Compound(type,coordinates))).Elements().Single().Attribute("d")!.Value,"M -70000 80000 L -2147483648 2147483647");
    }
    [TestMethod] [DataRow(7u)] [DataRow(8u)] [DataRow(90u)] [DataRow(91u)]
    public void MalformedCountsAndTruncatedRecordsNeverConsumeFollowingRecords(uint type)
    {
        foreach(var (offset,value) in new[]{(24,uint.MaxValue),(28,uint.MaxValue),(28,7u),(32,0u),(36,1u),(36,uint.MaxValue)})
        {
            var record=Compound(type);BinaryPrimitives.WriteUInt32LittleEndian(record.AsSpan(offset),value);
            var svg=Svg(Emf(record,Record(27,1,2),Record(54,8,9)));Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("line",svg.Elements().Single().Name.LocalName);
        }
        var truncated=Compound(type);Array.Resize(ref truncated,truncated.Length-4);BinaryPrimitives.WriteUInt32LittleEndian(truncated.AsSpan(4),(uint)truncated.Length);
        Assert.AreEqual(0,Svg(Emf(truncated)).Elements().Count());Assert.AreEqual(0,Svg(Emf(Record(type,0,0,39,39,2))).Elements().Count());
    }
    [TestMethod] [DataRow(7u)] [DataRow(8u)] [DataRow(90u)] [DataRow(91u)]
    public void TrailingBytesDoNotBecomeVertices(uint type)
    {
        var record=Compound(type);Array.Resize(ref record,record.Length+8);BinaryPrimitives.WriteUInt32LittleEndian(record.AsSpan(4),(uint)record.Length);
        Assert.AreEqual(Path(type),Svg(Emf(record)).Elements().Single().Attribute("d")?.Value);
    }
    [TestMethod] [DataRow(7u)] [DataRow(8u)] [DataRow(90u)] [DataRow(91u)]
    public async Task HtmlRetainsCompoundShapeAndSource(uint type)
    {
        var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Compound(type)));var item=new HmiGraphicView{Name="Compound",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        Assert.AreEqual(Path(type),XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Single().Attribute("d")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);
    }
}
