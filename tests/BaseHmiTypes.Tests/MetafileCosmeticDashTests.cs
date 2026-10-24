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
[TestClass] public class MetafileCosmeticDashTests
{
    private static byte[] Pen(int style=1,int width=1)=>Record(38,1,style,width,0,0x563412);
    private static byte[] Ext(int style=1,int width=1,int[]? entries=null,int? count=null)=>Record(95,new[]{1,0,0,0,0,style,width,0,0x563412,0,count??entries?.Length??0}.Concat(entries??Array.Empty<int>()).ToArray());
    private static XElement Svg(params byte[][] r)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(r),".emf")!).Root!;
    private static XElement Draw(params byte[][] r)=>Svg(r.Concat(new[]{Record(37,1),Record(27,4,20),Record(54,36,20)}).ToArray());
    private static HashSet<(int X,int Y)> Pixels(XElement s,string color)=>s.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value==color).SelectMany(e=>Regex.Matches(e.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z").Select(m=>(int.Parse(m.Groups[1].Value),int.Parse(m.Groups[2].Value)))).ToHashSet();
    private static bool Ink(int x,int style){var runs=style switch{1=>new[]{18,6},2=>new[]{3,3},3=>new[]{9,6,3,6},4=>new[]{9,3,3,3,3,3},7=>new[]{9,15,6,9,15,6},_=>new[]{1,1}};var p=x%runs.Sum();for(var i=0;i<runs.Length;i++){if(p<runs[i])return i%2==0;p-=runs[i];}throw new Exception();}
    [TestMethod] [DataRow(1,1)] [DataRow(1,2)] [DataRow(2,1)] [DataRow(2,2)] [DataRow(3,1)] [DataRow(3,2)] [DataRow(4,1)] [DataRow(4,2)]
    public void CreatePenUsesNativePixelsAndBackgroundGaps(int style,int mode){var s=Draw(Pen(style),Record(18,mode),Record(25,255));var fg=Pixels(s,"#123456");var bg=Pixels(s,"#ff0000");for(var x=0;x<40;x++){var ink=x>=4&&x<36&&Ink(x-4,style);Assert.AreEqual(ink,fg.Contains((x,20)));Assert.AreEqual(mode==2&&x>=4&&x<36&&!ink,bg.Contains((x,20)));}Assert.AreEqual(0,fg.Count(p=>p.Y!=20));}
    [TestMethod] [DataRow(1,1)] [DataRow(1,2)] [DataRow(2,1)] [DataRow(2,2)] [DataRow(3,1)] [DataRow(3,2)] [DataRow(4,1)] [DataRow(4,2)] [DataRow(7,1)] [DataRow(7,2)] [DataRow(8,1)] [DataRow(8,2)]
    public void ExtendedCosmeticPenIgnoresBackgroundMode(int style,int mode){var s=Draw(Ext(style,entries:style==7?new[]{3,5,2}:null),Record(18,mode),Record(25,255));var fg=Pixels(s,"#123456");for(var x=4;x<36;x++)Assert.AreEqual(Ink(x-4,style),fg.Contains((x,20)));Assert.AreEqual(0,Pixels(s,"#ff0000").Count);}
    [TestMethod] [DataRow(0)] [DataRow(-1)] [DataRow(1)] public void UnitWidthCreatePenUsesCosmeticPattern(int width)=>Assert.AreEqual(26,Pixels(Draw(Pen(width:width)),"#123456").Count);
    [TestMethod] [DataRow(2)] [DataRow(3)] [DataRow(-3)] public void WideCreatePenDashFallsBackToSolid(int width){var l=Draw(Pen(width:width)).Elements().Single();Assert.AreEqual("line",l.Name.LocalName);Assert.IsNull(l.Attribute("stroke-dasharray"));}
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)] [DataRow(6)] [DataRow(7)] [DataRow(8)] [DataRow(9)]
    public void InvalidExtendedRecordsPreservePreviousHandle(int kind){var bad=kind switch{1=>Ext(7),2=>Ext(7,entries:new[]{0,2}),3=>Ext(7,entries:new[]{2,0}),4=>Ext(7,entries:new[]{16383,1}),5=>Ext(7,entries:new[]{1,2},count:3),6=>Ext(7,entries:Enumerable.Repeat(1,17).ToArray()),7=>Ext(1,width:2),8=>Ext(1,entries:new[]{1}),_=>Ext(7,entries:new[]{-1,2})};Assert.AreEqual(26,Pixels(Draw(Pen(),bad),"#123456").Count);}
    [TestMethod] public void LargestCustomCycleIsAccepted()=>Assert.AreEqual(32,Pixels(Draw(Ext(7,entries:new[]{16382,1})),"#123456").Count);
    [TestMethod] public void OddCustomCycleReversesInkAndGap(){var s=Svg(Ext(7,entries:new[]{1}),Record(37,1),Record(27,0,20),Record(54,20,20));var p=Pixels(s,"#123456");for(var x=0;x<20;x++)Assert.AreEqual(x%6<3,p.Contains((x,20)));}
    [TestMethod] public void SaveRestoreRestoresGapBackground(){var s=Draw(Pen(),Record(25,255),Record(33),Record(25,0),Record(18,1),Record(34,-1));Assert.AreEqual(6,Pixels(s,"#ff0000").Count);}
    [TestMethod] public void DevicePixelsDoNotScaleWithMapping(){var s=Svg(Record(17,8),Record(9,10,10),Record(11,20,20),Pen(),Record(37,1),Record(27,2,10),Record(54,18,10));Assert.AreEqual(26,Pixels(s,"#123456").Count);}
    [TestMethod] [DataRow(4,4,36,20,5,4)] [DataRow(4,4,20,36,4,5)] [DataRow(36,36,4,20,35,35)] [DataRow(36,36,20,4,35,35)]
    public void HalfwayRasterTiesFavorUpperLeft(int x1,int y1,int x2,int y2,int x,int y){var s=Svg(Pen(),Record(37,1),Record(27,x1,y1),Record(54,x2,y2));Assert.IsTrue(Pixels(s,"#123456").Contains((x,y)));}
    [TestMethod] public void EndpointIsExcluded(){var s=Svg(Pen(),Record(37,1),Record(27,4,4),Record(54,7,7));var p=Pixels(s,"#123456");Assert.AreEqual(3,p.Count);Assert.IsFalse(p.Contains((7,7)));}
    [TestMethod] public void VeryLongLineKeepsBoundedOutlineFallback(){var s=Svg(Pen(),Record(18,1),Record(37,1),Record(27,0,0),Record(54,int.MaxValue,0));Assert.AreEqual("2147483647",s.Elements().Single().Attribute("pathLength")?.Value);Assert.IsNotNull(s.Elements().Single().Attribute("stroke-dasharray"));}
    [TestMethod] public void OpaqueShapePaintsFillBeforeGapStroke(){var s=Svg(Pen(),Record(37,1),Record(25,255),Record(43,4,4,36,36));var shapes=s.Elements().Single().Elements().ToArray();Assert.AreEqual(3,shapes.Length);Assert.AreEqual("#ffffff",shapes[0].Attribute("fill")?.Value);Assert.AreEqual("#ff0000",shapes[1].Attribute("stroke")?.Value);Assert.AreEqual("none",shapes[1].Attribute("fill")?.Value);Assert.AreEqual("none",shapes[2].Attribute("fill")?.Value);}
    [TestMethod] public void FillOnlyPathDoesNotGetGapStroke(){var s=Svg(Pen(),Record(37,1),Record(59),Record(43,4,4,36,36),Record(60),Record(62,0,0,39,39));Assert.AreEqual("path",s.Elements().Single().Name.LocalName);Assert.AreEqual("none",s.Elements().Single().Attribute("stroke")?.Value);}
    [TestMethod] public void ClipAndMetaregionApplyToBothColors(){var s=Svg(Pen(),Record(37,1),MetafileRegionClipFixtures.Region(),Record(28),Record(25,255),Record(27,4,20),Record(54,36,20));Assert.IsNotNull(s.Elements().Single(e=>e.Name.LocalName=="g").Attribute("mask"));Assert.IsTrue(s.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000").All(e=>e.Attribute("clip-path") is null));}
    [TestMethod] public async Task HtmlUsesPixelPathsWithoutChangingSource(){var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Pen(),Record(37,1),Record(25,255),Record(27,4,20),Record(54,36,20)));var item=new HmiGraphicView{Name="Cosmetic",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var m=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(m.Success);Assert.AreEqual(26,Pixels(XDocument.Parse(Uri.UnescapeDataString(m.Groups[1].Value)).Root!,"#123456").Count);Assert.AreEqual(uri,item.Source!.StaticValue);}
}
