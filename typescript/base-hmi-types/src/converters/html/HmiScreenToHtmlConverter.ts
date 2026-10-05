import { HmiCharacterScreen } from "../../screens/screen/HmiCharacterScreen.js";
import { formatScaleLabel } from "./format-scale-label.js";
import { nativeBarSigmaRampFactors } from "./bar-sigma-ramp.generated.js";
import { IHmiProject } from "../../projects/IHmiProject.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiImage } from "../../images/HmiImage.js";
import { HmiImageType } from "../../images/HmiImageType.js";
import { MetafileToSvgRenderer } from "../../images/converters/metafile-to-svg-renderer.js";
import { SymbolLibraryMetafileColorizer } from "../../images/converters/symbol-library-metafile-colorizer.js";
import { HmiSymbolLibraryFillColorMode } from "../../screens/base/HmiSymbolLibraryEnums.js";
import { SymbolLibraryMetafileTransformer } from "../../images/converters/symbol-library-metafile-transformer.js";
import { tryOverrideSvgImageAspectRatio } from "../../images/converters/svg-image-aspect-ratio.js";
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
import { HmiTrendValueAxis } from "../../screens/base/HmiTrendValueAxis.js";
import { HmiTrendXValueAxis } from "../../screens/base/HmiTrendXValueAxis.js";
import { HmiTrendWindow } from "../../screens/base/HmiTrendWindow.js";
import { HmiTrendTimeAxis } from "../../screens/base/HmiTrendTimeAxis.js";
import { HmiTrendControlBase } from "../../screens/base/HmiTrendControlBase.js";
import { HmiTrendChartStyle } from "../../screens/base/HmiTrendChartStyle.js";
import { HmiFunctionTrendControl } from "../../screens/controls/HmiFunctionTrendControl.js";
import { HmiPaintedScreenItemBase } from "../../screens/base/HmiPaintedScreenItemBase.js";
import { HmiOcxControl } from "../../screens/base/HmiOcxControl.js";
import { staticProperty, getStaticValue, getStaticValueOrDefault, HmiBlinkProperty, HmiBlinkRate, HmiExpressionProperty, HmiProperty, HmiPropertyKind } from "../../screens/base/HmiProperty.js";
import { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import { HmiScreenItemBase } from "../../screens/base/HmiScreenItemBase.js";
import { HmiSymbolContainer } from "../../screens/base/HmiSymbolContainer.js";
import { HmiSymbolFlipMode } from "../../screens/base/HmiSymbolFlipMode.js";
import { HmiSymbolLibraryControl } from "../../screens/base/HmiSymbolLibraryControl.js";
import {
  HmiSymbolLibraryBackFillStyle,
  HmiSymbolLibraryBlinkMode,
  HmiSymbolLibraryBlinkSpeed,
  HmiSymbolLibraryRasterLayout,
  HmiSymbolLibraryFlip,
  HmiSymbolLibraryRotation,
} from "../../screens/base/HmiSymbolLibraryEnums.js";
import { HmiVerticalAlignment } from "../../screens/base/HmiVerticalAlignment.js";
import { HmiWindowBase } from "../../screens/base/HmiWindowBase.js";
import { HmiAlarmControl } from "../../screens/controls/HmiAlarmControl.js";
import type { HmiAlarmColumnSet } from "../../screens/controls/HmiAlarmColumnSet.js";
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
import { HmiCentricShapeBase } from "../../screens/shapes/HmiCentricShapeBase.js";
import { HmiText } from "../../screens/shapes/HmiText.js";
import { HmiUnkown } from "../../screens/shapes/HmiUnkown.js";
import { HmiButton } from "../../screens/widgets/HmiButton.js";
import { HmiButtonBase } from "../../screens/widgets/HmiButtonBase.js";
import { HmiBar, HmiBarFillStyle, HmiBarValueMapping } from "../../screens/widgets/HmiBar.js";
import { HmiDisabledImageMode } from "../../screens/widgets/HmiDisabledImageMode.js";
import { HmiState } from "../../screens/widgets/HmiState.js";
import { HmiCheckBoxGroup } from "../../screens/widgets/HmiCheckBoxGroup.js";
import { HmiDateTimeField } from "../../screens/widgets/HmiDateTimeField.js";
import { HmiClock } from "../../screens/widgets/HmiClock.js";
import { HmiComboBox } from "../../screens/widgets/HmiComboBox.js";
import { HmiGauge } from "../../screens/widgets/HmiGauge.js";
import { HmiButtonShape } from "../../screens/widgets/HmiButtonShape.js";
import { HmiButtonType } from "../../screens/widgets/HmiButtonType.js";
import { HmiIOField } from "../../screens/widgets/HmiIOField.js";
import { HmiLabel } from "../../screens/widgets/HmiLabel.js";
import { HmiListBox } from "../../screens/widgets/HmiListBox.js";
import { HmiRadioButtonGroup } from "../../screens/widgets/HmiRadioButtonGroup.js";
import { HmiScale } from "../../screens/widgets/HmiScale.js";
import { HmiScaleWidgetBase } from "../../screens/widgets/HmiScaleWidgetBase.js";
import { HmiTickDirection } from "../../screens/widgets/HmiTickDirection.js";
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
import { HmiUserViewControl } from "../../screens/controls/HmiUserViewControl.js";
import { HmiStatusForceControl } from "../../screens/controls/HmiStatusForceControl.js";
import { HmiRecipeControl } from "../../screens/controls/HmiRecipeControl.js";
import { HmiNcPartProgramControl } from "../../screens/controls/HmiNcPartProgramControl.js";
import { HmiNcKeyboardControl } from "../../screens/controls/HmiNcKeyboardControl.js";
import { HmiDetailedParameterControl } from "../../screens/controls/HmiDetailedParameterControl.js";
import { HmiOverviewParameterControl } from "../../screens/controls/HmiOverviewParameterControl.js";
import { HmiParameterControlBase } from "../../screens/controls/HmiParameterControlBase.js";
import { HmiParameterColumn } from "../../screens/controls/HmiParameterColumn.js";
import { HmiRecipeViewKind } from "../../screens/controls/HmiRecipeViewKind.js";
import { HmiRadarChartControl } from "../../screens/controls/HmiRadarChartControl.js";
import { HmiProcessDiagnosisOverviewControl } from "../../screens/controls/HmiProcessDiagnosisOverviewControl.js";
import { HmiProcessDiagnosisPlcCodeViewerControl } from "../../screens/controls/HmiProcessDiagnosisPlcCodeViewerControl.js";
import { HmiProcessDiagnosisCriteriaAnalysisControl } from "../../screens/controls/HmiProcessDiagnosisCriteriaAnalysisControl.js";
import { HmiProcessDiagnosisGraphOverviewControl } from "../../screens/controls/HmiProcessDiagnosisGraphOverviewControl.js";
import { HmiSystemDiagnosisAppearance } from "../../screens/controls/HmiSystemDiagnosisAppearance.js";
import { HmiSystemDiagnosisControl } from "../../screens/controls/HmiSystemDiagnosisControl.js";
import { HmiSystemDiagnosisColumnType } from "../../screens/controls/HmiSystemDiagnosisColumnType.js";
import { HmiSystemDiagnosisViewKind } from "../../screens/controls/HmiSystemDiagnosisViewKind.js";
import { HmiMediaControl } from "../../screens/controls/HmiMediaControl.js";
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
      html.push('"');
      appendAttribute(html, "data-hmi-screen", "true");
      html.push(">");

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
    } else if (item instanceof HmiTextBox) {
      appendTextBox(html, item, context);
    } else if (item instanceof HmiLabel || item instanceof HmiText) {
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
    } else if (item instanceof HmiDateTimeField) {
      appendDateTimeField(html, item, context);
    } else if (item instanceof HmiClock) {
      appendClock(html, item, context);
    } else if (item instanceof HmiArrowIndicator) {
      appendArrowIndicator(html, item, context);
    } else if (item instanceof HmiAlarmIndicator) {
      appendAlarmIndicator(html, item, context);
    } else if (item instanceof HmiGauge) {
      appendGauge(html, item, context);
    } else if (item instanceof HmiTrendControlBase) {
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
    } else if (item instanceof HmiUserViewControl) {
      appendUserViewControl(html, item, context);
      const childContext = item.childCoordinateSpace === HmiChildCoordinateSpace.ScreenAbsolute
        ? context.withPositionOffset(-getStaticValueOrDefault(item.x, 0), -getStaticValueOrDefault(item.y, 0)) : context;
      for (let childIndex = 0; childIndex < item.items.length; childIndex++) {
        await this.appendItemAsync(html, item.items[childIndex], project, childContext, screenStack,
          `${key}/item:${childIndex}`, includeInspectionAttributes, signal);
      }
      html.push("</div>");
    } else if (item instanceof HmiLayoutContainerBase || item instanceof HmiContainerBase) {
      await this.appendContainerAsync(html, item, item.items, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiScreenWindow) {
      await this.appendScreenWindowAsync(html, item, project, context, screenStack, key, includeInspectionAttributes, signal);
    } else if (item instanceof HmiDataGridControl) {
      appendDataGridControl(html, item, context);
    } else if (item instanceof HmiOverviewParameterControl) {
      appendOverviewParameterControl(html, item, context);
    } else if (item instanceof HmiDetailedParameterControl) {
      appendDetailedParameterControl(html, item, context);
    } else if (item instanceof HmiStatusForceControl) {
      appendStatusForceControl(html, item, context);
    } else if (item instanceof HmiRecipeControl) {
      appendRecipeControl(html, item, context);
    } else if (item instanceof HmiAuditTrailControl) {
      appendAuditTrailControl(html, item, context);
    } else if (item instanceof HmiRadarChartControl) {
      appendRadarChartControl(html, item, context);
    } else if (item instanceof HmiProcessDiagnosisOverviewControl) {
      appendProcessDiagnosisControl(html, item, "Overview", "Process diagnosis overview", context);
    } else if (item instanceof HmiProcessDiagnosisPlcCodeViewerControl) {
      appendProcessDiagnosisControl(html, item, "PlcCodeViewer", "PLC code viewer", context);
    } else if (item instanceof HmiProcessDiagnosisCriteriaAnalysisControl) {
      appendProcessDiagnosisControl(html, item, "CriteriaAnalysis", "Criteria analysis", context);
    } else if (item instanceof HmiProcessDiagnosisGraphOverviewControl) {
      appendGraphOverviewControl(html, item, context);
    } else if (item instanceof HmiSystemDiagnosisControl) {
      appendSystemDiagnosisControl(html, item, context);
    } else if (item instanceof HmiMediaControl) {
      appendMediaControl(html, item, context);
    } else if (item instanceof HmiNcPartProgramControl) {
      appendNcPartProgramControl(html, item, context);
    } else if (item instanceof HmiNcKeyboardControl) {
      appendNcKeyboardControl(html, item, context);
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
  const inside = appendInsideStrokeClip(html, circle,
    `<circle cx="${toCss(getStaticValueOrDefault(circle.centerX, width / 2))}" cy="${toCss(getStaticValueOrDefault(circle.centerY, height / 2))}" r="${toCss(getStaticValueOrDefault(circle.radius, Math.min(width, height) / 2))}"></circle>`, context);
  html.push("<circle");
  appendSvgAttribute(html, "cx", getStaticValueOrDefault(circle.centerX, width / 2));
  appendSvgAttribute(html, "cy", getStaticValueOrDefault(circle.centerY, height / 2));
  appendSvgAttribute(html, "r", getStaticValueOrDefault(circle.radius, Math.min(width, height) / 2));
  appendStrokeAttributes(html, circle, getFillColor(circle, context), context, inside);
  html.push("></circle>");
  appendSvgFillDefinition(html, circle, getFillColor(circle, context), context);
  appendSvgMarkerDefinitions(html, circle, context);
  html.push("</svg>");
}

function appendEllipse(html: string[], ellipse: HmiEllipse, context: HmiHtmlConvertContext): void {
  const width = getSvgWidth(ellipse);
  const height = getSvgHeight(ellipse);
  appendSvgOpen(html, ellipse, width, height, context);
  const inside = appendInsideStrokeClip(html, ellipse,
    `<ellipse cx="${toCss(getStaticValueOrDefault(ellipse.centerX, width / 2))}" cy="${toCss(getStaticValueOrDefault(ellipse.centerY, height / 2))}" rx="${toCss(getStaticValueOrDefault(ellipse.radiusX, width / 2))}" ry="${toCss(getStaticValueOrDefault(ellipse.radiusY, height / 2))}"></ellipse>`, context);
  html.push("<ellipse");
  appendSvgAttribute(html, "cx", getStaticValueOrDefault(ellipse.centerX, width / 2));
  appendSvgAttribute(html, "cy", getStaticValueOrDefault(ellipse.centerY, height / 2));
  appendSvgAttribute(html, "rx", getStaticValueOrDefault(ellipse.radiusX, width / 2));
  appendSvgAttribute(html, "ry", getStaticValueOrDefault(ellipse.radiusY, height / 2));
  appendStrokeAttributes(html, ellipse, getFillColor(ellipse, context), context, inside);
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
  const path = createArcPath(centerX, centerY, radiusX, radiusY, startAngle, sweepAngle, segment);
  const inside = appendInsideStrokeClip(html, item, segment
    ? `<path d="${path}"></path>`
    : `<ellipse cx="${toCss(centerX)}" cy="${toCss(centerY)}" rx="${toCss(radiusX)}" ry="${toCss(radiusY)}"></ellipse>`, context);
  html.push("<path");
  appendAttribute(html, "d", path);
  appendStrokeAttributes(html, item, segment ? getFillColor(item, context) : undefined, context, inside);
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
  if (Math.abs(sweepAngle) === 360) {
    const first = getEllipsePoint(centerX, centerY, radiusX, radiusY, startAngle);
    const opposite = getEllipsePoint(centerX, centerY, radiusX, radiusY, startAngle + sweepAngle / 2);
    const direction = sweepAngle > 0 ? 1 : 0;
    return `M ${toCss(first.x)} ${toCss(first.y)} A ${toCss(radiusX)} ${toCss(radiusY)} 0 0 ${direction} ${toCss(opposite.x)} ${toCss(opposite.y)} A ${toCss(radiusX)} ${toCss(radiusY)} 0 0 ${direction} ${toCss(first.x)} ${toCss(first.y)} Z`;
  }
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
  appendAttribute(html, "overflow", "visible");
  html.push(">");
}

function appendInsideStrokeClip(html: string[], item: HmiShapeBase, geometry: string, context: HmiHtmlConvertContext): boolean {
  if (!(item instanceof HmiCentricShapeBase) || !getStaticValueOrDefault(item.drawStrokeInsideFrame, false) || getStrokeWidth(item, context) <= 1)
    return false;
  html.push("<defs><clipPath");
  appendAttribute(html, "id", getFillGradientId(item) + "-inside-stroke");
  appendAttribute(html, "clipPathUnits", "userSpaceOnUse");
  html.push(">", geometry, "</clipPath></defs>");
  return true;
}

function appendStrokeAttributes(html: string[], item: HmiShapeBase, fillColor: HmiColor | undefined, context: HmiHtmlConvertContext, inside = false): void {
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
  appendSvgAttribute(html, "stroke-width", getStrokeWidth(item, context) * (inside ? 2 : 1));
  if (inside) appendAttribute(html, "clip-path", `url(#${getFillGradientId(item)}-inside-stroke)`);
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
  const size = pattern === HmiFillPattern.DottedEvenOddFiner || pattern === HmiFillPattern.DiagonalCrossFiner || pattern === HmiFillPattern.CheckersFiner || pattern === HmiFillPattern.SmallBoxes
    ? 4
    : pattern === HmiFillPattern.LargeBoxes || pattern === HmiFillPattern.Ovals || pattern === HmiFillPattern.Scales || pattern === HmiFillPattern.Waves
      ? 12
      : 8;
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
    case HmiFillPattern.WideHorizontal:
      appendPatternPath(html, `M0 1H${size} M0 ${size / 2 + 1}H${size}`, color, pattern === HmiFillPattern.HorizontalDifferentLines || pattern === HmiFillPattern.WideHorizontal ? 2 : 1);
      break;
    case HmiFillPattern.Vertical:
    case HmiFillPattern.WideVertical:
      appendPatternPath(html, `M1 0V${size} M${size / 2 + 1} 0V${size}`, color, pattern === HmiFillPattern.WideVertical ? 2 : 1);
      break;
    case HmiFillPattern.SmallBoxes:
    case HmiFillPattern.MediumBoxes:
    case HmiFillPattern.LargeBoxes:
      appendPatternPath(html, `M0 0H${size}V${size}H0Z`, color, 1);
      break;
    case HmiFillPattern.DottedHorizontal:
    case HmiFillPattern.DottedEvenOdd:
    case HmiFillPattern.DottedEvenOddFiner:
    case HmiFillPattern.DottedEvenOddFinest:
    case HmiFillPattern.DottedHorizontalInverted:
    case HmiFillPattern.Dots: {
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
    case HmiFillPattern.Ovals:
      html.push("<ellipse");
      appendAttribute(html, "cx", (size / 2).toString());
      appendAttribute(html, "cy", (size / 2).toString());
      appendAttribute(html, "rx", (size / 3).toString());
      appendAttribute(html, "ry", (size / 4).toString());
      appendAttribute(html, "fill", "none");
      appendAttribute(html, "stroke", color);
      html.push("></ellipse>");
      break;
    case HmiFillPattern.Diamonds:
      appendPatternPath(html, `M${size / 2} 0L${size} ${size / 2}L${size / 2} ${size}L0 ${size / 2}Z`, color, 1);
      break;
    case HmiFillPattern.Scales:
      appendPatternPath(html, `M0 ${size / 2}Q${size / 4} 0 ${size / 2} ${size / 2}T${size} ${size / 2} M-${size / 2} ${size}Q-${size / 4} ${size / 2} 0 ${size}T${size / 2} ${size}`, color, 1);
      break;
    case HmiFillPattern.Waves:
      appendPatternPath(html, `M0 ${size / 2}Q${size / 4} 0 ${size / 2} ${size / 2}T${size} ${size / 2}`, color, 1);
      break;
    case HmiFillPattern.Bricks:
    case HmiFillPattern.BricksDiagonal:
      appendPatternPath(html, `M0 0H${size} M0 ${size / 2}H${size} M${size / 2} 0V${size / 2} M0 ${size / 2}V${size}`, color, 1);
      break;
    default: {
      const leftToRight = pattern === HmiFillPattern.DiagonalLeftToRight || pattern === HmiFillPattern.Diagonal || pattern === HmiFillPattern.DiagonalCross || pattern === HmiFillPattern.DiagonalCrossFiner || pattern === HmiFillPattern.DiagonalCrossBold || pattern === HmiFillPattern.WideDiagonalLeftToRight;
      const rightToLeft = pattern === HmiFillPattern.DiagonalRightToLeft || pattern === HmiFillPattern.DiagonalCross || pattern === HmiFillPattern.DiagonalCrossFiner || pattern === HmiFillPattern.DiagonalCrossBold || pattern === HmiFillPattern.WideDiagonalRightToLeft;
      const width = pattern === HmiFillPattern.DiagonalCrossBold || pattern === HmiFillPattern.WideDiagonalLeftToRight || pattern === HmiFillPattern.WideDiagonalRightToLeft ? 2 : 1;
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
  const mode = getStaticValue(button.mode);
  const down = isButtonDownVisual(button);
  const caption = state?.text ?? (down ? getStaticValue(button.alternateText) : undefined)
    ?? getStaticValue(button.text);
  html.push("<button");
  appendCommonAttributes(html, button, context, true, createButtonStyle(button, state));
  appendAttribute(html, "aria-label", caption?.getDisplayText(context.options.cultureLcid));
  if (getStaticValue(button.toggle) === true)
    appendAttribute(html, "aria-pressed", getStaticValue(button.pressed) === true ? "true" : "false");
  const enabled = button.enabled === undefined || getStaticValue(button.enabled) === true;
  if (!enabled) {
    appendAttribute(html, "disabled", "disabled");
  }
  const alternateImage = down ? getStaticValue(button.alternateImage) : undefined;
  let image = state?.image ?? alternateImage
    ?? getStaticValue(button.image);
  let imageKey = state?.image !== undefined
    ? (state.imageBackgroundTransparent ?? getStaticValue(button.imageBackgroundTransparent)) === true
      ? state.imageBackgroundColor ?? getStaticValue(button.imageBackgroundColor) : undefined
    : alternateImage !== undefined
      ? getImageColorKey(button.alternateImageBackgroundTransparent, button.alternateImageBackgroundColor)
      : getImageColorKey(button.imageBackgroundTransparent, button.imageBackgroundColor);
  const disabledImageMode = getStaticValue(button.disabledImageMode);
  const showDisabledAppearance = !enabled && getStaticValue(button.showDisabledState) === true;
  if (
    showDisabledAppearance &&
    (disabledImageMode === HmiDisabledImageMode.Reference ||
      disabledImageMode === HmiDisabledImageMode.Imported)
  ) {
    const disabledImage = getStaticValue(button.disabledImage);
    image = disabledImage ??
      (getStaticValue(button.disabledImageFallbackToNormal) !== false ? image : undefined);
    if (disabledImage !== undefined)
      imageKey = getImageColorKey(button.disabledImageBackgroundTransparent, button.disabledImageBackgroundColor);
  }
  const imageUri = mode === HmiButtonType.Text ? undefined : await resolveImageUri(image, project, signal);
  const hasImage = imageUri !== undefined && imageUri.trim() !== "";
  const imageFallback = mode === HmiButtonType.GraphicOrText && hasImage;
  const overlay = hasImage && getStaticValue(button.overlayContent) === true;
  if (imageFallback) html.push(" data-hmi-button-image-fallback");
  html.push(">");
  if (hasImage) {
    if (overlay)
      html.push('<span data-hmi-button-content data-hmi-button-overlay style="display: grid;grid-template-columns: minmax(0, 1fr);grid-template-rows: minmax(0, 1fr);width: 100%;height: 100%;min-width: 0;min-height: 0;overflow: hidden;">',
        '<span data-hmi-button-graphic style="grid-area: 1 / 1;min-width: 0;min-height: 0;width: 100%;height: 100%;">');
    else
      html.push('<span data-hmi-button-content style="display: flex;flex-direction: column;width: 100%;height: 100%;min-width: 0;min-height: 0;align-items: center;justify-content: center;overflow: hidden;">',
        '<span data-hmi-button-graphic style="flex: 1 1 0;min-width: 0;min-height: 0;width: 100%;">');
    appendButtonImage(
      html,
      button,
      imageUri,
      showDisabledAppearance && disabledImageMode === HmiDisabledImageMode.Grayscale,
      imageKey,
    );
    html.push("</span>");
  }
  if (mode !== HmiButtonType.Graphic)
    appendButtonCaption(html, button, state, caption, hasImage, imageFallback, overlay, context);
  if (hasImage) html.push("</span>");
  html.push("</button>");
}

function isButtonDownVisual(button: HmiButton): boolean {
  return getStaticValue(button.pressed) === true && getStaticValue(button.downStateSameAsUp) !== true;
}

function getButtonPressedContentOffset(button: HmiButton): number {
  const offset = getStaticValue(button.pressedContentOffset) ?? 0;
  return isButtonDownVisual(button) && Number.isFinite(offset) && offset > 0 ? offset : 0;
}

function appendButtonCaption(html: string[], button: HmiButton, state: HmiState | undefined,
  caption: HmiMultilingualText | undefined, boundedLayout: boolean, hidden: boolean, overlay: boolean, context: HmiHtmlConvertContext): void {
  const captionBlink = getButtonCaptionBlink(button, state);
  const captionColor = state?.captionColor ?? state?.foregroundColor ?? getStaticValue(button.captionColor);
  const wrapped = boundedLayout || captionBlink !== undefined || captionColor !== undefined;
  if (wrapped) {
    html.push("<span data-hmi-button-caption");
    if (hidden) html.push(" hidden");
    html.push(' style="');
    if (overlay) html.push("grid-area: 1 / 1;z-index: 1;min-width: 0;min-height: 0;width: 100%;height: 100%;overflow: hidden;");
    else if (boundedLayout) html.push("flex: 0 0 auto;width: 100%;max-width: 100%;");
    if (captionBlink !== undefined) html.push("animation: hmi-caption-color-flash " + getBlinkDuration(captionBlink.rate) + "s steps(1, end) infinite;");
    else if (captionColor !== undefined) html.push("color: " + colorToCss(captionColor) + ";");
    html.push('\">');
  }
  if (overlay) {
    const x = getStaticValue(button.horizontalAlignment) ?? HmiHorizontalAlignment.Center;
    const y = getStaticValue(button.verticalAlignment) ?? HmiVerticalAlignment.Center;
    html.push('<span data-hmi-button-caption-layout');
    const imageHorizontal = getStaticValue(button.imageHorizontalAlignment);
    if (getStaticValue(button.avoidImageCaptionOverlap) === true && x === imageHorizontal &&
        (x === HmiHorizontalAlignment.Left || x === HmiHorizontalAlignment.Right))
      appendAttribute(html, 'data-hmi-button-caption-avoid-image', x === HmiHorizontalAlignment.Left ? 'start' : 'end');
    html.push(' style="display: flex;box-sizing: border-box;width: 100%;height: 100%;min-width: 0;min-height: 0;justify-content: ' + horizontalAlignmentToFlexCss(x) + ';align-items: ' + verticalAlignmentToCss(y) + ';">');
  }
  const offset = getButtonPressedContentOffset(button);
  if (offset > 0) html.push('<span data-hmi-button-pressed-caption style="display: inline-block;transform: translate(' + toCss(offset) + 'px, ' + toCss(offset) + 'px);">');
  appendMultilingualText(html, caption, context);
  if (offset > 0) html.push("</span>");
  if (overlay) html.push("</span>");
  if (wrapped) html.push("</span>");
}

function getImageColorKey(enabled: HmiProperty<boolean> | undefined, color: HmiProperty<HmiColor> | undefined): HmiColor | undefined {
  return getStaticValue(enabled) === true ? getStaticValue(color) : undefined;
}

function appendButtonImage(html: string[], button: HmiButton, imageUri: string, grayscale: boolean, imageKey: HmiColor | undefined): void {
  const aligned = button.imageHorizontalAlignment !== undefined || button.imageVerticalAlignment !== undefined;
  if (aligned) {
    const horizontal = getStaticValue(button.imageHorizontalAlignment);
    const vertical = getStaticValue(button.imageVerticalAlignment);
    const x = horizontal === HmiHorizontalAlignment.Left ? "start" : horizontal === HmiHorizontalAlignment.Center ? "center" : horizontal === HmiHorizontalAlignment.Right ? "end" : "stretch";
    const y = vertical === HmiVerticalAlignment.Top ? "start" : vertical === HmiVerticalAlignment.Center ? "center" : vertical === HmiVerticalAlignment.Bottom ? "end" : "stretch";
    html.push("<span data-hmi-button-image-layout");
    appendAttribute(html, "data-image-horizontal", x);
    appendAttribute(html, "data-image-vertical", y);
    html.push(' style="display: grid;grid-template-columns: minmax(0, 1fr);grid-template-rows: minmax(0, 1fr);width: 100%;height: 100%;overflow: hidden;justify-items: ' + x + ";align-items: " + y + ';">');
  }
  const horizontal = getStaticValue(button.imageHorizontalAlignment);
  const offset = horizontal !== undefined && horizontal !== HmiHorizontalAlignment.Stretch ? getButtonPressedContentOffset(button) : 0;
  appendInnerImage(html, imageUri, grayscale, offset, imageKey);
  if (aligned) html.push("</span>");
}

function getButtonCaptionBlink(button: HmiButton, state: HmiState | undefined): HmiBlinkProperty<HmiColor> | undefined {
  if ((state?.captionColor ?? state?.foregroundColor) !== undefined ||
      button.captionColor?.kind !== HmiPropertyKind.Blink) return undefined;
  const blink = button.captionColor as HmiBlinkProperty<HmiColor>;
  return blink.staticValue !== undefined && blink.blinkValue !== undefined ? blink : undefined;
}

function createButtonStyle(button: HmiButton, state: HmiState | undefined): string | null {
  const captionColor = getStaticValue(button.captionColor);
  const stateHasCaptionColor = (state?.captionColor ?? state?.foregroundColor) !== undefined;
  const captionBlink = getButtonCaptionBlink(button, state);
  let style = "";
  if (!stateHasCaptionColor && captionColor !== undefined && captionBlink?.blinkValue !== undefined) {
    style += `--hmi-caption-color-off: ${colorToCss(captionColor)};`;
    style += `--hmi-caption-color-on: ${colorToCss(captionBlink.blinkValue)};`;
    style += `color: ${colorToCss(captionColor)};`;
  } else if (!stateHasCaptionColor && captionColor !== undefined) {
    style = `color: ${colorToCss(captionColor)};`;
  }
  switch (getStaticValue(button.shape)) {
    case HmiButtonShape.Rectangle:
      style += "border-radius: 0px;";
      break;
    case HmiButtonShape.Ellipse:
      style += "border-radius: 50%;overflow: hidden;";
      break;
  }
  style += createStateStyle(state) ?? "";
  const borderWidth = getStaticValue(button.threeDBorderWidth) ?? 0;
  if (borderWidth <= 0)
    return style || null;

  let topColor = getStaticValue(button.threeDBorderTopColor);
  let bottomColor = getStaticValue(button.threeDBorderBottomColor);
  topColor ??= bottomColor;
  bottomColor ??= topColor;
  if (isButtonDownVisual(button)) [topColor, bottomColor] = [bottomColor, topColor];
  const top = topColor === undefined ? "currentColor" : colorToCss(topColor);
  const bottom = bottomColor === undefined ? "currentColor" : colorToCss(bottomColor);
  const width = toCss(borderWidth);
  // The bevel is an inner paint layer, not a replacement for the normal frame.
  style += `box-shadow: inset ${width}px 0 0 ${top}, inset 0 ${width}px 0 ${top}, ` +
    `inset -${width}px 0 0 ${bottom}, inset 0 -${width}px 0 ${bottom};`;
  const padding = hasThicknessEdges(button.padding) ? button.padding : undefined;
  style += `padding: ${toCss(borderWidth + (padding ? getStaticValueOrDefault(padding.top, 0) : 2))}px ` +
    `${toCss(borderWidth + (padding ? getStaticValueOrDefault(padding.right, 0) : 6))}px ` +
    `${toCss(borderWidth + (padding ? getStaticValueOrDefault(padding.bottom, 0) : 2))}px ` +
    `${toCss(borderWidth + (padding ? getStaticValueOrDefault(padding.left, 0) : 6))}px;`;
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
  appendCommonAttributes(html, ioField, context, undefined, createFontWritingModeStyle(ioField.font));
  if (getStaticValue(ioField.enabled) === false) appendAttribute(html, "disabled", "disabled");
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
  const showThresholds = getStaticValue(bar.showLimitRanges) !== false && bar.thresholds.some(threshold =>
    threshold.value !== undefined && getStaticValue(threshold.enabled) !== false);
  if (showScale || showThresholds || getBarOutOfRange(bar) !== 0 || getBarFillOrigin(bar, minimum, maximum, value, context) !== undefined) {
    const vertical = direction === HmiFillDirection.Up || direction === HmiFillDirection.Down;
    const scaleBefore = showScale && getStaticValue(bar.scaleAfterBar) === false;
    html.push("<div");
    appendCommonAttributes(html, bar, context, true, showScale
      ? vertical
        ? "display: flex; flex-direction: row; align-items: stretch; gap: 4px;"
        : "display: flex; flex-direction: column; align-items: stretch; gap: 2px;"
      : "display: flex; align-items: stretch;");
    appendAttribute(html, "data-hmi-bar", "true");
    appendAttribute(html, "data-fill-direction", HmiFillDirection[direction]);
    if (showScale)
      appendAttribute(html, "data-scale-side", vertical ? scaleBefore ? "Left" : "Right" : scaleBefore ? "Top" : "Bottom");
    html.push(">");
    if (scaleBefore)
      appendBarScale(html, bar, minimum, maximum, direction, vertical);
    appendBarMeterRegion(html, bar, minimum, maximum, value, direction, vertical, context);
    if (showScale && !scaleBefore)
      appendBarScale(html, bar, minimum, maximum, direction, vertical);
    html.push("</div>");
    return;
  }
  html.push("<meter");
  appendCommonAttributes(html, bar, context, true, getBarDirectionStyle(direction) + getBarFillOverrideStyle(bar, context));
  appendBarColorAttributes(html, bar, context);
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
  context: HmiHtmlConvertContext,
): void {
  html.push("<div");
  appendAttribute(html, "data-hmi-bar-meter", "true");
  appendAttribute(html, "style", "position: relative; display: flex; flex: 1; min-width: 0; min-height: 0;");
  html.push(">");
  appendBarMeter(html, bar, minimum, maximum, value, direction, vertical, context);
  appendBarThresholds(html, bar, minimum, maximum, direction);
  appendBarOutOfRangeArrow(html, bar, direction);
  html.push("</div>");
}

function appendBarMeter(
  html: string[],
  bar: HmiBar,
  minimum: number,
  maximum: number,
  value: number,
  direction: HmiFillDirection,
  vertical: boolean,
  context: HmiHtmlConvertContext,
): void {
  const origin = getBarFillOrigin(bar, minimum, maximum, value, context);
  if (origin !== undefined) {
    appendBarOriginMeter(html, bar, minimum, maximum, value, origin, direction, context);
    return;
  }
  html.push("<meter");
  appendBarColorAttributes(html, bar, context);
  let meterStyle = `${vertical ? "height: 100%;" : "width: 100%;"} flex: 1; min-width: 0; min-height: 0;${getBarDirectionStyle(direction)}`;
  const disabledColor = getStaticValue(bar.enabled) === false && getStaticValue(bar.useDisabledForegroundColor) === true
    ? context.effectiveProperties.resolve(bar, "DisabledForegroundColor", bar.disabledForegroundColor)
    : undefined;
  const fillColor = disabledColor === undefined ? getStaticValue(getBarThresholdFillColor(bar) ??
    (getStaticValue(bar.useThresholdFillColors) === true
      ? context.effectiveProperties.resolve(bar, "ForegroundColor", bar.foregroundColor) : undefined)) : undefined;
  if (fillColor !== undefined) meterStyle += `color: ${colorToCss(fillColor)};`;
  meterStyle += getBarFillOverrideStyle(bar, context);
  appendAttribute(html, "style",
    meterStyle);
  appendAttribute(html, "min", toCss(minimum));
  appendAttribute(html, "max", toCss(maximum));
  appendAttribute(html, "value", toCss(value));
  html.push(`>${toCss(value)}</meter>`);
}

function getBarFillOrigin(bar: HmiBar, minimum: number, maximum: number, value: number, context: HmiHtmlConvertContext): number | undefined {
  const origin = getStaticValue(bar.originValue);
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) ||
      !Number.isFinite(value) || !Number.isFinite(maximum - minimum) || maximum <= minimum)
    return undefined;
  if (origin === undefined) return usesNonlinearBarMapping(bar, minimum, maximum) || getBarBitmapRows(bar, context) !== undefined || isBarHatch(bar, context) || isBarGradient(bar, context) ? minimum : undefined;
  return Number.isFinite(origin) ? origin : undefined;
}

function appendBarOriginMeter(html: string[], bar: HmiBar, minimum: number, maximum: number,
  value: number, origin: number, direction: HmiFillDirection, context: HmiHtmlConvertContext): void {
  const originPercent = Math.min(100, Math.max(0, getScaleRatio(bar, minimum, maximum, origin) * 100));
  const valuePercent = Math.min(100, Math.max(0, getScaleRatio(bar, minimum, maximum, value) * 100));
  const start = Math.min(originPercent, valuePercent);
  const length = Math.abs(valuePercent - originPercent);
  const position = direction === HmiFillDirection.Up
    ? `left: 0; right: 0; bottom: ${toCss(start)}%; height: ${toCss(length)}%;`
    : direction === HmiFillDirection.Down
      ? `left: 0; right: 0; top: ${toCss(start)}%; height: ${toCss(length)}%;`
      : direction === HmiFillDirection.Left
        ? `top: 0; bottom: 0; right: ${toCss(start)}%; width: ${toCss(length)}%;`
        : `top: 0; bottom: 0; left: ${toCss(start)}%; width: ${toCss(length)}%;`;
  html.push("<div");
  appendAttribute(html, "data-hmi-bar-origin-meter", "true");
  appendAttribute(html, "style", "position: relative; flex: 1; min-width: 0; min-height: 0; overflow: hidden; background: var(--hmi-bar-track-background, #eeeeee);");
  html.push("><meter");
  appendAttribute(html, "style", "position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0;");
  appendAttribute(html, "min", toCss(minimum));
  appendAttribute(html, "max", toCss(maximum));
  appendAttribute(html, "value", toCss(value));
  html.push(`>${toCss(value)}</meter><span`);
  appendAttribute(html, "aria-hidden", "true");
  appendAttribute(html, "data-hmi-bar-origin-fill", "true");
  appendAttribute(html, "data-origin-value", toCss(origin));
  const style = ["position: absolute; pointer-events: none; background: currentColor; " + position];
  const disabledColor = getStaticValue(bar.enabled) === false && getStaticValue(bar.useDisabledForegroundColor) === true
    ? context.effectiveProperties.resolve(bar, "DisabledForegroundColor", bar.disabledForegroundColor) : undefined;
  const thresholdColor = getBarThresholdFillColor(bar);
  if (disabledColor !== undefined) appendColorStyle(style, "color", disabledColor);
  else if (thresholdColor !== undefined) appendColorStyle(style, "color", thresholdColor);
  style.push(getBarFillOverrideStyle(bar, context));
  style.push(getBarGradientStyle(bar, context));
  appendBarNativeGradientAttributes(html, bar, context);
  const bitmapRows = getBarBitmapRows(bar, context);
  if (bitmapRows !== undefined || isBarHatch(bar, context)) {
    appendAttribute(html, "data-hmi-bar-bitmap", bitmapRows);
    if (isBarHatch(bar, context)) appendAttribute(html, "data-hmi-bar-hatch-style", toCss(getStaticValue(context.effectiveProperties.resolve(bar, "HatchStyle", bar.hatchStyle)) ?? -1));
    const patternColor = getStaticValue(context.effectiveProperties.resolve(bar, "PatternColor", bar.patternColor)) ?? hmiColorFromArgb(255, 0, 0, 0);
    appendAttribute(html, "data-hmi-bar-pattern-color", colorToCss(patternColor));
  }
  appendAttribute(html, "style", style.join(""));
  html.push("></span></div>");
}

function getBarBitmapRows(bar: HmiBar, context: HmiHtmlConvertContext): string | undefined {
  if (getStaticValue(context.effectiveProperties.resolve(bar, "FillStyle", bar.fillStyle)) !== HmiBarFillStyle.BitmapPattern) return undefined;
  const rows = getStaticValue(context.effectiveProperties.resolve(bar, "BitmapPatternRows", bar.bitmapPatternRows));
  return rows !== undefined && /^[0-9a-f]{16}$/i.test(rows) ? rows.toLowerCase() : undefined;
}

function isBarHatch(bar: HmiBar, context: HmiHtmlConvertContext): boolean {
  return getStaticValue(context.effectiveProperties.resolve(bar, "FillStyle", bar.fillStyle)) === HmiBarFillStyle.HatchPattern;
}

function isBarGradient(bar: HmiBar, context: HmiHtmlConvertContext): boolean {
  return getStaticValue(context.effectiveProperties.resolve(bar, "FillStyle", bar.fillStyle)) === HmiBarFillStyle.Gradient;
}

function getBarGradientStyle(bar: HmiBar, context: HmiHtmlConvertContext): string {
  if (hasBarNativeGradient(bar, context)) return "background-color: transparent;";
  const endColor = getStaticValue(context.effectiveProperties.resolve(bar, "FillEndColor", bar.fillEndColor));
  if (!isBarGradient(bar, context) || endColor === undefined) return "";
  const direction = bar.fillGradientDirection ?? (bar.fillGradientAxis?.toLowerCase() === "vertical"
    ? HmiGradientDirection.VerticalFromTop : HmiGradientDirection.HorizontalFromLeft);
  const configuredStop = getStaticValue(context.effectiveProperties.resolve(bar, "FillGradientStop", bar.fillGradientStop)) ?? 100;
  const stop = Number.isFinite(configuredStop) ? Math.min(100, Math.max(0, configuredStop)) : 100;
  // Generic value-rectangle gradient, not WinCC's quantized category-16 GDI+ brush.
  // currentColor retains disabled, threshold and explicit fill priorities.
  const stops = direction === HmiGradientDirection.HorizontalFromCenter || direction === HmiGradientDirection.VerticalFromCenter
    ? `${colorToCss(endColor)} ${toCss(50 - stop / 2)}%, currentColor 50%, ${colorToCss(endColor)} ${toCss(50 + stop / 2)}%`
    : `currentColor 0%, ${colorToCss(endColor)} ${toCss(stop)}%`;
  return `background-color: transparent; background-image: linear-gradient(${gradientDirectionToCss(direction)}, ${stops});`;
}

function hasBarNativeGradient(bar: HmiBar, context: HmiHtmlConvertContext): boolean {
  return isBarGradient(bar, context) && context.effectiveProperties.resolve(bar, "GradientMode", bar.gradientMode) !== undefined;
}

function appendBarNativeGradientAttributes(html: string[], bar: HmiBar, context: HmiHtmlConvertContext): void {
  if (!hasBarNativeGradient(bar, context)) return;
  const mode = getStaticValue(context.effectiveProperties.resolve(bar, "GradientMode", bar.gradientMode)) ?? -1;
  appendAttribute(html, "data-hmi-bar-gradient-mode", toCss(mode));
  if (!Number.isInteger(mode) || mode < 0 || mode > 3) return;
  const disabled = getStaticValue(bar.enabled) !== true && getStaticValue(bar.useDisabledForegroundColor) === true
    ? context.effectiveProperties.resolve(bar, "DisabledForegroundColor", bar.disabledForegroundColor) : undefined;
  const start = getStaticValue(disabled ?? getBarThresholdFillColor(bar) ??
    context.effectiveProperties.resolve(bar, "FillColor", bar.fillColor) ??
    context.effectiveProperties.resolve(bar, "ForegroundColor", bar.foregroundColor)) ?? hmiColorFromArgb(255, 0, 0, 0);
  const end = getStaticValue(context.effectiveProperties.resolve(bar, "FillEndColor", bar.fillEndColor) ??
    context.effectiveProperties.resolve(bar, "PatternColor", bar.patternColor)) ?? hmiColorFromArgb(255, 0, 0, 0);
  const sigma = getStaticValue(context.effectiveProperties.resolve(bar, "GradientSigmaBlend", bar.gradientSigmaBlend)) ?? false;
  appendAttribute(html, "data-hmi-bar-gradient-sigma", sigma ? "true" : "false");
  // Static/tag-fallback palettes. Round each operation as single precision,
  // matching C#; native input channels are premultiplied before palette rounding.
  const f = Math.fround;
  const round = (value: number): number => Math.floor(f(value + 0.5));
  const ramps = [16, 64, 256].map(count => Array.from({length: count + 1}, (_, index) => {
    const factor = sigma ? nativeBarSigmaRampFactors[index * 256 / count]! : f(index / count);
    const inverse = f(1 - factor);
    const mix = (a: number, alpha: number, b: number, beta: number): number =>
      round(f(f(f(a * alpha / 255) * inverse) + f(f(b * beta / 255) * factor)));
    const alpha = round(f(f(start.alpha * inverse) + f(end.alpha * factor)));
    return ((alpha << 24) | (mix(start.red, start.alpha, end.red, end.alpha) << 16) |
      (mix(start.green, start.alpha, end.green, end.alpha) << 8) | mix(start.blue, start.alpha, end.blue, end.alpha)) >>> 0;
  }));
  appendAttribute(html, "data-hmi-bar-gradient-ramps", JSON.stringify(ramps));
}

function appendBarColorAttributes(html: string[], bar: HmiBar, context: HmiHtmlConvertContext): void {
  if (getStaticValue(context.effectiveProperties.resolve(bar, "TrackColor", bar.trackColor)) !== undefined ||
      getStaticValue(context.effectiveProperties.resolve(bar, "BackgroundColor", bar.backgroundColor)) !== undefined ||
      getColorGradient(bar) !== undefined)
    appendAttribute(html, "data-hmi-bar-track", "true");
  if (getStaticValue(context.effectiveProperties.resolve(bar, "FillStyle", bar.fillStyle)) === HmiBarFillStyle.Transparent ||
      context.effectiveProperties.resolve(bar, "FillColor", bar.fillColor) !== undefined ||
      getBarThresholdFillColor(bar) !== undefined ||
      context.effectiveProperties.resolve(bar, "ForegroundColor", bar.foregroundColor) !== undefined ||
      (getStaticValue(bar.enabled) === false && getStaticValue(bar.useDisabledForegroundColor) === true &&
       bar.disabledForegroundColor !== undefined))
    appendAttribute(html, "data-hmi-bar-fill", "true");
}

function getBarFillOverrideStyle(bar: HmiBar, context: HmiHtmlConvertContext): string {
  const hatch = getStaticValue(context.effectiveProperties.resolve(bar, "HatchStyle", bar.hatchStyle)) ?? -1;
  if (getStaticValue(context.effectiveProperties.resolve(bar, "FillStyle", bar.fillStyle)) === HmiBarFillStyle.Transparent ||
      isBarHatch(bar, context) && (!Number.isInteger(hatch) || hatch < 0 || hatch > 52))
    return "color: transparent !important;";
  const explicitColor = context.effectiveProperties.resolve(bar, "FillColor", bar.fillColor);
  if (explicitColor === undefined) return "";
  const disabledColor = getStaticValue(bar.enabled) !== true && getStaticValue(bar.useDisabledForegroundColor) === true
    ? context.effectiveProperties.resolve(bar, "DisabledForegroundColor", bar.disabledForegroundColor) : undefined;
  const color = getStaticValue(disabledColor ?? getBarThresholdFillColor(bar) ?? explicitColor);
  return color === undefined ? "" : `color: ${colorToCss(color)} !important;`;
}

function getBarThresholdFillColor(bar: HmiBar): HmiProperty<HmiColor> | undefined {
  const value = getStaticValue(bar.value);
  if (getStaticValue(bar.useThresholdFillColors) !== true || value === undefined || !Number.isFinite(value))
    return undefined;
  const thresholds = bar.thresholds.filter(threshold =>
    threshold.value !== undefined && threshold.color !== undefined && getStaticValue(threshold.enabled) !== false)
    .sort((left, right) => (getStaticValue(left.value) ?? NaN) - (getStaticValue(right.value) ?? NaN));
  for (const threshold of thresholds) {
    const limit = getStaticValue(threshold.value);
    if (limit !== undefined && Number.isFinite(limit) && value < limit)
      return threshold.color;
  }
  return undefined;
}

function getBarOutOfRange(bar: HmiBar): number {
  const value = getStaticValue(bar.value);
  if (value === undefined || !Number.isFinite(value)) return 0;
  const lower = getStaticValue(bar.underflowLimit);
  const upper = getStaticValue(bar.overflowLimit);
  if (lower !== undefined && Number.isFinite(lower) && value < lower) return -1;
  if (upper !== undefined && Number.isFinite(upper) && value > upper) return 1;
  return 0;
}

function appendBarOutOfRangeArrow(html: string[], bar: HmiBar, direction: HmiFillDirection): void {
  const overflow = getBarOutOfRange(bar);
  if (overflow === 0) return;
  const arrowDirection = overflow > 0 ? direction
    : direction === HmiFillDirection.Up ? HmiFillDirection.Down
    : direction === HmiFillDirection.Down ? HmiFillDirection.Up
    : direction === HmiFillDirection.Left ? HmiFillDirection.Right : HmiFillDirection.Left;
  const [position, points] = arrowDirection === HmiFillDirection.Up
    ? ["top: 0; left: calc(50% - 6px);", "6,0 0,12 12,12"]
    : arrowDirection === HmiFillDirection.Down
    ? ["bottom: 0; left: calc(50% - 6px);", "6,12 0,0 12,0"]
    : arrowDirection === HmiFillDirection.Left
    ? ["left: 0; top: calc(50% - 6px);", "0,6 12,0 12,12"]
    : ["right: 0; top: calc(50% - 6px);", "12,6 0,0 0,12"];
  html.push("<svg");
  appendAttribute(html, "xmlns", "http://www.w3.org/2000/svg");
  appendAttribute(html, "data-hmi-bar-out-of-range", overflow < 0 ? "Below" : "Above");
  appendAttribute(html, "data-raw-value", toCss(getStaticValue(bar.value)!));
  appendAttribute(html, "data-limit-value", toCss(getStaticValue(overflow < 0 ? bar.underflowLimit : bar.overflowLimit)!));
  appendAttribute(html, "role", "img");
  appendAttribute(html, "aria-label", overflow < 0 ? "Below lower limit" : "Above upper limit");
  appendAttribute(html, "viewBox", "0 0 12 12");
  appendAttribute(html, "style", `position: absolute; pointer-events: none; z-index: 2; width: 12px; height: 12px; ${position}`);
  html.push(`><polygon fill="#000000" points="${points}"></polygon></svg>`);
}

function appendBarThresholds(
  html: string[],
  bar: HmiBar,
  minimum: number,
  maximum: number,
  direction: HmiFillDirection,
): void {
  if (getStaticValue(bar.showLimitRanges) === false) return;
  const percentageMode = getStaticValue(bar.thresholdValueMode) === HmiThresholdValueMode.Percentage;
  for (let index = 0; index < bar.thresholds.length; index++) {
    const threshold = bar.thresholds[index]!;
    const thresholdValue = getStaticValue(threshold.value);
    if (thresholdValue === undefined || getStaticValue(threshold.enabled) === false)
      continue;
    let percentage = percentageMode
      ? thresholdValue
      : getScaleRatio(bar, minimum, maximum, thresholdValue) * 100;
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
  appendScaleMarks(html, bar, minimum, maximum, direction, vertical, getStaticValue(bar.scaleAfterBar) !== false, false);
}

function appendScaleMarks(
  html: string[],
  bar: HmiScaleWidgetBase,
  minimum: number,
  maximum: number,
  direction: HmiFillDirection,
  vertical: boolean,
  afterBar: boolean,
  standalone: boolean,
): void {
  const sections = getStaticValue(bar.divisionCount) ?? 0;
  let tickCount = sections > 0 ? Math.min(100, sections) + 1 : 2;
  const interval = getStaticValue(bar.majorTickInterval) ?? 0;
  const scaleMode = getStaticValue(bar.scaleMode) ?? 0;
  const explicitInterval = scaleMode === 0 && Number.isFinite(interval) && interval > 0 && maximum > minimum
    && (maximum - minimum) / interval <= 10000;
  const positionedTicks = explicitInterval || getBarOriginPosition(bar, minimum, maximum) !== undefined || usesNonlinearBarMapping(bar, minimum, maximum);
  if (explicitInterval)
    tickCount = Math.floor((maximum - minimum) / interval + 1e-10) + 1;
  const ratios = Array.from({ length: tickCount }, (_, index) => explicitInterval
    ? Math.min(1, index * interval / (maximum - minimum))
    : index / (tickCount - 1));
  if (direction === HmiFillDirection.Up || direction === HmiFillDirection.Left)
    ratios.reverse();
  const configuredDecimalPlaces = getStaticValue(bar.tickLabelDecimalPlaces);
  const decimalPlaces = configuredDecimalPlaces === undefined
    ? undefined
    : Math.max(0, Math.min(20, configuredDecimalPlaces));
  const engineeringUnit = getStaticValue(bar.engineeringUnit);
  const reverse = direction === HmiFillDirection.Up || direction === HmiFillDirection.Left;
  const labelInterval = Math.max(1, getStaticValue(bar.tickLabelInterval) ?? 1);
  const showLabels = getStaticValue(bar.showTickLabels) !== false;
  const exponentialFormat = getStaticValue(bar.tickLabelExponentialFormat) === true;
  let style = vertical
    ? "display: flex; flex-direction: column; justify-content: space-between; height: 100%;"
    : "display: flex; justify-content: space-between; width: 100%;";
  const labelColor = getStaticValue(bar.labelColor ?? bar.scaleForegroundColor);
  if (labelColor !== undefined)
    style += ` color: ${colorToCss(labelColor)};`;
  const scaleBackgroundColor = getStaticValue(bar.scaleBackgroundColor);
  if (scaleBackgroundColor !== undefined)
    style += ` background-color: ${colorToCss(scaleBackgroundColor)};`;
  style += getBarScaleFontStyle(bar);

  const tickLength = Math.max(0, getStaticValue(bar.majorTickLength) ?? 6);
  const tickWidth = getStaticValue(bar.majorTicksBold) === true ? 2 : 1;
  const edge = vertical ? (afterBar ? "left" : "right") : (afterBar ? "top" : "bottom");
  style += ` position: relative; box-sizing: border-box; padding-${edge}: ${tickLength + 2}px;`;
  if (!vertical)
    style += ` min-height: ${tickLength + 2}px;`;
  if (positionedTicks)
    style += vertical ? ` min-width: calc(${tickLength + 2}px + 12ch);`
      : ` min-height: calc(${tickLength + 2}px + 1.2em);`;

  html.push("<div");
  appendAttribute(html, standalone ? "data-hmi-scale-labels" : "data-hmi-bar-scale", "true");
  appendAttribute(html, "style", style);
  html.push(">");
  for (let index = 0; index < tickCount; index++) {
    const ratio = ratios[index]!;
    const tick = minimum + ((maximum - minimum) * ratio);
    const label = exponentialFormat
      ? formatScaleLabel(tick, decimalPlaces ?? 2, true)
      : decimalPlaces === undefined ? toCss(tick) : formatScaleLabel(tick, decimalPlaces, false);
    html.push("<span");
    if (positionedTicks) {
      const scaleRatio = getScaleTickRatio(bar, minimum, maximum, ratio);
      const position = reverse ? 1 - scaleRatio : scaleRatio;
      const translation = position === 0 ? 0 : position === 1 ? -100 : -50;
      appendAttribute(html, "style", vertical
        ? `position: absolute; top: ${toCss(position * 100)}%; ${edge}: ${tickLength + 2}px; transform: translateY(${translation}%); white-space: nowrap;`
        : `position: absolute; left: ${toCss(position * 100)}%; ${edge}: ${tickLength + 2}px; transform: translateX(${translation}%); white-space: nowrap;`);
    }
    html.push(">");
    const tickIndex = reverse ? tickCount - 1 - index : index;
    if (showLabels && tickIndex % labelInterval === 0) {
      html.push(label);
      if (engineeringUnit?.trim())
        html.push("&nbsp;", escapeHtml(engineeringUnit));
    }
    html.push("</span>");
  }
  html.push('<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"');
  appendAttribute(html, standalone ? "data-hmi-scale-ticks" : "data-hmi-bar-ticks", "true");
  appendAttribute(html, "style", `position: absolute; pointer-events: none; overflow: visible; ${edge}: 0; ` +
    (vertical ? `top: 0; width: ${tickLength}px; height: 100%;` : `left: 0; width: 100%; height: ${tickLength}px;`));
  const tickColor = getStaticValue(bar.tickColor ?? bar.scaleForegroundColor);
  appendAttribute(html, "stroke", tickColor === undefined ? "currentColor" : colorToCss(tickColor));
  appendAttribute(html, "stroke-width", tickWidth.toString());
  html.push(">");
  for (let index = 0; index < tickCount; index++) {
    const scaleRatio = getScaleTickRatio(bar, minimum, maximum, ratios[index]!);
    const percentage = toCss(100 * (reverse ? 1 - scaleRatio : scaleRatio));
    html.push(vertical
      ? `<line x1="0" x2="${tickLength}" y1="${percentage}%" y2="${percentage}%"></line>`
      : `<line y1="0" y2="${tickLength}" x1="${percentage}%" x2="${percentage}%"></line>`);
  }
  const subdivisions = Math.max(0, Math.min(100, getStaticValue(bar.subDivisionCount) ?? 0));
  const majorOnly = getStaticValue(bar.majorTicksOnly) === true;
  if (!majorOnly && subdivisions > 1) {
    const shortStart = toCss(afterBar ? 0 : tickLength / 2);
    const shortEnd = toCss(afterBar ? tickLength / 2 : tickLength);
    for (let index = 0; index < tickCount - 1; index++) {
      for (let subdivision = 1; subdivision < subdivisions; subdivision++) {
        const ratio = ratios[index]! + (ratios[index + 1]! - ratios[index]!) * subdivision / subdivisions;
        const scaleRatio = getScaleTickRatio(bar, minimum, maximum, ratio);
        const percentage = toCss(100 * (reverse ? 1 - scaleRatio : scaleRatio));
        html.push(vertical
          ? `<line data-hmi-minor-tick="true" stroke-width="1" x1="${shortStart}" x2="${shortEnd}" y1="${percentage}%" y2="${percentage}%"></line>`
          : `<line data-hmi-minor-tick="true" stroke-width="1" y1="${shortStart}" y2="${shortEnd}" x1="${percentage}%" x2="${percentage}%"></line>`);
      }
    }
  }
  html.push("</svg>");
  html.push("</div>");
}

function getBarScaleFontStyle(bar: HmiScaleWidgetBase): string {
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
  const weight = getStaticValue(font.weight);
  if (weight !== undefined && weight > 0)
    style += ` font-weight: ${weight};`;
  else if (getStaticValue(font.bold) === true)
    style += " font-weight: bold;";
  if (getStaticValue(font.italic) === true)
    style += " font-style: italic;";
  const decorations = [];
  if (getStaticValue(font.underline) === true) decorations.push("underline");
  if (getStaticValue(font.strikethrough) === true) decorations.push("line-through");
  if (decorations.length > 0) style += ` text-decoration: ${decorations.join(" ")};`;
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
  const thumbForeground = getStaticValue(slider.thumbForegroundColor);
  const sliderStyle = getBarDirectionStyle(direction) +
    (thumbColor === undefined ? "" : `--hmi-slider-thumb-background: ${colorToCss(thumbColor)};`) +
    (thumbForeground === undefined ? "" : `--hmi-slider-thumb-foreground: ${colorToCss(thumbForeground)};`) +
    getSliderTrackStyle(slider, direction);
  html.push("<input");
  appendCommonAttributes(html, slider, context, true, sliderStyle);
  appendAttribute(html, "data-hmi-slider", "true");
  if (slider.thumbBackgroundColor !== undefined || slider.thumbForegroundColor !== undefined)
    appendAttribute(html, "data-hmi-slider-custom-thumb", "true");
  appendAttribute(html, "data-orientation", HmiFillDirection[direction]);
  const stepSize = getStaticValue(slider.stepSize);
  if (stepSize !== undefined)
    appendAttribute(html, "data-small-change", stepSize.toString());
  appendAttribute(html, "type", "range");
  appendAttribute(html, "min", toCss(minimum));
  appendAttribute(html, "max", toCss(maximum));
  appendAttribute(html, "value", toCss(value));
  // This is an inert process-value preview, not an operator setpoint editor.
  // A native range step would quantize values that are not multiples of SmallChange.
  appendAttribute(html, "step", "any");
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
  const tickDirection = getStaticValue(scale.tickDirection) ?? HmiTickDirection.Down;
  const vertical = tickDirection === HmiTickDirection.Left || tickDirection === HmiTickDirection.Right;
  html.push("<div");
  appendCommonAttributes(
    html,
    scale,
    context,
    true,
    "display: flex; align-items: stretch; overflow: hidden;",
  );
  appendAttribute(html, "data-hmi-scale", "true");
  appendAttribute(html, "data-tick-direction", tickDirection);
  html.push(">");
  if (getStaticValue(scale.showScale) !== false)
    appendScaleMarks(html, scale, minimum, maximum, vertical ? HmiFillDirection.Up : HmiFillDirection.Right,
      vertical, tickDirection === HmiTickDirection.Down || tickDirection === HmiTickDirection.Right, true);
  html.push("</div>");
}

function appendDateTimeField(html: string[], field: HmiDateTimeField, context: HmiHtmlConvertContext): void {
  const value = getStaticValue(field.text);
  html.push("<div");
  appendCommonAttributes(html, field, context, true, "display: flex; overflow: hidden;");
  appendAttribute(html, "data-show-date", resolvePropertyPreview(field.showDate));
  appendAttribute(html, "data-show-time", resolvePropertyPreview(field.showTime));
  appendAttribute(html, "data-output-format", resolvePropertyPreview(field.outputFormat));
  appendAttribute(html, "data-format-pattern", resolvePropertyPreview(field.formatPattern));
  appendAttribute(html, "data-date-time-value-state", value === undefined ? "missing" : "present");
  const hidden = getStaticValue(field.showDate) === false && getStaticValue(field.showTime) === false;
  html.push(">", hidden ? "" : escapeHtml(value?.getText(context.options.cultureLcid) ?? "Date/time value not loaded"), "</div>");
}

function appendClock(html: string[], clock: HmiClock, context: HmiHtmlConvertContext): void {
  if (getStaticValue(clock.analog) === true) {
    appendAnalogClockPreview(html, clock, context);
    return;
  }
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
    "display: flex; align-items: center; justify-content: center; overflow: hidden;" + clockBackgroundOverride(clock),
  );
  appendAttribute(html, "datetime", "2000-01-01T12:34:56");
  appendAttribute(html, "data-format", getStaticValue(clock.format));
  appendAttribute(html, "data-time-zone", getStaticValue(clock.timeZone));
  appendBooleanAttribute(html, "data-analog", getStaticValue(clock.analog) === true);
  if(clock.backgroundStyle!==undefined)appendAttribute(html,"data-clock-background-style",String(getStaticValue(clock.backgroundStyle)??0));
  html.push(`>${parts.length === 0 ? "Clock" : parts.join(" ")}</time>`);
}

// Fixed sample matches the digital renderer: not a live clock.
function appendAnalogClockPreview(html: string[], clock: HmiClock, context: HmiHtmlConvertContext): void {
  const foreground = clock.foregroundColor === undefined ? "#000000" : colorToCss(getStaticValue(clock.foregroundColor) ?? hmiColorFromArgb(0,0,0,0));
  const ticks = clock.ticksColor === undefined ? foreground : colorToCss(getStaticValue(clock.ticksColor) ?? hmiColorFromArgb(0,0,0,0));
  let fill = clock.handFillColor === undefined ? foreground : colorToCss(getStaticValue(clock.handFillColor) ?? hmiColorFromArgb(0,0,0,0));
  if (getStaticValue(clock.outlinedHands) === true) fill = "none";
  html.push("<time");
  appendCommonAttributes(html,clock,context,true,"display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;"+clockBackgroundOverride(clock));
  appendAttribute(html,"datetime","2000-01-01T12:34:56");
  appendAttribute(html,"data-format",getStaticValue(clock.format));
  appendAttribute(html,"data-time-zone",getStaticValue(clock.timeZone));
  appendBooleanAttribute(html,"data-analog",true);
  appendAttribute(html,"data-clock-preview","static");
  if(clock.backgroundStyle!==undefined)appendAttribute(html,"data-clock-background-style",String(getStaticValue(clock.backgroundStyle)??0));
  html.push('><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Analog clock preview: 12:34:56" style="width: 100%; height: 100%; min-height: 0; flex: 1;">');
  if(clock.backgroundStyle===undefined||getStaticValue(clock.backgroundStyle)===1){
    html.push('<circle data-clock-dial="true" cx="50" cy="50" r="48"');
    appendAttribute(html,"fill",clock.backgroundStyle===undefined?"none":clock.backgroundColor===undefined?"#FFFFFF":colorToCss(getStaticValue(clock.backgroundColor)??hmiColorFromArgb(0,0,0,0)));
    appendAttribute(html,"stroke",clock.backgroundStyle===undefined?foreground:"#808080");html.push(' stroke-width="1"/>');
  }
  if (clock.showTicks === undefined || getStaticValue(clock.showTicks) === true) {
    const tickRadius=clockPercent(clock.secondHandLengthPercent,80)*48/100;
    for(let i=0;i<60;i++) {
      html.push(`<circle data-clock-tick="${i}"`);
      appendSvgAttribute(html,"cx",50);appendSvgAttribute(html,"cy",50-tickRadius);
      appendSvgAttribute(html,"r",i%5===0?2:.75);
      appendAttribute(html,"transform",`rotate(${i*6} 50 50)`);
      appendAttribute(html,"fill",ticks);html.push("/>");
    }
  }
  if (clock.showTime === undefined || getStaticValue(clock.showTime) === true) {
    if (clock.showHours === undefined || getStaticValue(clock.showHours) === true)
      appendClockHand(html,"hour",17,clockPercent(clock.hourHandLengthPercent,50),clockPercent(clock.hourHandHalfWidthPercent,10),foreground,fill);
    if (clock.showMinutes === undefined || getStaticValue(clock.showMinutes) === true)
      appendClockHand(html,"minute",204,clockPercent(clock.minuteHandLengthPercent,70),clockPercent(clock.minuteHandHalfWidthPercent,8),foreground,fill);
    if (getStaticValue(clock.showSeconds) === true)
      appendClockHand(html,"second",336,clockPercent(clock.secondHandLengthPercent,80),clockPercent(clock.secondHandHalfWidthPercent,2),foreground,fill);
    html.push('<circle data-clock-hub="true" cx="50" cy="50" r="2"');appendAttribute(html,"fill",foreground);html.push("/>");
  }
  html.push("</svg>");
  if (getStaticValue(clock.showDate) === true)html.push('<span data-clock-date="true">2000-01-01</span>');
  html.push("</time>");
}
function clockPercent(property: HmiProperty<number>|undefined, fallback: number): number {
  const value=property===undefined?fallback:getStaticValue(property)??0;
  return Number.isFinite(value)?Math.max(0,Math.min(100,value)):fallback;
}
function clockBackgroundOverride(clock: HmiClock): string {
  const mode=getStaticValue(clock.backgroundStyle);
  return clock.backgroundStyle!==undefined&&(mode===1||mode===2)?" background: transparent;":"";
}
function appendClockHand(html: string[],name: string,angle: number,lengthPercent: number,widthPercent: number,stroke: string,fill: string): void {
  if(lengthPercent<=0||widthPercent<=0)return;
  const length=48*lengthPercent/100,width=length*widthPercent/100;
  html.push("<polygon");appendAttribute(html,"data-clock-hand",name);
  appendAttribute(html,"points",`50,${toCss(50-.01*length)} ${toCss(50-width)},${toCss(50-.15*length)} 50,${toCss(50-length)} ${toCss(50+width)},${toCss(50-.15*length)} 50,${toCss(50-.01*length)}`);
  appendAttribute(html,"transform",`rotate(${angle} 50 50)`);appendAttribute(html,"stroke",stroke);appendAttribute(html,"fill",fill);
  html.push(' stroke-width="1"/>');
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

function appendMediaControl(html: string[], mediaControl: HmiMediaControl, context: HmiHtmlConvertContext): void {
  let source = getStaticValue(mediaControl.source);
  if (!source?.trim() && mediaControl.source?.kind === HmiPropertyKind.Expression)
    source = (mediaControl.source as HmiExpressionProperty<string>).expression;
  const autoPlay = resolvePropertyPreview(mediaControl.autoPlay);
  html.push("<div");
  appendCommonAttributes(html, mediaControl, context, true,
    "display: flex; flex-direction: column; overflow: hidden;");
  appendAttribute(html, "data-media-source", resolvePropertyPreview(mediaControl.source));
  appendAttribute(html, "data-auto-play", autoPlay);
  appendAttribute(html, "data-video-output", resolvePropertyPreview(mediaControl.videoOutput));
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(mediaControl.showToolbar));
  appendAttribute(html, "data-show-status-bar", resolvePropertyPreview(mediaControl.showStatusBar));
  appendAttribute(html, "data-toolbar-background-color", resolvePropertyPreview(mediaControl.toolbarBackgroundColor));
  appendAttribute(html, "data-toolbar-foreground-color", resolvePropertyPreview(mediaControl.toolbarForegroundColor));
  appendAttribute(html, "data-status-bar-background-color", resolvePropertyPreview(mediaControl.statusBarBackgroundColor));
  appendAttribute(html, "data-status-bar-foreground-color", resolvePropertyPreview(mediaControl.statusBarForegroundColor));
  html.push(">");
  const bar = (role: string, background: HmiProperty<HmiColor> | undefined, foreground: HmiProperty<HmiColor> | undefined, font: HmiFont | undefined, text: string) => {
    const style = ["flex: 0 0 auto; padding: 2px 4px;"];
    appendColorStyle(style, "background-color", background); appendColorStyle(style, "color", foreground);
    if (font) appendFont(style, font.getForCulture(context.options.cultureLcid));
    html.push('<div role="', role, '" style="', style.join(""), '">', text, "</div>");
  };
  if (getStaticValue(mediaControl.showToolbar) === true)
    bar("toolbar", mediaControl.toolbarBackgroundColor, mediaControl.toolbarForegroundColor, mediaControl.toolbarFont, "Media commands not loaded");
  html.push("<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Media not loaded</div>");
  if (source?.trim())
    html.push("<div style=\"overflow: hidden; overflow-wrap: anywhere;\">Source: ", escapeHtml(source), "</div>");
  if (autoPlay !== undefined)
    html.push("<div>Autoplay: ", escapeHtml(autoPlay), "</div>");
  if (getStaticValue(mediaControl.showStatusBar) === true)
    bar("status", mediaControl.statusBarBackgroundColor, mediaControl.statusBarForegroundColor, mediaControl.statusBarFont, "Media status not loaded");
  html.push("</div>");
}

function appendNcPartProgramControl(html: string[], control: HmiNcPartProgramControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, control, context, true, createControlWindowStyle(control, "overflow: hidden;"));
  appendAttribute(html, "data-list-background-color", resolvePropertyPreview(control.listBackgroundColor));
  appendAttribute(html, "data-list-foreground-color", resolvePropertyPreview(control.listForegroundColor));
  appendAttribute(html, "data-selection-background-color", resolvePropertyPreview(control.selectionBackgroundColor));
  appendAttribute(html, "data-selection-foreground-color", resolvePropertyPreview(control.selectionForegroundColor));
  appendAttribute(html, "data-alternating-row-background-color", resolvePropertyPreview(control.alternatingRowBackgroundColor));
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(control.gridLineColor));
  appendAttribute(html, "data-show-grid-lines", resolvePropertyPreview(control.showGridLines));
  appendAttribute(html, "data-button-background-color", resolvePropertyPreview(control.buttonBackgroundColor));
  appendAttribute(html, "data-button-border-background-color", resolvePropertyPreview(control.buttonBorderBackgroundColor));
  appendAttribute(html, "data-button-border-color", resolvePropertyPreview(control.buttonBorderColor));
  appendAttribute(html, "data-button-first-gradient-color", resolvePropertyPreview(control.buttonFirstGradientColor));
  appendAttribute(html, "data-button-middle-gradient-color", resolvePropertyPreview(control.buttonMiddleGradientColor));
  appendAttribute(html, "data-button-second-gradient-color", resolvePropertyPreview(control.buttonSecondGradientColor));
  appendAttribute(html, "data-button-border-width", resolvePropertyPreview(control.buttonBorderWidth));
  appendAttribute(html, "data-button-corner-radius", resolvePropertyPreview(control.buttonCornerRadius));
  appendAttribute(html, "data-button-edge-style", resolvePropertyPreview(control.buttonEdgeStyle));
  appendAttribute(html, "data-button-back-fill-style", resolvePropertyPreview(control.buttonBackFillStyle));
  appendAttribute(html, "data-button-first-gradient-offset", resolvePropertyPreview(control.buttonFirstGradientOffset));
  appendAttribute(html, "data-button-second-gradient-offset", resolvePropertyPreview(control.buttonSecondGradientOffset));
  appendAttribute(html, "data-use-button-first-gradient", resolvePropertyPreview(control.useButtonFirstGradient));
  appendAttribute(html, "data-use-button-second-gradient", resolvePropertyPreview(control.useButtonSecondGradient));
  appendAttribute(html, "data-textual-objects-border-background-color", resolvePropertyPreview(control.textualObjectsBorderBackgroundColor));
  appendAttribute(html, "data-textual-objects-border-color", resolvePropertyPreview(control.textualObjectsBorderColor));
  appendAttribute(html, "data-textual-objects-border-width", resolvePropertyPreview(control.textualObjectsBorderWidth));
  appendAttribute(html, "data-textual-objects-corner-radius", resolvePropertyPreview(control.textualObjectsCornerRadius));
  appendAttribute(html, "data-textual-objects-edge-style", resolvePropertyPreview(control.textualObjectsEdgeStyle));
  html.push(' role="region" aria-label="NC part program viewer" data-preview="appearance"><div style="overflow:auto;height:100%;"><div>NC program data not decoded</div>');
  const content: string[] = [];
  appendColorStyle(content, "background-color", control.listBackgroundColor);
  appendColorStyle(content, "color", control.listForegroundColor);
  if (control.contentFont) appendFont(content, control.contentFont.getForCulture(context.options.cultureLcid));
  sample("list", "List appearance", content);
  const selection: string[] = [];
  appendColorStyle(selection, "background-color", control.selectionBackgroundColor);
  appendColorStyle(selection, "color", control.selectionForegroundColor);
  sample("selection", "Selection appearance", selection);
  const alternate: string[] = [];
  appendColorStyle(alternate, "background-color", control.alternatingRowBackgroundColor);
  appendColorStyle(alternate, "color", control.listForegroundColor);
  sample("alternate", "Alternating row appearance", alternate);
  const button: string[] = [];
  appendColorStyle(button, "background-color", control.buttonBackgroundColor);
  appendColorStyle(button, "border-color", control.buttonBorderColor);
  appendHeaderBorderWidth(button, control.buttonBorderWidth);
  const buttonRadius = getStaticValue(control.buttonCornerRadius);
  if (buttonRadius !== undefined && buttonRadius >= 0) button.push(`border-radius: ${toCss(buttonRadius)}px;`);
  appendColorGradientStyle(button, createColorGradient({
    backgroundColor: control.buttonBackgroundColor, firstGradientColor: control.buttonFirstGradientColor, firstGradientOffset: control.buttonFirstGradientOffset,
    middleGradientColor: control.buttonMiddleGradientColor, secondGradientColor: control.buttonSecondGradientColor, secondGradientOffset: control.buttonSecondGradientOffset,
    useFirstGradient: control.useButtonFirstGradient, useSecondGradient: control.useButtonSecondGradient,
  }));
  sample("button", "Button appearance", button);
  const text: string[] = [];
  appendColorStyle(text, "border-color", control.textualObjectsBorderColor);
  appendHeaderBorderWidth(text, control.textualObjectsBorderWidth);
  const textRadius = getStaticValue(control.textualObjectsCornerRadius);
  if (textRadius !== undefined && textRadius >= 0) text.push(`border-radius: ${toCss(textRadius)}px;`);
  sample("text", "Text field appearance", text);
  html.push("</div></div>");

  function sample(kind: string, label: string, style: string[]): void {
    html.push('<div data-appearance="', kind, '" style="padding:4px;', style.join(""), '">', label, "</div>");
  }
}

