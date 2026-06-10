using System.Globalization;
using System.Net;
using System.Text;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;

namespace BaseHmiTypes.Converters.Html;

public class HmiScreenToHtmlConverter
{
    public async ValueTask<string> ConvertAsync(
        HmiScreen screen,
        IHmiProject? project = null,
        HmiHtmlConvertOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        return await ConvertCoreAsync(screen, project, options, true, cancellationToken).ConfigureAwait(false);
    }

    private async ValueTask<string> ConvertCoreAsync(
        HmiScreen screen,
        IHmiProject? project,
        HmiHtmlConvertOptions? options,
        bool includeRuntime,
        CancellationToken cancellationToken)
    {
        options ??= new HmiHtmlConvertOptions();

        var html = new StringBuilder();
        if (includeRuntime && options.IncludeMetaCharset)
            html.Append("<meta charset=\"utf-8\">");
        if (includeRuntime)
            AppendRuntimeModule(html);

        html.Append("<div");
        AppendAttribute(html, "id", screen.Name);
        html.Append(" style=\"position: relative; overflow: hidden;");
        AppendSize(html, screen.Width.GetStaticValueOrDefault(), screen.Height.GetStaticValueOrDefault());
        html.Append("\">");

        foreach (var layer in screen.Layers)
        {
            if (!layer.Visible.GetStaticValueOrDefault(true))
                continue;

            html.Append("<div");
            AppendAttribute(html, "id", layer.Name);
            html.Append(" style=\"position: absolute; inset: 0;\">");
            foreach (var item in layer.Items)
                await AppendItemAsync(html, item, project, options, cancellationToken).ConfigureAwait(false);
            html.Append("</div>");
        }

        html.Append("</div>");
        return html.ToString();
    }

    private async ValueTask AppendItemAsync(
        StringBuilder html,
        HmiScreenItemBase item,
        IHmiProject? project,
        HmiHtmlConvertOptions options,
        CancellationToken cancellationToken)
    {
        if (!item.Visible.GetStaticValueOrDefault(true))
            return;

        switch (item)
        {
            case HmiToggleSwitch toggleSwitch:
                AppendToggleSwitch(html, toggleSwitch);
                break;
            case HmiButton button:
                AppendButton(html, button);
                break;
            case HmiIOField ioField:
                AppendInput(html, ioField);
                break;
            case HmiTextBox textBox:
                AppendTextBlock(html, textBox, textBox.Text.GetStaticValue());
                break;
            case HmiLabel label:
                AppendTextBlock(html, label, label.Text.GetStaticValue());
                break;
            case HmiText text:
                AppendTextBlock(html, text, text.Text.GetStaticValue());
                break;
            case HmiGraphicView graphicView:
                AppendImage(html, graphicView, graphicView.Image.GetStaticValue()?.Uri ?? graphicView.Source.GetStaticValue(), options);
                break;
            case HmiRectangle rectangle:
                AppendRectangle(html, rectangle);
                break;
            case HmiLine line:
                AppendLine(html, line);
                break;
            case HmiPolyline polyline:
                AppendPointShape(html, polyline, "polyline", false);
                break;
            case HmiPolygon polygon:
                AppendPointShape(html, polygon, "polygon", true);
                break;
            case HmiCircleSegment circleSegment:
                AppendCircularSegment(html, circleSegment);
                break;
            case HmiEllipseSegment ellipseSegment:
                AppendEllipticalSegment(html, ellipseSegment);
                break;
            case HmiCircularArc circularArc:
                AppendCircularArc(html, circularArc);
                break;
            case HmiEllipticalArc ellipticalArc:
                AppendEllipticalArc(html, ellipticalArc);
                break;
            case HmiCircle circle:
                AppendCircle(html, circle);
                break;
            case HmiEllipse ellipse:
                AppendEllipse(html, ellipse);
                break;
            case HmiDynamicSvg dynamicSvg:
                AppendDynamicSvg(html, dynamicSvg);
                break;
            case HmiSymbolContainer symbolContainer:
                await AppendSymbolContainerAsync(html, symbolContainer, project, options, cancellationToken).ConfigureAwait(false);
                break;
            case HmiGroup group:
                await AppendContainerAsync(html, group, group.Items, project, options, cancellationToken).ConfigureAwait(false);
                break;
            case HmiLayoutContainerBase layoutContainer:
                await AppendContainerAsync(html, layoutContainer, layoutContainer.Items, project, options, cancellationToken).ConfigureAwait(false);
                break;
            case HmiContainerBase container:
                await AppendContainerAsync(html, container, container.Items, project, options, cancellationToken).ConfigureAwait(false);
                break;
            case HmiScreenWindow screenWindow:
                await AppendScreenWindowAsync(html, screenWindow, project, options, cancellationToken).ConfigureAwait(false);
                break;
            case HmiAlarmControl alarmControl:
                AppendDiv(html, alarmControl, options.UnsupportedItemPlaceholderCssClass, "Alarm control");
                break;
            case HmiUnkown unkown:
                AppendDiv(html, unkown, null, "Unkown:" + (unkown.Type ?? ""));
                break;
            default:
                AppendDiv(html, item, options.UnsupportedItemPlaceholderCssClass, item.GetType().Name);
                break;
        }
    }

