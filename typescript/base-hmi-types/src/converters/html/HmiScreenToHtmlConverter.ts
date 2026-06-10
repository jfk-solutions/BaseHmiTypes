import { IHmiProject } from "../../projects/IHmiProject.js";
import { HmiColor } from "../../screens/base/HmiColor.js";
import { HmiChildCoordinateSpace } from "../../screens/base/HmiChildCoordinateSpace.js";
import { HmiContainerBase } from "../../screens/base/HmiContainerBase.js";
import { HmiDynamicSvg } from "../../screens/base/HmiDynamicSvg.js";
import { HmiFont } from "../../screens/base/HmiFont.js";
import { HmiGroup } from "../../screens/base/HmiGroup.js";
import { HmiHorizontalAlignment } from "../../screens/base/HmiHorizontalAlignment.js";
import { HmiImageSource } from "../../screens/base/HmiImageSource.js";
import { HmiLayoutContainerBase } from "../../screens/base/HmiLayoutContainerBase.js";
import { HmiPaintedScreenItemBase } from "../../screens/base/HmiPaintedScreenItemBase.js";
import { getStaticValue, getStaticValueOrDefault, HmiProperty } from "../../screens/base/HmiProperty.js";
import { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import { HmiScreenItemBase } from "../../screens/base/HmiScreenItemBase.js";
import { HmiSymbolContainer } from "../../screens/base/HmiSymbolContainer.js";
import { HmiSymbolFlipMode } from "../../screens/base/HmiSymbolFlipMode.js";
import { HmiVerticalAlignment } from "../../screens/base/HmiVerticalAlignment.js";
import { HmiAlarmControl } from "../../screens/controls/HmiAlarmControl.js";
import { HmiScreenWindow } from "../../screens/screen/HmiScreenWindow.js";
import { HmiCircle } from "../../screens/shapes/HmiCircle.js";
import { HmiCircularArc } from "../../screens/shapes/HmiCircularArc.js";
import { HmiCircleSegment } from "../../screens/shapes/HmiCircleSegment.js";
import { HmiEllipse } from "../../screens/shapes/HmiEllipse.js";
import { HmiEllipticalArc } from "../../screens/shapes/HmiEllipticalArc.js";
import { HmiEllipseSegment } from "../../screens/shapes/HmiEllipseSegment.js";
import { HmiGraphicView } from "../../screens/shapes/HmiGraphicView.js";
import { HmiLine } from "../../screens/shapes/HmiLine.js";
import { HmiPoint } from "../../screens/shapes/HmiPoint.js";
import { HmiPointBasedShapeBase } from "../../screens/shapes/HmiPointBasedShapeBase.js";
import { HmiPolygon } from "../../screens/shapes/HmiPolygon.js";
import { HmiPolyline } from "../../screens/shapes/HmiPolyline.js";
import { HmiRectangle } from "../../screens/shapes/HmiRectangle.js";
import { HmiShapeBase } from "../../screens/shapes/HmiShapeBase.js";
import { HmiText } from "../../screens/shapes/HmiText.js";
import { HmiUnkown } from "../../screens/shapes/HmiUnkown.js";
import { HmiButton } from "../../screens/widgets/HmiButton.js";
import { HmiGauge } from "../../screens/widgets/HmiGauge.js";
import { HmiIOField } from "../../screens/widgets/HmiIOField.js";
import { HmiLabel } from "../../screens/widgets/HmiLabel.js";
import { HmiTextBox } from "../../screens/widgets/HmiTextBox.js";
import { HmiToggleSwitch } from "../../screens/widgets/HmiToggleSwitch.js";
import { HmiWidgetBase } from "../../screens/widgets/HmiWidgetBase.js";
import { HmiHtmlConvertOptions } from "./HmiHtmlConvertOptions.js";
import { hmiHtmlRuntimeModuleScript } from "./HmiHtmlRuntimeModule.generated.js";

type ArcShape = HmiCircularArc | HmiEllipticalArc | HmiCircleSegment | HmiEllipseSegment;

export class HmiScreenToHtmlConverter {
  async convertAsync(
    screen: HmiScreenBase,
    project?: IHmiProject,
    options: HmiHtmlConvertOptions = new HmiHtmlConvertOptions(),
    signal?: AbortSignal,
  ): Promise<string> {
    return this.convertCoreAsync(screen, project, options, true, new Set<string>(), signal);
  }

  private async convertCoreAsync(
    screen: HmiScreenBase,
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
    includeRuntime: boolean,
    screenStack: Set<string>,
    signal?: AbortSignal,
  ): Promise<string> {
    const currentKeys = getScreenReferenceKeys(screen);
    for (const key of currentKeys) {
      screenStack.add(key);
    }

    const html: string[] = [];
    try {
      if (includeRuntime && options.includeMetaCharset) {
        html.push("<meta charset=\"utf-8\">");
      }
      if (includeRuntime) {
        appendRuntimeModule(html);
      }

      html.push("<div");
      appendAttribute(html, "id", screen.name);
      html.push(" style=\"position: relative; overflow: hidden;");
      appendSize(html, getStaticValueOrDefault(screen.width, 0), getStaticValueOrDefault(screen.height, 0));
      appendScreenStyle(html, screen);
      html.push("\">");

      const template = await resolveTemplateAsync(screen, project, screenStack, signal);
      if (template !== undefined) {
        html.push(await this.convertCoreAsync(template, project, options, false, screenStack, signal));
      }

      for (const layer of screen.layers) {
        if (!getStaticValueOrDefault(layer.visible, true)) {
          continue;
        }

        html.push("<div");
        appendAttribute(html, "id", layer.name);
        html.push(" style=\"position: absolute; inset: 0;");
        if (layer.items.length === 0) {
          html.push(" pointer-events: none;");
        }
        html.push("\">");
        for (const item of layer.items) {
          await this.appendItemAsync(html, item, project, options, screenStack, signal);
        }
        html.push("</div>");
      }

      html.push("</div>");
      return html.join("");
    } finally {
      for (const key of currentKeys) {
        screenStack.delete(key);
      }
    }
  }

  private async appendItemAsync(
    html: string[],
    item: HmiScreenItemBase,
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
    screenStack: Set<string>,
    signal?: AbortSignal,
  ): Promise<void> {
    if (!getStaticValueOrDefault(item.visible, true)) {
      return;
    }

    if (item instanceof HmiToggleSwitch) {
      appendToggleSwitch(html, item);
    } else if (item instanceof HmiButton) {
      appendButton(html, item);
    } else if (item instanceof HmiIOField) {
      appendInput(html, item);
    } else if (item instanceof HmiTextBox || item instanceof HmiLabel || item instanceof HmiText) {
      appendDiv(html, item, undefined, getStaticValue(item.text));
    } else if (item instanceof HmiGraphicView) {
      appendImage(html, item, getStaticValue(item.image)?.uri ?? getStaticValue(item.source), options);
    } else if (item instanceof HmiRectangle) {
      appendRectangle(html, item);
    } else if (item instanceof HmiLine) {
      appendLine(html, item);
    } else if (item instanceof HmiPolyline) {
      appendPointShape(html, item, "polyline", false);
    } else if (item instanceof HmiPolygon) {
      appendPointShape(html, item, "polygon", true);
    } else if (item instanceof HmiCircleSegment) {
      appendCircularSegment(html, item);
    } else if (item instanceof HmiEllipseSegment) {
      appendEllipticalSegment(html, item);
    } else if (item instanceof HmiCircularArc) {
      appendCircularArc(html, item);
    } else if (item instanceof HmiEllipticalArc) {
      appendEllipticalArc(html, item);
    } else if (item instanceof HmiCircle) {
      appendCircle(html, item);
    } else if (item instanceof HmiEllipse) {
      appendEllipse(html, item);
    } else if (item instanceof HmiDynamicSvg) {
      appendDynamicSvg(html, item);
    } else if (item instanceof HmiGauge) {
      appendGauge(html, item);
    } else if (item instanceof HmiSymbolContainer) {
      await this.appendSymbolContainerAsync(html, item, project, options, screenStack, signal);
    } else if (item instanceof HmiGroup || item instanceof HmiLayoutContainerBase || item instanceof HmiContainerBase) {
      await this.appendContainerAsync(html, item, item.items, project, options, screenStack, signal);
    } else if (item instanceof HmiScreenWindow) {
      await this.appendScreenWindowAsync(html, item, project, options, screenStack, signal);
    } else if (item instanceof HmiAlarmControl) {
      appendDiv(html, item, options.unsupportedItemPlaceholderCssClass, "Alarm control");
    } else if (item instanceof HmiUnkown) {
      appendDiv(html, item, undefined, `Unkown:${item.type ?? ""}`);
    } else {
      appendDiv(html, item, options.unsupportedItemPlaceholderCssClass, item.constructor.name);
    }
  }

  private async appendSymbolContainerAsync(
    html: string[],
    symbolContainer: HmiSymbolContainer,
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
    screenStack: Set<string>,
    signal?: AbortSignal,
  ): Promise<void> {
    const image = getStaticValue(symbolContainer.image);
    const imageUri = await resolveImageUri(image, project, signal);
    html.push("<div");
    appendSymbolAttributes(html, symbolContainer);
    html.push(">");
    if (imageUri?.trim()) {
      appendSymbolImage(html, symbolContainer, image, imageUri, options);
    }
    for (const child of symbolContainer.items) {
      await this.appendItemAsync(html, child, project, options, screenStack, signal);
    }
    html.push("</div>");
  }

  private async appendContainerAsync(
    html: string[],
    container: HmiScreenItemBase,
    items: readonly HmiScreenItemBase[],
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
    screenStack: Set<string>,
    signal?: AbortSignal,
  ): Promise<void> {
    html.push("<div");
    appendCommonAttributes(html, container);
    html.push(">");
    if (container instanceof HmiLayoutContainerBase && container.childCoordinateSpace === HmiChildCoordinateSpace.ScreenAbsolute) {
      appendAbsoluteChildCoordinateSpaceOpen(html, container);
      for (const child of items) {
        await this.appendItemAsync(html, child, project, options, screenStack, signal);
      }
      html.push("</div>");
    } else {
      for (const child of items) {
        await this.appendItemAsync(html, child, project, options, screenStack, signal);
      }
    }
    html.push("</div>");
  }

  private async appendScreenWindowAsync(
    html: string[],
    screenWindow: HmiScreenWindow,
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
    screenStack: Set<string>,
    signal?: AbortSignal,
  ): Promise<void> {
    const resolved = project && screenWindow.screenId?.staticValue ? await project.getScreen(screenWindow.screenId?.staticValue, signal) : undefined;
    html.push("<div");
    appendCommonAttributes(html, screenWindow);
    html.push(">");
    if (resolved === undefined) {
      html.push("<div");
      appendAttribute(html, "class", options.missingScreenPlaceholderCssClass);
      html.push(">");
      html.push(escapeHtml(screenWindow.screenName?.staticValue ?? screenWindow.screenId?.staticValue ?? "Missing screen"));
      html.push("</div>");
    } else {
      html.push(await this.convertCoreAsync(resolved, project, options, false, screenStack, signal));
    }
    html.push("</div>");
  }
}

async function resolveTemplateAsync(
  screen: HmiScreenBase,
  project: IHmiProject | undefined,
  screenStack: Set<string>,
  signal?: AbortSignal,
): Promise<HmiScreenBase | undefined> {
  if (project === undefined) {
    return undefined;
  }

  const templateId = getStaticValue(screen.templateId);
  const templateName = getStaticValue(screen.templateName);
  let template: HmiScreenBase | undefined;

  if (templateId?.trim()) {
    template = await project.getScreen(templateId, signal);
  }

  if (template === undefined && templateName?.trim()) {
    template = await project.getScreen(templateName, signal);
  }

  if (template === undefined || getScreenReferenceKeys(template).some((key) => screenStack.has(key))) {
    return undefined;
  }

  return template;
}

function getScreenReferenceKeys(screen: HmiScreenBase): string[] {
  const keys: string[] = [];
  if (screen.id?.trim()) {
    keys.push(`id:${screen.id}`);
  }
  if (screen.name?.trim()) {
    keys.push(`name:${screen.name}`);
  }
  return keys;
}

function appendLine(html: string[], line: HmiLine): void {
  appendSvgOpen(html, line, getSvgWidth(line), getSvgHeight(line));
  html.push("<line");
  appendSvgAttribute(html, "x1", getStaticValueOrDefault(line.x1, 0));
  appendSvgAttribute(html, "y1", getStaticValueOrDefault(line.y1, 0));
  appendSvgAttribute(html, "x2", getStaticValueOrDefault(line.x2, getStaticValueOrDefault(line.width, 0)));
  appendSvgAttribute(html, "y2", getStaticValueOrDefault(line.y2, getStaticValueOrDefault(line.height, 0)));
  appendStrokeAttributes(html, line, undefined);
  html.push("></line></svg>");
}

function appendPointShape(html: string[], shape: HmiPointBasedShapeBase, elementName: string, fill: boolean): void {
  appendSvgOpen(html, shape, getSvgWidth(shape), getSvgHeight(shape));
  html.push(`<${elementName}`);
  appendAttribute(html, "points", shape.points.map(toSvgPoint).join(" "));
  appendStrokeAttributes(html, shape, fill ? getFillColor(shape) : undefined);
  html.push(`></${elementName}></svg>`);
}

function appendCircle(html: string[], circle: HmiCircle): void {
  const width = getSvgWidth(circle);
  const height = getSvgHeight(circle);
  appendSvgOpen(html, circle, width, height);
  html.push("<circle");
  appendSvgAttribute(html, "cx", getStaticValueOrDefault(circle.centerX, width / 2));
  appendSvgAttribute(html, "cy", getStaticValueOrDefault(circle.centerY, height / 2));
  appendSvgAttribute(html, "r", getStaticValueOrDefault(circle.radius, Math.min(width, height) / 2));
  appendStrokeAttributes(html, circle, getFillColor(circle));
  html.push("></circle></svg>");
}

function appendEllipse(html: string[], ellipse: HmiEllipse): void {
  const width = getSvgWidth(ellipse);
  const height = getSvgHeight(ellipse);
  appendSvgOpen(html, ellipse, width, height);
  html.push("<ellipse");
  appendSvgAttribute(html, "cx", getStaticValueOrDefault(ellipse.centerX, width / 2));
  appendSvgAttribute(html, "cy", getStaticValueOrDefault(ellipse.centerY, height / 2));
  appendSvgAttribute(html, "rx", getStaticValueOrDefault(ellipse.radiusX, width / 2));
  appendSvgAttribute(html, "ry", getStaticValueOrDefault(ellipse.radiusY, height / 2));
  appendStrokeAttributes(html, ellipse, getFillColor(ellipse));
  html.push("></ellipse></svg>");
}

function appendCircularArc(html: string[], arc: HmiCircularArc): void {
  const width = getSvgWidth(arc);
  const height = getSvgHeight(arc);
  appendArcPath(
    html,
    arc,
    getStaticValueOrDefault(arc.centerX, width / 2),
    getStaticValueOrDefault(arc.centerY, height / 2),
    getStaticValueOrDefault(arc.radius, Math.min(width, height) / 2),
    getStaticValueOrDefault(arc.radius, Math.min(width, height) / 2),
    getStaticValueOrDefault(arc.startAngle, 0),
    getStaticValueOrDefault(arc.sweepAngle, 0),
    false,
  );
}

function appendEllipticalArc(html: string[], arc: HmiEllipticalArc): void {
  const width = getSvgWidth(arc);
  const height = getSvgHeight(arc);
  appendArcPath(
    html,
    arc,
    getStaticValueOrDefault(arc.centerX, width / 2),
    getStaticValueOrDefault(arc.centerY, height / 2),
    getStaticValueOrDefault(arc.radiusX, width / 2),
    getStaticValueOrDefault(arc.radiusY, height / 2),
    getStaticValueOrDefault(arc.startAngle, 0),
    getStaticValueOrDefault(arc.sweepAngle, 0),
    false,
  );
}

function appendCircularSegment(html: string[], segment: HmiCircleSegment): void {
  const width = getSvgWidth(segment);
  const height = getSvgHeight(segment);
  appendArcPath(
    html,
    segment,
    getStaticValueOrDefault(segment.centerX, width / 2),
    getStaticValueOrDefault(segment.centerY, height / 2),
    getStaticValueOrDefault(segment.radius, Math.min(width, height) / 2),
    getStaticValueOrDefault(segment.radius, Math.min(width, height) / 2),
    getStaticValueOrDefault(segment.startAngle, 0),
    getStaticValueOrDefault(segment.sweepAngle, 0),
    true,
  );
}

function appendEllipticalSegment(html: string[], segment: HmiEllipseSegment): void {
  const width = getSvgWidth(segment);
  const height = getSvgHeight(segment);
  appendArcPath(
    html,
    segment,
    getStaticValueOrDefault(segment.centerX, width / 2),
    getStaticValueOrDefault(segment.centerY, height / 2),
    getStaticValueOrDefault(segment.radiusX, width / 2),
    getStaticValueOrDefault(segment.radiusY, height / 2),
    getStaticValueOrDefault(segment.startAngle, 0),
    getStaticValueOrDefault(segment.sweepAngle, 0),
    true,
  );
}

function appendArcPath(
  html: string[],
  item: ArcShape,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  sweepAngle: number,
  segment: boolean,
): void {
  appendSvgOpen(html, item, getSvgWidth(item), getSvgHeight(item));
  html.push("<path");
  appendAttribute(html, "d", createArcPath(centerX, centerY, radiusX, radiusY, startAngle, sweepAngle, segment));
  appendStrokeAttributes(html, item, segment ? getFillColor(item) : undefined);
  html.push("></path></svg>");
}

function createArcPath(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  sweepAngle: number,
  segment: boolean,
): string {
  const endAngle = startAngle + sweepAngle;
  const start = getEllipsePoint(centerX, centerY, radiusX, radiusY, startAngle);
  const end = getEllipsePoint(centerX, centerY, radiusX, radiusY, endAngle);
  const largeArc = Math.abs(sweepAngle) > 180 ? 1 : 0;
  const sweep = sweepAngle >= 0 ? 1 : 0;
  const prefix = segment
    ? `M ${toCss(centerX)} ${toCss(centerY)} L ${toCss(start.x)} ${toCss(start.y)} `
    : `M ${toCss(start.x)} ${toCss(start.y)} `;
  return `${prefix}A ${toCss(radiusX)} ${toCss(radiusY)} 0 ${largeArc} ${sweep} ${toCss(end.x)} ${toCss(end.y)}${segment ? " Z" : ""}`;
}

function getEllipsePoint(centerX: number, centerY: number, radiusX: number, radiusY: number, angle: number): HmiPoint {
  const radians = (angle * Math.PI) / 180;
  return { x: centerX + Math.cos(radians) * radiusX, y: centerY + Math.sin(radians) * radiusY };
}

function appendSvgOpen(html: string[], item: HmiScreenItemBase, width: number, height: number): void {
  html.push("<svg");
  appendCommonAttributes(html, item);
  appendAttribute(html, "viewBox", `0 0 ${toCss(Math.max(width, 1))} ${toCss(Math.max(height, 1))}`);
  appendAttribute(html, "xmlns", "http://www.w3.org/2000/svg");
  html.push(">");
}

function appendStrokeAttributes(html: string[], item: HmiShapeBase, fillColor: HmiColor | undefined): void {
  appendAttribute(html, "fill", fillColor === undefined ? "none" : colorToCss(fillColor));
  appendAttribute(html, "stroke", colorToCss(getStrokeColor(item)));
  appendSvgAttribute(html, "stroke-width", getStrokeWidth(item));
}

function getStrokeColor(item: HmiShapeBase): HmiColor {
  return (
    getStaticValue(item.lineColor) ??
    (item instanceof HmiPaintedScreenItemBase ? getStaticValue(item.borderColor) : undefined) ??
    (item instanceof HmiPaintedScreenItemBase ? getStaticValue(item.foregroundColor) : undefined) ??
    { alpha: 255, red: 0, green: 0, blue: 0 }
  );
}

function getFillColor(item: HmiShapeBase): HmiColor | undefined {
  return getStaticValue(item.backgroundColor);
}

function getStrokeWidth(item: HmiShapeBase): number {
  return getStaticValue(item.lineWidth) ?? (item instanceof HmiPaintedScreenItemBase ? getStaticValue(item.borderWidth) : undefined) ?? 1;
}

function appendButton(html: string[], button: HmiButton): void {
  html.push("<button");
  appendCommonAttributes(html, button);
  html.push(">");
  const image = getStaticValue(button.image);
  if (image?.uri) {
    appendInnerImage(html, image.uri);
  }
  html.push(escapeHtml(getStaticValue(button.text) ?? ""));
  html.push("</button>");
}

function appendInput(html: string[], ioField: HmiIOField): void {
  html.push("<input");
  appendCommonAttributes(html, ioField);
  html.push(">");
}

function appendToggleSwitch(html: string[], toggleSwitch: HmiToggleSwitch): void {
  html.push("<input type=\"checkbox\"");
  appendCommonAttributes(html, toggleSwitch);
  html.push(">");
}

function appendRectangle(html: string[], rectangle: HmiRectangle): void {
  html.push("<div");
  appendAttribute(html, "id", rectangle.name);
  html.push(" style=\"position: absolute;");
  appendPosition(html, rectangle);
  appendStyle(html, rectangle);
  if (
    rectangle.borderColor === undefined &&
    rectangle.borderWidth === undefined &&
    rectangle.lineColor === undefined &&
    rectangle.lineWidth === undefined
  ) {
    html.push("border: 1px solid #000000;");
  }
  html.push("\"></div>");
}

function appendImage(
  html: string[],
  item: HmiScreenItemBase,
  uri: string | undefined,
  options: HmiHtmlConvertOptions,
): void {
  if (!uri?.trim()) {
    appendDiv(html, item, undefined, undefined);
    return;
  }

  html.push("<img");
  appendCommonAttributes(html, item);
  appendAttribute(html, "src", uri);
  html.push(">");
}

function appendInnerImage(html: string[], uri: string): void {
  if (!uri.trim()) {
    return;
  }

  html.push("<img");
  appendAttribute(html, "src", uri);
  html.push(" style=\"width: 100%; height: 100%;\">");
}

function appendSymbolImage(
  html: string[],
  symbolContainer: HmiSymbolContainer,
  image: HmiImageSource | undefined,
  uri: string,
  options: HmiHtmlConvertOptions,
): void {
  html.push("<img");
  appendAttribute(html, "src", uri);
  appendAttribute(html, "alt", image?.imageName ?? symbolContainer.name);
  appendAttribute(html, "data-hmi-image-id", image?.imageId);
  appendAttribute(html, "data-hmi-image-name", image?.imageName);
  html.push(" style=\"position: absolute; inset: 0; width: 100%; height: 100%; display: block;");
  html.push(getStaticValueOrDefault(symbolContainer.fixedAspectRatio, false) ? "object-fit: contain;" : "object-fit: fill;");
  html.push("\">");
}

function appendDynamicSvg(html: string[], dynamicSvg: HmiDynamicSvg): void {
  html.push("<node-projects-svghmi");
  appendCommonAttributes(html, dynamicSvg);
  appendAttribute(
    html,
    "src",
    getStaticValue(dynamicSvg.image)?.uri,
  );
  appendAttribute(html, "data-hmi-svg-type", getStaticValue(dynamicSvg.svgType));
  for (const property of dynamicSvg.properties) {
    appendAttribute(html, toDynamicSvgAttributeName(property.name), formatDynamicSvgPropertyValue(getStaticValue(property.value)));
  }
  html.push("></node-projects-svghmi>");
}

function appendGauge(html: string[], gauge: HmiGauge): void {
  html.push("<hmi-gauge");
  appendCommonAttributes(html, gauge);
  appendStaticAttribute(html, "value", gauge.value);
  appendStaticAttribute(html, "fill-level", gauge.fillLevel);
  appendBooleanAttribute(html, "show-fill-level", getStaticValueOrDefault(gauge.showFillLevel, true));
  appendStaticAttribute(html, "begin-value", gauge.beginValue);
  appendStaticAttribute(html, "end-value", gauge.endValue);
  appendStaticAttribute(html, "origin-value", gauge.originValue);
  appendStaticAttribute(html, "division-count", gauge.divisionCount);
  appendStaticAttribute(html, "sub-division-count", gauge.subDivisionCount);
  appendStaticAttribute(html, "bar-mode", gauge.barMode);
  appendStaticAttribute(html, "scale-mode", gauge.scaleMode);
  appendStaticAttribute(html, "orientation", gauge.orientation);
  appendBooleanAttribute(html, "show-value", getStaticValueOrDefault(gauge.showValue, true));
  appendStaticAttribute(html, "value-position", gauge.valuePosition);
  appendStaticAttribute(html, "label-color", gauge.labelColor);
  appendStaticAttribute(html, "scale-background-color", gauge.scaleBackgroundColor);
  appendStaticAttribute(html, "scale-foreground-color", gauge.scaleForegroundColor);
  appendStaticAttribute(html, "tick-color", gauge.tickColor);
  appendAttribute(html, "label-font", formatFont(gauge.labelFont));
  html.push("></hmi-gauge>");
}

function appendBooleanAttribute(html: string[], name: string, value: boolean): void {
  if (value) {
    html.push(` ${name}`);
  }
}

function appendStaticAttribute<T>(html: string[], name: string, property: HmiProperty<T> | undefined): void {
  const value = getStaticValue(property);
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === "boolean") {
    appendBooleanAttribute(html, name, value);
    return;
  }

  appendAttribute(html, name, formatAttributeValue(value));
}

function formatAttributeValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (isHmiColor(value)) {
    return colorToCss(value);
  }
  if (typeof value === "number") {
    return toCss(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    return value;
  }
  return String(value);
}

function formatFont(font: HmiFont | undefined): string | undefined {
  if (font === undefined) {
    return undefined;
  }

  const values: Record<string, string | number | boolean> = {};
  addFontValue(values, "name", font.name);
  addFontValue(values, "size", font.size);
  addFontValue(values, "bold", font.bold);
  addFontValue(values, "italic", font.italic);
  addFontValue(values, "underline", font.underline);
  addFontValue(values, "strikethrough", font.strikethrough);

  return Object.keys(values).length === 0 ? undefined : JSON.stringify(values);
}

function addFontValue<T extends string | number | boolean>(
  values: Record<string, string | number | boolean>,
  name: string,
  property: HmiProperty<T> | undefined,
): void {
  const value = getStaticValue(property);
  if (value !== undefined && value !== null) {
    values[name] = value;
  }
}

function formatDynamicSvgPropertyValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (isHmiColor(value)) {
    return colorToCss(value);
  }
  if (typeof value === "number") {
    return toCss(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    return value;
  }
  return String(value);
}

function toDynamicSvgAttributeName(name: string | undefined): string | undefined {
  if (!name?.trim()) {
    return undefined;
  }

  let result = "";
  for (let index = 0; index < name.length; index++) {
    const character = name[index];
    const lower = character.toLowerCase();
    if (character !== lower) {
      if (index > 0) {
        result += "-";
      }
      result += lower;
    } else {
      result += character;
    }
  }
  return result;
}

