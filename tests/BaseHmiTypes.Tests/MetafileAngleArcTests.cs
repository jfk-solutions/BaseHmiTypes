using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileAngleArcTests
{
    private static byte[] Arc(float start=0,float sweep=90,int radius=15)=>Record(41,20,20,radius,BitConverter.SingleToInt32Bits(start),BitConverter.SingleToInt32Bits(sweep));
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    private static XElement Shape(params byte[][] records)=>Svg(records).Elements().Single(e=>e.Name.LocalName=="path");
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void DirectAndRecordedAngleArcConnectAndStroke(bool active)
    {
        var r=new List<byte[]>{Record(37,unchecked((int)0x80000000)),Record(27,1,2)};if(active)r.Add(Record(59));r.Add(Arc());if(active)r.AddRange(new[]{Record(60),Record(64,0,0,39,39)});var shape=Shape(r.ToArray());Assert.AreEqual("M 1 2 L 35 20 C 35 11.716 28.284 5 20 5",shape.Attribute("d")?.Value);Assert.AreEqual("none",shape.Attribute("fill")?.Value);
    }
    [TestMethod] [DataRow(90f,20,5,1)] [DataRow(-90f,20,35,1)] [DataRow(360f,35,20,4)] [DataRow(720f,35,20,8)] [DataRow(-450f,20,35,5)] [DataRow(0f,35,20,0)]
    public void SweepControlsRepeatedTurnsAndCurrentPosition(float sweep,int x,int y,int curves)
    {
        var svg=Svg(Record(27,1,2),Arc(sweep:sweep),Record(54,8,9));var path=svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")!.Value;Assert.AreEqual(curves,Regex.Matches(path,"C ").Count);var line=svg.Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual(x.ToString(),line.Attribute("x1")?.Value);Assert.AreEqual(y.ToString(),line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(90f)] [DataRow(-90f)] [DataRow(720f)]
    public void ArcDirectionDoesNotChangeAngleArc(float sweep)=>Assert.AreEqual(Shape(Arc(sweep:sweep)).Attribute("d")?.Value,Shape(Record(57,2),Arc(sweep:sweep)).Attribute("d")?.Value);
    [TestMethod] [DataRow(90f)] [DataRow(450f)] [DataRow(-270f)]
    public void StartAngleIsMeasuredCounterclockwise(float start)=>StringAssert.StartsWith(Shape(Arc(start)).Attribute("d")!.Value,"M 0 0 L 20 5 C");
    [TestMethod] public void ZeroRadiusStillConnectsAndMovesCurrentPosition()
    {
        Assert.AreEqual("M 1 2 L 20 20",Shape(Record(27,1,2),Arc(radius:0)).Attribute("d")?.Value);var line=Svg(Arc(radius:0),Record(54,8,9)).Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("20",line.Attribute("x1")?.Value);Assert.AreEqual("20",line.Attribute("y1")?.Value);
    }
    [TestMethod] public void UnsignedRadiusIsNotReadAsNegative()=>StringAssert.Contains(Shape(Arc(radius:-1,sweep:0)).Attribute("d")!.Value,"L 4294967315 20");
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void CurveControlsParticipateInAffineTransform(bool active)
    {
        var r=new List<byte[]>{Record(35,0,BitConverter.SingleToInt32Bits(1),BitConverter.SingleToInt32Bits(-1),0,BitConverter.SingleToInt32Bits(40),0)};if(active)r.Add(Record(59));r.Add(Arc());if(active)r.AddRange(new[]{Record(60),Record(64,0,0,39,39)});StringAssert.Contains(Shape(r.ToArray()).Attribute("d")!.Value,"L 20 35 C 28.284 35 35 28.284 35 20");
    }
    [TestMethod] public void ViewportMappingAppliesToAllControls()=>StringAssert.Contains(Shape(Record(9,10,10),Record(11,20,30),Record(12,4,7),Arc()).Attribute("d")!.Value,"L 74 67 C 74 42.147 60.569 22 44 22");
    [TestMethod] public void AbortDiscardsGeometryButPreservesCurrentPosition()
    {
        var svg=Svg(Record(59),Arc(),Record(68),Record(54,8,9));Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("20",svg.Elements().Single().Attribute("x1")?.Value);Assert.AreEqual("5",svg.Elements().Single().Attribute("y1")?.Value);
    }
    [TestMethod] public void ContinuesAfterClosedFigureFromDcPoint()=>StringAssert.Contains(Shape(Record(27,1,2),Record(59),Points(3),Arc(),Record(60),Record(64,0,0,39,39)).Attribute("d")!.Value,"Z M 1 2 L 35 20 C");
    [TestMethod] public void RecordedSubsequentLineContinuesFromArcEndpoint()=>StringAssert.EndsWith(Shape(Record(59),Arc(),Record(54,8,9),Record(60),Record(64,0,0,39,39)).Attribute("d")!.Value,"20 5 L 8 9");
    [TestMethod] public void SaveRestoreRestoresDcPoint()=>Assert.AreEqual("1",Svg(Record(27,1,2),Record(33),Arc(),Record(34,-1),Record(54,8,9)).Elements().Single(e=>e.Name.LocalName=="line").Attribute("x1")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void ActiveClipAndMaskApplyToDirectOutput(bool mask)
    {
        var r=new List<byte[]>{Record(59),Points(3),Record(60),Record(67,5)};if(mask)r.AddRange(new[]{Record(59),Points(3),Record(60),Record(67,1)});r.Add(Arc());Assert.AreEqual(mask?"url(#mask2)":"url(#clip1)",Shape(r.ToArray()).Attribute(mask?"mask":"clip-path")?.Value);
    }
    [TestMethod] public void AngleArcPathCanBeSelectedAsClip()=>Assert.AreEqual(1,Svg(Record(59),Arc(sweep:360),Record(60),Record(67,5),Record(43,0,0,39,39)).Descendants().Count(e=>e.Name.LocalName=="clipPath"));
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)]
    public void TruncatedFieldsDoNotReadFollowingRecord(int count)=>Assert.AreEqual(0,Svg(Record(41,Enumerable.Repeat(20,count).ToArray())).Elements().Count());
    [TestMethod] [DataRow(0x7fc00000,0)] [DataRow(0x7f800000,0)] [DataRow(0,0x7fc00000)] [DataRow(0,0x7f800000)] [DataRow(0,0x7f7fffff)]
    public void InvalidOrUnboundedAnglesDoNotChangeState(int startBits,int sweepBits)
    {
        var svg=Svg(Record(27,1,2),Record(59),Record(41,20,20,15,startBits,sweepBits),Record(60),Record(64,0,0,39,39),Record(54,8,9));Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("1",svg.Elements().Single().Attribute("x1")?.Value);Assert.AreEqual("2",svg.Elements().Single().Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HtmlRendersAngleArcWithoutChangingSource(bool active)
    {
        var r=new List<byte[]>();if(active)r.Add(Record(59));r.Add(Arc());if(active)r.AddRange(new[]{Record(60),Record(64,0,0,39,39)});var bytes=Emf(r.ToArray());var original=bytes.ToArray();var uri="data:image/emf;base64,"+Convert.ToBase64String(bytes);var item=new HmiGraphicView{Name="Angle",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);StringAssert.Contains(Uri.UnescapeDataString(match.Groups[1].Value),"L 35 20 C 35 11.716 28.284 5 20 5");Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
