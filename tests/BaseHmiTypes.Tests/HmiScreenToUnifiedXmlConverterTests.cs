using System.Globalization;
using System.Security.Cryptography;
using System.Xml.Linq;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.UnifiedXml;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiScreenToUnifiedXmlConverterTests
{
    private static readonly XNamespace Ns = HmiScreenToUnifiedXmlConverter.Namespace;
    private static readonly XNamespace U = HmiScreenToUnifiedXmlConverter.ContractNamespace;
    private readonly HmiScreenToUnifiedXmlConverter converter = new();

    private static Stream OpenCatalog() => HmiUnifiedXmlCatalog.Open();

    [TestMethod]
    public void EmbeddedCatalogPreservesTheFullReleasedArtifact()
    {
        using var stream = OpenCatalog();
        using var xmlStream = OpenCatalog();
        var root = XDocument.Load(xmlStream).Root!;
        Assert.AreEqual(HmiScreenToUnifiedXmlConverter.CatalogId, (string?)root.Attribute("id"));
        Assert.IsTrue(root.Element(U + "types")!.HasElements);
        Assert.AreEqual("stable-format-values", (string?)root.Attribute("defaults"));
        Assert.AreEqual(root.Name, XDocument.Parse(HmiUnifiedXmlCatalog.Read()).Root!.Name);
    }

    [TestMethod]
    public void EmittedAttributesBelongToThePublishedV21Contracts()
    {
        // Validate against the actual released catalog, independently of the writer mappings.
        using var stream = OpenCatalog();
        var catalog = XDocument.Load(stream);
        var contracts = catalog.Root!.Element(U + "types")!.Elements()
            .ToDictionary(e => (string)e.Attribute("id")!, StringComparer.Ordinal);
        var button = new HmiButton
        {
            Name = "Run", Text = HmiMultilingualText.FromText("Start", 1031), AlternateText = new HmiMultilingualText(),
            ToolTipText = HmiMultilingualText.FromText("Hint", 2057), Padding = new HmiThickness(),
            Font = new HmiFont { Name = "SiemensSans", Size = 14, Underline = false, Italic = true, Strikethrough = false },
            X = -2, Y = 3, Width = 100, Height = 20, Opacity = 0.5, RotationAngle = 90, RotationCenterX = 0.5,
            RotationCenterY = 1, TabIndex = 2, BorderWidth = 1, BorderColor = new HmiColor(255, 1, 2, 3),
            AlternateBorderColor = new HmiColor(127, 4, 5, 6), ForegroundColor = new HmiColor(255, 5, 6, 7),
            BackgroundColor = new HmiColor(255, 1, 2, 3), AlternateBackgroundColor = new HmiColor(255, 4, 5, 6)
        };
        var screen = With(button);
        screen.Number = 1; screen.BackgroundColor = new HmiColor(255, 4, 5, 6);
        screen.Layers[0].Items.Add(new HmiTextBox { Name = "Caption", ReadOnly = true, Font = button.Font, Padding = button.Padding });
        screen.Layers[0].Items.Add(new HmiGraphicView { Name = "Logo", Source = "Logo", Padding = button.Padding });
        foreach (var element in XDocument.Parse(converter.Convert(screen, "Panel").Xml).Descendants())
        {
            var type = (string?)element.Attribute(U + "type");
            if (type == null) continue;
            var contract = contracts[type];
            Assert.AreEqual((string?)contract.Attribute("tag"), element.Name.LocalName);
            var allowed = contract.Elements(U + "property").Where(p => (string?)p.Attribute("inline") == "true")
                .ToDictionary(p => (string)p.Attribute("xml")!, p => (string?)p.Element(U + "value")!.Attribute("type"));
            foreach (var member in contract.Elements(U + "member").Where(m => m.Attribute("attribute-map") != null))
            {
                var child = contracts[(string)member.Attribute("attribute-type")!];
                foreach (var mapping in ((string)member.Attribute("attribute-map")!).Split(' '))
                {
                    var pair = mapping.Split('=');
                    var property = child.Elements(U + "property").Single(p => (string?)p.Attribute("xml") == pair[0]);
                    allowed.Add(pair[1], (string?)property.Element(U + "value")!.Attribute("type"));
                }
            }
            foreach (var attribute in element.Attributes().Where(a => a.Name.Namespace == XNamespace.None))
            {
                Assert.IsTrue(allowed.TryGetValue(attribute.Name.LocalName, out var valueType), type + "." + attribute.Name);
                if (valueType == "System.Boolean")
                    Assert.IsTrue(attribute.Value is "True" or "False");
            }
        }
    }

    [TestMethod]
    public void WritesFixedProfileAndExplicitValuesWithoutGuessingDefaults()
    {
        var screen = new HmiScreen { Name = "Main", Width = 800, Height = 480, Number = 501,
            BackgroundColor = HmiColor.FromArgb(127, 1, 22, 254) };
        var result = converter.Convert(screen, "Panel");
        var root = XDocument.Parse(result.Xml).Root!;
        Assert.AreEqual(Ns + "unified-export", root.Name);
        Assert.AreEqual(HmiScreenToUnifiedXmlConverter.CatalogId, (string?)root.Attribute("catalog"));
        Assert.IsNull(root.Attribute("apiVersion"));
        Assert.AreEqual("screen", (string?)root.Attribute("scope"));
        Assert.AreEqual("Main", (string?)root.Attribute("screen"));
        Assert.AreEqual("false", (string?)root.Attribute("complete"));
        Assert.IsFalse(result.Complete);
        var element = root.Element(Ns + "screen")!;
        Assert.AreEqual("800", (string?)element.Attribute("width"));
        Assert.AreEqual("#0116FE7F", (string?)element.Attribute("back-color"));
        Assert.AreEqual("501", (string?)element.Attribute("screen-number"));
        Assert.IsNull(element.Attribute("enabled"));
        Assert.IsFalse(root.Descendants(U + "types").Any());
        Assert.AreEqual(1, result.Diagnostics.Count);
        Assert.IsFalse(root.Descendants().Any(e => e.Name.LocalName == "diagnostics"));
    }

    [TestMethod]
    public void PreservesItemOrderIdentityColorsAndBooleanLexicalForms()
    {
        var screen = new HmiScreen { Name = "Main" };
        var button = new HmiButton { Name = "Run", X = -10, Width = uint.MaxValue, Enabled = false,
            BackgroundColor = HmiColor.FromArgb(255, 1, 22, 254), BorderWidth = 2 };
        var layer = new HmiLayer();
        layer.Items.Add(button);
        layer.Items.Add(new HmiTextBox { Name = "Caption" });
        layer.Items.Add(button);
        screen.Layers.Add(layer);
        var document = XDocument.Parse(converter.Convert(screen, "Panel").Xml);
        var items = document.Root!.Element(Ns + "screen")!.Elements().ToArray();
        CollectionAssert.AreEqual(new[] { "button", "text-box", "ref" }, items.Select(e => e.Name.LocalName).ToArray());
        Assert.AreEqual("4294967295", (string?)items[0].Attribute("width"));
        Assert.AreEqual("-10", (string?)items[0].Attribute("left"));
        Assert.AreEqual("False", (string?)items[0].Attribute("enabled"));
        Assert.AreEqual("#0116FE", (string?)items[0].Attribute("back-color"));
        Assert.AreEqual(U + "ref", items[2].Name);
        Assert.AreEqual((string?)items[0].Attribute(U + "id"), (string?)items[2].Attribute("ref"));
    }

    [TestMethod]
    public void PreservesFormattedTextAndAttributeWhitespaceExactly()
    {
        const string source = "<body><p>A & B\r\n\tC</p></body>";
        var text = HmiMultilingualText.FromText("plain", 1031);
        text.FormattedTexts[1031] = source;
        text.Texts[2057] = "";
        var screen = With(new HmiButton { Name = "Run\r\n\tNow", Text = text,
            Font = new HmiFont { Name = "Arial", Size = 14, Italic = true },
            Padding = new HmiThickness { Left = 3 } });
        var result = converter.Convert(screen, "Panel");
        var button = XDocument.Parse(result.Xml).Descendants(Ns + "button").Single();
        Assert.AreEqual("Run\r\n\tNow", (string?)button.Attribute("name"));
        Assert.AreEqual("Arial", ((HmiButton)new HmiUnifiedXmlToScreenConverter().Convert(result.Xml).Screen.Layers[0].Items[0]).Font!.Name!.StaticValue);
        Assert.AreEqual("True", (string?)button.Attribute("font-italic"));
        Assert.AreEqual("3", (string?)button.Attribute("padding-left"));
        var entries = button.Element(Ns + "text")!.Elements().ToArray();
        Assert.AreEqual("de-DE", (string?)entries[0].Attribute("lang"));
        Assert.AreEqual(source, (string?)entries[0].Attribute("text"));
        Assert.AreEqual("en-GB", (string?)entries[1].Attribute("lang"));
        Assert.AreEqual("", (string?)entries[1].Attribute("text") ?? "");
    }

    [TestMethod]
    public void ReportsDynamicPropertiesInvalidNumbersAndUnsupportedData()
    {
        var button = new HmiButton { Name = "Run", Width = 1.5, X = (double)int.MaxValue + 1,
            BorderWidth = 256, Opacity = 0.1, Text = HmiMultilingualText.FromText("Default"),
            Visible = new HmiTagProperty<bool> { TagName = "Show", StaticValue = true } };
        button.SourceProperties["Unknown"] = "retained by reader";
        var screen = With(button);
        screen.Layers[0].Items.Add(new HmiRectangle { Name = "Unsupported" });
        var result = converter.Convert(screen, "Panel");
        var element = XDocument.Parse(result.Xml).Descendants(Ns + "button").Single();
        foreach (var alias in new[] { "width", "left", "border-width", "visible" }) Assert.IsNull(element.Attribute(alias));
        foreach (var property in new[] { "Width", "Left", "BorderWidth", "Visible" })
            Assert.IsTrue(result.Diagnostics.Any(d => d.Path.EndsWith("." + property, StringComparison.Ordinal)), property);
        Assert.IsNotNull(XDocument.Parse(result.Xml).Descendants(Ns + "rectangle").SingleOrDefault());
        Assert.AreEqual("0.1", (string?)element.Attribute("opacity"));
        Assert.IsTrue(result.Diagnostics.Any(d => d.Message.Contains("explicit LCID")));
        Assert.IsFalse(result.Xml.Contains("Show"));
    }

    [TestMethod]
    public void ExplicitDefaultLanguageIsUsedWithoutChangingPayload()
    {
        var result = converter.Convert(With(new HmiTextBox { Text = HmiMultilingualText.FromText("Hallo") }), "Panel", 1031);
        var item = XDocument.Parse(result.Xml).Descendants(Ns + "multilingual-text-item").Single();
        Assert.AreEqual("de-DE", (string?)item.Attribute("lang"));
        Assert.AreEqual("Hallo", (string?)item.Attribute("text"));
    }

    [TestMethod]
    public void RejectsIllegalInlineTextAndDoesNotLeakItIntoXml()
    {
        var result = converter.Convert(With(new HmiTextBox { Name = "Illegal\u0001", Text = HmiMultilingualText.FromText("\ud800", 1031) }), "Panel");
        XDocument.Parse(result.Xml);
        Assert.IsTrue(result.Diagnostics.Any(d => d.Path.EndsWith(".Name")));
        Assert.IsTrue(result.Diagnostics.Any(d => d.Message.Contains("surrogate") || d.Message.Contains("character")));
    }

    [TestMethod]
    public void RetainsExplicitEmptyTextInsteadOfCatalogBlankLanguageDefaults()
    {
        var result = converter.Convert(With(new HmiButton { ToolTipText = new HmiMultilingualText() }), "Panel");
        Assert.IsNotNull(XDocument.Parse(result.Xml).Descendants(Ns + "tool-tip-text").SingleOrDefault());
    }

    [TestMethod]
    public void RejectsUnsupportedScreenKindsAndMissingNames()
    {
        Assert.ThrowsExactly<ArgumentException>(() => converter.Convert(new HmiScreen(), "Panel"));
        Assert.ThrowsExactly<ArgumentException>(() => converter.Convert(new HmiScreen { Name = "Main" }, ""));
        Assert.IsTrue(converter.Convert(new HmiScreen { Name = "Popup", Kind = HmiScreenKind.Popup }, "Panel").Diagnostics.Any(d => d.Path == "screen.kind"));
    }

    [TestMethod]
    public void UsesInvariantNumbersAndHasNoStateBetweenExports()
    {
        var previous = CultureInfo.CurrentCulture;
        try
        {
            CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("de-DE");
            var screen = With(new HmiGraphicView { Source = "Logo", Opacity = 0.5 });
            var first = converter.Convert(screen, "Panel");
            Assert.AreEqual(first.Xml, converter.Convert(screen, "Panel").Xml);
            Assert.AreEqual("0.5", (string?)XDocument.Parse(first.Xml).Descendants(Ns + "graphic-view").Single().Attribute("opacity"));
        }
        finally { CultureInfo.CurrentCulture = previous; }
    }

    private static HmiScreen With(HmiScreenItemBase item)
    {
        var screen = new HmiScreen { Name = "Main", Width = 800, Height = 480 };
        var layer = new HmiLayer(); layer.Items.Add(item); screen.Layers.Add(layer); return screen;
    }
    [TestMethod]
    public void SelectedStyleAndNativeFontAreIndependentOfPreviewFallbacks()
    {
        var button = new HmiButton {
            BorderWidth = new HmiDefaultProperty<double> { StaticValue = 99, ProfileName = "Selected", PropertyName = "BorderWidth", StyleValues = new() { ["Selected"] = 3, ["Other"] = 8 } },
            Font = new HmiFont { Name = "Siemens Sans" }
        };
        var screen = new HmiScreen { Name = "Main" }; var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        var result = converter.Convert(screen, "Panel");
        var element = XDocument.Parse(result.Xml).Descendants(Ns + "button").Single();
        Assert.AreEqual("3", (string?)element.Attribute("border-width")); Assert.AreEqual("SiemensSans", (string?)element.Attribute("font-family"));
        ((HmiDefaultProperty<double>)button.BorderWidth).ProfileName = "Missing";
        button.Font.Name = "Calibri";
        result = converter.Convert(screen, "Panel"); element = XDocument.Parse(result.Xml).Descendants(Ns + "button").Single();
        Assert.IsNull(element.Attribute("border-width")); Assert.AreEqual("Arial", ((HmiButton)new HmiUnifiedXmlToScreenConverter().Convert(result.Xml).Screen.Layers[0].Items[0]).Font!.Name!.StaticValue);
        Assert.AreEqual("Calibri", button.Font.Name.StaticValue);
        Assert.IsTrue(result.Diagnostics.Any(d => d.Message.Contains("no resolved engineering value")));
        Assert.IsTrue(result.Diagnostics.Any(d => d.Message.Contains("native family")));
    }

}
