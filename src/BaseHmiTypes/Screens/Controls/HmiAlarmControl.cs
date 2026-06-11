using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiAlarmControl : HmiControlWindowBase
{
    public HmiAlarmControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiAlarmControl;
    }

    public HmiProperty<bool>? SuppressFlashing { get; set; }

    public HmiProperty<int>? AcknowledgmentFlashingRate { get; set; }

    public HmiProperty<int>? ResetFlashingRate { get; set; }

    public HmiProperty<int>? NumberOfRows { get; set; }

    public HmiProperty<bool>? ShowAcknowledgeButton { get; set; }

    public HmiProperty<bool>? ShowHelpButton { get; set; }

    public HmiProperty<bool>? ShowPendingAlarms { get; set; }

    public HmiProperty<bool>? ShowAlarmsToAcknowledge { get; set; }

    public HmiProperty<bool>? SortByTimeEnabled { get; set; }

    public HmiProperty<double>? MessageAreaWidth { get; set; }

    public HmiProperty<double>? MessageAreaHeight { get; set; }

    public HmiProperty<IList<int>>? AlarmClasses { get; set; }

    public HmiProperty<IList<int>>? Columns { get; set; }

    public HmiProperty<IList<int>>? ColumnOrder { get; set; }

    public HmiProperty<IList<int>>? ColumnWidth { get; set; }

    public HmiProperty<IList<int>>? MinimumColumnWidth { get; set; }

    public HmiProperty<HmiColor>? TableBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? TableForegroundColor { get; set; }

    public HmiProperty<HmiColor>? TableHeaderBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? TableHeaderForegroundColor { get; set; }

    public HmiProperty<HmiColor>? TableHeaderBorderBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? TableHeaderBorderColor { get; set; }

    public HmiProperty<double>? TableHeaderBorderWidth { get; set; }

    public HmiProperty<int>? TableHeaderBackFillStyle { get; set; }

    public HmiProperty<int>? TableHeaderCornerRadius { get; set; }

    public HmiProperty<HmiLineStyle>? TableHeaderEdgeStyle { get; set; }

    public HmiProperty<HmiColor>? TableHeaderFirstGradientColor { get; set; }

    public HmiProperty<HmiColor>? TableHeaderMiddleGradientColor { get; set; }

    public HmiProperty<HmiColor>? TableHeaderSecondGradientColor { get; set; }

    public HmiProperty<HmiColor>? GridLineColor { get; set; }

    public HmiProperty<HmiColor>? ButtonBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ButtonBorderBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ButtonBorderColor { get; set; }

    public HmiProperty<double>? ButtonBorderWidth { get; set; }

    public HmiProperty<int>? ButtonBackFillStyle { get; set; }

    public HmiProperty<int>? ButtonCornerRadius { get; set; }

    public HmiProperty<HmiLineStyle>? ButtonEdgeStyle { get; set; }

    public HmiProperty<HmiColor>? ButtonFirstGradientColor { get; set; }

    public HmiProperty<double>? ButtonFirstGradientOffset { get; set; }

    public HmiProperty<HmiColor>? ButtonMiddleGradientColor { get; set; }

    public HmiProperty<HmiColor>? ButtonSecondGradientColor { get; set; }

    public HmiProperty<double>? ButtonSecondGradientOffset { get; set; }

    public HmiProperty<IList<byte>>? ButtonPositions { get; set; }
}
