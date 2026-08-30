using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

/// <summary>
/// A static ruler-style scale with tick marks and optional labels.
/// </summary>
public class HmiScale : HmiScaleWidgetBase
{
    public HmiScale()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiScale;
    }
}
