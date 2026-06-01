import { IHmiObject } from "../../IHmiObject.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiCycle } from "../../cycles/HmiCycle.js";
import { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import { HmiScript } from "../../scripts/HmiScript.js";
import { HmiTextList } from "../../text-graphic-lists/HmiTextList.js";
import { HmiCycleToAutomationXmlConverter } from "./HmiCycleToAutomationXmlConverter.js";
import { HmiScreenToAutomationXmlConverter } from "./HmiScreenToAutomationXmlConverter.js";
import { HmiScriptToAutomationXmlConverter } from "./HmiScriptToAutomationXmlConverter.js";
import { HmiTextListToAutomationXmlConverter } from "./HmiTextListToAutomationXmlConverter.js";
import { XmlWriter } from "./XmlWriter.js";

export class HmiAutomationXmlConverter {
  static toAutomationXml(...objects: IHmiObject[]): string {
    const writer = new XmlWriter();
    const id = { value: 0 };
    writer.writeStartElement("Document");
    writer.writeStartElement("Engineering");
    writer.writeAttributeString("version", "V21");
    writer.writeEndElement("Engineering");

    for (const obj of objects) {
      if (obj instanceof HmiCycle) {
        HmiCycleToAutomationXmlConverter.writeAutomationXml(writer, obj, id);
      } else if (obj instanceof HmiScript) {
        HmiScriptToAutomationXmlConverter.writeAutomationXml(writer, obj, id);
      } else if (obj instanceof HmiTextList) {
        HmiTextListToAutomationXmlConverter.writeAutomationXml(writer, obj, id);
      } else if (obj instanceof HmiScreenBase) {
        HmiScreenToAutomationXmlConverter.writeAutomationXml(writer, obj, id);
      }
    }

    writer.writeEndElement("Document");
    return writer.toString();
  }

  static writeMultilingualText(multiLanguageText: HmiMultilingualText, writer: XmlWriter, id: { value: number }, compositionName: string): void {
    writer.writeStartElement("MultilingualText");
    writer.writeAttributeString("ID", `0x${(id.value++).toString(16).toUpperCase()}`);
    writer.writeAttributeString("CompositionName", compositionName);
    writer.writeStartElement("ObjectList");
    for (const [culture, text] of multiLanguageText.texts) {
      writer.writeStartElement("MultilingualTextItem");
      writer.writeAttributeString("ID", `0x${(id.value++).toString(16).toUpperCase()}`);
      writer.writeAttributeString("CompositionName", "Items");
      writer.writeStartElement("AttributeList");
      writer.writeElementString("Culture", culture >= 0 ? String(culture) : "");
      writer.writeElementString("Text", text);
      writer.writeEndElement("AttributeList");
      writer.writeEndElement("MultilingualTextItem");
    }
    writer.writeEndElement("ObjectList");
    writer.writeEndElement("MultilingualText");
  }
}
