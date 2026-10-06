using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FaceplateButtonMediaHtmlTests
{
    private static readonly HmiColor Color = HmiColor.FromArgb(255, 1, 2, 3);
    private static readonly HmiColor FallbackColor = HmiColor.FromArgb(255, 17, 18, 19);
    private sealed class Project(HmiFaceplateType type) : HmiProjectBase
    {
        public List<string> ImageCalls { get; } = [];
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default) => new(type);
        public override ValueTask<HmiImage?> GetImageAsync(string id, CancellationToken cancellationToken = default)
        {
            ImageCalls.Add(id); return new(new HmiImage { Data = [1, 2, 3], MimeType = "image/png" });
        }
    }
    private static (HmiScreen Root, HmiLayer RootLayer, HmiFaceplateContainer Instance, HmiButton Button, Project Project) Setup(string source, params HmiFaceplateInterfaceValue[] values)
    {
        var root = new HmiScreen(); var rootLayer = new HmiLayer(); root.Layers.Add(rootLayer);
        var instance = new HmiFaceplateContainer { FaceplateId = "type" }; foreach (var value in values) instance.InterfaceValues.Add(value); rootLayer.Items.Add(instance);
        var type = new HmiFaceplateType(); var layer = new HmiLayer(); type.Layers.Add(layer);
        var button = new HmiButton { Mode = HmiButtonType.GraphicAndText, Text = HmiMultilingualText.FromText("Caption"), Image = new HmiImageSource { Uri = "normal.svg" } };
        if (source == "alternate") button.Pressed = true;
        if (source == "disabled") { button.Enabled = false; button.ShowDisabledState = true; button.DisabledImageMode = HmiDisabledImageMode.Reference; }
        layer.Items.Add(button); return (root, rootLayer, instance, button, new Project(type));
    }
    private static async Task<string[]> Render(HmiScreen root, Project project)
    {
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, project);
        html = Regex.Replace(html, @"<script\b[^>]*>[\s\S]*?</script>", "", RegexOptions.IgnoreCase);
        return Regex.Matches(html, @"<button\b[^>]*>[\s\S]*?</button>").Select(match => match.Value).ToArray();
    }
    public static IEnumerable<object?[]> ImageCases()
    {
        foreach (var source in new[] { "normal", "alternate", "disabled" })
        foreach (var (value, expected, tagged) in new (object?, string?, bool)[] {
            (new HmiImageSource { Uri = "instance.svg" }, "instance.svg", false), (new HmiImageSource(), null, false),
            ("instance.svg", "fallback.svg", false), (new Dictionary<string, object> { ["Uri"] = 42 }, "fallback.svg", false),
            (null, "fallback.svg", false), (new HmiImageSource { Uri = "instance.svg" }, "fallback.svg", true) }) yield return [source, value, expected, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(ImageCases))]
    public async Task ImageInterfacesUseLiteralAndFallbackSources(string source, object? value, string? expected, bool tagged)
    {
        var (root, _, _, button, project) = Setup(source, new HmiFaceplateInterfaceValue() { Name = "Image", Value = value, TagName = tagged ? "RuntimeImage" : null });
        var property = source == "normal" ? "Image" : source == "alternate" ? "AlternateImage" : "DisabledImage";
        typeof(HmiButton).GetProperty(property)!.SetValue(button, new HmiFaceplateInterfaceProperty<HmiImageSource> { InterfaceName = "Image", StaticValue = new() { Uri = "fallback.svg" } });
        var html = (await Render(root, project))[0];
        if (expected is null) Assert.IsFalse(html.Contains("<img")); else StringAssert.Contains(html, "src=\"" + expected + "\"");
    }
    public static IEnumerable<object?[]> ColorCases()
    {
        foreach (var source in new[] { "normal", "alternate", "disabled" })
        foreach (var (value, expected, tagged) in new (object?, string, bool)[] {
            (Color, "1,2,3", false), ("#010203", "17,18,19", false), (new Dictionary<string, object> { ["Alpha"] = 255, ["Red"] = "1", ["Green"] = 2, ["Blue"] = 3 }, "17,18,19", false),
            (null, "17,18,19", false), (Color, "17,18,19", true) }) yield return [source, value, expected, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(ColorCases))]
    public async Task ColorInterfacesUseLiteralAndFallbackColors(string source, object? value, string expected, bool tagged)
    {
        var (root, _, _, button, project) = Setup(source, new HmiFaceplateInterfaceValue() { Name = "Color", Value = value, TagId = tagged ? "runtime-color" : null }, new() { Name = "KeyEnabled", Value = " True " });
        var prefix = source == "normal" ? "Image" : source == "alternate" ? "AlternateImage" : "DisabledImage";
        if (source != "normal") typeof(HmiButton).GetProperty(prefix)!.SetValue(button, HmiProperty.Static(new HmiImageSource { Uri = "selected.svg" }));
        typeof(HmiButton).GetProperty(prefix + "BackgroundTransparent")!.SetValue(button, new HmiFaceplateInterfaceProperty<bool> { InterfaceName = "KeyEnabled", StaticValue = false });
        HmiFaceplateInterfaceProperty<HmiColor> BoundColor() => new() { InterfaceName = "Color", StaticValue = FallbackColor };
        typeof(HmiButton).GetProperty(prefix + "BackgroundColor")!.SetValue(button, BoundColor());
        button.CaptionColor = BoundColor(); button.ThreeDBorderWidth = 2; button.ThreeDBorderTopColor = BoundColor();
        var html = (await Render(root, project))[0]; var css = expected == "1,2,3" ? "#010203" : "#111213";
        StringAssert.Contains(html, "data-hmi-image-color-key=\"" + expected + "\"");
        StringAssert.Contains(html, "color: " + css + ";"); StringAssert.Contains(html, "box-shadow: inset 2px 0 0 " + css);
    }
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task StateImageRetainsSourceAndColorPrecedence(bool transparent)
    {
        var (root, _, _, button, project) = Setup("alternate", new() { Name = "Image", Value = new HmiImageSource { Uri = "instance.svg" } }, new() { Name = "Color", Value = Color }, new() { Name = "KeyEnabled", Value = true });
        HmiFaceplateInterfaceProperty<HmiImageSource> BoundImage() => new() { InterfaceName = "Image", StaticValue = new() { Uri = "fallback.svg" } };
        button.Image = BoundImage(); button.AlternateImage = BoundImage();
        button.ImageBackgroundTransparent = new HmiFaceplateInterfaceProperty<bool> { InterfaceName = "KeyEnabled", StaticValue = false };
        button.ImageBackgroundColor = new HmiFaceplateInterfaceProperty<HmiColor> { InterfaceName = "Color", StaticValue = FallbackColor }; button.CaptionColor = button.ImageBackgroundColor;
        button.States.Add(new() { Value = 0, Image = new HmiImageSource { Uri = "state.svg" }, ImageBackgroundTransparent = transparent, ImageBackgroundColor = FallbackColor, CaptionColor = FallbackColor });
        var html = (await Render(root, project))[0]; StringAssert.Contains(html, "src=\"state.svg\"");
        Assert.AreEqual(transparent, html.Contains("data-hmi-image-color-key=\"17,18,19\"")); Assert.IsFalse(html.Contains("color: #010203;"));
    }
    [TestMethod]
    public async Task ImageReferencesResolveThroughProviderAndStayScoped()
    {
        var (root, rootLayer, _, button, project) = Setup("normal", new HmiFaceplateInterfaceValue { Name = "Image", Value = new HmiImageSource { ImageId = "image-id" } });
        button.Image = new HmiFaceplateInterfaceProperty<HmiImageSource> { InterfaceName = "Image", StaticValue = new() { Uri = "fallback.svg" } };
        var second = new HmiFaceplateContainer { FaceplateId = "type" }; second.InterfaceValues.Add(new() { Name = "Image", Value = new HmiImageSource { Uri = "second.svg" } }); rootLayer.Items.Add(second);
        var html = await Render(root, project); StringAssert.Contains(html[0], "src=\"data:image/png;base64,AQID\""); StringAssert.Contains(html[1], "src=\"second.svg\"");
        CollectionAssert.AreEqual(new[] { "image-id" }, project.ImageCalls); Assert.AreEqual("fallback.svg", button.Image.StaticValue!.Uri);
    }
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task IndependentBevelColorsKeepPressedReversal(bool pressed)
    {
        var (root, _, _, button, project) = Setup("normal", new() { Name = "Top", Value = Color }, new() { Name = "Bottom", Value = FallbackColor });
        button.Pressed = pressed; button.ThreeDBorderWidth = 2;
        button.ThreeDBorderTopColor = new HmiFaceplateInterfaceProperty<HmiColor> { InterfaceName = "Top", StaticValue = FallbackColor };
        button.ThreeDBorderBottomColor = new HmiFaceplateInterfaceProperty<HmiColor> { InterfaceName = "Bottom", StaticValue = Color };
        var html = (await Render(root, project))[0]; StringAssert.Contains(html, "box-shadow: inset 2px 0 0 " + (pressed ? "#111213" : "#010203"));
        StringAssert.Contains(html, "inset -2px 0 0 " + (pressed ? "#010203" : "#111213"));
    }
}
