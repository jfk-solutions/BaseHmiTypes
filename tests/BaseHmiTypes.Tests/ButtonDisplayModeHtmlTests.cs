using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonDisplayModeHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var mode in new[] { HmiButtonType.GraphicOrText, HmiButtonType.GraphicAndText, HmiButtonType.Text, HmiButtonType.Graphic })
        foreach (var image in new[] { false, true })
        foreach (var tagged in new[] { false, true })
        foreach (var state in new[] { false, true }) yield return [mode, image, tagged, state];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task SelectsConfiguredContent(HmiButtonType mode, bool image, bool tagged, bool state)
    {
        var button = new HmiButton { Name = "Mode", Text = HmiMultilingualText.FromText("Base"),
            Mode = tagged ? HmiProperty.Tag("Button.Mode", mode) : HmiProperty.Static(mode) };
        if (image) button.Image = new HmiImageSource { Uri = "base.svg" };
        if (state) button.States.Add(new HmiState { Value = 0, Text = HmiMultilingualText.FromText("State"), Image = image ? new HmiImageSource { Uri = "state.svg" } : null });
        var html = await Convert(button);
        var opening = Regex.Match(html, "<button id=\"Mode\"[^>]*>").Value;
        var content = Regex.Match(html, "<button id=\"Mode\"[^>]*>(.*?)</button>").Groups[1].Value;
        var hasImage = image && mode != HmiButtonType.Text;
        Assert.AreEqual(hasImage, content.Contains("<img", StringComparison.Ordinal));
        Assert.AreEqual(mode != HmiButtonType.Graphic, content.Contains(state ? "State" : "Base", StringComparison.Ordinal));
        if (hasImage) { StringAssert.Contains(content, state ? "state.svg" : "base.svg"); StringAssert.Contains(content, "data-hmi-button-content"); StringAssert.Contains(content, "min-height: 0;"); }
        Assert.AreEqual(hasImage && mode == HmiButtonType.GraphicOrText, opening.Contains("data-hmi-button-image-fallback", StringComparison.Ordinal));
        Assert.AreEqual(hasImage && mode == HmiButtonType.GraphicOrText, content.Contains("data-hmi-button-caption hidden", StringComparison.Ordinal));
        StringAssert.Contains(html, "aria-label=\"" + (state ? "State" : "Base") + "\"");
    }
    [TestMethod]
    [DataRow(false, false)] [DataRow(false, true)] [DataRow(true, false)] [DataRow(true, true)]
    public async Task PreservesDisabledGraphicAndCaptionAppearance(bool state, bool replacement)
    {
        var button = new HmiButton { Name = "Mode", Enabled = false, ShowDisabledState = true,
            Mode = HmiButtonType.GraphicAndText, Text = HmiMultilingualText.FromText("Base"), Image = new HmiImageSource { Uri = "base.svg" },
            DisabledImageMode = replacement ? HmiDisabledImageMode.Reference : HmiDisabledImageMode.Grayscale,
            DisabledImage = new HmiImageSource { Uri = "disabled.svg" },
            CaptionColor = HmiProperty.Blink(HmiColor.FromArgb(255, 255, 0, 0), HmiColor.FromArgb(255, 0, 0, 255), HmiBlinkRate.Medium) };
        if (state) button.States.Add(new HmiState { Value = 0, Text = HmiMultilingualText.FromText("State"), Image = new HmiImageSource { Uri = "state.svg" } });
        var content = Regex.Match(await Convert(button), "<button id=\"Mode\"[^>]*>(.*?)</button>").Groups[1].Value;
        StringAssert.Contains(content, replacement ? "disabled.svg" : state ? "state.svg" : "base.svg");
        Assert.AreEqual(!replacement, content.Contains("filter: grayscale(1)", StringComparison.Ordinal));
        StringAssert.Contains(content, "animation: hmi-caption-color-flash 1s");
        StringAssert.Contains(content, state ? "State" : "Base");
    }
    private static async Task<string> Convert(HmiButton button)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        return await new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
