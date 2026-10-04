using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class GaugeNeedleHtmlTests
{
    [TestMethod]
    [DataRow(false, false, false)] [DataRow(false, false, true)]
    [DataRow(false, true, false)] [DataRow(false, true, true)]
    [DataRow(true, false, false)] [DataRow(true, false, true)]
    [DataRow(true, true, false)] [DataRow(true, true, true)]
    public async Task EmitsConfiguredNeedleProperties(bool width, bool color, bool tagged)
    {
        var gauge = new HmiGauge { Width = 200, Height = 200, Value = 25, BeginValue = 0, EndValue = 100 };
        if (width) gauge.NeedleWidth = tagged ? HmiProperty.Tag("Gauge.Width", 3d) : HmiProperty.Static(3d);
        if (color) gauge.NeedleColor = tagged ? HmiProperty.Tag("Gauge.Color", HmiColor.FromArgb(128, 255, 0, 0)) : HmiProperty.Static(HmiColor.FromArgb(128, 255, 0, 0));
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(gauge);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var element = Regex.Match(html, "<hmi-gauge[^>]*>").Value;
        Assert.AreEqual(width || color, element.Contains("show-needle", StringComparison.Ordinal));
        Assert.AreEqual(width, element.Contains("needle-width=\"3\"", StringComparison.Ordinal));
        Assert.AreEqual(color, element.Contains("needle-color=\"rgba(255,0,0,0.502)\"", StringComparison.Ordinal));
    }
}
