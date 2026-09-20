const trendControlProperties = {
  controlName: String,
  typeName: String,
  chartTitle: String,
  pens: String,
  displayChartTitle: String,
  showToolbar: String,
  toolbarButtonSize: String,
  showStatusBar: String,
  displayPenIcons: String,
  displayValueBar: String,
  displayScrollMechanism: String,
  chartLiveMode: String,
  autoScale: String,
  xAxisScaleVisible: String,
  xAxisAlignment: String,
  xAxisLabel: String,
  xAxisDateVisible: String,
  xAxisTimeSpan: String,
  xAxisTimeSpanUnit: String,
  xAxisGridVisible: String,
  majorGridVisible: String,
  minorGridVisible: String,
  yAxisScaleVisible: String,
  yAxisAlignment: String,
  yAxisLabel: String,
  yAxisGridVisible: String,
  showPercentageAxis: String,
  percentageAxisAlignment: String,
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
  fill?: boolean;
  fillColor?: string;
  lowerLimitColoring?: boolean;
  lowerLimit?: number;
  lowerLimitColor?: string;
  upperLimitColoring?: boolean;
  upperLimit?: number;
  upperLimitColor?: string;
  marker?: string;
  markerColor?: string;
  markerSize?: number;
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
    const configuredToolbarButtonSize = readNumberAttribute(this, "toolbar-button-size", 28);
    const toolbarButtonSize = Math.max(1, configuredToolbarButtonSize === 0 ? 28 : configuredToolbarButtonSize);
    const showStatusBar = readBooleanAttribute(this, "show-status-bar", false);
    const displayPenIcons = readBooleanAttribute(this, "display-pen-icons", true);
    const displayValueBar = readBooleanAttribute(this, "display-value-bar", false);
    const displayScrollMechanism = readBooleanAttribute(this, "display-scroll-mechanism", false);
    const chartLiveMode = readBooleanAttribute(this, "chart-live-mode", false);
    const autoScale = readBooleanAttribute(this, "auto-scale", false);
    const xAxisVisible = readBooleanAttribute(this, "x-axis-scale-visible", true);
    const xAxisAlignment = this.getAttribute("x-axis-alignment")?.toLowerCase() === "top" ? "top" : "bottom";
    const xAxisLabel = this.getAttribute("x-axis-label") ?? "";
    const xAxisDateVisible = readBooleanAttribute(this, "x-axis-date-visible", true);
    const xAxisTimeSpan = readDurationMilliseconds(
      readNumberAttribute(this, "x-axis-time-span", 63_000),
      this.getAttribute("x-axis-time-span-unit"),
    );
    const xAxisGridVisible = readBooleanAttribute(this, "x-axis-grid-visible", true);
    const majorGridVisible = readBooleanAttribute(this, "major-grid-visible", true);
    const minorGridVisible = readBooleanAttribute(this, "minor-grid-visible", true);
    const yAxisVisible = readBooleanAttribute(this, "y-axis-scale-visible", true);
    const yAxisAlignment = this.getAttribute("y-axis-alignment")?.toLowerCase() === "right" ? "right" : "left";
    const yAxisLabel = this.getAttribute("y-axis-label") ?? "";
    const yAxisGridVisible = readBooleanAttribute(this, "y-axis-grid-visible", true);
    const showPercentageAxis = readBooleanAttribute(this, "show-percentage-axis", false);
    const percentageAxisAlignment = this.getAttribute("percentage-axis-alignment")?.toLowerCase() === "left" ? "left" : "right";
    const chartTitle = this.getAttribute("chart-title") || this._controlName || this._typeName;
    const labels = createTimeLabels(new Date(Date.now() - xAxisTimeSpan), xAxisDateVisible, xAxisTimeSpan);
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
          min-height: var(--hmi-trend-toolbar-button-size, ${toCss(toolbarButtonSize)}px);
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          color: #20242a;
          background: var(--hmi-trend-toolbar-background, transparent);
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
          height: var(--hmi-trend-toolbar-button-size, ${toCss(toolbarButtonSize)}px);
        }

        .pen-icon {
          width: calc(var(--hmi-trend-toolbar-button-size, ${toCss(toolbarButtonSize)}px) * 0.7);
          height: calc(var(--hmi-trend-toolbar-button-size, ${toCss(toolbarButtonSize)}px) * 0.33);
          flex: 0 0 calc(var(--hmi-trend-toolbar-button-size, ${toCss(toolbarButtonSize)}px) * 0.7);
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
          ${yAxisAlignment}: -4.4em;
          transform: translateY(50%);
          text-align: ${yAxisAlignment === "left" ? "right" : "left"};
          width: 3.6em;
          color: var(--hmi-trend-y-axis-color, ${escapeCss(foregroundColor)});
        }

        .percentage-axis-line {
          position: absolute;
          top: 0;
          bottom: 0;
          ${percentageAxisAlignment}: 0;
          border-${percentageAxisAlignment}: 1px solid var(--hmi-trend-percentage-axis-color, ${escapeCss(foregroundColor)});
          pointer-events: none;
        }

        .percentage-label {
          ${percentageAxisAlignment}: -4.4em;
          transform: translateY(50%);
          width: 3.6em;
          color: var(--hmi-trend-percentage-axis-color, ${escapeCss(foregroundColor)});
          text-align: ${percentageAxisAlignment === "left" ? "right" : "left"};
        }

        .value-bar {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: var(--hmi-trend-value-bar-width, 1px);
          transform: translateX(-50%);
          background: var(--hmi-trend-value-bar-color, ${escapeCss(foregroundColor)});
          pointer-events: none;
        }

        .x-label {
          ${xAxisAlignment}: calc(100% + 0.9em);
          transform: translateX(-50%);
          text-align: center;
          min-width: 5.2em;
          color: var(--hmi-trend-x-axis-color, ${escapeCss(foregroundColor)});
        }

        .x-axis-title {
          position: absolute;
          ${xAxisAlignment}: calc(100% + 2.8em);
          left: 50%;
          transform: translateX(-50%);
          color: var(--hmi-trend-x-axis-color, ${escapeCss(foregroundColor)});
          white-space: nowrap;
        }

        .y-axis-title {
          position: absolute;
          top: 50%;
          ${yAxisAlignment}: -7.1em;
          transform: translateY(-50%) rotate(${yAxisAlignment === "left" ? -90 : 90}deg);
          color: var(--hmi-trend-y-axis-color, ${escapeCss(foregroundColor)});
          white-space: nowrap;
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
            ${renderGrid(xAxisGridVisible, yAxisGridVisible, majorGridVisible, minorGridVisible)}
            ${xAxisVisible ? `<line x1="0" y1="${xAxisAlignment === "top" ? 0 : 100}" x2="100" y2="${xAxisAlignment === "top" ? 0 : 100}" stroke="var(--hmi-trend-x-axis-color, #444850)" stroke-width="0.55"></line>` : ""}
            ${yAxisVisible ? `<line x1="${yAxisAlignment === "right" ? 100 : 0}" y1="0" x2="${yAxisAlignment === "right" ? 100 : 0}" y2="100" stroke="var(--hmi-trend-y-axis-color, #444850)" stroke-width="0.55"></line>` : ""}
            ${renderPens(visiblePens, minimumValue, maximumValue)}
          </svg>
          ${yAxisVisible ? renderYLabels(minimumValue, maximumValue, decimalPlaces) : ""}
          ${showPercentageAxis ? `<div class="percentage-axis-line" aria-hidden="true"></div>${renderPercentageLabels()}` : ""}
          ${displayValueBar ? `<div class="value-bar" aria-hidden="true"></div>` : ""}
          ${xAxisVisible ? renderXLabels(labels) : ""}
          ${xAxisVisible && xAxisLabel ? `<span class="axis-label x-axis-title">${escapeHtml(xAxisLabel)}</span>` : ""}
          ${yAxisVisible && yAxisLabel ? `<span class="axis-label y-axis-title">${escapeHtml(yAxisLabel)}</span>` : ""}
        </div>
        ${displayScrollMechanism ? `<div class="scrollbar"><div class="scroll-thumb"></div></div>` : ""}
      </div>`;
  }
}

function renderGrid(
  verticalVisible: boolean,
  horizontalVisible: boolean,
  majorVisible: boolean,
  minorVisible: boolean,
): string {
  const lines: string[] = [];
  if (horizontalVisible) {
    for (let index = 0; index <= 10; index++) {
      const major = index % 2 === 0;
      if ((major && !majorVisible) || (!major && !minorVisible)) continue;
      const y = index * 10;
      lines.push(`<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="var(--hmi-trend-${major ? "major" : "minor"}-grid-color, ${major ? "#c8c8c8" : "#dedede"})" stroke-width="${major ? "0.42" : "0.25"}"></line>`);
    }
  }
  if (verticalVisible) {
    for (let index = 0; index <= 7; index++) {
      const major = index % 2 === 0;
      if ((major && !majorVisible) || (!major && !minorVisible)) continue;
      const x = (index / 7) * 100;
      lines.push(`<line x1="${toCss(x)}" y1="0" x2="${toCss(x)}" y2="100" stroke="var(--hmi-trend-${major ? "major" : "minor"}-grid-color, ${major ? "#c8c8c8" : "#dedede"})" stroke-width="${major ? "0.42" : "0.25"}"></line>`);
    }
  }
  return lines.join("");
}

