using System.Globalization;
using System.Net;
using System.Text;
using BaseHmiTypes.Common;
using BaseHmiTypes.Images;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Screens.Defaults;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;

namespace BaseHmiTypes.Converters.Html;

public class HmiScreenToHtmlConverter
{
    private static double Clamp(double value, double min, double max)
    {
        if (min > max)
            throw new ArgumentException("The minimum must not exceed the maximum.");

        return value < min ? min : value > max ? max : value;
    }

    private static int Clamp(int value, int min, int max)
    {
        if (min > max)
            throw new ArgumentException("The minimum must not exceed the maximum.");

        return value < min ? min : value > max ? max : value;
    }

    public async ValueTask<string> ConvertAsync(
        HmiScreenBase screen,
        IHmiProject? project = null,
        HmiHtmlConvertOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        options ??= new HmiHtmlConvertOptions();
        var context = new HmiHtmlConvertContext(options, new HmiEffectivePropertyResolver(ResolveDefaultProfile(project)));
        return await ConvertCoreAsync(screen, project, context, true, new List<HmiScreenBase>(), cancellationToken).ConfigureAwait(false);
    }

    private static HmiDefaultProfile ResolveDefaultProfile(IHmiProject? project)
    {
        switch (project?.Info.HmiProjectSoftwareType)
        {
            case HmiProjectSoftwareType.WinCCAdvanced:
                return HmiDefaultProfiles.WinCcAdvancedV21;
            case HmiProjectSoftwareType.WinCCUnified:
                return HmiDefaultProfiles.WinCcUnifiedV21;
            default:
                return HmiDefaultProfiles.Neutral;
        }
    }

