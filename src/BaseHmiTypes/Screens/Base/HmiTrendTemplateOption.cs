namespace BaseHmiTypes.Screens.Base;

public sealed class HmiTrendTemplateOption
{
    public string? TabName { get; set; }
    public string? OptionName { get; set; }
    public HmiProperty<bool>? Included { get; set; }
}
