namespace BaseHmiTypes.Screens.Base;

public sealed class HmiTrendPen
{
    /// <summary>
    /// One-based pen number as exposed by the engineering system.
    /// </summary>
    public int Number { get; set; }

    public string? Name { get; set; }

    public HmiProperty<double>? Value { get; set; }
}
