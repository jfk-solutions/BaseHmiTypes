using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FaceplateReferenceHtmlTests
{
    private sealed class Project : HmiProjectBase
    {
        public List<string> Calls { get; } = new();
        public Dictionary<string, HmiFaceplateType> ById { get; } = new();
        public Dictionary<string, HmiFaceplateType> ByVersion { get; } = new();
        public CancellationToken LastToken { get; private set; }
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default)
        {
            Calls.Add("id:" + id); LastToken = cancellationToken;
            return new(ById.TryGetValue(id, out var value) ? value : null);
        }
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string name, string version, CancellationToken cancellationToken = default)
        {
            Calls.Add("version:" + name + "/" + version); LastToken = cancellationToken;
            return new(ByVersion.TryGetValue(name + "/" + version, out var value) ? value : null);
        }
    }
    private static HmiScreen Screen(params HmiScreenItemBase[] items)
    {
        var result = new HmiScreen { Name = "Root" }; var layer = new HmiLayer();
        foreach (var item in items) layer.Items.Add(item);
        result.Layers.Add(layer); return result;
    }
    private static HmiFaceplateType Definition(params HmiScreenItemBase[] items)
    {
        var result = new HmiFaceplateType(); var layer = new HmiLayer();
        foreach (var item in items) layer.Items.Add(item);
        result.Layers.Add(layer); return result;
    }
    private static HmiFaceplateContainer Instance(string id) => new() { FaceplateId = id };
    private static HmiLabel Label(string text) => new() { Text = HmiMultilingualText.FromText(text) };

    [TestMethod]
    [DataRow(true)]
    [DataRow(false)]
    public async Task LookupPrefersIdThenExactNameAndVersion(bool idFound)
    {
        var project = new Project(); var item = Instance("type-id"); item.FaceplateName = "GenericType"; item.FaceplateVersion = "2.0";
        var type = Definition(Label("Resolved caption")); type.Name = "Definition";
        if (idFound) project.ById["type-id"] = type; else project.ByVersion["GenericType/2.0"] = type;
        using var cancellation = new CancellationTokenSource(); var rows = new List<HmiHtmlItemDiagnostic>();
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(item), project, new() { ItemDiagnostic = rows.Add }, cancellation.Token);
        StringAssert.Contains(html, "Resolved caption"); Assert.AreEqual("HmiFaceplateContainer", rows[0].RendererRoute);
        Assert.AreEqual(idFound ? 1 : 2, project.Calls.Count); Assert.AreEqual(cancellation.Token, project.LastToken);
        if (!idFound) Assert.AreEqual("version:GenericType/2.0", project.Calls[1]);
        Assert.AreEqual(1, html.Split("<meta charset=").Length - 1);
    }
    [TestMethod]
    public async Task MissingTypeIsEscapedAndDoesNotRenderUnrelatedChildren()
    {
        var project = new Project(); var item = Instance("missing"); item.FaceplateName = "<Missing&Type>"; item.Items.Add(Label("Retained child"));
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(item), project, new() { MissingScreenPlaceholderCssClass = "custom-missing" });
        StringAssert.Contains(html, "class=\"custom-missing\""); StringAssert.Contains(html, "&lt;Missing&amp;Type&gt;"); Assert.IsFalse(html.Contains("Retained child")); Assert.AreEqual(1, project.Calls.Count);
    }
    [TestMethod]
    public async Task RepeatedInstancesKeepIndependentTextAndDoNotMutateDefinition()
    {
        var project = new Project(); var label = new HmiLabel(); var button = new HmiButton(); var field = new HmiIOField(); var box = new HmiTextBox();
        HmiFaceplateInterfaceProperty<HmiMultilingualText> Binding() => new() { InterfaceName = "Caption", StaticValue = HmiMultilingualText.FromText("Fallback") };
        label.Text = Binding(); button.Text = Binding(); field.Text = Binding(); box.Text = Binding();
        var group = new HmiGroup(); group.Items.Add(label); group.Items.Add(button); group.Items.Add(field); group.Items.Add(box);
        project.ById["shared"] = Definition(group); var first = Instance("shared"); var second = Instance("shared");
        first.InterfaceValues.Add(new() { Name = "caption", Value = "First <caption>" }); first.InterfaceValues.Add(new() { Name = "CAPTION", Value = "Duplicate ignored" });
        second.InterfaceValues.Add(new() { Name = "Caption", Value = HmiMultilingualText.FromText("Second caption") });
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(first, second), project);
        Assert.AreEqual(5, html.Split("First &lt;caption&gt;").Length - 1); Assert.AreEqual(5, html.Split("Second caption").Length - 1);
        Assert.IsFalse(html.Contains("Duplicate ignored")); Assert.IsFalse(html.Contains("Recursive screen reference")); Assert.AreEqual("Fallback", label.Text.StaticValue!.GetText(null));
    }
    [TestMethod]
    [DataRow("tag-name")]
    [DataRow("tag-id")]
    [DataRow("null")]
    [DataRow("invalid")]
    [DataRow("empty")]
    public async Task InterfaceTextFallbackAndEmptyValue(string mode)
    {
        var project = new Project(); var item = Instance("type"); var control = Label("Fallback");
        control.Text = new HmiFaceplateInterfaceProperty<HmiMultilingualText> { InterfaceName = "Caption", StaticValue = HmiMultilingualText.FromText("Fallback") };
        item.InterfaceValues.Add(new() { Name = "Caption", Value = mode == "empty" ? "" : mode == "invalid" ? 42 : mode == "null" ? null : "Runtime tag", TagName = mode == "tag-name" ? "Tag" : null, TagId = mode == "tag-id" ? "tag-id" : null });
        if (mode == "null") item.InterfaceValues.Add(new() { Name = "Caption", Value = "Later duplicate" });
        project.ById["type"] = Definition(control); var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(item), project);
        Assert.AreEqual(mode != "empty", html.Contains("Fallback")); Assert.IsFalse(html.Contains("Runtime tag")); Assert.IsFalse(html.Contains("Later duplicate"));
    }
    [TestMethod]
    public async Task NestedFaceplatesReplaceParentInterfaceScope()
    {
        var project = new Project(); var outer = Instance("outer"); var inner = Instance("inner"); var child = Label("Inner fallback");
        child.Text = new HmiFaceplateInterfaceProperty<HmiMultilingualText> { InterfaceName = "Caption", StaticValue = HmiMultilingualText.FromText("Inner fallback") };
        outer.InterfaceValues.Add(new() { Name = "Caption", Value = "Outer caption" }); project.ById["outer"] = Definition(inner); project.ById["inner"] = Definition(child);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(outer), project);
        StringAssert.Contains(html, "Inner fallback"); Assert.IsFalse(html.Contains("Outer caption"));
    }
    [TestMethod]
    [DataRow(null)]
    [DataRow("recursive-id")]
    public async Task RecursiveFaceplatesTerminate(string? id)
    {
        var project = new Project(); var type = Definition(Instance("self")); type.Id = id; project.ById["self"] = type;
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(Instance("self")), project);
        StringAssert.Contains(html, "Recursive screen reference"); StringAssert.Contains(html, "data-hmi-recursive-screen=\"" + (id ?? "anonymous") + "\""); Assert.AreEqual(2, project.Calls.Count);
    }
    [TestMethod]
    [DataRow("caption", "CAPTION", true)]
    [DataRow("straße", "STRASSE", false)]
    [DataRow("ı", "I", false)]
    [DataRow("ä", "Ä", true)]
    public async Task InterfaceNamesUseOrdinalCaseMatching(string sourceName, string bindingName, bool matches)
    {
        var project = new Project(); var item = Instance("type"); var control = Label("Fallback");
        control.Text = new HmiFaceplateInterfaceProperty<HmiMultilingualText> { InterfaceName = bindingName, StaticValue = HmiMultilingualText.FromText("Fallback") };
        item.InterfaceValues.Add(new() { Name = sourceName, Value = "Matched caption" }); project.ById["type"] = Definition(control);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(item), project);
        Assert.AreEqual(matches, html.Contains("Matched caption")); Assert.AreEqual(!matches, html.Contains("Fallback"));
    }
    [TestMethod]
    public async Task SameIdWithDifferentCaseStopsRecursionAcrossDifferentObjects()
    {
        var project = new Project(); var first = Definition(Instance("second")); var second = Definition(Instance("first"));
        first.Id = "TYPE-ID"; second.Id = "type-id"; project.ById["first"] = first; project.ById["second"] = second;
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(Screen(Instance("first")), project);
        StringAssert.Contains(html, "data-hmi-recursive-screen=\"type-id\""); Assert.AreEqual(2, project.Calls.Count);
    }

}
