const selectionGroupProperties = {
  selectedIndex: Number,
  selectionItemHeight: Number,
  selectionBackgroundColor: String,
  selectionForegroundColor: String,
  selectionBorderColor: String,
  selectionBorderWidth: Number,
};

type SelectionGroupPropertyName = keyof typeof selectionGroupProperties;
type SelectionIndicator = "checkbox" | "radio";

interface SelectionItem {
  text: string;
  image: string;
  imageName: string;
}

abstract class HmiSelectionGroupElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return Object.keys(selectionGroupProperties).map(toKebabCase);
  }

  protected abstract readonly indicator: SelectionIndicator;
  private _selectedIndex = -1;
  private _selectionItemHeight = Number.NaN;
  private _selectionBackgroundColor = "";
  private _selectionForegroundColor = "";
  private _selectionBorderColor = "";
  private _selectionBorderWidth = Number.NaN;
  private renderQueued = false;
  private renderedItemsKey = "";
  private readonly root = this.attachShadow({ mode: "open" });
  private readonly observer = new MutationObserver(() => this.queueRender());

  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(value: number | string | null | undefined) {
    this.setNumberProperty("_selectedIndex", value, -1);
  }

  get selectionItemHeight(): number {
    return this._selectionItemHeight;
  }
  set selectionItemHeight(value: number | string | null | undefined) {
    this.setNumberProperty("_selectionItemHeight", value, Number.NaN);
  }

  get selectionBackgroundColor(): string {
    return this._selectionBackgroundColor;
  }
  set selectionBackgroundColor(value: string | null | undefined) {
    this.setStringProperty("_selectionBackgroundColor", value, "");
  }

  get selectionForegroundColor(): string {
    return this._selectionForegroundColor;
  }
  set selectionForegroundColor(value: string | null | undefined) {
    this.setStringProperty("_selectionForegroundColor", value, "");
  }

  get selectionBorderColor(): string {
    return this._selectionBorderColor;
  }
  set selectionBorderColor(value: string | null | undefined) {
    this.setStringProperty("_selectionBorderColor", value, "");
  }

  get selectionBorderWidth(): number {
    return this._selectionBorderWidth;
  }
  set selectionBorderWidth(value: number | string | null | undefined) {
    this.setNumberProperty("_selectionBorderWidth", value, Number.NaN);
  }

  connectedCallback(): void {
    this.observer.observe(this, {
      attributes: true,
      attributeFilter: ["text", "image", "image-name", "selected"],
      childList: true,
      subtree: true,
    });
    this.queueRender();
  }

  disconnectedCallback(): void {
    this.observer.disconnect();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue)
      return;

    const propertyName = fromKebabCase(name) as SelectionGroupPropertyName;
    const type = selectionGroupProperties[propertyName];
    if (type === Number) {
      (this as unknown as Record<string, number | string | null>)[propertyName] = newValue;
    } else if (type === String) {
      (this as unknown as Record<string, string>)[propertyName] = newValue ?? "";
    }
  }

  private setNumberProperty(field: string, value: number | string | null | undefined, fallback: number): void {
    const parsed = Number(value);
    const next = Number.isFinite(parsed) ? parsed : fallback;
    const fields = this as unknown as Record<string, number>;
    if (Object.is(fields[field], next))
      return;

    fields[field] = next;
    this.queueRender();
  }

  private setStringProperty(field: string, value: string | null | undefined, fallback: string): void {
    const next = value == null ? fallback : String(value);
    const fields = this as unknown as Record<string, string>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.queueRender();
  }

  private queueRender(): void {
    if (this.renderQueued)
      return;

    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      this.render();
    });
  }

  private render(): void {
    const items = this.getItems();
    this.renderedItemsKey = getItemsKey(items);
    const computed = getComputedStyle(this);
    const backgroundColor = computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)"
      ? computed.backgroundColor
      : "#f5f6ff";
    const foregroundColor = computed.color || "#000000";
    const borderColor = normalizeCssColor(computed.borderTopColor, "#676a72");
    const declaredBorderWidth = this.style.borderTopWidth || this.style.borderWidth;
    const rawBorderWidth = parseCssPixels(declaredBorderWidth, computed.borderTopWidth);
    const borderWidth = rawBorderWidth ?? 4;
    const itemHeight = Number.isFinite(this._selectionItemHeight) && this._selectionItemHeight > 0
      ? `${this._selectionItemHeight}px`
      : "1fr";
    const selectionBackgroundColor = this._selectionBackgroundColor || "transparent";
    const selectionForegroundColor = this._selectionForegroundColor || foregroundColor;
    const selectionBorderColor = this._selectionBorderColor || "#6d98c8";
    const selectionBorderWidth = Number.isFinite(this._selectionBorderWidth) && this._selectionBorderWidth > 0
      ? this._selectionBorderWidth
      : 0;

    this.root.innerHTML = `
      <style>
        :host {
          box-sizing: border-box;
          display: block;
          position: relative;
          min-width: 1px;
          min-height: 1px;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
          user-select: none;
          border-style: none !important;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        .source {
          position: absolute;
          width: 0;
          height: 0;
          overflow: hidden;
          clip-path: inset(50%);
        }

        .panel {
          width: 100%;
          height: 100%;
          padding: max(6px, ${borderWidth + 8}px) max(8px, ${borderWidth + 10}px);
          overflow: hidden;
          color: ${escapeCss(foregroundColor)};
          background: ${escapeCss(backgroundColor)};
          border: ${toCss(borderWidth)}px solid ${escapeCss(borderColor)};
          border-radius: 8px;
          display: grid;
          align-content: start;
          gap: 6px;
        }

        .item {
          min-width: 0;
          min-height: 0;
          height: ${itemHeight};
          display: grid;
          grid-template-columns: minmax(20px, 0.24fr) minmax(0, auto) minmax(0, 1fr);
          align-items: center;
          column-gap: 12px;
          padding: 2px 4px;
          color: inherit;
          line-height: 1;
          overflow: hidden;
        }

        .item.selected {
          color: ${escapeCss(selectionForegroundColor)};
          background: ${escapeCss(selectionBackgroundColor)};
          ${selectionBorderWidth > 0 ? `border: ${toCss(selectionBorderWidth)}px solid ${escapeCss(selectionBorderColor)};` : ""}
        }

        .indicator {
          width: min(100%, 62px);
          aspect-ratio: 1;
          justify-self: end;
          border: 2px solid #9b9da5;
          background: linear-gradient(#f7f8fb 0%, #dfe1e8 48%, #b7bac4 100%);
          box-shadow:
            inset 1px 1px 2px rgba(255, 255, 255, 0.9),
            inset -1px -1px 2px rgba(55, 59, 68, 0.22),
            0 1px 1px rgba(0, 0, 0, 0.22);
          position: relative;
        }

        .indicator.checkbox {
          border-radius: 5px;
        }

        .indicator.radio {
          border-radius: 999px;
        }

        .item.selected .indicator.checkbox::after {
          content: "";
          position: absolute;
          left: 26%;
          top: 15%;
          width: 42%;
          height: 62%;
          border: solid #253044;
          border-width: 0 4px 4px 0;
          transform: rotate(45deg);
        }

        .item.selected .indicator.radio::after {
          content: "";
          position: absolute;
          inset: 22%;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 30%, #5f6570, #1f2430 68%);
          box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.35);
        }

        .graphic {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: min(100%, 28px);
          object-fit: contain;
          display: block;
        }

        .label {
          min-width: 0;
          overflow: hidden;
          color: inherit;
          font: inherit;
          font-size: inherit;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      </style>
      <slot class="source" name="item"></slot>
      <div class="panel" role="group">
        ${this.renderItems(items)}
      </div>`;

    this.root.querySelector("slot[name='item']")?.addEventListener("slotchange", () => {
      if (getItemsKey(this.getItems()) !== this.renderedItemsKey)
        this.queueRender();
    });
  }

  private renderItems(items: SelectionItem[]): string {
    return items
      .map((item, index) => {
        const selected = index === Math.trunc(this._selectedIndex);
        const role = this.indicator === "radio" ? "radio" : "checkbox";
        return `
          <div class="item${selected ? " selected" : ""}" role="${role}" aria-checked="${selected ? "true" : "false"}">
            <span class="indicator ${this.indicator}"></span>
            ${renderImage(item)}
            <span class="label">${escapeHtml(item.text)}</span>
          </div>`;
      })
      .join("");
  }

  private getItems(): SelectionItem[] {
    return Array.from(this.querySelectorAll<HTMLElement>("[slot='item']")).map(item => ({
      text: item.getAttribute("text") ?? item.textContent?.trim() ?? "",
      image: item.getAttribute("image") ?? "",
      imageName: item.getAttribute("image-name") ?? "",
    }));
  }
}

