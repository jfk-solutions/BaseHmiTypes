namespace BaseHmiTypes.Scripts;

public sealed class HmiEventBinding
{
    public string EventName { get; set; } = string.Empty;

    public HmiAction? Action { get; set; }
}

