using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileModifyTransformTests
{
    private static readonly float[] A={2,0,0,3,10,20},B={0,1,-1,0,40,0};
    private static byte[] World(float[] m)=>Record(35,m.Select(BitConverter.SingleToInt32Bits).ToArray());
    private static byte[] Modify(uint mode,float[]? m=null)=>Record(36,(m??B).Select(BitConverter.SingleToInt32Bits).Append(unchecked((int)mode)).ToArray());
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static XElement Draw(XElement s)=>s.Elements().Single(e=>e.Name.LocalName!="defs");
    private static void Original(XElement line){Assert.AreEqual("14",(string?)line.Attribute("x1"));Assert.AreEqual("29",(string?)line.Attribute("y1"));Assert.AreEqual("18",(string?)line.Attribute("x2"));Assert.AreEqual("35",(string?)line.Attribute("y2"));}
    [TestMethod] [DataRow(1,"2","3","4","5")] [DataRow(2,"84","26","80","32")] [DataRow(3,"11","14","5","18")] [DataRow(4,"37","2","35","4")]
    public void AllModesMatchNativeComposition(int mode,string x1,string y1,string x2,string y2){var d=Draw(Svg(Record(27,2,3),World(A),Modify((uint)mode),Record(54,4,5)));Assert.AreEqual(x1,(string?)d.Attribute("x1"));Assert.AreEqual(y1,(string?)d.Attribute("y1"));Assert.AreEqual(x2,(string?)d.Attribute("x2"));Assert.AreEqual(y2,(string?)d.Attribute("y2"));}
    [TestMethod] [DataRow(0u)] [DataRow(5u)] [DataRow(uint.MaxValue)]
    public void UnknownModeRetainsCurrentTransform(uint mode)=>Original(Draw(Svg(World(A),Modify(mode),Record(27,2,3),Record(54,4,5))));
    [TestMethod] public void IdentityIgnoresNonfiniteXform(){var d=Draw(Svg(World(A),Modify(1,new[]{float.NaN,float.PositiveInfinity,0,0,0,0}),Record(27,2,3),Record(54,4,5)));Assert.AreEqual("2",(string?)d.Attribute("x1"));Assert.AreEqual("5",(string?)d.Attribute("y2"));}
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void TruncatedSetDoesNotReadFollowingRecord(int count)=>Original(Draw(Svg(World(A),Record(35,B.Take(count).Select(BitConverter.SingleToInt32Bits).ToArray()),Record(27,2,3),Record(54,4,5))));
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)] [DataRow(6)]
    public void TruncatedModifyDoesNotReadFollowingRecord(int count)=>Original(Draw(Svg(World(A),Record(36,B.Take(count).Select(BitConverter.SingleToInt32Bits).ToArray()),Record(27,2,3),Record(54,4,5))));
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void SingularSetRetainsTransform(bool collinear)=>Original(Draw(Svg(World(A),World(collinear?new float[]{1,2,2,4,10,20}:new float[]{1,0,0,0,0,0}),Record(27,2,3),Record(54,4,5))));
    [TestMethod] [DataRow(2,false)] [DataRow(2,true)] [DataRow(3,false)] [DataRow(3,true)] [DataRow(4,false)] [DataRow(4,true)]
    public void SingularModifyRetainsTransform(int mode,bool collinear)=>Original(Draw(Svg(World(A),Modify((uint)mode,collinear?new float[]{1,2,2,4,10,20}:new float[]{1,0,0,0,0,0}),Record(27,2,3),Record(54,4,5))));
    [TestMethod] public void IdentityIgnoresSingularXform(){var d=Draw(Svg(World(A),Modify(1,new float[]{1,0,0,0,0,0}),Record(27,2,3),Record(54,4,5)));Assert.AreEqual("2",(string?)d.Attribute("x1"));Assert.AreEqual("5",(string?)d.Attribute("y2"));}
    [TestMethod] public void SaveRestoreRetainsPreviousComposition()=>Original(Draw(Svg(World(A),Record(33),Modify(2),Record(34,-1),Record(27,2,3),Record(54,4,5))));
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void ModificationDoesNotConsumeOrRemapRecordedPath(bool open){var r=new List<byte[]>{Record(59),Points(3)};if(!open)r.Add(Record(60));r.AddRange(new[]{World(A),Modify(2)});if(open)r.Add(Record(60));r.Add(Record(63,0,0,39,39));Assert.AreEqual("M 5 5 L 35 5 L 20 35 Z",(string?)Draw(Svg(r.ToArray())).Attribute("d"));}
    [TestMethod] public void ModificationDoesNotRemapSelectedDeviceClip(){var s=Svg(MetafileRegionClipFixtures.Region(),World(A),Modify(2),Record(54,4,5));Assert.AreEqual("url(#clip1)",(string?)Draw(s).Attribute("clip-path"));Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",(string?)s.Descendants().Single(e=>e.Name.LocalName=="path").Attribute("d"));}
}