function appendDiv(html: string[], item: HmiScreenItemBase, cssClass: string | undefined, content: string | undefined): void {
  html.push("<div");
  appendCommonAttributes(html, item);
  appendAttribute(html, "class", cssClass);
  html.push(">");
  if (content) {
    html.push(escapeHtml(content));
  }
  html.push("</div>");
}

function appendCommonAttributes(html: string[], item: HmiScreenItemBase): void {
  appendAttribute(html, "id", item.name);
  html.push(" style=\"position: absolute;");
  appendPosition(html, item);
  if (item instanceof HmiPaintedScreenItemBase) {
    appendStyle(html, item);
  }
  html.push("\"");
}

function appendAbsoluteChildCoordinateSpaceOpen(html: string[], container: HmiLayoutContainerBase): void {
  html.push("<div style=\"position: absolute;");
  html.push(`left: ${toCss(-getStaticValueOrDefault(container.x, 0))}px;`);
  html.push(`top: ${toCss(-getStaticValueOrDefault(container.y, 0))}px;`);
  html.push("\">");
}

function appendSymbolAttributes(html: string[], symbolContainer: HmiSymbolContainer): void {
  appendAttribute(html, "id", symbolContainer.name);
  appendAttribute(html, "data-hmi-fill-color-mode", getStaticValue(symbolContainer.fillColorMode));
  appendAttribute(html, "data-hmi-flip", getStaticValue(symbolContainer.flip));
  html.push(" style=\"position: absolute; overflow: hidden;");
  appendPosition(html, symbolContainer);
  appendStyle(html, symbolContainer);
  appendSymbolTransform(html, symbolContainer);
  html.push("\"");
}

