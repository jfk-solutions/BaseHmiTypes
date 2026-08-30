using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiAlarmControl : HmiControlWindowBase
{
    public HmiAlarmControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiAlarmControl;
    }

    public HmiProperty<bool>? SuppressFlashing { get; set; }

    public HmiAlarmViewKind ViewKind { get; set; }

    public HmiProperty<int>? AcknowledgmentFlashingRate { get; set; }

    public HmiProperty<int>? ResetFlashingRate { get; set; }

    public HmiProperty<int>? NumberOfRows { get; set; }

    public HmiProperty<bool>? WrapAround { get; set; }

    public HmiProperty<int>? LinesPerAlarm { get; set; }

    public HmiProperty<HmiAlarmSelectedIndicator>? SelectedAlarmIndicator { get; set; }

    public HmiProperty<bool>? WordWrap { get; set; }

    public IList<string> FilteredTriggers { get; } = new List<string>();

    public HmiProperty<bool>? UseAlarmIdentifier { get; set; }

    public HmiProperty<double>? AlarmIdentifier { get; set; }

    public IList<HmiAlarmConditionPresentation> Conditions { get; } = new List<HmiAlarmConditionPresentation>();

    public IList<HmiAlarmColumn> ColumnDefinitions { get; } = new List<HmiAlarmColumn>();

    public HmiProperty<bool>? ShowHeader { get; set; }

    public HmiProperty<bool>? ShowTitle { get; set; }

    public HmiProperty<HmiAlarmListMode>? ListMode { get; set; }

    public HmiMultilingualText? Title { get; set; }

    public HmiMultilingualText? AllAlarmsTitle { get; set; }

    public HmiMultilingualText? ActiveAlarmsTitle { get; set; }

    public HmiMultilingualText? PastAlarmsTitle { get; set; }

    public HmiProperty<bool>? ShowAlarmTime { get; set; }

    public HmiProperty<bool>? ShowAcknowledgmentTime { get; set; }

    public HmiProperty<bool>? ShowAcknowledgeButton { get; set; }

    public HmiProperty<bool>? ShowHelpButton { get; set; }

    public HmiProperty<bool>? ShowToolbar { get; set; }

    public HmiProperty<bool>? ShowDetailsButton { get; set; }

    public HmiProperty<bool>? ShowEnableDisableButtons { get; set; }

    public HmiProperty<bool>? ShowSuppressUnsuppressButtons { get; set; }

    public HmiProperty<bool>? ShowShelveUnshelveButtons { get; set; }

    public HmiProperty<bool>? ShowAreaTree { get; set; }

    public HmiProperty<double>? AreaTreeWidth { get; set; }

    public HmiProperty<string>? RootArea { get; set; }

    public HmiProperty<string>? NameFilter { get; set; }

    public HmiProperty<string>? StatusFilter { get; set; }

    public HmiProperty<bool>? ReadOnlyMode { get; set; }

    public HmiProperty<bool>? DisplayErrorsInDialog { get; set; }

    public HmiProperty<bool>? DisplayMilliseconds { get; set; }

    public HmiProperty<HmiAlarmTimePrecision>? TimePrecision { get; set; }

    public HmiProperty<string>? Context { get; set; }

    public HmiProperty<HmiColor>? ListBackgroundColor { get; set; }

    public HmiProperty<double>? DisabledColumnWidth { get; set; }

    public HmiProperty<double>? NameColumnWidth { get; set; }

    public HmiProperty<double>? PathColumnWidth { get; set; }

    public HmiProperty<double>? ShelvedColumnWidth { get; set; }

    public HmiProperty<double>? SuppressedColumnWidth { get; set; }

    public HmiProperty<bool>? DetailsPaneAllowResize { get; set; }

    public HmiProperty<HmiColor>? DetailsPaneBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? DetailsPaneForegroundColor { get; set; }

    public HmiFont? DetailsPaneFont { get; set; }

    public HmiProperty<double>? DetailsPaneHeight { get; set; }

    public HmiProperty<bool>? DetailsPaneVisible { get; set; }

    public HmiProperty<bool>? DisplayEventContextMenu { get; set; }

    public HmiProperty<string>? DefaultFilter { get; set; }

    public HmiProperty<string>? FilterDefinition { get; set; }

    public HmiProperty<string>? FilterName { get; set; }

    public HmiProperty<HmiColor>? GridBackgroundColor { get; set; }

    public HmiProperty<bool>? ShowHorizontalGridLines { get; set; }

    public HmiProperty<bool>? ShowVerticalGridLines { get; set; }

    public HmiProperty<bool>? ShowHorizontalScrollbar { get; set; }

    public HmiProperty<bool>? ShowVerticalScrollbar { get; set; }

    public HmiProperty<bool>? ShowOutOfServiceAlarms { get; set; }

    public HmiProperty<string>? SortOrder { get; set; }

    public HmiProperty<bool>? ShowStatusBar { get; set; }

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

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public HmiProperty<bool>? UseAlarmColors { get; set; }

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

    public HmiProperty<HmiBorderStyle>? ButtonBorderStyle { get; set; }

    public HmiProperty<double>? ButtonWidth { get; set; }

    public HmiProperty<int>? ButtonBackFillStyle { get; set; }

    public HmiProperty<int>? ButtonCornerRadius { get; set; }

    public HmiProperty<HmiLineStyle>? ButtonEdgeStyle { get; set; }

    public HmiProperty<HmiColor>? ButtonFirstGradientColor { get; set; }

    public HmiProperty<double>? ButtonFirstGradientOffset { get; set; }

    public HmiProperty<HmiColor>? ButtonMiddleGradientColor { get; set; }

    public HmiProperty<HmiColor>? ButtonSecondGradientColor { get; set; }

    public HmiProperty<double>? ButtonSecondGradientOffset { get; set; }

    public HmiProperty<IList<byte>>? ButtonPositions { get; set; }

    public HmiProperty<double>? ListBorderWidth { get; set; }

    public HmiProperty<HmiBorderStyle>? ListBorderStyle { get; set; }
}