function appendNcKeyboardControl(html: string[], control: HmiNcKeyboardControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, control, context, true, createControlWindowStyle(control, "overflow: hidden;"));
  appendAttribute(html, "data-keyboard-style", resolvePropertyPreview(control.keyboardStyle));
  appendAttribute(html, "data-keyboard-background-color", resolvePropertyPreview(control.keyboardBackgroundColor));
  html.push(' role="region" aria-label="NC keyboard" data-preview="palette">');
  const style = ["overflow: auto; height: 100%;"];
  appendColorStyle(style, "background-color", control.keyboardBackgroundColor);
  html.push('<div class="hmi-nc-keyboard-palette" style="', style.join(""), '"><div>NC keyboard layout not decoded</div><table><thead><tr><th>Key class</th><th>Normal state</th><th>Pressed state</th></tr></thead><tbody>');
  for (const [kind, label, appearance] of [["normal", "Normal keys", control.normalKeys], ["special", "Special keys", control.specialKeys], ["enter", "Enter key", control.enterKey]] as const) {
    html.push('<tr data-key-class="', kind, '"><th>', label, "</th><td>");
    state("normal", appearance.normalBackgroundColor, appearance.normalForegroundColor);
    html.push("</td><td>"); state("pressed", appearance.pressedBackgroundColor, appearance.pressedForegroundColor);
    html.push("</td></tr>");
  }
  html.push("</tbody></table></div></div>");

  function state(name: string, background: HmiProperty<HmiColor> | undefined, foreground: HmiProperty<HmiColor> | undefined): void {
    html.push('<span class="hmi-nc-key-preview"');
    appendAttribute(html, "data-key-state", name);
    appendAttribute(html, "data-background-color", resolvePropertyPreview(background));
    appendAttribute(html, "data-foreground-color", resolvePropertyPreview(foreground));
    const keyStyle = ["display: inline-block; min-width: 6em; padding: 2px 4px;"];
    appendColorStyle(keyStyle, "background-color", background); appendColorStyle(keyStyle, "color", foreground);
    html.push(' style="', keyStyle.join(""), '">', background === undefined && foreground === undefined ? "Not configured" : "Preview", "</span>");
  }
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

