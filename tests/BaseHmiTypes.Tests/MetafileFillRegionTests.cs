using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
namespace BaseHmiTypes.Tests;
[TestClass] public class MetafileFillRegionTests
{
    private static byte[] Fill(int[][]? rectangles=null,int brush=1){rectangles??=new[]{new[]{4,5,20,25}};return Record(71,new[]{0,0,39,39,32+rectangles.Length*16,brush,32,1,rectangles.Length,rectangles.Length*16,0,0,39,39}.Concat(rectangles.SelectMany(r=>r)).ToArray());}
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(new[]{Record(39,1,0,0x563412,0)}.Concat(r).ToArray()),".emf")!).Root!;
    private static XElement Path(XElement s)=>s.Elements().Single(e=>e.Name.LocalName=="path");
    private static byte[] World(params float[] m)=>Record(35,m.Select(BitConverter.SingleToInt32Bits).ToArray());
    [TestMethod] public void SolidRegionUsesExplicitBrushWithoutStroke(){var p=Path(Svg(Fill()));Assert.AreEqual("M 4 5 L 20 5 L 20 25 L 4 25 Z",p.Attribute("d")?.Value);Assert.AreEqual("#123456",p.Attribute("fill")?.Value);Assert.AreEqual("none",p.Attribute("stroke")?.Value);Assert.AreEqual("nonzero",p.Attribute("fill-rule")?.Value);}
    [TestMethod] [DataRow(0,"#ffffff")] [DataRow(1,"#c0c0c0")] [DataRow(2,"#808080")] [DataRow(3,"#404040")] [DataRow(4,"#000000")]
    public void SupportsStockBrushes(int stock,string color)=>Assert.AreEqual(color,Path(Svg(Fill(brush:unchecked((int)(0x80000000u+(uint)stock))))).Attribute("fill")?.Value);
    [TestMethod] [DataRow(0)] [DataRow(99)] [DataRow(unchecked((int)0x80000005))] [DataRow(unchecked((int)0x80000007))]
    public void InvalidOrNullBrushDoesNotPaint(int brush)=>Assert.AreEqual(0,Svg(Fill(brush:brush)).Elements().Count());
    [TestMethod] public void ExplicitBrushDoesNotChangeSelectedBrush(){var s=Svg(Record(39,2,0,255,0),Record(37,2),Fill(),Record(43,1,1,3,3));Assert.AreEqual("#123456",Path(s).Attribute("fill")?.Value);Assert.AreEqual("#ff0000",s.Elements().Single(e=>e.Name.LocalName=="rect").Attribute("fill")?.Value);}
    [TestMethod] public void PenObjectCannotBeUsedAsBrush()=>Assert.AreEqual(0,Svg(Record(38,1,0,3,0,0x563412),Fill()).Elements().Count());
    [TestMethod] public void CompoundRegionIsAUnionRegardlessOfPolygonFillMode(){var p=Path(Svg(Record(19,1),Fill(new[]{new[]{2,3,12,13},new[]{8,9,20,21}})));Assert.AreEqual("nonzero",p.Attribute("fill-rule")?.Value);Assert.AreEqual("M 2 3 L 12 3 L 12 13 L 2 13 Z M 8 9 L 20 9 L 20 21 L 8 21 Z",p.Attribute("d")?.Value);}
    [TestMethod] [DataRow(0)] [DataRow(1)] public void EmptyAndDegenerateRegionsDoNotPaint(int kind)=>Assert.AreEqual(0,Svg(Fill(kind==0?Array.Empty<int[]>():new[]{new[]{4,5,4,25}})).Elements().Count());
    [TestMethod] public void TransformsEveryCorner(){var p=Path(Svg(World(0,1,-1,0,30,0),Fill()));Assert.AreEqual("M 25 4 L 25 20 L 5 20 L 5 4 Z",p.Attribute("d")?.Value);}
    [TestMethod] public void AppliesWorldThenWindowViewportMapping(){var p=Path(Svg(Record(17,8),Record(9,10,10),Record(11,20,30),Record(12,4,7),World(2,0,0,3,10,20),Fill()));Assert.AreEqual("M 40 112 L 104 112 L 104 292 L 40 292 Z",p.Attribute("d")?.Value);}
    [TestMethod] public void ResolvesPendingIsotropicScaling(){var p=Path(Svg(Record(17,7),Record(9,10,20),Record(11,40,30),Record(31,2,1,3,1),Fill()));Assert.AreEqual("M 18 22.5 L 90 22.5 L 90 112.5 L 18 112.5 Z",p.Attribute("d")?.Value);}
    [TestMethod] public void FillDoesNotChangeLogicalCurrentPoint(){var l=Svg(Record(27,2,3),Fill(),Record(54,8,9)).Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("2",l.Attribute("x1")?.Value);Assert.AreEqual("3",l.Attribute("y1")?.Value);}
    [TestMethod] [DataRow(false)] [DataRow(true)] public void DirectRegionFillDoesNotConsumePath(bool open){var records=new List<byte[]>{Record(59),Record(27,2,3),Record(54,8,9)};if(!open)records.Add(Record(60));records.Add(Fill());if(open)records.Add(Record(60));records.Add(Record(64,0,0,39,39));var paths=Svg(records.ToArray()).Elements().Where(e=>e.Name.LocalName=="path").ToArray();Assert.AreEqual(2,paths.Length);Assert.AreEqual("M 2 3 L 8 9",paths[1].Attribute("d")?.Value);}
    [TestMethod] public void DeviceClipAppliesWithoutReprojection(){var s=Svg(MetafileRegionClipFixtures.Region(),World(2,0,0,3,10,20),Fill());Assert.AreEqual("url(#clip1)",Path(s).Attribute("clip-path")?.Value);Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",s.Descendants().Single(e=>e.Name.LocalName=="clipPath").Elements().Single().Attribute("d")?.Value);}
    [TestMethod] public void MetaregionApplies(){var s=Svg(MetafileRegionClipFixtures.Region(),Record(28),Fill());Assert.IsNotNull(s.Elements().Single(e=>e.Name.LocalName=="g").Attribute("mask"));}
    [TestMethod] public void NonfiniteWorldGeometryIsNotEmitted()=>Assert.AreEqual(0,Svg(World(1,0,0,1,float.NaN,0),Fill()).Elements().Count());
    [TestMethod] public void TruncationsDoNotReadFollowingRecord(){var fill=Fill();for(var size=8;size<fill.Length;size+=4){var truncated=fill.Take(size).ToArray();System.Buffers.Binary.BinaryPrimitives.WriteInt32LittleEndian(truncated.AsSpan(4),size);Assert.AreEqual(0,Svg(truncated,Record(37,unchecked((int)0x80000008))).Elements().Count(),$"size={size}");}}
    [TestMethod] [DataRow(24,0)] [DataRow(24,int.MaxValue)] [DataRow(32,28)] [DataRow(36,2)] [DataRow(40,int.MaxValue)] [DataRow(44,12)] [DataRow(64,21)] [DataRow(68,26)]
    public void MalformedRegionsAreIgnoredAtomically(int offset,int value){var fill=MetafileRegionClipFixtures.Change(Fill(),offset,value);var s=Svg(Record(17,7),Record(9,10,20),Record(11,40,30),fill,Record(31,2,1,3,1),Record(54,10,20));var l=s.Elements().Single();Assert.AreEqual("line",l.Name.LocalName);Assert.AreEqual("45",l.Attribute("x2")?.Value);Assert.AreEqual("90",l.Attribute("y2")?.Value);}
}
