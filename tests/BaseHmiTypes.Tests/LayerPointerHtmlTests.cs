using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class LayerPointerHtmlTests
{
    [TestMethod]
    public async Task EmptyAndPopulatedLayersPassPointerInputToTheirItems()
    {
        var screen = new HmiScreen();
        var empty = new HmiLayer { Name = "Empty" };
        var populated = new HmiLayer { Name = "Populated" };
        var hidden = new HmiLayer { Name = "Hidden", Visible = false };
        populated.Items.Add(new HmiButton { Name = "Disabled", Enabled = false });
        screen.Layers.Add(empty); screen.Layers.Add(populated); screen.Layers.Add(hidden);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        foreach (var name in new[] { "Empty", "Populated" })
            StringAssert.Contains(html, $"id=\"{name}\" data-hmi-layer=\"true\" style=\"position: absolute; inset: 0; pointer-events: none;\"");
        StringAssert.Contains(html, "[data-hmi-layer]>*{pointer-events:auto;}");
        Assert.IsFalse(html.Contains("id=\"Hidden\""));
        StringAssert.Contains(html, "id=\"Disabled\" aria-disabled=\"true\"");
    }
}
