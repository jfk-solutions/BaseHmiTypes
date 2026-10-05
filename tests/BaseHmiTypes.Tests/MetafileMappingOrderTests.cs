using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileMappingOrderTests
{
    private static byte[][] Mapping(int variant)
    {
        float[] m=variant switch{1=>new float[]{2,0,0,3,10,20},2=>new float[]{0,1,-1,0,40,0},3=>new float[]{1,.5f,1,1,0,0},4=>new float[]{-1,0,0,1,40,0},_=>new float[]{1,0,0,1,0,0}};
        return new[]{Record(35,m.Select(BitConverter.SingleToInt32Bits).ToArray()),Record(9,10,10),Record(11,variant==4?-20:20,30),Record(10,3,4),Record(12,10,20)};
    }
    private static XElement Svg(IEnumerable<byte[]> r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r.ToArray()),".emf")!).Root!;
    private static XElement Draw(XElement s)=>s.Elements().Single(e=>e.Name.LocalName!="defs");
    [TestMethod] [DataRow(0,"8","17","12","23")] [DataRow(1,"32","95","40","113")] [DataRow(2,"78","14","74","20")] [DataRow(3,"14","20","22","29")] [DataRow(4,"-60","17","-56","23")]
    public void LinePointsMatchNativeWorldThenPageMapping(int variant,string x1,string y1,string x2,string y2){var d=Draw(Svg(Mapping(variant).Concat(new[]{Record(27,2,3),Record(54,4,5)})));Assert.AreEqual(x1,(string?)d.Attribute("x1"));Assert.AreEqual(y1,(string?)d.Attribute("y1"));Assert.AreEqual(x2,(string?)d.Attribute("x2"));Assert.AreEqual(y2,(string?)d.Attribute("y2"));}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void BothPointArrayWidthsUseSameOrder(bool shortPoints){var d=Draw(Svg(Mapping(1).Append(Points(shortPoints?87u:4u,new[]{2,3,4,5}))));Assert.AreEqual("32,95 40,113",(string?)d.Attribute("points"));}
    [TestMethod] [DataRow(43)] [DataRow(42)]
    public void ShapePathUsesMappedCoordinates(int type){var d=Draw(Svg(Mapping(1).Concat(new[]{Record(59),Record((uint)type,2,3,4,5),Record(60),Record(64,0,0,39,39)})));var path=(string?)d.Attribute("d");Assert.IsTrue(path!.StartsWith(type==43?"M 40 95":"M 40 104",StringComparison.Ordinal));}
    [TestMethod] [DataRow(29)] [DataRow(30)]
    public void ClipRectangleMapsAllCornersInCorrectOrder(int type){var s=Svg(Mapping(1).Concat(new[]{Record((uint)type,2,3,4,5),Record(54,4,5)}));var path=s.Descendants().Single(e=>e.Name.LocalName=="path");Assert.AreEqual("M 32 95 L 40 95 L 40 113 L 32 113 Z",(string?)path.Attribute("d"));}
    [TestMethod] public void SaveRestorePreservesCombinedMapping(){var d=Draw(Svg(Mapping(1).Concat(new[]{Record(33),Record(35,BitConverter.SingleToInt32Bits(1),0,0,BitConverter.SingleToInt32Bits(1),0,0),Record(34,-1),Record(27,2,3),Record(54,4,5)})));Assert.AreEqual("32",(string?)d.Attribute("x1"));Assert.AreEqual("113",(string?)d.Attribute("y2"));}
    [TestMethod] public void LogicalDcPointIsRemappedAfterMappingChanges(){var d=Draw(Svg(new[]{Record(27,2,3)}.Concat(Mapping(1)).Append(Record(54,4,5))));Assert.AreEqual("32",(string?)d.Attribute("x1"));Assert.AreEqual("95",(string?)d.Attribute("y1"));Assert.AreEqual("40",(string?)d.Attribute("x2"));}
    [TestMethod] public void BezierControlsUseSameCombinedMapping(){var d=Draw(Svg(Mapping(1).Append(Points(2,new[]{2,3,4,5,6,7,8,9}))));Assert.AreEqual("M 32 95 C 40 113 48 131 56 149",(string?)d.Attribute("d"));}
    private static byte[][] Reset()=>new[]{Record(35,BitConverter.SingleToInt32Bits(1),0,0,BitConverter.SingleToInt32Bits(1),0,0),Record(9,1,1),Record(11,1,1),Record(10,0,0),Record(12,0,0)};
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)] [DataRow(6)] [DataRow(7)] [DataRow(8)] [DataRow(9)]
    public void PositionChangingRecordsRetainLogicalEndpoint(int kind)
    {
        byte[] source=kind switch{0=>Record(27,4,5),1=>Record(54,4,5),2=>Points(6,new[]{4,5}),3=>MetafileRegionClipFixtures.Change(Points(87,new[]{4,5}),0,89),4=>Points(5,new[]{2,3,3,4,4,5}),5=>MetafileRegionClipFixtures.Change(Points(87,new[]{2,3,3,4,4,5}),0,88),6=>MetafilePolyDrawFixtures.PolyDraw(56,new byte[]{6,2},new[]{2,3,4,5}),7=>MetafilePolyDrawFixtures.PolyDraw(92,new byte[]{6,2},new[]{2,3,4,5}),8=>Record(41,4,5,0,0,0),_=>Record(55,2,2,6,6,4,6,6,4)};
        var s=Svg(Mapping(1).Concat(new[]{Record(27,1,1),source}).Concat(Reset()).Append(Record(54,8,9)));var d=s.Elements().Last(e=>e.Name.LocalName!="defs");Assert.AreEqual(kind==9?"6":"4",(string?)d.Attribute("x1"));Assert.AreEqual(kind==9?"4":"5",(string?)d.Attribute("y1"));
    }
    [TestMethod] public void SaveRestoreRetainsLogicalPosition(){var d=Draw(Svg(Mapping(1).Concat(new[]{Record(27,2,3),Record(33),Record(27,30,30),Record(34,-1)}).Concat(Reset()).Append(Record(54,8,9))));Assert.AreEqual("2",(string?)d.Attribute("x1"));Assert.AreEqual("3",(string?)d.Attribute("y1"));}
    [TestMethod] public void MappingDoesNotRemapFrozenPathVertices(){var d=Draw(Svg(new[]{Record(59),Record(27,2,3),Record(54,4,5)}.Concat(Mapping(1)).Concat(new[]{Record(60),Record(64,0,0,39,39)})));Assert.AreEqual("M 2 3 L 4 5",(string?)d.Attribute("d"));}
    [TestMethod] public void DefaultLogicalPositionAlsoMaps(){var d=Draw(Svg(Mapping(1).Append(Record(54,4,5))));Assert.AreEqual("24",(string?)d.Attribute("x1"));Assert.AreEqual("68",(string?)d.Attribute("y1"));}
}
