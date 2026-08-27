namespace BaseHmiTypes.Projects;

public class HmiProjectInfo
{
    public HmiProjectSoftwareType HmiProjectSoftwareType { get; set; }

    public string? ProjectTitle { get; set; }

    public string? DeviceFamilyString { get; set; }

    public string? ProjectName { get; set; }

    public string? ProjectVersionString { get; set; }

    public string? Author { get; set; }

    public string? EngineeringSoftwareVersionString { get; set; }

    public string? OriginalDateString { get; set; }

    public string? LastModifiedDateString { get; set; }
}
