using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Globalization;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class BarTangentHtmlTests
{
    private static readonly double[][] Coordinates=[
        [0,.25,.3105256773619622,.41349811010997795,1],
        [0,.4323634543204362,.5,.5676365456795637,1],
        [0,.586501889890022,.6894743226380378,.75,1]];
    public static IEnumerable<object[]> Cases()
    {
        for(var pivot=0;pivot<3;pivot++)foreach(var direction in Enum.GetValues<HmiFillDirection>())
        for(var index=0;index<5;index++)foreach(var tagged in new[]{false,true})foreach(var scale in new[]{false,true})
            yield return [pivot,direction,index,tagged,scale];
    }
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task TransformsFillThresholdAndTickPositions(int pivot,HmiFillDirection direction,int index,bool tagged,bool scale)
    {
        var bar=new HmiBar {BeginValue=-50,EndValue=150,OriginValue=0,Value=-50+index*50,ValueMapping=HmiBarValueMapping.Tangent,
            FillDirection=direction,ShowScale=scale,DivisionCount=4,SubDivisionCount=2};
        bar.TangentPivotPercent=tagged?HmiProperty.Tag("Bar.Pivot",25d+pivot*25):HmiProperty.Static(25d+pivot*25);
        bar.Thresholds.Add(new(){Value=-50+index*50});var html=await Convert(bar);
        var origin=Coordinates[pivot][1]*100;var value=Coordinates[pivot][index]*100;
        var edge=direction switch {HmiFillDirection.Up=>"bottom",HmiFillDirection.Down=>"top",HmiFillDirection.Left=>"right",_=>"left"};
        var vertical=direction is HmiFillDirection.Up or HmiFillDirection.Down;
        var fill=Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        NearCss(fill,edge,Math.Min(origin,value));NearCss(fill,vertical?"height":"width",Math.Abs(origin-value));
        NearCss(Regex.Match(html,"<span[^>]*data-hmi-bar-threshold[^>]*>").Value,edge,value);
        if(scale)
        {
            var reverse=direction is HmiFillDirection.Up or HmiFillDirection.Left;
            var mark=(reverse?100-origin:origin).ToString("0.###",CultureInfo.InvariantCulture);
            StringAssert.Contains(html,$"{(vertical?"y1":"x1")}=\"{mark}%\"");StringAssert.Contains(html,"data-hmi-minor-tick");
        }
        Assert.AreEqual(0d,bar.OriginValue!.StaticValue);Assert.AreEqual(25d+pivot*25,bar.TangentPivotPercent.StaticValue);
    }
    [TestMethod]
    [DataRow(false)] [DataRow(true)]
    public async Task OmittedPivotUsesNormalizedOriginOrMidpoint(bool noOrigin)
    {
        var bar=new HmiBar {BeginValue=-50,EndValue=150,Value=50,ValueMapping=HmiBarValueMapping.Tangent};
        if(!noOrigin)bar.OriginValue=0;
        var fill=Regex.Match(await Convert(bar),"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        NearCss(fill,"width",noOrigin?50:6.05256773619622);Assert.IsNull(bar.TangentPivotPercent);
    }
    [TestMethod]
    [DataRow(0d,false)] [DataRow(0d,true)] [DataRow(100d,false)] [DataRow(100d,true)]
    public async Task EndpointPivotsUseFiniteContinuousLimits(double pivot,bool maximum)
    {
        var bar=new HmiBar {BeginValue=0,EndValue=100,Value=maximum?100:0,ValueMapping=HmiBarValueMapping.Tangent,TangentPivotPercent=pivot};
        var fill=Regex.Match(await Convert(bar),"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        Assert.IsFalse(fill.Contains("NaN",StringComparison.Ordinal));NearCss(fill,"width",maximum?100:0);
    }
    [TestMethod]
    [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)] [DataRow(double.NegativeInfinity)]
    public async Task InvalidPivotKeepsLinearPreview(double pivot)
    {
        var bar=new HmiBar {BeginValue=0,EndValue=100,OriginValue=0,Value=50,ValueMapping=HmiBarValueMapping.Tangent,TangentPivotPercent=HmiProperty.Static(pivot)};
        NearCss(Regex.Match(await Convert(bar),"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value,"width",50);
    }
    private static void NearCss(string html,string property,double expected)
    {
        var match=Regex.Match(html,$"{property}: ([0-9.]+)%");Assert.IsTrue(match.Success,html);
        Assert.AreEqual(expected,double.Parse(match.Groups[1].Value,CultureInfo.InvariantCulture),.00051);
    }
    private static ValueTask<string> Convert(HmiBar bar){var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);return new HmiScreenToHtmlConverter().ConvertAsync(screen);}
}
