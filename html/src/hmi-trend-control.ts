const trendControlProperties = {
  controlName: String,
  typeName: String,
  chartTitle: String,
  pens: String,
  displayChartTitle: String,
  showToolbar: String,
  showStatusBar: String,
  displayPenIcons: String,
  displayScrollMechanism: String,
  chartLiveMode: String,
  autoScale: String,
  xAxisScaleVisible: String,
  xAxisDateVisible: String,
  xAxisGridVisible: String,
  yAxisScaleVisible: String,
  yAxisGridVisible: String,
  yAxisScaleAsPercent: String,
  minimumValue: String,
  maximumValue: String,
  yAxisDecimalPlaces: String,
};

type TrendControlPropertyName = keyof typeof trendControlProperties;
type TimeLabel = {
  primary: string;
  secondary: string;
};

interface TrendPen {
  number: number;
  name?: string;
  color?: string;
  visible?: boolean;
  width?: number;
  style?: number;
  marker?: string;
  minimum?: number;
  maximum?: number;
  unit?: string;
}

export class HmiTrendControl extends HTMLElement {
  static get observedAttributes(): string[] {
    return Object.keys(trendControlProperties).map(toKebabCase);
  }

  private _controlName = "";
  private _typeName = "Trend control";
  private readonly root = this.attachShadow({ mode: "open" });

  get controlName(): string {
    return this._controlName;
  }
  set controlName(value: string | null | undefined) {
    this.setStringProperty("_controlName", value, "");
  }

  get typeName(): string {
    return this._typeName;
  }
  set typeName(value: string | null | undefined) {
    this.setStringProperty("_typeName", value, "Trend control");
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue)
      return;

