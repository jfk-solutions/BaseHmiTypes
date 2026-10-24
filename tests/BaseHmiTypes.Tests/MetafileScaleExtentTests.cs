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
public class MetafileScaleExtentTests
{
    private static byte[][] Setup(int mode=8)=>new[]{Record(17,mode),Record(9,3,-3),Record(11,5,-5)};
    private static XElement Svg(params byte[][] records)=>XDocument.Parse(new MetafileToSvgRenderer().Render(Emf(records),".emf")!).Root!;
    private static XElement Line(XElement svg)=>svg.Elements().Single(e=>e.Name.LocalName=="line");
    private static void Endpoint(XElement svg,int x,int y){var line=Line(svg);Assert.AreEqual(x.ToString(System.Globalization.CultureInfo.InvariantCulture),line.Attribute("x2")?.Value);Assert.AreEqual(y.ToString(System.Globalization.CultureInfo.InvariantCulture),line.Attribute("y2")?.Value);}
    private static XElement Scaled(int mode,bool viewport,int numerator,int denominator,int wx,int wy)=>Svg(Setup(mode).Concat(new[]{Record(viewport?31u:32u,numerator,denominator,1,1),Record(54,wx,wy)}).ToArray());

    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)]
    public void NonDrawingRecordsDoNotConsumeRequestedIsotropicExtents(int kind){byte[][][] triggers={new[]{Record(27,1,1)},new[]{Record(59),Record(68)},new[]{Record(59),Record(27,1,1),Record(68)},new[]{Record(33),Record(34,-1)},new[]{Record(17,7)}};Endpoint(Svg(new[]{Record(17,7),Record(9,10,20),Record(11,40,30)}.Concat(triggers[kind]).Concat(new[]{Record(31,2,1,3,1),Record(54,10,20)}).ToArray()),45,90);}
    [TestMethod] public void ScalingWindowUsesUnresolvedViewport()=>Endpoint(Svg(Record(17,7),Record(9,10,20),Record(11,40,30),Record(32,3,1,2,1),Record(54,30,40)),23,30);
    [TestMethod] public void DrawingResolvesIsotropicExtentsBeforeLaterScaling(){var svg=Svg(Record(17,7),Record(9,10,20),Record(11,40,30),Record(54,2,4),Record(31,2,1,3,1),Record(54,10,20));var line=svg.Elements().Last();Assert.AreEqual("30",line.Attribute("x2")?.Value);Assert.AreEqual("60",line.Attribute("y2")?.Value);}
    [TestMethod] public void NormalizationIsNotRepeatedForSubsequentGeometry(){var svg=Svg(Record(17,7),Record(9,3,100),Record(11,4,80),Record(54,3,100),Record(54,3,100));foreach(var line in svg.Elements()){Assert.AreEqual("2",line.Attribute("x2")?.Value);Assert.AreEqual("80",line.Attribute("y2")?.Value);}}
    [TestMethod] [DataRow(9,3,100)] [DataRow(11,2,80)] public void UnchangedSetterDoesNotInvalidateResolvedMapping(int type,int x,int y){var svg=Svg(Record(17,7),Record(9,3,100),Record(11,4,80),Record(54,3,100),Record((uint)type,x,y),Record(54,3,100));Assert.AreEqual("80",svg.Elements().Last().Attribute("y2")?.Value);}
    [TestMethod] [DataRow(31)] [DataRow(32)] public void SuccessfulUnitScalingInvalidatesResolvedMapping(int type){var svg=Svg(Record(17,7),Record(9,3,100),Record(11,4,80),Record(54,3,100),Record((uint)type,1,1,1,1),Record(54,3,100));Assert.AreEqual("67",svg.Elements().Last().Attribute("y2")?.Value);}

    [TestMethod]
    [DataRow(8,false,1,2,1,-3,5,-5)] [DataRow(8,false,-1,2,-1,-3,5,-5)]
    [DataRow(8,false,int.MaxValue,2,1073741822,-3,5,-5)] [DataRow(8,false,int.MinValue,-2,1073741824,-3,5,-5)]
    [DataRow(8,false,int.MinValue,1,int.MinValue,-3,5,-5)]
    [DataRow(8,true,1,2,3,-3,2,-5)] [DataRow(8,true,-1,2,3,-3,-2,-5)]
    [DataRow(8,true,int.MaxValue,2,3,-3,1073741821,-5)] [DataRow(8,true,int.MinValue,-2,3,-3,1073741824,-5)]
    [DataRow(8,true,int.MinValue,1,3,-3,int.MinValue,-5)]
    [DataRow(7,false,1,2,1,-3,2,-5)] [DataRow(7,false,-1,2,-1,-3,2,-5)]
    [DataRow(7,false,int.MaxValue,2,1073741822,-3,5,0)] [DataRow(7,false,int.MinValue,-2,1073741824,-3,5,0)]
    [DataRow(7,false,int.MinValue,1,int.MinValue,-3,5,0)]
    [DataRow(7,true,1,2,3,-3,2,-2)] [DataRow(7,true,-1,2,3,-3,-2,-2)]
    [DataRow(7,true,int.MaxValue,2,3,-3,5,-5)] [DataRow(7,true,int.MinValue,-2,3,-3,5,-5)]
    [DataRow(7,true,int.MinValue,1,3,-3,int.MinValue,int.MinValue)]
    public void MatchesNativeTruncationWrappingAndIsotropicState(int mode,bool viewport,int numerator,int denominator,int wx,int wy,int vx,int vy)=>Endpoint(Scaled(mode,viewport,numerator,denominator,wx,wy),vx,vy);

    [TestMethod] [DataRow(31,0)] [DataRow(31,1)] [DataRow(31,2)] [DataRow(31,3)] [DataRow(31,4)] [DataRow(31,5)] [DataRow(31,6)] [DataRow(31,7)]
    [DataRow(32,0)] [DataRow(32,1)] [DataRow(32,2)] [DataRow(32,3)] [DataRow(32,4)] [DataRow(32,5)] [DataRow(32,6)] [DataRow(32,7)]
    public void InvalidFactorsLeaveBothAxesUnchanged(int type,int kind){int[][] values={new[]{0,1,1,1},new[]{1,0,1,1},new[]{2,1,0,1},new[]{2,1,1,0},new[]{1,99,1,1},new[]{2,1,1,99},new[]{int.MinValue,-1,1,1},new[]{2,1,int.MinValue,-1}};Endpoint(Svg(Setup().Concat(new[]{Record((uint)type,values[kind]),Record(54,3,-3)}).ToArray()),5,-5);}
    [TestMethod] [DataRow(31,0)] [DataRow(31,1)] [DataRow(31,2)] [DataRow(31,3)] [DataRow(32,0)] [DataRow(32,1)] [DataRow(32,2)] [DataRow(32,3)]
    public void TruncatedScaleDoesNotReadFollowingRecord(int type,int count)=>Endpoint(Svg(Setup().Concat(new[]{Record((uint)type,new[]{2,1,3,1}.Take(count).ToArray()),Record(54,3,-3)}).ToArray()),5,-5);
    [TestMethod] [DataRow(31)] [DataRow(32)]
    public void WrappedZeroResultRejectsBothAxes(int type)=>Endpoint(Svg(Record(17,8),Record(9,2,-2),Record(11,4,-4),Record((uint)type,int.MinValue,1,2,1),Record(54,2,-2)),4,-4);
    [TestMethod] [DataRow(31)] [DataRow(32)]
    public void SaveRestoreRetainsPreviousExtents(int type)=>Endpoint(Svg(Setup().Concat(new[]{Record(33),Record((uint)type,2,1,3,1),Record(34,-1),Record(54,3,-3)}).ToArray()),5,-5);
    [TestMethod] [DataRow(1,31)] [DataRow(1,32)] [DataRow(2,31)] [DataRow(2,32)] [DataRow(3,31)] [DataRow(3,32)] [DataRow(4,31)] [DataRow(4,32)] [DataRow(5,31)] [DataRow(5,32)] [DataRow(6,31)] [DataRow(6,32)]
    public void FixedModesIgnoreValidAndInvalidRatios(int mode,int type){var window=mode switch{2=>2540,3=>25400,4=>1000,5=>10000,6=>14400,_=>1};foreach(var ratio in new[]{new[]{2,3,3,2},new[]{0,0,0,0}})Endpoint(Svg(Record(17,mode),Record((uint)type,ratio),Record(54,window,window)),mode==1?1:960,mode==1?1:-960);}
    [TestMethod] [DataRow(8,31,3,-7,3,-3)] [DataRow(8,32,5,-5,2,-4)] [DataRow(7,31,3,-3,3,-3)] [DataRow(7,32,3,-5,2,-4)]
    public void ScalesBothAxesBeforeIsotropicAdjustment(int mode,int type,int vx,int vy,int wx,int wy)=>Endpoint(Svg(Setup(mode).Concat(new[]{Record((uint)type,2,3,3,2),Record(54,wx,wy)}).ToArray()),vx,vy);
    [TestMethod] [DataRow(31,"10","-10")] [DataRow(32,"2.5","-2.5")]
    public void LogicalCurrentPointUsesUpdatedMapping(int type,string x,string y){var line=Line(Svg(Setup().Concat(new[]{Record(27,3,-3),Record((uint)type,2,1,2,1),Record(54,6,-6)}).ToArray()));Assert.AreEqual(x,line.Attribute("x1")?.Value);Assert.AreEqual(y,line.Attribute("y1")?.Value);}
    [TestMethod] [DataRow(31)] [DataRow(32)]
    public void RecordedPathRemainsInDeviceSpace(int type){var svg=Svg(Setup().Concat(new[]{Record(59),Points(3),Record(60),Record((uint)type,2,1,3,1),Record(63,0,0,39,39)}).ToArray());Assert.AreEqual("M 8.333 8.333 L 58.333 8.333 L 33.333 58.333 Z",svg.Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);}
    [TestMethod] [DataRow(31)] [DataRow(32)]
    public void DeviceClipIsNotRemapped(int type){var svg=Svg(Setup().Concat(new[]{MetafileRegionClipFixtures.Region(),Record((uint)type,2,1,3,1),Record(54,3,-3)}).ToArray());Assert.AreEqual("url(#clip1)",Line(svg).Attribute("clip-path")?.Value);Assert.AreEqual("M 5 6 L 35 6 L 35 36 L 5 36 Z",svg.Descendants().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);}
    [TestMethod] [DataRow(31)] [DataRow(32)]
    public async Task HtmlRendersScaledGeometryWithoutChangingSource(int type){var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(Setup().Concat(new[]{Record((uint)type,2,1,3,1),Record(54,type==31?3:6,type==31?-3:-9)}).ToArray()));var item=new HmiGraphicView{Name="ExtentScale",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);Endpoint(XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!,type==31?10:5,type==31?-15:-5);Assert.AreEqual(uri,item.Source!.StaticValue);}
}
