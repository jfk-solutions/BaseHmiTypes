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
[TestClass] public class MetafileCosmeticPathTests
{
    private static byte[] Pen(int style=1,bool extended=false)=>extended?Record(95,new[]{1,0,0,0,0,style,1,0,0x563412,0,style==7?3:0}.Concat(style==7?new[]{3,5,2}:Array.Empty<int>()).ToArray()):Record(38,1,style,1,0,0x563412);
    private static byte[] Poly(uint type=4)=>Record(type,0,0,39,39,3,4,8,17,8,17,29);
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static XElement Draw(params byte[][] r)=>Svg(new[]{Pen(),Record(37,1),Record(25,255),Record(37,unchecked((int)0x80000005))}.Concat(r).ToArray());
    private static Dictionary<(int,int),string> Pixels(XElement svg){var pixels=new Dictionary<(int,int),string>();foreach(var p in svg.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000"))foreach(Match m in Regex.Matches(p.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z"))pixels[(int.Parse(m.Groups[1].Value),int.Parse(m.Groups[2].Value))]=p.Attribute("fill")!.Value;return pixels;}
    private static bool Ink(int phase,int style){var runs=style switch{1=>new[]{18,6},2=>new[]{3,3},3=>new[]{9,6,3,6},4=>new[]{9,3,3,3,3,3},7=>new[]{9,15,6,9,15,6},_=>new[]{1,1}};var n=phase%runs.Sum();for(var i=0;i<runs.Length;i++){if(n<runs[i])return i%2==0;n-=runs[i];}throw new Exception();}
    [TestMethod] [DataRow(1,false)] [DataRow(2,false)] [DataRow(3,false)] [DataRow(4,false)] [DataRow(1,true)] [DataRow(2,true)] [DataRow(3,true)] [DataRow(4,true)] [DataRow(7,true)] [DataRow(8,true)]
    public void PolylineCarriesPhaseAcrossVertices(int style,bool extended){var p=Pixels(Svg(Pen(style,extended),Record(37,1),Record(25,255),Poly()));for(var y=8;y<29;y++){var expected=Ink(13+y-8,style)?"#123456":extended?null:"#ff0000";Assert.AreEqual(expected,p.TryGetValue((17,y),out var color)?color:null);}}
    [TestMethod] public void SeparateLineToCallsCarryPhase(){var p=Pixels(Draw(Record(27,4,8),Record(54,17,8),Record(54,17,29)));Assert.AreEqual("#123456",p[(17,12)]);Assert.AreEqual("#ff0000",p[(17,13)]);}
    [TestMethod] public void MoveResetsPhase(){var p=Pixels(Draw(Record(27,4,8),Record(54,17,8),Record(27,17,8),Record(54,17,29)));Assert.AreEqual("#123456",p[(17,25)]);Assert.AreEqual("#ff0000",p[(17,26)]);}
    [TestMethod] public void SaveRestoreRestoresPhase(){var p=Pixels(Draw(Record(27,4,8),Record(54,17,8),Record(33),Record(54,20,8),Record(34,-1),Record(54,17,29)));Assert.AreEqual("#ff0000",p[(17,13)]);}
    [TestMethod] public void PolylineToContinuesDcPhase(){var p=Pixels(Draw(Record(27,4,8),Record(54,10,8),Record(6,0,0,39,39,2,17,8,17,29)));Assert.AreEqual("#ff0000",p[(17,13)]);}
    [TestMethod] public void PolylineUpdatesStyleWithoutChangingDcPosition(){var p=Pixels(Draw(Record(27,17,8),Record(4,0,0,39,39,2,4,35,11,35),Record(54,17,29)));Assert.AreEqual("#123456",p[(17,18)]);Assert.AreEqual("#ff0000",p[(17,19)]);}
    [TestMethod] public void CompoundFiguresResetPhase(){var p=Pixels(Draw(Record(7,0,0,39,39,2,6,3,3,4,8,17,8,17,29,21,8,34,8,34,29)));Assert.AreEqual(p[(17,13)],p[(34,13)]);Assert.AreEqual("#ff0000",p[(34,13)]);}
    [TestMethod] public void PolyDrawFiguresResetPhase(){var p=Pixels(Draw(Record(56,0,0,39,39,6,4,8,17,8,17,29,21,8,34,8,34,29,0x06020206,0x0202)));Assert.AreEqual("#ff0000",p[(34,13)]);}
    [TestMethod] [DataRow(64)] [DataRow(63)] public void PathPaintingCarriesPhase(int paint){var p=Pixels(Draw(Record(59),Record(27,4,8),Record(54,17,8),Record(54,17,29),Record(60),Record((uint)paint,0,0,39,39)));Assert.AreEqual("#ff0000",p[(17,13)]);}
    [TestMethod] public void ClosedFigureAdvancesClosingSegment(){var p=Pixels(Draw(Record(59),Record(27,4,8),Record(54,17,8),Record(54,17,29),Record(61),Record(60),Record(64,0,0,39,39)));Assert.IsTrue(p.ContainsKey((10,18)));}
    [TestMethod] public void LaterOpaqueGapOverwritesEarlierInkAtIntersection(){var p=Pixels(Draw(Record(4,0,0,39,39,4,4,4,32,32,4,32,32,4)));Assert.AreEqual("#ff0000",p[(18,18)]);}
    [TestMethod] public void ClippingDoesNotResetOrShortenPhase(){var p=Pixels(Draw(Record(30,10,4,35,35),Record(27,4,8),Record(54,17,8),Record(54,17,29)));Assert.AreEqual("#ff0000",p[(17,13)]);Assert.IsTrue(Draw(Record(30,10,4,35,35),Poly()).Descendants().Any(e=>e.Attribute("clip-path") is not null));}
    [TestMethod] public void PenSelectionWithoutDrawingDoesNotResetPhase(){var p=Pixels(Draw(Record(38,2,2,1,0,0x563412),Record(27,4,8),Record(54,17,8),Record(37,2),Record(37,1),Record(54,17,29)));Assert.AreEqual("#ff0000",p[(17,13)]);}
    [TestMethod] public void DrawingWithOtherPenResetsPhaseWhenOriginalIsReused(){var p=Pixels(Draw(Record(38,2,2,1,0,0x563412),Record(27,4,8),Record(54,17,8),Record(37,2),Record(54,17,11),Record(37,1),Record(54,17,29)));Assert.AreEqual("#123456",p[(17,28)]);}
    [TestMethod] public void SolidPenDrawingAlsoInvalidatesPreviousStylePhase(){var p=Pixels(Draw(Record(38,2,0,1,0,0x563412),Record(27,4,8),Record(54,17,8),Record(37,2),Record(4,0,0,39,39,2,30,30,35,30),Record(37,1),Record(54,17,29)));Assert.AreEqual("#123456",p[(17,25)]);}
    [TestMethod] public void InvalidRecordDoesNotConsumePhase(){var p=Pixels(Draw(Record(27,4,8),Record(54,17,8),Record(4,0,0,39,39,int.MaxValue,4,4),Record(54,17,29)));Assert.AreEqual("#ff0000",p[(17,13)]);}
    [TestMethod] public async Task HtmlRetainsMultiSegmentPhaseAndSource(){var bytes=Emf(Pen(),Record(37,1),Record(25,255),Poly());var uri="data:image/emf;base64,"+Convert.ToBase64String(bytes);var item=new HmiGraphicView{Name="Multi",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var m=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(m.Success);Assert.AreEqual("#ff0000",Pixels(XDocument.Parse(Uri.UnescapeDataString(m.Groups[1].Value)).Root!)[(17,13)]);Assert.AreEqual(uri,item.Source!.StaticValue);}
}