function renderYLabels(minimum: number, maximum: number, decimalPlaces: number): string {
  const labels: string[] = [];
  for (let index = 0; index <= 5; index++) {
    const ratio = index / 5;
    const value = maximum - (maximum - minimum) * ratio;
    labels.push(`<span class="axis-label y-label" style="top:${toCss(ratio * 100)}%">${escapeHtml(value.toFixed(decimalPlaces))}</span>`);
  }
  return labels.join("");
}

function renderPercentageLabels(): string {
  const labels: string[] = [];
  for (let index = 0; index <= 5; index++) {
    const ratio = index / 5;
    labels.push(`<span class="axis-label percentage-label" style="top:${toCss(ratio * 100)}%">${100 - index * 20}%</span>`);
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

function createTimeLabels(start: Date, includeDate: boolean, timeSpanMilliseconds: number): TimeLabel[] {
  const labels: TimeLabel[] = [];
  for (let index = 0; index < 8; index++) {
    const date = new Date(start.getTime() + index * timeSpanMilliseconds / 7);
    labels.push(formatTimeLabel(date, includeDate));
  }
  return labels;
}

function readDurationMilliseconds(value: number, unit: string | null): number {
  const normalizedUnit = unit?.trim().toLowerCase();
  const multiplier = normalizedUnit === "seconds" || normalizedUnit === "second" || normalizedUnit === "s"
    ? 1_000
    : normalizedUnit === "minutes" || normalizedUnit === "minute" || normalizedUnit === "min"
      ? 60_000
      : normalizedUnit === "hours" || normalizedUnit === "hour" || normalizedUnit === "h"
        ? 3_600_000
        : normalizedUnit === "days" || normalizedUnit === "day" || normalizedUnit === "d"
          ? 86_400_000
          : 1;
  const duration = value * multiplier;
  return Number.isFinite(duration) ? Math.max(1, duration) : 63_000;
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
    const markerColor = pen.markerColor ?? color;
    const marker = pen.marker === undefined || pen.marker === "0"
      ? ""
      : renderMarker(pen, markerColor, 15, 7, markerRadius(pen, 3));
    const icon = displayIcons
      ? `<svg class="pen-icon" viewBox="0 0 30 14" aria-hidden="true"><line x1="1" y1="7" x2="29" y2="7" stroke="${escapeHtml(color)}" stroke-width="${toCss(clamp(pen.width ?? 2, 1, 8))}"${dashAttribute(pen.style)}></line>${marker}</svg>`
      : "";
    return `<div class="pen-chip">${icon}<span class="pen-name">${escapeHtml(label + unit)}</span></div>`;
  }).join("");
}

