using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiAlarmIndicator : HmiSimpleScreenItemBase
{
    public HmiAlarmIndicator()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiAlarmIndicator;
    }

    public HmiProperty<bool>? IsFlashingRequired { get; set; }

    public HmiProperty<HmiColor>? FlashingColor { get; set; }

    public HmiProperty<bool>? IsForegroundFlashingRequired { get; set; }

    public HmiProperty<HmiColor>? FlashingForegroundColor { get; set; }

    public HmiProperty<int>? FlashingRate { get; set; }

    public HmiProperty<int>? AlarmState { get; set; }

    public HmiProperty<HmiAlarmIndicatorState>? VisualState { get; set; }

    public HmiProperty<bool>? IsGroupRelevant { get; set; }

    public HmiProperty<int>? SignificantMask { get; set; }

    public HmiProperty<int>? EventAcknowledgementMask { get; set; }

    public HmiProperty<bool>? UseGlobalAlarmClasses { get; set; }

    public HmiProperty<bool>? UseGlobalSettings { get; set; }

    public HmiProperty<int>? UserValue1 { get; set; }

    public HmiProperty<int>? UserValue2 { get; set; }

    public HmiProperty<int>? UserValue3 { get; set; }

    public HmiProperty<int>? UserValue4 { get; set; }

    public HmiProperty<int>? NoAlarmState { get; set; }

    public HmiProperty<int>? NumberOfAlarms { get; set; }

    public HmiProperty<string>? Text { get; set; }

    public HmiFont? Font { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? VerticalAlignment { get; set; }

    public HmiProperty<bool>? UseEqualSegmentWidths { get; set; }

    public IList<HmiAlarmIndicatorSegment> Segments { get; } = [];

    public HmiProperty<bool>? IsLocked { get; set; }

    public HmiProperty<string>? LockedText { get; set; }

    public HmiProperty<HmiColor>? LockedForegroundColor { get; set; }

    public HmiProperty<HmiColor>? LockedBackgroundColor { get; set; }

    public HmiProperty<int>? BackFillPattern { get; set; }

    public HmiProperty<HmiFillPattern>? FillPattern { get; set; }

    public HmiProperty<IList<int>>? ShowAcknowledgedAlarmClasses { get; set; }

    public HmiProperty<IList<int>>? ShowPendingAlarmClasses { get; set; }
}
