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
public class MetafilePointArrayTests
{
    private static XElement Svg(byte[] bytes)=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!).Root!;

    [TestMethod] [DataRow(3u,"polygon","#ffffff")] [DataRow(4u,"polyline","none")]
    public void Draws32BitPointArraysUsingSelectedObjects(uint type,string tag,string fill)
    {
        var bytes=Emf(Record(37,unchecked((int)0x80000000)),Points(type));var original=bytes.ToArray();
        var shape=Svg(bytes).Elements().Single(); Assert.AreEqual(tag,shape.Name.LocalName);
        Assert.AreEqual("5,5 35,5 20,35",shape.Attribute("points")?.Value);
        Assert.AreEqual(fill,shape.Attribute("fill")?.Value);Assert.AreEqual("#000000",shape.Attribute("stroke")?.Value);
        CollectionAssert.AreEqual(original,bytes);
    }

    [TestMethod] [DataRow(3u)] [DataRow(4u)]
    public void RetainsSignedCoordinatesBeyond16BitRange(uint type)
    {
        var shape=Svg(Emf(Points(type,new[]{-70000,80000,int.MinValue,int.MaxValue}))).Elements().Single();
        Assert.AreEqual("-70000,80000 -2147483648,2147483647",shape.Attribute("points")?.Value);
    }

    [TestMethod] [DataRow(3u)] [DataRow(4u)]
    public void AppliesCurrentMapping(uint type)
    {
        var shape=Svg(Emf(Record(9,10,10),Record(11,20,30),Record(12,4,7),Points(type))).Elements().Single();
        Assert.AreEqual("14,22 74,22 44,112",shape.Attribute("points")?.Value);
    }

    [TestMethod] [DataRow(3u)] [DataRow(4u)]
    public void DoesNotChangeCurrentPosition(uint type)
    {
        var svg=Svg(Emf(Record(27,1,2),Points(type),Record(54,8,9)));var line=svg.Elements().Single(e=>e.Name.LocalName=="line");
        Assert.AreEqual("1",line.Attribute("x1")?.Value);Assert.AreEqual("2",line.Attribute("y1")?.Value);
    }

    [TestMethod] [DataRow(3u,"M 5 5 L 35 5 L 20 35 Z")] [DataRow(4u,"M 5 5 L 35 5 L 20 35")]
    public void RecordsIndependentFiguresInsidePaths(uint type,string path)
    {
        var svg=Svg(Emf(Record(59),Points(type),Record(60),Record(64,0,0,39,39)));
        Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("path",svg.Elements().Single().Name.LocalName);
        Assert.AreEqual(path,svg.Elements().Single().Attribute("d")?.Value);
    }

    [TestMethod] [DataRow(1,"evenodd")] [DataRow(2,"nonzero")]
    public void PolygonUsesCurrentFillRule(int mode,string expected)
        =>Assert.AreEqual(expected,Svg(Emf(Record(19,mode),Points(3))).Elements().Single().Attribute("fill-rule")?.Value);

    [TestMethod] [DataRow(3u,0u)] [DataRow(4u,0u)] [DataRow(3u,1u)] [DataRow(4u,1u)]
    [DataRow(3u,4u)] [DataRow(4u,4u)] [DataRow(3u,uint.MaxValue)] [DataRow(4u,uint.MaxValue)]
    public void InvalidCountsDoNotReadFollowingRecords(uint type,uint count)
    {
        var svg=Svg(Emf(Points(type,count:count),Record(27,1,2),Record(54,8,9)));
        Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("line",svg.Elements().Single().Name.LocalName);
    }

    [TestMethod] [DataRow(3u)] [DataRow(4u)]
    public void MissingCountFieldIsIgnored(uint type)
        =>Assert.AreEqual(0,Svg(Emf(Record(type,0,0,39,39))).Elements().Count());

    [TestMethod] [DataRow(3u)] [DataRow(4u)]
    public void PartialPointDoesNotConsumeFollowingRecord(uint type)
        =>Assert.AreEqual(0,Svg(Emf(Points(type,sizeAdjustment:-4))).Elements().Count());

    [TestMethod] [DataRow(3u)] [DataRow(4u)]
    public void TrailingBytesAreIgnored(uint type)
        =>Assert.AreEqual("5,5 35,5 20,35",Svg(Emf(Points(type,sizeAdjustment:8))).Elements().Single().Attribute("points")?.Value);

    [TestMethod] [DataRow(3u,"polygon")] [DataRow(4u,"polyline")]
    public async Task HtmlRendersPointArraysWithoutMutatingSource(uint type,string tag)
    {
        var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Points(type)));
        var item=new HmiGraphicView{Name="Points",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");
        Assert.IsTrue(match.Success);var svg=XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!;
        Assert.AreEqual(tag,svg.Elements().Single().Name.LocalName);Assert.AreEqual(uri,item.Source!.StaticValue);
    }
}
