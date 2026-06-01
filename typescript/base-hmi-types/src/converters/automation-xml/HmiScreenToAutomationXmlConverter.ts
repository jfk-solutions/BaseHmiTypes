import { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import { getStaticValueOrDefault } from "../../screens/base/HmiProperty.js";
import { HmiScreenKind } from "../../screens/base/HmiScreenKind.js";
import { XmlWriter } from "./XmlWriter.js";

export class HmiScreenToAutomationXmlConverter {
  static writeAutomationXml(writer: XmlWriter, screen: HmiScreenBase, id: { value: number }): void {
    const elementName = getElementName(screen.kind);
    writer.writeStartElement(elementName);
    writer.writeAttributeString("ID", String(id.value++));
    writer.writeStartElement("AttributeList");
    writer.writeElementString("Name", screen.name);
    writer.writeElementString("Width", getStaticValueOrDefault(screen.width, 0));
    writer.writeElementString("Height", getStaticValueOrDefault(screen.height, 0));
    writer.writeEndElement("AttributeList");
    writer.writeEndElement(elementName);
  }
}

function getElementName(kind: HmiScreenKind): string {
  switch (kind) {
    case HmiScreenKind.Template:
      return "Hmi.Screen.ScreenTemplate";
    case HmiScreenKind.Popup:
      return "Hmi.Screen.ScreenPopup";
    case HmiScreenKind.Slidein:
      return "Hmi.Screen.ScreenSlidein";
    default:
      return "Hmi.Screen.Screen";
  }
}