    const propertyName = fromKebabCase(name) as TrendControlPropertyName;
    if (propertyName === "controlName" || propertyName === "typeName") {
      (this as unknown as Record<string, string>)[propertyName] = newValue ?? "";
    } else if (trendControlProperties[propertyName] === String) {
      this.render();
    }
  }

  private setStringProperty(field: string, value: string | null | undefined, fallback: string): void {
    const next = value == null || value === "" ? fallback : String(value);
    const fields = this as unknown as Record<string, string>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.render();
  }

  private render(): void {
    const computed = getComputedStyle(this);
    const backgroundColor = normalizeTransparent(computed.backgroundColor, "#ffffff");
    const foregroundColor = normalizeTransparent(computed.color, "#5a5d64");
    const borderColor = normalizeTransparent(computed.borderTopColor, "#a8acb2");
    const rawBorderWidth = parseFloat(computed.borderTopWidth);
    const borderWidth = Number.isFinite(rawBorderWidth) ? rawBorderWidth : 0;
    const pens = parsePens(this.getAttribute("pens"));
    const visiblePens = pens.filter(pen => pen.visible !== false);
    const firstPen = visiblePens[0] ?? pens[0];
    const minimumValue = readNumberAttribute(this, "minimum-value", firstPen?.minimum ?? 0);
    const maximumCandidate = readNumberAttribute(this, "maximum-value", firstPen?.maximum ?? 100);
    const maximumValue = maximumCandidate === minimumValue ? minimumValue + 1 : maximumCandidate;
    const decimalPlaces = clamp(Math.trunc(readNumberAttribute(this, "y-axis-decimal-places", 0)), 0, 12);
    const displayChartTitle = readBooleanAttribute(this, "display-chart-title", false);
    const showToolbar = readBooleanAttribute(this, "show-toolbar", true);
    const showStatusBar = readBooleanAttribute(this, "show-status-bar", false);
    const displayPenIcons = readBooleanAttribute(this, "display-pen-icons", true);
    const displayScrollMechanism = readBooleanAttribute(this, "display-scroll-mechanism", false);
    const chartLiveMode = readBooleanAttribute(this, "chart-live-mode", false);
    const autoScale = readBooleanAttribute(this, "auto-scale", false);
    const xAxisVisible = readBooleanAttribute(this, "x-axis-scale-visible", true);
    const xAxisDateVisible = readBooleanAttribute(this, "x-axis-date-visible", true);
    const xAxisGridVisible = readBooleanAttribute(this, "x-axis-grid-visible", true);
    const yAxisVisible = readBooleanAttribute(this, "y-axis-scale-visible", true);
    const yAxisGridVisible = readBooleanAttribute(this, "y-axis-grid-visible", true);
    const yAxisScaleAsPercent = readBooleanAttribute(this, "y-axis-scale-as-percent", false);
    const chartTitle = this.getAttribute("chart-title") || this._controlName || this._typeName;
    const now = new Date();
    const labels = createTimeLabels(now, xAxisDateVisible);
    const plotTop = displayChartTitle ? (showToolbar ? 29 : 15) : (showToolbar ? 23 : 7);
    const plotBottom = (displayScrollMechanism ? 22 : 16) + (showStatusBar ? 10 : 0);

    this.root.innerHTML = `
      <style>
        :host {
          box-sizing: border-box;
          display: block;
          min-width: 140px;
          min-height: 90px;
          overflow: hidden;
          font-family: var(--hmi-trend-content-font-family, Arial, Helvetica, sans-serif);
          font-size: var(--hmi-trend-content-font-size, initial);
          font-weight: var(--hmi-trend-content-font-weight, normal);
          font-style: var(--hmi-trend-content-font-style, normal);
          text-decoration: var(--hmi-trend-content-text-decoration, none);
          color: ${escapeCss(foregroundColor)};
          background: ${escapeCss(backgroundColor)};
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        .frame {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: ${escapeCss(backgroundColor)};
          ${borderWidth > 0 ? `border: ${toCss(borderWidth)}px solid ${escapeCss(borderColor)};` : ""}
        }

        .title {
          position: absolute;
          top: 2%;
          left: 4%;
          right: 4%;
          color: ${escapeCss(foregroundColor)};
          font-family: var(--hmi-trend-header-font-family, inherit);
          font-size: var(--hmi-trend-header-font-size, clamp(12px, 2.5vmin, 22px));
          font-weight: var(--hmi-trend-header-font-weight, 600);
          font-style: var(--hmi-trend-header-font-style, inherit);
          text-decoration: var(--hmi-trend-header-text-decoration, inherit);
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .toolbar {
          position: absolute;
          top: ${displayChartTitle ? 11 : 3}%;
          left: 10%;
          right: 2.5%;
          min-height: 26px;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          color: #20242a;
          font-size: clamp(10px, 1.8vmin, 16px);
        }

        .pen-chip {
          min-width: 0;
          max-width: 220px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 7px;
          border: 1px solid #d8d9dc;
          border-radius: 4px;
          background: linear-gradient(#ffffff, #f4f4f5);
          overflow: hidden;
        }

        .pen-icon {
          width: 30px;
          height: 14px;
          flex: 0 0 30px;
        }

        .pen-name {
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .plot {
          position: absolute;
          left: 10%;
          right: 2.5%;
          top: ${plotTop}%;
          bottom: ${plotBottom}%;
        }

        .grid {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }

        .axis-label {
          position: absolute;
          color: ${escapeCss(foregroundColor)};
          font-size: clamp(10px, 2vmin, 18px);
          line-height: 1;
          white-space: nowrap;
        }

        .y-label {
          left: -4.4em;
          transform: translateY(50%);
          text-align: right;
          width: 3.6em;
          color: var(--hmi-trend-y-axis-percentage-color, ${escapeCss(foregroundColor)});
        }

        .x-label {
          top: calc(100% + 0.9em);
          transform: translateX(-50%);
          text-align: center;
          min-width: 5.2em;
        }

        .status {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          min-height: 18px;
          padding: 2px 6px;
          overflow: hidden;
          color: var(--hmi-trend-status-foreground, #4f5967);
          background: var(--hmi-trend-status-background, #eef0f3);
          border-top: 1px solid color-mix(in srgb, currentColor 30%, transparent);
          font-family: var(--hmi-trend-status-font-family, inherit);
          font-size: var(--hmi-trend-status-font-size, clamp(9px, 1.5vmin, 13px));
          font-weight: var(--hmi-trend-status-font-weight, normal);
          font-style: var(--hmi-trend-status-font-style, inherit);
          text-decoration: var(--hmi-trend-status-text-decoration, inherit);
          white-space: nowrap;
        }

        .scrollbar {
          position: absolute;
          left: 10%;
          right: 2.5%;
          bottom: 4%;
          height: 8px;
          border-radius: 4px;
          background: #d6d9dd;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18);
        }

        .scroll-thumb {
          width: 34%;
          height: 100%;
          margin-left: ${chartLiveMode ? 66 : 33}%;
          border-radius: inherit;
          background: #858d98;
        }
      </style>
      <div class="frame">
        ${displayChartTitle ? `<div class="title">${escapeHtml(chartTitle)}</div>` : ""}
        ${showToolbar ? `<div class="toolbar">${renderPenLegend(visiblePens, displayPenIcons)}</div>` : ""}
        ${showStatusBar ? `<div class="status">${chartLiveMode ? "LIVE" : "HISTORICAL"}${autoScale ? " · AUTO" : ""}</div>` : ""}
        <div class="plot">
          <svg class="grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            ${renderGrid(xAxisGridVisible, yAxisGridVisible)}
            ${xAxisVisible ? `<line x1="0" y1="100" x2="100" y2="100" stroke="#444850" stroke-width="0.55"></line>` : ""}
            ${yAxisVisible ? `<line x1="0" y1="0" x2="0" y2="100" stroke="#444850" stroke-width="0.55"></line>` : ""}
            ${renderPens(visiblePens)}
          </svg>
          ${yAxisVisible ? renderYLabels(minimumValue, maximumValue, decimalPlaces, yAxisScaleAsPercent) : ""}
          ${xAxisVisible ? renderXLabels(labels) : ""}
        </div>
        ${displayScrollMechanism ? `<div class="scrollbar"><div class="scroll-thumb"></div></div>` : ""}
      </div>`;
  }
}

