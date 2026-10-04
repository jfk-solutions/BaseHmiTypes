using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class BarFillColorHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach(var direction in Enum.GetValues<HmiFillDirection>())foreach(var origin in new[]{false,true})foreach(var scale in new[]{false,true})
        for(var kind=0;kind<3;kind++)for(var priority=0;priority<3;priority++)yield return [direction,origin,scale,kind,priority];
    }
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task KeepsIndependentFillAndColorPriorities(HmiFillDirection direction,bool origin,bool scale,int kind,int priority)
    {
        var green=HmiColor.FromArgb(255,0,255,0);var red=HmiColor.FromArgb(255,255,0,0);var blue=HmiColor.FromArgb(255,0,0,255);
        var bar=new HmiBar{BeginValue=0,EndValue=100,Value=25,FillDirection=direction,ShowScale=scale,OriginValue=origin?HmiProperty.Static(50d):null,
            ForegroundColor=blue,TrackColor=HmiColor.FromArgb(255,128,128,128),FillColor=kind==0?null:kind==1?HmiProperty.Static(green):HmiProperty.Tag("Fill.Color",green),
            Enabled=priority!=2,UseDisabledForegroundColor=true,DisabledForegroundColor=red,UseThresholdFillColors=priority!=0};
        bar.Thresholds.Add(new(){Value=50,Color=HmiColor.FromArgb(255,255,255,0)});
        var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var fill=origin?Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value:Regex.Matches(html,"<meter[^>]*>").Last().Value;
        var expected=priority==2?"#FF0000":priority==1?"#FFFF00":"#00FF00";
        Assert.AreEqual(kind!=0,fill.Contains($"color: {expected} !important;",StringComparison.Ordinal));
        StringAssert.Contains(html,"--hmi-bar-track-background: #808080 !important;");Assert.AreEqual(blue,bar.ForegroundColor!.StaticValue);
    }
}
