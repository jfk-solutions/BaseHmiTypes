using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class SelectionBorderStyleHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        var styles = new (int Value, string Css)[] { (-1,"none"), (0,"solid"), (1,"dashed"), (2,"dotted"),
            (3,"dashed"), (4,"dashed"), (5,"solid"), (6,"double"), (7,"groove"), (99,"solid") };
        foreach (var radio in new[] {false,true})
        foreach (var inside in new[] {false,true})
        foreach (var tagged in new[] {false,true})
        foreach (var style in styles)
            yield return [radio, inside, tagged, style.Value, style.Css];
    }

    [TestMethod]
    [DynamicData(nameof(Cases), DynamicDataSourceType.Method)]
    public async Task EmitsFrameStyleWithoutAddingHostBorder(bool radio, bool inside, bool tagged, int style, string css)
    {
        HmiSelectionGroupBase item = radio ? new HmiRadioButtonGroup() : new HmiCheckBoxGroup();
        item.Name = "Styled"; item.BorderWidth = 10;
        item.BorderStyle = tagged ? HmiProperty.Tag("Box.Style", style) : HmiProperty.Static(style);
        if (item is HmiCheckBoxGroup check) check.DrawStrokeInsideFrame = inside;
        else ((HmiRadioButtonGroup)item).DrawStrokeInsideFrame = inside;
        var layer = new HmiLayer(); layer.Items.Add(item); var screen = new HmiScreen(); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening = System.Text.RegularExpressions.Regex.Match(html, "<hmi-(?:checkbox|radio-button)-group id=\"Styled\"[^>]*>").Value;
        StringAssert.Contains(opening, $"frame-border-style=\"{css}\"");
        Assert.IsFalse(opening.Contains("border-style:", StringComparison.Ordinal));
        StringAssert.Contains(opening, "border-width: 10px;");
    }
}
