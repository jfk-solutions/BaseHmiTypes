using System.Text;
using System.Net;
using System.Globalization;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Screens.Base;

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
        AppendParameterDefinitionAttributes(html, control);
        AppendParameterBarAttributes(html, control, context);
        AppendParameterHeaderAttributes(html, control, context);
        AppendParameterGridAttributes(html, control, context);
        AppendParameterSelectionAttributes(html, control, context);
        AppendAttribute(html, "data-row-height", ResolvePropertyPreview(control.RowHeight, context));
        AppendAttribute(html, "data-cell-padding-left", ResolvePropertyPreview(control.CellPaddingLeft, context));
        AppendAttribute(html, "data-cell-padding-top", ResolvePropertyPreview(control.CellPaddingTop, context));
        AppendAttribute(html, "data-cell-padding-right", ResolvePropertyPreview(control.CellPaddingRight, context));
        AppendAttribute(html, "data-cell-padding-bottom", ResolvePropertyPreview(control.CellPaddingBottom, context));
        AppendAttribute(html, "data-edit-mode", ResolvePropertyPreview(control.EditMode, context));
        AppendAttribute(html, "data-show-toolbar", ResolvePropertyPreview(control.ShowToolbar, context));
        AppendAttribute(html, "data-show-status-bar", ResolvePropertyPreview(control.ShowStatusBar, context));
        html.Append('>');
        AppendGridColumnTextTrimmingMetadata(html, control.ColumnDefinitions.Select(column => (column.Name ?? column.Key, column.HeaderTextTrimming, column.ContentTextTrimming)), context);
        if (ResolveStaticValue(control.ShowToolbar, context))
        {
            var style = new StringBuilder("flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;");
            AppendParameterBarStyle(style, control.ToolbarPaddingLeft, control.ToolbarPaddingTop, control.ToolbarPaddingRight, control.ToolbarPaddingBottom, context);
            AppendColorStyle(style, "background-color", control.ToolbarBackgroundColor);
            AppendColorStyle(style, "color", control.ToolbarForegroundColor);
            AppendFontStyle(style, control.ToolbarFont?.GetForCulture(context.CultureInfo?.LCID));
            html.Append("<div class=\"hmi-parameter-toolbar\" role=\"toolbar\" style=\"").Append(style).Append('"');
            if (control.ToolbarEnabled is not null) AppendAttribute(html, "aria-disabled", ResolveStaticValue(control.ToolbarEnabled, context) ? "false" : "true");
            html.Append(">Toolbar</div>");
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
        if (!ResolveStaticValue(control.HideDetails, context)) AppendParameterView(html, control, context);
        if (ResolveStaticValue(control.ShowStatusBar, context))
        {
            var style = new StringBuilder("flex: 0 0 auto; padding: 2px 4px; border-top: 1px solid currentColor;");
            AppendParameterBarStyle(style, control.StatusBarPaddingLeft, control.StatusBarPaddingTop, control.StatusBarPaddingRight, control.StatusBarPaddingBottom, context);
            AppendColorStyle(style, "background-color", control.StatusBarBackgroundColor);
            AppendColorStyle(style, "color", control.StatusBarForegroundColor);
            AppendFontStyle(style, control.StatusBarFont?.GetForCulture(context.CultureInfo?.LCID));
            html.Append("<div class=\"hmi-parameter-status-bar\" role=\"status\" style=\"").Append(style).Append('"');
            if (control.StatusBarEnabled is not null) AppendAttribute(html, "aria-disabled", ResolveStaticValue(control.StatusBarEnabled, context) ? "false" : "true");
            html.Append(">Status</div>");
        }
        html.Append("</div>");
    }

    private static void AppendOverviewParameterControl(StringBuilder html, HmiOverviewParameterControl control, HmiHtmlConvertContext context)
    {
        html.Append("<div");
        AppendCommonAttributes(html, control, context, additionalStyle: "display: flex; flex-direction: column; overflow: hidden;");
        AppendAttribute(html, "data-parameter-control-view", "overview");
        AppendAttribute(html, "data-filter", ResolvePropertyPreview(control.Filter, context));
        AppendParameterDefinitionAttributes(html, control);
        AppendParameterBarAttributes(html, control, context);
        AppendParameterHeaderAttributes(html, control, context);
        AppendParameterGridAttributes(html, control, context);
        AppendParameterSelectionAttributes(html, control, context);
        AppendAttribute(html, "data-row-height", ResolvePropertyPreview(control.RowHeight, context));
        AppendAttribute(html, "data-cell-padding-left", ResolvePropertyPreview(control.CellPaddingLeft, context));
        AppendAttribute(html, "data-cell-padding-top", ResolvePropertyPreview(control.CellPaddingTop, context));
        AppendAttribute(html, "data-cell-padding-right", ResolvePropertyPreview(control.CellPaddingRight, context));
        AppendAttribute(html, "data-cell-padding-bottom", ResolvePropertyPreview(control.CellPaddingBottom, context));
        AppendAttribute(html, "data-edit-mode", ResolvePropertyPreview(control.EditMode, context));
        AppendAttribute(html, "data-show-toolbar", ResolvePropertyPreview(control.ShowToolbar, context));
        AppendAttribute(html, "data-show-status-bar", ResolvePropertyPreview(control.ShowStatusBar, context));
        html.Append('>');
        AppendGridColumnTextTrimmingMetadata(html, control.ColumnDefinitions.Select(column => (column.Name ?? column.Key, column.HeaderTextTrimming, column.ContentTextTrimming)), context);
        if (ResolveStaticValue(control.ShowToolbar, context))
        {
            var style = new StringBuilder("flex: 0 0 auto; padding: 2px 4px; border-bottom: 1px solid currentColor;");
            AppendParameterBarStyle(style, control.ToolbarPaddingLeft, control.ToolbarPaddingTop, control.ToolbarPaddingRight, control.ToolbarPaddingBottom, context);
            AppendColorStyle(style, "background-color", control.ToolbarBackgroundColor);
            AppendColorStyle(style, "color", control.ToolbarForegroundColor);
            AppendFontStyle(style, control.ToolbarFont?.GetForCulture(context.CultureInfo?.LCID));
            html.Append("<div class=\"hmi-parameter-toolbar\" role=\"toolbar\" style=\"").Append(style).Append('"');
            if (control.ToolbarEnabled is not null) AppendAttribute(html, "aria-disabled", ResolveStaticValue(control.ToolbarEnabled, context) ? "false" : "true");
            html.Append(">Toolbar</div>");
        }
        if (control.Filter is not null)
            html.Append("<div class=\"hmi-parameter-filter\">Filter: ").Append(WebUtility.HtmlEncode(ResolveStaticValue(control.Filter, context))).Append("</div>");
        AppendParameterView(html, control, context);
        if (ResolveStaticValue(control.ShowStatusBar, context))
        {
            var style = new StringBuilder("flex: 0 0 auto; padding: 2px 4px; border-top: 1px solid currentColor;");
            AppendParameterBarStyle(style, control.StatusBarPaddingLeft, control.StatusBarPaddingTop, control.StatusBarPaddingRight, control.StatusBarPaddingBottom, context);
            AppendColorStyle(style, "background-color", control.StatusBarBackgroundColor);
            AppendColorStyle(style, "color", control.StatusBarForegroundColor);
            AppendFontStyle(style, control.StatusBarFont?.GetForCulture(context.CultureInfo?.LCID));
            html.Append("<div class=\"hmi-parameter-status-bar\" role=\"status\" style=\"").Append(style).Append('"');
            if (control.StatusBarEnabled is not null) AppendAttribute(html, "aria-disabled", ResolveStaticValue(control.StatusBarEnabled, context) ? "false" : "true");
            html.Append(">Status</div>");
        }
        html.Append("</div>");
    }

    private static void AppendParameterView(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        AppendParameterDefinitionPreview(html, control, context);
        var columns = control.ColumnDefinitions.Where(column => column.Visible is null || ResolveStaticValue(column.Visible, context)).ToArray();
        var style = new StringBuilder("flex: 1 1 auto; display: grid; place-items: center; overflow: hidden; border-top-style: solid; border-top-color: currentColor;");
        if (columns.Length > 0) style.Append("display: block; overflow: auto;");
        var width = control.GridLineWidth is null ? 1d : ResolveStaticValue(control.GridLineWidth, context);
        var separatorWidth = IsFinite(width) && width >= 0 ? width : 1d;
        if (control.GridLineVisibility is not null && ResolveStaticValue(control.GridLineVisibility, context) != 2) separatorWidth = 0;
        style.Append("border-top-width: ").Append(ToCss(separatorWidth)).Append("px;");
        AppendParameterScrollStyle(style, "x", control.HorizontalScrollBarVisibility, context);
        AppendParameterScrollStyle(style, "y", control.VerticalScrollBarVisibility, context);
        AppendColorStyle(style, "background-color", control.ContentBackgroundColor);
        AppendColorStyle(style, "color", control.ContentForegroundColor);
        AppendColorStyle(style, "border-top-color", control.GridLineColor);
        html.Append("<div class=\"hmi-parameter-details\" style=\"").Append(style).Append("\">");
        if (columns.Length > 0) AppendParameterColumns(html, control, columns, context);
        else html.Append("Parameter data not loaded");
        AppendParameterHeaderSelectionPreview(html, control, context);
        AppendParameterSelectionPreview(html, control, context);
        html.Append("</div>");
    }

    private static void AppendParameterDefinitionAttributes(StringBuilder html, HmiParameterControlBase control)
    {
        AppendAttribute(html, "data-default-parameter-set-type-reference-key", control.DefaultParameterSetTypeReferenceKey, preserveEmpty: true);
        AppendAttribute(html, "data-default-parameter-set-type-source-id", control.DefaultParameterSetTypeReference?.SourceId);
        AppendAttribute(html, "data-default-parameter-set-type-name", control.DefaultParameterSetTypeReference?.Name, preserveEmpty: true);
        if (control.DefaultParameterSetType is { } definition)
            AppendAttribute(html, "data-default-parameter-set-type-field-count", definition.Parameters.Count.ToString(CultureInfo.InvariantCulture));
    }

    private static void AppendParameterDefinitionPreview(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        if (control.DefaultParameterSetType is not { } definition) return;
        html.Append("<details class=\"hmi-parameter-definition-preview\"><summary>Configured parameter set type: ")
            .Append(WebUtility.HtmlEncode(definition.DisplayName?.GetText(context.CultureInfo) ?? definition.Name)).Append("</summary><table><thead><tr><th>Field</th><th>Data type</th><th>Default value</th></tr></thead><tbody>");
        foreach (var field in definition.Parameters)
            html.Append("<tr><td>").Append(WebUtility.HtmlEncode(field.DisplayName?.GetText(context.CultureInfo) ?? field.Name)).Append("</td><td>")
                .Append(WebUtility.HtmlEncode(field.DataType)).Append("</td><td>").Append(WebUtility.HtmlEncode(field.DefaultValue)).Append("</td></tr>");
        html.Append("</tbody></table></details>");
    }

    private static void AppendParameterBarAttributes(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        AppendAttribute(html, "data-toolbar-enabled", ResolvePropertyPreview(control.ToolbarEnabled, context));
        AppendAttribute(html, "data-toolbar-show-tooltips", ResolvePropertyPreview(control.ToolbarShowToolTips, context));
        AppendAttribute(html, "data-toolbar-padding-left", ResolvePropertyPreview(control.ToolbarPaddingLeft, context));
        AppendAttribute(html, "data-toolbar-padding-top", ResolvePropertyPreview(control.ToolbarPaddingTop, context));
        AppendAttribute(html, "data-toolbar-padding-right", ResolvePropertyPreview(control.ToolbarPaddingRight, context));
        AppendAttribute(html, "data-toolbar-padding-bottom", ResolvePropertyPreview(control.ToolbarPaddingBottom, context));
        AppendAttribute(html, "data-status-bar-enabled", ResolvePropertyPreview(control.StatusBarEnabled, context));
        AppendAttribute(html, "data-status-bar-show-tooltips", ResolvePropertyPreview(control.StatusBarShowToolTips, context));
        AppendAttribute(html, "data-status-bar-padding-left", ResolvePropertyPreview(control.StatusBarPaddingLeft, context));
        AppendAttribute(html, "data-status-bar-padding-top", ResolvePropertyPreview(control.StatusBarPaddingTop, context));
        AppendAttribute(html, "data-status-bar-padding-right", ResolvePropertyPreview(control.StatusBarPaddingRight, context));
        AppendAttribute(html, "data-status-bar-padding-bottom", ResolvePropertyPreview(control.StatusBarPaddingBottom, context));
    }

    private static void AppendParameterBarStyle(StringBuilder style, HmiProperty<double>? left, HmiProperty<double>? top,
        HmiProperty<double>? right, HmiProperty<double>? bottom, HmiHtmlConvertContext context)
    {
        void AppendPadding(string side, HmiProperty<double>? property)
        {
            if (property is null) return;
            var value = ResolveStaticValue(property, context);
            if (IsFinite(value) && value >= 0) style.Append("padding-").Append(side).Append(": ").Append(ToCss(value)).Append("px;");
        }
        AppendPadding("left", left); AppendPadding("top", top); AppendPadding("right", right); AppendPadding("bottom", bottom);
    }

    private static void AppendParameterHeaderAttributes(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        AppendAttribute(html, "data-allow-column-reorder", ResolvePropertyPreview(control.AllowColumnReorder, context));
        AppendAttribute(html, "data-allow-column-resize", ResolvePropertyPreview(control.AllowColumnResize, context));
        AppendAttribute(html, "data-column-header-type", ResolvePropertyPreview(control.ColumnHeaderType, context));
        AppendAttribute(html, "data-row-header-type", ResolvePropertyPreview(control.RowHeaderType, context));
        AppendAttribute(html, "data-header-selection-background-color", ResolvePropertyPreview(control.HeaderSelectionBackgroundColor, context));
        AppendAttribute(html, "data-header-selection-foreground-color", ResolvePropertyPreview(control.HeaderSelectionForegroundColor, context));
    }

    private static void AppendParameterHeaderSelectionPreview(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        if (control.HeaderSelectionBackgroundColor is null && control.HeaderSelectionForegroundColor is null) return;
        var style = new StringBuilder("padding: 2px 4px; box-sizing: border-box;");
        AppendColorStyle(style, "background-color", control.HeaderSelectionBackgroundColor);
        AppendColorStyle(style, "color", control.HeaderSelectionForegroundColor);
        AppendFontStyle(style, control.HeaderFont?.GetForCulture(context.CultureInfo?.LCID));
        html.Append("<div class=\"hmi-parameter-header-selection-preview\" data-preview=\"appearance\" style=\"").Append(style).Append("\">Header selection appearance preview</div>");
    }

    private static void AppendParameterGridAttributes(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        AppendAttribute(html, "data-allow-sort-by-column", ResolvePropertyPreview(control.AllowSortByColumn, context));
        AppendAttribute(html, "data-allow-filter-by-column", ResolvePropertyPreview(control.AllowFilterByColumn, context));
        AppendAttribute(html, "data-grid-line-visibility", ResolvePropertyPreview(control.GridLineVisibility, context));
        AppendAttribute(html, "data-grid-selection-mode", ResolvePropertyPreview(control.GridSelectionMode, context));
        AppendAttribute(html, "data-coloring-mode", ResolvePropertyPreview(control.ColoringMode, context));
        AppendAttribute(html, "data-horizontal-scroll-bar-visibility", ResolvePropertyPreview(control.HorizontalScrollBarVisibility, context));
        AppendAttribute(html, "data-vertical-scroll-bar-visibility", ResolvePropertyPreview(control.VerticalScrollBarVisibility, context));
    }

    private static void AppendParameterScrollStyle(StringBuilder style, string axis, HmiProperty<int>? property, HmiHtmlConvertContext context)
    {
        if (property is null) return;
        var mode = ResolveStaticValue(property, context);
        var overflow = mode == 0 ? "auto" : mode == 1 ? "scroll" : mode == 2 ? "hidden" : null;
        if (overflow is not null) style.Append("overflow-").Append(axis).Append(": ").Append(overflow).Append(';');
    }

    private static void AppendParameterSelectionAttributes(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        AppendAttribute(html, "data-select-full-row", ResolvePropertyPreview(control.SelectFullRow, context));
        AppendAttribute(html, "data-selection-background-color", ResolvePropertyPreview(control.SelectionBackgroundColor, context));
        AppendAttribute(html, "data-selection-foreground-color", ResolvePropertyPreview(control.SelectionForegroundColor, context));
        AppendAttribute(html, "data-selection-border-color", ResolvePropertyPreview(control.SelectionBorderColor, context));
        AppendAttribute(html, "data-selection-border-width", ResolvePropertyPreview(control.SelectionBorderWidth, context));
    }

    private static void AppendParameterSelectionPreview(StringBuilder html, HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        if (control.SelectFullRow is null && control.SelectionBackgroundColor is null && control.SelectionForegroundColor is null &&
            control.SelectionBorderColor is null && control.SelectionBorderWidth is null) return;
        var style = new StringBuilder("padding: 2px 4px; box-sizing: border-box;");
        AppendColorStyle(style, "background-color", control.SelectionBackgroundColor);
        AppendColorStyle(style, "color", control.SelectionForegroundColor);
        AppendColorStyle(style, "border-color", control.SelectionBorderColor);
        AppendFontStyle(style, control.ContentFont?.GetForCulture(context.CultureInfo?.LCID));
        if (control.SelectionBorderWidth is not null)
        {
            var width = ResolveStaticValue(control.SelectionBorderWidth, context);
            if (IsFinite(width) && width >= 0) style.Append("border-style: solid; border-width: ").Append(ToCss(width)).Append("px;");
        }
        html.Append("<div class=\"hmi-parameter-selection-preview\" data-preview=\"appearance\" style=\"").Append(style).Append("\">Selection appearance preview");
        if (control.SelectFullRow is not null) html.Append(ResolveStaticValue(control.SelectFullRow, context) ? " · Entire row" : " · Cell");
        html.Append("</div>");
    }

    private static void AppendParameterColumns(StringBuilder html, HmiParameterControlBase control,
        HmiParameterColumn[] columns, HmiHtmlConvertContext context)
    {
        html.Append("<table class=\"hmi-parameter-table\" style=\"width: 100%; table-layout: fixed; border-collapse: collapse;\"><colgroup>");
        foreach (var column in columns)
            html.Append("<col style=\"").Append(CreateParameterColumnWidthStyle(column, context)).Append("\">");
        var headerStyle = new StringBuilder("padding: 2px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;");
        AppendColorStyle(headerStyle, "background-color", control.HeaderBackgroundColor);
        AppendColorStyle(headerStyle, "color", control.HeaderForegroundColor);
        AppendFontStyle(headerStyle, control.HeaderFont);
        html.Append("</colgroup>");
        var columnHeaderType = control.ColumnHeaderType is null ? (int?)null : ResolveStaticValue(control.ColumnHeaderType, context);
        if (columnHeaderType != 0)
        {
            html.Append("<thead><tr>");
            for (var index = 0; index < columns.Length; index++)
            {
                var column = columns[index];
                var separator = new StringBuilder();
                if (index < columns.Length - 1 && control.HeaderBorderColor is not null)
                {
                    var width = control.GridLineWidth is null ? 1d : ResolveStaticValue(control.GridLineWidth, context);
                    separator.Append("border-right-style: solid;border-right-width: ").Append(ToCss(IsFinite(width) && width >= 0 ? width : 1d)).Append("px;");
                    AppendColorStyle(separator, "border-right-color", control.HeaderBorderColor);
                }
                html.Append("<th scope=\"col\" style=\"").Append(headerStyle).Append(CreateParameterColumnWidthStyle(column, context)).Append(CreateParameterHeaderAlignmentStyle(column, context)).Append(separator).Append(CreateGridHeaderTextTrimmingStyle(column.HeaderTextTrimming)).Append('"');
                AppendAttribute(html, "data-column-name", column.Name);
                AppendAttribute(html, "data-column-key", column.Key);
                AppendAttribute(html, "data-enabled", ResolvePropertyPreview(column.Enabled, context));
                AppendAttribute(html, "data-content-background-color", ResolvePropertyPreview(column.BackgroundColor, context));
                AppendAttribute(html, "data-content-foreground-color", ResolvePropertyPreview(column.ForegroundColor, context));
                AppendAttribute(html, "data-header-horizontal-alignment", ResolvePropertyPreview(column.HeaderHorizontalAlignment, context));
                AppendAttribute(html, "data-header-vertical-alignment", ResolvePropertyPreview(column.HeaderVerticalAlignment, context));
                AppendAttribute(html, "data-header-text-trimming", ResolvePropertyPreview(column.HeaderTextTrimming, context));
                AppendAttribute(html, "data-content-text-trimming", ResolvePropertyPreview(column.ContentTextTrimming, context));
                AppendAttribute(html, "data-width", ResolvePropertyPreview(column.Width, context));
                AppendAttribute(html, "data-minimum-width", ResolvePropertyPreview(column.MinimumWidth, context));
                AppendAttribute(html, "data-maximum-width", ResolvePropertyPreview(column.MaximumWidth, context));
                AppendAttribute(html, "data-allow-sort", ResolvePropertyPreview(column.AllowSort, context));
                AppendAttribute(html, "data-sort-order", ResolvePropertyPreview(column.SortOrder, context));
                AppendAttribute(html, "data-sort-direction", ResolvePropertyPreview(column.SortDirection, context));
                AppendAttribute(html, "data-output-format", ResolvePropertyPreview(column.OutputFormat, context));
                var headingText = columnHeaderType == 1 ? (index + 1).ToString(CultureInfo.InvariantCulture) : column.HeaderText?.GetText(context.CultureInfo) ?? column.Name ?? column.Key ?? "Column";
                html.Append('>');
                AppendGridHeaderText(html, headingText, column.HeaderTextTrimming);
                html.Append("</th>");
            }
            html.Append("</tr></thead>");
        }
        html.Append("<tbody><tr><td colspan=\"").Append(columns.Length.ToString(CultureInfo.InvariantCulture))
            .Append("\" style=\"text-align: center; padding: 2px 4px;").Append(CreateParameterCellLayoutStyle(control, context))
            .Append("\">Parameter data not loaded</td></tr></tbody></table>");
    }

    private static string CreateParameterCellLayoutStyle(HmiParameterControlBase control, HmiHtmlConvertContext context)
    {
        var style = new StringBuilder();
        void AppendDimension(string css, HmiProperty<double>? property)
        {
            if (property is null) return;
            var value = ResolveStaticValue(property, context);
            if (IsFinite(value) && value >= 0) style.Append(css).Append(": ").Append(ToCss(value)).Append("px;");
        }
        if (control.RowHeight is not null && ResolveStaticValue(control.RowHeight, context) == 0)
            style.Append("height: auto;");
        else AppendDimension("height", control.RowHeight);
        AppendFontStyle(style, control.ContentFont);
        AppendDimension("padding-left", control.CellPaddingLeft);
        AppendDimension("padding-top", control.CellPaddingTop);
        AppendDimension("padding-right", control.CellPaddingRight);
        AppendDimension("padding-bottom", control.CellPaddingBottom);
        return style.ToString();
    }

    private static string CreateParameterHeaderAlignmentStyle(HmiParameterColumn column, HmiHtmlConvertContext context)
    {
        var style = new StringBuilder();
        if (column.HeaderHorizontalAlignment is not null)
            style.Append("text-align: ").Append(ToCss(ResolveStaticValue(column.HeaderHorizontalAlignment, context))).Append(';');
        if (column.HeaderVerticalAlignment is not null)
        {
            var alignment = ResolveStaticValue(column.HeaderVerticalAlignment, context);
            if (alignment != HmiVerticalAlignment.Stretch)
                style.Append("vertical-align: ").Append(alignment == HmiVerticalAlignment.Top ? "top" : alignment == HmiVerticalAlignment.Bottom ? "bottom" : "middle").Append(';');
        }
        return style.ToString();
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
