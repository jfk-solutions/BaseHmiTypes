using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HtmlItemDiagnosticTests
{
    [TestMethod]
    public async Task DiagnosticsObserveActualDispatchWithoutChangingMarkup()
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        var group = new HmiGroup { Name = "Group" }; layer.Items.Add(group);
        var button = new HmiButton { Id = "1", Name = "Button", SourceFormat = "TIA WinCC Advanced" }; group.Items.Add(button);
        button.SourceProperties["Subtype"] = "Button"; button.SourceProperties["TiaTypeName"] = "Synthetic.Item"; button.SourceProperties["Configured.Test"] = "value";
        var unknown = new HmiUnkown { Name = "Unknown", SourceFormat = "WinCC Classic PDL" }; unknown.SourceProperties["WinCC.Object.ClassId"] = "00000000-0000-0000-0000-000000000001"; unknown.SourceProperties["WinCC.Object.ClassName"] = "SyntheticControl"; group.Items.Add(unknown);
        group.Items.Add(new DerivedText { Name = "Text" }); group.Items.Add(new Unsupported { Name = "Unsupported" }); group.Items.Add(new HmiText { Name = "Hidden", Visible = false });
        var renderer = new HmiScreenToHtmlConverter(); var before = await renderer.ConvertAsync(screen);
        var rows = new List<HmiHtmlItemDiagnostic>(); var after = await renderer.ConvertAsync(screen, options: new HmiHtmlConvertOptions { ItemDiagnostic = rows.Add });
        Assert.AreEqual(before, after); CollectionAssert.AreEqual(new[] { "HmiGroup", "HmiButton", "UnknownPlaceholder", "HmiText", "UnsupportedPlaceholder", "Hidden" }, rows.Select(row => row.RendererRoute).ToArray());
        Assert.AreEqual(5, rows[0].ChildCount); Assert.AreEqual("DerivedText", rows[3].ModelType); Assert.AreEqual("1", rows[1].ItemId); Assert.AreEqual("Button", rows[1].NativeSubtype); Assert.AreEqual("Synthetic.Item", rows[1].NativeTypeName);
        Assert.AreEqual("SyntheticControl", rows[2].NativeClassName); Assert.AreEqual("00000000-0000-0000-0000-000000000001", rows[2].NativeClassId); Assert.IsTrue(rows[2].IsPlaceholder); Assert.IsTrue(rows[4].IsPlaceholder); Assert.IsFalse(rows[1].IsPlaceholder);
        CollectionAssert.AreEqual(new[] { "Configured.Test", "Subtype", "TiaTypeName" }, rows[1].SourcePropertyNames.ToArray());
        button.SourceProperties["Added"] = "later"; button.Name = "Changed"; Assert.AreEqual("Button", rows[1].ItemName); Assert.AreEqual(3, rows[1].SourcePropertyNames.Count);
    }
    [TestMethod]
    public async Task HiddenContainerReportsItsRetainedChildCount()
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); var group = new HmiGroup { Visible = false }; group.Items.Add(new HmiButton()); layer.Items.Add(group);
        var rows = new List<HmiHtmlItemDiagnostic>(); await new HmiScreenToHtmlConverter().ConvertAsync(screen, options: new HmiHtmlConvertOptions { ItemDiagnostic = rows.Add });
        Assert.AreEqual(1, rows.Count); Assert.AreEqual("Hidden", rows[0].RendererRoute); Assert.AreEqual(1, rows[0].ChildCount);
    }
    private sealed class DerivedText : HmiText { }
    private sealed class Unsupported : HmiScreenItemBase { }
}
