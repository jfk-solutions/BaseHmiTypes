import { IHmiProject } from "../../projects/IHmiProject.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiImage } from "../../images/HmiImage.js";
import { HmiImageType } from "../../images/HmiImageType.js";
import { MetafileToSvgRenderer } from "../../images/converters/metafile-to-svg-renderer.js";
import { HmiProjectSoftwareType } from "../../projects/HmiProjectSoftwareType.js";
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
import { HmiSymbolLibraryControl } from "../../screens/base/HmiSymbolLibraryControl.js";
import {
  HmiSymbolLibraryBackFillStyle,
  HmiSymbolLibraryFlip,
  HmiSymbolLibraryRotation,
} from "../../screens/base/HmiSymbolLibraryEnums.js";
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
import { HmiPointCoordinateSpace } from "../../screens/shapes/HmiPointCoordinateSpace.js";
import { HmiPolygon } from "../../screens/shapes/HmiPolygon.js";
import { HmiPolyline } from "../../screens/shapes/HmiPolyline.js";
import { HmiRectangle } from "../../screens/shapes/HmiRectangle.js";
import { HmiShapeBase } from "../../screens/shapes/HmiShapeBase.js";
import { HmiText } from "../../screens/shapes/HmiText.js";
import { HmiUnkown } from "../../screens/shapes/HmiUnkown.js";
import { HmiButton } from "../../screens/widgets/HmiButton.js";
import { HmiCheckBoxGroup } from "../../screens/widgets/HmiCheckBoxGroup.js";
import { HmiGauge } from "../../screens/widgets/HmiGauge.js";
import { HmiIOField } from "../../screens/widgets/HmiIOField.js";
import { HmiLabel } from "../../screens/widgets/HmiLabel.js";
import { HmiRadioButtonGroup } from "../../screens/widgets/HmiRadioButtonGroup.js";
import { HmiSelectionGroupBase, HmiSelectionGroupItem } from "../../screens/widgets/HmiSelectionGroupBase.js";
import { HmiSwitchType } from "../../screens/widgets/HmiSwitchType.js";
import { HmiSymbolicIOField } from "../../screens/widgets/HmiSymbolicIOField.js";
import { HmiTextBox } from "../../screens/widgets/HmiTextBox.js";
import { HmiToggleSwitch } from "../../screens/widgets/HmiToggleSwitch.js";
import { HmiWidgetBase } from "../../screens/widgets/HmiWidgetBase.js";
import { HmiDefaultProfiles } from "../../screens/defaults/HmiDefaultProfiles.js";
import { HmiEffectivePropertyResolver } from "../../screens/defaults/HmiEffectivePropertyResolver.js";
import { HmiDefaultProfile } from "../../screens/defaults/HmiDefaultProfile.js";
import { HmiHtmlConvertOptions } from "./HmiHtmlConvertOptions.js";
import { hmiHtmlCommonStyle } from "./HmiHtmlCommonStyle.generated.js";
import { hmiHtmlRuntimeModuleScript } from "./HmiHtmlRuntimeModule.generated.js";
import { HmiTrendControl } from "../../screens/controls/HmiTrendControl.js";
import { HmiInspectableScreenHtml, inspectHmiScreenAsync } from "./HmiScreenInspection.js";

type ArcShape = HmiCircularArc | HmiEllipticalArc | HmiCircleSegment | HmiEllipseSegment;

function resolveDefaultProfile(project: IHmiProject | undefined): HmiDefaultProfile {
  switch (project?.info.hmiProjectSoftwareType) {
    case HmiProjectSoftwareType.WinCCAdvanced:
      return HmiDefaultProfiles.winCcAdvancedV21;
    case HmiProjectSoftwareType.WinCCUnified:
      return HmiDefaultProfiles.winCcUnifiedV21;
    default:
      return HmiDefaultProfiles.neutral;
  }
}

export class HmiScreenToHtmlConverter {
  async convertAsync(
    screen: HmiScreenBase,
    project?: IHmiProject,
    options: HmiHtmlConvertOptions = new HmiHtmlConvertOptions(),
    signal?: AbortSignal,
  ): Promise<string> {
    const context = new HmiHtmlConvertContext(options, new HmiEffectivePropertyResolver(resolveDefaultProfile(project)));
    return this.convertCoreAsync(screen, project, context, true, new Set<string>(), "screen", false, signal);
  }

  async convertInspectableAsync(
    screen: HmiScreenBase,
    project?: IHmiProject,
    options: HmiHtmlConvertOptions = new HmiHtmlConvertOptions(),
    signal?: AbortSignal,
  ): Promise<HmiInspectableScreenHtml> {
    const inspection = await inspectHmiScreenAsync(screen, project, signal);
    const context = new HmiHtmlConvertContext(options, new HmiEffectivePropertyResolver(resolveDefaultProfile(project)));
    const html = await this.convertCoreAsync(screen, project, context, true, new Set<string>(), "screen", true, signal);
    return { html, inspection };
  }