    private async ValueTask<string> ConvertCoreAsync(
        HmiScreenBase screen,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        bool includeRuntime,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        if (screen is HmiCharacterScreen characterScreen)
            return ConvertCharacterScreen(characterScreen, context.Options);

        cancellationToken.ThrowIfCancellationRequested();
        if (IsScreenInStack(screen, screenStack))
        {
            var placeholder = new StringBuilder("<div");
            AppendAttribute(placeholder, "class", context.Options.MissingScreenPlaceholderCssClass);
            AppendAttribute(placeholder, "data-hmi-recursive-screen", screen.Id ?? screen.Name ?? "anonymous");
            placeholder.Append(">Recursive screen reference: ")
                .Append(WebUtility.HtmlEncode(screen.Name ?? screen.Id ?? "Unnamed screen"))
                .Append("</div>");
            return placeholder.ToString();
        }

        screenStack.Add(screen);

        try
        {
            var html = new StringBuilder();
            if (includeRuntime && context.Options.IncludeMetaCharset)
                html.Append("<meta charset=\"utf-8\">");
            if (includeRuntime)
                AppendGlobalStyle(html);
            if (includeRuntime)
                AppendRuntimeModule(html);

            var backgroundImageUri = await ResolveImageUriAsync(screen.BackgroundImage, project, cancellationToken).ConfigureAwait(false);
            html.Append("<div");
            AppendAttribute(html, "id", screen.Name);
            AppendAttribute(html, "data-background-image", screen.BackgroundImage?.ImageName ?? screen.BackgroundImage?.ImageId);
            AppendStaticAttribute(html, "data-background-image-layout", screen.BackgroundImageLayout);
            AppendStaticAttribute(html, "data-fill-pattern-alignment", screen.FillPatternAlignment);
            html.Append(" style=\"position: relative; overflow: hidden;");
            AppendSize(html, screen.Width.GetStaticValueOrDefault(), screen.Height.GetStaticValueOrDefault());
            AppendScreenStyle(html, screen, backgroundImageUri);
            html.Append("\">");

            var template = await ResolveTemplateAsync(screen, project, screenStack, cancellationToken).ConfigureAwait(false);
            if (template != null)
                html.Append(await ConvertCoreAsync(template, project, context, false, screenStack, cancellationToken).ConfigureAwait(false));

            foreach (var layer in screen.Layers)
            {
                if (!layer.Visible.GetStaticValueOrDefault(true))
                    continue;

                html.Append("<div");
                AppendAttribute(html, "id", layer.Name);
                html.Append(" style=\"position: absolute; inset: 0;");
                if (layer.Items.Count == 0)
                    html.Append(" pointer-events: none;");
                html.Append("\">");
                foreach (var item in layer.Items)
                    await AppendItemAsync(html, item, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                html.Append("</div>");
            }

            html.Append("</div>");
            return html.ToString();
        }
        finally
        {
            screenStack.RemoveAt(screenStack.Count - 1);
        }
    }

    private static string ConvertCharacterScreen(HmiCharacterScreen screen, HmiHtmlConvertOptions options)
    {
        var html = new StringBuilder();
        if (options.IncludeMetaCharset) html.Append("<meta charset=\"utf-8\">");
        html.Append("<section class=\"hmi-character-screen\" aria-label=\"")
            .Append(WebUtility.HtmlEncode(screen.Name)).Append("\">");
        foreach (var entry in screen.Entries)
        {
            var text = options.CultureLcid is int lcid && entry.Text.Texts.TryGetValue(lcid, out var translated)
                ? translated : entry.Text.GetDefaultText();
            html.Append("<figure><figcaption>Entry ").Append(WebUtility.HtmlEncode(entry.Id))
                .Append("</figcaption><pre style=\"white-space:pre;overflow:auto;font:16px/1.4 monospace;padding:1em;background:#dce5bc;color:#182018;\">")
                .Append(WebUtility.HtmlEncode(text).Replace("\uFFFC", "<span title=\"Unresolved field\">&#9633;</span>"))
                .Append("</pre></figure>");
        }
        return html.Append("</section>").ToString();
    }

    private async ValueTask AppendItemAsync(
        StringBuilder html,
        HmiScreenItemBase item,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        if (!item.Visible.GetStaticValueOrDefault(true))
            return;

        var materializedReference = item.ReferenceObject?.MaterializedObject;
        if (materializedReference is not null && !ReferenceEquals(materializedReference, item))
        {
            html.Append("<div");
            AppendCommonAttributes(html, item, context, additionalStyle: "overflow: hidden;");
            AppendAttribute(html, "class", "hmi-reference-object");
            AppendAttribute(html, "data-hmi-reference-source", item.ReferenceObject?.Source);
            html.Append(">");
            var childContext = context.WithPositionOffset(
                -materializedReference.X.GetStaticValueOrDefault() - context.PositionOffsetX,
                -materializedReference.Y.GetStaticValueOrDefault() - context.PositionOffsetY);
            await AppendItemAsync(
                html, materializedReference, project, childContext, screenStack, cancellationToken).ConfigureAwait(false);
            html.Append("</div>");
            return;
        }

        switch (item)
        {
            case HmiToggleSwitch toggleSwitch:
                await AppendToggleSwitchAsync(html, toggleSwitch, project, context, cancellationToken).ConfigureAwait(false);
                break;
            case HmiCheckBoxGroup checkBoxGroup:
                await AppendSelectionGroupAsync(html, "hmi-checkbox-group", checkBoxGroup, project, context, cancellationToken).ConfigureAwait(false);
                break;
            case HmiRadioButtonGroup radioButtonGroup:
                await AppendSelectionGroupAsync(html, "hmi-radio-button-group", radioButtonGroup, project, context, cancellationToken).ConfigureAwait(false);
                break;
            case HmiComboBox comboBox:
                AppendComboBox(html, comboBox, context);
                break;
            case HmiListBox listBox:
                AppendListBox(html, listBox, context);
                break;
            case HmiButton button:
                await AppendButtonAsync(html, button, project, context, cancellationToken).ConfigureAwait(false);
                break;
            case HmiIOField ioField:
                AppendInput(html, ioField, context);
                break;
            case HmiSymbolicIOField symbolicIoField:
                await AppendSymbolicInputAsync(html, symbolicIoField, project, context, cancellationToken).ConfigureAwait(false);
                break;
            case HmiTextBox textBox:
                AppendTextBlock(html, textBox, textBox.Text, context);
                break;
            case HmiLabel label:
                AppendTextBlock(html, label, label.Text, context);
                break;
            case HmiText text:
                AppendTextBlock(html, text, text.Text, context);
                break;
            case HmiGraphicView graphicView:
                await AppendGraphicViewAsync(html, graphicView, project, context, cancellationToken).ConfigureAwait(false);
                break;
            case HmiRectangle rectangle:
                AppendRectangle(html, rectangle, context);
                break;
            case HmiLine line:
                AppendLine(html, line, context);
                break;
            case HmiPolyline polyline:
                AppendPointShape(html, polyline, "polyline", false, context);
                break;
            case HmiPolygon polygon:
                AppendPointShape(html, polygon, "polygon", true, context);
                break;
            case HmiCircleSegment circleSegment:
                AppendCircularSegment(html, circleSegment, context);
                break;
            case HmiEllipseSegment ellipseSegment:
                AppendEllipticalSegment(html, ellipseSegment, context);
                break;
            case HmiCircularArc circularArc:
                AppendCircularArc(html, circularArc, context);
                break;
            case HmiEllipticalArc ellipticalArc:
                AppendEllipticalArc(html, ellipticalArc, context);
                break;
            case HmiCircle circle:
                AppendCircle(html, circle, context);
                break;
            case HmiEllipse ellipse:
                AppendEllipse(html, ellipse, context);
                break;
            case HmiDynamicSvg dynamicSvg:
                AppendDynamicSvg(html, dynamicSvg, context);
                break;
            case HmiSlider slider:
                AppendSlider(html, slider, context);
                break;
            case HmiBar bar:
                AppendBar(html, bar, context);
                break;
            case HmiScale scale:
                AppendScale(html, scale, context);
                break;
            case HmiClock clock:
                AppendClock(html, clock, context);
                break;
            case HmiArrowIndicator arrowIndicator:
                AppendArrowIndicator(html, arrowIndicator, context);
                break;
            case HmiAlarmIndicator alarmIndicator:
                AppendAlarmIndicator(html, alarmIndicator, context);
                break;
            case HmiGauge gauge:
                AppendGauge(html, gauge, context);
                break;
            case HmiTrendControl trendControl:
                AppendTrendControl(html, trendControl, context);
                break;
            case HmiSymbolContainer symbolContainer:
                await AppendSymbolContainerAsync(html, symbolContainer, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                break;
            case HmiSymbolLibraryControl symbolLibraryControl:
                AppendSymbolLibraryControl(html, symbolLibraryControl, context);
                break;
            case HmiGroup group:
                if (group.IsLogicGrouping)
                {
                    foreach (var child in group.Items)
                        await AppendItemAsync(html, child, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                }
                else
                {
                    await AppendContainerAsync(html, group, group.Items, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                }
                break;
            case HmiOcxControl ocxControl:
                await AppendOcxControlAsync(html, ocxControl, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                break;
            case HmiDotNetControlContainer dotNetControl:
                await AppendDotNetControlAsync(html, dotNetControl, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                break;
            case HmiLayoutContainerBase layoutContainer:
                await AppendContainerAsync(html, layoutContainer, layoutContainer.Items, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                break;
            case HmiFaceplateContainer faceplateContainer:
                await AppendFaceplateContainerAsync(html, faceplateContainer, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                break;
            case HmiContainerBase container:
                await AppendContainerAsync(html, container, container.Items, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                break;
            case HmiScreenWindow screenWindow:
                await AppendScreenWindowAsync(html, screenWindow, project, context, screenStack, cancellationToken).ConfigureAwait(false);
                break;
            case HmiDataGridControl dataGridControl:
                AppendDataGridControl(html, dataGridControl, context);
                break;
            case HmiRecipeControl recipeControl:
                AppendRecipeControl(html, recipeControl, context);
                break;
            case HmiAuditTrailControl auditTrailControl:
                AppendAuditTrailControl(html, auditTrailControl, context);
                break;
            case HmiRadarChartControl radarChartControl:
                AppendRadarChartControl(html, radarChartControl, context);
                break;
            case HmiSystemDiagnosisControl systemDiagnosisControl:
                AppendSystemDiagnosisControl(html, systemDiagnosisControl, context);
                break;
            case HmiWebControl webControl:
                AppendWebControl(html, webControl, context);
                break;
            case HmiAlarmLineControl alarmLineControl:
                AppendAlarmLineControl(html, alarmLineControl, context);
                break;
            case HmiAlarmControl alarmControl:
                AppendAlarmControl(html, alarmControl, context);
                break;
            case HmiUnkown unkown:
                AppendDiv(html, unkown, null, "Unkown:" + (unkown.Type ?? ""), context);
                break;
            default:
                AppendDiv(html, item, context.Options.UnsupportedItemPlaceholderCssClass, item.GetType().Name, context);
                break;
        }
    }

    private async ValueTask AppendContainerAsync(
        StringBuilder html,
        HmiScreenItemBase container,
        IEnumerable<HmiScreenItemBase> items,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        var itemList = items as IReadOnlyCollection<HmiScreenItemBase> ?? items.ToArray();
        var isEmptyCustomWidget = container is HmiCustomWidgetContainer && itemList.Count == 0;
        var customWidget = container as HmiCustomWidgetContainer;
        var hasWindowChrome = customWidget != null && HasHostedWindowSettings(customWidget);
        html.Append("<div");
        AppendCommonAttributes(
            html,
            container,
            context,
            additionalStyle: hasWindowChrome
                ? CreateHostedWindowStyle(customWidget!, context)
                : isEmptyCustomWidget
                ? "display: flex; align-items: center; justify-content: center; overflow: hidden;"
                : null);
        if (customWidget != null)
        {
            AppendAttribute(html, "data-hmi-custom-widget-type", container.GetType().Name);
            AppendStaticAttribute(html, "data-window-resizable", customWidget.Resizable, context);
            AppendStaticAttribute(html, "data-window-movable", customWidget.Movable, context);
            AppendStaticAttribute(html, "data-window-border", customWidget.ShowWindowBorder, context);
            AppendStaticAttribute(html, "data-window-caption", customWidget.ShowCaption, context);
            AppendStaticAttribute(html, "data-window-maximize", customWidget.ShowMaximizeButton, context);
            AppendStaticAttribute(html, "data-window-close", customWidget.ShowCloseButton, context);
            AppendStaticAttribute(html, "data-window-always-on-top", customWidget.AlwaysOnTop, context);
            AppendStaticAttribute(html, "data-hosted-application", customWidget.HostedApplication, context);
            AppendStaticAttribute(html, "data-hosted-template", customWidget.HostedTemplate, context);
        }
        html.Append(">");
        if (hasWindowChrome && ResolveStaticValue(customWidget!.ShowCaption, context))
            AppendHostedWindowCaption(html, customWidget, context);
        if (isEmptyCustomWidget && !hasWindowChrome)
            html.Append("<span aria-hidden=\"true\">").Append(WebUtility.HtmlEncode(container.Name)).Append("</span>");
        else if (isEmptyCustomWidget)
            html.Append("<div class=\"hmi-hosted-window-content\" style=\"flex: 1 1 auto; display: grid; place-items: center; min-height: 0; overflow: hidden;\">")
                .Append(WebUtility.HtmlEncode(ResolveStaticValue(customWidget!.HostedTemplate, context)
                    ?? ResolveStaticValue(customWidget.HostedApplication, context)
                    ?? container.Name))
                .Append("</div>");
        if (container is HmiLayoutContainerBase { ChildCoordinateSpace: HmiChildCoordinateSpace.ScreenAbsolute } layoutContainer)
        {
            var childContext = context.WithPositionOffset(
                -layoutContainer.X.GetStaticValueOrDefault(),
                -layoutContainer.Y.GetStaticValueOrDefault());
            foreach (var child in itemList)
                await AppendItemAsync(html, child, project, childContext, screenStack, cancellationToken).ConfigureAwait(false);
        }
        else
        {
            foreach (var child in itemList)
                await AppendItemAsync(html, child, project, context, screenStack, cancellationToken).ConfigureAwait(false);
        }
        html.Append("</div>");
    }

    private static bool HasHostedWindowSettings(HmiCustomWidgetContainer container) =>
        container.Resizable != null || container.Movable != null || container.ShowWindowBorder != null ||
        container.ShowCaption != null || container.ShowMaximizeButton != null || container.ShowCloseButton != null ||
        container.AlwaysOnTop != null || container.HostedApplication != null || container.HostedTemplate != null;

    private static string CreateHostedWindowStyle(HmiCustomWidgetContainer container, HmiHtmlConvertContext context)
    {
        var style = new StringBuilder("display: flex; flex-direction: column; overflow: hidden;");
        style.Append(ResolveStaticValue(container.ShowWindowBorder, context)
            ? "border: 1px solid #6b7280;"
            : "border: none;");
        if (ResolveStaticValue(container.Resizable, context))
            style.Append("resize: both;");
        if (ResolveStaticValue(container.AlwaysOnTop, context))
            style.Append("z-index: 2147483647;");
        return style.ToString();
    }

    private static void AppendHostedWindowCaption(
        StringBuilder html,
        HmiCustomWidgetContainer container,
        HmiHtmlConvertContext context)
    {
        var title = ResolveStaticValue(container.HostedTemplate, context)
            ?? ResolveStaticValue(container.HostedApplication, context)
            ?? container.Name;
        html.Append("<div class=\"hmi-hosted-window-caption\" style=\"flex: 0 0 auto; display: flex; align-items: center; min-height: 22px; padding: 2px 4px; background: #d7dce3; color: #111827;");
        if (ResolveStaticValue(container.Movable, context))
            html.Append("cursor: move;");
        html.Append("\"><span style=\"flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\">")
            .Append(WebUtility.HtmlEncode(title)).Append("</span>");
        if (ResolveStaticValue(container.ShowMaximizeButton, context))
            html.Append("<button type=\"button\" aria-label=\"Maximize\" disabled style=\"flex: 0 0 auto;\">□</button>");
        if (ResolveStaticValue(container.ShowCloseButton, context))
            html.Append("<button type=\"button\" aria-label=\"Close\" disabled style=\"flex: 0 0 auto;\">×</button>");
        html.Append("</div>");
    }

    private async ValueTask AppendOcxControlAsync(
        StringBuilder html,
        HmiOcxControl ocxControl,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        html.Append("<div");
        AppendCommonAttributes(html, ocxControl, context, additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-ocx-guid", ocxControl.OcxGuid);
        AppendAttribute(html, "data-ocx-name", ocxControl.OcxName);
        AppendAttribute(html, "data-ocx-program-id", ocxControl.OcxProgramId);
        AppendAttribute(html, "data-ocx-file-name", ocxControl.OcxFileName);
        AppendAttribute(html, "data-ocx-file-version", ocxControl.OcxFileVersion);
        AppendAttribute(html, "data-ocx-type-library", ocxControl.OcxTypeLibrary);
        AppendAttribute(html, "data-ocx-type-library-version", ocxControl.OcxTypeLibraryVersion);
        AppendAttribute(html, "data-state-format", ocxControl.OcxStateFormat);
        AppendAttribute(html, "data-state-length", ocxControl.OcxState?.Length.ToString(CultureInfo.InvariantCulture));
        html.Append("><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;\">ActiveX control</div>")
            .Append("<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">")
            .Append(WebUtility.HtmlEncode(ocxControl.OcxName ?? ocxControl.OcxProgramId ?? ocxControl.OcxFileName ?? "State preserved"))
            .Append("</div>");
        foreach (var child in ocxControl.Items)
            await AppendItemAsync(html, child, project, context, screenStack, cancellationToken).ConfigureAwait(false);
        html.Append("</div>");
    }

    private async ValueTask AppendDotNetControlAsync(
        StringBuilder html,
        HmiDotNetControlContainer dotNetControl,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        html.Append("<div");
        AppendCommonAttributes(html, dotNetControl, context, additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        html.Append("><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;\">.NET control</div>")
            .Append("<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Metadata preserved</div>");
        foreach (var child in dotNetControl.Items)
            await AppendItemAsync(html, child, project, context, screenStack, cancellationToken).ConfigureAwait(false);
        html.Append("</div>");
    }

    private async ValueTask AppendFaceplateContainerAsync(
        StringBuilder html,
        HmiFaceplateContainer faceplateContainer,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        HmiFaceplateType? resolved = null;
        if (project != null && !string.IsNullOrWhiteSpace(faceplateContainer.FaceplateId))
            resolved = await project.GetFaceplateAsync(faceplateContainer.FaceplateId!, cancellationToken).ConfigureAwait(false);

        if (resolved == null &&
            project != null &&
            !string.IsNullOrWhiteSpace(faceplateContainer.FaceplateName) &&
            !string.IsNullOrWhiteSpace(faceplateContainer.FaceplateVersion))
        {
            resolved = await project.GetFaceplateAsync(
                faceplateContainer.FaceplateName!,
                faceplateContainer.FaceplateVersion!,
                cancellationToken).ConfigureAwait(false);
        }

        html.Append("<div");
        AppendCommonAttributes(html, faceplateContainer, context);
        html.Append(">");

        if (resolved == null)
        {
            html.Append("<div");
            AppendAttribute(html, "class", context.Options.MissingScreenPlaceholderCssClass);
            html.Append(">");
            html.Append(WebUtility.HtmlEncode(faceplateContainer.FaceplateName ?? faceplateContainer.FaceplateId ?? "Missing faceplate"));
            html.Append("</div>");
        }
        else
        {
            var childContext = context.WithFaceplateInterfaceValues(faceplateContainer.InterfaceValues);
            html.Append(await ConvertCoreAsync(resolved, project, childContext, false, screenStack, cancellationToken).ConfigureAwait(false));
        }

        html.Append("</div>");
    }

    private async ValueTask AppendSymbolContainerAsync(
        StringBuilder html,
        HmiSymbolContainer symbolContainer,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        var image = symbolContainer.Image.GetStaticValue();
        var imageUri = await ResolveImageUriAsync(image, project, cancellationToken).ConfigureAwait(false);

        html.Append("<div");
        AppendSymbolAttributes(html, symbolContainer, context);
        html.Append(">");

        if (!string.IsNullOrWhiteSpace(imageUri))
            AppendSymbolImage(html, symbolContainer, image!, imageUri!);

        foreach (var child in symbolContainer.Items)
            await AppendItemAsync(html, child, project, context, screenStack, cancellationToken).ConfigureAwait(false);

        html.Append("</div>");
    }

    private static async ValueTask<string?> ResolveImageUriAsync(
        HmiImageSource? image,
        IHmiProject? project,
        CancellationToken cancellationToken)
    {
        if (image == null)
            return null;

        if (!string.IsNullOrWhiteSpace(image.Uri))
            return ResolveMetafileDataUri(image.Uri!) ?? image.Uri;

        if (project == null || string.IsNullOrWhiteSpace(image.ImageId))
            return null;

        var resolved = await project.GetImageAsync(image.ImageId!, cancellationToken).ConfigureAwait(false);
        return ResolveImageUri(resolved);
    }

    private static string? ResolveMetafileDataUri(string uri)
    {
        const string base64Marker = ";base64,";
        if (!uri.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            return null;

        var markerIndex = uri.IndexOf(base64Marker, StringComparison.OrdinalIgnoreCase);
        if (markerIndex < 0)
            return null;

        var mediaType = uri.Substring(5, markerIndex - 5);
        if (!IsMetafileMimeType(mediaType))
            return null;

        try
        {
            var data = Convert.FromBase64String(uri.Substring(markerIndex + base64Marker.Length));
            var extension = mediaType.IndexOf("wmf", StringComparison.OrdinalIgnoreCase) >= 0 ? ".wmf" : ".emf";
            var svg = new MetafileToSvgRenderer().Render(data, extension);
            return string.IsNullOrWhiteSpace(svg)
                ? null
                : "data:image/svg+xml;charset=utf-8," + Uri.EscapeDataString(svg!);
        }
        catch (FormatException)
        {
            return null;
        }
    }

    private static string? ResolveImageUri(HmiImage? image)
    {
        if (image == null || image.Data.Length == 0)
            return null;

        if (IsMetafileImage(image))
        {
            var svg = new MetafileToSvgRenderer().Render(image.Data, GetImageExtension(image));
            if (!string.IsNullOrWhiteSpace(svg))
                return "data:image/svg+xml;charset=utf-8," + Uri.EscapeDataString(svg!);
        }

        var mimeType = string.IsNullOrWhiteSpace(image.MimeType) ? GetMimeType(image) : image.MimeType!;
        return "data:" + mimeType + ";base64," + Convert.ToBase64String(image.Data);
    }

    private static string? ResolveImageSvg(HmiImage? image)
    {
        if (image == null || image.Data.Length == 0)
            return null;

        if (IsMetafileImage(image))
            return new MetafileToSvgRenderer().Render(image.Data, GetImageExtension(image));

        if (image.ImageType == HmiImageType.Svg || string.Equals(image.MimeType, "image/svg+xml", StringComparison.OrdinalIgnoreCase))
            return Encoding.UTF8.GetString(image.Data);

        return null;
    }

    private static bool IsMetafileImage(HmiImage image)
    {
        return image.ImageType == HmiImageType.Emf
            || image.ImageType == HmiImageType.Wmf
            || IsMetafileMimeType(image.MimeType)
            || IsMetafileExtension(GetExtensionFromName(image.Name));
    }

    private static bool IsMetafileMimeType(string? mimeType)
    {
        return !string.IsNullOrWhiteSpace(mimeType)
            && (mimeType!.IndexOf("emf", StringComparison.OrdinalIgnoreCase) >= 0
                || mimeType.IndexOf("wmf", StringComparison.OrdinalIgnoreCase) >= 0
                || mimeType.IndexOf("metafile", StringComparison.OrdinalIgnoreCase) >= 0);
    }

    private static string? GetImageExtension(HmiImage image)
    {
        switch (image.ImageType)
        {
            case HmiImageType.Emf:
                return ".emf";
            case HmiImageType.Wmf:
                return ".wmf";
            default:
                return GetExtensionFromName(image.Name);
        }
    }

    private static string? GetExtensionFromName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return null;

        var index = name!.LastIndexOf('.');
        return index >= 0 ? name.Substring(index).ToLowerInvariant() : null;
    }

    private static bool IsMetafileExtension(string? extension)
    {
        return extension == ".emf" || extension == ".wmf";
    }

    private static string GetMimeType(HmiImage image)
    {
        switch (image.ImageType)
        {
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

    private async ValueTask AppendScreenWindowAsync(
        StringBuilder html,
        HmiScreenWindow screenWindow,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        HmiScreenBase? resolved = null;
        if (project != null && !string.IsNullOrWhiteSpace(screenWindow.ScreenId?.StaticValue))
            resolved = await project.GetScreenAsync(screenWindow.ScreenId!.StaticValue!, cancellationToken).ConfigureAwait(false);

        html.Append("<div");
        AppendStaticAttribute(html, "data-fit-screen-to-window", screenWindow.FitScreenToWindow, context);
        AppendStaticAttribute(html, "data-fit-window-to-screen", screenWindow.FitWindowToScreen, context);
        AppendStaticAttribute(html, "data-show-scrollbars", screenWindow.ShowScrollBars, context);
        AppendStaticAttribute(html, "data-zoom-percent", screenWindow.ZoomPercent, context);
        AppendStaticAttribute(html, "data-picture-offset-x", screenWindow.OffsetLeft, context);
        AppendStaticAttribute(html, "data-picture-offset-y", screenWindow.OffsetTop, context);
        AppendStaticAttribute(html, "data-scroll-position-x", screenWindow.ScrollPositionLeft, context);
        AppendStaticAttribute(html, "data-scroll-position-y", screenWindow.ScrollPositionTop, context);
        AppendCommonAttributes(html, screenWindow, context, additionalStyle: CreateScreenWindowStyle(screenWindow, resolved, context));
        html.Append(">");

        if (resolved == null)
        {
            html.Append("<div");
            AppendAttribute(html, "class", context.Options.MissingScreenPlaceholderCssClass);
            html.Append(">");
            html.Append(WebUtility.HtmlEncode(screenWindow.ScreenName?.StaticValue ?? screenWindow.ScreenId?.StaticValue ?? "Missing screen"));
            html.Append("</div>");
        }
        else
        {
            var contentStyle = CreateScreenWindowContentStyle(screenWindow, resolved, context);
            if (contentStyle == null)
            {
                html.Append(await ConvertCoreAsync(resolved, project, context, false, screenStack, cancellationToken).ConfigureAwait(false));
            }
            else
            {
                html.Append("<div class=\"hmi-screen-window-content\"");
                AppendAttribute(html, "style", contentStyle);
                html.Append("><div");
                AppendAttribute(html, "style", CreateScreenWindowTransformStyle(screenWindow, resolved, context));
                html.Append(">");
                html.Append(await ConvertCoreAsync(resolved, project, context, false, screenStack, cancellationToken).ConfigureAwait(false));
                html.Append("</div></div>");
            }
        }

        html.Append("</div>");
        AppendScreenWindowScrollInitializer(html, screenWindow, context);
    }

    private static string CreateScreenWindowStyle(
        HmiScreenWindow screenWindow,
        HmiScreenBase? resolved,
        HmiHtmlConvertContext context)
    {
        var style = new StringBuilder();
        var fitScreen = ResolveStaticValue(screenWindow.FitScreenToWindow, context);
        var fitWindow = ResolveStaticValue(screenWindow.FitWindowToScreen, context);
        var showScrollBars = ResolveStaticValue(screenWindow.ShowScrollBars, context);
        var zoom = GetScreenWindowZoom(screenWindow, context);

        if (fitWindow && !fitScreen && resolved != null)
        {
            var contentWidth = GetScreenWindowContentExtent(resolved.Width.GetStaticValueOrDefault(), screenWindow.OffsetLeft, context);
            var contentHeight = GetScreenWindowContentExtent(resolved.Height.GetStaticValueOrDefault(), screenWindow.OffsetTop, context);
            style.Append("width: ").Append(ToCss(contentWidth * zoom)).Append("px;")
                .Append("height: ").Append(ToCss(contentHeight * zoom)).Append("px;");
        }

        style.Append(showScrollBars && !fitScreen && !fitWindow ? "overflow: auto;" : "overflow: hidden;");
        return style.ToString();
    }

    private static string? CreateScreenWindowContentStyle(
        HmiScreenWindow screenWindow,
        HmiScreenBase resolved,
        HmiHtmlConvertContext context)
    {
        var fitScreen = ResolveStaticValue(screenWindow.FitScreenToWindow, context);
        var zoom = GetScreenWindowZoom(screenWindow, context);
        var screenWidth = GetScreenWindowContentExtent(resolved.Width.GetStaticValueOrDefault(), screenWindow.OffsetLeft, context);
        var screenHeight = GetScreenWindowContentExtent(resolved.Height.GetStaticValueOrDefault(), screenWindow.OffsetTop, context);
        var windowWidth = screenWindow.Width.GetStaticValueOrDefault();
        var windowHeight = screenWindow.Height.GetStaticValueOrDefault();

        double scaleX;
        double scaleY;
        if (fitScreen && screenWidth > 0d && screenHeight > 0d)
        {
            scaleX = windowWidth / screenWidth;
            scaleY = windowHeight / screenHeight;
        }
        else if (Math.Abs(zoom - 1d) > 0.000001d)
        {
            scaleX = zoom;
            scaleY = zoom;
        }
        else
        {
            return null;
        }

        return "position: relative; width: " + ToCss(screenWidth * scaleX) + "px; height: " +
            ToCss(screenHeight * scaleY) + "px; overflow: hidden;";
    }

    private static string CreateScreenWindowTransformStyle(
        HmiScreenWindow screenWindow,
        HmiScreenBase resolved,
        HmiHtmlConvertContext context)
    {
        var fitScreen = ResolveStaticValue(screenWindow.FitScreenToWindow, context);
        var screenWidth = GetScreenWindowContentExtent(resolved.Width.GetStaticValueOrDefault(), screenWindow.OffsetLeft, context);
        var screenHeight = GetScreenWindowContentExtent(resolved.Height.GetStaticValueOrDefault(), screenWindow.OffsetTop, context);
        var scaleX = fitScreen && screenWidth > 0d
            ? screenWindow.Width.GetStaticValueOrDefault() / screenWidth
            : GetScreenWindowZoom(screenWindow, context);
        var scaleY = fitScreen && screenHeight > 0d
            ? screenWindow.Height.GetStaticValueOrDefault() / screenHeight
            : GetScreenWindowZoom(screenWindow, context);
        var offsetX = Clamp(ResolveStaticValue(screenWindow.OffsetLeft, context), 0d, resolved.Width.GetStaticValueOrDefault());
        var offsetY = Clamp(ResolveStaticValue(screenWindow.OffsetTop, context), 0d, resolved.Height.GetStaticValueOrDefault());
        return "position: absolute; left: " + ToCss(-offsetX * scaleX) + "px; top: " +
            ToCss(-offsetY * scaleY) + "px; transform-origin: top left; transform: scale(" +
            ToCss(scaleX) + ", " + ToCss(scaleY) + ");";
    }

    private static double GetScreenWindowZoom(HmiScreenWindow screenWindow, HmiHtmlConvertContext context)
    {
        var zoomPercent = ResolveStaticValue(screenWindow.ZoomPercent, context);
        return zoomPercent > 0d ? zoomPercent / 100d : 1d;
    }

    private static double GetScreenWindowContentExtent(
        double screenExtent,
        HmiProperty<double>? offset,
        HmiHtmlConvertContext context) =>
        Math.Max(0d, screenExtent - Clamp(ResolveStaticValue(offset, context), 0d, screenExtent));

    private static void AppendScreenWindowScrollInitializer(
        StringBuilder html,
        HmiScreenWindow screenWindow,
        HmiHtmlConvertContext context)
    {
        if (!ResolveStaticValue(screenWindow.ShowScrollBars, context)
            || ResolveStaticValue(screenWindow.FitScreenToWindow, context)
            || ResolveStaticValue(screenWindow.FitWindowToScreen, context))
            return;

        var scrollLeft = Math.Max(0d, ResolveStaticValue(screenWindow.ScrollPositionLeft, context));
        var scrollTop = Math.Max(0d, ResolveStaticValue(screenWindow.ScrollPositionTop, context));
        if (scrollLeft == 0d && scrollTop == 0d)
            return;

        html.Append("<script>(e=>{e.scrollLeft=").Append(ToCss(scrollLeft))
            .Append(";e.scrollTop=").Append(ToCss(scrollTop))
            .Append(";})(document.currentScript.previousElementSibling)</script>");
    }

    private static async ValueTask<HmiScreenBase?> ResolveTemplateAsync(
        HmiScreenBase screen,
        IHmiProject? project,
        IList<HmiScreenBase> screenStack,
        CancellationToken cancellationToken)
    {
        if (project == null)
            return null;

        var templateId = screen.TemplateId.GetStaticValue();
        var templateName = screen.TemplateName.GetStaticValue();
        HmiScreenBase? template = null;

        if (!string.IsNullOrWhiteSpace(templateId))
            template = await project.GetScreenAsync(templateId!, cancellationToken).ConfigureAwait(false);

        if (template == null && !string.IsNullOrWhiteSpace(templateName))
            template = await project.GetScreenAsync(templateName!, cancellationToken).ConfigureAwait(false);

        if (template == null || IsScreenInStack(template, screenStack))
            return null;

        return template;
    }

    private static bool IsScreenInStack(HmiScreenBase screen, IEnumerable<HmiScreenBase> screenStack)
    {
        return screenStack.Any(active =>
            ReferenceEquals(active, screen) ||
            (!string.IsNullOrWhiteSpace(screen.Id) &&
             string.Equals(active.Id, screen.Id, StringComparison.OrdinalIgnoreCase)) ||
            (string.IsNullOrWhiteSpace(screen.Id) && string.IsNullOrWhiteSpace(active.Id) &&
             !string.IsNullOrWhiteSpace(screen.Name) && active.Kind == screen.Kind &&
             string.Equals(active.Name, screen.Name, StringComparison.OrdinalIgnoreCase) &&
             string.Equals((active as HmiFaceplateType)?.Version, (screen as HmiFaceplateType)?.Version, StringComparison.OrdinalIgnoreCase)));
    }

    private static void AppendLine(StringBuilder html, HmiLine line, HmiHtmlConvertContext context)
    {
        var width = line.Width.GetStaticValueOrDefault();
        var height = line.Height.GetStaticValueOrDefault();
        AppendSvgOpen(html, line, GetSvgWidth(line), GetSvgHeight(line), context);
        html.Append("<line");
        AppendSvgAttribute(html, "x1", ToSvgLineX(line, line.X1.GetStaticValueOrDefault()));
        AppendSvgAttribute(html, "y1", ToSvgLineY(line, line.Y1.GetStaticValueOrDefault()));
        AppendSvgAttribute(html, "x2", ToSvgLineX(line, line.X2.GetStaticValueOrDefault(width)));
        AppendSvgAttribute(html, "y2", ToSvgLineY(line, line.Y2.GetStaticValueOrDefault(height)));
        AppendStrokeAttributes(html, line, null, context);
        html.Append("></line>");
        AppendSvgMarkerDefinitions(html, line, context);
        html.Append("</svg>");
    }

    private static void AppendPointShape(StringBuilder html, HmiPointBasedShapeBase shape, string elementName, bool fill, HmiHtmlConvertContext context)
    {
        AppendSvgOpen(html, shape, GetSvgWidth(shape), GetSvgHeight(shape), context);
        html.Append('<').Append(elementName);
        AppendAttribute(html, "points", string.Join(" ", shape.Points.Select(point => ToSvgPoint(shape, point))));
        AppendStrokeAttributes(html, shape, fill ? GetFillColor(shape, context) : null, context);
        html.Append("></").Append(elementName).Append('>');
        AppendSvgFillDefinition(html, shape, fill ? GetFillColor(shape, context) : null, context);
        AppendSvgMarkerDefinitions(html, shape, context);
        html.Append("</svg>");
    }

    private static void AppendCircle(StringBuilder html, HmiCircle circle, HmiHtmlConvertContext context)
    {
        var width = GetSvgWidth(circle);
        var height = GetSvgHeight(circle);
        var radius = circle.Radius.GetStaticValueOrDefault(Math.Min(width, height) / 2d);
        AppendSvgOpen(html, circle, width, height, context);
        html.Append("<circle");
        AppendSvgAttribute(html, "cx", circle.CenterX.GetStaticValueOrDefault(width / 2d));
        AppendSvgAttribute(html, "cy", circle.CenterY.GetStaticValueOrDefault(height / 2d));
        AppendSvgAttribute(html, "r", radius);
        AppendStrokeAttributes(html, circle, GetFillColor(circle, context), context);
        html.Append("></circle>");
        AppendSvgFillDefinition(html, circle, GetFillColor(circle, context), context);
        AppendSvgMarkerDefinitions(html, circle, context);
        html.Append("</svg>");
    }

    private static void AppendEllipse(StringBuilder html, HmiEllipse ellipse, HmiHtmlConvertContext context)
    {
        var width = GetSvgWidth(ellipse);
        var height = GetSvgHeight(ellipse);
        AppendSvgOpen(html, ellipse, width, height, context);
        html.Append("<ellipse");
        AppendSvgAttribute(html, "cx", ellipse.CenterX.GetStaticValueOrDefault(width / 2d));
        AppendSvgAttribute(html, "cy", ellipse.CenterY.GetStaticValueOrDefault(height / 2d));
        AppendSvgAttribute(html, "rx", ellipse.RadiusX.GetStaticValueOrDefault(width / 2d));
        AppendSvgAttribute(html, "ry", ellipse.RadiusY.GetStaticValueOrDefault(height / 2d));
        AppendStrokeAttributes(html, ellipse, GetFillColor(ellipse, context), context);
        html.Append("></ellipse>");
        AppendSvgFillDefinition(html, ellipse, GetFillColor(ellipse, context), context);
        AppendSvgMarkerDefinitions(html, ellipse, context);
        html.Append("</svg>");
    }

    private static void AppendCircularArc(StringBuilder html, HmiCircularArc arc, HmiHtmlConvertContext context)
    {
        var width = GetSvgWidth(arc);
        var height = GetSvgHeight(arc);
        var radius = arc.Radius.GetStaticValueOrDefault(Math.Min(width, height) / 2d);
        var cx = arc.CenterX.GetStaticValueOrDefault(width / 2d);
        var cy = arc.CenterY.GetStaticValueOrDefault(height / 2d);
        AppendArcPath(html, arc, cx, cy, radius, radius, arc.StartAngle.GetStaticValueOrDefault(), arc.SweepAngle.GetStaticValueOrDefault(), false, context);
    }

    private static void AppendEllipticalArc(StringBuilder html, HmiEllipticalArc arc, HmiHtmlConvertContext context)
    {
        var width = GetSvgWidth(arc);
        var height = GetSvgHeight(arc);
        var cx = arc.CenterX.GetStaticValueOrDefault(width / 2d);
        var cy = arc.CenterY.GetStaticValueOrDefault(height / 2d);
        AppendArcPath(
            html,
            arc,
            cx,
            cy,
            arc.RadiusX.GetStaticValueOrDefault(width / 2d),
            arc.RadiusY.GetStaticValueOrDefault(height / 2d),
            arc.StartAngle.GetStaticValueOrDefault(),
            arc.SweepAngle.GetStaticValueOrDefault(),
            false,
            context);
    }

    private static void AppendCircularSegment(StringBuilder html, HmiCircleSegment segment, HmiHtmlConvertContext context)
    {
        var width = GetSvgWidth(segment);
        var height = GetSvgHeight(segment);
        var radius = segment.Radius.GetStaticValueOrDefault(Math.Min(width, height) / 2d);
        var cx = segment.CenterX.GetStaticValueOrDefault(width / 2d);
        var cy = segment.CenterY.GetStaticValueOrDefault(height / 2d);
        AppendArcPath(html, segment, cx, cy, radius, radius, segment.StartAngle.GetStaticValueOrDefault(), segment.SweepAngle.GetStaticValueOrDefault(), true, context);
    }

    private static void AppendEllipticalSegment(StringBuilder html, HmiEllipseSegment segment, HmiHtmlConvertContext context)
    {
        var width = GetSvgWidth(segment);
        var height = GetSvgHeight(segment);
        var cx = segment.CenterX.GetStaticValueOrDefault(width / 2d);
        var cy = segment.CenterY.GetStaticValueOrDefault(height / 2d);
        AppendArcPath(
            html,
            segment,
            cx,
            cy,
            segment.RadiusX.GetStaticValueOrDefault(width / 2d),
            segment.RadiusY.GetStaticValueOrDefault(height / 2d),
            segment.StartAngle.GetStaticValueOrDefault(),
            segment.SweepAngle.GetStaticValueOrDefault(),
            true,
            context);
    }

    private static void AppendArcPath(
        StringBuilder html,
        HmiShapeBase item,
        double centerX,
        double centerY,
        double radiusX,
        double radiusY,
        double startAngle,
        double sweepAngle,
        bool segment,
        HmiHtmlConvertContext context)
    {
        AppendSvgOpen(html, item, GetSvgWidth(item), GetSvgHeight(item), context);
        html.Append("<path");
        AppendAttribute(html, "d", CreateArcPath(centerX, centerY, radiusX, radiusY, startAngle, sweepAngle, segment));
        AppendStrokeAttributes(html, item, segment ? GetFillColor(item, context) : null, context);
        html.Append("></path>");
        AppendSvgFillDefinition(html, item, segment ? GetFillColor(item, context) : null, context);
        AppendSvgMarkerDefinitions(html, item, context);
        html.Append("</svg>");
    }

    private static void AppendSvgOpen(StringBuilder html, HmiScreenItemBase item, double width, double height, HmiHtmlConvertContext context)
    {
        html.Append("<svg");
        AppendCommonAttributes(html, item, context, includePaintedStyle: false);
        AppendAttribute(html, "viewBox", "0 0 " + ToCss(Math.Max(width, 1)) + " " + ToCss(Math.Max(height, 1)));
        AppendAttribute(html, "xmlns", "http://www.w3.org/2000/svg");
        html.Append(">");
    }

    private static void AppendStrokeAttributes(StringBuilder html, HmiShapeBase item, HmiColor? fillColor, HmiHtmlConvertContext context)
    {
        var lineStyle = GetLineStyle(item, context);
        var fillPattern = GetFillPattern(item, context);
        var colorGradient = GetColorGradient(item);
        var usesSolidFill = fillColor is not null && fillPattern != HmiFillPattern.Transparent &&
            !TryGetFillPercentage(item.FillAnimation, out _) && colorGradient is null &&
            fillPattern is null or HmiFillPattern.Solid;
        var fill = fillColor == null || fillPattern == HmiFillPattern.Transparent
            ? "none"
            : TryGetFillPercentage(item.FillAnimation, out _)
                ? $"url(#{GetFillGradientId(item)})"
                : colorGradient is not null
                    ? $"url(#{GetColorGradientId(item)})"
                : fillPattern is not null and not HmiFillPattern.Solid
                    ? $"url(#{GetFillPatternId(item)})"
                    : ToCss(fillColor.Value);
        AppendAttribute(html, "fill", fill);
        var svgStyle = new StringBuilder();
        var svgAnimations = new List<string>();
        if (usesSolidFill && GetFillColorProperty(item, context) is HmiBlinkProperty<HmiColor> fillBlink &&
            fillBlink.StaticValue is HmiColor fillOff && fillBlink.BlinkValue is HmiColor fillOn)
        {
            svgStyle.Append("--hmi-background-color-off: ").Append(ToCss(fillOff)).Append(';')
                .Append("--hmi-background-color-on: ").Append(ToCss(fillOn)).Append(';');
            svgAnimations.Add($"hmi-background-color-flash {GetBlinkDuration(fillBlink.Rate)}s steps(1, end) infinite");
        }
        var strokeColor = GetStrokeColorProperty(item, context);
        AppendAttribute(html, "stroke", lineStyle == HmiLineStyle.None
            ? "none"
            : ToCss(strokeColor?.StaticValue ?? HmiColor.FromArgb(255, 0, 0, 0)));
        if (lineStyle != HmiLineStyle.None && strokeColor is HmiBlinkProperty<HmiColor> strokeBlink &&
            strokeBlink.StaticValue is HmiColor strokeOff && strokeBlink.BlinkValue is HmiColor strokeOn)
        {
            svgStyle.Append("--hmi-border-color-off: ").Append(ToCss(strokeOff)).Append(';')
                .Append("--hmi-border-color-on: ").Append(ToCss(strokeOn)).Append(';');
            svgAnimations.Add($"hmi-border-color-flash {GetBlinkDuration(strokeBlink.Rate)}s steps(1, end) infinite");
        }
        if (svgAnimations.Count > 0)
            svgStyle.Append("animation: ").Append(string.Join(", ", svgAnimations)).Append(';');
        if (svgStyle.Length > 0)
            AppendAttribute(html, "style", svgStyle.ToString());
        AppendSvgAttribute(html, "stroke-width", GetStrokeWidth(item, context));
        var hasLineCap = context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiShapeBase.LineCap), item.LineCap, out var lineCap);
        if (hasLineCap)
            AppendAttribute(html, "stroke-linecap", ToCss(lineCap));
        if (GetLineMarker(item, nameof(HmiShapeBase.StartMarker), item.StartMarker, context) is not HmiLineMarker.None)
            AppendAttribute(html, "marker-start", $"url(#{GetLineMarkerId(item, true)})");
        if (GetLineMarker(item, nameof(HmiShapeBase.EndMarker), item.EndMarker, context) is not HmiLineMarker.None)
            AppendAttribute(html, "marker-end", $"url(#{GetLineMarkerId(item, false)})");

        switch (lineStyle)
        {
            case HmiLineStyle.Dash:
                AppendAttribute(html, "stroke-dasharray", "6 4");
                break;
            case HmiLineStyle.Dot:
                AppendAttribute(html, "stroke-dasharray", "1 3");
                if (!hasLineCap)
                    AppendAttribute(html, "stroke-linecap", "round");
                break;
            case HmiLineStyle.DashDot:
                AppendAttribute(html, "stroke-dasharray", "6 3 1 3");
                if (!hasLineCap)
                    AppendAttribute(html, "stroke-linecap", "round");
                break;
            case HmiLineStyle.DashDotDot:
                AppendAttribute(html, "stroke-dasharray", "6 3 1 3 1 3");
                if (!hasLineCap)
                    AppendAttribute(html, "stroke-linecap", "round");
                break;
        }
    }

    private static void AppendSvgFillDefinition(
        StringBuilder html,
        HmiShapeBase item,
        HmiColor? fillColor,
        HmiHtmlConvertContext context)
    {
        if (fillColor is null)
            return;

        if (!TryGetFillPercentage(item.FillAnimation, out var percentage))
        {
            if (GetColorGradient(item) is { } colorGradient)
            {
                AppendSvgColorGradientDefinition(html, item, colorGradient);
                return;
            }
            AppendSvgPatternDefinition(html, item, fillColor.Value, context);
            return;
        }

        var (x1, y1, x2, y2) = GetSvgFillVector(item.FillAnimation?.Direction);
        html.Append("<defs><linearGradient");
        AppendAttribute(html, "id", GetFillGradientId(item));
        AppendAttribute(html, "x1", x1);
        AppendAttribute(html, "y1", y1);
        AppendAttribute(html, "x2", x2);
        AppendAttribute(html, "y2", y2);
        html.Append("><stop");
        AppendAttribute(html, "offset", ToCss(percentage) + "%");
        AppendAttribute(html, "stop-color", ToCss(fillColor.Value));
        html.Append("></stop><stop");
        AppendAttribute(html, "offset", ToCss(percentage) + "%");
        AppendAttribute(html, "stop-color", "transparent");
        html.Append("></stop></linearGradient></defs>");
    }

    private static void AppendSvgColorGradientDefinition(StringBuilder html, HmiShapeBase item, ColorGradient gradient)
    {
        var (x1, y1, x2, y2) = GetSvgGradientVector(gradient.Direction);
        html.Append("<defs><linearGradient");
        AppendAttribute(html, "id", GetColorGradientId(item));
        AppendAttribute(html, "x1", x1);
        AppendAttribute(html, "y1", y1);
        AppendAttribute(html, "x2", x2);
        AppendAttribute(html, "y2", y2);
        html.Append('>');
        foreach (var (color, offset) in gradient.Stops)
        {
            html.Append("<stop");
            AppendAttribute(html, "offset", ToCss(offset) + "%");
            AppendAttribute(html, "stop-color", ToCss(color));
            html.Append("></stop>");
        }
        html.Append("</linearGradient></defs>");
    }

    private static void AppendSvgPatternDefinition(
        StringBuilder html,
        HmiShapeBase item,
        HmiColor fillColor,
        HmiHtmlConvertContext context)
    {
        var pattern = GetFillPattern(item, context);
        if (pattern is null or HmiFillPattern.Transparent or HmiFillPattern.Solid)
            return;

        var patternColor = GetPatternColor(item, context);
        var size = pattern switch
        {
            HmiFillPattern.DottedEvenOddFiner or HmiFillPattern.DiagonalCrossFiner or HmiFillPattern.CheckersFiner or HmiFillPattern.SmallBoxes => 4,
            HmiFillPattern.LargeBoxes or HmiFillPattern.Ovals or HmiFillPattern.Scales or HmiFillPattern.Waves => 12,
            _ => 8
        };
        html.Append("<defs><pattern");
        AppendAttribute(html, "id", GetFillPatternId(item));
        AppendAttribute(html, "patternUnits", "userSpaceOnUse");
        AppendAttribute(html, "width", size.ToString(CultureInfo.InvariantCulture));
        AppendAttribute(html, "height", size.ToString(CultureInfo.InvariantCulture));
        html.Append("><rect width=\"100%\" height=\"100%\"");
        AppendAttribute(html, "fill", ToCss(fillColor));
        html.Append("></rect>");
        AppendSvgPatternMarks(html, pattern.Value, size, patternColor);
        html.Append("</pattern></defs>");
    }

    private static void AppendSvgMarkerDefinitions(
        StringBuilder html,
        HmiShapeBase item,
        HmiHtmlConvertContext context)
    {
        var start = GetLineMarker(item, nameof(HmiShapeBase.StartMarker), item.StartMarker, context);
        var end = GetLineMarker(item, nameof(HmiShapeBase.EndMarker), item.EndMarker, context);
        if (start == HmiLineMarker.None && end == HmiLineMarker.None)
            return;

        var color = ToCss(GetStrokeColor(item, context));
        html.Append("<defs>");
        if (start != HmiLineMarker.None)
            AppendSvgMarkerDefinition(html, GetLineMarkerId(item, true), start, color);
        if (end != HmiLineMarker.None)
            AppendSvgMarkerDefinition(html, GetLineMarkerId(item, false), end, color);
        html.Append("</defs>");
    }

    private static void AppendSvgMarkerDefinition(StringBuilder html, string id, HmiLineMarker marker, string color)
    {
        var reversed = marker == HmiLineMarker.FilledArrowReversed;
        html.Append("<marker");
        AppendAttribute(html, "id", id);
        AppendAttribute(html, "viewBox", "-1 -1 12 12");
        AppendAttribute(html, "markerWidth", "6");
        AppendAttribute(html, "markerHeight", "6");
        AppendAttribute(html, "refX", marker is HmiLineMarker.Circle or HmiLineMarker.FilledCircle or HmiLineMarker.Line ? "5" : reversed ? "0" : "10");
        AppendAttribute(html, "refY", "5");
        AppendAttribute(html, "orient", "auto-start-reverse");
        AppendAttribute(html, "markerUnits", "strokeWidth");
        html.Append('>');
        switch (marker)
        {
            case HmiLineMarker.Arrow:
                html.Append("<path d=\"M0 0L10 5L0 10\"");
                AppendAttribute(html, "fill", "none");
                AppendAttribute(html, "stroke", color);
                html.Append("></path>");
                break;
            case HmiLineMarker.FilledArrow:
            case HmiLineMarker.FilledArrowReversed:
                AppendMarkerPath(html, reversed ? "M10 0L0 5L10 10Z" : "M0 0L10 5L0 10Z", color, color);
                break;
            case HmiLineMarker.Line:
                AppendMarkerPath(html, "M5 0V10", "none", color);
                break;
            case HmiLineMarker.Circle:
            case HmiLineMarker.FilledCircle:
                html.Append("<circle cx=\"5\" cy=\"5\" r=\"4\"");
                AppendAttribute(html, "fill", marker == HmiLineMarker.FilledCircle ? color : "none");
                AppendAttribute(html, "stroke", color);
                html.Append("></circle>");
                break;
        }
        html.Append("</marker>");
    }

    private static void AppendMarkerPath(StringBuilder html, string data, string fill, string stroke)
    {
        html.Append("<path");
        AppendAttribute(html, "d", data);
        AppendAttribute(html, "fill", fill);
        AppendAttribute(html, "stroke", stroke);
        html.Append("></path>");
    }

    private static HmiLineMarker GetLineMarker(
        HmiShapeBase item,
        string propertyName,
        HmiProperty<HmiLineMarker>? property,
        HmiHtmlConvertContext context) =>
        context.EffectiveProperties.TryGetStaticValue(item, propertyName, property, out var marker)
            ? marker
            : HmiLineMarker.None;

    private static void AppendSvgPatternMarks(StringBuilder html, HmiFillPattern pattern, int size, HmiColor color)
    {
        var cssColor = ToCss(color);
        switch (pattern)
        {
            case HmiFillPattern.Checkers:
            case HmiFillPattern.CheckersFiner:
                html.Append("<path");
                AppendAttribute(html, "d", $"M0 0H{size / 2}V{size / 2}H0ZM{size / 2} {size / 2}H{size}V{size}H{size / 2}Z");
                AppendAttribute(html, "fill", cssColor);
                html.Append("></path>");
                break;
            case HmiFillPattern.Horizontal:
            case HmiFillPattern.HorizontalDifferentLines:
            case HmiFillPattern.WideHorizontal:
                AppendPatternPath(html, $"M0 1H{size} M0 {size / 2 + 1}H{size}", cssColor, pattern is HmiFillPattern.HorizontalDifferentLines or HmiFillPattern.WideHorizontal ? 2 : 1);
                break;
            case HmiFillPattern.Vertical:
            case HmiFillPattern.WideVertical:
                AppendPatternPath(html, $"M1 0V{size} M{size / 2 + 1} 0V{size}", cssColor, pattern == HmiFillPattern.WideVertical ? 2 : 1);
                break;
            case HmiFillPattern.SmallBoxes:
            case HmiFillPattern.MediumBoxes:
            case HmiFillPattern.LargeBoxes:
                AppendPatternPath(html, $"M0 0H{size}V{size}H0Z", cssColor, 1);
                break;
            case HmiFillPattern.DottedHorizontal:
            case HmiFillPattern.DottedEvenOdd:
            case HmiFillPattern.DottedEvenOddFiner:
            case HmiFillPattern.DottedEvenOddFinest:
            case HmiFillPattern.DottedHorizontalInverted:
            case HmiFillPattern.Dots:
                html.Append("<circle");
                AppendAttribute(html, "cx", (size / 4d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "cy", (size / 4d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "r", pattern == HmiFillPattern.DottedHorizontalInverted ? "2" : "1");
                AppendAttribute(html, "fill", cssColor);
                html.Append("></circle><circle");
                AppendAttribute(html, "cx", (size * 0.75d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "cy", (size * 0.75d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "r", pattern == HmiFillPattern.DottedHorizontalInverted ? "2" : "1");
                AppendAttribute(html, "fill", cssColor);
                html.Append("></circle>");
                break;
            case HmiFillPattern.Ovals:
                html.Append("<ellipse");
                AppendAttribute(html, "cx", (size / 2d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "cy", (size / 2d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "rx", (size / 3d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "ry", (size / 4d).ToString(CultureInfo.InvariantCulture));
                AppendAttribute(html, "fill", "none");
                AppendAttribute(html, "stroke", cssColor);
                html.Append("></ellipse>");
                break;
            case HmiFillPattern.Diamonds:
                AppendPatternPath(html, $"M{size / 2} 0L{size} {size / 2}L{size / 2} {size}L0 {size / 2}Z", cssColor, 1);
                break;
            case HmiFillPattern.Scales:
                AppendPatternPath(html, $"M0 {size / 2}Q{size / 4} 0 {size / 2} {size / 2}T{size} {size / 2} M-{size / 2} {size}Q-{size / 4} {size / 2} 0 {size}T{size / 2} {size}", cssColor, 1);
                break;
            case HmiFillPattern.Waves:
                AppendPatternPath(html, $"M0 {size / 2}Q{size / 4} 0 {size / 2} {size / 2}T{size} {size / 2}", cssColor, 1);
                break;
            case HmiFillPattern.Bricks:
            case HmiFillPattern.BricksDiagonal:
                AppendPatternPath(html, $"M0 0H{size} M0 {size / 2}H{size} M{size / 2} 0V{size / 2} M0 {size / 2}V{size}", cssColor, 1);
                break;
            default:
                var leftToRight = pattern is HmiFillPattern.DiagonalLeftToRight or HmiFillPattern.Diagonal or HmiFillPattern.DiagonalCross or HmiFillPattern.DiagonalCrossFiner or HmiFillPattern.DiagonalCrossBold or HmiFillPattern.WideDiagonalLeftToRight;
                var rightToLeft = pattern is HmiFillPattern.DiagonalRightToLeft or HmiFillPattern.DiagonalCross or HmiFillPattern.DiagonalCrossFiner or HmiFillPattern.DiagonalCrossBold or HmiFillPattern.WideDiagonalRightToLeft;
                var lineWidth = pattern is HmiFillPattern.DiagonalCrossBold or HmiFillPattern.WideDiagonalLeftToRight or HmiFillPattern.WideDiagonalRightToLeft ? 2 : 1;
                if (leftToRight)
                    AppendPatternPath(html, $"M-{size / 4} {size / 4}L{size / 4} -{size / 4} M0 {size}L{size} 0 M{size * 3 / 4} {size + size / 4}L{size + size / 4} {size * 3 / 4}", cssColor, lineWidth);
                if (rightToLeft)
                    AppendPatternPath(html, $"M-{size / 4} {size * 3 / 4}L{size / 4} {size + size / 4} M0 0L{size} {size} M{size * 3 / 4} -{size / 4}L{size + size / 4} {size / 4}", cssColor, lineWidth);
                break;
        }
    }

    private static void AppendPatternPath(StringBuilder html, string data, string color, int width)
    {
        html.Append("<path");
        AppendAttribute(html, "d", data);
        AppendAttribute(html, "stroke", color);
        AppendAttribute(html, "stroke-width", width.ToString(CultureInfo.InvariantCulture));
        AppendAttribute(html, "fill", "none");
        html.Append("></path>");
    }

    private static (string x1, string y1, string x2, string y2) GetSvgFillVector(HmiFillDirection? direction) => direction switch
    {
        HmiFillDirection.Up => ("0%", "100%", "0%", "0%"),
        HmiFillDirection.Down => ("0%", "0%", "0%", "100%"),
        HmiFillDirection.Left => ("100%", "0%", "0%", "0%"),
        _ => ("0%", "0%", "100%", "0%")
    };

    private static (string x1, string y1, string x2, string y2) GetSvgGradientVector(HmiGradientDirection direction) => direction switch
    {
        HmiGradientDirection.HorizontalFromRight => ("100%", "0%", "0%", "0%"),
        HmiGradientDirection.VerticalFromTop or HmiGradientDirection.VerticalFromCenter => ("0%", "0%", "0%", "100%"),
        HmiGradientDirection.VerticalFromBottom => ("0%", "100%", "0%", "0%"),
        HmiGradientDirection.DiagonalUp => ("0%", "100%", "100%", "0%"),
        HmiGradientDirection.DiagonalDown => ("0%", "0%", "100%", "100%"),
        _ => ("0%", "0%", "100%", "0%")
    };

    private static string GetFillGradientId(HmiShapeBase item)
    {
        var source = item.Name ?? item.Id ?? "shape";
        var sanitized = new string(source.Select(character => char.IsLetterOrDigit(character) || character is '-' or '_' ? character : '-').ToArray());
        return "hmi-fill-" + (string.IsNullOrEmpty(sanitized) ? "shape" : sanitized);
    }

    private static string GetFillPatternId(HmiShapeBase item) => GetFillGradientId(item).Replace("hmi-fill-", "hmi-pattern-");

    private static string GetColorGradientId(HmiShapeBase item) => GetFillGradientId(item).Replace("hmi-fill-", "hmi-color-gradient-");

    private static string GetLineMarkerId(HmiShapeBase item, bool start) =>
        GetFillGradientId(item).Replace("hmi-fill-", start ? "hmi-marker-start-" : "hmi-marker-end-");

    private static HmiFillPattern? GetFillPattern(HmiPaintedScreenItemBase item, HmiHtmlConvertContext context)
    {
        return item switch
        {
            HmiShapeBase shape when context.EffectiveProperties.TryGetStaticValue(shape, nameof(HmiShapeBase.FillPattern), shape.FillPattern, out var pattern) => pattern,
            HmiAlarmIndicator indicator when context.EffectiveProperties.TryGetStaticValue(indicator, nameof(HmiAlarmIndicator.FillPattern), indicator.FillPattern, out var pattern) => pattern,
            HmiWidgetBase widget when context.EffectiveProperties.TryGetStaticValue(widget, nameof(HmiWidgetBase.FillPattern), widget.FillPattern, out var pattern) => pattern,
            HmiWindowBase window when context.EffectiveProperties.TryGetStaticValue(window, nameof(HmiWindowBase.FillPattern), window.FillPattern, out var pattern) => pattern,
            _ => null
        };
    }

    private static HmiColor GetPatternColor(HmiPaintedScreenItemBase item, HmiHtmlConvertContext context)
    {
        if (context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiPaintedScreenItemBase.PatternColor), item.PatternColor, out var color))
            return color;
        if (item is HmiShapeBase shape)
            return GetStrokeColor(shape, context);
        if (context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiPaintedScreenItemBase.ForegroundColor), item.ForegroundColor, out var foregroundColor))
            return foregroundColor;
        return HmiColor.FromArgb(255, 0, 0, 0);
    }

    private static bool TryGetFillPercentage(HmiFillAnimation? animation, out double percentage)
    {
        percentage = 0d;
        if (animation is null)
            return false;

        double value;
        if (animation.ExpressionFallback is double fallback)
            value = fallback;
        else if (!double.TryParse(animation.Expression, NumberStyles.Float, CultureInfo.InvariantCulture, out value))
            return false;

        var expressionMinimum = animation.ExpressionMinimum ?? 0d;
        var expressionMaximum = animation.ExpressionMaximum ?? 100d;
        var normalized = expressionMaximum == expressionMinimum
            ? 0d
            : (value - expressionMinimum) / (expressionMaximum - expressionMinimum);
        var fillMinimum = animation.FillMinimum ?? 0d;
        var fillMaximum = animation.FillMaximum ?? 100d;
        percentage = Math.Min(Math.Max(fillMinimum + (fillMaximum - fillMinimum) * normalized, 0d), 100d);
        return true;
    }

    private static string CreateArcPath(
        double centerX,
        double centerY,
        double radiusX,
        double radiusY,
        double startAngle,
        double sweepAngle,
        bool segment)
    {
        var endAngle = startAngle + sweepAngle;
        var start = GetEllipsePoint(centerX, centerY, radiusX, radiusY, startAngle);
        var end = GetEllipsePoint(centerX, centerY, radiusX, radiusY, endAngle);
        var largeArc = Math.Abs(sweepAngle) > 180d ? 1 : 0;
        var sweep = sweepAngle >= 0d ? 1 : 0;

        var path = new StringBuilder();
        if (segment)
        {
            path.Append("M ").Append(ToCss(centerX)).Append(' ').Append(ToCss(centerY)).Append(' ');
            path.Append("L ").Append(ToCss(start.X)).Append(' ').Append(ToCss(start.Y)).Append(' ');
        }
        else
        {
            path.Append("M ").Append(ToCss(start.X)).Append(' ').Append(ToCss(start.Y)).Append(' ');
        }

        path.Append("A ")
            .Append(ToCss(radiusX)).Append(' ')
            .Append(ToCss(radiusY)).Append(" 0 ")
            .Append(largeArc).Append(' ')
            .Append(sweep).Append(' ')
            .Append(ToCss(end.X)).Append(' ')
            .Append(ToCss(end.Y));

        if (segment)
            path.Append(" Z");

        return path.ToString();
    }

    private static HmiPoint GetEllipsePoint(double centerX, double centerY, double radiusX, double radiusY, double angle)
    {
        var radians = angle * Math.PI / 180d;
        return new HmiPoint(
            centerX + Math.Cos(radians) * radiusX,
            centerY + Math.Sin(radians) * radiusY);
    }

    private static double GetSvgWidth(HmiScreenItemBase item)
    {
        return item.Width.GetStaticValueOrDefault(1d);
    }

    private static double GetSvgHeight(HmiScreenItemBase item)
    {
        return item.Height.GetStaticValueOrDefault(1d);
    }

    private static HmiProperty<HmiColor>? GetStrokeColorProperty(HmiShapeBase item, HmiHtmlConvertContext context)
    {
        var lineColor = context.EffectiveProperties.Resolve(item, nameof(HmiShapeBase.LineColor), item.LineColor);
        if (lineColor?.StaticValue is not null)
            return lineColor;
        var borderColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BorderColor), item.BorderColor);
        if (borderColor?.StaticValue is not null)
            return borderColor;
        var foregroundColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.ForegroundColor), item.ForegroundColor);
        var useDisabledForegroundColor = !ResolveStaticValue(item.Enabled, context) &&
            ResolveStaticValue(item.UseDisabledForegroundColor, context);
        if (useDisabledForegroundColor)
        {
            foregroundColor = context.EffectiveProperties.Resolve(
                item,
                nameof(HmiPaintedScreenItemBase.DisabledForegroundColor),
                item.DisabledForegroundColor) ?? foregroundColor;
        }
        return foregroundColor?.StaticValue is not null ? foregroundColor : null;
    }

    private static HmiColor GetStrokeColor(HmiShapeBase item, HmiHtmlConvertContext context) =>
        GetStrokeColorProperty(item, context)?.StaticValue ?? HmiColor.FromArgb(255, 0, 0, 0);

    private static HmiColor? GetFillColor(HmiShapeBase item, HmiHtmlConvertContext context)
    {
        return GetFillColorProperty(item, context)?.StaticValue;
    }

    private static HmiProperty<HmiColor>? GetFillColorProperty(HmiShapeBase item, HmiHtmlConvertContext context) =>
        context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BackgroundColor), item.BackgroundColor);

    private static double GetStrokeWidth(HmiShapeBase item, HmiHtmlConvertContext context)
    {
        if (context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiShapeBase.LineWidth), item.LineWidth, out var lineWidth))
            return lineWidth;
        if (item is HmiPaintedScreenItemBase paintedItem
            && context.EffectiveProperties.TryGetStaticValue(paintedItem, nameof(HmiPaintedScreenItemBase.BorderWidth), paintedItem.BorderWidth, out var borderWidth))
            return borderWidth;

        return 1d;
    }

    private static HmiLineStyle GetLineStyle(HmiShapeBase item, HmiHtmlConvertContext context)
    {
        return context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiShapeBase.DashType), item.DashType, out var dashType)
            ? (HmiLineStyle)dashType
            : HmiLineStyle.Solid;
    }

    private static bool TryGetStaticValue<T>(HmiProperty<T>? property, out T value)
    {
        if (property == null)
        {
            value = default!;
            return false;
        }

        value = property.StaticValue!;
        return true;
    }

    private static string ToSvgPoint(HmiPointBasedShapeBase shape, HmiPoint point)
    {
        var x = point.X;
        var y = point.Y;
        if (shape.PointCoordinateSpace == HmiPointCoordinateSpace.ScreenAbsolute)
        {
            x -= shape.X.GetStaticValueOrDefault();
            y -= shape.Y.GetStaticValueOrDefault();
        }

        return ToCss(x) + "," + ToCss(y);
    }

    private static double ToSvgLineX(HmiLine line, double x)
    {
        return line.PointCoordinateSpace == HmiPointCoordinateSpace.ScreenAbsolute
            ? x - line.X.GetStaticValueOrDefault()
            : x;
    }

    private static double ToSvgLineY(HmiLine line, double y)
    {
        return line.PointCoordinateSpace == HmiPointCoordinateSpace.ScreenAbsolute
            ? y - line.Y.GetStaticValueOrDefault()
            : y;
    }

    private static void AppendSvgAttribute(StringBuilder html, string name, double value)
    {
        AppendAttribute(html, name, ToCss(value));
    }

    private static void AppendRuntimeModule(StringBuilder html)
    {
        html.Append("<script type=\"module\">");
        html.Append(HmiHtmlRuntimeModule.Script);
        html.Append("</script>");
    }

    private static void AppendGlobalStyle(StringBuilder html)
    {
        html.Append("<style>");
        html.Append(HmiHtmlCommonStyle.Style);
        html.Append("</style>");
    }

    private static async ValueTask AppendButtonAsync(
        StringBuilder html,
        HmiButton button,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        CancellationToken cancellationToken)
    {
        var stateValue = ResolveStaticValue(button.State, context);
        var state = button.States.FirstOrDefault(candidate => candidate.Value == stateValue)
            ?? button.States.FirstOrDefault();
        html.Append("<button");
        AppendCommonAttributes(html, button, context, additionalStyle: CreateButtonStyle(button, state, context));
        var enabled = button.Enabled is null || ResolveStaticValue(button.Enabled, context);
        if (!enabled)
            AppendAttribute(html, "disabled", "disabled");
        html.Append(">");
        var image = state?.Image ?? button.Image.GetStaticValue();
        var disabledImageMode = ResolveStaticValue(button.DisabledImageMode, context);
        var showDisabledAppearance = !enabled && button.ShowDisabledState is not null && ResolveStaticValue(button.ShowDisabledState, context);
        if (showDisabledAppearance && disabledImageMode is HmiDisabledImageMode.Reference or HmiDisabledImageMode.Imported)
            image = ResolveStaticValue(button.DisabledImage, context) ?? image;
        var imageUri = await ResolveImageUriAsync(image, project, cancellationToken).ConfigureAwait(false);
        if (!string.IsNullOrWhiteSpace(imageUri))
            AppendInnerImage(html, imageUri, showDisabledAppearance && disabledImageMode == HmiDisabledImageMode.Grayscale);
        AppendMultilingualText(html, state?.Text ?? ResolveStaticValue(button.Text, context), context);
        html.Append("</button>");
    }

    private static string? CreateButtonStyle(
        HmiButton button,
        HmiState? state,
        HmiHtmlConvertContext context)
    {
        var style = new StringBuilder();
        var stateHasCaptionColor = (state?.CaptionColor ?? state?.ForegroundColor) is not null;
        if (!stateHasCaptionColor && button.CaptionColor is HmiBlinkProperty<HmiColor> blinkColor && blinkColor.BlinkValue is HmiColor alternateColor)
        {
            style.Append("--hmi-caption-color-off: ").Append(ToCss(ResolveStaticValue(button.CaptionColor, context))).Append(';')
                .Append("--hmi-caption-color-on: ").Append(ToCss(alternateColor)).Append(';')
                .Append("animation: hmi-caption-color-flash ").Append(GetBlinkDuration(blinkColor.Rate))
                .Append("s steps(1, end) infinite;");
        }
        else if (!stateHasCaptionColor && button.CaptionColor is not null)
        {
            style.Append("color: ").Append(ToCss(ResolveStaticValue(button.CaptionColor, context))).Append(';');
        }
        style.Append(CreateStateStyle(state));
        var borderWidth = button.ThreeDBorderWidth is null
            ? 0d
            : ResolveStaticValue(button.ThreeDBorderWidth, context);
        if (borderWidth <= 0)
            return style.Length == 0 ? null : style.ToString();

        style.Append("border-style: solid;border-width: ").Append(ToCss(borderWidth)).Append("px;");
        HmiColor? topColor = button.ThreeDBorderTopColor is null
            ? null
            : ResolveStaticValue(button.ThreeDBorderTopColor, context);
        HmiColor? bottomColor = button.ThreeDBorderBottomColor is null
            ? null
            : ResolveStaticValue(button.ThreeDBorderBottomColor, context);
        topColor ??= bottomColor;
        bottomColor ??= topColor;
        if (topColor is not null && bottomColor is not null)
        {
            style.Append("border-color: ")
                .Append(ToCss(topColor.Value)).Append(' ')
                .Append(ToCss(bottomColor.Value)).Append(' ')
                .Append(ToCss(bottomColor.Value)).Append(' ')
                .Append(ToCss(topColor.Value)).Append(';');
        }
        return style.ToString();
    }

    private static string? CreateStateStyle(HmiState? state)
    {
        if (state is null)
            return null;

        var style = new StringBuilder();
        if (state.BackgroundColor is HmiColor backgroundColor)
            style.Append("background-color: ").Append(ToCss(backgroundColor)).Append(';');
        if ((state.CaptionColor ?? state.ForegroundColor) is HmiColor foregroundColor)
            style.Append("color: ").Append(ToCss(foregroundColor)).Append(';');
        if (state.BorderColor is HmiColor borderColor)
            style.Append("border-color: ").Append(ToCss(borderColor)).Append(';');
        return style.Length == 0 ? null : style.ToString();
    }

    private static void AppendInput(StringBuilder html, HmiIOField ioField, HmiHtmlConvertContext context)
    {
        html.Append("<input");
        AppendCommonAttributes(html, ioField, context);
        var text = ResolveStaticValue(ioField.Text, context)?.GetDisplayText(context.CultureInfo);
        if (string.IsNullOrWhiteSpace(text) && ioField.Text is HmiExpressionProperty<HmiMultilingualText> expression)
            text = expression.Expression;
        AppendAttribute(html, "value", text);
        if (ioField.ReadOnly is not null && ResolveStaticValue(ioField.ReadOnly, context))
            AppendAttribute(html, "readonly", "readonly");
        if (ioField.MaskInput is not null && ResolveStaticValue(ioField.MaskInput, context))
            AppendAttribute(html, "type", "password");
        if (ioField.FieldLength is not null)
            AppendAttribute(html, "maxlength", ResolveStaticValue(ioField.FieldLength, context).ToString(CultureInfo.InvariantCulture));
        html.Append(">");
    }

    private static void AppendBar(StringBuilder html, HmiBar bar, HmiHtmlConvertContext context)
    {
        var (minimum, maximum) = ResolveScaleRange(bar, context);
        var value = ResolveScaleValue(bar, minimum, maximum, context);
        var direction = bar.FillDirection is null
            ? HmiFillDirection.Right
            : ResolveStaticValue(bar.FillDirection, context);
        var showScale = bar.ShowScale is not null && ResolveStaticValue(bar.ShowScale, context);
        var showThresholds = bar.Thresholds.Any(threshold =>
            threshold.Value is not null &&
            (threshold.Enabled is null || ResolveStaticValue(threshold.Enabled, context)));
        if (showScale || showThresholds)
        {
            var vertical = direction is HmiFillDirection.Up or HmiFillDirection.Down;
            var scaleBefore = showScale && bar.ScaleAfterBar is not null && !ResolveStaticValue(bar.ScaleAfterBar, context);
            html.Append("<div");
            AppendCommonAttributes(
                html,
                bar,
                context,
                additionalStyle: showScale
                    ? vertical
                        ? "display: flex; flex-direction: row; align-items: stretch; gap: 4px;"
                        : "display: flex; flex-direction: column; align-items: stretch; gap: 2px;"
                    : "display: flex; align-items: stretch;");
            AppendAttribute(html, "data-hmi-bar", "true");
            AppendAttribute(html, "data-fill-direction", direction.ToString());
            if (showScale)
                AppendAttribute(html, "data-scale-side", vertical ? scaleBefore ? "Left" : "Right" : scaleBefore ? "Top" : "Bottom");
            html.Append('>');
            if (scaleBefore)
                AppendBarScale(html, bar, minimum, maximum, direction, vertical, context);
            AppendBarMeterRegion(html, bar, minimum, maximum, value, direction, vertical, context);
            if (showScale && !scaleBefore)
                AppendBarScale(html, bar, minimum, maximum, direction, vertical, context);
            html.Append("</div>");
            return;
        }

        html.Append("<meter");
        AppendCommonAttributes(html, bar, context, additionalStyle: GetBarDirectionStyle(direction));
        AppendAttribute(html, "data-fill-direction", direction.ToString());
        AppendAttribute(html, "min", ToCss(minimum));
        AppendAttribute(html, "max", ToCss(maximum));
        AppendAttribute(html, "value", ToCss(value));
        html.Append('>').Append(ToCss(value)).Append("</meter>");
    }

    private static void AppendBarMeterRegion(
        StringBuilder html,
        HmiBar bar,
        double minimum,
        double maximum,
        double value,
        HmiFillDirection direction,
        bool vertical,
        HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendAttribute(html, "data-hmi-bar-meter", "true");
        AppendAttribute(html, "style", "position: relative; display: flex; flex: 1; min-width: 0; min-height: 0;");
        html.Append('>');
        AppendBarMeter(html, minimum, maximum, value, direction, vertical);
        AppendBarThresholds(html, bar, minimum, maximum, direction, context);
        html.Append("</div>");
    }

    private static void AppendBarMeter(
        StringBuilder html,
        double minimum,
        double maximum,
        double value,
        HmiFillDirection direction,
        bool vertical)
    {
        html.Append("<meter");
        AppendAttribute(
            html,
            "style",
            (vertical ? "height: 100%;" : "width: 100%;") +
            " flex: 1; min-width: 0; min-height: 0;" + GetBarDirectionStyle(direction));
        AppendAttribute(html, "min", ToCss(minimum));
        AppendAttribute(html, "max", ToCss(maximum));
        AppendAttribute(html, "value", ToCss(value));
        html.Append('>').Append(ToCss(value)).Append("</meter>");
    }

    private static void AppendBarThresholds(
        StringBuilder html,
        HmiBar bar,
        double minimum,
        double maximum,
        HmiFillDirection direction,
        HmiHtmlConvertContext context)
    {
        var percentageMode = bar.ThresholdValueMode is not null &&
            ResolveStaticValue(bar.ThresholdValueMode, context) == HmiThresholdValueMode.Percentage;
        for (var index = 0; index < bar.Thresholds.Count; index++)
        {
            var threshold = bar.Thresholds[index];
            if (threshold.Value is null ||
                (threshold.Enabled is not null && !ResolveStaticValue(threshold.Enabled, context)))
                continue;
            var thresholdValue = ResolveStaticValue(threshold.Value, context);
            var percentage = percentageMode
                ? thresholdValue
                : maximum == minimum ? 0d : (thresholdValue - minimum) * 100d / (maximum - minimum);
            percentage = Clamp(percentage, 0d, 100d);
            var position = direction switch
            {
                HmiFillDirection.Up => $"left: 0; right: 0; bottom: {ToCss(percentage)}%; height: 2px;",
                HmiFillDirection.Down => $"left: 0; right: 0; top: {ToCss(percentage)}%; height: 2px;",
                HmiFillDirection.Left => $"top: 0; bottom: 0; right: {ToCss(percentage)}%; width: 2px;",
                _ => $"top: 0; bottom: 0; left: {ToCss(percentage)}%; width: 2px;"
            };
            var color = threshold.Color is null
                ? "currentColor"
                : ToCss(ResolveStaticValue(threshold.Color, context));
            html.Append("<span");
            AppendAttribute(html, "data-hmi-bar-threshold", (threshold.Index ?? index).ToString(CultureInfo.InvariantCulture));
            AppendAttribute(html, "data-threshold-value", ToCss(thresholdValue));
            AppendAttribute(html, "style",
                $"position: absolute; pointer-events: none; z-index: 1; background-color: {color}; {position}");
            html.Append("></span>");
        }
    }

    private static void AppendBarScale(
        StringBuilder html,
        HmiBar bar,
        double minimum,
        double maximum,
        HmiFillDirection direction,
        bool vertical,
        HmiHtmlConvertContext context)
        => AppendScaleMarks(html, bar, minimum, maximum, direction, vertical,
            bar.ScaleAfterBar is null || ResolveStaticValue(bar.ScaleAfterBar, context), context, false);

    private static void AppendScaleMarks(
        StringBuilder html,
        HmiScaleWidgetBase bar,
        double minimum,
        double maximum,
        HmiFillDirection direction,
        bool vertical,
        bool afterBar,
        HmiHtmlConvertContext context,
        bool standalone)
    {
        var sections = bar.DivisionCount is null ? 0 : ResolveStaticValue(bar.DivisionCount, context);
        var tickCount = sections > 0 ? Math.Min(100, sections) + 1 : 2;
        var interval = bar.MajorTickInterval is null ? 0 : ResolveStaticValue(bar.MajorTickInterval, context);
        var scaleMode = bar.ScaleMode is null ? 0 : ResolveStaticValue(bar.ScaleMode, context);
        var explicitInterval = scaleMode == 0 && double.IsFinite(interval) && interval > 0 && maximum > minimum
            && (maximum - minimum) / interval <= 10000;
        if (explicitInterval)
            tickCount = (int)Math.Floor((maximum - minimum) / interval + 1e-10) + 1;
        var ratios = Enumerable.Range(0, tickCount).Select(index => explicitInterval
            ? Math.Min(1d, index * interval / (maximum - minimum))
            : (double)index / (tickCount - 1)).ToArray();
        if (direction is HmiFillDirection.Up or HmiFillDirection.Left)
            Array.Reverse(ratios);
        var decimalPlaces = bar.TickLabelDecimalPlaces is null
            ? (int?)null
            : Clamp(ResolveStaticValue(bar.TickLabelDecimalPlaces, context), 0, 20);
        var engineeringUnit = bar.EngineeringUnit is null
            ? null
            : ResolveStaticValue(bar.EngineeringUnit, context);
        var reverse = direction is HmiFillDirection.Up or HmiFillDirection.Left;
        var labelInterval = bar.TickLabelInterval is null ? 1 : Math.Max(1, ResolveStaticValue(bar.TickLabelInterval, context));
        var showLabels = bar.ShowTickLabels is null || ResolveStaticValue(bar.ShowTickLabels, context);
        var exponentialFormat = bar.TickLabelExponentialFormat is not null && ResolveStaticValue(bar.TickLabelExponentialFormat, context);
        var style = new StringBuilder(vertical
            ? "display: flex; flex-direction: column; justify-content: space-between; height: 100%;"
            : "display: flex; justify-content: space-between; width: 100%;");
        var labelColor = bar.LabelColor ?? bar.ScaleForegroundColor;
        if (labelColor is not null)
            style.Append(" color: ").Append(ToCss(ResolveStaticValue(labelColor, context))).Append(';');
        if (bar.ScaleBackgroundColor is not null)
            style.Append(" background-color: ").Append(ToCss(ResolveStaticValue(bar.ScaleBackgroundColor, context))).Append(';');
        AppendBarScaleFontStyle(style, bar.LabelFont, context);

        var tickLength = bar.MajorTickLength is null ? 6 : Math.Max(0, ResolveStaticValue(bar.MajorTickLength, context));
        var tickWidth = bar.MajorTicksBold is not null && ResolveStaticValue(bar.MajorTicksBold, context) ? 2 : 1;
        var edge = vertical ? (afterBar ? "left" : "right") : (afterBar ? "top" : "bottom");
        style.Append(" position: relative; box-sizing: border-box; padding-").Append(edge).Append(": ")
            .Append(tickLength + 2).Append("px;");
        if (!vertical)
            style.Append(" min-height: ").Append(tickLength + 2).Append("px;");
        if (explicitInterval)
        {
            if (vertical)
                style.Append(" min-width: calc(").Append(tickLength + 2).Append("px + 12ch);");
            else
                style.Append(" min-height: calc(").Append(tickLength + 2).Append("px + 1.2em);");
        }

        html.Append("<div");
        AppendAttribute(html, standalone ? "data-hmi-scale-labels" : "data-hmi-bar-scale", "true");
        AppendAttribute(html, "style", style.ToString());
        html.Append('>');
        for (var index = 0; index < tickCount; index++)
        {
            var ratio = ratios[index];
            var tick = minimum + ((maximum - minimum) * ratio);
            var label = exponentialFormat ? tick.ToString($"e{decimalPlaces ?? 2}", CultureInfo.InvariantCulture) : decimalPlaces is int places
                ? tick.ToString($"F{places}", CultureInfo.InvariantCulture)
                : ToCss(tick);
            html.Append("<span");
            if (explicitInterval)
            {
                var position = reverse ? 1d - ratio : ratio;
                var translation = position == 0 ? 0 : position == 1 ? -100 : -50;
                AppendAttribute(html, "style", vertical
                    ? $"position: absolute; top: {ToCss(position * 100)}%; {edge}: {tickLength + 2}px; transform: translateY({translation}%); white-space: nowrap;"
                    : $"position: absolute; left: {ToCss(position * 100)}%; {edge}: {tickLength + 2}px; transform: translateX({translation}%); white-space: nowrap;");
            }
            html.Append('>');
            var tickIndex = reverse ? tickCount - 1 - index : index;
            if (showLabels && tickIndex % labelInterval == 0)
            {
                html.Append(label);
                if (!string.IsNullOrWhiteSpace(engineeringUnit))
                    html.Append("&nbsp;").Append(WebUtility.HtmlEncode(engineeringUnit));
            }
            html.Append("</span>");
        }
        html.Append("<svg xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"");
        AppendAttribute(html, standalone ? "data-hmi-scale-ticks" : "data-hmi-bar-ticks", "true");
        AppendAttribute(html, "style", $"position: absolute; pointer-events: none; overflow: visible; {edge}: 0; " +
            (vertical ? $"top: 0; width: {tickLength}px; height: 100%;" : $"left: 0; width: 100%; height: {tickLength}px;"));
        var tickColor = bar.TickColor ?? bar.ScaleForegroundColor;
        AppendAttribute(html, "stroke", tickColor is null ? "currentColor" : ToCss(ResolveStaticValue(tickColor, context)));
        AppendAttribute(html, "stroke-width", tickWidth.ToString(CultureInfo.InvariantCulture));
        html.Append('>');
        for (var index = 0; index < tickCount; index++)
        {
            var percentage = ToCss(100d * (reverse ? 1d - ratios[index] : ratios[index]));
            html.Append(vertical
                ? $"<line x1=\"0\" x2=\"{tickLength}\" y1=\"{percentage}%\" y2=\"{percentage}%\"></line>"
                : $"<line y1=\"0\" y2=\"{tickLength}\" x1=\"{percentage}%\" x2=\"{percentage}%\"></line>");
        }
        var subdivisions = bar.SubDivisionCount is null ? 0 : Clamp(ResolveStaticValue(bar.SubDivisionCount, context), 0, 100);
        var majorOnly = bar.MajorTicksOnly is not null && ResolveStaticValue(bar.MajorTicksOnly, context);
        if (!majorOnly && subdivisions > 1)
        {
            var shortStart = ToCss(afterBar ? 0 : tickLength / 2d);
            var shortEnd = ToCss(afterBar ? tickLength / 2d : tickLength);
            for (var index = 0; index < tickCount - 1; index++)
            {
                for (var subdivision = 1; subdivision < subdivisions; subdivision++)
                {
                    var ratio = ratios[index] + (ratios[index + 1] - ratios[index]) * subdivision / subdivisions;
                    var percentage = ToCss(100d * (reverse ? 1d - ratio : ratio));
                    html.Append(vertical
                        ? $"<line data-hmi-minor-tick=\"true\" stroke-width=\"1\" x1=\"{shortStart}\" x2=\"{shortEnd}\" y1=\"{percentage}%\" y2=\"{percentage}%\"></line>"
                        : $"<line data-hmi-minor-tick=\"true\" stroke-width=\"1\" y1=\"{shortStart}\" y2=\"{shortEnd}\" x1=\"{percentage}%\" x2=\"{percentage}%\"></line>");
                }
            }
        }
        html.Append("</svg>");
        html.Append("</div>");

    }

    private static void AppendBarScaleFontStyle(
        StringBuilder style,
        HmiFont? font,
        HmiHtmlConvertContext context)
    {
        if (font is null)
            return;
        if (font.Name is not null)
            style.Append(" font-family: ").Append(ResolveStaticValue(font.Name, context)).Append(';');
        if (font.Size is not null)
            style.Append(" font-size: ").Append(ToCss(ResolveStaticValue(font.Size, context))).Append("px;");
        if (font.Bold is not null && ResolveStaticValue(font.Bold, context))
            style.Append(" font-weight: bold;");
        if (font.Italic is not null && ResolveStaticValue(font.Italic, context))
            style.Append(" font-style: italic;");
        if (font.Underline is not null && ResolveStaticValue(font.Underline, context))
            style.Append(" text-decoration: underline;");
    }

    private static string GetBarDirectionStyle(HmiFillDirection direction) => direction switch
    {
        HmiFillDirection.Up => "writing-mode: vertical-lr; direction: rtl;",
        HmiFillDirection.Down => "writing-mode: vertical-lr; direction: ltr;",
        HmiFillDirection.Left => "direction: rtl;",
        _ => "direction: ltr;"
    };

    private static void AppendSlider(StringBuilder html, HmiSlider slider, HmiHtmlConvertContext context)
    {
        var (minimum, maximum) = ResolveScaleRange(slider, context);
        var value = ResolveScaleValue(slider, minimum, maximum, context);
        var direction = slider.Orientation is null || slider.Orientation.StaticValue is < 0 or > 3
            ? HmiFillDirection.Right
            : (HmiFillDirection)ResolveStaticValue(slider.Orientation, context);
        HmiColor? thumbColor = slider.ThumbBackgroundColor is null
            ? null
            : ResolveStaticValue(slider.ThumbBackgroundColor, context);
        var sliderStyle = GetBarDirectionStyle(direction) +
            (thumbColor is null ? string.Empty : $"--hmi-slider-thumb-background: {ToCss(thumbColor.Value)};") +
            GetSliderTrackStyle(slider, direction, context);
        html.Append("<input");
        AppendCommonAttributes(html, slider, context, additionalStyle: sliderStyle);
        AppendAttribute(html, "data-hmi-slider", "true");
        AppendAttribute(html, "data-orientation", direction.ToString());
        if (slider.StepSize is not null)
            AppendAttribute(html, "data-small-change", ResolveStaticValue(slider.StepSize, context).ToString(CultureInfo.InvariantCulture));
        AppendAttribute(html, "type", "range");
        AppendAttribute(html, "min", ToCss(minimum));
        AppendAttribute(html, "max", ToCss(maximum));
        AppendAttribute(html, "value", ToCss(value));
        // This is an inert process-value preview, not an operator setpoint editor.
        // A native range step would quantize values that are not multiples of SmallChange.
        AppendAttribute(html, "step", "any");
        AppendAttribute(html, "disabled", "disabled");
        html.Append('>');
    }

    private static string GetSliderTrackStyle(
        HmiSlider slider,
        HmiFillDirection direction,
        HmiHtmlConvertContext context)
    {
        HmiColor? high = slider.TrackHighBackgroundColor is null
            ? null
            : ResolveStaticValue(slider.TrackHighBackgroundColor, context);
        HmiColor? low = slider.TrackLowBackgroundColor is null
            ? null
            : ResolveStaticValue(slider.TrackLowBackgroundColor, context);
        HmiColor? highStop = slider.HighStopColor is null
            ? null
            : ResolveStaticValue(slider.HighStopColor, context);
        HmiColor? lowStop = slider.LowStopColor is null
            ? null
            : ResolveStaticValue(slider.LowStopColor, context);
        if (high is null && low is null && highStop is null && lowStop is null)
            return string.Empty;

        high ??= low;
        low ??= high;
        var gradientDirection = direction switch
        {
            HmiFillDirection.Up => "to bottom",
            HmiFillDirection.Down => "to top",
            HmiFillDirection.Left => "to right",
            _ => "to left"
        };
        if (highStop is not null || lowStop is not null)
        {
            highStop ??= high ?? lowStop;
            lowStop ??= low ?? highStop;
            var highBackground = high is null ? "transparent" : ToCss(high.Value);
            var lowBackground = low is null ? "transparent" : ToCss(low.Value);
            return $"--hmi-slider-track-background: linear-gradient({gradientDirection}, " +
                $"{ToCss(highStop!.Value)} 0 4px, {highBackground} 4px, " +
                $"{lowBackground} calc(100% - 4px), {ToCss(lowStop!.Value)} calc(100% - 4px) 100%);";
        }
        return $"--hmi-slider-track-background: linear-gradient({gradientDirection}, {ToCss(high!.Value)}, {ToCss(low!.Value)});";
    }

    private static void AppendScale(StringBuilder html, HmiScale scale, HmiHtmlConvertContext context)
    {
        var (minimum, maximum) = ResolveScaleRange(scale, context);
        var tickDirection = scale.TickDirection is null ? HmiTickDirection.Down : ResolveStaticValue(scale.TickDirection, context);
        var vertical = tickDirection is HmiTickDirection.Left or HmiTickDirection.Right;
        html.Append("<div");
        AppendCommonAttributes(html, scale, context, additionalStyle: "display: flex; align-items: stretch; overflow: hidden;");
        AppendAttribute(html, "data-hmi-scale", "true");
        AppendAttribute(html, "data-tick-direction", tickDirection.ToString());
        html.Append('>');
        if (scale.ShowScale is null || ResolveStaticValue(scale.ShowScale, context))
            AppendScaleMarks(html, scale, minimum, maximum, vertical ? HmiFillDirection.Up : HmiFillDirection.Right,
                vertical, tickDirection is HmiTickDirection.Down or HmiTickDirection.Right, context, true);
        html.Append("</div>");
    }

    private static void AppendClock(StringBuilder html, HmiClock clock, HmiHtmlConvertContext context)
    {
        var showDate = clock.ShowDate is not null && ResolveStaticValue(clock.ShowDate, context);
        var showTime = clock.ShowTime is null || ResolveStaticValue(clock.ShowTime, context);
        var showHours = clock.ShowHours is null || ResolveStaticValue(clock.ShowHours, context);
        var showMinutes = clock.ShowMinutes is null || ResolveStaticValue(clock.ShowMinutes, context);
        var showSeconds = clock.ShowSeconds is not null && ResolveStaticValue(clock.ShowSeconds, context);
        var parts = new List<string>();
        if (showDate)
            parts.Add("2000-01-01");
        if (showTime)
        {
            var timeParts = new List<string>();
            if (showHours)
                timeParts.Add("12");
            if (showMinutes)
                timeParts.Add("34");
            if (showSeconds)
                timeParts.Add("56");
            if (timeParts.Count > 0)
                parts.Add(string.Join(":", timeParts));
        }

        html.Append("<time");
        AppendCommonAttributes(html, clock, context, additionalStyle: "display: flex; align-items: center; justify-content: center; overflow: hidden;");
        AppendAttribute(html, "datetime", "2000-01-01T12:34:56");
        AppendAttribute(html, "data-format", ResolveStaticValue(clock.Format, context));
        AppendAttribute(html, "data-time-zone", ResolveStaticValue(clock.TimeZone, context));
        AppendBooleanAttribute(html, "data-analog", clock.Analog is not null && ResolveStaticValue(clock.Analog, context));
        html.Append('>').Append(WebUtility.HtmlEncode(parts.Count == 0 ? "Clock" : string.Join(" ", parts))).Append("</time>");
    }

    private static void AppendArrowIndicator(
        StringBuilder html,
        HmiArrowIndicator arrowIndicator,
        HmiHtmlConvertContext context)
    {
        var (minimum, maximum) = ResolveScaleRange(arrowIndicator, context);
        var value = ResolveScaleValue(arrowIndicator, minimum, maximum, context);
        var ratio = (value - minimum) / (maximum - minimum);
        var vertical = arrowIndicator.Orientation is not null && ResolveStaticValue(arrowIndicator.Orientation, context) == 1;
        var position = ToCss(ratio * 100);
        var markerStyle = vertical
            ? $"position: absolute; left: 50%; bottom: {position}%; transform: translate(-50%, 50%);"
            : $"position: absolute; top: 50%; left: {position}%; transform: translate(-50%, -50%);";

        html.Append("<div");
        AppendCommonAttributes(html, arrowIndicator, context, additionalStyle: "overflow: hidden;");
        AppendAttribute(html, "data-min", ToCss(minimum));
        AppendAttribute(html, "data-max", ToCss(maximum));
        AppendAttribute(html, "data-value", ToCss(value));
        AppendAttribute(html, "data-orientation", vertical ? "vertical" : "horizontal");
        html.Append("><span style=\"").Append(markerStyle).Append("\">").Append(vertical ? "▲" : "▶").Append("</span></div>");
    }

    private static void AppendWebControl(StringBuilder html, HmiWebControl webControl, HmiHtmlConvertContext context)
    {
        var url = ResolveStaticValue(webControl.Url, context);
        if (string.IsNullOrWhiteSpace(url) && webControl.Url is HmiExpressionProperty<string> urlExpression)
            url = urlExpression.Expression;
        if (string.IsNullOrWhiteSpace(url))
            url = ResolveStaticValue(webControl.HomeUrl, context);
        var showAddressBar = webControl.ShowAddressBar is null || ResolveStaticValue(webControl.ShowAddressBar, context);

        html.Append("<div");
        AppendCommonAttributes(
            html,
            webControl,
            context,
            additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-url", url);
        AppendBooleanAttribute(html, "data-use-parameter-placeholders", webControl.UseParameterPlaceholders is not null && ResolveStaticValue(webControl.UseParameterPlaceholders, context));
        AppendAttribute(html, "data-navigate-back", ResolvePropertyPreview(webControl.NavigateBack, context));
        AppendAttribute(html, "data-navigate-forward", ResolvePropertyPreview(webControl.NavigateForward, context));
        AppendAttribute(html, "data-stop", ResolvePropertyPreview(webControl.Stop, context));
        AppendAttribute(html, "data-refresh", ResolvePropertyPreview(webControl.Refresh, context));
        html.Append('>');
        if (showAddressBar)
        {
            html.Append("<div style=\"flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border-bottom: 1px solid currentColor; padding: 2px 4px;\">");
            html.Append(WebUtility.HtmlEncode(url ?? string.Empty)).Append("</div>");
        }
        html.Append("<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Web browser</div></div>");
    }

    private static void AppendDataGridControl(StringBuilder html, HmiDataGridControl dataGridControl, HmiHtmlConvertContext context)
    {
        var showToolbar = dataGridControl.ShowToolbar is not null && ResolveStaticValue(dataGridControl.ShowToolbar, context);
        var showStatusBar = dataGridControl.ShowStatusBar is not null && ResolveStaticValue(dataGridControl.ShowStatusBar, context);
        var showExportCsv = dataGridControl.ShowExportCsv is not null && ResolveStaticValue(dataGridControl.ShowExportCsv, context);
        var showProperties = dataGridControl.ShowProperties is not null && ResolveStaticValue(dataGridControl.ShowProperties, context);
        var absoluteMode = dataGridControl.TimePeriodAbsoluteMode is not null && ResolveStaticValue(dataGridControl.TimePeriodAbsoluteMode, context);

        html.Append("<div");
        AppendCommonAttributes(
            html,
            dataGridControl,
            context,
            additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-show-toolbar", ResolvePropertyPreview(dataGridControl.ShowToolbar, context));
        AppendAttribute(html, "data-show-status-bar", ResolvePropertyPreview(dataGridControl.ShowStatusBar, context));
        AppendAttribute(html, "data-show-export-csv", ResolvePropertyPreview(dataGridControl.ShowExportCsv, context));
        AppendAttribute(html, "data-show-properties", ResolvePropertyPreview(dataGridControl.ShowProperties, context));
        AppendAttribute(html, "data-source-kind", ResolvePropertyPreview(dataGridControl.DataSourceKind, context));
        AppendAttribute(html, "data-source-kind-raw", dataGridControl.SourceDataSourceKind);
        AppendAttribute(html, "data-source-name", ResolvePropertyPreview(dataGridControl.DataSourceName, context));
        AppendAttribute(html, "data-table-or-view", ResolvePropertyPreview(dataGridControl.TableOrView, context));
        AppendAttribute(html, "data-time-sort", ResolvePropertyPreview(dataGridControl.TimeSortDirection, context));
        AppendAttribute(html, "data-time-sort-raw", dataGridControl.SourceTimeSortDirection);
        AppendAttribute(html, "data-historian-interpolated", ResolvePropertyPreview(dataGridControl.HistorianInterpolatedMode, context));
        AppendAttribute(html, "data-historian-interval", ResolvePropertyPreview(dataGridControl.HistorianInterpolationInterval, context));
        AppendAttribute(html, "data-time-period-absolute", ResolvePropertyPreview(dataGridControl.TimePeriodAbsoluteMode, context));
        AppendAttribute(html, "data-time-period-duration", ResolvePropertyPreview(dataGridControl.TimePeriodDuration, context));
        AppendAttribute(html, "data-time-period-start", ResolvePropertyPreview(dataGridControl.TimePeriodStart, context));
        AppendAttribute(html, "data-time-period-end", ResolvePropertyPreview(dataGridControl.TimePeriodEnd, context));
        html.Append('>');

        if (showToolbar)
        {
            html.Append("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px;\">Data grid");
            if (showExportCsv)
                html.Append(" · Export CSV");
            if (showProperties)
                html.Append(" · Properties");
            html.Append("</div>");
        }

        html.Append("<div style=\"flex: 0 0 auto; padding: 2px 4px;\">");
        if (absoluteMode)
        {
            html.Append("Time: ")
                .Append(WebUtility.HtmlEncode(ResolveStaticValue(dataGridControl.TimePeriodStart, context) ?? string.Empty))
                .Append(" – ")
                .Append(WebUtility.HtmlEncode(ResolveStaticValue(dataGridControl.TimePeriodEnd, context) ?? string.Empty));
        }
        else
        {
            html.Append("Duration: ")
                .Append(WebUtility.HtmlEncode(ResolveStaticValue(dataGridControl.TimePeriodDuration, context) ?? string.Empty));
        }
        html.Append("</div><div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">");
        var dataSourceKind = dataGridControl.DataSourceKind is null ? null : ResolveStaticValue(dataGridControl.DataSourceKind, context).ToString();
        var dataSourceName = ResolveStaticValue(dataGridControl.DataSourceName, context);
        var tableOrView = ResolveStaticValue(dataGridControl.TableOrView, context);
        if (!string.IsNullOrWhiteSpace(dataSourceKind) || !string.IsNullOrWhiteSpace(dataSourceName) || !string.IsNullOrWhiteSpace(tableOrView))
        {
            html.Append(WebUtility.HtmlEncode(dataSourceKind ?? "Data source"));
            if (!string.IsNullOrWhiteSpace(dataSourceName)) html.Append(": ").Append(WebUtility.HtmlEncode(dataSourceName));
            if (!string.IsNullOrWhiteSpace(tableOrView)) html.Append(" · ").Append(WebUtility.HtmlEncode(tableOrView));
        }
        else
        {
            html.Append("Data binding not decoded");
        }
        html.Append("</div>");

        if (showStatusBar)
            html.Append("<div style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;\">Status</div>");
        html.Append("</div>");
    }

    private static void AppendRecipeControl(StringBuilder html, HmiRecipeControl recipeControl, HmiHtmlConvertContext context)
    {
        var showHeader = recipeControl.ShowHeader is null || ResolveStaticValue(recipeControl.ShowHeader, context);
        var showFooter = recipeControl.ShowFooter is not null && ResolveStaticValue(recipeControl.ShowFooter, context);
        var defaultRecipeName = ResolveStaticValue(recipeControl.DefaultRecipeName, context) ?? string.Empty;

        html.Append("<div");
        AppendCommonAttributes(
            html,
            recipeControl,
            context,
            additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-view-kind", recipeControl.ViewKind.ToString());
        AppendAttribute(html, "data-default-recipe", ResolvePropertyPreview(recipeControl.DefaultRecipeName, context));
        AppendAttribute(html, "data-view-only", ResolvePropertyPreview(recipeControl.ViewOnly, context));
        AppendAttribute(html, "data-wrap-around", ResolvePropertyPreview(recipeControl.WrapAround, context));
        AppendAttribute(html, "data-lines-per-item", ResolvePropertyPreview(recipeControl.LinesPerItem, context));
        html.Append('>');

        if (recipeControl.ViewKind == HmiRecipeViewKind.Selector)
        {
            if (showHeader)
                html.Append("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px;\">Recipe selector</div>");
            html.Append("<div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">")
                .Append(WebUtility.HtmlEncode(defaultRecipeName))
                .Append("</div>");
        }
        else
        {
            var visibleColumns = recipeControl.ColumnDefinitions
                .Where(column => column.Visible is null || ResolveStaticValue(column.Visible, context))
                .ToArray();
            html.Append("<table style=\"width: 100%; border-collapse: collapse; table-layout: fixed;\">");
            if (showHeader)
            {
                html.Append("<thead><tr>");
                foreach (var column in visibleColumns)
                {
                    html.Append("<th style=\"border: 1px solid currentColor; overflow: hidden; text-overflow: ellipsis;\"");
                    AppendAttribute(html, "data-column-type", column.Type.ToString());
                    html.Append('>')
                        .Append(WebUtility.HtmlEncode(column.HeaderText?.GetDisplayText(context.CultureInfo) ?? column.Type.ToString()))
                        .Append("</th>");
                }
                html.Append("</tr></thead>");
            }
            html.Append("<tbody><tr><td");
            AppendAttribute(html, "colspan", Math.Max(visibleColumns.Length, 1).ToString(CultureInfo.InvariantCulture));
            html.Append(" style=\"text-align: center;\">Recipe data not loaded</td></tr></tbody></table>");
        }

        if (showFooter)
            html.Append("<div style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;\">Recipe control</div>");
        html.Append("</div>");
    }

    private static void AppendAuditTrailControl(StringBuilder html, HmiAuditTrailControl auditTrailControl, HmiHtmlConvertContext context)
    {
        var showHeader = auditTrailControl.ShowHeader is null || ResolveStaticValue(auditTrailControl.ShowHeader, context);
        var visibleFields = auditTrailControl.Fields
            .Where(field => field.Visible is null || ResolveStaticValue(field.Visible, context))
            .ToArray();

        html.Append("<div");
        AppendCommonAttributes(
            html,
            auditTrailControl,
            context,
            additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-view-kind", auditTrailControl.ViewKind.ToString());
        AppendAttribute(html, "data-lines-per-entry", ResolvePropertyPreview(auditTrailControl.LinesPerEntry, context));
        AppendAttribute(html, "data-word-wrap", ResolvePropertyPreview(auditTrailControl.WordWrap, context));
        AppendAttribute(html, "data-wrap-around", ResolvePropertyPreview(auditTrailControl.WrapAround, context));
        AppendAttribute(html, "data-receive-selection-from", auditTrailControl.ReceiveSelectionFrom);
        html.Append('>');

        if (auditTrailControl.ViewKind == HmiAuditTrailViewKind.Detail)
        {
            if (showHeader)
                html.Append("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px;\">Audit trail detail</div>");
            html.Append("<dl style=\"margin: 0; padding: 2px 4px; overflow: hidden;\">");
            foreach (var field in visibleFields)
            {
                html.Append("<dt");
                AppendAttribute(html, "data-field", field.Field.ToString());
                html.Append('>')
                    .Append(WebUtility.HtmlEncode(field.HeaderText?.GetDisplayText(context.CultureInfo) ?? field.Field.ToString()))
                    .Append("</dt><dd>—</dd>");
            }
            html.Append("</dl>");
        }
        else
        {
            html.Append("<table style=\"width: 100%; border-collapse: collapse; table-layout: fixed;\">");
            if (showHeader)
            {
                html.Append("<thead><tr>");
                foreach (var field in visibleFields)
                {
                    html.Append("<th style=\"border: 1px solid currentColor; overflow: hidden; text-overflow: ellipsis;\"");
                    AppendAttribute(html, "data-field", field.Field.ToString());
                    AppendAttribute(html, "data-time-format", field.TimeAndDateFormat);
                    html.Append('>')
                        .Append(WebUtility.HtmlEncode(field.HeaderText?.GetDisplayText(context.CultureInfo) ?? field.Field.ToString()))
                        .Append("</th>");
                }
                html.Append("</tr></thead>");
            }
            html.Append("<tbody><tr><td");
            AppendAttribute(html, "colspan", Math.Max(visibleFields.Length, 1).ToString(CultureInfo.InvariantCulture));
            html.Append(" style=\"text-align: center;\">Audit data not loaded</td></tr></tbody></table>");
        }

        html.Append("</div>");
    }

    private static void AppendAlarmControl(StringBuilder html, HmiAlarmControl alarmControl, HmiHtmlConvertContext context)
    {
        var showHeader = alarmControl.ShowHeader is null || ResolveStaticValue(alarmControl.ShowHeader, context);
        var showTitle = alarmControl.ShowTitle is not null && ResolveStaticValue(alarmControl.ShowTitle, context);
        var listMode = ResolveStaticValue(alarmControl.ListMode, context);
        var visibleColumns = alarmControl.ColumnDefinitions
            .Where(column => column.Visible is null || ResolveStaticValue(column.Visible, context))
            .ToArray();

        html.Append("<div");
        AppendCommonAttributes(
            html,
            alarmControl,
            context,
            additionalStyle: CreateAlarmControlStyle(alarmControl, context));
        AppendAttribute(html, "data-window-resizable", ResolvePropertyPreview(alarmControl.Resizable, context));
        AppendAttribute(html, "data-window-movable", ResolvePropertyPreview(alarmControl.Movable, context));
        AppendAttribute(html, "data-window-closeable", ResolvePropertyPreview(alarmControl.Closeable, context));
        AppendAttribute(html, "data-header-background-color", ResolvePropertyPreview(alarmControl.HeaderBackgroundColor, context));
        AppendAttribute(html, "data-header-foreground-color", ResolvePropertyPreview(alarmControl.HeaderForegroundColor, context));
        AppendAttribute(html, "data-header-border-color", ResolvePropertyPreview(alarmControl.HeaderBorderColor, context));
        AppendAttribute(html, "data-show-toolbar", ResolvePropertyPreview(alarmControl.ShowToolbar, context));
        AppendAttribute(html, "data-toolbar-background-color", ResolvePropertyPreview(alarmControl.ToolbarBackgroundColor, context));
        AppendAttribute(html, "data-toolbar-foreground-color", ResolvePropertyPreview(alarmControl.ToolbarForegroundColor, context));
        AppendAttribute(html, "data-view-kind", alarmControl.ViewKind.ToString());
        AppendAttribute(html, "data-list-mode", listMode.ToString());
        AppendAttribute(html, "data-number-of-rows", ResolvePropertyPreview(alarmControl.NumberOfRows, context));
        AppendAttribute(html, "data-lines-per-alarm", ResolvePropertyPreview(alarmControl.LinesPerAlarm, context));
        AppendAttribute(html, "data-word-wrap", ResolvePropertyPreview(alarmControl.WordWrap, context));
        AppendAttribute(html, "data-wrap-around", ResolvePropertyPreview(alarmControl.WrapAround, context));
        AppendAttribute(html, "data-show-waiting-message", ResolvePropertyPreview(alarmControl.ShowWaitingMessage, context));
        AppendAttribute(html, "data-show-out-of-scope-alarms", ResolvePropertyPreview(alarmControl.ShowOutOfScopeAlarms, context));
        AppendAttribute(html, "data-filtered-triggers", alarmControl.FilteredTriggers.Count == 0 ? null : string.Join(",", alarmControl.FilteredTriggers));
        AppendAttribute(html, "data-alarm-identifier", ResolvePropertyPreview(alarmControl.AlarmIdentifier, context));
        AppendAttribute(html, "data-grid-line-color", ResolvePropertyPreview(alarmControl.GridLineColor, context));
        AppendAttribute(html, "data-grid-line-width", ResolvePropertyPreview(alarmControl.GridLineWidth, context));
        AppendAttribute(html, "data-show-horizontal-grid-lines", ResolvePropertyPreview(alarmControl.ShowHorizontalGridLines, context));
        AppendAttribute(html, "data-show-vertical-grid-lines", ResolvePropertyPreview(alarmControl.ShowVerticalGridLines, context));
        AppendAttribute(html, "data-show-horizontal-scrollbar", ResolvePropertyPreview(alarmControl.ShowHorizontalScrollbar, context));
        AppendAttribute(html, "data-show-vertical-scrollbar", ResolvePropertyPreview(alarmControl.ShowVerticalScrollbar, context));
        AppendAttribute(html, "data-table-background-color", ResolvePropertyPreview(alarmControl.TableBackgroundColor, context));
        AppendAttribute(html, "data-table-foreground-color", ResolvePropertyPreview(alarmControl.TableForegroundColor, context));
        AppendAttribute(html, "data-use-alternating-row-colors", ResolvePropertyPreview(alarmControl.UseAlternatingRowColors, context));
        AppendAttribute(html, "data-alternating-row-background-color", ResolvePropertyPreview(alarmControl.AlternatingRowBackgroundColor, context));
        AppendAttribute(html, "data-alternating-row-foreground-color", ResolvePropertyPreview(alarmControl.AlternatingRowForegroundColor, context));
        AppendAttribute(html, "data-table-header-background-color", ResolvePropertyPreview(alarmControl.TableHeaderBackgroundColor, context));
        AppendAttribute(html, "data-table-header-foreground-color", ResolvePropertyPreview(alarmControl.TableHeaderForegroundColor, context));
        AppendAttribute(html, "data-table-header-horizontal-alignment", ResolvePropertyPreview(alarmControl.TableHeaderHorizontalAlignment, context));
        AppendAttribute(html, "data-table-header-border-color", ResolvePropertyPreview(alarmControl.TableHeaderBorderColor, context));
        AppendAttribute(html, "data-selection-background-color", ResolvePropertyPreview(alarmControl.SelectionBackgroundColor, context));
        AppendAttribute(html, "data-selection-foreground-color", ResolvePropertyPreview(alarmControl.SelectionForegroundColor, context));
        AppendAttribute(html, "data-selection-rectangle-mode", ResolvePropertyPreview(alarmControl.SelectionRectangleMode, context));
        AppendAttribute(html, "data-use-automatic-selection-rectangle-color", ResolvePropertyPreview(alarmControl.UseAutomaticSelectionRectangleColor, context));
        AppendAttribute(html, "data-selection-rectangle-color", ResolvePropertyPreview(alarmControl.SelectionRectangleColor, context));
        AppendAttribute(html, "data-selection-rectangle-width", ResolvePropertyPreview(alarmControl.SelectionRectangleWidth, context));
        AppendAttribute(html, "data-show-status-bar", ResolvePropertyPreview(alarmControl.ShowStatusBar, context));
        AppendAttribute(html, "data-status-bar-background-color", ResolvePropertyPreview(alarmControl.StatusBarBackgroundColor, context));
        AppendAttribute(html, "data-status-bar-foreground-color", ResolvePropertyPreview(alarmControl.StatusBarForegroundColor, context));
        html.Append('>');

        if (showTitle)
        {
            var title = ResolveAlarmTitle(alarmControl, listMode, context);
            html.Append("<div style=\"").Append(CreateAlarmHeaderStyle(alarmControl, context));
            if (alarmControl.Movable is not null && ResolveStaticValue(alarmControl.Movable, context))
                html.Append("cursor: move;");
            html.Append("\"><span style=\"flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\">")
                .Append(WebUtility.HtmlEncode(title))
                .Append("</span>");
            if (alarmControl.Closeable is not null && ResolveStaticValue(alarmControl.Closeable, context))
                html.Append("<button type=\"button\" aria-label=\"Close\" disabled style=\"flex: 0 0 auto;\">×</button>");
            html.Append("</div>");
        }

        html.Append("<table class=\"hmi-alarm-table");
        if (alarmControl.UseAlternatingRowColors is not null && ResolveStaticValue(alarmControl.UseAlternatingRowColors, context))
            html.Append(" hmi-alarm-table--alternating");
        html.Append("\" style=\"").Append(CreateAlarmTableStyle(alarmControl, context)).Append("\">");
        var gridCellStyle = CreateAlarmGridCellStyle(alarmControl, context);
        if (showHeader)
        {
            var headerCellStyle = CreateAlarmTableHeaderCellStyle(alarmControl, context, gridCellStyle);
            html.Append("<thead><tr>");
            if (visibleColumns.Length == 0)
                html.Append("<th style=\"").Append(headerCellStyle).Append("\">")
                    .Append(WebUtility.HtmlEncode(ResolveAlarmViewLabel(alarmControl.ViewKind)))
                    .Append("</th>");
            foreach (var column in visibleColumns)
            {
                html.Append("<th style=\"").Append(headerCellStyle).Append("overflow: hidden; text-overflow: ellipsis;\"");
                AppendAttribute(html, "data-column-type", column.Type.ToString());
                AppendAttribute(html, "data-time-format", column.TimeAndDateFormat);
                AppendAttribute(html, "data-symbol", column.Symbol);
                html.Append('>')
                    .Append(WebUtility.HtmlEncode(column.HeaderText?.GetDisplayText(context.CultureInfo) ?? column.Type.ToString()))
                    .Append("</th>");
            }
            html.Append("</tr></thead>");
        }
        html.Append("<tbody><tr><td");
        AppendAttribute(html, "colspan", Math.Max(visibleColumns.Length, 1).ToString(CultureInfo.InvariantCulture));
        html.Append(" style=\"text-align: center;").Append(gridCellStyle);
        AppendColorStyle(html, "background-color", alarmControl.SelectionBackgroundColor);
        AppendColorStyle(html, "color", alarmControl.SelectionForegroundColor);
        AppendAlarmSelectionRectangleStyle(html, alarmControl, context);
        html.Append("\">Alarm data not loaded</td></tr></tbody></table>");

        var showAcknowledgeButton = alarmControl.ShowAcknowledgeButton is not null && ResolveStaticValue(alarmControl.ShowAcknowledgeButton, context);
        var showHelpButton = alarmControl.ShowHelpButton is not null && ResolveStaticValue(alarmControl.ShowHelpButton, context);
        var showToolbar = alarmControl.ShowToolbar is not null && ResolveStaticValue(alarmControl.ShowToolbar, context);
        if (showToolbar || showAcknowledgeButton || showHelpButton)
        {
            var toolbarStyle = new StringBuilder("flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;");
            AppendColorStyle(toolbarStyle, "background-color", alarmControl.ToolbarBackgroundColor);
            AppendColorStyle(toolbarStyle, "color", alarmControl.ToolbarForegroundColor);
            html.Append("<div class=\"hmi-alarm-toolbar\" role=\"toolbar\" style=\"").Append(toolbarStyle).Append("\">");
            if (showAcknowledgeButton)
                html.Append("Acknowledge");
            if (showAcknowledgeButton && showHelpButton)
                html.Append(" · ");
            if (showHelpButton)
                html.Append("Help");
            if (!showAcknowledgeButton && !showHelpButton)
                html.Append("Toolbar");
            html.Append("</div>");
        }
        if (alarmControl.ShowStatusBar is not null && ResolveStaticValue(alarmControl.ShowStatusBar, context))
        {
            var statusStyle = new StringBuilder("flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;");
            AppendColorStyle(statusStyle, "background-color", alarmControl.StatusBarBackgroundColor);
            AppendColorStyle(statusStyle, "color", alarmControl.StatusBarForegroundColor);
            AppendFontStyle(statusStyle, alarmControl.StatusBarFont);
            html.Append("<div class=\"hmi-alarm-status-bar\" role=\"status\" style=\"")
                .Append(statusStyle).Append("\">Status</div>");
        }
        html.Append("</div>");
    }

    private static void AppendRadarChartControl(StringBuilder html, HmiRadarChartControl radarChartControl, HmiHtmlConvertContext context)
    {
        var title = radarChartControl.Title?.GetDisplayText(context.CultureInfo);
        int? seriesCount = radarChartControl.SeriesCount is null ? null : ResolveStaticValue(radarChartControl.SeriesCount, context);
        int? categoryCount = radarChartControl.CategoryCount is null ? null : ResolveStaticValue(radarChartControl.CategoryCount, context);

        html.Append("<div");
        AppendCommonAttributes(
            html,
            radarChartControl,
            context,
            additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-series-count", ResolvePropertyPreview(radarChartControl.SeriesCount, context));
        AppendAttribute(html, "data-category-count", ResolvePropertyPreview(radarChartControl.CategoryCount, context));
        AppendAttribute(html, "data-radar-shape", ResolvePropertyPreview(radarChartControl.RadarShape, context));
        AppendAttribute(html, "data-radar-shape-raw", radarChartControl.SourceRadarShape);
        AppendAttribute(html, "data-chart-background", ResolvePropertyPreview(radarChartControl.ChartBackgroundColor, context));
        AppendAttribute(html, "data-grid-line-style", ResolvePropertyPreview(radarChartControl.GridLineStyle, context));
        AppendAttribute(html, "data-grid-line-style-raw", radarChartControl.SourceGridLineStyle);
        AppendAttribute(html, "data-grid-line-color", ResolvePropertyPreview(radarChartControl.GridLineColor, context));
        AppendAttribute(html, "data-banded-color", ResolvePropertyPreview(radarChartControl.BandedColor, context));
        AppendAttribute(html, "data-show-legend", ResolvePropertyPreview(radarChartControl.ShowLegend, context));
        AppendAttribute(html, "data-legend-position", ResolvePropertyPreview(radarChartControl.LegendPosition, context));
        AppendAttribute(html, "data-legend-position-raw", radarChartControl.SourceLegendPosition);
        AppendAttribute(html, "data-decimal-places", ResolvePropertyPreview(radarChartControl.DecimalPlaces, context));
        AppendAttribute(html, "data-refresh-rate-seconds", ResolvePropertyPreview(radarChartControl.RefreshRateSeconds, context));
        html.Append("><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor; font-weight: bold;\">")
            .Append(WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(title) ? "Radar chart" : title))
            .Append("</div><div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Radar data not loaded");
        if (seriesCount is not null || categoryCount is not null)
        {
            html.Append(" (");
            if (seriesCount is not null)
                html.Append("Series: ").Append(seriesCount.Value.ToString(CultureInfo.InvariantCulture));
            if (seriesCount is not null && categoryCount is not null)
                html.Append(" · ");
            if (categoryCount is not null)
                html.Append("Categories: ").Append(categoryCount.Value.ToString(CultureInfo.InvariantCulture));
            html.Append(')');
        }
        html.Append("</div></div>");
    }

    private static void AppendSystemDiagnosisControl(StringBuilder html, HmiSystemDiagnosisControl systemDiagnosisControl, HmiHtmlConvertContext context)
    {
        var title = systemDiagnosisControl.ViewKind switch
        {
            HmiSystemDiagnosisViewKind.DiagnosticsList => "Diagnostics list",
            HmiSystemDiagnosisViewKind.DiagnosticsViewer => "Diagnostics viewer",
            HmiSystemDiagnosisViewKind.AutomaticEventSummary => "Automatic diagnostic event summary",
            _ => "System diagnostics"
        };

        html.Append("<div");
        AppendCommonAttributes(
            html,
            systemDiagnosisControl,
            context,
            additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-view-kind", systemDiagnosisControl.ViewKind.ToString());
        html.Append("><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor; font-weight: bold;\">")
            .Append(WebUtility.HtmlEncode(title))
            .Append("</div><div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Diagnostic data not loaded</div></div>");
    }

    private static void AppendAlarmLineControl(StringBuilder html, HmiAlarmLineControl alarmLineControl, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, alarmLineControl, context, additionalStyle: "display: flex; align-items: center; overflow: hidden;");
        AppendAttribute(html, "data-view-kind", alarmLineControl.ViewKind.ToString());
        AppendAttribute(html, "data-number-of-rows", ResolvePropertyPreview(alarmLineControl.NumberOfRows, context));
        AppendAttribute(html, "data-word-wrap", ResolvePropertyPreview(alarmLineControl.WordWrap, context));
        AppendAttribute(html, "data-queue-new-alarms", ResolvePropertyPreview(alarmLineControl.QueueNewAlarms, context));
        AppendAttribute(html, "data-show-trigger-value", ResolvePropertyPreview(alarmLineControl.ShowTriggerValue, context));
        AppendAttribute(html, "data-show-trigger-label", ResolvePropertyPreview(alarmLineControl.ShowTriggerLabel, context));
        AppendAttribute(html, "data-show-inactive-alarms", ResolvePropertyPreview(alarmLineControl.ShowInactiveAlarms, context));
        AppendAttribute(html, "data-show-alarm-state", ResolvePropertyPreview(alarmLineControl.ShowAlarmState, context));
        AppendAttribute(html, "data-show-alarm-time", ResolvePropertyPreview(alarmLineControl.ShowAlarmTime, context));
        AppendAttribute(html, "data-time-format", alarmLineControl.AlarmTimeFormat);
        AppendAttribute(html, "data-filtered-triggers", alarmLineControl.FilteredTriggers.Count == 0 ? null : string.Join(",", alarmLineControl.FilteredTriggers));
        html.Append(">Alarm data not loaded</div>");
    }

    private static string ResolveAlarmTitle(HmiAlarmControl alarmControl, HmiAlarmListMode listMode, HmiHtmlConvertContext context)
    {
        var title = alarmControl.Title?.GetDisplayText(context.CultureInfo);
        if (!string.IsNullOrWhiteSpace(title))
            return title!;
        var modeTitle = listMode switch
        {
            HmiAlarmListMode.Active => alarmControl.ActiveAlarmsTitle,
            HmiAlarmListMode.Past => alarmControl.PastAlarmsTitle,
            _ => alarmControl.AllAlarmsTitle
        };
        title = modeTitle?.GetDisplayText(context.CultureInfo);
        return string.IsNullOrWhiteSpace(title) ? $"{listMode} alarms" : title!;
    }

    private static string ResolveAlarmViewLabel(HmiAlarmViewKind viewKind) => viewKind switch
    {
        HmiAlarmViewKind.InformationMessageDisplay => "Information message",
        HmiAlarmViewKind.AlarmList => "Alarm",
        HmiAlarmViewKind.AlarmStatusList => "Alarm status",
        HmiAlarmViewKind.AlarmAndEventSummary => "Alarm and event summary",
        HmiAlarmViewKind.AlarmStatusExplorer => "Alarm status explorer",
        HmiAlarmViewKind.AlarmAndEventLogViewer => "Alarm and event log",
        _ => "Alarm"
    };

    private static string? ResolvePropertyPreview<T>(HmiProperty<T>? property, HmiHtmlConvertContext context)
    {
        if (property is null)
            return null;
        if (property is HmiExpressionProperty<T> expression && !string.IsNullOrWhiteSpace(expression.Expression))
            return expression.Expression;
        return FormatAttributeValue(ResolveStaticValue(property, context));
    }

    private static (double Minimum, double Maximum) ResolveScaleRange(HmiScaleWidgetBase scale, HmiHtmlConvertContext context)
    {
        var begin = ResolveStaticValue(scale.BeginValue, context);
        var end = ResolveStaticValue(scale.EndValue, context);
        if (begin == end)
            end = begin + 1;
        return begin < end ? (begin, end) : (end, begin);
    }

    private static double ResolveScaleValue(
        HmiScaleWidgetBase scale,
        double minimum,
        double maximum,
        HmiHtmlConvertContext context)
    {
        var value = scale.ShowFillLevel is not null && ResolveStaticValue(scale.ShowFillLevel, context)
            ? ResolveStaticValue(scale.FillLevel, context)
            : ResolveStaticValue(scale.Value, context);
        return Math.Min(Math.Max(value, minimum), maximum);
    }

    private static async ValueTask AppendSymbolicInputAsync(
        StringBuilder html,
        HmiSymbolicIOField symbolicIoField,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        CancellationToken cancellationToken)
    {
        var selectedValue = ResolveStaticValue(symbolicIoField.Value, context);
        var selectedState = symbolicIoField.States.FirstOrDefault(candidate => candidate.Value == selectedValue)
            ?? symbolicIoField.States.FirstOrDefault();
        if (selectedState?.Image is not null)
        {
            var imageUri = await ResolveImageUriAsync(selectedState.Image, project, cancellationToken).ConfigureAwait(false);
            var alternateImageUri = selectedState.AlternateImage is null
                ? null
                : await ResolveImageUriAsync(selectedState.AlternateImage, project, cancellationToken).ConfigureAwait(false);
            var blinkAlternateImage = selectedState.ImageBlink && !string.IsNullOrWhiteSpace(alternateImageUri);
            var imageLayoutStyle = selectedState.ImageScaled == false
                ? "width: auto; height: auto; max-width: 100%; max-height: 100%; display: block;"
                : "width: 100%; height: 100%; object-fit: contain; display: block;";
            var imageStyle = imageLayoutStyle;
            if (blinkAlternateImage)
                imageStyle = AppendCssDeclaration(imageStyle, $"animation: hmi-symbolic-base-flash {GetBlinkDuration(selectedState.ImageBlinkRate)}s steps(1, end) infinite;");
            var stateStyle = CreateStateStyle(selectedState);
            if (selectedState.ImageBackgroundTransparent != true && selectedState.ImageBackgroundColor is HmiColor imageBackgroundColor)
                stateStyle = AppendCssDeclaration(stateStyle, $"background-color: {ToCss(imageBackgroundColor)};");
            stateStyle = AppendCssDeclaration(stateStyle, "overflow: hidden;");

            html.Append("<div");
            AppendCommonAttributes(html, symbolicIoField, context, additionalStyle: stateStyle);
            AppendAttribute(html, "class", "hmi-symbolic-image-state");
            AppendAttribute(html, "role", "status");
            AppendAttribute(html, "data-state-value", selectedState.Value is double stateValue ? ToCss(stateValue) : null);
            AppendAttribute(html, "data-image-name", selectedState.ImageName ?? selectedState.Image.ImageName);
            AppendAttribute(html, "data-image-blink", selectedState.ImageBlink ? "true" : "false");
            AppendAttribute(html, "data-alternate-image-name", selectedState.AlternateImageName ?? selectedState.AlternateImage?.ImageName);
            AppendAttribute(html, "data-image-blink-rate", selectedState.ImageBlinkRate?.ToString());
            html.Append('>');
            if (!string.IsNullOrWhiteSpace(imageUri))
            {
                html.Append("<img");
                AppendAttribute(html, "src", imageUri);
                AppendAttribute(html, "alt", selectedState.Name ?? selectedState.ImageName ?? selectedState.Image.ImageName ?? symbolicIoField.Name);
                AppendAttribute(html, "class", "hmi-symbolic-image-base");
                AppendAttribute(html, "style", imageStyle);
                html.Append('>');
            }
            if (blinkAlternateImage)
            {
                var alternateStyle = AppendCssDeclaration(imageLayoutStyle, "position: absolute; inset: 0;");
                alternateStyle = AppendCssDeclaration(alternateStyle, $"animation: hmi-symbolic-alternate-flash {GetBlinkDuration(selectedState.ImageBlinkRate)}s steps(1, end) infinite;");
                html.Append("<img");
                AppendAttribute(html, "src", alternateImageUri);
                AppendAttribute(html, "alt", selectedState.Name ?? selectedState.AlternateImageName ?? selectedState.AlternateImage?.ImageName ?? symbolicIoField.Name);
                AppendAttribute(html, "class", "hmi-symbolic-image-alternate");
                AppendAttribute(html, "style", alternateStyle);
                html.Append('>');
            }
            if (selectedState.Text is not null)
            {
                html.Append("<span>");
                AppendMultilingualText(html, selectedState.Text, context);
                html.Append("</span>");
            }
            html.Append("</div>");
            return;
        }

        html.Append("<select");
        AppendCommonAttributes(html, symbolicIoField, context, additionalStyle: CreateStateStyle(selectedState));
        html.Append('>');
        foreach (var state in symbolicIoField.States)
        {
            html.Append("<option");
            if (state.Value is double value)
                AppendAttribute(html, "value", ToCss(value));
            AppendAttribute(html, "style", CreateStateStyle(state));
            if (ReferenceEquals(state, selectedState))
                AppendAttribute(html, "selected", "selected");
            html.Append('>');
            AppendMultilingualText(html, state.Text, context);
            html.Append("</option>");
        }
        html.Append("</select>");
    }

    private static string GetBlinkDuration(HmiBlinkRate? rate) => rate switch
    {
        HmiBlinkRate.Slow => "2",
        HmiBlinkRate.Fast => "0.5",
        _ => "1"
    };

    private static async ValueTask AppendToggleSwitchAsync(
        StringBuilder html,
        HmiToggleSwitch toggleSwitch,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        CancellationToken cancellationToken)
    {
        var stateValue = ResolveStaticValue(toggleSwitch.State, context);
        var offState = toggleSwitch.States.FirstOrDefault();
        var onState = toggleSwitch.States.Skip(1).FirstOrDefault() ?? offState;
        var selectedState = toggleSwitch.States.FirstOrDefault(candidate => candidate.Value == stateValue) ?? offState;
        var text = ResolveStaticValue(toggleSwitch.Text, context) ?? offState?.Text;
        var alternateText = ResolveStaticValue(toggleSwitch.AlternateText, context) ?? onState?.Text;
        var image = ResolveStaticValue(toggleSwitch.Image, context) ?? offState?.Image;
        var alternateImage = ResolveStaticValue(toggleSwitch.AlternateImage, context) ?? onState?.Image;

        html.Append("<hmi-toggle-switch");
        AppendCommonAttributes(html, toggleSwitch, context, additionalStyle: CreateStateStyle(selectedState));
        AppendStaticAttribute(html, "mode", context.EffectiveProperties.Resolve(toggleSwitch, nameof(HmiToggleSwitch.Mode), toggleSwitch.Mode));
        AppendAttribute(html, "text", text?.GetDisplayText(context.CultureInfo));
        AppendAttribute(html, "alternate-text", alternateText?.GetDisplayText(context.CultureInfo));
        AppendAttribute(html, "image", await ResolveImageUriAsync(image, project, cancellationToken).ConfigureAwait(false));
        AppendAttribute(html, "alternate-image", await ResolveImageUriAsync(alternateImage, project, cancellationToken).ConfigureAwait(false));
        AppendBooleanAttribute(html, "checked", onState is not null && !ReferenceEquals(onState, offState) && ReferenceEquals(selectedState, onState));
        AppendStaticAttribute(html, "header", toggleSwitch.Header);
        AppendTextAttribute(html, "header-text", toggleSwitch.HeaderText, context);
        html.Append("></hmi-toggle-switch>");
    }

    private static async ValueTask AppendSelectionGroupAsync(
        StringBuilder html,
        string elementName,
        HmiSelectionGroupBase selectionGroup,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        CancellationToken cancellationToken)
    {
        html.Append('<').Append(elementName);
        AppendCommonAttributes(html, selectionGroup, context);
        AppendStaticAttribute(html, "selected-index", selectionGroup.SelectedIndex);
        AppendStaticAttribute(html, "selection-item-height", selectionGroup.SelectionItemHeight);
        AppendStaticAttribute(html, "selection-background-color", selectionGroup.SelectionBackgroundColor);
        AppendStaticAttribute(html, "selection-foreground-color", selectionGroup.SelectionForegroundColor);
        AppendStaticAttribute(html, "selection-border-color", selectionGroup.SelectionBorderColor);
        AppendStaticAttribute(html, "selection-border-width", selectionGroup.SelectionBorderWidth);
        html.Append('>');

        foreach (var item in selectionGroup.Items)
            await AppendSelectionGroupItemAsync(html, item, project, cancellationToken).ConfigureAwait(false);

        html.Append("</").Append(elementName).Append('>');
    }

    private static void AppendListBox(StringBuilder html, HmiListBox listBox, HmiHtmlConvertContext context)
    {
        AppendSelectionList(html, listBox, context);
    }

    private static void AppendComboBox(StringBuilder html, HmiComboBox comboBox, HmiHtmlConvertContext context)
    {
        AppendSelectionList(html, comboBox, context);
    }

    private static void AppendSelectionList(StringBuilder html, HmiSelectionGroupBase selectionGroup, HmiHtmlConvertContext context)
    {
        var selectedValue = selectionGroup.Indicator is not null
            ? ResolveStaticValue(selectionGroup.Indicator, context)
            : ResolveStaticValue(selectionGroup.Value, context);
        var selectedIndex = selectionGroup.SelectedIndex is null
            ? -1
            : ResolveStaticValue(selectionGroup.SelectedIndex, context);
        var selectedState = selectionGroup.States.FirstOrDefault(candidate => candidate.Value == selectedValue)
            ?? (selectedIndex >= 0 && selectedIndex < selectionGroup.States.Count ? selectionGroup.States[selectedIndex] : null)
            ?? selectionGroup.States.FirstOrDefault();

        html.Append("<select");
        AppendCommonAttributes(html, selectionGroup, context, additionalStyle: CreateStateStyle(selectedState));
        html.Append('>');
        foreach (var state in selectionGroup.States)
        {
            html.Append("<option");
            if (state.Value is double value)
                AppendAttribute(html, "value", ToCss(value));
            AppendAttribute(html, "style", CreateStateStyle(state));
            AppendAttribute(html, "data-image-name", state.ImageName ?? state.Image?.ImageName);
            if (ReferenceEquals(state, selectedState))
                AppendAttribute(html, "selected", "selected");
            html.Append('>');
            AppendMultilingualText(html, state.Text, context);
            html.Append("</option>");
        }
        html.Append("</select>");
    }

    private static async ValueTask AppendSelectionGroupItemAsync(
        StringBuilder html,
        HmiSelectionGroupItem item,
        IHmiProject? project,
        CancellationToken cancellationToken)
    {
        html.Append("<span slot=\"item\"");
        AppendAttribute(html, "text", item.Text);
        AppendAttribute(html, "image", await ResolveImageUriAsync(item.Image, project, cancellationToken).ConfigureAwait(false));
        AppendAttribute(html, "image-name", item.ImageName ?? item.Image?.ImageName);
        html.Append("></span>");
    }

    private static void AppendTextBlock(StringBuilder html, HmiScreenItemBase item, HmiProperty<HmiMultilingualText>? text, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, item, context, additionalStyle: "overflow: hidden;");
        html.Append(">");
        AppendMultilingualText(html, ResolveStaticValue(text, context), context);
        html.Append("</div>");
    }

    private static void AppendRectangle(StringBuilder html, HmiRectangle rectangle, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendAttribute(html, "id", rectangle.Name);
        AppendTextAttribute(html, "title", rectangle.ToolTipText, context);
        AppendStaticAttribute(html, "tabindex", rectangle.TabIndex, context);
        AppendAttribute(html, "data-hmi-security-code", rectangle.SecurityCode);
        AppendDisabledAttribute(html, rectangle, context);
        html.Append(" style=\"position: absolute;");
        AppendPosition(html, rectangle, context);
        AppendDisabledStyle(html, rectangle, context);
        AppendOpacity(html, rectangle, context);
        AppendDesignShadow(html, rectangle, context);
        AppendStyle(html, rectangle, context);
        AppendFillAnimationStyle(html, rectangle, context);
        AppendRectangleRadius(html, rectangle, context);
        if (rectangle.BorderColor == null && rectangle.BorderWidth == null && rectangle.LineColor == null && rectangle.LineWidth == null)
            html.Append("border: 1px solid #000000;");
        AppendItemTransform(html, rectangle);
        html.Append("\"");
        html.Append(">");
        html.Append("</div>");
    }

    private static void AppendFillPatternStyle(StringBuilder html, HmiPaintedScreenItemBase item, HmiHtmlConvertContext context)
    {
        var pattern = GetFillPattern(item, context);
        if (pattern is null)
            return;
        AppendFillPatternStyle(html, pattern.Value, GetPatternColor(item, context));
    }

    private static void AppendFillPatternStyle(StringBuilder html, HmiFillPattern pattern, HmiColor patternColor)
    {
        if (pattern == HmiFillPattern.Solid)
            return;
        if (pattern == HmiFillPattern.Transparent)
        {
            html.Append("background-color: transparent;");
            return;
        }

        var color = ToCss(patternColor);
        var image = pattern switch
        {
            HmiFillPattern.Checkers => $"conic-gradient({color} 25%, transparent 0 50%, {color} 0 75%, transparent 0)",
            HmiFillPattern.CheckersFiner => $"conic-gradient({color} 25%, transparent 0 50%, {color} 0 75%, transparent 0)",
            HmiFillPattern.Horizontal => $"repeating-linear-gradient(to bottom, {color} 0 1px, transparent 1px 6px)",
            HmiFillPattern.WideHorizontal => $"repeating-linear-gradient(to bottom, {color} 0 2px, transparent 2px 6px)",
            HmiFillPattern.Vertical => $"repeating-linear-gradient(to right, {color} 0 1px, transparent 1px 6px)",
            HmiFillPattern.WideVertical => $"repeating-linear-gradient(to right, {color} 0 2px, transparent 2px 6px)",
            HmiFillPattern.DiagonalLeftToRight or HmiFillPattern.Diagonal => $"repeating-linear-gradient(135deg, {color} 0 1px, transparent 1px 6px)",
            HmiFillPattern.WideDiagonalLeftToRight => $"repeating-linear-gradient(135deg, {color} 0 2px, transparent 2px 6px)",
            HmiFillPattern.DiagonalRightToLeft => $"repeating-linear-gradient(45deg, {color} 0 1px, transparent 1px 6px)",
            HmiFillPattern.WideDiagonalRightToLeft => $"repeating-linear-gradient(45deg, {color} 0 2px, transparent 2px 6px)",
            HmiFillPattern.DiagonalCross or HmiFillPattern.DiagonalCrossFiner or HmiFillPattern.DiagonalCrossBold =>
                $"repeating-linear-gradient(45deg, {color} 0 1px, transparent 1px 6px), repeating-linear-gradient(135deg, {color} 0 1px, transparent 1px 6px)",
            HmiFillPattern.Bricks or HmiFillPattern.BricksDiagonal =>
                $"linear-gradient({color} 1px, transparent 1px), linear-gradient(90deg, {color} 1px, transparent 1px)",
            HmiFillPattern.HorizontalDifferentLines => $"repeating-linear-gradient(to bottom, {color} 0 1px, transparent 1px 4px, {color} 4px 6px, transparent 6px 10px)",
            HmiFillPattern.SmallBoxes or HmiFillPattern.MediumBoxes or HmiFillPattern.LargeBoxes =>
                $"linear-gradient({color} 1px, transparent 1px), linear-gradient(90deg, {color} 1px, transparent 1px)",
            HmiFillPattern.Ovals => $"radial-gradient(ellipse at center, transparent 0 35%, {color} 36% 45%, transparent 46%)",
            HmiFillPattern.Diamonds => $"linear-gradient(45deg, transparent 42%, {color} 43% 57%, transparent 58%), linear-gradient(-45deg, transparent 42%, {color} 43% 57%, transparent 58%)",
            HmiFillPattern.Scales => $"radial-gradient(ellipse at 50% 0%, transparent 0 45%, {color} 46% 52%, transparent 53%)",
            HmiFillPattern.Waves => $"radial-gradient(ellipse at 50% 100%, transparent 0 42%, {color} 43% 50%, transparent 51%)",
            _ => $"radial-gradient(circle, {color} 0 1px, transparent 1px)"
        };
        html.Append("background-image: ").Append(image).Append(';');
        var size = pattern switch
        {
            HmiFillPattern.CheckersFiner or HmiFillPattern.DiagonalCrossFiner or HmiFillPattern.SmallBoxes => "4px 4px",
            HmiFillPattern.LargeBoxes or HmiFillPattern.Ovals or HmiFillPattern.Scales or HmiFillPattern.Waves => "12px 12px",
            _ => "8px 8px"
        };
        html.Append("background-size: ").Append(size).Append(';');
    }

    private readonly struct ColorGradient
    {
        public ColorGradient(HmiGradientDirection direction, IReadOnlyList<(HmiColor Color, double Offset)> stops)
        {
            Direction = direction;
            Stops = stops;
        }

        public HmiGradientDirection Direction { get; }

        public IReadOnlyList<(HmiColor Color, double Offset)> Stops { get; }
    }

    private static ColorGradient? GetColorGradient(HmiPaintedScreenItemBase item)
    {
        return item switch
        {
            HmiShapeBase shape => CreateColorGradient(
                shape.BackgroundColor, shape.FirstGradientColor, shape.FirstGradientOffset,
                shape.MiddleGradientColor, shape.SecondGradientColor, shape.SecondGradientOffset,
                shape.UseFirstGradient, shape.UseSecondGradient, shape.GradientDirection),
            HmiWidgetBase widget => CreateColorGradient(
                widget.BackgroundColor, widget.FirstGradientColor, widget.FirstGradientOffset,
                widget.MiddleGradientColor, widget.SecondGradientColor, widget.SecondGradientOffset,
                widget.UseFirstGradient, widget.UseSecondGradient, widget.GradientDirection),
            HmiWindowBase window => CreateColorGradient(
                window.BackgroundColor, window.FirstGradientColor, window.FirstGradientOffset,
                window.MiddleGradientColor, window.SecondGradientColor, window.SecondGradientOffset,
                window.UseFirstGradient, window.UseSecondGradient, window.GradientDirection),
            _ => null
        };
    }

    private static ColorGradient? GetColorGradient(HmiScreenBase screen) => CreateColorGradient(
        screen.BackgroundColor, screen.FirstGradientColor, screen.FirstGradientOffset,
        screen.MiddleGradientColor, screen.SecondGradientColor, screen.SecondGradientOffset,
        screen.UseFirstGradient, screen.UseSecondGradient, screen.GradientDirection);

    private static ColorGradient? CreateColorGradient(
        HmiProperty<HmiColor>? backgroundColor,
        HmiProperty<HmiColor>? firstColor,
        HmiProperty<double>? firstOffset,
        HmiProperty<HmiColor>? middleColor,
        HmiProperty<HmiColor>? secondColor,
        HmiProperty<double>? secondOffset,
        HmiProperty<bool>? useFirst,
        HmiProperty<bool>? useSecond,
        HmiProperty<HmiGradientDirection>? direction)
    {
        var firstEnabled = useFirst.GetStaticValueOrDefault() && firstColor is not null;
        var secondEnabled = useSecond.GetStaticValueOrDefault() && secondColor is not null;
        if (!firstEnabled && !secondEnabled)
            return null;

        var middle = middleColor?.StaticValue
            ?? backgroundColor?.StaticValue
            ?? firstColor?.StaticValue
            ?? secondColor?.StaticValue;
        if (middle is null)
            return null;

        var firstStop = Clamp(firstOffset.GetStaticValueOrDefault(50d), 0d, 100d);
        var secondStop = Clamp(secondOffset.GetStaticValueOrDefault(50d), 0d, 100d);
        var stops = new List<(HmiColor Color, double Offset)>();
        if (firstEnabled)
            stops.Add((firstColor!.StaticValue, 0d));
        else
            stops.Add((middle.Value, 0d));

        if (firstEnabled && secondEnabled)
        {
            stops.Add((middle.Value, Math.Min(firstStop, secondStop)));
            stops.Add((middle.Value, Math.Max(firstStop, secondStop)));
        }
        else
        {
            stops.Add((middle.Value, firstEnabled ? firstStop : secondStop));
        }

        stops.Add((secondEnabled ? secondColor!.StaticValue : middle.Value, 100d));
        return new ColorGradient(direction?.StaticValue ?? HmiGradientDirection.HorizontalFromLeft, stops);
    }

    private static void AppendColorGradientStyle(StringBuilder html, ColorGradient? gradient)
    {
        if (gradient is not { } value)
            return;

        html.Append("background-image: linear-gradient(").Append(ToCss(value.Direction));
        foreach (var (color, offset) in value.Stops)
            html.Append(", ").Append(ToCss(color)).Append(' ').Append(ToCss(offset)).Append('%');
        html.Append(");");
    }

    private static void AppendFillAnimationStyle(StringBuilder html, HmiShapeBase item, HmiHtmlConvertContext context)
    {
        if (!TryGetFillPercentage(item.FillAnimation, out var percentage) || GetFillColor(item, context) is not HmiColor fillColor)
            return;

        var direction = item.FillAnimation?.Direction switch
        {
            HmiFillDirection.Up => "to top",
            HmiFillDirection.Down => "to bottom",
            HmiFillDirection.Left => "to left",
            _ => "to right"
        };
        html.Append("background-color: transparent;");
        html.Append("background-image: linear-gradient(")
            .Append(direction).Append(", ")
            .Append(ToCss(fillColor)).Append(" 0%, ")
            .Append(ToCss(fillColor)).Append(' ').Append(ToCss(percentage)).Append("%, transparent ")
            .Append(ToCss(percentage)).Append("%, transparent 100%);");
    }

    private static void AppendRectangleRadius(StringBuilder html, HmiRectangle rectangle, HmiHtmlConvertContext context)
    {
        if (rectangle.CornerRadius is null && rectangle.TopLeftRadius is null && rectangle.TopRightRadius is null &&
            rectangle.BottomRightRadius is null && rectangle.BottomLeftRadius is null)
            return;

        var uniform = rectangle.CornerRadius is null
            ? 0d
            : Math.Max(0d, ResolveStaticValue(rectangle.CornerRadius, context));
        var fallback = (x: uniform, y: uniform);
        var topLeft = rectangle.TopLeftRadius is null ? fallback : ResolveStaticValue(rectangle.TopLeftRadius, context);
        var topRight = rectangle.TopRightRadius is null ? fallback : ResolveStaticValue(rectangle.TopRightRadius, context);
        var bottomRight = rectangle.BottomRightRadius is null ? fallback : ResolveStaticValue(rectangle.BottomRightRadius, context);
        var bottomLeft = rectangle.BottomLeftRadius is null ? fallback : ResolveStaticValue(rectangle.BottomLeftRadius, context);

        html.Append("border-radius: ")
            .Append(ToCss(Math.Max(0d, topLeft.x))).Append("px ")
            .Append(ToCss(Math.Max(0d, topRight.x))).Append("px ")
            .Append(ToCss(Math.Max(0d, bottomRight.x))).Append("px ")
            .Append(ToCss(Math.Max(0d, bottomLeft.x))).Append("px / ")
            .Append(ToCss(Math.Max(0d, topLeft.y))).Append("px ")
            .Append(ToCss(Math.Max(0d, topRight.y))).Append("px ")
            .Append(ToCss(Math.Max(0d, bottomRight.y))).Append("px ")
            .Append(ToCss(Math.Max(0d, bottomLeft.y))).Append("px;");
    }

    private static async ValueTask AppendGraphicViewAsync(
        StringBuilder html,
        HmiGraphicView graphicView,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        CancellationToken cancellationToken)
    {
        var image = graphicView.Image.GetStaticValue();
        var imageUri = await ResolveImageUriAsync(image, project, cancellationToken).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(imageUri))
            imageUri = ResolveMetafileDataUri(graphicView.Source.GetStaticValue() ?? string.Empty) ?? graphicView.Source.GetStaticValue();

        AppendImage(html, graphicView, imageUri, context);
    }

    private static void AppendImage(StringBuilder html, HmiScreenItemBase item, string? uri, HmiHtmlConvertContext context)
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            AppendDiv(html, item, null, null, context);
            return;
        }

        var imageUri = uri!;
        html.Append("<img");
        AppendCommonAttributes(html, item, context);
        AppendAttribute(html, "src", imageUri);
        html.Append(">");
    }

    private static void AppendSymbolLibraryControl(StringBuilder html, HmiSymbolLibraryControl symbolLibraryControl, HmiHtmlConvertContext context)
    {
        var symbolSvg = ResolveImageSvg(symbolLibraryControl.Symbol);
        if (!string.IsNullOrWhiteSpace(symbolSvg))
        {
            html.Append("<div");
            AppendSymbolLibraryAttributes(html, symbolLibraryControl, context);
            html.Append(">");
            html.Append(NormalizeEmbeddedSymbolSvg(symbolSvg!, symbolLibraryControl));
            html.Append("</div>");
            return;
        }

        var imageUri = ResolveImageUri(symbolLibraryControl.Symbol);
        if (string.IsNullOrWhiteSpace(imageUri))
        {
            AppendDiv(html, symbolLibraryControl, context.Options.UnsupportedItemPlaceholderCssClass, "Symbol library control", context);
            return;
        }

        html.Append("<div");
        AppendSymbolLibraryAttributes(html, symbolLibraryControl, context);
        html.Append(">");
        html.Append("<img");
        AppendAttribute(html, "src", imageUri);
        AppendAttribute(html, "alt", symbolLibraryControl.Symbol?.Name ?? symbolLibraryControl.Name);
        AppendAttribute(html, "data-hmi-symbol-id", symbolLibraryControl.SymbolId);
        html.Append(" style=\"width: 100%; height: 100%; display: block;");
        html.Append(symbolLibraryControl.FixedAspectRatio.GetStaticValueOrDefault() ? "object-fit: contain;" : "object-fit: fill;");
        html.Append("\">");
        html.Append("</div>");
    }

    private static string NormalizeEmbeddedSymbolSvg(string svg, HmiSymbolLibraryControl symbolLibraryControl)
    {
        var svgStart = svg.IndexOf("<svg", StringComparison.OrdinalIgnoreCase);
        if (svgStart < 0)
            return svg;

        var svgTagEnd = svg.IndexOf('>', svgStart);
        if (svgTagEnd < 0)
            return svg;

        var rootTag = svg.Substring(svgStart, svgTagEnd - svgStart);
        var existingStyle = TryGetAttributeValue(rootTag, "style");
        var normalizedStyle = AppendCssDeclaration(existingStyle, "width: 100%; height: 100%; display: block;");
        var attributes = new StringBuilder();
        if (existingStyle == null)
            attributes.Append(" style=\"").Append(normalizedStyle).Append('"');
        else
            svg = ReplaceAttributeValue(svg, svgStart, svgTagEnd, "style", normalizedStyle);
        if (rootTag.IndexOf("preserveAspectRatio", StringComparison.OrdinalIgnoreCase) < 0)
            attributes.Append(symbolLibraryControl.FixedAspectRatio.GetStaticValueOrDefault()
                ? " preserveAspectRatio=\"xMidYMid meet\""
                : " preserveAspectRatio=\"none\"");
        if (!string.IsNullOrWhiteSpace(symbolLibraryControl.SymbolId))
            attributes.Append(" data-hmi-symbol-id=\"").Append(WebUtility.HtmlEncode(symbolLibraryControl.SymbolId)).Append('"');

        return attributes.Length == 0 ? svg : svg.Insert(svgTagEnd, attributes.ToString());
    }

    private static string? TryGetAttributeValue(string tag, string attributeName)
    {
        var pattern = attributeName + "=\"";
        var start = tag.IndexOf(pattern, StringComparison.OrdinalIgnoreCase);
        if (start < 0)
            return null;

        start += pattern.Length;
        var end = tag.IndexOf('"', start);
        return end < 0 ? null : WebUtility.HtmlDecode(tag.Substring(start, end - start));
    }

    private static string AppendCssDeclaration(string? existingStyle, string declaration)
    {
        if (string.IsNullOrWhiteSpace(existingStyle))
            return declaration;

        var separator = existingStyle!.TrimEnd().EndsWith(";", StringComparison.Ordinal) ? " " : "; ";
        return existingStyle + separator + declaration;
    }

    private static string ReplaceAttributeValue(string value, int tagStart, int tagEnd, string attributeName, string attributeValue)
    {
        var pattern = attributeName + "=\"";
        var attributeStart = value.IndexOf(pattern, tagStart, tagEnd - tagStart, StringComparison.OrdinalIgnoreCase);
        if (attributeStart < 0)
            return value;

        var valueStart = attributeStart + pattern.Length;
        var valueEnd = value.IndexOf('"', valueStart);
        if (valueEnd < 0 || valueEnd > tagEnd)
            return value;

        return value.Substring(0, valueStart) + WebUtility.HtmlEncode(attributeValue) + value.Substring(valueEnd);
    }

    private static void AppendSymbolLibraryAttributes(StringBuilder html, HmiSymbolLibraryControl symbolLibraryControl, HmiHtmlConvertContext context)
    {
        AppendAttribute(html, "id", symbolLibraryControl.Name);
        AppendTextAttribute(html, "title", symbolLibraryControl.ToolTipText, context);
        AppendStaticAttribute(html, "tabindex", symbolLibraryControl.TabIndex, context);
        AppendAttribute(html, "data-hmi-security-code", symbolLibraryControl.SecurityCode);
        AppendDisabledAttribute(html, symbolLibraryControl, context);
        AppendAttribute(html, "data-hmi-symbol-id", symbolLibraryControl.SymbolId);
        AppendAttribute(html, "data-hmi-symbol-appearance", FormatAttributeValue(symbolLibraryControl.SymbolAppearance?.StaticValue));
        AppendAttribute(html, "data-hmi-fill-color-mode", FormatAttributeValue(symbolLibraryControl.FillColorMode?.StaticValue));
        AppendAttribute(html, "data-hmi-blink-mode", FormatAttributeValue(symbolLibraryControl.BlinkMode?.StaticValue));
        html.Append(" style=\"position: absolute; overflow: hidden;");
        AppendPosition(html, symbolLibraryControl, context);
        AppendDisabledStyle(html, symbolLibraryControl, context);
        AppendOpacity(html, symbolLibraryControl, context);
        AppendDesignShadow(html, symbolLibraryControl, context);
        if (symbolLibraryControl.BackFillStyle.GetStaticValueOrDefault() == HmiSymbolLibraryBackFillStyle.Solid && symbolLibraryControl.BackColor?.StaticValue != null)
            html.Append("background-color: ").Append(ToCss(symbolLibraryControl.BackColor.StaticValue)).Append(";");
        AppendSymbolLibraryTransform(html, symbolLibraryControl);
        html.Append("\"");
    }

    private static void AppendSymbolLibraryTransform(StringBuilder html, HmiSymbolLibraryControl symbolLibraryControl)
    {
        var transforms = new List<string>();
        switch (symbolLibraryControl.Flip.GetStaticValueOrDefault(HmiSymbolLibraryFlip.None))
        {
            case HmiSymbolLibraryFlip.Horizontal:
                transforms.Add("scaleX(-1)");
                break;
            case HmiSymbolLibraryFlip.Vertical:
                transforms.Add("scaleY(-1)");
                break;
            case HmiSymbolLibraryFlip.Both:
                transforms.Add("scale(-1, -1)");
                break;
        }

        switch (symbolLibraryControl.Rotation.GetStaticValueOrDefault(HmiSymbolLibraryRotation.Angle0))
        {
            case HmiSymbolLibraryRotation.Angle90:
                transforms.Add("rotate(90deg)");
                break;
            case HmiSymbolLibraryRotation.Angle180:
                transforms.Add("rotate(180deg)");
                break;
            case HmiSymbolLibraryRotation.Angle270:
                transforms.Add("rotate(270deg)");
                break;
        }

        if (transforms.Count > 0)
            html.Append("transform: ").Append(string.Join(" ", transforms)).Append(";transform-origin: center;");
    }

    private static void AppendInnerImage(StringBuilder html, string? uri, bool grayscale = false)
    {
        if (string.IsNullOrWhiteSpace(uri))
            return;

        html.Append("<img");
        AppendAttribute(html, "src", uri);
        html.Append(" style=\"width: 100%; height: 100%;");
        if (grayscale)
            html.Append(" filter: grayscale(1);");
        html.Append("\">");
    }

    private static void AppendSymbolImage(StringBuilder html, HmiSymbolContainer symbolContainer, HmiImageSource image, string uri)
    {
        html.Append("<img");
        AppendAttribute(html, "src", uri);
        AppendAttribute(html, "alt", image.ImageName ?? symbolContainer.Name);
        AppendAttribute(html, "data-hmi-image-id", image.ImageId);
        AppendAttribute(html, "data-hmi-image-name", image.ImageName);
        html.Append(" style=\"position: absolute; inset: 0; width: 100%; height: 100%; display: block;");
        html.Append(symbolContainer.FixedAspectRatio.GetStaticValueOrDefault() ? "object-fit: contain;" : "object-fit: fill;");
        html.Append("\">");
    }

    private static void AppendDynamicSvg(StringBuilder html, HmiDynamicSvg dynamicSvg, HmiHtmlConvertContext context)
    {
        html.Append("<node-projects-svghmi");
        AppendCommonAttributes(html, dynamicSvg, context);
        AppendAttribute(html, "src", dynamicSvg.Image.GetStaticValue()?.Uri);
        foreach (var property in dynamicSvg.Properties)
            AppendAttribute(html, ToDynamicSvgAttributeName(property.Name), FormatDynamicSvgPropertyValue(property.Value.GetStaticValue()));
        html.Append("></node-projects-svghmi>");
    }

    private static void AppendGauge(StringBuilder html, HmiGauge gauge, HmiHtmlConvertContext context)
    {
        html.Append("<hmi-gauge");
        AppendCommonAttributes(html, gauge, context);
        AppendStaticAttribute(html, "background-color", context.EffectiveProperties.Resolve(gauge, nameof(HmiPaintedScreenItemBase.BackgroundColor), gauge.BackgroundColor));
        AppendStaticAttribute(html, "value", gauge.Value);
        AppendStaticAttribute(html, "fill-level", gauge.FillLevel);
        AppendBooleanAttribute(html, "show-fill-level", gauge.ShowFillLevel.GetStaticValueOrDefault(true));
        AppendStaticAttribute(html, "begin-value", gauge.BeginValue);
        AppendStaticAttribute(html, "end-value", gauge.EndValue);
        AppendStaticAttribute(html, "origin-value", gauge.OriginValue);
        AppendStaticAttribute(html, "division-count", gauge.DivisionCount);
        AppendStaticAttribute(html, "sub-division-count", gauge.SubDivisionCount);
        AppendBooleanAttribute(html, "major-ticks-only", gauge.MajorTicksOnly.GetStaticValueOrDefault());
        AppendBooleanAttribute(html, "hide-scale", !gauge.ShowScale.GetStaticValueOrDefault(true));
        AppendBooleanAttribute(html, "hide-tick-labels", !gauge.ShowTickLabels.GetStaticValueOrDefault(true));
        AppendStaticAttribute(html, "tick-label-interval", gauge.TickLabelInterval);
        AppendStaticAttribute(html, "tick-label-decimal-places", gauge.TickLabelDecimalPlaces);
        AppendBooleanAttribute(html, "tick-label-exponential-format", gauge.TickLabelExponentialFormat.GetStaticValueOrDefault());
        AppendStaticAttribute(html, "bar-mode", gauge.BarMode);
        AppendStaticAttribute(html, "scale-mode", gauge.ScaleMode);
        AppendStaticAttribute(html, "orientation", gauge.Orientation);
        AppendBooleanAttribute(html, "show-value", gauge.ShowValue.GetStaticValueOrDefault(true));
        AppendStaticAttribute(html, "value-position", gauge.ValuePosition);
        AppendStaticAttribute(html, "label-color", gauge.LabelColor);
        AppendStaticAttribute(html, "scale-background-color", gauge.ScaleBackgroundColor);
        AppendStaticAttribute(html, "scale-foreground-color", gauge.ScaleForegroundColor);
        AppendStaticAttribute(html, "tick-color", gauge.TickColor);
        AppendAttribute(html, "label-font", FormatFont(gauge.LabelFont));
        html.Append("></hmi-gauge>");
    }

    private static void AppendAlarmIndicator(StringBuilder html, HmiAlarmIndicator indicator, HmiHtmlConvertContext context)
    {
        var alarmState = indicator.AlarmState is null ? (int?)null : ResolveStaticValue(indicator.AlarmState, context);
        var noAlarmState = indicator.NoAlarmState is null ? 0 : ResolveStaticValue(indicator.NoAlarmState, context);
        var visualState = indicator.VisualState is null
            ? alarmState.HasValue && alarmState.Value != noAlarmState
                ? HmiAlarmIndicatorState.CameIn
                : HmiAlarmIndicatorState.Normal
            : ResolveStaticValue(indicator.VisualState, context);
        var numberOfAlarms = indicator.NumberOfAlarms is null ? (int?)null : ResolveStaticValue(indicator.NumberOfAlarms, context);
        var text = indicator.Text is null ? null : ResolveStaticValue(indicator.Text, context);
        var isLocked = indicator.IsLocked is not null && ResolveStaticValue(indicator.IsLocked, context);
        var lockedText = indicator.LockedText is null ? null : ResolveStaticValue(indicator.LockedText, context);
        var isActive = visualState != HmiAlarmIndicatorState.Normal;
        var isFlashingRequired = indicator.IsFlashingRequired is not null &&
            ResolveStaticValue(indicator.IsFlashingRequired, context);
        var content = isLocked && !string.IsNullOrEmpty(lockedText)
            ? lockedText
            : numberOfAlarms is > 0
                ? numberOfAlarms.Value.ToString(CultureInfo.InvariantCulture)
                : !string.IsNullOrEmpty(text)
                    ? text
                    : alarmState.HasValue && isActive ? "!" : string.Empty;

        var style = new StringBuilder("display: flex; overflow: hidden;");
        var animations = new List<string>();
        if (indicator.VerticalAlignment is null)
            style.Append("align-items: center;");
        if (indicator.HorizontalAlignment is null)
            style.Append("justify-content: center;");
        if (isActive && indicator.FlashingColor is not null)
        {
            var flashingColor = ResolveStaticValue(indicator.FlashingColor, context);
            if (isFlashingRequired)
            {
                var backgroundColor = indicator.BackgroundColor is null
                    ? "transparent"
                    : ToCss(ResolveStaticValue(indicator.BackgroundColor, context));
                var flashingRate = indicator.FlashingRate is null
                    ? 1000
                    : ResolveStaticValue(indicator.FlashingRate, context);
                style.Append("--hmi-background-color-off: ").Append(backgroundColor).Append(';')
                    .Append("--hmi-background-color-on: ").Append(ToCss(flashingColor)).Append(';');
                animations.Add("hmi-background-color-flash " +
                    ToCss(flashingRate > 0 ? flashingRate / 1000d : 1d) +
                    "s steps(1, end) infinite");
            }
            else
            {
                style.Append("box-shadow: inset 0 0 0 0.35em ").Append(ToCss(flashingColor)).Append(';');
            }
        }
        if (isActive && indicator.FlashingForegroundColor is not null)
        {
            var flashingForegroundColor = ResolveStaticValue(indicator.FlashingForegroundColor, context);
            if (indicator.IsForegroundFlashingRequired is not null &&
                ResolveStaticValue(indicator.IsForegroundFlashingRequired, context))
            {
                var foregroundColor = indicator.ForegroundColor is null
                    ? "inherit"
                    : ToCss(ResolveStaticValue(indicator.ForegroundColor, context));
                var flashingRate = indicator.FlashingRate is null
                    ? 1000
                    : ResolveStaticValue(indicator.FlashingRate, context);
                style.Append("--hmi-foreground-color-off: ").Append(foregroundColor).Append(';')
                    .Append("--hmi-foreground-color-on: ").Append(ToCss(flashingForegroundColor)).Append(';');
                animations.Add("hmi-foreground-color-flash " +
                    ToCss(flashingRate > 0 ? flashingRate / 1000d : 1d) +
                    "s steps(1, end) infinite");
            }
            else
            {
                style.Append("color: ").Append(ToCss(flashingForegroundColor)).Append(';');
            }
        }
        if (animations.Count > 0)
            style.Append("animation: ").Append(string.Join(", ", animations)).Append(';');
        if (isLocked && indicator.LockedForegroundColor is not null)
            style.Append("color: ").Append(ToCss(ResolveStaticValue(indicator.LockedForegroundColor, context))).Append(';');
        if (isLocked && indicator.LockedBackgroundColor is not null)
            style.Append("background-color: ").Append(ToCss(ResolveStaticValue(indicator.LockedBackgroundColor, context))).Append(';');

        html.Append("<div");
        AppendCommonAttributes(html, indicator, context, additionalStyle: style.ToString());
        AppendAttribute(html, "class", "hmi-alarm-indicator");
        AppendAttribute(html, "role", "status");
        AppendAttribute(html, "aria-label", "Alarm indicator");
        AppendAttribute(html, "data-active", isActive ? "true" : "false");
        AppendStaticValueAttribute(html, "data-visual-state", indicator.VisualState, context);
        AppendStaticValueAttribute(html, "data-group-relevant", indicator.IsGroupRelevant, context);
        AppendStaticValueAttribute(html, "data-significant-mask", indicator.SignificantMask, context);
        AppendStaticValueAttribute(html, "data-event-acknowledgement-mask", indicator.EventAcknowledgementMask, context);
        AppendStaticValueAttribute(html, "data-use-global-alarm-classes", indicator.UseGlobalAlarmClasses, context);
        AppendStaticValueAttribute(html, "data-use-global-settings", indicator.UseGlobalSettings, context);
        AppendStaticValueAttribute(html, "data-user-value-1", indicator.UserValue1, context);
        AppendStaticValueAttribute(html, "data-user-value-2", indicator.UserValue2, context);
        AppendStaticValueAttribute(html, "data-user-value-3", indicator.UserValue3, context);
        AppendStaticValueAttribute(html, "data-user-value-4", indicator.UserValue4, context);
        AppendStaticValueAttribute(html, "data-selected-message-class", indicator.SelectedMessageClass, context);
        AppendAttribute(html, "data-text-flashing-message-classes", string.Join(",", indicator.MessageClassAppearances
            .Where(x => x.IsTextFlashingRequired is not null && ResolveStaticValue(x.IsTextFlashingRequired, context))
            .OrderBy(x => x.Index)
            .Select(x => x.Index.ToString(CultureInfo.InvariantCulture))));
        AppendAttribute(html, "data-background-flashing-message-classes", string.Join(",", indicator.MessageClassAppearances
            .Where(x => x.IsBackgroundFlashingRequired is not null && ResolveStaticValue(x.IsBackgroundFlashingRequired, context))
            .OrderBy(x => x.Index)
            .Select(x => x.Index.ToString(CultureInfo.InvariantCulture))));
        AppendStaticValueAttribute(html, "data-flashing-required", indicator.IsFlashingRequired, context);
        AppendStaticValueAttribute(html, "data-flashing-color", indicator.FlashingColor, context);
        AppendStaticValueAttribute(html, "data-foreground-flashing-required", indicator.IsForegroundFlashingRequired, context);
        AppendStaticValueAttribute(html, "data-flashing-foreground-color", indicator.FlashingForegroundColor, context);
        AppendStaticValueAttribute(html, "data-flashing-rate", indicator.FlashingRate, context);
        AppendStaticValueAttribute(html, "data-alarm-state", indicator.AlarmState, context);
        AppendStaticValueAttribute(html, "data-no-alarm-state", indicator.NoAlarmState, context);
        AppendStaticValueAttribute(html, "data-number-of-alarms", indicator.NumberOfAlarms, context);
        AppendStaticValueAttribute(html, "data-text", indicator.Text, context);
        AppendStaticValueAttribute(html, "data-equal-segment-widths", indicator.UseEqualSegmentWidths, context);
        AppendStaticValueAttribute(html, "data-locked", indicator.IsLocked, context);
        AppendStaticValueAttribute(html, "data-locked-text", indicator.LockedText, context);
        AppendStaticValueAttribute(html, "data-locked-foreground-color", indicator.LockedForegroundColor, context);
        AppendStaticValueAttribute(html, "data-locked-background-color", indicator.LockedBackgroundColor, context);
        if (indicator.Segments.Count > 0)
            AppendAttribute(html, "data-segment-count", indicator.Segments.Count.ToString(CultureInfo.InvariantCulture));
        AppendIntegerListAttribute(html, "data-show-acknowledged-alarm-classes", indicator.ShowAcknowledgedAlarmClasses, context);
        AppendIntegerListAttribute(html, "data-show-pending-alarm-classes", indicator.ShowPendingAlarmClasses, context);
        html.Append('>');
        if (indicator.Segments.Count > 0)
        {
            var useEqualWidths = indicator.UseEqualSegmentWidths is not null &&
                ResolveStaticValue(indicator.UseEqualSegmentWidths, context);
            foreach (var segment in indicator.Segments.OrderBy(candidate => candidate.Index))
            {
                var width = segment.Width is null ? 0d : ResolveStaticValue(segment.Width, context);
                html.Append("<span");
                AppendAttribute(html, "class", "hmi-alarm-indicator-segment");
                AppendAttribute(html, "data-segment-index", segment.Index.ToString(CultureInfo.InvariantCulture));
                AppendIntegerListAttribute(html, "data-message-classes", segment.MessageClasses, context);
                html.Append(" style=\"");
                if (width <= 0)
                    html.Append("display: none;");
                else if (useEqualWidths)
                    html.Append("flex: 1 1 0;");
                else
                    html.Append("flex: 0 0 ").Append(ToCss(width)).Append("px;");
                html.Append("height: 100%; min-width: 0; border-right: 1px solid currentColor;\"></span>");
            }

            var horizontalAlignment = indicator.HorizontalAlignment is null
                ? HmiHorizontalAlignment.Center
                : ResolveStaticValue(indicator.HorizontalAlignment, context);
            var verticalAlignment = indicator.VerticalAlignment is null
                ? HmiVerticalAlignment.Center
                : ResolveStaticValue(indicator.VerticalAlignment, context);
            html.Append("<span class=\"hmi-alarm-indicator-label\" style=\"position: absolute; inset: 0; display: flex; pointer-events: none; justify-content: ")
                .Append(ToFlexCss(horizontalAlignment)).Append("; align-items: ")
                .Append(ToCss(verticalAlignment)).Append(";\">")
                .Append(WebUtility.HtmlEncode(content)).Append("</span>");
        }
        else
        {
            html.Append(WebUtility.HtmlEncode(content));
        }
        html.Append("</div>");
    }

    private static void AppendStaticValueAttribute<T>(
        StringBuilder html,
        string name,
        HmiProperty<T>? property,
        HmiHtmlConvertContext context)
    {
        if (property is not null)
            AppendAttribute(html, name, FormatAttributeValue(ResolveStaticValue(property, context)));
    }

    private static void AppendIntegerListAttribute(
        StringBuilder html,
        string name,
        HmiProperty<IList<int>>? property,
        HmiHtmlConvertContext context)
    {
        if (property is not null)
            AppendAttribute(html, name, string.Join(",", ResolveStaticValue(property, context) ?? Array.Empty<int>()));
    }

    private static void AppendTrendControl(StringBuilder html, HmiTrendControl trendControl, HmiHtmlConvertContext context)
    {
        html.Append("<hmi-trend-control");
        AppendCommonAttributes(html, trendControl, context, additionalStyle: CreateTrendControlStyle(trendControl, context));
        AppendAttribute(html, "data-window-resizable", ResolvePropertyPreview(trendControl.Resizable, context));
        AppendAttribute(html, "data-window-movable", ResolvePropertyPreview(trendControl.Movable, context));
        AppendAttribute(html, "data-window-closeable", ResolvePropertyPreview(trendControl.Closeable, context));
        AppendAttribute(html, "control-name", trendControl.Name);
        AppendAttribute(html, "type-name", "Trend control");
        AppendAttribute(html, "chart-title", trendControl.ChartTitle);
        AppendStaticAttribute(html, "window-background-color", trendControl.WindowBackgroundColor);
        AppendStaticBooleanValueAttribute(html, "display-chart-title", trendControl.DisplayChartTitle);
        AppendStaticBooleanValueAttribute(html, "show-toolbar", trendControl.ShowToolbar);
        AppendStaticAttribute(html, "toolbar-alignment", trendControl.ToolbarAlignment);
        AppendStaticBooleanValueAttribute(html, "use-toolbar-background-color", trendControl.UseToolbarBackgroundColor);
        AppendStaticAttribute(html, "toolbar-background-color", trendControl.ToolbarBackgroundColor);
        AppendStaticAttribute(html, "toolbar-button-size", trendControl.ToolbarButtonSize);
        AppendStaticBooleanValueAttribute(html, "show-status-bar", trendControl.ShowStatusBar);
        AppendStaticBooleanValueAttribute(html, "use-status-bar-background-color", trendControl.UseStatusBarBackgroundColor);
        AppendStaticBooleanValueAttribute(html, "display-pen-icons", trendControl.DisplayPenIcons);
        AppendStaticBooleanValueAttribute(html, "use-trend-name-as-label", trendControl.UseTrendNameAsLabel);
        AppendStaticBooleanValueAttribute(html, "display-value-bar", trendControl.DisplayValueBar);
        AppendStaticBooleanValueAttribute(html, "use-graphic-value-bar", trendControl.UseGraphicValueBar);
        AppendStaticAttribute(html, "value-bar-color", trendControl.ValueBarColor);
        AppendStaticAttribute(html, "value-bar-width", trendControl.ValueBarWidth);
        AppendStaticBooleanValueAttribute(html, "show-value-bar-in-x-axis", trendControl.ShowValueBarInXAxis);
        AppendStaticBooleanValueAttribute(html, "display-statistic-rulers", trendControl.DisplayStatisticRulers);
        AppendStaticBooleanValueAttribute(html, "use-graphic-statistic-rulers", trendControl.UseGraphicStatisticRulers);
        AppendStaticAttribute(html, "statistic-ruler-color", trendControl.StatisticRulerColor);
        AppendStaticAttribute(html, "statistic-ruler-width", trendControl.StatisticRulerWidth);
        AppendStaticBooleanValueAttribute(html, "display-scroll-mechanism", trendControl.DisplayScrollMechanism);
        AppendStaticBooleanValueAttribute(html, "chart-live-mode", trendControl.ChartLiveMode);
        AppendStaticBooleanValueAttribute(html, "auto-scale", trendControl.AutoScale);
        AppendStaticBooleanValueAttribute(html, "x-axis-scale-visible", trendControl.XAxisScaleVisible);
        AppendStaticAttribute(html, "x-axis-color", trendControl.XAxisColor);
        AppendStaticBooleanValueAttribute(html, "x-axis-in-trend-color", trendControl.XAxisInTrendColor);
        AppendStaticAttribute(html, "x-axis-alignment", trendControl.XAxisAlignment);
        AppendAttribute(html, "x-axis-label", trendControl.XAxisLabel);
        AppendStaticBooleanValueAttribute(html, "x-axis-date-visible", trendControl.XAxisDateVisible);
        AppendStaticAttribute(html, "x-axis-date-format", trendControl.XAxisDateFormat);
        AppendStaticBooleanValueAttribute(html, "x-axis-flipped", trendControl.XAxisFlipped);
        AppendStaticAttribute(html, "time-format", trendControl.TimeFormat);
        AppendStaticAttribute(html, "time-base", trendControl.TimeBase);
        AppendAttribute(html, "project-time-zone", trendControl.ProjectTimeZoneId);
        AppendStaticBooleanValueAttribute(html, "display-milliseconds", trendControl.DisplayMilliseconds);
        AppendStaticAttribute(html, "x-axis-time-span", trendControl.XAxisTimeSpan);
        AppendAttribute(html, "x-axis-time-span-unit", trendControl.XAxisTimeSpanUnit);
        AppendStaticBooleanValueAttribute(html, "x-axis-grid-visible", trendControl.XAxisGridVisible);
        AppendStaticBooleanValueAttribute(html, "major-grid-visible", trendControl.MajorGridVisible);
        AppendStaticAttribute(html, "major-grid-color", trendControl.MajorGridColor);
        AppendStaticBooleanValueAttribute(html, "minor-grid-visible", trendControl.MinorGridVisible);
        AppendStaticAttribute(html, "minor-grid-color", trendControl.MinorGridColor);
        AppendStaticBooleanValueAttribute(html, "grid-in-trend-color", trendControl.GridInTrendColor);
        AppendStaticBooleanValueAttribute(html, "y-axis-scale-visible", trendControl.YAxisScaleVisible);
        AppendStaticAttribute(html, "y-axis-color", trendControl.YAxisColor);
        AppendStaticBooleanValueAttribute(html, "y-axis-in-trend-color", trendControl.YAxisInTrendColor);
        AppendStaticAttribute(html, "y-axis-alignment", trendControl.YAxisAlignment);
        AppendAttribute(html, "y-axis-label", trendControl.YAxisLabel);
        AppendStaticBooleanValueAttribute(html, "y-axis-grid-visible", trendControl.YAxisGridVisible);
        AppendStaticBooleanValueAttribute(html, "show-percentage-axis", trendControl.ShowPercentageAxis);
        AppendStaticAttribute(html, "percentage-axis-color", trendControl.PercentageAxisColor);
        AppendStaticAttribute(html, "percentage-axis-alignment", trendControl.PercentageAxisAlignment);
        AppendStaticAttribute(html, "minimum-value", trendControl.MinimumValue);
        AppendStaticAttribute(html, "maximum-value", trendControl.MaximumValue);
        AppendStaticAttribute(html, "y-axis-decimal-places", trendControl.YAxisDecimalPlaces);
        AppendAttribute(html, "pens", FormatTrendPens(trendControl.Pens));
        AppendAttribute(html, "value-axes", FormatTrendValueAxes(trendControl.ValueAxes));
        AppendAttribute(html, "trend-windows", FormatTrendWindows(trendControl.TrendWindows));
        AppendAttribute(html, "time-axes", FormatTrendTimeAxes(trendControl.TimeAxes));
        html.Append("></hmi-trend-control>");
    }

    private static string CreateControlWindowStyle(
        HmiWindowBase window,
        HmiHtmlConvertContext context,
        string baseStyle)
    {
        if (window.Resizable is null || !ResolveStaticValue(window.Resizable, context))
            return baseStyle;
        return baseStyle + "resize: both;";
    }

    private static string CreateAlarmControlStyle(HmiAlarmControl alarmControl, HmiHtmlConvertContext context)
    {
        var style = new StringBuilder(CreateControlWindowStyle(
            alarmControl,
            context,
            "display: flex; flex-direction: column;"));
        var horizontalOverflow = alarmControl.ShowHorizontalScrollbar is not null &&
            ResolveStaticValue(alarmControl.ShowHorizontalScrollbar, context) ? "auto" : "hidden";
        var verticalOverflow = alarmControl.ShowVerticalScrollbar is not null &&
            ResolveStaticValue(alarmControl.ShowVerticalScrollbar, context) ? "auto" : "hidden";
        style.Append("overflow-x: ").Append(horizontalOverflow).Append(';')
            .Append("overflow-y: ").Append(verticalOverflow).Append(';');
        if (alarmControl.GridLineColor is not null)
        {
            var gridLineColor = ResolveStaticValue(alarmControl.GridLineColor, context);
            style.Append("--hmi-grid-line-color: ").Append(ToCss(gridLineColor)).Append(';');
        }
        AppendFontStyle(style, alarmControl.ContentFont);
        return style.ToString();
    }

    private static string CreateAlarmHeaderStyle(HmiAlarmControl alarmControl, HmiHtmlConvertContext context)
    {
        var style = new StringBuilder("flex: 0 0 auto; display: flex; align-items: center; border-bottom: 1px solid currentColor; padding: 2px 4px; font-weight: bold;");
        AppendColorStyle(style, "background-color", alarmControl.HeaderBackgroundColor);
        AppendColorStyle(style, "color", alarmControl.HeaderForegroundColor);
        if (alarmControl.HeaderBorderColor is not null)
            style.Append("border-bottom-color: ").Append(ToCss(ResolveStaticValue(alarmControl.HeaderBorderColor, context))).Append(';');
        AppendFontStyle(style, alarmControl.HeaderFont);
        return style.ToString();
    }

    private static string CreateAlarmTableStyle(HmiAlarmControl alarmControl, HmiHtmlConvertContext context)
    {
        var style = new StringBuilder("width: 100%; border-collapse: collapse; table-layout: fixed;");
        if (alarmControl.TableBackgroundColor is not null)
            style.Append("background-color: ").Append(ToCss(ResolveStaticValue(alarmControl.TableBackgroundColor, context))).Append(';');
        if (alarmControl.TableForegroundColor is not null)
            style.Append("color: ").Append(ToCss(ResolveStaticValue(alarmControl.TableForegroundColor, context))).Append(';');
        if (alarmControl.AlternatingRowBackgroundColor is not null)
            style.Append("--hmi-alarm-alternating-row-background: ")
                .Append(ToCss(ResolveStaticValue(alarmControl.AlternatingRowBackgroundColor, context))).Append(';');
        if (alarmControl.AlternatingRowForegroundColor is not null)
            style.Append("--hmi-alarm-alternating-row-foreground: ")
                .Append(ToCss(ResolveStaticValue(alarmControl.AlternatingRowForegroundColor, context))).Append(';');
        return style.ToString();
    }

    private static string CreateAlarmGridCellStyle(HmiAlarmControl alarmControl, HmiHtmlConvertContext context)
    {
        var horizontal = alarmControl.ShowHorizontalGridLines is null || ResolveStaticValue(alarmControl.ShowHorizontalGridLines, context);
        var vertical = alarmControl.ShowVerticalGridLines is null || ResolveStaticValue(alarmControl.ShowVerticalGridLines, context);
        var width = alarmControl.GridLineWidth is null
            ? 1d
            : Math.Max(0d, ResolveStaticValue(alarmControl.GridLineWidth, context));
        return $"border-style: solid; border-color: var(--hmi-grid-line-color, currentColor); border-width: {(horizontal ? ToCss(width) : "0")}px {(vertical ? ToCss(width) : "0")}px;";
    }

    private static void AppendAlarmSelectionRectangleStyle(
        StringBuilder style,
        HmiAlarmControl alarmControl,
        HmiHtmlConvertContext context)
    {
        if (alarmControl.SelectionRectangleMode is null ||
            ResolveStaticValue(alarmControl.SelectionRectangleMode, context) == 0)
            return;

        var width = alarmControl.SelectionRectangleWidth is null
            ? 1d
            : Math.Max(0d, ResolveStaticValue(alarmControl.SelectionRectangleWidth, context));
        style.Append("outline: ").Append(ToCss(width)).Append("px solid ");
        if (alarmControl.UseAutomaticSelectionRectangleColor is not null &&
            ResolveStaticValue(alarmControl.UseAutomaticSelectionRectangleColor, context))
            style.Append("currentColor");
        else if (alarmControl.SelectionRectangleColor is not null)
            style.Append(ToCss(ResolveStaticValue(alarmControl.SelectionRectangleColor, context)));
        else
            style.Append("currentColor");
        style.Append(";outline-offset: -").Append(ToCss(width)).Append("px;");
    }

    private static string CreateAlarmTableHeaderCellStyle(
        HmiAlarmControl alarmControl,
        HmiHtmlConvertContext context,
        string gridCellStyle)
    {
        var style = new StringBuilder(gridCellStyle);
        AppendColorStyle(style, "background-color", alarmControl.TableHeaderBackgroundColor);
        AppendColorStyle(style, "color", alarmControl.TableHeaderForegroundColor);
        if (alarmControl.TableHeaderHorizontalAlignment is not null)
            style.Append("text-align: ")
                .Append(ToCss(ResolveStaticValue(alarmControl.TableHeaderHorizontalAlignment, context))).Append(';');
        AppendColorStyle(style, "border-color", alarmControl.TableHeaderBorderColor);
        if (alarmControl.TableHeaderBorderWidth is not null)
            style.Append("border-width: ")
                .Append(ToCss(Math.Max(0d, ResolveStaticValue(alarmControl.TableHeaderBorderWidth, context))))
                .Append("px;");
        AppendFontStyle(style, alarmControl.HeaderFont);
        return style.ToString();
    }

    private static string CreateTrendControlStyle(HmiTrendControl trendControl, HmiHtmlConvertContext context)
    {
        var style = new StringBuilder(CreateControlWindowStyle(trendControl, context, "overflow: hidden;"));
        AppendFontVariables(style, "content", trendControl.ContentFont);
        AppendFontVariables(style, "header", trendControl.HeaderFont);
        AppendFontVariables(style, "status", trendControl.StatusBarFont);
        if (trendControl.ToolbarBackgroundColor is not null &&
            (trendControl.UseToolbarBackgroundColor is null || ResolveStaticValue(trendControl.UseToolbarBackgroundColor, context)))
            style.Append("--hmi-trend-toolbar-background: ")
                .Append(ToCss(ResolveStaticValue(trendControl.ToolbarBackgroundColor, context))).Append(';');
        if (trendControl.ToolbarButtonSize is not null)
        {
            var toolbarButtonSize = ResolveStaticValue(trendControl.ToolbarButtonSize, context);
            style.Append("--hmi-trend-toolbar-button-size: ")
                .Append(Math.Max(1, toolbarButtonSize == 0 ? 28 : toolbarButtonSize)).Append("px;");
        }
        if (trendControl.StatusBarBackgroundColor is not null &&
            (trendControl.UseStatusBarBackgroundColor is null || ResolveStaticValue(trendControl.UseStatusBarBackgroundColor, context)))
            style.Append("--hmi-trend-status-background: ")
                .Append(ToCss(ResolveStaticValue(trendControl.StatusBarBackgroundColor, context))).Append(';');
        if (trendControl.StatusBarForegroundColor is not null)
            style.Append("--hmi-trend-status-foreground: ")
                .Append(ToCss(ResolveStaticValue(trendControl.StatusBarForegroundColor, context))).Append(';');
        if (trendControl.PercentageAxisColor is not null)
            style.Append("--hmi-trend-percentage-axis-color: ")
                .Append(ToCss(ResolveStaticValue(trendControl.PercentageAxisColor, context))).Append(';');
        if (trendControl.ValueBarColor is not null)
            style.Append("--hmi-trend-value-bar-color: ")
                .Append(ToCss(ResolveStaticValue(trendControl.ValueBarColor, context))).Append(';');
        if (trendControl.ValueBarWidth is not null)
            style.Append("--hmi-trend-value-bar-width: ")
                .Append(Math.Max(0, ResolveStaticValue(trendControl.ValueBarWidth, context)).ToString(System.Globalization.CultureInfo.InvariantCulture))
                .Append("px;");
        if (trendControl.MajorGridColor is not null)
            style.Append("--hmi-trend-major-grid-color: ")
                .Append(ToCss(ResolveStaticValue(trendControl.MajorGridColor, context))).Append(';');
        if (trendControl.MinorGridColor is not null)
            style.Append("--hmi-trend-minor-grid-color: ")
                .Append(ToCss(ResolveStaticValue(trendControl.MinorGridColor, context))).Append(';');
        if (trendControl.XAxisColor is not null)
            style.Append("--hmi-trend-x-axis-color: ")
                .Append(ToCss(ResolveStaticValue(trendControl.XAxisColor, context))).Append(';');
        if (trendControl.YAxisColor is not null)
            style.Append("--hmi-trend-y-axis-color: ")
                .Append(ToCss(ResolveStaticValue(trendControl.YAxisColor, context))).Append(';');
        return style.ToString();
    }

    private static void AppendFontVariables(StringBuilder style, string role, HmiFont? font)
    {
        if (font is null)
            return;
        var prefix = $"--hmi-trend-{role}-";
        var name = font.Name.GetStaticValue();
        if (!string.IsNullOrWhiteSpace(name))
            style.Append(prefix).Append("font-family: ").Append(WebUtility.HtmlEncode(name)).Append(';');
        if (TryGetStaticValue(font.Size, out var size))
            style.Append(prefix).Append("font-size: ").Append(ToCss(size)).Append("px;");
        if (font.Weight.GetStaticValue() is { } weight && weight > 0)
            style.Append(prefix).Append("font-weight: ").Append(weight.ToString(CultureInfo.InvariantCulture)).Append(';');
        else if (font.Bold.GetStaticValueOrDefault())
            style.Append(prefix).Append("font-weight: bold;");
        if (font.Italic.GetStaticValueOrDefault())
            style.Append(prefix).Append("font-style: italic;");
        var decorations = new List<string>();
        if (font.Underline.GetStaticValueOrDefault())
            decorations.Add("underline");
        if (font.Strikethrough.GetStaticValueOrDefault())
            decorations.Add("line-through");
        if (decorations.Count > 0)
            style.Append(prefix).Append("text-decoration: ").Append(string.Join(" ", decorations)).Append(';');
    }

    private static void AppendFontStyle(StringBuilder style, HmiFont? font)
    {
        if (font is null)
            return;
        var name = font.Name.GetStaticValue();
        if (!string.IsNullOrWhiteSpace(name))
            style.Append("font-family: ").Append(WebUtility.HtmlEncode(name)).Append(';');
        if (TryGetStaticValue(font.Size, out var size))
            style.Append("font-size: ").Append(ToCss(size)).Append("px;");
        if (font.Weight.GetStaticValue() is { } weight && weight > 0)
            style.Append("font-weight: ").Append(weight.ToString(CultureInfo.InvariantCulture)).Append(';');
        else if (font.Bold.GetStaticValueOrDefault())
            style.Append("font-weight: bold;");
        if (font.Italic.GetStaticValueOrDefault())
            style.Append("font-style: italic;");
        var decorations = new List<string>();
        if (font.Underline.GetStaticValueOrDefault())
            decorations.Add("underline");
        if (font.Strikethrough.GetStaticValueOrDefault())
            decorations.Add("line-through");
        if (decorations.Count > 0)
            style.Append("text-decoration: ").Append(string.Join(" ", decorations)).Append(';');
    }

    private static void AppendColorStyle(StringBuilder style, string propertyName, HmiProperty<HmiColor>? property)
    {
        if (property?.StaticValue is { } color)
            style.Append(propertyName).Append(": ").Append(ToCss(color)).Append(';');
    }

    private static void AppendStaticBooleanValueAttribute(
        StringBuilder html,
        string name,
        HmiProperty<bool>? property)
    {
        if (property != null)
            AppendAttribute(html, name, property.StaticValue ? "true" : "false");
    }

    private static string? FormatTrendTimeAxes(IEnumerable<HmiTrendTimeAxis> axes)
    {
        var entries = axes.Select(axis =>
        {
            var properties = new List<string>();
            AddTrendJsonString(properties, "name", axis.Name);
            AddTrendJsonString(properties, "trendWindowName", axis.TrendWindowName);
            AddTrendJsonBoolean(properties, "visible", axis.Visible?.StaticValue);
            AddTrendJsonBoolean(properties, "showDate", axis.ShowDate?.StaticValue);
            AddTrendJsonString(properties, "dateFormat", axis.DateFormat?.StaticValue);
            AddTrendJsonString(properties, "color", axis.Color?.StaticValue is HmiColor color ? ToCss(color) : null);
            AddTrendJsonBoolean(properties, "inTrendColor", axis.InTrendColor?.StaticValue);
            AddTrendJsonString(properties, "alignment", axis.Alignment?.StaticValue.ToString());
            AddTrendJsonString(properties, "label", axis.Label);
            AddTrendJsonString(properties, "timeFormat", axis.TimeFormat?.StaticValue.ToString());
            AddTrendJsonBoolean(properties, "displayMilliseconds", axis.DisplayMilliseconds?.StaticValue);
            AddTrendJsonNumber(properties, "timeSpan", axis.TimeSpan?.StaticValue);
            AddTrendJsonString(properties, "timeSpanUnit", axis.TimeSpanUnit);
            AddTrendJsonString(properties, "rangeType", axis.RangeType?.StaticValue.ToString());
            AddTrendJsonString(properties, "startTime", axis.StartTime?.StaticValue.ToString("O", CultureInfo.InvariantCulture));
            AddTrendJsonString(properties, "endTime", axis.EndTime?.StaticValue.ToString("O", CultureInfo.InvariantCulture));
            AddTrendJsonNumber(properties, "measurementPoints", axis.MeasurementPoints?.StaticValue);
            AddTrendJsonBoolean(properties, "refreshEnabled", axis.RefreshEnabled?.StaticValue);
            return "{" + string.Join(",", properties) + "}";
        }).ToArray();
        return entries.Length == 0 ? null : "[" + string.Join(",", entries) + "]";
    }

    private static string? FormatTrendWindows(IEnumerable<HmiTrendWindow> windows)
    {
        var entries = windows.Select(window =>
        {
            var properties = new List<string>();
            AddTrendJsonString(properties, "name", window.Name);
            AddTrendJsonBoolean(properties, "visible", window.Visible?.StaticValue);
            AddTrendJsonNumber(properties, "spacePortion", window.SpacePortion?.StaticValue);
            AddTrendJsonBoolean(properties, "xAxisGridVisible", window.XAxisGridVisible?.StaticValue);
            AddTrendJsonBoolean(properties, "yAxisGridVisible", window.YAxisGridVisible?.StaticValue);
            AddTrendJsonBoolean(properties, "majorGridVisible", window.MajorGridVisible?.StaticValue);
            AddTrendJsonString(properties, "majorGridColor", window.MajorGridColor?.StaticValue is HmiColor major ? ToCss(major) : null);
            AddTrendJsonBoolean(properties, "minorGridVisible", window.MinorGridVisible?.StaticValue);
            AddTrendJsonString(properties, "minorGridColor", window.MinorGridColor?.StaticValue is HmiColor minor ? ToCss(minor) : null);
            AddTrendJsonBoolean(properties, "gridInTrendColor", window.GridInTrendColor?.StaticValue);
            AddTrendJsonBoolean(properties, "useGraphicValueBar", window.UseGraphicValueBar?.StaticValue);
            AddTrendJsonString(properties, "valueBarColor", window.ValueBarColor?.StaticValue is HmiColor ruler ? ToCss(ruler) : null);
            AddTrendJsonNumber(properties, "valueBarWidth", window.ValueBarWidth?.StaticValue);
            AddTrendJsonBoolean(properties, "useGraphicStatisticRulers", window.UseGraphicStatisticRulers?.StaticValue);
            AddTrendJsonString(properties, "statisticRulerColor", window.StatisticRulerColor?.StaticValue is HmiColor statistic ? ToCss(statistic) : null);
            AddTrendJsonNumber(properties, "statisticRulerWidth", window.StatisticRulerWidth?.StaticValue);
            return "{" + string.Join(",", properties) + "}";
        }).ToArray();
        return entries.Length == 0 ? null : "[" + string.Join(",", entries) + "]";
    }

    // Use the same axis wire fields as legacy per-pen configurations.
    private static string? FormatTrendValueAxes(IEnumerable<HmiTrendValueAxis> axes) =>
        FormatTrendPens(axes.Select((axis, index) => new HmiTrendPen
        {
            Number = index + 1, ValueAxisName = axis.Name, ValueAxisLabel = axis.Label,
            TrendWindowName = axis.TrendWindowName,
            MinimumValue = axis.MinimumValue, MaximumValue = axis.MaximumValue,
            DecimalPlaces = axis.DecimalPlaces, AxisScaleType = axis.ScaleType,
            ExponentialFormat = axis.ExponentialFormat, AutoDecimalPlaces = axis.AutoDecimalPlaces,
            ValueAxisVisible = axis.Visible, ValueAxisColor = axis.Color,
            ValueAxisInTrendColor = axis.InTrendColor, ValueAxisAlignment = axis.Alignment
        }));

    private static string? FormatTrendPens(IEnumerable<HmiTrendPen> pens)
    {
        var entries = pens.Select(pen =>
        {
            var properties = new List<string>
            {
                "\"number\":" + pen.Number.ToString(CultureInfo.InvariantCulture)
            };
            AddTrendJsonString(properties, "name", pen.Name);
            AddTrendJsonString(properties, "label", pen.Label);
            AddTrendJsonString(properties, "trendWindowName", pen.TrendWindowName);
            AddTrendJsonString(properties, "timeAxisName", pen.TimeAxisName);
            AddTrendJsonString(properties, "color", pen.Color?.StaticValue is HmiColor color ? ToCss(color) : null);
            AddTrendJsonBoolean(properties, "visible", pen.Visible?.StaticValue);
            AddTrendJsonNumber(properties, "width", pen.Width?.StaticValue);
            AddTrendJsonNumber(properties, "lineType", pen.LineType?.StaticValue is HmiTrendLineType lineType ? (int)lineType : null);
            AddTrendJsonNumber(properties, "style", pen.Style?.StaticValue is HmiLineStyle style ? (int)style : null);
            AddTrendJsonBoolean(properties, "fill", pen.FillVisible?.StaticValue);
            AddTrendJsonString(properties, "fillColor", pen.FillColor?.StaticValue is HmiColor fillColor ? ToCss(fillColor) : null);
            AddTrendJsonBoolean(properties, "lowerLimitColoring", pen.LowerLimitColoring?.StaticValue);
            AddTrendJsonNumber(properties, "lowerLimit", pen.LowerLimitValue?.StaticValue);
            AddTrendJsonString(properties, "lowerLimitColor", pen.LowerLimitColor?.StaticValue is HmiColor lowerLimitColor ? ToCss(lowerLimitColor) : null);
            AddTrendJsonBoolean(properties, "upperLimitColoring", pen.UpperLimitColoring?.StaticValue);
            AddTrendJsonNumber(properties, "upperLimit", pen.UpperLimitValue?.StaticValue);
            AddTrendJsonString(properties, "upperLimitColor", pen.UpperLimitColor?.StaticValue is HmiColor upperLimitColor ? ToCss(upperLimitColor) : null);
            AddTrendJsonBoolean(properties, "uncertainColoring", pen.UncertainColoring?.StaticValue);
            AddTrendJsonString(properties, "uncertainColor", pen.UncertainColor?.StaticValue is HmiColor uncertainColor ? ToCss(uncertainColor) : null);
            AddTrendJsonBoolean(properties, "showAlarms", pen.ShowAlarms?.StaticValue);
            AddTrendJsonString(properties, "valueAlignment", pen.ValueAlignment?.StaticValue.ToString());
            AddTrendJsonString(properties, "marker", pen.Marker?.StaticValue);
            AddTrendJsonString(properties, "markerColor", pen.MarkerColor?.StaticValue is HmiColor markerColor ? ToCss(markerColor) : null);
            AddTrendJsonNumber(properties, "markerSize", pen.MarkerSize?.StaticValue);
            AddTrendJsonNumber(properties, "minimum", pen.MinimumValue?.StaticValue);
            AddTrendJsonNumber(properties, "maximum", pen.MaximumValue?.StaticValue);
            AddTrendJsonNumber(properties, "axisScaleType", pen.AxisScaleType?.StaticValue is HmiTrendAxisScaleType axisScaleType ? (int)axisScaleType : null);
            AddTrendJsonBoolean(properties, "exponentialFormat", pen.ExponentialFormat?.StaticValue);
            AddTrendJsonBoolean(properties, "autoDecimalPlaces", pen.AutoDecimalPlaces?.StaticValue);
            AddTrendJsonNumber(properties, "decimalPlaces", pen.DecimalPlaces?.StaticValue);
            AddTrendJsonString(properties, "valueAxisName", pen.ValueAxisName);
            AddTrendJsonBoolean(properties, "valueAxisVisible", pen.ValueAxisVisible?.StaticValue);
            AddTrendJsonString(properties, "valueAxisColor", pen.ValueAxisColor?.StaticValue is HmiColor valueAxisColor ? ToCss(valueAxisColor) : null);
            AddTrendJsonBoolean(properties, "valueAxisInTrendColor", pen.ValueAxisInTrendColor?.StaticValue);
            AddTrendJsonString(properties, "valueAxisAlignment", pen.ValueAxisAlignment?.StaticValue.ToString());
            AddTrendJsonString(properties, "valueAxisLabel", pen.ValueAxisLabel);
            AddTrendJsonString(properties, "unit", pen.EngineeringUnit);
            return "{" + string.Join(",", properties) + "}";
        }).ToArray();
        return entries.Length == 0 ? null : "[" + string.Join(",", entries) + "]";
    }

    private static void AddTrendJsonString(ICollection<string> properties, string name, string? value)
    {
        if (value != null)
            properties.Add(JsonQuote(name) + ":" + JsonQuote(value));
    }

    private static void AddTrendJsonBoolean(ICollection<string> properties, string name, bool? value)
    {
        if (value.HasValue)
            properties.Add(JsonQuote(name) + ":" + (value.Value ? "true" : "false"));
    }

    private static void AddTrendJsonNumber(ICollection<string> properties, string name, double? value)
    {
        if (value.HasValue && !double.IsNaN(value.Value) && !double.IsInfinity(value.Value))
            properties.Add(JsonQuote(name) + ":" + value.Value.ToString("R", CultureInfo.InvariantCulture));
    }

    private static string JsonQuote(string value)
    {
        var result = new StringBuilder(value.Length + 2).Append('"');
        foreach (var character in value)
        {
            switch (character)
            {
                case '"': result.Append("\\\""); break;
                case '\\': result.Append("\\\\"); break;
                case '\b': result.Append("\\b"); break;
                case '\f': result.Append("\\f"); break;
                case '\n': result.Append("\\n"); break;
                case '\r': result.Append("\\r"); break;
                case '\t': result.Append("\\t"); break;
                default:
                    if (character < ' ')
                        result.Append("\\u").Append(((int)character).ToString("X4", CultureInfo.InvariantCulture));
                    else
                        result.Append(character);
                    break;
            }
        }
        return result.Append('"').ToString();
    }

    private static void AppendBooleanAttribute(StringBuilder html, string name, bool value)
    {
        if (!value)
            return;

        html.Append(' ').Append(name);
    }

    private static void AppendTextAttribute(
        StringBuilder html,
        string name,
        HmiProperty<HmiMultilingualText>? property,
        HmiHtmlConvertContext context)
    {
        var value = ResolveStaticValue(property, context);
        if (value == null)
            return;

        AppendAttribute(html, name, value.GetDisplayText(context.CultureInfo));
    }

    private static void AppendStaticAttribute<T>(StringBuilder html, string name, HmiProperty<T>? property)
    {
        AppendStaticAttribute(html, name, property, null);
    }

    private static void AppendStaticAttribute<T>(
        StringBuilder html,
        string name,
        HmiProperty<T>? property,
        HmiHtmlConvertContext? context)
    {
        if (property == null)
            return;

        var resolvedValue = context.HasValue ? ResolveStaticValue(property, context.Value) : property.StaticValue;
        if (resolvedValue == null)
            return;

        object value = resolvedValue;
        if (value is bool boolean)
        {
            AppendBooleanAttribute(html, name, boolean);
            return;
        }

        AppendAttribute(html, name, FormatAttributeValue(value));
    }

    private static T? ResolveStaticValue<T>(HmiProperty<T>? property, HmiHtmlConvertContext context)
    {
        if (property is HmiFaceplateInterfaceProperty<T> faceplateInterfaceProperty &&
            context.TryGetFaceplateInterfaceValue(faceplateInterfaceProperty.InterfaceName, out var interfaceValue) &&
            TryConvertFaceplateInterfaceValue(interfaceValue, out T? converted))
        {
            return converted;
        }

        return property == null ? default : property.StaticValue;
    }

    private static bool TryConvertFaceplateInterfaceValue<T>(object? value, out T? converted)
    {
        if (value is T typed)
        {
            converted = typed;
            return true;
        }

        if (typeof(T) == typeof(HmiMultilingualText) && value is string text)
        {
            converted = (T)(object)HmiMultilingualText.FromText(text);
            return true;
        }

        if (typeof(T) == typeof(string) && value is HmiMultilingualText multilingualText)
        {
            converted = (T)(object)(multilingualText.GetDisplayText(null) ?? string.Empty);
            return true;
        }

        try
        {
            if (value != null)
            {
                converted = (T)Convert.ChangeType(value, typeof(T), CultureInfo.InvariantCulture);
                return true;
            }
        }
        catch
        {
        }

        converted = default;
        return false;
    }

    private static string? FormatAttributeValue(object? value)
    {
        if (value == null)
            return null;
        if (value is bool boolean)
            return boolean ? "true" : "false";
        if (value is HmiColor color)
            return ToCss(color);
        if (value is IFormattable formattable)
            return formattable.ToString(null, CultureInfo.InvariantCulture);
        return value.ToString();
    }

    private static void AppendMultilingualText(StringBuilder html, HmiMultilingualText? text, HmiHtmlConvertContext context)
    {
        if (text == null)
            return;

        var formattedBody = text.GetFormattedTextBody(context.CultureInfo);
        if (!string.IsNullOrWhiteSpace(formattedBody))
        {
            html.Append(formattedBody);
            return;
        }

        html.Append(WebUtility.HtmlEncode(text.GetText(context.CultureInfo)));
    }

    private static string? FormatFont(HmiFont? font)
    {
        if (font == null)
            return null;

        var values = new List<string>();
        AddFontValue(values, "name", font.Name);
        AddFontValue(values, "size", font.Size);
        AddFontValue(values, "characterWidth", font.CharacterWidth);
        AddFontValue(values, "escapementAngle", font.EscapementAngle);
        AddFontValue(values, "orientationAngle", font.OrientationAngle);
        AddFontValue(values, "weight", font.Weight);
        AddFontValue(values, "bold", font.Bold);
        AddFontValue(values, "italic", font.Italic);
        AddFontValue(values, "underline", font.Underline);
        AddFontValue(values, "strikethrough", font.Strikethrough);
        AddFontValue(values, "characterSet", font.CharacterSet);
        AddFontValue(values, "outputPrecision", font.OutputPrecision);
        AddFontValue(values, "clippingPrecision", font.ClippingPrecision);
        AddFontValue(values, "quality", font.Quality);
        AddFontValue(values, "pitchAndFamily", font.PitchAndFamily);

        return values.Count == 0 ? null : "{" + string.Join(",", values) + "}";
    }

    private static void AddFontValue<T>(List<string> values, string name, HmiProperty<T>? property)
    {
        if (property == null || property.StaticValue == null)
            return;

        values.Add("\"" + EscapeJsonString(name) + "\":" + FormatJsonValue(property.StaticValue));
    }

    private static string FormatJsonValue(object value)
    {
        if (value is bool boolean)
            return boolean ? "true" : "false";
        if (value is string text)
            return "\"" + EscapeJsonString(text) + "\"";
        if (value is IFormattable formattable)
            return formattable.ToString(null, CultureInfo.InvariantCulture);
        return "\"" + EscapeJsonString(value.ToString() ?? string.Empty) + "\"";
    }

    private static string EscapeJsonString(string value)
    {
        var escaped = new StringBuilder();
        foreach (var character in value)
        {
            switch (character)
            {
                case '\\':
                    escaped.Append("\\\\");
                    break;
                case '"':
                    escaped.Append("\\\"");
                    break;
                case '\b':
                    escaped.Append("\\b");
                    break;
                case '\f':
                    escaped.Append("\\f");
                    break;
                case '\n':
                    escaped.Append("\\n");
                    break;
                case '\r':
                    escaped.Append("\\r");
                    break;
                case '\t':
                    escaped.Append("\\t");
                    break;
                default:
                    escaped.Append(character);
                    break;
            }
        }

        return escaped.ToString();
    }

    private static string? FormatDynamicSvgPropertyValue(object? value)
    {
        if (value == null)
            return null;
        if (value is bool boolean)
            return boolean ? "true" : "false";
        if (value is HmiColor color)
            return ToHmiColor(color);
        if (value is IFormattable formattable)
            return formattable.ToString(null, CultureInfo.InvariantCulture);
        return value.ToString();
    }

    private static string? ToDynamicSvgAttributeName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return null;

        var result = new StringBuilder();
        for (var i = 0; i < name!.Length; i++)
        {
            var character = name[i];
            if (char.IsUpper(character))
            {
                if (i > 0)
                    result.Append('-');
                result.Append(char.ToLowerInvariant(character));
            }
            else
            {
                result.Append(character);
            }
        }

        return result.ToString();
    }

    private static void AppendDiv(StringBuilder html, HmiScreenItemBase item, string? cssClass, string? content, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, item, context);
        AppendAttribute(html, "class", cssClass);
        html.Append(">");
        if (!string.IsNullOrEmpty(content))
            html.Append(WebUtility.HtmlEncode(content));
        html.Append("</div>");
    }

    private static void AppendCommonAttributes(
        StringBuilder html,
        HmiScreenItemBase item,
        HmiHtmlConvertContext context,
        bool includePaintedStyle = true,
        string? additionalStyle = null)
    {
        AppendAttribute(html, "id", item.Name);
        AppendTextAttribute(html, "title", item.ToolTipText, context);
        AppendStaticAttribute(html, "tabindex", item.TabIndex, context);
        AppendAttribute(html, "data-hmi-security-code", item.SecurityCode);
        AppendStaticAttribute(html, "data-adapt-border-to-content", item.AdaptBorderToContent, context);
        AppendDisabledAttribute(html, item, context);
        AppendHotKeyAttributes(html, item, context);
        html.Append(" style=\"position: absolute;");
        AppendPosition(html, item, context);
        AppendAdaptBorderToContentStyle(html, item, context);
        AppendDisabledStyle(html, item, context);
        AppendOpacity(html, item, context);
        AppendDesignShadow(html, item, context);
        if (includePaintedStyle && item is HmiPaintedScreenItemBase paintedItem)
            AppendStyle(html, paintedItem, context);
        if (!string.IsNullOrWhiteSpace(additionalStyle))
            html.Append(additionalStyle);
        AppendItemTransform(html, item);
        html.Append("\"");
    }

    private static void AppendItemTransform(StringBuilder html, HmiScreenItemBase item)
    {
        if (item.RotationAngle == null)
            return;

        html.Append("transform: rotate(").Append(ToCss(item.RotationAngle.GetStaticValueOrDefault())).Append("deg);");
        if (item.RotationCenterX != null && item.RotationCenterY != null)
        {
            html.Append("transform-origin: ")
                .Append(ToCss(item.RotationCenterX.GetStaticValueOrDefault()))
                .Append("px ")
                .Append(ToCss(item.RotationCenterY.GetStaticValueOrDefault()))
                .Append("px;");
        }
        else
        {
            html.Append("transform-origin: center;");
        }
    }

    private static void AppendSymbolAttributes(StringBuilder html, HmiSymbolContainer symbolContainer, HmiHtmlConvertContext context)
    {
        AppendAttribute(html, "id", symbolContainer.Name);
        AppendTextAttribute(html, "title", symbolContainer.ToolTipText, context);
        AppendStaticAttribute(html, "tabindex", symbolContainer.TabIndex, context);
        AppendAttribute(html, "data-hmi-security-code", symbolContainer.SecurityCode);
        AppendDisabledAttribute(html, symbolContainer, context);
        AppendAttribute(html, "data-hmi-fill-color-mode", symbolContainer.FillColorMode == null ? null : symbolContainer.FillColorMode.StaticValue.ToString());
        AppendAttribute(html, "data-hmi-flip", symbolContainer.Flip == null ? null : symbolContainer.Flip.StaticValue.ToString());
        html.Append(" style=\"position: absolute; overflow: hidden;");
        AppendPosition(html, symbolContainer, context);
        AppendDisabledStyle(html, symbolContainer, context);
        AppendOpacity(html, symbolContainer, context);
        AppendDesignShadow(html, symbolContainer, context);
        AppendStyle(html, symbolContainer, context);
        AppendSymbolTransform(html, symbolContainer);
        html.Append("\"");
    }

    private static void AppendSymbolTransform(StringBuilder html, HmiSymbolContainer symbolContainer)
    {
        var transforms = new List<string>();
        var flip = symbolContainer.Flip.GetStaticValueOrDefault(HmiSymbolFlipMode.None);
        switch (flip)
        {
            case HmiSymbolFlipMode.Horizontal:
                transforms.Add("scaleX(-1)");
                break;
            case HmiSymbolFlipMode.Vertical:
                transforms.Add("scaleY(-1)");
                break;
            case HmiSymbolFlipMode.HorizontalAndVertical:
                transforms.Add("scale(-1, -1)");
                break;
        }

        if (symbolContainer.RotationAngle != null)
            transforms.Add("rotate(" + ToCss(symbolContainer.RotationAngle.GetStaticValueOrDefault()) + "deg)");

        if (transforms.Count > 0)
            html.Append("transform: ").Append(string.Join(" ", transforms)).Append(";transform-origin: center;");
    }

    private static void AppendPosition(StringBuilder html, HmiScreenItemBase item, HmiHtmlConvertContext context)
    {
        html.Append("left: ").Append(ToCss(item.X.GetStaticValueOrDefault() + context.PositionOffsetX)).Append("px;");
        html.Append("top: ").Append(ToCss(item.Y.GetStaticValueOrDefault() + context.PositionOffsetY)).Append("px;");
        AppendSize(html, item.Width.GetStaticValueOrDefault(), item.Height.GetStaticValueOrDefault());
    }

    private static void AppendOpacity(StringBuilder html, HmiScreenItemBase item, HmiHtmlConvertContext context)
    {
        var opacity = context.EffectiveProperties.Resolve(item, nameof(HmiScreenItemBase.Opacity), item.Opacity);
        if (opacity?.StaticValue is double value)
            html.Append("opacity: ").Append(ToCss(Clamp(value, 0d, 1d))).Append(';');
    }

    private static void AppendAdaptBorderToContentStyle(
        StringBuilder html,
        HmiScreenItemBase item,
        HmiHtmlConvertContext context)
    {
        if (ResolveStaticValue(item.AdaptBorderToContent, context))
            html.Append("width: max-content;height: max-content;white-space: nowrap;");
    }

    private static void AppendDisabledAttribute(StringBuilder html, HmiScreenItemBase item, HmiHtmlConvertContext context)
    {
        if (!ResolveStaticValue(item.Enabled, context))
            AppendAttribute(html, "aria-disabled", "true");
        if (item is HmiPaintedScreenItemBase paintedItem)
        {
            AppendStaticValueAttribute(html, "data-disabled-foreground-color", paintedItem.DisabledForegroundColor, context);
            AppendStaticValueAttribute(html, "data-disabled-foreground-shadow-color", paintedItem.DisabledForegroundShadowColor, context);
            AppendStaticValueAttribute(html, "data-use-disabled-foreground-color", paintedItem.UseDisabledForegroundColor, context);
        }
    }

    private static void AppendDisabledStyle(StringBuilder html, HmiScreenItemBase item, HmiHtmlConvertContext context)
    {
        if (!ResolveStaticValue(item.Enabled, context))
            html.Append("pointer-events: none;");
    }

    private static void AppendHotKeyAttributes(StringBuilder html, HmiScreenItemBase item, HmiHtmlConvertContext context)
    {
        var hotKeyProperty = item switch
        {
            HmiButtonBase button => button.HotKey,
            HmiIOField ioField => ioField.HotKey,
            _ => null
        };
        var hotKey = ResolveStaticValue(hotKeyProperty, context);
        if (string.IsNullOrWhiteSpace(hotKey))
            return;

        AppendAttribute(html, "data-hmi-hot-key", hotKey);
        AppendAttribute(html, "aria-keyshortcuts", ToAriaKeyShortcuts(hotKey));
    }

    private static string ToAriaKeyShortcuts(string hotKey) =>
        string.Join("+", hotKey.Split('+').Select(part => part.ToUpperInvariant() switch
        {
            "CTRL" => "Control",
            "WIN" => "Meta",
            _ => part
        }));

    private static void AppendDesignShadow(StringBuilder html, HmiScreenItemBase item, HmiHtmlConvertContext context)
    {
        HmiProperty<bool>? configuredShadow = item switch
        {
            HmiShapeBase shape => shape.UseDesignShadowSettings,
            HmiWidgetBase widget => widget.UseDesignShadowSettings,
            HmiWindowBase window => window.UseDesignShadowSettings,
            _ => null
        };
        var useDesignShadow = context.EffectiveProperties.Resolve(item, nameof(HmiShapeBase.UseDesignShadowSettings), configuredShadow);
        if (useDesignShadow.GetStaticValueOrDefault())
            html.Append("filter: drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.35));");
    }

    private static void AppendSize(StringBuilder html, double width, double height)
    {
        if (width > 0)
            html.Append("width: ").Append(ToCss(width)).Append("px;");
        if (height > 0)
            html.Append("height: ").Append(ToCss(height)).Append("px;");
    }

    private static void AppendScreenStyle(StringBuilder html, HmiScreenBase screen, string? backgroundImageUri)
    {
        if (screen.BackgroundColor != null)
            html.Append("background-color: ").Append(ToCss(screen.BackgroundColor.StaticValue)).Append(";");
        if (screen.FillPattern is not null)
        {
            AppendFillPatternStyle(
                html,
                screen.FillPattern.StaticValue,
                screen.PatternColor?.StaticValue ?? HmiColor.FromArgb(255, 0, 0, 0));
            AppendScreenFillPatternAlignment(html, screen);
        }
        AppendColorGradientStyle(html, GetColorGradient(screen));
        if (!string.IsNullOrWhiteSpace(backgroundImageUri))
        {
            html.Append("background-image: url(&quot;").Append(WebUtility.HtmlEncode(backgroundImageUri)).Append("&quot;);");
            switch (screen.BackgroundImageLayout?.StaticValue ?? HmiBackgroundImageLayout.Normal)
            {
                case HmiBackgroundImageLayout.Tile:
                    html.Append("background-repeat: repeat;background-size: auto;");
                    break;
                case HmiBackgroundImageLayout.StretchToViewport:
                case HmiBackgroundImageLayout.StretchToScreen:
                    html.Append("background-repeat: no-repeat;background-size: 100% 100%;");
                    break;
                default:
                    html.Append("background-repeat: no-repeat;background-size: auto;");
                    break;
            }
        }
    }

    private static void AppendScreenFillPatternAlignment(StringBuilder html, HmiScreenBase screen)
    {
        if (screen.FillPatternAlignment?.StaticValue != HmiFillPatternAlignment.StretchToViewport ||
            screen.FillPattern?.StaticValue is HmiFillPattern.Solid or HmiFillPattern.Transparent)
            return;

        var width = screen.Width.GetStaticValueOrDefault();
        var height = screen.Height.GetStaticValueOrDefault();
        if (width <= 0 || height <= 0)
            return;

        var tileSize = screen.FillPattern?.StaticValue is HmiFillPattern.CheckersFiner or HmiFillPattern.DiagonalCrossFiner ? 4d : 8d;
        html.Append("background-size: ")
            .Append(ToCss(tileSize / width * 100d)).Append("% ")
            .Append(ToCss(tileSize / height * 100d)).Append("%;");
    }

    private static void AppendStyle(StringBuilder html, HmiPaintedScreenItemBase item, HmiHtmlConvertContext context)
    {
        var foregroundColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.ForegroundColor), item.ForegroundColor);
        var useDisabledForegroundColor = !ResolveStaticValue(item.Enabled, context) &&
            ResolveStaticValue(item.UseDisabledForegroundColor, context);
        if (useDisabledForegroundColor)
        {
            foregroundColor = context.EffectiveProperties.Resolve(
                item,
                nameof(HmiPaintedScreenItemBase.DisabledForegroundColor),
                item.DisabledForegroundColor) ?? foregroundColor;
        }
        var backgroundColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BackgroundColor), item.BackgroundColor);
        var borderColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BorderColor), item.BorderColor);
        var borderWidth = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BorderWidth), item.BorderWidth);
        var borderStyle = GetBorderStyleCss(item, context);
        var margin = item.Margin;
        var padding = item.Padding;
        var font = GetFont(item);
        var horizontalAlignment = context.EffectiveProperties.Resolve(item, "HorizontalAlignment", GetHorizontalAlignment(item));
        var verticalAlignment = context.EffectiveProperties.Resolve(item, "VerticalAlignment", GetVerticalAlignment(item));
        var suppressBorderStyle = item is HmiCheckBoxGroup or HmiRadioButtonGroup;
        var animations = new List<string>();

        if (foregroundColor is HmiBlinkProperty<HmiColor> foregroundBlink &&
            foregroundBlink.StaticValue is HmiColor foregroundOff &&
            foregroundBlink.BlinkValue is HmiColor foregroundOn)
        {
            html.Append("--hmi-foreground-color-off: ").Append(ToCss(foregroundOff)).Append(';')
                .Append("--hmi-foreground-color-on: ").Append(ToCss(foregroundOn)).Append(';');
            animations.Add($"hmi-foreground-color-flash {GetBlinkDuration(foregroundBlink.Rate)}s steps(1, end) infinite");
        }
        else if (foregroundColor?.StaticValue != null)
        {
            html.Append("color: ").Append(ToCss(foregroundColor.StaticValue)).Append(";");
        }
        if (useDisabledForegroundColor &&
            context.EffectiveProperties.Resolve(
                item,
                nameof(HmiPaintedScreenItemBase.DisabledForegroundShadowColor),
                item.DisabledForegroundShadowColor)?.StaticValue is HmiColor disabledShadowColor)
        {
            html.Append("text-shadow: 1px 1px ").Append(ToCss(disabledShadowColor)).Append(';');
        }
        if (backgroundColor is HmiBlinkProperty<HmiColor> backgroundBlink &&
            backgroundBlink.StaticValue is HmiColor backgroundOff &&
            backgroundBlink.BlinkValue is HmiColor backgroundOn &&
            item is not HmiGauge)
        {
            html.Append("--hmi-background-color-off: ").Append(ToCss(backgroundOff)).Append(';')
                .Append("--hmi-background-color-on: ").Append(ToCss(backgroundOn)).Append(';');
            animations.Add($"hmi-background-color-flash {GetBlinkDuration(backgroundBlink.Rate)}s steps(1, end) infinite");
        }
        else if (backgroundColor?.StaticValue != null && item is not HmiGauge)
        {
            html.Append("background-color: ").Append(ToCss(backgroundColor.StaticValue)).Append(";");
        }
        if (borderColor is HmiBlinkProperty<HmiColor> borderBlink &&
            borderBlink.StaticValue is HmiColor borderOff && borderBlink.BlinkValue is HmiColor borderOn)
        {
            html.Append("--hmi-border-color-off: ").Append(ToCss(borderOff)).Append(';')
                .Append("--hmi-border-color-on: ").Append(ToCss(borderOn)).Append(';');
            animations.Add($"hmi-border-color-flash {GetBlinkDuration(borderBlink.Rate)}s steps(1, end) infinite");
        }
        else if (borderColor?.StaticValue != null)
        {
            html.Append("border-color: ").Append(ToCss(borderColor.StaticValue)).Append(";");
        }
        if (animations.Count > 0)
            html.Append("animation: ").Append(string.Join(", ", animations)).Append(';');
        if (borderWidth?.StaticValue != null)
        {
            if (!suppressBorderStyle)
                html.Append("border-style: ").Append(borderStyle).Append(";");
            html.Append("border-width: ").Append(ToCss(borderWidth.StaticValue)).Append("px;");
        }

        if (item is HmiShapeBase shape)
        {
            if (shape.LineColor != null)
                html.Append("border-color: ").Append(ToCss(shape.LineColor.StaticValue)).Append(";");
            if (shape.LineWidth != null)
            {
                html.Append("border-style: ").Append(borderStyle).Append(";");
                html.Append("border-width: ").Append(ToCss(shape.LineWidth.StaticValue)).Append("px;");
            }
        }
        AppendFillPatternStyle(html, item, context);
        AppendColorGradientStyle(html, GetColorGradient(item));
        if (margin != null)
        {
            html.Append("margin: ")
                .Append(ToCss(margin.Top.GetStaticValueOrDefault())).Append("px ")
                .Append(ToCss(margin.Right.GetStaticValueOrDefault())).Append("px ")
                .Append(ToCss(margin.Bottom.GetStaticValueOrDefault())).Append("px ")
                .Append(ToCss(margin.Left.GetStaticValueOrDefault())).Append("px;");
        }
        if (padding != null)
        {
            html.Append("padding: ")
                .Append(ToCss(padding.Top.GetStaticValueOrDefault())).Append("px ")
                .Append(ToCss(padding.Right.GetStaticValueOrDefault())).Append("px ")
                .Append(ToCss(padding.Bottom.GetStaticValueOrDefault())).Append("px ")
                .Append(ToCss(padding.Left.GetStaticValueOrDefault())).Append("px;");
        }
        if (font != null)
        {
            var name = font.Name.GetStaticValue();
            if (!string.IsNullOrWhiteSpace(name))
                html.Append("font-family: ").Append(WebUtility.HtmlEncode(name)).Append(";");
            if (TryGetStaticValue(font.Size, out var size))
                html.Append("font-size: ").Append(ToCss(size)).Append("px;");
            if (font.Bold.GetStaticValueOrDefault())
                html.Append("font-weight: bold;");
            if (font.Italic.GetStaticValueOrDefault())
                html.Append("font-style: italic;");
            if (font.Underline.GetStaticValueOrDefault())
                html.Append("text-decoration: underline;");
        }
        if (horizontalAlignment != null)
        {
            html.Append("text-align: ").Append(ToCss(horizontalAlignment.StaticValue)).Append(";");
            html.Append("justify-content: ").Append(ToFlexCss(horizontalAlignment.StaticValue)).Append(";");
        }
        if (verticalAlignment != null)
        {
            html.Append("display: flex;");
            html.Append("align-items: ").Append(ToCss(verticalAlignment.StaticValue)).Append(";");
        }
    }

    private static string GetBorderStyleCss(HmiPaintedScreenItemBase item, HmiHtmlConvertContext context)
    {
        int? style = null;
        if (item is HmiShapeBase shape
            && context.EffectiveProperties.TryGetStaticValue(shape, nameof(HmiShapeBase.DashType), shape.DashType, out var dashType))
        {
            style = dashType;
        }
        else if (context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiPaintedScreenItemBase.BorderStyle), item.BorderStyle, out var borderStyle))
        {
            style = borderStyle;
        }

        return (HmiLineStyle?)style switch
        {
            HmiLineStyle.None => "none",
            HmiLineStyle.Dash or HmiLineStyle.DashDot or HmiLineStyle.DashDotDot => "dashed",
            HmiLineStyle.Dot => "dotted",
            HmiLineStyle.Double => "double",
            HmiLineStyle.Style3D => "groove",
            _ => "solid"
        };
    }

    private static HmiFont? GetFont(HmiScreenItemBase item)
    {
        if (item is HmiText text)
            return text.Font;
        if (item is HmiAlarmIndicator alarmIndicator)
            return alarmIndicator.Font;
        if (item is HmiWidgetBase widget)
            return widget.Font;
        return null;
    }

    private static HmiProperty<HmiHorizontalAlignment>? GetHorizontalAlignment(HmiScreenItemBase item)
    {
        if (item is HmiText text)
            return text.HorizontalAlignment;
        if (item is HmiAlarmIndicator alarmIndicator)
            return alarmIndicator.HorizontalAlignment;
        if (item is HmiWidgetBase widget)
            return widget.HorizontalAlignment;
        return null;
    }

    private static HmiProperty<HmiVerticalAlignment>? GetVerticalAlignment(HmiScreenItemBase item)
    {
        if (item is HmiText text)
            return text.VerticalAlignment;
        if (item is HmiAlarmIndicator alarmIndicator)
            return alarmIndicator.VerticalAlignment;
        if (item is HmiWidgetBase widget)
            return widget.VerticalAlignment;
        return null;
    }

    private static void AppendAttribute(StringBuilder html, string? name, string? value)
    {
        if (string.IsNullOrWhiteSpace(name))
            return;
        if (string.IsNullOrWhiteSpace(value))
            return;

        html.Append(' ')
            .Append(name)
            .Append("=\"")
            .Append(WebUtility.HtmlEncode(value))
            .Append('"');
    }

    private static string ToCss(double value)
    {
        return value.ToString("0.###", CultureInfo.InvariantCulture);
    }

    private static string ToCss(HmiColor color)
    {
        if (color.Alpha == 255)
            return "#" + color.Red.ToString("X2", CultureInfo.InvariantCulture) + color.Green.ToString("X2", CultureInfo.InvariantCulture) + color.Blue.ToString("X2", CultureInfo.InvariantCulture);

        return "rgba(" +
            color.Red.ToString(CultureInfo.InvariantCulture) + "," +
            color.Green.ToString(CultureInfo.InvariantCulture) + "," +
            color.Blue.ToString(CultureInfo.InvariantCulture) + "," +
            (color.Alpha / 255d).ToString("0.###", CultureInfo.InvariantCulture) + ")";
    }

    private static string ToHmiColor(HmiColor color)
    {
        return "0x" +
            color.Alpha.ToString("X2", CultureInfo.InvariantCulture) +
            color.Red.ToString("X2", CultureInfo.InvariantCulture) +
            color.Green.ToString("X2", CultureInfo.InvariantCulture) +
            color.Blue.ToString("X2", CultureInfo.InvariantCulture);
    }

    private static string ToCss(HmiHorizontalAlignment alignment)
    {
        switch (alignment)
        {
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

    private static string ToCss(HmiVerticalAlignment alignment)
    {
        switch (alignment)
        {
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

    private static string ToCss(HmiGradientDirection direction) => direction switch
    {
        HmiGradientDirection.HorizontalFromRight => "to left",
        HmiGradientDirection.VerticalFromTop or HmiGradientDirection.VerticalFromCenter => "to bottom",
        HmiGradientDirection.VerticalFromBottom => "to top",
        HmiGradientDirection.DiagonalUp => "to top right",
        HmiGradientDirection.DiagonalDown => "to bottom right",
        _ => "to right"
    };

    private static string ToCss(HmiLineCap lineCap) => lineCap switch
    {
        HmiLineCap.Round => "round",
        HmiLineCap.Square => "square",
        _ => "butt"
    };

    private static string ToFlexCss(HmiHorizontalAlignment alignment)
    {
        switch (alignment)
        {
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

    private readonly struct HmiHtmlConvertContext
    {
        public HmiHtmlConvertContext(
            HmiHtmlConvertOptions options,
            HmiEffectivePropertyResolver effectiveProperties,
            double positionOffsetX = 0,
            double positionOffsetY = 0,
            IReadOnlyDictionary<string, HmiFaceplateInterfaceValue>? faceplateInterfaceValues = null)
        {
            Options = options;
            EffectiveProperties = effectiveProperties;
            PositionOffsetX = positionOffsetX;
            PositionOffsetY = positionOffsetY;
            FaceplateInterfaceValues = faceplateInterfaceValues ?? EmptyFaceplateInterfaceValues;
        }

        public HmiHtmlConvertOptions Options { get; }

        public HmiEffectivePropertyResolver EffectiveProperties { get; }

        public CultureInfo? CultureInfo => GetCultureInfo(Options.CultureLcid);

        public double PositionOffsetX { get; }

        public double PositionOffsetY { get; }

        public IReadOnlyDictionary<string, HmiFaceplateInterfaceValue> FaceplateInterfaceValues { get; }

        public HmiHtmlConvertContext WithPositionOffset(double offsetX, double offsetY)
        {
            return new HmiHtmlConvertContext(
                Options,
                EffectiveProperties,
                PositionOffsetX + offsetX,
                PositionOffsetY + offsetY,
                FaceplateInterfaceValues);
        }

        public HmiHtmlConvertContext WithFaceplateInterfaceValues(IEnumerable<HmiFaceplateInterfaceValue> values)
        {
            var dictionary = values
                .Where(value => !string.IsNullOrWhiteSpace(value.Name) && !value.IsTagBinding)
                .GroupBy(value => value.Name!, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

            return new HmiHtmlConvertContext(
                Options,
                EffectiveProperties,
                PositionOffsetX,
                PositionOffsetY,
                dictionary);
        }

        public bool TryGetFaceplateInterfaceValue(string? name, out object? value)
        {
            value = null;
            if (string.IsNullOrWhiteSpace(name) ||
                !FaceplateInterfaceValues.TryGetValue(name!, out var interfaceValue) ||
                interfaceValue.Value == null)
                return false;

            value = interfaceValue.Value;
            return true;
        }

        private static CultureInfo? GetCultureInfo(int? lcid)
        {
            if (lcid == null)
                return null;

            try
            {
                return new CultureInfo(lcid.Value);
            }
            catch (CultureNotFoundException)
            {
                return null;
            }
        }

        private static readonly IReadOnlyDictionary<string, HmiFaceplateInterfaceValue> EmptyFaceplateInterfaceValues =
            new Dictionary<string, HmiFaceplateInterfaceValue>();
    }
}
