namespace BaseHmiTypes.Screens.Base;

public abstract class HmiModelBase : IHmiObject
{
    public string? Id { get; set; }

    public string? Name { get; set; }

    public BaseHmiTypes.Common.HmiMultilingualText? DisplayName { get; set; }
}
