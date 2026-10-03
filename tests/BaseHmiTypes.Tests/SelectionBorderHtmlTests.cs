using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class SelectionBorderHtmlTests
{
    [TestMethod]
    [DataRow(false, false, false, 1)]
    [DataRow(false, false, false, 10)]
    [DataRow(false, false, true, 1)]
    [DataRow(false, false, true, 10)]
    [DataRow(false, true, false, 1)]
    [DataRow(false, true, false, 10)]
    [DataRow(false, true, true, 1)]
    [DataRow(false, true, true, 10)]
    [DataRow(true, false, false, 1)]
    [DataRow(true, false, false, 10)]
    [DataRow(true, false, true, 1)]
    [DataRow(true, false, true, 10)]
    [DataRow(true, true, false, 1)]
    [DataRow(true, true, false, 10)]
    [DataRow(true, true, true, 1)]
    [DataRow(true, true, true, 10)]
    public async Task EmitsBorderPlacementWithoutMovingHostBorder(bool radio, bool inside, bool tagged, int width)
    {
        HmiSelectionGroupBase item = radio ? new HmiRadioButtonGroup() : new HmiCheckBoxGroup();
        item.Name = "Framed"; item.BorderWidth = width; item.BorderColor = new HmiColor(255, 255, 0, 0);
        HmiProperty<bool> placement = tagged ? HmiProperty.Tag("Box.Inside", inside) : HmiProperty.Static(inside);
        if (item is HmiCheckBoxGroup check) check.DrawStrokeInsideFrame = placement;
        else ((HmiRadioButtonGroup)item).DrawStrokeInsideFrame = placement;
        item.Items.Add(new HmiSelectionGroupItem { Text = "Choice" });
        var layer = new HmiLayer(); layer.Items.Add(item); var screen = new HmiScreen(); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening = System.Text.RegularExpressions.Regex.Match(html, "<hmi-(?:checkbox|radio-button)-group id=\"Framed\"[^>]*>").Value;
        StringAssert.Contains(opening, "draw-stroke-inside-frame=\"" + (inside ? "true" : "false") + "\"");
        StringAssert.Contains(opening, $"border-width: {width}px;");
        Assert.IsFalse(opening.Contains("outline-width:", StringComparison.Ordinal));
    }

    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task OmitsPlacementWhenUnspecified(bool radio)
    {
        HmiSelectionGroupBase item = radio ? new HmiRadioButtonGroup() : new HmiCheckBoxGroup();
        item.Name = "Framed"; item.BorderWidth = 10;
        var layer = new HmiLayer(); layer.Items.Add(item); var screen = new HmiScreen(); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening = System.Text.RegularExpressions.Regex.Match(html, "<hmi-(?:checkbox|radio-button)-group id=\"Framed\"[^>]*>").Value;
        Assert.IsFalse(opening.Contains("draw-stroke-inside-frame", StringComparison.Ordinal));
    }
}
