using System.Text;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    private static void AppendNcPartProgramControl(StringBuilder html, HmiNcPartProgramControl control, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, control, context, additionalStyle: CreateControlWindowStyle(control, context, "overflow: hidden;"));
        AppendAttribute(html, "data-list-background-color", ResolvePropertyPreview(control.ListBackgroundColor, context));
        AppendAttribute(html, "data-list-foreground-color", ResolvePropertyPreview(control.ListForegroundColor, context));
        AppendAttribute(html, "data-selection-background-color", ResolvePropertyPreview(control.SelectionBackgroundColor, context));
        AppendAttribute(html, "data-selection-foreground-color", ResolvePropertyPreview(control.SelectionForegroundColor, context));
        AppendAttribute(html, "data-alternating-row-background-color", ResolvePropertyPreview(control.AlternatingRowBackgroundColor, context));
        AppendAttribute(html, "data-grid-line-color", ResolvePropertyPreview(control.GridLineColor, context));
        AppendAttribute(html, "data-show-grid-lines", ResolvePropertyPreview(control.ShowGridLines, context));
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
        AppendAttribute(html, "data-textual-objects-border-background-color", ResolvePropertyPreview(control.TextualObjectsBorderBackgroundColor, context));
        AppendAttribute(html, "data-textual-objects-border-color", ResolvePropertyPreview(control.TextualObjectsBorderColor, context));
        AppendAttribute(html, "data-textual-objects-border-width", ResolvePropertyPreview(control.TextualObjectsBorderWidth, context));
        AppendAttribute(html, "data-textual-objects-corner-radius", ResolvePropertyPreview(control.TextualObjectsCornerRadius, context));
        AppendAttribute(html, "data-textual-objects-edge-style", ResolvePropertyPreview(control.TextualObjectsEdgeStyle, context));
        html.Append(" role=\"region\" aria-label=\"NC part program viewer\" data-preview=\"appearance\"><div style=\"overflow:auto;height:100%;\"><div>NC program data not decoded</div>");
        var content = new StringBuilder();
        AppendColorStyle(content, "background-color", control.ListBackgroundColor);
        AppendColorStyle(content, "color", control.ListForegroundColor);
        AppendFontStyle(content, control.ContentFont?.GetForCulture(context.CultureInfo?.LCID));
        Sample("list", "List appearance", content);
        var selection = new StringBuilder();
        AppendColorStyle(selection, "background-color", control.SelectionBackgroundColor);
        AppendColorStyle(selection, "color", control.SelectionForegroundColor);
        Sample("selection", "Selection appearance", selection);
        var alternate = new StringBuilder();
        AppendColorStyle(alternate, "background-color", control.AlternatingRowBackgroundColor);
        AppendColorStyle(alternate, "color", control.ListForegroundColor);
        Sample("alternate", "Alternating row appearance", alternate);
        var button = new StringBuilder();
        AppendColorStyle(button, "background-color", control.ButtonBackgroundColor);
        AppendColorStyle(button, "border-color", control.ButtonBorderColor);
        AppendHeaderBorderWidth(button, control.ButtonBorderWidth);
        if (control.ButtonCornerRadius?.StaticValue is int buttonRadius && buttonRadius >= 0)
            button.Append("border-radius: ").Append(ToCss(buttonRadius)).Append("px;");
        AppendColorGradientStyle(button, CreateColorGradient(
            control.ButtonBackgroundColor, control.ButtonFirstGradientColor, control.ButtonFirstGradientOffset,
            control.ButtonMiddleGradientColor, control.ButtonSecondGradientColor, control.ButtonSecondGradientOffset,
            control.UseButtonFirstGradient, control.UseButtonSecondGradient, null));
        Sample("button", "Button appearance", button);
        var text = new StringBuilder();
        AppendColorStyle(text, "border-color", control.TextualObjectsBorderColor);
        AppendHeaderBorderWidth(text, control.TextualObjectsBorderWidth);
        if (control.TextualObjectsCornerRadius?.StaticValue is int textRadius && textRadius >= 0)
            text.Append("border-radius: ").Append(ToCss(textRadius)).Append("px;");
        Sample("text", "Text field appearance", text);
        html.Append("</div></div>");

        void Sample(string kind, string label, StringBuilder style)
        {
            html.Append("<div data-appearance=\"").Append(kind).Append("\" style=\"padding:4px;").Append(style).Append("\">").Append(label).Append("</div>");
        }
    }
}
