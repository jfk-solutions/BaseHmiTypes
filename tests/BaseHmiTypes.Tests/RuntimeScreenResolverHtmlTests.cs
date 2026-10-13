using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RuntimeScreenResolverHtmlTests
{
    [TestMethod]
    public async Task ResolversRenderEachWindowInstanceAndTemplateWithoutAProject()
    {
        var root = new HmiScreen { Name = "Root", TemplateId = "template" };
        var layer = new HmiLayer(); root.Layers.Add(layer);
        var left = new HmiScreenWindow { Name = "Left", ScreenId = "child" };
        var right = new HmiScreenWindow { Name = "Right", ScreenId = "child" };
        layer.Items.Add(left); layer.Items.Add(right);
        var options = new HmiHtmlConvertOptions {
            TemplateResolver = (screen, _) => new ValueTask<HmiScreenBase?>(ReferenceEquals(screen, root) ? new HmiScreen { Name = "TemplateInstance" } : null),
            ScreenWindowResolver = (window, _) => new ValueTask<HmiScreenBase?>(new HmiScreen { Id = "child", Name = window.Name + "Instance" })
        };
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, options: options);
        foreach (var name in new[] { "LeftInstance", "RightInstance", "TemplateInstance" }) StringAssert.Contains(html, "id=\"" + name + "\"");
        options.ScreenWindowResolver = (_, _) => new ValueTask<HmiScreenBase?>((HmiScreenBase?)null);
        var empty = await new HmiScreenToHtmlConverter().ConvertAsync(root, options: options);
        Assert.IsFalse(empty.Contains("LeftInstance")); StringAssert.Contains(empty, "hmi-missing-screen");
    }
}
