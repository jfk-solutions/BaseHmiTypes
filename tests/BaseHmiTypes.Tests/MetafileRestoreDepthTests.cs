using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileRestoreDepthTests
{
    private static byte[][] Setup() => new[] {
        Record(12,1,2), Record(33), Record(12,3,4), Record(33),
        Record(12,5,6), Record(33), Record(12,7,8), Record(27,2,3)
    };
    private static XElement Svg(params byte[][] tail) => XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(Setup().Concat(tail).ToArray()), ".emf")!).Root!;
    private static XElement Line(XElement svg) => svg.Elements().Single(e => e.Name.LocalName == "line");
    private static void Position(XElement svg, string x, string y) { var line = Line(svg); Assert.AreEqual(x, line.Attribute("x2")?.Value); Assert.AreEqual(y, line.Attribute("y2")?.Value); }

    [TestMethod] [DataRow(-1,"9","11")] [DataRow(-2,"7","9")] [DataRow(-3,"5","7")]
    public void RelativeDepthRestoresRequestedSnapshot(int level,string x,string y) => Position(Svg(Record(34,level),Record(54,4,5)),x,y);

    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(int.MaxValue)] [DataRow(-4)] [DataRow(int.MinValue)]
    public void InvalidRestoreKeepsCurrentState(int level) => Position(Svg(Record(34,level),Record(54,4,5)),"11","13");

    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(int.MaxValue)] [DataRow(-4)] [DataRow(int.MinValue)]
    public void InvalidRestoreDoesNotConsumeStack(int level) => Position(Svg(Record(34,level),Record(34,-3),Record(54,4,5)),"5","7");

    [TestMethod] public void TruncatedRestoreDoesNotReadFollowingRecordOrConsumeStack() => Position(Svg(Record(34),Record(34,-3),Record(54,4,5)),"5","7");
    [TestMethod] public void RestoreDiscardsSelectedAndNewerSnapshots() => Position(Svg(Record(34,-2),Record(12,20,30),Record(34,-2),Record(54,4,5)),"24","35");
    [TestMethod] public void EarlierSnapshotRemainsAfterDeepRestore() => Position(Svg(Record(34,-2),Record(34,-1),Record(54,4,5)),"5","7");
    [TestMethod] public void RestoredSnapshotCannotBeUsedAgain() => Position(Svg(Record(34,-3),Record(12,20,30),Record(34,-1),Record(54,4,5)),"24","35");
    [TestMethod] public void NewSaveAfterRestoreUsesRemainingStack() => Position(Svg(Record(34,-2),Record(12,20,30),Record(33),Record(12,40,50),Record(34,-2),Record(54,4,5)),"5","7");
    [TestMethod] public void DeepRestoreRestoresLogicalCurrentPosition() { var d=Line(Svg(Record(34,-3),Record(54,4,5))); Assert.AreEqual("1",d.Attribute("x1")?.Value); Assert.AreEqual("2",d.Attribute("y1")?.Value); }
    [TestMethod] public void DeepRestoreRestoresWorldTransformAndMapping() {
        var world=Record(35,new float[]{2,0,0,3,10,20}.Select(BitConverter.SingleToInt32Bits).ToArray());
        var d=Line(Svg(Record(9,2,4),Record(11,4,8),world,Record(34,-3),Record(54,4,5)));
        Assert.AreEqual("5",d.Attribute("x2")?.Value); Assert.AreEqual("7",d.Attribute("y2")?.Value);
    }
    [TestMethod] public void DeepRestoreRestoresClipAndSelectedObjects() {
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(
            Record(37,unchecked((int)0x80000006)),Record(30,1,2,30,31),Record(33),
            Record(37,unchecked((int)0x80000007)),Record(30,5,6,20,21),Record(33),
            Record(26,3,4),Record(34,-2),Record(54,4,5)),".emf")!).Root!;
        var d=Line(svg);Assert.AreEqual("#ffffff",d.Attribute("stroke")?.Value);Assert.AreEqual("url(#clip1)",d.Attribute("clip-path")?.Value);Assert.IsNull(d.Attribute("mask"));
    }
    [TestMethod] [DataRow(-2)] [DataRow(-3)]
    public async Task HtmlUsesDepthWithoutChangingSource(int level) {
        var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Setup().Concat(new[]{Record(34,level),Record(54,4,5)}).ToArray()));
        var item=new HmiGraphicView{Name="RestoreDepth",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        Position(XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!,level==-2?"7":"5",level==-2?"9":"7");Assert.AreEqual(uri,item.Source!.StaticValue);
    }
}
