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
public class MetafileClipTests
{
    private static byte[] Box(int left,int right)=>Points(3,new[]{left,5,right,5,right,35,left,35});
    private static byte[][] Clip(int left,int right,int mode=5)=>new[]{Record(59),Box(left,right),Record(60),Record(67,mode)};
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    [TestMethod] [DataRow(1,"evenodd")] [DataRow(2,"nonzero")]
    public void UsesFillRuleAtSelectionTime(int mode,string expected)
    {
        var path=Svg(Record(19,3-mode),Record(59),Box(5,35),Box(12,28),Record(60),Record(19,mode),Record(67,5)).Descendants().Single(e=>e.Name.LocalName=="path");Assert.AreEqual(expected,path.Attribute("clip-rule")?.Value);Assert.AreEqual(expected,path.Attribute("fill-rule")?.Value);
    }
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void AllCombinationModesUseNewRegion(int mode)
    {
        var svg=Svg(Clip(5,25).Concat(Clip(15,35,mode)).Concat(new[]{Record(43,0,0,39,39)}).ToArray());var rect=svg.Elements().Single(e=>e.Name.LocalName=="rect");
        Assert.AreEqual(mode==5?"url(#clip2)":null,rect.Attribute("clip-path")?.Value);Assert.AreEqual(mode==5?null:"url(#mask2)",rect.Attribute("mask")?.Value);
        if(mode!=5){var mask=svg.Descendants().Single(e=>e.Name.LocalName=="mask");Assert.AreEqual("userSpaceOnUse",mask.Attribute("maskUnits")?.Value);Assert.AreEqual("40",mask.Attribute("width")?.Value);Assert.IsTrue(mask.Descendants().Any(e=>e.Attribute("clip-path")?.Value=="url(#clip1)"));}
    }
    [TestMethod] [DataRow(54u)] [DataRow(3u)] [DataRow(4u)] [DataRow(86u)] [DataRow(87u)] [DataRow(43u)] [DataRow(42u)] [DataRow(44u)] [DataRow(45u)]
    public void ExistingPrimitivesRespectClipAndMask(uint type)
    {
        var drawing=type switch{3 or 4 or 86 or 87=>Points(type),44=>Record(type,0,0,39,39,10,10),45=>Record(type,0,0,39,39,39,20,20,0),54=>Record(type,39,20),_=>Record(type,0,0,39,39)};
        foreach(var mask in new[]{false,true}){var r=Clip(5,25).ToList();if(mask)r.AddRange(Clip(15,35,1));r.Add(drawing);var shape=Svg(r.ToArray()).Elements().Single(e=>e.Name.LocalName!="defs");Assert.AreEqual(mask?"url(#mask2)":"url(#clip1)",shape.Attribute(mask?"mask":"clip-path")?.Value);}
    }
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void CombinationWithoutPreviousClipIsBoundedByViewport(int mode)
    {
        var svg=Svg(Clip(15,35,mode).Concat(new[]{Record(43,0,0,39,39)}).ToArray());var rect=svg.Elements().Single(e=>e.Name.LocalName=="rect");Assert.AreEqual(mode==1||mode==5?"url(#clip1)":"url(#mask1)",rect.Attribute(mode==1||mode==5?"clip-path":"mask")?.Value);
    }
    [TestMethod] [DataRow(0)] [DataRow(6)] [DataRow(-1)] [DataRow(int.MinValue)]
    public void InvalidModeRetainsSelectedPathAndPreviousClip(int mode)
    {
        var r=Clip(5,25).Concat(new[]{Record(59),Box(15,35),Record(60),mode==int.MinValue?Record(67):Record(67,mode),Record(64,0,0,39,39)}).ToArray();var svg=Svg(r);Assert.AreEqual(1,svg.Descendants().Count(e=>e.Name.LocalName=="clipPath"));Assert.AreEqual("url(#clip1)",svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("clip-path")?.Value);
    }
    [TestMethod] [DataRow(1)] [DataRow(5)]
    public void EmptyPathSelectionLeavesClipUnchanged(int mode)
        =>Assert.AreEqual("url(#clip1)",Svg(Clip(5,25).Concat(new[]{Record(59),Record(60),Record(67,mode),Record(43,0,0,39,39)}).ToArray()).Elements().Single(e=>e.Name.LocalName=="rect").Attribute("clip-path")?.Value);
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void SaveRestoreRestoresClipOrMask(bool mask)
    {
        var r=Clip(5,25).ToList();if(mask)r.AddRange(Clip(15,35,1));r.Add(Record(33));r.AddRange(Clip(1,10));r.AddRange(new[]{Record(34,-1),Record(43,0,0,39,39)});Assert.AreEqual(mask?"url(#mask2)":"url(#clip1)",Svg(r.ToArray()).Elements().Single(e=>e.Name.LocalName=="rect").Attribute(mask?"mask":"clip-path")?.Value);
    }
    [TestMethod] public void CopyReplacesCombinedMask()
    {
        var rect=Svg(Clip(5,25).Concat(Clip(15,35,1)).Concat(Clip(1,10)).Concat(new[]{Record(43,0,0,39,39)}).ToArray()).Elements().Single(e=>e.Name.LocalName=="rect");Assert.AreEqual("url(#clip3)",rect.Attribute("clip-path")?.Value);Assert.IsNull(rect.Attribute("mask"));
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public void SaveRestoreReturnsToUnclippedState(bool mask)
    {
        var r=new List<byte[]>{Record(33)};r.AddRange(Clip(5,25));if(mask)r.AddRange(Clip(15,35,1));r.AddRange(new[]{Record(34,-1),Record(43,0,0,39,39)});var rect=Svg(r.ToArray()).Elements().Single(e=>e.Name.LocalName=="rect");Assert.IsNull(rect.Attribute("clip-path"));Assert.IsNull(rect.Attribute("mask"));
    }
    [TestMethod] public void ValidSelectionConsumesFinishedPath()
        =>Assert.AreEqual(1,Svg(Clip(5,25).Concat(new[]{Record(64,0,0,39,39),Record(43,0,0,39,39)}).ToArray()).Elements().Count(e=>e.Name.LocalName!="defs"));
    [TestMethod] [DataRow(1)] [DataRow(2)]
    public async Task HtmlRendersCombinationWithoutChangingSource(int fillMode)
    {
        var bytes=Emf(Clip(5,25).Concat(new[]{Record(19,fillMode)}).Concat(Clip(15,35,3)).Concat(new[]{Record(43,0,0,39,39)}).ToArray());var original=bytes.ToArray();var uri="data:image/emf;base64,"+Convert.ToBase64String(bytes);var item=new HmiGraphicView{Name="Clip",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);Assert.AreEqual(1,XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Descendants().Count(e=>e.Name.LocalName=="mask"));Assert.AreEqual(uri,item.Source!.StaticValue);CollectionAssert.AreEqual(original,bytes);
    }
}
