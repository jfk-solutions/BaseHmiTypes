namespace BaseHmiTypes.Screens.Base;

public class HmiFont
{
    public HmiProperty<string>? Name { get; set; }

    public HmiProperty<double>? Size { get; set; }

    public HmiProperty<double>? CharacterWidth { get; set; }

    public HmiProperty<double>? CharacterHeight { get; set; }

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

    public IDictionary<int, HmiFont> LocalizedFonts { get; } = new Dictionary<int, HmiFont>();

    public HmiFont GetForCulture(int? lcid)
    {
        if (lcid is null || !LocalizedFonts.TryGetValue(lcid.Value, out var localized)) return this;
        return new HmiFont
        {
            Name = localized.Name ?? Name,
            Size = localized.Size ?? Size,
            CharacterWidth = localized.CharacterWidth ?? CharacterWidth,
            CharacterHeight = localized.CharacterHeight ?? CharacterHeight,
            EscapementAngle = localized.EscapementAngle ?? EscapementAngle,
            OrientationAngle = localized.OrientationAngle ?? OrientationAngle,
            Weight = localized.Weight ?? Weight,
            Bold = localized.Bold ?? Bold,
            Italic = localized.Italic ?? Italic,
            Underline = localized.Underline ?? Underline,
            Strikethrough = localized.Strikethrough ?? Strikethrough,
            CharacterSet = localized.CharacterSet ?? CharacterSet,
            OutputPrecision = localized.OutputPrecision ?? OutputPrecision,
            ClippingPrecision = localized.ClippingPrecision ?? ClippingPrecision,
            Quality = localized.Quality ?? Quality,
            PitchAndFamily = localized.PitchAndFamily ?? PitchAndFamily
        };
    }
}