    private async ValueTask AppendContainerAsync(
        StringBuilder html,
        HmiScreenItemBase container,
        IEnumerable<HmiScreenItemBase> items,
        IHmiProject? project,
        HmiHtmlConvertOptions options,
        CancellationToken cancellationToken)
    {
        html.Append("<div");
        AppendCommonAttributes(html, container);
        html.Append(">");
        foreach (var child in items)
            await AppendItemAsync(html, child, project, options, cancellationToken).ConfigureAwait(false);
        html.Append("</div>");
    }

    private async ValueTask AppendSymbolContainerAsync(
        StringBuilder html,
        HmiSymbolContainer symbolContainer,
        IHmiProject? project,
        HmiHtmlConvertOptions options,
        CancellationToken cancellationToken)
    {
        var image = symbolContainer.Image.GetStaticValue();
        var imageUri = await ResolveImageUriAsync(image, project, cancellationToken).ConfigureAwait(false);

        html.Append("<div");
        AppendSymbolAttributes(html, symbolContainer);
        html.Append(">");

        if (!string.IsNullOrWhiteSpace(imageUri))
            AppendSymbolImage(html, symbolContainer, image!, imageUri!, options);

        foreach (var child in symbolContainer.Items)
            await AppendItemAsync(html, child, project, options, cancellationToken).ConfigureAwait(false);

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
            return image.Uri;

        if (project == null || string.IsNullOrWhiteSpace(image.ImageId))
            return null;

        var resolved = await project.GetImageAsync(image.ImageId!, cancellationToken).ConfigureAwait(false);
        if (resolved == null || resolved.Data.Length == 0)
            return null;

        var mimeType = string.IsNullOrWhiteSpace(resolved.MimeType) ? "application/octet-stream" : resolved.MimeType;
        return "data:" + mimeType + ";base64," + Convert.ToBase64String(resolved.Data);
    }

    private async ValueTask AppendScreenWindowAsync(
        StringBuilder html,
        HmiScreenWindow screenWindow,
        IHmiProject? project,
        HmiHtmlConvertOptions options,
        CancellationToken cancellationToken)
    {
        HmiScreen? resolved = null;
        if (project != null && !string.IsNullOrWhiteSpace(screenWindow.ScreenId?.StaticValue))
            resolved = await project.GetScreenAsync(screenWindow.ScreenId!.StaticValue!, cancellationToken).ConfigureAwait(false);

        html.Append("<div");
        AppendCommonAttributes(html, screenWindow);
        html.Append(">");

        if (resolved == null)
        {
            html.Append("<div");
            AppendAttribute(html, "class", options.MissingScreenPlaceholderCssClass);
            html.Append(">");
            html.Append(WebUtility.HtmlEncode(screenWindow.ScreenName?.StaticValue ?? screenWindow.ScreenId?.StaticValue ?? "Missing screen"));
            html.Append("</div>");
        }
        else
        {
            html.Append(await ConvertCoreAsync(resolved, project, options, false, cancellationToken).ConfigureAwait(false));
        }

        html.Append("</div>");
    }