function appendDetailedParameterControl(html: string[], control: HmiDetailedParameterControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, control, context, true, "display: flex; flex-direction: column; overflow: hidden;");
  appendAttribute(html, "data-parameter-set-type-fixed", resolvePropertyPreview(control.parameterSetTypeFixed));
  appendAttribute(html, "data-current-parameter-set-id", resolvePropertyPreview(control.currentParameterSetId));
  appendAttribute(html, "data-current-parameter-set-type-id", resolvePropertyPreview(control.currentParameterSetTypeId));
  appendAttribute(html, "data-hide-details", resolvePropertyPreview(control.hideDetails));
  appendParameterDefinitionAttributes(html, control);
  appendParameterBarAttributes(html, control);
  appendParameterHeaderAttributes(html, control);
  appendParameterGridAttributes(html, control);
  appendParameterSelectionAttributes(html, control);
  appendAttribute(html, "data-row-height", resolvePropertyPreview(control.rowHeight));
  appendAttribute(html, "data-cell-padding-left", resolvePropertyPreview(control.cellPaddingLeft));
  appendAttribute(html, "data-cell-padding-top", resolvePropertyPreview(control.cellPaddingTop));
  appendAttribute(html, "data-cell-padding-right", resolvePropertyPreview(control.cellPaddingRight));
  appendAttribute(html, "data-cell-padding-bottom", resolvePropertyPreview(control.cellPaddingBottom));
  appendAttribute(html, "data-edit-mode", resolvePropertyPreview(control.editMode));
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(control.showToolbar));
  appendAttribute(html, "data-show-status-bar", resolvePropertyPreview(control.showStatusBar));
  html.push(">");
  if (getStaticValue(control.showToolbar)) {
    const style = ["flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;"];
    appendParameterBarStyle(style, control.toolbarPaddingLeft, control.toolbarPaddingTop, control.toolbarPaddingRight, control.toolbarPaddingBottom);
    appendColorStyle(style, "background-color", control.toolbarBackgroundColor);
    appendColorStyle(style, "color", control.toolbarForegroundColor);
    if (control.toolbarFont !== undefined) appendFont(style, control.toolbarFont.getForCulture(context.options.cultureLcid));
    html.push('<div class="hmi-parameter-toolbar" role="toolbar" style="', style.join(""), '"');
    if (control.toolbarEnabled !== undefined) appendAttribute(html, "aria-disabled", getStaticValue(control.toolbarEnabled) ? "false" : "true");
    html.push('>Toolbar</div>');
  }
  html.push('<div class="hmi-parameter-selection" style="flex: 0 0 auto; padding: 2px 4px;"><div>',
    escapeHtml(getStaticValue(control.parameterSetTypeLabel)?.getText(context.options.cultureLcid) ?? "Parameter set type"));
  if (getStaticValue(control.parameterSetTypeFixed)) html.push(" · Fixed");
  if (control.currentParameterSetTypeId !== undefined)
    html.push(": ", String(getStaticValue(control.currentParameterSetTypeId)));
  html.push("</div><div>", escapeHtml(getStaticValue(control.parameterSetLabel)?.getText(context.options.cultureLcid) ?? "Parameter set"),
    "</div><div>", escapeHtml(getStaticValue(control.numberLabel)?.getText(context.options.cultureLcid) ?? "Number"));
  if (control.currentParameterSetId !== undefined) html.push(": ", String(getStaticValue(control.currentParameterSetId)));
  html.push("</div>");
  if (control.currentParameterSetId === undefined || control.currentParameterSetTypeId === undefined)
    html.push("<div>Parameter set selection not decoded</div>");
  html.push("</div>");
  if (!getStaticValue(control.hideDetails)) appendParameterView(html, control, context);
  if (getStaticValue(control.showStatusBar)) {
    const style = ["flex: 0 0 auto; padding: 2px 4px; border-top: 1px solid currentColor;"];
    appendParameterBarStyle(style, control.statusBarPaddingLeft, control.statusBarPaddingTop, control.statusBarPaddingRight, control.statusBarPaddingBottom);
    appendColorStyle(style, "background-color", control.statusBarBackgroundColor);
    appendColorStyle(style, "color", control.statusBarForegroundColor);
    if (control.statusBarFont !== undefined) appendFont(style, control.statusBarFont.getForCulture(context.options.cultureLcid));
    html.push('<div class="hmi-parameter-status-bar" role="status" style="', style.join(""), '"');
    if (control.statusBarEnabled !== undefined) appendAttribute(html, "aria-disabled", getStaticValue(control.statusBarEnabled) ? "false" : "true");
    html.push('>Status</div>');
  }
  html.push("</div>");
}

function appendOverviewParameterControl(html: string[], control: HmiOverviewParameterControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, control, context, true, "display: flex; flex-direction: column; overflow: hidden;");
  appendAttribute(html, "data-parameter-control-view", "overview");
  appendAttribute(html, "data-filter", resolvePropertyPreview(control.filter));
  appendParameterDefinitionAttributes(html, control);
  appendParameterBarAttributes(html, control);
  appendParameterHeaderAttributes(html, control);
  appendParameterGridAttributes(html, control);
  appendParameterSelectionAttributes(html, control);
  appendAttribute(html, "data-row-height", resolvePropertyPreview(control.rowHeight));
  appendAttribute(html, "data-cell-padding-left", resolvePropertyPreview(control.cellPaddingLeft));
  appendAttribute(html, "data-cell-padding-top", resolvePropertyPreview(control.cellPaddingTop));
  appendAttribute(html, "data-cell-padding-right", resolvePropertyPreview(control.cellPaddingRight));
  appendAttribute(html, "data-cell-padding-bottom", resolvePropertyPreview(control.cellPaddingBottom));
  appendAttribute(html, "data-edit-mode", resolvePropertyPreview(control.editMode));
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(control.showToolbar));
  appendAttribute(html, "data-show-status-bar", resolvePropertyPreview(control.showStatusBar));
  html.push(">");
  if (getStaticValue(control.showToolbar)) {
    const style = ["flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;"];
    appendParameterBarStyle(style, control.toolbarPaddingLeft, control.toolbarPaddingTop, control.toolbarPaddingRight, control.toolbarPaddingBottom);
    appendColorStyle(style, "background-color", control.toolbarBackgroundColor);
    appendColorStyle(style, "color", control.toolbarForegroundColor);
    if (control.toolbarFont !== undefined) appendFont(style, control.toolbarFont.getForCulture(context.options.cultureLcid));
    html.push('<div class="hmi-parameter-toolbar" role="toolbar" style="', style.join(""), '"');
    if (control.toolbarEnabled !== undefined) appendAttribute(html, "aria-disabled", getStaticValue(control.toolbarEnabled) ? "false" : "true");
    html.push('>Toolbar</div>');
  }
  if (control.filter !== undefined) html.push('<div class="hmi-parameter-filter">Filter: ', escapeHtml(getStaticValue(control.filter) ?? ""), "</div>");
  appendParameterView(html, control, context);
  if (getStaticValue(control.showStatusBar)) {
    const style = ["flex: 0 0 auto; padding: 2px 4px; border-top: 1px solid currentColor;"];
    appendParameterBarStyle(style, control.statusBarPaddingLeft, control.statusBarPaddingTop, control.statusBarPaddingRight, control.statusBarPaddingBottom);
    appendColorStyle(style, "background-color", control.statusBarBackgroundColor);
    appendColorStyle(style, "color", control.statusBarForegroundColor);
    if (control.statusBarFont !== undefined) appendFont(style, control.statusBarFont.getForCulture(context.options.cultureLcid));
    html.push('<div class="hmi-parameter-status-bar" role="status" style="', style.join(""), '"');
    if (control.statusBarEnabled !== undefined) appendAttribute(html, "aria-disabled", getStaticValue(control.statusBarEnabled) ? "false" : "true");
    html.push('>Status</div>');
  }
  html.push("</div>");
}

function appendParameterView(html: string[], control: HmiParameterControlBase, context: HmiHtmlConvertContext): void {
  appendParameterDefinitionPreview(html, control, context);
  const columns = control.columnDefinitions.filter(column => column.visible === undefined || getStaticValue(column.visible) === true);
  const style = ["flex: 1 1 auto; display: grid; place-items: center; overflow: hidden; border-top-style: solid; border-top-color: currentColor;"];
  if (columns.length > 0) style.push("display: block; overflow: auto;");
  const width = getStaticValue(control.gridLineWidth) ?? 1;
  let separatorWidth = Number.isFinite(width) && width >= 0 ? width : 1;
  if (control.gridLineVisibility !== undefined && getStaticValue(control.gridLineVisibility) !== 2) separatorWidth = 0;
  style.push(`border-top-width: ${toCss(separatorWidth)}px;`);
  appendParameterScrollStyle(style, "x", control.horizontalScrollBarVisibility);
  appendParameterScrollStyle(style, "y", control.verticalScrollBarVisibility);
  appendColorStyle(style, "background-color", control.contentBackgroundColor);
  appendColorStyle(style, "color", control.contentForegroundColor);
  appendColorStyle(style, "border-top-color", control.gridLineColor);
  html.push('<div class="hmi-parameter-details" style="', style.join(""), '\">');
  if (columns.length > 0) appendParameterColumns(html, control, columns, context);
  else html.push("Parameter data not loaded");
  appendParameterHeaderSelectionPreview(html, control, context);
  appendParameterSelectionPreview(html, control, context);
  html.push("</div>");
}

function appendParameterDefinitionAttributes(html: string[], control: HmiParameterControlBase): void {
  appendAttribute(html, "data-default-parameter-set-type-reference-key", control.defaultParameterSetTypeReferenceKey, true);
  appendAttribute(html, "data-default-parameter-set-type-source-id", control.defaultParameterSetTypeReference?.sourceId);
  appendAttribute(html, "data-default-parameter-set-type-name", control.defaultParameterSetTypeReference?.name, true);
  if (control.defaultParameterSetType !== undefined)
    appendAttribute(html, "data-default-parameter-set-type-field-count", String(control.defaultParameterSetType.parameters.length));
}

function appendParameterDefinitionPreview(html: string[], control: HmiParameterControlBase, context: HmiHtmlConvertContext): void {
  const definition = control.defaultParameterSetType;
  if (definition === undefined) return;
  html.push('<details class="hmi-parameter-definition-preview"><summary>Configured parameter set type: ', escapeHtml((definition.displayName?.getText(context.options.cultureLcid) ?? definition.name) ?? ""), '</summary><table><thead><tr><th>Field</th><th>Data type</th><th>Default value</th></tr></thead><tbody>');
  for (const field of definition.parameters)
    html.push('<tr><td>', escapeHtml((field.displayName?.getText(context.options.cultureLcid) ?? field.name) ?? ""), '</td><td>', escapeHtml((field.dataType) ?? ""), '</td><td>', escapeHtml((field.defaultValue) ?? ""), '</td></tr>');
  html.push('</tbody></table></details>');
}

function appendParameterBarAttributes(html: string[], control: HmiParameterControlBase): void {
  appendAttribute(html, "data-toolbar-enabled", resolvePropertyPreview(control.toolbarEnabled));
  appendAttribute(html, "data-toolbar-show-tooltips", resolvePropertyPreview(control.toolbarShowToolTips));
  appendAttribute(html, "data-toolbar-padding-left", resolvePropertyPreview(control.toolbarPaddingLeft));
  appendAttribute(html, "data-toolbar-padding-top", resolvePropertyPreview(control.toolbarPaddingTop));
  appendAttribute(html, "data-toolbar-padding-right", resolvePropertyPreview(control.toolbarPaddingRight));
  appendAttribute(html, "data-toolbar-padding-bottom", resolvePropertyPreview(control.toolbarPaddingBottom));
  appendAttribute(html, "data-status-bar-enabled", resolvePropertyPreview(control.statusBarEnabled));
  appendAttribute(html, "data-status-bar-show-tooltips", resolvePropertyPreview(control.statusBarShowToolTips));
  appendAttribute(html, "data-status-bar-padding-left", resolvePropertyPreview(control.statusBarPaddingLeft));
  appendAttribute(html, "data-status-bar-padding-top", resolvePropertyPreview(control.statusBarPaddingTop));
  appendAttribute(html, "data-status-bar-padding-right", resolvePropertyPreview(control.statusBarPaddingRight));
  appendAttribute(html, "data-status-bar-padding-bottom", resolvePropertyPreview(control.statusBarPaddingBottom));
}

function appendParameterBarStyle(style: string[], left: HmiProperty<number> | undefined, top: HmiProperty<number> | undefined,
  right: HmiProperty<number> | undefined, bottom: HmiProperty<number> | undefined): void {
  const appendPadding = (side: string, property: HmiProperty<number> | undefined): void => {
    const value = getStaticValue(property);
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) style.push(`padding-${side}: ${toCss(value)}px;`);
  };
  appendPadding("left", left); appendPadding("top", top); appendPadding("right", right); appendPadding("bottom", bottom);
}

function appendParameterHeaderAttributes(html: string[], control: HmiParameterControlBase): void {
  appendAttribute(html, "data-allow-column-reorder", resolvePropertyPreview(control.allowColumnReorder));
  appendAttribute(html, "data-allow-column-resize", resolvePropertyPreview(control.allowColumnResize));
  appendAttribute(html, "data-column-header-type", resolvePropertyPreview(control.columnHeaderType));
  appendAttribute(html, "data-row-header-type", resolvePropertyPreview(control.rowHeaderType));
  appendAttribute(html, "data-header-selection-background-color", resolvePropertyPreview(control.headerSelectionBackgroundColor));
  appendAttribute(html, "data-header-selection-foreground-color", resolvePropertyPreview(control.headerSelectionForegroundColor));
}

function appendParameterHeaderSelectionPreview(html: string[], control: HmiParameterControlBase, context: HmiHtmlConvertContext): void {
  if (control.headerSelectionBackgroundColor === undefined && control.headerSelectionForegroundColor === undefined) return;
  const style = ["padding: 2px 4px; box-sizing: border-box;"];
  appendColorStyle(style, "background-color", control.headerSelectionBackgroundColor);
  appendColorStyle(style, "color", control.headerSelectionForegroundColor);
  if (control.headerFont !== undefined) appendFont(style, control.headerFont.getForCulture(context.options.cultureLcid));
  html.push('<div class="hmi-parameter-header-selection-preview" data-preview="appearance" style="', style.join(""), '">Header selection appearance preview</div>');
}

function appendParameterGridAttributes(html: string[], control: HmiParameterControlBase): void {
  appendAttribute(html, "data-allow-sort-by-column", resolvePropertyPreview(control.allowSortByColumn));
  appendAttribute(html, "data-allow-filter-by-column", resolvePropertyPreview(control.allowFilterByColumn));
  appendAttribute(html, "data-grid-line-visibility", resolvePropertyPreview(control.gridLineVisibility));
  appendAttribute(html, "data-grid-selection-mode", resolvePropertyPreview(control.gridSelectionMode));
  appendAttribute(html, "data-coloring-mode", resolvePropertyPreview(control.coloringMode));
  appendAttribute(html, "data-horizontal-scroll-bar-visibility", resolvePropertyPreview(control.horizontalScrollBarVisibility));
  appendAttribute(html, "data-vertical-scroll-bar-visibility", resolvePropertyPreview(control.verticalScrollBarVisibility));
}

function appendParameterScrollStyle(style: string[], axis: string, property: HmiProperty<number> | undefined): void {
  const mode = getStaticValue(property);
  const overflow = mode === 0 ? "auto" : mode === 1 ? "scroll" : mode === 2 ? "hidden" : undefined;
  if (overflow !== undefined) style.push(`overflow-${axis}: ${overflow};`);
}

function appendParameterSelectionAttributes(html: string[], control: HmiParameterControlBase): void {
  appendAttribute(html, "data-select-full-row", resolvePropertyPreview(control.selectFullRow));
  appendAttribute(html, "data-selection-background-color", resolvePropertyPreview(control.selectionBackgroundColor));
  appendAttribute(html, "data-selection-foreground-color", resolvePropertyPreview(control.selectionForegroundColor));
  appendAttribute(html, "data-selection-border-color", resolvePropertyPreview(control.selectionBorderColor));
  appendAttribute(html, "data-selection-border-width", resolvePropertyPreview(control.selectionBorderWidth));
}

function appendParameterSelectionPreview(html: string[], control: HmiParameterControlBase, context: HmiHtmlConvertContext): void {
  if (control.selectFullRow === undefined && control.selectionBackgroundColor === undefined && control.selectionForegroundColor === undefined &&
      control.selectionBorderColor === undefined && control.selectionBorderWidth === undefined) return;
  const style = ["padding: 2px 4px; box-sizing: border-box;"];
  appendColorStyle(style, "background-color", control.selectionBackgroundColor);
  appendColorStyle(style, "color", control.selectionForegroundColor);
  appendColorStyle(style, "border-color", control.selectionBorderColor);
  if (control.contentFont !== undefined) appendFont(style, control.contentFont.getForCulture(context.options.cultureLcid));
  const width = getStaticValue(control.selectionBorderWidth);
  if (typeof width === "number" && Number.isFinite(width) && width >= 0) style.push(`border-style: solid; border-width: ${toCss(width)}px;`);
  html.push('<div class="hmi-parameter-selection-preview" data-preview="appearance" style="', style.join(""), '">Selection appearance preview');
  if (control.selectFullRow !== undefined) html.push(getStaticValue(control.selectFullRow) ? " · Entire row" : " · Cell");
  html.push("</div>");
}

function appendParameterColumns(html: string[], control: HmiParameterControlBase, columns: HmiParameterColumn[], context: HmiHtmlConvertContext): void {
  html.push('<table class="hmi-parameter-table" style="width: 100%; table-layout: fixed; border-collapse: collapse;"><colgroup>');
  for (const column of columns) html.push('<col style="', createParameterColumnWidthStyle(column), '\">');
  const headerStyle = ["padding: 2px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"];
  appendColorStyle(headerStyle, "background-color", control.headerBackgroundColor);
  appendColorStyle(headerStyle, "color", control.headerForegroundColor);
  if (control.headerFont !== undefined) appendFont(headerStyle, control.headerFont.getForCulture(context.options.cultureLcid));
  html.push("</colgroup>");
  const columnHeaderType = getStaticValue(control.columnHeaderType);
  if (columnHeaderType !== 0) {
    html.push("<thead><tr>");
    for (const [index, column] of columns.entries()) {
      const separator: string[] = [];
      if (index < columns.length - 1 && control.headerBorderColor !== undefined) {
        const width = getStaticValue(control.gridLineWidth) ?? 1;
        separator.push(`border-right-style: solid;border-right-width: ${toCss(Number.isFinite(width) && width >= 0 ? width : 1)}px;`);
        appendColorStyle(separator, "border-right-color", control.headerBorderColor);
      }
      html.push('<th scope="col" style="', headerStyle.join(""), createParameterColumnWidthStyle(column), createParameterHeaderAlignmentStyle(column), separator.join(""), '\"');
      appendAttribute(html, "data-column-name", column.name);
      appendAttribute(html, "data-column-key", column.key);
      appendAttribute(html, "data-enabled", resolvePropertyPreview(column.enabled));
      appendAttribute(html, "data-content-background-color", resolvePropertyPreview(column.backgroundColor));
      appendAttribute(html, "data-content-foreground-color", resolvePropertyPreview(column.foregroundColor));
      appendAttribute(html, "data-header-horizontal-alignment", resolvePropertyPreview(column.headerHorizontalAlignment));
      appendAttribute(html, "data-header-vertical-alignment", resolvePropertyPreview(column.headerVerticalAlignment));
      appendAttribute(html, "data-width", resolvePropertyPreview(column.width));
      appendAttribute(html, "data-minimum-width", resolvePropertyPreview(column.minimumWidth));
      appendAttribute(html, "data-maximum-width", resolvePropertyPreview(column.maximumWidth));
      appendAttribute(html, "data-allow-sort", resolvePropertyPreview(column.allowSort));
      appendAttribute(html, "data-sort-order", resolvePropertyPreview(column.sortOrder));
      appendAttribute(html, "data-sort-direction", resolvePropertyPreview(column.sortDirection));
      appendAttribute(html, "data-output-format", resolvePropertyPreview(column.outputFormat));
      const headingText = columnHeaderType === 1 ? String(index + 1) : column.headerText?.getText(context.options.cultureLcid) ?? column.name ?? column.key ?? "Column";
      html.push(">", escapeHtml(headingText), "</th>");
    }
    html.push("</tr></thead>");
  }
  html.push('<tbody><tr><td colspan="', String(columns.length), '\" style="text-align: center; padding: 2px 4px;', createParameterCellLayoutStyle(control, context), '">Parameter data not loaded</td></tr></tbody></table>');
}

