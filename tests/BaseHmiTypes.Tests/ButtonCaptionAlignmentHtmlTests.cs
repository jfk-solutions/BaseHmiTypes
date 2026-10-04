using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonCaptionAlignmentHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var alignment in new[] { HmiHorizontalAlignment.Left, HmiHorizontalAlignment.Center, HmiHorizontalAlignment.Right })
        foreach (var round in new[] { false, true })
        foreach (var tagged in new[] { false, true })
        foreach (var blink in new[] { false, true }) yield return [alignment, round, tagged, blink];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task ImageCaptionUsesAvailableWidth(HmiHorizontalAlignment alignment, bool round, bool tagged, bool blink)
    {
        var button = new HmiButton { Name = "Aligned", Width = 160, Height = 160,
            Shape = round ? HmiButtonShape.Ellipse : HmiButtonShape.Rectangle, Mode = HmiButtonType.GraphicAndText,
            Text = HmiMultilingualText.FromText("Start"), Image = new HmiImageSource { Uri = "picture.svg" },
            HorizontalAlignment = tagged ? HmiProperty.Tag("Button.Alignment", alignment) : HmiProperty.Static(alignment) };
        if (blink) button.CaptionColor = HmiProperty.Blink(HmiColor.FromArgb(255, 0, 0, 0), HmiColor.FromArgb(255, 255, 0, 0));
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        var content = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<button id=\"Aligned\"[^>]*>.*?</button>").Value;
        StringAssert.Contains(content, "text-align: " + alignment.ToString().ToLowerInvariant() + ";");
        StringAssert.Contains(content, "data-hmi-button-caption style=\"flex: 0 0 auto;width: 100%;max-width: 100%;");
        StringAssert.Contains(content, "Start</span>");
        Assert.AreEqual(blink, content.Contains("animation: hmi-caption-color-flash"));
    }
}
