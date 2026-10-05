using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
using static BaseHmiTypes.Tests.MetafilePolyDrawFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafileCloseFigureTests
{
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    private static string Path(params byte[][] records)=>Svg(records).Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")!.Value;
    private static byte[][] Open()=>new[]{Record(59),Record(27,5,5),Record(54,35,5),Record(54,35,35)};
    private static byte[][] Paint()=>new[]{Record(60),Record(64,0,0,39,39)};
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void ClosePreservesEndpointAndStartsNewFigure(bool coincident)
    {
        var records=Open().ToList();if(coincident)records.Add(Record(54,5,5));records.AddRange(new[]{Record(61),Record(54,5,35)});records.AddRange(Paint());
        StringAssert.EndsWith(Path(records.ToArray()),coincident?"Z M 5 5 L 5 35":"Z M 35 35 L 5 35");
    }
    [TestMethod] public void RepeatedCloseDoesNotAddGeometry()
        =>Assert.AreEqual("M 5 5 L 35 5 L 35 35 Z M 35 35 L 5 35",Path(Open().Concat(new[]{Record(61),Record(61),Record(54,5,35)}).Concat(Paint()).ToArray()));
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void EmptyAndMoveOnlyCloseProduceNoGeometry(bool move)
    {
        var records=new List<byte[]>{Record(59)};if(move)records.Add(Record(27,5,5));records.AddRange(new[]{Record(61),Record(61)});records.AddRange(Paint());Assert.AreEqual(0,Svg(records.ToArray()).Elements().Count());
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void ClosingPendingMoveClosesPreviousDrawnFigure(bool previousClosed)
    {
        var records=Open().ToList();if(previousClosed)records.Add(Record(61));records.AddRange(new[]{Record(27,8,8),Record(61),Record(61),Record(54,12,12)});records.AddRange(Paint());
        Assert.AreEqual("M 5 5 L 35 5 L 35 35 Z M 8 8 L 12 12",Path(records.ToArray()));
    }
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)]
    public void CloseOutsideConstructionDoesNotMoveCurrentPoint(int state)
    {
        var records=new List<byte[]>();if(state>0){records.AddRange(Open());records.Add(Record(state==1?60u:68u));}else records.Add(Record(27,35,35));
        records.AddRange(new[]{Record(61),Record(54,5,35)});var line=Svg(records.ToArray()).Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("35",line.Attribute("x1")?.Value);Assert.AreEqual("35",line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(3u,5,5)] [DataRow(86u,5,5)] [DataRow(43u,35,5)] [DataRow(42u,35,20)]
    public void AlreadyClosedIndependentShapeStartsNewFigure(uint type,int x,int y)
    {
        var shape=type==3||type==86?Points(type):Record(type,5,5,35,35);
        var path=Path(Record(27,x,y),Record(59),shape,Record(61),Record(54,5,35),Record(60),Record(64,0,0,39,39));
        StringAssert.EndsWith(path,$"Z M {x} {y} L 5 35");Assert.AreEqual(1,Regex.Matches(path,"Z").Count());
    }
    [TestMethod] [DataRow(5u)] [DataRow(88u)] [DataRow(6u)] [DataRow(89u)]
    public void CurveAndPolylineToAfterCloseStartAtEndpoint(uint type)
    {
        var path=Path(Open().Concat(new[]{Record(61),MetafileCurveFixtures.Curve(type)}).Concat(Paint()).ToArray());
        StringAssert.Contains(path,"Z M 35 35 "+(MetafileCurveFixtures.Line(type)?"L":"C"));
    }
    [TestMethod] [DataRow(56u,false)] [DataRow(92u,false)] [DataRow(56u,true)] [DataRow(92u,true)]
    public void PolyDrawCloseInsideOneRecordStartsNewFigure(uint type,bool active)
    {
        var records=new List<byte[]>();if(active)records.Add(Record(59));records.Add(PolyDraw(type,new byte[]{6,2,3,2},new[]{5,5,35,5,5,5,5,35}));if(active)records.AddRange(Paint());
        Assert.AreEqual("M 5 5 L 35 5 L 5 5 Z M 5 5 L 5 35",Path(records.ToArray()));
    }
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void SeparatePolyDrawAfterClosedFigureStartsNewFigure(uint type)
        =>Assert.AreEqual("M 5 5 L 35 5 L 5 5 Z M 5 5 L 5 35",Path(Record(59),PolyDraw(type,new byte[]{6,2,3},new[]{5,5,35,5,5,5}),PolyDraw(type,new byte[]{2},new[]{5,35}),Record(60),Record(64,0,0,39,39)));
    [TestMethod] public void MoveReopensAfterClosedFigure()
        =>StringAssert.EndsWith(Path(Open().Concat(new[]{Record(61),Record(27,8,8),Record(54,12,12)}).Concat(Paint()).ToArray()),"Z M 8 8 L 12 12");
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void SaveRestorePreservesOpenOrClosedFigure(bool closed)
    {
        var records=Open().ToList();if(closed)records.Add(Record(61));records.Add(Record(33));if(!closed)records.Add(Record(61));records.AddRange(new[]{Record(27,8,8),Record(54,12,12),Record(34,-1),Record(54,5,35)});records.AddRange(Paint());
        Assert.AreEqual("M 5 5 L 35 5 L 35 35"+(closed?" Z M 35 35":"")+" L 5 35",Path(records.ToArray()));
    }
    [TestMethod] public void MappingPreservesClosedEndpointContinuity()
        =>StringAssert.EndsWith(Path(new[]{Record(17,8),Record(9,10,10),Record(11,20,30),Record(12,4,7)}.Concat(Open()).Concat(new[]{Record(61),Record(54,5,35)}).Concat(Paint()).ToArray()),"Z M 74 112 L 14 112");
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HtmlRendersNewFigureWithoutChangingSource(bool coincident)
    {
        var records=Open().ToList();if(coincident)records.Add(Record(54,5,5));records.AddRange(new[]{Record(61),Record(54,5,35)});records.AddRange(Paint());var bytes=Emf(records.ToArray());var original=bytes.ToArray();var uri="data:image/emf;base64,"+Convert.ToBase64String(bytes);
        var item=new HmiGraphicView{Name="Closed",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);var path=XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Single().Attribute("d")!.Value;
        StringAssert.EndsWith(path,coincident?"Z M 5 5 L 5 35":"Z M 35 35 L 5 35");Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
