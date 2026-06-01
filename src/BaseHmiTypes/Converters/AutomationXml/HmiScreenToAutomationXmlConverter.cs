using System.Globalization;
using System.Xml;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Converters.AutomationXml;

public static class HmiScreenToAutomationXmlConverter
{
    public static void WriteAutomationXml(XmlWriter writer, HmiScreenBase screen, ref int id)
    {
        writer.WriteStartElement(GetElementName(screen.Kind));
        writer.WriteAttributeString("ID", (id++).ToString(CultureInfo.InvariantCulture));
        writer.WriteStartElement("AttributeList");
        WriteElementString(writer, "Name", screen.Name);
        WriteElementString(writer, "Width", screen.Width.GetStaticValueOrDefault());
        WriteElementString(writer, "Height", screen.Height.GetStaticValueOrDefault());
        writer.WriteEndElement();

        writer.WriteEndElement();
    }

    private static string GetElementName(HmiScreenKind kind)
    {
        return kind switch
        {
            HmiScreenKind.Template => "Hmi.Screen.ScreenTemplate",
            HmiScreenKind.Popup => "Hmi.Screen.ScreenPopup",
            HmiScreenKind.Slidein => "Hmi.Screen.ScreenSlidein",
            _ => "Hmi.Screen.Screen"
        };
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
