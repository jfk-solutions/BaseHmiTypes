import { HmiScript } from "../../scripts/HmiScript.js";
import { HmiScriptLanguage } from "../../screens/base/HmiProperty.js";
import { HmiAutomationXmlConverter } from "./HmiAutomationXmlConverter.js";
import { XmlWriter } from "./XmlWriter.js";

export class HmiScriptToAutomationXmlConverter {
  static writeAutomationXml(writer: XmlWriter, script: HmiScript, id: { value: number }): void {
    if (script.language !== HmiScriptLanguage.VBScript) {
      return;
    }

    writer.writeStartElement("Hmi.RuntimeScripting.VBScript");
    writer.writeAttributeString("ID", String(id.value++));
    writer.writeStartElement("AttributeList");
    writer.writeElementString("Code", script.sourceCode);
    writer.writeElementString("Name", script.name);
    writer.writeElementString("PreCode", script.preCode);
    writer.writeElementString("Type", script.scriptType);
    writer.writeEndElement("AttributeList");

    if (script.comment !== undefined) {
      writer.writeStartElement("ObjectList");
      HmiAutomationXmlConverter.writeMultilingualText(script.comment, writer, id, "Comment");
      writer.writeEndElement("ObjectList");
    }

    writer.writeEndElement("Hmi.RuntimeScripting.VBScript");
  }
}
