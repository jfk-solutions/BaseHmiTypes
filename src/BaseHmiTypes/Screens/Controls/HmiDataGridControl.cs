using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiDataGridControl : HmiControlWindowBase
{
    public HmiDataGridControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiDataGridControl;
    }

    public HmiProperty<bool>? ShowExportCsv { get; set; }

    public HmiProperty<bool>? ShowProperties { get; set; }

    public HmiProperty<bool>? ShowStatusBar { get; set; }

    public HmiProperty<bool>? ShowToolbar { get; set; }

    public HmiProperty<string>? ToolbarIconSize { get; set; }

    public HmiProperty<int>? MaximumRows { get; set; }

    public HmiProperty<bool>? UseLocalMachineTimeZone { get; set; }

    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? GridLineColor { get; set; }

    public HmiProperty<bool>? HeaderRowHeightAutomatic { get; set; }

    public HmiProperty<double>? HeaderRowHeight { get; set; }

    public HmiProperty<bool>? RowHeightAutomatic { get; set; }

    public HmiProperty<double>? RowHeight { get; set; }

    public IList<HmiDataGridColumn> ColumnDefinitions { get; } = new List<HmiDataGridColumn>();

    public HmiProperty<bool>? TimePeriodAbsoluteMode { get; set; }

    public HmiProperty<string>? TimePeriodDuration { get; set; }

    public HmiProperty<string>? TimePeriodStart { get; set; }

    public HmiProperty<string>? TimePeriodEnd { get; set; }
}
