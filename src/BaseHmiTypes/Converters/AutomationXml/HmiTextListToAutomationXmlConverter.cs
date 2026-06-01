using System.Globalization;
using System.Xml;
using BaseHmiTypes.TextGraphicLists;

namespace BaseHmiTypes.Converters.AutomationXml;

public static class HmiTextListToAutomationXmlConverter
{
    public static void WriteAutomationXml(XmlWriter writer, HmiTextList textList, ref int id)
    {
        writer.WriteStartElement("Hmi.TextGraphicList.TextList");
        writer.WriteAttributeString("ID", (id++).ToString(CultureInfo.InvariantCulture));
        writer.WriteStartElement("AttributeList");
        WriteElementString(writer, "ListRange", textList.RangeType.ToString());
        WriteElementString(writer, "Name", textList.Name);
        writer.WriteEndElement();

        if (textList.Comment != null)
        {
            writer.WriteStartElement("ObjectList");
            HmiAutomationXmlConverter.WriteAutomationXml(textList.Comment, writer, ref id, "Comment");
            writer.WriteEndElement();
        }

        foreach (var entry in textList.Entries)
        {
            writer.WriteStartElement("Hmi.TextGraphicList.TextListEntry");
            writer.WriteAttributeString("ID", (id++).ToString(CultureInfo.InvariantCulture));
            writer.WriteAttributeString("CompositionName", "Entries");
            writer.WriteStartElement("AttributeList");
            WriteElementString(writer, "DefaultEntry", entry.Default);
            WriteElementString(writer, "From", entry.From);
            WriteElementString(writer, "To", entry.To);
            writer.WriteEndElement();

            if (entry.Text != null)
            {
                writer.WriteStartElement("ObjectList");
                HmiAutomationXmlConverter.WriteAutomationXml(entry.Text, writer, ref id, "Items");
                writer.WriteEndElement();
            }

            writer.WriteEndElement();
        }

        writer.WriteEndElement();
    }

    private static void WriteElementString(XmlWriter writer, string name, object? value)
    {
        writer.WriteElementString(name, value switch
        {
            null => string.Empty,
            bool boolean => boolean ? "true" : "false",
            IFormattable formattable => formattable.ToString(null, CultureInfo.InvariantCulture),
            _ => value.ToString()
        });
    }
}
