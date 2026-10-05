using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
using static BaseHmiTypes.Tests.MetafileRegionClipFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileMetaRegionTests
{
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static XElement Body(XElement s)=>s.Elements().Single(e=>e.Name.LocalName!="defs");
    private static XElement Mask(XElement s,string id)=>s.Descendants().Single(e=>e.Name.LocalName=="mask"&&(string?)e.Attribute("id")==id);
    private static byte[] Paint()=>Record(43,0,0,39,39);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void CapturesSelectedClipOrMaskAndClearsSelection(bool mask)
    {
        var s=Svg(Record(mask?29u:30u,5,5,25,35),Record(28),Paint());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));var draw=Body(s).Elements().Single();Assert.IsNull(draw.Attribute("mask"));Assert.IsNull(draw.Attribute("clip-path"));Assert.AreEqual(mask?"url(#mask1)":"url(#clip1)",(string?)Mask(s,"mask2").Elements().Single().Attribute(mask?"mask":"clip-path"));
    }
    [TestMethod] public void NoSelectedClipDoesNotCreateMetaRegion(){var s=Svg(Record(28),Paint());Assert.AreEqual("rect",Body(s).Name.LocalName);Assert.AreEqual(0,s.Descendants().Count(e=>e.Name.LocalName=="mask"));}
    [TestMethod] public void RepeatedMetaWithoutSelectionRetainsDefinition(){var s=Svg(Region(),Record(28),Record(28),Paint());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));Assert.AreEqual(1,s.Descendants().Count(e=>e.Name.LocalName=="mask"));}
    [TestMethod] public void OffsetWithoutNewSelectionDoesNotMoveMeta(){var s=Svg(Region(),Record(28),Record(26,10,0),Paint());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));Assert.IsFalse(s.Descendants().Any(e=>e.Attribute("transform")!=null));}
    [TestMethod] public void NullCopyDoesNotClearMeta(){var s=Svg(Region(),Record(28),Record(75,0,5),Paint());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));}
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void NewSelectionRemainsIndependentlyConstrained(int mode){var s=Svg(Region(),Record(28),Region(mode,new[]{new[]{15,5,35,35}}),Paint());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));Assert.IsNotNull(Body(s).Elements().Single().Attribute(mode==1||mode==5?"clip-path":"mask"));}
    [TestMethod] public void RepeatedMetaIntersectsOldMetaWithNewSelection(){var s=Svg(Region(),Record(28),Region(),Record(28),Paint());Assert.AreEqual("url(#mask4)",(string?)Body(s).Attribute("mask"));var m=Mask(s,"mask4");Assert.AreEqual("url(#mask2)",(string?)m.Elements().Single().Attribute("mask"));Assert.AreEqual("url(#clip3)",(string?)m.Descendants().Single(e=>e.Name.LocalName=="rect").Attribute("clip-path"));}
    [TestMethod] public void EmptySelectionProducesEmptyMeta(){var s=Svg(Region(rects:Array.Empty<int[]>()),Record(28),Record(75,0,5),Paint());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));Assert.AreEqual("",(string?)s.Descendants().Single(e=>e.Name.LocalName=="path").Attribute("d"));}
    [TestMethod] public void RestoreBeforeMetaRemovesMeta(){var s=Svg(Record(33),Region(),Record(28),Record(34,-1),Paint());Assert.AreEqual("rect",Body(s).Name.LocalName);Assert.IsNull(Body(s).Attribute("mask"));}
    [TestMethod] public void RestoreRetainsPriorMetaAndSelectedClip(){var s=Svg(Region(),Record(28),Region(),Record(33),Record(28),Record(34,-1),Paint());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));Assert.AreEqual("url(#clip3)",(string?)Body(s).Elements().Single().Attribute("clip-path"));}
    [TestMethod] public void MetaDoesNotMoveDcPoint(){var s=Svg(Record(27,1,2),Region(),Record(28),Record(54,8,9));var line=Body(s).Elements().Single();Assert.AreEqual("1",(string?)line.Attribute("x1"));Assert.AreEqual("2",(string?)line.Attribute("y1"));}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void MetaDoesNotConsumeSelectedOrOpenPath(bool open){var r=new List<byte[]>{Region(),Record(59),Points(3)};if(!open)r.Add(Record(60));r.Add(Record(28));if(open)r.Add(Record(60));r.Add(Record(64,0,0,39,39));Assert.AreEqual("M 5 5 L 35 5 L 20 35 Z",(string?)Body(Svg(r.ToArray())).Elements().Single().Attribute("d"));}
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)]
    public void MetaWrapsExistingDrawingFamilies(int kind){byte[][] draw=kind switch{0=>new[]{Paint()},1=>new[]{Record(42,0,0,39,39)},2=>new[]{Record(54,39,20)},3=>new[]{Points(3)},_=>new[]{Record(59),Points(3),Record(60),Record(64,0,0,39,39)}};var s=Svg(new[]{Region(),Record(28)}.Concat(draw).ToArray());Assert.AreEqual("url(#mask2)",(string?)Body(s).Attribute("mask"));Assert.AreEqual(1,Body(s).Elements().Count());}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HtmlPreservesMetaRegionSource(bool mask){var b=Emf(Record(mask?29u:30u,5,5,25,35),Record(28),Paint());var original=b.ToArray();var uri="data:image/emf;base64,"+Convert.ToBase64String(b);var item=new HmiGraphicView{Name="Meta",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);Assert.AreEqual("url(#mask2)",(string?)Body(XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!).Attribute("mask"));Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,b);}
}
