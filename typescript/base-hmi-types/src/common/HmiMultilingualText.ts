export class HmiMultilingualText {
  readonly texts = new Map<number, string>();
  readonly formattedTexts = new Map<number, string>();
  categoryTypeId = 0;
  categorySubtype?: string;

  getText(cultureId?: number): string {
    if (cultureId === undefined) {
      return this.getDefaultText();
    }

    return this.texts.get(cultureId) ?? "";
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
}