function renderGrid(verticalVisible: boolean, horizontalVisible: boolean): string {
  const lines: string[] = [];
  if (horizontalVisible) {
    for (let index = 0; index <= 10; index++) {
      const y = index * 10;
      lines.push(`<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="#dedede" stroke-width="0.32"></line>`);
    }
  }
  if (verticalVisible) {
    for (let index = 0; index <= 7; index++) {
      const x = (index / 7) * 100;
      lines.push(`<line x1="${toCss(x)}" y1="0" x2="${toCss(x)}" y2="100" stroke="#dedede" stroke-width="0.32"></line>`);
    }
  }
  return lines.join("");
}

function renderYLabels(minimum: number, maximum: number, decimalPlaces: number, asPercent: boolean): string {
  const labels: string[] = [];
  for (let index = 0; index <= 5; index++) {
    const ratio = index / 5;
    const value = maximum - (maximum - minimum) * ratio;
    const suffix = asPercent ? "%" : "";
    labels.push(`<span class="axis-label y-label" style="top:${toCss(ratio * 100)}%">${escapeHtml(value.toFixed(decimalPlaces))}${suffix}</span>`);
  }
  return labels.join("");
}

function renderXLabels(values: TimeLabel[]): string {
  return values
    .map((value, index) => {
      const left = (index / Math.max(values.length - 1, 1)) * 100;
      return `<span class="axis-label x-label" style="left:${toCss(left)}%">${escapeHtml(value.primary)}<br>${escapeHtml(value.secondary)}</span>`;
    })
    .join("");
}

function createTimeLabels(now: Date, includeDate: boolean): TimeLabel[] {
  const labels: TimeLabel[] = [];
  for (let index = 0; index < 8; index++) {
    const date = new Date(now.getTime() + index * 9000);
    labels.push(formatTimeLabel(date, includeDate));
  }
  return labels;
}

function formatTimeLabel(date: Date, includeDate: boolean): TimeLabel {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours >= 12 ? "PM" : "AM";
  return {
    primary: includeDate ? `${month}/${day}/${year}` : "",
    secondary: `${hour12}:${minutes}:${seconds}${suffix}`,
  };
}

function renderPenLegend(pens: readonly TrendPen[], displayIcons: boolean): string {
  if (pens.length === 0) return `<div class="pen-chip"><span class="pen-name">No configured pens</span></div>`;
  return pens.map((pen, index) => {
    const color = normalizePenColor(pen.color, index);
    const label = pen.name || `Pen ${pen.number || index + 1}`;
    const unit = pen.unit ? ` (${pen.unit})` : "";
    const marker = pen.marker === undefined || pen.marker === "0" ? "" : renderMarker(pen, color, 15, 7, 3);
    const icon = displayIcons
      ? `<svg class="pen-icon" viewBox="0 0 30 14" aria-hidden="true"><line x1="1" y1="7" x2="29" y2="7" stroke="${escapeHtml(color)}" stroke-width="${toCss(clamp(pen.width ?? 2, 1, 8))}"${dashAttribute(pen.style)}></line>${marker}</svg>`
      : "";
    return `<div class="pen-chip">${icon}<span class="pen-name">${escapeHtml(label + unit)}</span></div>`;
  }).join("");
}

