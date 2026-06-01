using System.Globalization;
using System.Text;
using System.Xml;
using BaseHmiTypes.Common;
using BaseHmiTypes.Cycles;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Scripts;
using BaseHmiTypes.TextGraphicLists;

namespace BaseHmiTypes.Converters.AutomationXml;

public static class HmiAutomationXmlConverter
{
    public static string ToAutomationXml(params IHmiObject[] objects)
    {
        using var ms = new MemoryStream();
        using (var writer = XmlWriter.Create(ms, new XmlWriterSettings { Indent = true, Encoding = Encoding.UTF8 }))
        {
            var id = 0;
            writer.WriteStartElement("Document");
            writer.WriteStartElement("Engineering");
            writer.WriteAttributeString("version", "V21");
            writer.WriteEndElement();

            foreach (var obj in objects)
            {
                if (obj is HmiCycle cycle)
                    HmiCycleToAutomationXmlConverter.WriteAutomationXml(writer, cycle, ref id);
                else if (obj is HmiScript script)
                    HmiScriptToAutomationXmlConverter.WriteAutomationXml(writer, script, ref id);
                else if (obj is HmiTextList textList)
                    HmiTextListToAutomationXmlConverter.WriteAutomationXml(writer, textList, ref id);
                else if (obj is HmiScreenBase screen)
                    HmiScreenToAutomationXmlConverter.WriteAutomationXml(writer, screen, ref id);
            }

            writer.WriteEndElement();
        }

        ms.Position = 0;
        using var reader = new StreamReader(ms);
        return reader.ReadToEnd();
    }

    public static void WriteAutomationXml(HmiMultilingualText multiLanguageText, XmlWriter writer, ref int id, string compositionName)
    {
        writer.WriteStartElement("MultilingualText");
        writer.WriteAttributeString("ID", "0x" + (id++).ToString("X", CultureInfo.InvariantCulture));
        writer.WriteAttributeString("CompositionName", compositionName);
        writer.WriteStartElement("ObjectList");
        foreach (var text in multiLanguageText.Texts)
        {
            writer.WriteStartElement("MultilingualTextItem");
            writer.WriteAttributeString("ID", "0x" + (id++).ToString("X", CultureInfo.InvariantCulture));
            writer.WriteAttributeString("CompositionName", "Items");
            writer.WriteStartElement("AttributeList");
            writer.WriteStartElement("Culture");
            if (text.Key >= 0)
                writer.WriteString(new CultureInfo(text.Key).Name);
            writer.WriteEndElement();
            writer.WriteStartElement("Text");
            writer.WriteString(text.Value);
            writer.WriteEndElement();
            writer.WriteEndElement();
            writer.WriteEndElement();
        }

        writer.WriteEndElement();
        writer.WriteEndElement();
    }

}
