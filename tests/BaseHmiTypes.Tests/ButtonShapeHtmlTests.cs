using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Common;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonShapeHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var shape in new[] { HmiButtonShape.Rectangle, HmiButtonShape.Ellipse })
        foreach (var tagged in new[] { false, true })
        foreach (var beveled in new[] { false, true })
        foreach (var enabled in new[] { false, true })
            yield return [shape, tagged, beveled, enabled];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task RendersShapeWithoutChangingBoundsOrContent(HmiButtonShape shape, bool tagged, bool beveled, bool enabled)
    {
        var button = new HmiButton { Name = "Shape", X = 10, Y = 20, Width = 100, Height = 100,
            Text = HmiMultilingualText.FromText("Start"), Enabled = enabled,
            Shape = tagged ? HmiProperty.Tag("Button.Shape", shape) : HmiProperty.Static(shape) };
        if (beveled) { button.ThreeDBorderWidth = 3; button.ThreeDBorderTopColor = HmiColor.FromArgb(255, 238, 238, 238); button.ThreeDBorderBottomColor = HmiColor.FromArgb(255, 64, 64, 64); }
        var html = await Convert(button);
        var opening = Regex.Match(html, "<button id=\"Shape\"[^>]*>").Value;
        StringAssert.Contains(opening, shape == HmiButtonShape.Ellipse ? "border-radius: 50%;overflow: hidden;" : "border-radius: 0px;");
        StringAssert.Contains(opening, "left: 10px;top: 20px;width: 100px;height: 100px;");
        Assert.AreEqual(!enabled, opening.Contains("disabled=", StringComparison.Ordinal));
        if (beveled) { StringAssert.Contains(opening, "border-width: 3px;"); StringAssert.Contains(opening, "border-color: #EEEEEE #404040 #404040 #EEEEEE;"); }
        StringAssert.Contains(html, ">Start</button>");
    }
    [TestMethod]
    public async Task UnspecifiedShapeKeepsDefaultAppearance() =>
        Assert.IsFalse(Regex.Match(await Convert(new HmiButton()), "<button[^>]*>").Value.Contains("border-radius:", StringComparison.Ordinal));

    [TestMethod]
    public async Task UnknownShapeKeepsDefaultAppearance() =>
        Assert.IsFalse(Regex.Match(await Convert(new HmiButton { Shape = (HmiButtonShape)999 }), "<button[^>]*>").Value.Contains("border-radius:", StringComparison.Ordinal));

    private static async Task<string> Convert(HmiButton button)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        return await new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
