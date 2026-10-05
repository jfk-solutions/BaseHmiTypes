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
public class MetafileRectClipTests
{
    private static byte[] Clip(bool exclude,int l=5,int t=6,int r=35,int b=36)=>Record(exclude?29u:30u,l,t,r,b);
    private static byte[] WClip(bool exclude,short l=5,short t=6,short r=35,short b=36)=>WmfRecord(exclude?(ushort)0x415:(ushort)0x416,b,r,t,l);
    private static XElement Svg(byte[] bytes,bool wmf=false)=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,wmf?".wmf":".emf")!).Root!;
    private static XElement ESvg(params byte[][] r)=>Svg(Emf(r));
    private static XElement ClipPath(XElement svg)=>svg.Descendants().First(e=>e.Name.LocalName=="path");
    private static XElement Drawing(XElement svg)=>svg.Elements().Single(e=>e.Name.LocalName!="defs");
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public void EmfAndWmfUseNativeFieldOrderAndApplyClipping(bool wmf,bool exclude)
    {
        var svg=wmf?Svg(Wmf(WmfRecord(0x20c,40,40),WClip(exclude),WmfRecord(0x213,20,39)),true):ESvg(Clip(exclude),Record(54,39,20));Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",ClipPath(svg).Attribute("d")?.Value);Assert.AreEqual(exclude?"url(#mask1)":"url(#clip1)",Drawing(svg).Attribute(exclude?"mask":"clip-path")?.Value);Assert.AreEqual("nonzero",ClipPath(svg).Attribute("clip-rule")?.Value);
    }
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public void ReversedBoundsAreNormalized(bool wmf,bool exclude)
    {
        var svg=wmf?Svg(Wmf(WClip(exclude,35,36,5,6),WmfRecord(0x41b,39,39,0,0)),true):ESvg(Clip(exclude,35,36,5,6),Record(43,0,0,39,39));Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",ClipPath(svg).Attribute("d")?.Value);
    }
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public void EmptyRectangleDoesNotBecomeANonemptyRegion(bool exclude,bool zeroHeight)
    {
        var svg=ESvg(Clip(exclude,5,6,zeroHeight?35:5,zeroHeight?6:36),Record(54,39,20));Assert.AreEqual(string.Empty,ClipPath(svg).Attribute("d")?.Value);Assert.AreEqual(exclude?"url(#mask1)":"url(#clip1)",Drawing(svg).Attribute(exclude?"mask":"clip-path")?.Value);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void RectangleClipDoesNotChangeDcPoint(bool exclude){var line=Drawing(ESvg(Record(27,1,2),Clip(exclude),Record(54,8,9)));Assert.AreEqual("1",line.Attribute("x1")?.Value);Assert.AreEqual("2",line.Attribute("y1")?.Value);}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void RectangleClipDoesNotConsumeSelectedPath(bool exclude)=>Assert.AreEqual("M 5 5 L 35 5 L 20 35 Z",Drawing(ESvg(Record(59),Points(3),Record(60),Clip(exclude),Record(64,0,0,39,39))).Attribute("d")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void RectangleClipDoesNotModifyOpenPath(bool exclude)=>Assert.AreEqual("M 5 5 L 35 5 L 20 35 Z",Drawing(ESvg(Record(59),Points(3),Clip(exclude),Record(60),Record(64,0,0,39,39))).Attribute("d")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void RotatedClipTransformsEveryCorner(bool exclude)=>Assert.AreEqual("M 34 5 L 34 35 L 4 35 L 4 5 Z",ClipPath(ESvg(Record(35,0,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(-1),0,BitConverter.SingleToInt32Bits(40),0),Clip(exclude))).Attribute("d")?.Value);
    [TestMethod] public void ShearedClipIsNotItsBoundingRectangle()=>Assert.AreEqual("M 5 8.5 L 35 23.5 L 35 53.5 L 5 38.5 Z",ClipPath(ESvg(Record(35,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(.5f),0,BitConverter.SingleToInt32Bits(1),0,0),Clip(false))).Attribute("d")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void ViewportMappingTransformsClip(bool exclude)=>Assert.AreEqual("M 14 25 L 74 25 L 74 115 L 14 115 Z",ClipPath(ESvg(Record(9,10,10),Record(11,20,30),Record(12,4,7),Clip(exclude))).Attribute("d")?.Value);
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public void RectangleCombinesWithExistingClipOrMask(bool exclude,bool mask)
    {
        var r=new List<byte[]>{Record(59),Points(3),Record(60),Record(67,5)};if(mask)r.AddRange(new[]{Record(59),Points(3),Record(60),Record(67,1)});r.AddRange(new[]{Clip(exclude),Record(43,0,0,39,39)});var svg=ESvg(r.ToArray());var latest=svg.Descendants().Last(e=>e.Name.LocalName=="mask");Assert.IsTrue(latest.Descendants().Any(e=>e.Attribute(mask?"mask":"clip-path")?.Value==(mask?"url(#mask2)":"url(#clip1)")));Assert.AreEqual(mask?"url(#mask3)":"url(#mask2)",Drawing(svg).Attribute("mask")?.Value);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void SaveRestoreReturnsToUnclippedState(bool exclude){var shape=Drawing(ESvg(Record(33),Clip(exclude),Record(34,-1),Record(43,0,0,39,39)));Assert.IsNull(shape.Attribute("clip-path"));Assert.IsNull(shape.Attribute("mask"));}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void LaterMappingDoesNotMoveExistingClip(bool exclude){var svg=ESvg(Clip(exclude),Record(12,10,20),Record(43,0,0,39,39));Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",ClipPath(svg).Attribute("d")?.Value);Assert.AreEqual("10",Drawing(svg).Attribute("x")?.Value);}
    [TestMethod] [DataRow(false,0)] [DataRow(false,1)] [DataRow(false,2)] [DataRow(false,3)] [DataRow(true,0)] [DataRow(true,1)] [DataRow(true,2)] [DataRow(true,3)]
    public void TruncatedEmfDoesNotReadFollowingRecord(bool exclude,int count){var svg=ESvg(Record(exclude?29u:30u,Enumerable.Repeat(5,count).ToArray()),Record(54,39,20));Assert.AreEqual(0,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"||e.Name.LocalName=="mask"));Assert.IsNull(Drawing(svg).Attribute("clip-path"));Assert.IsNull(Drawing(svg).Attribute("mask"));}
    [TestMethod] [DataRow(false,0)] [DataRow(false,1)] [DataRow(false,2)] [DataRow(false,3)] [DataRow(true,0)] [DataRow(true,1)] [DataRow(true,2)] [DataRow(true,3)]
    public void TruncatedWmfDoesNotReadFollowingRecord(bool exclude,int count){var svg=Svg(Wmf(WmfRecord(exclude?(ushort)0x415:(ushort)0x416,Enumerable.Repeat((short)5,count).ToArray()),WmfRecord(0x213,20,39)),true);Assert.AreEqual(0,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"||e.Name.LocalName=="mask"));}
    [TestMethod] public void WmfExclusionMaskUsesFinalInferredNegativeViewport()
    {
        var svg=Svg(Wmf(WClip(true,-20,-20,-10,-10),WmfRecord(0x41b,30,30,-30,-30)),true);var mask=svg.Descendants().Single(e=>e.Name.LocalName=="mask");Assert.AreEqual("-30",mask.Attribute("x")?.Value);Assert.AreEqual("-30",mask.Attribute("y")?.Value);Assert.AreEqual("60",mask.Attribute("width")?.Value);Assert.IsFalse(svg.ToString().Contains("__METAFILE_CLIP_VIEWPORT__"));
    }
    [TestMethod] public void WmfExclusionMaskUsesLaterExplicitViewport(){var svg=Svg(Wmf(WClip(true),WmfRecord(0x20b,-10,-20),WmfRecord(0x20c,50,60),WmfRecord(0x213,20,39)),true);var mask=svg.Descendants().Single(e=>e.Name.LocalName=="mask");Assert.AreEqual("-20",mask.Attribute("x")?.Value);Assert.AreEqual("-10",mask.Attribute("y")?.Value);Assert.AreEqual("60",mask.Attribute("width")?.Value);Assert.AreEqual("50",mask.Attribute("height")?.Value);}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void WmfMirroringRetainsClipDefinitions(bool exclude){var svg=Svg(Wmf(WmfRecord(0x20c,-40,40),WClip(exclude),WmfRecord(0x213,20,39)),true);Assert.AreEqual("g",Drawing(svg).Name.LocalName);Assert.AreEqual(exclude?"url(#mask1)":"url(#clip1)",Drawing(svg).Elements().Single().Attribute(exclude?"mask":"clip-path")?.Value);}
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public async Task HtmlRendersRectangleClipWithoutSourceMutation(bool wmf,bool exclude)
    {
        var bytes=wmf?Wmf(WmfRecord(0x20c,40,40),WClip(exclude),WmfRecord(0x41b,39,39,0,0)):Emf(Clip(exclude),Record(43,0,0,39,39));var original=bytes.ToArray();var uri="data:image/"+(wmf?"wmf":"emf")+";base64,"+Convert.ToBase64String(bytes);var item=new HmiGraphicView{Name="Clip",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);StringAssert.Contains(Uri.UnescapeDataString(match.Groups[1].Value),exclude?"url(#mask1)":"url(#clip1)");Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
