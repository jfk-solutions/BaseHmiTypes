namespace BaseHmiTypes.Scripts;

using BaseHmiTypes.Screens.Base;

public sealed class HmiEventBinding
{
    /// <summary>Engineering property path for a property change or quality-code event.</summary>
    public string? PropertyName { get; set; }

    public string EventName { get; set; } = string.Empty;

    /// <summary>Original event representation, including native dispatch and reference IDs.</summary>
    public string? SourceFormat { get; set; }

    public byte[]? SourceData { get; set; }

    public Dictionary<string, string> SourceProperties { get; } = new();

    public HmiAction? Action { get; set; }

    /// <summary>
    /// Gets or sets the optional condition that triggers this event.
    /// </summary>
    public HmiProperty<bool>? Condition { get; set; }

    /// <summary>
    /// Gets or sets the interval used by a repeating event, in seconds.
    /// </summary>
    public double? RepeatIntervalSeconds { get; set; }
}
