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
            var style = new StringBuilder("flex: 1 1 auto; display: grid; place-items: center; overflow: hidden; border-top-style: solid; border-top-color: currentColor;");
            var width = control.GridLineWidth is null ? 1d : ResolveStaticValue(control.GridLineWidth, context);
            style.Append("border-top-width: ").Append(ToCss(IsFinite(width) && width >= 0 ? width : 1d)).Append("px;");
            AppendColorStyle(style, "background-color", control.ContentBackgroundColor);
            AppendColorStyle(style, "color", control.ContentForegroundColor);
            AppendColorStyle(style, "border-top-color", control.GridLineColor);
            html.Append("<div class=\"hmi-parameter-details\" style=\"").Append(style).Append("\">Parameter data not loaded</div>");
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
}