function createParameterCellLayoutStyle(control: HmiParameterControlBase, context: HmiHtmlConvertContext): string {
  const style: string[] = [];
  const appendDimension = (css: string, property: HmiProperty<number> | undefined) => {
    const value = getStaticValue(property);
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) style.push(`${css}: ${toCss(value)}px;`);
  };
  if (getStaticValue(control.rowHeight) === 0) style.push("height: auto;");
  else appendDimension("height", control.rowHeight);
  if (control.contentFont !== undefined) appendFont(style, control.contentFont.getForCulture(context.options.cultureLcid));
  appendDimension("padding-left", control.cellPaddingLeft);
  appendDimension("padding-top", control.cellPaddingTop);
  appendDimension("padding-right", control.cellPaddingRight);
  appendDimension("padding-bottom", control.cellPaddingBottom);
  return style.join("");
}

function createParameterHeaderAlignmentStyle(column: HmiParameterColumn): string {
  const style: string[] = [];
  const horizontal = getStaticValue(column.headerHorizontalAlignment);
  if (horizontal !== undefined) style.push(`text-align: ${horizontalAlignmentToCss(horizontal)};`);
  const vertical = getStaticValue(column.headerVerticalAlignment);
  if (vertical !== undefined && vertical !== HmiVerticalAlignment.Stretch)
    style.push(`vertical-align: ${vertical === HmiVerticalAlignment.Top ? "top" : vertical === HmiVerticalAlignment.Bottom ? "bottom" : "middle"};`);
  return style.join("");
}

function createParameterColumnWidthStyle(column: HmiParameterColumn): string {
  const dimension = (property: HmiProperty<number> | undefined): number | undefined => {
    const value = getStaticValue(property);
    return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff ? value : undefined;
  };
  const minimum = dimension(column.minimumWidth), maximum = dimension(column.maximumWidth);
  const validBounds = minimum === undefined || maximum === undefined || minimum <= maximum;
  const style: string[] = [];
  let width = dimension(column.width);
  if (width !== undefined) {
    if (validBounds) {
      if (minimum !== undefined && width < minimum) width = minimum;
      if (maximum !== undefined && width > maximum) width = maximum;
    }
    style.push(`width: ${width}px;`);
  }
  if (validBounds) {
    if (minimum !== undefined) style.push(`min-width: ${minimum}px;`);
    if (maximum !== undefined) style.push(`max-width: ${maximum}px;`);
  }
  return style.join("");
}

function appendHeaderBorderWidth(style: string[], property: HmiProperty<number> | undefined): void {
  const width = getStaticValue(property);
  if (width !== undefined && width >= 0 && Number.isFinite(width)) style.push(`border-width: ${toCss(width)}px;`);
}

function appendUserViewControl(html: string[], control: HmiUserViewControl, context: HmiHtmlConvertContext): void {
  const grid = [control.showGridLines !== undefined && getStaticValue(control.showGridLines) === false ? "border: 0;" : "border: 1px solid currentColor;"];
  appendColorStyle(grid, "border-color", control.gridLineColor);
  const header = [...grid];
  appendColorStyle(header, "background-color", control.headerBackgroundColor);
  appendColorStyle(header, "color", control.headerForegroundColor);
  appendColorStyle(header, "border-color", control.headerBorderColor);
  appendHeaderBorderWidth(header, control.headerBorderWidth);
  const radius=getStaticValue(control.headerCornerRadius);
  if(radius!==undefined&&Number.isFinite(radius)&&radius>=0)header.push(`border-radius: ${toCss(radius)}px;`);
  appendColorGradientStyle(header,createColorGradient({backgroundColor:control.headerBackgroundColor,firstGradientColor:control.headerFirstGradientColor,firstGradientOffset:control.headerFirstGradientOffset,middleGradientColor:control.headerMiddleGradientColor,secondGradientColor:control.headerSecondGradientColor,secondGradientOffset:control.headerSecondGradientOffset,useFirstGradient:control.useHeaderFirstGradient,useSecondGradient:control.useHeaderSecondGradient}));
  if (control.headerFont !== undefined) appendFont(header, control.headerFont.getForCulture(context.options.cultureLcid));
  const content: string[] = [];
  appendColorStyle(content, "background-color", control.contentBackgroundColor);
  appendColorStyle(content, "color", control.contentForegroundColor);
  if (control.contentFont !== undefined) appendFont(content, control.contentFont.getForCulture(context.options.cultureLcid));
  html.push("<div");
  appendCommonAttributes(html, control, context, true, "overflow: hidden;");
  appendAttribute(html, "data-header-border-width", resolvePropertyPreview(control.headerBorderWidth));
  appendAttribute(html, "data-header-border-background-color", resolvePropertyPreview(control.headerBorderBackgroundColor));
  appendAttribute(html, "data-header-corner-radius", resolvePropertyPreview(control.headerCornerRadius));
  appendAttribute(html, "data-header-back-fill-style", resolvePropertyPreview(control.headerBackFillStyle));
  appendAttribute(html, "data-header-edge-style", resolvePropertyPreview(control.headerEdgeStyle));
  appendAttribute(html, "data-header-first-gradient-color", resolvePropertyPreview(control.headerFirstGradientColor));
  appendAttribute(html, "data-header-middle-gradient-color", resolvePropertyPreview(control.headerMiddleGradientColor));
  appendAttribute(html, "data-header-second-gradient-color", resolvePropertyPreview(control.headerSecondGradientColor));
  appendAttribute(html, "data-header-first-gradient-offset", resolvePropertyPreview(control.headerFirstGradientOffset));
  appendAttribute(html, "data-header-second-gradient-offset", resolvePropertyPreview(control.headerSecondGradientOffset));
  appendAttribute(html, "data-use-header-first-gradient", resolvePropertyPreview(control.useHeaderFirstGradient));
  appendAttribute(html, "data-use-header-second-gradient", resolvePropertyPreview(control.useHeaderSecondGradient));
  appendAttribute(html, "data-header-font-reference-device-size", resolvePropertyPreview(control.headerFontReferenceDeviceSize));
  appendAttribute(html, "data-content-font-reference-device-size", resolvePropertyPreview(control.contentFontReferenceDeviceSize));
  appendAttribute(html, "data-show-grid-lines", resolvePropertyPreview(control.showGridLines));
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(control.gridLineColor));
  appendAttribute(html, "data-alternating-row-background-color", resolvePropertyPreview(control.alternatingRowBackgroundColor));
  appendAttribute(html, "data-selection-background-color", resolvePropertyPreview(control.selectionBackgroundColor));
  appendAttribute(html, "data-selection-foreground-color", resolvePropertyPreview(control.selectionForegroundColor));
  html.push(' role="region" aria-label="User view"><table style="width: 100%; border-collapse: collapse;', content.join(""),
    '"><thead><tr><th style="', header.join(""), '">User view</th></tr></thead><tbody><tr><td style="', grid.join(""),
    'text-align: center;">User view data not loaded</td></tr></tbody></table>');
}

function appendStatusForceControl(html: string[], control: HmiStatusForceControl, context: HmiHtmlConvertContext): void {
  const grid = [control.showGridLines !== undefined && getStaticValue(control.showGridLines) === false ? "border: 0;" : "border: 1px solid currentColor;"];
  appendColorStyle(grid, "border-color", control.gridLineColor);
  const header = [...grid];
  appendColorStyle(header, "background-color", control.headerBackgroundColor);
  appendColorStyle(header, "color", control.headerForegroundColor);
  appendColorStyle(header, "border-color", control.headerBorderColor);
  appendHeaderBorderWidth(header, control.headerBorderWidth);
  const radius=getStaticValue(control.headerCornerRadius);
  if(radius!==undefined&&Number.isFinite(radius)&&radius>=0)header.push(`border-radius: ${toCss(radius)}px;`);
  appendColorGradientStyle(header,createColorGradient({backgroundColor:control.headerBackgroundColor,firstGradientColor:control.headerFirstGradientColor,firstGradientOffset:control.headerFirstGradientOffset,middleGradientColor:control.headerMiddleGradientColor,secondGradientColor:control.headerSecondGradientColor,secondGradientOffset:control.headerSecondGradientOffset,useFirstGradient:control.useHeaderFirstGradient,useSecondGradient:control.useHeaderSecondGradient}));
  if (control.headerFont !== undefined) appendFont(header, control.headerFont.getForCulture(context.options.cultureLcid));
  const content: string[] = [];
  appendColorStyle(content, "background-color", control.contentBackgroundColor);
  appendColorStyle(content, "color", control.contentForegroundColor);
  if (control.contentFont !== undefined) appendFont(content, control.contentFont.getForCulture(context.options.cultureLcid));
  html.push("<div");
  appendCommonAttributes(html, control, context, true, "overflow: hidden;");
  appendAttribute(html, "data-header-border-width", resolvePropertyPreview(control.headerBorderWidth));
  appendAttribute(html, "data-header-border-background-color", resolvePropertyPreview(control.headerBorderBackgroundColor));
  appendAttribute(html, "data-header-corner-radius", resolvePropertyPreview(control.headerCornerRadius));
  appendAttribute(html, "data-header-back-fill-style", resolvePropertyPreview(control.headerBackFillStyle));
  appendAttribute(html, "data-header-edge-style", resolvePropertyPreview(control.headerEdgeStyle));
  appendAttribute(html, "data-header-first-gradient-color", resolvePropertyPreview(control.headerFirstGradientColor));
  appendAttribute(html, "data-header-middle-gradient-color", resolvePropertyPreview(control.headerMiddleGradientColor));
  appendAttribute(html, "data-header-second-gradient-color", resolvePropertyPreview(control.headerSecondGradientColor));
  appendAttribute(html, "data-header-first-gradient-offset", resolvePropertyPreview(control.headerFirstGradientOffset));
  appendAttribute(html, "data-header-second-gradient-offset", resolvePropertyPreview(control.headerSecondGradientOffset));
  appendAttribute(html, "data-use-header-first-gradient", resolvePropertyPreview(control.useHeaderFirstGradient));
  appendAttribute(html, "data-use-header-second-gradient", resolvePropertyPreview(control.useHeaderSecondGradient));
  appendAttribute(html, "data-header-font-reference-device-size", resolvePropertyPreview(control.headerFontReferenceDeviceSize));
  appendAttribute(html, "data-content-font-reference-device-size", resolvePropertyPreview(control.contentFontReferenceDeviceSize));
  appendAttribute(html, "data-show-grid-lines", resolvePropertyPreview(control.showGridLines));
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(control.gridLineColor));
  appendAttribute(html, "data-alternating-row-background-color", resolvePropertyPreview(control.alternatingRowBackgroundColor));
  appendAttribute(html, "data-selection-background-color", resolvePropertyPreview(control.selectionBackgroundColor));
  appendAttribute(html, "data-selection-foreground-color", resolvePropertyPreview(control.selectionForegroundColor));
  html.push(' role="region" aria-label="Status/force"><table style="width: 100%; border-collapse: collapse;', content.join(""),
    '"><thead><tr><th style="', header.join(""), '">Status/force</th></tr></thead><tbody><tr><td style="', grid.join(""),
    'text-align: center;">Status/force data not loaded</td></tr></tbody></table>');
  appendStatusForceButtonAppearance(html,control,context);
  html.push("</div>");
}

function appendStatusForceButtonAppearance(html:string[],control:HmiStatusForceControl,context:HmiHtmlConvertContext):void {
  if (![control.buttonBackgroundColor, control.buttonBorderBackgroundColor, control.buttonBorderColor, control.buttonFirstGradientColor, control.buttonMiddleGradientColor, control.buttonSecondGradientColor, control.buttonBorderWidth, control.buttonCornerRadius, control.buttonEdgeStyle, control.buttonBackFillStyle, control.buttonFirstGradientOffset, control.buttonSecondGradientOffset, control.useButtonFirstGradient, control.useButtonSecondGradient].some(value=>value!==undefined)) return;
  html.push('<div data-appearance-sample="button" data-preview="appearance"');
  appendAttribute(html,"data-button-background-color",resolvePropertyPreview(control.buttonBackgroundColor));
  appendAttribute(html,"data-button-border-background-color",resolvePropertyPreview(control.buttonBorderBackgroundColor));
  appendAttribute(html,"data-button-border-color",resolvePropertyPreview(control.buttonBorderColor));
  appendAttribute(html,"data-button-first-gradient-color",resolvePropertyPreview(control.buttonFirstGradientColor));
  appendAttribute(html,"data-button-middle-gradient-color",resolvePropertyPreview(control.buttonMiddleGradientColor));
  appendAttribute(html,"data-button-second-gradient-color",resolvePropertyPreview(control.buttonSecondGradientColor));
  appendAttribute(html,"data-button-border-width",resolvePropertyPreview(control.buttonBorderWidth));
  appendAttribute(html,"data-button-corner-radius",resolvePropertyPreview(control.buttonCornerRadius));
  appendAttribute(html,"data-button-edge-style",resolvePropertyPreview(control.buttonEdgeStyle));
  appendAttribute(html,"data-button-back-fill-style",resolvePropertyPreview(control.buttonBackFillStyle));
  appendAttribute(html,"data-button-first-gradient-offset",resolvePropertyPreview(control.buttonFirstGradientOffset));
  appendAttribute(html,"data-button-second-gradient-offset",resolvePropertyPreview(control.buttonSecondGradientOffset));
  appendAttribute(html,"data-use-button-first-gradient",resolvePropertyPreview(control.useButtonFirstGradient));
  appendAttribute(html,"data-use-button-second-gradient",resolvePropertyPreview(control.useButtonSecondGradient));
  const button=["padding: 2px 4px;"];
  appendColorStyle(button,"background-color",control.buttonBackgroundColor);
  appendColorStyle(button,"border-color",control.buttonBorderColor);
  appendHeaderBorderWidth(button,control.buttonBorderWidth);
  const radius=getStaticValue(control.buttonCornerRadius);
  if(radius!==undefined&&Number.isFinite(radius)&&radius>=0)button.push(`border-radius: ${toCss(radius)}px;`);
  appendColorGradientStyle(button,createColorGradient({backgroundColor:control.buttonBackgroundColor,firstGradientColor:control.buttonFirstGradientColor,firstGradientOffset:control.buttonFirstGradientOffset,middleGradientColor:control.buttonMiddleGradientColor,secondGradientColor:control.buttonSecondGradientColor,secondGradientOffset:control.buttonSecondGradientOffset,useFirstGradient:control.useButtonFirstGradient,useSecondGradient:control.useButtonSecondGradient}));
  html.push(' style="',button.join(""),'">Status/force button appearance preview</div>');
}

function appendRecipeControl(html: string[], recipeControl: HmiRecipeControl, context: HmiHtmlConvertContext): void {
  const showHeader = recipeControl.showHeader === undefined || getStaticValue(recipeControl.showHeader) === true;
  const showFooter = getStaticValue(recipeControl.showFooter) === true;
  const defaultRecipeName = getStaticValue(recipeControl.defaultRecipeName) ?? "";
  const headerStyle = createRecipeHeaderStyle(recipeControl, context);
  const contentStyle = createRecipeContentStyle(recipeControl, context);

  const cellStyle: string[] = [recipeControl.showGridLines && !getStaticValue(recipeControl.showGridLines) ? "border: 0;" : "border: 1px solid currentColor;"];
  appendColorStyle(cellStyle, "border-color", recipeControl.gridLineColor);
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
  appendAttribute(html, "data-header-border-width", resolvePropertyPreview(recipeControl.headerBorderWidth));
  appendAttribute(html, "data-header-corner-radius", resolvePropertyPreview(recipeControl.headerCornerRadius));
  appendAttribute(html, "data-header-border-background-color", resolvePropertyPreview(recipeControl.headerBorderBackgroundColor));
  appendAttribute(html, "data-header-back-fill-style", resolvePropertyPreview(recipeControl.headerBackFillStyle));
  appendAttribute(html, "data-header-edge-style", resolvePropertyPreview(recipeControl.headerEdgeStyle));
  appendAttribute(html, "data-header-first-gradient-color", resolvePropertyPreview(recipeControl.headerFirstGradientColor));
  appendAttribute(html, "data-header-middle-gradient-color", resolvePropertyPreview(recipeControl.headerMiddleGradientColor));
  appendAttribute(html, "data-header-second-gradient-color", resolvePropertyPreview(recipeControl.headerSecondGradientColor));
  appendAttribute(html, "data-header-first-gradient-offset", resolvePropertyPreview(recipeControl.headerFirstGradientOffset));
  appendAttribute(html, "data-header-second-gradient-offset", resolvePropertyPreview(recipeControl.headerSecondGradientOffset));
  appendAttribute(html, "data-use-header-first-gradient", resolvePropertyPreview(recipeControl.useHeaderFirstGradient));
  appendAttribute(html, "data-use-header-second-gradient", resolvePropertyPreview(recipeControl.useHeaderSecondGradient));
  appendAttribute(html, "data-word-wrap", resolvePropertyPreview(recipeControl.wordWrap));
  appendAttribute(html, "data-button-background-color", resolvePropertyPreview(recipeControl.buttonBackgroundColor));
  appendAttribute(html, "data-button-border-background-color", resolvePropertyPreview(recipeControl.buttonBorderBackgroundColor));
  appendAttribute(html, "data-button-border-color", resolvePropertyPreview(recipeControl.buttonBorderColor));
  appendAttribute(html, "data-button-first-gradient-color", resolvePropertyPreview(recipeControl.buttonFirstGradientColor));
  appendAttribute(html, "data-button-middle-gradient-color", resolvePropertyPreview(recipeControl.buttonMiddleGradientColor));
  appendAttribute(html, "data-button-second-gradient-color", resolvePropertyPreview(recipeControl.buttonSecondGradientColor));
  appendAttribute(html, "data-button-border-width", resolvePropertyPreview(recipeControl.buttonBorderWidth));
  appendAttribute(html, "data-button-corner-radius", resolvePropertyPreview(recipeControl.buttonCornerRadius));
  appendAttribute(html, "data-button-edge-style", resolvePropertyPreview(recipeControl.buttonEdgeStyle));
  appendAttribute(html, "data-button-back-fill-style", resolvePropertyPreview(recipeControl.buttonBackFillStyle));
  appendAttribute(html, "data-button-first-gradient-offset", resolvePropertyPreview(recipeControl.buttonFirstGradientOffset));
  appendAttribute(html, "data-button-second-gradient-offset", resolvePropertyPreview(recipeControl.buttonSecondGradientOffset));
  appendAttribute(html, "data-use-button-first-gradient", resolvePropertyPreview(recipeControl.useButtonFirstGradient));
  appendAttribute(html, "data-use-button-second-gradient", resolvePropertyPreview(recipeControl.useButtonSecondGradient));
  appendAttribute(html, "data-textual-objects-border-background-color", resolvePropertyPreview(recipeControl.textualObjectsBorderBackgroundColor));
  appendAttribute(html, "data-textual-objects-border-color", resolvePropertyPreview(recipeControl.textualObjectsBorderColor));
  appendAttribute(html, "data-textual-objects-border-width", resolvePropertyPreview(recipeControl.textualObjectsBorderWidth));
  appendAttribute(html, "data-textual-objects-corner-radius", resolvePropertyPreview(recipeControl.textualObjectsCornerRadius));
  appendAttribute(html, "data-textual-objects-edge-style", resolvePropertyPreview(recipeControl.textualObjectsEdgeStyle));
  const buttonPreview = createRecipeButtonPreviewStyle(recipeControl);
  if (buttonPreview.length > 0) appendAttribute(html, "data-button-preview-style", buttonPreview);
  appendAttribute(html, "data-enable-recipe-dialog", resolvePropertyPreview(recipeControl.enableRecipeDialog));
  appendAttribute(html, "data-show-grid-lines", resolvePropertyPreview(recipeControl.showGridLines));
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(recipeControl.gridLineColor));
  appendAttribute(html, "data-show-status-bar", resolvePropertyPreview(recipeControl.showStatusBar));
  appendAttribute(html, "data-show-numbers", resolvePropertyPreview(recipeControl.showNumbers));
  appendAttribute(html, "data-selection-background-color", resolvePropertyPreview(recipeControl.selectionBackgroundColor));
  appendAttribute(html, "data-selection-foreground-color", resolvePropertyPreview(recipeControl.selectionForegroundColor));
  appendAttribute(html, "data-alternating-row-background-color", resolvePropertyPreview(recipeControl.alternatingRowBackgroundColor));
  html.push(">");

  if (recipeControl.viewKind === HmiRecipeViewKind.Selector) {
    if (showHeader)
      html.push("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px;", headerStyle, "\">Recipe selector</div>");
    html.push(
      "<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;", contentStyle, "\">",
      createRecipeSelectorTextPreview(recipeControl, defaultRecipeName),
      "</div>",
    );
  } else {
    const visibleColumns = recipeControl.columnDefinitions.filter(
      (column) => column.visible === undefined || getStaticValue(column.visible) === true,
    );
    html.push(recipeControl.alternatingRowBackgroundColor === undefined ? "<table" : '<table class="hmi-recipe-table"');
    html.push(" style=\"width: 100%; border-collapse: collapse; table-layout: fixed;", contentStyle, "\"><colgroup>");
    for (const column of visibleColumns) {
      html.push("<col");
      const width = getStaticValue(column.width);
      if (width !== undefined && Number.isFinite(width) && width >= 0)
        appendAttribute(html, "style", `width: ${toCss(width)}px;`);
      html.push(">");
    }
    html.push("</colgroup>");
    if (showHeader) {
      html.push("<thead><tr>");
      for (const column of visibleColumns) {
        html.push("<th style=\"", cellStyle.join(""), "overflow: hidden; text-overflow: ellipsis;", headerStyle, "\"");
        appendAttribute(html, "data-column-type", column.type);
        html.push(">", escapeHtml(column.headerText?.getText(context.options.cultureLcid) ?? column.type), "</th>");
      }
      html.push("</tr></thead>");
    }
    html.push("<tbody><tr><td");
    appendAttribute(html, "colspan", Math.max(visibleColumns.length, 1).toString());
    html.push(" style=\"", recipeControl.showGridLines || recipeControl.gridLineColor ? cellStyle.join("") : "", "text-align: center;\">Recipe data not loaded</td></tr></tbody></table>");
  }

  appendRecipeSelectionPreview(html, recipeControl, context);

  if (recipeControl.showStatusBar && getStaticValue(recipeControl.showStatusBar)) {
    const statusStyle = ["flex: 0 0 auto; padding: 2px 4px;"];
    if (recipeControl.statusBarFont !== undefined) appendFont(statusStyle, recipeControl.statusBarFont.getForCulture(context.options.cultureLcid));
    html.push('<div class="hmi-recipe-status-bar" style="', statusStyle.join(""), '">Recipe status not loaded</div>');
  }

  if (showFooter)
    html.push("<div style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;\">Recipe control</div>");
  html.push("</div>");
}

function appendRecipeSelectionPreview(html: string[], control: HmiRecipeControl, context: HmiHtmlConvertContext): void {
  if (control.selectionBackgroundColor === undefined && control.selectionForegroundColor === undefined) return;
  const style = ["flex: 0 0 auto; padding: 2px 4px;"];
  appendColorStyle(style, "background-color", control.selectionBackgroundColor);
  appendColorStyle(style, "color", control.selectionForegroundColor);
  if (control.contentFont !== undefined) appendFont(style, control.contentFont.getForCulture(context.options.cultureLcid));
  html.push('<div class="hmi-recipe-selection-preview" data-preview="appearance" style="', style.join(""), '">Selection appearance preview</div>');
}

function createRecipeButtonPreviewStyle(control: HmiRecipeControl): string {
  const style: string[] = [];
  appendColorStyle(style, "background-color", control.buttonBackgroundColor);
  appendColorStyle(style, "border-color", control.buttonBorderColor);
  appendHeaderBorderWidth(style, control.buttonBorderWidth);
  const radius = getStaticValue(control.buttonCornerRadius);
  if (radius !== undefined && radius >= 0) style.push(`border-radius: ${toCss(radius)}px;`);
  appendColorGradientStyle(style, createColorGradient({
    backgroundColor: control.buttonBackgroundColor, firstGradientColor: control.buttonFirstGradientColor, firstGradientOffset: control.buttonFirstGradientOffset,
    middleGradientColor: control.buttonMiddleGradientColor, secondGradientColor: control.buttonSecondGradientColor, secondGradientOffset: control.buttonSecondGradientOffset,
    useFirstGradient: control.useButtonFirstGradient, useSecondGradient: control.useButtonSecondGradient,
  }));
  return style.join("");
}

function createRecipeSelectorTextPreview(control: HmiRecipeControl, text: string): string {
  const style: string[] = [];
  appendColorStyle(style, "border-color", control.textualObjectsBorderColor);
  appendHeaderBorderWidth(style, control.textualObjectsBorderWidth);
  const radius = getStaticValue(control.textualObjectsCornerRadius);
  if (radius !== undefined && radius >= 0) style.push(`border-radius: ${toCss(radius)}px;`);
  if (style.length === 0) return escapeHtml(text);
  return `<span data-recipe-selector-text="true" style="${style.join("")}">${escapeHtml(text)}</span>`;
}

function createRecipeHeaderStyle(recipeControl: HmiRecipeControl, context: HmiHtmlConvertContext): string {
  const style: string[] = [];
  appendColorStyle(style, "background-color", recipeControl.headerBackgroundColor);
  appendColorGradientStyle(style, createColorGradient({
    backgroundColor: recipeControl.headerBackgroundColor, firstGradientColor: recipeControl.headerFirstGradientColor, firstGradientOffset: recipeControl.headerFirstGradientOffset,
    middleGradientColor: recipeControl.headerMiddleGradientColor, secondGradientColor: recipeControl.headerSecondGradientColor, secondGradientOffset: recipeControl.headerSecondGradientOffset,
    useFirstGradient: recipeControl.useHeaderFirstGradient, useSecondGradient: recipeControl.useHeaderSecondGradient,
  }));
  appendColorStyle(style, "color", recipeControl.headerForegroundColor);
  appendColorStyle(style, "border-color", recipeControl.headerBorderColor);
  appendHeaderBorderWidth(style, recipeControl.headerBorderWidth);
  const radius = getStaticValue(recipeControl.headerCornerRadius);
  if (radius !== undefined && Number.isFinite(radius) && radius >= 0) style.push(`border-radius: ${toCss(radius)}px;`);
  if (recipeControl.headerFont !== undefined) appendFont(style, recipeControl.headerFont.getForCulture(context.options.cultureLcid));
  return style.join("");
}

