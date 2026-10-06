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
public class FaceplateDefaultHtmlTests
{
    private sealed class Project : HmiProjectBase
    {
        public Dictionary<string, HmiFaceplateType> Types { get; } = new();
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default)
            => new(Types.TryGetValue(id, out var type) ? type : null);
    }
    private static HmiScreen Screen(params HmiScreenItemBase[] items)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        foreach (var item in items) layer.Items.Add(item); return screen;
    }
    private static HmiFaceplateType Definition(params HmiScreenItemBase[] items)
    {
        var type = new HmiFaceplateType(); var layer = new HmiLayer(); type.Layers.Add(layer);
        foreach (var item in items) layer.Items.Add(item); return type;
    }
    private static HmiFaceplateInterfaceProperty<T> Bind<T>(string name, T fallback) => new() { InterfaceName = name, StaticValue = fallback };
    private static HmiLabel Caption() => new() { Text = Bind("Caption", HmiMultilingualText.FromText("Control fallback")) };
    private static async Task<string> Render(HmiScreenBase screen, Project? project = null, int? lcid = null)
        => Regex.Replace(await new HmiScreenToHtmlConverter().ConvertAsync(screen, project, new() { CultureLcid = lcid }), @"<script\b[^>]*>[\s\S]*?</script>", "", RegexOptions.IgnoreCase);

    [TestMethod]
    [DataRow("absent", "Definition &lt;caption&gt;")]
    [DataRow("literal", "Instance caption")]
    [DataRow("null", "Control fallback")]
    [DataRow("invalid", "Control fallback")]
    [DataRow("tag-id", "Control fallback")]
    [DataRow("tag-name", "Control fallback")]
    [DataRow("empty", null)]
    public async Task DefaultsApplyOnlyWhenAnInstanceEntryIsAbsent(string mode, string? expected)
    {
        var label = Caption(); var type = Definition(label); type.InterfaceProperties.Add(new() { Name = "CAPTION", DefaultValue = "Definition <caption>" });
        var instance = new HmiFaceplateContainer { FaceplateId = "type" };
        if (mode != "absent") instance.InterfaceValues.Add(new() { Name = "caption", Value = mode == "empty" ? "" : mode == "null" ? null : mode == "invalid" ? 42 : "Instance caption", TagId = mode == "tag-id" ? "tag" : null, TagName = mode == "tag-name" ? "tag" : null });
        var project = new Project(); project.Types["type"] = type; var html = await Render(Screen(instance), project);
        foreach (var caption in new[] { "Definition &lt;caption&gt;", "Instance caption", "Control fallback" }) Assert.AreEqual(caption == expected, html.Contains(caption));
        Assert.AreEqual("Control fallback", label.Text.StaticValue!.GetText(null)); Assert.AreEqual(mode == "absent" ? 0 : 1, instance.InterfaceValues.Count);
    }

    [TestMethod]
    [DataRow("missing")]
    [DataRow("null")]
    [DataRow("invalid")]
    [DataRow("tag-member")]
    [DataRow("tag-collection")]
    public async Task UnusableOrTagDefaultsKeepTheControlFallback(string mode)
    {
        var type = Definition(Caption()); var member = new HmiFaceplateInterfaceMember { Name = "Caption", DefaultValue = mode == "null" ? null : mode == "invalid" ? new object() : "Excluded default", IsTag = mode == "tag-member" };
        if (mode == "tag-collection") type.TagInterfaceProperties.Add(member); else if (mode != "missing") type.InterfaceProperties.Add(member);
        var html = await Render(type); StringAssert.Contains(html, "Control fallback"); Assert.IsFalse(html.Contains("Excluded default"));
    }

    [TestMethod]
    [DataRow(1033, "English &lt;default&gt;")]
    [DataRow(1031, "Deutsch &lt;default&gt;")]
    public async Task StandaloneDefinitionsUseLocalizedDefaults(int lcid, string expected)
    {
        var text = HmiMultilingualText.FromText("English <default>", 1033); text.Texts[1031] = "Deutsch <default>";
        var type = Definition(Caption()); type.InterfaceProperties.Add(new() { Name = "Caption", DefaultValue = text });
        StringAssert.Contains(await Render(type, lcid: lcid), expected); Assert.AreEqual(2, text.Texts.Count);
    }

    [TestMethod]
    public async Task DefaultsReachNumberBooleanColorAndImageConsumers()
    {
        var button = new HmiButton { Mode = HmiButtonType.GraphicAndText, Text = HmiMultilingualText.FromText("Initial"), State = Bind("State", 23d), Pressed = Bind("Pressed", false), PressedContentOffset = Bind("Offset", 23d), CaptionColor = Bind("Color", HmiColor.FromArgb(255, 17, 18, 19)), Image = Bind("Image", new HmiImageSource { Uri = "fallback.svg" }) };
        button.States.Add(new() { Value = 2.5, Text = HmiMultilingualText.FromText("Default state") });
        var type = Definition(button); foreach (var (name, value) in new (string, object)[] { ("State", 2.5), ("Pressed", true), ("Offset", 3d), ("Color", HmiColor.FromArgb(255, 1, 2, 3)), ("Image", new HmiImageSource { Uri = "default.svg" }) }) type.InterfaceProperties.Add(new() { Name = name, DefaultValue = value });
        var html = await Render(type); foreach (var value in new[] { "aria-label=\"Default state\"", "transform: translate(3px, 3px)", "color: #010203;", "src=\"default.svg\"" }) StringAssert.Contains(html, value);
        Assert.AreEqual("fallback.svg", button.Image.StaticValue!.Uri);
    }

    [TestMethod]
    public async Task RepeatedAndNestedInstancesKeepTheirOwnDefaultScopes()
    {
        var inner = Definition(Caption()); inner.InterfaceProperties.Add(new() { Name = "Caption", DefaultValue = "Inner default" });
        var nested = new HmiFaceplateContainer { FaceplateId = "inner" }; var outer = Definition(Caption(), nested); outer.InterfaceProperties.Add(new() { Name = "Caption", DefaultValue = "Outer default" });
        var first = new HmiFaceplateContainer { FaceplateId = "outer" }; var second = new HmiFaceplateContainer { FaceplateId = "outer" }; second.InterfaceValues.Add(new() { Name = "Caption", Value = "Override" });
        var project = new Project(); project.Types["outer"] = outer; project.Types["inner"] = inner;
        var html = await Render(Screen(first, second), project);
        Assert.AreEqual(1, Regex.Matches(html, "Outer default").Count); Assert.AreEqual(1, Regex.Matches(html, "Override").Count); Assert.AreEqual(2, Regex.Matches(html, "Inner default").Count);
        Assert.AreEqual("Outer default", outer.InterfaceProperties[0].DefaultValue); Assert.AreEqual(0, nested.InterfaceValues.Count);
    }

    [TestMethod]
    public async Task DuplicateDefaultsAndExplicitValuesRetainFirstEligibleEntry()
    {
        var type = Definition(Caption()); type.InterfaceProperties.Add(new() { Name = " ", DefaultValue = "Blank ignored" }); type.InterfaceProperties.Add(new() { Name = "Caption", IsTag = true, DefaultValue = "Tag ignored" });
        type.InterfaceProperties.Add(new() { Name = "caption", DefaultValue = "First default" }); type.InterfaceProperties.Add(new() { Name = "CAPTION", DefaultValue = "Second ignored" });
        StringAssert.Contains(await Render(type), "First default");
        var item = new HmiFaceplateContainer { FaceplateId = "type" }; item.InterfaceValues.Add(new() { Name = "Caption", TagId = "tag" }); item.InterfaceValues.Add(new() { Name = "CAPTION", Value = "First literal" }); item.InterfaceValues.Add(new() { Name = "caption", Value = "Second literal" });
        var project = new Project(); project.Types["type"] = type; var html = await Render(Screen(item), project);
        StringAssert.Contains(html, "First literal"); Assert.IsFalse(html.Contains("First default")); Assert.IsFalse(html.Contains("Second literal"));
    }
}
