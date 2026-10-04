using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class GraphicViewOverflowHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var tagged in new[] { false, true })
        foreach (var key in new[] { false, true })
        foreach (var missing in new[] { false, true })
            yield return [tagged, key, missing];
    }

    [TestMethod, DynamicData(nameof(Cases))]
    public async Task KeepsLogicalFrameAndExtendsOnlyImage(bool tagged, bool key, bool missing)
    {
        HmiProperty<double> Extent(string name, double value) => tagged ? HmiProperty.Tag(name, value) : HmiProperty.Static(value);
        var graphic = new HmiGraphicView
        {
            Name = "Overflow", X = 30, Y = 40, Width = 100, Height = 60,
            Source = missing ? null : "pipe.svg", RotationAngle = 90,
            ImageOverflowPadding = new HmiThickness { Left = Extent("Left", 3), Top = Extent("Top", 5), Right = Extent("Right", 7), Bottom = Extent("Bottom", 9) },
            ImageBackgroundColor = HmiColor.FromArgb(255, 255, 0, 128), ImageBackgroundTransparent = key
        };
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(graphic); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "id=\"Overflow\"");
        StringAssert.Contains(html, "width: 100px;"); StringAssert.Contains(html, "height: 60px;");
        StringAssert.Contains(html, "transform: rotate(90deg)");
        Assert.AreEqual(!missing, html.Contains("data-hmi-graphic-overflow-image=\"true\""));
        Assert.AreEqual(!missing && key, html.Contains("data-hmi-image-color-key=\"255,0,128\""));
        if (!missing)
        {
            StringAssert.Contains(html, "overflow: visible;");
            StringAssert.Contains(html, "left: -3px; top: -5px; width: 110px; height: 74px;");
        }
    }

    [TestMethod]
    public async Task SanitizesNonfiniteAndNegativeExtents()
    {
        var graphic = new HmiGraphicView { Source = "image.bmp", Width = 10, Height = 20,
            ImageOverflowPadding = new HmiThickness { Left = -3, Top = double.NaN, Right = double.PositiveInfinity, Bottom = 2 } };
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(graphic); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "left: 0px; top: 0px; width: 10px; height: 22px;");
        var imageTag = System.Text.RegularExpressions.Regex.Match(html, "<img[^>]*data-hmi-graphic-overflow-image[^>]*>").Value;
        Assert.IsFalse(imageTag.Contains("NaN")); Assert.IsFalse(imageTag.Contains("Infinity"));
    }
}
