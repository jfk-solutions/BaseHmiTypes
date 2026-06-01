using System.Globalization;
using System.Xml;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Scripts;

namespace BaseHmiTypes.Converters.AutomationXml;

public static class HmiScriptToAutomationXmlConverter
{
    public static void WriteAutomationXml(XmlWriter writer, HmiScript script, ref int id)
    {
        if (script.Language != HmiScriptLanguage.VBScript)
            return;

        writer.WriteStartElement("Hmi.RuntimeScripting.VBScript");
        writer.WriteAttributeString("ID", (id++).ToString(CultureInfo.InvariantCulture));
        writer.WriteStartElement("AttributeList");
        WriteElementString(writer, "Code", script.SourceCode);
        WriteElementString(writer, "Name", script.Name);
        WriteElementString(writer, "PreCode", script.PreCode);
        WriteElementString(writer, "Type", script.ScriptType.ToString());
        writer.WriteEndElement();

        if (script.Comment != null)
        {
            writer.WriteStartElement("ObjectList");
            HmiAutomationXmlConverter.WriteAutomationXml(script.Comment, writer, ref id, "Comment");
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
