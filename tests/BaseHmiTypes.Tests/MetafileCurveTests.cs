using System.Buffers.Binary;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
using static BaseHmiTypes.Tests.MetafileCurveFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileCurveTests
{
    private static XElement Svg(byte[] bytes)=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!).Root!;
    [TestMethod] [DataRow(2u)] [DataRow(5u)] [DataRow(6u)] [DataRow(85u)] [DataRow(88u)] [DataRow(89u)]
    public void DrawsDirectlyWithCurrentPenAndNoFill(uint type)
    {
        var bytes=Emf(Record(27,5,30),Curve(type));var original=bytes.ToArray();var path=Svg(bytes).Elements().Single();
        Assert.AreEqual("path",path.Name.LocalName);Assert.AreEqual(Path(type),path.Attribute("d")?.Value);Assert.AreEqual("none",path.Attribute("fill")?.Value);Assert.AreEqual("#000000",path.Attribute("stroke")?.Value);CollectionAssert.AreEqual(original,bytes);
    }
    [TestMethod] [DataRow(2u)] [DataRow(5u)] [DataRow(6u)] [DataRow(85u)] [DataRow(88u)] [DataRow(89u)]
    public void RecordsInsidePathIncludingInitialCurrentPosition(uint type)
        =>Assert.AreEqual(Path(type),Svg(Emf(Record(27,5,30),Record(59),Curve(type),Record(60),Record(64,0,0,39,39))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(2u)] [DataRow(5u)] [DataRow(6u)] [DataRow(85u)] [DataRow(88u)] [DataRow(89u)]
    public void UpdatesCurrentPositionOnlyForDrawTo(uint type)
    {
        var line=Svg(Emf(Record(27,5,30),Curve(type),Record(54,39,35))).Elements().Single(e=>e.Name.LocalName=="line");
        Assert.AreEqual(To(type)?"35":"5",line.Attribute("x1")?.Value);Assert.AreEqual("30",line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(2u)] [DataRow(5u)] [DataRow(6u)] [DataRow(85u)] [DataRow(88u)] [DataRow(89u)]
    public void UsesCurrentMapping(uint type)
        =>Assert.AreEqual(Line(type)?"M 14 97 L 34 37 L 74 97":"M 14 97 C 14 7 74 7 74 97",Svg(Emf(Record(17,8),Record(9,10,10),Record(11,20,30),Record(12,4,7),Record(27,5,30),Curve(type))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(2u)] [DataRow(5u)] [DataRow(6u)] [DataRow(85u)] [DataRow(88u)] [DataRow(89u)]
    public void MalformedArraysCannotDrawOrChangeCurrentPosition(uint type)
    {
        foreach(var count in new[]{0u,uint.MaxValue,100u})
        {
            var record=Curve(type);BinaryPrimitives.WriteUInt32LittleEndian(record.AsSpan(24),count);
            var svg=Svg(Emf(Record(27,5,30),record,Record(54,39,35)));Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("5",svg.Elements().Single().Attribute("x1")?.Value);
        }
        var partial=Curve(type);Array.Resize(ref partial,partial.Length-4);BinaryPrimitives.WriteUInt32LittleEndian(partial.AsSpan(4),(uint)partial.Length);
        Assert.AreEqual(0,Svg(Emf(partial)).Elements().Count());Assert.AreEqual(0,Svg(Emf(Record(type,0,0,39,39))).Elements().Count());
    }
    [TestMethod] [DataRow(2u)] [DataRow(5u)] [DataRow(85u)] [DataRow(88u)]
    public void RejectsIncompleteCubicGroups(uint type)
        =>Assert.AreEqual(0,Svg(Emf(Curve(type,new[]{5,30,5,0}))).Elements().Count());
    [TestMethod] [DataRow(2u,5u)] [DataRow(85u,88u)]
    public void IndependentCurveDoesNotMoveFollowingDrawToStart(uint ordinary,uint to)
    {
        var path=Svg(Emf(Record(27,5,30),Record(59),Curve(ordinary),Curve(to),Record(60),Record(64,0,0,39,39))).Elements().Single();
        Assert.AreEqual(Path(ordinary)+" "+Path(to),path.Attribute("d")?.Value);
    }
    [TestMethod] [DataRow(5u)] [DataRow(6u)] [DataRow(88u)] [DataRow(89u)]
    public void ConsecutiveDrawToRecordsStayConnected(uint type)
        =>Assert.AreEqual(Path(type)+" "+(Line(type)?"L 15 10 L 35 30":"C 5 0 35 0 35 30"),Svg(Emf(Record(27,5,30),Record(59),Curve(type),Curve(type),Record(60),Record(64,0,0,39,39))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(2u)] [DataRow(5u)] [DataRow(6u)] [DataRow(85u)] [DataRow(88u)] [DataRow(89u)]
    public async Task HtmlRendersWithoutChangingSource(uint type)
    {
        var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Record(27,5,30),Curve(type)));var item=new HmiGraphicView{Name="Curve",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        Assert.AreEqual(Path(type),XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Single().Attribute("d")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);
    }
}