function getItemsKey(items: SelectionItem[]): string {
  return JSON.stringify(items);
}

export class HmiCheckBoxGroup extends HmiSelectionGroupElement {
  protected readonly indicator = "checkbox";
}

export class HmiRadioButtonGroup extends HmiSelectionGroupElement {
  protected readonly indicator = "radio";
}

function renderImage(item: SelectionItem): string {
  if (!item.image)
    return "";

  return `<img class="graphic" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageName || item.text)}">`;
}

function normalizeCssColor(value: string, fallback: string): string {
  return value && value !== "rgba(0, 0, 0, 0)" ? value : fallback;
}

function toCss(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/\.?0+$/, "");
}

function parseCssPixels(...values: string[]): number | undefined {
  for (const value of values) {
    if (!value)
      continue;

    const parsed = parseFloat(value);
    if (Number.isFinite(parsed))
      return parsed;
  }

  return undefined;
}

function toKebabCase(value: string): string {
  return value.replace(/([A-Z])/g, (_, character: string) => `-${character.toLowerCase()}`);
}

function fromKebabCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, character: string) => character.toUpperCase());
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeCss(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("<", "\\3c ");
}

customElements.define("hmi-checkbox-group", HmiCheckBoxGroup);
customElements.define("hmi-radio-button-group", HmiRadioButtonGroup);
