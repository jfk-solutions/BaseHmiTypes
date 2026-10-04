using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RecipeControlStyleHtmlTests
{
    [TestMethod]
    [DataRow(HmiRecipeViewKind.Selector)]
    [DataRow(HmiRecipeViewKind.Table)]
    public async Task RecipeControlUsesHeaderAndContentStyles(HmiRecipeViewKind kind)
    {
        var control = new HmiRecipeControl
        {
            Name = "RecipePreview", ViewKind = kind, Width = 320, Height = 160,
            HeaderBackgroundColor = HmiColor.FromArgb(255, 1, 2, 3),
            HeaderForegroundColor = HmiColor.FromArgb(255, 4, 5, 6),
            HeaderBorderColor = HmiColor.FromArgb(255, 7, 8, 9),
            ContentBackgroundColor = HmiColor.FromArgb(255, 10, 11, 12),
            ContentForegroundColor = HmiColor.FromArgb(255, 13, 14, 15),
            HeaderFont = new HmiFont { Name = "PreviewHeader", Size = 18, Bold = true },
            ContentFont = new HmiFont { Name = "PreviewContent", Size = 14 },
            WordWrap = false, DefaultRecipeName = "<Configured recipe>"
        };
        control.ColumnDefinitions.Add(new HmiRecipeColumn
        {
            Type = HmiRecipeColumnType.IngredientName, Width = 120,
            HeaderText = HmiMultilingualText.FromText("Configured field")
        });
        control.ColumnDefinitions.Add(new HmiRecipeColumn
        {
            Type = HmiRecipeColumnType.CurrentValue, Visible = false, Width = 999,
            HeaderText = HmiMultilingualText.FromText("Hidden column")
        });
        var html = await Convert(control);
        StringAssert.Contains(html, "background-color: #010203;");
        StringAssert.Contains(html, "color: #040506;");
        StringAssert.Contains(html, "border-color: #070809;");
        StringAssert.Contains(html, "background-color: #0A0B0C;");
        StringAssert.Contains(html, "color: #0D0E0F;");
        StringAssert.Contains(html, "font-family: PreviewHeader;font-size: 18px;font-weight: bold;");
        StringAssert.Contains(html, "font-family: PreviewContent;font-size: 14px;");
        StringAssert.Contains(html, "white-space: nowrap;");
        if (kind == HmiRecipeViewKind.Table)
        {
            StringAssert.Contains(html, "<col style=\"width: 120px;\">");
            Assert.IsFalse(html.Contains("Hidden column"));
            Assert.IsFalse(html.Contains("width: 999px;"));
        }
        else StringAssert.Contains(html, "&lt;Configured recipe&gt;");
    }

    [TestMethod]
    public async Task RecipeTableKeepsWidthsWithoutHeaderAndRejectsInvalidWidths()
    {
        var control = new HmiRecipeControl { ViewKind = HmiRecipeViewKind.Table, ShowHeader = false, WordWrap = true };
        foreach (var width in new[] { 80d, -1d, double.NaN, double.PositiveInfinity })
            control.ColumnDefinitions.Add(new HmiRecipeColumn { Width = width });
        var html = await Convert(control);
        StringAssert.Contains(html, "<colgroup><col style=\"width: 80px;\"><col><col><col></colgroup>");
        StringAssert.Contains(html, "white-space: normal;overflow-wrap: anywhere;");
        Assert.IsFalse(html.Contains("<thead>"));
    }

    private static async Task<string> Convert(HmiRecipeControl control)
    {
        var screen = new HmiScreen();
        var layer = new HmiLayer();
        layer.Items.Add(control);
        screen.Layers.Add(layer);
        return await new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
