using System.Text;
using System.Xml;
using System.Text.RegularExpressions;
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
    [TestMethod]
    public void ProducerVersionDoesNotSelectAnotherFormat()
    {
        var catalog = HmiUnifiedXmlCatalog.Id;
        var xml = Archive("<button name=\"Run\"/>").Replace(HmiScreenToUnifiedXmlConverter.CatalogId, catalog)
            .Replace("apiVersion=\"21.0.0.0\"", "apiVersion=\"19.0.0.0\"");
        var result = new HmiUnifiedXmlToScreenConverter().Convert(xml);
        Assert.AreEqual("Main", result.Screen.Name);
        Assert.IsInstanceOfType<HmiButton>(result.Screen.Layers[0].Items[0]);
        Assert.AreEqual("Run", result.Screen.Layers[0].Items[0].Name);
    }
    [TestMethod]
    public void DisplayNamesAndFontWeightsAreEditableModelValues()
    {
        foreach (var (weight, numeric) in new[] { ("Light", 300), ("SemiBold", 600), ("None", 0) })
        {
            var converter = new HmiUnifiedXmlToScreenConverter();
            var screen = converter.Convert(Archive($"<display-name><multilingual-text-item lang=\"de-DE\" text=\"Start\"/></display-name><button name=\"Run\" font-family=\"TimesNewRoman\" font-weight=\"{weight}\"/>")).Screen;
            var button = (HmiButton)screen.Layers[0].Items[0];
            Assert.AreEqual("Start", screen.DisplayName!.Texts[1031]);
            Assert.AreEqual(numeric, button.Font!.Weight!.StaticValue);
            screen.DisplayName.Texts[1031] = "Changed";
            button.Font.Name = "SimSun"; button.Font.Weight = 600;
            var xml = new HmiScreenToUnifiedXmlConverter().Convert(screen, "Panel").Xml;
            var restored = converter.Convert(xml).Screen;
            Assert.AreEqual("Changed", restored.DisplayName!.Texts[1031]);
            var restoredButton = (HmiButton)restored.Layers[0].Items[0];
            Assert.AreEqual("SimSun", restoredButton.Font!.Name!.StaticValue);
            Assert.AreEqual(600, restoredButton.Font.Weight!.StaticValue);
        }
    }
    [TestMethod]
    public void PrettyPrintingUsesTheBundledSchemaAndPreservesPayloadWhitespace()
    {
        const string globals = " \t\r\n";
        const string caption = "\n caption \t\r\n";
        const string device = "Panel\t\nName";
        foreach (var code in new[] { "\n  const value = \"a > b < c\";\n\treturn value;\r\n", " \t\r\n", "" })
        {
            var screen = new HmiScreen { Name = "Main", DisplayName = HmiMultilingualText.FromText(caption, 1031) };
            screen.Events.Add(new HmiEventBinding { EventName = "Loaded", Action = new HmiTextScriptAction {
                Language = HmiScriptLanguage.JavaScript, SourceCode = code, GlobalDefinitionAreaScriptCode = globals } });
            var output = new HmiScreenToUnifiedXmlConverter().Convert(screen, device).Xml;
            var root = XElement.Parse(output);
            Assert.IsNull(root.Attribute("catalog")); Assert.IsNull(root.Attribute("device"));
            Assert.AreEqual("preserve", (string?)root.Descendants(XName.Get("script-code",HmiScreenToUnifiedXmlConverter.Namespace)).Single().Attribute(XNamespace.Xml+"space"));
            StringAssert.Matches(output, new Regex(@"\n[ \t]+<screen\b"));
            var restored = new HmiUnifiedXmlToScreenConverter().Convert(output).Screen;
            var action = (HmiTextScriptAction)restored.Events.Single().Action!;
            Assert.AreEqual(code.Replace("\r\n","\n").Replace("\r","\n").Replace("\n","\r\n"), action.SourceCode); Assert.AreEqual(globals, action.GlobalDefinitionAreaScriptCode);
            Assert.IsFalse(root.Descendants(XName.Get("script-code",HmiScreenToUnifiedXmlConverter.Namespace)).Single().ToString().Contains("&#xD;"));
            Assert.AreEqual(caption, restored.DisplayName!.Texts[1031]);
        }
    }

    private readonly HmiUnifiedXmlToScreenConverter reader = new();
    [TestMethod]
    public void EventEngineeringSettingsSurviveModelEditsAndExport()
    {
        var xml = Archive("<button name=\"Run\"><event-handlers><button-event-handler event-type=\"Down\"><script u:type=\"Script\" async=\"True\"><global-definition-area-script-code xml:space=\"preserve\">const n = 1;&#xD;\n</global-definition-area-script-code><script-code xml:space=\"preserve\">old();</script-code></script></button-event-handler></event-handlers></button>");
        var screen = reader.Convert(xml).Screen;
        var action = (HmiTextScriptAction)screen.Layers[0].Items[0].Events[0].Action!;
        Assert.AreEqual(true, action.Async); Assert.AreEqual("const n = 1;\r\n", action.GlobalDefinitionAreaScriptCode);
        action.SourceCode = "changed();\r\n";
        var output = new HmiScreenToUnifiedXmlConverter().Convert(screen, "Panel").Xml;
        StringAssert.Contains(output, "changed"); Assert.IsFalse(output.Contains("old();")); Assert.IsFalse(output.Contains("u:type="));
        var restored = (HmiTextScriptAction)reader.Convert(output).Screen.Layers[0].Items[0].Events[0].Action!;
        Assert.AreEqual(action.SourceCode, restored.SourceCode);
        Assert.AreEqual(action.GlobalDefinitionAreaScriptCode, restored.GlobalDefinitionAreaScriptCode);
        Assert.AreEqual(action.Async, restored.Async);
    }
    private static string Archive(string items = "", string screenAttributes = "") =>
        "<unified-export xmlns=\"" + HmiScreenToUnifiedXmlConverter.Namespace + "\" xmlns:u=\"" + HmiScreenToUnifiedXmlConverter.ContractNamespace +
        "\" version=\"2\" apiVersion=\"21.0.0.0\">" +
        "<screen name=\"Main\" width=\"800\" height=\"480\" " + screenAttributes + ">" + items + "</screen></unified-export>";

    [TestMethod]
    public async Task ReadsGradientContentGraphicsAndTextLayout()
    {
        var xml = Archive("<button name=\"Run\" graphic=\"Lamp\" alternate-graphic=\"LampOn\" content-mode=\"GraphicAndText\" content-graphic-stretch-mode=\"Fill\" content-horizontal-text-alignment=\"Right\"/><text-box name=\"Caption\" text-wrapping=\"NoWrap\" text-trimming=\"CharacterEllipsis\"/>",
            "back-color=\"#96AEC2\" alternate-back-color=\"#FFFFFF\" back-fill-pattern=\"GradientVertical\"");
        var result = reader.Convert(xml); var screen = result.Screen;
        Assert.AreEqual(HmiFillPattern.GradientVertical, screen.FillPattern!.StaticValue);
        Assert.AreEqual((byte)255, screen.AlternateBackgroundColor!.StaticValue!.Red);
        var button = (HmiButton)screen.Layers[0].Items[0]; var caption = (HmiText)screen.Layers[0].Items[1];
        Assert.AreEqual(HmiButtonType.GraphicAndText, button.Mode!.StaticValue);
        Assert.AreEqual(1, button.GraphicStretchMode!.StaticValue);
        Assert.AreEqual(HmiHorizontalAlignment.Right, button.HorizontalAlignment!.StaticValue);
        Assert.AreEqual("Lamp", button.Image!.StaticValue!.ImageName);
        Assert.AreEqual("LampOn", button.AlternateImage!.StaticValue!.ImageName);
        Assert.AreEqual(0, caption.TextWrapping!.StaticValue); Assert.AreEqual(1, caption.TextTrimming!.StaticValue);
        Assert.IsTrue(result.Diagnostics.Any(d => d.Message.Contains("image data is external")));
        var renderer = new BaseHmiTypes.Converters.Html.HmiScreenToHtmlConverter();
        StringAssert.Contains(await renderer.ConvertAsync(screen), "linear-gradient(to bottom");
        screen.UseFirstGradient = true; screen.FirstGradientColor = new HmiColor { Alpha = 255, Red = 255 };
        screen.GradientDirection = HmiGradientDirection.HorizontalFromLeft;
        StringAssert.Contains(await renderer.ConvertAsync(screen), "linear-gradient(to right");
    }

    [TestMethod]
    public void ReadsAllAuthoringScreensAcrossSupportedVersions()
    {
        using var stream = typeof(HmiUnifiedXmlToScreenConverterTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.unified-authoring-panel.xml")!;
        using var source = new StreamReader(stream); var xml = source.ReadToEnd();
        foreach (var version in new[] { 19, 20, 21 })
        {
            var document = xml.Replace("apiVersion=\"21.0.0.0\"", $"apiVersion=\"{version}.0.0.0\"");
            var results = reader.ConvertScreens(document);
            Assert.AreEqual(7, results.Count); Assert.AreEqual(800d, results[0].Screen.Width.StaticValue);
            Assert.AreEqual(480d, results[0].Screen.Height.StaticValue);
            Assert.IsTrue(results[0].Screen.Layers[0].Items.Any(item => item is HmiRectangle));
            Assert.IsTrue(results.SelectMany(result => result.Diagnostics).Any(d => d.Message.Contains("Faceplate library")));
            Assert.IsTrue(results.SelectMany(result => result.Diagnostics).Any(d => d.Message.Contains("Partial authoring object")));
            Assert.AreEqual(document, Encoding.UTF8.GetString(results[0].Screen.SourceData!));
        }
    }

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
        Assert.IsTrue(result.Screen.Layers[0].Items.OfType<HmiText>().Any());
        Assert.AreEqual("Unified_Logo", result.Screen.Layers[0].Items.OfType<HmiGraphicView>().Single().Source!.StaticValue);
        var dynamicText = result.Screen.Layers[0].Items.OfType<HmiText>().Single(i => i.Name == "Logout_1");
        var script = (HmiScriptProperty<HmiMultilingualText>)dynamicText.Text!;
        StringAssert.Contains(script.Script!, "PlantReferenceNumber");
        Assert.AreEqual("PlantReferenceNumber", ((HmiScriptTrigger)script.Triggers.Single()).TagNames.Single());
        Assert.IsNotNull(script.StaticValue);
    }

    [TestMethod]
    public void UnifiedTextBoxMapsToStaticTextAndCanBeExportedAgain()
    {
        var result = reader.Convert(Archive("<text-box name=\"TxtRBG1\" left=\"360\" top=\"142\" width=\"60\" height=\"32\"><text><multilingual-text-item lang=\"de-DE\" text=\"&lt;body&gt;&lt;p&gt;RBG1&lt;/p&gt;&lt;/body&gt;\"/></text></text-box>"));
        var text = (HmiText)result.Screen.Layers[0].Items[0];
        Assert.AreEqual("<body><p>RBG1</p></body>", text.Text!.StaticValue!.FormattedTexts[1031]);
        var xml = new HmiScreenToUnifiedXmlConverter().Convert(result.Screen, "Panel").Xml;
        StringAssert.Contains(xml, "<text-box");
        Assert.IsInstanceOfType<HmiText>(reader.Convert(xml).Screen.Layers[0].Items[0]);
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
        var result = reader.Convert(Archive("<button name=\"Run\" left=\"1\" font-family=\"Arial\"/><text-box name=\"Caption\" top=\"0\" font-family=\"Arial\"/>"));
        Assert.IsFalse(result.SourceComplete);
        var button = (HmiButton)result.Screen.Layers[0].Items[0];
        Assert.AreEqual(0d, button.Width.StaticValue); Assert.AreEqual(0d, button.Height.StaticValue);
        Assert.IsTrue(button.Enabled.StaticValue); Assert.IsTrue(button.Visible.StaticValue);
        Assert.AreEqual(0d, button.Font!.Size!.StaticValue); Assert.IsFalse(button.Font.Bold!.StaticValue);
        Assert.AreEqual(0, button.ToolTipText!.StaticValue!.Texts.Count);
        var box = (HmiText)result.Screen.Layers[0].Items[1];
        Assert.AreEqual(0d, box.Width.StaticValue); Assert.IsTrue(box.Enabled.StaticValue);
        Assert.AreEqual((byte)0, box.BackgroundColor!.StaticValue.Red); Assert.AreEqual((byte)0, box.BackgroundColor.StaticValue.Green);
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
        var result = reader.Convert(Archive("<event-handlers><screen-event-handler event-type=\"Loaded\"><script ><script-code xml:space=\"preserve\">a();&#xD;\n\tb();</script-code></script></screen-event-handler></event-handlers>"));
        var action = (HmiTextScriptAction)result.Screen.Events.Single().Action!;
        Assert.AreEqual("a();\r\n\tb();", action.SourceCode); Assert.AreEqual(HmiScriptLanguage.JavaScript, action.Language);
    }

    [TestMethod]
    public void ReadsExplicitPartsAndLosslessUtf16ScriptPayloads()
    {
        var xml = Archive("<button name=\"Run\" left=\"0\"><font name=\"Arial\" size=\"14\"/><padding left=\"5\"/><event-handlers><button-event-handler event-type=\"Down\"><script ><script-code><u:Value kind=\"scalar\" type=\"System.String\" encoding=\"utf16le-base64\">AQAA2A==</u:Value></script-code></script></button-event-handler></event-handlers></button>");
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
        var xml = Archive("<unknown-control name=\"Unknown\"/><button name=\"Run\" left=\"0\" custom=\"keep\"><dynamizations/></button>");
        var result = reader.Convert(xml);
        Assert.IsTrue(result.Diagnostics.Any(d => d.Path.EndsWith("unknown-control")));
        Assert.IsTrue(result.Diagnostics.Any(d => d.Path.EndsWith("@custom")));
        Assert.AreEqual(xml, Encoding.UTF8.GetString(result.Screen.SourceData!));
    }

    [TestMethod]
    public void RejectsWrongProfileMalformedXmlAndDtd()
    {
        Assert.ThrowsExactly<FormatException>(() => reader.Convert(Archive().Replace("<screen ", "<software ").Replace("</screen>", "</software>")));
        Assert.ThrowsExactly<NotSupportedException>(() => reader.Convert(Archive().Replace("version=\"2\"", "version=\"99\"")));
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

    [TestMethod]
    public void KnownWireContractsDoNotDependOnTheProducerApiVersionLabel()
    {
        var reader=new HmiUnifiedXmlToScreenConverter();
        foreach(var version in new[]{"17.0.0.0","18.0.0.0","20.0.0.0","22.0.0.0"})
        {
            var xml=Archive("<button name=\"Run\"/>").Replace("apiVersion=\"21.0.0.0\"","apiVersion=\""+version+"\"");
            Assert.AreEqual("Run",reader.Convert(xml).Screen.Layers[0].Items[0].Name);
        }
        Assert.ThrowsExactly<NotSupportedException>(()=>reader.Convert(Archive("").Replace("21.0.0.0","unknown")));
    }
}