  private async convertCoreAsync(
    screen: HmiScreenBase,
    project: IHmiProject | undefined,
    context: HmiHtmlConvertContext,
    includeRuntime: boolean,
    screenStack: Set<string>,
    key: string,
    includeInspectionAttributes: boolean,
    signal?: AbortSignal,
  ): Promise<string> {
    const currentKeys = getScreenReferenceKeys(screen);
    for (const key of currentKeys) {
      screenStack.add(key);
    }

    const html: string[] = [];
    try {
      if (includeRuntime && context.options.includeMetaCharset) {
        html.push("<meta charset=\"utf-8\">");
      }
      if (includeRuntime) {
        appendGlobalStyle(html);
      }
      if (includeRuntime) {
        appendRuntimeModule(html);
      }

      html.push("<div");
      appendAttribute(html, "id", screen.name);
      if (includeInspectionAttributes) {
        appendAttribute(html, "data-hmi-node-key", key);
      }
      html.push(" style=\"position: relative; overflow: hidden;");
      appendSize(html, getStaticValueOrDefault(screen.width, 0), getStaticValueOrDefault(screen.height, 0));
      appendScreenStyle(html, screen);
      html.push("\">");

      const template = await resolveTemplateAsync(screen, project, screenStack, signal);
      if (template !== undefined) {
        html.push(await this.convertCoreAsync(
          template,
          project,
          context,
          false,
          screenStack,
          `${key}/template`,
          includeInspectionAttributes,
          signal,
        ));
      }

      for (let layerIndex = 0; layerIndex < screen.layers.length; layerIndex++) {
        const layer = screen.layers[layerIndex];
        if (!getStaticValueOrDefault(layer.visible, true)) {
          continue;
        }

        html.push("<div");
        appendAttribute(html, "id", layer.name);
        if (includeInspectionAttributes) {
          appendAttribute(html, "data-hmi-node-key", `${key}/layer:${layerIndex}`);
        }
        html.push(" style=\"position: absolute; inset: 0;");
        if (layer.items.length === 0) {
          html.push(" pointer-events: none;");
        }
        html.push("\">");
        for (let itemIndex = 0; itemIndex < layer.items.length; itemIndex++) {
          await this.appendItemAsync(
            html,
            layer.items[itemIndex],
            project,
            context,
            screenStack,
            `${key}/layer:${layerIndex}/item:${itemIndex}`,
            includeInspectionAttributes,
            signal,
          );
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
    context: HmiHtmlConvertContext,
    screenStack: Set<string>,
    key: string,
    includeInspectionAttributes: boolean,
    signal?: AbortSignal,
  ): Promise<void> {
    if (!getStaticValueOrDefault(item.visible, true)) {
      return;
    }
    context = context.withNodeKey(includeInspectionAttributes ? key : undefined);

    const materializedReference = item.referenceObject?.materializedObject;
    if (materializedReference !== undefined && materializedReference !== item) {
      html.push("<div");
      appendCommonAttributes(html, item, context, undefined, "overflow: hidden;");
      appendAttribute(html, "class", "hmi-reference-object");
      appendAttribute(html, "data-hmi-reference-source", item.referenceObject?.source);
      html.push(">");
      const childContext = context.withPositionOffset(
        -getStaticValueOrDefault(materializedReference.x, 0) - context.positionOffsetX,
        -getStaticValueOrDefault(materializedReference.y, 0) - context.positionOffsetY,
      );
      await this.appendItemAsync(
        html,
        materializedReference,
        project,
        childContext,
        screenStack,
        `${key}/materialized`,
        includeInspectionAttributes,
        signal,
      );
      html.push("</div>");
      return;
    }

    if (item instanceof HmiToggleSwitch) {
      appendToggleSwitch(html, item, context);
    } else if (item instanceof HmiCheckBoxGroup) {
      await appendSelectionGroup(html, "hmi-checkbox-group", item, project, context, signal);
    } else if (item instanceof HmiRadioButtonGroup) {
      await appendSelectionGroup(html, "hmi-radio-button-group", item, project, context, signal);
    } else if (item instanceof HmiButton) {
      appendButton(html, item, context);
    } else if (item instanceof HmiIOField) {
      appendInput(html, item, context);
    } else if (item instanceof HmiSymbolicIOField) {
      appendSymbolicInput(html, item, context);
    } else if (item instanceof HmiTextBox || item instanceof HmiLabel || item instanceof HmiText) {
      appendTextBlock(html, item, item.text, context);
    } else if (item instanceof HmiGraphicView) {
      await this.appendGraphicViewAsync(html, item, project, context, signal);
    } else if (item instanceof HmiRectangle) {
      appendRectangle(html, item, context);
    } else if (item instanceof HmiLine) {
      appendLine(html, item, context);
    } else if (item instanceof HmiPolyline) {
      appendPointShape(html, item, "polyline", false, context);
    } else if (item instanceof HmiPolygon) {
      appendPointShape(html, item, "polygon", true, context);
    } else if (item instanceof HmiCircleSegment) {
      appendCircularSegment(html, item, context);
    } else if (item instanceof HmiEllipseSegment) {
      appendEllipticalSegment(html, item, context);
    } else if (item instanceof HmiCircularArc) {
      appendCircularArc(html, item, context);
    } else if (item instanceof HmiEllipticalArc) {
      appendEllipticalArc(html, item, context);
    } else if (item instanceof HmiCircle) {
      appendCircle(html, item, context);
    } else if (item instanceof HmiEllipse) {
      appendEllipse(html, item, context);
    } else if (item instanceof HmiDynamicSvg) {
      appendDynamicSvg(html, item, context);
    } else if (item instanceof HmiGauge) {
      appendGauge(html, item, context);
    } else if (item instanceof HmiTrendControl) {
      appendTrendControl(html, item, context);
    } else if (item instanceof HmiSymbolContainer) {
      await this.appendSymbolContainerAsync(html, item, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiSymbolLibraryControl) {
      appendSymbolLibraryControl(html, item, context);
    } else if (item instanceof HmiGroup) {
      if (item.isLogicGrouping) {
        for (let childIndex = 0; childIndex < item.items.length; childIndex++) {
          await this.appendItemAsync(
            html,
            item.items[childIndex],
            project,
            context,
            screenStack,
            `${key}/item:${childIndex}`,
            includeInspectionAttributes,
            signal,
          );
        }
      } else {
        await this.appendContainerAsync(html, item, item.items, project, context, screenStack, key, includeInspectionAttributes, signal);
      }
    } else if (item instanceof HmiLayoutContainerBase || item instanceof HmiContainerBase) {
      await this.appendContainerAsync(html, item, item.items, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiScreenWindow) {
      await this.appendScreenWindowAsync(html, item, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiAlarmControl) {
      appendDiv(html, item, context.options.unsupportedItemPlaceholderCssClass, "Alarm control", context);
    } else if (item instanceof HmiUnkown) {
      appendDiv(html, item, undefined, `Unkown:${item.type ?? ""}`, context);
    } else {
      appendDiv(html, item, context.options.unsupportedItemPlaceholderCssClass, item.constructor.name, context);
    }
  }

  private async appendSymbolContainerAsync(
    html: string[],
    symbolContainer: HmiSymbolContainer,
    project: IHmiProject | undefined,
    context: HmiHtmlConvertContext,
    screenStack: Set<string>,
    key: string,
    includeInspectionAttributes: boolean,
    signal?: AbortSignal,
  ): Promise<void> {
    const image = getStaticValue(symbolContainer.image);
    const imageUri = await resolveImageUri(image, project, signal);
    html.push("<div");
    appendSymbolAttributes(html, symbolContainer, context);
    html.push(">");
    if (imageUri?.trim()) {
      appendSymbolImage(html, symbolContainer, image, imageUri);
    }
    for (let childIndex = 0; childIndex < symbolContainer.items.length; childIndex++) {
      await this.appendItemAsync(
        html,
        symbolContainer.items[childIndex],
        project,
        context,
        screenStack,
        `${key}/item:${childIndex}`,
        includeInspectionAttributes,
        signal,
      );
    }
    html.push("</div>");
  }

  private async appendGraphicViewAsync(
    html: string[],
    graphicView: HmiGraphicView,
    project: IHmiProject | undefined,
    context: HmiHtmlConvertContext,
    signal?: AbortSignal,
  ): Promise<void> {
    const image = getStaticValue(graphicView.image);
    let imageUri = await resolveImageUri(image, project, signal);
    if (!imageUri?.trim()) {
      const source = getStaticValue(graphicView.source);
      imageUri = resolveMetafileDataUri(source ?? "") ?? source;
    }

    appendImage(html, graphicView, imageUri, context);
  }

  private async appendContainerAsync(
    html: string[],
    container: HmiScreenItemBase,
    items: readonly HmiScreenItemBase[],
    project: IHmiProject | undefined,
    context: HmiHtmlConvertContext,
    screenStack: Set<string>,
    key: string,
    includeInspectionAttributes: boolean,
    signal?: AbortSignal,
  ): Promise<void> {
    html.push("<div");
    appendCommonAttributes(html, container, context);
    html.push(">");
    if (container instanceof HmiLayoutContainerBase && container.childCoordinateSpace === HmiChildCoordinateSpace.ScreenAbsolute) {
      const childContext = context.withPositionOffset(-getStaticValueOrDefault(container.x, 0), -getStaticValueOrDefault(container.y, 0));
      for (let childIndex = 0; childIndex < items.length; childIndex++) {
        await this.appendItemAsync(
          html,
          items[childIndex],
          project,
          childContext,
          screenStack,
          `${key}/item:${childIndex}`,
          includeInspectionAttributes,
          signal,
        );
      }
    } else {
      for (let childIndex = 0; childIndex < items.length; childIndex++) {
        await this.appendItemAsync(
          html,
          items[childIndex],
          project,
          context,
          screenStack,
          `${key}/item:${childIndex}`,
          includeInspectionAttributes,
          signal,
        );
      }
    }
    html.push("</div>");
  }

  private async appendScreenWindowAsync(
    html: string[],
    screenWindow: HmiScreenWindow,
    project: IHmiProject | undefined,
    context: HmiHtmlConvertContext,
    screenStack: Set<string>,
    key: string,
    includeInspectionAttributes: boolean,
    signal?: AbortSignal,
  ): Promise<void> {
    const screenId = getStaticValue(screenWindow.screenId);
    const screenName = getStaticValue(screenWindow.screenName);
    let resolved = project && screenId ? await project.getScreen(screenId, signal) : undefined;
    if (resolved === undefined && project && screenName) {
      resolved = await project.getScreen(screenName, signal);
    }
    html.push("<div");
    appendCommonAttributes(html, screenWindow, context);
    html.push(">");
    if (resolved === undefined) {
      html.push("<div");
      appendAttribute(html, "class", context.options.missingScreenPlaceholderCssClass);
      html.push(">");
      html.push(escapeHtml(screenName ?? screenId ?? "Missing screen"));
      html.push("</div>");
    } else if (getScreenReferenceKeys(resolved).some(candidate => screenStack.has(candidate))) {
      html.push("<div");
      appendAttribute(html, "class", context.options.missingScreenPlaceholderCssClass);
      html.push(">Recursive screen reference</div>");
    } else {
      html.push(await this.convertCoreAsync(
        resolved,
        project,
        context,
        false,
        screenStack,
        `${key}/subscreen`,
        includeInspectionAttributes,
        signal,
      ));
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

function appendLine(html: string[], line: HmiLine, context: HmiHtmlConvertContext): void {
  const width = getStaticValueOrDefault(line.width, 0);
  const height = getStaticValueOrDefault(line.height, 0);
  appendSvgOpen(html, line, getSvgWidth(line), getSvgHeight(line), context);
  html.push("<line");
  appendSvgAttribute(html, "x1", toSvgLineX(line, getStaticValueOrDefault(line.x1, 0)));
  appendSvgAttribute(html, "y1", toSvgLineY(line, getStaticValueOrDefault(line.y1, 0)));
  appendSvgAttribute(html, "x2", toSvgLineX(line, getStaticValueOrDefault(line.x2, width)));
  appendSvgAttribute(html, "y2", toSvgLineY(line, getStaticValueOrDefault(line.y2, height)));
  appendStrokeAttributes(html, line, undefined, context);
  html.push("></line></svg>");
}

function appendPointShape(html: string[], shape: HmiPointBasedShapeBase, elementName: string, fill: boolean, context: HmiHtmlConvertContext): void {
  appendSvgOpen(html, shape, getSvgWidth(shape), getSvgHeight(shape), context);
  html.push(`<${elementName}`);
  appendAttribute(html, "points", shape.points.map((point) => toSvgPoint(shape, point)).join(" "));
  appendStrokeAttributes(html, shape, fill ? getFillColor(shape, context) : undefined, context);
  html.push(`></${elementName}></svg>`);
}

function appendCircle(html: string[], circle: HmiCircle, context: HmiHtmlConvertContext): void {
  const width = getSvgWidth(circle);
  const height = getSvgHeight(circle);
  appendSvgOpen(html, circle, width, height, context);
  html.push("<circle");
  appendSvgAttribute(html, "cx", getStaticValueOrDefault(circle.centerX, width / 2));
  appendSvgAttribute(html, "cy", getStaticValueOrDefault(circle.centerY, height / 2));
  appendSvgAttribute(html, "r", getStaticValueOrDefault(circle.radius, Math.min(width, height) / 2));
  appendStrokeAttributes(html, circle, getFillColor(circle, context), context);
  html.push("></circle></svg>");
}

function appendEllipse(html: string[], ellipse: HmiEllipse, context: HmiHtmlConvertContext): void {
  const width = getSvgWidth(ellipse);
  const height = getSvgHeight(ellipse);
  appendSvgOpen(html, ellipse, width, height, context);
  html.push("<ellipse");
  appendSvgAttribute(html, "cx", getStaticValueOrDefault(ellipse.centerX, width / 2));
  appendSvgAttribute(html, "cy", getStaticValueOrDefault(ellipse.centerY, height / 2));
  appendSvgAttribute(html, "rx", getStaticValueOrDefault(ellipse.radiusX, width / 2));
  appendSvgAttribute(html, "ry", getStaticValueOrDefault(ellipse.radiusY, height / 2));
  appendStrokeAttributes(html, ellipse, getFillColor(ellipse, context), context);
  html.push("></ellipse></svg>");
}

function appendCircularArc(html: string[], arc: HmiCircularArc, context: HmiHtmlConvertContext): void {
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
    context,
  );
}

function appendEllipticalArc(html: string[], arc: HmiEllipticalArc, context: HmiHtmlConvertContext): void {
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
    context,
  );
}

function appendCircularSegment(html: string[], segment: HmiCircleSegment, context: HmiHtmlConvertContext): void {
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
    context,
  );
}

function appendEllipticalSegment(html: string[], segment: HmiEllipseSegment, context: HmiHtmlConvertContext): void {
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
    context,
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
  context: HmiHtmlConvertContext,
): void {
  appendSvgOpen(html, item, getSvgWidth(item), getSvgHeight(item), context);
  html.push("<path");
  appendAttribute(html, "d", createArcPath(centerX, centerY, radiusX, radiusY, startAngle, sweepAngle, segment));
  appendStrokeAttributes(html, item, segment ? getFillColor(item, context) : undefined, context);
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

function appendSvgOpen(html: string[], item: HmiScreenItemBase, width: number, height: number, context: HmiHtmlConvertContext): void {
  html.push("<svg");
  appendCommonAttributes(html, item, context, false);
  appendAttribute(html, "viewBox", `0 0 ${toCss(Math.max(width, 1))} ${toCss(Math.max(height, 1))}`);
  appendAttribute(html, "xmlns", "http://www.w3.org/2000/svg");
  html.push(">");
}

function appendStrokeAttributes(html: string[], item: HmiShapeBase, fillColor: HmiColor | undefined, context: HmiHtmlConvertContext): void {
  appendAttribute(html, "fill", fillColor === undefined ? "none" : colorToCss(fillColor));
  appendAttribute(html, "stroke", colorToCss(getStrokeColor(item, context)));
  appendSvgAttribute(html, "stroke-width", getStrokeWidth(item, context));
}

function getStrokeColor(item: HmiShapeBase, context: HmiHtmlConvertContext): HmiColor {
  return (
    context.effectiveProperties.tryGetStaticValue<HmiColor>(item, "LineColor", item.lineColor).value ??
    (item instanceof HmiPaintedScreenItemBase
      ? context.effectiveProperties.tryGetStaticValue<HmiColor>(item, "BorderColor", item.borderColor).value
      : undefined) ??
    (item instanceof HmiPaintedScreenItemBase
      ? context.effectiveProperties.tryGetStaticValue<HmiColor>(item, "ForegroundColor", item.foregroundColor).value
      : undefined) ??
    { alpha: 255, red: 0, green: 0, blue: 0 }
  );
}

function getFillColor(item: HmiShapeBase, context: HmiHtmlConvertContext): HmiColor | undefined {
  return context.effectiveProperties.tryGetStaticValue<HmiColor>(item, "BackgroundColor", item.backgroundColor).value;
}

function getStrokeWidth(item: HmiShapeBase, context: HmiHtmlConvertContext): number {
  return (
    context.effectiveProperties.tryGetStaticValue<number>(item, "LineWidth", item.lineWidth).value ??
    (item instanceof HmiPaintedScreenItemBase
      ? context.effectiveProperties.tryGetStaticValue<number>(item, "BorderWidth", item.borderWidth).value
      : undefined) ??
    1
  );
}

function appendButton(html: string[], button: HmiButton, context: HmiHtmlConvertContext): void {
  html.push("<button");
  appendCommonAttributes(html, button, context);
  html.push(">");
  const image = getStaticValue(button.image);
  if (image?.uri) {
    appendInnerImage(html, image.uri);
  }
  appendMultilingualText(html, getStaticValue(button.text), context);
  html.push("</button>");
}

function appendInput(html: string[], ioField: HmiIOField, context: HmiHtmlConvertContext): void {
  html.push("<input");
  appendCommonAttributes(html, ioField, context);
  html.push(">");
}

function appendSymbolicInput(html: string[], symbolicIoField: HmiSymbolicIOField, context: HmiHtmlConvertContext): void {
  html.push("<select");
  appendCommonAttributes(html, symbolicIoField, context);
  html.push(">");
  const selectedValue = getStaticValue(symbolicIoField.value);
  for (const state of symbolicIoField.states) {
    html.push("<option");
    if (state.value !== undefined)
      appendAttribute(html, "value", toCss(state.value));
    if (selectedValue !== undefined && state.value === selectedValue)
      appendAttribute(html, "selected", "selected");
    html.push(">");
    appendMultilingualText(html, state.text, context);
    html.push("</option>");
  }
  html.push("</select>");
}

function appendToggleSwitch(html: string[], toggleSwitch: HmiToggleSwitch, context: HmiHtmlConvertContext): void {
  html.push("<hmi-toggle-switch");
  appendCommonAttributes(html, toggleSwitch, context);
  appendStaticAttribute(
    html,
    "mode",
    context.effectiveProperties.resolve<HmiSwitchType>(toggleSwitch, "Mode", toggleSwitch.mode),
  );
  appendTextAttribute(html, "text", toggleSwitch.text, context);
  appendTextAttribute(html, "alternate-text", toggleSwitch.alternateText, context);
  appendAttribute(html, "image", getStaticValue(toggleSwitch.image)?.uri);
  appendAttribute(html, "alternate-image", getStaticValue(toggleSwitch.alternateImage)?.uri);
  appendStaticAttribute(html, "header", toggleSwitch.header);
  appendTextAttribute(html, "header-text", toggleSwitch.headerText, context);
  html.push("></hmi-toggle-switch>");
}

async function appendSelectionGroup(
  html: string[],
  elementName: string,
  selectionGroup: HmiSelectionGroupBase,
  project: IHmiProject | undefined,
  context: HmiHtmlConvertContext,
  signal?: AbortSignal,
): Promise<void> {
  html.push(`<${elementName}`);
  appendCommonAttributes(html, selectionGroup, context);
  appendStaticAttribute(html, "selected-index", selectionGroup.selectedIndex);
  appendStaticAttribute(html, "selection-item-height", selectionGroup.selectionItemHeight);
  appendStaticAttribute(html, "selection-background-color", selectionGroup.selectionBackgroundColor);
  appendStaticAttribute(html, "selection-foreground-color", selectionGroup.selectionForegroundColor);
  appendStaticAttribute(html, "selection-border-color", selectionGroup.selectionBorderColor);
  appendStaticAttribute(html, "selection-border-width", selectionGroup.selectionBorderWidth);
  html.push(">");
  for (const item of selectionGroup.items) {
    await appendSelectionGroupItem(html, item, project, signal);
  }
  html.push(`</${elementName}>`);
}

async function appendSelectionGroupItem(
  html: string[],
  item: HmiSelectionGroupItem,
  project: IHmiProject | undefined,
  signal?: AbortSignal,
): Promise<void> {
  html.push("<span slot=\"item\"");
  appendAttribute(html, "text", item.text);
  appendAttribute(html, "image", await resolveImageUri(item.image, project, signal));
  appendAttribute(html, "image-name", item.imageName ?? item.image?.imageName);
  html.push("></span>");
}

function appendTextBlock(
  html: string[],
  item: HmiScreenItemBase,
  text: HmiProperty<HmiMultilingualText> | undefined,
  context: HmiHtmlConvertContext,
): void {
  html.push("<div");
  appendCommonAttributes(html, item, context, undefined, "overflow: hidden;");
  html.push(">");
  appendMultilingualText(html, getStaticValue(text), context);
  html.push("</div>");
}

function appendRectangle(html: string[], rectangle: HmiRectangle, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendAttribute(html, "id", rectangle.name);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  html.push(" style=\"position: absolute;");
  appendPosition(html, rectangle, context);
  appendStyle(html, rectangle, context);
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
  context: HmiHtmlConvertContext,
): void {
  if (!uri?.trim()) {
    appendDiv(html, item, undefined, undefined, context);
    return;
  }

  html.push("<img");
  appendCommonAttributes(html, item, context);
  appendAttribute(html, "src", uri);
  html.push(">");
}

function appendSymbolLibraryControl(
  html: string[],
  symbolLibraryControl: HmiSymbolLibraryControl,
  context: HmiHtmlConvertContext,
): void {
  const symbolSvg = resolveImageSvg(symbolLibraryControl.symbol);
  if (symbolSvg?.trim()) {
    html.push("<div");
    appendSymbolLibraryAttributes(html, symbolLibraryControl, context);
    html.push(">");
    html.push(normalizeEmbeddedSymbolSvg(symbolSvg, symbolLibraryControl));
    html.push("</div>");
    return;
  }

  const imageUri = resolveImageUriFromImage(symbolLibraryControl.symbol);
  if (!imageUri?.trim()) {
    appendDiv(html, symbolLibraryControl, context.options.unsupportedItemPlaceholderCssClass, "Symbol library control", context);
    return;
  }

  html.push("<div");
  appendSymbolLibraryAttributes(html, symbolLibraryControl, context);
  html.push(">");
  html.push("<img");
  appendAttribute(html, "src", imageUri);
  appendAttribute(html, "alt", symbolLibraryControl.symbol?.name ?? symbolLibraryControl.name);
  appendAttribute(html, "data-hmi-symbol-id", symbolLibraryControl.symbolId);
  html.push(" style=\"width: 100%; height: 100%; display: block;");
  html.push(getStaticValueOrDefault(symbolLibraryControl.fixedAspectRatio, false) ? "object-fit: contain;" : "object-fit: fill;");
  html.push("\">");
  html.push("</div>");
}

function normalizeEmbeddedSymbolSvg(svg: string, symbolLibraryControl: HmiSymbolLibraryControl): string {
  const svgStart = svg.toLowerCase().indexOf("<svg");
  if (svgStart < 0) {
    return svg;
  }

  const svgTagEnd = svg.indexOf(">", svgStart);
  if (svgTagEnd < 0) {
    return svg;
  }

  const rootTag = svg.substring(svgStart, svgTagEnd);
  const existingStyle = tryGetAttributeValue(rootTag, "style");
  const normalizedStyle = appendCssDeclaration(
    existingStyle,
    "width: 100%; height: 100%; display: block;",
  );
  let result = svg;
  const attributes: string[] = [];
  if (existingStyle === undefined) {
    attributes.push(` style="${escapeHtml(normalizedStyle)}"`);
  } else {
    result = replaceAttributeValue(result, svgStart, svgTagEnd, "style", normalizedStyle);
  }
  if (!/preserveAspectRatio\s*=/i.test(rootTag)) {
    attributes.push(getStaticValueOrDefault(symbolLibraryControl.fixedAspectRatio, false)
      ? " preserveAspectRatio=\"xMidYMid meet\""
      : " preserveAspectRatio=\"none\"");
  }
  if (symbolLibraryControl.symbolId?.trim()) {
    attributes.push(` data-hmi-symbol-id="${escapeHtml(symbolLibraryControl.symbolId)}"`);
  }

  return attributes.length === 0 ? result : result.slice(0, svgTagEnd) + attributes.join("") + result.slice(svgTagEnd);
}

function tryGetAttributeValue(tag: string, attributeName: string): string | undefined {
  const pattern = new RegExp(`${attributeName}\\s*=\\s*"([^"]*)"`, "i");
  return pattern.exec(tag)?.[1];
}

function appendCssDeclaration(existingStyle: string | undefined, declaration: string): string {
  if (!existingStyle?.trim()) {
    return declaration;
  }

  return `${existingStyle}${existingStyle.trimEnd().endsWith(";") ? " " : "; "}${declaration}`;
}

function replaceAttributeValue(
  value: string,
  tagStart: number,
  tagEnd: number,
  attributeName: string,
  attributeValue: string,
): string {
  const tag = value.substring(tagStart, tagEnd);
  const match = new RegExp(`${attributeName}\\s*=\\s*"([^"]*)"`, "i").exec(tag);
  if (match?.index === undefined) {
    return value;
  }

  const valueStart = tagStart + match.index + match[0].indexOf("\"") + 1;
  const valueEnd = valueStart + match[1].length;
  return value.substring(0, valueStart) + escapeHtml(attributeValue) + value.substring(valueEnd);
}

function appendSymbolLibraryAttributes(
  html: string[],
  symbolLibraryControl: HmiSymbolLibraryControl,
  context: HmiHtmlConvertContext,
): void {
  appendAttribute(html, "id", symbolLibraryControl.name);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  appendAttribute(html, "data-hmi-symbol-id", symbolLibraryControl.symbolId);
  appendAttribute(html, "data-hmi-symbol-appearance", formatAttributeValue(getStaticValue(symbolLibraryControl.symbolAppearance)));
  appendAttribute(html, "data-hmi-fill-color-mode", formatAttributeValue(getStaticValue(symbolLibraryControl.fillColorMode)));
  appendAttribute(html, "data-hmi-blink-mode", formatAttributeValue(getStaticValue(symbolLibraryControl.blinkMode)));
  html.push(" style=\"position: absolute; overflow: hidden;");
  appendPosition(html, symbolLibraryControl, context);
  if (
    getStaticValueOrDefault(symbolLibraryControl.backFillStyle, HmiSymbolLibraryBackFillStyle.Transparent) ===
      HmiSymbolLibraryBackFillStyle.Solid &&
    getStaticValue(symbolLibraryControl.backColor) !== undefined
  ) {
    html.push(`background-color: ${colorToCss(getStaticValue(symbolLibraryControl.backColor)!)};`);
  }
  appendSymbolLibraryTransform(html, symbolLibraryControl);
  html.push("\"");
}

function appendSymbolLibraryTransform(html: string[], symbolLibraryControl: HmiSymbolLibraryControl): void {
  const transforms: string[] = [];
  switch (getStaticValueOrDefault(symbolLibraryControl.flip, HmiSymbolLibraryFlip.None)) {
    case HmiSymbolLibraryFlip.Horizontal:
      transforms.push("scaleX(-1)");
      break;
    case HmiSymbolLibraryFlip.Vertical:
      transforms.push("scaleY(-1)");
      break;
    case HmiSymbolLibraryFlip.Both:
      transforms.push("scale(-1, -1)");
      break;
  }

  switch (getStaticValueOrDefault(symbolLibraryControl.rotation, HmiSymbolLibraryRotation.Angle0)) {
    case HmiSymbolLibraryRotation.Angle90:
      transforms.push("rotate(90deg)");
      break;
    case HmiSymbolLibraryRotation.Angle180:
      transforms.push("rotate(180deg)");
      break;
    case HmiSymbolLibraryRotation.Angle270:
      transforms.push("rotate(270deg)");
      break;
  }

  if (transforms.length > 0) {
    html.push(`transform: ${transforms.join(" ")};transform-origin: center;`);
  }
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

function appendDynamicSvg(html: string[], dynamicSvg: HmiDynamicSvg, context: HmiHtmlConvertContext): void {
  html.push("<node-projects-svghmi");
  appendCommonAttributes(html, dynamicSvg, context);
  appendAttribute(
    html,
    "src",
    getStaticValue(dynamicSvg.image)?.uri,
  );
  for (const property of dynamicSvg.properties) {
    appendAttribute(html, toDynamicSvgAttributeName(property.name), formatDynamicSvgPropertyValue(getStaticValue(property.value)));
  }
  html.push("></node-projects-svghmi>");
}

function appendGauge(html: string[], gauge: HmiGauge, context: HmiHtmlConvertContext): void {
  html.push("<hmi-gauge");
  appendCommonAttributes(html, gauge, context);
  appendStaticAttribute(html, "background-color", context.effectiveProperties.resolve(gauge, "BackgroundColor", gauge.backgroundColor));
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

function appendTrendControl(html: string[], trendControl: HmiTrendControl, context: HmiHtmlConvertContext): void {
  html.push("<hmi-trend-control");
  appendCommonAttributes(html, trendControl, context);
  appendAttribute(html, "control-name", trendControl.name);
  appendAttribute(html, "type-name", "Trend control");
  html.push("></hmi-trend-control>");
}

function appendBooleanAttribute(html: string[], name: string, value: boolean): void {
  if (value) {
    html.push(` ${name}`);
  }
}

function appendTextAttribute(
  html: string[],
  name: string,
  property: HmiProperty<HmiMultilingualText> | undefined,
  context: HmiHtmlConvertContext,
): void {
  const value = getStaticValue(property);
  if (value === undefined) {
    return;
  }

  appendAttribute(html, name, value.getDisplayText(context.options.cultureLcid));
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

function appendMultilingualText(
  html: string[],
  text: HmiMultilingualText | undefined,
  context: HmiHtmlConvertContext,
): void {
  if (text === undefined) {
    return;
  }

  const formattedBody = text.getFormattedTextBody(context.options.cultureLcid);
  if (formattedBody.trim() !== "") {
    html.push(formattedBody);
    return;
  }

  html.push(escapeHtml(text.getText(context.options.cultureLcid)));
}

function formatFont(font: HmiFont | undefined): string | undefined {
  if (font === undefined) {
    return undefined;
  }

  const values: Record<string, string | number | boolean> = {};
  addFontValue(values, "name", font.name);
  addFontValue(values, "size", font.size);
  addFontValue(values, "characterWidth", font.characterWidth);
  addFontValue(values, "escapementAngle", font.escapementAngle);
  addFontValue(values, "orientationAngle", font.orientationAngle);
  addFontValue(values, "weight", font.weight);
  addFontValue(values, "bold", font.bold);
  addFontValue(values, "italic", font.italic);
  addFontValue(values, "underline", font.underline);
  addFontValue(values, "strikethrough", font.strikethrough);
  addFontValue(values, "characterSet", font.characterSet);
  addFontValue(values, "outputPrecision", font.outputPrecision);
  addFontValue(values, "clippingPrecision", font.clippingPrecision);
  addFontValue(values, "quality", font.quality);
  addFontValue(values, "pitchAndFamily", font.pitchAndFamily);

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
    return colorToHmi(value);
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

function appendDiv(
  html: string[],
  item: HmiScreenItemBase,
  cssClass: string | undefined,
  content: string | undefined,
  context: HmiHtmlConvertContext,
): void {
  html.push("<div");
  appendCommonAttributes(html, item, context);
  appendAttribute(html, "class", cssClass);
  html.push(">");
  if (content) {
    html.push(escapeHtml(content));
  }
  html.push("</div>");
}

function appendCommonAttributes(
  html: string[],
  item: HmiScreenItemBase,
  context: HmiHtmlConvertContext,
  includePaintedStyle = true,
  additionalStyle: string | null = null
): void {
  appendAttribute(html, "id", item.name);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  html.push(" style=\"position: absolute;");
  appendPosition(html, item, context);
  if (includePaintedStyle && item instanceof HmiPaintedScreenItemBase) {
    appendStyle(html, item, context);
  }
  if (additionalStyle) {
    html.push(additionalStyle);
  }
  appendItemTransform(html, item);
  html.push("\"");
}

function appendItemTransform(html: string[], item: HmiScreenItemBase): void {
  const rotationAngle = getStaticValue(item.rotationAngle);
  if (rotationAngle === undefined) return;

  html.push(`transform: rotate(${toCss(rotationAngle)}deg);`);
  const rotationCenterX = getStaticValue(item.rotationCenterX);
  const rotationCenterY = getStaticValue(item.rotationCenterY);
  if (rotationCenterX !== undefined && rotationCenterY !== undefined) {
    html.push(`transform-origin: ${toCss(rotationCenterX)}px ${toCss(rotationCenterY)}px;`);
  } else {
    html.push("transform-origin: center;");
  }
}

function appendSymbolAttributes(html: string[], symbolContainer: HmiSymbolContainer, context: HmiHtmlConvertContext): void {
  appendAttribute(html, "id", symbolContainer.name);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  appendAttribute(html, "data-hmi-fill-color-mode", getStaticValue(symbolContainer.fillColorMode));
  appendAttribute(html, "data-hmi-flip", getStaticValue(symbolContainer.flip));
  html.push(" style=\"position: absolute; overflow: hidden;");
  appendPosition(html, symbolContainer, context);
  appendStyle(html, symbolContainer, context);
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

function appendPosition(html: string[], item: HmiScreenItemBase, context: HmiHtmlConvertContext): void {
  html.push(`left: ${toCss(getStaticValueOrDefault(item.x, 0) + context.positionOffsetX)}px;`);
  html.push(`top: ${toCss(getStaticValueOrDefault(item.y, 0) + context.positionOffsetY)}px;`);
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

function hasThicknessEdges(value: unknown): value is {
  top: HmiProperty<number>;
  right: HmiProperty<number>;
  bottom: HmiProperty<number>;
  left: HmiProperty<number>;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "top" in value &&
    "right" in value &&
    "bottom" in value &&
    "left" in value
  );
}

function appendStyle(html: string[], item: HmiPaintedScreenItemBase, context: HmiHtmlConvertContext): void {
  const suppressBorderStyle = item instanceof HmiCheckBoxGroup || item instanceof HmiRadioButtonGroup;
  appendColorStyle(html, "color", context.effectiveProperties.resolve(item, "ForegroundColor", item.foregroundColor));
  if (!(item instanceof HmiGauge)) {
    appendColorStyle(html, "background-color", context.effectiveProperties.resolve(item, "BackgroundColor", item.backgroundColor));
  }
  appendColorStyle(html, "border-color", context.effectiveProperties.resolve(item, "BorderColor", item.borderColor));
  appendWidthStyle(html, context.effectiveProperties.resolve(item, "BorderWidth", item.borderWidth), !suppressBorderStyle);
  if (item.margin !== undefined) {
    html.push(
      `margin: ${toCss(getStaticValueOrDefault(item.margin.top, 0))}px ${toCss(
        getStaticValueOrDefault(item.margin.right, 0),
      )}px ${toCss(getStaticValueOrDefault(item.margin.bottom, 0))}px ${toCss(
        getStaticValueOrDefault(item.margin.left, 0),
      )}px;`,
    );
  }
  if (hasThicknessEdges(item.padding)) {
    html.push(
      `padding: ${toCss(getStaticValueOrDefault(item.padding.top, 0))}px ${toCss(
        getStaticValueOrDefault(item.padding.right, 0),
      )}px ${toCss(getStaticValueOrDefault(item.padding.bottom, 0))}px ${toCss(
        getStaticValueOrDefault(item.padding.left, 0),
      )}px;`,
    );
  }

  const font = getFont(item);
  if (font !== undefined) {
    appendFont(html, font);
  }

  const horizontalAlignment = getStaticValue(
    context.effectiveProperties.resolve(item, "HorizontalAlignment", getHorizontalAlignment(item)),
  );
  if (horizontalAlignment !== undefined) {
    html.push(`text-align: ${horizontalAlignmentToCss(horizontalAlignment)};`);
    html.push(`justify-content: ${horizontalAlignmentToFlexCss(horizontalAlignment)};`);
  }

  const verticalAlignment = getStaticValue(
    context.effectiveProperties.resolve(item, "VerticalAlignment", getVerticalAlignment(item)),
  );
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

function appendWidthStyle(html: string[], property: HmiProperty<number> | undefined, includeBorderStyle = true): void {
  const value = getStaticValue(property);
  if (value !== undefined) {
    if (includeBorderStyle) {
      html.push("border-style: solid;");
    }
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

function appendGlobalStyle(html: string[]): void {
  html.push("<style>");
  html.push(hmiHtmlCommonStyle);
  html.push("</style>");
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

function toSvgPoint(shape: HmiPointBasedShapeBase, point: HmiPoint): string {
  let x = point.x;
  let y = point.y;
  if (shape.pointCoordinateSpace === HmiPointCoordinateSpace.ScreenAbsolute) {
    x -= getStaticValueOrDefault(shape.x, 0);
    y -= getStaticValueOrDefault(shape.y, 0);
  }

  return `${toCss(x)},${toCss(y)}`;
}

function toSvgLineX(line: HmiLine, x: number): number {
  return line.pointCoordinateSpace === HmiPointCoordinateSpace.ScreenAbsolute
    ? x - getStaticValueOrDefault(line.x, 0)
    : x;
}

function toSvgLineY(line: HmiLine, y: number): number {
  return line.pointCoordinateSpace === HmiPointCoordinateSpace.ScreenAbsolute
    ? y - getStaticValueOrDefault(line.y, 0)
    : y;
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

function colorToHmi(color: HmiColor): string {
  return `0x${toHex(color.alpha)}${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
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

function horizontalAlignmentToFlexCss(alignment: HmiHorizontalAlignment): string {
  switch (alignment) {
    case HmiHorizontalAlignment.Left:
      return "flex-start";
    case HmiHorizontalAlignment.Right:
      return "flex-end";
    case HmiHorizontalAlignment.Stretch:
      return "stretch";
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
    return resolveMetafileDataUri(image.uri) ?? image.uri;
  }
  if (project === undefined || !image.imageId?.trim()) {
    return undefined;
  }

  const resolved = await project.getImage(image.imageId, signal);
  return resolveImageUriFromImage(resolved);
}

function resolveMetafileDataUri(uri: string): string | undefined {
  const base64Marker = ";base64,";
  if (!uri.toLowerCase().startsWith("data:")) {
    return undefined;
  }

  const markerIndex = uri.toLowerCase().indexOf(base64Marker);
  if (markerIndex < 0) {
    return undefined;
  }

  const mediaType = uri.substring(5, markerIndex);
  if (!isMetafileMimeType(mediaType)) {
    return undefined;
  }

  try {
    const data = fromBase64(uri.substring(markerIndex + base64Marker.length));
    const extension = mediaType.toLowerCase().includes("wmf") ? ".wmf" : ".emf";
    const svg = new MetafileToSvgRenderer().render(data, extension);
    return svg?.trim() ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : undefined;
  } catch {
    return undefined;
  }
}

function resolveImageUriFromImage(image: HmiImage | undefined): string | undefined {
  if (image === undefined || image.data.byteLength === 0) {
    return undefined;
  }

  if (isMetafileImage(image)) {
    const svg = new MetafileToSvgRenderer().render(image.data, getImageExtension(image));
    if (svg?.trim()) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
  }

  const mimeType = image.mimeType?.trim() || getMimeType(image);
  return `data:${mimeType};base64,${toBase64(image.data)}`;
}

function resolveImageSvg(image: HmiImage | undefined): string | undefined {
  if (image === undefined || image.data.byteLength === 0) {
    return undefined;
  }

  if (isMetafileImage(image)) {
    return new MetafileToSvgRenderer().render(image.data, getImageExtension(image)) ?? undefined;
  }

  if (image.imageType === HmiImageType.Svg || image.mimeType?.toLowerCase() === "image/svg+xml") {
    return new TextDecoder().decode(image.data);
  }

  return undefined;
}

function isMetafileImage(image: HmiImage): boolean {
  return (
    image.imageType === HmiImageType.Emf ||
    image.imageType === HmiImageType.Wmf ||
    isMetafileMimeType(image.mimeType) ||
    isMetafileExtension(getExtensionFromName(image.name))
  );
}

function isMetafileMimeType(mimeType: string | undefined): boolean {
  if (!mimeType?.trim()) {
    return false;
  }

  const normalized = mimeType.toLowerCase();
  return normalized.includes("emf") || normalized.includes("wmf") || normalized.includes("metafile");
}

function getImageExtension(image: HmiImage): string | undefined {
  switch (image.imageType) {
    case HmiImageType.Emf:
      return ".emf";
    case HmiImageType.Wmf:
      return ".wmf";
    default:
      return getExtensionFromName(image.name);
  }
}

function getExtensionFromName(name: string | undefined): string | undefined {
  if (!name?.trim()) {
    return undefined;
  }

  const index = name.lastIndexOf(".");
  return index >= 0 ? name.substring(index).toLowerCase() : undefined;
}

function isMetafileExtension(extension: string | undefined): boolean {
  return extension === ".emf" || extension === ".wmf";
}

function getMimeType(image: HmiImage): string {
  switch (image.imageType) {
    case HmiImageType.Png:
      return "image/png";
    case HmiImageType.Bmp:
      return "image/bmp";
    case HmiImageType.Jpg:
      return "image/jpeg";
    case HmiImageType.Gif:
      return "image/gif";
    case HmiImageType.Svg:
      return "image/svg+xml";
    case HmiImageType.Emf:
      return "image/x-emf";
    case HmiImageType.Wmf:
      return "image/x-wmf";
    case HmiImageType.Ico:
      return "image/x-icon";
    case HmiImageType.Tif:
      return "image/tiff";
    default:
      return "application/octet-stream";
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
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
        result += code >= 160 && code <= 255 ? `&#${code};` : char;
        break;
      }
    }
  }
  return result;
}

class HmiHtmlConvertContext {
  constructor(
    readonly options: HmiHtmlConvertOptions,
    readonly effectiveProperties: HmiEffectivePropertyResolver,
    readonly positionOffsetX = 0,
    readonly positionOffsetY = 0,
    readonly nodeKey?: string,
  ) {}

  withPositionOffset(offsetX: number, offsetY: number): HmiHtmlConvertContext {
    return new HmiHtmlConvertContext(
      this.options,
      this.effectiveProperties,
      this.positionOffsetX + offsetX,
      this.positionOffsetY + offsetY,
      this.nodeKey,
    );
  }

  withNodeKey(nodeKey: string | undefined): HmiHtmlConvertContext {
    return new HmiHtmlConvertContext(
      this.options,
      this.effectiveProperties,
      this.positionOffsetX,
      this.positionOffsetY,
      nodeKey,
    );
  }
}
