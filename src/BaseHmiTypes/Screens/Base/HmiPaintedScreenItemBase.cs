namespace BaseHmiTypes.Screens.Base;

public abstract class HmiPaintedScreenItemBase : HmiScreenItemBase
{
    public HmiProperty<HmiColor>? ForegroundColor { get; set; }

    public HmiProperty<HmiColor>? AlternateForegroundColor { get; set; }

    public HmiProperty<HmiColor>? BackgroundColor { get; set; }

    public HmiProperty<HmiColor>? AlternateBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? BorderColor { get; set; }

    public HmiProperty<HmiColor>? BorderBackgroundColor { get; set; }

    /// <summary>
    /// Gets or sets whether the background color is also used for the object's border.
    /// </summary>
    public HmiProperty<bool>? BorderUsesBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? AlternateBorderColor { get; set; }

    public HmiProperty<double>? BorderWidth { get; set; }

    public HmiProperty<int>? BorderStyle { get; set; }

    public HmiProperty<bool>? FocusHighlight { get; set; }

    public HmiProperty<bool>? PointerHighlight { get; set; }

    public HmiProperty<bool>? BackgroundBlink { get; set; }

    public HmiFillAnimation? FillAnimation { get; set; }

    public HmiColorAnimation? ColorAnimation { get; set; }

    public HmiThickness? Margin { get; set; }

    public HmiThickness? Padding { get; set; }
}
