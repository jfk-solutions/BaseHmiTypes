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
public class MetafileShapePathTests
{
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    private static byte[] Shape(uint type)=>Record(type,5,5,35,35);
    private static string Path(XElement svg)=>svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")!.Value;
    private static byte[] Rotation()=>Record(35,0,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(-1),0,BitConverter.SingleToInt32Bits(40),0);

    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void CapturesClosedIndependentShape(uint type)
    {
        var svg=Svg(Record(59),Shape(type),Record(60),Record(64,0,0,39,39));Assert.AreEqual(1,svg.Elements().Count());
        var path=Path(svg);StringAssert.StartsWith(path,type==43?"M 35 5 L 5 5 L 5 35 L 35 35":"M 35 20 C 35 11.716 28.284 5 20 5");
        StringAssert.EndsWith(path," Z");Assert.AreEqual(type==43?0:4,Regex.Matches(path,"C ").Count);
    }
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void AbortDiscardsShape(uint type)=>Assert.AreEqual(0,Svg(Record(59),Shape(type),Record(68)).Elements().Count());
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void LeavesCurrentPositionUnchanged(uint type)
    {
        var line=Svg(Record(27,1,2),Record(59),Shape(type),Record(60),Record(54,8,9),Record(64,0,0,39,39)).Elements().Single(e=>e.Name.LocalName=="line");
        Assert.AreEqual("1",line.Attribute("x1")?.Value);Assert.AreEqual("2",line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void DrawToAfterShapeStartsAtDcPosition(uint type)
        =>StringAssert.EndsWith(Path(Svg(Record(27,1,2),Record(59),Shape(type),Record(54,8,9),Record(60),Record(64,0,0,39,39))),"Z M 1 2 L 8 9");
    [TestMethod] [DataRow(43u,62u,"#ffffff","none")] [DataRow(42u,62u,"#ffffff","none")]
    [DataRow(43u,63u,"#ffffff","#000000")] [DataRow(42u,63u,"#ffffff","#000000")]
    [DataRow(43u,64u,"none","#000000")] [DataRow(42u,64u,"none","#000000")]
    public void UsesObjectsSelectedAtPaintTime(uint type,uint paint,string fill,string stroke)
    {
        var shape=Svg(Record(37,unchecked((int)0x80000005)),Record(59),Shape(type),Record(60),Record(37,unchecked((int)0x80000000)),Record(paint,0,0,39,39)).Elements().Single();
        Assert.AreEqual("path",shape.Name.LocalName);Assert.AreEqual(fill,shape.Attribute("fill")?.Value);Assert.AreEqual(stroke,shape.Attribute("stroke")?.Value);
    }
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void ShapeSelectedAsClipAppliesToDirectPrimitives(uint type)
    {
        var svg=Svg(Record(59),Shape(type),Record(60),Record(67,5),Record(43,0,0,39,39),Record(42,0,0,39,39));
        Assert.AreEqual(1,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"));
        foreach(var shape in svg.Elements().Where(e=>e.Name.LocalName=="rect"||e.Name.LocalName=="ellipse"))Assert.AreEqual("url(#clip1)",shape.Attribute("clip-path")?.Value);
    }
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void AppliesMapping(uint type)=>StringAssert.StartsWith(Path(Svg(Record(17,8),Record(9,10,10),Record(11,20,30),Record(12,4,7),Record(59),Shape(type),Record(60),Record(64,0,0,39,39))),type==43?"M 74 22 L 14 22 L 14 112 L 74 112":"M 74 67 C 74 42.147 60.569 22 44 22");
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void TransformsAllCornersAndCurveControls(uint type)
        =>StringAssert.StartsWith(Path(Svg(Rotation(),Record(59),Shape(type),Record(60),Record(64,0,0,39,39))),type==43?"M 35 35 L 35 5 L 5 5 L 5 35":"M 20 35 C 28.284 35 35 28.284 35 20");
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void ReversedBoundsHaveSameGeometry(uint type)
        =>Assert.AreEqual(Path(Svg(Record(59),Shape(type),Record(60),Record(64,0,0,39,39))),Path(Svg(Record(59),Record(type,35,35,5,5),Record(60),Record(64,0,0,39,39))));
    [TestMethod] [DataRow(43u,0)] [DataRow(42u,0)] [DataRow(43u,1)] [DataRow(42u,1)] [DataRow(43u,2)] [DataRow(42u,2)] [DataRow(43u,3)] [DataRow(42u,3)]
    public void TruncatedBoundsNeverReadFollowingRecord(uint type,int count)
    {
        var svg=Svg(Record(type,Enumerable.Repeat(5,count).ToArray()),Record(27,1,2),Record(54,8,9));Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("line",svg.Elements().Single().Name.LocalName);
    }
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void ClockwiseDirectionChangesWinding(uint type)
        =>StringAssert.StartsWith(Path(Svg(Record(57,2),Record(59),Shape(type),Record(60),Record(64,0,0,39,39))),type==43?"M 35 35 L 5 35 L 5 5 L 35 5":"M 35 20 C 35 28.284 28.284 35 20 35");
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void SaveRestorePreservesDirection(uint type)
        =>Assert.AreEqual(Path(Svg(Record(59),Shape(type),Record(60),Record(64,0,0,39,39))),Path(Svg(Record(33),Record(57,2),Record(34,-1),Record(59),Shape(type),Record(60),Record(64,0,0,39,39))));
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public void InvalidDirectionLeavesPreviousState(uint type)
    {
        var expected=Path(Svg(Record(57,2),Record(59),Shape(type),Record(60),Record(64,0,0,39,39)));
        foreach(var invalid in new[]{Record(57),Record(57,0),Record(57,3),Record(57,-1)})Assert.AreEqual(expected,Path(Svg(Record(57,2),invalid,Record(59),Shape(type),Record(60),Record(64,0,0,39,39))));
    }
    [TestMethod] [DataRow(43u,1,"evenodd")] [DataRow(42u,1,"evenodd")] [DataRow(43u,2,"nonzero")] [DataRow(42u,2,"nonzero")]
    public void CompoundShapesUseFillRule(uint type,int mode,string expected)
    {
        var shape=Svg(Record(19,mode),Record(59),Shape(type),Record(type,10,10,30,30),Record(60),Record(62,0,0,39,39)).Elements().Single();
        Assert.AreEqual(expected,shape.Attribute("fill-rule")?.Value);Assert.AreEqual(2,Regex.Matches(shape.Attribute("d")!.Value,"M ").Count());
    }
    [TestMethod] [DataRow(43u)] [DataRow(42u)]
    public async Task HtmlRendersPathWithoutSourceMutation(uint type)
    {
        var bytes=Emf(Record(59),Shape(type),Record(60),Record(64,0,0,39,39));var original=bytes.ToArray();var uri="data:image/emf;base64,"+Convert.ToBase64String(bytes);
        var item=new HmiGraphicView{Name="ShapePath",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        Assert.AreEqual("path",XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Single().Name.LocalName);Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
