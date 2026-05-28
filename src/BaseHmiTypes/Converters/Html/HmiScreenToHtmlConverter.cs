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
        options ??= new HmiHtmlConvertOptions();

        var html = new StringBuilder();
        if (options.IncludeMetaCharset)
            html.Append("<meta charset=\"utf-8\">");

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
                AppendImage(html, graphicView, graphicView.Image.GetStaticValue()?.Uri ?? graphicView.Source.GetStaticValue());
                break;
            case HmiRectangle rectangle:
                AppendDiv(html, rectangle, null, null);
                break;
            case HmiGroup group:
                await AppendContainerAsync(html, group, group.Items, project, options, cancellationToken).ConfigureAwait(false);
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

    private async ValueTask AppendScreenWindowAsync(
        StringBuilder html,
        HmiScreenWindow screenWindow,
        IHmiProject? project,
        HmiHtmlConvertOptions options,
        CancellationToken cancellationToken)
    {
        HmiScreen? resolved = null;
        if (project != null && !string.IsNullOrWhiteSpace(screenWindow.ScreenId))
            resolved = await project.GetScreenAsync(screenWindow.ScreenId!, cancellationToken).ConfigureAwait(false);

        html.Append("<div");
        AppendCommonAttributes(html, screenWindow);
        html.Append(">");

        if (resolved == null)
        {
            html.Append("<div");
            AppendAttribute(html, "class", options.MissingScreenPlaceholderCssClass);
            html.Append(">");
            html.Append(WebUtility.HtmlEncode(screenWindow.ScreenName ?? screenWindow.ScreenId ?? "Missing screen"));
            html.Append("</div>");
        }
        else
        {
            html.Append(await ConvertAsync(resolved, project, options, cancellationToken).ConfigureAwait(false));
        }

        html.Append("</div>");
    }

    private static void AppendButton(StringBuilder html, HmiButton button)
    {
        html.Append("<button");
        AppendCommonAttributes(html, button);
        html.Append(">");
        var image = button.Image.GetStaticValue();
        if (!string.IsNullOrWhiteSpace(image?.Uri))
            AppendInnerImage(html, image.Uri);
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

    private static void AppendImage(StringBuilder html, HmiScreenItemBase item, string? uri)
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            AppendDiv(html, item, null, null);
            return;
        }

        html.Append("<img");
        AppendCommonAttributes(html, item);
        AppendAttribute(html, "src", uri);
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
        AppendStyle(html, item.Style);
        html.Append("\"");
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

    private static void AppendStyle(StringBuilder html, HmiVisualStyle style)
    {
        var foregroundColor = style.ForegroundColor;
        var backgroundColor = style.BackgroundColor;
        var borderColor = style.BorderColor;
        var borderWidth = style.BorderWidth;
        var lineColor = style.LineColor;
        var lineWidth = style.LineWidth;
        var margin = style.Margin;
        var font = style.Font.GetStaticValue();
        var horizontalAlignment = style.HorizontalAlignment;
        var verticalAlignment = style.VerticalAlignment;

        if (foregroundColor != null)
            html.Append("color: ").Append(ToCss(foregroundColor.StaticValue)).Append(";");
        if (backgroundColor != null)
            html.Append("background-color: ").Append(ToCss(backgroundColor.StaticValue)).Append(";");
        if (borderColor != null)
            html.Append("border-color: ").Append(ToCss(borderColor.StaticValue)).Append(";");
        if (lineColor != null)
            html.Append("border-color: ").Append(ToCss(lineColor.StaticValue)).Append(";");
        if (borderWidth != null)
        {
            html.Append("border-style: solid;");
            html.Append("border-width: ").Append(ToCss(borderWidth.StaticValue)).Append("px;");
        }
        if (lineWidth != null)
        {
            html.Append("border-style: solid;");
            html.Append("border-width: ").Append(ToCss(lineWidth.StaticValue)).Append("px;");
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
            if (!string.IsNullOrWhiteSpace(font.Name))
                html.Append("font-family: ").Append(WebUtility.HtmlEncode(font.Name)).Append(";");
            if (font.Size.HasValue)
                html.Append("font-size: ").Append(ToCss(font.Size.Value)).Append("px;");
            if (font.Bold)
                html.Append("font-weight: bold;");
            if (font.Italic)
                html.Append("font-style: italic;");
            if (font.Underline)
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

    private static void AppendAttribute(StringBuilder html, string name, string? value)
    {
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
