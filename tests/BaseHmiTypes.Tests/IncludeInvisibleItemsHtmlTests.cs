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
        Assert.AreEqual(5, System.Text.RegularExpressions.Regex.Matches(included, "opacity: 0.5;").Count);
        Assert.AreEqual(HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(Fixture(true).Screen)),included.Replace("opacity: 0.5;", ""));
        for (var index = 0; index < items.Length; index++) { Assert.AreSame(properties[index],items[index].Visible); Assert.IsFalse(items[index].Visible.StaticValue); }
        Assert.AreSame(layerProperty,layer.Visible); Assert.IsFalse(layer.Visible.StaticValue);
        Assert.AreEqual(original,HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen)));
    }

    [TestMethod]
    public async Task NativeUnifiedTextUsesCenteredDefaultsAndComposesEngineeringOpacity()
    {
        var (screen, items, _) = Fixture(false);
        var header = (HmiText)items[0];
        header.SourceFormat = "TIA WinCC Unified"; header.Opacity = 0.4;
        var renderer = new HmiScreenToHtmlConverter();
        var options = new HmiHtmlConvertOptions { IncludeInvisibleItems = true };
        async Task<string> HeaderStyle() => System.Text.RegularExpressions.Regex.Match(
            HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen, null, options)), "<div id=\"Header\"[^>]*>").Value;
        var style = await HeaderStyle();
        StringAssert.Contains(style, "opacity: 0.2;");
        StringAssert.Contains(style, "text-align: center;justify-content: center;display: flex;align-items: center;");
        header.HorizontalAlignment = HmiHorizontalAlignment.Right; header.VerticalAlignment = HmiVerticalAlignment.Bottom;
        StringAssert.Contains(await HeaderStyle(), "text-align: right;justify-content: flex-end;display: flex;align-items: flex-end;");
        Assert.AreEqual(0.4, header.Opacity.StaticValue); Assert.IsFalse(header.Visible.StaticValue);
        header.Visible = true; StringAssert.Contains(await HeaderStyle(), "opacity: 0.4;");
    }
}
