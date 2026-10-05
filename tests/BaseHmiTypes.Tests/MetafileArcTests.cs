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
public class MetafileArcTests
{
    private static byte[] Arc(uint type,int ex=20,int ey=-100)=>Record(type,5,5,35,35,100,20,ex,ey);
    private static XElement Svg(byte[] bytes,string format=".emf")=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,format)!).Root!;
    private static XElement Shape(params byte[][] records)=>Svg(Emf(records)).Elements().Single(e=>e.Name.LocalName=="path");
    private static bool Closed(uint type)=>type==46||type==47;
    [TestMethod] [DataRow(45u,false)] [DataRow(46u,false)] [DataRow(47u,false)] [DataRow(55u,false)]
    [DataRow(45u,true)] [DataRow(46u,true)] [DataRow(47u,true)] [DataRow(55u,true)]
    public void DirectAndRecordedArcsUseRayIntersections(uint type,bool active)
    {
        var records=new List<byte[]>{Record(37,unchecked((int)0x80000000)),Record(27,1,2)};if(active)records.Add(Record(59));records.Add(Arc(type));if(active)records.AddRange(new[]{Record(60),Record(Closed(type)?63u:64u,0,0,39,39)});var shape=Shape(records.ToArray());var path=shape.Attribute("d")!.Value;
        StringAssert.StartsWith(path,(type==55?"M 1 2 L":"M")+" 35 20 C 35 11.716 28.284 5 20 5");Assert.AreEqual(Closed(type),path.EndsWith("Z"));Assert.AreEqual(Closed(type)?"#ffffff":"none",shape.Attribute("fill")?.Value);if(type==47)StringAssert.EndsWith(path,"L 20 20 Z");
    }
    [TestMethod] [DataRow(45u)] [DataRow(46u)] [DataRow(47u)] [DataRow(55u)]
    public void NativeCurrentPositionBehavior(uint type)
    {
        var line=Svg(Emf(Record(27,1,2),Arc(type),Record(54,8,9))).Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual(type==55?"20":"1",line.Attribute("x1")?.Value);Assert.AreEqual(type==55?"5":"2",line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(45u)] [DataRow(46u)] [DataRow(47u)] [DataRow(55u)]
    public void ClockwiseSelectsLongSweep(uint type)
    {
        var path=Shape(Record(27,1,2),Record(57,2),Arc(type)).Attribute("d")!.Value;Assert.AreEqual(3,Regex.Matches(path,"C ").Count());StringAssert.Contains(path,"35 28.284 28.284 35 20 35");
    }
    [TestMethod] [DataRow(45u)] [DataRow(46u)] [DataRow(47u)] [DataRow(55u)]
    public void SameRayDrawsCompleteEllipse(uint type)=>Assert.AreEqual(4,Regex.Matches(Shape(Arc(type,100,20)).Attribute("d")!.Value,"C ").Count());
    [TestMethod] [DataRow(45u)] [DataRow(46u)] [DataRow(47u)] [DataRow(55u)]
    public void AbortDiscardsCapturedArc(uint type)=>Assert.AreEqual(0,Svg(Emf(Record(59),Arc(type),Record(68))).Elements().Count());
    [TestMethod] [DataRow(45u)] [DataRow(46u)] [DataRow(47u)] [DataRow(55u)]
    public void TransformsCurveControlPoints(uint type)
        =>StringAssert.Contains(Shape(Record(35,0,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(-1),0,BitConverter.SingleToInt32Bits(40),0),Arc(type)).Attribute("d")!.Value,"20 35 C 28.284 35 35 28.284 35 20");
    [TestMethod] [DataRow(45u,0)] [DataRow(46u,0)] [DataRow(47u,0)] [DataRow(55u,0)]
    [DataRow(45u,7)] [DataRow(46u,7)] [DataRow(47u,7)] [DataRow(55u,7)]
    public void TruncatedFieldsDoNotConsumeFollowingRecord(uint type,int count)
        =>Assert.AreEqual(0,Svg(Emf(Record(type,Enumerable.Repeat(5,count).ToArray()))).Elements().Count());
    [TestMethod] [DataRow(45u)] [DataRow(46u)] [DataRow(47u)] [DataRow(55u)]
    public void ReversedBoundsHaveSameGeometry(uint type)=>Assert.AreEqual(Shape(Arc(type)).Attribute("d")?.Value,Shape(Record(type,35,35,5,5,100,20,20,-100)).Attribute("d")?.Value);
    [TestMethod] public void ArcToContinuesAfterClosedFigureFromDcPoint()
        =>StringAssert.Contains(Shape(Record(27,5,5),Record(59),Points(3),Arc(55),Record(60),Record(64,0,0,39,39)).Attribute("d")!.Value,"Z M 5 5 L 35 20 C");
    [TestMethod] [DataRow(46u)] [DataRow(47u)]
    public void ClosedArcCanBecomeClip(uint type)
    {
        var svg=Svg(Emf(Record(59),Arc(type),Record(60),Record(67,5),Arc(45)));Assert.AreEqual(1,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"));Assert.AreEqual("url(#clip1)",svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("clip-path")?.Value);
    }
    [TestMethod] [DataRow(45u)] [DataRow(46u)] [DataRow(47u)] [DataRow(55u)]
    public async Task HtmlRendersArcWithoutSourceMutation(uint type)=>await Html(Emf(Arc(type)),false);
    [TestMethod] [DataRow((ushort)0x0817)] [DataRow((ushort)0x0830)] [DataRow((ushort)0x081a)]
    public void WmfUsesNativeParameterOrder(ushort type)
    {
        var shape=Svg(Wmf(WmfRecord(type,-100,20,20,100,35,35,5,5)),".wmf").Elements().Single();StringAssert.StartsWith(shape.Attribute("d")!.Value,"M 35 20 C 35 11.716 28.284 5 20 5");Assert.AreEqual(type!=0x817,shape.Attribute("d")!.Value.EndsWith("Z"));
    }
    [TestMethod] [DataRow((ushort)0x0817)] [DataRow((ushort)0x0830)] [DataRow((ushort)0x081a)]
    public void WmfTruncationIgnored(ushort type)=>Assert.AreEqual(0,Svg(Wmf(WmfRecord(type,5,5,5,5,5,5,5)),".wmf").Elements().Count());
    [TestMethod] [DataRow((ushort)0x0817)] [DataRow((ushort)0x0830)] [DataRow((ushort)0x081a)]
    public async Task HtmlRendersWmfArcWithoutSourceMutation(ushort type)=>await Html(Wmf(WmfRecord(type,-100,20,20,100,35,35,5,5)),true);
    private static async Task Html(byte[] bytes,bool wmf)
    {
        var original=bytes.ToArray();var uri="data:image/"+(wmf?"wmf":"emf")+";base64,"+Convert.ToBase64String(bytes);var item=new HmiGraphicView{Name="Arc",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);Assert.AreEqual(1,XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Count(e=>e.Name.LocalName=="path"));Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
