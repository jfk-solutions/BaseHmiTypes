export class XmlWriter {
  private readonly parts: string[] = [];
  private openStartElement = false;

  writeStartElement(name: string): void {
    this.closeStartElement();
    this.parts.push("<", name);
    this.openStartElement = true;
  }

  writeAttributeString(name: string, value?: string): void {
    if (!this.openStartElement) {
      return;
    }

    this.parts.push(" ", name, "=\"", escapeXml(value ?? ""), "\"");
  }

  writeElementString(name: string, value?: unknown): void {
    this.writeStartElement(name);
    this.writeString(valueToString(value));
    this.writeEndElement(name);
  }

  writeString(value?: string): void {
    this.closeStartElement();
    this.parts.push(escapeXml(value ?? ""));
  }

  writeEndElement(name?: string): void {
    if (this.openStartElement) {
      this.parts.push("/>");
      this.openStartElement = false;
      return;
    }

    if (name !== undefined) {
      this.parts.push("</", name, ">");
    }
  }

  toString(): string {
    this.closeStartElement();
    return this.parts.join("");
  }

  private closeStartElement(): void {
    if (this.openStartElement) {
      this.parts.push(">");
      this.openStartElement = false;
    }
  }
}

export function valueToString(value?: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
