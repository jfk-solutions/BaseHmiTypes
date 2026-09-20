import { HmiCharacterScreen } from "../../screens/screen/HmiCharacterScreen.js";
import { IHmiProject } from "../../projects/IHmiProject.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiImage } from "../../images/HmiImage.js";
import { HmiImageType } from "../../images/HmiImageType.js";
import { MetafileToSvgRenderer } from "../../images/converters/metafile-to-svg-renderer.js";
import { HmiProjectSoftwareType } from "../../projects/HmiProjectSoftwareType.js";
import { HmiColor, hmiColorFromArgb } from "../../screens/base/HmiColor.js";
import { HmiChildCoordinateSpace } from "../../screens/base/HmiChildCoordinateSpace.js";
import { HmiContainerBase } from "../../screens/base/HmiContainerBase.js";
import { HmiCustomWidgetContainer } from "../../screens/base/HmiCustomWidgetContainer.js";
import { HmiDynamicSvg } from "../../screens/base/HmiDynamicSvg.js";
import { HmiDotNetControlContainer } from "../../screens/base/HmiDotNetControlContainer.js";
import { HmiFont } from "../../screens/base/HmiFont.js";
import { HmiFillAnimation } from "../../screens/base/HmiFillAnimation.js";
import { HmiFillDirection } from "../../screens/base/HmiFillDirection.js";
import { HmiFillPattern } from "../../screens/base/HmiFillPattern.js";
import { HmiFillPatternAlignment } from "../../screens/base/HmiFillPatternAlignment.js";
import { HmiGradientDirection } from "../../screens/base/HmiGradientDirection.js";
import { HmiGroup } from "../../screens/base/HmiGroup.js";
import { HmiHorizontalAlignment } from "../../screens/base/HmiHorizontalAlignment.js";
import { HmiImageSource } from "../../screens/base/HmiImageSource.js";
import { HmiBackgroundImageLayout } from "../../screens/base/HmiBackgroundImageLayout.js";
import { HmiLayoutContainerBase } from "../../screens/base/HmiLayoutContainerBase.js";
import { HmiLineStyle } from "../../screens/base/HmiLineStyle.js";
import { HmiLineCap } from "../../screens/base/HmiLineCap.js";
import { HmiLineMarker } from "../../screens/base/HmiLineMarker.js";
import { HmiTrendPen } from "../../screens/base/HmiTrendPen.js";
import { HmiPaintedScreenItemBase } from "../../screens/base/HmiPaintedScreenItemBase.js";
import { HmiOcxControl } from "../../screens/base/HmiOcxControl.js";
import { getStaticValue, getStaticValueOrDefault, HmiBlinkProperty, HmiBlinkRate, HmiExpressionProperty, HmiProperty, HmiPropertyKind } from "../../screens/base/HmiProperty.js";
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
import { HmiWindowBase } from "../../screens/base/HmiWindowBase.js";
import { HmiAlarmControl } from "../../screens/controls/HmiAlarmControl.js";
import { HmiAlarmLineControl } from "../../screens/controls/HmiAlarmLineControl.js";
import { HmiAlarmListMode } from "../../screens/controls/HmiAlarmListMode.js";
import { HmiAlarmViewKind } from "../../screens/controls/HmiAlarmViewKind.js";
import { HmiArrowIndicator } from "../../screens/widgets/HmiArrowIndicator.js";
import { HmiAlarmIndicator } from "../../screens/widgets/HmiAlarmIndicator.js";
import { HmiAlarmIndicatorState } from "../../screens/widgets/HmiAlarmIndicatorState.js";
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
import { HmiButtonBase } from "../../screens/widgets/HmiButtonBase.js";
import { HmiBar } from "../../screens/widgets/HmiBar.js";
import { HmiDisabledImageMode } from "../../screens/widgets/HmiDisabledImageMode.js";
import { HmiState } from "../../screens/widgets/HmiState.js";
import { HmiCheckBoxGroup } from "../../screens/widgets/HmiCheckBoxGroup.js";
import { HmiClock } from "../../screens/widgets/HmiClock.js";
import { HmiComboBox } from "../../screens/widgets/HmiComboBox.js";
import { HmiGauge } from "../../screens/widgets/HmiGauge.js";
import { HmiIOField } from "../../screens/widgets/HmiIOField.js";
import { HmiLabel } from "../../screens/widgets/HmiLabel.js";
import { HmiListBox } from "../../screens/widgets/HmiListBox.js";
import { HmiRadioButtonGroup } from "../../screens/widgets/HmiRadioButtonGroup.js";
import { HmiScale } from "../../screens/widgets/HmiScale.js";
import { HmiScaleWidgetBase } from "../../screens/widgets/HmiScaleWidgetBase.js";
import { HmiThresholdValueMode } from "../../screens/widgets/HmiThreshold.js";
import { HmiSelectionGroupBase, HmiSelectionGroupItem } from "../../screens/widgets/HmiSelectionGroupBase.js";
import { HmiSwitchType } from "../../screens/widgets/HmiSwitchType.js";
import { HmiSymbolicIOField } from "../../screens/widgets/HmiSymbolicIOField.js";
import { HmiSlider } from "../../screens/widgets/HmiSlider.js";
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
import { HmiDataGridControl } from "../../screens/controls/HmiDataGridControl.js";
import { HmiAuditTrailControl } from "../../screens/controls/HmiAuditTrailControl.js";
import { HmiAuditTrailViewKind } from "../../screens/controls/HmiAuditTrailViewKind.js";
import { HmiRecipeControl } from "../../screens/controls/HmiRecipeControl.js";
import { HmiRecipeViewKind } from "../../screens/controls/HmiRecipeViewKind.js";
import { HmiRadarChartControl } from "../../screens/controls/HmiRadarChartControl.js";
import { HmiSystemDiagnosisControl } from "../../screens/controls/HmiSystemDiagnosisControl.js";
import { HmiSystemDiagnosisViewKind } from "../../screens/controls/HmiSystemDiagnosisViewKind.js";
import { HmiWebControl } from "../../screens/controls/HmiWebControl.js";
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
    if (screen instanceof HmiCharacterScreen) {
      const html = [context.options.includeMetaCharset ? '<meta charset="utf-8">' : '',
        `<section class="hmi-character-screen" aria-label="${escapeHtml(screen.name ?? "")}">`];
      for (const entry of screen.entries) {
        const text = entry.text.getText(context.options.cultureLcid);
        html.push(`<figure><figcaption>Entry ${escapeHtml(entry.id)}</figcaption><pre style="white-space:pre;overflow:auto;font:16px/1.4 monospace;padding:1em;background:#dce5bc;color:#182018;">`,
          escapeHtml(text).replaceAll("\uFFFC", '<span title="Unresolved field">&#9633;</span>'), '</pre></figure>');
      }
      return html.join("") + '</section>';
    }
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

      const backgroundImageUri = await resolveImageUri(screen.backgroundImage, project, signal);
      html.push("<div");
      appendAttribute(html, "id", screen.name);
      appendAttribute(html, "data-background-image", screen.backgroundImage?.imageName ?? screen.backgroundImage?.imageId);
      appendStaticAttribute(html, "data-background-image-layout", screen.backgroundImageLayout);
      appendStaticAttribute(html, "data-fill-pattern-alignment", screen.fillPatternAlignment);
      if (includeInspectionAttributes) {
        appendAttribute(html, "data-hmi-node-key", key);
      }
      html.push(" style=\"position: relative; overflow: hidden;");
      appendSize(html, getStaticValueOrDefault(screen.width, 0), getStaticValueOrDefault(screen.height, 0));
      appendScreenStyle(html, screen, backgroundImageUri);
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
      await appendToggleSwitch(html, item, project, context, signal);
    } else if (item instanceof HmiCheckBoxGroup) {
      await appendSelectionGroup(html, "hmi-checkbox-group", item, project, context, signal);
    } else if (item instanceof HmiRadioButtonGroup) {
      await appendSelectionGroup(html, "hmi-radio-button-group", item, project, context, signal);
    } else if (item instanceof HmiComboBox) {
      appendComboBox(html, item, context);
    } else if (item instanceof HmiListBox) {
      appendListBox(html, item, context);
    } else if (item instanceof HmiButton) {
      await appendButton(html, item, project, context, signal);
    } else if (item instanceof HmiIOField) {
      appendInput(html, item, context);
    } else if (item instanceof HmiSymbolicIOField) {
      await appendSymbolicInput(html, item, project, context, signal);
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
    } else if (item instanceof HmiSlider) {
      appendSlider(html, item, context);
    } else if (item instanceof HmiBar) {
      appendBar(html, item, context);
    } else if (item instanceof HmiScale) {
      appendScale(html, item, context);
    } else if (item instanceof HmiClock) {
      appendClock(html, item, context);
    } else if (item instanceof HmiArrowIndicator) {
      appendArrowIndicator(html, item, context);
    } else if (item instanceof HmiAlarmIndicator) {
      appendAlarmIndicator(html, item, context);
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
    } else if (item instanceof HmiOcxControl) {
      await this.appendOcxControlAsync(html, item, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiDotNetControlContainer) {
      await this.appendDotNetControlAsync(html, item, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiLayoutContainerBase || item instanceof HmiContainerBase) {
      await this.appendContainerAsync(html, item, item.items, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiScreenWindow) {
      await this.appendScreenWindowAsync(html, item, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiDataGridControl) {
      appendDataGridControl(html, item, context);
    } else if (item instanceof HmiRecipeControl) {
      appendRecipeControl(html, item, context);
    } else if (item instanceof HmiAuditTrailControl) {
      appendAuditTrailControl(html, item, context);
    } else if (item instanceof HmiRadarChartControl) {
      appendRadarChartControl(html, item, context);
    } else if (item instanceof HmiSystemDiagnosisControl) {
      appendSystemDiagnosisControl(html, item, context);
    } else if (item instanceof HmiWebControl) {
      appendWebControl(html, item, context);
    } else if (item instanceof HmiAlarmLineControl) {
      appendAlarmLineControl(html, item, context);
    } else if (item instanceof HmiAlarmControl) {
      appendAlarmControl(html, item, context);
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
    const isEmptyCustomWidget = container instanceof HmiCustomWidgetContainer && items.length === 0;
    const customWidget = container instanceof HmiCustomWidgetContainer ? container : undefined;
    const hasWindowChrome = customWidget !== undefined && hasHostedWindowSettings(customWidget);
    html.push("<div");
    appendCommonAttributes(
      html,
      container,
      context,
      true,
      hasWindowChrome
        ? createHostedWindowStyle(customWidget)
        : isEmptyCustomWidget
        ? "display: flex; align-items: center; justify-content: center; overflow: hidden;"
        : undefined,
    );
    if (customWidget !== undefined) {
      appendAttribute(html, "data-hmi-custom-widget-type", container.constructor.name);
      appendStaticAttribute(html, "data-window-resizable", customWidget.resizable);
      appendStaticAttribute(html, "data-window-movable", customWidget.movable);
      appendStaticAttribute(html, "data-window-border", customWidget.showWindowBorder);
      appendStaticAttribute(html, "data-window-caption", customWidget.showCaption);
      appendStaticAttribute(html, "data-window-maximize", customWidget.showMaximizeButton);
      appendStaticAttribute(html, "data-window-close", customWidget.showCloseButton);
      appendStaticAttribute(html, "data-window-always-on-top", customWidget.alwaysOnTop);
      appendStaticAttribute(html, "data-hosted-application", customWidget.hostedApplication);
      appendStaticAttribute(html, "data-hosted-template", customWidget.hostedTemplate);
    }
    html.push(">");
    if (hasWindowChrome && getStaticValueOrDefault(customWidget.showCaption, false))
      appendHostedWindowCaption(html, customWidget);
    if (isEmptyCustomWidget && !hasWindowChrome)
      html.push(`<span aria-hidden="true">${escapeHtml(container.name ?? "")}</span>`);
    else if (isEmptyCustomWidget)
      html.push(`<div class="hmi-hosted-window-content" style="flex: 1 1 auto; display: grid; place-items: center; min-height: 0; overflow: hidden;">${escapeHtml(getStaticValue(customWidget!.hostedTemplate) ?? getStaticValue(customWidget!.hostedApplication) ?? container.name ?? "")}</div>`);
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

  private async appendOcxControlAsync(
    html: string[],
    ocxControl: HmiOcxControl,
    project: IHmiProject | undefined,
    context: HmiHtmlConvertContext,
    screenStack: Set<string>,
    key: string,
    includeInspectionAttributes: boolean,
    signal?: AbortSignal,
  ): Promise<void> {
    html.push("<div");
    appendCommonAttributes(
      html,
      ocxControl,
      context,
      true,
      "display: flex; flex-direction: column; overflow: hidden;",
    );
    appendAttribute(html, "data-ocx-guid", ocxControl.ocxGuid);
    appendAttribute(html, "data-ocx-name", ocxControl.ocxName);
    appendAttribute(html, "data-ocx-program-id", ocxControl.ocxProgramId);
    appendAttribute(html, "data-ocx-file-name", ocxControl.ocxFileName);
    appendAttribute(html, "data-ocx-file-version", ocxControl.ocxFileVersion);
    appendAttribute(html, "data-ocx-type-library", ocxControl.ocxTypeLibrary);
    appendAttribute(html, "data-ocx-type-library-version", ocxControl.ocxTypeLibraryVersion);
    appendAttribute(html, "data-state-format", ocxControl.ocxStateFormat);
    appendAttribute(html, "data-state-length", ocxControl.ocxState?.length.toString());
    html.push(
      "><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;\">ActiveX control</div>",
      "<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">",
      escapeHtml(ocxControl.ocxName ?? ocxControl.ocxProgramId ?? ocxControl.ocxFileName ?? "State preserved"),
      "</div>",
    );
    for (let childIndex = 0; childIndex < ocxControl.items.length; childIndex++) {
      await this.appendItemAsync(
        html,
        ocxControl.items[childIndex],
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

  private async appendDotNetControlAsync(
    html: string[],
    dotNetControl: HmiDotNetControlContainer,
    project: IHmiProject | undefined,
    context: HmiHtmlConvertContext,
    screenStack: Set<string>,
    key: string,
    includeInspectionAttributes: boolean,
    signal?: AbortSignal,
  ): Promise<void> {
    html.push("<div");
    appendCommonAttributes(
      html,
      dotNetControl,
      context,
      true,
      "display: flex; flex-direction: column; overflow: hidden;",
    );
    html.push(
      "><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;\">.NET control</div>",
      "<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Metadata preserved</div>",
    );
    for (let childIndex = 0; childIndex < dotNetControl.items.length; childIndex++) {
      await this.appendItemAsync(
        html,
        dotNetControl.items[childIndex],
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
    appendStaticAttribute(html, "data-fit-screen-to-window", screenWindow.fitScreenToWindow);
    appendStaticAttribute(html, "data-fit-window-to-screen", screenWindow.fitWindowToScreen);
    appendStaticAttribute(html, "data-show-scrollbars", screenWindow.showScrollBars);
    appendStaticAttribute(html, "data-zoom-percent", screenWindow.zoomPercent);
    appendStaticAttribute(html, "data-picture-offset-x", screenWindow.offsetLeft);
    appendStaticAttribute(html, "data-picture-offset-y", screenWindow.offsetTop);
    appendStaticAttribute(html, "data-scroll-position-x", screenWindow.scrollPositionLeft);
    appendStaticAttribute(html, "data-scroll-position-y", screenWindow.scrollPositionTop);
    appendCommonAttributes(html, screenWindow, context, true, createScreenWindowStyle(screenWindow, resolved));
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
      const contentStyle = createScreenWindowContentStyle(screenWindow, resolved);
      if (contentStyle !== undefined) {
        html.push('<div class="hmi-screen-window-content"');
        appendAttribute(html, "style", contentStyle);
        html.push("<div");
        appendAttribute(html, "style", createScreenWindowTransformStyle(screenWindow, resolved));
        html.push(">");
      }
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
      if (contentStyle !== undefined) {
        html.push("</div></div>");
      }
    }
    html.push("</div>");
    appendScreenWindowScrollInitializer(html, screenWindow);
  }
}

function hasHostedWindowSettings(container: HmiCustomWidgetContainer): boolean {
  return container.resizable !== undefined || container.movable !== undefined ||
    container.showWindowBorder !== undefined || container.showCaption !== undefined ||
    container.showMaximizeButton !== undefined || container.showCloseButton !== undefined ||
    container.alwaysOnTop !== undefined || container.hostedApplication !== undefined ||
    container.hostedTemplate !== undefined;
}

function createHostedWindowStyle(container: HmiCustomWidgetContainer): string {
  let style = "display: flex; flex-direction: column; overflow: hidden;";
  style += getStaticValueOrDefault(container.showWindowBorder, false)
    ? "border: 1px solid #6b7280;"
    : "border: none;";
  if (getStaticValueOrDefault(container.resizable, false)) style += "resize: both;";
  if (getStaticValueOrDefault(container.alwaysOnTop, false)) style += "z-index: 2147483647;";
  return style;
}

function appendHostedWindowCaption(html: string[], container: HmiCustomWidgetContainer): void {
  const title = getStaticValue(container.hostedTemplate) ?? getStaticValue(container.hostedApplication) ?? container.name ?? "";
  html.push('<div class="hmi-hosted-window-caption" style="flex: 0 0 auto; display: flex; align-items: center; min-height: 22px; padding: 2px 4px; background: #d7dce3; color: #111827;');
  if (getStaticValueOrDefault(container.movable, false)) html.push("cursor: move;");
  html.push(`"><span style="flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(title)}</span>`);
  if (getStaticValueOrDefault(container.showMaximizeButton, false))
    html.push('<button type="button" aria-label="Maximize" disabled style="flex: 0 0 auto;">□</button>');
  if (getStaticValueOrDefault(container.showCloseButton, false))
    html.push('<button type="button" aria-label="Close" disabled style="flex: 0 0 auto;">×</button>');
  html.push("</div>");
}

function createScreenWindowStyle(screenWindow: HmiScreenWindow, resolved: HmiScreenBase | undefined): string {
  const fitScreen = getStaticValueOrDefault(screenWindow.fitScreenToWindow, false);
  const fitWindow = getStaticValueOrDefault(screenWindow.fitWindowToScreen, false);
  const showScrollBars = getStaticValueOrDefault(screenWindow.showScrollBars, false);
  const zoom = getScreenWindowZoom(screenWindow);
  let style = "";
  if (fitWindow && !fitScreen && resolved !== undefined) {
    const contentWidth = getScreenWindowContentExtent(getStaticValueOrDefault(resolved.width, 0), screenWindow.offsetLeft);
    const contentHeight = getScreenWindowContentExtent(getStaticValueOrDefault(resolved.height, 0), screenWindow.offsetTop);
    style += `width: ${toCss(contentWidth * zoom)}px;`;
    style += `height: ${toCss(contentHeight * zoom)}px;`;
  }
  style += showScrollBars && !fitScreen && !fitWindow ? "overflow: auto;" : "overflow: hidden;";
  return style;
}

function createScreenWindowContentStyle(
  screenWindow: HmiScreenWindow,
  resolved: HmiScreenBase,
): string | undefined {
  const fitScreen = getStaticValueOrDefault(screenWindow.fitScreenToWindow, false);
  const zoom = getScreenWindowZoom(screenWindow);
  const screenWidth = getScreenWindowContentExtent(getStaticValueOrDefault(resolved.width, 0), screenWindow.offsetLeft);
  const screenHeight = getScreenWindowContentExtent(getStaticValueOrDefault(resolved.height, 0), screenWindow.offsetTop);
  const windowWidth = getStaticValueOrDefault(screenWindow.width, 0);
  const windowHeight = getStaticValueOrDefault(screenWindow.height, 0);
  let scaleX: number;
  let scaleY: number;
  if (fitScreen && screenWidth > 0 && screenHeight > 0) {
    scaleX = windowWidth / screenWidth;
    scaleY = windowHeight / screenHeight;
  } else if (Math.abs(zoom - 1) > 0.000001) {
    scaleX = zoom;
    scaleY = zoom;
  } else {
    return undefined;
  }
  return `position: relative; width: ${toCss(screenWidth * scaleX)}px; height: ${toCss(screenHeight * scaleY)}px; overflow: hidden;`;
}

function createScreenWindowTransformStyle(screenWindow: HmiScreenWindow, resolved: HmiScreenBase): string {
  const fitScreen = getStaticValueOrDefault(screenWindow.fitScreenToWindow, false);
  const resolvedWidth = getStaticValueOrDefault(resolved.width, 0);
  const resolvedHeight = getStaticValueOrDefault(resolved.height, 0);
  const screenWidth = getScreenWindowContentExtent(resolvedWidth, screenWindow.offsetLeft);
  const screenHeight = getScreenWindowContentExtent(resolvedHeight, screenWindow.offsetTop);
  const zoom = getScreenWindowZoom(screenWindow);
  const scaleX = fitScreen && screenWidth > 0
    ? getStaticValueOrDefault(screenWindow.width, 0) / screenWidth
    : zoom;
  const scaleY = fitScreen && screenHeight > 0
    ? getStaticValueOrDefault(screenWindow.height, 0) / screenHeight
    : zoom;
  const offsetX = clampScreenWindowOffset(getStaticValueOrDefault(screenWindow.offsetLeft, 0), resolvedWidth);
  const offsetY = clampScreenWindowOffset(getStaticValueOrDefault(screenWindow.offsetTop, 0), resolvedHeight);
  return `position: absolute; left: ${toCss(-offsetX * scaleX)}px; top: ${toCss(-offsetY * scaleY)}px; transform-origin: top left; transform: scale(${toCss(scaleX)}, ${toCss(scaleY)});`;
}

function getScreenWindowZoom(screenWindow: HmiScreenWindow): number {
  const zoomPercent = getStaticValueOrDefault(screenWindow.zoomPercent, 0);
  return zoomPercent > 0 ? zoomPercent / 100 : 1;
}

function getScreenWindowContentExtent(screenExtent: number, offset: HmiProperty<number> | undefined): number {
  return Math.max(0, screenExtent - clampScreenWindowOffset(getStaticValueOrDefault(offset, 0), screenExtent));
}

function clampScreenWindowOffset(offset: number, screenExtent: number): number {
  return Math.min(Math.max(offset, 0), screenExtent);
}

function appendScreenWindowScrollInitializer(html: string[], screenWindow: HmiScreenWindow): void {
  if (!getStaticValueOrDefault(screenWindow.showScrollBars, false)
      || getStaticValueOrDefault(screenWindow.fitScreenToWindow, false)
      || getStaticValueOrDefault(screenWindow.fitWindowToScreen, false)) {
    return;
  }
  const scrollLeft = Math.max(0, getStaticValueOrDefault(screenWindow.scrollPositionLeft, 0));
  const scrollTop = Math.max(0, getStaticValueOrDefault(screenWindow.scrollPositionTop, 0));
  if (scrollLeft === 0 && scrollTop === 0) return;
  html.push(`<script>(e=>{e.scrollLeft=${toCss(scrollLeft)};e.scrollTop=${toCss(scrollTop)};})(document.currentScript.previousElementSibling)</script>`);
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
  html.push("></line>");
  appendSvgMarkerDefinitions(html, line, context);
  html.push("</svg>");
}

function appendPointShape(html: string[], shape: HmiPointBasedShapeBase, elementName: string, fill: boolean, context: HmiHtmlConvertContext): void {
  appendSvgOpen(html, shape, getSvgWidth(shape), getSvgHeight(shape), context);
  html.push(`<${elementName}`);
  appendAttribute(html, "points", shape.points.map((point) => toSvgPoint(shape, point)).join(" "));
  appendStrokeAttributes(html, shape, fill ? getFillColor(shape, context) : undefined, context);
  html.push(`></${elementName}>`);
  appendSvgFillDefinition(html, shape, fill ? getFillColor(shape, context) : undefined, context);
  appendSvgMarkerDefinitions(html, shape, context);
  html.push("</svg>");
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
  html.push("></circle>");
  appendSvgFillDefinition(html, circle, getFillColor(circle, context), context);
  appendSvgMarkerDefinitions(html, circle, context);
  html.push("</svg>");
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
  html.push("></ellipse>");
  appendSvgFillDefinition(html, ellipse, getFillColor(ellipse, context), context);
  appendSvgMarkerDefinitions(html, ellipse, context);
  html.push("</svg>");
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
  html.push("></path>");
  appendSvgFillDefinition(html, item, segment ? getFillColor(item, context) : undefined, context);
  appendSvgMarkerDefinitions(html, item, context);
  html.push("</svg>");
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
  const lineStyle = getLineStyle(item, context);
  const fillPattern = getFillPattern(item, context);
  const colorGradient = getColorGradient(item);
  const usesSolidFill = fillColor !== undefined && fillPattern !== HmiFillPattern.Transparent &&
    tryGetFillPercentage(item.fillAnimation) === undefined && colorGradient === undefined &&
    (fillPattern === undefined || fillPattern === HmiFillPattern.Solid);
  const fill = fillColor === undefined || fillPattern === HmiFillPattern.Transparent
    ? "none"
    : tryGetFillPercentage(item.fillAnimation) !== undefined
      ? `url(#${getFillGradientId(item)})`
      : colorGradient !== undefined
        ? `url(#${getColorGradientId(item)})`
      : fillPattern !== undefined && fillPattern !== HmiFillPattern.Solid
        ? `url(#${getFillPatternId(item)})`
        : colorToCss(fillColor);
  appendAttribute(html, "fill", fill);
  const svgStyle: string[] = [];
  const svgAnimations: string[] = [];
  const fillColorProperty = usesSolidFill ? getFillColorProperty(item, context) : undefined;
  const fillBlink = fillColorProperty?.kind === HmiPropertyKind.Blink
    ? fillColorProperty as HmiBlinkProperty<HmiColor>
    : undefined;
  if (fillBlink?.staticValue !== undefined && fillBlink.blinkValue !== undefined) {
    svgStyle.push(`--hmi-background-color-off: ${colorToCss(fillBlink.staticValue)};`);
    svgStyle.push(`--hmi-background-color-on: ${colorToCss(fillBlink.blinkValue)};`);
    svgAnimations.push(`hmi-background-color-flash ${getBlinkDuration(fillBlink.rate)}s steps(1, end) infinite`);
  }
  const strokeColor = getStrokeColorProperty(item, context);
  appendAttribute(html, "stroke", lineStyle === HmiLineStyle.None
    ? "none"
    : colorToCss(strokeColor?.staticValue ?? { alpha: 255, red: 0, green: 0, blue: 0 }));
  const strokeBlink = strokeColor?.kind === HmiPropertyKind.Blink
    ? strokeColor as HmiBlinkProperty<HmiColor>
    : undefined;
  if (lineStyle !== HmiLineStyle.None && strokeBlink?.staticValue !== undefined && strokeBlink.blinkValue !== undefined) {
    svgStyle.push(`--hmi-border-color-off: ${colorToCss(strokeBlink.staticValue)};`);
    svgStyle.push(`--hmi-border-color-on: ${colorToCss(strokeBlink.blinkValue)};`);
    svgAnimations.push(`hmi-border-color-flash ${getBlinkDuration(strokeBlink.rate)}s steps(1, end) infinite`);
  }
  if (svgAnimations.length > 0)
    svgStyle.push(`animation: ${svgAnimations.join(", ")};`);
  if (svgStyle.length > 0)
    appendAttribute(html, "style", svgStyle.join(""));
  appendSvgAttribute(html, "stroke-width", getStrokeWidth(item, context));
  const lineCap = context.effectiveProperties.tryGetStaticValue<HmiLineCap>(item, "LineCap", item.lineCap).value;
  if (lineCap !== undefined) appendAttribute(html, "stroke-linecap", lineCapToCss(lineCap));
  if (getLineMarker(item, "StartMarker", item.startMarker, context) !== HmiLineMarker.None)
    appendAttribute(html, "marker-start", `url(#${getLineMarkerId(item, true)})`);
  if (getLineMarker(item, "EndMarker", item.endMarker, context) !== HmiLineMarker.None)
    appendAttribute(html, "marker-end", `url(#${getLineMarkerId(item, false)})`);

  switch (lineStyle) {
    case HmiLineStyle.Dash:
      appendAttribute(html, "stroke-dasharray", "6 4");
      break;
    case HmiLineStyle.Dot:
      appendAttribute(html, "stroke-dasharray", "1 3");
      if (lineCap === undefined) appendAttribute(html, "stroke-linecap", "round");
      break;
    case HmiLineStyle.DashDot:
      appendAttribute(html, "stroke-dasharray", "6 3 1 3");
      if (lineCap === undefined) appendAttribute(html, "stroke-linecap", "round");
      break;
    case HmiLineStyle.DashDotDot:
      appendAttribute(html, "stroke-dasharray", "6 3 1 3 1 3");
      if (lineCap === undefined) appendAttribute(html, "stroke-linecap", "round");
      break;
  }
}

function lineCapToCss(lineCap: HmiLineCap): string {
  switch (lineCap) {
    case HmiLineCap.Round:
      return "round";
    case HmiLineCap.Square:
      return "square";
    default:
      return "butt";
  }
}

function appendSvgFillDefinition(html: string[], item: HmiShapeBase, fillColor: HmiColor | undefined, context: HmiHtmlConvertContext): void {
  const percentage = tryGetFillPercentage(item.fillAnimation);
  if (fillColor === undefined) return;
  if (percentage === undefined) {
    const colorGradient = getColorGradient(item);
    if (colorGradient !== undefined) {
      appendSvgColorGradientDefinition(html, item, colorGradient);
      return;
    }
    appendSvgPatternDefinition(html, item, fillColor, context);
    return;
  }

  const [x1, y1, x2, y2] = getSvgFillVector(item.fillAnimation?.direction);
  html.push("<defs><linearGradient");
  appendAttribute(html, "id", getFillGradientId(item));
  appendAttribute(html, "x1", x1);
  appendAttribute(html, "y1", y1);
  appendAttribute(html, "x2", x2);
  appendAttribute(html, "y2", y2);
  html.push("><stop");
  appendAttribute(html, "offset", `${toCss(percentage)}%`);
  appendAttribute(html, "stop-color", colorToCss(fillColor));
  html.push("></stop><stop");
  appendAttribute(html, "offset", `${toCss(percentage)}%`);
  appendAttribute(html, "stop-color", "transparent");
  html.push("></stop></linearGradient></defs>");
}

function appendSvgColorGradientDefinition(html: string[], item: HmiShapeBase, gradient: ColorGradient): void {
  const [x1, y1, x2, y2] = getSvgGradientVector(gradient.direction);
  html.push("<defs><linearGradient");
  appendAttribute(html, "id", getColorGradientId(item));
  appendAttribute(html, "x1", x1);
  appendAttribute(html, "y1", y1);
  appendAttribute(html, "x2", x2);
  appendAttribute(html, "y2", y2);
  html.push(">");
  for (const stop of gradient.stops) {
    html.push("<stop");
    appendAttribute(html, "offset", `${toCss(stop.offset)}%`);
    appendAttribute(html, "stop-color", colorToCss(stop.color));
    html.push("></stop>");
  }
  html.push("</linearGradient></defs>");
}

function appendSvgMarkerDefinitions(html: string[], item: HmiShapeBase, context: HmiHtmlConvertContext): void {
  const start = getLineMarker(item, "StartMarker", item.startMarker, context);
  const end = getLineMarker(item, "EndMarker", item.endMarker, context);
  if (start === HmiLineMarker.None && end === HmiLineMarker.None) return;

  const color = colorToCss(getStrokeColor(item, context));
  html.push("<defs>");
  if (start !== HmiLineMarker.None) appendSvgMarkerDefinition(html, getLineMarkerId(item, true), start, color);
  if (end !== HmiLineMarker.None) appendSvgMarkerDefinition(html, getLineMarkerId(item, false), end, color);
  html.push("</defs>");
}

function appendSvgMarkerDefinition(html: string[], id: string, marker: HmiLineMarker, color: string): void {
  const reversed = marker === HmiLineMarker.FilledArrowReversed;
  html.push("<marker");
  appendAttribute(html, "id", id);
  appendAttribute(html, "viewBox", "-1 -1 12 12");
  appendAttribute(html, "markerWidth", "6");
  appendAttribute(html, "markerHeight", "6");
  appendAttribute(html, "refX", marker === HmiLineMarker.Circle || marker === HmiLineMarker.FilledCircle || marker === HmiLineMarker.Line ? "5" : reversed ? "0" : "10");
  appendAttribute(html, "refY", "5");
  appendAttribute(html, "orient", "auto-start-reverse");
  appendAttribute(html, "markerUnits", "strokeWidth");
  html.push(">");
  switch (marker) {
    case HmiLineMarker.Arrow:
      appendMarkerPath(html, "M0 0L10 5L0 10", "none", color);
      break;
    case HmiLineMarker.FilledArrow:
    case HmiLineMarker.FilledArrowReversed:
      appendMarkerPath(html, reversed ? "M10 0L0 5L10 10Z" : "M0 0L10 5L0 10Z", color, color);
      break;
    case HmiLineMarker.Line:
      appendMarkerPath(html, "M5 0V10", "none", color);
      break;
    case HmiLineMarker.Circle:
    case HmiLineMarker.FilledCircle:
      html.push("<circle cx=\"5\" cy=\"5\" r=\"4\"");
      appendAttribute(html, "fill", marker === HmiLineMarker.FilledCircle ? color : "none");
      appendAttribute(html, "stroke", color);
      html.push("></circle>");
      break;
  }
  html.push("</marker>");
}

function appendMarkerPath(html: string[], data: string, fill: string, stroke: string): void {
  html.push("<path");
  appendAttribute(html, "d", data);
  appendAttribute(html, "fill", fill);
  appendAttribute(html, "stroke", stroke);
  html.push("></path>");
}

function getLineMarker(
  item: HmiShapeBase,
  propertyName: string,
  property: HmiProperty<HmiLineMarker> | undefined,
  context: HmiHtmlConvertContext,
): HmiLineMarker {
  return context.effectiveProperties.tryGetStaticValue<HmiLineMarker>(item, propertyName, property).value
    ?? HmiLineMarker.None;
}

function appendSvgPatternDefinition(html: string[], item: HmiShapeBase, fillColor: HmiColor, context: HmiHtmlConvertContext): void {
  const pattern = getFillPattern(item, context);
  if (pattern === undefined || pattern === HmiFillPattern.Transparent || pattern === HmiFillPattern.Solid) return;

  const patternColor = colorToCss(getPatternColor(item, context));
  const size = pattern === HmiFillPattern.DottedEvenOddFiner || pattern === HmiFillPattern.DiagonalCrossFiner || pattern === HmiFillPattern.CheckersFiner ? 4 : 8;
  html.push("<defs><pattern");
  appendAttribute(html, "id", getFillPatternId(item));
  appendAttribute(html, "patternUnits", "userSpaceOnUse");
  appendAttribute(html, "width", size.toString());
  appendAttribute(html, "height", size.toString());
  html.push("><rect width=\"100%\" height=\"100%\"");
  appendAttribute(html, "fill", colorToCss(fillColor));
  html.push("></rect>");
  appendSvgPatternMarks(html, pattern, size, patternColor);
  html.push("</pattern></defs>");
}

function appendSvgPatternMarks(html: string[], pattern: HmiFillPattern, size: number, color: string): void {
  switch (pattern) {
    case HmiFillPattern.Checkers:
    case HmiFillPattern.CheckersFiner:
      html.push("<path");
      appendAttribute(html, "d", `M0 0H${size / 2}V${size / 2}H0ZM${size / 2} ${size / 2}H${size}V${size}H${size / 2}Z`);
      appendAttribute(html, "fill", color);
      html.push("></path>");
      break;
    case HmiFillPattern.Horizontal:
    case HmiFillPattern.HorizontalDifferentLines:
      appendPatternPath(html, `M0 1H${size} M0 ${size / 2 + 1}H${size}`, color, pattern === HmiFillPattern.HorizontalDifferentLines ? 2 : 1);
      break;
    case HmiFillPattern.Vertical:
      appendPatternPath(html, `M1 0V${size} M${size / 2 + 1} 0V${size}`, color, 1);
      break;
    case HmiFillPattern.DottedHorizontal:
    case HmiFillPattern.DottedEvenOdd:
    case HmiFillPattern.DottedEvenOddFiner:
    case HmiFillPattern.DottedEvenOddFinest:
    case HmiFillPattern.DottedHorizontalInverted: {
      const radius = pattern === HmiFillPattern.DottedHorizontalInverted ? "2" : "1";
      html.push("<circle");
      appendAttribute(html, "cx", (size / 4).toString());
      appendAttribute(html, "cy", (size / 4).toString());
      appendAttribute(html, "r", radius);
      appendAttribute(html, "fill", color);
      html.push("></circle><circle");
      appendAttribute(html, "cx", (size * 0.75).toString());
      appendAttribute(html, "cy", (size * 0.75).toString());
      appendAttribute(html, "r", radius);
      appendAttribute(html, "fill", color);
      html.push("></circle>");
      break;
    }
    case HmiFillPattern.Bricks:
    case HmiFillPattern.BricksDiagonal:
      appendPatternPath(html, `M0 0H${size} M0 ${size / 2}H${size} M${size / 2} 0V${size / 2} M0 ${size / 2}V${size}`, color, 1);
      break;
    default: {
      const leftToRight = pattern === HmiFillPattern.DiagonalLeftToRight || pattern === HmiFillPattern.Diagonal || pattern === HmiFillPattern.DiagonalCross || pattern === HmiFillPattern.DiagonalCrossFiner || pattern === HmiFillPattern.DiagonalCrossBold;
      const rightToLeft = pattern === HmiFillPattern.DiagonalRightToLeft || pattern === HmiFillPattern.DiagonalCross || pattern === HmiFillPattern.DiagonalCrossFiner || pattern === HmiFillPattern.DiagonalCrossBold;
      const width = pattern === HmiFillPattern.DiagonalCrossBold ? 2 : 1;
      if (leftToRight)
        appendPatternPath(html, `M-${size / 4} ${size / 4}L${size / 4} -${size / 4} M0 ${size}L${size} 0 M${size * 3 / 4} ${size + size / 4}L${size + size / 4} ${size * 3 / 4}`, color, width);
      if (rightToLeft)
        appendPatternPath(html, `M-${size / 4} ${size * 3 / 4}L${size / 4} ${size + size / 4} M0 0L${size} ${size} M${size * 3 / 4} -${size / 4}L${size + size / 4} ${size / 4}`, color, width);
      break;
    }
  }
}

function appendPatternPath(html: string[], data: string, color: string, width: number): void {
  html.push("<path");
  appendAttribute(html, "d", data);
  appendAttribute(html, "stroke", color);
  appendAttribute(html, "stroke-width", width.toString());
  appendAttribute(html, "fill", "none");
  html.push("></path>");
}

function getSvgFillVector(direction: HmiFillDirection | undefined): [string, string, string, string] {
  switch (direction) {
    case HmiFillDirection.Up:
      return ["0%", "100%", "0%", "0%"];
    case HmiFillDirection.Down:
      return ["0%", "0%", "0%", "100%"];
    case HmiFillDirection.Left:
      return ["100%", "0%", "0%", "0%"];
    default:
      return ["0%", "0%", "100%", "0%"];
  }
}

function getSvgGradientVector(direction: HmiGradientDirection): [string, string, string, string] {
  switch (direction) {
    case HmiGradientDirection.HorizontalFromRight:
      return ["100%", "0%", "0%", "0%"];
    case HmiGradientDirection.VerticalFromTop:
    case HmiGradientDirection.VerticalFromCenter:
      return ["0%", "0%", "0%", "100%"];
    case HmiGradientDirection.VerticalFromBottom:
      return ["0%", "100%", "0%", "0%"];
    case HmiGradientDirection.DiagonalUp:
      return ["0%", "100%", "100%", "0%"];
    case HmiGradientDirection.DiagonalDown:
      return ["0%", "0%", "100%", "100%"];
    default:
      return ["0%", "0%", "100%", "0%"];
  }
}

function getFillGradientId(item: HmiShapeBase): string {
  const sanitized = (item.name ?? item.id ?? "shape").replace(/[^A-Za-z0-9_-]/g, "-");
  return `hmi-fill-${sanitized || "shape"}`;
}

function getFillPatternId(item: HmiShapeBase): string {
  return getFillGradientId(item).replace("hmi-fill-", "hmi-pattern-");
}

function getColorGradientId(item: HmiShapeBase): string {
  return getFillGradientId(item).replace("hmi-fill-", "hmi-color-gradient-");
}

function getLineMarkerId(item: HmiShapeBase, start: boolean): string {
  return getFillGradientId(item).replace("hmi-fill-", start ? "hmi-marker-start-" : "hmi-marker-end-");
}

function getFillPattern(item: HmiPaintedScreenItemBase, context: HmiHtmlConvertContext): HmiFillPattern | undefined {
  if (item instanceof HmiShapeBase || item instanceof HmiWidgetBase || item instanceof HmiWindowBase || item instanceof HmiAlarmIndicator)
    return context.effectiveProperties.tryGetStaticValue<HmiFillPattern>(item, "FillPattern", item.fillPattern).value;
  return undefined;
}

function getPatternColor(item: HmiPaintedScreenItemBase, context: HmiHtmlConvertContext): HmiColor {
  return context.effectiveProperties.tryGetStaticValue<HmiColor>(item, "PatternColor", item.patternColor).value
    ?? (item instanceof HmiShapeBase ? getStrokeColor(item, context) : undefined)
    ?? context.effectiveProperties.tryGetStaticValue<HmiColor>(item, "ForegroundColor", item.foregroundColor).value
    ?? { alpha: 255, red: 0, green: 0, blue: 0 };
}

function tryGetFillPercentage(animation: HmiFillAnimation | undefined): number | undefined {
  if (animation === undefined) return undefined;
  const parsed = animation.expression === undefined ? Number.NaN : Number(animation.expression);
  const value = animation.expressionFallback ?? (Number.isFinite(parsed) ? parsed : undefined);
  if (value === undefined) return undefined;

  const expressionMinimum = animation.expressionMinimum ?? 0;
  const expressionMaximum = animation.expressionMaximum ?? 100;
  const normalized = expressionMaximum === expressionMinimum
    ? 0
    : (value - expressionMinimum) / (expressionMaximum - expressionMinimum);
  const fillMinimum = animation.fillMinimum ?? 0;
  const fillMaximum = animation.fillMaximum ?? 100;
  return Math.min(Math.max(fillMinimum + (fillMaximum - fillMinimum) * normalized, 0), 100);
}

function getStrokeColorProperty(item: HmiShapeBase, context: HmiHtmlConvertContext): HmiProperty<HmiColor> | undefined {
  const lineColor = context.effectiveProperties.resolve(item, "LineColor", item.lineColor);
  if (lineColor?.staticValue !== undefined) return lineColor;
  const borderColor = context.effectiveProperties.resolve(item, "BorderColor", item.borderColor);
  if (borderColor?.staticValue !== undefined) return borderColor;
  const foregroundColor = context.effectiveProperties.resolve(item, "ForegroundColor", item.foregroundColor);
  return foregroundColor?.staticValue !== undefined ? foregroundColor : undefined;
}

function getStrokeColor(item: HmiShapeBase, context: HmiHtmlConvertContext): HmiColor {
  return getStrokeColorProperty(item, context)?.staticValue ?? { alpha: 255, red: 0, green: 0, blue: 0 };
}

function getFillColor(item: HmiShapeBase, context: HmiHtmlConvertContext): HmiColor | undefined {
  return getFillColorProperty(item, context)?.staticValue;
}

function getFillColorProperty(item: HmiShapeBase, context: HmiHtmlConvertContext): HmiProperty<HmiColor> | undefined {
  return context.effectiveProperties.resolve(item, "BackgroundColor", item.backgroundColor);
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

function getLineStyle(item: HmiShapeBase, context: HmiHtmlConvertContext): HmiLineStyle {
  return context.effectiveProperties.tryGetStaticValue<number>(item, "DashType", item.dashType).value ?? HmiLineStyle.Solid;
}

async function appendButton(
  html: string[],
  button: HmiButton,
  project: IHmiProject | undefined,
  context: HmiHtmlConvertContext,
  signal?: AbortSignal,
): Promise<void> {
  const stateValue = getStaticValue(button.state);
  const state = button.states.find(candidate => candidate.value === stateValue)
    ?? button.states[0];
  html.push("<button");
  appendCommonAttributes(html, button, context, true, createButtonStyle(button, state));
  const enabled = button.enabled === undefined || getStaticValue(button.enabled) === true;
  if (!enabled) {
    appendAttribute(html, "disabled", "disabled");
  }
  html.push(">");
  let image = state?.image ?? getStaticValue(button.image);
  const disabledImageMode = getStaticValue(button.disabledImageMode);
  const showDisabledAppearance = !enabled && getStaticValue(button.showDisabledState) === true;
  if (
    showDisabledAppearance &&
    (disabledImageMode === HmiDisabledImageMode.Reference ||
      disabledImageMode === HmiDisabledImageMode.Imported)
  ) {
    image = getStaticValue(button.disabledImage) ?? image;
  }
  const imageUri = await resolveImageUri(image, project, signal);
  if (imageUri) {
    appendInnerImage(
      html,
      imageUri,
      showDisabledAppearance && disabledImageMode === HmiDisabledImageMode.Grayscale,
    );
  }
  appendMultilingualText(html, state?.text ?? getStaticValue(button.text), context);
  html.push("</button>");
}

function createButtonStyle(button: HmiButton, state: HmiState | undefined): string | null {
  const captionColor = getStaticValue(button.captionColor);
  const stateHasCaptionColor = (state?.captionColor ?? state?.foregroundColor) !== undefined;
  const captionBlink = button.captionColor?.kind === HmiPropertyKind.Blink
    ? button.captionColor as HmiBlinkProperty<HmiColor>
    : undefined;
  let style = "";
  if (!stateHasCaptionColor && captionColor !== undefined && captionBlink?.blinkValue !== undefined) {
    style += `--hmi-caption-color-off: ${colorToCss(captionColor)};`;
    style += `--hmi-caption-color-on: ${colorToCss(captionBlink.blinkValue)};`;
    style += `animation: hmi-caption-color-flash ${getBlinkDuration(captionBlink.rate)}s steps(1, end) infinite;`;
  } else if (!stateHasCaptionColor && captionColor !== undefined) {
    style = `color: ${colorToCss(captionColor)};`;
  }
  style += createStateStyle(state) ?? "";
  const borderWidth = getStaticValue(button.threeDBorderWidth) ?? 0;
  if (borderWidth <= 0)
    return style || null;

  style += `border-style: solid;border-width: ${toCss(borderWidth)}px;`;
  let topColor = getStaticValue(button.threeDBorderTopColor);
  let bottomColor = getStaticValue(button.threeDBorderBottomColor);
  topColor ??= bottomColor;
  bottomColor ??= topColor;
  if (topColor !== undefined && bottomColor !== undefined) {
    style += `border-color: ${colorToCss(topColor)} ${colorToCss(bottomColor)} ` +
      `${colorToCss(bottomColor)} ${colorToCss(topColor)};`;
  }
  return style;
}

function createStateStyle(state: HmiState | undefined): string | null {
  if (!state) return null;

  const style: string[] = [];
  if (state.backgroundColor)
    style.push(`background-color: ${colorToCss(state.backgroundColor)};`);
  const foregroundColor = state.captionColor ?? state.foregroundColor;
  if (foregroundColor)
    style.push(`color: ${colorToCss(foregroundColor)};`);
  if (state.borderColor)
    style.push(`border-color: ${colorToCss(state.borderColor)};`);
  return style.length === 0 ? null : style.join("");
}

function appendInput(html: string[], ioField: HmiIOField, context: HmiHtmlConvertContext): void {
  html.push("<input");
  appendCommonAttributes(html, ioField, context);
  let text = getStaticValue(ioField.text)?.getDisplayText(context.options.cultureLcid);
  if (!text?.trim() && ioField.text?.kind === HmiPropertyKind.Expression)
    text = (ioField.text as HmiExpressionProperty<HmiMultilingualText>).expression;
  appendAttribute(html, "value", text);
  if (getStaticValue(ioField.readOnly) === true)
    appendAttribute(html, "readonly", "readonly");
  if (getStaticValue(ioField.maskInput) === true)
    appendAttribute(html, "type", "password");
  const fieldLength = getStaticValue(ioField.fieldLength);
  if (fieldLength !== undefined)
    appendAttribute(html, "maxlength", fieldLength.toString());
  html.push(">");
}

function appendBar(html: string[], bar: HmiBar, context: HmiHtmlConvertContext): void {
  const [minimum, maximum] = resolveScaleRange(bar);
  const value = resolveScaleValue(bar, minimum, maximum);
  const direction = getStaticValue(bar.fillDirection) ?? HmiFillDirection.Right;
  const showScale = getStaticValue(bar.showScale) === true;
  const showThresholds = bar.thresholds.some(threshold =>
    threshold.value !== undefined && getStaticValue(threshold.enabled) !== false);
  if (showScale || showThresholds) {
    const vertical = direction === HmiFillDirection.Up || direction === HmiFillDirection.Down;
    html.push("<div");
    appendCommonAttributes(html, bar, context, true, showScale
      ? vertical
        ? "display: flex; flex-direction: row; align-items: stretch; gap: 4px;"
        : "display: flex; flex-direction: column; align-items: stretch; gap: 2px;"
      : "display: flex; align-items: stretch;");
    appendAttribute(html, "data-hmi-bar", "true");
    appendAttribute(html, "data-fill-direction", HmiFillDirection[direction]);
    html.push(">");
    appendBarMeterRegion(html, bar, minimum, maximum, value, direction, vertical);
    if (showScale)
      appendBarScale(html, bar, minimum, maximum, direction, vertical);
    html.push("</div>");
    return;
  }
  html.push("<meter");
  appendCommonAttributes(html, bar, context, true, getBarDirectionStyle(direction));
  appendAttribute(html, "data-fill-direction", HmiFillDirection[direction]);
  appendAttribute(html, "min", toCss(minimum));
  appendAttribute(html, "max", toCss(maximum));
  appendAttribute(html, "value", toCss(value));
  html.push(`>${toCss(value)}</meter>`);
}

function appendBarMeterRegion(
  html: string[],
  bar: HmiBar,
  minimum: number,
  maximum: number,
  value: number,
  direction: HmiFillDirection,
  vertical: boolean,
): void {
  html.push("<div");
  appendAttribute(html, "data-hmi-bar-meter", "true");
  appendAttribute(html, "style", "position: relative; display: flex; flex: 1; min-width: 0; min-height: 0;");
  html.push(">");
  appendBarMeter(html, minimum, maximum, value, direction, vertical);
  appendBarThresholds(html, bar, minimum, maximum, direction);
  html.push("</div>");
}

function appendBarMeter(
  html: string[],
  minimum: number,
  maximum: number,
  value: number,
  direction: HmiFillDirection,
  vertical: boolean,
): void {
  html.push("<meter");
  appendAttribute(html, "style",
    `${vertical ? "height: 100%;" : "width: 100%;"} flex: 1; min-width: 0; min-height: 0;${getBarDirectionStyle(direction)}`);
  appendAttribute(html, "min", toCss(minimum));
  appendAttribute(html, "max", toCss(maximum));
  appendAttribute(html, "value", toCss(value));
  html.push(`>${toCss(value)}</meter>`);
}

function appendBarThresholds(
  html: string[],
  bar: HmiBar,
  minimum: number,
  maximum: number,
  direction: HmiFillDirection,
): void {
  const percentageMode = getStaticValue(bar.thresholdValueMode) === HmiThresholdValueMode.Percentage;
  for (let index = 0; index < bar.thresholds.length; index++) {
    const threshold = bar.thresholds[index]!;
    const thresholdValue = getStaticValue(threshold.value);
    if (thresholdValue === undefined || getStaticValue(threshold.enabled) === false)
      continue;
    let percentage = percentageMode
      ? thresholdValue
      : maximum === minimum ? 0 : (thresholdValue - minimum) * 100 / (maximum - minimum);
    percentage = Math.max(0, Math.min(100, percentage));
    const position = direction === HmiFillDirection.Up
      ? `left: 0; right: 0; bottom: ${toCss(percentage)}%; height: 2px;`
      : direction === HmiFillDirection.Down
        ? `left: 0; right: 0; top: ${toCss(percentage)}%; height: 2px;`
        : direction === HmiFillDirection.Left
          ? `top: 0; bottom: 0; right: ${toCss(percentage)}%; width: 2px;`
          : `top: 0; bottom: 0; left: ${toCss(percentage)}%; width: 2px;`;
    const color = getStaticValue(threshold.color);
    html.push("<span");
    appendAttribute(html, "data-hmi-bar-threshold", (threshold.index ?? index).toString());
    appendAttribute(html, "data-threshold-value", toCss(thresholdValue));
    appendAttribute(html, "style",
      `position: absolute; pointer-events: none; z-index: 1; background-color: ${color === undefined ? "currentColor" : colorToCss(color)}; ${position}`);
    html.push("></span>");
  }
}

function appendBarScale(
  html: string[],
  bar: HmiBar,
  minimum: number,
  maximum: number,
  direction: HmiFillDirection,
  vertical: boolean,
): void {
  const tickCount = Math.max(2, getStaticValue(bar.divisionCount) ?? 2);
  const configuredDecimalPlaces = getStaticValue(bar.tickLabelDecimalPlaces);
  const decimalPlaces = configuredDecimalPlaces === undefined
    ? undefined
    : Math.max(0, Math.min(15, configuredDecimalPlaces));
  const engineeringUnit = getStaticValue(bar.engineeringUnit);
  const reverse = direction === HmiFillDirection.Up || direction === HmiFillDirection.Left;
  let style = vertical
    ? "display: flex; flex-direction: column; justify-content: space-between; height: 100%;"
    : "display: flex; justify-content: space-between; width: 100%;";
  const labelColor = getStaticValue(bar.labelColor);
  if (labelColor !== undefined)
    style += ` color: ${colorToCss(labelColor)};`;
  style += getBarScaleFontStyle(bar);

  html.push("<div");
  appendAttribute(html, "data-hmi-bar-scale", "true");
  appendAttribute(html, "style", style);
  html.push(">");
  for (let index = 0; index < tickCount; index++) {
    let ratio = index / (tickCount - 1);
    if (reverse)
      ratio = 1 - ratio;
    const tick = minimum + ((maximum - minimum) * ratio);
    const label = decimalPlaces === undefined ? toCss(tick) : tick.toFixed(decimalPlaces);
    html.push(`<span>${label}`);
    if (engineeringUnit?.trim())
      html.push("&nbsp;", escapeHtml(engineeringUnit));
    html.push("</span>");
  }
  html.push("</div>");
}

function getBarScaleFontStyle(bar: HmiBar): string {
  const font = bar.labelFont;
  if (font === undefined)
    return "";
  let style = "";
  const name = getStaticValue(font.name);
  if (name !== undefined)
    style += ` font-family: ${name};`;
  const size = getStaticValue(font.size);
  if (size !== undefined)
    style += ` font-size: ${toCss(size)}px;`;
  if (getStaticValue(font.bold) === true)
    style += " font-weight: bold;";
  if (getStaticValue(font.italic) === true)
    style += " font-style: italic;";
  if (getStaticValue(font.underline) === true)
    style += " text-decoration: underline;";
  return style;
}

function getBarDirectionStyle(direction: HmiFillDirection): string {
  switch (direction) {
    case HmiFillDirection.Up:
      return "writing-mode: vertical-lr; direction: rtl;";
    case HmiFillDirection.Down:
      return "writing-mode: vertical-lr; direction: ltr;";
    case HmiFillDirection.Left:
      return "direction: rtl;";
    default:
      return "direction: ltr;";
  }
}

function appendSlider(html: string[], slider: HmiSlider, context: HmiHtmlConvertContext): void {
  const [minimum, maximum] = resolveScaleRange(slider);
  const value = resolveScaleValue(slider, minimum, maximum);
  const orientation = getStaticValue(slider.orientation);
  const direction = orientation === undefined || orientation < 0 || orientation > 3
    ? HmiFillDirection.Right
    : orientation as HmiFillDirection;
  const thumbColor = getStaticValue(slider.thumbBackgroundColor);
  const sliderStyle = getBarDirectionStyle(direction) +
    (thumbColor === undefined ? "" : `--hmi-slider-thumb-background: ${colorToCss(thumbColor)};`) +
    getSliderTrackStyle(slider, direction);
  html.push("<input");
  appendCommonAttributes(html, slider, context, true, sliderStyle);
  appendAttribute(html, "data-hmi-slider", "true");
  appendAttribute(html, "data-orientation", HmiFillDirection[direction]);
  appendAttribute(html, "type", "range");
  appendAttribute(html, "min", toCss(minimum));
  appendAttribute(html, "max", toCss(maximum));
  appendAttribute(html, "value", toCss(value));
  appendAttribute(html, "disabled", "disabled");
  html.push(">");
}

function getSliderTrackStyle(slider: HmiSlider, direction: HmiFillDirection): string {
  let high = getStaticValue(slider.trackHighBackgroundColor);
  let low = getStaticValue(slider.trackLowBackgroundColor);
  let highStop = getStaticValue(slider.highStopColor);
  let lowStop = getStaticValue(slider.lowStopColor);
  if (high === undefined && low === undefined && highStop === undefined && lowStop === undefined)
    return "";
  high ??= low;
  low ??= high;
  const gradientDirection = direction === HmiFillDirection.Up
    ? "to bottom"
    : direction === HmiFillDirection.Down
      ? "to top"
      : direction === HmiFillDirection.Left
        ? "to right"
        : "to left";
  if (highStop !== undefined || lowStop !== undefined) {
    highStop ??= high ?? lowStop;
    lowStop ??= low ?? highStop;
    const highBackground = high === undefined ? "transparent" : colorToCss(high);
    const lowBackground = low === undefined ? "transparent" : colorToCss(low);
    return `--hmi-slider-track-background: linear-gradient(${gradientDirection}, ` +
      `${colorToCss(highStop!)} 0 4px, ${highBackground} 4px, ` +
      `${lowBackground} calc(100% - 4px), ${colorToCss(lowStop!)} calc(100% - 4px) 100%);`;
  }
  return `--hmi-slider-track-background: linear-gradient(${gradientDirection}, ${colorToCss(high!)}, ${colorToCss(low!)});`;
}

function appendScale(html: string[], scale: HmiScale, context: HmiHtmlConvertContext): void {
  const [minimum, maximum] = resolveScaleRange(scale);
  html.push("<div");
  appendCommonAttributes(
    html,
    scale,
    context,
    true,
    "display: flex; align-items: end; justify-content: space-between; overflow: hidden;",
  );
  html.push(`><span>${toCss(minimum)}</span><span>${toCss(maximum)}</span></div>`);
}

function appendClock(html: string[], clock: HmiClock, context: HmiHtmlConvertContext): void {
  const showDate = getStaticValue(clock.showDate) === true;
  const showTime = clock.showTime === undefined || getStaticValue(clock.showTime) === true;
  const showHours = clock.showHours === undefined || getStaticValue(clock.showHours) === true;
  const showMinutes = clock.showMinutes === undefined || getStaticValue(clock.showMinutes) === true;
  const showSeconds = getStaticValue(clock.showSeconds) === true;
  const parts: string[] = [];
  if (showDate)
    parts.push("2000-01-01");
  if (showTime) {
    const timeParts: string[] = [];
    if (showHours)
      timeParts.push("12");
    if (showMinutes)
      timeParts.push("34");
    if (showSeconds)
      timeParts.push("56");
    if (timeParts.length > 0)
      parts.push(timeParts.join(":"));
  }

  html.push("<time");
  appendCommonAttributes(
    html,
    clock,
    context,
    true,
    "display: flex; align-items: center; justify-content: center; overflow: hidden;",
  );
  appendAttribute(html, "datetime", "2000-01-01T12:34:56");
  appendAttribute(html, "data-format", getStaticValue(clock.format));
  appendAttribute(html, "data-time-zone", getStaticValue(clock.timeZone));
  appendBooleanAttribute(html, "data-analog", getStaticValue(clock.analog) === true);
  html.push(`>${parts.length === 0 ? "Clock" : parts.join(" ")}</time>`);
}

function appendArrowIndicator(
  html: string[],
  arrowIndicator: HmiArrowIndicator,
  context: HmiHtmlConvertContext,
): void {
  const [minimum, maximum] = resolveScaleRange(arrowIndicator);
  const value = resolveScaleValue(arrowIndicator, minimum, maximum);
  const ratio = (value - minimum) / (maximum - minimum);
  const vertical = getStaticValue(arrowIndicator.orientation) === 1;
  const position = toCss(ratio * 100);
  const markerStyle = vertical
    ? `position: absolute; left: 50%; bottom: ${position}%; transform: translate(-50%, 50%);`
    : `position: absolute; top: 50%; left: ${position}%; transform: translate(-50%, -50%);`;

  html.push("<div");
  appendCommonAttributes(html, arrowIndicator, context, true, "overflow: hidden;");
  appendAttribute(html, "data-min", toCss(minimum));
  appendAttribute(html, "data-max", toCss(maximum));
  appendAttribute(html, "data-value", toCss(value));
  appendAttribute(html, "data-orientation", vertical ? "vertical" : "horizontal");
  html.push(`><span style="${markerStyle}">${vertical ? "▲" : "▶"}</span></div>`);
}

function appendWebControl(html: string[], webControl: HmiWebControl, context: HmiHtmlConvertContext): void {
  let url = getStaticValue(webControl.url);
  if (!url?.trim() && webControl.url?.kind === HmiPropertyKind.Expression)
    url = (webControl.url as HmiExpressionProperty<string>).expression;
  if (!url?.trim())
    url = getStaticValue(webControl.homeUrl);
  const showAddressBar = webControl.showAddressBar === undefined
    || getStaticValue(webControl.showAddressBar) === true;

  html.push("<div");
  appendCommonAttributes(
    html,
    webControl,
    context,
    true,
    "display: flex; flex-direction: column; overflow: hidden;",
  );
  appendAttribute(html, "data-url", url);
  appendBooleanAttribute(
    html,
    "data-use-parameter-placeholders",
    getStaticValue(webControl.useParameterPlaceholders) === true,
  );
  appendAttribute(html, "data-navigate-back", resolvePropertyPreview(webControl.navigateBack));
  appendAttribute(html, "data-navigate-forward", resolvePropertyPreview(webControl.navigateForward));
  appendAttribute(html, "data-stop", resolvePropertyPreview(webControl.stop));
  appendAttribute(html, "data-refresh", resolvePropertyPreview(webControl.refresh));
  html.push(">");
  if (showAddressBar) {
    html.push("<div style=\"flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border-bottom: 1px solid currentColor; padding: 2px 4px;\">");
    html.push(escapeHtml(url ?? ""), "</div>");
  }
  html.push("<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Web browser</div></div>");
}

function appendDataGridControl(html: string[], dataGridControl: HmiDataGridControl, context: HmiHtmlConvertContext): void {
  const showToolbar = getStaticValue(dataGridControl.showToolbar) === true;
  const showStatusBar = getStaticValue(dataGridControl.showStatusBar) === true;
  const showExportCsv = getStaticValue(dataGridControl.showExportCsv) === true;
  const showProperties = getStaticValue(dataGridControl.showProperties) === true;
  const absoluteMode = getStaticValue(dataGridControl.timePeriodAbsoluteMode) === true;

  html.push("<div");
  appendCommonAttributes(
    html,
    dataGridControl,
    context,
    true,
    "display: flex; flex-direction: column; overflow: hidden;",
  );
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(dataGridControl.showToolbar));
  appendAttribute(html, "data-show-status-bar", resolvePropertyPreview(dataGridControl.showStatusBar));
  appendAttribute(html, "data-show-export-csv", resolvePropertyPreview(dataGridControl.showExportCsv));
  appendAttribute(html, "data-show-properties", resolvePropertyPreview(dataGridControl.showProperties));
  appendAttribute(html, "data-source-kind", resolvePropertyPreview(dataGridControl.dataSourceKind));
  appendAttribute(html, "data-source-kind-raw", dataGridControl.sourceDataSourceKind);
  appendAttribute(html, "data-source-name", resolvePropertyPreview(dataGridControl.dataSourceName));
  appendAttribute(html, "data-table-or-view", resolvePropertyPreview(dataGridControl.tableOrView));
  appendAttribute(html, "data-time-sort", resolvePropertyPreview(dataGridControl.timeSortDirection));
  appendAttribute(html, "data-time-sort-raw", dataGridControl.sourceTimeSortDirection);
  appendAttribute(html, "data-historian-interpolated", resolvePropertyPreview(dataGridControl.historianInterpolatedMode));
  appendAttribute(html, "data-historian-interval", resolvePropertyPreview(dataGridControl.historianInterpolationInterval));
  appendAttribute(html, "data-time-period-absolute", resolvePropertyPreview(dataGridControl.timePeriodAbsoluteMode));
  appendAttribute(html, "data-time-period-duration", resolvePropertyPreview(dataGridControl.timePeriodDuration));
  appendAttribute(html, "data-time-period-start", resolvePropertyPreview(dataGridControl.timePeriodStart));
  appendAttribute(html, "data-time-period-end", resolvePropertyPreview(dataGridControl.timePeriodEnd));
  html.push(">");

  if (showToolbar) {
    html.push("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px;\">Data grid");
    if (showExportCsv)
      html.push(" · Export CSV");
    if (showProperties)
      html.push(" · Properties");
    html.push("</div>");
  }

  html.push("<div style=\"flex: 0 0 auto; padding: 2px 4px;\">");
  if (absoluteMode) {
    html.push(
      "Time: ",
      escapeHtml(getStaticValue(dataGridControl.timePeriodStart) ?? ""),
      " – ",
      escapeHtml(getStaticValue(dataGridControl.timePeriodEnd) ?? ""),
    );
  } else {
    html.push("Duration: ", escapeHtml(getStaticValue(dataGridControl.timePeriodDuration) ?? ""));
  }
  html.push("</div><div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">");
  const dataSourceKind = getStaticValue(dataGridControl.dataSourceKind);
  const dataSourceName = getStaticValue(dataGridControl.dataSourceName);
  const tableOrView = getStaticValue(dataGridControl.tableOrView);
  if (dataSourceKind !== undefined || dataSourceName !== undefined || tableOrView !== undefined) {
    html.push(escapeHtml(dataSourceKind ?? "Data source"));
    if (dataSourceName !== undefined && dataSourceName.trim().length > 0)
      html.push(": ", escapeHtml(dataSourceName));
    if (tableOrView !== undefined && tableOrView.trim().length > 0)
      html.push(" · ", escapeHtml(tableOrView));
  } else {
    html.push("Data binding not decoded");
  }
  html.push("</div>");

  if (showStatusBar)
    html.push("<div style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;\">Status</div>");
  html.push("</div>");
}

function appendRecipeControl(html: string[], recipeControl: HmiRecipeControl, context: HmiHtmlConvertContext): void {
  const showHeader = recipeControl.showHeader === undefined || getStaticValue(recipeControl.showHeader) === true;
  const showFooter = getStaticValue(recipeControl.showFooter) === true;
  const defaultRecipeName = getStaticValue(recipeControl.defaultRecipeName) ?? "";

  html.push("<div");
  appendCommonAttributes(
    html,
    recipeControl,
    context,
    true,
    "display: flex; flex-direction: column; overflow: hidden;",
  );
  appendAttribute(html, "data-view-kind", recipeControl.viewKind);
  appendAttribute(html, "data-default-recipe", resolvePropertyPreview(recipeControl.defaultRecipeName));
  appendAttribute(html, "data-view-only", resolvePropertyPreview(recipeControl.viewOnly));
  appendAttribute(html, "data-wrap-around", resolvePropertyPreview(recipeControl.wrapAround));
  appendAttribute(html, "data-lines-per-item", resolvePropertyPreview(recipeControl.linesPerItem));
  html.push(">");

  if (recipeControl.viewKind === HmiRecipeViewKind.Selector) {
    if (showHeader)
      html.push("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px;\">Recipe selector</div>");
    html.push(
      "<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">",
      escapeHtml(defaultRecipeName),
      "</div>",
    );
  } else {
    const visibleColumns = recipeControl.columnDefinitions.filter(
      (column) => column.visible === undefined || getStaticValue(column.visible) === true,
    );
    html.push("<table style=\"width: 100%; border-collapse: collapse; table-layout: fixed;\">");
    if (showHeader) {
      html.push("<thead><tr>");
      for (const column of visibleColumns) {
        html.push("<th style=\"border: 1px solid currentColor; overflow: hidden; text-overflow: ellipsis;\"");
        appendAttribute(html, "data-column-type", column.type);
        html.push(">", escapeHtml(column.headerText?.getDisplayText(context.options.cultureLcid) ?? column.type), "</th>");
      }
      html.push("</tr></thead>");
    }
    html.push("<tbody><tr><td");
    appendAttribute(html, "colspan", Math.max(visibleColumns.length, 1).toString());
    html.push(" style=\"text-align: center;\">Recipe data not loaded</td></tr></tbody></table>");
  }

  if (showFooter)
    html.push("<div style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;\">Recipe control</div>");
  html.push("</div>");
}

function appendAuditTrailControl(html: string[], auditTrailControl: HmiAuditTrailControl, context: HmiHtmlConvertContext): void {
  const showHeader = auditTrailControl.showHeader === undefined || getStaticValue(auditTrailControl.showHeader) === true;
  const visibleFields = auditTrailControl.fields.filter(
    (field) => field.visible === undefined || getStaticValue(field.visible) === true,
  );

  html.push("<div");
  appendCommonAttributes(
    html,
    auditTrailControl,
    context,
    true,
    "display: flex; flex-direction: column; overflow: hidden;",
  );
  appendAttribute(html, "data-view-kind", auditTrailControl.viewKind);
  appendAttribute(html, "data-lines-per-entry", resolvePropertyPreview(auditTrailControl.linesPerEntry));
  appendAttribute(html, "data-word-wrap", resolvePropertyPreview(auditTrailControl.wordWrap));
  appendAttribute(html, "data-wrap-around", resolvePropertyPreview(auditTrailControl.wrapAround));
  appendAttribute(html, "data-receive-selection-from", auditTrailControl.receiveSelectionFrom);
  html.push(">");

  if (auditTrailControl.viewKind === HmiAuditTrailViewKind.Detail) {
    if (showHeader)
      html.push("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px;\">Audit trail detail</div>");
    html.push("<dl style=\"margin: 0; padding: 2px 4px; overflow: hidden;\">");
    for (const field of visibleFields) {
      html.push("<dt");
      appendAttribute(html, "data-field", field.field);
      html.push(">", escapeHtml(field.headerText?.getDisplayText(context.options.cultureLcid) ?? field.field), "</dt><dd>—</dd>");
    }
    html.push("</dl>");
  } else {
    html.push("<table style=\"width: 100%; border-collapse: collapse; table-layout: fixed;\">");
    if (showHeader) {
      html.push("<thead><tr>");
      for (const field of visibleFields) {
        html.push("<th style=\"border: 1px solid currentColor; overflow: hidden; text-overflow: ellipsis;\"");
        appendAttribute(html, "data-field", field.field);
        appendAttribute(html, "data-time-format", field.timeAndDateFormat);
        html.push(">", escapeHtml(field.headerText?.getDisplayText(context.options.cultureLcid) ?? field.field), "</th>");
      }
      html.push("</tr></thead>");
    }
    html.push("<tbody><tr><td");
    appendAttribute(html, "colspan", Math.max(visibleFields.length, 1).toString());
    html.push(" style=\"text-align: center;\">Audit data not loaded</td></tr></tbody></table>");
  }

  html.push("</div>");
}

function appendAlarmControl(html: string[], alarmControl: HmiAlarmControl, context: HmiHtmlConvertContext): void {
  const showHeader = alarmControl.showHeader === undefined || getStaticValue(alarmControl.showHeader) === true;
  const showTitle = getStaticValue(alarmControl.showTitle) === true;
  const listMode = getStaticValue(alarmControl.listMode) ?? HmiAlarmListMode.All;
  const visibleColumns = alarmControl.columnDefinitions.filter(
    (column) => column.visible === undefined || getStaticValue(column.visible) === true,
  );

  html.push("<div");
  appendCommonAttributes(
    html,
    alarmControl,
    context,
    true,
    createAlarmControlStyle(alarmControl),
  );
  appendAttribute(html, "data-window-resizable", resolvePropertyPreview(alarmControl.resizable));
  appendAttribute(html, "data-window-movable", resolvePropertyPreview(alarmControl.movable));
  appendAttribute(html, "data-window-closeable", resolvePropertyPreview(alarmControl.closeable));
  appendAttribute(html, "data-header-background-color", resolvePropertyPreview(alarmControl.headerBackgroundColor));
  appendAttribute(html, "data-header-foreground-color", resolvePropertyPreview(alarmControl.headerForegroundColor));
  appendAttribute(html, "data-header-border-color", resolvePropertyPreview(alarmControl.headerBorderColor));
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(alarmControl.showToolbar));
  appendAttribute(html, "data-toolbar-background-color", resolvePropertyPreview(alarmControl.toolbarBackgroundColor));
  appendAttribute(html, "data-toolbar-foreground-color", resolvePropertyPreview(alarmControl.toolbarForegroundColor));
  appendAttribute(html, "data-view-kind", alarmControl.viewKind);
  appendAttribute(html, "data-list-mode", listMode);
  appendAttribute(html, "data-number-of-rows", resolvePropertyPreview(alarmControl.numberOfRows));
  appendAttribute(html, "data-lines-per-alarm", resolvePropertyPreview(alarmControl.linesPerAlarm));
  appendAttribute(html, "data-word-wrap", resolvePropertyPreview(alarmControl.wordWrap));
  appendAttribute(html, "data-wrap-around", resolvePropertyPreview(alarmControl.wrapAround));
  appendAttribute(html, "data-show-waiting-message", resolvePropertyPreview(alarmControl.showWaitingMessage));
  appendAttribute(html, "data-show-out-of-scope-alarms", resolvePropertyPreview(alarmControl.showOutOfScopeAlarms));
  appendAttribute(html, "data-filtered-triggers", alarmControl.filteredTriggers.length === 0 ? undefined : alarmControl.filteredTriggers.join(","));
  appendAttribute(html, "data-alarm-identifier", resolvePropertyPreview(alarmControl.alarmIdentifier));
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(alarmControl.gridLineColor));
  appendAttribute(html, "data-grid-line-width", resolvePropertyPreview(alarmControl.gridLineWidth));
  appendAttribute(html, "data-show-horizontal-grid-lines", resolvePropertyPreview(alarmControl.showHorizontalGridLines));
  appendAttribute(html, "data-show-vertical-grid-lines", resolvePropertyPreview(alarmControl.showVerticalGridLines));
  appendAttribute(html, "data-show-horizontal-scrollbar", resolvePropertyPreview(alarmControl.showHorizontalScrollbar));
  appendAttribute(html, "data-show-vertical-scrollbar", resolvePropertyPreview(alarmControl.showVerticalScrollbar));
  appendAttribute(html, "data-table-background-color", resolvePropertyPreview(alarmControl.tableBackgroundColor));
  appendAttribute(html, "data-table-foreground-color", resolvePropertyPreview(alarmControl.tableForegroundColor));
  appendAttribute(html, "data-use-alternating-row-colors", resolvePropertyPreview(alarmControl.useAlternatingRowColors));
  appendAttribute(html, "data-alternating-row-background-color", resolvePropertyPreview(alarmControl.alternatingRowBackgroundColor));
  appendAttribute(html, "data-alternating-row-foreground-color", resolvePropertyPreview(alarmControl.alternatingRowForegroundColor));
  appendAttribute(html, "data-table-header-background-color", resolvePropertyPreview(alarmControl.tableHeaderBackgroundColor));
  appendAttribute(html, "data-table-header-foreground-color", resolvePropertyPreview(alarmControl.tableHeaderForegroundColor));
  appendAttribute(html, "data-table-header-horizontal-alignment", resolvePropertyPreview(alarmControl.tableHeaderHorizontalAlignment));
  appendAttribute(html, "data-table-header-border-color", resolvePropertyPreview(alarmControl.tableHeaderBorderColor));
  appendAttribute(html, "data-selection-background-color", resolvePropertyPreview(alarmControl.selectionBackgroundColor));
  appendAttribute(html, "data-selection-foreground-color", resolvePropertyPreview(alarmControl.selectionForegroundColor));
  appendAttribute(html, "data-selection-rectangle-mode", resolvePropertyPreview(alarmControl.selectionRectangleMode));
  appendAttribute(html, "data-use-automatic-selection-rectangle-color", resolvePropertyPreview(alarmControl.useAutomaticSelectionRectangleColor));
  appendAttribute(html, "data-selection-rectangle-color", resolvePropertyPreview(alarmControl.selectionRectangleColor));
  appendAttribute(html, "data-selection-rectangle-width", resolvePropertyPreview(alarmControl.selectionRectangleWidth));
  appendAttribute(html, "data-show-status-bar", resolvePropertyPreview(alarmControl.showStatusBar));
  appendAttribute(html, "data-status-bar-background-color", resolvePropertyPreview(alarmControl.statusBarBackgroundColor));
  appendAttribute(html, "data-status-bar-foreground-color", resolvePropertyPreview(alarmControl.statusBarForegroundColor));
  html.push(">");

  if (showTitle) {
    const title = resolveAlarmTitle(alarmControl, listMode, context);
    html.push("<div style=\"", createAlarmHeaderStyle(alarmControl));
    if (getStaticValue(alarmControl.movable) === true)
      html.push("cursor: move;");
    html.push("\"><span style=\"flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\">", escapeHtml(title), "</span>");
    if (getStaticValue(alarmControl.closeable) === true)
      html.push("<button type=\"button\" aria-label=\"Close\" disabled style=\"flex: 0 0 auto;\">×</button>");
    html.push("</div>");
  }

  html.push("<table class=\"hmi-alarm-table");
  if (getStaticValue(alarmControl.useAlternatingRowColors) === true)
    html.push(" hmi-alarm-table--alternating");
  html.push("\" style=\"", createAlarmTableStyle(alarmControl), "\">");
  const gridCellStyle = createAlarmGridCellStyle(alarmControl);
  if (showHeader) {
    const headerCellStyle = createAlarmTableHeaderCellStyle(alarmControl, gridCellStyle);
    html.push("<thead><tr>");
    if (visibleColumns.length === 0)
      html.push("<th style=\"", headerCellStyle, "\">", escapeHtml(resolveAlarmViewLabel(alarmControl.viewKind)), "</th>");
    for (const column of visibleColumns) {
      html.push("<th style=\"", headerCellStyle, "overflow: hidden; text-overflow: ellipsis;\"");
      appendAttribute(html, "data-column-type", column.type);
      appendAttribute(html, "data-time-format", column.timeAndDateFormat);
      appendAttribute(html, "data-symbol", column.symbol);
      html.push(">", escapeHtml(column.headerText?.getDisplayText(context.options.cultureLcid) ?? column.type), "</th>");
    }
    html.push("</tr></thead>");
  }
  html.push("<tbody><tr><td");
  appendAttribute(html, "colspan", Math.max(visibleColumns.length, 1).toString());
  html.push(" style=\"text-align: center;", gridCellStyle);
  appendColorStyle(html, "background-color", alarmControl.selectionBackgroundColor);
  appendColorStyle(html, "color", alarmControl.selectionForegroundColor);
  appendAlarmSelectionRectangleStyle(html, alarmControl);
  html.push("\">Alarm data not loaded</td></tr></tbody></table>");

  const showAcknowledgeButton = getStaticValue(alarmControl.showAcknowledgeButton) === true;
  const showHelpButton = getStaticValue(alarmControl.showHelpButton) === true;
  const showToolbar = getStaticValue(alarmControl.showToolbar) === true;
  if (showToolbar || showAcknowledgeButton || showHelpButton) {
    const toolbarStyle = ["flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;"];
    appendColorStyle(toolbarStyle, "background-color", alarmControl.toolbarBackgroundColor);
    appendColorStyle(toolbarStyle, "color", alarmControl.toolbarForegroundColor);
    html.push("<div class=\"hmi-alarm-toolbar\" role=\"toolbar\" style=\"", ...toolbarStyle, "\">");
    if (showAcknowledgeButton)
      html.push("Acknowledge");
    if (showAcknowledgeButton && showHelpButton)
      html.push(" · ");
    if (showHelpButton)
      html.push("Help");
    if (!showAcknowledgeButton && !showHelpButton)
      html.push("Toolbar");
    html.push("</div>");
  }
  if (getStaticValue(alarmControl.showStatusBar) === true) {
    const statusStyle = ["flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;"];
    appendColorStyle(statusStyle, "background-color", alarmControl.statusBarBackgroundColor);
    appendColorStyle(statusStyle, "color", alarmControl.statusBarForegroundColor);
    if (alarmControl.statusBarFont !== undefined)
      appendFont(statusStyle, alarmControl.statusBarFont);
    html.push("<div class=\"hmi-alarm-status-bar\" role=\"status\" style=\"", ...statusStyle, "\">Status</div>");
  }
  html.push("</div>");
}

function appendRadarChartControl(html: string[], radarChartControl: HmiRadarChartControl, context: HmiHtmlConvertContext): void {
  const title = radarChartControl.title?.getDisplayText(context.options.cultureLcid);
  const seriesCount = getStaticValue(radarChartControl.seriesCount);
  const categoryCount = getStaticValue(radarChartControl.categoryCount);

  html.push("<div");
  appendCommonAttributes(
    html,
    radarChartControl,
    context,
    true,
    "display: flex; flex-direction: column; overflow: hidden;",
  );
  appendAttribute(html, "data-series-count", resolvePropertyPreview(radarChartControl.seriesCount));
  appendAttribute(html, "data-category-count", resolvePropertyPreview(radarChartControl.categoryCount));
  appendAttribute(html, "data-radar-shape", resolvePropertyPreview(radarChartControl.radarShape));
  appendAttribute(html, "data-radar-shape-raw", radarChartControl.sourceRadarShape);
  appendAttribute(html, "data-chart-background", resolvePropertyPreview(radarChartControl.chartBackgroundColor));
  const gridLineStyle = getStaticValue(radarChartControl.gridLineStyle);
  appendAttribute(html, "data-grid-line-style", gridLineStyle === undefined ? undefined : HmiLineStyle[gridLineStyle]);
  appendAttribute(html, "data-grid-line-style-raw", radarChartControl.sourceGridLineStyle);
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(radarChartControl.gridLineColor));
  appendAttribute(html, "data-banded-color", resolvePropertyPreview(radarChartControl.bandedColor));
  appendAttribute(html, "data-show-legend", resolvePropertyPreview(radarChartControl.showLegend));
  appendAttribute(html, "data-legend-position", resolvePropertyPreview(radarChartControl.legendPosition));
  appendAttribute(html, "data-legend-position-raw", radarChartControl.sourceLegendPosition);
  appendAttribute(html, "data-decimal-places", resolvePropertyPreview(radarChartControl.decimalPlaces));
  appendAttribute(html, "data-refresh-rate-seconds", resolvePropertyPreview(radarChartControl.refreshRateSeconds));
  html.push(
    "><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor; font-weight: bold;\">",
    escapeHtml(title?.trim() ? title : "Radar chart"),
    "</div><div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Radar data not loaded",
  );
  if (seriesCount !== undefined || categoryCount !== undefined) {
    html.push(" (");
    if (seriesCount !== undefined)
      html.push("Series: ", seriesCount.toString());
    if (seriesCount !== undefined && categoryCount !== undefined)
      html.push(" · ");
    if (categoryCount !== undefined)
      html.push("Categories: ", categoryCount.toString());
    html.push(")");
  }
  html.push("</div></div>");
}

function appendSystemDiagnosisControl(
  html: string[],
  systemDiagnosisControl: HmiSystemDiagnosisControl,
  context: HmiHtmlConvertContext,
): void {
  const title = systemDiagnosisControl.viewKind === HmiSystemDiagnosisViewKind.DiagnosticsList
    ? "Diagnostics list"
    : systemDiagnosisControl.viewKind === HmiSystemDiagnosisViewKind.DiagnosticsViewer
      ? "Diagnostics viewer"
      : systemDiagnosisControl.viewKind === HmiSystemDiagnosisViewKind.AutomaticEventSummary
        ? "Automatic diagnostic event summary"
        : "System diagnostics";

  html.push("<div");
  appendCommonAttributes(
    html,
    systemDiagnosisControl,
    context,
    true,
    "display: flex; flex-direction: column; overflow: hidden;",
  );
  appendAttribute(html, "data-view-kind", systemDiagnosisControl.viewKind);
  html.push(
    "><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor; font-weight: bold;\">",
    escapeHtml(title),
    "</div><div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Diagnostic data not loaded</div></div>",
  );
}

function appendAlarmLineControl(html: string[], alarmLineControl: HmiAlarmLineControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(
    html,
    alarmLineControl,
    context,
    true,
    "display: flex; align-items: center; overflow: hidden;",
  );
  appendAttribute(html, "data-view-kind", alarmLineControl.viewKind);
  appendAttribute(html, "data-number-of-rows", resolvePropertyPreview(alarmLineControl.numberOfRows));
  appendAttribute(html, "data-word-wrap", resolvePropertyPreview(alarmLineControl.wordWrap));
  appendAttribute(html, "data-queue-new-alarms", resolvePropertyPreview(alarmLineControl.queueNewAlarms));
  appendAttribute(html, "data-show-trigger-value", resolvePropertyPreview(alarmLineControl.showTriggerValue));
  appendAttribute(html, "data-show-trigger-label", resolvePropertyPreview(alarmLineControl.showTriggerLabel));
  appendAttribute(html, "data-show-inactive-alarms", resolvePropertyPreview(alarmLineControl.showInactiveAlarms));
  appendAttribute(html, "data-show-alarm-state", resolvePropertyPreview(alarmLineControl.showAlarmState));
  appendAttribute(html, "data-show-alarm-time", resolvePropertyPreview(alarmLineControl.showAlarmTime));
  appendAttribute(html, "data-time-format", alarmLineControl.alarmTimeFormat);
  appendAttribute(html, "data-filtered-triggers", alarmLineControl.filteredTriggers.length === 0 ? undefined : alarmLineControl.filteredTriggers.join(","));
  html.push(">Alarm data not loaded</div>");
}

function resolveAlarmTitle(alarmControl: HmiAlarmControl, listMode: HmiAlarmListMode, context: HmiHtmlConvertContext): string {
  let title = alarmControl.title?.getDisplayText(context.options.cultureLcid);
  if (title?.trim())
    return title;
  const modeTitle = listMode === HmiAlarmListMode.Active
    ? alarmControl.activeAlarmsTitle
    : listMode === HmiAlarmListMode.Past
      ? alarmControl.pastAlarmsTitle
      : alarmControl.allAlarmsTitle;
  title = modeTitle?.getDisplayText(context.options.cultureLcid);
  return title?.trim() ? title : `${listMode} alarms`;
}

function resolveAlarmViewLabel(viewKind: HmiAlarmViewKind): string {
  switch (viewKind) {
    case HmiAlarmViewKind.InformationMessageDisplay: return "Information message";
    case HmiAlarmViewKind.AlarmList: return "Alarm";
    case HmiAlarmViewKind.AlarmStatusList: return "Alarm status";
    case HmiAlarmViewKind.AlarmAndEventSummary: return "Alarm and event summary";
    case HmiAlarmViewKind.AlarmStatusExplorer: return "Alarm status explorer";
    case HmiAlarmViewKind.AlarmAndEventLogViewer: return "Alarm and event log";
    default: return "Alarm";
  }
}

function resolvePropertyPreview<T>(property: HmiProperty<T> | undefined): string | undefined {
  if (property === undefined)
    return undefined;
  if (property.kind === HmiPropertyKind.Expression) {
    const expression = (property as HmiExpressionProperty<T>).expression;
    if (expression?.trim())
      return expression;
  }
  return formatAttributeValue(getStaticValue(property));
}

function resolveScaleRange(scale: HmiScaleWidgetBase): [number, number] {
  const begin = getStaticValue(scale.beginValue) ?? 0;
  let end = getStaticValue(scale.endValue) ?? 0;
  if (begin === end)
    end = begin + 1;
  return begin < end ? [begin, end] : [end, begin];
}

function resolveScaleValue(scale: HmiScaleWidgetBase, minimum: number, maximum: number): number {
  const value = getStaticValue(scale.showFillLevel) === true
    ? getStaticValue(scale.fillLevel) ?? 0
    : getStaticValue(scale.value) ?? 0;
  return Math.min(Math.max(value, minimum), maximum);
}

async function appendSymbolicInput(
  html: string[],
  symbolicIoField: HmiSymbolicIOField,
  project: IHmiProject | undefined,
  context: HmiHtmlConvertContext,
  signal?: AbortSignal,
): Promise<void> {
  const selectedValue = getStaticValue(symbolicIoField.value);
  const selectedState = symbolicIoField.states.find(candidate => candidate.value === selectedValue)
    ?? symbolicIoField.states[0];
  if (selectedState?.image !== undefined) {
    const imageUri = await resolveImageUri(selectedState.image, project, signal);
    const alternateImageUri = selectedState.alternateImage === undefined
      ? undefined
      : await resolveImageUri(selectedState.alternateImage, project, signal);
    const blinkAlternateImage = selectedState.imageBlink && Boolean(alternateImageUri?.trim());
    const imageLayoutStyle = selectedState.imageScaled === false
      ? "width: auto; height: auto; max-width: 100%; max-height: 100%; display: block;"
      : "width: 100%; height: 100%; object-fit: contain; display: block;";
    const imageStyle = blinkAlternateImage
      ? appendCssDeclaration(imageLayoutStyle, `animation: hmi-symbolic-base-flash ${getBlinkDuration(selectedState.imageBlinkRate)}s steps(1, end) infinite;`)
      : imageLayoutStyle;
    let stateStyle = createStateStyle(selectedState) ?? undefined;
    if (selectedState.imageBackgroundTransparent !== true && selectedState.imageBackgroundColor !== undefined)
      stateStyle = appendCssDeclaration(stateStyle, `background-color: ${colorToCss(selectedState.imageBackgroundColor)};`);
    stateStyle = appendCssDeclaration(stateStyle, "overflow: hidden;");

    html.push("<div");
    appendCommonAttributes(html, symbolicIoField, context, true, stateStyle);
    appendAttribute(html, "class", "hmi-symbolic-image-state");
    appendAttribute(html, "role", "status");
    appendAttribute(html, "data-state-value", selectedState.value === undefined ? undefined : toCss(selectedState.value));
    appendAttribute(html, "data-image-name", selectedState.imageName ?? selectedState.image.imageName);
    appendAttribute(html, "data-image-blink", selectedState.imageBlink ? "true" : "false");
    appendAttribute(html, "data-alternate-image-name", selectedState.alternateImageName ?? selectedState.alternateImage?.imageName);
    appendAttribute(html, "data-image-blink-rate", selectedState.imageBlinkRate);
    html.push(">");
    if (imageUri?.trim()) {
      html.push("<img");
      appendAttribute(html, "src", imageUri);
      appendAttribute(html, "alt", selectedState.name ?? selectedState.imageName ?? selectedState.image.imageName ?? symbolicIoField.name);
      appendAttribute(html, "class", "hmi-symbolic-image-base");
      appendAttribute(html, "style", imageStyle);
      html.push(">");
    }
    if (blinkAlternateImage) {
      let alternateStyle = appendCssDeclaration(imageLayoutStyle, "position: absolute; inset: 0;");
      alternateStyle = appendCssDeclaration(alternateStyle, `animation: hmi-symbolic-alternate-flash ${getBlinkDuration(selectedState.imageBlinkRate)}s steps(1, end) infinite;`);
      html.push("<img");
      appendAttribute(html, "src", alternateImageUri);
      appendAttribute(html, "alt", selectedState.name ?? selectedState.alternateImageName ?? selectedState.alternateImage?.imageName ?? symbolicIoField.name);
      appendAttribute(html, "class", "hmi-symbolic-image-alternate");
      appendAttribute(html, "style", alternateStyle);
      html.push(">");
    }
    if (selectedState.text !== undefined) {
      html.push("<span>");
      appendMultilingualText(html, selectedState.text, context);
      html.push("</span>");
    }
    html.push("</div>");
    return;
  }

  html.push("<select");
  appendCommonAttributes(html, symbolicIoField, context, true, createStateStyle(selectedState));
  html.push(">");
  for (const state of symbolicIoField.states) {
    html.push("<option");
    if (state.value !== undefined)
      appendAttribute(html, "value", toCss(state.value));
    appendAttribute(html, "style", createStateStyle(state) ?? undefined);
    if (state === selectedState)
      appendAttribute(html, "selected", "selected");
    html.push(">");
    appendMultilingualText(html, state.text, context);
    html.push("</option>");
  }
  html.push("</select>");
}

function getBlinkDuration(rate: HmiBlinkRate | undefined): string {
  switch (rate) {
    case HmiBlinkRate.Slow:
      return "2";
    case HmiBlinkRate.Fast:
      return "0.5";
    default:
      return "1";
  }
}

async function appendToggleSwitch(
  html: string[],
  toggleSwitch: HmiToggleSwitch,
  project: IHmiProject | undefined,
  context: HmiHtmlConvertContext,
  signal?: AbortSignal,
): Promise<void> {
  const stateValue = getStaticValue(toggleSwitch.state);
  const offState = toggleSwitch.states[0];
  const onState = toggleSwitch.states[1] ?? offState;
  const selectedState = toggleSwitch.states.find(candidate => candidate.value === stateValue) ?? offState;
  const text = getStaticValue(toggleSwitch.text) ?? offState?.text;
  const alternateText = getStaticValue(toggleSwitch.alternateText) ?? onState?.text;
  const image = getStaticValue(toggleSwitch.image) ?? offState?.image;
  const alternateImage = getStaticValue(toggleSwitch.alternateImage) ?? onState?.image;

  html.push("<hmi-toggle-switch");
  appendCommonAttributes(html, toggleSwitch, context, true, createStateStyle(selectedState));
  appendStaticAttribute(
    html,
    "mode",
    context.effectiveProperties.resolve<HmiSwitchType>(toggleSwitch, "Mode", toggleSwitch.mode),
  );
  appendAttribute(html, "text", text?.getDisplayText(context.options.cultureLcid));
  appendAttribute(html, "alternate-text", alternateText?.getDisplayText(context.options.cultureLcid));
  appendAttribute(html, "image", await resolveImageUri(image, project, signal));
  appendAttribute(html, "alternate-image", await resolveImageUri(alternateImage, project, signal));
  appendBooleanAttribute(html, "checked", onState !== undefined && onState !== offState && selectedState === onState);
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

function appendListBox(html: string[], listBox: HmiListBox, context: HmiHtmlConvertContext): void {
  appendSelectionList(html, listBox, context);
}

function appendComboBox(html: string[], comboBox: HmiComboBox, context: HmiHtmlConvertContext): void {
  appendSelectionList(html, comboBox, context);
}

function appendSelectionList(
  html: string[],
  selectionGroup: HmiSelectionGroupBase,
  context: HmiHtmlConvertContext,
): void {
  const selectedValue = selectionGroup.indicator !== undefined
    ? getStaticValue(selectionGroup.indicator)
    : getStaticValue(selectionGroup.value);
  const selectedIndex = getStaticValue(selectionGroup.selectedIndex) ?? -1;
  const selectedState = selectionGroup.states.find(candidate => candidate.value === selectedValue)
    ?? (selectedIndex >= 0 && selectedIndex < selectionGroup.states.length ? selectionGroup.states[selectedIndex] : undefined)
    ?? selectionGroup.states[0];

  html.push("<select");
  appendCommonAttributes(html, selectionGroup, context, true, createStateStyle(selectedState));
  html.push(">");
  for (const state of selectionGroup.states) {
    html.push("<option");
    if (state.value !== undefined)
      appendAttribute(html, "value", toCss(state.value));
    appendAttribute(html, "style", createStateStyle(state) ?? undefined);
    appendAttribute(html, "data-image-name", state.imageName ?? state.image?.imageName);
    if (state === selectedState)
      appendAttribute(html, "selected", "selected");
    html.push(">");
    appendMultilingualText(html, state.text, context);
    html.push("</option>");
  }
  html.push("</select>");
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
  appendTextAttribute(html, "title", rectangle.toolTipText, context);
  appendStaticAttribute(html, "tabindex", rectangle.tabIndex);
  appendAttribute(html, "data-hmi-security-code", rectangle.securityCode);
  appendDisabledAttribute(html, rectangle);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  html.push(" style=\"position: absolute;");
  appendPosition(html, rectangle, context);
  appendDisabledStyle(html, rectangle);
  appendOpacity(html, rectangle, context);
  appendDesignShadow(html, rectangle, context);
  appendStyle(html, rectangle, context);
  appendFillAnimationStyle(html, rectangle, context);
  appendRectangleRadius(html, rectangle);
  if (
    rectangle.borderColor === undefined &&
    rectangle.borderWidth === undefined &&
    rectangle.lineColor === undefined &&
    rectangle.lineWidth === undefined
  ) {
    html.push("border: 1px solid #000000;");
  }
  appendItemTransform(html, rectangle);
  html.push("\"></div>");
}

function appendFillPatternStyle(html: string[], item: HmiPaintedScreenItemBase, context: HmiHtmlConvertContext): void {
  const pattern = getFillPattern(item, context);
  if (pattern === undefined) return;
  appendFillPatternCss(html, pattern, getPatternColor(item, context));
}

function appendFillPatternCss(html: string[], pattern: HmiFillPattern, patternColor: HmiColor): void {
  if (pattern === HmiFillPattern.Solid) return;
  if (pattern === HmiFillPattern.Transparent) {
    html.push("background-color: transparent;");
    return;
  }

  const color = colorToCss(patternColor);
  let image: string;
  switch (pattern) {
    case HmiFillPattern.Checkers:
    case HmiFillPattern.CheckersFiner:
      image = `conic-gradient(${color} 25%, transparent 0 50%, ${color} 0 75%, transparent 0)`;
      break;
    case HmiFillPattern.Horizontal:
      image = `repeating-linear-gradient(to bottom, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.Vertical:
      image = `repeating-linear-gradient(to right, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.DiagonalLeftToRight:
    case HmiFillPattern.Diagonal:
      image = `repeating-linear-gradient(135deg, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.DiagonalRightToLeft:
      image = `repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.DiagonalCross:
    case HmiFillPattern.DiagonalCrossFiner:
    case HmiFillPattern.DiagonalCrossBold:
      image = `repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px 6px), repeating-linear-gradient(135deg, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.Bricks:
    case HmiFillPattern.BricksDiagonal:
      image = `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
      break;
    case HmiFillPattern.HorizontalDifferentLines:
      image = `repeating-linear-gradient(to bottom, ${color} 0 1px, transparent 1px 4px, ${color} 4px 6px, transparent 6px 10px)`;
      break;
    default:
      image = `radial-gradient(circle, ${color} 0 1px, transparent 1px)`;
      break;
  }
  html.push(`background-image: ${image};`);
  html.push(`background-size: ${pattern === HmiFillPattern.CheckersFiner || pattern === HmiFillPattern.DiagonalCrossFiner ? "4px 4px" : "8px 8px"};`);
}

interface ColorGradientSource {
  backgroundColor?: HmiProperty<HmiColor>;
  firstGradientColor?: HmiProperty<HmiColor>;
  firstGradientOffset?: HmiProperty<number>;
  middleGradientColor?: HmiProperty<HmiColor>;
  secondGradientColor?: HmiProperty<HmiColor>;
  secondGradientOffset?: HmiProperty<number>;
  useFirstGradient?: HmiProperty<boolean>;
  useSecondGradient?: HmiProperty<boolean>;
  gradientDirection?: HmiProperty<HmiGradientDirection>;
}

interface ColorGradient {
  direction: HmiGradientDirection;
  stops: Array<{ color: HmiColor; offset: number }>;
}

function getColorGradient(item: HmiPaintedScreenItemBase | HmiScreenBase): ColorGradient | undefined {
  if (item instanceof HmiScreenBase || item instanceof HmiShapeBase || item instanceof HmiWidgetBase || item instanceof HmiWindowBase)
    return createColorGradient(item);
  return undefined;
}

function createColorGradient(source: ColorGradientSource): ColorGradient | undefined {
  const firstColor = getStaticValue(source.firstGradientColor);
  const secondColor = getStaticValue(source.secondGradientColor);
  const firstEnabled = getStaticValueOrDefault(source.useFirstGradient, false) && firstColor !== undefined;
  const secondEnabled = getStaticValueOrDefault(source.useSecondGradient, false) && secondColor !== undefined;
  if (!firstEnabled && !secondEnabled) return undefined;

  const middle = getStaticValue(source.middleGradientColor)
    ?? getStaticValue(source.backgroundColor)
    ?? firstColor
    ?? secondColor;
  if (middle === undefined) return undefined;

  const firstOffset = Math.min(Math.max(getStaticValueOrDefault(source.firstGradientOffset, 50), 0), 100);
  const secondOffset = Math.min(Math.max(getStaticValueOrDefault(source.secondGradientOffset, 50), 0), 100);
  const stops: ColorGradient["stops"] = [
    { color: firstEnabled ? firstColor! : middle, offset: 0 },
  ];
  if (firstEnabled && secondEnabled) {
    stops.push({ color: middle, offset: Math.min(firstOffset, secondOffset) });
    stops.push({ color: middle, offset: Math.max(firstOffset, secondOffset) });
  } else {
    stops.push({ color: middle, offset: firstEnabled ? firstOffset : secondOffset });
  }
  stops.push({ color: secondEnabled ? secondColor! : middle, offset: 100 });
  return {
    direction: getStaticValue(source.gradientDirection) ?? HmiGradientDirection.HorizontalFromLeft,
    stops,
  };
}

function appendColorGradientStyle(html: string[], gradient: ColorGradient | undefined): void {
  if (gradient === undefined) return;
  const stops = gradient.stops.map(stop => `${colorToCss(stop.color)} ${toCss(stop.offset)}%`).join(", ");
  html.push(`background-image: linear-gradient(${gradientDirectionToCss(gradient.direction)}, ${stops});`);
}

function gradientDirectionToCss(direction: HmiGradientDirection): string {
  switch (direction) {
    case HmiGradientDirection.HorizontalFromRight:
      return "to left";
    case HmiGradientDirection.VerticalFromTop:
    case HmiGradientDirection.VerticalFromCenter:
      return "to bottom";
    case HmiGradientDirection.VerticalFromBottom:
      return "to top";
    case HmiGradientDirection.DiagonalUp:
      return "to top right";
    case HmiGradientDirection.DiagonalDown:
      return "to bottom right";
    default:
      return "to right";
  }
}

function appendFillAnimationStyle(html: string[], item: HmiShapeBase, context: HmiHtmlConvertContext): void {
  const percentage = tryGetFillPercentage(item.fillAnimation);
  const fillColor = getFillColor(item, context);
  if (percentage === undefined || fillColor === undefined) return;

  let direction: string;
  switch (item.fillAnimation?.direction) {
    case HmiFillDirection.Up:
      direction = "to top";
      break;
    case HmiFillDirection.Down:
      direction = "to bottom";
      break;
    case HmiFillDirection.Left:
      direction = "to left";
      break;
    default:
      direction = "to right";
      break;
  }
  const color = colorToCss(fillColor);
  html.push("background-color: transparent;");
  html.push(`background-image: linear-gradient(${direction}, ${color} 0%, ${color} ${toCss(percentage)}%, transparent ${toCss(percentage)}%, transparent 100%);`);
}

function appendRectangleRadius(html: string[], rectangle: HmiRectangle): void {
  if (rectangle.cornerRadius === undefined && rectangle.topLeftRadius === undefined &&
      rectangle.topRightRadius === undefined && rectangle.bottomRightRadius === undefined &&
      rectangle.bottomLeftRadius === undefined) return;

  const uniform = Math.max(0, getStaticValue(rectangle.cornerRadius) ?? 0);
  const fallback = { x: uniform, y: uniform };
  const topLeft = getStaticValue(rectangle.topLeftRadius) ?? fallback;
  const topRight = getStaticValue(rectangle.topRightRadius) ?? fallback;
  const bottomRight = getStaticValue(rectangle.bottomRightRadius) ?? fallback;
  const bottomLeft = getStaticValue(rectangle.bottomLeftRadius) ?? fallback;
  html.push(
    "border-radius: ",
    `${toCss(Math.max(0, topLeft.x))}px ${toCss(Math.max(0, topRight.x))}px `,
    `${toCss(Math.max(0, bottomRight.x))}px ${toCss(Math.max(0, bottomLeft.x))}px / `,
    `${toCss(Math.max(0, topLeft.y))}px ${toCss(Math.max(0, topRight.y))}px `,
    `${toCss(Math.max(0, bottomRight.y))}px ${toCss(Math.max(0, bottomLeft.y))}px;`,
  );
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
  appendTextAttribute(html, "title", symbolLibraryControl.toolTipText, context);
  appendStaticAttribute(html, "tabindex", symbolLibraryControl.tabIndex);
  appendAttribute(html, "data-hmi-security-code", symbolLibraryControl.securityCode);
  appendDisabledAttribute(html, symbolLibraryControl);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  appendAttribute(html, "data-hmi-symbol-id", symbolLibraryControl.symbolId);
  appendAttribute(html, "data-hmi-symbol-appearance", formatAttributeValue(getStaticValue(symbolLibraryControl.symbolAppearance)));
  appendAttribute(html, "data-hmi-fill-color-mode", formatAttributeValue(getStaticValue(symbolLibraryControl.fillColorMode)));
  appendAttribute(html, "data-hmi-blink-mode", formatAttributeValue(getStaticValue(symbolLibraryControl.blinkMode)));
  html.push(" style=\"position: absolute; overflow: hidden;");
  appendPosition(html, symbolLibraryControl, context);
  appendDisabledStyle(html, symbolLibraryControl);
  appendOpacity(html, symbolLibraryControl, context);
  appendDesignShadow(html, symbolLibraryControl, context);
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

function appendInnerImage(html: string[], uri: string, grayscale = false): void {
  if (!uri.trim()) {
    return;
  }

  html.push("<img");
  appendAttribute(html, "src", uri);
  html.push(" style=\"width: 100%; height: 100%;");
  if (grayscale) {
    html.push(" filter: grayscale(1);");
  }
  html.push("\">");
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

function appendAlarmIndicator(
  html: string[],
  indicator: HmiAlarmIndicator,
  context: HmiHtmlConvertContext,
): void {
  const alarmState = getStaticValue(indicator.alarmState);
  const noAlarmState = getStaticValue(indicator.noAlarmState) ?? 0;
  const visualState = getStaticValue(indicator.visualState)
    ?? (alarmState !== undefined && alarmState !== noAlarmState ? HmiAlarmIndicatorState.CameIn : HmiAlarmIndicatorState.Normal);
  const numberOfAlarms = getStaticValue(indicator.numberOfAlarms);
  const text = getStaticValue(indicator.text);
  const isLocked = getStaticValue(indicator.isLocked) === true;
  const lockedText = getStaticValue(indicator.lockedText);
  const isActive = visualState !== HmiAlarmIndicatorState.Normal;
  const isFlashingRequired = getStaticValue(indicator.isFlashingRequired) === true;
  const content = isLocked && lockedText
    ? lockedText
    : numberOfAlarms !== undefined && numberOfAlarms > 0
      ? numberOfAlarms.toString()
      : text
        ? text
        : alarmState !== undefined && isActive ? "!" : "";

  let style = "display: flex; overflow: hidden;";
  const animations: string[] = [];
  if (indicator.verticalAlignment === undefined) style += "align-items: center;";
  if (indicator.horizontalAlignment === undefined) style += "justify-content: center;";
  const flashingColor = getStaticValue(indicator.flashingColor);
  if (isActive && flashingColor !== undefined) {
    if (isFlashingRequired) {
      const backgroundColor = getStaticValue(indicator.backgroundColor);
      const flashingRate = getStaticValue(indicator.flashingRate) ?? 1000;
      const duration = flashingRate > 0 ? flashingRate / 1000 : 1;
      style += `--hmi-background-color-off: ${backgroundColor === undefined ? "transparent" : colorToCss(backgroundColor)};`;
      style += `--hmi-background-color-on: ${colorToCss(flashingColor)};`;
      animations.push(`hmi-background-color-flash ${toCss(duration)}s steps(1, end) infinite`);
    } else {
      style += `box-shadow: inset 0 0 0 0.35em ${colorToCss(flashingColor)};`;
    }
  }
  const flashingForegroundColor = getStaticValue(indicator.flashingForegroundColor);
  if (isActive && flashingForegroundColor !== undefined) {
    if (getStaticValue(indicator.isForegroundFlashingRequired) === true) {
      const foregroundColor = getStaticValue(indicator.foregroundColor);
      const flashingRate = getStaticValue(indicator.flashingRate) ?? 1000;
      const duration = flashingRate > 0 ? flashingRate / 1000 : 1;
      style += `--hmi-foreground-color-off: ${foregroundColor === undefined ? "inherit" : colorToCss(foregroundColor)};`;
      style += `--hmi-foreground-color-on: ${colorToCss(flashingForegroundColor)};`;
      animations.push(`hmi-foreground-color-flash ${toCss(duration)}s steps(1, end) infinite`);
    } else {
      style += `color: ${colorToCss(flashingForegroundColor)};`;
    }
  }
  if (animations.length > 0) style += `animation: ${animations.join(", ")};`;
  const lockedForegroundColor = getStaticValue(indicator.lockedForegroundColor);
  if (isLocked && lockedForegroundColor !== undefined) style += `color: ${colorToCss(lockedForegroundColor)};`;
  const lockedBackgroundColor = getStaticValue(indicator.lockedBackgroundColor);
  if (isLocked && lockedBackgroundColor !== undefined) style += `background-color: ${colorToCss(lockedBackgroundColor)};`;

  html.push("<div");
  appendCommonAttributes(html, indicator, context, true, style);
  appendAttribute(html, "class", "hmi-alarm-indicator");
  appendAttribute(html, "role", "status");
  appendAttribute(html, "aria-label", "Alarm indicator");
  appendAttribute(html, "data-active", isActive ? "true" : "false");
  appendStaticValueAttribute(html, "data-visual-state", indicator.visualState);
  appendStaticValueAttribute(html, "data-group-relevant", indicator.isGroupRelevant);
  appendStaticValueAttribute(html, "data-significant-mask", indicator.significantMask);
  appendStaticValueAttribute(html, "data-event-acknowledgement-mask", indicator.eventAcknowledgementMask);
  appendStaticValueAttribute(html, "data-use-global-alarm-classes", indicator.useGlobalAlarmClasses);
  appendStaticValueAttribute(html, "data-use-global-settings", indicator.useGlobalSettings);
  appendStaticValueAttribute(html, "data-user-value-1", indicator.userValue1);
  appendStaticValueAttribute(html, "data-user-value-2", indicator.userValue2);
  appendStaticValueAttribute(html, "data-user-value-3", indicator.userValue3);
  appendStaticValueAttribute(html, "data-user-value-4", indicator.userValue4);
  appendStaticValueAttribute(html, "data-selected-message-class", indicator.selectedMessageClass);
  appendAttribute(html, "data-text-flashing-message-classes", indicator.messageClassAppearances
    .filter(x => getStaticValue(x.isTextFlashingRequired) === true)
    .sort((left, right) => left.index - right.index)
    .map(x => x.index)
    .join(","));
  appendAttribute(html, "data-background-flashing-message-classes", indicator.messageClassAppearances
    .filter(x => getStaticValue(x.isBackgroundFlashingRequired) === true)
    .sort((left, right) => left.index - right.index)
    .map(x => x.index)
    .join(","));
  appendStaticValueAttribute(html, "data-flashing-required", indicator.isFlashingRequired);
  appendStaticValueAttribute(html, "data-flashing-color", indicator.flashingColor);
  appendStaticValueAttribute(html, "data-foreground-flashing-required", indicator.isForegroundFlashingRequired);
  appendStaticValueAttribute(html, "data-flashing-foreground-color", indicator.flashingForegroundColor);
  appendStaticValueAttribute(html, "data-flashing-rate", indicator.flashingRate);
  appendStaticValueAttribute(html, "data-alarm-state", indicator.alarmState);
  appendStaticValueAttribute(html, "data-no-alarm-state", indicator.noAlarmState);
  appendStaticValueAttribute(html, "data-number-of-alarms", indicator.numberOfAlarms);
  appendStaticValueAttribute(html, "data-text", indicator.text);
  appendStaticValueAttribute(html, "data-equal-segment-widths", indicator.useEqualSegmentWidths);
  appendStaticValueAttribute(html, "data-locked", indicator.isLocked);
  appendStaticValueAttribute(html, "data-locked-text", indicator.lockedText);
  appendStaticValueAttribute(html, "data-locked-foreground-color", indicator.lockedForegroundColor);
  appendStaticValueAttribute(html, "data-locked-background-color", indicator.lockedBackgroundColor);
  if (indicator.segments.length > 0) appendAttribute(html, "data-segment-count", indicator.segments.length.toString());
  appendIntegerListAttribute(html, "data-show-acknowledged-alarm-classes", indicator.showAcknowledgedAlarmClasses);
  appendIntegerListAttribute(html, "data-show-pending-alarm-classes", indicator.showPendingAlarmClasses);
  html.push(">");
  if (indicator.segments.length > 0) {
    const useEqualWidths = getStaticValue(indicator.useEqualSegmentWidths) === true;
    for (const segment of [...indicator.segments].sort((left, right) => left.index - right.index)) {
      const width = getStaticValue(segment.width) ?? 0;
      html.push("<span");
      appendAttribute(html, "class", "hmi-alarm-indicator-segment");
      appendAttribute(html, "data-segment-index", segment.index.toString());
      appendIntegerListAttribute(html, "data-message-classes", segment.messageClasses);
      html.push(" style=\"");
      if (width <= 0) html.push("display: none;");
      else if (useEqualWidths) html.push("flex: 1 1 0;");
      else html.push(`flex: 0 0 ${toCss(width)}px;`);
      html.push("height: 100%; min-width: 0; border-right: 1px solid currentColor;\"></span>");
    }
    const horizontalAlignment = getStaticValue(indicator.horizontalAlignment) ?? HmiHorizontalAlignment.Center;
    const verticalAlignment = getStaticValue(indicator.verticalAlignment) ?? HmiVerticalAlignment.Center;
    html.push("<span class=\"hmi-alarm-indicator-label\" style=\"position: absolute; inset: 0; display: flex; pointer-events: none; ");
    html.push(`justify-content: ${horizontalAlignmentToFlexCss(horizontalAlignment)}; `);
    html.push(`align-items: ${verticalAlignmentToCss(verticalAlignment)};\">`);
    html.push(escapeHtml(content), "</span>");
  } else {
    html.push(escapeHtml(content));
  }
  html.push("</div>");
}

function appendStaticValueAttribute<T>(html: string[], name: string, property: HmiProperty<T> | undefined): void {
  appendAttribute(html, name, formatAttributeValue(getStaticValue(property)));
}

function appendIntegerListAttribute(
  html: string[],
  name: string,
  property: HmiProperty<number[]> | undefined,
): void {
  const value = getStaticValue(property);
  if (value !== undefined) appendAttribute(html, name, value.join(","));
}

function appendTrendControl(html: string[], trendControl: HmiTrendControl, context: HmiHtmlConvertContext): void {
  html.push("<hmi-trend-control");
  appendCommonAttributes(html, trendControl, context, true, createTrendControlStyle(trendControl));
  appendAttribute(html, "data-window-resizable", resolvePropertyPreview(trendControl.resizable));
  appendAttribute(html, "data-window-movable", resolvePropertyPreview(trendControl.movable));
  appendAttribute(html, "data-window-closeable", resolvePropertyPreview(trendControl.closeable));
  appendAttribute(html, "control-name", trendControl.name);
  appendAttribute(html, "type-name", "Trend control");
  appendAttribute(html, "chart-title", trendControl.chartTitle);
  appendStaticBooleanValueAttribute(html, "display-chart-title", trendControl.displayChartTitle);
  appendStaticBooleanValueAttribute(html, "show-toolbar", trendControl.showToolbar);
  appendStaticBooleanValueAttribute(html, "use-toolbar-background-color", trendControl.useToolbarBackgroundColor);
  appendStaticAttribute(html, "toolbar-background-color", trendControl.toolbarBackgroundColor);
  appendStaticAttribute(html, "toolbar-button-size", trendControl.toolbarButtonSize);
  appendStaticBooleanValueAttribute(html, "show-status-bar", trendControl.showStatusBar);
  appendStaticBooleanValueAttribute(html, "use-status-bar-background-color", trendControl.useStatusBarBackgroundColor);
  appendStaticBooleanValueAttribute(html, "display-pen-icons", trendControl.displayPenIcons);
  appendStaticBooleanValueAttribute(html, "display-value-bar", trendControl.displayValueBar);
  appendStaticAttribute(html, "value-bar-color", trendControl.valueBarColor);
  appendStaticAttribute(html, "value-bar-width", trendControl.valueBarWidth);
  appendStaticBooleanValueAttribute(html, "display-scroll-mechanism", trendControl.displayScrollMechanism);
  appendStaticBooleanValueAttribute(html, "chart-live-mode", trendControl.chartLiveMode);
  appendStaticBooleanValueAttribute(html, "auto-scale", trendControl.autoScale);
  appendStaticBooleanValueAttribute(html, "x-axis-scale-visible", trendControl.xAxisScaleVisible);
  appendStaticBooleanValueAttribute(html, "x-axis-date-visible", trendControl.xAxisDateVisible);
  appendStaticBooleanValueAttribute(html, "x-axis-grid-visible", trendControl.xAxisGridVisible);
  appendStaticBooleanValueAttribute(html, "y-axis-scale-visible", trendControl.yAxisScaleVisible);
  appendStaticBooleanValueAttribute(html, "y-axis-grid-visible", trendControl.yAxisGridVisible);
  appendStaticBooleanValueAttribute(html, "show-percentage-axis", trendControl.showPercentageAxis);
  appendStaticAttribute(html, "percentage-axis-color", trendControl.percentageAxisColor);
  appendStaticAttribute(html, "percentage-axis-alignment", trendControl.percentageAxisAlignment);
  appendStaticAttribute(html, "minimum-value", trendControl.minimumValue);
  appendStaticAttribute(html, "maximum-value", trendControl.maximumValue);
  appendStaticAttribute(html, "y-axis-decimal-places", trendControl.yAxisDecimalPlaces);
  appendAttribute(html, "pens", formatTrendPens(trendControl.pens));
  html.push("></hmi-trend-control>");
}

function createControlWindowStyle(window: HmiWindowBase, baseStyle: string): string {
  return getStaticValue(window.resizable) === true ? `${baseStyle}resize: both;` : baseStyle;
}

function createAlarmControlStyle(alarmControl: HmiAlarmControl): string {
  const horizontalOverflow = getStaticValue(alarmControl.showHorizontalScrollbar) === true ? "auto" : "hidden";
  const verticalOverflow = getStaticValue(alarmControl.showVerticalScrollbar) === true ? "auto" : "hidden";
  let style = createControlWindowStyle(
    alarmControl,
    `display: flex; flex-direction: column; overflow-x: ${horizontalOverflow};overflow-y: ${verticalOverflow};`,
  );
  const gridLineColor = getStaticValue(alarmControl.gridLineColor);
  if (gridLineColor !== undefined)
    style += `--hmi-grid-line-color: ${colorToCss(gridLineColor)};`;
  const parts = [style];
  if (alarmControl.contentFont !== undefined)
    appendFont(parts, alarmControl.contentFont);
  return parts.join("");
}

function createAlarmHeaderStyle(alarmControl: HmiAlarmControl): string {
  const parts = ["flex: 0 0 auto; display: flex; align-items: center; border-bottom: 1px solid currentColor; padding: 2px 4px; font-weight: bold;"];
  appendColorStyle(parts, "background-color", alarmControl.headerBackgroundColor);
  appendColorStyle(parts, "color", alarmControl.headerForegroundColor);
  appendColorStyle(parts, "border-bottom-color", alarmControl.headerBorderColor);
  if (alarmControl.headerFont !== undefined)
    appendFont(parts, alarmControl.headerFont);
  return parts.join("");
}

function createAlarmTableStyle(alarmControl: HmiAlarmControl): string {
  const parts = ["width: 100%; border-collapse: collapse; table-layout: fixed;"];
  appendColorStyle(parts, "background-color", alarmControl.tableBackgroundColor);
  appendColorStyle(parts, "color", alarmControl.tableForegroundColor);
  const alternatingBackground = getStaticValue(alarmControl.alternatingRowBackgroundColor);
  if (alternatingBackground !== undefined)
    parts.push(`--hmi-alarm-alternating-row-background: ${colorToCss(alternatingBackground)};`);
  const alternatingForeground = getStaticValue(alarmControl.alternatingRowForegroundColor);
  if (alternatingForeground !== undefined)
    parts.push(`--hmi-alarm-alternating-row-foreground: ${colorToCss(alternatingForeground)};`);
  return parts.join("");
}

function createAlarmGridCellStyle(alarmControl: HmiAlarmControl): string {
  const horizontal = getStaticValue(alarmControl.showHorizontalGridLines) !== false;
  const vertical = getStaticValue(alarmControl.showVerticalGridLines) !== false;
  const width = Math.max(0, getStaticValue(alarmControl.gridLineWidth) ?? 1);
  return `border-style: solid; border-color: var(--hmi-grid-line-color, currentColor); border-width: ${horizontal ? toCss(width) : "0"}px ${vertical ? toCss(width) : "0"}px;`;
}

function appendAlarmSelectionRectangleStyle(parts: string[], alarmControl: HmiAlarmControl): void {
  if ((getStaticValue(alarmControl.selectionRectangleMode) ?? 0) === 0)
    return;

  const width = Math.max(0, getStaticValue(alarmControl.selectionRectangleWidth) ?? 1);
  let color = "currentColor";
  if (getStaticValue(alarmControl.useAutomaticSelectionRectangleColor) !== true) {
    const configuredColor = getStaticValue(alarmControl.selectionRectangleColor);
    if (configuredColor !== undefined)
      color = colorToCss(configuredColor);
  }
  parts.push(`outline: ${toCss(width)}px solid ${color};outline-offset: -${toCss(width)}px;`);
}

function createAlarmTableHeaderCellStyle(alarmControl: HmiAlarmControl, gridCellStyle: string): string {
  const parts = [gridCellStyle];
  appendColorStyle(parts, "background-color", alarmControl.tableHeaderBackgroundColor);
  appendColorStyle(parts, "color", alarmControl.tableHeaderForegroundColor);
  const horizontalAlignment = getStaticValue(alarmControl.tableHeaderHorizontalAlignment);
  if (horizontalAlignment !== undefined)
    parts.push(`text-align: ${horizontalAlignmentToCss(horizontalAlignment)};`);
  appendColorStyle(parts, "border-color", alarmControl.tableHeaderBorderColor);
  const borderWidth = getStaticValue(alarmControl.tableHeaderBorderWidth);
  if (borderWidth !== undefined) parts.push(`border-width: ${toCss(Math.max(0, borderWidth))}px;`);
  if (alarmControl.headerFont !== undefined) appendFont(parts, alarmControl.headerFont);
  return parts.join("");
}

function createTrendControlStyle(trendControl: HmiTrendControl): string {
  const parts = [createControlWindowStyle(trendControl, "overflow: hidden;")];
  appendFontVariables(parts, "content", trendControl.contentFont);
  appendFontVariables(parts, "header", trendControl.headerFont);
  appendFontVariables(parts, "status", trendControl.statusBarFont);
  const toolbarBackground = getStaticValue(trendControl.toolbarBackgroundColor);
  if (toolbarBackground !== undefined && getStaticValue(trendControl.useToolbarBackgroundColor) !== false)
    parts.push(`--hmi-trend-toolbar-background: ${colorToCss(toolbarBackground)};`);
  const configuredToolbarButtonSize = getStaticValue(trendControl.toolbarButtonSize);
  if (configuredToolbarButtonSize !== undefined) {
    const toolbarButtonSize = Math.max(1, configuredToolbarButtonSize === 0 ? 28 : configuredToolbarButtonSize);
    parts.push(`--hmi-trend-toolbar-button-size: ${toCss(toolbarButtonSize)}px;`);
  }
  const statusBackground = getStaticValue(trendControl.statusBarBackgroundColor);
  if (statusBackground !== undefined && getStaticValue(trendControl.useStatusBarBackgroundColor) !== false)
    parts.push(`--hmi-trend-status-background: ${colorToCss(statusBackground)};`);
  const statusForeground = getStaticValue(trendControl.statusBarForegroundColor);
  if (statusForeground !== undefined)
    parts.push(`--hmi-trend-status-foreground: ${colorToCss(statusForeground)};`);
  const percentageColor = getStaticValue(trendControl.percentageAxisColor);
  if (percentageColor !== undefined)
    parts.push(`--hmi-trend-percentage-axis-color: ${colorToCss(percentageColor)};`);
  const valueBarColor = getStaticValue(trendControl.valueBarColor);
  if (valueBarColor !== undefined)
    parts.push(`--hmi-trend-value-bar-color: ${colorToCss(valueBarColor)};`);
  const valueBarWidth = getStaticValue(trendControl.valueBarWidth);
  if (valueBarWidth !== undefined)
    parts.push(`--hmi-trend-value-bar-width: ${toCss(Math.max(0, valueBarWidth))}px;`);
  return parts.join("");
}

function appendFontVariables(html: string[], role: string, font: HmiFont | undefined): void {
  if (font === undefined) return;
  const prefix = `--hmi-trend-${role}-`;
  const name = getStaticValue(font.name);
  const size = getStaticValue(font.size);
  const weight = getStaticValue(font.weight);
  if (name?.trim()) html.push(`${prefix}font-family: ${escapeHtml(name)};`);
  if (size !== undefined) html.push(`${prefix}font-size: ${toCss(size)}px;`);
  if (weight !== undefined && weight > 0) html.push(`${prefix}font-weight: ${weight};`);
  else if (getStaticValueOrDefault(font.bold, false)) html.push(`${prefix}font-weight: bold;`);
  if (getStaticValueOrDefault(font.italic, false)) html.push(`${prefix}font-style: italic;`);
  const decorations = [];
  if (getStaticValueOrDefault(font.underline, false)) decorations.push("underline");
  if (getStaticValueOrDefault(font.strikethrough, false)) decorations.push("line-through");
  if (decorations.length > 0) html.push(`${prefix}text-decoration: ${decorations.join(" ")};`);
}

function appendStaticBooleanValueAttribute(
  html: string[],
  name: string,
  property: HmiProperty<boolean> | undefined,
): void {
  const value = getStaticValue(property);
  if (value !== undefined) appendAttribute(html, name, value ? "true" : "false");
}

function formatTrendPens(pens: readonly HmiTrendPen[]): string | undefined {
  if (pens.length === 0) return undefined;
  return JSON.stringify(pens.map(pen => {
    const result: Record<string, string | number | boolean> = { number: pen.number };
    if (pen.name !== undefined) result.name = pen.name;
    const color = getStaticValue(pen.color);
    if (color !== undefined) result.color = colorToCss(color);
    const visible = getStaticValue(pen.visible);
    if (visible !== undefined) result.visible = visible;
    const width = getStaticValue(pen.width);
    if (width !== undefined) result.width = width;
    const style = getStaticValue(pen.style);
    if (style !== undefined) result.style = style;
    const marker = getStaticValue(pen.marker);
    if (marker !== undefined) result.marker = marker;
    const minimum = getStaticValue(pen.minimumValue);
    if (minimum !== undefined) result.minimum = minimum;
    const maximum = getStaticValue(pen.maximumValue);
    if (maximum !== undefined) result.maximum = maximum;
    if (pen.engineeringUnit !== undefined) result.unit = pen.engineeringUnit;
    return result;
  }));
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
  appendTextAttribute(html, "title", item.toolTipText, context);
  appendStaticAttribute(html, "tabindex", item.tabIndex);
  appendAttribute(html, "data-hmi-security-code", item.securityCode);
  appendStaticAttribute(html, "data-adapt-border-to-content", item.adaptBorderToContent);
  appendDisabledAttribute(html, item);
  appendHotKeyAttributes(html, item);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  html.push(" style=\"position: absolute;");
  appendPosition(html, item, context);
  appendAdaptBorderToContentStyle(html, item);
  appendDisabledStyle(html, item);
  appendOpacity(html, item, context);
  appendDesignShadow(html, item, context);
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
  appendTextAttribute(html, "title", symbolContainer.toolTipText, context);
  appendStaticAttribute(html, "tabindex", symbolContainer.tabIndex);
  appendAttribute(html, "data-hmi-security-code", symbolContainer.securityCode);
  appendDisabledAttribute(html, symbolContainer);
  appendAttribute(html, "data-hmi-node-key", context.nodeKey);
  appendAttribute(html, "data-hmi-fill-color-mode", getStaticValue(symbolContainer.fillColorMode));
  appendAttribute(html, "data-hmi-flip", getStaticValue(symbolContainer.flip));
  html.push(" style=\"position: absolute; overflow: hidden;");
  appendPosition(html, symbolContainer, context);
  appendDisabledStyle(html, symbolContainer);
  appendOpacity(html, symbolContainer, context);
  appendDesignShadow(html, symbolContainer, context);
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

function appendOpacity(html: string[], item: HmiScreenItemBase, context: HmiHtmlConvertContext): void {
  const opacity = getStaticValue(context.effectiveProperties.resolve(item, "Opacity", item.opacity));
  if (opacity !== undefined) {
    html.push(`opacity: ${toCss(Math.min(Math.max(opacity, 0), 1))};`);
  }
}

function appendAdaptBorderToContentStyle(html: string[], item: HmiScreenItemBase): void {
  if (getStaticValueOrDefault(item.adaptBorderToContent, false)) {
    html.push("width: max-content;height: max-content;white-space: nowrap;");
  }
}

function appendDisabledAttribute(html: string[], item: HmiScreenItemBase): void {
  if (!getStaticValueOrDefault(item.enabled, true)) {
    appendAttribute(html, "aria-disabled", "true");
  }
  if (item instanceof HmiPaintedScreenItemBase) {
    appendAttribute(html, "data-disabled-foreground-color", formatAttributeValue(getStaticValue(item.disabledForegroundColor)));
    appendAttribute(html, "data-disabled-foreground-shadow-color", formatAttributeValue(getStaticValue(item.disabledForegroundShadowColor)));
    appendAttribute(html, "data-use-disabled-foreground-color", formatAttributeValue(getStaticValue(item.useDisabledForegroundColor)));
  }
}

function appendDisabledStyle(html: string[], item: HmiScreenItemBase): void {
  if (!getStaticValueOrDefault(item.enabled, true)) {
    html.push("pointer-events: none;");
  }
}

function appendHotKeyAttributes(html: string[], item: HmiScreenItemBase): void {
  const hotKeyProperty = item instanceof HmiButtonBase || item instanceof HmiIOField
    ? item.hotKey
    : undefined;
  const hotKey = getStaticValue(hotKeyProperty);
  if (!hotKey) return;

  appendAttribute(html, "data-hmi-hot-key", hotKey);
  appendAttribute(html, "aria-keyshortcuts", toAriaKeyShortcuts(hotKey));
}

function toAriaKeyShortcuts(hotKey: string): string {
  return hotKey.split("+").map(part => {
    switch (part.toUpperCase()) {
      case "CTRL": return "Control";
      case "WIN": return "Meta";
      default: return part;
    }
  }).join("+");
}

function appendDesignShadow(html: string[], item: HmiScreenItemBase, context: HmiHtmlConvertContext): void {
  let configuredShadow: HmiProperty<boolean> | undefined;
  if (item instanceof HmiShapeBase || item instanceof HmiWidgetBase || item instanceof HmiWindowBase) {
    configuredShadow = item.useDesignShadowSettings;
  }
  const useDesignShadow = context.effectiveProperties.resolve(item, "UseDesignShadowSettings", configuredShadow);
  if (getStaticValueOrDefault(useDesignShadow, false)) {
    html.push("filter: drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.35));");
  }
}

function appendSize(html: string[], width: number, height: number): void {
  if (width > 0) {
    html.push(`width: ${toCss(width)}px;`);
  }
  if (height > 0) {
    html.push(`height: ${toCss(height)}px;`);
  }
}

function appendScreenStyle(html: string[], screen: HmiScreenBase, backgroundImageUri: string | undefined): void {
  appendColorStyle(html, "background-color", screen.backgroundColor);
  const pattern = getStaticValue(screen.fillPattern);
  if (pattern !== undefined) {
    appendFillPatternCss(html, pattern, getStaticValue(screen.patternColor) ?? hmiColorFromArgb(255, 0, 0, 0));
    appendScreenFillPatternAlignment(html, screen, pattern);
  }
  appendColorGradientStyle(html, getColorGradient(screen));
  if (backgroundImageUri?.trim()) {
    html.push(`background-image: url(&quot;${escapeHtml(backgroundImageUri)}&quot;);`);
    switch (getStaticValue(screen.backgroundImageLayout) ?? HmiBackgroundImageLayout.Normal) {
      case HmiBackgroundImageLayout.Tile:
        html.push("background-repeat: repeat;background-size: auto;");
        break;
      case HmiBackgroundImageLayout.StretchToViewport:
      case HmiBackgroundImageLayout.StretchToScreen:
        html.push("background-repeat: no-repeat;background-size: 100% 100%;");
        break;
      default:
        html.push("background-repeat: no-repeat;background-size: auto;");
        break;
    }
  }
}

function appendScreenFillPatternAlignment(
  html: string[],
  screen: HmiScreenBase,
  pattern: HmiFillPattern,
): void {
  if (getStaticValue(screen.fillPatternAlignment) !== HmiFillPatternAlignment.StretchToViewport ||
      pattern === HmiFillPattern.Solid || pattern === HmiFillPattern.Transparent) {
    return;
  }

  const width = getStaticValueOrDefault(screen.width, 0);
  const height = getStaticValueOrDefault(screen.height, 0);
  if (width <= 0 || height <= 0) return;
  const tileSize = pattern === HmiFillPattern.CheckersFiner || pattern === HmiFillPattern.DiagonalCrossFiner ? 4 : 8;
  html.push(`background-size: ${toCss(tileSize / width * 100)}% ${toCss(tileSize / height * 100)}%;`);
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
  const borderStyle = getBorderStyleCss(item, context);
  const animations: string[] = [];
  const useDisabledForegroundColor = !getStaticValueOrDefault(item.enabled, true) &&
    getStaticValueOrDefault(item.useDisabledForegroundColor, false);
  let foregroundColor = context.effectiveProperties.resolve(item, "ForegroundColor", item.foregroundColor);
  if (useDisabledForegroundColor) {
    foregroundColor = context.effectiveProperties.resolve(
      item,
      "DisabledForegroundColor",
      item.disabledForegroundColor,
    ) ?? foregroundColor;
  }
  const foregroundBlink = foregroundColor?.kind === HmiPropertyKind.Blink
    ? foregroundColor as HmiBlinkProperty<HmiColor>
    : undefined;
  if (foregroundBlink?.staticValue !== undefined && foregroundBlink.blinkValue !== undefined) {
    html.push(`--hmi-foreground-color-off: ${colorToCss(foregroundBlink.staticValue)};`);
    html.push(`--hmi-foreground-color-on: ${colorToCss(foregroundBlink.blinkValue)};`);
    animations.push(`hmi-foreground-color-flash ${getBlinkDuration(foregroundBlink.rate)}s steps(1, end) infinite`);
  } else {
    appendColorStyle(html, "color", foregroundColor);
  }
  if (useDisabledForegroundColor) {
    const shadow = getStaticValue(context.effectiveProperties.resolve(
      item,
      "DisabledForegroundShadowColor",
      item.disabledForegroundShadowColor,
    ));
    if (shadow !== undefined) html.push(`text-shadow: 1px 1px ${colorToCss(shadow)};`);
  }
  if (!(item instanceof HmiGauge)) {
    const backgroundColor = context.effectiveProperties.resolve(item, "BackgroundColor", item.backgroundColor);
    const backgroundBlink = backgroundColor?.kind === HmiPropertyKind.Blink
      ? backgroundColor as HmiBlinkProperty<HmiColor>
      : undefined;
    if (backgroundBlink?.staticValue !== undefined && backgroundBlink.blinkValue !== undefined) {
      html.push(`--hmi-background-color-off: ${colorToCss(backgroundBlink.staticValue)};`);
      html.push(`--hmi-background-color-on: ${colorToCss(backgroundBlink.blinkValue)};`);
      animations.push(`hmi-background-color-flash ${getBlinkDuration(backgroundBlink.rate)}s steps(1, end) infinite`);
    } else {
      appendColorStyle(html, "background-color", backgroundColor);
    }
  }
  const borderColor = context.effectiveProperties.resolve(item, "BorderColor", item.borderColor);
  const borderBlink = borderColor?.kind === HmiPropertyKind.Blink
    ? borderColor as HmiBlinkProperty<HmiColor>
    : undefined;
  if (borderBlink?.staticValue !== undefined && borderBlink.blinkValue !== undefined) {
    html.push(`--hmi-border-color-off: ${colorToCss(borderBlink.staticValue)};`);
    html.push(`--hmi-border-color-on: ${colorToCss(borderBlink.blinkValue)};`);
    animations.push(`hmi-border-color-flash ${getBlinkDuration(borderBlink.rate)}s steps(1, end) infinite`);
  } else {
    appendColorStyle(html, "border-color", borderColor);
  }
  if (animations.length > 0)
    html.push(`animation: ${animations.join(", ")};`);
  appendWidthStyle(html, context.effectiveProperties.resolve(item, "BorderWidth", item.borderWidth), borderStyle, !suppressBorderStyle);
  if (item instanceof HmiShapeBase) {
    appendColorStyle(html, "border-color", item.lineColor);
    appendWidthStyle(html, item.lineWidth, borderStyle);
  }
  appendFillPatternStyle(html, item, context);
  appendColorGradientStyle(html, getColorGradient(item));
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

function getBorderStyleCss(item: HmiPaintedScreenItemBase, context: HmiHtmlConvertContext): string {
  const style = item instanceof HmiShapeBase
    ? context.effectiveProperties.tryGetStaticValue<number>(item, "DashType", item.dashType).value
      ?? context.effectiveProperties.tryGetStaticValue<number>(item, "BorderStyle", item.borderStyle).value
    : context.effectiveProperties.tryGetStaticValue<number>(item, "BorderStyle", item.borderStyle).value;

  switch (style) {
    case HmiLineStyle.None:
      return "none";
    case HmiLineStyle.Dash:
    case HmiLineStyle.DashDot:
    case HmiLineStyle.DashDotDot:
      return "dashed";
    case HmiLineStyle.Dot:
      return "dotted";
    case HmiLineStyle.Double:
      return "double";
    case HmiLineStyle.Style3D:
      return "groove";
    default:
      return "solid";
  }
}

function getFont(item: HmiScreenItemBase): HmiFont | undefined {
  if (item instanceof HmiText) {
    return item.font;
  }
  if (item instanceof HmiAlarmIndicator) {
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
  if (item instanceof HmiAlarmIndicator) {
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
  if (item instanceof HmiAlarmIndicator) {
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
  const weight = getStaticValue(font.weight);
  if (name?.trim()) {
    html.push(`font-family: ${escapeHtml(name)};`);
  }
  if (size !== undefined) {
    html.push(`font-size: ${toCss(size)}px;`);
  }
  if (weight !== undefined && weight > 0) {
    html.push(`font-weight: ${weight};`);
  } else if (getStaticValueOrDefault(font.bold, false)) {
    html.push("font-weight: bold;");
  }
  if (getStaticValueOrDefault(font.italic, false)) {
    html.push("font-style: italic;");
  }
  const decorations = [];
  if (getStaticValueOrDefault(font.underline, false)) decorations.push("underline");
  if (getStaticValueOrDefault(font.strikethrough, false)) decorations.push("line-through");
  if (decorations.length > 0) html.push(`text-decoration: ${decorations.join(" ")};`);
}

function appendColorStyle(html: string[], name: string, property: HmiProperty<HmiColor> | undefined): void {
  const value = getStaticValue(property);
  if (value !== undefined) {
    html.push(`${name}: ${colorToCss(value)};`);
  }
}

function appendWidthStyle(
  html: string[],
  property: HmiProperty<number> | undefined,
  borderStyle: string,
  includeBorderStyle = true,
): void {
  const value = getStaticValue(property);
  if (value !== undefined) {
    if (includeBorderStyle) {
      html.push(`border-style: ${borderStyle};`);
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
