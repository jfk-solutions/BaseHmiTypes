using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class GaugeTickLengthHtmlTests
{
    [TestMethod]
    [DataRow(-1, false)]
    [DataRow(-1, true)]
    [DataRow(0, false)]
    [DataRow(0, true)]
    [DataRow(6, false)]
    [DataRow(6, true)]
    [DataRow(12, false)]
    [DataRow(12, true)]
    [DataRow(1000, false)]
    [DataRow(1000, true)]
    public async Task ExportsConfiguredPixelLength(int length, bool tagged)
    {
        var gauge = new HmiGauge { Name = "Ticks" };
        gauge.MajorTickLength = tagged ? HmiProperty.Tag("Gauge.TickLength", length) : HmiProperty.Static(length);
        var html = await Convert(gauge);
        StringAssert.Contains(html, $"major-tick-length=\"{length}\"");
    }

    [TestMethod]
    public async Task OmitsUnconfiguredLength()
    {
        Assert.IsFalse((await Convert(new HmiGauge())).Contains("major-tick-length=", StringComparison.Ordinal));
    }

    private static async Task<string> Convert(HmiGauge gauge)
    {
        var screen = new HmiScreen();
        var layer = new HmiLayer();
        layer.Items.Add(gauge);
        screen.Layers.Add(layer);
        return await new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
