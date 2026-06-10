import {
  BaseCustomWebComponentConnectedReady,
  css,
  customElement,
  html,
} from "../node_modules/@node-projects/base-custom-webcomponent/dist/index.js";

type GaugeFont = {
  name?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

const gaugeProperties = {
  value: Number,
  fillLevel: Number,
  showFillLevel: Boolean,
  beginValue: Number,
  endValue: Number,
  originValue: Number,
  divisionCount: Number,
  subDivisionCount: Number,
  barMode: Number,
  scaleMode: Number,
  orientation: Number,
  showValue: Boolean,
  valuePosition: Number,
  labelColor: String,
  scaleBackgroundColor: String,
  scaleForegroundColor: String,
  tickColor: String,
  labelFont: Object,
};

const startAngle = 135;
const sweepAngle = 270;

export class HmiGauge extends BaseCustomWebComponentConnectedReady {
  static readonly properties = gaugeProperties;

  static get observedAttributes(): string[] {
    return Object.keys(gaugeProperties).map(toKebabCase);
  }

  static readonly style = css`
    :host {
      display: block;
      box-sizing: border-box;
      min-width: 1px;
      min-height: 1px;
      overflow: hidden;
      color: #20242a;
      background: transparent;
      font-family: Arial, Helvetica, sans-serif;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    text {
      dominant-baseline: middle;
      text-anchor: middle;
      paint-order: stroke;
      stroke: rgba(244, 246, 250, 0.9);
      stroke-width: 0.35;
      stroke-linejoin: round;
    }
  `;

  static readonly template = html`<svg id="gauge" viewBox="0 0 100 100" part="svg"></svg>`;

  private _value = 0;
  private _fillLevel = Number.NaN;
  private _showFillLevel = false;
  private _beginValue = 0;
  private _endValue = 50;
  private _originValue = 0;
  private _divisionCount = 5;
  private _subDivisionCount = 5;
  private _barMode = 0;
  private _scaleMode = 0;
  private _orientation = 0;
  private _showValue = false;
  private _valuePosition = 0;
  private _labelColor = "#20242a";
  private _scaleBackgroundColor = "#6f7179";
  private _scaleForegroundColor = "#86bd28";
  private _tickColor = "#6f7179";
  private _labelFont?: GaugeFont;
  private _isConnected = false;

  get value(): number {
    return this._value;
  }
  set value(value: number) {
    this.setNumberProperty("_value", value, 0);
  }

  get fillLevel(): number {
    return this._fillLevel;
  }
  set fillLevel(value: number) {
    this.setNumberProperty("_fillLevel", value, Number.NaN);
  }

  get showFillLevel(): boolean {
    return this._showFillLevel;
  }
  set showFillLevel(value: boolean) {
    this.setBooleanProperty("_showFillLevel", value);
  }

  get beginValue(): number {
    return this._beginValue;
  }
  set beginValue(value: number) {
    this.setNumberProperty("_beginValue", value, 0);
  }

  get endValue(): number {
    return this._endValue;
  }
  set endValue(value: number) {
    this.setNumberProperty("_endValue", value, 50);
  }

  get originValue(): number {
    return this._originValue;
  }
  set originValue(value: number) {
    this.setNumberProperty("_originValue", value, 0);
  }

  get divisionCount(): number {
    return this._divisionCount;
  }
  set divisionCount(value: number) {
    this.setNumberProperty("_divisionCount", value, 5);
  }

  get subDivisionCount(): number {
    return this._subDivisionCount;
  }
  set subDivisionCount(value: number) {
    this.setNumberProperty("_subDivisionCount", value, 5);
  }

  get barMode(): number {
    return this._barMode;
  }
  set barMode(value: number) {
    this.setNumberProperty("_barMode", value, 0);
  }

  get scaleMode(): number {
    return this._scaleMode;
  }
  set scaleMode(value: number) {
    this.setNumberProperty("_scaleMode", value, 0);
  }

  get orientation(): number {
    return this._orientation;
  }
  set orientation(value: number) {
    this.setNumberProperty("_orientation", value, 0);
  }

  get showValue(): boolean {
    return this._showValue;
  }
  set showValue(value: boolean) {
    this.setBooleanProperty("_showValue", value);
  }

  get valuePosition(): number {
    return this._valuePosition;
  }
  set valuePosition(value: number) {
    this.setNumberProperty("_valuePosition", value, 0);
  }

  get labelColor(): string {
    return this._labelColor;
  }
  set labelColor(value: string) {
    this.setStringProperty("_labelColor", value, "#20242a");
  }

  get scaleBackgroundColor(): string {
    return this._scaleBackgroundColor;
  }
  set scaleBackgroundColor(value: string) {
    this.setStringProperty("_scaleBackgroundColor", value, "#6f7179");
  }

  get scaleForegroundColor(): string {
    return this._scaleForegroundColor;
  }
  set scaleForegroundColor(value: string) {
    this.setStringProperty("_scaleForegroundColor", value, "#86bd28");
  }

  get tickColor(): string {
    return this._tickColor;
  }
  set tickColor(value: string) {
    this.setStringProperty("_tickColor", value, "#6f7179");
  }

  get labelFont(): GaugeFont | undefined {
    return this._labelFont;
  }
  set labelFont(value: GaugeFont | undefined) {
    this._labelFont = value;
    this.render();
  }

  connectedCallback(): void {
    this._isConnected = true;
    super.connectedCallback();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue)
      return;

    const propertyName = fromKebabCase(name);
    const type = gaugeProperties[propertyName as keyof typeof gaugeProperties];
    if (type === undefined)
      return;

    this.applyAttribute(propertyName, type, newValue);
  }

  ready(): void {
    this.render();
  }

  private setNumberProperty(field: string, value: number, fallback: number): void {
    const parsed = Number(value);
    const next = Number.isFinite(parsed) ? parsed : fallback;
    const fields = this as unknown as Record<string, number>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.render();
  }

  private setBooleanProperty(field: string, value: boolean): void {
    const next = value !== false && value !== null && value !== undefined;
    const fields = this as unknown as Record<string, boolean>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.render();
  }

  private setStringProperty(field: string, value: string, fallback: string): void {
    const next = value == null || value === "" ? fallback : String(value);
    const fields = this as unknown as Record<string, string>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.render();
  }

  private applyAttribute(propertyName: string, type: unknown, value: string | null): void {
    if (type === Boolean) {
      (this as unknown as Record<string, boolean>)[propertyName] = value !== null;
    } else if (type === Number) {
      (this as unknown as Record<string, number>)[propertyName] = value == null ? Number.NaN : Number(value);
    } else if (type === Object) {
      (this as unknown as Record<string, unknown>)[propertyName] = value ? JSON.parse(value) : undefined;
    } else {
      (this as unknown as Record<string, string | null>)[propertyName] = value;
    }
  }

  private render(): void {
    if (!this._isConnected)
      return;

    const svg = this.shadowRoot?.getElementById("gauge");
    if (!(svg instanceof SVGSVGElement))
      return;

    const begin = this.beginValue;
    const end = this.endValue === begin ? begin + 1 : this.endValue;
    const range = end - begin;
    const divisionCount = Math.max(1, Math.round(this.divisionCount));
    const subDivisionCount = Math.max(0, Math.round(this.subDivisionCount));
    const value = clamp(this.value, Math.min(begin, end), Math.max(begin, end));
    const fillLevel = Number.isFinite(this.fillLevel) ? this.fillLevel : value;
    const fillTarget = clamp(fillLevel, Math.min(begin, end), Math.max(begin, end));
    const origin = clamp(this.originValue, Math.min(begin, end), Math.max(begin, end));
    const labelStyle = this.getLabelStyle();

    const majorTicks = this.renderMajorTicks(begin, range, divisionCount, subDivisionCount, labelStyle);
    const fill = this.showFillLevel
      ? this.renderFillArc(origin, fillTarget, begin, range)
      : "";

    svg.innerHTML = `
      <defs>
        <radialGradient id="hmi-gauge-knob" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stop-color="#6d6f78"></stop>
          <stop offset="48%" stop-color="#42444c"></stop>
          <stop offset="100%" stop-color="#08090c"></stop>
        </radialGradient>
        <linearGradient id="hmi-gauge-bevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f7f8fb"></stop>
          <stop offset="100%" stop-color="#d8dbe1"></stop>
        </linearGradient>
      </defs>
      <path d="${arcPath(50, 55, 40, startAngle, startAngle + sweepAngle)}"
            fill="none" stroke="url(#hmi-gauge-bevel)" stroke-width="18"
            stroke-linecap="butt"></path>
      <path d="${arcPath(50, 55, 32, startAngle, startAngle + sweepAngle)}"
            fill="none" stroke="${escapeAttribute(this.scaleBackgroundColor)}"
            stroke-width="7.5" stroke-linecap="butt"></path>
      ${fill}
      ${majorTicks}
      <circle cx="50" cy="55" r="22" fill="#c9ccd3"></circle>
      <circle cx="50" cy="55" r="20" fill="url(#hmi-gauge-knob)"></circle>
      ${this.showValue ? this.renderValue(value) : ""}
    `;
  }

  private renderMajorTicks(
    begin: number,
    range: number,
    divisionCount: number,
    subDivisionCount: number,
    labelStyle: string,
  ): string {
    const parts: string[] = [];
    for (let division = 0; division <= divisionCount; division++) {
      const angle = valueToAngle(division / divisionCount);
      parts.push(this.renderTick(angle, 35, 38, 0.7));

      const value = begin + range * (division / divisionCount);
      const labelPoint = polarPoint(50, 55, 44.5, angle);
      parts.push(
        `<text x="${formatNumber(labelPoint.x)}" y="${formatNumber(labelPoint.y)}" ${labelStyle}>${formatLabel(value)}</text>`,
      );

      if (division === divisionCount)
        continue;

      for (let subDivision = 1; subDivision < subDivisionCount; subDivision++) {
        const subRatio = (division + subDivision / subDivisionCount) / divisionCount;
        parts.push(this.renderTick(valueToAngle(subRatio), 33.5, 36.5, 0.45));
      }
    }

    return parts.join("");
  }

  private renderTick(angle: number, innerRadius: number, outerRadius: number, width: number): string {
    const inner = polarPoint(50, 55, innerRadius, angle);
    const outer = polarPoint(50, 55, outerRadius, angle);
    return `<line x1="${formatNumber(inner.x)}" y1="${formatNumber(inner.y)}"
      x2="${formatNumber(outer.x)}" y2="${formatNumber(outer.y)}"
      stroke="${escapeAttribute(this.tickColor)}" stroke-width="${width}" stroke-linecap="butt"></line>`;
  }

  private renderFillArc(origin: number, fillTarget: number, begin: number, range: number): string {
    const originRatio = (origin - begin) / range;
    const targetRatio = (fillTarget - begin) / range;
    const from = valueToAngle(Math.min(originRatio, targetRatio));
    const to = valueToAngle(Math.max(originRatio, targetRatio));
    const pointerAngle = valueToAngle(targetRatio);
    const pointer = this.renderPointer(pointerAngle);

    if (Math.abs(to - from) < 0.001)
      return pointer;

    return `
      <path d="${arcPath(50, 55, 32, from, to)}"
            fill="none" stroke="${escapeAttribute(this.scaleForegroundColor)}"
            stroke-width="7.5" stroke-linecap="butt"></path>
      ${pointer}`;
  }

  private renderPointer(angle: number): string {
    const point = polarPoint(50, 55, 32, angle);
    const left = polarPoint(point.x, point.y, 3.8, angle - 90);
    const right = polarPoint(point.x, point.y, 3.8, angle + 90);
    const tip = polarPoint(50, 55, 38, angle);
    return `<path d="M ${formatNumber(left.x)} ${formatNumber(left.y)}
      L ${formatNumber(tip.x)} ${formatNumber(tip.y)}
      L ${formatNumber(right.x)} ${formatNumber(right.y)} Z"
      fill="${escapeAttribute(this.scaleForegroundColor)}"></path>`;
  }

  private renderValue(value: number): string {
    const y = this.valuePosition === 1 ? 48 : 55;
    const font = this.labelFont;
    const family = font?.name ?? "Arial, Helvetica, sans-serif";
    const weight = font?.bold ? "700" : "400";
    const style = font?.italic ? "italic" : "normal";

    return `<text x="50" y="${y}"
      fill="${escapeAttribute(this.scaleForegroundColor)}"
      style="font-family: ${escapeAttribute(family)}; font-size: 15px; font-weight: ${weight}; font-style: ${style}; stroke: none;">${formatLabel(value)}</text>`;
  }

  private getLabelStyle(): string {
    const font = this.labelFont;
    const size = font?.size ?? 6;
    const family = font?.name ?? "Arial, Helvetica, sans-serif";
    const weight = font?.bold ? "700" : "400";
    const style = font?.italic ? "italic" : "normal";
    const decoration = font?.underline
      ? "underline"
      : font?.strikethrough
        ? "line-through"
        : "none";

    return `fill="${escapeAttribute(this.labelColor)}" style="font-family: ${escapeAttribute(family)}; font-size: ${formatNumber(size)}px; font-weight: ${weight}; font-style: ${style}; text-decoration: ${decoration};"`;
  }
}

function arcPath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const startPoint = polarPoint(cx, cy, radius, start);
  const endPoint = polarPoint(cx, cy, radius, end);
  const largeArc = Math.abs(end - start) > 180 ? 1 : 0;
  const sweep = end >= start ? 1 : 0;
  return [
    "M",
    formatNumber(startPoint.x),
    formatNumber(startPoint.y),
    "A",
    formatNumber(radius),
    formatNumber(radius),
    "0",
    largeArc.toString(),
    sweep.toString(),
    formatNumber(endPoint.x),
    formatNumber(endPoint.y),
  ].join(" ");
}

function polarPoint(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function valueToAngle(ratio: number): number {
  return startAngle + clamp(ratio, 0, 1) * sweepAngle;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/\.?0+$/, "");
}

function formatLabel(value: number): string {
  return Math.abs(value % 1) < 0.001 ? Math.round(value).toString() : formatNumber(value);
}

function toKebabCase(value: string): string {
  return value.replace(/([A-Z])/g, (_, character: string) => `-${character.toLowerCase()}`);
}

function fromKebabCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, character: string) => character.toUpperCase());
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

customElement("hmi-gauge")(HmiGauge);
