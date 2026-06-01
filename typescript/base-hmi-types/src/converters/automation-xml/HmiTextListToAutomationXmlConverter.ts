import { HmiTextList } from "../../text-graphic-lists/HmiTextList.js";
import { HmiAutomationXmlConverter } from "./HmiAutomationXmlConverter.js";
import { XmlWriter } from "./XmlWriter.js";

export class HmiTextListToAutomationXmlConverter {
  static writeAutomationXml(writer: XmlWriter, textList: HmiTextList, id: { value: number }): void {
    writer.writeStartElement("Hmi.TextGraphicList.TextList");
    writer.writeAttributeString("ID", String(id.value++));
    writer.writeStartElement("AttributeList");
    writer.writeElementString("ListRange", textList.rangeType);
    writer.writeElementString("Name", textList.name);
    writer.writeEndElement("AttributeList");

    if (textList.comment !== undefined) {
      writer.writeStartElement("ObjectList");
      HmiAutomationXmlConverter.writeMultilingualText(textList.comment, writer, id, "Comment");
      writer.writeEndElement("ObjectList");
    }

    for (const entry of textList.entries) {
      writer.writeStartElement("Hmi.TextGraphicList.TextListEntry");
      writer.writeAttributeString("ID", String(id.value++));
      writer.writeAttributeString("CompositionName", "Entries");
      writer.writeStartElement("AttributeList");
      writer.writeElementString("DefaultEntry", entry.default);
      writer.writeElementString("From", entry.from);
      writer.writeElementString("To", entry.to);
      writer.writeEndElement("AttributeList");
      if (entry.text !== undefined) {
        writer.writeStartElement("ObjectList");
        HmiAutomationXmlConverter.writeMultilingualText(entry.text, writer, id, "Items");
        writer.writeEndElement("ObjectList");
      }
      writer.writeEndElement("Hmi.TextGraphicList.TextListEntry");
    }

    writer.writeEndElement("Hmi.TextGraphicList.TextList");
  }
}