function renderPens(pens: readonly TrendPen[], minimumValue: number, maximumValue: number): string {
  return pens.map((pen, index) => {
    const color = normalizePenColor(pen.color, index);
    const width = clamp(pen.width ?? 2, 1, 8);
    const amplitude = Math.max(6, 24 - (index % 8) * 2);
    const points: Array<{ x: number; y: number; value: number }> = [];
    for (let point = 0; point <= 20; point++) {
      const x = point * 5;
      const y = 50 - Math.sin((point + index * 3) * 0.55) * amplitude + (index % 8) * 3;
      const clippedY = clamp(y, 3, 97);
      points.push({ x, y: clippedY, value: maximumValue - clippedY / 100 * (maximumValue - minimumValue) });
    }
    const pointText = points.map(point => `${toCss(point.x)},${toCss(point.y)}`).join(" ");
    const markerColor = pen.markerColor ?? color;
    const area = pen.fill === true
      ? `<polygon points="0,100 ${pointText} 100,100" fill="${escapeHtml(pen.fillColor ?? color)}" fill-opacity="0.3"></polygon>`
      : "";
    const markers = pen.marker === undefined || pen.marker === "0"
      ? ""
      : points.filter((_point, pointIndex) => pointIndex % 5 === 0)
        .map(point => renderMarker(pen, markerColor, point.x, point.y, markerRadius(pen, clamp(width + 1, 2, 5))))
        .join("");
    const line = hasLimitColoring(pen)
      ? points.slice(1).map((point, pointIndex) => {
        const previous = points[pointIndex]!;
        const segmentColor = trendSegmentColor(pen, color, (previous.value + point.value) / 2);
        return `<line x1="${toCss(previous.x)}" y1="${toCss(previous.y)}" x2="${toCss(point.x)}" y2="${toCss(point.y)}" stroke="${escapeHtml(segmentColor)}" stroke-width="${toCss(width)}" vector-effect="non-scaling-stroke"${dashAttribute(pen.style)}></line>`;
      }).join("")
      : `<polyline points="${pointText}" fill="none" stroke="${escapeHtml(color)}" stroke-width="${toCss(width)}" vector-effect="non-scaling-stroke"${dashAttribute(pen.style)}></polyline>`;
    return `${area}${line}${markers}`;
  }).join("");
}

