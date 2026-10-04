using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileShortPointArrayTests
{
    private static XElement Svg(byte[] bytes) => XDocument.Parse(new MetafileToSvgRenderer().Render(bytes, ".emf")!).Root!;

    [TestMethod] [DataRow(86u,"polygon","#ffffff")] [DataRow(87u,"polyline","none")]
    public void DrawsUsingSelectedObjects(uint type,string tag,string fill)
    {
        var shape=Svg(Emf(Record(37,unchecked((int)0x80000000)),Points(type))).Elements().Single();
        Assert.AreEqual(tag,shape.Name.LocalName);Assert.AreEqual("5,5 35,5 20,35",shape.Attribute("points")?.Value);
        Assert.AreEqual(fill,shape.Attribute("fill")?.Value);Assert.AreEqual("#000000",shape.Attribute("stroke")?.Value);
    }
    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void SignedCoordinatesAndMapping(uint type)
    {
        var shape=Svg(Emf(Record(9,10,10),Record(11,20,30),Record(12,4,7),Points(type,new[]{-32768,32767,10,-10}))).Elements().Single();
        Assert.AreEqual("-65532,98308 24,-23",shape.Attribute("points")?.Value);
    }
    [TestMethod] [DataRow(86u,"M 5 5 L 35 5 L 20 35 Z")] [DataRow(87u,"M 5 5 L 35 5 L 20 35")]
    public void RecordsIndependentPathFigures(uint type,string expected)
    {
        var shape=Svg(Emf(Record(59),Points(type),Record(60),Record(64,0,0,39,39))).Elements().Single();
        Assert.AreEqual("path",shape.Name.LocalName);Assert.AreEqual(expected,shape.Attribute("d")?.Value);
    }
    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void AbortDiscardsRecordedFigure(uint type)
        =>Assert.AreEqual(0,Svg(Emf(Record(59),Points(type),Record(68))).Elements().Count());

    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void DoesNotChangeCurrentPosition(uint type)
    {
        var line=Svg(Emf(Record(27,1,2),Points(type),Record(54,8,9))).Elements().Single(e=>e.Name.LocalName=="line");
        Assert.AreEqual("1",line.Attribute("x1")?.Value);Assert.AreEqual("2",line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void RecordedDrawToStartsAtDcPosition(uint type)
    {
        var path=Svg(Emf(Record(27,1,2),Record(59),Points(type),Record(54,8,9),Record(60),Record(64,0,0,39,39))).Elements().Single();
        StringAssert.EndsWith(path.Attribute("d")!.Value,"M 1 2 L 8 9");
    }
    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void SelectedFigureCanBecomeClip(uint type)
    {
        var svg=Svg(Emf(Record(59),Points(type),Record(60),Record(67,5),Points(3)));
        Assert.AreEqual(1,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"));
        Assert.AreEqual("M 5 5 L 35 5 L 20 35"+(type==86?" Z":""),svg.Descendants().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
    }
    [TestMethod] [DataRow(86u,0u)] [DataRow(87u,0u)] [DataRow(86u,1u)] [DataRow(87u,1u)]
    [DataRow(86u,4u)] [DataRow(87u,4u)] [DataRow(86u,uint.MaxValue)] [DataRow(87u,uint.MaxValue)]
    public void InvalidCountsNeverConsumeFollowingRecord(uint type,uint count)
    {
        var shapes=Svg(Emf(Points(type,count:count),Record(27,1,2),Record(54,8,9))).Elements().ToArray();
        Assert.AreEqual(1,shapes.Length);Assert.AreEqual("line",shapes[0].Name.LocalName);
    }
    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void MissingCountIgnored(uint type)=>Assert.AreEqual(0,Svg(Emf(Record(type,0,0,39,39))).Elements().Count());
    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void PartialPointIgnored(uint type)=>Assert.AreEqual(0,Svg(Emf(Points(type,sizeAdjustment:-4))).Elements().Count());
    [TestMethod] [DataRow(86u)] [DataRow(87u)]
    public void TrailingBytesIgnored(uint type)=>Assert.AreEqual("5,5 35,5 20,35",Svg(Emf(Points(type,sizeAdjustment:8))).Elements().Single().Attribute("points")?.Value);
    [TestMethod] [DataRow(1,"evenodd")] [DataRow(2,"nonzero")]
    public void PolygonUsesFillRule(int mode,string expected)=>Assert.AreEqual(expected,Svg(Emf(Record(19,mode),Points(86))).Elements().Single().Attribute("fill-rule")?.Value);
    [TestMethod] [DataRow(86u,"polygon")] [DataRow(87u,"polyline")]
    public async Task HtmlRendersWithoutSourceMutation(uint type,string tag)
    {
        var bytes=Emf(Points(type));var original=bytes.ToArray();var uri="data:image/emf;base64,"+Convert.ToBase64String(bytes);
        var item=new HmiGraphicView{Name="ShortPoints",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");
        Assert.IsTrue(match.Success);Assert.AreEqual(tag,XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Single().Name.LocalName);
        Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
