using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class TogglePaletteHtmlTests
{
    [TestMethod] [DataRow(0d)] [DataRow(1d)]
    public async Task SwitchPalettesStayIndependentFromStatesAndThumbs(double value)
    {
        var item = new HmiToggleSwitch { Name = "Palette", Width = 120, Height = 30, State = value,
            HeaderForegroundColor = HmiColor.FromArgb(255,119,136,153),
            OffBackgroundColor = HmiProperty.Tag("Palette.Off",HmiColor.FromArgb(0,17,34,51)),
            OnBackgroundColor = HmiColor.FromArgb(255,68,85,102) };
        item.States.Add(new() { Value = 0, Text = HmiMultilingualText.FromText("Off <A>") });
        item.States.Add(new() { Value = 1, Text = HmiMultilingualText.FromText("On & B") });
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(item);
        var renderer = new HmiScreenToHtmlConverter();
        string Root(string html) => Regex.Match(html,"<hmi-toggle-switch[^>]*id=\"Palette\"[^>]*>").Value;
        var root = Root(await renderer.ConvertAsync(screen));
        foreach (var expected in new[] { "--hmi-toggle-off-background:rgba(17,34,51,0);", "--hmi-toggle-on-background:#445566;", "--hmi-toggle-header-foreground:#778899;",
            "data-off-background-color=\"rgba(17,34,51,0)\"", "data-on-background-color=\"#445566\"", "data-header-foreground-color=\"#778899\"" }) StringAssert.Contains(root,expected);
        Assert.AreEqual(value == 1,Regex.IsMatch(root,@"\schecked(?:\s|>)"));
        Assert.IsNull(item.OffThumbColor); Assert.IsNull(item.OnThumbColor);
        Assert.AreEqual(value,item.State.StaticValue); Assert.AreEqual(2,item.States.Count);
        item.OffBackgroundColor = null;
        root = Root(await renderer.ConvertAsync(screen)); Assert.IsFalse(root.Contains("--hmi-toggle-off-background:")); StringAssert.Contains(root,"--hmi-toggle-on-background:#445566;");
        item.OnBackgroundColor = null; item.HeaderForegroundColor = null;
        root = Root(await renderer.ConvertAsync(screen)); Assert.IsFalse(root.Contains("--hmi-toggle-")); Assert.IsFalse(root.Contains("data-header-foreground-color="));
        Assert.AreEqual(value == 1,Regex.IsMatch(root,@"\schecked(?:\s|>)"));
    }
}
