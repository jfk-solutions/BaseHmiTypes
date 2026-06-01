namespace BaseHmiTypes.Projects;

public class HmiProjectItemDescriptor : IHmiProjectItemDescriptor
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public HmiProjectItemKind Kind { get; set; } = HmiProjectItemKind.Unknown;

    public HmiProjectFolderType FolderType { get; set; } = HmiProjectFolderType.Unknown;

    public string? SourceType { get; set; }
}
