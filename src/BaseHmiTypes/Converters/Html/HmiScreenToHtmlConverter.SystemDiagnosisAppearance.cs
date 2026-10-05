using System.Text;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    private static void AppendSystemDiagnosisAppearance(StringBuilder html, HmiSystemDiagnosisAppearance control, HmiHtmlConvertContext context)
    {
        html.Append("<div data-system-diagnosis-appearance=\"true\" data-preview=\"appearance\"");
        AppendAttribute(html, "data-information-area-background-color", ResolvePropertyPreview(control.InformationAreaBackgroundColor, context));
        AppendAttribute(html, "data-information-area-foreground-color", ResolvePropertyPreview(control.InformationAreaForegroundColor, context));
        AppendAttribute(html, "data-error-background-color", ResolvePropertyPreview(control.ErrorBackgroundColor, context));
        AppendAttribute(html, "data-error-foreground-color", ResolvePropertyPreview(control.ErrorForegroundColor, context));
        AppendAttribute(html, "data-information-area-focus-color", ResolvePropertyPreview(control.InformationAreaFocusColor, context));
        AppendAttribute(html, "data-information-area-focus-width", ResolvePropertyPreview(control.InformationAreaFocusWidth, context));
        AppendAttribute(html, "data-information-area-font-reference-device-size", ResolvePropertyPreview(control.InformationAreaFontReferenceDeviceSize, context));
        AppendAttribute(html, "data-selection-background-color", ResolvePropertyPreview(control.SelectionBackgroundColor, context));
        AppendAttribute(html, "data-selection-foreground-color", ResolvePropertyPreview(control.SelectionForegroundColor, context));
        AppendAttribute(html, "data-show-grid-lines", ResolvePropertyPreview(control.ShowGridLines, context));
        AppendAttribute(html, "data-header-background-color", ResolvePropertyPreview(control.HeaderBackgroundColor, context));
        AppendAttribute(html, "data-header-foreground-color", ResolvePropertyPreview(control.HeaderForegroundColor, context));
        AppendAttribute(html, "data-navigation-font-reference-device-size", ResolvePropertyPreview(control.NavigationFontReferenceDeviceSize, context));
        AppendAttribute(html, "data-navigation-foreground-color", ResolvePropertyPreview(control.NavigationForegroundColor, context));
        AppendAttribute(html, "data-show-navigation-buttons", ResolvePropertyPreview(control.ShowNavigationButtons, context));
        AppendAttribute(html, "data-use-toolbar-background-color", ResolvePropertyPreview(control.UseToolbarBackgroundColor, context));
        AppendAttribute(html, "data-alternating-row-background-color", ResolvePropertyPreview(control.AlternatingRowBackgroundColor, context));
        AppendAttribute(html, "data-grid-line-color", ResolvePropertyPreview(control.GridLineColor, context));
        AppendAttribute(html, "data-toolbar-alignment", ResolvePropertyPreview(control.ToolbarAlignment, context));
        AppendAttribute(html, "data-toolbar-background-color", ResolvePropertyPreview(control.ToolbarBackgroundColor, context));
        AppendAttribute(html, "data-header-font-reference-device-size", ResolvePropertyPreview(control.HeaderFontReferenceDeviceSize, context));
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
        AppendAttribute(html, "data-header-border-color", ResolvePropertyPreview(control.HeaderBorderColor, context));
        AppendAttribute(html, "data-header-border-width", ResolvePropertyPreview(control.HeaderBorderWidth, context));
        AppendAttribute(html, "data-header-border-background-color", ResolvePropertyPreview(control.HeaderBorderBackgroundColor, context));
        AppendAttribute(html, "data-header-corner-radius", ResolvePropertyPreview(control.HeaderCornerRadius, context));
        AppendAttribute(html, "data-header-back-fill-style", ResolvePropertyPreview(control.HeaderBackFillStyle, context));
        AppendAttribute(html, "data-header-edge-style", ResolvePropertyPreview(control.HeaderEdgeStyle, context));
        AppendAttribute(html, "data-header-first-gradient-color", ResolvePropertyPreview(control.HeaderFirstGradientColor, context));
        AppendAttribute(html, "data-header-middle-gradient-color", ResolvePropertyPreview(control.HeaderMiddleGradientColor, context));
        AppendAttribute(html, "data-header-second-gradient-color", ResolvePropertyPreview(control.HeaderSecondGradientColor, context));
        AppendAttribute(html, "data-header-first-gradient-offset", ResolvePropertyPreview(control.HeaderFirstGradientOffset, context));
        AppendAttribute(html, "data-header-second-gradient-offset", ResolvePropertyPreview(control.HeaderSecondGradientOffset, context));
        AppendAttribute(html, "data-use-header-first-gradient", ResolvePropertyPreview(control.UseHeaderFirstGradient, context));
        AppendAttribute(html, "data-use-header-second-gradient", ResolvePropertyPreview(control.UseHeaderSecondGradient, context));
        html.Append("><div>System diagnostics appearance preview</div>");
        void Sample(string kind, string label, HmiProperty<HmiColor>? background, HmiProperty<HmiColor>? foreground, string? additionalStyle = null)
        {
            var style = new StringBuilder("padding: 2px 4px;");
            AppendColorStyle(style, "background-color", background); AppendColorStyle(style, "color", foreground); style.Append(additionalStyle);
            html.Append("<div data-appearance-sample=\"").Append(kind).Append("\" style=\"").Append(style).Append("\">").Append(label).Append("</div>");
        }
        var grid = new StringBuilder();
        if (control.ShowGridLines is not null && ResolveStaticValue(control.ShowGridLines, context))
        {
            grid.Append("border-bottom: 1px solid currentColor;"); AppendColorStyle(grid, "border-bottom-color", control.GridLineColor);
        }
        Sample("information", "Information area appearance", control.InformationAreaBackgroundColor, control.InformationAreaForegroundColor, grid.ToString());
        Sample("alternate", "Alternate row appearance", control.AlternatingRowBackgroundColor ?? control.InformationAreaBackgroundColor, control.InformationAreaForegroundColor, grid.ToString());
        Sample("error", "Error text appearance", control.ErrorBackgroundColor, control.ErrorForegroundColor);
        Sample("selection", "Selection appearance", control.SelectionBackgroundColor, control.SelectionForegroundColor);
        Sample("focus-frame", "Focus frame color palette", control.InformationAreaFocusColor, null);
        Sample("navigation", "Navigation path text appearance", null, control.NavigationForegroundColor);
        Sample("toolbar", "Toolbar background appearance", control.UseToolbarBackgroundColor is null || ResolveStaticValue(control.UseToolbarBackgroundColor, context) ? control.ToolbarBackgroundColor : null, null);
        var header = new StringBuilder();
        AppendColorStyle(header, "border-color", control.HeaderBorderColor); AppendHeaderBorderWidth(header, control.HeaderBorderWidth);
        if (control.HeaderCornerRadius?.StaticValue is double radius && IsFinite(radius) && radius >= 0) header.Append("border-radius: ").Append(ToCss(radius)).Append("px;");
        AppendColorGradientStyle(header, CreateColorGradient(control.HeaderBackgroundColor, control.HeaderFirstGradientColor, control.HeaderFirstGradientOffset, control.HeaderMiddleGradientColor, control.HeaderSecondGradientColor, control.HeaderSecondGradientOffset, control.UseHeaderFirstGradient, control.UseHeaderSecondGradient, null));
        Sample("header", "Header appearance", control.HeaderBackgroundColor, control.HeaderForegroundColor, header.ToString());
        var button = new StringBuilder();
        AppendColorStyle(button, "background-color", control.ButtonBackgroundColor); AppendColorStyle(button, "border-color", control.ButtonBorderColor); AppendHeaderBorderWidth(button, control.ButtonBorderWidth);
        if (control.ButtonCornerRadius?.StaticValue is int buttonRadius && buttonRadius >= 0) button.Append("border-radius: ").Append(ToCss(buttonRadius)).Append("px;");
        AppendColorGradientStyle(button, CreateColorGradient(control.ButtonBackgroundColor, control.ButtonFirstGradientColor, control.ButtonFirstGradientOffset, control.ButtonMiddleGradientColor, control.ButtonSecondGradientColor, control.ButtonSecondGradientOffset, control.UseButtonFirstGradient, control.UseButtonSecondGradient, null));
        Sample("button", "Button appearance", null, null, button.ToString());
        html.Append("</div>");
    }
}
