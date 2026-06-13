export class HmiMultilingualText {
  readonly texts = new Map<number, string>();
  readonly formattedTexts = new Map<number, string>();
  categoryTypeId = 0;
  categorySubtype?: string;

  static fromText(text: string | undefined, cultureId = -1): HmiMultilingualText {
    const result = new HmiMultilingualText();
    result.texts.set(cultureId, text ?? "");
    return result;
  }

  getText(cultureId?: number): string {
    return this.getCultureValue(this.texts, cultureId) ?? this.getDefaultText();
  }

  getFormattedText(cultureId?: number): string {
    return this.getCultureValue(this.formattedTexts, cultureId) ?? "";
  }

  getDisplayText(cultureId?: number): string {
    const formattedText = this.getFormattedText(cultureId);
    return formattedText.trim() === "" ? this.getText(cultureId) : HmiMultilingualText.extractFormattedTextBody(formattedText);
  }

  getFormattedTextBody(cultureId?: number): string {
    return HmiMultilingualText.extractFormattedTextBody(this.getFormattedText(cultureId));
  }

  getDefaultText(): string {
    for (const value of this.texts.values()) {
      return value ?? "";
    }

    return "";
  }

  toString(): string {
    return this.getDefaultText();
  }

  private getCultureValue(values: Map<number, string>, cultureId?: number): string | undefined {
    if (values.size === 0) {
      return undefined;
    }

    if (cultureId !== undefined && values.has(cultureId)) {
      return values.get(cultureId);
    }

    return values.get(-1) ?? values.get(0) ?? values.values().next().value ?? "";
  }

  private static extractFormattedTextBody(formattedText: string | undefined): string {
    if (formattedText === undefined || formattedText.trim() === "") {
      return "";
    }

    const match = /<body(?:\s[^>]*)?>([\s\S]*?)<\/body>/i.exec(formattedText);
    if (match === null) {
      return formattedText;
    }

    return match[1].replace(/\s+xmlns(?::\w+)?="[^"]*"/g, "");
  }
}
