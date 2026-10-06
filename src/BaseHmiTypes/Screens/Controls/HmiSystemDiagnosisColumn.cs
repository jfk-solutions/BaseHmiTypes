using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiSystemDiagnosisColumn
{
    public HmiSystemDiagnosisColumnType Type { get; set; }

    public string? SourceType { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<double>? Width { get; set; }

    public HmiMultilingualText? HeaderText { get; set; }
    public HmiProperty<int>? HeaderTextTrimming { get; set; }
    public HmiProperty<int>? ContentTextTrimming { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? Alignment { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HeaderHorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? HeaderVerticalAlignment { get; set; }

    public string? Format { get; set; }

    public HmiProperty<int>? Order { get; set; }

    public HmiProperty<bool>? AllowSort { get; set; }

    public HmiProperty<int>? SortOrder { get; set; }

    public HmiProperty<int>? SortDirection { get; set; }
}
