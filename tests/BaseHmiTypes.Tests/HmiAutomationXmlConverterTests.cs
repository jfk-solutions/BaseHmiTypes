using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.AutomationXml;
using BaseHmiTypes.Cycles;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Scripts;
using BaseHmiTypes.TextGraphicLists;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiAutomationXmlConverterTests
{
    [TestMethod]
    public void ToAutomationXml_WritesCycleFromBaseModel()
    {
        var cycle = new HmiCycle
        {
            Name = "FastCycle",
            CycleTime = 500,
            CycleUnit = "Milliseconds",
            TriggerAtStartUp = true,
            Comment = new HmiMultilingualText
            {
                Texts = { [1033] = "Fast cycle" }
            }
        };

        var xml = HmiAutomationXmlConverter.ToAutomationXml(cycle);

        StringAssert.Contains(xml, "<Hmi.Cycle.Cycle");
        StringAssert.Contains(xml, "<Name>FastCycle</Name>");
        StringAssert.Contains(xml, "<CycleTime>500</CycleTime>");
        StringAssert.Contains(xml, "<TriggerAtStartup>true</TriggerAtStartup>");
        StringAssert.Contains(xml, "<Culture>en-US</Culture>");
        StringAssert.Contains(xml, "<Text>Fast cycle</Text>");
    }

    [TestMethod]
    public void ToAutomationXml_WritesVbScriptFromBaseModel()
    {
        var script = new HmiScript
        {
            Name = "OnClick",
            Language = HmiScriptLanguage.VBScript,
            ScriptType = HmiScriptType.Sub,
            SourceCode = "Sub OnClick()\r\nEnd Sub"
        };

        var xml = HmiAutomationXmlConverter.ToAutomationXml(script);

        StringAssert.Contains(xml, "<Hmi.RuntimeScripting.VBScript");
        StringAssert.Contains(xml, "<Name>OnClick</Name>");
        StringAssert.Contains(xml, "<Type>Sub</Type>");
        StringAssert.Contains(xml, "Sub OnClick()");
    }

    [TestMethod]
    public void ToAutomationXml_WritesHmiTextListFromBaseModel()
    {
        var textList = new HmiTextList
        {
            Name = "States",
            RangeType = HmiListRangeType.Decimal
        };
        textList.Entries.Add(new HmiTextListEntry
        {
            Name = "Running",
            From = 1,
            To = 1,
            Text = new HmiMultilingualText
            {
                Texts = { [1033] = "Running" }
            }
        });

        var xml = HmiAutomationXmlConverter.ToAutomationXml(textList);

        StringAssert.Contains(xml, "<Hmi.TextGraphicList.TextList");
        StringAssert.Contains(xml, "<Name>States</Name>");
        StringAssert.Contains(xml, "<ListRange>Decimal</ListRange>");
        StringAssert.Contains(xml, "<Hmi.TextGraphicList.TextListEntry");
        StringAssert.Contains(xml, "<From>1</From>");
        StringAssert.Contains(xml, "<Text>Running</Text>");
    }

    [TestMethod]
    public void ToAutomationXml_WritesHmiScreenFromBaseModel()
    {
        var screen = new HmiScreen
        {
            Name = "Main",
            Width = 1024,
            Height = 768
        };

        var xml = HmiAutomationXmlConverter.ToAutomationXml(screen);

        StringAssert.Contains(xml, "<Hmi.Screen.Screen");
        StringAssert.Contains(xml, "<Name>Main</Name>");
        StringAssert.Contains(xml, "<Width>1024</Width>");
        StringAssert.Contains(xml, "<Height>768</Height>");
    }

    [TestMethod]
    public void ToAutomationXml_WritesHmiScreenTemplateFromScreenMaster()
    {
        var screen = new HmiScreenMaster { Name = "Template" };

        var xml = HmiAutomationXmlConverter.ToAutomationXml(screen);

        StringAssert.Contains(xml, "<Hmi.Screen.ScreenTemplate");
        StringAssert.Contains(xml, "<Name>Template</Name>");
    }
}
