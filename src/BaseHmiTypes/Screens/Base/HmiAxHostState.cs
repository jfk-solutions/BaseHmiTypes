namespace BaseHmiTypes.Screens.Base;

public class HmiAxHostState
{
    public IDictionary<string, object?> Fields { get; } = new Dictionary<string, object?>();

    public int? Type { get; set; }

    public bool? ManualUpdate { get; set; }

    public string? LicenseKey { get; set; }

    public byte[]? Buffer { get; set; }

    public int? Length { get; set; }
}
