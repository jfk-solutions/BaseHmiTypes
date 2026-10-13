using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class SymbolicOutputRangeHtmlTests
{
    [TestMethod]
    public async Task OutputCaptionKeepsLinesAndSelectsRangesBeforeDefault()
    {
        var field = new HmiSymbolicIOField { Name = "Mode", Value = 12, ReadOnly = true, ShowDropDownButton = false };
        field.States.Add(new() { Value = 1, IsDefault = true, Text = HmiMultilingualText.FromText("Fallback") });
        field.States.Add(new() { Value = 10, MaximumValue = 15, Text = HmiMultilingualText.FromText("Pre-selection\r\nMaintenance") });
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(field);
        var renderer = new HmiScreenToHtmlConverter();
        var html = await renderer.ConvertAsync(screen);
        StringAssert.Contains(html, "role=\"status\"");
        StringAssert.Contains(html, "white-space: pre-wrap");
        StringAssert.Contains(html, "Pre-selection\r\nMaintenance");
        Assert.IsFalse(html.Contains("<select"));
        field.Value = 99;
        StringAssert.Contains(await renderer.ConvertAsync(screen), ">Fallback</div>");
        var coordinate = new HmiIOField { Name = "Coordinate", Text = HmiMultilingualText.FromText("0"), OutputFormat = "{I3}" };
        layer.Items.Add(coordinate);
        StringAssert.Contains(await renderer.ConvertAsync(screen), "value=\"000\"");
        coordinate.Text = HmiMultilingualText.FromText("-7");
        StringAssert.Contains(await renderer.ConvertAsync(screen), "value=\"-007\"");
    }
}
