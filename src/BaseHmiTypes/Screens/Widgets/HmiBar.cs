using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiBar : HmiScaleWidgetBase
{
    public HmiBar()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiBar;
    }

    public HmiProperty<HmiBarFillStyle>? FillStyle { get; set; }

    public HmiProperty<HmiFillDirection>? FillDirection { get; set; }

}

public enum HmiBarFillStyle
{
    Solid,
    Gradient
}
