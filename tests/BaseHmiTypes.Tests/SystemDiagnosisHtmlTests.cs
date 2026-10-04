using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class SystemDiagnosisHtmlTests
{
    [TestMethod] public async Task DiagnosticColumnsKeepOrderWidthsWithoutHeadingsAndHideConfiguredColumns()
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        var control = new HmiSystemDiagnosisControl { ShowColumnHeadings = false, RowHeight = 0, ShowToolbar = false, ShowStatusBar = false };
        layer.Items.Add(control);
        control.ColumnDefinitions.Add(new() { SourceType = "Later", Width = 100, Order = 2 });
        control.ColumnDefinitions.Add(new() { SourceType = "First", Width = 0, Order = 0 });
        control.ColumnDefinitions.Add(new() { SourceType = "Hidden", Width = 999, Visible = false });
        control.ColumnDefinitions.Add(new() { SourceType = "InvalidWidth", Width = double.NaN, Order = 3 });
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,"<colgroup><col style=\"width: 0px;\"><col style=\"width: 100px;\"><col></colgroup>");
        Assert.IsFalse(html.Contains("<thead>")); Assert.IsFalse(html.Contains("width: 999px;")); StringAssert.Contains(html,"colspan=\"3\"");
        Assert.IsFalse(html.Contains("role=\"toolbar\"")); Assert.IsFalse(html.Contains("role=\"status\""));
        control.ShowColumnHeadings = true;
        html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        Assert.IsTrue(html.IndexOf("data-column-source-type=\"First\"",StringComparison.Ordinal)<html.IndexOf("data-column-source-type=\"Later\"",StringComparison.Ordinal));
        control.ColumnDefinitions.Clear(); html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        Assert.IsFalse(html.Contains("hmi-diagnosis-table")); StringAssert.Contains(html,"Diagnostic data not loaded");
    }
}
