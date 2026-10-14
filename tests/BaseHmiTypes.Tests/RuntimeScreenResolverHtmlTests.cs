using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RuntimeScreenResolverHtmlTests
{
    [TestMethod]
    public async Task UnconfiguredWindowsStayBlankWhileUnresolvedConfiguredTargetsRemainVisible()
    {
        var root=new HmiScreen();var layer=new HmiLayer();root.Layers.Add(layer);var window=new HmiScreenWindow { Name="Empty" };layer.Items.Add(window);
        var converter=new HmiScreenToHtmlConverter();Assert.IsFalse((await converter.ConvertAsync(root)).Contains("Missing screen"));
        window.ScreenName="UnavailableChild";StringAssert.Contains(await converter.ConvertAsync(root),"UnavailableChild");
    }
    [TestMethod]
    public async Task FaceplateResolverRendersDetachedInstancesWithoutAProject()
    {
        var root = new HmiScreen { Name = "Root" };
        var layer = new HmiLayer(); root.Layers.Add(layer);
        layer.Items.Add(new HmiFaceplateContainer { Name = "Left", FaceplateId = "type" });
        layer.Items.Add(new HmiFaceplateContainer { Name = "Right", FaceplateId = "type" });
        var options = new HmiHtmlConvertOptions { FaceplateResolver = (container, _) => new ValueTask<HmiFaceplateType?>(new HmiFaceplateType { Name = container.Name + "Instance" }) };
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, options: options);
        StringAssert.Contains(html, "LeftInstance"); StringAssert.Contains(html, "RightInstance");
        options.FaceplateResolver = (_, _) => new ValueTask<HmiFaceplateType?>((HmiFaceplateType?)null);
        StringAssert.Contains(await new HmiScreenToHtmlConverter().ConvertAsync(root, options: options), "hmi-missing-screen");
    }
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
