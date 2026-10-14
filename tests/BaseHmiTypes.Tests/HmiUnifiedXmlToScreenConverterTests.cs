using System.Text;
using System.Xml;
using System.Xml.Linq;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.UnifiedXml;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using BaseHmiTypes.Scripts;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiUnifiedXmlToScreenConverterTests
{
    private readonly HmiUnifiedXmlToScreenConverter reader = new();
    private static string Archive(string items = "", string screenAttributes = "", string complete = "false") =>
        "<unified-export xmlns=\"" + HmiScreenToUnifiedXmlConverter.Namespace + "\" xmlns:u=\"" + HmiScreenToUnifiedXmlConverter.ContractNamespace +
        "\" version=\"2\" catalog=\"" + HmiScreenToUnifiedXmlConverter.CatalogId + "\" scope=\"screen\" screen=\"Main\" apiVersion=\"21.0.0.0\" complete=\"" + complete + "\">" +
        "<screen name=\"Main\" width=\"800\" height=\"480\" " + screenAttributes + ">" + items + "</screen></unified-export>";

    [TestMethod]
    public void LoadsCapturedV21ScreenWithUnmarkedControlsAndCatalogDefaults()
    {
        using var stream = typeof(HmiUnifiedXmlToScreenConverterTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.unified-v21-screen.xml")!;
        using var text = new StreamReader(stream);
        var result = reader.Convert(text.ReadToEnd());
        Assert.AreEqual("501 StartScreen", result.Screen.Name);
        Assert.AreEqual(800d, result.Screen.Width.StaticValue);
        Assert.AreEqual(480d, result.Screen.Height.StaticValue);
        Assert.IsFalse(result.SourceComplete);
        Assert.AreEqual(2, result.Screen.Events.Count);
        Assert.IsTrue(result.Screen.Layers[0].Items.OfType<HmiButton>().Any());
        Assert.IsTrue(result.Screen.Layers[0].Items.OfType<HmiTextBox>().Any());
        Assert.AreEqual("Unified_Logo", result.Screen.Layers[0].Items.OfType<HmiGraphicView>().Single().Source!.StaticValue);
        var dynamicText = result.Screen.Layers[0].Items.OfType<HmiTextBox>().Single(i => i.Name == "Logout_1");
        var script = (HmiScriptProperty<HmiMultilingualText>)dynamicText.Text!;
        StringAssert.Contains(script.Script!, "PlantReferenceNumber");
        Assert.AreEqual("PlantReferenceNumber", ((HmiTagTrigger)script.Triggers.Single()).TagNames.Single());
        Assert.IsNotNull(script.StaticValue);
    }

    [TestMethod]
    public void RestoresSupportedWriterDataAndSharedIdentities()
    {
        var text = HmiMultilingualText.FromText("<body>A & B\r\n\tC</body>", 1031);
        var button = new HmiButton { Name = "Run", Width = 65, X = -12, Text = text, Enabled = false,
            BackgroundColor = new HmiColor(127, 1, 22, 254), Font = new HmiFont { Name = "Arial", Size = 14, Italic = true },
            Padding = new HmiThickness { Left = 3 } };
        var screen = new HmiScreen { Name = "Main", Width = 800, Height = 480, Number = 501 };
        var layer = new HmiLayer(); layer.Items.Add(button); layer.Items.Add(new HmiGraphicView { Name = "Logo", Source = "CompanyLogo" }); layer.Items.Add(button); screen.Layers.Add(layer);
        var xml = new HmiScreenToUnifiedXmlConverter().Convert(screen, "Panel").Xml;
        var result = reader.Convert(xml);
        Assert.IsFalse(result.SourceComplete);
        Assert.AreEqual(501, result.Screen.Number);
        var items = result.Screen.Layers.Single().Items;
        Assert.AreEqual(3, items.Count); Assert.AreSame(items[0], items[2]);
        var restored = (HmiButton)items[0];
        Assert.AreEqual(-12d, restored.X.StaticValue); Assert.IsFalse(restored.Enabled.StaticValue);
        Assert.AreEqual((byte)127, restored.BackgroundColor!.StaticValue.Alpha);
        Assert.AreEqual("Arial", restored.Font!.Name!.StaticValue); Assert.AreEqual(14d, restored.Font.Size!.StaticValue);
        Assert.AreEqual(3d, restored.Padding!.Left.StaticValue);
        Assert.AreEqual(text.Texts[1031], restored.Text!.StaticValue!.Texts[1031]);
        Assert.AreEqual("CompanyLogo", ((HmiGraphicView)items[1]).Source!.StaticValue);
        Assert.AreEqual(xml, Encoding.UTF8.GetString(result.Screen.SourceData!));
    }

    [TestMethod]
    public void ExpandsCatalogDefaultsAndBlankTextTemplates()
    {
        var result = reader.Convert(Archive("<button name=\"Run\" left=\"1\" font-family=\"Arial\"/><text-box name=\"Caption\" top=\"0\" font-family=\"Arial\"/>", complete: "true"));
        Assert.IsTrue(result.SourceComplete);
        var button = (HmiButton)result.Screen.Layers[0].Items[0];
        Assert.AreEqual(65d, button.Width.StaticValue); Assert.AreEqual(66d, button.Height.StaticValue);
        Assert.IsTrue(button.Enabled.StaticValue); Assert.IsTrue(button.Visible.StaticValue);
        Assert.AreEqual(22d, button.Font!.Size!.StaticValue); Assert.IsFalse(button.Font.Bold!.StaticValue);
        Assert.AreEqual(2, button.ToolTipText!.StaticValue!.Texts.Count);
        var box = (HmiTextBox)result.Screen.Layers[0].Items[1];
        Assert.AreEqual(500d, box.Width.StaticValue); Assert.IsFalse(box.Enabled.StaticValue);
        Assert.AreEqual((byte)255, box.BackgroundColor!.StaticValue.Red); Assert.AreEqual((byte)0, box.BackgroundColor.StaticValue.Green);
    }

    [TestMethod]
    public void HandlesForwardReferencesAndWrappedCollectionsInOrder()
    {
        var result = reader.Convert(Archive("<screen-items><u:ref ref=\"b\"/><button u:id=\"b\" name=\"Run\" left=\"0\"/></screen-items>"));
        Assert.AreSame(result.Screen.Layers[0].Items[0], result.Screen.Layers[0].Items[1]);
    }

    [TestMethod]
    public void ExplicitEmptyTextOverridesCatalogTemplate()
    {
        var result = reader.Convert(Archive("<button name=\"Run\" left=\"0\"><tool-tip-text/></button>"));
        Assert.AreEqual(0, result.Screen.Layers[0].Items[0].ToolTipText!.StaticValue!.Texts.Count);
    }

    [TestMethod]
    public void ReadsEventScriptAsInertJavaScriptAndPreservesLineEndings()
    {
        var result = reader.Convert(Archive("<event-handlers><screen-event-handler event-type=\"Loaded\"><script u:type=\"t5\"><script-code xml:space=\"preserve\">a();&#xD;\n\tb();</script-code></script></screen-event-handler></event-handlers>"));
        var action = (HmiTextScriptAction)result.Screen.Events.Single().Action!;
        Assert.AreEqual("a();\r\n\tb();", action.SourceCode); Assert.AreEqual(HmiScriptLanguage.JavaScript, action.Language);
    }

    [TestMethod]
    public void ReadsExplicitPartsAndLosslessUtf16ScriptPayloads()
    {
        var xml = Archive("<button name=\"Run\" left=\"0\"><font name=\"Arial\" size=\"14\"/><padding left=\"5\"/><event-handlers><button-event-handler event-type=\"Down\"><script u:type=\"t16\"><script-code><u:Value kind=\"scalar\" type=\"System.String\" encoding=\"utf16le-base64\">AQAA2A==</u:Value></script-code></script></button-event-handler></event-handlers></button>");
        var button = (HmiButton)reader.Convert(xml).Screen.Layers[0].Items[0];
        Assert.AreEqual("Arial", button.Font!.Name!.StaticValue);
        Assert.AreEqual(5d, button.Padding!.Left.StaticValue);
        Assert.AreEqual("\u0001\ud800", ((HmiTextScriptAction)button.Events.Single().Action!).SourceCode);
    }

    [TestMethod]
    public void ResolvesContractNamespaceByUriAndRejectsDuplicateDynamizations()
    {
        var xml = Archive("<button u:id=\"b\" name=\"Run\" left=\"0\"/><u:ref ref=\"b\"/>").Replace("xmlns:u=", "xmlns:c=").Replace("u:id=", "c:id=").Replace("<u:ref", "<c:ref");
        var items = reader.Convert(xml).Screen.Layers[0].Items;
        Assert.AreSame(items[0], items[1]);
        const string script = "<script-dynamization property-name=\"Visible\"><script-code>return true;</script-code></script-dynamization>";
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<button><dynamizations>" + script + script + "</dynamizations></button>")));
    }

    [TestMethod]
    public void ReportsUnknownDataAndRetainsOriginalXml()
    {
        var xml = Archive("<rectangle name=\"Unknown\"/><button name=\"Run\" left=\"0\" custom=\"keep\"><dynamizations/></button>");
        var result = reader.Convert(xml);
        Assert.IsTrue(result.Diagnostics.Any(d => d.Path.EndsWith("rectangle")));
        Assert.IsTrue(result.Diagnostics.Any(d => d.Path.EndsWith("@custom")));
        Assert.AreEqual(xml, Encoding.UTF8.GetString(result.Screen.SourceData!));
    }

    [TestMethod]
    public void RejectsWrongProfileMalformedXmlAndDtd()
    {
        Assert.ThrowsExactly<NotSupportedException>(() => reader.Convert(Archive().Replace("scope=\"screen\"", "scope=\"device\"")));
        Assert.ThrowsExactly<NotSupportedException>(() => reader.Convert(Archive().Replace(HmiScreenToUnifiedXmlConverter.CatalogId, new string('0', 64))));
        Assert.ThrowsExactly<XmlException>(() => reader.Convert("<bad>"));
        Assert.ThrowsExactly<XmlException>(() => reader.Convert("<!DOCTYPE x [<!ENTITY test 'x'>]>" + Archive()));
    }

    [TestMethod]
    public void RejectsDuplicateIdsDanglingReferencesAndIncompatibleSelectors()
    {
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<u:ref ref=\"missing\"/>")));
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<button u:id=\"b\"/><button u:id=\"b\"/>")));
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<button u:type=\"t14\"/>")));
    }

    [TestMethod]
    public void RejectsInvalidTypedValuesAndDuplicateLanguages()
    {
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<button width=\"1.5\"/>")));
        Assert.ThrowsExactly<OverflowException>(() => reader.Convert(Archive("<button width=\"4294967296\"/>")));
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<button enabled=\"true\"/>")));
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<button back-color=\"red\"/>")));
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive("<button><text><multilingual-text-item lang=\"de-DE\" text=\"A\"/><multilingual-text-item lang=\"de-DE\" text=\"B\"/></text></button>")));
    }
}
