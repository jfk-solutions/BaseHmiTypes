using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class BarTrackColorHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach(var direction in Enum.GetValues<HmiFillDirection>())
        foreach(var origin in new[]{false,true}) foreach(var scale in new[]{false,true})
        for(var kind=0;kind<3;kind++) yield return [direction,origin,scale,kind];
    }
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task SeparatesTrackFromWidgetBackground(HmiFillDirection direction,bool origin,bool scale,int kind)
    {
        var blue=HmiColor.FromArgb(255,0,0,255);var gray=HmiColor.FromArgb(255,128,128,128);
        var bar=new HmiBar{BeginValue=0,EndValue=100,Value=25,FillDirection=direction,ShowScale=scale,
            OriginValue=origin?HmiProperty.Static(50d):null,BackgroundColor=blue,ForegroundColor=HmiColor.FromArgb(255,0,255,0)};
        bar.TrackColor=kind==0?null:kind==1?HmiProperty.Static(gray):HmiProperty.Tag("Track.Color",gray);
        var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,"background-color: #0000FF;");
        if(!origin)StringAssert.Contains(html,"data-hmi-bar-track=\"true\"");
        else StringAssert.Contains(html,"background: var(--hmi-bar-track-background, #eeeeee);");
        StringAssert.Contains(html,"--hmi-bar-track-background: #0000FF;");
        Assert.AreEqual(kind!=0,html.Contains("--hmi-bar-track-background: #808080 !important;",StringComparison.Ordinal));
        if(kind!=0)Assert.AreEqual(gray,bar.TrackColor!.StaticValue);
    }
}
