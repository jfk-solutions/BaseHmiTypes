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

    /// <summary>Use the color of the lowest enabled threshold strictly above the current value; otherwise retain the foreground color.</summary>
    public HmiProperty<bool>? UseThresholdFillColors { get; set; }

    /// <summary>True places the scale right/below; false places it left/above. Omitted uses right/below.</summary>
    public HmiProperty<bool>? ScaleAfterBar { get; set; }

}

public enum HmiBarFillStyle
{
    Solid,
    Gradient
}
