// @ts-nocheck

import { IHmiProject } from "../../projects/IHmiProject.js";
import { HmiColor } from "../../screens/base/HmiColor.js";
import { HmiContainerBase } from "../../screens/base/HmiContainerBase.js";
import { HmiFont } from "../../screens/base/HmiFont.js";
import { HmiGroup } from "../../screens/base/HmiGroup.js";
import { HmiHorizontalAlignment } from "../../screens/base/HmiHorizontalAlignment.js";
import { HmiImageSource } from "../../screens/base/HmiImageSource.js";
import { HmiLayoutContainerBase } from "../../screens/base/HmiLayoutContainerBase.js";
import { getStaticValue, getStaticValueOrDefault, HmiProperty } from "../../screens/base/HmiProperty.js";
import { HmiScreenItemBase } from "../../screens/base/HmiScreenItemBase.js";
import { HmiSymbolContainer } from "../../screens/base/HmiSymbolContainer.js";
import { HmiSymbolFlipMode } from "../../screens/base/HmiSymbolFlipMode.js";
import { HmiVerticalAlignment } from "../../screens/base/HmiVerticalAlignment.js";
import { HmiVisualStyle } from "../../screens/base/HmiVisualStyle.js";
import { HmiAlarmControl } from "../../screens/controls/HmiAlarmControl.js";
import { HmiScreen } from "../../screens/screen/HmiScreen.js";
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
import { HmiText } from "../../screens/shapes/HmiText.js";
import { HmiUnkown } from "../../screens/shapes/HmiUnkown.js";
import { HmiButton } from "../../screens/widgets/HmiButton.js";
import { HmiIOField } from "../../screens/widgets/HmiIOField.js";
import { HmiLabel } from "../../screens/widgets/HmiLabel.js";
import { HmiTextBox } from "../../screens/widgets/HmiTextBox.js";
import { HmiToggleSwitch } from "../../screens/widgets/HmiToggleSwitch.js";
import { HmiHtmlConvertOptions } from "./HmiHtmlConvertOptions.js";

type ArcShape = HmiCircularArc | HmiEllipticalArc | HmiCircleSegment | HmiEllipseSegment;

export class HmiScreenToHtmlConverter {
  async convertAsync(
    screen: HmiScreen,
    project?: IHmiProject,
    options: HmiHtmlConvertOptions = new HmiHtmlConvertOptions(),
    signal?: AbortSignal,
  ): Promise<string> {
    const html: string[] = [];
    if (options.includeMetaCharset) {
      html.push("<meta charset=\"utf-8\">");
    }

    html.push("<div");
    appendAttribute(html, "id", screen.name);
    html.push(" style=\"position: relative; overflow: hidden;");
    appendSize(html, getStaticValueOrDefault(screen.width, 0), getStaticValueOrDefault(screen.height, 0));
    html.push("\">");

    for (const layer of screen.layers) {
      if (!getStaticValueOrDefault(layer.visible, true)) {
        continue;
      }

      html.push("<div");
      appendAttribute(html, "id", layer.name);
      html.push(" style=\"position: absolute; inset: 0;\">");
      for (const item of layer.items) {
        await this.appendItemAsync(html, item, project, options, signal);
      }
      html.push("</div>");
    }

    html.push("</div>");
    return html.join("");
  }

  private async appendItemAsync(
    html: string[],
    item: HmiScreenItemBase,
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
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
      appendImage(html, item, getStaticValue(item.image)?.uri ?? getStaticValue(item.source));
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
    } else if (item instanceof HmiSymbolContainer) {
      await this.appendSymbolContainerAsync(html, item, project, options, signal);
    } else if (item instanceof HmiGroup || item instanceof HmiLayoutContainerBase || item instanceof HmiContainerBase) {
      await this.appendContainerAsync(html, item, item.items, project, options, signal);
    } else if (item instanceof HmiScreenWindow) {
      await this.appendScreenWindowAsync(html, item, project, options, signal);
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
    signal?: AbortSignal,
  ): Promise<void> {
    const image = getStaticValue(symbolContainer.image);
    const imageUri = await resolveImageUri(image, project, signal);
    html.push("<div");
    appendSymbolAttributes(html, symbolContainer);
    html.push(">");
    if (imageUri?.trim()) {
      appendSymbolImage(html, symbolContainer, image, imageUri);
    }
    for (const child of symbolContainer.items) {
      await this.appendItemAsync(html, child, project, options, signal);
    }
    html.push("</div>");
  }

  private async appendContainerAsync(
    html: string[],
    container: HmiScreenItemBase,
    items: readonly HmiScreenItemBase[],
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
    signal?: AbortSignal,
  ): Promise<void> {
    html.push("<div");
    appendCommonAttributes(html, container);
    html.push(">");
    for (const child of items) {
      await this.appendItemAsync(html, child, project, options, signal);
    }
    html.push("</div>");
  }

