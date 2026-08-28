using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

/// <summary>
/// A value-driven arrow that moves along a horizontal or vertical scale.
/// </summary>
public class HmiArrowIndicator : HmiScaleWidgetBase
{
    public HmiArrowIndicator()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiArrowIndicator;
    }
}
