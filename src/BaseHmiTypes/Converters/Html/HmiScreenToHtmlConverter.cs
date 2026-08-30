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
    public async ValueTask<string> ConvertAsync(
        HmiScreenBase screen,
        IHmiProject? project = null,
        HmiHtmlConvertOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        options ??= new HmiHtmlConvertOptions();
        var context = new HmiHtmlConvertContext(options, new HmiEffectivePropertyResolver(ResolveDefaultProfile(project)));
        return await ConvertCoreAsync(screen, project, context, true, new HashSet<string>(StringComparer.OrdinalIgnoreCase), cancellationToken).ConfigureAwait(false);
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
        ISet<string> screenStack,
        CancellationToken cancellationToken)
    {
        var currentKeys = GetScreenReferenceKeys(screen).ToList();
        foreach (var key in currentKeys)
            screenStack.Add(key);

        try
        {
            var html = new StringBuilder();
            if (includeRuntime && context.Options.IncludeMetaCharset)
                html.Append("<meta charset=\"utf-8\">");
            if (includeRuntime)
                AppendGlobalStyle(html);
            if (includeRuntime)
                AppendRuntimeModule(html);

            html.Append("<div");
            AppendAttribute(html, "id", screen.Name);
            html.Append(" style=\"position: relative; overflow: hidden;");
            AppendSize(html, screen.Width.GetStaticValueOrDefault(), screen.Height.GetStaticValueOrDefault());
            AppendScreenStyle(html, screen);
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
            foreach (var key in currentKeys)
                screenStack.Remove(key);
        }
    }

    private async ValueTask AppendItemAsync(
        StringBuilder html,
        HmiScreenItemBase item,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        ISet<string> screenStack,
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
                AppendSymbolicInput(html, symbolicIoField, context);
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
        ISet<string> screenStack,
        CancellationToken cancellationToken)
    {
        html.Append("<div");
        AppendCommonAttributes(html, container, context);
        html.Append(">");
        if (container is HmiLayoutContainerBase { ChildCoordinateSpace: HmiChildCoordinateSpace.ScreenAbsolute } layoutContainer)
        {
            var childContext = context.WithPositionOffset(
                -layoutContainer.X.GetStaticValueOrDefault(),
                -layoutContainer.Y.GetStaticValueOrDefault());
            foreach (var child in items)
                await AppendItemAsync(html, child, project, childContext, screenStack, cancellationToken).ConfigureAwait(false);
        }
        else
        {
            foreach (var child in items)
                await AppendItemAsync(html, child, project, context, screenStack, cancellationToken).ConfigureAwait(false);
        }
        html.Append("</div>");
    }

    private async ValueTask AppendOcxControlAsync(
        StringBuilder html,
        HmiOcxControl ocxControl,
        IHmiProject? project,
        HmiHtmlConvertContext context,
        ISet<string> screenStack,
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
        ISet<string> screenStack,
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
        ISet<string> screenStack,
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
        ISet<string> screenStack,
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
        ISet<string> screenStack,
        CancellationToken cancellationToken)
    {
        HmiScreenBase? resolved = null;
        if (project != null && !string.IsNullOrWhiteSpace(screenWindow.ScreenId?.StaticValue))
            resolved = await project.GetScreenAsync(screenWindow.ScreenId!.StaticValue!, cancellationToken).ConfigureAwait(false);

        html.Append("<div");
        AppendCommonAttributes(html, screenWindow, context);
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
            html.Append(await ConvertCoreAsync(resolved, project, context, false, screenStack, cancellationToken).ConfigureAwait(false));
        }

        html.Append("</div>");
    }

    private static async ValueTask<HmiScreenBase?> ResolveTemplateAsync(
        HmiScreenBase screen,
        IHmiProject? project,
        ISet<string> screenStack,
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

        if (template == null || GetScreenReferenceKeys(template).Any(screenStack.Contains))
            return null;

        return template;
    }

    private static IEnumerable<string> GetScreenReferenceKeys(HmiScreenBase screen)
    {
        if (!string.IsNullOrWhiteSpace(screen.Id))
            yield return "id:" + screen.Id;
        if (!string.IsNullOrWhiteSpace(screen.Name))
            yield return "name:" + screen.Name;
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
        html.Append("></line></svg>");
    }

    private static void AppendPointShape(StringBuilder html, HmiPointBasedShapeBase shape, string elementName, bool fill, HmiHtmlConvertContext context)
    {
        AppendSvgOpen(html, shape, GetSvgWidth(shape), GetSvgHeight(shape), context);
        html.Append('<').Append(elementName);
        AppendAttribute(html, "points", string.Join(" ", shape.Points.Select(point => ToSvgPoint(shape, point))));
        AppendStrokeAttributes(html, shape, fill ? GetFillColor(shape, context) : null, context);
        html.Append("></").Append(elementName).Append("></svg>");
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
        html.Append("></circle></svg>");
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
        html.Append("></ellipse></svg>");
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
        html.Append("></path></svg>");
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
        AppendAttribute(html, "fill", fillColor == null ? "none" : ToCss(fillColor.Value));
        AppendAttribute(html, "stroke", ToCss(GetStrokeColor(item, context)));
        AppendSvgAttribute(html, "stroke-width", GetStrokeWidth(item, context));
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

    private static HmiColor GetStrokeColor(HmiShapeBase item, HmiHtmlConvertContext context)
    {
        if (context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiShapeBase.LineColor), item.LineColor, out var lineColor))
            return lineColor;
        if (item is HmiPaintedScreenItemBase paintedItem
            && context.EffectiveProperties.TryGetStaticValue(paintedItem, nameof(HmiPaintedScreenItemBase.BorderColor), paintedItem.BorderColor, out var borderColor))
            return borderColor;
        if (item is HmiPaintedScreenItemBase foregroundItem
            && context.EffectiveProperties.TryGetStaticValue(foregroundItem, nameof(HmiPaintedScreenItemBase.ForegroundColor), foregroundItem.ForegroundColor, out var foregroundColor))
            return foregroundColor;

        return HmiColor.FromArgb(255, 0, 0, 0);
    }

    private static HmiColor? GetFillColor(HmiShapeBase item, HmiHtmlConvertContext context)
    {
        return context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiPaintedScreenItemBase.BackgroundColor), item.BackgroundColor, out var backgroundColor)
            ? backgroundColor
            : (HmiColor?)null;
    }

    private static double GetStrokeWidth(HmiShapeBase item, HmiHtmlConvertContext context)
    {
        if (context.EffectiveProperties.TryGetStaticValue(item, nameof(HmiShapeBase.LineWidth), item.LineWidth, out var lineWidth))
            return lineWidth;
        if (item is HmiPaintedScreenItemBase paintedItem
            && context.EffectiveProperties.TryGetStaticValue(paintedItem, nameof(HmiPaintedScreenItemBase.BorderWidth), paintedItem.BorderWidth, out var borderWidth))
            return borderWidth;

        return 1d;
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
        AppendCommonAttributes(html, button, context, additionalStyle: CreateStateStyle(state));
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
        html.Append("<meter");
        AppendCommonAttributes(html, bar, context);
        AppendAttribute(html, "min", ToCss(minimum));
        AppendAttribute(html, "max", ToCss(maximum));
        AppendAttribute(html, "value", ToCss(value));
        html.Append('>').Append(ToCss(value)).Append("</meter>");
    }

    private static void AppendSlider(StringBuilder html, HmiSlider slider, HmiHtmlConvertContext context)
    {
        var (minimum, maximum) = ResolveScaleRange(slider, context);
        var value = ResolveScaleValue(slider, minimum, maximum, context);
        html.Append("<input");
        AppendCommonAttributes(html, slider, context);
        AppendAttribute(html, "type", "range");
        AppendAttribute(html, "min", ToCss(minimum));
        AppendAttribute(html, "max", ToCss(maximum));
        AppendAttribute(html, "value", ToCss(value));
        AppendAttribute(html, "disabled", "disabled");
        html.Append('>');
    }

    private static void AppendScale(StringBuilder html, HmiScale scale, HmiHtmlConvertContext context)
    {
        var (minimum, maximum) = ResolveScaleRange(scale, context);
        html.Append("<div");
        AppendCommonAttributes(html, scale, context, additionalStyle: "display: flex; align-items: end; justify-content: space-between; overflow: hidden;");
        html.Append("><span>").Append(ToCss(minimum)).Append("</span><span>").Append(ToCss(maximum)).Append("</span></div>");
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
            additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-view-kind", alarmControl.ViewKind.ToString());
        AppendAttribute(html, "data-list-mode", listMode.ToString());
        AppendAttribute(html, "data-number-of-rows", ResolvePropertyPreview(alarmControl.NumberOfRows, context));
        AppendAttribute(html, "data-lines-per-alarm", ResolvePropertyPreview(alarmControl.LinesPerAlarm, context));
        AppendAttribute(html, "data-word-wrap", ResolvePropertyPreview(alarmControl.WordWrap, context));
        AppendAttribute(html, "data-wrap-around", ResolvePropertyPreview(alarmControl.WrapAround, context));
        AppendAttribute(html, "data-filtered-triggers", alarmControl.FilteredTriggers.Count == 0 ? null : string.Join(",", alarmControl.FilteredTriggers));
        AppendAttribute(html, "data-alarm-identifier", ResolvePropertyPreview(alarmControl.AlarmIdentifier, context));
        html.Append('>');

        if (showTitle)
        {
            var title = ResolveAlarmTitle(alarmControl, listMode, context);
            html.Append("<div style=\"flex: 0 0 auto; border-bottom: 1px solid currentColor; padding: 2px 4px; font-weight: bold;\">")
                .Append(WebUtility.HtmlEncode(title))
                .Append("</div>");
        }

        html.Append("<table style=\"width: 100%; border-collapse: collapse; table-layout: fixed;\">");
        if (showHeader)
        {
            html.Append("<thead><tr>");
            if (visibleColumns.Length == 0)
                html.Append("<th style=\"border: 1px solid currentColor;\">")
                    .Append(WebUtility.HtmlEncode(ResolveAlarmViewLabel(alarmControl.ViewKind)))
                    .Append("</th>");
            foreach (var column in visibleColumns)
            {
                html.Append("<th style=\"border: 1px solid currentColor; overflow: hidden; text-overflow: ellipsis;\"");
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
        html.Append(" style=\"text-align: center;\">Alarm data not loaded</td></tr></tbody></table>");

        var showAcknowledgeButton = alarmControl.ShowAcknowledgeButton is not null && ResolveStaticValue(alarmControl.ShowAcknowledgeButton, context);
        var showHelpButton = alarmControl.ShowHelpButton is not null && ResolveStaticValue(alarmControl.ShowHelpButton, context);
        if (showAcknowledgeButton || showHelpButton)
        {
            html.Append("<div style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;\">");
            if (showAcknowledgeButton)
                html.Append("Acknowledge");
            if (showAcknowledgeButton && showHelpButton)
                html.Append(" · ");
            if (showHelpButton)
                html.Append("Help");
            html.Append("</div>");
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
        html.Append("><div style=\"flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor; font-weight: bold;\">")
            .Append(WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(title) ? "Radar chart" : title))
            .Append("</div><div style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden;\">Radar payload preserved");
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

    private static void AppendSymbolicInput(StringBuilder html, HmiSymbolicIOField symbolicIoField, HmiHtmlConvertContext context)
    {
        var selectedValue = ResolveStaticValue(symbolicIoField.Value, context);
        var selectedState = symbolicIoField.States.FirstOrDefault(candidate => candidate.Value == selectedValue)
            ?? symbolicIoField.States.FirstOrDefault();
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
        var selectedValue = listBox.Indicator is not null
            ? ResolveStaticValue(listBox.Indicator, context)
            : ResolveStaticValue(listBox.Value, context);
        var selectedState = listBox.States.FirstOrDefault(candidate => candidate.Value == selectedValue)
            ?? listBox.States.FirstOrDefault();

        html.Append("<select");
        AppendCommonAttributes(html, listBox, context, additionalStyle: CreateStateStyle(selectedState));
        html.Append('>');
        foreach (var state in listBox.States)
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
        html.Append(" style=\"position: absolute;");
        AppendPosition(html, rectangle, context);
        AppendStyle(html, rectangle, context);
        if (rectangle.BorderColor == null && rectangle.BorderWidth == null && rectangle.LineColor == null && rectangle.LineWidth == null)
            html.Append("border: 1px solid #000000;");
        html.Append("\"");
        html.Append(">");
        html.Append("</div>");
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
        AppendAttribute(html, "data-hmi-symbol-id", symbolLibraryControl.SymbolId);
        AppendAttribute(html, "data-hmi-symbol-appearance", FormatAttributeValue(symbolLibraryControl.SymbolAppearance?.StaticValue));
        AppendAttribute(html, "data-hmi-fill-color-mode", FormatAttributeValue(symbolLibraryControl.FillColorMode?.StaticValue));
        AppendAttribute(html, "data-hmi-blink-mode", FormatAttributeValue(symbolLibraryControl.BlinkMode?.StaticValue));
        html.Append(" style=\"position: absolute; overflow: hidden;");
        AppendPosition(html, symbolLibraryControl, context);
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

    private static void AppendTrendControl(StringBuilder html, HmiTrendControl trendControl, HmiHtmlConvertContext context)
    {
        html.Append("<hmi-trend-control");
        AppendCommonAttributes(html, trendControl, context);
        AppendAttribute(html, "control-name", trendControl.Name);
        AppendAttribute(html, "type-name", "Trend control");
        html.Append("></hmi-trend-control>");
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
        html.Append(" style=\"position: absolute;");
        AppendPosition(html, item, context);
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
        AppendAttribute(html, "data-hmi-fill-color-mode", symbolContainer.FillColorMode == null ? null : symbolContainer.FillColorMode.StaticValue.ToString());
        AppendAttribute(html, "data-hmi-flip", symbolContainer.Flip == null ? null : symbolContainer.Flip.StaticValue.ToString());
        html.Append(" style=\"position: absolute; overflow: hidden;");
        AppendPosition(html, symbolContainer, context);
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

    private static void AppendSize(StringBuilder html, double width, double height)
    {
        if (width > 0)
            html.Append("width: ").Append(ToCss(width)).Append("px;");
        if (height > 0)
            html.Append("height: ").Append(ToCss(height)).Append("px;");
    }

    private static void AppendScreenStyle(StringBuilder html, HmiScreenBase screen)
    {
        if (screen.BackgroundColor != null)
            html.Append("background-color: ").Append(ToCss(screen.BackgroundColor.StaticValue)).Append(";");
    }

    private static void AppendStyle(StringBuilder html, HmiPaintedScreenItemBase item, HmiHtmlConvertContext context)
    {
        var foregroundColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.ForegroundColor), item.ForegroundColor);
        var backgroundColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BackgroundColor), item.BackgroundColor);
        var borderColor = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BorderColor), item.BorderColor);
        var borderWidth = context.EffectiveProperties.Resolve(item, nameof(HmiPaintedScreenItemBase.BorderWidth), item.BorderWidth);
        var margin = item.Margin;
        var padding = item.Padding;
        var font = GetFont(item);
        var horizontalAlignment = context.EffectiveProperties.Resolve(item, "HorizontalAlignment", GetHorizontalAlignment(item));
        var verticalAlignment = context.EffectiveProperties.Resolve(item, "VerticalAlignment", GetVerticalAlignment(item));
        var suppressBorderStyle = item is HmiCheckBoxGroup or HmiRadioButtonGroup;

        if (foregroundColor?.StaticValue != null)
            html.Append("color: ").Append(ToCss(foregroundColor.StaticValue)).Append(";");
        if (backgroundColor?.StaticValue != null && item is not HmiGauge)
            html.Append("background-color: ").Append(ToCss(backgroundColor.StaticValue)).Append(";");
        if (borderColor?.StaticValue != null)
            html.Append("border-color: ").Append(ToCss(borderColor.StaticValue)).Append(";");
        if (borderWidth?.StaticValue != null)
        {
            if (!suppressBorderStyle)
                html.Append("border-style: solid;");
            html.Append("border-width: ").Append(ToCss(borderWidth.StaticValue)).Append("px;");
        }

        if (item is HmiShapeBase shape)
        {
            if (shape.LineColor != null)
                html.Append("border-color: ").Append(ToCss(shape.LineColor.StaticValue)).Append(";");
            if (shape.LineWidth != null)
            {
                html.Append("border-style: solid;");
                html.Append("border-width: ").Append(ToCss(shape.LineWidth.StaticValue)).Append("px;");
            }
        }
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

    private static HmiFont? GetFont(HmiScreenItemBase item)
    {
        if (item is HmiText text)
            return text.Font;
        if (item is HmiWidgetBase widget)
            return widget.Font;
        return null;
    }

    private static HmiProperty<HmiHorizontalAlignment>? GetHorizontalAlignment(HmiScreenItemBase item)
    {
        if (item is HmiText text)
            return text.HorizontalAlignment;
        if (item is HmiWidgetBase widget)
            return widget.HorizontalAlignment;
        return null;
    }

    private static HmiProperty<HmiVerticalAlignment>? GetVerticalAlignment(HmiScreenItemBase item)
    {
        if (item is HmiText text)
            return text.VerticalAlignment;
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
