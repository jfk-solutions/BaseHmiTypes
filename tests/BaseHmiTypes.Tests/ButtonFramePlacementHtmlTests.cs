using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class ButtonFramePlacementHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var round in new[] { false, true })
        foreach (var inside in new bool?[] { null, false, true })
        foreach (var width in new[] { 0, 1, 2, 10 })
        foreach (var bevel in new[] { false, true })
        foreach (var tagged in new[] { false, true }) yield return [round, inside!, width, bevel, tagged];
    }

    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task RendersIndependentFrameAndBevel(bool round, bool? inside, int width, bool bevel, bool tagged)
    {
        var button = new HmiButton
        {
            Name = "Framed", Width = 100, Height = 100,
            Text = HmiMultilingualText.FromText("Start"),
            Shape = round ? HmiButtonShape.Ellipse : HmiButtonShape.Rectangle,
            BorderWidth = width, BorderColor = HmiColor.FromArgb(255, 0, 0, 0),
            DrawStrokeInsideFrame = inside is null ? null : tagged ? HmiProperty.Tag("Button.Inside", inside.Value) : HmiProperty.Static(inside.Value),
            ThreeDBorderWidth = bevel ? 3 : 0,
            ThreeDBorderTopColor = HmiColor.FromArgb(255, 238, 238, 238),
            ThreeDBorderBottomColor = HmiColor.FromArgb(255, 64, 64, 64)
        };
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        var opening = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<button id=\"Framed\"[^>]*>").Value;
        var centered = inside == false && width > 1;
        Assert.AreEqual(centered, opening.Contains("outline-style: solid;"));
        StringAssert.Contains(opening, "border-width: " + (centered ? 0 : width) + "px;");
        if (centered) StringAssert.Contains(opening, "outline-offset: -" + (width / 2) + "px;");
        Assert.AreEqual(bevel, opening.Contains("box-shadow: inset 3px"));
        if (bevel)
        {
            StringAssert.Contains(opening, "padding: 5px 9px 5px 9px;");
            StringAssert.Contains(opening, "inset -3px 0 0 #404040");
            Assert.IsFalse(opening.Contains("border-width: 3px;"));
        }
    }
}
