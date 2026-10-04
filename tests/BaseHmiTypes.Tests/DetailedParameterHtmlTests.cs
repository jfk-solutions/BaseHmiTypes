using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class DetailedParameterHtmlTests
{
    [TestMethod]
    public async Task MissingSettingsDoNotFabricateConfigurationOrRecords()
    {
        var screen = new HmiScreen();
        var layer = new HmiLayer();
        layer.Items.Add(new HmiDetailedParameterControl());
        screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "Parameter set selection not decoded");
        StringAssert.Contains(html, "Parameter data not loaded");
        Assert.IsFalse(html.Contains("data-edit-mode="));
        Assert.IsFalse(html.Contains("data-hide-details="));
        Assert.IsFalse(html.Contains("data-parameter-set-type-fixed="));
        Assert.IsFalse(html.Contains("class=\"hmi-parameter-toolbar\""));
        Assert.IsFalse(html.Contains("class=\"hmi-parameter-status-bar\""));
        Assert.IsFalse(html.Contains(" · Fixed"));
    }
}
