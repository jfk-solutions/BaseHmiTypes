using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FaceplateButtonFlagHtmlTests
{
    private sealed class Project(HmiFaceplateType type) : HmiProjectBase
    {
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default) => new(type);
    }
    private static (HmiScreen Root, HmiLayer RootLayer, HmiFaceplateContainer Instance, HmiButton Button, Project Project) Setup()
    {
        var root = new HmiScreen(); var rootLayer = new HmiLayer(); root.Layers.Add(rootLayer);
        var instance = new HmiFaceplateContainer { FaceplateId = "type" }; rootLayer.Items.Add(instance);
        var type = new HmiFaceplateType(); var layer = new HmiLayer(); type.Layers.Add(layer);
        var button = new HmiButton {
            Mode = HmiButtonType.GraphicAndText, Text = HmiMultilingualText.FromText("Up"), AlternateText = HmiMultilingualText.FromText("Down"),
            Image = new HmiImageSource { Uri = "up.svg" }, PressedContentOffset = 2, ThreeDBorderWidth = 3,
            ThreeDBorderTopColor = HmiColor.FromArgb(255, 238, 238, 238), ThreeDBorderBottomColor = HmiColor.FromArgb(255, 64, 64, 64),
            HorizontalAlignment = HmiHorizontalAlignment.Left, ImageHorizontalAlignment = HmiHorizontalAlignment.Left
        };
        layer.Items.Add(button); return (root, rootLayer, instance, button, new Project(type));
    }
    private static async Task<string[]> Render(HmiScreen root, Project project)
    {
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, project);
        html = Regex.Replace(html, @"<script\b[^>]*>[\s\S]*?</script>", "", RegexOptions.IgnoreCase);
        return Regex.Matches(html, @"<button\b[^>]*>[\s\S]*?</button>").Select(match => match.Value).ToArray();
    }
    public static IEnumerable<object[]> Cases()
    {
        foreach (var (value, expected) in new (object, bool)[] { (true, true), (false, false), (" TrUe ", true), (0, false), ("invalid", false) })
        foreach (var property in new[] { "Pressed", "Toggle", "DownStateSameAsUp", "OverlayContent", "AvoidImageCaptionOverlap", "ShowDisabledState", "DisabledImageFallbackToNormal" })
            yield return [property, value, expected];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task ButtonFlagsUseInstanceValues(string property, object value, bool expected)
    {
        var (root, _, instance, button, project) = Setup();
        instance.InterfaceValues.Add(new() { Name = "Flag", Value = value });
        typeof(HmiButton).GetProperty(property)!.SetValue(button, new HmiFaceplateInterfaceProperty<bool> { InterfaceName = "Flag", StaticValue = false });
        if (property is "DownStateSameAsUp" or "Toggle") button.Pressed = true;
        if (property == "AvoidImageCaptionOverlap") button.OverlayContent = true;
        if (property is "ShowDisabledState" or "DisabledImageFallbackToNormal")
        {
            button.Enabled = false; button.DisabledImageMode = HmiDisabledImageMode.Reference;
            if (property == "ShowDisabledState") button.DisabledImage = new HmiImageSource { Uri = "disabled.svg" };
            else button.ShowDisabledState = true;
        }
        var html = (await Render(root, project))[0];
        if (property is "Pressed" or "DownStateSameAsUp")
        {
            var down = property == "Pressed" ? expected : !expected;
            StringAssert.Contains(html, "aria-label=\"" + (down ? "Down" : "Up") + "\"");
            Assert.AreEqual(down, html.Contains("data-hmi-button-pressed-caption"));
            Assert.AreEqual(down, Regex.IsMatch(html, @"<img[^>]*transform: translate\(2px, 2px\)"));
            StringAssert.Contains(html, "box-shadow: inset 3px 0 0 " + (down ? "#404040" : "#EEEEEE"));
        }
        else if (property == "Toggle") Assert.AreEqual(expected, html.Contains("aria-pressed=\"true\""));
        else if (property == "OverlayContent") Assert.AreEqual(expected, html.Contains("data-hmi-button-overlay"));
        else if (property == "AvoidImageCaptionOverlap") Assert.AreEqual(expected, html.Contains("data-hmi-button-caption-avoid-image=\"start\""));
        else if (property == "ShowDisabledState") Assert.AreEqual(expected, html.Contains("disabled.svg"));
        else Assert.AreEqual(expected, html.Contains("up.svg"));
    }
    [TestMethod]
    public async Task RepeatedInstancesKeepPressedValuesScopedAndTagBindingsUseFallback()
    {
        var (root, rootLayer, instance, button, project) = Setup();
        button.Pressed = new HmiFaceplateInterfaceProperty<bool> { InterfaceName = "Flag", StaticValue = false };
        instance.InterfaceValues.Add(new() { Name = "Flag", Value = true });
        foreach (var values in new HmiFaceplateInterfaceValue[][] {
            [new() { Name = "Flag", Value = false }], [new() { Name = "Flag", Value = true, TagName = "RuntimeFlag" }], [] })
        {
            var other = new HmiFaceplateContainer { FaceplateId = "type" }; foreach (var value in values) other.InterfaceValues.Add(value); rootLayer.Items.Add(other);
        }
        var html = await Render(root, project); Assert.AreEqual(4, html.Length);
        StringAssert.Contains(html[0], "aria-label=\"Down\"");
        foreach (var other in html.Skip(1)) StringAssert.Contains(other, "aria-label=\"Up\"");
        Assert.IsFalse(button.Pressed.StaticValue);
    }
}
