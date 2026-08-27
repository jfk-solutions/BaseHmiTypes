namespace BaseHmiTypes.Screens.Base;

public sealed class HmiTrendPen
{
    /// <summary>
    /// One-based pen number as exposed by the engineering system.
    /// </summary>
    public int Number { get; set; }

    public string? Name { get; set; }

    public HmiProperty<double>? Value { get; set; }

    public HmiProperty<HmiColor>? Color { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<double>? Width { get; set; }

    public HmiProperty<HmiTrendPenType>? Type { get; set; }

    public HmiProperty<HmiLineStyle>? Style { get; set; }

    /// <summary>
    /// Engineering-system marker name or numeric marker identifier.
    /// </summary>
    public HmiProperty<string>? Marker { get; set; }

    public HmiProperty<double>? MinimumValue { get; set; }

    public HmiProperty<double>? MaximumValue { get; set; }

    public HmiProperty<bool>? LinkData { get; set; }

    public string? DataLogModelName { get; set; }
}
