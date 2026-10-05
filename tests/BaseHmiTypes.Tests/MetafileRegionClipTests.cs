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
public class MetafileRegionClipTests
{
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    private static XElement Drawing(XElement svg)=>svg.Elements().Single(e=>e.Name.LocalName!="defs");
    [TestMethod] public void MultipleRectanglesFormOneNonzeroRegion()
    {
        var svg=Svg(Record(19,1),Region(rects:new[]{new[]{5,5,15,35},new[]{25,5,35,35}}),Record(43,0,0,39,39));var path=svg.Descendants().Single(e=>e.Name.LocalName=="path");Assert.AreEqual("M 5 5 L 15 5 L 15 35 L 5 35 Z M 25 5 L 35 5 L 35 35 L 25 35 Z",path.Attribute("d")?.Value);Assert.AreEqual("nonzero",path.Attribute("clip-rule")?.Value);Assert.AreEqual("url(#clip1)",Drawing(svg).Attribute("clip-path")?.Value);
    }
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void AllModesCombineWithSelectedRegion(int mode)
    {
        var svg=Svg(Region(rects:new[]{new[]{5,5,25,35}}),Region(mode,new[]{new[]{15,5,35,35}}),Record(43,0,0,39,39));Assert.AreEqual(mode==5?"url(#clip2)":"url(#mask2)",Drawing(svg).Attribute(mode==5?"clip-path":"mask")?.Value);
    }
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void EmptyRegionIsNotANullReset(int mode)
    {
        var svg=Svg(Region(),Region(mode,Array.Empty<int[]>()),Record(43,0,0,39,39));Assert.AreEqual(mode==5?"url(#clip2)":"url(#mask2)",Drawing(svg).Attribute(mode==5?"clip-path":"mask")?.Value);Assert.AreEqual(string.Empty,svg.Descendants().Last(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void NullCopyResetsClipAndMask(bool mask)
    {
        var r=new List<byte[]>{Region()};if(mask)r.Add(Region(4));r.AddRange(new[]{Record(75,0,5),Record(43,0,0,39,39)});var draw=Drawing(Svg(r.ToArray()));Assert.IsNull(draw.Attribute("clip-path"));Assert.IsNull(draw.Attribute("mask"));
    }
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(6)]
    public void InvalidNullRequestLeavesRegionUnchanged(int mode)=>Assert.AreEqual("url(#clip1)",Drawing(Svg(Region(),Record(75,0,mode),Record(43,0,0,39,39))).Attribute("clip-path")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void RegionGeometryIgnoresWorldAndWindowTransforms(bool world)
    {
        var r=world?new[]{Record(35,BitConverter.SingleToInt32Bits(2),0,0,BitConverter.SingleToInt32Bits(3),BitConverter.SingleToInt32Bits(10),BitConverter.SingleToInt32Bits(20)),Region()}:new[]{Record(9,10,10),Record(11,20,30),Record(12,4,7),Region()};Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",Svg(r).Descendants().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
    }
    [TestMethod] public void RegionBoundsAreNotDrawnInsteadOfRectangles()=>Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",Svg(Change(Region(),32,int.MinValue)).Descendants().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
    [TestMethod] public void UnknownRectangleBufferSizeIsAccepted()=>Assert.AreEqual("url(#clip1)",Drawing(Svg(Change(Region(),28,0),Record(43,0,0,39,39))).Attribute("clip-path")?.Value);
    [TestMethod] public void ZeroAreaRectangleIsEmptyGeometry()=>Assert.AreEqual(string.Empty,Svg(Region(rects:new[]{new[]{5,5,5,35}})).Descendants().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void RegionOperationsPreserveConstructedAndSelectedPath(bool open)
    {
        var r=new List<byte[]>{Record(59),Points(3)};if(!open)r.Add(Record(60));r.Add(Region());if(open)r.Add(Record(60));r.Add(Record(64,0,0,39,39));Assert.AreEqual("M 5 5 L 35 5 L 20 35 Z",Drawing(Svg(r.ToArray())).Attribute("d")?.Value);
    }
    [TestMethod] public void RegionSelectionDoesNotChangeDcPoint(){var draw=Drawing(Svg(Record(27,1,2),Region(),Record(54,8,9)));Assert.AreEqual("1",draw.Attribute("x1")?.Value);Assert.AreEqual("2",draw.Attribute("y1")?.Value);}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void SaveRestorePreservesStateAcrossNullReset(bool mask)
    {
        var r=new List<byte[]>{Region()};if(mask)r.Add(Region(4));r.AddRange(new[]{Record(33),Record(75,0,5),Record(34,-1),Record(43,0,0,39,39)});Assert.AreEqual(mask?"url(#mask2)":"url(#clip1)",Drawing(Svg(r.ToArray())).Attribute(mask?"mask":"clip-path")?.Value);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void RegionCombinesWithExistingPathOrRectangleClip(bool path)
    {
        var r=path?new[]{Record(59),Points(3),Record(60),Record(67,5),Region(1),Record(43,0,0,39,39)}:new[]{Record(30,5,5,35,35),Region(1),Record(43,0,0,39,39)};Assert.AreEqual("url(#mask2)",Drawing(Svg(r)).Attribute("mask")?.Value);
    }
    [TestMethod] [DataRow(0)] [DataRow(1)]
    public void TruncatedFixedFieldsDoNotReadNextRecord(int count)=>Assert.AreEqual("url(#clip1)",Drawing(Svg(Region(),Record(75,Enumerable.Repeat(0,count).ToArray()),Record(43,0,0,39,39))).Attribute("clip-path")?.Value);
    [TestMethod] [DataRow(8,-1)] [DataRow(8,31)] [DataRow(8,49)] [DataRow(12,0)] [DataRow(12,6)] [DataRow(16,31)] [DataRow(16,36)] [DataRow(20,0)] [DataRow(20,2)] [DataRow(24,2)] [DataRow(24,-1)] [DataRow(28,15)] [DataRow(28,-1)] [DataRow(48,36)]
    public void MalformedRegionLeavesPreviousStateUntouched(int offset,int value)
    {
        var svg=Svg(Region(),Change(Region(),offset,value),Record(43,0,0,39,39));Assert.AreEqual(1,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"));Assert.AreEqual("url(#clip1)",Drawing(svg).Attribute("clip-path")?.Value);
    }
    [TestMethod] public void ValidSelectionAfterResetKeepsUniqueDefinitionIds()=>Assert.AreEqual("url(#clip2)",Drawing(Svg(Region(),Record(75,0,5),Region(),Record(43,0,0,39,39))).Attribute("clip-path")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HtmlRendersCompoundRegionAndResetWithoutChangingSource(bool reset)
    {
        var r=new List<byte[]>{Region(rects:new[]{new[]{5,5,15,35},new[]{25,5,35,35}})};if(reset)r.Add(Record(75,0,5));r.Add(Record(43,0,0,39,39));var bytes=Emf(r.ToArray());var original=bytes.ToArray();var uri="data:image/emf;base64,"+Convert.ToBase64String(bytes);var item=new HmiGraphicView{Name="Region",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);var draw=Drawing(XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!);Assert.AreEqual(reset?null:"url(#clip1)",draw.Attribute("clip-path")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
