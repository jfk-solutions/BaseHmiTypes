using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmConditionPresentation
{
    public HmiAlarmCondition Condition { get; set; }
    public HmiProperty<bool>? Display { get; set; }
    public HmiProperty<bool>? Blink { get; set; }
    public HmiProperty<bool>? UseAlarmColors { get; set; }
    public HmiProperty<HmiColor>? BackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ForegroundColor { get; set; }
}
