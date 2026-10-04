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
[TestClass]
public class MetafilePathLifecycleTests
{
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    [TestMethod] public void EndPathStopsCaptureWithoutDiscardingSelectedGeometry()
    {
        var svg=Svg(Record(59),Record(27,5,10),Record(54,35,10),Record(60),Record(54,35,30),Record(64,0,0,39,39));
        Assert.AreEqual("M 5 10 L 35 10",svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
        Assert.AreEqual("35",svg.Elements().Single(e=>e.Name.LocalName=="line").Attribute("x1")?.Value);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void AbortDiscardsOpenAndSelectedPathsButPreservesCurrentPoint(bool ended)
    {
        var records=new List<byte[]>{Record(59),Record(27,5,10),Record(54,35,10)};if(ended)records.Add(Record(60));records.AddRange(new[]{Record(68),Record(61),Record(64,0,0,39,39),Record(54,35,30)});
        var line=Svg(records.ToArray()).Elements().Single();Assert.AreEqual("line",line.Name.LocalName);Assert.AreEqual("35",line.Attribute("x1")?.Value);Assert.AreEqual("10",line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(62u)] [DataRow(63u)] [DataRow(64u)]
    public void PaintConsumesSelectedPathOnlyOnce(uint paint)
        =>Assert.AreEqual(1,Svg(Record(59),Points(3),Record(60),Record(paint,0,0,39,39),Record(paint,0,0,39,39)).Elements().Count());
    [TestMethod] [DataRow(62u)] [DataRow(63u)] [DataRow(64u)]
    public void PaintingAnOpenPathDoesNotConsumeItsConstruction(uint paint)
        =>Assert.AreEqual("M 5 10 L 35 10",Svg(Record(59),Record(27,5,10),Record(54,35,10),Record(paint,0,0,39,39),Record(60),Record(64,0,0,39,39)).Elements().Single().Attribute("d")?.Value);
    [TestMethod] public void NewBeginDiscardsPreviouslySelectedPath()
        =>Assert.AreEqual("M 5 30 L 35 30",Svg(Record(59),Record(27,5,10),Record(54,35,10),Record(60),Record(59),Record(27,5,30),Record(54,35,30),Record(60),Record(64,0,0,39,39)).Elements().Single().Attribute("d")?.Value);
    [TestMethod] public void EndWithoutConstructionDoesNotLoseSelectedPath()
        =>Assert.AreEqual(1,Svg(Record(59),Points(3),Record(60),Record(60),Record(64,0,0,39,39)).Elements().Count());
    [TestMethod] public void AbortPreventsStaleClipSelection()
        =>Assert.AreEqual(0,Svg(Record(59),Points(3),Record(60),Record(68),Record(67,1)).Descendants().Count());
    [TestMethod] public void AbortDoesNotRemoveAlreadySelectedClip()
    {
        var svg=Svg(Record(59),Points(3),Record(60),Record(67,1),Record(59),Points(4),Record(68),Record(59),Record(27,5,30),Record(54,35,30),Record(60),Record(64,0,0,39,39));
        Assert.AreEqual(1,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"));Assert.AreEqual("url(#clip1)",svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("clip-path")?.Value);
    }
    [TestMethod] public void RepeatedAbortWithoutPathDoesNotSuppressDrawing()
        =>Assert.AreEqual("line",Svg(Record(68),Record(68),Record(27,5,10),Record(54,35,10)).Elements().Single().Name.LocalName);
    [TestMethod] public void RestoreDcRestoresSelectedPathSnapshot()
        =>Assert.AreEqual("M 5 10 L 35 10",Svg(Record(59),Record(27,5,10),Record(54,35,10),Record(60),Record(33),Record(59),Record(27,8,8),Record(54,20,20),Record(60),Record(34,-1),Record(64,0,0,39,39)).Elements().Single().Attribute("d")?.Value);
    [TestMethod] public void RestoreDcRestoresOpenPathConstructionSnapshot()
        =>Assert.AreEqual("M 5 10 L 35 10",Svg(Record(59),Record(27,5,10),Record(54,35,10),Record(33),Record(54,35,30),Record(34,-1),Record(60),Record(64,0,0,39,39)).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HtmlReflectsLifecycleWithoutChangingSource(bool abort)
    {
        var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Record(59),Record(27,5,10),Record(54,35,10),Record(60),Record(abort?68u:60u),Record(54,35,30),Record(64,0,0,39,39)));
        var item=new HmiGraphicView{Name="Lifecycle",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        var svg=XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!;Assert.AreEqual(abort?1:2,svg.Elements().Count());Assert.AreEqual(uri,item.Source!.StaticValue);
    }
}