    private static void AppendLine(StringBuilder html, HmiLine line)
    {
        var width = line.Width.GetStaticValueOrDefault();
        var height = line.Height.GetStaticValueOrDefault();
        AppendSvgOpen(html, line, GetSvgWidth(line), GetSvgHeight(line));
        html.Append("<line");
        AppendSvgAttribute(html, "x1", line.X1.GetStaticValueOrDefault());
        AppendSvgAttribute(html, "y1", line.Y1.GetStaticValueOrDefault());
        AppendSvgAttribute(html, "x2", line.X2.GetStaticValueOrDefault(width));
        AppendSvgAttribute(html, "y2", line.Y2.GetStaticValueOrDefault(height));
        AppendStrokeAttributes(html, line, null);
        html.Append("></line></svg>");
    }

    private static void AppendPointShape(StringBuilder html, HmiPointBasedShapeBase shape, string elementName, bool fill)
    {
        AppendSvgOpen(html, shape, GetSvgWidth(shape), GetSvgHeight(shape));
        html.Append('<').Append(elementName);
        AppendAttribute(html, "points", string.Join(" ", shape.Points.Select(ToSvgPoint)));
        AppendStrokeAttributes(html, shape, fill ? GetFillColor(shape) : null);
        html.Append("></").Append(elementName).Append("></svg>");
    }

    private static void AppendCircle(StringBuilder html, HmiCircle circle)
    {
        var width = GetSvgWidth(circle);
        var height = GetSvgHeight(circle);
        var radius = circle.Radius.GetStaticValueOrDefault(Math.Min(width, height) / 2d);
        AppendSvgOpen(html, circle, width, height);
        html.Append("<circle");
        AppendSvgAttribute(html, "cx", circle.CenterX.GetStaticValueOrDefault(width / 2d));
        AppendSvgAttribute(html, "cy", circle.CenterY.GetStaticValueOrDefault(height / 2d));
        AppendSvgAttribute(html, "r", radius);
        AppendStrokeAttributes(html, circle, GetFillColor(circle));
        html.Append("></circle></svg>");
    }

    private static void AppendEllipse(StringBuilder html, HmiEllipse ellipse)
    {
        var width = GetSvgWidth(ellipse);
        var height = GetSvgHeight(ellipse);
        AppendSvgOpen(html, ellipse, width, height);
        html.Append("<ellipse");
        AppendSvgAttribute(html, "cx", ellipse.CenterX.GetStaticValueOrDefault(width / 2d));
        AppendSvgAttribute(html, "cy", ellipse.CenterY.GetStaticValueOrDefault(height / 2d));
        AppendSvgAttribute(html, "rx", ellipse.RadiusX.GetStaticValueOrDefault(width / 2d));
        AppendSvgAttribute(html, "ry", ellipse.RadiusY.GetStaticValueOrDefault(height / 2d));
        AppendStrokeAttributes(html, ellipse, GetFillColor(ellipse));
        html.Append("></ellipse></svg>");
    }

    private static void AppendCircularArc(StringBuilder html, HmiCircularArc arc)
    {
        var width = GetSvgWidth(arc);
        var height = GetSvgHeight(arc);
        var radius = arc.Radius.GetStaticValueOrDefault(Math.Min(width, height) / 2d);
        var cx = arc.CenterX.GetStaticValueOrDefault(width / 2d);
        var cy = arc.CenterY.GetStaticValueOrDefault(height / 2d);
        AppendArcPath(html, arc, cx, cy, radius, radius, arc.StartAngle.GetStaticValueOrDefault(), arc.SweepAngle.GetStaticValueOrDefault(), false);
    }

