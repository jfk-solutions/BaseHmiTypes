using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonOverlayHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var x in new[] { HmiHorizontalAlignment.Left, HmiHorizontalAlignment.Center, HmiHorizontalAlignment.Right })
        foreach (var y in new[] { HmiVerticalAlignment.Top, HmiVerticalAlignment.Center, HmiVerticalAlignment.Bottom })
        foreach (var mode in new[] { HmiButtonType.GraphicOrText, HmiButtonType.GraphicAndText, HmiButtonType.Text, HmiButtonType.Graphic })
        foreach (var tagged in new[] { false, true }) yield return [x, y, mode, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task RendersIndependentOverlayLayers(HmiHorizontalAlignment x, HmiVerticalAlignment y, HmiButtonType mode, bool tagged)
    {
        var button = new HmiButton { Name = "Overlay", Width = 160, Height = 100, OverlayContent = tagged ? HmiProperty.Tag("Button.Overlay", true) : HmiProperty.Static(true), Mode = mode,
            HorizontalAlignment = x, VerticalAlignment = y, Text = HmiMultilingualText.FromText("Start"), Image = new HmiImageSource { Uri = "picture.svg" } };
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        var content = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<button id=\"Overlay\"[^>]*>.*?</button>").Value;
        Assert.AreEqual(mode != HmiButtonType.Text, content.Contains("data-hmi-button-overlay"));
        Assert.AreEqual(mode != HmiButtonType.Graphic, content.Contains("Start</"));
        if (mode is HmiButtonType.GraphicOrText or HmiButtonType.GraphicAndText)
        {
            StringAssert.Contains(content, "grid-area: 1 / 1;");
            StringAssert.Contains(content, "justify-content: " + (x == HmiHorizontalAlignment.Left ? "flex-start" : x == HmiHorizontalAlignment.Right ? "flex-end" : "center") + ";align-items: " + (y == HmiVerticalAlignment.Top ? "flex-start" : y == HmiVerticalAlignment.Bottom ? "flex-end" : "center") + ";");
            Assert.AreEqual(mode == HmiButtonType.GraphicOrText, content.Contains("data-hmi-button-caption hidden"));
        }
    }
}
