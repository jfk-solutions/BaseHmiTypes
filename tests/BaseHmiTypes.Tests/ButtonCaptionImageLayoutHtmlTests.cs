using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonCaptionImageLayoutHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var text in new[] { HmiHorizontalAlignment.Left, HmiHorizontalAlignment.Center, HmiHorizontalAlignment.Right })
        foreach (var image in new[] { HmiHorizontalAlignment.Left, HmiHorizontalAlignment.Center, HmiHorizontalAlignment.Right, HmiHorizontalAlignment.Stretch })
        foreach (var mode in new[] { HmiButtonType.GraphicOrText, HmiButtonType.GraphicAndText, HmiButtonType.Text, HmiButtonType.Graphic })
        foreach (var tagged in new[] { false, true }) yield return [text, image, mode, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task ReservesImageExtentOnlyForMatchingEdgeAlignments(HmiHorizontalAlignment text, HmiHorizontalAlignment image, HmiButtonType mode, bool tagged)
    {
        var b = new HmiButton { Name = "Layout", Width = 160, Height = 100, OverlayContent = true,
            AvoidImageCaptionOverlap = tagged ? HmiProperty.Tag("Button.AvoidOverlap", true) : HmiProperty.Static(true),
            HorizontalAlignment = text, ImageHorizontalAlignment = image, Mode = mode,
            Text = HmiMultilingualText.FromText("Start"), Image = new HmiImageSource { Uri = "picture.svg" } };
        var s = new HmiScreen(); var l = new HmiLayer(); l.Items.Add(b); s.Layers.Add(l);
        var html = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(s), "<button id=\"Layout\"[^>]*>.*?</button>").Value;
        var reserve = text == image && text != HmiHorizontalAlignment.Center && mode is HmiButtonType.GraphicOrText or HmiButtonType.GraphicAndText;
        Assert.AreEqual(reserve, html.Contains("data-hmi-button-caption-avoid-image"));
        if (reserve) StringAssert.Contains(html, "data-hmi-button-caption-avoid-image=\"" + (text == HmiHorizontalAlignment.Left ? "start" : "end") + "\"");
    }
}
