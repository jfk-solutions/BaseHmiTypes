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
using static BaseHmiTypes.Tests.MetafileRegionClipFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileOffsetClipTests
{
    private static XElement Svg(byte[] b,bool wmf=false)=>XDocument.Parse(new MetafileToSvgRenderer().Render(b,wmf?".wmf":".emf")!).Root!;
    private static XElement ESvg(params byte[][] records)=>Svg(Emf(records));
    private static XElement Drawing(XElement s)=>s.Elements().Single(e=>e.Name.LocalName!="defs");
    private static XElement LastMask(XElement s)=>s.Descendants().Last(e=>e.Name.LocalName=="mask");
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public void EmfAndWmfOffsetSelectedClipOrMask(bool wmf,bool mask)
    {
        var s=wmf?Svg(Wmf(WmfRecord(0x20c,40,40),WmfRecord(mask?(ushort)0x415:(ushort)0x416,35,35,5,5),WmfRecord(0x220,-5,10),WmfRecord(0x41b,39,39,0,0)),true):ESvg(Record(mask?29u:30u,5,5,35,35),Record(26,10,-5),Record(43,0,0,39,39));Assert.AreEqual("url(#mask2)",Drawing(s).Attribute("mask")?.Value);var m=LastMask(s);Assert.AreEqual("translate(10 -5)",m.Elements().Single().Attribute("transform")?.Value);Assert.AreEqual(mask?"url(#mask1)":"url(#clip1)",m.Descendants().Single(e=>e.Name.LocalName=="rect").Attribute(mask?"mask":"clip-path")?.Value);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void OffsetWithoutSelectedClipDoesNotCreateARegion(bool wmf){var s=wmf?Svg(Wmf(WmfRecord(0x220,2,1),WmfRecord(0x213,20,39)),true):ESvg(Record(26,1,2),Record(54,39,20));Assert.AreEqual(0,s.Descendants().Count(e=>e.Name.LocalName=="mask"));Assert.IsNull(Drawing(s).Attribute("mask"));}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void ZeroOffsetPreservesExistingDefinition(bool mask)=>Assert.AreEqual(mask?"url(#mask1)":"url(#clip1)",Drawing(ESvg(Record(mask?29u:30u,5,5,35,35),Record(26,0,0),Record(43,0,0,39,39))).Attribute(mask?"mask":"clip-path")?.Value);
    [TestMethod] [DataRow(0,"translate(10 -5)")] [DataRow(1,"translate(20 -15)")] [DataRow(2,"translate(5 10)")] [DataRow(3,"translate(20 -15)")] [DataRow(4,"translate(10 30)")]
    public void LogicalOffsetTransformsAsAVectorInNativeOrder(int variant,string expected)
    {
        var r=new List<byte[]>{Region()};if(variant==1)r.Add(Record(35,BitConverter.SingleToInt32Bits(2),0,0,BitConverter.SingleToInt32Bits(3),BitConverter.SingleToInt32Bits(10),BitConverter.SingleToInt32Bits(20)));if(variant==2||variant==4)r.Add(Record(35,0,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(-1),0,BitConverter.SingleToInt32Bits(40),0));if(variant>=3)r.AddRange(new[]{Record(17,8),Record(9,10,10),Record(11,20,30),Record(10,3,4),Record(12,10,20)});r.Add(Record(26,10,-5));Assert.AreEqual(expected,LastMask(ESvg(r.ToArray())).Elements().Single().Attribute("transform")?.Value);
    }
    [TestMethod] public void HugeWorldTranslationDoesNotCancelSmallOffset(){var s=ESvg(Region(),Record(35,BitConverter.SingleToInt32Bits(1),0,0,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(float.MaxValue),BitConverter.SingleToInt32Bits(float.MaxValue)),Record(26,1,2));Assert.AreEqual("translate(1 2)",LastMask(s).Elements().Single().Attribute("transform")?.Value);}
    [TestMethod] public void OffsetDoesNotMoveDcPoint(){var draw=Drawing(ESvg(Record(27,1,2),Region(),Record(26,10,-5),Record(54,8,9)));Assert.AreEqual("1",draw.Attribute("x1")?.Value);Assert.AreEqual("2",draw.Attribute("y1")?.Value);}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void OffsetRetainsSelectedOrOpenPath(bool open){var r=new List<byte[]>{Region(),Record(59),Points(3)};if(!open)r.Add(Record(60));r.Add(Record(26,10,-5));if(open)r.Add(Record(60));r.Add(Record(64,0,0,39,39));Assert.AreEqual("M 5 5 L 35 5 L 20 35 Z",Drawing(ESvg(r.ToArray())).Attribute("d")?.Value);}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void SaveRestoreReturnsToUnmovedClipOrMask(bool mask)=>Assert.AreEqual(mask?"url(#mask1)":"url(#clip1)",Drawing(ESvg(Record(mask?29u:30u,5,5,35,35),Record(33),Record(26,10,-5),Record(34,-1),Record(43,0,0,39,39))).Attribute(mask?"mask":"clip-path")?.Value);
    [TestMethod] public void SubsequentCombinationUsesMovedMask(){var s=ESvg(Region(),Record(26,10,-5),Record(30,0,0,39,39),Record(43,0,0,39,39));Assert.AreEqual("url(#mask3)",Drawing(s).Attribute("mask")?.Value);Assert.IsTrue(LastMask(s).Descendants().Any(e=>e.Attribute("mask")?.Value=="url(#mask2)"));}
    [TestMethod] [DataRow(false,0)] [DataRow(false,1)] [DataRow(true,0)] [DataRow(true,1)]
    public void TruncatedEmfOrWmfOffsetDoesNotReadNextRecord(bool wmf,int count){var s=wmf?Svg(Wmf(WmfRecord(0x416,35,35,5,5),WmfRecord(0x220,Enumerable.Repeat((short)5,count).ToArray()),WmfRecord(0x41b,39,39,0,0)),true):ESvg(Region(),Record(26,Enumerable.Repeat(5,count).ToArray()),Record(43,0,0,39,39));Assert.AreEqual("url(#clip1)",Drawing(s).Attribute("clip-path")?.Value);Assert.AreEqual(0,s.Descendants().Count(e=>e.Name.LocalName=="mask"));}
    [TestMethod] [DataRow(0x7fc00000)] [DataRow(0x7f800000)]
    public void NonfiniteMappedOffsetLeavesRegionUnchanged(int bits)=>Assert.AreEqual(0,ESvg(Region(),Record(35,bits,0,0,BitConverter.SingleToInt32Bits(1),0,0),Record(26,1,2)).Descendants().Count(e=>e.Name.LocalName=="mask"));
    [TestMethod] public void MaskDomainIncludesGeometryMovedInFromOutsideViewport()
    {
        var s=ESvg(Region(rects:new[]{new[]{45,5,65,35}}),Region(1,new[]{new[]{45,5,65,35}}),Record(26,-40,0));foreach(var m in s.Descendants().Where(e=>e.Name.LocalName=="mask")){Assert.AreEqual("-40",m.Attribute("x")?.Value);Assert.AreEqual("120",m.Attribute("width")?.Value);}Assert.IsFalse(s.ToString().Contains("__METAFILE_"));
    }
    [TestMethod] public void DefaultCapturedRegionDoesNotExpandWithMaskResources()
    {
        var s=ESvg(Record(29,5,5,35,35),Record(26,10,0));var first=s.Descendants().First(e=>e.Name.LocalName=="mask");Assert.AreEqual("60",first.Attribute("width")?.Value);var previous=first.Elements().First();Assert.AreEqual("0",previous.Attribute("x")?.Value);Assert.AreEqual("40",previous.Attribute("width")?.Value);
    }
    [TestMethod] public void DomainCoversNonchronologicalSaveRestoreOffsetChains()
    {
        var rects=new[]{new[]{-95,5,-65,35}};var s=ESvg(Region(rects:rects),Region(1,rects),Record(33),Record(26,-50,0),Record(34,-1),Record(26,50,0),Record(33),Record(26,-50,0),Record(34,-1),Record(26,50,0));Assert.AreEqual("440",s.Descendants().First(e=>e.Name.LocalName=="mask").Attribute("width")?.Value);Assert.AreEqual("-200",LastMask(s).Attribute("x")?.Value);
    }
    [TestMethod] public void EmptyRegionRemainsSelectedAfterOffset()=>Assert.AreEqual("url(#mask2)",Drawing(ESvg(Region(rects:Array.Empty<int[]>()),Record(26,10,0),Record(43,0,0,39,39))).Attribute("mask")?.Value);
    [TestMethod] public void SignedExtremeOffsetsDoNotOverflowDomain(){var s=ESvg(Region(),Record(26,int.MinValue,int.MaxValue));Assert.AreEqual("-2147483648",LastMask(s).Attribute("x")?.Value);Assert.AreEqual("4294967336",LastMask(s).Attribute("width")?.Value);}
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public async Task HtmlRendersOffsetWithoutChangingSource(bool wmf,bool mask)
    {
        var b=wmf?Wmf(WmfRecord(0x20c,40,40),WmfRecord(mask?(ushort)0x415:(ushort)0x416,35,35,5,5),WmfRecord(0x220,-5,10),WmfRecord(0x41b,39,39,0,0)):Emf(Record(mask?29u:30u,5,5,35,35),Record(26,10,-5),Record(43,0,0,39,39));var original=b.ToArray();var uri="data:image/"+(wmf?"wmf":"emf")+";base64,"+Convert.ToBase64String(b);var item=new HmiGraphicView{Name="Offset",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);Assert.AreEqual("url(#mask2)",Drawing(XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!).Attribute("mask")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,b);
    }
}
