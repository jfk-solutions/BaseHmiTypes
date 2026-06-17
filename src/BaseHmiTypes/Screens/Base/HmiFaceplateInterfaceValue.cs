namespace BaseHmiTypes.Screens.Base;

public class HmiFaceplateInterfaceValue
{
    public string? Name { get; set; }

    public object? Value { get; set; }

    public string? TagName { get; set; }

    public string? TagId { get; set; }

    public bool IsTagBinding => !string.IsNullOrWhiteSpace(TagName) || !string.IsNullOrWhiteSpace(TagId);
}