function appendSymbolTransform(html: string[], symbolContainer: HmiSymbolContainer): void {
  const transforms: string[] = [];
  const flip = getStaticValue(symbolContainer.flip);
  switch (flip) {
    case HmiSymbolFlipMode.Horizontal:
      transforms.push("scaleX(-1)");
      break;
    case HmiSymbolFlipMode.Vertical:
      transforms.push("scaleY(-1)");
      break;
    case HmiSymbolFlipMode.HorizontalAndVertical:
      transforms.push("scale(-1, -1)");
      break;
  }

  if (symbolContainer.rotationAngle !== undefined) {
    transforms.push(`rotate(${toCss(getStaticValueOrDefault(symbolContainer.rotationAngle, 0))}deg)`);
  }

  if (transforms.length > 0) {
    html.push(`transform: ${transforms.join(" ")};transform-origin: center;`);
  }
}

function appendPosition(html: string[], item: HmiScreenItemBase): void {
  html.push(`left: ${toCss(getStaticValueOrDefault(item.x, 0))}px;`);
  html.push(`top: ${toCss(getStaticValueOrDefault(item.y, 0))}px;`);
  appendSize(html, getStaticValueOrDefault(item.width, 0), getStaticValueOrDefault(item.height, 0));
}

function appendSize(html: string[], width: number, height: number): void {
  if (width > 0) {
    html.push(`width: ${toCss(width)}px;`);
  }
  if (height > 0) {
    html.push(`height: ${toCss(height)}px;`);
  }
}

