using System.Xml.Linq;
using System.Text.RegularExpressions;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
namespace BaseHmiTypes.Tests;
[TestClass] public class MetafilePaintRegionTests
{
    private static byte[] Paint(int[][]? rectangles=null){rectangles??=new[]{new[]{4,5,20,25}};return Record(74,new[]{0,0,39,39,32+rectangles.Length*16,32,1,rectangles.Length,rectangles.Length*16,0,0,39,39}.Concat(rectangles.SelectMany(r=>r)).ToArray());}
    private static byte[] Brush(int color=0x563412,int style=0,int hatch=0)=>Record(39,1,style,color,hatch);
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static XElement Path(XElement s)=>s.Elements().Single(e=>e.Name.LocalName=="path");
    private static byte[] World(params float[] m)=>Record(35,m.Select(BitConverter.SingleToInt32Bits).ToArray());
    [TestMethod] public void DefaultRegionBrushIsStockWhite(){var p=Path(Svg(Paint()));Assert.AreEqual("#ffffff",p.Attribute("fill")?.Value);Assert.AreEqual("none",p.Attribute("stroke")?.Value);}
    [TestMethod] public void DefaultClosedShapeBrushIsStockWhite()=>Assert.AreEqual("#ffffff",Svg(Record(43,4,5,20,25)).Elements().Single().Attribute("fill")?.Value);
    [TestMethod] public void UsesSelectedBrushNotLastCreated(){var p=Path(Svg(Brush(),Record(37,1),Record(39,2,0,255,0),Paint()));Assert.AreEqual("#123456",p.Attribute("fill")?.Value);Assert.AreEqual("M 4 5 L 20 5 L 20 25 L 4 25 Z",p.Attribute("d")?.Value);Assert.AreEqual("none",p.Attribute("stroke")?.Value);}
    [TestMethod] [DataRow(0,"#ffffff")] [DataRow(1,"#c0c0c0")] [DataRow(2,"#808080")] [DataRow(3,"#404040")] [DataRow(4,"#000000")]
    public void SelectedStockBrushPaints(int stock,string color)=>Assert.AreEqual(color,Path(Svg(Record(37,unchecked((int)(0x80000000u+(uint)stock))),Paint())).Attribute("fill")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)] public void NullBrushDoesNotPaint(bool stock){var r=stock?new[]{Record(37,unchecked((int)0x80000005)),Paint()}:new[]{Brush(style:1),Record(37,1),Paint()};Assert.AreEqual(0,Svg(r).Elements().Count());}
    [TestMethod] public void InvalidSelectionDoesNotChangeBrush()=>Assert.AreEqual("#123456",Path(Svg(Brush(),Record(37,1),Record(37,99),Paint())).Attribute("fill")?.Value);
    [TestMethod] public void PenSelectionDoesNotChangeDefaultBrush()=>Assert.AreEqual("#ffffff",Path(Svg(Record(38,1,0,3,0,255),Record(37,1),Paint())).Attribute("fill")?.Value);
    [TestMethod] public void RestoreRestoresSelectedBrush(){var s=Svg(Record(33),Brush(),Record(37,1),Paint(),Record(34,-1),Paint());CollectionAssert.AreEqual(new[]{"#123456","#ffffff"},s.Elements().Select(e=>e.Attribute("fill")!.Value).ToArray());}
    [TestMethod] public void HatchUsesBackgroundAndDevicePhase(){var s=Svg(Brush(style:2,hatch:4),Record(37,1),Record(25,255),Record(13,3,-2),Paint());var p=s.Descendants().Single(e=>e.Name.LocalName=="pattern");Assert.AreEqual("3",p.Attribute("x")?.Value);Assert.AreEqual("6",p.Attribute("y")?.Value);Assert.AreEqual("#ff0000",p.Elements().First().Attribute("fill")?.Value);Assert.AreEqual("url(#hatch1)",Path(s).Attribute("fill")?.Value);}
    [TestMethod] public void PaintDoesNotChangeSelectedBrush(){var s=Svg(Brush(),Record(37,1),Paint(),Record(43,1,1,3,3));Assert.AreEqual("#123456",s.Elements().Last().Attribute("fill")?.Value);}
    [TestMethod] public void CompoundRegionIsAUnionRegardlessOfPolygonFillMode(){var p=Path(Svg(Record(19,1),Paint(new[]{new[]{2,3,12,13},new[]{8,9,20,21}})));Assert.AreEqual("nonzero",p.Attribute("fill-rule")?.Value);Assert.AreEqual("M 2 3 L 12 3 L 12 13 L 2 13 Z M 8 9 L 20 9 L 20 21 L 8 21 Z",p.Attribute("d")?.Value);}
    [TestMethod] [DataRow(0)] [DataRow(1)] public void EmptyAndDegenerateRegionsDoNotPaint(int kind)=>Assert.AreEqual(0,Svg(Paint(kind==0?Array.Empty<int[]>():new[]{new[]{4,5,4,25}})).Elements().Count());
    [TestMethod] public void TransformsEveryCorner()=>Assert.AreEqual("M 25 4 L 25 20 L 5 20 L 5 4 Z",Path(Svg(World(0,1,-1,0,30,0),Paint())).Attribute("d")?.Value);
    [TestMethod] public void AppliesWorldThenWindowViewportMapping()=>Assert.AreEqual("M 40 112 L 104 112 L 104 292 L 40 292 Z",Path(Svg(Record(17,8),Record(9,10,10),Record(11,20,30),Record(12,4,7),World(2,0,0,3,10,20),Paint())).Attribute("d")?.Value);
    [TestMethod] public void ResolvesPendingIsotropicScaling()=>Assert.AreEqual("M 18 22.5 L 90 22.5 L 90 112.5 L 18 112.5 Z",Path(Svg(Record(17,7),Record(9,10,20),Record(11,40,30),Record(31,2,1,3,1),Paint())).Attribute("d")?.Value);
    [TestMethod] public void PaintDoesNotChangeLogicalCurrentPoint(){var l=Svg(Record(27,2,3),Paint(),Record(54,8,9)).Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("2",l.Attribute("x1")?.Value);Assert.AreEqual("3",l.Attribute("y1")?.Value);}
    [TestMethod] [DataRow(false)] [DataRow(true)] public void PaintingDoesNotConsumePath(bool open){var r=new List<byte[]>{Record(59),Record(27,2,3),Record(54,8,9)};if(!open)r.Add(Record(60));r.Add(Paint());if(open)r.Add(Record(60));r.Add(Record(64,0,0,39,39));var paths=Svg(r.ToArray()).Elements().Where(e=>e.Name.LocalName=="path").ToArray();Assert.AreEqual(2,paths.Length);Assert.AreEqual("M 2 3 L 8 9",paths[1].Attribute("d")?.Value);}
    [TestMethod] public void DeviceClipAppliesWithoutReprojection(){var s=Svg(MetafileRegionClipFixtures.Region(),World(2,0,0,3,10,20),Paint());Assert.AreEqual("url(#clip1)",Path(s).Attribute("clip-path")?.Value);Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",s.Descendants().Single(e=>e.Name.LocalName=="clipPath").Elements().Single().Attribute("d")?.Value);}
    [TestMethod] public void MetaregionApplies()=>Assert.IsNotNull(Svg(MetafileRegionClipFixtures.Region(),Record(28),Paint()).Elements().Single(e=>e.Name.LocalName=="g").Attribute("mask"));
    [TestMethod] public void NonfiniteWorldGeometryIsNotEmitted()=>Assert.AreEqual(0,Svg(World(1,0,0,1,float.NaN,0),Paint()).Elements().Count());
    [TestMethod] public void TruncationsDoNotReadFollowingRecord(){var paint=Paint();for(var size=8;size<paint.Length;size+=4){var truncated=paint.Take(size).ToArray();System.Buffers.Binary.BinaryPrimitives.WriteInt32LittleEndian(truncated.AsSpan(4),size);Assert.AreEqual(0,Svg(truncated,Record(37,unchecked((int)0x80000008))).Elements().Count(),$"size={size}");}}
    [TestMethod] [DataRow(24,0)] [DataRow(24,int.MaxValue)] [DataRow(28,28)] [DataRow(32,2)] [DataRow(36,int.MaxValue)] [DataRow(40,12)] [DataRow(60,21)] [DataRow(64,26)]
    public void MalformedRegionsAreIgnoredAtomically(int offset,int value){var paint=MetafileRegionClipFixtures.Change(Paint(),offset,value);var s=Svg(Record(17,7),Record(9,10,20),Record(11,40,30),paint,Record(31,2,1,3,1),Record(54,10,20));var l=s.Elements().Single();Assert.AreEqual("line",l.Name.LocalName);Assert.AreEqual("45",l.Attribute("x2")?.Value);Assert.AreEqual("90",l.Attribute("y2")?.Value);}
    [TestMethod] public async Task HtmlPaintsRegionWithoutMutatingSource(){var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Brush(),Record(37,1),Paint()));var item=new HmiGraphicView{Name="PaintRegion",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var m=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(m.Success);Assert.AreEqual("#123456",Path(XDocument.Parse(Uri.UnescapeDataString(m.Groups[1].Value)).Root!).Attribute("fill")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);}
}
