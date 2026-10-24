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
[TestClass] public class MetafileGeometricDashTests
{
    private static byte[] Pen(int style=0x10201,int width=3,int[]? entries=null,int? count=null)=>Record(95,new[]{1,0,0,0,0,style,width,0,0x563412,0,count??entries?.Length??0}.Concat(entries??Array.Empty<int>()).ToArray());
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static XElement Line(params byte[][] r)=>Svg(r.Concat(new[]{Record(37,1),Record(27,4,20),Record(54,36,20)}).ToArray()).Elements().Single(e=>e.Name.LocalName=="line");
    private static string? Dashes(XElement e)=>e.Attribute("stroke-dasharray")?.Value;
    [TestMethod] [DataRow(1,1,"3 1")] [DataRow(1,3,"9 3")] [DataRow(2,1,"1 1")] [DataRow(2,3,"3 3")] [DataRow(3,1,"3 1 1 1")] [DataRow(3,3,"9 3 3 3")] [DataRow(4,1,"3 1 1 1 1 1")] [DataRow(4,3,"9 3 3 3 3 3")]
    public void StandardPatternsUsePenWidth(int style,int width,string expected)=>Assert.AreEqual(expected,Dashes(Line(Pen(0x10200|style,width))));
    [TestMethod] [DataRow(0)] [DataRow(5)] [DataRow(6)] public void SolidNullAndInsideFrameDoNotHaveDashes(int style)=>Assert.IsNull(Dashes(Line(Pen(0x10200|style))));
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] public void CosmeticPensDoNotUseGeometricPatterns(int style){var s=Svg(Pen(style,1),Record(37,1),Record(27,4,20),Record(54,36,20));Assert.IsTrue(s.Descendants().All(e=>e.Attribute("stroke-dasharray") is null));Assert.IsTrue(s.Descendants().Any(e=>e.Name.LocalName=="path"));}
    [TestMethod] [DataRow(1)] [DataRow(9)] public void CustomLengthsAreLogicalUnitsNotWidthMultiples(int width)=>Assert.AreEqual("3 5 2",Dashes(Line(Pen(0x10207,width,new[]{3,5,2}))));
    [TestMethod] public void SingleOddEntryIsRetained()=>Assert.AreEqual("4",Dashes(Line(Pen(0x10207,3,new[]{4}))));
    [TestMethod] [DataRow(0,2)] [DataRow(2,0)] public void ZeroEntriesAreRetainedWhenCycleIsNonzero(int first,int second)=>Assert.AreEqual($"{first} {second}",Dashes(Line(Pen(0x10207,3,new[]{first,second}))));
    [TestMethod] public void SixteenEntriesAreAccepted()=>Assert.AreEqual(string.Join(" ",Enumerable.Repeat(1,16)),Dashes(Line(Pen(0x10207,3,Enumerable.Repeat(1,16).ToArray()))));
    [TestMethod] public void LargestSignedCycleIsAccepted()=>Assert.AreEqual("2147483646 1",Dashes(Line(Pen(0x10207,3,new[]{int.MaxValue-1,1}))));
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)] [DataRow(6)] [DataRow(7)]
    public void InvalidCustomRecordsDoNotReplaceExistingHandle(int kind){var bad=kind switch{0=>Pen(0x10207),1=>Pen(0x10207,3,new[]{0}),2=>Pen(0x10207,3,new[]{0,0}),3=>Pen(0x10207,3,new[]{int.MaxValue,1}),4=>Pen(0x10207,3,new[]{-1,2}),5=>Pen(0x10207,3,Enumerable.Repeat(1,17).ToArray()),6=>Pen(0x10207,3,new[]{3,5},3),_=>Pen(0x10207,3,null,int.MaxValue)};Assert.AreEqual("9 3",Dashes(Line(Pen(),bad)));}
    [TestMethod] [DataRow(0x10208)] [DataRow(0x1020f)] public void UnsupportedGeometricStyleDoesNotReplaceHandle(int style)=>Assert.AreEqual("9 3",Dashes(Line(Pen(),Pen(style))));
    [TestMethod] public void NonUserStyleWithEntriesDoesNotReplaceHandle()=>Assert.AreEqual("9 3",Dashes(Line(Pen(),Pen(0x10202,3,new[]{1,2}))));
    [TestMethod] public void MappingScaleAppliesToStandardAndCustomUnits(){var a=Line(Record(17,8),Record(9,10,10),Record(11,20,20),Pen());var b=Line(Record(17,8),Record(9,10,10),Record(11,20,20),Pen(0x10207,3,new[]{3,5,2}));Assert.AreEqual("18 6",Dashes(a));Assert.AreEqual("6 10 4",Dashes(b));}
    [TestMethod] public void SaveRestoreRetainsPenPattern(){var s=Svg(Pen(),Record(37,1),Record(33),Pen(0x10202),Record(37,1),Record(27,4,20),Record(54,36,20),Record(34,-1),Record(54,4,20));CollectionAssert.AreEqual(new[]{"3 3","9 3"},s.Elements().Where(e=>e.Name.LocalName=="line").Select(Dashes).ToArray());}
    [TestMethod] public void StockPenResetsPattern(){var s=Svg(Pen(),Record(37,1),Record(37,unchecked((int)0x80000007)),Record(27,4,20),Record(54,36,20));Assert.IsNull(Dashes(s.Elements().Single()));}
    [TestMethod] [DataRow(1)] [DataRow(2)] public void GeometricGapsIgnoreBackgroundMode(int mode)=>Assert.AreEqual("9 3",Dashes(Line(Pen(),Record(18,mode),Record(25,255))));
    [TestMethod] [DataRow(0x10001,"round")] [DataRow(0x10101,"square")] [DataRow(0x10201,"butt")]
    public void DashesRetainGeometricCaps(int style,string cap){var l=Line(Pen(style));Assert.AreEqual(cap=="butt"?"9 3":"6 6",Dashes(l));Assert.AreEqual(cap,l.Attribute("stroke-linecap")?.Value);}
    [TestMethod] [DataRow(0x10001,"6 6")] [DataRow(0x10101,"6 6")] [DataRow(0x10002,"0 6")] [DataRow(0x10102,"0 6")] [DataRow(0x10003,"6 6 0 6")] [DataRow(0x10103,"6 6 0 6")] [DataRow(0x10004,"6 6 0 6 0 6")] [DataRow(0x10104,"6 6 0 6 0 6")]
    public void ProjectingCapsKeepNominalStandardPatternLength(int style,string expected)=>Assert.AreEqual(expected,Dashes(Line(Pen(style))));
    [TestMethod] public void SelectedPathPaintingUsesCurrentDashPattern(){var s=Svg(Pen(),Record(37,1),Record(59),Record(27,4,20),Record(54,36,20),Record(60),Record(64,0,0,39,39));Assert.AreEqual("9 3",Dashes(s.Elements().Single()));}
    [TestMethod] public void FillOnlyPathHasNoStrokePattern(){var s=Svg(Pen(),Record(37,1),Record(59),Record(43,4,4,36,36),Record(60),Record(62,0,0,39,39));Assert.AreEqual("none",s.Elements().Single().Attribute("stroke")?.Value);Assert.IsNull(Dashes(s.Elements().Single()));}
    [TestMethod] public async Task HtmlRetainsDashesWithoutMutatingSource(){var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Pen(0x10207,3,new[]{3,5,2}),Record(37,1),Record(27,4,20),Record(54,36,20)));var item=new HmiGraphicView{Name="Dash",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var m=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(m.Success);Assert.AreEqual("3 5 2",Dashes(XDocument.Parse(Uri.UnescapeDataString(m.Groups[1].Value)).Descendants().Single(e=>e.Name.LocalName=="line")));Assert.AreEqual(uri,item.Source!.StaticValue);}
}