function appendScreenStyle(html: string[], screen: HmiScreenBase): void {
  appendColorStyle(html, "background-color", screen.backgroundColor);
}

function appendStyle(html: string[], item: HmiPaintedScreenItemBase): void {
  appendColorStyle(html, "color", item.foregroundColor);
  appendColorStyle(html, "background-color", item.backgroundColor);
  appendColorStyle(html, "border-color", item.borderColor);
  appendWidthStyle(html, item.borderWidth);
  if (item instanceof HmiShapeBase) {
    appendColorStyle(html, "border-color", item.lineColor);
    appendWidthStyle(html, item.lineWidth);
  }
  if (item.margin !== undefined) {
    html.push(
      `margin: ${toCss(getStaticValueOrDefault(item.margin.top, 0))}px ${toCss(
        getStaticValueOrDefault(item.margin.right, 0),
      )}px ${toCss(getStaticValueOrDefault(item.margin.bottom, 0))}px ${toCss(
        getStaticValueOrDefault(item.margin.left, 0),
      )}px;`,
    );
  }

  const font = getFont(item);
  if (font !== undefined) {
    appendFont(html, font);
  }

  const horizontalAlignment = getStaticValue(getHorizontalAlignment(item));
  if (horizontalAlignment !== undefined) {
    html.push(`text-align: ${horizontalAlignmentToCss(horizontalAlignment)};`);
  }

  const verticalAlignment = getStaticValue(getVerticalAlignment(item));
  if (verticalAlignment !== undefined) {
    html.push("display: flex;");
    html.push(`align-items: ${verticalAlignmentToCss(verticalAlignment)};`);
  }
}

