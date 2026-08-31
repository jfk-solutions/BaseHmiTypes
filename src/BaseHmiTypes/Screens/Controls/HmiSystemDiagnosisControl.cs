using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiSystemDiagnosisControl : HmiControlWindowBase
{
    public HmiSystemDiagnosisControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSystemDiagnosisControl;
    }

    public HmiSystemDiagnosisViewKind ViewKind { get; set; }

    public HmiProperty<bool>? WrapAround { get; set; }

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public HmiProperty<bool>? ShowColumnHeadings { get; set; }

    public HmiProperty<bool>? ShowHorizontalGridLines { get; set; }

    public HmiProperty<bool>? ShowVerticalGridLines { get; set; }

    public HmiProperty<HmiColor>? GridLineColor { get; set; }

    public HmiProperty<bool>? ShowHorizontalScrollbar { get; set; }

    public HmiProperty<bool>? ShowVerticalScrollbar { get; set; }

    public HmiProperty<bool>? DetailsPaneVisible { get; set; }

    public HmiProperty<bool>? DetailsPaneAllowResize { get; set; }

    public HmiProperty<double>? DetailsPaneHeightPercent { get; set; }

    public HmiProperty<HmiColor>? DetailsPaneBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? DetailsPaneForegroundColor { get; set; }

    public HmiFont? DetailsPaneFont { get; set; }

    public HmiProperty<bool>? ShowToolbar { get; set; }

    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ToolbarForegroundColor { get; set; }

    public HmiFont? ToolbarFont { get; set; }

    public HmiProperty<string>? ToolbarIconSize { get; set; }

    public HmiProperty<bool>? ShowStatusBar { get; set; }

    public HmiProperty<HmiColor>? StatusBarBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? StatusBarForegroundColor { get; set; }

    public HmiFont? StatusBarFont { get; set; }

    public HmiProperty<string>? StatusBarIconSize { get; set; }

    public HmiProperty<bool>? ShowTooltips { get; set; }

    public HmiProperty<bool>? AllowColumnResize { get; set; }

    public HmiProperty<bool>? AllowSortByColumn { get; set; }

    public HmiProperty<bool>? DisplayContextMenu { get; set; }

    public HmiProperty<HmiAlarmRowDoubleClickAction>? RowDoubleClickAction { get; set; }

    public HmiProperty<bool>? DisplayErrorsInDialog { get; set; }

    public HmiProperty<bool>? ShowWaitingMessage { get; set; }

    public HmiProperty<HmiAlarmTimePrecision>? TimestampPrecision { get; set; }

    public IList<HmiSystemDiagnosisColumn> ColumnDefinitions { get; } = new List<HmiSystemDiagnosisColumn>();

    public IList<HmiAlarmToolbarButton> ToolbarButtons { get; } = new List<HmiAlarmToolbarButton>();

    public IList<HmiAlarmStatusBarPanel> StatusBarPanels { get; } = new List<HmiAlarmStatusBarPanel>();
}
