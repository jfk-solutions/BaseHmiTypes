using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Net;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class GaugeCurrentValueHtmlTests
{
    [TestMethod]
    [DataRow(false, false)] [DataRow(false, true)]
    [DataRow(true, false)] [DataRow(true, true)]
    public async Task CurrentValueVisibilityOverridesLegacySetting(bool visible, bool legacy)
    {
        var gauge = new HmiGauge { CurrentValueVisible = visible, ShowValue = legacy };
        Assert.AreEqual(visible, (await Element(gauge)).Contains(" show-value", StringComparison.Ordinal));
    }

    [TestMethod]
    [DataRow(false)] [DataRow(true)]
    public async Task EmitsIndependentCurrentValuePresentation(bool tagged)
    {
        var gauge = new HmiGauge
        {
            CurrentValueDecimalPlaces = tagged ? HmiProperty.Tag("Gauge.Precision", 2) : HmiProperty.Static(2),
            CurrentValueColor = tagged ? HmiProperty.Tag("Gauge.Color", HmiColor.FromArgb(128, 255, 0, 0)) : HmiProperty.Static(HmiColor.FromArgb(128, 255, 0, 0)),
            CurrentValueFont = new HmiFont { Name = "Value & Font", Size = 18, Weight = 600, Italic = true, Underline = true, Strikethrough = true },
            LabelFont = new HmiFont { Name = "Tick Font", Size = 6 }
        };
        var element = WebUtility.HtmlDecode(await Element(gauge));
        StringAssert.Contains(element, "current-value-decimal-places=\"2\"");
        StringAssert.Contains(element, "current-value-color=\"rgba(255,0,0,0.502)\"");
        StringAssert.Contains(element, "current-value-font=\"{\"name\":\"Value & Font\",\"size\":18,\"weight\":600,\"italic\":true,\"underline\":true,\"strikethrough\":true}");
        StringAssert.Contains(element, "label-font=\"{\"name\":\"Tick Font\",\"size\":6}");
    }

    [TestMethod]
    public async Task UnconfiguredPresentationRetainsLegacyDefaults()
    {
        var element = await Element(new HmiGauge());
        StringAssert.Contains(element, " show-value");
        Assert.IsFalse(element.Contains("current-value-", StringComparison.Ordinal));
        Assert.IsFalse((await Element(new HmiGauge { ShowValue = false })).Contains(" show-value", StringComparison.Ordinal));
    }

    private static async Task<string> Element(HmiGauge gauge)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer();
        screen.Layers.Add(layer); layer.Items.Add(gauge);
        return Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<hmi-gauge[^>]*>").Value;
    }
}