function getFont(item: HmiScreenItemBase): HmiFont | undefined {
  if (item instanceof HmiText) {
    return item.font;
  }
  if (item instanceof HmiWidgetBase) {
    return item.font;
  }
  return undefined;
}

function getHorizontalAlignment(item: HmiScreenItemBase): HmiProperty<HmiHorizontalAlignment> | undefined {
  if (item instanceof HmiText) {
    return item.horizontalAlignment;
  }
  if (item instanceof HmiWidgetBase) {
    return item.horizontalAlignment;
  }
  return undefined;
}

function getVerticalAlignment(item: HmiScreenItemBase): HmiProperty<HmiVerticalAlignment> | undefined {
  if (item instanceof HmiText) {
    return item.verticalAlignment;
  }
  if (item instanceof HmiWidgetBase) {
    return item.verticalAlignment;
  }
  return undefined;
}

function appendFont(html: string[], font: HmiFont): void {
  const name = getStaticValue(font.name);
  const size = getStaticValue(font.size);
  if (name?.trim()) {
    html.push(`font-family: ${escapeHtml(name)};`);
  }
  if (size !== undefined) {
    html.push(`font-size: ${toCss(size)}px;`);
  }
  if (getStaticValueOrDefault(font.bold, false)) {
    html.push("font-weight: bold;");
  }
  if (getStaticValueOrDefault(font.italic, false)) {
    html.push("font-style: italic;");
  }
  if (getStaticValueOrDefault(font.underline, false)) {
    html.push("text-decoration: underline;");
  }
}

