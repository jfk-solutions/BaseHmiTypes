using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class BarHatchPatternHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach(var style in Enumerable.Range(0,53).Concat(new[]{-1,53,65535}))
        foreach(var direction in Enum.GetValues<HmiFillDirection>())
        foreach(var tagged in new[]{false,true}) yield return [style,direction,tagged];
    }
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task PreservesDeviceHatchAndColorPriorities(int hatch,HmiFillDirection direction,bool tagged)
    {
        var priority=(hatch+65536)%3;
        var bar=new HmiBar{Width=100,Height=80,BeginValue=0,EndValue=100,Value=25,OriginValue=hatch%2==0?HmiProperty.Static(50d):null,
            FillDirection=direction,FillStyle=HmiBarFillStyle.HatchPattern,HatchStyle=tagged?HmiProperty.Tag("Hatch.Style",hatch):HmiProperty.Static(hatch),
            PatternColor=HmiColor.FromArgb(128,0,255,0),FillColor=HmiColor.FromArgb(255,128,128,128),Enabled=priority!=2,
            UseDisabledForegroundColor=true,DisabledForegroundColor=HmiColor.FromArgb(255,255,0,0),UseThresholdFillColors=priority==1};
        bar.Thresholds.Add(new(){Value=50,Color=HmiColor.FromArgb(255,255,255,0)});
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(bar);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var fill=Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        StringAssert.Contains(fill,$"data-hmi-bar-hatch-style=\"{hatch}\"");
        Assert.IsFalse(fill.Contains("data-hmi-bar-bitmap=",StringComparison.Ordinal));
        StringAssert.Contains(fill,hatch is <0 or >52?"color: transparent !important;":$"color: {(priority==2?"#FF0000":priority==1?"#FFFF00":"#808080")} !important;");
        StringAssert.Contains(html,"value=\"25\"");
    }
}
