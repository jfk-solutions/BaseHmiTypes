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
        StringAssert.Contains(xml,"property-name=\"Visible\"");Assert.IsFalse(xml.Contains("u:id="));
    }

    [TestMethod]
    public void AdditionalControlScalarSettingsRemainEditable()
    {
        XNamespace u=HmiScreenToUnifiedXmlConverter.ContractNamespace;
        var catalog=XElement.Parse(HmiUnifiedXmlCatalog.Read());
        void Type(string name,string tag,params (string Name,string Type)[] properties)
        {
            catalog.Element(u+"types")!.Add(new XElement(u+"type",new XAttribute("id",tag),new XAttribute("tag",tag),new XAttribute("name",name),
                properties.Prepend(("Name","System.String")).Select(p=>new XElement(u+"property",new XAttribute("name",p.Item1),new XAttribute("xml",System.Text.RegularExpressions.Regex.Replace(p.Item1,"([a-z])([A-Z])","$1-$2").ToLowerInvariant()),new XAttribute("inline","true"),new XElement(u+"value",new XAttribute("kind","scalar"),new XAttribute("type",p.Item2))))));
        }
        Type("Siemens.Engineering.HmiUnified.UI.Widgets.HmiClock","clock",("ShowHours","System.Boolean"),("ShowMinutes","System.Boolean"),("ShowSeconds","System.Boolean"));
        Type("Siemens.Engineering.HmiUnified.UI.Controls.HmiWebControl","web-control",("HomeUrl","System.String"),("Url","System.String"));
        Type("Siemens.Engineering.HmiUnified.UI.Controls.HmiMediaControl","media-control",("AutoPlay","System.Boolean"),("Url","System.String"));
        Type("Siemens.Engineering.HmiUnified.UI.Widgets.HmiBar","bar",("OriginValue","System.Double"));
        catalog.SetAttributeValue("id",new string('b',64));var schema=catalog.ToString();
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
}
