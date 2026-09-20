namespace BaseHmiTypes.Projects;

/// <summary>Engineering identity and configuration of an HMI device.</summary>
public class HmiDeviceInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DeviceType { get; set; }
    public string? StartScreenId { get; set; }
    public string? Author { get; set; }
    public string? Comment { get; set; }
}
