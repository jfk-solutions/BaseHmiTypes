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
[TestClass] public class MetafileHatchBrushTests
{
    private static byte[] Brush(int hatch=0,int color=0x563412)=>Record(39,1,2,color,hatch);
    private static byte[] Fill()=>Record(71,0,0,39,39,48,1,32,1,1,16,4,4,36,36,4,4,36,36);
    private static byte[] Box()=>Record(43,4,4,36,36);
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    private static XElement Pattern(XElement svg)=>svg.Descendants().Single(e=>e.Name.LocalName=="pattern");
    private static XElement Drawing(XElement svg)=>svg.Elements().Last();
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)]
    public void StandardHatchPixelsMatchNativeMasks(int hatch){var p=Pattern(Svg(Brush(hatch),Fill()));Assert.AreEqual("userSpaceOnUse",p.Attribute("patternUnits")?.Value);Assert.AreEqual("8",p.Attribute("width")?.Value);Assert.AreEqual("8",p.Attribute("height")?.Value);var path=p.Elements().Single(e=>e.Name.LocalName=="path");Assert.AreEqual("#123456",path.Attribute("fill")?.Value);var pixels=Regex.Matches(path.Attribute("d")!.Value,@"M (\d+) (\d+)h1v1h-1Z").Select(m=>(X:int.Parse(m.Groups[1].Value),Y:int.Parse(m.Groups[2].Value))).ToHashSet();for(var y=0;y<8;y++)for(var x=0;x<8;x++){var expected=hatch switch{0=>y==3,1=>x==4,2=>x==y,3=>x+y==7,4=>y==3||x==4,_=>x==y||x+y==7};Assert.AreEqual(expected,pixels.Contains((x,y)),$"pixel={x},{y}");}}
    [TestMethod] public void DefaultBackgroundIsOpaqueWhite()=>Assert.AreEqual("#ffffff",Pattern(Svg(Brush(),Fill())).Elements().Single(e=>e.Name.LocalName=="rect").Attribute("fill")?.Value);
    [TestMethod] public void OpaqueBackgroundUsesCurrentColor()=>Assert.AreEqual("#ff0000",Pattern(Svg(Brush(),Record(25,255),Fill())).Elements().Single(e=>e.Name.LocalName=="rect").Attribute("fill")?.Value);
    [TestMethod] public void TransparentBackgroundHasNoBackdrop()=>Assert.AreEqual(0,Pattern(Svg(Brush(),Record(18,1),Record(25,255),Fill())).Elements().Count(e=>e.Name.LocalName=="rect"));
    [TestMethod] [DataRow(0)] [DataRow(3)] [DataRow(-1)] [DataRow(int.MaxValue)] public void InvalidBackgroundModeKeepsOpaqueState(int mode)=>Assert.AreEqual(1,Pattern(Svg(Brush(),Record(18,mode),Fill())).Elements().Count(e=>e.Name.LocalName=="rect"));
    [TestMethod] [DataRow(3,-2,3,6)] [DataRow(-9,17,7,1)] [DataRow(int.MinValue,int.MaxValue,0,7)]
    public void BrushOriginIsDeviceSpaceModuloEight(int x,int y,int expectedX,int expectedY){var p=Pattern(Svg(Brush(),Record(13,x,y),Fill()));Assert.AreEqual(expectedX.ToString(),p.Attribute("x")?.Value);Assert.AreEqual(expectedY.ToString(),p.Attribute("y")?.Value);}
    [TestMethod] [DataRow(13,0)] [DataRow(13,1)] [DataRow(18,0)] [DataRow(25,0)]
    public void TruncatedStateRecordsDoNotReadFollowingRecord(int type,int count){var p=Pattern(Svg(Brush(),Record((uint)type,Enumerable.Repeat(255,count).ToArray()),Fill()));Assert.AreEqual("0",p.Attribute("x")?.Value);Assert.AreEqual("0",p.Attribute("y")?.Value);Assert.AreEqual("#ffffff",p.Elements().Single(e=>e.Name.LocalName=="rect").Attribute("fill")?.Value);}
    [TestMethod] public void SaveRestoreRestoresBackgroundAndOrigin(){var p=Pattern(Svg(Brush(),Record(13,3,-2),Record(25,255),Record(33),Record(18,1),Record(25,0),Record(13,0,0),Record(34,-1),Fill()));Assert.AreEqual("3",p.Attribute("x")?.Value);Assert.AreEqual("6",p.Attribute("y")?.Value);Assert.AreEqual("#ff0000",p.Elements().Single(e=>e.Name.LocalName=="rect").Attribute("fill")?.Value);}
    [TestMethod] public void IdenticalBrushStatesReuseDefinition(){var s=Svg(Brush(),Fill(),Fill());Assert.AreEqual(1,s.Descendants().Count(e=>e.Name.LocalName=="pattern"));Assert.AreEqual(2,s.Elements().Count(e=>e.Name.LocalName=="path"));}
    [TestMethod] public void PhaseBackgroundAndModeHaveIndependentDefinitions(){var s=Svg(Brush(),Fill(),Record(13,1,0),Fill(),Record(25,255),Fill(),Record(18,1),Fill());Assert.AreEqual(4,s.Descendants().Count(e=>e.Name.LocalName=="pattern"));Assert.AreEqual(4,s.Elements().Where(e=>e.Name.LocalName=="path").Select(e=>e.Attribute("fill")!.Value).Distinct().Count());}
    [TestMethod] public void RestoredStateReusesEarlierDefinition(){var s=Svg(Brush(),Fill(),Record(33),Record(13,1,0),Fill(),Record(34,-1),Fill());var fills=s.Elements().Where(e=>e.Name.LocalName=="path").Select(e=>e.Attribute("fill")!.Value).ToArray();Assert.AreEqual(fills[0],fills[2]);Assert.AreNotEqual(fills[0],fills[1]);Assert.AreEqual(2,s.Descendants().Count(e=>e.Name.LocalName=="pattern"));}
    [TestMethod] public void ExplicitRegionBrushDoesNotChangeSelectedBrush(){var s=Svg(Brush(),Record(39,2,0,255,0),Record(37,2),Fill(),Box());Assert.AreEqual("url(#hatch1)",s.Elements().Single(e=>e.Name.LocalName=="path").Attribute("fill")?.Value);Assert.AreEqual("#ff0000",s.Elements().Single(e=>e.Name.LocalName=="rect").Attribute("fill")?.Value);}
    [TestMethod] [DataRow(42)] [DataRow(43)] [DataRow(44)] [DataRow(46)] [DataRow(47)] [DataRow(3)]
    public void DirectShapeFamiliesUseHatchFill(int type){var geometry=type==3?Points(3):type==44?Record(44,4,4,36,36,8,8):type==46||type==47?Record((uint)type,4,4,36,36,36,20,20,4):Record((uint)type,4,4,36,36);var s=Svg(Brush(),Record(37,1),geometry);Assert.AreEqual("url(#hatch1)",Drawing(s).Attribute("fill")?.Value);}
    [TestMethod] [DataRow(62)] [DataRow(63)] public void SelectedPathPaintingUsesHatch(int paint){var s=Svg(Brush(),Record(37,1),Record(59),Box(),Record(60),Record((uint)paint,0,0,39,39));Assert.AreEqual("url(#hatch1)",Drawing(s).Attribute("fill")?.Value);}
    [TestMethod] public void PatternStaysDeviceAlignedUnderWorldTransform(){var s=Svg(Brush(),Record(35,BitConverter.SingleToInt32Bits(2),0,0,BitConverter.SingleToInt32Bits(3),0,0),Fill());var p=Pattern(s);Assert.AreEqual("8",p.Attribute("width")?.Value);Assert.IsNull(p.Attribute("patternTransform"));Assert.AreEqual("M 8 12 L 72 12 L 72 108 L 8 108 Z",Drawing(s).Attribute("d")?.Value);}
    [TestMethod] public void StrokeOnlyAndUnusedBrushesDoNotCreatePatterns(){var s=Svg(Brush(),Record(37,1),Record(27,2,3),Record(54,8,9));Assert.AreEqual(0,s.Descendants().Count(e=>e.Name.LocalName=="pattern"));}
    [TestMethod] public void ClosedPolyDrawIsStrokeOnly(){var s=Svg(Brush(),Record(37,1),Record(56,0,0,39,39,3,4,4,36,4,20,36,0x030206));Assert.AreEqual("none",Drawing(s).Attribute("fill")?.Value);Assert.AreEqual(0,s.Descendants().Count(e=>e.Name.LocalName=="pattern"));}
    [TestMethod] public void AbortedPathDoesNotCreatePatterns()=>Assert.AreEqual(0,Svg(Brush(),Record(37,1),Record(59),Box(),Record(68)).Descendants().Count(e=>e.Name.LocalName=="pattern"));
    [TestMethod] public void NullBrushRemainsUnfilled(){var s=Svg(Brush(),Record(37,1),Box(),Record(37,unchecked((int)0x80000005)),Box());Assert.AreEqual("none",Drawing(s).Attribute("fill")?.Value);}
    [TestMethod] public void ClipAndMetaregionApply(){var s=Svg(Brush(),MetafileRegionClipFixtures.Region(),Record(28),Fill());var g=s.Elements().Single(e=>e.Name.LocalName=="g");Assert.IsNotNull(g.Attribute("mask"));Assert.AreEqual("url(#hatch1)",g.Elements().Single().Attribute("fill")?.Value);}
    [TestMethod] public void ShortBrushDoesNotReplaceExistingHandle(){var s=Svg(Brush(),Record(39,1,0,255),Fill());Assert.AreEqual("url(#hatch1)",Drawing(s).Attribute("fill")?.Value);}
    [TestMethod] public async Task HtmlUsesPatternWithoutMutatingSource(){var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Brush(),Fill()));var item=new HmiGraphicView{Name="Hatch",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var m=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(m.Success);Assert.AreEqual("8",Pattern(XDocument.Parse(Uri.UnescapeDataString(m.Groups[1].Value)).Root!).Attribute("width")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);}
}
