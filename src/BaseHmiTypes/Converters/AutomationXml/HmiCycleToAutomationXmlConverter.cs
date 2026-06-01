using System.Globalization;
using System.Xml;
using BaseHmiTypes.Cycles;

namespace BaseHmiTypes.Converters.AutomationXml;

public static class HmiCycleToAutomationXmlConverter
{
    public static void WriteAutomationXml(XmlWriter writer, HmiCycle cycle, ref int id)
    {
        writer.WriteStartElement("Hmi.Cycle.Cycle");
        writer.WriteAttributeString("ID", (id++).ToString(CultureInfo.InvariantCulture));
        writer.WriteStartElement("AttributeList");
        WriteElementString(writer, "CycleTime", cycle.CycleTime);
        WriteElementString(writer, "CycleUnit", cycle.CycleUnit);
        WriteElementString(writer, "Name", cycle.Name);
        WriteElementString(writer, "StartAtStartingPoint", cycle.StartAtStartingPoint);
        WriteElementString(writer, "StartingPoint", "****-" + WriteEnumValue(cycle.StartingPointMonth) + "-" + WriteEnumValue(cycle.StartingPointDay) + "T" + WriteEnumValue(cycle.StartingPointHour) + ":" + WriteEnumValue(cycle.StartingPointMinute) + ":" + WriteEnumValue(cycle.StartingPointSecond));
        WriteElementString(writer, "TriggerAtShutdown", cycle.TriggerAtShutDown);
        WriteElementString(writer, "TriggerAtStartup", cycle.TriggerAtStartUp);
        writer.WriteEndElement();

        if (cycle.Comment != null)
        {
            writer.WriteStartElement("ObjectList");
            HmiAutomationXmlConverter.WriteAutomationXml(cycle.Comment, writer, ref id, "Comment");
            writer.WriteEndElement();
        }

        writer.WriteEndElement();
    }

    private static string WriteEnumValue(int value)
    {
        return value > 999 ? "**" : value.ToString(CultureInfo.InvariantCulture).PadLeft(2, '*');
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
