import { HmiCycle } from "../../cycles/HmiCycle.js";
import { HmiAutomationXmlConverter } from "./HmiAutomationXmlConverter.js";
import { XmlWriter } from "./XmlWriter.js";

export class HmiCycleToAutomationXmlConverter {
  static writeAutomationXml(writer: XmlWriter, cycle: HmiCycle, id: { value: number }): void {
    writer.writeStartElement("Hmi.Cycle.Cycle");
    writer.writeAttributeString("ID", String(id.value++));
    writer.writeStartElement("AttributeList");
    writer.writeElementString("CycleTime", cycle.cycleTime);
    writer.writeElementString("CycleUnit", cycle.cycleUnit);
    writer.writeElementString("Name", cycle.name);
    writer.writeElementString("StartAtStartingPoint", cycle.startAtStartingPoint);
    writer.writeElementString("StartingPoint", `****-${writeEnumValue(cycle.startingPointMonth)}-${writeEnumValue(cycle.startingPointDay)}T${writeEnumValue(cycle.startingPointHour)}:${writeEnumValue(cycle.startingPointMinute)}:${writeEnumValue(cycle.startingPointSecond)}`);
    writer.writeElementString("TriggerAtShutdown", cycle.triggerAtShutDown);
    writer.writeElementString("TriggerAtStartup", cycle.triggerAtStartUp);
    writer.writeEndElement("AttributeList");

    if (cycle.comment !== undefined) {
      writer.writeStartElement("ObjectList");
      HmiAutomationXmlConverter.writeMultilingualText(cycle.comment, writer, id, "Comment");
      writer.writeEndElement("ObjectList");
    }

    writer.writeEndElement("Hmi.Cycle.Cycle");
  }
}

function writeEnumValue(value: number): string {
  return value > 999 ? "**" : String(value).padStart(2, "*");
}
