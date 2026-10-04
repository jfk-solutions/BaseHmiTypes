using System.Text;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    private static void AppendNcKeyboardControl(StringBuilder html, HmiNcKeyboardControl control, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, control, context, additionalStyle: CreateControlWindowStyle(control, context, "overflow: hidden;"));
        AppendAttribute(html, "data-keyboard-style", ResolvePropertyPreview(control.KeyboardStyle, context));
        AppendAttribute(html, "data-keyboard-background-color", ResolvePropertyPreview(control.KeyboardBackgroundColor, context));
        html.Append(" role=\"region\" aria-label=\"NC keyboard\" data-preview=\"palette\">");
        var style = new StringBuilder("overflow: auto; height: 100%;");
        AppendColorStyle(style, "background-color", control.KeyboardBackgroundColor);
        html.Append("<div class=\"hmi-nc-keyboard-palette\" style=\"").Append(style).Append("\"><div>NC keyboard layout not decoded</div><table><thead><tr><th>Key class</th><th>Normal state</th><th>Pressed state</th></tr></thead><tbody>");
        foreach (var (kind, label, appearance) in new[] { ("normal", "Normal keys", control.NormalKeys), ("special", "Special keys", control.SpecialKeys), ("enter", "Enter key", control.EnterKey) })
        {
            html.Append("<tr data-key-class=\"").Append(kind).Append("\"><th>").Append(label).Append("</th><td>");
            State("normal", appearance.NormalBackgroundColor, appearance.NormalForegroundColor);
            html.Append("</td><td>"); State("pressed", appearance.PressedBackgroundColor, appearance.PressedForegroundColor);
            html.Append("</td></tr>");
        }
        html.Append("</tbody></table></div></div>");

        void State(string state, HmiProperty<HmiColor>? background, HmiProperty<HmiColor>? foreground)
        {
            html.Append("<span class=\"hmi-nc-key-preview\"");
            AppendAttribute(html, "data-key-state", state);
            AppendAttribute(html, "data-background-color", ResolvePropertyPreview(background, context));
            AppendAttribute(html, "data-foreground-color", ResolvePropertyPreview(foreground, context));
            var keyStyle = new StringBuilder("display: inline-block; min-width: 6em; padding: 2px 4px;");
            AppendColorStyle(keyStyle, "background-color", background); AppendColorStyle(keyStyle, "color", foreground);
            html.Append(" style=\"").Append(keyStyle).Append("\">").Append(background is null && foreground is null ? "Not configured" : "Preview").Append("</span>");
        }
    }
}