function createRecipeContentStyle(recipeControl: HmiRecipeControl, context: HmiHtmlConvertContext): string {
  const style: string[] = [];
  appendColorStyle(style, "--hmi-recipe-even-row-background", recipeControl.alternatingRowBackgroundColor);
  appendColorStyle(style, "background-color", recipeControl.contentBackgroundColor);
  appendColorStyle(style, "color", recipeControl.contentForegroundColor);
  const contentFont = recipeControl.viewKind === HmiRecipeViewKind.Selector
    ? recipeControl.comboBoxFont ?? recipeControl.contentFont : recipeControl.contentFont;
  if (contentFont !== undefined) appendFont(style, contentFont.getForCulture(context.options.cultureLcid));
  const wordWrap = getStaticValue(recipeControl.wordWrap);
  if (wordWrap !== undefined)
    style.push(wordWrap ? "white-space: normal;overflow-wrap: anywhere;" : "white-space: nowrap;");
  return style.join("");
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
  const setName = alarmControl.activeColumnSet ?? alarmControl.defaultColumnSet;
  const selectedSet = setName === undefined ? undefined : alarmControl.columnSets.find(set => set.name === setName);
  const columns = selectedSet?.columns ?? alarmControl.columnDefinitions;
  const visibleColumns = columns.filter(
    (column) => column.visible === undefined || getStaticValue(column.visible) === true,
  ).sort((left, right) => (getStaticValue(left.order) ?? 2147483647) - (getStaticValue(right.order) ?? 2147483647));

  html.push("<div");
  appendCommonAttributes(
    html,
    alarmControl,
    context,
    true,
    createAlarmControlStyle(alarmControl, context, selectedSet),
  );
  appendAttribute(html, "data-window-resizable", resolvePropertyPreview(alarmControl.resizable));
  appendAttribute(html, "data-window-movable", resolvePropertyPreview(alarmControl.movable));
  appendAttribute(html, "data-window-closeable", resolvePropertyPreview(alarmControl.closeable));
  appendAttribute(html, "data-header-background-color", resolvePropertyPreview(alarmControl.headerBackgroundColor));
  appendAttribute(html, "data-header-foreground-color", resolvePropertyPreview(alarmControl.headerForegroundColor));
  appendAttribute(html, "data-header-border-color", resolvePropertyPreview(alarmControl.headerBorderColor));
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(alarmControl.showToolbar));
  appendAttribute(html, "data-toolbar-background-color", resolvePropertyPreview(alarmControl.toolbarBackgroundColor));
  appendAttribute(html, "data-use-toolbar-background-color", resolvePropertyPreview(alarmControl.useToolbarBackgroundColor));
  appendAttribute(html, "data-toolbar-foreground-color", resolvePropertyPreview(alarmControl.toolbarForegroundColor));
  appendAttribute(html, "data-view-kind", alarmControl.viewKind);
  appendAttribute(html, "data-active-column-set", alarmControl.activeColumnSet);
  appendAttribute(html, "data-default-column-set", alarmControl.defaultColumnSet);
  appendAttribute(html, "data-list-mode", listMode);
  appendAttribute(html, "data-time-base", resolvePropertyPreview(alarmControl.timeBase));
  appendAttribute(html, "data-shorten-cell-contents", resolvePropertyPreview(alarmControl.shortenCellContents));
  appendAttribute(html, "data-shorten-column-titles", resolvePropertyPreview(alarmControl.shortenColumnTitles));
  appendAttribute(html, "data-cell-padding-top", resolvePropertyPreview(alarmControl.cellPaddingTop));
  appendAttribute(html, "data-cell-padding-right", resolvePropertyPreview(alarmControl.cellPaddingRight));
  appendAttribute(html, "data-cell-padding-bottom", resolvePropertyPreview(alarmControl.cellPaddingBottom));
  appendAttribute(html, "data-cell-padding-left", resolvePropertyPreview(alarmControl.cellPaddingLeft));
  appendAttribute(html, "data-number-of-rows", resolvePropertyPreview(alarmControl.numberOfRows));
  appendAttribute(html, "data-lines-per-alarm", resolvePropertyPreview(alarmControl.linesPerAlarm));
  appendAttribute(html, "data-use-project-settings", resolvePropertyPreview(alarmControl.useProjectSettings));
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
  appendAttribute(html, "data-use-status-bar-background-color", resolvePropertyPreview(alarmControl.useStatusBarBackgroundColor));
  appendAttribute(html, "data-status-bar-text", alarmControl.statusBarText?.getText(context.options.cultureLcid), true);
  appendAttribute(html, "data-show-status-bar-tooltips", resolvePropertyPreview(alarmControl.showStatusBarTooltips));
  appendAttribute(html, "data-status-bar-foreground-color", resolvePropertyPreview(alarmControl.statusBarForegroundColor));
  if (alarmControl.messageBlocks.length > 0) appendAttribute(html, "data-message-block-count", String(alarmControl.messageBlocks.length));
  html.push(">");
  appendAlarmMessageBlocks(html, alarmControl, context);
  const configuredViews = alarmControl.columnSets.filter(set => set.allowSort !== undefined || set.allowFilter !== undefined || set.allowColumnReorder !== undefined || set.allowColumnResize !== undefined ||
    set.backgroundColor !== undefined || set.foregroundColor !== undefined || set.headerBackgroundColor !== undefined ||
    set.headerForegroundColor !== undefined || set.headerBorderColor !== undefined || set.contentFont !== undefined || set.headerFont !== undefined ||
    set.gridLineColor !== undefined || set.gridLineWidth !== undefined || set.gridLineVisibility !== undefined || set.rowHeight !== undefined ||
    set.cellPaddingLeft !== undefined || set.cellPaddingTop !== undefined || set.cellPaddingRight !== undefined || set.cellPaddingBottom !== undefined ||
    set.horizontalScrollBarVisibility !== undefined || set.verticalScrollBarVisibility !== undefined || set.gridSelectionMode !== undefined || set.selectFullRow !== undefined);
  if (configuredViews.length > 0) {
    html.push('<template class="hmi-alarm-view-settings">');
    for (const set of configuredViews) {
      html.push("<div");
      appendAlarmViewSettings(html, set, context);
      html.push("></div>");
    }
    html.push("</template>");
  }

  if (showTitle) {
    const title = resolveAlarmTitle(alarmControl, listMode, context);
    html.push("<div style=\"", createAlarmHeaderStyle(alarmControl, context));
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
  html.push('"');
  appendAlarmViewSettings(html, selectedSet, context);
  html.push(" style=\"", createAlarmTableStyle(alarmControl, selectedSet, context), "\">");
  if (visibleColumns.length > 0) {
    html.push("<colgroup>");
    for (const column of visibleColumns) {
      html.push("<col");
      appendAttribute(html, "data-column-type", column.type);
      appendAttribute(html, "data-column-source-type", column.sourceType);
      appendAttribute(html, "data-allow-sort", resolvePropertyPreview(column.allowSort));
      appendAttribute(html, "data-sort-order", resolvePropertyPreview(column.sortOrder));
      appendAttribute(html, "data-sort-direction", resolvePropertyPreview(column.sortDirection));
      appendAttribute(html, "data-minimum-width", resolvePropertyPreview(column.minimumWidth));
      appendAttribute(html, "data-maximum-width", resolvePropertyPreview(column.maximumWidth));
      appendAttribute(html, "data-output-format", resolvePropertyPreview(column.outputFormat), true);
      appendAttribute(html, "data-header-horizontal-alignment", resolvePropertyPreview(column.headerHorizontalAlignment));
      appendAttribute(html, "data-header-vertical-alignment", resolvePropertyPreview(column.headerVerticalAlignment));
      appendAttribute(html, "data-content-horizontal-alignment", resolvePropertyPreview(column.contentHorizontalAlignment));
      appendAttribute(html, "data-content-vertical-alignment", resolvePropertyPreview(column.contentVerticalAlignment));
      appendAttribute(html, "data-width", resolvePropertyPreview(column.width));
      appendAttribute(html, "data-auto-size", resolvePropertyPreview(column.autoSize));
      const width = getStaticValue(column.width);
      if (getStaticValue(column.autoSize) !== true && width !== undefined && Number.isFinite(width) && width >= 0)
        appendAttribute(html, "style", `width: ${toCss(width)}px;`);
      html.push(">");
    }
    html.push("</colgroup>");
  }
  const gridCellStyle = createAlarmGridCellStyle(alarmControl, selectedSet);
  if (showHeader && (visibleColumns.length > 0 || columns.length === 0)) {
    const headerCellStyle = createAlarmTableHeaderCellStyle(alarmControl, gridCellStyle, context, selectedSet);
    html.push("<thead><tr>");
    if (visibleColumns.length === 0)
      html.push("<th style=\"", headerCellStyle, "\">", escapeHtml(resolveAlarmViewLabel(alarmControl.viewKind)), "</th>");
    for (const column of visibleColumns) {
      html.push("<th style=\"", headerCellStyle, alarmControl.shortenColumnTitles === undefined
        ? "overflow: hidden; text-overflow: ellipsis;" : "");
      const width = getStaticValue(column.width);
      if (getStaticValue(column.autoSize) !== true && width !== undefined && Number.isFinite(width) && width >= 0)
        html.push(`width: ${toCss(width)}px;`);
      const alignment = getStaticValue(column.headerHorizontalAlignment ?? column.alignment);
      if (alignment !== undefined) html.push(`text-align: ${horizontalAlignmentToCss(alignment)};`);
      const vertical = getStaticValue(column.headerVerticalAlignment);
      if (vertical !== undefined && vertical !== HmiVerticalAlignment.Stretch)
        html.push(`vertical-align: ${vertical === HmiVerticalAlignment.Top ? "top" : vertical === HmiVerticalAlignment.Bottom ? "bottom" : "middle"};`);
      html.push('"');
      appendAttribute(html, "data-column-type", column.type);
      appendAttribute(html, "data-column-source-type", column.sourceType);
      appendAttribute(html, "data-allow-sort", resolvePropertyPreview(column.allowSort));
      appendAttribute(html, "data-sort-order", resolvePropertyPreview(column.sortOrder));
      appendAttribute(html, "data-sort-direction", resolvePropertyPreview(column.sortDirection));
      appendAttribute(html, "data-minimum-width", resolvePropertyPreview(column.minimumWidth));
      appendAttribute(html, "data-maximum-width", resolvePropertyPreview(column.maximumWidth));
      appendAttribute(html, "data-output-format", resolvePropertyPreview(column.outputFormat), true);
      appendAttribute(html, "data-header-horizontal-alignment", resolvePropertyPreview(column.headerHorizontalAlignment));
      appendAttribute(html, "data-header-vertical-alignment", resolvePropertyPreview(column.headerVerticalAlignment));
      appendAttribute(html, "data-content-horizontal-alignment", resolvePropertyPreview(column.contentHorizontalAlignment));
      appendAttribute(html, "data-content-vertical-alignment", resolvePropertyPreview(column.contentVerticalAlignment));
      appendAttribute(html, "data-sort-mode", resolvePropertyPreview(column.sortMode));
      appendAttribute(html, "data-sort-index", resolvePropertyPreview(column.sortIndex));
      appendAttribute(html, "data-decimal-places", resolvePropertyPreview(column.decimalPlaces));
      appendAttribute(html, "data-leading-zeros", resolvePropertyPreview(column.leadingZeros));
      appendAttribute(html, "data-automatic-decimal-places", resolvePropertyPreview(column.automaticDecimalPlaces));
      appendAttribute(html, "data-exponential-format", resolvePropertyPreview(column.exponentialFormat));
      appendAttribute(html, "data-time-format", column.timeAndDateFormat);
      appendAttribute(html, "data-date-format", column.dateFormat, true);
      appendAttribute(html, "data-time-format-pattern", column.timeFormat, true);
      appendAttribute(html, "data-show-date", resolvePropertyPreview(column.showDate));
      appendAttribute(html, "data-symbol", column.symbol);
      html.push(">", escapeHtml(column.headerText?.getDisplayText(context.options.cultureLcid) ?? column.sourceType ?? column.type), "</th>");
    }
    html.push("</tr></thead>");
  }
  html.push("<tbody><tr><td");
  appendAttribute(html, "colspan", Math.max(visibleColumns.length, 1).toString());
  html.push(" style=\"text-align: center;", gridCellStyle, createAlarmShorteningStyle(alarmControl.shortenCellContents));
  appendColorStyle(html, "background-color", alarmControl.selectionBackgroundColor);
  appendColorStyle(html, "color", alarmControl.selectionForegroundColor);
  appendAlarmSelectionRectangleStyle(html, alarmControl);
  appendColorStyle(html, "background-color", selectedSet?.backgroundColor);
  appendColorStyle(html, "color", selectedSet?.foregroundColor);
  const rowHeight = getStaticValue(selectedSet?.rowHeight);
  if (rowHeight !== undefined && Number.isFinite(rowHeight) && rowHeight >= 0)
    html.push(rowHeight === 0 ? "height: auto;" : `height: ${toCss(rowHeight)}px;`);
  html.push("\">Alarm data not loaded</td></tr></tbody></table>");

  const showAcknowledgeButton = getStaticValue(alarmControl.showAcknowledgeButton) === true;
  const showHelpButton = getStaticValue(alarmControl.showHelpButton) === true;
  const showToolbar = getStaticValue(alarmControl.showToolbar) === true;
  if (showToolbar || showAcknowledgeButton || showHelpButton) {
    const toolbarStyle = ["flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;"];
    if (alarmControl.useToolbarBackgroundColor === undefined || getStaticValue(alarmControl.useToolbarBackgroundColor) === true)
      appendColorStyle(toolbarStyle, "background-color", alarmControl.toolbarBackgroundColor);
    appendToolbarFontStyle(toolbarStyle, alarmControl.toolbarFont?.getForCulture(context.options.cultureLcid));
    appendColorStyle(toolbarStyle, "color", alarmControl.toolbarForegroundColor);
    html.push("<div class=\"hmi-alarm-toolbar\" role=\"toolbar\" style=\"", ...toolbarStyle, "\">");
    if (alarmControl.toolbarButtons.length) {
      for (const button of alarmControl.toolbarButtons.filter(button => getStaticValue(button.visible) !== false)
        .sort((left, right) => (getStaticValue(left.order) ?? 2147483647) - (getStaticValue(right.order) ?? 2147483647))) {
        html.push('<button type="button" disabled');
        appendAttribute(html, "data-button-type", button.sourceType ?? button.type);
        appendAttribute(html, "data-enabled", resolvePropertyPreview(button.enabled));
        appendAttribute(html, "title", button.tooltip?.getDisplayText(context.options.cultureLcid));
        html.push(">", escapeHtml(button.caption?.getDisplayText(context.options.cultureLcid) ?? button.sourceType ?? button.type), "</button>");
      }
    } else {
      if (showAcknowledgeButton)
        html.push("Acknowledge");
      if (showAcknowledgeButton && showHelpButton)
        html.push(" · ");
      if (showHelpButton)
        html.push("Help");
      if (!showAcknowledgeButton && !showHelpButton)
        html.push("Toolbar");
    }
    html.push("</div>");
  }
  if (getStaticValue(alarmControl.showStatusBar) === true) {
    const statusStyle = ["flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;"];
    if (alarmControl.useStatusBarBackgroundColor === undefined || getStaticValue(alarmControl.useStatusBarBackgroundColor) === true)
      appendColorStyle(statusStyle, "background-color", alarmControl.statusBarBackgroundColor);
    appendColorStyle(statusStyle, "color", alarmControl.statusBarForegroundColor);
    if (alarmControl.statusBarFont !== undefined)
      appendFont(statusStyle, alarmControl.statusBarFont.getForCulture(context.options.cultureLcid));
    html.push("<div class=\"hmi-alarm-status-bar\" role=\"status\" style=\"", ...statusStyle, "\">");
    if (!alarmControl.statusBarPanels.length)
      html.push(escapeHtml(alarmControl.statusBarText?.getText(context.options.cultureLcid) ?? "Status"));
    for (const panel of alarmControl.statusBarPanels.filter(panel => getStaticValue(panel.visible) !== false)
      .sort((left, right) => (getStaticValue(left.order) ?? 2147483647) - (getStaticValue(right.order) ?? 2147483647))) {
      html.push('<span class="hmi-alarm-status-panel" style="display:inline-block;');
      const width = getStaticValue(panel.width);
      if (getStaticValue(panel.autoSize) !== true && width !== undefined && Number.isFinite(width) && width >= 0)
        html.push(`width: ${toCss(width)}px;`);
      html.push('"');
      appendAttribute(html, "data-panel-type", panel.sourceType ?? panel.type);
      if (alarmControl.showStatusBarTooltips === undefined || getStaticValue(alarmControl.showStatusBarTooltips) === true)
        appendAttribute(html, "title", panel.tooltip?.getDisplayText(context.options.cultureLcid));
      html.push(">", escapeHtml(panel.text?.getDisplayText(context.options.cultureLcid) ?? panel.sourceType ?? panel.type), "</span>");
    }
    html.push("</div>");
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

function appendProcessDiagnosisControl(html: string[], item: HmiScreenItemBase, kind: string, label: string, context: HmiHtmlConvertContext): void {
  if (item instanceof HmiProcessDiagnosisPlcCodeViewerControl) {
    appendPlcCodeViewerControl(html, item, context);
    return;
  }
  if (item instanceof HmiProcessDiagnosisOverviewControl) {
    appendProcessDiagnosisOverviewControl(html, item, context);
    return;
  }
  if (item instanceof HmiProcessDiagnosisCriteriaAnalysisControl) {
    appendCriteriaAnalysisControl(html, item, context);
    return;
  }
  html.push("<div");
  appendCommonAttributes(html, item, context, true, "display: grid; place-items: center; overflow: hidden;");
  appendAttribute(html, "data-process-diagnosis-kind", kind);
  appendAttribute(html, "role", "region");
  appendAttribute(html, "aria-label", label);
  html.push(">", escapeHtml(label), " data not loaded</div>");
}

function appendPlcCodeViewerControl(html: string[], control: HmiProcessDiagnosisPlcCodeViewerControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, control, context, true, "display: flex; flex-direction: column; overflow: hidden;");
  appendAttribute(html, "data-process-diagnosis-kind", "PlcCodeViewer");
  appendAttribute(html, "data-preview", "appearance");
  appendAttribute(html, "data-header-background-color", resolvePropertyPreview(control.headerBackgroundColor));
  appendAttribute(html, "data-header-foreground-color", resolvePropertyPreview(control.headerForegroundColor));
  appendAttribute(html, "data-header-border-color", resolvePropertyPreview(control.headerBorderColor));
  appendAttribute(html, "data-header-border-width", resolvePropertyPreview(control.headerBorderWidth));
  appendAttribute(html, "data-content-background-color", resolvePropertyPreview(control.contentBackgroundColor));
  appendAttribute(html, "data-content-foreground-color", resolvePropertyPreview(control.contentForegroundColor));
  appendAttribute(html, "data-drawing-area-background-color", resolvePropertyPreview(control.drawingAreaBackgroundColor));
  appendAttribute(html, "data-drawing-area-foreground-color", resolvePropertyPreview(control.drawingAreaForegroundColor));
  appendAttribute(html, "data-path-header-background-color", resolvePropertyPreview(control.pathHeaderBackgroundColor));
  appendAttribute(html, "data-path-header-foreground-color", resolvePropertyPreview(control.pathHeaderForegroundColor));
  appendAttribute(html, "data-show-grid-lines", resolvePropertyPreview(control.showGridLines));
  appendAttribute(html, "data-alternating-row-background-color", resolvePropertyPreview(control.alternatingRowBackgroundColor));
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(control.gridLineColor));
  appendAttribute(html, "data-toolbar-background-color", resolvePropertyPreview(control.toolbarBackgroundColor));
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(control.showToolbar));
  appendAttribute(html, "data-use-toolbar-background-color", resolvePropertyPreview(control.useToolbarBackgroundColor));
  appendAttribute(html, "data-toolbar-alignment", resolvePropertyPreview(control.toolbarAlignment));
  appendAttribute(html, "data-button-background-color", resolvePropertyPreview(control.buttonBackgroundColor));
  appendAttribute(html, "data-button-border-background-color", resolvePropertyPreview(control.buttonBorderBackgroundColor));
  appendAttribute(html, "data-button-border-color", resolvePropertyPreview(control.buttonBorderColor));
  appendAttribute(html, "data-button-first-gradient-color", resolvePropertyPreview(control.buttonFirstGradientColor));
  appendAttribute(html, "data-button-middle-gradient-color", resolvePropertyPreview(control.buttonMiddleGradientColor));
  appendAttribute(html, "data-button-second-gradient-color", resolvePropertyPreview(control.buttonSecondGradientColor));
  appendAttribute(html, "data-button-border-width", resolvePropertyPreview(control.buttonBorderWidth));
  appendAttribute(html, "data-button-corner-radius", resolvePropertyPreview(control.buttonCornerRadius));
  appendAttribute(html, "data-button-edge-style", resolvePropertyPreview(control.buttonEdgeStyle));
  appendAttribute(html, "data-button-back-fill-style", resolvePropertyPreview(control.buttonBackFillStyle));
  appendAttribute(html, "data-button-first-gradient-offset", resolvePropertyPreview(control.buttonFirstGradientOffset));
  appendAttribute(html, "data-button-second-gradient-offset", resolvePropertyPreview(control.buttonSecondGradientOffset));
  appendAttribute(html, "data-use-button-first-gradient", resolvePropertyPreview(control.useButtonFirstGradient));
  appendAttribute(html, "data-use-button-second-gradient", resolvePropertyPreview(control.useButtonSecondGradient));
  appendAttribute(html, "data-header-border-background-color", resolvePropertyPreview(control.headerBorderBackgroundColor));
  appendAttribute(html, "data-header-corner-radius", resolvePropertyPreview(control.headerCornerRadius));
  appendAttribute(html, "data-header-back-fill-style", resolvePropertyPreview(control.headerBackFillStyle));
  appendAttribute(html, "data-header-edge-style", resolvePropertyPreview(control.headerEdgeStyle));
  appendAttribute(html, "data-header-first-gradient-color", resolvePropertyPreview(control.headerFirstGradientColor));
  appendAttribute(html, "data-header-middle-gradient-color", resolvePropertyPreview(control.headerMiddleGradientColor));
  appendAttribute(html, "data-header-second-gradient-color", resolvePropertyPreview(control.headerSecondGradientColor));
  appendAttribute(html, "data-header-first-gradient-offset", resolvePropertyPreview(control.headerFirstGradientOffset));
  appendAttribute(html, "data-header-second-gradient-offset", resolvePropertyPreview(control.headerSecondGradientOffset));
  appendAttribute(html, "data-use-header-first-gradient", resolvePropertyPreview(control.useHeaderFirstGradient));
  appendAttribute(html, "data-use-header-second-gradient", resolvePropertyPreview(control.useHeaderSecondGradient));
  html.push(' role="region" aria-label="PLC code viewer"><div>PLC code viewer appearance preview; PLC code viewer data not loaded</div>');
  const sample = (kind: string, label: string, background: HmiProperty<HmiColor> | undefined, foreground: HmiProperty<HmiColor> | undefined, additionalStyle = "", font?: HmiFont) => {
    const style = ["padding: 2px 4px;"];
    appendColorStyle(style, "background-color", background);
    appendColorStyle(style, "color", foreground);
    if (font) appendFont(style, font.getForCulture(context.options.cultureLcid));
    style.push(additionalStyle);
    html.push('<div data-appearance-sample="', kind, '" style="', style.join(""), '">', label, "</div>");
  };
  sample("path-header", "Path header appearance", control.pathHeaderBackgroundColor, control.pathHeaderForegroundColor);
  sample("drawing", "Drawing area appearance", control.drawingAreaBackgroundColor, control.drawingAreaForegroundColor, "", control.contentFont);
  const header: string[] = [];
  appendColorStyle(header, "border-color", control.headerBorderColor);
  appendHeaderBorderWidth(header, control.headerBorderWidth);
  const headerRadius = getStaticValue(control.headerCornerRadius);
  if (headerRadius !== undefined && Number.isFinite(headerRadius) && headerRadius >= 0) header.push(`border-radius: ${toCss(headerRadius)}px;`);
  appendColorGradientStyle(header, createColorGradient({
    backgroundColor: control.headerBackgroundColor, firstGradientColor: control.headerFirstGradientColor, firstGradientOffset: control.headerFirstGradientOffset,
    middleGradientColor: control.headerMiddleGradientColor, secondGradientColor: control.headerSecondGradientColor, secondGradientOffset: control.headerSecondGradientOffset,
    useFirstGradient: control.useHeaderFirstGradient, useSecondGradient: control.useHeaderSecondGradient,
  }));
  sample("table-header", "Table header appearance", control.headerBackgroundColor, control.headerForegroundColor, header.join(""), control.headerFont);
  const grid: string[] = [];
  if (getStaticValue(control.showGridLines)) {
    grid.push("border-bottom: 1px solid currentColor;");
    appendColorStyle(grid, "border-bottom-color", control.gridLineColor);
  }
  sample("content", "Table content appearance", control.contentBackgroundColor, control.contentForegroundColor, grid.join(""), control.contentFont);
  sample("alternate", "Alternate row appearance", control.alternatingRowBackgroundColor ?? control.contentBackgroundColor, control.contentForegroundColor, grid.join(""), control.contentFont);
  if (getStaticValue(control.showToolbar) !== false)
    sample("toolbar", "Toolbar background appearance", getStaticValue(control.useToolbarBackgroundColor) !== false ? control.toolbarBackgroundColor : undefined, undefined);
  const button: string[] = [];
  appendColorStyle(button, "background-color", control.buttonBackgroundColor);
  appendColorStyle(button, "border-color", control.buttonBorderColor);
  appendHeaderBorderWidth(button, control.buttonBorderWidth);
  const radius = getStaticValue(control.buttonCornerRadius);
  if (radius !== undefined && Number.isFinite(radius) && radius >= 0) button.push(`border-radius: ${toCss(radius)}px;`);
  appendColorGradientStyle(button, createColorGradient({
    backgroundColor: control.buttonBackgroundColor, firstGradientColor: control.buttonFirstGradientColor, firstGradientOffset: control.buttonFirstGradientOffset,
    middleGradientColor: control.buttonMiddleGradientColor, secondGradientColor: control.buttonSecondGradientColor, secondGradientOffset: control.buttonSecondGradientOffset,
    useFirstGradient: control.useButtonFirstGradient, useSecondGradient: control.useButtonSecondGradient,
  }));
  sample("button", "Button appearance", undefined, undefined, button.join(""));
  html.push("</div>");
}

function appendProcessDiagnosisOverviewControl(html: string[], control: HmiProcessDiagnosisOverviewControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, control, context, true, "display: flex; flex-direction: column; overflow: hidden;");
  appendAttribute(html, "data-process-diagnosis-kind", "Overview");
  appendAttribute(html, "data-preview", "appearance");
  appendAttribute(html, "data-header-background-color", resolvePropertyPreview(control.headerBackgroundColor));
  appendAttribute(html, "data-header-foreground-color", resolvePropertyPreview(control.headerForegroundColor));
  appendAttribute(html, "data-content-background-color", resolvePropertyPreview(control.contentBackgroundColor));
  appendAttribute(html, "data-content-foreground-color", resolvePropertyPreview(control.contentForegroundColor));
  appendAttribute(html, "data-output-grid-line-color", resolvePropertyPreview(control.outputGridLineColor));
  appendAttribute(html, "data-output-label-foreground-color", resolvePropertyPreview(control.outputLabelForegroundColor));
  appendAttribute(html, "data-error-icon-background-color", resolvePropertyPreview(control.errorIconBackgroundColor));
  appendAttribute(html, "data-info-icon-background-color", resolvePropertyPreview(control.infoIconBackgroundColor));
  appendAttribute(html, "data-toolbar-background-color", resolvePropertyPreview(control.toolbarBackgroundColor));
  appendAttribute(html, "data-use-toolbar-background-color", resolvePropertyPreview(control.useToolbarBackgroundColor));
  appendAttribute(html, "data-show-message-view-button", resolvePropertyPreview(control.showMessageViewButton));
  appendAttribute(html, "data-button-background-color", resolvePropertyPreview(control.buttonBackgroundColor));
  appendAttribute(html, "data-button-border-background-color", resolvePropertyPreview(control.buttonBorderBackgroundColor));
  appendAttribute(html, "data-button-border-color", resolvePropertyPreview(control.buttonBorderColor));
  appendAttribute(html, "data-button-first-gradient-color", resolvePropertyPreview(control.buttonFirstGradientColor));
  appendAttribute(html, "data-button-middle-gradient-color", resolvePropertyPreview(control.buttonMiddleGradientColor));
  appendAttribute(html, "data-button-second-gradient-color", resolvePropertyPreview(control.buttonSecondGradientColor));
  appendAttribute(html, "data-button-border-width", resolvePropertyPreview(control.buttonBorderWidth));
  appendAttribute(html, "data-button-corner-radius", resolvePropertyPreview(control.buttonCornerRadius));
  appendAttribute(html, "data-button-edge-style", resolvePropertyPreview(control.buttonEdgeStyle));
  appendAttribute(html, "data-button-back-fill-style", resolvePropertyPreview(control.buttonBackFillStyle));
  appendAttribute(html, "data-button-first-gradient-offset", resolvePropertyPreview(control.buttonFirstGradientOffset));
  appendAttribute(html, "data-button-second-gradient-offset", resolvePropertyPreview(control.buttonSecondGradientOffset));
  appendAttribute(html, "data-use-button-first-gradient", resolvePropertyPreview(control.useButtonFirstGradient));
  appendAttribute(html, "data-use-button-second-gradient", resolvePropertyPreview(control.useButtonSecondGradient));
  html.push(' role="region" aria-label="Process diagnosis overview"><div>Process diagnosis overview appearance preview; Process diagnosis data not loaded</div>');
  const sample = (kind: string, label: string, background: HmiProperty<HmiColor> | undefined, foreground: HmiProperty<HmiColor> | undefined, additionalStyle = "", font?: HmiFont) => {
    const style = ["padding: 2px 4px;"];
    appendColorStyle(style, "background-color", background);
    appendColorStyle(style, "color", foreground);
    if (font) appendFont(style, font.getForCulture(context.options.cultureLcid));
    style.push(additionalStyle);
    html.push('<div data-appearance-sample="', kind, '" style="', style.join(""), '">', label, "</div>");
  };
  sample("header", "Header appearance", control.headerBackgroundColor, control.headerForegroundColor, "", control.headerFont);
  const outputGrid: string[] = [];
  if (control.outputGridLineColor !== undefined) {
    outputGrid.push("border-bottom: 1px solid currentColor;");
    appendColorStyle(outputGrid, "border-bottom-color", control.outputGridLineColor);
  }
  sample("output", "Output appearance", control.contentBackgroundColor, control.contentForegroundColor, outputGrid.join(""), control.contentFont);
  sample("output-label", "Output label appearance", control.contentBackgroundColor, control.outputLabelForegroundColor, "", control.contentFont);
  sample("error-icon", "Error icon background", control.errorIconBackgroundColor, undefined);
  sample("info-icon", "Information icon background", control.infoIconBackgroundColor, undefined);
  sample("toolbar", "Toolbar background appearance", getStaticValue(control.useToolbarBackgroundColor) !== false ? control.toolbarBackgroundColor : undefined, undefined);
  const button: string[] = [];
  appendColorStyle(button, "background-color", control.buttonBackgroundColor);
  appendColorStyle(button, "border-color", control.buttonBorderColor);
  appendHeaderBorderWidth(button, control.buttonBorderWidth);
  const radius = getStaticValue(control.buttonCornerRadius);
  if (radius !== undefined && Number.isFinite(radius) && radius >= 0) button.push(`border-radius: ${toCss(radius)}px;`);
  appendColorGradientStyle(button, createColorGradient({
    backgroundColor: control.buttonBackgroundColor, firstGradientColor: control.buttonFirstGradientColor, firstGradientOffset: control.buttonFirstGradientOffset,
    middleGradientColor: control.buttonMiddleGradientColor, secondGradientColor: control.buttonSecondGradientColor, secondGradientOffset: control.buttonSecondGradientOffset,
    useFirstGradient: control.useButtonFirstGradient, useSecondGradient: control.useButtonSecondGradient,
  }));
  sample("button", "Button appearance", undefined, undefined, button.join(""));
  html.push("</div>");
}

function appendCriteriaAnalysisControl(html: string[], criteria: HmiProcessDiagnosisCriteriaAnalysisControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, criteria, context, true, "display: flex; flex-direction: column; overflow: hidden;");
  appendAttribute(html, "data-process-diagnosis-kind", "CriteriaAnalysis");
  appendAttribute(html, "data-header-border-background-color", resolvePropertyPreview(criteria.headerBorderBackgroundColor));
  appendAttribute(html, "data-header-corner-radius", resolvePropertyPreview(criteria.headerCornerRadius));
  appendAttribute(html, "data-header-back-fill-style", resolvePropertyPreview(criteria.headerBackFillStyle));
  appendAttribute(html, "data-header-edge-style", resolvePropertyPreview(criteria.headerEdgeStyle));
  appendAttribute(html, "data-header-first-gradient-color", resolvePropertyPreview(criteria.headerFirstGradientColor));
  appendAttribute(html, "data-header-middle-gradient-color", resolvePropertyPreview(criteria.headerMiddleGradientColor));
  appendAttribute(html, "data-header-second-gradient-color", resolvePropertyPreview(criteria.headerSecondGradientColor));
  appendAttribute(html, "data-header-first-gradient-offset", resolvePropertyPreview(criteria.headerFirstGradientOffset));
  appendAttribute(html, "data-header-second-gradient-offset", resolvePropertyPreview(criteria.headerSecondGradientOffset));
  appendAttribute(html, "data-use-header-first-gradient", resolvePropertyPreview(criteria.useHeaderFirstGradient));
  appendAttribute(html, "data-use-header-second-gradient", resolvePropertyPreview(criteria.useHeaderSecondGradient));
  appendAttribute(html, "data-show-grid-lines", resolvePropertyPreview(criteria.showGridLines));
  appendAttribute(html, "data-show-column-headings", resolvePropertyPreview(criteria.showColumnHeadings));
  appendAttribute(html, "data-grid-line-color", resolvePropertyPreview(criteria.gridLineColor));
  appendAttribute(html, "data-alternating-row-background-color", resolvePropertyPreview(criteria.alternatingRowBackgroundColor));
  html.push(' role="region" aria-label="Criteria analysis"><div>Criteria analysis appearance preview; diagnostic data not loaded</div>');
  if (criteria.showColumnHeadings === undefined || getStaticValue(criteria.showColumnHeadings)) {
    const header = ["padding: 2px 4px;"];
    appendColorStyle(header, "background-color", criteria.headerBackgroundColor);
    appendColorStyle(header, "color", criteria.headerForegroundColor);
    appendColorStyle(header, "border-color", criteria.headerBorderColor);
    const width = getStaticValue(criteria.headerBorderWidth);
    if (width !== undefined && Number.isFinite(width) && width >= 0) header.push(`border-width: ${toCss(width)}px; border-style: solid;`);
    const radius = getStaticValue(criteria.headerCornerRadius);
    if (radius !== undefined && Number.isFinite(radius) && radius >= 0) header.push(`border-radius: ${toCss(radius)}px;`);
    appendColorGradientStyle(header, createColorGradient({
      backgroundColor: criteria.headerBackgroundColor, firstGradientColor: criteria.headerFirstGradientColor, firstGradientOffset: criteria.headerFirstGradientOffset,
      middleGradientColor: criteria.headerMiddleGradientColor, secondGradientColor: criteria.headerSecondGradientColor, secondGradientOffset: criteria.headerSecondGradientOffset,
      useFirstGradient: criteria.useHeaderFirstGradient, useSecondGradient: criteria.useHeaderSecondGradient,
    }));
    if (criteria.headerFont) appendFont(header, criteria.headerFont.getForCulture(context.options.cultureLcid));
    html.push('<div data-appearance-sample="header" style="', header.join(""), '">Header appearance</div>');
  }
  for (let alternate = 0; alternate < 2; alternate++) {
    const content = ["padding: 2px 4px;"];
    appendColorStyle(content, "background-color", alternate === 1 ? criteria.alternatingRowBackgroundColor ?? criteria.contentBackgroundColor : criteria.contentBackgroundColor);
    appendColorStyle(content, "color", criteria.contentForegroundColor);
    if (criteria.contentFont) appendFont(content, criteria.contentFont.getForCulture(context.options.cultureLcid));
    if (getStaticValue(criteria.showGridLines)) {
      content.push("border-bottom: 1px solid currentColor;");
      appendColorStyle(content, "border-bottom-color", criteria.gridLineColor);
    }
    html.push('<div data-appearance-sample="', alternate === 1 ? "alternate" : "content", '" style="', content.join(""), '">', alternate === 1 ? "Alternate row appearance" : "Content appearance", "</div>");
  }
  html.push("</div>");
}

