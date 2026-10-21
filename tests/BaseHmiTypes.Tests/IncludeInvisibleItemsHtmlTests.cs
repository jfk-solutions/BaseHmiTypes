using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class IncludeInvisibleItemsHtmlTests
{
    private static (HmiScreen Screen, HmiScreenItemBase[] Items, HmiLayer Layer) Fixture(bool visible)
    {
        var screen = new HmiScreen { Name = "Commissioning", Width = 640, Height = 480 };
        var layer = new HmiLayer(); var hiddenLayer = new HmiLayer { Visible = visible };
        var group = new HmiGroup { Name = "Group", Visible = visible };
        HmiText Text(string name, string caption) => new() {
            Name = name, Visible = visible, Text = HmiMultilingualText.FromText(caption), X = 12, Y = 24, Width = 220, Height = 36,
            ForegroundColor = HmiColor.FromArgb(255,12,34,56), BackgroundColor = HmiColor.FromArgb(255,210,220,230)
        };
        var header = Text("Header","Dummy Header"); var footer = Text("Footer","Dummy Footer"); var child = Text("Child","Nested text");
        layer.Items.Add(header); layer.Items.Add(group); hiddenLayer.Items.Add(footer); group.Items.Add(child);
        screen.Layers.Add(layer); screen.Layers.Add(hiddenLayer);
        return (screen, [header,footer,child,group], hiddenLayer);
    }
    [TestMethod]
    public async Task EngineeringVisibilityRendersFullItemsWithoutChangingModelVisibilityOrDefaults()
    {
        var (screen,items,layer) = Fixture(false); var properties = items.Select(item => item.Visible).ToArray(); var layerProperty = layer.Visible;
        var renderer = new HmiScreenToHtmlConverter();
        var original = HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen));
        Assert.IsFalse(original.Contains("Dummy Header") || original.Contains("Dummy Footer") || original.Contains("Nested text"));
        var options = new HmiHtmlConvertOptions(); Assert.IsFalse(options.IncludeInvisibleItems); options.IncludeInvisibleItems = true;
        var included = HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen, null, options));
        foreach (var caption in new[] { "Dummy Header", "Dummy Footer", "Nested text" }) StringAssert.Contains(included,caption);
        Assert.AreEqual(HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(Fixture(true).Screen)),included);
        for (var index = 0; index < items.Length; index++) { Assert.AreSame(properties[index],items[index].Visible); Assert.IsFalse(items[index].Visible.StaticValue); }
        Assert.AreSame(layerProperty,layer.Visible); Assert.IsFalse(layer.Visible.StaticValue);
        Assert.AreEqual(original,HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen)));
    }
}
