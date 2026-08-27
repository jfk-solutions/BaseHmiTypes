namespace BaseHmiTypes.Screens.Base;

public class HmiFont
{
    public HmiProperty<string>? Name { get; set; }

    public HmiProperty<double>? Size { get; set; }

    public HmiProperty<double>? CharacterWidth { get; set; }

    public HmiProperty<double>? EscapementAngle { get; set; }

    public HmiProperty<double>? OrientationAngle { get; set; }

    public HmiProperty<int>? Weight { get; set; }

    public HmiProperty<bool>? Bold { get; set; }

    public HmiProperty<bool>? Italic { get; set; }

    public HmiProperty<bool>? Underline { get; set; }

    public HmiProperty<bool>? Strikethrough { get; set; }

    public HmiProperty<int>? CharacterSet { get; set; }

    public HmiProperty<int>? OutputPrecision { get; set; }

    public HmiProperty<int>? ClippingPrecision { get; set; }

    public HmiProperty<int>? Quality { get; set; }

    public HmiProperty<int>? PitchAndFamily { get; set; }
}
