namespace BaseHmiTypes.Scripts;

public sealed class HmiEventBinding
{
    public string EventName { get; set; } = string.Empty;

    public HmiAction? Action { get; set; }

    /// <summary>
    /// Gets or sets the interval used by a repeating event, in seconds.
    /// </summary>
    public double? RepeatIntervalSeconds { get; set; }
}
