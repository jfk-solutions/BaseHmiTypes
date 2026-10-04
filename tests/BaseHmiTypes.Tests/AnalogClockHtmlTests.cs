using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class AnalogClockHtmlTests
{
    private static async Task<string> Render(HmiClock clock)
    {
        var screen=new HmiScreen(); var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(clock);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        return Regex.Match(html,"<time\\b[\\s\\S]*?</time>").Value;
    }
    [TestMethod] public async Task AnalogDrawsDialTicksAndHandsAtFixedSampleTime()
    {
        var html=await Render(new HmiClock { Analog=true, ShowSeconds=true });
        StringAssert.Contains(html,"data-clock-preview=\"static\"");
        StringAssert.Contains(html,"viewBox=\"0 0 100 100\""); StringAssert.Contains(html,"preserveAspectRatio=\"xMidYMid meet\"");
        Assert.AreEqual(60,Regex.Matches(html,"data-clock-tick=").Count);
        foreach(var angle in new[]{17,204,336})StringAssert.Contains(html,$"rotate({angle} 50 50)");
        StringAssert.Contains(html,"data-clock-hand=\"hour\" points=\"50,49.76 47.6,46.4 50,26 52.4,46.4 50,49.76\"");
        StringAssert.Contains(html,"datetime=\"2000-01-01T12:34:56\"");
    }
    [TestMethod] public async Task VisibilityAndOutlineSettingsAreHonored()
    {
        var html=await Render(new HmiClock { Analog=true,ShowTicks=false,ShowHours=false,ShowSeconds=true,OutlinedHands=true,ShowDate=true });
        Assert.IsFalse(html.Contains("data-clock-tick=")); Assert.IsFalse(html.Contains("data-clock-hand=\"hour\""));
        StringAssert.Contains(html,"data-clock-hand=\"minute\"");StringAssert.Contains(html,"fill=\"none\"");
        StringAssert.Contains(html,"data-clock-date=\"true\">2000-01-01");
        html=await Render(new HmiClock { Analog=true,ShowTime=false });
        Assert.IsFalse(html.Contains("data-clock-hand="));Assert.IsFalse(html.Contains("data-clock-hub="));
    }
    [TestMethod] [DataRow(-5d)] [DataRow(0d)] [DataRow(200d)] [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)]
    public async Task PercentagesAreFiniteClampedAndZeroHidesHand(double value)
    {
        var html=await Render(new HmiClock { Analog=true, HourHandLengthPercent=value,HourHandHalfWidthPercent=value });
        Assert.IsFalse(html.Contains("NaN"));Assert.IsFalse(html.Contains("Infinity"));
        Assert.AreEqual(value>0||double.IsNaN(value),html.Contains("data-clock-hand=\"hour\""));
    }
    [TestMethod] public async Task DigitalOutputIsUnchanged()
    {
        var html=await Render(new HmiClock { Analog=false,ShowSeconds=true,ShowDate=true });
        Assert.IsFalse(html.Contains("data-clock-dial="));StringAssert.Contains(html,">2000-01-01 12:34:56</time>");
    }
    [TestMethod] [DataRow(false)] [DataRow(true)] public async Task ColorsAndPercentagesUseStaticOrTagFallback(bool tagged)
    {
        HmiProperty<HmiColor> Color(HmiColor value)=>tagged?HmiProperty.Tag("Color",value):HmiProperty.Static(value);
        var html=await Render(new HmiClock { Analog=true,ForegroundColor=Color(HmiColor.FromArgb(255,0,0,255)),
            TicksColor=Color(HmiColor.FromArgb(255,255,0,0)), HandFillColor=Color(HmiColor.FromArgb(255,0,255,0)),
            HourHandLengthPercent=tagged?HmiProperty.Tag("Length",80d):HmiProperty.Static(80d), HourHandHalfWidthPercent=20d });
        StringAssert.Contains(html,"fill=\"#FF0000\"");StringAssert.Contains(html,"stroke=\"#0000FF\" fill=\"#00FF00\"");
        StringAssert.Contains(html,"points=\"50,49.616 42.32,44.24 50,11.6 57.68,44.24 50,49.616\"");
    }
}
