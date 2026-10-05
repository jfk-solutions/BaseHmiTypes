using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileDirectAffineShapeTests
{
    private static byte[] World(int variant){float[] m=variant switch{1=>new float[]{.70710677f,.70710677f,-.70710677f,.70710677f,20,-2},2=>new float[]{1,.5f,1,1,0,0},3=>new float[]{-1,.5f,.5f,1,28,0},_=>new float[]{0,1,-1,0,40,0}};return Record(35,m.Select(BitConverter.SingleToInt32Bits).ToArray());}
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static XElement Draw(XElement s)=>s.Elements().Single(e=>e.Name.LocalName!="defs");
    [TestMethod] [DataRow(43,0)] [DataRow(43,1)] [DataRow(43,2)] [DataRow(43,3)] [DataRow(42,0)] [DataRow(42,1)] [DataRow(42,2)] [DataRow(42,3)]
    public void DirectAffineShapeMatchesFullPathGeometry(int type,int variant){var shape=Record((uint)type,5,5,25,35);var direct=Draw(Svg(World(variant),shape));var path=Draw(Svg(World(variant),Record(59),shape,Record(60),Record(63,0,0,39,39)));Assert.AreEqual("path",direct.Name.LocalName);Assert.AreEqual((string?)path.Attribute("d"),(string?)direct.Attribute("d"));Assert.AreEqual(type==42?4:0,((string)direct.Attribute("d")!).Count(c=>c=='C'));}
    [TestMethod] [DataRow(43)] [DataRow(42)]
    public void DirectShapeRetainsSelectedPath(int type){var s=Svg(Record(59),Points(3),Record(60),World(0),Record((uint)type,5,5,25,35),Record(63,0,0,39,39));var draws=s.Elements().Where(e=>e.Name.LocalName!="defs").ToArray();Assert.AreEqual(2,draws.Length);Assert.AreEqual("M 5 5 L 35 5 L 20 35 Z",(string?)draws[1].Attribute("d"));}
    [TestMethod] [DataRow(43)] [DataRow(42)]
    public void DirectShapeDoesNotChangeLogicalDcPosition(int type){var s=Svg(Record(27,2,3),World(0),Record((uint)type,5,5,25,35),Record(54,4,5));var line=s.Elements().Last();Assert.AreEqual("37",(string?)line.Attribute("x1"));Assert.AreEqual("2",(string?)line.Attribute("y1"));}
    [TestMethod] [DataRow(43,0)] [DataRow(43,1)] [DataRow(43,2)] [DataRow(42,0)] [DataRow(42,1)] [DataRow(42,2)]
    public void DirectAffineShapeKeepsClipMaskAndMeta(int type,int mode){var r=new List<byte[]>{Record(mode==1?29u:30u,5,5,35,35)};if(mode==2)r.Add(Record(28));r.Add(World(0));r.Add(Record((uint)type,5,5,25,35));var draw=Draw(Svg(r.ToArray()));Assert.AreEqual(mode==0?"url(#clip1)":mode==1?"url(#mask1)":"url(#mask2)",(string?)draw.Attribute(mode==0?"clip-path":"mask"));Assert.AreEqual("path",(mode==2?draw.Elements().Single():draw).Name.LocalName);}
    [TestMethod] [DataRow(43)] [DataRow(42)]
    public void ReversedBoundsNormalizeBeforeAffineMapping(int type)=>Assert.AreEqual((string?)Draw(Svg(World(2),Record((uint)type,5,5,25,35))).Attribute("d"),(string?)Draw(Svg(World(2),Record((uint)type,25,35,5,5))).Attribute("d"));
    [TestMethod] [DataRow(43,"rect")] [DataRow(42,"ellipse")]
    public void AxisAlignedPrimitiveRepresentationRemains(int type,string tag)=>Assert.AreEqual(tag,Draw(Svg(Record((uint)type,5,5,25,35))).Name.LocalName);
    [TestMethod] [DataRow(43)] [DataRow(42)]
    public void TruncatedDirectShapeDoesNotReadNextRecord(int type)=>Assert.AreEqual("line",Draw(Svg(World(0),Record((uint)type,5,5,25),Record(54,4,5))).Name.LocalName);
    [TestMethod] public void RotatedRectangleIncludesAllCorners()=>Assert.AreEqual("M 35 25 L 35 5 L 5 5 L 5 25 Z",(string?)Draw(Svg(World(0),Record(43,5,5,25,35))).Attribute("d"));
    [TestMethod] public void ShearedRectangleIsNotDiagonalBoundingBox()=>Assert.AreEqual("M 30 17.5 L 10 7.5 L 40 37.5 L 60 47.5 Z",(string?)Draw(Svg(World(2),Record(43,5,5,25,35))).Attribute("d"));
}
