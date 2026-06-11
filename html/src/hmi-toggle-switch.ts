const toggleProperties = {
  mode: String,
  text: String,
  alternateText: String,
  image: String,
  alternateImage: String,
  header: Boolean,
  headerText: String,
  checked: Boolean,
};

type TogglePropertyName = keyof typeof toggleProperties;

export class HmiToggleSwitch extends HTMLElement {
  static get observedAttributes(): string[] {
    return Object.keys(toggleProperties).map(toKebabCase);
  }

  private _mode = "Switch";
  private _text = "";
  private _alternateText = "";
  private _image = "";
  private _alternateImage = "";
  private _header = false;
  private _headerText = "";
  private _checked = false;
  private readonly root = this.attachShadow({ mode: "open" });

  get mode(): string {
    return this._mode;
  }
  set mode(value: string | number) {
    this.setStringProperty("_mode", value, "Switch");
  }

  get text(): string {
    return this._text;
  }
  set text(value: string) {
    this.setStringProperty("_text", value, "");
  }

  get alternateText(): string {
    return this._alternateText;
  }
  set alternateText(value: string) {
    this.setStringProperty("_alternateText", value, "");
  }

  get image(): string {
    return this._image;
  }
  set image(value: string) {
    this.setStringProperty("_image", value, "");
  }

  get alternateImage(): string {
    return this._alternateImage;
  }
  set alternateImage(value: string) {
    this.setStringProperty("_alternateImage", value, "");
  }

  get header(): boolean {
    return this._header;
  }
  set header(value: boolean) {
    this.setBooleanProperty("_header", value);
  }

  get headerText(): string {
    return this._headerText;
  }
  set headerText(value: string) {
    this.setStringProperty("_headerText", value, "");
  }

  get checked(): boolean {
    return this._checked;
  }
  set checked(value: boolean) {
    this.setBooleanProperty("_checked", value);
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue)
      return;

    const propertyName = fromKebabCase(name) as TogglePropertyName;
    const type = toggleProperties[propertyName];
    if (type === Boolean) {
      (this as unknown as Record<string, boolean>)[propertyName] = newValue !== null;
    } else if (type === String) {
      (this as unknown as Record<string, string | number>)[propertyName] = newValue ?? "";
    }
  }

  private setStringProperty(field: string, value: string | number | null | undefined, fallback: string): void {
    const next = value == null || value === "" ? fallback : String(value);
    const fields = this as unknown as Record<string, string>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.render();
  }

  private setBooleanProperty(field: string, value: boolean | null | undefined): void {
    const next = value !== false && value !== null && value !== undefined;
    const fields = this as unknown as Record<string, boolean>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.render();
  }

  private render(): void {
    const mode = normalizeMode(this._mode);
    const offText = this._text || "OFF";
    const onText = this._alternateText || "ON";
    const activeText = this._checked ? onText : offText;
    const headerText = this._headerText || activeText;
    const activeImage = this._checked ? this._alternateImage || this._image : this._image || this._alternateImage;

    this.root.innerHTML = `
      <style>
        :host {
          box-sizing: border-box;
          display: block;
          min-width: 1px;
          min-height: 1px;
          overflow: visible;
          color: #2f425a;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 700;
          user-select: none;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        .wrap {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .header {
          flex: 0 0 auto;
          min-height: 0;
          text-align: center;
          color: inherit;
          line-height: 1;
          font-size: clamp(10px, 18%, 24px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .body {
          flex: 1 1 auto;
          min-height: 0;
          border: 2px solid #47515f;
          border-radius: 4px;
          background: linear-gradient(#ffffff, #e9e9ed);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 0 0 1px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .switch {
          position: relative;
          height: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .switch.checked {
          direction: rtl;
        }

        .thumb {
          direction: ltr;
          position: relative;
          display: grid;
          place-items: center;
          color: #eef2f7;
          background: linear-gradient(90deg, #5d6472, #747b89);
          border-right: 1px solid rgba(0, 0, 0, 0.28);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), inset -5px 0 9px rgba(0, 0, 0, 0.12);
          font-size: clamp(10px, 32%, 28px);
          line-height: 1;
        }

        .switch.checked .thumb {
          border-right: 0;
          border-left: 1px solid rgba(0, 0, 0, 0.28);
        }

        .grip {
          width: 32%;
          height: 55%;
          min-width: 10px;
          max-width: 32px;
          background:
            linear-gradient(90deg, transparent 0 18%, rgba(30, 34, 42, 0.75) 18% 27%, transparent 27% 45%, rgba(30, 34, 42, 0.7) 45% 54%, transparent 54% 72%, rgba(30, 34, 42, 0.65) 72% 81%, transparent 81%),
            linear-gradient(90deg, transparent 0 24%, rgba(255, 255, 255, 0.25) 24% 30%, transparent 30% 51%, rgba(255, 255, 255, 0.2) 51% 57%, transparent 57%);
        }

        .thumb-text {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .thumb-text:not(:empty) + .grip {
          opacity: 0.18;
        }

        .value {
          direction: ltr;
          min-width: 0;
          display: grid;
          place-items: center;
          padding: 3px 6px;
          color: inherit;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(11px, 36%, 34px);
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .button {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          padding: 4px 8px;
          border: 2px solid #47515f;
          border-radius: 4px;
          color: inherit;
          background: linear-gradient(#ffffff, #d9dbe0);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          text-align: center;
          font-size: clamp(10px, 32%, 28px);
          line-height: 1.05;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
      </style>
      <div class="wrap">
        ${this._header ? `<div class="header">${escapeHtml(headerText)}</div>` : ""}
        ${this.renderBody(mode, offText, onText, activeText, activeImage)}
      </div>`;
  }

  private renderBody(mode: string, offText: string, onText: string, activeText: string, activeImage: string): string {
    if (mode === "GraphicSwitchButton") {
      return `<div class="button">${activeImage ? `<img src="${escapeAttribute(activeImage)}" alt="${escapeAttribute(activeText)}">` : ""}</div>`;
    }

    if (mode === "TextSwitchButton") {
      return `<div class="button">${escapeHtml(activeText)}</div>`;
    }

    const thumbText = this._checked ? offText : onText;
    return `
      <div class="body">
        <div class="switch${this._checked ? " checked" : ""}">
          <div class="thumb"><span class="thumb-text">${escapeHtml(thumbText)}</span><span class="grip"></span></div>
          <div class="value">${escapeHtml(activeText)}</div>
        </div>
      </div>`;
  }
}

function normalizeMode(value: string): string {
  switch (value) {
    case "0":
    case "TextSwitchButton":
      return "TextSwitchButton";
    case "1":
    case "GraphicSwitchButton":
      return "GraphicSwitchButton";
    case "2":
    case "Switch":
    default:
      return "Switch";
  }
}

function toKebabCase(value: string): string {
  return value.replace(/([A-Z])/g, (_, character: string) => `-${character.toLowerCase()}`);
}

function fromKebabCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, character: string) => character.toUpperCase());
}

function escapeHtml(value: string): string {
  return escapeAttribute(value);
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

customElements.define("hmi-toggle-switch", HmiToggleSwitch);
