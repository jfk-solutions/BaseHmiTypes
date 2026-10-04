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

    [TestMethod]
    public async Task RecipeGridAndStatusVisibilityReachHtml()
    {
        var control = new HmiRecipeControl { ViewKind = HmiRecipeViewKind.Table, ShowGridLines = false, ShowStatusBar = false, GridLineColor = HmiColor.FromArgb(255, 21, 22, 23) };
        control.ColumnDefinitions.Add(new HmiRecipeColumn { Type = HmiRecipeColumnType.CurrentValue });
        var html = await Convert(control);
        StringAssert.Contains(html, "border: 0;border-color: #151617;");
        StringAssert.Contains(html, "data-show-grid-lines=\"false\"");
        Assert.IsFalse(html.Contains("hmi-recipe-status-bar"));
        control.ShowGridLines = true; control.ShowStatusBar = true;
        html = await Convert(control);
        StringAssert.Contains(html, "border: 1px solid currentColor;border-color: #151617;");
        StringAssert.Contains(html, "class=\"hmi-recipe-status-bar\"");
        StringAssert.Contains(html, "Recipe status not loaded");
        control.ShowGridLines = null; control.ShowStatusBar = null;
        html = await Convert(control);
        Assert.IsFalse(html.Contains("data-show-grid-lines")); Assert.IsFalse(html.Contains("data-show-status-bar"));
        Assert.IsFalse(html.Contains("hmi-recipe-status-bar"));
    }

    [TestMethod]
    public async Task RecipeComboFontUsesLocaleOnlyForSelectorAndFallsBackToContentFont()
    {
        var combo = new HmiFont { Name = "NeutralCombo", Size = 13 };
        combo.LocalizedFonts[1031] = new HmiFont { Name = "LocalizedCombo <A> & B", Size = 17.5 };
        var control = new HmiRecipeControl
        {
            ComboBoxFont = combo, ContentFont = new HmiFont { Name = "TableContent", Size = 11 },
            HeaderFont = new HmiFont { Name = "SeparateHeader", Size = 19 },
            StatusBarFont = new HmiFont { Name = "SeparateStatus", Size = 9 }, ShowStatusBar = true
        };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var renderer = new HmiScreenToHtmlConverter();
        var html = await renderer.ConvertAsync(screen, options: new() { CultureLcid = 1031 });
        StringAssert.Contains(html, "font-family: LocalizedCombo &lt;A&gt; &amp; B;font-size: 17.5px;");
        StringAssert.Contains(html, "font-family: SeparateHeader;"); StringAssert.Contains(html, "font-family: SeparateStatus;");
        Assert.IsFalse(html.Contains("font-family: TableContent;"));
        html = await renderer.ConvertAsync(screen, options: new() { CultureLcid = 1036 });
        StringAssert.Contains(html, "font-family: NeutralCombo;");
        control.ViewKind = HmiRecipeViewKind.Table;
        html = await renderer.ConvertAsync(screen, options: new() { CultureLcid = 1031 });
        StringAssert.Contains(html, "font-family: TableContent;"); Assert.IsFalse(html.Contains("font-family: LocalizedCombo"));
        control.ViewKind = HmiRecipeViewKind.Selector; control.ComboBoxFont = null;
        html = await renderer.ConvertAsync(screen, options: new() { CultureLcid = 1031 });
        StringAssert.Contains(html, "font-family: TableContent;");
        Assert.AreEqual("NeutralCombo", combo.Name!.StaticValue); Assert.AreEqual(1, combo.LocalizedFonts.Count);
    }

    [TestMethod]
    [DataRow(HmiRecipeViewKind.Selector)]
    [DataRow(HmiRecipeViewKind.Table)]
    public async Task RecipeHeaderGradientFlagsAndRawAppearanceStayIndependent(HmiRecipeViewKind kind)
    {
        var control = new HmiRecipeControl {
            ViewKind = kind, HeaderBackgroundColor = HmiColor.FromArgb(255, 1, 2, 3),
            HeaderBorderBackgroundColor = HmiColor.FromArgb(255, 13, 14, 15),
            HeaderFirstGradientColor = HmiColor.FromArgb(255, 4, 5, 6),
            HeaderMiddleGradientColor = HmiColor.FromArgb(255, 7, 8, 9),
            HeaderSecondGradientColor = HmiColor.FromArgb(255, 10, 11, 12),
            HeaderFirstGradientOffset = 25.5d, HeaderSecondGradientOffset = 75d,
            HeaderBackFillStyle = 0, HeaderEdgeStyle = -17,
            UseHeaderFirstGradient = true, UseHeaderSecondGradient = true };
        control.ColumnDefinitions.Add(new HmiRecipeColumn());
        var html = await Convert(control);
        StringAssert.Contains(html, "background-image: linear-gradient(to right, #040506 0%, #070809 25.5%, #070809 75%, #0A0B0C 100%);");
        StringAssert.Contains(html, "data-header-back-fill-style=\"0\""); StringAssert.Contains(html, "data-header-edge-style=\"-17\"");
        StringAssert.Contains(html, "data-header-first-gradient-offset=\"25.5\""); StringAssert.Contains(html, "data-header-second-gradient-offset=\"75\"");
        StringAssert.Contains(html, "data-use-header-first-gradient=\"true\""); StringAssert.Contains(html, "data-use-header-second-gradient=\"true\"");
        var body = System.Text.RegularExpressions.Regex.Match(html, kind == HmiRecipeViewKind.Table ? "<td\\b[^>]*style=\"([^\"]*)\"" : "<div style=\"flex: 1 1 auto;([^\"]*)\"").Groups[1].Value;
        Assert.IsTrue(body.Length > 0);
        Assert.IsFalse(body.Contains("linear-gradient"));
        control.UseHeaderSecondGradient = false;
        html = await Convert(control);
        StringAssert.Contains(html, "linear-gradient(to right, #040506 0%, #070809 25.5%, #070809 100%)");
        control.UseHeaderFirstGradient = false; control.UseHeaderSecondGradient = true;
        html = await Convert(control);
        StringAssert.Contains(html, "linear-gradient(to right, #070809 0%, #070809 75%, #0A0B0C 100%)");
        control.UseHeaderFirstGradient = true; control.HeaderFirstGradientOffset = -20d; control.HeaderSecondGradientOffset = 125d;
        html = await Convert(control);
        StringAssert.Contains(html, "linear-gradient(to right, #040506 0%, #070809 0%, #070809 100%, #0A0B0C 100%)");
        StringAssert.Contains(html, "data-header-first-gradient-offset=\"-20\""); StringAssert.Contains(html, "data-header-second-gradient-offset=\"125\"");
        Assert.AreEqual(-20d, control.HeaderFirstGradientOffset.StaticValue); Assert.AreEqual(125d, control.HeaderSecondGradientOffset.StaticValue);
        control.UseHeaderFirstGradient = false; control.UseHeaderSecondGradient = false;
        html = await Convert(control); Assert.IsFalse(System.Text.RegularExpressions.Regex.IsMatch(html, "style=\"[^\"]*linear-gradient"));
        StringAssert.Contains(html, "data-use-header-first-gradient=\"false\""); StringAssert.Contains(html, "data-use-header-second-gradient=\"false\"");
        control.UseHeaderFirstGradient = null; control.UseHeaderSecondGradient = null;
        html = await Convert(control); Assert.IsFalse(System.Text.RegularExpressions.Regex.IsMatch(html, "style=\"[^\"]*linear-gradient")); Assert.IsFalse(html.Contains("data-use-header-first-gradient"));
        control.UseHeaderFirstGradient = true; control.ShowHeader = false;
        html = await Convert(control); Assert.IsFalse(System.Text.RegularExpressions.Regex.IsMatch(html, "style=\"[^\"]*linear-gradient")); StringAssert.Contains(html, "data-use-header-first-gradient=\"true\"");
        control = new HmiRecipeControl(); html = await Convert(control);
        Assert.IsFalse(html.Contains("data-header-first-gradient")); Assert.IsFalse(html.Contains("data-header-back-fill-style"));
        Assert.IsFalse(html.Contains("data-header-edge-style")); Assert.IsFalse(html.Contains("data-header-border-background-color"));
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
