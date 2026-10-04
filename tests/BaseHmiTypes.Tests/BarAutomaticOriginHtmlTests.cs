using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class BarAutomaticOriginHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var direction in Enum.GetValues<HmiFillDirection>())
        foreach (var position in new[] {25d,50d,75d})
        foreach (var value in new[] {0d,20d,60d})
        foreach (var tagged in new[] {false,true})
        foreach (var showScale in new[] {false,true}) yield return [direction,position,value,tagged,showScale];
    }

    [TestMethod, DynamicData(nameof(Cases))]
    public async Task CoordinatesFillThresholdAndTicksTogether(HmiFillDirection direction,double position,double value,bool tagged,bool showScale)
    {
        // Unequal domains around 20: [-20,20] and [20,100]. Midpoints must land
        // halfway along the chosen physical side, not on a single global scale.
        var bar=new HmiBar {BeginValue=-20,EndValue=100,OriginValue=20,Value=value,UseAutoScaling=true,
            FillDirection=direction,ShowScale=showScale,DivisionCount=3,SubDivisionCount=2};
        bar.OriginPositionPercent=tagged?HmiProperty.Tag("Bar.Position",position):HmiProperty.Static(position);
        bar.Thresholds.Add(new(){Value=value});
        var html=await Convert(bar);
        var fill=Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        var valuePosition=value<20?position/2:value==20?position:position+(100-position)/2;
        var start=Math.Min(position,valuePosition);var length=Math.Abs(position-valuePosition);
        var edge=direction switch {HmiFillDirection.Up=>"bottom",HmiFillDirection.Down=>"top",HmiFillDirection.Left=>"right",_=>"left"};
        var vertical=direction is HmiFillDirection.Up or HmiFillDirection.Down;
        StringAssert.Contains(fill,FormattableString.Invariant($"{edge}: {start}%;"));
        StringAssert.Contains(fill,FormattableString.Invariant($"{(vertical?"height":"width")}: {length}%;"));
        var threshold=Regex.Match(html,"<span[^>]*data-hmi-bar-threshold[^>]*>").Value;
        StringAssert.Contains(threshold,FormattableString.Invariant($"{edge}: {valuePosition}%;"));
        if (showScale)
        {
            var reverse=direction is HmiFillDirection.Up or HmiFillDirection.Left;
            var displayed=reverse?100-position:position;
            StringAssert.Contains(html,$"{(vertical?"top":"left")}: {displayed}%;");
            StringAssert.Contains(html,$"{(vertical?"y1":"x1")}=\"{displayed}%\"");
            StringAssert.Contains(html,"data-hmi-minor-tick");
        }
        Assert.AreEqual(-20d,bar.BeginValue!.StaticValue);Assert.AreEqual(100d,bar.EndValue!.StaticValue);
        Assert.AreEqual(position,bar.OriginPositionPercent.StaticValue);
    }

    [TestMethod]
    [DataRow(0d,"20","100","0","50")]
    [DataRow(100d,"-60","20","50","50")]
    public async Task EndpointPositionUsesTheNoncollapsedDomain(double position,string minimum,string maximum,string start,string length)
    {
        var bar=new HmiBar {BeginValue=-60,EndValue=100,OriginValue=20,OriginPositionPercent=position,
            UseAutoScaling=true,Value=position==0?60:-20,ShowScale=true};
        var html=await Convert(bar);
        StringAssert.Contains(html,$"min=\"{minimum}\" max=\"{maximum}\"");
        var fill=Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        StringAssert.Contains(fill,$"left: {start}%; width: {length}%;");
    }

    [TestMethod]
    [DataRow(-1d,true)] [DataRow(101d,true)] [DataRow(double.NaN,true)]
    [DataRow(double.PositiveInfinity,true)] [DataRow(25d,false)]
    public async Task InvalidOrDisabledPositionKeepsLinearPreview(double position,bool enabled)
    {
        var bar=new HmiBar {BeginValue=-60,EndValue=100,OriginValue=20,OriginPositionPercent=HmiProperty.Static(position),
            UseAutoScaling=enabled,Value=-20};
        var fill=Regex.Match(await Convert(bar),"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        StringAssert.Contains(fill,"left: 25%; width: 25%;");
    }

    private static ValueTask<string> Convert(HmiBar bar)
    {
        var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);
        return new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
