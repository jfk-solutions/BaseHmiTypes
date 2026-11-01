using BaseHmiTypes.Converters.UnifiedXml;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using BaseHmiTypes.Common;
using BaseHmiTypes.Scripts;
using System.Xml.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class HmiUnifiedXmlBindingsTests
{
    [TestMethod]
    public void IoControlsAndEngineeringBindingsRemainEditableWithoutSourceXml()
    {
        using var catalogStream=HmiUnifiedXmlCatalog.Open();
        var catalog=new StreamReader(catalogStream).ReadToEnd();
        using var fixture=typeof(HmiUnifiedXmlBindingsTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.unified-v19-bindings.xml")!;
        var reader=new HmiUnifiedXmlToScreenConverter();var screen=reader.Convert(new StreamReader(fixture).ReadToEnd()).Screen;
        var field=Assert.IsInstanceOfType<HmiIOField>(screen.Layers[0].Items[0]);
        var symbolic=Assert.IsInstanceOfType<HmiSymbolicIOField>(screen.Layers[0].Items[1]);
        Assert.AreEqual("10.25",field.ProcessValue!.StaticValue);Assert.AreEqual("InputOutput",field.IOFieldType!.StaticValue);
        Assert.IsTrue(field.InputBehavior!.AcceptOnDeactivated!.StaticValue);Assert.IsFalse(field.InputBehavior.ClearOnActivate!.StaticValue);Assert.IsTrue(field.InputBehavior.HiddenInput!.StaticValue);
        Assert.AreEqual("@Default.Messages",symbolic.ResourceList!.StaticValue);Assert.AreEqual(2,symbolic.SelectedIndex!.StaticValue);
        var binding=((HmiDynamicProperty<bool>)field.Visible).UnifiedTagDynamization!;
        var color=((HmiDynamicProperty<HmiColor>)field.BackgroundColor!).UnifiedTagDynamization!.ValueConverter!.MappingTable!.Entries[0];
        Assert.AreEqual(HmiColor.FromArgb(127,17,34,51),color.Value);Assert.AreEqual(HmiColor.FromArgb(1,170,187,204),color.AlternateValue);Assert.AreEqual(-5,color.From);Assert.AreEqual(3,color.To);
        Assert.AreEqual(true,binding.UseIndirectAddressing);var entry=binding.ValueConverter!.MappingTable!.Entries[0];
        Assert.AreEqual(ulong.MaxValue,entry.Relevant);Assert.AreEqual(9223372036854775809UL,entry.Condition);Assert.AreEqual(false,entry.Value);Assert.AreEqual(true,entry.Flashing);
        var caption=Assert.IsInstanceOfType<HmiButton>(screen.Layers[0].Items[2]);
        var resource=((HmiDynamicProperty<HmiMultilingualText>)caption.Text!).UnifiedTagDynamization!;
        Assert.AreEqual("@Default.Messages",resource.ResourceList);
        screen.SourceData=null;foreach(var item in screen.Layers[0].Items){item.SourceData=null;item.SourceProperties.Clear();}
        field.ProcessValue="42.75";entry.Value=true;resource.ResourceList="@Default.Edited";
        var result=new HmiScreenToUnifiedXmlConverter(catalog).Convert(screen,"Panel");
        StringAssert.Contains(result.Xml,"apiVersion=\"19.0.0.0\"");StringAssert.Contains(result.Xml,"condition=\"9223372036854775809\"");
        XNamespace n=HmiScreenToUnifiedXmlConverter.Namespace; XNamespace u=HmiScreenToUnifiedXmlConverter.ContractNamespace;
        var xml=XElement.Parse(result.Xml);
        Assert.IsNull(xml.Element(n+"screen")!.Attribute(u+"type"));
        Assert.IsNull(xml.Descendants(n+"iofield").Single().Attribute(u+"type"));
        Assert.AreEqual("MappingTableEntryBitmask.Boolean",(string?)xml.Descendants(n+"mapping-table-entry-bitmask").Single().Attribute(u+"type"));
        Assert.AreEqual("MappingTableEntryRange.Color",(string?)xml.Descendants(n+"mapping-table-entry-range").Single().Attribute(u+"type"));
        var ambiguous=new XElement(xml); ambiguous.Descendants(n+"mapping-table-entry-range").Single().Attribute(u+"type")!.Remove();
        Assert.ThrowsExactly<FormatException>(()=>reader.Convert(ambiguous.ToString()));
        var restoredItems=reader.Convert(result.Xml).Screen.Layers[0].Items;
        var restored=Assert.IsInstanceOfType<HmiIOField>(restoredItems[0]);
        Assert.AreEqual("42.75",restored.ProcessValue!.StaticValue);
        Assert.AreEqual(true,((HmiDynamicProperty<bool>)restored.Visible).UnifiedTagDynamization!.ValueConverter!.MappingTable!.Entries[0].Value);
        Assert.AreEqual("@Default.Edited",((HmiDynamicProperty<HmiMultilingualText>)((HmiButton)restoredItems[2]).Text!).UnifiedTagDynamization!.ResourceList);
        Assert.AreEqual(color.AlternateValue,((HmiDynamicProperty<HmiColor>)restored.BackgroundColor!).UnifiedTagDynamization!.ValueConverter!.MappingTable!.Entries[0].AlternateValue);
        Assert.IsTrue(restored.InputBehavior!.HiddenInput!.StaticValue);
        Assert.AreEqual("Mask",((HmiDynamicProperty<bool>)restored.InputBehavior.HiddenInput).UnifiedTagDynamization!.TagName);
        Assert.IsFalse(result.Diagnostics.Any(d=>d.Message.Contains("Ambiguous")||d.Message.Contains("No selected catalog")));
    }
    [TestMethod]
    public void AuthoringControlsAreWrittenFromEditableModels()
    {
        using var stream=HmiUnifiedXmlCatalog.Open();
        var schema=new StreamReader(stream).ReadToEnd();
        using var fixture=typeof(HmiUnifiedXmlBindingsTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.unified-authoring-panel.xml")!;
        var reader=new HmiUnifiedXmlToScreenConverter();var screens=reader.ConvertScreens(new StreamReader(fixture).ReadToEnd());var count=0;
        foreach(var source in screens)
        {
            var screen=source.Screen;screen.SourceData=null;
            foreach(var item in screen.Layers.SelectMany(l=>l.Items))item.SourceData=null;
            var selected=screen.Layers.SelectMany(l=>l.Items).Where(i=>i is BaseHmiTypes.Screens.Shapes.HmiRectangle or HmiFaceplateContainer or BaseHmiTypes.Screens.HmiScreenWindow).ToArray();
            if(selected.Length==0)continue;selected[0].X=37;
            var result=new HmiScreenToUnifiedXmlConverter(schema).Convert(screen,"Panel");var restored=reader.Convert(result.Xml).Screen.Layers.SelectMany(l=>l.Items).ToArray();
            foreach(var item in selected){var match=restored.Single(i=>i.Name==item.Name);Assert.AreEqual(item.GetType(),match.GetType());Assert.AreEqual(item.X.StaticValue,match.X.StaticValue);}
            Assert.IsFalse(result.Diagnostics.Any(d=>d.Message.StartsWith("No selected catalog contract")));count+=selected.Length;
        }
        Assert.IsTrue(count>=3);
    }


    [TestMethod]
    public void PropertyEventsRemainEditableAndCompactWithoutSourceXml()
    {
        XNamespace u=HmiScreenToUnifiedXmlConverter.ContractNamespace;
        var catalog=XElement.Parse(HmiUnifiedXmlCatalog.Read());
        catalog.SetAttributeValue("id",new string('a',64)); // Isolated test contract; released catalogs stay immutable.
        var schema=catalog.ToString(); var screen=new HmiScreen { Name="Main" };
        screen.Events.Add(new HmiEventBinding { EventName="QualityCodeChange", PropertyName="BackColor", Action=new HmiTextScriptAction { Language=HmiScriptLanguage.JavaScript, SourceCode="Tags('Alarm').Write(true);", Async=true, GlobalDefinitionAreaScriptCode="" } });
        var legacy=new HmiScreenToUnifiedXmlConverter().Convert(screen,"Panel");
        Assert.AreEqual("BackColor",new HmiUnifiedXmlToScreenConverter().Convert(legacy.Xml).Screen.Events.Single().PropertyName);
        var writer=new HmiScreenToUnifiedXmlConverter(schema);var xml=writer.Convert(screen,"Panel").Xml;
        var reader=new HmiUnifiedXmlToScreenConverter(schema);var restored=reader.Convert(xml).Screen;
        Assert.AreEqual("BackColor",restored.Events.Single().PropertyName);Assert.AreEqual("QualityCodeChange",restored.Events.Single().EventName);
        restored.SourceData=null;restored.SourceProperties.Clear();restored.Events.Single().PropertyName="Visible";
        xml=writer.Convert(restored,"Panel").Xml;
        Assert.AreEqual("Visible",reader.Convert(xml).Screen.Events.Single().PropertyName);
        StringAssert.Contains(xml,"property-name=\"Visible\"");Assert.IsFalse(xml.Contains("u:id="));Assert.IsFalse(xml.Contains("u:type="));
    }

    [TestMethod]
    public void AdditionalControlScalarSettingsRemainEditable()
    {
        var schema=HmiUnifiedXmlCatalog.Read();
        var screen=new HmiScreen{Name="Main"};var layer=new HmiLayer();screen.Layers.Add(layer);
        layer.Items.Add(new HmiClock{Name="Clock",ShowHours=true,ShowMinutes=false,ShowSeconds=true});
        layer.Items.Add(new HmiWebControl{Name="Web",HomeUrl="https://example.invalid/",Url=""});
        layer.Items.Add(new HmiMediaControl{Name="Media",AutoPlay=false,Source="media.mp4"});layer.Items.Add(new HmiBar{Name="Level",OriginValue=-12.5});
        var writer=new HmiScreenToUnifiedXmlConverter(schema);var reader=new HmiUnifiedXmlToScreenConverter(schema);
        var restored=reader.Convert(writer.Convert(screen,"Panel").Xml).Screen.Layers.Single().Items;
        Assert.IsFalse(Assert.IsInstanceOfType<HmiClock>(restored[0]).ShowMinutes!.StaticValue);
        Assert.AreEqual("",Assert.IsInstanceOfType<HmiWebControl>(restored[1]).Url!.StaticValue);
        Assert.IsFalse(Assert.IsInstanceOfType<HmiMediaControl>(restored[2]).AutoPlay!.StaticValue);
        Assert.AreEqual("media.mp4",Assert.IsInstanceOfType<HmiMediaControl>(restored[2]).Source!.StaticValue);
        Assert.AreEqual(-12.5,Assert.IsInstanceOfType<HmiBar>(restored[3]).OriginValue!.StaticValue);
        Assert.IsInstanceOfType<HmiClock>(restored[0]).ShowMinutes=true;
        var edited=reader.Convert(writer.Convert(screen,"Panel").Xml).Screen; Assert.IsInstanceOfType<HmiClock>(edited.Layers[0].Items[0]).ShowMinutes=true;
        Assert.IsTrue(Assert.IsInstanceOfType<HmiClock>(reader.Convert(writer.Convert(edited,"Panel").Xml).Screen.Layers[0].Items[0]).ShowMinutes!.StaticValue);
    }

    [TestMethod]
    public void ScalarLeafPartsUseOwnerAttributesWithoutChangingTheModel()
    {
        using var stream=typeof(HmiUnifiedXmlBindingsTests).Assembly.GetManifestResourceStream("BaseHmiTypes.Tests.Fixtures.unified-v21-screen.xml")!;
        var reader=new HmiUnifiedXmlToScreenConverter();var screen=reader.Convert(new StreamReader(stream).ReadToEnd()).Screen;
        var button=screen.Layers.SelectMany(l=>l.Items).OfType<HmiButton>().First();button.Font!.Name="Arial";button.Font.Size=17;button.Padding!.Left=4;
        var output=new HmiScreenToUnifiedXmlConverter(HmiUnifiedXmlCatalog.Read()).Convert(screen,"Panel");
        XNamespace n=HmiScreenToUnifiedXmlConverter.Namespace;var node=XElement.Parse(output.Xml).Descendants(n+"button").Single(e=>(string?)e.Attribute("name")==button.Name);
        Assert.AreEqual("17",(string?)node.Attribute("font-size"));Assert.AreEqual("4",(string?)node.Attribute("padding-left"));Assert.IsNull(node.Element(n+"font"));Assert.IsNull(node.Element(n+"padding"));
        var restored=reader.Convert(output.Xml).Screen.Layers.SelectMany(l=>l.Items).OfType<HmiButton>().Single(i=>i.Name==button.Name);
        Assert.AreEqual(17d,restored.Font!.Size!.StaticValue);Assert.AreEqual(4d,restored.Padding!.Left!.StaticValue);
    }
    [TestMethod]
    public void OwnedEngineeringSettingsRemainEditableWithoutPreviewFieldsOrSourceSnapshots()
    {
        var reader = new HmiUnifiedXmlToScreenConverter();
        var screen = reader.Convert("""
            <unified-export xmlns="urn:s7mcp:wincc-unified:2" version="2"><screen name="Main"><alarm-control name="Alarms"><alarm-view row-height="37" allow-sort="False"><columns><alarm-line-column-part name="State" visible="False" width="123"><content spacing="7"/></alarm-line-column-part></columns></alarm-view></alarm-control></screen></unified-export>
            """).Screen;
        var control = screen.Layers[0].Items[0];
        var view = (HmiUnifiedEngineeringObject)control.UnifiedEngineering!["AlarmView"]!;
        Assert.AreEqual((byte)37, view["RowHeight"]); Assert.AreEqual(false, view["AllowSort"]);
        var column = ((System.Collections.IEnumerable)view["Columns"]!).Cast<HmiUnifiedEngineeringObject>().First();
        var content = (HmiUnifiedEngineeringObject)column["Content"]!;
        screen.SourceData = null; screen.SourceProperties.Clear(); control.SourceData = null; control.SourceProperties.Clear();
        view["RowHeight"] = (byte)42; column["Width"] = 180u; content["Spacing"] = 11u;
        var xml = new HmiScreenToUnifiedXmlConverter().Convert(screen, "Panel").Xml;
        var restored = (HmiUnifiedEngineeringObject)reader.Convert(xml).Screen.Layers[0].Items[0].UnifiedEngineering!["AlarmView"]!;
        var restoredColumn = ((System.Collections.IEnumerable)restored["Columns"]!).Cast<HmiUnifiedEngineeringObject>().First();
        Assert.AreEqual((byte)42, restored["RowHeight"]); Assert.AreEqual(180u, restoredColumn["Width"]); Assert.AreEqual(false, restoredColumn["Visible"]);
        Assert.AreEqual(11u, ((HmiUnifiedEngineeringObject)restoredColumn["Content"]!)["Spacing"]);
    }
    [TestMethod]
    public void OmissionDiagnosticsAndNullReferencesSurviveModelExport()
    {
        var reader = new HmiUnifiedXmlToScreenConverter();
        var screen = reader.Convert("""
            <unified-export xmlns="urn:s7mcp:wincc-unified:2" xmlns:u="urn:s7mcp:wincc-unified:2:contract" version="2"><u:Warnings><u:Warning>Unavailable getter was omitted.</u:Warning></u:Warnings><screen name="Main"><faceplate-container name="Empty"><contained-type><u:Value kind="null"/></contained-type></faceplate-container></screen></unified-export>
            """).Screen;
        screen.SourceData = null; screen.SourceProperties.Clear();
        var result = new HmiScreenToUnifiedXmlConverter().Convert(screen, "Panel");
        Assert.IsTrue(result.Diagnostics.Any(d => d.Message == "Unavailable getter was omitted."));
        var restored = reader.ConvertScreens(result.Xml).Single().Screen;
        CollectionAssert.AreEqual(new[] { "Unavailable getter was omitted." }, restored.UnifiedExportWarnings);
        Assert.AreEqual("null", ((HmiUnifiedEngineeringValue)restored.Layers[0].Items[0].UnifiedEngineering!["ContainedType"]!).Kind);
    }
}
