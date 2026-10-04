const trendControlProperties = {
  controlName: String,
  typeName: String,
  chartTitle: String,
  chartStyle: String,
  windowBackgroundColor: String,
  pens: String,
  valueAxes: String,
  xValueAxes: String,
  trendWindows: String,
  timeAxes: String,
  displayChartTitle: String,
  showToolbar: String,
  toolbarAlignment: String,
  toolbarButtonSize: String,
  showStatusBar: String,
  displayPenIcons: String,
  useTrendNameAsLabel: String,
  displayValueBar: String,
  useGraphicValueBar: String,
  showValueBarInXAxis: String,
  displayStatisticRulers: String,
  useGraphicStatisticRulers: String,
  statisticRulerColor: String,
  statisticRulerWidth: String,
  displayScrollMechanism: String,
  chartLiveMode: String,
  autoScale: String,
  xAxisScaleVisible: String,
  xAxisInTrendColor: String,
  xAxisAlignment: String,
  xAxisLabel: String,
  xAxisDateVisible: String,
  xAxisDateFormat: String,
  xAxisFlipped: String,
  timeFormat: String,
  timeBase: String,
  projectTimeZone: String,
  displayMilliseconds: String,
  xAxisTimeSpan: String,
  xAxisTimeSpanUnit: String,
  xAxisGridVisible: String,
  majorGridVisible: String,
  minorGridVisible: String,
  gridInTrendColor: String,
  yAxisScaleVisible: String,
  yAxisInTrendColor: String,
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
  label?: string;
  trendWindowName?: string;
  renderWindowName?: string;
  timeAxisName?: string;
  color?: string;
  visible?: boolean;
  width?: number;
  lineType?: number;
  style?: number;
  fill?: boolean;
  fillColor?: string;
  lowerLimitColoring?: boolean;
  lowerLimit?: number;
  lowerLimitColor?: string;
  upperLimitColoring?: boolean;
  upperLimit?: number;
  upperLimitColor?: string;
  uncertainColoring?: boolean;
  uncertainColor?: string;
  showAlarms?: boolean;
  valueAlignment?: "Top" | "Center" | "Bottom";
  marker?: string;
  markerColor?: string;
  markerSize?: number;
  minimum?: number;
  maximum?: number;
  axisScaleType?: number;
  exponentialFormat?: boolean;
  autoDecimalPlaces?: boolean;
  decimalPlaces?: number;
  valueAxisName?: string;
  valueAxisVisible?: boolean;
  valueAxisColor?: string;
  valueAxisInTrendColor?: boolean;
  valueAxisAlignment?: "Left" | "Right";
  valueAxisLabel?: string;
  unit?: string;
}

