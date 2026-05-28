using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiAlarmLineControl : HmiSimpleScreenItemBase
{
    public HmiProperty<bool>? SuppressFlashing { get; set; }

    public HmiProperty<int>? AcknowledgmentFlashingRate { get; set; }

    public HmiProperty<int>? ResetFlashingRate { get; set; }

    public HmiProperty<int>? NumberOfRows { get; set; }
}
