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

    /// <summary>
    /// Gets or sets the current minimum value used to scale this pen.
    /// </summary>
    public HmiProperty<double>? CurrentScaleMinimumValue { get; set; }

    /// <summary>
    /// Gets or sets the current maximum value used to scale this pen.
    /// </summary>
    public HmiProperty<double>? CurrentScaleMaximumValue { get; set; }

    /// <summary>
    /// Gets or sets whether the pen's current value is in an error state.
    /// </summary>
    public HmiProperty<bool>? IsInError { get; set; }

    public HmiProperty<bool>? LinkData { get; set; }

    public string? DataLogModelName { get; set; }

    public string? DataSourceName { get; set; }

    public string? DataSourcePath { get; set; }

    public string? DataSourceApplication { get; set; }

    public string? Description { get; set; }

    public string? EngineeringUnit { get; set; }

    public HmiProperty<bool>? LogarithmicScale { get; set; }

    /// <summary>
    /// FactoryTalk pen index used as the lower boundary of a shaded range.
    /// </summary>
    public HmiProperty<int>? LowerBoundPenIndex { get; set; }

    /// <summary>
    /// FactoryTalk pen index used as the upper boundary of a shaded range.
    /// </summary>
    public HmiProperty<int>? UpperBoundPenIndex { get; set; }
}