interface NumericXAxis {
  name?: string;
  trendWindowName?: string;
  label?: string;
  minimum?: number;
  maximum?: number;
  visible?: boolean;
  autoRange?: boolean;
  divisionCount?: number;
  decimalPlaces?: number;
  scaleType?: number;
  exponentialFormat?: boolean;
  color?: string;
  alignment?: string;
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
    const windowBackgroundColor = normalizeCssColor(this.getAttribute("window-background-color"), backgroundColor, true);
    const foregroundColor = normalizeTransparent(computed.color, "#5a5d64");
    const borderColor = normalizeTransparent(computed.borderTopColor, "#a8acb2");
    const rawBorderWidth = parseFloat(computed.borderTopWidth);
    const borderWidth = Number.isFinite(rawBorderWidth) ? rawBorderWidth : 0;
    const configuredValueAxes = parsePens(this.getAttribute("value-axes"));
    const axesByName = new Map(configuredValueAxes.map(axis => [axis.valueAxisName, axis]));
    const pens = parsePens(this.getAttribute("pens")).map(pen => {
      const axis = pen.valueAxisName ? axesByName.get(pen.valueAxisName) : undefined;
      return axis ? { ...pen, ...axis, number: pen.number, trendWindowName: pen.trendWindowName, timeAxisName: pen.timeAxisName, renderWindowName: axis.trendWindowName ?? pen.trendWindowName } : pen;
    });
    const visiblePens = pens.filter(pen => pen.visible !== false);
    const trendWindows = parseTrendWindows(this.getAttribute("trend-windows"));
    const firstPen = visiblePens[0] ?? pens[0];
    const xyPlot = this.getAttribute("chart-style") === "XYPlot";
    const xValueAxes = xyPlot ? parseXValueAxes(this.getAttribute("x-value-axes")) : [];
    const timeAxes = xyPlot ? [] : parseTimeAxes(this.getAttribute("time-axes"));
    const topTimeAxisCount = timeAxes.filter(axis => axis.attributes["x-axis-scale-visible"] !== "false" && axis.attributes["x-axis-alignment"]?.toLowerCase() === "top").length
      + xValueAxes.filter(axis => axis.visible !== false && axis.alignment === "Top").length;
    const bottomTimeAxisCount = timeAxes.filter(axis => axis.attributes["x-axis-scale-visible"] !== "false" && axis.attributes["x-axis-alignment"]?.toLowerCase() !== "top").length
      + xValueAxes.filter(axis => axis.visible !== false && axis.alignment !== "Top").length;
    const selectedTimeAxis = timeAxes.find(axis => axis.name === pens[0]?.timeAxisName) ?? timeAxes[0];
    const timeSource = { getAttribute: (name: string) => selectedTimeAxis?.attributes[name] ?? this.getAttribute(name) };
    const axisTrendColor = pens.length > 0 ? normalizePenColor(pens[0].color, 0) : undefined;
    const xAxisInTrendColor = readBooleanAttribute(timeSource, "x-axis-in-trend-color", false);
    const yAxisInTrendColor = readBooleanAttribute(this, "y-axis-in-trend-color", false);
    const minimumValue = readNumberAttribute(this, "minimum-value", firstPen?.minimum ?? 0);
    const maximumCandidate = readNumberAttribute(this, "maximum-value", firstPen?.maximum ?? 100);
    const maximumValue = maximumCandidate === minimumValue ? minimumValue + 1 : maximumCandidate;
    const axisScaleType = firstPen?.axisScaleType ?? 0;
    const exponentialFormat = firstPen?.exponentialFormat === true;
    const configuredDecimalPlaces = clamp(Math.trunc(readNumberAttribute(this, "y-axis-decimal-places", firstPen?.decimalPlaces ?? 0)), 0, 12);
    const decimalPlaces = firstPen?.autoDecimalPlaces === true
      ? automaticDecimalPlaces(minimumValue, maximumValue, axisScaleType)
      : configuredDecimalPlaces;
    const displayChartTitle = readBooleanAttribute(this, "display-chart-title", false);
    const showToolbar = readBooleanAttribute(this, "show-toolbar", true);
    const toolbarAtBottom = this.getAttribute("toolbar-alignment")?.toLowerCase() === "bottom";
    const configuredToolbarButtonSize = readNumberAttribute(this, "toolbar-button-size", 28);
    const toolbarButtonSize = Math.max(1, configuredToolbarButtonSize === 0 ? 28 : configuredToolbarButtonSize);
    const showStatusBar = readBooleanAttribute(this, "show-status-bar", false);
    const displayPenIcons = readBooleanAttribute(this, "display-pen-icons", true);
    const useTrendNameAsLabel = readBooleanAttribute(this, "use-trend-name-as-label", true);
    const displayValueBar = readBooleanAttribute(this, "display-value-bar", false);
    const useGraphicValueBar = readBooleanAttribute(this, "use-graphic-value-bar", false);
    const valueBarColor = useGraphicValueBar
      ? normalizeTransparent(this.getAttribute("value-bar-color") ?? "", "#000000")
      : "#000000";
    const valueBarWidth = useGraphicValueBar
      ? Math.max(1, readNumberAttribute(this, "value-bar-width", 1))
      : 1;
    const showValueBarInXAxis = readBooleanAttribute(this, "show-value-bar-in-x-axis", false);
    const displayStatisticRulers = readBooleanAttribute(this, "display-statistic-rulers", false);
    const useGraphicStatisticRulers = readBooleanAttribute(this, "use-graphic-statistic-rulers", false);
    const statisticRulerColor = useGraphicStatisticRulers
      ? normalizeTransparent(this.getAttribute("statistic-ruler-color") ?? "", "#000000")
      : "#000000";
    const statisticRulerWidth = useGraphicStatisticRulers
      ? Math.max(1, readNumberAttribute(this, "statistic-ruler-width", 1))
      : 1;
    const displayScrollMechanism = readBooleanAttribute(this, "display-scroll-mechanism", false);
    const chartLiveMode = readBooleanAttribute(this, "chart-live-mode", false);
    const autoScale = readBooleanAttribute(this, "auto-scale", false);
    const xAxisVisible = readBooleanAttribute(timeSource, "x-axis-scale-visible", true);
    const xAxisAlignment = timeSource.getAttribute("x-axis-alignment")?.toLowerCase() === "top" ? "top" : "bottom";
    const xAxisLabel = timeSource.getAttribute("x-axis-label") ?? "";
    const xAxisDateVisible = readBooleanAttribute(timeSource, "x-axis-date-visible", true);
    const xAxisFlipped = readBooleanAttribute(this, "x-axis-flipped", false);
    const timeFormat = timeSource.getAttribute("time-format")?.toLowerCase() === "twentyfourhour"
      ? "twenty-four-hour"
      : "twelve-hour";
    const xAxisTimeSpan = readDurationMilliseconds(
      readNumberAttribute(timeSource, "x-axis-time-span", 63_000),
      timeSource.getAttribute("x-axis-time-span-unit"),
    );
    const xAxisGridVisible = readBooleanAttribute(this, "x-axis-grid-visible", true);
    const majorGridVisible = readBooleanAttribute(this, "major-grid-visible", true);
    const minorGridVisible = readBooleanAttribute(this, "minor-grid-visible", true);
    const gridInTrendColor = readBooleanAttribute(this, "grid-in-trend-color", false);
    const yAxisVisible = readBooleanAttribute(this, "y-axis-scale-visible", true);
    const yAxisAlignment = this.getAttribute("y-axis-alignment")?.toLowerCase() === "right" ? "right" : "left";
    const yAxisLabel = this.getAttribute("y-axis-label") ?? "";
    const namedValueAxes = collectValueAxes(pens, configuredValueAxes);
    const leftAxisCount = namedValueAxes.filter(pen => pen.valueAxisAlignment !== "Right" && pen.valueAxisVisible !== false).length;
    const rightAxisCount = namedValueAxes.filter(pen => pen.valueAxisAlignment === "Right" && pen.valueAxisVisible !== false).length;
    const yAxisGridVisible = readBooleanAttribute(this, "y-axis-grid-visible", true);
    const showPercentageAxis = readBooleanAttribute(this, "show-percentage-axis", false);
    const percentageAxisAlignment = this.getAttribute("percentage-axis-alignment")?.toLowerCase() === "left" ? "left" : "right";
    const chartTitle = this.getAttribute("chart-title") || this._controlName || this._typeName;
    const displayMilliseconds = readBooleanAttribute(timeSource, "display-milliseconds", false);
    const xAxisDateFormat = timeSource.getAttribute("x-axis-date-format");
    const locale = this.getAttribute("lang") || (typeof document === "undefined" ? undefined : document.documentElement.lang) || undefined;
    const timeZone = resolveTimeZone(this);
    const labels = createTimeLabels(new Date(Date.now() - xAxisTimeSpan), xAxisDateVisible, xAxisTimeSpan, timeFormat, displayMilliseconds, xAxisDateFormat, locale, timeZone ?? undefined);
    if (xAxisFlipped) labels.reverse();
    const plotTop = displayChartTitle ? (showToolbar && !toolbarAtBottom ? 29 : 15) : (showToolbar && !toolbarAtBottom ? 23 : 7);
    const plotBottom = (displayScrollMechanism ? 22 : 16) + (showStatusBar ? 10 : 0) + (showToolbar && toolbarAtBottom ? 12 : 0);

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
          ${xAxisInTrendColor && axisTrendColor !== undefined ? `--hmi-trend-x-axis-color: ${escapeCss(axisTrendColor)};` : ""}
          ${!xAxisInTrendColor && selectedTimeAxis ? `--hmi-trend-x-axis-color: ${selectedTimeAxis.color};` : ""}
          ${yAxisInTrendColor && axisTrendColor !== undefined ? `--hmi-trend-y-axis-color: ${escapeCss(axisTrendColor)};` : ""}
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
          top: ${toolbarAtBottom ? "auto" : `${displayChartTitle ? 11 : 3}%`};
          bottom: ${toolbarAtBottom ? `${showStatusBar ? 10 : 3}%` : "auto"};
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
          background: ${escapeCss(windowBackgroundColor)};
          ${namedValueAxes.length || timeAxes.length || xValueAxes.length ? "font-size: clamp(10px, 2vmin, 18px);" : ""}
          left: 10%;
          right: 2.5%;
          ${namedValueAxes.length ? `left: calc(2.5% + ${toCss(leftAxisCount * 4.4)}em); right: calc(2.5% + ${toCss(rightAxisCount * 4.4)}em);` : ""}
          top: ${plotTop}%;
          bottom: ${plotBottom}%;
          ${timeAxes.length || xValueAxes.length ? `top: calc(${plotTop}% + ${toCss(topTimeAxisCount * 3.6)}em); bottom: calc(${plotBottom}% + ${toCss(bottomTimeAxisCount * 3.6)}em);` : ""}
        }

        .window-layout {
          left: 2.5%; right: 2.5%; display: grid;
          top: ${plotTop}%; bottom: ${plotBottom}%;
          grid-template-rows: ${trendWindows.filter(window => window.visible).map(window => `${toCss(window.spacePortion)}fr`).join(" ") || "1fr"};
          gap: 1px;
        }
        .window-layout > hmi-trend-control { min-height: 0; min-width: 0; width: 100%; height: 100%; }

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

        .value-axis {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 4.4em;
          font-size: clamp(10px, 2vmin, 18px);
          border-right: 1px solid currentColor;
          pointer-events: none;
        }

        .value-axis.right { border-right: 0; border-left: 1px solid currentColor; }
        .value-axis .y-label { left: 0; right: auto; color: inherit; text-align: right; }
        .value-axis.right .y-label { left: 0.8em; text-align: left; }
        .value-axis-title { position: absolute; top: -1.4em; left: 0; color: inherit; white-space: nowrap; }

        .time-axis, .numeric-x-axis { position: absolute; left: 0; right: 0; height: 3.6em; color: inherit; }
        .time-axis.bottom, .numeric-x-axis.bottom { border-top: 1px solid currentColor; }
        .time-axis.top, .numeric-x-axis.top { border-bottom: 1px solid currentColor; }
        .time-axis .x-label, .numeric-x-axis .x-label { top: 0.35em; bottom: auto; color: inherit; }
        .time-axis.top .x-label, .numeric-x-axis.top .x-label { top: auto; bottom: 0.35em; }
        .time-axis .x-axis-title, .numeric-x-axis .x-axis-title { top: 2.6em; bottom: auto; color: inherit; }
        .time-axis.top .x-axis-title, .numeric-x-axis.top .x-axis-title { top: auto; bottom: 2.6em; }

        .percentage-label {
          ${percentageAxisAlignment}: -4.4em;
          transform: translateY(50%);
          width: 3.6em;
          color: var(--hmi-trend-percentage-axis-color, ${escapeCss(foregroundColor)});
          text-align: ${percentageAxisAlignment === "left" ? "right" : "left"};
        }

        .value-bar {
          position: absolute;
          top: ${showValueBarInXAxis && xAxisVisible && xAxisAlignment === "top" ? "-2.4em" : "0"};
          bottom: ${showValueBarInXAxis && xAxisVisible && xAxisAlignment === "bottom" ? "-2.4em" : "0"};
          left: 50%;
          width: ${toCss(valueBarWidth)}px;
          transform: translateX(-50%);
          background: ${escapeCss(valueBarColor)};
          pointer-events: none;
        }

        .statistic-ruler {
          position: absolute;
          top: 0;
          bottom: 0;
          width: ${toCss(statisticRulerWidth)}px;
          transform: translateX(-50%);
          background: ${escapeCss(statisticRulerColor)};
          pointer-events: none;
        }

        .statistic-ruler.start { left: 35%; }
        .statistic-ruler.end { left: 65%; }

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
      <div class="frame"${selectedTimeAxis ? ` data-time-axis="${escapeHtml(selectedTimeAxis.name)}"` : ""}>
        ${displayChartTitle ? `<div class="title">${escapeHtml(chartTitle)}</div>` : ""}
        ${showToolbar ? `<div class="toolbar">${renderPenLegend(visiblePens, displayPenIcons, useTrendNameAsLabel)}</div>` : ""}
        ${showStatusBar ? `<div class="status">${chartLiveMode ? "LIVE" : "HISTORICAL"}${autoScale ? " · AUTO" : ""}</div>` : ""}
        ${trendWindows.length ? `<div class="plot window-layout">${renderTrendWindows(this, trendWindows, pens, configuredValueAxes, backgroundColor, foregroundColor)}</div>` : `<div class="plot">
          <svg class="grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            ${renderGrid(
              xAxisGridVisible,
              yAxisGridVisible,
              majorGridVisible,
              minorGridVisible,
              gridInTrendColor && firstPen !== undefined ? normalizePenColor(firstPen.color, 0) : undefined,
            )}
            ${xAxisVisible && !timeAxes.length && !xValueAxes.length ? `<line x1="0" y1="${xAxisAlignment === "top" ? 0 : 100}" x2="100" y2="${xAxisAlignment === "top" ? 0 : 100}" stroke="var(--hmi-trend-x-axis-color, #444850)" stroke-width="0.55"></line>` : ""}
            ${yAxisVisible && !namedValueAxes.length ? `<line x1="${yAxisAlignment === "right" ? 100 : 0}" y1="0" x2="${yAxisAlignment === "right" ? 100 : 0}" y2="100" stroke="var(--hmi-trend-y-axis-color, #444850)" stroke-width="0.55"></line>` : ""}
            ${xyPlot ? "" : renderPens(visiblePens, minimumValue, maximumValue, xAxisFlipped, configuredDecimalPlaces)}
          </svg>
          ${namedValueAxes.length ? renderValueAxes(namedValueAxes, pens, minimumValue, maximumValue, configuredDecimalPlaces, foregroundColor) : yAxisVisible ? renderYLabels(minimumValue, maximumValue, decimalPlaces, axisScaleType, exponentialFormat) : ""}
          ${showPercentageAxis ? `<div class="percentage-axis-line" aria-hidden="true"></div>${renderPercentageLabels()}` : ""}
          ${displayValueBar ? `<div class="value-bar" aria-hidden="true"></div>` : ""}
          ${displayStatisticRulers ? `<div class="statistic-ruler start" title="Statistics range start"></div><div class="statistic-ruler end" title="Statistics range end"></div>` : ""}
          ${xyPlot ? xValueAxes.length ? renderXValueAxes(xValueAxes, xAxisFlipped, foregroundColor) : `<span class="axis-label x-label" style="left:50%">X-axis range unavailable</span>` : timeAxes.length ? renderTimeAxes(timeAxes, pens, xAxisFlipped, locale, timeZone) : xAxisVisible ? timeZone === null ? `<span class="axis-label x-label" style="left:50%">Project time zone unavailable</span>` : renderXLabels(labels) : ""}
          ${xyPlot ? `<span class="axis-label" style="left:50%;top:50%">Function trend data not loaded</span>` : ""}
          ${!timeAxes.length && xAxisVisible && xAxisLabel ? `<span class="axis-label x-axis-title">${escapeHtml(xAxisLabel)}</span>` : ""}
          ${yAxisVisible && yAxisLabel && !namedValueAxes.length ? `<span class="axis-label y-axis-title">${escapeHtml(yAxisLabel)}</span>` : ""}
        </div>`}
        ${displayScrollMechanism ? `<div class="scrollbar"><div class="scroll-thumb"${xAxisFlipped && chartLiveMode ? ' style="margin-left: 0"' : ""}></div></div>` : ""}
      </div>`;
  }
}

interface TimeAxis {
  name: string;
  trendWindowName?: string;
  configuration: Record<string, unknown>;
  color: string;
  attributes: Record<string, string>;
}

function parseTimeAxes(value: string | null): TimeAxis[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const names = new Set<string>();
    return parsed.flatMap(entry => {
      if (!entry || typeof entry !== "object") return [];
      const source = entry as Record<string, unknown>;
      if (typeof source.name !== "string" || !source.name) return [];
      if (names.has(source.name)) return [];
      names.add(source.name);
      const attributes: Record<string, string> = {
        "x-axis-scale-visible": "true", "x-axis-date-visible": "true", "x-axis-in-trend-color": "false",
        "x-axis-alignment": "Bottom", "x-axis-label": "", "x-axis-date-format": "",
        "time-format": "TwelveHour", "display-milliseconds": "false",
        "x-axis-time-span": "63000", "x-axis-time-span-unit": "Milliseconds",
      };
      for (const [key, attribute] of [["visible", "x-axis-scale-visible"], ["showDate", "x-axis-date-visible"], ["inTrendColor", "x-axis-in-trend-color"], ["displayMilliseconds", "display-milliseconds"]]) {
        if (typeof source[key!] === "boolean") attributes[attribute!] = String(source[key!]);
      }
      for (const [key, attribute] of [["alignment", "x-axis-alignment"], ["label", "x-axis-label"], ["dateFormat", "x-axis-date-format"], ["timeFormat", "time-format"], ["timeSpanUnit", "x-axis-time-span-unit"]]) {
        if (typeof source[key!] === "string") attributes[attribute!] = source[key!] as string;
      }
      if (typeof source.timeSpan === "number" && Number.isFinite(source.timeSpan)) attributes["x-axis-time-span"] = String(source.timeSpan);
      for (const key of ["rangeType", "startTime", "endTime"]) {
        if (typeof source[key] === "string") attributes[key] = source[key] as string;
      }
      if (typeof source.refreshEnabled === "boolean") attributes.refreshEnabled = String(source.refreshEnabled);
      if (typeof source.measurementPoints === "number" && Number.isFinite(source.measurementPoints)) attributes.measurementPoints = String(source.measurementPoints);
      return [{ name: source.name, trendWindowName: typeof source.trendWindowName === "string" ? source.trendWindowName : undefined, configuration: source, color: normalizeCssColor(typeof source.color === "string" ? source.color : undefined, "#444850"), attributes }];
    });
  } catch { return []; }
}

interface TrendWindow {
  name: string;
  visible: boolean;
  spacePortion: number;
  backgroundColor?: string;
  attributes: Record<string, string>;
  colors: Record<string, string>;
}

function parseTrendWindows(value: string | null): TrendWindow[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap(entry => {
      if (!entry || typeof entry !== "object") return [];
      const source = entry as Record<string, unknown>;
      if (typeof source.name !== "string" || !source.name) return [];
      const attributes: Record<string, string> = {};
      for (const key of ["xAxisGridVisible", "yAxisGridVisible", "majorGridVisible", "minorGridVisible", "gridInTrendColor", "useGraphicValueBar", "useGraphicStatisticRulers"]) {
        if (typeof source[key] === "boolean") attributes[toKebabCase(key)] = String(source[key]);
      }
      for (const key of ["valueBarWidth", "statisticRulerWidth"]) {
        if (typeof source[key] === "number" && Number.isFinite(source[key])) attributes[toKebabCase(key)] = String(source[key]);
      }
      const colors: Record<string, string> = {};
      for (const key of ["majorGridColor", "minorGridColor", "valueBarColor", "statisticRulerColor"]) {
        if (typeof source[key] === "string") {
          const color = normalizeCssColor(source[key], "");
          if (color) { attributes[toKebabCase(key)] = color; colors[toKebabCase(key)] = color; }
        }
      }
      const sizeFactor = finiteNumber(source.sizeFactor, 0);
      const backgroundColor = typeof source.backgroundColor === "string" ? normalizeCssColor(source.backgroundColor, "") : undefined;
      return [{ name: source.name, visible: source.visible !== false, backgroundColor,
        spacePortion: sizeFactor > 0 ? sizeFactor : Math.max(1, finiteNumber(source.spacePortion, 1)), attributes, colors }];
    });
  } catch { return []; }
}

function renderTrendWindows(
  parent: HmiTrendControl, windows: readonly TrendWindow[], pens: readonly TrendPen[],
  axes: readonly TrendPen[], backgroundColor: string, foregroundColor: string,
): string {
  const defaultWindow = windows[0]!.name;
  const penWindow = (pen: TrendPen) => pen.renderWindowName ?? pen.trendWindowName ?? defaultWindow;
  const timeAxes = parseTimeAxes(parent.getAttribute("time-axes"));
  const xValueAxes = parseXValueAxes(parent.getAttribute("x-value-axes"));
  const timeAxisWindow = (axis: TimeAxis) => axis.trendWindowName
    ?? pens.find(pen => pen.timeAxisName === axis.name)?.renderWindowName
    ?? pens.find(pen => pen.timeAxisName === axis.name)?.trendWindowName ?? defaultWindow;
  const axisWindow = (axis: TrendPen) => axis.trendWindowName
    ?? pens.find(pen => pen.valueAxisName === axis.valueAxisName)?.renderWindowName
    ?? pens.find(pen => pen.valueAxisName === axis.valueAxisName)?.trendWindowName ?? defaultWindow;
  return windows.filter(window => window.visible).map(window => {
    const windowPens = pens.filter(pen => penWindow(pen) === window.name);
    const windowTimeAxes = timeAxes.filter(axis => timeAxisWindow(axis) === window.name);
    const windowAxes = axes.filter(axis => axisWindow(axis) === window.name || windowPens.some(pen => pen.valueAxisName === axis.valueAxisName))
      .map(axis => axisWindow(axis) === window.name ? axis : { ...axis, valueAxisVisible: false });
    const attributes: Record<string, string> = {};
    for (const name of [...HmiTrendControl.observedAttributes, "lang"]) {
      const value = parent.getAttribute(name);
      if (value !== null && name !== "trend-windows") attributes[name] = value;
    }
    Object.assign(attributes, window.attributes, {
      "control-name": window.name, "show-toolbar": "false", "show-status-bar": "false",
      "display-chart-title": "false", "display-scroll-mechanism": "false",
      pens: JSON.stringify(windowPens),
      "value-axes": JSON.stringify(windowAxes),
      "time-axes": JSON.stringify(windowTimeAxes.map(axis => axis.configuration)),
      "x-value-axes": JSON.stringify(xValueAxes.filter(axis => (axis.trendWindowName ?? defaultWindow) === window.name)),
    });
    if (window.backgroundColor) attributes["window-background-color"] = window.backgroundColor;
    if (axes.length && !windowAxes.length) attributes["y-axis-scale-visible"] = "false";
    if (timeAxes.length && !windowTimeAxes.length) attributes["x-axis-scale-visible"] = "false";
    const css = Object.entries(window.colors).map(([name, color]) => `--hmi-trend-${name}:${color};`).join("");
    const attributeText = Object.entries(attributes).map(([name, value]) => `${name}="${escapeHtml(value)}"`).join(" ");
    return `<hmi-trend-control data-trend-window="${escapeHtml(window.name)}" style="position:relative;display:block;background:${escapeHtml(window.backgroundColor || backgroundColor)};color:${escapeHtml(foregroundColor)};${css}" ${attributeText}></hmi-trend-control>`;
  }).join("");
}

function renderGrid(
  verticalVisible: boolean,
  horizontalVisible: boolean,
  majorVisible: boolean,
  minorVisible: boolean,
  trendColor: string | undefined,
): string {
  const lines: string[] = [];
  if (horizontalVisible) {
    for (let index = 0; index <= 10; index++) {
      const major = index % 2 === 0;
      if ((major && !majorVisible) || (!major && !minorVisible)) continue;
      const y = index * 10;
      const color = major && trendColor !== undefined
        ? escapeHtml(trendColor)
        : `var(--hmi-trend-${major ? "major" : "minor"}-grid-color, ${major ? "#c8c8c8" : "#dedede"})`;
      lines.push(`<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="${color}" stroke-width="${major ? "0.42" : "0.25"}"></line>`);
    }
  }
  if (verticalVisible) {
    for (let index = 0; index <= 7; index++) {
      const major = index % 2 === 0;
      if ((major && !majorVisible) || (!major && !minorVisible)) continue;
      const x = (index / 7) * 100;
      const color = major && trendColor !== undefined
        ? escapeHtml(trendColor)
        : `var(--hmi-trend-${major ? "major" : "minor"}-grid-color, ${major ? "#c8c8c8" : "#dedede"})`;
      lines.push(`<line x1="${toCss(x)}" y1="0" x2="${toCss(x)}" y2="100" stroke="${color}" stroke-width="${major ? "0.42" : "0.25"}"></line>`);
    }
  }
  return lines.join("");
}

function collectValueAxes(pens: readonly TrendPen[], configuredAxes: readonly TrendPen[]): TrendPen[] {
  const axes = new Map<string, TrendPen>();
  for (const pen of [...configuredAxes, ...pens]) {
    if (pen.valueAxisName && !axes.has(pen.valueAxisName)) axes.set(pen.valueAxisName, pen);
  }
  return [...axes.values()];
}

function parseXValueAxes(value: string | null): NumericXAxis[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap(entry => {
      if (!entry || typeof entry !== "object") return [];
      const source = entry as Record<string, unknown>;
      const axis: NumericXAxis = {};
      for (const key of ["name", "trendWindowName", "label", "color", "alignment"] as const)
        if (typeof source[key] === "string") axis[key] = source[key];
      for (const key of ["visible", "autoRange", "exponentialFormat"] as const)
        if (typeof source[key] === "boolean") axis[key] = source[key];
      for (const key of ["minimum", "maximum", "divisionCount", "decimalPlaces", "scaleType"] as const)
        if (typeof source[key] === "number" && Number.isFinite(source[key])) axis[key] = source[key];
      return [axis];
    });
  } catch { return []; }
}

function renderXValueAxes(axes: readonly NumericXAxis[], flipped: boolean, foregroundColor: string): string {
  const visibleAxes = axes.filter(axis => axis.visible !== false);
  let top = visibleAxes.filter(axis => axis.alignment === "Top").length;
  let bottom = visibleAxes.filter(axis => axis.alignment !== "Top").length;
  return visibleAxes.map(axis => {
    const alignment = axis.alignment === "Top" ? "top" : "bottom";
    const row = alignment === "top" ? --top : --bottom;
    const color = normalizeCssColor(axis.color, foregroundColor);
    let labels = `<span class="axis-label x-label" style="left:50%">${axis.autoRange === true ? "Automatic X range unavailable" : "X-axis range unavailable"}</span>`;
    if (axis.autoRange !== true && axis.minimum !== undefined && axis.maximum !== undefined) {
      const scaleType = axis.scaleType ?? 0;
      const supportedScale = scaleType === 0 || scaleType === 1 || scaleType === 2;
      const validRange = scaleType === 0 || scaleType === 1 && axis.minimum > 0 && axis.maximum > 0
        || scaleType === 2 && axis.minimum < 0 && axis.maximum < 0;
      if (!supportedScale || !validRange) {
        labels = `<span class="axis-label x-label" style="left:50%">${supportedScale ? "Invalid X-axis range" : "X-axis scaling unavailable"}</span>`;
      } else {
        const divisions = clamp(Math.trunc(axis.divisionCount ?? 5), 1, 100);
        const precision = axis.decimalPlaces === undefined ? automaticDecimalPlaces(axis.minimum, axis.maximum, scaleType)
          : clamp(Math.trunc(axis.decimalPlaces), 0, 12);
        labels = Array.from({ length: divisions + 1 }, (_, index) => {
          const ratio = index / divisions;
          const value = valueAtYAxisPosition((1 - ratio) * 100, axis.minimum!, axis.maximum!, scaleType);
          return `<span class="axis-label x-label" style="left:${toCss((flipped ? 1 - ratio : ratio) * 100)}%">${escapeHtml(formatAxisValue(value, precision, axis.exponentialFormat === true))}</span>`;
        }).join("");
      }
    }
    return `<div class="numeric-x-axis ${alignment}" data-x-value-axis="${escapeHtml(axis.name ?? "")}"${axis.trendWindowName ? ` data-trend-window="${escapeHtml(axis.trendWindowName)}"` : ""} style="${alignment}:-${toCss((row + 1) * 3.6)}em;color:${escapeHtml(color)}">${labels}${axis.label ? `<span class="x-axis-title">${escapeHtml(axis.label)}</span>` : ""}</div>`;
  }).join("");
}

function renderValueAxes(
  axes: readonly TrendPen[], pens: readonly TrendPen[],
  minimum: number, maximum: number, decimalPlaces: number, foregroundColor: string,
): string {
  const visibleAxes = axes.filter(axis => axis.valueAxisVisible !== false);
  let left = visibleAxes.filter(axis => axis.valueAxisAlignment !== "Right").length;
  let right = visibleAxes.filter(axis => axis.valueAxisAlignment === "Right").length;
  return visibleAxes.map(axis => {
    const alignment = axis.valueAxisAlignment === "Right" ? "right" : "left";
    // Earlier axes in WinCC's list are farther from the plot on their side.
    const column = alignment === "right" ? --right : --left;
    const trendPenIndex = axis.trendWindowName
      ? pens.findIndex(pen => (pen.renderWindowName ?? pen.trendWindowName) === axis.trendWindowName)
      : pens.length ? 0 : -1;
    const color = axis.valueAxisInTrendColor === true && trendPenIndex >= 0
      ? normalizePenColor(pens[trendPenIndex]!.color, trendPenIndex) : normalizeCssColor(axis.valueAxisColor, foregroundColor);
    const axisMinimum = axis.minimum ?? minimum;
    const axisMaximumCandidate = axis.maximum ?? maximum;
    const axisMaximum = axisMaximumCandidate === axisMinimum ? axisMinimum + 1 : axisMaximumCandidate;
    const scaleType = axis.axisScaleType ?? 0;
    const precision = axis.autoDecimalPlaces === true ? automaticDecimalPlaces(axisMinimum, axisMaximum, scaleType)
      : clamp(Math.trunc(axis.decimalPlaces ?? decimalPlaces), 0, 12);
    return `<div class="value-axis ${alignment}" data-axis-name="${escapeHtml(axis.valueAxisName!)}"${axis.trendWindowName ? ` data-trend-window="${escapeHtml(axis.trendWindowName)}"` : ""} style="${alignment}:-${toCss((column + 1) * 4.4)}em;color:${escapeHtml(color)}">${renderYLabels(axisMinimum, axisMaximum, precision, scaleType, axis.exponentialFormat === true)}${axis.valueAxisLabel ? `<span class="value-axis-title">${escapeHtml(axis.valueAxisLabel)}</span>` : ""}</div>`;
  }).join("");
}

function renderYLabels(
  minimum: number,
  maximum: number,
  decimalPlaces: number,
  axisScaleType: number,
  exponentialFormat: boolean,
): string {
  const labels: string[] = [];
  for (let index = 0; index <= 5; index++) {
    const ratio = index / 5;
    const value = valueAtYAxisPosition(ratio * 100, minimum, maximum, axisScaleType);
    labels.push(`<span class="axis-label y-label" style="top:${toCss(ratio * 100)}%">${escapeHtml(formatAxisValue(value, decimalPlaces, exponentialFormat))}</span>`);
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

function resolveTimeZone(control: Pick<Element, "getAttribute">): string | undefined | null {
  const base = control.getAttribute("time-base")?.toLowerCase();
  if (base === "utc") return "UTC";
  if (base !== "project") return undefined;
  const zone = control.getAttribute("project-time-zone");
  if (zone?.toLowerCase() === "local") return undefined;
  if (!zone) return null;
  try { new Intl.DateTimeFormat("en", { timeZone: zone }); return zone; }
  catch { return null; }
}

function renderTimeAxes(axes: readonly TimeAxis[], pens: readonly TrendPen[], flipped: boolean, locale: string | undefined, timeZone: string | undefined | null): string {
  const visibleAxes = axes.filter(axis => axis.attributes["x-axis-scale-visible"] !== "false");
  const columns = {
    top: visibleAxes.filter(axis => axis.attributes["x-axis-alignment"]?.toLowerCase() === "top").length,
    bottom: visibleAxes.filter(axis => axis.attributes["x-axis-alignment"]?.toLowerCase() !== "top").length,
  };
  const now = Date.now();
  return visibleAxes.map(axis => {
    const source = { getAttribute: (name: string) => axis.attributes[name] ?? null };
    const alignment = source.getAttribute("x-axis-alignment")?.toLowerCase() === "top" ? "top" : "bottom";
    const column = --columns[alignment];
    const duration = readDurationMilliseconds(readNumberAttribute(source, "x-axis-time-span", 63_000), source.getAttribute("x-axis-time-span-unit"));
    const startTime = parseAxisTimestamp(source.getAttribute("startTime"));
    const endTime = parseAxisTimestamp(source.getAttribute("endTime"));
    const fixedRange = source.getAttribute("rangeType") === "StartEnd" && startTime !== undefined && endTime !== undefined && endTime >= startTime;
    const start = fixedRange ? startTime : source.getAttribute("refreshEnabled") === "false" && startTime !== undefined ? startTime : now - duration;
    const span = fixedRange ? endTime - startTime : duration;
    const labels = createTimeLabels(new Date(start), readBooleanAttribute(source, "x-axis-date-visible", true), span,
      source.getAttribute("time-format")?.toLowerCase() === "twentyfourhour" ? "twenty-four-hour" : "twelve-hour",
      readBooleanAttribute(source, "display-milliseconds", false), source.getAttribute("x-axis-date-format"), locale, timeZone ?? undefined);
    if (flipped) labels.reverse();
    const trendIndex = axis.trendWindowName ? pens.findIndex(pen => (pen.renderWindowName ?? pen.trendWindowName) === axis.trendWindowName) : 0;
    const color = readBooleanAttribute(source, "x-axis-in-trend-color", false) && trendIndex >= 0 && pens[trendIndex]
      ? normalizePenColor(pens[trendIndex]!.color, trendIndex) : axis.color;
    const label = source.getAttribute("x-axis-label");
    const measurementMode = source.getAttribute("rangeType") === "MeasurementPoints";
    const rangeUnavailable = source.getAttribute("rangeType") === "StartEnd" && !fixedRange;
    const rangeLabels = measurementMode ? `<span class="axis-label x-label" style="left:50%">${escapeHtml(source.getAttribute("measurementPoints") ?? "Unknown")} measurement points (timestamps unavailable)</span>`
      : rangeUnavailable ? `<span class="axis-label x-label" style="left:50%">Time range unavailable</span>`
      : timeZone === null ? `<span class="axis-label x-label" style="left:50%">Project time zone unavailable</span>` : renderXLabels(labels);
    return `<div class="time-axis ${alignment}" data-axis-name="${escapeHtml(axis.name)}" style="${alignment}:calc(-${toCss((column + 1) * 3.6)}em - 1px);color:${escapeHtml(color)}">${rangeLabels}${label ? `<span class="axis-label x-axis-title">${escapeHtml(label)}</span>` : ""}</div>`;
  }).join("");
}

function parseAxisTimestamp(value: string | null): number | undefined {
  // Converters emit ISO 8601 with an explicit offset; reject browser-dependent date strings.
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value)) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function createTimeLabels(
  start: Date,
  includeDate: boolean,
  timeSpanMilliseconds: number,
  timeFormat: "twelve-hour" | "twenty-four-hour",
  displayMilliseconds: boolean,
  dateFormat: string | null,
  locale: string | undefined,
  timeZone?: string,
): TimeLabel[] {
  const labels: TimeLabel[] = [];
  for (let index = 0; index < 8; index++) {
    const date = new Date(start.getTime() + index * timeSpanMilliseconds / 7);
    labels.push(formatTimeLabel(date, includeDate, timeFormat, displayMilliseconds, dateFormat, locale, timeZone));
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

function formatTimeLabel(
  date: Date,
  includeDate: boolean,
  timeFormat: "twelve-hour" | "twenty-four-hour",
  displayMilliseconds: boolean,
  dateFormat: string | null,
  locale: string | undefined,
  timeZone?: string,
): TimeLabel {
  const parts = dateParts(date, timeZone);
  const hours = parts.hour;
  const minutes = parts.minute.toString().padStart(2, "0");
  const seconds = parts.second.toString().padStart(2, "0");
  const milliseconds = displayMilliseconds ? `.${date.getMilliseconds().toString().padStart(3, "0")}` : "";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours >= 12 ? "PM" : "AM";
  return {
    primary: includeDate ? formatDateLabel(date, dateFormat, locale, timeZone, parts) : "",
    secondary: timeFormat === "twenty-four-hour"
      ? `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}${milliseconds}`
      : `${hour12}:${minutes}:${seconds}${milliseconds}${suffix}`,
  };
}

function dateParts(date: Date, timeZone: string | undefined): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  if (!timeZone) return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() };
  const parts = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", { timeZone, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" }).formatToParts(date);
  const value = (name: string) => Number(parts.find(part => part.type === name)!.value);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
}

function formatDateLabel(date: Date, format: string | null, locale: string | undefined, timeZone: string | undefined, parts: ReturnType<typeof dateParts>): string {
  if (!format) return `${parts.month}/${parts.day}/${parts.year}`;
  if (format.toLowerCase() === "automatic") return new Intl.DateTimeFormat(locale, { timeZone }).format(date);
  const tokens: Record<string, string> = {
    dd: parts.day.toString().padStart(2, "0"),
    MM: parts.month.toString().padStart(2, "0"),
    MMM: new Intl.DateTimeFormat(locale, { month: "short", timeZone }).format(date),
    yy: (parts.year % 100).toString().padStart(2, "0"),
    yyyy: parts.year.toString().padStart(4, "0"),
  };
  return format.replace(/yyyy|yy|MMM|MM|dd/gu, token => tokens[token]);
}

function renderPenLegend(pens: readonly TrendPen[], displayIcons: boolean, useTrendNameAsLabel: boolean): string {
  if (pens.length === 0) return `<div class="pen-chip"><span class="pen-name">No configured pens</span></div>`;
  return pens.map((pen, index) => {
    const color = normalizePenColor(pen.color, index);
    const label = (useTrendNameAsLabel ? pen.name : pen.label) || pen.name || `Pen ${pen.number || index + 1}`;
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

function renderPens(
  pens: readonly TrendPen[],
  minimumValue: number,
  maximumValue: number,
  xAxisFlipped: boolean,
  decimalPlaces: number,
): string {
  return pens.map((pen, index) => {
    const color = normalizePenColor(pen.color, index);
    const width = clamp(pen.width ?? 2, 1, 8);
    const penMinimum = pen.minimum ?? minimumValue;
    const penMaximumCandidate = pen.maximum ?? maximumValue;
    const penMaximum = penMaximumCandidate === penMinimum ? penMinimum + 1 : penMaximumCandidate;
    const penScaleType = pen.axisScaleType ?? 0;
    const penExponentialFormat = pen.exponentialFormat === true;
    const penDecimalPlaces = pen.autoDecimalPlaces === true
      ? automaticDecimalPlaces(penMinimum, penMaximum, penScaleType)
      : clamp(Math.trunc(pen.decimalPlaces ?? decimalPlaces), 0, 12);
    const amplitude = Math.max(6, 24 - (index % 8) * 2);
    const points: Array<{ x: number; y: number; value: number; uncertain: boolean }> = [];
    for (let point = 0; point <= 20; point++) {
      const x = xAxisFlipped ? 100 - point * 5 : point * 5;
      const y = 50 - Math.sin((point + index * 3) * 0.55) * amplitude + (index % 8) * 3;
      const clippedY = clamp(y, 3, 97);
      points.push({
        x,
        y: clippedY,
        value: valueAtYAxisPosition(clippedY, penMinimum, penMaximum, penScaleType),
        uncertain: pen.uncertainColoring === true && point >= 8 && point <= 11,
      });
    }
    const pointText = trendPointText(points, pen.lineType);
    const markerColor = pen.markerColor ?? color;
    const area = pen.fill === true
      ? `<polygon points="0,100 ${pointText} 100,100" fill="${escapeHtml(pen.fillColor ?? color)}" fill-opacity="0.3"></polygon>`
      : "";
    const markers = pen.marker === undefined || pen.marker === "0"
      ? ""
      : points.filter((_point, pointIndex) => pointIndex % 5 === 0)
        .map(point => renderMarker(
          pen,
          trendSegmentColor(pen, markerColor, point.value, point.uncertain),
          point.x,
          point.y,
          markerRadius(pen, clamp(width + 1, 2, 5)),
        ))
        .join("");
    const line = renderTrendLine(pen, points, pointText, color, width, penExponentialFormat, penDecimalPlaces);
    const alarms = renderAlarmSymbols(pen, points);
    return `<g data-pen-number="${pen.number}"${pen.trendWindowName ? ` data-trend-window="${escapeHtml(pen.trendWindowName)}"` : ""}${pen.timeAxisName ? ` data-time-axis="${escapeHtml(pen.timeAxisName)}"` : ""}>${area}${line}${markers}${alarms}</g>`;
  }).join("");
}

function renderAlarmSymbols(
  pen: TrendPen,
  points: ReadonlyArray<{ x: number; y: number; value: number }>,
): string {
  if (pen.showAlarms !== true) return "";
  return points.filter((_point, index) => index % 4 === 0).flatMap(point => {
    const low = pen.lowerLimit !== undefined && point.value < pen.lowerLimit;
    const high = pen.upperLimit !== undefined && point.value > pen.upperLimit;
    if (!low && !high) return [];
    const size = 3;
    const y = clamp(point.y - 5, size, 100 - size);
    const pointsText = `${toCss(point.x)},${toCss(y - size)} ${toCss(point.x - size)},${toCss(y + size)} ${toCss(point.x + size)},${toCss(y + size)}`;
    return [`<g class="trend-alarm-symbol"><polygon points="${pointsText}" fill="#D71920" stroke="#FFFFFF" stroke-width="0.6"></polygon><title>${high ? "High" : "Low"} limit alarm</title></g>`];
  }).join("");
}

function valueAtYAxisPosition(
  y: number,
  minimumValue: number,
  maximumValue: number,
  axisScaleType: number,
): number {
  const ratio = y / 100;
  if (axisScaleType === 1 && minimumValue > 0 && maximumValue > 0) {
    return Math.exp(Math.log(maximumValue) - ratio * (Math.log(maximumValue) - Math.log(minimumValue)));
  }
  if (axisScaleType === 2 && minimumValue < 0 && maximumValue < 0) {
    return -Math.exp(Math.log(Math.abs(maximumValue)) + ratio * (Math.log(Math.abs(minimumValue)) - Math.log(Math.abs(maximumValue))));
  }
  return maximumValue - ratio * (maximumValue - minimumValue);
}

function formatAxisValue(value: number, decimalPlaces: number, exponentialFormat: boolean): string {
  return exponentialFormat ? value.toExponential(decimalPlaces) : value.toFixed(decimalPlaces);
}

function automaticDecimalPlaces(minimumValue: number, maximumValue: number, axisScaleType: number): number {
  const ticks = Array.from({ length: 6 }, (_value, index) =>
    valueAtYAxisPosition(index * 20, minimumValue, maximumValue, axisScaleType));
  const minimumStep = Math.min(...ticks.slice(1).map((value, index) => Math.abs(value - ticks[index]!)));
  if (!Number.isFinite(minimumStep) || minimumStep <= 0 || minimumStep >= 1) return 0;
  return clamp(Math.ceil(-Math.log10(minimumStep)), 0, 12);
}

function trendPointText(points: ReadonlyArray<{ x: number; y: number }>, lineType: number | undefined): string {
  if (lineType !== 2)
    return points.map(point => `${toCss(point.x)},${toCss(point.y)}`).join(" ");
  const result = [`${toCss(points[0]?.x ?? 0)},${toCss(points[0]?.y ?? 0)}`];
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1]!;
    const point = points[index]!;
    result.push(`${toCss(point.x)},${toCss(previous.y)}`, `${toCss(point.x)},${toCss(point.y)}`);
  }
  return result.join(" ");
}

function renderTrendLine(
  pen: TrendPen,
  points: ReadonlyArray<{ x: number; y: number; value: number; uncertain: boolean }>,
  pointText: string,
  color: string,
  width: number,
  exponentialFormat: boolean,
  decimalPlaces: number,
): string {
  const lineType = pen.lineType ?? 1;
  if (lineType === 0) return "";
  if (lineType === 3) {
    return points.filter((_point, index) => index % 5 === 0).map(point => {
      const valueColor = trendSegmentColor(pen, color, point.value, point.uncertain);
      const y = pen.valueAlignment === "Top" ? 6 : pen.valueAlignment === "Bottom" ? 94 : 50;
      return `<text x="${toCss(point.x)}" y="${toCss(y)}" fill="${escapeHtml(valueColor)}" font-size="4" text-anchor="middle" dominant-baseline="middle">${escapeHtml(formatAxisValue(point.value, decimalPlaces, exponentialFormat))}</text>`;
    }).join("");
  }
  if (!hasLimitColoring(pen))
    return `<polyline points="${pointText}" fill="none" stroke="${escapeHtml(color)}" stroke-width="${toCss(width)}" vector-effect="non-scaling-stroke"${dashAttribute(pen.style)}></polyline>`;
  return points.slice(1).map((point, pointIndex) => {
    const previous = points[pointIndex]!;
    if (lineType === 2) {
      const horizontalColor = trendSegmentColor(pen, color, previous.value, previous.uncertain || point.uncertain);
      const verticalColor = trendSegmentColor(pen, color, (previous.value + point.value) / 2, previous.uncertain || point.uncertain);
      return `${renderTrendSegment(previous.x, previous.y, point.x, previous.y, horizontalColor, width, pen.style)}${renderTrendSegment(point.x, previous.y, point.x, point.y, verticalColor, width, pen.style)}`;
    }
    return renderTrendSegment(previous.x, previous.y, point.x, point.y, trendSegmentColor(pen, color, (previous.value + point.value) / 2, previous.uncertain || point.uncertain), width, pen.style);
  }).join("");
}

function renderTrendSegment(x1: number, y1: number, x2: number, y2: number, color: string, width: number, style: number | undefined): string {
  return `<line x1="${toCss(x1)}" y1="${toCss(y1)}" x2="${toCss(x2)}" y2="${toCss(y2)}" stroke="${escapeHtml(color)}" stroke-width="${toCss(width)}" vector-effect="non-scaling-stroke"${dashAttribute(style)}></line>`;
}

function hasLimitColoring(pen: TrendPen): boolean {
  return pen.lowerLimitColoring === true && pen.lowerLimit !== undefined && pen.lowerLimitColor !== undefined
    || pen.upperLimitColoring === true && pen.upperLimit !== undefined && pen.upperLimitColor !== undefined
    || pen.uncertainColoring === true && pen.uncertainColor !== undefined;
}

function trendSegmentColor(pen: TrendPen, fallback: string, value: number, uncertain = false): string {
  if (uncertain && pen.uncertainColoring === true && pen.uncertainColor !== undefined)
    return pen.uncertainColor;
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
      if (typeof source.label === "string") pen.label = source.label;
      if (typeof source.trendWindowName === "string") pen.trendWindowName = source.trendWindowName;
      if (typeof source.timeAxisName === "string") pen.timeAxisName = source.timeAxisName;
      if (typeof source.color === "string") pen.color = source.color;
      if (typeof source.visible === "boolean") pen.visible = source.visible;
      if (typeof source.width === "number" && Number.isFinite(source.width)) pen.width = source.width;
      if (typeof source.lineType === "number" && Number.isFinite(source.lineType)) pen.lineType = source.lineType;
      if (typeof source.style === "number" && Number.isFinite(source.style)) pen.style = source.style;
      if (typeof source.fill === "boolean") pen.fill = source.fill;
      if (typeof source.fillColor === "string") pen.fillColor = source.fillColor;
      if (typeof source.lowerLimitColoring === "boolean") pen.lowerLimitColoring = source.lowerLimitColoring;
      if (typeof source.lowerLimit === "number" && Number.isFinite(source.lowerLimit)) pen.lowerLimit = source.lowerLimit;
      if (typeof source.lowerLimitColor === "string") pen.lowerLimitColor = source.lowerLimitColor;
      if (typeof source.upperLimitColoring === "boolean") pen.upperLimitColoring = source.upperLimitColoring;
      if (typeof source.upperLimit === "number" && Number.isFinite(source.upperLimit)) pen.upperLimit = source.upperLimit;
      if (typeof source.upperLimitColor === "string") pen.upperLimitColor = source.upperLimitColor;
      if (typeof source.uncertainColoring === "boolean") pen.uncertainColoring = source.uncertainColoring;
      if (typeof source.uncertainColor === "string") pen.uncertainColor = source.uncertainColor;
      if (typeof source.showAlarms === "boolean") pen.showAlarms = source.showAlarms;
      if (source.valueAlignment === "Top" || source.valueAlignment === "Center" || source.valueAlignment === "Bottom")
        pen.valueAlignment = source.valueAlignment;
      if (typeof source.marker === "string") pen.marker = source.marker;
      if (typeof source.markerColor === "string") pen.markerColor = source.markerColor;
      if (typeof source.markerSize === "number" && Number.isFinite(source.markerSize)) pen.markerSize = source.markerSize;
      if (typeof source.minimum === "number" && Number.isFinite(source.minimum)) pen.minimum = source.minimum;
      if (typeof source.maximum === "number" && Number.isFinite(source.maximum)) pen.maximum = source.maximum;
      if (typeof source.axisScaleType === "number" && Number.isFinite(source.axisScaleType)) pen.axisScaleType = source.axisScaleType;
      if (typeof source.exponentialFormat === "boolean") pen.exponentialFormat = source.exponentialFormat;
      if (typeof source.autoDecimalPlaces === "boolean") pen.autoDecimalPlaces = source.autoDecimalPlaces;
      if (typeof source.decimalPlaces === "number" && Number.isFinite(source.decimalPlaces)) pen.decimalPlaces = source.decimalPlaces;
      if (typeof source.valueAxisName === "string") pen.valueAxisName = source.valueAxisName;
      if (typeof source.valueAxisVisible === "boolean") pen.valueAxisVisible = source.valueAxisVisible;
      if (typeof source.valueAxisColor === "string") pen.valueAxisColor = source.valueAxisColor;
      if (typeof source.valueAxisInTrendColor === "boolean") pen.valueAxisInTrendColor = source.valueAxisInTrendColor;
      if (source.valueAxisAlignment === "Left" || source.valueAxisAlignment === "Right") pen.valueAxisAlignment = source.valueAxisAlignment;
      if (typeof source.valueAxisLabel === "string") pen.valueAxisLabel = source.valueAxisLabel;
      if (typeof source.unit === "string") pen.unit = source.unit;
      return [pen];
    });
  } catch {
    return [];
  }
}

function readBooleanAttribute(element: Pick<Element, "getAttribute">, name: string, fallback: boolean): boolean {
  const value = element.getAttribute(name);
  if (value === null) return fallback;
  if (value.toLowerCase() === "false" || value === "0") return false;
  if (value.toLowerCase() === "true" || value === "1" || value === "") return true;
  return fallback;
}

function readNumberAttribute(element: Pick<Element, "getAttribute">, name: string, fallback: number): number {
  const source = element.getAttribute(name);
  const value = Number(source);
  return source !== null && Number.isFinite(value) ? value : fallback;
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizePenColor(value: string | undefined, index: number): string {
  const fallback = ["#0C66B0", "#D04A35", "#299447", "#8A55B4", "#D18B17"][index % 5]!;
  return normalizeCssColor(value, fallback);
}

function normalizeCssColor(value: string | null | undefined, fallback: string, allowTransparent = false): string {
  if (!value) return fallback;
  if (allowTransparent && value.toLowerCase() === "transparent") return "transparent";
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