function hasLimitColoring(pen: TrendPen): boolean {
  return pen.lowerLimitColoring === true && pen.lowerLimit !== undefined && pen.lowerLimitColor !== undefined
    || pen.upperLimitColoring === true && pen.upperLimit !== undefined && pen.upperLimitColor !== undefined;
}

function trendSegmentColor(pen: TrendPen, fallback: string, value: number): string {
  if (pen.lowerLimitColoring === true && pen.lowerLimit !== undefined && value < pen.lowerLimit)
    return pen.lowerLimitColor ?? fallback;
  if (pen.upperLimitColoring === true && pen.upperLimit !== undefined && value > pen.upperLimit)
    return pen.upperLimitColor ?? fallback;
  return fallback;
}

function renderMarker(pen: TrendPen, color: string, x: number, y: number, size: number): string {
  const marker = Number(pen.marker ?? 0);
  if (marker === 2 || marker === 5)
    return `<circle cx="${toCss(x)}" cy="${toCss(y)}" r="${toCss(size)}" fill="${escapeHtml(color)}"></circle>`;
  return `<rect x="${toCss(x - size)}" y="${toCss(y - size)}" width="${toCss(size * 2)}" height="${toCss(size * 2)}" fill="${escapeHtml(color)}"></rect>`;
}

function markerRadius(pen: TrendPen, fallback: number): number {
  return pen.markerSize === undefined ? fallback : clamp(pen.markerSize / 2, 1, 8);
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
      if (typeof source.fill === "boolean") pen.fill = source.fill;
      if (typeof source.fillColor === "string") pen.fillColor = source.fillColor;
      if (typeof source.lowerLimitColoring === "boolean") pen.lowerLimitColoring = source.lowerLimitColoring;
      if (typeof source.lowerLimit === "number" && Number.isFinite(source.lowerLimit)) pen.lowerLimit = source.lowerLimit;
      if (typeof source.lowerLimitColor === "string") pen.lowerLimitColor = source.lowerLimitColor;
      if (typeof source.upperLimitColoring === "boolean") pen.upperLimitColoring = source.upperLimitColoring;
      if (typeof source.upperLimit === "number" && Number.isFinite(source.upperLimit)) pen.upperLimit = source.upperLimit;
      if (typeof source.upperLimitColor === "string") pen.upperLimitColor = source.upperLimitColor;
      if (typeof source.marker === "string") pen.marker = source.marker;
      if (typeof source.markerColor === "string") pen.markerColor = source.markerColor;
      if (typeof source.markerSize === "number" && Number.isFinite(source.markerSize)) pen.markerSize = source.markerSize;
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
