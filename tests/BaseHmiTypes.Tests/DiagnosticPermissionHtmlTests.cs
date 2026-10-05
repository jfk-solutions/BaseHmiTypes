using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class DiagnosticPermissionHtmlTests
{
    [TestMethod]
    public async Task PermissionsRemainOptionalWithoutConfiguredColumns()
    {
        var control = new HmiSystemDiagnosisControl(); var screen = new HmiScreen(); var layer = new HmiLayer();
        layer.Items.Add(control); screen.Layers.Add(layer); var renderer = new HmiScreenToHtmlConverter();
        var keys = new[] { "filter-by-column", "column-resize", "column-reorder" };
        var html = await renderer.ConvertAsync(screen);
        foreach (var key in keys) Assert.IsFalse(html.Contains("data-allow-" + key + "="));
        foreach (var enabled in new[] { false, true })
        {
            control.AllowFilterByColumn = enabled; control.AllowColumnResize = enabled; control.AllowColumnReorder = enabled;
            html = await renderer.ConvertAsync(screen);
            foreach (var key in keys) StringAssert.Contains(html, "data-allow-" + key + "=\"" + enabled.ToString().ToLowerInvariant() + "\"");
            StringAssert.Contains(html, "Diagnostic data not loaded"); Assert.IsFalse(html.Contains("hmi-diagnosis-table"));
        }
        control.AllowFilterByColumn = null; control.AllowColumnResize = null; control.AllowColumnReorder = null;
        html = await renderer.ConvertAsync(screen);
        foreach (var key in keys) Assert.IsFalse(html.Contains("data-allow-" + key + "="));
    }
}
