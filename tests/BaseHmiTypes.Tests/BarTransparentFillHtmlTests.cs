using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class BarTransparentFillHtmlTests
{
    public static IEnumerable<object[]> Cases(){foreach(var direction in Enum.GetValues<HmiFillDirection>())foreach(var origin in new[]{false,true})foreach(var scale in new[]{false,true})foreach(var transparent in new[]{false,true})for(var priority=0;priority<3;priority++)yield return [direction,origin,scale,transparent,priority];}
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task TransparencyDoesNotEraseMeterOrOtherRegions(HmiFillDirection direction,bool origin,bool scale,bool transparent,int priority)
    {
        var bar=new HmiBar{BeginValue=0,EndValue=100,Value=25,FillDirection=direction,ShowScale=scale,OriginValue=origin?HmiProperty.Static(50d):null,FillStyle=transparent?HmiBarFillStyle.Transparent:HmiBarFillStyle.Solid,
            ForegroundColor=HmiColor.FromArgb(255,0,255,0),TrackColor=HmiColor.FromArgb(255,128,128,128),Enabled=priority!=2,UseDisabledForegroundColor=true,DisabledForegroundColor=HmiColor.FromArgb(255,255,0,0),UseThresholdFillColors=priority!=0};
        bar.Thresholds.Add(new(){Value=50,Color=HmiColor.FromArgb(255,255,255,0)});
        var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var fill=origin?Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value:Regex.Matches(html,"<meter[^>]*>").Last().Value;
        Assert.AreEqual(transparent,fill.Contains("color: transparent !important;",StringComparison.Ordinal));
        StringAssert.Contains(html,"value=\"25\"");StringAssert.Contains(html,"--hmi-bar-track-background: #808080 !important;");
        Assert.AreEqual(scale,html.Contains("data-hmi-bar-scale",StringComparison.Ordinal));StringAssert.Contains(html,"data-hmi-bar-threshold");
    }
}
