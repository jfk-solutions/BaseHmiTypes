using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
using static BaseHmiTypes.Tests.MetafileRoundRectFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileRoundRectTests
{
    private static XElement Svg(byte[] bytes,string format=".emf")=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,format)!).Root!;
    private static XElement Shape(params byte[][] records)=>Svg(Emf(records)).Elements().Single(e=>e.Name.LocalName=="path");
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void DrawsSelectedObjectsDirectlyOrInPath(bool active)
    {
        var records=new List<byte[]>{Record(37,unchecked((int)0x80000000))};if(active)records.Add(Record(59));records.Add(Round());if(active)records.AddRange(new[]{Record(60),Record(63,0,0,39,39)});var shape=Shape(records.ToArray());
        StringAssert.StartsWith(shape.Attribute("d")!.Value,Prefix);Assert.AreEqual(4,Regex.Matches(shape.Attribute("d")!.Value,"C ").Count());Assert.AreEqual("#ffffff",shape.Attribute("fill")?.Value);Assert.AreEqual("#000000",shape.Attribute("stroke")?.Value);
    }
    [TestMethod] public void AbortDiscardsRoundedPath()=>Assert.AreEqual(0,Svg(Emf(Record(59),Round(),Record(68))).Elements().Count());
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void PreservesCurrentPosition(bool active)
    {
        var records=new List<byte[]>{Record(27,1,2)};if(active)records.Add(Record(59));records.Add(Round());if(active)records.Add(Record(60));records.Add(Record(54,8,9));var line=Svg(Emf(records.ToArray())).Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("1",line.Attribute("x1")?.Value);Assert.AreEqual("2",line.Attribute("y1")?.Value);
    }
    [TestMethod] public void DrawToAfterRoundedPathStartsNewFigure()=>StringAssert.EndsWith(Shape(Record(27,35,15),Record(59),Round(),Record(54,5,35),Record(60),Record(64,0,0,39,39)).Attribute("d")!.Value,"Z M 35 15 L 5 35");
    [TestMethod] [DataRow(0,10)] [DataRow(10,0)]
    public void ZeroCornerDimensionProducesRectangle(int width,int height)=>Assert.AreEqual("M 35 5 L 5 5 L 5 35 L 35 35 Z",Shape(Round(width,height)).Attribute("d")?.Value);
    [TestMethod] public void OversizedCornersAreClamped()=>StringAssert.StartsWith(Shape(Round(100,100)).Attribute("d")!.Value,"M 35 20 C 35 11.716 28.284 5 20 5 L 20 5");
    [TestMethod] public void NegativeCornersUseAbsoluteSize()=>Assert.AreEqual(Shape(Round()).Attribute("d")?.Value,Shape(Round(-10,-20)).Attribute("d")?.Value);
    [TestMethod] public void SignedExtremeCornersDoNotOverflow()=>Assert.AreEqual(Shape(Round(100,100)).Attribute("d")?.Value,Shape(Round(int.MinValue,int.MaxValue)).Attribute("d")?.Value);
    [TestMethod] public void ReversedBoundsAreNormalized()=>Assert.AreEqual(Shape(Round()).Attribute("d")?.Value,Shape(Record(44,35,35,5,5,10,20)).Attribute("d")?.Value);
    [TestMethod] public void ClockwiseShapeUsesOppositeWinding()=>StringAssert.StartsWith(Shape(Record(57,2),Round()).Attribute("d")!.Value,"M 35 25 C 35 30.523 32.761 35 30 35 L 10 35");
    [TestMethod] public void SaveRestorePreservesDirection()=>Assert.AreEqual(Shape(Round()).Attribute("d")?.Value,Shape(Record(33),Record(57,2),Record(34,-1),Round()).Attribute("d")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void AffineTransformAppliesToAllCorners(bool active)
    {
        var records=new List<byte[]>{Record(35,0,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(-1),0,BitConverter.SingleToInt32Bits(40),0)};if(active)records.Add(Record(59));records.Add(Round());if(active)records.AddRange(new[]{Record(60),Record(64,0,0,39,39)});StringAssert.StartsWith(Shape(records.ToArray()).Attribute("d")!.Value,"M 25 35 C 30.523 35 35 32.761 35 30 L 35 10");
    }
    [TestMethod] public void AppliesViewportMapping()=>StringAssert.StartsWith(Shape(Record(9,10,10),Record(11,20,30),Record(12,4,7),Round()).Attribute("d")!.Value,"M 74 52 C 74 35.431 69.523 22 64 22 L 24 22");
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void TruncatedEmfNeverReadsNextRecord(int count)=>Assert.AreEqual(0,Svg(Emf(Record(44,Enumerable.Repeat(5,count).ToArray()))).Elements().Count());
    [TestMethod] public void RoundedClipAppliesToDirectRoundedShape()
    {
        var svg=Svg(Emf(Record(59),Round(),Record(60),Record(67,5),Record(44,0,0,39,39,10,10)));Assert.AreEqual(1,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"));Assert.AreEqual("url(#clip1)",svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("clip-path")?.Value);
    }
    [TestMethod] [DataRow(1,"evenodd")] [DataRow(2,"nonzero")]
    public void UsesSelectedFillRule(int mode,string expected)=>Assert.AreEqual(expected,Shape(Record(19,mode),Round()).Attribute("fill-rule")?.Value);
    [TestMethod] public void WmfReadsCornerAndBoundsInNativeOrder()
    {
        var shape=Svg(Wmf(WmfRecord(0x061c,20,10,35,35,5,5)),".wmf").Elements().Single();StringAssert.StartsWith(shape.Attribute("d")!.Value,Prefix);
    }
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void TruncatedWmfNeverReadsNextRecord(int count)=>Assert.AreEqual(0,Svg(Wmf(WmfRecord(0x061c,Enumerable.Repeat((short)5,count).ToArray())),".wmf").Elements().Count());
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HtmlSupportsBothFormatsWithoutSourceMutation(bool wmf)
    {
        var bytes=wmf?Wmf(WmfRecord(0x061c,20,10,35,35,5,5)):Emf(Round());var original=bytes.ToArray();var uri="data:image/"+(wmf?"wmf":"emf")+";base64,"+Convert.ToBase64String(bytes);var item=new HmiGraphicView{Name="Rounded",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);StringAssert.StartsWith(XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Single().Attribute("d")!.Value,Prefix);Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
