using System.Text;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    private static void AppendGraphOverviewControl(StringBuilder html, HmiProcessDiagnosisGraphOverviewControl control, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, control, context, additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-process-diagnosis-kind", "GraphOverview");
        AppendAttribute(html, "data-preview", "appearance");
        AppendAttribute(html, "data-header-background-color", ResolvePropertyPreview(control.HeaderBackgroundColor, context));
        AppendAttribute(html, "data-header-foreground-color", ResolvePropertyPreview(control.HeaderForegroundColor, context));
        AppendAttribute(html, "data-content-background-color", ResolvePropertyPreview(control.ContentBackgroundColor, context));
        AppendAttribute(html, "data-content-foreground-color", ResolvePropertyPreview(control.ContentForegroundColor, context));
        AppendAttribute(html, "data-error-color", ResolvePropertyPreview(control.ErrorColor, context));
        AppendAttribute(html, "data-highlight-color", ResolvePropertyPreview(control.HighlightColor, context));
        AppendAttribute(html, "data-selected-step-color", ResolvePropertyPreview(control.SelectedStepColor, context));
        AppendAttribute(html, "data-separator-color", ResolvePropertyPreview(control.SeparatorColor, context));
        AppendAttribute(html, "data-toolbar-background-color", ResolvePropertyPreview(control.ToolbarBackgroundColor, context));
        AppendAttribute(html, "data-use-toolbar-background-color", ResolvePropertyPreview(control.UseToolbarBackgroundColor, context));
        AppendAttribute(html, "data-show-message-view-button", ResolvePropertyPreview(control.ShowMessageViewButton, context));
        AppendAttribute(html, "data-show-plc-code-view-button", ResolvePropertyPreview(control.ShowPlcCodeViewButton, context));
        AppendAttribute(html, "data-show-step-button", ResolvePropertyPreview(control.ShowStepButton, context));
        AppendAttribute(html, "data-button-background-color", ResolvePropertyPreview(control.ButtonBackgroundColor, context));
        AppendAttribute(html, "data-button-border-background-color", ResolvePropertyPreview(control.ButtonBorderBackgroundColor, context));
        AppendAttribute(html, "data-button-border-color", ResolvePropertyPreview(control.ButtonBorderColor, context));
        AppendAttribute(html, "data-button-first-gradient-color", ResolvePropertyPreview(control.ButtonFirstGradientColor, context));
        AppendAttribute(html, "data-button-middle-gradient-color", ResolvePropertyPreview(control.ButtonMiddleGradientColor, context));
        AppendAttribute(html, "data-button-second-gradient-color", ResolvePropertyPreview(control.ButtonSecondGradientColor, context));
        AppendAttribute(html, "data-button-border-width", ResolvePropertyPreview(control.ButtonBorderWidth, context));
        AppendAttribute(html, "data-button-corner-radius", ResolvePropertyPreview(control.ButtonCornerRadius, context));
        AppendAttribute(html, "data-button-edge-style", ResolvePropertyPreview(control.ButtonEdgeStyle, context));
        AppendAttribute(html, "data-button-back-fill-style", ResolvePropertyPreview(control.ButtonBackFillStyle, context));
        AppendAttribute(html, "data-button-first-gradient-offset", ResolvePropertyPreview(control.ButtonFirstGradientOffset, context));
        AppendAttribute(html, "data-button-second-gradient-offset", ResolvePropertyPreview(control.ButtonSecondGradientOffset, context));
        AppendAttribute(html, "data-use-button-first-gradient", ResolvePropertyPreview(control.UseButtonFirstGradient, context));
        AppendAttribute(html, "data-use-button-second-gradient", ResolvePropertyPreview(control.UseButtonSecondGradient, context));
        AppendAttribute(html, "data-associated-graph-db-tag-source-id", control.AssociatedGraphDbTagSourceId);
        AppendAttribute(html, "data-associated-graph-db-tag-name", control.AssociatedGraphDbTagName);
        html.Append(" role=\"region\" aria-label=\"Graph overview\"><div>GRAPH overview appearance preview; Graph diagnostics not loaded</div>");
        void Sample(string kind, string label, HmiProperty<HmiColor>? background, HmiProperty<HmiColor>? foreground, string? additionalStyle = null, HmiFont? font = null)
        {
            var style = new StringBuilder("padding: 2px 4px;");
            AppendColorStyle(style, "background-color", background);
            AppendColorStyle(style, "color", foreground);
            AppendFontStyle(style, font?.GetForCulture(context.CultureInfo?.LCID));
            style.Append(additionalStyle);
            html.Append("<div data-appearance-sample=\"").Append(kind).Append("\" style=\"").Append(style).Append("\">").Append(label).Append("</div>");
        }
        Sample("path-header", "Path header appearance", control.HeaderBackgroundColor, control.HeaderForegroundColor, font: control.HeaderFont);
        Sample("step", "Step appearance", control.ContentBackgroundColor, control.ContentForegroundColor, font: control.ContentFont);
        Sample("error", "Error color palette", control.ErrorColor, null);
        Sample("highlight", "Highlight color palette", control.HighlightColor, null);
        Sample("selected-step", "Selected step color palette", control.SelectedStepColor, null);
        Sample("separator", "Separator color palette", control.SeparatorColor, null);
        Sample("toolbar", "Toolbar background appearance", control.UseToolbarBackgroundColor is null || ResolveStaticValue(control.UseToolbarBackgroundColor, context) ? control.ToolbarBackgroundColor : null, null);
        var button = new StringBuilder();
        AppendColorStyle(button, "background-color", control.ButtonBackgroundColor);
        AppendColorStyle(button, "border-color", control.ButtonBorderColor);
        AppendHeaderBorderWidth(button, control.ButtonBorderWidth);
        if (control.ButtonCornerRadius?.StaticValue is int radius && radius >= 0)
            button.Append("border-radius: ").Append(ToCss(radius)).Append("px;");
        AppendColorGradientStyle(button, CreateColorGradient(
            control.ButtonBackgroundColor, control.ButtonFirstGradientColor, control.ButtonFirstGradientOffset,
            control.ButtonMiddleGradientColor, control.ButtonSecondGradientColor, control.ButtonSecondGradientOffset,
            control.UseButtonFirstGradient, control.UseButtonSecondGradient, null));
        Sample("button", "Button appearance", null, null, button.ToString());
        html.Append("</div>");
    }
}