    private static void AppendEllipticalArc(StringBuilder html, HmiEllipticalArc arc)
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
            false);
    }

    private static void AppendCircularSegment(StringBuilder html, HmiCircleSegment segment)
    {
        var width = GetSvgWidth(segment);
        var height = GetSvgHeight(segment);
        var radius = segment.Radius.GetStaticValueOrDefault(Math.Min(width, height) / 2d);
        var cx = segment.CenterX.GetStaticValueOrDefault(width / 2d);
        var cy = segment.CenterY.GetStaticValueOrDefault(height / 2d);
        AppendArcPath(html, segment, cx, cy, radius, radius, segment.StartAngle.GetStaticValueOrDefault(), segment.SweepAngle.GetStaticValueOrDefault(), true);
    }

    private static void AppendEllipticalSegment(StringBuilder html, HmiEllipseSegment segment)
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
            true);
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
        bool segment)
    {
        AppendSvgOpen(html, item, GetSvgWidth(item), GetSvgHeight(item));
        html.Append("<path");
        AppendAttribute(html, "d", CreateArcPath(centerX, centerY, radiusX, radiusY, startAngle, sweepAngle, segment));
        AppendStrokeAttributes(html, item, segment ? GetFillColor(item) : null);
        html.Append("></path></svg>");
    }

    private static void AppendSvgOpen(StringBuilder html, HmiScreenItemBase item, double width, double height)
    {
        html.Append("<svg");
        AppendCommonAttributes(html, item);
        AppendAttribute(html, "viewBox", "0 0 " + ToCss(Math.Max(width, 1)) + " " + ToCss(Math.Max(height, 1)));
        AppendAttribute(html, "xmlns", "http://www.w3.org/2000/svg");
        html.Append(">");
    }

    private static void AppendStrokeAttributes(StringBuilder html, HmiShapeBase item, HmiColor? fillColor)
    {
        AppendAttribute(html, "fill", fillColor == null ? "none" : ToCss(fillColor.Value));
        AppendAttribute(html, "stroke", ToCss(GetStrokeColor(item)));
        AppendSvgAttribute(html, "stroke-width", GetStrokeWidth(item));
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

    private static HmiColor GetStrokeColor(HmiShapeBase item)
    {
        if (TryGetStaticValue(item.LineColor, out var lineColor))
            return lineColor;
        if (item is HmiPaintedScreenItemBase paintedItem && TryGetStaticValue(paintedItem.BorderColor, out var borderColor))
            return borderColor;
        if (item is HmiPaintedScreenItemBase foregroundItem && TryGetStaticValue(foregroundItem.ForegroundColor, out var foregroundColor))
            return foregroundColor;

        return HmiColor.FromArgb(255, 0, 0, 0);
    }

    private static HmiColor? GetFillColor(HmiShapeBase item)
    {
        return TryGetStaticValue(item.BackgroundColor, out var backgroundColor)
            ? backgroundColor
            : (HmiColor?)null;
    }

    private static double GetStrokeWidth(HmiShapeBase item)
    {
        if (TryGetStaticValue(item.LineWidth, out var lineWidth))
            return lineWidth;
        if (item is HmiPaintedScreenItemBase paintedItem && TryGetStaticValue(paintedItem.BorderWidth, out var borderWidth))
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

    private static string ToSvgPoint(HmiPoint point)
    {
        return ToCss(point.X) + "," + ToCss(point.Y);
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

    private static void AppendButton(StringBuilder html, HmiButton button)
    {
        html.Append("<button");
        AppendCommonAttributes(html, button);
        html.Append(">");
        var image = button.Image.GetStaticValue();
        var imageUri = image?.Uri;
        if (!string.IsNullOrWhiteSpace(imageUri))
            AppendInnerImage(html, imageUri);
        html.Append(WebUtility.HtmlEncode(button.Text.GetStaticValue() ?? string.Empty));
        html.Append("</button>");
    }

    private static void AppendInput(StringBuilder html, HmiIOField ioField)
    {
        html.Append("<input");
        AppendCommonAttributes(html, ioField);
        html.Append(">");
    }

    private static void AppendToggleSwitch(StringBuilder html, HmiToggleSwitch toggleSwitch)
    {
        html.Append("<input type=\"checkbox\"");
        AppendCommonAttributes(html, toggleSwitch);
        html.Append(">");
    }

    private static void AppendTextBlock(StringBuilder html, HmiScreenItemBase item, string? text)
    {
        AppendDiv(html, item, null, text);
    }

    private static void AppendRectangle(StringBuilder html, HmiRectangle rectangle)
    {
        html.Append("<div");
        AppendAttribute(html, "id", rectangle.Name);
        html.Append(" style=\"position: absolute;");
        AppendPosition(html, rectangle);
        AppendStyle(html, rectangle);
        if (rectangle.BorderColor == null && rectangle.BorderWidth == null && rectangle.LineColor == null && rectangle.LineWidth == null)
            html.Append("border: 1px solid #000000;");
        html.Append("\"");
        html.Append(">");
        html.Append("</div>");
    }

    private static void AppendImage(StringBuilder html, HmiScreenItemBase item, string? uri, HmiHtmlConvertOptions options)
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            AppendDiv(html, item, null, null);
            return;
        }

        var imageUri = uri!;
        html.Append("<img");
        AppendCommonAttributes(html, item);
        AppendAttribute(html, "src", imageUri);
        html.Append(">");
    }

    private static void AppendInnerImage(StringBuilder html, string? uri)
    {
        if (string.IsNullOrWhiteSpace(uri))
            return;

        html.Append("<img");
        AppendAttribute(html, "src", uri);
        html.Append(" style=\"width: 100%; height: 100%;\">");
    }

    private static void AppendSymbolImage(StringBuilder html, HmiSymbolContainer symbolContainer, HmiImageSource image, string uri, HmiHtmlConvertOptions options)
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

    private static void AppendDynamicSvg(StringBuilder html, HmiDynamicSvg dynamicSvg)
    {
        html.Append("<node-projects-svghmi");
        AppendCommonAttributes(html, dynamicSvg);
        AppendAttribute(html, "src", dynamicSvg.Image.GetStaticValue()?.Uri);
        foreach (var property in dynamicSvg.Properties)
            AppendAttribute(html, ToDynamicSvgAttributeName(property.Name), FormatDynamicSvgPropertyValue(property.Value.GetStaticValue()));
        html.Append("></node-projects-svghmi>");
    }

    private static string? FormatDynamicSvgPropertyValue(object? value)
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

    private static void AppendDiv(StringBuilder html, HmiScreenItemBase item, string? cssClass, string? content)
    {
        html.Append("<div");
        AppendCommonAttributes(html, item);
        AppendAttribute(html, "class", cssClass);
        html.Append(">");
        if (!string.IsNullOrEmpty(content))
            html.Append(WebUtility.HtmlEncode(content));
        html.Append("</div>");
    }

    private static void AppendCommonAttributes(StringBuilder html, HmiScreenItemBase item)
    {
        AppendAttribute(html, "id", item.Name);
        html.Append(" style=\"position: absolute;");
        AppendPosition(html, item);
        if (item is HmiPaintedScreenItemBase paintedItem)
            AppendStyle(html, paintedItem);
        html.Append("\"");
    }

    private static void AppendSymbolAttributes(StringBuilder html, HmiSymbolContainer symbolContainer)
    {
        AppendAttribute(html, "id", symbolContainer.Name);
        AppendAttribute(html, "data-hmi-fill-color-mode", symbolContainer.FillColorMode == null ? null : symbolContainer.FillColorMode.StaticValue.ToString());
        AppendAttribute(html, "data-hmi-flip", symbolContainer.Flip == null ? null : symbolContainer.Flip.StaticValue.ToString());
        html.Append(" style=\"position: absolute; overflow: hidden;");
        AppendPosition(html, symbolContainer);
        AppendStyle(html, symbolContainer);
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

    private static void AppendPosition(StringBuilder html, HmiScreenItemBase item)
    {
        html.Append("left: ").Append(ToCss(item.X.GetStaticValueOrDefault())).Append("px;");
        html.Append("top: ").Append(ToCss(item.Y.GetStaticValueOrDefault())).Append("px;");
        AppendSize(html, item.Width.GetStaticValueOrDefault(), item.Height.GetStaticValueOrDefault());
    }

    private static void AppendSize(StringBuilder html, double width, double height)
    {
        if (width > 0)
            html.Append("width: ").Append(ToCss(width)).Append("px;");
        if (height > 0)
            html.Append("height: ").Append(ToCss(height)).Append("px;");
    }

    private static void AppendStyle(StringBuilder html, HmiPaintedScreenItemBase item)
    {
        var foregroundColor = item.ForegroundColor;
        var backgroundColor = item.BackgroundColor;
        var borderColor = item.BorderColor;
        var borderWidth = item.BorderWidth;
        var margin = item.Margin;
        var font = GetFont(item);
        var horizontalAlignment = GetHorizontalAlignment(item);
        var verticalAlignment = GetVerticalAlignment(item);

        if (foregroundColor != null)
            html.Append("color: ").Append(ToCss(foregroundColor.StaticValue)).Append(";");
        if (backgroundColor != null)
            html.Append("background-color: ").Append(ToCss(backgroundColor.StaticValue)).Append(";");
        if (borderColor != null)
            html.Append("border-color: ").Append(ToCss(borderColor.StaticValue)).Append(";");
        if (borderWidth != null)
        {
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
            html.Append("text-align: ").Append(ToCss(horizontalAlignment.StaticValue)).Append(";");
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

}
