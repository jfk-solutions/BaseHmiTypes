using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Globalization;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class BarNonlinearValueMappingHtmlTests
{
    private static readonly HmiBarValueMapping[] Mappings=[HmiBarValueMapping.NormalizedLogarithmic,
        HmiBarValueMapping.InverseNormalizedLogarithmic,HmiBarValueMapping.Quadratic,HmiBarValueMapping.Cubic];
    // Frozen normalized-coordinate fixtures derived from BarGraph.oll's 1/100/101
    // constants and branches. Negative physical endpoints distinguish range
    // normalization from a logarithm/power of the raw process value.
    private static readonly double[][] Coordinates=[
        [0,.7059613126314263,.8519443031609923,.9383792523906672,1],
        [0,.06162074760933278,.14805569683900766,.29403868736857375,1],
        [0,.0625,.25,.5625,1],[0,.015625,.125,.421875,1]];
    public static IEnumerable<object[]> Cases()
    {
        for(var mapping=0;mapping<4;mapping++)
        foreach(var direction in Enum.GetValues<HmiFillDirection>())
        for(var value=0;value<5;value++)
        foreach(var tagged in new[]{false,true})
        foreach(var showScale in new[]{false,true}) yield return [mapping,direction,value,tagged,showScale];
    }
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task MapsAllPhysicalCoordinates(int mapping,HmiFillDirection direction,int index,bool tagged,bool showScale)
    {
        var bar=new HmiBar {BeginValue=-50,EndValue=150,OriginValue=0,Value=-50+index*50,
            FillDirection=direction,ShowScale=showScale,DivisionCount=4,SubDivisionCount=2};
        bar.ValueMapping=tagged?HmiProperty.Tag("Bar.Mapping",Mappings[mapping]):HmiProperty.Static(Mappings[mapping]);
        bar.Thresholds.Add(new(){Value=-50+index*50});
        var html=await Convert(bar);var origin=Coordinates[mapping][1]*100;var value=Coordinates[mapping][index]*100;
        var edge=direction switch {HmiFillDirection.Up=>"bottom",HmiFillDirection.Down=>"top",HmiFillDirection.Left=>"right",_=>"left"};
        var vertical=direction is HmiFillDirection.Up or HmiFillDirection.Down;
        var fill=Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        NearCss(fill,edge,Math.Min(origin,value));NearCss(fill,vertical?"height":"width",Math.Abs(origin-value));
        NearCss(Regex.Match(html,"<span[^>]*data-hmi-bar-threshold[^>]*>").Value,edge,value);
        if(showScale)
        {
            var reverse=direction is HmiFillDirection.Up or HmiFillDirection.Left;
            var mark=(reverse?100-origin:origin).ToString("0.###",CultureInfo.InvariantCulture);
            StringAssert.Contains(html,$"{(vertical?"top":"left")}: {mark}%;");
            StringAssert.Contains(html,$"{(vertical?"y1":"x1")}=\"{mark}%\"");
            StringAssert.Contains(html,"data-hmi-minor-tick");
        }
        Assert.AreEqual(-50d,bar.BeginValue!.StaticValue);Assert.AreEqual(150d,bar.EndValue!.StaticValue);
    }
    [TestMethod]
    [DataRow(1)] [DataRow(2)] [DataRow(5)] [DataRow(6)]
    public async Task NonlinearBarWithoutOriginUsesAVisibleTransformedFill(int mapping)
    {
        var bar=new HmiBar {BeginValue=-50,EndValue=150,Value=50,ValueMapping=(HmiBarValueMapping)mapping};
        var html=await Convert(bar);StringAssert.Contains(html,"data-hmi-bar-origin-fill");
        Assert.IsNull(bar.OriginValue);StringAssert.Contains(html,"data-origin-value=\"-50\"");
    }
    [TestMethod]
    [DataRow(1,false)] [DataRow(2,false)] [DataRow(5,false)] [DataRow(6,false)]
    [DataRow(1,true)] [DataRow(2,true)] [DataRow(5,true)] [DataRow(6,true)]
    public async Task ClipsProcessValuesToTheTransformedRange(int mapping,bool above)
    {
        var bar=new HmiBar {BeginValue=-50,EndValue=150,Value=above?1e9:-1e9,ValueMapping=(HmiBarValueMapping)mapping};
        var fill=Regex.Match(await Convert(bar),"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        NearCss(fill,"width",above?100:0);
    }
    private static void NearCss(string html,string property,double expected)
    {
        var match=Regex.Match(html,$"{property}: ([0-9.]+)%");Assert.IsTrue(match.Success,html);
        Assert.AreEqual(expected,double.Parse(match.Groups[1].Value,CultureInfo.InvariantCulture),.00051);
    }
    private static ValueTask<string> Convert(HmiBar bar)
    {
        var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);
        return new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
