namespace BaseHmiTypes.Screens.Base;

public class HmiDynamicSvgProperty
{
    public string? Name { get; set; }

    public HmiProperty<object?>? Value { get; set; }

    public string? DynamicReferenceId { get; set; }

    public string? DynamicReferenceName { get; set; }
}
