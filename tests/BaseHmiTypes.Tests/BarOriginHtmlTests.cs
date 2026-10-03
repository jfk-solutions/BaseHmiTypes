using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class BarOriginHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        var spans = new (double Origin, double Value, string Start, string Length)[]
        { (50,25,"25","25"), (50,50,"50","0"), (50,75,"50","25"), (50,-25,"0","50"),
          (50,125,"50","50"), (-25,50,"0","50"), (125,50,"50","50") };
        foreach (var direction in new[] {HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right})
        foreach (var span in spans)
        foreach (var tagged in new[] {false,true})
        foreach (var scale in new[] {false,true})
            yield return [direction,span.Origin,span.Value,span.Start,span.Length,tagged,scale];
    }

    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task FillsFromOrigin(HmiFillDirection direction,double origin,double value,string start,string length,bool tagged,bool scale)
    {
        var bar = new HmiBar {Name="Origin",BeginValue=0,EndValue=100,Value=value,FillDirection=direction,ShowScale=scale};
        bar.OriginValue=tagged?HmiProperty.Tag("Bar.Origin",origin):HmiProperty.Static(origin);
        var html=await Convert(bar);
        var fill=Regex.Match(html,"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        StringAssert.Contains(fill,$"data-origin-value=\"{origin}\"");
        var edge=direction switch {HmiFillDirection.Up=>"bottom",HmiFillDirection.Down=>"top",HmiFillDirection.Left=>"right",_=>"left"};
        StringAssert.Contains(fill,$"{edge}: {start}%;");
        StringAssert.Contains(fill,$"{(direction is HmiFillDirection.Up or HmiFillDirection.Down?"height":"width")}: {length}%;");
        StringAssert.Contains(html,$"value=\"{Math.Clamp(value,0,100)}\"");
        StringAssert.Contains(fill,"aria-hidden=\"true\"");
        Assert.AreEqual(scale,html.Contains("data-hmi-bar-scale",StringComparison.Ordinal));
    }

    [TestMethod]
    [DataRow(false,0)] [DataRow(false,1)] [DataRow(false,2)] [DataRow(false,3)]
    [DataRow(true,0)] [DataRow(true,1)] [DataRow(true,2)] [DataRow(true,3)]
    public async Task KeepsLegacyMeterWithoutFiniteOrigin(bool vertical,int kind)
    {
        var bar=new HmiBar{BeginValue=0,EndValue=100,Value=25,FillDirection=vertical?HmiFillDirection.Up:HmiFillDirection.Right};
        if(kind!=0)bar.OriginValue=HmiProperty.Static(kind==1?double.NaN:kind==2?double.PositiveInfinity:double.NegativeInfinity);
        var html=await Convert(bar);
        Assert.IsFalse(html.Contains("data-hmi-bar-origin",StringComparison.Ordinal));
        StringAssert.Contains(html,"<meter");
    }

    [TestMethod]
    [DataRow(false)] [DataRow(true)]
    public async Task KeepsThresholdAndDisabledFillColors(bool disabled)
    {
        var bar=new HmiBar{BeginValue=0,EndValue=100,Value=25,OriginValue=50,UseThresholdFillColors=true,
            Enabled=!disabled,UseDisabledForegroundColor=true,DisabledForegroundColor=HmiColor.FromArgb(255,255,0,0)};
        bar.Thresholds.Add(new(){Value=50,Color=HmiColor.FromArgb(255,0,0,255)});
        var fill=Regex.Match(await Convert(bar),"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        StringAssert.Contains(fill,disabled?"color: #FF0000;":"color: #0000FF;");
    }

    [TestMethod]
    [DataRow(2.5e307,"25","25")]
    [DataRow(5e307,"50","0")]
    [DataRow(7.5e307,"50","25")]
    public async Task HandlesLargeFiniteRangesWithoutOverflow(double value,string start,string length)
    {
        var bar=new HmiBar{BeginValue=0,EndValue=1e308,OriginValue=5e307,Value=value};
        var fill=Regex.Match(await Convert(bar),"<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        StringAssert.Contains(fill,$"left: {start}%; width: {length}%;");
    }

    private static ValueTask<string> Convert(HmiBar bar)
    {
        var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);
        return new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