function appendColorStyle(html: string[], name: string, property: HmiProperty<HmiColor> | undefined): void {
  const value = getStaticValue(property);
  if (value !== undefined) {
    html.push(`${name}: ${colorToCss(value)};`);
  }
}

function appendWidthStyle(html: string[], property: HmiProperty<number> | undefined): void {
  const value = getStaticValue(property);
  if (value !== undefined) {
    html.push("border-style: solid;");
    html.push(`border-width: ${toCss(value)}px;`);
  }
}

function appendSvgAttribute(html: string[], name: string, value: number): void {
  appendAttribute(html, name, toCss(value));
}

function appendRuntimeModule(html: string[]): void {
  html.push("<script type=\"module\">");
  html.push(hmiHtmlRuntimeModuleScript);
  html.push("</script>");
}

function appendAttribute(html: string[], name: string | undefined, value: string | undefined): void {
  if (!name?.trim() || !value?.trim()) {
    return;
  }
  html.push(` ${name}="${escapeHtml(value)}"`);
}

function isHmiColor(value: unknown): value is HmiColor {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return "alpha" in value && "red" in value && "green" in value && "blue" in value;
}

function toSvgPoint(point: HmiPoint): string {
  return `${toCss(point.x)},${toCss(point.y)}`;
}

function getSvgWidth(item: HmiScreenItemBase): number {
  return getStaticValueOrDefault(item.width, 1);
}

