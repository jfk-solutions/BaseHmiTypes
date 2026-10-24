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
[TestClass] public class MetafilePixelTests
{
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static byte[] Pixel(int x=4,int y=5,int color=0x563412)=>Record(15,x,y,color);
    private static byte[] World(params float[] m)=>Record(35,m.Select(BitConverter.SingleToInt32Bits).ToArray());
    private static XElement Rect(XElement s)=>s.Descendants().Single(e=>e.Name.LocalName=="rect"&&(string?)e.Attribute("width")=="1");
    [TestMethod] [DataRow(4,5,0x563412,"#123456")] [DataRow(-3,-4,0,"#000000")] [DataRow(0,0,0xffffff,"#ffffff")] [DataRow(int.MaxValue,int.MinValue,255,"#ff0000")]
    public void EmitsOpaqueOneDevicePixel(int x,int y,int color,string fill){var r=Rect(Svg(Pixel(x,y,color)));Assert.AreEqual(x.ToString(System.Globalization.CultureInfo.InvariantCulture),r.Attribute("x")?.Value);Assert.AreEqual(y.ToString(System.Globalization.CultureInfo.InvariantCulture),r.Attribute("y")?.Value);Assert.AreEqual("1",r.Attribute("height")?.Value);Assert.AreEqual(fill,r.Attribute("fill")?.Value);Assert.IsNull(r.Attribute("stroke"));}
    [TestMethod] [DataRow(19.5f,20)] [DataRow(20.5f,21)] [DataRow(21.5f,22)] [DataRow(-0.5f,0)] [DataRow(-1.5f,-1)] [DataRow(0.5f,1)]
    public void NativeHalfRoundingIsTowardPositiveInfinity(float shift,int expected)=>Assert.AreEqual(expected.ToString(System.Globalization.CultureInfo.InvariantCulture),Rect(Svg(World(1,0,0,1,shift,20),Pixel(0,0))).Attribute("x")?.Value);
    [TestMethod] public void WorldScaleDoesNotEnlargeDevicePixel(){var r=Rect(Svg(World(2,0,0,3,10,20),Pixel(2,3)));Assert.AreEqual("14",r.Attribute("x")?.Value);Assert.AreEqual("29",r.Attribute("y")?.Value);Assert.AreEqual("1",r.Attribute("height")?.Value);}
    [TestMethod] public void RotationMapsPosition(){var r=Rect(Svg(World(0,1,-1,0,20,10),Pixel(4,5)));Assert.AreEqual("15",r.Attribute("x")?.Value);Assert.AreEqual("14",r.Attribute("y")?.Value);}
    [TestMethod] public void ResolvesPendingIsotropicScaling(){var r=Rect(Svg(Record(17,7),Record(9,10,20),Record(11,40,30),Record(31,2,1,3,1),Pixel(2,4)));Assert.AreEqual("9",r.Attribute("x")?.Value);Assert.AreEqual("18",r.Attribute("y")?.Value);}
    [TestMethod] public void AppliesWindowViewportAndOrigins(){var r=Rect(Svg(Record(17,8),Record(9,10,20),Record(11,20,30),Record(12,4,5),Pixel(2,4)));Assert.AreEqual("8",r.Attribute("x")?.Value);Assert.AreEqual("11",r.Attribute("y")?.Value);}
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] public void TruncatedRecordsDoNotReadFollowingRecord(int count)=>Assert.AreEqual(0,Svg(Record(15,new[]{4,5,0x563412}.Take(count).ToArray()),Record(37,unchecked((int)0x80000008))).Elements().Count());
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] public void TruncatedPixelDoesNotConsumePendingMapping(int count){var s=Svg(Record(17,7),Record(9,10,20),Record(11,40,30),Record(15,new[]{4,5,0x563412}.Take(count).ToArray()),Record(31,2,1,3,1),Record(54,10,20));var l=s.Elements().Single();Assert.AreEqual("45",l.Attribute("x2")?.Value);Assert.AreEqual("90",l.Attribute("y2")?.Value);}
    [TestMethod] [DataRow(float.NaN)] [DataRow(float.PositiveInfinity)] [DataRow(float.MaxValue)] public void InvalidDevicePositionsAreNotEmitted(float shift)=>Assert.AreEqual(0,Svg(World(1,0,0,1,shift,0),Pixel()).Elements().Count());
    [TestMethod] public void PixelDoesNotUseSelectedPenOrBrush(){var r=Rect(Svg(Record(37,unchecked((int)0x80000008)),Record(37,unchecked((int)0x80000005)),Pixel()));Assert.AreEqual("#123456",r.Attribute("fill")?.Value);}
    [TestMethod] public void PixelPreservesLogicalCurrentPosition(){var s=Svg(Record(27,2,3),Pixel(),Record(54,8,9));var l=s.Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("2",l.Attribute("x1")?.Value);Assert.AreEqual("3",l.Attribute("y1")?.Value);}
    [TestMethod] public void PixelIsImmediateInsidePathAndDoesNotConsumeIt(){var s=Svg(Record(59),Record(27,2,3),Record(54,8,9),Pixel(),Record(60),Record(64,0,0,39,39));Assert.AreEqual(2,s.Elements().Count());Assert.AreEqual("M 2 3 L 8 9",s.Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);}
    [TestMethod] public void SelectedClipApplies()=>Assert.AreEqual("url(#clip1)",Rect(Svg(MetafileRegionClipFixtures.Region(),Pixel())).Attribute("clip-path")?.Value);
    [TestMethod] public void MetaregionApplies(){var r=Rect(Svg(MetafileRegionClipFixtures.Region(),Record(28),Pixel()));Assert.IsNotNull(r.Parent?.Attribute("mask"));}
    [TestMethod] public async Task HtmlEmbedsPixelWithoutMutatingSource(){var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Pixel()));var item=new HmiGraphicView{Name="Pixel",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var m=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(m.Success);Assert.AreEqual("#123456",Rect(XDocument.Parse(Uri.UnescapeDataString(m.Groups[1].Value)).Root!).Attribute("fill")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);}
}