  private async appendScreenWindowAsync(
    html: string[],
    screenWindow: HmiScreenWindow,
    project: IHmiProject | undefined,
    options: HmiHtmlConvertOptions,
    signal?: AbortSignal,
  ): Promise<void> {
    const resolved = project && screenWindow.screenId ? await project.getScreen(screenWindow.screenId, signal) : undefined;
    html.push("<div");
    appendCommonAttributes(html, screenWindow);
    html.push(">");
    if (resolved === undefined) {
      html.push("<div");
      appendAttribute(html, "class", options.missingScreenPlaceholderCssClass);
      html.push(">");
      html.push(escapeHtml(screenWindow.screenName ?? screenWindow.screenId ?? "Missing screen"));
      html.push("</div>");
    } else {
      html.push(await this.convertAsync(resolved, project, options, signal));
    }
    html.push("</div>");
  }
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

function appendStrokeAttributes(html: string[], item: HmiScreenItemBase, fillColor: HmiColor | undefined): void {
  appendAttribute(html, "fill", fillColor === undefined ? "none" : colorToCss(fillColor));
  appendAttribute(html, "stroke", colorToCss(getStrokeColor(item)));
  appendSvgAttribute(html, "stroke-width", getStrokeWidth(item));
}

function getStrokeColor(item: HmiScreenItemBase): HmiColor {
  return (
    getStaticValue(item.style.lineColor) ??
    getStaticValue(item.style.borderColor) ??
    getStaticValue(item.style.foregroundColor) ??
    { alpha: 255, red: 0, green: 0, blue: 0 }
  );
}

function getFillColor(item: HmiScreenItemBase): HmiColor | undefined {
  return getStaticValue(item.style.backgroundColor);
}

function getStrokeWidth(item: HmiScreenItemBase): number {
  return getStaticValue(item.style.lineWidth) ?? getStaticValue(item.style.borderWidth) ?? 1;
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
  appendStyle(html, rectangle.style);
  if (
    rectangle.style.borderColor === undefined &&
    rectangle.style.borderWidth === undefined &&
    rectangle.style.lineColor === undefined &&
    rectangle.style.lineWidth === undefined
  ) {
    html.push("border: 1px solid #000000;");
  }
  html.push("\"></div>");
}

function appendImage(html: string[], item: HmiScreenItemBase, uri: string | undefined): void {
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
  appendStyle(html, item.style);
  html.push("\"");
}

function appendSymbolAttributes(html: string[], symbolContainer: HmiSymbolContainer): void {
  appendAttribute(html, "id", symbolContainer.name);
  appendAttribute(html, "data-hmi-fill-color-mode", getStaticValue(symbolContainer.fillColorMode));
  appendAttribute(html, "data-hmi-flip", getStaticValue(symbolContainer.flip));
  html.push(" style=\"position: absolute; overflow: hidden;");
  appendPosition(html, symbolContainer);
  appendStyle(html, symbolContainer.style);
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

function appendStyle(html: string[], style: HmiVisualStyle): void {
  appendColorStyle(html, "color", style.foregroundColor);
  appendColorStyle(html, "background-color", style.backgroundColor);
  appendColorStyle(html, "border-color", style.borderColor);
  appendColorStyle(html, "border-color", style.lineColor);
  appendWidthStyle(html, style.borderWidth);
  appendWidthStyle(html, style.lineWidth);
  if (style.margin !== undefined) {
    html.push(
      `margin: ${toCss(getStaticValueOrDefault(style.margin.top, 0))}px ${toCss(
        getStaticValueOrDefault(style.margin.right, 0),
      )}px ${toCss(getStaticValueOrDefault(style.margin.bottom, 0))}px ${toCss(
        getStaticValueOrDefault(style.margin.left, 0),
      )}px;`,
    );
  }

  const font = getStaticValue(style.font);
  if (font !== undefined) {
    appendFont(html, font);
  }

  const horizontalAlignment = getStaticValue(style.horizontalAlignment);
  if (horizontalAlignment !== undefined) {
    html.push(`text-align: ${horizontalAlignmentToCss(horizontalAlignment)};`);
  }

  const verticalAlignment = getStaticValue(style.verticalAlignment);
  if (verticalAlignment !== undefined) {
    html.push("display: flex;");
    html.push(`align-items: ${verticalAlignmentToCss(verticalAlignment)};`);
  }
}

function appendFont(html: string[], font: HmiFont): void {
  if (font.name?.trim()) {
    html.push(`font-family: ${escapeHtml(font.name)};`);
  }
  if (font.size !== undefined) {
    html.push(`font-size: ${toCss(font.size)}px;`);
  }
  if (font.bold) {
    html.push("font-weight: bold;");
  }
  if (font.italic) {
    html.push("font-style: italic;");
  }
  if (font.underline) {
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

function appendAttribute(html: string[], name: string, value: string | undefined): void {
  if (!value?.trim()) {
    return;
  }
  html.push(` ${name}="${escapeHtml(value)}"`);
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
