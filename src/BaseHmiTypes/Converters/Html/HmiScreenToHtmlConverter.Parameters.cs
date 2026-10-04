using System.Text;
using System.Net;
using System.Globalization;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    private static void AppendDetailedParameterControl(StringBuilder html, HmiDetailedParameterControl control, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, control, context, additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-parameter-set-type-fixed", ResolvePropertyPreview(control.ParameterSetTypeFixed, context));
        AppendAttribute(html, "data-current-parameter-set-id", ResolvePropertyPreview(control.CurrentParameterSetId, context));
        AppendAttribute(html, "data-current-parameter-set-type-id", ResolvePropertyPreview(control.CurrentParameterSetTypeId, context));
        AppendAttribute(html, "data-hide-details", ResolvePropertyPreview(control.HideDetails, context));
        AppendAttribute(html, "data-edit-mode", ResolvePropertyPreview(control.EditMode, context));
        AppendAttribute(html, "data-show-toolbar", ResolvePropertyPreview(control.ShowToolbar, context));
        AppendAttribute(html, "data-show-status-bar", ResolvePropertyPreview(control.ShowStatusBar, context));
        html.Append('>');
        if (ResolveStaticValue(control.ShowToolbar, context))
        {
            var style = new StringBuilder("flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;");
            AppendColorStyle(style, "background-color", control.ToolbarBackgroundColor);
            html.Append("<div class=\"hmi-parameter-toolbar\" role=\"toolbar\" style=\"").Append(style).Append("\">Toolbar</div>");
        }
        html.Append("<div class=\"hmi-parameter-selection\" style=\"flex: 0 0 auto; padding: 2px 4px;\"><div>")
            .Append(WebUtility.HtmlEncode(ResolveStaticValue(control.ParameterSetTypeLabel, context)?.GetText(context.CultureInfo) ?? "Parameter set type"));
        if (ResolveStaticValue(control.ParameterSetTypeFixed, context)) html.Append(" · Fixed");
        if (control.CurrentParameterSetTypeId is not null)
            html.Append(": ").Append(ResolveStaticValue(control.CurrentParameterSetTypeId, context).ToString(CultureInfo.InvariantCulture));
        html.Append("</div><div>")
            .Append(WebUtility.HtmlEncode(ResolveStaticValue(control.ParameterSetLabel, context)?.GetText(context.CultureInfo) ?? "Parameter set"))
            .Append("</div><div>")
            .Append(WebUtility.HtmlEncode(ResolveStaticValue(control.NumberLabel, context)?.GetText(context.CultureInfo) ?? "Number"));
        if (control.CurrentParameterSetId is not null)
            html.Append(": ").Append(ResolveStaticValue(control.CurrentParameterSetId, context).ToString(CultureInfo.InvariantCulture));
        html.Append("</div>");
        if (control.CurrentParameterSetId is null || control.CurrentParameterSetTypeId is null)
            html.Append("<div>Parameter set selection not decoded</div>");
        html.Append("</div>");
        if (!ResolveStaticValue(control.HideDetails, context))
        {
            var columns = control.ColumnDefinitions.Where(column => column.Visible is null || ResolveStaticValue(column.Visible, context)).ToArray();
            var style = new StringBuilder("flex: 1 1 auto; display: grid; place-items: center; overflow: hidden; border-top-style: solid; border-top-color: currentColor;");
            if (columns.Length > 0) style.Append("display: block; overflow: auto;");
            var width = control.GridLineWidth is null ? 1d : ResolveStaticValue(control.GridLineWidth, context);
            style.Append("border-top-width: ").Append(ToCss(IsFinite(width) && width >= 0 ? width : 1d)).Append("px;");
            AppendColorStyle(style, "background-color", control.ContentBackgroundColor);
            AppendColorStyle(style, "color", control.ContentForegroundColor);
            AppendColorStyle(style, "border-top-color", control.GridLineColor);
            html.Append("<div class=\"hmi-parameter-details\" style=\"").Append(style).Append("\">");
            if (columns.Length > 0) AppendParameterColumns(html, control, columns, context);
            else html.Append("Parameter data not loaded");
            html.Append("</div>");
        }
        if (ResolveStaticValue(control.ShowStatusBar, context))
        {
            var style = new StringBuilder("flex: 0 0 auto; padding: 2px 4px; border-top: 1px solid currentColor;");
            AppendColorStyle(style, "background-color", control.StatusBarBackgroundColor);
            AppendColorStyle(style, "color", control.StatusBarForegroundColor);
            html.Append("<div class=\"hmi-parameter-status-bar\" role=\"status\" style=\"").Append(style).Append("\">Status</div>");
        }
        html.Append("</div>");
    }

    private static void AppendParameterColumns(StringBuilder html, HmiDetailedParameterControl control,
        HmiParameterColumn[] columns, HmiHtmlConvertContext context)
    {
        html.Append("<table class=\"hmi-parameter-table\" style=\"width: 100%; table-layout: fixed; border-collapse: collapse;\"><colgroup>");
        foreach (var column in columns)
            html.Append("<col style=\"").Append(CreateParameterColumnWidthStyle(column, context)).Append("\">");
        var headerStyle = new StringBuilder("padding: 2px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;");
        AppendColorStyle(headerStyle, "background-color", control.HeaderBackgroundColor);
        AppendColorStyle(headerStyle, "color", control.HeaderForegroundColor);
        AppendFontStyle(headerStyle, control.HeaderFont);
        html.Append("</colgroup><thead><tr>");
        foreach (var column in columns)
        {
            html.Append("<th scope=\"col\" style=\"").Append(headerStyle).Append(CreateParameterColumnWidthStyle(column, context)).Append('"');
            AppendAttribute(html, "data-column-name", column.Name);
            AppendAttribute(html, "data-column-key", column.Key);
            AppendAttribute(html, "data-width", ResolvePropertyPreview(column.Width, context));
            AppendAttribute(html, "data-minimum-width", ResolvePropertyPreview(column.MinimumWidth, context));
            AppendAttribute(html, "data-maximum-width", ResolvePropertyPreview(column.MaximumWidth, context));
            AppendAttribute(html, "data-allow-sort", ResolvePropertyPreview(column.AllowSort, context));
            AppendAttribute(html, "data-output-format", ResolvePropertyPreview(column.OutputFormat, context));
            html.Append('>').Append(WebUtility.HtmlEncode(column.HeaderText?.GetText(context.CultureInfo) ?? column.Name ?? column.Key ?? "Column")).Append("</th>");
        }
        html.Append("</tr></thead><tbody><tr><td colspan=\"").Append(columns.Length.ToString(CultureInfo.InvariantCulture))
            .Append("\" style=\"text-align: center; padding: 2px 4px;\">Parameter data not loaded</td></tr></tbody></table>");
    }

    private static string CreateParameterColumnWidthStyle(HmiParameterColumn column, HmiHtmlConvertContext context)
    {
        uint? minimum = column.MinimumWidth is null ? null : ResolveStaticValue(column.MinimumWidth, context);
        uint? maximum = column.MaximumWidth is null ? null : ResolveStaticValue(column.MaximumWidth, context);
        var validBounds = minimum is null || maximum is null || minimum <= maximum;
        var style = new StringBuilder();
        if (column.Width is not null)
        {
            var width = ResolveStaticValue(column.Width, context);
            if (validBounds)
            {
                if (minimum is uint min && width < min) width = min;
                if (maximum is uint max && width > max) width = max;
            }
            style.Append("width: ").Append(width.ToString(CultureInfo.InvariantCulture)).Append("px;");
        }
        if (validBounds)
        {
            if (minimum is uint min) style.Append("min-width: ").Append(min.ToString(CultureInfo.InvariantCulture)).Append("px;");
            if (maximum is uint max) style.Append("max-width: ").Append(max.ToString(CultureInfo.InvariantCulture)).Append("px;");
        }
        return style.ToString();
    }
}
