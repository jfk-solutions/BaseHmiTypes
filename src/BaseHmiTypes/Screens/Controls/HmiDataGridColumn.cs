using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiDataGridColumn
{
    public string? Name { get; set; }

    public string? DataType { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiMultilingualText? HeaderText { get; set; }

    public HmiProperty<int>? DecimalPlaces { get; set; }

    public HmiProperty<HmiDataGridColumnWidthMode>? WidthMode { get; set; }

    public string? SourceWidthMode { get; set; }

    public HmiProperty<double>? Width { get; set; }

    public HmiProperty<int>? Order { get; set; }

    public HmiProperty<string>? FilterDefinition { get; set; }

    public HmiProperty<HmiDataGridSortDirection>? SortDirection { get; set; }

    public string? SourceSortDirection { get; set; }

    public HmiProperty<int>? SortPriority { get; set; }
}