function appendGraphOverviewControl(html: string[], control: HmiProcessDiagnosisGraphOverviewControl, context: HmiHtmlConvertContext): void {
  html.push("<div");
  appendCommonAttributes(html, control, context, true, "display: flex; flex-direction: column; overflow: hidden;");
  appendAttribute(html, "data-process-diagnosis-kind", "GraphOverview");
  appendAttribute(html, "data-preview", "appearance");
  appendAttribute(html, "data-header-background-color", resolvePropertyPreview(control.headerBackgroundColor));
  appendAttribute(html, "data-header-foreground-color", resolvePropertyPreview(control.headerForegroundColor));
  appendAttribute(html, "data-content-background-color", resolvePropertyPreview(control.contentBackgroundColor));
  appendAttribute(html, "data-content-foreground-color", resolvePropertyPreview(control.contentForegroundColor));
  appendAttribute(html, "data-error-color", resolvePropertyPreview(control.errorColor));
  appendAttribute(html, "data-highlight-color", resolvePropertyPreview(control.highlightColor));
  appendAttribute(html, "data-selected-step-color", resolvePropertyPreview(control.selectedStepColor));
  appendAttribute(html, "data-separator-color", resolvePropertyPreview(control.separatorColor));
  appendAttribute(html, "data-toolbar-background-color", resolvePropertyPreview(control.toolbarBackgroundColor));
  appendAttribute(html, "data-use-toolbar-background-color", resolvePropertyPreview(control.useToolbarBackgroundColor));
  appendAttribute(html, "data-show-message-view-button", resolvePropertyPreview(control.showMessageViewButton));
  appendAttribute(html, "data-show-plc-code-view-button", resolvePropertyPreview(control.showPlcCodeViewButton));
  appendAttribute(html, "data-show-step-button", resolvePropertyPreview(control.showStepButton));
  appendAttribute(html, "data-button-background-color", resolvePropertyPreview(control.buttonBackgroundColor));
  appendAttribute(html, "data-button-border-background-color", resolvePropertyPreview(control.buttonBorderBackgroundColor));
  appendAttribute(html, "data-button-border-color", resolvePropertyPreview(control.buttonBorderColor));
  appendAttribute(html, "data-button-first-gradient-color", resolvePropertyPreview(control.buttonFirstGradientColor));
  appendAttribute(html, "data-button-middle-gradient-color", resolvePropertyPreview(control.buttonMiddleGradientColor));
  appendAttribute(html, "data-button-second-gradient-color", resolvePropertyPreview(control.buttonSecondGradientColor));
  appendAttribute(html, "data-button-border-width", resolvePropertyPreview(control.buttonBorderWidth));
  appendAttribute(html, "data-button-corner-radius", resolvePropertyPreview(control.buttonCornerRadius));
  appendAttribute(html, "data-button-edge-style", resolvePropertyPreview(control.buttonEdgeStyle));
  appendAttribute(html, "data-button-back-fill-style", resolvePropertyPreview(control.buttonBackFillStyle));
  appendAttribute(html, "data-button-first-gradient-offset", resolvePropertyPreview(control.buttonFirstGradientOffset));
  appendAttribute(html, "data-button-second-gradient-offset", resolvePropertyPreview(control.buttonSecondGradientOffset));
  appendAttribute(html, "data-use-button-first-gradient", resolvePropertyPreview(control.useButtonFirstGradient));
  appendAttribute(html, "data-use-button-second-gradient", resolvePropertyPreview(control.useButtonSecondGradient));
  appendAttribute(html, "data-associated-graph-db-tag-source-id", control.associatedGraphDbTagSourceId);
  appendAttribute(html, "data-associated-graph-db-tag-name", control.associatedGraphDbTagName);
  html.push(' role="region" aria-label="Graph overview"><div>GRAPH overview appearance preview; Graph diagnostics not loaded</div>');
  const sample = (kind: string, label: string, background: HmiProperty<HmiColor> | undefined, foreground: HmiProperty<HmiColor> | undefined, additionalStyle = "", font?: HmiFont) => {
    const style = ["padding: 2px 4px;"];
    appendColorStyle(style, "background-color", background);
    appendColorStyle(style, "color", foreground);
    if (font) appendFont(style, font.getForCulture(context.options.cultureLcid));
    style.push(additionalStyle);
    html.push('<div data-appearance-sample="', kind, '" style="', style.join(""), '">', label, "</div>");
  };
  sample("path-header", "Path header appearance", control.headerBackgroundColor, control.headerForegroundColor, "", control.headerFont);
  sample("step", "Step appearance", control.contentBackgroundColor, control.contentForegroundColor, "", control.contentFont);
  sample("error", "Error color palette", control.errorColor, undefined);
  sample("highlight", "Highlight color palette", control.highlightColor, undefined);
  sample("selected-step", "Selected step color palette", control.selectedStepColor, undefined);
  sample("separator", "Separator color palette", control.separatorColor, undefined);
  sample("toolbar", "Toolbar background appearance", getStaticValue(control.useToolbarBackgroundColor) !== false ? control.toolbarBackgroundColor : undefined, undefined);
  const button: string[] = [];
  appendColorStyle(button, "background-color", control.buttonBackgroundColor);
  appendColorStyle(button, "border-color", control.buttonBorderColor);
  appendHeaderBorderWidth(button, control.buttonBorderWidth);
  const radius = getStaticValue(control.buttonCornerRadius);
  if (radius !== undefined && Number.isFinite(radius) && radius >= 0) button.push(`border-radius: ${toCss(radius)}px;`);
  appendColorGradientStyle(button, createColorGradient({
    backgroundColor: control.buttonBackgroundColor, firstGradientColor: control.buttonFirstGradientColor, firstGradientOffset: control.buttonFirstGradientOffset,
    middleGradientColor: control.buttonMiddleGradientColor, secondGradientColor: control.buttonSecondGradientColor, secondGradientOffset: control.buttonSecondGradientOffset,
    useFirstGradient: control.useButtonFirstGradient, useSecondGradient: control.useButtonSecondGradient,
  }));
  sample("button", "Button appearance", undefined, undefined, button.join(""));
  html.push("</div>");
}

function appendSystemDiagnosisAppearance(html: string[], control: HmiSystemDiagnosisAppearance, context: HmiHtmlConvertContext): void {
  html.push('<div data-system-diagnosis-appearance="true" data-preview="appearance"');
  appendAttribute(html,"data-information-area-background-color",resolvePropertyPreview(control.informationAreaBackgroundColor));
  appendAttribute(html,"data-information-area-foreground-color",resolvePropertyPreview(control.informationAreaForegroundColor));
  appendAttribute(html,"data-error-background-color",resolvePropertyPreview(control.errorBackgroundColor));
  appendAttribute(html,"data-error-foreground-color",resolvePropertyPreview(control.errorForegroundColor));
  appendAttribute(html,"data-information-area-focus-color",resolvePropertyPreview(control.informationAreaFocusColor));
  appendAttribute(html,"data-information-area-focus-width",resolvePropertyPreview(control.informationAreaFocusWidth));
  appendAttribute(html,"data-information-area-font-reference-device-size",resolvePropertyPreview(control.informationAreaFontReferenceDeviceSize));
  appendAttribute(html,"data-selection-background-color",resolvePropertyPreview(control.selectionBackgroundColor));
  appendAttribute(html,"data-selection-foreground-color",resolvePropertyPreview(control.selectionForegroundColor));
  appendAttribute(html,"data-show-grid-lines",resolvePropertyPreview(control.showGridLines));
  appendAttribute(html,"data-header-background-color",resolvePropertyPreview(control.headerBackgroundColor));
  appendAttribute(html,"data-header-foreground-color",resolvePropertyPreview(control.headerForegroundColor));
  appendAttribute(html,"data-navigation-font-reference-device-size",resolvePropertyPreview(control.navigationFontReferenceDeviceSize));
  appendAttribute(html,"data-navigation-foreground-color",resolvePropertyPreview(control.navigationForegroundColor));
  appendAttribute(html,"data-show-navigation-buttons",resolvePropertyPreview(control.showNavigationButtons));
  appendAttribute(html,"data-use-toolbar-background-color",resolvePropertyPreview(control.useToolbarBackgroundColor));
  appendAttribute(html,"data-alternating-row-background-color",resolvePropertyPreview(control.alternatingRowBackgroundColor));
  appendAttribute(html,"data-grid-line-color",resolvePropertyPreview(control.gridLineColor));
  appendAttribute(html,"data-toolbar-alignment",resolvePropertyPreview(control.toolbarAlignment));
  appendAttribute(html,"data-toolbar-background-color",resolvePropertyPreview(control.toolbarBackgroundColor));
  appendAttribute(html,"data-header-font-reference-device-size",resolvePropertyPreview(control.headerFontReferenceDeviceSize));
  appendAttribute(html,"data-button-background-color",resolvePropertyPreview(control.buttonBackgroundColor));
  appendAttribute(html,"data-button-border-background-color",resolvePropertyPreview(control.buttonBorderBackgroundColor));
  appendAttribute(html,"data-button-border-color",resolvePropertyPreview(control.buttonBorderColor));
  appendAttribute(html,"data-button-first-gradient-color",resolvePropertyPreview(control.buttonFirstGradientColor));
  appendAttribute(html,"data-button-middle-gradient-color",resolvePropertyPreview(control.buttonMiddleGradientColor));
  appendAttribute(html,"data-button-second-gradient-color",resolvePropertyPreview(control.buttonSecondGradientColor));
  appendAttribute(html,"data-button-border-width",resolvePropertyPreview(control.buttonBorderWidth));
  appendAttribute(html,"data-button-corner-radius",resolvePropertyPreview(control.buttonCornerRadius));
  appendAttribute(html,"data-button-edge-style",resolvePropertyPreview(control.buttonEdgeStyle));
  appendAttribute(html,"data-button-back-fill-style",resolvePropertyPreview(control.buttonBackFillStyle));
  appendAttribute(html,"data-button-first-gradient-offset",resolvePropertyPreview(control.buttonFirstGradientOffset));
  appendAttribute(html,"data-button-second-gradient-offset",resolvePropertyPreview(control.buttonSecondGradientOffset));
  appendAttribute(html,"data-use-button-first-gradient",resolvePropertyPreview(control.useButtonFirstGradient));
  appendAttribute(html,"data-use-button-second-gradient",resolvePropertyPreview(control.useButtonSecondGradient));
  appendAttribute(html,"data-header-border-color",resolvePropertyPreview(control.headerBorderColor));
  appendAttribute(html,"data-header-border-width",resolvePropertyPreview(control.headerBorderWidth));
  appendAttribute(html,"data-header-border-background-color",resolvePropertyPreview(control.headerBorderBackgroundColor));
  appendAttribute(html,"data-header-corner-radius",resolvePropertyPreview(control.headerCornerRadius));
  appendAttribute(html,"data-header-back-fill-style",resolvePropertyPreview(control.headerBackFillStyle));
  appendAttribute(html,"data-header-edge-style",resolvePropertyPreview(control.headerEdgeStyle));
  appendAttribute(html,"data-header-first-gradient-color",resolvePropertyPreview(control.headerFirstGradientColor));
  appendAttribute(html,"data-header-middle-gradient-color",resolvePropertyPreview(control.headerMiddleGradientColor));
  appendAttribute(html,"data-header-second-gradient-color",resolvePropertyPreview(control.headerSecondGradientColor));
  appendAttribute(html,"data-header-first-gradient-offset",resolvePropertyPreview(control.headerFirstGradientOffset));
  appendAttribute(html,"data-header-second-gradient-offset",resolvePropertyPreview(control.headerSecondGradientOffset));
  appendAttribute(html,"data-use-header-first-gradient",resolvePropertyPreview(control.useHeaderFirstGradient));
  appendAttribute(html,"data-use-header-second-gradient",resolvePropertyPreview(control.useHeaderSecondGradient));
  html.push("><div>System diagnostics appearance preview</div>");
  const sample=(kind:string,label:string,background:HmiProperty<HmiColor>|undefined,foreground:HmiProperty<HmiColor>|undefined,extra="")=>{
    const style=["padding: 2px 4px;"];appendColorStyle(style,"background-color",background);appendColorStyle(style,"color",foreground);style.push(extra);
    html.push('<div data-appearance-sample="',kind,'" style="',style.join(""),'">',label,"</div>");
  };
  const grid:string[]=[];
  if(getStaticValue(control.showGridLines)){grid.push("border-bottom: 1px solid currentColor;");appendColorStyle(grid,"border-bottom-color",control.gridLineColor);}
  sample("information","Information area appearance",control.informationAreaBackgroundColor,control.informationAreaForegroundColor,grid.join(""));
  sample("alternate","Alternate row appearance",control.alternatingRowBackgroundColor??control.informationAreaBackgroundColor,control.informationAreaForegroundColor,grid.join(""));
  sample("error","Error text appearance",control.errorBackgroundColor,control.errorForegroundColor);
  sample("selection","Selection appearance",control.selectionBackgroundColor,control.selectionForegroundColor);
  sample("focus-frame","Focus frame color palette",control.informationAreaFocusColor,undefined);
  sample("navigation","Navigation path text appearance",undefined,control.navigationForegroundColor);
  sample("toolbar","Toolbar background appearance",getStaticValue(control.useToolbarBackgroundColor)!==false?control.toolbarBackgroundColor:undefined,undefined);
  const header:string[]=[];appendColorStyle(header,"background-color",control.headerBackgroundColor);appendColorStyle(header,"border-color",control.headerBorderColor);appendHeaderBorderWidth(header,control.headerBorderWidth);
  const headerRadius=getStaticValue(control.headerCornerRadius);if(headerRadius!==undefined&&Number.isFinite(headerRadius)&&headerRadius>=0)header.push(`border-radius: ${toCss(headerRadius)}px;`);
  appendColorGradientStyle(header,createColorGradient({backgroundColor:control.headerBackgroundColor,firstGradientColor:control.headerFirstGradientColor,firstGradientOffset:control.headerFirstGradientOffset,middleGradientColor:control.headerMiddleGradientColor,secondGradientColor:control.headerSecondGradientColor,secondGradientOffset:control.headerSecondGradientOffset,useFirstGradient:control.useHeaderFirstGradient,useSecondGradient:control.useHeaderSecondGradient}));
  sample("header","Header appearance",undefined,control.headerForegroundColor,header.join(""));
  const button:string[]=[];appendColorStyle(button,"background-color",control.buttonBackgroundColor);appendColorStyle(button,"border-color",control.buttonBorderColor);appendHeaderBorderWidth(button,control.buttonBorderWidth);
  const buttonRadius=getStaticValue(control.buttonCornerRadius);if(buttonRadius!==undefined&&Number.isFinite(buttonRadius)&&buttonRadius>=0)button.push(`border-radius: ${toCss(buttonRadius)}px;`);
  appendColorGradientStyle(button,createColorGradient({backgroundColor:control.buttonBackgroundColor,firstGradientColor:control.buttonFirstGradientColor,firstGradientOffset:control.buttonFirstGradientOffset,middleGradientColor:control.buttonMiddleGradientColor,secondGradientColor:control.buttonSecondGradientColor,secondGradientOffset:control.buttonSecondGradientOffset,useFirstGradient:control.useButtonFirstGradient,useSecondGradient:control.useButtonSecondGradient}));
  sample("button","Button appearance",undefined,undefined,button.join(""));
  html.push("</div>");
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
  appendAttribute(html, "data-column-header-type", resolvePropertyPreview(systemDiagnosisControl.columnHeaderType));
  appendAttribute(html, "data-row-header-type", resolvePropertyPreview(systemDiagnosisControl.rowHeaderType));
  appendAttribute(html, "data-show-toolbar", resolvePropertyPreview(systemDiagnosisControl.showToolbar));
  appendAttribute(html, "data-show-status-bar", resolvePropertyPreview(systemDiagnosisControl.showStatusBar));
  appendAttribute(html, "data-allow-sort", resolvePropertyPreview(systemDiagnosisControl.allowSortByColumn));
  appendAttribute(html, "data-allow-filter-by-column", resolvePropertyPreview(systemDiagnosisControl.allowFilterByColumn));
  appendAttribute(html, "data-allow-column-resize", resolvePropertyPreview(systemDiagnosisControl.allowColumnResize));
  appendAttribute(html, "data-allow-column-reorder", resolvePropertyPreview(systemDiagnosisControl.allowColumnReorder));
  appendAttribute(html, "data-grid-selection-mode", resolvePropertyPreview(systemDiagnosisControl.gridSelectionMode));
  appendAttribute(html, "data-select-full-row", resolvePropertyPreview(systemDiagnosisControl.selectFullRow));
  appendAttribute(html, "data-selection-border-color", resolvePropertyPreview(systemDiagnosisControl.selectionBorderColor));
  appendAttribute(html, "data-selection-border-width", resolvePropertyPreview(systemDiagnosisControl.selectionBorderWidth));
  appendAttribute(html, "data-row-height", resolvePropertyPreview(systemDiagnosisControl.rowHeight));
  appendAttribute(html, "data-grid-line-width", resolvePropertyPreview(systemDiagnosisControl.gridLineWidth));
  appendAttribute(html, "data-grid-line-visibility", resolvePropertyPreview(systemDiagnosisControl.gridLineVisibility));
  appendAttribute(html, "data-horizontal-scroll-bar-visibility", resolvePropertyPreview(systemDiagnosisControl.horizontalScrollBarVisibility));
  appendAttribute(html, "data-vertical-scroll-bar-visibility", resolvePropertyPreview(systemDiagnosisControl.verticalScrollBarVisibility));
  html.push("><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor; font-weight: bold;\">", escapeHtml(title), "</div>");
  if (systemDiagnosisControl.appearance) appendSystemDiagnosisAppearance(html,systemDiagnosisControl.appearance,context);
  const bar = (role: string, background: HmiProperty<HmiColor> | undefined, foreground: HmiProperty<HmiColor> | undefined, font: HmiFont | undefined, text: string) => {
    const style = ["flex: 0 0 auto; padding: 2px 4px;"];
    appendColorStyle(style, "background-color", background); appendColorStyle(style, "color", foreground);
    if (font) appendFont(style, font.getForCulture(context.options.cultureLcid));
    html.push('<div role="', role, '" style="', style.join(""), '">', text, '</div>');
  };
  if (getStaticValue(systemDiagnosisControl.showToolbar) === true)
    bar("toolbar", systemDiagnosisControl.toolbarBackgroundColor, systemDiagnosisControl.toolbarForegroundColor, systemDiagnosisControl.toolbarFont, "Diagnostic commands not loaded");
  const content = ["flex: 1 1 auto; overflow: hidden;"];
  appendParameterScrollStyle(content, "x", systemDiagnosisControl.horizontalScrollBarVisibility);
  appendParameterScrollStyle(content, "y", systemDiagnosisControl.verticalScrollBarVisibility);
  appendColorStyle(content, "background-color", systemDiagnosisControl.contentBackgroundColor); appendColorStyle(content, "color", systemDiagnosisControl.contentForegroundColor);
  if (systemDiagnosisControl.contentFont) appendFont(content, systemDiagnosisControl.contentFont.getForCulture(context.options.cultureLcid));
  html.push('<div style="', content.join(""), '">');
  const columns = systemDiagnosisControl.columnDefinitions.filter(column => getStaticValue(column.visible) !== false)
    .slice().sort((a, b) => (getStaticValue(a.order) ?? Number.MAX_SAFE_INTEGER) - (getStaticValue(b.order) ?? Number.MAX_SAFE_INTEGER));
  if (!columns.length) html.push("Diagnostic data not loaded");
  else {
    const width = getStaticValue(systemDiagnosisControl.gridLineWidth) ?? 1;
    const grid = [`border: ${Number.isFinite(width) && width >= 0 ? toCss(width) : "1"}px solid currentColor;`];
    appendColorStyle(grid, "border-color", systemDiagnosisControl.gridLineColor);
    const header = [...grid]; appendColorStyle(header, "background-color", systemDiagnosisControl.headerBackgroundColor);
    appendColorStyle(header, "color", systemDiagnosisControl.headerForegroundColor); appendColorStyle(header, "border-color", systemDiagnosisControl.headerBorderColor);
    if (systemDiagnosisControl.headerFont) appendFont(header, systemDiagnosisControl.headerFont.getForCulture(context.options.cultureLcid));
    html.push('<table class="hmi-diagnosis-table" style="width: 100%; border-collapse: collapse; table-layout: fixed;"><colgroup>');
    for (const column of columns) {
      html.push("<col"); const columnWidth = getStaticValue(column.width);
      if (columnWidth !== undefined && Number.isFinite(columnWidth) && columnWidth >= 0) appendAttribute(html, "style", `width: ${toCss(columnWidth)}px;`);
      html.push(">");
    }
    html.push("</colgroup>");
    const columnHeaderType = getStaticValue(systemDiagnosisControl.columnHeaderType);
    if (columnHeaderType !== 0 && getStaticValue(systemDiagnosisControl.showColumnHeadings) !== false) {
      html.push("<thead><tr>");
      let columnIndex = 0;
      for (const column of columns) {
        columnIndex++;
        const columnStyle = [...header];
        const horizontal = getStaticValue(column.headerHorizontalAlignment);
        if (horizontal !== undefined) columnStyle.push(`text-align: ${horizontalAlignmentToCss(horizontal)};`);
        const vertical = getStaticValue(column.headerVerticalAlignment);
        if (vertical !== undefined && vertical !== HmiVerticalAlignment.Stretch)
          columnStyle.push(`vertical-align: ${vertical === HmiVerticalAlignment.Top ? "top" : vertical === HmiVerticalAlignment.Bottom ? "bottom" : "middle"};`);
        html.push('<th style="', columnStyle.join(""), 'overflow: hidden; text-overflow: ellipsis;"');
        appendAttribute(html, "data-header-horizontal-alignment", resolvePropertyPreview(column.headerHorizontalAlignment));
        appendAttribute(html, "data-header-vertical-alignment", resolvePropertyPreview(column.headerVerticalAlignment));
        appendAttribute(html, "data-column-source-type", column.sourceType); appendAttribute(html, "data-output-format", column.format);
        appendAttribute(html, "data-allow-sort", resolvePropertyPreview(column.allowSort));
        appendAttribute(html, "data-sort-order", resolvePropertyPreview(column.sortOrder));
        appendAttribute(html, "data-sort-direction", resolvePropertyPreview(column.sortDirection));
        const headingText = columnHeaderType === 1 ? String(columnIndex) : column.headerText?.getText(context.options.cultureLcid) ?? column.sourceType ?? HmiSystemDiagnosisColumnType[column.type];
        html.push(">", escapeHtml(headingText), "</th>");
      }
      html.push("</tr></thead>");
    }
    const cell = [...grid];
    const gridMode = getStaticValue(systemDiagnosisControl.gridLineVisibility);
    if (gridMode === 0 || gridMode === 1) cell.push("border-top-width: 0;border-bottom-width: 0;");
    if (gridMode === 0 || gridMode === 2) cell.push("border-left-width: 0;border-right-width: 0;");
    const dimension = (css: string, property: HmiProperty<number> | undefined) => {
      const value = getStaticValue(property); if (value !== undefined && Number.isFinite(value) && value >= 0) cell.push(`${css}: ${toCss(value)}px;`);
    };
    if (getStaticValue(systemDiagnosisControl.rowHeight) === 0) cell.push("height: auto;"); else dimension("height", systemDiagnosisControl.rowHeight);
    dimension("padding-left", systemDiagnosisControl.cellPaddingLeft); dimension("padding-top", systemDiagnosisControl.cellPaddingTop);
    dimension("padding-right", systemDiagnosisControl.cellPaddingRight); dimension("padding-bottom", systemDiagnosisControl.cellPaddingBottom);
    html.push('<tbody><tr><td colspan="', String(columns.length), '" style="', cell.join(""), 'text-align: center;">Diagnostic data not loaded</td></tr></tbody></table>');
  }
  html.push("</div>");
  if (getStaticValue(systemDiagnosisControl.showStatusBar) === true)
    bar("status", systemDiagnosisControl.statusBarBackgroundColor, systemDiagnosisControl.statusBarForegroundColor, systemDiagnosisControl.statusBarFont, "Diagnostic status not loaded");
  html.push("</div>");
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
  let [minimum, maximum]: [number, number] = begin < end ? [begin, end] : [end, begin];
  const position = getBarOriginPosition(scale, minimum, maximum);
  if (position !== undefined) {
    const origin = getStaticValue(scale.originValue)!;
    if (position === 0 && origin < maximum) minimum = origin;
    if (position === 100 && origin > minimum) maximum = origin;
  }
  return [minimum, maximum];
}

function getBarOriginPosition(scale: HmiScaleWidgetBase, minimum: number, maximum: number): number | undefined {
  if (!(scale instanceof HmiBar) || getStaticValue(scale.useAutoScaling) !== true ||
    scale.originPositionPercent === undefined || scale.originValue === undefined || !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) || maximum <= minimum || !Number.isFinite(maximum - minimum)) return undefined;
  const position = getStaticValue(scale.originPositionPercent), origin = getStaticValue(scale.originValue);
  return position !== undefined && Number.isFinite(position) && position >= 0 && position <= 100 &&
    origin !== undefined && Number.isFinite(origin) && origin >= minimum && origin <= maximum ? position : undefined;
}

function getScaleRatio(scale: HmiScaleWidgetBase, minimum: number, maximum: number, value: number): number {
  const position = getBarOriginPosition(scale, minimum, maximum);
  if (position === undefined) {
    let ratio = maximum === minimum ? 0 : (value - minimum) / (maximum - minimum);
    if (!usesNonlinearBarMapping(scale, minimum, maximum)) return ratio;
    ratio = Math.min(1, Math.max(0, ratio));
    switch (getStaticValue((scale as HmiBar).valueMapping)) {
      case HmiBarValueMapping.NormalizedLogarithmic: return Math.log10(1 + 100 * ratio) / Math.log10(101);
      case HmiBarValueMapping.InverseNormalizedLogarithmic: return 1 - Math.log10(101 - 100 * ratio) / Math.log10(101);
      case HmiBarValueMapping.Tangent: return mapBarTangent(ratio, getBarTangentPivot(scale as HmiBar, minimum, maximum));
      case HmiBarValueMapping.Quadratic: return ratio * ratio;
      case HmiBarValueMapping.Cubic: return ratio * ratio * ratio;
      default: return ratio;
    }
  }
  const origin = getStaticValue(scale.originValue)!;
  value = Math.min(maximum, Math.max(minimum, value));
  const fraction = position / 100;
  return value < origin
    ? origin > minimum ? fraction * (value - minimum) / (origin - minimum) : 0
    : maximum > origin ? fraction + (1 - fraction) * (value - origin) / (maximum - origin) : fraction;
}

function getScaleTickRatio(scale: HmiScaleWidgetBase, minimum: number, maximum: number, ratio: number): number {
  return getBarOriginPosition(scale, minimum, maximum) !== undefined || usesNonlinearBarMapping(scale, minimum, maximum)
    ? getScaleRatio(scale, minimum, maximum, minimum + (maximum - minimum) * ratio) : ratio;
}

function usesNonlinearBarMapping(scale: HmiScaleWidgetBase, minimum: number, maximum: number): boolean {
  return scale instanceof HmiBar && Number.isFinite(minimum) && Number.isFinite(maximum) && maximum > minimum &&
    Number.isFinite(maximum - minimum) && ([HmiBarValueMapping.NormalizedLogarithmic, HmiBarValueMapping.InverseNormalizedLogarithmic,
      HmiBarValueMapping.Quadratic, HmiBarValueMapping.Cubic].includes(getStaticValue(scale.valueMapping) ?? HmiBarValueMapping.Linear) ||
      getStaticValue(scale.valueMapping) === HmiBarValueMapping.Tangent && Number.isFinite(getBarTangentPivot(scale, minimum, maximum)));
}

function getBarTangentPivot(bar: HmiBar, minimum: number, maximum: number): number {
  return bar.tangentPivotPercent !== undefined ? getStaticValue(bar.tangentPivotPercent) ?? 0
    : bar.originValue !== undefined ? ((getStaticValue(bar.originValue) ?? 0) - minimum) * 100 / (maximum - minimum) : 50;
}

function mapBarTangent(ratio: number, pivot: number): number {
  const delta = ratio * 100 - pivot;
  // Continuous pivot limit avoids native 0/0 when the pivot is the upper endpoint.
  if (delta === 0) return pivot / 100;
  const span = delta < 0 ? pivot : 100 - pivot, pi = 4 * Math.atan(1), angle = pi * .5 - pi * .5 * .1;
  return (pivot + Math.tan(angle / span * delta + pi) * (span / Math.tan(angle))) / 100;
}

function resolveScaleValue(scale: HmiScaleWidgetBase, minimum: number, maximum: number): number {
  const value = getStaticValue(scale.showFillLevel) === true
    ? getStaticValue(scale.fillLevel) ?? 0
    : getStaticValue(scale.value) ?? 0;
  return Math.min(Math.max(value, minimum), maximum);
}

