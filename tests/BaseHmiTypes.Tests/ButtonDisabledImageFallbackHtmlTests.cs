using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonDisabledImageFallbackHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var enabled in new[] { false, true }) foreach (var pressed in new[] { false, true })
        foreach (var fallback in new[] { 0, 1, 2 }) foreach (var replacement in new[] { false, true })
        foreach (var mode in new[] { HmiButtonType.GraphicOrText, HmiButtonType.GraphicAndText, HmiButtonType.Text, HmiButtonType.Graphic })
        foreach (var tagged in new[] { false, true }) yield return [enabled, pressed, fallback, replacement, mode, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task HonorsExplicitDisabledImageFallbackPolicy(bool enabled, bool pressed, int fallback, bool replacement, HmiButtonType mode, bool tagged)
    {
        var b = new HmiButton { Name = "Disabled", Width = 160, Height = 100, Enabled = enabled, Pressed = pressed, Mode = mode,
            Text = HmiMultilingualText.FromText("Start"), Image = new HmiImageSource { Uri = "up.svg" }, AlternateImage = new HmiImageSource { Uri = "down.svg" },
            ShowDisabledState = true, DisabledImageMode = HmiDisabledImageMode.Reference,
            DisabledImage = replacement ? new HmiImageSource { Uri = "disabled.svg" } : null };
        if (fallback != 0) b.DisabledImageFallbackToNormal = tagged ? HmiProperty.Tag("Button.Fallback", fallback == 1) : HmiProperty.Static(fallback == 1);
        var s = new HmiScreen(); var l = new HmiLayer(); l.Items.Add(b); s.Layers.Add(l);
        var html = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(s), "<button id=\"Disabled\"[^>]*>.*?</button>").Value;
        var expected = mode == HmiButtonType.Text ? null : !enabled && replacement ? "disabled.svg" : !enabled && fallback == 2 ? null : pressed ? "down.svg" : "up.svg";
        var image = Regex.Match(html, "<img[^>]*src=\"([^\"]+)\"");
        Assert.AreEqual(expected is not null, image.Success);
        if (expected is not null) Assert.AreEqual(expected, image.Groups[1].Value);
        Assert.AreEqual(mode == HmiButtonType.GraphicOrText && expected is not null, html.Contains("data-hmi-button-image-fallback"));
    }
}
