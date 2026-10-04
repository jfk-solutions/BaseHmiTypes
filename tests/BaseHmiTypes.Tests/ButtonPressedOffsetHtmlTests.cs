using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonPressedOffsetHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var pressed in new[] { false, true })
        foreach (var same in new[] { false, true })
        foreach (var axis in new[] { -1, 0, 1, 2, 3 })
        foreach (var mode in new[] { HmiButtonType.GraphicOrText, HmiButtonType.GraphicAndText, HmiButtonType.Text, HmiButtonType.Graphic })
        foreach (var tagged in new[] { false, true }) yield return [pressed, same, axis, mode, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task OffsetsOnlyPressedContent(bool pressed, bool same, int axis, HmiButtonType mode, bool tagged)
    {
        var b = CreateButton(); b.Pressed = pressed; b.DownStateSameAsUp = same; b.Mode = mode;
        b.PressedContentOffset = tagged ? HmiProperty.Tag("Button.Offset", 2d) : HmiProperty.Static(2d);
        if (axis >= 0) b.ImageHorizontalAlignment = new[] { HmiHorizontalAlignment.Left, HmiHorizontalAlignment.Center, HmiHorizontalAlignment.Right, HmiHorizontalAlignment.Stretch }[axis];
        var html = await Convert(b);
        var active = pressed && !same;
        Assert.AreEqual(active && mode != HmiButtonType.Graphic, html.Contains("data-hmi-button-pressed-caption"));
        Assert.AreEqual(active && axis is >= 0 and < 3 && mode != HmiButtonType.Text, Regex.IsMatch(html, "<img[^>]*transform: translate\\(2px, 2px\\);"));
        Assert.AreEqual(mode == HmiButtonType.GraphicOrText, html.Contains("data-hmi-button-caption hidden"));
    }
    [TestMethod]
    [DataRow(-1d)] [DataRow(0d)] [DataRow(double.NaN)] [DataRow(double.PositiveInfinity)] [DataRow(double.NegativeInfinity)]
    [DataRow(1.5d)]
    public async Task RejectsInvalidOffsetsAndRetainsFractionalPixels(double offset)
    {
        var b = CreateButton(); b.Pressed = true; b.PressedContentOffset = offset;
        var html = await Convert(b);
        Assert.AreEqual(offset == 1.5, html.Contains("data-hmi-button-pressed-caption"));
        if (offset == 1.5) StringAssert.Contains(html, "translate(1.5px, 1.5px)");
    }
    [TestMethod]
    public async Task OmittedOffsetRetainsLegacySnapshot()
    {
        var b = CreateButton(); b.Pressed = true;
        Assert.IsFalse((await Convert(b)).Contains("data-hmi-button-pressed-caption"));
    }
    private static HmiButton CreateButton() => new() { Name = "Offset", Width = 160, Height = 100, OverlayContent = true,
        Text = HmiMultilingualText.FromText("Start"), Image = new HmiImageSource { Uri = "picture.svg" }, Mode = HmiButtonType.GraphicAndText };
    private static async Task<string> Convert(HmiButton b)
    {
        var s = new HmiScreen(); var l = new HmiLayer(); l.Items.Add(b); s.Layers.Add(l);
        return Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(s), "<button id=\"Offset\"[^>]*>.*?</button>").Value;
    }
}