function createSymbolicStateStyle(field: HmiSymbolicIOField, state: HmiState | undefined, context: HmiHtmlConvertContext): string | undefined {
  let style = createStateStyle(state) ?? undefined;
  const width = context.effectiveProperties.resolve(field, "BorderWidth", field.borderWidth);
  if (field.drawStrokeInsideFrame !== undefined &&
      !getStaticValue(context.effectiveProperties.resolve(field, "DrawStrokeInsideFrame", field.drawStrokeInsideFrame)) &&
      (getStaticValue(width) ?? 0) > 1 && state?.borderColor !== undefined)
    style = appendCssDeclaration(style, "outline-color: " + colorToCss(state.borderColor) + ";");
  return style;
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
    let stateStyle = createSymbolicStateStyle(symbolicIoField, selectedState, context);
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
      if (selectedState.imageBackgroundTransparent === true && selectedState.imageBackgroundColor !== undefined) {
        const key = selectedState.imageBackgroundColor;
        appendAttribute(html, "data-hmi-image-color-key", `${key.red},${key.green},${key.blue}`);
      }
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
      if (selectedState.alternateImageBackgroundTransparent === true && selectedState.alternateImageBackgroundColor !== undefined) {
        const key = selectedState.alternateImageBackgroundColor;
        appendAttribute(html, "data-hmi-image-color-key", `${key.red},${key.green},${key.blue}`);
      }
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

  const textStateStyle = (createSymbolicStateStyle(symbolicIoField, selectedState, context) ?? "") + (createFontWritingModeStyle(symbolicIoField.font) ?? "");
  if (getStaticValue(symbolicIoField.readOnly) === true) {
    html.push("<input");
    appendCommonAttributes(html, symbolicIoField, context, true, textStateStyle);
    appendAttribute(html, "type", "text");
    appendAttribute(html, "readonly", "readonly");
    appendAttribute(html, "value", selectedState?.text?.getDisplayText(context.options.cultureLcid) ?? "");
    appendAttribute(html, "data-state-value", selectedState?.value !== undefined ? toCss(selectedState.value) : undefined);
    if (getStaticValue(symbolicIoField.enabled) === false) appendAttribute(html, "disabled", "disabled");
    html.push(">");
    return;
  }
  html.push("<select");
  appendCommonAttributes(html, symbolicIoField, context, true, textStateStyle);
  if (getStaticValue(symbolicIoField.enabled) === false) appendAttribute(html, "disabled", "disabled");
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

function createFontWritingModeStyle(font: HmiFont | undefined): string | undefined {
  const sourceAngle = getStaticValue(font?.orientationAngle) ?? 0;
  const angle = ((sourceAngle % 360) + 360) % 360;
  return angle === 90 ? "writing-mode: sideways-lr;" : angle === 270 ? "writing-mode: sideways-rl;" : undefined;
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
  const surfaceBackground = getStaticValue(context.effectiveProperties.resolve(selectionGroup, "BackgroundColor", selectionGroup.backgroundColor));
  if (getFillPattern(selectionGroup, context) === HmiFillPattern.Transparent)
    appendAttribute(html, "surface-background-color", "transparent");
  else if (surfaceBackground !== undefined)
    appendAttribute(html, "surface-background-color", colorToCss(surfaceBackground));
  appendAttribute(html, "frame-border-style", getBorderStyleCss(selectionGroup, context));
  const frameBorder = context.effectiveProperties.resolve(selectionGroup, "BorderColor", selectionGroup.borderColor);
  for (const [name, property] of [
    ["foreground", context.effectiveProperties.resolve(selectionGroup, "ForegroundColor", selectionGroup.foregroundColor)],
    ["background", context.effectiveProperties.resolve(selectionGroup, "BackgroundColor", selectionGroup.backgroundColor)],
  ] as const) {
    if (property?.kind === HmiPropertyKind.Blink) {
      const blink = property as HmiBlinkProperty<HmiColor>;
      if (blink.staticValue !== undefined && blink.blinkValue !== undefined)
        appendAttribute(html, `${name}-flash-duration`, getBlinkDuration(blink.rate));
    }
  }
  if (frameBorder?.kind === HmiPropertyKind.Blink) {
    const blink = frameBorder as HmiBlinkProperty<HmiColor>;
    if (blink.staticValue !== undefined && blink.blinkValue !== undefined)
      appendAttribute(html, "frame-border-flash-duration", getBlinkDuration(blink.rate));
  }
  appendStaticAttribute(html, "selected-index", selectionGroup.selectedIndex);
  if ((selectionGroup instanceof HmiCheckBoxGroup || selectionGroup instanceof HmiRadioButtonGroup) && selectionGroup.indicatorOnRight !== undefined)
    appendAttribute(html, "indicator-on-right", getStaticValue(selectionGroup.indicatorOnRight) ? "true" : "false");
  if (selectionGroup instanceof HmiCheckBoxGroup || selectionGroup instanceof HmiRadioButtonGroup)
    appendStaticAttribute(html, "selected-fields", selectionGroup.selectedFields);
  if ((selectionGroup instanceof HmiCheckBoxGroup || selectionGroup instanceof HmiRadioButtonGroup) && selectionGroup.drawStrokeInsideFrame !== undefined)
    appendAttribute(html, "draw-stroke-inside-frame", getStaticValue(selectionGroup.drawStrokeInsideFrame) ? "true" : "false");
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
  const selectedFields = selectionGroup instanceof HmiListBox
    ? getStaticValue(selectionGroup.selectedFields) : undefined;
  const selectedValue = selectionGroup.indicator !== undefined
    ? getStaticValue(selectionGroup.indicator)
    : getStaticValue(selectionGroup.value);
  const selectedIndex = getStaticValue(selectionGroup.selectedIndex) ?? -1;
  const selectedState = selectionGroup.states.find(candidate => selectedValue !== undefined && candidate.value === selectedValue)
    ?? (selectedIndex >= 0 && selectedIndex < selectionGroup.states.length ? selectionGroup.states[selectedIndex] : undefined)
    ?? selectionGroup.states[0];

  html.push("<select");
  appendCommonAttributes(html, selectionGroup, context, true,
    selectedFields === undefined ? createStateStyle(selectedState) : undefined);
  if (selectionGroup instanceof HmiListBox) appendAttribute(html, "size", "2");
  if (selectedFields !== undefined) appendAttribute(html, "multiple", "multiple");
  if (getStaticValue(selectionGroup.enabled) === false) appendAttribute(html, "disabled", "disabled");
  html.push(">");
  for (let index = 0; index < selectionGroup.states.length; index++) {
    const state = selectionGroup.states[index]!;
    html.push("<option");
    if (state.value !== undefined)
      appendAttribute(html, "value", toCss(state.value));
    appendAttribute(html, "style", createStateStyle(state) ?? undefined);
    appendAttribute(html, "data-image-name", state.imageName ?? state.image?.imageName);
    if (selectedFields !== undefined
      ? index < 32 && ((selectedFields >>> index) & 1) !== 0
      : state === selectedState)
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

function appendTextBox(html: string[], item: HmiTextBox, context: HmiHtmlConvertContext): void {
  html.push("<textarea");
  const resize = getStaticValue(item.resizable) === true ? "both" : "none";
  appendCommonAttributes(html, item, context, undefined,
    `overflow: auto;resize: ${resize};` + (createTextOrientationStyle(item, context) ?? ""));
  if (getStaticValueOrDefault(item.enabled, true) === false) appendAttribute(html, "disabled", "disabled");
  if (getStaticValue(item.readOnly) === true) appendAttribute(html, "readonly", "readonly");
  const length = getStaticValue(item.fieldLength);
  if (length !== undefined && length > 0) appendAttribute(html, "maxlength", String(length));
  html.push(">");
  const text = getStaticValue(item.text)?.getText(context.options.cultureLcid) ?? "";
  if (text.startsWith("\n") || text.startsWith("\r")) html.push("\n");
  html.push(escapeHtml(text), "</textarea>");
}

function appendTextBlock(
  html: string[],
  item: HmiScreenItemBase,
  text: HmiProperty<HmiMultilingualText> | undefined,
  context: HmiHtmlConvertContext,
): void {
  html.push("<div");
  appendCommonAttributes(html, item, context, undefined, "overflow: hidden;" + (createTextOrientationStyle(item, context) ?? ""));
  html.push(">");
  appendMultilingualText(html, getStaticValue(text), context);
  html.push("</div>");
}

function createTextOrientationStyle(item: HmiScreenItemBase, context: HmiHtmlConvertContext): string | undefined {
  if (!(item instanceof HmiText)) return undefined;
  const sourceAngle = getStaticValue(item.font?.orientationAngle);
  if (sourceAngle === undefined) return undefined;
  const angle = ((sourceAngle % 360) + 360) % 360;
  if (angle !== 90 && angle !== 270) return undefined;
  const horizontal = getStaticValue(context.effectiveProperties.resolve(item, "HorizontalAlignment", item.horizontalAlignment)) ?? HmiHorizontalAlignment.Left;
  const vertical = getStaticValue(context.effectiveProperties.resolve(item, "VerticalAlignment", item.verticalAlignment)) ?? HmiVerticalAlignment.Top;
  const cross = horizontal === HmiHorizontalAlignment.Left ? (angle === 90 ? "flex-start" : "flex-end")
    : horizontal === HmiHorizontalAlignment.Right ? (angle === 90 ? "flex-end" : "flex-start")
    : horizontal === HmiHorizontalAlignment.Stretch ? "stretch" : "center";
  const main = vertical === HmiVerticalAlignment.Top ? (angle === 90 ? "flex-end" : "flex-start")
    : vertical === HmiVerticalAlignment.Bottom ? (angle === 90 ? "flex-start" : "flex-end") : "center";
  return `writing-mode: ${angle === 90 ? "sideways-lr" : "sideways-rl"};display: flex;text-align: start;justify-content: ${main};align-items: ${cross};`;
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
    case HmiFillPattern.WideHorizontal:
      image = `repeating-linear-gradient(to bottom, ${color} 0 2px, transparent 2px 6px)`;
      break;
    case HmiFillPattern.Vertical:
      image = `repeating-linear-gradient(to right, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.WideVertical:
      image = `repeating-linear-gradient(to right, ${color} 0 2px, transparent 2px 6px)`;
      break;
    case HmiFillPattern.DiagonalLeftToRight:
    case HmiFillPattern.Diagonal:
      image = `repeating-linear-gradient(135deg, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.WideDiagonalLeftToRight:
      image = `repeating-linear-gradient(135deg, ${color} 0 2px, transparent 2px 6px)`;
      break;
    case HmiFillPattern.DiagonalRightToLeft:
      image = `repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px 6px)`;
      break;
    case HmiFillPattern.WideDiagonalRightToLeft:
      image = `repeating-linear-gradient(45deg, ${color} 0 2px, transparent 2px 6px)`;
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
    case HmiFillPattern.SmallBoxes:
    case HmiFillPattern.MediumBoxes:
    case HmiFillPattern.LargeBoxes:
      image = `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
      break;
    case HmiFillPattern.Ovals:
      image = `radial-gradient(ellipse at center, transparent 0 35%, ${color} 36% 45%, transparent 46%)`;
      break;
    case HmiFillPattern.Diamonds:
      image = `linear-gradient(45deg, transparent 42%, ${color} 43% 57%, transparent 58%), linear-gradient(-45deg, transparent 42%, ${color} 43% 57%, transparent 58%)`;
      break;
    case HmiFillPattern.Scales:
      image = `radial-gradient(ellipse at 50% 0%, transparent 0 45%, ${color} 46% 52%, transparent 53%)`;
      break;
    case HmiFillPattern.Waves:
      image = `radial-gradient(ellipse at 50% 100%, transparent 0 42%, ${color} 43% 50%, transparent 51%)`;
      break;
    default:
      image = `radial-gradient(circle, ${color} 0 1px, transparent 1px)`;
      break;
  }
  html.push(`background-image: ${image};`);
  const size = pattern === HmiFillPattern.CheckersFiner || pattern === HmiFillPattern.DiagonalCrossFiner || pattern === HmiFillPattern.SmallBoxes
    ? "4px 4px"
    : pattern === HmiFillPattern.LargeBoxes || pattern === HmiFillPattern.Ovals || pattern === HmiFillPattern.Scales || pattern === HmiFillPattern.Waves
      ? "12px 12px"
      : "8px 8px";
  html.push(`background-size: ${size};`);
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

function appendColorGradientStyle(html: string[], gradient: ColorGradient | undefined, property = "background-image"): void {
  if (gradient === undefined) return;
  const stops = gradient.stops.map(stop => `${colorToCss(stop.color)} ${toCss(stop.offset)}%`).join(", ");
  html.push(`${property}: linear-gradient(${gradientDirectionToCss(gradient.direction)}, ${stops});`);
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

  if (item instanceof HmiGraphicView && item.imageOverflowPadding !== undefined) {
    const extent = (value: number | undefined): number => Number.isFinite(value) ? Math.max(0, value!) : 0;
    const padding = item.imageOverflowPadding;
    const left = extent(getStaticValue(padding.left)), top = extent(getStaticValue(padding.top));
    const right = extent(getStaticValue(padding.right)), bottom = extent(getStaticValue(padding.bottom));
    const width = extent(getStaticValue(item.width)), height = extent(getStaticValue(item.height));
    html.push("<div");
    appendCommonAttributes(html, item, context, true, "overflow: visible;");
    html.push("><img");
    appendAttribute(html, "data-hmi-graphic-overflow-image", "true");
    appendAttribute(html, "src", uri);
    appendGraphicImageColorKey(html, item);
    appendAttribute(html, "style", `position: absolute; left: ${toCss(-left)}px; top: ${toCss(-top)}px; width: ${toCss(extent(width + left + right))}px; height: ${toCss(extent(height + top + bottom))}px; max-width: none; display: block;`);
    html.push("></div>");
    return;
  }
  let imageLayoutStyle: string | undefined;
  if (item instanceof HmiGraphicView && (item.imageScaled !== undefined || item.imageKeepAspectRatio !== undefined || item.imageHorizontalAlignment !== undefined || item.imageVerticalAlignment !== undefined)) {
    const keep = getStaticValue(item.imageKeepAspectRatio) ?? false, scaled = getStaticValue(item.imageScaled) ?? true;
    const horizontal = getStaticValue(item.imageHorizontalAlignment) ?? HmiHorizontalAlignment.Center;
    const vertical = getStaticValue(item.imageVerticalAlignment) ?? HmiVerticalAlignment.Center;
    const x = horizontal === HmiHorizontalAlignment.Left ? 0 : horizontal === HmiHorizontalAlignment.Right ? 100 : 50;
    const y = vertical === HmiVerticalAlignment.Top ? 0 : vertical === HmiVerticalAlignment.Bottom ? 100 : 50;
    imageLayoutStyle = `object-fit: ${!scaled ? 'none' : keep ? 'contain' : 'fill'}; object-position: ${x}% ${y}%;`;
    if (item.imageKeepAspectRatio !== undefined) {
      const normalized = tryOverrideSvgImageAspectRatio(uri, keep);
      if (normalized === undefined) { appendDiv(html, item, context.options.unsupportedItemPlaceholderCssClass, 'Graphic image', context); return; }
      uri = normalized;
    }
  }
  html.push("<img");
  appendCommonAttributes(html, item, context, undefined, imageLayoutStyle);
  appendAttribute(html, "src", uri);
  if (item instanceof HmiGraphicView) appendGraphicImageColorKey(html, item);
  html.push(">");
}

function appendGraphicImageColorKey(html: string[], graphicView: HmiGraphicView): void {
  if (graphicView.imageBackgroundColor !== undefined &&
      getStaticValue(graphicView.imageBackgroundTransparent) === true) {
    const key = getStaticValue(graphicView.imageBackgroundColor);
    if (key !== undefined) appendAttribute(html, "data-hmi-image-color-key", `${key.red},${key.green},${key.blue}`);
  }
}

function appendSymbolLibraryControl(
  html: string[],
  symbolLibraryControl: HmiSymbolLibraryControl,
  context: HmiHtmlConvertContext,
): void {
  let symbolImage = symbolLibraryControl.symbol;
  const appearance = getStaticValue(symbolLibraryControl.symbolAppearance ?? symbolLibraryControl.fillColorMode) ?? HmiSymbolLibraryFillColorMode.Original;
  const flip = getStaticValue(symbolLibraryControl.flip) ?? HmiSymbolLibraryFlip.None;
  const rotation = getStaticValue(symbolLibraryControl.rotation) ?? HmiSymbolLibraryRotation.Angle0;
  const wmf = !!symbolImage && (symbolImage.imageType === HmiImageType.Wmf || getImageExtension(symbolImage)?.toLowerCase() === '.wmf' || !!symbolImage.mimeType?.toLowerCase().includes('wmf'));
  if (symbolImage && wmf && (appearance !== HmiSymbolLibraryFillColorMode.Original || flip !== HmiSymbolLibraryFlip.None || rotation !== HmiSymbolLibraryRotation.Angle0)) {
    const color = getStaticValue(symbolLibraryControl.foreColor ?? symbolLibraryControl.fillColor);
    let colored = SymbolLibraryMetafileColorizer.tryRecolor(symbolImage.data, appearance, color);
    if (colored && (flip !== HmiSymbolLibraryFlip.None || rotation !== HmiSymbolLibraryRotation.Angle0))
      colored = SymbolLibraryMetafileTransformer.tryTransform(colored, flip, rotation);
    if (!colored) {
      appendDiv(html, symbolLibraryControl, context.options.unsupportedItemPlaceholderCssClass, 'Symbol library control', context);
      return;
    }
    symbolImage = Object.assign(new HmiImage(), {id: symbolImage.id, name: symbolImage.name, imageType: symbolImage.imageType, mimeType: symbolImage.mimeType, data: colored});
  }
  const symbolSvg = resolveImageSvg(symbolImage);
  const blink = getStaticValue(symbolLibraryControl.blinkMode) ?? HmiSymbolLibraryBlinkMode.NoFlashing;
  if (blink !== HmiSymbolLibraryBlinkMode.NoFlashing) {
    const speed = getStaticValue(symbolLibraryControl.blinkSpeed) ?? HmiSymbolLibraryBlinkSpeed.Medium;
    let interval = speed === HmiSymbolLibraryBlinkSpeed.Fast ? 250 : speed === HmiSymbolLibraryBlinkSpeed.Medium ? 500 : speed === HmiSymbolLibraryBlinkSpeed.Slow ? 1000 : 0;
    if (symbolLibraryControl.blinkIntervalMilliseconds !== undefined) interval = getStaticValue(symbolLibraryControl.blinkIntervalMilliseconds) ?? 0;
    const normal = createSymbolLibraryMarkup(symbolImage, symbolLibraryControl);
    let alternate: string | undefined;
    if ((blink === HmiSymbolLibraryBlinkMode.Solid || blink === HmiSymbolLibraryBlinkMode.Shaded) && wmf && symbolLibraryControl.symbol) {
      let bytes = SymbolLibraryMetafileColorizer.tryRecolor(symbolLibraryControl.symbol.data,
        blink === HmiSymbolLibraryBlinkMode.Solid ? HmiSymbolLibraryFillColorMode.Solid : HmiSymbolLibraryFillColorMode.Shaded, getStaticValue(symbolLibraryControl.blinkColor));
      if (bytes) bytes = SymbolLibraryMetafileTransformer.tryTransform(bytes, flip, rotation);
      if (bytes) alternate = createSymbolLibraryMarkup(Object.assign(new HmiImage(), {imageType: HmiImageType.Wmf, data: bytes}), symbolLibraryControl);
    }
    if (!Number.isInteger(interval) || interval <= 0 || interval > 0x3fffffff || !normal || (blink !== HmiSymbolLibraryBlinkMode.Invisible && !alternate)) {
      appendDiv(html, symbolLibraryControl, context.options.unsupportedItemPlaceholderCssClass, 'Symbol library control', context); return;
    }
    html.push('<div');
    appendSymbolLibraryAttributes(html, symbolLibraryControl, context, wmf);
    appendAttribute(html, 'data-hmi-symbol-blink-interval', String(interval)); html.push('>');
    html.push('<style>@keyframes hmi-symbol-on{0%{opacity:1}50%{opacity:0}100%{opacity:1}}@keyframes hmi-symbol-off{0%{opacity:0}50%{opacity:1}100%{opacity:0}}@media(prefers-reduced-motion:reduce){[data-hmi-symbol-phase=normal]{animation:none!important;opacity:1!important}[data-hmi-symbol-phase=alternate]{animation:none!important;opacity:0!important}}</style>');
    // Native initial flag is one: colored modes begin on BlinkColor, invisible begins visible.
    // Reduced-motion users always receive the normal appearance.
    const invisible = blink === HmiSymbolLibraryBlinkMode.Invisible;
    html.push(`<div data-hmi-symbol-phase="normal" style="position: absolute; inset: 0; opacity: ${invisible ? 1 : 0}; animation: ${invisible ? 'hmi-symbol-on' : 'hmi-symbol-off'} ${interval * 2}ms step-end infinite;">${normal}</div>`);
    if (alternate) html.push(`<div data-hmi-symbol-phase="alternate" aria-hidden="true" style="position: absolute; inset: 0; opacity: 1; animation: hmi-symbol-on ${interval * 2}ms step-end infinite;">${alternate}</div>`);
    html.push('</div>'); return;
  }
  if (symbolLibraryControl.rasterLayout !== undefined) {
    const markup = createSymbolLibraryMarkup(symbolImage, symbolLibraryControl);
    if (!markup) { appendDiv(html, symbolLibraryControl, context.options.unsupportedItemPlaceholderCssClass, 'Symbol library control', context); return; }
    html.push('<div'); appendSymbolLibraryAttributes(html, symbolLibraryControl, context, wmf);
    html.push('>', markup, '</div>'); return;
  }
  if (symbolSvg?.trim()) {
    html.push("<div");
    appendSymbolLibraryAttributes(html, symbolLibraryControl, context, wmf);
    html.push(">");
    html.push(normalizeEmbeddedSymbolSvg(symbolSvg, symbolLibraryControl));
    html.push("</div>");
    return;
  }

  const imageUri = resolveImageUriFromImage(symbolImage);
  if (!imageUri?.trim()) {
    appendDiv(html, symbolLibraryControl, context.options.unsupportedItemPlaceholderCssClass, "Symbol library control", context);
    return;
  }

  html.push("<div");
  appendSymbolLibraryAttributes(html, symbolLibraryControl, context, wmf);
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

function createSymbolLibraryMarkup(image: HmiImage | undefined, control: HmiSymbolLibraryControl): string | undefined {
  if (control.rasterLayout !== undefined) {
    const layout = getStaticValue(control.rasterLayout), rasterUri = resolveImageUriFromImage(image);
    if (!rasterUri?.trim() || !Object.values(HmiSymbolLibraryRasterLayout).includes(layout!)) return undefined;
    if (layout === HmiSymbolLibraryRasterLayout.Tile) {
      const tile = ['<div data-hmi-symbol-tile="true" role="img"'];
      appendAttribute(tile, 'aria-label', image?.name ?? control.name);
      appendAttribute(tile, 'style', `width: 100%; height: 100%; image-rendering: pixelated; background-repeat: repeat; background-position: 0 0; background-size: auto; background-image: url("${rasterUri}");`);
      return [...tile, '></div>'].join('');
    }
    const raster = ['<img']; appendAttribute(raster, 'src', rasterUri); appendAttribute(raster, 'alt', image?.name ?? control.name);
    if (layout === HmiSymbolLibraryRasterLayout.Stretch)
      return [...raster, ' style="width: 100%; height: 100%; display: block; object-fit: fill; image-rendering: pixelated;">'].join('');
    // Native downscale uses an integer ratio scaled by 1000 and integer centering.
    if (image?.imageType !== HmiImageType.Bmp || image.data.length < 54 || image.data[0] !== 66 || image.data[1] !== 77) return undefined;
    const data = new DataView(image.data.buffer, image.data.byteOffset, image.data.byteLength);
    const imageWidth = data.getInt32(18, true), imageHeight = data.getInt32(22, true);
    const width = Math.trunc(getStaticValue(control.width) ?? 0), height = Math.trunc(getStaticValue(control.height) ?? 0);
    const limit = Math.trunc(0x7fffffff / 1000);
    if (imageWidth <= 0 || imageHeight <= 0 || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width > limit || height > limit || imageWidth > limit) return undefined;
    let drawWidth = imageWidth, drawHeight = imageHeight;
    if (imageWidth > width || imageHeight > height) {
      const ratio = Math.trunc(imageWidth * 1000 / imageHeight); if (!ratio) return undefined;
      drawWidth = width; drawHeight = height;
      if (Math.trunc(width * 1000 / height) < ratio) drawHeight = Math.trunc(width * 1000 / ratio);
      else drawWidth = Math.trunc(height * ratio / 1000);
    }
    const left = Math.trunc((width - drawWidth) / 2), top = Math.trunc((height - drawHeight) / 2);
    appendAttribute(raster, 'style', `position: absolute; left: ${left}px; top: ${top}px; width: ${drawWidth}px; height: ${drawHeight}px; image-rendering: pixelated;`);
    return [...raster, '>'].join('');
  }
  const svg = resolveImageSvg(image);
  if (svg?.trim()) return normalizeEmbeddedSymbolSvg(svg, control);
  const uri = resolveImageUriFromImage(image);
  if (!uri?.trim()) return undefined;
  const html = ['<img'];
  appendAttribute(html, 'src', uri); appendAttribute(html, 'alt', image?.name ?? control.name);
  appendAttribute(html, 'data-hmi-symbol-id', control.symbolId);
  html.push(' style="width: 100%; height: 100%; display: block;', getStaticValueOrDefault(control.fixedAspectRatio, false) ? 'object-fit: contain;' : 'object-fit: fill;', '">');
  return html.join('');
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

  let rootTag = svg.substring(svgStart, svgTagEnd);
  const aspectRatio = getStaticValueOrDefault(symbolLibraryControl.fixedAspectRatio, false) ? "xMidYMid meet" : "none";
  if (tryGetAttributeValue(rootTag, "preserveAspectRatio") !== undefined)
    rootTag = replaceAttributeValue(rootTag, 0, rootTag.length, "preserveAspectRatio", aspectRatio);
  const existingStyle = tryGetAttributeValue(rootTag, "style");
  const normalizedStyle = appendCssDeclaration(
    existingStyle,
    "width: 100%; height: 100%; display: block;",
  );
  const attributes: string[] = [];
  if (existingStyle === undefined) {
    attributes.push(` style="${escapeHtml(normalizedStyle)}"`);
  } else {
    rootTag = replaceAttributeValue(rootTag, 0, rootTag.length, "style", normalizedStyle);
  }
  if (!/preserveAspectRatio\s*=/i.test(rootTag)) {
    attributes.push(` preserveAspectRatio="${aspectRatio}"`);
  }
  if (symbolLibraryControl.symbolId?.trim()) {
    attributes.push(` data-hmi-symbol-id="${escapeHtml(symbolLibraryControl.symbolId)}"`);
  }

  return svg.slice(0, svgStart) + rootTag + attributes.join("") + svg.slice(svgTagEnd);
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
  transformGeometry = false,
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
  if (!transformGeometry) appendSymbolLibraryTransform(html, symbolLibraryControl);
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

function appendInnerImage(html: string[], uri: string, grayscale = false, pressedOffset = 0, imageKey?: HmiColor): void {
  if (!uri.trim()) {
    return;
  }

  html.push("<img");
  appendAttribute(html, "src", uri);
  if (imageKey !== undefined)
    appendAttribute(html, "data-hmi-image-color-key", `${imageKey.red},${imageKey.green},${imageKey.blue}`);
  html.push(" style=\"width: 100%; height: 100%;");
  if (grayscale) {
    html.push(" filter: grayscale(1);");
  }
  if (pressedOffset > 0) html.push(' transform: translate(' + toCss(pressedOffset) + 'px, ' + toCss(pressedOffset) + 'px);');
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
  if (gauge.needleWidth !== undefined || gauge.needleColor !== undefined) {
    appendBooleanAttribute(html, "show-needle", true);
    appendStaticAttribute(html, "needle-width", gauge.needleWidth);
    appendStaticAttribute(html, "needle-color", gauge.needleColor);
  }
  appendStaticAttribute(html, "division-count", gauge.divisionCount);
  appendStaticAttribute(html, "sub-division-count", gauge.subDivisionCount);
  appendBooleanAttribute(html, "major-ticks-only", getStaticValue(gauge.majorTicksOnly) ?? false);
  appendBooleanAttribute(html, "major-ticks-bold", getStaticValue(gauge.majorTicksBold) ?? false);
  appendStaticAttribute(html, "major-tick-length", gauge.majorTickLength);
  appendBooleanAttribute(html, "hide-scale", !(getStaticValue(gauge.showScale) ?? true));
  appendBooleanAttribute(html, "hide-tick-labels", !(getStaticValue(gauge.showTickLabels) ?? true));
  appendStaticAttribute(html, "tick-label-interval", gauge.tickLabelInterval);
  appendStaticAttribute(html, "tick-label-decimal-places", gauge.tickLabelDecimalPlaces);
  appendBooleanAttribute(html, "tick-label-exponential-format", getStaticValue(gauge.tickLabelExponentialFormat) ?? false);
  appendStaticAttribute(html, "bar-mode", gauge.barMode);
  appendStaticAttribute(html, "scale-mode", gauge.scaleMode);
  appendStaticAttribute(html, "orientation", gauge.orientation);
  appendBooleanAttribute(html, "show-value", getStaticValueOrDefault(gauge.showValue, true));
  appendStaticAttribute(html, "value-position", gauge.valuePosition);
  appendStaticAttribute(html, "label-color", gauge.labelColor);
  appendStaticAttribute(html, "scale-background-color", gauge.scaleBackgroundColor);
  appendStaticAttribute(html, "scale-foreground-color", gauge.scaleForegroundColor);
  appendStaticAttribute(html, "tick-color", gauge.tickColor);
  appendAttribute(html, "label-font", formatFont(gauge.labelFont?.getForCulture(context.options.cultureLcid)));
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

function appendTrendControl(html: string[], trendControl: HmiTrendControlBase, context: HmiHtmlConvertContext): void {
  html.push("<hmi-trend-control");
  appendCommonAttributes(html, trendControl, context, true, createTrendControlStyle(trendControl, context));
  appendAttribute(html, "data-window-resizable", resolvePropertyPreview(trendControl.resizable));
  appendAttribute(html, "data-window-movable", resolvePropertyPreview(trendControl.movable));
  appendAttribute(html, "data-window-closeable", resolvePropertyPreview(trendControl.closeable));
  appendAttribute(html, "control-name", trendControl.name);
  appendAttribute(html, "type-name", trendControl instanceof HmiFunctionTrendControl ? "Function trend control" : "Trend control");
  appendStaticAttribute(html, "chart-style", trendControl instanceof HmiFunctionTrendControl
    ? staticProperty(HmiTrendChartStyle.XYPlot) : trendControl.chartStyle);
  appendAttribute(html, "chart-title", trendControl.chartTitleText?.getText(context.options.cultureLcid) ?? trendControl.chartTitle, true);
  appendStaticAttribute(html, "window-background-color", trendControl.windowBackgroundColor);
  appendStaticBooleanValueAttribute(html, "display-chart-title", trendControl.displayChartTitle);
  appendStaticBooleanValueAttribute(html, "show-toolbar", trendControl.showToolbar);
  appendStaticAttribute(html, "toolbar-alignment", trendControl.toolbarAlignment);
  appendStaticBooleanValueAttribute(html, "use-toolbar-background-color", trendControl.useToolbarBackgroundColor);
  appendStaticAttribute(html, "toolbar-background-color", trendControl.toolbarBackgroundColor);
  appendStaticAttribute(html, "toolbar-button-size", trendControl.toolbarButtonSize);
  if (trendControl.toolbarButtons.length > 0) appendAttribute(html, "toolbar-buttons", JSON.stringify(trendControl.toolbarButtons.map(button=>({
    sourceType:button.sourceType, visible:getStaticValue(button.visible), enabled:getStaticValue(button.enabled),
    order:getStaticValue(button.order), tooltip:button.tooltip?.getText(context.options.cultureLcid),
  }))));
  appendStaticBooleanValueAttribute(html, "show-status-bar", trendControl.showStatusBar);
  appendAttribute(html, "status-bar-text", trendControl.statusBarText?.getText(context.options.cultureLcid), true);
  appendStaticBooleanValueAttribute(html, "show-status-bar-tooltips", trendControl.showStatusBarTooltips);
  if (trendControl.statusBarPanels.length > 0) appendAttribute(html, "status-bar-panels", JSON.stringify(trendControl.statusBarPanels.map(panel => ({
    sourceType: panel.sourceType, visible: getStaticValue(panel.visible), order: getStaticValue(panel.order),
    text: panel.text?.getText(context.options.cultureLcid), tooltip: panel.tooltip?.getText(context.options.cultureLcid),
    width: Number.isFinite(getStaticValue(panel.width)) ? getStaticValue(panel.width) : undefined,
    autoSize: getStaticValue(panel.autoSize),
  }))));
  appendStaticBooleanValueAttribute(html, "use-status-bar-background-color", trendControl.useStatusBarBackgroundColor);
  appendStaticBooleanValueAttribute(html, "display-pen-icons", trendControl.displayPenIcons);
  appendStaticBooleanValueAttribute(html, "use-trend-name-as-label", trendControl.useTrendNameAsLabel);
  appendStaticBooleanValueAttribute(html, "display-value-bar", trendControl.displayValueBar);
  appendStaticBooleanValueAttribute(html, "use-graphic-value-bar", trendControl.useGraphicValueBar);
  appendStaticAttribute(html, "value-bar-color", trendControl.valueBarColor);
  appendStaticAttribute(html, "value-bar-width", trendControl.valueBarWidth);
  appendStaticBooleanValueAttribute(html, "show-value-bar-in-x-axis", trendControl.showValueBarInXAxis);
  appendStaticBooleanValueAttribute(html, "display-statistic-rulers", trendControl.displayStatisticRulers);
  appendStaticBooleanValueAttribute(html, "use-graphic-statistic-rulers", trendControl.useGraphicStatisticRulers);
  appendStaticAttribute(html, "statistic-ruler-color", trendControl.statisticRulerColor);
  appendStaticAttribute(html, "statistic-ruler-width", trendControl.statisticRulerWidth);
  appendStaticBooleanValueAttribute(html, "display-scroll-mechanism", trendControl.displayScrollMechanism);
  appendStaticBooleanValueAttribute(html, "chart-live-mode", trendControl.chartLiveMode);
  appendStaticBooleanValueAttribute(html, "auto-scale", trendControl.autoScale);
  appendStaticBooleanValueAttribute(html, "x-axis-scale-visible", trendControl.xAxisScaleVisible);
  appendStaticAttribute(html, "x-axis-color", trendControl.xAxisColor);
  appendStaticBooleanValueAttribute(html, "x-axis-in-trend-color", trendControl.xAxisInTrendColor);
  appendStaticAttribute(html, "x-axis-alignment", trendControl.xAxisAlignment);
  appendAttribute(html, "x-axis-label", trendControl.xAxisLabel);
  appendStaticBooleanValueAttribute(html, "x-axis-date-visible", trendControl.xAxisDateVisible);
  appendStaticValueAttribute(html, "x-axis-date-format", trendControl.xAxisDateFormat);
  appendStaticBooleanValueAttribute(html, "x-axis-flipped", trendControl.xAxisFlipped);
  appendStaticAttribute(html, "time-format", trendControl.timeFormat);
  appendStaticAttribute(html, "time-base", trendControl.timeBase);
  appendAttribute(html, "project-time-zone", trendControl.projectTimeZoneId);
  appendStaticBooleanValueAttribute(html, "display-milliseconds", trendControl.displayMilliseconds);
  appendStaticAttribute(html, "x-axis-time-span", trendControl.xAxisTimeSpan);
  appendAttribute(html, "x-axis-time-span-unit", trendControl.xAxisTimeSpanUnit);
  appendStaticBooleanValueAttribute(html, "x-axis-grid-visible", trendControl.xAxisGridVisible);
  appendStaticBooleanValueAttribute(html, "major-grid-visible", trendControl.majorGridVisible);
  appendStaticAttribute(html, "major-grid-color", trendControl.majorGridColor);
  appendStaticBooleanValueAttribute(html, "minor-grid-visible", trendControl.minorGridVisible);
  appendStaticAttribute(html, "minor-grid-color", trendControl.minorGridColor);
  appendStaticBooleanValueAttribute(html, "grid-in-trend-color", trendControl.gridInTrendColor);
  appendStaticBooleanValueAttribute(html, "y-axis-scale-visible", trendControl.yAxisScaleVisible);
  appendStaticAttribute(html, "y-axis-color", trendControl.yAxisColor);
  appendStaticBooleanValueAttribute(html, "y-axis-in-trend-color", trendControl.yAxisInTrendColor);
  appendStaticAttribute(html, "y-axis-alignment", trendControl.yAxisAlignment);
  appendAttribute(html, "y-axis-label", trendControl.yAxisLabel);
  appendStaticBooleanValueAttribute(html, "y-axis-grid-visible", trendControl.yAxisGridVisible);
  appendStaticBooleanValueAttribute(html, "show-percentage-axis", trendControl.showPercentageAxis);
  appendStaticAttribute(html, "percentage-axis-color", trendControl.percentageAxisColor);
  appendStaticAttribute(html, "percentage-axis-alignment", trendControl.percentageAxisAlignment);
  appendStaticAttribute(html, "minimum-value", trendControl.minimumValue);
  appendStaticAttribute(html, "maximum-value", trendControl.maximumValue);
  appendStaticAttribute(html, "y-axis-decimal-places", trendControl.yAxisDecimalPlaces);
  appendAttribute(html, "pens", formatTrendPens(trendControl.pens, context.options.cultureLcid));
  appendAttribute(html, "value-axes", formatTrendValueAxes(trendControl.valueAxes, context.options.cultureLcid));
  appendAttribute(html, "x-value-axes", formatTrendXValueAxes(trendControl.xValueAxes));
  appendAttribute(html, "trend-windows", formatTrendWindows(trendControl.trendWindows));
  appendAttribute(html, "time-axes", formatTrendTimeAxes(trendControl.timeAxes, context.options.cultureLcid));
  appendAttribute(html, "data-table-header-background-color", resolvePropertyPreview(trendControl.headerBackgroundColor));
  appendAttribute(html, "data-table-header-foreground-color", resolvePropertyPreview(trendControl.headerForegroundColor));
  appendAttribute(html, "data-table-header-border-color", resolvePropertyPreview(trendControl.headerBorderColor));
  appendAttribute(html, "data-table-header-border-width", resolvePropertyPreview(trendControl.headerBorderWidth));
  appendAttribute(html, "data-table-background-color", resolvePropertyPreview(trendControl.contentBackgroundColor));
  appendAttribute(html, "data-table-foreground-color", resolvePropertyPreview(trendControl.contentForegroundColor));
  appendAttribute(html, "data-table-grid-lines-visible", resolvePropertyPreview(trendControl.showTableGridLines));
  appendAttribute(html, "data-table-grid-line-color", resolvePropertyPreview(trendControl.tableGridLineColor));
  appendAttribute(html, "data-table-alternating-row-background-color", resolvePropertyPreview(trendControl.alternatingRowBackgroundColor));
  html.push("></hmi-trend-control>");
}

function createControlWindowStyle(window: HmiWindowBase, baseStyle: string): string {
  return getStaticValue(window.resizable) === true ? `${baseStyle}resize: both;` : baseStyle;
}

function createAlarmControlStyle(alarmControl: HmiAlarmControl, context: HmiHtmlConvertContext, set: HmiAlarmColumnSet | undefined): string {
  const horizontalOverflow = scrollBarOverflow(set?.horizontalScrollBarVisibility, getStaticValue(alarmControl.showHorizontalScrollbar) === true ? "auto" : "hidden");
  const verticalOverflow = scrollBarOverflow(set?.verticalScrollBarVisibility, getStaticValue(alarmControl.showVerticalScrollbar) === true ? "auto" : "hidden");
  let style = createControlWindowStyle(
    alarmControl,
    `display: flex; flex-direction: column; overflow-x: ${horizontalOverflow};overflow-y: ${verticalOverflow};`,
  );
  const gridLineColor = getStaticValue(alarmControl.gridLineColor);
  if (gridLineColor !== undefined)
    style += `--hmi-grid-line-color: ${colorToCss(gridLineColor)};`;
  const parts = [style];
  if (alarmControl.contentFont !== undefined)
    appendFont(parts, alarmControl.contentFont.getForCulture(context.options.cultureLcid));
  return parts.join("");

  function scrollBarOverflow(property: HmiProperty<number> | undefined, fallback: string): string {
    switch (getStaticValue(property)) { case 0: return "auto"; case 1: return "scroll"; case 2: return "hidden"; default: return fallback; }
  }
}

function appendAlarmViewSettings(html: string[], set: HmiAlarmColumnSet | undefined, context: HmiHtmlConvertContext): void {
  if (set === undefined) return;
  appendAttribute(html, "data-column-set-name", set.name, true);
  appendAttribute(html, "data-view-allow-sort", resolvePropertyPreview(set.allowSort));
  appendAttribute(html, "data-view-allow-filter", resolvePropertyPreview(set.allowFilter));
  appendAttribute(html, "data-view-allow-column-reorder", resolvePropertyPreview(set.allowColumnReorder));
  appendAttribute(html, "data-view-allow-column-resize", resolvePropertyPreview(set.allowColumnResize));
  appendAttribute(html, "data-view-background-color", resolvePropertyPreview(set.backgroundColor));
  appendAttribute(html, "data-view-foreground-color", resolvePropertyPreview(set.foregroundColor));
  appendAttribute(html, "data-view-header-background-color", resolvePropertyPreview(set.headerBackgroundColor));
  appendAttribute(html, "data-view-header-foreground-color", resolvePropertyPreview(set.headerForegroundColor));
  appendAttribute(html, "data-view-header-border-color", resolvePropertyPreview(set.headerBorderColor));
  appendAttribute(html, "data-view-grid-line-color", resolvePropertyPreview(set.gridLineColor));
  appendAttribute(html, "data-view-grid-line-width", resolvePropertyPreview(set.gridLineWidth));
  appendAttribute(html, "data-view-grid-line-visibility", resolvePropertyPreview(set.gridLineVisibility));
  appendAttribute(html, "data-view-cell-padding-left", resolvePropertyPreview(set.cellPaddingLeft));
  appendAttribute(html, "data-view-cell-padding-top", resolvePropertyPreview(set.cellPaddingTop));
  appendAttribute(html, "data-view-cell-padding-right", resolvePropertyPreview(set.cellPaddingRight));
  appendAttribute(html, "data-view-cell-padding-bottom", resolvePropertyPreview(set.cellPaddingBottom));
  appendAttribute(html, "data-view-row-height", resolvePropertyPreview(set.rowHeight));
  appendAttribute(html, "data-view-horizontal-scrollbar-visibility", resolvePropertyPreview(set.horizontalScrollBarVisibility));
  appendAttribute(html, "data-view-vertical-scrollbar-visibility", resolvePropertyPreview(set.verticalScrollBarVisibility));
  appendAttribute(html, "data-view-grid-selection-mode", resolvePropertyPreview(set.gridSelectionMode));
  appendAttribute(html, "data-view-select-full-row", resolvePropertyPreview(set.selectFullRow));
  for (const [role, font] of [["content", set.contentFont], ["header", set.headerFont]] as const) {
    if (font === undefined) continue;
    const style: string[] = [];
    appendFont(style, font.getForCulture(context.options.cultureLcid), false);
    appendAttribute(html, `data-view-${role}-font-style`, style.join(""), true);
  }
}

function appendAlarmMessageBlocks(html: string[], control: HmiAlarmControl, context: HmiHtmlConvertContext): void {
  if (control.messageBlocks.length === 0) return;
  html.push('<details class="hmi-alarm-message-blocks" style="flex: 0 0 auto;"><summary>Configured message blocks</summary><table><thead><tr><th>Name</th><th>Caption</th><th>Date format</th><th>Time format</th></tr></thead><tbody>');
  for (const block of control.messageBlocks) {
    html.push('<tr');
    appendAttribute(html, "data-message-block-name", block.name, true);
    appendAttribute(html, "data-alignment", resolvePropertyPreview(block.alignment));
    appendAttribute(html, "data-decimal-places", resolvePropertyPreview(block.decimalPlaces));
    appendAttribute(html, "data-leading-zeros", resolvePropertyPreview(block.leadingZeros));
    appendAttribute(html, "data-automatic-decimal-places", resolvePropertyPreview(block.automaticDecimalPlaces));
    appendAttribute(html, "data-exponential-format", resolvePropertyPreview(block.exponentialFormat));
    appendAttribute(html, "data-show-date", resolvePropertyPreview(block.showDate));
    html.push('><td>',escapeHtml(block.name ?? ''),'</td><td>',escapeHtml(block.caption?.getText(context.options.cultureLcid) ?? ''),'</td><td>',escapeHtml(block.dateFormat ?? ''),'</td><td>',escapeHtml(block.timeFormat ?? ''),'</td></tr>');
  }
  html.push('</tbody></table></details>');
}

function createAlarmHeaderStyle(alarmControl: HmiAlarmControl, context: HmiHtmlConvertContext): string {
  const parts = ["flex: 0 0 auto; display: flex; align-items: center; border-bottom: 1px solid currentColor; padding: 2px 4px; font-weight: bold;"];
  appendColorStyle(parts, "background-color", alarmControl.headerBackgroundColor);
  appendColorStyle(parts, "color", alarmControl.headerForegroundColor);
  appendColorStyle(parts, "border-bottom-color", alarmControl.headerBorderColor);
  if (alarmControl.headerFont !== undefined)
    appendFont(parts, alarmControl.headerFont.getForCulture(context.options.cultureLcid));
  return parts.join("");
}

function createAlarmTableStyle(alarmControl: HmiAlarmControl, set: HmiAlarmColumnSet | undefined, context: HmiHtmlConvertContext): string {
  const parts = ["width: 100%; border-collapse: collapse; table-layout: fixed;"];
  appendColorStyle(parts, "background-color", set?.backgroundColor ?? alarmControl.tableBackgroundColor);
  appendColorStyle(parts, "color", set?.foregroundColor ?? alarmControl.tableForegroundColor);
  if (set?.contentFont !== undefined) appendFont(parts, set.contentFont.getForCulture(context.options.cultureLcid));
  const alternatingBackground = getStaticValue(alarmControl.alternatingRowBackgroundColor);
  if (alternatingBackground !== undefined)
    parts.push(`--hmi-alarm-alternating-row-background: ${colorToCss(alternatingBackground)};`);
  const alternatingForeground = getStaticValue(alarmControl.alternatingRowForegroundColor);
  if (alternatingForeground !== undefined)
    parts.push(`--hmi-alarm-alternating-row-foreground: ${colorToCss(alternatingForeground)};`);
  return parts.join("");
}

function createAlarmGridCellStyle(alarmControl: HmiAlarmControl, set: HmiAlarmColumnSet | undefined): string {
  let horizontal = getStaticValue(alarmControl.showHorizontalGridLines) !== false;
  let vertical = getStaticValue(alarmControl.showVerticalGridLines) !== false;
  let width = Math.max(0, getStaticValue(alarmControl.gridLineWidth) ?? 1);
  const mode = getStaticValue(set?.gridLineVisibility);
  if (mode === 0) { horizontal = false; vertical = false; }
  else if (mode === 1) { horizontal = false; vertical = true; }
  else if (mode === 2) { horizontal = true; vertical = false; }
  const configuredWidth = getStaticValue(set?.gridLineWidth);
  if (configuredWidth !== undefined && Number.isFinite(configuredWidth) && configuredWidth >= 0) width = configuredWidth;
  const parts = [`border-style: solid; border-color: var(--hmi-grid-line-color, currentColor); border-width: ${horizontal ? toCss(width) : "0"}px ${vertical ? toCss(width) : "0"}px;`];
  appendColorStyle(parts, "border-color", set?.gridLineColor);
  for (const [side, property] of [
    ["top", set?.cellPaddingTop ?? alarmControl.cellPaddingTop], ["right", set?.cellPaddingRight ?? alarmControl.cellPaddingRight],
    ["bottom", set?.cellPaddingBottom ?? alarmControl.cellPaddingBottom], ["left", set?.cellPaddingLeft ?? alarmControl.cellPaddingLeft],
  ] as const) {
    const value = getStaticValue(property);
    if (value !== undefined && Number.isFinite(value) && value >= 0) parts.push(`padding-${side}: ${toCss(value)}px;`);
  }
  return parts.join("");
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

function createAlarmShorteningStyle(property: HmiProperty<boolean> | undefined): string {
  const value = getStaticValue(property);
  if (value === undefined) return "";
  return value ? "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" : "overflow: hidden; text-overflow: clip;";
}

function createAlarmTableHeaderCellStyle(alarmControl: HmiAlarmControl, gridCellStyle: string, context: HmiHtmlConvertContext, set: HmiAlarmColumnSet | undefined): string {
  const parts = [gridCellStyle, createAlarmShorteningStyle(alarmControl.shortenColumnTitles)];
  appendColorStyle(parts, "background-color", set?.headerBackgroundColor ?? alarmControl.tableHeaderBackgroundColor);
  appendColorStyle(parts, "color", set?.headerForegroundColor ?? alarmControl.tableHeaderForegroundColor);
  const horizontalAlignment = getStaticValue(alarmControl.tableHeaderHorizontalAlignment);
  if (horizontalAlignment !== undefined)
    parts.push(`text-align: ${horizontalAlignmentToCss(horizontalAlignment)};`);
  appendColorStyle(parts, "border-color", set?.headerBorderColor ?? alarmControl.tableHeaderBorderColor);
  const borderWidth = getStaticValue(alarmControl.tableHeaderBorderWidth);
  if (borderWidth !== undefined) parts.push(`border-width: ${toCss(Math.max(0, borderWidth))}px;`);
  const font = set?.headerFont ?? alarmControl.headerFont;
  if (font !== undefined) appendFont(parts, font.getForCulture(context.options.cultureLcid));
  return parts.join("");
}

function createTrendControlStyle(trendControl: HmiTrendControlBase, context: HmiHtmlConvertContext): string {
  const parts = [createControlWindowStyle(trendControl, "overflow: hidden;")];
  appendFontVariables(parts, "content", trendControl.contentFont?.getForCulture(context.options.cultureLcid));
  appendFontVariables(parts, "header", trendControl.headerFont?.getForCulture(context.options.cultureLcid));
  appendFontVariables(parts, "toolbar", trendControl.toolbarFont?.getForCulture(context.options.cultureLcid));
  appendColorStyle(parts, "--hmi-trend-toolbar-foreground", trendControl.toolbarForegroundColor);
  appendFontVariables(parts, "status", trendControl.statusBarFont?.getForCulture(context.options.cultureLcid));
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
  const majorGridColor = getStaticValue(trendControl.majorGridColor);
  if (majorGridColor !== undefined)
    parts.push(`--hmi-trend-major-grid-color: ${colorToCss(majorGridColor)};`);
  const minorGridColor = getStaticValue(trendControl.minorGridColor);
  if (minorGridColor !== undefined)
    parts.push(`--hmi-trend-minor-grid-color: ${colorToCss(minorGridColor)};`);
  const xAxisColor = getStaticValue(trendControl.xAxisColor);
  if (xAxisColor !== undefined)
    parts.push(`--hmi-trend-x-axis-color: ${colorToCss(xAxisColor)};`);
  const yAxisColor = getStaticValue(trendControl.yAxisColor);
  if (yAxisColor !== undefined)
    parts.push(`--hmi-trend-y-axis-color: ${colorToCss(yAxisColor)};`);
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
  if (role === "toolbar") {
    if (getStaticValue(font.italic) === false) html.push(`${prefix}font-style: normal;`);
    if (getStaticValue(font.bold) === false && (weight ?? 0) <= 0) html.push(`${prefix}font-weight: normal;`);
    if (getStaticValue(font.underline) === false && getStaticValue(font.strikethrough) === false) html.push(`${prefix}text-decoration: none;`);
  }
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

function formatTrendTimeAxes(axes: readonly HmiTrendTimeAxis[], cultureLcid?: number): string | undefined {
  if (!axes.length) return undefined;
  return JSON.stringify(axes.map(axis => {
    const result: Record<string, string | number | boolean> = {};
    if (axis.name !== undefined) result.name = axis.name;
    if (axis.trendWindowName !== undefined) result.trendWindowName = axis.trendWindowName;
    const label = axis.labelText?.getText(cultureLcid) ?? axis.label;
    if (label !== undefined) result.label = label;
    if (axis.timeSpanUnit !== undefined) result.timeSpanUnit = axis.timeSpanUnit;
    for (const key of ["visible", "showDate", "inTrendColor", "displayMilliseconds", "refreshEnabled"] as const) {
      const value = getStaticValue(axis[key]);
      if (value !== undefined) result[key] = value;
    }
    for (const key of ["dateFormat", "alignment", "timeFormat", "timeFormatPattern", "rangeType", "startTime", "endTime"] as const) {
      const value = getStaticValue(axis[key]);
      if (value !== undefined) result[key] = value;
    }
    const color = getStaticValue(axis.color);
    if (color !== undefined) result.color = colorToCss(color);
    for (const key of ["timeRangeBaseCode", "timeRangeFactor", "timeRangeBaseMilliseconds"] as const) {
      const value = getStaticValue(axis[key]);
      if (typeof value === "number" && Number.isFinite(value)) result[key] = value;
    }
    const timeSpan = getStaticValue(axis.timeSpan);
    if (timeSpan !== undefined) result.timeSpan = timeSpan;
    const measurementPoints = getStaticValue(axis.measurementPoints);
    if (measurementPoints !== undefined) result.measurementPoints = measurementPoints;
    return result;
  }));
}

function formatTrendXValueAxes(axes: readonly HmiTrendXValueAxis[]): string | undefined {
  if (!axes.length) return undefined;
  return JSON.stringify(axes.map(axis => {
    const result: Record<string, string | number | boolean> = {};
    for (const key of ["name", "trendWindowName", "label"] as const) {
      if (axis[key] !== undefined) result[key] = axis[key];
    }
    for (const key of ["visible", "autoRange", "exponentialFormat"] as const) {
      const value = getStaticValue(axis[key]);
      if (value !== undefined) result[key] = value;
    }
    for (const [key, property] of [["minimum", axis.minimumValue], ["maximum", axis.maximumValue],
      ["divisionCount", axis.divisionCount], ["decimalPlaces", axis.decimalPlaces], ["scaleType", axis.scaleType]] as const) {
      const value = getStaticValue(property);
      if (value !== undefined && Number.isFinite(value)) result[key] = value;
    }
    const color = getStaticValue(axis.color);
    if (color !== undefined) result.color = colorToCss(color);
    const alignment = getStaticValue(axis.alignment);
    if (alignment !== undefined) result.alignment = HmiVerticalAlignment[alignment];
    return result;
  }));
}

function formatTrendWindows(windows: readonly HmiTrendWindow[]): string | undefined {
  if (!windows.length) return undefined;
  return JSON.stringify(windows.map(window => {
    const result: Record<string, string | number | boolean> = {};
    if (window.name !== undefined) result.name = window.name;
    for (const key of ["visible", "xAxisGridVisible", "yAxisGridVisible", "majorGridVisible", "minorGridVisible", "gridInTrendColor", "useGraphicValueBar", "useGraphicStatisticRulers"] as const) {
      const value = getStaticValue(window[key]);
      if (value !== undefined) result[key] = value;
    }
    for (const key of ["spacePortion", "sizeFactor", "valueBarWidth", "statisticRulerWidth"] as const) {
      const value = getStaticValue(window[key]);
      if (value !== undefined) result[key] = value;
    }
    for (const key of ["backgroundColor", "majorGridColor", "minorGridColor", "valueBarColor", "statisticRulerColor"] as const) {
      const value = getStaticValue(window[key]);
      if (value !== undefined) result[key] = colorToCss(value);
    }
    return result;
  }));
}

// Use the same axis wire fields as legacy per-pen configurations.
function formatTrendValueAxes(axes: readonly HmiTrendValueAxis[], cultureLcid?: number): string | undefined {
  return formatTrendPens(axes.map((axis, index) => {
    const pen = new HmiTrendPen();
    pen.number = index + 1;
    if (axis.name !== undefined) pen.valueAxisName = axis.name;
    const label = axis.labelText?.getText(cultureLcid) ?? axis.label;
    if (label !== undefined) pen.valueAxisLabel = label;
    if (axis.trendWindowName !== undefined) pen.trendWindowName = axis.trendWindowName;
    if (axis.minimumValue !== undefined) pen.minimumValue = axis.minimumValue;
    if (axis.maximumValue !== undefined) pen.maximumValue = axis.maximumValue;
    if (axis.decimalPlaces !== undefined) pen.decimalPlaces = axis.decimalPlaces;
    if (axis.divisionCount !== undefined) pen.valueAxisDivisionCount = axis.divisionCount;
    if (axis.autoScale !== undefined) pen.valueAxisAutoScale = axis.autoScale;
    if (axis.scaleType !== undefined) pen.axisScaleType = axis.scaleType;
    if (axis.exponentialFormat !== undefined) pen.exponentialFormat = axis.exponentialFormat;
    if (axis.autoDecimalPlaces !== undefined) pen.autoDecimalPlaces = axis.autoDecimalPlaces;
    if (axis.visible !== undefined) pen.valueAxisVisible = axis.visible;
    if (axis.color !== undefined) pen.valueAxisColor = axis.color;
    if (axis.inTrendColor !== undefined) pen.valueAxisInTrendColor = axis.inTrendColor;
    if (axis.alignment !== undefined) pen.valueAxisAlignment = axis.alignment;
    return pen;
  }));
}

function formatTrendPens(pens: readonly HmiTrendPen[], cultureLcid?: number): string | undefined {
  if (pens.length === 0) return undefined;
  return JSON.stringify(pens.map(pen => {
    const result: Record<string, string | number | boolean> = { number: pen.number };
    if (pen.name !== undefined) result.name = pen.name;
    const label = pen.labelText?.getText(cultureLcid) ?? pen.label;
    if (label !== undefined) result.label = label;
    if (pen.trendWindowName !== undefined) result.trendWindowName = pen.trendWindowName;
    if (pen.timeAxisName !== undefined) result.timeAxisName = pen.timeAxisName;
    const color = getStaticValue(pen.color);
    if (color !== undefined) result.color = colorToCss(color);
    const visible = getStaticValue(pen.visible);
    if (visible !== undefined) result.visible = visible;
    const width = getStaticValue(pen.width);
    if (width !== undefined) result.width = width;
    const lineType = getStaticValue(pen.lineType);
    if (lineType !== undefined) result.lineType = lineType;
    const style = getStaticValue(pen.style);
    if (style !== undefined) result.style = style;
    const fill = getStaticValue(pen.fillVisible);
    if (fill !== undefined) result.fill = fill;
    const fillColor = getStaticValue(pen.fillColor);
    if (fillColor !== undefined) result.fillColor = colorToCss(fillColor);
    const lowerLimitColoring = getStaticValue(pen.lowerLimitColoring);
    if (lowerLimitColoring !== undefined) result.lowerLimitColoring = lowerLimitColoring;
    const lowerLimit = getStaticValue(pen.lowerLimitValue);
    if (lowerLimit !== undefined) result.lowerLimit = lowerLimit;
    const lowerLimitColor = getStaticValue(pen.lowerLimitColor);
    if (lowerLimitColor !== undefined) result.lowerLimitColor = colorToCss(lowerLimitColor);
    const upperLimitColoring = getStaticValue(pen.upperLimitColoring);
    if (upperLimitColoring !== undefined) result.upperLimitColoring = upperLimitColoring;
    const upperLimit = getStaticValue(pen.upperLimitValue);
    if (upperLimit !== undefined) result.upperLimit = upperLimit;
    const upperLimitColor = getStaticValue(pen.upperLimitColor);
    if (upperLimitColor !== undefined) result.upperLimitColor = colorToCss(upperLimitColor);
    const uncertainColoring = getStaticValue(pen.uncertainColoring);
    if (uncertainColoring !== undefined) result.uncertainColoring = uncertainColoring;
    const uncertainColor = getStaticValue(pen.uncertainColor);
    if (uncertainColor !== undefined) result.uncertainColor = colorToCss(uncertainColor);
    const showAlarms = getStaticValue(pen.showAlarms);
    if (showAlarms !== undefined) result.showAlarms = showAlarms;
    const valueAlignment = getStaticValue(pen.valueAlignment);
    if (valueAlignment !== undefined) result.valueAlignment = valueAlignment;
    const marker = getStaticValue(pen.marker);
    if (marker !== undefined) result.marker = marker;
    const markerColor = getStaticValue(pen.markerColor);
    if (markerColor !== undefined) result.markerColor = colorToCss(markerColor);
    const markerSize = getStaticValue(pen.markerSize);
    if (markerSize !== undefined) result.markerSize = markerSize;
    const minimum = getStaticValue(pen.minimumValue);
    if (minimum !== undefined) result.minimum = minimum;
    const maximum = getStaticValue(pen.maximumValue);
    if (maximum !== undefined) result.maximum = maximum;
    const axisScaleType = getStaticValue(pen.axisScaleType);
    if (axisScaleType !== undefined) result.axisScaleType = axisScaleType;
    const valueAxisDivisionCount = getStaticValue(pen.valueAxisDivisionCount);
    if (valueAxisDivisionCount !== undefined) result.valueAxisDivisionCount = valueAxisDivisionCount;
    const valueAxisAutoScale = getStaticValue(pen.valueAxisAutoScale);
    if (valueAxisAutoScale !== undefined) result.valueAxisAutoScale = valueAxisAutoScale;
    const exponentialFormat = getStaticValue(pen.exponentialFormat);
    if (exponentialFormat !== undefined) result.exponentialFormat = exponentialFormat;
    const autoDecimalPlaces = getStaticValue(pen.autoDecimalPlaces);
    if (autoDecimalPlaces !== undefined) result.autoDecimalPlaces = autoDecimalPlaces;
    const decimalPlaces = getStaticValue(pen.decimalPlaces);
    if (decimalPlaces !== undefined) result.decimalPlaces = decimalPlaces;
    if (pen.valueAxisName !== undefined) result.valueAxisName = pen.valueAxisName;
    const valueAxisVisible = getStaticValue(pen.valueAxisVisible);
    if (valueAxisVisible !== undefined) result.valueAxisVisible = valueAxisVisible;
    const valueAxisColor = getStaticValue(pen.valueAxisColor);
    if (valueAxisColor !== undefined) result.valueAxisColor = colorToCss(valueAxisColor);
    const valueAxisInTrendColor = getStaticValue(pen.valueAxisInTrendColor);
    if (valueAxisInTrendColor !== undefined) result.valueAxisInTrendColor = valueAxisInTrendColor;
    const valueAxisAlignment = getStaticValue(pen.valueAxisAlignment);
    if (valueAxisAlignment !== undefined) result.valueAxisAlignment = valueAxisAlignment;
    if (pen.valueAxisLabel !== undefined) result.valueAxisLabel = pen.valueAxisLabel;
    const unit = pen.engineeringUnitText?.getText(cultureLcid) ?? pen.engineeringUnit;
    if (unit !== undefined) result.unit = unit;
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
  const focusItem = item instanceof HmiWidgetBase || item instanceof HmiWindowBase ? item : undefined;
  const focusColor = getStaticValue(focusItem?.focusColor);
  const focusWidth = getStaticValue(focusItem?.focusWidth);
  const hasFocusWidth = focusWidth !== undefined && Number.isFinite(focusWidth) && focusWidth >= 0;
  appendAttribute(html, "data-focus-color", resolvePropertyPreview(focusItem?.focusColor));
  appendAttribute(html, "data-focus-width", resolvePropertyPreview(focusItem?.focusWidth));
  if (focusColor !== undefined || hasFocusWidth) appendAttribute(html, "data-hmi-focus-appearance", "true");
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
  if (focusColor !== undefined) html.push(`--hmi-focus-color: ${colorToCss(focusColor)};`);
  if (hasFocusWidth) html.push(`--hmi-focus-width: ${toCss(focusWidth)}px;`);
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
  if (item instanceof HmiBar && getStaticValue(item.showScale) !== true)
    foregroundColor = getBarThresholdFillColor(item) ?? foregroundColor;
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
    const barTrackColor = getStaticValue(backgroundColor);
    if (item instanceof HmiBar && barTrackColor !== undefined)
      html.push(`--hmi-bar-track-background: ${colorToCss(barTrackColor)};`);
  }
  let borderColor = context.effectiveProperties.resolve(item, "BorderColor", item.borderColor);
  let borderWidth = context.effectiveProperties.resolve(item, "BorderWidth", item.borderWidth);
  const framedShapeBorder = (item instanceof HmiRectangle || item instanceof HmiText || item instanceof HmiGraphicView) && item.drawStrokeInsideFrame !== undefined;
  if (framedShapeBorder && item instanceof HmiShapeBase) {
    borderColor = context.effectiveProperties.resolve(item, "LineColor", item.lineColor) ?? borderColor;
    borderWidth = context.effectiveProperties.resolve(item, "LineWidth", item.lineWidth) ?? borderWidth;
  }
  const borderBlink = borderColor?.kind === HmiPropertyKind.Blink
    ? borderColor as HmiBlinkProperty<HmiColor>
    : undefined;
  const resolvedBorderWidth = getStaticValue(borderWidth);
  const centeredBorder = resolvedBorderWidth !== undefined && resolvedBorderWidth > 1 &&
    ((item instanceof HmiBar || item instanceof HmiSlider) && item.drawInsideFrame !== undefined &&
      !getStaticValue(context.effectiveProperties.resolve(item, "DrawInsideFrame", item.drawInsideFrame)) ||
     (item instanceof HmiRectangle || item instanceof HmiText || item instanceof HmiGraphicView) && item.drawStrokeInsideFrame !== undefined &&
      !getStaticValue(context.effectiveProperties.resolve(item, "DrawStrokeInsideFrame", item.drawStrokeInsideFrame)) ||
     item instanceof HmiButton && item.drawStrokeInsideFrame !== undefined &&
      !getStaticValue(item.drawStrokeInsideFrame) ||
     item instanceof HmiSymbolicIOField && item.drawStrokeInsideFrame !== undefined &&
      !getStaticValue(context.effectiveProperties.resolve(item, "DrawStrokeInsideFrame", item.drawStrokeInsideFrame)));
  if (borderBlink?.staticValue !== undefined && borderBlink.blinkValue !== undefined) {
    html.push(`--hmi-border-color-off: ${colorToCss(borderBlink.staticValue)};`);
    html.push(`--hmi-border-color-on: ${colorToCss(borderBlink.blinkValue)};`);
    animations.push(`${centeredBorder ? "hmi-outline-color-flash" : "hmi-border-color-flash"} ${getBlinkDuration(borderBlink.rate)}s steps(1, end) infinite`);
  } else {
    appendColorStyle(html, "border-color", borderColor);
  }
  if (animations.length > 0)
    html.push(`animation: ${animations.join(", ")};`);
  appendWidthStyle(html, borderWidth, borderStyle, !suppressBorderStyle);
  if (centeredBorder && resolvedBorderWidth !== undefined) {
    const color = getStaticValue(borderColor);
    html.push(`border-width: 0px;outline-style: ${borderStyle};outline-width: ${toCss(resolvedBorderWidth)}px;`);
    html.push(`outline-offset: ${toCss(-resolvedBorderWidth / 2)}px;outline-color: ${color === undefined ? "currentColor" : colorToCss(color)};`);
  }
  if (item instanceof HmiShapeBase && !framedShapeBorder) {
    appendColorStyle(html, "border-color", item.lineColor);
    appendWidthStyle(html, item.lineWidth, borderStyle);
  }
  appendFillPatternStyle(html, item, context);
  const colorGradient = getColorGradient(item);
  appendColorGradientStyle(html, colorGradient);
  if (item instanceof HmiBar)
    appendColorGradientStyle(html, colorGradient, "--hmi-bar-track-background");
  if (item instanceof HmiBar) {
    const explicitTrackColor = getStaticValue(context.effectiveProperties.resolve(item, "TrackColor", item.trackColor));
    if (explicitTrackColor !== undefined)
      html.push(`--hmi-bar-track-background: ${colorToCss(explicitTrackColor)} !important;`);
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
  const centeredTextInset = item instanceof HmiText && centeredBorder ? (resolvedBorderWidth ?? 0) / 2 : 0;
  const thicknessPadding = hasThicknessEdges(item.padding) ? item.padding : undefined;
  if (thicknessPadding !== undefined || centeredTextInset > 0) {
    html.push(
      `padding: ${toCss(getStaticValueOrDefault(thicknessPadding?.top, 0) + centeredTextInset)}px ${toCss(
        getStaticValueOrDefault(thicknessPadding?.right, 0) + centeredTextInset,
      )}px ${toCss(getStaticValueOrDefault(thicknessPadding?.bottom, 0) + centeredTextInset)}px ${toCss(
        getStaticValueOrDefault(thicknessPadding?.left, 0) + centeredTextInset,
      )}px;`,
    );
  }

  const font = getFont(item)?.getForCulture(context.options.cultureLcid);
  if (font !== undefined) {
    appendFont(html, font.getForCulture(context.options.cultureLcid));
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

function appendToolbarFontStyle(style: string[], font: HmiFont | undefined): void {
  if (font === undefined) return;
  appendFont(style, font);
  if (getStaticValue(font.italic) === false) style.push("font-style: normal;");
  if (getStaticValue(font.bold) === false && (getStaticValue(font.weight) ?? 0) <= 0) style.push("font-weight: normal;");
  if (getStaticValue(font.underline) === false && getStaticValue(font.strikethrough) === false) style.push("text-decoration: none;");
}

function appendFont(html: string[], font: HmiFont, encodeName = true): void {
  const name = getStaticValue(font.name);
  const size = getStaticValue(font.size);
  const weight = getStaticValue(font.weight);
  if (name?.trim()) {
    html.push(`font-family: ${encodeName ? escapeHtml(name) : name};`);
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

function appendAttribute(html: string[], name: string | undefined, value: string | undefined, preserveEmpty = false): void {
  if (!name?.trim() || value === undefined || (!preserveEmpty && !value.trim())) {
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