function getSvgHeight(item: HmiScreenItemBase): number {
  return getStaticValueOrDefault(item.height, 1);
}

function toCss(value: number): string {
  return Number.isFinite(value) ? Number(value.toFixed(3)).toString() : "0";
}

function colorToCss(color: HmiColor): string {
  if (color.alpha === 255) {
    return `#${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
  }

  return `rgba(${color.red},${color.green},${color.blue},${toCss(color.alpha / 255)})`;
}

function toHex(value: number): string {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0").toUpperCase();
}

function horizontalAlignmentToCss(alignment: HmiHorizontalAlignment): string {
  switch (alignment) {
    case HmiHorizontalAlignment.Left:
      return "left";
    case HmiHorizontalAlignment.Right:
      return "right";
    case HmiHorizontalAlignment.Stretch:
      return "justify";
    default:
      return "center";
  }
}

function verticalAlignmentToCss(alignment: HmiVerticalAlignment): string {
  switch (alignment) {
    case HmiVerticalAlignment.Top:
      return "flex-start";
    case HmiVerticalAlignment.Bottom:
      return "flex-end";
    case HmiVerticalAlignment.Stretch:
      return "stretch";
    default:
      return "center";
  }
}

async function resolveImageUri(
  image: HmiImageSource | undefined,
  project: IHmiProject | undefined,
  signal?: AbortSignal,
): Promise<string | undefined> {
  if (image === undefined) {
    return undefined;
  }
  if (image.uri?.trim()) {
    return image.uri;
  }
  if (project === undefined || !image.imageId?.trim()) {
    return undefined;
  }

  const resolved = await project.getImage(image.imageId, signal);
  if (resolved === undefined || resolved.data.byteLength === 0) {
    return undefined;
  }

  return `data:${resolved.mimeType?.trim() || "application/octet-stream"};base64,${toBase64(resolved.data)}`;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

function escapeHtml(value: string): string {
  let result = "";
  for (const char of value) {
    switch (char) {
      case "&":
        result += "&amp;";
        break;
      case "\"":
        result += "&quot;";
        break;
      case "'":
        result += "&#39;";
        break;
      case "<":
        result += "&lt;";
        break;
      case ">":
        result += "&gt;";
        break;
      default: {
        const code = char.codePointAt(0) ?? 0;
        result += code > 127 ? `&#${code};` : char;
        break;
      }
    }
  }
  return result;
}
