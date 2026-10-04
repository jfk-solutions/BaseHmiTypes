using System.Text;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    private static void AppendDetailedParameterControl(StringBuilder html, HmiDetailedParameterControl control, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, control, context, additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-parameter-set-type-fixed", ResolvePropertyPreview(control.ParameterSetTypeFixed, context));
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
        html.Append("<div class=\"hmi-parameter-selection\" style=\"flex: 0 0 auto; padding: 2px 4px;\">Parameter set type");
        if (ResolveStaticValue(control.ParameterSetTypeFixed, context)) html.Append(" · Fixed");
        html.Append("<br>Parameter set selection not decoded</div>");
        if (!ResolveStaticValue(control.HideDetails, context))
            html.Append("<div class=\"hmi-parameter-details\" style=\"flex: 1 1 auto; display: grid; place-items: center; overflow: hidden; border-top: 1px solid currentColor;\">Parameter data not loaded</div>");
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