function renderPens(pens: readonly TrendPen[]): string {
  return pens.map((pen, index) => {
    const color = normalizePenColor(pen.color, index);
    const width = clamp(pen.width ?? 2, 1, 8);
    const amplitude = Math.max(6, 24 - (index % 8) * 2);
    const points: string[] = [];
    for (let point = 0; point <= 20; point++) {
      const x = point * 5;
      const y = 50 - Math.sin((point + index * 3) * 0.55) * amplitude + (index % 8) * 3;
      points.push(`${toCss(x)},${toCss(clamp(y, 3, 97))}`);
    }
    const markers = pen.marker === undefined || pen.marker === "0"
      ? ""
      : points.filter((_point, pointIndex) => pointIndex % 5 === 0).map(point => {
        const [x, y] = point.split(",").map(Number);
        return renderMarker(pen, color, x ?? 0, y ?? 0, clamp(width + 1, 2, 5));
      }).join("");
    return `<polyline points="${points.join(" ")}" fill="none" stroke="${escapeHtml(color)}" stroke-width="${toCss(width)}" vector-effect="non-scaling-stroke"${dashAttribute(pen.style)}></polyline>${markers}`;
  }).join("");
}

function renderMarker(pen: TrendPen, color: string, x: number, y: number, size: number): string {
  const marker = Number(pen.marker ?? 0);
  if (marker === 2 || marker === 5)
    return `<circle cx="${toCss(x)}" cy="${toCss(y)}" r="${toCss(size)}" fill="${escapeHtml(color)}"></circle>`;
  return `<rect x="${toCss(x - size)}" y="${toCss(y - size)}" width="${toCss(size * 2)}" height="${toCss(size * 2)}" fill="${escapeHtml(color)}"></rect>`;
}

function dashAttribute(style: number | undefined): string {
  switch (style) {
    case 1: return ` stroke-dasharray="6 4"`;
    case 2: return ` stroke-dasharray="2 3"`;
    case 3: return ` stroke-dasharray="6 3 2 3"`;
    case 4: return ` stroke-dasharray="6 3 2 3 2 3"`;
    default: return "";
  }
}

function parsePens(value: string | null): TrendPen[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry, index) => {
      if (entry === null || typeof entry !== "object") return [];
      const source = entry as Record<string, unknown>;
      const pen: TrendPen = { number: finiteNumber(source.number, index + 1) };
      if (typeof source.name === "string") pen.name = source.name;
      if (typeof source.color === "string") pen.color = source.color;
      if (typeof source.visible === "boolean") pen.visible = source.visible;
      if (typeof source.width === "number" && Number.isFinite(source.width)) pen.width = source.width;
      if (typeof source.style === "number" && Number.isFinite(source.style)) pen.style = source.style;
      if (typeof source.marker === "string") pen.marker = source.marker;
      if (typeof source.minimum === "number" && Number.isFinite(source.minimum)) pen.minimum = source.minimum;
      if (typeof source.maximum === "number" && Number.isFinite(source.maximum)) pen.maximum = source.maximum;
      if (typeof source.unit === "string") pen.unit = source.unit;
      return [pen];
    });
  } catch {
    return [];
  }
}

function readBooleanAttribute(element: Element, name: string, fallback: boolean): boolean {
  const value = element.getAttribute(name);
  if (value === null) return fallback;
  if (value.toLowerCase() === "false" || value === "0") return false;
  if (value.toLowerCase() === "true" || value === "1" || value === "") return true;
  return fallback;
}

function readNumberAttribute(element: Element, name: string, fallback: number): number {
  const value = Number(element.getAttribute(name));
  return element.hasAttribute(name) && Number.isFinite(value) ? value : fallback;
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizePenColor(value: string | undefined, index: number): string {
  const fallback = ["#0C66B0", "#D04A35", "#299447", "#8A55B4", "#D18B17"][index % 5]!;
  if (!value) return fallback;
  return /^(?:#[0-9a-f]{3}|#[0-9a-f]{4}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgba?\([\d.,%\s]+\))$/iu.test(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeTransparent(value: string, fallback: string): string {
  return value && value !== "rgba(0, 0, 0, 0)" ? value : fallback;
}

function toCss(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/\.?0+$/, "");
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

customElements.define("hmi-trend-control", HmiTrendControl);
